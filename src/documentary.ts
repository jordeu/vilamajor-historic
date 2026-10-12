import type {MapLayer} from './scene';
import {tourShots,tourDuration,tourFrame,tourTimeForYear,chapterTime,tourFinaleStart,tourPhotoOpacity,tourCameraPose,type TourCameraPose} from './tour';
interface Scene {flyTo(e:number,n:number,span:number,angle:number,fitViewport?:boolean,elevation?:number):void;cinematic(active:boolean,drift?:boolean):void;tourCamera(pose:TourCameraPose,transition?:boolean,immediate?:boolean):void;setHistoricalVolumes(active:boolean):void;setReconstruction(active:boolean):void;setLayer(layer:MapLayer):Promise<void>;setPhotoOpacity(value:number):void;photoStatus():{ready:boolean;year:number|null;error:string|null};labels(show:boolean):void;}
interface Options {scene:()=>Scene|undefined;year:()=>number;setYear:(year:number,animated?:boolean)=>void;}
export function createDocumentary(options:Options){
  const get=<T extends HTMLElement>(id:string)=>document.getElementById(id) as T;
  const stage=get('map-stage'),overlay=get('tour-overlay'),chapter=get<HTMLSelectElement>('film-chapter'),seek=get<HTMLInputElement>('film-seek');
  chapter.innerHTML=tourShots.map((shot,i)=>`<option value="${i}">${String(i+1).padStart(2,'0')} · ${shot.title}</option>`).join('');seek.max=String(tourDuration);
  let cursor=0,last=0,frame=0,active=false,lastShot=-1,lastYear:number|null=null,fullscreen=false;
  let previousLayer:MapLayer='photo';
  let documentaryLayer:MapLayer='terrain',waitingForPhoto=false;
  function setMapLayer(layer:MapLayer){
    documentaryLayer=layer;
    void options.scene()?.setLayer(layer).then(()=>{if(fullscreen&&layer==='photo'&&documentaryLayer===layer)paint();});
    document.querySelectorAll<HTMLElement>('[data-layer]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.layer===layer)));
  }
  const elapsed=(time:number)=>`${Math.floor(time/60)}:${String(Math.floor(time%60)).padStart(2,'0')}`;
  function paint(reframe=false){
    const current=tourFrame(cursor),finale=cursor>=tourFinaleStart;
    options.scene()?.setPhotoOpacity(finale?tourPhotoOpacity(cursor):0);
    lastYear=current.year;options.setYear(current.year,active);
    const layer=finale?'photo':'terrain';if(documentaryLayer!==layer)setMapLayer(layer);
    const photo=options.scene()?.photoStatus();waitingForPhoto=finale&&!!photo&&!photo.ready&&!photo.error;
    stage.dataset.waitingForPhoto=String(waitingForPhoto);
    const changed=reframe||current.index!==lastShot;
    if(current.shot.approach){
      options.scene()?.tourCamera(tourCameraPose(current.shot,current.progress,matchMedia('(prefers-reduced-motion: reduce)').matches),changed&&active,!active);
    }
    if(changed){lastShot=current.index;options.scene()?.cinematic(active,!current.shot.approach);if(!current.shot.approach)options.scene()?.flyTo(...current.shot.center,current.shot.span,current.shot.angle,finale,current.shot.elevation);get('film-place').textContent=current.shot.place;chapter.value=String(current.index);get('view-title').textContent=current.shot.place;}
    get('film-year').textContent=String(Math.floor(current.year));get('film-caption').textContent=current.caption;
    get('film-evidence').textContent=finale
      ?photo?.error?'Ortofotografia no disponible · Es manté el relleu':waitingForPhoto?'Carregant l’ortofotografia actual…':`Ortofotografia ${photo?.year??''} · ICGC · Alçades estimades`
      :current.shot.evidence??(current.year<1850?'Entorn recreat · Decoració imaginada':'Empremtes actuals · Dates cadastrals · Alçades estimades');
    seek.value=String(cursor);seek.setAttribute('aria-valuetext',`${elapsed(cursor)} de ${elapsed(tourDuration)} · ${Math.floor(current.year)}`);
    get('film-time').textContent=`${elapsed(cursor)} / ${elapsed(tourDuration)}`;stage.dataset.chapter=String(current.index);stage.dataset.filmYear=current.year.toFixed(2);
  }
  function state(){get('film-play').textContent=active?'Pausa':'Reprendre';get('film-play').setAttribute('aria-label',active?'Pausar documental':'Reprendre documental');stage.dataset.playing=String(active);}
  function pause(){active=false;cancelAnimationFrame(frame);frame=0;last=0;options.scene()?.cinematic(false);state();if(!fullscreen)overlay.hidden=true;}
  function tick(now:number){
    frame=0;if(!active)return;
    if(last&&!waitingForPhoto){
      const next=Math.min(tourDuration,cursor+Math.min((now-last)/1000,.3)*Number(get<HTMLSelectElement>('film-speed').value));
      // Start at zero opacity and wait for the textures before advancing the reveal.
      cursor=cursor<tourFinaleStart&&next>=tourFinaleStart?tourFinaleStart:next;
    }
    last=now;paint();
    if(cursor>=tourDuration){pause();get('film-play').textContent='Tornar a començar';return;}frame=requestAnimationFrame(tick);
  }
  function play(){
    if(!options.scene())return;
    if(cursor>=tourDuration){cursor=0;lastShot=-1;}
    if(lastYear===null||Math.abs(options.year()-lastYear)>1){cursor=tourTimeForYear(options.year()>=2026?872:options.year());lastShot=-1;}
    active=true;last=0;overlay.hidden=false;
    options.scene()!.setHistoricalVolumes(true);options.scene()!.setReconstruction(true);
    get<HTMLInputElement>('volumes-toggle').checked=get<HTMLInputElement>('reconstruction-toggle').checked=true;
    paint();options.scene()?.cinematic(true,!tourFrame(cursor).shot.approach);state();frame=requestAnimationFrame(tick);
  }
  function toggle(){active?pause():play();}
  function jump(time:number){cursor=Math.max(0,Math.min(tourDuration,time));paint(true);overlay.hidden=false;}
  get('film-play').onclick=toggle;
  get('film-previous').onclick=()=>jump(chapterTime(Math.max(0,tourFrame(cursor).index-1)));
  get('film-next').onclick=()=>jump(chapterTime(Math.min(tourShots.length-1,tourFrame(cursor).index+1)));
  chapter.onchange=()=>jump(chapterTime(Number(chapter.value)));
  seek.oninput=()=>jump(Number(seek.value));
  get('film-subtitles').onclick=()=>{const button=get('film-subtitles'),show=button.getAttribute('aria-pressed')!=='true';button.setAttribute('aria-pressed',String(show));get('film-caption').hidden=!show;};
  let priorFocus:HTMLElement|null=null;
  function isolate(active:boolean){document.querySelectorAll<HTMLElement>('.app-header,.timeline').forEach(element=>element.inert=active);if(active){stage.setAttribute('role','dialog');stage.setAttribute('aria-modal','true');stage.setAttribute('aria-label','Viatge guiat per Vilamajor');}else{stage.removeAttribute('role');stage.removeAttribute('aria-modal');stage.setAttribute('aria-label','Exploració territorial');}}
  function restore(){
    fullscreen=false;isolate(false);stage.classList.remove('documentary');document.body.classList.remove('watching');pause();options.scene()?.setPhotoOpacity(1);setMapLayer(previousLayer);waitingForPhoto=false;
    get('play').setAttribute('aria-expanded','false');get('film-controls').hidden=true;options.scene()?.labels(get('labels').getAttribute('aria-pressed')==='true');priorFocus?.focus({preventScroll:true});
  }
  async function exit(){if(document.fullscreenElement===stage)await document.exitFullscreen().catch(()=>{});if(fullscreen)restore();}
  async function enter(){
    if(!options.scene()||fullscreen)return;
    previousLayer=(document.querySelector<HTMLElement>('[data-layer][aria-pressed="true"]')?.dataset.layer as MapLayer|undefined)??'photo';
    options.scene()?.setPhotoOpacity(0);setMapLayer('terrain');
    priorFocus=document.activeElement as HTMLElement;fullscreen=true;isolate(true);stage.classList.add('documentary');document.body.classList.add('watching');
    get('play').setAttribute('aria-expanded','true');get('film-controls').hidden=false;get('layers-panel').hidden=true;get('building-detail').hidden=true;
    options.scene()?.labels(false);overlay.hidden=false;
    // CSS fills the viewport on platforms that don't expose element fullscreen.
    // Keep an existing viewer fullscreen session; the documentary expands inside it.
    if(!document.fullscreenElement?.contains(stage)&&stage.requestFullscreen)await stage.requestFullscreen().catch(()=>{});
    if(!fullscreen)return;
    if(!active)play();get('film-exit').focus({preventScroll:true});
  }
  get('film-exit').onclick=()=>void exit();
  document.addEventListener('fullscreenchange',()=>{if(fullscreen&&!document.fullscreenElement)restore();});
  document.addEventListener('keydown',event=>{
    if(!fullscreen)return;
    if(event.key==='Escape'){event.preventDefault();void exit();}
    if(event.key===' '&&!(event.target instanceof HTMLInputElement)&&!(event.target instanceof HTMLSelectElement)&&!(event.target instanceof HTMLButtonElement)){event.preventDefault();toggle();}
    if(event.key==='Tab'){
      const buttons=Array.from(stage.querySelectorAll<HTMLElement>('button:not([disabled]),select,input,a[href],canvas[tabindex]')).filter(e=>e.getClientRects().length>0);
      const first=buttons[0],end=buttons.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();end?.focus();}else if(!event.shiftKey&&document.activeElement===end){event.preventDefault();first?.focus();}
    }
  });
  return {pause,enter};
}

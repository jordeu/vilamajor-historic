import './style.css';
import {interfaceTemplate} from './interface';
import {icon} from './icons';
import {createPanels} from './panels';
import {events,eventAt,sources} from './history';
import type {createScene,SceneState,BuildingSelection,MapLayer} from './scene';
import {evidenceLabels,presentAt,type Landmark} from './heritage-data';
import type {Manifest} from './geo';
import {neighborhoods} from './tour';
import {createDocumentary} from './documentary';
import {createViewerFullscreen} from './viewer-fullscreen';

const app=document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML=interfaceTemplate;
const el=<T extends HTMLElement>(id:string)=>document.getElementById(id) as T;
let scene:Awaited<ReturnType<typeof createScene>>|undefined;
let manifest:Manifest|undefined;
let year=2026;
let openPanel='';
const panels=createPanels();
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
reducedMotion.addEventListener('change',()=>{el<HTMLButtonElement>('orbit').disabled=!scene||reducedMotion.matches;if(reducedMotion.matches)stopOrbit();});
function setYear(value:number,animated=false){
  const previous=Math.floor(year);year=Math.max(872,Math.min(2026,value));scene?.setYear(year,animated);
  if(animated&&previous===Math.floor(year))return;
  const displayYear=Math.floor(year);
  const e=eventAt(year),i=events.indexOf(e);
  el<HTMLInputElement>('time').value=String(displayYear);el<HTMLInputElement>('year-input').value=String(displayYear);
  el('year-display').textContent=String(displayYear);
  el('current-event').textContent=e.title;el('time').setAttribute('aria-valuetext',`${displayYear} · ${e.title}`);el('time').style.setProperty('--progress',`${(year-872)/1154*100}%`);
  el('year-jump').setAttribute('aria-label',`Canviar l’any, ara ${displayYear}`);
  document.querySelectorAll<HTMLElement>('[data-event]').forEach(b=>{if(Number(b.dataset.event)===e.year)b.setAttribute('aria-current','true');else b.removeAttribute('aria-current');});
  el('event-date').textContent=e.date;el('event-title').textContent=e.title;el('event-text').textContent=e.text;
  el<HTMLAnchorElement>('event-source').href=sources[e.source].url;
  el('event-count').textContent=`${i+1} / ${events.length} fites`;
  el<HTMLButtonElement>('previous').disabled=displayYear<=872;el<HTMLButtonElement>('next').disabled=displayYear>=2026;
  panels.closeIf('building-detail');
  el('evidence-note').textContent=year<1850?'Entorn recreat amb decoració imaginada. Patrimoni amb fonts.':year<2004?'Creixement segons el Cadastre sobre un paisatge recreat.':'Fotografia en color datada i edificis amb alçades estimades.';
  document.body.dataset.epoch=year<1850?'historic':'modern';
}
function stop(){film.pause();}
const film=createDocumentary({scene:()=>scene,year:()=>year,setYear});
createViewerFullscreen(app,el<HTMLButtonElement>('viewer-fullscreen'));
el('time').addEventListener('input',e=>{stop();setYear(Number((e.target as HTMLInputElement).value));});
el('year-form').addEventListener('submit',e=>{e.preventDefault();const input=el<HTMLInputElement>('year-input');if(!input.reportValidity())return;stop();setYear(Number(input.value));panels.close();});
for(const [button,panel]of [['year-jump','year-panel'],['story-toggle','story-panel'],['places-button','places-panel'],['help-button','help-panel'],['layers-button','layers-panel']])el(button).onclick=()=>{panels.toggle(panel,el(button));if(panel==='year-panel')el<HTMLInputElement>('year-input').select();};
const normalize=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('ca');
el('place-search').addEventListener('input',()=>{const query=normalize(el<HTMLInputElement>('place-search').value.trim());let count=0;document.querySelectorAll<HTMLButtonElement>('[data-place-name]').forEach(button=>{button.hidden=!normalize(button.dataset.placeName!).includes(query);if(!button.hidden)count++;});el('place-empty').hidden=count>0;});
function focusMap(){panels.close(false);el('scene').querySelector<HTMLCanvasElement>('canvas')?.focus({preventScroll:true});}
function goToPlace(place:'pere'|'antoni'){stop();stopOrbit();scene?.focus(place);el('view-title').textContent=place==='pere'?'Sant Pere de Vilamajor':'Sant Antoni de Vilamajor';focusMap();}

document.querySelectorAll<HTMLButtonElement>('[data-year]').forEach(b=>b.onclick=()=>{stop();setYear(Number(b.dataset.year));});
el('previous').onclick=()=>{stop();setYear(Math.floor(year)-1);};
el('next').onclick=()=>{stop();setYear(Math.floor(year)+1);};
function exploreEvent(){
  stopOrbit();focusMap();const event=eventAt(year);
  const id=event.place==='antoni'?(year>=1949?'antoni':''):year<1050?'orila':year<1558?'romanica':year<1610?'obres-pere':'pere';
  if(id){scene?.focusHeritage(id);el('view-title').textContent=scene?.heritage.landmarks.find(l=>l.id===id)?.name??'Vilamajor';}
  else{scene?.flyTo(450150,4613710,310);el('view-title').textContent='La Vilanova · Sant Antoni';}
}
function stopOrbit(){scene?.orbit(false);el('orbit').setAttribute('aria-pressed','false');}
el('play').onclick=()=>{stopOrbit();panels.close(false);void film.enter();};
document.addEventListener('visibilitychange',()=>{if(document.hidden){stop();stopOrbit();}});
el('explore-event').onclick=()=>{stop();exploreEvent();};
el('landmark-focus').onclick=()=>{stop();const model=scene?.heritage.landmarks.find(l=>l.id==='torre');if(model)visitHeritage(model);};
el('orbit').onclick=()=>{stop();const active=scene?.orbit(el('orbit').getAttribute('aria-pressed')!=='true')??false;el('orbit').setAttribute('aria-pressed',String(active));};
el('reset').onclick=()=>{stop();stopOrbit();focusMap();scene?.reset();el('view-title').textContent='Els dos nuclis';};el('overview').onclick=()=>{stop();stopOrbit();focusMap();scene?.overview();el('view-title').textContent='Del Vallès al Montseny';};
el('zoom-in').onclick=()=>{stop();scene?.zoom(.8);};el('zoom-out').onclick=()=>{stop();scene?.zoom(1.25);};
el('focus-pere').onclick=()=>goToPlace('pere');el('focus-antoni').onclick=()=>goToPlace('antoni');
document.querySelectorAll<HTMLButtonElement>('[data-neighborhood]').forEach(button=>button.onclick=()=>{const area=neighborhoods.find(p=>p.id===button.dataset.neighborhood)!;stop();stopOrbit();scene?.flyTo(...area.center,area.span);el('view-title').textContent=area.name;focusMap();});
  for(const mode of ['move','rotate'] as const)el(`${mode}-mode`).onclick=()=>{stop();scene?.navigation(mode==='move'?'move':'orbit');el('move-mode').setAttribute('aria-pressed',String(mode==='move'));el('rotate-mode').setAttribute('aria-pressed',String(mode==='rotate'));};
el('labels').onclick=()=>{const show=el('labels').getAttribute('aria-pressed')!=='true';el('labels').setAttribute('aria-pressed',String(show));scene?.labels(show);el('labels').querySelector('.toggle-status')!.textContent=show?'Visibles':'Ocults';};
document.querySelectorAll<HTMLButtonElement>('[data-layer]').forEach(button=>button.onclick=()=>{
  document.querySelectorAll<HTMLButtonElement>('[data-layer]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  scene?.setLayer(button.dataset.layer as MapLayer);
});

el<HTMLInputElement>('boundaries-toggle').onchange=e=>scene?.setBoundaries((e.target as HTMLInputElement).checked);
el<HTMLInputElement>('parcels-toggle').onchange=e=>{el('map-status').textContent='Carregant parcel·les cadastrals…';void scene?.setParcels((e.target as HTMLInputElement).checked);};
el<HTMLInputElement>('volumes-toggle').onchange=e=>scene?.setHistoricalVolumes((e.target as HTMLInputElement).checked);
el<HTMLInputElement>('reconstruction-toggle').onchange=e=>scene?.setReconstruction((e.target as HTMLInputElement).checked);
el<HTMLInputElement>('vegetation-toggle').onchange=e=>scene?.setVegetation((e.target as HTMLInputElement).checked);
el<HTMLInputElement>('light-toggle').onchange=e=>scene?.setLight((e.target as HTMLInputElement).checked);
function sceneState(state:SceneState){
  el('map-status').textContent=state.message;el('map-status').title=state.message;
  el('map-status').dataset.photoYear=state.photoYear?.toString()??'';
  el('map-status').dataset.landmarks=state.landmarksVisible.toString();
  el('map-status').dataset.buildings=state.buildingsVisible.toString();
  el('map-status').dataset.ready=String(state.ready);
  if(state.ready)el('loading').hidden=true;
  el<HTMLInputElement>('parcels-toggle').checked=state.parcels;
  if(state.error)el('map-status').textContent=state.error;
}
const escapeHTML=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
function selectBuilding(part:BuildingSelection|null){
  const detail=el('building-detail');if(!part){panels.closeIf('building-detail');return;}
  detail.innerHTML=`<button id="close-building" class="icon-button panel-close" data-close-panel aria-label="Tancar informació de l’edifici">${icon('close')}</button><h2>Edifici cadastral</h2><p>${part.municipality==='pere'?'Sant Pere':'Sant Antoni'} de Vilamajor</p><dl><dt>Referència</dt><dd>${escapeHTML(part.buildingId)}</dd><dt>Any declarat</dt><dd>${part.year??'No consta'}</dd><dt>Plantes declarades</dt><dd>${part.floors??'No consta'}</dd><dt>Plantes representades</dt><dd>${part.renderedFloors}</dd><dt>Alçada estimada</dt><dd>${part.estimatedHeight} m${part.floors===null?' (volum orientatiu)':''}</dd></dl><p class="detail-note">Empremta actual. L’alçada és una estimació de 2,8 m per planta, amb un màxim visual de quatre plantes; la data cadastral no verifica la forma històrica. Les finestres són un detall tipològic, no un aixecament de façana.</p><a href="https://www1.sedecatastro.gob.es/CYCBienInmueble/OVCListaBienes.aspx?rc1=${encodeURIComponent(part.buildingId.slice(0,7))}&rc2=${encodeURIComponent(part.buildingId.slice(7))}" target="_blank" rel="noopener noreferrer">Consultar al Cadastre ${icon('external')}</a>`;
  panels.open('building-detail',el('scene').querySelector('canvas'));
}
function visitHeritage(model:Landmark){
  stop();stopOrbit();if(!presentAt(model,year))setYear(model.from);
  el<HTMLInputElement>('reconstruction-toggle').checked=true;scene?.setReconstruction(true);
  scene?.focusHeritage(model.id);el('view-title').textContent=model.name;selectHeritage(model);
}
function selectHeritage(model:Landmark){
  const detail=el('building-detail');
  const phase=model.phases?.filter(p=>p.from<=year).at(-1);
  detail.innerHTML=`<button id="close-building" class="icon-button panel-close" data-close-panel aria-label="Tancar informació del monument">${icon('close')}</button><h2>${escapeHTML(model.name)}</h2><p class="heritage-date">${escapeHTML(model.date)}</p><p class="evidence-badge" data-evidence="${model.confidence}">${evidenceLabels[model.confidence]}</p><p>${escapeHTML(model.description)}</p>${model.phases?`<section class="heritage-phases" aria-label="Èpoques de l’edifici"><h3>La casa al llarg del temps</h3><div class="heritage-phase-buttons">${model.phases.map(p=>`<button data-heritage-year="${p.from}" aria-pressed="${p===phase}"><span>${p.from}</span>${escapeHTML(p.label)}</button>`).join('')}</div><p class="detail-note">${escapeHTML(phase?.description??'')}</p></section>`:''}<details><summary>Què sabem i què interpretem?</summary><p>${escapeHTML(model.limitations)}</p><p>Posició ETRS89 / UTM 31N: ${model.position.map(p=>Math.round(p)).join(', ')}.</p></details><div class="heritage-sources">${model.sources.map(s=>`<a href="${s.url}" target="_blank" rel="noopener noreferrer">${escapeHTML(s.title)} ${icon('external')}</a>`).join('')}</div>`;
  panels.open('building-detail',el('scene').querySelector('canvas'));
  detail.querySelectorAll<HTMLButtonElement>('[data-heritage-year]').forEach(button=>button.onclick=()=>{const target=button.dataset.heritageYear!;setYear(Number(target));visitHeritage(model);detail.querySelector<HTMLButtonElement>(`[data-heritage-year="${target}"]`)?.focus();});
}
function drawer(panel:string){
  if(panels.active==='drawer'&&openPanel===panel){panels.close();return;}openPanel=panel;
  el('drawer').innerHTML=`<button class="close icon-button panel-close" data-close-panel aria-label="Tancar panell">${icon('close')}</button>`+(panel==='heritage'?`<h2>Habitar el temps</h2><p>Acosta’t als monuments i les cases històriques. Cada model explica les fonts i les parts que s’han hagut d’interpretar.</p><ol class="heritage-list">${scene?scene.heritage.landmarks.map(l=>`<li><button data-heritage="${l.id}"><span>${escapeHTML(l.date)}</span><strong>${escapeHTML(l.name)}</strong><small>${evidenceLabels[l.confidence]}${!presentAt(l,year)?' · Viatja a '+l.from:''}</small></button></li>`).join(''):'<li>Els models s’estan carregant. Torna a obrir aquest panell en uns instants.</li>'}</ol>`:panel==='history'?`<h2>Els camins de Vilamajor</h2><p>Tria una fita per viatjar en el temps.</p><ol>${events.map(e=>`<li><button data-event="${e.year}"><span>${e.date}</span>${e.title}</button></li>`).join('')}</ol>`:`
<h2>Fonts i dades</h2><p>Geografia actual mesurada i història documentada.</p>
<h3>Relleu i fotografies</h3><p>Elevacions numèriques de l’ICGC en ETRS89 / UTM 31N. Mostreig de 5 m als dos nuclis i 20 m al territori ampli. El model regional prové de la cobertura de 15 m; el central, de la de 5 m. No s’exagera l’escala vertical.</p><p>Ortofotos ICGC: ${manifest?manifest.orthophotos.filter(p=>p.year>=2004).map(p=>p.year).join(', '):'carregant…'}. Només es fan servir les fotografies en color. Es mostra l’última fotografia en color anterior a l’any escollit; els vols de 1956 i 1986 en blanc i negre s’han retirat del visor. Als dos nuclis, els retalls de detall arriben a 25 cm/píxel el 2025 i 50 cm/píxel en els vols històrics. La fotografia no descriu cadascun dels anys intermedis. Abans de la primera foto es mostra una interpretació rural sobre el relleu actual: els camps, les cases de context i la distribució del bosc no són una restitució arqueològica.</p>
<h3>Models patrimonials</h3><p>${scene?.heritage.landmarks.length??18} models, cinc variants de la Torre Roja i dues etapes de Can Bertran i etapes dels tres masos Can Gol, Can Derrocada i Can Llinars, a partir del pla director SPAL, les fitxes de la Diputació, les descripcions municipals i fotografies d’Arquitectura Modernista i Pobles de Catalunya. Les fitxes de Patrimoni identifiquen la precisió de cada reconstrucció. Les dates són llindars de visualització quan la construcció es data en un interval.</p><p>El temple anterior al romànic, l’església romànica i les obres de 1558–1610 són hipòtesis explícites. El palau comtal no es reconstrueix: l’estudi SPAL en qüestiona l’emplaçament tradicional a la Força. Tampoc es trasllada el temple medieval de Santa Susanna a l’emplaçament de 1683.</p><h3>Bosc i poblament antic</h3><p>20.000 mostres cromàtiques de l’ortofoto 2025 situen les capçades en zones de vegetació i exclouen edificis. No són un cens d’arbres; alçades i formes són aproximades. En les èpoques antigues el bosc és interpretatiu. Les cases de context evoquen la sagrera i la Vilanova: ni les posicions ni cada casa concreta estan documentades. Les 46 cases de 1697 es representen esquemàticament. Camps, horts, camins, mercat, pous, carros, persones i bestiar són decoració inventada per ambientar les èpoques: no són elements documentats.</p><h3>Edificis i Cadastre</h3><p>${manifest?new Intl.NumberFormat('ca').format(manifest.counts.buildings):'—'} edificis i ${manifest?new Intl.NumberFormat('ca').format(manifest.counts.parcels):'—'} parcel·les dels dos municipis. Geometria DGC INSPIRE publicada el ${manifest?.cadastreDate??'—'}. Les alçades es calculen amb 2,8 m per planta, limitant la representació a quatre plantes segons la tipologia local; les plantes originals del Cadastre es conserven a la fitxa; les cobertes són planes i no reprodueixen els pendents reals. Les finestres de les façanes cadastrals són un detall tipològic, no mesurat.</p><p>Des de 1850, el control «Edificis al llarg del temps» mostra per defecte les empremtes actuals segons les dates declarades. Durant el viatge els volums creixen gradualment. Aquesta animació no representa la durada real de les obres, ni restitueix les reformes i els enderrocs. Els edificis sense data només apareixen a la vista actual.</p>
<h3>Vols sobre les urbanitzacions</h3><p>El documental recorre Sant Julià d’Alfou, les Faldes del Montseny, les Pungoles, Can Miret, Can Vila, Can Ram, Vallserena i Can Derrocada. Els punts de càmera s’han contrastat amb la cartografia ICGC i el <a href="https://www.vilamajor.cat/media/repository/emergencies/PUBLIC_DUPROCIM_2024/PuBLIC_DUPROCIM_rev_maig_2024_signat_diligenciat.pdf" target="_blank" rel="noopener noreferrer">DUPROCIM municipal</a>. Els anys de cada vol són fragments de la cronologia, no dates de fundació dels barris.</p><h3>Límits municipals</h3><p>Geometries oficials ICGC de ${manifest?.boundariesDate??'2026'}. El control sempre es diu «Límits municipals actuals»: no afirma que siguin els de 1843. El territori medieval de Vilamajor tampoc es redueix als dos termes actuals.</p>
<h3>Procedència i llicències</h3><ul><li><a href="https://www.icgc.cat/ca/Geoinformacio-i-mapes/Geoinformacio-en-linia-Geoserveis/WMS-i-WCS-Elevacions/WCS-del-Model-dElevacions-del-Terreny" target="_blank" rel="noopener noreferrer">ICGC · Model d’elevacions ${icon('external')}</a></li><li><a href="https://www.icgc.cat/ca/Geoinformacio-i-mapes/Dades-i-productes/Imatge/Ortofoto-Territorial" target="_blank" rel="noopener noreferrer">ICGC · Ortofoto territorial ${icon('external')}</a></li><li><a href="https://www.icgc.cat/ca/Geoinformacio-i-mapes/Dades-i-productes/Geoinformacio-cartografica/Divisions-administratives" target="_blank" rel="noopener noreferrer">ICGC · Divisions administratives ${icon('external')}</a></li><li><a href="https://www.catastro.hacienda.gob.es/webinspire/index.html" target="_blank" rel="noopener noreferrer">Dirección General del Catastro · INSPIRE ${icon('external')}</a></li></ul><p>© ICGC · CC BY 4.0. © Dirección General del Catastro · Ministerio de Hacienda, reutilització amb atribució. Les dades estan servides localment; navegar no fa peticions als geoserveis.</p>
<h3>Fonts històriques</h3><ul>${Object.values(sources).map(s=>`<li><a href="${s.url}" target="_blank" rel="noopener noreferrer">${s.title} ${icon('external')}</a></li>`).join('')}</ul>
<h3>La segregació</h3><p>Distingim el primer ajuntament de 1822 de la culminació de la segregació el 1843. Algunes síntesis la situen vers 1840.</p>
<h3>Abast de la reconstrucció</h3><p>Els models són una aproximació documental evolutiva, no una reproducció fotogramètrica. Les construccions sense documentació suficient resten pendents.</p>
<h3>Sobre el projecte</h3><p>Creat per Jordi Deu-Pons. Pots consultar el codi i proposar millores a <a href="https://github.com/jordeu/vilamajor-historic" target="_blank" rel="noopener noreferrer">GitHub ${icon('external')}</a>.</p><p>El codi propi es publica amb <a href="https://github.com/jordeu/vilamajor-historic/blob/main/LICENSE" target="_blank" rel="noopener noreferrer">llicència MIT</a>. La cartografia, les imatges i les dependències conserven les seves <a href="https://github.com/jordeu/vilamajor-historic/blob/main/THIRD_PARTY_NOTICES.md" target="_blank" rel="noopener noreferrer">condicions i atribucions</a>.</p>`);
  el('drawer').setAttribute('aria-label',panel==='history'?'Cronologia':panel==='heritage'?'Patrimoni':'Fonts i dades');
  panels.open('drawer',el(`${panel}-button`));
  el('drawer').querySelectorAll<HTMLElement>('[data-event]').forEach(b=>{if(Number(b.dataset.event)===eventAt(year).year)b.setAttribute('aria-current','true');});
  el('drawer').querySelectorAll<HTMLButtonElement>('[data-heritage]').forEach(b=>b.onclick=()=>{const model=scene?.heritage.landmarks.find(l=>l.id===b.dataset.heritage);if(model){panels.close(false);visitHeritage(model);}});
  el('drawer').querySelectorAll<HTMLButtonElement>('[data-event]').forEach(b=>b.onclick=()=>{stop();setYear(Number(b.dataset.event));panels.close();});
}
el('heritage-button').onclick=()=>drawer('heritage');el('history-button').onclick=()=>drawer('history');el('sources-button').onclick=()=>drawer('sources');

setYear(year);
async function loadScene(){
  el('loading').hidden=false;el('loading').innerHTML='<strong>Carregant el territori…</strong><span>Preparem el relleu, les fotografies i els edificis.</span><div class="loading-track" aria-hidden="true"></div>';
  try{
    const module=await import('./scene');
    scene=await module.createScene(el('scene'),{onState:sceneState,onSelect:part=>{if(!el('map-stage').classList.contains('documentary'))selectBuilding(part);},onHeritage:landmark=>{if(!el('map-stage').classList.contains('documentary'))selectHeritage(landmark);},onCameraInterrupt:()=>{stop();stopOrbit();}});manifest=scene.manifest;
    for(const id of ['explore-event','landmark-focus','orbit','overview','reset','zoom-in','zoom-out','labels','focus-pere','focus-antoni','layers-button','places-button','move-mode','rotate-mode','play'])el<HTMLButtonElement>(id).disabled=false;
    document.querySelectorAll<HTMLButtonElement>('[data-layer],[data-neighborhood]').forEach(b=>b.disabled=false);
    el('photo-jumps').innerHTML='<span>Fotografies disponibles</span>'+manifest.orthophotos.filter(p=>p.year>=2004).map(p=>`<button data-photo="${p.year}">${p.year}</button>`).join('');
    el('photo-jumps').querySelectorAll<HTMLButtonElement>('[data-photo]').forEach(b=>b.onclick=()=>{stop();setYear(Number(b.dataset.photo));scene?.setLayer('photo');document.querySelectorAll<HTMLButtonElement>('[data-layer]').forEach(l=>l.setAttribute('aria-pressed',String(l.dataset.layer==='photo')));});
    if(year!==2026)scene.setYear(year);
    if(matchMedia('(prefers-reduced-motion: reduce)').matches){el<HTMLButtonElement>('orbit').disabled=true;el('orbit').title='Vol circulant desactivat amb la preferència de moviment reduït';}
  }catch(error){
    console.error(error);
    el('loading').innerHTML='<strong>No s’ha pogut carregar el territori 3D</strong><span>La cronologia continua disponible. Comprova la connexió i que WebGL estigui activat.</span><button id="retry-scene">Tornar a provar</button>';
    el('loading').hidden=false;el('map-status').textContent='Dades o WebGL no disponibles';el('retry-scene').onclick=()=>{scene?.dispose();el('scene').replaceChildren();void loadScene();};
  }
}
void loadScene();

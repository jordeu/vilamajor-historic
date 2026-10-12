import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
const errors=[],shots='.impeccable/review/';
const wire=p=>{p.setDefaultTimeout(60000);p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});};
const ready=async p=>{await p.goto('http://localhost:5173');await p.locator('#play:enabled').waitFor({timeout:90000});await p.locator('#scene[data-resolution="0.25"]').waitFor();};
const year=async(p,y)=>{await p.locator('#year-jump').click();await p.locator('#year-input').fill(String(y));await p.locator('#year-input').press('Enter');assert.equal(await p.locator('#year-display').textContent(),String(y));};
const noOverflow=async p=>assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth||document.documentElement.scrollHeight>innerHeight),false,'application fits the viewport');
const onePanel=async p=>assert.ok(await p.locator('.map-panel:visible').count()<=1);
const touchTargets=async p=>{
 const failures=await p.evaluate(()=>{
  const selectors=['.free-controls button','.layer-switch button','#story-toggle','#time','.timeline-ticks button'];
  const bad=[...document.querySelectorAll(selectors.join(','))].filter(el=>el.getClientRects().length).filter(el=>{const r=el.getBoundingClientRect();return r.width<44||r.height<44;}).map(el=>el.id||el.textContent.trim());
  const slider=document.querySelector('#time').getBoundingClientRect(),ticks=[...document.querySelectorAll('.timeline-ticks button')].map(el=>el.getBoundingClientRect());
  if(ticks.some((r,i)=>r.top<slider.bottom-.5||r.bottom>innerHeight+.5||(i&&r.left<ticks[i-1].right-.5)))bad.push('overlapping or clipped timeline targets');
  return bad;
 });
 assert.deepEqual(failures,[],'touch targets are at least 44px and timeline controls do not overlap');
};

try{
 for(const mobile of process.argv.includes('--mobile-only')?[true]:[false,true]){
  const page=await browser.newPage({viewport:mobile?{width:390,height:844}:{width:1440,height:1000},isMobile:mobile,hasTouch:mobile,reducedMotion:'reduce'});wire(page);await ready(page);
  const name=mobile?'mobile':'desktop';await noOverflow(page);await touchTargets(page);assert.equal(await page.locator('#documentary').count(),0);await page.screenshot({path:shots+name+'.png'});
  assert.ok(await page.getByRole('button',{name:'Any següent',exact:true}).isDisabled());
  await page.getByRole('button',{name:'Any anterior',exact:true}).click();assert.equal(await page.locator('#year-display').textContent(),'2025');assert.equal(await page.locator('#time').inputValue(),'2025');assert.equal(await page.locator('#year-input').inputValue(),'2025');assert.ok(await page.locator('#year-panel').isHidden());assert.ok(await page.locator('#next').isEnabled());
  await page.locator('#next').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('#year-display').textContent(),'2026');assert.ok(await page.locator('#next').isDisabled());

  await page.locator('#places-button').click();assert.equal(await page.evaluate(()=>document.activeElement.id),'place-search');
  await page.locator('#place-search').fill('sant julia');assert.equal(await page.locator('[data-place-name]:visible').count(),1);await page.locator('[data-neighborhood="alfou"]').click();assert.equal(await page.locator('#view-title').textContent(),'Sant Julià d’Alfou');assert.ok(await page.locator('#places-panel').isHidden());
  await page.locator('#places-button').click();await page.locator('#place-search').fill('cap lloc coincident');assert.ok(await page.locator('#place-empty').isVisible());await page.locator('#place-search').fill('');await page.locator('#focus-pere').click();assert.equal(await page.locator('#view-title').textContent(),'Sant Pere de Vilamajor');
  await page.locator('#help-button').click();await page.locator('#layers-button').click();await onePanel(page);await touchTargets(page);assert.ok(await page.locator('#help-panel').isHidden());
  await page.locator('#labels').click();assert.equal(await page.locator('#labels .toggle-status').textContent(),'Ocults');await page.locator('#labels').click();
  await page.locator('[data-layer="terrain"]').click();assert.equal(await page.locator('[data-layer="terrain"]').getAttribute('aria-pressed'),'true');await page.locator('[data-layer="photo"]').click();
  await page.locator('#reconstruction-toggle').uncheck();assert.equal(await page.locator('#map-status').getAttribute('data-landmarks'),'0');await page.locator('#reconstruction-toggle').check();
  await page.locator('#boundaries-toggle').check();assert.match(await page.locator('#map-status').textContent(),/Límits actuals/);await page.locator('#boundaries-toggle').uncheck();
  await page.screenshot({path:shots+name+'-layers.png'});await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>document.activeElement.id),'layers-button');
  await page.locator('#year-jump').click();await page.locator('#year-input').fill('3000');await page.locator('#year-form button').click();assert.ok(await page.locator('#year-panel').isVisible());assert.equal(await page.locator('#year-display').textContent(),'2026');await page.locator('#year-input').fill('1697');await page.locator('#year-input').press('Enter');assert.equal(await page.evaluate(()=>document.activeElement.id),'year-jump');
  await page.locator('#story-toggle').click();assert.match(await page.locator('#event-title').textContent(),/carrer Vell/);await page.screenshot({path:shots+name+'-story.png'});await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>document.activeElement.id),'story-toggle');
  await page.locator('#story-toggle').click();await page.locator('#explore-event').click();assert.equal(await page.locator('#view-title').textContent(),'La Vilanova · Sant Antoni');assert.ok(await page.locator('#story-panel').isHidden());
  await page.waitForFunction(async()=>{const raw=document.getElementById('scene').dataset.target;if(!raw)return false;const target=raw.split(',').map(Number),manifest=await fetch('/data/manifest.json').then(r=>r.json());return Math.abs(target[0]-(450150-manifest.origin[0])*.01)<.02&&Math.abs(target[2]-(manifest.origin[1]-4613710)*.01)<.02;});

  await page.locator('#time').focus();await page.keyboard.press('ArrowLeft');assert.equal(await page.locator('#year-display').textContent(),'1696');assert.match(await page.locator('#time').getAttribute('aria-valuetext'),/1696/);
  await page.locator('[data-year="872"]').click();assert.ok(await page.locator('#previous').isDisabled());await page.locator('#next').click();assert.equal(await page.locator('#year-display').textContent(),'873');assert.ok(await page.locator('#previous').isEnabled());await page.locator('#previous').click();assert.equal(await page.locator('#year-display').textContent(),'872');assert.ok(await page.locator('#previous').isDisabled());await page.locator('#next').click();
  await page.locator('#history-button').click();assert.equal(await page.locator('[data-event][aria-current=true]').getAttribute('data-event'),'872');await page.locator('[data-event="1843"]').click();assert.equal(await page.locator('#year-display').textContent(),'1843');assert.equal(await page.evaluate(()=>document.activeElement.id),'history-button');
  await page.locator('#heritage-button').click();await page.locator('[data-heritage="orila"]').click();assert.ok(await page.locator('#building-detail').isVisible());assert.equal(await page.locator('#year-display').textContent(),'872');await page.locator('#close-building').click();assert.equal(await page.evaluate(()=>document.activeElement.tagName),'CANVAS');
  await page.locator('#sources-button').click();assert.match(await page.locator('#drawer').textContent(),/4.598 edificis/);await page.locator('#drawer .close').click();
  await page.locator('#rotate-mode').click();assert.equal(await page.locator('#scene canvas').getAttribute('data-navigation'),'orbit');await page.locator('#move-mode').click();
  const canvas=page.locator('#scene canvas'),box=await canvas.boundingBox(),target=await page.locator('#scene').getAttribute('data-target');
  const x=box.x+box.width*.55,y=box.y+box.height*.52;
  await page.locator('#help-button').click();
  if(mobile){await page.keyboard.press('Escape');const touch=await page.context().newCDPSession(page);await touch.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});await touch.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+35,y:y+20}]});await touch.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
  else{await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+50,y+25,{steps:4});await page.mouse.up();}
  assert.ok(await page.locator('#help-panel').isHidden());assert.notEqual(await page.locator('#scene').getAttribute('data-target'),target);
  await year(page,1150);if(mobile)await page.evaluate(()=>document.getElementById('map-stage').requestFullscreen=undefined);
  await page.locator('#play').click();await page.locator('#map-stage.documentary').waitFor();await page.locator('#film-play').click();assert.equal(await page.locator('#map-stage').getAttribute('data-playing'),'false');assert.ok(await page.locator('#film-caption').isVisible());assert.equal(await page.evaluate(()=>document.querySelector('.timeline').inert),true);
  await page.locator('#film-subtitles').click();assert.ok(await page.locator('#film-caption').isHidden());await page.locator('#film-subtitles').click();await page.locator('#film-chapter').selectOption('8');await page.screenshot({path:shots+name+'-tour.png'});
  await page.keyboard.press('Escape');await page.locator('#map-stage:not(.documentary)').waitFor();assert.equal(await page.evaluate(()=>document.activeElement.id),'play');assert.equal(await page.evaluate(()=>document.querySelector('.timeline').inert),false);
  if(mobile){for(const size of [{width:320,height:640},{width:844,height:390}]){await page.setViewportSize(size);await noOverflow(page);await touchTargets(page);for(const id of ['play','year-jump','places-button','layers-button']){const b=await page.locator('#'+id).boundingBox();assert.ok(b.x>=0&&b.x+b.width<=size.width+.5&&b.y>=0&&b.y+b.height<=size.height+.5,id+' fits viewport');}await page.screenshot({path:shots+`mobile-${size.width}.png`});}}
  await page.close();console.log('PASS '+name+': search, panels, focus, layers, chronology, heritage, gestures, tour and layout');
 }
 const failure=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});await failure.route('**/data/manifest.json',route=>route.abort());await failure.goto('http://localhost:5173');await failure.locator('#retry-scene').waitFor();assert.ok(await failure.locator('#play').isDisabled());await failure.locator('#story-toggle').click();assert.ok(await failure.locator('#event-title').isVisible());await failure.locator('#story-panel [data-close-panel]').click();await failure.unroute('**/data/manifest.json');await failure.locator('#retry-scene').click();await failure.locator('#play:enabled').waitFor({timeout:90000});await failure.close();
 assert.deepEqual(errors,[]);console.log('PASS loading recovery and zero JavaScript/shader errors');
}finally{await browser.close();}

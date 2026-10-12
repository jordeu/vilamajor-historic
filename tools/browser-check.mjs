import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
const errors=[],external=[];
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}});page.setDefaultTimeout(60000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('request',r=>{if(/geoserveis|catastro/.test(r.url()))external.push(r.url());});
 await page.addInitScript(()=>{
  window.__vilamajorDrawCount=0;
  for(const method of ['drawElements','drawArrays','drawElementsInstanced']){
   const original=WebGL2RenderingContext.prototype[method];WebGL2RenderingContext.prototype[method]=function(...args){window.__vilamajorDrawCount++;return original.apply(this,args);};
  }
 });
 await page.goto('http://localhost:5173');await page.locator('#map-status[data-ready="true"][data-photo-year="2025"]').waitFor({timeout:90000});
 await page.waitForFunction(()=>document.getElementById('map-status').textContent.includes('Empremtes cadastrals'),undefined,{timeout:90000});
 assert.ok(Number(await page.locator('#map-status').getAttribute('data-buildings'))>4000);assert.equal(await page.locator('#map-status').getAttribute('data-landmarks'),'6');
 await page.waitForTimeout(1200);const before=await page.evaluate(()=>window.__vilamajorDrawCount);await page.waitForTimeout(600);assert.equal(await page.evaluate(()=>window.__vilamajorDrawCount),before,'GPU idle at rest');
 console.log('PASS loading, real geometry, landmarks and idle renderer');
 await page.locator('#heritage-button').click();assert.equal(await page.locator('[data-heritage]').count(),9);await page.locator('[data-heritage="torre"]').click();await page.locator('#scene[data-moving="false"]').waitFor();
 assert.match(await page.locator('#building-detail').textContent(),/Proporcions documentades/);await page.locator('#close-building').click();
 await page.locator('#year-jump').click();await page.locator('#year-input').fill('950');await page.locator('#year-input').press('Enter');assert.equal(await page.locator('#map-status').getAttribute('data-landmarks'),'1');assert.match(await page.locator('#map-status').textContent(),/Entorn recreat/);
 await page.locator('[data-year="1150"]').click();assert.equal(await page.locator('#map-status').getAttribute('data-landmarks'),'2');
 await page.locator('#heritage-button').click();await page.locator('[data-heritage="susanna"]').click();assert.equal(await page.locator('#year-display').textContent(),'1683');await page.locator('#scene[data-moving="false"]').waitFor();await page.keyboard.press('Escape');
 await page.locator('[data-year="1843"]').click();assert.equal(await page.locator('#event-title').textContent(),'Un origen. Dos municipis.');await page.locator('#previous').click();assert.equal(await page.locator('#year-display').textContent(),'1842');
 await page.locator('#layers-button').click();await page.locator('#reconstruction-toggle').uncheck();assert.equal(await page.locator('#map-status').getAttribute('data-landmarks'),'0');await page.locator('#reconstruction-toggle').check();await page.locator('#vegetation-toggle').uncheck();await page.locator('#light-toggle').uncheck();
 await page.locator('#volumes-toggle').uncheck();assert.equal(await page.locator('#map-status').getAttribute('data-buildings'),'0');await page.locator('#volumes-toggle').check();
 await page.locator('#boundaries-toggle').check();await page.locator('#parcels-toggle').check();await page.waitForFunction(()=>document.getElementById('map-status').textContent!=='Carregant parcel·les cadastrals…');await page.keyboard.press('Escape');
 assert.match(await page.locator('#map-status').textContent(),/Límits actuals/);assert.match(await page.locator('#map-status').textContent(),/Parcel·les actuals/);
 console.log('PASS temporal phases, heritage visits, overlays and evidence controls');
 await page.locator('#layers-button').click();await page.locator('[data-layer="topographic"]').click();await page.keyboard.press('Escape');await page.waitForFunction(()=>document.getElementById('map-status').textContent.startsWith('Mapa topogràfic actual'));
 await page.locator('#year-jump').click();await page.locator('#year-input').fill('1956');await page.locator('#year-input').press('Enter');await page.locator('#layers-button').click();await page.locator('[data-layer="photo"]').click();await page.keyboard.press('Escape');await page.waitForFunction(()=>document.getElementById('map-status').dataset.photoYear==='');assert.ok(Number(await page.locator('#map-status').getAttribute('data-buildings'))>0);
 await page.locator('#sources-button').click();assert.match(await page.locator('#drawer').textContent(),/4.598 edificis/);assert.match(await page.locator('#drawer').textContent(),/no es reconstrueix/);await page.keyboard.press('Escape');
 await page.locator('#play').click();await page.waitForTimeout(9700);assert.ok(Number(await page.locator('#year-display').textContent())>1956);await page.locator('#film-exit').click();
 await page.locator('#orbit').click();assert.equal(await page.locator('#orbit').getAttribute('aria-pressed'),'true');
 const canvas=page.locator('#scene canvas'),bounds=await canvas.boundingBox();await page.mouse.move(bounds.x+bounds.width*.65,bounds.y+bounds.height*.55);await page.mouse.down();await page.mouse.move(bounds.x+bounds.width*.68,bounds.y+bounds.height*.58,{steps:4});await page.mouse.up();assert.equal(await page.locator('#orbit').getAttribute('aria-pressed'),'false');
 // Cadastral picking with all custom monuments removed and an immediate reduced-motion focus.
 await page.emulateMedia({reducedMotion:'reduce'});await page.locator('[data-year="2026"]').click();await page.locator('#layers-button').click();await page.locator('#reconstruction-toggle').uncheck();await page.locator('#parcels-toggle').uncheck();await page.keyboard.press('Escape');await page.locator('#places-button').click();await page.locator('#focus-pere').click();await page.locator('#layers-button').click();await page.locator('#labels').click();await page.keyboard.press('Escape');await page.waitForTimeout(600);
 for(const [x,y] of [[.55,.52],[.5,.5],[.49,.52],[.52,.5],[.45,.53],[.55,.55],[.4,.5],[.6,.5],[.6,.6],[.42,.43]]){
  await canvas.click({position:{x:bounds.width*x,y:bounds.height*y}});if(await page.locator('#building-detail').isVisible())break;
 }
 assert.ok(await page.locator('#building-detail').isVisible(),'Cadastral picking');assert.match(await page.locator('#building-detail').textContent(),/Alçada estimada/);
 console.log('PASS photos, guided chronology, motion interruption and building picking');
 await page.close();
 const mobile=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});mobile.on('pageerror',e=>errors.push(e.message));await mobile.goto('http://localhost:5173');await mobile.locator('#map-status[data-ready="true"]').waitFor({timeout:90000});
 await mobile.waitForFunction(()=>document.getElementById('map-status').textContent.includes('Empremtes cadastrals'),undefined,{timeout:90000});
 assert.equal(await mobile.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.ok(await mobile.locator('#orbit').isDisabled());
 await mobile.locator('#heritage-button').click();await mobile.locator('[data-heritage="orila"]').click();assert.equal(await mobile.locator('#year-display').textContent(),'872');await mobile.waitForTimeout(300);assert.equal(await mobile.locator('#scene').getAttribute('data-moving'),'false');await mobile.close();
 const failure=await browser.newPage();await failure.route('**/data/manifest.json',route=>route.abort());await failure.goto('http://localhost:5173');await failure.locator('#retry-scene').waitFor();await failure.locator('#story-toggle').click();assert.ok(await failure.locator('#event-title').isVisible());await failure.close();
 assert.deepEqual(external,[]);assert.deepEqual(errors,[]);
 console.log('PASS mobile, reduced motion, local data, recoverable loading failure, no JS/shader errors');
}finally{await browser.close();}

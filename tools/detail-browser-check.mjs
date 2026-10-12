import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
const errors=[];
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.goto('http://localhost:5173');await page.locator('#scene[data-resolution="0.25"]').waitFor({timeout:90000});await page.waitForTimeout(500);
 await page.screenshot({path:'/tmp/vilamajor-v3-current.png'});
 await page.locator('#year-jump').click();await page.locator('#year-input').fill('2004');await page.locator('#year-input').press('Enter');await page.locator('#scene[data-resolution="0.5"]').waitFor({timeout:60000});assert.equal(await page.locator('#map-status').getAttribute('data-photo-year'),'2004');
 await page.locator('[data-year="1150"]').click();assert.equal(await page.locator('#scene').getAttribute('data-resolution'),'');await page.locator('#story-toggle').click();await page.locator('#explore-event').click();await page.screenshot({path:'/tmp/vilamajor-v3-medieval.png'});
 await page.locator('#layers-button').click();await page.locator('[data-layer="topographic"]').click();await page.keyboard.press('Escape');await page.waitForFunction(()=>document.getElementById('map-status').textContent.startsWith('Mapa topogràfic'));assert.equal(await page.locator('#scene').getAttribute('data-resolution'),'');
 await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForFunction(()=>!document.getElementById('orbit').disabled);assert.equal(await page.locator('#orbit').isDisabled(),false);await page.locator('#orbit').click();assert.equal(await page.locator('#orbit').getAttribute('aria-pressed'),'true');await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(300);assert.equal(await page.locator('#orbit').getAttribute('aria-pressed'),'false');assert.ok(await page.locator('#orbit').isDisabled());
 await page.close();
 const mobile=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});mobile.on('pageerror',e=>errors.push(e.message));mobile.on('console',m=>{if(m.type()==='error')errors.push(m.text());});await mobile.goto('http://localhost:5173');await mobile.locator('#scene[data-resolution="0.25"]').waitFor({timeout:90000});await mobile.screenshot({path:'/tmp/vilamajor-v3-mobile.png',fullPage:true});assert.equal(await mobile.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 assert.deepEqual(errors,[]);console.log('PASS 25/50 cm detail, year selection, no future imagery, no shader errors, responsive view and live reduced-motion preference');
}finally{await browser.close();}

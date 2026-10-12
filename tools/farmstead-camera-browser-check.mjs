import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {tourShots,chapterTime} from '../src/tour.ts';
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:560,height:820},reducedMotion:'no-preference'});page.setDefaultTimeout(60000);const errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.goto('http://localhost:5173');await page.locator('#scene[data-resolution="0.25"]').waitFor();await page.locator('#play').click();await page.locator('#film-play').click();
 const index=tourShots.findIndex(s=>s.title.startsWith('Can Gol:')),start=chapterTime(index);
 const seek=async seconds=>{await page.locator('#film-seek').evaluate((e,t)=>{e.value=String(t);e.dispatchEvent(new Event('input',{bubbles:true}));},seconds);await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));};
 const camera=()=>page.locator('#scene').getAttribute('data-camera');
 await seek(start);const wide=await camera();await page.screenshot({path:'/tmp/farmstead-setting-wide.png',timeout:30000});
 await seek(start+10.8);const close=await camera();assert.notEqual(close,wide);await page.screenshot({path:'/tmp/farmstead-setting-close.png',timeout:30000});
 await seek(start);assert.equal(await camera(),wide,'backward seek returns to the same wide pose');
 await seek(start+4);await page.locator('#film-play').click();const before=await camera();await page.waitForFunction(before=>document.querySelector('#scene').dataset.camera!==before,before);await page.locator('#film-play').click();const paused=await camera();
 await page.evaluate(()=>new Promise(r=>setTimeout(r,450)));assert.equal(await camera(),paused,'pause freezes authored approach');
 await page.emulateMedia({reducedMotion:'reduce'});await seek(start);const stable=await camera();await seek(start+10.8);assert.equal(await camera(),stable,'reduced-motion pose stays fixed');
 await page.locator('#film-exit').click();await page.locator('#heritage-button').click();await page.locator('[data-heritage="gol-torre"]').click();await page.locator('[data-heritage-year="1600"]').click();await page.locator('#close-building').click();
 await page.setViewportSize({width:1100,height:820});await page.screenshot({path:'/tmp/farmstead-setting-desktop.png',timeout:30000});
 assert.deepEqual(errors,[]);console.log('PASS wide-to-close choreography, reverse seek, playback, pause, reduced motion and desktop scenery');
}finally{await browser.close();}

import {tourFinaleStart,tourDuration,tourShots} from '../src/tour.ts';
import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const page=await browser.newPage();
page.setDefaultTimeout(10000);
page.on('pageerror',error=>console.error(error.message));
// Exercise the real documentary controller with a controllable asynchronous scene.
await page.route(/\/src\/main\.ts(?:\?.*)?$/,route=>route.fulfill({contentType:'application/javascript',body:`
 import '/src/style.css';
 import {interfaceTemplate} from '/src/interface.ts';
 import {createDocumentary} from '/src/documentary.ts';
 document.getElementById('app').innerHTML=interfaceTemplate;
 document.getElementById('map-stage').requestFullscreen=undefined;
 let year=2026,ready=false,error=null,finish;
 const scene={flyTo(){},cinematic(){},setHistoricalVolumes(){},setReconstruction(){},labels(){},
  setLayer(layer){window.layer=layer;ready=false;error=null;return layer==='photo'?new Promise(resolve=>finish=resolve):Promise.resolve();},
  setPhotoOpacity(value){window.opacity=value;},photoStatus(){return {ready,year:2025,error};}};
 window.releasePhoto=(failure=false)=>{ready=!failure;error=failure?'Unavailable':null;finish();};
 window.film=createDocumentary({scene:()=>scene,year:()=>year,setYear:value=>year=value});
 document.getElementById('play').disabled=false;
 document.getElementById('loading').hidden=true;
 document.getElementById('play').onclick=()=>window.film.enter();
`}));
const seek=async value=>page.locator('#film-seek').evaluate((input,value)=>{input.value=value;input.dispatchEvent(new Event('input'));},String(value));
try{
 await page.goto('http://localhost:5173');await page.locator('#play').click();await page.locator('#film-play').click();
 console.log('Controller ready');
 await seek(tourFinaleStart);await page.locator('#film-play').click();
 await page.waitForTimeout(150);
 assert.equal(await page.evaluate(()=>window.opacity),0,'loading cannot consume the fade');
 assert.equal(await page.locator('#film-seek').inputValue(),String(tourFinaleStart));
 await page.evaluate(()=>window.releasePhoto());
 console.log('Delayed photo released');
 await page.waitForFunction(()=>window.opacity>0);
 await page.locator('#film-play').click();
 await seek(tourFinaleStart-4);await seek(tourFinaleStart);await seek(300);
 await page.evaluate(()=>window.releasePhoto());
 assert.equal(await page.evaluate(()=>window.layer),'terrain','late photo cannot reactivate an earlier chapter');
 assert.equal(await page.evaluate(()=>window.opacity),0);
 await seek(tourFinaleStart);await page.evaluate(()=>window.releasePhoto(true));
 assert.match(await page.locator('#film-evidence').textContent(),/no disponible/);
 await page.locator('#film-play').click();await page.waitForFunction(start=>Number(document.getElementById('film-seek').value)>start,tourFinaleStart);
 await page.locator('#film-play').click();await seek(tourFinaleStart-4);await seek(tourFinaleStart);
 await page.locator('#film-exit').click();await page.evaluate(()=>window.releasePhoto());
 assert.equal(await page.evaluate(()=>window.opacity),1,'exit during loading restores the viewer');
 assert.equal(await page.locator('#play').getAttribute('aria-expanded'),'false');
 console.log('PASS delayed photo waits before fade, late completion after seek/exit, error fallback without stalled playback');
}finally{await browser.close();}

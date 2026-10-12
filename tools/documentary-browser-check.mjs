import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
const errors=[],photos=[];
const wire=page=>{page.setDefaultTimeout(90000);page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('request',r=>{if(/ortho-(1956|1986)/.test(r.url()))photos.push(r.url());});};
const ready=async page=>{await page.goto('http://localhost:5173');await page.locator('#scene[data-resolution="0.25"]').waitFor();await page.waitForFunction(()=>document.getElementById('map-status').textContent.includes('Empremtes cadastrals'));assert.equal(await page.locator('#documentary').count(),0,'No duplicate documentary entry');assert.equal(await page.locator('#play').count(),1);assert.equal(await page.locator('#play').getAttribute('aria-expanded'),'false');};
const setYear=async(page,year)=>{await page.locator('#year-jump').click();await page.locator('#year-input').fill(String(year));await page.locator('#year-input').press('Enter');};
try{
 if(!process.argv.includes('--mobile-only')){
 const page=await browser.newPage({viewport:{width:1440,height:1000}});wire(page);await ready(page);await page.waitForTimeout(500);
 await page.screenshot({path:'/tmp/vilamajor-v3-current.png'});
 const canvas=page.locator('#scene canvas'),bounds=await canvas.boundingBox(),target=await page.locator('#scene').getAttribute('data-target');
 await page.mouse.move(bounds.x+bounds.width*.65,bounds.y+bounds.height*.48);await page.mouse.down();await page.mouse.move(bounds.x+bounds.width*.77,bounds.y+bounds.height*.52,{steps:5});await page.mouse.up();await page.waitForTimeout(500);
 assert.notEqual(await page.locator('#scene').getAttribute('data-target'),target,'left drag translates the center');
 const panned=await page.locator('#scene').getAttribute('data-target');await canvas.focus();await page.keyboard.down('w');await page.waitForTimeout(700);await page.keyboard.up('w');await page.waitForTimeout(200);assert.notEqual(await page.locator('#scene').getAttribute('data-target'),panned,'W moves through the map');
 await page.locator('#rotate-mode').click();assert.equal(await canvas.getAttribute('data-navigation'),'orbit');await page.locator('#move-mode').click();
 console.log('PASS free drag, keyboard movement and orbit switching');
 let prior=0;for(const y of [1956,1970,1986,2003]){await setYear(page,y);const count=Number(await page.locator('#map-status').getAttribute('data-buildings'));assert.ok(count>=prior&&count>0);prior=count;assert.equal(await page.locator('#map-status').getAttribute('data-photo-year'),'');}
 await setYear(page,2004);await page.locator('#scene[data-resolution="0.5"]').waitFor();assert.equal(await page.locator('#map-status').getAttribute('data-photo-year'),'2004');
 await page.locator('#places-button').click();await page.locator('[data-neighborhood="ram"]').click();await page.locator('#scene[data-moving="false"]').waitFor();assert.equal(await page.locator('#view-title').textContent(),'Can Ram');
 console.log('PASS persistent chronological buildings, only color photos and direct neighborhood visits');
 await setYear(page,1150);await page.locator('#play').click();await page.locator('#map-stage.documentary').waitFor();assert.equal(await page.locator('[data-layer="terrain"]').getAttribute('aria-pressed'),'true');assert.equal(await page.locator('#map-status').getAttribute('data-photo-year'),'');assert.equal(await page.evaluate(()=>document.fullscreenElement?.id),'map-stage');assert.equal(await page.locator('#play').getAttribute('aria-expanded'),'true');await page.locator('#film-play').click();
 assert.equal(await page.locator('#map-stage').getAttribute('data-playing'),'false');assert.ok(await page.locator('#film-caption').isVisible());
 await page.locator('#film-chapter').selectOption('2');await page.locator('#scene[data-moving="false"]').waitFor();await page.screenshot({path:'/tmp/vilamajor-v3-documentary-history.png'});
 const stageBounds=await page.locator('#map-stage').boundingBox();assert.equal(stageBounds.x,0);assert.equal(stageBounds.y,0);assert.equal(stageBounds.width,1440);
 await page.locator('#film-subtitles').click();assert.ok(await page.locator('#film-caption').isHidden());await page.locator('#film-subtitles').click();
 await page.locator('#film-chapter').selectOption('16');await page.locator('#scene[data-moving="false"]').waitFor();assert.equal(await page.locator('#film-place').textContent(),'Les Faldes del Montseny');
 const time0=Number(await page.locator('#map-stage').getAttribute('data-film-year'));await page.locator('#film-speed').selectOption('4');await page.locator('#film-play').click();await page.waitForTimeout(2500);await page.locator('#film-play').click();
 const time1=Number(await page.locator('#map-stage').getAttribute('data-film-year'));assert.ok(time1>time0,'time continuously advances within a chapter');assert.ok(time1<1982,'does not jump straight to the next milestone');
 await page.screenshot({path:'/tmp/vilamajor-v3-documentary-modern.png'});
 await page.locator('#film-next').click();assert.equal(await page.locator('#film-place').textContent(),'Les Pungoles');await page.locator('#film-previous').click();assert.equal(await page.locator('#film-place').textContent(),'Les Faldes del Montseny');
 await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.querySelector('.documentary'));assert.equal(await page.locator('#map-stage').getAttribute('data-playing'),'false');assert.ok(await page.locator('#film-controls').isHidden());assert.equal(await page.locator('#play').getAttribute('aria-expanded'),'false');assert.equal(await page.evaluate(()=>document.activeElement?.id),'play');
 await page.emulateMedia({reducedMotion:'reduce'});await setYear(page,2026);await page.locator('#heritage-button').click();await page.locator('[data-heritage="antoni"]').click();await page.locator('#close-building').click();await page.waitForTimeout(300);await page.screenshot({path:'/tmp/vilamajor-v3-antoni.png'});
 console.log('PASS fullscreen, subtitles, continuous time, playback speed, chapters and exit');await page.close();
 }
 const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});wire(mobile);await ready(mobile);assert.equal(await mobile.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 await mobile.screenshot({path:'/tmp/vilamajor-v3-mobile.png',fullPage:true});
 const touchTarget=await mobile.locator('#scene').getAttribute('data-target'),touch=await mobile.context().newCDPSession(mobile);
 const origin=await mobile.evaluate(()=>{const c=document.querySelector('#scene canvas'),b=c.getBoundingClientRect();for(const [rx,ry]of [[.5,.5],[.4,.6],[.65,.55]]){const x=b.x+b.width*rx,y=b.y+b.height*ry;if(document.elementFromPoint(x,y)===c)return{x,y};}throw Error('No clear gesture start');});
 await touch.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:origin.x,y:origin.y}]});
 for(let i=1;i<=4;i++)await touch.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:origin.x+i*12,y:origin.y+i*4}]});
 await touch.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await mobile.waitForFunction(before=>document.getElementById('scene').dataset.target!==before,touchTarget);assert.notEqual(await mobile.locator('#scene').getAttribute('data-target'),touchTarget,'one-finger touch pans');
 // Exercise the CSS fallback used on phones without element fullscreen.
 await mobile.evaluate(()=>document.getElementById('map-stage').requestFullscreen=undefined);
 await mobile.locator('#play').click();assert.equal(await mobile.locator('#play').getAttribute('aria-expanded'),'true');assert.equal(await mobile.evaluate(()=>document.fullscreenElement),null);await mobile.locator('#film-play').click();await mobile.locator('#film-chapter').selectOption('2');await mobile.screenshot({path:'/tmp/vilamajor-v3-mobile-film.png'});
 assert.equal(await mobile.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.equal(await mobile.locator('#scene').getAttribute('data-moving'),'false');
 for(const id of ['film-play','film-exit','film-chapter','film-subtitles']){const b=await mobile.locator('#'+id).boundingBox();assert.ok(b.x>=0&&b.x+b.width<=390&&b.y>=0&&b.y+b.height<=844,id+' fits the phone');}
 await mobile.setViewportSize({width:320,height:640});for(const id of ['film-play','film-subtitles','film-speed']){const b=await mobile.locator('#'+id).boundingBox();assert.ok(b.x>=0&&b.x+b.width<=320,id+' fits a narrow phone');}
 await mobile.setViewportSize({width:844,height:390});for(const id of ['film-play','film-exit']){const b=await mobile.locator('#'+id).boundingBox();assert.ok(b.y>=0&&b.y+b.height<=390,id+' fits landscape');}
 await mobile.locator('#film-exit').click();assert.ok(await mobile.locator('#film-controls').isHidden());assert.equal(await mobile.locator('#play').getAttribute('aria-expanded'),'false');assert.equal(await mobile.evaluate(()=>document.activeElement?.id),'play');await mobile.locator('#play').click();await mobile.locator('#film-play').click();assert.equal(await mobile.locator('#film-place').textContent(),'La Força · Sant Pere');await mobile.locator('#film-exit').click();await mobile.close();
 assert.deepEqual(photos,[],'No grayscale imagery requested');assert.deepEqual(errors,[],'No JavaScript or shader errors');console.log('PASS touch navigation, mobile fullscreen fallback, narrow/landscape layouts, reduced motion and zero errors');
}finally{await browser.close();}

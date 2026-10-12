import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
const errors=[];
try{
 const page=await browser.newPage({viewport:{width:560,height:820},reducedMotion:'reduce'});page.setDefaultTimeout(60000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.goto('http://localhost:5173');await page.locator('#scene[data-resolution="0.25"]').waitFor();
 await page.locator('#layers-button').click();await page.locator('[data-layer="terrain"]').click();await page.keyboard.press('Escape');
 for(const id of ['auferil','gil-miret','miquel-cortes','dalia','jardinera']){
  await page.locator('#heritage-button').click();await page.locator(`[data-heritage="${id}"]`).click();
  assert.ok((await page.locator('#building-detail h2').textContent()).length>3);
  assert.ok(await page.locator('#building-detail a[target="_blank"]').count());
  if(id==='auferil')await page.screenshot({path:'/tmp/residential-mobile-card.png',timeout:30000});
  await page.locator('#close-building').click();await page.screenshot({path:`/tmp/residential-${id}.png`,timeout:30000});
 }
 await page.locator('#play').click();await page.locator('#film-play').click();
 for(const name of ['La casa de Gil Miret','Ca l’Auferil:','Les cases de la Força']){
  const chapter=await page.locator('#film-chapter option').evaluateAll((options,name)=>options.find(o=>o.textContent.includes(name)).value,name);
  await page.locator('#film-chapter').selectOption(chapter);
  assert.equal(await page.locator('[data-layer="terrain"]').getAttribute('aria-pressed'),'true');
  await page.screenshot({path:`/tmp/residential-film-${chapter}.png`,timeout:30000});
 }
 await page.locator('#film-exit').click();
 await page.locator('#heritage-button').click();await page.locator('[data-heritage="jardinera"]').click();
 await page.setViewportSize({width:1100,height:820});await page.screenshot({path:'/tmp/residential-desktop-card.png',timeout:30000});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 assert.deepEqual(errors,[]);console.log('PASS five landmark visits, source cards, three documentary shots, responsive layout, no shader/runtime errors');
}finally{await browser.close();}

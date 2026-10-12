import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
try{
 for(const [name,width,height]of [['mobile',560,820],['desktop',1100,820]]){
  const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});page.setDefaultTimeout(60000);const errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto('http://localhost:5173');await page.locator('#scene[data-resolution="0.25"]').waitFor();
  await page.locator('#layers-button').click();await page.locator('[data-layer="terrain"]').click();await page.keyboard.press('Escape');
  await page.locator('#heritage-button').click();await page.locator('[data-heritage="elies"]').click();await page.locator('#close-building').click();
  await page.screenshot({path:`/tmp/elies-grounded-${name}.png`,timeout:60000});
  await page.locator('#layers-button').click();await page.locator('[data-layer="photo"]').click();await page.keyboard.press('Escape');
  await page.screenshot({path:`/tmp/elies-grounded-photo-${name}.png`,timeout:60000});
  assert.deepEqual(errors,[]);await page.close();console.log('PASS Sant Elies on terrain and orthophoto, '+name+', no rendering errors');
 }
}finally{await browser.close();}

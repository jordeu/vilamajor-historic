import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';

const site=new URL(process.env.PAGES_URL??'http://localhost:4173/vilamajor-historic/');
const repository='https://github.com/jordeu/vilamajor-historic';
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
try{
 const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
 // Verify the link opens its destination without depending on GitHub availability.
 await context.route('https://github.com/**',route=>route.fulfill({contentType:'text/html',body:'Repository destination'}));
 const page=await context.newPage(),failures=[],outsideBase=[];
 page.setDefaultTimeout(90000);
 page.on('pageerror',error=>failures.push(error.message));
 page.on('response',response=>{if(response.url().startsWith(site.origin)&&response.status()>=400)failures.push(`${response.status()} ${response.url()}`);});
 page.on('request',request=>{const url=new URL(request.url());if(url.origin===site.origin&&!url.pathname.startsWith(site.pathname))outsideBase.push(url.pathname);});
 await page.goto(site.href);
 await page.locator('#scene[data-resolution="0.25"]').waitFor();
 await page.locator('#play:enabled').waitFor();
 const credit=page.locator('.project-credit a');
 assert.equal(await credit.getAttribute('href'),repository);
 assert.equal(await credit.getAttribute('target'),'_blank');
 assert.match(await credit.getAttribute('rel'),/noopener/);
 for(const [width,height] of [[390,844],[320,740],[1100,820]]){
  await page.setViewportSize({width,height});
  await credit.focus();
  const layout=await page.evaluate(()=>{
   const credit=document.querySelector('.project-credit a'),note=document.querySelector('.model-note').getBoundingClientRect(),nav=document.querySelector('.map-navigation').getBoundingClientRect();
   return {width:document.documentElement.scrollWidth,viewport:innerWidth,left:note.left,right:note.right,top:note.top,navBottom:nav.bottom,touchHeight:credit.getBoundingClientRect().height,focus:getComputedStyle(credit).outlineStyle};
  });
  assert.ok(layout.width<=layout.viewport&&layout.left>=0&&layout.right<=layout.viewport,'credit stays inside the viewport');
  assert.ok(layout.top>layout.navBottom,'credit does not overlap navigation');
  assert.ok(layout.touchHeight>=24&&layout.focus!=='none','credit has a usable target and keyboard focus');
  await page.screenshot({path:`/tmp/vilamajor-credit-${width}.png`});
 }
 const popupPromise=context.waitForEvent('page');
 await credit.click();
 const popup=await popupPromise;await popup.waitForLoadState();assert.equal(popup.url(),repository);await popup.close();
 await page.locator('#sources-button').click();
 assert.match(await page.locator('#drawer').innerText(),/Jordi Deu-Pons/);
 assert.equal(await page.locator('#drawer a', {hasText:'llicència MIT'}).getAttribute('href'),`${repository}/blob/main/LICENSE`);
 await page.keyboard.press('Escape');
 await page.locator('#viewer-fullscreen').click();
 assert.equal(await credit.isVisible(),true);
 await page.locator('#viewer-fullscreen').click();
 await page.locator('#play').click();
 await page.locator('#film-exit').waitFor();
 assert.equal(await credit.isVisible(),false,'documentary stays uncluttered');
 assert.equal(await page.locator('.model-note>a').first().isVisible(),true,'data attribution remains visible');
 await page.locator('#film-exit').click();
 await credit.waitFor({state:'visible'});
 assert.equal(await credit.isVisible(),true);
 for(const file of ['LICENSE','THIRD_PARTY_NOTICES.md','THREE-LICENSE.txt']){
  const response=await context.request.get(new URL(file,site).href);assert.equal(response.status(),200,file);
  assert.ok((await response.text()).length>500,file);
 }
 assert.deepEqual(failures,[]);assert.deepEqual(outsideBase,[]);
 console.log('PASS: production subpath, geodata loading, credit on mobile/desktop, repository link, fullscreen, documentary and distribution notices.');
}finally{await browser.close();}

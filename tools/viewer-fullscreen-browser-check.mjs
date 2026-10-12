import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';

const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
const errors=[];
try{
  for(const mobile of [false,true]){
    const page=await browser.newPage({viewport:mobile?{width:390,height:844}:{width:1440,height:1000},isMobile:mobile,hasTouch:mobile,reducedMotion:'reduce'});
    page.setDefaultTimeout(60000);
    page.on('pageerror',e=>errors.push(e.message));
    page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
    await page.goto('http://localhost:5173');
    await page.locator('#play:enabled').waitFor({timeout:90000});
    await page.locator('#scene[data-camera]').waitFor();
    if(mobile)await page.evaluate(()=>{
      document.getElementById('app').requestFullscreen=undefined;
      document.getElementById('map-stage').requestFullscreen=undefined;
    });
    const button=page.locator('#viewer-fullscreen');
    const initialCamera=await page.locator('#scene').getAttribute('data-camera');
    const initialYear=await page.locator('#year-display').textContent();
    await button.click();
    await page.locator('#app.viewer-fullscreen').waitFor();
    if(!mobile)await page.waitForFunction(()=>document.fullscreenElement?.id==='app');
    assert.equal(await button.getAttribute('aria-pressed'),'true');
    assert.equal(await button.getAttribute('aria-label'),'Sortir de pantalla completa');
    assert.equal(await page.locator('#year-display').textContent(),initialYear);
    assert.equal(await page.locator('#scene').getAttribute('data-camera'),initialCamera);
    assert.ok(await page.locator('#tour-overlay').isHidden());
    await page.screenshot({path:`/tmp/vilamajor-viewer-fullscreen-${mobile?'mobile':'desktop'}.png` ,timeout:30000});

    assert.equal(await page.evaluate(()=>document.querySelector('.timeline').inert),false);
    await page.locator('#previous').click();
    assert.equal(await page.locator('#year-display').textContent(),'2025');
    await page.locator('#next').click();
    await page.locator('#zoom-in').click();
    await page.waitForFunction(initial=>document.getElementById('scene').dataset.camera!==initial,initialCamera);
    const target=await page.locator('#scene').getAttribute('data-target');
    await page.locator('#places-button').click();await page.locator('#focus-pere').click();
    await page.waitForFunction(old=>document.getElementById('scene').dataset.target!==old,target);
    await page.locator('#layers-button').click();await page.locator('#boundaries-toggle').check();
    assert.match(await page.locator('#map-status').textContent(),/Límits actuals/);
    await page.locator('#layers-panel [data-close-panel]').click();
    await page.locator('#year-jump').click();await page.locator('#year-input').fill('1697');await page.locator('#year-input').press('Enter');
    assert.equal(await page.locator('#year-display').textContent(),'1697');
    assert.equal(await button.getAttribute('aria-pressed'),'true');
    if(mobile){
      await page.setViewportSize({width:320,height:640});
      for(const id of ['viewer-fullscreen','play','previous','next']){
        const r=await page.locator('#'+id).boundingBox();
        assert.ok(r.x>=0&&r.y>=0&&r.x+r.width<=320&&r.y+r.height<=640,id+' remains accessible');
      }
      await page.screenshot({path:'/tmp/vilamajor-viewer-fullscreen-320.png',timeout:30000});
      await page.setViewportSize({width:390,height:844});
    }
    // A documentary opened from the interactive fullscreen viewer returns to it.
    await page.locator('#play').click();await page.locator('#map-stage.documentary').waitFor();
    await page.locator('#film-play').click();
    if(!mobile)assert.equal(await page.evaluate(()=>document.fullscreenElement?.id),'app');
    await page.locator('#film-exit').click();await page.locator('#map-stage:not(.documentary)').waitFor();
    assert.equal(await button.getAttribute('aria-pressed'),'true');
    assert.equal(await page.evaluate(()=>document.querySelector('.timeline').inert),false);
    await page.locator('#play').click();await page.locator('#map-stage.documentary').waitFor();
    await page.keyboard.press('Escape');await page.locator('#map-stage:not(.documentary)').waitFor();
    assert.equal(await button.getAttribute('aria-pressed'),'true','documentary Escape preserves viewer fullscreen');
    await button.click();await page.locator('#app:not(.viewer-fullscreen)').waitFor();
    assert.equal(await button.getAttribute('aria-pressed'),'false');
    assert.equal(await page.evaluate(()=>document.fullscreenElement),null);
    assert.equal(await page.evaluate(()=>document.activeElement.id),'viewer-fullscreen');
    // Synchronise native browser exits; fallback Escape closes a panel first.
    await button.click();await page.locator('#app.viewer-fullscreen').waitFor();
    if(mobile){
      await page.locator('#layers-button').click();await page.keyboard.press('Escape');
      assert.ok(await page.locator('#layers-panel').isHidden());
      assert.equal(await button.getAttribute('aria-pressed'),'true');
      await page.keyboard.press('Escape');
    }else{
      await page.waitForFunction(()=>document.fullscreenElement?.id==='app');
      await page.evaluate(()=>document.exitFullscreen());
    }
    await page.locator('#app:not(.viewer-fullscreen)').waitFor();
    assert.equal(await button.getAttribute('aria-pressed'),'false');
    // Rejected native requests remain usable and can be dismissed.
    await page.evaluate(()=>document.getElementById('app').requestFullscreen=()=>Promise.reject(new Error('Fullscreen denied')));
    await button.click();await page.locator('#app.viewer-fullscreen').waitFor();
    await page.keyboard.press('Escape');await page.locator('#app:not(.viewer-fullscreen)').waitFor();
    // The original standalone documentary still owns/exits native fullscreen.
    await page.locator('#play').click();await page.locator('#map-stage.documentary').waitFor();
    if(!mobile)await page.waitForFunction(()=>document.fullscreenElement?.id==='map-stage');
    await page.locator('#film-exit').click();await page.locator('#map-stage:not(.documentary)').waitFor();
    assert.equal(await button.getAttribute('aria-pressed'),'false');
    assert.equal(await page.evaluate(()=>document.fullscreenElement),null);
    await page.close();console.log(`PASS ${mobile?'mobile fallback':'desktop native'}: interactive controls, layout, fullscreen lifecycle and documentary transitions`);
  }
  assert.deepEqual(errors,[]);console.log('PASS zero JavaScript/shader errors');
}finally{await browser.close();}

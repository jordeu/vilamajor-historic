import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
const errors=[];
try{
  for(const mobile of process.argv.includes('--mobile-only')?[true]:[false,true]){
    const page=await browser.newPage({viewport:mobile?{width:390,height:844}:{width:1440,height:1000},isMobile:mobile,hasTouch:mobile,reducedMotion:'reduce'});
    page.setDefaultTimeout(90000);page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
    await page.goto('http://localhost:5173');await page.locator('#scene[data-resolution="0.25"]').waitFor();await page.locator('#play:enabled').waitFor();
    if(!mobile){
      const audit=await page.evaluate(async()=>{
        const THREE=await import('/node_modules/.vite/deps/three.js');
        const {historicalRoads}=await import('/src/historical-layout.ts');
        const {settlement}=await import('/src/landscape.ts');
        const {periodContext}=await import('/src/period-context.ts');
        const {createHeritage}=await import('/src/heritage.ts');
        const data=await(await fetch('/data/heritage.json')).json();
        const position=(e,n)=>new THREE.Vector3((e-449000)*.01,0,(4614000-n)*.01);
        const village=settlement(position),context=periodContext(position,village.entries),heritage=createHeritage(data,position);
        const violations=[],counts={houses:0,scenery:0,heritage:0};
        const cross=(a,b,p)=>(b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]);
        const inside=(p,t)=>{const values=t.map((a,i)=>cross(a,t[(i+1)%3],p));return values.every(x=>x>1e-8)||values.every(x=>x< -1e-8);};
        const pointDistance=(p,a,b)=>{const x=b[0]-a[0],y=b[1]-a[1],length=x*x+y*y,t=length?Math.max(0,Math.min(1,((p[0]-a[0])*x+(p[1]-a[1])*y)/length)):0;return Math.hypot(p[0]-a[0]-t*x,p[1]-a[1]-t*y);};
        const segmentDistance=(a,b,c,d)=>cross(a,b,c)*cross(a,b,d)<0&&cross(c,d,a)*cross(c,d,b)<0?0:Math.min(pointDistance(a,c,d),pointDistance(b,c,d),pointDistance(c,a,b),pointDistance(d,a,b));
        function check(root,kind,label){
          root.updateMatrixWorld(true);
          root.traverse(mesh=>{
            if(!mesh.isMesh||mesh.userData.role==='road')return;
            const positions=mesh.geometry.attributes.position,index=mesh.geometry.index,count=index?index.count:positions.count;
            for(let instance=0;instance<(mesh.isInstancedMesh?mesh.count:1);instance++){
              const matrix=mesh.matrixWorld.clone();if(mesh.isInstancedMesh){const local=new THREE.Matrix4();mesh.getMatrixAt(instance,local);matrix.multiply(local);}
              for(let i=0;i<count;i+=3){
                counts[kind]++;
                const triangle=[0,1,2].map(k=>{const p=new THREE.Vector3().fromBufferAttribute(positions,index?index.getX(i+k):i+k).applyMatrix4(matrix);return [449000+p.x*100,4614000-p.z*100];});
                const xs=triangle.map(p=>p[0]),ys=triangle.map(p=>p[1]),left=Math.min(...xs),right=Math.max(...xs),bottom=Math.min(...ys),top=Math.max(...ys);
                for(const road of historicalRoads)for(let j=1;j<road.points.length;j++){
                  const a=road.points[j-1],b=road.points[j],width=road.width/2+(kind==='houses'?1.49:kind==='scenery'?.59:0);
                  if(right<Math.min(a[0],b[0])-width||left>Math.max(a[0],b[0])+width||top<Math.min(a[1],b[1])-width||bottom>Math.max(a[1],b[1])+width)continue;
                  if(inside(a,triangle)||inside(b,triangle)||triangle.some((p,k)=>segmentDistance(p,triangle[(k+1)%3],a,b)<width)){
                    if(violations.length<10)violations.push({kind,label,instance,road:road.id,triangle});
                  }
                }
              }
            }
          });
        }
        check(village.root,'houses','86 houses, all dates');check(context.root,'scenery','all periods and materials');
        for(const item of heritage.objects)if(item.landmark.from<1850)check(item.group,'heritage',item.landmark.id);
        return {violations,counts};
      });
      assert.deepEqual(audit.violations,[],'Rendered geometry must leave both roads clear');
      assert.ok(audit.counts.houses>1000&&audit.counts.scenery>1000&&audit.counts.heritage>1000);console.log('PASS actual houses, scenery and every pre-1850 heritage variant:',audit.counts);
    }
    if(mobile){await page.locator('#history-button').click();await page.locator('[data-event="1697"]').click();}
    else{await page.locator('#year-jump').click();await page.locator('#year-input').fill('1697');await page.locator('#year-input').press('Enter');}
    await page.locator('#places-button').click();await page.locator('#focus-pere').click();await page.locator('#scene[data-moving="false"]').waitFor();
    await page.screenshot({path:`/tmp/vilamajor-roads-${mobile?'mobile':'desktop'}-pere.png`});
    await page.locator('#play').click();await page.locator('#film-play').click();await page.locator('#film-chapter').selectOption('8');await page.locator('#scene[data-moving="false"]').waitFor();
    assert.equal(await page.locator('#film-year').textContent(),'1697');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    await page.screenshot({path:`/tmp/vilamajor-roads-${mobile?'mobile':'desktop'}-vilanova.png`});
    assert.deepEqual(errors,[],'No JavaScript or shader errors');await page.close();console.log(`PASS ${mobile?'mobile':'desktop'} Sant Pere and Vilanova, 1697`);
  }
  assert.deepEqual(errors,[],'No JavaScript or shader errors');
}finally{await browser.close();}

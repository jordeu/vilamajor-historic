import {test} from 'node:test';
import assert from 'node:assert/strict';
import {comtalPath,comtalWidth,historicalRoads,createSettlementLayout,type GroundPoint,type HistoricalHouse} from '../src/historical-layout.ts';
import {clearsRoads} from '../src/ground-clearance.ts';
const houses=createSettlementLayout().filter(h=>h.place==='vilanova');
function corners(h:HistoricalHouse):GroundPoint[]{
  // The actual roof has a 30 cm overhang on every side.
  const c=Math.cos(h.angle),s=Math.sin(h.angle),w=h.w/2+.3,d=h.d/2+.3;
  return [[-w,-d],[w,-d],[w,d],[-w,d]].map(([x,z])=>[h.e+c*x+s*z,h.n+s*x-c*z]);
}
function pointDistance(p:GroundPoint,a:GroundPoint,b:GroundPoint){
  const dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy)));
  return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy);
}
function segmentDistance(a:GroundPoint,b:GroundPoint,c:GroundPoint,d:GroundPoint){
  const cross=(p:GroundPoint,q:GroundPoint,r:GroundPoint)=>(q[0]-p[0])*(r[1]-p[1])-(q[1]-p[1])*(r[0]-p[0]);
  if(cross(a,b,c)*cross(a,b,d)<0&&cross(c,d,a)*cross(c,d,b)<0)return 0;
  return Math.min(pointDistance(a,c,d),pointDistance(b,c,d),pointDistance(c,a,b),pointDistance(d,a,b));
}
test('all 46 Vilanova roofs leave a clear passage along the whole visible comtal road',()=>{
  for(const h of houses){
    const roof=corners(h);
    for(let i=1;i<comtalPath.length;i++)for(let j=0;j<4;j++){
      const distance=segmentDistance(roof[j],roof[(j+1)%4],comtalPath[i-1],comtalPath[i]);
      assert.ok(distance>=comtalWidth/2+1.5-1e-6,`Roof at ${h.e}, ${h.n} encroaches on the road: ${distance} m`);
    }
  }
});
test('opposite rows face the road, stay apart at its bend and preserve the dated house counts',()=>{
  assert.equal(houses.length,46);assert.equal(houses.filter(h=>h.side===1).length,23);assert.equal(houses.filter(h=>h.side===-1).length,23);
  for(const [year,count]of [[1208,0],[1209,10],[1521,22],[1697,46]])assert.equal(houses.filter(h=>h.from<=year).length,count);
  const roadDistance=(p:GroundPoint)=>Math.min(...comtalPath.slice(1).map((b,i)=>pointDistance(p,comtalPath[i],b)));
  for(const h of houses){
    const front:GroundPoint=[h.e+Math.sin(h.angle)*h.d/2,h.n-Math.cos(h.angle)*h.d/2];
    const rear:GroundPoint=[h.e-Math.sin(h.angle)*h.d/2,h.n+Math.cos(h.angle)*h.d/2];
    assert.ok(roadDistance(front)<roadDistance([h.e,h.n]));assert.ok(roadDistance(rear)>roadDistance([h.e,h.n]));
  }
  for(let i=0;i<houses.length;i++)for(let j=i+1;j<houses.length;j++){
    const a=corners(houses[i]),b=corners(houses[j]);
    for(let k=0;k<4;k++)for(let l=0;l<4;l++)assert.ok(segmentDistance(a[k],a[(k+1)%4],b[l],b[(l+1)%4])>.5,`Roofs ${i} and ${j} overlap or nearly touch`);
  }
});

test('all 86 historical houses leave both roads open in every period',()=>{
  const all=createSettlementLayout();assert.equal(all.length,86);
  for(const h of all)for(const road of historicalRoads){
    const roof=corners(h);
    for(let i=1;i<road.points.length;i++)for(let j=0;j<4;j++)assert.ok(segmentDistance(roof[j],roof[(j+1)%4],road.points[i-1],road.points[i])>=road.width/2+1.5-1e-6,`${h.place} house from ${h.from} blocks ${road.id}`);
  }
  for(let i=0;i<all.length;i++)for(let j=i+1;j<all.length;j++){
    const a=corners(all[i]),b=corners(all[j]);
    for(let k=0;k<4;k++)for(let l=0;l<4;l++)assert.ok(segmentDistance(a[k],a[(k+1)%4],b[l],b[(l+1)%4])>.5,`Relocated roofs ${i} and ${j} touch`);
  }
});
test('road reservation covers width, ends, bends and wholly enclosed road segments',()=>{
  const square:GroundPoint[]=[[0,0],[10,0],[10,10],[0,10]];
  const clear=(points:GroundPoint[],width=2,margin=0)=>clearsRoads(square,[{id:'test',points,width}],margin);
  assert.equal(clear([[-5,5],[15,5]]),false,'crossing');
  assert.equal(clear([[2,2],[8,8]]),false,'road wholly inside a large footprint');
  assert.equal(clear([[-5,0],[15,0]]),false,'collinear edge');
  assert.equal(clear([[-5,-.5],[15,-.5]]),false,'road edge reaches building');
  assert.equal(clear([[-5,5],[-.5,5]]),false,'end cap reaches building');
  assert.equal(clear([[-5,5],[-1,5],[-1,15]],2,.5),false,'bend and margin');
  assert.equal(clear([[-5,-3],[15,-3]],2,1),true,'clear passage with margin');
});

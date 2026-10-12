import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import {farmSettings,settingWorld} from '../src/farmstead-setting-data.ts';
import {createFarmsteadSetting,type SettingPalette} from '../src/farmstead-setting.ts';
import type {FarmsteadKind} from '../src/farmstead-data.ts';
import {clearsRoads,polygonsClear,type GroundPoint} from '../src/ground-clearance.ts';
import {historicalRoads} from '../src/historical-layout.ts';
import {tourShots,tourCameraPose} from '../src/tour.ts';
const parts=JSON.parse(readFileSync(new URL('../public/data/buildings.json',import.meta.url),'utf8')).parts;
test('gardens, tree trunks and dry-stone walls leave cadastral buildings and mapped roads clear',()=>{
 for(const kind of Object.keys(farmSettings) as FarmsteadKind[]){
  const c=farmSettings[kind],shapes:GroundPoint[][]=[];
  for(const p of c.plots)shapes.push([[p.x-p.width/2,p.z-p.depth/2],[p.x+p.width/2,p.z-p.depth/2],[p.x+p.width/2,p.z+p.depth/2],[p.x-p.width/2,p.z+p.depth/2]].map(([x,z])=>settingWorld(kind,x,z)));
  for(const t of c.trees)shapes.push([[-.4,-.4],[.4,-.4],[.4,.4],[-.4,.4]].map(([x,z])=>settingWorld(kind,t.x+x,t.z+z)));
  for(const line of c.walls)for(let i=1;i<line.length;i++){const a=line[i-1],b=line[i],len=Math.hypot(b[0]-a[0],b[1]-a[1]),x=-(b[1]-a[1])/len*.35,z=(b[0]-a[0])/len*.35;shapes.push([[a[0]+x,a[1]+z],[b[0]+x,b[1]+z],[b[0]-x,b[1]-z],[a[0]-x,a[1]-z]].map(([x,z])=>settingWorld(kind,x,z)));}
  for(const shape of shapes){
   assert.ok(clearsRoads(shape,historicalRoads,.5),kind+' road');
   const [e,n]=shape[0];for(const p of parts){const ring=p.polygons[0][0] as GroundPoint[];if(Math.hypot(ring[0][0]-e,ring[0][1]-n)>150)continue;assert.ok(polygonsClear(shape,ring,.1),kind+' scenery crosses '+p.id);}
  }
 }
});
test('rural scenery and dairy activity disappear reversibly in the modern landscape; vegetation toggle works',()=>{
 const names=['cream','yellow','white','brick','roof','stone','grey','dark','green','iron','wood','blue','earth','soil','leaves','leavesLight','leavesDark','grass'];
 const palette=Object.fromEntries(names.map(n=>[n,new THREE.MeshStandardMaterial()])) as SettingPalette;
 for(const kind of Object.keys(farmSettings) as FarmsteadKind[]){
  const s=createFarmsteadSetting(kind,palette,(x,z)=>x*.06-z*.1);
  for(const e of s.entries)s.root.add(e.object);
  s.update(1885);assert.ok(s.entries.find(e=>e.role==='rural')!.object.visible);
  if(kind==='llinars')assert.ok(s.entries.find(e=>e.role==='dairy')!.object.visible);
  s.update(2026);assert.equal(s.entries.find(e=>e.role==='rural')!.object.visible,false);
  s.update(1885,true,false);for(const e of s.entries.filter(e=>e.role==='tree'))assert.equal(e.object.visible,false);
  s.update(1700,true,true);for(const e of s.entries.filter(e=>e.role==='tree')){assert.ok(e.object.visible);const t=e.object.userData.tree,local=new THREE.Vector3(t.x,t.x*.06-t.z*.1,t.z);e.object.updateMatrix();assert.ok(local.clone().applyMatrix4(e.object.matrix).distanceTo(local)<1e-8,'scaled vegetation stays rooted');}
  s.update(1200);assert.equal(s.root.visible,false);
  s.root.traverse(o=>{if(o instanceof THREE.Mesh){for(const a of Object.values(o.geometry.attributes))assert.ok([...a.array].every(Number.isFinite));o.geometry.dispose();}});
 }
 Object.values(palette).forEach(m=>m.dispose());
});
test('estate camera is deterministic, holds its endpoints and respects reduced motion',()=>{
 for(const shot of tourShots.filter(s=>s.approach)){
  const start=tourCameraPose(shot,0),end=tourCameraPose(shot,1);assert.ok(start.span>end.span);
  assert.deepEqual(tourCameraPose(shot,.2),start);assert.deepEqual(tourCameraPose(shot,.95),end);
  for(const p of [0,.2,.5,.9,1])assert.deepEqual(tourCameraPose(shot,p,true),end);
  let previous=start.span;for(let p=0;p<=1;p+=.01){const pose=tourCameraPose(shot,p);assert.ok(pose.span<=previous+1e-8);previous=pose.span;assert.ok(pose.elevation>.4);}
  assert.deepEqual(tourCameraPose(shot,.5),tourCameraPose(shot,.5));
 }
});

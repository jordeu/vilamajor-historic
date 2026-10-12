import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {createFarmstead} from '../src/farmsteads.ts';
import {farmsteadData,farmsteadPhases,type FarmsteadKind} from '../src/farmstead-data.ts';
import {presentAt,type HeritageData} from '../src/heritage-data.ts';
import {tourShots,tourDuration} from '../src/tour.ts';
import {clearsRoads,type GroundPoint} from '../src/ground-clearance.ts';
import {historicalRoads} from '../src/historical-layout.ts';
const load=(name:string)=>JSON.parse(readFileSync(new URL('../public/data/'+name,import.meta.url),'utf8'));
const data=load('heritage.json') as HeritageData;
test('three farmsteads replace only their fourteen measured cadastral parts',()=>{
 const {parts}=load('buildings.json'),{ranges}=load('geometry.json');const ids=new Set();
 for(const [id,model]of Object.entries(farmsteadData)){
  const l=data.landmarks.find(l=>l.id===id)!;assert.deepEqual(l.position,model.position);assert.equal(l.rotation,model.rotation);assert.equal(l.cadastreId,undefined);
  assert.deepEqual(l.cadastrePartIds,model.parts.map(p=>p.id));
  for(const p of model.parts){
   assert.ok(!ids.has(p.id));ids.add(p.id);assert.ok(!ranges.some((r:{id:string})=>r.id===p.id));
   const source=parts.find((s:{id:string})=>s.id===p.id).polygons[0];
   assert.ok(clearsRoads(source[0] as GroundPoint[],historicalRoads,1),'leaves reconstructed paths open: '+p.id);
   p.rings.forEach((ring,ri)=>ring.forEach(([x,z],i)=>{
    const e=model.position[0]+Math.cos(model.rotation)*x+Math.sin(model.rotation)*z,n=model.position[1]+Math.sin(model.rotation)*x-Math.cos(model.rotation)*z;
    assert.ok(Math.hypot(e-source[ri][i][0],n-source[ri][i][1])<.002,p.id);
   }));
  }
 }
 assert.equal(ids.size,14);
 for(const id of ['001520900DG41F_part1','08234A00600152_part1','08234A00600152_part7','08234A00600152_part8','9452004DG4195S_part6','9452004DG4195S_part10'])assert.ok(ranges.some((r:{id:string})=>r.id===id),'unmodeled annexes remain: '+id);
});
test('all historical variants merge without losing roofs, respect height bounds and seat the forecourt on terrain',()=>{
 const names=['cream','yellow','white','brick','roof','stone','grey','dark','green','iron','wood','blue','earth'] as const;
 const palette=Object.fromEntries(names.map(n=>[n,new THREE.MeshStandardMaterial()])) as Parameters<typeof createFarmstead>[2];
 for(const kind of Object.keys(farmsteadData) as FarmsteadKind[])for(const year of farmsteadPhases[kind]){
  const root=createFarmstead(kind,year,palette,(x,z)=>.08*x-.13*z),bounds=new THREE.Box3().setFromObject(root),groups=new Map<THREE.Material,THREE.BufferGeometry[]>();
  assert.ok(bounds.max.y>11&&bounds.max.y<16,kind+' '+year);assert.ok(bounds.max.x-bounds.min.x<40&&bounds.max.z-bounds.min.z<45);
  root.updateMatrixWorld(true);let earthVertices=0;
  root.traverse(o=>{if(o instanceof THREE.Mesh){
   for(const attr of Object.values(o.geometry.attributes))assert.ok([...attr.array].every(Number.isFinite));
   if(o.material===palette.earth){const pos=o.geometry.getAttribute('position');for(let i=0;i<pos.count;i++){assert.ok(Math.abs(pos.getY(i)-(.08*pos.getX(i)-.13*pos.getZ(i)+.065))<1e-5);earthVertices++;}}
   const geo=o.geometry.clone().applyMatrix4(o.matrixWorld),gs=groups.get(o.material)??[];gs.push(geo.index?geo.toNonIndexed():geo);groups.set(o.material,gs);
  }});
  assert.ok(earthVertices>100);assert.ok(groups.has(palette.roof));
  for(const gs of groups.values()){const merged=mergeGeometries(gs,false);assert.ok(merged,kind+' '+year);merged.dispose();gs.forEach(g=>g.dispose());}
  root.traverse(o=>{if(o instanceof THREE.Mesh)o.geometry.dispose();});
 }
 Object.values(palette).forEach(m=>m.dispose());
});
test('documentary visits visible models and distinguishes first records from visual thresholds',()=>{
 for(const kind of Object.keys(farmsteadData) as FarmsteadKind[]){
  const l=data.landmarks.find(l=>l.id===kind)!;assert.equal(l.confidence,'interpreted');assert.equal(presentAt(l,1262),false);assert.equal(presentAt(l,l.from-1),false);assert.equal(presentAt(l,l.from),true);
  assert.deepEqual(l.phases?.map(p=>p.from),farmsteadPhases[kind]);assert.match(l.limitations,/llindar/);assert.ok(l.sources.length>=2);
  const shot=tourShots.find(s=>s.center[0]===l.position[0]&&s.center[1]===l.position[1]);assert.ok(shot);assert.ok(presentAt(l,shot.from));assert.ok(shot.evidence);
 }
 assert.equal(tourDuration,420); // Three twelve-second visits; modern flights and finale retain their duration.
});

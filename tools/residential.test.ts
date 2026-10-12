import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {createResidence,type ResidentialPalette} from '../src/residential.ts';
import {residentialData,type ResidentialKind} from '../src/residential-data.ts';
import {presentAt,type HeritageData} from '../src/heritage-data.ts';
import {tourShots} from '../src/tour.ts';
const load=(name:string)=>JSON.parse(readFileSync(new URL('../public/data/'+name,import.meta.url),'utf8'));
const data=load('heritage.json') as HeritageData;
test('five distinct houses preserve their cadastral vertices and replace only nine measured parts',()=>{
 const {parts}=load('buildings.json'),{ranges}=load('geometry.json');const assigned=new Set();
 for(const [id,model] of Object.entries(residentialData)){
  const landmark=data.landmarks.find(l=>l.id===id)!;assert.ok(landmark);assert.equal(landmark.kind,id);assert.deepEqual(landmark.position,model.position);assert.equal(landmark.rotation,model.rotation);
  for(const p of model.parts){
   assert.ok(!assigned.has(p.id));assigned.add(p.id);assert.ok(landmark.cadastrePartIds?.includes(p.id));assert.ok(!ranges.some((r:{id:string})=>r.id===p.id));
   const source=parts.find((r:{id:string})=>r.id===p.id).polygons[0];
   p.rings.forEach((ring,ri)=>ring.forEach(([x,z],i)=>{
    const e=model.position[0]+Math.cos(model.rotation)*x+Math.sin(model.rotation)*z;
    const n=model.position[1]+Math.sin(model.rotation)*x-Math.cos(model.rotation)*z;
    assert.ok(Math.hypot(e-source[ri][i][0],n-source[ri][i][1])<.002,p.id);
   }));
  }
 }
 assert.equal(assigned.size,9);
 for(const id of ['9251019DG4195S_part1','9251007DG4195S_part4','0137207DG5103N_part2'])assert.ok(ranges.some((r:{id:string})=>r.id===id),'neighbors and unmodeled annexes retained');
});
test('residential meshes are finite, merge-compatible, and keep each measured footprint scale',()=>{
 const names=['cream','yellow','white','brick','roof','stone','grey','dark','green','iron','wood','blue'] as const;
 const palette=Object.fromEntries(names.map(name=>[name,new THREE.MeshStandardMaterial()])) as ResidentialPalette;
 for(const kind of Object.keys(residentialData) as ResidentialKind[]){
  const root=createResidence(kind,palette),bounds=new THREE.Box3().setFromObject(root),geometries=new Map<THREE.Material,THREE.BufferGeometry[]>();
  assert.ok(bounds.max.y>=7&&bounds.max.y<15,kind+' has credible height');
  assert.ok(bounds.max.x-bounds.min.x<17&&bounds.max.z-bounds.min.z<17,kind+' stays at cadastral scale');
  root.traverse(o=>{if(o instanceof THREE.Mesh){
   for(const attr of Object.values(o.geometry.attributes))assert.ok([...attr.array].every(Number.isFinite));
   const list=geometries.get(o.material)??[];list.push(o.geometry.index?o.geometry.toNonIndexed():o.geometry);geometries.set(o.material,list);
  }});
  for(const gs of geometries.values()){const merged=mergeGeometries(gs,false);assert.ok(merged,kind+' renders all materials');merged.dispose();gs.forEach(g=>g.dispose());}
  root.traverse(o=>{if(o instanceof THREE.Mesh)o.geometry.dispose();});
 }
 Object.values(palette).forEach(m=>m.dispose());
});
test('modern facades do not appear in medieval scenes and uncertain dates remain explicit',()=>{
 for(const id of Object.keys(residentialData)){
  const l=data.landmarks.find(l=>l.id===id)!;assert.equal(presentAt(l,1800),false);assert.equal(presentAt(l,l.from-1),false);assert.equal(presentAt(l,l.from),true);
  if(l.from===1930)assert.match(l.limitations,/llindar/);
 }
 assert.equal(data.landmarks.find(l=>l.id==='gil-miret')!.from,1910);assert.equal(data.landmarks.find(l=>l.id==='auferil')!.from,1912);
 assert.ok(tourShots.some(s=>s.from===1910&&s.place.includes('Gil Miret')));assert.ok(tourShots.some(s=>s.from===1912&&s.place.includes('Auferil')));assert.ok(tourShots.some(s=>s.from===1930&&s.evidence?.includes('aproximat')));
});

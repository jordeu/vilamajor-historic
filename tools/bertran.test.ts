import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import {createBertran} from '../src/bertran.ts';
import {bertranFootprints,bertranPhases} from '../src/bertran-data.ts';
import {presentAt,type HeritageData} from '../src/heritage-data.ts';
import {tourShots} from '../src/tour.ts';
const load=(name:string)=>JSON.parse(readFileSync(new URL('../public/data/'+name,import.meta.url),'utf8'));
const landmark=(load('heritage.json') as HeritageData).landmarks.find(l=>l.id==='bertran')!;
test('Bertran parts georeference to DGC vertices within 2 mm and only those parts are replaced',()=>{
 const {parts}=load('buildings.json'),{ranges}=load('geometry.json');
 for(const footprint of bertranFootprints){
  const id=`0336002DG5103N_part${footprint.part}`;
  assert.ok(landmark.cadastrePartIds?.includes(id));assert.ok(!ranges.some((p:{id:string})=>p.id===id));
  const source=parts.find((p:{id:string})=>p.id===id).polygons[0][0];
  footprint.ring.forEach(([x,z],i)=>{
   const e=landmark.position[0]+Math.cos(landmark.rotation)*x+Math.sin(landmark.rotation)*z;
   const n=landmark.position[1]+Math.sin(landmark.rotation)*x-Math.cos(landmark.rotation)*z;
   assert.ok(Math.hypot(e-source[i][0],n-source[i][1])<.002);
  });
 }
 assert.ok(ranges.some((p:{id:string})=>p.id==='0336002DG5103N_part4'),'other estate buildings remain');
});
test('Bertran is not backdated to its legendary origin, and the ancient mas stays low',()=>{
 assert.equal(presentAt(landmark,1100),false);assert.equal(presentAt(landmark,1897),true);
 assert.deepEqual(landmark.phases?.map(p=>p.from),[...bertranPhases]);
 const material=new THREE.MeshStandardMaterial();
 const palette={plaster:material,brick:material,roof:material,stone:material,dark:material,wood:material,iron:material};
 const old=createBertran(1897,palette),modern=createBertran(1920,palette);
 const oldBounds=new THREE.Box3().setFromObject(old),modernBounds=new THREE.Box3().setFromObject(modern);
 assert.ok(oldBounds.max.y<8);assert.ok(modernBounds.max.y>13&&modernBounds.max.y<15);
 assert.ok(oldBounds.min.x>-11,'undocumented tower omitted before reform');
 assert.ok(modernBounds.min.x<-30,'separate tower included after reform');
 for(const model of [old,modern])model.traverse(o=>{if(o instanceof THREE.Mesh){assert.ok([...o.geometry.attributes.position.array].every(Number.isFinite));assert.ok(o.geometry.attributes.uv,'all parts remain merge-compatible');o.geometry.dispose();}});
 material.dispose();
 const shot=tourShots.find(s=>s.place.startsWith('Can Bertran'));assert.equal(shot?.from,1920);assert.ok(shot!.span<100);
});

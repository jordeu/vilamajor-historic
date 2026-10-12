import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import {elevationAt,terrainSurfaceAt,terrainAxes,type ElevationGrid,type Manifest} from '../src/geo.ts';
import {terrainFoundation,eliesFoundationOutline} from '../src/terrain-foundation.ts';
const load=(name:string)=>JSON.parse(readFileSync(new URL('../public/data/'+name,import.meta.url),'utf8'));
const manifest=load('manifest.json') as Manifest;
const read=(spec:Manifest['terrain']):ElevationGrid=>{const b=readFileSync(new URL('../public/data/'+spec.file,import.meta.url));return {spec,values:new Float32Array(b.buffer,b.byteOffset,b.byteLength/4)};};
const coarse=read(manifest.terrain),detail=read(manifest.terrainDetail),[east,north]=load('heritage.json').landmarks.find((l:{id:string})=>l.id==='elies').position;
test('Sant Elies and nearby trees anchor to independently raycast rendered triangles on desktop and mobile',()=>{
 const trees=load('vegetation.json').trees.filter(([e,n]:number[])=>Math.hypot(e-east,n-north)<160);
 assert.ok(trees.length>20);
 for(const stride of [2,4]){
  const spec=coarse.spec,vertices:number[]=[],axes=terrainAxes(spec,stride,[[east,north]]);
  // Reconstruct a patch of the visible mesh using its retained source vertices and index diagonal.
  const vertex=(c:number,r:number)=>{const e=spec.bbox[0]+c*spec.spacing,n=spec.bbox[3]-r*spec.spacing;return [e-east,elevationAt(coarse,detail,e,n),north-n];};
  for(let ri=0;ri<axes.rows.length-1;ri++)for(let ci=0;ci<axes.columns.length-1;ci++){
   const r=axes.rows[ri],c=axes.columns[ci],r1=axes.rows[ri+1],c1=axes.columns[ci+1];
   const a=vertex(c,r);if(Math.abs(a[0])>250||Math.abs(a[2])>250)continue;
   const b=vertex(c1,r),d=vertex(c,r1),f=vertex(c1,r1);vertices.push(...a,...d,...b,...b,...d,...f);
  }
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.computeVertexNormals();const material=new THREE.MeshBasicMaterial({side:THREE.DoubleSide}),mesh=new THREE.Mesh(geo,material),ray=new THREE.Raycaster();mesh.updateMatrixWorld();
  for(const [e,n]of [[east,north],...trees.map(([e,n]:number[])=>[e,n])]){
   ray.set(new THREE.Vector3(e-east,2000,north-n),new THREE.Vector3(0,-1,0));const hit=ray.intersectObject(mesh)[0];assert.ok(hit);
   assert.ok(Math.abs(terrainSurfaceAt(coarse,detail,e,n,stride,axes)-hit.point.y)<.0001,`stride ${stride} at ${e},${n}`);
  }
  assert.ok(elevationAt(coarse,detail,east,north)-terrainSurfaceAt(coarse,detail,east,north,stride)>6,'regression reproduces the former floating gap');
  assert.ok(Math.abs(elevationAt(coarse,detail,east,north)-terrainSurfaceAt(coarse,detail,east,north,stride,axes))<.5,'summit source detail is retained');
  geo.dispose();material.dispose();
 }
});
test('surface sampling handles both diagonals, outside coverage and partial cells at the grid boundary',()=>{
 const grid:ElevationGrid={spec:{file:'',bbox:[0,0,50,30],columns:6,rows:4,spacing:10,minimum:0,maximum:100,sourceResolution:10},values:new Float32Array(24)};
 for(let r=0;r<4;r++)for(let c=0;c<6;c++)grid.values[r*6+c]=c*2+r*3;
 for(const stride of [1,2,4])for(const [e,n]of [[0,0],[50,0],[0,30],[50,30],[49,1],[13,17]])assert.ok(Math.abs(terrainSurfaceAt(grid,grid,e,n,stride)-(e*.2+(30-n)*.3))<1e-8);
 assert.throws(()=>terrainSurfaceAt(grid,grid,51,1,2),RangeError);assert.throws(()=>terrainSurfaceAt(grid,grid,1,1,0),RangeError);
});
test('the Sant Elies plinth covers nave, annex and apse and reaches below the sloping surface',()=>{
 const material=new THREE.MeshBasicMaterial(),outline=eliesFoundationOutline(10,12);
 for(const stride of [2,4]){
  const axes=terrainAxes(coarse.spec,stride,[[east,north]]),base=terrainSurfaceAt(coarse,detail,east,north,stride,axes),ground=(x:number,z:number)=>terrainSurfaceAt(coarse,detail,east+x,north-z,stride,axes)-base;
  const mesh=terrainFoundation(outline,ground,material),p=mesh.geometry.getAttribute('position');let bottom=0;
  for(let i=0;i<p.count;i++)if(p.getY(i)<.049){assert.ok(p.getY(i)<=ground(p.getX(i),p.getZ(i))-.2999);bottom++;}
  assert.ok(bottom>80);mesh.geometry.computeBoundingBox();const bounds=mesh.geometry.boundingBox!;assert.ok(bounds.min.x<=-7&&bounds.min.z<=-9.5&&bounds.max.x>=5.25&&bounds.max.z>=6.25);
  for(const a of Object.values(mesh.geometry.attributes))assert.ok([...a.array].every(Number.isFinite));mesh.geometry.dispose();
 }
 material.dispose();
});

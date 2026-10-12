import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {sampleElevation,elevationAt,worldPosition,photoAt,cadastralVisible,type Manifest,type ElevationGrid,type BuildingPart} from '../src/geo.ts';
const directory=new URL('../public/data/',import.meta.url);
const load=(name:string)=>JSON.parse(readFileSync(new URL(name,directory),'utf8'));
const manifest=load('manifest.json') as Manifest;
const {parts}=load('buildings.json') as {parts:BuildingPart[]};
const grid=(spec:Manifest['terrain']):ElevationGrid=>{const bytes=readFileSync(new URL(spec.file,directory));return {spec,values:new Float32Array(bytes.buffer,bytes.byteOffset,bytes.byteLength/4)};};
const coarse=grid(manifest.terrain),detail=grid(manifest.terrainDetail);
test('real terrain covers both entire official municipalities',()=>{
 const boundaries=load('boundaries.json');assert.equal(boundaries.municipalities.length,2);
 for(const municipality of boundaries.municipalities)for(const polygon of municipality.polygons)for(const ring of polygon)for(const [e,n]of ring){assert.ok(e>=manifest.bbox[0]&&e<=manifest.bbox[2]&&n>=manifest.bbox[1]&&n<=manifest.bbox[3]);}
 assert.equal(manifest.crs,'EPSG:25831');assert.equal(detail.spec.spacing,5);assert.equal(coarse.spec.spacing,20);
});
test('DEM has complete finite samples and credible measured elevations',()=>{
 for(const g of [coarse,detail]){assert.equal(g.values.length,g.spec.columns*g.spec.rows);assert.ok(g.values.every(v=>Number.isFinite(v)&&v>100&&v<1800));}
 assert.ok(coarse.spec.maximum>1000);assert.ok(detail.spec.maximum<600);
});
test('bilinear interpolation uses north-to-south rows and handles all corners',()=>{
 const synthetic:ElevationGrid={spec:{file:'',bbox:[0,0,10,10],columns:2,rows:2,spacing:10,minimum:0,maximum:30,sourceResolution:10},values:new Float32Array([0,10,20,30])};
 assert.equal(sampleElevation(synthetic,0,10),0);assert.equal(sampleElevation(synthetic,10,0),30);assert.equal(sampleElevation(synthetic,5,5),15);assert.throws(()=>sampleElevation(synthetic,11,0),RangeError);
 assert.deepEqual(worldPosition(449510,4614480,230,[449500,4614500]),[.1,.3,.2]);
});
test('fine and regional data share a geographic frame at both town centres',()=>{
 for(const [e,n]of [[449096.73,4614889.24],[450158.13,4613702.96]]){
  const a=sampleElevation(coarse,e,n),b=elevationAt(coarse,detail,e,n);assert.ok(Math.abs(a-b)<8);assert.ok(b>200&&b<400);
 }
});
test('historical photo selection never silently shows future photography',()=>{
 assert.equal(photoAt(manifest,950),undefined);assert.equal(photoAt(manifest,1955),undefined);
 assert.equal(photoAt(manifest,1956),undefined);assert.equal(photoAt(manifest,1986),undefined);assert.equal(photoAt(manifest,2003),undefined);assert.equal(photoAt(manifest,2004)?.year,2004);assert.equal(photoAt(manifest,2026)?.year,2025);
 for(let year=2004;year<=2026;year++)assert.ok(photoAt(manifest,year)!.year<=year);
});
test('dated footprints grow only in the modern sequence and unknown dates remain current-only',()=>{
 assert.equal(cadastralVisible(1205,1209,true),false);assert.equal(cadastralVisible(null,2026,true),true);assert.equal(cadastralVisible(1970,1960,true),false);
 assert.equal(cadastralVisible(1970,1970,true),true);assert.equal(cadastralVisible(null,2000,true),false);assert.equal(cadastralVisible(null,2026,false),false);
});
test('cadastre retains real IDs, courtyards, floor counts and unknown years',()=>{
 assert.equal(manifest.counts.buildings,4598);assert.equal(manifest.counts.parcels,8330);assert.equal(manifest.counts.undated,47);
 assert.equal(parts.length,manifest.counts.parts);assert.ok(parts.some(p=>p.polygons.some(polygon=>polygon.length>1)));
 for(const p of parts){assert.match(p.buildingId,/^[0-9A-Z]{14}$/);assert.ok(p.floors===null||p.floors>=0);}
});
test('precompiled mesh ranges stay ordered, complete and linked to real parts',()=>{
 const geometry=load('geometry.json');const ids=new Set(parts.map(p=>p.id));let roof=0,wall=0,last=0;
 for(const p of geometry.ranges){assert.ok(ids.has(p.id));assert.ok((p.year??9999)>=last);last=p.year??9999;assert.equal(p.roofStart,roof);assert.equal(p.wallStart,wall);assert.equal(p.roofCount%3,0);assert.equal(p.wallCount%3,0);roof+=p.roofCount;wall+=p.wallCount;}
 assert.equal(gunzipSync(readFileSync(new URL(geometry.roofFile,directory))).byteLength,roof*geometry.stride*4);assert.equal(gunzipSync(readFileSync(new URL(geometry.wallFile,directory))).byteLength,wall*geometry.stride*4);
});
test('published source provenance includes original official responses and hashes',()=>{
 const {requests}=load('provenance.json');assert.ok(requests.length>=85);
 for(const request of requests){assert.ok(request.url.startsWith('https://geoserveis.icgc.cat/')||request.url.startsWith('https://www.catastro.hacienda.gob.es/'));assert.match(request.sha256,/^[a-f0-9]{64}$/);}
});
test('all generated assets match the reproducibility checksums',()=>{
 for(const entry of load('checksums.json')){const data=readFileSync(new URL(entry.file,directory));assert.equal(data.byteLength,entry.bytes);assert.equal(createHash('sha256').update(data).digest('hex'),entry.sha256,entry.file);}
});
test('town aerial detail retains the original photo years and native source resolution',()=>{
 const {photos}=load('microphotos.json');assert.deepEqual(photos.map((p:any)=>p.year),manifest.orthophotos.map(p=>p.year));
 for(const photo of photos){assert.equal(photo.areas.length,2);for(const area of photo.areas){assert.equal(area.metresPerPixel[0],photo.year===2025?.25:.5);assert.equal(area.width*area.metresPerPixel[0],area.bbox[2]-area.bbox[0]);assert.equal(area.height*area.metresPerPixel[1],area.bbox[3]-area.bbox[1]);assert.ok(area.whiteFraction<.05);}}
});

test('roof height and window storeys use each building foundation, with a four-storey visual limit',()=>{
 const geometry=load('geometry.json'),bytes=gunzipSync(readFileSync(new URL(geometry.roofFile,directory))),vertices=new Float32Array(bytes.buffer,bytes.byteOffset,bytes.byteLength/4);
 assert.equal(geometry.stride,10);
 let capped=0;
 for(const part of geometry.ranges){
  const i=part.roofStart*geometry.stride;
  assert.ok(part.renderedFloors>=1&&part.renderedFloors<=4);
  assert.equal(vertices[i+8],part.renderedFloors);assert.equal(vertices[i+7],part.year??2026);
  assert.ok(Math.abs((vertices[i+1]-vertices[i+6])*100-part.estimatedHeight)<.002);
  if(part.floors>4){capped++;assert.equal(part.renderedFloors,4);}
 }
 assert.ok(capped>0,'Retain raw exceptional source values while limiting the rendered height');
});

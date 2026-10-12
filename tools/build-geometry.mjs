/** Pre-triangulate real cadastral rings once, not on each visitor's device. */
import {readFile, writeFile} from 'node:fs/promises';
import {ShapeUtils, Vector2} from 'three';
import {gzipSync} from 'node:zlib';
const directory=new URL('../public/data/',import.meta.url);
const load=async name=>JSON.parse(await readFile(new URL(name,directory),'utf8'));
const manifest=await load('manifest.json');
const {parts}=await load('buildings.json');
const landmarks=(await load('heritage.json')).landmarks;
const landmarkIds=new Set(landmarks.map(l=>l.cadastreId).filter(Boolean));
const landmarkPartIds=new Set(landmarks.flatMap(l=>l.cadastrePartIds??[]));
const grids=await Promise.all([manifest.terrain,manifest.terrainDetail].map(async spec=>{
 const buffer=await readFile(new URL(spec.file,directory));return {spec,values:new Float32Array(buffer.buffer,buffer.byteOffset,buffer.byteLength/4)};
}));
function heightAt(e,n){const grid=grids.findLast(({spec})=>e>=spec.bbox[0]&&e<=spec.bbox[2]&&n>=spec.bbox[1]&&n<=spec.bbox[3]);if(!grid)throw Error('Footprint outside DEM');const {spec,values}=grid;const c=(e-spec.bbox[0])/spec.spacing,r=(spec.bbox[3]-n)/spec.spacing,c0=Math.floor(c),r0=Math.floor(r),c1=Math.min(c0+1,spec.columns-1),r1=Math.min(r0+1,spec.rows-1),tx=c-c0,ty=r-r0;return (values[r0*spec.columns+c0]*(1-tx)+values[r0*spec.columns+c1]*tx)*(1-ty)+(values[r1*spec.columns+c0]*(1-tx)+values[r1*spec.columns+c1]*tx)*ty;}
const world=(e,n,h)=>[(e-manifest.origin[0])*.01,(h-200)*.01,(manifest.origin[1]-n)*.01];
const roofs=[],walls=[],ranges=[];
const STRIDE=10;
const append=(array,position,normal,base,birth,floors,u=0)=>array.push(...position,...normal,base,birth,floors,u);
const triple=(a,b,c)=>{const u=b.map((v,i)=>v-a[i]),v=c.map((v,i)=>v-a[i]),normal=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],length=Math.hypot(...normal);return length?normal.map(n=>n/length):[0,1,0];};
parts.sort((a,b)=>(a.year??9999)-(b.year??9999)||a.id.localeCompare(b.id));
for(const part of parts){
 if(part.floors===0||landmarkIds.has(part.buildingId)||landmarkPartIds.has(part.id))continue;
 const roofStart=roofs.length/STRIDE,wallStart=walls.length/STRIDE;
 const renderedFloors=Math.min(4,Math.max(1,part.floors??1)), estimatedHeight=2.8*renderedFloors;
 let maximum=0;
 for(const polygon of part.polygons){
  const rings=polygon.map(r=>r.slice(0,-1).map(p=>new Vector2(p[0],p[1])));
  if(rings[0].length<3)continue;
  const elevations=polygon[0].slice(0,-1).map(([e,n])=>heightAt(e,n)).sort((a,b)=>a-b);
  const baseElevation=elevations[Math.floor(elevations.length/2)],top=baseElevation+estimatedHeight,base=(baseElevation-200)*.01,birth=part.year??2026;
  maximum=Math.max(maximum,top);
  const flat=rings.flat(),faces=ShapeUtils.triangulateShape(rings[0],rings.slice(1));
  for(const face of faces){const p=face.map(i=>world(flat[i].x,flat[i].y,top));let normal=triple(...p);if(normal[1]<0){[p[1],p[2]]=[p[2],p[1]];normal=triple(...p);}for(const v of p)append(roofs,v,normal,base,birth,renderedFloors);}
  for(const ring of polygon){
   for(let i=0;i<ring.length-1;i++){
    const [e0,n0]=ring[i],[e1,n1]=ring[i+1];
    const a=world(e0,n0,heightAt(e0,n0)-.25),b=world(e1,n1,heightAt(e1,n1)-.25),c=world(e1,n1,top),d=world(e0,n0,top);
    for(const tri of [[a,b,c],[a,c,d]]){const normal=triple(...tri);for(const v of tri)append(walls,v,normal,base,birth,renderedFloors,(v===b||v===c)?Math.hypot(e1-e0,n1-n0):0);}
   }
  }
 }
 if(roofs.length/STRIDE>roofStart)ranges.push({id:part.id,buildingId:part.buildingId,municipality:part.municipality,year:part.year,floors:part.floors,renderedFloors,estimatedHeight:Math.round(estimatedHeight*10)/10,topElevation:Math.round(maximum*10)/10,roofStart,roofCount:roofs.length/STRIDE-roofStart,wallStart,wallCount:walls.length/STRIDE-wallStart});
}
for(const [name,values] of [['building-roofs.bin',roofs],['building-walls.bin',walls]]){const array=new Float32Array(values);await writeFile(new URL(name+'.gz',directory),gzipSync(Buffer.from(array.buffer),{level:9}));}
await writeFile(new URL('geometry.json',directory),JSON.stringify({stride:STRIDE,encoding:'gzip float32-le: position(3),normal(3),baseY,birthYear,renderedFloors,facadeU; world scale .01, altitude baseline 200m',origin:manifest.origin,roofFile:'building-roofs.bin.gz',wallFile:'building-walls.bin.gz',ranges}));
console.log(`Prepared ${ranges.length} building parts; ${(roofs.length+walls.length)/(3*STRIDE)} triangles`);

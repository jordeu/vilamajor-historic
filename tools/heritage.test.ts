import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {presentAt,towerPhase,type HeritageData} from '../src/heritage-data.ts';
import {smoothStep5} from '../src/camera-motion.ts';
const data=JSON.parse(readFileSync(new URL('../public/data/heritage.json',import.meta.url),'utf8')) as HeritageData;
const byId=(id:string)=>data.landmarks.find(l=>l.id===id)!;
test('successive Sant Pere models never overlap and leave no invented finished church during works',()=>{
 for(let year=872;year<=2026;year++){
  const phases=['orila','romanica','obres-pere','pere'].filter(id=>presentAt(byId(id),year));assert.equal(phases.length,1,String(year));
 }
 assert.equal(presentAt(byId('torre'),950),false);assert.equal(presentAt(byId('torre'),1050),true);
});
test('relocated and rebuilt churches cannot appear centuries early',()=>{
 assert.equal(presentAt(byId('susanna'),1190),false);assert.equal(presentAt(byId('susanna'),1683),true);
 assert.equal(presentAt(byId('antoni'),1789),false);assert.equal(presentAt(byId('antoni'),1948),false);assert.equal(presentAt(byId('antoni'),1949),true);
});
test('tower alterations use different dates for widened north and south openings and attested plaster',()=>{
 assert.deepEqual(towerPhase(1150),{southWide:false,northWide:false,plastered:false});
 assert.deepEqual(towerPhase(1700),{southWide:true,northWide:false,plastered:false});
 assert.equal(towerPhase(1900).plastered,true);assert.equal(towerPhase(1932).plastered,false);
});
test('every reconstruction is sourced, georeferenced, and explicit about uncertainty',()=>{
 const ids=new Set();for(const l of data.landmarks){assert.ok(!ids.has(l.id));ids.add(l.id);assert.ok(l.sources.length);assert.ok(l.sources.every(s=>s.url.startsWith('https://')));assert.ok(l.limitations.length>40);assert.ok(l.position[0]>445500&&l.position[0]<453500);assert.ok(l.position[1]>4609000&&l.position[1]<4624500);}
 assert.deepEqual(byId('torre').dimensions,[6,25,6]);assert.equal(byId('orila').confidence,'hypothesis');
});
test('custom monuments replace cadastral extrusions instead of rendering two overlapping models',()=>{
 const mesh=JSON.parse(readFileSync(new URL('../public/data/geometry.json',import.meta.url),'utf8'));const replaced=new Set(data.landmarks.map(l=>l.cadastreId).filter(Boolean));
 for(const p of mesh.ranges)assert.ok(!replaced.has(p.buildingId));
});
test('camera interpolation starts and finishes gently and never overshoots',()=>{
 assert.equal(smoothStep5(0),0);assert.equal(smoothStep5(1),1);let previous=0;
 for(let i=0;i<=100;i++){const n=smoothStep5(i/100);assert.ok(n>=previous&&n<=1);previous=n;}
 assert.ok(smoothStep5(.001)<.000001);assert.ok(1-smoothStep5(.999)<.000001);
});

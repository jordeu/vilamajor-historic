/** Rebuild the measured local footprints; all heights and activation years are interpretations. */
import fs from 'node:fs';
const {parts}=JSON.parse(fs.readFileSync(new URL('../public/data/buildings.json',import.meta.url)));
const specifications={
 'gol-torre':{position:[449038.97,4612958.823],rotation:Math.atan2(-.445,15.27),building:'002010700DG41D',selected:[[1,3.5,1600],[4,9.1,1600],[5,6.3,1600],[2,3.5,2023],[3,3.2,2023]]},
 derrocada:{position:[449359.5,4614891.52],rotation:Math.atan2(7.36,16.21),building:'9452004DG4195S',selected:[[7,11.2,1700],[2,5.7,1936],[3,6,1936],[4,3.6,1936],[5,3.6,1936]]},
 llinars:{position:[448972.855,4615794.38],rotation:Math.atan2(4.92,15.75),building:'08234A00600152',selected:[[4,10.8,1700],[2,3.8,2016],[6,3.8,2016],[3,3.4,2016]]}
};
const models={};
for(const [kind,{position,rotation,building,selected}]of Object.entries(specifications)){
 const c=Math.cos(rotation),s=Math.sin(rotation),round=n=>Math.round(n*1000)/1000;
 models[kind]={position,rotation,parts:selected.map(([number,height,from])=>{
  const id=`${building}_part${number}`,p=parts.find(p=>p.id===id);if(!p||p.polygons.length!==1)throw Error('Unexpected cadastral geometry: '+id);
  return {id,from,height,rings:p.polygons[0].map(r=>r.map(([e,n])=>[round(c*(e-position[0])+s*(n-position[1])),round(s*(e-position[0])-c*(n-position[1]))]))};
 })};
}
fs.writeFileSync(new URL('../src/farmstead-data.ts',import.meta.url),'/** Measured DGC INSPIRE footprints in local metres; heights and historical thresholds are interpretations. See research/farmstead-models.md. */\nexport const farmsteadData = '+JSON.stringify(models,null,2)+' as const;\nexport type FarmsteadKind=keyof typeof farmsteadData;\nexport const farmsteadPhases:Record<FarmsteadKind,number[]>={"gol-torre":[1600,2023],derrocada:[1700,1936],llinars:[1700,1885,2016]};\n');

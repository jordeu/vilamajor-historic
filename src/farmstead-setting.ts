import * as THREE from 'three';
import {farmSettings} from './farmstead-setting-data.ts';
import {farmsteadData,type FarmsteadKind} from './farmstead-data.ts';
import type {ResidentialPalette} from './residential.ts';
export type SettingPalette=ResidentialPalette&Record<'earth'|'soil'|'leaves'|'leavesLight'|'leavesDark'|'grass',THREE.Material>;
type Role='common'|'rural'|'modern'|'tree'|'dairy';
/** Terrain-following, bounded scenery. Movable objects/planting history are explicitly invented. */
export function createFarmsteadSetting(kind:FarmsteadKind,m:SettingPalette,ground:(x:number,z:number)=>number){
 const config=farmSettings[kind],root=new THREE.Group();root.name=`Entorn de ${kind}`;
 const entries:{object:THREE.Group;role:Role}[]=[];
 let seed=kind==='gol-torre'?187:kind==='llinars'?211:239;
 const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 function group(role:Role){const object=new THREE.Group();object.name=role;entries.push({object,role});return object;}
 const common=group('common'),rural=group('rural'),modern=group('modern');
 function mesh(g:THREE.Group,geo:THREE.BufferGeometry,mat:THREE.Material,x=0,y=0,z=0){const o=new THREE.Mesh(geo,mat);o.position.set(x,y,z);g.add(o);return o;}
 function box(g:THREE.Group,w:number,h:number,d:number,x:number,y:number,z:number,mat:THREE.Material){return mesh(g,new THREE.BoxGeometry(w,h,d),mat,x,y,z);}
 function branch(g:THREE.Group,a:THREE.Vector3,b:THREE.Vector3,r:number){const o=mesh(g,new THREE.CylinderGeometry(r*.4,r,a.distanceTo(b),7),m.wood);o.position.copy(a).add(b).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),b.clone().sub(a).normalize());}
 function surface(g:THREE.Group,points:number[][],mat:THREE.Material,alpha:number[]){
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(points.flatMap(([x,z])=>[x,ground(x,z)+.085,z]),3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(points.flat(),2));geo.setAttribute('color',new THREE.Float32BufferAttribute(points.flatMap((_,i)=>[1,1,1,alpha[i]]),4));geo.computeVertexNormals();mesh(g,geo,mat);
 }
 // A foot/cart access leaves the doorway and stays clear of the surrounding cadastral bodies.
 const access=new THREE.CatmullRomCurve3(config.path.map(([x,z])=>new THREE.Vector3(x,0,z))),samples=access.getPoints(64),half=kind==='gol-torre'?2.15:1.35;
 for(let i=0;i<samples.length-1;i++)for(let strip=0;strip<4;strip++){
  const d0=(strip/2-1)*half,d1=((strip+1)/2-1)*half;
  const p=(j:number,d:number)=>{const t=access.getTangent(j/64),v=samples[j];return [v.x-t.z*d,v.z+t.x*d];};
  const aa=strip===0?0:.65,bb=strip===3?0:.65,fade=(j:number)=>Math.min(1,(64-j)/5);
  surface(common,[p(i,d0),p(i+1,d1),p(i+1,d0),p(i,d0),p(i,d1),p(i+1,d1)],m.earth,[aa*fade(i),bb*fade(i+1),aa*fade(i+1),aa*fade(i),bb*fade(i),bb*fade(i+1)]);
 }
 for(const plot of config.plots){
  const {x,z,width:w,depth:d}=plot;
  const p=[[x-w/2,z-d/2],[x-w/2,z+d/2],[x+w/2,z+d/2],[x-w/2,z-d/2],[x+w/2,z+d/2],[x+w/2,z-d/2]];
  surface(rural,p,m.soil,[.9,.9,.9,.9,.9,.9]);surface(modern,p,m.grass,[.3,.3,.3,.3,.3,.3]);
  for(let xx=x-w/2+.65;xx<x+w/2;xx+=1.15){
   for(let zz=z-d/2+.5;zz<z+d/2;zz+=.9){
    const stalk=mesh(rural,new THREE.SphereGeometry(.21,6,4),rand()>.45?m.leaves:m.leavesLight,xx+(rand()-.5)*.15,ground(xx,zz)+.16,zz);stalk.scale.set(1,.6,1.3);
   }
  }
 }
 // Dry-stone boundaries are scenic, discontinuous and outside the access reservation.
 for(const wall of config.walls)for(let i=1;i<wall.length;i++){
  const a=wall[i-1],b=wall[i],len=Math.hypot(b[0]-a[0],b[1]-a[1]),count=Math.ceil(len/.75);
  for(let j=0;j<count;j++)for(let row=0;row<3;row++){
   const t=Math.min(1,(j+.45+(row%2)*.3)/count),x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;
   const stone=box(common,.7+rand()*.13,.27+rand()*.06,.48,x,ground(x,z)+.16+row*.25,z,m.stone);stone.rotation.y=-Math.atan2(b[1]-a[1],b[0]-a[0])+(rand()-.5)*.16;
  }
 }
 for(const t of config.trees){
  const g=group('tree');g.userData.tree=t;const base=ground(t.x,t.z),height=t.height,r=t.radius;
  branch(g,new THREE.Vector3(t.x,base-.15,t.z),new THREE.Vector3(t.x+.15,base+height*.72,t.z),t.form==='cypress'?.18:.3);
  if(t.form==='cypress'){
   const profile=[[0,.08],[.4,.12],[.85,.27],[1,.5],[.8,.7],[.5,.85],[.15,.96],[0,1]].map(([rr,yy])=>new THREE.Vector2(rr*r,yy*height));
   const geo=new THREE.LatheGeometry(profile,16),p=geo.getAttribute('position');
   for(let v=0;v<p.count;v++){const x=p.getX(v),y=p.getY(v),z=p.getZ(v),f=1+.06*Math.sin(x*9+y*4+z*11);p.setXYZ(v,x*f,y,z*f);}geo.computeVertexNormals();
   mesh(g,geo,m.leavesDark,t.x,base,t.z);
  }else{
   for(let j=0;j<15;j++){
    const a=j*2.39996,spread=r*Math.sqrt((j+.5)/15)*.73,x=t.x+Math.cos(a)*spread,z=t.z+Math.sin(a)*spread,y=base+height*.69+(rand()-.3)*r*.65;
    if(j%3===0)branch(g,new THREE.Vector3(t.x,base+height*.36,t.z),new THREE.Vector3(x,y,z),.12);
    const geo=new THREE.SphereGeometry(1,9,7),p=geo.getAttribute('position');for(let v=0;v<p.count;v++){const x=p.getX(v),y=p.getY(v),z=p.getZ(v),f=1+.09*Math.sin(x*12+y*7+z*9);p.setXYZ(v,x*f,y*f,z*f);}geo.computeVertexNormals();
    const crown=mesh(g,geo,j%4===0?m.leavesLight:j%3===0?m.leavesDark:m.leaves,x,y,z);crown.scale.set(r*.48,r*.4,r*.46);
   }
  }
 }
 // Small work areas stay beside entrances, leaving the central access free.
 const workX=kind==='derrocada'?5:kind==='llinars'?4.8:-9,workZ=kind==='derrocada'?3:3.8;
 for(let i=0;i<3;i++){
  const x=workX+i*.65,z=workZ,y=ground(x,z),barrel=mesh(rural,new THREE.CylinderGeometry(.25,.28,.78,12),m.wood,x,y+.39,z);
  for(const h of [.14,.65])mesh(rural,new THREE.TorusGeometry(.27,.02,5,16),m.iron,x,y+h,z).rotation.x=Math.PI/2;barrel.rotation.y=i*.2;
 }
 if(kind==='gol-torre'){
  // Trough suggested by the contemporary front photograph; shown only with the current phase.
  const x=-12,z=2,y=ground(x,z);for(const dx of [-.9,.9])box(modern,.2,.65,.8,x+dx,y+.32,z,m.stone);for(const dz of [-.35,.35])box(modern,1.9,.65,.18,x,y+.32,z+dz,m.stone);box(modern,1.8,.12,.6,x,y+.12,z,m.dark);
 }
 const cartZ=kind==='derrocada'?3:6,cart=new THREE.Group();cart.position.set(-5.6,ground(-5.6,cartZ),cartZ);cart.rotation.y=.3;rural.add(cart);
 box(cart,1.35,.18,2.15,0,.83,0,m.wood);
 for(const x of [-.66,.66]){box(cart,.09,.55,2.2,x,1.15,0,m.wood);mesh(cart,new THREE.TorusGeometry(.51,.055,6,16),m.wood,x*1.2,.52,.4).rotation.y=Math.PI/2;for(let i=0;i<8;i++){const a=i*Math.PI/4;branch(cart,new THREE.Vector3(x*1.2,.52,.4),new THREE.Vector3(x*1.2,.52+Math.sin(a)*.49,.4+Math.cos(a)*.49),.025);}}
 for(const x of [-.5,.5])box(cart,.075,.075,2.6,x,.68,2.1,m.wood);
 if(kind==='llinars'){
  const dairy=group('dairy');
  for(let i=0;i<6;i++){const x=3.1+i*.48,z=1.1,y=ground(x,z);mesh(dairy,new THREE.CylinderGeometry(.18,.23,.68,10),m.grey,x,y+.34,z);mesh(dairy,new THREE.CylinderGeometry(.12,.18,.14,10),m.grey,x,y+.75,z);mesh(dairy,new THREE.CylinderGeometry(.15,.15,.04,10),m.iron,x,y+.83,z);}
 }
 function update(year:number,enabled=true,vegetation=true){
  root.visible=enabled&&year>=farmsteadData[kind].parts[0].from;
  for(const entry of entries){entry.object.visible=entry.role==='tree'?vegetation:entry.role==='rural'?year<config.ruralUntil:entry.role==='modern'?year>=config.ruralUntil:entry.role==='dairy'?year>=1885&&year<1956:true;
   if(entry.role==='tree'){const t=entry.object.userData.tree;const size=.78+.22*Math.max(0,Math.min(1,(year-farmsteadData[kind].parts[0].from)/280));entry.object.scale.setScalar(size);entry.object.position.set(t.x*(1-size),ground(t.x,t.z)*(1-size),t.z*(1-size));}}
  // The current trough is photographic evidence, unlike the older scenic planting.
  if(kind==='gol-torre')modern.children.forEach(o=>{if(o instanceof THREE.Mesh&&o.material!==m.grass)o.visible=year>=config.currentFrom;});
 }
 return {root,entries,update};
}

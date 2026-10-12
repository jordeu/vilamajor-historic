import * as THREE from 'three';
import {farmsteadData,type FarmsteadKind} from './farmstead-data.ts';
import type {ResidentialPalette} from './residential.ts';

type Ring=readonly (readonly number[])[];
/** Original exterior interpretations in metres. A terrain sampler seats the rural context. */
export function createFarmstead(kind:FarmsteadKind,year:number,m:ResidentialPalette&{earth:THREE.Material},ground:(x:number,z:number)=>number=()=>0){
 const root=new THREE.Group();root.name=kind;
 const plaster=kind==='gol-torre'?m.white:m.cream;
 function mesh(g:THREE.Group,geo:THREE.BufferGeometry,mat:THREE.Material,x=0,y=0,z=0){const o=new THREE.Mesh(geo,mat);o.position.set(x,y,z);g.add(o);return o;}
 function box(g:THREE.Group,w:number,h:number,d:number,x:number,y:number,z:number,mat=plaster){return mesh(g,new THREE.BoxGeometry(w,h,d),mat,x,y,z);}
 function tube(g:THREE.Group,pts:number[][],mat=m.stone,r=.045){const path=new THREE.CatmullRomCurve3(pts.map(p=>new THREE.Vector3(p[0],p[1],p[2])));return mesh(g,new THREE.TubeGeometry(path,Math.max(8,pts.length*4),r,5,false),mat);}
 function triangles(g:THREE.Group,points:number[][],mat:THREE.Material){const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(points.flat(),3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(points.length*2),2));geo.computeVertexNormals();return mesh(g,geo,mat);}
 function body(rings:readonly Ring[],height:number|((x:number)=>number),mat=plaster){
  const shape=new THREE.Shape(rings[0].map(([x,z])=>new THREE.Vector2(x,-z)));
  for(const ring of rings.slice(1))shape.holes.push(new THREE.Path(ring.map(([x,z])=>new THREE.Vector2(x,-z))));
  const geo=new THREE.ExtrudeGeometry(shape,{depth:1,bevelEnabled:false});geo.rotateX(-Math.PI/2);
  const p=geo.getAttribute('position');for(let i=0;i<p.count;i++)p.setY(i,p.getY(i)>.5?(typeof height==='number'?height:height(p.getX(i))):-2.5);geo.computeVertexNormals();mesh(root,geo,mat);
 }
 const golHeight=(x:number)=>x<0?11.8+(11.8-3.5)*x/13.8:11.8-(11.8-8.6)*x/8.57;
 for(const p of farmsteadData[kind].parts){
  if(year<p.from)continue;
  // Galleries have real open space under their terraces/roofs, not opaque volumes.
  if(kind==='llinars'&&(p.id.endsWith('_part6')||p.id.endsWith('_part3')))continue;
  const gallery=kind==='derrocada'&&(p.id.endsWith('_part4')||p.id.endsWith('_part5'));
  body(p.rings,kind==='gol-torre'&&p.from===1600?golHeight:gallery?2.8:p.height,gallery?m.stone:plaster);
 }
 function opening(g:THREE.Group,x:number,y:number,z:number,w:number,h:number,round=false,fill=m.dark,frame=m.stone){
  const s=new THREE.Shape();s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(w/2,round?h-w/2:h);if(round)s.absarc(0,h-w/2,w/2,0,Math.PI,false);else s.lineTo(-w/2,h);s.closePath();
  mesh(g,new THREE.ShapeGeometry(s,20),fill,x,y,z+.015);
  for(const side of [-1,1])box(g,.24,round?h-w/2:h,.17,x+side*(w/2+.12),y+(round?h-w/2:h)/2,z+.07,frame);
  if(round){
   const rad=w/2+.16,cy=y+h-w/2;
   for(let i=0;i<13;i++){const a=(i+.5)*Math.PI/13;const stone=box(g,.34,.29,.22,x+Math.cos(a)*rad,cy+Math.sin(a)*rad,z+.11,frame);stone.rotation.z=a-Math.PI/2;}
  }else{box(g,w+.55,.28,.21,x,y+h+.14,z+.08,frame);box(g,w+.55,.2,.32,x,y-.1,z+.12,frame);}
 }
 function window(g:THREE.Group,x:number,y:number,z:number,w=1.1,h=1.55,shut=false){
  opening(g,x,y,z,w,h,false,shut?m.wood:m.dark);
  if(!shut){box(g,.055,h,.065,x,y+h/2,z+.06,m.wood);box(g,w,.06,.065,x,y+h*.45,z+.06,m.wood);}
  else for(let xx=-w/2+.12;xx<w/2;xx+=.22)box(g,.025,h,.04,x+xx,y+h/2,z+.05,m.dark);
 }
 function bars(g:THREE.Group,x:number,y:number,z:number,w:number,h:number){for(let xx=-w/2+.1;xx<w/2;xx+=.18)box(g,.028,h,.05,x+xx,y+h/2,z+.15,m.iron);for(const yy of [.12,h-.12])box(g,w,.035,.06,x,y+yy,z+.15,m.iron);}
 function hip(corners:number[][],y:number,rise:number){
  // Four measured corner points, clockwise from the south-west eave; short central ridge.
  const [a,b,c,d]=corners.map(([x,z])=>[x,y,z]);const cx=(a[0]+b[0]+c[0]+d[0])/4,cz=(a[2]+b[2]+c[2]+d[2])/4;
  const r1=[cx,y+rise,cz+1.6],r2=[cx,y+rise,cz-1.6];
  triangles(root,[a,b,r1,b,c,r2,b,r2,r1,c,d,r2,d,a,r1,d,r1,r2],m.roof);tube(root,[r1,r2],m.roof,.14);
  for(const [u,v]of [[a,r1],[b,r1],[c,r2],[d,r2]])tube(root,[u,v],m.roof,.12);
  for(let i=0;i<4;i++){const u=corners[i],v=corners[(i+1)%4],length=Math.hypot(v[0]-u[0],v[1]-u[1]);tube(root,[[u[0],y-.15,u[1]],[v[0],y-.15,v[1]]],m.brick,.11);for(let t=0;t<length;t+=.4){const f=t/length;box(root,.17,.18,.22,u[0]+(v[0]-u[0])*f,y-.28,u[1]+(v[1]-u[1])*f,m.stone);}}
 }
 function shed(x:number,z:number,w:number,d:number,y:number,rise=.9){
  triangles(root,[[x-w/2,y,z-d/2],[x-w/2,y,z+d/2],[x,y+rise,z+d/2],[x-w/2,y,z-d/2],[x,y+rise,z+d/2],[x,y+rise,z-d/2],[x+w/2,y,z-d/2],[x,y+rise,z-d/2],[x,y+rise,z+d/2],[x+w/2,y,z-d/2],[x,y+rise,z+d/2],[x+w/2,y,z+d/2]],m.roof);
  for(const zz of [z-d/2,z+d/2])triangles(root,[[x-w/2,y,zz],[x+w/2,y,zz],[x,y+rise,zz]],plaster);
  tube(root,[[x,y+rise,z-d/2],[x,y+rise,z+d/2]],m.roof,.12);
 }
 function quoins(x:number,z:number,height:number){for(let y=.3;y<height;y+=.53)box(root,y%1.06<.53?.65:.43,.34,.2,x,y,z+.055,m.stone);}
 function rail(g:THREE.Group,x:number,y:number,z:number,w:number,stone=false){
  box(g,w,.18,.22,x,y+1,z,m.stone);box(g,w,.12,.24,x,y+.1,z,m.stone);
  for(let xx=-w/2+.15;xx<w/2;xx+=stone?.32:.22){if(stone){mesh(g,new THREE.CylinderGeometry(.065,.07,.85,6),m.stone,x+xx,y+.55,z);mesh(g,new THREE.SphereGeometry(.11,6,5),m.stone,x+xx,y+.4,z);}else box(g,.033,.88,.033,x+xx,y+.54,z,m.iron);}
 }
 function sundial(g:THREE.Group,x:number,y:number,z:number){
  box(g,1.35,1.65,.045,x,y+.8,z,m.yellow);box(g,1.21,1.51,.025,x,y+.8,z+.03,m.cream);
  for(let i=0;i<9;i++){const a=(i/8)*Math.PI; tube(g,[[x,y+1.35,z+.055],[x+Math.cos(a)*.48,y+1.35-Math.sin(a)*.94,z+.055]],m.brick,.012);}
  tube(g,[[x,y+1.33,z+.06],[x,y+.8,z+.6]],m.iron,.027);
 }
 function chimney(x:number,z:number,y:number,octagonal=false){
  if(octagonal){mesh(root,new THREE.CylinderGeometry(.48,.6,2.2,8),m.stone,x,y+1.1,z);mesh(root,new THREE.CylinderGeometry(.65,.65,.22,8),m.stone,x,y+2.3,z);}
  else{box(root,.8,1.5,.85,x,y+.75,z,m.brick);for(const dx of [-.27,0,.27])box(root,.12,.4,.7,x+dx,y+1.7,z,m.stone);box(root,1.03,.18,1.05,x,y+1.95,z,m.roof);}
 }
 if(kind==='gol-torre'){
  const a=[-14.05,golHeight(-13.8),.35],b=[8.85,8.6,.35],c=[-14.05,golHeight(-13.8),-16.6],d=[8.85,8.6,-16.6],r=[0,11.85,.35],s=[0,11.85,-16.6];
  triangles(root,[a,r,s,a,s,c,r,b,d,r,d,s],m.roof);tube(root,[r,s],m.roof,.14);
  opening(root,1,.08,.035,2.05,3.25,true,m.wood);bars(root,1,.1,.045,1.8,2.65);
  opening(root,-10.9,.05,.06,1.4,2.45,true,m.wood,m.brick);
  for(const x of [-6.2,6.4]){window(root,x,1.1,.04,1.1,1.65,true);bars(root,x,1.1,.05,1.2,1.65);}
  window(root,6.2,4.7,.035,1.3,1.65,true);window(root,.7,9,.035,1,1.3,true);window(root,6.15,8.15,.035,1.1,1.1,true);
  for(const [x,y,w]of [[1,4.65,1.35],[-6.2,4.6,1.15]]){
   window(root,x,y,.05,w,1.8); // Paired lobed tracery and carved bosses.
   for(const side of [-1,1])tube(root,[[x+side*w/2,y+1.7,.27],[x+side*w*.38,y+2.06,.27],[x+side*w*.17,y+2.05,.27],[x,y+2.27,.27]],m.stone,.095);
   box(root,.13,1.73,.15,x,y+.85,.18,m.stone);
   for(const side of [-1,1])mesh(root,new THREE.SphereGeometry(.12,8,6),m.stone,x+side*(w/2+.12),y+1.93,.27);
  }
  // Quoins mark the tower embedded in the later house, without inventing a freestanding tower.
  for(const x of [-.1,3.6,8.5])quoins(x,.04,x===-.1?10.6:8.3);
  for(const x of [3.8,7])opening(root,x,8.25,.075,.16,.45,false,m.dark,m.brick);
  sundial(root,-3.25,6.35,.1);chimney(1,-12,10.9);
  if(year>=2023){shed(10.8,-5.9,4.95,12.5,3.5,.65);opening(root,10.8,.1,.05,3.5,2.8,true,m.wood,m.brick);shed(5,-17.7,10.5,4.7,3.2,.65);}
 }else if(kind==='derrocada'){
  hip([[-9.3,.38],[10.25,.38],[12.35,-20.55],[-7.3,-22.85]],11.2,3.5);chimney(-5,-6,12.8,true);
  opening(root,-.4,.1,.06,2.65,3.65,true,m.wood);
  for(const [x,w]of [[-6,1.25],[-.4,1.65],[5.8,1.25]]){window(root,x,4.6,.07,w,2.45);window(root,x,8.9,.07,1.15,1.3);}
  for(const x of [-6,5.8]){window(root,x,1.05,.07,1.1,1.85,true);bars(root,x,1.05,.08,1.1,1.85);}
  box(root,3.3,.25,1.05,-.4,4.45,.6,m.stone);rail(root,-.4,4.57,1.1,3.2);
  for(const x of [-8.6,9.45])quoins(x,.06,10.9);
  for(const side of [-1,1]){
   const f=new THREE.Group();f.position.set(side<0?-8:10.9,0,-11);f.rotation.y=side*Math.PI/2+.09;root.add(f);
   for(const x of [-6,0,6])for(const y of [4.6,8.9])window(f,x,y,0,1.1,y>8?1.3:2.1);
  }
  if(year>=1936){
   shed(12.4,-5.8,5.35,11.9,5.7,.7);shed(17.4,-15.3,13.6,10.8,6,1.25);
   // Open upper gallery photographed by Gallardo (1912–1936), along the south-east wing.
   for(const z of [1.1,5.5,10,14.5])box(root,.4,3.45,.4,8.2,4.55,z,m.stone);
   triangles(root,[[7.8,6.4,-.6],[7.8,6.4,15.1],[14.2,5.2,15.1],[7.8,6.4,-.6],[14.2,5.2,15.1],[14.2,5.2,-.6]],m.roof);
   box(root,.35,2.2,14.5,13.3,3.8,7.5,m.stone);
  }
 }else{
  hip([[-8.65,.4],[8.65,.4],[8.65,-17.4],[-8.65,-17.4]],10.8,2.65);chimney(-1,-8.5,12.55);chimney(6.6,-2.8,11.2,true);
  opening(root,0,.1,.045,2.3,3.25,true,m.wood);
  for(const x of [-5.15,5.15]){window(root,x,.85,.06,1.25,1.8);bars(root,x,.85,.07,1.25,1.8);}
  for(const x of [-5.15,0,5.15]){window(root,x,4.45,.06,1.45,2.25);window(root,x,8.2,.06,1,1.25);}
  sundial(root,2.75,4.8,.11);for(const x of [-8,8])quoins(x,.04,10.4);
  // The small projecting defensive box is visible in the 1924 photograph; dimensions interpreted.
  box(root,1.7,1.75,1.05,-8,4.7,.56,m.stone);opening(root,-8,4.3,1.1,.13,.68,false,m.dark);
  for(const side of [-1,1]){
   const f=new THREE.Group();f.position.set(side*8.26,0,-8.5);f.rotation.y=side*Math.PI/2;root.add(f);
   for(const x of [-5.3,0,5.3])for(const y of [4.5,8.2])window(f,x,y,.02,1,y>8?1.25:1.9);
  }
  if(year>=2016){
   box(root,2.35,.22,17,9.44,3.8,-8.5,m.stone);
   for(let z=-16.6;z<=0;z+=4.1){box(root,.42,3.75,.42,10.4,1.87,z,m.stone);}
   // Side arcade soffits have real cut-outs; the front opening remains transparent.
   function arcade(g:THREE.Group,w:number,z:number){const spring=Math.min(2.15,3.6-w/2),s=new THREE.Shape();s.moveTo(-w/2,spring);s.lineTo(-w/2,3.75);s.lineTo(w/2,3.75);s.lineTo(w/2,spring);s.absarc(0,spring,w/2,0,Math.PI,false);s.closePath();mesh(g,new THREE.ExtrudeGeometry(s,{depth:.3,bevelEnabled:false}),plaster,0,0,z);}
   const side=new THREE.Group();side.position.set(10.55,0,-8.5);side.rotation.y=Math.PI/2;root.add(side);
   for(const x of [-6.15,-2.05,2.05,6.15]){const g=new THREE.Group();g.position.x=x;side.add(g);arcade(g,3.7,0);}rail(side,0,3.9,.1,16.8,true);
   const front=new THREE.Group();front.position.set(9.44,0,.02);root.add(front);for(const x of [-1,1])box(front,.35,3.75,.4,x,1.87,0);arcade(front,1.75,0);rail(front,0,3.9,.13,2.35,true);
   // West porch / terrace, only within its measured cadastral footprint.
   for(const x of [-13.25,-8.25])for(const z of [.35,9.65])box(root,.4,3.3,.4,x,1.65,z,m.stone);
   box(root,5.3,.24,9.9,-10.8,3.4,5,m.stone);rail(root,-10.8,3.55,9.8,5.3,true);
   box(root,20.8,.22,4.5,2.3,3.8,-19.35,m.stone);
  }
 }
 // A small terrain-following forecourt. Its treatment and movable props are explicitly decorative.
 const eraWidth=kind==='gol-torre'?22:kind==='derrocada'?15:15;
 for(let x=-eraWidth/2;x<eraWidth/2;x+=1.5)for(let z=.45;z<9.45;z+=1.5){
  const x2=Math.min(eraWidth/2,x+1.5),z2=z+1.5,p=(xx:number,zz:number)=>[xx,ground(xx,zz)+.065,zz];
  const points=[p(x,z),p(x2,z2),p(x2,z),p(x,z),p(x,z2),p(x2,z2)],patch=triangles(root,points,m.earth);
  // Feather the edge into the terrain; no rectangular slab and no level platform on a slope.
  patch.geometry.setAttribute('color',new THREE.Float32BufferAttribute(points.flatMap(([xx,,zz])=>{
   const edge=Math.min(eraWidth/2-Math.abs(xx),zz-.45,9.45-zz),tone=.95+.05*Math.sin(xx*1.3+zz*.7);
   return [tone,tone,tone,Math.max(0,Math.min(.76,edge/2))];
  }),4));
 }
 return root;
}

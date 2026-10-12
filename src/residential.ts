import * as THREE from 'three';
import {residentialData,type ResidentialKind} from './residential-data.ts';

export type ResidentialPalette=Record<'cream'|'yellow'|'white'|'brick'|'roof'|'stone'|'grey'|'dark'|'green'|'iron'|'wood'|'blue',THREE.Material>;
/** Original exterior interpretations, in metres. No third-party images are embedded. */
export function createResidence(kind:ResidentialKind,m:ResidentialPalette){
 const root=new THREE.Group();root.name=kind;
 const plaster=kind==='auferil'?m.yellow:kind==='gil-miret'?m.grey:kind==='miquel-cortes'?m.cream:m.white;
 function mesh(g:THREE.Group,geo:THREE.BufferGeometry,mat:THREE.Material,x=0,y=0,z=0){const o=new THREE.Mesh(geo,mat);o.position.set(x,y,z);g.add(o);return o;}
 function box(g:THREE.Group,w:number,h:number,d:number,x:number,y:number,z:number,mat=plaster){return mesh(g,new THREE.BoxGeometry(w,h,d),mat,x,y,z);}
 function line(g:THREE.Group,pts:number[][],mat:THREE.Material,r=.035){
  const path=new THREE.CatmullRomCurve3(pts.map(p=>new THREE.Vector3(...p as [number,number,number])));
  return mesh(g,new THREE.TubeGeometry(path,Math.max(8,pts.length*4),r,5,false),mat);
 }
 function body(rings:readonly (readonly (readonly number[])[])[],height:number){
  const shape=new THREE.Shape(rings[0].map(([x,z])=>new THREE.Vector2(x,-z)));
  for(const ring of rings.slice(1))shape.holes.push(new THREE.Path(ring.map(([x,z])=>new THREE.Vector2(x,-z))));
  const geo=new THREE.ExtrudeGeometry(shape,{depth:height+2,bevelEnabled:false});geo.rotateX(-Math.PI/2);mesh(root,geo,plaster,0,-2);
 }
 for(const p of residentialData[kind].parts)body(p.rings,p.height);
 function shape(w:number,h:number,style:'point'|'round'|'raspall'|'rect'='rect'){
  const s=new THREE.Shape();s.moveTo(-w/2,0);s.lineTo(w/2,0);
  if(style==='point'){s.lineTo(w/2,h*.52);s.quadraticCurveTo(w*.42,h*.82,0,h);s.quadraticCurveTo(-w*.42,h*.82,-w/2,h*.52);}
  else if(style==='round'){s.lineTo(w/2,h-w/2);s.absarc(0,h-w/2,w/2,0,Math.PI,false);}
  else if(style==='raspall'){s.lineTo(w/2,h);s.bezierCurveTo(0,h,-w/2,h*.86,-w/2,h*.58);}
  else{s.lineTo(w/2,h);s.lineTo(-w/2,h);}s.closePath();return s;
 }
 function window(g:THREE.Group,x:number,y:number,z:number,w:number,h:number,style:'point'|'round'|'raspall'|'rect'='rect',frame=m.white,fill=m.dark){
  const s=shape(w+.28,h+.28,style);s.holes.push(new THREE.Path(shape(w,h,style).getPoints(24).map(p=>new THREE.Vector2(p.x,p.y+.14))));
  mesh(g,new THREE.ExtrudeGeometry(s,{depth:.14,bevelEnabled:false,curveSegments:16}),frame,x,y-.14,z+.02);
  mesh(g,new THREE.ShapeGeometry(shape(w,h,style),20),fill,x,y,z+.025);
  box(g,.055,h*(style==='point'?.7:.95),.06,x,y+h*.46,z+.09,m.wood);
 }
 function shutters(g:THREE.Group,x:number,y:number,z:number,w:number,h:number){
  for(const side of [-1,1]){
   box(g,w*.44,h,.08,x+side*w*.24,y+h/2,z+.075,m.green);
   for(let yy=.12;yy<h;yy+=.17)box(g,w*.39,.025,.055,x+side*w*.24,y+yy,z+.13,m.dark);
  }
 }
 function rail(g:THREE.Group,x:number,y:number,z:number,w:number,depth=.75,curved=false){
  box(g,w,.16,depth,x,y,z+depth/2,m.stone);
  const front=z+depth;
  line(g,[[x-w/2,y+1,front],[x,y+1.06,front+(curved?.2:0)],[x+w/2,y+1,front]],m.iron);
  for(let xx=-w/2;xx<=w/2+.01;xx+=.28){
   line(g,[[x+xx,y+.13,front],[x+xx+(curved?.1:0),y+.5,front+(curved?.17:0)],[x+xx,y+1,front]],m.iron,.025);
  }
  for(const side of [-1,1])line(g,[[x+side*w/2,y+1,z],[x+side*w/2,y+1,front]],m.iron);
  if(curved)for(const side of [-1,1]){
   const pts=Array.from({length:25},(_,i)=>{const t=i/24*Math.PI*2.2,r=.36*(1-i/30);return [x+side*(w/2-.4)+Math.cos(t)*r,y+.65+Math.sin(t)*r,front+.23];});line(g,pts,m.iron,.035);
  }
 }
 function roof(g:THREE.Group,x:number,z:number,w:number,d:number,y:number,rise:number,across=false){
  const rg=new THREE.Group();rg.position.set(x,y,z);if(across)rg.rotation.y=Math.PI/2;g.add(rg);
  const width=across?d:w,depth=across?w:d;
  const a=[-width/2,0,-depth/2],b=[-width/2,0,depth/2],c=[width/2,0,-depth/2],e=[width/2,0,depth/2],top=[0,rise,-depth/2],end=[0,rise,depth/2];
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute([a,b,end,a,end,top,c,top,end,c,end,e].flat(),3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(24),2));geo.computeVertexNormals();mesh(rg,geo,m.roof);
  for(const zz of [-depth/2,depth/2-.1]){const s=new THREE.Shape();s.moveTo(-width/2,0);s.lineTo(width/2,0);s.lineTo(0,rise);s.closePath();mesh(rg,new THREE.ExtrudeGeometry(s,{depth:.1,bevelEnabled:false}),plaster,0,0,zz);}
  box(rg,.18,.16,depth,0,rise,0,m.roof);
  for(const side of [-1,1]){box(rg,.14,.15,depth,side*width/2,0,0,m.brick);for(let zz=-depth/2;zz<depth/2;zz+=.32)mesh(rg,new THREE.CylinderGeometry(.09,.09,.3,6),m.roof,side*(width/2-.06),.025,zz).rotation.z=Math.PI/2;}
 }
 function flower(g:THREE.Group,x:number,y:number,z:number){
  for(let i=0;i<5;i++){const a=i*Math.PI*2/5;mesh(g,new THREE.SphereGeometry(.09,6,4),m.brick,x+Math.cos(a)*.12,y+Math.sin(a)*.12,z);}
  mesh(g,new THREE.SphereGeometry(.055,6,4),m.cream,x,y,z+.045);
 }
 function floralLintel(g:THREE.Group,x:number,y:number,z:number,w:number){
  line(g,[[x-w/2-.1,y-.1,z],[x-w/2,y+.3,z],[x-.25,y+.33,z],[x,y+.6,z],[x+.25,y+.33,z],[x+w/2,y+.3,z],[x+w/2+.1,y-.1,z]],m.white,.07);flower(g,x,y+.3,z+.04);
 }
 function parapet(g:THREE.Group,w:number,y:number,z:number){
  const s=new THREE.Shape();s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(w/2,.8);s.bezierCurveTo(w*.4,1.1,w*.25,-.1,0,1);s.bezierCurveTo(-w*.25,-.1,-w*.4,1.1,-w/2,.8);s.closePath();mesh(g,new THREE.ExtrudeGeometry(s,{depth:.2,bevelEnabled:false}),plaster,0,y,z);
 }
 if(kind==='auferil'){
  // The projecting central porch is lower than the house despite a shared cadastral part.
  box(root,7.12,5.7,5.35,.72,6.25,-1.95);
  roof(root,.72,-1.95,7.35,5.6,9.1,1.15,true);
  roof(root,6.05,-1.95,3.75,5.5,9.1,.75);
  roof(root,-5.22,-1.7,5.2,5.3,13.1,.45);
  const front=new THREE.Group();front.position.z=.81;root.add(front);
  for(const x of [-5.2,6.05]){
   window(front,x,.3,0,1.45,2.5,'point',m.brick,m.green);shutters(front,x,.35,0,1.35,1.5);
   window(front,x,4.8,0,1.55,3.05,'point',m.brick,m.green);shutters(front,x,4.85,0,1.4,1.75);
  }
  for(const x of [-1.8,-.52,.76,2.04,3.32])window(front,x,7.35,0,.9,1.3,'point',m.brick);
  for(const [x,w] of [[-1.6,.9],[2.15,1.9]]){window(front,x,3.7,0,w,2.3,'point',m.brick,m.green);shutters(front,x,3.75,0,w-.1,1.1);}
  for(const x of [-6.35,-5.22,-4.09])window(front,x,11.4,0,.86,1.1,'point',m.brick);
  function stepped(g:THREE.Group,x:number,y:number,z:number,w:number){
   for(const side of [-1,1])for(let i=0;i<4;i++){
    const xx=x+side*(w/2-i*w/9),yy=y+i*.42;
    box(g,w/5,.5,.2,xx,yy,z,m.brick);box(g,w/5+.06,.12,.24,xx,yy+.27,z,m.green);
   }
  }
  for(const x of [-5.2,6.05]){stepped(front,x,7.1,0,1.75);stepped(front,x,2.15,0,1.7);}
  stepped(front,-1.6,5.4,0,1.1);stepped(front,2.15,5.4,0,2.05);
  // Brick merlons with green ceramic caps, on all four tower edges.
  for(let face=0;face<4;face++){
   const f=new THREE.Group();f.position.set(-5.22,0,-1.7);f.rotation.y=face*Math.PI/2;root.add(f);
   box(f,4.9,.6,.28,0,13.65,2.45,m.brick);
   for(const x of [-2.25,-.75,.75,2.25]){box(f,.55,.55,.42,x,14.12,2.45,m.brick);box(f,.62,.14,.49,x,14.44,2.45,m.green);}
   if(face)for(const x of [-1.2,0,1.2])window(f,x,11.4,2.51,.8,1.1,'point',m.brick);
  }
  stepped(front,6.05,9.15,0,2.7);
  // The porch sits within its measured projection; ironwork lines the terrace.
  for(const x of [-2,1,3.55]){window(root,x,.1,5.36,x===1?2.1:1.2,2.65,'round',m.brick,m.green);shutters(root,x,.15,5.36,x===1?1.95:1.05,2.05);}
  box(root,7.15,.17,4.5,.72,3.45,3.1,m.brick);rail(root,.72,3.52,4.6,6.8,.72,true);
  for(const x of [-2.75,4.2])box(root,.34,3.4,.32,x,1.7,5.2,m.brick);
 }else if(kind==='gil-miret'){
  roof(root,.5,-.15,4.65,14.05,9.1,1.1,true);
  const f=new THREE.Group();f.position.z=7.025;root.add(f);
  // Irregular stone facing and a tessellated mosaic band, authored geometrically.
  for(let row=0;row<5;row++)for(let col=0;col<6;col++){
   const x=-2.24+col*.75+(row%2)*.12,y=3.8+row*.55;
   const s=new THREE.Shape([new THREE.Vector2(0,.08),new THREE.Vector2(.61,0),new THREE.Vector2(.69,.4),new THREE.Vector2(.27,.52),new THREE.Vector2(.04,.36)]);
   mesh(f,new THREE.ShapeGeometry(s),m.stone,x,y,.012);
  }
  box(f,4.5,.34,.13,0,6.7,.01,m.white);
  for(let i=0;i<35;i++){
   const x=-2.2+i*.127;const s=new THREE.Shape([new THREE.Vector2(0,0),new THREE.Vector2(.12,.04),new THREE.Vector2(.07,.24)]);
   mesh(f,new THREE.ShapeGeometry(s),i%3===0?m.blue:i%3===1?m.green:m.white,x,6.56,.09);
  }
  window(f,-.65,.08,0,2.55,3.1,'raspall',m.brick,m.wood);
  window(f,1.48,.05,0,1.05,3.1,'raspall',m.brick,m.wood);
  for(let x=-1.8;x<.7;x+=.38)box(f,.045,2.2,.055,x,1.3,.11,m.cream);
  for(let y=.4;y<2.5;y+=.38)box(f,2.45,.035,.055,-.65,y,.11,m.cream);
  window(f,0,3.8,0,1.65,2.65,'raspall',m.cream,m.wood);
  // Leaded glass fanlight: colored leaves and branching leading.
  for(let i=0;i<5;i++){
   const leaf=mesh(f,new THREE.SphereGeometry(.12,7,5),i%2?m.green:m.brick,-.57+i*.27,5.8+Math.sin(i)*.1,.08);leaf.scale.set(1,.48,.12);
  }
  line(f,[[-.7,5.75,.1],[0,6.04,.1],[.7,6.12,.1]],m.iron,.025);
  rail(f,0,3.65,0,3.7,.9,true);
  box(f,3.7,.3,.95,0,3.5,.5,m.white);
  for(let i=0;i<25;i++)box(f,.08,.15,.015,-1.75+i*.145,3.52,.985,i%3?m.stone:m.green);
  for(const x of [-.58,.58])window(f,x,7.25,0,1.05,1.15,'raspall',m.cream);
  box(f,4.55,.25,.22,0,9.12,0,m.cream);
  for(const x of [-2.1,2.1]){box(f,.4,.9,.5,x,9.55,0,m.cream);box(f,.6,.15,.6,x,10.03,0,m.stone);}
  for(const x of [-1.45,0,1.45])flower(f,x,8.95,.17);
 }else if(kind==='miquel-cortes'){
  const f=new THREE.Group();f.position.z=3.09;root.add(f);
  box(root,5.9,.18,3.2,-.2,7.3,1.45,m.roof);
  for(const z of [-.22,2.9])parapet(root,5.9,7.4,z);
  box(f,5.9,.3,.3,-.2,7.28,0,m.brick);
  window(f,-.1,.05,0,2,2.8,'rect',m.white,m.green);
  for(const [x,w] of [[-2.1,.85],[-.2,1.25],[1.75,.85]]){window(f,x,4.1,0,w,1.75,'rect',m.white,m.wood);floralLintel(f,x,5.95,.22,w);}
  rail(f,-.2,3.95,0,2.4,.72,true);
  const side=new THREE.Group();side.position.set(2.83,0,-.15);side.rotation.y=Math.PI/2;root.add(side);
  for(const x of [-1.75,1.6]){window(side,x,1.1,0,1,2,'rect',m.white,m.green);window(side,x,4.5,0,1,1.8,'round',m.white);}
  box(side,6.3,.3,.32,0,7.3,0,m.brick);parapet(side,6.3,7.45,0);
 }else if(kind==='dalia'){
  roof(root,0,0,5.65,13.75,9.1,.85,true);
  const f=new THREE.Group();f.position.z=6.885;root.add(f);
  window(f,.7,.05,0,1.15,2.5,'rect',m.stone,m.wood);
  for(const y of [3.2,6.3]){
   window(f,.7,y,0,1.3,2.3,'rect',m.stone,m.wood);rail(f,0,y-.05,0,5.1,.8);
   for(const x of [-2.2,2.2])box(f,.12,2.4,.12,x,y+1.2,0,m.white);
  }
  // Shallow curved crown with a circular oculus, distinct from the other houses.
  const s=new THREE.Shape();s.moveTo(-2.78,0);s.lineTo(2.78,0);s.lineTo(2.78,.6);s.lineTo(1,.6);s.lineTo(1,.83);s.quadraticCurveTo(0,1.45,-1,.83);s.lineTo(-1,.6);s.lineTo(-2.78,.6);s.closePath();
  mesh(f,new THREE.ExtrudeGeometry(s,{depth:.22,bevelEnabled:false}),m.white,0,9.1,0);
  mesh(f,new THREE.CircleGeometry(.25,24),m.blue,0,9.72,.23);mesh(f,new THREE.TorusGeometry(.28,.045,6,24),m.stone,0,9.72,.24);
  box(f,5.6,.14,.2,0,9.1,.1,m.stone);
 }else{
  roof(root,-.1,0,3.65,7.2,9.2,.95);
  const f=new THREE.Group();f.position.z=3.565;root.add(f);
  for(const x of [-2.65,-.15,2.42]){window(f,x,.05,0,1.15,2.6,'rect',m.stone,m.green);window(f,x,3.45,0,1.12,2.35,'rect',m.stone,m.green);shutters(f,x,3.48,0,1.05,2.25);floralLintel(f,x,5.9,.2,1.12);}
  rail(f,-.15,3.32,0,6.7,.6);
  window(f,-.1,7.3,0,1,1.55,'round',m.stone,m.green);
  for(const x of [-2.7,2.5]){
   box(f,1.7,.13,.22,x,7.5,0,m.white);
   for(let xx=-.68;xx<.8;xx+=.26)box(f,.07,.6,.12,x+xx,7.16,0,m.white);
   box(f,1.7,.12,.22,x,6.8,0,m.stone);
  }
  for(const [x,y] of [[-1.87,9.18],[0,10.25],[1.72,9.18]])box(f,.21,.4,.3,x,y,0,m.white);
  line(f,[[-1.87,9.3,.17],[-.1,10.18,.17],[1.72,9.3,.17]],m.white,.09);
 }
 return root;
}

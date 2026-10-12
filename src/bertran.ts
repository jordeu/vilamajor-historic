import * as THREE from 'three';
import {bertranFootprints} from './bertran-data.ts';

type Palette = Record<'plaster'|'brick'|'roof'|'stone'|'dark'|'wood'|'iron', THREE.Material>;
/** Original geometry interpreted from Gallardo's 1897 photograph and Esteves's 2023 views.
 * Metres, local +Z faces the era; the eight replaced cadastral parts retain their footprints.
 * Heights and hidden elevations are estimates, not a measured architectural survey.
 */
export function createBertran(year:number, m:Palette) {
  const root=new THREE.Group();root.name=year<1920?'Can Bertran · mas de 1897':'Can Bertran · reforma';
  function mesh(g:THREE.Group,geometry:THREE.BufferGeometry,material:THREE.Material,x=0,y=0,z=0){
    const o=new THREE.Mesh(geometry,material);o.position.set(x,y,z);g.add(o);return o;
  }
  function box(g:THREE.Group,w:number,h:number,d:number,x:number,y:number,z:number,mat=m.plaster){return mesh(g,new THREE.BoxGeometry(w,h,d),mat,x,y,z);}
  function body(part:number,h:number){
    const ring=bertranFootprints.find(f=>f.part===part)!.ring;
    const shape=new THREE.Shape(ring.map(([x,z])=>new THREE.Vector2(x,-z)));
    const geo=new THREE.ExtrudeGeometry(shape,{depth:h+.65,bevelEnabled:false});geo.rotateX(-Math.PI/2);
    return mesh(root,geo,m.plaster,0,-.65);
  }
  function archShape(w:number,h:number){
    const s=new THREE.Shape();s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(w/2,h-w/2);s.absarc(0,h-w/2,w/2,0,Math.PI,false);s.closePath();return s;
  }
  // Openings are recessed in projecting brick surrounds, with actual curved reveals.
  function opening(g:THREE.Group,x:number,y:number,z:number,w:number,h:number,trim=.18,mat=m.dark){
    const shape=archShape(w+trim*2,h+trim*2);const hole=new THREE.Path(archShape(w,h).getPoints(24).map(p=>new THREE.Vector2(p.x,p.y+trim)));shape.holes.push(hole);
    mesh(g,new THREE.ExtrudeGeometry(shape,{depth:.18,bevelEnabled:false,curveSegments:16}),m.brick,x,y-trim,z+.02);
    mesh(g,new THREE.ShapeGeometry(archShape(w,h),20),mat,x,y,z+.015);
  }
  function shutter(g:THREE.Group,x:number,y:number,z:number,w=1.2,h=1.8,stone=false){
    box(g,w+.4,h+.4,.14,x,y,z,stone?m.stone:m.brick);
    box(g,w,h,.16,x,y,z+.09,m.wood);
    box(g,.06,h,.05,x,y,z+.2,m.brick);
    for(let yy=-h/2+.15;yy<h/2;yy+=.14)box(g,w-.12,.035,.04,x,y+yy,z+.2,m.brick);
    for(const side of [-1,1])box(g,.18,.5,.18,x+side*(w/2+.25),y,z,m.brick);
  }
  function balustrade(g:THREE.Group,x:number,y:number,z:number,w:number){
    box(g,w,.14,.3,x,y,z,m.brick);box(g,w,.13,.32,x,y+.85,z,m.brick);
    for(let i=-w/2+.15;i<w/2;i+=.32){
      const pts=[new THREE.Vector2(.05,0),new THREE.Vector2(.085,.12),new THREE.Vector2(.04,.45),new THREE.Vector2(.07,.68)];
      mesh(g,new THREE.LatheGeometry(pts,6),m.brick,x+i,y+.1,z);
    }
  }
  function roof(g:THREE.Group,x:number,z:number,w:number,d:number,eaves:number,rise:number,hip=false){
    // Separate plaster gable and thin tile planes; no terracotta-filled triangular wall.
    const corners=[[-w/2,0,-d/2],[w/2,0,-d/2],[w/2,0,d/2],[-w/2,0,d/2]];
    const a=[0,rise,-d/2+(hip?Math.min(w,d)*.35:0)],b=[0,rise,d/2-(hip?Math.min(w,d)*.35:0)];
    const triangles=hip?[[corners[0],a,corners[1]],[corners[1],a,b],[corners[1],b,corners[2]],[corners[2],b,corners[3]],[corners[3],b,a],[corners[3],a,corners[0]]]:[[corners[0],a,b],[corners[0],b,corners[3]],[corners[1],corners[2],b],[corners[1],b,a]];
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(triangles.flat(2),3));geo.computeVertexNormals();geo.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(geo.attributes.position.count*2),2));
    // Reverse winding if needed to point outwards; tile planes have a visible underside too.
    const o=mesh(g,geo,m.roof,x,eaves,z);o.material.side=THREE.DoubleSide;
    if(!hip)for(const side of [-1,1]){
      const s=new THREE.Shape();s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(0,rise);s.closePath();
      mesh(g,new THREE.ExtrudeGeometry(s,{depth:.12,bevelEnabled:false}),m.plaster,x,eaves,z+side*(d/2-.16));
    }
    box(g,w,.16,d,x,eaves-.08,z,m.brick);
    // Raised ridge and rows at the eaves catch light without a photograph texture.
    box(g,.2,.16,hip?Math.max(.15,d-Math.min(w,d)*.7):d,x,eaves+rise,z,m.roof);
    for(const side of [-1,1])for(let zz=-d/2;zz<d/2;zz+=.26)
      mesh(g,new THREE.CylinderGeometry(.095,.095,.35,6),m.roof,x+side*(w/2-.08),eaves+.02,z+zz).rotation.z=Math.PI/2;
  }
  const modern=year>=1920;
  for(const part of [2,11,17,19])body(part,modern?(part===19?6.6:10.2):5.2);
  if(!modern){
    roof(root,-.7,1,18,19.5,5.2,2.4);
    opening(root,1.4,0,10.78,2.5,2.9,.23,m.wood);
    for(const x of [-5.8,1.4,6])shutter(root,x,4.2,10.78,1.3,1.4,true);
    box(root,1,.12,1,-3,6.7,-4,m.stone);box(root,.55,1,.55,-3,6.2,-4,m.brick);
    return root;
  }
  // The raised central bay occupies part 11; side bays keep their lower eaves.
  box(root,4.75,2.65,12.3,1.5,11.525,4.6);
  roof(root,1.5,4.6,5.3,12.7,12.85,1.05);
  roof(root,-2.9,1,4.1,20,10.2,1.05);
  roof(root,5.95,1,4.35,20,10.2,1.05);
  roof(root,1.55,-5.3,4.9,7.2,10.2,1.05);
  roof(root,-7.15,-.2,4.55,17.8,6.6,1.15);
  const facade=new THREE.Group();facade.position.z=10.78;root.add(facade);
  opening(facade,1.5,.05,0,2.45,2.8,.25,m.wood);
  for(const x of [.38,2.62])opening(facade,x,3.55,0,1.85,2.8);
  balustrade(facade,1.5,3.5,.28,4.35);
  opening(facade,1.5,6.9,0,4.1,3.05,.23);
  box(facade,4.2,.05,.06,1.5,7.7,.25,m.iron);
  for(let x=-.45;x<3.6;x+=.38)box(facade,.035,.8,.04,x,7.3,.25,m.iron);
  for(const [x,h] of [[.15,1.7],[1.5,2.05],[2.85,1.7]])opening(facade,x,10.55,0,.97,h,.14);
  balustrade(facade,1.5,10.5,.22,4.1);
  for(const x of [-2.85,5.9])for(const y of [4.8,8.3])shutter(facade,x,y,0);
  for(const x of [-2.9,5.9])opening(facade,x,.05,0,1.1,2.2,.14,m.wood);
  box(facade,13,.13,.12,1.5,6.55,0,m.brick);
  // East elevation repeats the broad gallery motif visible from carrer de França.
  const side=new THREE.Group();side.position.set(8,0,1);side.rotation.y=Math.PI/2;root.add(side);
  for(const x of [-6.5,6.5])for(const y of [4.8,8.3])shutter(side,x,y,0);
  opening(side,0,3.55,0,3.4,2.9);balustrade(side,0,3.5,.23,3.6);
  opening(side,0,6.9,0,3.4,3);box(side,.07,2.9,.07,0,8.35,.12,m.brick);
  box(side,19.5,.13,.14,0,6.55,0,m.brick);
  box(root,.6,1.25,.65,-3,11.75,-3,m.plaster);box(root,.8,.16,.85,-3,12.4,-3,m.brick);
  // Agricultural wings and independent lookout. The courtyard remains open.
  body(18,5.8);body(21,3.2);body(12,5.8);body(20,9.65);
  roof(root,-16.75,14.9,12.6,7.5,5.8,1.7,true);
  roof(root,-20.8,8.6,19,5.5,3.2,1.2,true);
  roof(root,-11.8,23,10,10,5.8,1.8,true);
  const tower=new THREE.Group();tower.position.set(-26.6,0,14.45);root.add(tower);
  for(let face=0;face<4;face++){
    const f=new THREE.Group();f.rotation.y=face*Math.PI/2;tower.add(f);
    box(f,7.05,.2,.2,0,9.6,3.5,m.brick);
    opening(f,0,5.3,3.55,2.4,3.1,.2);balustrade(f,0,5.3,3.8,2.5);
    box(f,7,.6,.32,0,10.05,3.35);
    for(const x of [-3.35,-1.12,1.12,3.35])box(f,.28,1.65,.32,x,11.15,3.35,m.brick);
  }
  box(tower,7,.2,7,0,11.95,0,m.brick);roof(tower,0,0,8.4,8.4,12.1,1.9,true);
  const gallery=new THREE.Group();gallery.position.set(-20.8,0,5.5);gallery.rotation.y=Math.PI;root.add(gallery);
  for(const x of [-7.5,-3.75,0,3.75,7.5])opening(gallery,x,.15,0,2.4,2.65,.17);
  // Approximate external stair contained inside the cadastral annex, not on a street.
  for(let i=0;i<22;i++)box(root,1.3,(i+1)*.24,.28,-22.1,(i+1)*.12,17.8-i*.28,m.stone);
  return root;
}

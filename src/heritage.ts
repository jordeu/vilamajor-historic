import {createResidence,type ResidentialPalette} from './residential';
import {residentialData,type ResidentialKind} from './residential-data';
import {createBertran} from './bertran';
import {bertranPhases} from './bertran-data';
import {createFarmstead} from './farmsteads';
import {farmsteadData,farmsteadPhases,type FarmsteadKind} from './farmstead-data';
import {farmSurface} from './farmstead-materials';
import {createFarmsteadSetting} from './farmstead-setting';
import {terrainFoundation,eliesFoundationOutline} from './terrain-foundation';
import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {presentAt,towerPhase,type HeritageData,type Landmark} from './heritage-data';

/** Original parametric models. All dimensions below are metres before georeferencing. */
export function createHeritage(data:HeritageData,position:(e:number,n:number)=>THREE.Vector3){
  const root=new THREE.Group();root.name='Patrimoni de Vilamajor';
  const materials:THREE.Material[]=[];const textures:THREE.Texture[]=[];
  function masonry(base:string,stone:boolean){
    const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const ctx=canvas.getContext('2d')!;
    ctx.fillStyle=base;ctx.fillRect(0,0,256,256);
    let seed=73;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
    for(let row=0;row<16;row++)for(let col=-1;col<9;col++){
      const shade=rand()*.14;ctx.fillStyle=`rgba(${rand()>.5?'255,245,222':'40,28,15'},${shade})`;
      ctx.fillRect(col*32+(row%2)*16+1,row*16+1,30,14);
      if(stone){ctx.strokeStyle='rgba(30,22,16,.17)';ctx.lineWidth=1;ctx.strokeRect(col*32+(row%2)*16+.5,row*16+.5,31,15);}
    }
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.wrapS=texture.wrapT=THREE.RepeatWrapping;textures.push(texture);
    const mat=new THREE.MeshStandardMaterial({map:texture,roughness:1,color:'#ffffff'});
    // Object-space triplanar stone courses remain the same size on merged walls and arches.
    mat.onBeforeCompile=shader=>{
      shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 masonryPosition; varying vec3 masonryNormal;').replace('#include <begin_vertex>','#include <begin_vertex>\nmasonryPosition=position; masonryNormal=normal;');
      shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 masonryPosition; varying vec3 masonryNormal;').replace('#include <map_fragment>',`vec3 an=abs(masonryNormal); vec2 stoneUv=an.y>.7?masonryPosition.xz:an.x>an.z?masonryPosition.zy:masonryPosition.xy; diffuseColor *= texture2D(map, stoneUv / 6.0);`);
    };
    materials.push(mat);return mat;
  }
  const stone=masonry('#a99c82',true),red=masonry('#a46850',true),plaster=masonry('#d3c4a5',false);
  const roof=masonry('#9b654b',true),pale=masonry('#d1c4a5',true);
  const material=(color:string)=>{const m=new THREE.MeshStandardMaterial({color,roughness:.86});materials.push(m);return m;};
  const dark=material('#302b24'),wood=material('#594632'),bronze=material('#736646'),glass=material('#414841');
  function add(group:THREE.Group,geo:THREE.BufferGeometry,mat:THREE.Material,x=0,y=0,z=0){const mesh=new THREE.Mesh(geo,mat);mesh.position.set(x,y,z);mesh.castShadow=mesh.receiveShadow=true;group.add(mesh);return mesh;}
  function box(g:THREE.Group,w:number,h:number,d:number,x:number,y:number,z:number,m:THREE.Material=stone){return add(g,new THREE.BoxGeometry(w,h,d),m,x,y,z);}
  function gable(g:THREE.Group,w:number,length:number,eaves:number,rise:number,x=0,z=0,m:THREE.Material=roof){
    const shape=new THREE.Shape();shape.moveTo(-w/2,0);shape.lineTo(w/2,0);shape.lineTo(0,rise);shape.closePath();
    const geo=new THREE.ExtrudeGeometry(shape,{depth:length,bevelEnabled:false,steps:1});
    return add(g,geo,m,x,eaves,z-length/2);
  }
  function archPath(x:number,y:number,w:number,h:number){const p=new THREE.Path();p.moveTo(x-w/2,y);p.lineTo(x+w/2,y);p.lineTo(x+w/2,y+h-w/2);p.absarc(x,y+h-w/2,w/2,0,Math.PI,false);p.closePath();return p;}
  function arch(g:THREE.Group,w:number,h:number,thickness:number,x:number,y:number,z:number,m:THREE.Material=dark){const p=archPath(0,0,w,h);const shape=new THREE.Shape(p.getPoints(16));return add(g,new THREE.ExtrudeGeometry(shape,{depth:thickness,bevelEnabled:false}),m,x,y,z);}
  function wall(g:THREE.Group,w:number,h:number,depth:number,holes:{x:number;y:number;w:number;h:number}[],m:THREE.Material,y=0){
    const shape=new THREE.Shape();shape.moveTo(-w/2,0);shape.lineTo(w/2,0);shape.lineTo(w/2,h);shape.lineTo(-w/2,h);shape.closePath();
    for(const hole of holes)shape.holes.push(archPath(hole.x,hole.y,hole.w,hole.h));
    return add(g,new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:false,curveSegments:12}),m,0,y,0);
  }
  function ring(g:THREE.Group,w:number,d:number,y:number,m=red){box(g,w,.19,d,0,y,0,m);}
  function cross(g:THREE.Group,x:number,y:number,z:number){box(g,.13,1.8,.14,x,y,z,bronze);box(g,.95,.13,.14,x,y+.3,z,bronze);}
  function belfry(g:THREE.Group,x:number,z:number,y:number,w=2.4){
    const b=new THREE.Group();b.position.set(x,y,z);g.add(b);wall(b,w,2.6,.65,[{x:0,y:.3,w:1.1,h:1.8}],stone);gable(b,w+.4,1,2.6,.8,0,.3);bell(b,0,1.4,.3,.45);cross(b,0,4,.3);
  }
  function bell(g:THREE.Group,x:number,y:number,z:number,r:number){
    const points=[new THREE.Vector2(0,.85*r),new THREE.Vector2(.35*r,.8*r),new THREE.Vector2(.45*r,.2*r),new THREE.Vector2(.8*r,-.65*r),new THREE.Vector2(r,-.8*r),new THREE.Vector2(.86*r,-.9*r),new THREE.Vector2(.3*r,-.3*r)];
    add(g,new THREE.LatheGeometry(points,20),bronze,x,y,z);box(g,r*2,.28,.35,x,y+r,z,wood);
  }
  function tower(year:number){
    const g=new THREE.Group(),phase=towerPhase(year),mat=phase.plastered?plaster:red;
    for(let face=0;face<4;face++){
      const f=new THREE.Group();f.rotation.y=face*Math.PI/2;g.add(f);const wallGroup=new THREE.Group();wallGroup.position.z=2.4;f.add(wallGroup);
      wall(wallGroup,6,13,.6,face===2?[{x:0,y:0,w:1.25,h:2.3}]:face===0?[{x:-1.2,y:3,w:.25,h:1.1},{x:1.1,y:7,w:.25,h:1.1},{x:-.7,y:10.6,w:.25,h:1}]:face===1?[{x:0,y:6,w:.25,h:1.1}]:[],mat);
      wall(wallGroup,6,4.3,.6,[{x:-.78,y:.4,w:1.32,h:2.65},{x:.78,y:.4,w:1.32,h:2.65}],mat,13);
      const wide=face===0?phase.southWide:face===2?phase.northWide:false;
      wall(wallGroup,6,6.1,.6,wide?[{x:0,y:.55,w:3.25,h:4.7}]:[{x:-.88,y:.55,w:1.5,h:4.5},{x:.88,y:.55,w:1.5,h:4.5}],mat,17.3);
      if(!wide){box(f,.40,.28,.86,0,21,2.7,pale);box(f,.2,3.1,.35,0,19.4,2.7,pale);}
      box(f,.40,.23,.8,0,15,2.7,pale);
      for(let i=-3;i<=3;i++){
        const curve=new THREE.EllipseCurve(i*.76,12.6,.3,.3,0,Math.PI,false,0);const path=new THREE.CurvePath<THREE.Vector3>();
        const points=curve.getPoints(10).map(p=>new THREE.Vector3(p.x,p.y,3.05));for(let j=1;j<points.length;j++)path.add(new THREE.LineCurve3(points[j-1],points[j]));
        add(f,new THREE.TubeGeometry(path,12,.06,4,false),mat);
      }
      for(let i=-6;i<=6;i++)box(f,.25,.18,.27,i*.43,13.05,3.03,mat).rotation.y=Math.PI/4;
      // Stepped triangular parapet, not a generic castle battlement.
      for(const x of [-2.8,0,2.8])for(let step=0;step<3;step++)box(f,1.1-step*.3,.18,.38,x,24+step*.18,2.9,mat);
      if(face!==1)bell(f,0,20.5,1.9,face===2?.6:.48);
    }
    ring(g,6.18,6.18,13.3,mat);ring(g,6.16,6.16,17.25,mat);ring(g,6.3,6.3,23.4,mat);
    for(let i=0;i<4;i++)ring(g,6.05+i*.14,6.05+i*.14,23.5+i*.12,mat);
    box(g,5.5,.12,5.5,0,23.52,0,pale);box(g,1.3,.7,1.3,1.3,24.05,-1.2,mat);gable(g,1.5,1.5,24.4,.4,1.3,-1.2);
    return g;
  }
  function church(l:Landmark,ground:(x:number,z:number)=>number){
    const g=new THREE.Group(),[w,h,d]=l.dimensions;
    const gothic=l.kind==='gothic',basilica=l.kind==='basilica',early=l.kind==='early',construction=l.kind==='construction';
    const mat=early?stone:plaster;
    box(g,w+.5,.7,d+.5,0,-.1,0,stone);
    if(l.kind==='elies')g.add(terrainFoundation(eliesFoundationOutline(w,d),ground,stone));
    if(construction){
      for(const x of [-w/2,w/2])box(g,.9,5,d,x,2.5,0,stone);
      for(const z of [-d/2,d/2])box(g,w,4,.9,0,2,z,stone);
      for(const x of [-w/2-1,w/2+1])for(let z=-d/2;z<=d/2;z+=3){box(g,.15,9,.15,x,4.5,z,wood);box(g,2,.16,2.8,x,6,z,wood);}return g;
    }
    const naveW=gothic||basilica?w*.57:w,naveH=gothic||basilica?h-3:h-1.6;
    box(g,naveW,naveH,d,0,naveH/2,0,mat);gable(g,naveW+.6,d+.5,naveH,gothic||basilica?3:1.8);
    if(gothic||basilica){
      for(const side of [-1,1]){
        box(g,w*.22,naveH*.5,d*.91,side*w*.395,naveH*.25,0,mat);
        const roofSide=box(g,w*.25,.3,d*.94,side*w*.39,naveH*.57,0,roof);roofSide.rotation.z=-side*.25;
        for(let z=-d*.38;z<d*.45;z+=d/4)box(g,.9,naveH*.65,1.15,side*w*.49,naveH*.325,z,stone);
      }
      const apse=add(g,new THREE.CylinderGeometry(naveW/2,naveW/2,naveH,gothic?5:24,1,false,Math.PI/2,Math.PI),mat,0,naveH/2,-d/2+.1);apse.rotation.y=Math.PI;
      const cap=add(g,new THREE.ConeGeometry(naveW/2+.3,3,gothic?5:24,1,false,0,Math.PI),roof,0,naveH+1.5,-d/2+.1);cap.rotation.y=-Math.PI/2;
    }else if(l.kind==='romanesque'||l.kind==='elies'){
      add(g,new THREE.CylinderGeometry(w*.35,w*.35,naveH*.75,20),stone,0,naveH*.375,-d/2);add(g,new THREE.ConeGeometry(w*.38,1.5,20),roof,0,naveH*.75+.75,-d/2);
    }
    arch(g,gothic?2.8:1.6,gothic?4.6:2.7,.1,0,.05,d/2+.02,wood);
    // Stone portal jambs and entablature.
    for(const side of [-1,1])box(g,.28,gothic?4.6:2.7,.3,side*(gothic?1.6:1),gothic?2.3:1.35,d/2+.18,pale);
    if(gothic||basilica){add(g,new THREE.CylinderGeometry(1.1,1.1,.13,32),glass,0,naveH*.76,d/2+.1).rotation.x=Math.PI/2;
      add(g,new THREE.TorusGeometry(1.14,.16,6,32),pale,0,naveH*.76,d/2+.2);}
    for(const side of [-1,1])for(let z=-d*.32;z<=d*.38;z+=d/4){const win=arch(g,.72,1.7,.06,0,naveH*.67,0,glass);win.rotation.y=side*Math.PI/2;win.position.x=side*(naveW/2+.02);win.position.z=z;}
    if(gothic){
      const c=new THREE.Group();c.position.set(-w*.36,0,d*.36);g.add(c);box(c,4.2,17,4.6,0,8.5,0,stone);
      for(let face=0;face<4;face++){const f=new THREE.Group();f.rotation.y=face*Math.PI/2;c.add(f);const upper=wall(f,4.2,3,.5,[{x:0,y:.2,w:1.5,h:2.3}],stone,17);upper.position.z=1.8;}
      box(c,4.6,.25,4.8,0,20.2,0,roof);for(const x of [-2,2])for(const z of [-2,2])box(c,.45,.6,.45,x,20.5,z,stone);
    }else if(basilica){
      const portico=new THREE.Group();portico.position.z=d/2+1;g.add(portico);
      wall(portico,w,5,.65,Array.from({length:7},(_,i)=>({x:(i-3)*2.65,y:.1,w:2.1,h:4.3})),plaster);
      box(portico,w+.5,.4,4,0,5, -1.3,pale);gable(portico,w+.7,4.5,5.2,1.5,0,-1.3);
      for(let i=-3;i<=3;i++)box(portico,.3,.3,.9,i*2.65+1.3,3.25,.28,pale);
      cross(g,0,h+.8,d/2);
    }else if(l.kind==='susanna'){
      const b=new THREE.Group();b.position.set(0,0,d/2-1);g.add(b);box(b,3.2,6,3.2,0,3,0,stone);
      for(const face of [0,2]){const f=new THREE.Group();f.rotation.y=face*Math.PI/2;b.add(f);wall(f,3.2,2.4,.5,[{x:-.7,y:.2,w:.85,h:1.75},{x:.7,y:.2,w:.85,h:1.75}],stone,6).position.z=1.1;}
      box(b,3.3,.5,3.3,0,8.4,0,stone);
    }else if(l.kind==='lleir'){
      box(g,8,6,13,w/2+3,3,0,plaster);gable(g,8.5,13.5,6,2,w/2+3);belfry(g,w/2,0,naveH);
      for(const side of [-1,1])for(const z of [-d*.32,0,d*.32])box(g,.9,naveH*.9,1.2,side*w/2,naveH*.45,z,stone);
    }else if(l.kind==='elies'){box(g,4,4,d,-w/2,2,0,stone);gable(g,4.5,d,4,1.2,-w/2);belfry(g,0,d/2,naveH,1.8);}
    return g;
  }
  /** Merge by material so carved openings do not cost a draw call per stone. */
  function compact(group:THREE.Group){
    group.updateMatrixWorld(true);const byMaterial=new Map<THREE.Material,THREE.BufferGeometry[]>();
    group.traverse(o=>{if(o instanceof THREE.Mesh){const mat=o.material as THREE.Material;const geo=o.geometry.clone().applyMatrix4(o.matrixWorld);const list=byMaterial.get(mat)??[];list.push(geo);byMaterial.set(mat,list);o.geometry.dispose();}});
    const merged=new THREE.Group();for(const [mat,geometries]of byMaterial){const geo=mergeGeometries(geometries.map(g=>g.index?g.toNonIndexed():g),false);if(geo){const mesh=new THREE.Mesh(geo,mat);mesh.castShadow=!mat.transparent;mesh.receiveShadow=true;merged.add(mesh);}geometries.forEach(g=>g.dispose());}return merged;
  }
  const bertranMaterials={plaster:masonry('#e3ddbc',false),brick:masonry('#ae7357',true),roof:masonry('#9c664a',true),stone:pale,dark,wood:material('#876651'),iron:material('#424c44')};
  const residenceMaterials:ResidentialPalette={cream:material('#e2d5b0'),yellow:material('#e5bf65'),white:material('#e8e1cf'),brick:masonry('#a96143',true),roof:masonry('#a76e4e',true),stone:masonry('#bcb5a0',false),grey:material('#b3b1a5'),dark,green:material('#31594b'),iron:material('#343d3c'),wood:material('#65513e'),blue:material('#62919e')};
  residenceMaterials.roof.side=THREE.DoubleSide;
  const farmsteadMaterials={...residenceMaterials,cream:farmSurface('#d8cba9','lime'),white:farmSurface('#e4e0cd','lime'),stone:farmSurface('#b9ae94','stone'),roof:farmSurface('#a56645','tile'),wood:farmSurface('#64513b','wood'),earth:material('#a49a74'),soil:material('#796647'),grass:material('#8a9568'),leaves:material('#4b6036'),leavesLight:material('#657a40'),leavesDark:material('#344a30')};
  materials.push(farmsteadMaterials.cream,farmsteadMaterials.white,farmsteadMaterials.stone,farmsteadMaterials.roof,farmsteadMaterials.wood);
  Object.assign(farmsteadMaterials.earth,{vertexColors:true,transparent:true,depthWrite:false});
  for(const m of [farmsteadMaterials.soil,farmsteadMaterials.grass])Object.assign(m,{vertexColors:true,transparent:true,depthWrite:false});
  const objects=data.landmarks.map(l=>{
    const base=position(...l.position),c=Math.cos(l.rotation),s=Math.sin(l.rotation);
    const ground=(x:number,z:number)=>(position(l.position[0]+c*x+s*z,l.position[1]+s*x-c*z).y-base.y)*100;
    const variants=l.kind==='tower'?[1050,1663,1776,1881,1932].map(year=>({from:year,object:compact(tower(year))})):l.kind==='bertran'?bertranPhases.map(from=>({from,object:compact(createBertran(from,bertranMaterials))})):l.kind in residentialData?[{from:l.from,object:compact(createResidence(l.kind as ResidentialKind,residenceMaterials))}]:l.kind in farmsteadData?farmsteadPhases[l.kind as FarmsteadKind].map(from=>({from,object:compact(createFarmstead(l.kind as FarmsteadKind,from,farmsteadMaterials,ground))})):[{from:l.from,object:compact(church(l,ground))}];
    const group=new THREE.Group();group.position.copy(position(...l.position));group.rotation.y=l.rotation;group.scale.setScalar(.01);group.userData.landmark=l;
    for(const variant of variants)group.add(variant.object);
    const setting=l.kind in farmsteadData?createFarmsteadSetting(l.kind as FarmsteadKind,farmsteadMaterials,ground):null;
    if(setting){for(const entry of setting.entries){const meta=entry.object.userData;entry.object=compact(entry.object);entry.object.userData=meta;setting.root.add(entry.object);}group.add(setting.root);}
    root.add(group);return {landmark:l,group,variants,setting};
  });
  let enabled=true,currentYear=2026,vegetation=true;
  function update(year=currentYear){currentYear=year;for(const o of objects){o.group.visible=enabled&&presentAt(o.landmark,year);const chosen=o.variants.filter(v=>v.from<=year).at(-1);for(const v of o.variants)v.object.visible=v===chosen;o.setting?.update(year,enabled,vegetation);}}
  update();
  return {root,objects,update,setVisible(value:boolean){enabled=value;update();},setVegetation(value:boolean){vegetation=value;update();},dispose(){materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());}};
}

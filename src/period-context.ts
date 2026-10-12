import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {historicalRoads,houseGroundPoint,type HistoricalHouse} from './historical-layout';
import {clearsRoads,type GroundPoint} from './ground-clearance';

/** Entirely imagined scenery. Only the terrain under it is measured. Batched by period/material. */
export function periodContext(position:(e:number,n:number)=>THREE.Vector3,houses:HistoricalHouse[]){
  const root=new THREE.Group(),groups=new Map<number,THREE.Group>();
  const batches=new Map<string,THREE.BufferGeometry[]>();
  const palette={timber:'#705237',stone:'#a69d7f',leaf:'#6c7945',wheat:'#ab9358',soil:'#897347',cloth:'#bcaa7b',dark:'#4b4937',wool:'#d0c5a9'};
  type Material=keyof typeof palette;
  type Part={g:THREE.BufferGeometry;material:Material;from:number};
  let pending:Part[]|null=null;
  const anchor=position(450000,4614000);
  function store(parts:Part[],road=false){
    if(!road){
      const bounds=new THREE.Box3();
      for(const {g}of parts){g.computeBoundingBox();bounds.union(g.boundingBox!);}
      const footprint:GroundPoint[]=[[bounds.min.x,bounds.min.z],[bounds.max.x,bounds.min.z],[bounds.max.x,bounds.max.z],[bounds.min.x,bounds.max.z]].map(([x,z])=>[450000+(x-anchor.x)*100,4614000-(z-anchor.z)*100]);
      if(!clearsRoads(footprint,historicalRoads,.6)){parts.forEach(({g})=>g.dispose());return;}
    }
    for(const {g,material,from}of parts){
      const key=from+':'+material+':'+(road?'road':'scenery'),list=batches.get(key)??[],geometry=g.index?g.toNonIndexed():g;
      geometry.deleteAttribute('uv');list.push(geometry);if(g.index)g.dispose();batches.set(key,list);
    }
  }
  function add(g:THREE.BufferGeometry,material:Material,from:number,road=false){
    const part={g,material,from};if(pending)pending.push(part);else store([part],road);
  }
  // Keep complete carts, trees, stalls and animals together when reserving the road.
  function scenery(draw:()=>void){const previous=pending;pending=[];draw();const parts=pending;pending=previous;if(previous)previous.push(...parts);else store(parts);}

  function box(e:number,n:number,w:number,h:number,d:number,y:number,material:Material,from=872,angle=0){const p=position(e,n);add(new THREE.BoxGeometry(w*.01,h*.01,d*.01).rotateY(angle).translate(p.x,p.y+(y+h/2)*.01,p.z),material,from);}
  function round(e:number,n:number,r:number,h:number,y:number,material:Material,from=872,cone=false){const p=position(e,n);add(new THREE.CylinderGeometry((cone?.12:r)*.01,r*.01,h*.01,8).translate(p.x,p.y+(y+h/2)*.01,p.z),material,from);}
  function path(points:[number,number][],width:number,material:Material,from=872,road=false){
    const vertices:number[]=[];
    for(let i=1;i<points.length;i++){
      const [e0,n0]=points[i-1],[e1,n1]=points[i],length=Math.hypot(e1-e0,n1-n0),steps=Math.ceil(length/4),de=-(n1-n0)/length*width/2,dn=(e1-e0)/length*width/2;
      for(let j=0;j<steps;j++){
        const a=j/steps,b=(j+1)/steps;
        const ps=[[e0+(e1-e0)*a+de,n0+(n1-n0)*a+dn],[e0+(e1-e0)*a-de,n0+(n1-n0)*a-dn],[e0+(e1-e0)*b+de,n0+(n1-n0)*b+dn],[e0+(e1-e0)*b-de,n0+(n1-n0)*b-dn]].map(([e,n])=>position(e,n).add(new THREE.Vector3(0,.004,0)));
        for(const k of [0,1,2,1,3,2])vertices.push(...ps[k].toArray());
      }
    }
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.computeVertexNormals();add(g,material,from,road);
  }
  // Winding paths and cultivated strips supply scale without pretending to be historic mapping.
  for(const road of historicalRoads)path(road.points,road.width,'soil',872,true);
  let seed=1150;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  houses.forEach((v,i)=>{
    const p=position(v.e,v.n),q=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),v.angle);
    const detail=(x:number,y:number,z:number,w:number,h:number,d:number,mat:Material)=>{const g=new THREE.BoxGeometry(w*.01,h*.01,d*.01);g.translate(x*.01,y*.01,z*.01).applyQuaternion(q).translate(p.x,p.y,p.z);add(g,mat,v.from);};
    detail(0,.95,v.d/2+.06,1.05,1.9,.12,'timber');
    for(const x of [-v.w*.29,v.w*.29]){detail(x,1.5,v.d/2+.07,.62,.9,.12,'dark');if(v.h>4.7)detail(x,4.1,v.d/2+.07,.6,.85,.12,'timber');}
    if(i%3!==0)return;
    const from=v.from,angle=v.place==='vilanova'?v.angle:0;
    // Vilanova's gardens and farm objects stay behind the houses on both sides.
    const yard=(x:number,z:number):[number,number]=>v.place==='vilanova'?houseGroundPoint(v,x-12,-v.d/2-12-z):[v.e+v.w+8+x,v.n+8+z];
    const yardBox=(x:number,z:number,w:number,h:number,d:number,y:number,mat:Material)=>box(...yard(x,z),w,h,d,y,mat,from,angle);
    const yardRound=(x:number,z:number,r:number,h:number,y:number,mat:Material,cone=false)=>round(...yard(x,z),r,h,y,mat,from,cone);
    for(let row=0;row<6;row++)path([yard(row*1.5,0),yard(row*1.5+2,13)],.55,row%2?'leaf':'soil',from);
    for(let k=0;k<6;k++){yardBox(-2,k*3,.17,1.1,.17,0,'timber');if(k<5)yardBox(-2,k*3+1.5,.11,.12,3,.65,'timber');}
    for(let k=0;k<3;k++)scenery(()=>{
      const [te,tn]=yard(15+k*7,4);round(te,tn,.18,2.4,0,'timber',from);
      const tp=position(te,tn);add(new THREE.SphereGeometry(.023,7,5).scale(1,.85,1).translate(tp.x,tp.y+.032,tp.z),'leaf',from);
    });
    yardRound(2,-4,1.2,2,0,'wheat',true);yardRound(5,-4,.65,1.3,0,'cloth');
    scenery(()=>{
    yardBox(11,-4,1.1,.35,1.9,.6,'timber');
    for(const dx of [-.7,.7]){const wp=position(...yard(11+dx,-4));add(new THREE.TorusGeometry(.004,.0007,4,10).rotateY(Math.PI/2+angle).translate(wp.x,wp.y+.006,wp.z),'dark',from);}
    });
    for(let k=0;k<3;k++)scenery(()=>{
      const x=15+rand()*8,z=-9+rand()*5,sp=position(...yard(x,z));
      add(new THREE.SphereGeometry(.005,6,4).scale(1.35,.85,.8).rotateY(angle).translate(sp.x,sp.y+.007,sp.z),'wool',from);
      yardBox(x+.65,z,.28,.45,.3,.6,'dark');
      for(const dx of [-.4,.4])for(const dz of [-.25,.25])yardBox(x+dx,z+dz,.09,.45,.09,0,'dark');
    });
  });
  // Larger cultivated fields at the edge of each settlement.
  for(const [e,n]of [[448850,4614800],[449200,4615120],[449330,4614680],[450030,4613870],[450290,4613800]] as [number,number][]){
    for(let row=0;row<18;row++)path([[e+row*3,n],[e+row*3+18,n+55],[e+row*3+13,n+80]],2.15,row%5?'wheat':'soil',872);
  }
  // Market and well near the sagrera: evocative objects, not archaeological claims.
  for(let i=0;i<5;i++)scenery(()=>{
    const e=449045+i*6,n=4614847;
    box(e,n,3.8,.17,2.2,2.4,i%2?'cloth':'wheat',1150);box(e,n,3.4,.8,.9,0,'timber',1150);
    for(const dx of [-1.7,1.7])box(e+dx,n,.12,2.5,.12,0,'timber',1150);
    for(let j=0;j<3;j++)round(e-1+j,n,.25,.35,.8,'soil',1150);
    const pe=e+2.7,pn=n-2;round(pe,pn,.23,1.15,0,'cloth',1150);const pp=position(pe,pn);add(new THREE.SphereGeometry(.0022,6,5).translate(pp.x,pp.y+.014,pp.z),'stone',1150);
  });
  scenery(()=>{const well=position(449104,4614845);add(new THREE.TorusGeometry(.011,.0035,6,12).rotateX(Math.PI/2).translate(well.x,well.y+.007,well.z),'stone',1150);box(449102.8,4614845,.15,2.4,.15,0,'timber',1150);box(449105.2,4614845,.15,2.4,.15,0,'timber',1150);box(449104,4614845,2.6,.18,.18,2.3,'timber',1150);});
  for(const [key,geometries]of batches){const [date,material,role]=key.split(':');const from=Number(date);let group=groups.get(from);if(!group){group=new THREE.Group();groups.set(from,group);root.add(group);}const geometry=mergeGeometries(geometries)!;geometries.forEach(g=>g.dispose());const mesh=new THREE.Mesh(geometry,new THREE.MeshLambertMaterial({color:palette[material as Material],side:THREE.DoubleSide}));mesh.userData.role=role;mesh.castShadow=mesh.receiveShadow=true;group.add(mesh);}
  return {root,update(year:number,enabled:boolean){root.visible=enabled&&year<1850;for(const [from,group]of groups)group.visible=year>=from;}};
}

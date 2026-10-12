import * as THREE from 'three';
import {createSettlementLayout} from './historical-layout';
import {microDeclarations,microFragment,type microUniforms} from './cartographic-detail';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

/** Inferred crowns on classified orthophoto samples. A visual layer, never a tree census. */
export function vegetation(trees:number[][],position:(e:number,n:number)=>THREE.Vector3,mobile:boolean){
  const selected=mobile?trees.filter((_,i)=>i%2===0):trees;
  const crowns=[new THREE.SphereGeometry(1,7,5),new THREE.SphereGeometry(.75,7,5).translate(.65,-.15,.1),new THREE.SphereGeometry(.72,7,5).translate(-.45,-.1,.35)];
  const crownGeometry=mergeGeometries(crowns)!;crowns.forEach(g=>g.dispose());
  const root=new THREE.Group(),tiles=new Map<string,number[][]>();
  for(const tree of selected){const key=`${Math.floor(tree[0]/400)},${Math.floor(tree[1]/400)}`;const tile=tiles.get(key)??[];tile.push(tree);tiles.set(key,tile);}
  const foliageMaterial=new THREE.MeshLambertMaterial({color:'#ffffff'}),trunkMaterial=new THREE.MeshLambertMaterial({color:'#63543d'}),trunkGeometry=new THREE.CylinderGeometry(.12,.2,1,5);
  // Spatial batches let Three cull distant forests during a village flyover.
  for(const tile of tiles.values()){
    const foliage=new THREE.InstancedMesh(crownGeometry,foliageMaterial,tile.length),trunks=new THREE.InstancedMesh(trunkGeometry,trunkMaterial,tile.length);
    const matrix=new THREE.Matrix4(),quaternion=new THREE.Quaternion(),scale=new THREE.Vector3(),color=new THREE.Color();
    tile.forEach(([e,n,h,variant],i)=>{
      const p=position(e,n),radius=h*(.26+variant*.07)*.01;
      matrix.compose(p.clone().add(new THREE.Vector3(0,h*.0075,0)),quaternion,scale.set(radius,radius*.88,radius));foliage.setMatrixAt(i,matrix);
      color.setHSL(.20+variant*.07,.20+variant*.12,.18+variant*.095);foliage.setColorAt(i,color);
      matrix.compose(p.clone().add(new THREE.Vector3(0,h*.0027,0)),quaternion,scale.set(.01,h*.0054,.01));trunks.setMatrixAt(i,matrix);
    });
    foliage.receiveShadow=true;foliage.castShadow=!mobile;foliage.computeBoundingSphere();trunks.computeBoundingSphere();root.add(foliage,trunks);
  }
  return root;
}

/** Typological rural context. These positions are explicitly hypothetical. */
export function settlement(position:(e:number,n:number)=>THREE.Vector3){
  let seed=950;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const shape=new THREE.Shape();shape.moveTo(-.5,0);shape.lineTo(.5,0);shape.lineTo(0,.4);shape.closePath();
  const roofGeometry=new THREE.ExtrudeGeometry(shape,{depth:1,bevelEnabled:false}).translate(0,0,-.5);
  const walls=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshStandardMaterial({color:'#c3b397',roughness:1}),86);
  const roofs=new THREE.InstancedMesh(roofGeometry,new THREE.MeshStandardMaterial({color:'#946348',roughness:1}),86);
  const matrix=new THREE.Matrix4(),q=new THREE.Quaternion(),scale=new THREE.Vector3();
  const entries=createSettlementLayout();
  entries.forEach((v,i)=>{
    const p=position(v.e,v.n);q.setFromAxisAngle(new THREE.Vector3(0,1,0),v.angle);
    matrix.compose(p.clone().add(new THREE.Vector3(0,v.h*.005,0)),q,scale.set(v.w*.01,v.h*.01,v.d*.01));walls.setMatrixAt(i,matrix);
    matrix.compose(p.clone().add(new THREE.Vector3(0,v.h*.01,0)),q,scale.set((v.w+.6)*.01,v.w*.01,(v.d+.6)*.01));roofs.setMatrixAt(i,matrix);
    const color=new THREE.Color().setHSL(.075+random()*.025,.23+random()*.12,.34+random()*.12);roofs.setColorAt(i,color);
  });
  walls.castShadow=walls.receiveShadow=roofs.castShadow=roofs.receiveShadow=true;walls.computeBoundingSphere();roofs.computeBoundingSphere();
  const root=new THREE.Group();root.add(walls,roofs);
  return {root,entries,update(year:number,enabled:boolean){root.visible=enabled&&year<1850;walls.count=roofs.count=entries.filter(e=>e.from<=year).length;}};
}

/** Procedural agricultural surface: no modern orthophoto is passed off as an ancient landscape. */
export function historicalGround(material:THREE.MeshLambertMaterial,micro:ReturnType<typeof microUniforms>,photoOpacity={value:1}){
  const uniform={value:0};
  material.onBeforeCompile=shader=>{
    shader.uniforms.historicalGround=uniform;Object.assign(shader.uniforms,micro,{photoOpacity,terrainColor:{value:new THREE.Color('#b5bd97')}});
    shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 groundPosition; varying vec3 groundNormal;').replace('#include <begin_vertex>','#include <begin_vertex>\ngroundPosition=position; groundNormal=normal;');
    shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>
      ${microDeclarations}
      uniform float historicalGround; uniform float photoOpacity; uniform vec3 terrainColor; varying vec3 groundPosition; varying vec3 groundNormal;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+1.),f.x),f.y);}
    `).replace('#include <map_fragment>','#include <map_fragment>'+microFragment('groundPosition','diffuseColor')+`
      #ifdef USE_MAP
        diffuseColor.rgb=mix(terrainColor,diffuseColor.rgb,photoOpacity);
      #endif
    `).replace('#include <color_fragment>',`#include <color_fragment>
      if(historicalGround>.5){
        vec2 p=groundPosition.xz;float n=noise(p*.47)*.6+noise(p*2.1)*.25+noise(p*14.)*.15;
        float slope=1.-abs(groundNormal.y);float woodland=smoothstep(.015,.14,slope)*.6+smoothstep(2.,5.,groundPosition.y)*.5;
        vec3 grass=mix(vec3(.44,.43,.25),vec3(.29,.38,.21),n);
        vec2 field=mat2(.92,.39,-.39,.92)*p;field+=vec2(noise(p*.9),noise(p*.8+5.))*1.3;float fieldTone=noise(floor(field*1.1));
        grass=mix(grass,vec3(.53,.43,.28),smoothstep(.48,.7,fieldTone)*(1.-min(woodland,1.))*.55);
        float grain=hash(floor(p*160.));grass*=.66+noise(p*7.)*.22+grain*.16;
        diffuseColor.rgb=mix(grass,vec3(.15,.24,.12)*(.8+n*.4),min(woodland,1.));
      }
    `);
  };
  return uniform;
}

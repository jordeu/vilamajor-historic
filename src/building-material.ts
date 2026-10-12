import * as THREE from 'three';

/** Local foundation and storey coordinates prevent altitude from creating fictitious floors. */
export const growthDeclarations=`attribute float baseY; attribute float birthYear; attribute float storeys; attribute float facadeU; uniform float landscapeYear;`;
export const growthPosition=`vec3 grownPosition=position; float growth=smoothstep(birthYear,birthYear+.85,landscapeYear); grownPosition.y=baseY+(position.y-baseY)*growth;`;
export function buildingMaterials(time:{value:number}){
  const wall=new THREE.MeshLambertMaterial({color:'#ddcfb6',side:THREE.DoubleSide});
  wall.onBeforeCompile=shader=>{
    shader.uniforms.landscapeYear=time;
    shader.vertexShader=shader.vertexShader.replace('#include <common>',`#include <common>\n${growthDeclarations} varying vec3 facade; varying float houseTone;`).replace('#include <begin_vertex>',`${growthPosition} vec3 transformed=grownPosition; facade=vec3(facadeU,(position.y-baseY)*100.,storeys); houseTone=fract(sin(baseY*81.7+birthYear*.13)*43758.5453);`);
    shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 facade; varying float houseTone;').replace('#include <color_fragment>',`#include <color_fragment>
      float height=facade.y; vec2 cell=vec2(fract(facade.x/3.6),fract(height/2.8));
      vec2 aa=max(fwidth(cell),vec2(.008));
      float occupied=step(.35,height)*step(height,facade.z*2.8-.35);
      float opening=smoothstep(.39-aa.x,.39+aa.x,cell.x)*(1.-smoothstep(.59-aa.x,.59+aa.x,cell.x))*smoothstep(.38-aa.y,.38+aa.y,cell.y)*(1.-smoothstep(.78-aa.y,.78+aa.y,cell.y))*occupied;
      float surround=smoothstep(.36-aa.x,.36+aa.x,cell.x)*(1.-smoothstep(.62-aa.x,.62+aa.x,cell.x))*smoothstep(.34-aa.y,.34+aa.y,cell.y)*(1.-smoothstep(.81-aa.y,.81+aa.y,cell.y))*occupied;
      diffuseColor.rgb*=mix(.88,1.04,houseTone);
      diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.67,.61,.49),surround*.36);
      vec3 shutters=mix(vec3(.30,.35,.27),vec3(.36,.28,.20),step(.55,houseTone));
      diffuseColor.rgb=mix(diffuseColor.rgb,shutters,opening*.68);
    `);
  };
  const depth=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking,side:THREE.DoubleSide});
  depth.onBeforeCompile=shader=>{shader.uniforms.landscapeYear=time;shader.vertexShader=shader.vertexShader.replace('#include <common>',`#include <common>\n${growthDeclarations}`).replace('#include <begin_vertex>',`${growthPosition} vec3 transformed=grownPosition;`);};
  return {wall,depth};
}

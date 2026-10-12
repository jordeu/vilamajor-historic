import * as THREE from 'three';
export interface MicroPhoto {year:number;areas:{id:string;file:string;bbox:[number,number,number,number];metresPerPixel:[number,number]}[]}
export function microUniforms(areas:MicroPhoto['areas'],origin:[number,number]){
  // Stay near the scene origin: absolute UTM northings lose sub-metre precision on the GPU.
  const localBox=(b:MicroPhoto['areas'][number]['bbox'])=>new THREE.Vector4((b[0]-origin[0])*.01,(origin[1]-b[3])*.01,(b[2]-origin[0])*.01,(origin[1]-b[1])*.01);
  return {useMicro:{value:false},microPere:{value:null as THREE.Texture|null},microAntoni:{value:null as THREE.Texture|null},microPereBox:{value:localBox(areas[0].bbox)},microAntoniBox:{value:localBox(areas[1].bbox)},microOrigin:{value:new THREE.Vector2(...origin)}};
}
export const microDeclarations=`uniform bool useMicro; uniform sampler2D microPere; uniform sampler2D microAntoni; uniform vec4 microPereBox; uniform vec4 microAntoniBox; uniform vec2 microOrigin;`;
export function microFragment(position:string,output:string){return `
  if(useMicro){
    vec2 geographic=${position}.xz;
    vec2 puv=(geographic-microPereBox.xy)/(microPereBox.zw-microPereBox.xy);
    vec2 auv=(geographic-microAntoniBox.xy)/(microAntoniBox.zw-microAntoniBox.xy);
    puv.y=1.-puv.y;auv.y=1.-auv.y;
    if(all(greaterThanEqual(puv,vec2(0.)))&&all(lessThanEqual(puv,vec2(1.))))${output}=texture2D(microPere,puv);
    else if(all(greaterThanEqual(auv,vec2(0.)))&&all(lessThanEqual(auv,vec2(1.))))${output}=texture2D(microAntoni,auv);
  }
`;}

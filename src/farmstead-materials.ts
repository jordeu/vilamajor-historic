import * as THREE from 'three';
export type FarmSurface='lime'|'stone'|'tile'|'wood';
/** Metre-scaled procedural surfaces: original shaders, no borrowed photographic textures. */
export function farmSurface(color:string,surface:FarmSurface){
 const material=new THREE.MeshStandardMaterial({color,roughness:surface==='tile'?.88:.97,side:surface==='tile'?THREE.DoubleSide:THREE.FrontSide});
 material.customProgramCacheKey=()=>`farm-surface-v1-${surface}`;
 material.onBeforeCompile=shader=>{
  shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 farmP; varying vec3 farmN;').replace('#include <begin_vertex>','#include <begin_vertex>\nfarmP=position; farmN=normal;');
  shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>
   varying vec3 farmP; varying vec3 farmN;
   float fh(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
   float fn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(fh(i),fh(i+vec2(1,0)),f.x),mix(fh(i+vec2(0,1)),fh(i+1.),f.x),f.y);}
  `).replace('#include <color_fragment>',`#include <color_fragment>
   vec3 an=abs(farmN);vec2 uv=an.y>.7?farmP.xz:an.x>an.z?farmP.zy:farmP.xy;
   float tone=1.;
   ${surface==='tile'?`
    uv=an.x>an.z?farmP.zx:farmP.xz;
    vec2 tile=uv/vec2(.22,.38);float row=floor(tile.y);tile.x+=mod(row,2.)*.13;
    vec2 cell=floor(tile),f=fract(tile);float aa=max(fwidth(tile.y),.012);
    float seam=1.-smoothstep(.025,.025+aa,min(f.y,1.-f.y));
    float flute=.5+.5*cos(f.x*6.28318);
    tone=.78+fh(cell)*.24+flute*.12-seam*.13;
    tone*=.95+.08*fn(uv*.55);
   `:surface==='stone'?`
    vec2 p=uv*3.4;p.x+=floor(p.y)*.37;
    vec2 cell=floor(p),f=fract(p);float edge=min(min(f.x,1.-f.x),min(f.y,1.-f.y));
    float mortar=1.-smoothstep(.018,.065,edge+fn(uv*18.)*.035);
    tone=mix(.83+fh(cell)*.24, .69,mortar*.6)+fn(uv*35.)*.045;
   `:surface==='wood'?`
    tone=.81+fn(vec2(uv.x*27.,uv.y*.45))*.25+fn(uv*70.)*.04;
   `:`
    tone=.89+fn(uv*.52)*.1+fn(uv*4.)*.055+fn(uv*65.)*.025;
    tone*=1.-(1.-smoothstep(0.,1.1,farmP.y))*(.05+.04*fn(uv*1.7));
   `}
   diffuseColor.rgb*=tone;
  `);
 };
 return material;
}

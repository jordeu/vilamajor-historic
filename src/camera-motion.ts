import * as THREE from 'three';
export const smoothStep5=(t:number)=>t*t*t*(t*(t*6-15)+10);
/** Minimum-jerk interpolation gives the camera zero speed/acceleration at both ends. */
export function createCameraMotion(camera:THREE.PerspectiveCamera,target:THREE.Vector3,requestRender:()=>void){
  let flight:{start:number;duration:number;from:THREE.Vector3;to:THREE.Vector3;targetFrom:THREE.Vector3;targetTo:THREE.Vector3;lift:number}|null=null;
  const preference=matchMedia('(prefers-reduced-motion: reduce)');
  function move(to:THREE.Vector3,look:THREE.Vector3,duration=1800){
    if(preference.matches||duration===0){flight=null;camera.position.copy(to);target.copy(look);requestRender();return;}
    const distance=camera.position.distanceTo(to);
    flight={start:performance.now(),duration:Math.min(4200,duration+distance*12),from:camera.position.clone(),to:to.clone(),targetFrom:target.clone(),targetTo:look.clone(),lift:Math.min(distance*.18,18)};requestRender();
  }
  function tick(now:number){
    if(!flight)return false;const f=flight,t=Math.min(1,(now-f.start)/f.duration),s=smoothStep5(t);
    camera.position.lerpVectors(f.from,f.to,s);camera.position.y+=Math.sin(Math.PI*s)*f.lift;target.lerpVectors(f.targetFrom,f.targetTo,s);
    if(t===1)flight=null;return true;
  }
  const cancel=()=>{flight=null;};preference.addEventListener('change',cancel);
  return {move,tick,cancel,get active(){return flight!==null;},dispose(){preference.removeEventListener('change',cancel);}};
}

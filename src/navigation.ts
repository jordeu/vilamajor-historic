import * as THREE from 'three';
import type {OrbitControls} from 'three/addons/controls/OrbitControls.js';

/** Camera-relative ground translation, shared by keyboard and the touch direction pad. */
export function freeNavigation(canvas:HTMLCanvasElement,camera:THREE.PerspectiveCamera,controls:OrbitControls,interrupt:()=>void,render:()=>void,constrain:()=>void){
  const keys=new Set<string>();
  const keyDirection:Record<string,string>={w:'forward',ArrowUp:'forward',s:'back',ArrowDown:'back',a:'left',ArrowLeft:'left',d:'right',ArrowRight:'right'};
  canvas.tabIndex=0;canvas.setAttribute('aria-label','Mapa 3D. Arrossega per desplaçar-te; botó dret per girar. Tecles W A S D o fletxes per moure’t.');
  const down=(e:KeyboardEvent)=>{if(e.ctrlKey||e.metaKey||e.altKey||!keyDirection[e.key])return;e.preventDefault();if(!keys.size)interrupt();keys.add(keyDirection[e.key]);render();};
  const up=(e:KeyboardEvent)=>{if(keyDirection[e.key])keys.delete(keyDirection[e.key]);};
  const clear=()=>keys.clear();
  canvas.addEventListener('keydown',down);window.addEventListener('keyup',up);canvas.addEventListener('blur',clear);window.addEventListener('blur',clear);
  const pointer=()=>canvas.focus({preventScroll:true});canvas.addEventListener('pointerdown',pointer);
  function translate(x:number,z:number,distance:number){
    const forward=controls.target.clone().sub(camera.position);forward.y=0;forward.normalize();
    const right=new THREE.Vector3(-forward.z,0,forward.x);
    const delta=forward.multiplyScalar(z).addScaledVector(right,x).normalize().multiplyScalar(distance);
    camera.position.add(delta);controls.target.add(delta);constrain();controls.update();render();
  }
  function mode(value:'move'|'orbit'){
    controls.screenSpacePanning=false;
    controls.mouseButtons.LEFT=value==='move'?THREE.MOUSE.PAN:THREE.MOUSE.ROTATE;
    controls.mouseButtons.RIGHT=value==='move'?THREE.MOUSE.ROTATE:THREE.MOUSE.PAN;
    controls.touches.ONE=value==='move'?THREE.TOUCH.PAN:THREE.TOUCH.ROTATE;
    controls.touches.TWO=THREE.TOUCH.DOLLY_PAN;
    canvas.dataset.navigation=value;
  }
  mode('move');
  return {mode,clear,get active(){return keys.size>0;},step(direction:string){interrupt();translate(direction==='left'?-1:direction==='right'?1:0,direction==='forward'?1:direction==='back'?-1:0,Math.max(.12,camera.position.distanceTo(controls.target)*.15));},tick(dt:number){if(!keys.size)return;translate(Number(keys.has('right'))-Number(keys.has('left')),Number(keys.has('forward'))-Number(keys.has('back')),Math.max(.2,camera.position.distanceTo(controls.target)*.7)*dt);},dispose(){canvas.removeEventListener('keydown',down);window.removeEventListener('keyup',up);canvas.removeEventListener('blur',clear);window.removeEventListener('blur',clear);canvas.removeEventListener('pointerdown',pointer);}};
}

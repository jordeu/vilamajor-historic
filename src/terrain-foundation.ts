import * as THREE from 'three';
/** Visual foundation follows the displayed slope; it is not a surveyed historic retaining wall. */
export function terrainFoundation(outline:readonly (readonly number[])[],ground:(x:number,z:number)=>number,material:THREE.Material,top=.05){
 const ring:THREE.Vector2[]=[];
 for(let i=0;i<outline.length;i++){
  const a=outline[i],b=outline[(i+1)%outline.length],steps=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])));
  for(let j=0;j<steps;j++)ring.push(new THREE.Vector2(a[0]+(b[0]-a[0])*j/steps,a[1]+(b[1]-a[1])*j/steps));
 }
 // Clockwise in X/Z gives upward-facing top triangles and outward-facing perimeter walls.
 if(!THREE.ShapeUtils.isClockWise(ring))ring.reverse();
 const points:number[]=[],uv:number[]=[];
 const add=(x:number,y:number,z:number)=>{points.push(x,y,z);uv.push(x,z);};
 for(let i=0;i<ring.length;i++){
  const a=ring[i],b=ring[(i+1)%ring.length],ay=Math.min(top-.15,ground(a.x,a.y)-.3),by=Math.min(top-.15,ground(b.x,b.y)-.3);
  add(a.x,top,a.y);add(a.x,ay,a.y);add(b.x,top,b.y);
  add(b.x,top,b.y);add(a.x,ay,a.y);add(b.x,by,b.y);
 }
 for(const face of THREE.ShapeUtils.triangulateShape(ring,[])){
  const [a,b,c]=face.map(i=>ring[i]);const up=(b.y-a.y)*(c.x-a.x)-(b.x-a.x)*(c.y-a.y);
  for(const p of up>=0?[a,b,c]:[a,c,b])add(p.x,top,p.y);
 }
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(points,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geometry.computeVertexNormals();
 return new THREE.Mesh(geometry,material);
}
export function eliesFoundationOutline(width:number,depth:number):[number,number][]{
 const r=width*.35;
 return [[-width/2-2,depth/2+.25],[width/2+.25,depth/2+.25],[width/2+.25,-depth/2-.25],...Array.from({length:17},(_,i)=>{const a=i*Math.PI/16;return [Math.cos(a)*r,-depth/2-Math.sin(a)*r] as [number,number];}),[-width/2-2,-depth/2-.25]];
}

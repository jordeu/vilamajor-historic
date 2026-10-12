export type GroundPoint=[number,number];
export interface GroundRoad {id:string;points:GroundPoint[];width:number;}
function pointSegmentDistance(p:GroundPoint,a:GroundPoint,b:GroundPoint){
  const x=b[0]-a[0],y=b[1]-a[1],length=x*x+y*y;
  const t=length?Math.max(0,Math.min(1,((p[0]-a[0])*x+(p[1]-a[1])*y)/length)):0;
  return Math.hypot(p[0]-a[0]-t*x,p[1]-a[1]-t*y);
}
function segmentDistance(a:GroundPoint,b:GroundPoint,c:GroundPoint,d:GroundPoint){
  const cross=(p:GroundPoint,q:GroundPoint,r:GroundPoint)=>(q[0]-p[0])*(r[1]-p[1])-(q[1]-p[1])*(r[0]-p[0]);
  if(cross(a,b,c)*cross(a,b,d)<0&&cross(c,d,a)*cross(c,d,b)<0)return 0;
  return Math.min(pointSegmentDistance(a,c,d),pointSegmentDistance(b,c,d),pointSegmentDistance(c,a,b),pointSegmentDistance(d,a,b));
}
function inside(p:GroundPoint,polygon:GroundPoint[]){
  let result=false;
  for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){
    const a=polygon[i],b=polygon[j];
    if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])result=!result;
  }
  return result;
}
export function polygonsClear(a:GroundPoint[],b:GroundPoint[],gap:number){
  if(inside(a[0],b)||inside(b[0],a))return false;
  return a.every((p,i)=>b.every((q,j)=>segmentDistance(p,a[(i+1)%a.length],q,b[(j+1)%b.length])>=gap));
}
/** Includes bends, end caps and roads wholly contained inside a footprint. */
export function clearsRoads(polygon:GroundPoint[],roads:GroundRoad[],margin=0){
  return roads.every(road=>road.points.slice(1).every((b,i)=>{
    const a=road.points[i];
    return !inside(a,polygon)&&!inside(b,polygon)&&polygon.every((p,j)=>segmentDistance(p,polygon[(j+1)%polygon.length],a,b)>=road.width/2+margin);
  }));
}

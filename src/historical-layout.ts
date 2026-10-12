import {clearsRoads,polygonsClear,type GroundPoint,type GroundRoad} from './ground-clearance.ts';
export type {GroundPoint} from './ground-clearance.ts';
export interface HistoricalHouse {from:number;e:number;n:number;angle:number;w:number;h:number;d:number;place:'pere'|'vilanova';side?:1|-1;}

/** Interpretative route, shared by the visible road and the roadside settlement. */
export const comtalPath:GroundPoint[]=[[448840,4615020],[448970,4614920],[449043,4614850],[449110,4614808],[449285,4614620],[449470,4614390],[449850,4614060],[450155,4613710],[450280,4613440]];
export const comtalWidth=4;
export const historicalRoads:GroundRoad[]=[
  {id:'comtal',points:comtalPath,width:comtalWidth},
  {id:'sagrera',points:[[448960,4614660],[449048,4614824],[449155,4614925],[449375,4615035]],width:3},
];
const vilanovaVertex=7;
const lengths=comtalPath.slice(1).map((point,i)=>Math.hypot(point[0]-comtalPath[i][0],point[1]-comtalPath[i][1]));
const vilanovaDistance=lengths.slice(0,vilanovaVertex).reduce((sum,length)=>sum+length,0);
function roadsidePoint(offset:number){
  let distance=vilanovaDistance+offset;
  for(let i=0;i<lengths.length;i++){
    if(distance<=lengths[i]){
      const a=comtalPath[i],b=comtalPath[i+1],east=(b[0]-a[0])/lengths[i],north=(b[1]-a[1])/lengths[i];
      return {e:a[0]+east*distance,n:a[1]+north*distance,east,north};
    }
    distance-=lengths[i];
  }
  throw new RangeError('House position outside the interpretative road');
}
/** A house's local +Z is its entrance; world +Z points south. Coordinates are metres. */
export function houseGroundPoint(house:HistoricalHouse,x:number,z:number):GroundPoint{
  const c=Math.cos(house.angle),s=Math.sin(house.angle);
  return [house.e+c*x+s*z,house.n+s*x-c*z];
}
export function houseFootprint(house:HistoricalHouse):GroundPoint[]{
  const w=house.w/2+.3,d=house.d/2+.3;
  return [[-w,-d],[w,-d],[w,d],[-w,d]].map(([x,z])=>houseGroundPoint(house,x,z));
}
function placeClearOfRoads(house:HistoricalHouse,neighbors:HistoricalHouse[]):HistoricalHouse{
  const valid=(candidate:HistoricalHouse)=>{
    const footprint=houseFootprint(candidate);
    return clearsRoads(footprint,historicalRoads,1.5)&&neighbors.every(other=>polygonsClear(footprint,houseFootprint(other),1));
  };
  if(valid(house))return house;
  // Move only hypothetical houses, to the nearest available position. A generous
  // search radius makes failure explicit instead of silently blocking a path.
  for(let radius=2;radius<=80;radius+=2)for(let step=0;step<32;step++){
    const angle=step*Math.PI/16,candidate={...house,e:house.e+Math.cos(angle)*radius,n:house.n+Math.sin(angle)*radius};
    if(valid(candidate))return candidate;
  }
  throw new Error('No clear position for historical house');
}
export function createSettlementLayout():HistoricalHouse[]{
  let seed=950;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const entries:HistoricalHouse[]=[];
  for(let i=0;i<40;i++){
    const angle=i*2.39996,radius=45+Math.sqrt(i)*17;
    entries.push(placeClearOfRoads({place:'pere',from:i<5?872:i<17?1150:i<26?1488:1697,e:449070+Math.cos(angle)*radius,n:4614890+Math.sin(angle)*radius,angle:angle+.5,w:5+random()*5,h:3+random()*3,d:8+random()*6},entries));
  }
  // Twenty-three pairs follow the same polyline as the brown road. The bend falls
  // between rows; the setback accounts for each house's depth and the roof eaves.
  for(let i=0;i<46;i++){
    const w=6+random()*2,h=5+random()*2,d=8+random()*3,side=i%2?1:-1;
    const road=roadsidePoint((Math.floor(i/2)-11.5)*13),outward={e:-road.north*side,n:road.east*side};
    const setback=comtalWidth/2+2+d/2+.3;
    entries.push({place:'vilanova',side,from:i<10?1209:i<22?1521:1697,e:road.e+outward.e*setback,n:road.n+outward.n*setback,angle:Math.atan2(-outward.e,outward.n),w,h,d});
  }
  return entries.sort((a,b)=>a.from-b.from);
}

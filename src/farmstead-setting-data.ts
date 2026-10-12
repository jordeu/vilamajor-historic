import {farmsteadData,type FarmsteadKind} from './farmstead-data.ts';
import type {GroundPoint} from './ground-clearance.ts';
export interface SettingTree {x:number;z:number;height:number;radius:number;form:'broad'|'cypress'|'fruit';}
export interface SettingPlot {x:number;z:number;width:number;depth:number;}
export interface FarmSetting {ruralUntil:number;currentFrom:number;path:GroundPoint[];trees:SettingTree[];plots:SettingPlot[];walls:GroundPoint[][];}
/** Approximate local placement; gardens, planting history and walls are scenic interpretation.
 * Current Gol access and flanking trees follow the 2025 orthophoto at a schematic scale. */
export const farmSettings:Record<FarmsteadKind,FarmSetting>={
 'gol-torre':{ruralUntil:1956,currentFrom:2023,path:[[0,3],[7,6],[15,12],[23,23],[28,32]],
  trees:[{x:21,z:9,height:10,radius:4.6,form:'broad'},{x:-19,z:7,height:8,radius:3.5,form:'broad'},{x:16,z:-4,height:10,radius:1.2,form:'cypress'},{x:-23,z:-24,height:5,radius:2.4,form:'fruit'},{x:-31,z:-23,height:4.7,radius:2.2,form:'fruit'},{x:-31,z:-31,height:5.2,radius:2.4,form:'fruit'}],
  plots:[{x:-29,z:0,width:10,depth:14},{x:-29,z:18,width:10,depth:12}],walls:[[[-19,-17],[-19,-8]],[[-36,-8],[-36,8]],[[-36,12],[-36,24],[-23,24]]]},
 derrocada:{ruralUntil:1936,currentFrom:1936,path:[[0,2],[3,5],[3,12],[5,19]],
  trees:[{x:4.6,z:17,height:4.2,radius:1.3,form:'fruit'}],plots:[{x:3.8,z:9,width:2.1,depth:3.6}],walls:[]},
 llinars:{ruralUntil:1956,currentFrom:2016,path:[[0,2],[1,9],[6,18],[9,27]],
  trees:[{x:17,z:2,height:11,radius:1.25,form:'cypress'},{x:18,z:-5,height:10,radius:1.2,form:'cypress'},{x:19,z:17,height:9,radius:1.3,form:'cypress'},{x:26,z:7,height:8,radius:3.7,form:'broad'},{x:20,z:31,height:4.5,radius:2.2,form:'fruit'}],
  plots:[{x:16,z:23,width:5,depth:7},{x:25,z:23,width:6,depth:7}],walls:[[[13,29],[28,29]],[[28,13],[28,18]]]},
};
export function settingWorld(kind:FarmsteadKind,x:number,z:number):GroundPoint{
 const {position:[e,n],rotation:r}=farmsteadData[kind];return [e+Math.cos(r)*x+Math.sin(r)*z,n+Math.sin(r)*x-Math.cos(r)*z];
}
/** Only replace sampled regional trees where an authored crown will stand. */
export function reservedFarmTree(e:number,n:number){
 return (Object.keys(farmSettings) as FarmsteadKind[]).some(kind=>farmSettings[kind].trees.some(t=>{
  const [x,y]=settingWorld(kind,t.x,t.z);return Math.hypot(e-x,n-y)<t.radius+1;
 }));
}

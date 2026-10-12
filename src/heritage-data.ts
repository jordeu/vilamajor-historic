export interface Landmark {
  id:string;name:string;place:string;kind:string;position:[number,number];rotation:number;
  from:number;to:number|null;date:string;cadastreId?:string;cadastrePartIds?:string[];viewAngle?:number;viewDistance?:number;viewElevation?:number;viewTarget?:[number,number];
  phases?:{from:number;label:string;description:string}[];confidence:'documented'|'interpreted'|'hypothesis';
  dimensions:[number,number,number];description:string;limitations:string;sources:{title:string;url:string}[];
}
export interface HeritageData {version:number;researched:string;policy:string;landmarks:Landmark[]}
export const evidenceLabels={documented:'Proporcions documentades',interpreted:'Restitució aproximada',hypothesis:'Hipòtesi de reconstrucció'};
export function presentAt(l:Pick<Landmark,'from'|'to'>,year:number){return year>=l.from&&(l.to===null||year<l.to);}
export function towerPhase(year:number){return {southWide:year>=1663,northWide:year>=1776,plastered:year>=1881&&year<1932};}

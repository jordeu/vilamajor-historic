/** All source coordinates are ETRS89 / UTM zone 31N metres (EPSG:25831). */
export type BBox = [number, number, number, number];
export type Ring = [number, number][];
export type Polygon = Ring[];
export interface GridSpec {
  file: string; bbox: BBox; columns: number; rows: number; spacing: number;
  minimum: number; maximum: number; sourceResolution: number;
}
export interface ElevationGrid {spec: GridSpec; values: Float32Array}
export interface Raster {file: string; bbox: BBox; width: number; height: number; layer: string; metresPerPixel: [number, number]}
export interface Manifest {
  schemaVersion: number; crs: string; bbox: BBox; origin: [number, number];
  terrain: GridSpec; terrainDetail: GridSpec;
  orthophotos: {year: number; regional: Raster; detail: Raster}[];
  topographic: {regional: Raster; detail: Raster};
  counts: {buildings: number; parts: number; parcels: number; undated: number; missingFloors: number};
  cadastreDate: string; boundariesDate: string;
  attribution: {icgc: string; cadastre: string};
}
export interface Building {id: string; municipality: string; year: number | null; use: string | null; polygons: Polygon[]}
export interface BuildingPart {id: string; buildingId: string; municipality: string; year: number | null; floors: number | null; polygons: Polygon[]}
export interface Boundaries {
  municipalities: {name: string; code: string; polygons: Polygon[]}[];
  capitals: {name: string; position: [number, number]}[];
}
export function contains(bbox: BBox, east: number, north: number): boolean {
  return east >= bbox[0] && east <= bbox[2] && north >= bbox[1] && north <= bbox[3];
}
export function sampleElevation(grid: ElevationGrid, east: number, north: number): number {
  const {spec, values} = grid;
  if (!contains(spec.bbox, east, north)) throw new RangeError('Coordinate outside elevation coverage');
  const column = (east - spec.bbox[0]) / spec.spacing;
  const row = (spec.bbox[3] - north) / spec.spacing;
  const c0 = Math.min(Math.floor(column), spec.columns - 1), c1 = Math.min(c0 + 1, spec.columns - 1);
  const r0 = Math.min(Math.floor(row), spec.rows - 1), r1 = Math.min(r0 + 1, spec.rows - 1);
  const tx = column - c0, ty = row - r0;
  const a = values[r0 * spec.columns + c0] * (1 - tx) + values[r0 * spec.columns + c1] * tx;
  const b = values[r1 * spec.columns + c0] * (1 - tx) + values[r1 * spec.columns + c1] * tx;
  return a * (1 - ty) + b * ty;
}
export function elevationAt(coarse: ElevationGrid, detail: ElevationGrid, east: number, north: number): number {
  return sampleElevation(contains(detail.spec.bbox, east, north) ? detail : coarse, east, north);
}
/** Height on the actual rendered triangle, rather than the denser source DEM.
 * Mirrors scene.ts: retained rows/columns, final partial cell and diagonal a–d–b / b–d–f.
 * Boundary vertices sample the detailed DEM just as the regional mesh does. */
export interface TerrainAxes {columns:number[];rows:number[];}
/** Retain the source samples near a summit without increasing resolution across the entire map. */
export function terrainAxes(spec:GridSpec,stride:number,refinements:readonly (readonly number[])[]=[]):TerrainAxes{
  const axis=(count:number)=>{const values=new Set<number>([count-1]);for(let i=0;i<count;i+=stride)values.add(i);return values;};
  const columns=axis(spec.columns),rows=axis(spec.rows);
  for(const [e,n]of refinements){
    if(!contains(spec.bbox,e,n))continue;
    const c=Math.floor((e-spec.bbox[0])/spec.spacing),r=Math.floor((spec.bbox[3]-n)/spec.spacing);
    for(let offset=-4;offset<=4;offset++){columns.add(Math.max(0,Math.min(spec.columns-1,c+offset)));rows.add(Math.max(0,Math.min(spec.rows-1,r+offset)));}
  }
  return {columns:[...columns].sort((a,b)=>a-b),rows:[...rows].sort((a,b)=>a-b)};
}
export function terrainSurfaceAt(coarse:ElevationGrid,detail:ElevationGrid,east:number,north:number,stride:number,regionalAxes?:TerrainAxes):number{
  if(!Number.isInteger(stride)||stride<1)throw new RangeError('Terrain stride must be a positive integer');
  const grid=contains(detail.spec.bbox,east,north)?detail:coarse,{spec}=grid;
  if(!contains(spec.bbox,east,north))throw new RangeError('Coordinate outside terrain coverage');
  const col=(east-spec.bbox[0])/spec.spacing,row=(spec.bbox[3]-north)/spec.spacing;
  const interval=(value:number,count:number,axis?:number[]):[number,number]=>{
    if(!axis){const lo=Math.min(Math.floor(value/stride)*stride,Math.floor((count-2)/stride)*stride);return [lo,Math.min(lo+stride,count-1)];}
    let lo=0,hi=axis.length-1;while(hi-lo>1){const mid=(lo+hi)>>1;if(axis[mid]<=value)lo=mid;else hi=mid;}return [axis[lo],axis[hi]];
  };
  const [c0,c1]=interval(col,spec.columns,grid===coarse?regionalAxes?.columns:undefined),[r0,r1]=interval(row,spec.rows,grid===coarse?regionalAxes?.rows:undefined);
  const x=(col-c0)/(c1-c0),y=(row-r0)/(r1-r0);
  const vertex=(c:number,r:number)=>elevationAt(coarse,detail,spec.bbox[0]+c*spec.spacing,spec.bbox[3]-r*spec.spacing);
  const b=vertex(c1,r0),d=vertex(c0,r1);
  if(x+y<=1){const a=vertex(c0,r0);return a+(b-a)*x+(d-a)*y;}
  const f=vertex(c1,r1);return f+(d-f)*(1-x)+(b-f)*(1-y);
}
export function worldPosition(east: number, north: number, height: number, origin: [number, number]): [number, number, number] {
  return [(east - origin[0]) * .01, (height - 200) * .01, (origin[1] - north) * .01];
}
export function photoAt(manifest: Pick<Manifest, 'orthophotos'>, year: number) {
  return manifest.orthophotos.filter(photo => photo.year >= 2004 && photo.year <= year).at(-1);
}
/** Only dated current footprints can illustrate growth; no invented dates for unknown buildings. */
export function cadastralVisible(buildingYear: number | null, year: number, estimatedHistory: boolean): boolean {
  return estimatedHistory && (year >= 2026 || (year >= 1850 && buildingYear !== null && buildingYear <= year));
}

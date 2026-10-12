import * as THREE from 'three';
import {createHeritage} from './heritage';
import {reservedFarmTree} from './farmstead-setting-data';
import type {TourCameraPose} from './tour';
import {presentAt,type HeritageData,type Landmark} from './heritage-data';
import {vegetation, settlement, historicalGround} from './landscape';
import {microUniforms,microDeclarations,microFragment,type MicroPhoto} from './cartographic-detail';
import {createCameraMotion} from './camera-motion';
import {freeNavigation} from './navigation';
import {buildingMaterials,growthDeclarations,growthPosition} from './building-material';
import {periodContext} from './period-context';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {contains, elevationAt, terrainSurfaceAt, terrainAxes, worldPosition, photoAt, type Manifest, type Boundaries,
  type ElevationGrid, type GridSpec, type Polygon} from './geo';

const DATA = `${import.meta.env.BASE_URL}data/`;
export type MapLayer = 'photo' | 'topographic' | 'terrain';
interface PartRange {
  id: string; buildingId: string; municipality: string; year: number | null; floors: number | null;
  estimatedHeight: number; topElevation: number; renderedFloors: number;
  roofStart: number; roofCount: number; wallStart: number; wallCount: number;
}
export interface BuildingSelection extends PartRange {use: string | null}
interface GeometryMetadata {stride:number; roofFile: string; wallFile: string; ranges: PartRange[]}
export interface SceneState {
  ready: boolean; layer: MapLayer; photoYear: number | null; year: number;
  reconstruction: boolean; landmarksVisible: number; vegetation: boolean; historicalVolumes: boolean; buildingsVisible: number; boundaries: boolean; parcels: boolean;
  message: string; error: string | null;
}
interface Options {onState: (state: SceneState) => void; onSelect: (selection: BuildingSelection | null) => void; onHeritage: (landmark: Landmark) => void; onCameraInterrupt: () => void}
async function getJSON<T>(file: string): Promise<T> {
  const response = await fetch(DATA + file);
  if (!response.ok) throw new Error(`No s’ha pogut carregar ${file}`);
  return response.json() as Promise<T>;
}
async function getFloats(file: string): Promise<Float32Array> {
  const response = await fetch(DATA + file);
  if (!response.ok) throw new Error(`No s’ha pogut carregar ${file}`);
  let buffer=await response.arrayBuffer();
  const magic=new Uint8Array(buffer,0,Math.min(2,buffer.byteLength));
  if(magic[0]===31&&magic[1]===139){
    const stream=new Blob([buffer]).stream().pipeThrough(new DecompressionStream('gzip'));
    buffer=await new Response(stream).arrayBuffer();
  }
  if(buffer.byteLength%4!==0)throw new Error(`Dades binàries incompletes: ${file}`);
  return new Float32Array(buffer);
}
function checkGrid(spec: GridSpec, values: Float32Array): ElevationGrid {
  if (values.length !== spec.columns * spec.rows || !values.every(Number.isFinite)) {
    throw new Error('Les dades del relleu són incompletes');
  }
  return {spec, values};
}
export async function createScene(host: HTMLElement, options: Options) {
  const manifest = await getJSON<Manifest>('manifest.json');
  if (manifest.crs !== 'EPSG:25831' || manifest.schemaVersion !== 1) throw new Error('Sistema geogràfic no compatible');
  const [coarseValues, detailValues, boundaries, metadata, heritageData, treeData, microData] = await Promise.all([
    getFloats(manifest.terrain.file), getFloats(manifest.terrainDetail.file),
    getJSON<Boundaries>('boundaries.json'), getJSON<GeometryMetadata>('geometry.json'),
    getJSON<HeritageData>('heritage.json'),getJSON<{trees:number[][]}>('vegetation.json'),getJSON<{photos:MicroPhoto[]}>('microphotos.json'),
  ]);
  const coarse = checkGrid(manifest.terrain, coarseValues), detail = checkGrid(manifest.terrainDetail, detailValues);
  const mobile = matchMedia('(max-width: 600px)').matches;
  const terrainStride=mobile?4:2;
  const regionalAxes=terrainAxes(coarse.spec,terrainStride,heritageData.landmarks.filter(l=>l.id==='elies').map(l=>l.position));
  const sourceHeight = (e: number, n: number) => elevationAt(coarse, detail, e, n);
  const height = (e: number, n: number) => terrainSurfaceAt(coarse,detail,e,n,terrainStride,regionalAxes);
  const position = (e: number, n: number, h = height(e,n)) => new THREE.Vector3(...worldPosition(e,n,h,manifest.origin));
  const renderer = new THREE.WebGLRenderer({antialias: !mobile, alpha: false});
  renderer.setPixelRatio(Math.min(devicePixelRatio,mobile ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;
  renderer.shadowMap.enabled=!mobile;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.shadowMap.autoUpdate=false;
  renderer.domElement.setAttribute('aria-label','Model del relleu real de Vilamajor amb ortofotos i edificis cadastrals. Arrossega per girar.');
  host.append(renderer.domElement);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#cbd6d0');scene.fog=new THREE.FogExp2('#cbd6d0',.0035);
  const camera = new THREE.PerspectiveCamera(42,1,.002,500);
  const controls = new OrbitControls(camera,renderer.domElement);
  controls.maxPolarAngle = Math.PI / 2.08; controls.minDistance = .35; controls.maxDistance = 220;
  controls.enableDamping = true; controls.dampingFactor = .12;
  const ambient=new THREE.HemisphereLight('#e1e8ef','#746d51',2.2);scene.add(ambient);
  const light=new THREE.DirectionalLight('#fff0d7',2.5);light.castShadow=!mobile;light.shadow.mapSize.set(2048,2048);light.shadow.normalBias=.0015;light.shadow.bias=-.00008;light.shadow.camera.near=.1;light.shadow.camera.far=70;scene.add(light,light.target);
  let afternoon=true;
  function lighting(){const extent=THREE.MathUtils.clamp(camera.position.distanceTo(controls.target)*.8,1,12);light.position.copy(controls.target).add(new THREE.Vector3(-12,afternoon?12:28,10));light.target.position.copy(controls.target);Object.assign(light.shadow.camera,{left:-extent,right:extent,top:extent,bottom:-extent});light.shadow.camera.updateProjectionMatrix();renderer.shadowMap.needsUpdate=true;}
  const motion=createCameraMotion(camera,controls.target,()=>requestRender());
  function move(center:THREE.Vector3,offset:THREE.Vector3,instant=false){motion.move(center.clone().add(offset),center,instant?0:1800);}
  function reset(instant=false){move(position(449620,4614320),new THREE.Vector3(12,16,21),instant);}
  function overview(){move(position(449500,4618500),new THREE.Vector3(75,83,118));}
  const terrainMaterial = new THREE.MeshLambertMaterial({color:'#ffffff',side:THREE.DoubleSide});
  const detailMaterial = terrainMaterial.clone();
  const micro=microUniforms(microData.photos[0].areas,manifest.origin);
  const photoOpacity={value:1};
  const coarseGround=historicalGround(terrainMaterial,micro,photoOpacity),fineGround=historicalGround(detailMaterial,micro,photoOpacity);
  /** Both meshes use the same projected coordinate system. Central cells replace the regional mesh. */
  function terrainGeometry(grid: ElevationGrid, stride: number, removeDetail: boolean) {
    const {spec} = grid;
    const {columns,rows}=removeDetail?regionalAxes:terrainAxes(spec,stride);
    const vertices: number[] = [], uv: number[] = [], indices: number[] = [];
    for (const r of rows) for (const c of columns) {
      const e=spec.bbox[0]+c*spec.spacing,n=spec.bbox[3]-r*spec.spacing;
      vertices.push(...worldPosition(e,n,sourceHeight(e,n),manifest.origin));
      uv.push(c/(spec.columns-1),1-r/(spec.rows-1));
    }
    for (let r=0;r<rows.length-1;r++) for (let c=0;c<columns.length-1;c++) {
      const e=spec.bbox[0]+(columns[c]+columns[c+1])*.5*spec.spacing;
      const n=spec.bbox[3]-(rows[r]+rows[r+1])*.5*spec.spacing;
      if (removeDetail && contains(detail.spec.bbox,e,n))continue;
      const a=r*columns.length+c,b=a+1,d=(r+1)*columns.length+c,f=d+1;
      indices.push(a,d,b,b,d,f);
    }
    const geometry=new THREE.BufferGeometry();
    geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
    geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
    geometry.setIndex(indices);geometry.computeVertexNormals();return geometry;
  }
  const regionalTerrain=new THREE.Mesh(terrainGeometry(coarse,terrainStride,true),terrainMaterial),coreTerrain=new THREE.Mesh(terrainGeometry(detail,terrainStride,false),detailMaterial);
  regionalTerrain.receiveShadow=coreTerrain.receiveShadow=true;scene.add(regionalTerrain,coreTerrain);
  const state: SceneState={ready:false,layer:'photo',photoYear:null,year:2026,reconstruction:true,landmarksVisible:0,vegetation:true,historicalVolumes:true,
    buildingsVisible:0,boundaries:false,parcels:false,message:'Carregant cartografia…',error:null};
  let frame=0,disposed=false;
  function requestRender() {if(!frame&&!disposed&&!document.hidden)frame=requestAnimationFrame(render);}
  const heritage=createHeritage(heritageData,position);scene.add(heritage.root);
  const trees=vegetation(treeData.trees.filter(([e,n])=>!reservedFarmTree(e,n)),position,mobile);scene.add(trees);
  const village=settlement(position);scene.add(village.root);
  const context=periodContext(position,village.entries);scene.add(context.root);
  let orbiting=false, cinematic=false;let lastTime=0;
  function interrupt(){motion.cancel();orbiting=false;cinematic=false;options.onCameraInterrupt();}
  function constrain(){
    const target=controls.target,e=THREE.MathUtils.clamp(target.x*100+manifest.origin[0],manifest.bbox[0]+20,manifest.bbox[2]-20),n=THREE.MathUtils.clamp(manifest.origin[1]-target.z*100,manifest.bbox[1]+20,manifest.bbox[3]-20);
    const ground=position(e,n),delta=ground.clone().sub(target);camera.position.add(delta);target.copy(ground);
  }
  const navigation=freeNavigation(renderer.domElement,camera,controls,interrupt,requestRender,constrain);
  controls.addEventListener('start',interrupt);
  controls.addEventListener('end',()=>{if(renderer.domElement.dataset.navigation==='move')constrain();});
  const visibility=()=>{if(document.hidden){navigation.clear();interrupt();}else requestRender();};document.addEventListener('visibilitychange',visibility);
  const labels=boundaries.capitals.map(capital=>{
    const element=document.createElement('button');element.className='map-label';element.textContent=capital.name;
    element.title=`Apropar a ${capital.name}`;host.append(element);
    element.onclick=()=>focus(capital.name.includes('Antoni')?'antoni':'pere');
    return {element,position:position(...capital.position).add(new THREE.Vector3(0,.15,0))};
  });
  let showLabels=true;
  function render(now:number){
    frame=0;const elapsed=lastTime?Math.min((now-lastTime)/1000,.05):0;lastTime=now;
    const flying=motion.tick(now);navigation.tick(elapsed);
    if(cinematic&&matchMedia('(prefers-reduced-motion: reduce)').matches)cinematic=false;
    if(orbiting&&matchMedia('(prefers-reduced-motion: reduce)').matches){orbiting=false;options.onCameraInterrupt();}
    if((orbiting||cinematic)&&!motion.active&&!matchMedia('(prefers-reduced-motion: reduce)').matches){const offset=camera.position.clone().sub(controls.target);offset.applyAxisAngle(new THREE.Vector3(0,1,0),elapsed*(cinematic?.018:.065));camera.position.copy(controls.target).add(offset);}
    const e=camera.position.x*100+manifest.origin[0],n=manifest.origin[1]-camera.position.z*100;
    if(contains(manifest.bbox,e,n))camera.position.y=Math.max(camera.position.y,position(e,n).y+.035);
    const changed=controls.update();if(changed||flying||orbiting||cinematic||navigation.active)lighting();renderer.render(scene,camera);
    const compass=document.querySelector<SVGElement>('.orientation svg');if(compass)compass.style.transform=`rotate(${Math.atan2(camera.position.x-controls.target.x,camera.position.z-controls.target.z)*180/Math.PI}deg)`;
    host.dataset.moving=String(motion.active||orbiting||cinematic||navigation.active);host.dataset.camera=camera.position.toArray().map(x=>x.toFixed(4)).join(',');host.dataset.target=controls.target.toArray().map(x=>x.toFixed(4)).join(',');
    for(const label of labels){const p=label.position.clone().project(camera);label.element.style.left=`${(p.x*.5+.5)*host.clientWidth}px`;label.element.style.top=`${(-p.y*.5+.5)*host.clientHeight}px`;label.element.hidden=!showLabels||p.z>1||Math.abs(p.x)>1||Math.abs(p.y)>1||camera.position.distanceTo(label.position)<1.1;}
    if(changed||motion.active||orbiting||cinematic||navigation.active)requestRender();
  }
  controls.addEventListener('change',requestRender);
  const resize=()=>{const {width,height}=host.getBoundingClientRect();if(!width||!height)return;renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();requestRender();};
  const observer=new ResizeObserver(resize);observer.observe(host);resize();reset(true);lighting();
  const boundaryGroup=new THREE.Group();scene.add(boundaryGroup);boundaryGroup.visible=false;
  function polygonLines(polygons: Polygon[], color: string) {
    const coordinates:number[]=[];
    for(const polygon of polygons)for(const ring of polygon)for(let i=0;i<ring.length-1;i++){
      // Drape and densify long official segments; never draw them through terrain.
      const [e0,n0]=ring[i],[e1,n1]=ring[i+1],steps=Math.max(1,Math.ceil(Math.hypot(e1-e0,n1-n0)/15));
      for(let j=0;j<steps;j++)for(const t of [j/steps,(j+1)/steps]){
        const e=e0+(e1-e0)*t,n=n0+(n1-n0)*t;
        if(contains(manifest.bbox,e,n))coordinates.push(...worldPosition(e,n,height(e,n)+1.2,manifest.origin));
      }
    }
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(coordinates,3));
    return new THREE.LineSegments(geometry,new THREE.LineBasicMaterial({color,depthTest:true}));
  }
  for(const municipality of boundaries.municipalities){
    boundaryGroup.add(polygonLines(municipality.polygons,municipality.name.includes('Antoni')?'#a55938':'#345e48'));
  }
  let parcelGroup:THREE.Group|null=null,parcelPending:Promise<void>|null=null;
  const roofValues=await getFloats(metadata.roofFile),wallValues=await getFloats(metadata.wallFile);
  function binaryGeometry(values: Float32Array){
    if(values.length%(metadata.stride*3)!==0)throw new Error('Geometria cadastral incompleta');
    const buffer=new THREE.InterleavedBuffer(values,metadata.stride),geometry=new THREE.BufferGeometry();
    geometry.setAttribute('position',new THREE.InterleavedBufferAttribute(buffer,3,0));
    geometry.setAttribute('normal',new THREE.InterleavedBufferAttribute(buffer,3,3));
    ['baseY','birthYear','storeys','facadeU'].forEach((name,i)=>geometry.setAttribute(name,new THREE.InterleavedBufferAttribute(buffer,1,6+i)));geometry.computeBoundingSphere();return geometry;
  }
  const roofGeometry=binaryGeometry(roofValues),wallGeometry=binaryGeometry(wallValues);
  const landscapeYear={value:2027};
  const roofMaterial=new THREE.ShaderMaterial({
    uniforms:{...micro,landscapeYear,photoOpacity,photoDate:{value:2025},regional:{value:null},detail:{value:null},regionalBox:{value:new THREE.Vector4(...manifest.bbox)},
      detailBox:{value:new THREE.Vector4(...manifest.terrainDetail.bbox)},origin:{value:new THREE.Vector2(...manifest.origin)},textured:{value:false}},
    vertexShader:`${growthDeclarations} varying vec3 vPosition; varying float born; void main(){${growthPosition} vPosition=grownPosition; born=birthYear; gl_Position=projectionMatrix*modelViewMatrix*vec4(grownPosition,1.0);}`,
    fragmentShader:`${microDeclarations} uniform sampler2D regional; uniform sampler2D detail; uniform vec4 regionalBox; uniform vec4 detailBox; uniform vec2 origin; uniform bool textured; uniform float photoDate; uniform float photoOpacity; varying vec3 vPosition; varying float born;
      void main(){ vec2 p=vec2(vPosition.x*100.0+origin.x,origin.y-vPosition.z*100.0);
      vec2 uv=(p-regionalBox.xy)/(regionalBox.zw-regionalBox.xy);vec2 duv=(p-detailBox.xy)/(detailBox.zw-detailBox.xy);
      bool inside=all(greaterThanEqual(duv,vec2(0.0)))&&all(lessThanEqual(duv,vec2(1.0)));
      gl_FragColor=textured?(inside?texture2D(detail,duv):texture2D(regional,uv)):vec4(.49,.32,.23,1.0);
      ${microFragment('vPosition','gl_FragColor')}
      if(!textured||born>photoDate)gl_FragColor=vec4(.49,.32,.23,1.0);
      gl_FragColor.rgb=mix(vec3(.49,.32,.23),gl_FragColor.rgb,photoOpacity);
      #include <colorspace_fragment>
      }`,side:THREE.DoubleSide,
  });
  const roofMesh=new THREE.Mesh(roofGeometry,roofMaterial);
  const {wall:wallMaterial,depth}=buildingMaterials(landscapeYear);
  const wallMesh=new THREE.Mesh(wallGeometry,wallMaterial);
  roofMesh.customDepthMaterial=wallMesh.customDepthMaterial=depth;roofMesh.castShadow=wallMesh.castShadow=true;wallMesh.receiveShadow=true;scene.add(roofMesh,wallMesh);
  type TextureSet={regional:THREE.Texture;detail:THREE.Texture;micro:THREE.Texture[]};
  const textures=new Map<string,TextureSet>();
  let activeTexture='',textureGeneration=0;
  const loader=new THREE.TextureLoader();
  const pendingTextures=new Map<string,Promise<TextureSet>>();
  async function loadTexture(file:string){
    const texture=await loader.loadAsync(DATA+file);
    texture.colorSpace=THREE.SRGBColorSpace;
    texture.anisotropy=Math.min(renderer.capabilities.getMaxAnisotropy(),8);
    if(mobile&&texture.image.width>2048){const canvas=document.createElement('canvas');canvas.width=Math.round(texture.image.width/2);canvas.height=Math.round(texture.image.height/2);canvas.getContext('2d')!.drawImage(texture.image,0,0,canvas.width,canvas.height);texture.image=canvas;texture.needsUpdate=true;}
    return texture;
  }
  function report(){
    const overlays=(state.reconstruction?' · '+state.landmarksVisible+' models patrimonials':'')+(state.boundaries?' · Límits actuals':'')+(state.parcels?' · Parcel·les actuals':'');
    options.onState({...state,message:state.message+overlays});
  }
  function updateVolumes(){
    heritage.setVisible(state.reconstruction);heritage.update(state.year);
    state.landmarksVisible=state.reconstruction?heritageData.landmarks.filter(l=>presentAt(l,state.year)).length:0;
    village.update(state.year,state.reconstruction);context.update(state.year,state.reconstruction);
    trees.visible=state.vegetation&&(state.year>=1850||state.reconstruction);
    coarseGround.value=fineGround.value=state.year<2004&&state.layer!=='topographic'?1:0;
    renderer.shadowMap.needsUpdate=true;
    let roofCount=0,wallCount=0;const buildingIds=new Set<string>();
    for(const part of metadata.ranges){
      if(!state.historicalVolumes||state.year<1850||(state.year<2026&&(part.year===null||part.year>state.year)))break;
      roofCount=part.roofStart+part.roofCount;wallCount=part.wallStart+part.wallCount;buildingIds.add(part.buildingId);
    }
    roofGeometry.setDrawRange(0,roofCount);wallGeometry.setDrawRange(0,wallCount);
    roofMesh.visible=wallMesh.visible=roofCount>0;
    state.buildingsVisible=buildingIds.size;
  }
  async function updateLayer(){
    const generation=++textureGeneration;
    state.error=null;
    const photo=photoAt(manifest,state.year);
    state.photoYear=state.layer==='photo'?(photo?.year??null):null;
    const raster=state.layer==='topographic'?manifest.topographic:state.layer==='photo'?photo:null;
    updateVolumes();
    micro.useMicro.value=false;host.dataset.resolution='';roofMaterial.uniforms.photoDate.value=photo?.year??0;
    if(!raster){
      activeTexture='';
      terrainMaterial.map=detailMaterial.map=null;
      terrainMaterial.color.set(state.year<2004?'#ffffff':'#b5bd97');detailMaterial.color.copy(terrainMaterial.color);
      terrainMaterial.needsUpdate=detailMaterial.needsUpdate=true;roofMaterial.uniforms.textured.value=false;
      state.message=state.year<2004?(state.reconstruction?(state.year<1850?'Entorn recreat · Decoració imaginada':'Creixement segons dates cadastrals · Paisatge recreat'):'Relleu actual · Reconstrucció desactivada'):'Model d’elevacions actual';
      if(state.historicalVolumes&&state.year>=1850&&state.year<2026)state.message+=' · Volums actuals filtrats per any cadastral';
      report();requestRender();return;
    }
    const key=raster.regional.file;
    if(key!==activeTexture){
      terrainMaterial.map=detailMaterial.map=null;
      terrainMaterial.color.set(state.year<2004?'#ffffff':'#b5bd97');detailMaterial.color.copy(terrainMaterial.color);
      terrainMaterial.needsUpdate=detailMaterial.needsUpdate=true;
      roofMaterial.uniforms.textured.value=false;
      requestRender();
    }
    state.message=`Carregant ${state.layer==='topographic'?'mapa topogràfic':`ortofoto ${photo!.year}`}…`;
    report();
    try{
      let pair=textures.get(key);
      if(!pair){
        let pending=pendingTextures.get(key);
        if(!pending){
          const microFiles=state.layer==='photo'?microData.photos.find(p=>p.year===photo?.year)?.areas??[]:[];
          pending=Promise.all([loadTexture(raster.regional.file),loadTexture(raster.detail.file),Promise.all(microFiles.map(a=>loadTexture(a.file)))]).then(([regional,detail,micro])=>({regional,detail,micro}));pendingTextures.set(key,pending);
        }
        try{pair=await pending;textures.set(key,pair);}finally{pendingTextures.delete(key);}
      }
      if(disposed||generation!==textureGeneration)return;
      activeTexture=key;micro.useMicro.value=state.layer==='photo'&&pair.micro.length===2;
      micro.microPere.value=pair.micro[0]??null;micro.microAntoni.value=pair.micro[1]??null;
      host.dataset.resolution=micro.useMicro.value?String(microData.photos.find(p=>p.year===photo?.year)!.areas[0].metresPerPixel[0]):'';
      // Hold at most two pairs to keep historical browsing within a mobile GPU budget.
      for(const [old,value]of textures){if(textures.size<=2)break;if(old!==activeTexture){value.regional.dispose();value.detail.dispose();value.micro.forEach(t=>t.dispose());textures.delete(old);}}
      terrainMaterial.map=pair.regional;detailMaterial.map=pair.detail;
      terrainMaterial.color.set('#ffffff');detailMaterial.color.set('#ffffff');
      terrainMaterial.needsUpdate=detailMaterial.needsUpdate=true;
      roofMaterial.uniforms.regional.value=pair.regional;roofMaterial.uniforms.detail.value=pair.detail;roofMaterial.uniforms.textured.value=true;
      state.message=state.layer==='topographic'?'Mapa topogràfic actual · ICGC':`Ortofoto ${photo!.year} · ICGC`;
      if(state.year>=2026)state.message+=state.historicalVolumes?' · Empremtes cadastrals · Alçades estimades':' · Edificis cadastrals ocults';
      else if(state.historicalVolumes)state.message+=' · Volums actuals filtrats per any cadastral';
      else state.message+=' · Sense volums cadastrals actuals';
      report();requestRender();
    }catch(error){if(generation!==textureGeneration)return;state.error='No s’ha pogut carregar la cartografia. Torna a provar-ho.';state.message=state.error;report();}
  }
  let startPointer: [number,number]=[0,0];
  const raycaster=new THREE.Raycaster();
  renderer.domElement.addEventListener('pointerdown',e=>startPointer=[e.clientX,e.clientY]);
  renderer.domElement.addEventListener('pointerup',e=>{
    if(e.button!==0||Math.hypot(e.clientX-startPointer[0],e.clientY-startPointer[1])>5)return;
    const rect=renderer.domElement.getBoundingClientRect();
    raycaster.setFromCamera(new THREE.Vector2((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1),camera);
    const hit=raycaster.intersectObjects(heritage.objects.filter(o=>o.group.visible).flatMap(o=>o.variants.filter(v=>v.object.visible).map(v=>v.object)),true)[0];
    if(hit){let object:THREE.Object3D|null=hit.object;while(object&&!object.userData.landmark)object=object.parent;if(object){options.onHeritage(object.userData.landmark);return;}}
    const intersection=raycaster.intersectObjects([roofMesh,wallMesh].filter(m=>m.visible))[0];
    if(!intersection||intersection.faceIndex==null){options.onSelect(null);return;}
    const vertex=intersection.faceIndex*3,isRoof=intersection.object===roofMesh;
    const part=metadata.ranges.find(p=>vertex>=(isRoof?p.roofStart:p.wallStart)&&vertex<(isRoof?p.roofStart+p.roofCount:p.wallStart+p.wallCount));
    if(part)options.onSelect({...part,use:null});
  });
  const onLost=(e:Event)=>{e.preventDefault();state.error='El navegador ha perdut el context 3D. Recarrega la pàgina per recuperar-lo.';report();};
  renderer.domElement.addEventListener('webglcontextlost',onLost);
  function focus(place:string){
    const capital=boundaries.capitals.find(c=>c.name.includes(place==='antoni'?'Antoni':'Pere'))!;
    move(position(...capital.position),new THREE.Vector3(2,1.6,2.5));
  }
  state.ready=true;await updateLayer();
  return {
    manifest,heritage:heritageData,
    focusHeritage(id:string){const landmark=heritageData.landmarks.find(l=>l.id===id);if(!landmark)return;const center=position(...(landmark.viewTarget??landmark.position)).add(new THREE.Vector3(0,landmark.dimensions[1]*.003,0));const distance=landmark.viewDistance===undefined?Math.max(...landmark.dimensions)*.026:landmark.viewDistance*.01;const angle=landmark.viewAngle;move(center,angle===undefined?new THREE.Vector3(distance*.75,distance*.6,distance):new THREE.Vector3(Math.sin(angle)*distance,distance*(landmark.viewElevation??.5),Math.cos(angle)*distance));},
    orbit(show:boolean){orbiting=show&&!matchMedia('(prefers-reduced-motion: reduce)').matches;requestRender();return orbiting;},
    setLight(value:boolean){afternoon=value;light.color.set(value?'#fff0d7':'#fffaf4');light.intensity=value?2.5:2.2;lighting();requestRender();},
    setReconstruction(show:boolean){state.reconstruction=show;void updateLayer();},
    setVegetation(show:boolean){state.vegetation=show;heritage.setVegetation(show);updateVolumes();report();requestRender();},
    setYear(year:number,animate=false){
      const previousYear=Math.floor(state.year),previousPhoto=photoAt(manifest,state.year)?.year;
      state.year=year;landscapeYear.value=animate&&!matchMedia('(prefers-reduced-motion: reduce)').matches?year:Math.floor(year)+1;
      if(year>=2026)landscapeYear.value=2027;
      if(previousPhoto!==photoAt(manifest,year)?.year||(previousYear<1850)!==(year<1850)||(previousYear<2026)!==(year<2026))void updateLayer();
      else if(previousYear!==Math.floor(year)){updateVolumes();report();}
      renderer.shadowMap.needsUpdate=true;requestRender();
    },
    navigation(mode:'move'|'orbit'){navigation.mode(mode);},
    pan(direction:string){navigation.step(direction);},
    cinematic(active:boolean,drift=true){cinematic=active&&drift&&!matchMedia('(prefers-reduced-motion: reduce)').matches;if(!active)motion.cancel();requestRender();},
    tourCamera(pose:TourCameraPose,transition=false,immediate=false){
      const center=position(...pose.center).add(new THREE.Vector3(0,pose.targetHeight*.01,0));
      const offset=new THREE.Vector3(Math.sin(pose.angle)*pose.span*.01,pose.span*.01*pose.elevation,Math.cos(pose.angle)*pose.span*.01);
      if(immediate)motion.cancel();
      if(transition)move(center,offset);
      else if(!motion.active){camera.position.copy(center).add(offset);controls.target.copy(center);lighting();requestRender();}
    },
    flyTo(e:number,n:number,span:number,angle=-.5,fitViewport=false,elevation=.65){if(fitViewport)span*=Math.max(1,1/camera.aspect);const offset=new THREE.Vector3(Math.sin(angle)*span*.01,span*.01*elevation,Math.cos(angle)*span*.01);move(position(e,n),offset);},
    setLayer(layer:MapLayer){state.layer=layer;return updateLayer();},
    setPhotoOpacity(value:number){photoOpacity.value=THREE.MathUtils.clamp(value,0,1);host.dataset.photoOpacity=String(photoOpacity.value);requestRender();},
    photoStatus(){return {ready:state.layer==='photo'&&activeTexture===photoAt(manifest,state.year)?.regional.file,year:state.photoYear,error:state.error};},
    setHistoricalVolumes(show:boolean){state.historicalVolumes=show;void updateLayer();},
    setBoundaries(show:boolean){boundaryGroup.visible=show;state.boundaries=show;report();requestRender();},
    async setParcels(show:boolean){
      state.parcels=show;
      if(show&&!parcelGroup){
        if(!parcelPending)parcelPending=(async()=>{
          const data=await getJSON<{parcels:{polygons:Polygon[]}[]}>('parcels.json');
          parcelGroup=new THREE.Group();parcelGroup.add(polygonLines(data.parcels.flatMap(p=>p.polygons),'#bd8c37'));
          parcelGroup.visible=state.parcels;scene.add(parcelGroup);
        })();
        try{await parcelPending;}catch{parcelPending=null;state.parcels=false;state.error='No s’han pogut carregar les parcel·les. Torna a provar-ho.';}
      }
      if(parcelGroup)parcelGroup.visible=state.parcels;report();requestRender();
    },
    labels(show:boolean){showLabels=show;requestRender();},reset,overview,focus,
    zoom(factor:number){motion.cancel();const offset=camera.position.clone().sub(controls.target);offset.setLength(THREE.MathUtils.clamp(offset.length()*factor,controls.minDistance,controls.maxDistance));camera.position.copy(controls.target).add(offset);controls.update();requestRender();},
    dispose(){disposed=true;navigation.dispose();depth.dispose();motion.dispose();heritage.dispose();document.removeEventListener('visibilitychange',visibility);observer.disconnect();controls.dispose();cancelAnimationFrame(frame);renderer.dispose();scene.traverse(o=>{if(o instanceof THREE.Mesh||o instanceof THREE.LineSegments){o.geometry.dispose();const materials=Array.isArray(o.material)?o.material:[o.material];materials.forEach(m=>m.dispose());}});textures.forEach(pair=>{pair.regional.dispose();pair.detail.dispose();pair.micro.forEach(t=>t.dispose());});labels.forEach(l=>l.element.remove());renderer.domElement.remove();},
  };
}

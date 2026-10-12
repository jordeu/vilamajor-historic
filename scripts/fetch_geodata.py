#!/usr/bin/env python3
"""Build a reproducible, attributed ETRS89/UTM31 data pack from ICGC and Catastro.
Never synthesize missing elevations, dates or footprints. Requests are cached.
"""
from __future__ import annotations
import argparse, concurrent.futures, hashlib, io, json, math, re, time, zipfile
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import quote, urlencode
import xml.etree.ElementTree as ET
import numpy as np
import requests
from PIL import Image
from shapely.geometry import Polygon, box

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public/data'
CACHE = ROOT / '.cache/geodata'
BBOX = [445500, 4609000, 453500, 4624500]
CORE = [447500, 4612500, 451500, 4616500]
ORIGIN = [449500, 4614500]
WCS = 'https://geoserveis.icgc.cat/icc_mdt/wcs/service'
ORTHO = 'https://geoserveis.icgc.cat/servei/catalunya/orto-territorial/wms'
BASE = 'https://geoserveis.icgc.cat/servei/catalunya/mapa-base/wms'
LIMITS = 'https://geoserveis.icgc.cat/servei/catalunya/divisions-administratives/wfs'
NS = {'g': 'http://www.opengis.net/gml/3.2'}
MUNICIPALITIES = [('antoni', '08197', 'Sant Antoni de Vilamajor'), ('pere', '08234', 'Sant Pere de Vilamajor')]
requests_log = {}

def download(url: str) -> bytes:
    key = hashlib.sha256(url.encode()).hexdigest()
    path = CACHE / key
    if not path.exists():
        for attempt in range(3):
            try:
                response = requests.get(url, timeout=(15, 100))
                response.raise_for_status()
                if len(response.content) < 100:
                    raise ValueError(f'Empty source: {url}')
                path.write_bytes(response.content)
                break
            except (requests.RequestException, ValueError):
                if attempt == 2: raise
                time.sleep(attempt + 1)
    content = path.read_bytes()
    requests_log[key] = {'url': url, 'sha256': hashlib.sha256(content).hexdigest(), 'bytes': len(content)}
    return content

def service(url, **params):
    return url + '?' + urlencode(params)

def local_name(e): return e.tag.split('}')[-1]

def value(e, name):
    return next((x.text for x in e.iter() if local_name(x) == name and x.text), None)

def ring(el):
    vals = [float(x) for x in el.text.split()]
    dimension = int(el.get('srsDimension', 2))
    return [[round(vals[i], 3), round(vals[i+1], 3)] for i in range(0, len(vals), dimension)]

def polygons(el):
    result = []
    for patch in el.iter():
        if local_name(patch) not in ('PolygonPatch', 'Polygon'): continue
        outer = patch.find('./g:exterior//g:posList', NS)
        if outer is None: continue
        holes = [ring(r) for r in patch.findall('./g:interior//g:posList', NS)]
        coords = [ring(outer)] + holes
        geom = Polygon(coords[0], coords[1:])
        if not geom.is_valid: geom = geom.buffer(0)
        if geom.is_empty: continue
        for p in (list(geom.geoms) if geom.geom_type == 'MultiPolygon' else [geom]):
            if p.area < .5: continue
            result.append([[[round(x, 3), round(y, 3)] for x,y in p.exterior.coords]] +
                          [[[round(x, 3), round(y, 3)] for x,y in r.coords] for r in p.interiors])
    return result

def write_json(name, data):
    (OUT / name).write_text(json.dumps(data, ensure_ascii=False, separators=(',', ':')))

def boundaries():
    params = dict(SERVICE='WFS', VERSION='2.0.0', REQUEST='GetFeature', SRSNAME='EPSG:25831',
                  BBOX=','.join(map(str, BBOX))+',EPSG:25831')
    raw = download(service(LIMITS, TYPENAMES='divisions_administratives_wfs:divisions_administratives_municipis_5000', **params))
    result = []
    for member in ET.fromstring(raw):
        name = value(member, 'NOMMUNI')
        if name not in [m[2] for m in MUNICIPALITIES]: continue
        result.append({'name': name, 'code': value(member, 'CODIMUNI'), 'polygons': polygons(member)})
    if len(result) != 2: raise ValueError('Expected two official municipal boundaries')
    raw = download(service(LIMITS, TYPENAMES='divisions_administratives_wfs:divisions_administratives_capsdemunicipi_capmunicipi', **params))
    capitals = []
    for member in ET.fromstring(raw):
        name = value(member, 'NOMCAP')
        if name in [m[2] for m in MUNICIPALITIES]:
            p = member.find('.//g:pos', NS)
            capitals.append({'name':name,'position':list(map(float,p.text.split()))})
    if len(capitals) != 2: raise ValueError('Missing official capital positions')
    write_json('boundaries.json', {'municipalities':result,'capitals':capitals})
    print('Official boundaries and capitals saved', flush=True)
    return result, capitals

def cadastre():
    buildings, parts, parcels = [], [], []
    dataset_dates = set()
    for municipality, code, name in MUNICIPALITIES:
        folder = code + '-' + name.upper()
        roots = {}
        municipality_dates = []
        for dataset, prefix in [('Buildings','BU'), ('CadastralParcels','CP')]:
            url = 'https://www.catastro.hacienda.gob.es/INSPIRE/'+dataset+'/08/'+quote(folder)+'/A.ES.SDGC.'+prefix+'.'+code+'.zip'
            with zipfile.ZipFile(io.BytesIO(download(url))) as z:
                for filename in z.namelist():
                    if filename.endswith('.gml'):
                        roots[filename.split('.')[-2]] = ET.fromstring(z.read(filename))
                    elif filename.endswith('.xml'):
                        metadata=ET.fromstring(z.read(filename))
                        stamp=next((e for e in metadata.iter() if local_name(e)=='dateStamp'),None)
                        if stamp is not None:
                            date=value(stamp,'Date')
                            if date: municipality_dates.append(date);dataset_dates.add(date)
        if not municipality_dates: raise ValueError(f'Missing cadastral release date: {name}')
        source_date=max(municipality_dates)
        parents = {}
        for b in roots['building'].iter():
            if local_name(b) != 'Building': continue
            identifier = value(b, 'localId')
            date = value(b, 'beginning')
            year = int(date[:4]) if date and re.match(r'^\d{4}-',date) and 1000 <= int(date[:4]) <= 2026 else None
            geometry = polygons(b)
            entry = {'id':identifier,'municipality':municipality,'year':year,'use':value(b,'currentUse'),
                     'polygons':geometry,'source':'DGC INSPIRE '+source_date}
            parents[identifier] = entry
            buildings.append(entry)
        seen = set()
        for b in roots['buildingpart'].iter():
            if local_name(b) != 'BuildingPart': continue
            identifier = value(b, 'localId')
            parent_id = identifier.split('_part')[0]
            parent = parents.get(parent_id)
            if parent is None: raise ValueError(f'Orphan building part {identifier}')
            floor_text = value(b, 'numberOfFloorsAboveGround')
            floors = int(floor_text) if floor_text and floor_text.isdigit() else None
            geometry = polygons(b)
            if not geometry: continue
            parts.append({'id':identifier,'buildingId':parent_id,'municipality':municipality,'year':parent['year'],
                          'floors':floors,'polygons':geometry})
            seen.add(parent_id)
        for identifier, parent in parents.items():
            if identifier not in seen and parent['polygons']:
                parts.append({'id':identifier,'buildingId':identifier,'municipality':municipality,
                              'year':parent['year'],'floors':None,'polygons':parent['polygons']})
        for p in roots['cadastralparcel'].iter():
            if local_name(p) != 'CadastralParcel': continue
            geometry = polygons(p)
            if geometry: parcels.append({'id':value(p,'nationalCadastralReference'),'municipality':municipality,'polygons':geometry})
        print(f'{name}: {len(parents)} buildings',flush=True)
    if len(buildings) < 4000 or len(parts) < 12000 or len(parcels) < 1000:
        raise ValueError('Unexpectedly incomplete cadastral download')
    write_json('buildings.json',{'buildings':buildings,'parts':parts})
    write_json('parcels.json',{'parcels':parcels})
    return {'buildings':len(buildings),'parts':len(parts),'parcels':len(parcels),
            'undated':sum(b['year'] is None for b in buildings),
            'missingFloors':sum(p['floors'] is None for p in parts)}, sorted(dataset_dates)

def terrain_grid(name, bbox, spacing):
    xmin,ymin,xmax,ymax = bbox
    cols, rows = int((xmax-xmin)/spacing)+1, int((ymax-ymin)/spacing)+1
    data = np.full((rows,cols),np.nan,dtype='<f4')
    jobs = [(r,c,min(128,rows-r),min(128,cols-c)) for r in range(0,rows,128) for c in range(0,cols,128)]
    def tile(job):
        r,c,h,w=job
        x0,y1=xmin+c*spacing,ymax-r*spacing
        bounds=[x0-spacing/2,y1-(h-.5)*spacing,x0+(w-.5)*spacing,y1+spacing/2]
        url=service(WCS,SERVICE='WCS',REQUEST='GetCoverage',VERSION='1.0.0',CRS='EPSG:25831',COVERAGE='icc:met',WIDTH=w,HEIGHT=h,FORMAT='ArcGrid',BBOX=','.join(map(str,bounds)))
        text=download(url).decode()
        if not text.upper().startswith('NCOLS'): raise ValueError(f'Invalid elevation response: {text[:180]}')
        lines=text.splitlines()
        header={a.lower():float(b) for a,b in (line.split() for line in lines[:6])}
        if int(header['ncols'])!=w or int(header['nrows'])!=h: raise ValueError('Elevation tile dimensions differ')
        if abs(header['cellsize']-spacing)>.001: raise ValueError('Unexpected DEM cell size')
        if abs(header['xllcorner']-bounds[0])>.01 or abs(header['yllcorner']-bounds[1])>.01: raise ValueError('DEM alignment mismatch')
        values=np.fromstring(' '.join(lines[6:]),sep=' ').reshape(h,w)
        if np.any(values==header['nodata_value']) or not np.all(np.isfinite(values)): raise ValueError('DEM contains missing elevations')
        return r,c,h,w,values
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        for i,(r,c,h,w,values) in enumerate(pool.map(tile,jobs)):
            data[r:r+h,c:c+w]=values
            if i%8==0:print(f'{name} elevation tiles: {i+1}/{len(jobs)}',flush=True)
    if not np.all(np.isfinite(data)): raise ValueError('DEM stitching left gaps')
    data.tofile(OUT/(name+'.bin'))
    return {'file':name+'.bin','bbox':bbox,'columns':cols,'rows':rows,'spacing':spacing,
            'encoding':'float32-le, row-major, north to south, vertex samples',
            'minimum':round(float(data.min()),3),'maximum':round(float(data.max()),3),
            'serviceCoverage':'icc:met','sourceResolution':5 if spacing<=5 else 15}

def raster(name, endpoint, layer, bbox, width, height):
    raw=download(service(endpoint,SERVICE='WMS',VERSION='1.1.1',REQUEST='GetMap',LAYERS=layer,STYLES='',SRS='EPSG:25831',BBOX=','.join(map(str,bbox)),WIDTH=width,HEIGHT=height,FORMAT='image/jpeg',TRANSPARENT='FALSE'))
    try:
        im=Image.open(io.BytesIO(raw)).convert('RGB')
    except OSError:
        if b'image size too large' not in raw: raise
        im=Image.new('RGB',(width,height))
        for y in range(0,height,2048):
            for x in range(0,width,2048):
                w,h=min(2048,width-x),min(2048,height-y)
                dx,dy=(bbox[2]-bbox[0])/width,(bbox[3]-bbox[1])/height
                tilebox=[bbox[0]+x*dx,bbox[3]-(y+h)*dy,bbox[0]+(x+w)*dx,bbox[3]-y*dy]
                tile_raw=download(service(endpoint,SERVICE='WMS',VERSION='1.1.1',REQUEST='GetMap',LAYERS=layer,STYLES='',SRS='EPSG:25831',BBOX=','.join(map(str,tilebox)),WIDTH=w,HEIGHT=h,FORMAT='image/jpeg',TRANSPARENT='FALSE'))
                im.paste(Image.open(io.BytesIO(tile_raw)).convert('RGB'),(x,y))
    if im.size!=(width,height): raise ValueError('Unexpected raster dimensions')
    pixels=np.asarray(im)
    # A monochrome/white WMS response is not geographic coverage.
    white=np.all(pixels>247,axis=2)
    if (endpoint == ORTHO and float(white.mean())>.05) or float(pixels.std())<5: raise ValueError(f'Missing aerial coverage for {layer}: white={white.mean()}')
    output=OUT/(name+'.webp')
    if not output.exists() or output.stat().st_size==0:
        temporary=OUT/(name+'.webp.tmp')
        im.save(temporary,format='WEBP',quality=90,method=4)
        temporary.replace(output)
    return {'file':name+'.webp','layer':layer,'bbox':bbox,'width':width,'height':height,
            'metresPerPixel':[(bbox[2]-bbox[0])/width,(bbox[3]-bbox[1])/height],
            'whiteFraction':round(float(white.mean()),5)}

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--skip-rasters',action='store_true');args=parser.parse_args()
    OUT.mkdir(parents=True,exist_ok=True);CACHE.mkdir(parents=True,exist_ok=True)
    boundaries()
    counts,cadastral_dates=cadastre()
    terrain=terrain_grid('terrain',BBOX,20)
    detail=terrain_grid('terrain-detail',CORE,5)
    raster_sets=[]
    if not args.skip_rasters:
        for year,layer in [(1956,'ortofoto_50cm_blanc_i_negre_1956'),(1986,'ortofoto_50cm_blanc_i_negre_1986'),(2004,'ortofoto_50cm_color_2004'),(2025,'ortofoto_25cm_color_2025')]:
            try:
                regional=raster(f'ortho-{year}',ORTHO,layer,BBOX,2048,3968)
                detail_raster=raster(f'ortho-{year}-detail',ORTHO,layer,CORE,4096,4096)
            except (ValueError, OSError) as error:
                if year in (1956,2025):raise
                print(f'Skip unavailable photo {year}: {error}',flush=True)
                continue
            raster_sets.append({'year':year,'regional':regional,'detail':detail_raster})
            print(f'Orthophoto {year} saved',flush=True)
        topo={'regional':raster('topographic',BASE,'topografic',BBOX,2048,3968),
              'detail':raster('topographic-detail',BASE,'topografic',CORE,4096,4096)}
    else:
        previous_path=OUT/'manifest.json'
        if not previous_path.exists(): raise ValueError('--skip-rasters requires an existing data pack')
        previous=json.loads(previous_path.read_text())
        if previous['bbox']!=BBOX or previous['terrainDetail']['bbox']!=CORE: raise ValueError('Cached rasters cover a different region')
        raster_sets=previous['orthophotos'];topo=previous['topographic']
        provenance_path=OUT/'provenance.json'
        if not provenance_path.exists(): raise ValueError('Cached rasters require original provenance')
        for record in json.loads(provenance_path.read_text())['requests']:
            requests_log.setdefault(hashlib.sha256(record['url'].encode()).hexdigest(),record)
    manifest={'schemaVersion':1,'generatedAt':datetime.now(timezone.utc).isoformat(),'crs':'EPSG:25831',
              'bbox':BBOX,'origin':ORIGIN,'terrain':terrain,'terrainDetail':detail,'orthophotos':raster_sets,
              'topographic':topo,'counts':counts,'cadastreDate':max(cadastral_dates),'cadastreDatasetDates':cadastral_dates,'boundariesDate':'2026-01-20',
              'attribution':{'icgc':'© Institut Cartogràfic i Geològic de Catalunya · CC BY 4.0',
                             'cadastre':'© Dirección General del Catastro · Ministerio de Hacienda'},
              'limitations':['Current footprints; no evidence of historical shape from cadastre alone',
                             'Rendered height estimated at 2.8 metres per storey with a four-storey visual cap; original declared floor counts retained; not surveyed',
                             'Construction year is cadastral, not verified historical dating',
                             'Current boundaries must not be presented as 1843 or medieval boundaries',
                             'Modern terrain remains the base beneath historical aerial photographs'],
              'sources':[{'provider':'ICGC','url':WCS,'license':'CC BY 4.0'},
                         {'provider':'ICGC','url':ORTHO,'license':'CC BY 4.0'},
                         {'provider':'ICGC','url':BASE,'license':'CC BY 4.0'},
                         {'provider':'ICGC','url':LIMITS,'license':'CC BY 4.0'},
                         {'provider':'DGC','url':'https://www.catastro.hacienda.gob.es/webinspire/index.html','license':'Reuse with DGC attribution'}]}
    write_json('manifest.json',manifest)
    write_json('provenance.json',{'requests':list(requests_log.values())})
    checks=[]
    for file in sorted(OUT.iterdir()):
        if file.is_file() and file.name!='checksums.json':checks.append({'file':file.name,'bytes':file.stat().st_size,'sha256':hashlib.sha256(file.read_bytes()).hexdigest()})
    write_json('checksums.json',checks)
    print('Geodata pack complete:',counts,flush=True)

if __name__=='__main__':main()

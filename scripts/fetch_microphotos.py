#!/usr/bin/env python3
"""Additional aerial detail in the two town centres, same years and exact CRS.
Run after fetch_geodata.py. Originals and hashes join the existing provenance log.
"""
import argparse,json
from pathlib import Path
import fetch_geodata as geo

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--output',type=Path,default=geo.OUT);args=parser.parse_args()
    out=args.output;out.mkdir(parents=True,exist_ok=True);geo.OUT=out;geo.CACHE.mkdir(parents=True,exist_ok=True)
    areas=[{'id':'pere','bbox':[448920,4614730,449240,4615050]}, {'id':'antoni','bbox':[450040,4613360,450400,4613760]}]
    photos=[]
    for year,layer,res in [(1956,'ortofoto_50cm_blanc_i_negre_1956',.5),(1986,'ortofoto_50cm_blanc_i_negre_1986',.5),(2004,'ortofoto_50cm_color_2004',.5),(2025,'ortofoto_25cm_color_2025',.25)]:
        entry={'year':year,'areas':[]}
        for area in areas:
            b=area['bbox'];r=geo.raster(f'ortho-{year}-{area["id"]}-micro',geo.ORTHO,layer,b,round((b[2]-b[0])/res),round((b[3]-b[1])/res))
            entry['areas'].append({'id':area['id'],**r})
        photos.append(entry);print('Town detail',year,flush=True)
    (out/'microphotos.json').write_text(json.dumps({'crs':'EPSG:25831','photos':photos},ensure_ascii=False,separators=(',',':')))
    provenance=geo.ROOT/'public/data/provenance.json'
    old=json.loads(provenance.read_text());merged={r['url']:r for r in old['requests']}
    merged.update({r['url']:r for r in geo.requests_log.values()});old['requests']=list(merged.values())
    (out/'provenance.json').write_text(json.dumps(old,ensure_ascii=False,separators=(',',':')))
if __name__=='__main__':main()

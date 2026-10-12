#!/usr/bin/env python3
"""Deterministic vegetation candidates from colour samples, never a tree inventory."""
import json,random
from pathlib import Path
from PIL import Image
from shapely.geometry import Polygon,Point
from shapely.strtree import STRtree
D=str(Path(__file__).resolve().parents[1]/'public/data')+'/'
data=json.load(open(D+'buildings.json'));m=json.load(open(D+'manifest.json'))
# Orthophoto classification, not a tree inventory: retain olive and dark green samples away from footprints.
im=Image.open(D+'ortho-2025.webp').convert('RGB');w,h=im.size
polys=[Polygon(p[0])for r in data['buildings']for p in r['polygons'] if len(p[0])>=4];tree=STRtree(polys)
limits=json.load(open(D+'boundaries.json'));bounds=[Polygon(p[0],p[1:])for r in limits['municipalities']for p in r['polygons']]
rng=random.Random(872);forest=[]
for n in range(4610000,4623500,22):
 for e in range(446000,453000,22):
  x=e+rng.uniform(-9,9);y=n+rng.uniform(-9,9);p=Point(x,y)
  if not any(b.contains(p)for b in bounds):continue
  r,g,b=im.getpixel((int((x-m['bbox'][0])/(m['bbox'][2]-m['bbox'][0])*w),int((m['bbox'][3]-y)/(m['bbox'][3]-m['bbox'][1])*h)))
  if g>r*.85 and g>b*1.17 and 35<g<145 and r<165 and not len(tree.query(p.buffer(7))):forest.append([round(x,1),round(y,1),round(rng.uniform(6,13),1),round(rng.random(),2)])
# Fixed seed and upper bound make regeneration deterministic and GPU memory predictable.
rng.shuffle(forest);forest=forest[:20000]
json.dump({'source':'ICGC ortofoto 2025; mostreig cromàtic, no inventari arbori','method':'Olive and dark-green 22 m samples, building exclusion 7 m, deterministic seed 872. Heights and crowns inferred. Historical distribution is illustrative.','trees':forest},open(D+'vegetation.json','w'),separators=(',',':'))
print('vegetation',len(forest))

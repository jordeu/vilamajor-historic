import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {neighborhoods,tourShots,tourDuration,tourFrame,tourTimeForYear,chapterTime,tourFinaleStart,tourPhotoOpacity} from '../src/tour.ts';
test('only the 2026 finale reveals the current photo, with a reversible eased fade and a full-photo hold',()=>{
 assert.equal(tourFrame(tourFinaleStart).year,2026);
 for(const time of [-10,0,180,tourFinaleStart-.01,tourFinaleStart])assert.equal(tourPhotoOpacity(time),0);
 assert.equal(tourPhotoOpacity(tourFinaleStart+4),.5);
 for(const time of [tourFinaleStart+8,tourDuration,tourDuration+100])assert.equal(tourPhotoOpacity(time),1);
 let previous=0;for(let t=tourFinaleStart;t<=tourDuration;t+=.1){const opacity=tourPhotoOpacity(t);assert.ok(opacity>=previous&&opacity<=1);previous=opacity;}
 assert.ok(tourPhotoOpacity(tourFinaleStart+.01)<.00001,'fade starts gently');
 assert.equal(tourPhotoOpacity(tourFinaleStart+4),.5,'seeking backward reproduces the same blend');
});
test('documentary is chronologically continuous, covers every neighborhood and leaves time to read',()=>{
 assert.equal(tourShots[0].from,872);assert.equal(tourShots.at(-1)!.to,2026);
 let last=872,modern=0;
 for(const shot of tourShots){assert.equal(shot.from,last);assert.ok(shot.to>=shot.from);last=shot.to;assert.ok(shot.seconds/shot.captions.length>=6);if(shot.from>=1956)modern+=shot.seconds;}
 assert.ok(modern>=150);assert.equal(neighborhoods.length,8);for(const p of neighborhoods)assert.ok(tourShots.some(s=>s.place===p.name));
 for(const p of neighborhoods){assert.ok(p.center[0]>445500&&p.center[0]<453500);assert.ok(p.center[1]>4609000&&p.center[1]<4624500);}
});
test('seeking and frame rate independent progress preserve chronology at chapter boundaries',()=>{
 let previous=872;
 for(let t=0;t<=tourDuration;t+=.7){const f=tourFrame(t);assert.ok(f.year>=previous);previous=f.year;assert.ok(f.caption.length>0);}
 for(let i=0;i<tourShots.length;i++){assert.equal(tourFrame(chapterTime(i)).index,i);assert.equal(tourFrame(chapterTime(i)).year,tourShots[i].from);}
 for(const year of [872,1150,1843,1956,1975,1986,2004,2025])assert.ok(Math.abs(tourFrame(tourTimeForYear(year)).year-year)<1e-8);
 assert.equal(tourFrame(tourDuration+100).year,2026);
});
test('Sant Antoni entrance follows the WSW cadastral nave axis',()=>{
 const data=JSON.parse(readFileSync(new URL('../public/data/heritage.json',import.meta.url),'utf8'));
 const church=data.landmarks.find((l:{id:string})=>l.id==='antoni');
 // World Z points south; the portico is local +Z. Direction measured from the two long cadastral edges.
 const front=[Math.sin(church.rotation),Math.cos(church.rotation)];
 const expected=[-31.08,11.985],length=Math.hypot(...expected);
 assert.ok(front[0]*expected[0]/length+front[1]*expected[1]/length>.9999);
 assert.ok(Math.hypot(church.position[0]-450270.73,church.position[1]-4613526.6)<1);
});

import {test} from 'node:test';
import assert from 'node:assert/strict';
import {events,eventAt,sources} from '../src/history.ts';
test('dates ordered and each event has an HTTPS source',()=>{events.forEach((e,i)=>{if(i)assert.ok(e.year>events[i-1].year);assert.ok(sources[e.source].url.startsWith('https://'));});});
test('first council and final segregation remain distinct',()=>{assert.equal(eventAt(1822).year,1822);assert.equal(eventAt(1842).year,1822);assert.equal(eventAt(1843).year,1843);});
test('timeline bounds and gaps keep nearest historical chapter',()=>{assert.equal(eventAt(850).year,872);assert.equal(eventAt(1208).year,1150);assert.equal(eventAt(2026).year,2025);});

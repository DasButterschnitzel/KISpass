// Named arc choreographies — the motion vocabulary of the Bogen.
//
//  aufgang    (rise)        the band rises; grey hills follow. Logo, cards.
//  ausDerMitte (from core)  innermost band first, rings form outward. Slogans.
//  weiter     (travel)      enters from the left on a curved path, exits right.
//  senken     (sink)        quiet exit downwards.
// Every move works for both motifs (corner for 16:9, bottom for 9:16 and 1:1).

import { E } from '../core/ease.js';

const CORNER_BACK_TO_FRONT = ['lgray', 'mgray', 'mgray2', 'black', 'red', 'gold'];
const CORNER_CORE_OUT = ['gold', 'red', 'black', 'mgray2', 'mgray', 'lgray'];
const BAND = ['gold', 'red', 'black'];

export function aufgang(kind, start, o = {}) {
  const dur = o.dur ?? 1.4;
  if (kind === 'corner') return { type: 'grow', start, dur: dur + 0.1, stagger: o.stagger ?? 0.07, pivot: [1774, 887], order: CORNER_BACK_TO_FRONT };
  return [
    { ids: BAND, type: 'rise', start: start + 0.12, dur, stagger: 0.07, order: BAND, dist: 700 },
    { ids: ['hillL', 'front'], type: 'rise', start, dur, stagger: 0.1, order: ['hillL', 'front'], dist: 700 },
    { ids: ['hillR', 'hillR2'], type: 'rise', start: start + 0.05, dur, stagger: 0.1, order: ['hillR', 'hillR2'], dist: 700 },
  ];
}

export function ausDerMitte(kind, start, o = {}) {
  const dur = o.dur ?? 1.7;
  if (kind === 'corner') return { type: 'grow', start, dur, stagger: o.stagger ?? 0.11, pivot: [1774, 887], order: CORNER_CORE_OUT };
  // bottom: the band rises in the centre, the hills close in from both sides
  return [
    { ids: BAND, type: 'rise', start, dur: dur - 0.2, stagger: 0.08, order: BAND, dist: 700 },
    { ids: ['hillL', 'front'], type: 'path', start: start + 0.35, dur, stagger: 0.1, order: ['hillL', 'front'], from: [-950, 260], easeX: E.arrive, easeY: E.arrive },
    { ids: ['hillR', 'hillR2'], type: 'path', start: start + 0.35, dur, stagger: 0.1, order: ['hillR', 'hillR2'], from: [950, 260], easeX: E.arrive, easeY: E.arrive },
  ];
}

export function weiter(kind, start, o = {}) {
  // rises out of the edge, then pushes forward (x arrives later than y)
  const dur = o.dur ?? 1.9;
  return {
    type: 'path', start, dur, stagger: o.stagger ?? 0.03, order: 'front',
    from: kind === 'corner' ? [-640, 820] : [-560, 720],
    easeX: E.glide, easeY: E.arrive,
  };
}
export function weiterOut(kind, start, o = {}) {
  return {
    type: 'path', start, dur: o.dur ?? 0.9, stagger: o.stagger ?? 0.02, order: 'front',
    to: kind === 'corner' ? [2600, 700] : [2600, 600],
    easeX: E.leave, easeY: E.leave,
  };
}

export function senken(kind, start, o = {}) {
  return { type: 'drop', start, dur: o.dur ?? 0.6, stagger: o.stagger ?? 0.025, dist: 760, order: 'back' };
}

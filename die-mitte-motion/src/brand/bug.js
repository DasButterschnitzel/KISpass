// Logo bug — the small horizontal lockup used as sender/brand marker.
// 16:9: top right (as in the presentation set). 9:16 / 1:1: top centre.

import { tok } from '../formats.js';
import { lockupHWidth } from './logo.js';
import { lockupHReveal } from './lockup-anim.js';

export function bugGeometry(fmt, hm, corner) {
  const T = tok(fmt);
  const h = hm ?? T.bugM;
  const W = lockupHWidth(h);
  if (fmt.id === '16x9' || fmt.id === '12x5' || corner === 'right') return { x: fmt.w - T.m - W, y: T.top - h * 0.12, hm: h, w: W };
  return { x: (fmt.w - W) / 2, y: fmt.id === '9x16' ? T.bugTop : T.top, hm: h, w: W };
}

/**
 * 9:16: the bug groups with the content instead of sitting on the UI line.
 * Centres [bug + gap + block] in the free area; returns the bug top and block top.
 * Other formats: block centred in the free area, bug at its standard place.
 */
export function groupWithBug(fmt, blockH, free0, free1, gap = 140) {
  const T = tok(fmt);
  if (fmt.id !== '9x16') return { top: (free0 + free1) / 2 - blockH / 2, bugY: null };
  const groupH = T.bugM + gap + blockH;
  const lo = Math.max(free0, T.bugTop);
  const gTop = Math.max(T.bugTop, (lo + free1) / 2 - groupH / 2);
  return { bugY: gTop, top: gTop + T.bugM + gap };
}

/** Animated bug: quick band draw + wordmark rise. o.exit: 0..1. */
export function logoBug(ctx, t, fmt, start, o = {}) {
  const g = bugGeometry(fmt, o.hm, o.corner);
  if (o.x != null) g.x = o.x;
  if (o.y != null && o.y !== undefined) g.y = o.y;
  lockupHReveal(ctx, t, g, { draw: [start, 0.84], word: [start + 0.4, 0.72] }, { exit: o.exit, stagger: 0.05 });
  return g;
}

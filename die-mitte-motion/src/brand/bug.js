// Logo bug — the small horizontal lockup used as sender/brand marker.
// 16:9: top right (as in the presentation set). 9:16 / 1:1: top centre.

import { tok } from '../formats.js';
import { lockupHWidth } from './logo.js';
import { lockupHReveal } from './lockup-anim.js';

export function bugGeometry(fmt, hm) {
  const T = tok(fmt);
  const h = hm ?? T.bugM;
  const W = lockupHWidth(h);
  if (fmt.id === '16x9') return { x: fmt.w - T.m - W, y: T.top - h * 0.12, hm: h, w: W };
  return { x: (fmt.w - W) / 2, y: T.top, hm: h, w: W };
}

/** Animated bug: quick band draw + wordmark rise. o.exit: 0..1. */
export function logoBug(ctx, t, fmt, start, o = {}) {
  const g = bugGeometry(fmt, o.hm);
  if (o.x != null) g.x = o.x;
  if (o.y != null) g.y = o.y;
  lockupHReveal(ctx, t, g, { draw: [start, 0.84], word: [start + 0.4, 0.72] }, { exit: o.exit, stagger: 0.05 });
  return g;
}

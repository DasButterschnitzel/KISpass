// Shared layout for the two-line slogan cards (03, 04, 13): one size (display),
// one leading (1.10), one top line — sister pieces must match exactly.

import { tok, scale } from '../formats.js';
import { layoutBlock } from '../core/layout.js';
import { motifTop } from './arcs.js';
import { groupWithBug } from './bug.js';

export const SLOGAN_LEAD = 1.1;

export function sloganBlock(ctx, fmt, l1, l2, pl, o = {}) {
  const T = tok(fmt);
  const S = scale(fmt);
  const size = o.size ?? S.display;
  const lines = [
    { text: l1, size },
    { text: l2, size, lead: size * SLOGAN_LEAD },
  ];
  const h = layoutBlock(ctx, lines, 0).height;
  if (fmt.id === '16x9') {
    // shared optical centre of the slogan cards (as on the presentation slogan slide)
    return { block: layoutBlock(ctx, lines, 455 - h / 2), size, x: T.m, align: 'left', bugY: undefined };
  }
  const free0 = fmt.id === '1x1' ? T.top + T.bugM * 2.2 : T.top;
  const free1 = motifTop(T.arcKind, pl) - (fmt.id === '9x16' ? 60 : 20);
  const g = groupWithBug(fmt, h, free0, free1);
  return { block: layoutBlock(ctx, lines, g.top), size, x: fmt.w / 2, align: 'center', bugY: g.bugY ?? undefined };
}

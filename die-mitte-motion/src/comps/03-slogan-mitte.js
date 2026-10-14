// 03 — Slogan „Aus der Mitte. Für das Ganze.“
// The arcs grow from the innermost band outward until the whole has formed:
// first gold at the core, then red, black and the silver-grey rings.

import { background } from '../core/stage.js';
import { clamp01 } from '../core/time.js';
import { tok } from '../formats.js';
import { drawBlock } from '../core/layout.js';
import { drawArcs, place, motion } from '../brand/arcs.js';
import { sloganBlock } from '../brand/slogan-layout.js';
import { logoBug } from '../brand/bug.js';
import { ausDerMitte, senken } from '../brand/arc-moves.js';

const OUT = 6.1;

export default {
  id: 'slogan-mitte',
  no: '03',
  title: 'Slogan',
  name: 'Aus der Mitte. Für das Ganze.',
  file: 'Slogan-Aus-der-Mitte',
  category: 'Slogan',
  notes: 'Primary slogan. In → hold (3.4–6.1 s) → out to clean silver.',
  duration: 7.2,
  stills: [1.0, 1.8, 2.6, 4.5, 6.3],
  copy: { line1: 'Aus der Mitte.', line2: 'Für das Ganze.' },
  draw(ctx, t, fmt, copy) {
    background(ctx, fmt);
    const T = tok(fmt);
    const wide = fmt.id === '16x9';
    const pl = place(fmt, T.arcKind, wide ? 0.82 : T.arcS);
    drawArcs(ctx, T.arcKind, pl, motion(t, { enter: ausDerMitte(T.arcKind, 1.3), exit: senken(T.arcKind, OUT + 0.1) }));

    const L = sloganBlock(ctx, fmt, copy.line1, copy.line2, pl);
    drawBlock(ctx, t, L.block, {
      x: L.x,
      align: L.align,
      enter: { start: 0.3, stagger: 0.96, dur: 0.84 },
      punct: 0.3,
      exit: { start: OUT, stagger: 0.07, dur: 0.56 },
    });

    logoBug(ctx, t, fmt, 2.1, { y: L.bugY, exit: clamp01((t - OUT - 0.12) / 0.56) });
  },
};

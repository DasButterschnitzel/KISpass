// 03 — Slogan „Aus der Mitte. Für das Ganze.“
// The arcs grow from the innermost band outward until the whole has formed:
// first gold at the core, then red, black and the silver-grey rings.

import { background } from '../core/stage.js';
import { clamp01 } from '../core/time.js';
import { tok } from '../formats.js';
import { layoutBlock, drawBlock } from '../core/layout.js';
import { drawArcs, place, motion, motifTop } from '../brand/arcs.js';
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
    const size = T.display * (wide ? 1.2 : 1);
    drawArcs(ctx, T.arcKind, pl, motion(t, { enter: ausDerMitte(T.arcKind, 1.3), exit: senken(T.arcKind, OUT + 0.1) }));

    const lines = [
      { text: copy.line1, size, weight: 'demi' },
      { text: copy.line2, size, weight: 'demi', lead: size * 1.12 },
    ];
    const probe = layoutBlock(ctx, lines, 0);
    let top;
    if (wide) top = 455 - probe.height / 2;
    else {
      const free0 = T.top + T.bugM * 2.2, free1 = motifTop(T.arcKind, pl);
      top = (free0 + free1) / 2 - probe.height / 2 - (fmt.id === '9x16' ? 40 : 6);
    }
    const block = layoutBlock(ctx, lines, top);
    drawBlock(ctx, t, block, {
      x: wide ? T.m : fmt.w / 2,
      align: wide ? 'left' : 'center',
      enter: { start: 0.3, stagger: 0.96, dur: 0.84 },
      punct: 0.3,
      exit: { start: OUT, stagger: 0.07, dur: 0.56 },
    });

    logoBug(ctx, t, fmt, 2.1, { exit: clamp01((t - OUT - 0.12) / 0.56) });
  },
};

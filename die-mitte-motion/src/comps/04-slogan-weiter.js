// 04 — Slogan „Gemeinsam weiter.“
// Everything moves together and forward: the arcs travel in from the left on a
// curved path, "weiter." is pulled in from the left — and on exit nothing
// reverses: type and arcs keep moving to the right.

import { background } from '../core/stage.js';
import { prog, clamp01 } from '../core/time.js';
import { E } from '../core/ease.js';
import { tok } from '../formats.js';
import { layoutBlock } from '../core/layout.js';
import { revealLine, wipeLine } from '../core/text.js';
import { drawArcs, place, motion, motifTop } from '../brand/arcs.js';
import { logoBug } from '../brand/bug.js';
import { weiter, weiterOut } from '../brand/arc-moves.js';

const OUT = 5.0;

export default {
  id: 'slogan-weiter',
  no: '04',
  title: 'Slogan',
  name: 'Gemeinsam weiter.',
  file: 'Slogan-Gemeinsam-weiter',
  category: 'Slogan',
  notes: 'Secondary slogan for short formats and transitions to the next chapter. Exits continue forward.',
  duration: 6.24,
  stills: [0.9, 1.6, 3.0, 5.4],
  copy: { line1: 'Gemeinsam', line2: 'weiter.' },
  draw(ctx, t, fmt, copy) {
    background(ctx, fmt);
    const T = tok(fmt);
    const wide = fmt.id === '16x9';
    const pl = place(fmt, T.arcKind, wide ? 0.8 : T.arcS);
    drawArcs(ctx, T.arcKind, pl, motion(t, { enter: weiter(T.arcKind, 0.1), exit: weiterOut(T.arcKind, OUT + 0.05), drift: { vx: 7, t0: 1.9 } }));

    const size = T.display * (wide ? 1.08 : 1.1);
    const lines = [
      { text: copy.line1, size },
      { text: copy.line2, size, lead: size * 1.08 },
    ];
    const probe = layoutBlock(ctx, lines, 0);
    let top;
    if (wide) top = 480 - probe.height / 2;
    else top = (T.top + T.bugM * 2.2 + motifTop(T.arcKind, pl)) / 2 - probe.height / 2 - (fmt.id === '9x16' ? 40 : 6);
    const b = layoutBlock(ctx, lines, top);
    const x = wide ? T.m : fmt.w / 2;
    const align = wide ? 'left' : 'center';
    const [l1, l2] = b.lines;
    // "Gemeinsam" rises; "weiter." is pulled in from the left
    revealLine(ctx, l1.text, x, l1.y, prog(t, 0.55, 0.84), {
      size, align, exit: clamp01((t - OUT) / 0.5),
    });
    wipeLine(ctx, l2.text, x, l2.y, prog(t, 1.25, 0.96, E.arrive), {
      size, align, slide: size * 1.1, exit: prog(t, OUT + 0.06, 0.62, E.leave),
    });

    logoBug(ctx, t, fmt, 2.0, { exit: clamp01((t - OUT - 0.1) / 0.5) });
  },
};

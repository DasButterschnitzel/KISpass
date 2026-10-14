// 05 — Titelkarte (chapter card)
// Number in red rolls up like an odometer, title and line follow on the beat.
// The arcs rise from the corner / bottom and sink again on exit.

import { background } from '../core/stage.js';
import { prog, clamp01 } from '../core/time.js';
import { E } from '../core/ease.js';
import { tok } from '../formats.js';
import { C } from '../brand/palette.js';
import { layoutBlock, drawBlock } from '../core/layout.js';
import { rollNumber } from '../core/text.js';
import { drawArcs, place, motion, motifTop } from '../brand/arcs.js';
import { aufgang, senken } from '../brand/arc-moves.js';
import { logoBug } from '../brand/bug.js';

const OUT = 5.16;

export default {
  id: 'titelkarte',
  no: '05',
  title: 'Titelkarte',
  file: 'Titelkarte',
  name: 'Kapitel',
  category: 'Titel',
  notes: 'Chapter / topic opener. Edit number, title and line via --copy.',
  duration: 6.24,
  stills: [0.9, 1.4, 3.0, 5.4],
  copy: { number: '01', title: 'Zusammenhalt', subtitle: 'Eine Gesellschaft,\ndie zusammenhält.' },
  draw(ctx, t, fmt, copy) {
    background(ctx, fmt);
    const T = tok(fmt);
    const wide = fmt.id === '16x9';
    const pl = place(fmt, T.arcKind, wide ? 0.64 : T.arcS * 0.92);
    drawArcs(ctx, T.arcKind, pl, motion(t, {
      enter: aufgang(T.arcKind, 0.05),
      exit: senken(T.arcKind, OUT + 0.12),
      breathe: { amp: 3, period: 6, t0: 1.6 },
    }));

    const nSize = wide ? 104 : fmt.id === '9x16' ? 112 : 92;
    const tSize = wide ? 144 : fmt.id === '9x16' ? 108 : 90;
    const sSize = wide ? 52 : fmt.id === '9x16' ? 50 : 40;
    const sub = copy.subtitle.split('\n');
    const lines = [
      { text: copy.title, size: tSize, weight: 'demi', lead: nSize * 0.5 + tSize * 1.05 },
      ...sub.map((s, i) => ({ text: s, size: sSize, weight: 'book', lead: i === 0 ? tSize * 0.32 + sSize * 1.25 : sSize * 1.3, delay: 0.12 + i * 0.02 })),
    ];
    // number + block layout (number is drawn separately with the roll)
    const probe = layoutBlock(ctx, [{ text: copy.number, size: nSize }, ...lines], 0);
    const avail0 = wide ? 0 : T.top + T.bugM * 2;
    const avail1 = wide ? 1080 * 0.86 : motifTop(T.arcKind, pl);
    const top = wide ? 460 - probe.height / 2 : (avail0 + avail1) / 2 - probe.height / 2 - (fmt.id === '9x16' ? 30 : 0);
    const block = layoutBlock(ctx, [{ text: copy.number, size: nSize }, ...lines], top);
    const x = wide ? T.m : fmt.w / 2;
    const align = wide ? 'left' : 'center';

    const n = block.lines[0];
    rollNumber(ctx, copy.number, x, n.y, prog(t, 0.35, 0.72), prog(t, 0.45, 0.9, E.glide), {
      size: nSize, color: C.red, align, exit: clamp01((t - OUT) / 0.48),
    });
    drawBlock(ctx, t, { lines: block.lines.slice(1) }, {
      x, align,
      enter: { start: 0.55, stagger: 0.1, dur: 0.84 },
      exit: { start: OUT + 0.05, stagger: 0.05, dur: 0.48 },
    });

    logoBug(ctx, t, fmt, 1.3, { exit: clamp01((t - OUT - 0.1) / 0.5) });
  },
};

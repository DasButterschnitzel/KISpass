// 07 — Infografik „Unsere Themen“ (agenda / topic list)
// Rows rise on the beat; a red focus walks through the list: the active number
// turns red and its row steps in — as on the presentation slide.

import { background } from '../core/stage.js';
import { prog, clamp01, lerp } from '../core/time.js';
import { E } from '../core/ease.js';
import { tok } from '../formats.js';
import { C } from '../brand/palette.js';
import { revealLine, CAP } from '../core/text.js';
import { drawArcs, place, motion } from '../brand/arcs.js';
import { aufgang, senken } from '../brand/arc-moves.js';
import { logoBug } from '../brand/bug.js';

const OUT = 7.2;
const FOCUS = [2.3, 3.85, 5.4]; // focus moves to row i at these times

function mixHex(a, b, u) {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return '#' + pa.map((v, i) => Math.round(lerp(v, pb[i], u)).toString(16).padStart(2, '0')).join('');
}

const GEO = {
  '16x9': { x: 128, head: 72, headTop: 150, rowTop: 350, rowGap: 200, num: 50, title: 84, desc: 38, indent: 140, arcS: 0.5 },
  '9x16': { x: 96, head: 80, headTop: 330, rowTop: 580, rowGap: 270, num: 52, title: 88, desc: 42, indent: 124, arcS: 0.66 },
  '1x1': { x: 88, head: 60, headTop: 140, rowTop: 320, rowGap: 162, num: 42, title: 64, desc: 32, indent: 104, arcS: 0.5 },
};

export default {
  id: 'themen',
  no: '07',
  title: 'Infografik',
  file: 'Infografik-Themen',
  name: 'Unsere Themen',
  category: 'Information',
  notes: 'Agenda / topic overview with a red focus that walks through the list.',
  duration: 8.16,
  stills: [1.6, 2.8, 4.4, 6.0, 7.5],
  copy: {
    heading: 'Unsere Themen',
    items: [
      ['01', 'Zusammenhalt', 'Eine Gesellschaft, die zusammenhält.'],
      ['02', 'Verantwortung', 'Entscheidungen offen erklären.'],
      ['03', 'Zukunft', 'Zusammen nach vorn schauen.'],
    ],
  },
  draw(ctx, t, fmt, copy) {
    background(ctx, fmt);
    const T = tok(fmt);
    const g = GEO[fmt.id];
    const pl = place(fmt, T.arcKind, g.arcS);
    drawArcs(ctx, T.arcKind, pl, motion(t, { enter: aufgang(T.arcKind, 0.0), exit: senken(T.arcKind, OUT + 0.15), breathe: { amp: 3, period: 6, t0: 1.5 } }));

    const exitAt = (i) => clamp01((t - (OUT + i * 0.05)) / 0.48);
    revealLine(ctx, copy.heading, g.x, g.headTop + g.head * CAP, prog(t, 0.25, 0.84), { size: g.head, exit: exitAt(0) });

    copy.items.forEach(([num, title, desc], i) => {
      const y0 = g.rowTop + i * g.rowGap;
      const tb = y0 + g.title * CAP; // title baseline
      const st = 0.7 + i * 0.22;
      // focus: 0..1 how active this row is
      const on = prog(t, FOCUS[i], 0.36, E.arrive) * (1 - (FOCUS[i + 1] ? prog(t, FOCUS[i + 1], 0.36, E.arrive) : 0));
      const col = mixHex(C.black, C.red, on);
      const step = on * g.desc * 0.7;
      revealLine(ctx, num, g.x, tb, prog(t, st, 0.72), { size: g.num, color: col, exit: exitAt(i + 1) });
      revealLine(ctx, title, g.x + g.indent + step, tb, prog(t, st + 0.06, 0.8), { size: g.title, exit: exitAt(i + 1) });
      revealLine(ctx, desc, g.x + g.indent + step, tb + g.desc * 1.7, prog(t, st + 0.16, 0.8), { size: g.desc, weight: 'book', exit: exitAt(i + 1) });
    });

    if (fmt.id === '16x9') logoBug(ctx, t, fmt, 1.2, { exit: clamp01((t - OUT - 0.1) / 0.5) });
  },
};


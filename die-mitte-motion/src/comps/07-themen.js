// 07 — Infografik „Unsere Themen“ (agenda / topic list)
// Rows rise on the beat; a red focus walks through the list — the active
// numeral turns red, exactly as on the presentation slide. The left edge never moves.

import { background } from '../core/stage.js';
import { prog, clamp01, lerp } from '../core/time.js';
import { E } from '../core/ease.js';
import { tok, scale } from '../formats.js';
import { C } from '../brand/palette.js';
import { revealLine, fit, CAP } from '../core/text.js';
import { drawArcs, place, motion } from '../brand/arcs.js';
import { aufgang, senken } from '../brand/arc-moves.js';
import { logoBug, bugGeometry } from '../brand/bug.js';

const OUT = 7.2;
const FOCUS = [2.3, 3.85, 5.4]; // focus moves to row i at these times

function mixHex(a, b, u) {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return '#' + pa.map((v, i) => Math.round(lerp(v, pb[i], u)).toString(16).padStart(2, '0')).join('');
}

// rowTop: cap top of the first item; rowGap: distance between items; head/item: type levels.
// 1:1 steps one level down: the square's heading shares its line with the bug.
const GEO = {
  '16x9': { rowTop: 360, rowGap: 196, indent: 132, arcS: 0.5, bug: 'right', head: 'h1', item: 'h2' },
  '9x16': { rowTop: 690, rowGap: 236, indent: 116, arcS: 0.66, bug: 'center', head: 'h1', item: 'h2' },
  '1x1': { rowTop: 262, rowGap: 168, indent: 86, arcS: 0.46, bug: 'right', head: 'h2', item: 'h3' },
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
    const S = scale(fmt);
    const g = GEO[fmt.id];
    const pl = place(fmt, T.arcKind, g.arcS);
    drawArcs(ctx, T.arcKind, pl, motion(t, { enter: aufgang(T.arcKind, 0.0), exit: senken(T.arcKind, OUT + 0.15), breathe: { amp: 3, period: 6, t0: 1.5 } }));

    const x = T.m;
    const exitAt = (i) => clamp01((t - (OUT + i * 0.05)) / 0.48);
    const bug = bugGeometry(fmt, null, g.bug);
    // heading: cap top aligned with the bug's top (16:9 / 1:1), below the bug in 9:16;
    // never closer to the bug than 1.8 M heights (long headings step down in size)
    const headTop = fmt.id === '9x16' ? bug.y + bug.hm + 90 : bug.y;
    const headW = (g.bug === 'right' ? bug.x - bug.hm * 1.8 : fmt.w - T.m) - x;
    const head = fit(ctx, copy.heading, 'demi', S[g.head], headW);
    revealLine(ctx, copy.heading, x, headTop + head * CAP, prog(t, 0.25, 0.84), { size: head, exit: exitAt(0) });

    const item = S[g.item];
    const num = Math.max(S.small, Math.round(item * 0.6));
    copy.items.forEach(([n, title, desc], i) => {
      const tb = g.rowTop + i * g.rowGap + item * CAP; // item baseline
      const st = 0.7 + i * 0.22;
      const on = prog(t, FOCUS[i], 0.36, E.arrive) * (1 - (FOCUS[i + 1] ? prog(t, FOCUS[i + 1], 0.36, E.arrive) : 0));
      revealLine(ctx, n, x, tb, prog(t, st, 0.72), { size: num, color: mixHex(C.black, C.red, on), exit: exitAt(i + 1) });
      revealLine(ctx, title, x + g.indent, tb, prog(t, st + 0.06, 0.8), { size: item, exit: exitAt(i + 1) });
      revealLine(ctx, desc, x + g.indent, tb + S.body * 1.55, prog(t, st + 0.16, 0.8), { size: S.body, weight: 'book', exit: exitAt(i + 1) });
    });

    logoBug(ctx, t, fmt, 1.2, { corner: g.bug === 'right' ? 'right' : undefined, exit: clamp01((t - OUT - 0.1) / 0.5) });
  },
};

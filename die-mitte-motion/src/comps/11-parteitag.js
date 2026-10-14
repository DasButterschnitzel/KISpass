// 11 — Parteitag (event teaser / social)
// A tracked label with a live dot, the big word built letter by letter,
// the slogan as sign-off. For stories, feeds and the screens in the hall.

import { background } from '../core/stage.js';
import { prog, clamp01, osc } from '../core/time.js';
import { E } from '../core/ease.js';
import { tok } from '../formats.js';
import { C } from '../brand/palette.js';
import { measure, revealLine, text, CAP } from '../core/text.js';
import { drawArcs, place, motion } from '../brand/arcs.js';
import { aufgang, senken } from '../brand/arc-moves.js';
import { logoBug } from '../brand/bug.js';

const OUT = 7.6;

/** One word, every glyph rising out of the baseline on its own beat. */
function riseWord(ctx, str, x, y, t, start, o) {
  const size = o.size;
  const w = measure(ctx, str, 'demi', size);
  const x0 = o.align === 'center' ? x - w / 2 : x;
  const ex = clamp01(o.exit || 0);
  ctx.save();
  ctx.beginPath();
  ctx.rect(x0 - size, y - size * 1.0, w + size * 2, size * 1.3);
  ctx.clip();
  const chars = [...str];
  chars.forEach((ch, i) => {
    const q = prog(t, start + i * (o.stagger ?? 0.045), o.dur ?? 0.8);
    if (q <= 0) return;
    const px = x0 + measure(ctx, str.slice(0, i), 'demi', size); // kerning-aware advance
    const dy = (1 - q) * size * 1.3 - E.leave(ex) * size * 1.3;
    text(ctx, ch, px, y + dy, { size, weight: 'demi' });
  });
  ctx.restore();
}

const GEO = {
  '16x9': { label: 30, word: 236, slogan: 64, labelY: 352, wordY: 590, sloganY: 708, arcS: 0.72 },
  '9x16': { label: 32, word: 176, slogan: 64, labelY: 760, wordY: 950, sloganY: 1060, arcS: 0.755 },
  '1x1': { label: 26, word: 156, slogan: 54, labelY: 400, wordY: 560, sloganY: 656, arcS: 0.609 },
};

export default {
  id: 'parteitag',
  no: '11',
  title: 'Social',
  file: 'Social-Parteitag',
  name: 'Parteitag · Live',
  category: 'Social',
  notes: 'Event teaser for social and hall screens. Label, word and slogan editable.',
  duration: 8.64,
  stills: [1.0, 1.7, 3.5, 7.9],
  copy: { label: 'LIVE AUS BERLIN', word: 'Parteitag', slogan: 'Gemeinsam weiter.' },
  draw(ctx, t, fmt, copy) {
    background(ctx, fmt);
    const T = tok(fmt);
    const g = GEO[fmt.id];
    const wide = fmt.id === '16x9';
    const pl = place(fmt, T.arcKind, g.arcS);
    drawArcs(ctx, T.arcKind, pl, motion(t, { enter: aufgang(T.arcKind, 0.0), exit: senken(T.arcKind, OUT + 0.15), breathe: { amp: 3, period: 6, t0: 1.6 } }));

    const x = wide ? T.m : fmt.w / 2;
    const align = wide ? 'left' : 'center';
    const exitAt = (d) => clamp01((t - OUT - d) / 0.48);

    // live label: red dot + tracked caps (Book)
    const tr = 0.18;
    const lw = measure(ctx, copy.label, 'book', g.label, tr);
    const dot = g.label * 0.34;
    const gap = g.label * 0.7;
    const total = dot * 2 + gap + lw;
    const lx = wide ? x : x - total / 2;
    const lq = prog(t, 0.3, 0.72);
    if (lq > 0 && exitAt(0) < 1) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(lx - 20, g.labelY - g.label * 1.1, total + 40, g.label * 1.5);
      ctx.clip();
      const dy = (1 - lq) * g.label * 1.4 - E.leave(exitAt(0)) * g.label * 1.4;
      const pulse = 1 + 0.12 * Math.max(0, osc(t, 1.2)); // the live dot breathes
      ctx.beginPath();
      ctx.arc(lx + dot, g.labelY - g.label * CAP * 0.5 + dy, dot * pulse, 0, Math.PI * 2);
      ctx.fillStyle = C.red;
      ctx.fill();
      text(ctx, copy.label, lx + dot * 2 + gap, g.labelY + dy, { size: g.label, weight: 'book', tracking: tr });
      ctx.restore();
    }

    riseWord(ctx, copy.word, x, g.wordY, t, 0.55, { size: g.word, align, exit: exitAt(0.05) });
    revealLine(ctx, copy.slogan, x, g.sloganY, prog(t, 1.45, 0.84), {
      size: g.slogan, align, exit: exitAt(0.1), qPunct: prog(t, 1.75, 0.6),
    });

    logoBug(ctx, t, fmt, 2.0, { exit: exitAt(0.15) });
  },
};

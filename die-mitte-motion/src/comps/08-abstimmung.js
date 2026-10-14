// 08 — Infografik „Abstimmung“ (vote result)
// Data drawn in the language of the Bogen: the result is a dome rising from
// the edge. Segments sweep in, the figure counts with fixed-width digits,
// the verdict lands with its full stop.

import { background } from '../core/stage.js';
import { prog, clamp01 } from '../core/time.js';
import { E } from '../core/ease.js';
import { tok } from '../formats.js';
import { C } from '../brand/palette.js';
import { revealLine, figures, measure, text, CAP } from '../core/text.js';
import { logoBug } from '../brand/bug.js';

const OUT = 7.56;

function sector(ctx, cx, cy, R, r, a, b, color) {
  if (b <= a) return;
  const a0 = Math.PI + a * Math.PI, a1 = Math.PI + b * Math.PI;
  ctx.beginPath();
  ctx.arc(cx, cy, R, a0, a1);
  ctx.arc(cx, cy, r, a1, a0, true);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

const GEO = {
  '16x9': { x: 128, head: 64, headTop: 150, sub: 36, legTop: 430, leg: 40, legGap: 66, verdict: 76, verdictY: 860,
    dome: { cx: 1310, cy: 1080, R: 500, r: 356 }, num: 168, numY: 1000 },
  '9x16': { x: 96, head: 76, headTop: 330, sub: 40, legTop: 560, leg: 44, legGap: 74, verdict: 84, verdictY: 1455, center: true,
    dome: { cx: 540, cy: 1360, R: 450, r: 316 }, num: 176, numY: 1316 },
  '1x1': { x: 88, head: 56, headTop: 110, sub: 32, legTop: 330, leg: 34, legGap: 54, verdict: 60, verdictY: 560,
    dome: { cx: 540, cy: 1080, R: 410, r: 290 }, num: 136, numY: 1036 },
};

export default {
  id: 'abstimmung',
  no: '08',
  title: 'Infografik',
  file: 'Infografik-Abstimmung',
  name: 'Abstimmung',
  category: 'Information',
  notes: 'Vote result as a data dome. Edit results via --copy (values in %).',
  duration: 8.64,
  stills: [1.5, 2.4, 3.6, 5.0, 7.9],
  copy: {
    heading: 'Abstimmung',
    sub: 'Leitantrag „Zusammenhalt“',
    results: [['Ja', 87], ['Nein', 9], ['Enthaltung', 4]],
    verdict: 'Angenommen.',
  },
  draw(ctx, t, fmt, copy) {
    background(ctx, fmt);
    const T = tok(fmt);
    const g = GEO[fmt.id];
    const exitAt = (d) => clamp01((t - OUT - d) / 0.48);
    const [yes, no, abst] = copy.results.map((r) => r[1] / 100);
    const colors = [C.gold, C.red, C.mgray];

    // dome — rises from the edge, sweeps, sinks on exit
    const d = g.dome;
    const sink = prog(t, OUT + 0.1, 0.7, E.leave) * (d.R + 40);
    const rise = (1 - prog(t, 0.45, 0.9, E.arrive)) * (d.R * 0.35);
    const cy = d.cy + sink + rise;
    const track = prog(t, 0.45, 1.0, E.sweep);
    const pY = prog(t, 1.15, 1.7, E.glide);
    const pN = prog(t, 2.75, 0.6, E.glide);
    const pA = prog(t, 3.2, 0.5, E.glide);
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, fmt.w, d.cy + 0.5);
    ctx.clip();
    sector(ctx, d.cx, cy, d.R, d.r, 0, track, C.lgray);
    sector(ctx, d.cx, cy, d.R, d.r, 0, yes * pY, colors[0]);
    sector(ctx, d.cx, cy, d.R, d.r, yes, yes + no * pN, colors[1]);
    sector(ctx, d.cx, cy, d.R, d.r, yes + no, yes + no + abst * pA, colors[2]);
    // the figure inside the dome
    const val = Math.round(copy.results[0][1] * pY);
    const nq = prog(t, 1.0, 0.6);
    if (nq > 0) {
      ctx.save();
      ctx.globalAlpha *= 1;
      ctx.beginPath();
      ctx.arc(d.cx, cy, d.r - 2, Math.PI, 2 * Math.PI);
      ctx.clip();
      const yOff = (1 - nq) * g.num * 0.9 + sink + rise;
      const w = figures(ctx, `${val}`, 0, -9999, { size: g.num });
      const pct = measure(ctx, ' %', 'demi', g.num * 0.62);
      const x0 = d.cx - (w + pct) / 2;
      figures(ctx, `${val}`, x0, g.numY + yOff, { size: g.num });
      text(ctx, ' %', x0 + w, g.numY + yOff, { size: g.num * 0.62 });
      ctx.restore();
    }
    ctx.restore();

    // heading + sub
    const x = g.x;
    const hb = g.headTop + g.head * CAP;
    revealLine(ctx, copy.heading, x, hb, prog(t, 0.2, 0.84), { size: g.head, exit: exitAt(0) });
    revealLine(ctx, copy.sub, x, hb + g.sub * 1.75, prog(t, 0.32, 0.84), { size: g.sub, weight: 'book', exit: exitAt(0.04) });

    // legend: brand discs as keys
    copy.results.forEach(([label, v], i) => {
      const yb = g.legTop + i * g.legGap + g.leg * CAP;
      const st = [1.2, 2.75, 3.2][i];
      const q = prog(t, st, 0.72);
      const ex = exitAt(0.08 + i * 0.04);
      if (q <= 0 || ex >= 1) return;
      const rr = g.leg * 0.3;
      ctx.save();
      ctx.beginPath();
      ctx.rect(x - 10, yb - g.leg * 1.05, fmt.w, g.leg * 1.4);
      ctx.clip();
      const dy = (1 - q) * g.leg * 1.3 - E.leave(ex) * g.leg * 1.3;
      ctx.beginPath();
      ctx.arc(x + rr, yb - g.leg * CAP * 0.5 + dy, rr, 0, Math.PI * 2);
      ctx.fillStyle = colors[i];
      ctx.fill();
      ctx.restore();
      revealLine(ctx, label, x + rr * 2 + g.leg * 0.45, yb, q, { size: g.leg, exit: ex });
      revealLine(ctx, `${v} %`, x + rr * 2 + g.leg * 0.45 + measure(ctx, 'Enthaltung', 'demi', g.leg) + g.leg * 0.8, yb, q, { size: g.leg, weight: 'book', exit: ex });
    });

    // verdict
    const vx = g.center ? fmt.w / 2 : x;
    const vq = prog(t, 4.0, 0.84);
    revealLine(ctx, copy.verdict, vx, g.verdictY, vq, {
      size: g.verdict, align: g.center ? 'center' : 'left', exit: exitAt(0.2),
      qPunct: prog(t, 4.32, 0.6),
    });

    if (fmt.id === '16x9') logoBug(ctx, t, fmt, 1.3, { exit: exitAt(0.15) });
  },
};

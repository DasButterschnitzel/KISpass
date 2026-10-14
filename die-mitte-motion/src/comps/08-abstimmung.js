// 08 — Infografik „Abstimmung“ (vote result)
// Data drawn in the language of the Bogen: the result is a dome rising from
// the edge. Ja / Nein / Enthaltung are gold / red / black — together the
// complete band. Segments sweep in, the figure counts with fixed-width
// digits, the verdict lands with its full stop.

import { background } from '../core/stage.js';
import { prog, clamp01 } from '../core/time.js';
import { E } from '../core/ease.js';
import { tok, scale } from '../formats.js';
import { C } from '../brand/palette.js';
import { revealLine, figures, measure, text, fit, CAP } from '../core/text.js';
import { logoBug, bugGeometry } from '../brand/bug.js';

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

// valX: right edge of the value column (tabular, right-aligned); head: type level of the heading
// (1:1 steps down one level: the square's heading shares its line with the bug)
const GEO = {
  '16x9': { x: 128, legTop: 430, legGap: 66, valX: 128 + 470, verdictY: 860, bug: 'right', head: 'h1',
    dome: { cx: 1310, cy: 1080, R: 500, r: 356 }, num: 168, numY: 1000 },
  '9x16': { x: 96, legTop: 680, legGap: 62, valX: 96 + 500, verdictY: 1420, center: true, bug: 'center', head: 'h1',
    dome: { cx: 540, cy: 1300, R: 400, r: 280 }, num: 160, numY: 1256 },
  '1x1': { x: 88, legTop: 316, legGap: 58, valX: 88 + 430, verdictY: 556, bug: 'right', head: 'h2',
    dome: { cx: 540, cy: 1080, R: 380, r: 268 }, num: 128, numY: 975 },
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
    const S = scale(fmt);
    const g = GEO[fmt.id];
    const exitAt = (d) => clamp01((t - OUT - d) / 0.48);
    const [yes, no, abst] = copy.results.map((r) => r[1] / 100);
    const colors = [C.gold, C.red, C.black];

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
      ctx.beginPath();
      ctx.arc(d.cx, cy, d.r - 2, Math.PI, 2 * Math.PI);
      ctx.clip();
      const yOff = (1 - nq) * g.num * 0.9 + sink + rise;
      const w = figures(ctx, '88', 0, -9999, { size: g.num }); // two fixed digit slots
      const pct = measure(ctx, ' %', 'demi', g.num * 0.62);
      const x0 = d.cx - (w + pct) / 2;
      figures(ctx, String(val), x0 + w, g.numY + yOff, { size: g.num, align: 'right' });
      text(ctx, ' %', x0 + w, g.numY + yOff, { size: g.num * 0.62, optical: false });
      ctx.restore();
    }
    ctx.restore();

    // heading + sub (cap top level with the bug in 16:9 / 1:1, below it in 9:16)
    const bug = bugGeometry(fmt, null, g.bug);
    const x = g.x;
    const headTop = fmt.id === '9x16' ? bug.y + bug.hm + 80 : bug.y;
    const headW = (g.bug === 'right' ? bug.x - bug.hm * 1.8 : fmt.w - tok(fmt).m) - x;
    const head = fit(ctx, copy.heading, 'demi', S[g.head], headW);
    const hb = headTop + head * CAP;
    revealLine(ctx, copy.heading, x, hb, prog(t, 0.2, 0.84), { size: head, exit: exitAt(0) });
    revealLine(ctx, copy.sub, x, hb + S.body * 1.7, prog(t, 0.32, 0.84), { size: S.body, weight: 'book', exit: exitAt(0.04) });

    // legend: brand discs as keys, values right-aligned in a fixed column
    const leg = S.body;
    copy.results.forEach(([label, v], i) => {
      const yb = g.legTop + i * g.legGap + leg * CAP;
      const st = [1.2, 2.75, 3.2][i];
      const q = prog(t, st, 0.72);
      const ex = exitAt(0.08 + i * 0.04);
      if (q <= 0 || ex >= 1) return;
      const rr = leg * 0.3;
      ctx.save();
      ctx.beginPath();
      ctx.rect(x - 10, yb - leg * 1.05, fmt.w, leg * 1.4);
      ctx.clip();
      const dy = (1 - q) * leg * 1.3 - E.leave(ex) * leg * 1.3;
      ctx.beginPath();
      ctx.arc(x + rr, yb - leg * CAP * 0.5 + dy, rr, 0, Math.PI * 2);
      ctx.fillStyle = colors[i];
      ctx.fill();
      ctx.restore();
      revealLine(ctx, label, x + rr * 2 + leg * 0.45, yb, q, { size: leg, exit: ex });
      revealLine(ctx, `${v} %`, g.valX, yb, q, { size: leg, weight: 'book', align: 'right', exit: ex });
    });

    // verdict
    const vx = g.center ? fmt.w / 2 : x;
    revealLine(ctx, copy.verdict, vx, g.verdictY, prog(t, 4.0, 0.84), {
      size: S.h2, align: g.center ? 'center' : 'left', exit: exitAt(0.2), qPunct: prog(t, 4.32, 0.6),
    });

    logoBug(ctx, t, fmt, 1.3, { corner: g.bug === 'right' ? 'right' : undefined, exit: exitAt(0.15) });
  },
};

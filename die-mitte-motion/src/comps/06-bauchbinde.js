// 06 — Bauchbinde (lower third), alpha channel.
// A silver panel is pulled open by the band: the miniature corner motif is the
// panel's leading edge. Name and role rise out of their baselines.
// Exit: type leaves upwards, the panel retracts — the arcs lead it home.

import { background } from '../core/stage.js';
import { prog, clamp01 } from '../core/time.js';
import { E } from '../core/ease.js';
import { C } from '../brand/palette.js';
import { measure, revealLine } from '../core/text.js';
import { drawArcs, motion, REF_W, REF_H, MOTIF_TOP, CORNER_LEFT } from '../brand/arcs.js';

const OUT = 6.0;

const GEO = {
  '16x9': { x: 128, bottom: 980, h: 164, name: 54, role: 34, pad: 46 },
  '9x16': { x: 64, bottom: 1490, h: 196, name: 62, role: 38, pad: 50, full: true },
  '1x1': { x: 72, bottom: 992, h: 150, name: 48, role: 30, pad: 40 },
};

export default {
  id: 'bauchbinde',
  no: '06',
  title: 'Bauchbinde',
  file: 'Bauchbinde',
  name: 'Name & Funktion',
  category: 'Overlay',
  alpha: true,
  notes: 'Name super with alpha channel (MOV PNG / WebM). Place over footage. In 0–1 s, out from 6.0 s.',
  duration: 7.2,
  stills: [0.3, 0.7, 2.5, 6.4],
  copy: { name: 'Vorname Nachname', role: 'Funktion · Die Mitte' },
  draw(ctx, t, fmt, copy) {
    background(ctx, fmt, { transparent: true });
    const g = GEO[fmt.id];
    const s = (g.h / (REF_H - MOTIF_TOP.corner)) * 0.86; // mini motif scale
    const arcW = (REF_W - CORNER_LEFT) * s;
    const nameW = measure(ctx, copy.name, 'demi', g.name);
    const roleW = measure(ctx, copy.role, 'book', g.role);
    const textW = Math.max(nameW, roleW);
    let pw = g.pad + textW + g.pad * 1.4 + arcW;
    if (g.full) pw = fmt.w - g.x * 2; // vertical: fixed full-width panel
    const top = g.bottom - g.h;

    const open = prog(t, 0.0, 0.72, E.arrive);
    const close = prog(t, OUT + 0.3, 0.6, E.leave);
    const w = pw * open * (1 - close);
    if (w <= 0.5) return;

    // panel
    ctx.save();
    ctx.beginPath();
    ctx.rect(g.x, top, w, g.h);
    ctx.clip();
    ctx.fillStyle = C.silver;
    ctx.fillRect(g.x, top, w, g.h);
    // miniature corner motif riding on the leading edge
    const right = g.x + w;
    const pl = { x: right - REF_W * s, y: g.bottom - REF_H * s, s };
    drawArcs(ctx, 'corner', pl, motion(t, {
      enter: { type: 'grow', start: 0.18, dur: 0.9, stagger: 0.045, pivot: [REF_W, REF_H], order: ['lgray', 'mgray', 'mgray2', 'black', 'red', 'gold'] },
    }));
    // type
    const nx = g.x + g.pad;
    const nb = top + g.h * 0.47;
    const rb = nb + g.role * 1.55;
    revealLine(ctx, copy.name, nx, nb, prog(t, 0.3, 0.72), { size: g.name, weight: 'demi', exit: clamp01((t - OUT) / 0.4) });
    revealLine(ctx, copy.role, nx, rb, prog(t, 0.4, 0.72), { size: g.role, weight: 'book', exit: clamp01((t - OUT - 0.04) / 0.4) });
    ctx.restore();
  },
};

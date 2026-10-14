// 00 — Showreel (16:9)
// The package cut together on the beat, joined by its own transitions.
// Includes a triptych: one piece playing in all three formats in sync.

import { background } from '../core/stage.js';
import { FORMATS } from '../formats.js';
import { text } from '../core/text.js';
import { drawTransition } from '../brand/transitions.js';
import { scratchCanvas } from '../core/platform.js';
import opener from './02-opener.js';
import logoReveal from './01-logo-reveal.js';
import sloganMitte from './03-slogan-mitte.js';
import sloganWeiter from './04-slogan-weiter.js';
import titelkarte from './05-titelkarte.js';
import bauchbinde from './06-bauchbinde.js';
import themen from './07-themen.js';
import abstimmung from './08-abstimmung.js';
import zitat from './09-zitat.js';
import parteitag from './11-parteitag.js';
import abspann from './12-abspann.js';

const TD = { aufgang: 1.2, ecke: 1.28, silber: 1.04 };

// scene list: comp, start offset in the comp, length on the reel; transitions between
const SEQ = [
  { comp: opener, from: 0, len: 12.0 },
  { tr: 'silber' },
  { comp: logoReveal, from: 0.1, len: 4.9 },
  { tr: 'aufgang' },
  { comp: sloganMitte, from: 0.2, len: 5.5 },
  { tr: 'silber' },
  { comp: sloganWeiter, from: 0.1, len: 4.6 },
  { tr: 'ecke' },
  { comp: titelkarte, from: 0, len: 4.4 },
  { tr: 'silber' },
  { comp: bauchbinde, from: 0, len: 4.2, footage: true },
  { tr: 'silber' },
  { comp: themen, from: 0, len: 6.9 },
  { tr: 'aufgang' },
  { comp: abstimmung, from: 0.2, len: 6.0 },
  { tr: 'silber' },
  { comp: zitat, from: 0, len: 5.8 },
  { tr: 'ecke' },
  { triptych: parteitag, from: 0, len: 7.6 },
  { tr: 'silber' },
  { comp: abspann, from: 0, len: 7.2 },
];

const PLAN = (() => {
  let cur = 0;
  const out = [];
  for (const s of SEQ) {
    if (s.tr) out.push({ ...s, t0: cur - TD[s.tr] / 2, t1: cur + TD[s.tr] / 2 });
    else { out.push({ ...s, t0: cur, t1: cur + s.len }); cur += s.len; }
  }
  return { items: out, total: cur };
})();

function footage(ctx, fmt) {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const W = ctx.canvas.width, H = ctx.canvas.height;
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, '#5b6067');
  g.addColorStop(0.55, '#3a3e44');
  g.addColorStop(1, '#2a2d31');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  const r = ctx.createRadialGradient(W * 0.68, H * 0.35, 0, W * 0.68, H * 0.35, W * 0.45);
  r.addColorStop(0, 'rgba(255,255,255,0.16)');
  r.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = r;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
  ctx.__keepBackdrop = true;
}

function triptych(ctx, comp, t, fmt) {
  background(ctx, fmt, { color: '#D6D9DC' });
  const slots = [
    { f: FORMATS['9x16'], w: 405, label: '9:16' },
    { f: FORMATS['16x9'], w: 768, label: '16:9' },
    { f: FORMATS['1x1'], w: 432, label: '1:1' },
  ];
  const gap = 56;
  let x = (fmt.w - slots.reduce((s, q) => s + q.w, 0) - gap * 2) / 2;
  const base = 892;
  const T = ctx.getTransform();
  for (const s of slots) {
    const h = (s.w * s.f.h) / s.f.w;
    const dw = Math.round(s.w * T.a), dh = Math.round(h * T.a);
    const off = scratchCanvas('tri-' + s.label, dw, dh);
    const oc = off.getContext('2d');
    oc.setTransform(1, 0, 0, 1, 0, 0);
    oc.clearRect(0, 0, dw, dh);
    oc.setTransform(dw / s.f.w, 0, 0, dh / s.f.h, 0, 0);
    comp.draw(oc, t, s.f, comp.copy || {});
    ctx.drawImage(off, x, base - h, s.w, h);
    text(ctx, s.label, x, base + 44, { size: 26, weight: 'book', color: '#55595f' });
    x += s.w + gap;
  }
}

export default {
  id: 'showreel',
  no: '00',
  title: 'Showreel',
  file: 'Showreel',
  name: 'Motion Identity',
  category: 'Reel',
  formats: ['16x9'],
  notes: 'The package on one timeline, cut on the beat with its own transitions.',
  duration: PLAN.total,
  shutterAt(t) {
    for (const s of PLAN.items) if (s.tr && t >= s.t0 - 0.04 && t < s.t1 + 0.04) return 90;
    const sc = PLAN.items.find((s) => !s.tr && t >= s.t0 && t < s.t1);
    return sc && sc.comp && sc.comp.shutterAt ? sc.comp.shutterAt(sc.from + (t - sc.t0)) : 180;
  },
  stills: [3, 14, 33.5, 60],
  draw(ctx, t, fmt) {
    const items = PLAN.items;
    const scenes = items.filter((s) => !s.tr);
    const sc = scenes.find((s) => t >= s.t0 && t < s.t1) || scenes[scenes.length - 1];
    const lt = sc.from + (t - sc.t0);
    ctx.save();
    ctx.__keepBackdrop = false;
    if (sc.triptych) triptych(ctx, sc.triptych, lt, fmt);
    else {
      if (sc.footage) footage(ctx, fmt);
      sc.comp.draw(ctx, lt, fmt, sc.comp.copy || {});
    }
    ctx.__keepBackdrop = false;
    ctx.restore();
    for (const s of items) if (s.tr && t >= s.t0 && t < s.t1) drawTransition(ctx, fmt, s.tr, (t - s.t0) / (s.t1 - s.t0));
  },
};


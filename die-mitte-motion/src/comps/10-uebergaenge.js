// 10 — Übergänge (transitions)
// Three overlays with alpha channel + a demo between two example scenes.
// Cut point: exactly at half the duration (frame fully covered by silver).

import { background } from '../core/stage.js';
import { clamp01 } from '../core/time.js';
import { drawTransition } from '../brand/transitions.js';
import titelkarte from './05-titelkarte.js';
import zitat from './09-zitat.js';
import themen from './07-themen.js';

const D = { aufgang: 1.2, ecke: 1.28, silber: 1.04 };

function overlay(kind, no, name) {
  return {
    id: `uebergang-${kind}`,
    no,
    title: 'Übergang',
    file: `Uebergang-${kind[0].toUpperCase() + kind.slice(1)}`,
    name,
    category: 'Übergang',
    alpha: true,
    shutter: 90, // crisp colour bands
    notes: 'Overlay with alpha. Put it over a hard cut: the cut point is exactly half the duration (frame fully covered by silver).',
    duration: D[kind],
    stills: [D[kind] * 0.3, D[kind] * 0.5, D[kind] * 0.7],
    draw(ctx, t, fmt) {
      background(ctx, fmt, { transparent: true });
      drawTransition(ctx, fmt, kind, clamp01(t / D[kind]));
    },
  };
}

export const aufgang = overlay('aufgang', '10a', 'Aufgang');
export const ecke = overlay('ecke', '10b', 'Ecke');
export const silber = overlay('silber', '10c', 'Silber');

// Demo: title card → (Aufgang) → quote → (Ecke) → topics → (Silber) → title card
const SEQ = [
  { comp: titelkarte, from: 1.8, len: 2.2 },
  { kind: 'aufgang' },
  { comp: zitat, from: 2.6, len: 2.2 },
  { kind: 'ecke' },
  { comp: themen, from: 2.4, len: 2.2 },
  { kind: 'silber' },
  { comp: titelkarte, from: 1.8, len: 1.8, copy: { number: '02', title: 'Verantwortung', subtitle: 'Entscheidungen\noffen erklären.' } },
];

export const demo = {
  id: 'uebergaenge-demo',
  no: '10',
  title: 'Übergänge',
  file: 'Uebergaenge-Demo',
  name: 'Aufgang · Ecke · Silber',
  category: 'Übergang',
  notes: 'Demo of the three transitions between example scenes.',
  shutter: 90,
  duration: 8.4,
  stills: [1.95, 2.45, 4.15, 6.75],
  draw(ctx, t, fmt) {
    // timeline: scene, transition (overlapping the cut), scene, ...
    let cur = 0;
    const plan = [];
    for (const s of SEQ) {
      if (s.comp) { plan.push({ ...s, t0: cur, t1: cur + s.len }); cur += s.len; }
      else { const d = D[s.kind]; plan.push({ ...s, t0: cur - d / 2, t1: cur + d / 2 }); }
    }
    const scene = plan.filter((p) => p.comp).find((p) => t >= p.t0 && t < p.t1) || plan[plan.length - 1];
    ctx.save();
    scene.comp.draw(ctx, scene.from + (t - scene.t0), fmt, { ...(scene.comp.copy || {}), ...(scene.copy || {}) });
    ctx.restore();
    for (const p of plan) if (p.kind && t >= p.t0 && t < p.t1) drawTransition(ctx, fmt, p.kind, (t - p.t0) / (p.t1 - p.t0));
  },
};

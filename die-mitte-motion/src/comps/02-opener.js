// 02 — Opener „Aus der Mitte“
// One continuous aerial camera flight over the arc landscape. Four values land
// on the beat — Offen. Verbindend. Zukunftsgerichtet. Menschlich. — then the
// camera pulls back to the whole, the band writes the M into the sky and the
// slogan closes the sequence.
//
// Depth: every disc lives on its own plane. At macro zoom the planes separate
// (parallax), at rest they converge exactly into the Bogenmotiv.

import { background } from '../core/stage.js';
import { prog, clamp01 } from '../core/time.js';
import { cameraPath } from '../core/spline.js';
import { revealLine, measure, CAP } from '../core/text.js';
import { drawArcs, REF_W, REF_H } from '../brand/arcs.js';
import { lockupHWidth, LOCK_S } from '../brand/logo.js';
import { lockupHReveal, lockupSReveal } from '../brand/lockup-anim.js';

const DEPTH = { hillL: 0.9, hillR: 0.9, hillR2: 0.94, gold: 0.97, red: 1.0, black: 1.03, front: 1.1 };
const BEATS = [0.8, 2.3, 4.2, 6.1]; // shot hold starts
const HOLD = 0.7;
const FINAL_T = 9.6;

// Per format: shots (z = px per ref unit, F = ref focus, S = screen anchor as fractions),
// text placement per shot, and the final framing (the brand layout).
const PLAN = {
  '16x9': {
    word: 150,
    shots: [
      { z: 3.4, F: [1500, 430], S: [0.62, 0.64], tx: 128, ty: 0.34 },
      { z: 2.6, F: [430, 500], S: [0.5, 0.68], tx: 0.46, ty: 0.22 },
      { z: 2.15, F: [1000, 470], S: [0.5, 0.7], tx: 128, ty: 0.3 },
      { z: 2.7, F: [200, 330], S: [0.4, 0.62], tx: 128, ty: 0.24 },
    ],
    final: { z: 1.1, F: [887, 887], S: [960, 1331] },
    lock: { hm: 150, y: 222, drawH: 230 },
    slogan: { size: 84, y: 532, oneLine: true },
  },
  '9x16': {
    word: 118,
    shots: [
      { z: 2.6, F: [1500, 430], S: [0.6, 0.62], tx: 96, ty: 0.36 },
      { z: 1.8, F: [430, 520], S: [0.5, 0.66], tx: 96, ty: 0.34 },
      { z: 1.7, F: [1000, 470], S: [0.5, 0.66], tx: 0.5, ty: 0.36, center: true },
      { z: 2.0, F: [200, 330], S: [0.45, 0.6], tx: 96, ty: 0.3 },
    ],
    final: { z: 0.755, F: [887, 887], S: [540, 1920] },
    lock: { hm: 250, y: 330, drawH: 300 },
    slogan: { size: 92, y: 1050 },
  },
  '1x1': {
    word: 104,
    shots: [
      { z: 2.4, F: [1500, 430], S: [0.6, 0.64], tx: 88, ty: 0.34 },
      { z: 1.7, F: [430, 500], S: [0.5, 0.7], tx: 88, ty: 0.24 },
      { z: 1.5, F: [1000, 470], S: [0.5, 0.68], tx: 0.5, ty: 0.32, center: true },
      { z: 2.0, F: [200, 330], S: [0.45, 0.62], tx: 88, ty: 0.26 },
    ],
    final: { z: 0.609, F: [887, 887], S: [540, 1080] },
    lock: { hm: 170, y: 120, drawH: 210 },
    slogan: { size: 76, y: 548 },
  },
};

const cache = new Map();
function pathFor(fmt) {
  if (cache.has(fmt.id)) return cache.get(fmt.id);
  const P = PLAN[fmt.id];
  const px = (s) => [s.S[0] * fmt.w, s.S[1] * fmt.h];
  const keys = [];
  const s0 = P.shots[0];
  keys.push({ t: 0, z: s0.z * 0.92, F: [s0.F[0] - 40, s0.F[1] - 330], S: px(s0) }); // sky first: the hill rises in
  P.shots.forEach((s, i) => {
    const t0 = BEATS[i];
    keys.push({ t: t0, z: s.z, F: s.F, S: px(s) });
    keys.push({ t: t0 + HOLD, z: s.z * 1.035, F: [s.F[0] + 10, s.F[1] - 4], S: px(s) }); // slow drift
  });
  keys.push({ t: FINAL_T, ...P.final });
  keys.push({ t: 20, ...P.final });
  const p = cameraPath(keys);
  cache.set(fmt.id, p);
  return p;
}

export default {
  id: 'opener',
  no: '02',
  title: 'Opener',
  file: 'Opener',
  name: 'Aus der Mitte',
  category: 'Opener',
  notes: 'Title sequence for broadcasts, streams and the party congress. 26 beats. Ends on the key visual.',
  duration: 12.48,
  stills: [0.4, 1.2, 2.9, 4.8, 6.7, 8.4, 9.4, 12.2],
  copy: {
    values: ['Offen.', 'Verbindend.', 'Zukunftsgerichtet.', 'Menschlich.'],
    slogan1: 'Aus der Mitte.',
    slogan2: 'Für das Ganze.',
  },
  draw(ctx, t, fmt, copy) {
    background(ctx, fmt);
    const P = PLAN[fmt.id];
    const cam = pathFor(fmt)(t);
    const zMax = Math.max(...P.shots.map((s) => s.z));
    const kpar = clamp01(Math.log(cam.z / P.final.z) / Math.log(zMax / P.final.z));
    const pl = { x: cam.S[0] - cam.F[0] * cam.z, y: cam.S[1] - cam.F[1] * cam.z, s: cam.z };
    drawArcs(ctx, 'bottom', pl, (d) => ({
      dx: 0, dy: 0, rot: 0, rx: REF_W, ry: REF_H, show: true,
      k: 1 + ((DEPTH[d.id] ?? 1) - 1) * kpar, kx: cam.F[0], ky: cam.F[1],
    }));

    // the four values, one per shot
    copy.values.forEach((v, i) => {
      const s = P.shots[i];
      // in just before the camera settles, out before the next word arrives (no overlap)
      const t0 = BEATS[i] - (i === 0 ? 0.36 : 0.2);
      const q = prog(t, t0, 0.84);
      const ex = clamp01((t - (BEATS[i] + HOLD + 0.16)) / 0.36);
      if (q <= 0 || ex >= 1) return;
      const x = s.tx <= 1 ? s.tx * fmt.w : s.tx;
      const size = fitWord(ctx, v, P.word, s.center ? fmt.w - 192 : fmt.w - x - 72);
      revealLine(ctx, v, s.center ? fmt.w / 2 : x, s.ty * fmt.h + size * CAP * 0.5, q, {
        size, align: s.center ? 'center' : 'left', exit: ex, qPunct: prog(t, t0 + 0.24, 0.6),
      });
    });

    // the sign-off: the band writes the M into the sky, then logo + slogan
    const L = P.lock;
    const TM = { draw: [8.25, 1.5], move: [9.85, 0.84], word: [10.15, 0.9] };
    if (fmt.id === '16x9') {
      const W = lockupHWidth(L.hm);
      lockupHReveal(ctx, t, { x: (fmt.w - W) / 2, y: L.y, hm: L.hm }, TM, { center: fmt.w / 2, drawH: L.drawH });
      revealLine(ctx, `${copy.slogan1} ${copy.slogan2}`, fmt.w / 2, P.slogan.y, prog(t, 10.75, 0.9), {
        size: P.slogan.size, align: 'center', qPunct: prog(t, 11.1, 0.6),
      });
    } else {
      const H = LOCK_S.baseDy * L.hm;
      lockupSReveal(ctx, t, { cx: fmt.w / 2, y: L.y, hm: L.hm }, TM, { drawH: L.drawH, drawY: L.y + H / 2 - L.drawH / 2 + L.hm * 0.15 });
      const sz = P.slogan.size;
      revealLine(ctx, copy.slogan1, fmt.w / 2, P.slogan.y, prog(t, 10.75, 0.9), { size: sz, align: 'center', qPunct: prog(t, 11.05, 0.6) });
      revealLine(ctx, copy.slogan2, fmt.w / 2, P.slogan.y + sz * 1.12, prog(t, 10.9, 0.9), { size: sz, align: 'center', qPunct: prog(t, 11.2, 0.6) });
    }
  },
};

function fitWord(ctx, str, size, maxW) {
  const w = measure(ctx, str, 'demi', size);
  return w <= maxW ? size : Math.floor((size * maxW) / w);
}

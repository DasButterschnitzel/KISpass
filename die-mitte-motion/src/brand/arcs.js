// Der Bogen — the arc motif as living geometry.
//
// Both motifs from the production set (Bogenmotiv = bottom, Bogenmotiv-Ecke =
// corner) are stacks of discs. Every visible crescent is the part of a disc not
// covered by the disc in front of it. Animating disc centres and radii keeps the
// crescents organic: bands thicken, thin and settle like ribbons in a breeze —
// and every resting frame is the exact motif from the production set.

import { ARC_BOTTOM, ARC_CORNER, ARC_REF } from './geometry.js';
import { C } from './palette.js';
import { prog } from '../core/time.js';
import { E } from '../core/ease.js';

export const REF_W = ARC_REF[0];
export const REF_H = ARC_REF[1];
export const MOTIF = { bottom: ARC_BOTTOM, corner: ARC_CORNER };
/** Highest visible point of each motif (ref units from the top of the ref box). */
export const MOTIF_TOP = { bottom: 259, corner: 233 };
/** Leftmost visible point of the corner motif (ref units). */
export const CORNER_LEFT = 671;

/** Placement flush with the frame edge. bottom: centred on o.cx; corner: bottom-right. */
export function place(fmt, kind, s, o = {}) {
  if (kind === 'corner') return { x: fmt.w - REF_W * s + (o.dx || 0), y: fmt.h - REF_H * s + (o.dy || 0), s };
  const cx = o.cx ?? fmt.w / 2;
  return { x: cx - (REF_W * s) / 2 + (o.dx || 0), y: fmt.h - REF_H * s + (o.dy || 0), s };
}
/** Frame-space y of the motif's visible top for a placement. */
export const motifTop = (kind, pl) => pl.y + MOTIF_TOP[kind] * pl.s;

function orderIndex(order, i, n, d) {
  if (Array.isArray(order)) return order.indexOf(d.id) >= 0 ? order.indexOf(d.id) : i;
  if (typeof order === 'object' && order) return order[d.id] ?? i;
  return order === 'front' ? n - 1 - i : i;
}

/**
 * Build a per-disc transform function from a motion spec.
 *   enter / exit: a spec or an array of specs; each spec may carry `ids` to
 *     target a group of discs (e.g. the band rises while the hills slide in).
 *     { ids?, type: 'rise'|'drop'|'slide'|'path'|'fan'|'grow', start, dur, stagger,
 *       order: 'back'|'front'|[ids]|{id: slot}, dist, from/to (path), angle, pivot, ease }
 *   exit.reverse: false (default) → the exit continues the motion ("weiter").
 *   drift: { vx, vy, t0 } → constant slow travel (ref units / s) after t0.
 *   breathe: { amp, period, t0 } → small periodic drift (seamless if period divides the loop).
 * Offsets are in ref units (1774 × 887 box).
 */
export function motion(t, spec = {}) {
  const list = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);
  const enters = list(spec.enter), exits = list(spec.exit);
  return (d, i, n) => {
    const xf = { dx: 0, dy: 0, k: 1, kx: REF_W, ky: REF_H, rot: 0, rx: REF_W, ry: REF_H, show: true };
    const apply = (m, p, isExit, px, py) => {
      // p: 0 = at rest (on screen), 1 = fully displaced
      if (p <= 0 && !(m.type === 'path' && (px > 0 || py > 0))) return;
      const sign = isExit && !m.reverse ? -1 : 1;
      switch (m.type) {
        case 'rise': xf.dy += p * (m.dist ?? 900) * (isExit ? (m.reverse ? 1 : -1) : 1); break;
        case 'drop': xf.dy += p * (m.dist ?? 900); break;
        case 'path': {
          // curved path: separate easing per axis bends the trajectory into an arc
          const v = isExit ? m.to || [1800, 300] : m.from || [-1800, 300];
          xf.dx += px * v[0];
          xf.dy += py * v[1];
          break;
        }
        case 'slide': xf.dx += p * (m.dist ?? -1400) * sign; break;
        case 'fan': {
          xf.rot += p * (m.angle ?? 0.6) * sign;
          if (m.pivot) { xf.rx = m.pivot[0]; xf.ry = m.pivot[1]; }
          break;
        }
        case 'grow': {
          xf.k *= isExit && !m.reverse ? 1 + p * (m.grow ?? 3) : 1 - p;
          if (m.pivot) { xf.kx = m.pivot[0]; xf.ky = m.pivot[1]; }
          if (!isExit && p >= 1) xf.show = false;
          break;
        }
      }
    };
    const pick = (specs) => specs.find((m) => !m.ids || m.ids.includes(d.id));
    const en = pick(enters);
    if (en) {
      const slot = orderIndex(en.order, i, n, d);
      const st = en.start + slot * (en.stagger ?? 0.06) + (en.delay?.[d.id] || 0), du = en.dur ?? 1.2;
      const p = 1 - prog(t, st, du, en.ease || E.arrive);
      const px = 1 - prog(t, st, du, en.easeX || E.arrive);
      const py = 1 - prog(t, st, du, en.easeY || E.glide);
      apply(en, p, false, px, py);
    }
    const ex = pick(exits);
    if (ex) {
      const slot = orderIndex(ex.order ?? en?.order, i, n, d);
      const st = ex.start + slot * (ex.stagger ?? 0.04) + (ex.delay?.[d.id] || 0), du = ex.dur ?? 0.8;
      const p = prog(t, st, du, ex.ease || E.leave);
      const px = prog(t, st, du, ex.easeX || E.leave);
      const py = prog(t, st, du, ex.easeY || E.glide);
      apply(ex, p, true, px, py);
    }
    if (spec.drift) {
      const dt = Math.max(0, t - (spec.drift.t0 || 0));
      xf.dx += (spec.drift.vx || 0) * dt;
      xf.dy += (spec.drift.vy || 0) * dt;
    }
    const breathe = spec.breathe;
    if (breathe) {
      const T = breathe.period ?? 8;
      const ph = ((t - (breathe.t0 || 0)) / T + i * 0.137) * Math.PI * 2;
      const a = (breathe.amp ?? 6) * (breathe.weight ? breathe.weight(d, i) : 1);
      xf.dx += Math.sin(ph) * a;
      xf.dy += Math.cos(ph) * a * 0.55;
    }
    return xf;
  };
}

function transformDisc(d, xf) {
  let x = d.x, y = d.y, r = d.r;
  if (xf.k !== 1) {
    x = xf.kx + (x - xf.kx) * xf.k;
    y = xf.ky + (y - xf.ky) * xf.k;
    r *= xf.k;
  }
  if (xf.rot) {
    const c = Math.cos(xf.rot), s = Math.sin(xf.rot);
    const ox = x - xf.rx, oy = y - xf.ry;
    x = xf.rx + ox * c - oy * s;
    y = xf.ry + ox * s + oy * c;
  }
  return { x: x + xf.dx, y: y + xf.dy, r };
}

/**
 * Draw a motif. `kind` = 'bottom' | 'corner' or an explicit disc array.
 * pl = { x, y, s } placement; xfn = per-disc transform (see motion()).
 * o.colors: remap palette keys (e.g. mono silver version), o.alpha.
 */
export function drawArcs(ctx, kind, pl, xfn, o = {}) {
  if (globalThis.__qaNoArcs) return; // QA: frame without arcs
  const discs = Array.isArray(kind) ? kind : MOTIF[kind];
  const n = discs.length;
  const map = o.colors || {};
  const solved = discs.map((d, i) => {
    const xf = xfn ? xfn(d, i, n) : null;
    const g = xf ? transformDisc(d, xf) : { x: d.x, y: d.y, r: d.r };
    const inner = d.inner ? (xf ? transformDisc(d.inner, xf) : d.inner) : null;
    return { d, g, inner, show: xf ? xf.show : true };
  });
  const byId = Object.fromEntries(solved.map((s) => [s.d.id, s]));
  ctx.save();
  if (o.alpha != null) ctx.globalAlpha *= o.alpha;
  ctx.translate(pl.x, pl.y);
  ctx.scale(pl.s, pl.s);
  for (const s of solved) {
    if (!s.show || s.g.r <= 0) continue;
    ctx.save();
    if (s.d.clip && byId[s.d.clip]) {
      const q = byId[s.d.clip].g;
      ctx.beginPath();
      ctx.arc(q.x, q.y, Math.max(0, q.r), 0, Math.PI * 2);
      ctx.clip();
    }
    ctx.beginPath();
    ctx.arc(s.g.x, s.g.y, s.g.r, 0, Math.PI * 2);
    ctx.fillStyle = C[map[s.d.c] || s.d.c] || s.d.c;
    ctx.fill();
    if (s.inner) {
      ctx.clip();
      ctx.beginPath();
      ctx.arc(s.inner.x, s.inner.y, Math.max(0, s.inner.r), 0, Math.PI * 2);
      ctx.fillStyle = C[map[s.d.inner.c] || s.d.inner.c] || s.d.inner.c;
      ctx.fill();
    }
    ctx.restore();
  }
  ctx.restore();
}

/** Silver-only colour map (quiet variant: band colours become greys). */
export const QUIET = { black: 'mgray', red: 'lgray', gold: 'silver' };


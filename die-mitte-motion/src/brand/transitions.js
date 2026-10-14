// Übergänge — transitions made of the Bogen.
//
// Every transition is a wave of discs passing through the frame: thin bands of
// colour lead in, a silver body covers the frame for ~6 frames (the cut point is
// exactly at p = 0.5), and the same bands trail out. The national colours stay
// accents — they never flood the frame.
//
// Motion profile: y(u) = K·u³ + L·u with u = 2p − 1. Fast at the edges (the
// wave whooshes in and out), slow through the middle (a calm cover for the cut).
// L is solved per format so the silver body covers the frame for |u| ≤ U_COVER.
//
//  aufgang  the stack rises through the frame; bands unfold out of the edge
//  ecke     an eccentric ring wave ripples out of the corner (16:9) / bottom centre
//  silber   the quiet variant: greys and silver only, for frequent use

import { C } from './palette.js';
import { clamp01 } from '../core/time.js';

const U_COVER = 0.2; // ±20 % of the duration around the cut is fully covered

// radius (× half-diagonal R), horizontal offset (× R). Back → front.
const PASS_FULL = [
  { c: 'mgray', r: 1.32, dx: -0.05 },
  { c: 'lgray', r: 1.275, dx: 0.04 },
  { c: 'black', r: 1.23, dx: -0.03 },
  { c: 'red', r: 1.19, dx: 0.02 },
  { c: 'gold', r: 1.155, dx: 0.035 },
  { c: 'silver', r: 1.12, dx: 0 },
];
const PASS_QUIET = [
  { c: 'mgray', r: 1.2, dx: -0.035 },
  { c: 'lgray', r: 1.16, dx: 0.03 },
  { c: 'silver', r: 1.12, dx: 0 },
];
// ripple rings, back → front: band index from the silver body + eccentric offset (× span)
const RIPPLE = [
  { c: 'lgray', b: 5, ox: -0.012, oy: 0.01 },
  { c: 'mgray', b: 4, ox: 0.016, oy: -0.008 },
  { c: 'black', b: 3, ox: -0.012, oy: 0.008 },
  { c: 'red', b: 2, ox: 0.01, oy: -0.012 },
  { c: 'gold', b: 1, ox: 0.016, oy: 0.006 },
  { c: 'silver', b: 0, ox: 0, oy: 0 },
];

function wavePass(ctx, fmt, p, layers) {
  const R = 0.5 * Math.hypot(fmt.w, fmt.h);
  const cx = fmt.w / 2, cy = fmt.h / 2;
  const rs = layers[layers.length - 1].r * R; // silver body
  const margin = Math.sqrt(rs * rs - (fmt.w / 2) ** 2) - fmt.h / 2; // cover tolerance
  const Ds = fmt.h / 2 + rs + 20;
  const uc = U_COVER;
  const L = (margin * 0.92 - Ds * uc ** 3) / (uc - uc ** 3);
  const u = 2 * clamp01(p) - 1;
  for (const Lr of layers) {
    const r = Lr.r * R;
    const D = fmt.h / 2 + r + 20; // start/end distance from centre: fully outside
    const K = D - L;
    const y = cy - (K * u * u * u + L * u);
    if (y - r > fmt.h || y + r < 0) continue;
    ctx.beginPath();
    ctx.arc(cx + Lr.dx * R, y, r, 0, Math.PI * 2);
    ctx.fillStyle = C[Lr.c];
    ctx.fill();
  }
}

function waveRipple(ctx, fmt, p, origin) {
  const [ox, oy] = origin;
  const span = Math.hypot(Math.max(ox, fmt.w - ox), Math.max(oy, fmt.h - oy)) + 4;
  const band = Math.max(fmt.w, fmt.h) * 0.026; // colour band width
  const W = span * 1.12; // silver body width
  const a = 0.72; // slow-middle amount
  const u = 2 * clamp01(p) - 1;
  const x = 0.5 + 0.5 * (a * u * u * u + (1 - a) * u); // 0 → 1
  // silver outer edge: starts with every band collapsed at the origin, ends with every
  // ring outside the frame; at x = 0.5 the body is centred on the cover window
  const outer = -6 * band + (span + W + 12 * band) * x;
  const inner = outer - W; // silver inner edge (hole)
  for (const L of RIPPLE) {
    const Ro = outer + L.b * band;
    const Ri = inner - L.b * band;
    if (Ro <= 0 || Ri >= span) continue;
    ctx.beginPath();
    ctx.arc(ox + L.ox * span, oy + L.oy * span, Ro, 0, Math.PI * 2);
    if (Ri > 0) ctx.arc(ox, oy, Ri, 0, Math.PI * 2, true);
    ctx.fillStyle = C[L.c];
    ctx.fill('evenodd');
  }
}

export const TRANSITIONS = {
  aufgang: { label: 'Aufgang', draw: (ctx, fmt, p) => wavePass(ctx, fmt, p, PASS_FULL) },
  ecke: {
    label: 'Ecke',
    draw: (ctx, fmt, p) => waveRipple(ctx, fmt, p, fmt.id === '16x9' ? [fmt.w, fmt.h] : [fmt.w / 2, fmt.h]),
  },
  silber: { label: 'Silber', draw: (ctx, fmt, p) => wavePass(ctx, fmt, p, PASS_QUIET) },
};

/** Draw transition `kind` at progress p ∈ [0,1] (0.5 = full cover = cut point). */
export function drawTransition(ctx, fmt, kind, p) {
  if (p <= 0 || p >= 1) return;
  TRANSITIONS[kind].draw(ctx, fmt, p);
}

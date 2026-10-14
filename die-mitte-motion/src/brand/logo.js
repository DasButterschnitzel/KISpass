// The M-Signet and the wordmark — drawn from the original outlines only.
//
// Rules from the Designguide (p. 02): keep proportions, no additional effects,
// protection zone ≥ ¼ of the M height. Motion may *build* the mark, but every
// resting frame shows the untouched original.
//
// "Die Faltung" (the fold): the M is one continuous band —
//   black leg up → over the top → red down into the centre → fold (Faltenrot,
//   the back of the band) → up → over the top → gold leg down.
// The draw-on reveals the parts along hand-placed centrelines in exactly that
// order, so the logo writes itself in one gesture.

import { M_VIEWBOX, M_PARTS, WORDMARK, LOCKUP_H, LOCKUP_S } from './geometry.js';
import { svgPath, scratchCanvas } from '../core/platform.js';
import { clamp01 } from '../core/time.js';
import { E } from '../core/ease.js';

export const M_W = M_VIEWBOX[0];
export const M_H = M_VIEWBOX[1];
export const M_ASPECT = M_W / M_H;

const PART = Object.fromEntries(M_PARTS.map((p) => [p.id, p]));
const DRAW_ORDER = ['black', 'fold', 'red', 'gold']; // SVG paint order

// Centrelines in M units (1048 × 613). Width = mask stroke width.
// Each starts/ends outside the shape so the reveal enters and exits cleanly.
export const BAND = [
  { id: 'black', d: 'M118 660 L150 470 L205 190 L236 -40', width: 300 },
  { id: 'red', d: 'M318 -40 L398 210 L528 660', width: 320 },
  { id: 'fold', d: 'M646 650 C632 470 612 360 640 250 C662 160 704 70 742 -40', width: 270 },
  { id: 'gold', d: 'M806 -40 L860 250 L930 660', width: 320 },
];

// Path lengths (approximate, polyline/bezier sampled) — computed once.
function pathLength(d) {
  const nums = d.match(/-?\d*\.?\d+/g).map(Number);
  const cmds = d.match(/[MLC]/g);
  let i = 0, x = 0, y = 0, len = 0;
  for (const c of cmds) {
    if (c === 'M') { x = nums[i++]; y = nums[i++]; }
    else if (c === 'L') { const nx = nums[i++], ny = nums[i++]; len += Math.hypot(nx - x, ny - y); x = nx; y = ny; }
    else if (c === 'C') {
      const p = [x, y, nums[i], nums[i + 1], nums[i + 2], nums[i + 3], nums[i + 4], nums[i + 5]];
      i += 6;
      let px = x, py = y;
      for (let k = 1; k <= 24; k++) {
        const t = k / 24, mt = 1 - t;
        const qx = mt * mt * mt * p[0] + 3 * mt * mt * t * p[2] + 3 * mt * t * t * p[4] + t * t * t * p[6];
        const qy = mt * mt * mt * p[1] + 3 * mt * mt * t * p[3] + 3 * mt * t * t * p[5] + t * t * t * p[7];
        len += Math.hypot(qx - px, qy - py);
        px = qx; py = qy;
      }
      x = p[6]; y = p[7];
    }
  }
  return len;
}
for (const b of BAND) b.len = pathLength(b.d);
const BAND_TOTAL = BAND.reduce((s, b) => s + b.len, 0);
// Cumulative start positions along the band (with a small overlap so the
// hand-overs at the top and at the fold feel continuous).
const OVERLAP = 0.1;
{
  let s = 0;
  for (const b of BAND) {
    b.s0 = s / BAND_TOTAL;
    b.s1 = (s + b.len) / BAND_TOTAL;
    s += b.len * (1 - OVERLAP);
  }
  const end = BAND[BAND.length - 1].s1;
  for (const b of BAND) { b.s0 /= end; b.s1 /= end; }
}

/** Local draw progress of every part for a global band progress p ∈ [0,1]. */
export function bandProgress(p) {
  const out = {};
  for (const b of BAND) out[b.id] = clamp01((p - b.s0) / (b.s1 - b.s0));
  return out;
}

function paintPart(ctx, part) {
  const path = svgPath(part.d);
  ctx.fillStyle = part.fill;
  ctx.fill(path);
  // The originals carry a 0.7 unit stroke in the fill colour to close seams.
  ctx.strokeStyle = part.fill;
  ctx.lineWidth = 0.7;
  ctx.lineJoin = 'round';
  ctx.stroke(path);
}

/**
 * Draw the M with its top-left at (x, y) and height h (px).
 * opts.draw: global band progress (0..1, default 1 = complete mark)
 * opts.parts: optional explicit per-part progress { black, fold, red, gold }
 * opts.alpha: opacity (only for exits/handovers, never as a style)
 * opts.mono: draw in a single colour (e.g. silver silhouettes in transitions)
 */
export function drawM(ctx, x, y, h, opts = {}) {
  const s = h / M_H;
  const draw = opts.draw ?? 1;
  const parts = opts.parts || (draw >= 1 ? null : bandProgress(draw));
  const alpha = opts.alpha ?? 1;
  if (alpha <= 0 || h <= 0) return;
  if (parts && Object.values(parts).every((v) => v <= 0)) return;

  ctx.save();
  ctx.globalAlpha *= alpha;

  if (!parts || Object.values(parts).every((v) => v >= 1)) {
    ctx.translate(x, y);
    ctx.scale(s, s);
    for (const id of DRAW_ORDER) paintPart(ctx, opts.mono ? { ...PART[id], fill: opts.mono } : PART[id]);
    ctx.restore();
    return;
  }

  // Draw-on: render each part into a scratch layer in device space, then
  // keep only what the band mask has reached (destination-in).
  const T = ctx.getTransform();
  const W = ctx.canvas.width, H = ctx.canvas.height;
  // device-space bounding box of the M (plus margin)
  const corners = [[x, y], [x + M_W * s, y], [x, y + M_H * s], [x + M_W * s, y + M_H * s]].map(([px, py]) => [
    T.a * px + T.c * py + T.e,
    T.b * px + T.d * py + T.f,
  ]);
  const bx0 = Math.max(0, Math.floor(Math.min(...corners.map((c) => c[0])) - 4));
  const by0 = Math.max(0, Math.floor(Math.min(...corners.map((c) => c[1])) - 4));
  const bx1 = Math.min(W, Math.ceil(Math.max(...corners.map((c) => c[0])) + 4));
  const by1 = Math.min(H, Math.ceil(Math.max(...corners.map((c) => c[1])) + 4));
  const bw = bx1 - bx0, bh = by1 - by0;
  if (bw <= 0 || bh <= 0) { ctx.restore(); return; }

  const layer = scratchCanvas('m-draw', bw, bh);
  const lc = layer.getContext('2d');
  for (const id of DRAW_ORDER) {
    const q = parts[id] ?? 0;
    if (q <= 0) continue;
    const part = opts.mono ? { ...PART[id], fill: opts.mono } : PART[id];
    lc.setTransform(1, 0, 0, 1, 0, 0);
    lc.globalCompositeOperation = 'source-over';
    lc.globalAlpha = 1;
    lc.clearRect(0, 0, bw, bh);
    lc.setTransform(T.a, T.b, T.c, T.d, T.e - bx0, T.f - by0);
    lc.translate(x, y);
    lc.scale(s, s);
    paintPart(lc, part);
    if (q < 1) {
      const band = BAND.find((b) => b.id === id);
      lc.globalCompositeOperation = 'destination-in';
      lc.strokeStyle = '#000';
      lc.lineWidth = band.width;
      lc.lineCap = 'butt';
      lc.lineJoin = 'round';
      lc.setLineDash([band.len * q + 0.001, band.len * 2]);
      lc.lineDashOffset = 0;
      lc.stroke(svgPath(band.d));
      lc.setLineDash([]);
      lc.globalCompositeOperation = 'source-over';
    }
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(layer, bx0, by0);
    ctx.restore();
  }
  ctx.restore();
}

// ---------------------------------------------------------------- wordmark

function bbox(d) {
  const tok = d.match(/[MHVLCZ]|-?\d*\.?\d+/g);
  let i = 0, cmd = '', x = 0, y = 0;
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  const add = (px, py) => { x0 = Math.min(x0, px); x1 = Math.max(x1, px); y0 = Math.min(y0, py); y1 = Math.max(y1, py); };
  while (i < tok.length) {
    if (/[A-Z]/.test(tok[i])) cmd = tok[i++];
    if (cmd === 'Z') continue;
    if (cmd === 'M' || cmd === 'L') { x = +tok[i++]; y = +tok[i++]; add(x, y); }
    else if (cmd === 'H') { x = +tok[i++]; add(x, y); }
    else if (cmd === 'V') { y = +tok[i++]; add(x, y); }
    else if (cmd === 'C') { for (let k = 0; k < 3; k++) { x = +tok[i++]; y = +tok[i++]; add(x, y); } }
  }
  return { x0, y0, x1, y1 };
}

export const GLYPHS = WORDMARK.map((g) => ({ ...g, box: bbox(g.d) }));
export const WORD_X0 = Math.min(...GLYPHS.map((g) => g.x + g.box.x0)); // left ink edge (font units)
export const WORD_X1 = Math.max(...GLYPHS.map((g) => g.x + g.box.x1)); // right ink edge
export const WORD_CAP = 739; // cap height in font units (M, D, i-dot)
export const WORD_XH = 554; // x-height

/**
 * Draw the wordmark. (x, baseline) in px, `scale` = px per font unit.
 * opts.glyph(i) → { dy (px), alpha, clip } per glyph for reveals.
 * opts.reveal: 0..1 rise-from-baseline reveal (letters staggered), uses a
 * baseline mask so glyphs emerge from their own baseline.
 */
export function drawWordmark(ctx, x, baseline, scale, opts = {}) {
  const color = opts.color || '#1C1D20';
  const alpha = opts.alpha ?? 1;
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.fillStyle = color;
  const n = GLYPHS.length;
  const reveal = opts.reveal ?? 1;
  const stagger = opts.stagger ?? 0.06; // fraction of the reveal per glyph
  const capPx = WORD_CAP * scale;
  for (let i = 0; i < n; i++) {
    const g = GLYPHS[i];
    let q = 1;
    if (reveal < 1) {
      const span = 1 - stagger * (n - 1);
      q = E.arrive(clamp01((reveal - i * stagger) / span));
    }
    if (q <= 0) continue;
    ctx.save();
    if (q < 1) {
      // mask: everything above the baseline (+ small descender room)
      ctx.beginPath();
      ctx.rect(x + (g.x - 40) * scale, baseline - capPx * 1.25, (g.box.x1 - g.box.x0 + 200) * scale, capPx * 1.25 + 0.05 * capPx);
      ctx.clip();
    }
    const dy = (1 - q) * capPx * 1.08;
    ctx.translate(x + g.x * scale, baseline + dy);
    ctx.scale(scale, -scale);
    ctx.fill(svgPath(g.d));
    ctx.restore();
  }
  ctx.restore();
}

// ---------------------------------------------------------------- lockups
// Proportions are taken from Logo-horizontal.svg and Logo-gestapelt.svg and
// expressed relative to the M height (Hm).

const HM_H = M_H * LOCKUP_H.m.s;
export const LOCK_H = {
  wordDx: (LOCKUP_H.word.x - LOCKUP_H.m.x) / HM_H, // wordmark origin x from M left
  baseDy: (LOCKUP_H.word.y - LOCKUP_H.m.y) / HM_H, // baseline from M top
  wordS: LOCKUP_H.word.s / HM_H, // font units → px per px of M height
};
LOCK_H.width = LOCK_H.wordDx + WORD_X1 * LOCK_H.wordS; // in M heights (left edge of M → right ink edge)

const HM_S = M_H * LOCKUP_S.m.s;
export const LOCK_S = {
  wordDx: (LOCKUP_S.word.x - LOCKUP_S.m.x) / HM_S,
  baseDy: (LOCKUP_S.word.y - LOCKUP_S.m.y) / HM_S,
  wordS: LOCKUP_S.word.s / HM_S,
};
LOCK_S.height = LOCK_S.baseDy; // M top → wordmark baseline (in M heights)
// horizontal centre of the stacked lockup (ink) relative to the M's left edge
LOCK_S.inkX0 = LOCK_S.wordDx + WORD_X0 * LOCK_S.wordS;
LOCK_S.inkX1 = LOCK_S.wordDx + WORD_X1 * LOCK_S.wordS;

/** Horizontal lockup: M top-left at (x, y), M height hm. */
export function drawLockupH(ctx, x, y, hm, opts = {}) {
  drawM(ctx, x + (opts.mDx || 0), y + (opts.mDy || 0), hm, { draw: opts.draw, alpha: opts.mAlpha ?? opts.alpha });
  drawWordmark(ctx, x + LOCK_H.wordDx * hm, y + LOCK_H.baseDy * hm, LOCK_H.wordS * hm, {
    reveal: opts.wordReveal,
    alpha: opts.wordAlpha ?? opts.alpha,
    color: opts.color,
  });
}

/** Stacked lockup: centred on cx, M top at y, M height hm. */
export function drawLockupS(ctx, cx, y, hm, opts = {}) {
  const mw = M_ASPECT * hm;
  const x = cx - mw / 2;
  drawM(ctx, x + (opts.mDx || 0), y + (opts.mDy || 0), hm, { draw: opts.draw, alpha: opts.mAlpha ?? opts.alpha });
  drawWordmark(ctx, x + LOCK_S.wordDx * hm, y + LOCK_S.baseDy * hm, LOCK_S.wordS * hm, {
    reveal: opts.wordReveal,
    alpha: opts.wordAlpha ?? opts.alpha,
    color: opts.color,
  });
}

/** Width (px) of the horizontal lockup for M height hm. */
export const lockupHWidth = (hm) => LOCK_H.width * hm;
/** Total height (px) of the stacked lockup (M top → baseline) for M height hm. */
export const lockupSHeight = (hm) => LOCK_S.baseDy * hm;
/** Protection zone (Schutzraum) for M height hm. */
export const protectionZone = (hm) => hm / 4;

export const bandEase = E.sweep;

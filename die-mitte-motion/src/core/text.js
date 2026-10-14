// Typography — URW Gothic Demi (headlines, slogans) and Book (supporting text).
//
// Metrics (both cuts): UPM 1000, cap height 739, x-height 554/547,
// ascent 739, descent −261. Kerning via GPOS (applied by the canvas engine).
// No tabular figures in the font → counters use fixed-width digit slots.

import { clamp01 } from './time.js';
import { E } from './ease.js';

export const FAMILY = { demi: 'URW Gothic Demi', book: 'URW Gothic Book' };
export const CAP = 0.739;
export const XH = 0.554;
export const DESC = 0.261;

export function font(weight, size) {
  return `${size}px "${FAMILY[weight] || FAMILY.demi}"`;
}

const widthCache = new Map();
export function measure(ctx, text, weight, size, tracking = 0) {
  const key = `${weight}|${size}|${tracking}|${text}`;
  let w = widthCache.get(key);
  if (w == null) {
    ctx.save();
    ctx.font = font(weight, size);
    if (!tracking) w = ctx.measureText(text).width;
    else {
      w = 0;
      for (const ch of text) w += ctx.measureText(ch).width + tracking * size;
      w -= tracking * size;
    }
    ctx.restore();
    widthCache.set(key, w);
  }
  return w;
}

const lsbCache = new Map();
export function opticalShift(ctx, str) {
  const key = ctx.font + '|' + str[0];
  let v = lsbCache.get(key);
  if (v == null) {
    const m = ctx.measureText(str[0]);
    v = Number.isFinite(m.actualBoundingBoxLeft) ? Math.min(0, m.actualBoundingBoxLeft) : 0;
    lsbCache.set(key, v);
  }
  return v;
}

/** Plain text line. align: 'left' | 'center' | 'right'. y = baseline. */
export function text(ctx, str, x, y, o = {}) {
  const weight = o.weight || 'demi';
  const size = o.size || 40;
  const tracking = o.tracking || 0;
  const w = measure(ctx, str, weight, size, tracking);
  const x0 = o.align === 'center' ? x - w / 2 : o.align === 'right' ? x - w : x;
  if (globalThis.__qaNoText) return { x0, x1: x0 + w, w }; // QA: measure without type
  ctx.save();
  if (o.alpha != null) ctx.globalAlpha *= o.alpha;
  ctx.font = font(weight, size);
  ctx.fillStyle = o.color || '#1C1D20';
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  // optical margin: left-aligned display type hangs its side bearing into the margin
  const optical = o.optical ?? (o.align == null || o.align === 'left');
  const ox = optical && !tracking && size >= 48 ? opticalShift(ctx, str) : 0;
  if (!tracking) ctx.fillText(str, x0 + ox, y);
  else {
    let cx = x0;
    for (const ch of str) {
      ctx.fillText(ch, cx, y);
      cx += ctx.measureText(ch).width + tracking * size;
    }
  }
  ctx.restore();
  return { x0, x1: x0 + w, w };
}

/**
 * Masked line reveal — the house text move.
 * The line rises out of its own baseline mask (no fades, no blur).
 * q: 0..1 (already eased or raw; raw is eased with `ease`).
 * o.exit: 0..1 — line leaves upwards through the top of the same mask.
 */
function fontCtx(ctx, weight, size) {
  ctx.font = font(weight, size);
  return ctx;
}

export function revealLine(ctx, str, x, y, q, o = {}) {
  const size = o.size || 40;
  const ease = o.ease || E.arrive;
  const e = o.raw ? ease(clamp01(q)) : clamp01(q);
  const ex = o.exit ? (o.exitEase || E.leave)(clamp01(o.exit)) : 0;
  if (e <= 0 || ex >= 1) return null;
  const weight = o.weight || 'demi';
  const tracking = o.tracking || 0;
  const w = measure(ctx, str, weight, size, tracking);
  const x0 = o.align === 'center' ? x - w / 2 : o.align === 'right' ? x - w : x;
  const top = y - size * (o.maskTop ?? 1.0);
  const bottom = y + size * (o.maskBottom ?? 0.3);
  const travel = (bottom - top) * (o.travel ?? 1);
  ctx.save();
  ctx.beginPath();
  ctx.rect(x0 - size, top, w + size * 2, bottom - top);
  ctx.clip();
  // "Der Punkt": a closing full stop may land a beat after its line (o.qPunct)
  const punct = o.qPunct != null && /[.!?]$/.test(str);
  const body = punct ? str.slice(0, -1) : str;
  const dy = (1 - e) * travel - ex * travel;
  const optical = o.align == null || o.align === 'left';
  const ox = optical && size >= 48 && !tracking ? opticalShift(fontCtx(ctx, weight, size), str) : 0;
  text(ctx, body, x0, y + dy, { ...o, align: 'left', optical });
  if (punct) {
    const ep = clamp01(o.qPunct);
    const px = x0 + ox + w - measure(ctx, str.slice(-1), weight, size, tracking);
    const dyp = (1 - ep) * travel - ex * travel;
    if (ep > 0) text(ctx, str.slice(-1), px, y + dyp, { ...o, align: 'left', optical: false });
  }
  ctx.restore();
  return { x0, x1: x0 + w, w };
}

/**
 * Horizontal wipe reveal (for "weiter": text arrives from the left and, on
 * exit, keeps moving forward to the right). q / o.exit are eased progress.
 */
export function wipeLine(ctx, str, x, y, q, o = {}) {
  const size = o.size || 40;
  const e = clamp01(q);
  const ex = clamp01(o.exit || 0);
  if (e <= 0 || ex >= 1) return null;
  const weight = o.weight || 'demi';
  const w = measure(ctx, str, weight, size, o.tracking || 0);
  const x0 = o.align === 'center' ? x - w / 2 : o.align === 'right' ? x - w : x;
  const slide = o.slide ?? size * 0.6;
  const L = x0 - size * 0.2, Wd = w + size * 0.4;
  ctx.save();
  ctx.beginPath();
  ctx.rect(L + Wd * ex, y - size * 1.05, Wd * (e - ex), size * 1.4);
  ctx.clip();
  const dx = (1 - e) * -slide + ex * slide;
  text(ctx, str, x0 + dx, y, { ...o, align: 'left', optical: o.align == null || o.align === 'left' });
  ctx.restore();
  return { x0, x1: x0 + w, w };
}

/** Greedy word wrap. */
export function wrap(ctx, str, maxW, weight, size) {
  const words = str.split(/\s+/);
  const lines = [];
  let cur = '';
  for (const wd of words) {
    const test = cur ? cur + ' ' + wd : wd;
    if (measure(ctx, test, weight, size) <= maxW || !cur) cur = test;
    else {
      lines.push(cur);
      cur = wd;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

/** Largest font size (≤ size) at which `str` fits into maxW. */
export function fit(ctx, str, weight, size, maxW, tracking = 0) {
  const w = measure(ctx, str, weight, size, tracking);
  return w <= maxW ? size : Math.floor((size * maxW) / w);
}

/**
 * Number with fixed-width digit slots (no tabular figures in URW Gothic).
 * Prevents jitter while counting. Returns drawn width.
 */
export function figures(ctx, str, x, y, o = {}) {
  const weight = o.weight || 'demi';
  const size = o.size || 100;
  const slot = Math.max(...'0123456789'.split('').map((d) => measure(ctx, d, weight, size)));
  let w = 0;
  for (const ch of str) w += /\d/.test(ch) ? slot : measure(ctx, ch, weight, size);
  let cx = o.align === 'center' ? x - w / 2 : o.align === 'right' ? x - w : x;
  if (globalThis.__qaNoText) return w;
  ctx.save();
  ctx.font = font(weight, size);
  ctx.fillStyle = o.color || '#1C1D20';
  if (o.alpha != null) ctx.globalAlpha *= o.alpha;
  for (const ch of str) {
    const cw = /\d/.test(ch) ? slot : measure(ctx, ch, weight, size);
    const gw = measure(ctx, ch, weight, size);
    ctx.fillText(ch, cx + (cw - gw) / 2, y);
    cx += cw;
  }
  ctx.restore();
  return w;
}

/**
 * Number that rises out of its mask while each digit rolls up from 0 to its
 * value (odometer). q = rise progress (eased), r = roll progress (eased).
 */
export function rollNumber(ctx, str, x, y, q, r, o = {}) {
  const size = o.size || 100;
  const weight = o.weight || 'demi';
  const e = clamp01(q);
  const ex = o.exit ? (o.exitEase || E.leave)(clamp01(o.exit)) : 0;
  if (e <= 0 || ex >= 1) return null;
  const slot = Math.max(...'0123456789'.split('').map((d) => measure(ctx, d, weight, size)));
  let w = 0;
  for (const ch of str) w += /\d/.test(ch) ? slot : measure(ctx, ch, weight, size);
  let cx = o.align === 'center' ? x - w / 2 : o.align === 'right' ? x - w : x;
  const top = y - size * CAP - size * 0.03, bottom = y + size * 0.03, travel = (bottom - top) * 1.08;
  const step = size * 1.05;
  ctx.save();
  ctx.beginPath();
  ctx.rect(cx - size, top, w + size * 2, bottom - top);
  ctx.clip();
  const dy = (1 - e) * travel - ex * travel;
  for (const ch of str) {
    const cw = /\d/.test(ch) ? slot : measure(ctx, ch, weight, size);
    if (/\d/.test(ch)) {
      const n = +ch;
      const off = n * clamp01(r) * step; // scroll the 0..n column upwards
      for (let k = 0; k <= n; k++) {
        const gy = y + dy + k * step - off;
        if (gy < top - step || gy > bottom + step) continue;
        const gw = measure(ctx, String(k), weight, size);
        text(ctx, String(k), cx + (cw - gw) / 2, gy, { ...o, align: 'left' });
      }
    } else text(ctx, ch, cx, y + dy, { ...o, align: 'left' });
    cx += cw;
  }
  ctx.restore();
  return { w };
}

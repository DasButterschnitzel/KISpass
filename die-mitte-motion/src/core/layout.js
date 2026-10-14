// Text blocks: layout + staggered masked reveals/exits in one call.

import { E } from './ease.js';
import { prog, clamp01 } from './time.js';
import { CAP, measure, revealLine, text } from './text.js';

/**
 * Lay out lines top-down. Each line: { text, weight, size, color, lead }
 * lead = distance from the previous baseline (default size × 1.08 for the same
 * size; for a smaller line after a bigger one pass it explicitly).
 * Returns lines with absolute baselines + block metrics.
 */
export function layoutBlock(ctx, lines, top) {
  let y = null;
  const out = [];
  let maxW = 0;
  for (const l of lines) {
    const size = l.size;
    if (y == null) y = top + size * CAP;
    else y += l.lead ?? size * 1.08;
    const w = measure(ctx, l.text, l.weight || 'demi', size, l.tracking || 0);
    maxW = Math.max(maxW, w);
    out.push({ ...l, y, w });
  }
  const last = out[out.length - 1];
  return { lines: out, top, bottom: last.y, height: last.y - top, width: maxW };
}

/** Height of a block from cap top of the first line to the last baseline. */
export function blockHeight(ctx, lines) {
  return layoutBlock(ctx, lines, 0).height;
}

/**
 * Draw a laid-out block with staggered reveal and exit.
 *  o.x, o.align
 *  o.enter = { start, stagger, dur }  (per line; line.delay adds extra)
 *  o.exit  = { start, stagger, dur }
 *  o.punct = delay (s) of a closing full stop after its line — "Der Punkt"
 */
export function drawBlock(ctx, t, block, o = {}) {
  const en = o.enter || { start: 0, stagger: 0.08, dur: 0.72 };
  const ex = o.exit;
  block.lines.forEach((l, i) => {
    const s = en.start + i * (en.stagger ?? 0.08) + (l.delay || 0);
    const q = prog(t, s, en.dur ?? 0.72, en.ease || E.arrive);
    const e = ex ? clamp01((t - (ex.start + i * (ex.stagger ?? 0.05))) / (ex.dur ?? 0.48)) : 0;
    if (q <= 0) return;
    const qPunct = o.punct != null ? prog(t, s + o.punct, (en.dur ?? 0.72) * 0.7, en.ease || E.arrive) : undefined;
    if (o.static) text(ctx, l.text, o.x, l.y, { ...l, align: o.align });
    else revealLine(ctx, l.text, o.x, l.y, q, { ...l, align: o.align, exit: e, qPunct });
  });
}

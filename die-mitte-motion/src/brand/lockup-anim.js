// Animated lockups — the logo reveal choreography shared by several pieces.
//
//  1. Die Faltung: the M writes itself as one band, centred.
//  2. Platz machen: the M glides to its lockup position (E.glide).
//  3. The wordmark rises letter by letter out of its baseline (E.arrive).
// Rest state = exact lockup from Logo-horizontal.svg / Logo-gestapelt.svg.

import { E } from '../core/ease.js';
import { prog, clamp01, lerp } from '../core/time.js';
import { drawM, drawWordmark, LOCK_H, LOCK_S, M_ASPECT, lockupHWidth } from './logo.js';

/**
 * Horizontal lockup reveal.
 *  geo: { x, y, hm }  final M top-left + M height
 *  tm:  { draw: [start, dur], move: [start, dur], word: [start, dur] }
 *  o.center: x the M is centred on while drawing (default: lockup centre)
 *  o.exit: 0..1 exit progress (lockup leaves upwards through a mask)
 */
export function lockupHReveal(ctx, t, geo, tm, o = {}) {
  const { x, y, hm } = geo;
  const mw = M_ASPECT * hm;
  const W = lockupHWidth(hm);
  const cx = o.center ?? x + W / 2;
  const drawP = tm.draw ? prog(t, tm.draw[0], tm.draw[1], o.drawEase || E.glide) : 1;
  const moveP = tm.move ? prog(t, tm.move[0], tm.move[1], E.glide) : 1;
  const wordP = tm.word ? clamp01((t - tm.word[0]) / tm.word[1]) : 1;
  // while drawing, the M may be larger (o.drawH) and centred; it settles into the lockup
  const h0 = o.drawH ?? hm;
  const h = lerp(h0, hm, moveP);
  const mx = lerp(cx - (M_ASPECT * h0) / 2, x, moveP);
  const my = lerp(y + hm / 2 - h0 / 2, y, moveP);
  const exit = o.exit ?? 0;
  const ex = E.leave(clamp01(exit));
  ctx.save();
  if (ex > 0) {
    // leave upwards through a mask at the lockup's top
    ctx.beginPath();
    ctx.rect(x - hm, y - hm * 0.3, W + hm * 2, hm * 1.6);
    ctx.clip();
    ctx.translate(0, -ex * hm * 1.4);
  }
  if (wordP > 0) {
    ctx.save();
    if (moveP < 1) {
      // letters emerge from behind the M's trailing edge while it glides away
      ctx.beginPath();
      ctx.rect(mx + M_ASPECT * h + hm * 0.04, y - hm, W + hm * 4, hm * 3);
      ctx.clip();
    }
    drawWordmark(ctx, x + LOCK_H.wordDx * hm, y + LOCK_H.baseDy * hm, LOCK_H.wordS * hm, {
      reveal: wordP,
      stagger: o.stagger ?? 0.055,
      color: o.color,
    });
    ctx.restore();
  }
  drawM(ctx, mx, my, h, { draw: drawP });
  ctx.restore();
}

/**
 * Stacked lockup reveal.
 *  geo: { cx, y, hm }  centre x, final M top, M height
 *  o.drawY: M top while drawing (default: vertically centred on the lockup)
 */
export function lockupSReveal(ctx, t, geo, tm, o = {}) {
  const { cx, y, hm } = geo;
  const mw = M_ASPECT * hm;
  const H = LOCK_S.baseDy * hm;
  const drawY = o.drawY ?? y + H / 2 - (o.drawH ?? hm) / 2;
  const drawP = tm.draw ? prog(t, tm.draw[0], tm.draw[1], o.drawEase || E.glide) : 1;
  const moveP = tm.move ? prog(t, tm.move[0], tm.move[1], E.glide) : 1;
  const wordP = tm.word ? clamp01((t - tm.word[0]) / tm.word[1]) : 1;
  const h0 = o.drawH ?? hm;
  const h = lerp(h0, hm, moveP);
  const my = lerp(drawY ?? y, y, moveP);
  const mx = cx - (M_ASPECT * h) / 2;
  const exit = o.exit ?? 0;
  const ex = E.leave(clamp01(exit));
  ctx.save();
  if (ex > 0) {
    ctx.beginPath();
    ctx.rect(cx - mw * 2, y - hm * 0.3, mw * 4, H + hm * 0.6);
    ctx.clip();
    ctx.translate(0, -ex * (H + hm * 0.5));
  }
  if (wordP > 0) {
    drawWordmark(ctx, cx - mw / 2 + LOCK_S.wordDx * hm, y + LOCK_S.baseDy * hm, LOCK_S.wordS * hm, {
      reveal: wordP,
      stagger: o.stagger ?? 0.055,
      color: o.color,
    });
  }
  drawM(ctx, mx, my, h, { draw: drawP });
  ctx.restore();
}

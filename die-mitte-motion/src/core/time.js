// Timing helpers.
//
// Rhythm: one "Takt" (beat) = 0.48 s = 12 frames @ 25 fps (125 BPM).
// Durations are multiples or halves of the beat; staggers are 2–3 frames.

import { E } from './ease.js';

export const FPS = 25;
export const BEAT = 0.48;
export const FRAME = 1 / FPS;

export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
export const lerp = (a, b, u) => a + (b - a) * u;
export const invLerp = (a, b, v) => clamp01((v - a) / (b - a));
export const smooth = (u) => u * u * (3 - 2 * u);

/** Eased progress of a segment that starts at `start` and lasts `dur` seconds. */
export function prog(t, start, dur, ease = E.arrive) {
  if (dur <= 0) return t >= start ? 1 : 0;
  return ease(clamp01((t - start) / dur));
}

/**
 * In/out envelope: 0 → 1 (enter) … hold … 1 → 0 (exit).
 * Returns { in, out, v } where v = in * (1 - out).
 */
export function inOut(t, tIn, dIn, tOut, dOut, easeIn = E.arrive, easeOut = E.leave) {
  const a = prog(t, tIn, dIn, easeIn);
  const b = tOut == null ? 0 : prog(t, tOut, dOut, easeOut);
  return { in: a, out: b, v: a * (1 - b) };
}

/** Staggered start time for item i. */
export const stag = (start, i, step) => start + i * step;

/** Seconds ↔ beats. */
export const beats = (n) => n * BEAT;

/** Periodic helper for seamless loops: phase in [0,1) for period T. */
export const phase = (t, T, offset = 0) => (((t / T + offset) % 1) + 1) % 1;
export const osc = (t, T, offset = 0) => Math.sin(phase(t, T, offset) * Math.PI * 2);

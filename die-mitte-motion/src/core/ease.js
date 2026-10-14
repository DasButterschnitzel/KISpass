// Easing — the "Mitte" curves.
//
// The whole system moves with four curves only. Fewer curves = a recognisable
// rhythm. No bounce, no overshoot, no elastic: the party speaks calmly.
//
//   arrive  (Ankommen)  confident start, long soft landing  — everything that enters
//   leave   (Gehen)     quiet start, decisive exit           — everything that leaves
//   sweep   (Schwung)   strong in/out, the arc's momentum    — arcs, wipes, the band
//   glide   (Gleiten)   balanced in/out                      — camera, position shifts

export function cubicBezier(x1, y1, x2, y2) {
  // Unit bezier solver (same approach as WebKit's UnitBezier).
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sampleX = (t) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t) => ((ay * t + by) * t + cy) * t;
  const slopeX = (t) => (3 * ax * t + 2 * bx) * t + cx;
  function solveX(x) {
    let t = x;
    for (let i = 0; i < 8; i++) {
      const err = sampleX(t) - x;
      if (Math.abs(err) < 1e-7) return t;
      const d = slopeX(t);
      if (Math.abs(d) < 1e-7) break;
      t -= err / d;
    }
    let lo = 0, hi = 1;
    t = x;
    while (lo < hi) {
      const v = sampleX(t);
      if (Math.abs(v - x) < 1e-7) return t;
      if (x > v) lo = t; else hi = t;
      t = (lo + hi) / 2;
      if (hi - lo < 1e-7) break;
    }
    return t;
  }
  const fn = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : sampleY(solveX(x)));
  fn.css = `cubic-bezier(${x1}, ${y1}, ${x2}, ${y2})`;
  return fn;
}

const linear = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x);
linear.css = 'linear';

export const E = {
  arrive: cubicBezier(0.16, 1, 0.3, 1),
  leave: cubicBezier(0.7, 0, 0.84, 0),
  sweep: cubicBezier(0.83, 0, 0.17, 1),
  glide: cubicBezier(0.65, 0, 0.35, 1),
  linear,
};

export const EASE_DOCS = [
  { key: 'arrive', de: 'Ankommen', use: 'Everything that enters: type, logo, panels, arcs settling.' },
  { key: 'leave', de: 'Gehen', use: 'Everything that exits. Shorter than the entrance (≈ 2/3).' },
  { key: 'sweep', de: 'Schwung', use: 'Arc motion, the band, transitions — the signature momentum.' },
  { key: 'glide', de: 'Gleiten', use: 'Camera moves and re-layouts (logo making room for the wordmark).' },
];

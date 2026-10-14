// Platform bridge: the same composition code runs in the browser (live showcase)
// and in Node (@napi-rs/canvas, Skia) for frame-accurate offline rendering.

let canvasFactory = (w, h) => {
  if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(w, h);
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
};
let Path2DImpl = typeof Path2D !== 'undefined' ? Path2D : null;

export function configurePlatform({ createCanvas, Path2D: P }) {
  if (createCanvas) canvasFactory = createCanvas;
  if (P) Path2DImpl = P;
}

export const createCanvas = (w, h) => canvasFactory(Math.max(1, Math.ceil(w)), Math.max(1, Math.ceil(h)));

const pathCache = new Map();
/** Cached Path2D from SVG path data. */
export function svgPath(d) {
  let p = pathCache.get(d);
  if (!p) {
    p = new Path2DImpl(d);
    pathCache.set(d, p);
  }
  return p;
}
export const newPath = () => new Path2DImpl();

// Scratch canvases (re-used per size) for layered effects such as the M draw-on.
const scratch = new Map();
export function scratchCanvas(key, w, h) {
  let c = scratch.get(key);
  if (!c || c.width !== w || c.height !== h) {
    c = createCanvas(w, h);
    scratch.set(key, c);
  }
  return c;
}

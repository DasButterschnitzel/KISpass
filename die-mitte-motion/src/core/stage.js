// Stage helpers: background, camera and layering.

import { C } from '../brand/palette.js';

/** Silver stage. o.transparent → nothing (alpha deliverables). */
export function background(ctx, fmt, o = {}) {
  // device space: works for any player scale (thumbnails, hi-DPI, render)
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (o.transparent) {
    if (!ctx.__keepBackdrop) ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  } else {
    ctx.fillStyle = o.color || C.silver;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }
  ctx.restore();
}

/**
 * Camera with parallax. z = zoom (1 = rest), (fx, fy) = focus point that stays
 * put, (px, py) = pan in px. depth: 1 = moves fully with the camera, 0 = static.
 */
export function camera(ctx, cam, depth = 1) {
  if (!cam) return;
  const z = 1 + ((cam.z ?? 1) - 1) * depth;
  const px = (cam.px || 0) * depth, py = (cam.py || 0) * depth;
  const fx = cam.fx ?? 0, fy = cam.fy ?? 0;
  ctx.translate(fx + px, fy + py);
  if (cam.rot) ctx.rotate(cam.rot * depth);
  ctx.scale(z, z);
  ctx.translate(-fx, -fy);
}

export function withCamera(ctx, cam, depth, fn) {
  ctx.save();
  camera(ctx, cam, depth);
  fn();
  ctx.restore();
}

/** Rectangular clip helper. */
export function clipRect(ctx, x, y, w, h) {
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
}

#!/usr/bin/env node
// Offline renderer: Skia (@napi-rs/canvas) → raw RGBA → ffmpeg.
//
//   node tools/render.mjs                         # everything, all formats
//   node tools/render.mjs --comp logo-reveal --format 16x9
//   node tools/render.mjs --mode stills           # key frames as PNG
//   node tools/render.mjs --mode sheet --out /tmp/review
//   node tools/render.mjs --copy my-texts.json    # override on-screen texts
//
// Motion blur: every frame is the average of N sub-frames inside a 180° shutter
// (centred on the frame time). Frames without motion are detected and rendered
// once. Alpha pieces are written as PNG-in-MOV (lossless, NLE-ready) + WebM.

import { createCanvas, Path2D, GlobalFonts } from '@napi-rs/canvas';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { configurePlatform } from '../src/core/platform.js';
import { FORMATS, FORMAT_IDS } from '../src/formats.js';
import { COMPS, durationOf } from '../src/comps/index.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
GlobalFonts.registerFromPath(path.join(ROOT, 'assets/fonts/URWGothic-Demi.otf'), 'URW Gothic Demi');
GlobalFonts.registerFromPath(path.join(ROOT, 'assets/fonts/URWGothic-Book.otf'), 'URW Gothic Book');
configurePlatform({ createCanvas, Path2D });

// ------------------------------------------------------------------ args
const argv = process.argv.slice(2);
const opt = (name, def) => {
  const i = argv.indexOf('--' + name);
  return i >= 0 ? argv[i + 1] : def;
};
const flag = (name) => argv.includes('--' + name);
const MODE = opt('mode', flag('stills') ? 'stills' : 'video');
const FPS = +opt('fps', 25);
const SAMPLES = +opt('samples', MODE === 'sheet' ? 1 : 24);
const SHUTTER = +opt('shutter', 180);
const CRF = +opt('crf', 12);
const OUT = path.resolve(opt('out', path.join(ROOT, 'exports')));
const JOBS = +opt('jobs', 1);
const compSel = (opt('comp', 'all') || 'all').split(',');
const fmtSel = (opt('format', 'all') || 'all').split(',');
const COPY = opt('copy') ? JSON.parse(fs.readFileSync(opt('copy'), 'utf8')) : {};

const comps = compSel.includes('all') ? COMPS : COMPS.filter((c) => compSel.includes(c.id) || compSel.includes(c.no));
const fmts = fmtSel.includes('all') ? FORMAT_IDS : fmtSel;
const jobs = [];
for (const c of comps) for (const f of fmts) if (!c.formats || c.formats.includes(f)) jobs.push([c, FORMATS[f]]);
if (!jobs.length) {
  console.error('nothing to render', { compSel, fmtSel });
  process.exit(1);
}

// ------------------------------------------------------------------ parallel pool
if (JOBS > 1 && jobs.length > 1 && MODE !== 'board') {
  const passthrough = [];
  for (let i = 0; i < argv.length; i++) {
    if (['--comp', '--format', '--jobs'].includes(argv[i])) { i++; continue; }
    passthrough.push(argv[i]);
  }
  const queue = jobs.map(([c, f]) => [c.id, f.id]);
  let active = 0, failed = 0;
  await new Promise((resolve) => {
    const next = () => {
      if (!queue.length && !active) return resolve();
      while (active < JOBS && queue.length) {
        const [cid, fid] = queue.shift();
        active++;
        const p = spawn(process.execPath, [fileURLToPath(import.meta.url), '--comp', cid, '--format', fid, ...passthrough], { stdio: 'inherit' });
        p.on('exit', (code) => { if (code) failed++; active--; next(); });
      }
    };
    next();
  });
  process.exit(failed ? 1 : 0);
}

// ------------------------------------------------------------------ frame engine
const fileBase = (comp, fmt) => `DM-${comp.no}_${(comp.file || comp.title).replace(/[^\wÄÖÜäöüß-]+/g, '-')}_${fmt.id}`;

function makeRenderer(comp, fmt) {
  const W = fmt.w, H = fmt.h;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');
  const dur = durationOf(comp, fmt);
  const copy = { ...(comp.copy || {}), ...(COPY[comp.id] || {}) };
  const accA = new Uint32Array(W * H), accB = new Uint32Array(W * H);
  const out = Buffer.alloc(W * H * 4);
  const out32 = new Uint32Array(out.buffer, out.byteOffset, W * H);

  function renderAt(t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, W, H);
    comp.draw(ctx, t, fmt, copy);
    return canvas.data(); // premultiplied RGBA, zero-copy view
  }
  const wrapT = (t) => (comp.loop ? ((t % dur) + dur) % dur : Math.min(Math.max(t, 0), dur - 1e-6));
  // Dirty rectangle between two premultiplied RGBA buffers (rows/cols that differ).
  function dirtyRect(a, b) {
    const rowBytes = W * 4;
    let y0 = -1, y1 = -1;
    for (let y = 0; y < H; y++) {
      if (a.compare(b, y * rowBytes, (y + 1) * rowBytes, y * rowBytes, (y + 1) * rowBytes) !== 0) {
        if (y0 < 0) y0 = y;
        y1 = y;
      }
    }
    if (y0 < 0) return null;
    const ua = new Uint32Array(a.buffer, a.byteOffset, W * H), ub = new Uint32Array(b.buffer, b.byteOffset, W * H);
    let x0 = W, x1 = -1;
    for (let y = y0; y <= y1; y++) {
      const o = y * W;
      for (let x = 0; x < x0; x++) if (ua[o + x] !== ub[o + x]) { x0 = x; break; }
      for (let x = W - 1; x > x1; x--) if (ua[o + x] !== ub[o + x]) { x1 = x; break; }
    }
    return { x0, y0, x1, y1 };
  }
  function add(buf, r) {
    const u = new Uint32Array(buf.buffer, buf.byteOffset, W * H);
    for (let y = r.y0; y <= r.y1; y++) {
      const e = y * W + r.x1;
      for (let i = y * W + r.x0; i <= e; i++) {
        const v = u[i];
        accA[i] += v & 0x00ff00ff;
        accB[i] += (v >>> 8) & 0x00ff00ff;
      }
    }
  }
  function frame(t, samples = SAMPLES) {
    if (samples <= 1) return Buffer.from(renderAt(wrapT(t)));
    const exp = SHUTTER / 360 / FPS;
    const ts = Array.from({ length: samples }, (_, k) => wrapT(t - exp / 2 + ((k + 0.5) * exp) / samples));
    const first = Buffer.from(renderAt(ts[0]));
    const last = renderAt(ts[samples - 1]);
    const r0 = dirtyRect(first, last);
    if (!r0) return first; // no motion inside the shutter
    // pad the rectangle: intermediate samples can reach slightly beyond it
    const pad = 8;
    const r = { x0: Math.max(0, r0.x0 - pad), y0: Math.max(0, r0.y0 - pad), x1: Math.min(W - 1, r0.x1 + pad), y1: Math.min(H - 1, r0.y1 + pad) };
    for (let y = r.y0; y <= r.y1; y++) { accA.fill(0, y * W + r.x0, y * W + r.x1 + 1); accB.fill(0, y * W + r.x0, y * W + r.x1 + 1); }
    add(first, r);
    add(last, r);
    for (let k = 1; k < samples - 1; k++) add(renderAt(ts[k]), r);
    first.copy(out);
    const inv = Math.round(65536 / samples);
    for (let y = r.y0; y <= r.y1; y++) {
      const e = y * W + r.x1;
      for (let i = y * W + r.x0; i <= e; i++) {
        const a = accA[i], b = accB[i];
        const c0 = ((a & 0xffff) * inv + 32768) >>> 16;
        const c2 = ((a >>> 16) * inv + 32768) >>> 16;
        const c1 = ((b & 0xffff) * inv + 32768) >>> 16;
        const c3 = ((b >>> 16) * inv + 32768) >>> 16;
        out32[i] = (c0 | (c1 << 8) | (c2 << 16) | (c3 << 24)) >>> 0;
      }
    }
    return Buffer.from(out);
  }
  return { W, H, dur, canvas, ctx, frame, copy };
}

function unpremultiply(buf) {
  for (let i = 0; i < buf.length; i += 4) {
    const a = buf[i + 3];
    if (a === 0) { buf[i] = buf[i + 1] = buf[i + 2] = 0; }
    else if (a < 255) {
      const k = 255 / a;
      buf[i] = Math.min(255, Math.round(buf[i] * k));
      buf[i + 1] = Math.min(255, Math.round(buf[i + 1] * k));
      buf[i + 2] = Math.min(255, Math.round(buf[i + 2] * k));
    }
  }
  return buf;
}

function toPNG(r, buf, alpha) {
  const id = r.ctx.createImageData(r.W, r.H);
  id.data.set(alpha ? unpremultiply(Buffer.from(buf)) : buf);
  const c = createCanvas(r.W, r.H);
  c.getContext('2d').putImageData(id, 0, 0);
  return c;
}

function ffmpeg(args) {
  const p = spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((res, rej) => p.on('exit', (code) => (code ? rej(new Error('ffmpeg ' + code)) : res())));
  return { p, done };
}
const write = (stream, buf) => new Promise((res) => (stream.write(buf) ? res() : stream.once('drain', res)));

async function renderVideo(comp, fmt) {
  const r = makeRenderer(comp, fmt);
  const n = Math.round(r.dur * FPS);
  const alpha = !!comp.alpha;
  const dir = path.join(OUT, 'video', alpha ? 'alpha' : fmt.id);
  fs.mkdirSync(dir, { recursive: true });
  const base = path.join(dir, fileBase(comp, fmt));
  const input = ['-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${r.W}x${r.H}`, '-r', String(FPS), '-i', '-'];
  const meta = ['-metadata', `title=Die Mitte — ${comp.title}${comp.name ? ' „' + comp.name + '“' : ''} (${fmt.label})`, '-metadata', 'comment=Fiktive Partei · Filmrequisite'];
  const encs = [];
  if (!alpha) {
    encs.push(ffmpeg([...input, '-vf', 'scale=out_color_matrix=bt709:out_range=tv:flags=spline+accurate_rnd+full_chroma_int,format=yuv420p',
      '-c:v', 'libx264', '-preset', 'slow', '-tune', 'animation', '-crf', String(CRF), '-profile:v', 'high',
      '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv',
      '-movflags', '+faststart', ...meta, base + '.mp4']));
  } else {
    encs.push(ffmpeg([...input, '-c:v', 'png', '-pix_fmt', 'rgba', ...meta, base + '.mov']));
    encs.push(ffmpeg([...input, '-c:v', 'libvpx-vp9', '-pix_fmt', 'yuva420p', '-crf', '18', '-b:v', '0', '-row-mt', '1', '-auto-alt-ref', '0', ...meta, base + '.webm']));
  }
  const t0 = Date.now();
  for (let f = 0; f < n; f++) {
    let buf = r.frame(f / FPS);
    if (alpha) buf = unpremultiply(buf);
    for (const e of encs) await write(e.p.stdin, buf);
  }
  for (const e of encs) e.p.stdin.end();
  await Promise.all(encs.map((e) => e.done));
  console.log(`✓ ${fileBase(comp, fmt)}  ${n} frames  ${((Date.now() - t0) / 1000).toFixed(1)} s`);
}

async function renderStills(comp, fmt) {
  const r = makeRenderer(comp, fmt);
  const dir = path.join(OUT, 'stills', fmt.id);
  fs.mkdirSync(dir, { recursive: true });
  const times = opt('t') ? opt('t').split(',').map(Number) : comp.stills || [r.dur - 0.5];
  for (const t of times) {
    const buf = r.frame(t);
    const c = toPNG(r, buf, comp.alpha);
    const file = path.join(dir, `${fileBase(comp, fmt)}_t${t.toFixed(2)}.png`);
    fs.writeFileSync(file, c.toBuffer('image/png'));
  }
  console.log(`✓ stills ${fileBase(comp, fmt)} (${times.length})`);
}

async function renderSheet(comp, fmt) {
  const r = makeRenderer(comp, fmt);
  const cols = +opt('cols', fmt.id === '9x16' ? 10 : 8);
  const rows = +opt('rows', 3);
  const n = cols * rows;
  const tw = +opt('tw', fmt.id === '9x16' ? 200 : 300);
  const th = Math.round((tw * r.H) / r.W);
  const from = +opt('from', 0), to = +opt('to', r.dur);
  const sheet = createCanvas(cols * (tw + 8) + 8, rows * (th + 30) + 8);
  const sx = sheet.getContext('2d');
  sx.fillStyle = '#6b6f73';
  sx.fillRect(0, 0, sheet.width, sheet.height);
  for (let k = 0; k < n; k++) {
    const t = from + ((to - from) * k) / (n - 1);
    const buf = r.frame(Math.min(t, r.dur - 1e-3));
    const c = toPNG(r, buf, comp.alpha);
    const x = 8 + (k % cols) * (tw + 8), y = 8 + Math.floor(k / cols) * (th + 30);
    if (comp.alpha) { sx.fillStyle = '#4a4e52'; sx.fillRect(x, y, tw, th); }
    sx.drawImage(c, x, y, tw, th);
    sx.fillStyle = '#fff';
    sx.font = '15px sans-serif';
    sx.fillText(`${t.toFixed(2)}s  f${Math.round(t * FPS)}`, x + 2, y + th + 18);
  }
  fs.mkdirSync(OUT, { recursive: true });
  const file = path.join(OUT, `sheet_${fileBase(comp, fmt)}.png`);
  fs.writeFileSync(file, sheet.toBuffer('image/png'));
  console.log('✓ sheet', file);
}

// Contact sheet: key frames of one composition in every format on one board.
async function renderBoard(comp) {
  const H = 320, pad = 16, label = 34;
  const rows = [];
  for (const fid of FORMAT_IDS) {
    if (comp.formats && !comp.formats.includes(fid)) continue;
    const fmt = FORMATS[fid];
    const r = makeRenderer(comp, fmt);
    const times = comp.stills || [r.dur - 0.5];
    const tiles = times.map((t) => ({ t, c: toPNG(r, r.frame(t), comp.alpha), w: Math.round((H * fmt.w) / fmt.h) }));
    rows.push({ fmt, tiles, width: tiles.reduce((s, x) => s + x.w + pad, pad) });
  }
  const W = Math.max(...rows.map((r) => r.width));
  const board = createCanvas(W, 96 + rows.length * (H + label + pad) + pad);
  const b = board.getContext('2d');
  b.fillStyle = '#EEF0F1';
  b.fillRect(0, 0, board.width, board.height);
  b.fillStyle = '#1C1D20';
  b.font = '40px "URW Gothic Demi"';
  b.fillText(`${comp.no}  ${comp.title}${comp.name ? ' — ' + comp.name : ''}`, pad + 8, 62);
  let y = 96;
  for (const row of rows) {
    let x = pad;
    for (const tile of row.tiles) {
      if (comp.alpha) { b.fillStyle = '#3d4146'; b.fillRect(x, y, tile.w, H); }
      b.drawImage(tile.c, x, y, tile.w, H);
      b.fillStyle = '#55595f';
      b.font = '20px "URW Gothic Book"';
      b.fillText(`${row.fmt.label}  ·  ${tile.t.toFixed(2).replace('.', ',')} s`, x + 2, y + H + 26);
      x += tile.w + pad;
    }
    y += H + label + pad;
  }
  const dir = path.join(OUT, 'contact-sheets');
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `DM-${comp.no}_${(comp.file || comp.title).replace(/[^\wÄÖÜäöüß-]+/g, '-')}.png`);
  fs.writeFileSync(file, board.toBuffer('image/png'));
  console.log('✓ board', path.basename(file));
}

if (MODE === 'board') {
  for (const comp of comps) await renderBoard(comp);
} else {
  for (const [comp, fmt] of jobs) {
    if (MODE === 'video') await renderVideo(comp, fmt);
    else if (MODE === 'stills') await renderStills(comp, fmt);
    else if (MODE === 'sheet') await renderSheet(comp, fmt);
  }
}

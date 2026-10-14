// Showcase app — plays the real compositions live in the browser.
// Same code as the offline renderer; only motion blur is omitted here.

import { COMPS, durationOf } from '../comps/index.js';
import { FORMATS } from '../formats.js';
import { E } from '../core/ease.js';
import { FPS } from '../core/time.js';
import { drawM, bandEase } from '../brand/logo.js';
import { drawArcs, place, motion } from '../brand/arcs.js';
import { ausDerMitte, weiter, weiterOut, senken } from '../brand/arc-moves.js';
import { background } from '../core/stage.js';
import { tok } from '../formats.js';
import { prog, clamp01 } from '../core/time.js';

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const DPR = Math.min(window.devicePixelRatio || 1, 2);
const compById = (id) => COMPS.find((c) => c.id === id);
const fileName = (c, f) => `DM-${c.no}_${(c.file || c.title).replace(/[^\wÄÖÜäöüß-]+/g, '-')}_${f}`;

// ------------------------------------------------------------------ players
const players = new Set();
const visible = new WeakSet();
const io = new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target))), { rootMargin: '120px' });

function backdrop(ctx, w, h) {
  // neutral "footage" stand-in for alpha overlays
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, '#5b6067');
  g.addColorStop(0.55, '#3a3e44');
  g.addColorStop(1, '#2a2d31');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  const r = ctx.createRadialGradient(w * 0.68, h * 0.35, 0, w * 0.68, h * 0.35, w * 0.45);
  r.addColorStop(0, 'rgba(255,255,255,0.16)');
  r.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = r;
  ctx.fillRect(0, 0, w, h);
}

function guides(ctx, fmt, s) {
  ctx.save();
  ctx.setTransform(s, 0, 0, s, 0, 0);
  ctx.lineWidth = 2 / s;
  ctx.setLineDash([10 / s, 8 / s]);
  ctx.strokeStyle = 'rgba(0,140,255,0.9)';
  if (fmt.id === '9x16') {
    ctx.fillStyle = 'rgba(0,140,255,0.08)';
    ctx.fillRect(0, 0, fmt.w, 250);
    ctx.fillRect(0, fmt.h - 400, fmt.w, 400);
    ctx.strokeRect(64, 250, fmt.w - 128, fmt.h - 650);
  } else {
    const m = fmt.w * 0.05;
    ctx.strokeRect(m, fmt.h * 0.05, fmt.w - 2 * m, fmt.h * 0.9); // title safe 90 %
  }
  ctx.restore();
}

class Player {
  constructor(canvas, o = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.comp = o.comp ? compById(o.comp) : null;
    this.fmt = FORMATS[o.format || '16x9'];
    this.custom = o.custom || null; // (ctx, t, fmt) for principle demos
    this.duration = o.duration || (this.comp ? durationOf(this.comp, this.fmt) : 4);
    this.t = o.t ?? 0;
    this.playing = o.autoplay !== false;
    this.speed = 1;
    this.showGuides = false;
    this.onTime = null;
    this.size();
    players.add(this);
    io.observe(canvas);
  }
  setComp(id) { this.comp = compById(id); this.duration = durationOf(this.comp, this.fmt); this.t = 0; this.draw(); }
  setFormat(f) { this.fmt = FORMATS[f]; if (this.comp) this.duration = durationOf(this.comp, this.fmt); this.size(); this.draw(); }
  size() {
    const box = this.canvas.parentElement.getBoundingClientRect();
    const ar = this.fmt.w / this.fmt.h;
    let w = box.width, h = w / ar;
    if (this.canvas.dataset.fit === 'height' || (box.height && h > box.height && this.canvas.dataset.fit !== 'width')) { h = box.height || h; w = h * ar; }
    this.canvas.style.width = `${Math.round(w)}px`;
    this.canvas.style.height = `${Math.round(h)}px`;
    this.canvas.width = Math.max(2, Math.round(w * DPR));
    this.canvas.height = Math.max(2, Math.round(h * DPR));
    this.draw();
  }
  tick(dt) {
    if (!this.playing) return;
    this.t += dt * this.speed;
    if (this.t >= this.duration) this.t = this.t % this.duration;
    this.draw();
  }
  draw() {
    const { ctx, canvas, fmt } = this;
    const s = canvas.width / fmt.w;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    const alpha = this.comp && this.comp.alpha;
    if (alpha) backdrop(ctx, canvas.width, canvas.height);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.__keepBackdrop = !!alpha;
    ctx.setTransform(s, 0, 0, s, 0, 0);
    try {
      if (this.custom) this.custom(ctx, this.t, fmt);
      else if (this.comp) this.comp.draw(ctx, Math.min(this.t, this.duration - 1e-3), fmt, this.comp.copy || {});
    } catch (err) {
      console.error(err);
    }
    if (this.showGuides) guides(ctx, fmt, s);
    if (this.onTime) this.onTime(this.t);
  }
}

let last = performance.now();
function loop(now) {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  for (const p of players) if (visible.has(p.canvas) || p.forceRender) p.tick(dt);
  requestAnimationFrame(loop);
}

// ------------------------------------------------------------------ principle demos
const DEMOS = {
  faltung: { duration: 4.32, draw(ctx, t, fmt) {
    background(ctx, fmt);
    const h = fmt.h * 0.46, w = h * (1048 / 613);
    const ex = clamp01((t - 3.5) / 0.5);
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, fmt.w, fmt.h * 0.27 + h * 1.05); ctx.clip();
    ctx.translate(0, -E.leave(ex) * h * 1.2);
    drawM(ctx, (fmt.w - w) / 2, fmt.h * 0.27, h, { draw: prog(t, 0.25, 1.6, bandEase) });
    ctx.restore();
  } },
  mitte: { duration: 4.8, draw(ctx, t, fmt) {
    background(ctx, fmt);
    const T = tok(fmt);
    drawArcs(ctx, T.arcKind, place(fmt, T.arcKind, 0.95), motion(t, { enter: ausDerMitte(T.arcKind, 0.2), exit: senken(T.arcKind, 3.9) }));
  } },
  bogen: { duration: 9.6, draw(ctx, t, fmt) {
    background(ctx, fmt);
    drawArcs(ctx, 'bottom', place(fmt, 'bottom', fmt.w / 1774 * 1.25), motion(t, { breathe: { amp: 26, period: 4.8 } }));
  } },
  weiter: { duration: 4.8, draw(ctx, t, fmt) {
    background(ctx, fmt);
    const T = tok(fmt);
    drawArcs(ctx, T.arcKind, place(fmt, T.arcKind, 0.95), motion(t, { enter: weiter(T.arcKind, 0.1), exit: weiterOut(T.arcKind, 3.6) }));
  } },
  ruhe: { duration: 19.2, draw(ctx, t, fmt) {
    compById('buehnenloop').draw(ctx, t, fmt, compById('buehnenloop').copy);
  } },
};

// ------------------------------------------------------------------ easing plots
function easingPlots() {
  for (const el of $$('[data-ease]')) {
    const key = el.dataset.ease;
    const fn = E[key];
    const pts = Array.from({ length: 61 }, (_, i) => {
      const x = i / 60;
      return `${(8 + x * 184).toFixed(1)},${(112 - fn(x) * 96).toFixed(1)}`;
    }).join(' ');
    el.innerHTML = `<svg viewBox="0 0 200 120" aria-hidden="true"><path d="M8 112 H192 M8 16 H192" class="grid"/><polyline points="${pts}" class="curve"/></svg>
      <div class="track"><span class="dot" style="animation-timing-function:${fn.css}"></span></div><code>${fn.css}</code>`;
  }
}

// ------------------------------------------------------------------ library + modal
function libraryCards() {
  const grid = $('#library-grid');
  const visibleComps = COMPS.filter((c) => !c.formats); // all-format pieces (the reel plays in the hero)
  grid.innerHTML = visibleComps.map((c) => `
    <article class="card" data-id="${c.id}">
      <div class="stage"><canvas data-comp="${c.id}"></canvas></div>
      <div class="meta">
        <span class="no">${c.no}</span>
        <div><h3>${c.title}${c.name ? ` <em>${c.name}</em>` : ''}</h3>
        <p>${c.notes || ''}</p></div>
        <span class="dur">${durationOf(c, FORMATS['16x9']).toFixed(2).replace('.', ',')} s${c.alpha ? ' · Alpha' : ''}${c.loop ? ' · Loop' : ''}</span>
      </div>
    </article>`).join('');
  const libPlayers = $$('canvas', grid).map((cv) => new Player(cv, { comp: cv.dataset.comp, format: '16x9', t: 0 }));
  // stagger start so the grid feels alive
  libPlayers.forEach((p, i) => { p.t = (i * 0.9) % p.duration; });
  $$('[data-lib-format]').forEach((b) => b.addEventListener('click', () => {
    $$('[data-lib-format]').forEach((x) => x.classList.toggle('on', x === b));
    grid.dataset.format = b.dataset.libFormat;
    libPlayers.forEach((p) => p.setFormat(b.dataset.libFormat));
    requestAnimationFrame(() => libPlayers.forEach((p) => p.size()));
  }));
  $$('.card', grid).forEach((card) => card.addEventListener('click', () => openModal(card.dataset.id)));
  return libPlayers;
}

let modalPlayer = null;
function openModal(id, format) {
  const m = $('#modal');
  m.hidden = false;
  document.body.classList.add('noscroll');
  const c = compById(id);
  const fmt = format || $('#library-grid').dataset.format || '16x9';
  $('#m-title').innerHTML = `<span class="no">${c.no}</span> ${c.title}${c.name ? ` <em>${c.name}</em>` : ''}`;
  $('#m-notes').textContent = c.notes || '';
  const files = ['16x9', '9x16', '1x1'].map((f) => `${c.alpha ? 'video/alpha/' : `video/${f}/`}${fileName(c, f)}${c.alpha ? '.mov / .webm' : '.mp4'}`);
  $('#m-files').innerHTML = files.map((f) => `<li><code>${f}</code></li>`).join('');
  if (!modalPlayer) {
    modalPlayer = new Player($('#m-canvas'), { comp: id, format: fmt });
    modalPlayer.forceRender = true;
    const range = $('#m-range');
    range.addEventListener('input', () => { modalPlayer.t = (+range.value / 1000) * modalPlayer.duration; modalPlayer.playing = false; syncPlay(); modalPlayer.draw(); });
    modalPlayer.onTime = (t) => {
      range.value = Math.round((t / modalPlayer.duration) * 1000);
      $('#m-time').textContent = `${t.toFixed(2).replace('.', ',')} s · f${String(Math.floor(t * FPS)).padStart(3, '0')} / ${Math.round(modalPlayer.duration * FPS)}`;
    };
    const syncPlay = () => ($('#m-play').textContent = modalPlayer.playing ? 'Pause' : 'Play');
    $('#m-play').addEventListener('click', () => { modalPlayer.playing = !modalPlayer.playing; syncPlay(); });
    $('#m-prev').addEventListener('click', () => { modalPlayer.playing = false; modalPlayer.t = Math.max(0, modalPlayer.t - 1 / FPS); syncPlay(); modalPlayer.draw(); });
    $('#m-next').addEventListener('click', () => { modalPlayer.playing = false; modalPlayer.t = Math.min(modalPlayer.duration - 1e-3, modalPlayer.t + 1 / FPS); syncPlay(); modalPlayer.draw(); });
    $('#m-guides').addEventListener('change', (e) => { modalPlayer.showGuides = e.target.checked; modalPlayer.draw(); });
    $$('[data-m-format]').forEach((b) => b.addEventListener('click', () => {
      $$('[data-m-format]').forEach((x) => x.classList.toggle('on', x === b));
      modalPlayer.setFormat(b.dataset.mFormat);
    }));
    $('#m-close').addEventListener('click', closeModal);
    m.addEventListener('click', (e) => { if (e.target === m) closeModal(); });
    window.addEventListener('keydown', (e) => {
      if (m.hidden) return;
      if (e.key === 'Escape') closeModal();
      if (e.key === ' ') { e.preventDefault(); $('#m-play').click(); }
      if (e.key === 'ArrowLeft') $('#m-prev').click();
      if (e.key === 'ArrowRight') $('#m-next').click();
    });
  }
  $$('[data-m-format]').forEach((x) => x.classList.toggle('on', x.dataset.mFormat === fmt));
  modalPlayer.fmt = FORMATS[fmt];
  modalPlayer.setComp(id);
  modalPlayer.size();
  modalPlayer.playing = true;
  $('#m-play').textContent = 'Pause';
}
function closeModal() {
  $('#modal').hidden = true;
  document.body.classList.remove('noscroll');
  if (modalPlayer) modalPlayer.playing = false;
}

// ------------------------------------------------------------------ deliverables table
function deliverables() {
  const rows = COMPS.map((c) => {
    const d = durationOf(c, FORMATS['16x9']);
    const kind = c.alpha ? 'MOV (PNG, alpha) + WebM (VP9, alpha)' : 'MP4 (H.264, BT.709)';
    return `<tr><td class="no">${c.no}</td><td>${c.title}${c.name ? ` <em>${c.name}</em>` : ''}</td><td>${d.toFixed(2).replace('.', ',')} s · ${Math.round(d * FPS)} f</td><td>${kind}</td><td><code>${fileName(c, '{16x9|9x16|1x1}')}${c.alpha ? '.mov / .webm' : '.mp4'}</code></td></tr>`;
  });
  $('#deliverables tbody').innerHTML = rows.join('');
}

// ------------------------------------------------------------------ boot
async function boot() {
  await Promise.all([document.fonts.load('40px "URW Gothic Demi"'), document.fonts.load('40px "URW Gothic Book"')]);
  easingPlots();
  deliverables();
  const ml = $('#mini-logo');
  if (ml) { const c = ml.getContext('2d'); c.clearRect(0, 0, ml.width, ml.height); drawM(c, 2, 2, ml.height - 4); }
  $$('canvas[data-demo]').forEach((cv) => {
    const d = DEMOS[cv.dataset.demo];
    new Player(cv, { custom: d.draw, duration: d.duration, format: cv.dataset.format || '16x9' });
  });
  $$('canvas[data-play]').forEach((cv) => new Player(cv, { comp: cv.dataset.play, format: cv.dataset.format || '16x9' }));
  libraryCards();
  // triptych
  const tri = $$('canvas[data-tri]').map((cv) => new Player(cv, { comp: 'opener', format: cv.dataset.tri }));
  const sel = $('#tri-select');
  sel.innerHTML = COMPS.filter((c) => !c.alpha && !c.formats).map((c) => `<option value="${c.id}">${c.no} — ${c.title}${c.name ? ' · ' + c.name : ''}</option>`).join('');
  sel.value = 'opener';
  sel.addEventListener('change', () => tri.forEach((p) => p.setComp(sel.value)));
  window.addEventListener('resize', () => players.forEach((p) => p.size()));
  requestAnimationFrame(loop);
  document.body.classList.add('ready');
}
boot();


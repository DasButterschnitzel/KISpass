#!/usr/bin/env node
// Brand QA: renders every composition with and without type / arcs and compares
// exact pixel masks.
//   1. type over arcs   — the guide: "Text bleibt auf ruhigen, gut lesbaren Flächen."
//   2. 9:16 UI zones    — no type in the top 250 px / bottom 400 px
// Usage: node tools/qa.mjs [--comp id,id] [--step 0.2]

import { createCanvas, Path2D, GlobalFonts } from '@napi-rs/canvas';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { configurePlatform } from '../src/core/platform.js';
import { FORMATS, FORMAT_IDS } from '../src/formats.js';
import { COMPS, durationOf } from '../src/comps/index.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
GlobalFonts.registerFromPath(path.join(ROOT, 'assets/fonts/URWGothic-Demi.otf'), 'URW Gothic Demi');
GlobalFonts.registerFromPath(path.join(ROOT, 'assets/fonts/URWGothic-Book.otf'), 'URW Gothic Book');
configurePlatform({ createCanvas, Path2D });

const argv = process.argv.slice(2);
const opt = (n, d) => (argv.includes('--' + n) ? argv[argv.indexOf('--' + n) + 1] : d);
const STEP = +opt('step', 0.2);
const sel = opt('comp', 'all').split(',');
const comps = COMPS.filter((c) => (sel.includes('all') || sel.includes(c.id)) && !c.alpha && c.id !== 'showreel' && c.id !== 'uebergaenge-demo');

let issues = 0;
for (const comp of comps) {
  for (const fid of comp.formats || FORMAT_IDS) {
    const fmt = FORMATS[fid];
    const cv = createCanvas(fmt.w, fmt.h);
    const ctx = cv.getContext('2d');
    const render = (t, noText, noArcs) => {
      globalThis.__qaNoText = noText;
      globalThis.__qaNoArcs = noArcs;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, fmt.w, fmt.h);
      comp.draw(ctx, t, fmt, comp.copy || {});
      globalThis.__qaNoText = globalThis.__qaNoArcs = false;
      return new Uint32Array(Buffer.from(cv.data()).buffer.slice(0));
    };
    const dur = durationOf(comp, fmt);
    const hits = [], zone = [];
    for (let t = 0; t < dur; t += STEP) {
      const full = render(t, false, false);
      const noText = render(t, true, false);
      const bare = render(t, true, true);
      let textPx = 0, overlap = 0, outside = 0;
      for (let i = 0; i < full.length; i++) {
        if (full[i] === noText[i]) continue; // not type
        textPx++;
        if (noText[i] !== bare[i]) overlap++; // an arc is underneath
        if (fid === '9x16') {
          const y = (i / fmt.w) | 0;
          if (y < 250 || y >= fmt.h - 400) outside++;
        }
      }
      if (textPx && overlap / textPx > 0.004) hits.push(`${t.toFixed(2)}s ${((100 * overlap) / textPx).toFixed(1)}%`);
      if (outside > 30) zone.push(`${t.toFixed(2)}s ${outside}px`);
    }
    const tag = `${comp.no} ${comp.id} ${fid}`;
    if (hits.length) { issues++; console.log(`✗ type over arcs   ${tag}: ${hits.slice(0, 8).join(', ')}${hits.length > 8 ? ` … (${hits.length})` : ''}`); }
    if (zone.length) { issues++; console.log(`✗ 9:16 UI zone     ${tag}: ${zone.slice(0, 6).join(', ')}${zone.length > 6 ? ` … (${zone.length})` : ''}`); }
    if (!hits.length && !zone.length) console.log(`✓ ${tag}`);
  }
}
console.log(issues ? `\n${issues} issue(s)` : '\nall clear');
process.exit(issues ? 1 : 0);

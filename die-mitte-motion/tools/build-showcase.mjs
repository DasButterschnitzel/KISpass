#!/usr/bin/env node
// Builds showcase/Die-Mitte-Motion-Showcase.html — one self-contained file:
// bundled composition code (esbuild) + embedded URW Gothic + guideline content.

import { build } from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(ROOT, 'showcase', 'Die-Mitte-Motion-Showcase.html');

const js = (
  await build({
    entryPoints: [path.join(ROOT, 'src/showcase/main.js')],
    bundle: true,
    minify: true,
    format: 'iife',
    target: ['es2020'],
    write: false,
    legalComments: 'none',
  })
).outputFiles[0].text;

const font = (f) => fs.readFileSync(path.join(ROOT, 'assets/fonts', f)).toString('base64');
const demi = font('URWGothic-Demi.otf');
const book = font('URWGothic-Book.otf');

const css = String.raw`
@font-face{font-family:"URW Gothic Demi";src:url(data:font/otf;base64,${demi}) format("opentype");font-display:block}
@font-face{font-family:"URW Gothic Book";src:url(data:font/otf;base64,${book}) format("opentype");font-display:block}
:root{--silver:#E2E5E7;--mgray:#BCC1C5;--lgray:#D2D6D9;--black:#1C1D20;--red:#D92C32;--gold:#F4C526;--paper:#EEF0F1;--ink:#1C1D20;--muted:#55595f;--line:#c9cdd1;--m:clamp(16px,5vw,88px)}
*{box-sizing:border-box}
html{background:var(--paper)}
body{margin:0;background:var(--paper);color:var(--ink);font:400 17px/1.55 "URW Gothic Book",system-ui,sans-serif;-webkit-font-smoothing:antialiased;overflow-x:hidden}
body.noscroll{overflow:hidden}
h1,h2,h3,.demi{font-family:"URW Gothic Demi",system-ui,sans-serif;font-weight:600;letter-spacing:0}
em{font-style:normal;color:var(--muted)}
code{font:13px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--muted);word-break:break-all}
a{color:inherit}
.wrap{max-width:1440px;margin:0 auto;padding:0 var(--m)}
header.top{position:sticky;top:0;z-index:5;background:rgba(238,240,241,.92);backdrop-filter:blur(8px);border-bottom:1px solid var(--line)}
header.top .wrap{display:flex;align-items:center;gap:24px;height:64px}
header.top .brand{font-family:"URW Gothic Demi";font-size:18px;display:flex;align-items:center;gap:10px;white-space:nowrap}
header.top .brand svg{height:22px;width:auto}
header.top nav{margin-left:auto;display:flex;gap:22px;font-size:15px;overflow-x:auto}
header.top nav a{text-decoration:none;color:var(--muted);white-space:nowrap}
header.top nav a:hover{color:var(--ink)}
.kicker{font:400 13px/1 "URW Gothic Book";letter-spacing:.18em;text-transform:uppercase;color:var(--muted)}
.hero{padding-top:56px;padding-bottom:24px}
.hero h1{font-size:clamp(40px,6.4vw,104px);line-height:1.02;margin:18px 0 22px}
.hero p.lede{max-width:760px;font-size:clamp(17px,1.6vw,21px);color:#33363a}
.stage{background:var(--silver);overflow:hidden;display:flex;align-items:center;justify-content:center;position:relative}
.stage canvas{display:block;max-width:100%}
.hero .stage{aspect-ratio:16/9;margin-top:28px;box-shadow:0 1px 0 var(--line)}
section{padding:72px 0;border-top:1px solid var(--line)}
section h2{font-size:clamp(30px,3.6vw,52px);line-height:1.05;margin:12px 0 18px}
section .intro{max-width:780px;color:#33363a}
.principles{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:24px;margin-top:36px}
@media (max-width:1180px){.principles{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media (max-width:760px){.principles{grid-template-columns:minmax(0,1fr)}}
.principle .stage{aspect-ratio:16/9}
.principle h3{font-size:22px;margin:16px 0 6px}
.principle h3 span{color:var(--red);margin-right:10px}
.principle p{margin:0;color:#33363a;font-size:15px;line-height:1.5}
.ease-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:24px;margin-top:32px}
.ease{background:#fff;padding:18px 18px 16px;border:1px solid var(--line)}
.ease h3{margin:0 0 2px;font-size:20px}
.ease p{margin:0 0 10px;font-size:15px;color:var(--muted)}
.ease svg{width:100%;height:auto;display:block}
.ease .grid{stroke:var(--line);stroke-width:1;fill:none}
.ease .curve{fill:none;stroke:var(--black);stroke-width:3;stroke-linejoin:round}
.ease .track{position:relative;height:14px;margin:12px 4px 10px;border-top:2px solid var(--silver)}
.ease .dot{position:absolute;left:0;top:-8px;width:14px;height:14px;border-radius:50%;background:var(--red);animation:move 1.92s infinite alternate}
@keyframes move{from{left:0}to{left:calc(100% - 14px)}}
@media (prefers-reduced-motion:reduce){.ease .dot{animation:none}}
.facts{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:24px;margin-top:32px}
@media (max-width:1180px){.facts{grid-template-columns:repeat(3,1fr)}}
@media (max-width:560px){.facts{grid-template-columns:repeat(2,1fr)}}
.fact{border-top:3px solid var(--black);padding-top:12px}
.fact b{display:block;font-family:"URW Gothic Demi";font-size:30px;line-height:1.1;margin-bottom:6px}
.fact span{color:#33363a;font-size:15px}
.swatches{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:16px;margin-top:28px}
.sw{background:#fff;border:1px solid var(--line)}
.sw i{display:block;height:72px}
.sw div{padding:10px 12px 12px;font-size:14px}
.sw div b{display:block;font-family:"URW Gothic Demi";font-weight:600}
.toolbar{display:flex;gap:8px;flex-wrap:wrap;margin:26px 0 22px}
.toolbar button,.controls button{font:600 14px/1 "URW Gothic Demi";background:#fff;border:1px solid var(--line);color:var(--ink);padding:10px 14px;cursor:pointer}
.toolbar button.on,.controls button.on{background:var(--black);color:#fff;border-color:var(--black)}
#library-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(300px,100%),1fr));gap:28px}
#library-grid[data-format="9x16"]{grid-template-columns:repeat(auto-fill,minmax(200px,1fr))}
.card{cursor:pointer}
.card .stage{aspect-ratio:16/9}
#library-grid[data-format="9x16"] .card .stage{aspect-ratio:9/16}
#library-grid[data-format="1x1"] .card .stage{aspect-ratio:1/1}
.card .meta{display:grid;grid-template-columns:auto 1fr;gap:4px 14px;padding-top:12px}
.card .no{font-family:"URW Gothic Demi";color:var(--red);font-size:16px;line-height:1.5}
.card h3{margin:0;font-size:18px;line-height:1.3}
.card p{margin:4px 0 0;font-size:14px;color:var(--muted);line-height:1.45}
.card .dur{grid-column:2;font-size:13px;color:var(--muted)}
.card:hover .stage{outline:2px solid var(--black);outline-offset:3px}
.tri{display:grid;grid-template-columns:minmax(0,16fr) minmax(0,5.4fr) minmax(0,9.6fr);gap:20px;align-items:end;margin-top:26px}
.tri .stage:nth-child(1){aspect-ratio:16/9}.tri .stage:nth-child(2){aspect-ratio:9/16}.tri .stage:nth-child(3){aspect-ratio:1/1}
.tri-labels{display:grid;grid-template-columns:16fr 5.4fr 9.6fr;gap:20px;margin-top:10px;font-size:14px;color:var(--muted)}
select{font:400 16px "URW Gothic Book";padding:10px 12px;border:1px solid var(--line);background:#fff;max-width:100%}
.rules{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:28px;margin-top:30px}
.rules ul{margin:0;padding:0;list-style:none}
.rules li{padding:10px 0;border-bottom:1px solid var(--line);font-size:16px}
.rules h3{font-size:22px;margin:0 0 6px}
.rules .do h3{color:var(--black)}.rules .dont h3{color:var(--red)}
table{width:100%;border-collapse:collapse;margin-top:26px;font-size:15px}
th,td{text-align:left;padding:10px 10px 10px 0;border-bottom:1px solid var(--line);vertical-align:top}
th{font:600 13px/1.2 "URW Gothic Demi";letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
td.no{font-family:"URW Gothic Demi";color:var(--red);width:48px}
.tablewrap{overflow-x:auto}
footer{padding:48px 0 64px;border-top:1px solid var(--line);color:var(--muted);font-size:14px}
#modal{position:fixed;inset:0;background:rgba(20,21,24,.86);z-index:20;display:flex;align-items:center;justify-content:center;padding:16px}
#modal[hidden]{display:none}
#modal .box{background:var(--paper);width:min(1280px,100%);max-height:100%;overflow:auto;padding:18px}
#modal .head{display:flex;align-items:baseline;gap:12px;margin-bottom:12px}
#modal .head h3{margin:0;font-size:22px}
#modal .head .no{color:var(--red)}
#modal .head button{margin-left:auto;background:none;border:0;font:600 15px "URW Gothic Demi";cursor:pointer}
#modal .view{height:min(64vh,720px);display:flex;align-items:center;justify-content:center;background:#d9dcdf}
#modal .view canvas{display:block}
.controls{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:12px}
.controls input[type=range]{flex:1;min-width:160px;accent-color:var(--black)}
.controls .time{font:13px ui-monospace,Menlo,monospace;color:var(--muted);min-width:170px}
.controls label{font-size:14px;display:flex;gap:6px;align-items:center}
#modal .info{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:14px;font-size:15px}
#modal .info ul{margin:0;padding-left:18px}
@media (max-width:760px){.tri,.tri-labels{grid-template-columns:1fr}.tri .stage:nth-child(2){max-width:320px}#modal .info{grid-template-columns:1fr}header.top nav{display:none}}
body:not(.ready) canvas{opacity:0}
`;

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Die Mitte Motion</title>
<meta name="description" content="Motion graphics identity for the fictional party Die Mitte (film prop): principles, live compositions in 16:9, 9:16 and 1:1, deliverables.">
<style>${css}</style>
</head>
<body>
<header class="top"><div class="wrap">
  <div class="brand"><canvas id="mini-logo" width="60" height="36" style="width:30px;height:18px" aria-hidden="true"></canvas>Die Mitte · Motion</div>
  <nav><a href="#prinzipien">Principles</a><a href="#rhythmus">Rhythm</a><a href="#farbe">Colour &amp; type</a><a href="#bibliothek">Library</a><a href="#formate">Formats</a><a href="#regeln">Rules</a><a href="#lieferumfang">Deliverables</a></nav>
</div></header>

<main>
<div class="wrap hero">
  <div class="kicker">Die Mitte · Motion Identity · Gestaltungsstand 01</div>
  <h1>Aus der Mitte.<br>Für das Ganze.</h1>
  <p class="lede">A motion system built from two things the brand already owns: the M as one folded band, and the Bogen — arcs that rise from the edge. Thirteen compositions in 16:9, 9:16 and 1:1. Everything on this page plays live from the same code that renders the broadcast masters.</p>
  <div class="stage"><canvas data-play="showreel" data-format="16x9"></canvas></div>
</div>

<section id="prinzipien"><div class="wrap">
  <div class="kicker">01 · Principles</div>
  <h2>Five rules make every frame recognisable — even without the logo.</h2>
  <p class="intro">The national colours only ever appear together, as one band. Movement grows from the core outward, travels on arcs and never rewinds. Silver keeps the stage calm.</p>
  <div class="principles">
    <div class="principle"><div class="stage"><canvas data-demo="mitte"></canvas></div><h3><span>1</span>Aus der Mitte</h3><p>Movement starts at the core and grows outward until the whole has formed: the innermost band first, the silver rings after it.</p></div>
    <div class="principle"><div class="stage"><canvas data-demo="faltung"></canvas></div><h3><span>2</span>Die Faltung</h3><p>The M is one continuous band — up the black leg, down the red diagonal into the centre, over the fold (Faltenrot is the back of the band), up and down the gold leg. The logo writes itself in a single gesture.</p></div>
    <div class="principle"><div class="stage"><canvas data-demo="bogen"></canvas></div><h3><span>3</span>Der Bogen</h3><p>Every crescent is a disc behind another disc. Arcs rise from the edge, grow from their corner and breathe — and every resting frame is the exact Bogenmotiv of the design guide.</p></div>
    <div class="principle"><div class="stage"><canvas data-demo="weiter"></canvas></div><h3><span>4</span>Weiter</h3><p>Exits never rewind. What came from the left keeps travelling right; what rose keeps rising. The system always moves forward.</p></div>
    <div class="principle"><div class="stage"><canvas data-demo="ruhe"></canvas></div><h3><span>5</span>Ruhe</h3><p>Silver holds at least 70 % of every frame. One accent moment per piece, type held long enough to read twice. No glows, no bounces, no 3D spins.</p></div>
  </div>
</div></section>

<section id="rhythmus"><div class="wrap">
  <div class="kicker">02 · Rhythm &amp; easing</div>
  <h2>One beat, four curves.</h2>
  <p class="intro">Everything is timed on the <b class="demi">Takt</b>: 0.48 s = 12 frames at 25 fps (125 BPM) — music edits land on it. Four curves only, no overshoot.</p>
  <div class="facts">
    <div class="fact"><b>0,48 s</b><span>1 Takt · 12 frames @ 25 fps · masters are 25p</span></div>
    <div class="fact"><b>0,84 s</b><span>Type line reveal, masked from its own baseline</span></div>
    <div class="fact"><b>+0,30 s</b><span>„Der Punkt“ — the full stop lands after its line</span></div>
    <div class="fact"><b>2–3 f</b><span>Stagger between lines, letters and discs</span></div>
    <div class="fact"><b>2/3</b><span>Exits take two thirds of their entrance</span></div>
    <div class="fact"><b>180°</b><span>Shutter: 24-sample motion blur on every moving frame</span></div>
  </div>
  <div class="ease-grid">
    <div class="ease"><h3>Arrive <em>Ankommen</em></h3><p>Everything that enters.</p><div data-ease="arrive"></div></div>
    <div class="ease"><h3>Leave <em>Gehen</em></h3><p>Everything that exits.</p><div data-ease="leave"></div></div>
    <div class="ease"><h3>Sweep <em>Schwung</em></h3><p>Arcs, the band, momentum.</p><div data-ease="sweep"></div></div>
    <div class="ease"><h3>Glide <em>Gleiten</em></h3><p>Camera, re-layouts, the draw.</p><div data-ease="glide"></div></div>
  </div>
</div></section>

<section id="farbe"><div class="wrap">
  <div class="kicker">03 · Colour &amp; type in motion</div>
  <h2>Silver is the stage. The band is the accent.</h2>
  <div class="swatches">
    <div class="sw"><i style="background:#E2E5E7"></i><div><b>Silber</b>#E2E5E7 · ≥ 70 % of every frame</div></div>
    <div class="sw"><i style="background:#BCC1C5"></i><div><b>Mittelgrau</b>#BCC1C5 · arcs, structure</div></div>
    <div class="sw"><i style="background:#D2D6D9"></i><div><b>Bogen-Hellgrau</b>#D2D6D9 · second arc tone</div></div>
    <div class="sw"><i style="background:#1C1D20"></i><div><b>Schwarz</b>#1C1D20 · all type, band</div></div>
    <div class="sw"><i style="background:#D92C32"></i><div><b>Rot</b>#D92C32 · band, numbers, quote mark</div></div>
    <div class="sw"><i style="background:#F4C526"></i><div><b>Goldgelb</b>#F4C526 · band, data highlight</div></div>
    <div class="sw"><i style="background:#A21B25"></i><div><b>Faltenrot</b>#A21B25 · inner fold of the M only</div></div>
  </div>
  <div class="rules" style="margin-top:36px">
    <div><h3>Type moves one way</h3><ul><li>Lines rise out of their own baseline mask — no fades, no blur, no scaling, no typewriter.</li><li>URW Gothic Demi for statements, Book for information, tracked capitals only for small labels.</li><li>Slogans end on „Der Punkt“: the full stop lands a beat after its line.</li><li>Counters use fixed-width digit slots, chapter numbers roll like an odometer.</li></ul></div>
    <div><h3>The logo is built, never decorated</h3><ul><li>Resting frames show the untouched lockups from the production set.</li><li>Protection zone ≥ ¼ M height, also during motion.</li><li>No shadows, glows, outlines, 3D or colour changes on the mark.</li><li>Small bug: horizontal lockup, top right in 16:9 and on editorial squares, centred above centred layouts.</li></ul></div>
  </div>
</div></section>

<section id="bibliothek"><div class="wrap">
  <div class="kicker">04 · Library</div>
  <h2>Thirteen pieces, three formats each.</h2>
  <p class="intro">Click any piece for the player: frame stepping (← →), space to play, safe-area guides; the stage loop also plays in 12:5. Overlays with alpha are shown over a neutral footage stand-in.</p>
  <div class="toolbar"><button class="on" data-lib-format="16x9">16:9</button><button data-lib-format="9x16">9:16</button><button data-lib-format="1x1">1:1</button></div>
  <div id="library-grid" data-format="16x9"></div>
</div></section>

<section id="formate"><div class="wrap">
  <div class="kicker">05 · Formats</div>
  <h2>Recomposed, never cropped.</h2>
  <p class="intro">16:9 is editorial and left-aligned with the corner arcs of the presentation set. 9:16 and 1:1 centre their statements over the bottom landscape and keep information left-aligned for reading; vertical keeps type out of the top 250 px and bottom 400 px reserved for platform UI. Same timing, same beat — different composition. The stage loop adds a 12:5 master (3840 × 1600) for the LED wall.</p>
  <div class="toolbar"><select id="tri-select" aria-label="Composition"></select></div>
  <div class="tri"><div class="stage"><canvas data-tri="16x9"></canvas></div><div class="stage"><canvas data-tri="9x16"></canvas></div><div class="stage"><canvas data-tri="1x1"></canvas></div></div>
  <div class="tri-labels"><span>16:9 · 1920 × 1080</span><span>9:16 · 1080 × 1920</span><span>1:1 · 1080 × 1080</span></div>
</div></section>

<section id="regeln"><div class="wrap">
  <div class="kicker">06 · Rules</div>
  <h2>Do · Don’t</h2>
  <div class="rules">
    <div class="do"><h3>Do</h3><ul>
      <li>Let silver breathe. If in doubt, remove an element.</li>
      <li>Keep black, red and gold together, in this order, as one band.</li>
      <li>Anchor arcs to the bottom edge or a corner; text sits on silver.</li>
      <li>Use the silver transition by default — colour transitions for chapter changes.</li>
      <li>Cut under transitions exactly at half their duration.</li>
      <li>Hold every line long enough to be read twice.</li>
    </ul></div>
    <div class="dont"><h3>Don’t</h3><ul>
      <li>Flood the frame with red or gold, or use the colours as separate accents.</li>
      <li>Use Faltenrot anywhere but inside the M.</li>
      <li>Add bounce, overshoot, elastic or 3D spins.</li>
      <li>Fade, blur or scale type in; never put type on the arcs.</li>
      <li>Rewind an exit — the system moves forward.</li>
      <li>Crop a 16:9 piece for vertical; use the 9:16 master.</li>
    </ul></div>
  </div>
</div></section>

<section id="lieferumfang"><div class="wrap">
  <div class="kicker">07 · Deliverables</div>
  <h2>Broadcast masters, overlays, stills.</h2>
  <p class="intro">25 fps progressive, H.264 High, BT.709 (limited range), CRF 12, 180° shutter motion blur with 24 sub-frames (90° while the logo draws and in transitions). Overlays: PNG-in-MOV (lossless RGBA, NLE-ready) and WebM VP9 with alpha. Texts can be changed and re-rendered with <code>node tools/render.mjs --comp &lt;id&gt; --copy texts.json</code>.</p>
  <div class="tablewrap"><table id="deliverables"><thead><tr><th>No.</th><th>Piece</th><th>Duration</th><th>Codec</th><th>File (per format)</th></tr></thead><tbody></tbody></table></div>
</div></section>
</main>

<footer><div class="wrap">Die Mitte — fiktive Partei · Filmrequisite. Motion identity based on the production set (Designguide, Gestaltungsstand 01). URW Gothic © URW++ (AGPL-3.0 with font exception).</div></footer>

<div id="modal" hidden><div class="box" role="dialog" aria-modal="true" aria-labelledby="m-title">
  <div class="head"><h3 id="m-title"></h3><button id="m-close" aria-label="Close">Close ✕</button></div>
  <div class="view"><canvas id="m-canvas" data-fit="height"></canvas></div>
  <div class="controls">
    <button id="m-play">Pause</button><button id="m-prev" aria-label="Previous frame">←</button><button id="m-next" aria-label="Next frame">→</button>
    <input id="m-range" type="range" min="0" max="1000" value="0" aria-label="Scrub">
    <span class="time" id="m-time"></span>
    <button data-m-format="16x9" class="on">16:9</button><button data-m-format="9x16">9:16</button><button data-m-format="1x1">1:1</button><button data-m-format="12x5" hidden>12:5</button>
    <label><input type="checkbox" id="m-guides"> Safe areas</label>
  </div>
  <div class="info"><p id="m-notes"></p><ul id="m-files"></ul></div>
</div></div>

<script>${js}</script>
</body>
</html>`;

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, html);
console.log('✓ showcase', path.relative(ROOT, out), (fs.statSync(out).size / 1024).toFixed(0) + ' KB');

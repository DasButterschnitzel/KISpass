# Die Mitte — Motion Identity

Motion graphics system for **Die Mitte**, the fictional party of the film production
(*fiktive Partei · Filmrequisite*). It extends the static production set
(Designguide „Offene Mitte“, Gestaltungsstand 01) into motion: thirteen compositions,
each composed individually for **16:9, 9:16 and 1:1**, plus transitions with alpha,
a seamless stage loop (also as a **12:5 LED-wall master**), a showreel and a live showcase.

> Open **`showcase/Die-Mitte-Motion-Showcase.html`** in a browser. It is a single
> self-contained file: every composition plays live, with a frame-accurate player,
> safe-area guides and the full guidelines.

All on-screen copy, names and data are placeholders for the fictional party. No real
people, contact details or dates are used — lower thirds read *Vorname Nachname*
and can be re-rendered with the names from the script (see [Custom texts](#custom-texts)).

---

## 1 · The idea

The brand already owns two shapes. The motion system is built from nothing else.

**The band (Das Band).** The M-Signet is one continuous ribbon: up the black leg,
over the top, down the red diagonal into the centre, over the fold — *Faltenrot* is
the back of the ribbon — up again, and down the gold leg. In motion the logo writes
itself in a single gesture: **„Die Faltung“**.

**The arc (Der Bogen).** The Bogenmotiv turns out to be a stack of discs: every
crescent is the part of a disc not covered by the disc in front of it. Animating the
discs' centres and radii keeps the crescents organic — bands thicken, thin and settle
— while every resting frame is the exact motif of the production set.

## 2 · Five principles

| | Principle | In practice |
|---|---|---|
| 1 | **Aus der Mitte** — from the core | Movement grows from the core outward until the whole has formed: innermost band first, silver rings after it. |
| 2 | **Die Faltung** — the fold | The M is drawn as one band, never assembled from pieces, never decorated. |
| 3 | **Der Bogen** — the arc | Arcs rise from the edge, grow from their corner, breathe. They stay anchored to the bottom edge or a corner; type never sits on them. |
| 4 | **Weiter** — onward | Exits continue the movement; nothing rewinds. What came from the left keeps travelling right. |
| 5 | **Ruhe** — calm | Silver holds ≥ 70 % of every frame. One accent moment per piece. No glows, bounces, elastic or 3D spins. |

Black, red and gold only ever appear **together, in this order, as one band** — never
as separate accents and never as full-frame floods. Faltenrot appears **only** inside the M.

## 3 · Rhythm and easing

One **Takt** (beat) = **0.48 s = 12 frames @ 25 fps** (125 BPM). Music edits land on it.

| Token | Value |
|---|---|
| Type line reveal | 0.84 s, masked rise out of its own baseline |
| „Der Punkt“ | the closing full stop lands 0.30 s after its line |
| Stagger | 2–3 frames between lines, letters, discs |
| Exit | ≈ ⅔ of the entrance |
| Motion blur | 180° shutter, 24 sub-frames, on every moving frame; 90° while the logo draws and during transitions, so edges stay crisp |

Four curves only — no overshoot:

| Curve | German | cubic-bezier | Use |
|---|---|---|---|
| `arrive` | Ankommen | `0.16, 1, 0.3, 1` | everything that enters |
| `leave` | Gehen | `0.7, 0, 0.84, 0` | everything that exits |
| `sweep` | Schwung | `0.83, 0, 0.17, 1` | arcs, the band, momentum |
| `glide` | Gleiten | `0.65, 0, 0.35, 1` | camera, re-layouts, the logo draw |

## 4 · Motion vocabulary

**Arc moves** (`src/brand/arc-moves.js`), each defined for both motifs:

- **Aufgang** — the band rises, grey hills follow (corner: rings grow from the corner, back to front). Logo, cards.
- **Aus der Mitte** — the innermost band appears first, the rings form outward; at the bottom the band rises in the centre while the hills close in from both sides. Slogans.
- **Weiter** — rises out of the edge, then pushes forward; the exit keeps travelling right.
- **Senken** — quiet exit downwards.
- **Atmen** — a slow drift of each disc on its own phase during holds and loops.

**Type moves** (`src/core/text.js`): masked rise (the house move), horizontal pull for
„weiter.“, per-letter rise for single big words, odometer roll for chapter numbers,
fixed-width digit slots for counters (URW Gothic has no tabular figures).

**Transitions** (`src/brand/transitions.js`): a wave of discs passes through the frame
— thin colour bands lead in, a silver body covers the frame, the bands trail out.
Motion profile `y(u) = K·u³ + L·u` (fast at the edges, slow through the middle), solved
per format so the frame is **fully covered for ≈ 8 frames around the exact midpoint**.

| Transition | Character | Use |
|---|---|---|
| Aufgang | stack rises through the frame | chapter changes |
| Ecke | eccentric rings ripple from the corner (16:9) / bottom centre | section openers |
| Silber | greys and silver only | the default, frequent use |

## 5 · Formats

Every format is recomposed, never cropped.

| | 16:9 · 1920×1080 | 9:16 · 1080×1920 | 1:1 · 1080×1080 |
|---|---|---|---|
| Layout | editorial, left-aligned | statements centred, information left-aligned | statements centred, information left-aligned |
| Arcs | corner motif (as in the presentation set) | bottom landscape (scale 0.755, as Story-9x16) | bottom landscape (scale 0.609, as Quadrat) |
| Margins | 128 px (title-safe 96) | 96 px; type out of top 250 / bottom 400 px | 88 px |
| Logo bug | horizontal lockup, top right | horizontal lockup, centred; on centred cards it groups with the content (never above y = 330) | top right on editorial cards, centred above centred cards |

**Stage wall · 12:5 · 3840×1600** — the Bühnen-Loop also ships as an LED-wall master:
16:9 proportions (logo top left, slogan one type size below), 256 px margins, larger
type, and the lower 480 px kept free of type for lectern and speaker.

**Type scale** (px, URW Gothic Demi unless noted) — one scale per format; the pieces pick
their levels from it (only the lower third uses dedicated broadcast sizes):

| Level | 16:9 | 9:16 | 1:1 | 12:5 | Used for |
|---|---|---|---|---|---|
| display | 144 | 112 | 100 | 232 | slogans, chapter titles, big words |
| h1 | 108 | 96 | 84 | 176 | headings of information cards |
| h2 | 84 | 80 | 68 | 136 | list items, quotes, verdicts (1:1 headings) |
| h3 | 64 | 60 | 54 | 104 | end-card slogan, Social slogan (1:1 list items) |
| body | 42 | 44 | 40 | 68 | subtitles and descriptions (Book), names (Demi) |
| small | 34 | 38 | 36 | 56 | functions, captions — Book |
| label | 30 | 40 | 38 | 48 | tracked capitals (0.1 em) — Book |

In 1:1 the information cards step down one level: the square's heading shares its line
with the bug and keeps at least 1.8 M heights of air to it (long headings fit
themselves). Left-aligned type from 48 px up is aligned by its ink, not by the glyph's
side bearing, so lines starting with different letters share one optical edge.

Lockups are reproduced exactly from `Logo-horizontal.svg` and `Logo-gestapelt.svg`; the
protection zone (¼ M height) is respected in every layout.

## 6 · Compositions

| No. | Piece | Duration | Deliverable | Notes |
|---|---|---|---|---|
| 00 | Showreel | 69.1 s | MP4 16:9 + 9:16 | the package on one timeline; the 9:16 reel cuts the vertical masters and stacks the format triptych |
| 01 | Logo-Reveal „Die Faltung“ | 5.76 s | MP4 ×3 | ends on the exact lockup (hold from 3.4 s) |
| 02 | Opener „Aus der Mitte“ | 12.48 s | MP4 ×3 | aerial camera over the arcs, four values, sign-off on the whole landscape* |
| 03 | Slogan „Aus der Mitte. Für das Ganze.“ | 7.20 s | MP4 ×3 | in → hold 3.4–6.1 s → out to silver |
| 04 | Slogan „Gemeinsam weiter.“ | 6.24 s | MP4 ×3 | exits keep moving forward |
| 05 | Titelkarte | 6.24 s | MP4 ×3 | number rolls like an odometer; number / title / line editable |
| 06 | Bauchbinde | 7.20 s | MOV + WebM alpha ×3 | in 0–1 s, out from 6.0 s |
| 07 | Infografik „Unsere Themen“ | 8.16 s | MP4 ×3 | red focus walks through the list |
| 08 | Infografik „Abstimmung“ | 8.64 s | MP4 ×3 | Ja / Nein / Enthaltung = gold / red / black — together the complete band; values in % |
| 09 | Zitat | 8.16 s | MP4 ×3 | red guillemet », sentences break at full stops |
| 10 | Übergänge (demo) | 8.40 s | MP4 ×3 | the three transitions between scenes |
| 10a–c | Übergang Aufgang / Ecke / Silber | 1.20 / 1.28 / 1.04 s | MOV + WebM alpha ×3 | **cut point = half the duration** |
| 11 | Social „Parteitag · Live“ | 8.64 s | MP4 ×3 | label, word, slogan editable |
| 12 | Abspann | 7.20 s | MP4 ×3 | ends on a hold — the last frame is the end card |
| 13 | Bühnen-Loop | 19.20 s | MP4 ×3 + 12:5 | seamless (frame 0 = frame N) for hall screens and the 3840×1600 LED wall |

\* The opener is the one place where 16:9 shows the full bottom landscape instead of the
corner motif: the camera lands on the whole Bogen — the hero frame of the system, also
usable as a stage backdrop. Every other 16:9 piece uses the corner, as the presentation set does.

## 7 · Files

```
die-mitte-motion/
├─ showcase/Die-Mitte-Motion-Showcase.html   live showcase + guidelines (self-contained)
├─ exports/
│  ├─ video/16x9 | 9x16 | 1x1/   MP4 masters   DM-<no>_<name>_<format>.mp4
│  ├─ video/12x5/                stage wall    DM-13_Buehnen-Loop_12x5.mp4 (3840×1600)
│  ├─ video/alpha/               overlays      DM-<no>_<name>_<format>.mov / .webm
│  ├─ stills/16x9 | 9x16 | 1x1/  style frames (PNG)
│  └─ contact-sheets/            one board per composition, all formats
├─ src/
│  ├─ core/       easing, timing, typography, layout, camera spline, platform bridge
│  ├─ brand/      logo (exact outlines + band draw-on), arcs, arc moves, transitions, bug
│  ├─ comps/      the compositions (00–13)
│  └─ showcase/   browser app for the showcase
├─ tools/         render.mjs, qa.mjs, build-showcase.mjs, extract-geometry.py
└─ assets/fonts/  URW Gothic Book + Demi (AGPL-3.0 with font exception)
```

**Masters:** 25 fps progressive · H.264 High · yuv420p · BT.709 limited range (tagged) ·
CRF 12 · `+faststart`. **Overlays:** PNG-in-MOV (lossless RGBA, opens in Premiere,
Resolve, Avid via AMA, After Effects, Final Cut) and WebM VP9 with alpha (web, OBS).
For a ProRes 4444 / 422 HQ hand-off, transcode the MOV/MP4 or extend `render.mjs`.

## 8 · Rendering

Requirements: Node ≥ 18, ffmpeg (libx264, libvpx-vp9).

```bash
npm install
npm run build        # QA → all masters → stills → contact sheets → showcase
npm run qa           # brand QA: type never on the arcs, 9:16 type outside the UI zones

node tools/render.mjs                                  # everything (all formats)
node tools/render.mjs --comp opener --format 9x16      # one piece, one format
node tools/render.mjs --mode stills                    # style frames
node tools/render.mjs --mode board                     # contact sheets (all formats per piece)
node tools/render.mjs --mode sheet --out /tmp/review   # filmstrip for review
node tools/render.mjs --jobs 4                         # parallel
node tools/build-showcase.mjs                          # rebuild the showcase
```

Options: `--fps 50` (frame rate is free; all motion is time-based), `--samples 24`
(motion-blur sub-frames, `1` = off), `--shutter 180` (pieces with their own shutter
curve keep it), `--crf 12`, `--from 17.28 --to 34.56` (render a range, e.g. to split
the showreel across processes and join the parts with ffmpeg's concat demuxer).

**Brand QA** (`npm run qa`) renders every composition in every format every 0.2 s three
times — complete, without type, without type and arcs — and compares the frames pixel by
pixel. It fails if type touches the arcs (more than 0.4 % of a frame's type pixels) or if
9:16 type enters the platform UI zones (top 250 px, bottom 400 px).

### Custom texts

Every composition reads its copy from a `copy` object that can be overridden per piece:

```json
{
  "bauchbinde": { "name": "Miriam Beispiel", "role": "Spitzenkandidatin · Die Mitte" },
  "titelkarte": { "number": "02", "title": "Verantwortung", "subtitle": "Entscheidungen\noffen erklären." },
  "abstimmung": { "results": [["Ja", 74], ["Nein", 18], ["Enthaltung", 8]], "verdict": "Angenommen." }
}
```

```bash
node tools/render.mjs --comp bauchbinde --copy texts.json --out exports/custom
```

## 9 · Fidelity notes

- The M-Signet, the wordmark outlines and both lockups are used exactly as delivered
  (`M-Signet.svg`, `Logo-horizontal.svg`, `Logo-gestapelt.svg`, extracted by
  `tools/extract-geometry.py`); the 0.7-unit seam stroke of the originals is kept.
- The Bogenmotiv (bottom and corner) is rebuilt as circle stacks fitted against the
  delivered PNGs: **0.99 %** (bottom) and **0.61 %** (corner) pixel deviation — the
  remaining difference is tracing noise along the edges of the originals.
- Observation on the production set: `06-Screen-und-Social/Screen-1920x1080` ends the
  corner arcs 35 px above the bottom edge (they stop at y = 1045). The presentation
  slides place them flush; the motion system follows the slides and the guide
  („am unteren Rand oder in einer Ecke“).
- Measured colour after encoding: within 1–2 code values of the brand hex values
  (8-bit 4:2:0 quantisation).

## 10 · Fonts and licence

URW Gothic Book and Demi are part of the URW base35 fonts, © URW++, licensed under the
AGPL-3.0 with font exception; see `assets/fonts/LICENSE-URW-base35.txt`. They are
embedded in the showcase and used for rendering.

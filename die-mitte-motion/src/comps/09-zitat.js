// 09 — Zitat (quote card)
// A red quotation mark opens the frame, the sentences rise one by one,
// the attribution lands a beat later. Hanging punctuation keeps the text edge clean.

import { background } from '../core/stage.js';
import { prog, clamp01 } from '../core/time.js';
import { tok } from '../formats.js';
import { C } from '../brand/palette.js';
import { revealLine, wrap, CAP } from '../core/text.js';
import { drawArcs, place, motion } from '../brand/arcs.js';
import { aufgang, senken } from '../brand/arc-moves.js';
import { logoBug } from '../brand/bug.js';

const OUT = 7.08;

const GEO = {
  '16x9': { x: 128, top: 300, size: 76, maxW: 1240, mark: 300, attr: 38, role: 30, arcS: 0.56 },
  '9x16': { x: 96, top: 680, size: 76, maxW: 888, mark: 300, attr: 42, role: 34, arcS: 0.62 },
  '1x1': { x: 88, top: 270, size: 60, maxW: 880, mark: 230, attr: 34, role: 28, arcS: 0.48 },
};

export default {
  id: 'zitat',
  no: '09',
  title: 'Zitat',
  file: 'Zitat',
  name: 'Quote',
  category: 'Information',
  notes: 'Quote card. Sentences break at full stops; attribution lands a beat later.',
  duration: 8.16,
  stills: [0.8, 1.8, 3.5, 7.4],
  copy: {
    quote: 'Zuhören und Verantwortung übernehmen.\nIm Gespräch bleiben.\nGemeinsam handeln.',
    name: 'Vorname Nachname',
    role: 'Funktion · Die Mitte',
  },
  draw(ctx, t, fmt, copy) {
    background(ctx, fmt);
    const T = tok(fmt);
    const g = GEO[fmt.id];
    const pl = place(fmt, T.arcKind, g.arcS);
    drawArcs(ctx, T.arcKind, pl, motion(t, { enter: aufgang(T.arcKind, 0.1), exit: senken(T.arcKind, OUT + 0.15), breathe: { amp: 3, period: 6, t0: 1.6 } }));

    const exitAt = (d) => clamp01((t - OUT - d) / 0.48);
    // lines: explicit sentence breaks, wrapped to the measure
    const lines = copy.quote.split('\n').flatMap((p) => wrap(ctx, p, g.maxW, 'demi', g.size));
    const lead = g.size * 1.16;
    const firstBase = g.top + g.size * CAP;

    // the quotation mark, hanging above the first line
    const mq = prog(t, 0.25, 0.84);
    revealLine(ctx, '“', g.x - g.mark * 0.02, g.top - g.size * 0.35, mq, {
      size: g.mark, color: C.red, maskTop: 1.0, maskBottom: 0.1, exit: exitAt(0),
    });

    lines.forEach((l, i) => {
      revealLine(ctx, l, g.x, firstBase + i * lead, prog(t, 0.6 + i * 0.16, 0.84), { size: g.size, exit: exitAt(0.04 + i * 0.04) });
    });
    const ab = firstBase + (lines.length - 1) * lead + g.size * 1.25 + g.attr;
    const aq = prog(t, 0.95 + lines.length * 0.16, 0.8);
    revealLine(ctx, copy.name, g.x, ab, aq, { size: g.attr, exit: exitAt(0.2) });
    revealLine(ctx, copy.role, g.x, ab + g.role * 1.45, prog(t, 1.05 + lines.length * 0.16, 0.8), { size: g.role, weight: 'book', exit: exitAt(0.24) });

    logoBug(ctx, t, fmt, 1.6, { exit: exitAt(0.15) });
  },
};

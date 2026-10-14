// 09 — Zitat (quote card)
// A red guillemet opens the quote, the sentences rise one by one, the
// attribution lands a beat later. Line breaks follow the sentences.

import { background } from '../core/stage.js';
import { prog, clamp01 } from '../core/time.js';
import { E } from '../core/ease.js';
import { tok, scale } from '../formats.js';
import { C } from '../brand/palette.js';
import { revealLine, text, wrap, font, CAP } from '../core/text.js';
import { drawArcs, place, motion } from '../brand/arcs.js';
import { aufgang, senken } from '../brand/arc-moves.js';
import { logoBug, bugGeometry } from '../brand/bug.js';

const OUT = 7.08;

const GEO = {
  '16x9': { markTop: 150, mark: 210, measure: 1240, arcS: 0.56, bug: 'right' },
  '9x16': { markTop: null, mark: 200, measure: 888, arcS: 0.62, bug: 'center' },
  '1x1': { markTop: 120, mark: 170, measure: 904, arcS: 0.48, bug: 'right' },
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
    quote: 'Zuhören und\nVerantwortung übernehmen.\nIm Gespräch bleiben.\nGemeinsam handeln.',
    name: 'Vorname Nachname',
    role: 'Funktion · Die Mitte',
  },
  draw(ctx, t, fmt, copy) {
    background(ctx, fmt);
    const T = tok(fmt);
    const S = scale(fmt);
    const g = GEO[fmt.id];
    const pl = place(fmt, T.arcKind, g.arcS);
    drawArcs(ctx, T.arcKind, pl, motion(t, { enter: aufgang(T.arcKind, 0.1), exit: senken(T.arcKind, OUT + 0.15), breathe: { amp: 3, period: 6, t0: 1.6 } }));

    const exitAt = (d) => clamp01((t - OUT - d) / 0.48);
    const x = T.m;
    const size = S.h2;
    const lines = copy.quote.split('\n').flatMap((p) => wrap(ctx, p, g.measure, 'demi', size));
    const lead = size * 1.16;

    // the guillemet: ink box measured so it sits flush with the column, 45 px above the text
    ctx.save();
    ctx.font = font('demi', g.mark);
    const mm = ctx.measureText('»');
    ctx.restore();
    const mAsc = mm.actualBoundingBoxAscent, mDesc = mm.actualBoundingBoxDescent;
    const bug = bugGeometry(fmt, null, g.bug);
    const markTop = g.markTop ?? bug.y + bug.hm + 90;
    const markBase = markTop + mAsc;
    const markBottom = markBase + mDesc;
    const firstBase = markBottom + 45 + size * CAP;

    const mq = prog(t, 0.25, 0.84);
    const mex = E.leave(exitAt(0));
    if (mq > 0 && mex < 1) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(x - 20, markTop - 2, g.mark * 1.2, markBottom - markTop + 4);
      ctx.clip();
      const travel = markBottom - markTop + 6;
      const dy = (1 - mq) * travel - mex * travel;
      text(ctx, '»', x + Math.min(0, mm.actualBoundingBoxLeft), markBase + dy, { size: g.mark, color: C.red, optical: false });
      ctx.restore();
    }

    lines.forEach((l, i) => {
      revealLine(ctx, l, x, firstBase + i * lead, prog(t, 0.6 + i * 0.16, 0.84), { size, exit: exitAt(0.04 + i * 0.04) });
    });
    const ab = firstBase + (lines.length - 1) * lead + size * 0.9 + S.body * 1.2;
    revealLine(ctx, copy.name, x, ab, prog(t, 0.95 + lines.length * 0.16, 0.8), { size: S.body, exit: exitAt(0.2) });
    revealLine(ctx, copy.role, x, ab + S.small * 1.45, prog(t, 1.05 + lines.length * 0.16, 0.8), { size: S.small, weight: 'book', exit: exitAt(0.24) });

    logoBug(ctx, t, fmt, 1.6, { corner: g.bug === 'right' ? 'right' : undefined, exit: exitAt(0.15) });
  },
};

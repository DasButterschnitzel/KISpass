// 12 — Abspann (closing / end card)
// "Gemeinsam weiter." arrives first, then the sign-off: the band writes the M,
// the name rises, and the whole landscape of arcs closes the frame.
// Ends on a hold — the last frame is the end card.

import { background, withCamera } from '../core/stage.js';
import { prog, lerp } from '../core/time.js';
import { E } from '../core/ease.js';
import { tok } from '../formats.js';
import { revealLine, CAP } from '../core/text.js';
import { lockupHWidth, LOCK_S } from '../brand/logo.js';
import { lockupHReveal, lockupSReveal } from '../brand/lockup-anim.js';
import { drawArcs, place, motion, motifTop } from '../brand/arcs.js';
import { ausDerMitte } from '../brand/arc-moves.js';

const GEO = {
  '16x9': { hm: 168, slogan: 76, arcS: 0.64 },
  '9x16': { hm: 270, slogan: 84, arcS: 0.755 },
  '1x1': { hm: 200, slogan: 64, arcS: 0.609 },
};

export default {
  id: 'abspann',
  no: '12',
  title: 'Abspann',
  file: 'Abspann',
  name: 'Gemeinsam weiter.',
  category: 'Logo',
  notes: 'End card. Ends on a hold — the last frame is the sign-off.',
  duration: 7.2,
  stills: [1.0, 2.2, 3.2, 7.0],
  copy: { slogan: 'Gemeinsam weiter.' },
  draw(ctx, t, fmt, copy) {
    background(ctx, fmt);
    const T = tok(fmt);
    const g = GEO[fmt.id];
    const z = 1 + 0.03 * (1 - prog(t, 0, 6.6, E.glide));
    const cam = { z, fx: fmt.w / 2, fy: fmt.h * 0.42 };

    // 16:9 follows the closing slide of the presentation set (corner arcs);
    // vertical and square close on the full landscape ("das Ganze")
    const kind = T.arcKind;
    const pl = place(fmt, kind, g.arcS);
    withCamera(ctx, { ...cam, fx: kind === 'corner' ? fmt.w : fmt.w / 2, fy: fmt.h }, 0.4, () =>
      drawArcs(ctx, kind, pl, motion(t, { enter: ausDerMitte(kind, 2.3, { dur: 1.9 }) })),
    );

    withCamera(ctx, cam, 1, () => {
      const top = fmt.id === '9x16' ? T.top + 120 : fmt.id === '16x9' ? 250 : T.top + 40;
      const bottom = motifTop(kind, pl);
      if (fmt.id === '16x9') {
        const hm = g.hm;
        const W = lockupHWidth(hm);
        const sloganY = 660;
        const y = 330;
        // slogan arrives centred, then settles below the logo
        const sy = lerp(fmt.h * 0.5 + g.slogan * CAP * 0.5, sloganY, prog(t, 1.25, 0.9, E.glide));
        revealLine(ctx, copy.slogan, fmt.w / 2, sy, prog(t, 0.25, 0.84), { size: g.slogan, align: 'center', qPunct: prog(t, 0.6, 0.6) });
        lockupHReveal(ctx, t, { x: (fmt.w - W) / 2, y, hm }, { draw: [1.45, 1.44], move: [2.85, 0.8], word: [3.15, 0.9] }, { center: fmt.w / 2, drawH: hm * 1.25 });
      } else {
        const hm = g.hm;
        const H = LOCK_S.baseDy * hm;
        const gapS = g.slogan * 1.9;
        const blockH = H + gapS;
        const y = (top + bottom) / 2 - blockH / 2 - hm * 0.1;
        const sloganY = y + H + gapS;
        const sy = lerp((top + bottom) / 2 + g.slogan * CAP * 0.5, sloganY, prog(t, 1.25, 0.9, E.glide));
        revealLine(ctx, copy.slogan, fmt.w / 2, sy, prog(t, 0.25, 0.84), { size: g.slogan, align: 'center', qPunct: prog(t, 0.6, 0.6) });
        lockupSReveal(ctx, t, { cx: fmt.w / 2, y, hm }, { draw: [1.45, 1.44], move: [2.85, 0.8], word: [3.15, 0.9] }, { drawH: hm * 1.12 });
      }
    });
  },
};

// 01 — Logo-Reveal „Die Faltung“
// The band writes the M in one gesture, the M makes room, the name rises,
// the arcs close the composition. 12 beats.

import { background, withCamera } from '../core/stage.js';
import { prog } from '../core/time.js';
import { E } from '../core/ease.js';
import { tok } from '../formats.js';
import { lockupHWidth, LOCK_S } from '../brand/logo.js';
import { lockupHReveal, lockupSReveal } from '../brand/lockup-anim.js';
import { drawArcs, place, motion, motifTop } from '../brand/arcs.js';
import { aufgang } from '../brand/arc-moves.js';

const TM = { draw: [0.2, 1.6], move: [1.72, 0.84], word: [2.08, 0.96] };

export default {
  id: 'logo-reveal',
  no: '01',
  title: 'Logo-Reveal',
  name: 'Die Faltung',
  category: 'Logo',
  notes: 'Sting for openings, channel idents, before speeches. Ends on the exact lockup (hold from 3.4 s).',
  duration: 5.76,
  shutterAt: (t) => (t > 0.15 && t < 1.85 ? 90 : 180), // crisp draw edge, full blur for the glide
  stills: [0.8, 1.3, 2.0, 2.4, 5.5],
  draw(ctx, t, fmt) {
    background(ctx, fmt);
    const T = tok(fmt);
    // slow camera settle: everything arrives 4 % closer and eases back to rest
    const z = 1 + 0.04 * (1 - prog(t, 0, 5.2, E.glide));
    const cam = { z, fx: fmt.w / 2, fy: fmt.h * 0.45 };

    const pl = place(fmt, T.arcKind, T.arcS);
    withCamera(ctx, { ...cam, fx: fmt.w, fy: fmt.h }, 0.5, () =>
      drawArcs(ctx, T.arcKind, pl, motion(t, { enter: aufgang(T.arcKind, 2.2) })),
    );

    withCamera(ctx, cam, 1, () => {
      if (fmt.id === '16x9') {
        const hm = 200;
        const W = lockupHWidth(hm);
        lockupHReveal(ctx, t, { x: (fmt.w - W) / 2, y: 372, hm }, TM, { center: fmt.w / 2, drawH: 336 });
      } else {
        const sq = fmt.id === '1x1';
        const hm = sq ? 236 : 300;
        const H = LOCK_S.baseDy * hm;
        const top = T.top;
        const bottom = motifTop(T.arcKind, pl);
        const cy = (top + bottom) / 2 - (sq ? 4 : 20);
        const y = cy - H / 2 - hm * 0.08;
        lockupSReveal(ctx, t, { cx: fmt.w / 2, y, hm }, TM, { drawH: hm * 1.18, drawY: cy - (hm * 1.18) / 2 });
      }
    });
  },
};

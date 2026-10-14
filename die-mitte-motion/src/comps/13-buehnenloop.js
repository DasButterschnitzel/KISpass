// 13 — Bühnen-Loop (stage / LED wall loop), seamless.
// Calm by design: the logo stays put, the arcs breathe on periods that divide
// the loop, and the two slogans take turns. Frame 0 = frame N (loop-safe).

import { background } from '../core/stage.js';
import { tok } from '../formats.js';
import { layoutBlock, drawBlock } from '../core/layout.js';
import { drawLockupH, drawLockupS, LOCK_S } from '../brand/logo.js';
import { drawArcs, place, motion, motifTop } from '../brand/arcs.js';

const LOOP = 19.2; // 40 beats
const A_IN = 18.3, A_OUT = 8.4, B_IN = 9.3, B_OUT = 17.4;

export default {
  id: 'buehnenloop',
  no: '13',
  title: 'Bühnen-Loop',
  file: 'Buehnen-Loop',
  name: 'Seamless 19,2 s',
  category: 'Loop',
  loop: true,
  notes: 'Seamless loop for LED walls and hall screens (frame 0 = frame N). Calm by design.',
  duration: LOOP,
  stills: [4.0, 8.8, 13.0, 18.7],
  copy: { a1: 'Aus der Mitte.', a2: 'Für das Ganze.', b1: 'Gemeinsam', b2: 'weiter.' },
  draw(ctx, t, fmt, copy) {
    background(ctx, fmt);
    const T = tok(fmt);
    const wide = fmt.id === '16x9';
    const pl = place(fmt, T.arcKind, wide ? 0.84 : T.arcS);
    // two drift cycles per loop; each disc on its own phase
    drawArcs(ctx, T.arcKind, pl, motion(t, { breathe: { amp: 9, period: LOOP / 2 } }));

    const size = wide ? 132 : T.display;
    const x = wide ? T.m : fmt.w / 2;
    const align = wide ? 'left' : 'center';
    let top;
    if (wide) {
      drawLockupH(ctx, T.m, 150, 120);
      top = 420;
    } else {
      const hm = fmt.id === '9x16' ? 220 : 150;
      const y = fmt.id === '9x16' ? T.top + 40 : T.top - 10;
      drawLockupS(ctx, fmt.w / 2, y, hm);
      const lockBottom = y + LOCK_S.baseDy * hm;
      const probe = layoutBlock(ctx, [{ text: copy.a1, size }, { text: copy.a2, size, lead: size * 1.12 }], 0);
      top = (lockBottom + motifTop(T.arcKind, pl)) / 2 - probe.height / 2 + (fmt.id === '9x16' ? 0 : 10);
    }
    const blockA = layoutBlock(ctx, [{ text: copy.a1, size }, { text: copy.a2, size, lead: size * 1.12 }], top);
    const blockB = layoutBlock(ctx, [{ text: copy.b1, size }, { text: copy.b2, size, lead: size * 1.12 }], top);
    const tA = t < A_OUT + 1 ? t + LOOP : t;
    drawBlock(ctx, tA, blockA, {
      x, align,
      enter: { start: A_IN, stagger: 0.12, dur: 0.84 },
      exit: { start: A_OUT + LOOP, stagger: 0.07, dur: 0.5 },
    });
    drawBlock(ctx, t, blockB, {
      x, align,
      enter: { start: B_IN, stagger: 0.12, dur: 0.84 },
      exit: { start: B_OUT, stagger: 0.07, dur: 0.5 },
    });
  },
};


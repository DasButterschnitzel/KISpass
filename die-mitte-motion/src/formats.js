// Formats and layout tokens.
//
// Each format is composed on its own — never a crop of 16:9.
//  16:9  editorial, left-aligned, corner arcs (as in the presentation set)
//  9:16  centred, stacked lockup, bottom arcs, social UI safe zones respected
//  1:1   centred, stacked lockup, bottom arcs, tighter type scale

export const FORMATS = {
  '16x9': { id: '16x9', label: '16:9', w: 1920, h: 1080, orient: 'landscape' },
  '9x16': { id: '9x16', label: '9:16', w: 1080, h: 1920, orient: 'portrait' },
  '1x1': { id: '1x1', label: '1:1', w: 1080, h: 1080, orient: 'square' },
  // stage back wall 6000 × 2500 mm (Designguide p. 06) — only for the stage loop
  '12x5': { id: '12x5', label: '12:5', w: 3840, h: 1600, orient: 'wall' },
};
/** The three delivery formats every piece is composed for. */
export const FORMAT_IDS = ['16x9', '9x16', '1x1'];

// Type scale in px (URW Gothic, cap height = 0.739 × size). Every piece picks
// from these steps — sizes are not fitted per text; a guard only steps a level
// down when custom copy would not fit its space (e.g. a long heading next to the bug).
//   display  slogans, opener words, card headlines
//   h1       info headings (Themen, Abstimmung)
//   h2       list items, quotes, verdicts
//   h3       sublines in Demi
//   body     Book text; on 1080-wide phone formats never below 36 px
// Line height: display 1.10, text 1.3.
export const SCALE = {
  '12x5': { display: 232, h1: 176, h2: 136, h3: 104, body: 68, small: 56, label: 48 },
  '16x9': { display: 144, h1: 108, h2: 84, h3: 64, body: 42, small: 34, label: 30 },
  '9x16': { display: 112, h1: 96, h2: 80, h3: 60, body: 44, small: 38, label: 40 },
  '1x1': { display: 100, h1: 84, h2: 68, h3: 54, body: 40, small: 36, label: 38 },
};

export const TOKENS = {
  '12x5': { m: 256, top: 200, bottomSafe: 480, bugM: 80, arcKind: 'corner', arcS: 1.0 },
  '16x9': {
    m: 128, // side margin (title-safe at 1920 is 96)
    top: 120,
    bottomSafe: 96,
    bugM: 52, // M height of the small logo bug
    arcKind: 'corner',
    arcS: 0.64, // corner motif scale (presentation title slide)
  },
  '9x16': {
    m: 96,
    top: 250, // Stories/Reels top UI — nothing above this line
    bugTop: 330, // logo bug sits below the UI line, grouped with the content
    bottomSafe: 400, // reply bar / captions
    bugM: 60,
    arcKind: 'bottom',
    arcS: 0.755, // Story-9x16 production layout
  },
  '1x1': {
    m: 88,
    top: 96,
    bottomSafe: 88,
    bugM: 48,
    arcKind: 'bottom',
    arcS: 0.609, // Quadrat production layout
  },
};

export const fmtOf = (id) => FORMATS[id];
export const tok = (fmt) => TOKENS[fmt.id];
export const scale = (fmt) => SCALE[fmt.id];

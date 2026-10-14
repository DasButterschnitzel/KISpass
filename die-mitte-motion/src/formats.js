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
};
export const FORMAT_IDS = Object.keys(FORMATS);

// Type sizes in px (URW Gothic). Line height: display 1.08, text 1.3.
export const TOKENS = {
  '16x9': {
    m: 128, // side margin (title-safe at 1920 is 96)
    top: 120,
    bottomSafe: 96,
    display: 120,
    h1: 92,
    h2: 58,
    body: 40,
    small: 30,
    label: 22,
    bugM: 52, // M height of the small logo bug
    arcKind: 'corner',
    arcS: 0.64, // corner motif scale (presentation title slide)
  },
  '9x16': {
    m: 96,
    top: 250, // Stories/Reels top UI
    bottomSafe: 400, // reply bar / captions
    display: 104,
    h1: 84,
    h2: 54,
    body: 40,
    small: 30,
    label: 22,
    bugM: 60,
    arcKind: 'bottom',
    arcS: 0.755, // Story-9x16 production layout
  },
  '1x1': {
    m: 88,
    top: 96,
    bottomSafe: 88,
    display: 92,
    h1: 72,
    h2: 48,
    body: 34,
    small: 26,
    label: 20,
    bugM: 48,
    arcKind: 'bottom',
    arcS: 0.609, // Quadrat production layout
  },
};

export const fmtOf = (id) => FORMATS[id];
export const tok = (fmt) => TOKENS[fmt.id];

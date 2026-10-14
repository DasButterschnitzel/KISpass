// Brand palette (Designguide p. 03, Farbpalette.json). sRGB.
//
// Silver is the stage. Black carries type. Red and gold are accents and only
// ever appear together with black as the band (black → red → gold).
// Faltenrot is reserved for the inner fold of the M — never used elsewhere.

export const C = {
  silver: '#E2E5E7', // Silber — dominant surface
  mgray: '#BCC1C5', // Mittelgrau — arcs, quiet structure
  lgray: '#D2D6D9', // Bogen-Hellgrau — second arc tone (from Bogenmotiv.svg)
  black: '#1C1D20', // Schwarz — type, band
  red: '#D92C32', // Rot — accent, band
  gold: '#F4C526', // Goldgelb — accent, band
  fold: '#A21B25', // Faltenrot — logo fold ONLY
};

export const PALETTE_DOCS = [
  { key: 'silver', de: 'Silber', hex: C.silver, role: 'Dominant surface — at least 70 % of every frame.' },
  { key: 'mgray', de: 'Mittelgrau', hex: C.mgray, role: 'Arcs, quiet structure, panels on footage.' },
  { key: 'black', de: 'Schwarz', hex: C.black, role: 'All typography. First stripe of the band.' },
  { key: 'red', de: 'Rot', hex: C.red, role: 'Accent: band, active numbers, quote marks.' },
  { key: 'gold', de: 'Goldgelb', hex: C.gold, role: 'Accent: band, data highlights.' },
  { key: 'fold', de: 'Faltenrot', hex: C.fold, role: 'Inner fold of the M only. Never as a surface.' },
];

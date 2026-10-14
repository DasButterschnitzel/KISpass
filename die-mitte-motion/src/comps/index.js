// Composition registry — order = numbering in the package.
import showreel from './00-showreel.js';
import logoReveal from './01-logo-reveal.js';
import opener from './02-opener.js';
import sloganMitte from './03-slogan-mitte.js';
import sloganWeiter from './04-slogan-weiter.js';
import titelkarte from './05-titelkarte.js';
import bauchbinde from './06-bauchbinde.js';
import themen from './07-themen.js';
import abstimmung from './08-abstimmung.js';
import zitat from './09-zitat.js';
import { aufgang, ecke, silber, demo } from './10-uebergaenge.js';
import parteitag from './11-parteitag.js';
import abspann from './12-abspann.js';
import buehnenloop from './13-buehnenloop.js';

export const COMPS = [showreel, logoReveal, opener, sloganMitte, sloganWeiter, titelkarte, bauchbinde, themen, abstimmung, zitat, demo, aufgang, ecke, silber, parteitag, abspann, buehnenloop];

export const compById = (id) => COMPS.find((c) => c.id === id || c.no === id);
export const durationOf = (comp, fmt) =>
  typeof comp.duration === 'object' ? comp.duration[fmt.id] : comp.duration;

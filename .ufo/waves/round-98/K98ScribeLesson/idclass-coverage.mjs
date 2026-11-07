#!/usr/bin/env node
/* idclass-coverage.mjs <counter.mjs> <plan.md>
 *
 * Q92 command form: a frozen counter over a character-class rule draws every class the opposing
 * reader's class differs on, and the plan lists the drawn classes.
 *
 * Parses the counter's `const PADS = [ ['NAME', '<literal>'], … ];` grid, decodes the literals to
 * code points, and requires one drawn member for each witness class below (POSIX `space` minus
 * `blank`, ECMAScript WhiteSpace/LineTerminator minus `blank`, Unicode White_Space, Cf format
 * characters, and the combined-pad shapes). Then requires the plan text to name each class.
 *
 *   IDCLASS_COVERAGE: CLEAN pads=<n> witnesses=<m>     exit 0
 *   IDCLASS_COVERAGE: MISSING [names…]                  exit 1  (counter does not draw them)
 *   IDCLASS_COVERAGE: PLAN_MISSING [names…]             exit 1  (plan does not list them)
 *   IDCLASS_COVERAGE: NOPADS <path>                     exit 2  (no PADS grid to score)
 */
import { readFileSync } from 'node:fs';

const [COUNTER, PLAN] = process.argv.slice(2);
if (!COUNTER || !PLAN) { console.error('usage: idclass-coverage.mjs <counter.mjs> <plan.md>'); process.exit(2); }

/* witness name -> [code points it draws, plan token it must appear as] */
const WITNESSES = [
  ['none', [], 'none'], ['SP', [0x20], 'SP'], ['2SP', [0x20, 0x20], '2SP'],
  ['TAB', [0x09], 'TAB'], ['SPTAB', [0x20, 0x09], 'SP TAB'], ['TABSP', [0x09, 0x20], 'TAB SP'],
  ['VT', [0x0b], 'VT'], ['FF', [0x0c], 'FF'], ['CR', [0x0d], 'CR'],
  ['TABFF', [0x09, 0x0c], 'TAB FF'],
  ['NEL', [0x85], 'U+0085'], ['NBSP', [0xa0], 'NBSP'],
  ['OGHAM', [0x1680], 'U+1680'], ['MVS', [0x180e], 'U+180E'],
  ['ENQUAD', [0x2000], 'U+2000'], ['ENSP', [0x2002], 'U+2002'], ['EMSP', [0x2003], 'U+2003'],
  ['FIGSP', [0x2007], 'U+2007'], ['THINSP', [0x2009], 'U+2009'], ['HAIRSP', [0x200a], 'U+200A'],
  ['ZWSP', [0x200b], 'U+200B'], ['ZWNJ', [0x200c], 'U+200C'], ['ZWJ', [0x200d], 'U+200D'],
  ['LS', [0x2028], 'U+2028'], ['PS', [0x2029], 'U+2029'],
  ['NNBSP', [0x202f], 'U+202F'], ['MMSP', [0x205f], 'U+205F'], ['WJ', [0x2060], 'U+2060'],
  ['IDSP', [0x3000], 'U+3000'], ['BOM', [0xfeff], 'U+FEFF'],
  ['SPNBSP', [0x20, 0xa0], 'SP NBSP'], ['NBSPSP', [0xa0, 0x20], 'NBSP SP'],
];

const text = readFileSync(COUNTER, 'utf8');
const grid = /const PADS = \[([\s\S]*?)\n\];/.exec(text);
if (!grid) { console.log(`IDCLASS_COVERAGE: NOPADS ${COUNTER}`); process.exit(2); }
const decode = (lit) => lit
  .replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
  .replace(/\\v/g, '\v').replace(/\\f/g, '\f').replace(/\\r/g, '\r').replace(/\\t/g, '\t').replace(/\\n/g, '\n');
const pads = [...grid[1].matchAll(/\[\s*'([A-Za-z0-9]+)',\s*'((?:[^'\\]|\\.)*)'\s*\]/g)]
  .map((m) => ({ name: m[1], cps: [...decode(m[2])].map((c) => c.codePointAt(0)) }));
if (pads.length === 0) { console.log(`IDCLASS_COVERAGE: NOPADS ${COUNTER} (grid parsed empty)`); process.exit(2); }

const missingDraw = [];
for (const [name, cps] of WITNESSES) {
  const ok = cps.length === 0
    ? pads.some((p) => p.cps.length === 0)
    : pads.some((p) => cps.every((cp) => p.cps.includes(cp)));
  if (!ok) missingDraw.push(name);
}
if (missingDraw.length) {
  console.log(`IDCLASS_COVERAGE: MISSING [${missingDraw.join(' ')}] pads=${pads.length}`);
  process.exit(1);
}

const planText = readFileSync(PLAN, 'utf8');
const missingPlan = WITNESSES.filter(([, , token]) => !planText.includes(token)).map(([name]) => name);
if (missingPlan.length) {
  console.log(`IDCLASS_COVERAGE: PLAN_MISSING [${missingPlan.join(' ')}] plan=${PLAN}`);
  process.exit(1);
}
console.log(`IDCLASS_COVERAGE: CLEAN pads=${pads.length} witnesses=${WITNESSES.length} counter=${COUNTER} plan=${PLAN}`);

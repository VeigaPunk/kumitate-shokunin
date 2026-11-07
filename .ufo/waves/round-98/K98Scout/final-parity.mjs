import { readFileSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const HDR = '| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |';
const SEP = '|---|---|---|---|---|---|---|---|---|---|---|';
const CENSUS = '/home/vgpnk/Projects/shokunin/scripts/sources-census.sh';

const PADS = [
  ['none', ''], ['SP', ' '], ['TAB', '\t'], ['VT', '\v'], ['FF', '\f'], ['CR', '\r'],
  ['NBSP', '\u00a0'], ['U+2003', '\u2003'], ['U+2028', '\u2028'], ['U+3000', '\u3000'], ['U+FEFF', '\ufeff'],
];

const dir = mkdtempSync(join(tmpdir(), 'final-'));
const file = join(dir, 'SOURCES.md');
let n = 0;
const lines = ['## Registry', '', HDR, SEP];
const ids = [];
for (const [name, p] of PADS) {
  n += 1; const id = `S${String(n).padStart(3, '0')}`;
  lines.push(`|${p}${id}${p}| https://example.com/${'d'.repeat(39)}${n} | docs | A | scope | anch | teaches | mined | 2026-01-01 | 90d | — |`);
  ids.push({ pad: name, id, fields: 13 });
}
lines.push('', '## Leads (unopened)');
for (const [name, p] of PADS) {
  n += 1; const id = `S${String(n).padStart(3, '0')}`;
  lines.push(`|${p}${id}${p}| https://example.com/${'e'.repeat(39)}${n} | docs | A | scope | anch | teaches | mined | 2026-01-01 | 90d | — |`);
  ids.push({ pad: name, id, fields: 13, outside: true });
}
writeFileSync(file, lines.join('\n') + '\n', 'utf8');

let out = '';
try { out = execFileSync('bash', [CENSUS, 'validate', '--file', file], { encoding: 'utf8' }); }
catch (e) { out = e.stdout ?? ''; }
const w03 = [], e12 = [], e01 = [], e02 = [];
for (const ln of out.split('\n')) {
  if (!ln) continue;
  const parts = ln.split('\t');
  const code = parts[1];
  const rest = parts.slice(2).join('\t');
  if (code === 'W03') w03.push(rest.replace(/ mined but unused$/, ''));
  else if (code === 'E12') e12.push(rest.replace(/ row outside Registry section$/, ''));
  else if (code === 'E01') e01.push(rest.replace(/ fields=\d+$/, ''));
  else if (code === 'E02') e02.push(rest);
}
const DECL = w03.filter((id) => /^S[0-9]{3,}$/.test(id));
const OUT = e12.filter((id) => /^S[0-9]{3,}$/.test(id));
const MALF = e01.filter((id) => /^S[0-9]{3,}$/.test(id));

const { declaredPins } = await import('./base-parity-module.mjs');
const { declaredPins: declaredPinsR98 } = await import('./r98-parity-module.mjs');
const text = readFileSync(file, 'utf8');
const malB = [], outB = [];
const pinsB = declaredPins(text, malB, outB);
const malR = [], outR = [];
const pinsR = declaredPinsR98(text, malR, outR);

console.log(JSON.stringify({
  census: { DECL, OUT, MALF, w03_all: w03, e12_all: e12, e01_all: e01, e02_all: e02 },
  BASE: { declaredPins: [...pinsB].sort(), malformedRows: malB, outsideRows: outB },
  R98: { declaredPins: [...pinsR].sort(), malformedRows: malR, outsideRows: outR },
}, null, 1));
rmSync(dir, { recursive: true, force: true });

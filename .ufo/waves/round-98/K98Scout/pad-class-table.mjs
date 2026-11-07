import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const BASE_RE = /^ {0,3}\|\s*S\d{3,}\s*\|/;
const R98_RE  = /^ {0,3}\|[ \t]*S\d{3,}[ \t]*\|/;
const CENSUS_ID_TRIM = (s) => s.replace(/^[ \t]+|[ \t]+$/g, '');   // gawk trim() in sources-census.sh:581
const JS_TRIM = (s) => s.trim();                                    // JS trim()

const PADS = [
  ['none', ''], ['SP', ' '], ['TAB', '\t'], ['SP+SP', '  '], ['SP+TAB', ' \t'],
  ['VT', '\v'], ['FF', '\f'], ['CR', '\r'], ['NEL U+0085', '\u0085'],
  ['NBSP U+00A0', '\u00a0'], ['U+1680', '\u1680'], ['U+180E', '\u180e'],
  ['U+2000', '\u2000'], ['U+2003', '\u2003'], ['U+2007', '\u2007'],
  ['U+2009', '\u2009'], ['U+200A', '\u200a'], ['U+200B', '\u200b'],
  ['U+200C', '\u200c'], ['U+200D', '\u200d'], ['U+2028', '\u2028'],
  ['U+2029', '\u2029'], ['U+202F', '\u202f'], ['U+205F', '\u205f'],
  ['U+2060', '\u2060'], ['U+3000', '\u3000'], ['U+FEFF', '\ufeff'],
];

const HDR = '| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |';
const SEP = '|---|---|---|---|---|---|---|---|---|---|---|';
const CENSUS = '/home/vgpnk/Projects/shokunin/scripts/sources-census.sh';

const dir = mkdtempSync(join(tmpdir(), 'padclass-'));
const file = join(dir, 'SOURCES.md');
let n = 0;
const lines = ['## Registry', '', HDR, SEP];
const meta = [];
for (const [name, p] of PADS) {
  n += 1; const id13 = `S${String(n).padStart(3, '0')}`;
  lines.push(`|${p}${id13}${p}| src | docs | A | scope | anch | teaches | mined | 2026-01-01 | 90d | - |`);
  meta.push({ pad: name, id: id13, fields: 13, line: lines.length });
  n += 1; const id12 = `S${String(n).padStart(3, '0')}`;
  lines.push(`|${p}${id12}${p}| src | docs | A | scope | anch | teaches | mined | 2026-01-01 | 90d |`);
  meta.push({ pad: name, id: id12, fields: 12, line: lines.length });
}
lines.push('', '## Leads (unopened)');
for (const [name, p] of PADS) {
  n += 1; const id = `S${String(n).padStart(3, '0')}`;
  lines.push(`|${p}${id}${p}| src | docs | A | scope | anch | teaches | mined | 2026-01-01 | 90d | - |`);
  meta.push({ pad: name, id, fields: 13, outside: true, line: lines.length });
}
writeFileSync(file, lines.join('\n') + '\n', 'utf8');

let out = '';
try { out = execFileSync('bash', [CENSUS, 'validate', '--file', file], { encoding: 'utf8' }); }
catch (e) { out = e.stdout ?? ''; }

const byId = new Map();
for (const ln of out.split('\n')) {
  if (!ln) continue;
  const [lane, code, ...rest] = ln.split('\t');
  const id = rest.join('\t').replace(/ fields=\d+$/, '').replace(/ row outside Registry section$/, '');
  if (!byId.has(id)) byId.set(id, []);
  byId.get(id).push(code);
}
const norm = (s) => s.replace(/^[ \t]+|[ \t]+$/g, '');
const rows = [];
for (const m of meta) {
  const raw = lines[m.line - 1];
  const idCell = raw.replace(/^ {0,3}\|/, '').split('|')[0];
  const censusCodes = (byId.get(norm(idCell)) ?? []).join(',');
  const censusId = norm(idCell);
  rows.push({
    pad: m.pad, id: m.id, fields: m.fields, outside: !!m.outside,
    BASE_row: BASE_RE.test(raw), R98_row: R98_RE.test(raw),
    census_codes: censusCodes,
    census_id_valid: /^S[0-9]{3,}$/.test(censusId),
    js_trim_id: JS_TRIM(idCell),
    js_trim_eq_census: JS_TRIM(idCell) === censusId,
  });
}
console.log(JSON.stringify(rows, null, 1));
rmSync(dir, { recursive: true, force: true });

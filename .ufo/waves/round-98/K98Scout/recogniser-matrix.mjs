import { readFileSync } from 'node:fs';

// Every SOURCES row recogniser found in /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/*.mjs
const RECOGNISERS = [
  { file: 'scripts/round-gate.mjs', line: 410, symbol: 'SOURCES_ROW_RE', re: /^ {0,3}\|\s*S\d{3,}\s*\|/, kind: 'row' },
  { file: 'scripts/cite-sources.mjs', line: 36, symbol: 'registryIds()', re: /^ {0,3}\|\s*(S[0-9]{3,})\s*\|/, kind: 'row+id' },
  { file: 'scripts/source-capture.mjs', line: 157, symbol: 'SOURCES row scan', re: /^\s*\|\s*(S[0-9]{3,})\s*\|/, kind: 'row+id' },
  { file: 'scripts/sources-check.mjs', line: 234, symbol: 'ROW_OUTSIDE_REGISTRY', re: /^\|[ \t]*S\d{3,}[ \t]*\|/, kind: 'row' },
  { file: 'scripts/sources-check.mjs', line: 246, symbol: 'validId', re: /^S\d{3,}$/, kind: 'id' },
  { file: 'scripts/source-dupes.mjs', line: 79, symbol: 'SID', re: /^S[0-9]{3,}$/, kind: 'id' },
  { file: 'scripts/sources-check.mjs', line: 943, symbol: 'parity rows grep', re: /^\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|/, kind: 'row (POSIX space)' },
  { file: 'scripts/sources-check.mjs', line: 944, symbol: 'parity malformed awk', re: /^\|[[:space:]]*S[0-9][0-9][0-9]+[[:space:]]*\|/, kind: 'row (POSIX space)' },
  { file: 'scripts/sources-check.mjs', line: 945, symbol: 'parity duplicates awk', re: /^\|[[:space:]]*S[0-9][0-9][0-9]+[[:space:]]*\|/, kind: 'row (POSIX space)' },
];

const CENSUS_E12 = /^\|[ \t]*S[0-9]{3,}[ \t]*\|/;          // sources-census.sh:619 (gawk, blank-only)
const CENSUS_E02 = /^S[0-9]{3,}$/;                          // sources-census.sh:637/640 (gawk, blank-only trim)

const PADS = [
  ['none', ''], ['SP', ' '], ['TAB', '\t'], ['SP+SP', '  '], ['SP+TAB', ' \t'], ['TAB+SP', '\t '],
  ['VT', '\v'], ['FF', '\f'], ['CR', '\r'], ['NEL U+0085', '\u0085'],
  ['NBSP U+00A0', '\u00a0'], ['U+1680', '\u1680'], ['U+180E', '\u180e'],
  ['U+2000', '\u2000'], ['U+2003', '\u2003'], ['U+2007', '\u2007'],
  ['U+2009', '\u2009'], ['U+200A', '\u200a'], ['U+200B', '\u200b'],
  ['U+200C', '\u200c'], ['U+200D', '\u200d'], ['U+2028', '\u2028'],
  ['U+2029', '\u2029'], ['U+202F', '\u202f'], ['U+205F', '\u205f'],
  ['U+2060', '\u2060'], ['U+3000', '\u3000'], ['U+FEFF', '\ufeff'],
];

// ECMAScript \s members (White_Space + LineTerminator)
const ES_WS = new Set([...'\t\n\v\f\r \u00a0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u2028\u2029\u202f\u205f\u3000\ufeff']);
const POSIX_SPACE = new Set([...' \t\n\v\f\r']);

const hdr = '| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |';
const sep = '|---|---|---|---|---|---|---|---|---|---|---|';

const out = [];
for (const [padName, p] of PADS) {
  const row = `|${p}S123${p}| src | docs | A | scope | anch | teaches | mined | 2026-01-01 | 90d | - |`;
  const cell = row.replace(/^ {0,3}\|/, '').split('|')[0];
  const censusTrim = cell.replace(/^[ \t]+|[ \t]+$/g, '');
  const rec = { pad: padName };
  for (const r of RECOGNISERS) {
    if (r.kind === 'id') continue;
    rec[`${r.file.split('/')[1]}:${r.line}`] = r.re.test(row);
  }
  rec['census:E12(row)'] = CENSUS_E12.test(row);
  rec['census:E02(id)'] = CENSUS_E02.test(censusTrim);
  rec['js_trim==census_trim'] = cell.trim() === censusTrim;
  out.push(rec);
}

const cols = Object.keys(out[0]).filter((k) => k !== 'pad');
console.log('| pad | ' + cols.join(' | ') + ' |');
console.log('|' + cols.map(() => '---').join('|') + '|');
for (const r of out) {
  console.log('| ' + r.pad + ' | ' + cols.map((c) => (r[c] ? 'Y' : '.' )).join(' | ') + ' |');
}

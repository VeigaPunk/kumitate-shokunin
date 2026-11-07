import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { writeFileSync } from 'node:fs';

// Byte-exact reconstruction of probe95-c1.mjs fixture constants (copied verbatim).
const sha = (buf) => createHash('sha256').update(buf).digest('hex');
const hex = (seed) => sha(`kumitate-r95-${seed}`).slice(0, 40);
const SEEDS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
const PIN = Object.fromEntries(SEEDS.map((s) => [s, hex(s)]));
const url = (p) => `https://github.com/o/r/blob/${p}/x.ts`;
const cells = (id, src, scope, teaches, status, tail = ' 2026-11-07 | 30d | — |') => `| ${id} | ${src} | code | A | ${scope} | anchor | ${teaches} | ${status} |${tail}`;
const SOURCES = [
  '# SOURCES — fixture', '',
  `Prose mention, not a registry row: ${url(PIN.I)}`, '',
  '## Registry', '',
  '| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |',
  '|---|---|---|---|---|---|---|---|---|---|---|',
  cells('S001', `x.ts — ${url(PIN.A)}`, 'scope', 'teaches', 'mined'),
  cells('S002', `y.ts — ${url(PIN.B)}`, 'scope a | scope b', 'teaches', 'rejected'),
  cells('S003', `z.ts — ${url(PIN.C)}`, 'scope', 'a \\| b', 'mined'),
  cells('S004', `w.ts — ${url(PIN.D)}`, 'scope', 'teaches', 'mined', ' 2026-11-07 | 30d |'),
  cells('S005', `v.ts — ${url(PIN.E)}`, 'scope', 'teaches', 'rejected'),
  `   ${cells('S006', `u.ts — ${url(PIN.F)}`, 'scope', 'teaches', 'queued')}`,
  cells('S007', `t.ts — ${url(PIN.G)}`, 'scope', 'teaches', 'mined', ' 2026-11-07 | 30d | — | extra |'),
  cells('S008', `s.ts — https://github.com/o/r/blob/${PIN.H}/s.ts?plain=1`, 'scope', 'superseded the rejected draft', 'mined'),
  '',
  `    ${cells('S010', `r.ts — ${url(PIN.J)}`, 'scope', 'teaches', 'mined')}`,
  '',
].join('\n');

writeFileSync('SOURCES-fixture.md', SOURCES);
writeFileSync('SOURCES-fixture-crlf.md', SOURCES.replace(/\n/g, '\r\n'));

const ROW_RE = /^ {0,3}\|\s*S\d{3,}\s*\|/;
const URL_RE = /https?:\/\/[^\s|)`'"<>]+/g;
const PIN_RE = /^[0-9a-f]{40}$/;
const SEG_RE = /[/?#]/;
const idOf = (f) => (f[1] ?? '').trim();
const pinsFrom = (line) => {
  const s = new Set();
  for (const m of line.matchAll(URL_RE)) for (const seg of m[0].split(SEG_RE)) if (PIN_RE.test(seg)) s.add(seg);
  return [...s];
};

const report = (label, text) => {
  console.log(`== ${label} ==`);
  for (const line of text.split('\n')) {
    if (!ROW_RE.test(line)) continue;
    const f = line.split('|');
    const status = (f[8] ?? '').trim();
    const baseDeclares = status.toLowerCase() !== 'rejected' ? pinsFrom(line) : [];
    console.log(`${idOf(f)} NF=${f.length} split8=${JSON.stringify(status)} BASE_declares=${baseDeclares.length ? baseDeclares.map((p) => Object.values(PIN).indexOf(p) >= 0 ? `PIN.${SEEDS[Object.values(PIN).indexOf(p)]}` : p).join(',') : 'none'}`);
  }
};
report('LF', SOURCES);
report('CRLF', SOURCES.replace(/\n/g, '\r\n'));

// census awk, identical to the frozen probe invocation
const aw = spawnSync('awk', ['-F|', '/^ {0,3}\\|[[:space:]]*S[0-9][0-9][0-9]+[[:space:]]*\\|/ && NF!=13 {i=$2; gsub(/[[:space:]]/,"",i); print i}', 'SOURCES-fixture.md'], { encoding: 'utf8' });
console.log('census LF ids:', JSON.stringify(aw.stdout.split('\n').filter(Boolean)));
const aw2 = spawnSync('awk', ['-F|', '/^ {0,3}\\|[[:space:]]*S[0-9][0-9][0-9]+[[:space:]]*\\|/ && NF!=13 {i=$2; gsub(/[[:space:]]/,"",i); print i}', 'SOURCES-fixture-crlf.md'], { encoding: 'utf8' });
console.log('census CRLF ids:', JSON.stringify(aw2.stdout.split('\n').filter(Boolean)));

// CRLF split('|') semantics on one well-formed row
const crlfRow = `| S001 | x | code | A | scope | anchor | teaches | mined | 2026-11-07 | 30d | — |\r`;
console.log('CRLF row NF =', crlfRow.split('|').length, 'split8 =', JSON.stringify((crlfRow.split('|')[8] ?? '').trim()));

// expected candidate outcome per row: declares only when NF==13 && status!=rejected
console.log('EXPECTED candidate declared rows: S001(A) S006(F) S008(H); malformed [S002,S003,S004,S007]');

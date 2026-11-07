#!/usr/bin/env node
// reader-sweep.mjs — K100ScribeLesson measurement: the lane's SOURCES row readers vs the census row gate.
//
// For every drawn row (one row per fixture file, inside `## Registry`), it asks:
//   census        — sources-census.sh validate: row is a valid id (E06 id == probe), an invalid id (E02), or not a row
//   cite          — scripts/cite-sources.mjs BASE bytes: CLEAN (reads probe as registry id) / DRIFT ghost / other
//   capture       — scripts/source-capture.mjs BASE bytes: probe reported `uncaptured` (recognised) / not
//   sources-check — scripts/sources-check.mjs (lane HEAD bytes): counts.rows==1 (valid id) / ID_FORM / not a row
// "disagree" = reader reads the id as a registry id exactly when the census does not read it as a valid id,
// or the reverse. Usage: node reader-sweep.mjs <lane-dir> <work-dir> <receipt>
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const [LANE, WORK0, OUT] = process.argv.slice(2);
if (!LANE || !WORK0 || !OUT) {
  process.stderr.write('usage: reader-sweep.mjs <lane-dir> <work-dir> <receipt>\n');
  process.exit(64);
}
const LANE_ = resolve(LANE);
const WORK = resolve(WORK0);
const CENSUS = '/home/vgpnk/Projects/shokunin/scripts/sources-census.sh';
const TODAY = '2026-11-07';
const sha = (b) => createHash('sha256').update(b).digest('hex');
const BASE_REV = '5e2f9856271525760ade3b08892f6df7601fa689';

rmSync(WORK, { recursive: true, force: true });
mkdirSync(WORK, { recursive: true });
const tool = (rel) => spawnSync('git', ['-C', LANE_, 'show', `${BASE_REV}:${rel}`], { maxBuffer: 1 << 26 }).stdout;
const citeSrc = tool('scripts/cite-sources.mjs');
const capSrc = tool('scripts/source-capture.mjs');
const schkSrc = readFileSync(join(LANE_, 'scripts', 'sources-check.mjs'));
const toolDir = join(WORK, 'tools');
mkdirSync(toolDir, { recursive: true });
writeFileSync(join(toolDir, 'cite.mjs'), citeSrc);
writeFileSync(join(toolDir, 'capture.mjs'), capSrc);
writeFileSync(join(toolDir, 'sources-check.mjs'), schkSrc);
// L1 reference rule R100 (ctl-positive), byte-checked against controls/controls-sha256.txt at run start
const ctlDir = join(WORK, 'ctl');
const gen = spawnSync('python3', [join(LANE_, '.ufo', 'waves', 'round-100', 'probe', 'make-controls100.py'), ctlDir], { encoding: 'utf8' });
if (gen.status !== 0) { process.stderr.write(`make-controls100.py exit=${gen.status}\n`); process.exit(2); }
const citeRefSrc = readFileSync(join(ctlDir, 'ctl-positive', 'cite-sources.mjs'));
const capRefSrc = readFileSync(join(ctlDir, 'ctl-positive', 'source-capture.mjs'));
writeFileSync(join(toolDir, 'cite-ref.mjs'), citeRefSrc);
writeFileSync(join(toolDir, 'capture-ref.mjs'), capRefSrc);

// ---------------------------------------------------------------- battery (classes mirror probe100-c1.mjs)
const NONBLANK = {
  VT: '\v', FF: '\f', CR: '\r', NEL: '\u0085', NBSP: '\u00a0', OGHAM: '\u1680', MVS: '\u180e', ENSP: '\u2002',
  EMSP: '\u2003', THINSP: '\u2009', ZWSP: '\u200b', LS: '\u2028', PS: '\u2029', NNBSP: '\u202f', MMSP: '\u205f',
  WJ: '\u2060', IDSP: '\u3000', BOM: '\ufeff', SHY: '\u00ad', HFILL: '\u3164', SOH: '\u0001', US: '\u001f',
};
const INDENT_OK = ['', ' ', '  ', '   '];
const INDENT_BAD = {
  SP4: '    ', SP5: '     ', SP6: '      ', SP3TAB: '   \t', TAB3SP: '\t   ', TAB: '\t', SPTAB: ' \t', TABSP: '\t ',
  NBSP: '\u00a0', IDSP: '\u3000', VT: '\v', FF: '\f', BOM: '\ufeff', EMSP: '\u2003', NEL: '\u0085',
};
const BREAKS = { CR: '\r', LS: '\u2028', PS: '\u2029', NEL: '\u0085', VT: '\v', FF: '\f' };
const BLANK = [' ', '\t', ' \t', '\t ', '  ', '\t\t', '   \t '];

const rows = [];
let next = 200;
const fresh = () => { next += 1; return String(next); };
const rowText = (idCell, d) => `|${idCell}| Fixture ${d} — https://example.invalid/sweep/${d} | docs | Z${d} | probe-${d} `
  + '| line 1 | fixture row | queued | 2026-01-01 | 90d | — |';
const add = (cls, d, idCell, prefix = '', suffix = '') => rows.push({ cls, probe: `S${d}`, line: prefix + rowText(idCell, d) + suffix });

for (let i = 0; i < 8; i += 1) { const d = fresh(); add('A-clean', d, ` S${d} `); }
for (let i = 0; i < 16; i += 1) {
  const d = fresh();
  const lead = i % 4 === 0 ? '' : BLANK[i % BLANK.length].repeat(1 + (i % 3)).slice(0, 4);
  const trail = i % 5 === 0 ? '' : BLANK[(i + 2) % BLANK.length].repeat(1 + (i % 4)).slice(0, 4);
  add('B-blank', d, `${lead}S${d}${trail}`);
}
{ const d = fresh(); add('B-blank8', d, `\t \t \t \t S${d} \t \t \t \t`); }
for (const [name, ch] of Object.entries(NONBLANK)) {
  for (const side of ['lead', 'trail', 'both']) {
    const d = fresh();
    const unit = ch.repeat(side === 'both' ? 2 : 1);
    add(`C-pad-${name}-${side}`, d, side === 'lead' ? `${unit}S${d} ` : side === 'trail' ? ` S${d}${unit}` : `${unit}S${d}${unit}`);
  }
}
for (const ind of INDENT_OK) { const d = fresh(); add(`D-indent-sp${ind.length}`, d, ` S${d} `, ind); }
for (const [name, ind] of Object.entries(INDENT_BAD)) { const d = fresh(); add(`D-indent-${name}`, d, ` S${d} `, ind); }
for (const [name, br] of Object.entries(BREAKS)) {
  for (const ctx of ['', 'note: see below']) { const d = fresh(); add(`E-break-${name}-${ctx ? 'text' : 'bare'}`, d, ` S${d} `, ctx + br); }
}
for (let i = 0; i < 4; i += 1) { const d = fresh(); add('F-crlf', d, ` S${d} `, '', '\r'); }
{
  const fw = (s) => [...s].map((c) => String.fromCharCode(0xff10 + Number(c))).join('');
  const ar = (s) => [...s].map((c) => String.fromCharCode(0x0660 + Number(c))).join('');
  let d = fresh(); add('G-lower', d, ` s${d} `);
  d = fresh(); add('G-trailing-letter', d, ` S${d}x `);
  d = fresh(); add('G-leading-letter', d, ` xS${d} `);
  d = fresh(); add('G-dash', d, ` S-${d} `);
  d = fresh(); add('G-inner-space', d, ` S ${d} `);
  d = fresh(); add('G-double-S', d, ` SS${d} `);
  d = fresh(); add('G-fullwidth', d, ` S${fw(d)} `);
  d = fresh(); add('G-arabic-indic', d, ` S${ar(d)} `);
  d = fresh(); { const d2 = fresh(); add('G-two-ids', d, ` S${d} S${d2} `); }
}

const head = '# Sources — sweep\n\nIntro prose.\n\n## Registry\n\n'
  + '| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |\n'
  + '|---|---|---|---|---|---|---|---|---|---|---|\n';
const tail = '\n\n## Search log\n\n- sweep\n';
const env = { ...process.env, TMPDIR: WORK };

function runRow(r, i) {
  const fx = join(WORK, 'fx', String(i));
  mkdirSync(join(fx, 'corpus'), { recursive: true });
  mkdirSync(join(fx, 'corpus', 'knowledge'), { recursive: true }); // sources-check fail-closes without it

  const src = join(fx, 'corpus', 'SOURCES.md');
  const text = head + r.line + '\n' + tail;
  writeFileSync(src, text);
  // capture: bind a dummy id so a one-id file is evaluable
  const capFile = join(fx, 'cap.txt');
  writeFileSync(capFile, `sweep ${r.probe}\n`);
  const cb = readFileSync(capFile);
  const reg = { version: 1, captures: [{ sourceId: 'S999', path: 'cap.txt', sha256: sha(cb), bytes: cb.length, captured: TODAY }], exemptions: [] };
  writeFileSync(join(fx, 'reg.json'), JSON.stringify(reg));
  const readme = join(fx, 'README.md');
  writeFileSync(readme, `| \`knowledge/x.md\` | cites ${r.probe} |\n`);

  let census = 'other';
  const cen = spawnSync('bash', [CENSUS, 'validate', '--file', src, '--today', TODAY], { encoding: 'utf8', env });
  for (const line of cen.stdout.split('\n')) {
    let m = line.match(/^file\tE06\t(.*) tier=Z([0-9]+)$/);
    if (m && m[2] === r.probe.slice(1) && /^S[0-9]{3,}$/.test(m[1]) && m[1] === r.probe) census = 'valid';
    m = line.match(/^file\tE02\t(.*)$/);
    if (m && census === 'other' && m[1].replace(/^[ \t]+|[ \t]+$/g, '') !== '') census = 'invalid';
  }
  let cite;
  const citeOf = (name) => {
    const c = spawnSync(process.execPath, [join(toolDir, name), '--readme', readme, '--sources', src], { encoding: 'utf8', env });
    if (c.status === 0 && c.stdout.trim() === 'CITE_SOURCES: CLEAN cited=1') return 'yes';
    if (c.status === 1 && c.stdout.trim() === `CITE_SOURCES: DRIFT ghosts=1 first=${r.probe}`) return 'no';
    return 'other';
  };
  cite = citeOf('cite.mjs');
  const citeRef = citeOf('cite-ref.mjs');
  let cap;
  const capOf = (name) => {
    const p = spawnSync(process.execPath, [join(toolDir, name), '--registry', join(fx, 'reg.json'), '--sources', src], { encoding: 'utf8', env });
    if (p.stdout.split('\n').some((l) => l === `${r.probe}:uncaptured` || l === `SOURCE_CAPTURE: DRIFT captures=1 exemptions=0 bad=2 first=${r.probe}:uncaptured`)) return 'yes';
    if (p.status === 2 && /carries no S### rows/.test(p.stdout)) return 'no';
    if (p.status === 1 && p.stdout.includes('S999:orphan-capture')) return 'no';
    return `other(exit=${p.status})`;
  };
  cap = capOf('capture.mjs');
  const capRef = capOf('capture-ref.mjs');
  let schk;
  const s = spawnSync(process.execPath, [join(LANE_, 'scripts', 'sources-check.mjs'), '--self', fx, '--today', TODAY, '--json'], { encoding: 'utf8', env });
  try {
    const j = JSON.parse(s.stdout.trim().split('\n').pop());
    const form = (j.findings ?? []).some((f) => f.kind === 'ID_FORM' && String(f.detail).startsWith('id='));
    if (j.counts?.rows === 1) schk = 'yes';
    else if (form) schk = 'form';
    else schk = 'no';
  } catch { schk = `other(exit=${s.status})`; }
  return { ...r, census, cite, cap, schk, citeRef, capRef };
}

const results = new Array(rows.length);
let idx = 0;
await Promise.all(Array.from({ length: 8 }, async () => {
  while (idx < rows.length) { const i = idx++; results[i] = runRow(rows[i], i); }
}));

const YES = (v) => v === 'yes';
const want = (census) => census === 'valid';
const over = { cite: [], cap: [], schk: [], citeRef: [], capRef: [] };
const under = { cite: [], cap: [], schk: [], citeRef: [], capRef: [] };
for (const r of results) {
  for (const k of ['cite', 'cap', 'schk', 'citeRef', 'capRef']) {
    const got = YES(r[k]);
    if (got && !want(r.census)) over[k].push(r.cls);
    if (!got && want(r.census)) under[k].push(r.cls);
  }
}
const count = (a, v) => a.filter((x) => x === v).length;
const lines = [];
lines.push(`# reader-sweep receipt — lane ${LANE_} base ${BASE_REV}`);
lines.push(`# cite_sha256=${sha(citeSrc)} capture_sha256=${sha(capSrc)} sources_check_sha256=${sha(schkSrc)} cite_ref_sha256=${sha(citeRefSrc)} capture_ref_sha256=${sha(capRefSrc)}`);
lines.push(`# node ${process.version} · census ${CENSUS} · today ${TODAY}`);
lines.push('class\tprobe\tcensus\tcite\tcapture\tsources-check\tcite-ref\tcapture-ref');
for (const r of results) lines.push(`${r.cls}\t${r.probe}\t${r.census}\t${r.cite}\t${r.cap}\t${r.schk}\t${r.citeRef}\t${r.capRef}`);
lines.push(`# rows=${results.length} census_valid=${count(results.map((r) => r.census), 'valid')} census_invalid=${count(results.map((r) => r.census), 'invalid')} census_notrow=${count(results.map((r) => r.census), 'other')}`);
for (const k of ['cite', 'cap', 'schk', 'citeRef', 'capRef']) {
  lines.push(`# ${k}: over=${over[k].length} under=${under[k].length} agree=${results.length - over[k].length - under[k].length}`);
  if (over[k].length) lines.push(`# ${k}: over classes=${over[k].join(',')}`);
  if (under[k].length) lines.push(`# ${k}: under classes=${under[k].join(',')}`);
}
writeFileSync(OUT, `${lines.join('\n')}\n`);
process.stdout.write(lines.filter((l) => l.startsWith('#') || l.startsWith('class')).join('\n') + '\n');

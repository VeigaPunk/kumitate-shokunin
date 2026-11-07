#!/usr/bin/env node
// probe100-c1.mjs — frozen counter for kumitate round 100, claim C1 (operability).
//
// Rule R100 (claim after-state): scripts/cite-sources.mjs and scripts/source-capture.mjs recognise a
// corpus/SOURCES.md row id exactly as the fleet census `row_pass` does for a 13-field row inside
// `## Registry`: the physical line is an LF-delimited record (the gawk default RS), the row gate is
// 0-3 ASCII SP then `|`, the id cell is trimmed of ASCII SP/TAB only, and the id is `S` + 3 or more
// ASCII digits. No other JS `\s` member (VT, FF, CR, NBSP, Zs, U+FEFF, U+2028/U+2029) pads an id or an
// indent, and no non-LF line terminator (CR, U+2028, U+2029) starts a row.
//
// Frozen predicate `C100_C1: HELD` iff, on a fresh nonce battery (seed printed; --seed replays):
//   (a) for every battery row with an ASCII probe id, cite-sources (candidate) treats the probe id as a
//       registry row id (CLEAN cited=1) exactly when the census reads it as a valid id (an E06 line whose
//       id is ^S[0-9]{3,}$), and as a ghost (DRIFT ghosts=1 first=<id>) otherwise;
//   (b) the set of ids source-capture (candidate) recognises in the whole battery file (bound ids not
//       reported orphan-*, plus ids reported uncaptured) equals the census-valid id set;
//   (c) on a snapshot of every fleet lane's corpus/README.md + corpus/SOURCES.md (21 lanes), BASE and
//       candidate stdout + exit are identical for both tools;
//   (d) both candidates' --selftest exit 0 and print `VERDICT: PASS`.
// A census exit other than 1, an empty census-valid or census-invalid probe set, or an E06 line that is
// not attributable (by its tier nonce Z<digits>) to exactly one battery row is SETUP (exit 2), never HELD. Receipt label:
// `C100_C1: HELD|UNMET|SETUP`.
//
// usage: node probe100-c1.mjs --cite <cite-sources.mjs bytes> --capture <source-capture.mjs bytes>
//                             --work <scratch dir> [--seed HEX16]
//        exit 0 HELD · 1 UNMET · 2 SETUP · 64 usage
import { createHash, randomBytes } from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const FLEET = '/home/vgpnk/Projects/shokunin';
const LANE = join(FLEET, 'kumitate-shokunin');
const CENSUS = join(FLEET, 'scripts', 'sources-census.sh');
const BASE_REV = '5e2f9856271525760ade3b08892f6df7601fa689';
const TODAY = '2026-11-07';

function usage(msg) { process.stderr.write(`probe100-c1: ${msg}\n`); process.exit(64); }
const argv = process.argv.slice(2);
const opt = {};
for (let i = 0; i < argv.length; i += 1) {
  const k = argv[i];
  if (['--cite', '--capture', '--work', '--seed'].includes(k)) { opt[k.slice(2)] = argv[++i]; continue; }
  usage(`unknown argument ${k}`);
}
if (!opt.cite || !opt.capture || !opt.work) usage('--cite, --capture and --work are required');
if (opt.seed !== undefined && !/^[0-9a-f]{16}$/.test(opt.seed)) usage('--seed must be 16 hex digits');
const seed = opt.seed ?? randomBytes(8).toString('hex');
const sha = (b) => createHash('sha256').update(b).digest('hex');
const citeBytes = readFileSync(opt.cite);
const capBytes = readFileSync(opt.capture);
const tag = `seed=${seed} cite_sha256=${sha(citeBytes)} capture_sha256=${sha(capBytes)}`;
const work = resolve(opt.work);
const setup = (why) => { process.stdout.write(`C100_C1: SETUP ${why} ${tag}\n`); process.exit(2); };

// ---------------------------------------------------------------- seeded draw
let ctr = 0;
function u32() { return createHash('sha256').update(`${seed}:${ctr++}`).digest().readUInt32BE(0); }
const pick = (arr) => arr[u32() % arr.length];
const int = (lo, hi) => lo + (u32() % (hi - lo + 1));

const used = new Set();
function freshDigits() {
  for (;;) {
    const n = int(3, 8);
    let d = String(1 + (u32() % 9));
    while (d.length < n) d += String(u32() % 10);
    // no id may be a prefix of another (README citation and source-capture ids stay unambiguous)
    let clash = false;
    for (const u of used) if (u.startsWith(d) || d.startsWith(u)) { clash = true; break; }
    if (!clash) { used.add(d); return d; }
  }
}

// Blank pads (the census trims these) and non-blank pads (it does not).
const BLANK = [' ', '\t', ' \t', '\t ', '  ', '\t\t', '   \t '];
const NONBLANK = {
  VT: '\v', FF: '\f', CR: '\r', NEL: '\u0085', NBSP: '\u00a0', OGHAM: '\u1680', MVS: '\u180e', ENSP: '\u2002',
  EMSP: '\u2003', THINSP: '\u2009', ZWSP: '\u200b', LS: '\u2028', PS: '\u2029', NNBSP: '\u202f', MMSP: '\u205f',
  WJ: '\u2060', IDSP: '\u3000', BOM: '\ufeff', SHY: '\u00ad', HFILL: '\u3164', SOH: '\u0001', US: '\u001f',
};
// Indents before the leading pipe: 0-3 ASCII SP are rows for the census; everything else is not.
const INDENT_OK = ['', ' ', '  ', '   '];
const INDENT_BAD = {
  SP4: '    ', SP5: '     ', SP6: '      ', SP3TAB: '   \t', TAB3SP: '\t   ', TAB: '\t', SPTAB: ' \t', TABSP: '\t ', NBSP: '\u00a0', IDSP: '\u3000', VT: '\v',
  FF: '\f', BOM: '\ufeff', EMSP: '\u2003', NEL: '\u0085',
};
// Non-LF terminators (and look-alikes) that precede the row on the same LF record.
const BREAKS = { CR: '\r', LS: '\u2028', PS: '\u2029', NEL: '\u0085', VT: '\v', FF: '\f' };

const rows = []; // { cls, probe, line }
function rowText(idCell, nonce) {
  return `|${idCell}| Fixture ${nonce} — https://example.invalid/r100/${nonce} | docs | Z${nonce} | probe-${nonce} `
    + `| line 1 | fixture row | queued | 2026-01-01 | 90d | — |`;
}
function add(cls, digits, idCell, prefix = '', suffix = '') {
  const probe = `S${digits}`;
  rows.push({ cls, probe, line: prefix + rowText(idCell, digits) + suffix });
}
const sp = () => pick(BLANK);

// A — clean rows, plus the source-capture anchor
for (let i = 0; i < 8; i += 1) { const d = freshDigits(); add('A-clean', d, ` S${d} `); }
// B — blank pads of length 0-8 on either side (census-valid)
for (let i = 0; i < 16; i += 1) {
  const d = freshDigits();
  const lead = i % 4 === 0 ? '' : Array.from({ length: int(1, 4) }, sp).join('').slice(0, 8);
  const trail = i % 5 === 0 ? '' : Array.from({ length: int(1, 4) }, sp).join('').slice(0, 8);
  add('B-blank', d, `${lead}S${d}${trail}`);
}
// B8 — one row with 8-character blank pads on both sides (always drawn)
{ const d = freshDigits(); add('B-blank8', d, `\t \t \t \t S${d} \t \t \t \t`); }
// C — every non-blank pad class, lead / trail / both, optionally inside blank pads
for (const [name, ch] of Object.entries(NONBLANK)) {
  for (const side of ['lead', 'trail', 'both']) {
    const d = freshDigits();
    const unit = ch.repeat(int(1, 3));
    const outer = u32() % 2 ? ' ' : '';
    const lead = side !== 'trail' ? `${outer}${unit}` : ' ';
    const trail = side !== 'lead' ? `${unit}${outer}` : ' ';
    add(`C-pad-${name}-${side}`, d, `${lead}S${d}${trail}`);
  }
}
// D — indents: 0-3 SP (rows) and every other indent class (not rows)
for (const ind of INDENT_OK) { const d = freshDigits(); add(`D-indent-sp${ind.length}`, d, ` S${d} `, ind); }
for (const [name, ind] of Object.entries(INDENT_BAD)) {
  const d = freshDigits();
  add(`D-indent-${name}`, d, ` S${d} `, ind);
}
// E — a non-LF terminator (or look-alike) before the row on the same LF record, with and without leading text
for (const [name, br] of Object.entries(BREAKS)) {
  for (const ctx of ['', 'note: see below']) {
    const d = freshDigits();
    add(`E-break-${name}-${ctx ? 'text' : 'bare'}`, d, ` S${d} `, ctx + br + pick(INDENT_OK));
  }
}
// F — CRLF-terminated rows (census-valid: the CR sits in the last, empty field)
for (let i = 0; i < 4; i += 1) { const d = freshDigits(); add('F-crlf', d, `${sp()}S${d}${sp()}`, pick(INDENT_OK), '\r'); }
// G — invalid id forms with blank pads (probe id is the ASCII S+digits the row "means")
{
  const fw = (s) => [...s].map((c) => String.fromCharCode(0xff10 + Number(c))).join('');
  const ar = (s) => [...s].map((c) => String.fromCharCode(0x0660 + Number(c))).join('');
  let d = freshDigits(); add('G-lower', d, ` s${d} `);
  d = freshDigits(); add('G-trailing-letter', d, ` S${d}x `);
  d = freshDigits(); add('G-leading-letter', d, ` xS${d} `);
  d = freshDigits(); add('G-dash', d, ` S-${d} `);
  d = freshDigits(); add('G-inner-space', d, ` S ${d} `);
  d = freshDigits(); add('G-double-S', d, ` SS${d} `);
  d = freshDigits(); add('G-fullwidth', d, ` S${fw(d)} `);
  d = freshDigits(); add('G-arabic-indic', d, ` S${ar(d)} `);
  d = freshDigits(); add('G-two-ids', d, ` S${d} S${freshDigits()} `);
}

// Shuffle row order (keeps the battery from being positional) and build the file.
for (let i = rows.length - 1; i > 0; i -= 1) { const j = u32() % (i + 1); [rows[i], rows[j]] = [rows[j], rows[i]]; }
const anchor = rows.find((r) => r.cls === 'A-clean');
const head = `# Sources — probe100 battery ${seed}\n\nIntro prose.\n\n## Registry\n\n`
  + '| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |\n'
  + '|---|---|---|---|---|---|---|---|---|---|---|\n';
const body = rows.map((r) => r.line).join('\n');
const tail = `\n\n## Search log\n\n- probe ${seed}\n`;
const sourcesText = head + body + tail;

rmSync(work, { recursive: true, force: true });
mkdirSync(join(work, 'fx'), { recursive: true });
const fx = join(work, 'fx');
const srcPath = join(fx, 'SOURCES.md');
writeFileSync(srcPath, sourcesText);
writeFileSync(join(work, 'cite.mjs'), citeBytes);
writeFileSync(join(work, 'capture.mjs'), capBytes);
const env = { ...process.env, TMPDIR: work, SHOKUNIN_ROOT: join(work, 'no-root') };
mkdirSync(join(work, 'no-root'), { recursive: true });

// ---------------------------------------------------------------- census oracle (live)
const cen = spawnSync('bash', [CENSUS, 'validate', '--file', srcPath, '--today', TODAY], { encoding: 'utf8', env: process.env });
if (cen.status !== 1) setup(`census_exit=${cen.status}`);
const valid = new Set();
for (const line of cen.stdout.split('\n')) {
  const m = line.match(/^file\tE06\t(.*) tier=Z([0-9]+)$/);
  if (!m) continue;
  const owners = rows.filter((r) => r.probe === `S${m[2]}`);
  if (owners.length !== 1) setup(`unattributable_E06=${JSON.stringify(line)}`);
  if (/^S[0-9]{3,}$/.test(m[1])) {
    if (m[1] !== owners[0].probe) setup(`E06_id_mismatch=${m[1]}`);
    valid.add(m[1]);
  }
}
const invalid = rows.filter((r) => !valid.has(r.probe));
if (valid.size === 0 || invalid.length === 0) setup(`empty_set valid=${valid.size} invalid=${invalid.length}`);
if (!valid.has(anchor.probe)) setup('anchor_not_census_valid');

// ---------------------------------------------------------------- (a) cite-sources, one README per probe id
function runAsync(args, cwd) {
  return new Promise((res) => {
    const c = spawn(process.execPath, args, { cwd, env });
    let out = '';
    c.stdout.on('data', (b) => { out += b; });
    c.stderr.on('data', () => {});
    c.on('close', (code) => res({ code, out }));
  });
}
async function pool(items, n, fn) {
  const results = new Array(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: n }, async () => {
    while (next < items.length) { const i = next++; results[i] = await fn(items[i], i); }
  }));
  return results;
}
const aMiss = [];
await pool(rows, 8, async (r, i) => {
  const readme = join(fx, `README-${i}.md`);
  writeFileSync(readme, `| \`knowledge/x.md\` | cites ${r.probe} |\n`);
  const o = await runAsync([join(work, 'cite.mjs'), '--readme', readme, '--sources', srcPath], fx);
  const want = valid.has(r.probe);
  let got;
  if (o.code === 0 && o.out.trim() === 'CITE_SOURCES: CLEAN cited=1') got = true;
  else if (o.code === 1 && o.out.trim() === `CITE_SOURCES: DRIFT ghosts=1 first=${r.probe}`) got = false;
  else got = `other(exit=${o.code} ${JSON.stringify(o.out.trim().slice(0, 80))})`;
  if (got !== want) aMiss.push(`${r.cls}:${r.probe}:want=${want}:got=${got}`);
});
const a = aMiss.length === 0 ? 1 : 0;

// ---------------------------------------------------------------- (b) source-capture, whole battery
const capFile = join(fx, 'cap.txt');
writeFileSync(capFile, `probe100 ${seed}\n`);
const capBuf = readFileSync(capFile);
const exempt = rows.filter((r) => r !== anchor).map((r) => r.probe);
writeFileSync(join(fx, 'reg.json'), JSON.stringify({
  version: 1,
  captures: [{ sourceId: anchor.probe, path: 'cap.txt', sha256: sha(capBuf), bytes: capBuf.length, captured: TODAY }],
  exemptions: [{ ids: exempt, reason: 'probe100 battery' }],
}));
const capRun = spawnSync(process.execPath, [join(work, 'capture.mjs'), '--registry', join(fx, 'reg.json'), '--sources', srcPath], { encoding: 'utf8', env, cwd: fx });
const bMiss = [];
const seen = new Set();
const bound = new Set([anchor.probe, ...exempt]);
const items = [];
for (const line of capRun.stdout.split('\n')) {
  let m = line.match(/^SOURCE_CAPTURE: note (\S+)$/);
  if (m) { items.push(m[1]); continue; }
  m = line.match(/^SOURCE_CAPTURE: DRIFT .* first=(\S+)$/);
  if (m) items.push(m[1]);
}
let bState = 'ok';
if (capRun.status === 0 && /^SOURCE_CAPTURE: CLEAN /m.test(capRun.stdout)) {
  for (const id of bound) seen.add(id);
} else if (capRun.status === 1) {
  const orphans = new Set();
  for (const it of items) {
    const k = it.lastIndexOf(':');
    const id = it.slice(0, k); const why = it.slice(k + 1);
    if (why === 'orphan-exemption' || why === 'orphan-capture') orphans.add(id);
    else if (why === 'uncaptured') seen.add(id);
    else bMiss.push(`unexpected-item:${it}`);
  }
  for (const id of bound) if (!orphans.has(id)) seen.add(id);
} else {
  bState = `exit=${capRun.status} ${JSON.stringify(capRun.stdout.trim().slice(0, 120))}`;
}
if (bState !== 'ok') bMiss.push(bState);
else {
  for (const id of seen) if (!valid.has(id)) bMiss.push(`extra:${JSON.stringify(id)}:${rows.find((r) => r.probe === id)?.cls ?? '?'}`);
  for (const id of valid) if (!seen.has(id)) bMiss.push(`missing:${id}:${rows.find((r) => r.probe === id)?.cls ?? '?'}`);
}
const b = bMiss.length === 0 ? 1 : 0;

// ---------------------------------------------------------------- (c) BASE vs candidate on every fleet lane
const baseDir = join(work, 'base');
mkdirSync(baseDir, { recursive: true });
for (const [name, rel] of [['cite.mjs', 'scripts/cite-sources.mjs'], ['capture.mjs', 'scripts/source-capture.mjs']]) {
  const r = spawnSync('git', ['-C', LANE, 'show', `${BASE_REV}:${rel}`], { maxBuffer: 1 << 26, env: process.env });
  if (r.status !== 0) setup(`git_show_failed=${rel}`);
  writeFileSync(join(baseDir, name), r.stdout);
}
const lanes = readdirSync(FLEET).filter((n) => n.endsWith('-shokunin') && existsSync(join(FLEET, n, 'corpus', 'SOURCES.md'))).sort();
if (lanes.length < 21) setup(`lanes=${lanes.length}`);
const cMiss = [];
for (const ln of lanes) {
  const d = join(work, 'live', ln);
  mkdirSync(d, { recursive: true });
  const src = readFileSync(join(FLEET, ln, 'corpus', 'SOURCES.md'));
  writeFileSync(join(d, 'SOURCES.md'), src);
  const runBoth = (args) => [baseDir, work].map((dir) => {
    const tool = args[0] === 'cite' ? join(dir, 'cite.mjs') : join(dir, 'capture.mjs');
    const r = spawnSync(process.execPath, [tool, ...args.slice(1)], { encoding: 'utf8', env, cwd: d });
    return `${r.status}\n${r.stdout}`;
  });
  const readme = join(FLEET, ln, 'corpus', 'README.md');
  if (existsSync(readme)) {
    writeFileSync(join(d, 'README.md'), readFileSync(readme));
    const [x, y] = runBoth(['cite', '--readme', join(d, 'README.md'), '--sources', join(d, 'SOURCES.md')]);
    if (x !== y) cMiss.push(`${ln}:cite`);
  }
  const toks = [...new Set([...src.toString('utf8').matchAll(/S[0-9]{3,}/g)].map((m) => m[0]))];
  if (toks.length === 0) continue;
  writeFileSync(join(d, 'cap.txt'), `live ${ln}\n`);
  const cb = readFileSync(join(d, 'cap.txt'));
  const reg = { version: 1, captures: [{ sourceId: toks[0], path: 'cap.txt', sha256: sha(cb), bytes: cb.length, captured: TODAY }],
    exemptions: toks.length > 1 ? [{ ids: toks.slice(1), reason: 'probe100 live' }] : [] };
  writeFileSync(join(d, 'reg.json'), JSON.stringify(reg));
  const [x, y] = runBoth(['capture', '--registry', join(d, 'reg.json'), '--sources', join(d, 'SOURCES.md')]);
  if (x !== y) cMiss.push(`${ln}:capture`);
}
const c = cMiss.length === 0 ? 1 : 0;

// ---------------------------------------------------------------- (d) candidate selftests
const dMiss = [];
for (const name of ['cite.mjs', 'capture.mjs']) {
  const r = spawnSync(process.execPath, [join(work, name), '--selftest'], { encoding: 'utf8', env, cwd: work, timeout: 300000 });
  if (r.status !== 0 || !/^VERDICT: PASS$/m.test(r.stdout)) dMiss.push(`${name}:exit=${r.status}`);
}
const d = dMiss.length === 0 ? 1 : 0;

// ---------------------------------------------------------------- verdict
const held = a && b && c && d;
const nRows = rows.length;
const detail = `a=${a} b=${b} c=${c} d=${d} rows=${nRows} valid=${valid.size} invalid=${invalid.length} `
  + `a_miss=${aMiss.length} b_miss=${bMiss.length} c_miss=${cMiss.length} lanes=${lanes.length}`;
for (const m of aMiss.slice(0, 40)) process.stdout.write(`miss a ${m}\n`);
for (const m of bMiss.slice(0, 40)) process.stdout.write(`miss b ${m}\n`);
for (const m of cMiss) process.stdout.write(`miss c ${m}\n`);
for (const m of dMiss) process.stdout.write(`miss d ${m}\n`);
process.stdout.write(`C100_C1: ${held ? 'HELD' : 'UNMET'} ${detail} ${tag}\n`);
rmSync(work, { recursive: true, force: true });
process.exit(held ? 0 : 1);

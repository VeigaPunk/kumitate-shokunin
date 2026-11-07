#!/usr/bin/env node
// probe99-c1.mjs — frozen counter for kumitate round 99, claim C1 (operability).
//
// Rule R99 (claim after-state): inside `## Registry`, scripts/sources-check.mjs trims every table cell with the
// POSIX-locale `blank` class [ \t] (the fleet census `row_pass` `trim`), not ECMAScript String.prototype.trim.
//
// Frozen predicate `C99_C1: HELD` iff, on a fresh nonce fixture (seed printed; --seed replays):
//   (a) ID_FORM   (row, id string) multiset == census E02 (row, id string) multiset          [FIX-A, LF]
//   (b) ID_DUPLICATE rows == census E03 rows; ROW_MALFORMED rows == census E01 rows minus E02 rows
//   (c) KIND_ENUM / TIER_ENUM / STATUS_ENUM rows == census E05 / E06 / E07 rows
//   (d) OPENED_INVALID / RECHECK_INVALID rows == census E08 / E09 rows
//   (e) counts.rows == census `rows` (census mode) minus the number of census E02 lines
//   (f) FIX-B (= FIX-A whole-CRLF): ROW_OUTSIDE_REGISTRY (row, id) == census E12 (row, id)
//   (g) on a snapshot of every fleet lane's corpus/ (21 lanes): candidate --json == BASE --json, byte for byte
//   (h) candidate --selftest exits 0 and prints `VERDICT: PASS` with no SKIP line
// A census exit other than 1 on FIX-A, an empty expected set in (a)(c)(d), or a census line not attributable to
// exactly one generated row group is SETUP (exit 2), never HELD. Receipt label: `C99_C1: HELD|UNMET|SETUP`.
//
// usage: node probe99-c1.mjs --tool <sources-check.mjs bytes> --work <scratch dir> [--seed HEX16]
//        exit 0 HELD · 1 UNMET · 2 SETUP · 64 usage
import { createHash, randomBytes } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const FLEET = '/home/vgpnk/Projects/shokunin';
const LANE = join(FLEET, 'kumitate-shokunin');
const CENSUS = join(FLEET, 'scripts', 'sources-census.sh');
const BASE_REV = 'f9cd1bff147508f0d787f9e0cc4d2191aabaf02a';
const TODAY = '2026-11-07';

function usage(msg) { process.stderr.write(`probe99-c1: ${msg}\n`); process.exit(64); }
const argv = process.argv.slice(2);
const opt = {};
for (let i = 0; i < argv.length; i += 1) {
  const k = argv[i];
  if (k === '--tool' || k === '--work' || k === '--seed') { opt[k.slice(2)] = argv[++i]; continue; }
  usage(`unknown argument ${k}`);
}
if (!opt.tool || !opt.work) usage('--tool and --work are required');
if (opt.seed !== undefined && !/^[0-9a-f]{16}$/.test(opt.seed)) usage('--seed must be 16 hex digits');
const seed = opt.seed ?? randomBytes(8).toString('hex');
const toolBytes = readFileSync(opt.tool);
const toolSha = createHash('sha256').update(toolBytes).digest('hex');
const work = resolve(opt.work);
const setup = (why) => { process.stdout.write(`C99_C1: SETUP ${why} seed=${seed} tool_sha256=${toolSha}\n`); process.exit(2); };

// ---------------------------------------------------------------- seeded draw
let ctr = 0;
function u32() {
  const h = createHash('sha256').update(`${seed}:${ctr++}`).digest();
  return h.readUInt32BE(0);
}
const pick = (arr) => arr[u32() % arr.length];
const int = (lo, hi) => lo + (u32() % (hi - lo + 1));
function shuffle(arr) { for (let i = arr.length - 1; i > 0; i -= 1) { const j = u32() % (i + 1); [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; }

// Pad classes: blank (must trim), JS-trim-only (must not trim), and characters neither trims (must not trim).
const PADS = {
  SP: ' ', TAB: '\t', SPTAB: ' \t', TABSP: '\t ',
  VT: '\v', FF: '\f', CR: '\r', TABFF: '\t\f', NEL: '\u0085', NBSP: '\u00a0', OGHAM: '\u1680', MVS: '\u180e',
  ENQUAD: '\u2000', EMQUAD: '\u2001', ENSP: '\u2002', EMSP: '\u2003', THREEPEREM: '\u2004', FOURPEREM: '\u2005',
  SIXPEREM: '\u2006', FIGSP: '\u2007', PUNCSP: '\u2008', THINSP: '\u2009', HAIRSP: '\u200a', ZWSP: '\u200b',
  ZWNJ: '\u200c', ZWJ: '\u200d', LRM: '\u200e', LS: '\u2028', PS: '\u2029', NNBSP: '\u202f', MMSP: '\u205f',
  WJ: '\u2060', IDSP: '\u3000', BOM: '\ufeff', SHY: '\u00ad', HFILL: '\u3164', HCFILL: '\u115f',
  SOH: '\u0001', FS: '\u001c', US: '\u001f', SPNBSP: ' \u00a0', NBSPSP: '\u00a0 ', NBSPTAB: '\u00a0\t',
  TABVT: '\t\v',
};
const PAD_NAMES = Object.keys(PADS);
const CELLS = { id: 1, kind: 3, tier: 4, status: 8, opened: 9, recheck: 10 };
const CELL_NAMES = Object.keys(CELLS);
const KINDS = ['spec', 'docs', 'paper', 'code', 'tool', 'dataset', 'talk', 'book', 'community', 'own-work'];

const usedCores = [];
function freshCore(form) {
  for (let tries = 0; tries < 10_000; tries += 1) {
    const n = int(3, 12);
    let digits = String(int(1, 9));
    while (digits.length < n) digits += String(int(0, 9));
    let core;
    if (form === 'valid') core = `S${digits}`;
    else if (form === 'two') core = `S${digits.slice(0, 2)}`;
    else if (form === 'lower') core = `s${digits}`;
    else if (form === 'alpha') core = `S${digits}x`;
    else if (form === 'arabic') core = `S${[...digits].map((d) => String.fromCodePoint(0x660 + Number(d))).join('')}`;
    else core = `S${[...digits].map((d) => String.fromCodePoint(0xff10 + Number(d))).join('')}`;
    if (usedCores.some((c) => c.includes(core) || core.includes(c))) continue;
    usedCores.push(core);
    return core;
  }
  return setup('cannot draw a non-colliding id');
}
function isoDate(y0, y1) {
  const y = int(y0, y1); const m = int(1, 12); const d = int(1, 28);
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

// rows: { core, cells[11] (no outer SP), width 13|12 }
const rows = [];
const lessonFiles = [];
function baseRow(core) {
  const nonce = u32().toString(16);
  const status = pick(['queued', 'mined', 'rejected']);
  let kind = pick(KINDS); let tier = pick(['A', 'B', 'C']);
  if (kind === 'community' && tier === 'A') tier = 'B';
  const usedBy = status === 'mined' ? `corpus/lessons/u-${nonce}.md` : '—';
  if (status === 'mined') lessonFiles.push(usedBy);
  return {
    core,
    cells: [core, `Title ${nonce} — https://example.org/r99/${nonce}`, kind, tier, `scope-${nonce}`, `§ ${nonce}`,
      status === 'rejected' ? `REJECTED: drawn ${nonce}; flip: never` : `teaches ${nonce}`, status,
      isoDate(2019, 2025), pick([isoDate(2027, 2030), `${int(1, 400)}d`, 'on-release']), usedBy],
    width: 13,
  };
}
function padValue(value, padName) {
  const unit = PADS[padName];
  const n = int(1, 8);
  const side = pick(['lead', 'trail', 'both']);
  const pad = unit.repeat(n);
  return side === 'lead' ? pad + value : side === 'trail' ? value + pad : pad + value + pad;
}
// invalid id forms first (short cores reserve their prefixes before valid cores are drawn); some padded
for (const form of ['two', 'lower', 'alpha', 'arabic', 'fullwidth']) {
  for (let k = 0; k < 4; k += 1) {
    const r = baseRow(freshCore(form));
    if (k % 2) r.cells[0] = padValue(r.cells[0], pick(PAD_NAMES));
    rows.push(r);
  }
}
const twelve = [];
for (let k = 0; k < 24; k += 1) twelve.push(freshCore(k % 3 === 0 ? pick(['two', 'lower']) : 'valid'));
// every (pad class, cell) pair at least once
for (const padName of PAD_NAMES) {
  for (const cell of CELL_NAMES) {
    const r = baseRow(freshCore('valid'));
    r.cells[CELLS[cell] - 1] = padValue(r.cells[CELLS[cell] - 1], padName);
    rows.push(r);
  }
}
// invalid enum values (both readers already agree)
for (const [cell, bad] of [['kind', 'Docs'], ['tier', 'a'], ['status', 'Mined'], ['opened', '2025-13-01'], ['recheck', 'soon!']]) {
  for (let k = 0; k < 3; k += 1) { const r = baseRow(freshCore('valid')); r.cells[CELLS[cell] - 1] = bad; rows.push(r); }
}
// 12-field rows (teaches dropped), id padded or not
twelve.forEach((core, k) => {
  const r = baseRow(core);
  if (k % 2) r.cells[0] = padValue(r.cells[0], pick(PAD_NAMES));
  r.cells.splice(6, 1); r.width = 12;
  rows.push(r);
});
// duplicate pairs: second copy padded with a drawn class
for (let k = 0; k < 24; k += 1) {
  const a = baseRow(freshCore('valid'));
  const b = baseRow(a.core);
  b.cells[1] = `${b.cells[1]}-dup`;
  b.cells[0] = padValue(a.core, k % 2 ? pick(['SP', 'TAB', 'SPTAB', 'TABSP']) : pick(PAD_NAMES.slice(4)));
  rows.push(a, b);
}
// clean rows
for (let k = 0; k < 30; k += 1) rows.push(baseRow(freshCore('valid')));
shuffle(rows);

const title = `SOURCES — where fixture-${u32().toString(16)} learns`;
const bom = int(0, 1) ? '\ufeff' : '';
const lines = [`${bom}# ${title}`, '', '## Registry', '',
  '| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |',
  '|---|---|---|---|---|---|---|---|---|---|---|'];
const lineOfRow = new Map();
for (const r of rows) { lineOfRow.set(lines.length + 1, r); lines.push(`| ${r.cells.join(' | ')} |`); }
const tail = shuffle([['## Paths', '', 'none'], ['## Search log', '', 'none'], ['## Leads (unopened)', '', '- none']]);
for (const sec of tail) lines.push('', ...sec);
const fixA = `${lines.join('\n')}\n`;
const fixB = fixA.replace(/\n/g, '\r\n');

// ------------------------------------------------------------------ run tools
rmSync(work, { recursive: true, force: true });
mkdirSync(work, { recursive: true });
const emptyRoot = join(work, 'no-fleet');
mkdirSync(emptyRoot);
function plantTool(dir, bytes) {
  mkdirSync(join(dir, 'scripts'), { recursive: true });
  writeFileSync(join(dir, 'scripts', 'sources-check.mjs'), bytes);
  for (const helper of ['cap-spawn.mjs', 'cap-run.mjs']) {
    const show = spawnSync('git', ['-C', LANE, 'show', `${BASE_REV}:scripts/${helper}`], { maxBuffer: 1 << 26 });
    if (show.status !== 0) setup(`cannot read ${helper} at ${BASE_REV}`);
    writeFileSync(join(dir, 'scripts', helper), show.stdout);
  }
  return join(dir, 'scripts', 'sources-check.mjs');
}
const candPath = plantTool(join(work, 'cand'), toolBytes);
const baseShow = spawnSync('git', ['-C', LANE, 'show', `${BASE_REV}:scripts/sources-check.mjs`], { maxBuffer: 1 << 26 });
if (baseShow.status !== 0) setup('cannot read BASE sources-check');
const basePath = plantTool(join(work, 'base'), baseShow.stdout);
const toolEnv = { PATH: process.env.PATH, HOME: process.env.HOME, TMPDIR: join(work, 'tmp'), SHOKUNIN_ROOT: emptyRoot, LANG: 'C.UTF-8' };
mkdirSync(toolEnv.TMPDIR);

function makeLane(name, text) {
  const dir = join(work, name);
  mkdirSync(join(dir, 'corpus', 'knowledge'), { recursive: true });
  mkdirSync(join(dir, 'corpus', 'lessons'), { recursive: true });
  for (const f of lessonFiles) writeFileSync(join(dir, f), 'lesson\n');
  writeFileSync(join(dir, 'corpus', 'SOURCES.md'), text);
  return dir;
}
const dirA = makeLane('fixA', fixA);
const dirB = makeLane('fixB', fixB);
writeFileSync(join(work, 'fixA.md'), fixA);

function runTool(path, self, extra = []) {
  const r = spawnSync('node', [path, '--self', self, '--today', TODAY, '--json', ...extra], { env: toolEnv, maxBuffer: 1 << 28, timeout: 120_000 });
  try { return JSON.parse(String(r.stdout)); } catch { return { parseError: true, status: r.status, stderr: String(r.stderr).slice(0, 300) }; }
}
function runCensus(mode, file) {
  const r = spawnSync('bash', [CENSUS, mode, '--file', file, '--today', TODAY], { env: { ...process.env, LANG: 'C.UTF-8' }, maxBuffer: 1 << 28, timeout: 120_000 });
  return { status: r.status, lines: String(r.stdout).split('\n').filter((l) => l !== '') };
}

// -------------------------------------------------------------- expectations
const censusA = runCensus('validate', join(dirA, 'corpus', 'SOURCES.md'));
if (censusA.status !== 1) setup(`census exit ${censusA.status} on FIX-A`);
const censusB = runCensus('validate', join(dirB, 'corpus', 'SOURCES.md'));
const censusRows = runCensus('census', join(dirA, 'corpus', 'SOURCES.md'));
const rowsLine = censusRows.lines.find((l) => l.split('\t')[1] === 'rows');
if (!rowsLine) setup('census mode printed no rows line');
const censusRowCount = Number(rowsLine.split('\t')[2]);

const MARK = { E01: ' fields=', E03: ' duplicate id', E05: ' kind=', E06: ' tier=', E07: ' status=', E08: ' opened=', E09: ' recheck=', E12: ' row outside Registry section' };
function attribute(idpart) {
  const hits = [...new Set(rows.filter((r) => idpart.includes(r.core)).map((r) => r.core))];
  if (hits.length !== 1) setup(`census id ${JSON.stringify(idpart)} attributes to ${hits.length} row groups`);
  return hits[0];
}
function censusFindings(lines) {
  const out = [];
  for (const line of lines) {
    const i1 = line.indexOf('\t'); const i2 = line.indexOf('\t', i1 + 1);
    if (i1 < 0 || i2 < 0) continue;
    const code = line.slice(i1 + 1, i2); const rest = line.slice(i2 + 1);
    if (!/^[EW]\d\d$/.test(code)) continue;
    if (code === 'W04' || code === 'W01' || code === 'W02' || code === 'W03' || code === 'E04' || code === 'E10' || code === 'E11') continue;
    const idpart = code === 'E02' ? rest : rest.slice(0, rest.indexOf(MARK[code]) < 0 ? setup(`unparsed ${code} line`) : rest.indexOf(MARK[code]));
    out.push({ code, core: attribute(idpart), id: idpart });
  }
  return out;
}
const cA = censusFindings(censusA.lines);
const cB = censusFindings(censusB.lines);

function toolFindings(json, kinds) {
  if (json.parseError) return null;
  const out = [];
  for (const f of json.findings ?? []) {
    if (!kinds.includes(f.kind)) continue;
    if (f.path !== 'corpus/SOURCES.md') continue;
    const r = lineOfRow.get(f.line);
    const m = /^id=(.*?)(?: (?:kind|tier|status|opened|recheck)=| split-fields=| row outside Registry section|$)/s.exec(f.detail);
    out.push({ kind: f.kind, core: r ? r.core : `line${f.line}`, id: m ? m[1] : f.detail });
  }
  return out;
}
const key = (arr) => arr.map((x) => JSON.stringify(x)).sort();
const same = (x, y) => JSON.stringify(key(x)) === JSON.stringify(key(y));

const candA = runTool(candPath, dirA);
const candB = runTool(candPath, dirB);
if (candA.parseError || candB.parseError) {
  process.stdout.write(`C99_C1: UNMET a=0/1 b=0/1 c=0/1 d=0/1 e=0/1 f=0/1 g=0/21 h=0/1 reason=candidate-json-unparsable seed=${seed} tool_sha256=${toolSha}\n`);
  process.exit(1);
}
const pick2 = (list, code) => list.filter((x) => x.code === code);
const exp = {
  E02: pick2(cA, 'E02').map((x) => ({ core: x.core, id: x.id })),
  E03: pick2(cA, 'E03').map((x) => ({ core: x.core })),
  E01: (() => { const e02 = new Set(pick2(cA, 'E02').map((x) => x.core + '\u0000' + x.id)); return pick2(cA, 'E01').filter((x) => !e02.has(x.core + '\u0000' + x.id)).map((x) => ({ core: x.core })); })(),
  E05: pick2(cA, 'E05').map((x) => ({ core: x.core })), E06: pick2(cA, 'E06').map((x) => ({ core: x.core })),
  E07: pick2(cA, 'E07').map((x) => ({ core: x.core })), E08: pick2(cA, 'E08').map((x) => ({ core: x.core })),
  E09: pick2(cA, 'E09').map((x) => ({ core: x.core })), E12: pick2(cB, 'E12').map((x) => ({ core: x.core, id: x.id })),
};
for (const c of ['E02', 'E03', 'E05', 'E06', 'E07', 'E08', 'E09', 'E12']) if (exp[c].length === 0) setup(`empty expected ${c}`);
const tA = (kind) => toolFindings(candA, [kind]);
const got = {
  E02: tA('ID_FORM').map((x) => ({ core: x.core, id: x.id })),
  E03: tA('ID_DUPLICATE').map((x) => ({ core: x.core })),
  E01: tA('ROW_MALFORMED').map((x) => ({ core: x.core })),
  E05: tA('KIND_ENUM').map((x) => ({ core: x.core })), E06: tA('TIER_ENUM').map((x) => ({ core: x.core })),
  E07: tA('STATUS_ENUM').map((x) => ({ core: x.core })), E08: tA('OPENED_INVALID').map((x) => ({ core: x.core })),
  E09: tA('RECHECK_INVALID').map((x) => ({ core: x.core })),
  E12: toolFindings(candB, ['ROW_OUTSIDE_REGISTRY']).map((x) => ({ core: x.core, id: x.id })),
};
const arm = {
  a: same(got.E02, exp.E02),
  b: same(got.E03, exp.E03) && same(got.E01, exp.E01),
  c: same(got.E05, exp.E05) && same(got.E06, exp.E06) && same(got.E07, exp.E07),
  d: same(got.E08, exp.E08) && same(got.E09, exp.E09),
  e: candA.counts?.rows === censusRowCount - exp.E02.length,
  f: same(got.E12, exp.E12),
};

// (g) real registries, snapshot of each lane's corpus/
const lanes = readdirSync(FLEET).filter((n) => n.endsWith('-shokunin') && existsSync(join(FLEET, n, 'corpus', 'SOURCES.md'))).sort();
let gOk = 0; const gBad = [];
for (const lane of lanes) {
  const snap = join(work, 'snap', lane);
  mkdirSync(snap, { recursive: true });
  cpSync(join(FLEET, lane, 'corpus'), join(snap, 'corpus'), { recursive: true, dereference: false, verbatimSymlinks: true });
  const b = JSON.stringify(runTool(basePath, snap));
  const c = JSON.stringify(runTool(candPath, snap));
  if (b === c && !b.includes('"parseError"')) gOk += 1; else gBad.push(lane);
}
// (h) selftest
const st = spawnSync('node', [candPath, '--selftest'], { env: { ...toolEnv, SHOKUNIN_ROOT: FLEET }, maxBuffer: 1 << 26, timeout: 300_000 });
const stOut = String(st.stdout);
const h = st.status === 0 && /^VERDICT: PASS$/m.test(stOut) && !/SKIP/.test(stOut);

const held = arm.a && arm.b && arm.c && arm.d && arm.e && arm.f && gOk === lanes.length && h;
const diag = Object.entries(exp).map(([c, e]) => `${c}=${got[c].length}/${e.length}`).join(' ');
process.stdout.write(`C99_C1: ${held ? 'HELD' : 'UNMET'} a=${+arm.a}/1 b=${+arm.b}/1 c=${+arm.c}/1 d=${+arm.d}/1 e=${+arm.e}/1 f=${+arm.f}/1 g=${gOk}/${lanes.length} h=${+h}/1` +
  ` rows=${rows.length} census_rows=${censusRowCount} tool_rows=${candA.counts?.rows} ${diag}${gBad.length ? ` g_bad=${gBad.join(',')}` : ''}` +
  ` seed=${seed} tool_sha256=${toolSha}\n`);
process.exit(held ? 0 : 1);

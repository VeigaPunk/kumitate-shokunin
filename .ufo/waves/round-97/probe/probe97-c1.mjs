#!/usr/bin/env node
/**
 * probe97-c1.mjs — frozen counter for kumitate round 97, claim C1 (operability):
 * the lane's `scripts/sources-check.mjs` reads `corpus/SOURCES.md` sections exactly as the fleet census
 * `row_pass` does (sources-census.sh: a line matching `^ {0,3}##[ \t]` sets the section to the text after
 * its first `##`, leading 0-3 spaces removed, trimmed of spaces/tabs only — CR, VT, FF, NBSP kept; the
 * Registry iff that text equals `Registry`; otherwise `^ {0,3}#[ \t]` clears it; the state starts outside),
 * so its ROW_OUTSIDE_REGISTRY ids equal the census E12 ids and its registry row count equals the census
 * `rows` on every fixture of a battery derived from the census grammar's character classes, with nonce
 * ids, URLs and case order drawn fresh on every run.
 *
 *   node probe97-c1.mjs --tool <candidate sources-check.mjs> --work <scratch dir> --freeze <REV>
 *       --rev <lane REV for the no-regression arm> [--lane DIR] [--census PATH] [--seed HEX]
 *       [--today YYYY-MM-DD]
 *
 * Read-only on --lane: it reads blobs with `git -C <lane> show/cat-file/log/archive` only. The candidate
 * runs from <work>/scripts/sources-check-cand.mjs beside the freeze's cap-spawn.mjs / cap-run.mjs; BASE is
 * `git show <freeze>:scripts/sources-check.mjs` at <work>/scripts/sources-check-base.mjs.
 *
 * Grammar battery (round-96 lesson M96-2: derive the battery from the census grammar, nonce fixtures).
 * One case = context line, test line, probe row. Contexts: `## Registry`, `## Leads (unopened)`, `# Title`.
 * Test line = indent x marker x separator x text x trail with
 *   indent    '', ' ', '   ', '    ', '\t', ' \t'                    (census ` {0,3}` + its complements)
 *   marker    '#', '##', '###'                                          (census `#` / `##` + a longer run)
 *   separator ' ', '\t', '  ', ' \t', '', '\v', '\f', '\r', '\u00a0'    (census `[ \t]` + JS `\s` extras)
 *   text      'Registry', 'registry', 'Registry ##', 'Leads', ''       (exact match, case, closing seq)
 *   trail     '', ' ', '\t', '\r', '\v', '\f', '\u00a0', ' \r'          (census trim class + JS trim extras)
 * plus row-shape cases (row indent '', ' ', '   ', '    ', '\t', '  \t' and id-cell padding under the
 * Registry and Leads contexts) and one row before any heading. Each probe row carries a fresh nonce id.
 *
 * Predicate C97_C1 HELD iff all of:
 *  (a) LF     fixture F_A: candidate --json ROW_OUTSIDE_REGISTRY ids (finding order) == census E12 ids
 *             (output order) and candidate counts.rows == census `rows`.
 *  (b) CRLF   F_B = F_A with every LF -> CRLF: same equality.
 *  (c) MIXED  F_C = F_A with a seeded half of its lines CRLF: same equality.
 *  (d) NO-REG lane archive at --rev: candidate text stdout + exit == BASE text stdout + exit, and candidate
 *             --json stdout == BASE --json stdout (same --today).
 *  (e) HIST   every distinct `corpus/SOURCES.md` blob in the lane's history up to --rev: candidate
 *             (outside ids, rows) == census (E12 ids, rows).
 *  (f) SELFTEST candidate --selftest exits 0 and prints `VERDICT: PASS`.
 * Exit: 0 HELD · 1 UNMET · 2 SETUP (census exit 2 / no output, BASE gives no JSON, the census E12
 * list is empty on a battery fixture (F_A/F_B/F_C), or a git/fixture step failed).
 */
import { spawnSync } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import { copyFileSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const LANE = resolve(opt('--lane', '/home/vgpnk/Projects/shokunin/kumitate-shokunin'));
const FREEZE = opt('--freeze', null);
const REV = opt('--rev', null);
const CENSUS = resolve(opt('--census', '/home/vgpnk/Projects/shokunin/scripts/sources-census.sh'));
const TOOL = opt('--tool', null);
const WORK = opt('--work', null);
const TODAY = opt('--today', '2026-11-07');
const SEED = opt('--seed', randomBytes(8).toString('hex'));

const out = [];
const say = (s) => { out.push(s); process.stdout.write(`${s}\n`); };
function setup(msg) { say(`SETUP: ${msg}`); say('C97_C1: SETUP'); process.exit(2); }
if (!FREEZE || !REV || !TOOL || !WORK) { say('usage: --tool --work --freeze --rev required'); process.exit(64); }

/* seeded PRNG (xorshift128+ over the hex seed) so a run is reproducible from its receipt */
let s0 = BigInt(`0x${createHash('sha256').update(`a${SEED}`).digest('hex').slice(0, 16)}`);
let s1 = BigInt(`0x${createHash('sha256').update(`b${SEED}`).digest('hex').slice(0, 16)}`);
const M64 = (1n << 64n) - 1n;
function rnd() {
  let x = s0; const y = s1; s0 = y; x ^= (x << 23n) & M64; s1 = x ^ y ^ (x >> 17n) ^ (y >> 26n);
  return Number(((s1 + y) & M64) >> 11n) / 2 ** 53;
}
const hex = (n) => Array.from({ length: n }, () => Math.floor(rnd() * 16).toString(16)).join('');
const usedIds = new Set();
function nonceId() {
  for (;;) {
    const id = `S${1000 + Math.floor(rnd() * 8_999_000)}`;
    if (!usedIds.has(id)) { usedIds.add(id); return id; }
  }
}
function row(id) {
  const tag = hex(10);
  return `| ${id} | Probe ${tag} — https://n${tag}.example/${hex(6)} | docs | B | scope-${tag} | §1 | probe teaches ${hex(4)} | queued | 2026-10-01 | 90d | — |`;
}

function git(...a) {
  const r = spawnSync('git', ['-C', LANE, ...a], { encoding: 'buffer', maxBuffer: 1 << 28 });
  if (r.status !== 0) setup(`git ${a.join(' ')} -> ${r.status} ${String(r.stderr).trim()}`);
  return r.stdout;
}

const work = resolve(WORK);
rmSync(work, { recursive: true, force: true });
mkdirSync(join(work, 'scripts'), { recursive: true });
for (const f of ['cap-spawn.mjs', 'cap-run.mjs']) writeFileSync(join(work, 'scripts', f), git('show', `${FREEZE}:scripts/${f}`));
writeFileSync(join(work, 'scripts', 'sources-check-base.mjs'), git('show', `${FREEZE}:scripts/sources-check.mjs`));
copyFileSync(resolve(TOOL), join(work, 'scripts', 'sources-check-cand.mjs'));
const CAND = join(work, 'scripts', 'sources-check-cand.mjs');
const BASE = join(work, 'scripts', 'sources-check-base.mjs');
const sha = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');
say(`# probe97-c1 freeze=${FREEZE} rev=${REV} seed=${SEED} today=${TODAY}`);
say(`# tool_sha256=${sha(CAND)} base_sha256=${sha(BASE)} census_sha256=${sha(CENSUS)}`);

function runNode(tool, a) {
  const r = spawnSync(process.execPath, [tool, ...a], { encoding: 'utf8', maxBuffer: 1 << 28, timeout: 600_000 });
  return { status: r.status, stdout: r.stdout ?? '', stderr: r.stderr ?? '' };
}
function candRead(tool, self) {
  const r = runNode(tool, ['--self', self, '--today', TODAY, '--json']);
  let j;
  try { j = JSON.parse(r.stdout); } catch { return { ok: false, why: `no JSON exit=${r.status} ${r.stderr.slice(0, 200)}` }; }
  if (!j.counts) return { ok: false, why: `no counts verdict=${j.verdict}` };
  const outside = (j.findings ?? []).filter((f) => f.kind === 'ROW_OUTSIDE_REGISTRY')
    .map((f) => (/^id=(\S+)/.exec(f.detail ?? '') ?? [])[1] ?? '?');
  return { ok: true, outside, rows: j.counts.rows };
}
function censusRead(file) {
  const v = spawnSync('bash', [CENSUS, 'validate', '--file', file], { encoding: 'utf8', maxBuffer: 1 << 28 });
  if (v.status === 2 || v.status === null) setup(`census validate exit=${v.status} ${String(v.stderr).slice(0, 200)}`);
  const e12 = v.stdout.split('\n').map((l) => l.split('\t')).filter((p) => p[1] === 'E12').map((p) => p[2].split(' ')[0]);
  const c = spawnSync('bash', [CENSUS, 'census', '--file', file], { encoding: 'utf8', maxBuffer: 1 << 28 });
  const m = /^file\trows\t(\d+)$/m.exec(c.stdout ?? '');
  if (!m) setup(`census rows missing exit=${c.status}`);
  return { outside: e12, rows: Number(m[1]) };
}
function fixtureDir(name, text) {
  const d = join(work, 'fx', name);
  mkdirSync(join(d, 'corpus', 'knowledge'), { recursive: true });
  writeFileSync(join(d, 'corpus', 'SOURCES.md'), text);
  return d;
}
const same = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);

/* ---------------------------------------------------------------- grammar battery */
const INDENT = ['', ' ', '   ', '    ', '\t', ' \t'];
const MARKER = ['#', '##', '###'];
const SEP = [' ', '\t', '  ', ' \t', '', '\v', '\f', '\r', '\u00a0'];
const TEXT = ['Registry', 'registry', 'Registry ##', 'Leads', ''];
const TRAIL = ['', ' ', '\t', '\r', '\v', '\f', '\u00a0', ' \r'];
const CTX = ['## Registry', '## Leads (unopened)', '# Title'];
const cases = [];
for (const c of CTX) for (const i of INDENT) for (const m of MARKER) for (const s of SEP) for (const t of TEXT) for (const r of TRAIL) {
  cases.push({ label: JSON.stringify([c, i + m + s + t + r]), lines: [c, i + m + s + t + r] });
}
for (const c of CTX.slice(0, 2)) {
  for (const ri of ['', ' ', '   ', '    ', '\t', '  \t']) cases.push({ label: JSON.stringify([c, `row-indent:${ri}`]), lines: [c], rowIndent: ri });
  for (const pad of ['|S', '|\tS', '|  S']) cases.push({ label: JSON.stringify([c, `row-pad:${pad}`]), lines: [c], rowPad: pad });
}
for (let k = cases.length - 1; k > 0; k -= 1) { const j = Math.floor(rnd() * (k + 1)); [cases[k], cases[j]] = [cases[j], cases[k]]; }
const labelOf = new Map();
const lines = [];
{ const id = nonceId(); labelOf.set(id, '"row before any heading"'); lines.push(row(id)); }
for (const cs of cases) {
  const id = nonceId();
  labelOf.set(id, cs.label);
  let r = row(id);
  if (cs.rowPad) r = r.replace(/^\| /, cs.rowPad.slice(0, -1));
  lines.push(...cs.lines, `${cs.rowIndent ?? ''}${r}`);
}
const FA = `${lines.join('\n')}\n`;
const FB = FA.replace(/\n/g, '\r\n');
const FC = `${lines.map((l) => (rnd() < 0.5 ? `${l}\r` : l)).join('\n')}\n`;
say(`# battery cases=${cases.length + 1} lines=${lines.length} F_A_sha256=${createHash('sha256').update(FA).digest('hex')}`);

const verdict = {};
function arm(key, name, text, sanity) {
  const d = fixtureDir(name, text);
  const cen = censusRead(join(d, 'corpus', 'SOURCES.md'));
  if (sanity && cen.outside.length === 0) setup(`census sanity on ${name}: e12=${cen.outside.length} rows=${cen.rows}`);
  const cand = candRead(CAND, d);
  if (!cand.ok) { verdict[key] = false; say(`${key}: FAIL ${name} candidate ${cand.why}`); return; }
  const outSet = new Set(cen.outside); const candSet = new Set(cand.outside);
  const all = [...labelOf.keys()];
  const agree = all.filter((id) => outSet.has(id) === candSet.has(id)).length;
  const ok = same(cand.outside, cen.outside) && cand.rows === cen.rows;
  verdict[key] = ok;
  say(`${key}: ${ok ? 'PASS' : 'FAIL'} ${name} agree=${agree}/${all.length} census_e12=${cen.outside.length} cand_outside=${cand.outside.length} census_rows=${cen.rows} cand_rows=${cand.rows}`);
  if (!ok) {
    const dis = all.filter((id) => outSet.has(id) !== candSet.has(id));
    for (const id of dis.slice(0, 12)) say(`  disagree ${labelOf.get(id)} census=${outSet.has(id) ? 'out' : 'in'} cand=${candSet.has(id) ? 'out' : 'in'}`);
    if (dis.length > 12) say(`  … ${dis.length - 12} more disagreeing cases`);
    if (dis.length === 0) say(`  order or multiplicity differs (sets agree)`);
  }
}
arm('a', 'F_A-lf', FA, true);
arm('b', 'F_B-crlf', FB, true);
arm('c', 'F_C-mixed', FC, true);

/* ---------------------------------------------------------------- (d) no-regression on the lane */
{
  const d = join(work, 'lane-rev');
  mkdirSync(d, { recursive: true });
  const tar = git('archive', REV, 'corpus');
  const x = spawnSync('tar', ['-x', '-C', d], { input: tar });
  if (x.status !== 0) setup('tar extract failed');
  const bt = runNode(BASE, ['--self', d, '--today', TODAY]);
  const ct = runNode(CAND, ['--self', d, '--today', TODAY]);
  const bj = runNode(BASE, ['--self', d, '--today', TODAY, '--json']);
  const cj = runNode(CAND, ['--self', d, '--today', TODAY, '--json']);
  try { JSON.parse(bj.stdout); } catch { setup('BASE gives no JSON on the lane'); }
  const ok = bt.stdout === ct.stdout && bt.status === ct.status && bj.stdout === cj.stdout;
  verdict.d = ok;
  say(`d: ${ok ? 'PASS' : 'FAIL'} lane@${REV.slice(0, 12)} base_exit=${bt.status} cand_exit=${ct.status} text_equal=${bt.stdout === ct.stdout} json_equal=${bj.stdout === cj.stdout} base_last=${bt.stdout.trim().split('\n').at(-1)}`);
}

/* ---------------------------------------------------------------- (e) every historical registry blob */
{
  const revs = String(git('log', '--format=%H', REV, '--', 'corpus/SOURCES.md')).trim().split('\n').filter(Boolean);
  const blobs = new Set();
  for (const r of revs) {
    const b = spawnSync('git', ['-C', LANE, 'rev-parse', `${r}:corpus/SOURCES.md`], { encoding: 'utf8' });
    if (b.status === 0) blobs.add(b.stdout.trim());
  }
  let pass = 0; const fails = [];
  for (const b of blobs) {
    const d = fixtureDir(`hist-${b.slice(0, 12)}`, git('cat-file', 'blob', b));
    const cen = censusRead(join(d, 'corpus', 'SOURCES.md'));
    const cand = candRead(CAND, d);
    if (cand.ok && same(cand.outside, cen.outside) && cand.rows === cen.rows) pass += 1;
    else fails.push(`${b.slice(0, 12)}:${cand.ok ? `cand=${cand.outside.length}/${cand.rows} census=${cen.outside.length}/${cen.rows}` : cand.why}`);
  }
  verdict.e = blobs.size > 0 && pass === blobs.size;
  say(`e: ${verdict.e ? 'PASS' : 'FAIL'} historical blobs agree=${pass}/${blobs.size}${fails.length ? ` first=${fails.slice(0, 3).join(' ')}` : ''}`);
}

/* ---------------------------------------------------------------- (f) selftest */
{
  const r = runNode(CAND, ['--selftest']);
  const last = r.stdout.trim().split('\n');
  verdict.f = r.status === 0 && last.at(-1) === 'VERDICT: PASS';
  say(`f: ${verdict.f ? 'PASS' : 'FAIL'} selftest exit=${r.status} ${last.at(-2) ?? ''} ${last.at(-1) ?? ''}`);
}

rmSync(join(work, 'fx'), { recursive: true, force: true });
rmSync(join(work, 'lane-rev'), { recursive: true, force: true });
const held = ['a', 'b', 'c', 'd', 'e', 'f'].every((k) => verdict[k] === true);
const tally = ['a', 'b', 'c', 'd', 'e', 'f'].map((k) => `${k}=${verdict[k] ? 1 : 0}/1`).join(' ');
say(`C97_C1: ${held ? 'HELD' : 'UNMET'} ${tally} tool_sha256=${sha(CAND)} seed=${SEED}`);
process.exit(held ? 0 : 1);

#!/usr/bin/env node
/**
 * probe95-c1.mjs — frozen counter for kumitate round 95, claim C1 (operability):
 * `round-gate` trusts a SOURCES.md registry row's cells only when the row has the census shape
 * (exactly 13 `|`-split fields = 11 cells, CORPUS.md census `NF==13`); a malformed registry row
 * declares no pin and is disclosed by id in `--json` `citations.malformedRows`.
 *
 *   node probe95-c1.mjs --tool <candidate round-gate.mjs> --work <scratch dir> --freeze <REV>
 *       [--lane DIR] [--fleet DIR] [--fleet-rev REV] [--origin DIR]
 *
 * Read-only on --lane / --fleet / --origin: it clones the lane with `git clone --shared` into
 * --work, checks out --freeze detached, copies the candidate beside the base gate in the clone
 * (`scripts/round-gate-cand.mjs`, so `./cap-spawn.mjs` resolves), materialises every
 * `.ufo/reports/round-N/kumitate.md` of --fleet at --fleet-rev into --work, and runs BASE
 * (`git show <freeze>:scripts/round-gate.mjs`) and CANDIDATE with --json. Synthetic fixture
 * repos are built under --work with `git -C <fixture>` only (toplevel asserted).
 *
 * Predicate C95_C1 HELD iff all of:
 *  (a) FIXTURE  synthetic registry (10 rows/lines, see SOURCES below): candidate
 *               citations.declared == exactly {okA, indentF, plainH};
 *               citations.unresolved == exactly {shiftB, escC, shortD, rejE, longG, proseI, codeJ, none};
 *               citations.malformedRows == exactly ['S002','S003','S004','S007'] (file order) AND
 *               equals the census awk list (`NF!=13` over `^ {0,3}| S<3+ digits> |` rows) of the
 *               same file.
 *  (b) NOSRC    fixture without corpus/SOURCES.md: malformedRows is an empty array, declared is
 *               empty, all 11 tokens unresolved, verdict DRIFT, no INTERNAL_ERROR.
 *  (c) NO-REG   every filed kumitate report at --fleet-rev: candidate (id, ok) check vector ==
 *               BASE vector, exit equal, declared set == BASE declared set, and
 *               citations.malformedRows is an empty array.
 *  (d) SELFTEST candidate `--selftest` exits 0 and prints `VERDICT: PASS`.
 * Exit: 0 HELD · 1 UNMET · 2 SETUP (environment drift: BASE gives no JSON, or a fixture/clone
 * step failed).
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFileSync, mkdirSync, readFileSync, rmSync, writeFileSync, realpathSync } from 'node:fs';
import { join, resolve } from 'node:path';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const LANE = resolve(opt('--lane', '/home/vgpnk/Projects/shokunin/kumitate-shokunin'));
const FREEZE = opt('--freeze', null);
const FLEET = resolve(opt('--fleet', '/home/vgpnk/Projects/shokunin'));
const FLEET_REV = opt('--fleet-rev', 'e2c52ba893c7d43cd1de92b30458e2d4c8e4098c');
const ORIGIN = resolve(opt('--origin', '/home/vgpnk/Projects/ufo-fsd-alpha'));
const TOOL = opt('--tool', null);
const WORK = opt('--work', null);

const out = [];
const say = (s) => { out.push(s); };
const sha = (buf) => createHash('sha256').update(buf).digest('hex');
const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith('GIT_')));
env.GIT_CONFIG_NOSYSTEM = '1';
const run = (cmd, argv, o = {}) => spawnSync(cmd, argv, { encoding: 'utf8', env, maxBuffer: 64 << 20, timeout: 600000, ...o });
const git = (dir, argv) => run('git', ['-C', dir, ...argv]);
function setup(msg) { say(`SETUP: ${msg}`); finish(2); }
function finish(code) {
  process.stdout.write(`${out.join('\n')}\n`);
  process.exit(code);
}

if (!TOOL || !WORK || !FREEZE) setup('usage: --tool --work --freeze are required');
const toolBytes = readFileSync(TOOL);
mkdirSync(WORK, { recursive: true });
const W = realpathSync(WORK);
rmSync(join(W, 'p95'), { recursive: true, force: true });
const P = join(W, 'p95');
mkdirSync(P, { recursive: true });

/* clone ------------------------------------------------------------------- */
const CL = join(P, 'lane');
let r = run('git', ['clone', '-q', '--shared', '--no-checkout', LANE, CL]);
if (r.status !== 0) setup(`clone: ${r.stderr}`);
if (git(CL, ['rev-parse', '--show-toplevel']).stdout.trim() !== CL) setup('clone toplevel mismatch');
r = git(CL, ['-c', 'advice.detachedHead=false', 'checkout', '-q', '--detach', FREEZE]);
if (r.status !== 0) setup(`checkout ${FREEZE}: ${r.stderr}`);
const baseBytes = git(CL, ['show', `${FREEZE}:scripts/round-gate.mjs`]).stdout;
const BASE = join(CL, 'scripts', 'round-gate.mjs');
const CAND = join(CL, 'scripts', 'round-gate-cand.mjs');
copyFileSync(TOOL, CAND);
say(`C95 freeze=${FREEZE} fleet_rev=${FLEET_REV} base_sha256=${sha(baseBytes)} tool_sha256=${sha(toolBytes)}`);

const gate = (tool, round, repo, reports, main, origin) => {
  const g = run(process.execPath, [tool, '--round', String(round), '--lane', 'kumitate', '--repo', repo,
    '--reports-dir', reports, '--main-repo', main, '--origin', origin, '--json'], { cwd: repo });
  let j = null;
  try { j = JSON.parse(g.stdout); } catch { j = null; }
  return { status: g.status, j, stderr: g.stderr };
};
const vec = (j) => (j && Array.isArray(j.checks) ? j.checks.map((c) => `${c.id}:${c.ok}`) : null);
const setEq = (a, b) => a.length === b.length && [...a].sort().join(' ') === [...b].sort().join(' ');
const decl = (j) => (j && j.citations && Array.isArray(j.citations.declared) ? j.citations.declared : []);
const unres = (j) => (j && j.citations && Array.isArray(j.citations.unresolved) ? j.citations.unresolved : null);
const malf = (j) => (j && j.citations && Array.isArray(j.citations.malformedRows) ? j.citations.malformedRows : null);

/* (a)(b) synthetic fixtures ------------------------------------------------- */
const hex = (seed) => sha(`kumitate-r95-${seed}`).slice(0, 40);
const SEEDS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
const PIN = Object.fromEntries(SEEDS.map((s) => [s, hex(s)]));
const TOK = {
  okA: PIN.A.slice(0, 8),
  shiftB: PIN.B.slice(0, 8),
  escC: PIN.C.slice(0, 8),
  shortD: PIN.D.slice(0, 8),
  rejE: PIN.E.slice(0, 8),
  indentF: PIN.F.slice(0, 8),
  longG: PIN.G.slice(0, 8),
  plainH: PIN.H.slice(0, 7),
  proseI: PIN.I.slice(0, 8),
  codeJ: PIN.J.slice(0, 8),
  none: hex('none').slice(0, 8),
};
const EXP_DECL = ['okA', 'indentF', 'plainH'];
const EXP_UNRES = ['shiftB', 'escC', 'shortD', 'rejE', 'longG', 'proseI', 'codeJ', 'none'];
const EXP_MALF = ['S002', 'S003', 'S004', 'S007'];
const url = (p) => `https://github.com/o/r/blob/${p}/x.ts`;
const cells = (id, src, scope, teaches, status, tail = ' 2026-11-07 | 30d | — |') => `| ${id} | ${src} | code | A | ${scope} | anchor | ${teaches} | ${status} |${tail}`;
const SOURCES = [
  '# SOURCES — fixture', '',
  `Prose mention, not a registry row: ${url(PIN.I)}`, '',
  '## Registry', '',
  '| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |',
  '|---|---|---|---|---|---|---|---|---|---|---|',
  // S001 well-formed mined -> declares A
  cells('S001', `x.ts — ${url(PIN.A)}`, 'scope', 'teaches', 'mined'),
  // S002 unescaped `|` in the scope cell shifts every later cell; true status `rejected` (14 fields)
  cells('S002', `y.ts — ${url(PIN.B)}`, 'scope a | scope b', 'teaches', 'rejected'),
  // S003 GFM-escaped `\|` inside a cell (14 fields under a plain split; census-malformed)
  cells('S003', `z.ts — ${url(PIN.C)}`, 'scope', 'a \\| b', 'mined'),
  // S004 one cell short: used-by missing (12 fields)
  cells('S004', `w.ts — ${url(PIN.D)}`, 'scope', 'teaches', 'mined', ' 2026-11-07 | 30d |'),
  // S005 well-formed rejected -> declares nothing, not malformed
  cells('S005', `v.ts — ${url(PIN.E)}`, 'scope', 'teaches', 'rejected'),
  // S006 3-space indent, well-formed, queued -> declares F
  `   ${cells('S006', `u.ts — ${url(PIN.F)}`, 'scope', 'teaches', 'queued')}`,
  // S007 one extra cell at the end (14 fields), status column 8 still reads mined
  cells('S007', `t.ts — ${url(PIN.G)}`, 'scope', 'teaches', 'mined', ' 2026-11-07 | 30d | — | extra |'),
  // S008 well-formed mined, teaches mentions "rejected", `?plain=1` URL -> declares H (7-hex token)
  cells('S008', `s.ts — https://github.com/o/r/blob/${PIN.H}/s.ts?plain=1`, 'scope', 'superseded the rejected draft', 'mined'),
  '',
  // 4-space indent is an indented code block, not a registry row
  `    ${cells('S010', `r.ts — ${url(PIN.J)}`, 'scope', 'teaches', 'mined')}`,
  '',
].join('\n');
const tokLine = Object.values(TOK).map((t) => `\`${t}\``).join(' ');
const reportText = `# kumitate round-1 fixture\n\n## Work\n\nCited: ${tokLine}\n\n## SHONEN\n\n- [~] x\n\n${'Fixture padding for the report weight floor. '.repeat(40)}\n`;
function fixture(name, withSources) {
  const F = join(P, `fx-${name}`);
  mkdirSync(join(F, 'corpus'), { recursive: true });
  let g = git(F, ['init', '-q', '-b', 'main']);
  if (g.status !== 0 || git(F, ['rev-parse', '--show-toplevel']).stdout.trim() !== F) setup(`fixture ${name} init`);
  writeFileSync(join(F, 'SCORECARD.md'), '# S\n\n| 1 | x |\n\n## Planned\n\nround 2: x\n');
  writeFileSync(join(F, 'LOG.md'), '- 2026-11-07 — round 1 fixture\n');
  if (withSources) writeFileSync(join(F, 'corpus', 'SOURCES.md'), SOURCES);
  else writeFileSync(join(F, 'corpus', 'README.md'), 'no registry\n');
  g = git(F, ['add', '-A']);
  g = git(F, ['-c', 'user.name=p95', '-c', 'user.email=p95@fixture.invalid', 'commit', '-q', '-m', 'round-1 fixture']);
  if (g.status !== 0) setup(`fixture ${name} commit: ${g.stderr}`);
  const R = join(F, '..', `fx-${name}-reports`);
  mkdirSync(join(R, 'round-1'), { recursive: true });
  writeFileSync(join(R, 'round-1', 'kumitate.md'), reportText);
  return { F, R };
}
const names = (list) => Object.entries(TOK).filter(([, t]) => list.includes(t)).map(([k]) => k);

const fx1 = fixture('sources', true);
const aw = run('awk', ['-F|', '/^ {0,3}\\|[[:space:]]*S[0-9][0-9][0-9]+[[:space:]]*\\|/ && NF!=13 {i=$2; gsub(/[[:space:]]/,"",i); print i}',
  join(fx1.F, 'corpus', 'SOURCES.md')]);
if (aw.status !== 0) setup(`census awk: ${aw.stderr}`);
const censusIds = aw.stdout.split('\n').filter(Boolean);
if (censusIds.join(' ') !== EXP_MALF.join(' ')) setup(`census awk ids [${censusIds.join(' ')}] != frozen fixture expectation`);
const d1 = gate(CAND, 1, fx1.F, fx1.R, fx1.F, fx1.F);
const d1decl = names(decl(d1.j)); const d1un = names(unres(d1.j) ?? []); const d1m = malf(d1.j);
const aOk = Boolean(d1.j) && setEq(d1decl, EXP_DECL) && setEq(d1un, EXP_UNRES)
  && d1m !== null && d1m.join(' ') === EXP_MALF.join(' ') && d1m.join(' ') === censusIds.join(' ');
say(`C95 FX sources exit=${d1.status} declared=[${d1decl.join(' ')}] unresolved=[${d1un.join(' ')}] malformedRows=${JSON.stringify(d1m)} census=[${censusIds.join(' ')}] ok=${aOk}`);
const b1 = gate(BASE, 1, fx1.F, fx1.R, fx1.F, fx1.F);
say(`C95 FX sources BASE exit=${b1.status} declared=[${names(decl(b1.j)).join(' ')}] malformedRows=${JSON.stringify(malf(b1.j))}`);

const fx2 = fixture('nosources', false);
const d2 = gate(CAND, 1, fx2.F, fx2.R, fx2.F, fx2.F);
const d2un = names(unres(d2.j) ?? []); const d2m = malf(d2.j);
const nTok = Object.keys(TOK).length;
const bOk = Boolean(d2.j) && d2.j.verdict === 'DRIFT' && d2un.length === nTok && decl(d2.j).length === 0
  && d2m !== null && d2m.length === 0 && !(d2.j.findings ?? []).some((f) => f.kind === 'INTERNAL_ERROR');
say(`C95 FX nosources exit=${d2.status} verdict=${d2.j ? d2.j.verdict : 'none'} unresolved=${d2un.length}/${nTok} malformedRows=${JSON.stringify(d2m)} ok=${bOk}`);

/* (c) every filed report at the fleet pin ----------------------------------- */
const RD = join(P, 'reports');
const ls = git(FLEET, ['ls-tree', '-r', '--name-only', FLEET_REV, '.ufo/reports']);
if (ls.status !== 0) setup(`fleet ls-tree: ${ls.stderr}`);
const rounds = [];
const manifest = [];
for (const p of ls.stdout.split('\n')) {
  const m = /^\.ufo\/reports\/round-(\d+)\/kumitate\.md$/.exec(p);
  if (!m) continue;
  const n = Number(m[1]);
  const body = git(FLEET, ['show', `${FLEET_REV}:${p}`]);
  if (body.status !== 0) setup(`fleet show ${p}`);
  mkdirSync(join(RD, `round-${n}`), { recursive: true });
  writeFileSync(join(RD, `round-${n}`, 'kumitate.md'), body.stdout);
  manifest.push(`${n} ${sha(body.stdout)}`);
  rounds.push(n);
}
rounds.sort((a, b) => a - b);
say(`C95 reports=${rounds.length} manifest_sha256=${sha(manifest.sort().join('\n'))}`);
let cOk = 0; const fails = [];
for (const n of rounds) {
  const b = gate(BASE, n, CL, RD, FLEET, ORIGIN);
  const c = gate(CAND, n, CL, RD, FLEET, ORIGIN);
  if (!b.j) setup(`BASE produced no JSON on round ${n} (exit ${b.status})`);
  if (!c.j) { fails.push(`r${n}:cand-no-json(exit=${c.status})`); continue; }
  const ok = vec(b.j).join('|') === vec(c.j).join('|') && b.status === c.status
    && setEq(decl(b.j), decl(c.j)) && Array.isArray(malf(c.j)) && malf(c.j).length === 0;
  if (ok) cOk++;
  else fails.push(`r${n}:(base_exit=${b.status},cand_exit=${c.status},declared=${decl(c.j).length}/${decl(b.j).length},malformedRows=${JSON.stringify(malf(c.j))})`);
}

/* (d) selftest -------------------------------------------------------------- */
const st = run(process.execPath, [CAND, '--selftest'], { cwd: CL });
const stLine = (st.stdout.match(/^ROUND_GATE_SELFTEST: .*$/m) ?? ['none'])[0];
const dOk = st.status === 0 && /^VERDICT: PASS$/m.test(st.stdout);
say(`C95 SELFTEST exit=${st.status} ${stLine} ok=${dOk}`);

const held = aOk && bOk && cOk === rounds.length && dOk;
say(`C95 fails=${fails.length ? fails.slice(0, 12).join(',') : 'none'}`);
say(`C95_C1: ${held ? 'HELD' : 'UNMET'} a=${aOk ? 1 : 0}/1 b=${bOk ? 1 : 0}/1 c=${cOk}/${rounds.length} d=${dOk ? 1 : 0}/1 tool_sha256=${sha(toolBytes)}`);
rmSync(P, { recursive: true, force: true });
finish(held ? 0 : 1);

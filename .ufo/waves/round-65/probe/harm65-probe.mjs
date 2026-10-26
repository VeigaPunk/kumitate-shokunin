#!/usr/bin/env node
/**
 * harm65-probe.mjs — frozen counter for kumitate round 65 claim C1 (rule H65 v1).
 *
 *   node .ufo/waves/round-65/probe/harm65-probe.mjs <lane-dir> <rev>
 *
 * Output: one verdict line and exit code.
 *   HARM65_HELD  held=5/5 checks=5 rev=<rev> rule=H65   exit 0
 *   HARM65_UNMET held=k/5 checks=5 rev=<rev> rule=H65 | <check> MISS <reason> ...   exit 1
 * Exit 2 only when the revision itself cannot be read. Every lane byte is read with `git archive <rev>`; the lane's git
 * history (for the real-data pairs) is read with `git rev-parse` only.
 *
 * H1 `node scripts/harm-matrix.mjs --selftest` in the archive prints `HARM_MATRIX_SELFTEST: PASS (n/n)` with n >= 20, exit 0.
 * H2 `.ufo/waves/round-65/controls/harm/` holds >= 14 committed case dirs (`spec.json`: gates, base/tip files, expect); the
 *    probe builds each fixture repository itself (own code, not the tool's selftest), runs the archive's tool over it and
 *    the exit code and the sorted `<gate> <ID>` rows equal the case's `expect`; >= 8 distinct row ids are exercised and
 *    >= 2 cases expect exit 0.
 * H3 real data, two lane revision pairs, each judged against direct runs the probe makes itself:
 *    (a) a004902d -> 47fe2383 (the round-64 landing, then the round-64 spot-check commit that landed a file without its
 *        README row): exit 1 and the HARM-id gates are exactly {readme-map, proxy-check}; directly, `node
 *        scripts/readme-map.mjs` and `node scripts/proxy-check.mjs --strict` exit 0 in the first archive and non-zero in the second;
 *    (b) 6825a514 -> a004902d (the round-64 base, then its landing): exit 0, no HARM / HARM_ABSENT / NEW_RED row, and
 *        readme-map and proxy-check both REPAIRED; directly both exit non-zero then 0.
 * H4 the counter can fail (and only counts where the real tool passes H2, so it is never vacuous): a stub tool that always prints `HARM_MATRIX: CLEAN` (exit 0) and one that always prints
 *    `HARM_MATRIX: HARM` (exit 1), each run through the same H2 + H3 harness, miss it.
 * H5 `harm-matrix --base 47fe2383 --tip <rev>` over the archive's full registry (run against the lane history) prints a summary
 *    with gates >= 14 and its exit code is 0 exactly when harm + harm_absent + new_red = 0.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';

const RULE = 'H65';
const ROUND_BASE = '47fe2383151909d31557ada118ad84f90404dc6c';
const PAIR_A = ['a004902d77d17741b807069fa2bd9ce2e310e424', '47fe2383151909d31557ada118ad84f90404dc6c'];
const PAIR_B = ['6825a51425e91908f019ed65aa2f4209acbd7087', 'a004902d77d17741b807069fa2bd9ce2e310e424'];
const GIT_ID = ['-c', 'user.name=harm65-probe', '-c', 'user.email=harm65@invalid', '-c', 'commit.gpgsign=false', '-c', 'core.hooksPath=/dev/null'];
const argv = process.argv.slice(2);
if (argv.length < 2) { process.stderr.write('usage: harm65-probe.mjs <lane-dir> <rev>\n'); process.exit(64); }
const lane = resolve(argv[0]);
const git = (dir, args, o = {}) => spawnSync('git', ['-C', dir, ...args], { encoding: 'utf8', maxBuffer: 64 << 20, ...o });
const rv = git(lane, ['rev-parse', '--verify', `${argv[1]}^{commit}`]);
if (rv.status !== 0) { process.stdout.write(`HARM65_UNMET held=0/5 checks=5 rev=${argv[1]} rule=${RULE} | rev-unreadable\n`); process.exit(2); }
const full = rv.stdout.trim();

const scratch = [];
const tmp = (p) => { const d = realpathSync(mkdtempSync(join(tmpdir(), p))); scratch.push(d); return d; };
const done = (code) => { for (const d of scratch) rmSync(d, { recursive: true, force: true }); process.exit(code); };
const archive = (rev) => {
  const T = tmp('harm65.arc.');
  const r = spawnSync('bash', ['-c', `git -C "${lane}" archive "${rev}" | tar -x -C "${T}"`], { encoding: 'utf8' });
  return r.status === 0 ? T : null;
};
const A = archive(full);
if (!A) { process.stdout.write(`HARM65_UNMET held=0/5 checks=5 rev=${full} rule=${RULE} | archive-failed\n`); done(2); }

const miss = [];
const results = {};
const check = (id, ok, why) => { results[id] = ok; if (!ok) miss.push(`${id} MISS ${why}`); };

// ---- fixture harness (the probe's own implementation)
function build(spec) {
  const D = tmp('harm65.fx.');
  const g = (a) => git(D, [...GIT_ID, ...a]);
  git(D, ['init', '-q']);
  if (realpathSync(git(D, ['rev-parse', '--show-toplevel']).stdout.trim()) !== D) throw new Error('fixture toplevel mismatch');
  const put = (files) => { for (const [p, b] of Object.entries(files || {})) { mkdirSync(dirname(join(D, p)), { recursive: true }); writeFileSync(join(D, p), b); } };
  put(spec.base);
  writeFileSync(join(D, 'gates.json'), spec.gates_raw !== undefined ? spec.gates_raw : JSON.stringify({ gates: spec.gates }));
  g(['add', '-A']); g(['commit', '-q', '-m', 'b']);
  const b = git(D, ['rev-parse', 'HEAD']).stdout.trim();
  put(spec.tip);
  for (const p of spec.tip_delete || []) rmSync(join(D, p), { force: true });
  g(['add', '-A']);
  if (!spec.same_rev) g(['commit', '-q', '--allow-empty', '-m', 't']);
  return { D, b, t: git(D, ['rev-parse', 'HEAD']).stdout.trim() };
}
function runCase(toolCmd, spec) {
  const fx = build(spec);
  const sub = (s) => String(s).replaceAll('{BASE}', fx.b).replaceAll('{TIP}', fx.t).replaceAll('{DIR}', fx.D);
  const args = (spec.args || ['--base', '{BASE}', '--tip', '{TIP}', '--gates', '{DIR}/gates.json']).map(sub);
  const r = spawnSync(toolCmd[0], [...toolCmd.slice(1), '--lane', fx.D, ...args], { encoding: 'utf8', timeout: 120000 });
  const rows = r.stdout.split('\n').filter((l) => l.startsWith('HARM_ROW ')).map((l) => { const m = /gate=(\S+) .* id=(\S+) base_text/.exec(l); return m ? `${m[1]} ${m[2]}` : l; }).sort();
  return { exit: r.status, rows };
}
const controlsDir = join(A, '.ufo/waves/round-65/controls/harm');
const specs = existsSync(controlsDir)
  ? readdirSync(controlsDir).filter((d) => /^case-\d+/.test(d)).sort().map((d) => { try { return { name: d, spec: JSON.parse(readFileSync(join(controlsDir, d, 'spec.json'), 'utf8')) }; } catch { return { name: d, spec: null }; } })
  : [];
function h2(toolCmd) {
  const why = [];
  if (specs.length < 14) why.push(`controls=${specs.length}<14`);
  const ids = new Set(); let zero = 0;
  for (const { name, spec } of specs) {
    if (!spec || !spec.expect) { why.push(`${name}:spec-unreadable`); continue; }
    let got;
    try { got = runCase(toolCmd, spec); } catch (e) { why.push(`${name}:threw`); continue; }
    const want = [...spec.expect.rows].sort();
    if (got.exit !== spec.expect.exit || JSON.stringify(got.rows) !== JSON.stringify(want)) why.push(`${name}:got exit=${got.exit} rows=${JSON.stringify(got.rows)}`);
    for (const r of spec.expect.rows) ids.add(r.split(' ')[1]);
    if (spec.expect.exit === 0) zero++;
  }
  if (ids.size < 8) why.push(`ids=${ids.size}<8`);
  if (zero < 2) why.push(`exit0-cases=${zero}<2`);
  return why;
}

// ---- H1
const TOOL = ['node', join(A, 'scripts/harm-matrix.mjs')];
if (!existsSync(TOOL[1])) check('H1', false, 'tool-absent');
else {
  const r = spawnSync('node', [TOOL[1], '--selftest'], { cwd: A, encoding: 'utf8', timeout: 600000 });
  const m = /HARM_MATRIX_SELFTEST: PASS \((\d+)\/(\d+)\)/.exec(r.stdout || '');
  check('H1', r.status === 0 && !!m && m[1] === m[2] && Number(m[2]) >= 20, `selftest exit=${r.status} line=${m ? m[0] : 'none'}`);
}

// ---- direct runs for H3 (independent of the tool)
const directRc = (rev, args) => {
  const T = archive(rev);
  if (!T) return null;
  return spawnSync('node', args, { cwd: T, encoding: 'utf8', timeout: 120000 }).status;
};
let direct = null;
function loadDirect() {
  if (direct) return direct;
  direct = {
    aBase: [directRc(PAIR_A[0], ['scripts/readme-map.mjs']), directRc(PAIR_A[0], ['scripts/proxy-check.mjs', '--strict'])],
    aTip: [directRc(PAIR_A[1], ['scripts/readme-map.mjs']), directRc(PAIR_A[1], ['scripts/proxy-check.mjs', '--strict'])],
    bBase: [directRc(PAIR_B[0], ['scripts/readme-map.mjs']), directRc(PAIR_B[0], ['scripts/proxy-check.mjs', '--strict'])],
    bTip: [directRc(PAIR_B[1], ['scripts/readme-map.mjs']), directRc(PAIR_B[1], ['scripts/proxy-check.mjs', '--strict'])],
  };
  return direct;
}
const rowsOf = (stdout) => stdout.split('\n').filter((l) => l.startsWith('HARM_ROW ')).map((l) => { const m = /gate=(\S+) .* id=(\S+) base_text/.exec(l); return m ? [m[1], m[2]] : null; }).filter(Boolean);
function h3(toolCmd, realRuns) {
  const why = [];
  const d = loadDirect();
  if (!(d.aBase[0] === 0 && d.aBase[1] === 0 && d.aTip[0] > 0 && d.aTip[1] > 0)) why.push(`direct-A readme/proxy rc ${JSON.stringify(d.aBase)} -> ${JSON.stringify(d.aTip)}`);
  if (!(d.bBase[0] > 0 && d.bBase[1] > 0 && d.bTip[0] === 0 && d.bTip[1] === 0)) why.push(`direct-B rc ${JSON.stringify(d.bBase)} -> ${JSON.stringify(d.bTip)}`);
  const ra = realRuns.a, rb = realRuns.b;
  const harmA = rowsOf(ra.stdout).filter(([, id]) => id === 'HARM').map(([g]) => g).sort();
  if (ra.status !== 1 || JSON.stringify(harmA) !== JSON.stringify(['proxy-check', 'readme-map'])) why.push(`A exit=${ra.status} harm=${JSON.stringify(harmA)}`);
  const rowsB = rowsOf(rb.stdout);
  const badB = rowsB.filter(([, id]) => ['HARM', 'HARM_ABSENT', 'NEW_RED'].includes(id));
  const repB = rowsB.filter(([, id]) => id === 'REPAIRED').map(([g]) => g);
  if (rb.status !== 0 || badB.length || !(repB.includes('readme-map') && repB.includes('proxy-check'))) why.push(`B exit=${rb.status} bad=${badB.length} repaired=${JSON.stringify(repB)}`);
  return why;
}
const matrixRun = (toolCmd, base, tip) => spawnSync(toolCmd[0], [...toolCmd.slice(1), '--lane', lane, '--base', base, '--tip', tip, '--timeout', '120'], { encoding: 'utf8', timeout: 900000, maxBuffer: 64 << 20 });

// ---- H2, H3 with the real tool
let realH2ok = false;
if (!existsSync(TOOL[1])) { check('H2', false, 'tool-absent'); check('H3', false, 'tool-absent'); }
else {
  const w2 = h2(TOOL);
  realH2ok = w2.length === 0;
  check('H2', realH2ok, w2.slice(0, 4).join('; '));
  const real = { a: matrixRun(TOOL, ...PAIR_A), b: matrixRun(TOOL, ...PAIR_B) };
  const w3 = h3(TOOL, real);
  check('H3', w3.length === 0, w3.slice(0, 4).join('; '));
}

// ---- H4: stubs that ignore their input must miss H2 + H3
const stubDir = tmp('harm65.stub.');
const stub = (name, line, code) => { const p = join(stubDir, name); writeFileSync(p, `process.stdout.write(${JSON.stringify(`${line}\n`)}); process.exit(${code});\n`); return ['node', p]; };
const stubs = [stub('clean.mjs', 'HARM_MATRIX: CLEAN gates=1 held=1 repaired=0 carried=0 moved=0 new=0 gone=0 harm=0 harm_absent=0 new_red=0 base=000000000000 tip=000000000000', 0),
  stub('harm.mjs', 'HARM_MATRIX: HARM gates=1 held=0 repaired=0 carried=0 moved=0 new=0 gone=0 harm=1 harm_absent=0 new_red=0 base=000000000000 tip=000000000000', 1)];
let stubsMissed = 0;
for (const s of stubs) {
  const w2 = h2(s);
  const w3 = h3(s, { a: spawnSync(s[0], [...s.slice(1)], { encoding: 'utf8' }), b: spawnSync(s[0], [...s.slice(1)], { encoding: 'utf8' }) });
  if (w2.length + w3.length > 0) stubsMissed++;
}
check('H4', realH2ok && stubsMissed === stubs.length, `real-tool-passes-H2=${realH2ok} stubs-that-passed=${stubs.length - stubsMissed}`);

// ---- H5
if (!existsSync(TOOL[1])) check('H5', false, 'tool-absent');
else {
  const r = matrixRun(TOOL, ROUND_BASE, full);
  const m = /^HARM_MATRIX: (CLEAN|HARM) gates=(\d+) .* harm=(\d+) harm_absent=(\d+) new_red=(\d+)/m.exec(r.stdout || '');
  const bad = m ? Number(m[3]) + Number(m[4]) + Number(m[5]) : -1;
  check('H5', !!m && Number(m[2]) >= 14 && r.status === (bad === 0 ? 0 : 1), `summary=${m ? m[0].slice(0, 120) : 'none'} exit=${r.status}`);
}

const held = Object.values(results).filter(Boolean).length;
if (held === 5) { process.stdout.write(`HARM65_HELD held=5/5 checks=5 rev=${full} rule=${RULE}\n`); done(0); }
process.stdout.write(`HARM65_UNMET held=${held}/5 checks=5 rev=${full} rule=${RULE} | ${miss.join(' | ')}\n`);
done(1);

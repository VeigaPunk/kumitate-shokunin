#!/usr/bin/env node
/**
 * harm-matrix.mjs — kumitate lane gate, contract kumitate-harm-matrix-v1 (round 65).
 *
 *   node scripts/harm-matrix.mjs --base REV --tip REV [--lane DIR] [--gates FILE] [--only id,id] [--timeout SECONDS]
 *   node scripts/harm-matrix.mjs --selftest [--cases FILE]
 *
 * Why it exists. The admission rule is "every claim verifies and no axis is harmed" (AXES.md). Until round 65 the harm
 * check was a seat's hand-run list of gates at two revisions (round 64: K64R2ExecHarmBattery). This tool runs a
 * registry of the lane's gates at BASE and at TIP, each inside its own sandbox clone checked out at that revision (the
 * lane worktree, git index and jj state are never touched), classifies every gate at both revisions, and prints one row
 * per gate with the transition:
 *   HELD (clean -> clean) · REPAIRED (not clean -> clean) · HARM (clean -> not clean) · HARM_ABSENT (clean -> gate gone)
 *   NEW_OK / NEW_RED (gate absent at base, clean / not clean at tip) · GONE (a not-clean gate removed)
 *   CARRIED (not clean -> not clean, same verdict line) · CARRIED_MOVED (not clean -> not clean, different line)
 *   ABSENT_BOTH (gate present at neither revision; not counted).
 * A gate is CLEAN only when its exit code is in `ok_exit` AND the LAST line matching `verdict` carries a first capture in
 * `clean`. A missing verdict line is FAIL_CLOSED, never clean; a gate that outlives `timeout` is TIMEOUT, never clean.
 * The capture must end at a word boundary (`CLEAN-STALE` is not `CLEAN`), the verdict must be written to one merged
 * stream (a stderr diagnostic cannot override a later stdout line), and `needs` must be a regular file inside the
 * sandbox (a symlink out of it measures host bytes and fails closed). `timeout` on PATH is a hard dependency
 * (HARM_MATRIX: FAIL_CLOSED reason=TOOL_MISSING). The summary carries `absent_both=` and `unmeasured=`; a registry
 * that lives in the repo is unioned with the base revision's so a dropped row is still scored (`registry=union added=n`);
 * `--strict-gone` additionally counts GONE as harm and fails closed when nothing was measurable.
 *
 * Registry: scripts/harm-matrix-gates.json next to this file (override with --gates). Each gate:
 *   { id, argv[], needs (a path that must exist at the revision, default = first *.mjs|js|sh|py argv), ok_exit[] (default [0]),
 *     verdict (regex; capture 1 is the verdict word), clean[] (verdict words that are clean), timeout (seconds, default 60) }.
 *
 * Output: HARM_ROW lines, then one summary line
 *   HARM_MATRIX: CLEAN|HARM gates=<n> held=.. repaired=.. carried=.. moved=.. new=.. gone=.. harm=.. harm_absent=.. new_red=.. base=<12> tip=<12>
 * Exit 0 clean (harm + harm_absent + new_red = 0) · 1 harm · 2 fail-closed (HARM_MATRIX: FAIL_CLOSED reason=..) · 64 usage.
 * Limits (stated): a gate's clean/not-clean reading is only as good as its verdict line; two not-clean readings that
 * differ are CARRIED_MOVED and are not ranked (worse or better is the reader's call); host-state gates read the same
 * host at both revisions, so a host change between the two runs is not told apart from a revision change.
 */
import { spawnSync } from 'node:child_process';
import { lstatSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SELF = fileURLToPath(import.meta.url);
const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf(k); return i >= 0 && i + 1 < argv.length ? argv[i + 1] : d; };
const ID_RE = /^[a-z0-9][a-z0-9-]*$/;
// interpreter flags whose VALUE is not the gate (a value that looks like a script used to become `needs`)
const NEEDS_FLAG_VALUES = new Set(['--import', '--require', '-r', '--loader', '--experimental-loader', '--eval', '-e', '--print', '-p', '--test-reporter', '--conditions', '-C', '--inspect-port', '--env-file']);
const CLEAN_ENV = () => ({ PATH: process.env.PATH || '/usr/bin:/bin', HOME: process.env.HOME || '/tmp', LANG: 'C', LC_ALL: 'C', NO_COLOR: '1' });
const GIT_ID = ['-c', 'user.name=harm-matrix', '-c', 'user.email=harm-matrix@invalid', '-c', 'commit.gpgsign=false', '-c', 'core.hooksPath=/dev/null'];

const out = (s) => process.stdout.write(`${s}\n`);
const usage = () => { process.stderr.write('usage: harm-matrix.mjs --base REV --tip REV [--lane DIR] [--gates FILE] [--only a,b] [--timeout S] [--strict-gone] | --selftest [--cases FILE]\n'); process.exit(64); };
const failClosed = (reason, detail = '') => { out(`HARM_MATRIX: FAIL_CLOSED reason=${reason}${detail ? ` detail=${JSON.stringify(detail)}` : ''}`); process.exit(2); };
const git = (dir, args, extra = {}) => spawnSync('git', ['-C', dir, ...args], { encoding: 'utf8', maxBuffer: 64 << 20, ...extra });

function loadGates(file) {
  let raw;
  try { raw = JSON.parse(readFileSync(file, 'utf8')); } catch (e) { return { error: 'GATES_UNREADABLE', detail: String(e.message).slice(0, 160) }; }
  const list = Array.isArray(raw) ? raw : raw && raw.gates;
  if (!Array.isArray(list) || list.length === 0) return { error: 'GATES_INVALID', detail: 'no gates array' };
  const seen = new Set();
  const gates = [];
  for (const g of list) {
    if (!g || typeof g !== 'object' || !ID_RE.test(String(g.id || ''))) return { error: 'GATES_INVALID', detail: `bad id ${JSON.stringify(g && g.id)}` };
    if (seen.has(g.id)) return { error: 'GATES_INVALID', detail: `duplicate id ${g.id}` };
    seen.add(g.id);
    if (!Array.isArray(g.argv) || g.argv.length === 0 || g.argv.some((a) => typeof a !== 'string')) return { error: 'GATES_INVALID', detail: `${g.id}: argv` };
    if (typeof g.verdict !== 'string') return { error: 'GATES_INVALID', detail: `${g.id}: verdict` };
    let re;
    try { re = new RegExp(g.verdict); } catch { return { error: 'GATES_INVALID', detail: `${g.id}: verdict regex` }; }
    // capture 1 is the verdict word; a pattern without one fell back to m[0], which can equal a clean word
    // embedded in any sentence (`CLEAN` inside "expected CLEAN, got DRIFT"). Anchoring is required so a
    // diagnostic line quoting the verdict cannot be read as the verdict.
    if (!re.source.startsWith('^') || !/\((?!\?)/.test(re.source)) return { error: 'GATES_INVALID', detail: `${g.id}: verdict needs ^anchor and a capturing group 1` };
    if (!Array.isArray(g.clean) || g.clean.length === 0) return { error: 'GATES_INVALID', detail: `${g.id}: clean` };
    const okExit = Array.isArray(g.ok_exit) && g.ok_exit.length ? g.ok_exit : [0];
    // `argv.find(\.mjs|js|sh|py)` took the first script-looking token, including the VALUE of an interpreter
    // flag: for `node --import x.mjs scripts/y.mjs` needs became x.mjs, so a gate carrying a loader read
    // ABSENT_BOTH and disappeared from the matrix. Skip flags and their values, then take the first positional.
    const deriveNeeds = (a) => {
      for (let i = 1; i < a.length; i++) {
        if (NEEDS_FLAG_VALUES.has(a[i])) { i++; continue; }
        if (/^-/.test(a[i])) continue;
        if (/\.(mjs|cjs|js|sh|py)$/.test(a[i])) return a[i];
      }
      return null;
    };
    const needs = g.needs || deriveNeeds(g.argv) || null;
    const timeout = Number.isInteger(g.timeout) && g.timeout > 0 ? g.timeout : 60;
    gates.push({ id: g.id, argv: g.argv, needs, okExit, re, clean: g.clean, timeout });
  }
  return { gates };
}

function sandbox(lane, rev) {
  const dir = mkdtempSync(join(tmpdir(), 'harm-matrix.'));
  let r = git(lane, ['clone', '-q', '--no-hardlinks', '--no-checkout', lane, dir]);
  if (r.status !== 0) { rmSync(dir, { recursive: true, force: true }); return { error: `clone: ${String(r.stderr).slice(0, 160)}` }; }
  r = git(dir, ['-c', 'advice.detachedHead=false', 'checkout', '-q', rev]);
  if (r.status !== 0) { rmSync(dir, { recursive: true, force: true }); return { error: `checkout: ${String(r.stderr).slice(0, 160)}` }; }
  return { dir };
}

// A gate is present only when the revision carries a regular file at `needs`. existsSync followed a symlink
// out of the sandbox (measuring host bytes, not the revision's) and accepted a directory; a needs that is
// present but not a regular file is a registry defect, so it fails closed instead of reading ABSENT.
const presence = (dir, rel) => {
  if (typeof rel !== 'string' || rel === '') return 'invalid';
  if (isAbsolute(rel)) return 'absolute';
  if (rel.split('/').includes('..')) return 'escape';
  let st;
  try { st = lstatSync(join(dir, rel)); } catch { return 'absent'; }
  if (st.isSymbolicLink()) {
    let real;
    try { real = realpathSync(join(dir, rel)); } catch { return 'dangling-link'; }
    if (!real.startsWith(realpathSync(dir) + '/')) return 'escape-link';
    try { st = lstatSync(real); } catch { return 'dangling-link'; }
  }
  return st.isFile() ? 'file' : 'not-a-file';
};

function measure(g, dir) {
  if (g.needs) {
    const p = presence(dir, g.needs);
    if (p !== 'file') return p === 'absent'
      ? { cls: 'ABSENT', text: `absent:${g.needs}`, key: `absent:${g.needs}` }
      : { cls: 'FAIL_CLOSED', text: `needs-${p}:${g.needs}`, key: `needs-${p}:${g.needs}` };
  }
  const t0 = Date.now();
  // `sh -c 'exec "$@" 2>&1'` gives ONE ordered stream: concatenating stdout then stderr puts every stderr
  // line last, so a stderr diagnostic overrode the true last line whichever was written later.
  const r = spawnSync('timeout', ['-k', '2', String(g.timeout), 'sh', '-c', 'exec "$@" 2>&1', 'sh', ...g.argv], {
    cwd: dir, encoding: 'utf8', env: CLEAN_ENV(), maxBuffer: 64 << 20, timeout: (g.timeout + 8) * 1000, killSignal: 'SIGKILL',
  });
  const elapsed = Date.now() - t0;
  if (r.error) {
    if (r.error.code === 'ETIMEDOUT') return { cls: 'TIMEOUT', text: `timeout>${g.timeout}s`, key: `timeout>${g.timeout}s` };
    return { cls: 'FAIL_CLOSED', text: `spawn-error ${r.error.code}`, key: `spawn-error ${r.error.code}` };
  }
  const lines = `${r.stdout || ''}`.split('\n').map((l) => l.trimEnd());
  let hit = null;
  for (const l of lines) {
    const m = g.re.exec(l);
    if (!m || m[1] === undefined) continue;
    // the capture must end at a word boundary: `\w+` stops at `-`, so `CLEAN-STALE` captured `CLEAN`
    if (/[-A-Za-z0-9_]/.test(l.charAt(m.index + m[0].length))) continue;
    hit = { line: l.trim(), word: m[1] };
  }
  if (r.status === null) return { cls: 'FAIL_CLOSED', text: `signal=${r.signal || 'unknown'}${hit ? ` verdict=${JSON.stringify(hit.line.slice(0, 120))}` : ''}`, key: `signal=${r.signal || 'unknown'}` };
  const rc = r.status;
  // 124/137 are the wrapper's. A gate that exits 124 on its own did not time out; only a run that used up
  // its budget is TIMEOUT (137 is also the kernel's OOM kill, which TIMEout hid).
  if ((rc === 124 || rc === 137) && elapsed >= (g.timeout - 1) * 1000) return { cls: 'TIMEOUT', text: `timeout>${g.timeout}s`, key: `timeout>${g.timeout}s` };
  if (!hit) return { cls: 'FAIL_CLOSED', text: `no-verdict exit=${rc}`, key: `no-verdict exit=${rc}` };
  const clean = g.okExit.includes(rc) && g.clean.includes(hit.word);
  // `key` keeps the full line: `text` is cut at 200 chars for display, and two different lines sharing a
  // 200-char prefix used to read CARRIED (same line) instead of CARRIED_MOVED.
  return { cls: clean ? 'CLEAN' : 'NOT_CLEAN', text: hit.line.slice(0, 200) + (clean ? '' : ` [exit=${rc}]`), key: hit.line + (clean ? '' : ` [exit=${rc}]`) };
}

function transition(b, t) {
  if (b.cls === 'ABSENT' && t.cls === 'ABSENT') return 'ABSENT_BOTH';
  if (b.cls === 'ABSENT') return t.cls === 'CLEAN' ? 'NEW_OK' : 'NEW_RED';
  if (t.cls === 'ABSENT') return b.cls === 'CLEAN' ? 'HARM_ABSENT' : 'GONE';
  if (b.cls === 'CLEAN') return t.cls === 'CLEAN' ? 'HELD' : 'HARM';
  if (t.cls === 'CLEAN') return 'REPAIRED';
  return b.key === t.key ? 'CARRIED' : 'CARRIED_MOVED';
}

function runMatrix({ lane, base, tip, gatesFile, only, timeoutOverride, strictGone }) {
  // the wrapper is a hard dependency: without it every gate reads FAIL_CLOSED at both revisions, which the
  // summary counted as CARRIED and reported as CLEAN exit 0 (a vacuous admission).
  if (spawnSync('timeout', ['--version'], { encoding: 'utf8' }).error) return { fail: 'TOOL_MISSING', detail: 'timeout (coreutils) is not on PATH: no gate can be spawned' };
  const lg = loadGates(gatesFile);
  if (lg.error) return { fail: lg.error, detail: lg.detail };
  let gates = lg.gates;
  const revs = {};
  for (const [k, v] of [['base', base], ['tip', tip]]) {
    const r = git(lane, ['rev-parse', '--verify', `${v}^{commit}`]);
    if (r.status !== 0) return { fail: 'REV_UNREADABLE', detail: `${k}=${v}` };
    revs[k] = r.stdout.trim();
  }
  // The registry is read once, from the working tree, so a tip that drops a row dropped the gate from BOTH
  // measurements and it simply stopped being scored. When the registry lives in the repo, union the ids the
  // base revision carries: a dropped row is still measured, and counted in `absent_both=` if it also lost
  // its file.
  let registry = 'registry=tip';
  const rel = relative(resolve(lane), gatesFile);
  if (!rel.startsWith('..') && !isAbsolute(rel)) {
    const r = git(lane, ['show', `${revs.base}:${rel}`]);
    if (r.status === 0) {
      const tmp = join(mkdtempSync(join(tmpdir(), 'harm-reg.')), 'gates.json');
      writeFileSync(tmp, r.stdout);
      const bl = loadGates(tmp);
      rmSync(dirname(tmp), { recursive: true, force: true });
      if (!bl.error) {
        const seen = new Set(gates.map((g) => g.id));
        let added = 0;
        for (const g of bl.gates) if (!seen.has(g.id)) { gates.push(g); seen.add(g.id); added++; }
        registry = `registry=union added=${added}`;
      }
    }
  }
  if (only) gates = gates.filter((g) => only.includes(g.id));
  if (timeoutOverride) gates = gates.map((g) => ({ ...g, timeout: timeoutOverride }));
  if (gates.length === 0) return { fail: 'NO_GATES', detail: 'registry empty after --only' };
  const sb = {};
  try {
    for (const k of ['base', 'tip']) {
      const s = sandbox(lane, revs[k]);
      if (s.error) return { fail: 'SANDBOX_FAILED', detail: `${k}: ${s.error}` };
      sb[k] = s.dir;
    }
    const rows = [];
    for (const g of gates) {
      const b = measure(g, sb.base);
      const t = measure(g, sb.tip);
      rows.push({ gate: g.id, b, t, id: transition(b, t) });
    }
    return { rows, revs, strictGone, registry };
  } finally {
    for (const d of Object.values(sb)) rmSync(d, { recursive: true, force: true });
  }
}

function render(res) {
  const n = (id) => res.rows.filter((r) => r.id === id).length;
  for (const r of res.rows) out(`HARM_ROW gate=${r.gate} base=${r.b.cls} tip=${r.t.cls} id=${r.id} base_text=${JSON.stringify(r.b.text)} tip_text=${JSON.stringify(r.t.text)}`);
  const counted = res.rows.filter((r) => r.id !== 'ABSENT_BOTH').length;
  if (counted === 0) failClosed('NO_GATES', 'every gate absent at both revisions');
  // a row that produced no reading at either revision is not evidence; the default exit mapping is kept
  // (the frozen H5 reads it) and `unmeasured=`/`--strict-gone` are the reporting side of it.
  const unmeasured = res.rows.filter((r) => r.id !== 'ABSENT_BOTH' && ['FAIL_CLOSED', 'TIMEOUT'].includes(r.b.cls) && ['FAIL_CLOSED', 'TIMEOUT'].includes(r.t.cls)).length;
  if (unmeasured === counted && res.strictGone) failClosed('NO_MEASURABLE_GATE', `${counted} gate(s) unmeasured at both revisions`);
  const harm = n('HARM'), harmAbsent = n('HARM_ABSENT'), newRed = n('NEW_RED');
  const bad = harm + harmAbsent + newRed + (res.strictGone ? n('GONE') : 0);
  out(`${res.registry || 'registry=tip'}`);
  out(`HARM_MATRIX: ${bad === 0 ? 'CLEAN' : 'HARM'} gates=${counted} held=${n('HELD')} repaired=${n('REPAIRED')} carried=${n('CARRIED')} moved=${n('CARRIED_MOVED')} new=${n('NEW_OK')} gone=${n('GONE')} absent_both=${n('ABSENT_BOTH')} unmeasured=${unmeasured} harm=${harm} harm_absent=${harmAbsent} new_red=${newRed} base=${res.revs.base.slice(0, 12)} tip=${res.revs.tip.slice(0, 12)}`);
  return bad === 0 ? 0 : 1;
}

// ---------------------------------------------------------------------------------------------------- selftest
function buildFixture(c) {
  const D = realpathSync(mkdtempSync(join(tmpdir(), 'harm-fixture.')));
  const g = (a) => git(D, [...GIT_ID, ...a]);
  if (git(D, ['init', '-q']).status !== 0) throw new Error('fixture init');
  const top = git(D, ['rev-parse', '--show-toplevel']).stdout.trim();
  if (realpathSync(top) !== D) throw new Error(`fixture toplevel ${top} != ${D}`);
  const put = (files) => { for (const [p, body] of Object.entries(files || {})) { mkdirSync(dirname(join(D, p)), { recursive: true }); writeFileSync(join(D, p), body); } };
  put(c.base);
  if (c.gates_raw !== undefined) writeFileSync(join(D, 'gates.json'), c.gates_raw);
  else writeFileSync(join(D, 'gates.json'), JSON.stringify({ gates: c.gates }));
  if (g(['add', '-A']).status !== 0 || g(['commit', '-q', '-m', 'base']).status !== 0) throw new Error('fixture base commit');
  const baseRev = git(D, ['rev-parse', 'HEAD']).stdout.trim();
  put(c.tip);
  for (const p of c.tip_delete || []) rmSync(join(D, p), { force: true });
  g(['add', '-A']);
  if (c.same_rev) return { D, baseRev, tipRev: baseRev };
  if (g(['commit', '-q', '--allow-empty', '-m', 'tip']).status !== 0) throw new Error('fixture tip commit');
  return { D, baseRev, tipRev: git(D, ['rev-parse', 'HEAD']).stdout.trim() };
}

function selftest() {
  const casesFile = opt('--cases', join(HERE, 'harm-cases.json'));
  let cases;
  try { cases = JSON.parse(readFileSync(casesFile, 'utf8')).cases; } catch (e) { out(`HARM_MATRIX_SELFTEST: FAIL cases-unreadable ${casesFile}`); process.exit(1); }
  let pass = 0;
  for (const c of cases) {
    let fx;
    try {
      fx = buildFixture(c);
      const rep = (s) => String(s).replaceAll('{BASE}', fx.baseRev).replaceAll('{TIP}', fx.tipRev).replaceAll('{DIR}', fx.D);
      const args = (c.args || ['--base', '{BASE}', '--tip', '{TIP}', '--gates', '{DIR}/gates.json']).map(rep);
      const r = spawnSync('node', [SELF, '--lane', fx.D, ...args], { encoding: 'utf8', timeout: 180000 });
      const lines = r.stdout.split('\n');
      const got = lines.filter((l) => l.startsWith('HARM_ROW ')).map((l) => { const m = /gate=(\S+) .* id=(\S+) base_text/.exec(l); return m ? `${m[1]} ${m[2]}` : l; }).sort();
      const want = [...(c.expect.rows || [])].sort();
      const sumLine = lines.find((l) => l.startsWith('HARM_MATRIX: '));
      const okSummary = !c.expect.summary || (sumLine && sumLine.includes(c.expect.summary));
      const ok = r.status === c.expect.exit && JSON.stringify(got) === JSON.stringify(want) && okSummary;
      if (ok) { pass++; out(`CASE ok ${c.id}`); } else out(`CASE FAIL ${c.id} exit=${r.status} want=${c.expect.exit} rows=${JSON.stringify(got)} wantrows=${JSON.stringify(want)} summary=${JSON.stringify(sumLine || null)}`);
    } catch (e) { out(`CASE FAIL ${c.id} threw ${String(e.message).slice(0, 120)}`); } finally { if (fx) rmSync(fx.D, { recursive: true, force: true }); }
  }
  out(`HARM_MATRIX_SELFTEST: ${pass === cases.length ? 'PASS' : 'FAIL'} (${pass}/${cases.length})`);
  process.exit(pass === cases.length ? 0 : 1);
}

// ---------------------------------------------------------------------------------------------------- main
if (argv.includes('--selftest')) selftest();
const base = opt('--base'); const tip = opt('--tip');
if (!base || !tip) usage();
const lane = resolve(opt('--lane', process.cwd()));
const gatesFile = resolve(opt('--gates', join(HERE, 'harm-matrix-gates.json')));
const only = opt('--only') ? opt('--only').split(',').filter(Boolean) : null;
const tmo = opt('--timeout');
if (tmo !== undefined && !/^[1-9][0-9]*$/.test(tmo)) usage();
const res = runMatrix({ lane, base, tip, gatesFile, only, timeoutOverride: tmo ? Number(tmo) : 0, strictGone: argv.includes('--strict-gone') });
if (res.fail) failClosed(res.fail, res.detail);
process.exit(render(res));

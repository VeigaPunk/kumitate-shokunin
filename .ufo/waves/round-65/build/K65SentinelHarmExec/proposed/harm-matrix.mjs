#!/usr/bin/env node
/**
 * harm-matrix.mjs — kumitate lane gate, contract kumitate-harm-matrix-v1 (round 65).
 *
 *   node scripts/harm-matrix.mjs --base REV --tip REV [--lane DIR] [--gates FILE] [--only id,id] [--timeout SECONDS] [--sandbox CAP_RUN]
 *   node scripts/harm-matrix.mjs --selftest [--cases FILE]
 *
 * Containment (round 65 host-safety review). Every gate runs the tip's code with the lane user's privileges, so the
 * tool treats that code as hostile: children get a disposable HOME (never the caller's), a PATH of this interpreter
 * plus the system bins (no shim in ~/.local/bin), no inherited GIT_* / global git config, and a sandbox git checkout
 * with hooks off. `--sandbox <scripts/cap-run.mjs>` goes further and runs each gate inside cap-run's bwrap sandbox
 * (read-only /, fresh /tmp and /run, PID namespace, cgroup memory and budget, no network), passing `--no-net` so a
 * gate cannot fetch or exfiltrate; six registry gates were measured clean under it at this revision (round 65,
 * K65SentinelHarmExec). Limits of the non-isolated mode (stated): the caller's PATH is still a writable directory on
 * this host (fnm shims, ~/.local/bin), /tmp is shared, and a gate can still write the lane worktree and refs.
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
import { existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SELF = fileURLToPath(import.meta.url);
const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf(k); return i >= 0 && i + 1 < argv.length ? argv[i + 1] : d; };
const ID_RE = /^[a-z0-9][a-z0-9-]*$/;
// K65SentinelHarmExec 1: a gate must not inherit the host's HOME or the caller's PATH. HOME is a disposable
// directory (measure()'s caller makes one per revision, removed with the sandbox), so a gate can neither read nor
// poison ~/.omp, ~/.gitconfig, ~/.local/bin or ~/.config; PATH is this interpreter's directory plus the system bins,
// so a gate cannot plant a `node`/`bash`/`timeout` shim that later gates, later revisions or later runs would run.
const CLEAN_ENV = (home) => ({ PATH: `${dirname(process.execPath)}:/usr/bin:/bin`, HOME: home, LANG: 'C', LC_ALL: 'C', NO_COLOR: '1' });
const GIT_ID = ['-c', 'user.name=harm-matrix', '-c', 'user.email=harm-matrix@invalid', '-c', 'commit.gpgsign=false', '-c', 'core.hooksPath=/dev/null'];
// K65SentinelHarmExec 2: the sandbox git calls read the caller's global/system config, so a `core.hooksPath` in
// ~/.gitconfig turned `checkout` into an execution of the hook (measured: HOOK_RAN=2). Hooks are disabled on every
// sandbox git invocation (not only on fixture commits, where GIT_ID already did it) and global/system config is off.
const GIT_HARD = (home) => ({ ...process.env, HOME: home, GIT_CONFIG_GLOBAL: '/dev/null', GIT_CONFIG_SYSTEM: '/dev/null', GIT_CONFIG_NOSYSTEM: '1', GIT_TERMINAL_PROMPT: '0' });

const out = (s) => process.stdout.write(`${s}\n`);
const usage = () => { process.stderr.write('usage: harm-matrix.mjs --base REV --tip REV [--lane DIR] [--gates FILE] [--only a,b] [--timeout S] [--sandbox CAP_RUN] | --selftest [--cases FILE]\n'); process.exit(64); };
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
    // K65SentinelHarmExec 6: the registry is trusted input (it is committed next to this file), and --gates lets a
    // caller run any argv with the lane user's privileges. Keep a registry row from smuggling an arbitrary binary
    // in, so the worst a bad row can do is run a script through an interpreter this tool already trusts.
    if (g.argv[0] !== 'node' && g.argv[0] !== 'bash') return { error: 'GATES_INVALID', detail: `${g.id}: interpreter ${JSON.stringify(g.argv[0])}` };
    if (typeof g.verdict !== 'string') return { error: 'GATES_INVALID', detail: `${g.id}: verdict` };
    let re;
    try { re = new RegExp(g.verdict); } catch { return { error: 'GATES_INVALID', detail: `${g.id}: verdict regex` }; }
    if (!Array.isArray(g.clean) || g.clean.length === 0) return { error: 'GATES_INVALID', detail: `${g.id}: clean` };
    const okExit = Array.isArray(g.ok_exit) && g.ok_exit.length ? g.ok_exit : [0];
    const needs = g.needs || g.argv.find((a) => /\.(mjs|js|sh|py)$/.test(a)) || null;
    const timeout = Number.isInteger(g.timeout) && g.timeout > 0 ? g.timeout : 60;
    gates.push({ id: g.id, argv: g.argv, needs, okExit, re, clean: g.clean, timeout });
  }
  return { gates };
}

function sandbox(lane, rev, home) {
  const dir = mkdtempSync(join(tmpdir(), 'harm-matrix.'));
  const env = GIT_HARD(home);
  let r = git(lane, ['-c', 'core.hooksPath=/dev/null', 'clone', '-q', '--no-hardlinks', '--no-checkout', lane, dir], { env });
  if (r.status !== 0) { rmSync(dir, { recursive: true, force: true }); return { error: `clone: ${String(r.stderr).slice(0, 160)}` }; }
  r = git(dir, ['-c', 'core.hooksPath=/dev/null', '-c', 'advice.detachedHead=false', 'checkout', '-q', rev], { env });
  if (r.status !== 0) { rmSync(dir, { recursive: true, force: true }); return { error: `checkout: ${String(r.stderr).slice(0, 160)}` }; }
  return { dir };
}

function measure(g, dir, home, isolate) {
  if (g.needs) {
    // K65SentinelHarmExec 3: a symlink is stored as mode 120000 and checkout materialises it, so `existsSync`
    // alone let a vanished gate read bytes from outside the revision (`HELD` for a tree with no gate at all).
    // Any `needs` that resolves outside the sandbox is treated like a missing gate.
    let inside = false;
    try { const rp = realpathSync(join(dir, g.needs)); const rd = realpathSync(dir); inside = rp === rd || rp.startsWith(rd + '/'); } catch { inside = false; }
    if (!inside) return { cls: 'ABSENT', text: `absent:${g.needs}` };
  }
  // K65SentinelHarmExec 4: `--sandbox <cap-run.mjs>` runs each gate inside cap-run's bwrap sandbox (read-only /,
  // fresh /tmp and /run, PID namespace, cgroup memory/budget, no network with cap-run --no-net). `node` is
  // mapped to this interpreter so the gate reads the same runtime the tool runs under (cap-run's PATH would
  // otherwise pick /usr/bin/node).
  const [cmd, args] = isolate
    ? [process.execPath, [isolate, '--mem', '1024', '--tasks', '64', '--budget', String(g.timeout), '--no-net', '--', ...g.argv.map((a) => (a === 'node' ? process.execPath : a))]]
    : ['timeout', ['-k', '2', String(g.timeout), ...g.argv]];
  const r = spawnSync(cmd, args, {
    cwd: dir, encoding: 'utf8', env: CLEAN_ENV(home), maxBuffer: 64 << 20, timeout: (g.timeout + 15) * 1000, killSignal: 'SIGKILL',
  });
  if (r.error && r.error.code === 'ETIMEDOUT') return { cls: 'TIMEOUT', text: `timeout>${g.timeout}s` };
  const rc = r.status === null ? (r.signal ? 128 : -1) : r.status;
  if (rc === 124 || rc === 137) return { cls: 'TIMEOUT', text: `timeout>${g.timeout}s` };
  const joined = `${r.stdout || ''}\n${r.stderr || ''}`;
  // cap-run's own verdict is not a gate reading: OOM, budget and signal mean the gate never produced a verdict.
  const sandboxed = /CAP_RUN: (OOM|BUDGET|SIGNAL)/.exec(joined);
  if (sandboxed) return { cls: 'FAIL_CLOSED', text: `sandbox-${sandboxed[1]} exit=${rc}` };
  const lines = joined.split('\n').map((l) => l.trimEnd());
  let hit = null;
  for (const l of lines) { const m = g.re.exec(l); if (m) hit = { line: l.trim(), word: m[1] !== undefined ? m[1] : m[0] }; }
  if (!hit) return { cls: 'FAIL_CLOSED', text: `no-verdict exit=${rc}` };
  const clean = g.okExit.includes(rc) && g.clean.includes(hit.word);
  return { cls: clean ? 'CLEAN' : 'NOT_CLEAN', text: hit.line.slice(0, 200) + (clean ? '' : ` [exit=${rc}]`) };
}

function transition(b, t) {
  if (b.cls === 'ABSENT' && t.cls === 'ABSENT') return 'ABSENT_BOTH';
  if (b.cls === 'ABSENT') return t.cls === 'CLEAN' ? 'NEW_OK' : 'NEW_RED';
  if (t.cls === 'ABSENT') return b.cls === 'CLEAN' ? 'HARM_ABSENT' : 'GONE';
  if (b.cls === 'CLEAN') return t.cls === 'CLEAN' ? 'HELD' : 'HARM';
  if (t.cls === 'CLEAN') return 'REPAIRED';
  return b.text === t.text ? 'CARRIED' : 'CARRIED_MOVED';
}

function runMatrix({ lane, base, tip, gatesFile, only, timeoutOverride, isolate }) {
  const lg = loadGates(gatesFile);
  if (lg.error) return { fail: lg.error, detail: lg.detail };
  let gates = lg.gates;
  if (only) gates = gates.filter((g) => only.includes(g.id));
  if (timeoutOverride) gates = gates.map((g) => ({ ...g, timeout: timeoutOverride }));
  if (gates.length === 0) return { fail: 'NO_GATES', detail: 'registry empty after --only' };
  const revs = {};
  for (const [k, v] of [['base', base], ['tip', tip]]) {
    const r = git(lane, ['rev-parse', '--verify', `${v}^{commit}`]);
    if (r.status !== 0) return { fail: 'REV_UNREADABLE', detail: `${k}=${v}` };
    revs[k] = r.stdout.trim();
  }
  const sb = {};
  const homes = {};
  const disposable = [];
  let cleanupError = null;
  let result;
  try {
    for (const k of ['base', 'tip']) {
      homes[k] = mkdtempSync(join(tmpdir(), 'harm-home.'));
      disposable.push(homes[k]);
      const s = sandbox(lane, revs[k], homes[k]);
      if (s.error) return { fail: 'SANDBOX_FAILED', detail: `${k}: ${s.error}` };
      sb[k] = s.dir;
    }
    const rows = [];
    for (const g of gates) {
      const b = measure(g, sb.base, homes.base, isolate);
      const t = measure(g, sb.tip, homes.tip, isolate);
      rows.push({ gate: g.id, b, t, id: transition(b, t) });
    }
    result = { rows, revs };
  } finally {
    // K65SentinelHarmExec 5: an uncaught rmSync threw out of this `finally`, so a gate that chmod'ed its own
    // sandbox turned the run into exit 1 (a HARM reading) and left the hostile tree in /tmp. Cleanup failure is a
    // containment failure: FAIL_CLOSED (exit 2), never a verdict.
    for (const d of [...Object.values(sb), ...disposable]) {
      let ok = false;
      for (let attempt = 0; attempt < 2 && !ok; attempt++) {
        try { rmSync(d, { recursive: true, force: true, maxRetries: 3 }); ok = true; } catch (e) {
          // A gate can chmod its own sandbox to 000; one best-effort chmod pass lets the retry succeed.
          if (attempt === 0) spawnSync('chmod', ['-R', 'u+rwX', d]);
          else cleanupError = cleanupError || `${d}: ${e.code || e.message}`;
        }
      }
    }
  }
  if (cleanupError) return { fail: 'CLEANUP', detail: cleanupError };
  return result;
}

function render(res) {
  const n = (id) => res.rows.filter((r) => r.id === id).length;
  for (const r of res.rows) out(`HARM_ROW gate=${r.gate} base=${r.b.cls} tip=${r.t.cls} id=${r.id} base_text=${JSON.stringify(r.b.text)} tip_text=${JSON.stringify(r.t.text)}`);
  const counted = res.rows.filter((r) => r.id !== 'ABSENT_BOTH').length;
  if (counted === 0) failClosed('NO_GATES', 'every gate absent at both revisions');
  const harm = n('HARM'), harmAbsent = n('HARM_ABSENT'), newRed = n('NEW_RED');
  const bad = harm + harmAbsent + newRed;
  out(`HARM_MATRIX: ${bad === 0 ? 'CLEAN' : 'HARM'} gates=${counted} held=${n('HELD')} repaired=${n('REPAIRED')} carried=${n('CARRIED')} moved=${n('CARRIED_MOVED')} new=${n('NEW_OK')} gone=${n('GONE')} harm=${harm} harm_absent=${harmAbsent} new_red=${newRed} base=${res.revs.base.slice(0, 12)} tip=${res.revs.tip.slice(0, 12)}`);
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
const sbOpt = opt('--sandbox');
const isolate = sbOpt ? resolve(sbOpt) : '';
if (isolate && !existsSync(isolate)) failClosed('SANDBOX_UNREADABLE', isolate);
const res = runMatrix({ lane, base, tip, gatesFile, only, timeoutOverride: tmo ? Number(tmo) : 0, isolate });
if (res.fail) failClosed(res.fail, res.detail);
process.exit(render(res));

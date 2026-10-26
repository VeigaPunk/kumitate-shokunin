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
 *
 * Text rules (round 65 hardening; each is a strengthening, none relaxes a clean reading):
 *   R1 temp-suffix normalisation — CARRIED vs CARRIED_MOVED compares the verdict line after every path of the form
 *      <tmp-root>/<stem>.<6+ alnum> has its random suffix replaced by `<tmp>` (tmp roots: os.tmpdir(), /tmp, /var/tmp,
 *      /dev/shm). The raw line is still printed; a row whose compared text was normalised ends with ` normalized=1`.
 *      Without R1 a verdict carrying a per-run temp path (`... fixtures=/tmp/x.AbCdEf`) reads CARRIED_MOVED on every run.
 *   R2 no output pipes — gate stdout and stderr are redirected to files in a scratch dir, not to pipes, so a background
 *      grandchild that inherits the stream cannot keep the matrix waiting: spawnSync returns when the direct child exits.
 *      The `timeout -k 2 T` wrapper still bounds the direct child; the parent adds a T+8s SIGKILL backstop.
 *   R3 output cap — combined output above 64 MiB (67108864 bytes) is FAIL_CLOSED `output>...`, never read into the tool
 *      and never CLEAN: a gate whose output we cannot hold is a gate whose last verdict line we cannot prove.
 *   R4 encoding — a line that is not valid UTF-8 may not carry a trusted verdict: if it matches `verdict` the gate is
 *      FAIL_CLOSED `verdict-not-utf8`; invalid bytes on lines that do not match are ignored.
 *   R5 verdict flags — `verdict` is a bare pattern string with NO flags; the registry cannot express `g`/`y` (RegExp is
 *      built without flags, so `lastIndex` state cannot leak between the base and the tip run). A JS-literal value
 *      (`/re/g`) is an operator error and is rejected at load as FAIL_CLOSED GATES_INVALID `verdict-literal`; inline
 *      `(?g)` is rejected by the RegExp constructor.
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
import { closeSync, existsSync, mkdirSync, mkdtempSync, openSync, readFileSync, realpathSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SELF = fileURLToPath(import.meta.url);
const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf(k); return i >= 0 && i + 1 < argv.length ? argv[i + 1] : d; };
const ID_RE = /^[a-z0-9][a-z0-9-]*$/;
const CLEAN_ENV = () => ({ PATH: process.env.PATH || '/usr/bin:/bin', HOME: process.env.HOME || '/tmp', LANG: 'C', LC_ALL: 'C', NO_COLOR: '1' });
const GIT_ID = ['-c', 'user.name=harm-matrix', '-c', 'user.email=harm-matrix@invalid', '-c', 'commit.gpgsign=false', '-c', 'core.hooksPath=/dev/null'];
const MAX_OUT = 64 << 20;
const EMPTY = Buffer.alloc(0);

// R1 — a temp path's random suffix is not part of a gate's verdict. `mkdtemp` and friends mint <stem>.<6+ alnum> under a temp
// root; two not-clean lines that differ only there are the same reading. The stem and everything else stay compared.
const TMP_ROOTS = [...new Set([tmpdir(), '/tmp', '/var/tmp', '/dev/shm'].map((p) => String(p).replace(/\/+$/, '')).filter(Boolean))];
const TMP_SUFFIX = new RegExp(`((?:${TMP_ROOTS.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})/[A-Za-z][A-Za-z0-9._-]*\\.)[A-Za-z0-9]{6,}(?![A-Za-z0-9])`, 'g');
const normText = (s) => String(s).replace(TMP_SUFFIX, '$1<tmp>');

// R4 — a line is decoded strictly; an undecodable line is still shown (U+FFFD) but can never carry a clean verdict.
const STRICT_UTF8 = new TextDecoder('utf-8', { fatal: true });
const LOOSE_UTF8 = new TextDecoder('utf-8');
const decodeLine = (bytes) => { try { return { text: STRICT_UTF8.decode(bytes), bad: false }; } catch { return { text: LOOSE_UTF8.decode(bytes), bad: true }; } };

const out = (s) => process.stdout.write(`${s}\n`);
const usage = () => { process.stderr.write('usage: harm-matrix.mjs --base REV --tip REV [--lane DIR] [--gates FILE] [--only a,b] [--timeout S] | --selftest [--cases FILE]\n'); process.exit(64); };
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
    // R5: the registry holds a bare pattern. A JS-literal value (`/re/g`, `/re/`) is an operator error that would otherwise
    // match nothing (the slashes and flags would be read as literal pattern text) and be reported as a silent no-verdict.
    if (/^\/[\s\S]*\/[a-z]*$/.test(g.verdict)) return { error: 'GATES_INVALID', detail: `${g.id}: verdict-literal (flags are not accepted; write a bare pattern)` };
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

function sandbox(lane, rev) {
  const dir = mkdtempSync(join(tmpdir(), 'harm-matrix.'));
  let r = git(lane, ['clone', '-q', '--no-hardlinks', '--no-checkout', lane, dir]);
  if (r.status !== 0) { rmSync(dir, { recursive: true, force: true }); return { error: `clone: ${String(r.stderr).slice(0, 160)}` }; }
  r = git(dir, ['-c', 'advice.detachedHead=false', 'checkout', '-q', rev]);
  if (r.status !== 0) { rmSync(dir, { recursive: true, force: true }); return { error: `checkout: ${String(r.stderr).slice(0, 160)}` }; }
  // A sandbox that does not actually hold the requested revision must not be read: an absent `needs` path would be reported as
  // ABSENT/GONE (a gate change) when the truth is a stale or partial checkout.
  r = git(dir, ['rev-parse', 'HEAD']);
  if (r.status !== 0 || r.stdout.trim() !== rev) { rmSync(dir, { recursive: true, force: true }); return { error: `stale-checkout: HEAD=${String(r.stdout || '').trim().slice(0, 40)} want=${rev.slice(0, 40)}` }; }
  return { dir };
}

function readCapture(file) {
  let size = 0;
  try { size = statSync(file).size; } catch { size = 0; }
  if (size > MAX_OUT) { rmSync(file, { force: true }); return { over: size }; }
  try { return { buf: readFileSync(file) }; } catch { return { buf: EMPTY }; } finally { rmSync(file, { force: true }); }
}

function measure(g, dir, tag, scratch) {
  if (g.needs && !existsSync(join(dir, g.needs))) { const t = `absent:${g.needs}`; return { cls: 'ABSENT', text: t, cmp: t }; }
  const oPath = join(scratch, `${tag}.out`);
  const ePath = join(scratch, `${tag}.err`);
  const oFd = openSync(oPath, 'w');
  const eFd = openSync(ePath, 'w');
  let r;
  try {
    r = spawnSync('timeout', ['-k', '2', String(g.timeout), ...g.argv], {
      cwd: dir, stdio: ['ignore', oFd, eFd], env: CLEAN_ENV(), timeout: (g.timeout + 8) * 1000, killSignal: 'SIGKILL',
    });
  } finally { closeSync(oFd); closeSync(eFd); }
  const o = readCapture(oPath);
  const e = readCapture(ePath);
  const over = Math.max(o.over || 0, e.over || 0);
  if (over || (o.buf?.length ?? 0) + (e.buf?.length ?? 0) > MAX_OUT) {
    const t = `output>${MAX_OUT}B`;
    return { cls: 'FAIL_CLOSED', text: t, cmp: t };
  }
  if (r.error && r.error.code === 'ETIMEDOUT') { const t = `timeout>${g.timeout}s`; return { cls: 'TIMEOUT', text: t, cmp: t }; }
  const rc = r.status === null ? (r.signal ? 128 : -1) : r.status;
  if (rc === 124 || rc === 137) { const t = `timeout>${g.timeout}s`; return { cls: 'TIMEOUT', text: t, cmp: t }; }
  const blob = Buffer.concat([o.buf ?? EMPTY, Buffer.from('\n'), e.buf ?? EMPTY]);
  let hit = null;
  let start = 0;
  for (let i = 0; i <= blob.length; i++) {
    if (i !== blob.length && blob[i] !== 0x0A) continue;
    const d = decodeLine(blob.subarray(start, i));
    start = i + 1;
    const line = d.text.trimEnd();
    const m = g.re.exec(line);
    if (m) hit = { line, word: m[1] !== undefined ? m[1] : m[0], bad: d.bad };
  }
  if (!hit) { const t = `no-verdict exit=${rc}`; return { cls: 'FAIL_CLOSED', text: t, cmp: t }; }
  if (hit.bad) { const t = `verdict-not-utf8 exit=${rc}`; return { cls: 'FAIL_CLOSED', text: t, cmp: t }; }
  const clean = g.okExit.includes(rc) && g.clean.includes(hit.word);
  const text = (hit.line.trim().slice(0, 200) + (clean ? '' : ` [exit=${rc}]`));
  return { cls: clean ? 'CLEAN' : 'NOT_CLEAN', text, cmp: normText(text) };
}

function transition(b, t) {
  if (b.cls === 'ABSENT' && t.cls === 'ABSENT') return 'ABSENT_BOTH';
  if (b.cls === 'ABSENT') return t.cls === 'CLEAN' ? 'NEW_OK' : 'NEW_RED';
  if (t.cls === 'ABSENT') return b.cls === 'CLEAN' ? 'HARM_ABSENT' : 'GONE';
  if (b.cls === 'CLEAN') return t.cls === 'CLEAN' ? 'HELD' : 'HARM';
  if (t.cls === 'CLEAN') return 'REPAIRED';
  return b.cmp === t.cmp ? 'CARRIED' : 'CARRIED_MOVED';
}

function runMatrix({ lane, base, tip, gatesFile, only, timeoutOverride }) {
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
  const scratch = mkdtempSync(join(tmpdir(), 'harm-cap.'));
  try {
    for (const k of ['base', 'tip']) {
      const s = sandbox(lane, revs[k]);
      if (s.error) return { fail: 'SANDBOX_FAILED', detail: `${k}: ${s.error}` };
      sb[k] = s.dir;
    }
    const rows = [];
    for (const g of gates) {
      const b = measure(g, sb.base, `base-${g.id}`, scratch);
      const t = measure(g, sb.tip, `tip-${g.id}`, scratch);
      rows.push({ gate: g.id, b, t, id: transition(b, t) });
    }
    return { rows, revs };
  } finally {
    for (const d of Object.values(sb)) rmSync(d, { recursive: true, force: true });
    rmSync(scratch, { recursive: true, force: true });
  }
}

function render(res) {
  const n = (id) => res.rows.filter((r) => r.id === id).length;
  for (const r of res.rows) {
    const norm = r.b.text !== r.b.cmp || r.t.text !== r.t.cmp ? ' normalized=1' : '';
    out(`HARM_ROW gate=${r.gate} base=${r.b.cls} tip=${r.t.cls} id=${r.id} base_text=${JSON.stringify(r.b.text)} tip_text=${JSON.stringify(r.t.text)}${norm}`);
  }
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
      const started = Date.now();
      const r = spawnSync('node', [SELF, '--lane', fx.D, ...args], { encoding: 'utf8', timeout: 180000 });
      const elapsed = Date.now() - started;
      const lines = r.stdout.split('\n');
      const textOf = {};
      const got = lines.filter((l) => l.startsWith('HARM_ROW ')).map((l) => {
        const m = /gate=(\S+) .* id=(\S+) base_text=("(?:[^"\\]|\\.)*") tip_text=("(?:[^"\\]|\\.)*")/.exec(l);
        if (!m) return l;
        textOf[m[1]] = `${JSON.parse(m[3])}\n${JSON.parse(m[4])}`;
        return `${m[1]} ${m[2]}`;
      }).sort();
      const want = [...(c.expect.rows || [])].sort();
      const sumLine = lines.find((l) => l.startsWith('HARM_MATRIX: '));
      const okSummary = !c.expect.summary || (sumLine && sumLine.includes(c.expect.summary));
      const okText = !c.expect.text || Object.entries(c.expect.text).every(([gate, needle]) => String(textOf[gate] || '').includes(needle));
      const okTime = !c.expect.max_ms || elapsed <= c.expect.max_ms;
      const ok = r.status === c.expect.exit && JSON.stringify(got) === JSON.stringify(want) && okSummary && okText && okTime;
      if (ok) { pass++; out(`CASE ok ${c.id}`); } else out(`CASE FAIL ${c.id} exit=${r.status} want=${c.expect.exit} rows=${JSON.stringify(got)} wantrows=${JSON.stringify(want)} summary=${JSON.stringify(sumLine || null)} ms=${elapsed}${c.expect.max_ms ? ` max=${c.expect.max_ms}` : ''}${okText ? '' : ` text=${JSON.stringify(textOf)}`}`);
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
const res = runMatrix({ lane, base, tip, gatesFile, only, timeoutOverride: tmo ? Number(tmo) : 0 });
if (res.fail) failClosed(res.fail, res.detail);
process.exit(render(res));

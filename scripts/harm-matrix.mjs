#!/usr/bin/env node
/**
 * harm-matrix.mjs — kumitate lane gate, contract kumitate-harm-matrix-v2 (round 65; v1 was the freeze commit 2ca91a0c).
 *
 *   node scripts/harm-matrix.mjs --base REV --tip REV [--lane DIR] [--gates FILE] [--only id,id] [--timeout SECONDS]
 *                                [--strict-gone] [--strict-unmeasured]
 *   node scripts/harm-matrix.mjs --selftest [--cases FILE]
 *
 * Why it exists. The admission rule is "every claim verifies and no axis is harmed" (AXES.md). Until round 65 the harm
 * check was a seat's hand-run list of gates at two revisions (round 64: K64R2ExecHarmBattery). This tool runs a
 * registry of the lane's gates at BASE and at TIP, each revision in its own sandbox clone (hooks and git config off, the
 * origin remote removed, the tree reset and cleaned before every gate), and prints one row per gate with the transition:
 *   HELD (clean -> clean) · REPAIRED (not clean -> clean) · HARM (clean -> not clean) · HARM_ABSENT (clean -> gate gone)
 *   NEW_OK / NEW_RED (gate absent at base, clean / not clean at tip) · GONE (a not-clean gate removed)
 *   CARRIED (not clean -> not clean, same normalised reading) · CARRIED_MOVED (not clean -> not clean, different reading)
 *   ABSENT_BOTH (gate present at neither revision; not counted).
 * A gate is CLEAN only when its exit code is in `ok_exit` AND the LAST line (stdout and stderr interleaved in write
 * order) matching `verdict` carries a word in `clean`; a hyphen-extended word (CLEAN-STALE, FAIL-CLOSED) is its own
 * word. A missing verdict line, invalid UTF-8 on the verdict line, output over 64 MiB, a signal death, a spawn error
 * or an escaping/ non-file `needs` path is FAIL_CLOSED, never clean; a gate that outlives `timeout` is TIMEOUT.
 *
 * Registry: scripts/harm-matrix-gates.json next to this file (override with --gates). Each gate:
 *   { id, argv[] (argv[0] is node or bash), needs (a relative file that must exist at the revision; default = the first
 *     positional argument, skipping node loader flags), ok_exit[] integers (default [0]), verdict (anchored regex with a
 *     capture group; capture 1 is the verdict word), clean[] strings, timeout (integer seconds, default 60) }.
 * When the registry file lives inside --lane, ids present in the registry at BASE or TIP but missing from the working
 * file are added back (a tip cannot drop a red gate by editing the registry); the summary names `registry_added`.
 *
 * Output: HARM_ROW lines, then exactly one summary line
 *   HARM_MATRIX: CLEAN|HARM gates=<n> held=.. repaired=.. carried=.. moved=.. new=.. gone=.. harm=.. harm_absent=.. new_red=..
 *                unmeasured=<rows with no reading at either revision> ancestor=yes|no|same base=<12> tip=<12>
 * Exit 0 clean (harm + harm_absent + new_red = 0) · 1 harm · 2 fail-closed (HARM_MATRIX: FAIL_CLOSED reason=..: REV_UNREADABLE,
 * LANE_UNREADABLE, GATES_UNREADABLE, GATES_INVALID, ONLY_UNKNOWN, NO_GATES, ALL_UNMEASURED, TOOL_MISSING, SANDBOX_FAILED,
 * INTERNAL) · 64 usage. --strict-gone makes GONE a harm; --strict-unmeasured makes any row with no reading at either revision a harm (both opt-in:
 * the frozen H5 reading of exit 0/1 is unchanged without them).
 * Trust and limits (stated): the tool EXECUTES gate scripts from the named revisions with the caller's HOME (host-state
 * gates read ~/.kimi-code and ~/.omp), a PATH cut to node's directory + /usr/bin:/bin, no network jail and no
 * filesystem jail; a hostile tip can still lie (scripts/cap-run.mjs is the containment, not wired in this version). The
 * registry and --gates are trusted input. A gate's reading is only as good as its verdict line; two not-clean readings
 * that differ are CARRIED_MOVED and are not ranked; host-state gates read the same host at both revisions.
 */
import { spawnSync } from 'node:child_process';
import { chmodSync, closeSync, existsSync, lstatSync, mkdirSync, mkdtempSync, openSync, readFileSync, readdirSync, realpathSync, rmSync, statSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SELF = fileURLToPath(import.meta.url);
const raw = process.argv.slice(2);
const ID_RE = /^[a-z0-9][a-z0-9-]*$/;
const MAX_OUT = 64 * 1024 * 1024;
const ARGV0 = new Set(['node', 'bash']);
const LOADER_VALUE_FLAGS = new Set(['--import', '-r', '--require', '--loader', '--experimental-loader', '-e', '--eval', '-p', '--print', '--input-type', '--conditions', '-C', '--env-file']);
const GIT_ENV = () => ({ PATH: process.env.PATH || '/usr/bin:/bin', HOME: process.env.HOME || '/tmp', LANG: 'C', LC_ALL: 'C', GIT_CONFIG_GLOBAL: '/dev/null', GIT_CONFIG_SYSTEM: '/dev/null', GIT_CONFIG_NOSYSTEM: '1', GIT_TERMINAL_PROMPT: '0' });
const GATE_PATH = (extra = []) => [dirname(process.execPath), '/usr/bin', '/bin', ...extra].join(':');
const GIT_ID = ['-c', 'user.name=harm-matrix', '-c', 'user.email=harm-matrix@invalid', '-c', 'commit.gpgsign=false', '-c', 'core.hooksPath=/dev/null', '-c', 'init.defaultBranch=main'];

const out = (s) => process.stdout.write(`${s}\n`);
const USAGE = 'usage: harm-matrix.mjs --base REV --tip REV [--lane DIR] [--gates FILE] [--only a,b] [--timeout S] [--strict-gone] [--strict-unmeasured] | --selftest [--cases FILE]';
const usage = (why = '') => { process.stderr.write(`${USAGE}${why ? ` (${why})` : ''}\n`); process.exit(64); };
const failClosed = (reason, detail = '') => { out(`HARM_MATRIX: FAIL_CLOSED reason=${reason}${detail ? ` detail=${JSON.stringify(String(detail).slice(0, 300))}` : ''}`); process.exit(2); };
const git = (dir, args, extra = {}) => spawnSync('git', ['-C', dir, '-c', 'core.hooksPath=/dev/null', '-c', 'advice.detachedHead=false', ...args], { encoding: 'utf8', maxBuffer: 64 << 20, env: GIT_ENV(), ...extra });

// ---------------------------------------------------------------------------------------------------- arguments
function parseArgs(argv) {
  const valued = new Set(['--base', '--tip', '--lane', '--gates', '--only', '--timeout', '--cases']);
  const bools = new Set(['--selftest', '--strict-gone', '--strict-unmeasured']);
  const o = {};
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (bools.has(a)) { if (o[a]) usage(`duplicate ${a}`); o[a] = true; continue; }
    if (!valued.has(a)) usage(`unknown argument ${a}`);
    if (o[a] !== undefined) usage(`duplicate ${a}`);
    const v = argv[i + 1];
    if (v === undefined || (v.startsWith('--') && valued.has(v)) || bools.has(v)) usage(`${a} needs a value`);
    o[a] = v; i += 1;
  }
  return o;
}

// ---------------------------------------------------------------------------------------------------- registry
function deriveNeeds(argv) {
  for (let i = 1; i < argv.length; i += 1) {
    const a = argv[i];
    if (LOADER_VALUE_FLAGS.has(a)) { i += 1; continue; }
    if (a.startsWith('-')) continue;
    return a;
  }
  return null;
}
function loadGates(file) {
  let text;
  try { text = readFileSync(file, 'utf8'); } catch (e) { return { error: 'GATES_UNREADABLE', detail: String(e.message) }; }
  return loadGatesFromText(text);
}
function loadGatesFromText(text) {
  let rawj;
  try { rawj = JSON.parse(text); } catch (e) { return { error: 'GATES_UNREADABLE', detail: String(e.message) }; }
  const list = Array.isArray(rawj) ? rawj : rawj && rawj.gates;
  if (!Array.isArray(list) || list.length === 0) return { error: 'GATES_INVALID', detail: 'no gates array' };
  const seen = new Set();
  const gates = [];
  for (const g of list) {
    if (!g || typeof g !== 'object' || typeof g.id !== 'string' || !ID_RE.test(g.id)) return { error: 'GATES_INVALID', detail: `bad id ${JSON.stringify(g && g.id)}` };
    if (seen.has(g.id)) return { error: 'GATES_INVALID', detail: `duplicate id ${g.id}` };
    seen.add(g.id);
    const bad = (why) => ({ error: 'GATES_INVALID', detail: `${g.id}: ${why}` });
    if (!Array.isArray(g.argv) || g.argv.length === 0 || g.argv.some((a) => typeof a !== 'string')) return bad('argv');
    if (!ARGV0.has(g.argv[0])) return bad('argv[0] must be node or bash');
    if (typeof g.verdict !== 'string') return bad('verdict');
    if (/^\/.*\/[a-z]*$/.test(g.verdict)) return bad('verdict-literal (flags are not accepted; write a bare pattern)');
    if (!g.verdict.startsWith('^')) return bad('verdict must start with ^');
    let groups;
    try { groups = new RegExp(`${g.verdict}|`).exec('').length - 1; new RegExp(g.verdict, 'd'); } catch { return bad('verdict regex'); }
    if (groups < 1) return bad('verdict has no capture group');
    if (!Array.isArray(g.clean) || g.clean.length === 0 || g.clean.some((c) => typeof c !== 'string' || c === '')) return bad('clean');
    if (g.ok_exit !== undefined && (!Array.isArray(g.ok_exit) || g.ok_exit.length === 0 || g.ok_exit.some((n) => !Number.isInteger(n)))) return bad('ok_exit');
    if (g.timeout !== undefined && !(Number.isInteger(g.timeout) && g.timeout > 0)) return bad('timeout');
    if (g.ignore_words !== undefined && (!Array.isArray(g.ignore_words) || g.ignore_words.some((c) => typeof c !== 'string' || c === ''))) return bad('ignore_words');
    if (g.path_extra !== undefined && (!Array.isArray(g.path_extra) || g.path_extra.some((c) => typeof c !== 'string' || !(c.startsWith('/') || c.startsWith('$HOME/'))))) return bad('path_extra');
    let needs = g.needs !== undefined ? g.needs : deriveNeeds(g.argv);
    if (needs !== null && (typeof needs !== 'string' || needs === '' || isAbsolute(needs) || needs.split(/[\\/]/).includes('..'))) return bad('needs');
    gates.push({ id: g.id, argv: g.argv, needs, okExit: g.ok_exit || [0], re: new RegExp(g.verdict, 'd'), clean: g.clean, ignore: g.ignore_words || [], pathExtra: (g.path_extra || []).map((p) => p.replace('$HOME', process.env.HOME || '/nonexistent')), timeout: g.timeout || 60 });
  }
  return { gates, ids: new Set(seen) };
}

// ---------------------------------------------------------------------------------------------------- sandbox
function relax(dir) {
  const walk = (p) => {
    let st;
    try { st = lstatSync(p); } catch { return; }
    if (st.isSymbolicLink()) return;
    if (st.isDirectory()) { try { chmodSync(p, 0o700); } catch { /* best effort */ } let es = []; try { es = readdirSync(p); } catch { /* best effort */ } for (const e of es) walk(join(p, e)); }
  };
  walk(dir);
}
function reap(dir) {
  try { rmSync(dir, { recursive: true, force: true }); return true; } catch { /* retry after relaxing */ }
  try { relax(dir); rmSync(dir, { recursive: true, force: true }); return true; } catch { return false; }
}
function makeSandbox(lane, rev, scratch, tag) {
  const dir = join(scratch, `sb-${tag}`);
  let r = spawnSync('git', ['-c', 'core.hooksPath=/dev/null', 'clone', '-q', '--no-hardlinks', '--no-checkout', lane, dir], { encoding: 'utf8', env: GIT_ENV() });
  if (r.status !== 0) return { error: `clone: ${String(r.stderr).trim().slice(0, 200)}` };
  git(dir, ['remote', 'remove', 'origin']);
  r = git(dir, ['checkout', '-q', '--detach', rev]);
  if (r.status !== 0) return { error: `checkout: ${String(r.stderr).trim().slice(0, 200)}` };
  const head = git(dir, ['rev-parse', 'HEAD']).stdout.trim();
  if (head !== rev) return { error: `stale-checkout: HEAD ${head} != ${rev}` };
  return { dir, rev };
}
function resetSandbox(sb) {
  let r = git(sb.dir, ['reset', '-q', '--hard', sb.rev]);
  let c = r.status === 0 ? git(sb.dir, ['clean', '-qfdx']) : r;
  if (r.status !== 0 || c.status !== 0) { relax(sb.dir); r = git(sb.dir, ['reset', '-q', '--hard', sb.rev]); c = r.status === 0 ? git(sb.dir, ['clean', '-qfdx']) : r; }
  return r.status === 0 && c.status === 0;
}
function presence(dir, needs) {
  if (needs === null) return { state: 'present' };
  const p = join(dir, needs);
  let st;
  try { st = lstatSync(p); } catch { return { state: 'absent', text: `absent:${needs}` }; }
  let rp;
  try { rp = realpathSync(p); } catch { return { state: 'absent', text: `absent:${needs}` }; }
  const root = realpathSync(dir);
  if (rp !== root && !rp.startsWith(root + sep)) return { state: 'defect', text: `needs-escape-link:${needs}` };
  if (!statSync(rp).isFile()) return { state: 'defect', text: `needs-not-a-file:${needs}` };
  return { state: 'present' };
}

// ---------------------------------------------------------------------------------------------------- measurement
let TMP_ROOTS = [];
function normText(t) {
  let s = t;
  for (const root of TMP_ROOTS) {
    const esc = root.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    s = s.replace(new RegExp(`(${esc}(?:/[^\\s/"']+)*?/[A-Za-z0-9_-]+)\\.[A-Za-z0-9]{6,}`, 'g'), '$1.<rand>');
  }
  return s;
}
function readingOf(g, buf, rc, signal) {
  // every verdict line in write order (stdout and stderr share one file descriptor); strict UTF-8 on matching lines only
  const dec = new TextDecoder('utf-8', { fatal: true });
  const hits = [];
  let badLine = false;
  let off = 0;
  while (off <= buf.length) {
    let nl = buf.indexOf(0x0a, off);
    if (nl < 0) nl = buf.length;
    const lineBuf = buf.subarray(off, nl);
    off = nl + 1;
    if (lineBuf.length === 0) continue;
    const loose = lineBuf.toString('utf8').replace(/\s+$/, '');
    const m = g.re.exec(loose);
    if (!m || !m.indices || !m.indices[1]) continue;
    try { dec.decode(lineBuf); } catch { badLine = true; continue; }
    let end = m.indices[1][1];
    while (end < loose.length && /[-A-Za-z0-9_]/.test(loose[end])) end += 1;
    hits.push({ line: loose.trim(), word: loose.slice(m.indices[1][0], end) });
  }
  const last = hits.length ? hits[hits.length - 1] : null;
  const tailLine = (() => { const t = buf.toString('utf8').split('\n').map((l) => l.trim()).filter(Boolean); return t.length ? t[t.length - 1].slice(0, 120) : ''; })();
  if (signal) return { cls: 'FAIL_CLOSED', text: `signal=${signal}${last ? ` verdict=${JSON.stringify(last.line.slice(0, 120))}` : ''}` };
  if (badLine) return { cls: 'FAIL_CLOSED', text: `verdict-not-utf8 exit=${rc}` };
  if (!last) return { cls: 'FAIL_CLOSED', text: `no-verdict exit=${rc}${tailLine ? ` last=${JSON.stringify(tailLine)}` : ''}` };
  // clean only when the exit is accepted, the LAST verdict word is clean and no EARLIER verdict line carried a non-clean
  // word (a gate that said DRIFT and later CLEAN is not clean; `ignore_words` lists informational words such as `note`)
  const earlierBad = hits.slice(0, -1).find((h) => !g.clean.includes(h.word) && !g.ignore.includes(h.word));
  const clean = g.okExit.includes(rc) && g.clean.includes(last.word) && !earlierBad;
  if (clean) return { cls: 'CLEAN', text: last.line };
  return { cls: 'NOT_CLEAN', text: `${earlierBad && g.clean.includes(last.word) ? earlierBad.line : last.line} [exit=${rc}${earlierBad && g.clean.includes(last.word) ? ' earlier-verdict-not-clean' : ''}]` };
}
function measure(g, sb, scratch, tag) {
  const pres = presence(sb.dir, g.needs);
  if (pres.state === 'absent') return { cls: 'ABSENT', text: pres.text, key: pres.text };
  if (pres.state === 'defect') return { cls: 'FAIL_CLOSED', text: pres.text, key: pres.text };
  if (!resetSandbox(sb)) return { cls: 'FAIL_CLOSED', text: 'sandbox-reset-failed', key: 'sandbox-reset-failed' };
  const tdir = join(scratch, `tmp-${g.id}-${tag}`);
  mkdirSync(tdir, { recursive: true });
  const outFile = join(scratch, `out-${g.id}-${tag}.txt`);
  const fd = openSync(outFile, 'w');
  const argv = g.argv[0] === 'node' ? [process.execPath, ...g.argv.slice(1)] : g.argv;
  const t0 = Date.now();
  const r = spawnSync('timeout', ['-k', '2', String(g.timeout), ...argv], {
    cwd: sb.dir, stdio: ['ignore', fd, fd], timeout: (g.timeout + 8) * 1000, killSignal: 'SIGKILL',
    env: { PATH: GATE_PATH(g.pathExtra), HOME: process.env.HOME || '/tmp', LANG: 'C', LC_ALL: 'C', NO_COLOR: '1', TMPDIR: tdir, ...(process.env.XDG_RUNTIME_DIR ? { XDG_RUNTIME_DIR: process.env.XDG_RUNTIME_DIR } : {}) },
  });
  closeSync(fd);
  const elapsed = Date.now() - t0;
  let res;
  const rc = r.status;
  if (r.error && r.error.code === 'ETIMEDOUT') res = { cls: 'TIMEOUT', text: `timeout>${g.timeout}s` };
  else if (r.error) res = { cls: 'FAIL_CLOSED', text: `spawn-error ${r.error.code || r.error.message}` };
  else if ((rc === 124 || rc === 137) && elapsed >= (g.timeout - 1) * 1000) res = { cls: 'TIMEOUT', text: `timeout>${g.timeout}s` };
  else if (statSync(outFile).size > MAX_OUT) res = { cls: 'FAIL_CLOSED', text: `output>${MAX_OUT}B` };
  else res = readingOf(g, readFileSync(outFile), rc, rc === null ? r.signal || 'unknown' : null);
  rmSync(outFile, { force: true });
  res.key = normText(res.text);
  res.text = res.text.slice(0, 200);
  return res;
}
function transition(b, t) {
  if (b.cls === 'ABSENT' && t.cls === 'ABSENT') return 'ABSENT_BOTH';
  if (b.cls === 'ABSENT') return t.cls === 'CLEAN' ? 'NEW_OK' : 'NEW_RED';
  if (t.cls === 'ABSENT') return b.cls === 'CLEAN' ? 'HARM_ABSENT' : 'GONE';
  if (b.cls === 'CLEAN') return t.cls === 'CLEAN' ? 'HELD' : 'HARM';
  if (t.cls === 'CLEAN') return 'REPAIRED';
  return b.key === t.key ? 'CARRIED' : 'CARRIED_MOVED';
}

function revParse(lane, rev) {
  const r = git(lane, ['rev-parse', '--verify', '--end-of-options', `${rev}^{commit}`]);
  return r.status === 0 ? r.stdout.trim() : null;
}
function unionRegistry(gatesFile, lane, revs, current) {
  const rel = relative(realpathSync(lane), realpathSync(gatesFile));
  if (rel.startsWith('..') || isAbsolute(rel)) return { gates: current.gates, added: 0 };
  const have = new Set(current.gates.map((g) => g.id));
  const gates = [...current.gates];
  let added = 0;
  for (const rev of [revs.base, revs.tip]) {
    const s = git(lane, ['show', `${rev}:${rel.split(sep).join('/')}`]);
    if (s.status !== 0) continue;
    let lg;
    try { lg = loadGatesFromText(s.stdout); } catch { continue; }
    if (lg.error) continue;
    for (const g of lg.gates) if (!have.has(g.id)) { have.add(g.id); gates.push(g); added += 1; }
  }
  return { gates, added };
}

function runMatrix(o) {
  const lane = resolve(o['--lane'] || process.cwd());
  const gatesFile = resolve(o['--gates'] || join(HERE, 'harm-matrix-gates.json'));
  for (const bin of [['timeout', '--version'], ['git', '--version']]) if (spawnSync(bin[0], [bin[1]], { encoding: 'utf8' }).error) return { fail: 'TOOL_MISSING', detail: bin[0] };
  if (git(lane, ['rev-parse', '--show-toplevel']).status !== 0) return { fail: 'LANE_UNREADABLE', detail: lane };
  const lg = loadGates(gatesFile);
  if (lg.error) return { fail: lg.error, detail: lg.detail };
  const revs = {};
  for (const k of ['base', 'tip']) {
    revs[k] = revParse(lane, o[`--${k}`]);
    if (!revs[k]) return { fail: 'REV_UNREADABLE', detail: `${k}=${o[`--${k}`]}` };
  }
  let { gates, added } = unionRegistry(gatesFile, lane, revs, lg);
  if (o['--only'] !== undefined) {
    const want = o['--only'].split(',').map((s) => s.trim());
    if (want.some((s) => s === '')) usage('--only has an empty id');
    const unknown = want.filter((id) => !gates.some((g) => g.id === id));
    if (unknown.length) return { fail: 'ONLY_UNKNOWN', detail: unknown.join(',') };
    gates = gates.filter((g) => want.includes(g.id));
  }
  if (o['--timeout'] !== undefined) gates = gates.map((g) => ({ ...g, timeout: Number(o['--timeout']) }));
  let scratch;
  try { scratch = mkdtempSync(join(tmpdir(), 'harm-matrix.')); } catch (e) { return { fail: 'SANDBOX_FAILED', detail: `mkdtemp: ${e.code || e.message}` }; }
  TMP_ROOTS = [...new Set([tmpdir(), '/tmp', '/var/tmp', '/dev/shm', scratch])];
  try {
    const sb = {};
    for (const k of ['base', 'tip']) {
      const s = makeSandbox(lane, revs[k], scratch, k);
      if (s.error) return { fail: 'SANDBOX_FAILED', detail: `${k}: ${s.error}` };
      sb[k] = s;
    }
    const rows = [];
    for (const g of gates) {
      const b = measure(g, sb.base, scratch, 'b');
      const t = measure(g, sb.tip, scratch, 't');
      rows.push({ gate: g.id, b, t, id: transition(b, t) });
    }
    const anc = revs.base === revs.tip ? 'same' : (git(lane, ['merge-base', '--is-ancestor', revs.base, revs.tip]).status === 0 ? 'yes' : 'no');
    return { rows, revs, added, anc };
  } finally {
    if (!reap(scratch)) process.stderr.write(`HARM_MATRIX_CLEANUP: leaked=${scratch}\n`);
  }
}

function render(res, o) {
  const n = (id) => res.rows.filter((r) => r.id === id).length;
  for (const r of res.rows) out(`HARM_ROW gate=${r.gate} base=${r.b.cls} tip=${r.t.cls} id=${r.id} base_text=${JSON.stringify(r.b.text)} tip_text=${JSON.stringify(r.t.text)}`);
  const counted = res.rows.filter((r) => r.id !== 'ABSENT_BOTH');
  if (counted.length === 0) failClosed('NO_GATES', 'every gate absent at both revisions');
  const unmeasured = counted.filter((r) => ['FAIL_CLOSED', 'TIMEOUT'].includes(r.b.cls) && ['FAIL_CLOSED', 'TIMEOUT'].includes(r.t.cls)).length;
  if (unmeasured === counted.length) failClosed('ALL_UNMEASURED', `${unmeasured} gate(s) produced no reading at either revision`);
  const harm = n('HARM'), harmAbsent = n('HARM_ABSENT'), newRed = n('NEW_RED');
  const bad = harm + harmAbsent + newRed + (o['--strict-gone'] ? n('GONE') : 0) + (o['--strict-unmeasured'] ? unmeasured : 0);
  out(`HARM_MATRIX: ${bad === 0 ? 'CLEAN' : 'HARM'} gates=${counted.length} held=${n('HELD')} repaired=${n('REPAIRED')} carried=${n('CARRIED')} moved=${n('CARRIED_MOVED')} new=${n('NEW_OK')} gone=${n('GONE')} harm=${harm} harm_absent=${harmAbsent} new_red=${newRed} unmeasured=${unmeasured} ancestor=${res.anc}${res.added ? ` registry_added=${res.added}` : ''} base=${res.revs.base.slice(0, 12)} tip=${res.revs.tip.slice(0, 12)}`);
  return bad === 0 ? 0 : 1;
}

// ---------------------------------------------------------------------------------------------------- selftest
function buildFixture(c, parent) {
  const D = realpathSync(mkdtempSync(join(parent, 'harm-fixture.')));
  const fx = { D, baseRev: null, tipRev: null };
  try {
    const g = (a, must = true) => { const r = git(D, [...GIT_ID, ...a]); if (must && r.status !== 0) throw new Error(`fixture git ${a[0]}: ${String(r.stderr).trim().slice(0, 160)}`); return r; };
    if (git(D, ['-c', 'init.defaultBranch=main', 'init', '-q']).status !== 0) throw new Error('fixture init');
    const top = git(D, ['rev-parse', '--show-toplevel']);
    if (top.status !== 0 || realpathSync(top.stdout.trim()) !== D) throw new Error(`fixture toplevel ${top.stdout.trim()} != ${D} ${String(top.stderr).trim().slice(0, 100)}`);
    const inside = (p) => { const t = resolve(D, p); if (t !== D && !t.startsWith(D + sep)) throw new Error(`case path escapes the fixture: ${p}`); return t; };
    const put = (files) => {
      for (const [p, body] of Object.entries(files || {})) {
        const t = inside(p); mkdirSync(dirname(t), { recursive: true }); rmSync(t, { force: true });
        if (body && typeof body === 'object' && body.symlink) symlinkSync(body.symlink.replaceAll('{HOSTFILE}', join(parent, 'host-gate.sh')), t);
        else writeFileSync(t, body);
      }
    };
    writeFileSync(join(parent, 'host-gate.sh'), "echo 'G1: CLEAN'\n");
    put(c.base);
    writeFileSync(join(D, 'gates.json'), c.gates_raw !== undefined ? c.gates_raw : JSON.stringify({ gates: c.gates }));
    g(['add', '-A']); g(['commit', '-q', '-m', 'base']);
    fx.baseRev = git(D, ['rev-parse', 'HEAD']).stdout.trim();
    put(c.tip);
    if (c.gates_tip !== undefined) writeFileSync(join(D, 'gates.json'), JSON.stringify({ gates: c.gates_tip }));
    for (const p of c.tip_delete || []) rmSync(inside(p), { force: true });
    g(['add', '-A']);
    if (c.same_rev) fx.tipRev = fx.baseRev;
    else { g(['commit', '-q', '--allow-empty', '-m', 'tip']); fx.tipRev = git(D, ['rev-parse', 'HEAD']).stdout.trim(); }
    return fx;
  } catch (e) { reap(D); throw e; }
}
function selftest(o) {
  const casesFile = resolve(o['--cases'] || join(HERE, 'harm-cases.json'));
  let cases;
  try { cases = JSON.parse(readFileSync(casesFile, 'utf8')).cases; } catch { out(`HARM_MATRIX_SELFTEST: FAIL cases-unreadable ${casesFile}`); process.exit(1); }
  const priv = realpathSync(mkdtempSync(join(tmpdir(), 'harm-selftest.')));
  let pass = 0;
  for (const c of cases) {
    const parent = mkdtempSync(join(priv, 'case.'));
    const tmpd = join(parent, 'tmp'); mkdirSync(tmpd);
    let fx;
    try {
      fx = buildFixture(c, parent);
      const b12 = fx.baseRev.slice(0, 12), t12 = fx.tipRev.slice(0, 12);
      const rep = (s) => String(s).replaceAll('{BASE}', fx.baseRev).replaceAll('{TIP}', fx.tipRev).replaceAll('{DIR}', fx.D).replaceAll('{B12}', b12).replaceAll('{T12}', t12);
      const args = (c.args || ['--base', '{BASE}', '--tip', '{TIP}', '--gates', '{DIR}/gates.json']).map(rep);
      const env = { ...process.env, TMPDIR: tmpd };
      if (c.tmpdir_is_file) { writeFileSync(join(parent, 'tmpfile'), 'x'); env.TMPDIR = join(parent, 'tmpfile'); }
      if (c.restrict_path) {
        const bin = join(parent, 'bin'); mkdirSync(bin);
        for (const name of ['git', 'bash', 'sh']) { const w = spawnSync('bash', ['-c', `command -v ${name}`], { encoding: 'utf8' }).stdout.trim(); if (w) symlinkSync(w, join(bin, name)); }
        symlinkSync(process.execPath, join(bin, 'node'));
        env.PATH = bin;
      }
      const t0 = Date.now();
      const r = spawnSync(process.execPath, [SELF, ...(args.includes('--lane') ? [] : ['--lane', fx.D]), ...args], { encoding: 'utf8', timeout: 240000, env });
      const ms = Date.now() - t0;
      const lines = r.stdout.split('\n');
      const rows = lines.filter((l) => l.startsWith('HARM_ROW '));
      const got = rows.map((l) => { const m = /gate=(\S+) .* id=(\S+) base_text/.exec(l); return m ? `${m[1]} ${m[2]}` : l; }).sort();
      const want = [...(c.expect.rows || [])].sort();
      const sums = lines.filter((l) => l.startsWith('HARM_MATRIX: '));
      const problems = [];
      if (r.status !== c.expect.exit) problems.push(`exit=${r.status} want=${c.expect.exit}`);
      if (JSON.stringify(got) !== JSON.stringify(want)) problems.push(`rows=${JSON.stringify(got)} want=${JSON.stringify(want)}`);
      if (c.expect.exit !== 64 && sums.length !== 1) problems.push(`summary-lines=${sums.length}`);
      if (c.expect.exit === 64 && (r.stdout !== '' || !/^usage: harm-matrix\.mjs /.test(r.stderr))) problems.push('usage-must-be-stderr-only');
      if (c.expect.summary) { const want1 = rep(c.expect.summary); if (!(sums[0] || '').includes(want1)) problems.push(`summary=${JSON.stringify(sums[0] || null)} want~${JSON.stringify(want1)}`); }
      if (c.expect.summary_exact) { if ((sums[0] || '') !== rep(c.expect.summary_exact)) problems.push(`summary=${JSON.stringify(sums[0] || null)} want=${JSON.stringify(rep(c.expect.summary_exact))}`); }
      for (const [gid, sub] of Object.entries(c.expect.text || {})) { const row = rows.find((l) => l.startsWith(`HARM_ROW gate=${gid} `)) || ''; if (!row.includes(sub)) problems.push(`text(${gid}) lacks ${JSON.stringify(sub)}`); }
      if (c.expect.max_ms && ms > c.expect.max_ms) problems.push(`ms=${ms} > ${c.expect.max_ms}`);
      const left = c.tmpdir_is_file ? [] : readdirSync(tmpd).filter((e) => e.startsWith('harm-matrix.'));
      if (left.length) problems.push(`leaked-scratch=${left.length}`);
      if (problems.length === 0) { pass += 1; out(`CASE ok ${c.id}`); } else out(`CASE FAIL ${c.id} ${problems.join(' | ')}`);
    } catch (e) { out(`CASE FAIL ${c.id} threw ${String(e.message).slice(0, 160)}`); } finally { if (fx) reap(fx.D); reap(parent); }
  }
  reap(priv);
  out(`HARM_MATRIX_SELFTEST: ${pass === cases.length ? 'PASS' : 'FAIL'} (${pass}/${cases.length})`);
  process.exit(pass === cases.length ? 0 : 1);
}

// ---------------------------------------------------------------------------------------------------- main
function main() {
  const o = parseArgs(raw);
  if (o['--selftest']) selftest(o);
  if (o['--base'] === undefined || o['--tip'] === undefined) usage('--base and --tip are required');
  if (o['--only'] !== undefined && o['--only'].trim() === '') usage('--only is empty');
  if (o['--timeout'] !== undefined && !/^[1-9][0-9]*$/.test(o['--timeout'])) usage('--timeout must be a positive integer');
  const res = runMatrix(o);
  if (res.fail) failClosed(res.fail, res.detail);
  process.exit(render(res, o));
}
try { main(); } catch (e) { out(`HARM_MATRIX: FAIL_CLOSED reason=INTERNAL detail=${JSON.stringify(String(e && e.message).slice(0, 300))}`); process.exit(2); }

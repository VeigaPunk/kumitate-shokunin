#!/usr/bin/env node
// caproute-probe.mjs — frozen counter for kumitate round 47, claim C1 (operability).
// Usage: node caproute-probe.mjs <lane-repo> <rev>
//
// Predicate (label ROUTED_HELD; the same sentence as plan.md § C1, amendment A1):
//   Site s is ROUTED_HELD at rev r when the owning gate's `--selftest`, run from a `git archive`
//   of r under `strace -f` with a planted canary variable, exits 0, ends `VERDICT: PASS`, prints no
//   FAIL line, and its `<NAME>_SELFTEST: n/m pass` summary has n = m and m no lower than the same
//   run at the frozen base 0bd8be60; no execveat succeeds in the run; every direct child of the
//   gate is either one node exec of r's own `scripts/cap-run.mjs` or only git/mkfifo fixture
//   execs; the site's child (a node exec, for SC859 a shell exec) is exec'd at least once; and
//   every such exec is preceded, in its own ancestry, by the ordered chain r's
//   `scripts/cap-run.mjs` (node) → `/usr/bin/systemd-run --scope` whose own options set
//   `-p MemorySwapMax=0`, `-p MemoryMax=<= 1024M` and `-p TasksMax=<= 256` → `/usr/bin/bwrap`
//   carrying --unshare-pid, --clearenv and --die-with-parent, with no canary variable in the
//   child's environment.
// Output: one `SITE <id> label=ROUTED_HELD|ROUTED_MISS …` line per frozen site, then
//   `CAPROUTE_PROBE rev=<rev> base=<base> held=<h>/5 rule=A2`. Exit 0 iff held=5/5, 1 otherwise,
//   2 when the probe cannot evaluate (archive, strace or parse failure).
// Observation is from outside the gate and the runner: strace's execve/execveat/clone records.
// A1 (round 47, before any candidate was scored): control CtlEnvCaps (caps moved out of systemd's
// -p options into env assignments) read held=5/5 under the freeze rule; A1 adds the conditions
// CritC1Shape objections 1-6 named. Every A1 change adds a condition; none is removed.
// A2 (round 47, before any candidate was scored): ReviewCounter D3 (a record's return value is read only
// from its end), D4 (a run with no execve is exit 2 with its status shown) and D5 (an invalid base run —
// non-zero exit or no suite summary — is exit 2, never a voided floor). Exit 2 is never a score.
import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { basename, join } from 'node:path';
import { randomBytes } from 'node:crypto';

const BASE = '0bd8be60d9150030a2eee8344a2e70b65f6eb4f4';
const SCRATCH = '/fast/scratch/hyaku/kumitate-r47/probe-runs';
const MAX_LOG = 1 << 30;
const MACHINE = new Set(['/usr/bin/systemd-run', '/usr/bin/env', '/usr/bin/bwrap', '/usr/bin/systemctl']);
const SITES = [
  { id: 'K488', gate: 'kimi-census', kind: (e) => basename(e.path) === 'node', match: (a) => a[1]?.endsWith('/scripts/kimi-census.mjs') },
  { id: 'SC549', gate: 'sources-check', kind: (e) => basename(e.path) === 'node', match: (a) => a[1]?.endsWith('/scripts/sources-check.mjs') },
  { id: 'SC859', gate: 'sources-check', kind: (e) => ['sh', 'bash', 'dash'].includes(basename(e.path)), match: (a) => a.includes('sources-check-parity') },
  { id: 'CC879', gate: 'claims-check', kind: (e) => basename(e.path) === 'node', match: (a) => a[1]?.endsWith('/scripts/claims-check.mjs') },
  { id: 'AT802', gate: 'anchor-truth', kind: (e) => basename(e.path) === 'node', match: (a) => a[1]?.endsWith('/scripts/anchor-truth.mjs') && a.includes('--self') },
];

const die = (m) => { process.stdout.write(`CAPROUTE_PROBE: ERROR ${m}\n`); process.exit(2); };
const [lane, revArg] = process.argv.slice(2);
if (!lane || !revArg) die('usage: caproute-probe.mjs <lane-repo> <rev>');
const git = (args) => spawnSync('git', ['-C', lane, ...args], { encoding: 'buffer', maxBuffer: 1 << 28,
  env: { PATH: process.env.PATH, HOME: process.env.HOME } });
const rp = git(['rev-parse', '--verify', `${revArg}^{commit}`]);
if (rp.status !== 0) die(`rev-parse ${revArg}`);
const rev = rp.stdout.toString().trim();

// Parse one strace C value list: "str", [..], numbers, /* comments */, NULL.
function parseStrings(s, i) {
  // expects s[i] === '['; returns [array of strings, index after ']']
  const out = [];
  i++;
  while (i < s.length) {
    while (s[i] === ' ' || s[i] === ',') i++;
    if (s[i] === ']') return [out, i + 1];
    if (s[i] === '"') {
      let v = '';
      i++;
      while (i < s.length && s[i] !== '"') {
        if (s[i] === '\\') {
          const c = s[i + 1];
          if (c === 'x') { v += String.fromCharCode(parseInt(s.slice(i + 2, i + 4), 16)); i += 4; continue; }
          if (/[0-7]/.test(c)) { let j = i + 1; let o = ''; while (j < i + 4 && /[0-7]/.test(s[j])) o += s[j++]; v += String.fromCharCode(parseInt(o, 8)); i = j; continue; }
          v += { n: '\n', t: '\t', r: '\r', v: '\v', f: '\f', '"': '"', '\\': '\\' }[c] ?? c;
          i += 2;
          continue;
        }
        v += s[i++];
      }
      i++;
      if (s.startsWith('...', i)) i += 3;
      out.push(v);
      continue;
    }
    if (s.startsWith('/*', i)) { const j = s.indexOf('*/', i); i = j < 0 ? s.length : j + 2; continue; }
    if (s.startsWith('...', i)) { i += 3; continue; }
    const j = s.slice(i).search(/[,\]]/);
    if (j < 0) return [out, s.length];
    i += j;
  }
  return [out, i];
}

function parseLog(text) {
  const parent = new Map();
  const execs = []; // {pid, seq, path, argv, envp}
  const pending = new Map();
  let seq = 0;
  let rootPid = null;
  let execveat = 0;
  for (let line of text.split('\n')) {
    const m = /^(\d+) (.*)$/.exec(line);
    if (!m) continue;
    const pid = Number(m[1]);
    let body = m[2];
    if (body.endsWith('<unfinished ...>')) { pending.set(pid, body.slice(0, -'<unfinished ...>'.length)); continue; }
    const res = /^<\.\.\. (\w+) resumed>(.*)$/.exec(body);
    if (res) { body = (pending.get(pid) || `${res[1]}(`) + res[2]; pending.delete(pid); }
    const call = /^(execveat|execve|clone3?|v?fork)\(/.exec(body);
    if (!call) continue;
    // --decode-pids=pidns: a clone inside a PID namespace returns `= 2 /* 3100635 in strace's PID NS */`.
    // A2 (ReviewCounter D3): the return is read only from the END of the record, so an argument string
    // containing `) = 7` cannot stand in for it.
    const ret = /\) = (-?\d+)(?: \/\* (\d+) in strace's PID NS \*\/)?(?: E[A-Z0-9]+ \([^()]*\))?$/.exec(body);
    if (!ret) continue;
    const rv = Number(ret[2] ?? ret[1]);
    if (call[1] === 'execveat') {
      // A1 (CritC1Shape 6): an image replacement through execveat is recorded and fails the gate closed.
      if (rv === 0) execveat++;
      continue;
    }
    if (call[1] === 'execve') {
      if (rv !== 0) continue;
      const pm = /^execve\("((?:[^"\\]|\\.)*)"/.exec(body);
      if (!pm) die(`unparsed execve line: ${body.slice(0, 120)}`);
      const [path] = parseStrings(`["${pm[1]}"]`, 0)[0];
      let k = body.indexOf('[', pm[0].length);
      const [argv, k2] = parseStrings(body, k);
      k = body.indexOf('[', k2);
      const [envp] = k >= 0 ? parseStrings(body, k) : [[]];
      if (rootPid === null) rootPid = pid;
      execs.push({ pid, seq: seq++, path, argv, envp });
    } else if (rv > 0) {
      parent.set(rv, pid);
    }
  }
  return { parent, execs, rootPid, execveat };
}

function runGate(tree, gate, canaryKey, canaryVal, tag) {
  const log = join(tree, '..', `${gate}-${tag}.strace`);
  const r = spawnSync('prlimit', [`--fsize=${MAX_LOG * 4}`, '--', 'timeout', '-k', '10', '1200',
    'strace', '-f', '-qq', '-v', '-s', '8192', '--decode-pids=pidns', '-e', 'trace=execve,execveat,clone,clone3,fork,vfork', '-e', 'signal=none',
    '-o', log, '--', process.execPath, join(tree, 'scripts', `${gate}.mjs`), '--selftest'],
  { cwd: tree, encoding: 'utf8', maxBuffer: 1 << 28, env: { ...process.env, [canaryKey]: canaryVal } });
  let size = 0;
  try { size = statSync(log).size; } catch { die(`no strace log for ${gate} (${tag}); status=${r.status} ${String(r.stderr).slice(-300)}`); }
  if (size > MAX_LOG) die(`strace log for ${gate} too large (${size})`);
  const text = readFileSync(log, 'utf8');
  const parsed = parseLog(text);
  // A2 (ReviewCounter D4): a run that recorded nothing is "cannot evaluate" (exit 2) with its status
  // and stderr shown; it is never a score. The log is kept until this check passes.
  if (parsed.rootPid === null) die(`no execve recorded for ${gate} (${tag}); status=${r.status} log_bytes=${size} stderr=${JSON.stringify(String(r.stderr).slice(-300))}`);
  rmSync(log, { force: true });
  // A1 (CritC1Shape 2): the owning suite's own summary line, its final `VERDICT: PASS`, and no FAIL case line.
  const lines = String(r.stdout).split('\n');
  const sum = lines.map((l) => /^[A-Z][A-Z_]*_SELFTEST: (\d+)\/(\d+) pass$/.exec(l)).filter(Boolean).at(-1);
  const verdictPass = (lines.filter((l) => l.trim() !== '').at(-1) || '') === 'VERDICT: PASS';
  const failLines = lines.filter((l) => /^FAIL\b/.test(l)).length;
  return { status: r.status, tail: lines.filter((l) => l.trim() !== '').at(-1) || '',
    pass: sum ? Number(sum[1]) : -1, total: sum ? Number(sum[2]) : -1, verdictPass, failLines, ...parsed };
}

// A1 (CritC1Shape 4): ancestry at the child's exec time — the ancestor PIDs of the child and only
// the execs recorded before it, in order.
function ancestorsOrSelf(p, pid) {
  const out = [pid];
  const seen = new Set(out);
  let q = p.parent.get(pid);
  while (q !== undefined && !seen.has(q)) { seen.add(q); out.push(q); q = p.parent.get(q); }
  return out;
}

// A1 (CritC1Shape 1): systemd-run's own options, before its `--`, as `-p K=V` / `--property=K=V`.
function scopeProps(x) {
  const props = new Map();
  let scope = false;
  for (let i = 1; i < x.argv.length && x.argv[i] !== '--'; i++) {
    const a = x.argv[i];
    if (a === '--scope') scope = true;
    let kv = null;
    if ((a === '-p' || a === '--property') && i + 1 < x.argv.length) kv = x.argv[++i];
    else if (a.startsWith('--property=')) kv = a.slice('--property='.length);
    else if (a.startsWith('-p') && a.length > 2) kv = a.slice(2);
    if (kv && kv.includes('=')) props.set(kv.slice(0, kv.indexOf('=')), kv.slice(kv.indexOf('=') + 1));
  }
  return { scope, props };
}
const isScope = (x) => {
  if (x.path !== '/usr/bin/systemd-run') return false;
  const { scope, props } = scopeProps(x);
  const mm = /^(\d+)M$/.exec(props.get('MemoryMax') || '');
  const tm = /^(\d+)$/.exec(props.get('TasksMax') || '');
  return scope && props.get('MemorySwapMax') === '0' && mm && Number(mm[1]) <= 1024 && tm && Number(tm[1]) <= 256;
};
const isBwrap = (x) => x.path === '/usr/bin/bwrap' && ['--unshare-pid', '--clearenv', '--die-with-parent'].every((f) => x.argv.includes(f));
const isNode = (x) => basename(x.path) === 'node';
const SHELLS = new Set(['sh', 'bash', 'dash']);

// A1 (CritC1Shape 3, 5): every direct child of the gate's root either is exactly one exec of node
// running the rev's own cap-run.mjs, or execs only the fixture tools below; anything else is an
// uncapped launch (a dodge through a copied file, renamed label, env, another interpreter included).
const FIXTURE_TOOLS = new Set(['/usr/bin/git', '/usr/bin/mkfifo']);
function uncappedDirect(p, tree) {
  const runner = join(tree, 'scripts', 'cap-run.mjs');
  let n = 0;
  for (const [kid, par] of p.parent) {
    if (par !== p.rootPid) continue;
    const ex = p.execs.filter((x) => x.pid === kid);
    if (ex.length === 0) continue;
    if (ex.length === 1 && isNode(ex[0]) && ex[0].argv[1] === runner) continue;
    if (ex.every((x) => FIXTURE_TOOLS.has(x.path))) continue;
    n++;
  }
  return n;
}

function judge(p, tree, site, canaryKey) {
  const runnerFile = join(tree, 'scripts', 'cap-run.mjs');
  const cands = p.execs.filter((e) => e.pid !== p.rootPid && !MACHINE.has(e.path)
    && e.argv[1] !== runnerFile && site.match(e.argv) && site.kind(e));
  let capped = 0;
  const why = new Set();
  for (const e of cands) {
    const anc = ancestorsOrSelf(p, e.pid);
    const before = (pid, seqMax) => p.execs.filter((x) => x.pid === pid && x.seq < seqMax);
    // ordered chain: runner R (node + rev's cap-run.mjs) → systemd-run S → bwrap B → child e,
    // each recorded before the next and each in the ancestry (or same PID) of the next.
    let chain = false;
    let haveR = false; let haveS = false; let haveB = false;
    for (const bp of anc) {
      for (const B of before(bp, e.seq).filter(isBwrap)) {
        haveB = true;
        for (const sp of ancestorsOrSelf(p, B.pid)) {
          for (const S of before(sp, B.seq).filter(isScope)) {
            haveS = true;
            for (const rp of ancestorsOrSelf(p, S.pid)) {
              if (before(rp, S.seq).some((R) => isNode(R) && R.argv[1] === runnerFile)) { haveR = true; chain = true; }
            }
          }
        }
      }
    }
    const leak = e.envp.some((v) => v.startsWith(`${canaryKey}=`));
    if (!haveB) why.add('no_bwrap_ancestor');
    if (!haveS) why.add('no_capped_scope_ancestor');
    if (!haveR) why.add('no_cap_run_ancestor');
    if (leak) why.add('canary_in_env');
    if (chain && !leak) capped++;
  }
  return { n: cands.length, capped, why: [...why], dodge: uncappedDirect(p, tree), execveat: p.execveat };
}

function measure(r, tag) {
  const dir = join(SCRATCH, `${r.slice(0, 12)}-${tag}-${randomBytes(4).toString('hex')}`);
  const tree = join(dir, 'tree');
  mkdirSync(tree, { recursive: true });
  try {
    const ar = git(['archive', '--format=tar', r]);
    if (ar.status !== 0) die(`git archive ${r}`);
    const tx = spawnSync('tar', ['-x', '-C', tree], { input: ar.stdout });
    if (tx.status !== 0) die(`tar -x for ${r}`);
    const canaryKey = `KUMITATE_CAPROUTE_CANARY_${randomBytes(4).toString('hex').toUpperCase()}`;
    const canaryVal = randomBytes(8).toString('hex');
    const runs = {};
    const out = {};
    for (const s of SITES) {
      runs[s.gate] ??= runGate(tree, s.gate, canaryKey, canaryVal, tag);
      out[s.id] = { ...judge(runs[s.gate], tree, s, canaryKey), status: runs[s.gate].status, tail: runs[s.gate].tail,
        pass: runs[s.gate].pass, total: runs[s.gate].total, verdictPass: runs[s.gate].verdictPass, failLines: runs[s.gate].failLines };
    }
    return out;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const base = measure(BASE, 'base');
for (const s of SITES) {
  if (base[s.id].status !== 0 || base[s.id].total < 1) die(`base run invalid for ${s.gate}: status=${base[s.id].status} total=${base[s.id].total}`);
}
const tip = rev === BASE ? base : measure(rev, 'rev');
let held = 0;
for (const s of SITES) {
  const t = tip[s.id];
  const b = base[s.id];
  const why = [...t.why];
  if (t.status !== 0) why.push(`gate_exit=${t.status}`);
  if (t.n < 1) why.push('no_child_exec');
  if (t.dodge > 0) why.push(`uncapped_direct_children=${t.dodge}`);
  if (t.execveat > 0) why.push(`execveat=${t.execveat}`);
  if (!t.verdictPass) why.push('no_final_verdict_pass');
  if (t.failLines > 0) why.push(`fail_lines=${t.failLines}`);
  if (t.total < 1 || t.pass !== t.total || t.total < b.total) why.push(`selftest_cases=${t.pass}/${t.total}<base_total=${b.total}`);
  const ok = why.length === 0 && t.capped === t.n && t.n >= 1 && t.dodge === 0 && t.execveat === 0 && t.status === 0
    && t.verdictPass && t.failLines === 0 && t.total >= 1 && t.pass === t.total && t.total >= b.total;
  if (ok) held++;
  process.stdout.write(`SITE ${s.id} gate=${s.gate} label=${ok ? 'ROUTED_HELD' : 'ROUTED_MISS'} n=${t.n} base_n=${b.n} capped=${t.capped} uncapped_direct=${t.dodge} cases=${t.pass}/${t.total} base_cases=${b.pass}/${b.total} gate_exit=${t.status}${ok ? '' : ` reason=${why.join(',')}`}\n`);
}
process.stdout.write(`CAPROUTE_PROBE rev=${rev} base=${BASE.slice(0, 8)} held=${held}/${SITES.length} rule=A2\n`);
process.exit(held === SITES.length ? 0 : 1);

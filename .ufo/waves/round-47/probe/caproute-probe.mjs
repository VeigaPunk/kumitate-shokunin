#!/usr/bin/env node
// caproute-probe.mjs — frozen counter for kumitate round 47, claim C1 (operability).
// Usage: node caproute-probe.mjs <lane-repo> <rev>
//
// Predicate (label ROUTED_HELD; the same sentence as plan.md § C1):
//   Site s is ROUTED_HELD at rev r when the owning gate's `--selftest`, run from a `git archive`
//   of r under `strace -f` with a planted canary variable, exits 0 with every case passing and
//   no fewer cases than the same run at the frozen base 0bd8be60; execs the site's child at
//   least once; launches no node or shell direct child other than r's own `scripts/cap-run.mjs`;
//   and every exec of the site's child descends from r's `scripts/cap-run.mjs`, from a
//   `/usr/bin/systemd-run --scope` carrying MemorySwapMax=0, MemoryMax <= 1024M and
//   TasksMax <= 256, and from a `/usr/bin/bwrap` carrying --unshare-pid, --clearenv and
//   --die-with-parent, with no canary variable in the child's environment.
// Output: one `SITE <id> label=ROUTED_HELD|ROUTED_MISS …` line per frozen site, then
//   `CAPROUTE_PROBE rev=<rev> base=<base> held=<h>/5`. Exit 0 iff held=5/5, 1 otherwise,
//   2 when the probe cannot evaluate (archive, strace or parse failure).
// Observation is from outside the gate and the runner: strace's execve/clone records.
import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { basename, join } from 'node:path';
import { randomBytes } from 'node:crypto';

const BASE = '0bd8be60d9150030a2eee8344a2e70b65f6eb4f4';
const SCRATCH = '/fast/scratch/hyaku/kumitate-r47/probe-runs';
const MAX_LOG = 1 << 30;
const MACHINE = new Set(['/usr/bin/systemd-run', '/usr/bin/env', '/usr/bin/bwrap', '/usr/bin/systemctl']);
const SITES = [
  { id: 'K488', gate: 'kimi-census', match: (a) => a[1]?.endsWith('/scripts/kimi-census.mjs') },
  { id: 'SC549', gate: 'sources-check', match: (a) => a[1]?.endsWith('/scripts/sources-check.mjs') },
  { id: 'SC859', gate: 'sources-check', match: (a) => a.includes('sources-check-parity') },
  { id: 'CC879', gate: 'claims-check', match: (a) => a[1]?.endsWith('/scripts/claims-check.mjs') },
  { id: 'AT802', gate: 'anchor-truth', match: (a) => a[1]?.endsWith('/scripts/anchor-truth.mjs') && a.includes('--self') },
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
  for (let line of text.split('\n')) {
    const m = /^(\d+) (.*)$/.exec(line);
    if (!m) continue;
    const pid = Number(m[1]);
    let body = m[2];
    if (body.endsWith('<unfinished ...>')) { pending.set(pid, body.slice(0, -'<unfinished ...>'.length)); continue; }
    const res = /^<\.\.\. (\w+) resumed>(.*)$/.exec(body);
    if (res) { body = (pending.get(pid) || `${res[1]}(`) + res[2]; pending.delete(pid); }
    const call = /^(execve|clone3?|v?fork)\(/.exec(body);
    if (!call) continue;
    // --decode-pids=pidns: a clone inside a PID namespace returns `= 2 /* 3100635 in strace's PID NS */`.
    const ret = /\) = (-?\d+)(?: \/\* (\d+) in strace's PID NS \*\/)?(?: .*)?$/.exec(body);
    if (!ret) continue;
    const rv = Number(ret[2] ?? ret[1]);
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
  return { parent, execs, rootPid };
}

function runGate(tree, gate, canaryKey, canaryVal, tag) {
  const log = join(tree, '..', `${gate}-${tag}.strace`);
  const r = spawnSync('prlimit', [`--fsize=${MAX_LOG * 4}`, '--', 'timeout', '-k', '10', '1200',
    'strace', '-f', '-qq', '-v', '-s', '8192', '--decode-pids=pidns', '-e', 'trace=execve,clone,clone3,fork,vfork', '-e', 'signal=none',
    '-o', log, '--', process.execPath, join(tree, 'scripts', `${gate}.mjs`), '--selftest'],
  { cwd: tree, encoding: 'utf8', maxBuffer: 1 << 28, env: { ...process.env, [canaryKey]: canaryVal } });
  let size = 0;
  try { size = statSync(log).size; } catch { die(`no strace log for ${gate} (${tag}); status=${r.status} ${String(r.stderr).slice(-300)}`); }
  if (size > MAX_LOG) die(`strace log for ${gate} too large (${size})`);
  const parsed = parseLog(readFileSync(log, 'utf8'));
  rmSync(log, { force: true });
  if (parsed.rootPid === null) die(`no execve recorded for ${gate} (${tag})`);
  const sum = String(r.stdout).split('\n').map((l) => /\b(\d+)\/(\d+)\b/.exec(l)).filter(Boolean).at(-1);
  return { status: r.status, tail: String(r.stdout).trim().split('\n').at(-1) || '',
    pass: sum ? Number(sum[1]) : -1, total: sum ? Number(sum[2]) : -1, ...parsed };
}

function chainOf(p, e) {
  const out = p.execs.filter((x) => x.pid === e.pid && x.seq < e.seq);
  const seen = new Set();
  let q = p.parent.get(e.pid);
  while (q !== undefined && !seen.has(q)) { seen.add(q); out.push(...p.execs.filter((x) => x.pid === q)); q = p.parent.get(q); }
  return out;
}

// A direct child of the gate's root process that runs node or a shell without being the rev's
// own cap-run.mjs is an uncapped launch (a dodge by copied file or renamed label included).
const SHELLS = new Set(['sh', 'bash', 'dash', 'zsh']);
function uncappedDirect(p, tree) {
  const runner = join(tree, 'scripts', 'cap-run.mjs');
  let n = 0;
  for (const [kid, par] of p.parent) {
    if (par !== p.rootPid) continue;
    const ex = p.execs.filter((x) => x.pid === kid);
    if (ex.length === 0 || ex[0].argv[1] === runner) continue;
    if (ex.some((x) => basename(x.path) === 'node' || SHELLS.has(basename(x.path)))) n++;
  }
  return n;
}

function judge(p, tree, site, canaryKey) {
  const runnerFile = join(tree, 'scripts', 'cap-run.mjs');
  const cands = p.execs.filter((e) => e.pid !== p.rootPid && !MACHINE.has(e.path)
    && e.argv[1] !== runnerFile && site.match(e.argv));
  let capped = 0;
  const why = new Set();
  for (const e of cands) {
    const ch = chainOf(p, e);
    const runner = ch.some((x) => x.argv[1] === join(tree, 'scripts', 'cap-run.mjs'));
    const sd = ch.some((x) => {
      if (x.path !== '/usr/bin/systemd-run' || !x.argv.includes('--scope') || !x.argv.includes('MemorySwapMax=0')) return false;
      const mm = x.argv.map((a) => /^MemoryMax=(\d+)M$/.exec(a)).find(Boolean);
      const tm = x.argv.map((a) => /^TasksMax=(\d+)$/.exec(a)).find(Boolean);
      return mm && Number(mm[1]) <= 1024 && tm && Number(tm[1]) <= 256;
    });
    const bw = ch.some((x) => x.path === '/usr/bin/bwrap' && ['--unshare-pid', '--clearenv', '--die-with-parent'].every((f) => x.argv.includes(f)));
    const leak = e.envp.some((v) => v.startsWith(`${canaryKey}=`));
    if (!runner) why.add('no_cap_run_ancestor');
    if (!sd) why.add('no_capped_scope_ancestor');
    if (!bw) why.add('no_bwrap_ancestor');
    if (leak) why.add('canary_in_env');
    if (runner && sd && bw && !leak) capped++;
  }
  return { n: cands.length, capped, why: [...why], dodge: uncappedDirect(p, tree) };
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
        pass: runs[s.gate].pass, total: runs[s.gate].total };
    }
    return out;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const base = measure(BASE, 'base');
const tip = rev === BASE ? base : measure(rev, 'rev');
let held = 0;
for (const s of SITES) {
  const t = tip[s.id];
  const b = base[s.id];
  const why = [...t.why];
  if (t.status !== 0) why.push(`gate_exit=${t.status}`);
  if (t.n < 1) why.push('no_child_exec');
  if (t.dodge > 0) why.push(`uncapped_direct_children=${t.dodge}`);
  if (t.total < 1 || t.pass !== t.total || t.total < b.total) why.push(`selftest_cases=${t.pass}/${t.total}<base_total=${b.total}`);
  const ok = why.length === 0 && t.capped === t.n && t.n >= 1 && t.dodge === 0 && t.status === 0
    && t.total >= 1 && t.pass === t.total && t.total >= b.total;
  if (ok) held++;
  process.stdout.write(`SITE ${s.id} gate=${s.gate} label=${ok ? 'ROUTED_HELD' : 'ROUTED_MISS'} n=${t.n} base_n=${b.n} capped=${t.capped} uncapped_direct=${t.dodge} cases=${t.pass}/${t.total} base_cases=${b.pass}/${b.total} gate_exit=${t.status}${ok ? '' : ` reason=${why.join(',')}`}\n`);
}
process.stdout.write(`CAPROUTE_PROBE rev=${rev} base=${BASE.slice(0, 8)} held=${held}/${SITES.length}\n`);
process.exit(held === SITES.length ? 0 : 1);

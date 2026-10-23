#!/usr/bin/env node
// kumitate round 46 — O2 counter (CAPRUN_PROBE), amendment A3. Predicate label: CAP_HELD.
//
// Predicate (same sentence as plan.md § A3): the runner `scripts/cap-run.mjs` in a clone of revision R is
// CAP_HELD on case k when what THIS PROBE OBSERVES FROM OUTSIDE THE RUNNER — the live child process found in
// /proc by a random marker in its argv, its /proc/<pid>/ns/pid, /proc/<pid>/cgroup → /sys/fs/cgroup/<path>/memory.max,
// /proc/<pid>/environ, the environ of its PID namespace's init, files the child writes, the runner's exit and
// stderr — meets case k:
//   K1 native memory — under `--mem M` (M random in 112..176): (i) a child allocating sixty-four 16 MiB Buffers and
//      recording each allocation records at least 1 and at most ceil(M/16), never reaches DONE, and the runner exits
//      non-zero; (ii) a child that sleeps 1 s, allocates two Buffers and writes DONE reaches DONE with runner exit 0,
//      and while it lives the probe sees it in a cgroup whose memory.max is exactly M MiB.
//   K2 descendants — a child that starts a detached new-session grandchild, waits 1.5 s and exits 0: the probe sees
//      the grandchild alive during the run, the runner exits 0 within 30 s, and 1 s after it returns the grandchild
//      is gone.
//   K3 total budget — under `--budget B` (B random in 2..4), a 300 s child: the probe sees it alive, the runner
//      returns within B+7 s, non-zero, with a stderr line starting `CAP_RUN: BUDGET`, and 1 s later it is gone.
//   K4 explicit environment — runner environment carries GIT_DIR, GIT_WORK_TREE, GIT_INDEX_FILE and a random secret
//      key; `--env <P>=<V>` (random): the probe reads the live child's /proc/<pid>/environ and finds P=V and none of
//      the four keys; the runner exits 0.
//   K5 signal cleanup — a 300 s child seen alive, then SIGTERM to the runner: the runner exits within 10 s and 1 s
//      later the child is gone.
//   K6 isolation (QUALITY Q31) — runner environment carries a random marker key and GIT_DIR: the live child's
//      /proc/<pid>/ns/pid differs from the probe's, the process that is PID 1 of that namespace (NSpid last field 1)
//      is found, and its environ contains neither the marker nor GIT_DIR; the runner exits 0.
// A missing runner, a probe-side timeout (60 s per invocation, SIGKILL) or any unmet clause is NOT_HELD.
// Fixture names, key names, values, markers, M and B are random per run; the drawn M and B print on PARAMS.
// Frozen runner interface: node scripts/cap-run.mjs --mem <MiB> --tasks <n> --budget <s> [--env K=V]... -- <cmd> [args...]
// Usage: node caprun-probe.mjs <lane-repo> <rev>   Output: PARAMS, one line per case, then
//   CAPRUN_PROBE rev=<full> held=<k>/6        Exit 0 = 6/6, 1 = fewer, 2 = usage/setup error.
import { spawnSync, spawn } from 'node:child_process';
import { mkdtempSync, rmSync, readFileSync, readdirSync, existsSync, mkdirSync, readlinkSync } from 'node:fs';
import { join } from 'node:path';
import { randomBytes, randomInt } from 'node:crypto';

const hex = () => randomBytes(5).toString('hex').toUpperCase();
const P = { M: randomInt(112, 177), B: randomInt(2, 5), prog: `p${hex()}.txt`, secret: `S_${hex()}`, passK: `P_${hex()}`,
  passV: hex(), mark: `M_${hex()}`, fake: `/nonexistent-${hex()}` };
const [lane, revIn] = process.argv.slice(2);
if (!lane || !revIn) { console.log('CAPRUN_PROBE: usage <lane-repo> <rev>'); process.exit(2); }
const scrub = { ...process.env };
for (const k of ['GIT_DIR', 'GIT_WORK_TREE', 'GIT_INDEX_FILE', 'GIT_OBJECT_DIRECTORY', 'GIT_COMMON_DIR']) delete scrub[k];
const git = (args, cwd) => spawnSync('git', args, { cwd, env: scrub, encoding: 'utf8', timeout: 120_000 });
const rp = git(['-C', lane, 'rev-parse', '--verify', `${revIn}^{commit}`]);
if (rp.status !== 0) { console.log('CAPRUN_PROBE: usage bad rev'); process.exit(2); }
const rev = rp.stdout.trim();
const root = process.env.SCRATCH_ROOT || '/fast/scratch/hyaku/kumitate-r46/runs';
mkdirSync(root, { recursive: true });
const W = mkdtempSync(join(root, `w${hex()}.`));
const markers = [];
const newMarker = () => { const m = `x${hex()}${hex()}`; markers.push(m); return m; };
const ownNs = (() => { try { return readlinkSync('/proc/self/ns/pid'); } catch { return null; } })();
const rd = (p, enc = 'latin1') => { try { return readFileSync(p, enc); } catch { return null; } };
const pidsWith = (m, childOnly = false) => {
  const out = [];
  for (const p of readdirSync('/proc')) {
    if (!/^\d+$/.test(p) || Number(p) === process.pid) continue;
    const c = rd(`/proc/${p}/cmdline`);
    if (!c) continue;
    const argv = c.split('\0'); if (argv[argv.length - 1] === '') argv.pop();
    if (!argv.includes(m)) continue;
    // the child itself: `<node> -e <script> <marker>` (launchers carry the marker deeper in their argv)
    if (childOnly && !(argv.length === 4 && argv[1] === '-e' && argv[3] === m)) continue;
    out.push(p);
  }
  return out;
};
const nsInitEnv = (ns) => {
  for (const p of readdirSync('/proc')) {
    if (!/^\d+$/.test(p)) continue;
    let n = null; try { n = readlinkSync(`/proc/${p}/ns/pid`); } catch { continue; }
    if (n !== ns) continue;
    const st = rd(`/proc/${p}/status`, 'utf8') || '';
    const nl = (st.match(/^NSpid:\s*(.*)$/m) || [])[1];
    if (nl && nl.trim().split(/\s+/).pop() === '1') return rd(`/proc/${p}/environ`) ?? '';
  }
  return null;
};
const observe = (m, obs) => {
  for (const p of pidsWith(m, true)) {
    obs.seen = true;
    let ns = null; try { ns = readlinkSync(`/proc/${p}/ns/pid`); } catch { /* gone */ }
    if (ns) { obs.ns.add(ns); if (ns !== ownNs && obs.initEnv === undefined) { const e = nsInitEnv(ns); if (e !== null) obs.initEnv = e; } }
    const cg = ((rd(`/proc/${p}/cgroup`, 'utf8') || '').match(/^0::(.*)$/m) || [])[1];
    if (cg !== undefined) { const mx = rd(`/sys/fs/cgroup${cg}/memory.max`, 'utf8'); if (mx !== null) obs.cgmax.add(mx.trim()); }
    if (obs.env === undefined) { const e = rd(`/proc/${p}/environ`); if (e) obs.env = e.split('\0').filter(Boolean); }
  }
};
const killMarker = (m) => { let n = 0; for (const p of pidsWith(m)) { try { process.kill(Number(p), 'SIGKILL'); n++; } catch { /* gone */ } } return n; };
const finish = (code) => {
  let leftover = 0;
  for (const m of markers) leftover += killMarker(m);
  rmSync(W, { recursive: true, force: true });
  if (leftover) console.log(`LEFTOVER_KILLED ${leftover}`);
  process.exit(code);
};
process.on('SIGINT', () => finish(2));
process.on('SIGTERM', () => finish(2));

const cl = git(['clone', '-q', '--no-hardlinks', lane, join(W, 'r')]);
const co = cl.status === 0 ? git(['-C', join(W, 'r'), 'checkout', '-q', '--detach', rev]) : cl;
if (co.status !== 0) { console.log(`CAPRUN_PROBE: clone failed rev=${rev}`); finish(2); }
const runner = join(W, 'r', 'scripts', 'cap-run.mjs');
const cwd = join(W, 'cwd');
mkdirSync(cwd, { recursive: true });
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
// run the runner asynchronously while polling /proc every 50 ms for the watched markers
const run = (args, { env = scrub, watch = [], sigtermWhenSeen = null } = {}) => new Promise((resolve) => {
  const t0 = Date.now();
  const obs = Object.fromEntries(watch.map((m) => [m, { seen: false, ns: new Set(), cgmax: new Set(), env: undefined, initEnv: undefined }]));
  const ch = spawn(process.execPath, [runner, ...args], { cwd, env, stdio: ['ignore', 'pipe', 'pipe'] });
  let out = ''; let err = ''; let sigAt = null; let done = false;
  ch.stdout.on('data', (d) => { if (out.length < 1 << 20) out += d; });
  ch.stderr.on('data', (d) => { if (err.length < 1 << 20) err += d; });
  const iv = setInterval(() => {
    for (const m of watch) observe(m, obs[m]);
    if (sigtermWhenSeen && sigAt === null && obs[sigtermWhenSeen]?.seen && Date.now() - t0 > 1000) { sigAt = Date.now(); ch.kill('SIGTERM'); }
  }, 50);
  const kill = setTimeout(() => { if (!done) ch.kill('SIGKILL'); }, 60_000);
  ch.on('close', (status, signal) => {
    done = true; clearInterval(iv); clearTimeout(kill);
    resolve({ status, signal, stdout: out, stderr: err, wall: (Date.now() - t0) / 1000, obs, sigAt, endAt: Date.now() });
  });
});
const results = [];
const report = (k, ok, why) => { results.push(ok); console.log(`CASE ${k} ${ok ? 'CAP_HELD' : `NOT_HELD(${why})`}`); };
const MB = String(P.M * 1048576);
console.log(`PARAMS M=${P.M} maxAllocs=${Math.ceil(P.M / 16)} B=${P.B}`);
const SLEEP = 'setTimeout(()=>{},300000)';

if (!existsSync(runner)) {
  for (const k of ['K1', 'K2', 'K3', 'K4', 'K5', 'K6']) report(k, false, 'no runner');
} else {
  { // K1
    const prog = join(cwd, P.prog);
    const hog = `const fs=require('fs');const a=[];for(let i=1;i<=64;i++){a.push(Buffer.alloc(16<<20,1));fs.writeFileSync(${JSON.stringify(P.prog)},String(i));}fs.writeFileSync(${JSON.stringify(P.prog)},'DONE');`;
    const m1 = newMarker();
    const r1 = await run(['--mem', String(P.M), '--tasks', '64', '--budget', '60', '--', 'node', '-e', hog, m1]);
    const p1 = rd(prog, 'utf8') ?? '0';
    rmSync(prog, { force: true });
    const live = `const fs=require('fs');setTimeout(()=>{const a=[];for(let i=1;i<=2;i++){a.push(Buffer.alloc(16<<20,1));}fs.writeFileSync(${JSON.stringify(P.prog)},'DONE');},1000);`;
    const m2 = newMarker();
    const r2 = await run(['--mem', String(P.M), '--tasks', '64', '--budget', '60', '--', 'node', '-e', live, m2], { watch: [m2] });
    const p2 = rd(prog, 'utf8') ?? '0';
    const o = r2.obs[m2];
    const why = [];
    if (p1 === 'DONE' || !(Number(p1) >= 1) || Number(p1) > Math.ceil(P.M / 16)) why.push(`allocs=${p1}`);
    if (r1.status === 0) why.push('hog_exit=0');
    if (p2 !== 'DONE' || r2.status !== 0) why.push(`liveness=${p2}/exit=${r2.status}`);
    if (!o.seen) why.push('child_never_seen');
    else if (!o.cgmax.has(MB) || o.cgmax.size !== 1) why.push(`cgroup_memory_max=${[...o.cgmax].join('|') || 'none'}`);
    report('K1', why.length === 0, why.join(','));
  }
  { // K2
    const g = newMarker();
    const js = `require('child_process').spawn(process.execPath,['-e',${JSON.stringify(SLEEP)},${JSON.stringify(g)}],{detached:true,stdio:'ignore'}).unref();setTimeout(()=>{},1500);`;
    const r = await run(['--mem', '256', '--tasks', '64', '--budget', '60', '--', 'node', '-e', js], { watch: [g] });
    await sleep(1000);
    const why = [];
    if (!r.obs[g].seen) why.push('grandchild_never_seen');
    if (r.status !== 0) why.push(`exit=${r.status}`);
    if (r.wall > 30) why.push(`wall=${r.wall}`);
    if (pidsWith(g).length) why.push(`leftover=${pidsWith(g).length}`);
    report('K2', why.length === 0, why.join(','));
  }
  { // K3
    const m = newMarker();
    const r = await run(['--mem', '256', '--tasks', '64', '--budget', String(P.B), '--', 'node', '-e', SLEEP, m], { watch: [m] });
    await sleep(1000);
    const why = [];
    if (!r.obs[m].seen) why.push('child_never_seen');
    if (r.wall > P.B + 7) why.push(`wall=${r.wall}`);
    if (r.status === 0) why.push('exit=0');
    if (!/^CAP_RUN: BUDGET/m.test(r.stderr)) why.push('no_budget_line');
    if (pidsWith(m).length) why.push(`leftover=${pidsWith(m).length}`);
    report('K3', why.length === 0, why.join(','));
  }
  { // K4
    const m = newMarker();
    const env = { ...scrub, GIT_DIR: `${P.fake}/.git`, GIT_WORK_TREE: P.fake, GIT_INDEX_FILE: `${P.fake}/index`, [P.secret]: hex() };
    const r = await run(['--mem', '256', '--tasks', '64', '--budget', '60', '--env', `${P.passK}=${P.passV}`, '--', 'node', '-e', 'setTimeout(()=>{},1500)', m], { env, watch: [m] });
    const o = r.obs[m];
    const why = [];
    if (r.status !== 0) why.push(`exit=${r.status}`);
    if (!o.seen || !o.env) why.push('child_env_never_read');
    else {
      if (!o.env.includes(`${P.passK}=${P.passV}`)) why.push('passed_missing');
      for (const k of ['GIT_DIR', 'GIT_WORK_TREE', 'GIT_INDEX_FILE', P.secret]) if (o.env.some((l) => l.startsWith(`${k}=`))) why.push(`leaked_${k === P.secret ? 'secret' : k}`);
    }
    report('K4', why.length === 0, why.join(','));
  }
  { // K5
    const m = newMarker();
    const r = await run(['--mem', '256', '--tasks', '64', '--budget', '120', '--', 'node', '-e', SLEEP, m], { watch: [m], sigtermWhenSeen: m });
    await sleep(1000);
    const why = [];
    if (!r.obs[m].seen || r.sigAt === null) why.push('child_never_seen_before_signal');
    else if ((r.endAt - r.sigAt) / 1000 > 10) why.push(`exit_after=${(r.endAt - r.sigAt) / 1000}`);
    if (pidsWith(m).length) why.push(`leftover=${pidsWith(m).length}`);
    report('K5', why.length === 0, why.join(','));
  }
  { // K6
    const m = newMarker();
    const mk = `${hex()}${hex()}`;
    const env = { ...scrub, [P.mark]: mk, GIT_DIR: `${P.fake}/.git` };
    const r = await run(['--mem', '256', '--tasks', '64', '--budget', '60', '--', 'node', '-e', 'setTimeout(()=>{},1500)', m], { env, watch: [m] });
    const o = r.obs[m];
    const why = [];
    if (r.status !== 0) why.push(`exit=${r.status}`);
    if (!o.seen) why.push('child_never_seen');
    else if (o.ns.size === 0 || o.ns.has(ownNs)) why.push('pid_ns_not_own');
    else if (o.initEnv === undefined) why.push('ns_init_not_found');
    else {
      if (o.initEnv.includes(mk)) why.push('marker_in_ns_init_env');
      if (o.initEnv.includes('GIT_DIR=')) why.push('git_dir_in_ns_init_env');
    }
    report('K6', why.length === 0, why.join(','));
  }
}
const held = results.filter(Boolean).length;
console.log(`CAPRUN_PROBE rev=${rev} held=${held}/6`);
finish(held === 6 ? 0 : 1);

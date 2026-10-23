#!/usr/bin/env node
// kumitate round 46 — C2 frozen counter (CAPRUN_PROBE). Predicate label: CAP_HELD.
//
// Predicate (same sentence as plan.md § C2): the runner `scripts/cap-run.mjs` in a clone of revision R
// is CAP_HELD on case k when the behaviour this probe observes from outside the runner meets case k:
//   K1 native memory — under `--mem M` (M drawn per run from 112..176), a child that allocates sixty-four
//      16 MiB Buffers and records each allocation records at most ceil(M/16), never reaches DONE, and the
//      runner exits non-zero; and the same runner lets a 2-allocation child reach DONE with exit 0, and that
//      child reads its own cgroup's memory.max (/proc/self/cgroup → /sys/fs/cgroup) as exactly M MiB (A2).
//   K2 descendants — a child that starts a detached new-session grandchild and exits 0: the runner
//      exits 0 within 30 s and 1 s after it returns no process carries the grandchild's marker.
//   K3 total budget — under `--budget B` (B drawn per run from 2..4), a 300 s child: the runner returns within
//      B+7 s, non-zero, with a stderr line starting `CAP_RUN: BUDGET`, and 1 s later no process carries the
//      child's marker.
//   K4 explicit environment — run with GIT_DIR, GIT_WORK_TREE, GIT_INDEX_FILE and a secret key in the
//      runner's own environment and `--env <P>=<V>`: the runner exits 0 and the child's environment
//      (printed by the child to stdout) has P=V and none of the four keys.
//   K5 signal cleanup — SIGTERM to the runner 1.5 s into a 300 s child: the runner exits within 10 s and
//      1 s later no process carries the child's marker.
//   K6 isolation (QUALITY Q31) — run with a marker key in the runner's own environment: the runner exits 0
//      and the child reads /proc/1/environ successfully and finds neither the marker nor GIT_DIR in it, and
//      the child's /proc/self/ns/pid differs from the probe's own (a PID namespace of its own; A2).
// Fixture names, key names, values, M and B are random per run (no fixed label to key on); the
// drawn values are printed on the PARAMS line.
// A missing runner, a probe-side timeout (60 s per invocation, SIGKILL) or any unmet clause is NOT_HELD.
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
const tag = `x${hex()}${hex()}`;
const markers = [];
const alive = (m) => {
  let n = 0;
  for (const p of readdirSync('/proc')) {
    if (!/^\d+$/.test(p) || Number(p) === process.pid) continue;
    try { if (readFileSync(`/proc/${p}/cmdline`, 'latin1').includes(m)) n++; } catch { /* gone */ }
  }
  return n;
};
const killMarker = (m) => {
  let n = 0;
  for (const p of readdirSync('/proc')) {
    if (!/^\d+$/.test(p) || Number(p) === process.pid) continue;
    try { if (readFileSync(`/proc/${p}/cmdline`, 'latin1').includes(m)) { process.kill(Number(p), 'SIGKILL'); n++; } } catch { /* gone */ }
  }
  return n;
};
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
const sleepJs = 'setTimeout(()=>{},300000)';
const cwd = join(W, 'cwd');
mkdirSync(cwd, { recursive: true });
const run = (args, env = scrub) => {
  const t0 = Date.now();
  const r = spawnSync(process.execPath, [runner, ...args], { cwd, env, encoding: 'utf8', timeout: 60_000, killSignal: 'SIGKILL', maxBuffer: 8 << 20 });
  return { ...r, wall: (Date.now() - t0) / 1000 };
};
const sleepMs = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
const results = [];
const report = (k, ok, why) => { results.push(ok); console.log(`CASE ${k} ${ok ? 'CAP_HELD' : `NOT_HELD(${why})`}`); };
console.log(`PARAMS M=${P.M} maxAllocs=${Math.ceil(P.M / 16)} B=${P.B}`);

if (!existsSync(runner)) {
  for (const k of ['K1', 'K2', 'K3', 'K4', 'K5', 'K6']) report(k, false, 'no runner');
} else {
  // K1 native memory + liveness
  {
    const prog = join(cwd, P.prog);
    const cg = `try{const p=fs.readFileSync('/proc/self/cgroup','utf8').match(/^0::(.*)$/m)[1];process.stdout.write('CGMAX='+fs.readFileSync('/sys/fs/cgroup'+p+'/memory.max','utf8').trim()+'\\n')}catch(e){process.stdout.write('CGMAX=ERR\\n')}`;
    const hog = (n) => `const fs=require('fs');${cg};const a=[];for(let i=1;i<=${n};i++){a.push(Buffer.alloc(16<<20,1));fs.writeFileSync(${JSON.stringify(P.prog)},String(i));}fs.writeFileSync(${JSON.stringify(P.prog)},'DONE');`;
    const r1 = run(['--mem', String(P.M), '--tasks', '64', '--budget', '60', '--', 'node', '-e', hog(64)]);
    const p1 = existsSync(prog) ? readFileSync(prog, 'utf8') : '0';
    rmSync(prog, { force: true });
    const r2 = run(['--mem', String(P.M), '--tasks', '64', '--budget', '60', '--', 'node', '-e', hog(2)]);
    const p2 = existsSync(prog) ? readFileSync(prog, 'utf8') : '0';
    const why = [];
    if (p1 === 'DONE' || Number(p1) > Math.ceil(P.M / 16)) why.push(`allocs=${p1}`);
    if (r1.status === 0) why.push('hog_exit=0');
    if (r1.error) why.push('hog_probe_timeout');
    if (p2 !== 'DONE' || r2.status !== 0) why.push(`liveness=${p2}/exit=${r2.status}`);
    const cgmax = ((r2.stdout || '').match(/^CGMAX=(.*)$/m) || [])[1];
    if (cgmax !== String(P.M * 1048576)) why.push(`cgroup_memory_max=${cgmax ?? 'none'}`);
    report('K1', why.length === 0, why.join(','));
  }
  // K2 descendants
  {
    const m = `${tag}-K2`; markers.push(m);
    const js = `const {spawn}=require('child_process');spawn(process.execPath,['-e',${JSON.stringify(sleepJs)},${JSON.stringify(m)}],{detached:true,stdio:'ignore'}).unref();`;
    const r = run(['--mem', '256', '--tasks', '64', '--budget', '60', '--', 'node', '-e', js]);
    sleepMs(1000);
    const n = alive(m);
    const why = [];
    if (r.status !== 0) why.push(`exit=${r.status}`);
    if (r.wall > 30) why.push(`wall=${r.wall}`);
    if (n) why.push(`leftover=${n}`);
    report('K2', why.length === 0, why.join(','));
  }
  // K3 total budget
  {
    const m = `${tag}-K3`; markers.push(m);
    const r = run(['--mem', '256', '--tasks', '64', '--budget', String(P.B), '--', 'node', '-e', sleepJs, m]);
    sleepMs(1000);
    const n = alive(m);
    const why = [];
    if (r.wall > P.B + 7) why.push(`wall=${r.wall}`);
    if (r.status === 0) why.push('exit=0');
    if (!/^CAP_RUN: BUDGET/m.test(r.stderr || '')) why.push('no_budget_line');
    if (n) why.push(`leftover=${n}`);
    report('K3', why.length === 0, why.join(','));
  }
  // K4 explicit environment
  {
    const env = { ...scrub, GIT_DIR: `${P.fake}/.git`, GIT_WORK_TREE: P.fake, GIT_INDEX_FILE: `${P.fake}/index`, [P.secret]: hex() };
    const r = run(['--mem', '256', '--tasks', '64', '--budget', '60', '--env', `${P.passK}=${P.passV}`, '--', 'node', '-e', 'process.stdout.write("ENVJSON="+JSON.stringify(process.env)+"\\n")'], env);
    const why = [];
    let e = null;
    const line = (r.stdout || '').split('\n').find((l) => l.startsWith('ENVJSON='));
    try { e = JSON.parse(line.slice(8)); } catch { why.push('no_child_env'); }
    if (r.status !== 0) why.push(`exit=${r.status}`);
    if (e) {
      if (e[P.passK] !== P.passV) why.push('passed_missing');
      for (const k of ['GIT_DIR', 'GIT_WORK_TREE', 'GIT_INDEX_FILE', P.secret]) if (k in e) why.push(`leaked_${k === P.secret ? 'secret' : k}`);
    }
    report('K4', why.length === 0, why.join(','));
  }
  // K5 signal cleanup
  {
    const m = `${tag}-K5`; markers.push(m);
    const child = spawn(process.execPath, [runner, '--mem', '256', '--tasks', '64', '--budget', '120', '--', 'node', '-e', sleepJs, m], { cwd, env: scrub, stdio: 'ignore' });
    const exited = new Promise((res) => child.on('exit', () => res(Date.now())));
    await new Promise((res) => setTimeout(res, 1500));
    const tSig = Date.now();
    child.kill('SIGTERM');
    const tEnd = await Promise.race([exited, new Promise((res) => setTimeout(() => res(null), 10_000))]);
    if (tEnd === null) child.kill('SIGKILL');
    await new Promise((res) => setTimeout(res, 1000));
    const n = alive(m);
    const why = [];
    if (tEnd === null) why.push('runner_alive_10s');
    else if ((tEnd - tSig) / 1000 > 10) why.push(`exit_after=${(tEnd - tSig) / 1000}`);
    if (n) why.push(`leftover=${n}`);
    report('K5', why.length === 0, why.join(','));
  }
  // K6 isolation: own PID namespace, launcher environment absent from /proc/1/environ
  {
    const mk = `${tag}-${hex()}`;
    const env = { ...scrub, [P.mark]: mk, GIT_DIR: `${P.fake}/.git` };
    const js = 'const fs=require("fs");let s;try{s="P1ENV="+fs.readFileSync("/proc/1/environ").toString("base64")}catch(e){s="P1ERR="+e.code}let n;try{n=fs.readlinkSync("/proc/self/ns/pid")}catch(e){n="ERR"}process.stdout.write(s+"\\nNSPID="+n+"\\n")';
    const r = run(['--mem', '256', '--tasks', '64', '--budget', '60', '--', 'node', '-e', js], env);
    const why = [];
    const line = (r.stdout || '').split('\n').find((l) => l.startsWith('P1ENV=') || l.startsWith('P1ERR='));
    if (r.status !== 0) why.push(`exit=${r.status}`);
    if (!line) why.push('no_child_output');
    else if (line.startsWith('P1ERR=')) why.push(`p1_unreadable=${line.slice(6)}`);
    else {
      const p1 = Buffer.from(line.slice(6), 'base64').toString('latin1');
      if (p1.includes(mk)) why.push('marker_in_p1');
      if (p1.includes('GIT_DIR=')) why.push('git_dir_in_p1');
    }
    const ns = ((r.stdout || '').match(/^NSPID=(.*)$/m) || [])[1];
    let own = null;
    try { own = readlinkSync('/proc/self/ns/pid'); } catch { /* none */ }
    if (!ns || ns === 'ERR' || ns === own) why.push(`pid_ns_not_own=${ns ?? 'none'}`);
    report('K6', why.length === 0, why.join(','));
  }
}
const held = results.filter(Boolean).length;
console.log(`CAPRUN_PROBE rev=${rev} held=${held}/6`);
finish(held === 6 ? 0 : 1);

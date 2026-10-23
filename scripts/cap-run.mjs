#!/usr/bin/env node
/**
 * cap-run.mjs — bounded child-process runner (contract `kumitate-cap-run-v1`, round 46).
 *
 * WHY. No lane runner implemented QUALITY Q31 at round-46 base (24 child sites, no
 * `MemoryMax`; round-45 AuditLaneSandboxes). This runner gives one child a native-memory
 * cgroup cap, an explicit environment, a total budget, descendant and signal cleanup and its
 * own PID namespace, and prints exactly one verdict line.
 *
 * CLI:
 *   node scripts/cap-run.mjs --mem <MiB> --tasks <n> --budget <s> [--env K=V]... -- <cmd> [args...]
 *   node scripts/cap-run.mjs --selftest
 * The child's stdin, stdout and stderr are the runner's; the runner's working directory is
 * bound read-write and is the child's working directory; the rest of `/` is read-only, `/tmp`
 * and `/run` are fresh tmpfs mounts (charged to the scope's memory).
 *
 * LAUNCH. `<cmd>` is resolved to a real path first (through the caller's PATH, or relative to
 * the working directory when it contains `/`), because a PATH shim under `/run/user/...` (fnm)
 * vanishes under `--tmpfs /run`; bwrap keeps `<cmd>` as argv[0] (`--argv0`). Then:
 *   systemd-run --user --scope --quiet --unit=<unit> -p MemoryMax=<mem>M -p MemorySwapMax=0
 *     -p TasksMax=<n> -- env -i PATH=/usr/bin bwrap --ro-bind / / --dev /dev --proc /proc
 *     --tmpfs /tmp --tmpfs /run --bind <cwd> <cwd> --chdir <cwd> --unshare-pid
 *     --die-with-parent --new-session --clearenv --setenv PATH <dir of cmd>:/usr/bin
 *     [--setenv K V]... --argv0 <cmd> <real cmd> [args...]
 * systemd-run is spawned with the environment {PATH=/usr/bin, XDG_RUNTIME_DIR} and nothing
 * else (a scope inherits the caller's environment, S072), `env -i` is bwrap's immediate parent
 * so the sandbox's PID 1 carries only PATH, and `--clearenv` leaves the command PATH, PWD and
 * the `--env` pairs (S069). `<unit>` is `cap-run-<pid>-<ms>-<hex>`, unique per run.
 *
 * CLEANUP. The scope is killed (`systemctl --user kill -s KILL <unit>.scope`) when the budget
 * expires, on SIGTERM/SIGINT, and always after the child exits, so descendants in other
 * sessions die with it; `--unshare-pid` also ends the namespace with its PID 1 and
 * `--die-with-parent` kills the sandbox if the runner dies (S069). The unit is then
 * `reset-failed` so a failed scope does not stay loaded. If the child has not exited 3 s after
 * a kill, its PID is sent SIGKILL and the verdict is printed 1 s later regardless.
 *
 * OOM. Detected from the kernel's and systemd's records, never from the exit code: the verdict
 * is OOM when, after the child exits, the unit's Result is `oom-kill` or the scope's
 * `memory.events` `oom_kill` count is above zero (cgroup path from the unit's ControlGroup
 * property, else from /proc/<child>/cgroup seen while running); after an exit above 128 or by a
 * signal the check is retried every 50 ms for up to 0.5 s while systemd settles. A host
 * measurement (round 46, this seat) showed a 512 MiB Buffer child under MemoryMax=256M leaves
 * the scope loaded as `failed` with Result=oom-kill and `oom_kill 1` while the child's exit
 * code varied (137, or 143 when systemd's OOM policy stopped the scope first and its cgroup was
 * already gone); a child that only exits 137 is EXIT. The cap is
 * on the cgroup, not the V8 heap, because Buffer memory is accounted apart from the heap
 * (S077), so a V8 flag would not bound it.
 *
 * Verdict (exactly one final stderr line):
 *   CAP_RUN: EXIT code=<n> unit=<unit>     child exited (or was signalled) on its own
 *   CAP_RUN: OOM code=<n> unit=<unit>      unit Result=oom-kill or scope memory.events oom_kill > 0
 *   CAP_RUN: BUDGET code=124 unit=<unit>   total budget (--budget seconds, wall) expired
 *   CAP_RUN: SIGNAL code=<128+s> unit=<unit>  the runner got SIGTERM or SIGINT
 *   CAP_RUN: USAGE <reason>                bad arguments, command not found; nothing ran
 * Exit map: child's exit code (128+signal if the child died by a signal; 127 if systemd-run
 *   could not be spawned) for EXIT and OOM · 124 BUDGET · 128+signal SIGNAL (143 SIGTERM,
 *   130 SIGINT) · 64 USAGE · `--selftest`: 0 all cases pass, 1 otherwise.
 *
 * SELFTEST (behavioural, QUALITY Q31 Field). Runs this file as a child under a hostile
 * environment (planted marker key, GIT_DIR, GIT_WORK_TREE, GIT_INDEX_FILE) and prints
 * `PASS  <case>` / `FAIL  <case> (<detail>)` per case, then `VERDICT: PASS|FAIL`. Cases: usage
 * arms exit 64; exit code and stdout pass through; cwd writable; explicit env (the `--env`
 * pair arrives, the four planted keys do not); /proc/1/environ readable without the marker or
 * GIT_DIR; a 512 MiB Buffer child under `--mem 256` dies non-zero with OOM and never finishes;
 * a 32 MiB child under `--mem 256` finishes (liveness); budget verdict, exit 124, no leftover;
 * SIGTERM exits 143 with SIGNAL and no leftover; a detached new-session grandchild is gone.
 * Leftovers are found by a random marker in /proc/<pid>/cmdline. Work files live under a
 * mkdtemp directory in the OS temporary directory, removed on exit and on SIGTERM/SIGINT.
 *
 * Sources: S072 (systemd.resource-control(5) MemoryMax=, TasksMax=; systemd-run(1) scopes),
 * S069 (bwrap --clearenv, --unshare-pid PID 1, --die-with-parent, --new-session),
 * S077 (Node.js Buffers are counted in arrayBuffers/external, apart from V8's heapTotal/heapUsed),
 * S079 (cgroup v2 memory.max: usage at the limit that can't be reduced invokes the OOM killer in the cgroup).
 */
import { spawn, spawnSync, execFileSync } from 'node:child_process';
import {
  accessSync, constants as fsc, existsSync, mkdtempSync, readFileSync, readdirSync, realpathSync,
  rmSync, statSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { constants as osc, tmpdir } from 'node:os';
import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const CONTRACT = 'kumitate-cap-run-v1';
const TOOL_FILE = fileURLToPath(import.meta.url);
const KILL_GRACE_MS = 3000;
const OOM_SETTLE_TRIES = 10;
const LAUNCH_ENV = {
  PATH: '/usr/bin',
  XDG_RUNTIME_DIR: process.env.XDG_RUNTIME_DIR || `/run/user/${process.getuid()}`,
};

const usage = (why) => {
  process.stderr.write(`CAP_RUN: USAGE ${why} (contract ${CONTRACT}: --mem <MiB> --tasks <n> --budget <s> [--env K=V]... -- <cmd> [args...] | --selftest)\n`);
  process.exit(64);
};

function parseArgs(argv) {
  const o = { env: [] };
  let i = 0;
  for (; i < argv.length && argv[i] !== '--'; i++) {
    const k = argv[i];
    if (!['--mem', '--tasks', '--budget', '--env'].includes(k)) usage(`unknown argument ${JSON.stringify(k)}`);
    if (i + 1 >= argv.length) usage(`${k} needs a value`);
    const v = argv[++i];
    if (k === '--env') {
      const j = v.indexOf('=');
      if (j < 1 || !/^[A-Za-z_][A-Za-z0-9_]*$/.test(v.slice(0, j))) usage(`--env wants K=V, got ${JSON.stringify(v)}`);
      o.env.push([v.slice(0, j), v.slice(j + 1)]);
    } else {
      if (o[k.slice(2)] !== undefined) usage(`${k} given twice`);
      o[k.slice(2)] = v;
    }
  }
  for (const k of ['mem', 'tasks', 'budget']) if (o[k] === undefined) usage(`--${k} is required`);
  if (!/^[1-9][0-9]*$/.test(o.mem)) usage('--mem wants a positive integer MiB');
  if (!/^[1-9][0-9]*$/.test(o.tasks)) usage('--tasks wants a positive integer');
  if (!/^[0-9]+(\.[0-9]+)?$/.test(o.budget) || !(Number(o.budget) > 0)) usage('--budget wants positive seconds');
  if (argv[i] !== '--' || i + 1 >= argv.length) usage('missing -- <cmd>');
  o.cmd = argv.slice(i + 1);
  return o;
}

function resolveCmd(cmd) {
  const ok = (p) => {
    try { accessSync(p, fsc.X_OK); const r = realpathSync(p); return statSync(r).isFile() ? r : null; } catch { return null; }
  };
  if (cmd.includes('/')) return ok(resolve(process.cwd(), cmd));
  for (const d of (process.env.PATH || '').split(':')) {
    if (!d) continue;
    const r = ok(join(d, cmd));
    if (r) return r;
  }
  return null;
}

function oomKilled(unit, seenCg) {
  let show = '';
  try {
    show = execFileSync('systemctl', ['--user', 'show', '-p', 'Result', '-p', 'ControlGroup', `${unit}.scope`],
      { env: LAUNCH_ENV, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  } catch { /* unit gone */ }
  if (/^Result=oom-kill$/m.test(show)) return true;
  for (const rel of [(show.match(/^ControlGroup=(.+)$/m) || [])[1], seenCg]) {
    if (!rel) continue;
    try {
      const m = readFileSync(`/sys/fs/cgroup${rel}/memory.events`, 'utf8').match(/^oom_kill (\d+)$/m);
      if (m && Number(m[1]) > 0) return true;
    } catch { /* cgroup removed */ }
  }
  return false;
}

function run(o) {
  const real = resolveCmd(o.cmd[0]);
  if (!real) usage(`command not found: ${JSON.stringify(o.cmd[0])}`);
  const cwd = process.cwd();
  const binDir = dirname(real);
  const unit = `cap-run-${process.pid}-${Date.now()}-${randomBytes(3).toString('hex')}`;
  const setenv = ['--clearenv', '--setenv', 'PATH', binDir === '/usr/bin' ? '/usr/bin' : `${binDir}:/usr/bin`];
  for (const [k, v] of o.env) setenv.push('--setenv', k, v);
  const argv = ['--user', '--scope', '--quiet', `--unit=${unit}`,
    '-p', `MemoryMax=${o.mem}M`, '-p', 'MemorySwapMax=0', '-p', `TasksMax=${o.tasks}`, '--',
    'env', '-i', 'PATH=/usr/bin', 'bwrap', '--ro-bind', '/', '/', '--dev', '/dev', '--proc', '/proc',
    '--tmpfs', '/tmp', '--tmpfs', '/run', '--bind', cwd, cwd, '--chdir', cwd,
    '--unshare-pid', '--die-with-parent', '--new-session', ...setenv,
    '--argv0', o.cmd[0], real, ...o.cmd.slice(1)];

  const killScope = () => {
    try { execFileSync('systemctl', ['--user', 'kill', '-s', 'KILL', `${unit}.scope`], { env: LAUNCH_ENV, stdio: 'ignore' }); } catch { /* not running */ }
  };
  let why = null; // 'BUDGET' | signal name
  let done = false;
  let seenCg = '';
  const child = spawn('systemd-run', argv, { stdio: 'inherit', env: LAUNCH_ENV });
  const finish = (verdict, code) => {
    if (done) return;
    done = true;
    clearTimeout(budget);
    clearInterval(cgWatch);
    process.stderr.write(`CAP_RUN: ${verdict} code=${code} unit=${unit}\n`);
    process.exit(code);
  };
  const forceAfterKill = () => {
    setTimeout(() => {
      try { process.kill(child.pid, 'SIGKILL'); } catch { /* gone */ }
      setTimeout(() => { killScope(); finish(why === 'BUDGET' ? 'BUDGET' : 'SIGNAL', why === 'BUDGET' ? 124 : 128 + osc.signals[why]); }, 1000).unref();
    }, KILL_GRACE_MS).unref();
  };
  const cgWatch = setInterval(() => {
    if (seenCg || child.pid === undefined) return;
    try {
      const rel = readFileSync(`/proc/${child.pid}/cgroup`, 'utf8').trim().replace(/^0::/, '');
      if (rel.endsWith(`/${unit}.scope`)) { seenCg = rel; clearInterval(cgWatch); }
    } catch { /* exited */ }
  }, 20);
  const budget = setTimeout(() => {
    if (why || done) return;
    why = 'BUDGET';
    killScope();
    forceAfterKill();
  }, Number(o.budget) * 1000);
  const onSignal = (sig) => {
    if (why || done) return;
    why = sig;
    killScope();
    forceAfterKill();
  };
  process.on('SIGTERM', () => onSignal('SIGTERM'));
  process.on('SIGINT', () => onSignal('SIGINT'));
  child.on('error', (e) => {
    process.stderr.write(`cap-run: cannot spawn systemd-run: ${e.code || e.message}\n`);
    finish('EXIT', 127);
  });
  child.on('exit', (code, sig) => {
    let oom = oomKilled(unit, seenCg);
    for (let i = 0; !oom && !why && (sig || code > 128) && i < OOM_SETTLE_TRIES; i++) {
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 50);
      oom = oomKilled(unit, seenCg);
    }
    killScope();
    try { execFileSync('systemctl', ['--user', 'reset-failed', `${unit}.scope`], { env: LAUNCH_ENV, stdio: 'ignore' }); } catch { /* not loaded */ }
    if (why === 'BUDGET') return finish('BUDGET', 124);
    if (why) return finish('SIGNAL', 128 + osc.signals[why]);
    const n = code ?? 128 + (osc.signals[sig] ?? 0);
    finish(oom ? 'OOM' : 'EXIT', n);
  });
}

async function selftest() {
  const W = mkdtempSync(join(tmpdir(), 'cap-run-selftest.'));
  const hex = () => randomBytes(5).toString('hex').toUpperCase();
  const tag = `capst${hex()}`;
  const markers = [];
  const procsWith = (m, kill = false) => {
    let n = 0;
    for (const p of readdirSync('/proc')) {
      if (!/^\d+$/.test(p) || Number(p) === process.pid) continue;
      try {
        if (readFileSync(`/proc/${p}/cmdline`, 'latin1').includes(m)) { n++; if (kill) process.kill(Number(p), 'SIGKILL'); }
      } catch { /* gone */ }
    }
    return n;
  };
  const cleanup = () => {
    let left = 0;
    for (const m of markers) left += procsWith(m, true);
    rmSync(W, { recursive: true, force: true });
    return left;
  };
  process.on('SIGTERM', () => { cleanup(); process.exit(1); });
  process.on('SIGINT', () => { cleanup(); process.exit(1); });

  const markKey = `CAPST_MARK_${hex()}`;
  const markVal = `v${hex()}`;
  const fake = `/nonexistent-${hex()}`;
  const hostile = { ...process.env, [markKey]: markVal, GIT_DIR: `${fake}/.git`, GIT_WORK_TREE: fake, GIT_INDEX_FILE: `${fake}/index` };
  const sleepJs = 'setTimeout(()=>{},300000)';
  const sleepMs = (ms) => new Promise((r) => setTimeout(r, ms));
  const lim = (mem = '256', budget = '60') => ['--mem', mem, '--tasks', '64', '--budget', budget];
  const cap = (args) => {
    const t0 = Date.now();
    const r = spawnSync(process.execPath, [TOOL_FILE, ...args], { cwd: W, env: hostile, encoding: 'utf8', timeout: 60_000, killSignal: 'SIGKILL', maxBuffer: 8 << 20 });
    const verdicts = (r.stderr || '').split('\n').filter((l) => /^CAP_RUN: /.test(l));
    return { ...r, wall: (Date.now() - t0) / 1000, verdicts, last: verdicts.at(-1) || '' };
  };
  const results = [];
  const check = (name, why) => {
    results.push(why.length === 0);
    process.stdout.write(why.length === 0 ? `PASS  ${name}\n` : `FAIL  ${name} (${why.join(', ')})\n`);
  };
  const oneVerdict = (r, re, why) => {
    if (r.verdicts.length !== 1) why.push(`verdict_lines=${r.verdicts.length}`);
    if (!re.test(r.last)) why.push(`verdict=${JSON.stringify(r.last)}`);
  };

  {
    const why = [];
    for (const args of [[], ['--mem', '0', '--tasks', '8', '--budget', '5', '--', 'true'], [...lim(), '--env', 'NOEQ', '--', 'true'],
      [...lim()], ['--mem', '64', '--tasks', '8', '--', 'true'], [...lim(), '--', `no-such-cmd-${hex()}`], ['--bogus']]) {
      const r = cap(args);
      if (r.status !== 64 || !/^CAP_RUN: USAGE /.test(r.last)) why.push(`${JSON.stringify(args.slice(0, 2))}:exit=${r.status}`);
    }
    check('usage arms exit 64 with CAP_RUN: USAGE', why);
  }
  {
    const out = `OUT_${hex()}`;
    const r = cap([...lim(), '--', 'node', '-e', `process.stdout.write(${JSON.stringify(out)}+"\\n");process.exit(7)`]);
    const why = [];
    if (r.status !== 7) why.push(`exit=${r.status}`);
    if (!(r.stdout || '').includes(out)) why.push('stdout_missing');
    oneVerdict(r, /^CAP_RUN: EXIT code=7 unit=cap-run-\d+-\d+-[0-9a-f]+$/, why);
    check('exit code and stdout pass through (EXIT code=7)', why);
  }
  {
    const f = `w${hex()}.txt`;
    const r = cap([...lim(), '--', 'node', '-e', `require("fs").writeFileSync(${JSON.stringify(f)},"ok")`]);
    const why = [];
    if (r.status !== 0) why.push(`exit=${r.status}`);
    if (!existsSync(join(W, f)) || readFileSync(join(W, f), 'utf8') !== 'ok') why.push('file_missing');
    check('runner cwd is writable to the child', why);
  }
  {
    const pk = `CAPST_PASS_${hex()}`;
    const pv = hex();
    const r = cap([...lim(), '--env', `${pk}=${pv}`, '--', 'node', '-e', 'process.stdout.write("ENVJSON="+JSON.stringify(process.env)+"\\n")']);
    const why = [];
    let e = null;
    const line = (r.stdout || '').split('\n').find((l) => l.startsWith('ENVJSON='));
    try { e = JSON.parse(line.slice(8)); } catch { why.push('no_child_env'); }
    if (r.status !== 0) why.push(`exit=${r.status}`);
    if (e) {
      if (e[pk] !== pv) why.push('passed_pair_missing');
      for (const k of ['GIT_DIR', 'GIT_WORK_TREE', 'GIT_INDEX_FILE', markKey]) if (k in e) why.push(`leaked_${k === markKey ? 'marker' : k}`);
      const extra = Object.keys(e).filter((k) => !['PATH', 'PWD', pk].includes(k));
      if (extra.length) why.push(`extra_keys=${extra.join('/')}`);
    }
    check('explicit env: --env pair arrives, GIT_DIR/GIT_WORK_TREE/GIT_INDEX_FILE and marker dropped', why);
  }
  {
    const js = 'let s;try{s="P1ENV="+require("fs").readFileSync("/proc/1/environ").toString("base64")}catch(e){s="P1ERR="+e.code}process.stdout.write(s+"\\n")';
    const r = cap([...lim(), '--', 'node', '-e', js]);
    const why = [];
    const line = (r.stdout || '').split('\n').find((l) => l.startsWith('P1ENV=') || l.startsWith('P1ERR='));
    if (r.status !== 0) why.push(`exit=${r.status}`);
    if (!line) why.push('no_child_output');
    else if (line.startsWith('P1ERR=')) why.push(`p1_unreadable=${line.slice(6)}`);
    else {
      const p1 = Buffer.from(line.slice(6), 'base64').toString('latin1');
      if (p1.includes(markVal) || p1.includes(markKey)) why.push('marker_in_p1');
      if (p1.includes('GIT_DIR=')) why.push('git_dir_in_p1');
    }
    check('own PID namespace: /proc/1/environ readable, planted marker and GIT_DIR absent', why);
  }
  const hog = (n, f) => `const fs=require('fs');const a=[];for(let i=1;i<=${n};i++){a.push(Buffer.alloc(16<<20,1));fs.writeFileSync(${JSON.stringify(f)},String(i));}fs.writeFileSync(${JSON.stringify(f)},'DONE');`;
  {
    const f = `h${hex()}.txt`;
    const r = cap([...lim('256'), '--', 'node', '-e', hog(32, f)]);
    const p = existsSync(join(W, f)) ? readFileSync(join(W, f), 'utf8') : '0';
    const why = [];
    if (r.status === 0 || r.status === null) why.push(`exit=${r.status}`);
    if (p === 'DONE' || Number(p) > 16) why.push(`allocs=${p}`);
    oneVerdict(r, /^CAP_RUN: OOM code=[1-9]\d* unit=cap-run-/, why);
    check(`512 MiB Buffer child under --mem 256 dies non-zero with OOM (allocs=${p}, exit=${r.status})`, why);
  }
  {
    const f = `l${hex()}.txt`;
    const r = cap([...lim('256'), '--', 'node', '-e', hog(2, f)]);
    const p = existsSync(join(W, f)) ? readFileSync(join(W, f), 'utf8') : '0';
    const why = [];
    if (r.status !== 0) why.push(`exit=${r.status}`);
    if (p !== 'DONE') why.push(`progress=${p}`);
    oneVerdict(r, /^CAP_RUN: EXIT code=0 unit=/, why);
    check('32 MiB Buffer child under --mem 256 finishes (liveness)', why);
  }
  {
    const m = `${tag}-budget`; markers.push(m);
    const r = cap([...lim('256', '2'), '--', 'node', '-e', sleepJs, m]);
    await sleepMs(1000);
    const n = procsWith(m);
    const why = [];
    if (r.status !== 124) why.push(`exit=${r.status}`);
    if (r.wall > 9) why.push(`wall=${r.wall}`);
    if (n) why.push(`leftover=${n}`);
    oneVerdict(r, /^CAP_RUN: BUDGET code=124 unit=/, why);
    check(`budget 2 s on a 300 s child: BUDGET, exit 124, no leftover (wall=${r.wall}s)`, why);
  }
  {
    const m = `${tag}-sigterm`; markers.push(m);
    const c = spawn(process.execPath, [TOOL_FILE, ...lim('256', '120'), '--', 'node', '-e', sleepJs, m], { cwd: W, env: hostile, stdio: ['ignore', 'ignore', 'pipe'] });
    let err = '';
    c.stderr.on('data', (d) => { if (err.length < 65536) err += d; });
    const exited = new Promise((r) => c.on('exit', (code, sig) => r({ code, sig, t: Date.now() })));
    await sleepMs(1500);
    const t0 = Date.now();
    c.kill('SIGTERM');
    const e = await Promise.race([exited, sleepMs(10_000).then(() => null)]);
    if (!e) c.kill('SIGKILL');
    await sleepMs(1000);
    const n = procsWith(m);
    const v = err.split('\n').filter((l) => /^CAP_RUN: /.test(l));
    const why = [];
    if (!e) why.push('runner_alive_10s');
    else if (e.code !== 143) why.push(`exit=${e.code}/${e.sig}`);
    if (n) why.push(`leftover=${n}`);
    if (v.length !== 1 || !/^CAP_RUN: SIGNAL code=143 unit=/.test(v[0] || '')) why.push(`verdict=${JSON.stringify(v)}`);
    check(`SIGTERM 1.5 s into a 300 s child: SIGNAL, exit 143, no leftover (${e ? (e.t - t0) / 1000 : '>10'}s)`, why);
  }
  {
    const m = `${tag}-grandchild`; markers.push(m);
    const js = `const {spawn}=require('child_process');spawn(process.execPath,['-e',${JSON.stringify(sleepJs)},${JSON.stringify(m)}],{detached:true,stdio:'ignore'}).unref();`;
    const r = cap([...lim(), '--', 'node', '-e', js]);
    await sleepMs(1000);
    const n = procsWith(m);
    const why = [];
    if (r.status !== 0) why.push(`exit=${r.status}`);
    if (n) why.push(`leftover=${n}`);
    check('detached new-session grandchild is gone after the runner returns', why);
  }

  const left = cleanup();
  if (left) process.stdout.write(`LEFTOVER_KILLED ${left}\n`);
  const pass = results.filter(Boolean).length;
  const ok = pass === results.length && left === 0;
  process.stdout.write(`CAP_RUN_SELFTEST: ${pass}/${results.length} pass\nVERDICT: ${ok ? 'PASS' : 'FAIL'}\n`);
  process.exit(ok ? 0 : 1);
}

const args = process.argv.slice(2);
if (args[0] === '--selftest') {
  if (args.length !== 1) usage('--selftest takes no other arguments');
  await selftest();
} else {
  run(parseArgs(args));
}

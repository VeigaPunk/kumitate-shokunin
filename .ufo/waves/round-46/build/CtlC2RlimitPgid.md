RESULT CtlC2RlimitPgid rev=516977af verdict=misses prlimit_as=1/6 prlimit_data=1/6 pgid_poll=3/6
Axis: operability. Expected detector: the unchanged frozen caprun-probe.mjs; a shortcut meets the target only at held=6/6, exit 0. All three shortcuts miss.
Mutation classification: inconclusive for a killed/survived claim because the pristine baseline already fails (no runner); these results are shortcut-control scores, not killed mutants.
Clone command: unset $(git rev-parse --local-env-vars 2>/dev/null) GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE; mkdir -p /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC2RlimitPgid && git clone -q --no-hardlinks /home/vgpnk/Projects/shokunin/kumitate-shokunin /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC2RlimitPgid/lane && git -C /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC2RlimitPgid/lane checkout -q --detach 516977af2216b1cc426ee970d260dee53714bf4f
Clone exit=0; revision=516977af2216b1cc426ee970d260dee53714bf4f; initial scripts/cap-run.mjs absent. Subsequent sandbox Git commands also scrubbed every git rev-parse --local-env-vars name.
Tools installed/updated: none. df -h /fast: 804G total, 600G used, 204G available (75%). Each invocation inherited RLIMIT_CORE=0; no candidate implementation was scored.
Frozen detector SHA256 before=after=2a42d0194aa0840b6439122b910a5f509552f918e7d7d2f7ab24ce3b96b27dc3. All probe stderr was empty. Full stdout and exit codes follow.

Pristine revision 516977af2216b1cc426ee970d260dee53714bf4f:
systemd-run --user --scope --quiet --unit=ctl-c2rlimitpgid-pristine -p MemoryMax=3G -p TasksMax=256 timeout -s KILL 900 env SCRATCH_ROOT=/fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC2RlimitPgid/runs node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-46/probe/caprun-probe.mjs /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC2RlimitPgid/lane 516977af2216b1cc426ee970d260dee53714bf4f
PARAMS M=137 maxAllocs=9 B=3
CASE K1 NOT_HELD(no runner)
CASE K2 NOT_HELD(no runner)
CASE K3 NOT_HELD(no runner)
CASE K4 NOT_HELD(no runner)
CASE K5 NOT_HELD(no runner)
CASE K6 NOT_HELD(no runner)
CAPRUN_PROBE rev=516977af2216b1cc426ee970d260dee53714bf4f held=0/6
exit=1
Cleanup: pgrep -a -f /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC2RlimitPgid -> exit=1, no output; owned scope inactive/dead, ControlGroup empty.

prlimit_as revision dcc1a55f53c677642d7c3d68b678279d6bac14ad; source SHA256=e1f372bb5fb2dd1ee22b73ddef7d14f97f1933f67a8f021768c1354d5e411fba:
systemd-run --user --scope --quiet --unit=ctl-c2rlimitpgid-prlimit-as -p MemoryMax=3G -p TasksMax=256 timeout -s KILL 900 env SCRATCH_ROOT=/fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC2RlimitPgid/runs node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-46/probe/caprun-probe.mjs /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC2RlimitPgid/lane dcc1a55f53c677642d7c3d68b678279d6bac14ad
PARAMS M=133 maxAllocs=9 B=3
CASE K1 NOT_HELD(hog_probe_timeout,liveness=0/exit=null)
CASE K2 NOT_HELD(exit=1)
CASE K3 NOT_HELD(no_budget_line)
CASE K4 NOT_HELD(no_child_env,exit=1)
CASE K5 CAP_HELD
CASE K6 NOT_HELD(exit=1,no_child_output)
CAPRUN_PROBE rev=dcc1a55f53c677642d7c3d68b678279d6bac14ad held=1/6
exit=1
Cleanup: the same pgrep command returned exit=1, no output, but this owned scope remained active/running; scratch-path pgrep alone was insufficient.
systemctl --user kill --kill-whom=all --signal=KILL ctl-c2rlimitpgid-prlimit-as.scope -> exit=0; afterwards scope inactive/dead, ControlGroup empty; pgrep again exit=1, no output.

prlimit_data revision 532db3197f715360475d98daf04fde9e3ddeda9f; source SHA256=1047f36c9a39da33fb043b9f146ec5df8250705cc92795d28136ba2f7271988e:
systemd-run --user --scope --quiet --unit=ctl-c2rlimitpgid-prlimit-data -p MemoryMax=3G -p TasksMax=256 timeout -s KILL 900 env SCRATCH_ROOT=/fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC2RlimitPgid/runs node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-46/probe/caprun-probe.mjs /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC2RlimitPgid/lane 532db3197f715360475d98daf04fde9e3ddeda9f
PARAMS M=141 maxAllocs=9 B=4
CASE K1 NOT_HELD(liveness=0/exit=1)
CASE K2 NOT_HELD(exit=1)
CASE K3 NOT_HELD(no_budget_line)
CASE K4 NOT_HELD(no_child_env,exit=1)
CASE K5 CAP_HELD
CASE K6 NOT_HELD(exit=1,no_child_output)
CAPRUN_PROBE rev=532db3197f715360475d98daf04fde9e3ddeda9f held=1/6
exit=1
Cleanup: the same pgrep command returned exit=1, no output; owned scope inactive/dead, ControlGroup empty.

pgid_poll revision 342bdaaa81f74c3b8b67a111fac98c7fb9b85b77; source SHA256=500a23fd6a9f069b5ec32534490033c8be92d77bda5cd38c65283eea491fbd92:
systemd-run --user --scope --quiet --unit=ctl-c2rlimitpgid-pgid-poll -p MemoryMax=3G -p TasksMax=256 timeout -s KILL 900 env SCRATCH_ROOT=/fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC2RlimitPgid/runs node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-46/probe/caprun-probe.mjs /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC2RlimitPgid/lane 342bdaaa81f74c3b8b67a111fac98c7fb9b85b77
PARAMS M=160 maxAllocs=10 B=4
CASE K1 NOT_HELD(allocs=27)
CASE K2 NOT_HELD(leftover=1)
CASE K3 CAP_HELD
CASE K4 CAP_HELD
CASE K5 CAP_HELD
CASE K6 NOT_HELD(p1_unreadable=EACCES)
CAPRUN_PROBE rev=342bdaaa81f74c3b8b67a111fac98c7fb9b85b77 held=3/6
LEFTOVER_KILLED 1
exit=1
Cleanup: frozen probe killed its escaped marker process; the same pgrep command returned exit=1, no output; owned scope inactive/dead, ControlGroup empty.

Restored revision fe706796c76451c540328a3cfe8e76ffc48f1291:
systemd-run --user --scope --quiet --unit=ctl-c2rlimitpgid-restored -p MemoryMax=3G -p TasksMax=256 timeout -s KILL 900 env SCRATCH_ROOT=/fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC2RlimitPgid/runs node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-46/probe/caprun-probe.mjs /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC2RlimitPgid/lane fe706796c76451c540328a3cfe8e76ffc48f1291
PARAMS M=161 maxAllocs=11 B=3
CASE K1 NOT_HELD(no runner)
CASE K2 NOT_HELD(no runner)
CASE K3 NOT_HELD(no runner)
CASE K4 NOT_HELD(no runner)
CASE K5 NOT_HELD(no runner)
CASE K6 NOT_HELD(no runner)
CAPRUN_PROBE rev=fe706796c76451c540328a3cfe8e76ffc48f1291 held=0/6
exit=1
Cleanup: the same pgrep command returned exit=1, no output; owned scope inactive/dead, ControlGroup empty.
Restoration: scripts/cap-run.mjs absent before and after; base and restored Git tree hashes both de557e5033c8cd3b7e6a1f85a02a39089aadef7a (all tracked bytes and modes restored). Sandbox commits used user.name=ctl, user.email=ctl@ctl, commit.gpgsign=false.
Interpretation: address-space/data limits did not provide Node liveness here; the 20 ms RSS control overshot the allocation bound and missed a detached new-session descendant. No control supplied a readable private /proc/1. --tasks was consumed but not enforced by these shortcuts.

## Source: prlimit_as (scripts/cap-run.mjs at dcc1a55f53c677642d7c3d68b678279d6bac14ad)
```javascript
#!/usr/bin/env node
// Shortcut control: per-process rlimit only; no cgroup or PID namespace.
import { spawn } from 'node:child_process';
import { dirname } from 'node:path';
const args = process.argv.slice(2);
const env = { PATH: `${dirname(process.execPath)}:/usr/bin:/bin` };
let mem, budget;
while (args[0] !== '--') {
  const key = args.shift(), value = args.shift();
  if (key === '--mem') mem = Number(value);
  else if (key === '--budget') budget = Number(value);
  else if (key === '--tasks') { /* This shortcut has no task controller. */ }
  else if (key === '--env') {
    const eq = value.indexOf('=');
    env[value.slice(0, eq)] = value.slice(eq + 1);
  } else throw new Error(`unknown option ${key}`);
}
args.shift();
const child = spawn('/usr/bin/prlimit', [
  '--core=0', `--as=${mem * 1048576}`, '--', '/usr/bin/env', '-i',
  ...Object.entries(env).map(([key, value]) => `${key}=${value}`), ...args,
], { stdio: 'inherit', env: { PATH: env.PATH } });
let outcome;
const stop = (code) => { outcome = code; child.kill('SIGKILL'); };
const timer = setTimeout(() => {
  console.error('CAP_RUN: BUDGET');
  stop(124);
}, budget * 1000);
process.on('SIGTERM', () => stop(143));
process.on('SIGINT', () => stop(130));
child.on('error', (error) => {
  clearTimeout(timer);
  console.error(`CAP_RUN: SPAWN ${error.message}`);
  process.exitCode = 127;
});
child.on('exit', (code) => {
  clearTimeout(timer);
  process.exitCode = outcome ?? code ?? 1;
});
```

## Source: prlimit_data (scripts/cap-run.mjs at 532db3197f715360475d98daf04fde9e3ddeda9f)
```javascript
#!/usr/bin/env node
// Shortcut control: per-process rlimit only; no cgroup or PID namespace.
import { spawn } from 'node:child_process';
import { dirname } from 'node:path';
const args = process.argv.slice(2);
const env = { PATH: `${dirname(process.execPath)}:/usr/bin:/bin` };
let mem, budget;
while (args[0] !== '--') {
  const key = args.shift(), value = args.shift();
  if (key === '--mem') mem = Number(value);
  else if (key === '--budget') budget = Number(value);
  else if (key === '--tasks') { /* This shortcut has no task controller. */ }
  else if (key === '--env') {
    const eq = value.indexOf('=');
    env[value.slice(0, eq)] = value.slice(eq + 1);
  } else throw new Error(`unknown option ${key}`);
}
args.shift();
const child = spawn('/usr/bin/prlimit', [
  '--core=0', `--data=${mem * 1048576}`, '--', '/usr/bin/env', '-i',
  ...Object.entries(env).map(([key, value]) => `${key}=${value}`), ...args,
], { stdio: 'inherit', env: { PATH: env.PATH } });
let outcome;
const stop = (code) => { outcome = code; child.kill('SIGKILL'); };
const timer = setTimeout(() => {
  console.error('CAP_RUN: BUDGET');
  stop(124);
}, budget * 1000);
process.on('SIGTERM', () => stop(143));
process.on('SIGINT', () => stop(130));
child.on('error', (error) => {
  clearTimeout(timer);
  console.error(`CAP_RUN: SPAWN ${error.message}`);
  process.exitCode = 127;
});
child.on('exit', (code) => {
  clearTimeout(timer);
  process.exitCode = outcome ?? code ?? 1;
});
```

## Source: pgid_poll (scripts/cap-run.mjs at 342bdaaa81f74c3b8b67a111fac98c7fb9b85b77)
```javascript
#!/usr/bin/env node
// Shortcut control: process-group cleanup and sampled RSS; no cgroup or PID namespace.
import { spawn } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname } from 'node:path';
const args = process.argv.slice(2);
const env = { PATH: `${dirname(process.execPath)}:/usr/bin:/bin` };
let mem, budget;
while (args[0] !== '--') {
  const key = args.shift(), value = args.shift();
  if (key === '--mem') mem = Number(value);
  else if (key === '--budget') budget = Number(value);
  else if (key === '--tasks') { /* This shortcut has no task controller. */ }
  else if (key === '--env') {
    const eq = value.indexOf('=');
    env[value.slice(0, eq)] = value.slice(eq + 1);
  } else throw new Error(`unknown option ${key}`);
}
args.shift();
const child = spawn(args[0], args.slice(1), { env, detached: true, stdio: 'inherit' });
let outcome;
const killGroup = () => {
  if (!child.pid) return;
  try { process.kill(-child.pid, 'SIGKILL'); }
  catch (error) { if (error.code !== 'ESRCH') throw error; }
};
const stop = (code) => { outcome ??= code; killGroup(); };
const timer = setTimeout(() => {
  console.error('CAP_RUN: BUDGET');
  stop(124);
}, budget * 1000);
const watchdog = setInterval(() => {
  let rss = 0;
  for (const pid of readdirSync('/proc')) {
    if (!/^\d+$/.test(pid)) continue;
    try {
      const stat = readFileSync(`/proc/${pid}/stat`, 'utf8');
      const fields = stat.slice(stat.lastIndexOf(')') + 2).split(/\s+/);
      if (Number(fields[2]) !== child.pid) continue;
      const status = readFileSync(`/proc/${pid}/status`, 'utf8');
      const match = status.match(/^VmRSS:\s+(\d+)\s+kB$/m);
      rss += match ? Number(match[1]) * 1024 : 0;
    } catch { /* A process may exit during the sample. */ }
  }
  if (rss > mem * 1048576) {
    console.error('CAP_RUN: MEMORY');
    stop(137);
  }
}, 20);
process.on('SIGTERM', () => stop(143));
process.on('SIGINT', () => stop(130));
child.on('error', (error) => {
  clearTimeout(timer);
  clearInterval(watchdog);
  console.error(`CAP_RUN: SPAWN ${error.message}`);
  process.exitCode = 127;
});
child.on('exit', (code) => {
  clearTimeout(timer);
  clearInterval(watchdog);
  killGroup();
  process.exitCode = outcome ?? code ?? 1;
});
```

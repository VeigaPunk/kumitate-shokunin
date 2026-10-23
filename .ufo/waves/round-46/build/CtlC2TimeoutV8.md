RESULT CtlC2TimeoutV8 rev=516977af verdict=misses timeout=1/6 v8flag=1/6
Axes: operability; shortcut discrimination; bounded host resource use. Frozen target: CAP_HELD=6/6.
Controls: timeout-only; then one behavior-bearing addition setting NODE_OPTIONS=--max-old-space-size=<mem>. Neither implements cgroup limits, explicit-only environment, descendant/signal cleanup, or a PID namespace.
Expected detector: reject both shortcuts, especially K1 native Buffer allocation despite the V8 flag. Observed: both rejected; only K3 held. This is not a killed-mutant claim: the pristine/restored missing-runner baseline fails, so a passing-baseline mutation inference is inconclusive.
No tool installations or updates. Safety command `df -h /fast` exited 0: `/dev/nvme1n1p2 804G 600G 204G 75% /fast`.
All git/probe subprocesses inherited an environment with every GIT_* key removed. Commands below ran from the isolated clone; SCRATCH_ROOT kept all counter-created files inside this seat.
Clone command: `unset $(git rev-parse --local-env-vars 2>/dev/null) GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE; mkdir -p /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC2TimeoutV8 && git clone -q --no-hardlinks /home/vgpnk/Projects/shokunin/kumitate-shokunin /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC2TimeoutV8/lane && git -C /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC2TimeoutV8/lane checkout -q --detach 516977af2216b1cc426ee970d260dee53714bf4f`; stdout/stderr empty, exit 0.
Detector command: `sha256sum /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-46/probe/caprun-probe.mjs /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC2TimeoutV8/lane/.ufo/waves/round-46/probe/caprun-probe.mjs`; both SHA256 values: `2a42d0194aa0840b6439122b910a5f509552f918e7d7d2f7ab24ce3b96b27dc3`, exit 0. Thus the invoked lane counter matched the frozen clone bytes.
Pristine command: `SCRATCH_ROOT=/fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC2TimeoutV8/runs systemd-run --user --scope --quiet -p MemoryMax=3G -p TasksMax=256 timeout -s KILL 900 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-46/probe/caprun-probe.mjs /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC2TimeoutV8/lane 516977af2216b1cc426ee970d260dee53714bf4f`
PARAMS M=164 maxAllocs=11 B=3
CASE K1 NOT_HELD(no runner)
CASE K2 NOT_HELD(no runner)
CASE K3 NOT_HELD(no runner)
CASE K4 NOT_HELD(no runner)
CASE K5 NOT_HELD(no runner)
CASE K6 NOT_HELD(no runner)
CAPRUN_PROBE rev=516977af2216b1cc426ee970d260dee53714bf4f held=0/6
Pristine exit 1; stderr empty.
Timeout commit commands: `git add -- scripts/cap-run.mjs` then `git -c user.name=ctl -c user.email=ctl@ctl -c commit.gpgsign=false commit -m 'control: timeout-only cap-run'`; both exited 0. Output: `[detached HEAD f22bbe9] control: timeout-only cap-run`, 1 file changed, 25 insertions, create mode 100755.
`git rev-parse HEAD` => `f22bbe9a81663a2cee8a8a65cfde329d1402ce22`; `sha256sum scripts/cap-run.mjs` => `7690beeb7667bd7c6d51840c6960a988b19646be96454e03c1a279687ef8f666`; both exit 0.
Timeout command: `SCRATCH_ROOT=/fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC2TimeoutV8/runs systemd-run --user --scope --quiet -p MemoryMax=3G -p TasksMax=256 timeout -s KILL 900 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-46/probe/caprun-probe.mjs /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC2TimeoutV8/lane f22bbe9a81663a2cee8a8a65cfde329d1402ce22`
PARAMS M=114 maxAllocs=8 B=4
CASE K1 NOT_HELD(allocs=DONE,hog_exit=0)
CASE K2 NOT_HELD(leftover=1)
CASE K3 CAP_HELD
CASE K4 NOT_HELD(leaked_secret)
CASE K5 NOT_HELD(leftover=2)
CASE K6 NOT_HELD(p1_unreadable=EACCES)
CAPRUN_PROBE rev=f22bbe9a81663a2cee8a8a65cfde329d1402ce22 held=1/6
LEFTOVER_KILLED 3
Timeout exit 1; stderr empty.
V8 commit commands: `git add -- scripts/cap-run.mjs` then `git -c user.name=ctl -c user.email=ctl@ctl -c commit.gpgsign=false commit -m 'control: V8 old-space cap with timeout'`; both exited 0. Output: `[detached HEAD 826b0cb] control: V8 old-space cap with timeout`, 1 file changed, 1 insertion.
`git rev-parse HEAD` => `826b0cb2da8a7152979bfbc6a4c903d0b8fca384`; `sha256sum scripts/cap-run.mjs` => `bc59a68b915e6a65212cbea00c75ab7601666d61654ca922cfc3e7a7c9c37972`; both exit 0.
V8 command: `SCRATCH_ROOT=/fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC2TimeoutV8/runs systemd-run --user --scope --quiet -p MemoryMax=3G -p TasksMax=256 timeout -s KILL 900 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-46/probe/caprun-probe.mjs /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC2TimeoutV8/lane 826b0cb2da8a7152979bfbc6a4c903d0b8fca384`
PARAMS M=120 maxAllocs=8 B=3
CASE K1 NOT_HELD(allocs=DONE,hog_exit=0)
CASE K2 NOT_HELD(leftover=1)
CASE K3 CAP_HELD
CASE K4 NOT_HELD(leaked_secret)
CASE K5 NOT_HELD(leftover=2)
CASE K6 NOT_HELD(p1_unreadable=EACCES)
CAPRUN_PROBE rev=826b0cb2da8a7152979bfbc6a4c903d0b8fca384 held=1/6
LEFTOVER_KILLED 3
V8 exit 1; stderr empty.
Restoration commands: `git branch ctl-timeout-only f22bbe9a81663a2cee8a8a65cfde329d1402ce22`; `git branch ctl-v8flag 826b0cb2da8a7152979bfbc6a4c903d0b8fca384`; `git checkout -q --detach 516977af2216b1cc426ee970d260dee53714bf4f`; all exited 0, stdout/stderr empty. Control commits remain available through sandbox branches.
Before and after `git rev-parse HEAD HEAD^{tree}` => `516977af2216b1cc426ee970d260dee53714bf4f` and tree `de557e5033c8cd3b7e6a1f85a02a39089aadef7a`, exit 0 each. Before/after `git ls-tree HEAD scripts/cap-run.mjs` => empty, exit 0. Restored filesystem existence check => false. The original runner had no bytes to hash: absent before and after; both intervening source SHA256 values are above.
Restored command: `SCRATCH_ROOT=/fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC2TimeoutV8/runs systemd-run --user --scope --quiet -p MemoryMax=3G -p TasksMax=256 timeout -s KILL 900 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-46/probe/caprun-probe.mjs /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC2TimeoutV8/lane 516977af2216b1cc426ee970d260dee53714bf4f`
PARAMS M=116 maxAllocs=8 B=3
CASE K1 NOT_HELD(no runner)
CASE K2 NOT_HELD(no runner)
CASE K3 NOT_HELD(no runner)
CASE K4 NOT_HELD(no runner)
CASE K5 NOT_HELD(no runner)
CASE K6 NOT_HELD(no runner)
CAPRUN_PROBE rev=516977af2216b1cc426ee970d260dee53714bf4f held=0/6
Restored exit 1; stderr empty.
After EACH of the four probe runs: `pgrep -af -- /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC2TimeoutV8` => no matching processes, exit 1. After timeout, V8, and restored runs, an additional /proc cwd scan under this seat's runs directory found/killed 0 processes. The frozen probe itself killed all 3 marked leftovers per shortcut run, as printed above. No processes left running.
No candidate implementation was scored; no lane files were written except this report. No claim integration or contract change.

Timeout-only source (scripts/cap-run.mjs at f22bbe9a81663a2cee8a8a65cfde329d1402ce22):
```js
#!/usr/bin/env node
// Shortcut control: GNU timeout, inherited non-Git environment, no isolation.
import { spawn } from 'node:child_process';

const args = process.argv.slice(2);
const separator = args.indexOf('--');
const env = { ...process.env };
for (const key of Object.keys(env)) if (key.startsWith('GIT_')) delete env[key];
let mem;
let budget;
for (let i = 0; i < separator; i += 2) {
  const value = args[i + 1];
  if (args[i] === '--mem') mem = value;
  else if (args[i] === '--budget') budget = value;
  else if (args[i] === '--env') {
    const equal = value.indexOf('=');
    env[value.slice(0, equal)] = value.slice(equal + 1);
  }
}
const child = spawn('timeout', ['-s', 'KILL', budget, ...args.slice(separator + 1)], { env, stdio: 'inherit' });
child.on('error', (error) => { console.error(error.message); process.exitCode = 127; });
child.on('exit', (code, signal) => {
  if (code === 124 || code === 137 || signal === 'SIGKILL') console.error('CAP_RUN: BUDGET');
  process.exitCode = code ?? (signal === 'SIGKILL' ? 137 : 1);
});
```

V8-flag source (scripts/cap-run.mjs at 826b0cb2da8a7152979bfbc6a4c903d0b8fca384):
```js
#!/usr/bin/env node
// Shortcut control: GNU timeout, inherited non-Git environment, no isolation.
import { spawn } from 'node:child_process';

const args = process.argv.slice(2);
const separator = args.indexOf('--');
const env = { ...process.env };
for (const key of Object.keys(env)) if (key.startsWith('GIT_')) delete env[key];
let mem;
let budget;
for (let i = 0; i < separator; i += 2) {
  const value = args[i + 1];
  if (args[i] === '--mem') mem = value;
  else if (args[i] === '--budget') budget = value;
  else if (args[i] === '--env') {
    const equal = value.indexOf('=');
    env[value.slice(0, equal)] = value.slice(equal + 1);
  }
}
env.NODE_OPTIONS = `${env.NODE_OPTIONS || ''} --max-old-space-size=${mem}`.trim();
const child = spawn('timeout', ['-s', 'KILL', budget, ...args.slice(separator + 1)], { env, stdio: 'inherit' });
child.on('error', (error) => { console.error(error.message); process.exitCode = 127; });
child.on('exit', (code, signal) => {
  if (code === 124 || code === 137 || signal === 'SIGKILL') console.error('CAP_RUN: BUDGET');
  process.exitCode = code ?? (signal === 'SIGKILL' ? 137 : 1);
});
```

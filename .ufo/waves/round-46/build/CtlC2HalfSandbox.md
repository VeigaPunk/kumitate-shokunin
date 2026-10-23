RESULT CtlC2HalfSandbox rev=516977af verdict=misses cgroup_only=5/6 ns_only=5/6
Axes: operability; frozen detector discrimination; bounded host resource use.
Controls: cgroup-only deliberately omits a PID namespace; namespace-only deliberately omits a cgroup. Expected distinguishing failures: K6 and K1 respectively. Both occurred; neither partial control meets the 6/6 target.
Mutation-kill classification: inconclusive, not killed, because the pristine baseline already fails (no runner). These are pre-data partial-work control results, not measurements of a candidate implementation.
Clone command (exit 0, detached revision 516977af2216b1cc426ee970d260dee53714bf4f): `unset $(git rev-parse --local-env-vars 2>/dev/null) GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE; mkdir -p /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC2HalfSandbox && git clone -q --no-hardlinks /home/vgpnk/Projects/shokunin/kumitate-shokunin /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC2HalfSandbox/lane && git -C /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC2HalfSandbox/lane checkout -q --detach 516977af2216b1cc426ee970d260dee53714bf4f`.
All probe commands below ran with SCRATCH_ROOT=/fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC2HalfSandbox/runs and repository-locating variables unset. Probe source was not edited.
Frozen probe SHA256 before/after: 2a42d0194aa0840b6439122b910a5f509552f918e7d7d2f7ab24ce3b96b27dc3 (identical).
`df -h /fast` before work: /dev/nvme1n1p2 804G total, 601G used, 204G available, 75% used. Sources were 2113 and 1906 bytes; captured probe output was bounded by the frozen detector.
Pristine revision 516977af2216b1cc426ee970d260dee53714bf4f; command:
`systemd-run --user --scope --quiet -p MemoryMax=3G -p TasksMax=256 timeout -s KILL 900 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-46/probe/caprun-probe.mjs /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC2HalfSandbox/lane 516977af2216b1cc426ee970d260dee53714bf4f`
PARAMS M=127 maxAllocs=8 B=3
CASE K1 NOT_HELD(no runner)
CASE K2 NOT_HELD(no runner)
CASE K3 NOT_HELD(no runner)
CASE K4 NOT_HELD(no runner)
CASE K5 NOT_HELD(no runner)
CASE K6 NOT_HELD(no runner)
CAPRUN_PROBE rev=516977af2216b1cc426ee970d260dee53714bf4f held=0/6
Exit 1; stderr empty; wall 0.428 s.
For each control, sandbox commit commands: `git add -- scripts/cap-run.mjs` then `git -c user.name=ctl -c user.email=ctl@ctl -c core.hooksPath=/dev/null -c commit.gpgsign=false commit -q -m '<message>' -- scripts/cap-run.mjs`; all exited 0 with empty output.
Cgroup-only message: `control: cgroup without PID namespace`; commit 734d578aefc07dcec3835f5479007a8b6d896140; source SHA256 60ab86630a8566cf746a0a7453261599df1fd22e0fbd227411e9868c371cea73.
Cgroup-only command:
`systemd-run --user --scope --quiet -p MemoryMax=3G -p TasksMax=256 timeout -s KILL 900 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-46/probe/caprun-probe.mjs /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC2HalfSandbox/lane 734d578aefc07dcec3835f5479007a8b6d896140`
PARAMS M=116 maxAllocs=8 B=3
CASE K1 CAP_HELD
CASE K2 CAP_HELD
CASE K3 CAP_HELD
CASE K4 CAP_HELD
CASE K5 CAP_HELD
CASE K6 NOT_HELD(p1_unreadable=EACCES)
CAPRUN_PROBE rev=734d578aefc07dcec3835f5479007a8b6d896140 held=5/6
Exit 1; stderr empty; wall 8.183 s.
Namespace-only message: `control: PID namespace without cgroup`; commit abf1ba7ab6edc5f7d8faca330b0c7644ff569282; source SHA256 66111482f61e6ca7e94880f46c51af1d89d1ccbc595f4b0a5c525219fc329d84.
Namespace-only command:
`systemd-run --user --scope --quiet -p MemoryMax=3G -p TasksMax=256 timeout -s KILL 900 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-46/probe/caprun-probe.mjs /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC2HalfSandbox/lane abf1ba7ab6edc5f7d8faca330b0c7644ff569282`
PARAMS M=158 maxAllocs=10 B=3
CASE K1 NOT_HELD(allocs=DONE,hog_exit=0)
CASE K2 CAP_HELD
CASE K3 CAP_HELD
CASE K4 CAP_HELD
CASE K5 CAP_HELD
CASE K6 CAP_HELD
CAPRUN_PROBE rev=abf1ba7ab6edc5f7d8faca330b0c7644ff569282 held=5/6
Exit 1; stderr empty; wall 8.476 s.
Restoration command: `git -c core.hooksPath=/dev/null checkout -q --detach 516977af2216b1cc426ee970d260dee53714bf4f`; exit 0, empty output. scripts/cap-run.mjs was absent before and after restoration.
`git rev-parse 516977af2216b1cc426ee970d260dee53714bf4f^{tree}` and restored `git rev-parse HEAD^{tree}` both returned de557e5033c8cd3b7e6a1f85a02a39089aadef7a.
Restored revision 516977af2216b1cc426ee970d260dee53714bf4f; command:
`systemd-run --user --scope --quiet -p MemoryMax=3G -p TasksMax=256 timeout -s KILL 900 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-46/probe/caprun-probe.mjs /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC2HalfSandbox/lane 516977af2216b1cc426ee970d260dee53714bf4f`
PARAMS M=115 maxAllocs=8 B=3
CASE K1 NOT_HELD(no runner)
CASE K2 NOT_HELD(no runner)
CASE K3 NOT_HELD(no runner)
CASE K4 NOT_HELD(no runner)
CASE K5 NOT_HELD(no runner)
CASE K6 NOT_HELD(no runner)
CAPRUN_PROBE rev=516977af2216b1cc426ee970d260dee53714bf4f held=0/6
Exit 1; stderr empty; wall 0.664 s.
After every detector invocation, `pgrep -af /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC2HalfSandbox` exited 1 with empty output. The frozen detector emitted no LEFTOVER_KILLED lines.
Cleanup found one failed transient OOM scope, not a scratch-path process. An assertion expecting no unit records failed; no detector was rerun because of it.
`systemctl --user show ctl-c2-half-cg-905315-b3e5f9c4ba.scope --property=ActiveState --property=SubState --property=TasksCurrent` exited 0:
ActiveState=failed
SubState=failed
TasksCurrent=[not set]
`systemctl --user stop ctl-c2-half-cg-905315-b3e5f9c4ba.scope` and `systemctl --user reset-failed ctl-c2-half-cg-905315-b3e5f9c4ba.scope` each exited 0 with empty output.
Final `systemctl --user list-units --all --plain --no-legend --no-pager 'ctl-c2-half-cg-*'` exited 0 with empty output; final scratch-path pgrep exited 1 with empty output. No owned background jobs remain.
Tools: preinstalled systemd 262 (262-1-arch), bubblewrap 0.13.1; Node resolved to /home/vgpnk/.local/share/mise/installs/node/26.12.0/bin/node before namespace execution. No tools installed or updated.

Cgroup-only source, scripts/cap-run.mjs at 734d578aefc07dcec3835f5479007a8b6d896140:
```js
#!/usr/bin/env node
// Partial-work control: cgroup + explicit environment + cleanup, deliberately no PID namespace.
import { spawn, spawnSync } from 'node:child_process';
import { realpathSync } from 'node:fs';
import { dirname } from 'node:path';
import { randomBytes } from 'node:crypto';

const args = process.argv.slice(2);
const supplied = [];
let mem, tasks, budget, i = 0;
while (i < args.length && args[i] !== '--') {
  const key = args[i++], value = args[i++];
  if (key === '--mem') mem = value;
  else if (key === '--tasks') tasks = value;
  else if (key === '--budget') budget = Number(value);
  else if (key === '--env') supplied.push(value);
  else process.exit(64);
}
const command = args.slice(i + 1);
if (!command.length || !mem || !tasks || !(budget > 0)) process.exit(64);
const path = `${dirname(realpathSync(process.execPath))}:/usr/bin:/bin`;
const runtime = process.env.XDG_RUNTIME_DIR || `/run/user/${process.getuid()}`;
const launcherEnv = { PATH: path, XDG_RUNTIME_DIR: runtime };
const unit = `ctl-c2-half-cg-${process.pid}-${randomBytes(5).toString('hex')}.scope`;
let closing = false;
let timer;
const finish = (code) => {
  if (closing) return;
  closing = true;
  clearTimeout(timer);
  const opts = { env: launcherEnv, stdio: 'ignore', timeout: 4000 };
  spawnSync('/usr/bin/systemctl', ['--user', 'kill', '--kill-whom=all', '--signal=SIGKILL', unit], opts);
  spawnSync('/usr/bin/systemctl', ['--user', 'stop', unit], opts);
  process.exit(code);
};
const child = spawn('/usr/bin/env', [
  '-i', `PATH=${path}`, `XDG_RUNTIME_DIR=${runtime}`,
  '/usr/bin/systemd-run', '--user', '--scope', '--quiet', `--unit=${unit}`,
  '-p', `MemoryMax=${mem}M`, '-p', 'MemorySwapMax=0', '-p', `TasksMax=${tasks}`,
  '--', '/usr/bin/env', '-i', `PATH=${path}`, ...supplied, ...command,
], { env: launcherEnv, stdio: 'inherit' });
child.on('error', () => finish(127));
child.on('exit', (code) => finish(code ?? 1));
timer = setTimeout(() => {
  console.error('CAP_RUN: BUDGET');
  finish(124);
}, budget * 1000);
process.on('SIGTERM', () => finish(143));
process.on('SIGINT', () => finish(130));
```

Namespace-only source, scripts/cap-run.mjs at abf1ba7ab6edc5f7d8faca330b0c7644ff569282:
```js
#!/usr/bin/env node
// Partial-work control: PID namespace + explicit environment + cleanup, deliberately no cgroup.
import { spawn } from 'node:child_process';
import { realpathSync } from 'node:fs';
import { dirname } from 'node:path';

const args = process.argv.slice(2);
const supplied = [];
let mem, tasks, budget, i = 0;
while (i < args.length && args[i] !== '--') {
  const key = args[i++], value = args[i++];
  if (key === '--mem') mem = value;
  else if (key === '--tasks') tasks = value;
  else if (key === '--budget') budget = Number(value);
  else if (key === '--env') supplied.push(value);
  else process.exit(64);
}
const command = args.slice(i + 1);
if (!command.length || !mem || !tasks || !(budget > 0)) process.exit(64);
const realNode = realpathSync(process.execPath);
const path = `${dirname(realNode)}:/usr/bin:/bin`;
if (command[0] === 'node') command[0] = realNode;
const cwd = process.cwd();
const setenv = ['--setenv', 'PATH', path];
for (const entry of supplied) {
  const split = entry.indexOf('=');
  setenv.push('--setenv', entry.slice(0, split), entry.slice(split + 1));
}
let closing = false;
let timer;
let child;
const finish = (code) => {
  if (closing) return;
  closing = true;
  clearTimeout(timer);
  child.kill('SIGKILL');
  process.exit(code);
};
child = spawn('/usr/bin/env', [
  '-i', `PATH=${path}`, ...supplied, '/usr/bin/bwrap',
  '--ro-bind', '/', '/', '--dev', '/dev', '--proc', '/proc', '--tmpfs', '/tmp',
  '--bind', cwd, cwd, '--chdir', cwd,
  '--unshare-pid', '--die-with-parent', '--new-session', '--clearenv', ...setenv,
  '--', ...command,
], { env: { PATH: path }, stdio: 'inherit' });
child.on('error', () => finish(127));
child.on('exit', (code) => finish(code ?? 1));
timer = setTimeout(() => {
  console.error('CAP_RUN: BUDGET');
  finish(124);
}, budget * 1000);
process.on('SIGTERM', () => finish(143));
process.on('SIGINT', () => finish(130));
```

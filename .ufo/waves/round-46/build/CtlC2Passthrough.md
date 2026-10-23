RESULT CtlC2Passthrough rev=516977af verdict=meets passthrough=0/6 noreader=2/6 fakeverdict=0/6
Axes: operability, shortcut discrimination, exact restoration, bounded resource use. Frozen base: 516977af2216b1cc426ee970d260dee53714bf4f.
Expected detector: unchanged frozen CAPRUN_PROBE; every shortcut must miss the full 6/6 target. All three did. No candidate implementation was scored.
Mutation classification: inconclusive, not killed: the pristine baseline already lacks a runner and fails 0/6. These are pre-data negative-control results, not evidence of killing a mutant of a passing implementation.
Setup command (cwd /home/vgpnk/Projects/shokunin): `eval 'unset $(git rev-parse --local-env-vars 2>/dev/null) GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE; mkdir -p /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC2Passthrough && git clone -q --no-hardlinks /home/vgpnk/Projects/shokunin/kumitate-shokunin /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC2Passthrough/lane && git -C /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC2Passthrough/lane checkout -q --detach 516977af2216b1cc426ee970d260dee53714bf4f && git -C /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC2Passthrough/lane rev-parse HEAD "HEAD^{tree}" && git -C /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC2Passthrough/lane ls-tree HEAD scripts/cap-run.mjs && sha256sum /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-46/probe/caprun-probe.mjs /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC2Passthrough/lane/.ufo/waves/round-46/probe/caprun-probe.mjs'` -> exit 0; HEAD=516977af2216b1cc426ee970d260dee53714bf4f; tree=de557e5033c8cd3b7e6a1f85a02a39089aadef7a; cap-run tree entry absent; both probe SHA256 values=2a42d0194aa0840b6439122b910a5f509552f918e7d7d2f7ab24ce3b96b27dc3.
Safety command: `df -h /fast` -> /dev/nvme1n1p2 804G 600G 204G 75% /fast. All five probes below used MemoryMax=3G, TasksMax=256 and timeout 900; generated files stayed under this seat's SCRATCH_ROOT. No tools installed or updated.
Commit commands below ran in /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC2Passthrough/lane; each control was created from the frozen base, not from another control.
Passthrough commit: `eval 'unset $(git rev-parse --local-env-vars 2>/dev/null) GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE; git add -- scripts/cap-run.mjs && git -c user.name=ctl -c user.email=ctl@ctl -c commit.gpgsign=false -c core.hooksPath=/dev/null commit -q -m "control: plain inherited-environment passthrough" && git rev-parse HEAD "HEAD^{tree}" && sha256sum scripts/cap-run.mjs'` -> exit 0; 6b56f0bc0e406bbc0d7359d0cacd4249d61a5ba0; tree=e3be8d60f52c39cf1511679cc939ce2b231297e9; file SHA256=5ee993856abff69eed0dda8a710325b7af65eebf09320a9e25cbe0b1107c3868.
No-reader commit: `eval 'unset $(git rev-parse --local-env-vars 2>/dev/null) GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE; git add -- scripts/cap-run.mjs && git -c user.name=ctl -c user.email=ctl@ctl -c commit.gpgsign=false -c core.hooksPath=/dev/null commit -q -m "control: immediate success without reading command" && git rev-parse HEAD "HEAD^{tree}" && sha256sum scripts/cap-run.mjs'` -> exit 0; f6f0909adbe263361337d8423588ee80de2b6bdf; tree=48d356ab3fcca42dd05ce8f77456087fce0ad1db; file SHA256=8bd84068849db1cf74863fdff2bc74704c33efb8fafe33347274fc758a63b302.
Fake-verdict commit: `eval 'unset $(git rev-parse --local-env-vars 2>/dev/null) GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE; git add -- scripts/cap-run.mjs && git -c user.name=ctl -c user.email=ctl@ctl -c commit.gpgsign=false -c core.hooksPath=/dev/null commit -q -m "control: plain command with counterfeit cap verdicts" && git rev-parse HEAD "HEAD^{tree}" && sha256sum scripts/cap-run.mjs'` -> exit 0; ee284a8b8f47a5d661614970432b02ed941a0b0d; tree=7c2cc4d47ffdad14df1ae8552099705d5dfb8c49; file SHA256=7aa1fd980beab5ed822c491b76a30cefd748b64f26c727242818bc73814a03ae.
Pristine command: `env SCRATCH_ROOT=/fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC2Passthrough/runs systemd-run --user --scope --quiet -p MemoryMax=3G -p TasksMax=256 timeout -s KILL 900 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-46/probe/caprun-probe.mjs /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC2Passthrough/lane 516977af2216b1cc426ee970d260dee53714bf4f`
PARAMS M=155 maxAllocs=10 B=3
CASE K1 NOT_HELD(no runner)
CASE K2 NOT_HELD(no runner)
CASE K3 NOT_HELD(no runner)
CASE K4 NOT_HELD(no runner)
CASE K5 NOT_HELD(no runner)
CASE K6 NOT_HELD(no runner)
CAPRUN_PROBE rev=516977af2216b1cc426ee970d260dee53714bf4f held=0/6
Pristine exit code: 1.
Passthrough command: `env SCRATCH_ROOT=/fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC2Passthrough/runs systemd-run --user --scope --quiet -p MemoryMax=3G -p TasksMax=256 timeout -s KILL 900 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-46/probe/caprun-probe.mjs /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC2Passthrough/lane 6b56f0bc0e406bbc0d7359d0cacd4249d61a5ba0`
PARAMS M=153 maxAllocs=10 B=3
CASE K1 NOT_HELD(allocs=DONE,hog_exit=0)
CASE K2 NOT_HELD(leftover=1)
CASE K3 NOT_HELD(wall=60.061,no_budget_line,leftover=1)
CASE K4 NOT_HELD(passed_missing,leaked_GIT_DIR,leaked_GIT_WORK_TREE,leaked_GIT_INDEX_FILE,leaked_secret)
CASE K5 NOT_HELD(leftover=1)
CASE K6 NOT_HELD(p1_unreadable=EACCES)
CAPRUN_PROBE rev=6b56f0bc0e406bbc0d7359d0cacd4249d61a5ba0 held=0/6
LEFTOVER_KILLED 3
Passthrough exit code: 1; observed wall time 65.54 s.
No-reader command: `env SCRATCH_ROOT=/fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC2Passthrough/runs systemd-run --user --scope --quiet -p MemoryMax=3G -p TasksMax=256 timeout -s KILL 900 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-46/probe/caprun-probe.mjs /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC2Passthrough/lane f6f0909adbe263361337d8423588ee80de2b6bdf`
PARAMS M=165 maxAllocs=11 B=4
CASE K1 NOT_HELD(hog_exit=0,liveness=0/exit=0)
CASE K2 CAP_HELD
CASE K3 NOT_HELD(exit=0,no_budget_line)
CASE K4 NOT_HELD(no_child_env)
CASE K5 CAP_HELD
CASE K6 NOT_HELD(no_child_output)
CAPRUN_PROBE rev=f6f0909adbe263361337d8423588ee80de2b6bdf held=2/6
No-reader exit code: 1; observed wall time 5.08 s.
Fake-verdict command: `env SCRATCH_ROOT=/fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC2Passthrough/runs systemd-run --user --scope --quiet -p MemoryMax=3G -p TasksMax=256 timeout -s KILL 900 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-46/probe/caprun-probe.mjs /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC2Passthrough/lane ee284a8b8f47a5d661614970432b02ed941a0b0d`
PARAMS M=166 maxAllocs=11 B=3
CASE K1 NOT_HELD(allocs=DONE,liveness=DONE/exit=137)
CASE K2 NOT_HELD(exit=137,leftover=1)
CASE K3 NOT_HELD(wall=60.061,leftover=1)
CASE K4 NOT_HELD(exit=137,passed_missing,leaked_GIT_DIR,leaked_GIT_WORK_TREE,leaked_GIT_INDEX_FILE,leaked_secret)
CASE K5 NOT_HELD(leftover=1)
CASE K6 NOT_HELD(exit=137,p1_unreadable=EACCES)
CAPRUN_PROBE rev=ee284a8b8f47a5d661614970432b02ed941a0b0d held=0/6
LEFTOVER_KILLED 3
Fake-verdict exit code: 1; observed wall time 65.48 s.
Restoration command (cwd clone): `eval 'unset $(git rev-parse --local-env-vars 2>/dev/null) GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE; git checkout -q --detach 516977af2216b1cc426ee970d260dee53714bf4f && git rev-parse HEAD "HEAD^{tree}" && test ! -e scripts/cap-run.mjs && sha256sum .ufo/waves/round-46/probe/caprun-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-46/probe/caprun-probe.mjs'` -> exit 0; HEAD=516977af2216b1cc426ee970d260dee53714bf4f; tree=de557e5033c8cd3b7e6a1f85a02a39089aadef7a; both probe SHA256 values=2a42d0194aa0840b6439122b910a5f509552f918e7d7d2f7ab24ce3b96b27dc3.
Before/after restoration evidence: identical frozen tracked-tree hash; scripts/cap-run.mjs absent both before and after (there are no baseline file bytes to hash). Each control's committed file hash is recorded above.
Restored command: `env SCRATCH_ROOT=/fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC2Passthrough/runs systemd-run --user --scope --quiet -p MemoryMax=3G -p TasksMax=256 timeout -s KILL 900 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-46/probe/caprun-probe.mjs /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC2Passthrough/lane 516977af2216b1cc426ee970d260dee53714bf4f`
PARAMS M=130 maxAllocs=9 B=2
CASE K1 NOT_HELD(no runner)
CASE K2 NOT_HELD(no runner)
CASE K3 NOT_HELD(no runner)
CASE K4 NOT_HELD(no runner)
CASE K5 NOT_HELD(no runner)
CASE K6 NOT_HELD(no runner)
CAPRUN_PROBE rev=516977af2216b1cc426ee970d260dee53714bf4f held=0/6
Restored exit code: 1.
Cleanup command after EACH of the five runs: `pgrep -af '[w]1-CtlC2Passthrough'` -> no output, exit 1. The frozen probe's marker cleanup killed three descendants for passthrough and three for fake-verdict; all bounded jobs completed. No leftover jobs were left running.
Coverage finding: K2 and K5 individually survive the no-reader shortcut without any child execution; the combined 6/6 target does not. Counterfeit budget text removes only the no_budget_line complaint, not the wall-time/descendant failures. K6 failed here because /proc/1/environ was unreadable; this is not an isolated namespace proof. No predicate changes proposed.
Control source: passthrough (scripts/cap-run.mjs at 6b56f0bc0e406bbc0d7359d0cacd4249d61a5ba0):
```js
import { spawn } from 'node:child_process';
const args = process.argv.slice(process.argv.indexOf('--') + 1);
const child = spawn(args[0], args.slice(1), { env: process.env, stdio: 'inherit' });
child.on('error', () => process.exit(127));
child.on('exit', (code) => process.exit(code ?? 1));
```
Control source: no-reader (scripts/cap-run.mjs at f6f0909adbe263361337d8423588ee80de2b6bdf):
```js
process.exit(0);
```
Control source: fake-verdict (scripts/cap-run.mjs at ee284a8b8f47a5d661614970432b02ed941a0b0d):
```js
import { spawn } from 'node:child_process';
const args = process.argv.slice(process.argv.indexOf('--') + 1);
console.error('CAP_RUN: BUDGET');
console.error('CAP_RUN: OOM');
const child = spawn(args[0], args.slice(1), { env: process.env, stdio: 'inherit' });
child.on('error', () => process.exit(137));
child.on('exit', () => process.exit(137));
```

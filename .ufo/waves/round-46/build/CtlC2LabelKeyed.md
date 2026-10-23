RESULT CtlC2LabelKeyed rev=516977af verdict=meets runs=6/6,6/6,6/6
Mutant: fixture-keyed runner that never launches the requested child, applies no requested memory cap and creates no PID namespace. Expected detector: reject this shortcut. Observed verdict: SURVIVED, final control B passes all six cases three times. Pristine/restored missing-runner failures are not killed-mutant evidence; ordinary baseline mutation comparison is inconclusive.
Clone command: unset $(git rev-parse --local-env-vars 2>/dev/null) GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE; mkdir -p /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC2LabelKeyed && git clone -q --no-hardlinks /home/vgpnk/Projects/shokunin/kumitate-shokunin /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC2LabelKeyed/lane && git -C /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC2LabelKeyed/lane checkout -q --detach 516977af2216b1cc426ee970d260dee53714bf4f ; observed exit=0, pristine runner ABSENT, tree=de557e5033c8cd3b7e6a1f85a02a39089aadef7a.
Sandbox commits used -c user.name=ctl -c user.email=ctl@ctl -c core.hooksPath=/dev/null -c commit.gpgsign=false; A=aea741b9909d5ffc8f1925a7a3e5903fab5fc9be, runner SHA256=2948e9cde2232792d4c5c6038f057796d43d10be3c4b981e47f7b970d95c271b; B=7af3d978d89d5b3bf71b5955d963f30b1ebafcbb, runner SHA256=6452f9ceb434f70c78847ae2d935fa26303c2c9dd6f044ea17b1992346255544. B changes one behavior-bearing line: includes('setTimeout') to startsWith('setTimeout'). Both complete sources follow.
Frozen probe SHA256 before=after=2a42d0194aa0840b6439122b910a5f509552f918e7d7d2f7ab24ce3b96b27dc3. Counter bytes/interface were not changed. Every counter used the mandatory host wrapper, MemoryMax=3G, TasksMax=256, timeout -s KILL 900, and SCRATCH_ROOT inside this seat.
Restoration command: git -C /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC2LabelKeyed/lane checkout -q --detach 516977af2216b1cc426ee970d260dee53714bf4f ; observed exit=0, runner ABSENT, restored tree=de557e5033c8cd3b7e6a1f85a02a39089aadef7a, exactly equal to pristine. The restored detector output is included below; controls remain available by their sandbox commit IDs.
After every one of eight runs: pgrep -a -f /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC2LabelKeyed returned exit=1 with empty output. Probe finish performs marker SIGKILL cleanup; no run printed LEFTOVER_KILLED, and no requested child was ever spawned by either control. No background work remains. df -h /fast before cloning: 204G available, 75% used. Tools: Node v24.21.0, git 2.56.0, systemd 262; no installs/updates.
Cases fakeable: K1 rejects the 64-allocation source without executing it and writes DONE itself for the two-allocation source (zero high-run progress is accepted); K2 skips detached spawn and exits zero; K3 fabricates the budget line and exits immediately; K4 fabricates ENVJSON from --env; K5 exits before SIGTERM, with no child (early exit/status are unchecked); K6 fabricates empty P1ENV, accepted as a successful clean read. None of K1–K6 resists final B. A's K2 failure is only a classifier collision: its detached-spawn source embeds setTimeout, so A mislabels it as budget failure. Random M/B, paths, keys and values do not prevent structural recognition.
PRISTINE exit=1 stderr=(empty) command: SCRATCH_ROOT=/fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC2LabelKeyed/runs systemd-run --user --scope --quiet -p MemoryMax=3G -p TasksMax=256 timeout -s KILL 900 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-46/probe/caprun-probe.mjs /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC2LabelKeyed/lane 516977af2216b1cc426ee970d260dee53714bf4f
PARAMS M=148 maxAllocs=10 B=3
CASE K1 NOT_HELD(no runner)
CASE K2 NOT_HELD(no runner)
CASE K3 NOT_HELD(no runner)
CASE K4 NOT_HELD(no runner)
CASE K5 NOT_HELD(no runner)
CASE K6 NOT_HELD(no runner)
CAPRUN_PROBE rev=516977af2216b1cc426ee970d260dee53714bf4f held=0/6
CONTROL A run=1 exit=1 stderr=(empty) command: SCRATCH_ROOT=/fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC2LabelKeyed/runs systemd-run --user --scope --quiet -p MemoryMax=3G -p TasksMax=256 timeout -s KILL 900 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-46/probe/caprun-probe.mjs /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC2LabelKeyed/lane aea741b9909d5ffc8f1925a7a3e5903fab5fc9be
PARAMS M=114 maxAllocs=8 B=3
CASE K1 CAP_HELD
CASE K2 NOT_HELD(exit=1)
CASE K3 CAP_HELD
CASE K4 CAP_HELD
CASE K5 CAP_HELD
CASE K6 CAP_HELD
CAPRUN_PROBE rev=aea741b9909d5ffc8f1925a7a3e5903fab5fc9be held=5/6
CONTROL A run=2 exit=1 stderr=(empty) command: SCRATCH_ROOT=/fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC2LabelKeyed/runs systemd-run --user --scope --quiet -p MemoryMax=3G -p TasksMax=256 timeout -s KILL 900 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-46/probe/caprun-probe.mjs /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC2LabelKeyed/lane aea741b9909d5ffc8f1925a7a3e5903fab5fc9be
PARAMS M=117 maxAllocs=8 B=3
CASE K1 CAP_HELD
CASE K2 NOT_HELD(exit=1)
CASE K3 CAP_HELD
CASE K4 CAP_HELD
CASE K5 CAP_HELD
CASE K6 CAP_HELD
CAPRUN_PROBE rev=aea741b9909d5ffc8f1925a7a3e5903fab5fc9be held=5/6
CONTROL A run=3 exit=1 stderr=(empty) command: SCRATCH_ROOT=/fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC2LabelKeyed/runs systemd-run --user --scope --quiet -p MemoryMax=3G -p TasksMax=256 timeout -s KILL 900 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-46/probe/caprun-probe.mjs /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC2LabelKeyed/lane aea741b9909d5ffc8f1925a7a3e5903fab5fc9be
PARAMS M=136 maxAllocs=9 B=2
CASE K1 CAP_HELD
CASE K2 NOT_HELD(exit=1)
CASE K3 CAP_HELD
CASE K4 CAP_HELD
CASE K5 CAP_HELD
CASE K6 CAP_HELD
CAPRUN_PROBE rev=aea741b9909d5ffc8f1925a7a3e5903fab5fc9be held=5/6
CONTROL B run=1 exit=0 stderr=(empty) command: SCRATCH_ROOT=/fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC2LabelKeyed/runs systemd-run --user --scope --quiet -p MemoryMax=3G -p TasksMax=256 timeout -s KILL 900 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-46/probe/caprun-probe.mjs /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC2LabelKeyed/lane 7af3d978d89d5b3bf71b5955d963f30b1ebafcbb
PARAMS M=138 maxAllocs=9 B=3
CASE K1 CAP_HELD
CASE K2 CAP_HELD
CASE K3 CAP_HELD
CASE K4 CAP_HELD
CASE K5 CAP_HELD
CASE K6 CAP_HELD
CAPRUN_PROBE rev=7af3d978d89d5b3bf71b5955d963f30b1ebafcbb held=6/6
CONTROL B run=2 exit=0 stderr=(empty) command: SCRATCH_ROOT=/fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC2LabelKeyed/runs systemd-run --user --scope --quiet -p MemoryMax=3G -p TasksMax=256 timeout -s KILL 900 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-46/probe/caprun-probe.mjs /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC2LabelKeyed/lane 7af3d978d89d5b3bf71b5955d963f30b1ebafcbb
PARAMS M=145 maxAllocs=10 B=4
CASE K1 CAP_HELD
CASE K2 CAP_HELD
CASE K3 CAP_HELD
CASE K4 CAP_HELD
CASE K5 CAP_HELD
CASE K6 CAP_HELD
CAPRUN_PROBE rev=7af3d978d89d5b3bf71b5955d963f30b1ebafcbb held=6/6
CONTROL B run=3 exit=0 stderr=(empty) command: SCRATCH_ROOT=/fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC2LabelKeyed/runs systemd-run --user --scope --quiet -p MemoryMax=3G -p TasksMax=256 timeout -s KILL 900 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-46/probe/caprun-probe.mjs /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC2LabelKeyed/lane 7af3d978d89d5b3bf71b5955d963f30b1ebafcbb
PARAMS M=148 maxAllocs=10 B=4
CASE K1 CAP_HELD
CASE K2 CAP_HELD
CASE K3 CAP_HELD
CASE K4 CAP_HELD
CASE K5 CAP_HELD
CASE K6 CAP_HELD
CAPRUN_PROBE rev=7af3d978d89d5b3bf71b5955d963f30b1ebafcbb held=6/6
RESTORED exit=1 stderr=(empty) command: SCRATCH_ROOT=/fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC2LabelKeyed/runs systemd-run --user --scope --quiet -p MemoryMax=3G -p TasksMax=256 timeout -s KILL 900 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-46/probe/caprun-probe.mjs /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC2LabelKeyed/lane 516977af2216b1cc426ee970d260dee53714bf4f
PARAMS M=159 maxAllocs=10 B=2
CASE K1 NOT_HELD(no runner)
CASE K2 NOT_HELD(no runner)
CASE K3 NOT_HELD(no runner)
CASE K4 NOT_HELD(no runner)
CASE K5 NOT_HELD(no runner)
CASE K6 NOT_HELD(no runner)
CAPRUN_PROBE rev=516977af2216b1cc426ee970d260dee53714bf4f held=0/6
## Appended complete source: control A, scripts/cap-run.mjs at aea741b9909d5ffc8f1925a7a3e5903fab5fc9be
```javascript
#!/usr/bin/env node
// Negative control: spoof fixture observations; never launch the requested child.
import { writeFileSync } from 'node:fs';
const args = process.argv.slice(2);
const split = args.indexOf('--');
const fixture = args.slice(split + 1)[2] || '';
const env = {};
for (let i = 0; i < split; i++) {
  if (args[i] !== '--env') continue;
  const pair = args[++i];
  const equals = pair.indexOf('=');
  env[pair.slice(0, equals)] = pair.slice(equals + 1);
}
if (fixture.includes('Buffer.alloc')) {
  if (!fixture.includes('i<=2;')) process.exit(1);
  const path = /fs\.writeFileSync\("([^"]+)",'DONE'\)/.exec(fixture)[1];
  writeFileSync(path, 'DONE');
} else if (fixture.includes('ENVJSON=')) {
  process.stdout.write(`ENVJSON=${JSON.stringify(env)}\n`);
} else if (fixture.includes('/proc/1/environ')) {
  process.stdout.write('P1ENV=\n');
} else if (fixture.includes('setTimeout') && fixture.includes('300000')) {
  process.stderr.write('CAP_RUN: BUDGET\n');
  process.exitCode = 1;
}
// Detached-spawn and other fixtures return zero without executing anything.
```
## Appended complete source: control B, scripts/cap-run.mjs at 7af3d978d89d5b3bf71b5955d963f30b1ebafcbb
```javascript
#!/usr/bin/env node
// Negative control: spoof fixture observations; never launch the requested child.
import { writeFileSync } from 'node:fs';
const args = process.argv.slice(2);
const split = args.indexOf('--');
const fixture = args.slice(split + 1)[2] || '';
const env = {};
for (let i = 0; i < split; i++) {
  if (args[i] !== '--env') continue;
  const pair = args[++i];
  const equals = pair.indexOf('=');
  env[pair.slice(0, equals)] = pair.slice(equals + 1);
}
if (fixture.includes('Buffer.alloc')) {
  if (!fixture.includes('i<=2;')) process.exit(1);
  const path = /fs\.writeFileSync\("([^"]+)",'DONE'\)/.exec(fixture)[1];
  writeFileSync(path, 'DONE');
} else if (fixture.includes('ENVJSON=')) {
  process.stdout.write(`ENVJSON=${JSON.stringify(env)}\n`);
} else if (fixture.includes('/proc/1/environ')) {
  process.stdout.write('P1ENV=\n');
} else if (fixture.startsWith('setTimeout') && fixture.includes('300000')) {
  process.stderr.write('CAP_RUN: BUDGET\n');
  process.exitCode = 1;
}
// Detached-spawn and other fixtures return zero without executing anything.
```

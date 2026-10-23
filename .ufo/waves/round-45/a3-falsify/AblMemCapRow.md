RESULT AblMemCapRow rev=6b2a4517 verdict=defect baseline=reproduces control_clean=yes necessary=2/4 redundant=TasksMax,timeout

# AblMemCapRow — necessity ablation of decision-table row 6 (mechanism M6)

Judged object: `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show 6b2a45178c72a4565bb9d98e09f4c36b95ca1521:corpus/knowledge/agent-isolation-substrates.md`,
blob sha256 `a3a7ce3b340b9984f01a13c1aa5fde36fbf3847d68f920cd1d0573ac75d81d61`; the row "any run that can allocate" is
line 165, mechanism M6 lines 134–145. The entry's stated failure is "a native allocation (Buffer, child process) passing
a heap cap and growing until host memory pressure" (17 words, quoted from line 165). Scratch only
`/fast/scratch/hyaku/kumitate-r45/seats/a3f-AblMemCapRow/` (64K, no core files). No tool installed or updated, no
pacman, no git/jj write, no lane file written except this report.

Host: kernel 7.2.11-arch1-1, node v24.21.0, systemd 262 (user manager, cgroup v2), prlimit util-linux 2.42.4,
swap `/swap/swapfile`. Every run went through
`systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 900 bash probe/body.sh <tag> <tmo> "<inner -p limits>" -- <cmd>`;
inner scopes were at most 512M, allocations at most 512 MiB (ceiling 768), fork test self-limited to 200 children.
Measurement device, not a guard: `probe/supervise.sh ignore` is the inner scope's main process and ignores SIGTERM,
because an OOM kill inside a scope makes systemd SIGTERM the rest of the cgroup (observed: two `GOT_TERM` lines, and
every run with a TERM-default shell lost its counter print). It prints the child's wait status and the cgroup counters
after the kill; it adds no cap and does not change whether the allocation is killed.

## 1. Baseline — effect and do-nothing control from the printed clean pre-state

1. `swapon --show` → `NAME TYPE SIZE USED PRIO / /swap/swapfile file 30.3G 2.7G 0`; `cat /proc/swaps` → `Filename Type Size Used Priority /swap/swapfile file 31722876 2814116 0`; `free -m` → `Mem: 30978 … available 19562 / Swap: 30979 2748 28231`; `systemctl --user list-units 'i-*' 'o-*' --all --no-legend | wc -l` → `1` (pre-existing, not mine).
2. Effect, no guard, run 1 — `systemd-run --user --scope --quiet --unit=o-B-eff-1 -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 900 bash probe/body.sh B-eff-1 60 none -- node --max-old-space-size=64 probe/alloc.js alloc 512` → `BEFORE rss=47288320 heapUsed=4642496 arrayBuffers=137503 … VmHWM_kB=47120`, `ALLOC_OK 512`, `AFTER rss=583102464 … arrayBuffers=537008379 … VmHWM_kB=571736`, `CHILD_WAIT_RC=0 ELAPSED_MS=125`, `AFTER memory.peak=554360832`, `AFTER memory.events=… oom 0 oom_kill 0 …`.
3. Effect, run 2 (B-eff-2, same command/tag) → `ALLOC_OK 512`, `arrayBuffers=537008379`, `CHILD_WAIT_RC=0 ELAPSED_MS=126`, `memory.peak=552214528`, `oom_kill 0`. Deltas effect: arrayBuffers +536,870,876 B, rss +535,814,144 B, peak 552–554 MB.
4. Inline fingerprint, B-inline-1 (`node --max-old-space-size=64 -e '… Buffer.allocUnsafe(512*1024*1024); b.fill(0x5a); …'`) → `ALLOC_OK 512 arrayBuffers=537008379 heapUsed=3923512 rss=580161536`.
5. Do-nothing control, trigger removed, run 1 — `… bash probe/body.sh B-ctl-1 60 none -- node --max-old-space-size=64 probe/alloc.js control` → `CONTROL_NO_ALLOC`, `BEFORE rss=46972928 … arrayBuffers=137503`, `AFTER rss=46972928 … arrayBuffers=137503`, `CHILD_WAIT_RC=0 ELAPSED_MS=18`, `memory.peak=15495168`, `oom_kill 0`. Control deltas: arrayBuffers 0, rss 0, peak 15.5 MB vs effect 554 MB.
6. Control run 2 (B-ctl-2) → `CONTROL_NO_ALLOC`, arrayBuffers 137503→137503, rss 46743552→46743552, `memory.peak=13930496`, exit 0.
7. Heap-flag-live check, B-heaplive-1 (`--max-old-space-size=64`, JS string loop) → `FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory`, `INNER_EXIT=134 ELAPSED_MS=794`, `memory.peak=145068032`.

Per-number comparison with the entry's M6 paragraph:

- "allocates and touches a 512 MiB Buffer and prints `ALLOC_OK 512` (exit 0)" — CONFIRMED (2/2 + inline).
- "arrayBuffers 537,008,379 bytes" — CONFIRMED exactly, 3/3 runs.
- "heapUsed 3,921,064" — DIFFERS observed=3923512 bytes in my minimal inline fixture (+2,448, +0.06%); my module-loading probe gives 4,235,416 because it loads `fs` and regexes `/proc/self/status`. The a2 receipt records 3,921,064, so the byte value is fixture-dependent as the entry itself warns.
- "the same flag does stop a JS string loop (`Reached heap limit`, exit 134)" — CONFIRMED.
- "`prlimit --as=805306368` … kills node before the script runs … `Failed to reserve virtual memory for CodeRange`, exit 133" — CONFIRMED: `Fatal process out of memory: Failed to reserve virtual memory for CodeRange`, `CHILD_WAIT_RC=133`.
- "at 1600 MiB the allocation fails in-process (`ERR_MEMORY_ALLOCATION_FAILED`, exit 1)" — CONFIRMED: `RangeError: Failed to allocate memory`, `code: 'ERR_MEMORY_ALLOCATION_FAILED'`, `CHILD_WAIT_RC=1`.
- "V8 reserves about 1.34 GiB of address space at start (VmPeak 1.41 GiB)" — DIFFERS observed: `VmPeak: 1276204 kB | VmSize: 1211308 kB` (minimal `node -e`) and `VmPeak: 1276968 kB | VmSize: 1276844 kB` with `--max-old-space-size=64` (1.217 GiB); the a2 receipt's own case K records `VmPeak 1473452 kB`, which is the 1.41 GiB the entry cites. Fix: quote the receipt, not a general startup figure.

## 2. Full guard set — the failure is absent

8. `-p MemoryMax=256M -p MemorySwapMax=0 -p TasksMax=64`, run F2-alloc-1 → `LIMIT memory.max=268435456 … memory.swap.max=0 … pids.max=64`; `CHILD_WAIT_RC=137 ELAPSED_MS=72`; `AFTER memory.peak=268435456`; `AFTER memory.events=… max 150 oom 1 oom_kill 1 …`; `AFTER memory.swap.current=0`; `SCOPE_EXIT=137`, `SCOPE_RESULT=oom-kill`; kernel `oom-kill:constraint=CONSTRAINT_MEMCG,…,oom_memcg=/user.slice/…/i-F2-alloc-1.scope,…`.
9. Runs F2-alloc-2 and F2-alloc-3 → `CHILD_WAIT_RC=137` at 68 ms and 77 ms; `memory.peak=268435456`; `oom_kill 1`; `SCOPE_RESULT=oom-kill` each; kernel `constraint=CONSTRAINT_MEMCG` naming `i-F2-alloc-2.scope` and `i-F2-alloc-3.scope`. Including three earlier 256M runs (`i-F-alloc-1..3`, same limits, kernel constraint and `Result=oom-kill` each), the OOM bound reproduced 6/6, and `exit 137` 3/3 when the wait status was observable.
10. 16 MiB in the same scope, F2-alloc16 → `ALLOC_OK 16`, `AFTER memory.peak=39616512`, `oom_kill 0`, `CHILD_WAIT_RC=0`, `SCOPE_RESULT=success`.
11. No-allocation control in the same scope, F2-ctl → `CONTROL_NO_ALLOC`, `memory.peak=14454784`, `CHILD_WAIT_RC=0`, `SCOPE_RESULT=success`.

## 3. Ablation, one component at a time

12. (a) `MemoryMax` removed — `-p MemorySwapMax=0 -p TasksMax=64`, A-memmax-1/2 → `LIMIT memory.max=max memory.swap.max=0 pids.max=64`; `ALLOC_OK 512`; `memory.peak=559841280` and `550453248`; `oom_kill 0`; `CHILD_WAIT_RC=0`. **NECESSARY** (2/2, the failure returns).
13. (b) `MemorySwapMax=0` removed — `-p MemoryMax=256M -p TasksMax=64`, A-swapmax-1/2/3 → `LIMIT memory.max=268435456 memory.swap.max=max`; `ALLOC_OK 512`; `CHILD_WAIT_RC=0` (3/3); peaks 268468224 / 268464128 / 268468224; `oom_kill 0`; `memory.events … max 1812/1792/1814 …`.
14. (b) live in-process sample, A-swapmax-3 → `CG_VIEW memory.current=268386304 memory.swap.current=302080000 memory.peak=268468224 memory.max=268435456 memory.swap.max=max memory.events=[low 0 high 0 max 1814 oom 0 oom_kill 0 oom_group_kill 0 sock_throttled 0]` — the cap holds resident memory at 256 MiB while ~288 MiB sits in swap; after exit `memory.swap.current=311296`. **NECESSARY**; the failure is not bounded.
15. (c) `TasksMax` removed — `-p MemoryMax=256M -p MemorySwapMax=0`, A-tasksmax-1 → `LIMIT … pids.max=36859`; `CHILD_WAIT_RC=137 ELAPSED_MS=62`; `memory.peak=268435456`; `oom_kill 1`; kernel `constraint=CONSTRAINT_MEMCG … i-A-tasksmax-1.scope`. **REDUNDANT** for the row's stated failure.
16. (c) case that needs it — same memory guards, `MemoryMax=512M`, task storm of 200: FK-unlim → `PIDS_MAX=36859`, `FORK_SPAWNED=200`, `PIDS_CURRENT_MID=205`, `memory.peak=59543552`, `oom_kill 0`, exit 0; FK-lim with `TasksMax=16` → `PIDS_MAX=16`, six `fork: retry: Resource temporarily unavailable` lines, `pids.current=11`, `CHILD_WAIT_RC=254`, scope later `inactive/success`, 0 leftover processes.
17. (d) `timeout -s KILL` removed (tmo=0), all else full, A-timeout-1 → `CHILD_WAIT_RC=137 ELAPSED_MS=76`; `memory.peak=268435456`; `oom_kill 1`; kernel `constraint=CONSTRAINT_MEMCG … i-A-timeout-1.scope`. **REDUNDANT** for the row's stated failure.
18. (d) case that needs it — 128 MiB hold below the cap, `timeout -s KILL 10`, H-tmo10 → `ALLOC_OK 128`; `CG_VIEW memory.current=155545600 … memory.peak=155545600 memory.max=268435456 … oom 0 oom_kill 0`; `CHILD_WAIT_RC=137 ELAPSED_MS=10001`; `SCOPE_RESULT=success`. The cap never fired (peak 148 MiB < 256 MiB); only `timeout` ended the run, and the scope `Result` did not record it.

Answer to step 4: with `MemoryMax=256M` and no `MemorySwapMax`, a touched 512 MiB Buffer **survives by swapping** (3/3,
`ALLOC_OK 512`, exit 0, `memory.swap.current=302080000` while alive); it does not end `exit 137`.

## 4. Unit results, host state, cleanliness

19. `systemctl --user show i-F2-alloc-{1,2,3}.scope -p Result -p ActiveState` → `Result=oom-kill ActiveState=failed` each; F2-alloc16/F2-ctl/A-* success runs → `Result=success`.
20. Observation on `Result` and exits: a scope's `Result` does not encode the main process's exit code (H-tmo10 exited 137 with `Result=success`), and when `timeout` is the scope's direct main process the OOM teardown SIGTERMs the client, which returned `143` in 3/3 (`o-F-alloc-*`), while the child's wait status was 137.
21. Post-run: `systemctl --user reset-failed` on my 11 failed scopes by exact name → `remaining_mine=0`; `pgrep -af 'a3f-AblMemCapRow'` → `0`; scratch `du -sh` → `64K`; no `core*` file in scratch.
22. Host memory/swap after: `free -m` → `available 20363`, `Swap: 30979 4076 26902`; `cat /proc/swaps` → `31722876 4174364`. The rise from pre-state 2,814,116 kB is host-wide and tracks the many concurrent seats (SwapFree was already 26.5 GB before my swap runs); my ablation's own cgroup swap charge fell to ≤311,296 B at exit and every other run had `memory.swap.max=0` with `memory.swap.current=0`.

## 5. Defects, stated plainly

- **D1 — the row's "required guards" overstates necessity.** Of the four components, only `MemoryMax` and
  `MemorySwapMax=0` prevent the row's stated failure (`necessary=2/4`). `TasksMax` and `timeout -s KILL` change nothing
  about a native allocation crossing a memory cap (receipts 15 and 17). Both have real cases — a 200-child storm and a
  sub-cap hold — but neither case is the failure the row names. The row's failure clause also says "child process", yet
  a child-process count is not a memory property and only `TasksMax` bounds it. Suggested appended erratum: split the
  guard list into "bound the memory failure" (`MemoryMax`, `MemorySwapMax=0`) and "bound adjacent failures"
  (`TasksMax` process count, `timeout` hangs below the cap). The mechanism itself is not wrong.
- **D2 — "read exit 137" is not the scope client's exit under the row's own shape.** With `timeout -s KILL` as the
  scope's main process, the OOM event makes systemd SIGTERM the rest of the cgroup and the client exits 143 (3/3);
  137 is the allocation's wait status, observable only from a supervisor that survives the teardown. `Result=oom-kill`,
  `memory.peak` equal to the cap and `constraint=CONSTRAINT_MEMCG` are the invariant signals. Suggested erratum: name
  which exit is read.
- **D3 — the "VmPeak 1.41 GiB / about 1.34 GiB at start" figure does not reproduce as a general startup value** in my
  fixture (1,276,204 kB; 1,276,968 kB with the flag). It is the a2 receipt's case-K value; quote it as a receipt
  measurement. Supporting figure only.

Verdict: `defect` on the row's necessity claim and the two reading details; the mechanism M6 and the bounded failure
itself reproduce (`baseline=reproduces`, `control_clean=yes`).

## 6. Scripts (verbatim)

`probe/body.sh` (sha256 `7d598054baf7ae5067e906dae70b761177463a853d65dbef7285a87e3092da15`):

```bash
#!/bin/bash
# usage: body.sh TAG TIMEOUT_S "INNER_LIMITS" -- cmd...
# Runs inside the outer host-safety scope. INNER_LIMITS="none" runs the command with no
# inner scope (baseline). Otherwise starts a named inner scope with those -p limits.
set -u
tag=$1; tmo=$2; limits=$3; shift 3
[ "${1:-}" = "--" ] && shift
S=/fast/scratch/hyaku/kumitate-r45/seats/a3f-AblMemCapRow/probe
args=("$@")
echo "=== RUN $tag limits=[$limits] tmo=$tmo"
echo "OUTER_CGROUP=$(sed -n 's/^0:://p' /proc/self/cgroup)"
echo "HOST_PRE $(grep -E 'MemAvailable|SwapFree' /proc/meminfo | tr '\n' ' ')"
echo "MY_UNITS_PRE=$(systemctl --user list-units 'i-*' --all --no-legend | wc -l)"
t0=$(date +%s)
if [ "$limits" = none ]; then
  "$S/supervise.sh" ignore "$tmo" "${args[@]}"
  echo "SCOPE_EXIT=$?"
else
  read -r -a L <<< "$limits"
  systemd-run --user --scope --quiet --unit="i-$tag" "${L[@]}" "$S/supervise.sh" ignore "$tmo" "${args[@]}"
  echo "SCOPE_EXIT=$?"
  sleep 0.4
  echo "SCOPE_RESULT=$(systemctl --user show "i-$tag.scope" -p Result --value 2>&1)"
  echo "SCOPE_ACTIVE=$(systemctl --user show "i-$tag.scope" -p ActiveState --value 2>&1)"
fi
t1=$(date +%s)
echo "HOST_POST $(grep -E 'MemAvailable|SwapFree' /proc/meminfo | tr '\n' ' ')"
echo "KERNEL: $(journalctl -k --since "@$((t0 - 2))" --until "@$((t1 + 2))" --no-pager 2>&1 | grep -E 'constraint=|Killed process' | grep -F "$tag" | tail -3 | tr '\n' '|')"
echo "SELF_PROCS=$(pgrep -af "$S" | grep -v pgrep | wc -l)"
```

`probe/supervise.sh` (sha256 `08647c2fb16c6fc156fbea80f7c7f10127b6d6caecf110ed1851080196e90fe0`):

```bash
#!/bin/bash
# usage: supervise.sh <ignore|trap> <timeout_s|0> <cmd...>
# Starts cmd as a child, records its wait status and the scope's cgroup counters,
# tolerating or logging the SIGTERM the scope sends after an OOM kill.
set -u
mode=$1; tmo=$2; shift 2
cgrel=$(sed -n 's/^0:://p' /proc/self/cgroup); cg=/sys/fs/cgroup$cgrel
echo "SUPERVISOR pid=$$ mode=$mode cgroup=$cgrel"
echo "LIMITS memory.max=$(cat "$cg/memory.max" 2>/dev/null) memory.swap.max=$(cat "$cg/memory.swap.max" 2>/dev/null) pids.max=$(cat "$cg/pids.max" 2>/dev/null) oom.group=$(cat "$cg/memory.oom.group" 2>/dev/null)"
if [ "$mode" = ignore ]; then trap '' TERM; else trap 'echo GOT_TERM' TERM; fi
t0=$(date +%s%N)
if [ "$tmo" = 0 ]; then "$@" & else timeout -s KILL "$tmo" "$@" & fi
p=$!
wait "$p"; rc=$?
echo "CHILD_WAIT_RC=$rc ELAPSED_MS=$(( ($(date +%s%N) - t0) / 1000000 ))"
for f in memory.peak memory.events memory.swap.events memory.current memory.swap.current pids.current; do
  printf 'AFTER %s=%s\n' "$f" "$(cat "$cg/$f" 2>/dev/null | tr '\n' ' ')"
done
echo "SUPERVISOR_DONE"
exit "$rc"
```

`probe/alloc.js` (sha256 `7016bae887f0347e451d9c3f1ff2b3d7dcb0d83d624a39be064edd510fa7caca`):

```js
'use strict';
// Modes: alloc <mib> [hold] | stringloop | control (trigger removed)
const fs = require('fs');
const mode = process.argv[2] || 'control';
const mib = Number(process.argv[3] || 0);
const hold = process.argv[4] === 'hold';
function mem() {
  const m = process.memoryUsage();
  let s = '';
  try {
    const st = fs.readFileSync('/proc/self/status', 'utf8');
    const g = (k) => { const x = st.match(new RegExp('^' + k + ':\\s*(\\S+)', 'm')); return x ? x[1] : '?'; };
    s = 'VmHWM_kB=' + g('VmHWM') + ' VmRSS_kB=' + g('VmRSS');
  } catch (e) { s = 'VmHWM_kB=? VmRSS_kB=?'; }
  return 'rss=' + m.rss + ' heapUsed=' + m.heapUsed + ' arrayBuffers=' + m.arrayBuffers + ' external=' + m.external + ' ' + s;
}
function cgstat() {
  try {
    const cgrel = fs.readFileSync('/proc/self/cgroup', 'utf8').trim().split(':').slice(2).join('');
    const base = '/sys/fs/cgroup' + cgrel;
    const rd = (f) => { try { return fs.readFileSync(base + '/' + f, 'utf8').trim().replace(/\n/g, ' '); } catch (e) { return 'NA'; } };
    return 'CG_VIEW memory.current=' + rd('memory.current') + ' memory.swap.current=' + rd('memory.swap.current') +
      ' memory.peak=' + rd('memory.peak') + ' memory.max=' + rd('memory.max') + ' memory.swap.max=' + rd('memory.swap.max') +
      ' memory.events=[' + rd('memory.events') + ']';
  } catch (e) { return 'CG_VIEW unavailable ' + e.message; }
}
console.log('PID=' + process.pid + ' MODE=' + mode + ' MIB=' + mib + ' HEAPFLAG=' + (process.execArgv.join(',') || 'none'));
console.log('BEFORE ' + mem());
console.log(cgstat());
let buf = null;
if (mode === 'alloc') {
  buf = Buffer.allocUnsafe(mib * 1024 * 1024);
  buf.fill(0x5a);
  console.log('ALLOC_OK ' + mib);
  console.log(cgstat());
} else if (mode === 'stringloop') {
  const keep = [];
  let i = 0;
  try {
    for (;;) { keep.push('x'.repeat(1 << 20) + i); i++; }
  } catch (e) { console.log('JS_CAUGHT ' + e.message); }
  console.log('STRINGLOOP_SURVIVED ' + i);
} else {
  console.log('CONTROL_NO_ALLOC');
}
console.log('AFTER ' + mem());
if (hold) {
  console.log('HOLD_START');
  setInterval(() => { if (buf) buf[0] = 1; }, 1000);
} else {
  if (buf) buf[0] = 1; // keep the buffer live to exit
  process.exit(0);
}
```

`probe/fork.sh` (sha256 `521e48b7ed2b001d4bc2966e9ecd7a78014f0d297e7919aba640a4cf4c2336fb`):

```bash
#!/bin/bash
# Self-limited fork test: up to 200 short-lived children, counts how many spawned.
set -u
n=${1:-200}
cgrel=$(sed -n 's/^0:://p' /proc/self/cgroup); cg=/sys/fs/cgroup$cgrel
echo "FORK_TARGET=$n PIDS_MAX=$(cat "$cg/pids.max" 2>/dev/null) START=$(cat "$cg/pids.current" 2>/dev/null)"
pids=()
for ((i = 1; i <= n; i++)); do
  sleep 3 &
  p=$!
  if [ -n "${p:-}" ] && kill -0 "$p" 2>/dev/null; then pids+=("$p"); else break; fi
done
echo "FORK_SPAWNED=${#pids[@]}"
echo "PIDS_CURRENT_MID=$(cat "$cg/pids.current" 2>/dev/null) PIDS_EVENTS=$(cat "$cg/pids.events" 2>/dev/null | tr '\n' ' ')"
for p in "${pids[@]}"; do kill "$p" 2>/dev/null; done
wait
echo "FORK_CLEANED"
```

(An earlier `probe/inner.sh`, sha256 `39ee20680ad3bfd833bc9f015bc22856e365f7b4369983f09729c8ddbfcf3784`, produced only
the three pre-supervisor runs `i-F-alloc-1..3`; `supervise.sh ignore` superseded it because the scope's SIGTERM
teardown cut its counter print. Full log `RUNLOG.txt`, pre-state `PRE.txt`.)

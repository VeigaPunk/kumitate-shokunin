RESULT RedoDemoNativeMemCap rev=a2e5b54c verdict=reproduces effect=yes control_clean=yes statements_confirmed=17/19

# RedoDemoNativeMemCap — independent re-derivation of demo M6 (V8 heap cap vs cgroup)

Revision: item-declared lane tip `a2e5b54c…`; observed read-only `git rev-parse HEAD` = `d9ad28701a9c2b504ae5db7919af1cdbabf18c83`
("round-45: attempt-2 plan erratum E8, start census, control-wave spec and dispatch"), one commit ahead of
`a2e5b54c` (`merge-base --is-ancestor a2e5b54c HEAD` exit 0). Nothing in the demo depends on lane bytes.
Graded object: the M6 paragraph (draft line 93) and the "any run that can allocate" decision-table row (line 125) of
`/fast/scratch/hyaku/kumitate-r45/a2/inherited-entry-draft.md`, sha256
`10c3dc8e5c097f84892f288f6954f61f7631d0a048fe5b38109ef8aef72402b6`. The inherited receipt
`.ufo/waves/round-45/build/DemoNativeMemCap.md` (rev cfa99304, seat dead) was read only AFTER my own script was
written and run, for wording only; none of its numbers are reused below.

Host (observed): node v24.21.0 at `/run/user/1000/fnm_multishells/2555188_1792733140099/bin/node`;
systemd 262 (262-1-arch) user manager, cgroup v2; prlimit util-linux 2.42.4; kernel 7.2.11-arch1-1 x86_64.
Scratch: `/fast/scratch/hyaku/kumitate-r45/seats/a2-RedoDemoNativeMemCap/` only. No tool installed or updated.
No git or jj write; lane file written: this report only.

## Method

Own script `demo-native-memcap.sh` (sha256 `466a3c76be1ab2f7b641e8ea39b8267a8e5534f20c249ed0c38b867952fff26f`) written
from the item description before reading any inherited material, plus `probe-bounded-strings.sh`
(`3b21566d9be85e9357efd4976cc4c4e6a615fa09596ecac7e2b52c27315f13aa`). Each case runs inside the 256M inner scope:

    systemd-run --user --scope --quiet -p MemoryMax=256M -p MemorySwapMax=0 --unit=a2-nmc-<stamp>-<case> -- <cmd>

and the whole script inside the host-safety wrapper, with the outer scope the item names (MemoryMax=1G):

    systemd-run --user --scope --quiet -p MemoryMax=1G -p TasksMax=128 timeout -s KILL 900 ./demo-native-memcap.sh
    OUTER_RC=0

## Observed results (full log `run-v4.out`, per-case logs in `logs/`)

A do-nothing control (nothing allocated), inner 256M scope: `exit 0`, `cgroup=…-A_do_nothing.scope memory.max=268435456 memory.swap.max=0`, `do-nothing: rss_MiB=44`.
B control 16 MiB Buffer touched, inner 256M scope: `exit 0`, `ALLOC_OK 16 arrayBuffers=16MB heapUsed=4.2MB rss=61MiB`.
C 512 MiB Buffer touched, inner 256M scope, three runs: `exit 137` each; `systemctl --user show` `Result=oom-kill`, `MemoryMax=268435456`, `MemorySwapMax=0`.
C journal, run 1 of 3, verbatim: `a2-nmc-69307-…-C_buffer_512M_run1.scope: The kernel OOM killer killed some processes in this unit.`
C journal: `a2-nmc-69307-…-C_buffer_512M_run1.scope: Failed with result 'oom-kill'.` and `… 256M memory peak.` (runs 2 and 3 identical).
C kernel attribution (`journalctl -k`): `oom-kill:constraint=CONSTRAINT_MEMCG,…,oom_memcg=/user.slice/…/a2-nmc-69307-1792733886-C_buffer_512M_run2.scope,…,task=MainThread,pid=69543`
C kernel: `Memory cgroup out of memory: Killed process 69543 (MainThread) total-vm:1932484kB, anon-rss:260544kB, … oom_score_adj:200`
D 1 MiB JS strings, same flag, inner scope: `exit 134`; `FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory`; scope peak 83.2M.
E 512 MiB Buffer, NO inner cgroup cap (outer 1G only): `exit 0`; `ALLOC_OK 512 arrayBuffers=512MB heapUsed=3.9MB rss=559MiB`; scope peak 525.4M.
E raw counters, re-run printing bytes: `ALLOC_OK 512 arrayBuffers_bytes=537008379 heapUsed_bytes=3921064 rss_bytes=582103040`.
F `prlimit --as=805306368` (768 MiB), 512 MiB allocation: `exit 133`; `# Fatal process out of memory: Failed to reserve virtual memory for CodeRange`.
G `prlimit --as=1677721600` (1600 MiB), same allocation: `exit 1`; `RangeError: Failed to allocate memory` / `code: 'ERR_MEMORY_ALLOCATION_FAILED'`.
H `prlimit --as=768M` literal, as the entry writes it: `exit 1`; `prlimit: failed to parse AS limit` (prlimit 2.42.4 rejects the `M` suffix).
I1 `prlimit --as=805306368`, 16 MiB control: `exit 133`, same CodeRange message (the limit, not the allocation, kills node).
I2 `prlimit --as=1677721600`, 16 MiB control: `exit 0`, `ALLOC_OK 16`.
K node startup footprint, no cap: `VmPeak 1473452 kB` (1.405 GiB), `VmSize 1407916 kB` (1.343 GiB), `VmRSS 45236 kB`.
J bounded loop of exactly 2,000,000 strings, `--max-old-space-size=64`, inner scope: `exit 134`;
  progress `1000000 heapUsed=39.5MB`, `1500000 heapUsed=55.8MB`, `1750000 heapUsed=59.4MB`, then `FATAL ERROR: Reached heap limit` — it never reaches `FIT_OK 2000000`.
L full documented guard shape `-p MemoryMax=256M -p MemorySwapMax=0 -p TasksMax=64` + inner `timeout -s KILL 60`, 512 MiB: `exit 137`; journal `a2-nmc-103554-…-L.scope: Failed with result 'oom-kill'`, `256M memory peak`.
Cleanliness: `pgrep -af 'a2-RedoDemoNativeMemCap|a2-nmc-'` → no match (exit 1); scratch 136K; no core files stored
(`coredumpctl list` shows `none` for the SIGABRT/SIGTRAP entries); no process left behind.

## Statement-by-statement comparison (M6 paragraph + decision-table row)

1. "Buffer backing memory lives in ArrayBuffers outside [the old space]" — CONFIRMED: 512 MiB Buffer, `heapUsed` 3.9 MB, `arrayBuffers` 537 MB under a 64 MB heap cap.
2. "node v24.21.0" — CONFIRMED.
3. "outer scope MemoryMax=1G" — CONFIRMED (wrapper I ran under has exactly `-p MemoryMax=1G`; E's scope peak 525.4M).
4. "`--max-old-space-size=64` allocates a 512 MiB Buffer and prints `ALLOC_OK 512` (exit 0)" — CONFIRMED (case E, no cgroup cap).
5. "arrayBuffers 537 MB" — CONFIRMED: 537,008,379 bytes (same byte count as the inherited receipt; my MiB-rounded print said 512MB).
6. "heapUsed 3.9 MB" — CONFIRMED: 3,921,064 bytes.
7. "the same flag does stop 2,000,000 JS strings (`Reached heap limit`, exit 134), so it was live" — CONFIRMED (case J, bounded loop OOMs between 1,750,000 and 2,000,000; exit 134).
8. "Inside a scope with `MemoryMax=256M MemorySwapMax=0` the 512 MiB allocation is OOM-killed (exit 137)" — CONFIRMED (3/3 this run, 6/6 including the first run of this seat).
9. "journal `Failed with result 'oom-kill'`" — CONFIRMED, lines quoted above, named per-run scope.
10. "three of three runs" — CONFIRMED (3/3).
11. "`prlimit --as=768M` kills node before the script runs (… `Failed to reserve virtual memory for CodeRange`, exit 133)" — PARTIAL: the literal flag `--as=768M` is not runnable (prlimit: `failed to parse AS limit`, exit 1); the byte form `--as=805306368` reproduces the quoted message and exit 133 exactly. Defence a falsify seat would score: the entry's command text is wrong even though its mechanism is right.
12. "V8 reserves 1.28-1.41 GB of address space at start" — CONFIRMED with a unit caveat: VmSize 1.343 GiB and VmPeak 1.405 GiB sit inside 1.28–1.41 GiB; read as decimal GB the VmPeak (1.51 GB) exceeds the stated upper bound.
13. "at 1600 MiB the allocation fails in-process (`ERR_MEMORY_ALLOCATION_FAILED`, exit 1)" — CONFIRMED (case G).
14. "Control N=16 MiB: OK under the heap cap and the cgroup" — CONFIRMED (case B; also I2 at 1600 MiB; at 768 MiB even the control dies, which is the limit's property, stated in 11).
15. "RLIMIT_AS bounds address space, not resident memory, so it is a poor cap for node" — CONFIRMED: 768 MiB refuses to start, 1600 MiB fails the malloc cooperatively (exit 1, no kill signal), while an uncapped run holds 512 MiB RSS under a 64 MB heap cap.
16. decision row guard shape "`systemd-run --user --scope -p MemoryMax=<cap> -p MemorySwapMax=0 -p TasksMax=<n>` … with `timeout -s KILL`" — CONFIRMED (case L: exact flag set accepted, exit 137, oom-kill, 256M peak).
17. decision row "a cgroup cap, never a V8 heap flag or RLIMIT_AS alone; exit 137 / `oom-kill` read as a bounded failure" — CONFIRMED (E vs C/L; G is a cooperative exit 1, not a bounded kill).
18. decision row "a native allocation (Buffer, child process) passing a heap cap" — CONFIRMED for the Buffer half (512 MiB under a 64 MB heap cap).
19. decision row "(round 44: 6 GiB under a 256 MB heap cap)" — NOT-REPRODUCED: a round-44 census figure; this demo produces no such run, and I ran none.

Score: 17 CONFIRMED, 1 PARTIAL (statement 11, command text), 1 NOT-REPRODUCED (statement 19, out of this demo's reach), 0 REFUTED.

## Demo script (verbatim, fenced)

```bash
#!/usr/bin/env bash
# Demo v4 — my own script, written from the item description only.
#
# Claim M6: a V8 heap cap (--max-old-space-size) does NOT bound native (Buffer) memory;
# a cgroup (systemd-run --user --scope -p MemoryMax=) OOM-kills it.
#
# Cases A..D and J run inside the SAME inner scope:
#   systemd-run --user --scope --quiet -p MemoryMax=256M -p MemorySwapMax=0 <cmd>
#   A do-nothing       : nothing allocated                   -> expect exit 0   (do-nothing control)
#   B control 16M      : 16 MiB Buffer touched               -> expect exit 0   (size control)
#   C buffer 512M (x3) : 512 MiB Buffer touched              -> expect exit 137, unit Result=oom-kill
#   D heap 1MiB strs   : 1 MiB JS strings, same flag         -> expect exit 134, "Reached heap limit"
#   J heap 2e6 strings : 2,000,000 small JS strings          -> expect exit 134 (checked statement)
# Case E: NO inner cgroup cap (outer wrapper scope MemoryMax=1G only)
#   E buffer 512M nocap : 512 MiB Buffer touched             -> expect exit 0, ALLOC_OK 512
# Cases F..I: RLIMIT_AS variants of the same 512 MiB allocation (no inner cgroup cap)
#   F prlimit --as=805306368  (768 MiB)  -> node dies at startup (CodeRange reserve), exit 133
#   G prlimit --as=1677721600 (1600 MiB) -> in-process ERR_MEMORY_ALLOCATION_FAILED, exit 1
#   H prlimit --as=768M (literal suffix) -> prlimit parse error (checked statement wording)
#   I1/I2 16 MiB control at 768 MiB / 1600 MiB -> 768 dies at startup, 1600 prints ALLOC_OK 16
# Case K: node baseline virtual footprint (VmPeak) for the "1.28-1.41 GB" statement.
#
# Exit codes: 0 clean, 137 SIGKILL (cgroup OOM), 134 SIGABRT (V8 fatal heap OOM), 133 startup abort,
#             1 in-process error / prlimit usage error.

set -u

LOGDIR="$(cd "$(dirname "$0")" && pwd)/logs"
mkdir -p "$LOGDIR"

INNER_ARGS=(--user --scope --quiet -p MemoryMax=256M -p MemorySwapMax=0)
STAMP="$$-$(date +%s)"

# prints the cgroup memory limits actually in force for this process
CGINFO='const fs=require("fs");
const c=fs.readFileSync("/proc/self/cgroup","utf8").trim();
const rel=c.split(":").slice(2).join("/");
const base="/sys/fs/cgroup"+rel;
let mx="?",sw="?",peak="?";
try{mx=fs.readFileSync(base+"/memory.max","utf8").trim();}catch(e){}
try{sw=fs.readFileSync(base+"/memory.swap.max","utf8").trim();}catch(e){}
try{peak=fs.readFileSync(base+"/memory.peak","utf8").trim();}catch(e){}
console.log("cgroup="+rel+" memory.max="+mx+" memory.swap.max="+sw+" memory.peak="+peak);'

emit() {
  local name="$1" expect="$2" cmd="$3" log="$4" rc="$5" dur="$6" unit="$7"
  {
    echo "== case: $name"
    echo "== cmd : $cmd"
    echo "== expect: $expect"
    echo "== exit : $rc"
    echo "== dur  : ${dur}ms"
    echo "== unit-result:"
    systemctl --user show "$unit" -p Result -p OOMPolicy -p MemoryMax -p MemorySwapMax 2>&1 | sed 's/^/   /'
    echo "== output:"
    sed 's/^/   /' "$log"
  } >>"$LOGDIR/summary.txt"
}

run_inner() {
  local name="$1" expect="$2"; shift 2
  local log="$LOGDIR/${name}.log" t0 t1 rc unit
  t0=$(date +%s%N)
  systemd-run "${INNER_ARGS[@]}" --unit="a2-nmc-${STAMP}-${name}" -- "$@" >"$log" 2>&1
  rc=$?
  t1=$(date +%s%N)
  unit="a2-nmc-${STAMP}-${name}.scope"
  emit "$name" "$expect" "$*" "$log" "$rc" "$(( (t1 - t0) / 1000000 ))" "$unit"
}

run_nocap() {
  local name="$1" expect="$2"; shift 2
  local log="$LOGDIR/${name}.log" t0 t1 rc unit
  t0=$(date +%s%N)
  systemd-run --user --scope --quiet --unit="a2-nmc-${STAMP}-${name}" -- "$@" >"$log" 2>&1
  rc=$?
  t1=$(date +%s%N)
  unit="a2-nmc-${STAMP}-${name}.scope"
  emit "$name" "$expect" "$*" "$log" "$rc" "$(( (t1 - t0) / 1000000 ))" "$unit"
}

: >"$LOGDIR/summary.txt"

echo "### host: node $(node --version) / $(systemd-run --version | head -1) / prlimit $(prlimit --version) / kernel $(uname -r) / $(uname -m)"
echo "### node binary: $(command -v node)"

ALLOC512='const n = 512*1024*1024;
const b = Buffer.allocUnsafe(n);
b.fill(0x5a);
console.log("ALLOC_OK " + (b.length/1048576) + " arrayBuffers=" + Math.round(process.memoryUsage().arrayBuffers/1048576) + "MB heapUsed=" + (process.memoryUsage().heapUsed/1048576).toFixed(1) + "MB rss=" + Math.round(process.memoryUsage().rss/1048576) + "MiB");'
ALLOC16='const n = 16*1024*1024;
const b = Buffer.allocUnsafe(n);
b.fill(0x5a);
console.log("ALLOC_OK " + (b.length/1048576) + " arrayBuffers=" + Math.round(process.memoryUsage().arrayBuffers/1048576) + "MB heapUsed=" + (process.memoryUsage().heapUsed/1048576).toFixed(1) + "MB rss=" + Math.round(process.memoryUsage().rss/1048576) + "MiB");'

# --- inner cgroup cap: 256M, no swap -------------------------------------------------
run_inner A_do_nothing "exit 0, no OOM" node --max-old-space-size=64 -e "
  $CGINFO
  console.log('do-nothing: rss_MiB=' + Math.round(process.memoryUsage().rss/1048576));
"

run_inner B_ctrl_16M "exit 0, no OOM" node --max-old-space-size=64 -e "
  $CGINFO
  $ALLOC16
"

for i in 1 2 3; do
  run_inner C_buffer_512M_run$i "exit 137 (cgroup OOM kill), unit Result=oom-kill" node --max-old-space-size=64 -e "
  $CGINFO
  $ALLOC512
  "
done

run_inner D_heap_strings "exit 134 (V8 heap OOM) => --max-old-space-size=64 is in force" node --max-old-space-size=64 -e "
  $CGINFO
  const keep = [];
  for (;;) keep.push('x'.repeat(1024*1024));
"

run_inner J_heap_2e6_strings "exit 134 (V8 heap OOM) with 2,000,000 small strings" node --max-old-space-size=64 -e "
  $CGINFO
  const keep = [];
  let i = 0;
  try { for (;; i++) keep.push('s' + i); } finally { console.log('STRINGS_KEPT ' + keep.length + ' heapUsed=' + (process.memoryUsage().heapUsed/1048576).toFixed(1) + 'MB'); }
"

# --- no inner cgroup cap --------------------------------------------------------------
run_nocap E_buffer_512M_nocap "exit 0 (flag alone does NOT bound Buffer memory)" node --max-old-space-size=64 -e "
  $CGINFO
  $ALLOC512
"

# --- RLIMIT_AS variants ---------------------------------------------------------------
run_nocap F_prlimit_as_768MiB "node dies at startup (CodeRange reserve), exit 133" \
  prlimit --as=$((768*1024*1024)) -- node --max-old-space-size=64 -e "$ALLOC512"

run_nocap G_prlimit_as_1600MiB "in-process allocation failure, exit 1" \
  prlimit --as=$((1600*1024*1024)) -- node --max-old-space-size=64 -e "$ALLOC512"

run_nocap H_prlimit_as_768M_literal "prlimit rejects the literal 768M suffix (checked wording)" \
  prlimit --as=768M -- node --max-old-space-size=64 -e "$ALLOC512"

run_nocap I1_prlimit_768MiB_ctrl16 "node dies at startup even for the 16 MiB control" \
  prlimit --as=$((768*1024*1024)) -- node --max-old-space-size=64 -e "$ALLOC16"

run_nocap I2_prlimit_1600MiB_ctrl16 "exit 0, ALLOC_OK 16" \
  prlimit --as=$((1600*1024*1024)) -- node --max-old-space-size=64 -e "$ALLOC16"

# --- node baseline virtual footprint ---------------------------------------------------
run_nocap K_node_baseline_vmpeak "VmPeak of node at startup" node --max-old-space-size=64 -e "
  const fs=require('fs');
  const st=fs.readFileSync('/proc/self/status','utf8');
  for (const k of ['VmPeak','VmSize','VmRSS']) {
    const m=st.match(new RegExp('^'+k+':\\\\s+(.*)$','m'));
    if (m) console.log(k + ' ' + m[1].trim());
  }
"

echo "### summary:"
cat "$LOGDIR/summary.txt"

echo "### user journal evidence (unit names a2-nmc-${STAMP}-*):"
journalctl --user --no-pager --since "-15 min" 2>/dev/null | grep -E "a2-nmc-${STAMP}|oom-kill|kernel OOM" | tail -30 || echo "(journal unavailable)"

echo "### done"
```

## Output (excerpt of `run-v4.out`, verbatim)

```
### host: node v24.21.0 / systemd 262 (262-1-arch) / prlimit prlimit from util-linux 2.42.4 / kernel 7.2.11-arch1-1 / x86_64
== case: A_do_nothing
== exit : 0
   Result=success
   cgroup=/user.slice/…/a2-nmc-69307-1792733886-A_do_nothing.scope memory.max=268435456 memory.swap.max=0 memory.peak=11165696
   do-nothing: rss_MiB=44
== case: B_ctrl_16M
== exit : 0
   ALLOC_OK 16 arrayBuffers=16MB heapUsed=4.2MB rss=61MiB
== case: C_buffer_512M_run1
== exit : 137
   Result=oom-kill
   MemoryMax=268435456
   MemorySwapMax=0
   cgroup=/user.slice/…/a2-nmc-69307-1792733886-C_buffer_512M_run1.scope memory.max=268435456 memory.swap.max=0 memory.peak=10960896
== case: D_heap_strings
== exit : 134
   FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
== case: E_buffer_512M_nocap
== exit : 0
   cgroup=/user.slice/…/a2-nmc-69307-1792733886-E_buffer_512M_nocap.scope memory.max=max memory.swap.max=max memory.peak=12738560
   ALLOC_OK 512 arrayBuffers=512MB heapUsed=3.9MB rss=559MiB
== case: F_prlimit_as_768MiB
== exit : 133
   # Fatal process out of memory: Failed to reserve virtual memory for CodeRange
== case: G_prlimit_as_1600MiB
== exit : 1
   RangeError: Failed to allocate memory
     code: 'ERR_MEMORY_ALLOCATION_FAILED'
== case: H_prlimit_as_768M_literal
== exit : 1
   prlimit: failed to parse AS limit
== case: I1_prlimit_768MiB_ctrl16
== exit : 133
   # Fatal process out of memory: Failed to reserve virtual memory for CodeRange
== case: I2_prlimit_1600MiB_ctrl16
== exit : 0
   ALLOC_OK 16 arrayBuffers=16MB heapUsed=3.9MB rss=59MiB
== case: K_node_baseline_vmpeak
== exit : 0
   VmPeak 1473452 kB
   VmSize 1407916 kB
   VmRSS 45236 kB
```

## Risks and notes

- One wording defect for the L1 before the entry commit: M6 writes the RLIMIT_AS command as `prlimit --as=768M`; prlimit
  2.42.4 rejects that suffix (exit 1, `failed to parse AS limit`). The mechanism is right, the command text is not:
  either write `--as=805306368` / `--as=$((768*1024*1024))` or state "768 MiB of address space".
- "1.28-1.41 GB" is only true if read as GiB; VmPeak measured 1.41 GiB equals 1.51 GB decimal. Suggest "1.34-1.41 GiB".
- Statement 19 ("round 44: 6 GiB under a 256 MB heap cap") is inherited from round 44; this demo cannot and did not
  reproduce it. If the entry keeps it, it needs its own locator.
- Scope: this seat judges no entry text, adds no row and writes no lane file but this report. It does not attest the
  S072/S073 quotes (source re-open is another seat's item).

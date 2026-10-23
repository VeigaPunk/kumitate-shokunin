RESULT ReRunCounters rev=980a16af verdict=agrees o1=3/3 o2=6/6,6/6,6/6 base_o1=0/3

# ReRunCounters — residual falsify seat: independent re-derivation of the frozen O1/O2 counters at the C1 commit

Claim measured: C1 at 980a16afc7caafe4e924ef117692248fdc7acbd6 (O1 CANARY_HELD 3/3 AND O2 CAP_HELD 6/6, plan.md as amended through A4). My item: re-run both frozen counters independently; confirm the counter files are byte-identical to the frozen commits; run O1 at base; report disagreements with the L1 receipts as findings.

## 1. Counter identity (byte-identical to frozen commit e0c1878)

sha256 of the probe files in the lane working tree (at C1) vs `git show e0c1878577918e62844ba0f84dac2e09a8e61d85:.ufo/waves/round-46/probe/<file>`:

- `probe/gitenv-canary.sh`  b990282f7cbc6d25a9aa7901afd21bff9e4d2fbbaaff5b472e6f98f0a2b78b27 (working tree == e0c1878)
- `probe/caprun-probe.mjs`  88b0fa76ef4cf3e82580cf28fffcc2e991db6f19a551beed69c8bf3858cdc538 (working tree == e0c1878)

Revision resolution at the lane: `git rev-parse --verify 980a16af…^{commit}` = 980a16afc7caafe4e924ef117692248fdc7acbd6; `2b2bf7bb…^{commit}` = 2b2bf7bbdedaff3f0c749a8703002bebb104d15c; `e0c1878…^{commit}` = e0c1878577918e62844ba0f84dac2e09a8e61d85.

## 2. O1 at the C1 commit (once)

Command:
```
env -u GIT_DIR -u GIT_WORK_TREE -u GIT_INDEX_FILE -u GIT_OBJECT_DIRECTORY -u GIT_COMMON_DIR -u GIT_CEILING_DIRECTORIES \
  SCRATCH_ROOT=/fast/scratch/hyaku/kumitate-r46/seats/r-ReRunCounters/runs \
  systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=256 timeout -s KILL 900 \
  bash /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-46/probe/gitenv-canary.sh \
  /home/vgpnk/Projects/shokunin/kumitate-shokunin 980a16afc7caafe4e924ef117692248fdc7acbd6
```
Output (every line, verbatim):
```
TOOL cite-check CANARY_HELD clean:cases=76,git=114 base:cases=75 A:cases=76,git=114 B:cases=76,git=114 F:exit=1 FH:exit=1
TOOL proxy-check CANARY_HELD clean:cases=122,git=14 base:cases=121 A:cases=122,git=14 B:cases=122,git=14 F:exit=1 FH:exit=1
TOOL round-gate CANARY_HELD clean:cases=61,git=888 base:cases=60 A:cases=61,git=888 B:cases=61,git=888 F:exit=1 FH:exit=1
GITENV_CANARY rev=980a16afc7caafe4e924ef117692248fdc7acbd6 held=3/3
GITENV_RUN_EXIT=0
```
Matches L1 receipt `close/o1-c1.txt` line-for-line (same per-tool counts, same held=3/3, same exit 0).

## 3. O2 at the C1 commit (three times)

Command (identical for all three runs, only the run index differs):
```
env -u GIT_DIR -u GIT_WORK_TREE -u GIT_INDEX_FILE -u GIT_OBJECT_DIRECTORY -u GIT_COMMON_DIR \
  SCRATCH_ROOT=/fast/scratch/hyaku/kumitate-r46/seats/r-ReRunCounters/runs \
  systemd-run --user --scope --quiet -p MemoryMax=8G -p TasksMax=1024 timeout -s KILL 1800 \
  node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-46/probe/caprun-probe.mjs \
  /home/vgpnk/Projects/shokunin/kumitate-shokunin 980a16afc7caafe4e924ef117692248fdc7acbd6
```
Run 1 output:
```
PARAMS M=134 maxAllocs=9 B=2
CASE K1 CAP_HELD
CASE K2 CAP_HELD
CASE K3 CAP_HELD
CASE K4 CAP_HELD
CASE K5 CAP_HELD
CASE K6 CAP_HELD
CAPRUN_PROBE rev=980a16afc7caafe4e924ef117692248fdc7acbd6 held=6/6
CAPRUN_RUN1_EXIT=0
```
Run 2 output:
```
PARAMS M=134 maxAllocs=9 B=3
CASE K1 CAP_HELD
CASE K2 CAP_HELD
CASE K3 CAP_HELD
CASE K4 CAP_HELD
CASE K5 CAP_HELD
CASE K6 CAP_HELD
CAPRUN_PROBE rev=980a16afc7caafe4e924ef117692248fdc7acbd6 held=6/6
CAPRUN_RUN2_EXIT=0
```
Run 3 output:
```
PARAMS M=169 maxAllocs=11 B=4
CASE K1 CAP_HELD
CASE K2 CAP_HELD
CASE K3 CAP_HELD
CASE K4 CAP_HELD
CASE K5 CAP_HELD
CASE K6 CAP_HELD
CAPRUN_PROBE rev=980a16afc7caafe4e924ef117692248fdc7acbd6 held=6/6
CAPRUN_RUN3_EXIT=0
```
All three runs: 6/6, exit 0. PARAMS (M, B) differ per run as designed (probe draws them at random; A1). Held count matches L1 receipt `close/o2-c1.txt` (held=6/6, exit 0).

## 4. O1 at the base 2b2bf7bb (once)

Command: same as §2 with rev 2b2bf7bbdedaff3f0c749a8703002bebb104d15c.
Output:
```
TOOL cite-check NOT_HELD(A_repo_changed=4,A_git_launches=108/111,A_git_saw_vars=108,B_repo_changed=2,B_git_launches=108/111,B_git_saw_vars=108) clean:cases=75,git=111 base:cases=75 A:cases=75,git=108 B:cases=75,git=108 F:exit=1 FH:exit=1
TOOL proxy-check NOT_HELD(A_exit=1,A_repo_changed=22,A_caseset_differs=4,A_git_saw_vars=12,B_exit=1,B_repo_changed=14,B_caseset_differs=4,B_git_saw_vars=12) clean:cases=121,git=12 base:cases=121 A:cases=117,git=12 B:cases=117,git=12 F:exit=1 FH:exit=1
TOOL round-gate NOT_HELD(A_exit=1,A_repo_changed=4,A_caseset_differs=60,A_git_launches=3/886,A_git_saw_vars=3,B_exit=1,B_repo_changed=4,B_caseset_differs=60,B_git_launches=3/886,B_git_saw_vars=3) clean:cases=60,git=886 base:cases=60 A:cases=0,git=3 B:cases=0,git=3 F:exit=1 FH:exit=1
GITENV_CANARY rev=2b2bf7bbdedaff3f0c749a8703002bebb104d15c held=0/3
GITENV_BASE_EXIT=1
```
held=0/3, exit 1 — consistent with the plan's base do-nothing expectation (receipt `receipts/c1-base.txt` also held=0/3; the receipt's older-format lines differ cosmetically because A2 re-worded the counter's reason strings, not the outcome).

## 5. Findings

No disagreement with the L1 receipts (o1-c1.txt, o2-c1.txt) or with the base controls. Independent re-derivation reproduces O1=3/3 and O2=6/6 at the C1 commit, and O1=0/3 at base.

## 6. Residual risk and verification gaps

- This seat re-ran the frozen counters only; it did not mutate the candidate or the counters, and did not independently read the C1 diff (the plan's named residual "C1 diff read by a non-author" is a different seat's item).
- The counters are the committed canonical judges; my runs exercised the same code paths the L1 ran, with randomized PARAMS and temp paths, so the runs are independent observations of the same frozen logic.
- O2's K1–K6 are a behaviour sample, not an enumeration of every descendant/signal/task-limit path (plan.md A2 residual); no falsifying counter-example surfaced in three runs.
- Host safety was respected: every counter ran under the given `systemd-run --user --scope` bounds (O1: MemoryMax=4G/TasksMax=256/timeout 900; O2 ×3: MemoryMax=8G/TasksMax=1024/timeout 1800); scratch confined to /fast/scratch/hyaku/kumitate-r46/seats/r-ReRunCounters/runs; `pgrep -f r-ReRunCounters` after all runs = none, and the runs dir is empty (temp dirs cleaned by the counters); `df -h /fast` unchanged at 180G avail.

## 7. Tooling record

No tools installed or updated (no pacman/uv/npm/cargo action taken); the runs used the system `bash`, `node` (v24.21.0 via fnm), `systemd-run`, `git`, `timeout` already present.

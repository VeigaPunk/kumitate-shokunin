VERDICT: Q58 (`scripts/plan-before-ready.sh`) at measured integration rev a9531c8 passes round 63 and all three adversarial fixtures behave per the documented exit map — nested marker before the plan is correctly ignored (NA/2), same-commit PASSes (0), plan delete/re-add after the marker still PASSes via oldest-add semantics (0), and the script is read-only on the lane.

## Evidence

All runs at `a9531c8e617338fd16cb69c61344ef8f17711117` (committed bytes; worktree equals it except L1-owned untracked w2 files). Transcripts: `build/K63R2ExecPlanBeforeReady/q58-main-out.txt`, `fixtures-out.txt`.

```
$ bash scripts/plan-before-ready.sh --round 63 --rev a9531c8e617338fd16cb69c61344ef8f17711117
PLAN_BEFORE_READY: PASS rev=a9531c8e617338fd16cb69c61344ef8f17711117 round=63 dir=.ufo/waves/round-63 plan=b38a2065ab8ac5b198f6569b9013d04411c3d40d plan_ct=1792961253 marker=05b3176915de4175bb211b4b1422d8e56cf16888 marker_kind=ready marker_ct=1792964033 marker_path=.ufo/waves/round-63/w1.ready
PLAN_BEFORE_READY_SUMMARY: pass=1 fail=0 na=0 rounds=63-63 ... exit=0 failed= na_rounds=
rc=0
```
PASS as expected: plan.md added at b38a206 (ct 1792961253) is ancestor-or-equal of the first committed marker (w1.ready added at 05b3176, ct 1792964033).

```
$ bash scripts/plan-before-ready.sh --rounds 41-63 --rev a9531c8e617338fd16cb69c61344ef8f17711117
PLAN_BEFORE_READY_SUMMARY: pass=12 fail=1 na=10 rounds=41-63 ... exit=1 failed=62 na_rounds=49,52,53,54,55,56,57,58,59,60
rc=1
$ bash scripts/plan-before-ready.sh --all --rev a9531c8e617338fd16cb69c61344ef8f17711117
PLAN_BEFORE_READY_SUMMARY: pass=12 fail=7 na=10 rounds=all(29) ... exit=1 failed=35,36,37,38,39,40,62 na_rounds=49,52,53,54,55,56,57,58,59,60
rc=1
$ bash scripts/plan-before-ready.sh --selftest
PLAN_BEFORE_READY_SELFTEST: PASS (10/10) fixtures=/tmp/pbr-selftest.SFOBbQ
rc=0
```
Exit map holds: single-round 0/1/2; batch = 1 if any FAIL (verified: rounds 41-63 and --all both exit 1 with `failed=` named), else 2 if any NA, else 0. Round 62 reads FAIL `NO_PLAN` (exit 1) exactly as the mined-mistake criterion intends.

Adversarial fixtures (each `D=$(mktemp -d) && git -C "$D" init -q`, toplevel verified before first commit, commits only inside `$D`; `D=/tmp/tmp.S7lFksbD5u`):

```
(a) nested marker BEFORE plan: commit1 adds .ufo/waves/round-9/controls/inline/honest/lane/.ufo/waves/round-7/w1.ready, commit2 adds plan.md
PLAN_BEFORE_READY: NA rev=34b659627c33bb091cbb34bde2d0961bf63e3df8 round=9 ... reason=NO_MARKER plan=34b6596... plan_ct=1000000100 marker=- ... exit=2 · rc=2
(b) plan + marker in one commit (plan.md + w1.ready)
PLAN_BEFORE_READY: PASS rev=74ce0a2db7f722ad2f61ba43ad27c4500743d81a round=9 ... plan=74ce0a2... marker=74ce0a2... marker_kind=ready marker_ct=1000000000 marker_path=.ufo/waves/round-9/w1.ready ... exit=0 · rc=0
(c) plan added (ct 1e9), marker added (ct 1e9+100), plan deleted, plan re-added (ct 1e9+300)
PLAN_BEFORE_READY: PASS rev=4f9a6e748eb0c27f8dd6bd0a3ebb2664a57f60a0 round=9 ... plan=b3d14dc6368b09b0fc7451b3efde51e2d840dfc7 plan_ct=1000000000 marker=eb8c9bee6a1101ae68fddff60fa9bda35714aa46 marker_kind=ready marker_ct=1000000100 ... exit=0 · rc=0
  (git log --oneline -- .ufo/waves/round-9/plan.md → b3d14dc "plan" is the OLDEST add; re-add 4f9a6e7 not treated as the plan commit)
```

Pathspec hazard closure (independently reproduced on fixture (a)):

```
$ git -C $D/a log --full-history --diff-filter=A --format='%H %ct %s' -- '.ufo/waves/round-9/*.ready'
7dee78e94e790a2888f9f5b61b38cf92a13ed6e7 1000000000 nested      # naive (unmagicked) path finds the nested fixture marker
$ git -C $D/a log --full-history --diff-filter=A --format='%H %ct %s' -- ':(glob).ufo/waves/round-9/*.ready'   # -> empty, no match
```

Read-only confirmation: every `git` invocation in `scripts/plan-before-ready.sh` — `log --full-history --diff-filter=A` (line 96), `show --diff-filter=A` (102), `merge-base --is-ancestor` (161), `rev-parse --show-toplevel/--verify` (297, 302), `ls-tree` (310) — is a read verb against `--repo`/the lane. The only write verbs (`init`, `add`, `commit`, lines 187-198) execute strictly inside `run_selftest`'s own fresh `mktemp` fixtures, never against the lane or any `--repo`. No `checkout/reset/push/pull/stash/rm/mv/switch/restore` anywhere. Repeated runs left the lane `git status --porcelain` unchanged (only the L1's pre-existing untracked w2 files). Integrated `scripts/plan-before-ready.sh` is byte-identical (`diff -q` → IDENTICAL) to wave-1's build draft `build/K63ExecQualityCommand/plan-before-ready.sh`, landed in commit 05b3176.

## Findings

1. **K63R2ExecPlanBeforeReady-1 — low — nested-marker hazard is closed in the "nested BEFORE plan" ordering too.** Wave-1's selftest case 8 covered nested marker *after* plan; the assignment's exact scenario (nested marker committed *before* plan) yields `NA reason=NO_MARKER` exit 2, not a false PASS. The `:(glob)` pathspec is load-bearing: the unmagicked pathspec finds the fixture marker (`7dee78e`), the script's does not. Repro: `bash scripts/plan-before-ready.sh --repo /tmp/tmp.S7lFksbD5u/a --round 9` (rc=2).

2. **K63R2ExecPlanBeforeReady-2 — low — deleting the plan after the marker is not an escape; re-adding is not an escape either.** Plan add → marker → plan delete → plan re-add still reads PASS with `plan=b3d14dc` (the oldest add, ct 1e9 ≤ marker ct 1e9+100). Both `--full-history` oldest-add selection and the ancestry arm are satisfied; the criterion's "committed before" is about existence of an add before the marker, not final-state presence. This is consistent with the stated rule (and mirrors wave-1 F6 on the marker side); the only escape remains history rewrite or forged committer time (lane-controlled, already flagged in wave-1 F6). Repro: `bash scripts/plan-before-ready.sh --repo /tmp/tmp.S7lFksbD5u/c --round 9` (rc=0).

3. **K63R2ExecPlanBeforeReady-3 — info — integration fidelity confirmed.** The integrated script equals the wave-1 draft byte-for-byte; Q58's 10/10 selftest reruns clean at the measured rev; round 63 is now a real PASS on committed bytes (wave-1 F2's "NA at HEAD" is resolved by the L1's 05b3176 marker commit).

## Artifacts

- `build/K63R2ExecPlanBeforeReady/q58-main-out.txt` — verbatim outputs of `--round 63`, `--rounds 41-63`, `--all`, `--selftest` (all `rc=` lines).
- `build/K63R2ExecPlanBeforeReady/fixtures-out.txt` — verbatim outputs of the three adversarial fixtures with `rc=` lines.
- Scratch fixtures: `/tmp/tmp.S7lFksbD5u/{a,b,c}` (reusable for repro; commit history per fixture in `fixtures-out.txt`).

## Limits

- Not tested: `--earliest-marker`, `--quiet` output/rc behavior, non-linear (merge) history in fixtures, and `--rev` pointing at a revision predating a round dir. These are documented options or out of scope, not exercised.
- No history rewrite or committer-time forgery was attempted in the lane (both would be tampering, not a script defect; wave-1 F6 already flags rewrite as the residual escape).
- `--all` sees 29 `round-*` dirs at a9531c8; earlier waves outside `.ufo/waves` are not judged (unchanged from wave-1).
- I did not touch the script, controls, probes, or any L1-owned path; no tool was installed (no channel record needed).

# kumitate — round 47 report (attempt 1, L1 KumitateR47)

## Work performed

Declared claim (one; plan `.ufo/waves/round-47/plan.md`, freeze `cac43009`, A1 `796b49b4`, A2 `8de35e79`): **C1 — operability** (the lowest non-retired axis, at 9). Surface: five child-process sites, routed through the runner `scripts/cap-run.mjs` (contract `kumitate-cap-run-v2`) by the new helper `scripts/cap-spawn.mjs`. The sites are K488 `kimi-census.mjs` `runGate`, SC549 `sources-check.mjs` `runTool`, SC859 the sources-check parity spawn, CC879 `claims-check.mjs` `runClaims` and AT802 the `anchor-truth.mjs` selftest `tool()`. Counter: `probe/caproute-probe.mjs`, which reads strace's execve/clone records from outside the gate (label `ROUTED_HELD`).

- **Prerequisite (freeze commit `cac43009`).** Runner v2 adds `--bind` and `--verdict-file`. It also fixes R46-5: the verdict is written with `fs.writeSync` (S094), and the budget rule is now documented. The freeze commit also adds the helper `cap-spawn.mjs`.
- **Pre-data control wave (wave 1, 44 seats).** Twelve control seats built controls and scored them; all read 0/5 (`build/Ctl*.md` / `.patch`). Two more controls, built by the L1, met the counter in force at the time:
  - CtlEnvCaps moved the caps into env assignments. It read **5/5** under the freeze rule (`probe/receipts/ctl-envcaps-frozen.txt`), which led to A1.
  - CtlRetParse put a `') = 7 x'` argument on an exec. It read **5/5** under A1 (`a1-ctl-retparse2.txt`), which led to A2.
  - Every control was re-scored under A2: all read 0/5 (`probe/receipts/a2-controls.txt`).
- **Candidate.** Four executors built the routes (`build/ExecRoute*.patch`). The L1 integrated them and hardened the runner (ReviewCapRunV2 F1/L1/L2, SentinelCapSpawn 1–2), all in C1 commit `269dadb6`. The candidate was scored only after A2.
- **Repairs.**
  - R46-1: the 13 rows were restored, with supersedes rows S080–S092, plus Q35 and `quality/q35-append-only.sh`.
  - R46-2: an appended `## Round 46 correction` in SCORECARD.
  - R46-3: checklist lines now carry `wall=`, `load1=` and FAIL tails (ExecChecklistTail). Item 697 was root-caused as wall-clock `unstable`/`timeout` classes, the same at base and freeze (ExecLoad697, RevGateMutants697).
  - R46-4: patch series in `repairs/r46-controls/`; 4/4 trees reproduced (ReviewR46Patches).
  - R46-5: covered by the freeze commit (above).
- **Falsify wave (34 seats).** Results:
  - Three seats re-ran the counter on `269dadb6` as mutation baselines. They read **3/5, 3/5 and 4/5** (IRC messages from MutRouteAT802, MutRouteK488 and MutRouteCC879; quoted in `corpus/lessons/round-47.md` § Verdict at close).
  - Two re-open defects were corrected by appended rows: S096 supersedes S083 (wrong locators), and S097 supersedes S085 (truncated hash).
  - Sound with no defects: ReviewRouteKimi, ReviewRouteAnchor, ReviewSurfaceProbeTail and ReviewSourcesRestore.
  - CritChronology found no candidate score before A2 and raised 2 static objections.
  - MutQ35 killed 3/5 mutants with the committed receipts.

## Landed changes

All lane commits landed through `jj-lane.sh`. The LOG.md round-47 entry is in `67ebb32d`.

| Commit | What it carries |
|---|---|
| `cac43009` | freeze: plan, counter, base and calibration receipts, runner v2, cap-spawn |
| `796b49b4` | A1 counter amendment plus the CtlEnvCaps receipts |
| `68aa4336` | wave-1 reports and patches; A1 control re-score |
| `269dadb6` | C1 commit: five routes, runner hardening, surface-probe tails, SOURCES restore plus S080–S095, Q35, README rows, lesson, proxy re-pins (A=25, C2=106, `pin.cap-spawn`) |
| `8de35e79` | A2 counter amendment plus the CtlRetParse receipts |
| `47e386fc` | A2 re-score of every control; Q35 receipt |
| `f399fc60` | C1 measurement `close/c1-a2.txt`; wave-2 spec |
| `67ebb32d` | record: SCORECARD, LOG, S096/S097, lesson verdict, wave-2 reports, close receipts |
| `e42eba65` | late wave-1 report ReviewCounter |

Lane tip: **`e42eba65e72c3cb3b7b1f50c3caedb1d4df86910`**.

## Before → after measurements

| Claim | Counter | Before | After (`269dadb6`) |
|---|---|---|---|
| C1 | `node .ufo/waves/round-47/probe/caproute-probe.mjs <lane> <rev>` (A2) | `held=0/5` at `0bd8be60` and `cac43009` | L1: `held=5/5 rule=A2` exit 0 (AT802 counted 104 execs against 106 at base). Re-runs: 3/5, 3/5, 4/5 → **not reproducible** |

Harm checks:
- `proxy-check --strict` reads MATCH (`close/proxy-strict.txt`).
- The sources census exits 0 (`close/census-close.txt`).
- The four routed selftests pass with the base case totals: 54, 46, 47 and 44.
- The `cap-run` selftest passes 12/12.
- The HarmChecklists and HarmGates seats were cancelled. No checklist-harness harm run exists for `269dadb6`.

## Sources & frontier

- **Census.** `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate`:
  - Open: exit 0, with warnings W04 S034 and W04 S068 (`open/census.txt`).
  - Close: exit 0, with warnings W04 S034, S068, S084 and S095 (`close/census-close.txt`).
- **Rows.** The row count (`grep -cE '^\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|'`) goes from 79 to 97.
  - 15 supersedes rows: S080–S092 (R46-1), plus S096 and S097.
  - 3 new tier-A rows: S093 strace, S094 Node process I/O, S095 bwrap.
- **Rows touched.** The immutable cells of the 13 rows were restored to their `2b2bf7bb` bytes. No status, recheck or used-by cell changed.
- **Sourced claim.** C1 cites S093, S094 and S095.
- **Mistakes mined** (`corpus/lessons/round-47.md` § Mistakes):
  1. In-place corrections → Q35, shown to fail: 13 rows rewritten on `2b2bf7bb..9b33e03e`.
  2. A token-presence counter → A1, shown to fail: CtlEnvCaps went 5/5 → 0/5.
  3. An observer scored once → repeat-run rule proposed, which would fail on the n=104 run.
- **Errata for the round-46 report**, appended and not rewritten: the row count is 13, not 15; item 697 failed 4 of 4 runs, not 3 of 4; the open census also carried W04 S034.

## Trend verdicts

- **expansion — improved.** Three new tier-A rows. Runner contract v2. Five gate sites now launch their children through the runner.
- **quality — improved.** The 13 round-46 rewrites are restored. All 16 new rows were re-opened by non-authors, 12 of them with reports. Two defects were found and corrected by appended rows. Q35 was added.
- **discernment — unprovable-but-better: requested.**
  - Two counter shortcuts were caught before data.
  - Non-author re-runs exposed a counter result the author's single run had passed.
  - C1 itself does not verify.

## SHONEN

- [~] SKILL.md contains real decision tables, error patterns, checklists, cited sources — nothing in SKILL.md changed this round; runner contract v2 is in `scripts/cap-run.mjs:10-23` (`269dadb6`)
- [~] At least one end-to-end domain task executed and logged in LOG.md — LOG.md round-47 entry (`67ebb32d`); receipts in `.ufo/waves/round-47/close/`
- [ ] Instructions executable by an agent without oral context
- [ ] No cross-domain bleed (PROVINCE.md still accurate)

## Gate

Real rejects:
- **Freeze counter.** Rejected after CtlEnvCaps met it 5/5.
- **A1 counter.** Rejected after CtlRetParse met it 5/5.
- **S083.** Its locators were rejected: lines 61/202/207 hold other code. S096 supersedes it.
- **S085.** Its 63-character hash was rejected. S097 supersedes it.
- **C1.** Its claimed 5/5 was not reproduced by three non-author re-runs.

## Round shape and seats

- **Shape.** Default: two v1 waves. Wave `build` had 44 seats, wave `falsify` had 34, so the round total is 78. There was no residual call.
- **Wave 1 roles.** Scribe 17, mutation-tester 10, executor 9, reviewer 3, revenger 1, scout 1, connector 1, critic 1, sentinel 1.
- **Wave 2 roles.** Reviewer 23, mutation-tester 8, executor 2, critic 1.
- **Planner seat.** The L1 held the §3 planner seat. The validator's `taskCall` was sent unchanged apart from the `solutionSpace` field.
- **Dead seats.** None.
- **Cancelled at the budget stop.** 16 wave-2 seats were cancelled: ReRunCounter, five MutRoute* seats, MutCapRunV2, ReviewRouteSources, ReviewRouteClaims, ReviewCounterA2, HarmChecklists, HarmGates, and ReopenS084/S088/S091/S092. Their reports are not cited; only the IRC baseline readings are quoted.
- **Misroot sweep.** No kumitate-written files at the fleet root. One stray L1 file at the lane root was removed before commit.
- **Stale-lane.** Respawn-per-round driver; no other mission of this lane is open.
- **Tool installs.** None. All pacman transactions are paused host-wide.
- **L0 questions.** None.

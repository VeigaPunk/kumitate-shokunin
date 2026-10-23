# H1Tip — checklist harness at the C1 commit (residual falsify, round 48)

**Verdict: NO HARM under harm rule H1.** No item passes in both base runs and fails in any
tip run. Zero pass→fail flips across all 22 items; the only status change in either tip run
is item 697 flipping fail→pass (recorded below, not harm under H1's frozen rule).

## What ran

- Command: `node scripts/surface-probe.mjs --checklists`, TWO sequential runs, cwd = repo
  root of the sandbox clone (the harness runs each SKILL.md item with cwd = `--self`, which
  defaults to the root containing the script).
- Clone: `git clone --no-hardlinks /home/vgpnk/Projects/shokunin/kumitate-shokunin`
  → `/fast/scratch/hyaku/kumitate-r48b/seats/H1Tip/clone`, then
  `git checkout --detach ce9aee5daf71004a5890134f9526cc6fe424b206`. HEAD re-read after
  checkout: `ce9aee5daf71004a5890134f9526cc6fe424b206`; working tree clean
  (`status --porcelain --untracked-files=no` → 0 lines). Nothing bound or mounted; no writes
  to the lane repo outside this item's `close/` files.
- Environment per command: `GIT_DIR`, `GIT_WORK_TREE`, `GIT_INDEX_FILE` unset; `TMPDIR=/tmp`;
  node v24.21.0. Lane commit metadata: subject `round-48: C1+C2 candidate …`, dated
  2026-10-23 15:52:45 -0300 (the lane tip the L1 integrated).
- Timing (UTC, shell-observed): run 1 ended 19:03:04Z, wall 157.55 s, shell exit **1**;
  run 2 ended 19:05:15Z, wall 127.10 s, shell exit **1**. Both runs print
  `CHECKLIST: 19/22 pass` + `VERDICT: FAIL`. Start times were not separately stamped;
  derived starts (from harness wall times) ≈ 19:00:26Z and 19:03:08Z.
- `load1` per item is recorded by the harness itself on every `CHECKLIST` line
  (`load1=` column) and is preserved verbatim in the receipts. Ambient load1 during the tip
  runs: 27–48 (run 1 items 680–697 at ≈27–28; items 698–701 at ≈48; run 2 declining
  47.8 → 38.0). Base runs ran at load1 ≈ 41–59 (base-1) and 58 → 27 (base-2 tail) — the tip
  box was not harsher than the base conditions.
- Receipts (verbatim harness stdout, byte-identical to the sandbox captures):
  - `.ufo/waves/round-48/close/H1Tip-run1.txt`
    sha256 `5be2433f5af1e1f5af86e7ed01668bd9d7c414c2251eb6264f0d4e3e5a0a349c`
  - `.ufo/waves/round-48/close/H1Tip-run2.txt`
    sha256 `9d6cfa4d0a62b1e5652b143766ea3ddf2ccf8c0f53820bacd719b3deb995f676`
- Base side (frozen, not re-run): `.ufo/waves/round-48/r48/ScribeReceipts-checklist-base-{1,2}.txt`
  — 18/22 pass, `VERDICT: FAIL`, exit 1, both runs, at base `f00cf278`.
  (Note: the base receipts carry a wrapper footer line `exit=… start=… end=… load1=…` added
  by the base seat's wrapper; my receipts are pure harness stdout and the wrapper-equivalent
  facts are recorded in this file instead.)

## Item-by-item comparison (SKILL.md:680–701; P = PASS, F = FAIL)

| line | item (short label) | base1 (load1) | base2 (load1) | tip1 (load1) | tip2 (load1) | H1 harm? |
|---|---|---|---|---|---|---|
| 680 | Citation gate verdict | P 44.49 | P 57.21 | P 28.07 | P 47.78 | — |
| 681 | Citation gate hermetic suite | P 44.49 | P 58.39 | P 28.07 | P 47.47 | — |
| 682 | Live sighting-surface conformance | P 45.09 | P 58.39 | P 28.07 | P 47.47 | — |
| 683 | Surface-probe hermetic suite | P 45.09 | P 58.39 | P 28.07 | P 47.47 | — |
| 684 | Round-gate hermetic suite | P 45.09 | P 58.68 | P 27.18 | P 47.03 | — |
| 685 | Round-close artifact audit | F 44.44 | F 59.04 | F 27.28 | F 45.92 | no (F at base) |
| 686 | Filed-report tracking | F 44.44 | F 59.04 | F 27.28 | F 45.92 | no (F at base) |
| 687 | Proxy recompute `--strict` | F 44.44 | F 59.04 | F 27.28 | F 45.92 | no (F at base) |
| 688 | Proxy-check hermetic suite | P 44.44 | P 59.04 | P 27.28 | P 45.92 | — |
| 689 | Member-claims gate | P 41.68 | P 57.81 | P 28.06 | P 44.97 | — |
| 690 | Kimi-substrate census | P 41.68 | P 57.81 | P 28.06 | P 44.97 | — |
| 691 | Sources-registry gate | P 41.68 | P 57.81 | P 28.06 | P 43.61 | — |
| 692 | Sources-check hermetic suite | P 41.68 | P 57.81 | P 28.06 | P 43.61 | — |
| 693 | Per-anchor truth burn-down | P 41.46 | P 56.79 | P 28.06 | P 43.61 | — |
| 694 | Anchor-truth hermetic suite | P 41.46 | P 56.79 | P 27.90 | P 43.61 | — |
| 695 | Wave census of round 40 payloads | P 40.89 | P 53.79 | P 27.39 | P 41.66 | — |
| 696 | Wave-census hermetic suite | P 40.89 | P 53.79 | P 27.39 | P 41.66 | — |
| 697 | Gate-mutants battery | F 41.22 (timeout, exit=null) | F 51.64 (timeout, exit=null) | P 27.39 (exit=0, wall 105.4 s) | P 40.56 (exit=0, wall 70.1 s) | no (fail→pass) |
| 698 | Gate-mutants hermetic suite | P 55.76 | P 27.41 | P 48.30 | P 38.03 | — |
| 699 | OMP agent-root census | P 55.76 | P 27.41 | P 48.27 | P 38.03 | — |
| 700 | OMP-census hermetic suite | P 55.76 | P 27.41 | P 48.27 | P 38.03 | — |
| 701 | Cap-run hermetic suite | P 55.76 | P 27.41 | P 48.27 | P 38.03 | — |

Totals: base 18/22, 18/22 · tip 19/22, 19/22 · `VERDICT: FAIL` exit 1 in all four runs.
Item statuses are byte-stable between the two tip runs.

## Observations (measured, none is H1 harm)

1. **697 fail→pass flip.** At base the gate-mutants battery hit its 120 s timeout
   (`exit=null`, `MUTANT … timeout cases=not-run`, `confirm=differs`, `unstable` lines in
   both base runs, load1 41–52); at the C1 commit it completed killed-41/41 exit 0 in both
   tip runs (105.4 s at load1 27.4; 70.1 s at load1 40.6). Harm is defined pass→fail only;
   this flip is recorded, not scored. [INFERENCE on cause: load relief — the base side never
   demonstrated the battery passing under its own runs' load; the C1 diff does not touch the
   gate-mutants surface (cite-check/wave-census mutants).]
2. **687 drift-set growth at tip** (item fails at base both runs → not H1 harm; this is H3's
   axis, not judged here). Base terms: `A_DRIFT +1`, `C2_TOTAL_DRIFT +1`, `AXES_DRIFT`. Tip
   terms: `A_DRIFT +2`, `C2_TOTAL_DRIFT +1`, `AXES_DRIFT`, `PIN_DRIFT pin.surface-probe`,
   `PIN_DRIFT pin.round-gate`, `GATE_PIN_DRIFT pin.cap-spawn`, warn
   `PIN_UNPINNED scripts/counter-rerun.mjs`. This is exactly the declared C1/C2 re-pin
   situation: the plan's attempt-2 addendum pins the stanza re-pin at close ("the pre-existing
   A_DRIFT … and C2_total +1 are the round's re-pin, not drift harm"), and the new pin drifts
   correspond one-to-one to the files the C1/C2 candidate changed (surface-probe.mjs,
   round-gate.mjs, cap-spawn.mjs, new counter-rerun.mjs).
3. **685/686 sandbox artifacts.** Identical fail-closed `REPORTS_DIR_MISSING` in all four
   runs — the item's `--reports-dir` points inside each run's own sandbox, which has no
   `.ufo/reports`. Same shape at base (path differs only in the seat name).

## Residual risk / verification gaps

- H1's frozen protocol is two runs per side; no third run was taken. A load-normalized
  base-side re-run of item 697 (to show the battery passing at `f00cf278` when not
  load-starved) is outside this item and was not attempted.
- Item pass/fail is the harness's own verdict (exit-set + substring), taken as-is; the
  comparison is binary on those statuses, per the frozen rule.
- The two tip runs are same-host, same-clone, sequential; concurrency between runs was
  avoided to mirror the base protocol.

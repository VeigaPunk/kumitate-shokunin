VERDICT: The measured 48-case final selftest leaves 24 of 56 applicable wave-1 mutants alive (57.1% kill rate); the verified 20-case proposal reaches 68/68 and kills 53/56 (94.6%), leaving only M12/M66 equivalences and the M67 meta-mutant.

## Evidence

- Measured revision `a9531c8e617338fd16cb69c61344ef8f17711117`; copied gate SHA-256 matched worktree: `290baa65611a6a935f463b46aeccc0c0bd5940f0329264955fd448c3e62660af`.
- Unmodified gate command: `node /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/inline-dispatch-evidence.mjs --selftest | tail -3; echo EXIT=$?`
  ```
  PASS rev-unreadable-fail-closed — INLINE_DISPATCH: FAIL-CLOSED rev-unreadable rev=0000000000000000000000000000000000000000 [REV_UNREADABLE]
  INLINE_DISPATCH_SELFTEST: PASS (48/48)
  EXIT=0
  ```
- Re-generated each TSV mutant directly from its old/new literals against the final-gate copy, one fresh Node process each (`node /tmp/kumitate-r63/K63R2ExecSelftestGaps/regenerate.mjs`). Exact result: `RE-BATTERY total=67 applicable=56 killed=32 survived=24 n_a=11 invalid=0 timeout=0 kill-rate=57.1%`. Survivor summaries all printed `INLINE_DISPATCH_SELFTEST: PASS (48/48)`.
- Cases were inserted into a scratch copy of the final gate and rerun against the unmutated copy and each applicable mutant (`node /tmp/kumitate-r63/K63R2ExecSelftestGaps/test-cases.mjs`):
  ```
  BASELINE exit=0 INLINE_DISPATCH_SELFTEST: PASS (68/68)
  APPLICABLE=56 not-applicable=11
  M12  SURVIVED exit=0 INLINE_DISPATCH_SELFTEST: PASS (68/68)
  M66  SURVIVED exit=0 INLINE_DISPATCH_SELFTEST: PASS (68/68)
  M67  SURVIVED exit=0 INLINE_DISPATCH_SELFTEST: PASS (68/68)
  ```
  All other 53 applicable mutants printed `KILLED` with exit 1 (or M61's crash); thus proposal kill rate is 53/56 = 94.6%. M12 and M66 were reported equivalent by wave 1; M67 only changes the test harness's exit aggregation and cannot be killed by a case in that same harness.
- Not applicable against final source because the exact target literal was removed/rewritten: M08, M16, M24, M28, M29, M30, M41, M42, M43, M49, M51. These are excluded from both denominators; they were not counted as killed.

## Findings

1. **K63R2ExecSelftestGaps-1 — HIGH — 24 mutants survive the actual final gate's 48 cases.** The survivor set is M02, M03, M05, M06, M07, M09, M10, M11, M12, M17, M18, M25, M26, M32, M33, M46, M50, M52, M57, M58, M63, M64, M66, M67. Reproduce from the lane root: `node /tmp/kumitate-r63/K63R2ExecSelftestGaps/regenerate.mjs`; TSV and per-mutant logs are retained in scratch. Proposed case bodies kill 21 non-equivalent survivors; M12/M66 equivalence and M67 remain.
2. **K63R2ExecSelftestGaps-2 — MEDIUM — some wave-1 mutation targets no longer exist as exact literals.** Eleven of 67 substitutions cannot be applied to the integrated gate; do not infer these as covered. The current gate refactored/deleted those target expressions. Reproduce with the same regenerator; it marks zero-occurrence targets `N_A` in `re-kill.tsv`.

## Artifacts

- `.ufo/waves/round-63/build/K63R2ExecSelftestGaps/new-cases.md` — proposed selftest bodies; not integrated.
- `/tmp/kumitate-r63/K63R2ExecSelftestGaps/` — gate copy, regenerated mutant copies, `re-kill.tsv`, `re-survivors.json`, and proposal execution logs.

## Limits

- Did not edit the gate, frozen inputs, integration files, lane index, or jj state. No tools installed.
- This is the frozen wave-1 single-literal mutant list only; it does not establish coverage of all possible mutations or real-host transcript behavior. Eleven changed targets and the meta-mutant remain outside proposal kill-rate denominator.

# Changes after the freeze (round 64) — disclosed, append-only

Freeze commit: `dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef`. The plan's declared ratchet (C1, J64) allows exactly this
kind of change: a lie a wave seat finds that the tool accepts becomes a control with its `expect`, and the tool is
fixed — a strengthening, never a relaxation. **No frozen counter, no frozen probe check, no threshold and no pin
changed**: `probe/receipt64-probe.mjs`, `probe/jj64-probe.mjs`, `probe/make-receipt-controls.mjs` and
`probe/jj-donothing-control.sh` are byte-identical to the freeze (`node scripts/counter-pins.mjs` → CLEAN).

## Why the controls had to grow (a defect of the freeze, not a relaxation)

At the freeze the counter's P2 required `>= 8 distinct finding ids` while the committed 16 controls exercised 6 and the
v1 tool defined 7 ids (HASH_ORPHAN is unreachable from a plain-directory control lane). The frozen counter therefore
could not read `RECEIPT64_HELD` at any revision (found independently by K64ExecReceiptForge-1,
K64ExecReceiptRealRun-1, K64CriticC1Predicate, K64ReviewProbeC1, K64MutateProbes, K64ReviewPlanText,
K64ScribeScorecard, K64ScribeLogSkill — eight seats). The floor stays 8; the ratchet supplies the missing ids.

## What changed

| change | evidence |
|---|---|
| `scripts/report-receipt-diff.mjs` v1 → v2 (contract `kumitate-report-receipt-diff-v2`): 20 report-lies found by K64ExecReceiptForge now read DRIFT (spaced/lower-case/table/zero-width tallies, cited-receipt scoping, `checks=` mismatch, symlinked/empty/escaping receipts, fence-blind sections, 39-digit and upper-case hashes, five more placeholder spellings); two new finding ids `RECEIPT_EMPTY`, `TALLY_CHECKS_MISMATCH`; ported from K64ExecReceiptRealRun: boxes counted not lines (backticked boxes accepted), a hash that is a URL path component is not a commit claim, a glob receipt path matches committed files; ported from K64ReviewTool: `--opt=value` forms, `ls-tree -z`, unborn-HEAD tip fallback, selftest cleanup when git is absent. Selftest 20 → 50. | `build/K64ExecReceiptForge/{CASES.md,check.mjs}`, `build/L1Integrate/report-receipt-diff.v3.mjs`, `node scripts/report-receipt-diff.mjs --selftest` → `PASS (50/50)` |
| `controls/receipt/` 16 → 37 cases: + `k1…k20` (K64ExecReceiptForge, one lie each, now with `expect`), + `c16-held-cited-other-round` (K64ExecReceiptRealRun). Distinct finding ids exercised: 8 (`PLACEHOLDER`, `TALLY_UNRECEIPTED`, `TALLY_CHECKS_MISMATCH`, `RECEIPT_MISSING`, `RECEIPT_EMPTY`, `HASH_DEAD`, `SECTION_MISSING`, `SHONEN_COUNT`). The 16 frozen cases are untouched. | `ls controls/receipt \| wc -l` → 37; all 37 exit as their `expect` |
| `scripts/jj-seat-demo.sh` v1 → v2 (contract `kumitate-jj-seat-demo-v2`): hermetic against the caller's `GIT_*`/`JJ_*` environment and TMPDIR ancestry (K64ExecJjDemoHarden-1/-2, K64ReviewDemo-1/-6), every mutating step fail-closed, a real `--ignore-working-copy` probe, a seat-attributed op delta (`seat_snapshot_in_shared_op_log` 2 → 1), plus six measured keys (`ignore_working_copy_hides_pending`, `rewrite_treechange_seat_state`, `abandon_empty_seat_state`, `update_stale_abandoned_seat_file`, `cross_abandon_both_fresh_after_status`, `forget_seat_commit_in_all`): 15 → 21 keys. J6 compares the entry with the live run set-equal, so the extra keys are additive. | `bash scripts/jj-seat-demo.sh` identical over 4 sequential and 4 parallel runs, under `TMPDIR` inside a git worktree and a hostile `GIT_DIR`/`JJ_USER` environment (`build/L1Integrate/`) |

## What did not change, and is declared as a limit instead

- The J64 counter reads `JJ64_HELD` on four independent forgeries (K64CriticC2Predicate), has a porous archive boundary
  (`../` pin paths, committed symlinks, caller cwd, env-overridable census: K64ReviewProbeC2), and hands the measured
  tree operator privileges (K64SentinelDemoHost). The counter is frozen and pinned; these are reported as limits and the
  round's supplementary independent checks (wave 2, `close/supplementary-*.txt`) close what a counter cannot.
- C1's P3 reads two real reports. Over all 24 real reports of rounds 40–63 the v2 tool reads 13 CLEAN and 11 DRIFT
  (`controls/real-reports-v2.txt`, `--rev master` at the integration commit): only r60 is a true DRIFT (6 template tokens and
  `DISPATCH60_HELD held=10/10`); the other ten are the false-positive classes K64ExecReceiptRealRun hand-classified
  against v1 — unresolvable hashes of read-only clones, scratch repositories and bundles (r40–43, r53, r57, r61, r62),
  receipts filed outside `base/`/`close/` or in another round's directory (r49, r53, r58, r62). They are declared limits of
  the v2 tool, not fixed: fixing them by adjacent-word heuristics ("scratch", "fixture") would hand a lying report a
  way to excuse a dead hash, which the 20 controls above close.

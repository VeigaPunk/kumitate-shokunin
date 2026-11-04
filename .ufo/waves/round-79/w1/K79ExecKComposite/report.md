# K79ExecKComposite — C1 composite coverage

Axes: operability + coverage:kimi-layer. Implementation isolated at scaffolding ba940b512d980218b11ed6f34ac2f304c01287ee; lane implementation files untouched.

## Implementation

Added kCoverage(covered,total,sections,members,findings), retaining both fractions and guarding zero denominators. K uses it; S/R/O retain layerCoverage. JSON keys and finding kinds unchanged. Added three full-55-member regression cases: de-named heading, mode census finding, and both; each asserts score 9, exact terms and exact finding kinds. Added the specifically requested one-line draft note for C2 revision discrimination; L1 replaces it with substantive content.

## Changed expectations (all arithmetic consequences)

- K_KNOBS partial documentation fixture (4/55): coverage 10 -> 0.
- Census clean case: 10 -> 0; mode, stray and missing cases: 9 -> 0.
- K literal MATCH text, JSON computed/declared score, and chain-generation text: 10 -> 0.
- Removed-member, added-member stale, and kind-change stale cases: exact expected findings now K_MEMBERS_DRIFT + K_FINDINGS_DRIFT, without score/axes drift because both old and new composite scores floor to 0.
- Added-member corrected fixture: 9 -> 0; removed obsolete score/axis replacements, retaining member/finding declarations.
- K-row-off corrected fixture: 8 -> 0; stale fixture expects only C1K_DRIFT, because its score stays 0. Retains literal C1 delta and MATCH/stale exit assertions.
- K-axis-only tamper: computed 10 -> 0; tampered axis remains 2.
- Ambiguous-basename corrected fixture: 9 -> 0; removes obsolete score/axis replacement while retaining member/finding/section changes and warning/strict checks.
- Empty-root fixture no longer needs score/axis 10 -> 0 replacements; score is already 0, and integer/zero assertions remain.
- Noninteger-score fail-closed fixture now mutates source value 0 instead of 10, still injecting 1.5.
- Renamed two case labels to describe composite flooring; no case deleted, skipped or relaxed. Every existing exact finding list remains exact, adjusted only where the recomputed integer no longer changes.

## Retained receipts

- selftest-before.txt: exit 0, PROXY_SELFTEST: 156/156 pass.
- selftest-attempt-1.txt: exit 1, 157/159 pass; new JSON-only cases did not register COVERAGE_KIMI_DRIFT with the suite's existing text-mode kind-observation collector. Fixed by exercising text mode in those same three cases.
- selftest-after.txt: exit 0, PROXY_SELFTEST: 159/159 pass; VERDICT: PASS.
- counter.txt: exit 1, C79_C1: HELD held=9/11. All formula/reactive/selftest/content-blind arms pass; clean and live-strict fail on integration metadata.
- strict.txt: exit 1; A declared868/computed870, C2_total191/192, changed proxy pin, aggregate coverage row10/derived9 due the unindexed required draft.
- patch.diff: implementation diff plus new-file diff for the requested draft; no commit or index mutation.

Commands used Node with TMPDIR explicitly set to seat scratch; counter used frozen lane probe with --set c1 --lane <seat-clone> --work <seat-scratch>/w1. Strict used node <seat-clone>/scripts/proxy-check.mjs --src /fast/scratch/hyaku/kumitate-pin/src --strict. Full raw output plus EXIT status is retained in each receipt.

## Integration risk / scope

Pending L1 ruling: clean/live need measured SCORECARD A/C2/pin and corpus README row integration, outside the explicitly assigned script+draft implementation. No claim of 11/11 or strict MATCH yet. No LSP tool is exposed in this seat's tool inventory; symbol navigation used exact source grep/read instead. No tool installs or upgrades.

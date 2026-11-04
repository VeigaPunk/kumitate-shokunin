# K79MutC1 — C1 mutation probe

Axes: operability + coverage:kimi-layer (orchestration and tooling).

## Result

Frozen counter baseline: **11/11, exit 0**. All seven requested mutants were **KILLED**; each exact-byte restoration again produced **11/11, exit 0**. No full-counter survivor.

| Mutant | Defect | Held | First FAIL |
|---|---|---:|---|
| M1 | Drop documentation factor | 8/11 | denamed-heading |
| M2 | Drop findings factor | 8/11 | findings-factor |
| M3 | Round instead of floor | 7/11 | denamed-heading |
| M4 | Remove zero-denominator guard | 9/11 | zero-denominator |
| M5 | Subtract raw findings after product | 8/11 | both-factors |
| M6 | Supply occurrence rather than distinct count | 8/11 | denamed-heading |
| M7 | Divide findings factor by total | 3/11 | proxy-clean-terms |

M6 preserves distinct K_sections reporting while supplying an independently accumulated per-heading member-occurrence count to the scoring helper. It passes the source-shape arm and the nested selftests arm, but the frozen lane-backed behavioral arms kill it. This is a nested-selftest coverage limitation, not a full-counter survivor. M4 prints null coverage on an empty root (NaN serialization); M5 produces 8 rather than 9 when both losses occur; M7 gives 110 on the clean fixture.

## Method and evidence

Used a single disposable archive of scaffolding ba940b512d980218b11ed6f34ac2f304c01287ee. Initial independent helper implementation yielded 8/11 because metadata and old selftest expectations were stale; those runs are retained as initial-composite.txt, initial-proxy-json.txt and initial-selftest.txt, and are not counted as mutant kills. Reused K79ExecKComposite's completed proxy script snapshot (including migrated fixtures), retained as baseline-proxy-check.mjs. Only scratch SCORECARD A was remeasured 868→870 and proxy pin updated; no new corpus note was needed for the mutation mechanism baseline. Source SHA-256: ab304f970a6eca264ede93dac84f479014aa41a5498b7c040ab8c83830bb853b. Scorecard SHA-256: 083349202a0f7d52922d76ca62be3ebd952d5eabf7874d11fcd1db533fc68104.

The exact bounded command is recorded in every receipt and protocol.txt. Expected detector: the frozen probe79-c1.mjs, all 11 arms. Baseline actual output: counter-at-work.txt. Kill matrix: mutants.txt. Actual outputs: M1.txt through M7.txt; restored outputs: M1-restored.txt through M7-restored.txt. results.json records all failing arms, exits, and before/mutated/after SHA-256 hashes for both source and scorecard. M1-source.mjs through M7-source.mjs retain exact mutant bytes. Mutants repin the proxy hash so kills are behavioral/source-shape failures rather than trivial PIN_DRIFT.

Every mutation started from restored baseline bytes; restoration used finally. All seven source+scorecard hash pairs match their before hashes. Scratch was removed after receipts were retained; cleanup.txt records exists_after_cleanup=False. No lane source edits, commits, subagents, tool installs, or service changes.

## Self-evaluation

Accuracy 4/5: complete actual outputs/hashes retained; initial metadata cause was not investigated beyond measured drift. Completeness 5/5: seven assigned mutants and seven restored counter runs. Clarity 4/5: detailed machine receipts separated from summary. Actionability 5/5: exact snapshots, commands, and first-failing-arm matrix. Conciseness 4/5: complete outputs intentionally repeat 11-arm results. Overall 4.4/5. Improvement: nested selftests need a duplicate-heading scoring discriminator; no contract or implementation change made here.

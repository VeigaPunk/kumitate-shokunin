# Selftest transcript sweep and prose-tally calibration (round 64, seat K64ExecSelftestTranscripts)

Answers routed defect **D2**: every tally the lane quotes in prose is bound here to a committed,
re-runnable transcript with its exit code, and each present-tense tally is compared with the observed one.

## Method

```
# 1. scratch copy of the lane at the base revision (read-only extraction, no lane file touched)
git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin archive 6825a51425e91908f019ed65aa2f4209acbd7087 \
  | tar -x -C .ufo/waves/round-64/build/K64ExecSelftestTranscripts/arch
# 2. same for the frozen tip dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef (adds report-receipt-diff.mjs)
# 3. per script, in the extraction root:  (cd <arch> && node scripts/<s>.mjs --selftest) > transcripts/<s>.txt 2>&1
#    plan-before-ready.sh runs under bash; 900 s timeout per script
# 4. the tally line is the last line matching one of:
#    LABEL_SELFTEST: PASS (n/n) | LABEL_SELFTEST: n/n pass | ^n/n cases passed | VERDICT: PASS (n cases) | LABEL_SELFTEST: PASS
```

Scripts with `--selftest` in the lane (recursive `grep -rl -- --selftest scripts/`): **26** at the frozen tip,
**25** at the base revision (report-receipt-diff.mjs is new at dd1a3e6). Two scripts carry none:
`scripts/cap-spawn.mjs` (a helper, declared exercised by routed sites, SKILL.md:617) and `scripts/jj-seat-demo.sh`
(this round's C2 demo; J6 re-runs it, no `--selftest`).

## Observed tallies (base 6825a514, exit 0 for all 25; frozen tip adds one)

| script | exit | tally line (verbatim) | base=frozen bytes |
|---|---|---|---|
| `anchor-truth.mjs` | 0 | `ANCHOR_TRUTH_SELFTEST: 44/44 pass` | yes |
| `bind-oracle.mjs` | 0 | `BIND_ORACLE_SELFTEST: 7/7 pass` | yes |
| `cap-run.mjs` | 0 | `CAP_RUN_SELFTEST: 12/12 pass` | no |
| `cite-check.mjs` | 0 | `76/76 cases passed (hermetic)` | no |
| `cite-sources.mjs` | 0 | `CITE_SOURCES_SELFTEST: PASS (8/8)` | yes |
| `claims-check.mjs` | 0 | `CLAIMS_SELFTEST: 47/47 pass` | yes |
| `counter-pins.mjs` | 0 | `COUNTER_PINS_SELFTEST: PASS (11/11)` | yes |
| `counter-rerun.mjs` | 0 | `COUNTER_RERUN_SELFTEST: PASS` | yes |
| `dispatch-evidence.mjs` | 0 | `DISPATCH_EVIDENCE_SELFTEST: PASS (8/8)` | no |
| `gate-mutants.mjs.at-e5ffcbe` | 0 | `GATE_MUTANTS_SELFTEST: 28/28 pass leftovers=0` | frozen-only |
| `gate-mutants.mjs` | 0 | `GATE_MUTANTS_SELFTEST: 41/41 pass leftovers=0` | yes |
| `inline-dispatch-evidence.mjs` | 0 | `INLINE_DISPATCH_SELFTEST: PASS (69/69)` | no |
| `kimi-census.mjs` | 0 | `KIMI_CENSUS_SELFTEST: 54/54 pass` | yes |
| `make-dispatch-actual.mjs` | 0 | `MAKE_DISPATCH_ACTUAL_SELFTEST: PASS (11/11)` | yes |
| `omp-census.mjs` | 0 | `VERDICT: PASS (29 cases)` | yes |
| `plan-before-ready.sh` | 0 | `PLAN_BEFORE_READY_SELFTEST: PASS (10/10) fixtures=/tmp/pbr-selftest.Ze1IUG` | no |
| `proxy-check.mjs` | 0 | `PROXY_SELFTEST: 122/122 pass` | no |
| `readme-map.mjs` | 0 | `README_MAP_SELFTEST: PASS (16/16)` | yes |
| `receipt-attest.mjs` | 0 | `ATTEST_SELFTEST: PASS (51/51)` | yes |
| `receipt-evidence.mjs` | 0 | `RECEIPT_EVIDENCE_SELFTEST: PASS (10/10)` | yes |
| `round-gate.mjs` | 0 | `ROUND_GATE_SELFTEST: 61/61 pass` | no |
| `source-capture.mjs` | 0 | `SOURCE_CAPTURE_SELFTEST: PASS (13/13)` | yes |
| `source-dupes.mjs` | 0 | `SOURCE_DUPES_SELFTEST: PASS (12/12)` | yes |
| `sources-check.mjs` | 0 | `SOURCES_SELFTEST: 46/46 pass` | yes |
| `surface-probe.mjs` | 0 | `46/46 cases passed` | no |
| `wave-census.mjs` | 0 | `WAVE_CENSUS_SELFTEST: 32/32 pass` | no |
| `report-receipt-diff.mjs` (frozen tip only) | 0 | `REPORT_RECEIPT_SELFTEST: PASS (20/20)` | frozen-only |

`base=frozen bytes` is the sha256 comparison of the two runs (stability.tsv). 16 of 25 are byte-identical;
the 9 that differ differ only in `mkdtemp` names, wall-clock digits (cap-run), and one fixture commit id
(cite-check `resolved-by-git`). **A committed transcript is therefore not byte-reproducible for 9 of 25
suites**; a verifier must compare the tally line + exit code, or normalise `/tmp/*-selftest-*` names.

## Calibration table — prose statement vs observed tally

Classes: LIVE = present-tense claim about the current tree (scored); HISTORICAL = revision-stamped past
round record (scored at its stamp where cheap); PLACEHOLDER = `n/m`, no falsifiable number;
OTHER-QUANTITY = a mutant-battery count, not a suite size.

| # | statement (file:line) | subject | claimed | observed (base) | verdict |
|---|---|---|---|---|---|
| 1 | `SKILL.md:611` | `omp-census.mjs` | 29 hermetic cases | `VERDICT: PASS (29 cases)` | **MATCH** |
| 2 | `SKILL.md:612` | `cap-run.mjs` | CAP_RUN_SELFTEST: 12/12 pass | `CAP_RUN_SELFTEST: 12/12 pass` | **MATCH** |
| 3 | `SKILL.md:614` | `receipt-evidence.mjs` | RECEIPT_EVIDENCE_SELFTEST: PASS (10/10) | `RECEIPT_EVIDENCE_SELFTEST: PASS (10/10)` | **MATCH** |
| 4 | `SKILL.md:618` | `receipt-attest.mjs` | ATTEST_SELFTEST: PASS; 51 hermetic cases | `ATTEST_SELFTEST: PASS (51/51)` | **MATCH** |
| 5 | `SKILL.md:619` | `counter-pins.mjs` | COUNTER_PINS_SELFTEST: PASS (11/11) | `COUNTER_PINS_SELFTEST: PASS (11/11)` | **MATCH** |
| 6 | `SKILL.md:620` | `source-capture.mjs` | SOURCE_CAPTURE_SELFTEST: PASS (13/13) | `SOURCE_CAPTURE_SELFTEST: PASS (13/13)` | **MATCH** |
| 7 | `SKILL.md:622` | `source-dupes.mjs` | SOURCE_DUPES_SELFTEST: PASS (12/12) | `SOURCE_DUPES_SELFTEST: PASS (12/12)` | **MATCH** |
| 8 | `SKILL.md:624` | `readme-map.mjs` | README_MAP_SELFTEST: PASS (16/16) | `README_MAP_SELFTEST: PASS (16/16)` | **MATCH** |
| 9 | `SKILL.md:625` | `cite-sources.mjs` | CITE_SOURCES_SELFTEST: PASS (8/8) | `CITE_SOURCES_SELFTEST: PASS (8/8)` | **MATCH** |
| 10 | `SKILL.md:626` | `dispatch-evidence.mjs` | DISPATCH_EVIDENCE_SELFTEST: PASS (8/8) | `DISPATCH_EVIDENCE_SELFTEST: PASS (8/8)` | **MATCH** |
| 11 | `SKILL.md:627` | `inline-dispatch-evidence.mjs` | INLINE_DISPATCH_SELFTEST: PASS (69/69) | `INLINE_DISPATCH_SELFTEST: PASS (69/69)` | **MATCH** |
| 12 | `SKILL.md:628` | `plan-before-ready.sh` | 10 cases; PLAN_BEFORE_READY_SELFTEST: PASS (10/10) | `PLAN_BEFORE_READY_SELFTEST: PASS (10/10) fixtures=/tmp/pbr-selftest.Ze1IUG` | **MATCH** |
| 13 | `SCORECARD.md:1779` | `sources-check.mjs` | --selftest 46/46 | `SOURCES_SELFTEST: 46/46 pass` | **MATCH** |
| 14 | `SCORECARD.md:1782` | `omp-census.mjs` | --selftest 29 cases PASS | `VERDICT: PASS (29 cases)` | **MATCH** |
| 15 | `SCORECARD.md:1783` | `cap-run.mjs` | CAP_RUN_SELFTEST: 10/10 pass | `CAP_RUN_SELFTEST: 12/12 pass` | **MISMATCH** |
| 16 | `SCORECARD.md:1787` | `counter-rerun.mjs` | COUNTER_RERUN_SELFTEST: PASS | `COUNTER_RERUN_SELFTEST: PASS` | **MATCH** |
| 17 | `SCORECARD.md:1788` | `receipt-attest.mjs` | ATTEST_SELFTEST: PASS exit 0 (27 cases) | `ATTEST_SELFTEST: PASS (51/51)` | **MISMATCH** |
| 18 | `SCORECARD.md:1791` | `counter-pins.mjs` | COUNTER_PINS_SELFTEST: PASS (11/11) | `COUNTER_PINS_SELFTEST: PASS (11/11)` | **MATCH** |
| 19 | `SCORECARD.md:1792` | `source-capture.mjs` | SOURCE_CAPTURE_SELFTEST: PASS (13/13) | `SOURCE_CAPTURE_SELFTEST: PASS (13/13)` | **MATCH** |
| 20 | `SCORECARD.md:1793` | `source-dupes.mjs` | SOURCE_DUPES_SELFTEST: PASS (12/12) | `SOURCE_DUPES_SELFTEST: PASS (12/12)` | **MATCH** |
| 21 | `SCORECARD.md:1794` | `readme-map.mjs` | README_MAP_SELFTEST: PASS (16/16) | `README_MAP_SELFTEST: PASS (16/16)` | **MATCH** |
| 22 | `SCORECARD.md:1795` | `receipt-evidence.mjs` | RECEIPT_EVIDENCE_SELFTEST: PASS (10/10) | `RECEIPT_EVIDENCE_SELFTEST: PASS (10/10)` | **MATCH** |
| 23 | `SCORECARD.md:1796` | `cite-sources.mjs` | CITE_SOURCES_SELFTEST: PASS (8/8) | `CITE_SOURCES_SELFTEST: PASS (8/8)` | **MATCH** |
| 24 | `SCORECARD.md:1797` | `dispatch-evidence.mjs` | DISPATCH_EVIDENCE_SELFTEST: PASS (8/8) | `DISPATCH_EVIDENCE_SELFTEST: PASS (8/8)` | **MATCH** |
| 25 | `SCORECARD.md:1798` | `inline-dispatch-evidence.mjs` | INLINE_DISPATCH_SELFTEST: PASS (69/69) | `INLINE_DISPATCH_SELFTEST: PASS (69/69)` | **MATCH** |
| 26 | `corpus/QUALITY.md:870` | `source-capture.mjs` | SOURCE_CAPTURE_SELFTEST: PASS (13/13) | `SOURCE_CAPTURE_SELFTEST: PASS (13/13)` | **MATCH** |
| 27 | `corpus/QUALITY.md:872` | `source-capture.mjs` | the gate's 13-case hermetic selftest | `SOURCE_CAPTURE_SELFTEST: PASS (13/13)` | **MATCH** |
| 28 | `corpus/QUALITY.md:877` | `source-dupes.mjs` | SOURCE_DUPES_SELFTEST: PASS (12/12) | `SOURCE_DUPES_SELFTEST: PASS (12/12)` | **MATCH** |
| 29 | `corpus/QUALITY.md:879` | `source-dupes.mjs` | the gate's 12-case hermetic selftest | `SOURCE_DUPES_SELFTEST: PASS (12/12)` | **MATCH** |
| 30 | `corpus/QUALITY.md:884` | `readme-map.mjs` | README_MAP_SELFTEST: PASS (14/14) | `README_MAP_SELFTEST: PASS (16/16)` | **MISMATCH** |
| 31 | `corpus/QUALITY.md:886` | `readme-map.mjs` | the gate's 14-case hermetic selftest | `README_MAP_SELFTEST: PASS (16/16)` | **MISMATCH** |
| 32 | `corpus/QUALITY.md:970` | `plan-before-ready.sh` | PLAN_BEFORE_READY_SELFTEST: PASS (10/10) | `PLAN_BEFORE_READY_SELFTEST: PASS (10/10) fixtures=/tmp/pbr-selftest.Ze1IUG` | **MATCH** |
| 33 | `LOG.md:2304` | `inline-dispatch-evidence.mjs` | 69-case selftest | `INLINE_DISPATCH_SELFTEST: PASS (69/69)` | **MATCH** |
| 34 | `corpus/QUALITY.md:358` | `gate-mutants.mjs` | GATE_MUTANTS_SELFTEST: 28/28 pass (at e5ffcbe) | `GATE_MUTANTS_SELFTEST: 28/28 pass leftovers=0` | **MATCH** |
| 35 | `corpus/QUALITY.md:365` | `gate-mutants.mjs` | Clean selftest 28/28 (at e5ffcbe) | `GATE_MUTANTS_SELFTEST: 28/28 pass leftovers=0` | **MATCH** |
| 36 | `SCORECARD.md:1780` | `wave-census.mjs` | --selftest 26/26 at the attempt-2 tip | `WAVE_CENSUS_SELFTEST: 32/32 pass` | **STALE-IF-CURRENT** |
| 37 | `SKILL.md:608` | `anchor-truth.mjs` | ANCHOR_TRUTH_SELFTEST: n/m | `ANCHOR_TRUTH_SELFTEST: 44/44 pass` | **UNFALSIFIABLE** |
| 38 | `SKILL.md:609` | `wave-census.mjs` | WAVE_CENSUS_SELFTEST: n/m | `WAVE_CENSUS_SELFTEST: 32/32 pass` | **UNFALSIFIABLE** |
| 39 | `SKILL.md:610` | `gate-mutants.mjs` | GATE_MUTANTS_SELFTEST: n/m | `GATE_MUTANTS_SELFTEST: 41/41 pass leftovers=0` | **UNFALSIFIABLE** |
| 40 | `SKILL.md:616` | `bind-oracle.mjs` | BIND_ORACLE_SELFTEST: n/7 pass | `BIND_ORACLE_SELFTEST: 7/7 pass` | **UNFALSIFIABLE** |
| 41 | `SKILL.md:601` | `cite-check.mjs` | 16 conditions; survived=0/16 (mutant battery) | `76/76 cases passed (hermetic)` | **N/A** |
| 42 | `SCORECARD.md:1781` | `gate-mutants.mjs` | frozen=41/41 (mutant ids) | `GATE_MUTANTS_SELFTEST: 41/41 pass leftovers=0` | **N/A** |

Rows: 42 — classes {'LIVE': 33, 'HISTORICAL': 3, 'PLACEHOLDER': 4, 'OTHER-QUANTITY': 2}; verdicts {'MATCH': 31, 'MISMATCH': 4, 'STALE-IF-CURRENT': 1, 'UNFALSIFIABLE': 4, 'N/A': 2}.

## Aggregate (not individually scored)

- **105 further lines** in the five docs mention a selftest together with a numeric ratio or case count and
  are not present-tense claims about this tree: LOG.md 46, SCORECARD.md 54, corpus/README.md 4, SKILL.md 1.
  Each is a past-round record at a named revision, or (SCORECARD.md:64/66) another lane's `drift-pins.sh`.
- **0 of the 33 LIVE tallies names a committed selftest transcript on the same line.** Three LIVE lines name a
  committed `.txt`, and all three are counter receipts, not selftest runs: `SCORECARD.md:1782`
  (`.ufo/waves/round-44/final/p44-measured-d81978cd.txt`), `:1783` (`.ufo/waves/round-46/close/o2-c1.txt`),
  `:1787` (`r48/L1-c2-binding-ce9aee5d.txt`). That is D2 stated as a measurement: the number is quoted, the
  bytes that produced it are not committed.
- The pattern the assignment names as `25 -> 69` does not occur in any of the five docs; the round-63 entry
  (`LOG.md:2304`) states only the terminal figure, `69-case selftest`, and `SCORECARD.md:1798` states `69/69`.
  Both MATCH. The growth is recorded only for the control set (`SCORECARD.md:2965`: `14 -> 75 cases`).

## Self-corroboration column (printed tally vs per-case lines)

Of the 26 suites at the frozen tip, **22 print one line per case** (21 with `^PASS `/`SELFTEST ok`, plus
`bind-oracle` with indented `  PASS A1..A7`), and in every one of the 22 the number of case lines equals the
printed numerator, with **0 `FAIL` lines**. Three print **only** a tally that carries a count —
`claims-check.mjs` (`CLAIMS_SELFTEST: 47/47 pass`), `kimi-census.mjs` (`KIMI_CENSUS_SELFTEST: 54/54 pass`) and
`report-receipt-diff.mjs` (whose entire `--selftest` transcript is the single line
`REPORT_RECEIPT_SELFTEST: PASS (20/20)`) — so their numerators are self-asserted and cannot be recounted from
the transcript. `counter-rerun.mjs` prints `COUNTER_RERUN_SELFTEST: PASS` with no count at all.

This is the D2 shape reproduced inside a suite: `report-receipt-diff.mjs` is exactly the tool whose tally C1
quotes, and it is the one suite whose transcript has no case-level detail to audit.


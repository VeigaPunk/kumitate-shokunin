# K84ExecHistory — bounded historical census

Axes: operability (receipt truth), coverage (exactly three assigned receipts); no score increase or non-author closure asserted.

## Files and behavior

- Candidate: `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-84/build/K84ExecHistory/history.mjs` (executable).
- Retained invocation/output: `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-84/build/K84ExecHistory/census.txt`.
- This report: `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-84/w1/K84ExecHistory.md`.

Driver reads exactly the three assigned r83 receipt blobs through read-only `git show` at freeze `3794b903324e7eb4aec6d92539f2ca4e2c0b6727`. JSON records absolute source paths, commit object paths, SHA-256, prefix, arm/ok/FAIL counts, denominator, verbatim summary and line numbers, failed arms, expected contradiction and per-file expectation matches. Driver writes no files and never executes receipt text. Exit 0 means the specified historical census matches, NOT that every receipt is clean; exit 1 means expectation mismatch, exit 2 means read/parse failure.

## Observed command and evidence

Executed once, cwd `/fast/scratch/hyaku/kumitate-r84/K84ExecHistory`:

```sh
env TMPDIR=/fast/scratch/hyaku/kumitate-r84/K84ExecHistory/work node /fast/scratch/hyaku/kumitate-r84/K84ExecHistory/history.mjs
```

Exit **0**, revision **3794b903324e7eb4aec6d92539f2ca4e2c0b6727**; `matchesExpected: true` for all three and overall. Exact stdout retained in `census.txt` above.

| r83 close file | Prefix | Arms | ok | FAIL | Summary | Findings |
|---|---|---:|---:|---:|---|---|
| c1-probe.txt | C83_C1 | 28 | 27 | 1 | `C83_C1: HELD held=27/27` | ARMS_TOTAL, ARM_FAILED |
| c1-repair.txt | C83_C1R | 28 | 28 | 0 | `C83_C1R: HELD held=28/28` | none |
| c2-probe.txt | C83_C2 | 16 | 16 | 0 | `C83_C2: HELD held=16/16` | none |

Defect: red-before line 4 `band-total-resumes FAIL` contradicts admission from line 30's HELD headline. The denominator is 27 but there are 28 arm rows; under the frozen contract ARMS_TOTAL precedes ARM_FAILED. The numerator actually equals the 27 ok rows, so there is no HELD_COUNT discrepancy. Repair and C2 reconcile.

Committed blob SHA-256 values, in table order:

- `07690bffa7037c4f266d253bed4f76e6553a61f8991850b3e139135275cbdc20`
- `2a327c1d08201ad02a0c2ac565f79bbe8a5f591af03be25582cfb7187842d063`
- `ad43c857728b1c6ef1f73e089033cc4457479c29f0a4c2008caa7d2b45355933`

## Limits and handoff

Read frozen plan/probe, PROVINCE and QUALITY Q24/Q26/Q53/Q63. LSP is unavailable in this seat's mounted tools; no existing symbols were changed or refactored. No installs/updates, clone, production edits, commits, network or shared build/lint/test runs. Scratch removed after durable candidate/receipt retention. LOG intentionally unchanged because this seat may write only its assigned artifacts/report.

This is a fixed three-receipt census, not a general malformed-input validator and not an execution of the production counter-receipt candidate. It does not independently prove historical commands ran, verify old embedded rev fields, or confer external admission. L1 owns integrated frozen-probe execution and actual counter-receipt runs over these same three committed blobs.

Self-evaluation (advisory, not closure): accuracy 4 (observed committed bytes; general validation intentionally absent); completeness 5 (all three requested cross-checks retained); clarity 4 (census exit 0 must not be confused with all-clean); actionability 5 (executable candidate plus exact invocation/output); conciseness 4 (provenance adds length). Overall 4.4/5. Improvement: use the integrated gate for general validation, without expanding this bounded driver. User agreement expected on bounded evidence, not independent closure.

# R60 fleet report erratum — placeholder accounting

Findings only; no report or plan edits. Inspection used the committed report bytes at fleet commit `7b0581ed63a46ac1961b1ecf98ec0caf561ccd9b` (same six tokens are present in the current report). Round-62 local `plan/` is empty and the lane has no `round-62/plan.md`; the governing/frozen round-62 plan source was not present at the requested lane path, so this is a token-evidence check, not a plan adjudication.

## Exact token inventory and mappings

The report has exactly six placeholder occurrences:

| Report line | Token | Appropriate evidence / replacement |
|---|---|---|
| 4 | `__TIP__` | `a745a3b0e02253e722834ef95042d97ed92e5e53` is the round-60 work/tip revision as understood by the existing erratum; it was committed before the report at `7b0581ed`. |
| 5 | `__MEASURED__` | `a745a3b0e02253e722834ef95042d97ed92e5e53`, the revision in both counter receipts. |
| 73 | `__COMMITS__` | Not a one-commit substitute: `165b83044d33cbd52fc2209aefe57edfd7e6590a` lands the wave evidence and work receipts; `be4a820c344d4eb2f94b999c3b5d649e76ab70f1` later adds `dispatch60-tip.txt` and `doctrine60-tip.txt`. Cite both for the complete stated evidence set. |
| 88 | `__MEASURED__` | `a745a3b0e02253e722834ef95042d97ed92e5e53`; dispatch receipt at that revision is UNMET 8/10, not HELD 10/10 (R60-V3/V4). |
| 96 | `__MEASURED__` | `a745a3b0e02253e722834ef95042d97ed92e5e53`; doctrine receipt is HELD 6/6. |
| 190 | `__MEASURED__` | `a745a3b0e02253e722834ef95042d97ed92e5e53`, the round-60 measured revision. |

Thus all four measured tokens (5, 88, 96, 190) map to the same revision; the one tip token (4) maps to that round-60 tip; the one commits token (73) denotes the evidence landing(s), not a measurement revision. Each of the six occurrences is accounted for exactly once.

## Concrete erratum qualification

The current candidate `kumitate-shokunin/.ufo/waves/round-61/build/ScribeErratum/erratum.md` §R60-V2 (lines 7–11) maps `__TIP__` and all four `__MEASURED__` occurrences to `a745a3b0…`, which matches the relevant revision identity. Its statement that the entirety of line 73's “wave evidence” landed in `165b830…` is incomplete: `git ls-tree` shows `165b830…` has `dispatch60-work.txt` and `doctrine60-work.txt` but no `dispatch60-tip.txt` or `doctrine60-tip.txt`; those two tip receipts first appear in `be4a820c…` (the commit specifically titled “record real round-60 tip receipts”). The existing erratum itself correctly attributes the tip receipts to `be4a820c` in §R60-V4. Therefore line 73's `__COMMITS__` must be accounted for across both commits to cover all cited artifacts. The report's line-88 dispatch result remains separately contradicted by the measured receipt; resolving the token does not resolve that result defect.

Evidence: fleet report lines 4–5, 73, 88, 96, 190; candidate erratum lines 7–21; lane Git tree/commit checks for `165b83044d33cbd52fc2209aefe57edfd7e6590a` and `be4a820c344d4eb2f94b999c3b5d649e76ab70f1`; receipt contents at the latter commit. No tools installed; no tests/builds/linters run; no edits made outside this assigned findings report.
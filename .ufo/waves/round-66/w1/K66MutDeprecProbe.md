VERDICT: Mutation campaign inconclusive: only frozen-counter source/control inspection and byte hashes completed; no 15 mutant fixtures or detector runs were performed.

## Evidence
- Read frozen plan: `.ufo/waves/round-66/plan.md:75-89`; M66 clauses M1–M8 enumerated there.
- Read counter: `.ufo/waves/round-66/probe/deprec66-probe.mjs:75-230`; observed source-level predicates include date/quote checks (M4 lines 148-149), strict snapshot row count (M6 line 199), delink use (M6 188,197), tiers A/B (M2 118), base novelty (M2 110), and M7 citation syntax (214-218).
- Read control `.ufo/waves/round-66/probe/c2-donothing.sh:4-7,19-28`: it checks only a staged byte-copy entry plus PROVINCE line on the base, then runs the full counter. Its frozen reported receipt is referenced in plan line 87; I did not rerun it.
- `sha256sum .../deprec66-probe.mjs .../c2-donothing.sh` output:
  `866bfb86b9530d6f86a05043d94c95b5edef1eb058df2d1169fe279ddd3774a6  .../deprec66-probe.mjs`
  `a6b27ef7d3b36dc03d69c2e00fd753dfeaef95a0f4649bbc885765fe636f9efe  .../c2-donothing.sh`
- `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin rev-parse 621212bac37f8249c72ac982d1d6534cb8d60701` → `621212bac37f8249c72ac982d1d6534cb8d60701`.

## Findings
1. K66MutDeprecProbe-1 — severity: unverified coverage. No behavior mutant was applied and no fixture was committed; therefore no mutant verdicts or original-vs-mutant detector outputs can be claimed. Suggested reproducible probe: copy counter into isolated scratch, alter one predicate at a time, create a sandbox clone fixture commit with `git -C <clone>`, run the same counter against pristine and mutated scripts, and restore/check hashes.
2. K66MutDeprecProbe-2 — severity: coverage gap in control by design. The committed do-nothing control only exercises the combined empty-data rejection path; it does not isolate M1–M8, including independent date, quote, row-count, delink, tier, novelty, or S201–S206 conditions. This is source-level inspection, not a detector test.

## Artifacts
- Report: `.ufo/waves/round-66/w1/K66MutDeprecProbe.md`
- Created empty build directory `.ufo/waves/round-66/build/K66MutDeprecProbe/`; no build artifact produced.

## Limits
- Requested >=15 mutant fixtures, pristine/mutant/restored detector executions, verdicts, and scratch cleanup were not completed. No claim that any mutant survives or is killed. Frozen files were not modified. No scratch campaign files were created.

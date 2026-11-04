# QUALITY.md criterion draft: Q70

- **Q70 — every N/N tally in SCORECARD, SKILL, or a report must name a committed transcript path or be marked unverifiable (round 74).** Grounding: `considerthese/2026-10-26.md` proposal 1 ("Check that every number has a transcript"), mined 2026-11-04 in round 74; defects R63-D2 (selftest tallies stated in prose without a transcript, 69/69) and R64-D1 (125 cases stated in prose versus 52/52 committed).
  - **Who checks.** The lane before filing a report or committing SCORECARD/SKILL updates; the non-author closure re-verifies each cited tally against its committed transcript file.
  - **Command.** For each `N/N` tally or integer count claim in `SCORECARD.md`, `SKILL.md`, or a filed round report: `grep -oE '[0-9]+/[0-9]+' <file>` and verify that the sentence cites a committed transcript or receipt path under `.ufo/waves/round-<N>/` containing that exact tally (`git show <rev>:<path> | grep -F '<tally>'`); any tally without a resolvable committed transcript must carry an explicit `unverifiable` or `recalled` label (Q3 discipline).
  - **Fails when.** An `N/N` case count, selftest tally, or checklist score appears in prose without citing a committed transcript path; the cited transcript path does not exist at the judged commit; the transcript's recorded tally differs from the prose claim; or an unreceipted number is claimed without being marked unverifiable.
  - **Shown able to fail.** `considerthese/2026-10-26.md` §Things worth watching item 2: round 63 claimed 69/69 in prose without a transcript, and round 64 cited 125 cases against a committed 52/52.
  - **Limit.** Scoped to `N/N` tallies and case counts in `SCORECARD.md`, `SKILL.md`, and round reports; historical round sections are not rewritten in place (append-only); does not replace gate-level diffing (`report-receipt-diff`).
  - **Supersedes.** None. Deepens Q3 (dated re-run or recalled label for counts) and Q24/Q55 (receipt-integrity disciplines) by requiring explicit transcript paths for fractional and ratio tallies.

Used-by: considerthese/2026-10-26.md (proposal 1, mined 2026-11-04 for QUALITY Q70 in round 74).

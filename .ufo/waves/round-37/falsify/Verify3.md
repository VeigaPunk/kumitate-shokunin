D3 present=no honest=no verdict=refuted

Counterexample: the round-37 lesson claims the D3 corrections were appended, but its named SCORECARD correction is absent and the live row still contradicts the claim. The unchanged round-36 Mistakes row and SCORECARD limits text also retain the false shipped-rule description.

Command: `git diff --unified=0 91da27c6 -- SCORECARD.md corpus/lessons/round-36.md corpus/lessons/round-37.md`
Output: `2 files changed`; SCORECARD's only hunks change `C2=82`/`C2_total=82` to `84` and re-pin `claims-check`. `corpus/lessons/round-36.md` is absent from the diff. No round-37 SCORECARD appendix was added.

Command: read `SCORECARD.md:316:raw`
Output: `| coverage:runtime-layer | 10 | floor(10 × 11/11 × 83/92) = 9 ... | round 18 (current fleet cycle, 2026-10-15) |`

This directly contradicts `corpus/lessons/round-37.md:24-25`: “Axes runtime row now reads `92/92`.” The actual row still says 83/92 = 9 while its score is 10.

Command: read `SCORECARD.md:1687-1703` and `corpus/lessons/round-36.md:20`
Output: SCORECARD still says “the pairing is a 14-char adjacent-span heuristic with a clause guard”; round-36 `## Mistakes` still says “Clause-guarded pairing.” The SCORECARD tail ends in the Round-36 pre-registration/planned-next-round text, not a named Round-37 correction.

Command: grep D3-related terms in `SCORECARD.md` and both lessons
Output: SCORECARD move-log line 399 still quotes `C2=81/81`; round-37 lesson line 25 says stale `C2=81/81`/`82/82` quotes are named in a SCORECARD round-37 note, but no such note exists. The round-36 lesson still records the uncorrected 81/81 figure.

Impacted axes: `coverage:runtime-layer` (stale 83/92 evidence beside score 10); operability/calibration (the claimed D3 disposition is not supported by the tree).

Smallest safe correction: append a clearly named round-37 correction to SCORECARD and the round-36 lesson, preserving their historical claims as history but stating the shipped rule was right-first, the corrected live runtime evidence is 92/92 = 10, and clarifying the old C2 quotes versus the current count. Remove or amend the round-37 lesson's assertion that these corrections are already present.
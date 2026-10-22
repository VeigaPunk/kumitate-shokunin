RESULT CritAxisAccounting rev=fae386aa9e0542710b7a893d84c8e92e86fc079b verdict=qualified misstated=2 (no axis integer is wrong; the distinct-axis rule is not met by two claims and the lesson says so; the round-41 LOG entry and the operability row's Last change cell are mis-stated)

Rules: AXES.md:30-33 says two claims on one axis count as one claim, and :40-41 says a capability claim "still lands a per-axis verdict". Lane rule (SCORECARD.md:22): f_O = (A+C)/(A+C+3), score = floor(10 x f_O). Saturation line 9 (SCORECARD.md:1689).
Scratch clone /fast/scratch/hyaku/kumitate-r41a2/seats/CritAxisAccounting/lane, with worktrees at a58b7f72, 68db3419 and fae386aa.

1. The integers are right. A = `git ls-tree -r --name-only <rev> | grep -E '\.(mjs|js|sh|py)$' | wc -l`, the same file set as the frozen find. C = `git show <rev>:SKILL.md | grep -c '^\s*- \['`.
   a58b7f72 A=8 C=15 f_O=23/26 floor=8 | 68db3419 A=8 C=15 23/26 8 | 4e58bb0e A=9 C=17 26/29 8 | fae386aa A=9 C=17 26/29 8
   23/26 = 0.8846 (stated about 0.885) and 26/29 = 0.8966 (stated about 0.897). 27/30 = 0.9, so "9 needs A+C >= 27, one more item" is right.
   `node scripts/proxy-check.mjs --src /fast/scratch/hyaku/kumitate-pin/src`, exit code in brackets:
   fae386aa: PROXY: MATCH (A=9 C=17 operability=8; C1=19/19 C2=92/92 coverage=10; S=88/88 ... =10; R=92/92 ... =10; K=52/52 ... =10; pins=6 match) [0]
   68db3419: PROXY: MATCH (A=8 C=15 operability=8; ... C2=91/91 ...) [0]
   a58b7f72: PROXY: DRIFT (C2_TOTAL_DRIFT declared=90 computed=91; AXES_DRIFT coverage 10/9) [1]. This is the round-open README row that was fixed at 34fccc17 (R40-7).
   No axis is harmed: every coverage axis reads 10 at the tip. One new warning appears: PIN_UNPINNED scripts/wave-census.mjs. It does not change the verdict and is recorded in the lesson's open limits.
   Both new checklist items run: `node scripts/wave-census.mjs --round 40` gives `WAVE_CENSUS: CLEAN (rounds=1 waves=2 findings=0)` exit 0, and `--selftest` gives `VERDICT: PASS` exit 0 (SKILL.md:690-691; the checklist runner prints PASS for both).

2. Attribution and the distinct-axis rule. C1 changes no operability proxy term: `git diff --stat a58b7f72 68db3419 -- SKILL.md scripts/` shows only scripts/cite-check.mjs (+93), and C stays 15 at 68db3419.
   The whole f_O walk comes from C2 at 4e58bb0e (scripts/wave-census.mjs is A+1; checklist lines 690-691 are C+2).
   So both claims land on operability, the rule counts them as one claim, and the distinct-axis rule is NOT met by two claims.
   The lowest-axis duty is met: operability 8 is the only non-retired axis below 10. The round is admissible as one counted operability claim plus the wave-census capability row. Lesson :41-45 and SCORECARD.md:1822-1824 state this correctly.

3. Mis-stated, first item: LOG.md:1818 opens the round-41 entry with "Two claims." and never applies the distinct-axis rule, so it contradicts the lesson's and SCORECARD's accounting.
   Smallest safe fix: "Two declared claims, one counted claim under the distinct-axis rule (C2's per-axis verdict lands on operability: A 8 -> 9, C 15 -> 17)."

4. Mis-stated, second item: the `## Axes` operability Last change cell (SCORECARD.md:313) reads "round 35", and neither correction gives the true value.
   Round-40 correction (:1788) says "Last change is round 34, not later". Round-41 correction (:1814-1815) only says the cell "reads round 35, not round 34".
   The integer last changed in round 11 (LOG.md:315 "round 11 (operability 7 -> 8)"; Move log :446 f_O 9/12 -> A=4).
   By the lane's own convention for integer-held moves (the kimi-layer row's Last change is round 40, an integer-held move), it is round 41.
   Either way, "round 35" and "round 34" are both wrong.
   Smallest safe fix: one line in the round-41 correction list: "operability Last change: integer 8 since round 11; last move round 41 (f_O 23/26 -> 26/29)".

5. Wording, not counted: "(the round-34 shape)" at SCORECARD.md:1824 and lesson :45 is only half right. Round 34 had "Two declared claims, causally separable, distinct axes" (LOG.md:1417-1418): operability plus sources-registry as one claim, and coverage:kimi-layer as a second axis. Round 41 moves only one axis.

6. Outside axis accounting, not counted: LOG.md:1827 says "R40-2 recorded and re-measured by the falsify wave". ReviewHonestReMeasure is task 18 of 34 in falsify-dispatch.json, but `git ls-tree -r --name-only HEAD .ufo/waves/round-41/falsify | grep -c HonestReMeasure` gives 0.
   Lesson :140 says the re-measure is "not done this round", so the LOG sentence claims more than its evidence.

Side observation: `node scripts/surface-probe.mjs --checklists` in a bare clone at fae386aa reads `CHECKLIST: 14/17 pass`. The C term counts listed items, so this is not an axis error.
Tools installed or updated: none. Lane writes: this report only.

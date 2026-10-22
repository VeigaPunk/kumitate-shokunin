RESULT CritQualityCriterion rev=1530a75521345e0f4516ed7146180e65f788e017 verdict=weak other_gate_survivor=yes

Target: corpus/QUALITY.md Q20 (added after Q19 at 1530a755). Clone: /fast/scratch/hyaku/kumitate-r40/seats/CritQualityCriterion/lane, detached at 1530a755. Mutant runner: ../mut.sh (copies scripts/, replaces one string, runs `node scripts/<gate> --selftest`). Node v24.21.0. No tools installed.

Grounding: sound. Q20 cites R39-5 (corpus/lessons/round-39-verifier-spotcheck.md:151) and tameshi round-26-verifier-spotcheck.md:172-179; I read both and they match. The receipt .ufo/waves/round-40/final/cite-zero-resolved-red-before.txt shows the red-before state: 62/62 with the mutant at f69817ed, the fixture reading FAIL at base and PASS under the mutant, and 63/64 with the fix. Lane master 0004ae3 adds corpus/lessons/round-40.md `## Mistakes` row 1, which names Q20 as its fix.
Fix shown able to fail: sound for the one guard it names. I reproduced it: C1 `filesScanned > 0 && !drift` gives `63/64 cases passed (hermetic)`, VERDICT: FAIL, rc=1 (killed). C2 `filesScanned >= 0 && …` gives 64/64, rc=0 (survived). C2 really is equivalent: `resolved++` (cite-check.mjs:1583) only runs after `filesScanned++` (:1556) in the same loop.

Counterexample 1, the same class inside the gate Q20 cites. Q20 says every term, including `!drift`, must have a case. But `drift` is `totals.error > 0 || (opts.strict && totals.warn > 0)` (:1589), and the strict arm has no case pinning it. The round-40 sweep (M1, E1-E4) only mutated line 1590. No selftest line after :1841 contains `strict`.
  $ ./mut.sh C3 cite-check.mjs "...|| (opts.strict && totals.warn > 0);" "const drift = totals.error > 0;"
  MUTANT C3 rc=0 :: 64/64 cases passed (hermetic)  VERDICT: PASS   -> survived
  $ ./mut.sh C4 ... "const drift = totals.error > 0 || (totals.warn > 0);"
  MUTANT C4 rc=0 :: 64/64 cases passed (hermetic)  VERDICT: PASS   -> survived
  The mutants are not equivalent. Fixture fx/cself has one SUFFIX_RESOLVED warning and 4 OK citations; I ran `node <v>/scripts/cite-check.mjs --src fx/csrc --self fx/cself --fleet fx [--strict]`:
  lane   --strict  rc=1 VERDICT: FAIL CITE_CHECK: DRIFT (files=2 tokens=5 errors=0 warnings=1)
  mut-C3 --strict  rc=0 VERDICT: PASS CITE_CHECK: CLEAN (files=2 tokens=5 errors=0 warnings=1)
  lane   nonstrict rc=0 VERDICT: PASS CITE_CHECK: CLEAN
  mut-C4 nonstrict rc=1 VERDICT: FAIL CITE_CHECK: DRIFT
  SKILL.md:599 advertises `cite-check [--strict]`. So Q20's sentence that only one further mutant survives, and that it is equivalent, is premature saturation: two non-equivalent survivors remain in the verdict expression itself.

Counterexample 2, another gate (sources-check.mjs): a verdict guard that no selftest pins.
  The JSON verdict (`const verdict = exitCode === 1 ? 'DRIFT' : 'CLEAN';`, :459) is asserted only on a clean fixture (:816).
  $ ./mut.sh S1 sources-check.mjs "const verdict = exitCode === 1 ? 'DRIFT' : 'CLEAN';" "const verdict = 'CLEAN';"
  MUTANT S1 matches=1 rc=0 :: SOURCES_SELFTEST: 46/46 pass  VERDICT: PASS   -> survived (baseline 46/46)
  It is not equivalent. fx/src1 is the lane corpus with the first `| S001 |` row changed to `| S01 |`:
  lane   rc=1 verdict=DRIFT exitCode=1 errors=2 kinds=ID_FORM,ENTRY_SOURCE_UNKNOWN
  mut-S1 rc=1 verdict=CLEAN exitCode=1 errors=2 kinds=ID_FORM,ENTRY_SOURCE_UNKNOWN
  This is the R39-5 shape exactly: the verdict field flips to CLEAN while the exit code stays non-zero. S3 (JSON `totals.errors` forced to 0) also survives 46/46.
  Control mutants, killed: S2 (strict dropped from effectiveSeverity) 43/46. round-gate R1 (drop `strict &&`) 56/60, R2 (drop the strict arm) 57/60, R3 (verdict forced CLEAN) 55/60. round-gate's summarize() verdict is fully pinned.

Gap Q20 cannot see: an absent guard. On a SOURCES.md with zero registry rows and an empty corpus/knowledge, `node lane/scripts/sources-check.mjs --self fx/empty` prints `SOURCES_CHECK: CLEAN (rows=0 ...)` with rc=0. That is the empty-input twin of zero-resolved. Q20 covers only guards that already exist, so this is a scope tradeoff, not a survivor.

Impacted axes: operability. Q20 is a written rule with no sweep that enforces it, and at the measured candidate it is broken in its own exemplar gate and in sources-check.
Smallest safe correction:
(a) cite-check selftest: add one fixture with an OK citation and a SUFFIX_RESOLVED warning. Assert run({strict:true}) gives FAIL and run({}) gives PASS. This kills C3 and C4.
(b) sources-check selftest: add a `--json` case on a drift fixture asserting `verdict === 'DRIFT'`, `exitCode === 1` and `totals.errors > 0`. This kills S1 and S3.
(c) Q20 text: name the sub-terms of `drift`, including the `strict` arm, as terms. Replace "one further mutant … survives" with the full sweep result.

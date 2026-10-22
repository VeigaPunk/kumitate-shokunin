RESULT CritC1Final rev=fae386aa9e0542710b7a893d84c8e92e86fc079b verdict=revise after_rederived=0/16 split_text=13+1+2 env_counterexample=4/16 tip_receipt=absent
Clone /fast/scratch/hyaku/kumitate-r41a2/seats/CritC1Final/lane detached at fae386aa; node v24; TMPDIR under my seat; no installs; no lane writes except this file.
Why revise, not reject: the after value holds and one command over committed bytes re-derives it at the tip. The defects are wording and provenance that can be fixed; none of them changes the target.
1. After value at the tip (re-derivable: yes):
   $ TMPDIR=$PWD/tmp node --input-type=module - --lane lane --rev fae386aa… < lane/.ufo/waves/round-41/probe/cite-verdict-mutants.mjs.txt
   `CONTROL unmutated PASS exit=0 cases=75/75` … `CITE_MUTANTS survived=0/16 nomatch=0 crash=0 control=PASS rev=fae386aa…` (all 16 lines match final/cite-mutants-measured-4e58bb0e.txt)
   Before, same command at a58b7f72: `survived=15/16 nomatch=0 crash=0 control=PASS` (matches the receipt).
2. Provenance gap: the claimed after revisions predate the tip bytes. Lesson C1 says "After, at 68db3419". The Move log row says "at 68db3419 and 4e58bb0e".
   $ git log --oneline a58b7f72..fae386aa -- scripts/cite-check.mjs → 5320e0d (self-observation guard), 68db341
   $ git merge-base --is-ancestor 4e58bb0e 5320e0d → ancestor; git diff --stat 4e58bb0e fae386aa -- scripts/cite-check.mjs → 7 insertions, 3 deletions
   final/ has no receipt at 5320e0d or fae386aa. Correction: add "and at the tip fae386aa (same 16 lines)" and commit item 1's output as final/cite-mutants-measured-fae386aa.txt.
3. The 13-of-16 versus 3 caveat is miscounted. Text-mode `--selftest` per mutant at fae386aa (my driver m3.mjs applies the probe's own anchor and replacement pairs):
   12 condition mutants plus suite-exit-json: exit=1, `VERDICT: FAIL`
   suite-exit-text: exit=0, `74/75 cases passed`, `VERDICT: FAIL`, 1 FAIL line
   suite-group-verdict: exit=0, `73/75`, `VERDICT: PASS`, 2 FAIL lines (json: exit=0 verdict=PASS group0=PASS)
   suite-any-fail: exit=0, `73/75`, `VERDICT: PASS`, 2 FAIL lines (json: exit=0 verdict=PASS group0=FAIL)
   suite-exit-json under --json: exit=0 verdict=FAIL
   So 14 of 16, not 13, "exit non-zero or print `VERDICT: FAIL`". suite-exit-text is not "visible only as FAIL case lines": it prints `VERDICT: FAIL`. The lesson sentence contradicts its own next clause ("checklist item 2 would accept two of them"; it accepts only group-verdict and any-fail, which is correct). SKILL.md:599 has the same error ("for 13 … ; for the 3 … the failure shows only as `FAIL ` case lines").
   Correction (lesson C1 and SKILL:599): "13 exit non-zero; suite-exit-text exits 0 but prints `VERDICT: FAIL`; suite-group-verdict and suite-any-fail exit 0 with `VERDICT: PASS` and show only as `FAIL ` case lines and `73/75`, so checklist item 2 accepts those two."
4. The Move log row (SCORECARD.md:399) states `survived=0/16` with no caveat at all. The lesson and SKILL carry the caveat; the scorecard row does not. Correction: add "(2 of the 16, suite-group-verdict and suite-any-fail, only by `FAIL ` lines and 73/75 at exit 0 with `VERDICT: PASS`)".
5. New counterexample: the after value depends on an inherited environment variable. The child marker is "any value", and the probe passes process.env through.
   $ KUMITATE_CITE_SELFTEST_INJECT_FAIL=0 node --input-type=module - --lane lane --rev fae386aa… < probe → `CONTROL unmutated PASS exit=0 cases=73/73` … `MUTANT suite-group-verdict|suite-any-fail|suite-exit-json|suite-exit-text survived … cases=73/73` → `CITE_MUTANTS survived=4/16 nomatch=0 crash=0 control=PASS`
   With the variable set to an empty string: the same, `survived=4/16 control=PASS`.
   $ KUMITATE_CITE_SELFTEST_INJECT_FAIL=0 node scripts/cite-check.mjs --selftest → two `SKIP  suite self-observation …` lines, `73/73 cases passed (hermetic)`, `VERDICT: PASS`, exit 0, so checklist item 2 passes too.
   The lesson's open limit covers a skip mutant, but no unmutated run in a polluted environment. Correction: record the counter command as `env -u KUMITATE_CITE_SELFTEST_INJECT_FAIL node --input-type=module - …` in the Move log row and the registry row, and add one open-limits line. The counter is frozen, so do not edit it. A code fix (such as a child marker that a parent shell cannot leak in) is a round-42 item.
6. Universal words and sizing checked (each check could have failed):
   "each of the 16": bounded by the plan's frozen set ("Only these 16") and the scout's first line `unpinned=16 [warn-total … suite-exit-text]`. nomatch=0 shows every anchor once. Not oversized.
   "Eleven hermetic cases (64 → 75)": `git diff a58b7f72 fae386aa -- scripts/cite-check.mjs` has 11 added `check(` lines and 0 removed; control 64/64 → 75/75.
   "read only inside selfTest()": `grep -n KUMITATE_CITE_SELFTEST_INJECT_FAIL scripts/cite-check.mjs` → only :2458 (const INJECT41), and selfTest starts at :1841 and still runs at :2490. Holds.
   "cannot recurse": holds for the unmutated tip, because the child branch (:2459) pushes SKIP and never calls child41. Mutated guards are covered by the open limit.
   "A suite cannot pin its own aggregator through an exit code the same aggregator computes": I accept it as a tradeoff and it is true as worded. Item 3 shows the aggregator's own VERDICT line does catch suite-exit-text, so the sentence must stay limited to the exit code.
Impacted axes: operability (items 2 to 5). No coverage impact found.
Smallest safe correction: wording edits from items 2 to 5 in lesson C1, SKILL.md:599 and SCORECARD.md:399, plus one committed tip receipt (item 1 output). No code change and no change to the counter or the target.

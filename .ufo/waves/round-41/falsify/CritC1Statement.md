RESULT CritC1Statement rev=4e58bb0ee48a069ac7dbd99b6e5afe70dcd36ba3 verdict=overstated consistent=no probe_def_killed=16/16 exit_only_survived=3/16 skill_checklist_survived=2/16
Counterexample: with `suite-group-verdict` or `suite-any-fail` active, `node scripts/cite-check.mjs --selftest` prints `VERDICT: PASS` and exits 0, in text and in `--json`. That meets the SKILL.md:676 acceptance line (`--selftest` → exit 0 + `VERDICT: PASS`), so the gate's own published check accepts both mutants. The only kill signal is two per-case `FAIL ` lines and `73/75`, which the probe reads and the gate contract does not.
Evidence (scratch clone /fast/scratch/hyaku/kumitate-r41/seats/CritC1Statement/lane, detached at 4e58bb0ee48a069ac7dbd99b6e5afe70dcd36ba3, node v24.21.0):
1. Probe reproduced: `node --input-type=module - --lane lane --rev 4e58bb0e… < .ufo/waves/round-41/probe/cite-verdict-mutants.mjs.txt`
   `CONTROL unmutated PASS exit=0 cases=75/75 fail_lines=0`
   `MUTANT suite-group-verdict killed exit=0 cases=73/75 fail_lines=2`
   `MUTANT suite-any-fail killed exit=0 cases=73/75 fail_lines=2`
   `MUTANT suite-exit-text killed exit=0 cases=74/75 fail_lines=1`
   (13 others killed with exit=1) `CITE_MUTANTS survived=0/16 nomatch=0 crash=0 control=PASS`. Under the probe's own definition (header line 7: killed = non-zero exit, OR a `FAIL ` line, OR `VERDICT: FAIL`, OR fewer passed than ran), "pinned" holds for 16/16.
2. Direct run of the three mutants (scratch script m3.mjs, same snippet replacements as the probe), text and `--json`:
   suite-group-verdict: text exit=0, `73/75 cases passed (hermetic)`, `VERDICT: PASS`; json exit=0 top.verdict=PASS
   suite-any-fail: text exit=0, `73/75 cases passed (hermetic)`, `VERDICT: PASS`; json exit=0 top.verdict=PASS
   suite-exit-text: text exit=0, `VERDICT: FAIL`; json exit=1 top.verdict=FAIL
   The failing cases are both self-observation cases, for example `FAIL  suite self-observation: injected failure → text VERDICT FAIL, exit 1 — exit=0 verdict=VERDICT: PASS`. The child observed the mutant correctly, but the parent's aggregation is the mutated code, so the parent hides its own failure.
3. Reading by observer:
   probe (per-case lines): survived 0/16
   SKILL.md:676 checklist (exit 0 + `VERDICT: PASS`): survived 2/16 (group-verdict, any-fail)
   exit code only (CI, `&&` chains, Stryker command runner): survived 3/16 (adds suite-exit-text)
4. S034 check. The page https://stryker-mutator.io/docs/mutation-testing-elements/mutant-states-and-metrics/ (HTTP 200, curl, 2026-10-22) says: "When at least one test failed while this mutant was active, the mutant is killed." and "When all tests passed while this mutant was active, the mutant survived." Stryker's configuration page https://stryker-mutator.io/docs/stryker-js/configuration/ (HTTP 200) explains how a test failure is observed for a whole-process suite: "The command runner runs a configurable bash/cmd command and bases the result on the exit code of that program (0 for success, otherwise failed)."
   `--selftest` is one process with one exit code, so the command-runner rule is the Stryker model that fits it. Under that rule the three mutants are survived, not killed. Counting them killed is consistent only with a per-test-framework reading, where the unmutated per-case render lines play the role of test results. That reading is defensible, but the lane never states it, and the gate contract does not expose it.
5. Wording in scope. SKILL.md:599 says "the 16 verdict, render and exit conditions each pinned … → `survived=0/16`". corpus/lessons/round-41.md:11 says "now pins the 16", and lines 17–18 say the injected child "must … end `VERDICT: FAIL` and exit 1". That holds for the child, but under two of the mutants the parent ends `VERDICT: PASS` with exit 0. Neither text says that 3 of the 16 are detected only through case lines while the process exits 0.
Impacted axes: operability. A maintainer or CI that trusts exit code plus VERDICT would ship a broken suite aggregator. It is also false provenance for "pinned" under the S034 vocabulary the lane cites.
Defect class: fixable wording plus check. The self-reference limit itself is a tradeoff: a suite cannot pin its own aggregator through an exit code that the same aggregator computes.
Smallest safe correction:
(a) SKILL.md:599: "13 pinned through exit code and `VERDICT`; 3 suite-aggregation conditions (suite-group-verdict, suite-any-fail, suite-exit-text) are detected only by `FAIL ` case lines and an `n/m` count below m while the run exits 0". Mirror this in lesson line 11.
(b) SKILL.md:676: "exit 0 + `VERDICT: PASS` + every `n/n cases passed` line full and no `FAIL ` line". With this check, all 16 mutants are detected by the documented gate check (shown in item 2: each of the three has at least one `FAIL ` line or an `n/m` below m).
Not run: no patch written (critic seat). The 14 severity conditions are out of scope (lesson line 79).
Tools: no installs or updates. I used curl and node v24.21.0, both already present.

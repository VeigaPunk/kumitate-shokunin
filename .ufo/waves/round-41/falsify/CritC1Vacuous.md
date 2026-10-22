RESULT CritC1Vacuous rev=4e58bb0ee48a069ac7dbd99b6e5afe70dcd36ba3 verdict=confirmed vacuous=0/16
Clone: /fast/scratch/hyaku/kumitate-r41/seats/CritC1Vacuous/lane, detached at 4e58bb0e. Each mutant used the probe's anchor/replacement pair, applied once to scripts/cite-check.mjs (each anchor occurs exactly once). Then `node scripts/cite-check.mjs --selftest` ran from the clone root and the file was restored. Driver: seats/CritC1Vacuous/run-mutants.mjs. Log: mutants.log, per-mutant output in out/. Result: `RESTORED true`, and `git status --porcelain` printed nothing.
Control (unmutated, run 3 times): `75/75 cases passed (hermetic) VERDICT: PASS exit=0` every run, so each failing case below passes without its mutant.
Determinism: a second full run matched the first after masking times and temporary-directory names (`RUN2_IDENTICAL`). Nothing timed out or crashed: every run had signal=null, took 845 to 949 ms, and printed a `cases passed` line. The counter rerun gave `CITE_MUTANTS survived=0/16 nomatch=0 crash=0 control=PASS rev=4e58bb0e...`, matching final/cite-mutants-measured-4e58bb0e.txt.

| mutant (line) | failing case(s): observed value (control value) | vacuous |
|---|---|---|
| warn-total (1581) | warn-only default: `warnings=0` (1); warn-only --strict: `verdict=PASS citeCheck=CLEAN`; exit contract clean/strict: `strictWarn=0` (1) | no |
| resolved-kind-gate (1583) | warn-only default: `resolved=3 okFindings=2` (2/2) | no |
| strict-conjunct (1589) | warn-only default: `verdict=FAIL citeCheck=DRIFT` (PASS/CLEAN) | no |
| strict-warn-arm (1589) | warn-only --strict: `verdict=PASS` (FAIL); exit contract clean/strict: `strictWarn=0` (1) | no |
| resolved>0 (1590) | zero resolved: `resolved=0 errors=0 verdict=PASS` (FAIL) | no |
| citeCheck-map (1595) | warn-only --strict: `verdict=FAIL citeCheck=CLEAN` (DRIFT); citeCheck maps FAIL to DRIFT: `citeCheck=CLEAN` (DRIFT) | no |
| render-env-empty (1626) | text render empty: `(environment: zero-resolutions)` (empty-scan-set) | no |
| render-env-zero (1626) | text render zero: `(files=2 tokens=0 errors=0 warnings=0)` (zero-resolutions) | no |
| exit2-empty (2660) | exit contract empty: `exit=2 ... zero resolved citations` (empty scan set) | no |
| exit2-zerores (2661) | exit contract zero: `exit=1`, empty stderr (exit=2) | no |
| exit0/1-map (2668) | exit contract clean/strict: `clean=0 strictWarn=0` (strictWarn=1) | no |
| parse-64 (2645) | exit contract unknown argument: `exit=0` (64) | no |
| suite-group-verdict (2604) | self-observation text: `exit=0 VERDICT: PASS`; self-observation json: `exit=0 verdict=PASS group=PASS` (exit=1 FAIL/FAIL) | no |
| suite-any-fail (2607) | self-observation text: `exit=0 VERDICT: PASS`; self-observation json: `verdict=PASS group=FAIL` (exit=1 FAIL) | no |
| suite-exit-json (2618) | self-observation json: `exit=0 verdict=FAIL group=FAIL` (exit=1) | no |
| suite-exit-text (2635) | self-observation text: `exit=0 VERDICT: FAIL` (exit=1) | no |

Why none is vacuous: every failing case's detail shows the value that the mutated expression produces, it differs from the control value, and no failure comes from a timeout, a crash or an unrelated assertion. The four suite mutants are killed through the injected child `--selftest`, which runs with the mutant active. Those cases assert the child's exit status and verdict, which is exactly what each mutant changes.

Limits (counterexamples tried; none makes a kill vacuous):
1. Outer exit status. The outer `--selftest` exits 0 for suite-group-verdict and suite-any-fail (`73/75 ... VERDICT: PASS`, exit 0) and for suite-exit-text (`74/75 ... VERDICT: FAIL`, exit 0). A gate that reads only the exit status would score these 3 as survived. They count as killed only because a `FAIL ` case line is printed (the Stryker rule, and the probe's `fail_lines>0 || p<n` rule). The counter receipt shows the same (`killed exit=0`).
2. exit2-empty and render-env-empty change only a message or label, never the exit status. An empty scan set also resolves nothing, so the zero-resolved arm still returns exit 2 (`exit=2 cite-check: fail-closed — zero resolved citations under .../self-empty-41`). The kills are real because the cases assert the text, but the `filesScanned === 0` arm adds no exit behaviour beyond the `resolved === 0` arm.
3. Thin coverage. resolved-kind-gate, strict-conjunct, resolved>0, both render mutants, exit2-zerores, exit0/1-map, parse-64 and suite-exit-json are each killed by exactly one case. Removing any one of those cases would let its mutant survive.
Provenance: corpus/lessons/round-41.md:22 and :51 place the "after" result at 68db3419, while the plan measures at 4e58bb0e. `git merge-base --is-ancestor 68db3419 HEAD` printed `ancestor`, and `git diff --stat 68db3419 HEAD -- scripts/cite-check.mjs` printed nothing. Both receipts read survived=0/16, so the claim holds at the measured revision.
Smallest safe correction: none is needed for C1. Optional: state in the lesson that 3 of the 16 kills are visible only as case FAIL lines, not in the `--selftest` exit status.
Tools installed or updated: none. No patch: this seat is a reviewer and edited no lane file.

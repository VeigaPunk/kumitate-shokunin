RESULT MutCiteOpen rev=dfabe92bcec021f5beec457fb50cec484e047e35 verdict=pass survived=0/16 nomatch=0 control=PASS
Probe command: `timeout --signal=TERM --kill-after=5s 60s node --input-type=module - --lane /fast/scratch/hyaku/kumitate-r42/seats/MutCiteOpen/lane --rev dfabe92bcec021f5beec457fb50cec484e047e35 < .ufo/waves/round-41/probe/cite-verdict-mutants.mjs.txt` (outer process group; completed in 15.86 s).
CONTROL unmutated PASS exit=0 cases=75/75 fail_lines=0
MUTANT warn-total killed exit=1 cases=72/75 fail_lines=3
MUTANT resolved-kind-gate killed exit=1 cases=74/75 fail_lines=1
MUTANT strict-conjunct killed exit=1 cases=74/75 fail_lines=1
MUTANT strict-warn-arm killed exit=1 cases=73/75 fail_lines=2
MUTANT resolved>0 killed exit=1 cases=74/75 fail_lines=1
MUTANT citeCheck-map killed exit=1 cases=73/75 fail_lines=2
MUTANT render-env-empty killed exit=1 cases=74/75 fail_lines=1
MUTANT render-env-zero killed exit=1 cases=74/75 fail_lines=1
MUTANT exit2-empty killed exit=1 cases=74/75 fail_lines=1
MUTANT exit2-zerores killed exit=1 cases=74/75 fail_lines=1
MUTANT exit0/1-map killed exit=1 cases=74/75 fail_lines=1
MUTANT parse-64 killed exit=1 cases=74/75 fail_lines=1
MUTANT suite-group-verdict killed exit=0 cases=73/75 fail_lines=2
MUTANT suite-any-fail killed exit=0 cases=73/75 fail_lines=2
MUTANT suite-exit-json killed exit=1 cases=74/75 fail_lines=1
MUTANT suite-exit-text killed exit=0 cases=74/75 fail_lines=1
CITE_MUTANTS survived=0/16 nomatch=0 crash=0 control=PASS rev=dfabe92bcec021f5beec457fb50cec484e047e35
PROBE_EXIT=0; LEFTOVERS=0
Baseline `sha256sum scripts/cite-check.mjs`: `896f0720b7fe7492806b0a5b7458a995de1d666d6759297675b7d964872c6d0e`.
Baseline command: `timeout --signal=TERM --kill-after=5s 60s node scripts/cite-check.mjs --selftest`; output ended `75/75 cases passed (hermetic)`, `VERDICT: PASS`, exit 0; leftovers 0.
Attack mutant: changed the selftest registration callback to omit only `bogus-path → UNRESOLVED error`; this removes one case from the suite.
Mutant `sha256sum scripts/cite-check.mjs`: `c734fc330bf3da9ba6d049a93f00e15a127e3f43c691558137b6ba0f7b5b3d8e`.
Mutant command: `timeout --signal=TERM --kill-after=5s 60s node scripts/cite-check.mjs --selftest`; output ended `74/74 cases passed (hermetic)`, `VERDICT: PASS`, exit 0; leftovers 0.
The committed probe predicate also requires `p < n`; applied to this result, `p=n=74`, exit 0, no failure lines, so it would classify the missing-case suite as survived.
Restoration: `sha256sum scripts/cite-check.mjs` returned the original `896f0720b7fe7492806b0a5b7458a995de1d666d6759297675b7d964872c6d0e`.
Restored command: `timeout --signal=TERM --kill-after=5s 60s node scripts/cite-check.mjs --selftest`; output ended `75/75 cases passed (hermetic)`, `VERDICT: PASS`, exit 0; leftovers 0.
Gate-mutants should capture the control suite's case inventory and count, then require every mutated run to report that same inventory and count. A changed suite is a harness error (exit 2), never a kill or survival; comparing names as well as count catches replacement cases.
Tool installs or updates: none.
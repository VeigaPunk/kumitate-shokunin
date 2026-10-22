RESULT ExecCiteWitness rev=8ccb027577b37e633bc70251fe6deb95fd363fca verdict=partial cite_killed=18/18 selftest=75/75 median_ms_before=2404 median_ms_after=2466 patch_sha256=4d06a116d93ebede3079eb00604e886ffa1f239612776004170078d50ac522a8
Commit 8ccb027577b37e633bc70251fe6deb95fd363fca; changed only scripts/cite-check.mjs.
Patch: /fast/scratch/hyaku/kumitate-r43/seats/ExecCiteWitness/ExecCiteWitness.patch (sha256 above).
Text selftest now counts non-skipped failing recorded results independently, appends exact VERDICT: FAIL if needed, and returns 1; JSON and non-selftest paths are unchanged.
The existing text injected-failure observation also pins the primary text return mapping; control total remains 75; no existing case removed or weakened.
Timing command: systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 600 bash -c 'TIMEFORMAT="base_elapsed_s=%3R"; time node /fast/scratch/hyaku/kumitate-r43/seats/ExecCiteWitness/baseline/scripts/cite-check.mjs --selftest >/dev/null'. 3 runs: 2404, 2825, 2396 ms; median 2404 ms (baseline clone at e5ffcbe7f155b89cb1870f9da7b0d671d092948b).
Timing after, same command with lane/scripts/cite-check.mjs: 2392, 2712, 2466 ms; median 2466 ms. Delta +62 ms; run-to-run ranges overlap (baseline 429 ms, after 320 ms); [INFERENCE] this does not show material added cost.
Load context: /proc/loadavg first field ranged 52.05–53.21 across the interleaved timing runs.
Final node scripts/gate-mutants.mjs --selftest (4G/128/600): GATE_MUTANTS_SELFTEST: 28/28 pass; all-manifest-literals-apply-once unapplicable=none; leftovers=0.
Normal selftest: 75/75 PASS; text and JSON injected-failure self-observation cases PASS; primary-map=1.
render-env-empty mutant: ran 6 times sandboxed under 4G/128/600 with Node --max-old-space-size=128; all six sorted FAIL-name sets were identical (one name below), exit=1, 74/75.
FAIL text render: empty scan set → `CITE_CHECK: DRIFT (environment: empty-scan-set)` — CITE_CHECK: DRIFT (environment: zero-resolutions)
Child-run timeout check across those six runs: bare-run children exited 1, 1, 2; exit-contract children 0/1, 2, 2, 64; injected text/JSON children exited 1; no timeout/null status observed. No nondeterminism reproduced; no timeout was raised.
Frozen counter: KUMITATE_GATE_MUTANTS_TMP=/fast/scratch/hyaku/kumitate-r43/seats/ExecCiteWitness/gm-tmp systemd-run --user --scope --quiet -p MemoryMax=6G -p TasksMax=256 timeout -s KILL 900 node /fast/scratch/hyaku/kumitate-r43/seats/ExecCiteWitness/counter.Q1LWDR/gate-mutants.mjs --repo /fast/scratch/hyaku/kumitate-r43/seats/ExecCiteWitness/lane --rev 8ccb027577b37e633bc70251fe6deb95fd363fca; echo exit=$?
MUTANT cite-check:resolved-kind-gate killed cases=74/75 control=75 fail_lines=1 exit=1 verdict=FAIL group_clean=true fail_lines=1 overflow=false confirm=same
MUTANT cite-check:warn-total killed cases=72/75 control=75 fail_lines=3 exit=1 verdict=FAIL group_clean=true fail_lines=3 overflow=false confirm=same
MUTANT cite-check:strict-conjunct killed cases=74/75 control=75 fail_lines=1 exit=1 verdict=FAIL group_clean=true fail_lines=1 overflow=false confirm=same
MUTANT cite-check:strict-warn-arm killed cases=73/75 control=75 fail_lines=2 exit=1 verdict=FAIL group_clean=true fail_lines=2 overflow=false confirm=same
MUTANT cite-check:citeCheck-map killed cases=73/75 control=75 fail_lines=2 exit=1 verdict=FAIL group_clean=true fail_lines=2 overflow=false confirm=same
MUTANT cite-check:resolved>0 killed cases=74/75 control=75 fail_lines=1 exit=1 verdict=FAIL group_clean=true fail_lines=1 overflow=false confirm=same
MUTANT cite-check:render-env-empty killed cases=74/75 control=75 fail_lines=1 exit=1 verdict=FAIL group_clean=true fail_lines=1 overflow=false confirm=same
MUTANT cite-check:render-env-zero killed cases=74/75 control=75 fail_lines=1 exit=1 verdict=FAIL group_clean=true fail_lines=1 overflow=false confirm=same
MUTANT cite-check:exit2-zerores killed cases=74/75 control=75 fail_lines=1 exit=1 verdict=FAIL group_clean=true fail_lines=1 overflow=false confirm=same
MUTANT cite-check:exit2-empty killed cases=74/75 control=75 fail_lines=1 exit=1 verdict=FAIL group_clean=true fail_lines=1 overflow=false confirm=same
MUTANT cite-check:exit0/1-map killed cases=74/75 control=75 fail_lines=1 exit=1 verdict=FAIL group_clean=true fail_lines=1 overflow=false confirm=same
MUTANT cite-check:parse-64 killed cases=74/75 control=75 fail_lines=1 exit=1 verdict=FAIL group_clean=true fail_lines=1 overflow=false confirm=same
MUTANT cite-check:suite-exit-text killed cases=74/75 control=75 fail_lines=1 exit=1 verdict=FAIL group_clean=true fail_lines=1 overflow=false confirm=same
MUTANT cite-check:suite-any-fail killed cases=74/75 control=75 fail_lines=1 exit=1 verdict=PASS group_clean=true fail_lines=1 overflow=false confirm=same
MUTANT cite-check:suite-group-verdict killed cases=74/75 control=75 fail_lines=1 exit=1 verdict=PASS group_clean=true fail_lines=1 overflow=false confirm=same
MUTANT cite-check:suite-exit-json killed cases=74/75 control=75 fail_lines=1 exit=1 verdict=FAIL group_clean=true fail_lines=1 overflow=false confirm=same
MUTANT cite-check:guard-outer-ne-1 killed cases=73/75 control=75 fail_lines=2 exit=1 verdict=FAIL group_clean=true fail_lines=2 overflow=false confirm=same
MUTANT cite-check:guard-outer-eq-undefined killed cases=73/75 control=75 fail_lines=2 exit=1 verdict=FAIL group_clean=true fail_lines=2 overflow=false confirm=same
GATE_MUTANTS: ERROR (mutants=43 killed=38 frozen=36/41 drift=0 targets=2 rev=8ccb027577b37e633bc70251fe6deb95fd363fca manifest=8486506f859b79ced4865adc34594a3111321e16821a54b1ee114e8d863bb12f leftovers=0) drift=0 nomatch=0 crash=0 unstable=0 timeout=1 overflow=0 control-fail=0; exit=2
MUTANT wave-census:repair/string-agent-check-dropped timeout cases=not-run/not-run control=31 fail_lines=0 timeout=60000ms group_clean=true
Scope blocker: wave-census timed out in the frozen counter; left wave-census and gate-mutants unchanged. Full round CLEAN was not established.
[INFERENCE] Standalone witness mutations such as `witnessFailures > 0` → `witnessFailures < 0`, or the witness branch `return 1;` → `return 0;`, can survive: the primary path passes the clean control and the witness is otherwise dormant. These limits were not separately mutated.
LSP was unavailable in the tool inventory; no tool installs or updates.
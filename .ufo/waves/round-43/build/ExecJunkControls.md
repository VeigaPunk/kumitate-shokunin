RESULT ExecJunkControls rev=e5ffcbe7f155b89cb1870f9da7b0d671d092948b verdict=blind j1=2 j2=2 j3=2 j4=0
Axes: operability; coverage: orchestration and tooling.
Files changed in the lane: this report only. J1–J4 were committed only in separate scratch clones.
Frozen counter: source 0f4108bf66d58eb4cf4642ca1faf0fdeeba06c82; sha256 e24749e4b1eb21f5fb446c05543451b3221e708978fff6938fa6f68c36d4152a.
All four commits start from e5ffcbe7f155b89cb1870f9da7b0d671d092948b: J1 c4b6d44d6898215d12d92a682599caff925bf7e7; J2 0897edb7eccaf20c581579c481fcfcad4f13940e; J3 5effe6e25a794d8dcc960681135bb6fb1a256b75; J4 431d3b63fdca6e28d35d5c653a9e60b0dfc352de.
J1 command: KUMITATE_GATE_MUTANTS_TMP=/fast/scratch/hyaku/kumitate-r43/seats/ExecJunkControls/gm-tmp systemd-run --user --scope --quiet -p MemoryMax=6G -p TasksMax=256 timeout -s KILL 900 node /fast/scratch/hyaku/kumitate-r43/seats/ExecJunkControls/counter.QVfKLq/gate-mutants.mjs --repo /fast/scratch/hyaku/kumitate-r43/seats/ExecJunkControls/j1 --rev c4b6d44d6898215d12d92a682599caff925bf7e7.
J1 tail: `CONTROL cite-check FAIL exit=1 verdict=FAIL group_clean=true fail_lines=0 overflow=false cases=75/75 floor=75`
`CONTROL wave-census FAIL exit=1 verdict=FAIL group_clean=true fail_lines=0 overflow=false cases=31/31 floor=31`
`GATE_MUTANTS: ERROR (mutants=0 killed=0 frozen=0/41 drift=0 targets=2 rev=c4b6d44d6898215d12d92a682599caff925bf7e7 manifest=8486506f859b79ced4865adc34594a3111321e16821a54b1ee114e8d863bb12f leftovers=0) drift=0 nomatch=0 crash=0 unstable=0 timeout=0 overflow=0 control-fail=2`
`exit=2`
J2 command: KUMITATE_GATE_MUTANTS_TMP=/fast/scratch/hyaku/kumitate-r43/seats/ExecJunkControls/gm-tmp systemd-run --user --scope --quiet -p MemoryMax=6G -p TasksMax=256 timeout -s KILL 900 node /fast/scratch/hyaku/kumitate-r43/seats/ExecJunkControls/counter.QVfKLq/gate-mutants.mjs --repo /fast/scratch/hyaku/kumitate-r43/seats/ExecJunkControls/j2 --rev 0897edb7eccaf20c581579c481fcfcad4f13940e.
J2 tail: `CONTROL cite-check FAIL exit=0 verdict=none group_clean=true fail_lines=0 overflow=false cases=not-run/not-run floor=75`
`CONTROL wave-census FAIL exit=0 verdict=none group_clean=true fail_lines=0 overflow=false cases=not-run/not-run floor=31`
`GATE_MUTANTS: ERROR (mutants=0 killed=0 frozen=0/41 drift=0 targets=2 rev=0897edb7eccaf20c581579c481fcfcad4f13940e manifest=8486506f859b79ced4865adc34594a3111321e16821a54b1ee114e8d863bb12f leftovers=0) drift=0 nomatch=0 crash=0 unstable=0 timeout=0 overflow=0 control-fail=2`
`exit=2`
J3 changed only the six distinct target expressions for seven survivor IDs; the M19 exit mutant shares V387's source literal. The counter reported nomatch=7 and also one timeout, cite-check:guard-outer-ne-1.
J3 command: KUMITATE_GATE_MUTANTS_TMP=/fast/scratch/hyaku/kumitate-r43/seats/ExecJunkControls/gm-tmp systemd-run --user --scope --quiet -p MemoryMax=6G -p TasksMax=256 timeout -s KILL 900 node /fast/scratch/hyaku/kumitate-r43/seats/ExecJunkControls/counter.QVfKLq/gate-mutants.mjs --repo /fast/scratch/hyaku/kumitate-r43/seats/ExecJunkControls/j3 --rev 5effe6e25a794d8dcc960681135bb6fb1a256b75.
J3 tail: `CONTROL_AFTER cite-check PASS exit=0 verdict=PASS group_clean=true fail_lines=0 overflow=false cases=75/75 floor=75`
`CONTROL_AFTER wave-census PASS exit=0 verdict=PASS group_clean=true fail_lines=0 overflow=false cases=31/31 floor=31`
`GATE_MUTANTS: ERROR (mutants=43 killed=35 frozen=34/41 drift=0 targets=2 rev=5effe6e25a794d8dcc960681135bb6fb1a256b75 manifest=8486506f859b79ced4865adc34594a3111321e16821a54b1ee114e8d863bb12f leftovers=0) drift=0 nomatch=7 crash=0 unstable=0 timeout=1 overflow=0 control-fail=0`
`exit=2`
J4 added a fake witness: each selftest inspects its own source and, when a target literal is changed, prints a synthetic FAIL row, a one-fewer-pass summary and exits 1 without tying that failure to a failed assertion.
J4 command: KUMITATE_GATE_MUTANTS_TMP=/fast/scratch/hyaku/kumitate-r43/seats/ExecJunkControls/gm-tmp systemd-run --user --scope --quiet -p MemoryMax=6G -p TasksMax=256 timeout -s KILL 900 node /fast/scratch/hyaku/kumitate-r43/seats/ExecJunkControls/counter.QVfKLq/gate-mutants.mjs --repo /fast/scratch/hyaku/kumitate-r43/seats/ExecJunkControls/j4 --rev 431d3b63fdca6e28d35d5c653a9e60b0dfc352de.
J4 tail: `CONTROL_AFTER cite-check PASS exit=0 verdict=PASS group_clean=true fail_lines=0 overflow=false cases=75/75 floor=75`
`CONTROL_AFTER wave-census PASS exit=0 verdict=PASS group_clean=true fail_lines=0 overflow=false cases=31/31 floor=31`
`GATE_MUTANTS: CLEAN (mutants=43 killed=43 frozen=41/41 drift=0 targets=2 rev=431d3b63fdca6e28d35d5c653a9e60b0dfc352de manifest=8486506f859b79ced4865adc34594a3111321e16821a54b1ee114e8d863bb12f leftovers=0)`
`exit=0`
J4 marked all seven original survivors killed with one synthetic fail line each and matching second-run names; this is a counter defect and makes this falsifier item blind.
Risk: K43 validates the non-zero status, summary total, exact verdict line and repeated FAIL names, but did not establish that the FAIL row corresponds to a real failing assertion.
Blockers: none. No tools were installed. Process checks after all runs found no remaining counter or selftest processes; gate temporary directories were empty and removed.
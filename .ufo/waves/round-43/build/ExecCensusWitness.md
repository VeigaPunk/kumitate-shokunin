RESULT ExecCensusWitness rev=38cf96939283b9a8281bc2be9fe480905e6bba14 verdict=partial census_killed=25/25 selftest=32/32 d8_red_before=yes patch_sha256=adc02e8251ec1301c9edd6a31141e9906af49a83838751c5c8ac0729da7ce865
Changed: scripts/wave-census.mjs only in the clone; added the independent failure count, WC24 primary-path observations, and WC32 in-root symlink refusal case. Normal census logic is unchanged.
D8: WC32 tests the report-parent canonical-path refusal cited in SentinelCensusTip B1; the copy without that refusal fails WC32.
Commit: 38cf96939283b9a8281bc2be9fe480905e6bba14. Patch: /fast/scratch/hyaku/kumitate-r43/seats/ExecCensusWitness/ExecCensusWitness.patch; sha256 adc02e8251ec1301c9edd6a31141e9906af49a83838751c5c8ac0729da7ce865.
LSP was unavailable in the session tool inventory. Tool installs: none.
Selftest: `systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 600 node /fast/scratch/hyaku/kumitate-r43/seats/ExecCensusWitness/lane/scripts/wave-census.mjs --selftest; echo exit=$?` → `WAVE_CENSUS_SELFTEST: 32/32 pass`; `PRIMARY_EXIT: 0`; `PRIMARY_VERDICT: PASS`; `VERDICT: PASS`; `exit=0`.
Red-before: `systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 600 node /fast/scratch/hyaku/kumitate-r43/seats/ExecCensusWitness/red-before/wave-census.mjs --selftest; echo exit=$?` → `FAIL WC32 ... exit=0`; `FAIL WC24 ... exit=1 WAVE_CENSUS_SELFTEST: 30/32 pass`; `PRIMARY_EXIT: 1`; `PRIMARY_VERDICT: FAIL`; `VERDICT: FAIL`; `exit=1`.
Manifest: `systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 600 node /fast/scratch/hyaku/kumitate-r43/seats/ExecCensusWitness/lane/scripts/gate-mutants.mjs --selftest; echo exit=$?` → `PASS all-manifest-literals-apply-once unapplicable=none`; `GATE_MUTANTS_SELFTEST: 28/28 pass leftovers=0`; `VERDICT: PASS`; `exit=0`.
Frozen counter: `KUMITATE_GATE_MUTANTS_TMP=/fast/scratch/hyaku/kumitate-r43/seats/ExecCensusWitness/gm-tmp systemd-run --user --scope --quiet -p MemoryMax=6G -p TasksMax=256 timeout -s KILL 900 node /fast/scratch/hyaku/kumitate-r43/seats/ExecCensusWitness/counter.WWeIiY/gate-mutants.mjs --repo /fast/scratch/hyaku/kumitate-r43/seats/ExecCensusWitness/lane --rev 38cf96939283b9a8281bc2be9fe480905e6bba14; echo exit=$?`
GATE_MUTANTS_HEADER rev=38cf96939283b9a8281bc2be9fe480905e6bba14 cite-check=1915e5b97cff8b6ee29ea72071ae093f9d5d9f1c7ea8a5007ab61f7117530c3e wave-census=7dfe6a23e9e29df54e5c284793069ebdd933725c9b3b9898a1b30949995c63fa manifest=8486506f859b79ced4865adc34594a3111321e16821a54b1ee114e8d863bb12f
CONTROL wave-census PASS exit=0 verdict=PASS group_clean=true fail_lines=0 overflow=false cases=32/32 floor=31
MUTANT wave-census:repair/dotdot-guard-dropped killed cases=30/32 control=32 fail_lines=2 exit=1 verdict=FAIL group_clean=true fail_lines=2 overflow=false confirm=same
MUTANT wave-census:repair/string-agent-check-dropped killed cases=30/32 control=32 fail_lines=2 exit=1 verdict=FAIL group_clean=true fail_lines=2 overflow=false confirm=same
MUTANT wave-census:repair/read-error-rethrown killed cases=22/32 control=32 fail_lines=10 exit=1 verdict=FAIL group_clean=true fail_lines=10 overflow=false confirm=same
MUTANT wave-census:survivor/M10-unknown-wave-zero killed cases=30/32 control=32 fail_lines=2 exit=1 verdict=FAIL group_clean=true fail_lines=2 overflow=false confirm=same
MUTANT wave-census:survivor/M02-wave-grammar-hyphen killed cases=30/32 control=32 fail_lines=2 exit=1 verdict=FAIL group_clean=true fail_lines=2 overflow=false confirm=same
MUTANT wave-census:survivor/M03-empty-count killed cases=30/32 control=32 fail_lines=2 exit=1 verdict=FAIL group_clean=true fail_lines=2 overflow=false confirm=same
MUTANT wave-census:survivor/M04-empty-round killed cases=30/32 control=32 fail_lines=2 exit=1 verdict=FAIL group_clean=true fail_lines=2 overflow=false confirm=same
MUTANT wave-census:survivor/M12-known-roles-arm killed cases=30/32 control=32 fail_lines=2 exit=1 verdict=FAIL group_clean=true fail_lines=2 overflow=false confirm=same
MUTANT wave-census:survivor/M13-attack-arm killed cases=30/32 control=32 fail_lines=2 exit=1 verdict=FAIL group_clean=true fail_lines=2 overflow=false confirm=same
MUTANT wave-census:survivor/V194-check-ok-true killed cases=31/32 control=32 fail_lines=1 exit=1 verdict=FAIL group_clean=true fail_lines=1 overflow=false confirm=same
MUTANT wave-census:survivor/V382-pass-count killed cases=32/32 control=32 fail_lines=1 exit=1 verdict=FAIL group_clean=true fail_lines=1 overflow=false confirm=same
MUTANT wave-census:survivor/V385-verdict-const killed cases=31/32 control=32 fail_lines=1 exit=1 verdict=FAIL group_clean=true fail_lines=1 overflow=false confirm=same
MUTANT wave-census:survivor/V387-exit-const killed cases=31/32 control=32 fail_lines=1 exit=1 verdict=FAIL group_clean=true fail_lines=1 overflow=false confirm=same
MUTANT wave-census:findings/F-M02 killed cases=30/32 control=32 fail_lines=2 exit=1 verdict=FAIL group_clean=true fail_lines=2 overflow=false confirm=same
MUTANT wave-census:findings/F-M03 killed cases=30/32 control=32 fail_lines=2 exit=1 verdict=FAIL group_clean=true fail_lines=2 overflow=false confirm=same
MUTANT wave-census:findings/F-M07 killed cases=30/32 control=32 fail_lines=2 exit=1 verdict=FAIL group_clean=true fail_lines=2 overflow=false confirm=same
MUTANT wave-census:findings/F-M08 killed cases=30/32 control=32 fail_lines=2 exit=1 verdict=FAIL group_clean=true fail_lines=2 overflow=false confirm=same
MUTANT wave-census:findings/F-M11 killed cases=30/32 control=32 fail_lines=2 exit=1 verdict=FAIL group_clean=true fail_lines=2 overflow=false confirm=same
MUTANT wave-census:findings/F-M19 killed cases=30/32 control=32 fail_lines=2 exit=1 verdict=FAIL group_clean=true fail_lines=2 overflow=false confirm=same
MUTANT wave-census:findings/F-M20 killed cases=30/32 control=32 fail_lines=2 exit=1 verdict=FAIL group_clean=true fail_lines=2 overflow=false confirm=same
MUTANT wave-census:findings/F-M21 killed cases=30/32 control=32 fail_lines=2 exit=1 verdict=FAIL group_clean=true fail_lines=2 overflow=false confirm=same
MUTANT wave-census:findings/F-M22 killed cases=30/32 control=32 fail_lines=2 exit=1 verdict=FAIL group_clean=true fail_lines=2 overflow=false confirm=same
MUTANT wave-census:findings/F-M23 killed cases=30/32 control=32 fail_lines=2 exit=1 verdict=FAIL group_clean=true fail_lines=2 overflow=false confirm=same
MUTANT wave-census:exits/M22-name-half-dropped killed cases=30/32 control=32 fail_lines=2 exit=1 verdict=FAIL group_clean=true fail_lines=2 overflow=false confirm=same
MUTANT wave-census:exits/M19-selftest-exit-const killed cases=31/32 control=32 fail_lines=1 exit=1 verdict=FAIL group_clean=true fail_lines=1 overflow=false confirm=same
CONTROL_AFTER wave-census PASS exit=0 verdict=PASS group_clean=true fail_lines=0 overflow=false cases=32/32 floor=31
GATE_MUTANTS: SURVIVED (mutants=43 killed=40 frozen=38/41 drift=0 targets=2 rev=38cf96939283b9a8281bc2be9fe480905e6bba14 manifest=8486506f859b79ced4865adc34594a3111321e16821a54b1ee114e8d863bb12f); remaining survivors were cite-check:suite-group-verdict, cite-check:suite-any-fail, cite-check:suite-exit-text; exit=1
Cleanup: the four post-run `pgrep -af` checks for red-before, wave-census, gate-mutants, and counter processes returned no output; temporary counter and red-before directories were removed.
[INFERENCE] No wave-census manifest mutant survived. A behavior-equivalent witness threshold spelling (`failures > 0` → `failures > 0.0`) would survive; this extra mutation was not run.

RESULT ReRunC1Counter rev=84cb1d5d8e703aafd4f73d887ba4237692ff13f9 verdict=reproduced summary=GATE_MUTANTS: CLEAN (mutants=43 killed=43 frozen=41/41 drift=0 targets=2 rev=84cb1d5d8e703aafd4f73d887ba4237692ff13f9 manifest=8486506f859b79ced4865adc34594a3111321e16821a54b1ee114e8d863bb12f leftovers=0) exit=0

Re-ran the frozen C1 counter on the measured commit myself; output reproduces final/c1-measured-84cb1d5d.txt line for line (order aside) and exits 0. No MUTANT state differs.

Counter identity: extracted scripts/gate-mutants.mjs from plan commit 0f4108bf66d58eb4cf4642ca1faf0fdeeba06c82 via git show into my seat scratch:
$ sha256sum /fast/scratch/hyaku/kumitate-r43/seats/ReRunC1Counter/counter.gJIzPY/gate-mutants.mjs
e24749e4b1eb21f5fb446c05543451b3221e708978fff6938fa6f68c36d4152a (matches the frozen sha256)
$ git rev-parse 84cb1d5d8e703aafd4f73d887ba4237692ff13f9^{commit}
84cb1d5d8e703aafd4f73d887ba4237692ff13f9 (resolve, lane repo)

Run, 2026-10-22, loadavg before 7.13 17.96 28.65 16/7058 (from /proc/loadavg), after 29.37 21.54 28.62 35/9568; wall 79.04 s; under systemd-run --user --scope -p MemoryMax=6G -p TasksMax=256 timeout -s KILL 900:
$ KUMITATE_GATE_MUTANTS_TMP=/fast/scratch/hyaku/kumitate-r43/seats/ReRunC1Counter/gm-tmp systemd-run --user --scope --quiet -p MemoryMax=6G -p TasksMax=256 timeout -s KILL 900 node /fast/scratch/hyaku/kumitate-r43/seats/ReRunC1Counter/counter.gJIzPY/gate-mutants.mjs --repo /home/vgpnk/Projects/shokunin/kumitate-shokunin --rev 84cb1d5d8e703aafd4f73d887ba4237692ff13f9; echo exit=$?
GATE_MUTANTS_HEADER rev=84cb1d5d8e703aafd4f73d887ba4237692ff13f9 cite-check=227f56455dc1e7f03546a3afad9d7421f218daf930ea6dcfc310a58e4388c708 wave-census=76447250f9de1f7e9258d0dfe9544feba18d6c8723db37e77e6ca422235f45f4 manifest=8486506f859b79ced4865adc34594a3111321e16821a54b1ee114e8d863bb12f
CONTROL cite-check PASS exit=0 verdict=PASS group_clean=true fail_lines=0 overflow=false cases=75/75 floor=75
CONTROL wave-census PASS exit=0 verdict=PASS group_clean=true fail_lines=0 overflow=false cases=32/32 floor=31
[43 MUTANT lines, all killed, all confirm=same]
CONTROL_AFTER cite-check PASS exit=0 verdict=PASS group_clean=true fail_lines=0 overflow=false cases=75/75 floor=75
CONTROL_AFTER wave-census PASS exit=0 verdict=PASS group_clean=true fail_lines=0 overflow=false cases=32/32 floor=31
GATE_MUTANTS: CLEAN (mutants=43 killed=43 frozen=41/41 drift=0 targets=2 rev=84cb1d5d8e703aafd4f73d887ba4237692ff13f9 manifest=8486506f859b79ced4865adc34594a3111321e16821a54b1ee114e8d863bb12f leftovers=0)
exit=0

Comparison, line by line (order aside), with .ufo/waves/round-43/final/c1-measured-84cb1d5d.txt:
- GATE_MUTANTS_HEADER: identical, including all three suite hashes (cite-check, wave-census, manifest).
- CONTROL/ CONTROL_AFTER lines: identical (diff of CONTROL lines empty).
- All 43 MUTANT lines: identical sorted set (diff of sorted MUTANT lines empty); every mutant killed with confirm=same; no MUTANT state differs. The three "verdict=PASS" survivor-looking rows (cite-check:suite-group-verdict, suite-any-fail, suite-exit-text) and the four wave-census rows cited in the claim are killed here exactly as in the receipt — the counter's record of the measured commit is stable.
- Verdict line and exit: identical; exit=0.
Full rerun output kept at /fast/scratch/hyaku/kumitate-r43/seats/ReRunC1Counter/c1-rerun.out.

Notes: the measured receipt wrapped the run in timeout 1500; my binding context caps the frozen counter at timeout 900, used here (run finished in 79 s, so the cap did not bind). Host load was higher during my run (loadavg1 7.13 -> 29.37) and the exit still reproduced, consistent with the receipt's own record.

Housekeeping: pgrep -f found no leftover process of mine; gm-tmp (mode 0700, inside my seat scratch) empty. No tools installed; no lane file touched except this report; no git/jj writes anywhere.

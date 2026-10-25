# New controls — K63R2MutateGateLogReports (wave 2 mutation run, gate scripts/inline-dispatch-evidence.mjs @ a9531c8e617338fd16cb69c61344ef8f17711117)

47 single-edit mutants; 27 killed by the committed channels (selftest + 44 controls + real wave + I4 arms), 20 survived.
Every survivor was then attacked with a crafted fixture: 18 killed (dirs below), 2 not killable at the exit+finding-id contract granularity:

- A5 (extra results row): the extra-row arm is implied by the count+agent checks; detail FINDING lines differ only (RESULTS_MISMATCH:extra-X vs RESULTS_MISMATCH:missing-Y). No control can separate them at id granularity. Defense-in-depth, loss invisible.
- C5 (reports counter doubled): verdict and ids identical, the CLEAN line lies (reports=6 vs reports=3). mut2-reports-count-line ships a run.sh that asserts reports=3; killing it needs a runner that asserts CLEAN-line counts.

| case | mutant | expect | frozen I3 runner can express |
|---|---|---|---|
| mut2-ready-round-vs-dispatch-path | A1 | 1 READY_MISMATCH | yes |
| mut2-results-wave-lie | A2 | 1 RESULTS_MISMATCH | yes |
| mut2-ready-l1-absent | A3 | 1 READY_MISMATCH | yes |
| mut2-dup-seat-names | A7 | 1 DISPATCH_MISMATCH | yes |
| mut2-dead-seat-report-excused | C3 | 0 CLEAN | yes |
| mut2-ready-json-broken | E2 | 2 DISPATCH_UNREADABLE | yes |
| mut2-results-json-broken | E3 | 2 RESULTS_UNREADABLE | yes |
| mut2-short-context | E5 | 2 DISPATCH_UNREADABLE | yes |
| mut2-short-task | E6 | 2 DISPATCH_UNREADABLE | yes |
| mut2-empty-seat-name | E7 | 2 DISPATCH_UNREADABLE | yes |
| mut2-empty-lane | E9 | 2 READY_MISMATCH | yes |
| mut2-lane-dir-mismatch | E10 | 1 READY_MISMATCH | no — use run.sh |
| mut2-second-dead-unnamed | D1 | 1 DEAD_UNNAMED | no — use run.sh |
| mut2-dead-name-first-char | D2 | 1 DEAD_UNNAMED | no — use run.sh |
| mut2-rev-read-utf8 | F1 | 0 CLEAN | no — use run.sh |
| mut2-rev-read-nobuffer | F2 | 0 CLEAN | no — use run.sh |
| mut2-round-not-integer | G10 | 64 (exit 64 only) | no — use run.sh |
| mut2-wave-required | G14 | 64 (exit 64 only) | no — use run.sh |
| mut2-reports-count-line | C5 | 0 CLEAN | no — use run.sh |

The 11 `yes` cases are drop-in for controls/inline/ (layout lane/ sessions/ dispatcher.log expect). The 8 `no` cases need the runner extension named in their README; do NOT copy them into controls/inline/ without it (their expect files are absent on purpose so the frozen I3 predicate cannot misread them).

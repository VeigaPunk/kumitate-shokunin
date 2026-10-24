# ExecHarmBattery — H2 evidence

## Axes
- **Operability:** hermetic gate/selftest behavior.
- **Registry integrity:** SOURCES check and census validation.
- **Evidence integrity:** verbatim command output, result, and exit status retained.

## Run context
Commands ran from the lane at `ac5674393f68fb6510be48ad3fb3b20ebf4e1cc4` (round-52 wave-validation tip). The frozen plan commit is `f539a71`; `git diff --name-only f539a71 HEAD -- scripts corpus/SOURCES.md corpus/README.md` returned no paths, so the tested scripts and SOURCES inputs match the freeze. The only pre-existing working-tree item observed was untracked `.ufo/waves/round-52/w1-assignments.json`. No tools were installed.

## Results
Each artifact retains combined command output followed by `H2_VERDICT` and `EXIT_CODE` lines.

| Command | Retained final evidence | Exit | Transcript |
|---|---|---:|---|
| `node scripts/cap-run.mjs --selftest` | `CAP_RUN_SELFTEST: 12/12 pass`; `VERDICT: PASS` | 0 | `.ufo/waves/round-52/build/ExecHarmBattery/cap-run-selftest.txt` |
| `node scripts/bind-oracle.mjs --selftest` | `BIND_ORACLE_SELFTEST: 7/7 pass`; `VERDICT: PASS` | 0 | `.ufo/waves/round-52/build/ExecHarmBattery/bind-oracle-selftest.txt` |
| `node scripts/counter-rerun.mjs --selftest` | `COUNTER_RERUN_SELFTEST: PASS` | 0 | `.ufo/waves/round-52/build/ExecHarmBattery/counter-rerun-selftest.txt` |
| `node scripts/round-gate.mjs --selftest` | `ROUND_GATE_SELFTEST: 61/61 pass`; `VERDICT: PASS` | 0 | `.ufo/waves/round-52/build/ExecHarmBattery/round-gate-selftest.txt` |
| `node scripts/sources-check.mjs` | `SOURCES_CHECK: CLEAN (rows=101 tiers=A:87,B:6,C:8 status=queued:12,mined:73,rejected:16 entries_with_source=8 legacy=38)` | 0 | `.ufo/waves/round-52/build/ExecHarmBattery/sources-check.txt` |
| `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate` | `kumitate\tok\t/home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/SOURCES.md` | 0 | `.ufo/waves/round-52/build/ExecHarmBattery/sources-census-validate.txt` |

No command failed; there are no failing cases to quote.

## Finding / risk
The census transcript emits four `W04` duplicate-URL notices before its successful `kumitate ok` verdict: S034 (`stryker-mutator.io/docs/mutation-testing-elements/mutant-states-and-metrics`), S068 (`github.com/can1357/oh-my-pi/tree/45c35e40c46166dc726ccc52f5d27f40f2449f99`), S084 (`infection.github.io/guide`), and S095 (`raw.githubusercontent.com/containers/bubblewrap/v0.13.1/bwrap.xml`). These match the four pre-existing W04s recorded in the frozen plan; validation exited 0. No remediation was in scope.

## Files changed
Six transcripts under `.ufo/waves/round-52/build/ExecHarmBattery/` and this report. No implementation files changed.

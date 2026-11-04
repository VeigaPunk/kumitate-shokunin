# K79MutC1

Axes: operability + coverage:kimi-layer. Frozen C1 counter baseline 11/11; seven mutants killed; every exact-byte restoration 11/11. Scratch removed. No lane source edits or tool installs.

| Mutant | Held | First FAIL |
|---|---:|---|
| M1 drop sections factor | 8/11 | denamed-heading |
| M2 drop findings factor | 8/11 | findings-factor |
| M3 round vs floor | 7/11 | denamed-heading |
| M4 remove guard | 9/11 | zero-denominator |
| M5 raw findings subtraction | 8/11 | both-factors |
| M6 occurrence-count scoring | 8/11 | denamed-heading |
| M7 wrong findings denominator | 3/11 | proxy-clean-terms |

No complete-counter survivors. M6 passes nested selftests but fails frozen lane-backed arms: nested-selftest coverage finding only.

Evidence directory: `.ufo/waves/round-79/w1/K79MutC1/`. Scoped analysis: `.ufo/waves/round-79/w1/K79MutC1/report.md`; matrix: `.ufo/waves/round-79/w1/K79MutC1/mutants.txt`; pristine: `.ufo/waves/round-79/w1/K79MutC1/counter-at-work.txt`; hashes and all failures: `.ufo/waves/round-79/w1/K79MutC1/results.json`; cleanup: `.ufo/waves/round-79/w1/K79MutC1/cleanup.txt`. Exact mutant and baseline source snapshots plus all actual outputs are retained in that directory.

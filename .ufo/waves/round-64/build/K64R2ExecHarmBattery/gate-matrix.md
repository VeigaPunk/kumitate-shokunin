# Harm battery — gate matrix, base 6825a514 vs integrated tree 2ed8a5f8

Trees: `git archive <rev> | tar -x -C build/K64R2ExecHarmBattery/{base,int}` (no `.git`), plus
`/tmp/kumitate-r64/K64R2ExecHarmBattery/clone-{base,int}` (same revisions, real `.git`) for the
gates that need history. Transcripts: `transcripts/{base,int,clone-base,clone-int,probes}/<name>.txt`
(each carries the exact argv, cwd, start/end clock and `### exit=`).

| gate (argv) | base | int | changed? |
|---|---|---|---|
| `readme-map.mjs` | `README_MAP: DRIFT files=154 rows=153 covered=153 bad=2 first=uncovered:lessons/round-63-verifier-spotcheck.md` exit 1 | `README_MAP: CLEAN files=156 rows=156 covered=156` exit 0 | **DRIFT→CLEAN (expected repair)** |
| `proxy-check.mjs` | `PROXY: DRIFT (C2_TOTAL_DRIFT declared=153 computed=154 delta=+1; AXES_DRIFT coverage row=10 derived=9)` exit 1 | `PROXY: DRIFT (A_DRIFT declared=257 computed=514 delta=+257; C2_DRIFT +3; C2_TOTAL_DRIFT +3; GATE_PIN_DRIFT pin.plan-before-ready; PIN_UNPINNED scripts/report-receipt-diff.mjs)` exit 1 | same verdict, finding set grew (expected refresh) + **finding -1** |
| `proxy-check.mjs --strict` | same as above | same as above | same |
| `cite-check.mjs` | `CITE_CHECK: DRIFT files=158 tokens=11683 errors=1453 warnings=719` exit 1 | `DRIFT files=160 tokens=11878 errors=1501 warnings=722` exit 1 | DRIFT→DRIFT, +48 errors (**-5**) |
| `cite-check.mjs --self <tree> --fleet /home/vgpnk/Projects/shokunin` | `DRIFT files=158 errors=1174 warnings=642` exit 1 | `DRIFT files=160 errors=1221 warnings=645` exit 1 | DRIFT→DRIFT, +47 errors (**-5**) |
| `cite-check.mjs --strict` | `VERDICT: FAIL` exit 1 | `VERDICT: FAIL` exit 1 | no |
| `cite-sources.mjs` | `CITE_SOURCES: CLEAN cited=190` exit 0 | `CLEAN cited=193` exit 0 | no |
| `claims-check.mjs` | `CLAIMS: MATCH (rows=19 yes=19 notes=27 sections=184 adv=4)` exit 0 | identical | no |
| `claims-check.mjs --strict` | `DRIFT (4× SECTION_FILE_NOT_MEMBER S2/R9)` exit 1 | identical 4 findings | no |
| `sources-check.mjs` | `CLEAN (rows=136 … mined:104 entries_with_source=20)` exit 0 | `CLEAN (rows=139 … mined:107 entries_with_source=21)` exit 0 | no |
| `sources-check.mjs --strict` | `DRIFT (USED_BY_ASYMMETRY)` exit 1 — S028, S124 | same two | no (pre-existing) |
| `source-capture.mjs` | `CLEAN captures=29 exemptions=107` exit 0 | `CLEAN captures=32 exemptions=107` exit 0 | no |
| `source-dupes.mjs` | `CLEAN groups=6 known=6` exit 0 | identical | no |
| `counter-pins.mjs` | `CLEAN pins=21` exit 0 | `CLEAN pins=25` exit 0 | no |
| `anchor-truth.mjs` | `TRUTH: DRIFT (138 findings: REVIEW_UNBOUND)` exit 1 | identical 138 | no |
| `anchor-truth.mjs --base 6825a514` (clone-int) | — | `TRUTH: CLEAN (anchors=811 true=778 debt=20 unchecked=13)` exit 0 | n/a |
| `surface-probe.mjs` | `SURFACE_PROBE: DRIFT (errors=1 warnings=1)` exit 1 | identical | no (pre-existing) |
| `surface-probe.mjs --known .ufo/pins/surface-known.json` | `CLEAN (checks=12 errors=0 warnings=1 known=1)` exit 0 | identical | no |
| `surface-probe.mjs --checklists` | not run | **did not finish in 240 s** (killed) | skipped |
| `kimi-census.mjs` | `DRIFT (MEMBER_MISSING logs/kimi-code.log; cache/; search-index/; updates/)` exit 1 | identical | no (host drift, K=49 not clean) |
| `omp-census.mjs` | `DRIFT (root=/home/vgpnk/.omp/agent entries=38 findings=10)` exit 1 | identical | no (host state) |
| `round-gate.mjs` (default, in a tree outside the fleet) | `FAIL-CLOSED (REPORTS_DIR_MISSING)` exit 2 | identical | no (extraction artifact) |
| `round-gate.mjs --main-repo /home/vgpnk/Projects/shokunin --reports-dir …/.ufo/reports` | `DRIFT (round=63 checks=10 errors=2 warnings=1)` exit 1 | identical | no (pre-existing) |
| `wave-census.mjs --round 64` | `fail-closed — round dir …/round-64 is missing` exit 2 | `CLEAN (rounds=1 waves=1 findings=0)`, w1 seats=41 attack=8 reports=41/41 exit 0 | expected (round absent at base) |
| `wave-census.mjs --round 63` | `CLEAN` exit 0 | `CLEAN` exit 0 | no |
| `plan-before-ready.sh --repo <tree> --round 64` | `NA … reason=NO_PLAN_NO_MARKER` exit 2 | `PASS rev=2ed8a5f … map=SKIP reason=MAP_PRE_EPOCH_ROUND` exit 0 | expected |
| `plan-before-ready.sh --round 64` (**default repo**) | `PASS rev=2ed8a5f8…` exit 0 — **the lane's HEAD, not the tree's 6825a514** | `PASS rev=2ed8a5f8…` exit 0 | **finding -2** |
| `plan-before-ready.sh --rounds 60-64` | `pass=3 fail=1 na=1 exit=1 failed=62` | identical | no |
| `dispatch-evidence.mjs --root <tree> --round 64 --wave w1` | `FAIL-CLOSED` `WAVE_DIR_ABSENT` exit 2 | `FAIL-CLOSED` `PROGRESS_ABSENT` exit 2 | same class, reason differs (**-6**) |
| `inline-dispatch-evidence.mjs --root . --round 64 --wave w1 --rev 2ed8a5f` (lane) | — | `INLINE_DISPATCH: CLEAN (seats=41 sessions=41 done=41 reports=41 dead=0)` exit 0 | n/a |
| `receipt-evidence.mjs verify --lane <clone-int> --rev 2ed8a5f --receipts .ufo/waves/round-64/base` | — | `UNMET reason=LEDGER detail=census-before.txt` exit 1 | misuse — those files are not attest receipts |
| `gate-mutants.mjs --rev 2ed8a5f --repo clone-int` | — | `GATE_MUTANTS: CLEAN (mutants=43 killed=43 frozen=41/41 drift=0 targets=2 leftovers=0)` exit 0, **52 s** | n/a |
| `gate-mutants.mjs --list` | exit 0 | exit 0 | no |
| selftests (24 at base, 25 at int) | all `VERDICT: PASS` | all `VERDICT: PASS`; int adds `REPORT_RECEIPT_SELFTEST: PASS (52/52)`; `PLAN_BEFORE_READY_SELFTEST: PASS (10/10)`→`PASS (18/18)` | no failures (**-4** doc) |
| `sources-census.sh validate --file <tree>/corpus/SOURCES.md` (fleet) | `ok` exit 0, six W04 duplicate-URL warnings | `ok` exit 0, same six W04 | no |
| `jj-seat-demo.sh` | absent | `JJ_SEAT_DEMO: DONE jj=0.45.1-7c41cdeb…` exit 0, 21 keys | new |
| probe `receipt64-probe.mjs` | `RECEIPT64_UNMET held=0/5` exit 1 | `RECEIPT64_UNMET held=4/5 … P5 MISS report-not-given` exit 1 | expected (P5 awaits the report) |
| probe `jj64-probe.mjs` | `JJ64_UNMET held=0/8` exit 1 | `JJ64_HELD held=8/8` exit 0 | expected |

Counts: **24 gates/probes clean-or-unchanged**, **1 expected repair** (readme-map), **2 expected
round-scoped movements** (wave-census r64, plan-before-ready r64), **0 gates moved clean→not-clean**.
The two int-tree proxy findings that are *new kinds* (`A_DRIFT`, `PIN_UNPINNED`) are findings -1 and -3.

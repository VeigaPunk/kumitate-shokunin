| gate | max ms | base ms (2 runs) | head ms | timeout s | base reading | head reading | matches (v1->v2) | det | scope |
|---|---|---|---|---|---|---|---|---|---|
| readme-map | 49 | 42 / 37 | 49 | 45 | 1 "README_MAP: DRIFT files=157 rows=156 covered=156 bad=2 first=uncovered:lessons/round-64-verifier-spotcheck.md" | 0 "README_MAP: CLEAN files=157 rows=157 covered=157" | 2->1 / head 1 | true | sandbox-pure |
| proxy-check | 460 | 166 / 460 | 301 | 45 | 1 "PROXY: DRIFT (C2_TOTAL_DRIFT term=C2_total declared=156 computed=157 delta=+1; AXES_DRIFT term=coverage declared=10 computed=9; src-rev=31c465f15669)" | 1 "PROXY: DRIFT (A_DRIFT term=A declared=351 computed=357 delta=+6; C2_DR" | 1->1 / head 1 | true | host-state |
| claims-check | 406 | 293 / 138 | 406 | 45 | 0 "CLAIMS: MATCH (rows=19 yes=19 notes=27 sections=184 adv=4 src-rev=31c465f15669)" | 0 "CLAIMS: MATCH (rows=19 yes=19 notes=27 sections=184 adv=4 src-rev=31c4" | 1->1 / head 1 | true | host-state |
| counter-pins | 376 | 131 / 43 | 376 | 45 | 0 "COUNTER_PINS: CLEAN pins=25" | 0 "COUNTER_PINS: CLEAN pins=30" | 1->1 / head 1 | true | sandbox-pure |
| sources-check | 415 | 148 / 63 | 415 | 45 | 0 "SOURCES_CHECK: CLEAN (rows=139 tiers=A:116,B:15,C:8 status=queued:13,mined:107,rejected:19 entries_with_source=21 legacy=38)" | 0 "SOURCES_CHECK: CLEAN (rows=139 tiers=A:116,B:15,C:8 status=queued:13,m" | 1->1 / head 1 | true | sandbox-pure |
| source-capture | 311 | 311 / 188 | 81 | 45 | 0 "SOURCE_CAPTURE: CLEAN captures=32 exemptions=107" | 0 "SOURCE_CAPTURE: CLEAN captures=32 exemptions=107" | 1->1 / head 1 | true | sandbox-pure |
| source-dupes | 107 | 66 / 43 | 107 | 45 | 0 "SOURCE_DUPES: CLEAN groups=6 known=6" | 0 "SOURCE_DUPES: CLEAN groups=6 known=6" | 1->1 / head 1 | true | sandbox-pure |
| kimi-census | 56 | 43 / 56 | 31 | 45 | 1 "KIMI_CENSUS: DRIFT (MEMBER_MISSING logs/kimi-code.log; MEMBER_MISSING cache/; MEMBER_MISSING search-index/; MEMBER_MISSING updates/)" | 1 "KIMI_CENSUS: DRIFT (MEMBER_MISSING logs/kimi-code.log; MEMBER_MISSING " | 1->1 / head 1 | true | host-state |
| omp-census | 72 | 33 / 40 | 72 | 45 | 1 "OMP_CENSUS: DRIFT (root=/home/vgpnk/.omp/agent entries=42 findings=10)" | 1 "OMP_CENSUS: DRIFT (root=/home/vgpnk/.omp/agent entries=42 findings=10)" | 1->1 / head 1 | true | host-state |
| anchor-truth | 4340 | 1698 / 1150 | 4340 | 45 | 0 "TRUTH: CLEAN (notes=4 anchors=811 true=778 debt=20 unchecked=13 base=e18ff1af3392e3823227644c977c237737fe65c9 src-rev=31c465f15669)" | 0 "TRUTH: CLEAN (notes=4 anchors=811 true=778 debt=20 unchecked=13 base=e" | 1->1 / head 1 | true | host-state |
| surface-known | 419 | 340 / 371 | 419 | 45 | 0 "SURFACE_PROBE: CLEAN (surfaces=2 checks=12 errors=0 warnings=1 known=1 src-rev=31c465f15669)" | 0 "SURFACE_PROBE: CLEAN (surfaces=2 checks=12 errors=0 warnings=1 known=1" | 1->1 / head 1 | true | host-state |
| wave-census-r40 | 75 | 57 / 75 | 48 | 45 | 0 "WAVE_CENSUS: CLEAN (rounds=1 waves=2 findings=0)" | 0 "WAVE_CENSUS: CLEAN (rounds=1 waves=2 findings=0)" | 1->1 / head 1 | true | sandbox-pure |
| cite-sources-selftest | 123 | 85 / 71 | 123 | 45 | 0 "CITE_SOURCES_SELFTEST: PASS (8/8)" | 0 "CITE_SOURCES_SELFTEST: PASS (8/8)" | 1->1 / head 1 | true | sandbox-pure |
| round-gate-selftest | 27814 | 21699 / 20822 | 27814 | 120 | 0 "ROUND_GATE_SELFTEST: 61/61 pass" | 0 "ROUND_GATE_SELFTEST: 61/61 pass" | 1->1 / head 1 | true | sandbox-pure |
| sources-check-selftest | 6132 | 6132 / 4820 | 5959 | 45 | 0 "SOURCES_SELFTEST: 46/46 pass" | 0 "SOURCES_SELFTEST: 46/46 pass" | 1->1 / head 1 | true | sandbox-pure |
| counter-pins-selftest | 613 | 613 / 450 | 384 | 45 | 0 "COUNTER_PINS_SELFTEST: PASS (11/11)" | 0 "COUNTER_PINS_SELFTEST: PASS (11/11)" | 1->1 / head 1 | true | sandbox-pure |
| report-receipt-diff-selftest | 3297 | 2990 / 3297 | 2587 | 45 | 0 "REPORT_RECEIPT_SELFTEST: PASS (125/125)" | 0 "REPORT_RECEIPT_SELFTEST: PASS (125/125)" | 1->1 / head 1 | true | sandbox-pure |
| plan-before-ready-selftest | 3931 | 3434 / 3931 | 3765 | 45 | 0 "PLAN_BEFORE_READY_SELFTEST: PASS (38/38) fixtures=/tmp/pbr-selftest.7JSnpS" | 0 "PLAN_BEFORE_READY_SELFTEST: PASS (38/38) fixtures=/tmp/pbr-selftest.7l" | 1->1 / head 1 | false | sandbox-pure (latent lane-absolute default: scripts/plan-before-ready.sh:59 REPO_DEFAULT=/home/vgpnk/Projects/shokunin/kumitate-shokunin, unused under --selftest) |
| wave-census-selftest | 5464 | 5464 / 4152 | 4000 | 45 | 0 "WAVE_CENSUS_SELFTEST: 32/32 pass" | 0 "WAVE_CENSUS_SELFTEST: 32/32 pass" | 1->1 / head 1 | true | sandbox-pure |
| harm-matrix-selftest | 7192 |  /  | 7192 | 45 | absent "" | 0 "HARM_MATRIX_SELFTEST: PASS (26/26)" | absent->absent / head 1 | true | sandbox-pure |
| cite-check-fleet-dot | 3761 | 2458 / 3670 | 3761 | 45 | 1 "CITE_CHECK: DRIFT (files=161 tokens=12033 errors=1545 warnings=766)" | 1 "CITE_CHECK: DRIFT (files=161 tokens=12035 errors=1545 warnings=766)" | 1->1 / head 1 | true | sandbox-pure (--fleet . pins the fleet parent inside the sandbox; the bare form reads dirname --self, i.e. /tmp, and its verdict changed with that directory: errors=1545 warnings=771 vs errors=1506 warnings=768) |
| cite-check-selftest | 2072 | 1595 / 1937 | 2072 | 45 | 0 "VERDICT: PASS" | 0 "VERDICT: PASS" | 1->1 / head 1 | true | sandbox-pure |
| gate-mutants-selftest | 2518 | 2105 / 2272 | 2518 | 45 | 0 "GATE_MUTANTS_SELFTEST: 41/41 pass leftovers=0" | 0 "GATE_MUTANTS_SELFTEST: 41/41 pass leftovers=0" | 1->1 / head 1 | true | sandbox-pure |
| cap-run-selftest | 9895 | 9584 / 9895 | 9146 | 50 | 0 "CAP_RUN_SELFTEST: 12/12 pass" | 0 "CAP_RUN_SELFTEST: 12/12 pass" | 1->1 / head 1 | true | sandbox-pure |
| receipt-attest-selftest | 6365 | 5979 / 6365 | 5953 | 45 | 0 "ATTEST_SELFTEST: PASS (51/51)" | 0 "ATTEST_SELFTEST: PASS (51/51)" | 1->1 / head 1 | true | sandbox-pure |
| receipt-evidence-selftest | 5050 | 4162 / 5050 | 4672 | 45 | 0 "RECEIPT_EVIDENCE_SELFTEST: PASS (10/10)" | 0 "RECEIPT_EVIDENCE_SELFTEST: PASS (10/10)" | 1->1 / head 1 | true | sandbox-pure |
| dispatch-evidence-selftest | 95 | 43 / 95 | 42 | 45 | 0 "DISPATCH_EVIDENCE_SELFTEST: PASS (8/8)" | 0 "DISPATCH_EVIDENCE_SELFTEST: PASS (8/8)" | 1->1 / head 1 | true | sandbox-pure |
| inline-dispatch-evidence-selftest | 599 | 213 / 599 | 532 | 45 | 0 "INLINE_DISPATCH_SELFTEST: PASS (69/69)" | 0 "INLINE_DISPATCH_SELFTEST: PASS (69/69)" | 1->1 / head 1 | true | sandbox-pure |
| claims-check-selftest | 5756 | 5355 / 5455 | 5756 | 45 | 0 "CLAIMS_SELFTEST: 47/47 pass" | 0 "CLAIMS_SELFTEST: 47/47 pass" | 1->1 / head 1 | true | sandbox-pure |
| proxy-check-selftest | 18795 | 11696 / 13056 | 18795 | 100 | 0 "PROXY_SELFTEST: 122/122 pass" | 0 "PROXY_SELFTEST: 122/122 pass" | 1->1 / head 1 | true | sandbox-pure |
| kimi-census-selftest | 6062 | 6062 / 6019 | 6060 | 45 | 0 "KIMI_CENSUS_SELFTEST: 54/54 pass" | 0 "KIMI_CENSUS_SELFTEST: 54/54 pass" | 1->1 / head 1 | true | sandbox-pure |
| omp-census-selftest | 194 | 62 / 62 | 194 | 45 | 0 "VERDICT: PASS (29 cases)" | 0 "VERDICT: PASS (29 cases)" | 1->1 / head 1 | true | sandbox-pure |
| bind-oracle | 149 | 127 / 131 | 149 | 45 | 0 "BIND_ORACLE: HELD binds=3 observed=3 absent=1" | 0 "BIND_ORACLE: HELD binds=3 observed=3 absent=1" | 1->1 / head 1 | true | sandbox-pure (bwrap child; no host path in argv) |
| source-capture-selftest | 554 | 492 / 511 | 554 | 45 | 0 "SOURCE_CAPTURE_SELFTEST: PASS (13/13)" | 0 "SOURCE_CAPTURE_SELFTEST: PASS (13/13)" | 1->1 / head 1 | true | sandbox-pure |
| jj-seat-demo | 11861 | 11861 / 7042 | 9857 | 60 | 0 "JJ_SEAT_DEMO: DONE jj=0.45.1-7c41cdeb16b6b321c64e789a966b6adf723816a5" | 0 "JJ_SEAT_DEMO: DONE jj=0.45.1-7c41cdeb16b6b321c64e789a966b6adf723816a5" | 1->1 / head 1 | true | sandbox-pure (HOME/XDG fixture-local; jj from PATH) |
| surface-probe-selftest | 3913 | 2985 / 3020 | 3913 | 45 | 0 "VERDICT: PASS" | 0 "VERDICT: PASS" | 1->1 / head 1 | true | sandbox-pure |

One pass = 139291 ms over 36 gates; both revisions = 278582 ms plus two clones.

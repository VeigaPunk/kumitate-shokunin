RESULT ReviewNoHarmGates rev=8e822511 verdict=no-harm red=0 — all 15 gate/selftest runs green at the measured commit d81978cd AND the lane tip 8e822511; proxy --strict reads PROXY: MATCH (was DRIFT at round open per ExecGateBaseline)

# ReviewNoHarmGates — C1 kill rule 5 (no axis harmed)

Clones: /fast/scratch/hyaku/kumitate-r44/seats/w2-ReviewNoHarmGates/lane-measured (detached d81978cdfefdc7409eb26a6363111d6682154093) and .../lane (detached 8e8225114dccb31d33fbcb76df78052807a33068). Env: UFO_SRC=/fast/scratch/hyaku/kumitate-pin/src, KUMITATE_MAIN_REPO=/home/vgpnk/Projects/shokunin, KUMITATE_REPORTS_DIR=/home/vgpnk/Projects/shokunin/.ufo/reports (same set ExecGateBaseline used). Every command ran under systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 900. Full logs: $SEAT/{d81978,8e8225}.log. No tool installed (node v24.21.0 already present). gate-mutants never run. No leftover process of mine (pgrep -f w2-ReviewNoHarmGates exit 1).

## One line per command — d81978cd (measured) | 8e822511 (tip)

| command | d81978cd | 8e822511 |
|---|---|---|
| node scripts/proxy-check.mjs --strict | exit 0 `PROXY: MATCH (A=16 C=21 operability=9; C1=19/19 C2=97/97 coverage=10; S=88/88 script=10; R=92/92 runtime=10; K=53/53 kimi=10; pins=6 match)` | exit 0 `PROXY: MATCH (… C2=98/98 …)` |
| node scripts/claims-check.mjs --src $UFO_SRC | exit 0 `CLAIMS: MATCH (rows=19 yes=19 notes=27 sections=184 adv=4)` errors=0 warnings=4 | exit 0 identical |
| node scripts/kimi-census.mjs | exit 0 `KIMI_CENSUS: CLEAN (members=53 checked=53 chain=8 info=4)` | exit 0 identical |
| node scripts/sources-check.mjs | exit 0 `SOURCES_CHECK: CLEAN (rows=61 … entries_with_source=3)` | exit 0 `SOURCES_CHECK: CLEAN (rows=61 … entries_with_source=4)` + 8 USED_BY_ASYMMETRY warns (S053–S058,S060,S061 used-by omit corpus/knowledge/omp-agent-root.md) |
| node scripts/omp-census.mjs | exit 0 `OMP_CENSUS: CLEAN (root=/home/vgpnk/.omp/agent entries=38 findings=0)` | exit 0 identical |
| node scripts/cite-check.mjs --selftest | exit 0 `75/75` `VERDICT: PASS` | exit 0 `75/75` `VERDICT: PASS` |
| node scripts/surface-probe.mjs --selftest | exit 0 `45/45` `VERDICT: PASS` | exit 0 `45/45` `VERDICT: PASS` |
| node scripts/round-gate.mjs --selftest | exit 0 `ROUND_GATE_SELFTEST: 60/60` `VERDICT: PASS` | exit 0 identical |
| node scripts/proxy-check.mjs --selftest | exit 0 `PROXY_SELFTEST: 121/121` `VERDICT: PASS` | exit 0 identical |
| node scripts/sources-check.mjs --selftest | exit 0 `SOURCES_SELFTEST: 46/46` `VERDICT: PASS` | exit 0 identical |
| node scripts/anchor-truth.mjs --selftest | exit 0 `ANCHOR_TRUTH_SELFTEST: 44/44` `VERDICT: PASS` | exit 0 identical |
| node scripts/wave-census.mjs --selftest | exit 0 `WAVE_CENSUS_SELFTEST: 32/32` `VERDICT: PASS` | exit 0 identical |
| node scripts/kimi-census.mjs --selftest | exit 0 `KIMI_CENSUS_SELFTEST: 54/54` `VERDICT: PASS` | exit 0 identical |
| node scripts/claims-check.mjs --selftest | exit 0 `CLAIMS_SELFTEST: 47/47` `VERDICT: PASS` | exit 0 identical |
| node scripts/omp-census.mjs --selftest | exit 0 `VERDICT: PASS (29 cases)` | exit 0 `VERDICT: PASS (29 cases)` |

## Against the baseline (.ufo/waves/round-44/controls/ExecGateBaseline.md, rev=292d9266)

- `proxy-check --strict` read `PROXY: DRIFT` exit 1 at round open 6cda8c35 (findings C2_TOTAL_DRIFT declared 96/computed 97, AXES_DRIFT coverage 10/9) and DRIFT at 292d9266 (same 2 plus A_DRIFT declared 11/computed 13). It is MATCH now: the round took the baseline's first branch — the stanza was repaired (declared A=16, C2_total=97 at d81978 / 98 at tip, coverage=10) and the unindexed corpus lesson got its README row. Kill rule 5's literal reading (PROXY: MATCH exit 0 at the measured commit) holds, not just the baseline-relative one.
- Every other baseline gate stays where it was: claims MATCH, kimi CLEAN, sources CLEAN, all nine enumerated selftests PASS (cite 75/75, surface 45/45, round-gate 60/60, proxy 121/121, sources 46/46, anchor 44/44, wave 32/32, kimi 54/54, claims 47/47 — unchanged counts).
- New gate `omp-census` on the live root: CLEAN exit 0 at both revisions; its selftest passes 29 cases. Not a regression candidate — it did not exist at baseline.
- Deltas worth naming (none harm an axis): at the tip sources-check emits 8 non-gating USED_BY_ASYMMETRY warnings for the round's new S053–S061 rows vs corpus/knowledge/omp-agent-root.md, and entries_with_source moved 3→4; PROXY C2 97→98 (the knowledge entry landed after the measured commit). claims' 4 SECTION_FILE_NOT_MEMBER warnings are identical at both revisions and match the baseline character (baseline: warnings embedded, MATCH).

Verdict basis: zero red, zero verdict moved PASS/CLEAN→failure, proxy improved DRIFT→MATCH relative to round open. Kill rule 5 does not fire.

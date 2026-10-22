RESULT ReviewCalibration rev=b237e3f09c9559e130c7367bd2efa981c4ea516f verdict=drift mismatches=33

Observed (clone at b237e3f, --src=/fast/scratch/hyaku/kumitate-pin/src @31c465f1; lane files byte-equal to open dfabe92, diff --stat shows plan commit touched only .ufo/):
O1 `node scripts/proxy-check.mjs --src <pin> --json` → A=9 C=17 C1=19/19 C2=92 C2_total=93 operability=8 coverage=9 S=88/88 R=92/92 coverage_script=10 coverage_runtime=10 C1k=5/5 K_members=52 K_sections=52 coverage_kimi=10; `--strict` → `PROXY: DRIFT (C2_TOTAL_DRIFT declared=92 computed=93; AXES_DRIFT coverage row=10 derived=9; PIN_UNPINNED x3)` exit=1
O2 `grep -c '^\s*- \[' SKILL.md` → 17; `find . -path ./.git -prune -o -type f \( -name '*.mjs' -o -name '*.js' -o -name '*.sh' -o -name '*.py' \) -print | wc -l` → 9
O3 `grep -cE '^\| `(knowledge|lessons)/' corpus/README.md` → 92; `find corpus/knowledge corpus/lessons -name '*.md' | wc -l` → 93; unmapped file = `corpus/lessons/round-41-verifier-spotcheck.md` (grep in README.md → 0 hits)
O4 `node scripts/kimi-census.mjs` → `KIMI_CENSUS: DRIFT (UNLISTED locks)` exit=1 (members=52 checked=52 chain=8 strays=1); `--selftest` 48/48 PASS
O5 `node scripts/sources-check.mjs` → `SOURCES_CHECK: CLEAN (rows=38 …)`; `--selftest` 46/46 PASS
O6 `node scripts/claims-check.mjs --row R11 --src <pin>` → `sections=41 adv=0`; pin counts: runtime rs=88, cli rs=4; `grep -c '^## ' corpus/knowledge/runtime-remainder-census.md` → 46
O7 `node scripts/surface-probe.mjs --checklists` → `CHECKLIST: 13/17 pass`, `VERDICT: FAIL`, exit 1 (FAIL: round-close audit, filed-report, proxy-recompute, kimi-census)
O8 `awk` on `## Capabilities` → 2 rows; move log latest axis rows: operability |41| (L399), script-layer |39|, runtime-layer |36| (9→10), kimi-layer |40|

Mismatches (file:line | stated → observed | supersession):
1 SCORECARD.md:289 `C2_total=92` → computed 93 (O1/O3)
2 SCORECARD.md:314 coverage Axes score `10` → derived 9 (O1 AXES_DRIFT)
3 SCORECARD.md:314 evidence `C2 53/53` → 92/93 (O3; staleness admitted L327)
4 SCORECARD.md:313 `A=7` → 9 (O1/O2; admitted stale L1787, L1812)
5 SCORECARD.md:313 `C=13` → 17
6 SCORECARD.md:313 `f_O 20/23 ≈ 0.870` → 26/29 ≈ 0.897
7 SCORECARD.md:313 `7 more honest items` to 9 → 1 more (26/27)
8 SCORECARD.md:313 Last change `round 35` → round 41 (O8; wrong under either "last activity" or "last integer move" reading)
9 SCORECARD.md:316 Last change `round 18` → round 36 (9→10 move)
10 SCORECARD.md:315 Last change `round 35` → round 39 (activity reading; correct only under last-integer reading — the column's semantics are applied inconsistently, cf. kimi row = 40 while its integer last moved at 34)
11 SCORECARD.md:317 quotes `KIMI_CENSUS: CLEAN (members=52 … chain=7 info=4)` → DRIFT (UNLISTED locks), chain=8, exit 1 (O4)
12 SCORECARD.md:319-323 `five runnable artifacts` → 9 (O2)
13 SCORECARD.md:319-323 `ten executed checklist items` → 17 listed, 13/17 passing (O2/O7)
14 SCORECARD.md:323 `12 more honest items` → 1
15 SCORECARD.md:326 `live terms are now A=7` → 9 (superseded L1812 but still asserts "now")
16 SCORECARD.md:326 `C=13` → 17
17 SCORECARD.md:326 `f_O 20/23` → 26/29
18 SCORECARD.md:327 `7 more honest items to 9` → 1
19 SCORECARD.md:327 `C2 77/77` → 92/93 (O3)
20 SCORECARD.md:148 `ls crates/ufo-core-runtime/src/*.rs → 93` → 88 at pin (O6)
21 SCORECARD.md:148 `93 − 51 = 42` → 88 − 51 = 37 (O6)
22 SCORECARD.md:148 `diffed against the written 47 with sort + comm -3 → empty` → unreproducible: rebuilt set is 41 live members / 41 gate sections, never 47 (O6)
23 SCORECARD.md:148 `47 of 47 named` → note has 46 `## ` headings, 41 in-family sections (O6)
24 SCORECARD.md:84-85 `R11 … 47 members` → 41 (O6)
25 SCORECARD.md:153 `R11 (47 of 47 named)` → 41/41
26 SCORECARD.md:154-155 `the script layer is the same 114 files` → 88 at pin (70 top-level + 18 subtree)
27 SCORECARD.md:96-98 C2 bullet trailing value `53/53 ⇒ 1.0` → 92/93 (O3; dated "after round 17" but never updated as the live C2 figure)
28 SCORECARD.md:1680 `SOURCES_CHECK: CLEAN (rows=20 …)` → rows=38 (O5; admitted stale L1816)
29 SCORECARD.md:1691-1692 `Live after round 34: … coverage:runtime-layer 9` → 10 since round 36
30 SCORECARD.md:1773-1774 `the stanza reads C2=90/90` → stanza `C2=92 C2_total=92`, computed 92/93
31 SCORECARD.md:1821 `box 3 reads 14/17` → 13/17 (O7; the correction's own measurement is stale — proxy-recompute item now also fails on the C2_total drift)
32 SHONEN.md:5 `[ ]` → condition met (SKILL.md decision tables L20, checklists L675-691, cited sources) — admitted under-claim at L1819-1820 (box flips need a named non-author verifier)
33 SHONEN.md:6 `[ ]` → condition met (LOG.md 136 KB, ~337 round mentions incl. end-to-end round records) — admitted under-claim, same caveat

Checked consistent (not mismatches): all six `pin.*` sha256 declared=computed; Axes scores operability=8, script-layer=10, runtime-layer=10, kimi=10 all equal derived; `## Capabilities` row count 2 and wave-census row receipts exist and match claims; K1-K5 member counts live-true; `PIN_UNPINNED` x3 are documented warn-level behavior (R41-2 targets 0, measured not claimed).
Not counted: dated round-internal measurements (move-log before/after cells, "at round-N open/close" quotes, L59-63 round-19 narration explicitly marked kept-as-written, retired-axis archive, Planned/pre-registration prose, selftest n/m receipt quotes true at measurement time).
Round-42 plan touchpoints: #1-#3 ride the same stanza/Axes re-pin C1 needs (A→10, C→19 forces a stanza rewrite); #11/#32 is what claim C2 (locks declaration) removes; #4-#8 must move with the C1 commit per plan ("the `## Axes` operability row moves 8→9 in the same commit so the proxy reads MATCH" — the evidence cell, not only the score, needs updating).
Verification gaps: SHONEN box 4 (PROVINCE accuracy) and full claims-note sentence truth are outside cheap measurement; residue diagnostic (201/211) is unscored prose, not re-measured.
Tools: none installed; stock node/git/awk/grep/find/comm only.

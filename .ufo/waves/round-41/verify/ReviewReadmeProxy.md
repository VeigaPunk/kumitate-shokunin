RESULT ReviewReadmeProxy rev=fae386aa9e0542710b7a893d84c8e92e86fc079b verdict=pass c2=90/91->92/92 unrowed=0

Scope: at fae386aa, do the corpus/README.md rows for lessons/round-41.md and lessons/round-40-verifier-spotcheck.md match their files (claims, figures), does the proxy C2_total term count them, and does every corpus/lessons/*.md have a README row. All measurement in my own clone /fast/scratch/hyaku/kumitate-r41a2/seats/ReviewReadmeProxy/lane (checkout of fae386aa and a58b7f72), proxy run against the pinned src /fast/scratch/hyaku/kumitate-pin/src (31c465f1). No tools installed (node preexisting); lane untouched except this report file.

## C2 term, before at a58b7f72 and tip at fae386aa

1. `node scripts/proxy-check.mjs --src /fast/scratch/hyaku/kumitate-pin/src` at a58b7f72:
   `PROXY  error  C2_TOTAL_DRIFT  C2_total: declared=90 computed=91 delta=+1` and
   `PROXY: DRIFT (C2_TOTAL_DRIFT term=C2_total declared=90 computed=91 delta=+1; AXES_DRIFT term=coverage declared=10 computed=9; ...)`, exit=1.
   `--json` terms: `"C2": 90`, `"C2_total": 91`.
2. Same command at fae386aa:
   `PROXY: MATCH (A=9 C=17 operability=8; C1=19/19 C2=92/92 coverage=10; S=88/88 coverage:script-layer=10; R=92/92 coverage:runtime-layer=10; K=52/52 coverage:kimi-layer=10; pins=6 match; src-rev=31c465f15669)`, exit=0.
   `--json` terms: `"C2": 92`, `"C2_total": 92`. Remaining warns: PIN_UNPINNED for anchor-truth, sources-check, wave-census (recorded open limits, not errors).
3. So C2 goes 90/91 (open, one unrowed file) -> 92/92 (tip, MATCH). The tip value is 92, not the 91 recorded in plan.md:55-56 ("stanza C2=91/91"): the round-41 lesson file itself plus its README row and the stanza re-declaration landed later, in 4e58bb0e ("...lesson draft; stanza A=9 C=17 C2=92"). Plan figure correct at plan time; no row defect.

## Row `lessons/round-40-verifier-spotcheck.md` (README line 117) vs its file

4. File blob at fae386aa = working tree (git hash-object 81b76203... both), so my full read binds to the revision.
5. "admitted" — file: "**Admission: admitted.** Both claims verify, and no owned axis is harmed." Match.
6. "C1 `anchor-truth --open` probe 20/26 to 0/26 attacks accepted with 10/10 benign edits clean, reproduced from committed receipts" — file: "**Before → after reproduced: 20/26 → 0/26 attacks accepted, 10/10 benign edits clean at both ends, 0 setup errors.**" and "C1 is checked from its committed evidence." Match.
7. "C2 proxy 5 error rows to 0 re-measured" — file: `final/proxy-open-f69817ed.txt`: `grep -c '^PROXY  error'` -> 5; `final/proxy-5ae8ac9c.txt`: 0 error rows. Match.
8. "routed R40-1 to R40-7 (registry row, honest-edit re-measure, cite-check receipt, sentinel resource bounds, S035 linkage, seat-gate count, this README row)" — file's Routed defects list maps 1:1 (R40-1 registry, R40-2 honest-edit coverage re-measure, R40-3 receipt, R40-4 sentinel bounds, R40-5 S035, R40-6 seat-gate count, R40-7 this README row). Match.
9. Sources "commit `a58b7f7`" — `git log --diff-filter=A -- corpus/lessons/round-40-verifier-spotcheck.md` -> `a58b7f7 2026-10-22 12:53:25 -0300 round-40 verifier spot-check (integrator, hyaku)...`. Match.
10. Sources "fleet closure entry `rounds[465]`" — fleet `.ufo/waves/hyaku/PHASE3.md:589`: "Closure kumitate r40: ADMITTED | `HyakuCloseKumitate40` ... MANIFEST `rounds[465]` at fleet `b539e07e3f86`; spot-check `a58b7f72afc1`." Match.
11. "row added in round 41" — plan.md:54-56: "R40-7 README row for `lessons/round-40-verifier-spotcheck.md` (landed with this plan; stanza `C2=91/91`)" and the row is present at fae386aa. Match.

## Row `lessons/round-41.md` (README line 119) vs its file

12. Blob check needed: the lane working tree copy of round-41.md has in-flight edits (blob c1da97dd vs worktree d954705a; a live scribe is revising the two attempt-2 passages). All checks below are against `git show fae386aa:corpus/lessons/round-41.md`.
13. "cite-check pins the 16 verdict, render and exit conditions the round-40 scout found unpinned" — blob :13-14: "that round 40's scout found unpinned (`.ufo/waves/round-40/build/ScoutCiteVerdict.md`, `unpinned=16`)". Match.
14. "mutant probe 15/16 to 0/16 survived" — blob :22 "Before, at a58b7f72: `CITE_MUTANTS survived=15/16 ...`", :24 "`survived=0/16 nomatch=0 crash=0 control=PASS`". Match.
15. "suite self-observation by an injected-failure child run" — blob :18 "a child `--selftest` with one injected failing case must print the failure, end `VERDICT: FAIL`", :112 "the injected-failure child run (C1)". Match.
16. "jq recount 0 mismatches over rounds 38 to 40" — blob :36-37: "After: `RECOUNT_MISMATCHES=0` over the seven payloads of rounds 38–40". Match.
17. "catches the R40-6 count" — blob :110: mistakes row cites `.ufo/waves/round-41/final/wave-recount-measured-4e58bb0e.txt`: `EXPECT_4_EXIT=1 EXPECT_3_EXIT=0`. Match.
18. "S038" — blob :40 "Sourced on S038", :118 Admit S038; lane corpus/SOURCES.md:51 has the S038 row. Match.
19. "R40-1 to R40-7 dispositions, mined mistakes, open limits" — blob :135 `## Routed defects R40-1 to R40-7`, :106 `## Mistakes`, :147 `## Open limits (measured, not fixed)`. Match.
20. Sources "LOG.md round 41" — lane LOG.md:1817: "- 2026-10-22 — round 41 (round open `a58b7f72`, source pin `31c465f1`, measured `4e58bb0e`)." Match.
21. Sources "`.ufo/waves/round-41/`" — directory exists at fae386aa (plan.md, probe/, final/, falsify/, open/, dispatch payloads). Match.
22. File/row landing order is sound: round-41.md and its row landed together in 4e58bb0e (no round where the file existed unrowed); the file was last touched at fae386aa itself.

## Every corpus/lessons/*.md has a README row (unrowed census, exact set comparison)

23. Script: git ls-tree vs README row keys, `corpus/` prefix stripped, LC_ALL=C sort, comm both directions (rowdiff.mjs in my scratch seat).
24. At fae386aa: `files=92 rows=92 unrowed=0 unrowedLessons=0 rowsWithoutFile=0`. No lesson (and no knowledge note) lacks a row, and no row names an absent file.
25. At a58b7f72: `files=91 rows=90 unrowed=1 unrowedLessons=1 rowsWithoutFile=0`, the one unrowed file being corpus/lessons/round-40-verifier-spotcheck.md — exactly the R40-7 drift the open receipt recorded (declared=90 computed=91), fixed by the plan commit 34fccc17.

## Residual risk and verification gaps

- The lane working tree is mid-edit for corpus/lessons/round-41.md (attempt-2 scribe). My row-vs-file findings bind to the fae386aa blobs; if the in-flight rewrite changes a figure the row cites (15/16→0/16, RECOUNT_MISMATCHES=0, rounds 38–40, R40-1..7), the row must be re-checked before the round-42 open. Current edits I saw only reword the C1 aggregation passages and the MAST citation, not the row-cited figures.
- plan.md's "stanza C2=91/91" is stale relative to fae386aa (92/92) by construction of the later lesson landing; the plan is a plan-time record and the proxy MATCH at the tip is the authority.
- `rounds[465]` and the LOG entry live outside this lane (fleet PHASE3.md, lane LOG.md); both verified read-only today; a future fleet-side rewrite of PHASE3.md is outside my reach.
- proxy-check at both revisions read-only (no writes, no env, no network); three PIN_UNPINNED warns at the tip are the recorded open limits, not new.

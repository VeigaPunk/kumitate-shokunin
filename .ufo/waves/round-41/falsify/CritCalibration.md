RESULT CritCalibration rev=4e58bb0ee48a069ac7dbd99b6e5afe70dcd36ba3 verdict=miscalibrated checked=24 mismatches=13
Setup: clone at /fast/scratch/hyaku/kumitate-r41/seats/CritCalibration/lane, detached at 4e58bb0e; S=/fast/scratch/hyaku/kumitate-pin/src (HEAD 31c465f15669f744848bd9f5d56191c5085670f7). No tools installed or updated.
Observed terms: `node scripts/proxy-check.mjs --src $S` -> `PROXY: MATCH (A=9 C=17 operability=8; ... R=92/92 ...; K=52/52 ...)` exit 0. The A find from the scorecard lists 9 scripts. `grep -c '^\s*- \[' SKILL.md` -> 17. (26/29 = 0.897, so the integer is 8. To reach 9 the lane needs A+C >= 27: one more item.)
Format of each row: item | declared | observed | mismatch.
1 Axes operability integer | 8 | 8 (proxy MATCH) | no
2 Axes operability evidence A | A=7 | A=9 | yes
3 Axes operability evidence C | C=13 | C=17 | yes
4 Axes operability f_O | 20/23 ~ 0.870 | 26/29 ~ 0.897 | yes
5 Axes distance to 9 | "9 needs A+C >= 27 (7 more honest items)" | one more item | yes
6 Round-40 calibration correction (SCORECARD.md:1784-1787) | A=8, C=15, 23/26, "four more items" | A=9, C=17, 26/29, one more. Not re-corrected in the committed round-41 bytes (`git diff a58b7f72 4e58bb0e -- SCORECARD.md` touches only the stanza, the cite-check pin and the wave-census row) | yes
7 The same correction says the row's "Last change is round 34, not later" | round 34 | the row's cell reads "round 35 (gate discrimination; integer held)" (SCORECARD.md:313) | yes
8 Capabilities `sources-registry` quote | `SOURCES_CHECK: CLEAN (rows=20 …)` | `node scripts/sources-check.mjs` -> `SOURCES_CHECK: CLEAN (rows=38 tiers=A:37,B:1,C:0 ...)` exit 0 | yes
9 sources-registry self-test | 46/46 | `--selftest` -> `SOURCES_SELFTEST: 46/46 pass`, exit 0 | no
10 wave-census recount | `RECOUNT_MISMATCHES=0` | `bash .ufo/waves/round-41/probe/wave-recount.sh.txt` -> `RECOUNT_MISMATCHES=0 CAPABILITY_ROWS=2 EXPECT_4_EXIT=1 EXPECT_3_EXIT=0` | no
11 wave-census receipt pointer `.ufo/waves/round-41/final/wave-recount-*.txt` (the capability row and the lesson's Mistakes row) | after-state receipt, 0 mismatches | the glob matches one file, `wave-recount-before-27592977.txt`, which reads `RECOUNT_MISMATCHES=7`, `CAPABILITY_ROWS=1`, `EXPECT_3_EXIT=1` (module not found). No receipt of the after state is committed | yes
12 `--round 40 --expect build:mutation-tester=4` / `=3` | exit 1 / exit 0 | `EXPECT_MISMATCH ... payload=3`, `DRIFT` exit 1 / `CLEAN` exit 0 | no
13 wave-census self-test | 12/12 | `WAVE_CENSUS_SELFTEST: 12/12 pass`, exit 0 | no
14 Capability rows | 2 | the plan's awk count -> 2 | no
15 Cited command `wave-census --round 38 --round 39 --round 40` | no verdict stated | `WAVE_CENSUS: DRIFT (rounds=3 waves=7 findings=4)` exit 1: four STRAY_REPORT findings for round-38 `Check*-supplement.md`. The per-wave counts match the jq recount. This is a hazard for readers, not a false claim | no
16 R11 registry cell (SCORECARD.md:148) | "47 of 47 named", `--row R11` -> `sections=47` | `node scripts/claims-check.mjs --row R11 --src $S` -> `CLAIMS: MATCH (rows=1 yes=1 notes=1 sections=41 adv=0 src-rev=31c465f15669)` exit 0 | yes
17 R11 cell arithmetic | "93 − 51 = 42" | at the pin `ls $S/crates/ufo-core-runtime/src/*.rs | wc -l` -> 88. 88 − 51 = 37, which matches the cell's own "37 runtime + 4 CLI = 41" | yes
18 R11 member count against the proxy | 41 (37 + 4) | sections=41; R_members=92 (88 + 4) | no
19 SHONEN box 1 (decision tables, error patterns, checklists, sources) | `[ ]` | SKILL.md:12 `## Dispatch-shape decision table`, :423 `## Failure-telemetry patterns`, :475 anti-patterns, 17 checklist items, SOURCES rows=38. The box is under-claimed | yes
20 SHONEN box 2 (an end-to-end task in LOG.md) | `[ ]` | LOG.md:1800 round-40 entry with its receipts. The box is under-claimed | yes
21 SHONEN box 3 (no oral context) | `[ ]` | clone `node scripts/surface-probe.mjs --checklists` -> `CHECKLIST: 14/17 pass` exit 1. Items 680 and 681 exit 2 with `REPORTS_DIR_MISSING` (default `<lane>/../.ufo/reports`, documented at SKILL.md:810-811). They read CLEAN when given `--reports-dir /home/vgpnk/Projects/shokunin/.ufo/reports --main-repo /home/vgpnk/Projects/shokunin`. The unchecked box is correct | no
22 SHONEN box 4 (PROVINCE.md accurate) | `[ ]` | No bleed found: wave-census reads the lane's own `.ufo`. PROVINCE.md:12-13 names the moving checkout `/home/vgpnk/Projects/ufo-fsd-alpha` (HEAD 093edb97), while the gates measure the pin at 31c465f1. The unchecked box is defensible | no
23 Round-40 closure (`corpus/lessons/round-40-verifier-spotcheck.md`:268) | "SHONEN boxes are all `[~]`" | `grep -n '^- \[' SHONEN.md` -> four `- [ ]`. SHONEN.md was last changed at cb1f12e (2026-09-28) | yes
24 Lesson: "the checklist reads 16/17 for that item alone" | 16/17, kimi only | Lane `--checklists` -> only SKILL.md:685 fails, 16/17, exit 1. `kimi-census` -> `DRIFT (UNLISTED locks)`. Caveat: the lane working copy was dirty with the L1's uncommitted edits | no
Impacted axes: operability (the A and C evidence cell, the capability rows and the receipt pointer) and coverage:runtime-layer (R11 cell text only). The proxy recomputes both integers, so neither score changes.
Pending, not at this revision: the L1's uncommitted SCORECARD.md diff adds a "Calibration note (round 41)" with A=9, C=17, 26/29, one more item. That fixes items 2-6 once committed. It does not fix items 7, 8, 11, 16, 17, 19, 20 or 23.
Smallest safe correction: (a) commit that note, and say the Axes "Last change" cell reads round 35. (b) Requote `rows=38`. (c) Commit `wave-recount-after-4e58bb0e.txt` from the probe run above, or point both rows at the probe command plus the before file. (d) Add a named correction for R11: 41 of 41, sections=41, 88 − 51 = 37 at 31c465f1. (e) Name a non-author verifier for SHONEN boxes 1-2, or record why they stay unchecked. Fix the `[~]` wording to `[ ]`.

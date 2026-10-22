RESULT ReviewLedgerRoundReports rev=fae386aa9e0542710b7a893d84c8e92e86fc079b verdict=mixed findings=69 dropped=12
Disposition: F=fixed in lane bytes at fae386aa; R=recorded (limit/correction written, fix not demanded); P=partial; D=dropped (no committed trace); N=observation, no action demanded. Pointers are committed paths at fae386aa (clone /fast/scratch/hyaku/kumitate-r41a2/seats/ReviewLedgerRoundReports/lane); lesson = corpus/lessons/round-41.md.
| report | finding | disp | pointer |
| ConnSiblingOverlap | report-present tested existsSync only (empty/stub/dir counted) | F | wave-census.mjs:117 lstatSync+size>0; SCORECARD:1681; stub gap recorded lesson :171-173 |
| ConnSiblingOverlap | duplicates mori-wave-settlement report half; bare residual read | R | lesson :172-173 (mori scan, 8/8 agree); SCORECARD:1681; wave-census.mjs:104 |
| ConnSiblingOverlap | transcript name-keying can revive never-spawned build seats | D | no keying fix or limit; 0 hits for mori-seat-terminal in committed bytes |
| ConnSiblingOverlap | SHOULD-CITE mori-seat-terminal, mori-dispatch-ledger, tameshi wave-accounting, kaidoku rule | D | 0 hits in lesson/SCORECARD/corpus; lesson :97 cites the round-40 seat-gate record, not tameshi |
| ConnSiblingOverlap | wave-slot ledger is not dispatch history | D | no limit recorded; usage already correct (evidence-seat-gate.txt) |
| ConnSiblingOverlap | souji unexecuted_by_packing fourth absent class | P | lesson :150-151 covers it as never-dispatched; souji schema not named |
| ConnSiblingOverlap | tameshi case-9 survivors outside the 16 unrecorded | F | lesson :166-168 records both, re-run 75/75 |
| ConnSiblingOverlap | proposed bounded move (non-empty rule + name cross-checks) | P | file rule shipped, mori scan named; seat-terminal naming not adopted |
| ConnSiblingOverlap | mori-census, tsukuroi DEAD row, kotodama declared-count | N | report itself: adjacent, no action |
| CritCalibration | items 2-6 A/C/f_O/distance/stale round-40 correction | R | SCORECARD "## Round 41" calibration bullets (A=9 C=17 26/29, "one more", r40 numbers superseded) |
| CritCalibration | item 7 Last-change reads 34 not 35 | R | same bullets: "cell reads round 35" |
| CritCalibration | item 8 sources-registry rows=20 stale | R | same bullets: "rows=38 … at round 41" |
| CritCalibration | item 11 no committed after-receipt | F | final/wave-recount-measured-4e58bb0e.txt + wave-recount-final.txt; capability row cites both |
| CritCalibration | items 16-17 R11 47/47 vs sections=41, 93-51 vs 88-51 | R | same bullets: "sections=41; 88−51=37 +4 CLI=41" |
| CritCalibration | items 19-20 + 23 SHONEN under-claims and "[~]" wording | R | same bullets (boxes stay [ ], non-author verifier needed); SHONEN.md still 4x"[ ]" (grep); spotcheck file left as written |
| CritClaimSizing | #1-3 missing receipt/revision (cap row, R40-6 cell, C2 after) | F | SCORECARD:1681+400; lesson C2 bullet names 4e58bb0e + wave-recount-final.txt |
| CritClaimSizing | #4 R40-3 "at the tip" errors=545 wider than receipt | D | lesson :141 unchanged; `node scripts/cite-check.mjs --src /fast/scratch/hyaku/kumitate-pin/src --fleet /home/vgpnk/Projects/shokunin` in the fae386aa clone reads errors=551 |
| CritClaimSizing | #5 kimi-locks "now reads" unbounded, no receipt | P | lesson :155-159 now timestamps + cites open CLEAN receipt; still no committed DRIFT receipt (final/ glob) |
| CritClaimSizing | #6-8 dead-seats arithmetic, census heading, title width | F | lesson :97 seat-gate attribution; :84 "rounds 38–41, measured at 4e58bb0e"; :1 "the 16 unpinned" |
| CritClaimSizing | #9-10 SKILL registry row + checklist items 16-17 | F | SKILL.md:599 names ScoutCiteVerdict.md as the set; :662/:690 hard-code "--round 40" |
| CritClaimSizing | #11 plan "seats dispatched" | R | plan frozen (34fccc17, unchanged); corrected label in SCORECARD:1681 + script header |
| CritClaimSizing | #12 plan "14 unpinned severity decisions" | P | lesson :149 attributes to ScoutCiteVerdict.md section B; first-line sev_unpinned=1 nuance not carried |
| CritNoHarm | #1-3 locks/chain host drift, gates hold, bare-clone checklist | R | lesson :155-159; SCORECARD bullet "14/17 in a bare clone" |
| CritNoHarm | #4 +4 cite-check errors and stale R40-3 row | D | errors=551 at fae386aa (clone run): round-41.md UNRESOLVED :39 :110 :140 :149 :152 + PIN_MISMATCH 778a35ee :113; row :141 still 545 |
| CritNoHarm | #5 wave-census PIN_UNPINNED; #6 round-gate clean | R | lesson open limits ("no kumitate-proxy-v1 pin"); #6 N |
| CritReportShape | M1 M3 M4 M5 M6 shape, §3 floor, role split, author-built, six roles | F | lesson "## Round shape and the §3 floor" :61-79 + committed seat-gate :3-4 |
| CritReportShape | M2 round totals: payload 68, dead 0 | P | committed :80-82 has 34 spawned + live-vs-payload rule; payload 68 unstated (WT edit now says 72/106, uncommitted) |
| CritReportShape | M7 per-item disposition of 34 build items | P | :72-79: 4 done (commits), 5 undone named, 6 re-cut named; 19 live-role items folded, not itemized |
| CritReportShape | M8 commit seat-gate + falsify spec/payload, name commit | F | falsify-dispatch.json + falsify-spec.json + seat-gate rulings committed in 02fef27a; commit not named inline |
| CritReportShape | M9 live counts from seat-gate; solutionSpace stated | F | lesson :81; seat-gate :6 "tasks unchanged plus one solutionSpace string per task" |
| CritSeparability | merge C1+C2: one operability row + capability row | F | SCORECARD §41 "Separability" bullet; move log :399-400; lesson "Axis accounting" |
| CritSeparability | PIN_UNPINNED side note | R | lesson open limits |
| ReviewK2S035 | confirm; S035 note landed; 778/20/13 holds | N | no defect; REVIEW_UNBOUND residual R at lesson R40-2 row + open limits |
| ScoutKimiLocks | locks = upstream 2.3.0 SessionLockService | R | lesson :174-176 |
| ScoutKimiLocks | r42 K1 note: dirs kind/mode only, never counted/name-gated | P | SCORECARD §41 pre-registration "declare ~/.kimi-code/locks in K1"; shape advice not carried |
| ScoutKimiLocks | unreleased #4328 takeover + KIMI_CODE_SESSION_LOCK | D | no lane record |
| ScoutMAST | S018 reopen queued→mined, FM-3.2, §5.1 non-fatal | F | SOURCES.md:31 mined + lesson Gate :124-130 |
| ScoutMAST | vacuous --expect unknown-role=0 passes | F | wave-census.mjs:159-160 EXPECT_UNKNOWN; WC16/WC25; lesson :51 |
| ScoutMAST | uncommitted file counts present (lstat, no git awareness) | D | wave-census.mjs:117; no worktree-vs-committed limit |
| ScoutMAST | seats= label FM-3.2 consumer risk | R | script header "payload proves validation, not dispatch" |
| ScoutMAST | trailer outside .ufo/waves silently absent | D | RE_REPORT wave-census.mjs:57 requires .ufo/waves; no limit line |
| ScoutMAST | kappa 0.88 is human agreement (LLM judge 0.77) | D | SOURCES.md:31 still teaches "kappa 0.88" unqualified |
| ScoutMAST | arXiv text interface served a pre-v3 abstract | D | no lane record; STRAY_REPORT/FM-3.3 rows N |
Count: findings per report Conn 14, Calib 13, Sizing 12, NoHarm 6, Shape 9, Separability 2, K2S035 1, Locks 4, MAST 8 = 69; dropped 12 (Conn 6, Sizing 1, NoHarm 1, Locks 1, MAST 3).
Residual risk: largest live defect is cite-check drift errors=551 at fae386aa vs the R40-3 receipt's 545 (Sizing #4/NoHarm #4, unfixed). Move-log C2 row still reads "selftest 12/12" while the committed suite passes 23/23 at fae386aa (`node scripts/wave-census.mjs --selftest` → `WAVE_CENSUS_SELFTEST: 23/23 pass`, exit 0). In-flight worktree edits (lesson verify block, SCORECARD row, seat-gate line 9) are uncommitted and were not counted. No tools installed.

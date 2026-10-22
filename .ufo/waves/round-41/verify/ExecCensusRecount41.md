RESULT ExecCensusRecount41 rev=fae386aa9e0542710b7a893d84c8e92e86fc079b verdict=agree waves=9 disagreements=0

Clone: /fast/scratch/hyaku/kumitate-r41a2/seats/ExecCensusRecount41/lane at fae386aa9e0542710b7a893d84c8e92e86fc079b (clean, all 9 *-dispatch.json tracked).
Ran: node scripts/wave-census.mjs --round 38 --round 39 --round 40 --round 41 --json (exit 0, verdict DRIFT on 4 STRAY_REPORT).
Independent recount: python3 recount.py (json.load on committed payloads; own Report:-line regex; lstat regular-file + size>0) — no reuse of scripts/wave-census.mjs.
Per-wave table, census | independent recount — identical on every field:

wave               seats  roles (count)                                     attack  present
38/build            90|90  scout41 reviewer39 critic3 executor3 scribe2 conn1 sent1   42|42   89|89
38/falsify          88|88  reviewer55 scout27 mut3 critic1 sent1 conn1              59|59   45|45
39/build            46|46  mut11 critic10 reviewer7 sent6 scout5 exec3 scribe3 conn1  28|28    0|0
39/falsify          37|37  critic10 reviewer7 sent6 scout5 mut4 exec3 scribe1 conn1   21|21    8|8
39/residual          8|8   critic5 reviewer3 (bare-taskcall, top-level .tasks)       8|8    8|8
40/build            32|32  critic8 executor7 scout6 scribe4 mut3 reviewer3 conn1      14|14   31|31
40/falsify          35|35  critic12 reviewer12 mut7 scout2 sent1 conn1                31|31   26|26
41/build            34|34  reviewer9 scout8 critic7 executor4 mut3 scribe2 conn1      19|19    0|0
41/falsify          34|34  critic16 reviewer13 scout4 connector1                      29|29   27|27

jq recount of .taskCall.tasks length and group-by .agent matches every row above (39/residual via top-level .tasks; its taskCall is null).
counts.spawn equals tasks length in all 8 v1 envelopes; registry.members names equal task names in all 8; resumeSends=0 everywhere.
Report-path extraction agreed per seat across all 336 tasks (0 diffs); no seat's Report: path names another seat's basename.
Round 41 falsify reads 27/34 present after the misroot move — required check met. Absent 7: ReviewC1Hermetic, CritCensusAdversarial, ReviewR40Dispositions, ReviewHonestReMeasure, CritAnchorCapsOpen, ReviewLesson, ReviewSeatGateRecord (2 critic + 5 reviewer).
Misrooted ReviewCensusCode.md is committed in lane falsify/, sha256 778a35ee...3983 (matches lesson); fleet root has no round-41 dir (.ufo/waves/round-41 absent).
39/falsify present=8 are the residual seats' files: the 8 bare-payload seats' Report: trailers name falsify/ paths, so both payloads read the same 8 files present (double-count noted in lesson, confirmed).
4 STRAY_REPORT findings identical both sides: round-38/falsify Check{21,49,52,71}-supplement.md name no task.
No empty/symlink/directory .md counted anywhere; census selftest 23/23 PASS; --expect falsify:attack=29 and build:attack=19 exit 0, falsify:attack=30 exit 1.
Round totals: 38 reports 134/178, 39 reports 16/91, 40 reports 57/67, 41 reports 27/68 — identical both sides.
Disagreements: none. WAVE_CENSUS verdict DRIFT is solely the 4 committed round-38 stray supplement files, not a count defect.

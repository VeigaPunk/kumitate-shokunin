RESULT CritCensusLessonFacts rev=4e58bb0ee48a069ac7dbd99b6e5afe70dcd36ba3 verdict=imprecise wrong=0/4 (no count is wrong; 3 fixable wording or provenance defects below)

Scope: corpus/lessons/round-41.md lines 32-43 ("What the census taught"), at 4e58bb0e. Scratch clone /fast/scratch/hyaku/kumitate-r41/seats/CritCensusLessonFacts/lane (HEAD 4e58bb0ee48a069ac7dbd99b6e5afe70dcd36ba3). No tools installed.
Census run: `node scripts/wave-census.mjs --round 38 --round 39 --round 40 --round 41` exits 1 with `WAVE_CENSUS: DRIFT (rounds=4 waves=8 findings=4)`.

Fact 1, round 39's payloads never spawned as waves: HOLDS. One sentence is wider than its evidence.
- Census output: `WAVE round=39 wave=build ... seats=46 attack=28 reports=0/46` and `WAVE round=39 wave=falsify ... seats=37 ... reports=8/37`.
- .ufo/waves/round-39/evidence/seat-gate.txt: the first 46-seat request timed out (`[Command timed out after 3600 seconds]`, no grant). The second 46-seat request "was cancelled at 11:43Z, no grant" when the freeze message arrived. The 37-seat request ended with `exit 3 after 1509 s, timeout ... seats=37 live=70 pending=33 cap=85`.
- corpus/lessons/round-39.md:61 agrees: "the second 3500 s request was cancelled at the two-hour freeze".
- Defect A: "whose waves timed out at the seat gate" is too broad. The last attempt for the 46-seat wave was cancelled, not timed out. Also, 8 of the 37 falsify tasks did spawn, unchanged, through residual-dispatch.json (residual-dispatch-result.txt: "Spawned 8 background agents"). Smallest fix: "were never granted by the seat gate (two timeouts and one cancellation at the freeze)".
- Round 41 build (34 seats) never spawned: HOLDS. Census: `seats=34 ... reports=0/34`. .ufo/waves/round-41/evidence-seat-gate.txt: "no grant ... The wave was never dispatched: 0 seats spawned".

Fact 2, the 8/37 shared-report explanation: HOLDS.
- `grep -o 'Report:[^"\\]*' .ufo/waves/round-39/residual-dispatch.json` shows 8 trailers `.ufo/waves/round-39/falsify/{BypassSwapRaws,BypassRunReorder,C1SemanticRange,C1Remeasure,GateDirect,CritProbeBias,CritClaimC2,CritClaimC1}.md`. The same 8 trailers appear byte-identical in falsify-dispatch.json.
- `git ls-tree` shows exactly those 8 .md files in round-39/falsify/. The falsify wave lists 29 absent seats (37-29=8). `git log -- .ufo/waves/round-39/falsify/` shows commit 7745826 "residual 8-seat check integrated (reports under falsify/)".
- Census output: `WAVE round=39 wave=residual schema=bare-taskcall seats=8 attack=8 reports=8/8`. A consequence the lesson does not state: `ROUND round=39 ... reports=16/91` counts the same 8 files twice. Report presence is per payload, so it cannot be summed across waves.

Fact 3, round-40 attack seats 45 against the closure's 37: the number HOLDS, but the quotation is wrong and the claim that the gap is unexplained can be refuted.
- Census output: `round=40 wave=build ... attack=14` (critic 8, reviewer 3, mutation-tester 3), `wave=falsify ... attack=31` (critic 12, reviewer 12, mutation-tester 7), `ROUND round=40 ... attack=45`. The ATTACK set is defined at scripts/wave-census.mjs:50 as reviewer, critic, mutation-tester and labrat; it excludes sentinel.
- Defect B (false provenance): the lesson quotes "Attack roles: 37 of 67". The closure at /home/vgpnk/Projects/shokunin/.ufo/reports/round-40/kumitate.md:151 actually says `attack roles 37/67 = 55%`. The number is right, but the quoted text does not exist; `rg '37 of 67'` over the fleet repository finds nothing for kumitate. Fix: quote it verbatim.
- Defect C (the disagreement can be resolved from committed files): I tallied each round-40 payload task by role and checked whether its Report file exists at 4e58bb0e:
  build `critic report 8, reviewer report 3, mutation-tester report 3, executor NOREPORT 1`;
  falsify `critic report 12, reviewer report 10, reviewer NOREPORT 2, mutation-tester NOREPORT 7, sentinel report 1`.
  That gives 14 + 12 + 10 = 36 attack seats that returned. Adding the single sentinel gives exactly 37. The same total is payload 45 + sentinel 1 - 7 dead - 2 cancelled (ReviewProbeValidity and ReviewGateDiff, from round-40/evidence/seat-gate.txt item 5).
- So 37 matches "attack seats that returned, counting the sentinel" [INFERENCE: the closure does not state its formula]. The lesson's arithmetic ("neither 45 nor 38") is true. Its implied claim that no reading produces 37 is false.
- The closure's count is also wider than the fleet definition. scripts/hyaku/lane-addendum.md:44-45 lists attack roles as "reviewer, critic, mutation-tester, labrat", which excludes sentinel. Fix: record "closure 37 = 36 returned attack seats + 1 sentinel; payload 45".

Fact 4, four round-38 supplement files that no task names: HOLDS.
- Census output: 4 lines of `FINDING STRAY_REPORT round=38 wave=falsify` for Check21, Check49, Check52 and Check71 `-supplement.md`.
- `git grep -n -i supplement 4e58bb0e -- '*.json'` matches only evidence/falsify-summary.json:110-114 (a "supplements" list) and final/revision-binding.json:219. It matches no round-38 dispatch, spec or plan task. All four files arrived in commit 01aab4b.
- corpus/lessons/round-38-verifier-spotcheck.md:186: "supplements excluded from report count". The files are documented as L1 supplements, not orphans of unknown origin. The STRAY_REPORT label is accurate under the census rule ("no task names it").

Minor: the heading says "(measured on rounds 38-40)", but the first bullet also cites round 41's build payload, and the census run above covers round 41 too.
Smallest safe correction: change the three sentences behind defects A, B and C. No counter, receipt or claim number changes.

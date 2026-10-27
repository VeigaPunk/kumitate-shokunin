| round | item | class | quote (verbatim, ≤25 words) | one-line reason |
|---|---|---|---|---|
| 55 | 1 | `report-fidelity` | "R55-V1: report Landed changes omitted the two trailing bookkeeping commits (e7a07111, 26c886d7)." | report "Landed changes" omitted two landed commits; Q51 is prose, no arm reads base..tip |
| 55 | 2 | `tally-drift` | "R55-V2: B=9→10 in report + corpus/lessons/round-55.md + LOG.md is wrong; measured B=9→11." | published B=9->10 disagrees with the measured B=9->11 |
| 55 | 3 | `carried-unaddressed` | "Carried (not this round's): R41-2 gate-pins ruling, R43-1/R43-5, A3e captured-invocation, R53-2 seat-accounting convention." | pure carryover list (R41-2, R43-1/5, A3e, R53-2) with no owner and no fix |
| 56 | 1 | `wave-shape` | "R56-V1 - L2 floor unmet this round (prepared-but-undispatched wave)" | the round's declared L2 dispatch floor was neither met nor waived |
| 56 | 2 | `frozen-predicate-defect` | "R56-V2 - stale frozen rules A54/A55 (exactly-24/exactly-25 literals)" | frozen rules A54/A55 pin literals (exactly-24/25) the surface has outgrown |
| 56 | 3 | `reference-drift` | "R56-V3 - this artifact lands without a corpus/README.md map row" | artifact lands without its corpus/README.md map row (Q48) |
| 56 | 4 | `carried-unaddressed` | "Carryovers unchanged: R41-2 gate-pins ruling, R43-1/R43-5, A3e captured-invocation, R53-2 seat-accounting." | carryovers re-listed unchanged |
| 57 | 1 | `dispatch-accounting` | "Double-live L1 orchestration defect (above)" | two live L1s for one round; the second launch is absent from dispatch evidence |
| 57 | 2 | `append-only-violation` | "Filed-report rewrite: 8e43dbcd rewrote paragraphs of the earlier filed report 7c3d1203 in place" | filed report rewritten in place instead of an appended erratum |
| 57 | 3 | `frozen-predicate-defect` | "R57-V1..V4 (lane-routed, wave-found): B8 dead nonce-grep pathspec + absent argv assert; drop-one held=9/9 in-band acceptance; name-only" | wave-found gates accept drop-one in-band 9/9 and a forged receipt |
| 57 | 4 | `carried-unaddressed` | "Carried L0 items unchanged: R41-2, R43-1/R43-5, A3e, R53-2." | L0 carryovers re-listed unchanged |
| 58 | 1 | `tally-drift` | "R58-V1 - the C2 base counter is misreported as held=0/5." | C2 base reported held=0/5 where the committed receipt reads 2/5 |
| 58 | 2 | `dispatch-accounting` | "overstates the dispatch (see §6: 35 reports, 29 never spawned)" | "64/64 seats" where 35 reports exist and 29 were never spawned |
| 58 | 3 | `citation-integrity` | "R58-V3 - corpus/README.md:172 cites S121 for the new entry's Temporal source, and S121" | README cites S121, which is not a SOURCES row and is another lane's id |
| 58 | 4 | `tally-drift` | "the tier counts are wrong" | tier histogram reported 96->99 where the census reads 99->102 |
| 58 | 5 | `tally-drift` | "its own registry table carries 18 kind=gate rows" | "Seventeen are gates" against 18 kind=gate rows (Q41 prose-only) |
| 58 | 6 | `registry-home` | "R58-V6 - the SCORECARD capabilities table gained no receipt-evidence row, although the round declares a capability" | capability acquired with no SCORECARD Capabilities row; the existing row is stale |
| 58 | 7 | `reference-drift` | "R58-V7 - this non-author file lands without a README row or a readme-map pin." | non-author file lands with no README row and no covered pin |
| 58 | 8 | `report-fidelity` | "the campaign's own MERGE-REPORT says a shared page is" | reject reason overstates ("same-page duplicate") beyond the campaign's own wording |
| 60 | 1 | `uncommitted-work` | "R60-V1 - uncommitted round work (blocking for C1)." | the round close exists only in the working tree; landed-means-committed fails |
| 60 | 2 | `dangling-pointer` | "R60-V2 - placeholders filed in the fleet report." | TIP/MEASURED/COMMITS placeholders name no object (Q52/Q61) |
| 60 | 3 | `tally-drift` | "R60-V3 - the report's 9/10 contradicts its own receipt." | report claims 9/10 where its receipt and SCORECARD read 8/10 |
| 60 | 4 | `dangling-pointer` | "R60-V4 - nonexistent evidence files cited." | cited tip receipts exist nowhere in the repo (Q55) |
| 60 | 5 | `dispatch-accounting` | "R60-V5 - the dispatch registry is not in the gate's schema." | dispatch registry not in the gate's schema (members object, agentId null) |
| 60 | 6 | `report-fidelity` | "R60-V6 - dead seats unreported." | 27/32 dead seats and the launcher crash are unreported (Q54/Q59) |
| 60 | 7 | `uncommitted-work` | "R60-V7 - the LOG tie is unsupported at the tip." | LOG tie unsupported at the tip: the entry is uncommitted |
| 60 | 8 | `reference-drift` | "R60-V8 - corpus map drift, integrator-caused (sixth recurrence of the R56-V3 / R58-V7 class)." | integrator-caused map drift, sixth recurrence of the R56-V3 class |
| 60 | 9 | `citation-integrity` | "R60-V9 - reject reason cites the wrong snapshot id." | reject reason cites S141 where the package now assigns S211 |
| 61 | 1 | `uncommitted-work` | "R61-V1 - falsifier fixtures live only in tmpfs." | falsifier fixtures live only in tmpfs and expire |
| 61 | 2 | `frozen-predicate-defect` | "R61-V2 - frozen counters admit fabrication and reject honest work." | frozen counters admit fabrication and reject honest work (Q57) |
| 61 | 3 | `append-only-violation` | "R61-V3 - in-place edits to filed bytes in 165b830." | two filed artifacts edited in place, no appended correction |
| 61 | 4 | `dangling-pointer` | "R61-V4 - R60 fleet-report placeholders." | round-60 report still carries six MEASURED/TIP/COMMITS tokens |
| 61 | 5 | `reference-drift` | "R61-V5 - proxy DRIFT and an unpinned tool." | proxy stanza stale and tool unpinned in the change that adds the row |
| 61 | 6 | `dispatch-accounting` | "R61-V6 - dead seat Audit19." | dead seat Audit19: the attack item never ran, the prompt was rejected |
| 62 | 1 | `wave-shape` | "Declare 1-3 claims before any evidence seats run (§2)." | no claims declared before the evidence seats; the round's blocking failure |
| 62 | 2 | `dispatch-accounting` | "Run waves through the validator." | five unvalidated batches (96 seats) with no dispatch proof |
| 62 | 3 | `carried-unaddressed` | "R61-V2 remains open (fourth consecutive round noted)" | R61-V2 re-listed as open for the fourth consecutive round |
| 62 | 4 | `verification-gap` | "Audit19 residuals: the re-queue's own report lists the exhaustive no-truncation / exact-traceback / per-row identity checks" | Audit19 exhaustive checks still unexecuted, no transcript |
| 62 | 5 | `citation-integrity` | "Six pre-existing W04 duplicate-URL registry warnings (S034/S068/S084/S095/S123/S126) persist across rounds; either disambiguate the scopes or supersede" | six W04 duplicate-URL groups: one URL under two ids, undecided |
| 63 | 1 | `reference-drift` | "D1 (R56-V3 recurrence, tenth time)." | tenth recurrence of R56-V3; readme-map-close.mjs remains unlanded |
| 63 | 2 | `verification-gap` | "D2. Commit a transcript of node scripts/inline-dispatch-evidence.mjs --selftest (exact tally) beside close/inline63-tip.txt; 69/69 is currently prose" | 69/69 selftest tally is prose in SCORECARD/SKILL, no transcript |
| 63 | 3 | `tally-drift` | "D3. Correct the report/lesson count of w2 name collisions (three -2 stems, not one)" | w2 name-collision count wrong (three -2 stems, not one) |
| 63 | 4 | `tally-drift` | "D4. K_members 52 → 49 in the proxy stanza masks four missing kimi-root members that kimi-census" | K_members 52->49 hides four members the census reads MEMBER_MISSING |
| 63 | 5 | `carried-unaddressed` | "D5 (carried). Audit19 residuals, the Q51 hash 9237a72 that resolves nowhere, the six W04 duplicate-URL warnings" | carried block re-lists Audit19, the Q51 hash, six W04 groups, counter holes |
| 63 | 6 | `wave-shape` | "D6. m_flash share counted strictly (44.3%) is below the ≥50% line and the plan's seat band" | seat band missed and the strict m_flash share (44.3%) under the 50% line |
| 64 | 1 | `verification-gap` | "D1 - unreceipted selftest tally" | 125-case selftest tally unreceipted; the last transcript reads 52/52 |
| 64 | 2 | `reference-drift` | "D2 - README row for this file (blocking for round 65's own gate)" | no README row for the spot-check; it blocks round 65's own map gate |
| 64 | 3 | `dangling-pointer` | "D3 - dangling pointers: close/supplementary-c2.txt (absent; real outputs under build/K64R2ExecSupplementaryC2/out-*.txt)" | three cited artifacts absent or untracked |
| 64 | 4 | `carried-unaddressed` | "D4 - carried: Kimi layer DEGRADED K=49/53 (host state, kimi-census MEMBER_MISSING ×4); w2 SESSION_AMBIGUOUS ×4" | Kimi layer DEGRADED, SESSION_AMBIGUOUS and the fleet-.git incident carried |
| 64 | 5 | `carried-unaddressed` | "D5 - carried: R61-V2 and the Audit19 residuals are listed as open items in the lesson" | R61-V2 and the Audit19 residuals carried, not re-checked |
| 65 | 1 | `citation-integrity` | "D1 - Gate row table contradicts the registry." | ## Gate maps S204/S205/S206 to documents SOURCES does not hold |
| 65 | 2 | `registry-home` | "D2 - capability row missing." | harm-matrix has no SCORECARD Capabilities row |
| 65 | 3 | `registry-home` | "D3 - registry home. SKILL.md has no rows for harm-matrix / omp-binary-probe" | no SKILL.md rows and no pins for harm-matrix / omp-binary-probe |
| 65 | 4 | `reference-drift` | "D4 - proxy stanza stale" | proxy DRIFT (A +103, C2 +3) and QUALITY Q62-Q64 unlanded |
| 65 | 5 | `report-fidelity` | "D5 - cite-check-fleet-dot errors 1545 → 1637 (+92) across two new files" | cite-check errors +92 across two new files, unmentioned |
| 65 | 6 | `wave-shape` | "D6 - round size / wave 2." | 45 seats against the 64-100 band; the falsify wave never dispatched |
| 65 | 7 | `reference-drift` | "D7 - README row for this file." | no README row for this spot-check; the round-66 opener adds it |

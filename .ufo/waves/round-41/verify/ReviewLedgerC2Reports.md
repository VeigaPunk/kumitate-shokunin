RESULT ReviewLedgerC2Reports rev=fae386aa9e0542710b7a893d84c8e92e86fc079b verdict=partial findings=45 dropped=15

Ledger of the nine C2 falsify reports against fae386aa. Dispositions: FIXED 15, PARTIAL 4, RECORDED 7, DROPPED 15, N-A (informational, no lane action needed) 4. Clone: /fast/scratch/hyaku/kumitate-r41a2/seats/ReviewLedgerC2Reports/lane, `git rev-parse HEAD` = fae386aa9e0542710b7a893d84c8e92e86fc079b (clean).

| report | finding | at fae386aa | pointer |
|---|---|---|---|
| CritC2Capability | A resume-only v1 payload failed closed, blocking the round | FIXED | `taskCall ?? {tasks:[]}` and `resumeSends` counted as `resumed=` (scripts/wave-census.mjs:104,111-113); case WC13 |
|  | B mixed spawn+resume wave misread as REGISTRY_MISMATCH | FIXED | registry now compared against tasks+resumes (:124-131); WC14 |
|  | C `--expect` only pinned one direction | FIXED | WC15 `build:critic=0` vs payload=1 asserts EXPECT_MISMATCH for the under-declared side |
|  | partial duplicate of ufo-swarm-collect; existsSync presence | PARTIAL | non-empty regular-file lstat rule adopted (:117; WC14 shows a directory named S.md is not a report); ufo-swarm-collect is still never named |
|  | province (campaign tooling vs anti-loop) | N-A | the report itself reserves the tradeoff for the judge |
|  | plan/SCORECARD row wider than evidence | FIXED | SCORECARD.md:1681 and SKILL.md:607 rewritten with the stated limits; the resume gap is fixed, not just narrowed |
|  | weak counter (before = Cannot find module) | RECORDED | lesson:191-196 "C2 counter weakness"; the frozen probe is unchanged |
| CritC2ExpectCircular | R40-6 row "the instrument now catches it" too wide | FIXED | lesson:144 now "a declared count can now be checked against the payload ... (a person still types the prose number in; the census reads no prose)" |
|  | fleet round-40 report repeats the wrong 37/67 | RECORDED | lesson:95-98 quotes "attack roles 37/67 = 55%" verbatim and records 45 = 36 returned attack + 1 sentinel − 7 dead − 2 cancelled as CritCensusLessonFacts' inference; the fleet file itself is read-only |
|  | `attack` and misspelled roles vacuous or false-mismatch | FIXED | EXPECT_UNKNOWN for unknown roles and `attack` as the attack total (:155-160); WC16 |
|  | `--expect` not round-scoped | FIXED | `[<round>/]<wave>:<role>=<n>` (:70,:155); WC17; nit: the error-path USAGE string (:58) still prints only the unscoped form |
|  | exit-code limits (r36 falsify EXPECT_UNKNOWN, r35 strays force exit 1) | N-A | a never-dispatched wave has no payload, so EXPECT_UNKNOWN is correct; the two round-35 strays are still unnamed in the lesson |
| CritCensusLessonFacts | defect A "timed out at the seat gate" too broad | FIXED | lesson:87-88: the 46-seat request was cancelled at the freeze, the 37-seat request timed out (exit 3) |
|  | defect B nonexistent quote "Attack roles: 37 of 67" | FIXED | lesson:95 quotes verbatim "attack roles 37/67 = 55%" |
|  | defect C gap resolvable from committed files | RECORDED | lesson:96-98 records the 36+1 arithmetic, attributed as inference |
|  | round-39 `reports=16/91` double counts the 8 shared files | RECORDED | lesson:93 |
|  | heading said rounds 38-40 but cited round 41 | FIXED | lesson:84 "(rounds 38–41, measured at 4e58bb0e)" |
| CritCensusSelftest | 26/45 mutants survived the 12/12 selftest | PARTIAL | WC13-WC20 (02fef27) + WC21-WC23 with revert mutants (final/a2-census-repair-mutants.txt, 3/3 killed). Now pinned: M09 M12 M15 M23 M25 M27 M28 M29 M33 M34 M36 M39 M40. My re-run of 12 missed mutants at fae386aa: M08 M14 M16 M17 M20 M21 M22 M30 M35 M37 M38 still pass 23/23; M19 not faithfully re-appliable (needs names across waves; no fixture exists); M31 superseded by the resume repair. The remainder is not recorded as an open limit |
| ReRecountC2 | F1 counter prints 0 with no data | RECORDED | lesson:191-196; probe unchanged; wave-recount-final.txt now notes "7 rows" per listing |
|  | F2 SCORECARD row pointed only at the before receipt | FIXED | measured+final receipts committed; SCORECARD:1681 cites them; AXES.md exists at the fleet root (outside the lane) |
|  | F3 shared report dir double count | RECORDED | lesson:93 |
|  | F4 plan wording ("seats dispatched", matching swarm-registry.json) | FIXED | lesson:39-40, SCORECARD:1681 |
|  | F6 --expect applies to every listed round | FIXED | round-scoped form (WC17) |
|  | F5 verdict semantics, F7 jq version, F8 second "Report:" | DROPPED | F5/F7 informational; RE_REPORT (:56) unchanged |
| ReviewRegistryRow | anchor-truth row omits TRUTH: PINNED and the flags --self/--pin/--src/--reviews/--json plus OPEN_INVALID | DROPPED | SKILL.md:606 unchanged; `grep -c PINNED SKILL.md` = 0 |
|  | cite-check row quoted only `survived=0/16` | PARTIAL | SKILL.md:599 adds the exit-0 aggregation caveat but still does not quote `nomatch=0 crash=0 control=PASS` |
|  | wave-census row omits --root; cite-check row omits --fleet default | DROPPED | SKILL.md:607 has no --root; no `--fleet` on :599 |
|  | anchor-truth.mjs script defects (--json is not one document, two NUL bytes, header Findings omissions) | DROPPED | scripts/anchor-truth.mjs byte-identical 4e58bb0..fae386aa; unrecorded |
|  | cite-check --fleet default makes scratch-clone counts incomparable | DROPPED | script and row unchanged; the R40-3 receipt stays the real-root record only |
|  | wave-census has no --help | N-A | still `unknown argument` exit 64 (:80); an [info]-level note |
|  | header fail-closed list omits "carries no task list" | DROPPED | header :33-34 unchanged and now also omits the new name/agent (:108) and read-error fail-closes |
| ReviewS038 | used-by listed wave-census.mjs, which did not cite S038 | FIXED | wave-census.mjs:7-9 header now names "source row S038 in corpus/SOURCES.md"; the used-by cell is now honest |
| ScoutCensusOlderRounds | rounds 35-37 read operably; hand recount 0 miscounts | CONFIRMED | no defect to fix |
|  | round-35 strays, round-36 96-of-177 coverage gap, attack-set note | DROPPED | the lesson names strays only for round 38; no lane document records the r36 gap or the r35-37 attack-set note |
| ScoutOmpSpawnFailure | spawn deaths leave no committed trace | RECORDED | lesson:100-105 "Why an absent report cannot say why" |
|  | presence does not prove survival (3-byte file counted) | PARTIAL | non-empty regular file now required (:117); the STATUS:started stub limit is recorded at lesson:171-172 |
|  | live worktree was 379 lines vs 295 at the measured rev | FIXED | attempt-1 leftovers committed in fae386aa and pinned by WC21-WC23 (mistakes row "untested repair") |

Evidence (all in my clone at fae386aa): `node scripts/wave-census.mjs --selftest` → `WAVE_CENSUS_SELFTEST: 23/23 pass`, exit 0. `bash .ufo/waves/round-41/probe/wave-recount.sh.txt` → `RECOUNT_MISMATCHES=0 CAPABILITY_ROWS=2 EXPECT_4_EXIT=1 EXPECT_3_EXIT=0`, exit 0. `node scripts/wave-census.mjs --round 41` → build seats=34 reports=0/34, falsify seats=34 reports=27/34, CLEAN exit 0. Mutant batch seats/ReviewLedgerC2Reports/mut.mjs: M08 M14 M16 M17 M20 M21 M22 M30 M35 M37 M38 survived (23/23); M19 inconclusive (my edit referenced an out-of-scope name — a crash, not a kill); CONTROL exit 0. Committed receipts read: final/cite-mutants-final-fae386aa.txt `survived=0/16 nomatch=0 crash=0 control=PASS`.

Residual risk: the 13 still-unpinned selftest mutants and the 9 dropped ReviewRegistryRow items are recorded nowhere in lesson, LOG or open limits; partial fixes are not flagged as such in the lane. Tools: none installed. Lane writes: this report only; lane git used read-only.

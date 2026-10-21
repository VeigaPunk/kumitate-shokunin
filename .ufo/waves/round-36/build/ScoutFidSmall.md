FID-SMALL notes=13 anchors=247 elsewhere=66 absent=4 dead=12 noid=137

# ScoutFidSmall — per-anchor repair list, remaining notes (read-only)

Pin verified: `/fast/scratch/kumitate-r36/src` HEAD `31c465f15669f744848bd9f5d56191c5085670f7`, mode `dr-xr-xr-x`; lane HEAD `0614092e0804aaca06642cb3a263a05c1cacc98e`. Nothing in the clone was written; no installs were needed.

## Method / counts
- Walk = contract-literal member chunks: each `## ` chunk whose first backticked token resolves uniquely to one origin file; one instance per note (duplicates across registry rows collapsed). Classes per FIDELITY v1; symbol = adjacent backticked span (right first, then left, gap <=14), paired span not anchor/path-like, trim >=3, contains a letter. `nonok = elsewhere + absent`.
- Totals over the 13 notes: anchors 247, ok 28, elsewhere 66, absent 4, dead 12, noid 137, nonok 70. Six notes carry non-ok anchors (249/8/11/8/8/10).
- Reconciliation to the frozen before: prototype per-row walk for these 13 = 276 anchors / 85 nonok, because (a) `failure-telemetry.md` is cited by both S2 and S5, so its one member section is read twice (22 anchors / 11 nonok twice; the 11 rows below are the unique pairs), and (b) `native-judge-pipeline.md` gains 7 phantom anchors / 4 nonok from a section-start defect (separate table below). The L1 reference (deduped) = 254 / 74 = this chunk set + exactly those 7 phantom anchors; no other row differs.
- `*` = the row needs a reflow/symbol swap in the note (sentence-boundary pairing, cross-file intent, or a stale symbol); the proposal is the shortest mechanical edit. All proposed lines are at the pin.
- No-nonok notes: `gate-verdict.md` (4 anchors: 3 dead, 1 noid), `native-transcript-ledger-seats.md` (2 noid), `test-inventories.md` (6: 2 dead, 4 noid). No member sections yet: `native-admission-detail.md`, `local-ship.md`, `singleton-and-queue-ownership.md` (0 anchors; the C2 R5/R7 sections must ship an adjacent verbatim symbol, and singleton deliberately carries no path-form section).

## Repair table — nonok (elsewhere + absent)

| note | noteLine | anchor | symbol | class | nearest occurrence | proposed replacement |
|---|---|---|---|---|---|---|
| cost-and-profile.md | 16 | `:481` | `require_cost_ledger_when_budgeted` | elsewhere | native.rs:430 (own 83) | `native.rs:430` * |
| cost-and-profile.md | 22 | `:519-527` | `validate_cost_ledger` | elsewhere | native.rs:456 (own 98) | `native.rs:456` * |
| cost-and-profile.md | 23 | `:193-198` | `mission_cumulative.tokens_in + tokens_out` | absent | native.rs:217-222 | `native.rs:217-222`, sym→`mission_cumulative_tokens` * |
| cost-and-profile.md | 87 | `:448` | `permits_advance` | elsewhere | 429 | `:429` |
| cost-and-profile.md | 150 | `native_profile.rs:102` | `from_profile_entry` | elsewhere | 102 (`serde`); def 210 | keep `native_profile.rs:102`, sym→`serde`; add `from_profile_entry` (`native_profile.rs:210`) * |
| cost-and-profile.md | 151 | `native_profile.rs:204-209` | `nativeProfiles.{profile}.deadlines` | elsewhere | 218 | `native_profile.rs:218` |
| cost-and-profile.md | 153 | `native_profile.rs:210-220` | `deadline_ms` | elsewhere | 223 (`as_u64`) | `native_profile.rs:210-223`, sym→`as_u64` * |
| cost-and-profile.md | 160 | `native_profile.rs:118-121` | `from_parsed` | elsewhere | 118 (`NativeProfileBounds`) | keep `native_profile.rs:118-121`, sym→`NativeProfileBounds`; anchor `from_parsed` at `native_profile.rs:185` * |
| cost-and-profile.md | 165 | `native_profile.rs:124-127` | `backpressure_from_json_value` | elsewhere | 126 (`validate_native_recovery`) | keep `native_profile.rs:124-127`, move `validate_native_recovery` adjacent * |
| cost-and-profile.md | 168 | `native_profile.rs:142-147` | `None` | elsewhere | 160 (`return None`) | keys→`native_profile.rs:152-157`, sym→`KEYS`; add `None` (`native_profile.rs:160`) * |
| cost-and-profile.md | 172 | `native_profile.rs:164-168` | `omp_bare_selector` | absent | 174 (`BackpressureConfig`) | sym→`BackpressureConfig`, `native_profile.rs:174-178`; retire `omp_bare_selector` (no such symbol at pin; `:260-276` dead, file 268 L) * |
| cost-and-profile.md | 193 | `cost_ledger_validation_tests.rs:1` | `validate_cost_ledger` | elsewhere | 155 | `cost_ledger_validation_tests.rs:155` |
| cost-and-profile.md | 197 | `cost_ledger_validation_tests.rs:15-20` | `ledger_for_seat` | elsewhere | 34 | `cost_ledger_validation_tests.rs:34` |
| cost-and-profile.md | 201 | `cost_ledger_validation_tests.rs:34-45` | `usd_estimate: None` | elsewhere | 57 | `cost_ledger_validation_tests.rs:57` |
| cost-and-profile.md | 205 | `cost_ledger_validation_tests.rs:84` | `cost_ledger: Some(ledger)` | elsewhere | 103 | `cost_ledger_validation_tests.rs:103` |
| cost-and-profile.md | 206 | `cost_ledger_validation_tests.rs:91` | `write_prior_lineage` | elsewhere | 113 | `cost_ledger_validation_tests.rs:113` |
| cost-and-profile.md | 208 | `cost_ledger_validation_tests.rs:97-98` | `native_tests::write_chain_receipt` | elsewhere | 109 | `cost_ledger_validation_tests.rs:109` |
| cost-and-profile.md | 211 | `cost_ledger_validation_tests.rs:106-122` | `mission_cumulative` | elsewhere | 128 | `cost_ledger_validation_tests.rs:106-128` |
| cost-and-profile.md | 249 | `cost_ledger_validation_tests.rs:300-303` | `v1 profile trap` | elsewhere | 360 | `cost_ledger_validation_tests.rs:360` |
| cost-and-profile.md | 304 | `execution_profile_tests.rs:191-204` | `"gemini"` | elsewhere | 211 | keep `execution_profile_tests.rs:191-204`; reflow so `"gemini"` is not adjacent (its `:210-213` anchor covers it) * |
| cost-and-profile.md | 310 | `execution_profile_tests.rs:223-230` | `substrate == Substrate::Omp` | elsewhere | 231 | `execution_profile_tests.rs:231` |
| cost-and-profile.md | 324 | `execution_profile_tests.rs:310-337` | `position()` | elsewhere | 307 | `execution_profile_tests.rs:307` |
| cost-and-profile.md | 326 | `execution_profile_tests.rs:339-368` | `Unknown` | elsewhere | 328 | `execution_profile_tests.rs:328` |
| cost-and-profile.md | 341 | `execution_profile_tests.rs:421-428` | `canonical_cached` | elsewhere | 418 | `execution_profile_tests.rs:418` |
| cost-and-profile.md | 343 | `execution_profile_tests.rs:431-440` | `canonical_profile_hash` | elsewhere | 417 | `execution_profile_tests.rs:417` |
| distill-and-l3.md | 71 | `distill.rs:166-174` | `RouteUniqueMove` | elsewhere | 134-141 | `distill.rs:134-141` |
| distill-and-l3.md | 91 | `distill_tests.rs:211-219` | `["e1","e2"]` | absent | 213 | keep `distill_tests.rs:211-219`, sym→`["e1", "e2"]` |
| distill-and-l3.md | 123 | `distill_tests.rs:389-402` | `proposal_id` | elsewhere | 396 (`route_group_id`) | keep `distill_tests.rs:389-402`, sym→`route_group_id`; anchor `proposal_id` at `distill_tests.rs:295` * |
| distill-and-l3.md | 124 | `distill_tests.rs:1650-1657` | `move_id_label` | elsewhere | 1688 | `distill_tests.rs:1688` |
| distill-and-l3.md | 141 | `distill_tests.rs:1255-1278` | `spawn` | elsewhere | 1293 | `distill_tests.rs:1293` |
| distill-and-l3.md | 150 | `distill_tests.rs:1709-1727` | `stderr_tail_512` | elsewhere | 1736 | `distill_tests.rs:1732-1745` * |
| distill-and-l3.md | 150 | `distill_tests.rs:1694-1706` | `stderr_tail_512` | elsewhere | 1736 | merge with the other `:150` pair (`distill_tests.rs:1732-1745`) * |
| distill-and-l3.md | 187 | `distill_tests.rs:986` | `audit_hash` | elsewhere | 979 | `distill_tests.rs:979` |
| failure-telemetry.md | 27 | `scripts/ufo-mission-result.mjs:11` | `RECEIPT_SCHEMA` | elsewhere | 11 (`SCHEMA = "ufo-mission-result-v1"`) | keep `scripts/ufo-mission-result.mjs:11`, reflow the schema span adjacent; `RECEIPT_SCHEMA` already has `:12` * |
| failure-telemetry.md | 60 | `scripts/ufo-mission-result.mjs:1308` | `acquireSingletonLock` | elsewhere | 1311 | `scripts/ufo-mission-result.mjs:1311` |
| failure-telemetry.md | 63 | `scripts/ufo-mission-result.mjs:1731` | `appendRotatingLog` | elsewhere | 1751 | `scripts/ufo-mission-result.mjs:1751` |
| failure-telemetry.md | 64 | `scripts/ufo-mission-result.mjs:1876` | `writeFileAtomicIfChanged` | elsewhere | 1896 | `scripts/ufo-mission-result.mjs:1896` |
| failure-telemetry.md | 65 | `scripts/ufo-mission-result.mjs:2031` | `emitErrorJson` | elsewhere | 2051 | `scripts/ufo-mission-result.mjs:2051` |
| failure-telemetry.md | 66 | `scripts/ufo-mission-result.mjs:2061` | `MAX_EVIDENCE_LOG_BYTES` | elsewhere | 2081 | `scripts/ufo-mission-result.mjs:2081` |
| failure-telemetry.md | 67 | `scripts/ufo-mission-result.mjs:2143` | `gatedConfigPath` | elsewhere | 2163 | `scripts/ufo-mission-result.mjs:2163` |
| failure-telemetry.md | 68 | `scripts/ufo-mission-result.mjs:2391` | `isMainModule` | elsewhere | 2438 | `scripts/ufo-mission-result.mjs:2438` |
| failure-telemetry.md | 69 | `scripts/ufo-mission-result.mjs:2431` | `loadSwarmPolicy` | elsewhere | 2478 | `scripts/ufo-mission-result.mjs:2478` |
| failure-telemetry.md | 70 | `scripts/ufo-mission-result.mjs:2543` | `parseReportOutput` | elsewhere | 2590 | `scripts/ufo-mission-result.mjs:2590` |
| failure-telemetry.md | 71 | `scripts/ufo-mission-result.mjs:2566` | `newestMtime` | elsewhere | 2613 | `scripts/ufo-mission-result.mjs:2613` |
| queue-and-claim.md | 26 | `scripts/fleet-dispatcher.mjs:95` | `QUEUE_SCHEMA` | elsewhere | 102 | `scripts/fleet-dispatcher.mjs:102` |
| queue-and-claim.md | 27 | `scripts/fleet-dispatcher.mjs:4853` | `writeQueue` | elsewhere | 4525 | `scripts/fleet-dispatcher.mjs:4525` |
| queue-and-claim.md | 28 | `scripts/fleet-dispatcher.mjs:4942` | `acquireQueueLock` | absent | 4585 (`withQueueLock`) | sym→`withQueueLock`, `scripts/fleet-dispatcher.mjs:4585` |
| queue-and-claim.md | 29 | `scripts/fleet-dispatcher.mjs:5513` | `maybeEnqueueIterationSuccessor` | elsewhere | 5089 | `scripts/fleet-dispatcher.mjs:5089` |
| queue-and-claim.md | 30 | `scripts/fleet-dispatcher.mjs:5956` | `admitQueueCandidates` | elsewhere | 5532 | `scripts/fleet-dispatcher.mjs:5532` |
| queue-and-claim.md | 31 | `scripts/fleet-dispatcher.mjs:7078` | `reconcileQueue` | elsewhere | 6484 | `scripts/fleet-dispatcher.mjs:6484` |
| queue-and-claim.md | 32 | `scripts/fleet-dispatcher.mjs:7624` | `queueSummary` | elsewhere | 7030 | `scripts/fleet-dispatcher.mjs:7030` |
| queue-and-claim.md | 33 | `scripts/fleet-dispatcher.mjs:8966` | `runCycle` | elsewhere | 8375 | `scripts/fleet-dispatcher.mjs:8375` |
| route-resolution.md | 50 | `scripts/omp-global-config.mjs:345` | `parseModelRoles` | elsewhere | 368 | `scripts/omp-global-config.mjs:368` |
| route-resolution.md | 51 | `scripts/omp-global-config.mjs:351` | `parseAgentModelOverrides` | elsewhere | 374 | `scripts/omp-global-config.mjs:374` |
| route-resolution.md | 52 | `scripts/omp-global-config.mjs:367` | `parseFallbackChains` | elsewhere | 390 | `scripts/omp-global-config.mjs:390` |
| route-resolution.md | 53 | `scripts/omp-global-config.mjs:473` | `resolveAliasFromMaps` | elsewhere | 496 | `scripts/omp-global-config.mjs:496` |
| route-resolution.md | 54 | `scripts/omp-global-config.mjs:503` | `resolveSeatRouting` | elsewhere | 526 | `scripts/omp-global-config.mjs:526` |
| route-resolution.md | 55 | `scripts/omp-global-config.mjs:516` | `resolveSeatFromMaps` | elsewhere | 539 | `scripts/omp-global-config.mjs:539` |
| route-resolution.md | 56 | `scripts/omp-global-config.mjs:546` | `readGlobalSeatRouting` | elsewhere | 608 | `scripts/omp-global-config.mjs:608` |
| route-resolution.md | 60 | `scripts/omp-global-config.mjs:503-514` | `resolveSeatRouting` | elsewhere | 526 | `scripts/omp-global-config.mjs:526` |
| swarm-wave-lifecycle.md | 62 | `scripts/ufo-swarm-wave.mjs:258` | `SWARM_ROLES` | elsewhere | 248 | `scripts/ufo-swarm-wave.mjs:248` |
| swarm-wave-lifecycle.md | 67 | `scripts/ufo-swarm-wave.mjs:768` | `planSwarmWave` | elsewhere | 744 | `scripts/ufo-swarm-wave.mjs:744` |
| swarm-wave-lifecycle.md | 72 | `scripts/ufo-swarm-wave.mjs:295` | `MIN_HOIST_SAVINGS` | elsewhere | 283 | `scripts/ufo-swarm-wave.mjs:283` |
| swarm-wave-lifecycle.md | 74 | `scripts/ufo-swarm-wave.mjs:1307` | `planToDispatchPayload` | elsewhere | 1282 | `scripts/ufo-swarm-wave.mjs:1282` |
| swarm-wave-lifecycle.md | 79 | `scripts/ufo-swarm-wave.mjs:1464` | `persistWaveRegistry` | elsewhere | 1414 | `scripts/ufo-swarm-wave.mjs:1414` |
| swarm-wave-lifecycle.md | 85 | `scripts/ufo-swarm-wave.mjs:1801` | `main` | elsewhere | 1751 | `scripts/ufo-swarm-wave.mjs:1751` |
| swarm-wave-lifecycle.md | 92 | `scripts/ufo-swarm-wave.mjs:166` | `GODSPEED_MARKER` | elsewhere | 159 | `scripts/ufo-swarm-wave.mjs:159` |
| swarm-wave-lifecycle.md | 104 | `scripts/ufo-swarm-collect.mjs:661` | `collect` | elsewhere | 639 | `scripts/ufo-swarm-collect.mjs:639` |
| swarm-wave-lifecycle.md | 122 | `scripts/ufo-swarm-collect.mjs:567` | `collectEntries` | elsewhere | 540 | `scripts/ufo-swarm-collect.mjs:540` |
| swarm-wave-lifecycle.md | 125 | `scripts/ufo-swarm-collect.mjs:582` | `unexpected_member` | elsewhere | 549 | `scripts/ufo-swarm-collect.mjs:549` |

## native-judge-pipeline.md — phantom anchors, reference walk only
The L1 reference (and the prototype) locate a member section by scanning for the first `## ` heading whose text *contains* the section token. That mislocates two non-member sections and invents anchors: `## Judgment order — native.rs::judge_handoff (:470)` is claimed as `native.rs` (note lines 52-99) and `## Contract-hash mechanism (native_contract.rs)` as `native_contract.rs` (note lines 129-150). The gate-literal chunk walk sees **0 anchors** in this note's actual member bodies, so only a sweep that copies that search needs these fixes; the better fix is the search itself.

| note | noteLine | anchor | symbol | class | nearest occurrence | proposed replacement |
|---|---|---|---|---|---|---|
| native-judge-pipeline.md | 84 | `:853` | `reject_critical_lane_timeout` | dead | native.rs:474 | `:474` (or fix the walk) |
| native-judge-pipeline.md | 91 | `:60` | `validate_proposals` | elsewhere | native.rs:490 | `:490` |
| native-judge-pipeline.md | 93 | `:395` | `candidate_digest` | elsewhere | native.rs:371 | `:371` |
| native-judge-pipeline.md | 95 | `native.rs:271` | `nata_assemble_handoff_verdict` | elsewhere | native.rs:262 | `native.rs:262` |
| native-judge-pipeline.md | 130 | `:69` | `NATIVE_CONTRACT_FILES` | elsewhere | native_contract.rs:46 | `:46` |

The same mislocated bodies add 2 non-gated `noid` anchors (note lines 139 `:19`, 141 `:41`).

## Dead anchors (diagnostic only; never gated, never ratcheted)
- cost-and-profile.md L173 `native_profile.rs:260-276`, L176 `native_profile.rs:261-270`, L177 `native_profile.rs:275`, L179 `native_profile.rs:271-274` (stale `omp_bare_selector` block; file 268 L), L352 `execution_profile_tests.rs:525-540`, L355 `...:542-560` (file 533 L).
- gate-verdict.md L197 `:249`, L198 `:249`, L198 `:397` (bare anchors in the `gate_tests.rs` section; that file is 207 L).
- queue-and-claim.md L34 `scripts/fleet-dispatcher.mjs:9536` (file 9225 L; `main` is now 8944).
- test-inventories.md L90 `:6510`, L93 `:6254` (in the `loop_driver_tests.rs` section; file 5182 L).

## Per-note census (chunk walk)
cost-and-profile 105a/23e/2a-/6d/66n/25nonok · distill-and-l3 57/7/1/0/43/8 · failure-telemetry 22/11/0/0/3/11 · queue-and-claim 9/7/1/1/0/8 · route-resolution 14/8/0/0/3/8 · swarm-wave-lifecycle 28/10/0/0/15/10 · gate-verdict 4/0/0/3/1/0 · native-transcript-ledger-seats 2/0/0/0/2/0 · test-inventories 6/0/0/2/4/0 · native-judge-pipeline 0 · native-admission-detail 0 · local-ship 0 · singleton-and-queue-ownership 0. (a=anchors, e=elsewhere, a-=absent, d=dead, n=noid.)

## Commands run (read-only)
- `git -C /fast/scratch/kumitate-r36/src rev-parse HEAD` → `31c465f15669f744848bd9f5d56191c5085670f7`; `stat -c '%A'` → `dr-xr-xr-x`.
- `git -C .../kumitate-shokunin rev-parse HEAD` → `0614092e0804aaca06642cb3a263a05c1cacc98e`.
- Classification: imported `scripts/claims-check.mjs` `probeSections({self, src:clone})` in the eval kernel; re-walked its `probe.files`/resolver with the FIDELITY v1 anchor + adjacency rules; row identities diffed against the L1 reference walk (only the 7 native-judge rows differ).
- Symbol/def verification: `grep -n`, `sed -n` against the pinned clone for `function/fn/const` definition lines cited in the table (e.g. `fleet-dispatcher.mjs:4525 writeQueue`, `4585 withQueueLock`, `8375 runCycle`, `native_profile.rs:210 from_profile_entry`, `native.rs:262 nata_assemble_handoff_verdict`, `native_contract.rs:46 NATIVE_CONTRACT_FILES`).

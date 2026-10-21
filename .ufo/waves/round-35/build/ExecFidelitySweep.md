FIDELITY_SWEEP S anchors=1311 regressed=223 R anchors=236 regressed=2

## Findings

Axes: operability and coverage. This probe measures the coverage:script-layer C2 anchor freshness claim; R is reported as the requested cross-layer check, not as a change to the assigned scope.

The mechanical census read all 40 top-level `corpus/knowledge/*.md` notes and found 1,547 anchors in `## ` sections whose heading names a `scripts/` or `crates/` path. It tests exact inclusive line ranges with no padding. Full-path citations test that path; bare `:N` citations test the section heading's member file.

| Layer | Anchors | Hit at 964f443e | Hit at 31c465f1 | Regressed (old hit, new miss) | Never hit either revision | No paired identifier |
|---|---:|---:|---:|---:|---:|---:|
| S (`scripts/`) | 1311 | 422 | 208 | 223 | 880 | 177 |
| R (`crates/`) | 236 | 46 | 47 | 2 | 187 | 32 |

Every regressed S anchor is listed below as `note :: member :: noteLine:anchor symbol→nearest31c`; `-` means the symbol had no matching line anywhere in the pinned 31c source. The complete row-level evidence, including hit flags, is `/fast/scratch/kumitate-r35/w/ExecFidelitySweep/anchors.tsv`.

## Regressed S anchors (all 223)

failure-telemetry.md :: scripts/ufo-mission-result.mjs :: 51:scripts/ufo-mission-result.mjs:1308 acquireSingletonLock→1311 | 54:scripts/ufo-mission-result.mjs:1731 appendRotatingLog→1751 | 55:scripts/ufo-mission-result.mjs:1876 writeFileAtomicIfChanged→1896 | 56:scripts/ufo-mission-result.mjs:2031 emitErrorJson→2051 | 57:scripts/ufo-mission-result.mjs:2061 MAX_EVIDENCE_LOG_BYTES→2081 | 58:scripts/ufo-mission-result.mjs:2143 gatedConfigPath→2163 | 59:scripts/ufo-mission-result.mjs:2391 isMainModule→2438 | 60:scripts/ufo-mission-result.mjs:2431 loadSwarmPolicy→2452 | 61:scripts/ufo-mission-result.mjs:2543 parseReportOutput→2590 | 62:scripts/ufo-mission-result.mjs:2566 newestMtime→2613

native-trial-launch.md :: scripts/run-omp-native-trial.mjs :: 343:scripts/run-omp-native-trial.mjs:3229 main→3234 | 344::50 PROFILE→56 | 345::59 ADMITTED_PROFILES→65 | 345::109 PROPOSAL_WAVE_CEILING→115 | 346::844 parseArgs→851 | 346::958 planLaunchMode→965 | 348::171 snapshotDispatchInputs→176 | 348::646 resolveNativeDispatchPolicy→639 | 349::1282 handOffToSightingWall→1289 | 350::831 die→838

native-trial-launch.md :: scripts/collect-omp-native-handoff.mjs :: 362::869 validateDispatches→873 | 363::951 writeEvidenceFile→955 | 363::973 persistEvidenceWrites→977

native-trial-launch.md :: scripts/collect-omp-native-handoff-lib/base.mjs :: 375::223 ROUTING_HEALTH_OUTCOMES→217 | 377:scripts/collect-omp-native-handoff-lib/base.mjs:682 classifyFailure→758 | 378::303 die→302

native-trial-launch.md :: scripts/collect-omp-native-handoff-lib/events.mjs :: 386::260 taskCalls→265 | 386::381 taskDispatches→396

native-trial-launch.md :: scripts/collect-omp-native-handoff-lib/evidence.mjs :: 395:scripts/collect-omp-native-handoff-lib/evidence.mjs:275 modelEvidence→276 | 396::70 attemptLedgerEntry→71 | 396::474 seatStatus→476 | 397::631 verifyEffectiveLaunch→633 | 398::520 nativeReceiptDigests→522 | 398::1003 buildCostLedger→1005 | 399::1067 appendRoutingHealth→1071

native-trial-launch.md :: scripts/collect-omp-native-handoff-lib/policy.mjs :: 406:scripts/collect-omp-native-handoff-lib/policy.mjs:39 splitRoute→66 | 407::155 loadSeatRoutingMirror→173 | 408::283 verifyLaunchSeatRouting→301 | 409::619 resolveNativeProfile→637 | 409::704 readRoundPlan→722 | 410::780 waveTokenFromContext→798 | 411::879 loadCanonicalDirective→897 | 411::908 parseRateCard→926

ops-watchers.md :: scripts/ufo-stale-watchdog.mjs :: 23::1001 tick_error→- | 23::706 finally→- | 23::719 state_save_error→- | 23::734 runTickDuties→- | 25::734 runTickDuties→- | 30::931 pendingRepend→245 | 34::136 POLL_MS→- | 40::869 l2_steer→- | 41::874 recovered→- | 43::914 refire_removed→- | 44::903 refire_exhausted→- | 48::621 attemptRepend→190

ops-watchers.md :: scripts/ufo-stale-watchdog.mjs :: 49::637 refire_repended→206 | 50::646 repend_exhausted→244 | 51::667 repend_exhausted→244 | 52::672 refire_repend_refused→237 | 53::677 repend_error→242 | 53::683 repend_exhausted→244 | 55::523 parseReportOutput→152 | 57::983 watchdog_instance_refused→- | 57::986 watchdog_start→- | 57::989 watchdog_start_error→- | 59::731 UFO_CONFIG_PATH→- | 59::808 policy_unreadable→-

ops-watchers.md :: scripts/ufo-stale-watchdog.mjs :: 61::185 watchdog_log_rotated→82 | 61::190 watchdog_log_rotate_failed→87 | 62::983 watchdog_instance_refused→- | 62::986 watchdog_start→- | 62::989 watchdog_start_error→- | 62::1001 tick_error→- | 63::281 state_load_error→111 | 63::719 state_save_error→- | 64::769 status_malformed→- | 64::781 element_shape→- | 64::815 mission_skipped→- | 64::826 scan_error→-

ops-watchers.md :: scripts/ufo-stale-watchdog.mjs :: 64::840 future_mtime→- | 64::808 policy_unreadable→- | 65::869 l2_steer→- | 65::874 recovered→- | 65::893 nudge→7 | 65::914 refire_removed→- | 65::903 refire_exhausted→- | 66::631 repend_skipped→200 | 66::637 refire_repended→206 | 66::644 refire_repend_refused→237 | 66::646 repend_exhausted→244 | 66::667 repend_exhausted→244

ops-watchers.md :: scripts/ufo-stale-watchdog.mjs :: 66::677 repend_error→242 | 67::585 flash_live→- | 67::581 flash_probe_fail→- | 69::840 future_mtime→- | 71::154 isSafeRunId→199 | 73::264 nonnegSafeInt→- | 73::266 ENTRY_RULES→- | 73::370 salvagePendingRepend→- | 75::561 flashProbe→- | 75::585 flash_live→- | 79::550 omp→- | 79::110 emitFor→-

ops-watchers.md :: scripts/ufo-l0-monitor.mjs :: 86::1305 isMain→1322 | 95::1321 parseDeclaredArgv→1338 | 98::1347-1362 u→1366 | 106::1402-1408 writeQueue→1422 | 117::1462-1467 forgeSuccessor→1483 | 121::1419 writeQueue→1422 | 121::1431 writeQueue→1436 | 121::1459 writeQueue→1448 | 121::1467 writeQueue→1476 | 142::1041-1056 configSha256→1059 | 150::1526-1548 forged→1562 | 172::803 DISPATCHER→818

ops-watchers.md :: scripts/ufo-l0-watch.mjs :: 235::111 UFO_L0_WATCH_STATE→102

queue-and-claim.md :: scripts/fleet-dispatcher.mjs :: 17:scripts/fleet-dispatcher.mjs:95 QUEUE_SCHEMA→102 | 18:scripts/fleet-dispatcher.mjs:4853 writeQueue→4525 | 19:scripts/fleet-dispatcher.mjs:4942 acquireQueueLock→- | 20:scripts/fleet-dispatcher.mjs:5513 maybeEnqueueIterationSuccessor→5089 | 21:scripts/fleet-dispatcher.mjs:5956 admitQueueCandidates→5725 | 22:scripts/fleet-dispatcher.mjs:7078 reconcileQueue→7362 | 23:scripts/fleet-dispatcher.mjs:7624 queueSummary→7747 | 24:scripts/fleet-dispatcher.mjs:8966 runCycle→9078 | 25:scripts/fleet-dispatcher.mjs:9536 main→9209

remaining-scripts-census.md :: scripts/charter-scribe/prompts/kimi-update.prompt.txt :: 429:scripts/charter-scribe/config.json:21 promptTemplate→20

remaining-scripts-census.md :: scripts/fleet-selfheal-verify.mjs :: 550:scripts/fleet-selfheal-verify.mjs:50 MAX_LEDGER_SEGMENTS→52

remaining-scripts-census.md :: scripts/land-fleet-run.mjs :: 558:scripts/land-fleet-run.mjs:32 LandingError→33 | 558::50 landFleetRun→53

remaining-scripts-census.md :: scripts/omp-wave-context.mjs :: 609:scripts/omp-wave-context.mjs:37 WaveContextError→- | 609::59 WAVE_CONTEXT_MARKER→-

remaining-scripts-census.md :: scripts/prepare-ephemeral-fleet.mjs :: 613:scripts/prepare-ephemeral-fleet.mjs:84 readFleetPolicy→82 | 613::219 composeEphemeralFleet→191

remaining-scripts-census.md :: scripts/primeagent-refinement-ledger.mjs :: 654:scripts/primeagent-refinement-ledger.mjs:132 DEFAULT_LEDGER_PATH→-

remaining-scripts-census.md :: scripts/project-devin-subagents.mjs :: 658::102 MAX_REPO_FILE_BYTES→114

remaining-scripts-census.md :: scripts/render-seat-tables.mjs :: 662:scripts/render-seat-tables.mjs:26 TARGETS→27 | 662::38 seatsDigest→31

remaining-scripts-census.md :: scripts/ufo-l0-monitor.test.mjs :: 715::1286 null→1311

remaining-scripts-census.md :: scripts/ufo-night-watchdog.test.mjs :: 767:scripts/ufo-night-watchdog.test.mjs:90 hasTmux→168

remaining-scripts-census.md :: scripts/ufo-refinement-context.mjs :: 771:scripts/ufo-refinement-context.mjs:24 REFINEMENT_CONTEXT_SCHEMA→- | 771::47 buildRefinementContext→-

remaining-scripts-census.md :: scripts/ufo-refinement-context.test.mjs :: 775:scripts/ufo-refinement-context.test.mjs:20 buildRefinementContext→- | 775::17 REFINEMENT_BEGIN→-

remaining-scripts-census.md :: scripts/ufo-route-preflight.mjs :: 779:scripts/ufo-route-preflight.mjs:32 ROUTE_PREFLIGHT_SCHEMA→33 | 779::54 routeFamilies→55

remaining-scripts-census.md :: scripts/ufo-route-preflight.test.mjs :: 783::101 probeFamilies→113

remaining-scripts-census.md :: scripts/ufo-stale-watchdog.test.mjs :: 787::12 spawnSync→10 | 787::120 fd2_fallback_carries_duty_events_when_log_path_dead→- | 787::168 closed_fd2_never_throws_out_of_tick→-

remaining-scripts-census.md :: scripts/ufo-state-census.mjs :: 791:scripts/ufo-state-census.mjs:22 CENSUS_SCHEMA→25 | 791::28 censusState→31

remaining-scripts-census.md :: scripts/ufo-state-retention.mjs :: 799::2101 sweep→1901

remaining-scripts-census.md :: scripts/ufo-watchdog-repend.mjs :: 841::51 STATE_SCHEMA→57 | 841::58 mission_stale_registered→64 | 841::141 SPAWN_FAILURE_TAIL_MAX→159

remaining-scripts-census.md :: scripts/ufo-watchdog-repend.test.mjs :: 845:scripts/ufo-watchdog-repend.test.mjs:14 MAX_ATTEMPTS→16 | 845::15 STABLE_REFUSAL_REASONS→17 | 845::16 decideRow→18 | 845::17 extractRependReport→19 | 845::18 manifestClassFor→20 | 845::19 normalizeState→22 | 845::20 rowSignature→23 | 845::21 runRependCycle→24 | 845::25 test→31 | 845::47 fakeSpawn→53 | 845::56 STABLE→62

route-probe-cluster.md :: scripts/probe-ufo-route-health.mjs :: 94::1080 persistState→1073 | 98::1164 main→1157 | 98::103 parseArgs→107 | 99::97 usage→99 | 102::784 mapPool→775 | 104::41 MAX_ROUTES→45 | 104::45 FAILURE_CLASSES→49 | 105::506 classifyFailure→497 | 105::200 ROUTE_TOKEN→- | 106::939 assertNoSecrets→932 | 107::904 session_truncated→897 | 108::1015 interpretRouteHealth→1008

route-probe-cluster.md :: scripts/probe-ufo-route-health.mjs :: 108::1037 interpretPersistedHealth→1030 | 110::1185 ok→1178 | 357:scripts/probe-ufo-route-health.mjs:1015 interpretRouteHealth→1008

route-resolution.md :: scripts/omp-global-config.mjs :: 32:scripts/omp-global-config.mjs:304 globalOmpConfigPath→327 | 41:scripts/omp-global-config.mjs:345 parseModelRoles→368 | 42:scripts/omp-global-config.mjs:351 parseAgentModelOverrides→374 | 43:scripts/omp-global-config.mjs:367 parseFallbackChains→390 | 44:scripts/omp-global-config.mjs:473 resolveAliasFromMaps→496 | 45:scripts/omp-global-config.mjs:503 resolveSeatRouting→526 | 46:scripts/omp-global-config.mjs:516 resolveSeatFromMaps→531 | 47:scripts/omp-global-config.mjs:546 readGlobalSeatRouting→591 | 51:scripts/omp-global-config.mjs:503-514 resolveSeatRouting→526

sighting-wall.md :: scripts/ufo-sighting.mjs :: 93:scripts/ufo-sighting.mjs:548 writeManifest→533 | 96:scripts/ufo-sighting.mjs:379 readManifest→423 | 97:scripts/ufo-sighting.mjs:531 loadStatusView→516 | 99:scripts/ufo-sighting.mjs:663 acquireOperationLock→648 | 102:scripts/ufo-sighting.mjs:781 withOperationLock→767 | 105:scripts/ufo-sighting.mjs:2225 spawnPaneForMission→2239 | 107::2372 launchMission→2386 | 108:scripts/ufo-sighting.mjs:3584 stopMission→3616 | 109::3339 completeMission→3361 | 110::1976 reconcileLocked→1991 | 110::3572 scheduleReconcile→3604 | 112::3511 steerMission→3543

sighting-wall.md :: scripts/ufo-sighting.mjs :: 112::3544 peekMission→3576 | 114:scripts/ufo-sighting.mjs:4399 main→4432

sighting-wall.md :: scripts/ufo-sighting-lib/surface.mjs :: 202::318 runLegacyNativeDirect→325 | 204::294 usage→301

swarm-wave-lifecycle.md :: scripts/ufo-swarm-wave.mjs :: 46:scripts/ufo-swarm-wave.mjs:143 SWARM_WAVE_SCHEMA→134 | 51:scripts/ufo-swarm-wave.mjs:120 MIN_SWARM_LANES→109 | 53:scripts/ufo-swarm-wave.mjs:258 SWARM_ROLES→248 | 58:scripts/ufo-swarm-wave.mjs:768 planSwarmWave→744 | 63:scripts/ufo-swarm-wave.mjs:295 MIN_HOIST_SAVINGS→283 | 65:scripts/ufo-swarm-wave.mjs:1307 planToDispatchPayload→1282 | 70:scripts/ufo-swarm-wave.mjs:1464 persistWaveRegistry→1414 | 76:scripts/ufo-swarm-wave.mjs:1801 main→1843 | 82:scripts/ufo-swarm-wave.mjs:160 GODSPEED_INVOCATION→153 | 83:scripts/ufo-swarm-wave.mjs:166 GODSPEED_MARKER→159 | 85:scripts/ufo-swarm-wave.mjs:141 SWARM_ROLES→131

swarm-wave-lifecycle.md :: scripts/ufo-swarm-collect.mjs :: 95:scripts/ufo-swarm-collect.mjs:661 collect→672 | 97:scripts/ufo-swarm-collect.mjs:54 RESULTS_SCHEMA→56 | 103:scripts/ufo-swarm-collect.mjs:71 MAX_REGISTRY_BYTES→69 | 113:scripts/ufo-swarm-collect.mjs:567 collectEntries→540 | 116:scripts/ufo-swarm-collect.mjs:582 unmapped_member→555 | 117:scripts/ufo-swarm-collect.mjs:576 unexpected_member→549

## Top 20 regressed R anchors (2 found)

- `loop-driver.md:32`, member `crates/ufo-core-runtime/src/loop_driver.rs`, `:110` `CHECKPOINT_PROTOCOL_VERSION` → nearest 31c line 111.
- `runtime-remainder-census.md:342`, member `crates/ufo-core-runtime/src/round.rs`, `crates/ufo-core-runtime/src/round.rs:17-20` `RoundState` → nearest 31c line 8.

## Parsing limits

- Section membership comes from literal `## ` headings with a `scripts/` or `crates/` path token; sections end at the next level-2 heading. Citation rows are occurrences, not unique member identities.
- Sentence boundaries are heuristic: blank paragraphs and `.`, `?`, or `!` followed by whitespace outside inline backticks. Markdown/fenced-code examples are included, and abbreviations or unusual punctuation can split a natural-language sentence differently.
- Only decimal `path:N[-M]` citations for `scripts/` or `crates/`, and bare `:N[-M]`, are recognized. Bare anchors bind to their section heading's member; full-path anchors bind to the cited path. The nearest backticked candidate must match the script's simple ASCII identifier / Rust `::` chain grammar; nonmatching backticks leave the symbol blank. `never-hit` includes such unpaired rows.
- A hit requires the identifier as a token on one of the exact cited lines. `nearest31c` searches the full cited target file and reports the closest matching line to the cited range (earlier line wins a tie); absent file or absent symbol yields blank. It does not establish semantic equivalence or determine whether moved code is otherwise covered.

## Retained evidence and command

Scratch tool: `/fast/scratch/kumitate-r35/w/ExecFidelitySweep/fidelity.mjs`.

TSV: `/fast/scratch/kumitate-r35/w/ExecFidelitySweep/anchors.tsv` (1,548 lines including header; columns `note`, `noteLine`, `member`, `anchor`, `symbol`, `hit964`, `hit31c`, `nearest31c`). The script reads notes only and uses `git -C /fast/scratch/kumitate-r35/src show <rev>:<path>` for the pinned source files.

Command run: `node /fast/scratch/kumitate-r35/w/ExecFidelitySweep/fidelity.mjs`

Exact summary output:

```text
S anchors=1311 hit964=422 hit31c=208 regressed=223 never-hit=880 unpaired=177
R anchors=236 hit964=46 hit31c=47 regressed=2 never-hit=187 unpaired=32
NOTES 40
ROWS 1547
OUTPUT /fast/scratch/kumitate-r35/w/ExecFidelitySweep/anchors.tsv
```

No lane files or other repository state were changed. No tests/build/lint/formatter or tool installation was run.

S8FIX defects_fixed=26 blank_lines=13 dead_anchors_before=36 after=0 cite_errors_before=not-run after=not-run
SecCharterScribeSystemdCharterSc.md — scripts/charter-scribe/systemd/charter-scribe.service D1 — replaced “remains the checked-out tree” with the pinned `%h/Projects/ufo-fsd-alpha` value and distinguished user-manager `%h` from system-manager `/root`.
SecCharterScribeSystemdCharterSc.md — scripts/charter-scribe/systemd/charter-scribe.service D2 — recorded the old absolute fnm-node ExecStart and old WorkingDirectory at 964f443e.
SecCharterScribeSystemdCharterSc.md — scripts/charter-scribe/systemd/charter-scribe.service D3 — replaced the false “only other service key” description of `Nice=10`; clarified the timer schedule without implying the service’s own WantedBy is inert.
SecFleetLedgerRotate.md — scripts/fleet-ledger-rotate.mjs D1 — now names the dispatcher’s static import at `scripts/fleet-dispatcher.mjs:38` and traces removal of the importSiblingModule loader.
SecGatesPlan.md — scripts/gates-plan.mjs D1 — field quartet now cites `:4-7`, where all four fields are documented.
SecGatesPlan.md — scripts/gates-plan.mjs D2 — empty UFO_GATES_TOUCHED is described as unknown based on `:126` and `:200`, not the contrary `:89` comment.
SecGatesPlan.md — scripts/gates-plan.mjs D3 — corrected the selection relationship: GROUPS/IGNORE_RES/RULES feed the loop; selectAllGroups is its uncertainty sink.
SecLeanCargoREADMEMd.md — scripts/lean-cargo/README.md D1 — byte-identity now cites the README’s `:77-78`.
SecLeanCargoREADMEMd.md — scripts/lean-cargo/README.md D2 — install/backup and `exec -a cargo rustup` claims now cite README `:11-13`; remaining README anchors are also path-qualified.
SecSyncGlobalRouting.md — scripts/sync-global-routing.mjs D1 — qualified own-file anchors throughout so every named routing symbol resolves to the intended member line, not the prior path owner.
SecSyncGlobalRouting.md — scripts/sync-global-routing.mjs D2 — replaced the SHA-looking trace with a member-scoped hashed-route-suffix trace, avoiding the false content-pin interpretation.
SecSyncUfoContracts.md — scripts/sync-ufo-contracts.mjs D1 — added a member-scoped round-35 trace for the removed KNOWN_ARGS clause.
SecUfoL0WatchTest.md — scripts/ufo-l0-watch.test.mjs D1 — changed the queue-helper import citation from stale `:28` to the actual import group at `:30-35`.
SecUfoStaleWatchdogTest.md — scripts/ufo-stale-watchdog.test.mjs D1 — restored the missing section separator; this was one of the 13 blank lines restored.
SecUfoStaleWatchdogTest.md — scripts/ufo-stale-watchdog.test.mjs D2 — traced the removed r16 provenance and stale 29-case count; scoped all removal traces to this member and retained the verified nine current cases.
SecUfoStateCensus.md — scripts/ufo-state-census.mjs D1 — restored its missing heading separator as part of the 13-site spacing repair.
SecUfoStateCensusTest.md — scripts/ufo-state-census.test.mjs D1 — restored its missing heading separator as part of the 13-site spacing repair.
SecUfoStateRetentionTest.md — scripts/ufo-state-retention.test.mjs D1 — restored the missing heading separators; also changed the malformed-ledger case description and shortened the FIFO range to the nonblank endpoint `:792`.
SecUfoSwarmCollectTest.md — scripts/ufo-swarm-collect.test.mjs D1 — added a member-scoped trace for the removed ENTRY_FAILURE_CLASSES reuse clause.
SecUfoWatchdogRepend.md — scripts/ufo-watchdog-repend.mjs D1 — restored row-state pruning and transient-refusal non-suppression; conditioned fleet matching on `--fleet` and suppression on an unchanged manifest class as well as row signature.
SecUfoWatchdogRependTest.md — scripts/ufo-watchdog-repend.test.mjs D1 — recorded `422 L (was 364 @ 964f443e)` in the section prose.
SecUfoWatchdogRependTest.md — scripts/ufo-watchdog-repend.test.mjs D2 — restored the `mission_stale_registered` refusal named by the STABLE fixture.
CriticC2Final.md — scripts/fleet-ledger-rotate.test.mjs D1 — replaced the false section with the pinned imports, 36 actual node:test cases / 37 textual `test(` occurrences, real case anchors, and a round-35 trace for the unsupported count, absent oracle, invalid-row and lock-family claims.
CriticC2Final.md — all S8 sections D2 — repaired all 36 dead own-file anchors across 17 sections; the pin sweep now finds zero dead anchors. The only anchor numerically above wc -l is the real, nonblank unterminated last line `scripts/ufo-l0-monitor.test.mjs:1465`, already explained in the note.
CriticC2Final.md — 15 S8 sections D3 — replaced stale 2026-10-14 re-census labels with uniform `re-censused at 31c465f1 (round 35)` wording while retaining `was N @ 964f443e` history.
SecSyncUfoContracts.md — composition paragraph — recomputed the largest members from the 60 pinned table rows: fleet-dispatcher.test.mjs 2852, fleet-ledger-rotate.test.mjs 2325, sync-ufo-contracts.mjs 2137.

Additional non-counted fidelity corrections: qualified PrepareError/internal_error absence to the prepare-ephemeral-l1 member and both pins; made fleet-selfheal-verify’s check/skip counts explicitly file-wide; corrected dead or stale local-helper, omp-native-shutdown, tick-config, credential-screen, mission-activity, mission-lifecycle, mission-observation and native-names anchors/claims while completing the all-section anchor sweep. Top-three sizes sum with the other table members to the measured S8 total of 33367 lines.

Files changed: `corpus/knowledge/remaining-scripts-census.md` in the private clone; `/fast/scratch/kumitate-r35/w/ExecS8Fix.patch`; this report only. Behavior: the note now describes the pinned source faithfully at the affected sections, has 60 member headings and restores the 13 blank separators.

Evidence retained: direct pinned-source reads via `/fast/scratch/kumitate-r35/src` at `31c465f1`; the 60-member own-anchor sweep used the claims-check RE_PATHISH/RE_BARE semantics and returned `sections=60 dead_own_file_anchors=0 missing_blank_before_heading=0`; the pre-edit baseline sweep found 36 dead own-file anchors. The 60-row `wc -l` sort yielded 2852 / 2325 / 2137 as the top three and 33367 total lines.

Verification deferred: claims-check, proxy-check and cite-check were not run because the fleet executor role assigns post-integration gates to Main. The per-file cite-check counts at 695bc24 and after-edit are therefore not measured; this is the outstanding acceptance blocker, not a pass claim. Main should run the requested S8 claims check, proxy check, and per-file cite check after integration. No tools were installed or updated.
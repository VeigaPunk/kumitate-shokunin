# kumitate-shokunin corpus

Memory for orchestration & tooling work: OMP task/hub dispatch, ufo-fsd
scripts, `crates/ufo-core-runtime`. Sources are in
`/home/vgpnk/Projects/origin-work/ufo-fsd-alpha` unless noted.

## Coverage map

| Entry | Covers | Primary sources |
|---|---|---|
| `knowledge/dispatch-shapes.md` | The three production dispatch shapes + fixture path; caps; when each applies | `ufo-swarm-wave.mjs`, `config/ufo.json`, `ufo-cli` |
| `knowledge/swarm-wave-lifecycle.md` | plan → run → record → settle → collect verbs; registry/dispatch pair; honest-absence settle | `ufo-swarm-wave.mjs`, `ufo-swarm-collect.mjs` headers |
| `knowledge/route-resolution.md` | `omp-global-config.mjs` resolution precedence, live alias table, fleet-map drift, retry surfaces | `omp-global-config.mjs`, `~/.omp/agent/config.yml` |
| `knowledge/failure-telemetry.md` | Failure classes, capacity subset, routing-health outcomes, outcome triple, exit codes | `ufo-mission-result.mjs`, `collect-omp-native-handoff-lib/base.mjs` |
| `knowledge/singleton-and-queue-ownership.md` | `acquireSingletonLock` mechanics, queue ownership, exec-path gating | `ufo-mission-result.mjs`, `fleet-dispatcher.mjs`, `ufo-stale-watchdog.mjs` |
| `knowledge/successor-chain.md` | Iterate-successor decision gate, defer-not-die, park epochs, afterChains satisfy/starve, admission latch | `fleet-dispatcher.mjs` L275-295/5510/6743-7150/8313+ |
| `knowledge/native-judge-pipeline.md` | `ufo judge-handoff` decode → admission order → refusal vocabulary → verdict fields; contract-hash registry + 256 KiB fuse; `classify_failure_fields` | `native*.rs`, `native_contract.rs`, `gate.rs`, `ufo-cli/src/main.rs` |
| `knowledge/loop-driver.md` | `LoopDriver` epoch loop, boundary-stop gate, round pipeline, `LoopOutcome`/`BrakeTelemetry`/checkpoint vocabulary | `loop_driver*.rs`, `state.rs`, `ufo-cli/src/main.rs` |
| `knowledge/native-trial-launch.md` | `run-omp-native-trial.mjs` main() spine: preflight gates → wall handoff → deferred assignments → anchor/drift/probe gates → spawn → collect/judge/seal; refusal vocabulary; membrane-seal `write` defect | `run-omp-native-trial.mjs`, `ufo-cli/src/main.rs`, `cli_contract.rs` |
| `knowledge/queue-and-claim.md` | pending-work schema/lock, claim pipeline, four counters, state vocabulary, repend door, ledger kinds | `fleet-dispatcher.mjs` L1-6740 |
| `knowledge/enqueue-admission.md` | Queue I/O + lock mechanics, scope partition, godspeed envelope gate, mint + admission battery, batch sibling refs, compaction, receipt verdict machinery | `fleet-dispatcher.mjs` L5713-8645 |
| `knowledge/reconcile-and-cycle.md` | reconcileQueue ordered rules, latch/episode machinery (emitLatched/durable kinds), runCycle pipeline, main() verb surface, constants | `fleet-dispatcher.mjs` L95-200, L8680-14769 |
| `knowledge/sighting-wall.md` | Wall manifest persistence, lock protocol, pane lifecycle (spawn/pane-run/register/resume/stop/restore), steer/peek transport, observation sources, boundary crossings | `scripts/ufo-sighting-lib/` (26 files) |
| `knowledge/native-admission-detail.md` | Seat model vs seat grammar attribution, JS-parity coercions, `FAILURE_RULES` home, profile admission order; Cf-vs-Mn/Zs parity drift (cross-domain) | `native_seats.rs`, `native_admission_text.rs`, `native_admission_rules.rs`, `native_text.rs` |
| `knowledge/cost-and-profile.md` | cost_ledger wire types + validation (seats/lineage/totals), HonestyBrake trigger; execution_profile route catalog + FailureClass authorities (`permits_advance` :448) | `cost_ledger.rs`, `execution_profile.rs`, `native_profile.rs` |
| `knowledge/runtime-support.md` | lane_overlay overrides, writer-lease epochs/sentinels, live Qwen distiller transport | `lane_overlay.rs`, `lease.rs`, `live.rs` |
| `lessons/round-6.md` | Two-writer queue rule (l0-monitor), A1 head-order falsification, Cf/Mn/Zs parity drift | LOG.md round-6; commit `round-6` |
| `lessons/round-5.md` | Wall-handoff double-run defect, membrane-seal `write` mismatch, stub-symmetry trap | LOG.md round-5; commit `round-5` |
| `lessons/round-1.md` | Round-1 method notes, drift trap, stated gaps | LOG.md round-1; commit `round-1` |
| `lessons/round-3.md` | Defer-not-die doctrine, park-epoch trap, admission-latch counting | LOG.md round-3; commit `round-3` |

## Known gaps

- `crates/ufo-core-runtime` remainder: `l3_swarm` internals, `distill.rs`,
  `native_ledger`, `native_seat_coverage`, `native_transcript` internals,
  test-file case inventories, `bounded_fs`/`fs_durability`/`local_ship`
  internals. Round-7 order drafted in `local://kumitate-r6-plan.md`.
- fleet-dispatcher: `queueSummary` field internals remain thin (projection
  named, per-field semantics in the tail map only); sibling-script consumers
  of ledger kinds enumerated at `local://kumitate-r6-ledger-census.md`.
- `ufo-sighting-lib`: done at internals level; entry shim + `__idle`/
  `__reconcile`/`__pane-run` plumbing mapped, deeper display-matrix detail
  (layout engine) not mapped.

All entries are falsifiable and cite file+symbol. Opinions marked as such.

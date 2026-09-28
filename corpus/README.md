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
| `lessons/round-5.md` | Wall-handoff double-run defect, membrane-seal `write` mismatch, stub-symmetry trap | LOG.md round-5; commit `round-5` |
| `lessons/round-1.md` | Round-1 method notes, drift trap, stated gaps | LOG.md round-1; commit `round-1` |
| `lessons/round-3.md` | Defer-not-die doctrine, park-epoch trap, admission-latch counting | LOG.md round-3; commit `round-3` |

## Known gaps

- `crates/ufo-core-runtime` support families: `native_seats.rs` helpers,
  `native_admission_text.rs` JS-parity coercions, `lane_overlay`, `lease`,
  `live`, `cost_ledger` internals (ledger lineage walk), `l3_swarm` —
  loop-driver + native admission surfaces now mapped at pipeline level.
- the-tick ground-handler ops beyond `path_ping`
- fleet-dispatcher middle tail: settle/reconcile machinery after the
  claim path (recordDispatchResult settle verbs, auto-reap, manifest
  reconcile) — queue schema, claim, dispatch, repend now mapped.
- wall-side internals referenced but unmapped: `ufo-sighting-lib/
  launch-verb.mjs`, `spawn-pane.mjs`, `pane-run.mjs` details beyond the
  native-trial chain.

All entries are falsifiable and cite file+symbol. Opinions marked as such.

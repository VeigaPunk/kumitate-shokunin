# kumitate-shokunin corpus

Memory for orchestration & tooling work: OMP task/hub dispatch, ufo-fsd
scripts, `crates/ufo-core-runtime`. Sources are in
`/home/vgpnk/Projects/origin-work/ufo-fsd-alpha` unless noted.

Citation re-verification (round 8): `node scripts/cite-check.mjs` re-resolves
every path / line / symbol / pin written in `SKILL.md` + `corpus/**/*.md`
against that tree — `--json` for machine output, `--selftest` for the embedded
fixture suite, `--strict` to fail on warnings.

## Coverage map

| Entry | Covers | Primary sources |
|---|---|---|
| `knowledge/dispatch-shapes.md` | The three production dispatch shapes + fixture path; caps; when each applies | `ufo-swarm-wave.mjs`, `config/ufo.json`, `ufo-cli` |
| `knowledge/swarm-wave-lifecycle.md` | plan → run → record → settle → collect verbs; registry/dispatch pair; honest-absence settle | `ufo-swarm-wave.mjs`, `ufo-swarm-collect.mjs` headers |
| `knowledge/route-resolution.md` | `omp-global-config.mjs` resolution precedence, live alias table, fleet-map drift, retry surfaces | `omp-global-config.mjs`, `~/.omp/agent/config.yml` |
| `knowledge/failure-telemetry.md` | Failure classes, capacity subset, routing-health outcomes, outcome triple, exit codes | `ufo-mission-result.mjs`, `collect-omp-native-handoff-lib/base.mjs` |
| `knowledge/singleton-and-queue-ownership.md` | `acquireSingletonLock` mechanics, queue ownership, exec-path gating | `ufo-mission-result.mjs`, `fleet-dispatcher.mjs`, `ufo-stale-watchdog.mjs` |
| `knowledge/successor-chain.md` | Iterate-successor decision gate, defer-not-die, park epochs, afterChains satisfy/starve, admission latch | `fleet-dispatcher.mjs` L275-295/5510/6743-7150/8313+ |
| `knowledge/queue-and-claim.md` | pending-work schema/lock, claim pipeline, four counters, state vocabulary, repend door, ledger kinds | `fleet-dispatcher.mjs` L1-6740 |
| `knowledge/enqueue-admission.md` | Queue I/O + lock mechanics, scope partition, godspeed envelope gate, mint + admission battery, batch sibling refs, compaction, receipt verdict machinery | `fleet-dispatcher.mjs` L5713-8645 |
| `knowledge/reconcile-and-cycle.md` | reconcileQueue ordered rules, latch/episode machinery (emitLatched/durable kinds), runCycle pipeline, main() verb surface, constants | `fleet-dispatcher.mjs` L95-200, L8680-14769 |
| `knowledge/queue-summary.md` | `queueSummary` projection: byte-stable key set, 6 `starved` reasons + `isRependableBlock`, `chainWaitState` order + parked-recoverable trap, `lineageGaps` codes, supersessionOrphans attribution, ledger-continuity probe machinery + memo keys, `chainAdvancedBlocked`, deferred/parked continuations, membraneSeal | `fleet-dispatcher.mjs` :10896, :11365-11402, :10928-10968, :4582-4595, :11052-11246 |
| `knowledge/native-trial-launch.md` | `run-omp-native-trial.mjs` main() spine: preflight gates → wall handoff → deferred assignments → anchor/drift/probe gates → spawn → collect/judge/seal; refusal vocabulary; membrane-seal `write` defect | `run-omp-native-trial.mjs`, `ufo-cli/src/main.rs`, `cli_contract.rs` |
| `knowledge/sighting-wall.md` | Wall manifest persistence, lock protocol, pane lifecycle (spawn/pane-run/register/resume/stop/restore), steer/peek transport, observation sources, boundary crossings | `scripts/ufo-sighting-lib/` (26 files) |
| `knowledge/native-judge-pipeline.md` | `ufo judge-handoff` decode → admission order → refusal vocabulary → verdict fields; contract-hash registry + 256 KiB fuse; `classify_failure_fields` | `native*.rs`, `native_contract.rs`, `gate.rs`, `ufo-cli/src/main.rs` |
| `knowledge/loop-driver.md` | `LoopDriver` epoch loop, boundary-stop gate, round pipeline, `LoopOutcome`/`BrakeTelemetry`/checkpoint vocabulary | `loop_driver*.rs`, `state.rs`, `ufo-cli/src/main.rs` |
| `knowledge/native-admission-detail.md` | Seat model vs seat grammar attribution, JS-parity coercions, `FAILURE_RULES` home, profile admission order; Cf-vs-Mn/Zs parity drift (cross-domain) | `native_seats.rs`, `native_admission_text.rs`, `native_admission_rules.rs`, `native_text.rs` |
| `knowledge/cost-and-profile.md` | cost_ledger wire types + validation (seats/lineage/totals), HonestyBrake trigger; execution_profile route catalog + FailureClass authorities (`permits_advance` :448) | `cost_ledger.rs`, `execution_profile.rs`, `native_profile.rs` |
| `knowledge/runtime-support.md` | lane_overlay overrides, writer-lease epochs/sentinels, live Qwen distiller transport | `lane_overlay.rs`, `lease.rs`, `live.rs` |
| `knowledge/distill-and-l3.md` | `distill.rs` identity_hash dedupe (`ufo.dedupe.v4`), Rust-owned D3 survivor order, D2 gate-valid medians, structural blinding, `Malformed`-vs-`Semantic` split; `l3_swarm.rs` declaration-only surface (64 ceiling, canonical chain, `EvidenceOnly`); `live.rs` `ufo_dedupe_v2` schema staleness (report-class) | `distill.rs` (1553 L), `l3_swarm.rs` (591 L), `live.rs`, `native_contract.rs` :63 |
| `knowledge/local-ship.md` | `ufo local-ship` apply/verify/rollback: refusal order, verdict asymmetry + CLI exit map, cooperative apply-lock election, journal recovery tree, verifier denylist (95 basenames / 13 prefixes), external-effect table, `bounded_fs`/`fs_durability`/`atomic_write`, bounds table; defects D-A/B/C | `local_ship.rs` (2489 L), `bounded_fs.rs` (155 L), `fs_durability.rs` (277 L), `ufo-cli/src/main.rs` :1848-1860 |
| `knowledge/native-transcript-ledger-seats.md` | `native_transcript.rs` 9 ordered gates + byte-exact assignment binding + recomputed continuity; `native_ledger.rs` resilient attempt ledger (capacity-only hops, T07 effort); `native_seat_coverage.rs` proposal roster + pre-spawn dispatch attempts; contract ordinals 55/56/60 | `native_transcript.rs` (939 L), `native_ledger.rs` (350 L), `native_seat_coverage.rs` (317 L), `native_contract.rs` :124/125/129 |
| `knowledge/test-inventories.md` | Case-level census of the four big test files (340/168/85/57 `#[test]`), literal-needle pinning style, test-only seams, unix arms, named survivor mutants, cross-suite ownership, unpinned surfaces | `native_tests.rs`, `loop_driver_tests.rs`, `local_ship_tests.rs`, `distill_tests.rs`, `gate_tests.rs` |
| `lessons/round-1.md` | Round-1 method notes, drift trap, stated gaps | LOG.md round-1; commit `45b4ed3` |
| `lessons/round-1-aggregator-audit.md` | Round-1 corpus audit (aggregator L1 + independent L2): layout + technical core conformant; three counts and one attribution failed | LOG.md round-1; commit `33632b8` |
| `lessons/round-3.md` | Defer-not-die doctrine, park-epoch trap, admission-latch counting | LOG.md round-3; commit `efe19da` |
| `lessons/round-4.md` | Round-4 method: crate split along its own family boundary (two scout maps) | LOG.md round-4; commit `e0f5ca7` |
| `lessons/round-4-aggregator-audit.md` | Round-4 corpus audit: verdict CONFORMANT, 24 citations re-executed, 6 minors, carried round-1 attribution defect part-fixed | LOG.md round-4; commit `6a4a9f0` |
| `lessons/round-5.md` | Wall-handoff double-run defect, membrane-seal `write` mismatch, stub-symmetry trap | LOG.md round-5; commit `e748e44` |
| `lessons/round-5-aggregator-audit.md` | Round-5 corpus audit: 34 citations re-executed; conformant after L1 adjudication (0 majors, 5 minors, 1 tracked ledger obligation) | LOG.md round-5; commit `294cbf1` |
| `lessons/round-5-aggregator-mirror-out-of-province-membrane-seal.md` | Cross-province latent-defect mirror: `membrane-seal write` argv cannot parse against the CLI clap surface; no owning repo exists, so the routing is recorded here | LOG.md round-5; commit `294cbf1` |
| `lessons/round-6.md` | Two-writer queue rule (l0-monitor), A1 head-order falsification, Cf/Mn/Zs parity drift | LOG.md round-6; commit `eca3d14` |
| `lessons/round-7.md` | Round-7 gap: five corpus notes landed (`7a4c9a0`) but SKILL/README/LOG/lesson went un-updated; pins held because they are content pins (296-commit git pin, byte-identical file) | LOG.md round-7; commit `7a4c9a0` |

## Known gaps

- **Script layer** — 59 of the 72 top-level `scripts/*.mjs` carry no corpus
  entry, plus `charter-scribe/` (5) and `lean-cargo/` (4):
  `probe-*` / `sync-*` route-health and mirror generators, `primeagent-*`,
  `ufo-mission-{activity,lifecycle,observation}.mjs`, `ufo-state-retention.mjs`,
  `ufo-credential-screen.mjs`, `fleet-ledger-{read,rotate}.mjs`,
  `ufo-watchdog-repend.mjs`, `the-tick-config.mjs`,
  `prepare-ephemeral-l1.mjs`, and the `*.test.mjs` files. The ops watchers are
  covered only where another note touches them: `ufo-stale-watchdog.mjs` in
  `singleton-and-queue-ownership.md`, `ufo-l0-monitor.mjs` in
  `lessons/round-6.md` (two-writer rule); `the-tick-ping.mjs` +
  `ufo-ground-handler.mjs` appear only in `SKILL.md`. Counts:
  `ls $UFO_SRC/scripts/*.mjs | wc -l` → 72; `ls $UFO_SRC/scripts | wc -l` → 82
  (2026-09-28). Round-8 `scripts/cite-check.mjs --symbols --json` resolves
  1 906 of the 2 108 path-like tokens this corpus + `SKILL.md` carry (the rest
  are fragments, workspace artifacts, HOME candidates or foreign roots by
  class) with 0 errors and 48 warnings; per-class histogram is in `LOG.md` r8.
- **`crates/ufo-core-runtime` remainder** — 37 of the 93 `src/*.rs` have no
  corpus citation at all, and `gate.rs`/`gate_tests.rs` (ParetoGate internals)
  are covered only at verdict-vocabulary level by `native-judge-pipeline.md`.
  Uncited set includes `axes.rs`, `axis_checks.rs`, `build_json.rs`,
  `config.rs`, `fixture_spawn.rs`, `godspeed.rs`, `lanes.rs`, `mutation.rs`,
  `native_dispatch_topology.rs`, `native_evidence.rs`, `native_telemetry.rs`,
  `operator_guidance.rs`, `probe.rs`, `proposal.rs`, `provenance.rs`,
  `rfc3339.rs`, `round.rs`, `round_digest.rs`, `specialist.rs` and the
  `*_tests` companions. On the CLI side only `main.rs` is mapped
  (`titanium.rs`, `admission.rs` are not). Counts: `ls
  $UFO_SRC/crates/ufo-core-runtime/src/*.rs | wc -l` → 93;
  `ls $UFO_SRC/crates/ufo-cli/src/*.rs | wc -l` → 5; uncited figure from a
  basename match over `corpus/**/*.md` + `SKILL.md` (2026-09-28) — basename
  collisions make it a ±few estimate, and it undercounts where a note names the
  module without the `.rs` (e.g. `fs_durability`).
- **`ufo-sighting-lib` display depth** — internals are mapped (entry shim,
  `__idle`/`__reconcile`/`__pane-run` plumbing, 26 files / 10620 lines), but the
  layout/display-matrix engine detail is not.
- **Round-7 defects are filed, not independently reproduced** — local-ship D-A
  (`read_bounded` passes `identity=None` at `local_ship.rs:2317`), D-B
  (`st_size>8MiB` metadata-size arm at :1710-1715), D-C (`atomic_write` doc vs
  code fsync count), the journal uppercase-digest asymmetry, and the `live.rs`
  `QWEN_RESPONSE_FORMAT` (`ufo_dedupe_v2`, no `identity_hash`) vs
  `ufo.dedupe.v4` schema staleness (dormant while `LiveEnv::enabled()` is off).
  Reproduce before citing as fact; fixes belong to `origin-work/ufo-fsd-alpha`.
- **Audit holes** — no aggregator/reviewer audit exists for the round-2,
  round-3, round-6 or round-7 corpus deltas, and round 2 and round 7 landed no
  `lessons/round-<N>.md` at the time (round 7's was backfilled in round 8).
  Counts: `ls corpus/lessons/*.md | wc -l` → 10 (2026-09-28).
- **Closed by round 7** (kept here one round for traceability):
  fleet-dispatcher `queueSummary` per-field semantics → `knowledge/
  queue-summary.md`; big-test-file case inventories → `knowledge/
  test-inventories.md`; `ufo-core-runtime` remainder families `distill.rs` +
  `l3_swarm.rs`, `local_ship.rs` + `bounded_fs` + `fs_durability`,
  `native_transcript`/`native_ledger`/`native_seat_coverage` → three r7 notes.

All entries are falsifiable and cite file+symbol. Opinions marked as such.

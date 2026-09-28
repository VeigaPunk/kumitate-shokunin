# Loop driver — `LoopDriver` round machine (crates/ufo-core-runtime)

The canonical resumable UFO-FSD judge loop. Module root
`src/loop_driver.rs`; submodules are `#[path]`-loaded siblings, not `mod`
children under `lib.rs`. Paths relative to
`/home/vgpnk/Projects/origin-work/ufo-fsd-alpha`; `src/X` =
`crates/ufo-core-runtime/src/X`.

## Entry points and epoch shape

- `LoopDriver::open(root)` (`loop_driver_open.rs:138`) — fresh mission:
  config load, run/session id mint, writer-lease acquisition attempt
  (spec 14 §3 — `Err` never blocks open; the driver runs unpromoted).
- `LoopDriver::resume(root)` (`loop_driver_resume.rs:262`) — checkpoint
  restore through a ~20-check preflight (`resumable_checkpoint` :1261);
  route cursors re-validated against the canonical chain
  (`validate_route_checkpoint` `loop_driver.rs:432`).
- `run_dry_until_halt()` (`loop_driver_dry.rs:1129`) = `run_epoch_from(0,
  zeros)` — and this IS the `ufo self-iter` path (`cli/main.rs:585`).
  **The `dry` module is the production round body, not a dry run**; fixture
  spawns only. There is no live-native arm in `LoopDriver` — native rounds
  are driven by `run-omp-native-trial.mjs` + OMP, and judged by
  `native.rs::judge_handoff` afterward.
- `run_resumed_epoch_until_halt` (`loop_driver_resume.rs:1428`) →
  `run_epoch_from` (:1541): `for round in …` → boundary stop gate →
  `run_dry_iteration_vs` → break on terminal outcome.

## Round pipeline — `run_dry_iteration_vs` (`loop_driver_dry.rs:100`)

1. **Boundary gate** (`loop_driver.rs:583` `boundary_stop`): sealed-membrane
   refusal (`refuse_if_membrane_sealed`, `loop_driver_publish.rs:186`), then
   interrupt check → wall-clock budget → token budget → p50 projection. A
   stop here dispatches ZERO lanes; `BoundaryStop` carries `Interrupted` or
   `HonestyBrake(BrakeTelemetry)` (`loop_driver.rs:97`).
2. **Dispatch phase** (`ldd_dry_round_dispatch_phase` `loop_driver_dry.rs:117`):
   roster validation → baseline vector validate → `freeze_round_digests`
   (`loop_driver_digest.rs:172`, generation-keyed cache) → plan token/prompt
   caches → `dispatch_planner_seat` → `write_wwkd_plan` → `dispatch_specialists`
   (rayon pool keyed by `swarm_width`) → `persist_state(Running)`.
3. **Wave collection** (`dispatch_specialists`
   `loop_driver_dispatch.rs:1357`): per-lane attempt state machine —
   herd/domain admission (`DomainCooldowns` :1640), temporary retry,
   capacity advance/reroute, lane-health buckets.
4. **Judge phase** (`ldd_dry_round_judge_phase` `loop_driver_dry.rs:457`):
   `dispatch_critical_distiller_seat` → `Distiller::run_phase` →
   `assert_plan_before_judge` → `judge_wave` (`loop_driver_judge.rs:54`,
   `gate.decide_with_deltas` :356) → `bind_loop_candidate`
   (`loop_driver_candidate.rs:56`) → `membrane_touching_accepts`
   (`judge.rs:410`).
5. **Persist** (`ldd_dry_round_persist_phase` `:978`): stop-outcome mapping
   → round digest → `persist_state` + optional membrane seal →
   `IterationReport` (`report.rs:38`).

## Stop vocabulary — single-sourced

- `LoopOutcome` (`state.rs:41`): `Saturated, BudgetHalt, Running, Blocked,
  HonestyBrake, Interrupted, AuthorityBoundary`.
  - `HonestyBrake`: stopped on a DECLARED budget (token exhaustion,
    projected exhaustion, mission wall-clock) — recorded, never convergence
    (spec 03 §4).
  - `AuthorityBoundary`: an accepted proposal touched `membrane.paths`
    (spec 06 §4) — work lands, `membrane_accepts` recorded on the
    checkpoint, loop seals until `ufo charter sign`.
  - `Interrupted`: SIGINT/operator halt at a round boundary — resumable
    only when the checkpoint carries unresolved work AND a live
    partial-evidence plan pointer; an interrupt before round 0's dispatch
    is terminal (C4).
- `CheckpointStopReason` (`state.rs:21`) adds `RoundCap` (checkpoint-side
  spelling of the budget-halt boundary).
- `round_stop_outcome` (`state.rs:380`): `!sound → Blocked`; `admitted==0 &&
  !pending_refine → Saturated`; cumulative ≥ `tokens_per_mission` →
  `HonestyBrake`; `at_round_cap → BudgetHalt`; else `Running`. Zero
  accepted proposals on a sound round IS saturation — same rule as I8.
- `stop_evaluation_string` (`state.rs:417`) is the frozen digest spelling
  (`continue/saturated/budget_halt/honesty_brake/authority_boundary/blocked/
  interrupted`); `saturation_inconclusive` is the post-demotion spelling
  that only `native_stop_evaluation` (`native_plan_digest.rs:516`) and the
  dry digest path produce.
- `BrakeTelemetry` (`state.rs:125`, serde-tagged `kind` +
  `deny_unknown_fields`): `budget_exhaustion` (post-round cumulative),
  `budget_projection` (pre-dispatch, zero lanes), `wall_clock_budget` —
  deliberately NEVER spelled `lane_timeout` (T33: budget expiry is not a
  watcher deadline).

## Checkpoint — `LoopState` (`state.rs:237`)

`.ufo/loop-state.json` shape (via `loop_state_path`,
`loop_driver_publish.rs:22`): token, task, substrate, axis_ids, baseline,
last_round, `plan_path` + `plan_token` + `plan_digest` (resume re-binds the
recorded digest — never reseeds from possibly-tampered bytes),
`execution_profile_hash`, `protocol_hash` (currently `ufo.fsd.v4` —
`CHECKPOINT_PROTOCOL_VERSION` `loop_driver.rs:121`; every v3 checkpoint
refuses resume), `frontier_digest`, `writing_goal`, `stop_reason`,
`unresolved_work`, `lane_contexts`, `route_cursors` + `route_provenance`,
`lane_identities`, `rejected_order`, `candidate_receipts`,
`round_token_usage` (p50 projection history), `mission_cumulative_tokens`,
`mission_started_ms`, `stop_telemetry`, `membrane_accepts`. Everything
`deny_unknown_fields`; `LoopStateView` (`state.rs:331`) is the borrowed
byte-identical serializer.

## Module table

| Module | Responsibility |
|---|---|
| `loop_driver.rs` | `LoopDriver` struct + submodule tree, config/checkpoint load, `boundary_stop`, blocked-audit streak, usage bookkeeping (`:347`, `:583`) |
| `loop_driver_open.rs` | `open`/`with_*` builder chain, run/session ids, writer lease, `validate_local_roster` (`:138`, `:311`) |
| `loop_driver_dry.rs` | THE production round body: dispatch → judge → persist → digest; `run_dry_until_halt` (`:100`, `:1129`) |
| `loop_driver_dispatch.rs` | Lane-attempt state machine: herd/domain admission, temp retry, capacity advance, critical-seat dispatch (`:266`, `:1357`, `:1640`) |
| `loop_driver_candidate.rs` | Candidate binding vs frozen digests, honest baseline (`:56`, `:145`) |
| `loop_driver_resume.rs` | `persist_state`, resume preflight (~20 witnesses), `run_epoch_from` (`:136`, `:262`, `:1541`) |
| `loop_driver_judge.rs` | `judge_wave`, executable/subjective measurement, `ParetoGate` decisions, `RejectionReason` taxonomy (`:54`, `:537`) |
| `loop_driver_publish.rs` | Artifact paths, lease-guarded atomic checkpoint + membrane-seal writes, WWKD plan token/digest gate (`:88`, `:127`, `:268`) |
| `loop_driver_digest.rs` | Frozen round digests + generation-keyed cache (`:93`, `:172`) |
| `state.rs` / `report.rs` / `round.rs` | Checkpoint types / `IterationReport` / `RoundState` |

## Judgment vocabulary (fixture side)

`GateDecision` (`gate.rs:11`): `admit{improved} | reject_regression |
reject_no_improvement | reject_malformed{reason} |
reject_insufficient_evidence{unmeasured}`. `RejectionReason`
(`loop_driver_judge.rs:537`, codes at :544/:558) is the digest-side
taxonomy — one spelling, two consumers (digest + contract side via the
`pub(crate)` bridge at `loop_driver.rs:57`).

## Traps

- `run_dry_until_halt` is not a smoke path — it is what `ufo self-iter`
  calls; "dry" names the fixture substrate (no native host execution).
- `self-iter`'s `exitSuccess` bit is saturation-only; a dry loop measures
  no acceptance criteria so `missionGoal` is always `unverified`
  (`cli/main.rs:593-622`).
- `Absence-of-usage` seats contribute nothing measurable — never fabricated
  zeros (`TokenUsage` `state.rs:84`).
- The writer lease (`lease.rs`) is a mission-scoped arbiter: acquisition
  failure at `open` does not block the driver — it runs unpromoted and
  lease-guarded publishes (`publish_guarded` `loop_driver_publish.rs:127`)
  fail instead. `LeaseDurability::Unconfirmed` inside an `Ok` arm means the
  name landed but the directory fsync failed — do not treat as absent
  (`loop_driver.rs:415-423`).
- `plan_token`/`plan_digest` exist because "a leftover file containing
  'wwkd' + 'Phase 0'" is not this-round evidence (F-C5).

Sources: `src/loop_driver.rs` + `loop_driver_{open,dry,dispatch,candidate,
resume,judge,publish,digest}.rs`, `src/state.rs`, `src/report.rs`,
`src/round.rs`, `src/gate.rs`, `cli/main.rs:51-62, 529-646`.

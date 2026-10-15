# Loop driver — `LoopDriver` round machine (registry family R2)

The canonical resumable UFO-FSD judge loop and its checkpoint vocabulary.
Module root `loop_driver.rs`; submodules are `#[path]`-loaded siblings, not
`mod` children under `lib.rs`. Origin tree:
`/home/vgpnk/Projects/ufo-fsd-alpha` (HEAD `964f443e`). Paths below are
basenames under `crates/ufo-core-runtime/src/`.

**Family membership (round-32 re-census).** Live set is still **12 of 12**
against freeze `5725fa7d3` (no R2 deletions): ten `loop_driver*.rs` files +
`state.rs` + `state_tests.rs`. Measured:

```
ls -1 crates/ufo-core-runtime/src/loop_driver*.rs \
      crates/ufo-core-runtime/src/state.rs \
      crates/ufo-core-runtime/src/state_tests.rs | LC_ALL=C sort | wc -l
# → 12
```

`report.rs` / `round.rs` / `gate.rs` / CLI `main.rs` are cited as consumers
or adjacent surfaces; they are **not** R2 members (R11 / R10 / CLI remainder).

One `##` section per member follows. Each carries ≥1 own-file live anchor and
≥1 backticked symbol verbatim in that file (claims-check section-form).

## `loop_driver.rs` (1130 L) — `LoopDriver` root, protocol pin, boundary stop

`LoopDriver` struct (`loop_driver.rs:336`) owns config, lane roster, cost
bookkeeping, and the lazy `ParetoGate` cache. `CHECKPOINT_PROTOCOL_VERSION`
(`loop_driver.rs:110`) is currently the literal `ufo.fsd.v3` — every other
protocol string refuses resume. `validate_route_checkpoint`
(`loop_driver.rs:416`) re-binds route cursors against the canonical chain on
resume. `boundary_stop` (`loop_driver.rs:561`) is the pre-dispatch gate:
sealed-membrane refusal, interrupt, wall-clock budget, token budget, p50
projection; a stop here dispatches zero lanes.

Submodule tree is `#[path]`-loaded (`mod open` / `dry` / `dispatch` / `judge` /
`publish` / `resume` / `digest` / `candidate`), not declared from `lib.rs`.

## `loop_driver_open.rs` (259 L) — fresh-mission open + roster + lease

`LoopDriver::open` (`loop_driver_open.rs:69`) loads config, mints run/session
ids, and attempts the mission writer lease — `Err` never blocks open (spec 14
§3); the driver runs unpromoted. `require_writer_lease`
(`loop_driver_open.rs:233`) reuses an already-held `Ok` including
`Unconfirmed` so later publishes never re-acquire into `HeldBy` against the
process's own record. `validate_local_roster` (`loop_driver_open.rs:253`) is
the pre-dispatch lane/config consistency check.

## `loop_driver_resume.rs` (585 L) — checkpoint persist, resume, epoch runner

`persist_state` (`loop_driver_resume.rs:127`) writes the leased checkpoint.
`LoopDriver::resume` (`loop_driver_resume.rs:246`) restores through the
preflight cluster and re-validates route cursors. Production epoch bodies:
`run_resumed_epoch_until_halt` (`loop_driver_resume.rs:488`) →
`run_epoch_from` (`loop_driver_resume.rs:528`) — `for round in …` → boundary
stop → `run_dry_iteration_vs` → break on terminal outcome.

## `loop_driver_dry.rs` (946 L) — production round body (fixture substrate)

**"dry" names the fixture substrate, not a smoke path** — this is what
`ufo self-iter` drives. `run_dry_iteration_vs` (`loop_driver_dry.rs:69`) is the
per-round pipeline: `ldd_dry_round_dispatch_phase` (`loop_driver_dry.rs:79`) →
`ldd_dry_round_judge_phase` (`loop_driver_dry.rs:300`) →
`ldd_dry_round_persist_phase` (`loop_driver_dry.rs:779`). `run_dry_until_halt`
(`loop_driver_dry.rs:943`) is the epoch entry that loops until a terminal
`LoopOutcome`. There is no live-native arm inside `LoopDriver`; native rounds
are launched by JS + judged by `native.rs::judge_handoff` afterward.

## `loop_driver_dispatch.rs` (1820 L) — lane-attempt machine + domain backpressure

`dispatch_specialists` (`loop_driver_dispatch.rs:1375`) runs the per-lane
attempt state machine (herd/domain admission, temporary retry, capacity
advance/reroute, lane-health buckets). `DomainCooldowns`
(`loop_driver_dispatch.rs:1625`) is wave-scoped only — rebuilt inside
dispatch, never persisted across rounds. `stop_evaluation_string`
(`loop_driver_dispatch.rs:1793`) is the frozen digest spelling of
`LoopOutcome` (`continue` / `saturated` / `budget_halt` / `honesty_brake` /
`authority_boundary` / `blocked` / `interrupted`).

## `loop_driver_judge.rs` (538 L) — wave judgment + membrane accepts

`judge_wave` (`loop_driver_judge.rs:52`) is the fixture-side Pareto walk
(`gate.decide_with_deltas`) over the wave's proposals. After binding,
`membrane_touching_accepts` (`loop_driver_judge.rs:415`) records accepts that
touched `membrane.paths` (authority-boundary seal trigger). Digest-side
refusal taxonomy is `rejection_reason_code` (`loop_driver_judge.rs:527`) —
one spelling shared with the contract/digest consumers.

## `loop_driver_candidate.rs` (174 L) — candidate binding vs frozen digests

`bind_loop_candidate` (`loop_driver_candidate.rs:58`) binds a judged proposal
against the frozen round digests (honest baseline, no coordinate-envelope
admission). `honest_fixture_baseline` (`loop_driver_candidate.rs:145`) is the
baseline constructor the dry path uses when no prior frontier exists.

## `loop_driver_publish.rs` (284 L) — artifact paths, leased publish, membrane seal

`loop_state_path` (`loop_driver_publish.rs:19`) is the `.ufo/loop-state.json`
location. `publish_guarded` (`loop_driver_publish.rs:61`) is the sole
lease-fenced write translation for checkpoints and seals; unpromoted drivers
fail here instead of open. `write_checkpoint` (`loop_driver_publish.rs:87`) and
`refuse_if_membrane_sealed` (`loop_driver_publish.rs:113`) are the boundary
pair the pre-dispatch gate and persist phase share.

## `loop_driver_digest.rs` (181 L) — frozen round digests + generation cache

`lanes_protocol_projection` (`loop_driver_digest.rs:44`) feeds the protocol
fingerprint (an overlay moves the hash). `freeze_round_digests`
(`loop_driver_digest.rs:138`) is the generation-keyed cache entry the dispatch
phase calls once per round; a second call reuses the slot without recompute
(pinned in `loop_driver_tests.rs`).

## `loop_driver_tests.rs` (5034 L) — loop-driver pin suite

In-crate pin file for the driver family (R9's `test-inventories` may *describe*
it, but registry membership is R2). Highest-signal pins include
`unmeasured_material_axis_blocks_admission` (`loop_driver_tests.rs:4065`) —
`RejectInsufficientEvidence` is *not* gate-produced; the judge overwrites an
`Admit` carrying `unmeasured_material` — and `membrane_seal_kind_is_pinned`
(`loop_driver_tests.rs:4621`) for the seal kind literal.

## `state.rs` (380 L) — checkpoint types + stop vocabulary

Single source for stop/checkpoint wire types: `CheckpointStopReason`
(`state.rs:21`), `LoopOutcome` (`state.rs:41`) —
`Saturated` / `BudgetHalt` / `Running` / `Blocked` / `HonestyBrake` /
`Interrupted` / `AuthorityBoundary` — `BrakeTelemetry` (`state.rs:114`,
serde-tagged `kind`, never spelled `lane_timeout`), and `LoopState`
(`state.rs:226`) the owned `.ufo/loop-state.json` shape. `round_stop_outcome`
(`state.rs:357`) maps sound/admitted/budget/cap into `LoopOutcome`: zero
accepted proposals on a sound round **is** saturation.

## `state_tests.rs` (132 L) — stop-vocabulary pins

Companion pins for `round_stop_outcome` / serde shape: 
`sound_zero_accept_converges` (`state_tests.rs:4`) locks zero-accept
saturation; `budget_halt_is_not_saturation` (`state_tests.rs:12`) keeps the
round-cap halt distinct from convergence; 
`loop_outcome_serializes_snake_case` (`state_tests.rs:62`) pins the wire
spelling the digest path freezes.

## Cross-family consumers (not R2 members)

- `gate.rs` / `ParetoGate` — R10; fixture judge calls `decide_with_deltas`.
- `report.rs` `IterationReport`, `round.rs` `RoundState` — R11 remainder.
- `lease.rs` writer lease — R4; open/publish only.
- `ufo-cli/src/main.rs` `self-iter` — CLI remainder; drives
  `run_dry_until_halt`, not a member of this family.

## Traps (family-level)

- `run_dry_until_halt` is production for fixture substrate, not a dry-run API.
- `self-iter` `exitSuccess` is saturation-only; dry loops leave `missionGoal`
  `unverified` because no acceptance criteria are measured on that path.
- Absence-of-usage seats contribute nothing measurable — never fabricate
  `TokenUsage` zeros.
- Writer lease: open failure runs unpromoted; lease-guarded publish fails
  instead. `LeaseDurability::Unconfirmed` inside `Ok` means the name landed
  but directory fsync failed — not absent.
- `plan_token` / `plan_digest` exist because a leftover file containing
  `"wwkd"` is not this-round evidence.
- Protocol pin is `ufo.fsd.v3` at `loop_driver.rs:110` on HEAD `964f443e`
  (earlier corpus prose that said `ufo.fsd.v4` / `:121` is stale).

## Re-census record (round 32, member R2MemberRecensus)

- **Live members (12):** `loop_driver.rs`, `loop_driver_candidate.rs`,
  `loop_driver_digest.rs`, `loop_driver_dispatch.rs`, `loop_driver_dry.rs`,
  `loop_driver_judge.rs`, `loop_driver_open.rs`, `loop_driver_publish.rs`,
  `loop_driver_resume.rs`, `loop_driver_tests.rs`, `state.rs`,
  `state_tests.rs`.
- **Sections added:** 12 member `## \`…\.rs\`` sections (note was topic-form;
  `ROW_NO_SECTIONS` prior).
- **Sections removed:** none — no heading named a deleted origin file; the
  prior topic headings (`Entry points`, `Round pipeline`, `Stop vocabulary`,
  `Checkpoint`, `Module table`, `Judgment vocabulary`, `Traps`) were
  non-member topic heads and were folded into the member sections / traps
  above rather than left as phantom member claims.
- **Deleted since `5725fa7d3`:** empty for this family
  (`comm -23` freeze vs live on the R2 glob → empty).
- **Declared count the SCORECARD row must carry:** **12** (parent-owned cell;
  prefer `12 members:` with the explicit basename list above so
  `MEMBER_COUNT_DRIFT` binds; the live `loop_driver*.rs` glob still expands
  to 10 + 2 state files).

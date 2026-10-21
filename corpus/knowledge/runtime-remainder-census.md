# Runtime remainder census — registry family R11 (47 of 47 members named)

**Scope.** Registry family `R11` of `SCORECARD.md`: every
`crates/ufo-core-runtime/src/*.rs` file that rows `R1`–`R10` do **not** name
(42), plus the whole `crates/ufo-cli/src/*.rs` surface (5) — **47 members /
24,874 L**. Read against the origin tree at HEAD `93798be12`, which carried 37
dirty paths at this reading (36 at the round's opening read — another lane was
writing there while this round ran); none of the 47 was modified that day, so
every anchor below is pinned to a revision the origin was not editing. This note
is the family's *whole* membership — the last uncovered one — so the registry's
`C1_total` now has no `no` cell.

**Why this family exists at all.** It is a remainder, so its membership is an
arithmetic claim rather than a natural kind: 93 files match
`crates/ufo-core-runtime/src/*.rs`, 51 of them are named by `R1`–`R10`
(8 + 12 + 5 + 6 + 4 + 4 + 5 + 4 + 1 + 2), 93 − 51 = **42**; the CLI crate adds
`admission.rs`, `main.rs`, `main_tests.rs`, `titanium.rs`, `titanium_tests.rs`.
An independent reconstruction of both halves was diffed against this list with
`comm -3` (empty) and the union was checked pairwise disjoint.

**`R1`'s 8 were unenumerated until this round.** Its cell read `8 \`native*.rs\`
core modules`, a glob that matches 26 files in the crate, so the remainder could
not be derived from the registry alone. It is nevertheless *forced* by the
arithmetic: 93 − 43 (`R2`–`R10`, glob-expanded) − 42 (`R11` runtime) = 8, and
independently the set of `native*.rs` mentioned ≥2× in
`corpus/knowledge/native-judge-pipeline.md` is exactly the same 8 (both sorted
lists hash identically). The cell now names them, so the subtraction above is
reproducible from the registry without reading this note's prose — a registry
*text* change that moves no scored term (`R1` stays one `yes` cell; `C1` 18 → 19
comes only from `R11`).

## Size and class census

| class | files | L | what it is |
|---|---|---|---|
| runtime modules | 28 | 14,081 | the crate's non-test surface: axes/axis-checks, config, lanes, rules, proposal, provenance, process group, round/round-digest, godspeed, mutation, rfc3339, report, probe, specialist, operator guidance, build/json, lib, the `native_*` remainder |
| test files | 15 | 7,912 | `*_tests.rs` suites plus the CLI's `main_tests.rs` / `titanium_tests.rs` |
| fixture / harness | 4 | 2,881 | `bounded_fixture.rs`, `fixture_spawn.rs`, `test_env.rs`, `replay_falsification_probes.rs`, `profile_shape_refusal_tests.rs` |
| **total** | **47** | **24,874** | `wc -l` over the member list |

Class boundaries are this note's reading, not a registry term: `bounded_fixture*`
and `fixture_spawn` are counted as fixtures rather than tests because they build
and spawn a sandbox rather than pin behavior, and `profile_shape_refusal_tests.rs`
is counted as a fixture because it is the refusal *probe*, not a suite over one
module. The partition is exhaustive over the 47 either way.

## How each member is named (the gate's contract)

One `## ` section per member, in the shape `scripts/claims-check.mjs` re-derives
(contract `kumitate-claims-v1`, documented in
`corpus/knowledge/member-claims-gate.md`):

- the heading's first backticked token is the member's **full path**, so the
  resolver cannot mistake it for a same-basename file elsewhere in the tree;
- the section carries at least one **own-file anchor** (`<path>:<a>-<b>`) whose
  endpoints are non-blank lines of that member — an anchor that drifts out of
  range becomes `SECTION_DEAD_ANCHOR`, an error, not a warning;
- the section carries at least one **verbatim symbol** — a backticked identifier
  that occurs in that member's own bytes (`SECTION_NO_SYMBOL` otherwise).

The three properties are what the registry's `yes` cell means mechanically. They
are shape checks: they can show that a member was opened and quoted, never that
the sentence around the quote is true. The prose in each section is the part no
gate reads.

## Members

## `crates/ufo-core-runtime/src/axes.rs` (647 L) — immutable axis declarations for the canonical UFO-FSD Pareto gate

The module freezes the axis vocabulary: `AxisDirection` fixes which way a score moves, `AxisMeasurement` is the hand-enforced closed grammar (its manual `Deserialize` exists because `deny_unknown_fields` is inert on internally-tagged enums, so junk fields are a typed parse refusal instead of a silent variant match), and `AxisCheck` carries the bounded `sh -c` executable check.

`AxisSet` owns `AxisSetIdentity` and the content hash `axis_content_hash`; `AxisSet::validate` refuses undeclared measurements, empty run text, and out-of-range tolerances, while `validate_native_measurement` refuses executable axes on the native handoff path (crates/ufo-core-runtime/src/axes.rs:94-214).

`apply_subjective_argument_protocol` is the module's one public free function: a claimed improvement on a `Subjective`-kind axis survives only when the merged arguments carry a two-sided entry for it, else the axis is clamped to the baseline score and flagged as `one_sided_subjective_claim` provenance.

Probe: `apply_subjective_argument_protocol` (crates/ufo-core-runtime/src/axes.rs:611-617) — the `pub fn` declaration whose body starts by building the `two_sided` BTreeSet from the argument list.

## `crates/ufo-core-runtime/src/axes_tests.rs` (402 L) — unit tests binding the axis grammar and the refusal echoes

A `#[path]`-included host for `axes.rs` opened by a plain `use super::*;` — no module wrapper, so every test drives the module's own items directly.

Grammar and identity arms: `default_has_four_axes`, `validate_refuses_padded_ids_and_empty_observables`, `validate_refuses_colon_and_control_character_ids`, and `content_hash_binds_the_measurement_declaration` (the hash binds the declaration, not just the id).

The refusal-shape pins are `unmeasurable_axis_error_is_byte_identical_across_validators` (one shared message across both validators), `refusal_echoes_of_untrusted_ids_are_echo_bounded` (a 600-char id must not become a payload), and `axis_measurement_refuses_unknown_fields_and_unknown_variants` (crates/ufo-core-runtime/src/axes_tests.rs:244-267).

Probe: `unmeasurable_axis_error_is_byte_identical_across_validators` (crates/ufo-core-runtime/src/axes_tests.rs:244-246) — the test head that clears `axis.measurement` to force the unmeasurable refusal.

## `crates/ufo-core-runtime/src/axis_checks.rs` (750 L) — executable-axis measurement over bounded scratch copies, degrading to UNKNOWN

Executable axes are measured, never narrated: `prepare_baseline` snapshots the work root once per judged wave into a `BaselineScratch`, `measure_baseline` runs each executable axis once against that snapshot, and `measure_candidate` folds the candidate tree into a `CandidateMeasurement` of direction-aware deltas, per-axis `AxisMeasurementRecord`s, and UNKNOWN material axes.

Budgets are typed constants: `SCRATCH_COPY_BUDGET_BYTES` caps one scratch tree at 256 MiB and `copy_tree_bounded` decrements it per file, stopping with a typed error the moment it would go negative (crates/ufo-core-runtime/src/axis_checks.rs:377-450).

Every failure mode — budget, write escape, spawn failure, timeout, oversized output, non-finite metric — degrades through `extract_metric` to an UNKNOWN measurement with a detail string, never a fabricated number; on a `material` axis UNKNOWN blocks admission as `RejectInsufficientEvidence`.

Probe: `SCRATCH_COPY_BUDGET_BYTES` (crates/ufo-core-runtime/src/axis_checks.rs:56) — the total-bytes-copied ceiling that turns a pathological tree into an UNKNOWN measurement instead of a panic.

## `crates/ufo-core-runtime/src/axis_checks_tests.rs` (561 L) — unix-gated pins for the scratch, budget, and UNKNOWN arms

A `#[path]`-included host for `axis_checks.rs` using `use super::*;` and `tempfile::tempdir`; helpers `exec_axis_set_with_material`, `exec_axis_set`, and `sum_axis_set` mint tiny axis sets and `metric_write` builds a base64 `CandidateWrite`.

Measurement arms: `candidates_materialize_from_immutable_pre_dispatch_source`, `prepared_baseline_ignores_post_snapshot_live_tree_mutation`, `deadband_at_tolerance_records_zero_delta` (`|raw_delta| <= tolerance` counts as no movement), `scratch_copy_budget_exceeded_is_reported`, and `unprepared_baseline_fans_out_unknown_to_every_executable_axis` (crates/ufo-core-runtime/src/axis_checks_tests.rs:174-392).

Refusal arms: `check_past_deadline_is_refused_as_timeout`, `oversized_check_output_is_unknown`, `exit_by_signal_produces_unknown_exit_code_metric`, and `apply_candidate_writes_rejects_parent_segment_paths`.

Probe: `deadband_at_tolerance_records_zero_delta` (crates/ufo-core-runtime/src/axis_checks_tests.rs:174-175) — the test head whose body first materializes a `tempdir` scratch.

## `crates/ufo-core-runtime/src/bounded_fixture.rs` (295 L) — wall-clock bound and deadline-bounded stdin for stdin-consuming fixture children

`run_fixture_with_stdin` spawns the command, writes the caller's stdin bytes, waits up to `timeout_secs`, and on timeout kills the child process group before the child, returning the child pid plus captured `Output`.

Failures are one typed enum — `BoundedFixtureError` with Spawn, Timeout, IncompletePipe, OutputTooLarge, and Io arms — and the loop's bound comes from `fixture_timeout_secs` reading `UFO_LOOP_FIXTURE_TIMEOUT_SECS`, falling back to `DEFAULT_LOOP_FIXTURE_TIMEOUT_SECS` (crates/ufo-core-runtime/src/bounded_fixture.rs:24-107).

The stdin side is a poll loop on a non-blocking fd inside `write_stdin_bounded`, mirroring `join_bounded`'s grace contract: the writer always terminates, so a hung fixture tree cannot pin the bound.

Probe: `run_fixture_with_stdin` (crates/ufo-core-runtime/src/bounded_fixture.rs:107-111) — the `pub fn` head through its `Result<(u32, Output), BoundedFixtureError>` return type.

## `crates/ufo-core-runtime/src/bounded_fixture_tests.rs` (321 L) — pins for the process-group kill, the retained timeout pid, and the output cap

A `#[cfg(all(test, unix))]`-included host for `bounded_fixture.rs` that imports `group_kill_args` and `UnixStream` directly so it can exercise the kill argv and the pipe paths.

`the_group_kill_terminates_options_before_the_negative_pid` asserts the exact `["-KILL", "--", "-12345"]` argv, `fixture_bound_kills_a_child_that_outlives_the_bound` asserts the `Timeout` error retains the real child pid (the R18 lane-timeout provenance), and `fixture_output_exceeding_hard_cap_is_refused` pins the byte cap (crates/ufo-core-runtime/src/bounded_fixture_tests.rs:6-187).

The writer/pipe arms are pinned separately: `escaped_descendant_holding_pipe_cannot_stretch_or_authorize_output`, `stdin_writer_flag_flips_within_bound_plus_grace_against_a_holder`, and `big_stdin_is_delivered_byte_identical_through_the_bounded_writer`.

Probe: `fixture_bound_kills_a_child_that_outlives_the_bound` (crates/ufo-core-runtime/src/bounded_fixture_tests.rs:12-16) — the test head whose comment records the pid-provenance contract before the `exec`-based marker spawn.

## `crates/ufo-core-runtime/src/build_json.rs` (1213 L) — std-only JSON parser and seat-mirror reader shared with the build script

Extracted from `build.rs`, so the build script consumes it by `#[path]` and the test host includes the same file: `parse_json` builds the `Json` tree within `MAX_JSON_DEPTH`, so a hostile or drifted mirror is a typed error rather than a stack overflow in the build.

The mirror half recomputes and validates the sealed table: `mirror_body_digest` re-hashes the mirror body with the std-only `sha256_hex_std`, `parse_mirror_source_path` mirrors the collector's `$HOME`-relative grammar byte for byte, and `validate_routing_mirror` pins the `SEAT_ROUTING_SCHEMA` envelope and resolver generation (crates/ufo-core-runtime/src/build_json.rs:78-305).

Chain consumption is `parse_route` (`provider/model` plus whitelisted `:effort` suffix), `reject_gemini`, `validate_chain` (a repeated or wrapping `requested` selector refuses), and `extract_role_chains` — the one reader the compile gate and the judge's loader share over `ROLE_TAXONOMY`.

Probe: `mirror_body_digest` (crates/ufo-core-runtime/src/build_json.rs:350-352) — the digest-recompute head and the `.as_object()` call it makes on the mirror body.

## `crates/ufo-core-runtime/src/config.rs` (471 L) — canonical loop configuration and its bounded optional blocks

`OrchestrationConfig` is the loop's one canonical config type; `SUPPORTED_SUBSTRATES` names the seven admitted substrates, `SELF_ITER_ROUND_BUDGET_DEFAULT` is 6 rounds (distinct from the portable fixture budget), and `validate` enforces the bounds including `MAX_ROUNDS_CEILING` (crates/ufo-core-runtime/src/config.rs:314-380).

Each optional block is a `deny_unknown_fields` struct with its own `validate`: `RecoveryConfig` (retry plus account-level backpressure, with a herd floor), `BudgetsConfig` (non-negative counters where 0 = unlimited, `action` pinned to `honesty_brake`), `MembraneConfig` (non-empty paths, `action` pinned to `authority_boundary`), and `RoundsConfig` for the per-round digest bound.

`validate` also refuses a fixture-declared evidence axis, degenerate lane-overlay dirs, and interpolates every config-sourced string through the crate-wide echo ceiling.

Probe: `OrchestrationConfig` (crates/ufo-core-runtime/src/config.rs:314-318) — the struct head showing `max_rounds` and its sibling declared fields.

## `crates/ufo-core-runtime/src/config_tests.rs` (724 L) — validation pins for the config blocks, the declared bounds, and the echo ceiling

A `#[path]`-included host for `config.rs`; the boundary-acceptance test is `validate_accepts_declared_ceiling_boundaries`, where the declared ceilings are inclusive — `max_rounds` at 10000 and `rounds.digestMaxBytes` at both declared bounds validate while only their neighbours refuse.

Block-specific pins: `budgets_block_requires_phase0_probe_tokens` (A-03: the field is parsed, required when the block is present, and digest-bound, so a `#[serde(default)]` would re-shape the surface), `membrane_validate_refuses_present_but_empty_paths`, `recovery_validate_refuses_each_zero_window`, and `validate_refuses_degenerate_bounds` (crates/ufo-core-runtime/src/config_tests.rs:500-503).

`validate_refusals_echo_bounded_config_strings` is the crate-wide echo pin: every interpolated config string (substrate, budget action, membrane action and reason, evidence axis id) truncates visibly through `echo_bounded` instead of becoming a megabyte refusal.

Probe: `validate_accepts_declared_ceiling_boundaries` (crates/ufo-core-runtime/src/config_tests.rs:709-712) — the test head building an `OrchestrationConfig::default()` with raised bounds.

## `crates/ufo-core-runtime/src/fixture_spawn.rs` (820 L) — typed fixture wire envelopes and the bounded attempt lifecycle for the loop driver

Pure code motion out of `loop_driver_dispatch.rs`: the typed wire envelopes are `LocalReroute`, `FixtureRouteReceipt`, and `FixtureFailure`, and one attempt runs through `spawn_specialist_fixture_attempt`, `ldj_fixture_request_stdin_bytes` and `ldj_spawn_reap_fixture`.

Identity is grouped so same-typed neighbours cannot transpose: `AttemptContext` carries the five identity values and `FixtureSpawn` freezes one lane's spawn inputs; `FixtureAttempt` is the decoded outcome and `LaneDispatchFailure` types the per-lane failures, with `NO_PID_CAPTURED` reserved for attempts that recorded no real process (crates/ufo-core-runtime/src/fixture_spawn.rs:95-140).

The decode half is `ldj_fixture_attempt_from_stdout` with `ldj_fixture_field` per optional field, gated by the one identity authority `validate_fixture_identity` and `fixture_identity_matches`; `sanitize_fixture_environment` scrubs credentials and loader hooks before spawn, and `python3_bin` over `python3_bin_with` resolves the interpreter fail-closed.

Probe: `LaneDispatchFailure` (crates/ufo-core-runtime/src/fixture_spawn.rs:142-145) — the enum head entering its `LaneTimeout` variant, which carries `attempt`, `timeout_secs`, and the retained `pid`.

## `crates/ufo-core-runtime/src/godspeed.rs` (558 L) — trusted-root Godspeed directive loading with bounded reads and a sums manifest

`GodspeedDirective` carries the loaded directive text as an `Arc<str>`; `EVIDENCE_MARKER` is the terminal `| godspeed` marker and `MAX_DIRECTIVE_BYTES` caps one directive file at 1 MiB, so an adversarial `UFO_ROOT` tree cannot force an unbounded read.

`load_from_root` reads the three directive candidates under a stat-keyed fingerprint, and `verify_sums_manifest` fails closed on a present-but-unreadable, oversized, malformed, duplicate, or entry-less `SHA256SUMS` (bounded by `MAX_SUMS_BYTES`); refusals are typed as `GodspeedTrustedLoadError`, whose `Io` arm maps onto `NativeHandoffError::Io` (crates/ufo-core-runtime/src/godspeed.rs:295-378).

`TRUSTED_GODSPEED_CACHE` memoizes (root, fingerprint) to directive, with ctime load-bearing so a rewrite that preserves mtime still reloads; the separate `LOAD_CACHE` keys on the resolved root so a root path alone never crosses the trust boundary.

Probe: `verify_sums_manifest` (crates/ufo-core-runtime/src/godspeed.rs:168-175) — the manifest verification head through its parent-absence `Ok` arm.

## `crates/ufo-core-runtime/src/godspeed_tests.rs` (329 L) — refusal pins for directive size, encoding, and the sums manifest

A `#[path]`-included host for `godspeed.rs` that routes environment mutation through `crate::test_env::EnvGuard`; `seed_directive` plants a valid `godspeed-core/directive.md` so a neighbouring sums manifest is the only failure source.

Size and encoding arms: `oversized_directive_is_refused` pins the 1 MiB ceiling, and `directive_not_utf8_is_refused`, `whitespace_only_directive_is_refused`, `sums_manifest_not_utf8_is_refused`, and `sums_manifest_oversized_is_refused` pin the drift-evidence refusals.

Manifest arms: `sums_manifest_wrong_digest_is_refused`, `sums_manifest_duplicate_directive_entry_is_refused`, `sums_manifest_directory_is_refused` (a planted directory is drift evidence, not a missing check), and `sums_manifest_symlink_to_regular_file_still_verifies`; resolution itself is pinned by `trusted_empty_root_is_typed_missing_root` and `non_regular_candidate_keeps_root_and_refuses` (crates/ufo-core-runtime/src/godspeed_tests.rs:57-309).

Probe: `sums_manifest_duplicate_directive_entry_is_refused` (crates/ufo-core-runtime/src/godspeed_tests.rs:156-160) — the test head formatting the duplicate directive-manifest entry it will plant.

## `crates/ufo-core-runtime/src/lanes.rs` (155 L) — local specialist-lane routing with an allowlist-gated dry dispatch

`LaneRouter` borrows the lane roster, and `dispatch_dry` builds a `LaneDispatch` only after `local_route_admitted` lets `RulesAudit::require_local_route` admit the route — construction is the invariant, so no dry flag rides the struct.

`ContinuityRequest` carries one same-identity dispatch with the `provider_resolved_fallback` flag, which is never derived from a logical-lane advance; `LaneContinuityDispatch` pairs the dispatch with its typed continuity record and the same flag, and `LaneAdvance` is the outcome where Unavailable never claims a reroute (crates/ufo-core-runtime/src/lanes.rs:15-71).

Probe: `LaneContinuityDispatch` (crates/ufo-core-runtime/src/lanes.rs:36-40) — the struct declaration closing on line 40, naming `dispatch`, `continuity`, and `provider_resolved_fallback`.

## `crates/ufo-core-runtime/src/lanes_tests.rs` (202 L) — dry-dispatch and continuity-advance behaviour pins

A `#[path]`-included host for `lanes.rs`; the `lane(role, route)` helper mints a `SpecialistLane` and `identity()` a static `ContinuityIdentity`.

Dispatch arms: `dispatch_dry_routes_matching_local_lane`, `dispatch_dry_unknown_role_returns_none`, `dispatch_dry_refuses_unimplemented_route`, and `admits_local_dry_matches_dispatch_dry_admission`, which pins the allowlist gate against the dispatch path.

Advance arms: `capacity_advance_keeps_same_identity_and_separate_provider_flag`, `continuity_record_projection_is_consistent`, `authentication_refuses_without_reroute_record`, and `unimplemented_local_route_does_not_claim_capacity_reroute` (crates/ufo-core-runtime/src/lanes_tests.rs:29-132).

Probe: `capacity_advance_keeps_same_identity_and_separate_provider_flag` (crates/ufo-core-runtime/src/lanes_tests.rs:73-76) — the test head resolving the profile's `role_chain` for `AgentRole::Executor`.

## `crates/ufo-core-runtime/src/lib.rs` (1395 L) — crate root: the module tree plus the contract-hash-bound wire types

Declares the module tree and the public re-exports (`Axis`, `AxisCheck`, `AxisSet`, `ScoreVector`, `SpecialistLane`), and `seat_mirror_status` binds the binary's compiled seat table to the contract root's live bundled mirror by the generator's sealed body digest.

The PC-C/P3/A-07/P5 wire types live here because `native.rs` is a contract-hashed file pinned under the 256 KiB ceiling: `NativeEffectiveLaunch`, `NativeSeatContribution`, `RoundValidity`, `MissionGoal`, `NativeHandoffVerdict`, and `AcceptanceCriterion`, alongside the shape validators `validate_native_budgets` and `validate_native_recovery` (crates/ufo-core-runtime/src/lib.rs:434-535).

`validate_closed_keys` is the single authority for the closed key set plus optional `note` rule applied by every config-shape validator in the file, `validate_native_membrane` shape-checks the membrane block, and `expected_omp_route_yaml` is the Rust dual of `renderOmpProjection`.

Probe: `expected_omp_route_yaml` (crates/ufo-core-runtime/src/lib.rs:992-996) — the renderer head, entering the `String` member of the tuple it returns.

## `crates/ufo-core-runtime/src/mutation.rs` (307 L) — paper-parity mutation battery feeding the phase-0 report

`MutationBattery` holds only executed rows (`MutationResult`, keyed by `MutationId`) — the earlier smoke surface's invented `killed: true` row is refused here as the paper's M10 fabricated-kill-rate class.

`ufo_flat` scores every axis of the declared fixture `AxisSet` so a drifted set cannot leave a row scoring a memory of the old one, `raw_max_scan` is the raw dominance scan over baseline keys (undeclared candidate keys ignored, missing keys skip the axis), and `mutant_decide` is the deliberately damaged admission rule where confidence must not enter the shipped gate (crates/ufo-core-runtime/src/mutation.rs:117-190).

`execute_mutant` runs each `Mutant` variant against the shipped `ParetoGate` decision, so every row is an executed mutant rather than a transcribed paper cell.

Probe: `raw_max_scan` (crates/ufo-core-runtime/src/mutation.rs:117-120) — the scan head and the `regressed` accumulator its body opens.

## `crates/ufo-core-runtime/src/native_agents.rs` (630 L) — the OMP-native agent walk: seat/identity validation plus evidence fan-out and merge

`validate_agents` picks the fan-out width through `agent_evidence_worth_parallel_agents` (at least two agents and a seat-0 transcript of 64 KiB or more) and dispatches both arms to `validate_agents_body` (:45-52), whose route authority is `native_route::contract_role_table(canonical_root)`, so the compiled role table never enters a verdict. The serial phase helpers are `nath_register_handoff_agents_phase_one`, `nath_validate_and_merge_prepared_evidence`, `nath_require_roster_seats_after_dispatch` and `nath_validate_main_orchestrator_binding`; the parallel ones are `natc_register_agent_phase_one` and `natc_match_agent_transcript_intervals`. Each worker returns one `AgentEvidenceBundle` holding the seat `key`, `started`/`ended`, an optional `last_error` and its `ValidatedEvidence`; `merge_agent_evidence_bundle` folds bundles in agent order into `transcript_events` and `artifact_bytes`. `validate_child` pins depth, `parent_id` and interval containment, and `parent_qualified_agent_id_matches` checks a parent-qualified id without building the composite string.

Probe: `AgentEvidenceBundle` (`crates/ufo-core-runtime/src/native_agents.rs:524-530`) — the per-agent bundle struct (seat key, interval, last transcript error, evidence) the rayon workers hand back for ordered merging.

## `crates/ufo-core-runtime/src/native_continuity.rs` (363 L) — continuity-chain walk plus model, assignment and observed-model validation for native seats

`continuity_identity` (:22-28) projects a `NativeContinuityIdentity` whose `lane_id` is the seat's role name, the per-instance logical lane staying in the attempt ledger. Bad fallback edges are classified by `chain_index` (:33-34), `advance_is_wrapped` and `fallback_error` — "wrapped" when the edge leaves the chain, moves backward, or starts behind the current position, otherwise "reordered" — and `natc_validate_continuity_fallback_chain` requires attempt numbering 1..N, `from` equal to the current position, and `attempted_route` equal to the final one. `validate_models` refuses Gemini in `requested_model`/`resolved_model`/`attempted_route` by an allocation-free byte-window scan (admitting only the `google-antigravity/` exception), refuses a fallback on a pinned route, then calls `validate_claimed_continuity`. `validate_assignment` byte-compares the file at `assignment_path` with `assignment`, re-checks `assignment_hash`, and requires the canonical Godspeed directive prefix plus a counted `GODSPEED_EVIDENCE_MARKER`; `validate_observed_model` applies either the exact or the `family_matches_route` compare.

Probe: `continuity_identity` (`crates/ufo-core-runtime/src/native_continuity.rs:22-28`) — the identity projection that binds the wire field `lane_id` to the seat's role name.

## `crates/ufo-core-runtime/src/native_digests.rs` (144 L) — receipt digest helpers and the JSON judge entry for OMP-native handoffs

`judge_handoff_json` (:27-38) enforces the `MAX_EVIDENCE_FILE_BYTES` cap, deserializes a `NativeRoundHandoff` under deny-unknown-fields, and delegates to `judge_handoff` with the caller-supplied `TrustedContext` instead of trusting the handoff bytes. `NativeReceiptDigestRequest` carries the wire shape `axes`/`baseline`/`proposals`/`survivor_seats`; `survivor_proposal_bodies` resolves those seats to `Proposal` bodies, and `native_receipt_digests_typed` renders the contract-stable `NativeReceiptDigests` triple `baseline_digest`, `axes_digest`, `proposal_set_digest` via `sha256_json` and `hash_survivor_set`. Two public entries share that core: `native_receipt_digests_json` for raw bytes and `native_receipt_digests_value` for a caller that already parsed the DOM, which keeps the 16 MiB byte ceiling at the caller.

Probe: `NativeReceiptDigests` (`crates/ufo-core-runtime/src/native_digests.rs:51-56`) — the serialized digest triple whose field names are the contract surface.

## `crates/ufo-core-runtime/src/native_evidence.rs` (466 L) — bounded evidence intake, raw-to-derived provenance types, and the F18 originals check

`NativeRedactionMap` (:31-39) names what the collector's normalization changed while deriving a transcript from the protected raw original: `uniquified_task_ids`, `uniquified_count`, `truncated_lines` and `truncated_fields`. `NativeEvidenceOriginals` binds `canonicalizer_version` (which must equal the judge's `TRANSCRIPT_CANONICALIZER_VERSION`) to both digests, and `validate_originals` refuses repeated fields and the forged case of byte-identical raw/derived digests carrying redactions. `approve_beneath_root` (:111-129) is the shared tail of the beneath-root check for a caller that canonicalized a joined path itself; it records the `(st_dev, st_ino)` identity that `read_bounded_core` then requires of the open descriptor, so a path swapped between approval and open fails closed. `read_file_bounded` classifies before it opens, because an open-first `O_RDONLY` on a writer-less FIFO would hang instead of refusing.

Probe: `NativeRedactionMap` (`crates/ufo-core-runtime/src/native_evidence.rs:31-39`) — the redaction-map struct whose flags and lists make the raw-to-derived relationship auditable.

## `crates/ufo-core-runtime/src/native_route.rs` (524 L) — the route grammar plus canonical role routing and the contract-root seat-routing mirror loader

`ParsedRoute` and `parse_route_fields` split `provider/model` and the shared `:effort` suffix (`EFFORT_SUFFIXES`), with `parse_route_resolved` avoiding the extra `model`/`requested` strings only conformance surface needs; `route_requested`, `route_effort_suffix`, `route_model`, `family_matches_route` and `family_matches_parsed` are the other grammar consumers. `CanonicalRoleRoute` (:204-219) is the compiled per-role record — `requested`, `resolved`, `effort`, the opaque `family` and the `chain` with its precomputed `requested_chain` — and `role_route` (:221-238) builds it from the `LazyLock`'d OMP profile, rejecting an empty or repeating chain. `cached_role_route` memoizes per judge call, `VALIDATE_ALL_NATIVE_ROLE_ROUTES` checks every role once, and `contract_role_table` loads the judged root's bundled mirror at `SEAT_ROUTING_MIRROR_REL` so expected routes resolve from the same bytes the collector binds. `contract_seat_mirror_status` exposes compiled-versus-workspace `SeatMirrorStatus` drift for `ufo status`.

Probe: `CanonicalRoleRoute` (`crates/ufo-core-runtime/src/native_route.rs:204-219`) — the canonical per-role route record, including the precomputed `requested_chain` the continuity checks scan.

## `crates/ufo-core-runtime/src/operator_guidance.rs` (49 L) — the three operator-guidance theme identifiers, exposed as an ordered loop contract

`OPERATOR_GUIDANCE_THEMES` (:7-11) is the durable contract: the ordered, unique triple `phase0_lkg_gate`, `same_essence_substrate_shape` and `reroute_not_respawn`, declared deliberately stable across every substrate because the original ignored prompt file is unavailable. `operator_guidance_themes` (:14-17) is the allocation-free accessor returning `&'static [&'static str; 3]`, and it is the only reader production code needs. The in-file tests pin the exact ordered-unique triple and, through `canonical_run_logic_names_every_theme`, assert that `skills/ufo/references/run-logic.md` names every theme in backticks, so the contract cannot drift away from the canonical run logic.

Probe: `OPERATOR_GUIDANCE_THEMES` (`crates/ufo-core-runtime/src/operator_guidance.rs:7-11`) — the ordered three-theme array that binds the phase-0 gate, substrate parity and the reroute loop.

## `crates/ufo-core-runtime/src/probe.rs` (63 L) — the bounded interpreter-probe timeout knob and its fail-closed default

`DEFAULT_PROBE_TIMEOUT_SECS` (:8) is the literal 8-second default, and `PROBE_TIMEOUT_ENV` is the single authority for the `UFO_PROBE_TIMEOUT_SECS` spelling. `probe_timeout_secs` (:15-17) reads the override through `test_env::env_secs` and keeps the default whenever the value does not parse as a positive second count. The in-file tests pin the default arm on the literal (not on the named constant), pin a positive override, and pin that non-positive, unparsable and u64-overflowing overrides all fall back to 8 rather than panicking or handing a zero bound to the bounded runner.

Probe: `probe_timeout_secs` (`crates/ufo-core-runtime/src/probe.rs:15-17`) — the accessor whose `env_secs` fallthrough to the literal default is the only guard on its value.

## `crates/ufo-core-runtime/src/process_group.rs` (676 L) — process-group attach/kill, the EAGAIN spawn retry and the bounded pipe reader for local child execution

`MAX_BOUNDED_CHILD_OUTPUT_BYTES` (:21-22) caps either stream at 4 MiB, and `retry_on_eagain`/`spawn_with_eagain_retry` retry only transient `WouldBlock` fork pressure (four attempts, linear backoff) while surfacing non-transient errors at once. `bounded_pipe_reader` returns a `BoundedPipeReader` whose `join_bounded` waits the grace with a predicate loop and reports `BoundedPipeRead { bytes, complete }`, where `complete` is false for cap truncation, read error or an escaped writer — consumers such as `bounded_fixture`, `live` and `axis_checks` must never parse those bytes. `BoundedRun` (:286-308) is the shared outcome — `Exited`, `Timeout`, `IncompletePipe`, `OutputTooLarge`, `Io` — produced by `run_bounded_child`/`run_bounded_child_with`, with `incomplete_streams` and `oversized_streams` naming the flagged stream(s). Teardown is `kill_group_with_deadline` (group kill, then a `pkill -P` sweep only while unreaped) over `group_kill_args` and `attach_process_group`, every wait deadline-bounded.

Probe: `BoundedRun` (`crates/ufo-core-runtime/src/process_group.rs:286-308`) — the five-variant outcome enum, including the two flag-carrying arms consumers turn into evidence text.

## `crates/ufo-core-runtime/src/process_group_tests.rs` (672 L) — pins for the bounded reader, stream-naming truth table and teardown kill policy

`cap_truncated_stream_is_not_a_completed_read` (:8-12) is the core completeness pin: `bounded_pipe_reader` over a `Cursor` must report `complete=false` at cap truncation (including the exactly-`max + 1` case and the saturating `u64::MAX` bound) and `complete=true` only at a real inner EOF. `join_bounded_waits_the_full_grace_without_eof`, `reader_exits_at_its_deadline_under_perpetual_wouldblock` and `reader_keeps_polling_past_wouldblock_until_eof` pin the reader's deadline and poll behaviour, while `stderr_only_flood_is_flagged_as_stderr_oversized` proves a real child flood lands in the `OutputTooLarge` arm. The stream-naming truth table (:140-146) pins every `incomplete_streams`/`oversized_streams` rendering. Teardown is pinned through the `TeardownLog` recorder: the exited path keeps the group kill and skips the direct-child sweep, the unreaped timeout path runs both, and `bounded_exit_without_grandchildren_is_stderr_silent` re-execs the test to prove the runtime's stderr stays clean.

Probe: `cap_truncated_stream_is_not_a_completed_read` (`crates/ufo-core-runtime/src/process_group_tests.rs:8-12`) — the pin distinguishing cap truncation from a real EOF observation.

## `crates/ufo-core-runtime/src/profile_shape_refusal_tests.rs` (608 L) — raw-`config/ufo.json` pins for profile-shape refusals with exact refusal literals

`base_config` (:5-27) is the minimal v1 config that clears every gate — `extendedContext`, `concurrencyCeiling`, `probe.depth`, `l1Context.minimumTokens`, the retry block, the budgets block and the Main alias — and `expect_refusal` (:36-45) serializes a mutation and asserts the pinned literal appears in the refusal from `crate::expected_omp_route_yaml`. The arms cover `l1Context` presence and value (accepting the build.rs-legal numeric-string spelling), duplicate profile and top-level members refused rather than last-wins via hand-spliced raw bytes, the advisor fallback list rules, concurrency and probe-depth bounds, the v1 alias and retry-policy drift, and the `statusLine` shape plus its chartered scalar grammar in `status_line_scalar_obeys_the_chartered_grammar`.

Probe: `expect_refusal` (`crates/ufo-core-runtime/src/profile_shape_refusal_tests.rs:36-44`) — the helper asserting a mutated config dies with the exact pinned refusal literal.

## `crates/ufo-core-runtime/src/proposal.rs` (787 L) — the canonical specialist proposal contract, its digest helpers and candidate admission

`Proposal` (:12-19) is the deny-unknown-fields body — `iteration`, `specialist`, `summary`, optional `evidence_ids`/`source_route_key`/`pid`/`scores`/`parent_id`/`proposal_id`/`refined`, and the additive `touched_paths`/`subjective_axes`/`candidate_writes` that never serialize when absent. Intake validation is `validate_repo_relative_path`, `validate_touched_paths`, `validate_candidate_writes` (bounded by `MAX_CANDIDATE_WRITES` and `MAX_CANDIDATE_WRITE_BYTES`), `validate_subjective_axes` and `validate_additive_fields`, with `first_nonempty_additive_field` fixing the freeze precedence and `decode_candidate_write` decoding canonical base64. `sha256_hex` (:450-452), `sha256_hex_prefix`, `sha256_prefixed`, `sha256_json`, `is_sha256_hex`, `is_sha256_prefixed` and `hash_survivor_set` are the digest grammar, the survivor name binding only sorted-deduped `(proposal_id, summary, evidence_ids)` rows. `IntegratedCandidate::admit` is the refusal-heavy admission surface built on `CandidateReceiptError` and `EvaluatorReceipt`, never coordinate-composing scores.

Probe: `sha256_hex` (`crates/ufo-core-runtime/src/proposal.rs:450-452`) — the lowercase 64-character digest every other hash helper in the file composes from.

## `crates/ufo-core-runtime/src/proposal_tests.rs` (723 L) — pins for proposal digest grammar, additive-field intake validation and candidate admission

`proposal_sha256_prefixed_composes_bare_hex` (:3-10) and `proposal_sha256_grammar_refusal_arms_pinned` pin the `sha256:` prefix grammar and its lowercase-only, 64-hex body, while `proposal_serde_defaults_round_trip` and `proposal_refuses_unknown_fields` pin the deny-unknown-fields body contract. The survivor-set identity is pinned twice: `survivor_set_hash_is_route_blind_and_order_sensitive` (:84-104) and `survivor_set_hash_is_body_content_blind_by_design` show route keys, specialist names, scores and the additive fields stay outside the name, with a missing id normalizing to the empty string. `validate_additive_fields`, `validate_candidate_writes`, `validate_touched_paths` and `validate_subjective_axes` get boundary and lazy-label pins, `refusal_echoes_are_echo_bounded` checks every echo mechanism truncates, and `IntegratedCandidate::admit` is pinned through its coordinate-composition and empty-axis-key arms.

Probe: `proposal_sha256_prefixed_composes_bare_hex` (`crates/ufo-core-runtime/src/proposal_tests.rs:3-10`) — the pin composing the prefixed form from the bare digest.

## `crates/ufo-core-runtime/src/provenance.rs` (306 L) — fail-closed tip provenance for the tip-shaped crate plus the honesty clamps on claimed scores

`ProvenanceKind` (:48-53) is the two-variant kind — `PaperParity` for the twelve paper-parity fills, `TipByte` reserved until the tip publishes them — and `CoreRuntimeProvenance` binds `tip_sha`, `workspace_package`, `workspace_crate`, the module rosters and `oauth_live` under deny-unknown-fields. `assert_honest` refuses a claimed `oauth_live`, any roster drift from the seated canonical lists, and a `TipByte` claim while paper-parity fills remain, and `active_shared` memoizes the honest paper-parity record while `active` clones it. `honest_axis_score` (:174-176) clamps the implementation axis to 0.0 for paper parity and to 0.0 for a dishonest tip-byte record, and drops non-finite claims to 0.0 on any axis. The continuity surface (`ContinuityIdentity`, `RouteContinuity`, `ContinuityDecision`, `decide_route_continuity`) turns the frozen chain plus a failure class into an advance or an unavailable decision through `next_route`.

Probe: `honest_axis_score` (`crates/ufo-core-runtime/src/provenance.rs:174-176`) — the public clamp that keeps a claimed implementation score honest against the active provenance record.

## `crates/ufo-core-runtime/src/provenance_tests.rs` (228 L) — the unit-test arm of the crate's provenance-honesty contract

Pulls the whole provenance surface in with `use super::*` and pins it from
outside any production path: `honest_axis_score_for` clamps a non-finite claim
(`NAN`/`INFINITY` → `0.0`) while a finite `0.75` passes through unchanged,
`assert_honest` refuses a `ProvenanceKind::TipByte` kind and truncated rosters,
and `active_shared` is memoized so repeated calls alias the same record
(`std::ptr::eq`). The roster tests cross-check `PAPER_PARITY_MODULES` and
`ACTIVE_TIP_RS` against `ports/ufo-core-runtime/SRC-PARTIAL.json`, and the
tail drives route continuity over `ExecutionProfile::canonical(Substrate::Omp)`.

Probe: `honest_score_clamps_non_finite_claims` (`crates/ufo-core-runtime/src/provenance_tests.rs:6-11`) — the test function that asserts the NaN/infinity clamp to 0.0.

## `crates/ufo-core-runtime/src/report.rs` (107 L) — the per-round iteration report owned by `loop_driver`

`ProposalAxisMeasurements` keys one judged proposal by `specialist` plus
`summary` (not by the `SourceMapEntry` or `MembraneAccept` identity — only an
optional `proposal_id` is shared) and carries `records: Vec<AxisMeasurementRecord>`
plus the dropped-flag `subjective_flags`. `IterationReport` holds the round
counters, the `pub(crate)` distill finding sets, the digest quartet
(`candidate_digest`, `axes_digest`, `config_digest`, `contract_digest`),
`membrane_accepts`, and `saturation_inconclusive: Option<LaneHealth>`. Both
structs are `deny_unknown_fields` with `skip_serializing_if`, so previously
serialized report JSON stays byte-identical.

Probe: `ProposalAxisMeasurements` (`crates/ufo-core-runtime/src/report.rs:18-34`) — the derive-and-struct block declaring the per-proposal axis record.

## `crates/ufo-core-runtime/src/round.rs` (32 L @ `964f443e` → 11 L @ `31c465f1`) — the doc-only paper-parity placeholder for the tip's round module

The tip `lib.rs` declares this module but upstream has not published the `.rs`
(SRC-PARTIAL), so the contract binds the module's EXISTENCE rather than an
invented field shape — and since `31c465f1` that surface is doc-only: 11 lines
of module documentation, no items. The module is still declared
`pub(crate) mod round;` at `crates/ufo-core-runtime/src/lib.rs:62`. The r14
shrink had deleted the write-only `round`, `phase`, `admitted` and `rejected`
fields plus the `RoundPhase` enum, leaving `RoundState { saturated }`; at
`31c465f1` that struct and its `new_state_starts_unsaturated` test were deleted
too, and the bool now lives as the round-local `saturated` binding in
`loop_driver_dry` (`loop_driver_dry.rs:512`). The old probe (the derive plus
one-field struct at lines 17-20 of the `964f443e` file) is dead at
`31c465f1`; the prior text is kept here as prose so the audit is not rewritten
(round-35 correction, seat ScoutR11RoundRs).

Probe: `saturated` (`crates/ufo-core-runtime/src/round.rs:1-11`) — re-anchored
at `31c465f1` to the whole surviving surface, the module doc that binds the
module's existence and records where the saturation flag moved.

## `crates/ufo-core-runtime/src/round_digest.rs` (609 L) — the bounded per-round digest schema, path builder and writer

Field caps are frozen constants: `ROUND_DIGEST_SCHEMA` (`"ufo-round-digest-v1"`),
`ROUND_DIGEST_MAX_BYTES` (32768), `MAX_DIGEST_FIELD_BYTES`, `MAX_RUN_ID_COMPONENT_BYTES`
and `MAX_ECHO_CHARS`, plus `echo_bounded` for untrusted echoes. `RoundDigest`
carries the `accepted`/`rejected` `RoundDigestEntry` lists, `LaneHealth`
(`is_clean`), `RoundDigestCost` and the typed `stop_evaluation`;
`round_digest_path` joins `.ufo/rounds/<run_id>/r<NN>-digest.json` only after
`validate_run_id`, and `read_bound_round_digest` reads it back. Emission funnels
through `prepare_round_digest` then `write_prepared_round_digest`, which refuses
planted symlinks in the chain derived from the path actually written.

Probe: `round_digest_path` (`crates/ufo-core-runtime/src/round_digest.rs:193-197`) — the run-id-joined destination builder beneath a run root.

## `crates/ufo-core-runtime/src/round_digest_tests.rs` (609 L) — the digest-emission and frontier-replay falsification suite

Fixture helpers `digest_with_run_id`, `mint_digest_json`, `two_axis_set` and
`replay_probe_digest` build tamper-able chains; the replay arm refuses a
stripped `axes_delta` map, an undeclared axis delta, a non-finite, negative or
overflowing delta, and still accumulates fractional deltas bit-exactly. The
emission arm pins run-id grammar against path escape, the shared
validate/serialize field bounds, the frozen `stop_evaluation` table, that a
prepare refusal creates no digest path or parent, the symlinked-state-root
refusal, and `proposal_digest_refuses_a_non_finite_score` under
`#[should_panic(expected = "is not finite")]`.

Probe: `replay_refuses_a_stripped_accept_delta_map` (`crates/ufo-core-runtime/src/round_digest_tests.rs:54-72`) — the first replay-tamper arm, asserting the refusal reads `carries no axes_delta`.

## `crates/ufo-core-runtime/src/rules.rs` (280 L) — the canonical Pareto/quality rules and the local route allowlist

`UfoRules::paper_core()` returns a `LazyLock` singleton holding R1–R4 plus the
QualityRecognition statement as immutable literals. `evaluate_quality` with
`QualityRecognition`/`QualityVerdict` does deterministic locator recognition
(`LOCATOR_NEEDLES`, `looks_like_locator`) with no live model score, and
`RulesAudit::audit_text` flags scalar-utility and confidence-gate anti-patterns
through `contains_ignore_ascii_case`. `require_local_route` admits only
`FIXTURE_PRIMARY_ROUTE`, `FIXTURE_RECOVERY_ROUTE` and `QWEN_LIVE_ROUTE`, and
echoes any refusal through `echo_bounded` before lowercasing it.

Probe: `paper_core` (`crates/ufo-core-runtime/src/rules.rs:16-24`) — the `UfoRules` struct followed by its `paper_core` singleton accessor.

## `crates/ufo-core-runtime/src/specialist.rs` (53 L) — the local specialist-lane identity and route

`SpecialistLane` is `role` plus `route` plus `parallel_cap`, all
`#[serde(deny_unknown_fields)]`; the former single-variant `LaneClass` enum was
deleted under the explicit `ufo.fsd.v3 → ufo.fsd.v4` checkpoint-protocol
migration because every lane is a specialist execution-layer lane. The
`parallel_cap` field is hashed into frozen contract digests but does not bound
runtime fan-out. The test module pins both the absence of `lane_class` on the
wire and refusal of an unknown key.

Probe: `SpecialistLane` (`crates/ufo-core-runtime/src/specialist.rs:13-25`) — the serde-attribute-plus-struct block defining the lane record.

## `crates/ufo-core-runtime/src/test_env.rs` (313 L) — the test-only env overlay and its single knob grammar

Two thread-locals hold the fixture state: `OVERLAY` (a map whose `Some(None)`
means explicitly removed and `None` means fall through) and `FORCE_DRY`.
`env_value`, `overlay_get` and `env_secs` layer the overlay over the process
environment; `env_secs` is the crate's one positive-seconds grammar (`>= 1`,
else `None`) that the `ufo-cli` timeout knobs resolve through.
`explicit_live_promote` consults `explicit_truthy_flag` and is vetoed by
`force_dry`, and `EnvGuard` (`lock`/`dry`/`live`/`set`/`remove`) restores every
touched key LIFO on `Drop`.

Probe: `env_secs` (`crates/ufo-core-runtime/src/test_env.rs:57-68`) — the positive-seconds parse arm shared by the CLI timeout knobs.

## `crates/ufo-cli/src/main.rs` (1868 L) — the `ufo` binary root: clap surface, verbs and artifact writers

`Cli` and `Command` derive the subcommand surface (`Status`, `Titanium`,
`Plan`, `Gates`, `JudgeHandoff`, `SelfIter`, `LocalShip`, `RoutePlan`,
`ReceiptDigests`, `RoutingHealth`, `Charter`, `MembraneSeal`, `Sign`), `main`
returns an `ExitCode` from `run()`, and `ROUTE_ROLES` plus `route_role_names`
and `parse_route_role` pin the seat-role table. Verbs include `judge_handoff`,
`receipt_digests`, `self_iter` (with `install_self_iter_sigint` and the
diverging `block_self_iter`), `charter_phase0`/`charter_sign`,
`write_contract_sync_record` and `local_ship`; artifacts are emitted by
`write_artifact` and `emit_artifact_and_print`.

Probe: `routing_health_latency_percentile` (`crates/ufo-cli/src/main.rs:1344-1355`) — the nearest-rank percentile helper the routing-health report ranks latencies with.

## `crates/ufo-cli/src/main_tests.rs` (685 L) — the `ufo` binary's in-crate unit suite

Covers SIGINT registration (`sigint_handler_sets_interrupt_flag` raises a real
`SIGINT` through `signal-hook`), the `ROUTE_ROLES` spelling table, and the
timeout-knob grammar — pinned through an `EnvGuard` overlay on a probe key
because workspace edition 2024 forbids an `unsafe` `set_var`. Further pins:
`charter_sign_run_id_grammar_is_pinned`, bounded refused-echo cases,
`truncate_utf8_chars_respects_char_boundaries_and_limits`,
`resolve_task_precedence_positional_flag_default` and
`substrate_skill_surface_derives_the_replaced_literal_table`; `built_ufo_binary`
locates the compiled binary for the child-process arm.

Probe: `routing_health_latency_percentile_uses_ceil_nearest_rank` (`crates/ufo-cli/src/main_tests.rs:385-403`) — the ceil-nearest-rank percentile cases that floor/round rank mutants fail.

## `crates/ufo-cli/src/titanium.rs` (828 L) — the Titanium machine-map validator half of the CLI

Constants `MAP_PATH`, `SCHEMA_PATH` and `EMBEDDED_SCHEMA` (an `include_bytes!`
of the tracked schema), the byte caps `MAP_MAX_BYTES`, `SCHEMA_MAX_BYTES`,
`DESCRIPTOR_MAX_BYTES`, `MAX_STRING_BYTES` and `RESUME_POLICY` scope the verb.
`run(seat)` digest-pins the embedded schema against runtime drift, screens the
JSON, typed-decodes into `TitaniumMap`, and validates through `validate_schema`,
`validate_logical_values` and `validate_map` (records, claims, resume, native
files); `require_rfc3339` and `is_rfc3339` delegate to
`rfc3339::strict_timestamp`. The untrusted-input admission half lives next door
in `admission.rs`.

Probe: `TitaniumMap` (`crates/ufo-cli/src/titanium.rs:34-40`) — the typed machine-map root record the whole validator decodes into.

## `crates/ufo-cli/src/titanium_tests.rs` (1009 L) — the Titanium validator suite with its own cwd/tempdir harness

Builders `valid_map` and `valid_map_with_candidate`, plus the `cwd_guard` and
`stage_cwd` pair over a local `mod tempdir`, stage bytes on disk for the
filesystem arms. Assertions cover duplicate-object-key and depth refusals,
logical-string limits, external `$ref`s, embedded-schema drift, symlink and
overlong-file refusal, roster order, claim/reference resolution, native
admission guards, resume metadata, and the split between the freshness walk and
`require_rfc3339` in
`leap_second_stamps_are_refused_by_require_rfc3339_not_the_freshness_walk`.

Probe: `duplicate_json_object_key_is_refused` (`crates/ufo-cli/src/titanium_tests.rs:352-359`) — the byte-level duplicate-key refusal arm run before any semantic validation.


## Member-completeness probe

Two arms, both re-runnable; the first is the registry gate, the second is the
boundary arithmetic that defines the family.

**Arm 1 — the gate.** `node scripts/claims-check.mjs --row R11` against the
registry cell above:

```
ROWS: 1  YES: 1  NOTES: 1  SECTIONS: 47
ROW R11  form=section   notes=1 sections=47 adv=0
SUMMARY: errors=0 warnings=0
CLAIMS: MATCH (rows=1 yes=1 notes=1 sections=47 adv=0)
```

Zero advisories, where the two census notes that precede this one still carry
theirs. Every section resolves to a distinct file inside the cell's declared
patterns, carries a live own-file anchor and a verbatim symbol, and the declared
`47 members` equals the distinct section count — so `MEMBER_COUNT_DRIFT` is
armed and deleting, renaming or mis-pointing a section fails the run instead of
passing quietly.

**Arm 2 — the boundary.** The subtraction that makes this family a family:

```
$ ls crates/ufo-core-runtime/src/*.rs | wc -l                                  # 93
$ ls crates/ufo-cli/src/*.rs | wc -l                                           # 5
$ comm -23 <(93 names, LC_ALL=C sort) <(R1–R10 union, LC_ALL=C sort) | wc -l   # 42
$ comm -3  <(the 47, LC_ALL=C sort) <(the written sections, LC_ALL=C sort)     # empty
```

and the same probe reports the union pairwise disjoint (`uniq -d` empty over all
90 ordered pairs) with no basename collision inside the 47, against `R1`–`R10`,
or between the runtime and CLI crates.

A trap worth carrying: `comm` on two differently collated inputs is not a
comparison. This list is written in `en_US.UTF-8` order, which is *not* C order —
the identical `comm -3` printed empty on one run and a bogus `round.rs` line plus
`comm: input is not in sorted order` on the next. Both sides must be
`LC_ALL=C sort`ed first; the C-collated diff is empty and the two sorted copies
hash identically.

**Independent arms.** Two separate lanes re-derived parts of this note rather
than re-reading it: one rebuilt the 47-path membership from the tree and the
registry cells and diffed it (`comm -3` empty, `wc -l` 24,874 matching), and one
measured the gate's sensitivity to this row's shape by doctoring eight fixtures
(absent note, 1-of-3 members, anchor past EOF, blank anchor endpoint, no
verbatim symbol, section outside the declared patterns, ambiguous basename,
non-path-like heading): 8 of 8 behaved as the tool's header claims, `--strict`
promoted the one warning to a failure, and a missing `--src` failed closed
(exit 2) rather than reporting a clean tree.

**What the probe cannot show.** All three properties are shape checks. They show
that each member was opened and quoted; they cannot show that the sentence
around the quote is true, and they cannot see a member that is named in a
different note's prose but sectioned nowhere. The prose in the 47 sections above
is the part no gate reads.

## Sources

- origin tree `crates/ufo-core-runtime/src/` + `crates/ufo-cli/src/` at HEAD
  `93798be12` (read-only; read at 37 dirty paths, none of the 47 modified that day)
- `scripts/claims-check.mjs` (contract `kumitate-claims-v1`) and
  `corpus/knowledge/member-claims-gate.md` for the section contract this note is
  written to
- the ten `R1`–`R10` notes named in the registry rows, for the boundary this
  family is the remainder of: `native-judge-pipeline`, `loop-driver`,
  `cost-and-profile`, `runtime-support`, `native-admission-detail`,
  `distill-and-l3`, `local-ship`, `native-transcript-ledger-seats`,
  `test-inventories`, `gate-verdict`
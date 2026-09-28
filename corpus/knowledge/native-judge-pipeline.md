# Native judge pipeline — `ufo judge-handoff` and the `native*` family

The only path that produces a verdict. `crates/ufo-cli/src/main.rs` `cli`
wraps `ufo_core_runtime::judge_handoff` (`src/native.rs:470`); the frontier
decision itself belongs to `gate.rs::ParetoGate`. Paths below are relative to
`/home/vgpnk/Projects/origin-work/ufo-fsd-alpha`; `src/X` =
`crates/ufo-core-runtime/src/X`.

## CLI intake (all before the judge)

`cli:310` `judge_handoff(input, project_root)`:

1. `refuse_stdin_shaped` (`cli:927`) — `-`, `/dev/stdin`, `/proc/self/fd/0`,
   symlinks resolved to fd 0 all refused: judged bytes must be a named
   regular file.
2. `admission::read_bounded_regular` at `MAX_EVIDENCE_FILE_BYTES` = 16 MiB
   (`src/native_schema.rs:107` — same ceiling as the collector's
   `MAX_HANDOFF_BYTES`, `collect-omp-native-handoff-lib/base.mjs`).
3. `reject_excessive_json_depth` + `parse_unique_json` — duplicate keys and
   pathological nesting refused pre-decode.
4. `serde_json::from_value::<NativeRoundHandoff>` — `deny_unknown_fields`
   (`src/native_schema.rs:454`), so any unknown key is a decode refusal.
   There is NO `schema_version`/`kind` field; version = the `profile` string.
5. `TrustedContext { project_root }` (`src/native_schema.rs:531`) — CLI-side
   trust anchor; the handoff's `contract_root` must canonicalize to the same
   real path. Hash equality alone is not producer authentication.

Exit codes: verdict → stdout, 0. Any refusal → `{ok:false,kind,error}` on
stderr, exit 2 (`fail_local` `cli:906`; kinds `invalid|json|validation|io`).
Uncaught errors → `ufo: {error}` on stderr, exit 1 (`cli:214-227`).

## Handoff schema

`NativeRoundHandoff` at `src/native_schema.rs:455`:

- 21 REQUIRED fields (`:456-476`): `profile, run_id, round, substrate,
  concurrency, concurrency_semantics, axes, axes_hash, contract_hash,
  contract_root, config_digest, proposal_seats, probe_parent, agents,
  proposals, integrated_candidate, candidate_digest, candidate_receipt,
  baseline, provenance, telemetry`.
- 8 OPTIONAL additive fields placed after the frozen v1 tail so v1
  re-serialization stays byte-identical (`:477-521`): `plan_digest,
  acceptance_criteria, attempt_ledger, effective_launch, dispatch_attempts,
  cost_ledger, plan_path, plan_wave_size`.
- Three admitted `profile` spellings (`src/native_schema.rs:23/34/46`):
  `omp-native-v1` (frozen — all 8 optional fields are typed rejections under
  it), `omp-native-v2`, `omp-native-resilient-v1` (attempt-ledger +
  dispatch-attempt evidence ride only this one).
- Fixture for the wire shape: `conformance/fixtures/native-handoff/handoff.json`.

## Judgment order — `native.rs::judge_handoff` (:470)

Fail-closed, in this sequence; every refusal is `NativeHandoffError`
`{Json|Validation|Io}` (`src/native_schema.rs:550`):

1. `validate_header` (`native_header.rs:243`): run_id non-empty + single
   path component (it joins `.ufo/rounds/<runId>/…`); `substrate=="omp"`;
   topology bounds — `concurrency ∈ 1..=32`, `concurrency_semantics`,
   proposal wave ≤ `NATIVE_PROPOSAL_WAVE_MAX` (16), ≥6 mandatory roles,
   `agents+dispatch_attempts == proposal_count+4`, `round ≥ 1`;
   `candidate_receipt.admitted==true` → "javascript-composed candidate"
   refusal; digest shapes; axis identity hash + `axes_hash` recompute;
   `contract_root` canonicalizes to the trusted root; `contract_hash` +
   `config_digest` recompute against live files; receipt digests recompute
   through the contract; provenance equality; `validate_plan_binding`.
2. `require_cost_ledger_when_budgeted` (`cost_ledger.rs:79`).
3. `NativeProfileBounds::from_parsed` (`native_profile.rs`) — deadline table
   resolved from the handoff's admitted profile via `extends` BEFORE any
   evidence read (the table decides every seat's terminal cause).
4. `GodspeedDirective::load_from_trusted` against the canonical root —
   all post-header root reads use the canonicalized root, never the raw
   `project_root` spelling (r21/r22 alias-swap pins).
5. `validate_agents` (`native_agents.rs:27`) → `validate_attempt_ledger`
   (`native_ledger.rs:31`, resilient only) → `validate_effective_launch`
   (`native_launch.rs:365`, v2+resilient) → `validate_cost_ledger`
   (`cost_ledger.rs:100`, topology seat set, priced-route recompute,
   mission-cumulative lineage).
6. `validate_dispatch_topology` (`native_dispatch_topology.rs:410`) —
   transcript-level proof of the batched wave: wave_token consistency,
   spawned-vs-requested role/assignment equality, exact child dispatch
   counts, "Main must dispatch planner + one batched proposal wave +
   distiller in three distinct successful task calls".
7. `validate_telemetry` (`native_telemetry.rs:286`) +
   `reject_critical_lane_timeout` (`:853`) — lane_failure detail grammar is
   RECOMPUTED from the transcript's terminal error, never trusted from the
   producer's copy.
8. `ParetoGate::new(handoff.axes)` → `contract_round_epoch`
   (`native_epoch.rs:177`; absent → Ok(None), malformed → refusal) →
   `validate_score_vector` → `clamp_honest_baseline_vector`
   (`native_scores.rs:21` — paper-parity `implementation` clamp) →
   `validate_proposals` (`:60` — producer sequence must exactly match
   completed frozen seats: the all-proposal-failure refusal) →
   `validate_integrated_candidate` (`:395` — `candidate_digest` must equal
   the content-addressed distiller artifact digest; survivor-set rules).
9. `nata_assemble_handoff_verdict` (`native.rs:271`) →
   `emit_native_round_digest` (`native_plan_digest.rs:557`) writes
   `.ufo/rounds/<runId>/r<NN>-digest.json` on EVERY verdict-bearing outcome,
   admit or reject (spec 07 §3).

## Verdict vocabulary

- `NativeHandoffVerdict` (`lib.rs:652`) — `handoff_digest` binds the verdict
  to the canonical re-serialization; carries `round_validity`, `loop_stop`,
  `mission_goal`, `decision` (`GateDecision`), `contributions`, wave metrics
  (`peak_wave_overlap`, `effective_wave_capacity = min(seats,
  concurrency-1)`, `observed_wave_utilization`), optional `cost_ledger`,
  `membrane_accepts`, `subjective_flags`, `honesty_flags`, `plan_wave_drift`.
- A refused handoff is an `Err`, NEVER an `Unsound` verdict:
  `RoundValidity::Sound` is the only construction on the native path
  (`native.rs:398`). `Unsound` exists for callers outside the judge
  (e.g. the self-iter report's empty/blocked rounds, `cli:594`).
- `GateDecision` (`gate.rs:15`, serde tag `verdict`): `admit{improved}`,
  `reject_regression`, `reject_no_improvement`, `reject_malformed`,
  `reject_insufficient_evidence` (constructed only by `axis_checks`, not by
  `ParetoGate::decide`). Admit iff ≥1 axis improves AND none regress.
- `mission_goal` derives ONLY from the plan's `acceptance_criteria`
  (`assess_mission_goal` `native.rs:626`): absent/empty criteria, any string
  (unmeasurable) criterion, or any axis missing from the final vector →
  `unverified`; the unmeasurable arm dominates regardless of listing order.
  Candidate vector when the round moved the frontier, baseline otherwise.
- Per-seat contribution reasons (`integrated_seat_admission_reason`
  `native_scores.rs:468`): `admitted_in_integrated_candidate`,
  `rejected_advisory_{regression,no_improvement,malformed,
  insufficient_evidence}`, `rejected_not_in_compatible_survivor_set`,
  `rejected_with_integrated_candidate_{regression,no_improvement,
  insufficient_evidence}`, `rejected_duplicate_fingerprint:<seat>`.

## Contract-hash mechanism (`native_contract.rs`)

- `NATIVE_CONTRACT_FILES` (`:69`): ordered registry of 66 tracked files —
  skills/godspeed docs, agent cards, `config/ufo.json`, `.omp/config.yml`,
  the runtime/CLI sources on the judgment path, launcher/collector/sighting
  scripts, the bundled seat-routing mirror. Membership AND order are digest
  inputs. Compile-time ratchet: a const assert pins
  `len == KNOWN_MIN_CONTRACT_FILES` so an append must bump the floor.
- `native_contract_hash` → the launcher freezes the hash into the launch
  manifest; the collector re-reads it via `ufo status` — mid-round drift
  fails the round.
- `MAX_CONTRACT_FILE_BYTES` = 256 KiB per tracked file (`:19`), enforced
  before allocation. `MIN_CONTRACT_HEADROOM_BYTES` = 8 KiB crate-side floor
  (`:41`): `native.rs` once sat 1800 bytes under the fuse; further growth
  would have made the contract hash refuse → `ufo status` stops emitting
  `contractHash` → launcher and collector die before judgment. When
  `native.rs` needs room, relocate code into `lib.rs` or another
  `NATIVE_CONTRACT_FILES` entry — that is why the PC-C/P3/PC-A wire types
  and `expected_omp_route_yaml` live at the crate root.
- `PROJECT_OMP_MIRRORS`: `.omp/` copies of skill/agent files byte-compared
  separately; drift → `"project OMP mirror '…' differs from canonical '…'
  (repair: run node scripts/sync-ufo-contracts.mjs)"` (`:543`).

## Failure classifier (Rust authority)

`native_text.rs` `classify_failure_fields` (:161) — NOT `classify_failure`:
`FAILURE_RULES` (:96) evaluated in order — exact status/id string equality,
then literal needles, then digit-guarded status codes (`contains_status_code`
:81), then word-boundary `process` → `ToolFailure` (`contains_word` :87), else
`Unknown`. `FailureClass::permits_advance` (`execution_profile.rs:448`) =
`UsageLimit|RateLimit|ModelUnavailable` — the capacity subset.

## Traps

- Executable axes can never ride a native handoff: `Axis::validate_native_measurement` (`axes.rs:66`) rejects `executable` at header intake — a
  handoff has no candidate tree; executable scoring belongs to the fixture
  loop only (`axis_checks.rs` is driven by `loop_driver_judge.rs`, not the
  judge).
- `assignment` bytes are digest-bound AND must begin with the exact
  canonical Godspeed directive AND carry exactly one terminal `| godspeed`
  marker (`native_continuity.rs:288/302/317`; `EVIDENCE_MARKER`
  `godspeed.rs:10`). Misplaced and duplicated markers are the same refusal.
- A lane_timeout on a critical seat invalidates the round for judgment —
  D1a retry is a substrate action, not a judge patch
  (`native_telemetry.rs:~870`).
- `proposal_seats`/`agents`/`dispatch_attempts` coverage is closed: a seat
  is covered by an agent XOR a dispatch attempt, never both
  (`native_launch.rs:130` shape).

Sources: `src/native.rs`, `src/native_schema.rs`, `src/native_header.rs`,
`src/native_contract.rs`, `src/native_admission_rules.rs`,
`src/native_plan_digest.rs`, `src/native_{agents,continuity,evidence,
transcript,seat_coverage,dispatch_topology,scores,telemetry,ledger,launch,
route,profile,epoch,seats,admission_text,digests,text}.rs`, `src/gate.rs`,
`src/axes.rs`, `src/state.rs`, `src/cost_ledger.rs`, `cli/main.rs:42-49,
247-355, 906-952`; `conformance/fixtures/native-handoff/handoff.json`.

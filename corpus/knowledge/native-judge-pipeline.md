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
  (`native_seat_coverage.rs:291-296` — the literal refusal "covered by both
  an agent and a dispatch attempt"; `native_launch.rs:130` once cited here is
  the duplicate-launch-record arm, a different check).

## Members

One section per registry family `R1` member, in the order the registry cell
names them. Each carries an own-file anchor and a verbatim symbol — the three
properties `scripts/claims-check.mjs` re-derives (contract
`kumitate-claims-v1`, `corpus/knowledge/member-claims-gate.md`).

## `native.rs` (767 L) — fail-closed ingestion orchestrator: the fixed header→evidence→gate order, verdict assembly, and mission-goal derivation

`judge_handoff` (:470) is the module's only public entry and the whole judgment sequence in one body. Order is load-bearing and never shuffled: `validate_header` → `require_cost_ledger_when_budgeted` → `NativeProfileBounds` resolved from the contract-bound config JSON (the deadline table is bound BEFORE any evidence read — a missing or malformed table fails the entire handoff) → `GodspeedDirective` trusted load (a read failure stays `NativeHandoffError::Io`, every other shape becomes a validation refusal) → `validate_agents` → `validate_attempt_ledger` → `validate_effective_launch` → `validate_cost_ledger` over the merged agent-plus-dispatch seat set → `validate_dispatch_topology` → `validate_telemetry` → `reject_critical_lane_timeout` → `ParetoGate` plus `contract_round_epoch` → `validate_score_vector` → `clamp_honest_baseline_vector` → `validate_proposals` → `validate_integrated_candidate` → `nata_assemble_handoff_verdict` → `emit_native_round_digest`. Every post-header root read goes through `canonical_trusted`, the single spelling `validate_header` proved; the raw `context.project_root` is never re-read after header (r21 P2 R1, r22 E2 alias-swap pins). The test-only `ROOT_ALIAS_MUTATION_HOOK` at :431 exists to mutate the filesystem in exactly that window.

`nata_assemble_handoff_verdict` (:271) owns the verdict wire shape: `handoff_digest` is the SHA-256 of `serde_json::to_writer` over the whole handoff, `effective_wave_capacity` = `min(proposal_seats.len(), concurrency - 1)` (one declared slot is always reserved for the probeParent-owned labrat), and `observed_wave_utilization` is `peak_wave_overlap / effective_wave_capacity` or `0.0` at zero capacity. Two post-decision overrides fire here: an admitted round whose survivor proposals touch a config-declared membrane path records `membrane_accepts` and forces `loop_stop = AuthorityBoundary`; and `plan_wave_drift` compares `plan_binding.wave_size` against the dispatched seat count, recording provenance only — never a rejection. `round_validity: RoundValidity::Sound` is the only construction on this path; a refused handoff is an `Err`, never a verdict carrying an unsound validity.

`assess_mission_goal` (:626) derives `mission_goal` only from the plan's acceptance criteria, in a deliberate order: absent or empty criteria → `Unverified`; any unmeasurable criterion OR any `AxisThreshold` whose axis the final vector lacks → `Unverified` (dominating in either listing order); a measured miss → `Incomplete`; otherwise `Satisfied`. `ValidatedAgents` (:654) and `ValidatedProposal` (:679) are the intermediate carriers; `ValidatedAgents` memoizes `peak_wave_overlap`, `terminal_errors`, and `route_cache` so later passes reuse one authority instead of rebuilding it. `require_nonempty` (:740) and its lazy-label twin `require_nonempty_with` (:751) share one byte-for-byte message contract, and `invalid` (:761) is the single `NativeHandoffError::Validation` constructor.

The file is itself a `NATIVE_CONTRACT_FILES` entry pinned under `MAX_CONTRACT_FILE_BYTES`, so wire types and the directive loader live at the crate root and evidence intake sits in the `#[path]` sibling module `native_evidence.rs`; the re-export blocks keep the historical `ufo_core_runtime::native::*` paths alive as pure relocations.

Probe: `judge_handoff` (crates/ufo-core-runtime/src/native.rs:470-613) — the pinned call sequence from `validate_header` through `emit_native_round_digest` and the final `Ok(verdict)`; :626-652 proves the mission-goal arms exit on that exact order.

## `native_header.rs` (342 L) — header intake and trust binding: profile admission, topology bounds, digest recomputation, canonical-root joining

`validate_header` (:243) is the trust gate the judge calls first, and its step order is pinned: `validate_profile` → `require_nonempty` on the `run_id` label → `natg_validate_run_id_path_component` → `natg_validate_substrate_omp` → `natb_validate_topology_bounds` → `natg_validate_header_digests_and_receipt_shapes` → `natg_validate_handoff_axes` → `natg_canonicalize_contract_against_trusted` → `natg_verify_contract_and_config_digests` → `natg_validate_receipt_recomputes_through_contract` → candidate-digest equality → honest-provenance equality against the active shared value → `validate_plan_binding`. It returns `ValidatedHeader`, a five-slot tuple of budgets, optional membrane, plan binding, contract-bound config JSON, and the canonical root — so no later pass re-reads the raw `context.project_root` spelling.

The refusal literals are the contract: `natg_validate_run_id_path_component` (:29) rejects any run id that is not a single path component, because it joins `.ufo/rounds/<run_id>/…` and must never aim evidence outside the operator-named root; `natg_validate_substrate_omp` (:45) demands the literal `omp`; `natg_validate_header_digests_and_receipt_shapes` (:55) refuses `candidate_receipt.admitted` with `"javascript-composed candidate"` before it ever shapes-checks the receipt hashes, and `natg_validate_handoff_axes` (:86) rejects `executable`-kind measurements at intake (a handoff carries no candidate tree), then rechecks identity hash and `axes_hash` recomputation.

`natb_validate_topology_bounds` (:284) is the numeric envelope: `concurrency` in `1..=NATIVE_CONCURRENCY_MAX`, `concurrency_semantics` equal to the fixed literal, proposal wave `<= NATIVE_PROPOSAL_WAVE_MAX`, at least `MANDATORY_PROPOSAL_ROLES` seats, `agents.len() + dispatch_attempts.len() == proposal_count + 4` (Main, planner, distiller, labrat; each declared dispatch attempt substitutes for one frozen seat's agent), `round >= 1`, and `concurrency >= proposal_count + 1` since one slot is always reserved for the descendant labrat. The `expected_total > NATIVE_TOTAL_SEATS_MAX` disjunct was unreachable (r21 R2/F3) — the wave cap plus the schema const assert already imply it — so the ceiling is only reported in the message, never tested.

`natg_canonicalize_contract_against_trusted` (:129) canonicalizes both the handoff `contract_root` and the CLI-supplied trusted root and refuses any mismatch — hash equality alone is not producer authentication — returning the one canonical root that later serves the contract digest, the plan binding, and the returned evidence root. Its digest verifier `natg_verify_contract_and_config_digests` (:198) recomputes `contract_hash` and `config_digest` against live bytes inside one `NatgContractDigests` bundle; the test-only `NATG_DIGEST_ROOT_CAPTURE` seam (:175) records that exact root argument.

Probe: `validate_header` (crates/ufo-core-runtime/src/native_header.rs:243-282) — the ordered intake and the five-slot return; :284-342 proves the topology envelope and its four fixed-core seat arithmetic.

## `native_schema.rs` (570 L) — admission vocabulary and the OMP-native wire schema

Pure code motion from `native.rs` (r16 cut W) and self-registered as the 52nd
`NATIVE_CONTRACT_FILES` entry (:2-3), so any edit here moves the contract hash.
The admission vocabulary lives entirely in this file: the base v1 spelling
`omp-native-v1` (:23) plus the two one-hop `extends` variants `omp-native-v2`
(:34) and `omp-native-resilient-v1` (:46), each a `nativeProfiles` key in
`config/ufo.json`, never a copy. `TRANSCRIPT_CANONICALIZER_VERSION` (:62) is
pinned by no Rust test — value drift is caught only by the collector suite's
emitted-value pin and the conformance vector's `error_contains`, so the Rust
suite references the symbol value-agnostically (:48-61). Topology ceilings:
`NATIVE_PROPOSAL_WAVE_MAX` 16 (:75), `NATIVE_CONCURRENCY_MAX` 32 (:85),
`NATIVE_TOTAL_SEATS_MAX` = wave + 4 (:89) held by `const _: () = assert!` (:96)
because the old unreachable total-seat disjunct was dropped (r21 R2/F3).
Bounded-read ceilings: `MAX_EVIDENCE_FILE_BYTES` 16 MiB (:107),
`MAX_TRANSCRIPT_LINE_BYTES` 128 KiB (:113), `MAX_DETAIL_TEXT_BYTES` 2048 (:118).

The 14 seat roles are kebab-case contract keys (:187-188) and drive the
projection compiler's per-role resolution pass. `ALL_NATIVE_ROLES` (:143) is the
complete table; `MANDATORY_PROPOSAL_ROLES` (6, :166) and
`OPTIONAL_PROPOSAL_ROLES` (4, :174) are the ONLY two proposal authorities, and
`is_proposal` (:251-253) is their union — the taxonomy cannot drift out of
agreement with itself. `expected_evidence` (:225) writes explicit arms for the
ten proposal roles, so a variant added to the enum fails to compile instead of
panicking; `is_critical` (:260) names Main/planner/distiller/labrat. Telemetry
event literals: `LANE_FAILURE_EVENT`, `LANE_TIMEOUT_EVENT`,
`CORRELATED_UNAVAILABILITY_EVENT` (:127-129), the v2+resilient-only herd record
`DOMAIN_COOLDOWN_EVENT` (:132), and the critical-seat timeout group prefix
`critical:` (:136).

All 11 wire structs carry `#[serde(deny_unknown_fields)]` (:289-454), so an
unknown key is a decode refusal. `NativeRoundHandoff` (:455) is 21 required v1
fields (:456-476) plus 8 additive OPTIONAL fields appended after the frozen v1
tail (:477-521), each `skip_serializing_if = "Option::is_none"`, so a v1
handoff's canonical re-serialization — and therefore its `handoff_digest` —
stays byte-identical. The F18 raw→derived provenance hook `evidence_originals`
is the last agent field for that same reason (:437-447). `TrustedContext` (:531)
is the CLI-side trust anchor (hash equality alone is not producer
authentication); `ValidatedEvidence` (:542) is the read-once, digest-checked
transcript/artifact cache with no re-read drift window; refusals are
`NativeHandoffError` (:550), whose serde arm keeps the serde wording while
applying the shared 512-character refusal ceiling through `echo_bounded`
(:563-568).

Probe: `is_proposal` (crates/ufo-core-runtime/src/native_schema.rs:251-253) — the union of the mandatory and optional proposal arrays, the taxonomy's single membership authority.

## `native_contract.rs` (918 L) — contract-surface hashing, mirror validation, tracked registry

Pure code motion from `native.rs` (r13 cut 1) and self-registered as the 44th
`NATIVE_CONTRACT_FILES` entry (:2-3) — the registry its own hash consumes.
`NATIVE_CONTRACT_FILES` (:69-135) is the ordered 66-entry tracked surface:
membership AND order are digest inputs, so any append, removal, or reorder moves
the contract hash the launcher freezes into the launch manifest and the
collector re-reads via `ufo status`. Mixed into the same array are the
seat-routing mirror `bundled/omp-seat-routing.json` (#41) — the compiled
seat-chain source, so a mid-round change to the global table's derived table is
contract drift even though no source file was touched — and the r02-H16
additions `distill.rs`/`admission.rs`/`build_json.rs` plus `native_epoch.rs`,
tracked so protocol-, CLI- and outcome-bearing drift cannot move silently. A
compile-time ratchet pins the length — `const _: () = assert!(
NATIVE_CONTRACT_FILES.len() == KNOWN_MIN_CONTRACT_FILES)` (:141-144) on the SAME
constant the runtime floor uses (:220). `validate_contract_registry_integrity_for`
(:222-252) refuses a short registry ("contract file registry regressed…"
:255-260), requires its own defining module, contains the 30
`REQUIRED_CRATE_MODULES` (:223-252), and runs `reject_duplicate_paths` (:282) on
both lists — a duplicated requirement would otherwise pass the containment loop
vacuously.

`native_contract_hash` (:198) is `contract_hash_and_config(root).0` (:339), which
runs registry integrity BEFORE the cache lookup so a warm cache can never bypass
the floor. The process cache `CONTRACT_HASH_CACHE` (:485) is keyed on the
`contract_surface_fingerprint` (:504) built from `file_fingerprint` (:487)
`FileFp` = (dev, ino, len, mtime, mtime_nsec, ctime, ctime_nsec) (:473) — ctime
is load-bearing, because an mtime-preserving rewrite still bumps ctime and this
hash exists precisely to detect contract-surface drift. Those (dev, ino) heads
also bind each production read to the inode the snapshot saw (a replace-and-
restore swap inside the read window is refused at open). Per entry the loop
hashes name + NUL + u64 LE length + bytes (:434-437), then re-checks the whole
surface and refuses with "contract surface changed during cold hash fill" (:445)
before publishing a cache entry; `assert_eq!(files_hashed,
NATIVE_CONTRACT_FILES.len(), "contract hash loop skipped registry entries")`
closes the loop (:448-452).

Mirror and route validation share the same bounded reads. `validate_project_mirrors`
(:520-546) byte-compares all 19 `PROJECT_OMP_MIRRORS` pairs and returns the
canonical bytes for the hash loop's reuse, refusing when a pair differs
("differs from canonical", :544) with both paths named plus the repair command
`sync-ufo-contracts.mjs`. `validate_omp_route_config` (:570) reads `.omp/config.yml`
under `MAX_CONTRACT_FILE_BYTES` 256 KiB (:19) and `config/ufo.json` under
`MAX_UFO_CONFIG_BYTES` 4 MiB (:45), then refuses any render mismatch through
`first_yaml_divergence` (:609) — equal `str::lines()` with unequal bytes reports
an explicit line-ending/trailing-newline difference instead of the false
`'<absent>' vs '<absent>'` pair. `MIN_CONTRACT_HEADROOM_BYTES` = 8 KiB (:41) is
the crate-scoped floor under that fuse (`native.rs` once sat 1800 bytes under it,
which would have made the hash refuse and killed `ufo status` → launcher and
collector before judgment). The test-only injection points
`COLD_FILL_MUTATION_HOOK` (:292) and `COLD_FILL_PRE_READ_HOOK` (:319) hit exactly
the fingerprint→read window the identity binding closes.

Probe: `NATIVE_CONTRACT_FILES` (crates/ufo-core-runtime/src/native_contract.rs:69-135) — the ordered 66-file digest surface, listing this module itself at #44.

## `native_scores.rs` (700 L) — proposal admission, per-seat scoring and the Pareto-integrated candidate on the native path

Baseline honesty is the first scoring decision: `clamp_honest_baseline_vector` (:21-28) clones the claimed map and rewrites it through the in-place clamp (:35), which returns a flag vector only when the caller passes `collect_flags` — the baseline path passes `false` and allocates no flag strings, because baseline flags are not on the wire contract. Every rewritten axis is flagged `dishonest_score_clamped:<axis>`; the rewrite test is an intentional exact float compare (the `float_cmp` lint is allowed on the line) OR'd with `!value.is_finite()`, so a non-finite claim is clamped and flagged instead of reaching `ParetoGate`.

`validate_proposals` (:60) opens with `nate_validate_proposal_producer_sequence` (:130-133): the producers must equal the completed frozen seats in roster order, and the miss refusal echoes both sequences ("proposal producer sequence must exactly match completed frozen seats; expected {…}, got {…}") — the all-proposal-failure refusal. Per proposal then: a repeated producer is refused; `nate_validate_proposal_record` (:177-203) requires `iteration == handoff.round`, the bare role in `specialist` (echoed through `echo_bounded`, never interpolated whole), a non-empty summary, and provenance derived from seat evidence rather than the body's own claims — `evidence_ids` must be exactly the agent's `job_id`, `source_route_key` the `correlation_group`, `pid` absent, `parent_id`/`proposal_id` the Main and agent ids, `refined` false — else "proposal '{}' provenance fields do not match its native seat evidence"; under `omp-native-v1` any non-empty additive field is refused by `frozen_profile_field` naming the v2 profile. `nate_validate_proposal_artifact_matches_body` (:267) then re-parses the cached artifact bytes into `Proposal` and refuses inequality with the body — "proposal '{}' differs from its hashed native artifact".

`nate_score_and_fingerprint_proposal` (:308) is the scoring core: validate the CLAIMED vector through `validate_score_vector` (:623) before clamping, clamp a copy in place for `gate.decide`, then fingerprint the trimmed claim, the raw claimed scores, the roster `assignment_scope` and the single `artifact_hash` (`sha256_json` over a private `Fingerprint`) — the first fingerprint keeps the slot in `first_by_fingerprint`, later ones carry `duplicate_of`. `claimed_axes` is the gate's own `improved` set on `Admit` (the same axes and deltas were just walked) and is recomputed only on the reject arms, so the two spellings cannot drift.

`validate_integrated_candidate` (:395) binds the candidate to the distiller: `candidate_digest` must equal `distiller.artifact_hash` and the cached bytes must re-parse byte-equal to `integrated_candidate` (:499-533) — deliberately no digest recompute, because the cache only holds bytes that already passed `validate_digest` and that equality is transitive. `nate_validate_integrated_survivor_set_and_digest` (:535-546) recomputes `hash_survivor_set` against `candidate_receipt.proposal_set_digest`, requires a non-empty duplicate-free survivor set in frozen roster order, and refuses a `duplicate_of` seat or a survivor whose advisory decision is not `Admit`. The effective vector then passes through `apply_subjective_argument_protocol`; an integrated malformed rejection returns early as an invalid handoff instead of an unreachable contribution arm; and `integrated_seat_admission_reason` (:468-497) maps the (advisory, selected, integrated) triple onto nine contribution reasons across ten arms — the tenth is the `unreachable!` guard — while `rejected_duplicate_fingerprint:<seat>` is minted by the caller before the match.

Probe: `integrated_seat_admission_reason` (native_scores.rs:468-497) — the ten-arm match whose `unreachable!` arm pins that an integrated `RejectMalformed` already returned as an invalid handoff.

## `native_plan_digest.rs` (809 L) — plan-binding recompute, lane health and the judge-emitted round digest

`validate_v2_fields` (:33) is the shape gate the strict v2 and the resilient profiles share (only the hop evidence differs between them): `plan_digest` goes through `validate_hash_shape`, `plan_path` through `validate_repo_relative_path`, `plan_wave_size == Some(0)` is refused as non-positive, and the two plan fields are one evidence surface in BOTH directions — "plan_digest requires plan_path: the plan artifact copy the digest recomputes from must ride the handoff" and "plan_path requires plan_digest: a plan artifact copy without its declared digest is unverifiable". `AcceptanceCriterion::AxisThreshold` entries must carry a non-empty axis and a finite `value`; the `Unmeasurable` string arm passes shape here (the mission-goal assessment, not this gate, is what treats it as unverifiable).

`validate_plan_binding` (:99-130) is the byte recompute: join `plan_path` beneath the canonical root, `canonicalize`, `approve_beneath_root`, then `read_bounded_core` at `MAX_EVIDENCE_FILE_BYTES`; the `sha256_hex` of those bytes must equal the declared digest ("plan_digest mismatch: handoff declares '…' but plan_path '…' recomputes '…'"). A round above 1 with no `plan_digest`+`plan_path` pair is invalid rather than unverifiable — a successor's chain checks would have no plan to read. The digest-bound artifact is authority for the declared wave size: an artifact `wave_size` disagreeing with the handoff copy is an invalid binding, an absent or null artifact field lets the handoff field stand alone, and `PlanBinding` (:94) returns `wave_size: artifact_wave_size.or(handoff.plan_wave_size)` plus the `predecessor_plan` the chain walk verified.

The successor half is `validate_successor_plan_binding` (:240-260), reading the artifact's `baseline_digest` and `predecessor_plan` through `plan_digest_field` (:217-230) — the field strips an optional `sha256:` spelling and passes the normalized value to `validate_hash_shape`, whose 80-byte echo bound is why that gate is reused here rather than interpolating an attacker-controlled plan field whole; the file's own justification is that the collector's `requirePlanDigest` refuses the same shape at collection, so a malformed declared digest can never bind. The walk over `.ufo/receipts` mirrors the collector's gates: a non-directory dirent is skipped without a count, a round-chain.json leaf that `symlink_metadata` calls non-regular or that canonicalizes outside the root is skipped *with* a count, and every consultable receipt is read at `MAX_EVIDENCE_FILE_BYTES` and parsed as JSON. Only the predecessor round may bind: each entry needs matching `round`, a `plan_digest` equal to the handoff's `predecessor_plan`, and one `successor_plan_digest` equal to this handoff's plan digest. More than one matching predecessor is ambiguous; no match reports the declared predecessor plus `seen`/`skipped`; and the matched receipt's `round_digest` must equal `baseline_digest`, closing the plan→predecessor→baseline triangle. On success the declared `predecessor_plan` is the returned owned string; for round 1 any predecessor spelling is invalid and absence returns `None`.

`native_lane_health` (:420-425) buckets every validated seat exactly once: a `lane_timeout_seats` member reads `lane_timeout`; a non-`Completed` agent reads `unavailable`; a completed seat whose continuity attempts include a `permits_advance()` capacity class reads `capacity`; a completed seat whose artifact bytes are all ASCII whitespace reads `quality_degraded`; else `ok`. Pre-spawn `dispatch_seats` are classified only when non-empty, and a member of a `correlated_unavailability_groups` set reads `unavailable` — the group's shared cause is the cause. `is_clean()` is the clean-round predicate the saturation demotion reads. `digest_reason_code` (:474-486) folds the contribution vocabulary onto the `loop_driver::RejectionReason` codes and answers `unknown` for anything unmapped — including `rejected_not_in_compatible_survivor_set` — never a guessed canonical reason.

`native_stop_evaluation` (:516-534) demotes a degraded zero-accept round with no pending refinement to `saturation_inconclusive` for both `Saturated` and `Running`; the pending-refinement arm bypasses the saturation block entirely and spells through the loop's one frozen map, `loop_driver::stop_evaluation_string`. `emit_native_round_digest` (:557-572) splits contributions on the literal `admitted_in_integrated_candidate`, shares one `axes_delta` map by clone except the last admitted entry which takes ownership (`shared_axes_delta.take()`), takes each entry's `proposal` reference from the contribution's first evidence digest (refusing a contribution with none), carries the `cost_ledger` round totals as `RoundDigestCost`, spells `mission_started_ms: None` because native emission runs no wall-clock mission budget, and maps any emission failure to an invalid handoff — contract evidence is not best-effort. The path `.ufo/rounds/<runId>/r<NN>-digest.json`, the schema `ufo-round-digest-v1` and the 32768-byte `ROUND_DIGEST_MAX_BYTES` bound live in `round_digest.rs`.

Probe: `native_stop_evaluation` (native_plan_digest.rs:516-534) — the demotion gate whose `let degraded = !lane_health.is_clean();` is the third conjunct of the run-logic §8 predicate.

## `native_launch.rs` (582 L) — effective-launch records bound to independently recomputed seats, plus the overlay digest recompute

The file is PC-C batch contract C1 / spec 12. `validate_effective_launch` (:365) is the phase entry, and the phase is OPTIONAL: its head is `let Some(records) = handoff.effective_launch.as_deref() else { return Ok(()); };`, so an absent field is a clean no-op, while the field's *presence* is refused upstream under the frozen `omp-native-v1` profile (`native_admission_rules.rs:69`; admitted at v2 and resilient, consistent with the pipeline note). When present it must cover every seat the transcripts already recomputed exactly once: `expected` is the `agents.by_seat` key set unioned with `agents.dispatch_seats` keys (never a separate coverage claim), keyed by `ids.logical_lane_id`. `natd_effective_launch_bind_ids` checks run/round binding and the `<run_id>/<role>/<instance>` recompute; `natd_effective_launch_cover_seat` (:117) refuses a key outside the topology ("which is not a topology seat") and a second record for the same seat ("effective_launch covers seat '…' twice"); the tail refuses any residue with "must cover every topology seat exactly once; missing: …" (:409).

Every claim is bound to evidence the record does not own. `natd_effective_launch_resolved_against_route` requires `resolved.requested.route` to equal the seat's frozen route and the requested effort to be `Some` exactly when the canonical primary declares a typed suffix; `resolved.resolved.model` must equal the spawned agent's `resolved_model` (and its effort the `route_effort_suffix` of `attempted_route`), or, for a seat with no agent (a dispatch attempt), the route's resolved form; `resolved.fallback_chain` must equal `route.requested_chain[1..]`. The route table itself is `agents.route_cache` — the contract-root seat-routing mirror — so a seat with no route in the *judged* root's mirror refuses instead of falling back to the compiled chain. `natd_effective_launch_cwd_policy_argv` then pins `cwd` (canonicalized to the contract root, refusal echo-bounded), non-empty `fallback_chain` entries, the chartered retry posture (`usage_aware_fallback == false`, `fallback_revert_policy == "never"`), the policy triple (`tools_allowed == ["*"]`, empty `tools_deny`, `auto_approve`), `behavior.advisor == "absent"`, non-empty `skill_autoload`, and `argv_sanitized` entries that are non-empty, within `MAX_DETAIL_TEXT_BYTES`, and free of `contains_sensitive_shape`.

`natd_effective_launch_role_card` requires `resolved.role_card` to name the project card for the seat's role (`project_role_card_path` → `agents/<role>.md`), reads it once per role through a `BTreeMap<NativeAgentRole, Option<String>>` memo, and compares against `sha256_prefixed` over the file under the canonical root; a card the tree does not carry memoizes `None`, so a record claiming a digest for an absent card dies rather than being waved through.

The rest of the file is the launch-overlay validator moved out of the non-member `lane_overlay.rs`. `validate_launch_overlays` (:539) checks each overlay digest with the single `sha256:<64hex>` grammar (`validate_prefixed_digest` over `is_sha256_hex`), refuses a repeated layer through a positional `seen[4]` (array order is deliberately not part of the wire contract), and requires the digest to recompute whenever the layer file resolves on disk. `read_resolvable_overlay_bytes` (:464) is fail-closed: only `NotFound` becomes `Ok(None)`; a directory/FIFO/device is `NotRegular` → "is not a regular file", growth past `LAUNCH_OVERLAY_FILE_BYTES` (4 MiB) and an identity mismatch each get their own literal. `resolve_overlay_layer_bytes` maps Project to `.omp/config.yml` and Global to the first existing `GLOBAL_OMP_CONFIG_CANDIDATES` entry under `global_home_value`'s HOME (a trim-empty HOME counts as unset); the Overlay and Cli layers are always `None`. Every label rides as `fmt::Arguments`, so the success path allocates no `String`.

Probe: `validate_effective_launch` (native_launch.rs:365-369) — the `pub(crate) fn` head through its `Result<(), NativeHandoffError>` return type, whose first body line makes the whole phase a no-op when the optional field is absent.

## `native_telemetry.rs` (1009 L) — the five-event telemetry grammar recomputed judge-side, plus the critical-seat timeout invalidation

`validate_telemetry` (:286) takes the handoff, the validated agents, the frozen `NativeDeadlines`, the recovery backpressure config, and the proposal `seat_rows`, and derives every expectation BEFORE it reads an event: `failed_by_seat` (the `Failed` agents), `expected_failures` (those keys chained with `agents.dispatch_seats` keys), `lane_timeout_seats` (:277 — a pure scan of `lane_timeout` events that routes evidence rules and never admits a seat on its own), `correlated_unavailability_groups` (:47), and `collect_capacity_lane_failures` → `expected_domain_cooldowns` (:217).

Each event first clears the universal checks: non-empty `event`/`status`/`detail`, `started_ms < ended_ms` (:320), detail within `MAX_DETAIL_TEXT_BYTES`, and no `contains_sensitive_shape` in the detail. `lane_failure` requires `status` "failed" and exactly one `seat_key`, then binds the seat either to a dispatch attempt (agent_id null, `route` equal to the attempt's requested route, group via `correlation_group_for`, interval equal to the attempt's, and `detail` byte-equal to the attempt's detail — a one-sided edit cannot pass, :400) or to a failed agent (identity and route equal to its frozen provenance, `correlation_group`, interval equal to the agent's). A duplicate row, or a seat carrying both `lane_failure` and `lane_timeout`, refuses as "a seat has one terminal cause". For an agent seat the detail is recomputed, never trusted from the producer's copy: the head `lane_failure class= seat= attempted=` is rebuilt from `classify_failure_fields` over the transcript's terminal error, the tail splits on the LAST ` id=`, and status/id must equal `clean_field_value`'s output — with a `clean_field_token` charset-class fallback for values whose producer `String()` coercion is not reproducibly replayable.

`lane_timeout` reuses that identity binding; its group is `CRITICAL_GROUP_PREFIX` + role name for the four critical seats (which the proposal roster does not carry) and the ordinary correlation group otherwise, and its `detail` must byte-equal `lane_timeout_detail` of the seat's attempted route, `deadlines.deadline_ms` of its role, and the observed `ended − started` interval — deadline tier and interval are already bound above, so the detail is evidence rather than a trusted string. `correlated_unavailability` requires status "failed", no agent_id, a group present in the expected multi-seat map, a multiset-equal seat set, and the min-start/max-end interval with the group's frozen route. `domain_cooldown` is refused outright under the frozen `omp-native-v1` profile (a v2+resilient event): status "observed", no agent_id, no route, a correlation_group naming the cooled domain, at least one seat, a detail byte-equal to `domain_cooldown domain= herd= threshold= window_ms=` (cleaned domain, RAW herd count, threshold and window from backpressure), the anchor's interval, and every seat key present in the producer's `topology_seat_index` roster. Any other event name is "unsupported native telemetry event".

The tail closes the sets: every expected failed seat must carry exactly one terminal event — the refusal lists missing `lane_failure` and missing `lane_timeout` separately, deciding timeout by `elapsed > deadline` — every expected correlated group and cooled domain must appear, and deadline reciprocity is enforced in both directions (`elapsed > deadline` with no timeout refuses; a timeout whose interval is within the deadline refuses), so a producer can neither claim nor hide a timeout. The return value is `expected_correlated.len()`. `reject_critical_lane_timeout` (:853) is the separate one-directional invalidation: the first `lane_timeout` seat whose role `is_critical()` ends the round for judgment ("D1a retry is a substrate action, so no candidate from this round is admissible"), because such an event is legal telemetry yet no candidate produced past a critical deadline is admissible. `unavailability_group` and `unavailability_group_for` hash `PREFIX || model || NUL || role` without materializing the preimage, the twin of the collector's `unavailabilityGroup`.

Probe: `validate_telemetry` (native_telemetry.rs:286-291) — the five-argument entry through its `Result<usize, NativeHandoffError>` return, which is the `expected_correlated.len()` the caller folds into the round's expected telemetry count.

Sources: `src/native.rs`, `src/native_schema.rs`, `src/native_header.rs`,
`src/native_contract.rs`, `src/native_admission_rules.rs`,
`src/native_plan_digest.rs`, `src/native_{agents,continuity,evidence,
transcript,seat_coverage,dispatch_topology,scores,telemetry,ledger,launch,
route,profile,epoch,seats,admission_text,digests,text}.rs`, `src/gate.rs`,
`src/axes.rs`, `src/state.rs`, `src/cost_ledger.rs`, `cli/main.rs:42-49,
247-355, 906-952`; `conformance/fixtures/native-handoff/handoff.json`.

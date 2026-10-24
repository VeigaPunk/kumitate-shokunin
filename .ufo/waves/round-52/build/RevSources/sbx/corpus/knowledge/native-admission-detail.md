# Native-judge support detail — seats, admission text, admission rules

`crates/ufo-core-runtime/src/`, rev `ee907f1cf` (2026-09-27). Condensed from the
round-6 scout map (`local://kumitate-r6-native-seats.md`), spot-verified.
Pipeline-level coverage lives in `native-judge-pipeline.md`; this note is the
support-family level.

## Attributions (where things actually live)

- Seat MODEL (`NativeAgentRole`, `NativeSeatKey`, `NativeProposalSeat`,
  `ALL_NATIVE_ROLES`, `is_critical`, `MANDATORY/OPTIONAL_PROPOSAL_ROLES`):
  `native_schema.rs:143-158,188-267,290-309`.
- Seat-key GRAMMAR + digests: `native_seats.rs` (230 L, NATIVE_CONTRACT_FILES
  idx 49) — `singleton_key`, `seat_label` (`{role}-{NN}` zero-padded) vs
  `seat_id` (`role:instance` unpadded — swap = silent grammar mismatch),
  `seat_label_matches` (byte twin), `canonical_run_tag`,
  `canonical_dispatch_name`, `dispatch_name_matches`, `seat_key_from_parts`,
  `parse_logical_lane_id`, `logical_lane_id_recomputes`, `proposal_row`,
  `proposal_seat_index` (sole caller `native.rs:530`), `proposal_row_in`,
  `proposal_agents` (sole caller `native_dispatch_topology.rs:418`),
  `correlation_group`, `correlation_group_for`.
- `classify_failure_fields` + `FAILURE_RULES` (first-match table): in
  `native_text.rs:96-198`, NOT `native_admission_text.rs` — the JS twin
  `classifyFailure` (`collect-omp-native-handoff-lib/base.mjs`) is
  byte-identical per the scout's read of both.
- JS-parity coercions (`js_string_simple`, `js_string_f64`, `clean_field_value`,
  `bounded_route_field`, `is_format_char`): `native_admission_text.rs`.
- Profile admission (`validate_profile`): `native_admission_rules.rs:45-131`,
  invoked FIRST in `validate_header` (`native_header.rs:243`) — the very first
  judge rule.

## Rules worth carrying

- `parse_logical_lane_id` is NOT a gate: it discards the run half and accepts
  `str::parse::<u8>`'s `+1`/`02` spellings; admission is
  `logical_lane_id_recomputes` (canonical all-digit, no leading zero). They
  must always be called as a pair (native_launch.rs:96 then :102).
- `is_critical` is `!is_proposal` only under frozen v1; code branches on
  `is_critical()` directly — never substitute.
- `correlation_group_for` signature order is (resolved_model, role, lineage)
  while its hash material order is (role, lineage, resolved_model) matching
  the JS `correlationGroup` — reading the JS signature as material order
  yields a wrong digest (native_seats.rs:218-230 vs ufo-native-names.mjs).
- `js_string_simple` returning `None` is load-bearing (falls back to
  charset-class checks), not an error — `native_telemetry.rs:498-507`.
- `js_string_f64_total`'s documented "Rust exponent spelling" comment is
  wrong: Rust Display NEVER emits exponent notation (measured). Blast radius
  bounded — the `None` arm covers those values; only an integration-test
  fixture builder sits on the arm.
- `clean_field_token` uses BYTE length — class predicate only, never a UTF-8
  length check.
- v1 refusal text ≠ v2 refusal text for the same logical condition
  (`frozen_profile_field` vs inline literal); `contains`-asserts must target
  the right arm (native_tests.rs:10945-10950 pins v1).
- `dispatch_attempts` `attempted=` detail rides raw (not cleanFielded) —
  parse it with `rsplit_once(" id=")`, not a tokenizer.

## ⚠ Cross-domain drift (reported, not owned)

`is_format_char` (native_admission_text.rs:52-61) enumerates exactly `\p{Cf}`,
matching its own doc — but the JS producer's widened screen
(`ufo-credential-screen.mjs:55-75`, `FORMAT_CHARS_RE`) strips
`\p{Cf} ∪ \p{Mn} ∪ 6 Zs separators` (NBSP etc.). A credential shape split by
U+00A0 (Zs) or U+0301 (Mn) makes the producer's rejoined scan fire while the
judge's `clean_field_value` strips-and-rejoins only Cf — so
`native_telemetry.rs:493-507` can refuse a producer-conformant legal handoff
(fail-closed, but a real interop break). UNPINNED on both sides: all
split-shape tests use Cf chars only (ufo-credential-redact.test.js:63,
native_tests.rs:7210). Fix belongs in ufo-fsd-alpha.

## `crates/ufo-core-runtime/src/native_admission_rules.rs` — three-arm profile dispatch, refusal vocabulary, ledger pre-pass

- At `crates/ufo-core-runtime/src/native_admission_rules.rs:45`, `validate_profile` matches `handoff.profile.as_str()` in three named arms with no wildcard fallthrough; any other spelling ends in `invalid("profile must be '<v1>', '<v2>', or '<resilient>', got '<other>'")` and never reaches a field check.
- The v1 arm is presence-policed per field — `plan_digest`, `acceptance_criteria`, `attempt_ledger`, `effective_launch`, `dispatch_attempts`, `cost_ledger`, `plan_path`, `plan_wave_size` — and the owner it names is the profile that introduced the field, not the profile it was read under.
- Those v1 checks run in source order, so a handoff carrying several later fields is refused on the first listed one (`plan_digest` before `plan_wave_size`); the refusal names one field, never a list.
- At `crates/ufo-core-runtime/src/native_admission_rules.rs:123`, `validate_attempt_ledger_shape` is called with `handoff.attempt_ledger.as_deref().unwrap_or_default()`, so an absent resilient ledger is an empty slice, not a refusal.
- Each v1 rejection routes through `crates/ufo-core-runtime/src/native_admission_rules.rs:19`, `frozen_profile_field`, whose text is `'<field>' is a '<owner>' field: profile '<carrier>' is frozen, so a handoff under it must not carry it` — field, owner, carrier in that order.
- The v2 arm refuses `attempt_ledger` and `dispatch_attempts` with its own two literals (the ledger arm reads `is a 'omp-native-resilient-v1' field: profile 'omp-native-v2' is strict and stays frozen, so attempt-ledger evidence cannot ride it`) before delegating to `validate_v2_fields`.
- The resilient arm runs `validate_v2_fields` first and only then `crates/ufo-core-runtime/src/native_admission_rules.rs:136`, `validate_attempt_ledger_shape`; the shape pass never binds a seat.
- Shape order inside that pass: the `NATIVE_TOTAL_SEATS_MAX` entry ceiling, exactly two `/` in `logical_lane_id`, prefixed `frozen_scope_hash` and `output_digest` around a bare `assignment_hash`, at least one attempt, `BTreeSet` dedup of `attempt_id`, `observed_effort` membership in `EFFORT_SUFFIXES` (or null), non-empty hop `route`/`reason`, and `final_attempt_id` naming one of that entry's own attempts.

## `crates/ufo-core-runtime/src/native_admission_text.rs` — sensitive gate, JS coercion bands, detail-tail parse

- At `crates/ufo-core-runtime/src/native_admission_text.rs:18`, `detail_contains_credential` is the literal half of the scan: `dashscope_api_key=`, `authorization:`, `bearer `, plus the `sk-`/`rk-`/`ak-`/`xai-` prefixes only when the following `[A-Za-z0-9_-]` run is 12+ chars, so `task-` and `disk-` never trip it.
- At `crates/ufo-core-runtime/src/native_admission_text.rs:49`, `contains_sensitive_shape` lowercases once with `to_ascii_lowercase` and tests in order: the credential half, the `api_key=`/`api-key=`/`apikey=`/`token=`/`xoxb-`/`aiza`/`private key` literals, then a compact JWT shape `eyj<base64url{4,}>.<base64url{4,}>.<base64url{4,}>`.
- At `crates/ufo-core-runtime/src/native_admission_text.rs:204`, `clean_field_value` is a fixed chain: `js_string_simple` coercion, sensitive-shape → fallback, `clean_field_token` pass-through, else filter to `[A-Za-z0-9_.:-]`, `take(64)`, empty → fallback; the coercion's `None` (unrepresentable shape) is not a refusal here — callers fall back to charset-class checks.
- At `crates/ufo-core-runtime/src/native_admission_text.rs:113`, `js_string_simple` admits strings verbatim, booleans, null/absent as empty, and integers with `unsigned_abs() <= 2^53-1`; every other number, unsafe integers included, routes to `crates/ufo-core-runtime/src/native_admission_text.rs:164`, `js_string_f64`.
- `js_string_f64` returns `None` outside `1e-6 <= |v| < 1e21` (the decimal-notation band), maps `-0` to `0`, and resolves exact `(2,3)` midpoint ties to the even digit; a `7` ending gets the defensive symmetric check.
- At `crates/ufo-core-runtime/src/native_admission_text.rs:230`, `bounded_route_field` screens sensitive shape first (`unknown`), then cuts the first 64 UTF-16 code units; a cut that splits a surrogate pair returns `None` rather than a lone surrogate.
- At `crates/ufo-core-runtime/src/native_admission_text.rs:292`, `dispatch_lane_failure_detail_tail` parses by ordered `strip_prefix`: `lane_failure class=`, typed failure, ` seat=`, split ` attempted=`, `seat_id_matches`, split ` status=`, exact requested-route equality, then `rsplit_once(" id=")`, which alone reports `MissingId`.
- At `crates/ufo-core-runtime/src/native_admission_text.rs:257`, `lane_timeout_detail` composes `lane_timeout seat={seatId} attempted={bounded route} deadline_ms={tier} elapsed_ms={observed}` and propagates the route field's `None` instead of inventing a spelling.
- `crates/ufo-core-runtime/src/native_admission_text.rs:269`, `DispatchLaneFailureDetailError` has exactly two variants, `Grammar` and `MissingId`; at `crates/ufo-core-runtime/src/native_admission_text.rs:277`, `seat_id_matches` rejects an empty instance and a multi-digit instance starting `0` before parsing.
- `crates/ufo-core-runtime/src/native_admission_text.rs:325`, `sha256_prefixed_matches_bare` compares `sha256:`-prefixed digests against bare hex by length and slice equality, so a prefixed value never accidentally matches.

## `crates/ufo-core-runtime/src/native_seats.rs` — label/id twins, canonical lane ids, correlation digest

- Two spellings never interchange: at `crates/ufo-core-runtime/src/native_seats.rs:25`, `seat_label` renders `{role}-{:02}` (1..=99 pad to two, 100..=255 widen to three), while at `crates/ufo-core-runtime/src/native_seats.rs:57`, `seat_id` renders the unpadded `role:instance` used inside `lane_failure`/`lane_timeout` detail.
- At `crates/ufo-core-runtime/src/native_seats.rs:14`, `singleton_key` pins the instance to `NonZeroU8::MIN` (1, never 0); at `crates/ufo-core-runtime/src/native_seats.rs:95`, `role_by_name` is a linear `ALL_NATIVE_ROLES` scan, so the only accepted spelling is the contract's kebab-case name.
- At `crates/ufo-core-runtime/src/native_seats.rs:33`, `seat_label_matches` is the allocation-free byte twin of the label (digits built into a 3-byte buffer, `width.max(2)`), so the ledger success path formats nothing.
- Dispatch identity is digest-derived: at `crates/ufo-core-runtime/src/native_seats.rs:61`, `canonical_run_tag` keeps `sha256_hex(run_id)[..8]`, and `canonical_dispatch_name` renders `u{tag}-{role}-{NN}`; at `crates/ufo-core-runtime/src/native_seats.rs:106`, `seat_key_from_parts` is the shared tail and returns `None` for an unknown role or a zero/non-`u8` instance, never a partial seat.
- `parse_logical_lane_id` splits `splitn(3, '/')` and deliberately discards the run half; admission is `crates/ufo-core-runtime/src/native_seats.rs:125`, `logical_lane_id_recomputes`, which rejects any instance segment starting `0` before comparing, and at `crates/ufo-core-runtime/src/native_seats.rs:144`, `dispatch_attempt_id_recomputes` accepts only the exact `/attempt-1` suffix by length-plus-slice compare, with no allocation.
- Roster lookups have two cost classes: `crates/ufo-core-runtime/src/native_seats.rs:159`, `proposal_row` linear-scans and raises `proposal seat '<label>' is not in the frozen roster`, `proposal_seat_index` builds the `BTreeMap` once for multi-row calls, and `proposal_agents` filters out `agents.dispatch_seats` before mapping (a missing roster row is therefore a dispatch-attempt seat, not a hole).
- At `crates/ufo-core-runtime/src/native_seats.rs:152`, `missing_proposal_seat` is the single refusal text both roster lookups share (`proposal seat '<label>' is not in the frozen roster`), so the two lookup paths cannot drift apart.
- At `crates/ufo-core-runtime/src/native_seats.rs:217`, `correlation_group_for` hashes the versioned, NUL-separated material `omp-native-correlation-v1\0{resolved_model}\0{role.name()}\0{assignment_lineage}` — pin truth at 31c465f1; `correlation_group` is the agent-carrying wrapper that supplies `agent.resolved_model` and `agent.seat_key.role`.

## `crates/ufo-core-runtime/src/native_text.rs` — failure-class table order and boundary predicates

- At `crates/ufo-core-runtime/src/native_text.rs:105`, `classify_failure_fields` short-circuits to `Unknown` when status, id, and message are all empty, then checks each table row's exact match against status or id BEFORE any substring work; the combined haystack is `status + ' ' + id + ' ' + message`, lowered once behind a cache.
- At `crates/ufo-core-runtime/src/native_text.rs:25`, `cached_json_lower` lowers each operand at most once per call; at `crates/ufo-core-runtime/src/native_text.rs:34`, `json_lower_operand_empty` decides the all-empty `Unknown` short-circuit without allocating.
- At `crates/ufo-core-runtime/src/native_text.rs:88`, `FAILURE_RULES` is eight rows in contract order — usage_limit/quota/tokens_exceeded, rate_limit/429, model_unavailable/unavailable, authentication/401, permission/403, timeout/deadline, invalid_request/400, tool_failure — and first match wins, so reordering is a behavior change.
- The table's code column is tested only through `contains_status_code`, so `429` matches as a standalone number while `1429` does not; the needle lists use plain `contains` on the already-lowered haystack.
- At `crates/ufo-core-runtime/src/native_text.rs:73`, `contains_status_code` rejects an adjacent ASCII digit on either side; at `crates/ufo-core-runtime/src/native_text.rs:79`, `contains_word` rejects `[A-Za-z0-9_]` on either side; both ride `crates/ufo-core-runtime/src/native_text.rs:50`, `contains_bounded`, which advances one byte per miss and requires an ASCII needle.
- The `ToolFailure` row carries one arm the table cannot express: it also fires on the word `process`. At `crates/ufo-core-runtime/src/native_text.rs:17`, `json_lower` is string → ASCII lower, number → `to_string`, everything else → empty.
- At `crates/ufo-core-runtime/src/native_text.rs:145`, `classify_failure` is the message-only wrapper that feeds `errorStatus`/`errorId`/`errorMessage` into the same three parameters.
- At `crates/ufo-core-runtime/src/native_text.rs:156`, `significant_digits` drops leading zeros before comparing spellings; at `crates/ufo-core-runtime/src/native_text.rs:175`, `is_exact_midpoint` proves the tie against the exact `{:.1100}` expansion instead of a float-epsilon test.

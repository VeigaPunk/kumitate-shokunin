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

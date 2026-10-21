R5-MAP members=4 symbols=18 anchors=18

# R5 internals map — native admission family (pin 31c465f1)

Read-only scout. Source: `/fast/scratch/kumitate-r36/src` at `31c465f15669f744848bd9f5d56191c5085670f7` (`git rev-parse HEAD` verified; tree not written). All line numbers are at that pin. Every anchor is FIDELITY-shaped: one `path:N` anchor per line, the paired symbol span ending 4 chars before it, and the symbol occurs on line N (verified by `grep -n` and a re-check script, see Commands). Symbols = 18, one anchor each, all 18 verified. Registry is `NATIVE_CONTRACT_FILES` 1-based (`native_contract.rs:46`, entries from :47): native_text 31st, native_seats 50th, native_admission_text 51st, native_admission_rules 53rd.

## 1. crates/ufo-core-runtime/src/native_admission_rules.rs — 243 L, 3 functions (all of them)

- `frozen_profile_field` (19) renders the typed rejection `'{field}' is a '{owner}' field: profile '{carrier}' is frozen, so a handoff under it must not carry it`; only the v1 arm calls it, eight times (49,56,63,70,77,84,91,98), each naming the later profile that owns the field.
- `validate_profile` (45-129) dispatches on the profile string: v1 rejects all eight additive fields; v2 rejects `attempt_ledger` and `dispatch_attempts` with its OWN inline literals (not `frozen_profile_field`) then runs `validate_v2_fields`; resilient runs `validate_v2_fields` then `validate_attempt_ledger_shape` on the ledger or `&[]`; any other string is one `profile must be …` invalid. Called first by `validate_header` (`native_header.rs:215`), so it outranks every other judge rule.
- `validate_attempt_ledger_shape` (136-242) caps entries at `NATIVE_TOTAL_SEATS_MAX`, then per entry requires exactly two `/` in `logical_lane_id` (run binding deferred), prefixed-hash shape for `frozen_scope_hash`/`output_digest`, bare-hash shape for `assignment_hash`, >=1 attempt, unique `attempt_id` set, non-empty `requested_route`/`observed_model`, `observed_effort` in `EFFORT_SUFFIXES` or null, optional `authorized_next_hop.{route,reason}` non-empty, and `final_attempt_id` among that entry's ids. Sole caller `validate_profile`:123; seat binding, chain authorization and effort-vs-route are `validate_attempt_ledger`'s job (`native_ledger.rs`).

## 2. crates/ufo-core-runtime/src/native_admission_text.rs — 330 L, 12 functions

- `contains_sensitive_shape` (49-100): one `to_ascii_lowercase` pass then `detail_contains_credential` (18) — literals `dashscope_api_key=`/`authorization:`/`bearer `, plus `sk-`/`rk-`/`ak-`/`xai-` prefixes counted with >=12 token chars — then seven literal shapes (`api_key=`, `api-key=`, `apikey=`, `token=`, `xoxb-`, `aiza`, `private key`) and a hand-rolled compact-JWT scan (`eyj` + >=4 b64url + `.` + `eyj` + >=4 + `.` + >=4). Shared gate at clean_field_value:206, bounded_route_field:231, native_launch.rs:333, native_seat_coverage.rs:198.
- `js_string_f64` (164-187) is defined only on `1e-6 <= |v| < 1e21`, returns `"0"` for ±0, otherwise takes Rust `Display` and — only when the last byte is `3` or `7` — swaps to the even neighbor and accepts it iff it re-parses to `v` and `is_exact_midpoint` confirms the tie (JS even-digit rule). Reached from `js_string_simple`:133.
- `clean_field_value` (204-222): `js_string_simple`, then sensitive-shape -> fallback, else token-class passthrough, else filter to `[A-Za-z0-9_.:-]` capped at 64 chars, empty -> fallback; `None` when `String()` is unprovable (caller then uses the charset-class arm, `native_telemetry.rs:485-501`).
- `bounded_route_field` (230-249): sensitive -> `"unknown"`, else copy the first 64 UTF-16 code units into a fixed `[u16;64]`; `String::from_utf16` failing (cut splits a surrogate pair) is the `None` arm; empty -> `"unknown"`.
- `dispatch_lane_failure_detail_tail` (292-322): literal prefix walk `lane_failure class=<typed> seat=<seatId> attempted=`, seat checked by `seat_id_matches` (277: role prefix, `:`, unpadded non-zero `u8`), route byte-equal to `requested_route`, remainder split by `rsplit_once(" id=")`; `DispatchLaneFailureDetailError` (269) separates `Grammar` from `MissingId`. Callers: `native_seat_coverage.rs:253`, re-export `native.rs:630`.

## 3. crates/ufo-core-runtime/src/native_seats.rs — 229 L, 19 functions

- `seat_label_matches` (33-51) is the allocation-free byte twin of `seat_label`: strip role + `-`, render the instance into `[b'0'; 3]`, compare the tail at width `max(digits,2)` — `role-1` is rejected where `role-01` passes, and 100..=255 render three digits. Hot on the cost-ledger compare (`cost_ledger.rs:161`).
- `seat_key_from_parts` (106-111): `role_by_name` (95, linear scan of `ALL_NATIVE_ROLES`) plus `instance.parse::<u8>()` through `NonZeroU8::new`; unknown role, zero and >255 give `None`, never a partial seat. Shared tail of the label, lane-id and cost-ledger grammars.
- `logical_lane_id_recomputes` (125-141): exactly two `/`, exact run-id half, instance segment that does NOT start with `0`, then parsed-key equality — the leading-zero rejection is what the pre-fix exact-string compare supplied. Always paired with `parse_logical_lane_id` (117), which discards the run half and accepts `+1`/`02`.
- `proposal_agents` (193-203) walks `proposal_seats` in roster order, skips keys in `agents.dispatch_seats` (`native.rs:574`, pre-spawn attempts), and maps the rest through `native_scores::seat` (665); a surviving row without an agent is an error, invariant established by `validate_dispatch_attempts`. Sole caller `native_dispatch_topology.rs:387`.
- `correlation_group_for` (217-229) hashes exactly `omp-native-correlation-v1\0{resolved_model}\0{role name}\0{assignment_lineage}` through `sha256_prefixed` (`proposal.rs:369` -> `sha256:<hex>`); the signature order (resolved_model, role, row) differs from material order only by the row field. The agent-less caller (`native_telemetry.rs:371`) passes the requested route's resolved model.

## 4. crates/ufo-core-runtime/src/native_text.rs — 184 L, 11 functions

- `contains_bounded` (50-68) is the shared byte scan: a needle counts only with a non-boundary byte on each side, a failed candidate advances one byte, and the needle must be ASCII so `index + 1` stays on a char boundary. Backs both producer-parity predicates (`contains_status_code`:73, `contains_word`:79).
- `FAILURE_RULES` (88-97) is the eight-row first-match table in fixed order — UsageLimit, RateLimit, ModelUnavailable, Authentication, PermissionDenied, Timeout, InvalidRequest, ToolFailure — each row a class, literal needles and an optional digit-guarded code (429/401/403/400). Order is the contract (cf-04/cf-09/cf-13/cf-30-cf-34/cf-38 vectors).
- `classify_failure_fields` (105-142): early `Unknown` when all three operands lower to `""` without allocating; per row, exact class-name equality on status/id first, then one lazily built `"status id message"` haystack (message lowered once into a cache) tested by needle containment, `contains_status_code` or — ToolFailure only — `contains_word` (`process`). First match wins; otherwise `Unknown`.
- `significant_digits` (156-166): drop everything before the first non-`0` ASCII digit, then keep every digit byte; an all-zero spelling yields an empty `Vec`.
- `is_exact_midpoint` (175-184): requires >=2 significant digits, expands `v.abs()` with `{:.1100}` (exact for dyadic in-band f64), trims trailing zeros, and requires the expansion's significant digits to equal `spelled[..k-1] ++ midpoint_tail` (`"25"` for (2,3), `"75"` for (7,8)).

## Candidate section skeletons (ready to append to corpus/knowledge/native-admission-detail.md)

```markdown
## `crates/ufo-core-runtime/src/native_admission_rules.rs` — profile admission internals

- `frozen_profile_field` at `crates/ufo-core-runtime/src/native_admission_rules.rs:19` names field, owning profile and frozen carrier in one typed rejection; only the v1 arm calls it.
- `validate_profile` at `crates/ufo-core-runtime/src/native_admission_rules.rs:45` runs before every other header rule; v2's two rejections use inline literals, not frozen_profile_field; resilient = v2 fields plus ledger shape.
- `validate_attempt_ledger_shape` at `crates/ufo-core-runtime/src/native_admission_rules.rs:136` defers run binding, effort-vs-route and hop continuity to validate_attempt_ledger in native_ledger.rs.

## `crates/ufo-core-runtime/src/native_admission_text.rs` — sensitive-shape and JS coercions

- `contains_sensitive_shape` at `crates/ufo-core-runtime/src/native_admission_text.rs:49` is the wider judge gate: credential needles, seven literal shapes, and a manual compact-JWT scan.
- `js_string_f64` at `crates/ufo-core-runtime/src/native_admission_text.rs:164` is defined only on 1e-6 <= |v| < 1e21 and repairs just the (2,3) and (7,8) exact-midpoint ties.
- `clean_field_value` at `crates/ufo-core-runtime/src/native_admission_text.rs:204` returns None exactly when String(value) is unprovable, never as an error.
- `bounded_route_field` at `crates/ufo-core-runtime/src/native_admission_text.rs:230` cuts 64 UTF-16 units, not chars; a split surrogate pair is unrepresentable and rejects the event.
- `dispatch_lane_failure_detail_tail` at `crates/ufo-core-runtime/src/native_admission_text.rs:292` parses the producer prefix without allocating it and distinguishes Grammar from MissingId.

## `crates/ufo-core-runtime/src/native_seats.rs` — seat grammar internals

- `seat_label_matches` at `crates/ufo-core-runtime/src/native_seats.rs:33` is the alloc-free twin of seat_label; it accepts only the padded spelling (role-1 fails, role-01 passes).
- `seat_key_from_parts` at `crates/ufo-core-runtime/src/native_seats.rs:106` is the shared grammar tail: u8 parse through NonZeroU8, so zero and >255 are None.
- `logical_lane_id_recomputes` at `crates/ufo-core-runtime/src/native_seats.rs:125` rejects leading-zero instance segments; parse_logical_lane_id does not, so keep the pair.
- `proposal_agents` at `crates/ufo-core-runtime/src/native_seats.rs:193` skips dispatch_seats and maps the rest through native_scores::seat; a surviving row without an agent is an error.
- `correlation_group_for` at `crates/ufo-core-runtime/src/native_seats.rs:217` hashes version tag, model, role and lineage NUL-separated into sha256:<hex>.

## `crates/ufo-core-runtime/src/native_text.rs` — failure classification internals

- `contains_bounded` at `crates/ufo-core-runtime/src/native_text.rs:50` is the one byte scan behind both status-code and word matching, with ASCII-needle and char-boundary invariants.
- `FAILURE_RULES` at `crates/ufo-core-runtime/src/native_text.rs:88` is an eight-row first-match table; order is the contract, pinned by the cf order vectors.
- `classify_failure_fields` at `crates/ufo-core-runtime/src/native_text.rs:105` skips all allocation for empty operands and builds the haystack once; only ToolFailure also matches the word process.
- `significant_digits` at `crates/ufo-core-runtime/src/native_text.rs:156` drops everything before the first non-zero digit; an all-zero spelling has no significant digits.
- `is_exact_midpoint` at `crates/ufo-core-runtime/src/native_text.rs:175` expands the dyadic value to 1100 fractional digits and compares against spelled[..k-1] plus the 25 or 75 tail.
```

## Cross-check against corpus/knowledge/native-admission-detail.md (69 L, rev ee907f1cf)

Already carried (do NOT restate): family-level attributions, label-vs-id swap warning, `parse_logical_lane_id` non-gate pairing, correlation material-order trap, `js_string_simple` None load-bearing, `js_string_f64` exponent-comment error, `clean_field_token` byte length, v1-vs-v2 refusal-text split, raw `attempted=` parsing. The skeletons add per-symbol algorithms and error literals, caller sets (native_header.rs:215, native_seat_coverage.rs:253, native_dispatch_topology.rs:387, native_telemetry.rs:371), registry positions, gate ordering, and the deferred-binding boundary.

Stale at the pin (observed; do not copy forward):
- `is_format_char` no longer exists (`grep -rn is_format_char` over *.rs/*.mjs/*.js: no hits), so the note's anchor at native_admission_text.rs lines 52-61 now lands inside `contains_sensitive_shape`'s JWT arm.
- The note's drift claim "JS producer widens to Cf ∪ Mn ∪ Zs" is stale: at the pin `scripts/ufo-credential-screen.mjs:61` is `const FORMAT_CHARS_RE = /\p{Cf}/gu;` (Cf only; `scripts/probe-redact.mjs:45` and `scripts/probe-ufo-route-health.mjs:227` are Cf-only too). Both sides are Cf-only at 31c465f1; do not re-import the drift section.
- Line drift: classify_failure_fields lines 96-198 -> 105-142; validate_profile lines 45-131 -> 45-129; native_seats 230 L -> 229 L; telemetry arm lines 493-507 -> 485-501.

## Observed / inference / unknowns

Observed: line numbers, bodies, caller greps, registry indices, file lengths, pin rev, and 18/18 anchor-to-line checks.
[INFERENCE] FIDELITY pairing of each skeleton line: symbol span ends 4 chars before the anchor, no span follows the anchor within 14 chars; not exercised by the arm here.
Unknown: whether the widened-screen claim was true at ee907f1cf (not checked out here); whether a `##` heading appended after the existing note prose is accepted by the registry gate's section parse (contract says yes; unverified).
Commands (all read-only in /fast/scratch/kumitate-r36/src): `git rev-parse HEAD`; `wc -l` (243/330/229/184); `grep -nE 'fn …'` per file; `grep -rn '\b<symbol>\b' crates/ufo-core-runtime/src/` for callers; `grep -rn is_format_char . --include=*.rs --include=*.mjs --include=*.js` (no hits); `grep -n FORMAT_CHARS_RE scripts/ufo-credential-screen.mjs` (:61); `awk` over native_contract.rs:47-108. No tool installs, no builds, no writes outside this report.

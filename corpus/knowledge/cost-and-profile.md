# `cost_ledger.rs` + `execution_profile.rs` — the two judge-side ledgers

`crates/ufo-core-runtime/src/`, rev `ee907f1cf`. Condensed from the round-6
scout map (`local://kumitate-r6-cost-ledger.md`), spot-verified.

## `cost_ledger.rs` (737 L) — wire types + admission validator

Handoff field `cost_ledger` (`native_schema.rs:508`, optional, refused under
frozen v1). Types: `NativeUsageSource` ∈ {transcript, session_total,
unavailable} (typed, never fabricated zeros); `NativeTokenTotals`
{tokens_in, tokens_out} u64; `NativeCostSeat` {seat `<role>-<NN>`, route,
tokens, usage_source, usd: Option}; `NativeCostLedger` {seats, round_totals,
mission_cumulative, usd_estimate, degraded}. All `deny_unknown_fields`.

Judge call sites (native.rs judgment order):
1. `:481` `require_cost_ledger_when_budgeted` — `tokensPerMission > 0` +
  absent ledger → invalid (v1 trap: v1 forbids the field, so v1 + positive
  budget + absent ledger can never satisfy; a present ledger already died at
  `validate_profile`).
2. `:490` profile bounds (`NativeProfileBounds::from_parsed` — lives in
   `native_profile.rs`, not execution_profile.rs).
3. `:519-527` `validate_cost_ledger` — seat pass → lineage walk → totals pass.
4. `:193-198` `mission_cumulative.tokens_in + tokens_out` →
   `round_stop_outcome` (state.rs:380-399): `tokensPerMission > 0` &&
   cumulative ≥ it → `HonestyBrake` — the ONLY cost-derived stop.
   `degraded`/`usd`/`usd_estimate` never reach a stop.
5. `:401` ledger echoed into the verdict.

Validation detail:
- Seat pass (:137-256): label parses via `seat_key_from_parts`+
  `seat_label_matches`; membership in topology seats; no dup coverage; role
  must bind in the CONTRACT-ROOT route table (`agents.route_cache` ←
  `native_route::contract_role_table(canonical_root)` — never the compiled
  catalog); `seat.route === route.requested`; `checked_add` overflow refuses;
  usd rules — `unavailable` ⇒ usd null ("a price without observed usage is
  fabricated"), else `usd` non-null iff route ∈ rateCard SET (rate VALUES are
  shape-checked then discarded — the judge never recomputes a price).
- Lineage walk (:405-717): `.ufo/receipts/*/round-chain.json` (dirent+leaf
  gates, first `plan_digest` wins, dup digests recorded) → predecessor
  `plan_digest` hops (cycle-guarded) → `prior_handoff_bytes` scans
  `.ufo/native-trials/*/handoff.json` → `sum_prior_totals` cumulative-first
  with `round_totals` fallback. Present-but-unreadable stays countable
  (`skipped`), distinct from absent. A prior JSON number outside u64 → typed
  refusal (a silent drop would zero the prior).
- Totals pass (:259-372): coverage == expected seats; round_totals == seat
  fold; cumulative ≥ round; prior > 0 ⇒ cumulative == round + prior EXACTLY
  (skipped-priors suffix in the refusal); `usd_estimate` must be BIT-EQUAL
  (`to_bits`) to the seat-order `f64` fold when any seat is priced;
  `degraded` must equal `unavailable * 5 > seats.len()` (>20% rule —
  recompute-only, never a stop input).
- Fail-open parity: `prior == 0` skips the exact-cumulative check (collector
  parity) — the brake depends on lineage artifacts being discoverable.
- Live root (`config/ufo.json`: `tokensPerMission = 0`, no `rateCard`) → the
  module is inert except present-ledger validation, and every `usd` must be
  null.
- Lineage reads are root-bound WEAKER than the sibling
  (`native_plan_digest.rs:302-320` adds canonicalize + inode binding);
  exploitability [uncertain] — `.ufo/receipts` is producer-controlled inside
  the contract root.
- All refusals are `NativeHandoffError::Validation` → CLI exit 2
  kind `validation`.

## `execution_profile.rs` (689 L) — route catalog + FailureClass

Premise correction: does NOT define the profile trio or `extends` — it is the
canonical typed model-route catalog for the seven substrates plus the
`FailureClass` capacity authority. Profile names live in `native_schema.rs`
(:23/:34/:46); admission in `native_admission_rules.rs:45-131`; `extends`
one-hop in `native_profile.rs:21-93`; bounds in `native_profile.rs:187-198`.

- `Substrate` :12-20 {Omp,Kimi,Codex,Cursor,Opencode,Grok,Devin};
  `AgentRole` :71-86 (14 roles) + `RoleClass`
  {Depth,Volume,Review,Empirical,Execution}; `ReasoningEffort`
  {low,medium,high,xhigh,max}; `ServiceTier` :173 is an EMPTY enum — no
  construction sites, `service_tier` permanently `None`, hash-bound.
- `RouteSpec` not `Deserialize` — the catalog is authoritative, never
  wire-fed; `reject_gemini` bans Gemini with `google-antigravity` as the
  named operator exemption.
- `ExecutionProfile` + `canonical(substrate)` + `canonical_cached` +
  `profile_hash` (serialization-shape-bound — unset fields hash as `null`,
  "do not delete" is explicit).
- `canonical_chain` per substrate; `Omp` delegates to the GENERATED
  `omp_role_chains.rs` (`include!` from OUT_DIR); the compiled catalog is the
  DISPATCH-time authority — the judge's route authority is the contract-root
  mirror (`contract_role_table`).
- `FailureClass` :402-412; **`permits_advance` at `:448` (the `:447` cite in
  older corpus lines is the `#[must_use]` attribute)** — capacity =
  {usage_limit, rate_limit, model_unavailable}; `is_temporary` :458 =
  {timeout, tool_failure, unknown} → bounded same-route retry, never a hop;
  `is_authorization` :466 = {authentication, permission_denied} →
  `authorization_unavailable` immediately. `next_route` :475-486 — same
  substrate+role, `index+1`, chains never wrap.
- Consumers of `permits_advance`: `l3_swarm.rs:447,551`,
  `loop_driver_dispatch.rs:320`, `native_continuity.rs:170`,
  `native_plan_digest.rs:435,461`, `native_telemetry.rs:148,159`,
  `native_transcript.rs:512`; attempt-ledger `typed_failure` is written only
  as `capacity:<class>` for the three capacity classes (native_schema.rs:346).

## Traps

- `:447` vs `:448` — the `#[must_use]` line vs the `fn` signature line.
- `usd` arithmetic is never recomputed — membership + finite + bit-equal fold
  is the whole contract.
- `degraded` mismatch IS a refusal, but the flag never feeds any stop.
- Seat-sums use `checked_add`; the cumulative expectation uses
  `saturating_add` — a forged near-u64::MAX pair saturating to match is a
  conceded edge (comment :694-698).

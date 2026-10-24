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
1. `:83` `require_cost_ledger_when_budgeted` — `tokensPerMission > 0` +
  absent ledger → invalid (v1 trap: v1 forbids the field, so v1 + positive
  budget + absent ledger can never satisfy; a present ledger already died at
  `validate_profile`).
2. `:490` profile bounds (`NativeProfileBounds::from_parsed` — lives in
   `native_profile.rs`, not execution_profile.rs).
3. `:98` `validate_cost_ledger` — seat pass → lineage walk → totals pass.
4. `:193-198` mission_cumulative.tokens_in + tokens_out →
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
  `omp_role_chains.rs` (`build.rs:117` → OUT_DIR; `include!`d at
  `execution_profile.rs:572`); the compiled catalog is the
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

## Addendum — current source at origin HEAD `964f443e` (2026-10-15)

The three member sections below read the read-only origin
`/home/vgpnk/Projects/ufo-fsd-alpha` at
`964f443ee53df0ce06bd689af01f0dea031b01f9`, all three basenames under
`crates/ufo-core-runtime/src/`. Source inspection, not tests executed — no
upstream Rust test was run for this note. Everything above stays pinned at
`ee907f1cf` and is NOT repinned, including the premise-correction cites
`native_profile.rs:21-93`/`:187-198` (current: resolver `native_profile.rs:21-89`,
bounds parser `native_profile.rs:175-181`) and the `execution_profile.rs:572`
`include!` cite (current: `execution_profile.rs:548`). All own-file anchors
below are fully qualified against the current source.

## `native_profile.rs` (276 L @ `964f443e`) — extends resolver + deadline table + bare selector

`native_profile.rs:1-2` calls the file "Pure code motion from `native.rs`
(r14 cut 3); no behavior change"; `native_profile.rs:3` records it as a
`NATIVE_CONTRACT_FILES` entry "(registered as the 48th)", kept under the
"256 KiB contract-file ceiling" (`native_profile.rs:91-94`). Three jobs:

- **extends resolver.** `native_profile_entry` (`native_profile.rs:21-89`)
  resolves `nativeProfiles.<profile>`, following `{"extends": "<sibling>"}`
  exactly one hop. Missing block and missing entry share one message,
  `nativeProfiles.{profile} is required` (`native_profile.rs:28-32`); an
  entry with no `extends` is self-contained and returns only after
  `crate::validate_native_recovery(entry_value, profile)?`
  (`native_profile.rs:36-39`). A pointer fails closed on: non-string target
  (`native_profile.rs:40-44`); any inline key besides `extends`/`note`, where
  the message distinguishes `extends conflicts with inline key '{key}'` when
  the sibling defines the same key from `cannot carry inline key '{key}'`
  otherwise — both end `the pointer carries no values of its own`
  (`native_profile.rs:46-63`); self-cycle (`native_profile.rs:64-68`);
  missing or non-object target (`native_profile.rs:69-79`); a target that
  itself extends — `must resolve exactly one hop, but
  'nativeProfiles.{target_name}' extends again (cycle or multi-hop chain)`
  (`native_profile.rs:80-86`). Recovery validation then runs on the RESOLVED
  target (`native_profile.rs:87`), so a pure pointer cannot dodge it.
- **deadline table.** `NativeDeadlines` is six `u64` tiers —
  `orchestrator_ms, planner_ms, thinking_ms, distiller_ms, mechanical_ms,
  labrat_ms` (`native_profile.rs:105-112`) — whose `_ms` wire suffix "renaming
  would break serde" (`native_profile.rs:123`). `from_profile_entry` requires
  `nativeProfiles.{profile}.deadlines` (`native_profile.rs:218`) and each
  tier as a positive `as_u64` or `must be a positive integer`
  (`native_profile.rs:250`). `deadline_ms` (`native_profile.rs:240-257`)
  is an exhaustive match on `NativeAgentRole`: Main/Planner/Distiller/Labrat
  get dedicated tiers; Critic|Connector|Revenger|Reviewer|Sentinel →
  `thinking_ms`; Executor|MutationTester|Scout|Simplifier|Scribe →
  `mechanical_ms` — so "a new role cannot inherit a silent default bound"
  (`native_profile.rs:236-239`).
- **bounds + bare selector.** `NativeProfileBounds { deadlines, backpressure }`
  (`native_profile.rs:185`) parses via `from_parsed`
  (`native_profile.rs:175-181`). Backpressure reads without cloning:
  `backpressure_from_profile_entry` (`native_profile.rs:123-133`) takes only
  the `recovery.backpressure` subtree and `unwrap_or_default()`s, because
  `validate_native_recovery` closed the recovery object first
  (`native_profile.rs:138`); `backpressure_from_json_value`
  (`native_profile.rs:139-170`) accepts exactly the four keys
  `domainCooldownMs|herdThreshold|herdWindowMs|maxConcurrentPerDomain`
  (`native_profile.rs:148`) and yields `None` on any unknown key or
  mistyped present field (`native_profile.rs:149-151`) — it "Matches
  `serde_json::from_value::<BackpressureConfig>` on the success/failure
  envelope" (`native_profile.rs:136-138`), with defaults `60_000/3/30_000/0`
  (`native_profile.rs:164-168`). omp_bare_selector
  (`native_profile.rs:260-276`) demands a typed `provider/model:effort`
  route: parse failure and `effort.is_none()` share the one message `OMP
  route must be a typed provider/model:effort selector: {route}`
  (`native_profile.rs:261-270`) — effort PRESENCE gates, its value does not;
  the function returns `resolved` (`native_profile.rs:275`), "Deliberately
  laxer than the producer regex (sync-ufo-contracts.mjs ompBareSelector)"
  (`native_profile.rs:271-274`) since the allowlist and model charset stay
  with `contracts:check`.

The test-only loaders (`native_profile.rs:183-196`, `native_profile.rs:231-234`)
read `config/ufo.json` via `read_file_bounded` under `MAX_UFO_CONFIG_BYTES`
(`native_profile.rs:9-11`, `native_profile.rs:187`) and add
`validate_native_budgets` + `validate_native_membrane` before `from_parsed`
(`native_profile.rs:193-194`).

## `cost_ledger_validation_tests.rs` (306 L @ `964f443e`) — lineage-tie pins

Four tests, mounted at the CRATE ROOT (`lib.rs:1174-1176` —
`#[cfg(test)] #[path = "cost_ledger_validation_tests.rs"] mod
cost_ledger_validation_tests;`); `use super::*;`
(`cost_ledger_validation_tests.rs:155`) reaches `validate_cost_ledger` +
`require_cost_ledger_when_budgeted` through the crate-root re-exports
(`lib.rs:75-78`). Fixtures make only ledger semantics decide the verdict:
`main_seat` = `NativeAgentRole::Main` + `NonZeroU8::MIN`
(`cost_ledger_validation_tests.rs:34`); `ledger_for_seat` binds the seat
route from `role_route(seat_key.role).expect("route").requested`
(`cost_ledger_validation_tests.rs:28`) with `usage_source:
NativeUsageSource::Transcript`, `usd: None`, `degraded: false`,
`usd_estimate: None` (`cost_ledger_validation_tests.rs:57`);
`shell_handoff` wraps it in a full handoff — `profile:
NATIVE_HANDOFF_PROFILE_V2`, round 2 (`cost_ledger_validation_tests.rs:51-53`),
`provenance: CoreRuntimeProvenance::paper_parity()`
(`cost_ledger_validation_tests.rs:103`), `cost_ledger: Some(ledger)`
(`cost_ledger_validation_tests.rs:113`). `write_prior_lineage`
(`cost_ledger_validation_tests.rs:101-140`, "Mirror
`native_tests::write_chain_receipt`" `cost_ledger_validation_tests.rs:109`)
materializes exactly what the lineage walk discovers:
`.ufo/native-trials/predrun1/handoff.json` with `round_totals` 50/50 plus
optional `mission_cumulative` (`cost_ledger_validation_tests.rs:38`),
and `.ufo/receipts/predrun1/round-chain.json` keyed by `plan_digest` with
`handoff_digest = sha256_hex` of those bytes
(`cost_ledger_validation_tests.rs:123-139`). Every test drives the current
dispatcher's tie sequence — seats pass, then
`prior_mission_totals(contract_root, predecessor_plan)`, then totals pass
(`cost_ledger.rs:104-113`).

- `validate_cost_ledger_rejects_fabricated_mission_cumulative_with_prior_lineage`
  (`cost_ledger_validation_tests.rs:142-180`): prior `500/300` is
  discoverable yet the ledger reports cumulative == this round's `100/100`
  → the refusal must contain `mission_cumulative does not continue the
  predecessor lineage` (`cost_ledger_validation_tests.rs:174-177`) AND name
  the expected sums `600`/`400` (`cost_ledger_validation_tests.rs:178-179`)
  — the error spells the arithmetic, not just the failure.
- `validate_cost_ledger_accepts_mission_cumulative_continuing_prior_lineage`
  (`cost_ledger_validation_tests.rs:182-211`): `600/400` admits.
- `validate_cost_ledger_prior_lineage_falls_back_to_prior_round_totals`
  (`cost_ledger_validation_tests.rs:213-276`): a prior with NO
  `mission_cumulative` — "a round predating the cumulative ledger format"
  (`cost_ledger_validation_tests.rs:99-100`) — still contributes its
  `round_totals`, since "otherwise every handoff can under-report the
  lineage and escape the honesty brake"
  (`cost_ledger_validation_tests.rs:219-221`): `150/150` admits
  (`cost_ledger_validation_tests.rs:230-247`); `200/200` — ABOVE the
  discoverable sum — rejects naming `(150, 150)`
  (`cost_ledger_validation_tests.rs:261-275`), pinning that the tie is
  exact equality, not `≥`, and that "deleting the round_totals fallback
  zeroes the prior contribution and this rejection never fires"
  (`cost_ledger_validation_tests.rs:249-251`).
- `require_cost_ledger_when_budgeted_names_v1_profile_trap`
  (`cost_ledger_validation_tests.rs:278-306`): `NativeBudgets {
  tokens_per_mission: 1, rate_card: None }`
  (`cost_ledger_validation_tests.rs:280-283`) against a
  `NATIVE_HANDOFF_PROFILE` (v1) handoff whose `cost_ledger: None` overrides
  the V2 shell via struct-update
  (`cost_ledger_validation_tests.rs:284-296`). The refusal must contain all
  of `cost_ledger is required when budgets.tokensPerMission > 0`
  (`cost_ledger_validation_tests.rs:360`), `v1 profile trap`
  (`cost_ledger_validation_tests.rs:304`) and `omp-native-v1 forbids
  cost_ledger` (`cost_ledger_validation_tests.rs:305`) — the trap named in
  this note's header prose is under active assertion.

Scope limit: every `validate_cost_ledger` call passes `rate_card:
None` (`cost_ledger_validation_tests.rs:165-171`, `:203-210`, `:240-247`,
`:262-269`), so the seat-pass usd rules, the bit-equal `usd_estimate` fold
and the `degraded` recompute are NOT exercised by this file.

## `execution_profile_tests.rs` (560 L @ `964f443e`) — catalog + FailureClass pins

23 tests plus the `minimal_valid_chains` fixture
(`execution_profile_tests.rs:451-456`), mounted as the `execution_profile.rs`
test module (`execution_profile.rs:654-656` — `#[cfg(test)] #[path =
"execution_profile_tests.rs"] mod tests;`). `use super::*;`
(`execution_profile_tests.rs:1`) reaches the module-private `route()`
constructor (`execution_profile.rs:517-520`) and `generated_omp_steps` from
the generated table (`include!` at `execution_profile.rs:548`).

Provider/model literals below describe assertions in this source revision,
not the current round's role assignments; the host route table remains the
only dispatch-routing authority.

- **Identity + coverage.** `Substrate::ALL.map(Substrate::as_str)` is
  exactly `["omp", "kimi", "codex", "cursor", "opencode", "grok", "devin"]`
  (`execution_profile_tests.rs:5-8`) and equals
  `crate::config::SUPPORTED_SUBSTRATES` (`execution_profile_tests.rs:9-12`);
  every substrate parse/serde round-trips (`execution_profile_tests.rs:13-19`);
  `"gemini".parse::<Substrate>()` dies with `unsupported substrate 'gemini'`
  (`execution_profile_tests.rs:21-24`). Every canonical profile covers every
  `AgentRole::ALL` with a non-empty chain whose routes never drift substrate
  or role (`execution_profile_tests.rs:27-40`). The role-class partition is
  asserted POSITIONALLY against `AgentRole::ALL` — a 14-slot table in which
  moving Critic off `Volume` "fails here"
  (`execution_profile_tests.rs:42-66`).
- **Provider-order pins per substrate.** Opencode thinking roles lead
  `"openai"`, mechanical lead `"xai"`, with the expected provider "spelled
  per role — computing it from `thinking_role` itself would let a mutant
  shift the expectation along with the behavior"
  (`execution_profile_tests.rs:68-100`); Codex depth is `["gpt-5.6-sol",
  "gpt-5.6-luna"]`, volume the reverse (`execution_profile_tests.rs:102-117`);
  Grok pins `chain[0].model() == "grok-4.5"`, `chain[1].model() ==
  "grok-4.6"`, every route `"xai-oauth"` (`execution_profile_tests.rs:119-128`);
  host purity — every OMP route `route.provider() != "chatgpt"`
  (`execution_profile_tests.rs:137-140`), cursor Scout tail
  `"composer-2.5-fast"`, opencode Judge head `openai`/`gpt-5.6-sol-fast`,
  kimi Executor head `"kimi-code/kimi-for-coding-highspeed"`
  (`execution_profile_tests.rs:141-159`).
- **Generated-SSOT conformance instead of literals.**
  `omp_chains_come_from_generated_ssot` (`execution_profile_tests.rs:162-215`)
  zips each compiled chain against `generated_omp_steps(role)`
  (`execution_profile_tests.rs:171-179`), gates effort route-generically
  (`matches!(suffix, "low" | "medium" | "high" | "xhigh" | "max")` or bare,
  `execution_profile_tests.rs:184-190`), refuses duplicate/wrapping bare
  steps (`execution_profile_tests.rs:22`) and any `"gemini"` provider
  (`execution_profile_tests.rs:210-213`) — deliberately route-generic so a
  re-chartered table "compiles without a test edit"
  (`execution_profile_tests.rs:206-209`).
  `only_the_omp_profile_admits_the_opencode_go_hop`
  (`execution_profile_tests.rs:217-269`): `uses_opencode_go` holds iff
  `substrate == Substrate::Omp` (`execution_profile_tests.rs:231`); the
  m_zfl cascade (zai → charm-hyper → opencode-go → devin, on
  Distiller/Labrat/MutationTester/Revenger) and the m_flash cascade
  (charm-hyper → alibaba-token-plan → opencode-go → devin, on Simplifier)
  all pin `"opencode-go"` at chain index 2
  (`execution_profile_tests.rs:231-268`); Scout and Executor ride exactly
  the 2-step `cursor` → `stepfun` pin, marker-free
  (`execution_profile_tests.rs:248-260`).
- **FailureClass capacity authority.** Only `UsageLimit|RateLimit|
  ModelUnavailable` advance — one step only
  (`next_route(chain, &chain[0], failure) == Some(&chain[1])`) and from the
  last route `None`, the no-wrap invariant
  (`execution_profile_tests.rs:286-308`). Cross-substrate/cross-role chain
  members don't advance, and a `current` absent from the chain returns None
  "via `position()`" (`execution_profile_tests.rs:307`). The 9-class
  matrix pins `(permits_advance, is_temporary, is_authorization)` for every
  variant (`execution_profile_tests.rs:276`) — for `Unknown`'s bounded
  same-route retry and `PermissionDenied`'s `authorization_unavailable`
  reporting, which have no driver/host observer, "this table is their only
  pin" (`execution_profile_tests.rs:341-346`).
- **Gemini typed boundary.** `RouteSpec::try_new` returns
  `ProfileError::GeminiBanned(_, _)` for `google-ai`, `GOOGLE-AI`, the
  model needle `("cursor", "Gemini-3-pro")`, `google_gemini` and `bard`
  (`execution_profile_tests.rs:370-384`); `"google-antigravity"` is admitted
  but the exemption is "provider-exact" — the case variant
  `Google-Antigravity`, the `google-antigravity-x` suffix, and a gemini
  needle on a non-exempt provider all still die
  (`execution_profile_tests.rs:385-412`).
- **Hash + cache.** `profile_hash` is deterministic, `.len() == 71`
  (`execution_profile_tests.rs:415-421`), changes under
  `with_planner_policy(PlannerPolicy::KimiK3)` and across substrates
  (`execution_profile_tests.rs:404`); `canonical_cached` matches the
  uncached profile and reuses one allocation — `Arc::ptr_eq`
  (`execution_profile_tests.rs:415`); `canonical_profile_hash` equals the
  cached profile's hash (`execution_profile_tests.rs:442-449`).
  `planner_route()` is `None` for all seven canonical profiles — the planner
  is admitted only through an explicit policy, then yields the cross-substrate
  Kimi route `kimi-code/k3` (`execution_profile_tests.rs:271-284`).
- **`validate()`/`try_new` message discrimination.** Present-but-empty chain
  → `ProfileError::InvalidRoute("route chain for Scout is empty")`,
  "empty chain must not reuse MissingRole"
  (`execution_profile_tests.rs:458-474`); removed chain →
  `MissingRole(AgentRole::Scout)` (`execution_profile_tests.rs:525-540`);
  substrate drift names `"substrate drift"` + `"index 0"` + `"xai/grok-a"`
  (`execution_profile_tests.rs:476-496`), role drift names `"role drift"`
  (`execution_profile_tests.rs:542-560`); blank identities are refused with
  `"provider and model must be non-empty"` while padded `" chatgpt "` /
  `" gpt-x "` trim to a valid route (`execution_profile_tests.rs:498-523`).

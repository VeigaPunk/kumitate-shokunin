# `distill.rs` + `l3_swarm.rs` — dedupe machinery and the shelved L3 surface

## `distill.rs` (1553 lines, contract-hash member — `native_contract.rs`, 63rd entry)

**Dedupe ground is `identity_hash`, never textual similarity.** The D1
identity projection (`identity_key` :358-419, contract `ufo.dedupe.v4`)
covers, in order: normalized claim (whitespace-collapse + lowercase),
sorted/deduped evidence ids, touched-path set, candidate-write digests
as `(path, sha256(declared base64 bytes))` pairs, normalized subjective
for/against claims (side artifacts and seats NOT identity). Encoding is
length-prefixed segments split by `\u{0}..\u{3},\u{5}` — injective without
JSON escaping. **Scores are deliberately excluded** (:363-366): same
identity + different scores = one class with internal disagreement.

**Rust owns survivor selection; the model only classifies.** D3 total
order `(write digests, evidence ids, normalized claim, route,
proposal_id)` + D3a final tie-break on canonical serialization bytes
(:558-597) — used identically by local collapse and the live path
(:1054-1079). Classes sorted by key bytes: hash order ≠ preimage order,
arrival order never chooses (:483-499).

**D2 class vector** (`mediated_class_vector` :530-556): per-axis upper
median (`scores[len/2]`) over GATE-VALID members only
(`gate::validate_vector`). A class with no valid member keeps the
survivor's own (gate-invalid) scores. The pre-r05 all-member fallback is
condemned in-source (:522-529): complementary malformed members
(`{testing}`+`{implementation}`) could synthesize an admitting vector —
"zero valid inputs producing an admitting class".

**Blinding is structural.** The brief carries only `identity_hash` +
`RG{nnn}` route groups (`canonical_keys` `#[serde(skip)]`); the sealed
source map is revealed only AFTER the decision and only when
bytes/`audit_hash`/`source_map_handle` still agree (`reveal_source_map`
:241-277; caller `loop_driver_dry.rs:1017-1021`). `RG000` = unknown
route; high confidence requires ≥2 distinct non-RG000 groups
(:1013-1024).

**Pipeline** (`run_phase` :1348-1498): resolve distiller lane →
`dispatch_lane_with_brief` (live attempt only when `LiveEnv::enabled()`
— explicit local-live promote, route must be `hvm/qwen-hvm` else typed
cause :1194-1201) → `synthesis_ready` requires `live && exit 0 &&
handler ∈ {distiller-qwen-hvm-live, distiller-qwen-direct-live} &&
nonempty stdout && !stdout.contains("LOCAL_COLLAPSE")` (`live.rs:246-256`)
→ live: `validate_qwen_synthesis` (:966-1052 — parse, echo-mutation
check, high-confidence floor, exactly-once classification,
`validate_class_parity` D4: advisory duplicate links must stay inside
one identity_hash class and the induced partitions must be EQUAL as
sets) → seal source map → collapsed set = Rust winners carrying D2
vectors → publish `distill-r{n}.md` via `atomic_write`.

**Outcome split:** `SynthesisFailure::Malformed` ⇒ degrade to local
collapse with the cause as typed evidence (:1440-1451);
`SynthesisFailure::Semantic` (advisory partition ≠ computed partition)
⇒ **round refused** `live synthesis semantic refusal: {cause}`
(:1452-1459) — never degrades. Local collapse emits `LOCAL_COLLAPSE`
sentinel text (:1246-1318) and claims no findings (:1268-1276 —
"marking collapse output as findings would fabricate evidence").
`loop_driver_dry.rs:534`: `UnsoundDistill` fires iff `contradictions` or
`missing_proof` are non-empty — only the live path can populate them.
`admit_integrated_candidate` (:279-309) re-verifies
`survivor_set_sha256` — "distiller output alone is not an admitted
candidate".

### ⚠ Defect (report-class): `live.rs` response schema stale vs `ufo.dedupe.v4`

`QWEN_RESPONSE_FORMAT` (`live.rs:46-114`) names `ufo_dedupe_v2` and its
`unique_moves` items require `{move_id, proposal_id, claim,
evidence_ids, route_group_id, confidence}` with `additionalProperties:
false` + `strict: true` — **`identity_hash` is absent** — while
`RouteUniqueMove` (`distill.rs:166-174`) requires it (deny_unknown_fields
on `QwenSynthesis` :176-180, echo check :1001-1012). A schema-enforcing
transport can only emit objects that fail `from_str::<QwenSynthesis>`
on the missing field → `Malformed` degrade → live synthesis can never
be credited. Consequence dormant while `LiveEnv::enabled()` is off;
no test pins schema-vs-struct together.

## `l3_swarm.rs` (591 lines — declaration/validation ONLY; absent from `NATIVE_CONTRACT_FILES`)

Source's own words (:1-20): "Sekhmet is shelved … authorizes no worker,
and no production path in this crate consumes it — it is
compile-checked, conformance-pinned metadata … this module does not
spawn it. … sparks never supply a proposal, replace a native seat,
judge a move, or enter `NativeRoundHandoff`. Routes never resolve to
OpenCode / `opencode-go`, and the chain never wraps." Anti-pattern 14
verified verbatim against source.

- **Ceiling is PINNED, not clamped:** `L3_CONCURRENCY_CEILING = 64`
  (:24); `validate` refuses any other value incl. native 32
  (:382-386). `SELF_ITER_WORKER_CONCURRENCY_DEFAULT = 64` is a DISTINCT
  constant (`config.rs:19-22`).
- `CANONICAL_L3_CHAIN` (:32-42): `gpt-5.3-codex-spark:low`,
  `gpt-5.6-luna:low`, `grok-4.5:low`,
  `deepseek-v4-flash-0731:high` (the LAST entry is the *served* pair —
  the requested `deepseek-v4-flash:low` alias was coerced; declare the
  served pair). `L3_CHAIN_LENGTH_MAX = 8` (2× cascade).
- **Movement model** (`on_failure` :427-473, `apply_reroute` :479-540):
  only capacity classes advance (`permits_advance` =
  usage_limit|rate_limit|model_unavailable); exactly one hop forward;
  `next_index` filter `< chain.len()` — never wraps (:421-424);
  `chain.get(index) != lane.route` ⇒ `invalid_lane_route` (a desynced
  lane never mints a reroute); record `cause` must be a bare typed
  advance key; `to` re-checked for OpenCode even though `apply_reroute`
  never re-runs `validate`.
- **Membrane** (`refuse_native_handoff_admission` :578-591): 8
  `L3AdmissionKind`s, only `Evidence` ⇒ `Ok`. `L3Authority` has exactly
  one variant `EvidenceOnly` (:46-49).
- **Namespace**: exactly one `Component::Normal`, must canonicalize
  under the root, must not overlap the canonical checkout in either
  direction, dangling symlink refused via `symlink_metadata` (:169-229).
- **Drift (named, not a defect):** `config/ufo.json` `l3Evidence`
  carries `{transport, authority, concurrencyCeiling}` with NO `chain`;
  `L3EvidenceConfig.chain` is required + deny_unknown_fields, so the
  project block cannot decode — pinned as a positive expectation
  (conformance `l3-08`). Undefended only because no production path
  parses it.

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
nonempty stdout && !stdout.contains(LOCAL_COLLAPSE_SENTINEL)` (`live.rs`
:45 definition, :254 in-predicate)
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

## `distill_tests.rs` (1727 L, 44 `#[test]` — wired at `distill.rs:1143-1145` as `mod tests`)

**Revision `964f443e` current-source addendum (source inspection, not
tests executed).** Basenames under `crates/ufo-core-runtime/src/`. This
suite inspects the current `distill.rs` contract, which differs from the
historical module prose above: the current literal is `ufo.dedupe.v3`
(`distill.rs:472`), not the older v4 description. Shell-stub transports use
`EnvGuard` isolation: `disable_live_env` removes `UFO_LIVE_DISPATCH` and
`UFO_LIVE` (`distill_tests.rs:16-20`).

**Two authorities; the asymmetry is itself pinned as a tripwire.** The
local key (`local_key`, `distill.rs:299`) binds normalized claim
(`"  cache  the KEY "` + `["e2","e1","e1"]` collapses to one with
`"Cache the key"` + `["e1","e2"]`, `distill_tests.rs:211-219`),
declared write bytes (base64-differing pair survives two-way while the
positive-control twin, differing only in `proposal_id` + one `scores`
entry, collapses to one — "proposal_id and scores are outside the local
identity", `distill_tests.rs:222-263`), and touched paths (different
paths keep both; reversed order must not split — D2,
`distill_tests.rs:1601-1638`), with Unicode case folding in
`normalize_claim` (`"CAFÉ BEAN"` → `"café bean"` — D3,
`distill_tests.rs:1641-1647`). The blinded live brief carries only
claim + evidence lineage, so `live_round_survivor_set_differs_from_local_collapse`
asserts `dedupe` keeps the write-distinct pair while an authorized
synthesis collapsing `M002` yields `after_count == 1` and
`survivor_set_sha256` equal to the survivor-only digest — the in-source
comment names it the `ufo.dedupe.v3` asymmetry tripwire for a future v4
migration (`distill_tests.rs:266-329`). The contract literal itself is
pinned: `assert_eq!(brief.contract, "ufo.dedupe.v3")` at
`distill_tests.rs:411` ("Any edit here is a protocol change, not a
refactor", `distill_tests.rs:405-412`), matching `distill.rs:472`.

**Blinding.** `distill_tests.rs:332-383`: `" LOCAL / FIXTURE-A "` and
`"local / fixture-a"` share a `route_group_id`, `"local/fixture-b"`
differs, missing/blank provenance coalesces to `"RG000"`, evidence ids
re-emerge sorted, and eight identity strings (`scout`, `reviewer`,
`critic`, `connector`, `fixture-a`, `source_route_key`, `audit_hash`,
`source_map`) must not appear in the lowercased prompt. Canonical route
key semantics (F11, `distill_tests.rs:1125-1142`): ASCII lowered in
place, `ÉCOLE/ROUTE` folds to `école/route`, whitespace-only maps to
`None`. The prompt interpolates `UNKNOWN_ROUTE_GROUP_ID` — never a
second literal — and keeps it bound to its instruction text ("other
than …", F14, `distill_tests.rs:1145-1159`). The r20 note "MutDistillUtf8
SURVIVED" (`distill_tests.rs:385-387`) pins the wire delimiter
`INPUT_JSON:\n` plus `prompt.ends_with(payload)`
(`distill_tests.rs:389-402`). A blank `proposal_id` falls back to the
`M001` label `move_id_label` builds (`distill_tests.rs:1650-1657`, D6;
`distill.rs:380`).

**Honest-collapse gating.** Ambient `CURSOR_AUTH_TOKEN` without live env
never promotes (`distill_tests.rs:47-57`); a plausible-looking leftover
from `unimplemented-route-live` with exit 0 never passes
`live_synthesis` — "only a successful local Qwen transport may authorize
synthesis" (`distill_tests.rs:60-72`). Local dispatch keeps handler
`"distiller-local-collapse"`, `!live_synthesis`, no `SYNTHESIS_READY`,
`LOCAL_COLLAPSE_SENTINEL` present (`distill_tests.rs:22-44`); the full
phase shape (`distill_tests.rs:75-114`) empties `audit_hash`/handle/map
path and every findings vector, refuses
`reveal_source_map_after_score("scored")`, and asserts the round
artifact prints `synthesis_ready: false` without `specialist`, `scout`
or `route/private`. Typed-cause matrix: wrong route with live enabled
collapses with the route plus "does not support live synthesis"
(`distill_tests.rs:1230-1252`); a nonexistent binary collapses with a
`spawn` cause (F2, `distill_tests.rs:1255-1278`); exit 0 with empty
stdout KEEPS the transport handler `"distiller-qwen-hvm-live"` (boundary:
a transport that ran keeps its handler — D5,
`distill_tests.rs:1660-1691`, cause records "did not authorize
synthesis", "exit 0", "(empty stderr)"); an authorized-but-invalid
synthesis "degrades, never aborts" with `live_attempt_error:` + "did not
classify every input move" on the artifact (r8, `distill_tests.rs:116-162`);
an unreadable godspeed directive under `UFO_ROOT` records
`distiller_prompt_preview: unavailable` beside the sentinel (D8,
`distill_tests.rs:1709-1727`). `stderr_tail_512` (`distill_tests.rs:1694-1706`):
512 chars (char count, not bytes), keeps the TAIL end, trims;
whitespace-only input yields `""`.

**Fail-closed validation arms.** Each refusal is asserted by verbatim
cause substring: "parse Qwen distiller JSON" (`distill_tests.rs:1281-1288`);
"did not authorize synthesis" (`distill_tests.rs:1291-1306`); old-contract
`audit_hash`/`source_map` keys plus mutation of EVERY echoed field —
evidence order, `proposal_id`, claim, `route_group_id` — each refuse
"mutated surviving move" (r17, `distill_tests.rs:830-879`); classify
exactly once ("classify every input move exactly once"), empty duplicate
reason ("reason is empty"), contradiction arms (empty reason, self-linked,
attached to a dropped move on either side) and missing-proof arms (empty
reason, dropped move, repeated) in the 197-line battery
(`distill_tests.rs:631-827`); unknown/repeated unique moves
("unknown unique move M999", "repeated unique move M001",
`distill_tests.rs:1309-1343`); duplicate arms self-linked / unknown
duplicate / unknown survivor / survivor-not-unique / repeated
classification (`distill_tests.rs:1346-1463`); the reversed duplicate
contradiction caught by pair normalization ("repeated contradiction",
`distill_tests.rs:1466-1497`); unique∧duplicate overlap refuses AND
names the offender `M002` (`distill_tests.rs:1500-1531`). The lineage
guard cuts both ways — same claim with independent evidence AND distinct
claims with shared evidence both refuse "collapsed independent lineage"
(`distill_tests.rs:583-628`). High-confidence floor: with only one known
route group the refusal says "two known route groups"
(`distill_tests.rs:446-512`). Confidences re-emerge sorted
`M001, M002, M003` regardless of response order (`distill_tests.rs:415-443`);
duplicates/contradictions/missing-proof survive validation byte-for-byte
including the exact serialized field names (`distill_tests.rs:515-580`).

**Sealed reveal and admission boundaries** (`distill_tests.rs:882-999`):
a stale pre-score plaintext map must not exist after sealing ("pre-score
map must not exist"); a different mission objective must yield a
different `source_map_handle`; one appended space in the sealed bytes
refuses "payload/hash mismatch"; a whitespace-only score refuses; success
writes the exact bytes, reveal is idempotent, the unix file mode is
`0o600` (`distill_tests.rs:986`, cfg(unix)), `audit_hash` equals
`sha256:` over the payload bytes, and the decoded `SourceMapPayload`
carries `iteration: 7` with the `M001`/`RG001`/`scout`/`local/fixture-a`
entry. The F4/D4 battery (`distill_tests.rs:1002-1122`): wrong recorded
hash, a JSON-breaking first byte (decode-gate message "sealed source map
payload/hash mismatch") and a wrong handle each refuse WITHOUT creating
the target; admission refuses empty artifact bytes ("artifact bytes are
empty"), a second call ("already admitted"), a mismatched receipt
("artifact SHA-256 mismatch") and post-run proposal mutation ("survivor
set digest mismatch", `distill_tests.rs:1534-1598`). A bound
`EvaluatorReceipt` admits exactly once with every field equal and a
64-char `survivor_set_sha256`, and a local-collapse result stays sealed
(`distill_tests.rs:1178-1227`).

**Limits.** Stub transports are `#!/bin/sh` scripts chmod-ed `0o700`;
the mode assertion and the broken-directive chmod path are `#[cfg(unix)]`
gated. No test in this file references `QWEN_RESPONSE_FORMAT`; absence of
that assertion does not revalidate the historical defect above. Its
missing-`identity_hash` premise does not hold at this revision:
`RouteUniqueMove` lists six fields without it (`distill.rs:135-142`), matching
the six names in the transport's required-field list (`live.rs:60-67`).
This is a field-list comparison, not full schema equivalence or live
transport verification.

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

## `l3_swarm_tests.rs` (267 L, 12 `#[test]` — wired at `l3_swarm.rs:494-496` as `mod tests`)

**Revision `964f443e` current-source addendum (source inspection, not
tests executed).** Every test builds fresh `tempfile` roots through the
`execution_roots` helper (`l3_swarm_tests.rs:6-13`) and drives only the
declaration/validation surface — consistent with the "declaration /
validation ONLY" heading above; nothing here spawns a worker.

- **Decode and reject** (`l3_swarm_tests.rs:16-45`): canonical
  `CANONICAL_L3_CHAIN` (4 steps) decodes through
  `L3EvidenceConfig::from_json`; `authority.as_str()` equals
  `L3_AUTHORITY`; authority `"judge"` refuses; the legacy
  `primary`/`fallback` key shape refuses (deny-unknown shape).
- **The pinned ceiling has teeth** (`l3_swarm_tests.rs:48-53`):
  `L3EvidenceConfig::canonical()` asserts 64, then a single mutation to
  native `32` fails `validate()` — the not-clamped rule above is enforced
  at the test seam.
- **`start_lane` revalidates** (`l3_swarm_tests.rs:56-65`): a
  post-construction `transport = "other"` refuses with "l3 transport must
  be sekhmet" (`l3_swarm_tests.rs:64`) — mutating config after
  construction cannot smuggle a lane. Chain bound
  (`l3_swarm_tests.rs:68-80`): filling to exactly `L3_CHAIN_LENGTH_MAX`
  validates, one more refuses "chain length".
- **Namespace and access-mode matrix** (`l3_swarm_tests.rs:83-105`):
  `L3ExecutionSpec::isolated` → `L3WorkspaceAccess::Mutable`, no scope
  source, `workdir()` under `sp-default/in`; `read_only_probe` →
  `ReadOnly`; `mutation_harbor` → Mutable with
  `scope_snapshot_source()` equal to the checkout and workdir under
  `sp-harbor/workspace`; a namespaces dir inside the checkout refuses,
  `../sp-escape` refuses. Companions: a symlink inside the namespace root
  must resolve beneath it — `#[cfg(unix)]` (`l3_swarm_tests.rs:107-117`);
  the opposite overlap direction refuses "must not overlap canonical
  checkout" (`l3_swarm_tests.rs:119-128`); absent root ("l3 namespace
  root" + "cannot be resolved"), file-as-root ("must be a directory") and
  absent scope source ("l3 --scope snapshot source") each refuse
  (`l3_swarm_tests.rs:131-151`).
- **Advance model** (`l3_swarm_tests.rs:154-195`): the three capacity
  classes `UsageLimit`, `RateLimit`, `ModelUnavailable` step the chain one
  hop each with `from`/`to` equal to consecutive `CANONICAL_L3_CHAIN`
  entries, and the reroute preserves `prompt`, `cache_key`, `lane_id`,
  `execution`; a fourth failure at the last lane returns
  `L3Advance::Unavailable` with cause `"chain_exhausted"` and
  `lane.index` stays 3 — never wraps. All six non-capacity classes
  (`Authentication`, `PermissionDenied`, `Timeout`, `InvalidRequest`,
  `ToolFailure`, `Unknown`) return `Unavailable` with cause exactly
  `class.as_str()` and index unmoved (`l3_swarm_tests.rs:197-221`).
- **Membrane and liveness** (`l3_swarm_tests.rs:223-249`): mixed-case
  routes `OpenCode/gpt-5:low` and `devin/OpenCode-Go:low` refuse via
  normalization ("cannot use OpenCode"); seven `L3AdmissionKind`s refuse
  and only `L3AdmissionKind::Evidence` is `Ok` — 8 kinds total, matching
  the membrane above. A local `SERVED_L3_ROUTES` fixture table
  (`l3_swarm_tests.rs:251-256`) is checked by membership assertion against
  every canonical chain step; a missing entry reports "dead L3 cascade
  step" (`l3_swarm_tests.rs:258-265`). This checks declared fixture coverage,
  not current provider/model/effort availability; no endpoint is probed.
- **Limits.** The suite exercises `validate`, `start_lane`,
  `on_failure`/`apply_reroute`, the namespace guards,
  `reject_opencode_route` and `refuse_native_handoff_admission` only; the
  `l3Evidence` config-drift note above (block without `chain`) is not
  referenced here either way.

# Failure telemetry — single-sourced vocabularies

Registry family **S5** (routing & result helpers). This note owns the
primary `scripts/ufo-mission-result.mjs` member section (envelope authority +
shared hub exports). Lock/queue ownership detail also cites the same member in
`knowledge/singleton-and-queue-ownership.md` (topic headings only there — no
second path-form `##` section, so the claims gate does not double-count).

All lists below are quoted from source; do not restate copies elsewhere.

## `scripts/ufo-mission-result.mjs`

**Live size** at origin HEAD `964f443e`: **2966 L**
(`wc -l scripts/ufo-mission-result.mjs`). Registry cell still prints 3691 L —
parent owns the cell rewrite. sha256
`bf23cf3ee51702a74bc492049a0f613d79d838a1cec55579508da1c214755551`.
Schema pin: `SCHEMA = "ufo-mission-result-v1"` at
`scripts/ufo-mission-result.mjs:11`; receipt pin `RECEIPT_SCHEMA` at
`scripts/ufo-mission-result.mjs:12`.

### Entry failure classes (envelope authority)

`ENTRY_FAILURE_CLASSES` at `scripts/ufo-mission-result.mjs:33-36`:

`rate_limit | usage_limit | model_unavailable | lane_timeout |
process_exit | unavailable | quality_degraded`

`ufo-swarm-collect.mjs` is required to stay import-parity with this list
(the Redaction M7 pattern). `failureClass` is forbidden on `completed` rows
(`validateMissionResult` / `createMissionResult` at
`scripts/ufo-mission-result.mjs:540` / `:513`).

### Terminal-outcome triple

`OUTCOME_TRIPLE_VALUES` at `scripts/ufo-mission-result.mjs:20-26` — reported
beside the exit code, never folded in; unknown fields are omitted:

- `round_validity`: sound | unsound
- `loop_stop`: saturated | budget_halt | blocked | interrupted |
  honesty_brake | authority_boundary
- `mission_goal`: satisfied | incomplete | unverified

### Shared hub exports (own-file anchors)

| symbol | anchor |
|---|---|
| `ENTRY_FAILURE_CLASSES` | `scripts/ufo-mission-result.mjs:33` |
| `OUTCOME_TRIPLE_VALUES` | `scripts/ufo-mission-result.mjs:20` |
| `createMissionResult` | `scripts/ufo-mission-result.mjs:513` |
| `validateMissionResult` | `scripts/ufo-mission-result.mjs:540` |
| `acquireSingletonLock` | `scripts/ufo-mission-result.mjs:1308` |
| `redact` | `scripts/ufo-mission-result.mjs:1145` |
| `writeFileAtomic` | `scripts/ufo-mission-result.mjs:968` |
| `appendRotatingLog` | `scripts/ufo-mission-result.mjs:1731` |
| `writeFileAtomicIfChanged` | `scripts/ufo-mission-result.mjs:1876` |
| `emitErrorJson` | `scripts/ufo-mission-result.mjs:2031` |
| `MAX_EVIDENCE_LOG_BYTES` | `scripts/ufo-mission-result.mjs:2061` |
| `gatedConfigPath` | `scripts/ufo-mission-result.mjs:2143` |
| `isMainModule` | `scripts/ufo-mission-result.mjs:2391` |
| `loadSwarmPolicy` | `scripts/ufo-mission-result.mjs:2431` |
| `parseReportOutput` | `scripts/ufo-mission-result.mjs:2543` |
| `newestMtime` | `scripts/ufo-mission-result.mjs:2566` |

### Drift since the prior note (honest, not fitted)

The earlier draft of this note attributed `CAPACITY_FAILURES`,
`ROUTING_HEALTH_OUTCOMES`, `DEADLINE_CLASS_BY_ROLE`, and
`SEAT_CLASS_BY_ROLE` to this file. Live re-open at HEAD `964f443e`:

- `CAPACITY_FAILURES` and `ROUTING_HEALTH_OUTCOMES` live in
  `scripts/collect-omp-native-handoff-lib/base.mjs` (S2 family — **not** an
  S5 member; do not invent an S5 section for them).
- `DEADLINE_CLASS_BY_ROLE` / `SEAT_CLASS_BY_ROLE` are **absent** from
  `ufo-mission-result.mjs` (rg empty). Prior deadline/seat prose is retired
  rather than left as a phantom claim.

## Classifier parity

`classifyFailure` (`collect-omp-native-handoff-lib/base.mjs`) mirrors Rust
`native_text.rs classify_failure`: status/id exact equality → literal
needles on lowercased "status id message" → digit-guarded status codes
(429 rate_limit, 401 authentication, 403 permission_denied, 400
invalid_request) → word-boundary "process" → tool_failure → `unknown`.
Only strings and numbers contribute to the haystack (json_lower). Owner:
S2 / native-admission surface — recorded here because the envelope consumes
the class string, not because base.mjs joins S5.

## Capacity subset (S2 authority; cited for consumers of S5)

`CAPACITY_FAILURES = {usage_limit, rate_limit, model_unavailable}` in
`collect-omp-native-handoff-lib/base.mjs` — the ONLY classes justifying a
route fallback advance (I6). `lane_timeout` is never capacity: non-critical
late seats → `unavailable`; critical seats (Main, planner, probeParent,
labrat, distiller) get ONE same-identity same-route retry (re-charter D1a),
then the round is invalid for judgment.

## Lane-health ledger (S2 authority)

`.ufo/routing-health.jsonl`, read by `ufo routing-health [--since]`
(display-only). Outcomes `ROUTING_HEALTH_OUTCOMES` are owned by
`collect-omp-native-handoff-lib/base.mjs`, not by S5.

## Exit-code convention

Scripts: 0 success, 1 typed failure (schema-tagged JSON on stderr via
`emitErrorJson` at `scripts/ufo-mission-result.mjs:2031`), 64 usage.
`ufo` CLI (`crates/ufo-cli/src/main.rs` after_help): 0 ok, 1 runtime
failure / phase-0 gate fail / rollback, 2 structured usage rejection
`{ok:false,kind,error}`.

Sources: `scripts/ufo-mission-result.mjs`, `scripts/collect-omp-native-
handoff-lib/base.mjs`, `scripts/ufo-swarm-collect.mjs`,
`crates/ufo-cli/src/main.rs`.

## Round-32 recensus notes

- Member still present under `scripts/` at origin HEAD `964f443e`.
- Line count moved **3691 → 2966**; no phantom member section to remove.
- Path-form `## `scripts/ufo-mission-result.mjs`` added so S5 is section-form.
- Stale in-file attributions for capacity/routing-health/deadline maps removed
  from the S5 member body (symbols relocated or deleted upstream).

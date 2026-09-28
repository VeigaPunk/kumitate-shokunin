# Failure telemetry — single-sourced vocabularies

All lists below are quoted from source; do not restate copies elsewhere.

## Entry failure classes (envelope authority)

`ENTRY_FAILURE_CLASSES` in `scripts/ufo-mission-result.mjs`:

`rate_limit | usage_limit | model_unavailable | lane_timeout |
process_exit | unavailable | quality_degraded`

`ufo-swarm-collect.mjs` imports this list (import parity — the Redaction M7
pattern). `failureClass` is forbidden on `completed` rows.

## Classifier parity

`classifyFailure` (`collect-omp-native-handoff-lib/base.mjs`) mirrors Rust
`native_text.rs classify_failure`: status/id exact equality → literal
needles on lowercased "status id message" → digit-guarded status codes
(429 rate_limit, 401 authentication, 403 permission_denied, 400
invalid_request) → word-boundary "process" → tool_failure → `unknown`.
Only strings and numbers contribute to the haystack (json_lower).

## Capacity subset

`CAPACITY_FAILURES = {usage_limit, rate_limit, model_unavailable}` — the
ONLY classes justifying a route fallback advance (I6). `lane_timeout` is
never capacity: non-critical late seats → `unavailable`; critical seats
(Main, planner, probeParent, labrat, distiller) get ONE same-identity
same-route retry (re-charter D1a), then the round is invalid for judgment.

## Lane-health ledger

`.ufo/routing-health.jsonl`, read by `ufo routing-health [--since]`
(display-only). Outcomes `ROUTING_HEALTH_OUTCOMES`: `ok | capacity |
lane_timeout | quality_degraded | process_exit`.

## Terminal-outcome triple

`ufo-mission-result.mjs` `OUTCOME_TRIPLE_VALUES` — reported beside the exit
code, never folded in; unknown fields are omitted:

- `round_validity`: sound | unsound
- `loop_stop`: saturated | budget_halt | blocked | interrupted |
  honesty_brake | authority_boundary
- `mission_goal`: satisfied | incomplete | unverified

## Deadline/seat classes

`DEADLINE_CLASS_BY_ROLE` + `SEAT_CLASS_BY_ROLE` (same file): critic,
connector, revenger, reviewer, sentinel → thinking; executor,
mutation-tester, scout, simplifier, scribe → mechanical; core roles map to
their own classes. Config keys: orchestratorMs, plannerMs, thinkingMs,
distillerMs, mechanicalMs, labratMs.

## Exit-code convention

Scripts: 0 success, 1 typed failure (schema-tagged JSON on stderr, e.g.
`ufo-swarm-collect-error-v1`; refusal lines via `writeRefusal` in
`collect-omp-native-handoff-lib/refusal-line.mjs`), 64 usage.
`ufo` CLI (`crates/ufo-cli/src/main.rs` after_help): 0 ok, 1 runtime
failure / phase-0 gate fail / rollback, 2 structured usage rejection
`{ok:false,kind,error}`.

Sources: `scripts/ufo-mission-result.mjs`, `scripts/collect-omp-native-
handoff-lib/base.mjs` (constants block ~L69-260, `classifyFailure` ~L734),
`scripts/ufo-swarm-collect.mjs`, `crates/ufo-cli/src/main.rs`.

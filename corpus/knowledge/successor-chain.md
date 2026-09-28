# Iterate-successor chain — `maybeEnqueueIterationSuccessor`

`scripts/fleet-dispatcher.mjs` :6753-7215. The chain that keeps an
iterate mission alive across rounds — or ends it honestly.

## Decision gate (receipt-bound, fail-closed)

Only an explicit `iteration.decision: "continue"` in the validated task
receipt mints a successor. Vocabulary of `iterationOutcome.kind`
(validated at L5516): `continue | stop | blocked | budget_halt |
decision_missing | successor_error | successor_superseded`.

- round ≥ declared `iterate.rounds` → `budget_halt` (overrides even a
  declared `continue`; a declared terminal decision on the final round
  keeps its own kind).
- missing `iteration` block → `decision_missing` — fail closed, never
  assumed continuation.
- any non-`continue` → lands as that terminal kind verbatim.
- a `decision` on a NON-iterate row → no successor + durable
  `queue_continuation_skipped` log naming `not_an_iterate_row` (r31: a
  silently dropped decision is indistinguishable from designed chain end —
  so it is named).
- mint failures are logged + swallowed; the parent stays completed (no
  retry storm).

## Successor identity is deterministic

Key/runId/sessionId derive from `(parent, round, priorReceiptSha256)` —
chain root via `chainRootKey` or lineage walk (`resolveChainRoot`), a plain
row is its own root. Determinism makes deferred mints joinable: the dedupe
path and the deferred stamp both land on the same key.

## Defer-not-die (r16) — transient conditions park, never terminate

- `scope_occupied`: a live (launching/running/paused — NOT `blocked`) row
  holding an overlapping scope → `continue` outcome with
  `deferred: "scope_occupied"` + `scopeOccupiedBy`, `wouldBeTaskKey`,
  `wouldBeRunId`, `successorRound`, `priorReceiptSha256` (r42: the deferred
  edge names the successor). `afterChains` waiters on this chain root are
  dependents, not occupants.
- `queue_capacity`: task-cap reached → `continue` with
  `deferred: "queue_capacity"`, console-only `queue_continuation_refused`.
  Re-mints when a slot frees (pre-r29 it rewrote `continue`→`budget_halt`,
  a recoverable storage condition reading as an honest chain end).

## Park epochs (r43)

`iterationOutcome.at` = the PARK EPOCH, never re-stamped on re-evaluation;
`lastEvalAt` carries the evaluation instant. Park age = now−at; churn
depth = lastEvalAt−at. Spreading `extra` first in the outcome object means
no caller field can forge either stamp.

## afterChains waiter policy (M16/r23)

`CHAIN_TERMINAL_KINDS` = all kinds except `continue`. Split: `stop`,
`budget_halt`, `decision_missing`, `successor_superseded` SATISFY waiters
(`CHAIN_SATISFY_KINDS`); `blocked` and `successor_error` STARVE them; an
unknown kind is unresolvable → fail closed. `successor_superseded`
satisfies because supersession is proof the chain continued via the
occupying descendant — never retried.

## Recovery (r07)

`options.recovery` re-attempts a parked recoverable fault: a renewed
identical fault keeps the original outcome bytes (no duplicate ledger
event); a successful mint stamps `recoveredFrom: "successor_error"`.

## Acceptance admission (settle side)

`settleLiveEvidence` = `logAcceptanceAdmission` → state `completed` →
`drainDeferredOnRelease` → `maybeEnqueueIterationSuccessor`.
`receipt_snapshot_binding_accepted` carries (taskKey, runId, attempt,
missionId, admittedAt, bindingSource). The durable `admission-latch.json`
(`ufo-admission-latch-v1`) pairs each admission with exactly one
`receipt_snapshot_binding_retracted` per completion DEMOTION — admissions
− retractions = live count. Base-plus-delta write under the queue lock;
persistence failure never silences the durable line. Display settle
(`auto-reap: result landed`) explicitly does NOT retract (r40).

## Result-path collisions are typed (r10)

`result_path_occupied` (queue row owns the path, `occupiedBy` named) vs
`result_path_artifact_exists` (bare artifact — filename alone never
attributes an occupant); same split for `.receipt.json`.

## Evidence era gate (A5)

A live mission's pane is retired only for a completed row whose acceptance
ALREADY settled (`evidenceEraCurrent` + `resultReceiptValid`), never on
evidence alone — the old `running` leg killed panes mid-turn and could
invalidate the very evidence acceptance later read.

Sources: `scripts/fleet-dispatcher.mjs` L275-295, L5510-5525, L6753-7215,
L7997-8110, L8313-8450, L8589-8650; `ufo-l0-watch.mjs` header (why the
respawn chain exists).

# ScoutTemporalDeep — round-57 scout report (S117 Temporal detecting-activity-failures)

Seat: ScoutTemporalDeep (scout, leaf). Item: re-open S117 fully; extract Heartbeat
Timeout expiry semantics, the four timeout slots, and whether heartbeats carry
payloads; corroborate or contradict the clauses of
`corpus/knowledge/worker-heartbeat-liveness.md`.

## Source re-open

- URL: https://docs.temporal.io/encyclopedia/detecting-activity-failures
- Access date: 2026-10-24. HTTP 200, 80,679 bytes, body
  sha256 `c7f7c40158340e64132b948f77408aced56a4298093069283a3b5239a1b7db50` —
  byte-identical to the ScoutTemporalHb capture
  (`build/ScoutTemporalHb/temporal-activity-failures.html`) and the metadata pin.
  Independent curl, own bytes at
  `build/ScoutTemporalDeep/detecting-activity-failures.html` + `page.txt` (334
  stripped lines).
- Tier judgment: **tier A** — vendor primary documentation for the mechanism
  itself. Located quote (≤25 words): "If this timeout is reached, the Activity
  Task fails and a retry occurs if a Retry Policy dictates it."

## Finding 1 — Heartbeat Timeout expiry semantics (retry vs fail)

Observed on page, §Heartbeat Timeout and §Activity Heartbeat:

- "A Heartbeat Timeout is the maximum time between Activity Heartbeats."
- **On expiry: the Activity *Task* fails; retry is conditional.** "If this
  timeout is reached, the Activity Task fails and a retry occurs if a Retry
  Policy dictates it." So it is neither an automatic retry nor an immediate
  whole-execution failure — one attempt dies, the Retry Policy decides.
- "If an Activity Task Execution times out due to a missed Heartbeat, the next
  Activity Task can access and continue with that payload" — heartbeat payload
  carries into the next attempt.
- `0s` = disabled ("No Heartbeat timer is started"), and an unset timeout
  normalizes to 0s. The timeout is "capped at the Start-To-Close Timeout."
- Related retry semantics elsewhere on the page: Schedule-To-Start is
  "non-retryable by design… regardless of the Retry Policy"; Start-To-Close is
  what "the Temporal Server relies on … to force Activity retries" when a Worker
  loses communication.
- Worker-side throttling batches heartbeats (throttle interval = min of
  heartbeatTimeout*0.8 or default 30s, and max 60s); throttling does not apply
  to the final heartbeat on Activity failure.

Entry does **not** contain a clause stating expiry→retry vs expiry→fail
directly; clause wording ("Heartbeats pair with a separate Heartbeat Timeout";
"short Heartbeat Timeout… if a Worker fails it can be handled in a timely
manner") is consistent with the observed semantics. No contradiction.

## Finding 2 — the four timeout slots

Observed: the page header lists exactly four failure-detection items —
Schedule-To-Start Timeout, Start-To-Close Timeout, Schedule-To-Close Timeout,
and **Activity Heartbeats** (the mechanism; its §Heartbeat Timeout subsection
defines the fourth bound). Per-leg bounds verified:

| Slot | Bounds | Default / retry |
|---|---|---|
| Schedule-To-Start | Task scheduled → Worker picks up | ∞; non-retryable by design |
| Start-To-Close | single Activity Task Execution | falls back to Schedule-To-Close; forces retries |
| Schedule-To-Close | whole Activity Execution incl. retries | ∞ |
| Heartbeat Timeout | max gap between heartbeats | 0s/unset = disabled; capped at Start-To-Close |

Corroborates entry clause 2 ("four timeout slots — Schedule-To-Start,
Start-To-Close, Schedule-To-Close, Heartbeat Timeout — each bounding a different
leg"). **Minor caveat (observed, not a contradiction):** the page presents three
`*-Timeout` items plus "Activity Heartbeats" as the fourth list entry; the
fourth *timeout* is defined in the Heartbeat subsection. The entry's naming is
substantively right but is a slight formalization of the page's own taxonomy.

## Finding 3 — do heartbeats carry payloads? YES

Observed verbatim: "Custom progress information can be included in the
Heartbeat… should a retry occur" and "A Heartbeat can include an application
layer payload that can be used to save Activity Execution progress."
Corroborates entry clause 3's parenthetical "(progress detail)" and the
`[INFERENCE]` lane-mapping line "Temporal's payload can carry progress detail."

## Clause-by-clause verdict (Temporal-scoped clauses only)

- L18 (heartbeat = progress-and-survival ping): **CORROBORATED** — quotes match
  page text verbatim; receipt file sha256 verified (`ae275a14…`).
- L19 (separate Heartbeat Timeout knob; four slots): **CORROBORATED** with the
  taxonomy caveat above; receipt sha256 verified (`daca7583…`).
- L20 (short timeout + frequent ping; payload): **CORROBORATED** — both quotes
  verbatim on page; receipt sha256 verified (`b0341d12…`).
- L26 source-metadata receipt: **CORROBORATED** — independent re-fetch is
  byte-identical (same 80,679 bytes, same sha256; `cb27262a…`).

## Receipt integrity check

All four cited `ScoutTemporalHb` files re-hashed locally; every sha256 matches
the `receipt:…@sha256:` bindings in the entry exactly.

## Remaining unknowns / gaps

- None on the scoped question. The entry's Temporal clauses are accurate and its
  receipts hash-true. Only nuance: "four timeout slots" compresses the page's
  3-timeouts-plus-heartbeat-mechanism list — worth a one-word tightening only if
  the entry is revised, not a falsity.

Evidence dir: `.ufo/waves/round-57/build/ScoutTemporalDeep/` (raw HTML, stripped
page.txt, fetch-metadata, heartbeat-timeout-expiry, four-timeout-slots,
heartbeat-payload extracts). No installs; curl + python3 stdlib only.
Confidence: high (primary source, byte-identical re-fetch, verbatim quotes).

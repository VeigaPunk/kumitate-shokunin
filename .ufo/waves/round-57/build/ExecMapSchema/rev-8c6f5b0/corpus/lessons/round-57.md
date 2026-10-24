# Round 57 — kumitate (hyaku run 5, attempt 2 lands it)

Base `7178bfd3643c0fac74c8eb637cd6e985faadd0cf` (the round-56 verifier-spotcheck tip; lane clean, ahead=0).
Plan `.ufo/waves/round-57/plan.md`. Claims: C1 `readme-map` capability acquisition
(ATTEST57), C2 sourced frontier entry `worker-heartbeat-liveness.md` (DOCTRINE57).

## Gate

Candidates considered: 4 source rows opened this round (S117 Temporal
detecting-activity-failures, S118 Kafka consumer configs, S119 Kubernetes
liveness probes, S120 RabbitMQ heartbeats) plus the `readme-map` gate itself
(instrument, not a knowledge admission).

| Row | URL | Accessed | Located quote | Decision |
|---|---|---|---|---|
| S117 | https://docs.temporal.io/encyclopedia/detecting-activity-failures | 2026-10-24 | "An Activity Heartbeat is a ping from the Worker that is executing the Activity to the Temporal Service." (§Activity Heartbeats) | ADMITTED tier A — primary docs for Temporal worker liveness |
| S118 | https://kafka.apache.org/43/configuration/consumer-configs | 2026-10-24 | "The timeout used to detect client failures when using Kafka's group management facility. The client sends periodic heartbeats to indicate its liveness to the broker." (§session.timeout.ms) | ADMITTED tier A — authoritative config reference for consumer session liveness |
| S119 | https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/ | 2026-10-24 | "Kubernetes provides liveness probes to detect and remedy such situations." (§Define a liveness command, lead) | ADMITTED tier A — official docs for kubelet liveness probes |
| S120 | https://www.rabbitmq.com/docs/heartbeats | 2026-10-24 | "AMQP 0-9-1 offers a heartbeat feature to ensure that the application layer promptly finds out about disrupted connections" (§Overview) | REJECTED — TCP/connection keepalive, not worker/task liveness; flip: a lane-owned mapping of connection-level liveness onto the dispatcher's transport tier |

Status/recheck/used-by changes: none on prior rows. S117–S119 written `mined`
(used-by `corpus/knowledge/worker-heartbeat-liveness.md`), S120 `rejected`.

Spot-check result: `<pending>` — the independent non-author source-decision review
runs at closure (per Q45 this line is closed next round by an append-only correction).

## Mistakes

| class | evidence | captured-by | fix |
|---|---|---|---|
| coverage-map drift | R56-V3 (`corpus/lessons/round-56-verifier-spotcheck.md` §6): `corpus/lessons/round-56-verifier-spotcheck.md` landed post-close without a `corpus/README.md` map row — third recurrence of the class (r52, r55 spotchecks; proxy read `C2_TOTAL_DRIFT declared=132 computed=133` at base) | `none` until this round — the count-only C2 term could not name WHICH file lacked a row | R57-1: the `readme-map` gate (`scripts/readme-map.mjs`, contract `kumitate-readme-map-v1`) makes the bimap mechanical — every file must have exactly one row, every row a live file, every file pinned in `.ufo/pins/readme-map.json`; the missing row is added in this commit. Shown able to fail: selftest cases `uncovered`/`orphan-row`/`stale-covered`/`unpinned` each exit 1 for the named reason |
| stale frozen literal | R56-V2 (same artifact §1): frozen A54 `exactly 24` and A55 `exactly 25` checklist literals read `UNMET 9/10` at the r56 close rev because item 26 exists — capability moves retreading named obsolescence every round | `none` — no convention bound which supersession shape a frozen count literal may take | R57-2: the A57 B7 arm freezes the amended convention — `items === 27` AND the full item-id→gate binding (24→counter-pins, 25→source-capture, 26→source-dupes, 27→readme-map); future capability moves must re-express every item binding, never only the newest; recorded in LOG.md and the plan §Routed-defect answers |
| process carry | R56-V1 (same artifact §1): the round-56 wave was prepared-but-undispatched; the L2 floor note records the orchestrator dispatches waves between rounds | n/a — orchestrator ruling/process convention, not a lane defect the lane can fix inside the repo | R57-3: this round prepares and validates the 64-seat v2 wave (`w1-spec.json`, `w1-validate.json`, `w1-taskcall.json`, `w1/swarm-registry.json`) and reports it prepared; dispatch is the orchestrator's |

## Round-56 carryover (routed)

- R56-V1 answered-by-convention above (R57-3); the wave is prepared and the
  orchestrator dispatches it between rounds.
- R56-V2 repaired-by-convention above (R57-2): the amended B7 arm makes the
  supersession shape part of the scored predicate itself.
- R56-V3 repaired above (R57-1): the row exists AND the class is gated.
- Carried, not this round's: R41-2 gate-pins ruling, R43-1/R43-5, A3e
  captured-invocation, R53-2 seat-accounting convention.

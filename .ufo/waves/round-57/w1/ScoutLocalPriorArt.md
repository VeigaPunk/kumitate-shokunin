# ScoutLocalPriorArt — prior heartbeat/liveness treatment sweep (round 57, C2/D57)

Item: verify `corpus/knowledge/worker-heartbeat-liveness.md` (D57, S117 Temporal / S118
Kafka / S119 Kubernetes) does not silently re-treat ground a fleet report or sibling
corpus already documented. Swept `.ufo/reports/` (fleet, rounds 1–105), all 20 sibling
`*/corpus/` trees, the kumitate corpus itself, and PROVINCE ownership rows.
Raw sweeps: `build/ScoutLocalPriorArt/{fleet-reports-heartbeat,fleet-reports-liveness,
kumitate-corpus-hitfiles,sibling-corpora-hitfiles,sibling-corpora-workerliveness-scoped,
fleet-reports-same-systems,sibling-scoped-lines}.txt`.

## Finding (high confidence): no silent re-tread

No fleet report or sibling corpus entry previously documented **worker
heartbeat/liveness as a sourced durable-execution mechanism** — how an orchestrator
learns a worker died while its unit of work is outstanding. Every prior "liveness" hit
resolves to a different sense:

- **Fleet reports** (`/home/vgpnk/Projects/shokunin/.ufo/reports/`): the only heartbeat
  hits are inside `round-57/kumitate.md` itself. "Liveness" hits are (a) host/driver/
  watchdog liveness (mori r12–r33, protocol r10/r12, souji r18), (b) process liveness as
  a *verification* primitive (2d r62/r105, 3d via `fleet-index-2026.md:328–329,356` —
  pipe-EOF ≠ child liveness; `kill(pid,0)` insufficient), (c) verdict-machine/anchor
  "liveness" metaphors (kumitate r14, lore r96). None is the D57 sense.
- **Sibling corpora** (scoped sweep `sibling-corpora-workerliveness-scoped.txt`):
  - **mori** owns fleet/host liveness by PROVINCE (`mori-shokunin/PROVINCE.md:5–8`;
    `corpus/knowledge/{watchdog-identity-r31,observability-surfaces-r2,
    seat-terminal-status-r17,earlyoom-invocation-scope-r30}.md`) and explicitly
    **refuses** "dispatch and orchestration mechanism (→ kumitate)". Complementary, not
    re-tread.
  - **kama** `corpus/knowledge/runtime-health-surface-matrix.md` documents `/health`
    endpoint liveness for model servers and already cited the Kubernetes probes *concepts*
    page (kama S017) — as borrowed vocabulary only: "a non-Kubernetes local server
    inherits none of these semantics", and "Routing/gateway health dispatch is
    kumitate's surface". D57's S119 is the tasks/tutorial page used for kubelet probe
    mechanics — adjacent page, disjoint claim. No conflict.
  - **kasegi** `corpus/knowledge/{mission-control,mission-ledger}.md` documents a real
    pushed heartbeat — the bounty-hunter fleet's `<program>.status.json` "L1→dispatcher
    heartbeat" and `telemetry.jsonl` "dispatcher heartbeat". Format/census documentation
    of a *different* dispatcher, in kasegi's security-ops domain; not the sourced
    worker-liveness-mechanism ground.
  - **game-dev-2d/3d** lessons (r62, r64) treat liveness as a test-verification
    primitive under headless engines — unrelated surface.

## Complementarity with the lane's own frontier line (declared, not silent)

- `visibility-lease-ack-deadlines.md` (r56, S113–S115) already said the lease
  "converts 'did the consumer die?' into a timer, so the broker never needs consensus
  on consumer liveness". `worker-heartbeat-liveness.md` explicitly takes the
  complementary slot: pull-vs-push inference clause, "the r56 lease slot and this
  liveness slot are different mechanisms". `PROVINCE.md:22` lists it as the line's
  seventh entry — the positioning is declared, not silent.
- `SOURCES.md`: S106–S116 cover identity/redelivery/lease (S112 Temporal Workflow
  Execution, S116 Temporal Visibility — both rejected); S017 (Temporal Activity
  Definition, idempotency) is queued since 2026-10-19. S117–S119 are the first rows on
  worker liveness; S120 (RabbitMQ heartbeats) rejected for the right reason
  (connection-scope keepalive).

## Nuances worth recording (not predicate-blocking)

1. The entry's lane-mapping clause says the lane's signal is "pull-based, not
   worker-pushed" — accurate for `fleet-dispatcher.mjs` mission reconcile
   (`LAUNCHING_GRACE_MS`, `MAX_LAUNCH_MISSES`, `repend`; consistent with
   `queue-and-claim.md` and `ops-watchers.md`). But the lane *does* have documented
   pushed-heartbeat surfaces the entry doesn't cite: `publishLiveness` cycle stamps
   (`reconcile-and-cycle.md:250`), `startMissionHeartbeat` →
   `.ufo/sighting/heartbeat/<runId>.json` (`native-trial-launch.md:112`,
   `ops-watchers.md:296`), and kasegi's status-file heartbeat. These signal
   "mission/daemon alive", not "outstanding work item held by a live worker" — so the
   claim stands, but a completeness citation to `ops-watchers.md`/
   `native-trial-launch.md` would have been cheap prior-art acknowledgment.
   [INFERENCE: scope judgment, not a source claim.]
2. Two lanes now cite Kubernetes probe docs for different purposes (kama S017 concepts
   page as vocabulary; kumitate S119 tasks page as mechanism). No conflict observed —
   noted for future census readers.

## Unresolved

- Seat did not re-open the three source URLs (that is ReviewS117–S120's and the
  Scout*Deep seats' scope); URL-level verification is deferred there.
- `.ufo/reports/` round numbering is fleet-global; lane-internal report dirs under
  other lanes (`<lane>/.ufo/reports/`) were not exhaustively enumerated beyond the
  corpus sweeps — the sibling corpus knowledge/lessons trees, which is where durable
  treatment would land, were fully swept.

Confidence: high on absence-of-re-tread (three independent sweeps agree); medium on
nuance 1's materiality (completeness, not correctness).

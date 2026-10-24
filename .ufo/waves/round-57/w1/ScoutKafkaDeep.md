# ScoutKafkaDeep — round 57 w1

## Item
Re-open S118 `https://kafka.apache.org/43/configuration/consumer-configs`; capture the full
liveness contract for `session.timeout.ms`, `heartbeat.interval.ms`, `max.poll.interval.ms`:
what each bounds, and static-vs-dynamic member behavior. Judged on operability + coverage.

## Source re-open (row judgment)
- URL: https://kafka.apache.org/43/configuration/consumer-configs (title: "Consumer and Share
  Consumer Configs | Apache Kafka")
- Accessed: 2026-10-24T12:51:43Z; HTTP 200; 145,719 bytes; body sha256
  `abf4310fd8bec0df3f1ddcae3a115faa509d98c5d5d8266e721db2965189cb17` — **byte-identical** to
  the ScoutKafka seat capture and the S118 pin (same bytes + hash), so the pinned capture is
  independently corroborated, not drifted.
- Quote (24 words, `session.timeout.ms` lead): "The timeout used to detect client failures
  when using Kafka's group management facility. The client sends periodic heartbeats to
  indicate its liveness"
- Tier judgment: **tier A** — Apache Kafka 4.3 authoritative config reference. Agree with the
  S118 admission (corpus/SOURCES.md row, lessons/round-57.md row): CORROBORATED.

## Observed facts (from captured page; evidence in `build/ScoutKafkaDeep/`)

**`session.timeout.ms` bounds PRESENCE.** int, default 45000 (45 s), importance high.
Broker-side failure detection fed by client heartbeats; "if no heartbeats are received by the
broker before the expiration of this session timeout, then the broker will remove this client
from the group and initiate a rebalance." Client value clamped to broker
`group.min/max.session.timeout.ms`. Unsupported client-side under `group.protocol=consumer`;
broker `group.consumer.session.timeout.ms` controls it there.

**`heartbeat.interval.ms` bounds heartbeat CADENCE.** int, default 3000 (3 s), high.
Heartbeats keep the session active and facilitate rebalancing on join/leave. Classic protocol
only; "must be set lower than `session.timeout.ms`, but typically should be set no higher than
1/3 of that value"; lowering it shortens *normal* rebalance time. Under `consumer` protocol
the broker's `group.consumer.heartbeat.interval.ms` controls it.

**`max.poll.interval.ms` bounds PROGRESS.** int, default 300000 (5 min), medium, valid [1,…].
"The maximum delay between invocations of poll()" — the upper bound on consumer idle time
between fetches. On expiry "the consumer is considered failed and the group will rebalance in
order to reassign the partitions to another member." Applies under both protocols (doc names
the Classic and Consumer session-timeout variants).

**Static vs dynamic member behavior** (`group.instance.id`, default null):
- unset → dynamic member, "the traditional behavior" — poll-timeout expiry rebalances
  immediately (partitions reassigned at once).
- set → static member; one instance per id in the group; paired with a *larger* session
  timeout to avoid rebalances on transient unavailability (e.g. restarts). On poll-timeout
  expiry a static member's partitions are **not** immediately reassigned: it stops sending
  heartbeats and reassignment waits for session-timeout expiry — "mirrors the behavior of a
  static consumer which has shutdown."

**Protocol gate:** `group.protocol` default `classic` (also `consumer`); it decides whether
session/heartbeat knobs are client-side or broker-side.

## Synthesis — the liveness contract (what each bound actually buys)
Two independent clocks define "dead":
1. **Session clock** (broker-observed): silence past `session.timeout.ms` ⇒ expel + rebalance;
   heartbeats at `heartbeat.interval.ms` are the worker-pushed survival signal (≤ session,
   typically ≤ 1/3).
2. **Poll clock** (client-observed): `max.poll.interval.ms` bounds how long the *application
   thread* may go without calling `poll()` — a heartbeat-healthy member stuck in processing is
   still declared failed and rebalanced (dynamic) or drains to session expiry (static).

Static membership converts the poll-timeout's immediate rebalance into a session-timeout
deferred reclaim — the liveness signal stays, the reclaim latency is the configurable knob.

## Coverage delta vs lane records
The lane's S118 row and knowledge entry `corpus/knowledge/worker-heartbeat-liveness.md`
(clauses lines 21–23) cite only `session.timeout.ms` + `heartbeat.interval.ms` + rebalance
reclaim. `max.poll.interval.ms` and the static-vs-dynamic asymmetry are **not** in the cited
clauses — corroborated as present in the source but beyond the entry's current coverage. The
entry's three S118 clauses themselves are verbatim-accurate against the page (session quote,
cadence/1-3 rule, reclaim quote all match).

## Limits / unknowns
- `group.min/max.session.timeout.ms`, `group.consumer.session.timeout.ms`,
  `group.consumer.heartbeat.interval.ms` are broker configs named by reference only on this
  page; their bounds/defaults live on the broker-configs page (not opened here).
- Page is versioned `/43/` docs; contract wording may differ across Kafka versions.
- [INFERENCE] KIP-848 (`consumer` protocol) moved session/heartbeat control to the broker —
  the doc gating language implies it but does not name the KIP.

## Evidence files
`build/ScoutKafkaDeep/kafka-43-consumer-configs.html` (raw capture), `curl-stderr.txt`,
`access-date.txt`, `liveness-contract.txt` (consolidated), `session-timeout-ms-full.txt`,
`heartbeat-interval-ms-full.txt`, `max-poll-interval-ms-full.txt`, `group-instance-id-full.txt`,
`group-protocol.txt` (extracted config blocks, full text).

## Ops
No installs (none needed; curl/python3 already present). No production/lane files mutated;
writes confined to `build/ScoutKafkaDeep/` and this report.

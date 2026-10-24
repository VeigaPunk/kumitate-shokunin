source: S112 (https://docs.temporal.io/workflow-execution — §Replays; reopened row — rejected in round 55, its recorded flip condition fired this round), S122 (https://kafka.apache.org/43/javadoc/org/apache/kafka/clients/consumer/KafkaConsumer.html — §Offsets and Consumer Position / §Manual Offset Control), S123 (https://docs.langchain.com/oss/python/langgraph/checkpointers — §Checkpoints / §Super-steps, reopened from queued row S028); S124 (Flink checkpointing) opened for the gate table, kept queued
verified-at: 2026-10-24 (HTTP 200 fetches 14:20–14:22Z; capture bodies and per-source receipts under `.ufo/waves/round-58/build/`)
recheck: `node .ufo/waves/round-58/probe/doctrine58-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <rev>` → `DOCTRINE58_HELD held=5/5`

# Failure recovery and replay — resuming work after the liveness verdict

The durable-execution line so far: delivery identity and dedupe
(`at-least-once-dedupe.md`, round 54), redelivery bounds
(`bounded-redelivery-budgets.md`, round 55), the lease slot
(`visibility-lease-ack-deadlines.md`, round 56), and the liveness signal
(`worker-heartbeat-liveness.md`, round 57). This entry takes the next step:
the worker has been pronounced dead and its unit of work reclaimed — how does
the work resume without loss or duplication?

## Temporal: event history and replay

- Temporal persists every action of a workflow execution as events in an append-only Event History, and recovery is reconstruction, not resurrection: a replacement worker resumes by replaying that history. receipt:.ufo/waves/round-58/build/ScoutTemporalReplay/body.html@sha256:79866f9f8e3a53a1b6a5059d7d1d04e2d7d7fb9b9d86a969c6e5de645851d66b
- The replay contract is stated in one sentence: "A Replay is the method by which a Workflow Execution resumes making progress." (S112, §Replays). receipt:.ufo/waves/round-58/build/capture-receipt-S112.md@sha256:d469a33387c5ae51d685f03d34a640d4faf9460768ee6394e269bd5beb95d873
- Replay is not trusted: "During a Replay the Commands that are generated are checked against an existing Event History." (S112) — the recovering worker re-derives commands and the server checks them against the recorded history, so a divergent replay fails instead of silently forking state. receipt:.ufo/waves/round-58/receipts/attest-run-1.txt@sha256:be2ad5ede7d62373978576baf7d716e43571c7433589e8c8fc6bbcab4b3009d9
- The durability claim is explicit: "Replays are necessary and often happen to give the effect that Workflow Executions are resumable, reliable, and durable." (S112) — resumption is an effect reconstructed from the log, not a kept-alive process. receipt:.ufo/waves/round-58/build/capture-receipt-S122.md@sha256:636b647fc2919fe24c1d6a02be8c1ac6192c0a153399ce89e2d66e9ce1bc46b4

## Kafka: the committed offset as recovery cursor

- Kafka has no replayable history per consumer; recovery is positional: "The committed position is the last offset that has been stored securely." (S122, §Offsets and Consumer Position) — the durable cursor from which a replacement consumer restarts. receipt:.ufo/waves/round-58/build/ScoutKafkaOffsets/body.html@sha256:ed0068fabe16e861a4be746dbd91db68c7fdef5742f08f6a51d3d26d209e9d41
- The commit invariant names the loss/duplication boundary: "Note: The committed offset should always be the offset of the next message that your application will read." (S122, §Manual Offset Control) — commit what is processed, never what is merely received. receipt:.ufo/waves/round-58/build/capture-receipt-S123.md@sha256:1f9445cda3f2182287cf702f414a78aa5da05df8ce37723598d9140b10b73abe
- Committing before processing trades duplication for safety, committing after trades loss: "In this case the process that took over consumption would consume from last committed offset and would repeat the insert of the last batch of data." (S122, at-least-once example) — the recovery cursor alone cannot dedupe; that is round 54's claim/repend layer. receipt:.ufo/waves/round-58/receipts/attest-run-2.txt@sha256:678a23c2649a4a927d05462526ba9007532753167ac57aaf63900adb3492a702

## LangGraph: checkpoints as resumable state snapshots

- LangGraph makes the snapshot explicit: "The state of a thread at a particular point in time is called a checkpoint." (S123, §Checkpoints) — recovery selects a snapshot instead of replaying a history. receipt:.ufo/waves/round-58/build/ScoutLangGraph/body.html@sha256:7effcf4dce8f2da1715281d68afa670ddbc10a3827fa9cdada921c5f5dc09ac0
- The snapshot granularity is the super-step boundary: "A checkpoint is a snapshot of the graph state saved at each super-step and is represented by a StateSnapshot object" (S123) — the same unit-of-progress boundary the dispatcher uses between claim and completion. receipt:.ufo/waves/round-58/probe/doctrine58-probe.mjs@sha256:11a050503e88c984ae6a9ce4dd4cbe9e9da75bc451e1a1dff250c2470e9386f5
- Resume points are discrete: "you can only resume execution from a checkpoint" (S123, §Super-steps) — recovery is quantized to committed snapshots; work since the last checkpoint is redone. receipt:.ufo/waves/round-58/probe/attest58-probe.mjs@sha256:6e5c67693f8409959f51bcab0a2255c44153b678b2934708a10812d32a69d84b

## Mapping onto the dispatcher

- The three models form a spectrum the dispatcher already spans: Temporal-style event history ≈ the handoff/result records, Kafka-style offsets ≈ the queue-and-claim cursor, LangGraph-style checkpoints ≈ the state writes at unit boundaries — recovery design picks where on the spectrum a unit of work sits. receipt:scripts/receipt-evidence.mjs@sha256:0ea6b66df7dcff4dc9381c688a5182fb1fe2c3be5353df7a52d3c6f2e006972c
- A replay/checkpoint is only as trustworthy as the record that vouches it — the round-58 `receipt-evidence` arm exists because a self-consistent record that never re-ran proved worthless as evidence (R57-V4): recovery state must be reproducible, not merely well-formed. receipt:.ufo/waves/round-58/receipts/attest-run-3.txt@sha256:eaad44411bdc79a2c3d958829a6ed21bc8cb59e2360922beaa547031f4d059f8
- The liveness signal (round 57) plus this recovery cursor close the loop the ops watchers instrument: dead worker detected → unit reclaimed → resumed from the recorded cursor; the remaining loss/duplication boundary is exactly the commit-invariant line above. receipt:.ufo/waves/round-58/base/census-before.txt@sha256:956febb003f2d4285c141c2d265e68194251b1102b3b867d14cb46f150bdcfff

## Withheld claims (named, not silently dropped)

- Flink's checkpoint knobs (S124, queued) — interval, timeout, storage — are engine-internal to an embedded streaming runtime; mapping them onto an orchestrator's state plane is left for a future round rather than forced. receipt:.ufo/waves/round-58/build/capture-receipt-S124.md@sha256:3fe05369fe75eb9a2bfe6ed8f17e848d191a9544e2db770ec91cab2fa1f3e78b
- Exactly-once claims on the checkpoint side are withheld: neither S112's replay check nor S123's snapshots by themselves dedupe side effects; the entry asserts resumption semantics only. The frozen predicate below keeps the claim scoped the same way. receipt:.ufo/waves/round-58/plan.md@sha256:6ff85421784f30cd763e256d182f3533df650df71c14772f9fe4a9518cff8772

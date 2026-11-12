# Kumitate: coordination delivery, cancellation, and ownership

Curation date: 2026-11-12 UTC. Destination: `VeigaPunk/kumitate-shokunin`, `considerthese/2026-11-12-coordination-delivery-and-cancellation.md`.

Status: proposed reading and practice, not an executed experiment, admitted capability, training round, or assimilation. No cluster, account, process-control setting, or repository was changed while preparing this dossier.

## Why this batch belongs here

Kumitate owns orchestration and tooling. Its current province explicitly includes durable execution, worker liveness, and isolation. Its registry already covers delivery identity, retry budgets, leases, heartbeats, sagas, and recipient fencing in prior curation. This batch addresses three different boundaries: when a watcher has actually observed a revision, when a cancellation request has actually stopped work, and when channel acceptance has actually delivered a task. Generic test-framework evaluation remains adjacent territory; these exercises are about orchestration contracts.

Novelty screen: the 412 locally available curation Markdown files were read by a whole-file term scan, together with the three live systems registries and recent logs. No etcd, errgroup, SPIFFE, service-worker, or bfcache family appeared in that curation scan. The only `mpsc` match was an unrelated pathfinding-paper URL. Porcupine was already curated and is deliberately not counted again. This is a bounded novelty claim, not proof that every historical branch lacks related work. Remote registry inspected: `corpus/SOURCES.md`, blob `abd4d5a5b2bb0fd20d47ea940f70ed17e28ff515`; current log reaches round 100 on 2026-11-07.

## 1. Watch checkpoints are logical progress, not an elapsed-time guarantee

Primary reading:
- [etcd v3.6 API guarantees](https://etcd.io/docs/v3.6/learning/api_guarantees/), sections KV APIs, Watch APIs, Operation completed, Revision. Opened 2026-11-12; versioned documentation, not a pinned binary.
- [etcd v3.6 API reference](https://etcd.io/docs/v3.6/dev-guide/api_reference_v3/), KV/Watch service definitions. The retrieved extract includes the service summaries; no claim here relies on a message field outside that extract.

**Method.** Use a revision as the checkpoint of a completed observation, rather than treating wall-clock delay, connection health, or an empty callback as proof of freshness. The guarantees page distinguishes strictly serializable KV operations from watches, which are not linearizable. Watches preserve revision ordering and complete revisions; progress notifications certify delivery through a revision for the watched key range, not global task completion. A broken watch can resume after its last received revision only within the retained history window. The document explicitly leaves watch delay unbounded. A timed-out write can have an uncertain completion status.

**Transfer to orchestration.** A coordinator reading a task table and then consuming changes needs a snapshot-plus-continuation protocol. It must not equate “watch connected” with “caught up.” A cache whose checkpoint falls behind compaction needs a fresh snapshot or another explicitly justified recovery route. Do not describe a local event queue as an authoritative durable log.

**Proposed exercise, not run:** a synthetic state-machine fixture with 12 histories: ordered two-key transaction, disconnect after a complete revision, reconnection within history, checkpoint compacted away, delayed delivery, progress-only notification, stale serializable read, timed-out write with later observed commit, timed-out write with no evidence, repeated reconnect, duplicate application across sessions, and a checkpoint accidentally advanced before the corresponding state is durable. Use symbols and JSON, no live cluster. If later permitted to test a real implementation, create only an isolated disposable instance with no user data and record its exact version.

**Report and falsifiers.** Publish the input history, snapshot revision, last applied revision, recovered state, unknown outcomes, and resnapshot reason. The deliberately broken “timeout means not committed” and “connected means current” implementations must fail at least one named case. Never turn an unknown completion into success or failure without evidence. This exercise does not prove raft correctness, production durability, or exactly-once side effects.

## 2. A task-group cancellation signal is not a kill operation

The earlier task-lifetime note already teaches cooperative cancellation and waiting for children using Smith's nursery proposal and Python 3.11 task groups. This unit does not count that principle again. Its new comparison is Go's first-error return, zero-value group behavior, blocking admission, TryGo, and cancellation after successful Wait, contrasted with Python's grouped-failure contract.

Primary reading:
- [Go errgroup implementation](https://github.com/golang/sync/blob/1f920df1e8fcf601d1aaf0f2ea500e1d2ccce105/errgroup/errgroup.go), `WithContext`, `Wait`, `Go`, `TryGo`, `SetLimit`.
- [Upstream tests at the same commit](https://github.com/golang/sync/blob/1f920df1e8fcf601d1aaf0f2ea500e1d2ccce105/errgroup/errgroup_test.go), as examples to study, not tests claimed to have run.

Pin: `golang/sync` commit `1f920df1e8fcf601d1aaf0f2ea500e1d2ccce105`, repository-head committer time 2026-10-15T16:17:03Z, opened 2026-11-12. That time identifies the checkout, not the original invention or release date. Source blobs: implementation `c261a8ebbddb180c4132ebe8993f262f6d622c14`; tests `92ac010e2652276b0c77d38f902a9afda302d350`.

**Method.** Separate admission, error propagation, cancellation, and settlement. A context-derived group cancels its context on the first non-nil task error or when `Wait` returns. `Wait` waits for every launched function to return. `Go` can block waiting for a concurrency slot; `TryGo` reports whether it started a task. `SetLimit` must not be changed while tasks are active. A zero-value group is usable but does not cancel on error. Cancellation-aware bodies and explicit shutdown are therefore part of the application design, not supplied by an error return alone.

**Proposed exercise, not run:** six bounded cases using finite fake tasks: all succeed; one fails while a sibling observes cancellation; one fails while a sibling ignores cancellation but exits after a fixed barrier; limit one with a queued admission; `TryGo` at capacity; successful `Wait` followed by attempted use of its canceled derived context. Freeze a 2-second per-case watchdog, maximum eight goroutines, no network, no child processes, and no user files. Prefer barriers over sleep-based scheduling. A watchdog exit is an inconclusive run, not a passed cancellation claim.

**Report and falsifiers.** Record each admission/start/cancel-observed/return timestamp and distinguish error count from the first error returned. Include an intentional implementation that returns when the first error arrives without waiting for siblings; the settlement check should reject it. Do not require a deterministic “first” error in intentionally concurrent races unless the fixture orders them. Keep panic behavior and group reuse outside the claimed contract.

## 3. Reserve capacity before moving a message into a cancellable send

Primary reading:
- [Tokio bounded channel implementation and API comments](https://github.com/tokio-rs/tokio/blob/ab0814fc8c62b3d8be40aad068e2fed6562cfeb0/tokio/src/sync/mpsc/bounded.rs), `Sender::send` lines 756–788, `Sender::reserve` around lines 1071–1119, and `Receiver::close`/`recv`.

Pin: `tokio-rs/tokio` commit `ab0814fc8c62b3d8be40aad068e2fed6562cfeb0`, repository-head committer time 2026-11-10T19:46:14Z, opened 2026-11-12; source blob `273e5ae433c35e314dd758a616a0585786e6f147`. These are source-at-commit semantics, not a claim about every published Tokio version.

**Method.** The docs distinguish a successful send from receipt. If a competing `select!` branch wins, a pending `send(value)` did not send the message, but the moved value is dropped. Reserving capacity before moving the value separates queue admission from ownership transfer. Canceling a reservation loses its queue position, so repeated cancel/retry is not fairness-neutral. Outstanding permits also matter when reasoning about receiver closure and draining.

**Proposed exercise, not run:** eight cases, one channel with capacity one, at most three tasks and a 2-second watchdog: normal send/receive; full queue then cancel a send; reserve then cancel before permit acquisition; acquired permit then drop it; send returns success followed by receiver drop before observation; close and drain buffered messages; close with a live permit; repeated reservation cancellation versus an uncanceled waiter. Use synthetic numbered payloads with drop counters. Record payload ownership and queue position separately. No live job submission.

**Report and falsifiers.** Provide sent, received, dropped, and still-owned IDs, plus closure/permit state. Reject a report that labels send success as completed work. A toy conservation invariant may count a payload in exactly one lifecycle state, but it does not establish business-level idempotency. Record an unresolved timeout as a failure to measure, not evidence of message loss.

## Reading order, rights, and iteration

Read etcd first for distributed observation; read errgroup next for local settlement; read Tokio last for local ownership. These contracts are deliberately not interchangeable. A queue, a canceled context, and a watch revision certify different events.

Rights: this dossier contains original summaries and exercise designs, not vendored source. Go's inspected LICENSE is the BSD 3-clause license; Tokio's inspected LICENSE is MIT. Preserve notices if later copying source or tests. The etcd website's complete reuse terms were not independently established in this pass, so the dossier links and paraphrases it without redistributing its text or assets.

For each future report, retain source pin or capture date, implementation/runtime/OS versions, exact fixtures and seeds, expected outcomes frozen before running, observations, deviations, negative controls, resource use, and one change justified by the result. A reviewer should reproduce the smallest counterexample before expanding the population. Stop expansion when two consecutive additions teach no new failure boundary, duplicate existing admitted claims, or require live privileges rather than disposable evidence. At that point consolidate the reports or propose the next training phase; do not silently begin it.

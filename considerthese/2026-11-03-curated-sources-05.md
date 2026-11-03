# kumitate: batch recomputation versus stateful task orchestration

Date: 2026-11-03 · Batch 5

**Unassimilated post-hyaku reading proposal; assimilation awaits the user’s explicit instruction.** No scheduler, cluster, test, dependency or training was executed or changed. This is a comparison of workload-driven abstractions, not a claim that Ray descends directly from or universally replaces MapReduce.

## MapReduce and Ray: where recovery responsibility sits

**Timeline and primary reading.** Dean and Ghemawat's [MapReduce](https://www.usenix.org/conference/osdi-04/mapreduce-simplified-data-processing-large-clusters), OSDI December 2004, exposes map/reduce functions while the runtime handles partitioning, scheduling and machine failures. Read programming model and fault tolerance. Re-execution is central to its recovery strategy; the model is attractive when work can be expressed as partitioned transformations and aggregation.

Moritz et al.'s [Ray](https://arxiv.org/abs/1712.05889v2) first appeared 2017-12-16; selected v2 is 2018-09-30, followed by [OSDI October 2018](https://www.usenix.org/conference/osdi18/presentation/moritz). Its unified task/actor interface addresses fine-grained, dynamic AI workloads with both stateless computation and retained process state. Read the programming model and fault-tolerance design, not the historical throughput headline as a current capacity estimate.

**Current practice bridge.** Ray's [Actor Fault Tolerance documentation](https://docs.ray.io/en/latest/ray-core/fault_tolerance/actors.html), re-read 2026-11-03 with page header 2.59.0, distinguishes process restart, task retry and application state recovery. Actors default to no restart and no task retry. Restart reruns the constructor; restoring important application state requires an explicit checkpoint/recovery design. An unavailable actor can leave execution outcome uncertain. This is a moving documentation observation, not an immutable implementation claim: attempts to retrieve its linked source path at the current repository head returned 404.

**What changed and stayed.** Retained actors can avoid expressing every interaction as another batch, but increase responsibility for state ownership, recovery and side effects. Failure still does not establish whether external work happened. Older batch-style recomputation remains useful for bounded, deterministic transformations with auditable inputs and outputs; an actor is not inherently a better coordinator. This design inference complements the lane's existing durable-execution and idempotency sources without re-listing them.

**Original future question.** After hyaku, which coordination state must survive if a worker finishes an external action and disappears before acknowledging? Draw the same fictional workflow as pure tasks and a stateful actor. Compare reconstruction evidence, duplicate-action risk and recovery ownership, explicitly marking unknown outcomes rather than converting every error into a safe retry.

**Rights and novelty.** MapReduce open reuse rights were not established; Ray's arXiv record grants distribution to arXiv. Only links and original commentary are included. Ray code's [license](https://github.com/ray-project/ray/blob/224e9461df5616949e392e1223a30e98135ea73c/LICENSE) is Apache-2.0 with component notices; that [head](https://github.com/ray-project/ray/commit/224e9461df5616949e392e1223a30e98135ea73c) was dated 2026-11-03T21:54:41Z. Neither paper family appeared in supplied context; Cosmic Ray is a different project.

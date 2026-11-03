# kumitate: curated sources to consider after hyaku

Date: 2026-11-03

**Status: unassimilated future reading.** These are candidate references, not trained knowledge, verified local capabilities, adopted dependencies, or changes to current training. Reserved for possible post-hyaku assimilation under the lane’s normal admission review. Earlier dated reflections remain unchanged.

Selection checked against the supplied PROVINCE, source registry and considerthese context, including exact URLs and source-entity mentions. No candidate code was executed.

## 1. Tokio: graceful shutdown

- Type: Runtime methodology.
- Primary source: <https://tokio.rs/tokio/topics/shutdown>
- Why this is worth considering: An explicit separation between deciding to stop, notifying tasks, and waiting for their termination. This directly complements kumitate’s worker liveness and durable-execution material by examining the local Rust task-lifecycle boundary.
- Possible later exercise: After hyaku, diagram one coordinator shutdown path and enumerate tasks that could outlive cancellation. Define a future bounded test for simultaneous external cancellation and worker completion, including who owns the final receipt.
- Boundaries and caveats: Cooperative cancellation is not forced process termination, durable workflow rollback or proof that remote work stopped. The tutorial is a reference pattern, not evidence about the installed OMP runtime or absent origin-host code.
- License/reuse: MIT for Tokio website repository. Evidence: <https://raw.githubusercontent.com/tokio-rs/website/master/LICENSE>.
- Currency/maintenance: Official living tutorial fetched 2026-11-03; record the dependency versions before adapting its examples.
- Duplicate check: no exact primary URL or source-entity match in the supplied lane context.

## 2. Loom: Rust concurrency permutation testing

- Type: Repository.
- Primary source: <https://github.com/tokio-rs/loom>
- Why this is worth considering: A focused instrument for exploring interleavings in small Rust synchronization components. Useful for a future minimal model of a worker completion/cancellation race rather than assuming a repeatedly passing integration test covers every schedule.
- Possible later exercise: After hyaku, identify one small shared-state transition and write its invariants on paper: no double completion, no lost wakeup and no premature all-workers-finished signal. Only later consider a separately authorized bounded Loom model.
- Boundaries and caveats: Loom requires instrumented synchronization and a bounded model. Its own README describes incomplete memory-model coverage, possible false alarms and missed executions; a passing result is not a proof of production correctness.
- License/reuse: MIT. Evidence: <https://raw.githubusercontent.com/tokio-rs/loom/master/LICENSE>.
- Currency/maintenance: Official commit history exposes changes on 2026-02-20 and 2026-01-12; cached history is not proof of the latest head.
- Duplicate check: no exact primary URL or source-entity match in the supplied lane context.
- Supporting evidence: <https://raw.githubusercontent.com/tokio-rs/loom/master/README.md>, <https://github.com/tokio-rs/loom/commits/master/>.

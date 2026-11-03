# kumitate: second curated source to consider after hyaku

Date: 2026-11-03

**Status: unassimilated future candidate after hyaku.** Reading proposal only: no training, execution, assimilation, dependency adoption or external changes. Earlier notes remain unchanged.

## Stateright: explicit network assumptions for coordinator models

- Primary source: <https://github.com/stateright/stateright/tree/ab8c8be9341505e0f71edbe5dd88ed275bd976a4>
- Domain fit and new gap: Extends the first batch’s local task-lifecycle and Loom interleaving focus to distributed message delivery. The Rust model checker exposes network ordering/duplication choices and distinct invariant, reachability and experimental liveness properties; its two-phase-commit example separates actions from consistency assertions.
- Precise reading: README.md — Features; Examples; src/actor/network.rs — Network variants; iter_deliverable; on_deliver; examples/2pc.rs — actions; next_state; properties.
- Future question: Does a coordinator’s single-completion claim survive duplicate and reordered messages?
- Proposed later evaluation (original lane-specific design): After hyaku, specify a two-worker paper state machine with claim identity, durable completion receipt, duplicate acknowledgments and reordered delivery. Define no-double-completion and no-premature-close invariants plus a reachable-success control. Compare ordered/nonduplicating assumptions with unordered/duplicating assumptions. Keep fairness, crash recovery and persistence outside the claimed model unless explicitly represented.
- Limitations: README marks liveness checking experimental/incomplete. Model bounds and network assumptions limit conclusions; the abstract 2PC example is not production atomic commit or proof about OMP. No compilation, runtime spawn or network exploration.
- License/reuse: MIT; official pinned license read at <https://raw.githubusercontent.com/stateright/stateright/ab8c8be9341505e0f71edbe5dd88ed275bd976a4/LICENSE>. Preserve applicable notices; dependencies and external data need separate review.
- Version/timestamp: Official API returned ab8c8be9341505e0f71edbe5dd88ed275bd976a4 with committer timestamp 2025-07-27T23:46:48Z. Commit snapshot, not a release assertion or proof of latest maintenance. Fetched 2026-11-03.
- Deduplication: All supplied lane existing-context files, including published first-batch notes, and existing-urls.json. Repository aliases and source-family names checked. Not a claim about unprovided historical files. No exact-URL or source-family match found.

### Verification links

- <https://api.github.com/repos/stateright/stateright/commits/ab8c8be9341505e0f71edbe5dd88ed275bd976a4>
- <https://raw.githubusercontent.com/stateright/stateright/ab8c8be9341505e0f71edbe5dd88ed275bd976a4/README.md>
- <https://raw.githubusercontent.com/stateright/stateright/ab8c8be9341505e0f71edbe5dd88ed275bd976a4/LICENSE>
- <https://raw.githubusercontent.com/stateright/stateright/ab8c8be9341505e0f71edbe5dd88ed275bd976a4/src/actor/network.rs>
- <https://raw.githubusercontent.com/stateright/stateright/ab8c8be9341505e0f71edbe5dd88ed275bd976a4/examples/2pc.rs>


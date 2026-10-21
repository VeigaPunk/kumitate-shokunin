FIDELITY scripts/fleet-dispatcher.mjs part B anchors=1 ok=0 moved=1 changed=0 gone=0

successor-chain.md:3 | `scripts/fleet-dispatcher.mjs :6753-7215` | `maybeEnqueueIterationSuccessor` / iterate-successor chain | moved | `scripts/fleet-dispatcher.mjs:5089-5270` (reconcile calls at :6510, :6596, :6629) | The chain minter is `maybeEnqueueIterationSuccessor` (`scripts/fleet-dispatcher.mjs:5089-5270`; re-anchored at 31c465f1).

Anchor evidence
- At 964f443e, :6753 begins inside `reapCandidate`; the range includes a `maybeEnqueueIterationSuccessor` call at :7190, but the minter definition is :5513-5694. At 31c465f1, :6753 is in the running-without-dispatch reconcile branch; the definition is :5089-5270, and reconcile invokes it at :6510, :6596, and :6629. The cited range therefore does not identify the minter at either checked revision; the feature's definition and reconciliation sites moved.
- Line counts: `git show 964f443e:scripts/fleet-dispatcher.mjs | wc -l` → 9829; `git show 31c465f1:scripts/fleet-dispatcher.mjs | wc -l` → 9224. Diff stat: `scripts/fleet-dispatcher.mjs | 1721 ++++++++++++++----------------------------` (558 insertions, 1163 deletions).
- Exact cited-range reads: `git show 964f443e:scripts/fleet-dispatcher.mjs | sed -n '6753,7215p'` starts at `if (mission.status === "stopped"...)` in `reapCandidate`; `git show 31c465f1:scripts/fleet-dispatcher.mjs | sed -n '6753,7215p'` starts in the `runningWithoutDispatch` reconcile branch. Function-location reads: old definition :5513, new definition :5089.
- The minter diff changes `digest(JSON.stringify(receipt))` to `receiptDigest(receipt)`. The pinned helper `ufo-mission-result.mjs:2382-2384` hashes the same `JSON.stringify(receipt)` bytes with SHA-256; no successor-identity behavior change was observed from that edit.

Runtime, rerouting, and saturation checks
- Canonical route/runtime: `routeGate` delegates to the shared `parseRoute`; the dispatch builder emits the single `omp` argv path, while `sightingCommand` uses `process.execPath` with the resolved wall script. Fallback hops are checked against the global route table before dispatch. No alternate runtime path found in the reviewed call chain.
- Same-identity rerouting: successor identity hashes the immutable route/routeChain and receipt-bound parent fields; `applyCapacityAdvance` only advances `routeIndex` and records `routeContinuity`. `recordDispatchResult` reloads the queue row by its unchanged key. The fallback route changes without minting a new task/run/session identity.
- Honest saturation: `claimNextTask` derives runner headroom from validated wall capacity minus in-flight reservations; it gates requested runners against that headroom. `runCycle` emits a runner-capacity hold only on a no-claim result with `runnerHeadroom === 0`, distinguishes L1/wall failures, and bounds dispatch iterations with one diagnostic iteration. No unsupported saturation claim found.

Other assigned-note inventory
- `reconcile-and-cycle.md:3-11` explicitly labels its 14,769-line `b18e0274d` material historical and says its L citations do not describe the current file; not a live member anchor.
- `remaining-scripts-census.md:43` is a path-only membership entry; its later dispatcher mention is prose, with no own-file line anchor or member heading.
- `singleton-and-queue-ownership.md:32-52` has prose/symbol references but no dispatcher line anchor or dispatcher member-section heading.
- `successor-chain.md:93-94` uses L-style source-list spans, and `successor-chain.md:10` uses `L5516`; neither is a `:N` continuation inside a dispatcher `##` member section. No dispatcher member-section heading occurs in the assigned notes, so these were not counted as anchors under the requested forms.

Residual behavior discrepancies in `successor-chain.md` (present at both pins; not changes introduced by this diff)
- `successor-chain.md:10-11` says `iterationOutcome.kind` is validated at `L5516` and includes `successor_superseded`. At 964f443e, :5516 only extracts `receipt.iteration` (the validator is :4673-4698); at 31c465f1, :5516 is `reportUntrackedScopes` (the validator is :4219-4243 and excludes `successor_superseded`). This line/behavior claim was already stale at baseline.
- `successor-chain.md:55-60` says `successor_superseded` is accepted and satisfies waiters. At 31c465f1, `validateQueueTask` at :4219-4243 omits that kind, and `CHAIN_TERMINAL_KINDS` / `CHAIN_SATISFY_KINDS` at :258-261 omit it; the corresponding 964f443e sets at :237-240 and validator at :4673-4698 do too.
- `successor-chain.md:41-44` says queue capacity parks as `continue`/`deferred: "queue_capacity"`. At 31c465f1 :5166-5188, a still-full queue returns `budget_halt`; 964f443e :5590-5612 does the same.
- `successor-chain.md:48-51` claims `lastEvalAt` preserves a park epoch. The pinned minter's outcome construction at :5093-5112 stamps `at` and has no `lastEvalAt`; baseline :5517-5536 has the same behavior.

Verification gaps
- LSP was unavailable: `read xd://lsp` returned `No such tool` and listed the mounted devices without LSP. No LSP status/references/definition/diagnostics queries were possible; source conclusions above are from pinned line reads and the diff, not grep output.
- No build, tests, or runtime checks were run (read-only fidelity assignment).

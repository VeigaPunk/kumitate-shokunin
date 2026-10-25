# Audit01 — Schema-CompletedNoExit

Assignment: verify that a validator results envelope with `status: "completed"` and no numeric exit is mapped faithfully by `make-dispatch-actual`.

## Verdict

**The named status-only case passes in the current mapper.** `resultEntries` (`scripts/make-dispatch-actual.mjs:187-218`) reads status at line 197, computes `statusExit = normExit(undefined, status)` at line 200, and selects `explicitExit ?? statusExit` at line 207. The exact mapper (`:105-120`) maps both `completed` and `settled` to numeric 0 at `:109-112`; `mergeRows` (`:275-293`) then marks a non-null exit settled and retains the original status. Thus no numeric `exit` is needed to map a completed row to exit 0.

### Reproduction: explicit status-only fixture

Scratch: `/tmp/kumitate-r61/Audit01/fixture/`.
Inputs: a 3-seat `swarm-registry.json` and a `ufo-swarm-results-v1` wrapper with each member carrying `name`, `status: "completed"`, agent ID and timing metadata, but **no `exit`, `exitCode`, `exit_code`, or `code`**. Reports were non-empty. Command:

```sh
node /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/make-dispatch-actual.mjs \
  --registry .ufo/waves/round-1/w1/swarm-registry.json \
  --results settle-status-only.json \
  --reports .ufo/waves/round-1/w1
```

Observed: `MAKE_DISPATCH_ACTUAL: CLEAN ... seats=3 sessions=3 exit0=3 reports=3 dead=0 members=3 gate=0`; gate: `DISPATCH_EVIDENCE: CLEAN (seats=3 sessions=3 exit0=3 reports=3 dead=0)`; process exit 0. All three output members have `exit: 0`, `settled: true`, `status: "completed"`; TSV records all three as `exit=0`.

### Actual round-61 OMP results comparison

The committed `.ufo/waves/round-61/close/w1-results.json` is `kumitate-wave-task-results-v1` with `{name, agentId, status}` entries; there are no numeric exits. Its rows are all `status: "completed"`. Running the current tool against those results and a scratch mirror of the real wave-1 registry/reports produced `CLEAN ... seats=32 sessions=32 exit0=32 reports=32 dead=0`; gate exit 0. The generated record equals the committed `.ufo/waves/round-61/w1/dispatch-actual.json` modulo `generatedAt` (comparison script output: `REPRO IDENTICAL (modulo generatedAt): True`).

This matches the actual OMP convention recorded in `.ufo/waves/round-61/w1/ScoutWaveValidator.md:25-27`: terminal `completed` is mapped to `exit=0`, explicitly disclosed as a convention (not claimed to be a process exit observed from OMP). The result status vocabulary is also corroborated by `/home/vgpnk/Projects/ufo-fsd-alpha/scripts/ufo-swarm-collect.mjs:107-116`, which maps OMP terminal `completed` to outcome `completed`.

### Remaining actionable coverage gap

Although the assigned `status=completed` case works, the mapper does **not** consume the actual mission-envelope shape described by ScoutWaveValidator. The collector's envelope has `subagents` entries with `outcome` and `state`, not `members` with `status` (`ScoutWaveValidator.md:12-16`; collector `STATUS_OUTCOME` at `/home/vgpnk/Projects/ufo-fsd-alpha/scripts/ufo-swarm-collect.mjs:107-116`). Current `resultEntries` only unwraps `members|results|seats|settled` (`make-dispatch-actual.mjs:187-189`) and only reads `status|state` (`:197`), not `outcome`. Reproducer `/tmp/kumitate-r61/Audit01/outcome/envelope.json` has `schema: "mission-envelope"` and `subagents: [{name, outcome:"completed", state:"started", agentId}]`; command failed closed with `MAKE_DISPATCH_ACTUAL: FAIL-CLOSED reason=RESULTS_UNREADABLE detail=members-absent` (process exit 2). A wrapper member with `outcome:"completed"` but no `status` is instead emitted `exit=-1`, `status:"unknown"`, and dead. This gap is separate from the tested `status`-only case, but it blocks direct use of the collector's mission envelope. `ExecDispatchSchemaTool.md:32-36` advertises validator settle output in supported wrappers but omits this distinction.

## Other probes (not findings for assigned case)

- `status:"completed", exit:1` is fail-closed as `RESULT_STATUS_MISMATCH` (exit 2).
- `status:"failed"` / `timeout` / `cancelled` without numeric exits produce non-zero exits and named dead rows; with their reports removed, the gate returns CLEAN because dead seats are intentionally named/uncredited. This agrees with the gate's dead-seat contract (`dispatch-evidence.mjs:113-127`).
- Unknown status does not earn exit 0; it becomes exit `-1`, unsettled, and dead.

## Verification record

Commands exercised: `node .../make-dispatch-actual.mjs` on status-only fixture, OMP round-61 results in scratch mirror, and envelope/outcome falsifiers; Python read-only comparison of generated and committed JSON; inspection of mapper, gate, and collector source ranges cited above. No installs or upgrades. No lane production files, gate scripts, source material, or wave-1 artifacts were modified; all fixtures and generated files are under `/tmp/kumitate-r61/Audit01/`. Report written only to the assigned w2 seat path.

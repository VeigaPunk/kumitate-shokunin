# `queueSummary` — fleet status projection (`fleet-dispatcher.mjs:10896`)

`queueSummary(queue, manifest = undefined, chainCtx = null)` (:10896) is the
status face of the queue: embedded on most verb results (:7681/:7685/:7695/
:7817/:7841/:7990/:9097/:14382) and the standalone face for `status`/`view`
(:13336/:13673/:13892/:13904). Everything it adds beyond raw rows is a
**diagnostic projection**: named consumers are the L0 monitor and verify's
falsifier queue (:11046); projections never block, never feed acceptance, and
never invent evidence (:10973, :11253, :11318, :11363).

Key-set discipline: every caller sees a byte-stable top-level key set —
telemetry that would churn the keys is deliberately kept OFF the summary
(:9201, :9297).

## Return shape (:11365-11402)

| Field | Content |
|---|---|
| `schema`, `revision` | queue file passthrough |
| `path` | queue path relative to ROOT |
| `counts` | per-state task counts over the full `QUEUE_STATES` set (:10897, QUEUE_STATES :149) |
| `starved` | pending rows that can never claim, with reason codes (below) |
| `lineageGaps` | live round>1 rows with non-mint provenance gaps |
| `supersessionOrphans` + `supersessionOrphansTruncated` | archived round>1 rows missing lineage stamps, ≤16 rows + `{truncated,total}` |
| `ledgerContinuityGaps` + `…Truncated` | per-scope chain TIPS missing a ledger generation, ≤16 + census |
| `ledgerContinuityUnavailable` + `…Truncated` | engaged ledger homes whose probe failed, ≤16 + census |
| `chainAdvancedBlocked` + `chainAdvancedBlockedArchivedTruncated` | blocked iterate rows superseded-by-forge (live ∪ archived-parent arm) |
| `deferredContinuations` | completed rows parked on a deferred continue |
| `parkedContinuations` | completed rows parked on `successor_error` |
| `membraneSeal` | seal-file state projection (`readMembraneSealState` :6709) |
| `tasks` | raw `queue.tasks` passthrough — last key |

## `starved` reasons (:10928-10968) — pending rows only, each reason once

| Reason | Predicate |
|---|---|
| `dependency_unsatisfiable` | `dependsOn` key absent from queue AND not archive-completed; dep `state=="failed"`; or dep `blocked` && `!isRependableBlock` (:10932-10945). `isRependableBlock` (:308) admits only `registered_mission_missing`+nonzero launcherExit, or fresh `route_chain_mismatch` (routeIndex 0, no continuity, alias present). ONE predicate shared by chain index + `dependencyGaps` (:10940, :296-299). |
| `after_runs_unresolvable` | `afterRuns` runId absent from queue∪manifest∪archive (`runIdKnown` :10646, `queueManifestKnownRuns` :10636). |
| `after_runs_unsatisfiable` | `afterRuns` runId has a `failed` row (`failed` is terminal; `stopped` deliberately excluded — resumable) (:10922-10925, :10950). |
| `after_chains_unsatisfiable` | some root resolves `dead` via `chainWaitState` (:4582). |
| `after_chains_unresolvable` | some root resolves `unresolvable` (:10960-10965). |
| `runner_ceiling_exceeded` | `requestedRunners > runnerCeiling()` (:10966, ceiling :5222). |

## `chainWaitState` order (:4582-4595) — load-bearing, comment :4570-4580

1. terminalKind (live record else archive) → `ready` if in
   `CHAIN_SATISFY_KINDS` {stop, budget_halt, decision_missing,
   successor_superseded} (:289) else `dead` (`CHAIN_TERMINAL_KINDS` adds
   `blocked`, `successor_error` :280-285)
2. `record.live > 0` → `waiting`
3. failed or blockedNonRependable members → `dead`
4. `unresolvedGlobal > 0` → `waiting` (orphan/cycle stalls EVERY waiter:
   fail toward wait, never release :4516)
5. archived key that is not a chain member → `ready` (degenerate
   single-shot completed row)
6. else → `unresolvable`

Parked-recoverable trap (r08): a `successor_error` outcome with
`recoverable:true` on a terminal row counts as LIVE, not terminal evidence —
reading it as dead starved every afterChains waiter for the parking window
(:4543-4556). Terminal evidence counts only on TERMINAL_TASK_STATES rows
(:4542) — `iterationOutcome` on a live row is incoherent, never evidence.

## `lineageGaps` (:10974-10984) — via `nonMintContinuationGaps` (:10697)

Round>1 rows only (round ≤1 returns `[]` — a genesis row needs no mint). Gap
codes: `lineage_missing` (no `lineage.parentTaskKey`),
`parent_self_reference`, `parent_unresolvable` (parent in neither queue nor
archive), then the **r07 contradictory-field arm** — parent row is live, so
stamps must AGREE: `parent_run_id_mismatch`, `parent_round_mismatch`
(lineage.round ≠ parent.round+1), `chain_root_mismatch` (:10676-10693). Plus
`prior_result_missing`, `prior_receipt_missing`, `chain_root_missing`
(pattern-checked `task_[a-f0-9]{24}`). One predicate, three readers
(status projection, claim-time admission stamping, successor-mint dedupe —
r21/nc7: a copied predicate drifts). Archived parent = evidence-availability
limit, never a guessed mismatch (:10671-10673). Row shape:
`{key, round, gaps, admittedAt?}` — absent `admittedAt` = unadjudicated
(the honest r86-fossil signal; claims claim-adjudication only, never
forge-identity :10977-10980).

## `supersessionOrphans` (:10996-11024)

Archived round>1 chain-fold rows missing `{lineage_missing,
prior_result_missing, prior_receipt_missing, chain_root_missing}`.
Attribution corrected r26: all historical orphans are L0 `forgeSuccessor`
mints (which write no lineage/prior-evidence stamps by design), NOT a
pre-r23 supersession mint (:10985-10994). 16-row bound is payload
protection, not census — `{truncated,total}` always emitted so orphan 17+
can never disappear silently (:11018-11023). `admittedAt` passthrough:
pre-r09 rows stay bare, truthfully (:11012-11015).

## `ledgerContinuityGaps` / `…Unavailable` (:11052-11246)

A completed, continue-decided round owes its chain a ledger generation bound
to `sha256(runId)`. Checked per scope (`refinementScopeForTask` :6318 —
first `.ufo/scopes/<name>` entry in `task.scopes`) on the chain **TIP only**
(newest round; `createdAt` tiebreak) — older generations may have rotated
out of retention and would false-positive (:11030-11036, live repro cited).

- **Coverage set** = canonical store `successor.parentRunIdDigest` + valid
  managed archive `stamp`s + per-chain `ledger.<id>.json` live store digests
  (r43: chain homes bind generations independently — e2e r49 was bound by
  `ledger.c0.json` while the canonical store bound c3; canonical-only
  flagged it :11168-11179).
- **Never-engaged** (`coverage.size === 0`) → skipped silently; no contract
  to enforce (:11221).
- **Unavailability** reports only on ENGAGED homes (store file exists):
  `existsSync(ledgerRel)` gates the census (:11151-11161). Probe failure
  vocabulary: `timeout` | `spawn_fault` | `exit_nonzero` |
  `malformed_json` (:11132-11145) — pre-r29 every failure fell through to
  the same silent continue as a clean read, so a broken CLI read as perfect
  continuity (:11086-11093).
- Emission is **digest-only**: `runIdDigest` = sha256(runId), gap code
  `ledger_generation_missing`; no raw runIds leave the projection
  (:11037-11039, :11222-11232).
- The durable `ledger_generation_missing` EPISODE is emitted at the runCycle
  site (r33 A7), never from this projection (:11043-11046).

### Probe machinery — `spawnSync` once per scope (:11127-11130)

`node PRIMEAGENT_LEDGER_CLI status --ledger <rel> --json` (`:6314`,
`primeagent-refinement-ledger.mjs`), 15 s timeout, 256 KiB maxBuffer.
Per-chain probes use `ledger.<chain>.json` siblings; chain id grammar
`/^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/` (:11191-11213); per-chain failures
land as `null` digest — never coverage.

Two-level memoization:
- `ledgerStatusProbeMemo` (:10750) — process-local Map `ledgerRel →
  {key, probeFailure, parsed, chainDigests}`; caches the PROBE RESULT
  (failure + reason included), never a blanket "ok"; bounded to the pass's
  probed scope set (:11234-11240).
- `LEDGER_PROBE_CACHE_PATH` (`<UFO_STATE>/ledger-status-probe-cache.json`,
  schema `ufo-ledger-probe-cache-v1`, ≤1 MiB :10771-10773) — r46
  cross-process cache; **success envelopes only**, failures never persist
  (a transient fault must not read `unavailable` to every later poll
  :10757-10764); corrupt/oversize/symlink → EMPTY, never verdicts
  (:10803-10828); write is exactly the post-sweep scope set, fail-silent
  (:10830-10846).
- **Key = `ledgerProbeEvidenceKey`** (:10858): store stat tuple
  `dev:ino:size:mtimeNs:ctimeNs` + ledger DIR tuple + sorted per-entry
  signature + `policy:` :10751 (`LEDGER_STATUS_POLICY_PATH` →
  `config/primeagent-assimilation.json`) +
  `cli:` + `node:` tuples. Absence is a key VALUE (`"absent"`/`"dir:absent"`)
  — a later-appearing store is a different key, never a stale hit. Any
  unstatable path → `null` key → never memoizes (unknown provenance
  re-probes, and drops any prior cached verdict :11096-11102). The CLI's
  own bytes are in the key because replacing the script under an unchanged
  store changes every answer (:10883-10888).

## `chainAdvancedBlocked` (:11254-11309) — superseded-by-forge projection

A blocked iterate row whose canonical next-round `resultPath`
(`resultPathWithRound(round+1)`) is owned by another row is superseded,
not a live blocker. `chainAdvancedSuccessor` (:8776) is ONE predicate
shared by the rependTask `chain_advanced` refusal and this projection (r21)
— live `queue.tasks` match first, then archived `resultPathOwners`
(completed rows only; `archived:true` marks the synthetic row :8789-8794).
Archive-side parity arm (r30 M1a): `archive.blockedRows` (projection-only
index built by `ingestCompletedTask` :4610-4621 — archived blocked rows
NEVER satisfy dependsOn/afterRuns, never join terminal evidence, never own
result paths) keeps naming archived parents with `parentArchived: true`;
only `advanced.state === "completed"` qualifies (:11291). ≤16 rows,
`{truncated,total}` always emitted. Named consumers: L0 monitor, verify,
e2e, watchdog pre-filter (:11250-11252).

## `deferredContinuations` (:11319-11344)

Completed rows with `iterationOutcome.deferred != null` — live respawn
state, not settled history (a fleet-wide seal park or un-draining
`scope_occupied` is otherwise invisible). Row: `{key, round, deferred,
at, lastEvalAt, wouldBeTaskKey?, wouldBeRunId?, successorRound?,
sealRunId?, scopeOccupiedBy?}` — `at` is the park epoch (r43:
`lastEvalAt` rides so park age AND churn depth are readable without
opening the queue file); conditional passthrough, never synthesized
identity (:11339-11343).

## `parkedContinuations` (:11350-11360)

Completed rows with `iterationOutcome.kind === "successor_error"` —
terminal-prose parks that read as ordinary completed history without this
surface. Row: `{key, round, recoverable, code?, error?}`; always present,
zero-stable.

## `membraneSeal` (:11364) — `readMembraneSealState` (:6709-6740)

Seal-file projection for the gate's input state (never bytes beyond it):
`{present:false,stands:false}` absent; `stands:true` requires
`kind=="ufo-membrane-seal-v1"` + nonempty `run_id` (then `runId`, `round`,
`path` ride); present-but-broken named by `reason`: `symlink` |
`not_regular_file` | `unreadable` | `unrecognized_shape`.

## Caller-context rule (:10911-10916)

`manifest === undefined` → the summary loads `sightingManifest` itself
(absent = "no known runs", honest); explicit `null` = caller already tried,
no mid-verb read skew. `chainCtx` lets the caller supply
`{chainIndex, archiveChains}`; absent → `liveChainIndex(queue.tasks)` +
`archive.chains` (:10926-10927).

## Cross-references

- Archive index + `ingestCompletedTask`/`foldArchiveChains`
  (`fleet-dispatcher.mjs` `archivedCompletions` :4789 —
  `unsafe`/`over_bound` fail-closed-empty with latched `queue_archive_unsafe`
  telemetry :4796-4801; `faults` travel with the index :4815). Side map:
  `corpus/knowledge/enqueue-admission.md`.
- `dependencyGaps` (:12615) — per-row dep/run starvation used by `status`'s
  per-task drill-down, shares `isRependableBlock` and the chain context
  (:12088-12200).
- Ledger status shape consumed here is produced by
  `scripts/primeagent-refinement-ledger.mjs` (`successor.parentRunIdDigest`,
  `archives.list.slots[].stamp`, `chains.detail[].archiveSlots`).

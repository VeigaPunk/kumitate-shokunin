# Fleet-dispatcher tail — reconcileQueue, runCycle, latch machinery, CLI surface

`scripts/fleet-dispatcher.mjs` tail (L8650-14769; sha256-pinned `44a3c781…`).
Condensed from the round-6 scout map (`local://kumitate-r6-dispatch-tail.md`,
revision 2 — all cited start lines re-verified) plus parent line-reads of
`reconcileQueue` (L9760-10552), `runCycle` (L13415-14102), the emitter latch
(L11735-12084) and `main()` (L14295-14769). A critic lane falsified one ordering
claim (head-call order) — the corrected order is below.

## Constants (definition sites)

`MAX_QUEUE_BYTES` 4 MiB L112 · `MAX_LAUNCH_MISSES` 8 L118 · `LAUNCHING_GRACE_MS`
120 s L124 · `MAX_QUEUE_TASKS` 256 L125 · `AUTO_REAP_RESULT_AGE_MS` 60 s L129 ·
`AUTO_REAP_WITHHELD_ALERT_MS` 600 s L134 · `ACCEPTANCE_GRACE_MS` 60 s L142 ·
`ACCEPTANCE_SETTLE_REASONS` L143-147 = `{result_file_missing,
result_unreadable, result_empty, receipt_missing, receipt_unreadable,
receipt_torn, receipt_report_mismatch}` · `TERMINAL_QUEUE_STATES`
`{completed, failed}` L150 · `CAPACITY_FAILURE_CLASSES`
`{usage_limit, rate_limit, model_unavailable}` L196 · `HALT_FAILURE_CLASSES`
`{authentication, permission_denied, invalid_request}` L197 ·
`BUDGET_HALT_CLASSES` `{timeout}` L200.

## Stopped-mission failure machinery (L8680-8808)

- `classifyStoppedMission` L8680-8690: adapter over `classifyFailure` L1697;
  the mission's `failure.message` is the ONLY verbatim message source —
  `lastDispatch` carries no `message` field by design.
- `applyClassifiedFailure` L8693-8736, FIRST-MATCH-WINS order:
  1. `servedExactRoute && capacity` → `pauseForResume` (no hop — exact-route
     tasks have no chain to advance), action `pause`.
  2. `nextCapacityRoute` truthy → `applyCapacityAdvance`, `pending`,
     `route_capacity_advance` retryable + `queue_route_continuity` line.
  3. capacity, no next route → `blocked`, `route_chain_exhausted`
     retryable:false.
  4. `BUDGET_HALT_CLASSES` → `blocked`, `budget_halt_<fc>`.
  5. `HALT_FAILURE_CLASSES` → `blocked`, blocker.code = the class.
  6. default → `pauseForResume`.
- `recordLaunchMiss` L8742-8760: misses >8 → `blocked`,
  `launch_registration_exhausted` + `queue_launch_misses_exhausted`; else
  `pending` + `launch_not_registered` retryable + `queue_launch_miss`.
- `chainAdvancedSuccessor` L8776-8795: joins live queue AND
  `archivedCompletions().resultPathOwners` — a queue-only scan evaporates
  after capacity relief archives the successor (r28). ONE predicate shared by
  the `rependTask` `chain_advanced` refusal and `queueSummary`.
- `precheckDispatcher` L8808-8885: `selfParse` (node --check) + `queue` +
  `manifest` + `singleton` probe + `ledgerModules`. **`checks.singleton.ok` is
  always true — branch on `checks.singleton.state`**
  (`free|held_live|held_dead|unknown|unsafe|unfenced_live`). `precheck` verb
  exits 1 on `!ok` (L14344-14348) and is **absent from USAGE** (trap).

## `reconcileQueue(queue, manifest, reapCandidates, observations)` L9760-10552

Head calls IN ORDER (critic-verified):
1. `sweepGraceDeferLatch` L9766, 2. `sweepRowFaultLatches` L9767,
3. `pruneAdmissionLatch` L9774 (r40: retire latch entries for departed rows).
Then two parked-continuation scans BEFORE the per-task loop:
- Deferred-successor re-mint L9785-9837: `completed` + iterate +
  `iterationOutcome.deferred`; `membrane_sealed` parks while the seal stands;
  `queue_capacity` parks while at cap AND `simulatedReliefCount` cannot free a
  slot; a live recorded blocker skips; a `blocked` recorded blocker is NOT
  live and re-attempts. Invalid bound receipt → `deferred_receipt_invalid`
  once per episode per process (`deferEpisodeMemo` keyed by
  `runId|reasonCode|outcome.at`).
- `successor_error` recovery scan L9847-9891: parked recoverable rows
  re-validate the receipt then re-mint with `{recovery:true}` — the mint owns
  decision semantics; identical faults keep original outcome bytes (r07/r32).

Per-task loop L9893+, `mission = matchingMission(task, manifest)`:
- Mission `completed`: receipt-valid → admission + `completed` + drain deferred
  + mint successor (L9921-9993); receipt-invalid → 60 s `ACCEPTANCE_GRACE_MS`
  (Math.abs, both directions) only when `reasonCode` ∈ ACCEPTANCE_SETTLE_REASONS;
  grace lapses → `blocked` `acceptance_receipt_missing` or
  `acceptance_evidence_missing`, both retryable:false; latched
  `acceptance_grace_deferred` per row per episode.
- Mission `stopped` L9995-10043: non-terminal row + VALID receipt →
  `settleLiveEvidence` (evidence of FINISHED work beats failure
  classification — r14 duplicate-round class); terminal rows excluded. Then
  running/launching rows take `applyClassifiedFailure` with resetAt/
  retryAfterMs parsed from the mission's own stop message FIRST, else
  `lastDispatch.at + retryAfterMs` made absolute (never re-arms).
- Mission live L10044-10287: settle BEFORE reap (A5). Running + aged +
  era-current + valid → `settleLiveEvidence` then `settlementBasis` reap
  candidate; else typed `emitReapWithheldEpisode` reasons
  (`evidence_stale_era` | `live_without_evidence` past the 600 s age floor |
  `receipt_invalid`). A `completed` row under a live mission is REOPENED to
  pending (retryable) or blocked — only when no reap candidate registered AND
  `mission.createdAt > lastDispatch.at` (not the row's own completion
  mission); evidence-driven reversals name `ACCEPTANCE_EVIDENCE_STALE_CODE`,
  attested failures keep the classified blocker; `retractAdmission` narrates
  BEFORE the state write + `queue_task_reopened` latched per
  `(key|fromState|toState|missionId)` episode.
- Live mission + row pending/paused/blocked L10238-10283: OWN-ERA guard —
  `mission.createdAt <= lastDispatch.at` is stale evidence (never flips to
  running); `phantomLaunch` (nonzero launcherExit + own-era mission) likewise;
  only a newer-than-dispatch mission reopens (sets `runningWithoutDispatch`,
  clears `reopenEpisode`, resets `resumeAttempts`).
- No mission + `launching` L10288-10303: inside 120 s `LAUNCHING_GRACE_MS`
  (Math.abs) leave untouched; else `recordLaunchMiss`.
- No mission + `running` L10304-10317: `runningWithoutDispatch` → `blocked`
  `resume_identity_missing` retryable:false; else `blocked`
  `registered_mission_missing`.
- No mission + `paused` L10318-10351: capacity-class blocker → `pending`
  carrying `resumeAt` (`resume_identity_missing` RETRYABLE); else `blocked`
  `resume_identity_missing`.
- No mission + `blocked` + `registered_mission_missing` + nonzero
  `launcherExit` → `recordLaunchMiss` (L10352-10361).
- No mission + `blocked` + `route_chain_mismatch` + fresh row
  (`routeIndex===0`, no continuity, has `l1Alias`) L10362-10417: retry
  `ensureTaskContinuity` → `pending` + `route_chain_mismatch_recovered`; on
  throw, `healCatalogRotation` (authority rotated coherently) → `pending` +
  same kind `via:"catalog_rotation"`; else stays blocked, no churn.
- Catch L10419-10456: a PARKED completed row keeps `completed` with
  `reconcile_error` RETRYABLE marker (chain re-mints when the fault drains);
  non-parked → `blocked` retryable:false + `retractAdmission("reconcile_fault")`
  (retires the admission like the reopen arms). `emitRowFault` durable
  `reconcile_task_error`.
- Finally L10457-10526: clean pass deletes `reconcileErrorLatch` entry +
  clears the retryable `reconcile_error` marker; observation projection
  failure → durable `observation_project_failed` with
  `observationRefusalReasonCode` — the retained-completed-row-under-live-
  mission pair is a DESIGNED refusal, never weaken it (r37).
- Tail L10528-10550: live manifest missions matching NO task →
  `queue_orphan_mission` once per mission per process.

## Latch / episode machinery (L9140-12084)

- `emitLatched(kind, fingerprint, payload, {close, sink})` L11856-11906: same
  fingerprint → `count++`, `lastTs`, payload refresh, persist only for
  DURABLE kinds; different fingerprint + `close:true` + `prior.count > 0` →
  `{kind}_closed` line (distinct kind — a same-kind close reads as a new
  fault, M36-C) then opens the new episode. `firstTs` = the open ROW's actual
  `ts` (sink-stamped), never a pre-write `now`.
- `DURABLE_TELEMETRY_KINDS` L11735 = `{ledger_event_drift,
  ledger_terminal_verdict_revision}` — only these persist latch STATE to
  `.ufo/emitter-latch.json` (`ufo-emitter-latch-v1`); all other emitLatched
  kinds are durable only in the emitted row.
- **Mutation vs deletion asymmetry (r40)**: mutation sites call
  `emitterLatchTouch()` = reload-adopt THEN persist; deletion sites call
  `emitterLatchPersistDeletion()` = persist ONLY. Reload-then-delete would
  re-adopt the just-deleted entry and resurrect it. Cross-process adoption:
  local fresher fingerprint wins; same fingerprint keeps `max(count)`.
  Namespaces: `telemetry|`, `autoReap|`, `blocked|`, `claimDefer|`,
  `graceDefer|` (persist L11801-11822, adopt L11740-11790).
- `clearLatched` L11911 = silent delete (recovery clears so a recurrence
  opens fresh); `recoverLatched(kind, recoveredKind)` L11929 emits the
  DISTINCT recovered kind carrying `count`/`firstTs`/`lastTs`.
- Repend-refusal latch `.ufo/repend-refusal-latch.json`
  (`ufo-repend-refusal-latch-v1`, 512-episode cap) — repend is a fresh
  process per watchdog tick so the latch must be durable.
- `queue_auto_reap_withheld` has its OWN peer-merged latch file
  (`loadReapWithheldLatch` L9391; emit re-reads the persisted file inside the
  queue lock for cross-process dedupe, L9461-9482); close kind
  `queue_auto_reap_withheld_closed` fires even at count 0.
- `blockedFingerprint` L11494 keys on episode CONTENT (state +
  `canonicalBlockerKey`), never `task.updatedAt` — a foreign writer touching
  `updatedAt` on a still-blocked row cannot double-emit. `sweepBlockedLatch`
  at pass start, `collectBlockedRows` at pass end, `emitBlockedRows` after
  lock release (L11533-11636).
- Drift episodes: `driftRowFingerprint` = stored `fingerprint` else sorted
  `eventIds` join; `unclosedDriftEpisode` scans a 256 KiB ledger tail
  (O_NOFOLLOW) pairing opens to `{firstTs,lastTs}` closes or
  `ledger_event_drift_recovered`; `closeDriftEpisode` has two arms — `latch`
  (this process holds it) and `journal` (open row proved from ledger bytes
  alone; can only under-close). `count` on a close line = EPISODE count;
  drifted-EVENT count rides `driftEvents` (pre-r35 rows used `count`).

## `runCycle({allowDispatch})` L13415-14102 — the daemon pass

Ordered pipeline (my line-read; critic-verified):
1. `emitLedgerModuleTelemetry`; binary-drift memo keyed on drift FACTS (not
   boolean) → one `daemon_binary_drift` line per drift STATE per process.
2. `dispatchPolicy()` config preflight (stat-key cached).
3. `sightingManifest()` — absent → `manifest_invalid` console + durable-latched
   `wall_probe_failed` and `{ok:false, reason:"manifest_unavailable"}`.
4. Idle fast-path L13485-13500: only when NO manifest mission is live AND a
   lock-free queue peek finds every row `completed|failed` — a `blocked` row
   forbids the fast path (`idle` skips the ~0.66 s `status` spawn).
5. `sightingStatus()` probe (or synthetic empty status when skipped); failure
   → `wall_probe_failed` + `{ok:false}`; success → `recoverLatched` to
   `wall_probe_recovered` + clear `claim_loop_probe_failed`.
6. Manifest re-read (probe may have refreshed it) → `observedProcesses` →
   `registryRevision` → `appendLifecycleEvents` (ledger append + dedupe +
   drift); degraded coverage → `ledger_coverage_degraded`.
7. Head lock-pass L13668-13674: `reconcileQueue` + writeQueue +
   `persistObservations` + `queueSummary`.
8. `reapCollected()` head reap L13542-13667: one manifest read per batch,
   stat-keyed queue re-reads; per candidate re-derives `reapCandidate` on
   FRESH bytes — evaporated → `queue_auto_reap_skipped` with reason
   `task_missing`|`no_longer_reapable`|`evidence_changed_since_settle`|
   `mission_changed` (and a TOTAL `cause` vocabulary); else
   `sightingCommand complete --mission … --note …`; per-row dedupe latch on
   both success and failure arms (namespaced so neither inherits the other's
   count).
9. Claim loop L13684-13860 (gated on `allowDispatch && !probeSkipped`): bound
   `min(runnerCeiling, headWall.runnerHeadroom + 1)` — the +1 lets the
   terminating no-claim iteration log its hold reason; first iteration reuses
   the head probe only when `reapedAtHead === 0`; mid-loop probe/manifest
   fault breaks with `claim_loop_probe_failed` latched. Per claim:
   `queue_claimed` → `dispatchQueuedTask` (throw → `queue_dispatch_throw` +
   synthesized `dispatch_internal_error` outcome, never strands) →
   `recordDispatchResult` → `queue_dispatch` (carries `promptRenderedSha256`
   sidecar digest + `dispatchedAt` stamp) → `reapCollected()`; `!spawned`
   breaks the loop. Empty claims name their hold: `wall_capacity_unavailable` |
   `queue_l1_capacity_hold` | `queue_runner_capacity_hold` (all latched).
10. Tail reap → conditional tail probe (only when dispatched or reaped) →
    unconditional tail lock-pass: `sweepBlockedLatch` + `reconcileQueue` +
    `collectBlockedRows` + `emitBlockedRows` after release — a third
    reconcile runs if that tail reap collected (L13895-13905).
11. Post-cycle episode maintenance (source order): route transitions console
    line; `ledger_event_drift`/`_inconclusive`/`closeDriftEpisode`;
    `manifest_runway_low` (25 % of 1 MiB bound, advisory only);
    `ledger_continuity_gap`/`_inconclusive`/`ledger_continuity_recovered`
    (tip-only gaps; `continuityCloseAttribution` names `repair` vs
    `basis_departed` close causes).
12. Return `{ok, autoReaped, probeSkipped, active, levels, registryRevision,
    activeRunners, runnerHeadroom, l1Missions, observedProcesses, reconciled{…},
    queue: finalQueue, deferralCounts, claimLoopProbeFailure, dispatched}`.

## `main()` CLI surface (L14295-14769)

`--help` answers before config reads. `sweepOrphanTmpFiles` is skipped on
`status`/`view` (honest reads). Verbs:
- `view` — lock-free wall projection.
- `enqueue --spec|--spec-json|--specs [--dry-run]` — exactly one source.
- `precheck` — exits 1 on `!report.ok` (not in USAGE).
- `repend --run gq<16hex>` — watchdog's queue door.
- `archive-completed` — lock + relief + `queue_capacity_relief`
  (`trigger:"archive_completed"`).
- `status` — lock-free readQueue + `queueSummary` + censuses
  (`unarchivableCompleted`, `queueArchive`, `reapWithheld`, `emitterLatch`,
  `admissions`) + `binaryDrift` + ledger coverage (with its own
  `ledger_coverage_degraded` latch edge) + `manifestStatusBlock`.
- `compact` — `compactQueue`.
- `once` — one `runCycle` pass under CycleStamp {boot, cycle:1}; cycle errors
  → typed kinds queue_lock_timeout|queue_invalid|
  queue_archive_unreadable_refused|ledger_lock_timeout|dispatcher_cycle_error
  and `{ok:false, reason:…}` with NO `dispatched` key.
- `daemon` (default) — two-leg fence: `bootIncumbentState` (covers fenced +
  unfenced incumbents via /proc) THEN `acquireSingletonLock`
  (`fleet-dispatcher.lock`) → `dispatcher_singleton_refused` /
  `daemon_already_running`, exit 1. `dispatcher_start` → `publishDispatcherBoot`
  → `publishLiveness("boot")` → per-cycle `logCycleStamp` {boot, cycle} →
  `runCycle`; EVERY path publishes liveness (error → `"cycle_error"`, ok →
  `"ok"|"refused"`) — the watchdog predicate is "no publish for >N s". Cycle
  errors typed as `once` + latched (`queue_lock_timeout`, `queue_invalid`,
  `queue_archive_unreadable_refused`, `ledger_lock_timeout`, else
  `emitDaemonCycleError` fingerprinted on the redacted payload). Hourly
  orphan-tmp sweep; skip the poll sleep only when a dispatch spawned.
- Top-level catch L14738-14767: usage errors → `dispatcher_usage_error`
  console-only (no ledger pollution), else typed crash kinds, exit 1.

## Traps

- Withheld fingerprints are POSITIONAL (`mission.id|reason|attempts`); the id
  is recovered from all-but-last-two segments — changing the shape silently
  changes the close predicate.
- Gauges stay off fingerprints: `ledgerLockHeldMs`, `active` are payload-only
  (a growing field in a fingerprint = per-cycle row storm, measured 2/75 s).
- `removeStaleManifestRow` is the dispatcher's ONLY manifest write, reachable
  only via `rependTask`'s deadlock-class gate.
- Mission freshness is compared via `mission.createdAt` vs `lastDispatch.at`;
  an absent/unparseable `lastDispatch.at` makes the own-era guard vacuous in
  one direction — missions registered after a missing stamp still reopen.
- A persistently-erroring PARKED row re-stamps `updatedAt` each pass
  (change-guard compares `completed` vs `blocked`; the marker write is
  unconditional) — cosmetic churn, not a fault signal.

# Fleet-dispatcher front half — queue schema, claim, dispatch, repend

`scripts/fleet-dispatcher.mjs` (14,769 lines), everything before the
successor machine at :6753. Citations `L<line>` are this file.

## `scripts/fleet-dispatcher.mjs`

**Live member (round-32 re-census).** Origin HEAD `964f443e`; sole S1 member
path `scripts/fleet-dispatcher.mjs`; `wc -l` → **9829** (the SCORECARD cell
still reads 14769 L — parent refreshes the registry cell). Content sha256
prefix `ba5e02beac55`. The companion suite `scripts/fleet-dispatcher.test.mjs`
is S8 remainder, not S1.

**Current-file anchors** (post-2026-10-12 tree; bare `L<n>` cites in the topic
sections below remain historical against the superseded 14,769-line revision):

- `QUEUE_SCHEMA` at `scripts/fleet-dispatcher.mjs:95`
- `writeQueue` at `scripts/fleet-dispatcher.mjs:4853`
- `acquireQueueLock` at `scripts/fleet-dispatcher.mjs:4942`
- `maybeEnqueueIterationSuccessor` at `scripts/fleet-dispatcher.mjs:5513`
- `admitQueueCandidates` at `scripts/fleet-dispatcher.mjs:5956`
- `reconcileQueue` at `scripts/fleet-dispatcher.mjs:7078`
- `queueSummary` at `scripts/fleet-dispatcher.mjs:7624`
- `runCycle` at `scripts/fleet-dispatcher.mjs:8966`
- `main` at `scripts/fleet-dispatcher.mjs:9536`


## Queue file & locking

- Path: env `UFO_PENDING_WORK_PATH` (ROOT-anchored) else `config/ufo.json`
  `sighting.dispatch.queuePath`; always confined beneath `.ufo`
  (queueFile L4323, `assertQueuePath` L5293). Schema `ufo-pending-work-v1`
  (QUEUE_SCHEMA L96): `{schema, revision, tasks[]}` (`validateQueue` L5583).
- Writes: tmp+rename+fsync+dir-fsync, `revision++` per write
  (`writeQueue` L5743-5774).
- Lock: `mkdir ${queueFile}.lock` + `owner.json {pid,token,at}`
  (`acquireQueueLock` L5852), 30s acquire budget (QUEUE_BUSY L5824);
  stale reclaim via dead-pid/non-dispatcher cmdline (`lockPidOwnsQueue`
  L5813, r31) or 30s dir-mtime fallback (LOCK_STALE_MS L5791); seized
  tokens re-verified before steal (L5902-5924). Every queue mutation —
  daemon or CLI verb — serializes on this lock.

## Task row field map (`validateQueueTask` L5310-5563)

Pinned grammar: `key=task_[a-f0-9]{24}` content-derived
(`task_${sha256(immutable).slice(0,24)}` L7392); `runId=gq[a-f0-9]{16}`
(L7411); `sessionId` literally `omp-${runId}` (L5344/L7412).

Content fields: `title` ≤64; `taskClass` ∈ {execution, planning, review,
integration} L5314; `route` = `provider/model:(low|medium|high|max|xhigh)`
(ROUTE_PATTERN L263); `promptPath`/`resultPath` resolve under `.ufo`
(LEXICAL only on stored rows L5278; lstat at use sites); `configPath`
under ROOT; `promptSha256` (+optional `configSha256`); `scopes[]` ≤64
nonempty overlap-partition (empty-scope mint refused L7307/7315 but stored
`""` stays legal and overlaps everything — `canonicalScopes` L6081);
`dependsOn[]`/`afterRuns[]` ≤64; `requestedRunners` 1..1024 clamped at
mint to min(runnerCeiling, MAX_REQUESTED_RUNNERS) L7345.

Runtime fields: `state` ∈ QUEUE_STATES L149 {pending, launching, running,
paused, completed, failed, blocked}; `missionId` null|`m_[a-f0-9]{32}`;
`blocker` null|{code, failureClass?, resumeAt?, launchCode?, retryable?}
L5361-5383; `lastDispatch` null|{at, launcherExit, code, recoveredExisting,
command∈launch|resume, failureClass, detail≤256, retryAfterMs, resetAt,
route} L5384-5430 — **`recoveredExisting===true` takes precedence over a
nonzero `launcherExit`** (L5385-5390): a nonzero exit that bound an
existing live mission is a SUCCESS. `routeChain[]`/`routeIndex`/
`routeContinuity{attempt,from,to,failureClass}` — routeIndex>0 REQUIRES
routeContinuity (L5442, anti-forge). `iterate{rounds≤1024, round≤rounds}`;
`lineage{parentTaskKey,parentRunId,round}` requires `priorResultPath`
which requires `priorReceiptSha256` (L5485/L5500 — a prior result without
its receipt digest dead-letters at dispatch by construction).
`iterationOutcome` kinds: continue|stop|blocked|budget_halt|
decision_missing|successor_error|successor_superseded (L5514-5559).

Global invariants (L5611-5701): key/runId/sessionId/resultPath globally
unique (shared resultPath forbidden — whichever settles second would
overwrite the first's evidence); no dependsOn/afterChains self-edges or
edges to nonexistent+nonarchived keys; DFS cycle check over
dependsOn ∪ afterChains.

## Four counters — do not conflate (L12486-12505)

- `attempts`: claim-scoped dispatch tries, monotone across repends.
- `resumeAttempts`: paused-resume budget, cap MAX_PAUSED_RESUME_ATTEMPTS=8
  (L114); repend resets to 0; over-budget → `resume_budget_exhausted`.
- `launchMisses`: launch-registration failures, cap MAX_LAUNCH_MISSES=8
  (L118); repend resets alongside missionId.
- Watchdog `attempt N/3`: a fifth vocabulary living in
  `ufo-watchdog-repend.mjs`, per-row lifetime repend budget — never
  written to the queue row.

## State machine

QUEUE_STATES {pending, launching, running, paused, completed, failed,
blocked}. TERMINAL = {completed, failed} only (L150) — **`blocked` is not
terminal**: it parks until repend, and chain liveness treats a rependable
blocked row as live (CHAIN_LIVE_STATES L294, `isRependableBlock` L308).
`paused` is a capacity/failure park with a resume budget, not idle.
`launching` is a claim lock, not a spawned process — the claim commits to
disk BEFORE the spawn attempt, so a mid-dispatch crash leaves a launching
row whose only recovery is the LAUNCHING_GRACE_MS=120s reconcile exemption
(L124) then stale-launching healing.

**Nothing in the dispatcher writes `state='failed'`** — completion and
blocking are the only outcomes; a `failed` row is an external edit
(repend refuses it). `TERMINAL_TASK_STATES` L233 {completed, failed,
canceled, cancelled, exited, settled} is the OMP CHILD-task vocabulary,
a different enum.

## Claim → dispatch pipeline

`claimNextTask` L12086, entirely inside `withQueueLock`:
`reconcileQueue` runs first in the same lock (L12091). Scan =
`queue.tasks` in INSERTION ORDER, first satisfiable row wins, at most one
row per call. Claim flips pending|paused→launching, attempts+1,
blocker=null, writeQueue commits BEFORE the spawn — a launching row
occupies scopes and a runner reservation (`inflightRunnerReservations`
L12592). Claim gates include: mission completed → defer
`acceptance_settle`; routeChain mismatch → heal or block
`route_chain_mismatch`; nonMintProvenance; capacity/dependency gates defer
typed (`deps_pending` etc.). A deferred head does NOT starve the tail —
the scan continues past it. No priority field exists; array order is the
only scheduling signal and enqueue appends.

`runCycle` claim loop L13694-13860: per-cycle claim bound =
min(runnerCeiling, runnerHeadroom+1). `dispatchQueuedTask` L12798 runs
OUTSIDE the queue lock; `recordDispatchResult` L13187 re-locks to settle.

`dispatchQueuedTask` order: re-read+sha256 prompt & config vs stored
digests (`prompt_drift|config_drift|prompt_evidence_invalid|
config_unavailable`) → model-catalog preflight (`model_catalog_unresolved`
with linear backoff 120s×attempts cap 900s) → omp argv
(`omp --session-dir .ufo/sessions/<runId> --max-time 3h --model <@alias|
route> --config <cfg> --print-thoughts --auto-approve [--resume
<nativeSessionId>] <prompt>`) → sighting launch/resume.

`recordDispatchResult` settle taxonomy: accepted = spawned ∧ live mission
(starting|running) ∧ (launcherExit===0 ∨ recoveredExisting) → running,
missionId bound, resumeAttempts/launchMisses reset, `servedExactRoute`
computed. Rejected: hard codes `prompt_drift|prompt_envelope_invalid|
prior_evidence_drift|identity_selector_invalid` → blocked
retryable:false; durable-stopped retryable launch codes → paused
(`paused_for_resume` blocker with resumeAt); retryable with NO mission
row → `launch_not_registered` miss (pending, >8 misses → blocked
`launch_misses_exhausted`).

## Repend — the watchdog's only queue door

`fleet-dispatcher.mjs repend --run <gq16>` → `rependTask` L8937 under the
queue lock. The watchdog NEVER writes pending-work.json; it shells this
verb (ufo-watchdog-repend.mjs). Typed idempotent refusals {repended:false,
reason}: `no_task`, `task_<terminal>`, `chain_advanced` (a blocked iterate
parent whose next-round resultPath is live/archived), `manifest_invalid`,
`manifest_unreadable`, `mission_live`, `mission_stale_registered` —
episode-latched in `.ufo/repend-refusal-latch.json`
(ufo-repend-refusal-latch-v1). A SUCCESSFUL repend sets
`blocker.code='repend_requested'` — a repend mark, not an error state.

## Ledger vocabulary

`log()` L1256 appends {…detail, boot?, cycle?, ts, kind} to
fleet-ledger.jsonl + stdout (credential-shaped lines redacted to
kind+error); `logConsoleOnly` L1306 = stderr only. Kinds include:
`queue_enqueued`, `queue_claimed`, `queue_claim_deferred`,
`queue_dispatch`, `queue_dispatch_throw`, `queue_task_blocked`,
`queue_task_reopened`, `queue_repend`, `queue_repend_refused`,
`queue_launch_miss`, `queue_launch_misses_exhausted`,
`queue_route_continuity`, `queue_auto_reap`, `queue_auto_reap_skipped`
(reasons task_missing|no_longer_reapable|evidence_changed_since_settle|
mission_changed).

## Traps

- `paused` ≠ idle (capacity park with budget); `launching` ≠ spawned
  (claim lock); `blocked` ≠ terminal (rependable = chain-live).
- Nonzero `launcherExit` + `recoveredExisting===true` = success.
- `afterRuns` deliberately NOT existence-checked at admission (L7511-7517)
  — unknown runIds defer typed at claim.
- "Whip"/stall detection lives in `ufo-watchdog-repend.mjs`; the
  dispatcher exposes only `repend`.
- One daemon per boot record + singleton lock (L14517-14560:
  `dispatcher_singleton_refused`/`daemon_already_running`).

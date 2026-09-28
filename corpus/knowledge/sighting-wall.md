# ufo-sighting-lib — wall internals (mission lifecycle on tmux)

`scripts/ufo-sighting-lib/` — 26 `.mjs` files, 10,620 lines; entry
`scripts/ufo-sighting.mjs` (396 lines) re-exports the moved names.
Condensed from the round-6 scout map (`local://kumitate-r6-sighting-lib.md`),
spot-verified. Citation form: `file.mjs:N`.

## Module map (flattened)

`base.mjs` (611) = all shared constants/guards, deliberately import-free.
One-way chains: `wall-schema.mjs` (371) + `wall-display.mjs` (87) never import
`wall.mjs` (1793). Two DELIBERATE cycles, safe only inside function bodies:
`observe.mjs` ↔ `status-view.mjs`, `status-verb.mjs` ↔ `display-overview.mjs`.
Others: `argv.mjs` (dispatch attestation), `queue.mjs` (read-only queue
projection), `observe.mjs` (evidence gathering), `layout.mjs`
(convergence/geometry), `verbs-core.mjs` (remove/complete/matching),
`status-verb/status-view` (read path), `display-overview` (dashboard),
`launch-verb`/`resume-verb`/`spawn-pane`/`pane-run`/`pane-register`
(lifecycle), `runner-attach` (terminal attach), `environment`
(ephemeral/bwrap), `mission-identity` (row construction), `twins`,
`stop-restore`, `steer-peek`, `options`/`surface`/`wall-verbs`.

## Wall persistence

- `stateDir` = `UFO_SIGHTING_STATE_DIR` else `ROOT/.ufo/sighting`; manifest
  `manifest.json`, schema `ufo-sighting-wall-v1` (base:79). `ownerRoot` and
  `target` must equal `ROOT`/`TMUX_TARGET` else `FOREIGN_STATE`.
- Mission row (`wall-schema.mjs:155-258`, built `mission-identity.mjs:12-59`):
  `id` = `m_<32 lowercase hex>`; `status ∈ {starting,running,completed,
  stopped}`; `paneId %\d+`, `panePid` OPTIONAL (absence is a representable
  drift state, not corruption); `dispatch ∈ {argv,inquiry,native-trial}`;
  `relay` and `provenance.{originMissionId,lane}` are self-attested display
  labels, explicitly NOT authorization; `lane` grammar is `task_<24hex>`.
- `writeManifest` (wall.mjs:454-510): revision = persisted+1 (overflow →
  `MALFORMED_MANIFEST`); completed-row `dispatch.argv` redacted to a sentinel;
  `pruneStoppedMissions`; serialize-validate-evict loop (evict oldest stopped
  then completed until ≤ `MAX_MANIFEST_BYTES` 1 MiB, else
  `MANIFEST_TOO_LARGE`); tmp `wx` 0600 → fsync → rename → chmod → dir fsync;
  refuses symlinked manifest. `MANIFEST_READ_BYTES` 16 MiB is deliberately
  LARGER than the write bound so an over-bound manifest can be healed —
  equalizing wedges recovery.
- Operation lock: DIRECTORY `<stateDir>/operation.lock` + `owner.json` `wx`
  (wall.mjs:627-774); seize-quarantine-verify reclaim; an aged dir with NO
  `owner.json` is reclaimed as unattested; `LOCK_TIMEOUT_MS` 10 s →
  `WALL_BUSY`. Reentrant per-process (`heldOperationLocks`). Writers: every
  verb under `withOperationLock` + detached `__reconcile` + pane-run's
  `stopMission`. **The dispatcher never writes it** (dispatcher:110, :1610
  reads with its own stat-key cache); the dispatcher's ONLY manifest write is
  `removeStaleManifestRow` via `rependTask`'s deadlock gate.
- Read paths: `readManifest` ancestor-confined, non-symlink leaf ≤16 MiB,
  private-owned, post-read bound, `validateManifest`. `loadStatusView` adds an
  advisory cache keyed on `size:mtimeMs:ctimeMs:ino:dev` with re-stat on hit;
  `UFO_SIGHTING_STATUS_CACHE=off` disables.

## Lifecycle internals

- `spawnPaneForMission` (spawn-pane.mjs:9-89) is the ONLY pane creator.
  Adoption rule: a pane is adoptable only if unclaimed, not a bound overview,
  AND (dead | `__idle` keeper | marked by a no-longer-live mission) — a live
  unmarked pane is foreign work, never adopted/killed. Records `paneId` +
  `#{pane_pid}` → `status="running"`. Rollback re-`__idle`s own keepers,
  kill-panes fresh splits. `launchMissionLocked` capacity order:
  `assertL1Capacity` → `assertCapacity` → `assertRunnerCapacity` → `newMission`
  → `ensureUniqueMission` → `createMissionPane` (row written BEFORE spawn;
  failure removes the row).
- `__pane-run <id>` (pane-run.mjs:28-146): spin ≤10 s for the manifest row →
  self-attestation quadruple (`pane_dead==0 && pane_pid==self &&
  @ufo_sighting_mission==id && TMUX_PANE %\d+`) else `MISSION_NOT_LIVE` — the
  guard against a recycled pane erasing evidence → argv resolution
  (inquiry/native-trial shims or verbatim argv) → child env
  `UFO_SIGHTING_MISSION_ID/_RUN_ID/_SESSION_ID/_ORIGIN_MISSION_ID/
  UFO_SIGHTING_LANE` → ephemeral branch re-verifies the env file bytes +
  bwrap → `spawn` with signal forwarding → `stopMission` in `finally`
  (a marker failure cannot lose exit evidence).
- `resumeMissionLocked` (resume-verb.mjs:43-152): refuses completed/live/
  non-stopped; successor gate — a queue successor for the runId in any
  non-terminal state → `RESUME_SUPERSEDED`; flips to `starting`, deletes
  stop fields, respawns; failure → `restoreStoppedMission` rollback.
- `stopMission` (stop-restore.mjs:24-89): already-stopped rows BACKFILL exit
  evidence once; `applyStopped` DELETES a prior `failure` when the new cause
  is null (base.mjs:547 — "stop without cause" clears); `scheduleReconcile`
  in `finally` spawns a detached `__reconcile` — every verb's absent-dir
  early-out exists to stop that child resurrecting a fixture root.
- `reconcileLocked` (layout.mjs:420-463): live row + missing/dead/unmarked/
  pid-drifted pane → `stopped` with `RECONCILE_UNATTESTED_STOP`;
  `settleWallGeometry` keeps exactly one idle keeper per fleet window.
- Steer (steer-peek.mjs:74-135): ONE tmux invocation `send-keys -l -- <text>`
  + `send-keys Enter`; guard order arg-shape → absent-wall → lock →
  `resolveWallMission` → live proof (`PANE_IN_MODE` refused) → text rules
  (single line, no control bytes, ≤4096) → `steerCount` seq pin
  (`STEER_SEQ_REPLAY`) → disposition {accepted, deferred_next_round,
  rejected_contract_changing} → audit log `<stateDir>/steers/<runId>.jsonl`
  (append `O_NOFOLLOW`, 2 MiB tombstone-trim).
- Peek: `capture-pane -p -S -<lines>` under the lock; `--lines` ∈ [1,400],
  default 80.
- `completeMission` (verbs-core.mjs:141-224): `--dry-run`, idempotent;
  **receipt gate** — the queue row's `<resultPath>.receipt.json` must exist,
  be non-empty, parse, and carry `schema:"ufo-task-receipt-v1"` else
  `COMPLETION_RECEIPT_MISSING|TORN`; `COMPLETED_CAPTURE_LINES = 0` — complete
  NEVER captures pane scrollback.

## The display is an evidence projection, never telemetry

- `observe.mjs` has FOUR independent sources, none of them pane content:
  OMP transcripts (bounded walk, task-id oracle counts only STRUCTURED
  `details.progress[]`/`details.jobs[]` — content-text regexes rejected as
  forgeable), xbrd-spark `meta.json` census, the L0 hub `l0-monitor-state.json`
  sibling of the queue path, and the dispatcher-written
  `observations.json` sidecar (≤4 MiB, ≤2048 rows, `m_<hex32>` keys,
  `phase ∈ {queued,working,suspended,completed,failed}`).
- Opaque conditions return `opaque`/`unavailable`/`null` — never a fabricated
  0. A `0` in these fields is a claim; absence is disclosed.
- Pane content is read ONLY by `peek`; pane state (marker + pid + rectangle)
  is attestation/geometry input, never mission telemetry.
- `status` non-lite MUTATES the wall: takes the lock ≤250 ms to repaint
  session options + overview (only `--lite` is side-effect-free).
- `overview --watch`: fs.watch on the state DIR (renames kill file watches)
  filtered to manifest/observations + a 2.5 s safety interval.
- `surface --json` derives `scriptDigest` over shim + EVERY `*.mjs` in the
  directory (readdir-derived set) — editing any file, even a comment,
  invalidates the pinned `sighting.surfaceDigest` in `config/ufo.json`.

## Boundary crossings (verified)

- dispatcher → wall: `sightingCommand` (dispatcher:12788) shells
  `ufo-sighting.mjs launch|resume --run-id … --no-open --relay
  --runner-reservation N -- <argv>`; env seeds `UFO_SIGHTING_ORIGIN_MISSION_ID
  = task.priorMissionId`, `UFO_SIGHTING_LANE = task.chainRootKey`
  (dispatcher:13114-13130); on nonzero launch exit the dispatcher shells
  `reconcile` (13135-13138); the status read is `ufo-sighting status` +
  direct manifest read.
- wall → dispatcher queue: `queue.mjs` is a READ-ONLY projection of
  `pending-work.json` — its only fs import is `lstatSync`; out-of-root queue
  via `UFO_PENDING_WORK_PATH` is honored but disclosed `queueEscapesRoot`
  (the wall deliberately skips the beneath-gate; dispatcher/monitor refuse).
- native-trial → wall: `handOffToSightingWall` shells
  `launch … --substrate omp --fleet <f>` (run-omp-native-trial.mjs:1348-1385)
  and a detached `complete` after parent exit (:2600-2626); the wall writes
  NOTHING under `.ufo/native-trials/`.
- retention: `completeMission` → `applyMissionRetention` shells
  `ufo-state-retention.mjs cap --apply` with `UFO_STATE_DIR` pinned.
- L0 watch is the other steer consumer (`ufo-l0-watch.mjs:902-930`).

## Traps

- Two things named "queue": `queue.mjs` = read model of the dispatcher's
  file; the wall's own state is `manifest.json`. No sighting-side work queue
  exists.
- "Live" is decided twice: persisted `status` AND pane attestation
  (`missionPaneAttested`); a live row with a dead/drifted pane is stale.
- `null`/`opaque`/`unavailable` = "evidence absent", never 0.
- `UFO_SIGHTING_TEST_TERMINAL_PID` honored only when
  `UFO_SIGHTING_STATE_DIR` is set — fixture seam, not a production knob.
- Killing a pane does not clear its `@ufo_*` options — `clearPaneMetadata`
  is the only path, or a converged pane keeps a frozen mission snapshot.
- `argv.mjs` executable predicates are filesystem-shape disclosure
  (canonical-realpath basename + exec bit), NOT attestation; env overrides of
  read roots (`UFO_OMP_SESSIONS_ROOT`, `UFO_XBRD_SPARK_ROOT`, …) are honored
  and disclosed, never refused.

# S6 ops watchers — the five L0 watcher/helper processes

**Family:** S6 (registry `SCORECARD.md`), 5 of 5 members named at internals
level. **Measured at origin HEAD `daa371583`**
(`/home/vgpnk/Projects/origin-work/ufo-fsd-alpha`), sizes by
`wc -l scripts/{ufo-stale-watchdog,ufo-l0-monitor,ufo-l0-watch,the-tick-ping,ufo-ground-handler}.mjs`
→ `1010 1638 1679 831 859`. Each member below has its own `## ` section with
line-anchored internals; `node --check` on all five exits 0 (this note is read +
syntax-check only — every one of these is a mutating origin script and none was
executed).

**The single-writer rule that binds all five:** `fleet-dispatcher.mjs` owns
`.ufo/pending-work.json` (grammar, lock, ledger); `ufo-l0-monitor.mjs` is the one
sanctioned second writer and only inside a heal pass; `ufo-l0-watch.mjs` and
`ufo-stale-watchdog.mjs` never write it and delegate queue mutation to children
(`enqueue --spec -`, `repend --run`); `the-tick-ping.mjs` and
`ufo-ground-handler.mjs` carry a separate unix-socket wire and touch no queue.

## `scripts/ufo-stale-watchdog.mjs`

**Owning surface.** Refires stale bounty-hunt UFOs and steers under-filled missions (`:1`–`:30`). It reads one directory — `.ufo/sessions/` (`:81`) — and writes exactly two artifacts, both under the root's `.ufo/`: whole-file state `.ufo/stale-watchdog-state.json` (`:83`) and JSONL telemetry `.ufo/stale-watchdog.jsonl` (`:82`). It never writes `pending-work.json`.

**Poll geometry.** One pass per `POLL_MS = 300_000` (`:132`) driven by `for (;;) { tick(); spinWait(POLL_MS); }` (`:996`, `:1006`); a throw anywhere in the pass is telemetred as `tick_error` (`:1001`) and the loop keeps cadence. `tick()` (`:693`) saves state in a `finally` (`:706`–`:722`) so counters mutated before a fault stay durable; the save only runs for `if (isPlainObject(state))` (`:715`) and a save fault is `state_save_error` (`:719`). Duty bodies run inside `runTickDuties` (`:734`).

**Tick order** (`runTickDuties`, `:734`–):
1. Lazy-init every declared table: `for (const key of STATE_TABLES) state[key] ||= {};` (`:740`).
2. Drain deferred re-pends FIRST — `for (const runId of Object.keys(state.pendingRepend))` (`:748`) — before the status probe, so a remove-then-crash deferral is never stranded by a broken status child.
3. Probe status once: `const status = probe("status");` (`:757`).
4. Shape-trust the status object and its elements (`:769`, `:781`), then filter to `m.status === "running" || m.phase === "working"` (`:783`).
5. Walk the missions through the ladder above, then prune per-mission bookkeeping for missions no longer live — skipping `pendingRepend` (`:931`–`:932`), whose missions are gone by design and still owe a queue reset.

**Swarm doctrine.** The policy read is `loadSwarmPolicy(typeof d.configPath === "string" ? d.configPath : watchdogConfigPath())` (`:799`), mapping `policy.waveMinLanes` (`:801`) plus the wave max and round target; an unreadable policy degrades to `{ waveMin: L2_TARGET, waveMax: null, roundTarget: null, source: "fallback" }` (`:807`). The band is never a restated constant — the fallback can only ever be a floor, and the steer text renders whatever the config says.

**Staleness and bounds.** `STALE_MS = 1_200_000` (`:133`); liveness is `newestMtime(dir, (name) => name.endsWith(".jsonl"))` over `<sessionsPath>/<runId>` (`:824`), i.e. transcript-only — a non-`.jsonl` touch (state dump, receipt write) cannot read as liveness. A mission is in scope when `m.status === "running" || m.phase === "working"` (`:783`). Age is `const age = last ? Math.max(0, now - last) : Infinity` (`:842`), so a never-written session is infinitely stale, honestly rendered. Bounds: `MAX_NUDGES = 2` (`:134`), `MAX_REFIRE_ATTEMPTS = 3` (`:135`), `MAX_REPEND_ATTEMPTS = 12` (`:136`, ≈1 h at `POLL_MS`), `L2_TARGET = 16` (`:142`, a fallback floor only — rendering it as a cap is the drift the comment forbids), `FLASH_PROBE_MS = 1_800_000` (`:536`).

**Escalation ladder** (`runTickDuties`, evaluated in this order per mission):

| condition | action | counter / literal |
|---|---|---|
| `l2 !== null && l2 < doctrine.waveMin && !state.l2Steered[runId]` | steer once, latch | `l2Steered[runId]=true`; event `l2_steer` (`:869`); band text `:863`–`:864`; text `:867` |
| `age < STALE_MS` | clear the nudge, emit `recovered` (`:874`) | `delete state.nudges[runId]` |
| `nudges < MAX_NUDGES` | increment **then** steer | `"no session writes yet"` / `` `no session writes for ${ageMin}min` `` (`:889`–`:890`); text `:892`; event `nudge` (`:893`) |
| else, `refireAttempts < 3` | increment, `probe("remove", "--mission", runId)` (`:909`) | `refire_removed` (`:914`); `state.pendingRepend[runId] ||= { attempts: 0 }` (`:915`); clears `nudges`/`l2Steered`/`refireAttempts`/`refireExhausted` |
| else (`attempts >= 3`) | seal once, stop escalating | `refireExhausted[runId]=true`, `refire_exhausted` (`:903`) |

Attempts are counted before the action in every arm, so a failing steer still advances to refire rather than nudging forever. Neither the nudge nor the refire arm is reset by a successful steer — only `age < STALE_MS` clears the ladder.

**Repend ladder** (`attemptRepend`, `:621`–`:687`) — the deferred queue reset:
- dispatcher repended → `refire_repended` (`:637`), pending row deleted.
- `reason === "mission_live"` → increment, `refire_repend_refused` with `reason: "mission_live"` (`:644`); at 12 → `repend_exhausted` reason `"mission_live"` (`:646`), row deleted.
- `reason === "mission_stale_registered"` → increment, a second `sightingFor(watchdogDeps(deps))("remove", "--mission", runId)` (`:662`), stays retryable; at 12 → `repend_exhausted` reason `"mission_stale_registered"` (`:667`).
- any other reason → `refire_repend_refused` with `result.reason ?? "unknown"` (`:672`), row deleted — this is where a durable `reason:"usage_error"` lands.
- throw → `repend_error` (`:677`), increment; at 12 → `repend_exhausted` with `reason: e.code ?? null` (`:683`).

**Queue/write posture.** The watchdog NEVER writes the queue. It shells `execFileSync(process.execPath, [d.dispatcherPath, "repend", "--run", runId])` (`:505`) and parses the `{ ok, repended, reason? }` report with `parseReportOutput` (`:523`); the dispatcher owns the queue lock, task validation and ledger evidence (`:16`–`:17`). A usage error is spotted in the child's stdout (`"kind":"dispatcher_usage_error"`, `:515`) and returned as a durable refusal instead of a retryable throw. A `null`/scalar parsed body is likewise durable (`reason: "malformed_response"`).

**Singleton.** `acquireWatchdogLock(dirname(STATE))` (`:979`) = `<root>/.ufo`, with `lockName: "stale-watchdog.lock"` (`:955`) and `ownerLinkPrefix: ".stale-watchdog.owner"` (`:956`) over hub `acquireSingletonLock` (`hub:1716`). A live owner emits `watchdog_instance_refused` (`:983`) and `process.exit(0)` (`:984`); a successful start logs `watchdog_start` (`:986`); a lock/start failure logs `watchdog_start_error` with stage `"lock_acquire"` or `"startup_log"` (`:989`) and sets exit code 1.

**Env paths.** The only env-overridable path is `UFO_CONFIG_PATH` (`:731`), resolved on use through `gatedConfigPath` (`hub:2593`); an outside-root value throws `EXEC_PATH_OUTSIDE_ROOT` into the `policy_unreadable` arm (`:808`) and degrades the doctrine to `{ waveMin: 16, waveMax: null, roundTarget: null, source: "fallback" }` — never out of the tick loop. Every other path is a module constant (`:79`–`:83`), and `d.env` is merged into the child environment only through the test seam (`:509`).

**Telemetry vocabulary.** Every event is redaction-filtered through `redact` (`hub:1314`) and appended by `appendRotatingLog` (cap `MAX_LOG_BYTES = MAX_EVIDENCE_LOG_BYTES`, `:130`); rotation emits `watchdog_log_rotated` (`:185`) or `watchdog_log_rotate_failed` (`:190`). Persisted events, by family:
- lifecycle: `watchdog_instance_refused` (`:983`), `watchdog_start` (`:986`), `watchdog_start_error` (`:989`), `tick_error` (`:1001`).
- state: `state_load_error` (`:281` and the shape arms), `state_save_error` (`:719`).
- status/scan: `status_malformed` (`:769`), `status_malformed`/`element_shape` (`:781`), `mission_skipped` (`:815`), `scan_error` (`:826`), `future_mtime` (`:840`), `policy_unreadable` (`:808`).
- ladder: `l2_steer` (`:869`), `recovered` (`:874`), `nudge` (`:893`), `refire_removed` (`:914`), `refire_exhausted` (`:903`).
- repend: `repend_skipped` (`:631`, `:750`), `refire_repended` (`:637`), `refire_repend_refused` (`:644`, `:672`), `repend_exhausted` (`:646`, `:667`, `:683`), `repend_error` (`:677`).
- flash: `flash_live` (`:585`), `flash_probe_fail` (`:581`).

**Blindness guards.** A `scan_error` whose observed newest mtime is `0` or already stale never refires — an unreadable tree cannot prove death (`if (scan.newest === 0 || now - scan.newest >= STALE_MS) continue;`, `:830`). A future-dated session mtime (`if (last > now) {`, `:839`) clamps to alive and emits `future_mtime` (`:840`) rather than escalating on unprovable liveness. And `if (!isPlainObject(status) || !Array.isArray(status.missions)) {` (`:768`) skips the mission duties with one `status_malformed` event instead of pruning every ladder on blindness.

**Identity hygiene.** `RUN_ID_PATTERN = /^[A-Za-z][A-Za-z0-9_-]{0,63}$/u` (`:147`) is not enough alone: `isSafeRunId` (`:154`) adds `!(runId in {})` because the pattern admits `Object.prototype` member names (`"constructor"`, `"toString"`), which as state-table keys resolve to inherited members — `nudges["constructor"] || 0` is `NaN` (ladder skipped), a `NaN` bound never trips, and `pendingRepend["constructor"] ||= …` would mutate the global `Object`. Untrusted ids in telemetry are clipped by `boundedRunId = String(runId).slice(0, 128)` (`:160`).

**State hygiene.** `MAX_STATE_BYTES = 1024 * 1024` (`:126`); five runId-keyed tables `["nudges","l2Steered","refireAttempts","pendingRepend","refireExhausted"]` (`:256`). Entry rules are declared once as predicate + expected label — `nonnegSafeInt` (`:264`) under `ENTRY_RULES` (`:266`) — so the emitted message can never drift from the rule; malformed entries are deleted at load so the duty re-proves itself. `salvagePendingRepend` (`:370`) recovers only a real top-level `pendingRepend` object from a corrupt body (string-aware bounded scan; duplicate members fail closed), because those rows still owe a queue reset.

**Flash-route probe.** `flashProbe` (`:561`): returns early on `state.flashLive === true` (`:572`) — "only a proven boolean is proof of liveness" — else backs off `FLASH_PROBE_MS` from `state.flashProbeAt`. The probe is `omp --model @m_flash --no-tools --no-session -p "Reply with exactly: FLASH_OK"` (`:550`) judged by `ok = /FLASH_OK/.test(out)` (`:579`); success sets `flashLive = true` and emits `flash_live` with `route: "@m_flash"` (`:584`–`:585`). No steer on success — the alias table routes flash seats automatically, so a nudge would only inject stale seat names.

**Exit vocabulary.** `0` on instance refusal (`:984`); `64` for argv refusal — schema `ufo-stale-watchdog-error-v1`, code `usage`, `unsupported argument: <arg> — ufo-stale-watchdog takes no arguments` (`:972`, `:974`); `1` on start failure (`:991`-region, `process.exitCode = 1`).

**Cross-file deps.** Children: `scripts/ufo-sighting` (`:79`, steer/status/remove), `scripts/fleet-dispatcher.mjs` (`:80`, `repend`), `omp` (`:550`). Hub `scripts/ufo-mission-result.mjs`: `newestMtime` (`:3187`, re-exported here), `acquireSingletonLock` (`:1716`), `appendRotatingLog` (`:2143`), `writeFileAtomicIfChanged` (`:2316`), `readBoundedFile` (`:990`), `redact` (`:1314`), `loadSwarmPolicy` (`:3052`), `gatedConfigPath` (`:2593`), `parseReportOutput` (`:3164`), `spinWait` (`:899`), `isMainModule` (`:3012`), `isPlainObject` (`:209`), `plainObjectRows` (`:226`), `emitErrorJson` (`:2481`), `MAX_EVIDENCE_LOG_BYTES` (`:2511`). `emitFor` (`:110`) resolves the emitter seam and falls back to `writeSync(2, …)` so a dead log path cannot strand duty events.

Sources: `scripts/ufo-stale-watchdog.mjs`; `scripts/ufo-mission-result.mjs` (dep line anchors only).
## `scripts/ufo-l0-monitor.mjs`

S6 watcher #2 of 5. 1638 lines / 82265 bytes (`wc -lc scripts/ufo-l0-monitor.mjs`). Direct-CLI only:
`isMainModule(import.meta.url)` gates the whole pass, so an importer's argv never heals (`isMain` at
:1305, argv walk at :1308).

### Header & contract
Self-description is literal: `// L0 monitor — the whipper. Detects and repairs dead iterate chains.` (:2). It repairs exactly the three non-retryable drift codes the dispatcher will not retry itself — `prompt_drift` (:11), `config_drift` (:12), `prior_evidence_drift` (:13) — collected as `DRIFT_CODES` (:126) and bounded by `TERMINAL = TERMINAL_QUEUE_STATES` (:133). Doctrine, quoted: `// It NEVER invents
evidence: a repair rewrites digests to the CURRENT bytes` (:17); every mutation is digest-of-bytes-on-disk, and every action is appended to the monitor log (:18-19).

### Argv surface
`FLAG_ARGS = ["--json", "--repair", "--repend", "--rebind", "--settle"]` (:1316);
`VALUE_ARGS = ["--fleet", "--match", "--stale-after-min"]` (:1317). The shared declared-argv walk
(`parseDeclaredArgv`, :1321) collects unknown args, missing values, flag-swallows and duplicates as
usage faults *before any queue read or mutation* (:1377-1379); refusal exits 64 (:1375). `--fleet` is
comma-joined and rejects an empty or dash-leading name (:1329-1343); `--match` is compiled with the `u`
flag and a malformed pattern is a typed usage refusal (:1347-1362); `--stale-after-min` defaults to 10
(:1359) and must be finite and > 0 (:1360-1361). `--repend` bare is refused (:1366): `--repend requires
--repair (repend re-queues repaired rows; without a heal pass there is nothing to repend)` (:1367).
Report-only is the default (:22); `--repair --repend` is the documented heal (:23). Text surface labels
findings `REPAIRABLE` / `DRIFT` / `DEAD` (:374-378).

### The `--rebind --repair --repend --settle` family
`healing = --rebind || --settle || --repair` (:1409) takes one lock and one queue read for the whole
pass; each step publishes with its own `writeQueue` so a mid-pass fault stays durable (:1402-1408).

| verb | mutates | refuses / skips | line |
|---|---|---|---|
| `--rebind` | `task.promptSha256`, `task.configSha256`, `task.priorReceiptSha256` for non-terminal in-scope rows whose current bytes differ | `out_of_scope`, `terminal`, `prompt_missing`, `digest_unreadable`, `unchanged`; prior-evidence unavailability tallied orthogonally (`path_escape`/`missing`/`unreadable`) | :920-984 |
| `--repair` | rewrites digests to current bytes; `prior_evidence_drift` also rewrites the **parent** receipt and rebounds every sibling bound to it | `row_gone`, `path_escapes_root`, `no_parent`, `parent_not_terminal`, `parent_child_paths_diverge`, `no_parent_receipt`, `parent_receipt_invalid`, `digest_unreadable` | :639-774 |
| `--settle` | `task.state = "completed"`, `task.blocker = null`, `task.iterationOutcome` | any row not `blocked`/`acceptance_evidence_missing`, missing report/receipt, empty report, receipt failing the expected bag | :1017-1091 |
| `--repend` | spawns `fleet-dispatcher.mjs repend --run <runId>` outside the lock | `!task \|\| TERMINAL.has(task.state)`; success needs exit 0 **and** `repended === true` | :794-819, :776-791 |

`--repair` entails `--settle` (:1421-1431); `--rebind` stays explicit because it mutates bindings for
deliberate operator edits, a different contract. Repair journals its repend debt inside the lock **before**
the queue publish (:1443-1459), then mints torn-receipt successors via `forgeSuccessor` (:1462-1467).

### One of only two `pending-work.json` writers
The monitor's queue write is `writeQueue` → `writeFileAtomic(QUEUE, \`${JSON.stringify(queue, null, 1)}\n\`)`
(:226-232, write at :231), reached only under a heal pass (:1419, :1431, :1459, :1467). The only other
writer is the dispatcher's `function writeQueue(queue) {` (`fleet-dispatcher.mjs:5743`, which also bumps
`revision`, `validateQueue`s, refuses credential-shaped bodies). Every other sibling is read-only or
delegates: `ufo-sighting-lib/queue.mjs` only throws `pending-work queue must be a real file` (:220);
`ufo-stale-watchdog.mjs` states it `never writes pending-work.json itself` (:16-18).

### Decision rules (thresholds)
| gate | rule | constant / default | line |
|---|---|---|---|
| stall window | row surfaced when `scan.error !== null \|\| idleMs >= staleAfterMs` | `--stale-after-min` default 10 min (:1359) | :1281 |
| reap-gave-up | journaled repend debt dropped with a named gave-up past the cap | `MAX_REPEND_ATTEMPTS = 3` | :511, :623 |
| repend child | `spawnSync` timeout / stdout bound | `60_000`, `8 * 1024 * 1024` | :806, :812 |
| prompt digest | bounded read bound | `MAX_PROMPT_BYTES = 512 * 1024` | :115 |
| heal log cap | same class as watchdog state/log | `MAX_LOG_BYTES = MAX_EVIDENCE_LOG_BYTES` | :855 |
| successor mint | forged only while `task.iterate.round < task.iterate.rounds` | — | :1127-1128 |

### Settle-receipt handling
`settle()` (:1017) only touches `blocked` rows whose `task.blocker?.code === "acceptance_evidence_missing"`
(:1022): requires the report and `${reportPath}.receipt.json` on disk, rejects a zero-byte report, and
validates against the dispatcher's full expected bag (`expectedReceiptBag` + `sha256File`, :1040-1057) —
config-null rows bound to dispatch-snapshot config digests so a forged/stale `configSha256` cannot settle
(:1041-1056). On success it records the receipt's own decision as the dispatcher's continuation does:
`kind` (`receipt.iteration?.decision ?? "decision_missing"`), redacted `reason`, `nativeVerdict`, `blockedAudit` (:1062-1082).

### Ledger evidence it emits
Two monitor-owned artifacts sit beside the **effective** queue (siblings of `QUEUE`, :69-81):
`l0-monitor-state.json` (`writeState`, :867-882: `lastRunAt`, `fleets`, `blocked`, `repaired`, `repended`,
`forged`) and `l0-monitor.log` (`appendLog` → `appendStampedLog(LOG, lines, { maxBytes: MAX_LOG_BYTES })`,
:864). Log line kinds, in order: `rebound`, `rebind_skipped`, `rebind_prior_unavailable`, `settled`,
`repaired`, `repair_skipped`, `repended ok|FAIL`, `repend_gave_up`, `repend_journal_fault`, `forged` (:1526-1548). The persistent journal `l0-monitor-repend-pending.json` (`REPEND_PENDING_SCHEMA = "ufo-l0-repend-pending-v1"`, :510) holds healed-but-not-yet-repended rows.

### Exit codes & refusal strings
`0` normal; `2` when `resolveQueuePath` refuses at launch (queue :64, journal :102, envelope `schema: "ufo-l0-monitor-error-v1"`); `64` usage faults (:1375); `1` runtime fault (:1636, errno code preserved, `SyntaxError` → `invalid_json`, else `internal`). Quoted refusals:
`"repend_pending_path_outside_root"` / `` `UFO_REPEND_PENDING_PATH must stay beneath ${stateRoot}` ``
(:523-524), `"--stale-after-min must be a finite number > 0"` (:1361), `"--repend requires --repair
(repend re-queues repaired rows; without a heal pass there is nothing to repend)"` (:1367).

### Env vars
`UFO_PENDING_WORK_PATH` (:56) and `UFO_REPEND_PENDING_PATH` (:94) only — both honored solely beneath `.ufo/`
via `resolveQueuePath` / `resolveRependPendingPath` (:516-526), so a hostile env cannot turn a heal into an
out-of-root write (:43-48).

### Interaction with S6 siblings
- `ufo-l0-watch.mjs:85` binds `MONITOR`; each tick runs it as `"--fleet", <set>, "--rebind", "--repair",
  "--repend", "--settle", "--json"` (:487, `timeout: 120_000`, :489), then consumes `repaired` (:1399),
  `repended` (:1400), `settled` (:1436) and `stalled` (:1490) rows; a monitor fault degrades the tick
  rather than aborting it (:1358).
- `ufo-stale-watchdog.mjs` delegates repend to the dispatcher and never writes the queue (:16-18); it
  reads the monitor's non-transcript state dump as liveness (:821). `ufo-night-watchdog.sh:181-182`
  treats a `.ufo/l0-monitor-state.json` mtime stale > 6 min as a wedged watch daemon and SIGKILLs it
  (:23-25) — the monitor's state file is a liveness surface.
- `fleet-dispatcher.mjs` is the repend target (`DISPATCHER`, :106; spawn :803) and owns the same queue
  lock, so repend must stay outside the monitor's lock (:1407-1408).

Sources: `scripts/ufo-l0-monitor.mjs` (all `:N`), `scripts/fleet-dispatcher.mjs`, `scripts/ufo-l0-watch.mjs`,
`scripts/ufo-stale-watchdog.mjs`, `scripts/ufo-watchdog-repend.mjs`, `scripts/ufo-sighting-lib/queue.mjs`,
`scripts/ufo-night-watchdog.sh`.

## `scripts/ufo-l0-watch.mjs`

**Owning surface.** The L0 night watch keeps the fleet alive unattended with three per-tick duties — (1) heal via the monitor, (2) respawn continuation holes, (3) whip stalled rows (`:1`–`:35`). It writes only its own state (`l0-watch-state.json`, `:127`) and action log (`l0-watch.log`, `:119`); it never writes the queue.

**Loop geometry.** `INTERVAL_MS = 90_000` (`:149`) with `spinWait(INTERVAL_MS)` (`:1676`); a throwing tick is isolated (`tick_error <childFault>`, `:1674`) and the loop keeps cadence. `--once` (`:159`, declared in `FLAG_ARGS = ["--once"]`, `:1544`) runs one `tick()` (`:1658`) and prints a JSON action report (`:1659`) instead of looping. The heal child is `ufo-l0-monitor.mjs --fleet <set> --rebind --repair --repend --settle --json` (`:487`–`:489`, timeout 120 s / 16 MiB buffer). A monitor fault is deduped — recorded on transition only — through `monitor_failed <fault>` (`:1361`), and the tick degrades to queue-only work rather than aborting.

**Report/action surfaces.** The monitor report is parsed by `parseReportOutput` (`hub:3164`) and its members read through `reportRows`, which degrades a malformed member to `[]` and, once per changed signature, logs `monitor_report_malformed <shape>` (`:1497`) via `noteTransition` (`:323`); a valid-JSON non-object report is named `report`. Action lines land in `l0-watch.log` through `log()` (`:453`) → `appendStampedLog` (`hub:2279`), capped at `MAX_LOG_BYTES = MAX_EVIDENCE_LOG_BYTES` (`:451`), and closed with `swallow: true` so an unwritable log never kills the daemon.

**Budget bounds.** `MAX_ENQUEUES_HOUR = 48` (`:150`) global, `MAX_LANE_ENQUEUES_HOUR = 4` (`:153`) per lane; both timestamp arrays are pruned to the trailing hour by `prune(state, now)` (`:464`) with the `fresh` predicate requiring `parsed <= now && parsed > hourAgo` (`:469`–`:472`) — a future-dated stamp is corruption, not a recent enqueue. Lane records persist (they are the dedupe key), only their `at` arrays shrink. `WHIP_COOLDOWN_MS = 15 * 60_000` (`:154`). Defaults: fleet set `{"nightcall"}` (`:147`), `ROUNDS = 8` (`:148`), scope allowlist `["nightcall-"]` (`:228`).

**Hole ladder** (`holeCandidates` gates in queue order; `respawnHole` acts):

| gate | predicate | skip / action literal |
|---|---|---|
| fleet | `fleetSet.has(task.fleet)` | — |
| completion | `task.state === "completed"` | non-completed skipped |
| mint parity | `successorDue(task)` (`:283`, call `:1186`) | iterate `round < rounds` |
| recovery owner | `deferredIteration(task)` (`:1035`, call `:1189`) | deferred rows left to reconcile |
| scope allow | `scopeAllow.some(...)` (`:1198`) | `scope.split("/").pop().startsWith(prefix)` |
| lineage | `childOf.has(task.key)` (`:1199`) | — |
| occupancy | `overlapsOccupied(task.scopes, occupied)` (`:1200`) | blocked rows excluded from `occupied` |
| runId | `isSafeRunId` = `gq<16 hex>` | `invalid_run_id <id> <title>` (`:313`) |
| alias | empty `parent.l1Alias` (`:1268`) | `respawn_skipped_no_alias <title>` (`:1272`) |
| spec | `continuationSpec(parent) === null` | `respawn_skipped_bad_path <title>` (`:1279`) |
| lane budget | `lane.at.length >= 4` (`:1290`) | `budget_lane` (`:1291`) |
| global budget | `state.enqueues.length >= 48` (`:1294`) | `budget_global` (`:1295`) |
| scope race | `overlapsOccupied(spec.scopes, occupied)` (`:1298`) | `respawn_skipped_occupied` (`:1299`) |
| admit | `enqueue(spec)` (`:858`) | `respawned <title> -> <alias>` / `respawn_deduped …` (`:1323`–`:1325`) |

`enqueue()` (`:858`) pipes the spec on stdin — `exec(process.execPath, [DISPATCHER, "enqueue", "--spec", "-"])` (`:871`, spec JSON at `:873`) — and returns one of four names (`:892`–`:899`): `"unparseable"`, `"enqueued"`, `"deduped"`, `"invalid_payload"`. A throw becomes `respawn_failed <childFault>` (`:1335`); any other outcome becomes `respawn_<outcome>` (`:1332`). A successful or deduped admit arms the seal synchronously (`lane.done = true`, `donePath = spec.resultPath`), extends `occupied`, and appends a stamp to both budget arrays; one post-loop queue read then confirms visibility — invisible → seal released + `seal_pending <title>` (`:1478`), read fault → `seal_check_failed` (`:1466`), section fault → `respawn_section_failed` (`:1484`).

**Seal lifecycle** (`sealReopenStep`, `:1046`). A seal is re-validated every tick against the successor it names: `findSuccessor(lane.donePath)` (`:1055`); a successor in state `"failed"` reopens the parent (`hole_reopened <title> successor_failed`); `"blocked"` stays sealed because recovery ownership is the monitor's; a successor absent from the queue is arbitrated by its own receipt — `continue` or no receipt → reopen (`successor_continued` / `successor_vanished`), terminal decision or unreadable receipt → stay sealed.

**Continuation minting** (`continuationSpec`, `:570`). Reuses the parent's prompt/scopes/config and moves only identity and `resultPath`; refuses a non-`.md`/extensionless `resultPath`, an out-of-root path (via `queueRowPath`), and a non-string `title` (`:590`); rounds carried forward are `parentRounds - parentRound` with a fail-closed `remaining < 1` return (`:622`) — the hole gate already refused budget-exhausted parents, so the `Math.max(1, …)` is only a direct-call safeguard.

**Whip ladder** (`whipRow`, `:951`; decision table):

| condition | outcome |
|---|---|
| `!isSafeRunId(row.runId)` | `invalid_run_id …` (`:313`), return |
| `row.scanError` | `whip_skipped_scan_error <title> <scanError>` (`:968`) |
| `row.receiptMismatch` | `whip_skipped_foreign_receipt <title>` (`:977`) |
| `row.futureMtime === true` | `whip_skipped_future_mtime <title>` (`:985`) |
| non-empty `reportDrift` | drift text bypasses the decision gate; kind `unreadable` selects the restore-first text |
| `whipSkipReason(decision) !== null` | `whip_skipped_<skip>` (`:1001`); skip ∈ `terminal_stop` / `terminal_blocked` / `terminal_budget_halt` / `no_continue` (`:266`–`:270`) |
| inside cooldown | `whip_cooldown <title>` once per window (`:1010`) |
| fire | `whip ok\|failed <title> idle=<…>` or `whip_drift:<kind> …` (`:1019`) |

Text literals: `WHIP` (`:230`), `WHIP_DRIFT` (`:238`), `WHIP_DRIFT_UNREADABLE` (`:248`); `driftWhipText(kind)` (`:255`) selects the unreadable variant only for `"unreadable"`. `whipSkipReason` returns `null` only for `"continue"` (`:266`) — `stop`/`blocked`/`budget_halt` are `terminal_<decision>`, anything else `no_continue`. The fired steer is `exec("bash", [SIGHTING, "steer", "--mission", runId, "--text", text], …)` (`:909`); a failed steer still earns the cooldown because `lane.lastWhipAt = nowIso` (`:1017`) is set before the outcome branches. `idle=` comes from `stalledIdleText(row, "")` (`:1018`). The last skip reason stays on `lane.lastWhipSkip` until cleared, so a parked row logs once; `cooldownLoggedFor` dedupes the cooldown line to one per window.

**Queue/write posture.** The watch never writes `pending-work.json`; queue mutation is delegated to children — the dispatcher `enqueue --spec -` (`:871`) and `bash scripts/ufo-sighting steer` (`:909`). Reads go through `readQueueFile(QUEUE, …)` inside `readQueue` (`:743`) under `MAX_QUEUE_BYTES` (`hub:2496`). Its own state is written atomically-and-only-if-changed by `writeFileAtomicIfChanged` (`:440`) wrapped in `writeWithMkdirRetry` (`:444`), so a mid-run `.ufo` wipe retries once.

**State repair** (`readState`, `:329`). A bounded read under `MAX_QUEUE_BYTES` (`:333`); a non-object or unparsable body degrades to `{ lanes: {}, enqueues: [] }`. Per-lane fields are type-checked and deleted when unprovable: a truthy non-boolean `done` is dropped along with `donePath`/`sealNote` (`:385`), and a `lastWhipAt` whose `Date.parse` is non-finite or future-dated is deleted with its cooldown key (`:417`). Foreign lane keys (outside `gq<hex16>`) are deleted rather than assigned through.

**Singleton.** `acquireWatchLock(join(ROOT, ".ufo"))` (`:1630`) — anchored at `<root>/.ufo` even when `UFO_L0_WATCH_STATE` points elsewhere (`:1626`–`:1629`), so the fence guards the QUEUE; `lockName: "l0-watch.lock"` (`:1521`), `ownerLinkPrefix: ".l0-watch.owner"` (`:1522`). Refusal → `watch_instance_refused ownerPid=… lockPath=… reason=…` (`:1634`) and `process.exit(0)` (`:1648`); under `--once` it also writes schema `ufo-l0-watch-refused-v1`, code `instance_refused` to fd 1 (`:1640`–`:1646`) because `process.exit(0)` can truncate a buffered write. Start logs `watch_start fleets=… scopes=… interval=…ms ownerPid=… lockStolen=…` (`:1661`).

**Env paths and validation.** `UFO_L0_WATCH_STATE` (`:107`) → `resolveWatchStatePath(root, env)` (`:126`): default `<root>/.ufo/l0-watch-state.json` (`:127`); a candidate not beneath `<repo>/.ufo/` throws `MissionResultError("watch_state_outside_root", …)` (`:133`–`:134`), which main turns into schema `ufo-l0-watch-error-v1` + `exit 2` (`:111`, `:115`). `UFO_PENDING_WORK_PATH` (`:730`) → hub `resolveQueuePath` (`hub:3236`): default `<root>/.ufo/pending-work.json`, outside-root → `"queue_path_outside_root"` (`hub:3241`). Both gates call `beneath` unconditionally (`hub:1281`); by contrast `queueRowPath = containedJoin` (`:658`) escapes under `UFO_FLEET_ALLOW_EXTERNAL_TOOLS=1` (`hub:2635`, flag read at `hub:2576`) — so the queue-row path gate is the one that loosens under the external-tools flag, not the state/queue seams.

**Argv, exit vocabulary.** Flags `["--once"]` (`:1544`), values `--fleets --scopes --rounds --interval-ms --max-enqueues-hour --max-lane-enqueues-hour --whip-cooldown-min` (`:1545`–`:1547`); unknown args, missing values, flag-swallows and duplicates collect as usage faults (`:1607`), joined into schema `ufo-l0-watch-error-v1`, code `usage`, with `process.exitCode = 64` (`:1615`). Value checks carry the reason: `"--interval-ms must be a finite number >= 1000 (a tick costs a monitor exec)"` (`:1593`), `"--whip-cooldown-min must be a finite number >= 0"` (`:1605`). Startup error → `watch_start_error stage=<lock_acquire|startup>` + exit 1 (`:1652`). Daemon loop faults → `tick_error` (`:1674`).

**Hole verdict memo.** `holeVerdictMemo` (`:680`) caches only byte-determined verdicts keyed on a serialized tuple (row id fields + both artifact `statSignature`s); `memoizedVerdict` (`:682`) never caches a transient read fault, and the map clears at 4096 entries (`:693`). `holeVerdictMemoized` (`:706`) is the exported per-row entry: `null` when either signature is absent; otherwise `holeReceiptContinues` binds report bytes + receipt decision (`"continue"`) with the dispatch-snapshot config/prompt digests via `expectedReceiptBag` (`hub:2529`) and `validateTaskReceiptEitherBinding` (`hub:2868`). The tick passes no deps, so production behavior is the memoized path.

**Cross-file deps.** Children: `scripts/ufo-l0-monitor.mjs` (`:85`), `scripts/fleet-dispatcher.mjs` (`:86`), `scripts/ufo-sighting` (`:87`). Hub `scripts/ufo-mission-result.mjs`: `acquireSingletonLock` (`:1716`), `appendStampedLog` (`:2279`), `writeWithMkdirRetry` (`:2220`), `writeFileAtomicIfChanged` (`:2316`), `readBoundedFile` (`:990`), `readBoundedJson` (`:1098`), `readQueueFile` (`:2692`), `resolveQueuePath` (`:3236`), `containedJoin` (`:2632`), `statSignature` (`:2656`), `sha256File` (`:2678`), `snapshotPromptSha256` (`:2744`), `snapshotConfigDigests` (`:2805`), `expectedReceiptBag` (`:2529`), `validateTaskReceipt` (`:791`), `validateTaskReceiptEitherBinding` (`:2868`), `TERMINAL_QUEUE_STATES` (`:2504`), `isQueueRunId` (`:2618`), `MAX_QUEUE_BYTES` (`:2496`), `MAX_EVIDENCE_LOG_BYTES` (`:2511`), `parseDeclaredArgv` (`:2372`), `parseReportOutput` (`:3164`), `stalledIdleText` (`:2566`), `collapseWhitespace` (`:2257`), `plainObjectRows` (`:226`), `isPlainObject` (`:209`), `redactAbsolutePaths` (`:1069`), `knownRootTags` (`:1047`), `spinWait` (`:899`), `isMainModule` (`:3012`), `emitErrorJson` (`:2481`), `MissionResultError` (`:177`).

Sources: `scripts/ufo-l0-watch.mjs`; `scripts/ufo-mission-result.mjs` (dep line anchors only).
## `scripts/the-tick-ping.mjs`

`the-tick-ping.mjs` is the only *client* of the ground-handler socket protocol.
It loads the machine config (`:713`), fans one request out to every configured
runner, and prints one `the-tick-client-result-v1` JSON line to stdout. Three CLI
shapes map to three wire ops: default `path_ping`, `--fresh <runId>` →
`freshness_ping` (`:726-731`), `--health` → `health` (`:715-719`). It never sends
`chat` — the reply-ceiling rationale states "this client never sends chat and
rejects chat-result schemas" (`:61-62`) — and no chat-result schema is accepted by
`validateRunnerResponse` (`:227-272`).

`--interval-ms` and `--timeout-ms` are parsed as decimal-digit-only positive
integers; `Number()`'s hex/binary/exponent spellings are refused by the regex at
`:580` (`throw tickUsageError("positive_integer_required", ...)`, `:584`). Both may
be omitted, and then the config's declared defaults apply (`:738-739`):

    const intervalMs = options.intervalMs ?? config.pathPing.defaultIntervalMs;
    const timeoutMs = options.timeoutMs ?? config.pathPing.defaultDeadlineMs;

With the shipped `config/the-tick.machine.json` that is `defaultIntervalMs: 5000`
and `defaultDeadlineMs: 600000`, interval bounded `minIntervalMs: 250` …
`maxIntervalMs: 15000`, deadline floor `minDeadlineMs: 1000`, ceiling
`maxDeadlineMs: 900000`. The range checks are client-side usage errors
(`interval_out_of_range` `:741`, `timeout_exceeds_max` `:743`, `timeout_below_min`
`:748-750`), and each sets `error.tickUsage = true` (`:791-793`) — the marker
alone picks `status: "usage"` and exit 64 (`:826-829`, `:41`). The wire deadline is
absolute, computed once on the client's own clock: `deadlineMs: Date.now() +
timeoutMs` (`:802`). The runner-side dial bound is that deadline plus a fixed
`RUNNER_DEADLINE_GRACE_MS = 250` (`:49`), so an on-time `deadline` verdict is not
cut off and misreported as `unavailable` (`:43-48`); replies are bounded
separately by `RUNNER_RESPONSE_MAX_BYTES = 65_536` (`:65`).

**Handoff-file input shape.** Positional args are repo-relative paths, never
absolute; each becomes `{ id: \`target-${index}\`, root, relativePath }` (`:803`)
under the `--root` alias, default `"handoffs"` (`:613`), which must name a
configured root (`root_not_configured`, `:751`). A relative path is validated as
normalized-relative — no NUL, no backslash, not absolute, no empty/`.`/`..`
segment, ≤4096 chars (`:753-760`, `target_path_not_relative` `:758`) — and a
root-shaped target is refused with a typed error naming the alias it meant
(`:769-788`, `target_path_root_relative` / `target_path_root_shaped` `:781`). The
file whose appearance ends a wait is the launcher's handoff marker,
`.ufo/sighting/handoffs/<run-id>.json`, written after the durable outcome
(`run-omp-native-trial.mjs:4624`), shape `{runId, at, ompExit, verdict,
rejection}` (`:4636-4641`). `--fresh` reads a different leaf: the heartbeat file
`<runId>.json` under the reserved `heartbeat` root, produced by
`startMissionHeartbeat` (`run-omp-native-trial.mjs:2498`). Its `runId` is
validated against `FRESH_RUN_ID_RE` (`:606`, `:671-673`) *before* config load, or
a typo would be masked by transport state (`:600-605`).

**Completion detection.** `fanOutPathPing` (`:361`) dials all runners
concurrently and returns on the first *validated* `present` envelope, aborting
the siblings (`:406-415`). The runner side is a poll loop (`ufo-ground-handler.mjs:252`):
`present` only when every target is present (`:268`), else
`sleep(Math.min(request.intervalMs, remainingMs))` (`:272`) until the absolute
deadline yields `deadline` (`:275`). A runner `the-tick-error-v1` envelope never
synthesizes `deadline` (`:418-423`), exactly as it never synthesizes `fresh`
(`:442-448`) or `ok` (`:513-519`).

**Exit codes** (`:30-41`): `present: 0`, `fresh: 0`, `ok: 0` (the three healthy
arms), `heartbeat_stale: 1`, `deadline: 2`, `unavailable: 3`,
`protocol_error: 4`, `busy: 5`, `error: 6`, `degraded: 7`, `usage: 64`. They are
applied as `process.exitCode = TICK_PING_EXIT_CODES[result.status] ??
TICK_PING_EXIT_CODES.error` (`:722`, `:734`, `:807`) — an unknown status floors
at 6, never 0.

**Failure strings.** Socket-level framing faults carry literals from `dialRunner`:
`"runner deadline exceeded"` (`:132`), `"runner response exceeded the byte limit"`
(`:151`, `:154`), `"runner returned trailing response bytes"` (`:155`), `"runner
returned invalid JSON"` (`:160`), `"runner closed without a response"` (`:166`).
The file's own header pins the exit-code nuance: a validated-envelope
contradiction is exit 4 `protocol_error`, while oversize/trailing/JSON/silent-close
faults surface as `unavailable` (3) with `failures[].code "protocol_error"`, so
scripts must read the JSON status, not key on exit 4 alone (`:15-19`, `:301-303`).
An uncaught failure prints `{schema: "the-tick-client-result-v1", status: usage|error,
error: {code: error.code ?? status, message}}` (`:828`). `writeStdout` uses
`writeSync(1, text)` and treats `EPIPE` as "consumer gone" → `process.exit(0)`
(`:685-691`), because a bare `process.stdout.write` turns EPIPE into an unhandled
stream error (raw stack, no envelope) on the documented 900 s wait.

**Who calls it.** `npm run the-tick:ping` → `node scripts/the-tick-ping.mjs`
(the root `package.json`'s `the-tick:ping` script; also `docs/THE-TICK.md:74-76`); the ufo skill invokes it as the bounded completion-path
wakeup, `--interval-ms 250 --timeout-ms 900000 <run-id>.json` (the configured
minimum interval and maximum deadline; defaults 5000/600000 ms) —
`.cursor/skills/ufo/SKILL.md:614-618`; `docs/THE-TICK.md:74-76` shows the same
three shapes; `tests/the-tick.test.js:15` imports the three fan-outs plus the
protocol-error enum.

## `scripts/ufo-ground-handler.mjs`

One `ufo-ground-handler.mjs` process serves exactly one runner id, bound to one
unix socket. Both socket paths are config templates — `"${XDG_RUNTIME_DIR}/ufo/the-tick/runner-0.sock"`
and `…/runner-1.sock` (`config/the-tick.machine.json:23`, `:27`) — expanded at
config load (`the-tick-config.mjs:497`) and required to be a *direct child* of
`runtimeDir` = `"${XDG_RUNTIME_DIR}/ufo/the-tick"` (`:5`, `${XDG_RUNTIME_DIR}`
resolved at `the-tick-config.mjs:494`; direct-child check at `:500`). Binding is
exclusive and hardened: `listen({ path: socketPath, readableAll: false,
writableAll: false })` (`:530`) under `process.umask(0o077)` (`:539`), then
`chmodSync(socketPath, 0o600)` (`:548`) with a re-read mode check that refuses
`ufo_socket_mode_not_private` (`:550`); ownership is checked first
(`ufo_socket_not_owned`, `:503`). A post-listen fault closes the server and
unlinks only a path still carrying this claim's inode (`:552-564`, `:567-578`).

**Op set.** `parseSingleRequest` (`:98`) dispatches on `op`:
`health` (`:115`, exact keys `["schema", "requestId", "op"]`),
`chat` (`:122`, keys `["schema", "requestId", "op", "deadlineMs", "prompt"]`, `:123`),
`freshness_ping` (`:134`, keys `["schema", "requestId", "op", "runId"]`, `:135`),
and `path_ping` (`:145`, keys `["schema", "requestId", "op", "intervalMs",
"deadlineMs", "targets"]`); anything else is
`requestFail(PATH_PING_ERROR_CODES.BAD_REQUEST, "unsupported op")` (`:144`), and
every request requires an `op` at all (`:111-113`). Each `targets[i]` is exactly
`["id", "root", "relativePath"]` (`:160`), `id` unique and ≤128 chars (`:161-164`),
`root` a configured alias (`:165-167`). The server applies the same mapping
(`:704-709`).

**Response shapes.** Success envelopes all spread `commonResponse` (requestId,
runnerId, configSha256, provenance, `:391-398`): `the-tick-path-ping-result-v1`
with `status`/`observedAtMs`/`elapsedMs`/`attemptCount`/`targets` (`:277-288`),
`the-tick-freshness-ping-result-v1` with `status`/`ageMs`/`advisoryOnly: true`
(`:323-335`), `the-tick-health-result-v1` with `status: "ok"`/`advisoryOnly: true`
(`:490-497`), `the-tick-chat-result-v1` with `response` (`:472-478`). Runner
faults are `the-tick-error-v1` = common response + `status` + `observedAtMs` +
`error: {code, message}` (`:400-408`), with statuses `rejected | busy | deadline |
error` (`:717-719`).

**Closed error vocabulary.** `PATH_PING_ERROR_CODES` is the only vocabulary that
reaches the wire, and only its members do: `bad_request`, `busy`, `deadline`,
`internal_error`, `protocol_error`, `invalid_target`, `request_too_large`
(`the-tick-config.mjs:91-99`). The dispatch path's catch maps a foreign code and
its raw message to `internal_error` / `"request failed"` (`:713-721`), and the
parse path does the same with a floor of `bad_request` (`:688-696`).

**Freshness bounds.** The freshness alias is fixed in code, never caller-supplied:
`FRESHNESS_ROOT_ALIAS = "heartbeat"` (`:33`), reading exactly one leaf,
`` `${request.runId}.json` `` under `freshnessPing.heartbeatRoot`
`"${REPO_ROOT}/.ufo/sighting/heartbeat"` (`:299-302`, `config:53`), which the
handler creates private — `mkdirSync(…, { recursive: true, mode: 0o700 })`
(`:754`). `staleAfterMs: 90000` (`config:54`) is the stale bound, and
`FRESHNESS_CLOCK_SKEW_MS = 1_000` (`:38`) is the future-skew allowance: a raw age
more than 1 s ahead of the observer is `heartbeat_stale`
(`futureBeyondSkew = rawAgeMs !== null && rawAgeMs < -FRESHNESS_CLOCK_SKEW_MS`,
`:319`; verdict at `:320-322`), while `ageMs` itself is floored at 0 (`:318`) so
the client's negative-age protocol-error arm stays unreachable. **Brief
correction:** the assignment text says ">5 s future-skew refusal"; the constant in
this HEAD is **1,000 ms** (1 s) — `docs/THE-TICK.md:89` independently states the
same 1,000 ms allowance. No 5 s skew constant exists in either file (grep `SKEW`
returns only `:38`/`:319`).

**Single model-touch path.** Exactly one `fetch(` exists in the file (`:445`),
inside `handleChat`, and it is the only egress: `POST
config.backend.endpoint` (`http://127.0.0.1:34113/v1/chat/completions`,
`config:16`) with `redirect: "error"`, body `model: config.model.apiModel`
(`:451`), `temperature: 0.1` (`:452`), a fixed system prompt
`"You are THE TICK, a local advisory ground helper. Give concise reversible
guidance. Never judge, admit, ship, mutate run state, or claim an action
occurred."` (`:41`), and the caller's prompt. The prompt is bounded before dialing:
non-empty after trim and `Buffer.byteLength(request.prompt, "utf8") > 12_000`
refuses (`:127-130`). The reply is read through `readBoundedJson`, bounded by
`MAX_CHAT_RESPONSE_BYTES = 1_048_576` (`:39`, `:420`), must be JSON (`:433-436`),
and must echo the local model identity `body.model === config.model.path`
(`:466-468`); the assistant content must be a string (`:469-470`). `health`,
`freshness_ping` and `path_ping` never touch the backend.

**Bounded-exec / refusal posture.** Neither this file nor `the-tick-ping.mjs`
imports `node:child_process` or contains `spawn`/`execSync`/`execFile`/`eval(`/
`new Function` (grep, zero hits): the handler observes and answers, it never
executes. Inbound framing is bounded by `requestReadTimeoutMs: 5000` (`config:41`,
`:654-657`), `maxRequestBytes: 16384` (`config:49`, `:668`, `:673`), one request
per connection (`:662`), and `maxInflightPerRunner: 8` (`config:50`) beyond which
the runner answers `status: "busy"` / `busy` (`:697-700`). Startup refusals use
their own snake_case namespace, never the request vocabulary: `ufo_socket_not_owned`
(`:503`), `ufo_socket_mode_not_private` (`:550`), `ufo_runtime_path_not_directory`
(`:583`), `ufo_runtime_path_owner` (`:586`), `ufo_runtime_path_not_private`
(`:590`), `ufo_runtime_path_xdg_unset` (`:605`), `ufo_runtime_path_escape`
(`:610`), `ufo_heartbeat_root_not_creatable` (`:756`), `ufo_cli_runner_unknown`
(`:764`), `ufo_cli_runner_duplicate` / `ufo_cli_runner_value_missing` (`:789`/`:790`),
`ufo_cli_config_duplicate` / `ufo_cli_config_value_missing` (`:793`/`:794`),
`ufo_cli_argument_unknown` (`:797`), `ufo_cli_runner_missing` (`:821`). CLI parse
and runner-validation failures set `tickUsage` → exit 64, all other faults exit 1
(`:857`). `SIGTERM`/`SIGINT` abort in-flight requests, then release the socket
(after a 2 s force), so a restart never meets a stale path (`:828-843`, `:567-578`).

**Who calls it.** `npm run the-tick:handler` → `node scripts/ufo-ground-handler.mjs`
(the root `package.json`'s `the-tick:handler` script), started once per runner:
`node scripts/ufo-ground-handler.mjs --runner tick-0|tick-1`
(`.cursor/skills/ufo/SKILL.md:608`, `docs/THE-TICK.md:57-58`). Two supervised
instances are the expected steady state; the handler binds exclusively and exits 1
on `EADDRINUSE`, so reuse is the supervisor's duty, not the handler's (`SKILL.md:610-612`).
`node --check scripts/ufo-ground-handler.mjs` and `node --check scripts/the-tick-ping.mjs`
both exit 0 at this HEAD.

## Corrections this note carries

- **The 5 s future-skew bound in `SKILL.md` is wrong.** The handler's constant is
  `FRESHNESS_CLOCK_SKEW_MS = 1_000` (`ufo-ground-handler.mjs:38`, compared at
  `:319`); `grep -rn 'skew\|SKEW' scripts/*.mjs` finds no 5 s constant and
  `docs/THE-TICK.md:89` states "the 1,000 ms clock-skew allowance". `SKILL.md`
  is corrected in the same round.
- **`--fresh` reads the heartbeat leaf, not the handoff file.** The handoff
  marker is what `path_ping` waits on; `--fresh` checks `<runId>.json` under
  `freshnessPing.heartbeatRoot`.

## Member-completeness probe

The registry counts S6 as covered; the claim is checkable per member — exactly
one `## ` heading for the member and line-anchored citations inside that
member's own section:

```
$ for m in ufo-stale-watchdog ufo-l0-monitor ufo-l0-watch the-tick-ping ufo-ground-handler; do
    s=$(awk -v m="$m" 'index($0, "## `scripts/" m ".mjs`")==1 {f=1; next} /^## /{f=0} f' \
      corpus/knowledge/ops-watchers.md)
    printf '%-24s heading=%s cites=%s names=%s\n' "$m" \
      "$(grep -c "^## \`scripts/$m.mjs\`" corpus/knowledge/ops-watchers.md)" \
      "$(printf '%s\n' "$s" | grep -cE ':[0-9]+')" \
      "$(printf '%s\n' "$s" | grep -cF "$m")"; done
ufo-stale-watchdog       heading=1 cites=37 names=2
ufo-l0-monitor           heading=1 cites=55 names=3
ufo-l0-watch             heading=1 cites=35 names=4
the-tick-ping            heading=1 cites=41 names=2
ufo-ground-handler       heading=1 cites=58 names=4
```

Sources: `scripts/ufo-stale-watchdog.mjs`, `scripts/ufo-l0-monitor.mjs`,
`scripts/ufo-l0-watch.mjs`, `scripts/the-tick-ping.mjs`,
`scripts/ufo-ground-handler.mjs`, `scripts/ufo-mission-result.mjs` (shared hub
line anchors), `scripts/fleet-dispatcher.mjs` (the other queue writer),
`scripts/ufo-sighting-lib/queue.mjs`, `scripts/the-tick-config.mjs`,
`docs/THE-TICK.md`, `docs/BEHAVIOR-MATRIX.md`.

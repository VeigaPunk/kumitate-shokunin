FID-OPS anchors=417 elsewhere=120 absent=69 dead=158 noid=66

# ScoutFidOps — per-anchor repair list: corpus/knowledge/ops-watchers.md

Pin: `/fast/scratch/kumitate-r36/src` @ `31c465f15669f744848bd9f5d56191c5085670f7` (`dr-xr-xr-x`); lane tip `0614092e0804aaca06642cb3a263a05c1cacc98e`. Read-only seat: this report is the only file written.
Method: FIDELITY v1 as frozen (dead before pairing; nonok = elsewhere+absent; symbol = adjacent backticked span, right-first ≤14 chars else left ≤14; path anchors only when resolving to the section's own member file); validated by reproducing `baseline/fidelity-prototype-v1.txt` line 9 exactly: 417/4/120/69/158/66. The five member sections are note lines 28/91/188/253/340; the preamble (1–27) and the tail (`## Corrections` 443, `## Member-completeness probe` 454) are not member sections, so their citations are outside FIDELITY v1 (registry liveness still covers them).
Pairing caveat: `symA` (`:a`), `symB` (`:b`) pairs `:a` with `symB`, not the intended `symA`. 57 of 189 rows are shifted: 45 carry a `claim` cell (left-adjacent claim symbol @ its best own-file line), and 12 are the L88/L250 `qual` rows whose target names the intended symbol. Rewrite such a citation as `` `:L` `SYM` `` (anchor first) to keep the claim; the bare `:L`/`rq` fix is minimal-green on the current layout, so use the claim fix for truth.
Length: the mandated one-row-per-anchor table (189 rows) puts this report over the usual 150-line cap; everything else is compressed.
Rendering: `near` = up to 3 nearest own-file occurrence lines of the paired symbol. `rq 'X'` = requote the symbol to verbatim `X` at that line. `qual file:L` = path-qualify to the owning file (stops being a FIDELITY anchor; registry gate still checks liveness). `@—` = claim symbol not verbatim anywhere in the member file.
Verified: replacing all 120 elsewhere anchors with their `:L` yields 124 ok / 69 absent / 66 noid / 158 dead (nonok 189→69). Dropping all 69 absent anchors instead surfaces 7 new nonok (`:489 :1325 :134 :1547 :673 :790 :794`) — requote those or drop in a second pass.
Row format: `note | anchor | paired symbol | class | near | pair-fix | claim-fix`

## scripts/ufo-stale-watchdog.mjs — 17 non-ok / 148 anchors (ok 0, elsewhere 7, absent 10; dead 121, noid 10)
```
L32 | :132 | for (;;) { tick(); spinWait(POLL_MS); } | absent | — | drop | POLL_MS = 300_000@—
L43 | :133 | STALE_MS = 1_200_000 | absent | — | drop
L43 | :134 | MAX_REFIRE_ATTEMPTS = 3 | absent | — | drop | MAX_NUDGES = 2@—
L43 | :135 | MAX_REPEND_ATTEMPTS = 12 | elsewhere | 44 | :44 | MAX_REFIRE_ATTEMPTS = 3@—
L43 | :136 | POLL_MS | absent | — | drop | MAX_REPEND_ATTEMPTS = 12@44
L43 | :142 | L2_TARGET = 16 | absent | — | drop
L68 | :83 | d.env | elsewhere | 144 | :144
L70 | :130 | MAX_LOG_BYTES = MAX_EVIDENCE_LOG_BYTES | elsewhere | 43 | :43
L70 | :185 | watchdog_log_rotate_failed | elsewhere | 87 | :87 | watchdog_log_rotated@82
L70 | :190 | watchdog_log_rotate_failed | elsewhere | 87 | :87
L80 | :154 | !(runId in {}) | elsewhere | 53 | :53 | isSafeRunId@53
L80 | :160 | boundedRunId = String(runId).slice(0, 128) | absent | — | :54 rq 'boundedRunId'
L82 | :126 | MAX_STATE_BYTES = 1024 * 1024 | absent | — | drop
L88 | :80 | repend | elsewhere | 44,128,130 | qual scripts/fleet-dispatcher.mjs:80 (fleet-dispatcher)
L88 | :209 | plainObjectRows | absent | — | qual scripts/ufo-mission-result.mjs:138 (isPlainObject)
L88 | :226 | emitErrorJson | absent | — | qual scripts/ufo-mission-result.mjs:155 (plainObjectRows)
L88 | :110 | emitFor | absent | — | drop
```
The watchdog was rewritten at the pin (250 lines vs the note's 1,010). `STALE_MS`, `POLL_MS`, `MAX_NUDGES`, `MAX_REFIRE_ATTEMPTS`, `MAX_STATE_BYTES`, `L2_TARGET` are gone; 131 of this section's 148 anchors are dead/absent. Its prose needs a revision update, not just anchors.

## scripts/ufo-l0-monitor.mjs — 0 anchors
All 55 citations in this section are unbackticked (`at :1305`, `(:1375)`); FIDELITY v1 counts none. Registry liveness still covers them.

## scripts/ufo-l0-watch.mjs — 112 non-ok / 156 anchors (elsewhere 79, absent 33; dead 21, noid 23)
```
L190 | :119 | l0-watch.log | elsewhere | 111,133 | :111
L192 | :149 | spinWait(INTERVAL_MS) | elsewhere | 2223 | :2223 | INTERVAL_MS = 90_000@188
L192 | :1676 | spinWait(INTERVAL_MS) | elsewhere | 2223 | :2223
L192 | :1674 | tick_error <childFault> | absent | — | :2221 rq 'tick_error'
L192 | :159 | FLAG_ARGS = ["--once"] | elsewhere | 2089 | :2089 | --once@204
L192 | :1544 | tick() | elsewhere | 1856,1208,1202 | :1856 | FLAG_ARGS = ["--once"]@2089
L192 | :1658 | tick() | elsewhere | 1856,1958,1969 | :1856
L192 | :487 | ufo-l0-monitor.mjs --fleet <set> --rebind --repair --repend --settle --json | absent | — | :565 rq '"--rebind", "--repair", "--repend", "--settle", "--json"'
L192 | :1361 | monitor_failed <fault> | absent | — | :1882 rq 'monitor_failed'
L194 | :1497 | noteTransition | elsewhere | 1503,1513,1537 | :1503 | monitor_report_malformed <shape>@—
L194 | :323 | noteTransition | elsewhere | 372,1059,1067 | :372
L194 | :453 | appendStampedLog | elsewhere | 532,539,59 | :532 | log()@961
L194 | :451 | MAX_LOG_BYTES = MAX_EVIDENCE_LOG_BYTES | elsewhere | 529 | :529
L196 | :150 | MAX_LANE_ENQUEUES_HOUR = 4 | elsewhere | 202 | :202 | MAX_ENQUEUES_HOUR = 48@199
L196 | :153 | MAX_LANE_ENQUEUES_HOUR = 4 | elsewhere | 202 | :202
L196 | :464 | fresh | elsewhere | 547,551,555 | :547 | prune(state, now)@542
L196 | :469 | parsed <= now && parsed > hourAgo | elsewhere | 549 | :549
L196 | :154 | WHIP_COOLDOWN_MS = 15 * 60_000 | elsewhere | 203 | :203
L196 | :147 | ROUNDS = 8 | elsewhere | 187 | :187 | {"nightcall"}@—
L196 | :148 | ROUNDS = 8 | elsewhere | 187 | :187
L196 | :228 | ["nightcall-"] | elsewhere | 277 | :277
L204 | :283 | successorDue(task) | elsewhere | 332,1268 | :332
L204 | :1186 | round < rounds | absent | — | :338 rq 'iterate.round < iterate.rounds'
L205 | :1035 | deferredIteration(task) | elsewhere | 1117,1271 | :1117
L206 | :1198 | scopeAllow.some(...) | absent | — | :1280 rq 'scopeAllow.some('
L207 | :1199 | childOf.has(task.key) | elsewhere | 1281 | :1281
L208 | :1200 | overlapsOccupied(task.scopes, occupied) | elsewhere | 1282 | :1282
L209 | :313 | invalid_run_id <id> <title> | absent | — | :362 rq 'invalid_run_id'
L210 | :1268 | respawn_skipped_no_alias <title> | absent | — | :1354 rq 'respawn_skipped_no_alias' | parent.l1Alias@1350
L210 | :1272 | respawn_skipped_no_alias <title> | absent | — | :1354 rq 'respawn_skipped_no_alias'
L211 | :1279 | respawn_skipped_bad_path <title> | absent | — | :1361 rq 'respawn_skipped_bad_path'
L212 | :1290 | budget_lane | elsewhere | 1384 | :1384 | lane.at.length >= 4@—
L212 | :1291 | budget_lane | elsewhere | 1384 | :1384
L213 | :1294 | budget_global | elsewhere | 1388 | :1388 | state.enqueues.length >= 48@—
L213 | :1295 | budget_global | elsewhere | 1388 | :1388
L214 | :1298 | respawn_skipped_occupied | elsewhere | 1392 | :1392 | overlapsOccupied(spec.scopes, occupied)@1391
L214 | :1299 | respawn_skipped_occupied | elsewhere | 1392 | :1392
L215 | :858 | respawned <title> -> <alias> | absent | — | :1418 rq 'respawned ${spec.title} -> ${parent.l1Alias}' | enqueue(spec)@—
L215 | :1323 | respawn_deduped … | absent | — | :1417 rq 'respawn_deduped'
L217 | :858 | enqueue() | elsewhere | 1005,1012,1421 | :1005
L217 | :871 | exec(process.execPath, [DISPATCHER, "enqueue", "--spec", "-"]) | absent | — | :953 rq 'exec(process.execPath, [DISPATCHER, "enqueue", "--spec", "-"]'
L217 | :899 | "unparseable" | elsewhere | 974,1005,1008 | :974
L217 | :1335 | respawn_failed <childFault> | absent | — | :1428 rq 'respawn_failed'
L217 | :1332 | respawn_<outcome> | absent | — | :1425 rq 'respawn_${outcome}'
L217 | :1478 | seal_pending <title> | absent | — | :2004 rq 'seal_pending'
L217 | :1466 | seal_check_failed | elsewhere | 1992 | :1992
L217 | :1484 | respawn_section_failed | elsewhere | 2010 | :2010
L219 | :1046 | sealReopenStep | elsewhere | 1128,1301 | :1128
L219 | :1055 | findSuccessor(lane.donePath) | elsewhere | 1137 | :1137
L221 | :570 | continuationSpec | elsewhere | 648,936,181 | :648
L221 | :590 | title | elsewhere | 578,666,668 | :578
L221 | :622 | remaining < 1 | elsewhere | 704 | :704
L223 | :951 | whipRow | elsewhere | 1033,2029 | :1033
L227 | :313 | invalid_run_id … | absent | — | :362 rq 'invalid_run_id'
L228 | :968 | whip_skipped_scan_error <title> <scanError> | absent | — | :1050 rq 'whip_skipped_scan_error'
L229 | :977 | whip_skipped_foreign_receipt <title> | absent | — | :1059 rq 'whip_skipped_foreign_receipt'
L230 | :985 | whip_skipped_future_mtime <title> | absent | — | :1067 rq 'whip_skipped_future_mtime'
L232 | :1001 | terminal_stop | absent | — | drop | whip_skipped_<skip>@—
L232 | :266 | no_continue | elsewhere | 319 | :319
L234 | :1019 | whip_drift:<kind> … | absent | — | :1101 rq 'whip_drift'
L236 | :230 | WHIP_DRIFT | elsewhere | 287,297,305 | :287 | WHIP@279
L236 | :238 | WHIP_DRIFT_UNREADABLE | elsewhere | 297,305 | :297 | WHIP_DRIFT@287
L236 | :248 | driftWhipText(kind) | elsewhere | 304 | :304 | WHIP_DRIFT_UNREADABLE@297
L236 | :255 | driftWhipText(kind) | elsewhere | 304 | :304
L236 | :266 | stop | elsewhere | 310,316,14 | :310 | "continue"@315
L236 | :909 | exec("bash", [SIGHTING, "steer", "--mission", runId, "--text", text], …) | absent | — | :991 rq 'exec("bash", [SIGHTING, "steer", "--mission", runId, "--text", text]'
L236 | :1017 | lane.lastWhipAt = nowIso | elsewhere | 1099 | :1099
L236 | :1018 | stalledIdleText(row, "") | elsewhere | 1100 | :1100
L238 | :871 | enqueue --spec - | absent | — | :953 rq '"--spec", "-"'
L238 | :743 | MAX_QUEUE_BYTES | elsewhere | 726,722,891 | :726 | readQueue@825
L238 | :440 | writeWithMkdirRetry | elsewhere | 519,522,148 | :519 | writeFileAtomicIfChanged@518
L238 | :444 | writeWithMkdirRetry | elsewhere | 519,522,148 | :519
L240 | :329 | readState | elsewhere | 378,1860,2054 | :378
L240 | :333 | MAX_QUEUE_BYTES | elsewhere | 382,518,63 | :382
L240 | :385 | lastWhipAt | elsewhere | 427,451,484 | :427 | sealNote@452
L242 | :1630 | acquireWatchLock(join(ROOT, ".ufo")) | elsewhere | 2175 | :2175
L242 | :1521 | ownerLinkPrefix: ".l0-watch.owner" | elsewhere | 2067 | :2067 | lockName: "l0-watch.lock"@2066
L242 | :1522 | watch_instance_refused ownerPid=… lockPath=… reason=… | absent | — | :2179 rq 'watch_instance_refused' | ownerLinkPrefix: ".l0-watch.owner"@2067
L242 | :1634 | process.exit(0) | elsewhere | 2181,2193 | :2181 | watch_instance_refused ownerPid=… lockPath=… reason=…@—
L242 | :1648 | --once | elsewhere | 1665,2084,2089 | :1665 | process.exit(0)@2181
L242 | :1640 | instance_refused | elsewhere | 2179,2187 | :2179
L242 | :1646 | process.exit(0) | elsewhere | 2181,2193 | :2181
L242 | :1661 | watch_start fleets=… scopes=… interval=…ms ownerPid=… lockStolen=… | absent | — | :2206 rq 'watch_start'
L244 | :107 | resolveWatchStatePath(root, env) | absent | — | :165 rq 'resolveWatchStatePath(root, envValue)' | UFO_L0_WATCH_STATE@102
L244 | :126 | resolveWatchStatePath(root, env) | absent | — | :165 rq 'resolveWatchStatePath(root, envValue)'
L244 | :133 | MissionResultError("watch_state_outside_root", …) | absent | — | :172 rq 'watch_state_outside_root'
L244 | :111 | exit 2 | absent | — | :129 rq 'process.exit(2)'
L244 | :115 | UFO_PENDING_WORK_PATH | elsewhere | 104,812 | :104
L244 | :730 | resolveQueuePath | elsewhere | 805,812,106 | :805 | UFO_PENDING_WORK_PATH@812
L244 | :658 | queueRowPath = containedJoin | absent | — | :740 rq 'queueRowPath'
L246 | :1544 | --fleets --scopes --rounds --interval-ms --max-enqueues-hour --max-lane-enqueues-hour --whip-cooldown-min | absent | — | :2091 rq '"--fleets", "--scopes", "--rounds", "--interval-ms"' | ["--once"]@2089
L246 | :1545 | --fleets --scopes --rounds --interval-ms --max-enqueues-hour --max-lane-enqueues-hour --whip-cooldown-min | absent | — | :2092 rq '"--max-enqueues-hour", "--max-lane-enqueues-hour", "--whip-cooldown-min"'
L246 | :1615 | process.exitCode = 64 | elsewhere | 2160 | :2160
L246 | :1593 | "--whip-cooldown-min must be a finite number >= 0" | elsewhere | 2150 | :2150 | "--interval-ms must be a finite number >= 1000 (a tick costs a monitor exec)"@2138
L246 | :1605 | "--whip-cooldown-min must be a finite number >= 0" | elsewhere | 2150 | :2150
L246 | :1652 | watch_start_error stage=<lock_acquire|startup> | absent | — | :2197 rq 'watch_start_error'
L246 | :1674 | tick_error | elsewhere | 2221 | :2221
L248 | :680 | holeVerdictMemo | elsewhere | 762,765,775 | :762
L248 | :682 | memoizedVerdict | elsewhere | 764,793,930 | :764
L248 | :693 | holeVerdictMemoized | elsewhere | 788,1213,1216 | :788
L248 | :706 | holeVerdictMemoized | elsewhere | 788,1213,1216 | :788
L250 | :1716 | appendStampedLog | elsewhere | 539,532,59 | qual scripts/ufo-mission-result.mjs:1311 (acquireSingletonLock)
L250 | :2220 | writeFileAtomicIfChanged | elsewhere | 518,509,62 | qual scripts/ufo-mission-result.mjs:1803 (writeWithMkdirRetry)
L250 | :990 | readBoundedJson | elsewhere | 892,1180,382 | qual scripts/ufo-mission-result.mjs:832 (readBoundedFile)
L250 | :1098 | readQueueFile | elsewhere | 831,70 | qual scripts/ufo-mission-result.mjs:936 (readBoundedJson)
L250 | :791 | validateTaskReceiptEitherBinding | elsewhere | 914,54 | qual scripts/ufo-mission-result.mjs:676 (validateTaskReceipt)
L250 | :226 | isPlainObject | elsewhere | 334,75,386 | qual scripts/ufo-mission-result.mjs:155 (plainObjectRows)
L250 | :209 | redactAbsolutePaths | elsewhere | 85,622,634 | qual scripts/ufo-mission-result.mjs:138 (isPlainObject)
L250 | :1069 | knownRootTags | elsewhere | 98,86 | qual scripts/ufo-mission-result.mjs:907 (redactAbsolutePaths)
L250 | :1047 | spinWait | elsewhere | 80,2223 | qual scripts/ufo-mission-result.mjs:885 (knownRootTags)
L250 | :899 | isMainModule | elsewhere | 814,123,74 | qual scripts/ufo-mission-result.mjs:741 (spinWait)
L250 | :177 | MissionResultError | elsewhere | 171,56,769 | qual scripts/ufo-mission-result.mjs:106 (MissionResultError)
```
The `<placeholder>`/`…` spellings are note conventions, not literals; each `rq` gives the verbatim current token (`invalid_run_id`, `respawn_skipped_*`, `whip_drift`, `watch_start`, ...). `terminal_stop` is now dynamic (`terminal_${decision}` :317). L250 is entirely hub/child citations — see the cross-file mapping below.

## scripts/the-tick-ping.mjs — 13 non-ok / 43 anchors (ok 4, elsewhere 9, absent 4; dead 13, noid 13)
```
L259 | :715-719 | health | elsewhere | 627,625,623 | :627
L266 | :580 | throw tickUsageError("positive_integer_required", ...) | absent | — | :513 rq 'must be a positive integer'
L266 | :584 | throw tickUsageError("positive_integer_required", ...) | absent | — | :516 rq 'must be a positive integer'
L283 | :65 | RUNNER_RESPONSE_MAX_BYTES = 65_536 | absent | — | drop
L287 | :613 | "handoffs" | elsewhere | 536 | :536
L299 | :606 | FRESH_RUN_ID_RE | elsewhere | 594,529 | :594
L302 | :361 | fanOutPathPing | elsewhere | 321,214,212 | :321
L306 | :272 | sleep(Math.min(request.intervalMs, remainingMs)) | absent | — | qual scripts/ufo-ground-handler.mjs:259
L307 | :275 | the-tick-error-v1 | elsewhere | 270,283,295 | :270 | deadline@275
L308 | :418-423 | deadline | elsewhere | 434,437,446 | :434
L319 | :132 | "runner response exceeded the byte limit" | elsewhere | 101,98 | :101 | "runner deadline exceeded"@79
L320 | :154 | "runner returned trailing response bytes" | elsewhere | 102 | :102
L320 | :155 | "runner returned trailing response bytes" | elsewhere | 102 | :102
```
At the pin the positivity check throws plain `Error("... must be a positive integer")` (:513/:516) — `tickUsageError`/`positive_integer_required` no longer exist; the fixed `RUNNER_RESPONSE_MAX_BYTES = 65_536` is also gone (the bound is `config.pathPing.maxRequestBytes`).

## scripts/ufo-ground-handler.mjs — 47 non-ok / 70 anchors (elsewhere 25, absent 22; dead 3, noid 20)
```
L346 | :5 | ${XDG_RUNTIME_DIR} | absent | — | :545 rq 'env.XDG_RUNTIME_DIR'
L350 | :548 | chmodSync(socketPath, 0o600) | elsewhere | 493 | :493
L351 | :550 | ufo_socket_mode_not_private | absent | — | drop
L352 | :503 | ufo_socket_not_owned | absent | — | drop
L355 | :98 | parseSingleRequest | elsewhere | 86,627 | :86
L356 | :115 | ["schema", "requestId", "op"] | elsewhere | 104 | :104 | health@105
L357 | :122 | ["schema", "requestId", "op", "deadlineMs", "prompt"] | elsewhere | 111 | :111 | chat@112
L357 | :123 | ["schema", "requestId", "op", "deadlineMs", "prompt"] | elsewhere | 111 | :111
L358 | :134 | ["schema", "requestId", "op", "runId"] | elsewhere | 123 | :123 | freshness_ping@124
L358 | :135 | ["schema", "requestId", "op", "runId"] | elsewhere | 123 | :123
L359 | :145 | path_ping | elsewhere | 134,133,132 | :134
L361 | :144 | requestFail(PATH_PING_ERROR_CODES.BAD_REQUEST, "unsupported op") | elsewhere | 132 | :132
L362 | :111-113 | targets[i] | absent | — | :148 rq 'targets[${index}]'
L363 | :160 | ["id", "root", "relativePath"] | elsewhere | 148 | :148
L368 | :391-398 | the-tick-path-ping-result-v1 | elsewhere | 266 | :266
L369 | :277-288 | targets | elsewhere | 275,256,250 | :275
L371 | :323-335 | the-tick-health-result-v1 | elsewhere | 437 | :437
L372 | :490-497 | the-tick-chat-result-v1 | elsewhere | 418 | :418
L372 | :472-478 | response | elsewhere | 422,410,408 | :422
L374 | :400-408 | error: {code, message} | absent | — | :351 rq 'error: { code, message }'
L381 | :713-721 | "request failed" | elsewhere | 662,635 | :662
L382 | :688-696 | bad_request | elsewhere | 75 | :75
L385 | :33 | FRESHNESS_ROOT_ALIAS = "heartbeat" | elsewhere | 32 | :32
L387 | :299-302 | config:53 | absent | — | drop
L389 | :754 | staleAfterMs: 90000 | absent | — | :310 rq 'config.freshnessPing.staleAfterMs'
L390 | :38 | FRESHNESS_CLOCK_SKEW_MS = 1_000 | elsewhere | 37 | :37
L393 | :320-322 | ageMs | elsewhere | 319,310,306 | :319
L404 | :451 | temperature: 0.1 | elsewhere | 397 | :397
L404 | :452 | temperature: 0.1 | elsewhere | 397 | :397
L410 | :39 | MAX_CHAT_RESPONSE_BYTES = 1_048_576 | elsewhere | 38 | :38
L412 | :469-470 | health | elsewhere | 437,435,645 | :437
L419 | :654-657 | maxRequestBytes: 16384 | absent | — | :609 rq 'config.pathPing.maxRequestBytes'
L419 | :668 | config:49 | absent | — | drop
L420 | :662 | maxInflightPerRunner: 8 | absent | — | :638 rq 'config.pathPing.maxInflightPerRunner'
L421 | :697-700 | busy | elsewhere | 639 | :639
L423 | :503 | ufo_socket_mode_not_private | absent | — | drop
L423 | :550 | ufo_runtime_path_not_directory | absent | — | drop | ufo_socket_mode_not_private@—
L424 | :583 | ufo_runtime_path_owner | absent | — | drop
L424 | :586 | ufo_runtime_path_not_private | absent | — | drop | ufo_runtime_path_owner@—
L425 | :590 | ufo_runtime_path_xdg_unset | absent | — | drop
L425 | :605 | ufo_runtime_path_escape | absent | — | drop | ufo_runtime_path_xdg_unset@—
L426 | :610 | ufo_heartbeat_root_not_creatable | absent | — | drop
L426 | :756 | ufo_cli_runner_unknown | absent | — | drop | ufo_heartbeat_root_not_creatable@—
L427 | :764 | ufo_cli_runner_duplicate | absent | — | drop
L427 | :789 | ufo_cli_runner_value_missing | absent | — | drop
L428 | :793 | ufo_cli_config_value_missing | absent | — | drop
L429 | :797 | ufo_cli_runner_missing | absent | — | drop | ufo_cli_argument_unknown@—
```
The `ufo_socket_*` / `ufo_runtime_path_*` / `ufo_cli_*` code vocabulary is gone at the pin: the handler throws plain `Error` messages instead (`"runtime path is not private"` :531, `"XDG_RUNTIME_DIR is not set"` :546, `"runtime directory escapes XDG_RUNTIME_DIR"` :551). Requote those messages or cut the list. `config:N` aliases belong to `config/the-tick.machine.json` (see below).

## Diagnostics (not gated)

Dead 158 — ranges outside the pinned file or N>M. Watchdog is 250 lines at the pin (note cites the old 1,010-line revision), so its section is dead above :250; l0-watch L250's hub list exceeds its own 2,226 lines.
- watchdog 121: L32 `:996 :1006 :1001 :693 :706 :722 :715 :719 :734`; L34 `:734`; L35 `:740`; L36 `:748`; L37 `:757`; L38 `:769 :781 :783`; L39 `:931 :932`; L41 `:799 :801 :807`; L43 `:824 :783 :842 :536`; L49 `:869 :863 :864 :867`; L50 `:874`; L51 `:889 :890 :892 :893`; L52 `:909 :914 :915`; L53 `:903`; L57 `:621 :687`; L58 `:637`; L59 `:644 :646`; L60 `:662 :667`; L61 `:672`; L62 `:677 :683`; L64 `:505 :523 :515`; L66 `:979 :955 :956 :983 :984 :986 :989`; L68 `:731 :808 :509`; L71 `:983 :986 :989 :1001`; L72 `:281 :719`; L73 `:769 :781 :815 :826 :840 :808`; L74 `:869 :874 :893 :914 :903`; L75 `:631 :750 :637 :644 :672 :646 :667 :683 :677`; L76 `:585 :581`; L78 `:830 :839 :840 :768`; L82 `:256 :264 :266 :370`; L84 `:561 :572 :550 :579 :584 :585`; L86 `:984 :972 :974 :991`; L88 `:550 :3187 :1716 :2143 :2316 :990 :1314 :3052 :2593 :3164 :899 :3012 :2481 :2511`.
- l0-watch 21: L250 `:2279 :2316 :2692 :3236 :2632 :2656 :2678 :2744 :2805 :2529 :2868 :2504 :2618 :2496 :2511 :2372 :3164 :2566 :2257 :3012 :2481`.
- tick-ping 13: L259 `:726-731`; L267 `:738-739`; L276 `:741 :743`; L277 `:748-750 :791-793`; L278 `:826-829`; L286 `:803`; L288 `:751`; L290 `:753-760 :758`; L292 `:769-788 :781`.
- ground-handler 3: L429 `:821`; L431 `:857`; L432 `:828-843`.

Noid 66 (N = no span within 14; A = adjacent span ineligible):
- watchdog 10: L30 `:1 :30 :81 :83 :82` A; L64 `:16 :17` A; L68 `:79` A; L80 `:147` A; L88 `:79` A.
- l0-watch 23: L190 `:1 :35 :127` A; L192 `:1659` N, `:489` A; L196 `:472` A; L205 `:1189` A; L215 `:1325` A; L217 `:873` N, `:892` A; L232 `:270` A; L233 `:1010` N; L238 `:909` A; L240 `:417` N; L242 `:1626 :1629` A; L244 `:127 :134` A; L246 `:1547` A, `:1607` N; L250 `:85 :86 :87` A.
- tick-ping 13: L256 `:713` N; L261 `:61-62` N; L278 `:41` A; L299 `:671-673` A; L300 `:600-605` N; L304 `:406-415` N; L305 `:268` N; L309 `:442-448` N (`ok` 2 chars), `:513-519` A; L320 `:151` A; L325 `:15-19 :301-303` A; L329 `:685-691` N.
- ground-handler 20: L344 `:27` A; L347 `:500` N; L353 `:552-564 :567-578` A; L363 `:161-164` N; L364 `:165-167` N; L365 `:704-709` N; L393 `:318` N, `:319` A; L398 `:38 :319` A; L400 `:445` N; L409 `:127-130` N; L410 `:420` A, `:433-436` N; L412 `:466-468` N; L419 `:673` A; L427 `:790` A; L428 `:794` A; L432 `:567-578` A.

## Cross-file lines L88 / L250

Bare `:N` on these lines binds to the wrong file; qualify them. Current hub (`scripts/ufo-mission-result.mjs`) lines — L88: `newestMtime 3187→2613`, `acquireSingletonLock 1716→1311`, `appendRotatingLog 2143→1751`, `writeFileAtomicIfChanged 2316→1896`, `readBoundedFile 990→832`, `redact 1314→1145`, `loadSwarmPolicy 3052→2478`, `gatedConfigPath 2593→2163`, `parseReportOutput 3164→2590`, `spinWait 899→741`, `isMainModule 3012→2438`, `isPlainObject 209→138`, `plainObjectRows 226→155`, `emitErrorJson 2481→2051`, `MAX_EVIDENCE_LOG_BYTES 2511→2081`. L250: `appendStampedLog 2279→1859`, `writeWithMkdirRetry 2220→1803`, `writeFileAtomicIfChanged 2316→1896`, `readBoundedFile 990→832`, `readBoundedJson 1098→936`, `readQueueFile 2692→2262`, `resolveQueuePath 3236→2662`, `containedJoin 2632→2202`, `statSignature 2656→2226`, `sha256File 2678→2248`, `snapshotPromptSha256 2744→2308`, `snapshotConfigDigests 2805→2370`, `expectedReceiptBag 2529→2099`, `validateTaskReceipt 791→676`, `validateTaskReceiptEitherBinding 2868→2405`, `TERMINAL_QUEUE_STATES 2504→2074`, `isQueueRunId 2618→2188`, `MAX_QUEUE_BYTES 2496→2066`, `MAX_EVIDENCE_LOG_BYTES 2511→2081`, `parseDeclaredArgv 2372→1952`, `parseReportOutput 3164→2590`, `stalledIdleText 2566→2136`, `collapseWhitespace 2257→1837`, `plainObjectRows 226→155`, `isPlainObject 209→138`, `redactAbsolutePaths 1069→907`, `knownRootTags 1047→885`, `spinWait 899→741`, `isMainModule 3012→2438`, `emitErrorJson 2481→2051`, `MissionResultError 177→106`.

## Contract ambiguity

Two rows pair with `config:53` (`L387 :299-302`) and `config:49` (`L419 :668`). The frozen prototype treats `name:N` without a resolvable file as a symbol, keeping them in nonok=189; a stricter `isPathish` would make them noid and shift every count by −2. Keep the prototype predicate for this run; rewrite both as `config/the-tick.machine.json:53` / `:49` (that file has `heartbeatRoot` at 53 and `maxRequestBytes` at 49).

## Commands run

- `git -C /fast/scratch/kumitate-r36/src rev-parse HEAD` → `31c465f15669f744848bd9f5d56191c5085670f7`
- `stat -c '%A %U:%G %n' ...` → `dr-xr-xr-x vgpnk:vgpnk` for the clone and `-r-xr-xr-x` for the watchdog file
- `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin rev-parse HEAD` → `0614092e0804aaca06642cb3a263a05c1cacc98e`
- Python FIDELITY v1 pass: `TOTAL 417 {'noid': 66, 'absent': 69, 'dead': 158, 'elsewhere': 120, 'ok': 4}`; after pair fixes: `417 {'noid': 66, 'absent': 69, 'dead': 158, 'ok': 124}`; after also dropping absent: `348 {'noid': 59, 'dead': 158, 'ok': 124, 'absent': 7}`.

## Unknowns

Nearest/claim lines are symbol-presence locations, not semantic proof of the claim; the executor owns each prose reorder. [INFERENCE] every `claim ...@L` line plausibly carries the intended meaning. Dead/noid repair is optional by contract. No tool installs.

## Tooling

No installs or upgrades; system `python3` only; no pacman transaction.

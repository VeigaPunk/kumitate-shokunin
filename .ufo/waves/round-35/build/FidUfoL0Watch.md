FIDELITY scripts/ufo-l0-watch.mjs anchors=112 ok=1 moved=108 changed=3 gone=0

Scope: `corpus/knowledge/ops-watchers.md` (sha256 `87b13572…`) carries all 111 line tokens plus the member heading `## scripts/ufo-l0-watch.mjs` (:179, **ok**); `remaining-scripts-census.md` (hash toggled `9c223965…`→`c3930a8…` under concurrent sibling edits; test-section line moved :734↔:717, size cell 1608↔1370) has only bare-path membership + test-member claims; `singleton-and-queue-ownership.md` (`3613148d…`) has no line anchor for this member.
Method: `git -C /fast/scratch/kumitate-r35/src diff 964f443e 31c465f1 -- scripts/ufo-l0-watch.mjs` = +501/−37 (1762→2226 lines); every cited line read at both revisions and each proposed target re-checked against its symbol at 31c465f1. `ok` = 1 heading; `moved` = 108; `changed` = 3; `gone` = 0.
Structural: the section label is `daa371583` (absent from the clone: `git cat-file -e daa371583` → fatal). At 964f443e the anchors were already displaced (+4 early … +83 tail), so this diff compounds pre-existing drift (+35 before old :500, +233 after old :1430, +79 tail). Recomputed drift by difflib line map; every token misses at 31c465f1 — the section needs one wholesale re-anchor pass, not only diff-hot regions.

| note:line | cited anchor | symbol/claim | status | correct anchor at 31c465f1 (scripts/ufo-l0-watch.mjs) | proposed replacement (<=30 words; original label kept) |
|---|---|---|---|---|---|
| ops-watchers.md:181 | `:1–:35` | three per-tick duties (heal/respawn/whip) | changed | :17–26 | Each tick: heal, respawn, whip and retain — four duties, not three (`:17`–`:26`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:181,233 | `:127` | writes only its own state l0-watch-state.json | changed | :166; log 133; heartbeat 140 | writes own state (`:166`), action log (`:133`) and liveness heartbeat `l0-watch.heartbeat` (`:140`); never the queue (daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:181 | `:119` | action log l0-watch.log | moved | :133 | `LOG = join(dirname(STATE), "l0-watch.log")` (`:133`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:183 | `:149` | INTERVAL_MS = 90_000 | moved | :188 | `let INTERVAL_MS = 90_000` (`:188`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:183 | `:1676` | spinWait(INTERVAL_MS) | moved | :2223 | `spinWait(INTERVAL_MS)` (`:2223`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:183,235 | `:1674` | tick_error <childFault> | moved | :2221 | `tick_error` daemon log (`:2221`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:183 | `:159` | --once single-tick comment | moved | :204 | `// Single-tick mode (--once)` (`:204`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:183,235 | `:1544` | FLAG_ARGS = ["--once"] | moved | :2089 | `const FLAG_ARGS = ["--once"]` (`:2089`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:183 | `:1658` | tick() single call | moved | :2203 | `const actions = tick()` (`:2203`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:183 | `:1659` | JSON action report print | moved | :2204 | `--once` JSON report write (`:2204`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:183,164 | `:487–:489 (and :487,:489)` | heal child args + timeout 120_000 | moved | :565–567 | monitor child `--fleet … --settle --json` + `timeout: 120_000` (`:565`–`:567`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:183 | `:1361` | monitor_failed <fault> | moved | :1882 | `monitor_failed` transition (`:1882`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:185 | `:1497` | monitor_report_malformed <shape> | moved | :2042 | `monitor_report_malformed` transition (`:2042`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:185 | `:323` | noteTransition | moved | :372 | `export function noteTransition` (`:372`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:185 | `:453` | log() | moved | :531 | `function log(lines)` (`:531`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:185 | `:451` | MAX_LOG_BYTES = MAX_EVIDENCE_LOG_BYTES | moved | :529 | `const MAX_LOG_BYTES = MAX_EVIDENCE_LOG_BYTES` (`:529`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:187 | `:150` | MAX_ENQUEUES_HOUR = 48 | moved | :199 | `export let MAX_ENQUEUES_HOUR = 48` (`:199`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:187 | `:153` | MAX_LANE_ENQUEUES_HOUR = 4 | moved | :202 | `export let MAX_LANE_ENQUEUES_HOUR = 4` (`:202`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:187 | `:464` | prune(state, now) | moved | :542 | `export function prune(state, now)` (`:542`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:187 | `:469–:472` | fresh predicate | moved | :543–547 | fresh predicate `parsed <= now && parsed > hourAgo` (`:547`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:187 | `:154` | WHIP_COOLDOWN_MS = 15 * 60_000 | moved | :203 | `let WHIP_COOLDOWN_MS = 15 * 60_000` (`:203`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:187 | `:147` | fleet default {"nightcall"} | moved | :186 | `let FLEET_SET = new Set(["nightcall"])` (`:186`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:187 | `:148` | ROUNDS = 8 | moved | :187 | `let ROUNDS = 8` (`:187`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:187 | `:228` | scope allowlist ["nightcall-"] | moved | :277 | `let SCOPE_ALLOW = ["nightcall-"]` (`:277`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:189 | `:283` | successorDue(task) | moved | :332 | `export function successorDue(task)` (`:332`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:189 | `:1186` | successorDue call | moved | :1268 | `if (!successorDue(task)) continue;` (`:1268`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:189 | `:1035` | deferredIteration(task) | moved | :1117 | `export function deferredIteration(task)` (`:1117`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:189 | `:1189` | deferredIteration call | moved | :1271 | `if (deferredIteration(task)) continue;` (`:1271`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:189 | `:1198` | scope allow gate | moved | :1280 | `scopeAllow.some(...)` scope gate (`:1280`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:189 | `:1199` | childOf.has(task.key) | moved | :1281 | `if (childOf.has(task.key)) continue;` (`:1281`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:189 | `:1200` | overlapsOccupied occupancy | moved | :1282 | `if (overlapsOccupied(task.scopes, occupied)) continue;` (`:1282`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:189 | `:313` | invalid_run_id <id> <title> | moved | :362 | `invalid_run_id` action literal (`:362`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:189 | `:1268` | alias gate empty parent.l1Alias | moved | :1350 | `typeof parent.l1Alias !== "string"` gate (`:1350`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:189 | `:1272` | respawn_skipped_no_alias | moved | :1354 | `respawn_skipped_no_alias` (`:1354`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:189 | `:1279` | respawn_skipped_bad_path | moved | :1361 | `respawn_skipped_bad_path` (`:1361`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:189 | `:1290` | lane.at >= 4 | moved | :1383 | `(lane.at ?? []).length >= MAX_LANE_ENQUEUES_HOUR` (`:1383`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:189 | `:1291` | budget_lane | moved | :1384 | `note("budget_lane")` (`:1384`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:189 | `:1294` | state.enqueues >= 48 | moved | :1387 | `(state.enqueues ?? []).length >= MAX_ENQUEUES_HOUR` (`:1387`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:189 | `:1295` | budget_global | moved | :1388 | `note("budget_global")` (`:1388`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:189 | `:1298` | scope race | moved | :1391 | `if (overlapsOccupied(spec.scopes, occupied))` (`:1391`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:189 | `:1299` | respawn_skipped_occupied | moved | :1392 | `note("respawn_skipped_occupied")` (`:1392`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:189 | `:1323–:1325` | respawned/respawn_deduped | moved | :1416–1418 | `respawn_deduped` / `respawned` action literals (`:1416`–`:1418`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:207 | `:858` | enqueue() | moved | :940 | `export function enqueue(spec, deps = {})` (`:940`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:207 | `:871` | exec dispatcher enqueue --spec - | moved | :953 | `exec(process.execPath, [DISPATCHER, "enqueue", "--spec", "-"])` (`:953`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:207 | `:873` | spec JSON stdin | moved | :955 | `input: JSON.stringify(spec, null, 1)` (`:955`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:207 | `:892–:899` | four outcome names | moved | :974–981 | `unparseable`/`enqueued`/`deduped`/`invalid_payload` returns (`:974`–`:981`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:207 | `:1335` | respawn_failed <childFault> | moved | :1428 | `note(respawn_failed ${childFault(error)})` (`:1428`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:207 | `:1332` | respawn_<outcome> | moved | :1425 | `note(respawn_${outcome})` (`:1425`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:207 | `:1478` | seal_pending <title> | moved | :2004 | `seal_pending` action (`:2004`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:207 | `:1466` | seal_check_failed | moved | :1992 | `seal_check_failed` action (`:1992`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:207 | `:1484` | respawn_section_failed | moved | :2010 | `respawn_section_failed` action (`:2010`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:209 | `:1046` | sealReopenStep | moved | :1128 | `export function sealReopenStep(...)` (`:1128`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:209 | `:1055` | findSuccessor(lane.donePath) | moved | :1137 | `findSuccessor(lane.donePath)` (`:1137`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:211 | `:570` | continuationSpec | moved | :648 | `export function continuationSpec(parent)` (`:648`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:211 | `:590` | refuses bad resultPath/outside-root/title | moved | :651–668 | refusal block: non-.md, containment, non-string title (`:651`–`:668`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:211 | `:622` | remaining < 1 fail-closed | moved | :703–704 | `remaining = parentRounds - parentRound; if (remaining < 1) return null` (`:703`–`:704`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:213 | `:951` | whipRow | moved | :1033 | `export function whipRow(row, state, deps = {})` (`:1033`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:213 | `:968` | whip_skipped_scan_error | moved | :1050 | `whip_skipped_scan_error` (`:1050`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:213 | `:977` | whip_skipped_foreign_receipt | moved | :1059 | `whip_skipped_foreign_receipt` (`:1059`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:213 | `:985` | whip_skipped_future_mtime | moved | :1067 | `whip_skipped_future_mtime` (`:1067`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:213 | `:1001` | whip_skipped_<skip> | moved | :1083 | `whip_skipped_${skip}` (`:1083`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:213 | `:266–:270 and :266` | terminal_*/no_continue + whipSkipReason | moved | :311–315 | `whipSkipReason` (`:314`) returns `terminal_*`/`no_continue` (`:316`–`:319`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:213 | `:1010` | whip_cooldown | moved | :1092 | `whip_cooldown` transition (`:1092`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:213 | `:1019` | whip ok/failed + whip_drift fire | moved | :1101 | `whip`/`whip_drift` fire action (`:1101`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:213 | `:230` | WHIP literal | moved | :279 | `const WHIP` (`:279`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:213 | `:238` | WHIP_DRIFT | moved | :287 | `const WHIP_DRIFT` (`:287`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:213 | `:248` | WHIP_DRIFT_UNREADABLE | moved | :297 | `const WHIP_DRIFT_UNREADABLE` (`:297`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:213 | `:255` | driftWhipText(kind) | moved | :304 | `export function driftWhipText(kind)` (`:304`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:213 | `:909` | steer exec | moved | :991 | `exec("bash", [SIGHTING, "steer", "--mission", runId, "--text", text])` (`:991`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:213 | `:1017` | lane.lastWhipAt = nowIso | moved | :1099 | `lane.lastWhipAt = nowIso` (`:1099`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:213 | `:1018` | stalledIdleText(row, "") | moved | :1100 | `stalledIdleText(row, "")` (`:1100`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:227 | `:743` | readQueue | moved | :825 | `function readQueue()` (`:825`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:227 | `:440` | writeFileAtomicIfChanged | moved | :518 | `writeFileAtomicIfChanged(STATE, body, …)` (`:518`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:227 | `:444` | writeWithMkdirRetry | moved | :522 | `writeWithMkdirRetry(STATE, write)` (`:522`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:229 | `:329` | readState | moved | :378 | `function readState()` (`:378`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:229 | `:333` | bounded read + degrade shape | changed | :382; 387,503 | bounded read under `MAX_QUEUE_BYTES` (`:382`); unparsable body → `{ lanes: {}, enqueues: [], missions: {} }`, missions type-checked (`:388`–`:421`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:229 | `:385` | done dropped with donePath/sealNote | moved | :464–465 | `delete lane.done`/`donePath` (`:464`–`:465`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:229 | `:417` | lastWhipAt deleted | moved | :496 | `delete lane.lastWhipAt` (`:496`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:231 | `:1630` | acquireWatchLock(join(ROOT, .ufo)) | moved | :2175 | `lock = acquireWatchLock(join(ROOT, ".ufo"))` (`:2175`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:231 | `:1626–:1629` | lock anchored <root>/.ufo | moved | :2171–2174 | lock-anchor rationale comment (`:2171`–`:2174`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:231 | `:1521` | lockName l0-watch.lock | moved | :2066 | `lockName: "l0-watch.lock"` (`:2066`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:231 | `:1522` | ownerLinkPrefix .l0-watch.owner | moved | :2067 | `ownerLinkPrefix: ".l0-watch.owner"` (`:2067`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:231 | `:1634` | watch_instance_refused | moved | :2179 | `watch_instance_refused` log (`:2179`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:231 | `:1648` | process.exit(0) | moved | :2193 | `process.exit(0)` (`:2193`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:231 | `:1640–:1646` | refused-v1 schema fd 1 | moved | :2185–2191 | `writeSync(1, …ufo-l0-watch-refused-v1…)` (`:2185`–`:2191`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:231 | `:1661` | watch_start | moved | :2206 | `watch_start fleets=…` log (`:2206`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:233 | `:107` | UFO_L0_WATCH_STATE | moved | :121 | `process.env.UFO_L0_WATCH_STATE` (`:121`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:233 | `:126` | resolveWatchStatePath(root, env) | moved | :165 | `export function resolveWatchStatePath(root, envValue)` (`:165`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:233 | `:133–:134` | watch_state_outside_root throw | moved | :171–174 | `MissionResultError("watch_state_outside_root", …)` throw (`:171`–`:174`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:233 | `:111` | main error handling | moved | :120–121 | try/`STATE = resolveWatchStatePath(...)` (`:120`–`:121`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:233 | `:115` | error schema + exit 2 | moved | :125–129 | `ufo-l0-watch-error-v1` schema + `process.exit(2)` (`:125`,`:129`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:233 | `:730` | UFO_PENDING_WORK_PATH | moved | :812 | `process.env.UFO_PENDING_WORK_PATH` (`:812`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:233 | `:658` | queueRowPath = containedJoin | moved | :740 | `const queueRowPath = (rel) => containedJoin(ROOT, rel)` (`:740`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:235 | `:1545–:1547` | VALUE_ARGS flag list | moved | :2090–2093 | `VALUE_ARGS` flag list (`:2090`–`:2093`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:235 | `:1607` | usage faults | moved | :2097–2098 | `parseDeclaredArgv` faults → `usageFaults` (`:2097`–`:2098`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:235 | `:1615` | process.exitCode = 64 | moved | :2160 | `process.exitCode = 64` (`:2160`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:235 | `:1593` | interval-ms reason | moved | :2138 | `--interval-ms must be a finite number >= 1000 …` (`:2138`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:235 | `:1605` | whip-cooldown reason | moved | :2150 | `--whip-cooldown-min must be a finite number >= 0` (`:2150`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:235 | `:1652` | watch_start_error | moved | :2197 | `watch_start_error stage=…` log (`:2197`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:237 | `:680` | holeVerdictMemo | moved | :762 | `const holeVerdictMemo = new Map()` (`:762`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:237 | `:682` | memoizedVerdict | moved | :764 | `function memoizedVerdict(key, compute)` (`:764`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:237 | `:693` | 4096 clear | moved | :775 | `if (holeVerdictMemo.size >= 4096) …clear()` (`:775`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:237 | `:706` | holeVerdictMemoized | moved | :788 | `export function holeVerdictMemoized(task, reportPath, receiptPath)` (`:788`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:239,164 | `:85` | MONITOR child | moved | :99 | `const MONITOR = join(ROOT, "scripts", "ufo-l0-monitor.mjs")` (`:99`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:239 | `:86` | DISPATCHER child | moved | :100 | `const DISPATCHER = join(ROOT, "scripts", "fleet-dispatcher.mjs")` (`:100`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:239 | `:87` | SIGHTING child | moved | :101 | `const SIGHTING = join(ROOT, "scripts", "ufo-sighting")` (`:101`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:164 | `:1399` | repaired rows | moved | :1921 | `reportRows("repaired")` loop (`:1921`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:164 | `:1400` | repended rows | moved | :1922 | `reportRows("repended")` loop (`:1922`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:164 | `:1436` | settled rows | moved | :1962 | `reportRows("settled")` loop (`:1962`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:164 | `:1490` | stalled rows | moved | :2028 | `reportRows("stalled")` loop (`:2028`; daa371583 → re-anchored at 31c465f1). |
| ops-watchers.md:165 | `:1358` | monitor fault degrades tick | moved | :1882 | monitor fault caught, tick degrades (`:1877`–`:1882`; daa371583 → re-anchored at 31c465f1). |

Behavior deltas the diff removed/changed (flag even where a cited line survives):
- Fourth/fifth duty: `missionDuty` (:1477–:1658), 5-min cadence `MISSION_DUTY_INTERVAL_MS` (:193), state in `state.missions`; actions `mission_skipped/nudge/refired/repended/refire_exhausted` (+ `mission_section_failed` :2020). Folded from ufo-stale-watchdog.
- New write surface `l0-watch.heartbeat` (:140; `writeWatchHeartbeat` :143–:159), bumped at tick_start/monitor/respawn/missions/whip/retention (:1859,:1884,:2012,:2023,:2031,:2037) — ‘writes only state+log’ is false.
- New hole gate `respawn_sealed_archived` (:1364–:1374) after `continuationSpec`; the note’s ladder table lacks it.
- Deterministic continuation identity: `resultPath` `${stem}-v${runTag}.md`, title `(retry ${runTag})`, no clock serial (:676–:711).
- Retention hardened: absent sessions dir typed (`sessionsDirAbsent` :1695), sweep/census isolated, census rank preserved, compile-cache prune (`pruneCompileCache` :1705; constants :1677–:1678).
- Queue/write posture: delegated mutation now also `rependTask` (import :94; call :1648) and `ufo-sighting remove` (:1450–:1457); still never writes `pending-work.json`.
- Cross-file deps incomplete: add child `scripts/ufo-stale-watchdog.mjs` (:94) and hub `writeFileAtomic` (:62), `newestMtime`/`loadSwarmPolicy`/`gatedConfigPath` (:88–:90). `readState` now validates `missions`/`lastMissionDutyAt` (:387,:394–:421,:503); daemon no longer echoes tick actions to stdout (:2216–:2219; `--once` report unchanged :2204).
- Census `## scripts/ufo-l0-watch.test.mjs` (:717, was :734 mid-check) ‘r10 extracted the walk verbatim into whipRow’ holds (`whipRow` :1033; gate order scanError→foreign_receipt→future_mtime→drift→skip intact). Singleton note ‘used by … ufo-l0-watch’ holds (`acquireWatchLock` wraps `acquireSingletonLock`, :2063–:2071); its ‘Sources: … header’ pointer is loose (header :1–:38 = duties; lock doc :2053–:2062) — pre-existing, no line anchor.

Commands run: `git -C /fast/scratch/kumitate-r35/src show 964f443e:scripts/ufo-l0-watch.mjs` / `31c465f1:…` → scratch; `git … diff 964f443e 31c465f1 -- scripts/ufo-l0-watch.mjs`; `git cat-file -e daa371583`; `wc -l` (1762/2226); difflib old→new line map; `grep -n` symbol sweep + per-anchor line re-read. No tool installs. No notes edited (read-only seat). Unobserved: `hub:N` anchors in this section (different member, out of scope); `daa371583` unavailable for byte-level confirmation [INFERENCE on the note’s measurement base].

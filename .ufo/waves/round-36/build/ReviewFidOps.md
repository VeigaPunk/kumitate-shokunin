REVIEW fid-ops anchors=130 semantic-fail=16 fidelity=56

# ReviewFidOps — ExecFidOps patch, corpus/knowledge/ops-watchers.md

Reviewed artefact (standalone, against 0614092):
`/fast/scratch/kumitate-r36/w/KumitateR36.ExecFidOps.patch`
sha256 a35896bb4415fa974efb11d748ccd49c41652c9fc2680a41955657466d785ce2,
result-note sha256 d5ec46c3569d7ee2093f8213e21ba83935ce43182e5a8540362e1c9f7fa5c6a0
(matches the executor's report). Applies clean: `git apply --check` OK, `git apply` OK on a
fresh clone at 0614092e; claims gate stays green (`CLAIMS: MATCH (rows=19 yes=19 notes=27
sections=175 adv=6)`); the round-35 notice is byte-identical (first hunk @@ -40,7).

Bottom line: the patch repairs all 130 non-ok anchors **only under the executor's private
ambiguity-only checker** (`after=0`). The two production FIDELITY implementations reject it:

- integrated lane gate as committed at 3d5760a (right-first, no clause guards):
  `FIDELITY note=corpus/knowledge/ops-watchers.md anchors=352 ok=76 elsewhere=42 absent=16
  dead=154 noid=64 nonok=58` -> `FIDELITY: DRIFT (nonok=432)`.
- ExecClaimsFidelity final clause-guarded implementation (ambiguity-aware + `),;.|—–→` /
  `);` clause guards; the rule its own comments call "round-36 FINAL rule"):
  `anchors=356 ok=70 elsewhere=40 absent=16 dead=158 noid=72 nonok=56` -> `DRIFT`.
So `EXEC fid-ops done before=130 after=0` is not reproducible: after=56 (final rule) / 58
(shipped lane gate). This alone blocks the C1 claim that this note reads nonok=0.

## Method
- Source pin read-only: /fast/scratch/kumitate-r36/src @ 31c465f15669f744848bd9f5d56191c5085670f7.
- Patched tree: /fast/scratch/kumitate-r36/w/KumitateR36.ReviewFidOps/patch-lane (my scratch),
  fresh clone @ 0614092 + the patch. Nothing in the lane tree was written.
- Commands: lane `node scripts/claims-check.mjs --fidelity --self <patched> --src <pin>`;
  ExecClaimsFidelity `node .../claims-check.mjs --fidelity --self <patched> --src <pin>`;
  independent replica of both pairing rules (per-anchor JSON), then the cited pinned range
  was opened with `read`/`sed` for every changed anchor.

## High — the 56 non-ok anchors the production gates still count
These are anchors the patch left untouched (it classified them noid/ambiguous) that the
production rules pair with a symbol not on the cited line (representative, exact rows in my
scratch `/fast/scratch/kumitate-r36/w/KumitateR36.ReviewFidOps/patch-amended3.json`):
- ops-watchers.md:192 `INTERVAL_MS = 90_000` (`:149`) — pinned constant is at
  scripts/ufo-l0-watch.mjs:188; :149 is elsewhere.
- :192 `FLAG_ARGS = ["--once"]` (`:1544`) — actual :2089.
- :196 `prune(state, now)` (`:464`) — actual :542.
- :250 `acquireSingletonLock` (`:1716`), `writeWithMkdirRetry` (`:2220`), `readBoundedFile`
  (`:990`), `readBoundedJson` (`:1098`), `validateTaskReceipt` (`:791`), `plainObjectRows`
  (`:226`), `isPlainObject` (`:209`), `redactAbsolutePaths` (`:1069`), `knownRootTags`
  (`:1047`), `spinWait` (`:899`) — all elsewhere under the final rule (clause guards refuse
  the right-side list comas and pair the left hub symbol; the cited hub lines are not in this
  member file at all).
- :356/:357/:358 `health` (`:115`), `chat` (`:122`), `freshness_ping` (`:134`) — elsewhere
  (op literals at ground-handler :103/:110/:122).
- :32 `POLL_MS = 300_000` (`:132`) absent; :43 `MAX_NUDGES = 2` (`:134`) absent;
  :43 `MAX_REFIRE_ATTEMPTS = 3` (`:135`) absent; :242 `watch_instance_refused ...` (`:1634`)
  absent; :423-426/:429 `ufo_*` codes (`:550/:586/:605/:756/:797`) absent — these were
  supposed to be de-anchored but were left because the private scanner never saw them.

## High — machine-ok anchors that are semantically wrong (16)
Each is `ok` under FIDELITY, and the sentence's claim is false of the cited code:
1. :68 `:144` — "Every other path is a module constant (`:79`–`:144`)"; pinned 144 is
   `...(d.env ? { env: { ...process.env, ...d.env } } : {})` in `rependTask`; constants end ~:80.
2. :88 `:44` — "scripts/fleet-dispatcher.mjs (`:44`)"; 44 is `MAX_REPEND_ATTEMPTS = 12`;
   `const DISPATCHER = join(ROOT, "scripts/fleet-dispatcher.mjs")` is :41.
3. :190 `:111` — "action log (`l0-watch.log`, `:111`)"; 111 is a comment
   ("// .ufo/l0-watch.log. Default bytes..."); `const LOG = join(dirname(STATE), "l0-watch.log")`
   is :133.
4. :192 `:1856` — "`--once` ... runs one `tick()` (`:1856`)"; 1856 is `function tick() {`;
   the --once call is `const actions = tick();` at :2203.
5. :217 `:1005` — "`enqueue()` (`:1005`) pipes the spec on stdin"; 1005 is a comment inside
   `steer()`; `export function enqueue` is :940, stdin exec :953.
6. :221 `:578` — "non-string `title` (`:578`)"; 578 is a comment about
   `queue task title is invalid`; the check is :668.
7. :242 `:2179` — "code `instance_refused` to fd 1 (`:2179`)"; 2179 is the daemon log call;
   the --once JSON `code: "instance_refused"` is :2187.
8. :248 `:788` — "the map clears at 4096 entries (`:788`)"; 788 is
   `export function holeVerdictMemoized`; the clear is :775.
9. :250 `:171` — `MissionResultError` (`:171`) in the hub deps list; the class is
   scripts/ufo-mission-result.mjs:106; 171 is the watch's own `throw new MissionResultError(`.
10. :302 `:321` — "`fanOutPathPing` (`:321`) dials all runners"; 321 is a comment
    ("Freshness aggregation differs from fanOutPathPing by design"); the export is :211.
11. :308 `:434` — "never synthesizes `deadline` (`:434`)"; 434 is a comment ("no caller
    deadline"); the exclusion is the aggregation at :269-296.
12. :320 `:102` — byte-limit clause now cites the trailing-bytes line
    `"runner returned trailing response bytes"`; the byte-limit occurrences are :98/:101.
13. :382 `:75` — "parse path ... floor of `bad_request` (`:75`)"; 75 is a design comment;
    the floor is `reject(known ? error.code : PATH_PING_ERROR_CODES.BAD_REQUEST, ...)` at :635.
14. :393 `:319` — "verdict at (`:319`)"; 319 is the response's `ageMs,` field; the verdict is
    selected at :310.
15. :404 `:397` — "`model: config.model.apiModel` (`:397`)"; 397 is `temperature: 0.1,`;
    the model line is :396.
16. :412 `:437` — "assistant content must be a string (`:437`)"; 437 is
    `schema: "the-tick-health-result-v1",`; the check is `typeof content !== "string"` at :415.
Weak (not counted): :359 `path_ping` (`:134`) cites the schema check, keys are :133;
:238 `writeWithMkdirRetry` (`:519`) cites its comment, the call is :522.

## High — 33 of the 51 "pin retired" markers name live behavior
The marker is "pin retired at 31c465f1", but the pinned file (or the successor file the same
sentence names) still carries the behavior; only the exact span spelling differs. Examples
with pinned evidence:
- :80 `boundedRunId = String(runId).slice(0, 128)` -> ufo-stale-watchdog.mjs:54
  (`const boundedRunId = (runId) => String(runId).slice(0, 128);`), same file.
- :192 `tick_error <childFault>` -> ufo-l0-watch.mjs:2221; `monitor_failed <fault>` -> :1882;
  heal child command -> :565.
- :204 call `successorDue(task)` -> :1268; :206 `scopeAllow.some(...)` -> :1280.
- :209/:227 `invalid_run_id` -> :362; :210 `respawn_skipped_no_alias` -> :1354;
  :211 `respawn_skipped_bad_path` -> :1361; :215 `respawned`/`respawn_deduped` -> :1417-1418.
- :217 `respawn_failed` -> :1428; `seal_pending` -> :2004; `enqueue --spec -` -> :953.
- :228/:229/:230/:234 `whip_skipped_*` and `whip_drift:` -> :1050/:1059/:1067/:1101.
- :238 `enqueue --spec -` -> :953; :242 `watch_start` -> :2206.
- :244 `resolveWatchStatePath(root, env)` -> :165 (`root, envValue`);
  `queueRowPath = containedJoin` -> :740 (`const queueRowPath = (rel) => containedJoin(ROOT, rel)`).
- :246 argv value list -> `VALUE_ARGS` at :2090-2093; `watch_start_error` -> :2197.
- :266 `tickUsageError(...)`/`positive_integer_required` -> the decimal-only refusal lives at
  the-tick-ping.mjs:509-514 (`parsePositiveInteger`); :306 `sleep(...)` -> ground-handler :260.
- :362 "every request requires an op" -> :132; :374 `error: {code, message}` -> ground-handler :351.
- :43 `L2_TARGET = 16` -> ufo-l0-watch.mjs:197 (`MISSION_L2_FLOOR = 16`); :389 `staleAfterMs:
  90000` -> config/the-tick.machine.json:54; :419 `maxRequestBytes: 16384` -> config:49;
  :420 `maxInflightPerRunner: 8` -> config:50.

## Medium — residual/dead debt unchanged on changed lines
The patch leaves 154-158 dead and 64-72 noid anchors, including stale references it touched
around (`:824`, `:842`, `:536`, `:509`, `:731`, `:808`, `:1497`, `:453`, `:1626`-`:1629`,
`:1521`, `:1522`, `:1634`, `:1648`). On :192 the heal child's line anchor was replaced by a
marker inside the parenthetical, so the 120 s / 16 MiB claims are now unanchored.

## Residual risk and verification gaps
- **Two gates disagree, and the lane's own note is affected.** The shipped lane gate at
  3d5760a reads the integrated `corpus/knowledge/ops-watchers.md` (lane HEAD 3d5760a,
  sha db60ac1) at nonok=0; the final clause-guarded implementation reads the same committed
  note at nonok=47 (`anchors=417 ok=75 elsewhere=35 absent=12`). C1's "FIDELITY: CLEAN" is
  therefore runtime-dependent; one canonical pairing rule must be chosen and both the gate
  and the note's repairs regenerated under it. This patch inherits that ambiguity: it was
  generated against the executor's private ambiguity-only scanner, which is neither of the
  two shipped rules.
- The patch was superseded by the L1's integrated composition (lane mtime 02:39:23); it is
  reviewed as a standalone artefact against 0614092 only, as the executor's report states.
- No JS was executed and no file outside my scratch and this report was written; no tool
  installs, no package transactions.

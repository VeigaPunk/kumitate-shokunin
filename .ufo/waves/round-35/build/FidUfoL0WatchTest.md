FIDELITY scripts/ufo-l0-watch.test.mjs anchors=10 ok=10 moved=9 changed=0 gone=0

Scope: every anchor in corpus/knowledge/remaining-scripts-census.md (lane repo) that cites
`scripts/ufo-l0-watch.test.mjs` — the member's `## ` section (note:717-720) and table row
(note:140) — re-anchored against upstream 964f443e..31c465f1 (+262/−24, 1370→1608 lines).
Revision labels kept as written in the note (nc5-swarm r10). No note files were edited.

Commands run (all in /fast/scratch/kumitate-r35/src):
- git rev-parse 964f443e 31c465f1                      (964f443ee53df0ce…, 31c465f15669f744…)
- git diff --stat 964f443e 31c465f1 -- scripts/ufo-l0-watch.test.mjs  → 262 insertions, 24 deletions
- git show 964f443e:scripts/ufo-l0-watch.test.mjs (1370 lines) / same at 31c465f1 (1608 lines)
- git show <rev>:scripts/ufo-l0-watch.test.mjs | sed -n '<N>p' per cited line
- git show <rev>:scripts/ufo-l0-watch.test.mjs | grep -nE 'function test\(|results\.push|…' per symbol
- git show <rev>:scripts/ufo-mission-result.mjs | sed -n '28p'  (identical at both revisions)
- full diff hunks read: @@ -21,17 (imports), @@ -48,8, @@ -60,6, @@ -1104,7, @@ -1134,20,
  @@ -1222,7, @@ -1232,7, @@ -1258,12, @@ -1276,7, @@ -1288,7, @@ -1299,6 (+152 lines),
  @@ -1354,15 (+108 lines)

Per-anchor verification (all rows ok; line numbers: base 964f443e → target 31c465f1):

1. note:719 | `:63` | close of the `whipRow` import from `./ufo-l0-watch.mjs` | moved | 63→64
   | `} from "./ufo-l0-watch.mjs";` at both revisions; only `writeWatchHeartbeatAt` added
   inside the group. Correct anchor: scripts/ufo-l0-watch.test.mjs:64. Re-anchored at 31c465f1.
2. note:719 | `:66` | end of the import preamble before `const ROOT` | moved | 66→68
   | blank line closing imports at both revisions. Correct anchor:
   scripts/ufo-l0-watch.test.mjs:68. Re-anchored at 31c465f1.
3. note:719 | `:83` | `stalledRow` fixture-core claim; actually the success `results.push` | moved | 83→85
   | base:83 = `results.push({ name, ok: true });`; target:85 same line. The surrounding
   claim ("records into a `results` array") holds. Correct anchor:
   scripts/ufo-l0-watch.test.mjs:85. Re-anchored at 31c465f1.
4. note:719 | `:91` | failure `results.push` (same collector sentence) | moved | 91→93
   | base:91 / target:93 = `results.push({ name, ok: false, error: error.message });`.
   Correct anchor: scripts/ufo-l0-watch.test.mjs:93. Re-anchored at 31c465f1.
   (Note: `function test(name, fn)` itself is base:81→target:83; `const results = []`
   base:80→target:82; exit-1 tail `if (failed.length > 0) process.exitCode = 1;`
   base:1370→target:1608 — none of these carry their own anchor.)
5. note:719 | `:99` | `deps` fixture core; actually first key of `stalledRow` | moved | 99→101
   | base:99 / target:101 = `runId: RUN_ID,` opening `stalledRow`. Correct anchor:
   scripts/ufo-l0-watch.test.mjs:101. Re-anchored at 31c465f1.
   (StalledRow at base:98 / target:100; steerRecorder base:106 / target:108;
   `const deps = (over = {}) => ({` base:114 / target:116 — claim text intact.)
6. note:719 | `:204` | `order_scanError_outranks_foreign_receipt_and_drift` | moved | 204→206
   | base:204 is a comment line; the test( line is base:219 / target:221. The note's anchor
   pointed into the test body even at base; the test name now sits at 221. Correct anchor:
   scripts/ufo-l0-watch.test.mjs:221. Re-anchored at 31c465f1.
7. note:719 | `:218` | `order_foreign_receipt_outranks_future_mtime_and_drift` | moved | 218→220
   | test( line base:233 / target:235; base:218/target:220 is a blank separator line above
   it. Correct anchor: scripts/ufo-l0-watch.test.mjs:235. Re-anchored at 31c465f1.
8. note:719 | `:231` | `order_future_mtime_outranks_drift` | moved | 231→233
   | test( line base:246 / target:248; base:231/target:233 = the `});` closing the previous
   test. Correct anchor: scripts/ufo-l0-watch.test.mjs:248. Re-anchored at 31c465f1.
9. note:719 | `:404` | `bindSnapshotConfig_matches_dispatcher_binding` | moved | 404→421
   | test( line base:419 / target:421; the +17 shift comes from the `withInstrumentedMonitor`
   rewrite (hunk @@ -1134,20: pin-in-place replaced by private mkdtempSync(tmpdir()) wrapper,
   +15 net lines). The test itself is byte-identical between revisions (no diff hunk touches
   it). Correct anchor: scripts/ufo-l0-watch.test.mjs:421. Re-anchored at 31c465f1.
10. note:719 | `:28` | "Queue helpers and `validateTaskReceipt` are reused from
   `scripts/ufo-mission-result.mjs` (`:28`)" | ok (unmoved) | 28→28
   | base:28 / target:28 = `import {` opening the ufo-mission-result.mjs import group;
   `validateTaskReceipt` sits base:35 / target:34 and the group still ends `} from
   "./ufo-mission-result.mjs";` at base:36 / target:35. The other imports in the group
   (MAX_QUEUE_BYTES, readBoundedJson, statSignature) were dropped upstream in this same
   group (hunk @@ -48/60 region) but the note only claims validateTaskReceipt reuse — that
   claim holds. Correct anchor: scripts/ufo-l0-watch.test.mjs:28 (unchanged).

No-row anchors (for the re-census owner, not fidelity failures):
- note:140 | table row `| scripts/ufo-l0-watch.test.mjs | 1370 | suite |` | stale count |
  member is 1608 lines at 31c465f1. Proposed: `… | 1608 | suite |` (re-census at 31c465f1).
- note:717 | member heading `## scripts/ufo-l0-watch.test.mjs` | ok (unmoved), heading exact.

Behavior-level check (diff hunks vs every described behavior — all still present at 31c465f1):
- Hand-rolled test(name, fn) collector recording into `results`, exit 1 on failure: intact
  (target:82-93, 1608). No hunk touches it.
- Fixture core stalledRow/steerRecorder/deps with injected steer/clock/cooldown: intact
  (target:100/108/116); `whipCooldownMs: COOLDOWN_MS` still in deps (target:119).
- Cross-gate ORDER pins (earliest gate wins): all three tests byte-identical, shifted +2.
- Drift-bypasses-decision rule: intact (target:265-271, e.g. "skip must not touch lastWhipAt").
- Cooldown window: intact (target:340-387: cooldown_suppresses_whip_and_logs_once_per_window
  at 340, cooldown_window_boundary_fires_again at 351, failed_steer_still_earns_cooldown… at
  376); lane-state transitions lastWhipAt/lastWhipSkip still asserted there.
- `cooldownLoggedFor`: mentioned only in the file-header comment (target:13) and pinned by
  deepEqual(state.lanes, {}) at target:232/400 — unchanged from base; note claim is about
  lane-state transition pinning, which holds.
- Snapshot-binding parity test: byte-identical at target:421.
- mission-result reuse: validateTaskReceipt still imported (target:34).
Nothing the note describes was removed or altered; `changed=0`, `gone=0`.

Census-gap observations for the C2 re-census (new at 31c465f1, not yet in the note):
- New mission-stall-ladder tests: mission_ladder_nudges_twice_then_refires_and_repends,
  mission_ladder_skips_receipted_rows_and_foreign_fleets, mission_duty_survives_a_malformed_
  status_body (target:1397-1497), exercising the newly imported `missionDuty` (target:50).
- New continuation_identity_is_deterministic_and_archived_paths_seal (target:1301).
- Retention hardening: retention_duty_treats_absent_sessions_dir_as_a_noop,
  retention_cap_batch_keeps_census_size_rank_not_alphabetical, sweep-fault-no-longer-aborts-
  caps (target:1508-1580).
- New pruneCompileCache age/size pin (target:1543) and writeWatchHeartbeat unconditional-
  rewrite pin (target:1567), for the new `pruneCompileCache`/`writeWatchHeartbeatAt` exports.
- `withInstrumentedMonitor` no longer rewrites the tracked monitor in place (race fix); it
  builds a private temp-dir wrapper and passes it through runMonitorThenReadQueue's new
  `monitor` parameter (target:1139-1152, 1223-1243). Any note text describing the old
  pin-real-mjs dance should be reworded at re-census time; no current anchor cites it.

Verdict: all 10 anchors verified at 31c465f1; 9 need a +2/+17 line shift (proposals above),
1 is already correct. No behavioral claim lost. [INFERENCE-free: every row above was read
from both revisions directly; nothing unobserved.]

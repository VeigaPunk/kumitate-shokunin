FIDELITY scripts/fleet-dispatcher.test.mjs anchors=19 ok=1 moved=12 changed=4 gone=2

Anchor set = 18 `:N` citations inside `corpus/knowledge/remaining-scripts-census.md:479` + the member heading at `:477`. No `:N` anchor for this member exists in `corpus/knowledge/queue-and-claim.md` (its `:11` mention is path-only and still true: the suite is S8 remainder, not S1).

Pin: base `964f443e:scripts/fleet-dispatcher.test.mjs` = 3268 L, pinned `31c465f1` = 2852 L (diff +21/-437, net -416). Clone `/fast/scratch/kumitate-r35/src` is SHALLOW (41 commits), so historical absence below `964f443e` is unobserved.

Rows: `note:line | cited anchor | symbol/claim | status | correct anchor at 31c465f1 | proposed replacement wording`

remaining-scripts-census.md:479 | :3 | header numbers surfaces incl. "degraded siblings"; also claims "throwing siblings"/"usage split" are enumerated | changed | scripts/fleet-dispatcher.test.mjs:3-8 | the header (`scripts/fleet-dispatcher.test.mjs:3`) numbers five surfaces: hot-ledger status, `once` dedupe, rotation, streaming reader as only read path, queue-lock contention — re-anchored at 31c465f1 (was 964f443e).
remaining-scripts-census.md:479 | :3983 | "tail adds the r38 ledger-busy classification block" | gone | none — no `LEDGER_BUSY`/ledger-busy text in this member at 31c465f1; file ends :2852; `:3983` is out of range at 964f443e too (3268 L) | delete this clause (no ledger-busy block exists at 31c465f1; was 964f443e).
remaining-scripts-census.md:479 | :55 | `check(name, ok, detail = null)` ledger | moved | scripts/fleet-dispatcher.test.mjs:51 | `check(name, ok, detail = null)` ledger (`:51`) — re-anchored at 31c465f1 (was 964f443e).
remaining-scripts-census.md:479 | :4094 | process exits non-zero with the failing names | moved | scripts/fleet-dispatcher.test.mjs:2852 | the process exits non-zero with the failing names (`:2852`) — re-anchored at 31c465f1 (was 964f443e).
remaining-scripts-census.md:479 | :42 | `--keep` retains fixtures | moved | scripts/fleet-dispatcher.test.mjs:38 (used :2850) | `--keep` sets `KEEP` (`:38`), which retains fixtures at `:2850` — re-anchored at 31c465f1 (was 964f443e).
remaining-scripts-census.md:479 | :63 | `lifecycleEvent` builds `ufo-process-lifecycle-v1` rows | moved | scripts/fleet-dispatcher.test.mjs:59 | `lifecycleEvent` (`:59`) still builds `ufo-process-lifecycle-v1` rows — re-anchored at 31c465f1 (was 964f443e).
remaining-scripts-census.md:479 | :89 | `fillerLine` pads segments to the read budget | moved | scripts/fleet-dispatcher.test.mjs:85 | `fillerLine` (`:85`) pads segments toward the read budget — re-anchored at 31c465f1 (was 964f443e).
remaining-scripts-census.md:479 | :253 | `runDispatcher` spawns dispatcher with UFO_* overrides | moved | scripts/fleet-dispatcher.test.mjs:226 | `runDispatcher` (`:226`) spawns the dispatcher with UFO_* overrides into the fixture tree — re-anchored at 31c465f1 (was 964f443e).
remaining-scripts-census.md:479 | :44 | `UFO_TEST_SCRATCH`, default `/scratch/tmp/vgpnk` | moved | scripts/fleet-dispatcher.test.mjs:40 | `UFO_TEST_SCRATCH` default `/scratch/tmp/vgpnk` (`:40`) — re-anchored at 31c465f1 (was 964f443e).
remaining-scripts-census.md:479 | :37 | `MAX_LEDGER_SEGMENTS = 5` | moved | scripts/fleet-dispatcher.test.mjs:33 | `MAX_LEDGER_SEGMENTS = 5` (`:33`) — re-anchored at 31c465f1 (was 964f443e).
remaining-scripts-census.md:479 | :38 | `MAX_LEDGER_READ_BYTES` | moved | scripts/fleet-dispatcher.test.mjs:34 | `MAX_LEDGER_READ_BYTES` (`:34`) — re-anchored at 31c465f1 (was 964f443e).
remaining-scripts-census.md:479 | :295 | section 1 opens | moved | scripts/fleet-dispatcher.test.mjs:273 | section 1 (`:273`) still opens by proving `fixture_exceeds_read_budget` — re-anchored at 31c465f1 (was 964f443e).
remaining-scripts-census.md:479 | :307 | `fixture_exceeds_read_budget` | moved | scripts/fleet-dispatcher.test.mjs:285 | `fixture_exceeds_read_budget` (`:285`) — re-anchored at 31c465f1 (was 964f443e).
remaining-scripts-census.md:479 | :315 | `coverageComplete === true` | moved | scripts/fleet-dispatcher.test.mjs:293 | `status_coverage_complete` requires `ledger?.coverageComplete === true` (`:293`) — re-anchored at 31c465f1 (was 964f443e).
remaining-scripts-census.md:479 | :450 | `throwsib_reader_inline`; "degraded block requires `ledger_coverage_degraded` and forbids `ledger_event_drift`" | gone | none — sections 4 (degraded) and 6 (throwing siblings) deleted by 964f443e..31c465f1; nearest surviving degraded-event asserts are :291, :334, :362 | delete the degraded/throwing-sibling refusal arms; they no longer exist at 31c465f1 (was 964f443e).
remaining-scripts-census.md:479 | :598 | "exit 0 help" | changed | scripts/fleet-dispatcher.test.mjs:409-415 (no exit-0 help arm exists) | the `--help` arm is exit 1 `unknown command: --help` (`:409-415`), not exit-0 help — re-anchored at 31c465f1 (was 964f443e).
remaining-scripts-census.md:479 | :607 | exact `unknown command: --frobnicate` | changed | scripts/fleet-dispatcher.test.mjs:414 (literal is `unknown command: --help`) | the exact usage literal is `unknown command: --help` (`:414`) — re-anchored at 31c465f1 (was 964f443e).
remaining-scripts-census.md:479 | :589 | unknown-command/unsupported-argument exit-1 arms | changed | scripts/fleet-dispatcher.test.mjs:410-420; enqueue arm :437 | exit-1 usage arms are `usage_unknown_error` (`:414`) and `usage_badarg_error` (`:420`); enqueue arm `:437` — re-anchored at 31c465f1 (was 964f443e).

OK anchor (not listed as a row): remaining-scripts-census.md:477 `## \`scripts/fleet-dispatcher.test.mjs\`` — heading still matches a live member at 31c465f1; no change needed.

Non-anchor member claims affected by the diff (not counted in the totals):
- remaining-scripts-census.md:108 | table cell `3278` | line count | changed | `wc -l` = 2852 at 31c465f1 (3268 at 964f443e; 3278 was already +10 against the note's own claimed pin) | row should read `| \`scripts/fleet-dispatcher.test.mjs\` | 2852 | suite |`.
- remaining-scripts-census.md:169 | "`scripts/fleet-dispatcher.test.mjs` (3278 L)" | largest-member stat | changed | 2852 L at 31c465f1 (still largest: sync-ufo-contracts 2137, ufo-state-retention 1924 at this pin) | update the figure to 2852 L.
- queue-and-claim.md:11 | path-only mention, "S8 remainder, not S1" | holds | ok | no anchor | unchanged.

Observed anchor-offset defect (independent of the 964f443e..31c465f1 diff): the note's citations were already inconsistent with `964f443e`. Early constants are +3 (note `:37` vs actual `:34`; `:55` vs `:52`), mid-file counts are +21..+26 (note `:295` vs actual `:274`; `:307` vs `:286`; `:315` vs `:294`; `:253` vs `:227`), and `:3983`/`:4094` exceed the 3268-line file entirely. So a blanket -416 shift is wrong; each anchor must be re-derived, as above. [INFERENCE] the census section was drafted against a ~3278-line working tree, not the committed 964f443e blob.

Behavior changed/removed by the diff beyond the anchors:
- Header item 4 replaced: "degraded mode (siblings disabled) → ledger_coverage_degraded + ledger_drift_inconclusive" became "the streaming ledger reader is the only read path (static import)" (31c :4-7).
- `status_modules_reported` (964f443e :298-300) deleted; `status_reader_sibling` added asserting `ledger.reader === "sibling"` (31c :301-302) — the note's "inline fallback" reader claim is inverted at the pin.
- Section 12 "watchdog corrupt-state salvage (R5)" (`@@ -1500,169 +1349,0 @@`) and section 19 "watchdog log bound + rotation" (`@@ -2570,106 +2259,0 @@`) deleted wholesale.
- `dup_runid_crash`/`cycle_crash` (exit 1 + event) replaced by `dup_runid_reported`/`cycle_reported` (exit 0, `queue.reason === "queue_invalid"`); attribution now reads `queue.faults[0].index/taskKey` (31c :1000-1016).
- Added case-local `UFO_OMP_GLOBAL_CONFIG_PATH` isolation in the repend child env (31c :1407-1410) and queue-fault acceptance of the invalid-dependency case (31c :1917-1926).

Commands run (all read-only; no installs):
- `git -C /fast/scratch/kumitate-r35/src diff 964f443e 31c465f1 -- scripts/fleet-dispatcher.test.mjs`
- `git -C /fast/scratch/kumitate-r35/src show 964f443e:scripts/fleet-dispatcher.test.mjs > /tmp/fdt-964.mjs` and same for `31c465f1 > /tmp/fdt-31c.mjs`; `wc -l` (3268 / 2852)
- `sed -n` at each cited line in both dumps; `grep -n` for `runDispatcher|check(|lifecycleEvent|fillerLine|MAX_LEDGER_|UFO_TEST_SCRATCH|KEEP|usage_|throwsib|fixture_exceeds_read_budget|coverageComplete` in both
- `git -C ... diff --unified=0 ... | grep -E '^@@|── [0-9]'` (hunk map)
- `git -C ... grep -n "LEDGER_BUSY|frobnicate|ledgerbusy|r38" 31c465f1 -- scripts/` (and whole tree): `LEDGER_BUSY` only in `scripts/fleet-dispatcher.mjs:618` and `scripts/fleet-ledger-rotate.mjs:1169`; `frobnicate` only in `tests/ufo-sighting.test.js:3956,4012`; no `--frobnicate` anywhere
- `git -C ... log -S"frobnicate" -S"LEDGER_BUSY" -- scripts/fleet-dispatcher.test.mjs` (empty; shallow clone, 41 commits)
- `git -C ... show 31c465f1:<f> | wc -l` for the three largest-member claims

Remaining unknowns: whether the `:3983`/`:4094`/`--frobnicate` clauses belonged to an uncommitted or post-31c working tree — unobservable in this shallow clone; they exist in no revision of this member at either pin.

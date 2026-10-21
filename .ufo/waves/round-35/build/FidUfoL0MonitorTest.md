FIDELITY scripts/ufo-l0-monitor.test.mjs anchors=11 ok=2 moved=9 changed=0 gone=0

Scope: C2 anchor-fidelity re-verification for member `scripts/ufo-l0-monitor.test.mjs` in
corpus/knowledge/remaining-scripts-census.md, against upstream 964f443e -> 31c465f1 (diff: +49/-0,
three added tests at old 191-240: `sweep_preserves_out_of_scope_debt_without_aging_it`,
`cli_repend_skips_a_non_blocked_row_and_drops_its_debt`,
`cli_scoped_pass_leaves_foreign_fleet_debt_untouched`). Pure insertion; no described behavior was
removed or altered (changed=0, gone=0). All drift is anchor movement.

Method (all commands run; source read only via /fast/scratch/kumitate-r35/src):
- `git -C /fast/scratch/kumitate-r35/src diff 964f443e 31c465f1 -- scripts/ufo-l0-monitor.test.mjs`
- `git show 964f443e:<f>` / `git show 31c465f1:<f>` with `sed -n`, `grep -n`, `wc -l`, `grep -c ''`,
  tail-byte check (`tail -c 1 | xxd` -> `;`, no trailing newline at both revisions).
- `diff <(show 964f443e | sed -n 1,190p) <(show 31c465f1 | sed -n 1,190p)` -> IDENTICAL_1_190
  (every head-region anchor identical at both revisions; +49 shift applies only from old 191 on).
- History: `git log --all -- <f>` in the shallow clone shows only 72ab84a (1416 lines) and
  057088f (1464 lines). The census numbers (1415-row inventory, 1346/1345 prose) match no
  reachable revision; the section was evidently authored against an older, ~1346-line state
  [INFERENCE — exact authored revision not observable in this shallow clone].
- Notes read-only; no edits made. No tools installed (none needed).

Anchor census: 11 `:N` anchors inside the member's own section (note:715), plus the member heading
(note:713, ok) and two stale numeric claims elsewhere (note:139, note:352-355) flagged below.

Non-ok anchors (note:line | cited anchor | symbol/claim | status | correct anchor at 31c465f1 | proposed wording):

note:715 | scripts/ufo-l0-monitor.test.mjs:18 | imports the pure policy surface: mergeRependPending, sweepRependPending, forgeSuccessor, findStalled, settle, rependReportOk, diagnose (+ validateTaskReceipt) | moved | scripts/ufo-l0-monitor.test.mjs:35 (destructure of the dynamic import; :18 covers only validateTaskReceipt) | Imports the pure policy surface via the dynamic-import destructure (:35), plus validateTaskReceipt (:18) for receipt-shape pins — re-anchored at 31c465f1.

note:715 | scripts/ufo-l0-monitor.test.mjs:22 | hand-rolled `test(name, fn)` collector | moved | scripts/ufo-l0-monitor.test.mjs:41 (`function test(name, fn, { skip = null } = {})`; :22 is the suite-isolation comment) | Driver is a hand-rolled test(name, fn) collector with counted skips, re-anchored at 31c465f1 (:41).

note:715 | scripts/ufo-l0-monitor.test.mjs:33 | `row = (state) => ({ state })` shim for queue rows | moved | scripts/ufo-l0-monitor.test.mjs:59 (:33 is the UFO_FLEET_LEDGER_PATH env pin) | A row = (state) => ({ state }) shim for queue rows, re-anchored at 31c465f1 (:59).

note:715 | scripts/ufo-l0-monitor.test.mjs:230 | a damaged or partially malformed journal is preserved, named and never silently overwritten | moved | scripts/ufo-l0-monitor.test.mjs:305 (test `cli_damaged_journal_preserved_named_and_never_silently_overwritten`; cited fixture line shifts 230->279) | A damaged or partially malformed journal is preserved, named and never silently overwritten, re-anchored at 31c465f1 (:305; fixture line :279).

note:715 | scripts/ufo-l0-monitor.test.mjs:608 | later blocks pin rebind tallies | moved | scripts/ufo-l0-monitor.test.mjs:724 (test `cli_rebind_tallies_skip_classes_prior_unavailable_and_persists_rebounds`; :608 lands in the text-heal-log forge test) | Later blocks pin rebind tallies — classes skipped, prior-unavailable, rebounds persisted — re-anchored at 31c465f1 (:724).

note:715 | scripts/ufo-l0-monitor.test.mjs:1159 | `scratchMonitorJson` spawning the real CLI against a scratch queue/journal | moved | scripts/ufo-l0-monitor.test.mjs:1275 (function; stale even at 964f443e, where it sits at 1226) | scratchMonitorJson spawns the real CLI against a scratch queue and journal, re-anchored at 31c465f1 (:1275).

note:715 | scripts/ufo-l0-monitor.test.mjs:1171 | live successor parent-receipt rebind | moved | scripts/ufo-l0-monitor.test.mjs:1287 (test `live_successor_parent_receipt_rebind`; stale even at 964f443e, where it sits at 1238) | Live successor parent-receipt rebind pin, re-anchored at 31c465f1 (:1287).

note:715 | scripts/ufo-l0-monitor.test.mjs:1286 | malformed-receipt isolation: null/numeric top-level receipt row skipped without aborting or masking the later stalled row | moved | scripts/ufo-l0-monitor.test.mjs:1424 (test `malformed_top_level_receipt_row_isolation`; stale even at 964f443e, where it sits at 1353; assertions verified intact at 1437-1450) | Malformed null/numeric top-level receipt rows are skipped without aborting or masking the later stalled row, re-anchored at 31c465f1 (:1424).

note:715 | scripts/ufo-l0-monitor.test.mjs:1346 | failure-count exit (`if (failed.length) process.exit(1)`) | moved | scripts/ufo-l0-monitor.test.mjs:1465 (file measures 1464 by `wc -l`, 1465 by `grep -c ''`; still unterminated, final byte `;`) | Collector ends in a failure-count exit, re-anchored at 31c465f1 (:1465); file measures 1464 by wc -l, 1465 by grep -c.

Ok anchors (verified at both revisions, content identical):
- note:715 `:3` — header sentence "journal is the recovery seam for a healed-but-never-repended
  row ... cross-file atomicity ... unachievable" verified verbatim at 31c465f1:3-6. ok
- note:715 `:129` — durable-wiring comment block introducing the aging/gave-up persistence arms;
  lines 125-137 byte-identical at both revisions; the pin itself is `cli_sweep_persists_aging_
  and_gave_up_across_invocations` at :155. ok

Additional stale claims about this member (not `:N` anchors; affect census counts):
- note:139 | inventory row `| scripts/ufo-l0-monitor.test.mjs | 1415 | suite |` | changed count |
  31c465f1: 1464 (column convention is `wc -l`). Proposed: `| scripts/ufo-l0-monitor.test.mjs |
  1464 | suite |` (re-census at 31c465f1).
- note:352-355 | wc-l exception prose: "measures 1345 under wc -l and 1346 under grep -c" with
  group-2 subtotal 9146/9147 and whole-set 54874/54875 | changed numbers | The exception itself
  still holds at 31c465f1 (1464/1465, unterminated final line ending `;`, verified by tail byte);
  the member's pair must read 1464/1465 and the subtotals/whole-set need re-derivation by the
  census owner (out of this leaf's scope; other members' counts not measured here).

Behavior-level check of every arm the note describes — all survive at 31c465f1:
- aging/gave-up persistence across invocations: test at :155 (both). Verified via identical 125-190.
- damaged/malformed journal preserved: tests at :305/:325 (new) vs :256/:276 (base).
- rebind tallies: :724 (new) vs :675 (base).
- live successor parent-receipt rebind: :1287 (new) vs :1238 (base).
- malformed top-level receipt isolation with later stalled row unmasked: :1424 (new) vs :1353
  (base); new-body assertions read at 1437-1450 (`stalled.length === 1`,
  `!stalled.some(...nullRow/numberRow...)`, CLI variant via scratchMonitorJson).
- The diff's three new tests add coverage (out-of-scope debt not aged; non-blocked row skipped
  with debt dropped; scoped pass leaves foreign-fleet debt untouched) — no census claim contradicts
  them; a future census pass may optionally name the out-of-scope-debt arm.

Residual risk / gaps:
- Stale-by-authoring: seven of nine moved anchors were already mispointed at 964f443e; only :230,
  :608 (fixture-level) and :1346 are pure 964f443e->31c465f1 shifts (+49 in the tail region). The
  re-anchor targets above are for 31c465f1 as assigned.
- The ~1346-line authored revision is unreachable in the shallow clone; the provenance label the
  prose should carry is [INFERENCE] as marked above.
- Group-2 subtotal (9146/9147) and whole-set (54874/54875) re-derivation needs every sibling
  member's recount — left to the census owner integrating all fidelity leaves.

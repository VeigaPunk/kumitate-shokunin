ATTACK corpus/knowledge/remaining-scripts-census.md §`scripts/ufo-l0-monitor.test.mjs` verdict=holds defects=0

Target: the re-anchored S8 member section `## `scripts/ufo-l0-monitor.test.mjs`` (note
heading at line 695, body at line 697) plus its population-table row (line 160), against
pin `31c465f1` via the read-only clone `/fast/scratch/kumitate-r35/src`. Judged axis:
coverage:script-layer. Wave-1 input: `.ufo/waves/round-35/build/FidUfoL0MonitorTest.md`
(anchors=11 ok=2 moved=9 changed=0 gone=0 — every claim survived; only anchors moved).

## Anchor-by-anchor verification at 31c465f1

All 12 `:N` anchors in the body resolve to the named symbol/behavior (every line read
with `git -C /fast/scratch/kumitate-r35/src show 31c465f1:scripts/ufo-l0-monitor.test.mjs
| sed -n 'Np'`):

| anchor | cited claim | line content at pin | verdict |
|---|---|---|---|
| `:3` | header states journal is the recovery seam | `// durable CLI wiring pins (r03). The journal is the recovery seam for a` (sentence spans :3-6, verbatim incl. the removed "cross-file atomicity" clause's source text still present upstream) | ok |
| `:18` | `validateTaskReceipt` import | `import { validateTaskReceipt } from "./ufo-mission-result.mjs";` | ok |
| `:35` | dynamic-import destructure of the pure policy surface | `const { diagnose, findStalled, forgeSuccessor, mergeRependPending, rependReportOk, settle, sweepRependPending } =` (await-import at :36) | ok |
| `:41` | hand-rolled `test(name, fn)` driver with counted skips | `function test(name, fn, { skip = null } = {}) {` (skip counted/named at :39-44) | ok |
| `:59` | `row = (state) => ({ state })` | `const row = (state) => ({ state });` | ok |
| `:155` | aging/gave-up persistence across invocations | `test("cli_sweep_persists_aging_and_gave_up_across_invocations", () => {` (ages 1→2→3, gave-up named once, :157-170) | ok |
| `:305` | damaged journal preserved without silent overwrite | `test("cli_damaged_journal_preserved_named_and_never_silently_overwritten", () => {` (asserts `.corrupt` preserved bytes + named fault, :311-319) | ok |
| `:724` | rebind tallies | `test("cli_rebind_tallies_skip_classes_prior_unavailable_and_persists_rebounds", () => {` (rebound/priorUnavailable tallies asserted :740-784) | ok |
| `:1275` | `scratchMonitorJson` spawning the CLI | `function scratchMonitorJson(dir, extraArgv = []) {` (spawnSync of `scripts/ufo-l0-monitor.mjs --fleet nc5 --json` at :1277-1286) | ok |
| `:1287` | live successor parent-receipt rebind | `test("live_successor_parent_receipt_rebind", () => {` | ok |
| `:1424` | malformed null/numeric receipt rows skipped without masking later stalled row | anchor line is `    };` (the `makeRunningRow` closer inside `malformed_top_level_receipt_row_isolation`, whose `test(` opens at :1402); assertions `stalled.length === 1`, `!stalled.some(...nullRow/numberRow...)`, CLI variant, all at :1437-1458 | ok (weak anchor — see residual risk) |
| `:1465` | failure-count exit | `if (failed.length) process.exit(1);` | ok |

## Population-table row

`corpus/knowledge/remaining-scripts-census.md:160` = `| scripts/ufo-l0-monitor.test.mjs | 1464 | suite |`.
Measured at the pin: `git show 31c465f1:scripts/ufo-l0-monitor.test.mjs | wc -l` → **1464**;
`grep -c ''` → 1465; final byte `;` (unterminated). Row equals the column command (`wc -l`).
Verified also on a `git archive 31c465f1` copy in scratch: 1464/1465. Class `suite` correct
(43 `test(` calls, hand-rolled runner). Companion row check: `scripts/ufo-l0-watch.test.mjs`
1608 also exact — the table convention is being applied consistently.

## Runtime cross-check (freshly executed, not source-read)

Extracted a writable pin copy to /fast/scratch/kumitate-r35/w/SecUfoL0MonitorTest
(`git archive 31c465f1 | tar -x`) and ran the suite: `node scripts/ufo-l0-monitor.test.mjs`
→ **`41/41 passed`, exit 0** (0 skips, 0 FAIL; one-time `.ufo` scratch dir had to be
created first — ENOENT on first run, then green; artifacts removed after). This confirms
the described driver behavior live at the pin: per-case `ok` lines, counted pass summary,
failure-count exit. No tool installs were needed; none made.

## Revision label + removed-clause trace

- Label kept: the body retains "re-anchored at 31c465f1 (round 35)" (line 697 tail) and the
  round-35 pattern matches sibling re-anchored sections (e.g. `check-hand-authored-sets.mjs:501`,
  `ufo-l0-watch.test.mjs:700`).
- Removed clauses traced: the old paragraph's "because cross-file atomicity between queue
  publish, parent-receipt rewrite and dispatcher repend is unachievable" (the `:3` sentence's
  tail), the full seven-symbol import list, "counted skips", "a scratch queue/journal", and the
  old line-count sentence "Line count is 1346 by awk END; wc -l reports 1345" are all gone from
  the new paragraph; the surviving shortened clauses ("supports counted skips", "spawns the CLI
  against scratch surfaces") remain true at the pin. The `:3` header's own upstream sentence
  still contains the atomicity rationale, so dropping it from the note loses no upstream truth
  that the note asserts falsely — nothing new became false.
- Numbers updated coherently *inside the member's own scope*: table row 1415 → 1464 (matches),
  exit anchor `:1346` → `:1465` (matches), and the new prose sentence states the wc-l/numbered
  pair 1464/1465 exactly as measured.

## Provenance finding (reportable, not a defect in this section)

The *old* paragraph's anchors (`:230` damaged-journal, `:608` rebind tallies, `:1346` exit,
`:1159`/`:1171`/`:1286`, `:22`/`:33`) match **no reachable revision**: at both `72ab84a`
(1416 numbered) and `964f443e` (identical content, 1415 wc-l) the damaged-journal test sits
at `:256`, rebind tallies at `:675`, exit near `:1416`, `scratchMonitorJson` at `:1226` —
so the pre-round prose was authored against an older, ~1346-line state
[INFERENCE — that revision is not observable in the shallow clone (`git log --all` shows
only `72ab84a` and `057088f` touching this file), exactly as the wave-1 report recorded].
This is history-only: the new paragraph's anchors all resolve at the pin, so the re-anchoring
did its job.

## Adjacent stale numbers (same member, outside the section; pre-existing, not round-35's edit)

- Line 389-392 (Limits bullet): "`scripts/ufo-l0-monitor.test.mjs` measures 1345 under
  `wc -l` and 1346 under `grep -c ''` … group-2 subtotal 9146/9147 (54874 vs 54875)".
  At the pin the member pair is **1464/1465**, so the bullet's member numbers and both
  subtotals are stale. Command: `git show 31c465f1:scripts/ufo-l0-monitor.test.mjs | wc -l`
  → 1464; `grep -c ''` → 1465. Minimal fix: update the bullet to 1464/1465 and re-derive the
  group-2/whole-set subtotals from the re-censused table (owner-level arithmetic; the bullet's
  own structure — column `wc -l`, exception named — remains correct). This text was untouched
  by the round-35 diff (identical in master-tree snapshot line 352-354), so it is carried
  debt of the older prose, not a new false claim introduced by this member's re-anchor.
- Gate confirmation: `scripts/cite-check.mjs` (master copy, run in scratch with
  `--src` = the extracted pin tree, `--self` = the lane) reports the note's paragraph lines
  695-697 as **15/15 OK** findings, zero errors; the note's 68 errors are all elsewhere
  (26 REV_UNKNOWN pin provenance, 30 UNRESOLVED, 11 LINE_OOR, 1 PIN_MISMATCH — none on this
  member's section, table row, or body anchors). The REV_UNKNOWN rows are the gate's
  clone-context limitation (the pins DO resolve via `git rev-parse` in the read-only clone:
  964f443ee53df0ce…, 31c465f15669f7448…), already a known gate/env class, not a member defect.

## Verdict rationale

Every anchor in the re-anchored section points at the cited symbol/behavior at 31c465f1;
the population row equals the measured line count; the revision label is kept; every removed
clause either survives in shortened true form or was dropped without creating a new falsehood;
and the suite runs green at the pin (41/41). The two stale numbers nearby (:389-392) are
pre-existing prose the round did not touch. Nothing in scope refutes C2 for this member.

Residual risk: the `:1424` anchor lands on a structural closer (`};`) inside the
`malformed_top_level_receipt_row_isolation` test (test header at :1402) rather than on the
test's opening or an assertion line — it resolves only because the surrounding block is the
cited behavior; a future edit above it shifts it harmlessly, but pointing it at `:1402` or
the first assertion (:1437) would be sturdier. Group-2/whole-set subtotal re-derivation
(9146/9147, 54874/54875) remains open debt for the census owner.

AUDIT Remainder2 anchors=20 false=4 overreverted=1 notice=ok verdict=partial

# AuditRemainder2 — round-37 restoration of remaining-scripts-census.md, group 2/8

## State audited (read first)
- Audited file: corpus/knowledge/remaining-scripts-census.md, working tree, sha256 e198a02afa7755d78990b80540a567f51849471094eedc407f34158064cd0c16, mtime 03:30:15 (uncommitted; lane HEAD fb5b90e; last census commit 5ceb8cd).
- The file was amended while I audited it. My first read (5ceb8cd copy, 03:21 state) differed from 0614092 in 138 anchor values. The file now equals 0614092 plus the notice line: `git diff --stat 0614092 -- corpus/knowledge/remaining-scripts-census.md` -> ` 1 insertion(+)`.
- With zero changed anchors against 0614092, the group is taken over the restoration's changed set: anchors whose round-36 value (census at 5833351 = parent of 5ceb8cd) differs from 0614092. That is 163 anchors, all now equal to 0614092. Document order, 8 groups (21/20/21/20/20/21/20/20); group 2 = rows 22-41.
- Pin: /fast/scratch/kumitate-r36/src @ 31c465f15669f744848bd9f5d56191c5085670f7, clean, read-only; used only for reads.
- Test: the sentence's own symbol appears on the restored line (or in its range) at the pin. Path = explicit path, else the section heading's file. Symbol-less anchors are judged by their claim (marked "content").

## Group 2 (restored = 0614092 value)
Legend: RL = scripts/fleet-ledger-read.mjs; RLt = scripts/fleet-ledger-read.test.mjs; RO = scripts/fleet-ledger-rotate.mjs; ROt = scripts/fleet-ledger-rotate.test.mjs. T/F = symbol on line at pin.

| # | base line | symbol (claim) | restored @pin | r36 @pin | class |
|---|---|---|---|---|---|
| 22 | 522 | defaultLedgerPath | RL:282 F (`if (typeof postStat.size ...`); def RL:227 | RL:4 F | restored-but-false |
| 23 | 522 | loadLifecycleLedger | RL:492 F (`if (value.kind === "process_settled")`); def RL:381 | RL:253 F | restored-but-false |
| 24 | 522 | extendLedgerMemoWithSuffix | RL:348 F (`));`); def RL:278 | RL:253 T (comment `// M41). extendLedgerMemoWithSuffix advances...`) | restored-but-false + OVERREVERTED |
| 25 | 522 | dedupeKey | RL:129 F (comment); def RL:124 | RL:18 F | restored-but-false |
| 26 | 522 | LIFECYCLE_SCHEMA | RL:52 T | RL:64 F | restored, true |
| 27 | 522 | MAX_REPORTED_DUPLICATE_IDS | RL:64 T | RL:70 F | restored, true |
| 28 | 522 | MAX_NON_LIFECYCLE_TRACKED | RL:70 T | RL:73 F | restored, true |
| 29 | 530 | (none; cold preservation, :392) | RO:392 T (`function preserveToCold`) | RO:20 F | restored, true (content) |
| 30 | 530 | ROTATION_RECORD_SCHEMA | RO:109 T | RO:45 F | restored, true |
| 31 | 530 | coldVia | RO:591 T | RO:20 F | restored, true |
| 32 | 530 | CLI_USAGE | RO:1228 T | RO:67 F | restored, true |
| 33 | 534 | COMPACTION_SCHEMA | ROt:41 T | ROt:42 F | restored, true |
| 34 | 534 | LIFECYCLE_SCHEMA (import) | ROt:42 T | ROt:43 F | restored, true |
| 35 | 534 | ROTATION_RECORD_SCHEMA (import) | ROt:43 T | ROt:44 F | restored, true |
| 36 | 534 | (none; per-test temp dirs, fixtureDir) | ROt:54 T (`function fixtureDir`) | ROt:49 F | restored, true (content) |
| 37 | 534 | MAX_BYTES | ROt:49 T | ROt:50 F | restored, true |
| 38 | 534 | PAD | ROt:50 T | ROt:47 F | restored, true |
| 39 | 534 | BASE | ROt:47 T | ROt:48 F | restored, true |
| 40 | 534 | crash_mid_rotation_recovery | ROt:276 T | ROt:375 F | restored, true |
| 41 | 534 | payload_drift_detection | ROt:375 T | ROt:887 F | restored, true |

## Findings
1. Restored-but-still-false (4): rows 22, 23, 24, 25. Each restored value is the 0614092 value and the symbol is absent from that line at the pin. This is pre-existing base debt, not caused by the restoration, and the notice discloses that class. Definition lines at the pin, for the debt ledger: defaultLedgerPath 227, loadLifecycleLedger 381, extendLedgerMemoWithSuffix 278, dedupeKey 124.
2. Overreverted (1): row 24. The round-36 value RL:253 is a comment that names the symbol, so it is literally true. The restoration returned the anchor to RL:348, where the symbol is absent. Strictly this was a mention, not the definition (RL:278); flagged under the literal criterion.
3. Correct restorations (16 of 20, rows 26-41): each round-36 value was false at the pin and each restored value is true (rows 29 and 36 by content).

## Notice (line 2 of the file)
- Present: yes. Text: "> **Round-37 restoration (2026-10-21; final, amended by AuditSighting2/4).** This note is reset to its 0614092 bytes: ..."
- "reset to its 0614092 bytes": TRUE. The diff against 0614092 is one inserted line, the notice itself.
- "no anchor here is a round-36 artifact": TRUE. No anchor value differs from 0614092 in the body.
- "Pre-existing anchors ... remain as ratcheted fidelity debt": consistent. `.ufo/pins/fidelity-ratchet.json` has notes["corpus/knowledge/remaining-scripts-census.md"] = 70. My independent literal count of base symbol-keyed anchors false at the pin is 56. Different pairing rule, not reconciled, not contradicted.
- "re-verification against the pin is owed; do not claim pin-true": consistent with the evidence (4 false in this group; 34 false across the 163 restored anchors by the same literal test).
- Verdict on notice: ok.

## Context beyond group 2 (same literal test, same 163 anchors; not audited row by row)
- 130 symbol-keyed restored anchors: 34 restored-but-false, 23 literal overreversions (round-36 comment mentions), 96 true; 33 symbol-less.

## State-change record (superseded file, for the lane's log)
- In the earlier state, the restoration left 21 round-36 shifts unreverted (6 kept, 15 retargeted) and introduced 117 new deviations where round 36 already matched 0614092. The earlier notice ("reverted to the lines their 0614092 sentences named") was inaccurate for that state.
- In the old group-2 slice (rows 36-70 of 280), 10 base-true anchors turned false. Examples: `skip(` at scripts/fleet-selfheal-verify.mjs:247 -> :114; rotate.mjs:757 `rotateLedgerIfNeeded` -> ROt:54 (`function fixtureDir`); legacy test:31 -> RLt:1388-1390; `node:test` ROt:38 -> ufo-stale-watchdog.test.mjs:16-22 (node:test is on line 15). None of these is in the current file.

## Commands and output (abridged)
```
git -C <lane> diff --stat 0614092 -- corpus/knowledge/remaining-scripts-census.md
 corpus/knowledge/remaining-scripts-census.md | 1 +
git -C <lane> show 5ceb8cd^:corpus/knowledge/remaining-scripts-census.md | diff -q - r36.md   -> identical (r36 = 5833351 bytes)
grep -n '^export function ...' <pin>/scripts/fleet-ledger-read.mjs
  124:function dedupeKey   227:export function defaultLedgerPath   278:export function extendLedgerMemoWithSuffix   381:export function loadLifecycleLedger
sed -n '282p;492p;348p;129p;253p' <pin>/scripts/fleet-ledger-read.mjs
  if (typeof postStat.size !== "bigint" ... | if (value.kind === "process_settled") ... | )); | // strip fields ... | // M41). extendLedgerMemoWithSuffix advances ...
python3 state2.py   -> base->cur2 ops: [('insert', 1, 1, 1, 2)]; R!=B: 163; C!=B: 0; U2 size 163; group 2: rows 22..41 count 20
python3 view2.py 2  -> per-row B/R pin lines (table above)
git -C <pin> status --porcelain | wc -l  -> 0   (pin HEAD 31c465f)
```
Scratch: /fast/scratch/kumitate-r37/AuditRemainder2/ (state2.py, view2.py, audit_common.py, cur2.md, r36.md, base.md).

## Gaps and bookkeeping
- Literal symbol-on-line test, not the claims-check pairing; ratchet 70 vs my 56 not reconciled.
- Rows 29 and 36 have no backticked symbol and are judged by content.
- Did not verify authorship of the amendment (AuditSighting2/4) or the contents of fb5b90e.
- Installs or updates: none. Spawns: none. Lane writes: this report only.

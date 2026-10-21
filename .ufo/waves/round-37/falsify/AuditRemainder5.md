AUDIT Remainder5 anchors=17 false=0 overreverted=0 notice=ok verdict=holds
NOTE-LEVEL (20 anchors checked, idx 69-88, live HEAD c589b38): overreverted=2 (idx 86, 87) verdict=partial
SUPERSEDED 5ceb8cd (state at dispatch): anchors=17 false=14 overreverted=0 notice=bad verdict=refuted

# AuditRemainder5 - census group 5/8, round-37 restoration

## 1. The audited object changed during the audit
- At dispatch the restoration was 5ceb8cd: 139 anchor literals differed from 0614092, and the notice said they were "reverted to the lines their 0614092 sentences named".
- 5bc40d0 reset the note to 0614092 bytes. c589b38 (HEAD) corrected the notice attributions.
- Live check: `git --no-pager diff --numstat 0614092 -- corpus/knowledge/remaining-scripts-census.md` -> `1	0	...`. Live blob `1ecb95ba`, sha256 `3dbed6fd...`, equal to HEAD. `sed '2d'` of the live file is byte-identical to 0614092 (`cmp` -> IDENTICAL). Snapshot: `/fast/scratch/kumitate-r37/AuditRemainder5/live-snapshot.md`.
- The literal item ("changed vs 0614092") therefore yields 0 anchors. I audited the 139 anchors the restoration changed (same positions; live line = base line + 1) and took the 5th eighth.

## 2. Partition and method
- Changed anchor = anchor token inside a word-level changed span (difflib over whitespace tokens), base -> 5ceb8cd. N=139. 5th eighth = indices floor(4N/8)..floor(5N/8)-1 = 69..85 (17 anchors). Full list: `/fast/scratch/kumitate-r37/AuditRemainder5/changed-anchors-139.tsv`.
- Sentence symbol = the backticked identifier or keyword the anchor belongs to. Shorthand `:N` resolves to the section's file.
- Pass = symbol matches on the cited pinned line (range: any line in range) of the cited module. Pin `/fast/scratch/kumitate-r36/src`, `git rev-parse HEAD` = `31c465f15669f744848bd9f5d56191c5085670f7`, read-only.
- Wrong module (symbol on the line, but in a module other than the sentence's subject) = false.
- Overreverted = round-36 value true, base value false (symbol absent at base line), restored value differs from round-36.
- Checker: `python3 /fast/scratch/kumitate-r37/AuditRemainder5/check_group5.py group5` (and `boundary`).

## 3. Per-anchor table
Legend: mon = scripts/ufo-l0-monitor.test.mjs, watch = scripts/ufo-l0-watch.test.mjs, tick = scripts/the-tick-config.mjs, cred = scripts/ufo-credential-screen.mjs, drills = scripts/ufo-drills.mjs, wdog = scripts/ufo-watchdog-repend.mjs, sync = scripts/sync-ufo-contracts.mjs, act = scripts/ufo-mission-activity.mjs, actT = scripts/ufo-mission-activity.test.mjs. OK = symbol on line; NO = absent; WM = wrong module.

| idx | note L | sentence symbol | 5ceb8cd anchor -> what is on the cited line | base 0614092 | round-36 | 5ceb8cd | live (=base) |
|---|---|---|---|---|---|---|---|
| 69 | 613 | fixtureLaneRoles | sync:2136 -> `console.log(JSON.stringify(report...))` NO | sync:1225 OK | sync:1225 OK | FALSE | ok |
| 70 | 617 | requireExactKeys | tick:214-221 -> requireIntegerRange/runners NO | tick:152 OK | tick:152 OK | FALSE | ok |
| 71 | 617 | loopback endpoint check | tick:214-221 -> slot/runner arithmetic NO | tick:210-212 OK | tick:210-212 OK | FALSE | ok |
| 72 | 621 | FORMAT_CHARS_RE | cred:65-68 -> L65 `text.replace(FORMAT_CHARS_RE..)` OK (use site) | cred:61 OK | cred:61 OK | TRUE | ok |
| 73 | 625 | main (drill harness) | wdog:366 -> `export function main` WM | drills:1561 OK | drills:1561 OK | FALSE-WM | ok |
| 74 | 625 | SHADOW_PATHS | drills:519 -> `for (const rel of SHADOW_PATHS)` OK (use site) | drills:76 OK | drills:76 OK | TRUE | ok |
| 75 | 625 | wiredCount | drills:1705-1710 -> L1705 `pending > wiredCount` OK (use site) | drills:1696 OK | drills:1696 OK | TRUE | ok |
| 76 | 625 | DrillFormatError exits 2 | drills:1733 -> `throw error;` NO | drills:1727-1731 OK | drills:1727-1731 OK | FALSE | ok |
| 77 | 653 | dynamic-import destructure | mon:18 -> static `import { validateTaskReceipt }` NO | mon:35 OK | mon:18 NO | FALSE (round-36 value kept) | ok |
| 78 | 653 | validateTaskReceipt | watch:30-35 -> import block; symbol at L34 WM | mon:18 OK | mon:18 OK | FALSE-WM | ok |
| 79 | 653 | test(name, fn) driver | watch:30-35 -> import block NO | mon:41 OK | mon:41 OK | FALSE | ok |
| 80 | 653 | failure-count exit | watch:30-35 -> import block NO | mon:1465 OK (`process.exit(1)`) | mon:59 NO | FALSE | ok |
| 81 | 653 | scratchMonitorJson | mon:1424 -> `};` NO | mon:1275 OK | mon:1275 OK | FALSE | ok |
| 82 | 653 | aging/gave-up persistence | mon:1424 -> `};` NO | mon:155 OK | mon:155 OK | FALSE | ok |
| 83 | 653 | damaged journal preserved | mon:1424 -> `};` NO | mon:305 OK | mon:305 OK | FALSE | ok |
| 84 | 653 | rebind tallies | mon:1424 -> `};` NO | mon:724 OK | mon:724 OK | FALSE | ok |
| 85 | 653 | successor parent-receipt rebind | mon:1424 -> `};` NO | mon:1287 OK | mon:1287 OK | FALSE | ok |
| 86* | 661 | projectMissionActivity | act:64 -> `text = text.replace(...)` NO | act:133 NO | act:123 OK | FALSE | OVERREVERTED |
| 87* | 661 | renderMissionActivity | actT:18-21 -> import block, symbol at L20 WM | act:160 NO (comment) | act:150 OK | FALSE-WM | OVERREVERTED |
| 88* | 661 | main (activity) | wdog:366 -> `export function main` WM | act:210 OK | act:210 OK | FALSE-WM | ok |

(* = boundary, outside the floor eighth; listed because alternative eighth conventions include them.)

## 4. Findings
1. Restored-but-false, 5ceb8cd: 14 of 17. Symbol absent on the cited line: 69, 70, 71, 76, 77, 79, 80, 81-85 (12). Symbol present only in another module: 73, 78 (2). All 14 were TRUE at base, so the restoration itself created them. 77 is a round-36 regression that the restoration kept (base `:35` -> round-36 `:18`).
2. Overreverted in the floor eighth: 0, in both 5ceb8cd and live. Adjacent 86 and 87: round-36 `:123` and `:150` are true; base `:133` and `:160` are false. 5ceb8cd replaced them with `:64` and a test-file import (both false). The live reset restores `:133` and `:160`, so live overreverted = 2.
3. True but de-specified (passes the item's test, flagged): 72, 74, 75 now cite use sites (`:65`, `:519`, `:1705`) where base cited the declarations (`:61`, `:76`, `:1696`).
4. Copy pattern: `:1424` is written into five sentences (81-85). It is the unchanged base anchor of that paragraph's last claim. `scripts/ufo-watchdog-repend.mjs:366` appears as the `main` anchor in two other modules' sentences (73, 88): a name collision, not a location.
5. Live floor eighth: all 17 cited base lines carry the sentence symbol at the pin. Restored-but-false = 0.

## 5. Notice
- 5ceb8cd notice (line 2): present, inaccurate.
  - "reverted to the lines their 0614092 sentences named": false for this note. 139/139 changed anchors differ from base; 0/17 in this eighth sit at base; 133/139 match neither base nor round-36 at their position (6 kept round-36 values, including 77).
  - "treat line anchors here as at their base revision": 14/17 of this eighth are false.
  - Its D1 citation (`corpus/lessons/round-36-verifier-spotcheck.md:193-195`: "keep the base line wherever its symbol is still on that line") is contradicted for 14 base-true symbols.
  - "moved them one symbol off" describes 2/17 (77, 80) only.
  - `.ufo/waves/round-37/repairs.md:3-4` ("every symbol-keyed anchor ... reverted to its 0614092 sentence line") is contradicted.
  - `.ufo/waves/round-37/falsify/AuditSighting4.md:65` says the D1 reference was not located. It is at `corpus/lessons/round-36-verifier-spotcheck.md:193`.
- Live notice (c589b38, line 2): present and accurate on scope ("reset to its 0614092 bytes"; no round-36 artifact remains).
  - Unverified clause: "pre-existing anchors already false at the pin remain as ratcheted fidelity debt". Base-false anchors exist (86, 87). The ratchet entry for this note is 70 (`.ufo/pins/fidelity-ratchet.json:17`). I did not re-measure the note's total.
  - Not disclosed: the reset discards two true round-36 anchors (86, 87), so D1 is not met there.

## 6. Caveats and partition sensitivity
- Positional-LCS definition (138 changed): the floor eighth then contains the `:64` anchor (round-36 `:123` true, base `:133` false), so live overreverted = 1 and verdict = partial.
- array_split (71-87) and ceil-18 (72-89) conventions include 86-87: live overreverted = 2, verdict = partial. Core 72-85 is common to all conventions.
- If 81-85 resolved to the most recent explicit path (watch:1424), they remain false: line 1424 of the watch file contains none of the sentence keywords (checked by grep).
- Prose-only symbols (81-85) are matched by the words in the base test titles at mon:155/305/724/1287, which are true at base.
- Not assessed: overreverts in other eighths.

## 7. Commands and outputs
- `git --no-pager diff --numstat 0614092 -- <note>` (live): `1	0`. At dispatch (5ceb8cd): 48 insertions, 46 deletions, one file.
- `git -C /fast/scratch/kumitate-r36/src rev-parse HEAD` -> `31c465f15669f744848bd9f5d56191c5085670f7`.
- `check_group5.py group5` -> `-- n=17 W-true=3 W-false-absent=12 W-false-wrong-file=2 base-true=17/17 round36-true=15/17 restored==base=0 overreverted=0`
- `check_group5.py boundary` -> `-- n=3 W-true=0 W-false-absent=1 W-false-wrong-file=2 base-true=1/3 round36-true=3/3 restored==base=0 overreverted=2`
- Live recomputation (live = base): floor `anchors=17 false=0 overreverted=0`; boundary `anchors=3 false=2 overreverted=2`.
- `grep -n "D1 Restore" corpus/lessons/round-36-verifier-spotcheck.md` -> `193:- D1 Restore anchor truth in ...`.
- Outputs saved: `/fast/scratch/kumitate-r37/AuditRemainder5/out-group5-superseded-5ceb8cd.txt`, `.../out-boundary-superseded-5ceb8cd.txt`.

## 8. Checks for the main agent
- Rerun `check_group5.py group5` and `boundary`. Note the checker's W columns are the superseded 5ceb8cd values; its B column is the live truth.
- Decide whether 86-87 should return to the round-36 lines (`:123`, `:150`) per D1 ("keep the base line where its symbol is on it; otherwise move to the symbol's line").
- Tooling: no installs, no package transactions, no lane writes. Scratch only under `/fast/scratch/kumitate-r37/AuditRemainder5/`.

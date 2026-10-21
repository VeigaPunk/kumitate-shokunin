REP4 numbers=21 mismatches=5 verdict=partial

Item: round-37 report section 4 "Trend verdicts" + "SHONEN" — `../.ufo/reports/round-37/kumitate.md` lines 77-91 (fleet root; mtime 03:33:55, 12,499 B, sha256 6ad754a2…). Section 4 text is unchanged since 03:21; errata 1-8 were appended at lines 93-162.
Snapshot: lane HEAD `469500f` (HEAD moved 86c0676 → a5d627b → 5031720 → fdac52c → 1c281bb → fb5b90e → 5bc40d0 → 469500f during this run; each number names its revision). Pin `31c465f15669…` read-only, HEAD verified. Scratch: `/fast/scratch/kumitate-r37/Rep4/` (anchor_recheck.py, anchor_recheck.json, checklists-469500f.txt, roundgate-469500f.txt, cite-bare-469500f.txt).
Counting: numbers = the 21 checkable items in section 4 (numeric values, counts, pointers, checkable claims); mismatches = items failing re-derivation. Tool installs: none. Spawns: none. Lane writes: this file only.

## Items

| id | section-4 claim | re-derived at 469500f | result |
|---|---|---|---|
| T1 | three trend verdicts, one each | `../LEARNING.md` defines expansion / quality / discernment | ok |
| T2 | expansion: no new knowledge entry | `git diff --diff-filter=A --name-only 91da27c6 469500f -- corpus/knowledge` → empty | ok |
| T3 | expansion: no new source row | SOURCES rows 32 at 91da27c6 and 469500f; `git diff --stat 91da27c6 469500f -- corpus/SOURCES.md` → empty; `node scripts/sources-check.mjs` → `rows=32` | ok |
| T4 | expansion: no new coverage family | SCORECARD rows S=8, R=11, K=5 at both; zero S/R/K row diffs since 91da27c6 | ok |
| T5 | quality: "the 123 harmed anchors are restored" | 123 not reproduced: 113 (nearest-symbol rule) or 91 (strict adjacency). Restoration itself holds: all 113 (91) are back at base | **mismatch (number)** |
| T6 | quality: "the four notes are marked" | each of the 4 notes gains exactly one notice line vs 0614092 (`git diff --numstat 0614092 HEAD`: `1 0`) | ok |
| T7 | quality: "47/47 incl. the new case" | `node scripts/claims-check.mjs --selftest` → `CLAIMS_SELFTEST: 47/47 pass` | ok |
| T8 | quality: "the ratchet is measured, not decorative" | ratchet total 200 = sum of 20 per-note values; `FIDELITY: CLEAN (notes=20 anchors=1574 …)`, `nonok=200` | ok (see E3) |
| T9 | quality: "the inherited false statements are corrected" | `corpus/README.md:99` still reads "FIDELITY v1 arm with a clause-guarded pairing rule" (1 left, 0 claimed) | **mismatch (number)** |
| T10 | discernment: "improved (in-lane only)" | `grep -c -i 'agree\|disagree' corpus/lessons/round-37.md` → 0; LEARNING requires agree/disagree records each round | **mismatch (records 0)** |
| T11 | discernment: "added Q16" | `corpus/QUALITY.md:126` Q16 present | ok |
| S1 | four SHONEN boxes, one `[~]` line each with pointer | `SHONEN.md:5-8` = 4 boxes; section 4 = 4 `[~]` lines | ok |
| S2 | `SHONEN.md:5` craft + "14-item checklist" | box 5 = SKILL decision tables / checklists; `SKILL.md:627-640` = 14 items; `## Gate registry` `SKILL.md:587` | ok |
| S3 | "closure re-runs the 14 items" | `node scripts/surface-probe.mjs --checklists` → `CHECKLIST: 14/14 pass` (13/14 at a5d627b) | ok at 469500f |
| S4 | `SHONEN.md:6` LOG round-37 + report citing `86c0676c` | `LOG.md:1714` round-37 entry; `86c0676c` resolves and is an ancestor of HEAD | ok (cited commit partly superseded by 5bc40d0) |
| S5 | "`round-gate --round 37` to be run by closure" | `node scripts/round-gate.mjs --round 37` → `ROUND_GATE: CLEAN (round=37 … errors=0 warnings=1)`, exit 0 (DRIFT at a5d627b, before SCORECARD row 37) | ok |
| S6 | `SHONEN.md:7` pin recreate | `.ufo/pins/origin.json:6` `"recreate"` present | ok |
| S7 | `SHONEN.md:7` "cite-check still needs explicit `--src` (named limit)" | bare run measures the default checkout `/home/vgpnk/Projects/ufo-fsd-alpha`: `CITE_CHECK: DRIFT (… errors=454 …)`, exit 1 | **mismatch (behaviour)** |
| S8 | `SHONEN.md:7` checklist commands + pairing rule documented | `SKILL.md:627-640`; `scripts/claims-check.mjs:303` `const pair = prev ?? next ?? null;` | ok |
| S9 | `SHONEN.md:8` "every changed path is in the lane; upstream/operator files untouched" | D6 deletes fleet-root `/home/vgpnk/Projects/shokunin/-.rej`; `ls` → absent; the report's own D6 line records it | **mismatch (1 out-of-lane change)** |
| S10 | `SHONEN.md:8` "PROVINCE.md accurate" | PROVINCE registry claims S1-S8 / R1-R11 / K1-K5 = SCORECARD rows 8 / 11 / 5 | ok |

Pointers: every section-4 pointer resolves (SHONEN.md:5-8; 86c0676c; LOG.md:1714; QUALITY.md:126; origin.json:6; claims-check.mjs:303; SKILL.md:587, 627-640; the round-gate, surface-probe and cite-check commands). Unresolved pointers: 0.

## Mismatch evidence

**T5** (`anchor_recheck.py`, pin symbol-on-cited-line truth; base 0614092, pre 91da27c6, HEAD 469500f):
```
rule                 remaining  sighting  route  native   total | spot-check §Claims
T->F nearest-symbol       91        11       5       6     113 | 102/12/5/4 = 123
T->F strict-adjacency     69        11       5       6      91
F->T strict-adjacency     23         9       1      22      55 | 24/9/1/22 = 56
moved base->pre         254 total (spot-check 279)
at 469500f: restored 113/113 (nearest), 91/91 (strict); head==base for all anchors in all 4 notes
```
At the report's own commit 86c0676 (identical anchor content to fb5b90e): restored 60/91 strict, 77/113 nearest, so the sentence was partly false when written.

**T9** `git show 469500f:corpus/README.md | sed -n 99p` contains "FIDELITY v1 arm with a clause-guarded pairing rule and an all-zero ratchet". The correction exists in SCORECARD ("## Round 37 correction"), in the round-36 LOG entry and in `corpus/lessons/round-36.md` ("superseded"), but not in this README row.

**T10** `grep -c -i 'agree\|disagree' corpus/lessons/round-37.md` → `0`. LOG.md's three "agree" hits (lines 135, 485, 857) predate round 37. LEARNING.md "Discernment is checked from outside": "Self-assessed taste is not discernment … records agree/disagree with a reason in the round's lesson." Lane precedent, SCORECARD.md:1650 (round 33): `discernment | unchanged | no outside non-author admit/reject spot-check; lane evidence cannot substitute`. Counter-evidence: Q16 (QUALITY.md:126) cites the outside spot-check, which meets LEARNING's second "improved" clause, so the verdict is unrecorded rather than refuted.

**S7** `node scripts/cite-check.mjs` (no --src) → `src=/home/vgpnk/Projects/ufo-fsd-alpha (index 1212 files)`, `CITE_CHECK: DRIFT (files=88 tokens=8722 errors=454 warnings=451)`, exit 1. `UFO_SRC=/nonexistent node scripts/cite-check.mjs` → exit 2 `fail-closed`. The checklist item at `SKILL.md:627` accepts exit 1 (`expected=0|1`) and reports `PASS` (checklists-469500f: `PASS SKILL.md:627 exit=1 expected=0|1`). A bare run does not need `--src`; it measures the moving operator checkout.

**S9** `ls /home/vgpnk/Projects/shokunin/-.rej` → no such file. Lane copy `.ufo/waves/round-36/evidence/remaining-scripts-census.rej.txt`: 72390 B / 249 lines / 19 `@@` hunks / sha256 `3f51c7e7c3caf1c5…` (tracked; matches erratum 8). The original cannot be re-compared. `.ufo/waves/round-37/final/misroot.txt` (03:32) lists fleet-root driver residue (`.ufo/watchdog.log`, `.ufo/state/*`).

## Errata and undisclosed effects (not counted)

- **E1** Section 4 was not rewritten after errata 4-8 (report lines 118-162). Its quality line still rests on the symbol-keyed revert, which errata 5-7 retract: the restoration became a full base reset that "discards round-36 anchors that were true at the pin" (errata 7: sighting-wall 8, native-trial 21).
- **E2** My counts of those discards (base-false, pre-true, strict / nearest): sighting-wall 9 / 10, native-trial 22 / 22, remaining 23 / 25, route 1 / 1; total 55 / 58. Errata 7's 8 and 21 differ by 1-2 (parser-dependent).
- **E3** The ratchet was re-baselined in-round (`git show 86c0676:.ufo/pins/fidelity-ratchet.json` vs 469500f): native-trial 25→31, route-probe 14→23, sighting-wall 13→20, remaining 78→70; net 186→200. Section 4's "the ratchet is measured" omits that three ceilings rose by +22.
- **E4** Pin-true anchors (symbol on cited line), 91da27c6 → 469500f: strict 253 → 289 (+36); nearest 326 → 381 (+55). So "quality: improved" holds directionally at 469500f, but not for the reason section 4 gives.
- **E5** Section 1-2 numbers are superseded at 469500f (outside section 4): anchors 1551 → 1574; nonok 186 → 200; "274 + 29 + 36 + 30 replacements" and `git diff --stat` describe the retracted revert.

## Operability notes (judged axis)

- The round-close audit was red at a5d627b (`ROUND_GATE: DRIFT … SCORECARD_ROW_MISSING`, checklist 13/14) and is green at 469500f (SCORECARD row 37 from 5bc40d0).
- Checklist item 1 (`SKILL.md:627`, bare cite-check) accepts exit 1, so a 454-error DRIFT of the moving default checkout reads PASS. It names no `--src` or pin, and it is the only unpinned gate in the list.
- At 469500f: `CLAIMS: MATCH (rows=19 yes=19 notes=27 sections=184 adv=4 src-rev=31c465f15669)`; `FIDELITY: CLEAN (notes=20 anchors=1574)` with nonok=200 equal to the ratchet; `PROXY: MATCH (… C2=84/84 …)`; `SOURCES_CHECK: CLEAN (rows=32)`; `CHECKLIST: 14/14 pass`; claims selftest 47/47; proxy selftest 116/116.
- `.ufo/waves/round-37/final/checklists.txt` (13/14, Proxy-recompute FAIL) and `final/proxy.txt` (DRIFT) were written at 03:21, before the SCORECARD C2=84 declaration, and now contradict the live state. Section 4 does not cite them, but they sit in the lane record.

## Limits

- Parser is mine (`anchor_recheck.py`, scratch): symbol-on-cited-line truth only, no ±window. The two pairing rules bracket the spot-check's 123 (91-113). Its "moved" (279) is not reproduced either (mine 254).
- The tree moved eight times during the run; all counts are at 469500f unless a revision is named.
- I wrote no lane file other than this report. All gates ran read-only; git ran with `--no-optional-locks`.

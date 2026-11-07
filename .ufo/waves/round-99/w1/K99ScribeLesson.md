# K99ScribeLesson Report: cell-trim class knowledge entry + Mistakes/Q93 draft

**Date:** 2026-11-07
**Seat:** K99ScribeLesson (Kumitate round 99, hyaku run 15, attempt 1)
**Role:** UFO-FSD scribe (leaf; no dispatch)
**Inputs frozen at:** `f480124b5216d66b8bd74162bc2f61eabaffb8b2` (plan, `probe/probe99-c1.mjs`, 17 controls, read-order log); lane base `f9cd1bff147508f0d787f9e0cc4d2191aabaf02a`
**Candidate:** `.ufo/waves/round-99/K99ExecTool/sources-check.mjs` was present but **no `READY` file** at any point of this run; nothing here is scored against it. My before/after uses BASE bytes at the freeze's base rev plus the one-line R99 rule applied by command.
**Seat dir:** `.ufo/waves/round-99/K99ScribeLesson/` · **Scratch:** `/fast/scratch/hyaku/kumitate-r99/K99ScribeLesson/` (removed before yield)

---

## 1. Behaviour

Wrote the two asked-for drafts, both against frozen artifacts only:

1. `K99ScribeLesson/knowledge-sources-check-cell-trim-class.md` — provenance trio first (S276 ECMA-262, S277
   POSIX ch. 7, S278 PropList 17.0.0, S279 POSIX XBD § 9.3.5; `verified-at:` the freeze; `recheck:` on-release
   with the three artifacts that invalidate it), then the three-class code-point table built from the counter's
   own `PADS` literal (44 rows, each marked JS-trim / POSIX-blank / `White_Space`), the per-finding-kind effect
   table (7 kinds measured, 6 reasoned from the reader and marked `[INFERENCE]`), the measured cross-reader
   matrix, and the census-internal inconsistency as a disclosed limit. Every count carries its command.
2. `K99ScribeLesson/lesson-draft.md` — `## Mistakes` rows M99-1 (r98 read-order defect → frozen log + checker),
   M99-2 (shipped selftest green under all 16 violating shapes), M99-3 (plan's prose fixture count vs the
   artifact), plus `## Q93` in the Q90–Q92 shape with rule, grounding, who-checks, command, fails-when,
   shown-able-to-fail and limit.

Three re-runnable instruments were written under the seat dir (not the lane): `padclass-table.py`,
`census-internal-trim.sh`, `mini-before-after.sh`. Each was run and its output kept as a receipt.

## 2. Gates (what I did not touch)

- **No verdict.** `C99_C1` is the frozen counter's call and belongs to the mutation-tester/critic seats; I ran
  no counter and edit no claim. My before/after is a 14-row fixture, explicitly not the counter battery.
- **Read-only on the lane.** No write under `scripts/`, `corpus/`, `probe/`, `controls/`, `open/`, or `plan.md`;
  no git/jj mutation anywhere; no `sudo`; no fleet-root file. The R99 rule was applied to a *copy* of BASE
  bytes in scratch (`diff` shows exactly line 134, receipt `receipts/mini-before-after.txt`).
- **No S-rows written.** S278/S279 are drafted for the scribe-sources/L1 integration; the registry stands at
  S277 and I did not edit `corpus/SOURCES.md`.

## 3. Touched surfaces

| path | what |
|---|---|
| `.ufo/waves/round-99/K99ScribeLesson/knowledge-sources-check-cell-trim-class.md` | knowledge entry draft (target: `corpus/knowledge/`, S276+S277+S278+S279 used-by) |
| `.ufo/waves/round-99/K99ScribeLesson/lesson-draft.md` | `## Mistakes` M99-1..3 + `## Q93` draft |
| `.ufo/waves/round-99/K99ScribeLesson/padclass-table.py` | class table from `PADS` × PropList `White_Space` |
| `.ufo/waves/round-99/K99ScribeLesson/census-internal-trim.sh` | 44 pads × {node, gawk `[ \t]`, bash `[[:space:]]`} × {C, C.UTF-8, en_US.UTF-8} |
| `.ufo/waves/round-99/K99ScribeLesson/mini-before-after.sh` | BASE vs R99 vs live census on one 14-row fixture |
| `.ufo/waves/round-99/K99ScribeLesson/receipts/{padclass-table,cross-reader-trim,mini-before-after,live-pad-scan,read-order-check,sources-opened}.txt` + `receipts/{V1_chap09,V3_chap02,posix-xcu-chap02}.html` | receipts and the two opened POSIX pages |

## 4. Findings

1. **Class inventory: 44, not 47.** The `PADS` literal (`probe/probe99-c1.mjs` lines 59–68) holds 44 keys;
   `plan.md` § C1 says "47 pad classes", and the round brief's "lines 46–56" does not contain the literal.
   Measured: `receipts/padclass-table.txt` → `# classes=44 js_and_blank=4 js_only=27 blank_only=0 neither=13`.
   Partition: 4 stripped by both JS trim and blank, 27 JS-only, 13 by neither, **0 blank-only** ⇒ blank ⊂ JS.
2. **JS trim = `White_Space ∪ {U+FEFF} \ {U+0085}`.** NEL is `White_Space` but no reader strips it; U+FEFF is
   stripped by JS but is not `White_Space`. "Unicode whitespace" is therefore wrong for either reader
   (`UWS_only_vs_JS=[133] JS_only_vs_UWS=[65279]`).
3. **Census-internal class split measured, not inferred.** `row_pass` (line 581, gawk `[ \t]`) strips 4 of the
   44 classes; `usedby_findings`' `trim_cell` (lines 531–535) strips 9 under `LC_ALL=C` and 24 under
   `C.UTF-8`/`en_US.UTF-8` — and `[[:space:]]` membership is locale-defined by spec (S279 § 9.3.5, line 276).
   Consequence on the fixture: under the counter's `LANG=C.UTF-8` the census emits `E11` for an NBSP-padded
   used-by but not for an EMSP-padded one; under `LC_ALL=C` it emits both. R99 reports `USED_BY_MISSING` for
   both — the one R99/census disagreement on the fixture, and it is out of the counter's judgement
   (`ctl-splitjs` HELD by design).
4. **Fixture before → after (14 rows).** BASE: `counts.rows=13`, 4 findings (`ROW_FIELD_EMPTY`, `ID_FORM`,
   `ID_DUPLICATE`, `RECHECK_OVERDUE`). R99: `counts.rows=10`, 11 findings. Census: `rows=14`, 4×E02 + E05 +
   E06 + E07 + E08 + E09 = 10. `counts.rows = census rows − E02` holds (14 − 4 = 10), and 10 of the 11 R99
   findings match census codes one-for-one. `ROW_FIELD_EMPTY` on an NBSP-only cell disappears under R99 (the
   cell is no longer "empty") — a consequence of one helper, disclosed in the entry.
5. **Live exposure is zero.** 21 lanes, 5,460 Registry data rows, 60,060 cells, 0 cells with a pad outside
   {SP, TAB} (`receipts/live-pad-scan.txt`). The claim is prospective; consistent with r98's 5,442.
6. **Read-order checker works and can fail.** `READ_ORDER: CLEAN entries=27 canonical=8 claim=03:17:58
   freeze=03:32:35` exit 0; two doctored scratch logs read `CANONICAL_AFTER_CLAIM line=25` / `line=11` exit 1
   (`receipts/read-order-check.txt`), matching the frozen red set in `open/read-order-red.txt`.
7. **BASE's own selftest pins no cell-trim class**: `controls/OBSERVED.txt` shows `h=1/1` on all 17 lines, so
   `--selftest` PASS is compatible with every violating reader (M99-2).

## 5. Out of scope / not done

- No counter run (verdict untouched), no harm battery, no candidate selftest. If the candidate lands with teeth
  on the 16 shapes, the entry's "before → after" numbers stand unchanged (they are BASE-vs-rule, not
  BASE-vs-candidate).
- `USED_BY_ASYMMETRY`, `MINED_UNUSED`, `ROW_MALFORMED`-gate, `TIER_INFLATION` and `ENTRY_*` effects are marked
  `[INFERENCE]` from the reader's code; I did not build fixtures for them.
- The GNU bash manual page for pattern matching stayed unreachable for L1 (timeout); I did not retry it — XBD
  § 9.3.5 grounds the same point.
- The entry assumes the candidate is the R99 rule as frozen; a candidate that deviates would need the entry's
  decision section re-read by the critic seats.

## 6. Artifact paths

- `.ufo/waves/round-99/K99ScribeLesson/knowledge-sources-check-cell-trim-class.md`
- `.ufo/waves/round-99/K99ScribeLesson/lesson-draft.md`
- `.ufo/waves/round-99/K99ScribeLesson/receipts/` (6 `.txt` receipts + 3 HTML captures)
- `.ufo/waves/round-99/K99ScribeLesson/{padclass-table.py,census-internal-trim.sh,mini-before-after.sh}`

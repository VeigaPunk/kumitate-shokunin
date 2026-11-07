# K98ScribeLesson — round-98 knowledge entry + mined-mistake row (w1)

Seat: scribe (leaf, no dispatch). Lane read-only; every artifact is inside
`.ufo/waves/round-98/K98ScribeLesson/` plus this trailer. No lane `scripts/`, `corpus/`, `probe/`,
`controls/`, `open/`, `plan.md`, fleet repo, or judge file was written; no git/jj mutation ran anywhere
(only `git -C <fixture>` on a scratch fixture whose toplevel was asserted, plus read-only `git show`).
No tool install/upgrade. Scratch `/fast/scratch/hyaku/kumitate-r98/K98ScribeLesson` removed before yield.

## Produced

1. `knowledge-round-gate-row-id-class.md` — the round-98 knowledge entry draft: R98 verbatim, the BASE
   `\s` id-cell class vs the census `[ \t]` with one measured example row per departure class, the three
   consequences, why the census class (S277 placeholder / S276 / S274), the three-reader grammar table,
   the nonce battery + 15 controls, limits, receipts. `verified-at: <M>` left for the L1.
2. `lesson-draft.md` — the `## Mistakes` row **M98-1** (class · evidence pointer · captured-by · fix) and
   the `corpus/QUALITY.md` **Q92** draft in corpus style (rule, grounding, who checks, command, fails when,
   shown able to fail, limit).
3. Receipts: `receipt-idclass-base.txt`, `receipt-idclass-ctlpositive.txt`, `receipt-js-class-boundary.txt`,
   `receipt-r97-grid.txt`, `receipt-controls-reproduced.txt`, `receipt-plan-vs-observed.txt`,
   `receipt-q92-pass.txt`, `receipt-q92-fail.txt`, `receipt-q92-fail-r97.txt`.
4. Drivers: `driver-idclass.mjs` (fixture + census + gate differential), `idclass-coverage.mjs` (Q92
   command), `js-class.mjs`, `plan-vs-observed.py`.

## Measurements that back the entry

- Base gate bytes `edaa115f…` = `ctl-nothing` `tool_sha256`; `7038ee4c` and `2f09c674` gate sha equal;
  K4 clean (`git diff 7038ee4c HEAD -- plan.md probe controls open` empty; plan sha `3639383a…` both sides).
- One fixture, 32 pad classes × lead/trail/both inside + 32 outside (105 + 32 rows), census live:
  `W03=102 E12=6 E01=0 E02=82`; BASE `declared=80 outsideRows=26`; R98 reference (ctl-positive,
  sha256 `d5737901…`) `declared=20 outsideRows=6`. 12-field fixture: census `E01=32` / 6 valid ids;
  BASE `malformedRows=26`; R98 reference `6`.
- `receipt-controls-reproduced.txt`: frozen 15-control set regenerated from BASE bytes, 15/15 sha256
  identical to `controls/controls-sha256.txt`.
- Plan control table vs `OBSERVED.txt` vs `controls-sha256.txt`: `PLAN_VS_OBSERVED: CLEAN controls=15
  fails=0` (51 PASS lines; every `ctl-*` expected=observed with `match=yes`, every verdict `tool_sha256`
  equal to the frozen sha list, `ctl-nothing` carries the plan's `declared=82/22 outside=108/28
  malformed=82/22`, `ctl-positive` `HELD a=1/1 b=1/1 c=1/1 d=81/81 e=1/1`, every receipt header
  `rows=386 pads=32 R=245 L=109 P=32`). No mismatch found; the only wording nit is recorded as Q92's
  limit (the plan's “every Unicode `White_Space` class” is class-granular — 5 `Zs` code points are not
  drawn: U+2001/U+2004/U+2005/U+2006/U+2008).
- Q92's command: `CLEAN pads=32 witnesses=32` on `probe98-c1.mjs`; `MISSING [EMSP ZWSP LS BOM] pads=27`
  on a copy with five PADS entries removed; `NOPADS` (exit 2) on the r97 counter.
- The r97 grid re-derived independently: `\f 4`, `\u00a0 4`, `\v 4`, nothing else (`receipt-r97-grid.txt`).

## Findings / blockers

- Candidate `.ufo/waves/round-98/K98ExecTool/round-gate.mjs` had **no `READY`** at draft time; the entry
  states that and leaves `verified-at` to the L1. No candidate-independent claim here depends on its bytes.
- Attempted a narrow-grid counterfactual (a copy of the frozen counter with the NBSP/Zs classes removed
  scoring `ctl-zs`) — the run was killed at the 300 s job deadline under CPU contention and is **not
  cited**; the drafts rest on the frozen control receipts and Q92's checker instead.
- S277 must land in the same integration commit as this knowledge entry (ScribeSources finding 2: the
  row's `used-by` names `corpus/knowledge/round-gate-row-id-class.md`).

## Out of scope (untouched)

Lane scripts/corpus/registry, `MANIFEST.json`, fleet repo, judge files, other seats' dirs; no product
edit, no commit/push, no re-run of the frozen counter.

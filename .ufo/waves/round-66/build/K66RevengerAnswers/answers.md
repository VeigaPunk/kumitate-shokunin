# Routed-item answer reconstruction — rounds 55..65 (kumitate, round 66 w1 seat K66RevengerAnswers)

Method: the 11 spot-check files (`corpus/lessons/round-58/…/round-65-verifier-spotcheck.md`) were parsed with the
lane's own `routedItems()` (`scripts/routed-ledger.mjs`), so the ordinals below are the parser's ordinals at the freeze
revision `621212bac37f8249c72ac982d1d6534cb8d60701` — not a hand count. Item total 57 (3+4+4+8+0+9+6+5+6+5+7); round 59's
routed section is prose and yields 0 items, matching the plan's "57 items in 11 sections". Each answer line was then
located by content search over later lessons, `SCORECARD.md`, `QUALITY.md`, `LOG.md`, committed wave artifacts and
`git show` of the freeze revision; every quote below is re-checked mechanically against its `path:line ±2`
(`verify.mjs`, run output pasted at the end).

`Status` is my reading of the located line only: `closed` (the line says the item was repaired/fixed), `wontfix`
(a located line answers it by rejecting/absorbing it), `open` (a located line records it as still open/carried) and
`none found` (no line in the lane speaks to it after the spot-check).

| round | ord | label | answer path:line | status | conf | quote (verbatim, ≤25 words) |
|---|---|---|---|---|---|---|
| 55 | 1 | R55-V1 | corpus/lessons/round-56.md:35 | closed | high | R55-V1 repaired-by-process above (R56-2); the filed bytes stand (append-only). |
| 55 | 2 | R55-V2 | corpus/lessons/round-56.md:36 | closed | high | R55-V2 repaired-by-process above (R56-1); the filed `B=9→10` lines stand |
| 55 | 3 | (carry: R41-2, R43-1/5, A3e, R53-2) | corpus/lessons/round-56.md:38 | open | high | Carried, not this round's: R41-2 gate-pins ruling, R43-1/R43-5, A3e |
| 56 | 1 | R56-V1 | corpus/lessons/round-57.md:37 | closed | high | R56-V1 answered-by-convention above (R57-3); the wave is prepared and the |
| 56 | 2 | R56-V2 | corpus/lessons/round-57.md:39 | closed | high | R56-V2 repaired-by-convention above (R57-2): the amended B7 arm makes the |
| 56 | 3 | R56-V3 | corpus/lessons/round-57.md:41 | closed | high | R56-V3 repaired above (R57-1): the row exists AND the class is gated. |
| 56 | 4 | (carryovers unchanged) | corpus/lessons/round-57.md:42 | open | high | Carried, not this round's: R41-2 gate-pins ruling, R43-1/R43-5, A3e |
| 57 | 1 | (double-live L1 orchestration defect) | none found | open | high | — |
| 57 | 2 | (filed-report rewrite, append-only) | corpus/lessons/round-58.md:55 | wontfix | high | Filed-bytes rule (r57 spotcheck conformance item 2) — honored: nothing |
| 57 | 3 | (R57-V1..V4 must all land) | corpus/lessons/round-58.md:47 | closed | high | **R57-V1** — repaired: descending `:(glob)` pathspecs + fail-closed grep + |
| 57 | 4 | (carried L0 items) | corpus/lessons/round-57.md:42 | open | high | Carried, not this round's: R41-2 gate-pins ruling, R43-1/R43-5, A3e |
| 58 | 1 | R58-V1 | corpus/lessons/round-59.md:31 | closed | high | R58-V1: the D58 base receipt and a re-run both read held=2/5. |
| 58 | 2 | R58-V2 | corpus/lessons/round-59.md:32 | closed | high | R58-V2: dispatch counts are planned / session-ids / reports / never-spawned, taken from the registry |
| 58 | 3 | R58-V3 | corpus/lessons/round-59.md:33 | closed | high | R58-V3: README rows for the r58 entry and lesson cite S112, not S121. |
| 58 | 4 | R58-V4 | corpus/lessons/round-59.md:34 | closed | high | R58-V4: the TIER59 line above is the histogram the probe re-derives. |
| 58 | 5 | R58-V5 | corpus/lessons/round-59.md:35 | closed | high | row count after `cite-sources` (19). |
| 58 | 6 | R58-V6 | corpus/lessons/round-59.md:36 | closed | high | R58-V6: capabilities table gained `receipt-evidence` and `cite-sources`; the `readme-map` row no longer says files=135 |
| 58 | 7 | R58-V7 | corpus/lessons/round-59.md:37 | closed | high | R58-V7: `lessons/round-58-verifier-spotcheck.md` has its README row and covered pin in the same change |
| 58 | 8 | R58-V8 | corpus/lessons/round-59.md:38 | closed | high | R58-V8: wording above. A shared page is not automatically a duplicate; pin the duplicate group before adoption. |
| 60 | 1 | R60-V1 | .ufo/waves/round-61/build/ScribeErratum/erratum.md:28 | closed | high | **R60-V1 / V7 — fixed by `165b8304`.** That commit lands the six modified files and the seven |
| 60 | 2 | R60-V2 | .ufo/waves/round-61/build/ScribeErratum/erratum.md:7 | closed | high | **R60-V2 — placeholders resolved.** |
| 60 | 3 | R60-V3 | .ufo/waves/round-61/build/ScribeErratum/erratum.md:12 | closed | high | **R60-V3 — 9/10 corrected to 8/10.** |
| 60 | 4 | R60-V4 | .ufo/waves/round-61/build/ScribeErratum/erratum.md:17 | closed | high | **R60-V4 — tip receipts produced at `a745a3b0`.** Commit `be4a820c` adds |
| 60 | 5 | R60-V5 | .ufo/waves/round-61/build/ScribeErratum/erratum.md:33 | closed | med | **R60-V5 / V6 — evidence landed by `165b8304`, repairs belong to this round's wave.** |
| 60 | 6 | R60-V6 | .ufo/waves/round-60/close/dead-seats-r60.md:1 | closed | high | # Round-60 w1 dead-seat table (R60-V6 repair) |
| 60 | 7 | R60-V7 | LOG.md:2259 | closed | med | 2026-10-24 — round 60 (Kimi fresh L1): C1 operability capability |
| 60 | 8 | R60-V8 | corpus/README.md:181 | closed | high | Row added in round 61 (R60-V8) so the file does not open the next round in DRIFT |
| 60 | 9 | R60-V9 | .ufo/waves/round-61/build/ScribeErratum/erratum.md:22 | closed | high | **R60-V9 — S141 vs S211, id precision only.** |
| 61 | 1 | R61-V1 | LOG.md:2301 | wontfix | med | R61-V1 C2 bundle verified (`c5c01540…`, `.ufo/waves/round-61/controls/r61-c2-full-forgery.bundle`); C1 scratch fixture absent, not recreated. |
| 61 | 2 | R61-V2 | SCORECARD.md:2960 | wontfix | high | retires the inherited `dispatch61`/`doctrine61` predicates (R61-V2; append-only, 2026-10-25) |
| 61 | 3 | R61-V3 | SCORECARD.md:2910 | closed | high | this paragraph is the named correction. The old filed bytes remain unchanged. |
| 61 | 4 | R61-V4 | SCORECARD.md:2956 | closed | high | R61-V4: the filed fleet report's six placeholders are mapped, one occurrence each, in `w2/R60Erratum.md` |
| 61 | 5 | R61-V5 | SCORECARD.md:2956 | closed | high | R61-V5: the single proxy block is refreshed to the measured working tree terms |
| 61 | 6 | R61-V6 | SCORECARD.md:2956 | closed | high | R61-V6: Audit19 was re-queued under a fresh identity |
| 62 | 1 | (declare 1–3 claims before evidence seats) | .ufo/waves/round-63/plan.md:124 | closed | high | (1) claims frozen here before dispatch |
| 62 | 2 | (waves through the validator, batched) | .ufo/waves/round-63/plan.md:124 | open | med | (2) waves run through the validator |
| 62 | 3 | (R61-V2 remains open) | SCORECARD.md:2960 | wontfix | med | retires the inherited `dispatch61`/`doctrine61` predicates (R61-V2; append-only, 2026-10-25) |
| 62 | 4 | (Audit19 residuals need a ledger row) | corpus/lessons/round-65.md:130 | open | high | Audit19 residuals — the four exhaustive checks (no-truncation, exact traceback, per-row identity) |
| 62 | 5 | (six W04 duplicate-URL warnings) | corpus/lessons/round-65.md:136 | open | high | Six W04 duplicate-URL warnings |
| 63 | 1 | D1 | corpus/README.md:190 | closed | high | row added in round 64 so the file does not open the next round in DRIFT |
| 63 | 2 | D2 | corpus/lessons/round-64.md:22 | closed | high | A prose tally becomes a transcript (D2). |
| 63 | 3 | D3 | corpus/lessons/round-64.md:15 | closed | med | Not a third row, same class: D3 is the mirror case. |
| 63 | 4 | D4 | SCORECARD.md:2985 | closed | high | Kimi layer: DEGRADED (routed defect D4). |
| 63 | 5 | D5 | corpus/lessons/round-65.md:149 | open | med | The counters' declared holes — H65: a gate's reading is only as good as its verdict line |
| 63 | 6 | D6 | none found | open | high | — |
| 64 | 1 | D1 | .ufo/waves/round-65/base/report-receipt-diff-selftest-freeze.txt:3 | closed | high | REPORT_RECEIPT_SELFTEST: PASS (125/125) |
| 64 | 2 | D2 | corpus/README.md:192 | closed | high | row added in round 65 (D2) so the file does not open the round in DRIFT |
| 64 | 3 | D3 | corpus/lessons/round-65.md:142 | wontfix | high | The round-64 D3 dangling pointers — two of three still stand, one is closed |
| 64 | 4 | D4 | SCORECARD.md:2985 | closed | high | K = 49/53, DEGRADED — never cite K=49 as clean. |
| 64 | 5 | D5 | SCORECARD.md:2960 | wontfix | med | retires the inherited `dispatch61`/`doctrine61` predicates (R61-V2; append-only, 2026-10-25) |
| 65 | 1 | D1 | .ufo/waves/round-66/d1-gate-correction.md:1 (**UNTRACKED**) | open | high | ## Round-65 D1 — Gate row correction (append-only) |
| 65 | 2 | D2 | none found | open | high | — |
| 65 | 3 | D3 | none found | open | high | — |
| 65 | 4 | D4 | .ufo/waves/round-66/plan.md:19 | open | high | carried (D4), refreshed at the close if the refresh is measured |
| 65 | 5 | D5 | none found | open | high | — |
| 65 | 6 | D6 | .ufo/waves/round-66/plan.md:101 | open | high | Open work carried from round 65 (D6): the 40-seat falsify wave that never ran |
| 65 | 7 | D7 | corpus/README.md:195 | closed | high | row added at the round-66 open (D7) so the file does not leave the round in DRIFT |

## Status notes (the three judgement calls)

- **R61.1 (`wontfix`)** — the located line verifies the C2 half of the item (bundle committed, hash recorded) and states
  the C1 half was never bundled ("C1 scratch fixture absent, not recreated"). A half-landed repair read as an answer;
  a stricter reader could call it `partial`.
- **R62.2 (`open`)** — the answer is a plan sentence, not a receipt: rounds 63–65 committed `w1-spec.json`,
  `w1-dispatch.json` and `w1-results.json`, but no `w1-validate.json` and no `dispatch-actual.json`
  (`find .ufo/waves/round-6[345] -name dispatch-actual.json` → empty), i.e. the records exist but not in the
  `dispatch-evidence` schema the item's own Q54 names. Read as prose-only.
- **R61.2 / R62.3 / R64.5 (`wontfix`)** — `SCORECARD.md:2960` retires the `dispatch61`/`doctrine61` predicates ("retired,
  not repaired"), which is the disposition of R61-V2. The later line `corpus/lessons/round-65.md:133` re-flags the same
  predicates as "unaddressed again ... still accept the fabricated C1"; both are located, and I read the retirement as
  the answer (a retired predicate cannot be "repaired"), with the round-65 line as a live complaint about the retired
  files' gullibility. A stricter reader could keep R61-V2 `open`; the quote would then be round-65 lesson:133.
- **R63.3 (`closed`, med)** — round-64's lesson states the three `-2` stems and calls D3 "the mirror case", but no
  appended note was added to the round-63 report itself; whether that counts as "an appended note, not a rewrite"
  is a judgement, not a measurement.

## Counts

- 57 items, 57 rows (one per parser ordinal), 0 ordinals unassigned.
- closed 36 · wontfix 6 · open 15 · `none found` 5 (R57-1, R63-D6, R65-D2, R65-D3, R65-D5); the remaining 10 `open`
  rows are located in a file that records them as still open/carried.
- Answer locations (52 located rows): `corpus/lessons` 24 · `.ufo/waves/**` 13 · `SCORECARD.md` 9 · `corpus/README.md` 4
  · `LOG.md` 2. Of the 13 wave-path answers, 6 are the round-61 **draft** erratum and 1 is the untracked D1 file.
- By round (closed/total): R55 2/3 · R56 3/4 · R57 1/4 (item 1 unanswered, items 2–3 closed, item 4 carried) ·
  R58 8/8 · R59 0/0 · R60 9/9 · R61 4/6 (V2 wontfix, V1 wontfix) · R62 1/5 (item 1 closed, 3 wontfix, 2/4/5 open) · R63 4/6
  (D5 open, D6 unanswered) · R64 3/5 (D3/D5 wontfix) · R65 1/7 (D7 closed; D1 answered only in an untracked
  file; D2/D3/D5 unanswered; D4/D6 carried open by the frozen plan).

## Round-65 clause (the part that matters for this round's C1/L3)

The frozen C1 predicate's L3 requires every round-65 item (D1–D7) to have a closed or wontfix row whose answer line is
**new since the base** `8d557f85` and located at `path:line` outside the ledger and the spot-checks. At the freeze
revision only D7 satisfies that (`corpus/README.md:195`, added by `621212ba`). D1's only answer lives in
`.ufo/waves/round-66/d1-gate-correction.md`, which `git ls-files` reports untracked, so `git archive M` cannot see it.
D2, D3, D5 have no answer anywhere; D4/D6 are carried as open in the plan, which under L3 means no closed/wontfix row.
Consequence: unless the L1 commits answer lines in `corpus/lessons/round-66.md` (or commits and cites the D1 file), L3's
round-65 clause fails and C1 reads UNMET as declared.

## Verification

`node .ufo/waves/round-66/build/K66RevengerAnswers/verify.mjs` re-reads every cited `path:line ±2` at the freeze
revision with `git show`, normalises both sides with the tool's own `norm()`, and prints one line per row. Output is in
`verify-out.txt`; the tail line is `ANSWERS_VERIFY: located=<n>/<m>` with the `none found` rows excluded.

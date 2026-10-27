# K68ScribeLedgerD — routed-ledger rows for rounds 64 and 65 (paste-ready)

Seat `K68ScribeLedgerD`, wave w1, round 68. Twelve rows: round 64's five routed items (D1–D5 — the
dispatch blurb says "D1–D7", but the frozen counter's own fence-aware parser and the committed v1 tool
both read **5** items in `corpus/lessons/round-64-verifier-spotcheck.md`) and round 65's seven (D1–D7).
Item ordinals come from the frozen counter's `items67()` (verbatim copy in scratch, output pasted in
`answers-evidence.md`), cross-checked against the v1 tool's `routedItems()` — both read `r64=5 r65=7`.

Paste the section below into `corpus/routed-ledger.md` after the sibling scribes' `## Ledger` header row
(ids `R64-*`/`R65-*` are unique across the union; a row's `round` is the spot-check the item lives in,
never the round that answers it).

## Ledger

| id | round | item | quote | class | status | answer |
|---|---|---|---|---|---|---|
| R64-D1 | 64 | 1 | "unreceipted selftest tally" | verification-gap | closed | `.ufo/waves/round-65/base/report-receipt-diff-selftest-freeze.txt:3` — "REPORT_RECEIPT_SELFTEST: PASS (125/125)" |
| R64-D2 | 64 | 2 | "README row for this file" | reference-drift | closed | `corpus/README.md:192` — "row added in round 65 (D2) so the file does not open the round in DRIFT" |
| R64-D3 | 64 | 3 | "D3 — dangling pointers" | dangling-pointer | open | - |
| R64-D4 | 64 | 4 | "Kimi layer DEGRADED K=49/53" | carried-unaddressed | open | - |
| R64-D5 | 64 | 5 | "R61-V2 and the Audit19 residuals are listed as open items" | carried-unaddressed | open | - |
| R65-D1 | 65 | 1 | "Gate row table contradicts the registry" | citation-integrity | closed | `.ufo/waves/round-66/d1-gate-correction.md:11` — "These rows are copied from corpus/SOURCES.md S204–S206" |
| R65-D2 | 65 | 2 | "capability row missing" | registry-home | open | - |
| R65-D3 | 65 | 3 | "SKILL.md has no rows for harm-matrix / omp-binary-probe" | registry-home | open | - |
| R65-D4 | 65 | 4 | "proxy stanza stale" | reference-drift | wontfix | `corpus/lessons/round-65.md:158` — "carried, not harmed" |
| R65-D5 | 65 | 5 | "errors 1545 → 1637 (+92) across two new files" | report-fidelity | closed | `.ufo/waves/round-66/w1/K66ExecCiteCheckD5.md:19` — "base 0 M 59 freeze 58 delta_M +59" |
| R65-D6 | 65 | 6 | "round size / wave 2" | wave-shape | open | - |
| R65-D7 | 65 | 7 | "README row for this file" | reference-drift | closed | `corpus/README.md:195` — "row added at the round-66 open (D7) so the file does not leave the round in DRIFT" |

Counts: 12 rows for 12 items; `open=6 closed=5 wontfix=1`; 8 distinct classes
(`verification-gap`, `reference-drift`×3, `dangling-pointer`, `carried-unaddressed`×2,
`citation-integrity`, `registry-home`×2, `report-fidelity`, `wave-shape`).

## Integrator notes

- **Classes** are the canonical slugs of round-66 seat `K66ScribeClasses`
  (`.ufo/waves/round-66/build/K66ScribeClasses/table.md`, 57 rows over rounds 55–65); every one of these
  twelve rows matches that table's slug for the same item — no re-slugging was introduced here.
  `reference-drift` is the class that carries L3's `>= 4 distinct spot-check rounds` clause in the union
  (rounds 56, 58, 60, 61, 63, 64, 65 = 7); see `answers-evidence.md` § Class-span.
- **Statuses are honest, not decorative.** Five items have a located answer; one (`R65-D4`) is the
  disposition the spot-check itself recorded ("carried, disclosed"); six carry `open` because the named
  work is still unlanded at the round-68 freeze (each `open` has its reproducing command in
  `answers-evidence.md`). Flip instructions:
  - `R64-D3` → closed when the round-64 `CHANGES-AFTER-FREEZE.md` pointer to `close/supplementary-c2.txt`
    is corrected (appended correction) or the receipt is committed.
  - `R64-D4` → closed when `kimi-census` reads CLEAN with the governed universe restored/retired
    (`SCORECARD.md:2985` currently says "never cite K=49 as clean").
  - `R64-D5` → closed when a `dispatch61`/`doctrine61` forgery control kills the fabricated C1 and the
    Audit19 exhaustive checks have a transcript.
  - `R65-D2` → closed when `SCORECARD.md` `## Capabilities` gains a first-cell `harm-matrix` row
    (L6-style test; 19 data rows today, none first-cell `harm-matrix`).
  - `R65-D3` → closed when `SKILL.md` carries registry rows for `harm-matrix` / `omp-binary-probe` and
    `pin.harm-matrix` / `pin.omp-binary-probe` exist.
  - `R65-D6` → closed when a round inside the 64–100 band also dispatches the falsify wave (round 66
    met the band with 66 seats but ran no second wave; round 68's plan declares one v2 wave with attack
    seats ≥ 25%, which is not yet dispatch evidence).
- **`R65-D1` residual (named, not hidden).** The correction is committed but lives at
  `.ufo/waves/round-66/d1-gate-correction.md`, not "appended in the round-66 lesson" as the item asked;
  its own line 11 says so. The row is `closed` on the substance (per-row S204–S206 URL/date/quote +
  capture identity), and the location divergence is reported as a finding, not papered over.
- **`R65-D5`** the answer line quotes one file's per-file delta; the full split is at lines 19–23 and the
  `ADDED=99 REMOVED=7 NET=92` set-diff at line 25 of the same committed report. The item asked to
  "attribute the 92 to files and fix or explain" — attributed; the measured patch was **not** applied.
- **Do not renumber** `R65-*` to avoid the round-66 draft's ids: that draft never landed a
  `corpus/routed-ledger.md`, so `R65-D1..D7` are free at the round-68 base
  (`test -e corpus/routed-ledger.md` → absent).
- **`K66ScribeClasses/table.md` is a 5-cell classification index, never a ledger source.** It already
  indexes the same (round,item) pairs this file covers (its rows 48–52 = r64, 53–59 = r65, 5 cells, no
  answer column). If the L1 splices that index in beside these rows, every r64/r65 item carries two
  non-open rows and L3 fails `contradictory-coverage`; the shipped v1 tool has no uniqueness arm and would
  read the duplicate CLEAN. Same hazard for `K68ScribeLedgerB`'s r58/r60 rows.


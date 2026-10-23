RESULT ReviewErrataFrag verdict=APPROVE-WITH-NITS findings=0-defects nits=3

# Review of build/ScribeErrata.md — errata accuracy

Scope: every "Wrong words" quote checked byte-exact at the cited line; every "Corrected"
claim checked against the cited receipt. Sources: filed report
`/home/vgpnk/Projects/shokunin/.ufo/reports/round-47/kumitate.md` (read-only),
`kumitate-shokunin/SCORECARD.md`, `.ufo/waves/round-47/plan.md`,
`.ufo/waves/round-47/probe/receipts/a2-controls.txt`, `a2-ctl-retparse2.txt`,
`.ufo/waves/round-47/falsify/`, `corpus/lessons/round-47-verifier-spotcheck.md`,
plus two read-only `git log` runs reproducing the draft's audit block.

## Bullet 1 — A2 control results (report:11, SCORECARD.md:2083–2084): APPROVE

- Report quote: `kumitate.md:11` contains “Every control was re-scored under A2: all
  read 0/5 (`probe/receipts/a2-controls.txt`)” — the draft's quote is the leading
  sentence, byte-exact for the span it quotes.
- Scorecard locator exact: `SCORECARD.md:2083–2084` carries the claim.
- Corrected claim receipt-backed:
  - `a2-controls.txt:31,39,47,55,63,71,79,87,95,103,111,119,127` — all 13 lines
    confirmed `held=0/5 rule=A2` (envcaps at :31 plus the twelve wave-1 controls;
    the only other CAPROUTE_PROBE lines are base :7, freeze :15, calib :23).
  - `a2-ctl-retparse2.txt:6` reads `held=3/5 rule=A2` exactly as claimed.
  - `a2-controls.txt:23` reads `held=1/5` for rev `d066e8cc`, K488 ROUTED_HELD and the
    other four MISS — the K488-only calibration fixture per `plan.md:114`; excluding
    it from the control count is correct.
  - Arithmetic checks: 13 zeroed sections in `a2-controls.txt` + retparse2's 3/5 =
    the "fourteen controls" the Scorecard counts.
- NIT 1 (quote fidelity, not substance): the Scorecard quote drops the source's
  backticks around `probe/receipts/a2-controls.txt` and `a2-ctl-retparse2.txt` and
  normalizes the hard line-wrap inside "under\nA2". Under a byte-exact "Wrong words"
  standard the quote should either keep the markup or be marked normalized.
- NIT 2 (trivial): "each end `held=0/5`" — the cited lines end `held=0/5 rule=A2`;
  `held=0/5` is the penultimate field.

## Bullet 2 — re-open coverage (report:76): APPROVE

- Quote byte-exact: `kumitate.md:76` reads “All 16 new rows were re-opened by
  non-authors, 12 of them with reports.”
- Corrected claim backed: `falsify/` contains exactly the 13 cited artifacts
  (S080–S083, S085–S090, S093–S095); a filesystem-wide find confirms no
  ReopenS084/S091/S092 report under round-47 (the `round-48/build/ReopenS08*.md`
  drafts are this round's new work and outside the cited trail). Verifier's explicit
  finding confirmed at `round-47-verifier-spotcheck.md:190`: "S084, S091 and S092
  have no re-open report."
- All 13 `…:1` receipts verified: each file's line 1 is a `RESULT ReopenS0xx` line
  (grep-checked individually).
- The soft flag on the report's separate "12 of them with reports" count is
  calibrated correctly: with the committed S088 report the inventory is 13, and the
  draft hedges rather than over-claiming the count's falsity — appropriate given the
  report text and the artifact landed in the same record commit.
- The hedged "the evidence does not support 16/16" is exactly what R47-2 routes
  (verifier:190); the draft does not over-claim that the three re-opens never ran.

## Bullet 3 — S088 cancellation/report conflict (report:105): APPROVE

- Both quotes are byte-exact substrings of `kumitate.md:105` (“ReopenS084/S088/S091/S092”;
  “Their reports are not cited”). "Wrong words in context" labeling is honest.
- Receipt byte-exact: `falsify/ReopenS088.md:1` reads
  `RESULT ReopenS088 rev=269dadb6 verdict=HOLDS row=S088 supersedes-S054-confirmed`.
- Committed in `67ebb32d`: verified independently —
  `git log -- .ufo/waves/round-47/falsify/ReopenS088.md` returns exactly
  `67ebb32d` (the record commit).
- Corrected claim is the right calibration: it preserves the artifact fact, names the
  report-vs-artifact conflict, and explicitly declines to resolve the seat's
  cancellation timing — matching the routed defect "reconcile which is true"
  (verifier:191–192) without inventing a resolution.

## Bullet 4 — A1/A2 amendment timestamps (plan:86,118): APPROVE

- Locators exact: `plan.md:86` heading carries `~10:45Z`; `plan.md:118` carries `~10:55Z`.
- Commit timestamps verified independently (read-only `git log -- %cI`):
  `796b49b4` = `2026-10-23T07:13:45-03:00` = 10:13:45Z (A1);
  `8de35e79` = `2026-10-23T07:40:32-03:00` = 10:40:32Z (A2). Both headings
  postdate their commits — direction of the error is as claimed.
- NIT 3 (trivial): the draft wraps the times in backticks inside its quotation
  marks (“`~10:45Z`”); the plan source has no backticks. Same quote-fidelity class
  as NIT 1 — formatting added inside a quote.
- Audit block reproduces: the draft's two `git log` commands, run verbatim, return
  exactly the recorded output (three plan.md commits; one ReopenS088.md commit).

## Coverage check

The draft covers every misstatement the verifier spot-check routed under R47-2
(§7: report:11/SCORECARD controls claim, report:76 coverage claim, report:105 S088
conflict) and R47-3 (plan:86/118 future-dated headings). No routed misstatement is
left unerrata'd; no extra corrections were invented.

## Nits (advisory; none change a verdict)

1. Quote fidelity (bullet 1): backticks dropped + line-wrap normalized in the
   Scorecard quote. Fix: quote with original markup, or append "(markup normalized)".
2. Wording (bullet 1): "each end `held=0/5`" → "each reads `held=0/5 rule=A2`" or
   "each carries `held=0/5`".
3. Quote fidelity (bullet 4): backticks added around `~10:45Z`/`~10:55Z` inside the
   quote; the plan source is unquoted plain text.

## Verdict

**APPROVE** all four bullets — every correction is receipt-backed and every cited
locator resolves; recommend the L1 land the errata draft, optionally fixing the
three quote-fidelity nits above in flight.

No tools installed or updated. All file access read-only; both git commands read-only.
The only lane write is this report.

Report: .ufo/waves/round-48/r48/ReviewErrataFrag.md

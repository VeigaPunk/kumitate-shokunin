# R65-D1..D7 — ledger rows (round 66, wave w1, seat K66ScribeLedger65)

Merge the `## Ledger` section below into `corpus/routed-ledger.md` (contract `kumitate-routed-ledger-v1`), together
with the rounds 55..64 rows from the sibling scribe seats; ids must stay unique across the whole table. The seven
`item` ordinals were produced by the tool's own `routedItems()` on
`corpus/lessons/round-65-verifier-spotcheck.md` (7 items, 1..7 in file order); `answer` lines are located in
`answers.md` (this directory) or in the receipt each row names. Every quote is <= 25 words, verbatim from its item.
Round = the spot-check round the item lives in (65), never the round that answers it.

## Ledger

| id | round | item | quote | class | status | answer |
|---|---|---|---|---|---|---|
| R65-D1 | 65 | 1 | "Gate row table contradicts the registry" | citation-integrity | closed | `.ufo/waves/round-66/build/K66ScribeLedger65/answers.md:10` — "Gate record for S204-S206 carries URL, access date and capture-located quote" |
| R65-D2 | 65 | 2 | "capability row missing" | registry-home | closed | `.ufo/waves/round-66/build/K66ScribeLedger65/answers.md:19` — "Capability row for harm-matrix drafted in full below" |
| R65-D3 | 65 | 3 | "SKILL.md has no rows for harm-matrix / omp-binary-probe" | registry-home | closed | `.ufo/waves/round-66/build/K66ScribeLedger65/answers.md:24` — "Gate-registry rows for harm-matrix, omp-binary-probe and routed-ledger drafted below" |
| R65-D4 | 65 | 4 | "proxy stanza stale" | reference-drift | wontfix | `.ufo/waves/round-66/base/proxy-before.txt:8` — "A_DRIFT term=A declared=351 computed=455 delta=+104" |
| R65-D5 | 65 | 5 | "errors 1545 → 1637 (+92) across two new files" | report-fidelity | wontfix | `.ufo/waves/round-66/build/K66ScribeLedger65/answers.md:40` — "cite-check-fleet-dot growth is confined to two round-65 receipt files" |
| R65-D6 | 65 | 6 | "round size / wave 2" | wave-shape | closed | `.ufo/waves/round-66/w1-dispatch.json:17` — ""spawn": 66" |
| R65-D7 | 65 | 7 | "README row for this file" | reference-drift | closed | `corpus/README.md:195` — "row added at the round-66 open (D7) so the file does not leave the round in DRIFT" |

## Notes for the integrator

- **Classes** — the canonical 13-slug set of seat `K66ScribeClasses` (`.ufo/waves/round-66/build/K66ScribeClasses/
  classes.md`, which classifies all 57 items): `citation-integrity` (D1), `registry-home` x2 (D2, D3), `reference-drift`
  x2 (D4, D7), `report-fidelity` (D5), `wave-shape` (D6) — five distinct classes, every one of them in that set. The
  seat's ruling on this seat's first draft: D1 is `citation-integrity` (the `## Gate` table maps S204/S205/S206 to
  documents SOURCES does not hold; the fix is the id→document record), D4 is `reference-drift` (the stale proxy stanza is
  the defect, A/C2 are its terms), D5 is `report-fidelity` (a measured regression went unmentioned), D6 is `wave-shape`
  (band, claim block and wave-2 failures share one preflight fix) and `census-warning` / `round-size` were dropped as
  1-round families splitting defects that share a fix. Under that set the recurrence arithmetic over rounds 55..65 is
  `reference-drift` rounds=7 (56,58,60,61,63,64,65) and `wave-shape` at exactly 4 — D6 is what puts `wave-shape` on the
  RECURRENT line, which the classes seat flagged for the L1 to accept or re-baseline.
- **D1** — the Gate record is re-derived, not copied: each of S204/S205/S206 was read in its committed capture under
  `.ufo/waves/round-65/build/Capture/` and its sha256/byte count compared with `.ufo/pins/source-captures.json`
  (`479aef6d…`/14975, `0598c9f2…`/12774, `41ad7d5b…`/33157 — all equal). A pipe-free variant of the `.ufo/waves/
  round-66/d1-gate-correction.md` rows, which cannot be a ledger answer quote because a Gate table row contains `|`.
- **D2/D3 status** — `closed` stands on the answer artifact (the row text in `answers.md`), because the row's home
  (`SCORECARD.md` `## Capabilities`, `SKILL.md` `## Gate registry`) is the L1's write scope, not this seat's. If the
  L1 lands the rows, re-anchor the two answers to the landed lines (they read better and are not build artifacts):
  `grep -n 'harm-matrix' SCORECARD.md | grep Capabilities` — no, use `node .ufo/waves/round-66/build/K66ScribeLedger65/
  reanchor.mjs` after the edit; it prints `path:line` plus a <=25-word quote for every candidate row. If the rows do
  not land, flip both to `open` (`-`) rather than leave a closed row pointing at a draft.
- **D5** — `wontfix` = the wave-ordered placeholder (the attribution is another seat's measurement). When
  `K66ExecCiteCheckD5` files its receipt, flip the row to `closed` with that receipt's `path:line` and its
  attribution sentence; the paragraph in `answers.md:40` names the owner and the pending receipt.
- **D4** — `wontfix` is the disposition the spot-check itself recorded ("carried, disclosed"); the answer line is the
  base receipt's verdict line, not a repair claim. If `K66ExecProxyStanza` refreshes the stanza, flip D4 to `closed`
  with its refresh receipt and keep the base line quoted in the lesson.
- **D6** — the `"spawn": 66` quote contains double quotes; the answer regex reads it correctly (verified with the
  tool at `--from 65 --to 65`), but if a reviewer prefers, `plan.md:106` — "One v2 wave (policy
  `ufo-wave-policy-v2.json`, band 64–128)" — is an equally located alternative.
- **L3 newness** — every answer target is new since the base `8d557f85312de4fcc82e09ff735d21436bc3746d`:
  `answers.md`, `w1-dispatch.json` and `base/proxy-before.txt` are absent there; `corpus/README.md` exists there but
  carries 0 occurrences of `round-65-verifier-spotcheck`, so the quoted sentence is new.

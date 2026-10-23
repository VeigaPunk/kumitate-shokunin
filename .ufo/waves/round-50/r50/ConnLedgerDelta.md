# ConnLedgerDelta — r48↔r49 Gate-ledger delta audit + sibling shape cross-check

Axes: coverage (lesson/corpus conformance) and quality/discernment (the gate ledger is the discernment record).
Seat: connector. Read-only on the lane and all siblings; no files mutated, no tools installed (nothing needed
installation). I attacked one question: **what did a conforming `## Gate` ledger contain in r48 that r49 lacked,
and is the r48 shape the fleet norm?**

## The contract (frozen at fleet level)

- `/home/vgpnk/Projects/shokunin/CORPUS.md:19` — "each `lessons/round-<N>.md` carries a `## Gate` section
  (candidates, admitted, rejected with reasons, spot-check result)."
- `/home/vgpnk/Projects/shokunin/LEARNING.md:69` — "`corpus/lessons/round-<N>.md` — carries a `## Gate` section:
  candidates considered, admitted, rejected (with reasons), and the spot-check result."
- `CORPUS.md:113` (rule 1) — for every new row the Gate records URL, access date, ≤25-word located quote
  grounding `teaches`; non-author verification re-opens a sample.
- `LEARNING.md:43-47` — each round a non-author spot-checks ≥1 admit and ≥1 reject and records agree/disagree
  with reason **in the round's lesson**.

Four required elements: **candidates / admitted / rejected / spot-check result**.

## r48's Gate (the conforming baseline) — `corpus/lessons/round-48.md:12-24`

```
12:## Gate
14:### Candidates     — S098 with URL, opened-this-round provenance, byte-exact verification named
                         (r48/ReopenS098.md HOLDS, r48/ReviewSources.md CONFORMS), ruling
                         "Admitted, tier A, status mined", used-by paths
18:### Admitted        — S098 + re-open reports S084/S091/S092 landing HOLDS (verified r48/ReviewReopens48.md);
                         S088 ruling r48/ReconcileS088.md (HOLDS)
22:### Rejected        — "None this round."
```

What r48 got right vs the contract: the three decision subsections, per-candidate provenance (who opened,
who verified, receipts), and explicit zero-reject. What r48 itself was missing (stated honestly for the delta):
no in-lesson spot-check-result line — `grep -n 'spot-check' corpus/lessons/round-48.md` hits only Mistake 2
(:8, about r47). The r48 spot-check exists as a separate file (`corpus/lessons/round-48-verifier-spotcheck.md`,
whose §3 samples the S098 admit: agree; reject sample n/a — "Zero-reject rounds give the outside check a thin
reject sample; routed as an observation"). So r48 = 3 of 4 elements in-lesson, spot-check one hop away by filename
convention; the r48 spot-check even noted the thin reject sample without demanding a lesson edit.

Evolution check (kumitate r42-r48, `grep -n '^## Gate' corpus/lessons/round-4*.md`): r42/r43/r44 carry
`## Gate — admits and rejects`; r45 (:17), r46 (:18), r47 (:22), r48 (:12) carry `## Gate`. Every round
r42-r48 has one; **r49 is the first regression in the streak** — the section disappears entirely.

## r49's actual lesson — `corpus/lessons/round-49.md` (45 lines total)

`grep -n '^## ' corpus/lessons/round-49.md` → only `## Mistakes` (:7) and `## Frontier — SOURCES` (:35).
Gate-relevant content survives only as flat Frontier bullets:

- :37 "S099 admitted" — full provenance (URL, opened 2026-10-23, sha256, tier A, mined, located 15-word quote,
  field-(5) locator, used-by). This satisfies CORPUS.md:113's row content *as a row record*, but it is filed
  under Frontier, not under a gate decision.
- :43 "Re-opened, no cell changed: S095, S098 … re-open receipts in the round report" — the re-opens were gate
  candidates (seats `ScribeReopenS095`/`ScribeReopenS098` are in `.ufo/waves/round-49/r49-spec.json`), and the
  "re-open receipts in the round report" pointer is **false**: the spot-check §5 item 3 found no committed
  re-open artifact under `.ufo/waves/round-49/` (routed defect 3 = R50-3).
- :45 "Rejected this round: none." — a reject *record* exists as a bullet but not under a Rejected heading,
  and it names no reasons slot at all (acceptable for a zero-reject round only inside a ledger that exists).

## The delta table

| Contract element | r48 (:12-24) | r49 | r49 status |
|---|---|---|---|
| `## Gate` heading | present | absent (only Mistakes + Frontier — SOURCES) | **missing** — routed defect 2 (R50-2) |
| Candidates considered | `### Candidates` with provenance + verification receipts per candidate | flat Frontier bullet; S095/S098 re-opens collapsed into one line with a false receipt pointer | **missing as candidates**; re-opens unverifiable (R50-3) |
| Admitted | `### Admitted` with ruling + tier + used-by | S099 bullet carries the substance but no gate-decision framing | partially present, misfiled |
| Rejected (with reasons) | `### Rejected` — "None this round." | "Rejected this round: none" as a Frontier bullet | present-in-substance, misfiled |
| Spot-check result in lesson | absent in r48 too (file-by-convention) | absent; worse — the spot-check *disagreed* with the report's "discernment — improved" over exactly this absence (`round-49-verifier-spotcheck.md:107-109`) and routed it | **missing and load-bearing**: the disagreement is unrouted from the lesson |
| Discernment trend consequence | spot-check §4 "discernment — improved" | spot-check §4 "discernment — unchanged … narrative" | the missing ledger cost the round its claimed discernment uplift |

Net: r49 kept roughly 40% of the gate *content* (S099's provenance + a none-reject line) but lost 100% of the
gate *structure* — the heading, the candidate/admitted/rejected decisions, and any spot-check slot. Per
LEARNING.md's own trend table, that is precisely the "a disagreement is left unlearned" harm row.

## Sibling cross-check (read-only, newest lesson per lane)

All five sampled siblings carry a `## Gate` in their newest lesson — r49 is out of family:

| lane | newest lesson | Gate loc | shape |
|---|---|---|---|
| mado | `round-27.md` | :17 | table: id / source path@rev / URL / access date / located quote ≤25w (S178-S182), plus old→new used-by log |
| mori | `round-37.md` | :3 | candidates table with inline **decision** column (S221-S225 all admitted, "Rejected: none new" + limit note) + **"Gate notes for non-author verification"** — closest to the full contract; verification notes live inside the section |
| chousa | `round-35.md` | :43 | rows added (S067/S068) with located quotes + file SHA-256 + sourced-claim mapping |
| kama | `round-30.md` | :26 | table: S### / source@rev / accessed / located quote / opened-by + status line + census delta |
| kake | `round-43.md` | :10 | sources opened with **decision** column (S129/S130 admit, "rejections: none") + row-change log |

De facto fleet norm: candidates with URL/accessed/quote/locator and an inline decision, admits, rejects
("none" legal), and the spot-check kept as the paired `round-<N>-verifier-spotcheck.md` file — mori r37 is the
only one that also folds non-author-verification notes into the section itself. Kumitate r48 matches the norm
(3 subsections, spot-check by convention); kumitate r49 matches none of it.

## What the r50 addendum must restore (mapped to the frozen counter)

The frozen `repairs50-probe.mjs:61-66` R1 check extracts the text after a `^## Gate$` heading in
`corpus/lessons/round-49.md` and requires the lowercase words `candidates`, `admitted`, `rejected`,
`spot-check` to all appear. The addendum (R50-2, plan.md:16-18) therefore must, at minimum: (1) create the
heading; (2) carry the four subsection words; (3) list candidates = S095 re-open, S098 re-open, S099 new
(r49-spec.json names the two re-open seats); (4) admit S099, hold the two re-opens pending the R50-3 receipts
(`ReopenS095.md`/`ReopenS098.md` — both now landed under `.ufo/waves/round-50/r50/`, so the L1 can convert the
holds to rulings); (5) record "no SOURCES row rejected" plus the round's two real control rejects (doctored C2
receipt; K4-K6 mutants) with the spot-check's agree/disagree; (6) cite the spot-check file path explicitly —
the r48 lesson shows the bare-heading shape already starves the outside sample, and the r49 spot-check asked
for its path to be recorded. This matches the draft blocks produced by `ExecGateLedger.md` (audit + exact
append) and `ScribeGateLedger49.md` (lesson text); my delta audit independently confirms their required
content against r48's precedent and the sibling norm, and adds the connector note below.

## Connector notes (second-order)

1. **Do not let R50-2 repeat r48's thinness.** The frozen R1 word check would pass a ledger with the four words
   and no substance (RevRepairsSemantics's territory). r48's own spot-check flagged the zero-reject thin sample
   as an observation; the r49 addendum has real rejects available (the D49 doctored-receipt control and the
   B49 K4-K6 mutant rejects the spot-check agreed with) — recording them turns "none" from a thin round into an
   honest ledger and pre-empts the next closure making the same observation.
2. **The Frontier section should stay.** The S099 provenance bullet at :37 is good row content and satisfies
   CORPUS.md:113's quote requirement; the addendum should reference it, not duplicate-or-delete it
   (append-only discipline; deletion would be a new defect class).
3. **r50's own lesson is covered by the same contract from the other side:** frozen R6 requires
   `corpus/lessons/round-50.md` to carry `## Mistakes` + `## Gate` — the delta documented here is the exact
   failure shape R6 exists to keep out of round 50.
4. No contested ground: this is pure in-lane lesson conformance; sibling lanes' Gate shapes were read-only
   inputs, nothing here touches their provinces.

## Verification (commands run, read-only)

- `grep -n '^## ' corpus/lessons/round-48.md` → `## Mistakes` :5, `## Gate` :12, `## Round-48 record` :26, `## Sources` :65.
- `grep -n '^## ' corpus/lessons/round-49.md` → `## Mistakes` :7, `## Frontier — SOURCES` :35 (no Gate; 45 lines total).
- `grep -n '^## Gate' corpus/lessons/round-4{2,3,4,5,6,7,8}.md` → hits in every round r42-r48.
- `sed -n 12,24p corpus/lessons/round-48.md` → Candidates/Admitted/Rejected subsections quoted above.
- `grep -n 'S099 admitted\|Re-opened\|Rejected this round' corpus/lessons/round-49.md` → :37, :43, :45.
- `grep -n 'spot-check' corpus/lessons/round-48.md` → only :8 (Mistake 2, re r47).
- Sibling headers: `grep -n '^## Gate' mado-shokunin/corpus/lessons/round-27.md` (:17),
  `mori-shokunin/.../round-37.md` (:3), `chousa-shokunin/.../round-35.md` (:43),
  `kama-shokunin/.../round-30.md` (:26), `kake-shokunin/.../round-43.md` (:10) — all present; section bodies read.
- `corpus/lessons/round-49-verifier-spotcheck.md` §1 (`## Gate` check = defect, routed 2), §3 (agrees ×4,
  disagrees on missing ledger), §5 items 2-3 (routed defects).
- `.ufo/waves/round-50/probe/repairs50-probe.mjs:61-66` (R1 extraction + four-word check), `plan.md:16-18` (R50-2).
- `.ufo/waves/round-49/r49-spec.json` items list includes `ScribeReopenS095`, `ScribeReopenS098` (re-open seats).
- Cross-read sibling drafts: `r50/ExecGateLedger.md` (append block), `r50/ReopenS095.md`, `r50/ReopenS098.md` (landed receipts).

No installs, no mutations, no probes re-run. Report: `.ufo/waves/round-50/r50/ConnLedgerDelta.md`.

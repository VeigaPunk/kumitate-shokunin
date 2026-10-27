# Range survey — should the routed-ledger range start before round 55?

Seat K66ScoutSpotcheckRange, kumitate round 66 wave w1. Survey of
`corpus/lessons/round-*-verifier-spotcheck.md` for rounds 6–54 against the section rule
declared in the C1 tool header (`scripts/routed-ledger.mjs`): the routed section is the FIRST
heading (`#`..`######`) matching `/\brouted\s+(defects?|items?)\b/i`, ending at the next heading
of the same or higher level; items are column-0 list bullets and non-separator table data rows.

Method: the tool's own exported `routedItems()` was run over every file; every heading of every
file was audited for near-misses; the frozen counter's independent `items66()` was extracted from
`.ufo/waves/round-66/probe/ledger66-probe.mjs` and run over the same files as a cross-check.

## File existence

- Rounds 6–33: NO spot-check files exist (`corpus/lessons/` holds `round-1..round-31` lessons,
  then `round-34-verifier-spotcheck.md` is the first). Nothing can be ledgered before round 34.
- Round 34: file exists; headings are only `## Spot-check …` and `## Adjudication` — no routed
  section at all, 0 items. The first routed section in the corpus is round 35.

## Per-round counts (tool `routedItems`, verified identical for the counter `items66`)

| round | matched heading | items |
|---|---|---|
| 34 | — none — | 0 (no routed section) |
| 35 | `## Routed defects (lane owns; fix next round)` | 4 |
| 36 | `## Routed defects (lane owes next round)` | 8 |
| 37 | `## Round-36 routed defects D1–D8` **(recap — mis-read)** | 27 (see F1) |
| 38 | `## Routed defects / operator handoff` | 0 (2 prose items missed — F2) |
| 39 | `## Routed defects (lane fixes next round)` | 8 |
| 40 | `## Routed defects (lane fixes next round)` | 7 |
| 41 | `## Routed defects (lane fixes next round)` | 7 |
| 42 | `## Routed defects (lane fixes next round)` | 8 |
| 43 | `## Routed defects (kumitate owes these next round)` | 6 |
| 44 | `## Routed defects (kumitate owes these next round)` | 7 |
| 45 | `## 5. Routed defects (lane fixes next round)` | 5 |
| 46 | `## 6. Routed defects (the lane fixes these next round)` | 6 |
| 47 | `## 7. Routed defects (the lane fixes these next round)` | 6 |
| 48 | `## 5. Routed defects and notes for round 49 (lane-owned; fix or answer there)` | 5 |
| 49 | `## 5. Routed defects (lane-owned; fix or answer in round 50)` | 6 |
| 50 | `## 5. Routed defects and observations for round 51` | 5 |
| 51 | `## 5. Routed defects and observations for round 52` | 4 |
| 52 | `## 5. Routed defects and notes for round 53` | 5 |
| 53 | `## 5. Routed items / defects for the lane's next round` | 4 |
| 54 | `## 5. Routed items / defects for the lane's next round` | 4 |

Totals, rule as-is over 34–54: **132 items** (tool and counter agree exactly, `agree=true
tool total=132 probe total=132`). True routed items in 34–54: 132 − 27 (round-37 recap) + 7
(round-37 real section R1–R7) + 2 (round-38 prose R38-1/2) = **114**, of which rounds 35–54
contribute all 114 (round 34 routes nothing).

## Headings the rule misses

- Round 38: `## Routed defects / operator handoff` matches, but its two items are prose
  paragraphs (`R38-1 → …`, `R38-2 → …`), not bullets/tables → 0 items parsed (F2).
- No "Conformance defects"-style standalone heading exists in 34–54 ("Step-1 conformance"
  headings carry no routed items). Round 57 (inside the current 55..65 range) has
  `## Orchestration conformance defect — double-live L1` which does not match, but that defect
  is restated as item 1 of the matched `## Conformance defects (status-neutral) and routed
  items` section — nothing is lost there.

## Headings wrongly matched

- **Round 37**: the first match is `## Round-36 routed defects D1–D8` — a closure *recap* of the
  previous round's items, not round 37's new routed section. Because the next heading is a deeper
  `###`, the "section" swallows Appendix A: 19 of the 27 counted items (closure measurement
  tables at `round-37-verifier-spotcheck.md:97-103` and anchor bullets at :139-146) are not
  routed defects at all. The real section `## Routed defects (lane owes next round)`
  (`round-37-verifier-spotcheck.md:201`, R1–R7) is never parsed. The tool and the frozen counter
  mis-read identically, so L2's tool==counter agreement would still hold — the failure is an
  agreed mis-binding of a real section, exactly the class the declared ratchet fixes
  (non-items counted, items missed).
- Rounds 47/48 `ROUTED_HELD` claim headings (`## 2. Claim C1 — operability (ROUTED_HELD, …)`
  `round-47-verifier-spotcheck.md:33`; `### C1 — operability (ROUTED_HELD, …)`
  `round-48-verifier-spotcheck.md:28`) do NOT match: `\brouted\s+` fails on the `ROUTED_HELD`
  underscore. No wrong match at 47/48 — the rule is safe there.

## Recommendation

- **Unchanged tool: keep `--from 55`.** Below 55 the rule's first-match selection is unsafe
  (round 37) and prose items are dropped (round 38); extending the range would import both into
  the ledger even though tool and counter agree.
- **If the L1 strengthens the tool next round** (ratchet-permitted): (a) select the LAST matching
  heading instead of the first — every spot-check 35–65 places its real routed section after any
  recap, and 55–65 files each have exactly one match, so this is a no-op on the current range;
  (b) treat round 38's two prose items like round 59's stated prose limit (0 items, noted), do
  NOT extend the parser to paragraphs. Then the defensible next-round range is
  **`--from 35 --to 66`** = 112 items (35–54, with round 37 fixed to 7) + 57 (55–65) + round 66's
  own routed items = **169 items across 31 sections** before round 66's items are appended.
  Starting at 34 adds nothing (round 34 routes nothing); starting at 37 discards 12 real items
  (rounds 35–36).

# K66ScribeLedger5556 — row notes (rounds 55, 56)

Tip at write: `88041bc9f45b06560bbd807bd1ea7b44126aa49f` (lane worktree, no lane mutation made).
Item ordinals are `routedItems()` order (verified by running the tool's own parser): round 55 → 3 items,
round 56 → 4 items. 7 items, 7 rows.

| id | round | item | status | why this answer answers |
|---|---|---|---|---|
| R55-V1 | 55 | 1 | closed | `LOG.md:2157-2160` is the round-56 errata block the item asked for: it names `e7a07111`/`26c886d7`, and the quoted sentence is the correction itself ("this round names them here and its own report lists every lane commit authored under round 56"). `corpus/QUALITY.md:903` (Q51) is the durable rule the errata created. |
| R55-V2 | 55 | 2 | closed | `LOG.md:2161` records the re-derived figure `B 9→10` → `B 9→11` exactly as the item demands; `corpus/lessons/round-56.md:30` (R56-1) and `:36` carry the same correction. |
| R55.3 | 55 | 3 | open | No closure found at the tip. Last recorded state: carried-open in `corpus/lessons/round-57-verifier-spotcheck.md:137` ("Carried L0 items unchanged: R41-2, R43-1/R43-5, A3e, R53-2"); `SCORECARD.md:1931` "R43-1/R43-5 stay open; the R41-2 gate-pins ruling stays pending". No file at the tip answers the four carried ids, so no answer is invented. |
| R56-V1 | 56 | 1 | wontfix | The item's own alternative was "record an explicit orchestrator ruling"; `corpus/lessons/round-57.md:33` records it and labels the item "n/a — orchestrator ruling/process convention, not a lane defect the lane can fix inside the repo". Round 66 does dispatch its v2 wave, but no lane file binds that fact to R56-V1, so the recorded convention is the answer. |
| R56-V2 | 56 | 2 | closed | `corpus/lessons/round-57.md:32` (R57-2) freezes the amended B7 convention (`items === 27` plus the item-id→gate binding), which is the counter-amendment the item asked the lane to consider. |
| R56-V3 | 56 | 3 | closed | `corpus/lessons/round-57.md:31` (R57-1) states the row was added in that commit and the class is gated by `readme-map`. Confirmed independently at the tip: `corpus/README.md:168` is the row for `lessons/round-56-verifier-spotcheck.md`, the path is in `.ufo/pins/readme-map.json`, and `corpus/QUALITY.md:882` is Q48 (row+pin in the same change). |
| R56.4 | 56 | 4 | open | Same carryover set as R55 item 3; unchanged at the tip (see R55.3). No answer found. |

## Integration notes for the L1

- `rows.md` holds the 7 rows only. They are meant to sit in one `## Ledger` table with the other seats' rows.
- Ids used are the items' own labels; the two unlabelled carryover items take `R55.3` and `R56.4`
  (no label exists in those items, so no `<label>` id is available).
- One class outside the shared set: `counter-obsolescence` (R56-V2). None of the shared slugs fits a
  frozen-literal counter that measures accurately but goes stale; `forgeable-counter` is a different defect.
- Open rows carry class `carried-l0` (2 rounds: 55, 56) so the deferral ledger counts the carried set.
- Duplicate-id risk: if another seat also ledgered these rounds with the same natural labels, the tool
  reports `ROW_DUPLICATE`; keep one row per item.

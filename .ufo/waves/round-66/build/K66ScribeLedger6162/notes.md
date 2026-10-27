# K66ScribeLedger6162 — notes on the rows (rounds 61, 62; round 59 confirmed empty)

Lane tip at drafting: `88041bc9f45b06560bbd807bd1ea7b44126aa49f` (freeze `621212ba`). `corpus/routed-ledger.md` is
absent at the tip, so these are drafts for the L1 to paste under its `## Ledger` header row.

Item ordinals come from the frozen tool's own `routedItems()`: round 61 → 6 items (labels R61-V1..V6), round 62 → 5
items with no labels of their own (numbered list) → ids `R62.1`..`R62.5`. Round 59's routed section is prose
("**No new lane-owned defect is routed.**") → `found=true items=0`; it takes no rows (verified: `--from 59 --to 59`
with an empty ledger body reads `items=0 rows=0` CLEAN exit 0).

## Open rows — why no closure exists

- **R61-V1** (scratch-hygiene). The item asks for a `git bundle` of *each* falsifier fixture (`ab902da2…` and
  `4247d2d`) under `.ufo/waves/round-61/controls/`. The C2 half is closed and durably filed:
  `SCORECARD.md:2956` — "the C2 forged commit is now archived in `.ufo/waves/round-61/controls/r61-c2-full-forgery.bundle`"
  (16,488,385 B, sha256 `c5c01540…`, `git bundle verify` ok, fixture rev `4247d2da…`; tracked at the tip,
  `git ls-files .ufo/waves/round-61/controls/r61-c2-full-forgery.bundle` → present). The C1 half has no artifact and
  cannot be produced: the same line records "The C1 fabrication repository was absent under `/tmp/kumitate-r61/CritControlC1`
  and was not synthesized", and `corpus/lessons/round-62.md` / `.ufo/waves/round-62/w2/ScribeSynthesis.md:91` grade the
  item "Partial … C1 fixture absent — no C1 bundle exists". A `closed` row would overstate; an `open` row keeps the
  half-finished obligation visible. C1 fixture rev `ab902da2…` does not resolve in the lane
  (`git -C <lane> cat-file -t ab902da2` → not found).

- **R62.2** (dispatch-evidence). The item wants both the dispatch registry and the actual-outcomes receipt committed
  for a validated wave. Half landed at the tip: `.ufo/waves/round-66/w1-dispatch.json` (tracked; `counts.spawn=66`,
  `taskCall` batched in one call per the `note` at its line 1035, `registry.path=.ufo/waves/round-66/w1/swarm-registry.json`)
  was committed in `273202ba` ("round-66: commit validated 66-seat v2 wave dispatch"). The actual-outcomes receipt is
  not present: `ls .ufo/waves/round-66/w1/` shows seat reports + `swarm-registry.json` only, no `dispatch-actual.json`.
  The wave is still running, so the row stays `open` for the L1 to close at wave close with a located receipt line.

- **R62.4** (dead-seat). The item has two halves: (a) the four exhaustive Audit19 checks (no-truncation, exact
  traceback, per-row identity) and (b) a ledger row for the dead-seat `RevS126Quote.md` anomaly. (a) is still
  unexecuted in the lane's own words — `corpus/lessons/round-62.md:25` ("it does not close that gap"),
  `corpus/lessons/round-65.md:130-132` (carried, no seat owns it). (b) is circular for this ledger: the row the item
  asks for would live in `corpus/routed-ledger.md`, which the tool forbids as an answer path (`ANSWER_DEAD
  answer-path-not-allowed`), and no lane prose states the row landed (`grep -rn RevS126 corpus/lessons/*.md` →
  the three carry-forward lines only). No honest answer line exists → `open`.

- **R62.5** (census-warning). Option was "disambiguate the scopes or supersede rows" for S034/S068/S084/S095/S123/S126.
  Neither happened: the round-66 base census still prints all six — `base/census-before.txt` tail: `kumitate W04 S034
  duplicate url stryker-mutator.io/… across scopes` … `S126 duplicate url docs.temporal.io/… across scopes`, `ok`
  line + `EXIT=0`; plan.md:19 repeats "Census exit 0 with the six carried W04 warnings". Carried, not repaired → `open`.

## Closed rows — the caveats the quotes do not carry

- **R61-V2 / R62.3** cite different halves of the same repair: `SCORECARD.md:2960` retires the exact predicates the
  item names, and `base/ledger66-donothing.txt:2` shows the replacement frozen counter (`rule=L66`) failing a
  do-nothing control (`held=4/6`). Neither line claims adequacy of the new reading; that is the plan's stated limit.
- **R61-V5** is closed for the round-61 stale stanza + unpinned tool. The class has recurred since: at the round-66
  base `proxy-check` reads DRIFT again (`base/proxy-before.txt:8`, A declared=351 computed=455, `PIN_UNPINNED
  scripts/harm-matrix.mjs`) — that is the plan's carried D4, not a reopening of this row.
- **R61-V3/V4/V5/V6 all cite `SCORECARD.md:2956`**, one 1031-character correction line that answers four routed items.
  Valid per the contract (±2 window), but one edit to that line kills four rows at once (see finding -2).

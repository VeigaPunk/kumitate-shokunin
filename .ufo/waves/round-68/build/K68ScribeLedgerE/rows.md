# R66-D1..D3 (+N1) — routed-ledger rows, drafted for integration

Seat `K68ScribeLedgerE`, round 68 wave w1. Subject: the round-66 routed section
`corpus/lessons/round-66-verifier-spotcheck.md:69-74` — `## Routed defects for round 67`.
Row semantics: `.ufo/waves/round-68/probe/ledger68-probe.mjs` L3 (frozen) and the tool it scores
(`scripts/routed-ledger.mjs`, v1 today → v2 this round).

## 1. What the round-66 section actually holds — FOUR items, not three

| item | line | item quote used (3–25 words, word-boundary, unique in section) | status in row |
|---|---|---|---|
| 1 = D1 "settle the wave leftovers" | 71 | `settle the wave leftovers` (4 w) | closed |
| 2 = D2 "receipt precision" | 72 | `receipts must name the revision they measured` (7 w) | closed |
| 3 = D3 "frontier duty unmet" | 73 | `no sourced claim and no SOURCES advance landed` (8 w) | closed (wontfix variant below) |
| 4 = "Note for the operator (not a defect…)" | 74 | `all four SHONEN boxes remain lane-asserted` (6 w) | **open** |

Item 4 is a bullet in the routed section and both parsers count it (the tool's `routedItems()` and the
counter's independent `items67()`): round 66 = 4 items, so rounds 55..66 = **61 items / 12 sections**,
which agrees with the counter's total but NOT with the plan's prose "rounds 55..65's 58 plus round 66's
D1–D3" (measured: 55..65 = 57, r66 = 4). Dropping item 4 makes the tool read
`FINDING UNLEDGERED round-66-item-4` → DRIFT exit 1, and L2/L3 MISS. See findings 1–2.

## 2. The row set to paste into `## Ledger` (7 cells per row, ids `R66-*`)

```
| R66-D1 | 66 | 1 | "settle the wave leftovers" | uncommitted-work | closed | `corpus/QUALITY.md:1066` — "uncommitted seat leftovers are committed or reverted under the closing LOG entry" |
| R66-D2 | 66 | 2 | "receipts must name the revision they measured" | report-fidelity | closed | `corpus/QUALITY.md:1072` — "every receipt names the revision it measured" |
| R66-D3 | 66 | 3 | "no sourced claim and no SOURCES advance landed" | carried-unaddressed | closed | `PROVINCE.md:21` — "second entry corpus/knowledge/mcp-deprecation-registry.md (round 68, S207-S213)" |
| R66-N1 | 66 | 4 | "all four SHONEN boxes remain lane-asserted" | verification-gap | open | - |
```

`fixture-ledger.md` in this dir is the same fragment wrapped in a `## Ledger` section; it is the file the
fixture run below used.

### Line pins — PROVISIONAL (re-pin at close)

| row | answer file | proposed line | stable anchor (unique substring of the target line) |
|---|---|---|---|
| R66-D1 | `corpus/QUALITY.md` | **1066** | `Q63 — a wave's uncommitted seat leftovers` |
| R66-D2 | `corpus/QUALITY.md` | **1072** | `Q64 — every receipt names the revision it measured` |
| R66-D3 | `PROVINCE.md` | **21** | `second entry \`corpus/knowledge/mcp-deprecation-registry.md\`` |

Numbers are measured on `QUALITY.md @ 39f61816` (1064 lines) + `quality-append.md` appended verbatim
(13 lines: Q63 at 1066, Q64 at 1072) and on `PROVINCE.md:21` with `province-append.md` applied in place.
Any insertion above them shifts the numbers; the counter checks the **exact** line (no window), so the L1
must re-pin after integration. The quote text itself does not change.

### Conditional: if C2 reads UNMET at close, R66-D3 becomes `wontfix`

```
| R66-D3 | 66 | 3 | "no sourced claim and no SOURCES advance landed" | carried-unaddressed | wontfix | `corpus/lessons/round-68.md:<line>` — "re-declared under a fresh freeze; the deprecation entry did not land" |
```

with `lesson-fallback.md` §3 landing that sentence. Note the weakness (finding 3): a `corpus/lessons/round-68.md`
answer satisfies L3's "not found at that file at the round-66 base" vacuously, because the file does not exist at
`8d557f85` — the probe's `before == null ||` arm (`ledger68-probe.mjs:265`). Prefer the QUALITY/PROVINCE pins.

## 3. Why these are answers, and why the quotes are NEW at the round-66 base

| row | the item asks | the landed fix text that answers it | base negative (verbatim, §verification.md) |
|---|---|---|---|
| D1 | commit-or-revert every wave leftover, name kept/discarded | QUALITY Q63 states the standing rule and its grounding records what was kept (`timeline.json` @ `d23892ad`, the re-run `results-INCONCLUSIVE-attempt.tsv` + README @ `e9ff2719`) and discarded (`results.tsv`, 22 lines) | `git show 8d557f85:corpus/QUALITY.md \| grep -c -F "<quote>"` → `0` |
| D2 | receipts must name the revision they measured | QUALITY Q64: receipt names its revision + a frozen counter's base receipt rides its freeze commit | same file at base → `0` |
| D3 | a sourced claim / SOURCES advance must land or be re-declared | PROVINCE frontier band gains the second entry naming the new registry entry and rows S207–S213 (C2's product) | `git show 8d557f85:PROVINCE.md \| grep -c 'mcp-deprecation-registry'` → `0` |

Both answer files exist at the round-66 base, so the "answered this round" arm is non-vacuous for all three rows
(the predicate's own weak case is finding 3, not used here).

## 4. Global L3 properties these four rows cannot satisfy alone (integration constraints)

- `classes >= 5` and one class spanning `>= 4` spot-check rounds are judged over the **whole** ledger
  (`ledger68-probe.mjs:271-272`). My rows use the canonical slugs of the round-66 seat's taxonomy
  (`.ufo/waves/round-66/build/K66ScribeClasses/table.md`): `uncommitted-work` (D1), `report-fidelity` (D2),
  `carried-unaddressed` (D3), `verification-gap` (item 4, open) — so the span arm is left to the recurring
  `reference-drift` class the sibling rows carry. The counter prints `classes=N<5` / `no-class-spans-4-rounds`
  in the L3 MISS detail.
- Two non-open rows on one `(round,item)` → `contradictory-coverage-with-…` (probe:256-260). If a sibling also
  closes `R66-D1..D3`, the L1 must keep exactly one non-open row per item. Two rows with different **open**
  classes are legal (v1 selftest "two rows on one item (two classes) stay CLEAN").
- The section heading must be byte-exactly `## Ledger` (`/^##\s+Ledger\s*$/`): `## Ledger (rounds 55-66)`
  fail-closes as `ledger-has-no-Ledger-section` exit 2. Cells may not contain `|`.
- Unique ids: `R66-D1`, `R66-D2`, `R66-D3`, `R66-N1` all match `/^[A-Za-z0-9][A-Za-z0-9.-]*$/` and the probe's
  `^R(\d+)-` round-match (66).

## 5. Optional strengthening for D1 (LOG.md, not the bound answer)

The item asks for the naming "under its own LOG entry"; no LOG entry or lesson names either path today
(`grep -rln 'timeline\.json\|results\.tsv' LOG.md corpus/lessons/` → only the round-66 spot-check). If the L1
wants that arm literally satisfied, append to the round-68 LOG entry and re-pin R66-D1's answer to it:

    - Wave-leftover settlement (r66 D1): kept `K66ReviewStagedClaims/captures/timeline.json` (committed `d23892ad`)
      and the re-run `K66MutLedgerProbe/results-INCONCLUSIVE-attempt.tsv` + README (`e9ff2719`); discarded the
      22-line `results.tsv` (driver timeout unit bug; every verdict INCONCLUSIVE).

Answer quote in that case: `Wave-leftover settlement (r66 D1)` + the same-kept clause; LOG.md exists at base, so
the newness arm stays non-vacuous.

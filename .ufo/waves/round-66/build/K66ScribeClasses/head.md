# Routed-ledger class taxonomy — C1 data design (round 66, wave 1, seat `K66ScribeClasses`)

Scope: the **57 routed items** of `corpus/lessons/round-55..65-verifier-spotcheck.md` (11 files, 11 routed
sections; round 59's section is prose-only — "No new lane-owned defect is routed." at
`corpus/lessons/round-59-verifier-spotcheck.md:253` — so it contributes 0 items). Items were enumerated with the
frozen tool's own parser, never by hand:

```
node -e 'import("./scripts/routed-ledger.mjs").then(m=>…m.routedItems(t)…)'
R55=3 R56=4 R57=4 R58=8 R59=0 R60=9 R61=6 R62=5 R63=6 R64=5 R65=7  → items=57 sections=11
```

Deliverable: one **primary** class per item from 13 slugs, a recurrence count on **distinct rounds**, and the
structural fix for every class **past three recurrences** — the tool's own `RECURRENT` threshold
(`rounds >= 4`, `scripts/routed-ledger.mjs:238`, the `--classes` block of `evaluate()`), which is also the threshold
`corpus/QUALITY.md`'s round-65 PROPOSED criterion called "more than three rounds".

## Method

- **Quote windows.** Each table row carries a verbatim quote from its item, chosen so the row can be pasted into
  `corpus/routed-ledger.md` as-is: it is a substring of the item under the gate's own `norm()`, ≤ 25 words, and
  contains no `|` or `"` (the two characters that would break the row cells). The gate's comparison is
  `norm(item).includes(norm(quote))` (`scripts/routed-ledger.mjs:211`), so any whitespace or markup difference is
  irrelevant — the windows are checked by the same function.
- **`status` and `answer` are deliberately absent.** Whether an item is `closed`, `wontfix` or `open`, and which
  line answers it, is the closure's judgment (the plan's stated limit: "the counter verifies bindings, not
  adequacy"); this seat classifies, the L1 answers. Rows here supply `round | item | quote | class` only.
- **Counting rule.** A class's recurrence is the number of **distinct rounds** holding a row of that class — the
  tool's rule (`e.rounds.add(Number(row.round))`, `routed-ledger.mjs:233`); two rows of one class in one round count once (e.g.
  `reference-drift` has 8 rows over 7 rounds, both round-65 rows being 65).
- **Slug rule.** `^[a-z][a-z0-9-]*$` — the gate's `ROW_MALFORMED:class` case. All 13 slugs pass it.
- **Vocabulary continuity.** Three slugs reuse names the lane already counts in `corpus/lessons/round-65.md`
  §"What round 65 changes" (`reference-drift`, `dangling-pointer`, `carried-unaddressed`), so the ledger does not
  invent a second name for a class the lane already counts by hand.
- **One primary per item.** Several items are genuinely dual (65 D4 is a stale proxy stanza *and* unlanded
  QUALITY rules; 60 V9 is a wrong id *and* a wrong tally). The table states the primary — the defect a fix must
  repair — and the reason column names the secondary where it changes the fix. See §Limits.

## Classes (13)

| slug | one-line definition | the rule or gate that already names it (if any) |
|---|---|---|
| `reference-drift` | an artifact lands without its `corpus/README.md` map row, its `covered` pin or its proxy stanza refresh, so a coverage gate reads DRIFT at the next base | `readme-map` (`SKILL.md:630`), Q48 (`QUALITY.md:882`), Q60 map arm (`scripts/plan-before-ready.sh:147`) |
| `tally-drift` | a published number, count or verdict disagrees with the receipt, registry or histogram it summarizes | `report-receipt-diff`/Q61 (`SKILL.md:636`, `QUALITY.md:1050`), Q50 (`:896`), Q41 (`:790`) |
| `carried-unaddressed` | a routed defect is re-listed across rounds with no owner, no repair and no full close | none — this ledger is the first surface that can count it |
| `dispatch-accounting` | the record of which seats ran (and whether they ran) disagrees with the seats actually run, or is not in the gate's schema | `dispatch-evidence` (`SKILL.md:632`), `inline-dispatch-evidence` (`:633`), Q54 (`QUALITY.md:924`), Q59 (`:992`) |
| `citation-integrity` | a cited source or registry id resolves to a different document than the registry holds, or one document is held under two ids | `cite-sources` (`SKILL.md:631`), `source-dupes` (`:628`), Q47 (`QUALITY.md:875`), Q56 (`:938`) |
| `wave-shape` | the round's plan, claim block, seat count or wave structure misses a declared requirement of the round contract | `wave-census` (`SKILL.md:615`), `plan-before-ready` (`:634`), `claims-check` (`:611`) |
| `dangling-pointer` | a cited path, hash, receipt or template token resolves to no object at the revision it names | Q52 (`QUALITY.md:910`), Q55 (`:931`), `report-receipt-diff` `HASH_DEAD`/`PLACEHOLDER` |
| `report-fidelity` | the report or lesson narrative departs from its receipts — silent about a landed object or a measured regression, or asserting more than the evidence | Q51 (`QUALITY.md:903`), Q53 (`:917`), Q52 (`:910`) |
| `verification-gap` | a claimed check or tally has no executed transcript, so the number is prose rather than evidence | Q43 (`QUALITY.md:801`), Q61's `TALLY_UNRECEIPTED` (`:1050`) |
| `registry-home` | a gate or capability has no `SKILL.md` row, no `SCORECARD.md` `## Capabilities` row, or no proxy pin | `SKILL.md` §Gate standard, `counter-pins` (`:625`) |
| `frozen-predicate-defect` | the frozen counter or rule admits fabrication, rejects honest work, or pins a literal the surface has outgrown | Q57 (`QUALITY.md:945`), `gate-mutants` (`SKILL.md:616`) |
| `uncommitted-work` | the close work or the evidence exists only in a worktree or tmpfs, so landed-means-committed and closure-durability fail | `round-gate --close` (`SKILL.md:609`), Q44 (`QUALITY.md:819`) |
| `append-only-violation` | filed or committed bytes are rewritten in place instead of repaired by an appended erratum | Q45 (`QUALITY.md:860`), Q52's limit (`:915`) |

## Assignment (57 items, one row per routed item)

Quote and reason are per item; the class column is the primary class. Ready-to-paste form: `rows.tsv`
(4 tab-separated cells, one line per item).


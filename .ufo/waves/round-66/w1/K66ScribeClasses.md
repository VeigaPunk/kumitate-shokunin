VERDICT: All 57 routed items of rounds 55..65 are assigned one primary class from a 13-slug taxonomy (verify PASS 57/57, 0 malformed), 7 classes read RECURRENT at the tool's own `rounds >= 4` threshold, and each of those 7 is paired with the gate that exists but is not invoked or scoped to the class, or the arm that should exist — with `reference-drift` (7 rounds) and `carried-unaddressed` (6) shown to survive their existing rules.

## Evidence

1. Items enumerated with the frozen tool's own parser, not by hand (`scripts/routed-ledger.mjs` imported read-only, TMPDIR in scratch):
```
node -e '…const {found,items}=m.routedItems(t)…'   →
=== R55 found=true items=3   === R56 items=4   === R57 items=4   === R58 items=8
=== R59 found=true items=0   === R60 items=9   === R61 items=6   === R62 items=5
=== R63 items=6              === R64 items=5   === R65 items=7
```
57 items, 11 sections — the same count the frozen plan states at `.ufo/waves/round-66/plan.md:27` ("57 items in 11 sections at base"). Round 59 contributes 0 because its section is prose: `corpus/lessons/round-59-verifier-spotcheck.md:253` "**No new lane-owned defect is routed.**".

2. Assignment checked against the gate's own rules (`verify.mjs`, receipt `verify.txt`):
```
SPOTCHECKS sections=11 items=57 rows=57 malformed=0
---
| `reference-drift` | 8 | 7 | 56,58,60,61,63,64,65 | RECURRENT |
| `carried-unaddressed` | 7 | 6 | 55,56,57,62,63,64 | RECURRENT |
| `dispatch-accounting` | 5 | 5 | 57,58,60,61,62 | RECURRENT |
| `tally-drift` | 7 | 4 | 55,58,60,63 | RECURRENT |
| `citation-integrity` | 4 | 4 | 58,60,62,65 | RECURRENT |
| `report-fidelity` | 4 | 4 | 55,58,60,65 | RECURRENT |
| `wave-shape` | 4 | 4 | 56,62,63,65 | RECURRENT |
| `dangling-pointer` | 4 | 3 | 60,61,64 | watch |
| `frozen-predicate-defect` | 3 | 3 | 56,57,61 | watch |
| `verification-gap` | 3 | 3 | 62,63,64 | watch |
| `registry-home` | 3 | 2 | 58,65 | - |
| `uncommitted-work` | 3 | 2 | 60,61 | - |
| `append-only-violation` | 2 | 2 | 57,61 | - |
---
TOTAL rows=57 classes=13 recurrent=7
VERDICT: PASS
```
Checks per row: item exists (`ITEM_ABSENT`), class in the declared set and matching `/^[a-z][a-z0-9-]*$/` (the gate's `ROW_MALFORMED:class`, `routed-ledger.mjs:194`), quote a verbatim substring of its item under the gate's `norm()` (`routed-ledger.mjs:211`) and ≤ 25 words; and no quote contains `|` or `"` (`awk -F'\t' 'index($3,"|")||index($3,"\"")' rows.tsv` → no output). Plan L3 asks `>= 5 distinct classes; >= 1 class spans >= 4 distinct spot-check rounds` (`.ufo/waves/round-66/plan.md:39`) — met with 13 and 7.

3. Gate-state commands behind the structural fixes (all read-only):
```
$ grep -oE "F\('[A-Z_]+'" scripts/routed-ledger.mjs | sort -u
F('ANSWER_DEAD' F('ITEM_ABSENT' F('QUOTE_ABSENT' F('ROW_DUPLICATE' F('ROW_MALFORMED' F('UNLEDGERED'
$ ls scripts/readme-map-close.mjs
ls: cannot access 'scripts/readme-map-close.mjs': No such file or directory
$ grep -c "wave-census\|readme-map\|routed-ledger" scripts/round-gate.mjs
0
$ grep -n "PBR_MAP_FROM" scripts/plan-before-ready.sh
147:MAP_FROM="${PBR_MAP_FROM:-65}"
$ grep -n "MAP_FROM\b" scripts/plan-before-ready.sh | head -2   → 144 comment, 147 default (epoch from round 65)
```

## Findings

**K66ScribeClasses-1 (high; attacks the operability of C1's own output).** The top recurrent class is not retired by any gate, so the ledger will record `reference-drift` a 12th time and C1 will read CLEAN anyway. `readme-map` v2, Q48 and Q60's map arm all *detect* the missing row; nothing **writes** it, and the close-time mechanism the lane specified in round 63 was never integrated (`ls scripts/readme-map-close.mjs` → `No such file or directory`, while `00-proposal.md`, `10-readme-map-close.patch` and `11-readme-map-append.patch` sit in `.ufo/waves/round-63/build/K63R2ExecReadmeMapFinal/`). Fix: land that pair, or move the README row + pin into the closure's write scope. Reproduce: `ls scripts/readme-map-close.mjs; grep -c 'readme-map-close' scripts/*`.

**K66ScribeClasses-2 (high; attacks the "carried" half of the claim).** `carried-unaddressed` recurs in 6 rounds (7 rows, including four consecutive pure carryover lists) and the frozen tool has **no age/stale arm**: its findings are exactly the six ids printed above, and `grep -n 'STALE\|age' scripts/routed-ledger.mjs` finds nothing but `add`/`USAGE`/`message`. So a ledger can mark every pre-66 row `open` and still read CLEAN; C1's L3 only forces round-65 rows to be answered. Fix (strengthening, permitted by the plan's ratchet): a `ROW_STALE` finding when a row is `open` and `Number(row.round) < top - 1`, with one new selftest case; cheaper variant — fire it only for classes the `--classes` block already reports `RECURRENT`. Reproduce: `grep -oE "F\('[A-Z_]+'" scripts/routed-ledger.mjs | sort -u`.

**K66ScribeClasses-3 (medium; attacks the class that the existing gate half-covers).** All 7 `tally-drift` rows are outside `report-receipt-diff`'s scope: the tool compares only labelled `<LABEL>_HELD|UNMET` tallies, and Q61's own measured limit records a bare `held=9/10` read CLEAN (`corpus/QUALITY.md:1055`). The routed numbers here are bare or re-derived (`B=9→10`, `held=0/5`, `96→99`, "Seventeen are gates", `K_members 52→49`). Fix: a `TALLY_BARE` arm for integers adjacent to `tiers?|gates?|rows?|seats?|members?`, plus a mechanical Q41 (prose at `QUALITY.md:790`). Reproduce: `sed -n '1055p' corpus/QUALITY.md`.

**K66ScribeClasses-4 (medium; attacks dispatch-accounting's "gate exists" claim).** The class recurs 5 times in rounds 57–62, and the gates that name it landed *after* (`dispatch-evidence.mjs` r60, `inline-dispatch-evidence.mjs` r63), but **no round-close step invokes them**: `grep -c "wave-census\|readme-map\|routed-ledger" scripts/round-gate.mjs` → `0`, and `wave-census --expect` is hand-supplied per wave. The retirement is invocation plus a required `--expect`, not a new gate. Reproduce: the grep above.

**K66ScribeClasses-5 (medium; attacks citation-integrity's gate coverage).** `cite-sources` reads only `corpus/README.md` map rows (`scripts/cite-sources.mjs:42-54`, flags `--readme/--sources`), so the exact shape of round-65 D1 — a `## Gate` table mapping `S204/S205/S206` to documents `SOURCES.md` does not hold — is outside every registered gate. Fix: widen `cite-sources` to the `| S### |` cells of `corpus/lessons/*.md`, requiring the id to exist **and** the named document to match the `SOURCES.md` row. The W04 half (62#5) is a policy decision under Q47, not a gate gap. Reproduce: `sed -n '42,54p' scripts/cite-sources.mjs`.

**K66ScribeClasses-6 (medium; attacks the ledger's arithmetic if seats land rows as filed).** Two peer seats drafted rows under a different vocabulary — `K66ScribeLedger60` used `placeholder`, `dispatch-evidence`, `dead-seat` and four different `reference-drift` uses (sent the 9-row remap); `K66ScribeLedger65` first used `census-warning` and `round-size`, then adopted this set (`D1 citation-integrity, D2/D3 registry-home, D4 reference-drift, D5 report-fidelity, D6 wave-shape, D7 reference-drift`, its own re-run: `ROUTED_LEDGER: CLEAN spotchecks=1 sections=1 items=7 rows=7 open=0 closed=5 wontfix=2` exit 0). `K66RevengerAnswers-2` holds the answer lines for all 57 ordinals. If round-60's slugs land as filed, `--classes` prints two families per defect and the recurrence numbers above will not reproduce — the L1 must re-slug those 9 rows before integration.

**K66ScribeClasses-7 (low; attacks how "past three recurrences" should be read).** Three classes sit exactly on the 4-round line (`tally-drift`, `citation-integrity`, `report-fidelity`) and `wave-shape` is RECURRENT **only** because round-65 D6 is in it — re-slug that one item and the class reads 3 rounds. Conversely `dangling-pointer`, `frozen-predicate-defect` and `verification-gap` cross with one more routed item each. So `RECURRENT` is "at the line", not a ranking: the signal is in the top three (7/6/5 rounds), and a class at 4 should be read with its row list, which `classes.md` prints.

## Artifacts

- `.ufo/waves/round-66/build/K66ScribeClasses/classes.md` — the deliverable: 13 definitions with the rule/gate that names each, the 57-row table (`round | item | class | quote | reason`), the recurrence table, the 7 structural fixes with evidence, the 3-round watch list, integration notes, limits.
- `.ufo/waves/round-66/build/K66ScribeClasses/rows.tsv` — paste-ready `round/item/quote/class`, 57 lines, no `|` or `"` in any cell.
- `.ufo/waves/round-66/build/K66ScribeClasses/classes.tsv` — the editable assignment source (4 cells per line).
- `.ufo/waves/round-66/build/K66ScribeClasses/verify.mjs` — the checker (imports the frozen tool read-only; re-runnable).
- `.ufo/waves/round-66/build/K66ScribeClasses/verify.txt`, `table.md` — its receipt and generated table; `head.md`, `tail.md` are the prose halves `classes.md` is assembled from.

## Limits

- One primary class per item; dual items (65 D4, 60 V9, 63 #5) take a declared primary, with the secondary in the reason column. A different primary moves rounds between classes and three classes are on the line (K66ScribeClasses-7).
- Classification is from the routed text only: I did not re-open the documents each item cites, so a class describes what the item asserts, not a re-measurement (that is `K66RevengerAnswers-2`'s and the L1's half).
- No gate was executed against a real ledger — `corpus/routed-ledger.md` does not exist yet, so `--classes` on it was not run; `verify.mjs` checks my data with the gate's own parser and `norm()`, on the worktree of the freeze revision rather than `git archive`.
- Round 59's zero-item section means a future "≥ 1 row per section" arm would fail it; noted in `classes.md` §Limits rather than patched.
- Host: no package or tool was installed; pacman untouched. Scratch `/fast/scratch/hyaku/kumitate-r66/K66ScribeClasses` was used as `TMPDIR` only and removed at yield.

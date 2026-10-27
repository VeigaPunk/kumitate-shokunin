# K68ScribeLedgerB — answers evidence (rounds 58, 59, 60)

Every answer locus below was read with `sed -n '<line>p' <path>` from the lane root
`/home/vgpnk/Projects/shokunin/kumitate-shokunin`. Long lines are shown cut to 300 columns where the
command says `cut -c1-300`; the quote used by the row is always inside the cut window. Nothing here
is a scratch path: all cited files are committed lane files.

## Item counts bound by the draft (probe's own parser, copied verbatim)

`items.mjs` is `.ufo/waves/round-68/probe/ledger68-probe.mjs` lines 125-197 copied verbatim
(`norm`, `nwords`, `wb`, `items67`). Command and output:

```
$ node --input-type=module -e 'import {readFileSync} from "node:fs"; import {items67} from "./items.mjs";
  for (let n=55;n<=66;n++){const r=items67(readFileSync(`<lane>/corpus/lessons/round-${n}-verifier-spotcheck.md`,"utf8"));
  console.log(`round ${n}: sections=${r.sections.length} items=${r.items.length}`)}'
round 55: sections=1 items=3
round 56: sections=1 items=4
round 57: sections=1 items=4
round 58: sections=1 items=8
round 59: sections=1 items=0
round 60: sections=1 items=9
round 61: sections=1 items=6
round 62: sections=1 items=5
round 63: sections=1 items=6
round 64: sections=1 items=5
round 65: sections=1 items=7
round 66: sections=1 items=4
TOTAL items=61 sections=12
```

This reproduces the plan's own "61 items in 12 sections". Round 58 = 8 items, round 59 = 0 items,
round 60 = 9 items.

Round 59's routed heading and its body, for the zero-row decision:

```
$ sed -n '251,262p' corpus/lessons/round-59-verifier-spotcheck.md
## 8. Routed defects

**No new lane-owned defect is routed.** R58-V1..V8 are repaired in lane bytes without rewriting the
filed r58 report, the r58 lesson, the r58 spot-check or the r58 probes, and each repair reproduces
above.

Not lane-owned, status-neutral — orchestrator ordering defect: `inline.sh dispatch` was omitted
before the L1 spawn for round 59, so `.ufo/watchdog.log` has no `launch kumitate round=59` line and
`.ufo/prompts/kumitate-round-59.md` does not exist. The `claim-recovered` line
(`2026-10-24T21:51:18-03:00 … base=0f66ecd4 reason=dispatch-omitted`) is a verification-time
reconstruction, not contemporaneous dispatch evidence. Named here for the operator; the lane-round
itself terminates with a landed, non-marker report.
```

Prose only: no list item, table row or nested bullet — 0 items. The orchestrator note is named and
not ledgered (plan, C1 stated limit).

## Round 58 answers — `corpus/lessons/round-59.md` §Routed-defect answers

```
$ sed -n '31p' corpus/lessons/round-59.md
- R58-V1: the D58 base receipt and a re-run both read held=2/5. SCORECARD now carries `R58-V1 measured base held=2/5`. The r58 probe and the filed report were not rewritten.

$ sed -n '32p' corpus/lessons/round-59.md
- R58-V2: dispatch counts are planned / session-ids / reports / never-spawned, taken from the registry and launcher progress after settlement. A prepared spec is not a dispatch.

$ sed -n '33p' corpus/lessons/round-59.md
- R58-V3: README rows for the r58 entry and lesson cite S112, not S121. `cite-sources` fails that class.

$ sed -n '34p' corpus/lessons/round-59.md
- R58-V4: the TIER59 line above is the histogram the probe re-derives. The r58 report's "96→99 A" is not repeated.

$ sed -n '35p' corpus/lessons/round-59.md
- R58-V5: SKILL prose integer equals the `| gate |` row count after `cite-sources` (19).

$ sed -n '36p' corpus/lessons/round-59.md
- R58-V6: capabilities table gained `receipt-evidence` and `cite-sources`; the `readme-map` row no longer says files=135 or 14/14.

$ sed -n '37p' corpus/lessons/round-59.md
- R58-V7: `lessons/round-58-verifier-spotcheck.md` has its README row and covered pin in the same change as this lesson and the new entry.

$ sed -n '38p' corpus/lessons/round-59.md
- R58-V8: wording above. A shared page is not automatically a duplicate; pin the duplicate group before adoption.
```

Quote choice note (R58-V5): the source line carries literal pipes around `gate`, and a `|` inside a
ledger cell breaks the 7-cell split. The row quotes `row count after cite-sources (19)` instead, which
is contiguous in the normalized line and pipe-free. Same rule applied to every row: no cell carries `|`.

## Round 60 answers

```
$ sed -n '14p' .ufo/waves/round-61/w1/ScribeErratum.md
- **Fixed by `165b8304`: V1 and V7.** `git status --porcelain` lists only round-61 paths.

$ sed -n '18p' .ufo/waves/round-62/w2/R60Erratum.md
Thus all four measured tokens (5, 88, 96, 190) map to the same revision; the one tip token (4) maps to that round-60 tip; the one commits token (73) denotes the evidence landing(s), not a measurement revision. Each of the six occurrences is accounted for exactly once.

$ sed -n '1p' .ufo/waves/round-60/close/dispatch60-tip.txt
DISPATCH60: DISPATCH60_UNMET held=8/10 checks=10 rev=a745a3b0e02253e722834ef95042d97ed92e5e53 rule=A60

$ sed -n '1p' .ufo/waves/round-61/w1/ExecTipReceipts.md
# ExecTipReceipts — R60-V4 repair (round 61, wave w1)

$ sed -n '20p' .ufo/waves/round-61/w1/ExecDispatchSchemaTool.md
`scripts/make-dispatch-actual.mjs` (new, 27,473 bytes, mode 755, node builtins only, no deps):

$ sed -n '1p' .ufo/waves/round-60/close/dead-seats-r60.md
# Round-60 w1 dead-seat table (R60-V6 repair)

$ sed -n '2259p' LOG.md
- 2026-10-24 — round 60 (Kimi fresh L1): C1 operability capability

$ sed -n '181p' corpus/README.md            # cut to 300 columns
| `lessons/round-60-verifier-spotcheck.md` | Round-60 non-author closure (hyaku closure, non-author integrator): C1 `dispatch-evidence` `unprovable` (receipt `held=8/10` at `a745a3b0`, A7 row uncommitted, A10 unreachable on object-shaped `swarm-registry.json`), C2 band-4 frontier pair `improved` (re…

$ sed -n '13p' corpus/lessons/round-61.md  # cut to 300 columns
| `exactly-once-attribution.md` (document arXiv 2609.29095) | REJECT; flip: a later band-4 round re-opens the measured paper and adopts only under the lane's existing document id | duplicate-document scope: lane S134 already identifies this arXiv paper; the package also has two staged rows for that …
```

Note on R60-V8: the quote sits inside `corpus/README.md:181`'s second cell; the line itself contains
`|` separators (it is a README table row), but the **quote** has none. The answer is located by the
normalized text of the exact line, so the surrounding pipes are harmless.

## Harness runs over the draft rows

1. L3-shaped validator (per-row subset of `ledger68-probe.mjs` lines 230-273: word counts 3..25,
   word-boundary location, uniqueness in the section, id-round equality, answer at the exact line,
   forbidden answer paths, one non-open row per (round,item), no unledgered item):

```
$ node validate.mjs <lane>/.ufo/waves/round-68/build/K68ScribeLedgerB/rows.md
OK R58-V1 r58#1 cls=tally-drift ans=corpus/lessons/round-59.md:31
… (17 OK lines) …
OK R60-V9 r60#9 cls=citation-integrity ans=corpus/lessons/round-61.md:13

rows=17 classes=8 spans4=0
CLEAN (L3-shape for this seat)
```

`spans4=0` is expected for this seat (55..57 and 61..66 are other seats' rows). The slugs are the
round-66 canonical set (`.ufo/waves/round-66/build/K66ScribeClasses/table.md`), so the >= 4-round arms
are the ones that table already measured (`reference-drift` 7 rounds, `tally-drift` 4, …); this seat
adds rounds 58 and 60 to each class it touches. Full output:
`.ufo/waves/round-68/build/K68ScribeLedgerB/validate.out`.

2. The shipped tool (`scripts/routed-ledger.mjs`, v1) over a scratch fixture holding only spot-checks
   58/59/60 plus a ledger built from `rows.md` and the answer files:

```
$ node scripts/routed-ledger.mjs --root <fixture> --from 58 --to 60 --classes
CLASS citation-integrity rows=2 rounds=58,60
CLASS dispatch-accounting rows=2 rounds=58,60
CLASS reference-drift rows=2 rounds=58,60
CLASS report-fidelity rows=2 rounds=58,60
CLASS tally-drift rows=4 rounds=58,60
CLASS dangling-pointer rows=2 rounds=60
CLASS registry-home rows=1 rounds=58
CLASS uncommitted-work rows=2 rounds=60
ROUTED_LEDGER: CLEAN spotchecks=3 sections=3 items=17 rows=17 open=0 closed=17 wontfix=0
exit=0
```

Negative control, same fixture **before** the answer files were copied in: all 17 rows still parsed
and all 17 item quotes bound, so every failure was the missing answer file, never a quote:

```
ROUTED_LEDGER: DRIFT spotchecks=3 sections=3 items=17 rows=17 open=0 closed=17 wontfix=0 findings=17 first=ANSWER_DEAD:R58-V1@line7:answer-file-absent:corpus/lessons/round-59.md
```

Full outputs: `.ufo/waves/round-68/build/K68ScribeLedgerB/tool-58-60.txt` (clean run) and
`tool-58-60-nofiles.txt` (negative control).

3. Duplicate-coverage arm of L3 (the shipped v1 tool has no such arm — it reads duplicates CLEAN).
   Same replica, one extra row asserting item `58#1` a second time:

```
$ node validate.mjs <dup-rows.md>
DRIFT 1: R58-V1-DUP:contradictory-coverage-with-R58-V1
```

Full output: `.ufo/waves/round-68/build/K68ScribeLedgerB/dup-coverage.txt`. This is why the L1 must not
splice both this file and a converted round-66 class index for the same pairs.

VERDICT: `scorecard-block.md` (patch text for the `## Capabilities` row, the `## Round 68` claim block and a conservative `## Planned` note) is written with every number copied from a committed receipt; reading the frozen counter against the plan exposed one defect that can lose C1 if the L1 follows the plan's prose (round 66 has four items, not D1–D3, and L3 demands a closed/wontfix row for all four).

## Evidence

Style and surfaces read: `SCORECARD.md:1777-1801` (`## Capabilities` table + "Rows enter only through a round that demonstrates the capability running"), `SCORECARD.md:2964-2989` (rounds 63/64 blocks), `SCORECARD.md:525-603` (`## Planned`), `SCORECARD.md:2999-3007` (round 66, "No capability row is entered"). Plan read whole: `.ufo/waves/round-68/plan.md`.

1. Base tallies (the block cites these, not the plan's prose):
```
$ sed -n 1p .ufo/waves/round-68/base/ledger68-base.txt
LEDGER68_UNMET held=1/7 checks=7 rev=d23892ad44b41e1af63b3edb949d265ca1dd812d rule=L68 seed=2583a841b9d97d5e | L1 MISS exit=0 line=ROUTED_LEDGER_SELFTEST: PASS (33/33) | L2 MISS exit=2 verdict=ROUTED_LEDGER: FAIL-CLOSED reason=ledger-absent:corpus/routed-ledger.md own-items=61 own-sections=12 own-spotchecks=12 | L3 MISS 68 problems: … | L4 MISS … 7/20 mutants wrong … | L5 MISS real-tool-passes-L4=false stubs-caught=always-clean+always-drift | L6 MISS skill-row=false quality=false capability-row=false
ledger68 exit=1
$ cat .ufo/waves/round-68/base/deprec68-base.txt
DEPREC68_UNMET held=1/10 checks=10 rev=d23892ad44b41e1af63b3edb949d265ca1dd812d rule=M68 | M1 MISS entry-absent | … | M9 MISS readme-map-exit=1,province-entry-not-named
deprec68 exit=1
```
2. Independent re-run at the base (fresh seed, own TMPDIR; receipt `build/K68ScribeScorecard/ledger68-base-ownrun-seat.txt`, sha256 `dcc4e80529a8fe9702aeeef0b67f41f70121182a2c94810fc264761c0d0287b7`):
```
$ TMPDIR=/fast/scratch/hyaku/kumitate-r68/K68ScribeScorecard node .ufo/waves/round-68/probe/ledger68-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin d23892ad44b41e1af63b3edb949d265ca1dd812d
LEDGER68_UNMET held=1/7 checks=7 rev=d23892ad… rule=L68 seed=197c9e88dfeb7a0e | L1 MISS exit=0 line=ROUTED_LEDGER_SELFTEST: PASS (33/33) | L2 MISS … own-items=61 own-sections=12 own-spotchecks=12 | L3 MISS 68 problems … | L4 MISS … 7/20 … | L5 MISS … | L6 MISS skill-row=false quality=false capability-row=false
exit=1
```
3. Committed controls (read, not re-run: they write into `.ufo/waves/round-68/controls/`, outside my write scope):
```
controls/c1-donothing.txt   → LEDGER68_UNMET held=2/7 … L2 MISS exit=1 verdict=ROUTED_LEDGER: DRIFT … items=61 rows=0 … first=UNLEDGERED:round-55-item-1
controls/c1-autoledger.txt  → LEDGER68_UNMET held=2/7 … L2 DRIFT … items=61 rows=39 open=39 … first=QUOTE_ABSENT:A63x4@line27 ; control=autoledger exit=1
controls/c2-donothing.txt   → DEPREC68_UNMET held=1/10 … M1 MISS sources=2 verified-at=true recheck=true | M2 MISS cited=2 S233:row-absent,S234:row-absent … ; exit=1
```
4. Item count and its split, using the frozen counter's own parser (`items67`, `.ufo/waves/round-68/probe/ledger68-probe.mjs:130-177`) and, as a second implementation, a Python parser written from the same documented rule — both agree:
```
{"55":3,"56":4,"57":4,"58":8,"59":0,"60":9,"61":6,"62":5,"63":6,"64":5,"65":7,"66":4}  total 61  sections 12
round 66 items: 1 D1 … 2 D2 … 3 D3 … 4 "Note for the operator (not a defect, promotion-owned)"
rounds 55..65 = 57 ; round 66 = 4
```
5. L3's round-66 clause is per item, not per D-id: `ledger68-probe.mjs:265` (`answeredNow.add(r.k)` for `r.n === TO`) and `:270` (`r66.forEach((_, i) => { … r66-item-${i + 1}-not-answered-this-round … })`); the fourth item is `corpus/lessons/round-66-verifier-spotcheck.md:74`.
6. L6 is presence-only: `ledger68-probe.mjs:399-411` sets `cap` from any line under `## Capabilities` whose second pipe field matches `routed-ledger`; `SKILL.md` and `corpus/QUALITY.md` currently hold **0** occurrences of `routed-ledger` (`grep -c` → `SKILL:0 QUALITY:0`), and `test -e corpus/routed-ledger.md` / `corpus/knowledge/mcp-deprecation-registry.md` are both absent.

## Findings

**K68ScribeScorecard-1 — high — the plan's round-66 decomposition and L3 term understate the item set; following them loses C1.**
The plan says the ledger covers "61 items in 12 sections: rounds 55..65's 58 plus round 66's D1–D3" and L3 says "every round-66 item (D1–D3) has a closed or wontfix row". The frozen counter's parser gives rounds 55..65 = **57** and round 66 = **4** (D1, D2, D3 and the operator note at `corpus/lessons/round-66-verifier-spotcheck.md:74`), total 61; L3 iterates every round-66 item (`ledger68-probe.mjs:270`), so item 4 needs a closed/wontfix row whose answer quote is absent at r66 base `8d557f85`. An integrator writing only three rows gets `r66-item-4-not-answered-this-round` and L3 MISS. The total is unaffected, so L2's `items=61` still binds.
Repro: `node -e '…extract items67 from .ufo/waves/round-68/probe/ledger68-probe.mjs and call it on rounds 55..66…'` → `total 61 sections 12 | 55..65 = 57 | 66 = 4` (output in §Evidence 4); plus `sed -n 270p .ufo/waves/round-68/probe/ledger68-probe.mjs`. Fix (strengthening, not a freeze edit): the drafted block states "every round-66 item … all four items, D1–D3 *and* the operator note at item 4", and the L1's ledger must carry an `R66-4` row.

**K68ScribeScorecard-2 — low — the plan's "Before" sentence contradicts its own committed receipt.**
Plan: "**Before (base `d23892ad`)**: `LEDGER68_UNMET held=0/7` exit 1 (`base/ledger68-base.txt`)". The receipt and my re-run both read `held=1/7`: L7 (self-confinement proofs: ENV_POISONED self-rerun, symlinked tool, `EXTRACTION_UNSAFE`, child env allow-list) holds at the base because it is independent of the tool's data. A verifier trusting the plan would read L7 as unproven before the round.
Repro: `sed -n 1p .ufo/waves/round-68/base/ledger68-base.txt` → `held=1/7`. The block cites `held=1/7` and names L7 as the only held check.

**K68ScribeScorecard-3 — low — the plan names control receipts in `base/`; the committed scripts write them in `controls/`.**
Plan: "`base/ledger68-donothing.txt`", "`base/ledger68-autoledger.txt`", "`base/deprec68-donothing.txt`". Actual: `W="$LANE/.ufo/waves/round-68/controls"` (`probe/c1-controls.sh`, `probe/c2-donothing.sh`) and `ls .ufo/waves/round-68/base/` → `census-before.txt`, `deprec68-base.txt`, `ledger68-base.txt` only. No claim depends on the path, but a report citing the plan's paths cites files that do not exist.
Repro: `ls .ufo/waves/round-68/base/ .ufo/waves/round-68/controls/` and `grep -n '^W=' .ufo/waves/round-68/probe/c1-controls.sh .ufo/waves/round-68/probe/c2-donothing.sh`.

**K68ScribeScorecard-4 — low (ratchet proposal, strengthening only) — L6 admits a two-cell stub capability row, so the C1 controls are not a zero baseline.**
`ledger68-probe.mjs:399-411` accepts any line under `## Capabilities` whose second pipe field contains `routed-ledger`; the c1 control fixture's `| routed-ledger | stub row |` satisfies it, which is why both c1 controls read `held=2/7` (L6 + L7) rather than 0. Consequence for this seat: L6 will not certify the shape, evidence pointer or round cell of the row I drafted (comment in the block says so). Proposal for the L1: tighten L6 to require 4 cells, a `scripts/routed-ledger.mjs` pointer and a numeric round cell — a strengthening; it must not be applied retroactively to this round's frozen rule, only in the tool's next revision with a new selftest case.
Repro: `sed -n 399,411p .ufo/waves/round-68/probe/ledger68-probe.mjs`; `head -2 .ufo/waves/round-68/controls/c1-donothing.txt`.

## Artifacts

- `.ufo/waves/round-68/build/K68ScribeScorecard/scorecard-block.md` — the patch text: (A) `## Capabilities` row for `routed-ledger` (four cells, evidence pointer, first-working round 68 with the round-66 v1 provenance); (B) the `## Round 68` block with C1 (`LEDGER68_HELD`, L1–L7, counting command, base `held=1/7`, controls `2/7`/`2/7`, kill rule, ratchet, limits) and C2 (`DEPREC68_HELD`, M1–M10, counting command, base `held=1/10`, control `held=1/10`, S233/S234 refusal basis, kill rule, limits), plus maintenance/inherited repairs and a waves paragraph; (C) the `## Planned` round-69 note (three candidates, none scored). Unfilled tokens for the L1: `__FREEZE_COMMIT__`, `__MEASURED_M__`, `__TIP_RECEIPT__`, `__C1_VERDICT__`, `__C2_VERDICT__`, `__SELFTEST_N__`, `__ROWS_AT_M__`, `__GATES__`. sha256 `99d8eb15b7e8c8494b61498464526ea886e1e7746e9a01be2feb3069f87224ad`.
- `.ufo/waves/round-68/build/K68ScribeScorecard/ledger68-base-ownrun-seat.txt` — my base re-run receipt (§Evidence 2).
- `.ufo/waves/round-68/w1/K68ScribeScorecard.md` — this report.

## Limits

- No v2 tool and no `corpus/routed-ledger.md` exist at my read (`test -e` both absent), so L1/L2/L3/L4 could not be exercised at any tip; every "After at M" value in the block is a `__MEASURED__` slot, not a reading.
- I did not run the three controls: they write receipts into `.ufo/waves/round-68/controls/`, outside a leaf scribe's write scope. Their committed verdict lines are quoted as receipts, not reproduced.
- No live fetch (C2 M5) and no pin/capture verification (M3): C2's surfaces were not opened by this seat.
- The item split (§Evidence 4) comes from the frozen parser plus a second parser I wrote from the same documented rule; both are rule-following, not a third-party reading of the twelve spot-checks, and my second parser agreed only after the fence and table clauses were added.
- `LOG.md` carries no round-68 entry at my read, so `__FREEZE_COMMIT__` could not be filled; `SKILL.md`/`corpus/QUALITY.md` registry-home lines (L6) are also still absent, which the block records as work the L1 owns.
- No tool was installed, upgraded or invoked beyond `node`; no git/jj mutation was made; scratch `/fast/scratch/hyaku/kumitate-r68/K68ScribeScorecard/` was deleted after copying the one receipt cited.

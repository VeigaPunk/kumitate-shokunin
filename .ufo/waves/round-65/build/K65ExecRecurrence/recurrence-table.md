# Routed-defect recurrence table — kumitate, round 65 (considerthese/2026-10-25 idea 4)

Built by seat `K65ExecRecurrence`, read-only over committed lane bytes at base `47fe2383151909d31557ada118ad84f90404dc6c`
(round-65 frozen tree `2ca91a0c`). No file under `corpus/`, `scripts/`, `.ufo/pins/`, `.ufo/state/` was written.

Proposal this table answers (verbatim, `considerthese/2026-10-25.md`): *"Count recurrences. Keep a running count of each
routed defect class (the R56-V3 map drift is at seven). When a class passes three, propose a structural fix instead of
another routed item."*

**Counting units are declared, because the lane never declared one** (this is the root cause of the "tenth" error below):

- `reference-drift` is counted as **round opens**: a round whose committed `base/`, `open/` or `baseline/` receipt reads a
  live corpus-map drift (`C2_TOTAL_DRIFT`, `C2_total declared=`, `README_MAP: DRIFT`, `README_MAP: note`), plus the two
  readings that live in wave evidence (r60, r62). Every counted round is printed in `detail=`.
- every other class is counted as **distinct routed item ids**; the id→file map lives in `count.sh` as data and each id is
  verified present in its cited lesson file before it is counted (an uncited id is excluded with a message on stderr).

Canonical counter: `sh .ufo/waves/round-65/build/K65ExecRecurrence/count.sh` → one `class … count=…` line per class, exit 0.

## Table

| class | first | last | count | counting command (independent of count.sh) | structural fix that exists | verdict |
|---|---|---|---|---|---|---|
| reference-drift / map drift (a corpus file lands without its `corpus/README.md` row + `covered` pin) | r35 | r65 | **21 round opens** (7 of them name the culprit file; all 7 name a `lessons/round-NN-verifier-spotcheck.md`) | `for d in .ufo/waves/round-*/base .ufo/waves/round-*/open .ufo/waves/round-*/baseline; do grep -rqE 'C2_TOTAL_DRIFT\|C2_total declared=\|README_MAP: DRIFT\|README_MAP: note' "$d" && echo "$d"; done` | `scripts/readme-map.mjs` (Q48, `corpus/QUALITY.md:882`) + `Q60` plan-before-ready arm (`corpus/QUALITY.md:999`, epoch r65) + `.ufo/pins/readme-map.json` | **FINDING — fix exists but is not preventive**: 7 of the 21 opens are *after* the gate landed at r57 (r58, r60, r61, r62, r63, r64, r65), and the gate only runs at the next round's open |
| number-drift / unreceipted tally | r55 | r64 | **7 ids** (`R55-V2`, `R58-V1`, `R58-V4`, `R58-V5`, `R60-V3`, r63 `D2`, r64 `D1`) | `grep -rn 'unreceipted\|tier counts are wrong\|Seventeen are gates\|9/10 contradicts\|69/69\|125/125' corpus/lessons/round-5*-verifier-spotcheck.md corpus/lessons/round-6*-verifier-spotcheck.md` | `Q50`, `Q53`, `Q61` + `scripts/report-receipt-diff.mjs` | **FINDING — checker scope gap**: no checker reads a selftest tally quoted in prose; r63 `D2` (69/69) and r64 `D1` (125/125) both survived it |
| placeholder token (`__MEASURED__`/`__TIP__`/`__COMMITS__` filed) | r60 | r61 | 2 ids (`R60-V2`, `R61-V4`) | `grep -rn '__MEASURED__\|__TIP__\|__COMMITS__' corpus/lessons/round-6*-verifier-spotcheck.md` | `report-receipt-diff.mjs:54` `PLACEHOLDER` regex (report scope) | below threshold (2) — no finding |
| dangling pointer (cited artifact absent or resolves nowhere) | r52 | r64 | 5 ids (`R52-11`, `R60-V4`, `R61-V1`, r63 `D5`, r64 `D3`) | `grep -rn 'nonexistent evidence\|live only in tmpfs\|resolves nowhere\|absent;' corpus/lessons/round-*-verifier-spotcheck.md` | `Q52` + `report-receipt-diff.mjs` `RECEIPT_MISSING` (`:18`, `:196`) | **FINDING — scope gap**: the checker is report-scope; lessons/SCORECARD/LOG are unscanned, which is where r63 `D5`'s `9237a72` and r64 `D3` live |
| vacuous counter (reads HELD/CLEAN without the claimed activity) | r57 | r63 | 5 ids (`R57-V1`, `R57-V2`, `R57-V3`, `R61-V2`, r63 `D5`) | `grep -rn 'drop-one\|never descends\|name-only\|admit fabrication\|declared holes' corpus/lessons/round-5*.md corpus/lessons/round-6*.md` | `Q43`, `Q57` + `scripts/gate-mutants.mjs` | **FINDING — no harness**: each counter re-authors its own do-nothing control; there is no shared "every new counter ships a do-nothing control" runner |
| forgery (fabricated bytes scored as evidence) | r57 | r61 | 2 ids (`R57-V4`, `R61-V2`) | `grep -rn 'RECEIPT: VALID namesEvasionFile\|fabricated' corpus/lessons/round-*-verifier-spotcheck.md` | `scripts/receipt-evidence.mjs`, `scripts/dispatch-evidence.mjs`, `Q57`, `Q59` | below threshold (2) — no finding |
| dead seat (assigned work never ran) | r53 | r61 | 4 ids (`R53-2`, `R56-V1`, `R60-V6`, `R61-V6`) | `grep -rn 'exit=-9\|dead seat\|undispatched\|seat-accounting' corpus/lessons/round-*-verifier-spotcheck.md` | `scripts/wave-census.mjs --expect`, `scripts/dispatch-evidence.mjs`, `Q54` | **FINDING (minor)** — the fix exists but was itself vacuous until r62 (`R61-V2`) |
| stale premise (frozen literal / wrong id / carried degradation) | r56 | r64 | 4 ids (`R56-V2`, `R58-V3`, `R60-V9`, r64 `D4`) | `grep -rn 'stale frozen\|wrong snapshot id\|S121\|DEGRADED' corpus/lessons/round-*-verifier-spotcheck.md` | `scripts/counter-pins.mjs` + the amendment convention (`Q43`) | **FINDING (minor)** — pins detect byte change, not a stale *claim* about an id |
| landing / attribution | r55 | r63 | 7 ids (`R55-V1`, `R58-V2`, `R58-V6`, `R60-V1`, `R60-V7`, `R61-V3`, r63 `D3`) | `grep -rn 'omitted the two\|64/64\|in-place edits\|LOG tie\|three `-2`' corpus/lessons/round-*-verifier-spotcheck.md` | `Q51`, `Q52`, `Q55` + `report-receipt-diff.mjs` | **FINDING** — `Q51` itself is defeated in the wild (`r63 D5`: hash `9237a72` resolves nowhere) |

Severity: the two blocking items are `K65ExecRecurrence-1` (reference-drift, 21 opens) and `K65ExecRecurrence-2`
(number-drift, 7 ids, one mechanism: a tally quoted in prose with no transcript).

## Disagreement with the integrator's "tenth recurrence" (`corpus/lessons/round-64.md:12`)

`round-64.md:12` calls the r63 spot-check file's rowless landing *"the tenth recurrence of the R56-V3 class"*; `plan.md:115`
calls the r64 file *"the eleventh R56-V3-family recurrence"*. Both numbers are off, and they are off in opposite directions
from a different starting point than they claim.

1. **The lane's own ordinal chain is recoverable from three anchors and it makes the r63 file the ninth, not the tenth.**
   - `Q48` (`corpus/QUALITY.md:882`) fixes occurrence 3 as `(r52, r55, r56)` → r52=1, r55=2, r56=3.
   - `corpus/lessons/round-58.md:42` calls the r57 closure file *"coverage-map drift, fourth recurrence"* → r57=4.
   - `R60-V8` (`corpus/lessons/round-60-verifier-spotcheck.md:195`) calls the r60 file *"sixth recurrence"* → r60=6, so r58=5
     and **r59 is dropped**.
   - `R61-V5` (`corpus/lessons/round-61-verifier-spotcheck.md:242`) calls the r61 file *"seventh recurrence"* → r61=7.
   Continuation: r62=8, **r63=9**, r64=10. So the tenth is the *r64* file — which `plan.md:115` then calls the eleventh.
   The two frozen documents are mutually inconsistent by one and both inherit the same off-by-one.
2. **The likely source of the extra count is a duplicated reading at round 62's open.** That open carries two
   `README_MAP: DRIFT files=149 rows=148 covered=148 bad=2` lines with different `first=` cells:
   `first=uncovered:knowledge/stray-e6-r62.md` (`.ufo/waves/round-62/w2/CritC2WorkingMap.md`) and
   `first=uncovered:lessons/round-61-verifier-spotcheck.md` (`.ufo/waves/round-62/w1/ReadmeGate.md`). The first is a sandbox
   stray fixture, not a landed corpus file; counting readings instead of landed files yields the tenth for r63. Since no
   counting unit was ever written down, both numbers were defensible to their authors and neither is reproducible.
3. **Both numbers omit the four pre-r52 occurrences the lane itself recorded.** `corpus/lessons/round-41.md:137` calls the
   class *"at least the fourth time (rounds 35 and 36 read `declared=77 computed=78` and `79/80`, then round 40 and round
   41 … corrected in attempt 2 from 'second time')"*. The receipts confirm all four: r35 `77/78`
   (`round-35/baseline/`), r36 `79/80` (`.ufo/waves/round-36/baseline/proxy-default.txt:4`), r40 `88/89` (which names
   `lessons/round-39-verifier-spotcheck.md`), r41 `90/91` (`.ufo/waves/round-41/open/receipts.txt:11`). Counting from the
   receipt chain, the r63 file is the **16th** and the r64 file the **17th**.
4. **`considerthese/2026-10-25.md`'s "seven" matches the lane's chain, not reality.** 7 is the r61 ordinal; the receipt
   chain has 17 opens by r61 (16 by r60, 18 by r62, 21 by r65 — see `detail=` in `count.sh`). The consideration is right
   that the class recurs; it understates it by roughly a factor of two.

## What the count buys: the structural cause of the largest class

All seven *named-culprit* readings name the same object: `lessons/round-NN-verifier-spotcheck.md`, i.e. the non-author
closure artifact. Two committed sentences say why it cannot be fixed by discipline: the spot-check's write scope *is* that
one file — *"closure scope allows only this path"* (`corpus/lessons/round-56-verifier-spotcheck.md:108`) and *"the integrator
may write only this path, so the row is the lane's"* (`corpus/lessons/round-64-verifier-spotcheck.md:64`). `Q48` requires
row + pin *in the same change* as the file, while the closure scope forbids that same author from touching
`corpus/README.md` and `.ufo/pins/readme-map.json`. The class is therefore **structurally forced, not a lapse**: it is two
lane rules in direct contradiction, which is why it is now 21 opens old and survives a working detector. The structural fix
is a scope edit (grant the spot-check author its own row + pin, or auto-register at round open) plus the unlanded
`readme-map-close.mjs` (`corpus/lessons/round-63-verifier-spotcheck.md:87`: *"The mechanism (`readme-map-close.mjs`) remains
unlanded"*), **not** a 22nd routed item.

# Class span table — rounds 55..65

Source: `.ufo/waves/round-66/build/K66ScribeClasses/classes.md` §Assignment (57 items, rounds 55-65),
merged with this seat's 17 rows for rounds 61-63 (keys round/item; zero class disagreements).
Round-66 items D1-D3 are outside this seat's scope and are not counted here.

| class | rows | distinct rounds | rounds (seat K68ScribeLedgerC rounds in bold) | status |
|---|---|---|---|---|
| `reference-drift` | 8 | 7 | 56,58,60,**61**,**63**,64,65 | RECURRENT |
| `carried-unaddressed` | 7 | 6 | 55,56,57,**62**,**63**,64 | RECURRENT |
| `dispatch-accounting` | 5 | 5 | 57,58,60,**61**,**62** | RECURRENT |
| `tally-drift` | 7 | 4 | 55,58,60,**63** | RECURRENT |
| `citation-integrity` | 4 | 4 | 58,60,**62**,65 | RECURRENT |
| `report-fidelity` | 4 | 4 | 55,58,60,65 | RECURRENT |
| `wave-shape` | 4 | 4 | 56,**62**,**63**,65 | RECURRENT |
| `dangling-pointer` | 4 | 3 | 60,**61**,64 | watch |
| `frozen-predicate-defect` | 3 | 3 | 56,57,**61** | watch |
| `verification-gap` | 3 | 3 | **62**,**63**,64 | watch |
| `registry-home` | 3 | 2 | 58,65 | - |
| `uncommitted-work` | 3 | 2 | 60,**61** | - |
| `append-only-violation` | 2 | 2 | 57,**61** | - |

RECURRENT threshold: `scripts/routed-ledger.mjs` `--classes` (`rounds >= 4`), the L3 clause `>= 1 class spans >= 4`.

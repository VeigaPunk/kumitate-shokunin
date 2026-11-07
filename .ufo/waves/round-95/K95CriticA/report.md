# K95CriticA — counter constructions for C1 (round 95, seat critic A)

Target: the frozen counter `.ufo/waves/round-95/probe/probe95-c1.mjs`, freeze
`ee8479be66acd906f1d2b5f24f1b75a3d9172c1b`. BASE = `scripts/round-gate.mjs` sha256
`11f83a1a…` (= frozen `ctl-nothing` sha). Constructions built at 21:38, scored 21:43–21:47.

All receipts: `.ufo/waves/round-95/K95CriticA/receipts/`; table and analysis:
`.ufo/waves/round-95/K95CriticA/constructions.md`.

## Verdict: COUNTER finding — 9 of 9 rule-violating gates reach `C95_C1: HELD`

| construction | clause violated | verdict |
|---|---|---|
| `atk-urlonly` | disclosure is unconditional; gate discloses only URL-bearing rows | **HELD** a=1 b=1 c=78/78 d=1 |
| `atk-sorted` | "in file order"; gate sorts the ids | **HELD** a=1 b=1 c=78/78 d=1 |
| `atk-dedupe` | appended per row; gate dedupes by id | **HELD** a=1 b=1 c=78/78 d=1 |
| `atk-crlf` | a 13-field CRLF row declares; gate calls it malformed | **HELD** a=1 b=1 c=78/78 d=1 |
| `atk-vocab` | only `rejected` suppresses; gate demands {mined,queued,rejected} | **HELD** a=1 b=1 c=78/78 d=1 |
| `atk-nofailclosed` | array "always present on every `--json`"; fail-closed path drops the key | **HELD** a=1 b=1 c=78/78 d=1 |
| `atk-hardcode` | unconditional disclosure; gate discloses only `['S002','S003','S004','S007']` | **HELD** a=1 b=1 c=78/78 d=1 |
| `atk-dupskip` | every row judged by field count; gate drops both rows of a repeated id | **HELD** a=1 b=1 c=78/78 d=1 |
| `atk-noindent` | row regex allows 0–3 spaces; gate's disclosure anchors at column 0 | **HELD** a=1 b=1 c=78/78 d=1 |
| `ctl-nothing` (done-nothing re-run) | — | **UNMET** a=0 b=0 c=0/78 d=1 (right reasons) |
| candidate `c5a2f8ac…` (= `READY`) | — | **HELD** a=1 b=1 c=78/78 d=1 |

Verdict lines: `receipts/atk-*.txt`, `receipts/ctl-nothing.txt`, `receipts/candidate.txt`.
Construction sha256 list: `receipts/attack-shas.txt`; seat copies hash-identical to scored bytes.

## Strongest counterexample (undisclosed clause, one line of code)

`atk-urlonly` — `if (fields.length !== 13) { if (line.includes('http')) malformed.push(id); continue; }`.
Disclosure is conditional, which the rule forbids, yet (a) cannot see it because all four fixture
malformed rows carry an `https://` source. Reference vs attack on a registry with the missing
shapes (`receipts/clause-differential.txt`):

```
ctl-positive (regenerated, sha 5c472696… = frozen) malformedRows=["S002","S005","S006","S008","S008","S000"]
atk-urlonly                                        malformedRows=["S005"]
atk-nofailclosed FAIL-CLOSED citationsKeys=[… declared, unresolved, …] malformedRows=null   (reference: [])
```

`atk-nofailclosed` is the plan's own disclosed hole (§C1: "The counter does not exercise the
fail-closed `--json` path's `malformedRows`"); the other eight are undisclosed.

## Why each arm misses (measured)

- **(a)** the four fixture malformed rows are LF, unindented, distinct, URL-bearing, ascending, so
  order/dedupe/indent/URL-presence/CRLF/vocabulary are invisible; fixture 13-field rows use only
  in-enum statuses.
- **(b)** no registry → `[]`; every construction passes it by construction.
- **(c)** measured, not inferred (`c-vacuity.mjs`, `receipts/c-vacuity.txt`): the declared step is
  reached in **1 of 78** rounds (`r93 declared=2`, `receipts/c-r93-detail.txt`), and the real registry
  has **0** non-13-field rows (210 rows, all `NF=13`, no CR). (c) can only catch well-formed-row
  regressions — every construction is identical there.
- **(d)** the BASE selftest has **no** `malformedRows` arm: all 9 constructions score `79/79 pass`.

## Impact on the axes / on C1

- Operability (`f_O`, the claim's own axis): `C95_C1: HELD` is a **necessary** condition only. It
  certifies the counter's fixture tuple, unchanged behaviour on 78 well-formed-row reports, and a
  selftest silent on this rule. It does **not** certify the rule's disclosure clause, file order,
  per-row append, CRLF/indent tolerance, or the fail-closed shape. A wrong tool of the
  `atk-urlonly` shape would be admitted by the counter alone; the clause-level check remains the
  reviewer's / K2's, as `plan.md` assigns it (disclosed for #6 only).
- Coverage/harm surface: unchanged — I wrote nothing outside my seat dir; no lane, fleet, plan,
  probe, controls or candidate file was touched. `ctl-positive` was regenerated into my scratch
  (`receipts/regen-controls-sha.txt`) and reproduces `5c472696…`; I did not edit the frozen copy.
- Low-severity byproducts: `atk-vocab` mirrors `sources-check.mjs` `STATUS_ENUM` (E07), so its
  hazard is bounded while the enum holds; arm (d) depends on the inherited `TMPDIR` existing
  (`receipts/tmpdir-enoent-repro.txt`: missing dir → `mkdtemp` ENOENT → d=0, a false UNMET only).

## Smallest safe correction (route, not an edit — M93-3 counter repair)

1. (a) fixture: add a 12-field row **without** a URL; a 12-field row indented 3 spaces; two malformed
   rows sharing one id; a malformed id sorting **below** `S001` placed last; a 13-field **CRLF** row
   that must declare; a 13-field row with a status outside {mined,queued,rejected}. Extend `EXP_MALF`
   in file order (duplicates kept) — kills rows 1,2,3,4,5,7,8,9.
2. New arm (e): `--json` with a missing `--reports-dir` must print `citations.malformedRows === []`
   — kills row 6 at counter level.

No verdict was changed by this seat; the frozen `C95_C1` at M remains the admission gate (K1).
Scratch `/fast/scratch/hyaku/kumitate-r95/K95CriticA` removed after the receipts were copied.

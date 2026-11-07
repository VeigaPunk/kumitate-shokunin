# K96CriticA — counter constructions beyond the 20 controls (round 96, claim C1)

Frozen counter: `probe/probe96-c1.mjs`, `--freeze 617e80cd8b01efb5748d729dbdcac95734bc461d`
(fleet rev `056a9c4813fe9baa4f994e145459612151e5ace5`, 79 reports). BASE sha256
`aba737dc41ffbed44b486fc27f9375f6c100608c45431a41d95041ad4e5c4da3`; L1 reference
`ctl-positive` sha256 `8793e0d905ed690c329c884f6f6071409785fa1bb1594d7adaf0ae35071fbe6c`
regenerated into scratch with `probe/make-controls96.py` and byte-identical to
`controls/controls-sha256.txt:18`.

Method: every construction is `ctl-positive` (the L1 reference rule R96) plus exactly one
patch, each patch asserted to hit once (`build-constructions.py`). Tools and `cap-spawn.mjs`/
`cap-run.mjs` copies: `constructions/`. Run form per construction:

    node probe/probe96-c1.mjs --tool constructions/<name>.mjs \
      --work <scratch>/work/<name> --freeze 617e80cd8b01efb5748d729dbdcac95734bc461d

Verdict receipts: `receipts/<name>.txt`. HELD means the counter accepts the wrong gate.
Wrongness is shown independently by `differential.mjs`: one throwaway git fixture, one
`SOURCES.md` per construction, the construction vs `ctl-positive` (`--json`), and the fleet
census (`scripts/sources-census.sh validate --file`) on the same file. The reference's
`outsideRows`/state reading matches the census E12/state in every case; the construction does
not. Receipt: `receipts/differential.txt`.

## Constructions (14; 8 reach HELD)

| # | construction | R96 clause violated | distinguishing input (ref/census vs construction) | C96_C1 |
|---|---|---|---|---|
| 1 | `ws-class` | heading separator is `[ \t]` only (`^ {0,3}##[ \t]`); JS `\s` also accepts `\v`, `\f`, U+00A0 | `S900` row, `##\vRegistry`, `S001` row: census E12 `[S900 S001]`, ref outside `[S900,S001]` declared `[]`; con declares `casB`, outside `[S900]` | **HELD** `a=b=c=d=1 e=79/79 f=1` |
| 2 | `indent-class` | indentation is ` {0,3}` (spaces only); `[ \t]{0,3}` accepts a tab-indented heading | `## Registry`, `\t## Leads`, `S002`: census E12 `[]`, ref declares `casC`; con outside `[S002]` | **HELD** `1/1/1/1 79/79 1` |
| 3 | `trail-tab` | heading text stripped of trailing SPACES **AND TABS**; con strips spaces only | `## Registry\t`, `S003`: census E12 `[]`, ref declares `casD`; con outside `[S003]` | **HELD** `1/1/1/1 79/79 1` |
| 4 | `lastindex` | heading text is after its **first** `##`; con slices after the last | `## Foo ## Registry`, `S004`: census E12 `[S004]`, ref outside `[S004]`; con declares `casE` | **HELD** `1/1/1/1 79/79 1` |
| 5 | `outside-unindented` | every row-shaped line (`SOURCES_ROW_RE`, ≤3 leading spaces) outside is listed; con lists column-0 pipes only | no heading, `   \| S005 \| …`: census E12 `[S005]`, ref outside `[S005]`; con `[]` | **HELD** `1/1/1/1 79/79 1` |
| 6 | `fence-rows` | "the gate mirrors the CENSUS, not CommonMark": a fenced row is still a row | `## Registry`, ```` ``` ````, `S006` row, ```` ``` ````: census E12 `[]`, ref declares `casG`; con skips the row (declared `[]`) | **HELD** `1/1/1/1 79/79 1` |
| 7 | `no-registry-fastpath` | state starts `false`; every row outside is appended even when the text has no `Registry` | `S007`, `S008`, no `## Registry`: census E12 `[S007 S008]`, ref same; con `[]` (early return) | **HELD** `1/1/1/1 79/79 1` |
| 8 | `hardcode-fixtures` | whole rule; recognises `fixture r96 A/B` titles and replays canned lists | FIX-A title + unrelated `S777` row: census E12 `[]`, ref declares `casA`; con returns outside `[S901…S028]`, malformed `[S002]`, declared `okA` | **HELD** `1/1/1/1 79/79 1` |
| 9 | `text-always` | text line printed **only when n > 0**; con prints `outside=0 []` | text mode, registry, no outside row: ref prints no line; con prints one. Counter arm (c) sees only FIX-A (n=11) → passes; arm (f) fails: selftest 86/89 (checks 40, 52 expect the exact green line set; 79 cascades) | UNMET `a=b=c=d=1 79/79 f=0` |
| 10 | `startswith-registry` | heading text `equals exactly Registry` | FIX-A `## Registry ##`/`## Registry\r`, FIX-B `## Registry\r` | UNMET `a=0 b=0 c=0` |
| 11 | `includes-registry` | heading text equality after the first `##` | same lines as 10 | UNMET `a=0 b=0 c=0` |
| 12 | `cap-10` | full list, file order, repeats kept | FIX-A has 11 outside ids | UNMET `a=0` |
| 13 | `field-2` | id is `line.split('\|')[1]`, trimmed | FIX-A/FIX-B outside ids | UNMET `a=0 b=0 c=0` |
| 14 | `blank-switch` | a heading sets the state immediately | FIX-A fenced `## Leads` is not followed by a blank line → `S007` stays inside → `fenceG` declared | UNMET `a=0` |

All unshown arm values are on each receipt's `C96_C1` line (the `c` arm is `0` wherever the
outside list differs from FIX-A; `b=1` where FIX-B agrees). Every UNMET row has `d=1`,
`e=79/79`, `f=1` except row 9. Full lines in `receipts/*.txt`.

## Counter findings (8; frozen verdict untouched)

F1–F7: the eight HELD rows above are R96 violations the frozen counter cannot see — it scores
`HELD` for a gate that differs from R96 on inputs FIX-A/FIX-B do not contain: the heading
separator class (F1), the heading indentation class (F2), the trailing-tab half of the strip
rule (F3), the "first `##`" half of the heading-text rule (F4), the ≤3-space allowance for
outside rows (F5), fence-treatment of rows (F6), and the absent-registry-but-rows case (F7).
Each is pinned by the census on the distinguishing file (`receipts/differential.txt`), so the
reference, not the construction, is the census-mirroring reading. The nearest existing controls
are different shapes: ctl-nospace/ctl-anyindent/ctl-casefold/ctl-closeseq/ctl-fence each fail
FIX-A on a line these eight handle identically.

F7 detail: arm (d)'s "no-registry fixture" is `fixture('nosrc', null)` — it writes
`corpus/README.md` and no `SOURCES.md`, i.e. *no file*, not *a file without a `## Registry`
heading*. The absent-section-with-rows case (all ids must land in `outsideRows`) has no arm.

F8: `hardcode-fixtures`. The plan discloses fixed seed tokens ("Fixture tokens are fixed
seeds, not a nonce"); it does not bound fixture *titles/ids*: a gate that special-cases
`fixture r96 A/B` and replays the expected lists is byte-identically HELD. This is the general
limit of a fixed, public suite rather than a semantic near-miss; it needs no R96 clause to be
wrong. Listed as adversarial, lowest priority.

Non-finding: `text-always` (row 9) is UNMET, but only through arm (f). Arm (c) runs text mode
on FIX-A only (n=11), so the n=0 half of "only when n > 0" is guarded solely by the shipped
selftest's exact-line checks; the K2 18-shape battery does not contain it.

## Smallest safe correction (routed to round 97; frozen bytes not touched)

1. Add one FIX-A clause per finding, each pre-data-pinned by a one-line control like the
   existing 18: `##\vRegistry` (and one more Unicode separator), `\t## Leads`, `## Registry\t`,
   `## Foo ## Registry`, a 3-space-indented outside row, and a row inside a ``` fence inside
   the registry.
2. Add a fourth fixture (or extend (d)): `SOURCES.md` with rows and **no** `## Registry`
   heading — `outsideRows` = every id, text line printed. Today the "no-registry" arm tests
   only an absent `SOURCES.md`.
3. Optional, only if fixture-fitting is in scope: randomise fixture row ids/titles per run
   (a counter-side nonce). No byte-equality control can do this.

Impacted axes: operability (C1, terminal `f_O`); the 10 coverage sub-axes are unaffected.
Counter verdicts above are per-construction receipts, not the candidate's: K1 still reads the
candidate bytes at the integration commit.

## Do-nothing control re-run (confirmed)

`receipts/do-nothing.txt` (tool = lane `scripts/round-gate.mjs`, sha256 `aba737dc…`) is
`UNMET a=0 b=0 c=0 d=0 e=0/79 f=1`, line-for-line identical to `controls/ctl-nothing.txt`
except the `freeze=` value and the wrapper's trailing `exit=` line: FIX-A declares 15 tokens
(the 8 outside ones: pre, fenceG, leadI, leadJ, closeM, lowerN, crO, h1R), `outsideRows` is
`null` in FIX-A/B/CLOSED, and `malformedRows` includes the outside 12-field `S022`.

## Evidence index (all under this seat dir)

`build-constructions.py`, `differential.mjs`, `constructions/*.mjs`,
`receipts/{14 constructions,do-nothing,differential,text-always-selftest}.txt`.

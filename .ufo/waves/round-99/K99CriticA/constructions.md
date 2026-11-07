# K99CriticA — round 99 C1 counter constructions

Counter: `.ufo/waves/round-99/probe/probe99-c1.mjs` sha256 `de7b62323b4407f319490dacddf6529976fecf937645be0389e48e286f7b0724`
(frozen; never edited). Run form `node <probe> --tool <bytes> --work <scratch> [--seed <16hex>]`; all verdict lines are in
`raw/counter-summary.txt`, one file per run in `raw/`. All constructions below are **not** among the 17 controls in
`.ufo/waves/round-99/controls/`; they were built from BASE `f9cd1bff` bytes with the same single-line rewrite pattern as
`probe/make-controls99.py` (`gen/make-constructions.py`, sha256 `7d8da099…`). Each is a deliberate R99 violation.

`READY` (shipped candidate) was present during this review: sha256 `50b94567905676cc31c78ca47e76fd3ba625a7ae0d933b597fca0e74e1463f31`.
"Selftest kill" = the same wrong shape re-applied to those shipped bytes (`gen/make-shipmut.py`, sha256 `137653d6…`),
`node <mutant> --selftest` with `SHOKUNIN_ROOT=/home/vgpnk/Projects/shokunin`; receipts `raw/shipselftest/`,
summary `raw/shipselftest/summary.txt`. Baseline shipped suite: 90/90 pass, exit 0 (`raw/ship-selftest.txt`).

Minimal fixtures live in `minfixtures/<name>/corpus/SOURCES.md`; differential receipts in `minimal-diff/<name>.txt`.

## A. Wrong implementations that read `C99_C1: HELD`

| # | construction (mechanism) | R99 violation | counter line | minimal fixture vs census | selftest kill |
|---|---|---|---|---|---|
| 1 | `k01-transparent-nul` — `trim` = blank + `\u0000` | strips a class R99 must keep | **HELD** `seed=387286e49007e28e` `sha=2a4f2957…` | id `\x00S123\x00`: census `E02 S123`, tool CLEAN rows=1 (`minimal-diff/k01-transparent-nul.txt`) | **no** (90/90) |
| 2 | `k02-transparent-u0080` — blank + `\u0080` | same | **HELD** `seed=49fd0276d58fbfd5` `sha=e38dc05e…` | id `\x80S123\x80`: census `E02 \x80S123\x80`, tool CLEAN rows=1 (`k02-transparent-u0080.txt`) | **no** (90/90) |
| 3 | `k03-padcap17` — blank run capped at 17 | trim must be unbounded | **HELD** `seed=9b9434794adbbbad` `sha=b53b9216…` | id with 18 leading SP: census `ok` exit 0, tool `ID_FORM id= S123` rows=0 (`k03-padcap17.txt`) | **no** (90/90) |
| 4 | `k04-unchecked-cells-js` — source/scope/anchor/teaches use JS `trim()` | every Registry cell must use blank | **HELD** `seed=6c0fce34261db721` (again `726c08e9`) `sha=f6195f3d…` | NBSP-only `source`: census `ok` exit 0, tool `ROW_FIELD_EMPTY` exit 1 (`k04b-rowfield-source.txt`); NBSP scope: census `W04`, construction silent (`k04-unchecked-cells-js.txt`) | **no** (90/90) |
| 5 | `k05-title-sniff` — blank only if the text matches `SOURCES — where fixture-[0-9a-f]+ learns`, JS otherwise | trim must not depend on the document | **HELD** `seed=08c8aa7d704fcde4` `sha=416f66eb…` | title `where min learns`, NBSP id: census `E02 \xa0S123\xa0`, tool CLEAN rows=1 (`k05-title-sniff.txt`) | **yes** (14 arms: all `r99trim-*`) |
| 6 | `k06-size-sniff` — blank only when `>200` lines start with `\|` | same | **HELD** `seed=bac3f890166387d5` `sha=b8bf0d2c…` | small NBSP-id file: census `E02`, tool CLEAN (`k06-size-sniff.txt`) | **yes** (14 arms) |
| 7 | `k07-order-sniff` — blank only when Registry ids are not ascending | same | **HELD** `seed=691f4d4d14a25248` `sha=3fa551eb…` | ascending `S001`, `\xa0S002\xa0`: census `E02`+`E04`, tool CLEAN (`k07-order-sniff.txt`) | **yes** (14 arms) |
| 8 | `k08-empty-id-count` — `counts.rows` also counts empty-id rows with content | counts must follow the census-derived contract | **HELD** `seed=f69621d0ce56e7dd` `sha=e7729a24…` | one empty-id row: census `rows=1`, `E02`=1 → counter (e) expects 0; tool reports 1 (`k08-empty-id-count.txt`) | **no** (90/90) |
| 9 | `k09-bom-sniff` — blank only when the file does **not** start with U+FEFF | trim must not depend on a file BOM | **UNMET** seeds `0000000000000000/1/2` (BOM), **HELD** seeds `0000000000000003`, `0000000000000004` (no BOM) — same bytes `sha=c6c2c7a1…` | BOM fixture + NBSP id: census `E02 \xa0S125\xa0`, tool CLEAN (`k09-bom.txt`); no-BOM fixture agrees (`k09-nobom.txt`) | **no** (90/90) |
| 10 | `k10-census-counts` — `counts.rows` = `bash /home/vgpnk/Projects/shokunin/scripts/sources-census.sh census` rows − its `E02` lines | count must not be imported from the fleet authority | **HELD** `seed=85fe0e4a62c13b9f` `sha=1fb648ce…` | **none possible**: the count *is* the census value, so (e) is circular (`k10-census-counts.txt`) | **no** (90/90) |
| 11 | `k12-env-sniff` — blank only when `SHOKUNIN_ROOT` is set to a non-fleet dir | trim must not depend on the harness | **HELD** `seed=eba8a92f4ae28948` `sha=007f4148…` | same fixture, `SHOKUNIN_ROOT` unset (real-lane style): census `E02 \xa0S127\xa0`, tool CLEAN; with harness env tool `ID_FORM` matches census (`k12-env-sniff.txt`) | **yes** (14 arms) |

## B. Sanity rows (the grid does have teeth at its boundaries)

| # | construction | counter line | why it fails | selftest |
|---|---|---|---|---|
| 12 | `k03a-padcap16` — cap at 16 | **UNMET** `seed=8c6f30f14d47ad29` `sha=9d363213…` | the drawn max blank run is 17 (pad unit `SPTAB`/`TABSP` × 8 = 16, plus the `join(' \| ')` space), so cap 16 leaves one blank | **killed** (`r99trim-blank-accepted`, pad length 8 = 17 effective) |
| 13 | `k11-nel-extra` — blank + U+0085 | **UNMET** `seed=01dfcf07e37c69d7` `sha=02842185…` | NEL is in the 47-class grid and both readers reject it | **killed** (`r99trim-id-nel`) |

## C. Shape of the holes

- **Undrawn classes** (1,2): NUL and U+0080 are absent from the 47-class grid and from the shipped selftest pad list; any
  class outside the list can be added to `trim` and both gates stay green.
- **Boundary** (3,12): the effective maximum blank run the battery can draw is 17; `{1,17}` is bit-identical to unbounded
  on every drawn row, and the selftest's blank-accepted arm also stops at 17.
- **Unchecked cells** (4): the battery pads only id/kind/tier/status/opened/recheck; the census E-comparison covers only
  those cells; `source/scope/anchor/teaches` (and `ROW_FIELD_EMPTY`) are compared nowhere, so JS trim there is invisible.
- **Provenance sniffing** (5,6,7,9,11): the candidate can read the fixture it is given. The same bytes read HELD or UNMET
  across seeds (9); title/size/order/env keys are invisible to (a)–(g), and BASE's own suite (though not the shipped one)
  pins none of them.
- **Counting** (8,10): the battery never draws empty-id rows (disclosed limit 3), and (e) is defined as census `rows` − `E02`,
  so a census-delegating count satisfies it by definition. (Plan limit 4 said delegation is not prevented; this receipt
  shows a concrete tool that reads HELD while containing an absolute-path `sources-census.sh` import.)
- **Weak h** (all BASE-chassis rows): arm (h) runs the candidate's own selftest. BASE's suite passes every shape here
  (h=1); only the shipped suite has teeth, and even it leaves 1,2,3,4,8,9,10 alive.

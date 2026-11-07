# K100CriticA — C1 counter constructions (kumitate round 100)

Frozen counter: `.ufo/waves/round-100/probe/probe100-c1.mjs` (fresh seed per run, printed; `--seed` replays).
Counter candidates built from BASE `5e2f9856` by `build.py` (each rewrite asserted to apply exactly once).
Independent differential: `differential.py` (both arms: cite-sources + source-capture, census `validate` oracle).
Shipped-selftest kill: `hybrid_selftest.py` (READY bytes with the same reader swap, then `--selftest`).
Receipts: `receipts/<name>.txt` (counter), `receipts/DIFFERENTIAL.txt`, `receipts/HYBRID.txt`.
Scratch: `/fast/scratch/hyaku/kumitate-r100/K100CriticA/` (removed before yield).

## Result

18 distinct wrong reader pairs, none among the 16 pre-data controls. **14 read `C100_C1: HELD`**
(h01–h14); the four k-calibrations read UNMET. **All 18 are caught by the independent census
differential** — the frozen counter is not a proof of R100, it is a refutation budget over the
15 drawn shapes (plan limit 4), and the omitted classes are enumerated below.

The shipped READY selftests (K2 arm) kill only h09–h11 and h13; they do **not** kill h01–h08,
h12 or h14. So the counter and the shipped selftests share the same blind spot: the drawn classes.

## Table

| # | construction (mechanism) | counter | census differential | shipped selftest kill |
|---|---|---|---|---|
| h01 | `u2000-pad` — id cell trimmed with `[\t \u2000]` (U+2000 EN QUAD) | `HELD a=1 b=1 c=1 d=1` seed `e29e2e656b691333` (`receipts/h01-u2000-pad.txt`) | **CAUGHT** — `|\u2000S123\u2000|` → census `E02`, cite `CLEAN cited=1`, capture `S123:uncaptured` | **NO** (hybrid both selftests PASS) |
| h02 | `zs-omitted-pad` — `[\t \u2000\u2001\u2004-\u2008\u200a]` (the 8 JS Zs code points the grid never draws) | `HELD a=1 b=1 c=1 d=1` seed `44ee37d3d7a8718e` (`receipts/h02-zs-omitted-pad.txt`) | **CAUGHT** — `|\u2007S123\u2007|` → census `E02`, both arms valid | **NO** |
| h03 | `nul-pad` — id cell trimmed with `[\t \x00]` (NUL; grid draws U+0001/U+001F, not NUL) | `HELD a=1 b=1 c=1 d=1` seed `248622c7d1dab7b2` (`receipts/h03-nul-pad.txt`) | **CAUGHT** — `|\x00S123\x00|` → census `E02`, both arms valid | **NO** |
| h04 | `zwnj-zwj-strip` — strips U+200C/U+200D before matching | `HELD a=1 b=1 c=1 d=1` seed `30c1464f2c5d584f` (`receipts/h04-zwnj-zwj-strip.txt`) | **CAUGHT** — `|\u200cS123\u200d|` → census `E02`, both arms valid | **NO** |
| h05 | `idcap8` — id `S[0-9]{3,8}` (grid draws 3–8; live max 4) | `HELD a=1 b=1 c=1 d=1` seed `61ca7651ebbf3629` (`receipts/h05-idcap8.txt`) | **CAUGHT** — `S123456789` (9 digits) → census valid, both arms DRIFT/FAIL-CLOSED | **NO** |
| h06 | `idcap9` — id `S[0-9]{3,9}` | `HELD a=1 b=1 c=1 d=1` seed `2c73ee9a455c7f91` (`receipts/h06-idcap9.txt`) | **CAUGHT** — `S1234567890` (10 digits) → census valid, both arms invalid | **NO** |
| h07 | `indent-u2000` — row gate `^[ \u2000]{0,3}\|` | `HELD a=1 b=1 c=1 d=1` seed `f89b913a47fbc886` (`receipts/h07-indent-u2000.txt`) | **CAUGHT** — `\u2000\| S123 |...` → census no row (no E06), both arms valid | **NO** |
| h08 | `thinspace-digit-strip` — strips U+2009 only between digits (thousands separator) | `HELD a=1 b=1 c=1 d=1` seed `1d174bb8b273b5ce` (`receipts/h08-thinspace-digit-strip.txt`) | **CAUGHT** — `| S1\u200923 |` → census `E02`, both arms valid | **NO** |
| h09 | `fixture-example-invalid` — correct reader iff the doc contains `example.invalid`, BASE otherwise | `HELD a=1 b=1 c=1 d=1` seed `f44a06556e8b0fa3` (`receipts/h09-fixture-example-invalid.txt`) | **CAUGHT** — NBSP-pad row in a doc without `example.invalid` → census `E02`, both arms valid | **YES** — `r100-pad-nbsp-not-row` FAIL (fallback BASE accepts NBSP) |
| h10 | `fixture-ztier` — correct reader iff a `Z<digits>` tier cell exists | `HELD a=1 b=1 c=1 d=1` seed `9150be6d09cc1a7e` (`receipts/h10-fixture-ztier.txt`) | **CAUGHT** — NBSP-pad row with tier `A` → census `E02`, both arms valid | **YES** — same case |
| h11 | `size-threshold` — correct reader iff the doc is over 100 lines | `HELD a=1 b=1 c=1 d=1` seed `cf0c6710b912754b` (`receipts/h11-size-threshold.txt`) | **CAUGHT** — NBSP-pad row in a <100-line doc → census `E02`, both arms valid | **YES** — same case |
| h12 | `linecap-1000` — reads only the first 1000 LF records | `HELD a=1 b=1 c=1 d=1` seed `2ccfcc786b10c212` (`receipts/h12-linecap-1000.txt`) | **CAUGHT** — row at line 1001 → census `E06 S123 tier=Z0`, both arms DRIFT/FAIL-CLOSED | **NO** (selftest fixtures are short) |
| h13 | `census-delegation` — shells out to `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh` (tier cell rewritten to `Z0`), BASE fallback when the census yields no valid id | `HELD a=1 b=1 c=1 d=1` seed `f3a97b90f2202f30` (`receipts/h13-census-delegation.txt`) | **CAUGHT** — NBSP-pad row: census `E02`, cite/capture accept via the BASE fallback | **YES** — `r100-pad-nbsp-not-row` FAIL (fallback BASE accepts NBSP) |
| h14 | `readme-gate` — README citation gate `^\| ` instead of `^\s*\| ` (row reader correct) | `HELD a=1 b=1 c=1 d=1` seed `4ddaab48ee9b1c42` (`receipts/h14-readme-gate.txt`) | **n/a** (README arm, not a census question); README fixture with an indented row: BASE `cited=1`, candidate `cited=0` | **NO** |
| k01 | `cr-split` — capture splits records on `\r\n|\r|\n` (CR but not LS/PS) | `UNMET a=1 b=0 c=1 d=1` seed `c60442468dae0197` (`receipts/k01-cr-split.txt`) | CAUGHT (capture arm) | YES |
| k02 | `crlf-dollar` — capture requires `\|$` without stripping the CRLF CR | `UNMET a=1 b=0 c=0 d=0` seed `0c1bd90df8bcafe5` (`receipts/k02-crlf-dollar.txt`) | CAUGHT (capture arm) | YES |
| k03 | `leadzero` — id `S[1-9][0-9]{2,}` (live lanes carry 1,424 `S001…` rows) | `UNMET a=1 b=1 c=0 d=0` seed `4fbb1ee338624c53` (`receipts/k03-leadzero.txt`) | CAUGHT (both arms) | YES |
| k04 | `nel-vt-ff-split` — capture splits records on NEL/VT/FF | `UNMET a=1 b=0 c=1 d=1` seed `57a7491569c31a8b` (`receipts/k04-nel-vt-ff-split.txt`) | CAUGHT (capture arm) | NO |

## Why the HELD set is wrong (R100)

R100: one LF record is one line; row gate 0–3 ASCII SP then `|`; id cell trimmed of ASCII SP/TAB
**only**; id = `S` + 3+ ASCII digits closed by `|`. The census `row_pass` (`sources-census.sh`
lines 574–695) trims `[ \t]` and tests `^S[0-9]{3,}$` — no upper bound, leading zeros allowed.

- h01/h02/h03/h04/h08 accept a pad the census does not trim (U+2000, U+2001, U+2004–U+2008,
  U+200A, NUL, ZWNJ/ZWJ, a digit-group U+2009). The grid draws U+2002/U+2003/U+2009 (so a global
  U+2009 strip is caught — that variant was built and rejected), but not the other 8 `\s` members.
- h05/h06 cap the digit run; the grid draws 3–8 digits and live lanes max 4, so 9+ is never drawn.
- h07 accepts 0–3 U+2000 as indent; the grid draws 0–3 SP and 15 other indents, not U+2000.
- h09/h10/h11 key on invariants of the battery itself (`example.invalid` in every source cell,
  `Z<nonce>` in every tier cell, ~148 lines). The (c) arm cannot see the fallback: 0/21 live
  SOURCES carry either marker and 0/21 carry an undrawn pad (K99: 0 of 5,555 rows).
- h12 caps the scan at 1000 LF records; the battery is ~148 lines and the live max row line is
  984, so both arms pass. A row at line 1001 is the differential.
- h13 is the disclosed limit (3): it delegates to the census and only falls back to BASE when the
  census yields no valid id — so it is *right* on the battery and live lanes and *wrong* on a
  registry whose rows are all invalid.
- h14 is a contract violation, not a census-agreement defect: R100 says the README citation
  reader is unchanged; 0/21 live READMEs indent a map row, so the (c) arm cannot see it and the
  shipped selftest has no indented-row fixture.

## Smallest safe correction

1. Probe battery: add the 8 omitted Zs code points, NUL, ZWNJ/ZWJ as pad classes; add U+2000
   indent; add 9- and 10-digit ids; add a row at line >1000 (or a >800-row registry); add a
   README with an indented map row to the (c) arm.
2. Probe battery: remove the fixture invariants — realistic source URLs and tier A/B/C, with the
   E06 oracle taken from a tier-rewritten copy (the h13 mechanism) — so h09–h11 have no marker.
3. Probe: add a census-independence arm (run the candidate with a `bash` shim that exits 1, or
   with the census path unavailable); a pure reader passes, a delegation candidate fails. This
   closes disclosed limit (3) mechanically instead of by disclosure.
4. Shipped selftests (K2): add the same undrawn classes as `r100-*` string fixtures (U+2000/
   U+2001/U+2004–U+2008/U+200A pads, NUL, ZWNJ/ZWJ, 9+ digit ids, U+2000 indent, an indented
   README row). The fixtures are strings; the cost is a few lines per suite.
5. Do not edit the frozen counter this round (K4); route as the next round's counter repair.

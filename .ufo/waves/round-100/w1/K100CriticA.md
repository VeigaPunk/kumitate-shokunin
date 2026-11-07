# K100CriticA — C1 counter attack (kumitate round 100, w1)

Scope: attack the frozen counter `probe/probe100-c1.mjs` for C1 (operability), not the task owner.
Read-only on the lane; every artifact below is under `.ufo/waves/round-100/K100CriticA/`.
Full table + receipts: `K100CriticA/constructions.md`, `K100CriticA/receipts/`.

## Counterexample (strongest, local evidence)

A wrong reader that trims the id cell with `[\t \u2000]` (U+2000 EN QUAD accepted as a pad)
reads the frozen predicate **`C100_C1: HELD a=1 b=1 c=1 d=1`** (seed `e29e2e656b691333`,
`receipts/h01-u2000-pad.txt`). The census trims ASCII SP/TAB only (`row_pass`, `sources-census.sh`
574–695: `trim()` = `gsub(/^[ \t]+|[ \t]+$/)`), so the same row is census `E02`; the independent
differential catches it (`receipts/DIFFERENTIAL.txt`: `|\u2000S123\u2000|` → census invalid,
cite `CLEAN cited=1`, capture `S123:uncaptured`). The shipped READY selftests do **not** kill it
(`receipts/HYBRID.txt`: both suites PASS) — the `r100-*` fixtures draw NBSP/U+2003/VT/CR/U+FEFF/
U+2028 but never U+2000/U+2001/U+2004–U+2008/U+200A.

The same holds for the other undrawn-class constructions: the full omitted Zs range (h02), NUL
pads (h03), ZWNJ/ZWJ stripping (h04), 8- and 9-digit id caps (h05/h06), 0–3 U+2000 indent (h07),
U+2009 between digits (h08) — all `HELD`, all shipped-selftest PASS — plus a 1000-LF-record scan
cap (h12) and the tightened README gate `^\| ` (h14), which also survive both.

A second, different mechanism (also HELD, and killed by the shipped selftests): the battery is **fixture-identifiable**. Every row carries
`example.invalid` and a `Z<nonce>` tier, and the file is ~148 lines. A reader that uses the
correct rule only when one of those markers is present and falls back to BASE otherwise reads
`HELD` (h09–h11). The (c) arm cannot see the fallback: 0/21 live SOURCES carry either marker and
0/21 live rows carry an undrawn pad (K99: 0 of 5,555). The shipped selftests do kill these three
(the markerless fixtures exercise the fallback), so K2 covers this mechanism but not the
undrawn-class one.

## Evidence

- `K100CriticA/build.py` — 18 construction pairs from BASE `5e2f9856`; each rewrite asserted once.
- `K100CriticA/receipts/h01…h14,k01…k04.txt` — frozen-counter verdict lines (seed + both sha256).
- `K100CriticA/differential.py` + `receipts/DIFFERENTIAL.txt` — census `validate` vs both arms on
  a minimal 13-field fixture per construction; all 18 CAUGHT (h14 on the README arm).
- `K100CriticA/hybrid_selftest.py` + `receipts/HYBRID.txt` — READY bytes with the same reader
  swap, `--selftest`: h01–h08, h12, h14 PASS (no kill); h09–h11, h13 FAIL (kill).
- Calibrations: k01 (CR split) `UNMET a=1 b=0 c=1 d=1`; k02/k03/k04 exercised the same way.

## Impacted axes

- **Operability (the claim's axis)**: `HELD` is a refutation budget over the 15 drawn shapes
  (plan limit 4), not a proof of R100. 14 wrong readers read it.
- **Coverage sub-axes (harm surfaces)**: the shipped selftests' teeth are scoped to the same 15
  shapes. h01–h08, h12 and h14 pass them, so K2 does not cover the undrawn classes either; the
  counter and the selftests share one blind spot.
- **Contract**: h14 changes the README citation reader, which R100 says is unchanged; neither the
  counter nor the shipped selftests can see it (0/21 live READMEs indent a map row; no indented
  fixture).

## Smallest safe correction

1. Battery: add the 8 omitted Zs code points (U+2000, U+2001, U+2004–U+2008, U+200A), NUL,
   ZWNJ/ZWJ as pad classes; add 0–3 U+2000 indent; add 9- and 10-digit ids; add a row at line
   >1000 (or a >800-row registry); add an indented README map row to the (c) arm.
2. Battery: remove the fixture invariants — realistic source URLs, tier A/B/C, E06 oracle from a
   tier-rewritten copy — so h09–h11 have no marker to key on.
3. Add a census-independence arm: run the candidate with a `bash` shim that exits 1 (or with the
   census path unavailable). A pure reader passes; a delegation candidate fails. This closes
   disclosed limit (3) mechanically.
4. Shipped selftests: add the same undrawn classes as `r100-*` string fixtures. Cheap; closes the
   K2 blind spot.
5. Do not edit the frozen counter this round (K4); route as the next round's counter repair.

## Disclosed vs new

Disclosed by the plan: (3) census delegation, (4) refutation budget over drawn classes, (1) live
registries carry no exotic pads, (2) section/malformed rows. New here: the enumerated omitted
class list; the battery's fixture-identifiability and the (c)-arm blind spot; the shipped
selftests' matching blind spot for the same undrawn classes; the README-gate blind spot; the
1000-line positional cap.

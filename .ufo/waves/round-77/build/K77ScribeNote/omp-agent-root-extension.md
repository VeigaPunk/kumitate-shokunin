## Offline shape receipt (round 77)

The round-77 frozen plan at `4dc470a1`, § C1, adds the `kumitate-omp-shape-v1` contract so this plane's score can be re-derived from committed shape bytes rather than a moving live root. The recorded round-open reading is `entries=64 findings=0 bound=35/35` (`.ufo/waves/round-77/open/census-open.txt`, final census line; open time recorded in `open/state.txt`). The frozen plan also records a 68-entry reading earlier the same hour with `findings=0`. That earlier value is attributed to the plan here, not independently remeasured or backed here by a separate located raw receipt. Both readings being clean does not make their denominator identical.

The canonical receipt contains only `contract` and `entries`; each entry contains only `name`, `kind`, and integer `mode` (the `0o777` permission bits), sorted by name. Kinds are `file`, `dir`, or `symlink`. It contains no member content, content digest, root path, or timestamp. The intended committed receipt is `.ufo/pins/omp-shape.json`, with its file SHA-256 in `pin.omp-shape` inside the lane-owned `kumitate-gate-pins-v1` block. These are frozen contract requirements, not a claim that a receipt or pin had already landed at `4dc470a1` (plan § C1, Contract; c1.2 and c1.10).

The additive commands are specified in that same contract:

- `node scripts/omp-census.mjs --snapshot FILE [--root DIR]` stages and renames a canonical receipt, reporting entry count and receipt SHA-256.
- `node scripts/omp-census.mjs --shape FILE` judges that receipt using the unchanged census rules and reports `source=snapshot`; malformed or unreadable receipts fail closed, never CLEAN.
- `node scripts/proxy-check.mjs --omp-shape FILE` uses the receipt for the existing six O terms (`C1o`, `C1o_total`, `O_members`, `O_findings`, `O_bound`, `coverage_omp`), with `source=snapshot` in text and JSON. It cannot be combined with `--omp-root`.

The existing registry formula in this note remains the formula: only the census input changes. The frozen counter requires equality with a root materialized from the receipt and discrimination when a stray entry is added (plan § C1, c1.6–c1.8). These predicates are not reported as run here. The scaffold's negative evidence is `controls/c77-c1-base.txt`; implementation acceptance requires a later measured revision, not this design description.

A receipt describes the shape at capture. It does not track later root drift, verify member contents, or settle the writer-attribution gaps above. Without an offline flag, the live default remains the live reading. The frozen claim keeps the `coverage:omp` integer at 10; its movement is re-derivability from committed bytes, not an invented score increase (plan § C1, Axis arithmetic).

# ExecPinsRecipe — round-52 C1 integration deltas

## Result

Prepared the registry-row and checklist-item deltas, plus a SCORECARD re-derivation recipe, under `.ufo/waves/round-52/build/ExecPinsRecipe/`. The exact v2 pin line remains blocked: the requested `build/ExecInstrumentV2/receipt-attest.mjs` was absent when checked, and no scratch v2 was created because a parallel implementation would not be the delivered bytes. I did not substitute the old v1 digest.

## Files changed

- `.ufo/waves/round-52/build/ExecPinsRecipe/a-scorecard-pin-line.md` — dependency and non-reusable v1 pin recorded; exact v2 line unavailable.
- `.ufo/waves/round-52/build/ExecPinsRecipe/b-skill-gate-registry-row.md` — current `SKILL.md:618` row copied old-line → new-line with v2 contract, shape/clock/stdin/ledger/selftest details.
- `.ufo/waves/round-52/build/ExecPinsRecipe/c-skill-checklist-item-23.md` — round/contract descriptor updates; command and expected substring unchanged.
- `.ufo/waves/round-52/build/ExecPinsRecipe/d-scorecard-stanza-recipe.md` — base-to-simulated values and conditions.
- `.ufo/waves/round-52/w1/ExecPinsRecipe.md` — this report.

No lane implementation file, SCORECARD, SKILL.md, probe, or sibling artifact was edited. No tools were installed or updated.

## Behavior and evidence retained

- Frozen plan § C1 (`.ufo/waves/round-52/plan.md:65-98`) specifies unchanged v1 receipt semantics plus v2 SHAPE/CLOCK/STDIN/LEDGER behavior and `ATTEST_SELFTEST: PASS (n/n)` with at least 30 cases.
- Current `SKILL.md:618` is labeled `kumitate-receipt-attest-v1`; current item 23 at `:709` runs `node scripts/receipt-attest.mjs --selftest` and expects substring `ATTEST_SELFTEST: PASS`. **The command stays; the expected substring still matches** v2's final line `ATTEST_SELFTEST: PASS (n/n)`. Update the checklist descriptor to round 52 / v2, but retain its command and substring.
- The `pin.receipt-attest` registry key already exists in `scripts/proxy-check.mjs:471`. Updating its SCORECARD value alone does not require adding a proxy-check key.
- Exact v2 pin evidence is absent: `glob` returned `Path not found` for `.ufo/waves/round-52/build/ExecInstrumentV2/receipt-attest.mjs` and for `.ufo/waves/round-52/build/ExecStanzaDrift`. The existing `SCORECARD.md:322` value `44919763ee523f334adaa4242d370435180d07aa0cdd4b85b0a7be870f48e8d9` is the frozen v1 pin, not a v2 digest.
- Frozen `base/baseline-gates.txt:4-9` records `A_DRIFT declared=71 computed=73`, `C2_TOTAL_DRIFT declared=117 computed=118`, and `AXES_DRIFT coverage declared=10 derived=9`. This actual receipt includes `A_DRIFT`, which the short round-open summary in plan §15-21 omits.
- Derived from plan §100-109 and the baseline counts: **[INFERENCE]** the new knowledge file plus its README row, together with the one existing missing README row, produce `C2=119`; the new file produces `C2_total=119`. In a simulated input set containing only the expected v2 build `.mjs` as a new runnable, recursive `walkFiles` (`scripts/proxy-check.mjs:682-690`) gives `A=74` from base computed 73. Any additional retained `.mjs/.js/.sh/.py` artifacts alter A, so it must be re-derived on the final tree. `C2/C2_total=119/119` gives coverage 10; `A=74,C=23` leaves operability 9. These are arithmetic projections, not measured final-tree gate output.

## Risks and blockers

1. The SHA-256 required for delta (a) cannot be produced without the delivered v2 bytes. Use the artifact's bytes for the integration pin and re-derive against the final staged `scripts/receipt-attest.mjs`; do not reuse the v1 digest.
2. `A` is recursive across the whole tree (excluding `.git`), so any additional retained runnable wave artifact changes the simulated `A=74` estimate. The final stanza needs exact-tree derivation.
3. No `ExecStanzaDrift` computed artifact was present; the targets above are explicitly arithmetic projections from the frozen plan and base receipt.

## Verification and tools

No builds, tests, linters, formatters, or gate runs were performed. Evidence above is from read-only source/plan/receipt inspection. No installs or updates.

Report: `.ufo/waves/round-52/w1/ExecPinsRecipe.md`

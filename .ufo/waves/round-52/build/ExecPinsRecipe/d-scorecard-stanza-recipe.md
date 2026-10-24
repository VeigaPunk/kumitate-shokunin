# (d) SCORECARD stanza re-derivation recipe

`build/ExecStanzaDrift/` was absent. This is the arithmetic on the frozen base plus the planned post-integration inputs, not a measured final-tree proxy run.

| machine-block value | current declaration / base evidence | simulated post-integration target |
|---|---|---|
| `A` | declared `71`; frozen `base/baseline-gates.txt` says computed `73` (`A_DRIFT`) | **`74` if** the delivered `build/ExecInstrumentV2/receipt-attest.mjs` is retained as the only additional runnable file. `A` counts `.mjs`, `.js`, `.sh`, `.py` files recursively outside `.git`; the base value is already 73. Any other new retained runnable artifact adds one apiece, so derive final `A` from the integrated tree rather than freezing this conditional estimate. Replacing the already-present `scripts/receipt-attest.mjs` does not itself change the count. |
| `C2` | declared/computed `117` at base | **`119`**: add the README map row for the currently unrowed note (+1) and the row for the new round-52 knowledge entry (+1). |
| `C2_total` | declared `117`, computed `118` at base | **`119`**: the new `corpus/knowledge/fail-closed-clock-validation.md` adds one corpus `.md` file. |
| `pin.receipt-attest` | v1 value `44919763ee523f334adaa4242d370435180d07aa0cdd4b85b0a7be870f48e8d9` | Replace with the exact delivered v2 SHA-256. It is unavailable while the v2 artifact is absent; see delta (a). |

Other declared machine-block values are unchanged by the known recipe: `C=23`, `C1=19`, `C1_total=19`, all S/R/K terms and the other pins. `pin.receipt-attest` is already a `GATE_PINS` key in `scripts/proxy-check.mjs:471`, so changing its value does not require a proxy-check source edit or change its pin. The derived `coverage` remains 10 for `C1=19/19` and `C2=119/119`; `operability` remains 9 for `C=23` and conditional `A=74`.

Before landing the stanza, derive the final `A`, `C2`, and `C2_total` from the exact integrated tree and use the final staged script bytes for `pin.receipt-attest`; do not use the conditional scratch arithmetic as a measured receipt. The frozen baseline report contains `A_DRIFT` although the plan's round-open summary does not mention it.

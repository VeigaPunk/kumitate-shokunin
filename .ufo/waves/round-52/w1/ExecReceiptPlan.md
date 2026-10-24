# ExecReceiptPlan — receipt protocol rehearsal

## Result and scope

- Added `build/ExecReceiptPlan/protocol.sh` (executable) and retained the run log as `build/ExecReceiptPlan/protocol-rehearsal.txt`.
- Generated receipts and sidecars are retained in `build/ExecReceiptPlan/scratch/.ufo/waves/round-52/receipts/`.
- The script defaults to the planned `build/ExecInstrumentV2/receipt-attest.mjs`, changes cwd to the lane root before invoking the live gates, runs the three requested gates, verifies each receipt and the three-entry ledger, then creates and verifies the prelude-only doctored control. It leaves the artifacts in the seat-owned build directory.
- **V2 dependency not present at rehearsal time:** `.ufo/waves/round-52/build/ExecInstrumentV2/receipt-attest.mjs` was absent (also confirmed by ExecReceiptCraft). To proceed with the available mechanics, I ran the same sequence using the existing `scripts/receipt-attest.mjs`, whose observed header identifies `kumitate-receipt-attest-v1`. The results below are therefore a plumbing/protocol rehearsal, **not** acceptance evidence for v2. L1 must rerun the script with the v2 artifact before treating this assignment as fully exercised against the frozen contract.

## Retained evidence

The transcript records these exact invocations, all from the lane root:

```text
node scripts/receipt-attest.mjs run --out <scratch>/attest52-run-1 -- node scripts/bind-oracle.mjs --selftest
node scripts/receipt-attest.mjs run --out <scratch>/attest52-run-2 -- node scripts/sources-check.mjs
node scripts/receipt-attest.mjs run --out <scratch>/attest52-run-3 -- node scripts/round-gate.mjs --selftest
```

For all three wrapped gates, the instrument reported `command-exit 0`; each receipt and `.sha256` sidecar was written under the scratch receipt directory. Receipt SHA-256 values reported by the instrument:

- run-1: `16e8e7ba585f253ffca8f04f0bdbb74586a7da89a63e45c2d9adf7773f0ffbdb`
- run-2: `540a766f9cc40d4fad1f24e331a73ca0c3d2368d21646048e2a2aba053650f0b`
- run-3: `d3e650f7adc097f74775daf9d370d176811cfbdc2fc02bba9a2668e7716c9af3`

All three plain verifies printed `RECEIPT: VALID` with status 0. Each of the three `verify --ledger <scratch receipt dir> <receipt>` passes also printed `RECEIPT: VALID` with status 0. The doctored control was derived from run-2 by changing only its `run-at:` prelude to `2020-01-01T00:00:00.000Z`; the original sidecar bytes were copied unchanged. Its verify printed `RECEIPT: TAMPERED` with status 1 (sidecar mismatch: expected hash `540a766f9cc40d4fad1f24e331a73ca0c3d2368d21646048e2a2aba053650f0b`, actual `e165de67bb42095ac46db650144d20d2365bd32208ab6de609bcc2aecc96791a`).

The script allowed at least 315 seconds from its start before run-3, then checked the receipts' digest-bound `wall_start` fields. Observed run-1-to-run-3 span: `315152 ms` (≥300000 ms). Full command/output transcript: `build/ExecReceiptPlan/protocol-rehearsal.txt`.

## L1 watch / limits

- **CWD sensitivity:** `node scripts/...` is relative; retain the script's `cd` to the lane root. Run the protocol as authored rather than invoking the gate commands from an arbitrary cwd.
- **Sidecars:** verifies use the sidecar adjacent to each receipt. The protocol passes the scratch receipt directory explicitly to `--ledger`. The ledger pass occurs before adding the doctored control, so it covers the intended three genuine receipts.
- **Timing:** preserve real spacing. The script waits with a 15-second margin and checks the receipt-body `wall_start` span; rerun or extend the wait if that check fails (including after a wall-clock adjustment).
- The instrument captures gate stdout/stderr and records their hashes; this transcript exposes the recorded gate exit codes, not the captured gate text/verdicts.
- No tools were installed or updated. No v2 selftest or v2-specific contract behavior was exercised because its artifact was absent.

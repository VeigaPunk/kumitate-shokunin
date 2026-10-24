# ExecBlackBox — C1 v2 black-box conformance

## Files changed
- `.ufo/waves/round-52/build/ExecBlackBox/blackbox.mjs` — independent Node harness invoking the instrument only through its CLI. When the target exists, it exercises VALID/REPLAY/TAMPERED/UNREADABLE/USAGE exit classes and the requested v2 whitelist, strict-line, prelude, sidecar-name, half-pair, exit-127, month-13/day-32 CLOCK, stdin-hash, and ledger-skip-note cases.
- `.ufo/waves/round-52/build/ExecBlackBox/blackbox.txt` — verbatim harness stdout from the final successful run.

## Results
**PASS — 20/20 checks** against the instrument through CLI only; the harness does not import instrument code. `blackbox.txt` contains the final run's process stdout verbatim.

Exact retained evidence includes `BLACKBOX PASS 20/20`, all five v1 verdict/usage exit classes, and the v2 shape, sidecar, half-pair, exit-127, CLOCK, stdin, and ledger cases. The `--stdin` receipt's `stdin_sha256` and `stdout_sha256` both matched `26a13e65ad51f872b42eea4892dc1d93016c3295688fb7690f87e60309830e68`; the ledger printed skip notes for both damaged prior receipts.

Tested instrument SHA-256: `16175dd2b0bdb0aca3bc99b26785e2c9c07ace4850f0bdbef92bc3b8fc73282f` (same immediately before and after the harness run).

The first harness attempt made the TAMPERED fixture's prelude malformed, correctly yielding UNREADABLE. I corrected it to a valid UTC-shaped prelude with a stale sidecar; the final run passed TAMPERED. The instrument author then reported one more selftest case was pending; this result applies to the exact SHA above, and a later changed hash is not covered.

## Findings, risks, blockers
No requested contract failure observed on the tested hash. Open version risk: rerun this harness if the pending instrument edit changes that hash. Executed command: `node .ufo/waves/round-52/build/ExecBlackBox/blackbox.mjs`; final exit status 0. No tools were installed or updated.
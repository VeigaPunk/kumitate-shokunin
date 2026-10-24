# ExecSelftestExec — round 52 A1 witness

## Axes
- **Hermeticity:** one script in a fresh temporary directory; no corpus or sidecars copied in.
- **Coverage:** selftest case count and required CLOCK, STDIN, truncation arms.
- **Fault sensitivity:** a deliberately wrong expected verdict must make the suite fail non-zero.

## Findings

The delivered v2 instrument appeared after my initial availability check and before the witness run. I used the delivered artifact, not the fallback implementation; the unused private copy was removed. Source and fresh-copy SHA-256 both equal `9531e89827fdfb0a345b0ce613318163d5ae7a42d6d176426ce2cbdaa36ba74e`.

**Fresh-copy baseline: PASS.** Copied only `receipt-attest.mjs` into `/tmp/r52-execselftest-current.abbbxo/` and ran `node receipt-attest.mjs --selftest` from that directory. Directory inspection showed only `receipt-attest.mjs`. Node was `v24.21.0`; process exit was 0. Transcript contains 42 `case ` lines and ends exactly:

`ATTEST_SELFTEST: PASS (42/42)`

Required named cases are present: `v2-clock-month-rollover-is-tampered` (line 34), `v2-clock-day-rollover-is-tampered` (35), `v2-stdin-binds-32-nonce-bytes-and-child-output` (39), `r52-6-nonce-difference-after-16-bit-prefix-is-not-valid` (41), and `r52-6-sidecar-difference-after-16-bit-prefix-is-not-valid` (42). The new escaped-basename arm also passes at line 33.

**Sabotage control: FAIL as required.** In `/tmp/r52-execselftest-current-sabotage.aCLKka/receipt-attest.mjs`, changed only the `sidecar-mismatch-reads-tampered` expected verdict from `RECEIPT: TAMPERED` to `RECEIPT: VALID`. Its case failed with the actual `RECEIPT: TAMPERED`; final transcript line is exactly `ATTEST_SELFTEST: FAIL`; process exit was 1. The scratch directory contains only the script.

## Retained evidence
- Fresh transcript: `.ufo/waves/round-52/build/ExecSelftestExec/selftest-fresh.txt`; exit: `.../selftest-fresh.exit` (`0`).
- Sabotage transcript: `.ufo/waves/round-52/build/ExecSelftestExec/selftest-sabotage.txt`; exit: `.../selftest-sabotage.exit` (`1`).
- Fresh instrument copy: `/tmp/r52-execselftest-current.abbbxo/receipt-attest.mjs`; its hash matches the delivered script above.
- Sabotaged script: `/tmp/r52-execselftest-current-sabotage.aCLKka/receipt-attest.mjs`.

## Risks and blockers
No blocker for this witness. This verifies the instrument's selftest and sabotage sensitivity, not the frozen A52 integration probe; that remains with the parent gate. Tools installed/updated: none.

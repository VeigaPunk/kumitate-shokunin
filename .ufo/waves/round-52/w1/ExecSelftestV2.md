# ExecSelftestV2 report

## Work completed

- Wrote the independent 43-case fixture/verdict list to `build/ExecSelftestV2/selftest-plan.md` before accessing the ExecInstrumentV2 deliverable. It retains all 27 v1 selftest names and adds 16 mandated v2 cases: five CLOCK rollovers; six SHAPE/write/spawn cases; STDIN; LEDGER skip-note; and three R52-6 truncation forgers.
- Wrote an isolated local scratch receipt-attest implementation and fixture runner at `build/ExecSelftestV2/receipt-attest-scratch.mjs`. It is auxiliary only, not a lane implementation change.
- The first availability check found no `build/ExecInstrumentV2/` directory. I exercised the scratch implementation while that artifact was absent. On a later independent check, `build/ExecInstrumentV2/receipt-attest.mjs` had appeared, so I ran the same planned cases against that actual instrument without waiting on the peer.

## Evidence

Final target command:

```text
RECEIPT_ATTEST_TARGET=/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-52/build/ExecInstrumentV2/receipt-attest.mjs node .ufo/waves/round-52/build/ExecSelftestV2/receipt-attest-scratch.mjs --selftest
```

The target run emitted one PASS line per case and ended exactly:

```text
ATTEST_SELFTEST: PASS (43/43)
```
The final run used the target instrument to create normal receipts for baseline cases; the harness generated and mutated the adversarial fixture bytes locally, then invoked the target verifier. `--stdin`, spawn failure, and write failure ran through the target's `run` command.

Case-by-case target outcome: **no divergences; all 43 passed**.

```text
[PASS] run-writes-receipt-and-sidecar
[PASS] receipt-shape-is-prelude-plus-json-line
[PASS] sidecar-is-gnu-text-mode-basename
[PASS] sidecar-hash-is-computed-with-node-crypto
[PASS] nonce-is-128-bit-hex-and-unique-per-run
[PASS] verify-genuine-receipt-reads-valid
[PASS] flake-injection-doctored-body-reads-replay
[PASS] digest-field-corrupted-with-recomputed-sidecar-reads-replay
[PASS] sidecar-mismatch-reads-tampered
[PASS] missing-sidecar-reads-tampered
[PASS] prelude-only-rewrite-reads-tampered
[PASS] prelude-rewrite-with-forged-sidecar-reads-replay
[PASS] ledger-detects-a-nonce-reused-by-a-different-record
[PASS] ledger-exempt-a-byte-identical-duplicate
[PASS] ledger-ignores-an-unattested-copy
[PASS] usage-errors-exit-64
[PASS] missing-receipt-reads-unreadable-exit-2
[PASS] malformed-receipt-reads-unreadable-exit-2
[PASS] clock-order-violation-reads-tampered
[PASS] negative-monotonic-span-reads-tampered
[PASS] prelude-outside-the-wall-window-reads-tampered
[PASS] inner-digest-covers-every-semantic-field
[PASS] canonical-json-is-sorted-and-stable
[PASS] receipt-records-no-environment
[PASS] run-records-the-command-exit-code
[PASS] run-records-output-hashes-not-output
[PASS] verify-resolves-the-sidecar-next-to-the-receipt
[PASS] clock-rollover-month-13-is-tampered
[PASS] clock-rollover-day-32-is-tampered
[PASS] clock-rollover-february-29-nonleap-is-tampered
[PASS] clock-rollover-hour-24-is-tampered
[PASS] clock-rollover-minute-60-is-tampered
[PASS] shape-unknown-field-is-unreadable
[PASS] shape-blank-line-is-unreadable
[PASS] shape-zone-less-prelude-is-unreadable
[PASS] shape-sidecar-name-mismatch-is-tampered
[PASS] write-sidecar-failure-removes-half-pair
[PASS] spawn-failure-is-recorded-as-127
[PASS] stdin-delivers-nonce-and-binds-stdin-hash
[PASS] ledger-skip-note-for-unattested-prior
[PASS] nonce-tail-forgery-16bit-prefix-reads-replay
[PASS] sidecar-compare-rejects-tail-forgery
[PASS] digest-compare-rejects-tail-forgery
```

The STDIN fixture independently captured echoed child stdin to a fixture file and compared that file's hash with `stdout_sha256`; it also checked the exact nonce bytes and `stdin_sha256`. The R52-6 nonce forger changes the nonce only after its first four hex characters and chooses a changed suffix with a matching 16-bit digest prefix; target returned REPLAY, not VALID. The sidecar- and inner-digest-tail forgers also produced their required TAMPERED/REPLAY verdicts.

The scratch fixture suite itself also emitted `ATTEST_SELFTEST: PASS (43/43)`. Its first exploratory run had one harness-fixture failure because the plaintext-output marker was accidentally embedded in argv; I corrected the fixture to construct the marker from parts, then the scratch and target runs passed.

## Files changed

- `.ufo/waves/round-52/build/ExecSelftestV2/selftest-plan.md`
- `.ufo/waves/round-52/build/ExecSelftestV2/receipt-attest-scratch.mjs`
- `.ufo/waves/round-52/w1/ExecSelftestV2.md`

## Risks / blockers

No blockers. The scratch implementation is an independent test oracle, not evidence of lane integration; the 43-case results above are from directly invoking the ExecInstrumentV2 artifact available at test time. No tools were installed or updated.

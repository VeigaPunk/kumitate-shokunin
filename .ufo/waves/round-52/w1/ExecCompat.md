# ExecCompat — B6 round-51 receipt rehearsal

## Result

All three committed round-51 v1 receipts passed verification with the delivered v2 instrument, directly and with `--ledger .ufo/waves/round-51/receipts`: each ended in `RECEIPT: VALID` and exited 0. No critical v1-compatibility finding was observed.

This directly exercises the v2 exact-field whitelist against the v1 record shape (the v2 whitelist minus `stdin_sha256`), along with sidecar, digest, and clock checks.

## Retained evidence

- Verbatim command/output transcript: `.ufo/waves/round-52/build/ExecCompat/b6-transcript.txt`
- Delivered verifier: `.ufo/waves/round-52/build/ExecInstrumentV2/receipt-attest.mjs`
- Target receipts and sidecars: `.ufo/waves/round-51/receipts/attest-run-{1,2,3}.txt` and matching `.sha256` files.

Transcript results, in order: direct run 1/2/3 each `RECEIPT: VALID`, `exit=0`; ledger run 1/2/3 each prints `receipt-attest: ledger skipped attest-run-2-replayed.txt: not an attested receipt (sidecar name does not match receipt basename)`, then `RECEIPT: VALID`, `exit=0`.

## Risks / blockers

None for this B6 check. The ledger skip note is for the unauthenticated replay-control receipt, not any of the three target receipts. No tooling was installed or updated.

# CtlNonceReuse — round 58

- **Scoped finding:** independently corroborated the cross-round nonce-freshness rejection at revision `6affb9ebde37b7d663658f1959d64f0f0b68f480`.
- **Axes:** operability — the verifier executed and returned the contracted rejection; coverage — the reused nonce came from the committed round-52 corpus.
- **Sandbox:** `.ufo/waves/round-58/build/CtlNonceReuse/lane`, created with `git clone --no-hardlinks file:///home/vgpnk/Projects/shokunin/kumitate-shokunin .../lane`. Its HEAD was the judged R1 revision. No commit or production-file mutation was performed.

## Observed evidence

1. **Committed historical nonce.** The R1 `git grep` of `.ufo/waves/round-52/receipts/attest52-run-2.txt` exited `0` and returned `"nonce":"036d7c4b8ff2fb106497c972607a222b"`. Full command and output: `.ufo/waves/round-58/build/CtlNonceReuse/04-round52-nonce.log`.

2. **Otherwise-valid forged fixture.** The fixture copied that nonce into R1's `attest-run-1.txt`, replacing original nonce `8ccae7eac883bb9b72d727493960b9e5`. The only changed body fields were `nonce` and the necessarily recomputed `digest`; the receipt sidecar was recomputed. The forge exited `0`. Evidence: `.ufo/waves/round-58/build/CtlNonceReuse/07-forge.log`; receipt copies are under `baseline-receipts/` and `forged-receipts/` in the same build directory.

3. **Untouched control HELD.** R1 `receipt-evidence.mjs verify` over the untouched three-receipt set exited `0`:
   ```text
   RECEIPT_EVIDENCE: HELD receipts=3 reproduced=3 sweep_files=5580 sweep_nonces=63 span_ms=346314
   ```
   Full command and output: `.ufo/waves/round-58/build/CtlNonceReuse/08-baseline-verify.log`.

4. **Forged receipt remained ledger-valid.** Independent R1 `receipt-attest.mjs verify --ledger` over the forged `attest-run-1.txt` printed `RECEIPT: VALID` and exited `0`. Full command, skip notes, and output: `.ufo/waves/round-58/build/CtlNonceReuse/09-forged-ledger.log`.

5. **Requested freshness arm fired.** The same R1 `receipt-evidence.mjs verify` invocation over the forged set exited `1`:
   ```text
   RECEIPT_EVIDENCE: UNMET reason=NONCE_REUSED detail=attest-run-1.txt
   ```
   Full command and output: `.ufo/waves/round-58/build/CtlNonceReuse/10-reused-nonce-verify.log`.

All setup and verification commands, combined stdout/stderr, and exit codes are retained in `.ufo/waves/round-58/build/CtlNonceReuse/*.log`; `status.txt` records the observed `0/0/1` control exits and runner exit `0`. No tools were installed. This result is scoped to CtlNonceReuse and does not assert either whole-round predicate.

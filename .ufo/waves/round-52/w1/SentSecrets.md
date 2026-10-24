# SentSecrets — security review

## Axes
Confidentiality (env/secret reach), nonce collision safety, and receipt authenticity.

## Findings

- **HIGH — Arbitrary argv can disclose secrets.** `run` serializes `cmd` verbatim as `argv` (`scripts/receipt-attest.mjs:183-184,215-224`); a call such as `--token "$TOKEN"` or a shell `-c` string puts the expanded secret in cleartext. Child environment is inherited by default (`:192`) but not serialized as a separate field (`:47-49`). The env selftest only checks a sentinel (`:704-716`); it does not test argv. Planned round-52 wrappers are public fixed commands (`plan.md:157-165`), but actual receipts were absent. Output is hashed, not stored raw; hashes of low-entropy secret output remain guess-testable. Remediation: enforce exact public argv for these receipts and never pass secrets on argv; unrestricted argv means the instrument cannot guarantee no secret material.

- **MEDIUM — v1 accepts unknown secret-bearing fields.** v1 `shapeError` validates required fields but has no exact-key whitelist (`receipt-attest.mjs:134-147`). A record writer can add `env`/secret data, recompute the unkeyed body digest and sidecar (`:105-110,150-160`), and v1 can accept it. The frozen v2 contract requires an exact whitelist (`plan.md:71-78`), but v2 source was not delivered/present to verify. Remediation: enforce that whitelist before verification; do not infer it from the v1 sentinel test.

- **MEDIUM — A receipts/ writer can forge an internally valid record.** SHA-256 body digest and sidecar are unkeyed (`receipt-attest.mjs:105-110,150-160`); a writer of both files can change allowed fields, choose a fresh nonce, and recompute both. A52 B2 verifies validity, uniqueness and body-clock span but does not bind `argv` to expected public commands (`attest52-probe.mjs:181-210`). Archive checks resist edits confined to a post-commit working copy, but a writer who can influence the committed/selected revision or a live filesystem verifier can forge. Plan says v2 preserves the receipt/digest/sidecar form (`plan.md:67-68`), so this is the same author-attestation boundary as v1, not authenticity against the writer. Remediation: protect the receipt directory and state the boundary; for writer-resistant authenticity, sign with a key outside the writer's control and verify against a trusted key.

- **REVIEW BLOCKER — v2/round-52 receipt evidence absent.** At inspection the only `scripts/receipt-attest*` file was the v1 script and `.ufo/waves/round-52/receipts/` did not exist. Thus delivered v2 code and actual receipt contents could not be inspected or scanned; no PASS is claimed. Remediation: repeat this review against delivered v2 and committed receipts before close.

## Nonce assessment
v1 generates 16 random bytes (128 bits), encoded as 32 lowercase hex characters (`receipt-attest.mjs:74,112,219`). Three official random receipts per round give `C(3,2)/2^128 ≈ 8.82×10^-39` per round. If 52 rounds used three draws each, `C(156,2)/2^128 ≈ 3.55×10^-35`. The doctored control copies run-2 and is not an independent draw; four independent files would still be only `6/2^128 ≈ 1.76×10^-38` per round. Adequate for this ledger volume; v2 nonce implementation remains uninspected.

## Close-time sweep
Concrete argv-only sweep command, exact public-command allowlist, and bounded secret-pattern set are in `build/SentSecrets/findings.md`. Run from lane root after the four `.txt` files exist. It checks the three planned gate receipts and the doctored control, verifies allowed fields/argv, and scans common secret patterns. It intentionally does not expect the doctored control's sidecar to validate. **Not executed:** receipt directory was absent at inspection. The pattern sweep is bounded, not proof against arbitrary encodings.

No tools installed or updated.

Report: .ufo/waves/round-52/w1/SentSecrets.md
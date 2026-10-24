# ExecReceiptCraft — round 52

Axes: **operability** (reusable integration scripts) and **evidence quality** (byte-identical side-by-side verdicts and independently captured stdin/stdout hashes).

## Files delivered

Under `build/ExecReceiptCraft/`:
- `b1c-surgery.mjs` — generates a genuine receipt with the selected instrument, sets both `wall_start` and `wall_end` to `2026-13-01T00:00:00.000Z`, recalculates the recursively key-sorted canonical JSON digest with `digest` omitted, rewrites the `.sha256` sidecar over the exact receipt bytes, then verifies the same receipt path with v2 and v1.
- `b2e-stdin.mjs` — runs `run --out <base> --stdin -- /bin/cat`, reads the generated nonce, independently feeds its 32 UTF-8 hex bytes to `/bin/cat`, captures that output, and compares both expected hashes plus `verify` verdict.
- Exact run transcripts and generated scratch receipt pairs are retained under the same directory. See `b1c-oracle-rehearsal.txt` and `b2e-oracle-rehearsal.txt` for the complete successful rehearsals. `b1c-v1-only.txt`, `b2e-missing-v2.txt`, and `b2e-v2-rehearsal.txt` retain the earlier partial/mutant-candidate attempts.

From the lane root, use the delivered instrument at integration with:

```sh
node .ufo/waves/round-52/build/ExecReceiptCraft/b1c-surgery.mjs \
  .ufo/waves/round-52/build/ExecInstrumentV2/receipt-attest.mjs \
  scripts/receipt-attest.mjs .ufo/waves/round-52/build/ExecReceiptCraft
node .ufo/waves/round-52/build/ExecReceiptCraft/b2e-stdin.mjs \
  .ufo/waves/round-52/build/ExecInstrumentV2/receipt-attest.mjs \
  .ufo/waves/round-52/build/ExecReceiptCraft
```

## Retained evidence

The canonical `build/ExecInstrumentV2/receipt-attest.mjs` was absent when checked. Full paired rehearsals therefore used the available scratch v2 at `build/MutInstrument/scratch/v2-rehearsal.mjs` (its header explicitly identifies it as a rehearsal oracle, not the deliverable), with the lane's current `scripts/receipt-attest.mjs` as v1.

`b1c-oracle-rehearsal.txt` records the same recomputed fixture tested against both instruments:
- v1 exact verdict: `RECEIPT: VALID` (exit 0)
- v2 exact verdict: `RECEIPT: TAMPERED` (exit 1)
- `B1C_RESULT=PASS`, process exit 0.

`b2e-oracle-rehearsal.txt` records a nonce of `d2360755366a4e0d7081bb2a1c112b10`; its UTF-8 representation was 32 bytes. Receipt `stdin_sha256`, the independently captured `/bin/cat` stdout SHA-256, and receipt `stdout_sha256` all equaled `b0303538d7106b96c8fb13969621a00a6cad43988c6248b93a749d7f33340c4f`. Verify returned `RECEIPT: VALID` exit 0; all B2e checks passed.

Additional retained candidate evidence: `b2e-v2-rehearsal.txt` records a B2e failure against the separate `build/MutSelftest/v2/receipt-attest.mjs` copy: its generated receipt nonce was not 32 lowercase hex characters (source path serializes `nonceBytes` with `.toString('hex')` in stdin mode). This is a scratch-copy divergence, not the oracle result above; it should be checked against the actual delivered instrument. The first attempt transcript `b1c-v1-only.txt` independently shows the v1 reproduction (`RECEIPT: VALID`, exit 0); `b2e-missing-v2.txt` records the earlier unavailable canonical path.

## Blocker / risk

The actual `ExecInstrumentV2` deliverable was not present, so these successful results prove the scripts against the available rehearsal oracle, not against the final integration bytes. Re-run both commands against the canonical deliverable before treating B1c/B2e as integration evidence. No tools were installed or updated.
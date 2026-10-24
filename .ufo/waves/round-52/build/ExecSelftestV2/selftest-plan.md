# ExecSelftestV2 — independent receipt-attest v2 selftest plan

## Axes

- **Integrity/verdict correctness:** genuine records validate; altered content is rejected at the correct layer (`REPLAY` vs `TAMPERED` vs `UNREADABLE`).
- **Input-shape and clock fail-closed behavior:** strict record/prelude shape and non-rolling UTC timestamps.
- **Command delivery and pair-write behavior:** captured output, spawn failures, `--stdin`, and cleanup on partial writes.
- **Ledger semantics:** only attested priors participate; exact nonce/digest identity and explicit skip notes.
- **Selftest discriminating power:** cases fail against plausible prefix/truncation mutants rather than merely exercising happy paths.

This list is written independently of `build/ExecInstrumentV2/receipt-attest.mjs`; the instrument artifact had not been opened when this plan was written. It retains all 27 case names found in the v1 instrument selftest and adds every v2-mandated arm. Cases specify the expected tool-level verdict/exit, not merely a PASS from the selftest wrapper.

## Retained v1 cases (27)

| # | Case | Fixture | Expected verdict |
|---:|---|---|---|
| 1 | `run-writes-receipt-and-sidecar` | Run a successful child into a fresh output basename; inspect both files and verify the pair. | Pair exists; verify `RECEIPT: VALID`, exit 0. |
| 2 | `receipt-shape-is-prelude-plus-json-line` | Generate a receipt and inspect its bytes/line boundaries and parsed JSON body. | Exactly `run-at:` prelude + one canonical JSON line + trailing LF; valid. |
| 3 | `sidecar-is-gnu-text-mode-basename` | Generate a receipt in a directory and parse its `.sha256` sidecar. | Lowercase SHA-256, GNU text-mode two-space separator, exact receipt basename; valid. |
| 4 | `sidecar-hash-is-computed-with-node-crypto` | Re-hash the exact receipt bytes independently and compare with sidecar. | Full 64-hex hash matches; valid. |
| 5 | `nonce-is-128-bit-hex-and-unique-per-run` | Generate two successful receipts in one selftest run. | Each nonce is 32 lowercase hex characters; distinct nonces; both valid. |
| 6 | `verify-genuine-receipt-reads-valid` | Verify an untouched generated receipt. | `RECEIPT: VALID`, exit 0. |
| 7 | `flake-injection-doctored-body-reads-replay` | Change a semantic body value without repairing its inner digest or sidecar. | `RECEIPT: REPLAY`, exit 1. |
| 8 | `digest-field-corrupted-with-recomputed-sidecar-reads-replay` | Corrupt only the `digest` value, then recompute the outer sidecar over the doctored bytes. | `RECEIPT: REPLAY`, exit 1. |
| 9 | `sidecar-mismatch-reads-tampered` | Flip one sidecar hash nibble; leave receipt bytes unchanged. | `RECEIPT: TAMPERED`, exit 1. |
| 10 | `missing-sidecar-reads-tampered` | Remove the sidecar beside an otherwise genuine receipt. | `RECEIPT: TAMPERED`, exit 1. |
| 11 | `prelude-only-rewrite-reads-tampered` | Rewrite only the display prelude; retain the old sidecar. | `RECEIPT: TAMPERED`, exit 1. |
| 12 | `prelude-rewrite-with-forged-sidecar-reads-replay` | Rewrite the prelude and repair the sidecar, while preserving the original nonce/body binding. | `RECEIPT: REPLAY`, exit 1 under ledger verification. |
| 13 | `ledger-detects-a-nonce-reused-by-a-different-record` | Place two attested records with the exact same nonce but different record digests in the ledger. | Both duplicate-nonce records are reported `RECEIPT: REPLAY`, exit 1. |
| 14 | `ledger-exempt-a-byte-identical-duplicate` | Copy an attested receipt byte-for-byte under a second basename and include both in the ledger. | Exact duplicate is exempt; both read `RECEIPT: VALID`, exit 0. |
| 15 | `ledger-ignores-an-unattested-copy` | Include a valid receipt and a doctored copy with a stale sidecar. | Valid receipt remains `RECEIPT: VALID`, exit 0; unattested copy does not poison it. |
| 16 | `usage-errors-exit-64` | Exercise missing/extra arguments, incomplete `run`/`verify`, and unknown command. | Each invocation prints usage/error, exits 64, and emits no receipt verdict. |
| 17 | `missing-receipt-reads-unreadable-exit-2` | Verify a nonexistent receipt path. | `receipt-attest: UNREADABLE`, exit 2; no VALID/REPLAY/TAMPERED verdict. |
| 18 | `malformed-receipt-reads-unreadable-exit-2` | Verify a file containing non-receipt text. | `receipt-attest: UNREADABLE`, exit 2; no receipt verdict. |
| 19 | `clock-order-violation-reads-tampered` | Set `wall_end` before `wall_start`, then recompute inner digest and sidecar. | `RECEIPT: TAMPERED`, exit 1. |
| 20 | `negative-monotonic-span-reads-tampered` | Set `mono_span_ms` to -1 and recompute inner digest and sidecar. | `RECEIPT: TAMPERED`, exit 1. |
| 21 | `prelude-outside-the-wall-window-reads-tampered` | Set a syntactically valid but out-of-window prelude and recompute only its sidecar. | `RECEIPT: TAMPERED`, exit 1. |
| 22 | `inner-digest-covers-every-semantic-field` | Independently mutate each v1 semantic field (`argv`, `exit`, `mono_span_ms`, `nonce`, output hashes, and wall fields), retain a stale inner digest, and repair each outer sidecar. | Every mutation reads `RECEIPT: REPLAY`, exit 1. |
| 23 | `canonical-json-is-sorted-and-stable` | Parse a generated body and canonicalize it again. | Serialized JSON is byte-stable with sorted keys; test passes. |
| 24 | `receipt-records-no-environment` | Set a unique environment sentinel, run a child that could print it, and inspect receipt bytes. | Receipt contains neither sentinel nor environment assignments; test passes. |
| 25 | `run-records-the-command-exit-code` | Run a child that exits 3 and then verify its receipt. | Body records exit 3 and argv; receipt reads VALID, verify exit 0. |
| 26 | `run-records-output-hashes-not-output` | Run a child that prints a distinctive marker absent from argv. | Receipt includes matching stdout hash but not the plaintext marker. |
| 27 | `verify-resolves-the-sidecar-next-to-the-receipt` | Verify a valid receipt from a foreign working directory. | Neighbor sidecar is found; `RECEIPT: VALID`, exit 0. |

## Required v2 additions (16)

| # | Case | Fixture | Expected verdict |
|---:|---|---|---|
| 28 | `clock-rollover-month-13-is-tampered` | Set a wall field to `2030-13-01T00:00:00.000Z`; consistently recompute digest and sidecar. | Non-round-tripping clock reads `RECEIPT: TAMPERED`, exit 1. |
| 29 | `clock-rollover-day-32-is-tampered` | Set a wall field to `2030-01-32T00:00:00.000Z`; recompute digest and sidecar. | `RECEIPT: TAMPERED`, exit 1. |
| 30 | `clock-rollover-february-29-nonleap-is-tampered` | Set a wall field to `2025-02-29T00:00:00.000Z`; recompute digest and sidecar. | `RECEIPT: TAMPERED`, exit 1. |
| 31 | `clock-rollover-hour-24-is-tampered` | Set a wall field to `2030-01-01T24:00:00.000Z`; recompute digest and sidecar. | `RECEIPT: TAMPERED`, exit 1. |
| 32 | `clock-rollover-minute-60-is-tampered` | Set a wall field to `2030-01-01T00:60:00.000Z`; recompute digest and sidecar. | `RECEIPT: TAMPERED`, exit 1. |
| 33 | `shape-unknown-field-is-unreadable` | Add an unwhitelisted body key and consistently recompute the digest and sidecar. | `receipt-attest: UNREADABLE`, exit 2. |
| 34 | `shape-blank-line-is-unreadable` | Insert an extra blank line into an otherwise valid receipt and recompute the outer sidecar. | `receipt-attest: UNREADABLE`, exit 2. |
| 35 | `shape-zone-less-prelude-is-unreadable` | Remove `Z` from a millisecond UTC prelude while leaving a parseable local timestamp; recompute sidecar. | `receipt-attest: UNREADABLE`, exit 2, independent of verifier TZ. |
| 36 | `shape-sidecar-name-mismatch-is-tampered` | Keep correct receipt hash but record a different basename in the sidecar. | `RECEIPT: TAMPERED`, exit 1. |
| 37 | `write-sidecar-failure-removes-half-pair` | Pre-create `<out>.sha256` as a directory so sidecar creation fails after receipt creation. | `run` exits 2; half-written receipt is removed and no valid pair remains. |
| 38 | `spawn-failure-is-recorded-as-127` | Run a deliberately nonexistent executable with a fresh output basename. | Receipt body records exit 127; receipt/sidecar pair verifies VALID, exit 0. |
| 39 | `stdin-delivers-nonce-and-binds-stdin-hash` | Run `--stdin` with a child that echoes stdin and writes the same captured input to a fixture file before echoing. | Child receives exactly 32 UTF-8 nonce hex bytes then EOF; `stdin_sha256` hashes those bytes, and `stdout_sha256` matches the independently read capture file; receipt VALID. |
| 40 | `ledger-skip-note-for-unattested-prior` | Verify a valid target with `--ledger` alongside a damaged prior (e.g. stale sidecar). | Target stays VALID, exit 0; stdout/stderr includes an explicit skipped-unattested-prior note. |
| 41 | `nonce-tail-forgery-16bit-prefix-reads-replay` | In a ledger with an attested prior, change only the candidate nonce tail after its first four hex characters, retain its old inner digest, and choose the suffix so the recomputed digest shares that stored digest's first four hex characters; recompute the outer sidecar. | `RECEIPT: REPLAY`, exit 1. A 16-bit-prefix nonce/digest comparison must not accept the forger as VALID. |
| 42 | `sidecar-compare-rejects-tail-forgery` | Replace the sidecar hash with a value preserving the genuine hash's first four hex characters but differing later; retain correct basename. | `RECEIPT: TAMPERED`, exit 1; full 64-hex comparison required. |
| 43 | `digest-compare-rejects-tail-forgery` | Change only the stored inner digest tail after the first four hex characters, then recompute the outer sidecar. | `RECEIPT: REPLAY`, exit 1; full digest comparison required. |

Total: **43 named cases** = all 27 v1 cases + 16 required v2 additions. The nonce-prefix forger, sidecar tail-forger, and digest tail-forger must all be rejected using full values.

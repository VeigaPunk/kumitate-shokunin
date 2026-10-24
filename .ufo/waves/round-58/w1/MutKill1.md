# MutKill1 — reproduction-comparison mutant

- Round: 58, seat `MutKill1` (`mutation-tester`)
- Axes: operability, coverage
- Measured integration revision: `6affb9ebde37b7d663658f1959d64f0f0b68f480`
- Scratch forged revision: `8c76f0c1201001c19840c1db6db9f4adbdb4e636`
- Result: **KILLED**

## Finding

Deleting the reproduction comparison changes the verdict on the same zeroed-stdout-digest forged receipt from `UNMET` exit 1 to `HELD` exit 0. The reproduction arm is therefore the pin that rejects this forgery; the mutant satisfies the frozen kill rule.

| Tool | Observed final line | Exit |
| --- | --- | ---: |
| Honest R1 bytes | `RECEIPT_EVIDENCE: UNMET reason=REPRODUCE detail=attest-run-1.txt` | 1 |
| Reproduction-comparison mutant | `RECEIPT_EVIDENCE: HELD receipts=3 reproduced=3 sweep_files=5580 sweep_nonces=63 span_ms=346314` | 0 |

Both runs used scratch lane revision `8c76f0c1201001c19840c1db6db9f4adbdb4e636`, the same `.ufo/waves/round-58/receipts` directory, and `--min-span-ms 300000`. Full commands, stdout/stderr, and exit codes are in `build/MutKill1/verify-honest-forged.log` and `build/MutKill1/verify-mutant-forged.log`.

## Fixture and mutation

1. Cloned with `git clone --no-hardlinks file:///home/vgpnk/Projects/shokunin/kumitate-shokunin <build>/lane` and detached the scratch clone at R1. The honest and production `scripts/receipt-evidence.mjs` bytes both hashed to `0ea6b66df7dcff4dc9381c688a5182fb1fe2c3be5353df7a52d3c6f2e006972c`.
2. In the scratch clone only, changed `attest-run-1.txt`'s `stdout_sha256` from `6d41419fff1f5e5a40ac3eb1e53bb88783d222362ac1d120457661cd1d4e46b5` to 64 zeroes. Preserved nonce `8ccae7eac883bb9b72d727493960b9e5`, argv, clocks, and prelude; recomputed the inner digest and sidecar so the ledger arm remained valid. `receipt-attest verify --ledger` printed `RECEIPT: VALID` exit 0. Committed only that receipt and sidecar in the scratch clone, producing the forged revision above.
3. Removed only these three lines from the scratch mutant copy; execution and the unconditional `reproduced += 1` remain:

```diff
-      if (code !== r.body.exit || sha256(stdoutBuf) !== r.body.stdout_sha256 || sha256(stderrBuf) !== r.body.stderr_sha256) {
-        unmet('REPRODUCE', r.name);
-      }
```

The mutant passed `node --check` exit 0 and hashed to `b8b269d8db336e4d4abf122a9f1e561572abbf97d10810e45dcd7640469a413b`. The complete diff is in `build/MutKill1/mutation.log`.

## Evidence and bounds

Evidence lives under `.ufo/waves/round-58/build/MutKill1/`:

- `setup.log` — clone, R1 checkout, clean status, and initial hashes.
- `forge-receipt.mjs`, `forge.log` — deterministic forgery, ledger validation, receipt diff, scratch commit, and forged revision.
- `original-attest-run-1.txt*` and `forged-attest-run-1.txt*` — before/after receipt bytes and sidecars.
- `mutation.log` — exact mutant diff, syntax check, hashes, and production-tool checks.
- `verify-honest-forged.log` and `verify-mutant-forged.log` — the decisive before/after runs.
- `final-integrity.log` — final revision, scoped clean/diff checks, and hashes; timestamp `2026-10-24T22:38:48Z`.

The production lane HEAD remained R1. Scoped `git diff --exit-code` and `git status --short` checks for the production tool and receipt directory were clean. No production commit, push, install, sibling-seat write, or production Git/jj state mutation occurred; only the sandbox clone was committed. This is a targeted mutation result for the reproduction arm, not an A58/D58 round verdict.

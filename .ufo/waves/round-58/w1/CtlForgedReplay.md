# CtlForgedReplay — kumitate round 58

- Axes: operability, coverage.
- Scoped item: zero a copied `attest-run-1.txt` receipt's `stdout_sha256`, preserve its nonce, repair its authentication bytes, commit only in a sandbox clone, and exercise `receipt-evidence` reproduction.
- Observed control outcome: **REPRODUCE fired as required**. The forged revision produced `RECEIPT_EVIDENCE: UNMET`, exit 1, and did not produce `RECEIPT_EVIDENCE: HELD`.

## Revisions and scratch mutation

- Measured R1: `6affb9ebde37b7d663658f1959d64f0f0b68f480`.
- Sandbox clone: `.ufo/waves/round-58/build/CtlForgedReplay/lane`, created with `git clone --no-hardlinks file:///home/vgpnk/Projects/shokunin/kumitate-shokunin .../lane` and detached at R1.
- Sandbox-only forged revision: `254d9f1453cfb455d9725d498becc7adab9cdeca` (the clone's detached `HEAD`). Its commit changed exactly the receipt and its sidecar.
- Nonce before and after: `8ccae7eac883bb9b72d727493960b9e5` (unchanged).
- `stdout_sha256` changed from `6d41419fff1f5e5a40ac3eb1e53bb88783d222362ac1d120457661cd1d4e46b5` to 64 zeroes. The only other body field changed was `digest`, recomputed so the forgery would pass ledger authentication and reach the reproduction arm.
- The replacement sidecar SHA was `9a867c95fc1ca6ce86f609fca8268e1c906e8baff5b154f9bdcba16ddc895584`.

## Observed commands and results

Baseline at unmodified R1, using the same sandbox receipt set:

```text
RECEIPT_EVIDENCE: HELD receipts=3 reproduced=3 sweep_files=5580 sweep_nonces=63 span_ms=346314
exit_code=0
```

The resealed forged receipt remained ledger-valid:

```text
RECEIPT: VALID
exit_code=0
```

The required forged-revision verification command was:

```bash
node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-58/build/CtlForgedReplay/lane/scripts/receipt-evidence.mjs verify --lane /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-58/build/CtlForgedReplay/lane --rev 254d9f1453cfb455d9725d498becc7adab9cdeca --receipts /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-58/build/CtlForgedReplay/lane/.ufo/waves/round-58/receipts --min-span-ms 300000
```

Its complete verdict output and exit were:

```text
RECEIPT_EVIDENCE: UNMET reason=REPRODUCE detail=attest-run-1.txt
exit_code=1
```

Thus a self-consistent body and sidecar did not make the fabricated stdout digest count as evidence: re-running the recorded argv rejected it at `REPRODUCE`. This corroborates the requested R57-V4 control shape only; it is not an independent verdict on the whole A58 predicate.

## Evidence and bounds

- Full command lines, combined stdout/stderr, and exit codes: `.ufo/waves/round-58/build/CtlForgedReplay/00-source-head-before.log` through `20-source-receipt-still-matches-r1.log`.
- Mutation metadata: `08-forge-and-reseal.log`; byte diff: `09-forged-diff.log`; scratch commit scope: `14-forged-commit.log` and `15-changed-paths.log`.
- Baseline transcript: `06-baseline-verify.log`; ledger transcript: `17-forged-ledger-valid.log`; forged-control transcript: `18-forged-verify.log`; driver assertion summary: `result.txt` (`evidence_failures=0`).
- All mutating git commands targeted only the sandbox clone. The source lane's `HEAD` was R1 both before and after, and the source receipt plus sidecar still matched R1 after the run. No production, fleet, sibling-lane, jj-state, or source-lane index writes were performed; no commit was made in the source lane.
- No tools were installed or updated. No external sources were assessed for this control.

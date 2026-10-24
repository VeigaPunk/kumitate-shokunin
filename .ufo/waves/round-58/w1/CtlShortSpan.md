# CtlShortSpan — round 58

- Role: executor (leaf seat)
- Axes: operability, coverage
- Judged revision: `6affb9ebde37b7d663658f1959d64f0f0b68f480`
- Contract: `kumitate-receipt-evidence-v1`, span arm
- Sandbox: `.ufo/waves/round-58/build/CtlShortSpan/lane`

## Finding

**Corroborated.** With `--min-span-ms 300000`, the original R1 receipt set read `HELD` with a 346,314 ms span, while the sandbox copy whose three body `wall_start` fields were compressed to exactly 10,000 ms read `UNMET reason=SPAN_SHORT` and exited 1. This independently reproduces the requested short-span control; it is not an ATTEST58 verdict.

## Mutation and isolation

The sandbox was cloned with `git clone --no-hardlinks file:///home/vgpnk/Projects/shokunin/kumitate-shokunin <build>/lane` and detached at R1. No commit was created.

| Receipt | Original body `wall_start` | Mutated body `wall_start` |
|---|---|---|
| `attest-run-1.txt` | `2026-10-24T14:16:35.853Z` | `2026-10-24T14:16:34.853Z` |
| `attest-run-2.txt` | `2026-10-24T14:22:20.202Z` | `2026-10-24T14:16:39.853Z` |
| `attest-run-3.txt` | `2026-10-24T14:22:22.167Z` | `2026-10-24T14:16:44.853Z` |

The mutator recomputed each inner digest and GNU sha256 sidecar. The receipt diff preserved argv, nonces, exit/output hashes, monotonic spans, wall ends, and preludes. Sandbox `git status --short` named only the three receipts and their three sidecars.

After mutation, `receipt-attest verify --ledger` printed `RECEIPT: VALID` and exited 0 independently for each of the three receipts. Thus the ledger/digest/sidecar checks accepted the resealed mutation before the evidence gate evaluated it.

## Observed verdicts

Baseline, before mutation:

```text
RECEIPT_EVIDENCE: HELD receipts=3 reproduced=3 sweep_files=5580 sweep_nonces=63 span_ms=346314
[exit=0]
```

The same verify argv after mutation, still judging R1 and using `--min-span-ms 300000`:

```text
RECEIPT_EVIDENCE: UNMET reason=SPAN_SHORT detail=span_ms=10000 min_ms=300000
[exit=1]
```

Because verification reaches the span check only after ledger validation, reproduction, and freshness, the observed `SPAN_SHORT` result isolates the requested arm. The harness's explicit output assertions also passed (`VERDICT_ASSERTIONS=PASS baseline=HELD mutant=SPAN_SHORT`).

## Evidence

- Full commands, combined stdout/stderr, and exit codes: `.ufo/waves/round-58/build/CtlShortSpan/transcript.txt`
- Baseline verdict: `.ufo/waves/round-58/build/CtlShortSpan/baseline-verify.txt`
- Short-span verdict: `.ufo/waves/round-58/build/CtlShortSpan/short-span-verify.txt`
- Reproducible mutator and harness: `.ufo/waves/round-58/build/CtlShortSpan/mutate-short-span.mjs`, `.ufo/waves/round-58/build/CtlShortSpan/run-control.sh`

Production `HEAD` read R1 before and after the harness. No production files were edited, no tools were installed, and no git/jj commit or push was performed.

Report: .ufo/waves/round-58/w1/CtlShortSpan.md

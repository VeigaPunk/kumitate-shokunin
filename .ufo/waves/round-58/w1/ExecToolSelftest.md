# ExecToolSelftest — round 58, w1

Axes: operability, coverage. Scope: C1 `receipt-evidence` selftest only; this is an observation report, not an `ATTEST58_HELD` verdict.

## Command

```sh
node /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/receipt-evidence.mjs --selftest
```

## Observed results

- Case PASS lines: **10** (expected 10).
- Selftest summary: `RECEIPT_EVIDENCE_SELFTEST: PASS (10/10)`.
- Final VERDICT line: `VERDICT: PASS`.
- Exit code: **0**.
- Stderr: empty.
- Passing cases: `held-base`, `reproduce-miss`, `exit-miss`, `nonce-reused`, `sweep-no-files`, `unparseable-rev`, `sentinel-miss`, `span-short`, `doctored-prelude`, `receipts-unreadable`.

Finding: the requested selftest expectation is independently corroborated. No failure was observed in this scoped run.

## Evidence

All paths below are relative to the lane root:

- Command: `.ufo/waves/round-58/build/ExecToolSelftest/selftest.command.txt`
- Complete stdout: `.ufo/waves/round-58/build/ExecToolSelftest/selftest.stdout.txt`
- Complete stderr: `.ufo/waves/round-58/build/ExecToolSelftest/selftest.stderr.txt`
- Exit code: `.ufo/waves/round-58/build/ExecToolSelftest/selftest.exit-code.txt`

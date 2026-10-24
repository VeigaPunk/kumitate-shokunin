# ExecToolVerifyR1

- Role: executor
- Axes: operability, coverage
- Judged revision: `6affb9ebde37b7d663658f1959d64f0f0b68f480`
- Contract: `kumitate-receipt-evidence-v1`

## Round-57 nonce extraction

The extraction command exited 0 with empty stderr. Using the three primary receipts named by frozen A58 B3 produced:

```text
attest-run-1.txt 89182e386fd9d9a57b2a894a2a86387d
attest-run-2.txt e9f14ab41bb2b52adb4a1cd5a4cd8bb8
attest-run-3.txt 9a065643099d3095b3db2bbbc0cb1287
```

`attest-run-2-replayed.txt` was not used as a fourth sentinel; it duplicates the `attest-run-2.txt` nonce.

Extraction command:

```bash
python3 /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-58/build/ExecToolVerifyR1/extract_nonces.py
```

## R1 verification

Executed command:

```bash
node /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/receipt-evidence.mjs verify --lane /home/vgpnk/Projects/shokunin/kumitate-shokunin --rev 6affb9ebde37b7d663658f1959d64f0f0b68f480 --receipts /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-58/receipts --min-span-ms 300000 --expect-sweep-nonce 89182e386fd9d9a57b2a894a2a86387d --expect-sweep-nonce e9f14ab41bb2b52adb4a1cd5a4cd8bb8 --expect-sweep-nonce 9a065643099d3095b3db2bbbc0cb1287
```

Observed stdout (complete):

```text
RECEIPT_EVIDENCE: HELD receipts=3 reproduced=3 sweep_files=5580 sweep_nonces=63 span_ms=346314
```

Observed stderr: empty. Observed exit code: `0`.

This matches the expected `HELD receipts=3 reproduced=3` reading. The run accepted all three round-57 sweep sentinels and reported a 346,314 ms receipt span against the 300,000 ms minimum. This corroborates only the scoped R1 tool execution; it is not an ATTEST58 or round-level verdict.

## Evidence

Full command, stdout, stderr, and exit records are under `.ufo/waves/round-58/build/ExecToolVerifyR1/`:

- `nonce-extraction.command.txt`, `nonce-extraction.stdout`, `nonce-extraction.stderr`, `nonce-extraction.exit`
- `verify-r1.command.txt`, `verify-r1.stdout`, `verify-r1.stderr`, `verify-r1.exit`
- `extract_nonces.py` and `run_and_capture.py` are the auxiliary extraction/capture code.

No production files were changed, no commits or pushes were made, and no tools were installed.

Report: .ufo/waves/round-58/w1/ExecToolVerifyR1.md

# MutKill2

- Role: mutation-tester
- Axes: operability, coverage
- Judged revision: `6affb9ebde37b7d663658f1959d64f0f0b68f480`
- Contract: `kumitate-receipt-evidence-v1`
- Scoped result: **KILLED**

## Control and mutation

Created the required `--no-hardlinks` sandbox clone under `.ufo/waves/round-58/build/MutKill2/lane/` and checked out the judged revision without moving the lane HEAD. `03-head.stdout` confirms the clone HEAD is exactly `6affb9ebde37b7d663658f1959d64f0f0b68f480`.

Before constructing the control, the honest R1 tool accepted the original receipts:

```text
RECEIPT_EVIDENCE: HELD receipts=3 reproduced=3 sweep_files=5580 sweep_nonces=63 span_ms=346314
```

The original baseline exited 0 with empty stderr. The scratch transformation then preserved argv, nonces, output hashes, `wall_end`, and preludes while setting the three body `wall_start` fields to:

```text
attest-run-1.txt  2026-10-24T14:16:35.853Z
attest-run-2.txt  2026-10-24T14:16:40.853Z
attest-run-3.txt  2026-10-24T14:16:45.853Z
```

Their span is exactly 10,000 ms. Inner digests and GNU sha256 sidecars were recomputed. Independent `receipt-attest verify --ledger` runs for all three resealed receipts each printed `RECEIPT: VALID` and exited 0. Thus the honest control below reached the span arm rather than failing ledger validation.

The mutant deleted exactly one line from the scratch `scripts/receipt-evidence.mjs` (R1 source line 206):

```js
if (span < minSpan) unmet('SPAN_SHORT', `span_ms=${span} min_ms=${minSpan}`);
```

`node --check` on the mutant exited 0. The complete one-line deletion is captured in `13-mutation-diff.stdout`.

## Before: honest tool on the 10 s receipt set

Executed:

```bash
node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-58/build/MutKill2/honest-receipt-evidence.mjs verify --lane /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-58/build/MutKill2/lane --rev 6affb9ebde37b7d663658f1959d64f0f0b68f480 --receipts /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-58/build/MutKill2/lane/.ufo/waves/round-58/receipts --min-span-ms 300000
```

Observed stdout (complete):

```text
RECEIPT_EVIDENCE: UNMET reason=SPAN_SHORT detail=span_ms=10000 min_ms=300000
```

Observed stderr: empty. Observed exit code: `1`.

## After: span-check-deleted mutant on the same receipt set

Executed:

```bash
node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-58/build/MutKill2/lane/scripts/receipt-evidence.mjs verify --lane /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-58/build/MutKill2/lane --rev 6affb9ebde37b7d663658f1959d64f0f0b68f480 --receipts /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-58/build/MutKill2/lane/.ufo/waves/round-58/receipts --min-span-ms 300000
```

Observed stdout (complete):

```text
RECEIPT_EVIDENCE: HELD receipts=3 reproduced=3 sweep_files=5580 sweep_nonces=63 span_ms=10000
```

Observed stderr: empty. Observed exit code: `0`.

This satisfies the item's KILLED definition: against the same R1 archive and same 10,000 ms receipt set, deleting only the span comparison changed `UNMET reason=SPAN_SHORT` / exit 1 into `HELD` / exit 0. The mutant's HELD line reports `reproduced=3`, `sweep_files=5580`, and `sweep_nonces=63`; the honest tool emitted the dedicated `SPAN_SHORT` rejection. The observed flip isolates the deleted span guard. This corroborates the span arm's operability and the `CtlShortSpan` shape's mutation coverage, not an ATTEST58 or round-level verdict.

## Evidence and bounds

Full commands, stdout, stderr, and exit codes are under `.ufo/waves/round-58/build/MutKill2/`:

- `commands.log` plus per-step `.cmd`, `.stdout`, `.stderr`, and `.exit` files
- `05-original-held.*` — original-receipt baseline
- `06-shorten.*` and `07-ledger-{1,2,3}.*` — 10 s fixture construction and ledger validation
- `10-honest-short.*` — honest rejection
- `11-delete-span-check.*`, `12-mutant-syntax.*`, and `13-mutation-diff.*` — exact mutation and syntax check
- `14-mutant-short.*` — mutant false acceptance
- `15-classify.*` — observed `MUTANT: KILLED` classification
- `run.stdout`, `run.stderr`, and `run.exit` — complete runner result (`0`, empty stderr)

The scratch status contains only the expected run-2/run-3 receipt pairs and the mutated tool; run 1 was already the window base and remained byte-identical. `17-production-relevant-diff.exit` is `0`, confirming the production tool and R58 receipts still match R1. No production files were changed, no commits or pushes were made, and no tools were installed.

Report: .ufo/waves/round-58/w1/MutKill2.md

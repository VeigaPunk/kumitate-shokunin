# MutKill5 — expected-sweep-sentinel mutant

- Round: 58, seat `MutKill5` (`mutation-tester`)
- Axes: operability, coverage
- Judged revision: `6affb9ebde37b7d663658f1959d64f0f0b68f480`
- Contract: `kumitate-receipt-evidence-v1`
- Scoped result: **KILLED**

## Mutation

The R1 tool and R1 receipts were extracted with read-only `git archive` into `build/MutKill5/r1/`; the tool was copied to `build/MutKill5/mutant/scripts/receipt-evidence.mjs`. Only that scratch copy was changed. The complete diff is one source-line replacement:

```diff
     for (const h of expect) {
-      if (!sw.nonces.has(h)) unmet('SWEEP_SENTINEL_MISS', h);
+      void h;
     }
```

This makes `--expect-sweep-nonce` matching a no-op while leaving ledger validation, reproduction, receipt-nonce freshness, sweep coverage, and span checks unchanged. The honest R1 tool hashed to `0ea6b66df7dcff4dc9381c688a5182fb1fe2c3be5353df7a52d3c6f2e006972c`; the mutant hashed to `c1deb8b32732c4bb9b607bb808949861eed01bb1a3fefceedfd415f48ebf4a45`.

## Absent sentinel

The exact R1 sweep produced 319 nonce matches and 63 unique nonces. The selected expected nonce was:

```text
3ce978f03c96eebdc86a10b026844fe3
```

It is the first 32 hex digits of `sha256("MutKill5:0")` and was selected because it is absent from that swept set (`select-nonce.log`: `expected_present=false`). Both decisive runs used this nonce, the same R1 revision, the same extracted R1 receipts, and `--min-span-ms 300000`.

Preflight note: the initial all-`f` candidate was found **present** in the sweep, so its two `HELD` runs are not a valid kill test. Those runs are preserved as `preflight-present-before.txt` and `preflight-present-after.txt`, and are excluded from the result.

## Before and after

| Tool | Observed final line | Exit |
| --- | --- | ---: |
| Honest R1 bytes | `RECEIPT_EVIDENCE: UNMET reason=SWEEP_SENTINEL_MISS detail=3ce978f03c96eebdc86a10b026844fe3` | 1 |
| Sentinel-matching no-op mutant | `RECEIPT_EVIDENCE: HELD receipts=3 reproduced=3 sweep_files=5580 sweep_nonces=63 span_ms=346314` | 0 |

The full commands, combined stdout/stderr, and exit codes are in `build/MutKill5/before.txt` and `build/MutKill5/after.txt`; the exit codes are also in their adjacent `.exit.txt` files. The mechanical check in `classification.txt` observed `MUTANT: KILLED` and exited 0.

Deleting only the expected-sentinel comparison changed the honest tool's missing-sentinel rejection from `UNMET` / exit 1 to false `HELD` / exit 0. This satisfies the item's KILLED definition and corroborates the operability of the sentinel arm and its targeted mutation coverage. It is not an ATTEST58, DOCTRINE58, or round-level verdict.

## Evidence and bounds

Evidence is under `.ufo/waves/round-58/build/MutKill5/`:

- `setup.txt` — R1 archive/extraction commands, outputs, hashes, and exit status.
- `mutation.diff`, `mutant-sha256.txt` — exact scratch-only mutation and hashes.
- `sweep-nonces.txt`, `sweep-nonces.stderr.txt`, `sentinel-absence.txt` — exact R1 sweep bytes and preflight candidate check.
- `select-nonce.log`, `selected-nonce.txt` — deterministic absent-nonce selection.
- `before.txt`, `after.txt` — decisive full commands and before/after transcripts.
- `classification.txt` — syntax invocations, mechanical KILLED classification, and observation timestamp `2026-10-24T22:40:51Z`.
- `production-integrity.txt` — production tool still hashes identically to R1; scoped production-vs-R1 diff exited 0.
- `preflight-present-*.txt` — rejected present-sentinel preflight, retained for completeness.

No Git-writing command was needed, so no clone was created. No production file was edited; no commit, push, Git/jj state mutation, sibling-seat write, install, or subagent dispatch occurred.

Report: .ufo/waves/round-58/w1/MutKill5.md

# CritReceiptsHand — independent committed-receipt attack

## Axes and attacked surface

- **Operability / `ATTEST_HELD` (A51):** exact-byte sidecar integrity, semantic inner-digest integrity, genuine-run nonce distinctness, clock ordering/span, and fidelity of the committed A3 negative control.
- **Coverage / `DOCTRINE_HELD` (D51):** evidence accuracy where the knowledge entry cites A3 as evidence of a prelude rewrite breaking the sidecar. No D51 score is asserted.

Attacked the integrated `attest-run-1.txt`, `attest-run-2.txt`, and `attest-run-2-replayed.txt` at the assignment's fixed revision **`7d88faa733c5621da1cac174515e4a7d7d8896ea`**, not a moving HEAD. Repository: `/home/vgpnk/Projects/shokunin/kumitate-shokunin`.

**Result:** independently derived **VALID / VALID / TAMPERED**, matching the assignment-supplied instrument verdicts. **No CRITICAL verdict mismatch found.** The instrument was neither executed nor imported. There is one fixable negative-control defect: the committed replay control has **no sidecar**, so its TAMPERED result does not establish the advertised stale-sidecar mismatch.

## Finding F1 — MEDIUM: committed A3 tests absence, not the promised stale sidecar

**Counterexample.** The control's JSON body is byte-identical to run 2 and only its display prelude changes, but `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/receipts/attest-run-2-replayed.txt.sha256` is absent both from the inspected working directory and, decisively, from the fixed committed tree. The promised construction is “prelude rewritten, sidecar untouched” (`plan.md:63–65`, addendum item 6). A missing file is not an untouched sidecar.

**Why matching verdicts do not resolve this.** The inspected instrument's `scripts/receipt-attest.mjs:319–323` emits TAMPERED immediately for an absent sidecar, before the hash-mismatch branch at lines 331–335. The frozen A3 branch, `probe/attest51-probe.mjs:179–188`, checks only that the control exists and verification exits 1 with TAMPERED; it does not require or compare the control sidecar. Thus the diagnostic label `prelude-replay rejected` can describe a missing-sidecar rejection. This is the same failure-class substitution already repaired for live challenge A3c by freeze-addendum item 6, but still present in the committed A3 artifact.

**Impact.** A51's committed A3 witness does not demonstrate its stated stale-sidecar mechanism. The knowledge entry `/home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/knowledge/invocation-attestation.md:20–23` cites frozen A3 as evidence that a prelude rewrite breaks the sidecar; that particular committed witness is weaker than advertised. This does **not** establish that the instrument accepts the forgery, nor that live A3c fails. No counter, harm gate, or canonical admission was run or judged here.

**Smallest safe correction (integration owner only).** Commit the missing `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/receipts/attest-run-2-replayed.txt.sha256` as an **exact-byte copy** of `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/receipts/attest-run-2.txt.sha256`. Do not regenerate its hash. Its retained hash will be `7d0f3e075b8bb9c87d67318ca3f96e17b81a1b4a8a4478ea492d50cd59a9cc85`, which differs from the control's independently computed `9391550915448a8d232375ecbd9bff7c745fed0379f95bc73cb9d5b7bd24b4c5`. This is an evidence-artifact correction, not a tradeoff requiring a new authority, predicate change, or counter edit. An unchanged copied sidecar still names the original basename: compare its stored hash to the explicit control target, rather than relying on GNU `--check` to select the target.

## Independent measurements

All file hashes below were computed with `/usr/bin/sha256sum` on committed blobs extracted by read-only `git show` into `/tmp/r51-CritReceiptsHand.8uhjhf`. Semantic bodies were independently canonicalized in Python, then hashed with both Python SHA-256 and GNU `sha256sum`.

| Receipt | Exact file SHA-256 | Stored / independently computed inner SHA-256 | Sidecar | Independent verdict |
|---|---|---|---|---|
| `attest-run-1.txt` | `7b87133ae29dbc9245c71689d05428886bea934cd487ceaa0954a8ede3b2fafd` | `dfd8a98b081c83edb7dffb0dfc978ba00ed5ec26f2c305fde30ed951316845b5` / same | matching; GNU check exit 0 | VALID |
| `attest-run-2.txt` | `7d0f3e075b8bb9c87d67318ca3f96e17b81a1b4a8a4478ea492d50cd59a9cc85` | `5f7b2bd339cb1fb52b7ca182fcbe50b435d850bad699057805b08dd49ae95b01` / same | matching; GNU check exit 0 | VALID |
| `attest-run-2-replayed.txt` | `9391550915448a8d232375ecbd9bff7c745fed0379f95bc73cb9d5b7bd24b4c5` | `5f7b2bd339cb1fb52b7ca182fcbe50b435d850bad699057805b08dd49ae95b01` / same | **absent at fixed revision** | TAMPERED |

- Run 1 nonce: `3fd22d2153f74061d59ed9527b4ffca7`.
- Run 2 nonce: `f95078d001c850abec0f9c0be449318f`.
- Both are 32 lowercase hex characters and distinct (**2/2 genuine-run nonces**). The control intentionally repeats run 2's nonce and identical semantic digest/body; it is not a third independent invocation and does not constitute a same-nonce/different-record ledger collision.
- All three receipt file hashes are distinct; all three JSON lines are already canonical. The two inner digests are distinct across genuine runs and identical between run 2 and the control, as required for a prelude-only change.

| Receipt | `wall_start` → `wall_end` | Wall span | Recorded monotonic span | Prelude minus wall start |
|---|---|---:|---:|---:|
| run 1 | `2026-10-24T02:35:11.057Z` → `2026-10-24T02:35:11.371Z` | 314 ms | 313 ms | 0 ms |
| run 2 | `2026-10-24T02:39:06.793Z` → `2026-10-24T02:39:06.866Z` | 73 ms | 73 ms | 0 ms |
| replay control | same body clocks as run 2 | 73 ms | 73 ms | −21,357,793 ms |

Both genuine receipts have nonnegative spans and preludes exactly equal to their semantic starts. The control's prelude is `2026-10-23T20:43:09.000Z`, outside even the instrument's ±60-second display slack. Its negative-control timestamp must not be counted as a genuine scheduling observation.

**Genuine run-1/run-2 start span: 235,736 ms = 235.736 s.** This alone is below 300 s, but receipt 3 is explicitly scheduled pre-close. This is **not a finding**, and this review makes no completed-A2 or three-run-span claim.

## Commands and observed output

### Committed membership: missing dependency, not an inference from the working tree

```text
$ /usr/bin/git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin ls-tree -r --name-only 7d88faa733c5621da1cac174515e4a7d7d8896ea -- .ufo/waves/round-51/receipts
.ufo/waves/round-51/receipts/attest-run-1.txt
.ufo/waves/round-51/receipts/attest-run-1.txt.sha256
.ufo/waves/round-51/receipts/attest-run-2-replayed.txt
.ufo/waves/round-51/receipts/attest-run-2.txt
.ufo/waves/round-51/receipts/attest-run-2.txt.sha256
.ufo/waves/round-51/receipts/run-1.out
```

The missing blob request made by the independent checker was:

```text
/usr/bin/git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show 7d88faa733c5621da1cac174515e4a7d7d8896ea:.ufo/waves/round-51/receipts/attest-run-2-replayed.txt.sha256
BLOB_ABSENT .ufo/waves/round-51/receipts/attest-run-2-replayed.txt.sha256 exit=128 diagnostic=fatal: path '.ufo/waves/round-51/receipts/attest-run-2-replayed.txt.sha256' does not exist in '7d88faa733c5621da1cac174515e4a7d7d8896ea'
```

### Own canonical-JSON implementation, with no instrument call

Scratch checker: `/tmp/r51-CritReceiptsHand.8uhjhf/independent.py`. It fetches each receipt and sidecar with read-only `/usr/bin/git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show <fixed-revision>:<repo-path>`, writes only scratch copies, and uses the following independently authored digest operation:

```python
semantic = {key: value for key, value in record.items() if key != 'digest'}
canonical_bytes = json.dumps(
    semantic, sort_keys=True, separators=(',', ':'), ensure_ascii=False
).encode('utf-8')
computed_inner = hashlib.sha256(canonical_bytes).hexdigest()
```

The observed records contain only ASCII strings, integers, arrays and objects, so this serialization is byte-equivalent to the declared recursive sorted-key, compact-JSON contract for these bytes; no universal float/Unicode canonicalization claim is made. Canonical files have no trailing newline.

Command:

```text
$ /usr/bin/python /tmp/r51-CritReceiptsHand.8uhjhf/independent.py
```

Observed stdout excerpts (the omitted lines print the canonical bodies and repeat the measurement-table values):

```text
REVISION 7d88faa733c5621da1cac174515e4a7d7d8896ea
COMMITTED_INSTRUMENT_SHA256 44919763ee523f334adaa4242d370435180d07aa0cdd4b85b0a7be870f48e8d9 (not executed)
COMMAND /usr/bin/sha256sum /tmp/r51-CritReceiptsHand.8uhjhf/attest-run-1.txt
7b87133ae29dbc9245c71689d05428886bea934cd487ceaa0954a8ede3b2fafd  /tmp/r51-CritReceiptsHand.8uhjhf/attest-run-1.txt
SHA256SUM_EXIT 0
  recorded_inner=dfd8a98b081c83edb7dffb0dfc978ba00ed5ec26f2c305fde30ed951316845b5
  computed_inner=dfd8a98b081c83edb7dffb0dfc978ba00ed5ec26f2c305fde30ed951316845b5 match=True
COMMAND /usr/bin/sha256sum --check /tmp/r51-CritReceiptsHand.8uhjhf/attest-run-1.txt.sha256 cwd=/tmp/r51-CritReceiptsHand.8uhjhf
attest-run-1.txt: OK
SIDECAR_CHECK_EXIT 0
INDEPENDENT_VERDICT attest-run-1.txt=VALID supplied_instrument=VALID match=True
COMMAND /usr/bin/sha256sum /tmp/r51-CritReceiptsHand.8uhjhf/attest-run-2.txt
7d0f3e075b8bb9c87d67318ca3f96e17b81a1b4a8a4478ea492d50cd59a9cc85  /tmp/r51-CritReceiptsHand.8uhjhf/attest-run-2.txt
SHA256SUM_EXIT 0
  recorded_inner=5f7b2bd339cb1fb52b7ca182fcbe50b435d850bad699057805b08dd49ae95b01
  computed_inner=5f7b2bd339cb1fb52b7ca182fcbe50b435d850bad699057805b08dd49ae95b01 match=True
COMMAND /usr/bin/sha256sum --check /tmp/r51-CritReceiptsHand.8uhjhf/attest-run-2.txt.sha256 cwd=/tmp/r51-CritReceiptsHand.8uhjhf
attest-run-2.txt: OK
SIDECAR_CHECK_EXIT 0
INDEPENDENT_VERDICT attest-run-2.txt=VALID supplied_instrument=VALID match=True
COMMAND /usr/bin/sha256sum /tmp/r51-CritReceiptsHand.8uhjhf/attest-run-2-replayed.txt
9391550915448a8d232375ecbd9bff7c745fed0379f95bc73cb9d5b7bd24b4c5  /tmp/r51-CritReceiptsHand.8uhjhf/attest-run-2-replayed.txt
SHA256SUM_EXIT 0
  recorded_inner=5f7b2bd339cb1fb52b7ca182fcbe50b435d850bad699057805b08dd49ae95b01
  computed_inner=5f7b2bd339cb1fb52b7ca182fcbe50b435d850bad699057805b08dd49ae95b01 match=True
  sidecar=ABSENT; this is not an observed stale-sidecar mismatch
INDEPENDENT_VERDICT attest-run-2-replayed.txt=TAMPERED supplied_instrument=TAMPERED match=True
GENUINE_NONCE_DISTINCT True unique=2/2
ALL_OBJECT_NONCES unique=2/3
CONTROL_SAME_NONCE_AS_RUN2 True
CONTROL_SAME_JSON_BYTES_AS_RUN2 True
CONTROL_ONLY_PRELUDE_DIFF True
CONTROL_VS_ORIGINAL_SIDECAR would_match=False stale_hash=7d0f3e075b8bb9c87d67318ca3f96e17b81a1b4a8a4478ea492d50cd59a9cc85 actual_hash=9391550915448a8d232375ecbd9bff7c745fed0379f95bc73cb9d5b7bd24b4c5
ALL_RECEIPT_FILE_SHA_DISTINCT True
GENUINE_START_SPAN_MS 235736 seconds=235.736 meets_300s=False (run-3 is scheduled; not a finding)
ALL_SUPPLIED_VERDICTS_MATCH True
DEPENDENCY_FINDING replay control sidecar absent at fixed revision; intended stale-sidecar construction cannot be confirmed
```

Independent GNU check of the independently serialized semantic bodies:

```text
$ /usr/bin/sha256sum /tmp/r51-CritReceiptsHand.8uhjhf/attest-run-1.txt.canonical.json /tmp/r51-CritReceiptsHand.8uhjhf/attest-run-2.txt.canonical.json /tmp/r51-CritReceiptsHand.8uhjhf/attest-run-2-replayed.txt.canonical.json
dfd8a98b081c83edb7dffb0dfc978ba00ed5ec26f2c305fde30ed951316845b5  /tmp/r51-CritReceiptsHand.8uhjhf/attest-run-1.txt.canonical.json
5f7b2bd339cb1fb52b7ca182fcbe50b435d850bad699057805b08dd49ae95b01  /tmp/r51-CritReceiptsHand.8uhjhf/attest-run-2.txt.canonical.json
5f7b2bd339cb1fb52b7ca182fcbe50b435d850bad699057805b08dd49ae95b01  /tmp/r51-CritReceiptsHand.8uhjhf/attest-run-2-replayed.txt.canonical.json
```

## Bounds and disposition

No lane code, receipts, counters, plan, corpus, scorecard, registry or git/jj state was changed. No instrument, frozen counter, other runtime, or H1–H5 gate was invoked. Only this report was written under the lane; checker and copied data are under `/tmp`. No tool installation/update was needed. The missing control sidecar is reported without waiting for another seat or manufacturing a replacement. Canonical judgment remains with the Rust judge.

Report: .ufo/waves/round-51/w2/CritReceiptsHand.md

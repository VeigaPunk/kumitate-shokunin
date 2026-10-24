# ScoutS122 — round 58, wave 1

- Axes: operability, coverage.
- Measured revision: `6affb9ebde37b7d663658f1959d64f0f0b68f480` (R1); registry, entry, and pinned capture blobs were obtained with read-only `git show`.
- Outcome: **independently corroborated**. All three assigned Kafka quotations matched, and the Q49 fresh-fetch/pinned-capture check passed. No defect observed.

## Source and tier

- URL: https://kafka.apache.org/43/javadoc/org/apache/kafka/clients/consumer/KafkaConsumer.html
- Access date: `2026-10-24`; local fetch time `2026-10-24T19:43:21-03:00` (`2026-10-24T22:43:21Z`).
- Observed fetch: HTTP `200`; effective URL unchanged; `268296` bytes; empty stderr; curl exit `0`. The page title is `KafkaConsumer (kafka 4.3.1 API)`.
- Tier judgment: **A** — official Apache Kafka 4.3.1 API documentation, directly authoritative for the consumer offset, commit, restart, and replay semantics used by C2. This supports S122's `ADMITTED tier A` / `mined` decision. This scoped source check is not an A58/D58 counter verdict.

## Three-quote verification

The independent helper derived tag-stripped, character-reference-decoded, whitespace-normalized text from each HTML byte stream. Every assigned quotation below matched in the **fresh fetch**, the **live pinned capture**, and the **R1 pinned blob**. The `Offsets and Consumer Position` and `Manual Offset Control` headings were also present in all three.

1. **Committed position — PASS** (§Offsets and Consumer Position; 12-word located quote):
   “The committed position is the last offset that has been stored securely.”
2. **Next-message commit invariant — PASS** (§Manual Offset Control; 18-word located quote):
   “Note: The committed offset should always be the offset of the next message that your application will read.”
3. **At-least-once replay example — PASS** (§Manual Offset Control). The full 26-word R1 target sentence matched in all three normalized texts. To honor the ≤25-word located-quote limit, this 23-word contiguous excerpt is reported:
   “the process that took over consumption would consume from last committed offset and would repeat the insert of the last batch of data.”

Raw-byte detail: the next-message invariant is contiguous in the raw HTML. The committed-position sentence contains inline markup, and the replay-example sentence crosses source lines; both therefore require the normalized-text comparison rather than a misleading contiguous-byte substring test. The full exact strings and per-stream booleans are recorded in `10-verify.stdout.txt`.

## Q49 independent hash and capture comparison

Independent `sha256sum` over the fresh bytes, live pinned bytes, and R1 blob printed the same digest for all three:

```text
ed0068fabe16e861a4be746dbd91db68c7fdef5742f08f6a51d3d26d209e9d41
```

- `sha256sum` exit `0`; `wc -c` reported `268296` bytes for each stream.
- Pairwise `cmp` checks for fresh↔R1, fresh↔live-pinned, and live-pinned↔R1 each exited `0`: the files are byte-identical, not merely hash-equivalent.
- R1 `.ufo/pins/source-captures.json` has exactly one S122 row. Its path is `.ufo/waves/round-58/build/ScoutKafkaOffsets/body.html`, and its recorded SHA-256 and byte count exactly match the independently measured values above.
- **Q49 result: PASS.** The fresh source bytes independently reproduce the pinned capture and its R1 registry binding.

## Evidence and scope

Full commands, stdout, stderr, and exit codes are under `.ufo/waves/round-58/build/ScoutS122/`:

- `00-access-date.*.txt`, `01-fetch.*.txt`, `fetched.html`, and `fetched-headers.txt`.
- `02-r1-registry.*.txt`, `03-r1-entry.*.txt`, and `04-r1-capture.*.txt`.
- `05-sha256.*.txt`, `06-byte-count.*.txt`, and `07-cmp-fresh-r1.*.txt` through `09-cmp-live-r1.*.txt`.
- `verify_s122.py` and `10-verify.*.txt`. The verifier exited `0` with empty stderr, `failed_checks: []`, and `verdict: PASS`.

No production file, source row, pin, Git/jj state, or other seat directory was changed. No commit, push, dispatch, subagent, or install occurred.

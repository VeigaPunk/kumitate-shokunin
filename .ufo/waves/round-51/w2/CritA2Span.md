# CritA2Span — round 51 wave 2

## Result and axes

**A prelude-only change inside the body's wall window, with a recomputed sidecar, reads `RECEIPT: VALID`, not `TAMPERED`.** The accepted interval actually extends **60,000 ms before `wall_start` through 60,000 ms after `wall_end`, inclusive**. With this receipt's 73 ms body window, the precise offsets accepted relative to `wall_start` are **[-60,000, +60,073] ms**. The adjacent milliseconds outside both endpoints read `TAMPERED`. A change of +300,000 ms from the original prelude, and changes at least 300,000 ms outside the body window in either direction, all read `TAMPERED` even after sidecar recomputation.

Axes attacked:

1. **C1 operability / ATTEST_HELD A2:** displayed span versus invocation-start span; content-sensitive M2 rejection.
2. **C2 doctrine / DOCTRINE_HELD:** accuracy of the integrated explanation of the wall-window check.
3. **Provenance and integrity:** distinguish public-hash consistency and same-digest ledger exemptions from proof of temporal truth; retain Q39.
4. **Non-harm:** read-only lane review; only this report was written in the lane. No counters, receipts, pins, code, or corpus were changed.

This is a bounded critic measurement, **not a canonical judgment or a full A51/D51 reading**.

## What was attacked

- Frozen A2 reads `run-at:` preferentially over JSON `wall_start` and requires displayed max-minus-min >=300 s: `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/probe/attest51-probe.mjs:129-150`.
- Wave-1 `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/w1/ExecInstrument.md:204-207` concludes that the +/-60 s check requires real invocations spaced >=300 s and that prelude-only editing with a recomputed sidecar is rejected.
- Wave-1 `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/w1/ExecPinsRecipe.md:172-176` describes the boundary as the unexpanded body window.
- Integrated `/home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/knowledge/invocation-attestation.md:31-33` says a re-dated prelude fails even with its sidecar recomputed, without naming the tolerance.
- Wave-1 `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/w1/LabratM2Replay.md:128-145` already identifies the bounded +/-60 s residual. This review confirms it against the integrated bytes and resolves its millisecond boundary, including the extra 73 ms from this receipt's duration.

The eight repairs and H1-H5 in `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/plan.md:124-222` were read. No repairs to frozen arms are proposed or performed here.

## Identity and method

Reviewed source:

- Tool: `/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/receipt-attest.mjs`
  - SHA256 `44919763ee523f334adaa4242d370435180d07aa0cdd4b85b0a7be870f48e8d9` (matches the assignment).
- Receipt: `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/receipts/attest-run-2.txt`
  - SHA256 `7d0f3e075b8bb9c87d67318ca3f96e17b81a1b4a8a4478ea492d50cd59a9cc85`.
  - `wall_start=2026-10-24T02:39:06.793Z`, `wall_end=2026-10-24T02:39:06.866Z`.
  - Body SHA256, including its original trailing newline: `aa818ff94c0a63811c6083f8612306d2c6b593d412d0f8d40e12875bbe375f3e`.
  - Nonce `f95078d001c850abec0f9c0be449318f`; inner digest `5f7b2bd339cb1fb52b7ca182fcbe50b435d850bad699057805b08dd49ae95b01`.
- Frozen A51 SHA256 `73ee53ec994c5abaf23a5d95022a395be89e87675df07cea58efd3cf1cf0ff2c`.

Commands actually run:

```text
$ mktemp -d /tmp/r51-crit-a2-span.XXXXXXXX
/tmp/r51-crit-a2-span.FiN9aQnk
$ node --version
v24.21.0
$ /usr/bin/sha256sum --version
sha256sum (GNU coreutils) 9.12
$ node /tmp/r51-crit-a2-span.FiN9aQnk/measure.mjs
```

The controller copied the source receipt and its original sidecar into that directory. Each variant kept the bytes after the first newline identical and changed only `run-at:`. It recomputed the outer SHA256 using `/usr/bin/sha256sum`, wrote the standard two-space/basename sidecar, and ran `/usr/bin/sha256sum --check` on every recomputed sidecar (all 13 returned `OK`, exit 0). It never recomputed or changed the body digest, nonce, clocks, or any semantic field. One additional control retained the old sidecar. The original copy verified `RECEIPT: VALID`, exit 0.

Exact Node executable printed by the controller:
`/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node`.

## Measured boundary

Every row below is a real documented `verify` CLI invocation. Offsets are from the unchanged body `wall_start`. Except the last row, sidecars were recomputed and independently checksum-checked first.

| Prelude offset (ms) | Interpretation | Verdict | Exit |
|---:|---|---|---:|
| -300,000 | 300 s before body start | TAMPERED | 1 |
| -60,001 | 1 ms below lower bound | TAMPERED | 1 |
| **-60,000** | **inclusive lower bound** | **VALID** | **0** |
| +1 | literally inside the original body window | VALID | 0 |
| +60 | literally inside the original body window | VALID | 0 |
| +73 | original body end | VALID | 0 |
| +30,000 | within display tolerance, outside raw body window | VALID | 0 |
| +60,000 | 60 s after original prelude | VALID | 0 |
| +60,001 | still within 60 s after body end | VALID | 0 |
| **+60,073** | **inclusive upper bound; end +60,000 ms** | **VALID** | **0** |
| +60,074 | 1 ms above upper bound | TAMPERED | 1 |
| +300,000 | M2-scale +300 s from original prelude | TAMPERED | 1 |
| +300,073 | 300 s beyond body end | TAMPERED | 1 |
| +1, **old sidecar** | same in-window change, no sidecar repair | TAMPERED | 1 |

Actual summary output:

```text
MEASURED_LOW=2026-10-24T02:38:06.793Z
MEASURED_HIGH=2026-10-24T02:40:06.866Z
MEASURED_ACCEPTED_DISPLAY_WIDTH_MS=120073
```

This follows the shipped implementation exactly: `/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/receipt-attest.mjs:75` sets `PRELUDE_SLACK_MS=60_000`; lines 384-390 reject only values strictly below `start-60_000` or strictly above `end+60_000`.

### Exact in-window and upper-bound evidence

Selected verbatim controller output (command paths are absolute):

```text
CASE=inside-plus-1ms run_at=2026-10-24T02:39:06.794Z offset_from_start_ms=1 offset_from_end_ms=-72 body_byte_identical=true
$ /usr/bin/sha256sum "/tmp/r51-crit-a2-span.FiN9aQnk/inside-plus-1ms.txt"
9591f4f808152ce8957a9d0bf85b04117373631f02a8b294efb49377d344445a  /tmp/r51-crit-a2-span.FiN9aQnk/inside-plus-1ms.txt
$ /usr/bin/sha256sum --check "/tmp/r51-crit-a2-span.FiN9aQnk/inside-plus-1ms.txt.sha256" (cwd=/tmp/r51-crit-a2-span.FiN9aQnk)
inside-plus-1ms.txt: OK
exit=0
$ "/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node" "/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/receipt-attest.mjs" "verify" "/tmp/r51-crit-a2-span.FiN9aQnk/inside-plus-1ms.txt"
RECEIPT: VALID
exit=0
```

```text
$ "/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node" "/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/receipt-attest.mjs" "verify" "/tmp/r51-crit-a2-span.FiN9aQnk/plus-60073ms.txt"
RECEIPT: VALID
exit=0
$ "/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node" "/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/receipt-attest.mjs" "verify" "/tmp/r51-crit-a2-span.FiN9aQnk/plus-60074ms.txt"
receipt-attest: prelude 2026-10-24T02:40:06.867Z is outside the recorded wall window [2026-10-24T02:39:06.793Z, 2026-10-24T02:39:06.866Z]
RECEIPT: TAMPERED
exit=1
```

### M2-scale evidence, repaired sidecar

```text
$ /usr/bin/sha256sum "/tmp/r51-crit-a2-span.FiN9aQnk/plus-300073ms.txt"
f51828d60422eb49218ca8d51331620cba31dfa67a165a353704346409e1399b  /tmp/r51-crit-a2-span.FiN9aQnk/plus-300073ms.txt
$ /usr/bin/sha256sum --check "/tmp/r51-crit-a2-span.FiN9aQnk/plus-300073ms.txt.sha256" (cwd=/tmp/r51-crit-a2-span.FiN9aQnk)
plus-300073ms.txt: OK
exit=0
$ "/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node" "/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/receipt-attest.mjs" "verify" "/tmp/r51-crit-a2-span.FiN9aQnk/plus-300073ms.txt"
receipt-attest: prelude 2026-10-24T02:44:06.866Z is outside the recorded wall window [2026-10-24T02:39:06.793Z, 2026-10-24T02:39:06.866Z]
RECEIPT: TAMPERED
exit=1
```

### Ledger does not strengthen the in-window boundary

With the unchanged original present in the scratch ledger, both the +1 ms and +60,073 ms variants still verified `VALID`; the +300,073 ms variant remained `TAMPERED`. Example actual output:

```text
$ "/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node" "/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/receipt-attest.mjs" "verify" "--ledger" "/tmp/r51-crit-a2-span.FiN9aQnk" "/tmp/r51-crit-a2-span.FiN9aQnk/inside-plus-1ms.txt"
receipt-attest: ledger skipped inside-plus-1ms-stale-sidecar.txt: not an attested receipt (sidecar hash mismatch)
RECEIPT: VALID
exit=0
```

All variants retain the original inner digest. The ledger comparison at `/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/receipt-attest.mjs:371` keys reuse on a **different record digest**, not different whole-file bytes. Accordingly, saying the ledger necessarily catches a recomputed-sidecar prelude change is incorrect. This is the frozen same-digest exemption, not a new nonce-ledger failure.

## Counterexample, impact, smallest safe correction

**Counterexample:** changing only the original prelude by +1 ms, +30 s, +60 s, or even +60.073 s and refreshing the public sidecar produces a distinct full-file hash with `VALID`, including with the original in the ledger. That falsifies the unqualified integrated statement that any re-dated prelude with a recomputed sidecar fails. It does **not** falsify rejection of the specified >=300 s M2 change against this short receipt.

**Fixable defect:** doctrine/attribution overclaim. Smallest safe correction is to qualify the explanation: an unchanged sidecar detects any byte change; after sidecar recomputation, the verifier rejects only a prelude **outside `[wall_start-60 s, wall_end+60 s]`**, inclusive at the endpoints. Keep the author-attested/Q39 ceiling. The tolerance itself is a bounded engineering tradeoff, not proof of temporal truth and not grounds here for claiming an A51 failure.

**A2 semantic caution [INFERENCE from the measured rule and frozen A2 source]:** `displayed span >=300 s` does not establish `wall_start span >=300 s`. For valid receipts, displayed span is bounded above by `max(wall_end)-min(wall_start)+120 s`; the raw body-envelope span can therefore be roughly 180 s while displayed span reaches 300 s. The 73 ms body makes the accepted two-extreme span for this one record **120.073 s**, not exactly 120 s. Copies of this one record still cannot satisfy full A2: their nonces are identical, and their maximum display span remains below 300 s. No full A2 counterfeit was constructed or claimed. If the intended future requirement is >=300 s between invocation starts, it needs an explicitly authorized predicate based on body `wall_start`, not an interpretation silently stronger than frozen A2. Do not change the frozen counter in this review.

**Tradeoff for canonical judgment:** accepting the declared author-scheduled display span is compatible with Q39. Treating it as proven real elapsed spacing, or treating every re-dated prelude as detected after public sidecar repair, is not supported by these measurements. No judgment/admission is issued here.

## Additional requested 30-second / 10-minute pair

The follow-up requested the exact names `/tmp/case-a.txt` and `/tmp/case-b.txt`. Both were absent before creation. Their JSON lines are exact copies of the original receipt; their only changed receipt field is the first-line timestamp: `2026-10-24T02:39:36.793Z` (+30 s) and `2026-10-24T02:49:06.793Z` (+600 s).

The sidecars were written from this actual command's hashes, in GNU two-space/basename format:

```text
$ /usr/bin/sha256sum /tmp/case-a.txt /tmp/case-b.txt
54035708f662231611beee734c85ccb6f120ea88ed8d1b643bebec72bfe69682  /tmp/case-a.txt
27f112fc7d9a54754417f1620cdb17ff16e335e6cf7b0a3a0877be99726a9cb7  /tmp/case-b.txt
```

Actual commands and output, with their tool-reported exits:

```text
$ node /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/receipt-attest.mjs verify /tmp/case-a.txt
RECEIPT: VALID
exit=0
$ node /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/receipt-attest.mjs verify /tmp/case-b.txt
receipt-attest: prelude 2026-10-24T02:49:06.793Z is outside the recorded wall window [2026-10-24T02:39:06.793Z, 2026-10-24T02:39:06.866Z]
RECEIPT: TAMPERED
exit=1
```

**The tool accepted case-a (+30 s) and rejected case-b (+10 min), as documented by the roughly one-minute consistency tolerance.**

## Evidence artifacts and limits

- Controller: `/tmp/r51-crit-a2-span.FiN9aQnk/measure.mjs`, SHA256 `b79ba2fa5aa8db484cd9c1d4bbf4c77c1bb03473cd1a909cc3d7f1a4bbbe791b`.
- Full command/output transcript: `/tmp/r51-crit-a2-span.FiN9aQnk/transcript.txt`, SHA256 `4007193a19814439a96afd39acbf2a8f15d112d6a4f354027c7d04b81673e155`.
- Structured outcomes: `/tmp/r51-crit-a2-span.FiN9aQnk/results.json`, SHA256 `1e3b3da64a0015786b045ece93a3f68ba110c434e6c0a3677a380d6229953773`.
- 20 documented `verify` invocations were exercised: original, 14 variants, 3 ledger cases, and the 2 explicitly named follow-up copies. The hashed transcript above covers the first 18; the follow-up commands/output are preserved in the preceding section. No full frozen counter, selftest battery, proxy, census, H1-H5, or canonical runtime was run; none is claimed passed.
- The referenced optional distillation file `/home/vgpnk/Projects/shokunin/kumitate-shokunin/build/DistWave1/wave2-items.md` was absent in the targeted read/search. The directly available wave-1 reports, tool, and requested receipt sufficed; no dependency blocked this measurement.
- The scheduled receipt 3 and its expected temporary A2 miss were not investigated or reported as a defect.
- No tools were installed or updated. No subagents, peer messages, git/jj mutations, or lane runnable files were created.

Report: .ufo/waves/round-51/w2/CritA2Span.md

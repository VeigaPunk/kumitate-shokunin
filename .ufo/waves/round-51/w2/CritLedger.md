# CritLedger — round 51, wave 2

## Axes and attack surface

- **Operability / `ATTEST_HELD` (A51):** ledger conflict detection, same-digest exemption, and rejection of unattested ledger evidence.
- **Coverage / `DOCTRINE_HELD` (D51):** whether the integrated explanation states the actual exemption and prelude-rewrite boundary without implying stronger provenance.
- **No-harm constraints H1–H5:** not exercised by this bounded review; no result or counter score is inferred from these examples.

Attacked the integrated instrument `/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/receipt-attest.mjs`, its ledger exemption, its selftest case 12, the claims in `/home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/knowledge/invocation-attestation.md`, and the wave-1 account in `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/w1/ExecInstrument.md` (ledger and case-12 claims). Also compared the already-recorded boundary in `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/w1/ExecSelftestExec.md:207-243`.

Authoritative semantics: `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/plan.md:35-42,191-198` says **same nonce AND different record digest**, not every physically distinct receipt file. No predicate, route, or frozen counter was changed or scored. The assignment's advertised lane revision was not independently re-measured; the exercised working-tree script's exact hash is below.

## Results

| Requested case | Observed output | Interpretation |
|---|---|---|
| (a) Same nonce, different valid inner digest; both sidecars valid | Both subjects under the ledger: `RECEIPT: REPLAY`, exit 1. Altered twin alone: `RECEIPT: VALID`, exit 0. | Required conflict detection observed, symmetrically. |
| (b) Same nonce, same digest, byte-identical receipt duplicate | Both subjects under the ledger: `RECEIPT: VALID`, exit 0. | Required duplicate exemption observed. |
| (c) Unattested `.txt` neighbors | Missing-sidecar, stale-sidecar, broken-inner-digest, and ordinary-text neighbors were explicitly skipped; original: `RECEIPT: VALID`, exit 0. | Required ignore behavior observed, including a same-nonce/different-digest candidate which would otherwise conflict. |
| (d) Only the prelude differs, valid unchanged inner digest, sidecar recomputed, prelude strictly inside the recorded wall window | Variant alone and **both** ledger subjects: `RECEIPT: VALID`, exit 0. | This **is the declared different-record-digest semantics**. It falsifies broader prose implying that any re-signed prelude rewrite necessarily hits the ledger or window check. |

## Finding F1 — fixable overclaim, not a ledger-contract violation

**Counterexample:** one genuine `/usr/bin/sleep 0.15` invocation produced a 153 ms wall window. Replacing only its display prelude with an instant 76 ms after the recorded start, preserving the JSON line byte-for-byte, and recomputing the sidecar produced another file that verified `VALID` both alone and in a ledger beside the original. Both original and variant also verified `VALID` under that ledger. The file hashes differed, while the nonce and inner digest were identical.

**Local mechanism evidence:**

- `/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/receipt-attest.mjs:105-109` hashes the JSON record only; the prelude is outside the inner digest.
- `/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/receipt-attest.mjs:249-268` requires a matching sidecar and inner digest for ledger evidence.
- `/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/receipt-attest.mjs:371-375` rejects only `state.nonce === record.nonce && state.digest !== record.digest`; our variant deliberately does not satisfy the second condition.
- `/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/receipt-attest.mjs:75,379-390` permits the prelude inside the wall window **plus 60,000 ms slack on each side**. This test used a strictly interior instant and did not depend on that slack.

**Affected claims:**

1. `/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/receipt-attest.mjs:37-40` says a forger who also recomputes the sidecar “still hits the ledger, because the nonce is reused by a DIFFERENT record.” That does not follow for a prelude-only variant: its semantic record is unchanged.
2. `/home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/knowledge/invocation-attestation.md:31-33` says “a re-dated prelude fails even if the sidecar were recomputed,” without the needed outside-the-accepted-window qualification.
3. “Byte-identical duplicates (same digest)” in the script's ledger description and the plan's exemption explanation is not an equivalence: same semantic digest permits physically different preludes. The plan's explicit SAME-nonce/DIFFERENT-digest condition nevertheless determines the answer unambiguously.
4. `/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/receipt-attest.mjs:549-565`, named `prelude-rewrite-with-forged-sidecar-reads-replay`, also appends an argv element and recomputes the inner digest. Its ledger `REPLAY` therefore does not demonstrate that a prelude-only rewrite with a refreshed sidecar is rejected. This independently confirms the earlier wave-1 criticism; it is not a newly discovered implementation regression.

**Impacted axes:** operability's stated detection boundary and coverage's semantic accuracy. No observed defect in the required (a)–(c) behaviors and no claim here that either frozen predicate is unmet.

**Smallest safe correction:** retain the declared ledger behavior. Describe the exemption as **same-record-digest duplicates, including prelude-only variants**, rather than equating it with byte identity. Qualify the re-signing claim: an unchanged sidecar detects any byte rewrite; a refreshed sidecar leaves a same-record prelude variant valid when its prelude is within the verifier's accepted wall window; only a different semantic digest with the reused nonce triggers ledger `REPLAY`. Name the 60 s slack when explaining the window. Rename case 12 to describe its actual different-record/reused-nonce construction, and retain the specific (d) example as an expected-`VALID` boundary case if a regression case is added by the integration owner.

**Tradeoff distinction:** demanding `REPLAY` for (d) would change the frozen same-digest exemption, not repair a failure to implement it. Demanding proof of actual invocation time would also exceed the declared author-attested/Q39 ceiling. Neither semantic change is proposed here, and this review makes no canonical-judge/admission decision. The fixable defect is the broader wording and misleading case name.

## Reproduction setup and identity transcript

All fixture construction and executable review code stayed under `/tmp/kumitate-r51-crit-ledger.QTaMGFnQ`; only this report was written in the lane. No tools were installed or updated. The harness computes canonical digests independently (parse record, remove `digest`, recursively sort keys, `JSON.stringify`, SHA-256), writes GNU sidecars over the exact fixture bytes, and prints every CLI command plus its exit status. The altered-argv twin is a synthetic mutation, not an asserted new invocation.

```text
$ mktemp -d /tmp/kumitate-r51-crit-ledger.XXXXXXXX
/tmp/kumitate-r51-crit-ledger.QTaMGFnQ
$ sha256sum /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/receipt-attest.mjs
44919763ee523f334adaa4242d370435180d07aa0cdd4b85b0a7be870f48e8d9  /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/receipt-attest.mjs
$ node /tmp/kumitate-r51-crit-ledger.QTaMGFnQ/review.mjs
REVIEW_TIME=2026-10-24T02:45:02.198Z
NODE=v24.21.0
TOOL_SHA256=44919763ee523f334adaa4242d370435180d07aa0cdd4b85b0a7be870f48e8d9
AXES=operability (ATTEST_HELD ledger correctness); coverage (DOCTRINE_HELD semantic accuracy); H1-H5 unchanged, not re-run
$ '/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node' '/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/receipt-attest.mjs' 'run' '--out' '/tmp/kumitate-r51-crit-ledger.QTaMGFnQ/seed/captured' '--' '/usr/bin/sleep' '0.15'
receipt-attest: wrote /tmp/kumitate-r51-crit-ledger.QTaMGFnQ/seed/captured.txt
receipt-attest: sidecar /tmp/kumitate-r51-crit-ledger.QTaMGFnQ/seed/captured.txt.sha256
receipt-attest: receipt-sha256 e23c80496367f530212068fbdb61dbb9618630cbde1260f299fa8a961bd56ab9
receipt-attest: command-exit 0
EXIT=0
FACTS {"label":"captured","file":"/tmp/kumitate-r51-crit-ledger.QTaMGFnQ/seed/captured.txt","nonce":"b92b6d9887438e51e3728a6e365774c8","digest":"c609be491dff12613a05b20b219f31d098932cc8c4492d6c0cf8cfddc0bfc727","innerDigestValid":true,"fileSha256":"e23c80496367f530212068fbdb61dbb9618630cbde1260f299fa8a961bd56ab9","prelude":"run-at: 2026-10-24T02:45:02.217Z","wall_start":"2026-10-24T02:45:02.217Z","wall_end":"2026-10-24T02:45:02.370Z"}
$ '/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node' '/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/receipt-attest.mjs' 'verify' '/tmp/kumitate-r51-crit-ledger.QTaMGFnQ/seed/captured.txt'
RECEIPT: VALID
EXIT=0
```

### (a) Same nonce, different digest

Construction: copy the original, append `different-record` to its JSON `argv`, recompute the inner digest and sidecar; preserve the prelude and nonce.

```text
=== (a) same nonce, different valid digest ===
FACTS {"label":"a-original","file":"/tmp/kumitate-r51-crit-ledger.QTaMGFnQ/a/original.txt","nonce":"b92b6d9887438e51e3728a6e365774c8","digest":"c609be491dff12613a05b20b219f31d098932cc8c4492d6c0cf8cfddc0bfc727","innerDigestValid":true,"fileSha256":"e23c80496367f530212068fbdb61dbb9618630cbde1260f299fa8a961bd56ab9","prelude":"run-at: 2026-10-24T02:45:02.217Z","wall_start":"2026-10-24T02:45:02.217Z","wall_end":"2026-10-24T02:45:02.370Z"}
FACTS {"label":"a-different","file":"/tmp/kumitate-r51-crit-ledger.QTaMGFnQ/a/different.txt","nonce":"b92b6d9887438e51e3728a6e365774c8","digest":"9d0fc65888491bcec4a0793cddd7e6d79c63b7b82568097537323c9b94c0310d","innerDigestValid":true,"fileSha256":"8aa9618bb7f0d406cf877d28a3d56b4be7838ce28c8b412994eedcac0f82f0b8","prelude":"run-at: 2026-10-24T02:45:02.217Z","wall_start":"2026-10-24T02:45:02.217Z","wall_end":"2026-10-24T02:45:02.370Z"}
$ '/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node' '/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/receipt-attest.mjs' 'verify' '/tmp/kumitate-r51-crit-ledger.QTaMGFnQ/a/different.txt'
RECEIPT: VALID
EXIT=0
$ '/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node' '/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/receipt-attest.mjs' 'verify' '--ledger' '/tmp/kumitate-r51-crit-ledger.QTaMGFnQ/a' '/tmp/kumitate-r51-crit-ledger.QTaMGFnQ/a/original.txt'
receipt-attest: nonce b92b6d9887438e51e3728a6e365774c8 already bound to a different record in different.txt
RECEIPT: REPLAY
EXIT=1
$ '/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node' '/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/receipt-attest.mjs' 'verify' '--ledger' '/tmp/kumitate-r51-crit-ledger.QTaMGFnQ/a' '/tmp/kumitate-r51-crit-ledger.QTaMGFnQ/a/different.txt'
receipt-attest: nonce b92b6d9887438e51e3728a6e365774c8 already bound to a different record in original.txt
RECEIPT: REPLAY
EXIT=1
```

### (b) Same nonce, same digest duplicate

Construction: write the exact original receipt bytes under two names with corresponding valid sidecars.

```text
=== (b) same nonce, same digest, byte-identical duplicate ===
PROOF {"sameNonce":true,"sameDigest":true,"sameReceiptBytes":true}
$ '/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node' '/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/receipt-attest.mjs' 'verify' '--ledger' '/tmp/kumitate-r51-crit-ledger.QTaMGFnQ/b' '/tmp/kumitate-r51-crit-ledger.QTaMGFnQ/b/original.txt'
RECEIPT: VALID
EXIT=0
$ '/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node' '/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/receipt-attest.mjs' 'verify' '--ledger' '/tmp/kumitate-r51-crit-ledger.QTaMGFnQ/b' '/tmp/kumitate-r51-crit-ledger.QTaMGFnQ/b/duplicate.txt'
RECEIPT: VALID
EXIT=0
```

### (c) Unattested ledger `.txt` files

Construction: original plus four neighbors: the valid-inner-digest (a) twin without a sidecar; the same twin with the original file's stale hash; an altered body retaining the old inner digest but with a matching sidecar; and ordinary text with no sidecar.

```text
=== (c) unattested txt: missing sidecar, stale sidecar, broken inner digest ===
FIXTURE c-missing=/tmp/kumitate-r51-crit-ledger.QTaMGFnQ/c/unattested-no-sidecar.txt same-nonce=true different-digest=true valid-inner=true sidecar=absent
FIXTURE c-stale=/tmp/kumitate-r51-crit-ledger.QTaMGFnQ/c/unattested-stale-sidecar.txt same-nonce=true different-digest=true sidecar=stale
FIXTURE c-inner=/tmp/kumitate-r51-crit-ledger.QTaMGFnQ/c/unattested-inner-mismatch.txt same-nonce=true inner-digest=mismatch sidecar=valid
FIXTURE c-note=/tmp/kumitate-r51-crit-ledger.QTaMGFnQ/c/unattested-note.txt sidecar=absent
$ '/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node' '/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/receipt-attest.mjs' 'verify' '/tmp/kumitate-r51-crit-ledger.QTaMGFnQ/c/unattested-no-sidecar.txt'
receipt-attest: sidecar /tmp/kumitate-r51-crit-ledger.QTaMGFnQ/c/unattested-no-sidecar.txt.sha256 is absent (ENOENT): the receipt bytes are not vouched for
RECEIPT: TAMPERED
EXIT=1
$ '/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node' '/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/receipt-attest.mjs' 'verify' '--ledger' '/tmp/kumitate-r51-crit-ledger.QTaMGFnQ/c' '/tmp/kumitate-r51-crit-ledger.QTaMGFnQ/c/original.txt'
receipt-attest: ledger skipped unattested-inner-mismatch.txt: not an attested receipt (inner digest mismatch)
receipt-attest: ledger skipped unattested-no-sidecar.txt: not an attested receipt (sidecar absent (ENOENT))
receipt-attest: ledger skipped unattested-note.txt: not an attested receipt (sidecar absent (ENOENT))
receipt-attest: ledger skipped unattested-stale-sidecar.txt: not an attested receipt (sidecar hash mismatch)
RECEIPT: VALID
EXIT=0
```

### (d) Prelude-only variant inside the exact wall window

Construction: replace only line 1 with `run-at: 2026-10-24T02:45:02.293Z`, keep line 2 exactly unchanged, and recompute the whole-file sidecar. The original prelude was `.217Z`; the original wall end was `.370Z`. This is not merely within the implementation's slack: it is strictly inside the original 153 ms window.

```text
=== (d) prelude-only change inside exact wall window, recomputed sidecar ===
FACTS {"label":"d-original","file":"/tmp/kumitate-r51-crit-ledger.QTaMGFnQ/d/original.txt","nonce":"b92b6d9887438e51e3728a6e365774c8","digest":"c609be491dff12613a05b20b219f31d098932cc8c4492d6c0cf8cfddc0bfc727","innerDigestValid":true,"fileSha256":"e23c80496367f530212068fbdb61dbb9618630cbde1260f299fa8a961bd56ab9","prelude":"run-at: 2026-10-24T02:45:02.217Z","wall_start":"2026-10-24T02:45:02.217Z","wall_end":"2026-10-24T02:45:02.370Z"}
FACTS {"label":"d-prelude-only","file":"/tmp/kumitate-r51-crit-ledger.QTaMGFnQ/d/prelude-only.txt","nonce":"b92b6d9887438e51e3728a6e365774c8","digest":"c609be491dff12613a05b20b219f31d098932cc8c4492d6c0cf8cfddc0bfc727","innerDigestValid":true,"fileSha256":"4c3703789272b4d97782286396a4ffbae0989de4b18bfe441ce8e33dd68e59df","prelude":"run-at: 2026-10-24T02:45:02.293Z","wall_start":"2026-10-24T02:45:02.217Z","wall_end":"2026-10-24T02:45:02.370Z"}
PROOF {"sameNonce":true,"sameDigest":true,"bodyLineUnchanged":true,"fileBytesDiffer":true,"preludeActuallyChanged":true,"strictInsideWindow":true,"revisedOffsetMs":76,"wallWindowMs":153,"sidecarRecomputedMatches":true}
$ '/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node' '/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/receipt-attest.mjs' 'verify' '/tmp/kumitate-r51-crit-ledger.QTaMGFnQ/d/prelude-only.txt'
RECEIPT: VALID
EXIT=0
$ '/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node' '/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/receipt-attest.mjs' 'verify' '--ledger' '/tmp/kumitate-r51-crit-ledger.QTaMGFnQ/d' '/tmp/kumitate-r51-crit-ledger.QTaMGFnQ/d/original.txt'
RECEIPT: VALID
EXIT=0
$ '/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node' '/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/receipt-attest.mjs' 'verify' '--ledger' '/tmp/kumitate-r51-crit-ledger.QTaMGFnQ/d' '/tmp/kumitate-r51-crit-ledger.QTaMGFnQ/d/prelude-only.txt'
RECEIPT: VALID
EXIT=0
```

Control: the exact same altered file with the original sidecar remains rejected for the intended byte-integrity reason.

```text
=== (d control) same prelude-only change but ORIGINAL sidecar ===
$ '/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node' '/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/receipt-attest.mjs' 'verify' '/tmp/kumitate-r51-crit-ledger.QTaMGFnQ/d-control/prelude-only-stale-sidecar.txt'
receipt-attest: sidecar mismatch: sidecar e23c80496367f530212068fbdb61dbb9618630cbde1260f299fa8a961bd56ab9, actual 4c3703789272b4d97782286396a4ffbae0989de4b18bfe441ce8e33dd68e59df
RECEIPT: TAMPERED
EXIT=1

ALL_REQUESTED_CASES_EXERCISED
```

The outer harness exited 0. No full selftest, frozen counter, proxy, census, harm battery, or canonical judge was invoked. No missing-artifact dependency prevented any requested case.

Report: .ufo/waves/round-51/w2/CritLedger.md

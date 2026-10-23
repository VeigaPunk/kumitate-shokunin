# ScribeSources98 — S098 source row

## Behavior
Prepared the requested S098 SOURCES-row fragment and round-48 corpus coverage-map row. The verified manual says `-a`/`--columns` aligns return values to a selected column (default 40) and documents interleaved calls marked unfinished then resumed; line 158's resumed sample has padding between `)` and `=`. This supports the round-48 counter's parsing rationale. The fragment uses the requested status `used`, `recheck=on-release`, and both requested used-by paths.

## Gates and evidence
- Fresh fetch command:
  `curl --silent --show-error --location --dump-header /tmp/ScribeSources98-strace72.headers --output /tmp/ScribeSources98-strace72.in --write-out 'HTTP_STATUS=%{http_code}\n' 'https://raw.githubusercontent.com/strace/strace/v7.2/doc/strace.1.in' && sha256sum /tmp/ScribeSources98-strace72.in`
- Observed `HTTP_STATUS=200`; SHA-256 `c16859e07dacc5cda882c7ab5f2e353803645a6ca449a0ac41eda1034e67ae9a`. The fresh headers give `date: Fri, 23 Oct 2026 18:22:53 GMT`; this fresh timestamp replaces the attempt-1 draft's earlier fetch timestamp.
- Read and matched the cited manual bytes at lines 832–835 and 148–158. Each quoted excerpt in the attempt-1 draft is verbatim at its stated line(s), and each is at most 25 words: line 835's default-column sentence; line 148's interleaving sentence; line 151's event-order sentence; the `.IR unfinished .` / `.IR resumed .` markers at 152/154; line 153's return sentence; and line 158's resumed `select` sample. Lines 156–157 confirm the sample's unfinished call and intervening other-PID syscall.
- Verified the frozen counter source digest with read-only Git:
  `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show fe3d45bf929246915c8c0de5f7f8682b5015b22c:.ufo/waves/round-48/probe/caproute48-probe.mjs | sha256sum`
  Output: `f24a3af55add0708943526435fde93e02f4ef0c9d4b8e494a9111a5fec890cf2  -`.
- No build, test, selftest, counter, or strace execution was performed. No tool was installed.

## Touched surfaces
Only these new, seat-prefixed fragments/report were written under the permitted round-48 `r48/` directory:
- `.ufo/waves/round-48/r48/ScribeSources98-row.frag.md`
- `.ufo/waves/round-48/r48/ScribeSources98-map-row.frag.md`
- `.ufo/waves/round-48/r48/ScribeSources98.md`

The fetched body and headers are in `/tmp/ScribeSources98-strace72.in` and `/tmp/ScribeSources98-strace72.headers`. No edit was made to `corpus/SOURCES.md`, `corpus/README.md`, `corpus/lessons/round-48.md`, the probe, product code, or SCORECARD/LOG.

## Limits and integration note
The attempt-1 draft's cited `/tmp/kumitate-r48-strace72.in` and `.headers` were absent when read, so I did not reuse those bytes or its old timestamp; the source was fetched anew and all listed excerpts were rechecked. `corpus/lessons/round-48.md` was absent at inspection. The lesson scribe supplied this planned heading and coverage: “# Round 48 — four child sites routed under a repeatable counter”; padded/resumed parsing and equal exec-count checks; receipt-backed conclusions versus cancelled-seat/chat-only readings; C1/C2 close-record skeleton. The scribe first stated verbatim: “S098 remains a queued candidate pending L1 gate.” In a follow-up, the scribe clarified verbatim: “Yes, the lesson draft will cite S098 for the padded-return/interleaved-resume claim”; “I will avoid asserting admitted/used in the lesson gate unless your completed map/row artifact supplies the verified status”; and “Please proceed per your task’s used/used-by request; L1 can reconcile the final Gate decision.” I therefore emit the required `used` row and both specified paths as integration fragments. This does not mean the lesson or SOURCES row is already landed; L1 must reconcile its final gate status on integration.

Out of scope: applying the fragments to the corpus, assigning any C1/C2 result, or making a claim about final round closure.

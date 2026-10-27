VERDICT: M68 v1 has reachable predicate gaps: its capture pins are self-authenticating, M7 accepts a bare S213 token, and M4 allows content-free one-word quotes.

## Evidence

Commands and verbatim output:

```
curl -sI -m 15 -o /dev/null -w 'dep:%{http_code} %{size_download}\n' https://modelcontextprotocol.io/specification/2026-07-28/deprecated.md
dep:200 0
curl -sI -m 15 -o /dev/null -w 'rawgh:%{http_code}\n' https://raw.githubusercontent.com/can1357/oh-my-pi/v18.13.1/packages/coding-agent/src/mcp/transports/sse.ts
rawgh:200
sha256sum s209.body s212.body
0b69229a69b01a372117d3d86833ec40e8f5118efe1049fdc4993ae1c677fbb0  s209.body
0b69229a69b01a372117d3d86833ec40e8f5118efe1049fdc4993ae1c677fbb0  s212.body
```

Code evidence: deprec68-probe.mjs:203-206 validates only bytes against the pin in the same revision; :232-251 limits quotes to <=25 words and tests capture location but has no >=3-word or uniqueness check; :253-271 M5 checks quote presence in fetched response, not capture equality or table cells; :275-310 M6 reads only captureOf.S207; :313-318 M7 checks only date substrings and /S213/. The real S207 page has a six-row Deprecated table (fetched body; table at lines 25-32 in captured inspection).

## Findings

1. K68ReviewC2Predicate-1 — HIGH — Forged S207 capture can define arbitrary snapshot facts. M3 hashes the capture and checks the hash against the co-committed pin, but does not bind either to upstream bytes. M5 checks only each selected quote, not the S207 table cells. Thus a candidate can alter table cells in a fetched-looking capture, recompute pin sha256/bytes, preserve live quotes, and copy the fabricated cells into the snapshot; M6 will compare the snapshot to that forged capture. Reproducer: create a fixture revision with an S207 capture containing a fabricated Deprecated table plus intact quotes `2027-07-28` and `Three months after`; hash/pin those bytes and copy its cells into the entry. Run `node .ufo/waves/round-68/probe/deprec68-probe.mjs <fixture> <rev>` with remaining M1-M10 prerequisites satisfied. Strengthen by requiring capture bytes to match an independently obtained live response (or a separately authenticated immutable source digest); at minimum live-verify each compared M6 cell, not just M4 quotations.

2. K68ReviewC2Predicate-2 — MEDIUM — M7 accepts a bare S213 mention as its evidence pointer. Its predicate is `/S213/.test(sec)`; no row, link, URL, capture, or source-specific context is required. Reproducer: in `## The live clock`, write `Final date 2026-06-03 (S213); grace elapsed 2026-09-03` and omit an actual evidence link. M7 evaluates true. Strengthen by requiring a structured link/pointer to the S213 Registry row/capture and requiring S213 in the cited source IDs.

3. K68ReviewC2Predicate-3 — MEDIUM — M4 omits the claimed minimum quote length and uniqueness. `nwords` is computed, but only `nw > 25` is rejected. Reproducer: use a quote `the` (or repeat the same live phrase) for a cited row whose live page contains it; it passes M4 location and M5 live-fetch checks, provided the two required special quotes and six total bullets are also present. Strengthen with `nw >= 3`, and require distinct quotes (and preferably distinct anchored passages) per row; generic common phrases remain valid under the current live-presence test.

## Artifacts

- `.ufo/waves/round-68/w1/K68ReviewC2Predicate.md`

## Limits

- Did not commit/run a complete fixture against the counter; no `DEPREC68_HELD` result is claimed. The findings above are predicate-level attacks derived from the frozen implementation and are not end-to-end execution evidence.

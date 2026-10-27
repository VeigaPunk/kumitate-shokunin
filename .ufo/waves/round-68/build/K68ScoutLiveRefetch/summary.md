# K68ScoutLiveRefetch — M5 live re-fetch rehearsal (2026-10-27)

Seven S207–S213 candidate URLs, live-fetched with `curl -sS -L` at rehearsal time.
Files: `207.bin`…`213.bin`, per-fetch `207.meta`…`213.meta`.

| seat | URL | HTTP | bytes | time_total | sha256 |
|---|---|---|---|---|---|
| S207 | https://modelcontextprotocol.io/specification/2026-07-28/deprecated.md | 200 | 3839 | 0.259s | c12c3cb7d6b8a30cd4df8ea8162a819df071a42745da6d20165e8fdf94b28baa |
| S208 | https://modelcontextprotocol.io/community/feature-lifecycle.md | 200 | 8794 | 0.273s | 3f3371911512591e61d80d8e1bf07ac6a93df4e930d1379d24b78034349e74ee |
| S209 | https://raw.githubusercontent.com/can1357/oh-my-pi/v18.12.6/packages/coding-agent/src/mcp/transports/sse.ts | 200 | 15183 | 0.015s | 0b69229a69b01a372117d3d86833ec40e8f5118efe1049fdc4993ae1c677fbb0 |
| S210 | https://modelcontextprotocol.io/seps/2596-spec-feature-lifecycle-and-deprecation | 200 | 417781 | 0.121s | 7cb4a66dd6e200754d99bfaa952385cfa6f1419fcdcb6aa4ff6570ea014c1bee |
| S211 | https://modelcontextprotocol.io/specification/2025-11-25/basic/transports.md | 200 | 16321 | 0.280s | ae9bb7be00604a66a8f70f439ef028eced174bce4a5cb0f6fc11bbeaa625afcc |
| S212 | https://raw.githubusercontent.com/can1357/oh-my-pi/v18.13.1/packages/coding-agent/src/mcp/transports/sse.ts | 200 | 15183 | 0.017s | 0b69229a69b01a372117d3d86833ec40e8f5118efe1049fdc4993ae1c677fbb0 |
| S213 | https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2596 | 200 | 502429 | 2.141s | 5a57ce4db8e1b759eba5c795652ee75d0e15264c8e9bcb3b04dfcb97f9bcdeeb |

## Confirmations

1. **All seven reachable** — HTTP 200, exit 0 each. Total wall ~2.15s parallel.
2. **Quote A found verbatim** in `207.bin` (4 occurrences, table rows 26–29):
   `First revision released on or after 2027-07-28`
3. **Quote B found verbatim** in `207.bin` (line 31, HTTP+SSE row):
   `Three months after SEP-2596 reaches Final`
   `208.bin` (feature-lifecycle.md) does NOT contain the literal string; it describes the
   mechanism as "the minimum deprecation window ... at least [N months]" counted "from that
   release" — no `Three months after` phrase. The live wording is exactly the quoted cell text.
4. **SSE source at v18.13.1 exists** — HTTP 200, 15,183 bytes, sha256
   `0b69229a69b01a372117d3d86833ec40e8f5118efe1049fdc4993ae1c677fbb0`.
   Byte-identical to the v18.12.6 capture (`cmp` → IDENTICAL): the file did not change
   between v18.12.6 and v18.13.1. Content: `LegacySseTransport implements MCPTransport`
   (line 47), `LegacySseConnectionTimeoutError` (line 39) — the legacy HTTP+SSE client
   transport is present in source at the installed release tag.

## Word-boundary check (counter's own norm()/wb() replicated)

- `First revision released on or after 2027-07-28` → wb-hit: **207**
- `Three months after SEP-2596 reaches Final` → wb-hit: **207**
- `This SEP has reached Final status` → wb-hit: **210** (SEP-2596 status page)
- `Follows Sampling` → wb-hit: 207, 210
- `Deprecated in` → wb-hit: 207, 208, 210

## Notes for the L1

- S210 live page is a React-JSX payload (417 KB); the `Created` cell reads `2026-04-17`,
  the banner `This SEP has reached Final status`. The 2026-06-03 Final date is NOT in the
  page bytes — it comes from the git history (commit 183238ddac "Mark SEPs as final"),
  i.e. S213 is the pointer for the date. M7's "evidence pointer to S213" is the correct
  construction; quoting `2026-06-03` from S210's page bytes would fail M5.
- The Deprecated table in `207.bin` has **6 data rows** (8 `|`-lines minus header+rule):
  Roots, Sampling, Logging, Dynamic Client Registration, includeContext, HTTP+SSE transport.
  M6's "exactly as many data rows as the Deprecated table of the S207 capture (>= 5)" → 6.
- S213 (github PR #2596 HTML, 502 KB) is viewer-dependent bytes (React shell); quotes for it
  should come from stable surface (title text "SEP-2596: Specification Feature Lifecycle
  and Deprecation Policy ... Pull Request #2596"). The phrase `Mark SEPs as final` is not in
  the fetched HTML — merged-commit subjects render in the page but were not matched;
  treat S213 as a reachability anchor, take date quotes from commit/API surfaces if needed.

## S213 addendum (PR #2596 page evidence in live bytes)

- `mergeCommitSha":"219f82421ce13f6b0d9f786e603cf9a659fd5216` — the PR merged as commit
  `219f8242` (matches round-66 evidence: 2026-05-18T18:09:20Z "SEP-2596: … (#2596)").
- `mergedTime":"2026-05-18T18:09:21Z` — merge date 2026-05-18, while the SEP was still
  Draft; Final came via commit `183238ddac` on 2026-06-03 (round-66 K66ScoutSep2596
  corroborated via the commits API).
- `183238ddac` does NOT appear in the PR HTML (grep → 0) — the Final-flip commit is a
  later main-branch commit, not the PR merge. A row bound to S213 can stably quote the
  merge facts above; the `2026-06-03` Final date is better anchored to the commits-API
  surface or the canonical SEP file if M5 quotability is required.

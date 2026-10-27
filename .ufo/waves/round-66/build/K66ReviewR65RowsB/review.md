# Round-65 source row re-open: S204–S206

## Evidence

Commands and verbatim results (capture bytes/hash compared with fresh live GET):

```text
S204 URL=https://raw.githubusercontent.com/can1357/oh-my-pi/v18.12.6/packages/coding-agent/src/mcp/client.ts
HTTP_STATUS=200
14975 bytes; sha256 479aef6ddda012f8402bc2480637a8c71ada8597d9705a56080dd3ed7c7d3fe9
pin: same 14975 bytes and hash
S205 URL=https://raw.githubusercontent.com/can1357/oh-my-pi/v18.12.6/packages/coding-agent/src/web/search/providers/zai.ts
HTTP_STATUS=200
12774 bytes; sha256 0598c9f221c006af760893d4b68ecea095ee4c090ff56efb8ebf664afc2fd8bb
pin: same 12774 bytes and hash
S206 URL=https://raw.githubusercontent.com/can1357/oh-my-pi/v18.12.6/packages/coding-agent/src/mcp/transports/http.ts
HTTP_STATUS=200
33157 bytes; sha256 41ad7d5b3ff364ba790d4a2a9a54b3f0fa0e491c0b836e3c6436c9ea64cbf033
pin: same 33157 bytes and hash
```

Pin paths/digests: `.ufo/pins/source-captures.json:250-268`; captured files under `.ufo/waves/round-65/build/Capture/`. Rows are `corpus/SOURCES.md:156-158`. Exact located-quote claims: `corpus/knowledge/omp-installed-release-mcp-runtime.md:249-258`.

Quote re-location in both captured file and fresh live response (same bytes/hash above):

- S204: `Echo the negotiated protocol version on every subsequent request.` — yes, line 117; `transport.setProtocolVersion?.(result.protocolVersion);` — yes, line 120; `protocolVersion: MCP_PROTOCOL_VERSION,` — yes, line 100.
- S205: `const ZAI_MCP_PROTOCOL_VERSION = "2025-03-26";` — yes, line 80; `protocolVersion: ZAI_MCP_PROTOCOL_VERSION,` — yes, line 222; `const ZAI_MCP_URL = "https://api.z.ai/api/mcp/web_search_prime/mcp";` — yes, line 17.
- S206: `no protocol-version header is sent from either source.` — yes, line 122; `The transport fully owns `MCP-Protocol-Version`: it is stripped from` — yes, line 118; `Record the protocol version negotiated during `initialize`.` — yes, line 177; `#protocolVersion: string | null = null;` — yes, line 104.

Command used for quote line lookup was a Python exact-substring scan over each captured file; live bytes were saved to `/fast/scratch/hyaku/kumitate-r66/K66ReviewR65RowsB/` and have matching hashes, so these line locations apply to live too.

## Findings

1. No actionable source-row or quote defect found. Row anchors/teaches claims align with the cited source locations and observed text:
   - S204 anchor covers `initializeConnection` (91 onward), initializer protocol parameter (100), and negotiated echo (120). The teaches claim correctly distinguishes outgoing initialize version from negotiated server revision subsequently set on transport before initialized notification.
   - S205 anchor matches endpoint (17), protocol constant (80), and its initialize parameter (222). The teaches claim appropriately scopes the older revision to the separate Z.AI web-search MCP provider.
   - S206 anchor locations match initialization to null (104), removal/addition of header in request construction (row anchor 116–127), and setter (177–180). The source explains pre-negotiation omission and stripping of configured header; row accurately distinguishes shipped tag from commit behavior.
2. Coverage caveat, not row defect: fetching the URL verifies current live response at review time, not immutable historical bytes. Here fresh live response is byte-identical to the pinned capture for all three rows.

## Artifacts

- `.ufo/waves/round-66/build/K66ReviewR65RowsB/review.md`

## Limits

- No runtime request/wire behavior was exercised; conclusions concern source text only.
- No unrelated source rows or the rest of the knowledge entry audited.
- Scratch live-response files removed at end of review.

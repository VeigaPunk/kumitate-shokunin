# S213 row draft — MCP spec 2025-11-25 Transports (prepared lane id S213; L1 re-assigns by URL)

## Capture

- URL: https://modelcontextprotocol.io/specification/2025-11-25/basic/transports.md
- Fetched: 2026-10-27, `curl -fsSL`, HTTP/2 200, `content-type: text/markdown; charset=utf-8`,
  `last-modified: Tue, 27 Oct 2026 06:28:30 GMT`
- Bytes: 16321 — `wc -c transports-2025-11-25.md`
- Lines: 317 — `wc -l transports-2025-11-25.md`
- sha256: `ae9bb7be00604a66a8f70f439ef028eced174bce4a5cb0f6fc11bbeaa625afcc`
- Capture file: `transports-2025-11-25.md` (this directory; exact bytes, byte-identical across two fetches 4 min apart)
- For M3: this capture must be committed under `.ufo/waves/round-66/build/<integrator>/` and bound in
  `.ufo/pins/source-captures.json` with the final S-id, sha256 `ae9bb7be…`, bytes 16321.

## Row (11 cells, census-checked shape `| S213 | … |`; no `|` inside any cell)

| S213 | MCP specification 2025-11-25 — Transports — https://modelcontextprotocol.io/specification/2025-11-25/basic/transports.md | spec | A | the Streamable HTTP transport and the deprecated HTTP+SSE backwards-compatibility contract at protocol revision 2025-11-25, as it bears on the registry entry's HTTP+SSE removal-clock reading | § Streamable HTTP and § Backwards Compatibility; raw markdown opened 2026-10-27, HTTP 200, 16321 bytes, sha256 ae9bb7be00604a66a8f70f439ef028eced174bce4a5cb0f6fc11bbeaa625afcc | the spec's client-side fallback: POST InitializeRequest, and on 400/404/405 switch to the old HTTP+SSE transport via the endpoint event, the contract against which the installed OMP client's config-selected transports are read | mined | 2026-10-27 | 180d | corpus/knowledge/mcp-deprecation-registry.md |

Cell-shape checks: exactly 12 `|` on the row (13 awk fields); kind `spec` ∈ enum; tier A with kind spec (not community) — no inflation; status `mined` with used-by the registry entry.

## Located quotes (verbatim from the capture; line numbers in `transports-2025-11-25.md`)

1. L58 — "protocol version 2024-11-05. See the [backwards compatibility](#backwards-compatibility)" (7 words)
2. L281-283 — "Clients and servers can maintain backwards compatibility with the deprecated [HTTP+SSE transport](https://modelcontextprotocol.io/specification/2024-11-05/basic/transports.md#http-with-sse) (from protocol version 2024-11-05) as follows:" (18 words)
3. L294-295 — "Accept an MCP server URL from the user, which may point to either a server using the old transport or the new transport." (23 words)
4. L296-297 — "Attempt to POST an `InitializeRequest` to the server URL, with an `Accept` header as defined above:" (16 words)
5. L300-301 — "If it fails with the following HTTP status codes \"400 Bad Request\", \"404 Not Found\" or \"405 Method Not Allowed\":" (20 words)
6. L302-303 — "Issue a GET request to the server URL, expecting that this will open an SSE stream and return an `endpoint` event as the first event." (25 words)
7. L304-306 — "the client can assume this is a server running the old HTTP+SSE transport, and should use that transport for all subsequent communication." (22 words)

### norm() verification (exact copy of norm() from the frozen `.ufo/waves/round-66/probe/deprec66-probe.mjs:52-59`)

Run against the capture (`node verify-quotes.mjs` in the seat scratch dir):

```
Q1 words=7 found=true
Q2 words=18 found=true
Q3 words=23 found=true
Q4 words=16 found=true
Q5 words=20 found=true
Q6 words=25 found=true
Q7 words=22 found=true
ALL_OK=true
```

Run against a second, independent live fetch (sha256 byte-identical to the capture):

```
Q1 words=7 found=true
Q2 words=18 found=true
Q3 words=23 found=true
Q4 words=16 found=true
Q5 words=20 found=true
Q6 words=25 found=true
Q7 words=22 found=true
ALL_OK=true
```

Note for the L1: quote 1 must stay inside line 58 — the norm'd blockquote lines 56-58 carry literal `>`
markers between wrapped lines, so any quote spanning them fails `t.includes(norm(q))` (observed: a
spanning variant of Q1 returned `found=false`).

## Backwards-compatibility steps (verbatim, capture L293-309)

**Clients** wanting to support older servers should:

1. Accept an MCP server URL from the user, which may point to either a server using the
   old transport or the new transport.
2. Attempt to POST an `InitializeRequest` to the server URL, with an `Accept` header as
   defined above:
   * If it succeeds, the client can assume this is a server supporting the new Streamable
     HTTP transport.
   * If it fails with the following HTTP status codes "400 Bad Request", "404 Not
     Found" or "405 Method Not Allowed":
     * Issue a GET request to the server URL, expecting that this will open an SSE stream
       and return an `endpoint` event as the first event.
     * When the `endpoint` event arrives, the client can assume this is a server running
       the old HTTP+SSE transport, and should use that transport for all subsequent
       communication.

(Servers, L285-289: continue to host both the SSE and POST endpoints of the old transport,
alongside the new "MCP endpoint"; optionally the old POST and the new MCP endpoint may be combined.)

## Comparison — spec fallback vs OMP v18.12.6 `client.ts` (lane capture S204, `.ufo/waves/round-65/build/Capture/omp-v18.12.6-mcp-client.ts`)

- Spec S213: one URL, auto-negotiation. The client probes with POST `InitializeRequest`; only on
  400/404/405 does it fall back to GET + SSE `endpoint` event, then uses HTTP+SSE for all
  subsequent communication.
- OMP S204 `:73-83` (`createTransport`): transport is chosen by explicit user config, not probed —
  `switch (config.type)` at `:76` with cases `"stdio" | "http" | "sse"`, `case "sse":` at `:81` returning
  `createSseTransport(config, signal)`. There is no code path in client.ts that issues the spec's POST-then-GET
  fallback; a user pointing OMP at an old HTTP+SSE server must set `type: "sse"` themselves, and
  `type: "http"` always speaks Streamable HTTP. Auto-fallback per the 2025-11-25 backwards-compatibility
  section is NOT implemented.
- Related spec point (capture L271-273): a server receiving no `MCP-Protocol-Version` header and no
  negotiated version SHOULD assume `2025-03-26`. OMP's http.ts (S206) sends the header only after
  negotiation (the negotiated revision echoed via `transport.setProtocolVersion?.()`, S204 `:120`),
  matching the spec's "negotiated during initialization" path.
- Registry relevance: the installed release still ships the legacy `transports/sse.ts`
  (`createSseTransport`, imported at S204 `:11`) as a config-selected transport — support code present,
  but the spec's client auto-detection contract is unimplemented. The registry entry's
  "Bearing on the installed OMP release" section can cite S204 for this, and S213 for the normative
  fallback the release does not perform.

## Seat note

Coverage judged on this page: Streamable HTTP (L52-277, incl. session management and the
`MCP-Protocol-Version` header L263-277) + the Backwards Compatibility section (L279-309) scoped by the
seat. The capture is full-page, so the row may be re-scoped without a re-fetch.

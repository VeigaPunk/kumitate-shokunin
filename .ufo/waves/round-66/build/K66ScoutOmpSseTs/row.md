# S209 candidate registry row — oh-my-pi v18.12.6 legacy HTTP+SSE MCP transport (sse.ts)

Prepared by seat K66ScoutOmpSseTs, kumitate round 66 w1. Keyed by URL (prepared id S209; L1 re-assigns ids by document).

## Capture

- URL: https://raw.githubusercontent.com/can1357/oh-my-pi/v18.12.6/packages/coding-agent/src/mcp/transports/sse.ts
- Fetched: 2026-10-27 with `curl -fsSL` (live fetch; M5 re-fetch is the same bytes)
- HTTP status: 200
- Bytes: 15183 — `wc -c sse.ts`
- sha256: `0b69229a69b01a372117d3d86833ec40e8f5118efe1049fdc4993ae1c677fbb0` — `sha256sum sse.ts`
- Lines: 446 — capture beside this file: `sse.ts`
- Tag check: `git ls-remote https://github.com/can1357/oh-my-pi.git "refs/tags/v18.12.6*"` →
  `45c35e40c46166dc726ccc52f5d27f40f2449f99	refs/tags/v18.12.6` (annotated tag object peeled; matches the freeze's tag commit 45c35e40c46166dc726ccc52f5d27f40f2449f99)

## Row draft (11-cell schema of corpus/SOURCES.md `## Registry`)

| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |
|---|---|---|---|---|---|---|---|---|---|---|
| S209 | oh-my-pi v18.12.6 coding-agent legacy HTTP+SSE MCP transport (packages/coding-agent/src/mcp/transports/sse.ts) — https://raw.githubusercontent.com/can1357/oh-my-pi/v18.12.6/packages/coding-agent/src/mcp/transports/sse.ts | code | A | Legacy HTTP+SSE MCP transport shipped in installed OMP release v18.12.6: when selected, handshake and request flow, its timeout errors | sse.ts L38-47 class docs, L95-144 connect handshake, L246-322 request path at tag v18.12.6 commit 45c35e40c46166dc726ccc52f5d27f40f2449f99 | The v18.12.6 client selects this 2024-11-05 HTTP+SSE transport only for config type sse, never as an automatic fallback; it GETs the SSE stream, POSTs JSON-RPC to the endpoint event URL, and raises LegacySseConnectionTimeoutError on endpoint-handshake timeout | mined | 2026-10-27 | 180d | corpus/knowledge/mcp-deprecation-registry.md |

No literal or escaped `|` in any cell. tier A scoped to the installed release's own source code (authoritative for what v18.12.6 ships); teaches is one learner benefit covering the seat's scope (selection, behavior, timeout error).

## Located quotes (verbatim from captured bytes, each <= 25 words)

1. `Legacy MCP HTTP+SSE transport from protocol revision 2024-11-05.` — sse.ts:46 (class doc comment; one clause of the two-line comment at L46)
2. `Legacy SSE endpoint timeout after ${timeoutMs}ms` — sse.ts:41 (message of LegacySseConnectionTimeoutError, the named timeout error)
3. `signal` cancels only the wait for the endpoint event; an established stream outlives it.` — sse.ts:95 (connect() doc comment)
4. `Legacy SSE endpoint event not received` — sse.ts:191 (stream end without endpoint event)
5. `Transport closed: legacy SSE stream closed` — sse.ts:213 (close failure message)
6. `Legacy SSE response timeout after ${timeout}ms` — sse.ts:289 (per-request abort-path timeout rejection)

## Client selection evidence (pinned S204 capture)

Pinned capture `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-65/build/Capture/omp-v18.12.6-mcp-client.ts` verified against pin:
bytes 14975, sha256 `479aef6ddda012f8402bc2480637a8c71ada8597d9705a56080dd3ed7c7d3fe9` — both match `.ufo/pins/source-captures.json` S204.

Selection line at the tag:

- client.ts:82 `return createSseTransport(config as MCPSseServerConfig, signal);` — under client.ts:81 `case "sse":` in `createTransport`.

## Fallback or explicit?

Explicit config choice only — the client never picks this transport on its own.
client.ts:74 `const serverType = config.type ?? "stdio";` — the only default is stdio; the switch (client.ts:75-84) throws `Unknown server type` for anything else, so `type: "sse"` must be set in the server config for `createSseTransport` to run. The 2025-03-26 streamable HTTP transport (`createHttpTransport`, client.ts:10,80) is the separate `http` case, not an auto-upgrade of sse.

## norm() self-check (deprec66-probe.mjs norm, node one-liner)

`node check-quotes.mjs` (script beside this file) output:

```
Q1 sse.ts:46 words=8 norm-substring=true <=25w=true PASS
Q2 sse.ts:41 words=6 norm-substring=true <=25w=true PASS
Q3 sse.ts:95 words=14 norm-substring=true <=25w=true PASS
Q4 sse.ts:191 words=6 norm-substring=true <=25w=true PASS
Q5 sse.ts:213 words=6 norm-substring=true <=25w=true PASS
Q6 sse.ts:289 words=6 norm-substring=true <=25w=true PASS
Q7 sse.ts:311 words=4 norm-substring=true <=25w=true PASS
C1 client.ts:82 words=5 norm-substring=true <=25w=true PASS
C2 client.ts:74 words=6 norm-substring=true <=25w=true PASS
EXIT:0
```

Every quote is a substring of norm(capture) as the frozen counter's M4 matcher computes it (backtick-stripped, whitespace-collapsed).

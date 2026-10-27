# S209 candidate registry row — legacy HTTP+SSE transport source at oh-my-pi v18.12.6

Prepared by seat K68ScoutS209, kumitate round 68 w1. Keyed by URL (prepared id S209; L1 re-assigns ids by document).
Scope assigned by the seat spec: the legacy HTTP+SSE server transport source as of the v18.12.6 tag — evidence the transport code existed at that tag.

## Capture

- URL (verbatim): https://raw.githubusercontent.com/can1357/oh-my-pi/v18.12.6/packages/coding-agent/src/mcp/transports/sse.ts
- Fetched live: 2026-10-27 with `curl -fsSL -w 'HTTP_STATUS:%{http_code}'` → HTTP 200
- Bytes: 15183 (`wc -c`); lines: 446 (`wc -l`)
- sha256: `0b69229a69b01a372117d3d86833ec40e8f5118efe1049fdc4993ae1c677fbb0`
- Tag: `git ls-remote https://github.com/can1357/oh-my-pi.git "refs/tags/v18.12.6*"` → `45c35e40c46166dc726ccc52f5d27f40f2449f99	refs/tags/v18.12.6`
- Stability: byte-identical (`cmp` exit 0) to round-66 capture `.ufo/waves/round-66/build/L1/captures/omp-v18.12.6-sse.ts`
- Capture with fetched header: `build/K68ScoutS209/captures/sse-v18.12.6.ts` (15726 bytes incl. 6-line header; last 446 lines equal the live bytes)

## Row draft (11-cell schema of corpus/SOURCES.md `## Registry`)

| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |
|---|---|---|---|---|---|---|---|---|---|---|
| S209 | oh-my-pi v18.12.6 coding-agent legacy HTTP+SSE MCP transport (packages/coding-agent/src/mcp/transports/sse.ts) — https://raw.githubusercontent.com/can1357/oh-my-pi/v18.12.6/packages/coding-agent/src/mcp/transports/sse.ts | code | A | Legacy HTTP+SSE transport source as of tag v18.12.6: existence at the tag, transport class and handler symbols, endpoint-handshake timeout error | sse.ts L39 LegacySseConnectionTimeoutError, L47 LegacySseTransport implements MCPTransport, L96 connect handler, L416 close handler at tag v18.12.6 commit 45c35e40c46166dc726ccc52f5d27f40f2449f99 | The legacy HTTP+SSE transport existed at v18.12.6: class LegacySseTransport implements MCPTransport with connect and close handlers, and LegacySseConnectionTimeoutError names its endpoint-handshake timeout | mined | 2026-10-27 | 180d (2027-04-25) | corpus/knowledge/mcp-deprecation-registry.md |

No literal or escaped `|` in any cell. tier A scoped to existence-at-tag: the file ships at tag v18.12.6 and declares the transport symbols.

## Located quotes

See `build/K68ScoutS209/quotes.txt`; all 6 verified verbatim on their lines and <= 25 words by a node checker (exit 0). Headline symbols:

- `export class LegacySseTransport implements MCPTransport {` — sse.ts:47
- `export class LegacySseConnectionTimeoutError extends Error {` — sse.ts:39
- `async connect(signal?: AbortSignal): Promise<void> {` — sse.ts:96
- `async close(): Promise<void> {` — sse.ts:416

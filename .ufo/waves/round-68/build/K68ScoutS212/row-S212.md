# S212 candidate registry row — legacy HTTP+SSE transport source at oh-my-pi v18.13.1

Prepared by seat K68ScoutS212, kumitate round 68 w1. Keyed by URL (prepared id S212; L1 re-assigns ids by document).
Scope assigned by the seat spec: the legacy HTTP+SSE transport source at the CURRENT installed-release tag — evidence the code still ships at v18.13.1 (installed release measured `omp --version` → `omp/18.13.1` on 2026-10-27).

## Capture

- URL (verbatim): https://raw.githubusercontent.com/can1357/oh-my-pi/v18.13.1/packages/coding-agent/src/mcp/transports/sse.ts
- Fetched live: 2026-10-27 with `curl -fsSL --max-time 60 -o <out> -w 'HTTP_STATUS:%{http_code}'` → HTTP_STATUS:200
- Bytes: 15183 (`wc -c`); lines: 446 (`wc -l`)
- sha256: `0b69229a69b01a372117d3d86833ec40e8f5118efe1049fdc4993ae1c677fbb0`
- Tag: `git ls-remote https://github.com/can1357/oh-my-pi.git "refs/tags/v18.13.1*"` → `0838d2ab4407b74e870de07e1a6780a13c7d542c	refs/tags/v18.13.1` (single ref line; lightweight tag ref, no `^{}` peel line printed)
- Stability: byte-identical (`cmp` exit 0) to the raw bytes of the S209 v18.12.6 capture `build/K68ScoutS209/captures/sse-v18.12.6.ts` — the transport file did not change between the two release tags
- Capture with fetched header: `build/K68ScoutS212/captures/sse-v18.13.1.ts` (15757 bytes incl. 6-line header; last 446 lines equal the live bytes, `cmp` exit 0)

## Row draft (11-cell schema of corpus/SOURCES.md `## Registry`)

| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |
|---|---|---|---|---|---|---|---|---|---|---|
| S212 | oh-my-pi v18.13.1 coding-agent legacy HTTP+SSE MCP transport (packages/coding-agent/src/mcp/transports/sse.ts) — https://raw.githubusercontent.com/can1357/oh-my-pi/v18.13.1/packages/coding-agent/src/mcp/transports/sse.ts | code | A | Legacy HTTP+SSE transport source as of tag v18.13.1 (the installed release): existence at the tag, transport class and handler symbols, endpoint-handshake timeout error | sse.ts L39 LegacySseConnectionTimeoutError, L47 LegacySseTransport implements MCPTransport, L96 connect handler, L416 close handler at tag v18.13.1 commit 0838d2ab4407b74e870de07e1a6780a13c7d542c | The legacy HTTP+SSE transport still ships at v18.13.1, the installed release: class LegacySseTransport implements MCPTransport with connect and close handlers, LegacySseConnectionTimeoutError names its endpoint-handshake timeout, and the file is byte-identical to v18.12.6 | mined | 2026-10-27 | 180d (2027-04-25) | corpus/knowledge/mcp-deprecation-registry.md |

No literal or escaped `|` in any cell. tier A scoped to existence-at-tag: the file ships at tag v18.13.1 and declares the transport symbols.

## Located quotes

See `build/K68ScoutS212/quotes.txt`; all 6 verified verbatim on their lines (`sed -n '39p;41p;46p;47p;96p;416p'`) and <= 25 words. Headline symbols:

- `export class LegacySseTransport implements MCPTransport {` — sse.ts:47
- `export class LegacySseConnectionTimeoutError extends Error {` — sse.ts:39
- `async connect(signal?: AbortSignal): Promise<void> {` — sse.ts:96
- `async close(): Promise<void> {` — sse.ts:416

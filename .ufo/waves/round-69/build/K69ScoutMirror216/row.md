# S216 — SOURCES mirror row (K69ScoutMirror216, opened 2026-10-30)

Draft for `corpus/SOURCES.md` `## Registry` (11 cells, no `|` inside any cell).
Already landed at `corpus/SOURCES.md:168`; this draft is byte-equal to the landed row and
every cell was re-verified against a fresh live fetch on 2026-10-30.

## Row

| S216 | MCP upstream legacy transport compatibility — https://raw.githubusercontent.com/modelcontextprotocol/modelcontextprotocol/82d60be17d75e69b350c9fe77df2e8cac202ac11/docs/specification/2025-11-25/basic/transports.mdx | docs | A | commit-pinned upstream carrier for S211's transport compatibility text | Backwards Compatibility, commit 82d60be17d75e69b350c9fe77df2e8cac202ac11 | Legacy HTTP+SSE compatibility remains explicitly documented in the upstream revision source | mined | 2026-10-30 | 90d | corpus/knowledge/mcp-deprecation-registry.md |

## Cell provenance

- **id** `S216` — distinct from the mirrored row S211; used exactly once (registry `## Capture origin` bullet `- S211 — capture 2026-10-27 — mirror S216`, mcp-deprecation-registry.md:133; `grep -c 'mirror S216'` → 1).
- **source** — commit-pinned raw URL: 40-hex commit in the path (conforms to the frozen counter's PINNED_URL arm). Live 2026-10-30: HTTP 200, 15986 bytes, sha256 `a247fdbb3cc25c805ef43124db18d9b60a56669b3e65bd163dffb76f4129dfc0`; two fetches byte-identical; commit exists upstream (`.patch` endpoint 200, `Date: Fri, 30 Oct 2026 08:05:43 +0000`, 1 diff hunk).
- **kind** `docs`, **tier** `A` — specification prose page; the site-page row it mirrors (S211) is `spec`, the mirror is the upstream doc carrier (matches landed S215 convention).
- **scope** — mirrors S211's page `https://modelcontextprotocol.io/specification/2025-11-25/basic/transports.md`: live fetch today still hashes `ae9bb7be00604a66a8f70f439ef028eced174bce4a5cb0f6fc11bbeaa625afcc` at 16321 bytes = S211's round-68 pinned capture; § Backwards Compatibility policy text is identical modulo link targets and `-`/`*` list markers (normalized diff, 1302 vs 1302 bytes).
- **anchor** — § Backwards Compatibility, capture lines 282–318.
- **teaches** grounded by this quote, 18 words (≤ 25), capture lines 284–286, unique in the file ("maintain backwards compatibility" occurs once):

  > Clients and servers can maintain backwards compatibility with the deprecated [HTTP+SSE transport](/specification/2024-11-05/basic/transports#http-with-sse) (from protocol version 2024-11-05) as follows:

- **status** `mined`, **opened** `2026-10-30`, **recheck** `90d`, **used-by** `corpus/knowledge/mcp-deprecation-registry.md` (probe ENTRY_REL, deprec69-probe.mjs:68).
- Capture binding: `.ufo/pins/source-captures.json` S216 entry — path `.ufo/waves/round-69/build/L1Capture/mirrors/transports.mdx`, sha256 `a247fdbb…`, bytes 15986; that committed file is `cmp`-byte-identical to today's live fetch.

# S212 candidate row — MCP 2026-07-28 changelog (deprecation entries)

Prepared by seat K66ScoutChangelog, kumitate round 66 w1, opened 2026-10-27.
Keyed by URL (prepared lane id S212; ids are re-assigned by the L1 by document).

## Fetch record (access date 2026-10-27)

- URL: https://modelcontextprotocol.io/specification/2026-07-28/changelog.md
- Command: `curl -fsSL -o changelog.md -w '%{http_code}' <URL>` (headers saved first with `-D changelog.headers.txt -o /dev/null`)
- HTTP status: 200 (first probe and body fetch both 200; effective URL unchanged, no redirect)
- Content-Type: text/markdown; charset=utf-8 (raw markdown, `content-disposition: inline`, served via Mintlify `x-matched-path: /_mintlify/_markdown/...`)
- Last-Modified: Tue, 27 Oct 2026 06:29:30 GMT (fetch moment, Vercel-served; no strong revision marker)
- Byte size: 12229
- sha256: 280533e289ca1a638973b06f6f4d8a8aff735a3c3fe594ffb32696d63de530f6
- Capture: `changelog.md` beside this file (exact bytes).
- Live parity (M5-style): second fetch `curl -fsSL -A 'Mozilla/5.0 (kumitate-deprec66)' <URL>` at 2026-10-27 returned byte-identical sha256 280533e289ca1a638973b06f6f4d8a8aff735a3c3fe594ffb32696d63de530f6.
- Sibling note: registry row S010 already cites the HTML page `.../specification/2026-07-28/changelog` (no `.md`). This row is the distinct raw-markdown URL given in the seat assignment; it is a different document representation and serves different seats (deprecation entries vs. major-changes summary).

## Row draft (11 cells, no `|` in any cell)

```
| S212 | MCP specification Key Changes 2026-07-28 (markdown) — https://modelcontextprotocol.io/specification/2026-07-28/changelog.md | spec | A | MCP protocol revision 2026-07-28 deprecation entries (Roots/Sampling/Logging, HTTP+SSE reclassification) | § Deprecated items 1-4; revision 2026-07-28; fetched 2026-10-27 (HTTP 200, text/markdown, 12229 bytes, sha256 280533e289ca1a638973b06f6f4d8a8aff735a3c3fe594ffb32696d63de530f6) | 2026-07-28 changelog § Deprecated: Roots, Sampling, Logging deprecated (SEP-2577); HTTP+SSE transport and includeContext thisServer/allServers reclassified as Deprecated (SEP-2596); OAuth 2.0 DCR deprecated for Client ID Metadata Documents | mined | 2026-10-27 | 180d | corpus/knowledge/mcp-deprecation-registry.md |
```

- kind `spec`, tier `A` (primary spec text for the 2026-07-28 revision), status `mined`, opened `2026-10-27`, recheck `180d`, used-by the C2 entry.
- Splits into 13 `|`-fields under the frozen `cells()` parser (leading empty + 11 cells + trailing empty) — census NF=13 shape holds; enum cells match the frozen contract.
- Scope is the deprecation entries only; the same page's Major changes (stateless protocol, MRTR, tasks extension) are S010's ground.

## Located quotes (verbatim from the capture; line = changelog.md line)

M4 bullet shape is `- S212 — "<quote>"`; all are ≤25 words and verified against the frozen `norm()` (output below).

- S212 — "Deprecate the Roots, Sampling, and Logging features" (line 73)
- S212 — "These features remain fully functional during the deprecation window but new implementations should not add support for them." (lines 75-76)
- S212 — "Reclassify the HTTP+SSE transport (deprecated since protocol version `2025-03-26`) as Deprecated under the feature lifecycle policy" (lines 82-83)
- S212 — "New implementations should not adopt them." (line 71)
- S212 — "Deprecate the OAuth 2.0 Dynamic Client Registration Protocol" (line 93)
- S212 — "these values will be removed no later than the Sampling feature itself" (lines 90-91)
- S212 — "log to `stderr` (stdio) or use OpenTelemetry instead of Logging" (lines 79-80)

Note for the L1: the M4-required quotes containing `2027-07-28` and `Three months after` are NOT in this source (grep counts 0) — those clocks live on the deprecated.md registry page (the row whose URL matches `/specification/2026-07-28/deprecated`); do not expect them from S212.

## Deprecation-related changelog lines, verbatim (capture line numbers)

```
69:## Deprecated
70:
71:Features listed here remain part of the specification but are scheduled for removal under the [feature lifecycle and deprecation policy](https://modelcontextprotocol.io/community/feature-lifecycle.md). New implementations should not adopt them. The [deprecated features registry](https://modelcontextprotocol.io/specification/2026-07-28/deprecated.md) tracks every feature currently in the Deprecated state.
72:
73:1. Deprecate the Roots, Sampling, and Logging features
74:   ([SEP-2577](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2577)).
75:   These features remain fully functional during the deprecation window but new
76:   implementations should not add support for them. Suggested migrations: pass
77:   directories or files via tool parameters, resource URIs, or server
78:   configuration instead of Roots; integrate directly with LLM provider APIs
79:   instead of Sampling; log to `stderr` (stdio) or use OpenTelemetry instead of
80:   Logging.
81:
82:2. Reclassify the HTTP+SSE transport (deprecated since protocol version
83:   `2025-03-26`) as Deprecated under the feature lifecycle policy
84:   ([SEP-2596](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2596)).
85:   Migrate to [Streamable HTTP](https://modelcontextprotocol.io/specification/2026-07-28/basic/transports/streamable-http.md).
86:
87:3. Reclassify the `includeContext` values `"thisServer"` and `"allServers"`
88:   (soft-deprecated since protocol version `2025-11-25`) as Deprecated
89:   ([SEP-2596](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2596)).
90:   Omit the field or use `"none"`; these values will be removed no later than
91:   the Sampling feature itself.
92:
93:4. Deprecate the OAuth 2.0 Dynamic Client Registration Protocol
94:   ([RFC7591](https://datatracker.ietf.org/doc/html/rfc7591)) as a client registration
95:   mechanism in favor of
96:   [Client ID Metadata Documents](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization/client-registration.md#client-id-metadata-documents)
97:   ([PR #2858](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2858)).
98:   It remains available for backwards compatibility with authorization servers that do
99:   not support Client ID Metadata Documents.
```

Related (deprecation policy clock, same document): lines 107-111 (`## Governance and process updates` item 1) adopt the feature lifecycle and deprecation policy (Active/Deprecated/Removed, minimum twelve-month window, deprecated-features registry).

## norm() verification (frozen matcher replicated from deprec66-probe.mjs)

Script `/fast/scratch/hyaku/kumitate-r66/K66ScoutChangelog/norm-check.mjs` replicates `norm()` verbatim from the frozen counter and tests each quote: `norm(capture).includes(norm(quote))` plus the ≤25-word rule. Verbatim output:

```
Q1 words=7 norm-match=true <=25w=true PASS
Q2 words=18 norm-match=true <=25w=true PASS
Q3 words=16 norm-match=true <=25w=true PASS
Q4 words=6 norm-match=true <=25w=true PASS
Q5 words=8 norm-match=true <=25w=true PASS
Q6 words=12 norm-match=true <=25w=true PASS
Q7 words=10 norm-match=true <=25w=true PASS
ALL_QUOTES_PASS
```

One-liner equivalent used for the record:
`node -e 'const n=s=>s.toString("utf8").replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi," ").replace(/<[^>]+>/g," ").replace(/&nbsp;|&#160;/g," ").replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;|&#34;/g,"\"").replace(/&#39;|&#x27;|&apos;/g,"\x27").replace(/[\u2018\u2019]/g,"\x27").replace(/[\u201c\u201d]/g,"\"").replace(/[\u2013\u2014]/g,"-").replace(/\*\*|__|`/g,"").replace(/\s+/g," ").trim();const fs=require("fs");const t=n(fs.readFileSync(process.argv[1]));for(const q of process.argv.slice(2)){console.log(t.includes(n(q))?"PASS":"FAIL",q.slice(0,40))}' changelog.md '<quote>' ...`

## Hand-off facts for the L1 (source-captures.json binding)

- sourceId S212 (or reassigned id keyed to this URL); path to this capture once landed in the lane; bytes 12229; sha256 280533e289ca1a638973b06f6f4d8a8aff735a3c3fe594ffb32696d63de530f6.

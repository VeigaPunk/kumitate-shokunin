# S207 candidate row — MCP 2026-07-28 Deprecated Features registry page

Prepared lane id: **S207** (ids are re-assigned by the L1 by document — key everything by URL).
URL: https://modelcontextprotocol.io/specification/2026-07-28/deprecated.md

## Fetch metadata (capture: `deprecated.md` beside this file)

- Command: `curl -fsSL -w '\nHTTP_STATUS:%{http_code}\n' https://modelcontextprotocol.io/specification/2026-07-28/deprecated.md -o deprecated.md`
- HTTP status: **200** (curl exit 0)
- Access date: 2026-10-27
- Byte size: **3839**
- sha256: **c12c3cb7d6b8a30cd4df8ea8162a819df071a42745da6d20165e8fdf94b28baa**
- Encoding: ASCII text (file(1); very long lines 474 max)

## Row draft — corpus/SOURCES.md `## Registry` (11 cells; no literal or escaped `|` in any cell)

| S207 | Deprecated Features (MCP specification 2026-07-28) — https://modelcontextprotocol.io/specification/2026-07-28/deprecated.md | spec | A | MCP 2026-07-28 Deprecated Features registry: per-feature deprecation SEP, deprecated-in revision, migration path, earliest removal, and the empty Removed section | deprecated.md §§ Deprecated and Removed; revision 2026-07-28, fetched 2026-10-27 | Per-feature deprecation SEP, deprecated-in revision, migration path and earliest removal for the six deprecated MCP 2026-07-28 features; Removed section is empty | mined | 2026-10-27 | 180d | corpus/knowledge/mcp-deprecation-registry.md |

Cell check: 12 pipes (11 cells), kind `spec` ∈ enum, tier `A`, status `mined`, opened `2026-10-27`,
recheck `180d` (valid cadence), used-by = the C2 entry path, URL present in source cell, no `|` inside any cell.

## Located quotes (verbatim from the capture; word counts ≤ 25)

1. S207 — "No features have been removed under this policy yet." — capture line **39** (9 words). The Removed-section sentence.
2. S207 — "First revision released on or after 2027-07-28" — capture line **26** (7 words; `2027-07-28` quote). Also lines 27–29.
3. S207 — "Three months after SEP-2596 reaches Final" — capture line **31** (6 words; `Three months after` quote).
4. S207 — "A Deprecated feature remains part of the specification but is scheduled for removal" — capture lines **12–13** (13 words).
5. S207 — "This registry is a derived view kept consistent with the per-feature deprecation notices and changelog entries, which are the normative records." — capture lines **19–20** (21 words).

## `## Deprecated` table, reproduced clean (links stripped; 6 data rows)

| Feature | Deprecation SEP | Deprecated in | Migration path | Earliest removal |
|---|---|---|---|---|
| Roots | SEP-2577 | 2026-07-28 | Pass directories or files via tool parameters, resource URIs, or server configuration | First revision released on or after 2027-07-28 |
| Sampling | SEP-2577 | 2026-07-28 | Integrate directly with LLM provider APIs | First revision released on or after 2027-07-28 |
| Logging | SEP-2577 | 2026-07-28 | Log to `stderr` for stdio transports; use OpenTelemetry for observability | First revision released on or after 2027-07-28 |
| Dynamic Client Registration | PR #2858 | 2026-07-28 | Client ID Metadata Documents | First revision released on or after 2027-07-28 |
| `includeContext: "thisServer"` / `"allServers"` (Sampling) | SEP-2596 | 2025-11-25 | Omit the field or use `"none"` | Follows Sampling (SEP-2577) |
| HTTP+SSE transport | SEP-2596 | 2025-03-26 | Streamable HTTP | Three months after SEP-2596 reaches Final |

## `## Removed` section sentence (verbatim)

> No features have been removed under this policy yet. (capture line 39)

## M6 parse of the frozen counter on this capture

Replicated `norm`/`delink` and the M6 capture-row loop of
`.ufo/waves/round-66/probe/deprec66-probe.mjs` (lines 52–60, 182–191) verbatim in `m6.mjs` and ran it on the capture. Verbatim output:

```
Deprecated heading at line index 4 (1-based 5)
M6 capture-table data rows = 6
1: ["Roots","SEP-2577","2026-07-28","Pass directories or files via tool parameters, resource URIs, or server configuration","First revision released on or after 2027-07-28"]
2: ["Sampling","SEP-2577","2026-07-28","Integrate directly with LLM provider APIs","First revision released on or after 2027-07-28"]
3: ["Logging","SEP-2577","2026-07-28","Log to stderr for stdio transports; use OpenTelemetry for observability","First revision released on or after 2027-07-28"]
4: ["Dynamic Client Registration","PR #2858","2026-07-28","Client ID Metadata Documents","First revision released on or after 2027-07-28"]
5: ["includeContext: \"thisServer\" / \"allServers\" (Sampling)","SEP-2596","2025-11-25","Omit the field or use \"none\"","Follows Sampling (SEP-2577)"]
6: ["HTTP+SSE transport","SEP-2596","2025-03-26","Streamable HTTP","Three months after SEP-2596 reaches Final"]
```

Row count = **6** (M6 requires the entry snapshot to have exactly this many data rows, >= 5).

Note: the M6 heading regex `^#{1,3}\s+Deprecated\b` first matches the page H1 `# Deprecated Features`
(capture line 5), not the `## Deprecated` section (line 22); the count is unaffected because only
table rows between that point and `## Removed` are collected.

## Quote check against norm(capture) (node one-liner, the counter's exact norm)

Command shape: `node -e '<norm>; cap.includes(norm(q))' ` over the 5 quotes above. Verbatim output:

```
FOUND   words=ok(9)  "No features have been removed under this policy yet."
FOUND   words=ok(7)  "First revision released on or after 2027-07-28"
FOUND   words=ok(6)  "Three months after SEP-2596 reaches Final"
FOUND   words=ok(13)  "A Deprecated feature remains part of the specification but is scheduled for removal"
FOUND   words=ok(21)  "This registry is a derived view kept consistent with the per-feature deprecation notices and changelog entries, which are the normative records."
ALL_QUOTES_FOUND: true
```

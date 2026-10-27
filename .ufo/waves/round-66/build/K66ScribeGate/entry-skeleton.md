source: S207 — https://modelcontextprotocol.io/specification/2026-07-28/deprecated.md — § Deprecated, the six-row registry table and its Earliest removal column; § Removed
source: S208 — https://modelcontextprotocol.io/community/feature-lifecycle.md — § Deprecating a Feature item 4 (the minimum-window clause and its anchor); § The Deprecated Registry
source: S209 — https://raw.githubusercontent.com/can1357/oh-my-pi/v18.12.6/packages/coding-agent/src/mcp/transports/sse.ts — the legacy HTTP+SSE transport class the installed release still ships
source: S210 — https://modelcontextprotocol.io/seps/2596-spec-feature-lifecycle-and-deprecation.md — § Transition, the grace period and its two-row table; the metadata table (Status Final, Created)
verified-at: 2026-10-27
recheck: 180d — `curl -fsSL 'https://modelcontextprotocol.io/specification/2026-07-28/deprecated.md' | grep -c -F 'Three months after SEP-2596 reaches Final'` -> 1 (ran 2026-10-27)
coverage-map: frontier band "MCP protocol revisions as they bear on orchestration" (PROVINCE.md §Frontier)

# DRAFT SKELETON (seat K66ScribeGate) — the sections DEPREC66 counters M4/M6/M7 read

## Located quotes

- S207 — "A Deprecated feature remains part of the specification but is scheduled for removal"
- S207 — "First revision released on or after 2027-07-28"
- S207 — "Three months after SEP-2596 reaches Final"
- S208 — "The window is measured from the release of the specification revision in which the feature is first marked Deprecated"
- S208 — "the number of months, at least twelve, that the feature must remain Deprecated before it is eligible for removal"
- S209 — "Legacy MCP HTTP+SSE transport from protocol revision 2024-11-05"
- S209 — "Create and connect a legacy HTTP+SSE transport"
- S210 — "Each is therefore given a three-month grace period from the date this SEP reaches Final before it is eligible for removal"
- S210 — "Three months after this SEP is Final"

## Registry snapshot

| Feature | Deprecated in | Earliest removal |
| --- | --- | --- |
| Roots | 2026-07-28 | First revision released on or after 2027-07-28 |
| Sampling | 2026-07-28 | First revision released on or after 2027-07-28 |
| Logging | 2026-07-28 | First revision released on or after 2027-07-28 |
| Dynamic Client Registration | 2026-07-28 | First revision released on or after 2027-07-28 |
| includeContext: "thisServer" / "allServers" | 2025-11-25 | Follows Sampling (SEP-2577) |
| HTTP+SSE transport | 2025-03-26 | Three months after SEP-2596 reaches Final |

## Bearing on the installed OMP release

S202 documents that the installed client advertises the `roots` capability at initialize; the
registry lists Roots as Deprecated with an earliest removal of the first revision released on or
after 2027-07-28. S204 records the handshake, and S209 is the release's own HTTP+SSE transport
(the legacy 2024-11-05 transport), the one registry row whose clock is three months from SEP-2596's
Final date. S201 and S206 pin the revision constant and the header the Streamable HTTP transport
sends, so the release speaks two transports: the one it negotiates with, and the deprecated one it
still ships.

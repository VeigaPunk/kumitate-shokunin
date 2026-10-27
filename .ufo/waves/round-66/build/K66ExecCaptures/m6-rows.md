# K66ExecCaptures — M6 table parse of the S207 (deprecated.md) capture

Seat: K66ExecCaptures · round 66, wave w1 · capture access date 2026-10-27.

Reproduce (the parse replicates the `M6` block of the frozen counter
`.ufo/waves/round-66/probe/deprec66-probe.mjs`, lines 176-204, verbatim):

```
node /fast/scratch/hyaku/kumitate-r66/K66ExecCaptures/m6parse.mjs \
  /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-66/build/K66ExecCaptures/deprecated-2026-07-28.md
```

## Row count

**CAP_ROWS count = 6** (the counter's `capRows`; `>= 5` required by M6).

## Rows (counter-normalised cells: `norm(delink(cell))`)

| # | feature | Deprecated in | Earliest removal | migration path |
|---|---|---|---|---|
| 1 | Roots | 2026-07-28 | First revision released on or after 2027-07-28 | Pass directories or files via tool parameters, resource URIs, or server configuration |
| 2 | Sampling | 2026-07-28 | First revision released on or after 2027-07-28 | Integrate directly with LLM provider APIs |
| 3 | Logging | 2026-07-28 | First revision released on or after 2027-07-28 | Log to `stderr` for stdio transports; use [OpenTelemetry](https://opentelemetry.io/) for observability |
| 4 | Dynamic Client Registration | 2026-07-28 | First revision released on or after 2027-07-28 | [Client ID Metadata Documents](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization/client-registration.md#client-id-metadata-documents) |
| 5 | includeContext: "thisServer" / "allServers" (Sampling) | 2025-11-25 | Follows Sampling (SEP-2577) | Omit the field or use `"none"` |
| 6 | HTTP+SSE transport | 2025-03-26 | Three months after SEP-2596 reaches Final | [Streamable HTTP](https://modelcontextprotocol.io/specification/2026-07-28/basic/transports/streamable-http.md) |

Verbatim parser output (abridged to the four cells M6 joins on):

```
CAP_ROWS count = 6
---  feature  : "Roots"                          depIn : "2026-07-28"  removal : "First revision released on or after 2027-07-28"
---  feature  : "Sampling"                       depIn : "2026-07-28"  removal : "First revision released on or after 2027-07-28"
---  feature  : "Logging"                        depIn : "2026-07-28"  removal : "First revision released on or after 2027-07-28"
---  feature  : "Dynamic Client Registration"    depIn : "2026-07-28"  removal : "First revision released on or after 2027-07-28"
---  feature  : "includeContext: \"thisServer\" / \"allServers\" (Sampling)"  depIn : "2025-11-25"  removal : "Follows Sampling (SEP-2577)"
---  feature  : "HTTP+SSE transport"             depIn : "2025-03-26"  removal : "Three months after SEP-2596 reaches Final"
```

## What the entry's `## Registry snapshot` must therefore contain (M6)

M6 requires the snapshot table to have **exactly 6** data rows and to carry every captured
`Deprecated in` and `Earliest removal` cell. The six `Deprecated in` values are
`2026-07-28` (×4), `2025-11-25`, `2025-03-26`; the six `Earliest removal` values are the
strings in the table above. Note row 5: the captured removal cell is `Follows Sampling (SEP-2577)`
— a markdown link is delinked by the counter, so the snapshot cell must read `Follows Sampling (SEP-2577)`,
not `Follows Sampling ([SEP-2577](…))`.

**Caveat the gate cannot catch:** M6 joins the snapshot into one string and only asks that each captured
cell occur *somewhere* in it (`deprec66-probe.mjs:197-203`). A snapshot that swaps row 2's and row 6's
removal clauses still reads CLEAN. The pairing above is row-wise correct; a non-author must check it row-wise.

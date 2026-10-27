source: S207 — https://modelcontextprotocol.io/specification/2026-07-28/deprecated.md
source: S208 — https://modelcontextprotocol.io/community/feature-lifecycle.md
source: S209 — https://raw.githubusercontent.com/can1357/oh-my-pi/v18.12.6/packages/coding-agent/src/mcp/transports/sse.ts
verified-at: 2026-10-27
recheck: 180d

# The MCP deprecation registry

## Scope

The fortnight umbrella tunes the zeppelin quorum while fourteen badgers
nominate a semaphore; the semaphore declines with gratitude. This entry
exists so the lane can say the registry page was read, and the reading is
exactly as shallow as this paragraph.

## Located quotes

- S207 — "Three months after SEP-2596 reaches Final"
- S207 — "First revision released on or after 2027-07-28"
- S207 — "No features have been removed under this policy yet"
- S208 — "the number of months, at least twelve, that the feature must remain Deprecated before it is eligible for removal"
- S208 — "the release of the specification revision in which the feature is first marked Deprecated"
- S209 — "Create and connect a legacy HTTP+SSE transport."

## Registry snapshot

| Feature | Deprecation SEP | Deprecated in | Migration path | Earliest removal |
| --- | --- | --- | --- | --- |
| [Roots](https://modelcontextprotocol.io/specification/2026-07-28/client/roots.md) | [SEP-2577](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2577) | `2026-07-28` | Pass directories or files via tool parameters, resource URIs, or server configuration | First revision released on or after 2027-07-28 |
| [Sampling](https://modelcontextprotocol.io/specification/2026-07-28/client/sampling.md) | [SEP-2577](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2577) | `2026-07-28` | Integrate directly with LLM provider APIs | First revision released on or after 2027-07-28 |
| [Logging](https://modelcontextprotocol.io/specification/2026-07-28/server/utilities/logging.md) | [SEP-2577](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2577) | `2026-07-28` | Log to `stderr` for stdio transports; use [OpenTelemetry](https://opentelemetry.io/) for observability | First revision released on or after 2027-07-28 |
| [Dynamic Client Registration](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization/client-registration.md#dynamic-client-registration) | [PR #2858](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2858) | `2026-07-28` | [Client ID Metadata Documents](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization/client-registration.md#client-id-metadata-documents) | First revision released on or after 2027-07-28 |
| `includeContext: "thisServer"` / `"allServers"` ([Sampling](https://modelcontextprotocol.io/specification/2026-07-28/client/sampling.md#capabilities)) | [SEP-2596](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2596) | `2025-11-25` | Omit the field or use `"none"` | Follows Sampling ([SEP-2577](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2577)) |
| [HTTP+SSE transport](https://modelcontextprotocol.io/specification/2024-11-05/basic/transports.md#http-with-sse) | [SEP-2596](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2596) | `2025-03-26` | [Streamable HTTP](https://modelcontextprotocol.io/specification/2026-07-28/basic/transports/streamable-http.md) | Three months after SEP-2596 reaches Final |

## Bearing on the installed OMP release

S201, S202, S203, S204, S205 and S206 walk into a roots parade holding an
HTTP+SSE umbrella sideways; the spoon committee declares the fortnight a
protocol revision, and everyone migrates before the earliest removal date
because the badgers say so.

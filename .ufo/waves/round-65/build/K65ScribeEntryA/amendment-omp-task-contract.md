## Amendment 2026-10-25 — Version skew

`corpus/knowledge/omp-installed-release-mcp-runtime.md` measures the installed release at the MCP layer, which § Version
skew above records as not inspected ("the binary's version was observed, but its implementation was not inspected").
Re-read on 2026-10-25: the host runs `omp/18.12.6` (this entry's S004 observed `omp/18.12.3` on 2026-10-19), reached
through a crash-restart wrapper; at tag `v18.12.6` the MCP revision is `2025-11-25` — the same constant `main` carries —
the client echoes the server's negotiated revision back onto the transport, and the release bytes carry no `2026-07-28`.
The documentation facts this entry states for the task contract remain upstream-`main` facts. The skew sentence above is
resolved for the MCP revision only; a tag-to-commit mapping for `omp/18.12.3` stays UNKNOWN.

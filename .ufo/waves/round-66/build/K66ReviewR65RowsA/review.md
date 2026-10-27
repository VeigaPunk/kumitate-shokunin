# Round-65 source re-open: S201–S203

## Result
All three pinned captures match their registry pins and fresh live responses byte-for-byte. Every S201–S203 quote listed in `## Located quotes` is present in both its capture and live response. The rows' anchors and teaches descriptions are supported by those sources; no actionable defect found in this scope.

## Evidence

`grep -n "S201\\|S202\\|S203" corpus/SOURCES.md` (lane absolute path): rows at 153–155. Cells, summarized: S201 targets tag `v18.12.6` MCP types, revision sent/echoed and explicitly excludes the distinct Z.AI client; S202 targets documented connect/startup/tool-call lifecycle; S203 targets the commit body and changelog patch hunk about stale revision, failure, chosen revision, transport choke point and issue #8264.

Pin metadata (`.ufo/pins/source-captures.json`):
- S201 capture `.ufo/waves/round-65/build/Capture/omp-v18.12.6-mcp-types.ts`, sha256 `caa3eadeb21bc36d8c6a4bf65fd362b1b27d4c189ca40684b1e11075c48bfe0d`, 16167 bytes.
- S202 capture `.ufo/waves/round-65/build/Capture/omp-v18.12.6-mcp-runtime-lifecycle.md`, sha256 `362acea5d3d0eca06d54aa9a80febab5a43634007ab40a435dbb0c75079cf83d`, 22741 bytes.
- S203 capture `.ufo/waves/round-65/build/Capture/omp-commit-10bce690.patch`, sha256 `eedfbbc405d55fdb205b74a76a67f06a0a78fa9b383a06a491107a034e172c9b`, 9953 bytes.

Pinned-file `sha256sum` and `wc -c` matched each metadata value exactly. Fresh `curl -sS -w` responses: S201 HTTP 200, 16167 bytes; S202 HTTP 200, 22741 bytes; S203 HTTP 200, 9953 bytes. Live sha256 values in the same order: `caa3eadeb21bc36d8c6a4bf65fd362b1b27d4c189ca40684b1e11075c48bfe0d`, `362acea5d3d0eca06d54aa9a80febab5a43634007ab40a435dbb0c75079cf83d`, `eedfbbc405d55fdb205b74a76a67f06a0a78fa9b383a06a491107a034e172c9b` — all identical to pins.

Located quotes (`corpus/knowledge/omp-installed-release-mcp-runtime.md:237-248`), checked exactly as recorded:
- S201 (3): revision constant (capture/live line 181); “Latest MCP protocol revision this client negotiates.” (170–172); Streamable HTTP echo statement (173–175). All yes.
- S202 (4): initialize + roots (101); negotiated revision echo (106); timeout setting/250 ms (114); connection loss is non-retryable / never replayed (152). All yes.
- S203 (3): stale 2025-03-26 (7); bump to 2025-11-25 (9); “Fixes #8264” (11). All yes.

Anchor/teaches assessment: S201 anchor points at the definition/doc comment and its stated scope is accurately narrowed to coding-agent `src/mcp/`, while explicitly excluding `src/web/search/providers/zai.ts` (source comment at lines 170–181 supports the revision and HTTP echo). S202 anchors match headings and ranges; cited statements occur at the specified lines. S203's patch body explicitly states the old revision, generic internal error for `tools/call`, replacement revision, single `#fetch` choke point, GET/POST/DELETE, and issue closure (capture lines 7–11); changelog hunk is also present (lines 20–30). No overclaim detected in these row scopes.

## Findings
None.

## Limits
Reviewed only S201–S203, their cited quotes, and row anchor/teaches cells. No claims made about runtime behavior on the host or other rows.
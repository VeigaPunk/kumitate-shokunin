# Row S208 — draft for `corpus/SOURCES.md` `## Registry`

One 11-cell row (columns: id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by). Tier A per seat scope (primary policy page, canonical).

```
| S208 | MCP community docs — Feature Lifecycle and Deprecation Policy — https://modelcontextprotocol.io/community/feature-lifecycle.md | docs | A | the MCP feature-lifecycle policy adopted via SEP-2596: the three feature states (Active/Deprecated/Removed) with implementer expectations, the deprecation-SEP procedure, the minimum deprecation window (at least twelve months, measured from the release of the revision in which the feature is first marked Deprecated, not the SEP Final date), the deprecated registry's role, Tier 1 SDK obligations, removal mechanics, the ninety-day expedited floor, and the roles table; the literal "Three months after" grace wording is NOT on this page — it lives in the deprecated registry's HTTP+SSE row (S207) | § Feature States table; § Deprecating a Feature item 4 (the minimum-window clause and earliest-removal definition); § Expedited Removal (ninety-day floor); § Removing a Feature; § Roles table; fetched 2026-10-27, HTTP 200, text/markdown, 8794 bytes, sha256 3f3371911512591e61d80d8e1bf07ac6a93df4e930d1379d24b78034349e74ee, byte-identical to the round-66 wave capture | MCP features move Active → Deprecated → Removed; deprecation needs a SEP naming a minimum window of >= twelve months counted from the carrying release; removal is at Core Maintainers' discretion after the window and features may stay Deprecated far longer; expedited removal still guarantees >= ninety days; the registry page (S207) is the canonical per-feature timetable | mined | 2026-10-27 | on-release | corpus/knowledge/mcp-deprecation-registry.md |
```

## Support evidence for the L1's entry (`## Located quotes`, S208 bullets)

Located in `captures/feature-lifecycle.md` in this build dir (header + verbatim body;
programmatically verified present, single-line, <= 25 words each):

- `S208 — "A specification feature is in exactly one of three states:"` (line 36)
- `S208 — "The minimum deprecation window is counted from that release."` (line 102)
- `S208 — "Features may remain Deprecated, without removal, for much longer than the minimum deprecation window."` (line 140)

The normative minimum-window clause ("the number of months, at least twelve, that the feature
must remain Deprecated before it is eligible for removal") is wrap-split across capture lines
77–79 and is therefore NOT locatable as one substring for M4; the 9-word line-102 sentence above
states the same counting rule within one line.

## Misattribution flag for the L1

The `Three months after` quote the M4 predicate requires is NOT located in this row's capture —
it is located in the S207 registry capture (deprecated.md 2026-07-28, line 31, HTTP+SSE transport
row). See `quotes.txt` in this build dir for the located cross-evidence and the binding
recommendation: the `Three months after` bullet must carry the S207 id; any S208 bullet must be
one of the three listed above (or other Q-labeled quotes in `quotes.txt`).

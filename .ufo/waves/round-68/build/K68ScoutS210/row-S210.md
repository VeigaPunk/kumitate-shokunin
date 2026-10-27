# S210 — SEP-2596 page

| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |
|---|---|---|---|---|---|---|---|---|---|---|
| S210 | SEP-2596 PR #2596 — https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2596 | docs | B | SEP-2596 feature lifecycle policy; scope here is its reclassification of HTTP+SSE and Final-date mechanics | PR #2596 body + changed `seps/2596-spec-feature-lifecycle-and-deprecation.md` (§ Feature states, Deprecating a feature, Transition); timeline events; merged commit `219f82421ce13f6b0d9f786e603cf9a659fd5216` | Defines Active/Deprecated/Removed; standard deprecations require >=12 months measured from the Current revision release, not SEP Final; Transition gives pre-existing HTTP+SSE a three-month-from-Final earliest-removal date and reclassifies it under Deprecated | mined | 2026-10-27 | on-release | corpus/knowledge/mcp-deprecation-registry.md |

Tier B: this is a GitHub PR/community-class surface rather than the canonical published specification; community-class sources are never Tier A under SOURCES-CONTRACT-v1.

**Quote-live constraint:** the assigned PR URL serves the PR body/timeline but not its SEP diff text. `Three months after this SEP is Final` is in the changed file and rendered SEP page, not in a live fetch of the PR page. For M5, either use PR-body quotes from `quotes.txt` with this URL, or use `https://modelcontextprotocol.io/seps/2596-spec-feature-lifecycle-and-deprecation` / `https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2596.diff` as the row URL if the SEP-text quote must be live-fetchable. The capture includes all surfaces and identifies their URLs; don't represent SEP-text quotes as PR-page-live.

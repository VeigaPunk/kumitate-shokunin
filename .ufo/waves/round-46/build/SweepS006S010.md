RESULT SweepS006S010 rev=516977af verdict=clean rows=5 defects=0

Anti-loop re-open of SOURCES.md rows S006–S010 at 516977af2216b1cc426ee970d260dee53714bf4f.
Admission quotes taken from `git -C <lane> grep -n '<id>' <rev> -- corpus/lessons/` → corpus/lessons/round-34.md:100-104
(## Gate "Source rows opened this round") plus the full record .ufo/rounds/round-34/sources-gate.md:29-49.
Re-opening done 2026-10-23 from scratch /fast/scratch/hyaku/kumitate-r46/seats/w1-SweepS006S010/.
Match method: HTML tag-stripped, entities unescaped, whitespace collapsed; quote words compared verbatim.
Lane command rows extracted read-only via `git archive 16a5441 | tar -x`; commands run under
`systemd-run --user --scope -p MemoryMax=4G -p TasksMax=256 timeout -s KILL 900`.
No pinned body sha256 exists in any of the five rows (S006/S007 pin Last-Modified only), so the
sha256s below are recorded, not compared. No rejected rows in range. No tools installed (stock curl/node).

ROW S006 verdict=holds
  fetch: `curl -D - https://moonshotai.github.io/kimi-code/en/configuration/config-files.html` → HTTP 200,
  123276 bytes, body sha256 caf6a332d7ebc4f144ae774b92e755bde7d2076973d1d8fe8c1a3e1ff5030da0;
  Last-Modified Fri, 23 Oct 2026 08:04:12 GMT (row pins 2026-10-19 — live page edited since open; recheck on-release).
  quote check: lesson «A spawn resolves the subagent's model in this order: 1. An explicit model passed in the tool call»
  → today's bytes hold the sentence verbatim as an ordered list: "…resolves the subagent&#39;s model in this order:
  </p><ol><li>An explicit <code>model</code> passed in the tool call</li><li><code>default_model</code></li></ol>";
  the "1./2." are <ol> numbering (markup), every word verbatim. Wayback has no 2026-10-19 capture (CDX empty
  10-15→10-23; closest 2026-08-01) — live bytes suffice since the wording survives.
  teaches "explicit tool-call model first, then secondary_model.default_model" → same list plus the
  § Subagent model pool bytes: "[secondary_model] … offers subagents a pool of candidate models plus a
  default binding"; order and both items grounded at the locator.

ROW S007 verdict=holds
  fetch: `curl -L -D - 'https://learn.chatgpt.com/docs/developer-commands?surface=cli'` → HTTP 200,
  1091823 bytes, body sha256 db86d6a314fd51e9d4fb0c560ec1e7cf89eb7a4697e136f3976a4cf0d3790fff;
  Last-Modified Fri, 23 Oct 2026 07:47:18 GMT (row pins 2026-10-19 — page edited since open).
  quote check: «Manage Model Context Protocol server entries stored in ~/.codex/config.toml.» → verbatim hit
  in text at § codex mcp (trailing "." is markup-split, "…config.toml ." in normalized text).
  teaches "Codex stores MCP server entries in ~/.codex/config.toml, unlike Kimi mcp.json" → the Codex
  clause is the quote verbatim; the "unlike Kimi mcp.json" contrast is not in this row's locators but is
  verbatim-grounded in sibling row S005's own quote ("MCP server configuration is written in mcp.json,
  at two levels") — recorded here so the L1 can judge strictness; no fact asserted beyond the registry.

ROW S008 verdict=holds
  re-open: `node scripts/kimi-census.mjs` (tree at 16a5441, extracted via `git archive`, run under the
  MemoryMax=4G scope) → today's CENSUS error lines include, byte-verbatim, the gate-record quote:
  "CENSUS  error  UNLISTED  mcp.json  mcp.json sits at the root and is not declared by the frozen K1–K5 set"
  (census-now.txt:13; en-dash "K1–K5" confirmed in raw bytes via cat -A).
  lesson verdict-line quote "KIMI_CENSUS: DRIFT (UNLISTED skills/; UNLISTED mcp.json)" is a 2026-10-19
  record; today the same line reads "(UNLISTED skills/; UNLISTED locks; UNLISTED mcp.json)" — the extra
  `locks` term is a host change since open, not a misquote (locks/ is a new root member).
  teaches "UNLISTED mcp.json and 6 skills children against 5 declared" → today's line is "skills has
  7 children, 5 declared"; declared=5 identical, the recorded 6 is corroborated by S035 (the seventh
  counted-live child, opened 2026-10-22). Snapshot drift, format and declared set unchanged.

ROW S009 verdict=holds
  re-open: `node scripts/proxy-check.mjs` (tree at 16a5441, same scoped wrapper) → today line 4 reads
  "PROXY  error  K_MEMBERS_DRIFT  K_members: declared=49 computed=51 delta=+2"; the gate-record quote
  (stdout line 1, 2026-10-19) is "…declared=49 computed=50 delta=+1" — same format and same declared=49;
  the +1 on computed is the same skills-child drift as S008 (computed = declared + undeclared skills
  children: 49+1 at open, 49+2 today). Line order moved (S_MEMBERS_DRIFT now prints first) — host drift.
  teaches "K_members declared 49 vs computed 50 and coverage_kimi 10 vs 9" → declared 49 ✓ and
  "coverage_kimi: declared=10 computed=9 delta=-1" reproduces byte-exact today; "computed 50" is the
  open-day value, consistent with the drift arithmetic above.

ROW S010 verdict=holds
  fetch: `curl -L -D - https://modelcontextprotocol.io/specification/2026-07-28/changelog` → HTTP 200,
  327368 bytes, body sha256 8ac3f2f0d828364bb5a3a84e1d4888c47cecaba3364295d807af3f0219aa92db;
  no Last-Modified header (etag W/"103ezc8nn0570jz" only); row pins revision 2026-07-28.
  quote check: «Remove protocol-level sessions and the Mcp-Session-Id header from the Streamable HTTP
  transport.» → verbatim first bullet of § Major changes.
  teaches "MCP goes stateless: sessions and Mcp-Session-Id removed; server/discover; MRTR; tasks as
  extension" → all four inside § Major changes (Major→Minor heads at text offsets 1009/4399): bullet 2
  "Make MCP stateless: remove the initialize/notifications/initialized handshake"; "Add server/discover:
  servers MUST implement this RPC"; "Multi Round-Trip Requests (MRTR) pattern introduced"; "Move
  experimental tasks … into an official extension (io.modelcontextprotocol/tasks)". Nothing beyond locators.

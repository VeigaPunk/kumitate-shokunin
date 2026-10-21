ATTACK S022 verdict=partial defects=2

Target: corpus/SOURCES.md:35 (S022, Kimi Code CLI Docs: Slash Commands), its contract
v1 conformance, the round-35 Gate quote, and kimi-mcp-plane.md's use of it.
Axes: coverage. All fetches 2026-10-20 (local), direct HTTPS, read-only; no installs.

VERIFIED HOLDS (re-opened against the live source)
- Page re-fetched. `.html` HTTP 200 (49129 B) and `.md` twin HTTP 200 (13438 B),
  both `last-modified: Mon, 19 Oct 2026 10:22:06 GMT` and etag prefix `6ad5ef4e` —
  same build that predated the 2026-10-20 row fetch, so the scribe saw this revision.
  Command: `curl -sS -D - -o /dev/null https://moonshotai.github.io/kimi-code/en/reference/slash-commands.html`.
- Gate quote (corpus/lessons/round-35.md:52) «Configure MCP servers and handle MCP
  OAuth login.» — VERBATIM, 8 words (≤25), located § Built-in skill commands,
  `/mcp-config` row. `.md` twin line 136: `| /mcp-config | Configure MCP servers and
  handle MCP OAuth login. See [MCP](../customization/mcp.md) |`; same text present in
  the canonical `.html` body (`grep -o '.{0,120}OAuth login.{0,60}'`).
- teaches clause 1: `.md` twin line 119, § Information & Status (line 111):
  `/mcp | — | List MCP servers and their connection status in the current session | Yes`
  → "lists server connection status and is always available" holds; also confirmed
  verbatim inside the canonical `.html`.
- teaches clause 2 ("idle-only built-in skill"): grounded on the same page —
  `.md` twin line 131 `## Built-in skill commands` ("built-in Skills … appear directly
  as `/<name>`") and line 143 "All built-in Skill commands are only available in the
  idle state." No claim beyond the page.
- kimi-mcp-plane.md cites S022 at lines 1, 105, 115; its round-35 section attributes
  only the command surface to S022, marks it "documentation facts, not probed against
  the 2.2.0 binary", and its «Configure[s] … handle[s]» bracketing is honest inflection
  editing of verbatim base words. K1's file-location/shape claims stay on S005 —
  matches the scribe's scope limit (ScribeSrcKimiMcpCli.md "C3 must cite S005").
- Cells vs contract enums: id S022 next-unused; kind=docs ✓; tier=A (official docs,
  scoped) ✓; anchor names exact sections; status=mined justified (used-by file cites
  it); opened 2026-10-20 = scribe access date; recheck=on-release valid cadence;
  11 columns, no `|` in cells. Contract census (CORPUS.md §Census): rows=28,
  malformed=0, no duplicate ids, tiers A=27 B=1, status queued=14 mined=12 rejected=2,
  no missing used-by paths.
- Gate re-run: `node scripts/sources-check.mjs` → exit=0,
  `SOURCES_CHECK: CLEAN (rows=28 tiers=A:27,B:1,C:0 status=queued:14,mined:12,rejected:2 entries_with_source=2 legacy=38)`
  — matches the round-end claim.
- Append-only: `git -C <lane> diff master -- corpus/SOURCES.md` shows S021–S028
  appended after S020; all 13 deleted lines are Leads/search-log text; zero registry
  rows modified. Lesson's "Rows touched old→new: none" holds.
- Scribe draft (ScribeSrcKimiMcpCli.md) matches the landed row; its queued→mined flip
  condition (knowledge entry cites the row) was satisfied before landing as mined.

DEFECT 1 (minor) — anchor revision note falsified by the live server
- Where: corpus/SOURCES.md:35, anchor cell: "fetched 2026-10-20, no Last-Modified header".
- Command: `curl -sS -D - -o /dev/null https://moonshotai.github.io/kimi-code/en/reference/slash-commands.html`
  Output: `last-modified: Mon, 19 Oct 2026 10:22:06 GMT` (identical on the `.md` twin).
- The 2026-10-19 build predates the 2026-10-20 fetch, so the header should have been
  present then too; the recorded "no Last-Modified header" is an observation error
  (likely a fetch path that did not surface response headers) [INFERENCE on cause;
  the cell-vs-live contradiction itself is observed]. It also breaks the lane's own
  convention — S005/S006/S007 (SOURCES.md:18-20) record "fetched 2026-10-19
  (Last-Modified 2026-10-19)". Impact: weakens the row's revision signal for its
  `on-release` recheck; no content drift occurred (same build).
- Minimal fix (contract rule 2: anchor is not in the mutable {status, recheck,
  used-by} set): admit a superseding row whose teaches opens "supersedes S022 —",
  identical teaches with anchor revision "fetched 2026-10-20 (Last-Modified
  2026-10-19 10:22:06 GMT)", and log old→new in the round-36 lesson.

DEFECT 2 (minor) — used-by omits the round-35 lesson that cites the row
- Where: corpus/SOURCES.md:35, used-by cell = `corpus/knowledge/kimi-mcp-plane.md` only.
- Evidence: corpus/lessons/round-35.md:41 "C3 … rests on S005 and S022" and :52 (Gate
  record). Contract v1: "used-by — repo-relative paths of the knowledge entries or
  lessons citing the row". Same-round precedent S023 (SOURCES.md:36) lists exactly
  `corpus/lessons/round-35.md`; older precedent S008/S009 (SOURCES.md:21-22) list
  lessons. The gate cannot catch this: `USED_BY_ASYMMETRY` (scripts/sources-check.mjs:30)
  only reconciles knowledge-entry `source:` headers, not lesson body citations, so
  `SOURCES_CHECK: CLEAN` masks it.
- Minimal fix (allowed in place under rule 2): append `, corpus/lessons/round-35.md`
  to S022's used-by and log old→new in the next round lesson.
- Adjacent, out of my target (same pattern): S005 (SOURCES.md:18) and S021
  (SOURCES.md:34) are "rests on" citations of C3/C2 and also omit the lesson.

RESIDUAL RISK / GAPS
- The 2026-10-20 response headers are unobservable; Defect 1's cause is inferred, its
  present-day falsity is not.
- Verified the two quoted row texts inside the canonical `.html`; did not byte-diff
  `.html` against the `.md` twin beyond those sites (same build/etag prefix).
- proxy/kimi/census gates re-runs belong to other falsify items; not attempted here.

CONCLUSION: S022's substance survives — page re-opened, both facts and the 8-word
quote verbatim at the recorded locations, knowledge doc within scope, registry
bookkeeping clean and gate CLEAN. The two cell-level defects (stale anchor revision
note, under-listed used-by) are real but minor; verdict=partial with 2 defects.

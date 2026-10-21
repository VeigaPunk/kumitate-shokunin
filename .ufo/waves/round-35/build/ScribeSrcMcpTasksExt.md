SOURCE_ROW status=queued tier=A quote_words=22

# ScribeSrcMcpTasksExt — round 35 build, frontier step (corpus/SOURCES.md)

Scope: one drafted registry row for the queued lead "MCP tasks extension spec (io.modelcontextprotocol/tasks)". The registry was not edited. Lane: kumitate-shokunin, frontier band "MCP protocol revisions as they bear on orchestration" (PROVINCE.md §Frontier). Leaf seat; no subagents, no builds, no mutation outside this report.

## Drafted row (id is the S0NN placeholder; next unused id in corpus/SOURCES.md is S021)

| S0NN | MCP Tasks extension — ext-tasks repo, https://github.com/modelcontextprotocol/ext-tasks | spec | A | MCP Tasks extension identity and stable schema (io.modelcontextprotocol/tasks) | README § Why Tasks? and § Schemas (schema 2026-07-28 Stable); fetched 2026-10-20; design record SEP-2663 PR #2663 body § Abstract | Official tasks extension id io.modelcontextprotocol/tasks based on SEP-2663; stable schema 2026-07-28; server-directed tasks replace blocking tasks/result with tasks/get and tasks/update | queued | 2026-10-20 | on-release | — |

Tier A is scoped to this row: the extension's identity and schema revision as published by the MCP organisation's own repository. The row does not claim tier A for the community-written parts of SEP-2663 (review thread below); the PR body is cited only for its abstract.

## Access record

- Opened: 2026-10-20 (ISO). Access: `read` tool, three fetches.
  1. https://modelcontextprotocol.io/llms.txt (index; locates the Tasks page at /extensions/tasks/overview.md and the extension index at /extensions/overview.md)
  2. https://modelcontextprotocol.io/extensions/overview.md (Official Extension Repositories, § MCP Tasks)
  3. https://github.com/modelcontextprotocol/ext-tasks (repo README, fetched via GitHub API)
  4. https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2663 (SEP-2663 body and comments, fetched via GitHub API)
  5. https://modelcontextprotocol.io/extensions/tasks/overview.md (docs page; read for lifecycle facts, not cited in the row's teaches)
- Link correction vs. the lead: the 2026-07-28 changelog does NOT link to an io.modelcontextprotocol/tasks page. Its Major changes item 6 ("Move experimental tasks out of the core protocol and into an official extension (`io.modelcontextprotocol/tasks`)") links only to SEP-2663 (github.com/modelcontextprotocol/modelcontextprotocol/pull/2663). The extension page was reached from the llms.txt index and the extensions overview, not from the changelog.

## Quote (≤25 words, verbatim, with location)

> "The Tasks extension lets a receiver return a durable task handle so the requester can follow progress and retrieve the result later."

Location: ext-tasks repo, README.md, section `## Why Tasks?`, second paragraph (after the `**Extension Identifier:** io.modelcontextprotocol/tasks` line). Word count: `printf '%s' "<quote>" | wc -w` → 22.

Second locating line, for the identifier (same README, `# MCP Tasks Extension` opening paragraph): "This repository contains the official Model Context Protocol Tasks extension (`io.modelcontextprotocol/tasks`), based on SEP-2663." Not counted toward quote_words; cited as anchor evidence only.

## Why this row, and what it does not teach yet

- Not a duplicate of S010. S010 (changelog, queued) states "tasks as extension" in one phrase; this row names the extension identifier and its schema revision from the extension's own repository.
- Lifecycle facts from the docs page (statuses working/input_required/completed/failed/cancelled; CreateTaskResult with resultType "task"; tasks/get polling; tasks/update for mid-flight input; cooperative tasks/cancel) are real and relevant to orchestration, but they were read from the docs page and SEP-2663 and are NOT in the row's teaches. Admitting them needs a second opened anchor (the ext-tasks spec text under packages/ext-tasks or schema/2026-07-28/spec.types.ts) at the round that mines them. Leave for the mining step.
- Field names are unstable across the PR thread. SEP-2663 review comments (2026-04-29, by the author) renamed `ttl` to `ttlSeconds` and `pollInterval` to `pollIntervalMilliseconds`. Those names were NOT verified against the published 2026-07-28 schema.json in this round; do not cite them without opening schema/2026-07-28/schema.json.

## Discrepancies found (for the mining step, not for this row)

1. Changelog → PR link, not extension page (see Access record). Any future knowledge entry must cite the extension repo or the docs page, not "the changelog links the extension".
2. The docs page (extensions/tasks/overview.md) says the spec lives in ext-tasks; the README says it is "based on SEP-2663". The stable schema is pinned in-tree as schema/2026-07-28 (README § Schemas). Draft lives at schema/draft and is "Development"; never cite draft as stable.
3. Maintainer comments in SEP-2663 flagged schema regressions (CallToolRequestParams losing RequestParams base; ServerRequest still listing GetTaskRequest/CancelTaskRequest after client-hosted tasks were removed). Author said these would be handled in the schema changes; unverified here.

## Commands and outputs (observed)

- `printf '%s' "The Tasks extension lets a receiver return a durable task handle so the requester can follow progress and retrieve the result later." | wc -w` → `22`
- `ls -la .ufo/waves/round-35/build/` → directory existed; contained `swarm-registry.json` (30724 bytes). No prior ScribeSrcMcpTasksExt.md existed; this report created it.
- `grep -c '' corpus/SOURCES.md` → `118` lines (registry read via the `read` tool: 20 rows S001–S020; S020 rejected). Next unused id S021.
- `date -I` → `2026-10-20`.

## Gate checks the registry census would run (not executed — registry not edited)

- Column count: row has 11 cells; `|` appears only as column delimiters (checked by eye; no `|` inside `teaches`, `anchor`, or `source`).
- Enums: kind `spec` ∈ enum; tier `A` ∈ {A,B,C}; status `queued` ∈ {queued,mined,rejected}; recheck `on-release` ∈ allowed forms; used-by `—` allowed.
- Tier inflation: kind is not `community`; tier A is not inflated.
- `id` placeholder must be replaced by the registrar with S021 at admission (contract: next unused, never reused). Regex `S[0-9]{3,}` would not match `S0NN` until replaced.

## Tooling

No tools installed or updated. No pacman transactions (host-wide guard). Fetches used the built-in `read` tool.

## Out of scope / not touched

- Registry `corpus/SOURCES.md` not edited. Lane repo git/jj state not touched. No knowledge entry written. No other rows opened.
- Frontier leads remaining (SOURCES.md §Leads) not opened: MRTR pattern page, feature-lifecycle policy, ext-tasks spec text.

## Findings (summary)

- Row drafted, status queued, tier A, kind spec, quote 22 words, verbatim, located at ext-tasks README § Why Tasks?.
- Changelog link is to SEP-2663, not to the extension page; lead text corrected here.
- Lifecycle and field-name details are deliberately excluded from the row until the spec text is opened.

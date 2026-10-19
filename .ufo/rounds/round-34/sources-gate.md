# Round 34 — SOURCES gate record

Contract: `fleet-ledger/.ufo/waves/kaika/SOURCES-CONTRACT-v1.md` rule 1. Every row
below was opened or run on 2026-10-19; each quote is verbatim from the location
named and is ≤25 words. Fetches used `curl -fsSL`; no fetch failed.

## Opened sources

**S001** — https://github.com/can1357/oh-my-pi/blob/main/docs/tools/task.md
(2026-10-19; main `81fa40e`). Quote, § Limits & Caps: “Idle TTL: `task.agentIdleTtlMs`,
default `420_000` ms (7 min); `<= 0` disables parking and keeps idle sessions live
until exit.”

**S002** — https://github.com/can1357/oh-my-pi/blob/main/docs/agent-hub.md
(2026-10-19; main `81fa40e`). Quote, § Related surfaces: “Messaging a parked or
killed subagent revives it.”

**S003** — https://github.com/can1357/oh-my-pi/blob/main/docs/task-agent-discovery.md
(2026-10-19; main `81fa40e`). Quote, § Merge and collision rules: “Discovery uses
first-wins dedup by exact `agent.name`:”.

**S004** — `omp --version` on this host (2026-10-19). Quote, stdout line 1:
“omp/18.12.3”.

**S005** — https://moonshotai.github.io/kimi-code/en/customization/mcp.html
(2026-10-19; Last-Modified 2026-10-19). Quote, § Configuration: “MCP server
configuration is written in `mcp.json`, at two levels:”.

**S006** — https://moonshotai.github.io/kimi-code/en/configuration/config-files.html
(2026-10-19; Last-Modified 2026-10-19). Quote, § Subagent model pool: “A spawn
resolves the subagent's model in this order: 1. An explicit `model` passed in the
tool call 2. `default_model`”.

**S007** — https://learn.chatgpt.com/docs/developer-commands?surface=cli
(2026-10-19; Last-Modified 2026-10-19). Quote, § codex mcp: “Manage Model Context
Protocol server entries stored in ~/.codex/config.toml.”

**S008** — `node scripts/kimi-census.mjs` in the lane worktree, base `16a5441`
(2026-10-19). Quote, CENSUS error line: “CENSUS  error  UNLISTED  mcp.json  mcp.json
sits at the root and is not declared by the frozen K1–K5 set”.

**S009** — `node scripts/proxy-check.mjs` in the lane worktree, base `16a5441`
(2026-10-19). Quote, stdout line 1: “PROXY  error  K_MEMBERS_DRIFT  K_members:
declared=49 computed=50 delta=+1”.

**S010** — https://modelcontextprotocol.io/specification/2026-07-28/changelog
(2026-10-19; revision 2026-07-28). Quote, § Major changes, first bullet: “Remove
protocol-level sessions and the Mcp-Session-Id header from the Streamable HTTP
transport.”

**S011** — https://modelcontextprotocol.io/specification/2025-11-25/changelog
(2026-10-19; revision 2025-11-25). Quote, § Major changes, tasks bullet: “Add
experimental support for tasks to enable tracking durable requests with polling and
deferred result retrieval (SEP-1686).”

**S012** — https://moonshotai.github.io/kimi-code/en/customization/agents.html
(2026-10-19). Quote, § Agent Locations: “more specific scopes take higher priority:
Explicit (--agent-file) > Project > Extra > User > Plugin > Built-in.”

**S013** — https://moonshotai.github.io/kimi-code/en/guides/tower.html
(2026-10-19). Quote, § Safety and resource cost: “Worktrees isolate writes, but they
are not a security sandbox.”

**S014** — https://git-scm.com/docs/git-worktree/2.54.0 (2026-10-19; 2.54.0 — the
2.55.0 path redirects here, while the host runs `git version 2.55.0`). Quote,
§ BUGS: “Multiple checkout in general is still experimental, and the support for
submodules is incomplete.”

**S015** — https://www.anthropic.com/engineering/multi-agent-research-system
(2026-10-19; published 2025-06-13). Quote, § Benefits of a multi-agent system:
“agents typically use about 4× more tokens than chat interactions, and multi-agent
systems use about 15× more tokens than chats.”

**S016** — https://cognition.com/blog/dont-build-multi-agents (2026-10-19;
published 2025-06-12). Quote, Principle 1: “Share context, and share full agent
traces, not just individual messages”.

**S017** — https://docs.temporal.io/activity-definition (2026-10-19; Last-Modified
2026-10-19). Quote, § Idempotency: “You can use a combination of the Workflow Run ID
and the Activity ID as an idempotency key”.

**S018** — https://arxiv.org/abs/2503.13657 (2026-10-19; arXiv:2503.13657v3).
Quote, § Abstract: “This process identifies 14 unique modes, clustered into 3
categories”.

**S019** — https://modelcontextprotocol.io/docs/2026-07-28/tutorials/security/security_best_practices
(2026-10-19; revision 2026-07-28). Quote, § Attacks and Mitigations, Confused Deputy
Problem: “MCP proxy server uses a static client ID with a third-party authorization
server”.

**S020** — https://docs.langchain.com/oss/python/langgraph/persistence (2026-10-19;
the old durable-execution URL redirects here). Quote, § Checkpointer vs. store:
“Checkpointers persist a thread’s graph state as checkpoints.”

## Rejections recorded

- **S019** rejected on domain: OAuth proxy, token passthrough, and session hijacking
  are security-province material (kasegi/kagi). Flip: an orchestration-only clause
  that binds dispatch or queue behaviour.
- **S020** rejected on locator drift: the durable-execution locator now redirects to
  this overview, which has no `exit`/`async`/`sync` durability text. Flip: the page
  regains the durability semantics.

## Counting commands (run from the lane root, 2026-10-19)

Rows: `grep -cE '^\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|' corpus/SOURCES.md`.
Tier histogram: `awk -F'|' '/^\|[[:space:]]*S[0-9][0-9][0-9]+[[:space:]]*\|/ {t=$5;
gsub(/[[:space:]]/,"",t); n[t]++} END{for(k in n) printf "%s=%d ", k, n[k]; print
""}' corpus/SOURCES.md`.
Status histogram: same with `s=$9`.

## Post-review gate correction (2026-10-19)

The sources checker now scans `S###` rows only while under `## Registry` and
reports E12-equivalent `ROW_OUTSIDE_REGISTRY` findings elsewhere. Empty
required registry cells, rejected rows missing either `REJECTED:` or `flip:`,
and headerless non-base knowledge files are errors. The no-header exception is
the immutable 38-path identity list from base `16a5441`; those legacy notes
remain counted, but appended material inside one is not a new sourced entry.
Post-review behavior fixtures are in `scripts/sources-check.mjs --selftest`.

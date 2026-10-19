# SOURCES — where kumitate learns

The lane's curated reading list: what each place teaches, how far to trust it for
which scope, and when to look again. `corpus/knowledge/` holds admitted facts;
this file holds where they come from. Tier semantics are the frozen fleet contract's
(SOURCES-CONTRACT-v1.md), scoped per row; `corpus/QUALITY.md` points here for them.
Rules: a row is a claim written only after opening the source; append-only except
`status`, `recheck`, `used-by`; a rejection is kept as evidence of taste.

## Registry

| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |
|---|---|---|---|---|---|---|---|---|---|---|
| S001 | oh-my-pi docs/tools/task.md — https://github.com/can1357/oh-my-pi/blob/main/docs/tools/task.md | docs | A | OMP task tool contract on main: batch shape, caps, isolation | docs/tools/task.md § Limits & Caps; can1357/oh-my-pi main 81fa40e (2026-10-19) | OMP task contract: batch shape, solutionSpace, speculative launch, semaphore 32, idle TTL 420000 ms, depth 2, isolation PAL | mined | 2026-10-19 | on-release | corpus/knowledge/omp-task-contract.md |
| S002 | oh-my-pi docs/agent-hub.md — https://github.com/can1357/oh-my-pi/blob/main/docs/agent-hub.md | docs | A | Agent Hub roster and revival semantics on main | docs/agent-hub.md § Roster and inspector; main 81fa40e (2026-10-19) | Agent Hub statuses running/idle/parked/aborted and revive-on-message semantics for parked or killed agents | mined | 2026-10-19 | on-release | corpus/knowledge/omp-task-contract.md |
| S003 | oh-my-pi docs/task-agent-discovery.md — https://github.com/can1357/oh-my-pi/blob/main/docs/task-agent-discovery.md | docs | A | OMP task-agent discovery precedence on main | docs/task-agent-discovery.md § Merge and collision rules; main 81fa40e (2026-10-19) | Task-agent discovery precedence, first-wins by exact name, and recursive filesystem roots | mined | 2026-10-19 | on-release | corpus/knowledge/omp-task-contract.md |
| S004 | omp --version on this host — stdout omp/18.12.3 | tool | A | Installed OMP harness version on this host | stdout line 1; host omp/18.12.3 (2026-10-19) | Installed harness version omp/18.12.3 for version-skew checks against upstream main docs | mined | 2026-10-19 | on-release | corpus/knowledge/omp-task-contract.md |
| S005 | Kimi Code CLI Docs: Model Context Protocol — https://moonshotai.github.io/kimi-code/en/customization/mcp.html | docs | A | Kimi Code MCP client configuration and trust gating | § Configuration; fetched 2026-10-19 (Last-Modified 2026-10-19) | Kimi reads MCP servers from mcp.json at user and project levels, project wins; headless trust gating | mined | 2026-10-19 | on-release | corpus/knowledge/kimi-mcp-plane.md |
| S006 | Kimi Code CLI Docs: Configuration files — https://moonshotai.github.io/kimi-code/en/configuration/config-files.html | docs | A | Kimi Code config.toml subagent model resolution and MCP timeouts | § Subagent model pool; fetched 2026-10-19 (Last-Modified 2026-10-19) | Kimi subagent model resolution: explicit tool-call model first, then secondary_model.default_model | mined | 2026-10-19 | on-release | corpus/knowledge/kimi-mcp-plane.md |
| S007 | Codex CLI Developer commands — https://learn.chatgpt.com/docs/developer-commands?surface=cli | docs | A | Codex CLI MCP config location and developer commands | § codex mcp; fetched 2026-10-19 (Last-Modified 2026-10-19) | Codex stores MCP server entries in ~/.codex/config.toml, unlike Kimi mcp.json | mined | 2026-10-19 | 90d | corpus/knowledge/kimi-mcp-plane.md |
| S008 | node scripts/kimi-census.mjs — lane command | own-work | A | Kimi substrate member census output at HEAD | stdout CENSUS error lines; branch kaika/round base 16a5441, run 2026-10-19 | Kimi census reports UNLISTED mcp.json and 6 skills children against 5 declared | mined | 2026-10-19 | 30d | corpus/knowledge/kimi-mcp-plane.md, corpus/lessons/round-34.md |
| S009 | node scripts/proxy-check.mjs — lane command | own-work | A | kumitate proxy drift on this worktree at HEAD | stdout line 1; branch kaika/round base 16a5441, run 2026-10-19 | Proxy gate reports K_members declared 49 vs computed 50 and coverage_kimi 10 vs 9 | mined | 2026-10-19 | 30d | corpus/lessons/round-34.md |
| S010 | MCP specification Key Changes 2026-07-28 — https://modelcontextprotocol.io/specification/2026-07-28/changelog | spec | A | MCP protocol revision 2026-07-28 | § Major changes, first bullet; revision 2026-07-28 | MCP goes stateless: sessions and Mcp-Session-Id removed; server/discover; MRTR; tasks as extension | queued | 2026-10-19 | on-release | — |
| S011 | MCP specification Key Changes 2025-11-25 — https://modelcontextprotocol.io/specification/2025-11-25/changelog | spec | A | MCP protocol revision 2025-11-25 | § Major changes, tasks bullet; revision 2025-11-25 | Prior MCP revision introduced experimental tasks with polling and deferred results (SEP-1686) | queued | 2026-10-19 | 365d | — |
| S012 | Kimi Code CLI Docs: Agents and Sub-Agents — https://moonshotai.github.io/kimi-code/en/customization/agents.html | docs | A | Kimi Code sub-agent discovery and frontmatter format | § Agent Locations and § Agent File Format; fetched 2026-10-19 | Kimi agent scopes rank Explicit > Project > Extra > User > Plugin > Built-in; recursive .md scan; unknown fields ignored | queued | 2026-10-19 | on-release | — |
| S013 | Kimi Code CLI Docs: Tower multi-agent collaboration — https://moonshotai.github.io/kimi-code/en/guides/tower.html | docs | A | Kimi Tower coordination, merge gating, and safety | § Safety and resource cost; fetched 2026-10-19 | Kimi Tower: one coordinator per workspace, worktree per mission, independent review merge gate, not a security sandbox | queued | 2026-10-19 | on-release | — |
| S014 | git-worktree documentation — https://git-scm.com/docs/git-worktree/2.54.0 | docs | A | git linked-worktree semantics in 2.54.0 docs (host git 2.55.0) | § BUGS; git-worktree(1) 2.54.0 (the 2.55.0 path redirects here) | git linked worktrees: multi-checkout still experimental, submodule support incomplete; docs lag host 2.55.0 | queued | 2026-10-19 | on-release | — |
| S015 | Anthropic: How we built our multi-agent research system — https://www.anthropic.com/engineering/multi-agent-research-system | docs | A | Anthropic orchestrator-worker research system, as reported by its builder | § Benefits of a multi-agent system; published 2025-06-13 | Orchestrator-worker research: 90.2 percent gain, about 15x tokens, token usage explains 80 percent of variance | queued | 2026-10-19 | 365d | — |
| S016 | Cognition: Don't Build Multi-Agents — https://cognition.com/blog/dont-build-multi-agents | community | B | Cognition's argument against multi-agent parallelism (opinionated) | Principle 1; published 2025-06-12 | Counterpoint: share full traces, not messages; single-threaded agents avoid conflicting decisions | queued | 2026-10-19 | 365d | — |
| S017 | Temporal: Activity Definition — https://docs.temporal.io/activity-definition | docs | A | Temporal activity idempotency contract | § Idempotency; fetched 2026-10-19 (Last-Modified 2026-10-19) | Temporal activities are at-least-once; Run ID plus Activity ID forms the idempotency key | queued | 2026-10-19 | 180d | — |
| S018 | Cemri et al., Why Do Multi-Agent LLM Systems Fail? (MAST) — https://arxiv.org/abs/2503.13657 | paper | A | MAST failure taxonomy for multi-agent LLM systems | § Abstract; arXiv:2503.13657v3 | MAST: 1600+ traces, 14 failure modes in 3 categories, kappa 0.88 | queued | 2026-10-19 | 365d | — |
| S019 | MCP Security Best Practices 2026-07-28 — https://modelcontextprotocol.io/docs/2026-07-28/tutorials/security/security_best_practices | docs | A | MCP OAuth and security attack mitigations (security province) | § Attacks and Mitigations, Confused Deputy Problem; revision 2026-07-28 | REJECTED: security-province OAuth confused-deputy mitigation; report to kasegi/kagi; flip: an orchestration-only clause | rejected | 2026-10-19 | 365d | — |
| S020 | LangGraph Persistence overview — https://docs.langchain.com/oss/python/langgraph/persistence | docs | A | LangGraph persistence overview page (locator target) | § Checkpointer vs. store; fetched 2026-10-19, durable-execution URL redirects here | REJECTED: locator drift; durable-execution URL redirects to an overview omitting durability modes; flip: page regains durability semantics | rejected | 2026-10-19 | 365d | — |

## Paths

- **Kimi MCP plane — S005 → S006 → S007 → S008:** read the client surface
  (mcp.json levels and trust gating) before the config knobs that resolve models
  and timeouts; then the contrasting Codex dialect, because the host's inert
  `[mcp_servers]` table is only explainable by comparison; end at the live census,
  which converts the documented surface into the observed UNLISTED mcp.json drift.
  Documented surface before host residue prevents mistaking a dialect for a bug.
- **OMP delegation contract — S001 → S002 → S003 → S004:** the task boundary
  (batch shape, caps, isolation) first, because it bounds every spawn; then the hub
  lifecycle that decides what a parked or killed child can still do; then discovery
  precedence, which explains which definition actually ran; end at the installed
  version, because `main` docs and the host binary can skew.
- **Multi-agent design judgment — S015 → S016 → S018 → S010 → S011 → S012 → S013 → S014:**
  start from measured claims by a builder and its strongest public counterpoint
  (S015, S016), then the independent failure taxonomy that names what goes wrong
  (S018); move to the protocol revision that changes transport and task semantics
  (S010, S011), then to the host implementations that must live under it (S012,
  S013), and close on git worktrees, the isolation substrate all of them assume.
  Measured outcomes before implementation detail; mechanism before substrate.

## Search log

**MCP revision delta — query “MCP specification 2026-07-28 changelog stateless
sessions”; where: web search, 2026-10-19; identified 8, screened 8, included 1,
excluded 7.** The included result was the spec changelog itself (S010); its tasks
bullet links back to the prior revision page, opened directly (S011). Excluded:
three third-party renditions (VerifyMCP, Vercel reference, MCP-Go), one vendor
implementation post (AWS AgentCore), one SDK release note, and two copies of the
maintainers' own blog post. Reason: secondary or derivative for a text the spec
hosts primary. Stop: the primary changelog states the delta in full, and the prior
revision is reachable from it.

**Kimi MCP and tower surfaces — query “Kimi Code CLI tower multi-agent worktree
coordinator”; where: web search, 2026-10-19; identified 8, screened 8, included 0,
excluded 8.** Results were help-center restructures, a docs mirror on a second
official domain, a cheat sheet, and a third-party orchestration harness repository.
None added a page not already reachable on the official docs domain, which was
fetched directly (S005, S006, S012, S013). Stop: the official docs were already the
primary locator; search added no primary text and no contradiction.

**MAST taxonomy — query “multi-agent LLM systems failure taxonomy 14 modes 1600
traces”; where: web search, 2026-10-19; identified 8, screened 8, included 1,
excluded 7.** Included: the arXiv abstract (S018). Excluded: NeurIPS PDF, slides
and poster pages, the DOI alias, an HTML mirror, the Berkeley project page, and the
code repository. Reason: the abstract carries the exact counts and agreement
statistic the row teaches; mirrors repeat it without adding scope. Stop: counts
verified first-hand on the primary abstract.

**Direct-locator pass — queries: the exact titles and URLs queued in the wave-1
dossier §3; where: direct HTTPS fetch from each canonical host, 2026-10-19;
identified 17, screened 17, included 17, excluded 0, failed 0.** Seventeen locators
returned HTTP 200 and were read: three OMP docs, four Kimi docs, one Codex page,
two MCP changelogs, git-worktree, two first-party agent-engineering posts, the
Temporal activity page, the MAST abstract, the MCP security page, and the LangGraph
persistence page. Two were then rejected in-row on scope or locator grounds
(S019, S020), not excluded at screening. Three own-work rows were produced by
running the commands instead of fetching (S004, S008, S009). Stop: every queued
locator was re-opened and quoted; no locator failed.

## Leads (unopened)

- **MCP tasks extension spec.** The 2026-07-28 changelog moves tasks to
  `io.modelcontextprotocol/tasks`; the extension page itself is not opened here.
- **MCP MRTR pattern page and feature-lifecycle policy.** Linked from the same
  changelog; not opened this round.
- **OMP docs beyond the three rows.** mcp-protocol-transports.md,
  mcp-runtime-lifecycle.md, mcp-config.md, collab.md, and advisor-watchdog.md
  under https://github.com/can1357/oh-my-pi/tree/main/docs.
- **Kimi Code hooks, env-vars, and plugin pages.** Only the MCP, config, agents,
  and tower pages were opened.
- **LangGraph checkpointers page.** Holds the `exit`/`async`/`sync` durability
  modes that the rejected persistence overview (S020) omits; locator not re-opened
  this round.
- **Temporal detecting-activity-failures and workflow-versioning pages.** Only the
  activity-definition page was opened.
- **Microsoft Agent Framework primary docs.** learn.microsoft.com/agent-framework
  and github.com/microsoft/agent-framework; not opened.
- **Anthropic “Building effective agents” (2024-12-19).** Canonical
  workflows-versus-agents vocabulary; not opened this round.
- **MAST code and data repository.** https://github.com/multi-agent-systems-failure-taxonomy/MAST,
  seen in search results; not opened.
- **git 2.55.0 release notes.** The worktree page is pinned to 2.54.0 (the 2.55.0
  docs path redirects there); the release notes themselves were not opened.

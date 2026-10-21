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
| S005 | Kimi Code CLI Docs: Model Context Protocol — https://moonshotai.github.io/kimi-code/en/customization/mcp.html | docs | A | Kimi Code MCP client configuration and trust gating | § Configuration; fetched 2026-10-19 (Last-Modified 2026-10-19) | Kimi reads MCP servers from mcp.json at user and project levels, project wins; headless trust gating | mined | 2026-10-19 | on-release | corpus/knowledge/kimi-mcp-plane.md, corpus/lessons/round-35.md |
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
| S021 | upstream ufo-fsd-alpha range 964f443e..31c465f1 — own-work: git diff --name-status 964f443e 31c465f1 -- scripts and git log --oneline over scripts + the two crates, read through a private read-only clone pinned at 31c465f1 | own-work | A | upstream script-layer change set behind the round-35 re-census (member scope, not raw file count) | stdout of the diff: 2 A, 6 D, 61 M (members: 2 added, 5 deleted, 55 modified); log line 1 is the range head 31c465f1, committed 2026-10-20 07:25:51 -0300 | Range 964f443e..31c465f1 moves the script-layer universe 91 → 88 members; dev-verify.sh and six shell or extensionless files are outside the member patterns | mined | 2026-10-20 | 30d | corpus/knowledge/remaining-scripts-census.md, corpus/lessons/round-35.md |
| S022 | Kimi Code CLI Docs: Slash Commands — https://moonshotai.github.io/kimi-code/en/reference/slash-commands.html | docs | A | Kimi Code in-TUI MCP commands /mcp and /mcp-config and their idle-state availability | § Information & Status (/mcp row); § Built-in skill commands (/mcp-config row); fetched 2026-10-20, Last-Modified Mon, 19 Oct 2026 10:22:06 GMT | /mcp lists server connection status and is always available; /mcp-config is an idle-only built-in skill that configures servers and handles OAuth login | mined | 2026-10-20 | on-release | corpus/knowledge/kimi-mcp-plane.md, corpus/lessons/round-35.md |
| S023 | Stryker Mutator docs: Mutant states and metrics — https://stryker-mutator.io/docs/mutation-testing-elements/mutant-states-and-metrics/ | docs | A | Mutation-testing outcome definitions (killed, survived) and mutation score as Stryker defines them | § Mutant states, Killed bullet; § Metrics; page undated, fetched 2026-10-20 | Killed = a test failed while the mutant was active; survived = all tests passed; mutation score = detected / valid | mined | 2026-10-20 | 180d | corpus/lessons/round-35.md |
| S024 | oh-my-pi docs/mcp-config.md — https://github.com/can1357/oh-my-pi/blob/main/docs/mcp-config.md | docs | A | OMP-native MCP config file locations and profile scoping on main | § Preferred config locations; main 10b9b493 (ls-remote 2026-10-20); file last changed 4ab6de0b (2026-10-16) | OMP-native MCP config: project .omp/mcp.json and user ~/.omp/agent/mcp.json are the primary server-definition files; legacy .mcp.json paths are also read for compatibility | queued | 2026-10-20 | on-release | — |
| S025 | Anthropic: Building effective agents — https://www.anthropic.com/research/building-effective-agents | docs | A | Anthropic's workflow-versus-agent vocabulary and pattern catalog, as stated by its builder; tool-specific claims excluded | § What are agents?; published 2024-12-19, modified 2026-10-09; the /engineering/ path now 308-redirects here | Workflows run LLMs and tools on predefined code paths, agents direct their own process; five workflow patterns; simplest solution first | queued | 2026-10-20 | 180d | — |
| S026 | MCP Tasks extension — https://github.com/modelcontextprotocol/ext-tasks | spec | A | MCP Tasks extension identity and stable schema (io.modelcontextprotocol/tasks) | README § Why Tasks? and § Schemas (schema 2026-07-28 Stable); main b3d28ace (ls-remote 2026-10-20); fetched 2026-10-20 | Extension id io.modelcontextprotocol/tasks from SEP-2663; durable task handle with later retrieval; stable schema 2026-07-28 | queued | 2026-10-20 | on-release | — |
| S027 | git v2.55.0 release notes — https://github.com/git/git/blob/v2.55.0/Documentation/RelNotes/2.55.0.adoc | docs | A | git 2.55.0 worktree-relevant release items | § UI, Workflows & Features, bullet at lines 38-39; tag v2.55.0 (host git 2.56.0) | .git/info/exclude is shared by every worktree linked to one repository; the v2.55.0 git-worktree page does not say so | queued | 2026-10-20 | on-release | — |
| S028 | LangGraph Checkpointers — https://docs.langchain.com/oss/python/langgraph/checkpointers | docs | A | LangGraph checkpointer durability modes exit, async, sync (Python OSS docs) | § Durability modes, exit bullet; page JSON-LD dateModified 2026-09-28T09:34:08Z, fetched 2026-10-20 | Durability trades write timing for crash safety: exit persists only on graph exit, sync persists before each next step | queued | 2026-10-20 | 90d | — |
| S029 | upstream ufo-fsd-alpha census at 31c465f1 — own-work: git rev-parse HEAD plus ls/wc over the two crate src dirs and the claims probe's R-section walk, read through the private clone /fast/scratch/kumitate-r36/src | own-work | A | pinned census behind C2: R5/R7 member resolution and lane R-section coverage at 31c465f1 | stdout: HEAD 31c465f15669f744848bd9f5d56191c5085670f7; crates/ufo-core-runtime/src/*.rs=88, crates/ufo-cli/src/*.rs=4; R_members=92; R5 4 and R7 5 files; distinct in-family sections 83 -> 92; read 2026-10-21 | R5 and R7 name 9 of the 92 runtime members, so their 9 new sections close coverage:runtime-layer at 92/92 => 10 | mined | 2026-10-21 | 30d | corpus/knowledge/native-admission-detail.md, corpus/knowledge/local-ship.md |
| S030 | pytest docs: How to use skip and xfail — https://docs.pytest.org/en/stable/how-to/skipping.html | docs | A | strict expected-failure semantics for a pinned expectation | § strict parameter (h3 id strict-parameter); fetched 2026-10-21 (the item's how-to/skip.html is a 404; this page is the live successor) | "This will make XPASS (\u201cunexpectedly passing\u201d) results from this test to fail the test suite." A strict expectation that stops firing is itself an error | mined | 2026-10-21 | 180d | corpus/lessons/round-36.md |
| S031 | git documentation: git-rev-parse — https://git-scm.com/docs/git-rev-parse | docs | A | how a gate names the revision it scored (served page 2.56.0) | § OPTIONS \u2192 Options for Output \u2192 --verify; served 2.56.0 (2026-09-28), fetched 2026-10-21 | "If so, emit it to the standard output; otherwise, error out." rev-parse emits exactly one object name or errors, so unverifiable stays distinct from a mismatch | mined | 2026-10-21 | on-release | corpus/knowledge/pinned-evidence.md, corpus/lessons/round-36.md |
| S032 | Reproducible Builds: Recording the build environment — https://reproducible-builds.org/docs/recording/ | docs | A | provenance duty for a scored result | § Recording the build environment, paragraph before § File Format; HTTP 200, Last-Modified 2026-10-19 | "All relevant information about the build environment should either be defined as part of the development process or recorded during the build process." Pin defines it; src-rev records it | mined | 2026-10-21 | 365d | corpus/knowledge/pinned-evidence.md, corpus/lessons/round-36.md |


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

**Round-35 lead pass — queries: the five leads then listed under `## Leads` (MCP
tasks extension, OMP docs beyond the opened rows, LangGraph checkpointers,
Anthropic "Building effective agents", git 2.55.0 release notes) plus three
claim-bound locators (upstream range, a Kimi page for the MCP commands,
mutation-outcome definitions); where: direct HTTPS fetch / own-work commands,
2026-10-20; unit: sources; identified 8, screened 8, included 8, excluded 0,
failed 0.** One scribe seat per source opened and quoted it (reports
`.ufo/waves/round-35/build/ScribeSrc*.md`). Two seats also searched the web: the
LangGraph seat screened 10 results and included 1 (API references, SDK schema
pages, the overview and durable-execution URLs and mirrors excluded); its
exclusions are search results, not lead sources. The tasks-extension lead was
mis-located: the 2026-07-28 changelog links only SEP-2663, and the extension page
was reached through the docs index (S026). The Kimi commands page (S022) documents
the `/mcp` and `/mcp-config` surface but not the mcp.json file; the file's
location and shape rest on S005, re-opened by the same seat (its quote still
matches). S020's flip condition was re-checked and is not met — the overview still
carries no durability text; the modes live on the checkpointers page (S028), so
S020 stays rejected. Stop: every lead row is quoted first-hand; the three
claim-bound rows are cited by their used-by paths.

## Leads (unopened)

Opened in round 35 and removed from this list: MCP tasks extension (S026), OMP
mcp-config docs page (S024), LangGraph checkpointers (S028), Anthropic "Building
effective agents" (S025), git 2.55.0 release notes (S027).

- **MCP MRTR pattern page and feature-lifecycle policy.** Linked from the same
  changelog; not opened this round.
- **OMP docs beyond the opened rows.** mcp-protocol-transports.md,
  mcp-runtime-lifecycle.md, collab.md, and advisor-watchdog.md under
  https://github.com/can1357/oh-my-pi/tree/main/docs.
- **Kimi Code hooks, env-vars, and plugin pages.** Only the MCP, config, agents,
  tower and slash-commands pages were opened.
- **Temporal detecting-activity-failures and workflow-versioning pages.** Only the
  activity-definition page was opened.
- **Microsoft Agent Framework primary docs.** learn.microsoft.com/agent-framework
  and github.com/microsoft/agent-framework; not opened.
- **MAST code and data repository.** https://github.com/multi-agent-systems-failure-taxonomy/MAST,
  seen in search results; not opened.
- **git 2.55.0 push-to-checkout GIT_WORK_TREE note.** Line 358 of the 2.55.0
  release notes (seen by the S027 scribe, not drafted as a row).
- **MCP Tasks extension spec text.** The S026 seat read the README and SEP-2663
  but not the published schema; lifecycle statuses and field names
  (ttlSeconds, pollIntervalMilliseconds) await the spec text.
- **LangGraph types module durability literal.** Seen only in a search snippet
  (Literal of "sync", "async", "exit") by the S028 seat; not opened.

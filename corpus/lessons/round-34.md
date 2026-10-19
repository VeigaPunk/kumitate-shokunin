# Round 34 — lessons (kumitate)

## Mistakes

Line pointers into `SCORECARD.md` below resolve at the round's base `16a5441`
(`git show 16a5441:SCORECARD.md`); the round-34 commit shifts SCORECARD lines
after :300 by +1 to +22. `LOG.md` pointers are unaffected (the round appends).

| class | evidence pointer | captured-by | fix |
|---|---|---|---|
| Recalled counts treated as measured | SCORECARD.md:1197-1208 (durable rule); LOG.md:719-721 (195 vs 196); LOG.md:1042-1043 (wrote 62, tree read 63); LOG.md:1070-1080 (~30 distinct refuted at 49/49) | Q3 | A count is a claim: carry the counting command and its date, or label it `recalled`. |
| Gate blind spot / cheapest fake pass | SCORECARD.md:401 (renamed member section still `PROXY: MATCH`); LOG.md:608-609 (ghost note passed); LOG.md:916-922 (occurrence vs distinct); LOG.md:1297 (`CLAIMS: MATCH` is not section-honesty) | Q6 | Mutation-test the cheapest fake before trusting green; a member-count claim needs an occurrences = distinct-identities proof; read strict rows, not the aggregate. |
| Attribution / identity defect | author histogram 2026-10-19 (command below): 26 lane of 75; 25 operator personal identity, 16 `ci@local`, 6 aggregator, 2 `shokunin@local` | Q12 | Every round commit carries the lane identity; the close verifies the histogram, not the config. |
| Substrate mutation under observation | LOG.md:1015-1017 (config flip mid-round; no machine gate); LOG.md:1048 (full drift line rule); live `kimi-census` DRIFT 2026-10-19 | Q13 | Re-run substrate gates at open; quote the full DRIFT line with its date; disposition every term before close. |
| Own round-gate fails own record | live `round-gate --round 32` (command below) → DRIFT, 3 errors, exit 1: `REPORT_MISSING`, `SCORECARD_ROW_MISSING`, `LOG_ENTRY_MISSING` | Q10 | A round's record must pass the lane's own round-gate before close; the gate's row/bullet/report format is the record format. |
| Admission-status ambiguity | `git show 16a5441` (2026-10-17, +802 lines, 7 files); `grep -n 16a5441 LOG.md SCORECARD.md` empty; SCORECARD.md:378,458 (measurement record promised, never appended) | Q11 | A landed candidate carries a dated LOG admission entry naming round identity, work revision and gate lines. |
| Dead pointers (/tmp, lowercase projects/) | `grep -c 'vgpnk/projects/' LOG.md` → 15; `/tmp/kumitate-r*` → 6 in LOG.md, 2 in SCORECARD.md | Q14 | Evidence pointers are repo-relative or under the live repo root; never `/tmp`, never the pre-move lowercase path. |
| Stale prose in historical rows | SCORECARD.md:307 (`C2 53/53`, live 74/74); corpus/README.md:97 (pre-round-32 script count) and :160 (lessons 12, live 36) | Q3 | A historical row states its measurement date/revision; the live claim block wins over prose. |
| Unadopted contract surfaces | `corpus/QUALITY.md` absent pre-round; `grep -rL '^## Gate' corpus/lessons` → 21 of 36; `grep -rL '^source:' corpus/knowledge` → 38 of 38; PROVINCE.md:6 has no Core/Frontier/Adjacent | Q1, Q10 | A named contract surface lands in the round that names it or fails round-gate; absence is not prose debt. |
| Revision skew unpinned | corpus/lessons/round-15.md:91 (origin tree moves under citations); corpus/lessons/round-20.md:71 (OMP re-census parked); corpus/lessons/round-24.md:60 (carried OMP-move citations) | Q8 | Name the revision observed beside every doc-derived claim; re-census when the origin moves. |
| Correction reintroduces the fixed class | corpus/lessons/round-19.md:69-73 (errata added 4 bare-basename citation errors; gate caught them after integration) | Q6 | Run the gate after writing errata; an integrator's own correction is not exempt from the sweep. |
| Registry change slipped into the round that measures it (proposed by the L1 this round, refused in-round) | critic seat R34Critic-2 phase 1, attack 1; rule SCORECARD.md:913-916 ("a registry change … must be pre-registered a round ahead of the round that measures it"); round-20 halt "record and stop rather than fit" (SCORECARD.md `## Planned`, round-20 pre-registration) | SCORECARD.md:913-916 (existing rule; it caught the move before landing) | Declaring root mcp.json into K1 is held to round 35 (pre-registered); round 34 re-pins only the counted-live skills tripwire. Re-read the registry rule before a claim adds a member. |
| Relay message displaced L2 final results | 2 seats (R34Reviewer-2, R34Scout-2) answered the L1's verbatim relay of the orchestrator safety notice after finishing, so their delivered finals read "no action"; the real results were recovered from their `history://` transcripts | none | Relay only to seats still running; read `history://<id>` whenever a final reads as a reply. |
| Seats skipped explicitly assigned verification | R34ExecKimiB and R34ExecSourcesGateB returned "checks not run" although their tasks assigned the selftests | Q6 (enforced at the L1) | The L1 re-ran every gate before admission (`## Gate` below); a seat's own green is never admission evidence. |

Working, not defects: rejected admission rationales kept with reasons (LOG.md:395,
`.ufo/rounds/round-33/lesson.md:9-16`); honest stops (round-33 zero credit,
round-31 FINAL at LOG.md:1211-1223, round-15 retirement at LOG.md:667-685);
cross-domain evidence routed, not absorbed (PROVINCE.md:6,
`corpus/lessons/round-5-aggregator-mirror-out-of-province-membrane-seal.md:24`).
Gate disagreements keep both readings: LOG.md:90 (critic falsified the
reconcileQueue order), LOG.md:409 (S6 attribution), SCORECARD.md:380 (round-30
dead-token re-token, expectation-refresh class). Append-only corrections:
round-33 axis erratum (`.ufo/rounds/round-33/axis-correction.json`); round-31
correcting round-28's "5 losses" to 3 (LOG.md:1218).

Commands re-run in this worktree on 2026-10-19:

```sh
git log --format='%ae' | sort | uniq -c
# 26 kumitate@shokunin.local; 25 <operator personal address, redacted>; 16 ci@local; 6 aggregator@shokunin.local; 2 shokunin@local
node scripts/round-gate.mjs --round 32 --reports-dir .ufo/reports --main-repo .
# ROUND_GATE: DRIFT (round=32 lane=kumitate checks=5 errors=3 warnings=0), exit 1
node scripts/kimi-census.mjs
# KIMI_CENSUS: DRIFT (UNLISTED skills/; UNLISTED mcp.json), exit 1
grep -cE '^\| `(knowledge|lessons)/' corpus/README.md
# 74
```

## Gate

Admission bar: `corpus/QUALITY.md` Q1–Q14 (new this round). Every command below
was run by the L1 in the lane worktree on 2026-10-19; after-numbers are measured
on the round commit and recorded in `LOG.md` round 34.

**Admitted.**

- `corpus/knowledge/kimi-mcp-plane.md` — Q1 header triple present; Q2 facts cite
  S005–S008; Q3 counts carry commands (`grep -c 'User level'` → 1, config-files
  key count → 4); Q4 the Codex-dialect reading is `[INFERENCE]`, mcp.json content
  UNKNOWN by design; Q5 stat only (strace: 0 opens of mcp.json by the census);
  Q6 per-file cite-check errors 0; Q7 the census DRIFT line quoted whole; Q8 host
  `kimi 2.2.0` vs recorded 2.1.1 named; Q9 the `rea` registration routed to kaidoku.
- `corpus/knowledge/omp-task-contract.md` (authored by seat R34ExecOmpB) — Q1
  header triple with per-path commit ids; Q2 S001–S004; Q6 per-file cite-check 0;
  Q8 docs on `main` vs installed `omp/18.12.3`. Spot-check by the L1: `curl -fsSL
  https://raw.githubusercontent.com/can1357/oh-my-pi/main/docs/tools/task.md |
  grep -n maxConcurrency` → line 167 «defaults to `32`; `0` means unlimited»; the
  agent-hub page line 118 «Messaging a parked or killed subagent revives it».
- `corpus/knowledge/kimi-skills-plugins.md` cursor-lane section + erratum
  (authored by seat R34ExecKimiB) — names the sixth `skills/` child at internals
  level; credential lines of that runbook deliberately not reproduced (Q5,
  sentinel seat R34Sentinel-2 listed them by line and category only).
- `corpus/SOURCES.md` — 20 rows, all opened 2026-10-19 by seat R34ScribeSources-2;
  contract census clean (rows 20, malformed 0, A=19 B=1, mined 9 queued 9 rejected
  2, no duplicates, no enum violations, no missing used-by paths);
  `node scripts/sources-check.mjs` → `SOURCES_CHECK: CLEAN (rows=20 …)`.

**Rejected or held.**

- Root mcp.json as a K1 member — held. Reason: registry change in the measuring
  round (rule SCORECARD.md:913-916 at `16a5441`). Flip: the round-35 pre-registration in
  `SCORECARD.md` `## Planned` lands with its tool, stanza and axes change together.
- The round's original Claim-2 target (51/51) — withdrawn with the hold above;
  the claim measures 50/50.
- S019 (MCP Security Best Practices) — rejected on domain (kasegi/kagi); flip: an
  orchestration-only clause binding dispatch or queue behaviour.
- S020 (LangGraph Persistence overview) — rejected on locator drift; flip: the
  page regains the durability-mode semantics.

**Source rows opened this round** (contract rule 1: URL, access date, ≤25-word
quote with its location; backticks dropped from quotes, words verbatim). Full
record: `.ufo/rounds/round-34/sources-gate.md`.

- S001 — https://github.com/can1357/oh-my-pi/blob/main/docs/tools/task.md — 2026-10-19 — § Limits & Caps: «Idle TTL: task.agentIdleTtlMs, default 420_000 ms (7 min); <= 0 disables parking and keeps idle sessions live until exit.»
- S002 — https://github.com/can1357/oh-my-pi/blob/main/docs/agent-hub.md — 2026-10-19 — § Related surfaces: «Messaging a parked or killed subagent revives it.»
- S003 — https://github.com/can1357/oh-my-pi/blob/main/docs/task-agent-discovery.md — 2026-10-19 — § Merge and collision rules: «Discovery uses first-wins dedup by exact agent.name»
- S004 — `omp --version` — 2026-10-19 — stdout line 1: «omp/18.12.3»
- S005 — https://moonshotai.github.io/kimi-code/en/customization/mcp.html — 2026-10-19 — § Configuration: "MCP server configuration is written in mcp.json, at two levels"
- S006 — https://moonshotai.github.io/kimi-code/en/configuration/config-files.html — 2026-10-19 — § Subagent model pool: «A spawn resolves the subagent's model in this order: 1. An explicit model passed in the tool call»
- S007 — https://learn.chatgpt.com/docs/developer-commands?surface=cli — 2026-10-19 — § codex mcp: «Manage Model Context Protocol server entries stored in ~/.codex/config.toml.»
- S008 — `node scripts/kimi-census.mjs` — 2026-10-19 — round-open verdict line: "KIMI_CENSUS: DRIFT (UNLISTED skills/; UNLISTED mcp.json)"
- S009 — `node scripts/proxy-check.mjs` — 2026-10-19 — round-open line 1: «PROXY  error  K_MEMBERS_DRIFT  K_members: declared=49 computed=50 delta=+1»
- S010 — https://modelcontextprotocol.io/specification/2026-07-28/changelog — 2026-10-19 — § Major changes: «Remove protocol-level sessions and the Mcp-Session-Id header from the Streamable HTTP transport.»
- S011 — https://modelcontextprotocol.io/specification/2025-11-25/changelog — 2026-10-19 — § Major changes: «Add experimental support for tasks to enable tracking durable requests with polling and deferred result retrieval (SEP-1686).»
- S012 — https://moonshotai.github.io/kimi-code/en/customization/agents.html — 2026-10-19 — § Agent Locations: «more specific scopes take higher priority: Explicit (--agent-file) > Project > Extra > User > Plugin > Built-in.»
- S013 — https://moonshotai.github.io/kimi-code/en/guides/tower.html — 2026-10-19 — § Safety and resource cost: «Worktrees isolate writes, but they are not a security sandbox.»
- S014 — https://git-scm.com/docs/git-worktree/2.54.0 — 2026-10-19 — § BUGS: «Multiple checkout in general is still experimental, and the support for submodules is incomplete.»
- S015 — https://www.anthropic.com/engineering/multi-agent-research-system — 2026-10-19 — § Benefits of a multi-agent system: «multi-agent systems use about 15× more tokens than chats.»
- S016 — https://cognition.com/blog/dont-build-multi-agents — 2026-10-19 — Principle 1: «Share context, and share full agent traces, not just individual messages»
- S017 — https://docs.temporal.io/activity-definition — 2026-10-19 — § Idempotency: «You can use a combination of the Workflow Run ID and the Activity ID as an idempotency key»
- S018 — https://arxiv.org/abs/2503.13657 — 2026-10-19 — § Abstract: «This process identifies 14 unique modes, clustered into 3 categories»
- S019 — https://modelcontextprotocol.io/docs/2026-07-28/tutorials/security/security_best_practices — 2026-10-19 — § Confused Deputy Problem: «MCP proxy server uses a static client ID with a third-party authorization server»
- S020 — https://docs.langchain.com/oss/python/langgraph/persistence — 2026-10-19 — § Checkpointer vs. store: «Checkpointers persist a thread’s graph state as checkpoints.»

**Rows touched old→new:** none — every row is new this round (append-only holds
trivially).

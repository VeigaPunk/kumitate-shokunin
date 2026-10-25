# kumitate-shokunin — Province

**Domain:** orchestration & tooling — scopes OMP task/hub, ufo-fsd scripts & runtime

**Owns:** the domain knowledge, playbooks, error patterns, and checklists above.
**Refuses:** anything outside this domain; report cross-domain evidence back to the orchestrator rather than absorbing it.

## Province bands (appended round 34, 2026-10-19; the lines above stand unchanged)

### Core — governed at member level, gated

- Origin script layer `/home/vgpnk/Projects/ufo-fsd-alpha/scripts/` — registry rows S1–S8 (`SCORECARD.md` §In-scope surface registry), gated by `scripts/claims-check.mjs` + `scripts/proxy-check.mjs` (`coverage_script`).
- Origin runtime layer `/home/vgpnk/Projects/ufo-fsd-alpha/crates/ufo-core-runtime/src/` + `crates/ufo-cli/src/` — rows R1–R11, same gates (`coverage_runtime`).
- Kimi Code substrate `~/.kimi-code/` — rows K1–K5, gated by `scripts/kimi-census.mjs` (member set; secret members shape-only) + `scripts/proxy-check.mjs` (`coverage_kimi`).
- The lane's own instruments `scripts/*.mjs` (registry: `SKILL.md` §Gate registry) and its learning registry `corpus/SOURCES.md` (checked by `scripts/sources-check.mjs`).

### Frontier — named ground, entered by sourced entries, not yet gated

- OMP harness contract (task batch, agent hub, agent discovery) — first entry `corpus/knowledge/omp-task-contract.md` (round 34); the docs track upstream `main` while the host runs the installed `omp` binary (skew named in the entry).
- MCP protocol revisions as they bear on orchestration — first entry `corpus/knowledge/mcp-orchestration-contract.md` (round 59, S125/S127/S136): per-request identity in `_meta`, durable task creation, and the removal of the session handshake; other MCP revision families remain queued.
- Isolation substrates for parallel agents (git worktrees, harness isolation backends, jj workspaces) — first entry `corpus/knowledge/agent-isolation-substrates.md` (round 45, exploratory): seat-containment rules derived from their mechanisms with demos; harness isolation is off on this host; jj workspaces advanced in round 64 by `corpus/knowledge/jj-workspace-seat-containment.md` — the first demonstrated jj-workspace seat-containment ground (mechanism M7 measured by `scripts/jj-seat-demo.sh`: one shared operation log, staleness that follows the seat's tree, `update-stale` recovery that deletes the abandoned files, no filesystem boundary), appended to the round-45 entry as `Amendment 2026-10-25`.
- Durable-execution and multi-agent failure research (idempotency, timeouts, failure taxonomies) — first entry `corpus/knowledge/at-least-once-dedupe.md` (round 54; S106/S107): delivery identity and claim/repend; advanced round 55 by `corpus/knowledge/bounded-redelivery-budgets.md` (S109/S110/S111): the bound side — broker delivery-limit/dead-letter, consumer commit ordering, client-side retry budgets; advanced round 56 by `corpus/knowledge/visibility-lease-ack-deadlines.md` (S113/S114/S115): the lease slot — visibility timeout / ack deadline; advanced round 57 by `corpus/knowledge/worker-heartbeat-liveness.md` (S117/S118/S119): the liveness signal — worker heartbeats, session timeouts, platform probes; advanced round 60 by `corpus/knowledge/durable-execution-and-fanout-primitives-2026-10-24.md` (S190/S194): the two primitives the band was missing — compensating action as a saga, tail tolerance as the slowest seat's cost — and by `corpus/knowledge/durable-execution-failure-detection.md` (S126/S131/S133/S134/S135): the three shapes of "durable" and where the guarantee breaks; advanced round 61 by `corpus/knowledge/temporal-worker-versioning-pinning.md` (S195): the version boundary for Pinned Workflows and the narrower Auto-Upgrade/retry-inheritance contract; other broker/workflow failure families remain queued.
- Multi-agent coordinator topology — orchestration topology **decisions** (how a wave's seats are arranged: which topology, what a coordinator may delegate, what the arrangement costs), not agent evaluation — first entry `corpus/knowledge/multi-agent-coordinator-topologies.md` (round 63, S196/S197): a vendor's managed-agent coordinator contract beside the measured scaling study of agent-system topologies, version-pinned to arXiv 2512.08296 v3; adjacent, not absorbed: kengaku evaluates agents, this lane arranges the seats around that judgment; recursion, nested rosters and cost per topology stay unspecified by both sources.

### Adjacent — reported, never absorbed

- MCP/OAuth security practice (token passthrough, confused deputy) → kasegi / kagi.
- Local model serving and endpoints → kama. Prompt and skill craft → kotoba. Research method → chousa.
- Upstream defects in `/home/vgpnk/Projects/ufo-fsd-alpha` → filed in lane reports for the operator; never patched from here.

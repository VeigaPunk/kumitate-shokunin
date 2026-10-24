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
- MCP protocol revisions as they bear on orchestration — `corpus/SOURCES.md` rows, queued.
- Isolation substrates for parallel agents (git worktrees, harness isolation backends) — first entry `corpus/knowledge/agent-isolation-substrates.md` (round 45, exploratory): seat-containment rules derived from their mechanisms with demos; harness isolation is off on this host, jj workspaces are not demonstrated.
- Durable-execution and multi-agent failure research (idempotency, timeouts, failure taxonomies) — first entry `corpus/knowledge/at-least-once-dedupe.md` (round 54; S106/S107): delivery identity and claim/repend; advanced round 55 by `corpus/knowledge/bounded-redelivery-budgets.md` (S109/S110/S111): the bound side — broker delivery-limit/dead-letter, consumer commit ordering, client-side retry budgets; advanced round 56 by `corpus/knowledge/visibility-lease-ack-deadlines.md` (S113/S114/S115): the lease slot — visibility timeout / ack deadline; other broker/workflow failure families remain queued.

### Adjacent — reported, never absorbed

- MCP/OAuth security practice (token passthrough, confused deputy) → kasegi / kagi.
- Local model serving and endpoints → kama. Prompt and skill craft → kotoba. Research method → chousa.
- Upstream defects in `/home/vgpnk/Projects/ufo-fsd-alpha` → filed in lane reports for the operator; never patched from here.

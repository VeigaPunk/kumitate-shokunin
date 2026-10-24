source: S001 https://github.com/can1357/oh-my-pi/blob/main/docs/tools/task.md#inputs + #flow + #modes--variants + #limits--caps + #notes; S002 https://github.com/can1357/oh-my-pi/blob/main/docs/agent-hub.md#roster-and-inspector + #read-and-steer-a-subagent + #related-surfaces + #persisted-agents-and-advisors; S003 https://github.com/can1357/oh-my-pi/blob/main/docs/task-agent-discovery.md#role-backed-custom-agents + #discovery-inputs-and-precedence + #merge-and-collision-rules + #agent-lookup-and-selection; S004 `omp --version` on this host
verified-at: 2026-10-19 (S001 path response ID 01a4cb31528a2f01b951959e00e5eff547b24929 / 2026-10-19T17:18:07Z; S002 ID ae29413e870eb186a342b1f9a16e41b65c9d3ed6 / 2026-10-19T12:20:43Z; S003 ID 2b4e9121fecf0c7ab6daba7cc18cb01325578fe3 / 2026-10-14T16:40:06Z; host omp/18.12.3)
recheck: `curl -fsSL https://raw.githubusercontent.com/can1357/oh-my-pi/main/docs/tools/task.md | wc -l` → 218 (2026-10-19); `curl -fsSL https://raw.githubusercontent.com/can1357/oh-my-pi/main/docs/agent-hub.md | wc -l` → 123 (2026-10-19); `curl -fsSL https://raw.githubusercontent.com/can1357/oh-my-pi/main/docs/task-agent-discovery.md | wc -l` → 341 (2026-10-19); `omp --version` → omp/18.12.3 (2026-10-19)

# OMP task contract — task batch, agent hub, agent discovery

## Scope

This entry records the upstream OMP task, Agent Hub, and agent-discovery contract opened from S001–S003, plus the host version observation S004. The project province includes OMP task/hub, ufo-fsd scripts, and runtime (PROVINCE.md:3). This note supplies the OMP-side contract that the lane's dispatch notes rely on; it is not another dispatch-shape description.

Upstream documentation is mutable `main`. The verified-at line records the latest commit returned for each documentation path at lookup time. Settings and behavior below are documentation facts, not measurements of the installed binary. Numeric defaults remain source-declared defaults unless explicitly described as host output.

## Task batch contract

### Wire shape and fields

The task schema is shape-swapped by `task.batch` (default on). Batch calls use `{ context, tasks: item[] }`: `context` is shared required background and each task item becomes an independent spawn. There is no top-level `agent` in batch form. With batch disabled, one `{ ...item }` flat call spawns one agent; shared context belongs in a shared `local://` file referenced by each task.

[S001 §Inputs](https://github.com/can1357/oh-my-pi/blob/main/docs/tools/task.md#inputs) — “The wire schema is shape-swapped by `task.batch` (default on).”

[S001 §Inputs](https://github.com/can1357/oh-my-pi/blob/main/docs/tools/task.md#inputs) — “Batch shape (`task.batch` on): `{ context, tasks: item[] }` — one subagent per item”

Required core item fields are `task` and `solutionSpace`; the documented item shape also names optional `name`, `agent`, `effort`, `outputSchema`, `schemaMode`, `tools`, and `isolated`. A schema-conditional seance item additionally accepts `sourceSession` and `model`. No wire `label` field exists.

[S001 §Inputs](https://github.com/can1357/oh-my-pi/blob/main/docs/tools/task.md#inputs) — “One unit of work is `{ name?, agent?, task, solutionSpace, effort?, outputSchema?, schemaMode?, tools?, isolated? }`.”

- `context` is required in batch mode and is rendered into each child system prompt. `tasks` must be non-empty and supplied names unique case-insensitively. Flat calls reject `context` and `tasks`; batch calls reject a simultaneous top-level `task`.
- `name` becomes the registry/IRC id; generation supplies a name when omitted. CamelCase and at most 32 characters are prompt guidance, not a wire-schema length constraint.
- `agent` selects a task-agent type; it defaults through the parent's spawn policy (usually `task`).
- `task` is the complete, self-contained work instruction and is rejected when empty after trimming.
- `solutionSpace` describes openness of the fix/design, not task size. The schema advertises it as required, but blank or missing values are leniently accepted and fall back to classifying `task` text.
- `effort` appears only when `task.enableEffort=true` (default off). `tools` requires `eval.tools.enabled=true` (default on); named tools execute in the parent's retained Python or JavaScript kernel, not the child's.
- `outputSchema` takes precedence over agent frontmatter `output` and the inherited parent schema. `schemaMode` is `permissive` or `strict`, defaults to `permissive`, and controls validation after retries.
- `isolated` is available only with `task.isolation.enabled=true` and outside plan mode. In plan mode, eval-defined tools and isolation/apply/merge controls are rejected.
- `sourceSession` and `model` are seance-only fields when that agent is spawnable; plan mode hides them. The model field selects the consult's saved-source override, not a general per-item model selector.

[S001 §Inputs](https://github.com/can1357/oh-my-pi/blob/main/docs/tools/task.md#inputs) — “Shared background prepended to every spawn of the call via the subagent system prompt.”

[S001 §Inputs](https://github.com/can1357/oh-my-pi/blob/main/docs/tools/task.md#inputs) — “Provided names must be unique within the call (case-insensitive).”

[S001 §Inputs](https://github.com/can1357/oh-my-pi/blob/main/docs/tools/task.md#inputs) — “Defaults to a generated AdjectiveNoun name and is uniquified per session by `AgentOutputManager`.”

[S001 §Inputs](https://github.com/can1357/oh-my-pi/blob/main/docs/tools/task.md#inputs) — “Defaults to the spawn policy's default agent (usually `task`).”

[S001 §Inputs](https://github.com/can1357/oh-my-pi/blob/main/docs/tools/task.md#inputs) — “Present only with `task.enableEffort=true`.”

[S001 §Inputs](https://github.com/can1357/oh-my-pi/blob/main/docs/tools/task.md#inputs) — “Invocation-specific structured-output contract.”

[S001 §Inputs](https://github.com/can1357/oh-my-pi/blob/main/docs/tools/task.md#inputs) — “Validation mode for the effective output schema.”

[S001 §Inputs](https://github.com/can1357/oh-my-pi/blob/main/docs/tools/task.md#inputs) — “Named tools already defined in the parent's Python or JS eval kernel.”

[S001 §Inputs](https://github.com/can1357/oh-my-pi/blob/main/docs/tools/task.md#inputs) — “Present only when seance is spawnable and omitted in plan mode.”

[S001 §Inputs](https://github.com/can1357/oh-my-pi/blob/main/docs/tools/task.md#inputs) — “There is no wire label field”
[S001 §Inputs](https://github.com/can1357/oh-my-pi/blob/main/docs/tools/task.md#inputs) — “Shared background goes into a `local://` file (e.g. `local://ctx.md`) that each spawn's `task` references”

[S001 §Inputs](https://github.com/can1357/oh-my-pi/blob/main/docs/tools/task.md#inputs) — “The prompt requests CamelCase, at most 32 characters; the wire schema only requires a string.”

[S001 §Inputs](https://github.com/can1357/oh-my-pi/blob/main/docs/tools/task.md#inputs) — “The work — complete, self-contained instructions.”

[S001 §Inputs](https://github.com/can1357/oh-my-pi/blob/main/docs/tools/task.md#inputs) — “How open-ended the child's problem is: whether the fix or design is given, or which causes or designs remain open”

[S001 §Inputs](https://github.com/can1357/oh-my-pi/blob/main/docs/tools/task.md#inputs) — “Blank or missing values fall back to classifying the `task` text”

[S001 §Inputs](https://github.com/can1357/oh-my-pi/blob/main/docs/tools/task.md#inputs) — “`isolated` exists only when `task.isolation.enabled` is true”

### Dispatch, concurrency, and recursion

A batch item is a separate spawn, not a shared child. With `async.enabled=true`, each non-blocking spawn is an independent background job; an agent configured `blocking: true` runs inline, and mixed calls do both. With async disabled, no job manager, or all-blocking items, execution is synchronous. Preflight checks names, schemas, depth, and spawn policy before dispatch.

[S001 §Flow](https://github.com/can1357/oh-my-pi/blob/main/docs/tools/task.md#flow) — “items whose agent type declares `blocking: true` run inline; the rest become background jobs.”

[S001 §Flow](https://github.com/can1357/oh-my-pi/blob/main/docs/tools/task.md#flow) — “one `type: "task"` job per spawn is registered”

Speculative launch (`task.speculativeLaunch`, default on for batch mode) starts work as each item JSON object closes after `context` is complete. Dispatch adopts a speculative run only when normalized parameters match the finished call; invalid calls, changed parameters, blocking hooks, or an aborted turn abort launched work.

[S001 §Modes / Variants](https://github.com/can1357/oh-my-pi/blob/main/docs/tools/task.md#modes--variants) — “Speculative launch (`task.speculativeLaunch`, default on; batch mode only)”

The session-scoped semaphore bounds every `SpawnRun` across task calls, including synchronous and speculative work. The setting is live-resized before acquire/release; zero removes the concurrency cap.

[S001 §Limits & Caps](https://github.com/can1357/oh-my-pi/blob/main/docs/tools/task.md#limits--caps) — “`task.maxConcurrency` defaults to `32`; `0` means unlimited.”

[S001 §Limits & Caps](https://github.com/can1357/oh-my-pi/blob/main/docs/tools/task.md#limits--caps) — “bounds every `SpawnRun` across task calls, including sync and speculative runs.”

`task.maxRecursionDepth` defaults to 2; negative values disable the cap. Registry and shared preflight enforce depth, and child `task` access is stripped at the maximum depth. The default spawn policy is still constrained by each agent's allowed `spawns` and blocked-self-recursion.

[S001 §Limits & Caps](https://github.com/can1357/oh-my-pi/blob/main/docs/tools/task.md#limits--caps) — “`task.maxRecursionDepth` defaults to `2`; negative values disable the cap.”

### Isolation and merge

Isolation requires a Git repository and a captured baseline. With `task.isolation.enabled=true`, a task must set `isolated: true` for a separate checkout; omitted or false leaves it in the parent's checkout. The isolation PAL resolves the requested backend and walks alternatives when unavailable.

[S001 §Modes / Variants](https://github.com/can1357/oh-my-pi/blob/main/docs/tools/task.md#modes--variants) — “isolation.backend selects `auto`, `apfs`, `btrfs`, `zfs`, `reflink`, `overlayfs`, `projfs`, `block-clone`, or `rcopy`, and the PAL resolves the actual backend with fallback.”

The documented candidate names are `auto`, `apfs`, `btrfs`, `zfs`, `reflink`, `overlayfs`, `projfs`, `block-clone`, and `rcopy`. `task.isolation.merge` selects patch mode (capture/apply root patches) or branch mode (commit to `omp/task/<id>`, cherry-pick into parent). `task.isolation.apply=false` retains captured changes without applying them; nested repositories get separate patch artifacts. Failed capture/merge paths retain recovery artifacts.

[S001 §Modes / Variants](https://github.com/can1357/oh-my-pi/blob/main/docs/tools/task.md#modes--variants) — “`task.isolation.merge` selects patch mode (capture/apply root patches) or branch mode (commit to `omp/task/<id>`, cherry-pick into parent).”

[S001 §Modes / Variants](https://github.com/can1357/oh-my-pi/blob/main/docs/tools/task.md#modes--variants) — “`task.isolation.apply=false` retains captured changes without applying them”

The baseline is bounded before spawn. The two merge modes differ: patch mode checks whether the root patch can apply; branch mode stashes the parent and cherry-picks. A stash-pop conflict can leave the landed commit on HEAD and preserve the stash as `stashConflict`.

[S001 §Limits & Caps](https://github.com/can1357/oh-my-pi/blob/main/docs/tools/task.md#limits--caps) — “each repository's uncommitted snapshot is capped at `1 GiB`”

[S001 §Notes](https://github.com/can1357/oh-my-pi/blob/main/docs/tools/task.md#notes) — “Branch-mode merge temporarily stashes the parent repo before cherry-picking”

### TTLs and budgets

A completed or otherwise kept-alive child becomes `idle`; the lifecycle manager arms its parking timer. At the configured idle TTL it becomes `parked`, retaining its reference and transcript while its session is disposed. `task.agentIdleTtlMs` defaults to 420,000 ms (7 minutes); values at or below zero disable parking.

[S001 §Limits & Caps](https://github.com/can1357/oh-my-pi/blob/main/docs/tools/task.md#limits--caps) — “`task.agentIdleTtlMs`, default `420_000` ms (7 min); `<= 0` disables parking”

The soft request budget defaults to 200 requests; zero disables it. If enabled, crossing the budget can inject a wrap-up notice; 1.5× the budget force-stops the run for partial findings. Bundled `scout`/`sonic` have a 100-request cap, which the setting may lower but not raise; an exact-name `task.agentSoftRequestBudget` entry replaces the default, including with zero.

[S001 §Limits & Caps](https://github.com/can1357/oh-my-pi/blob/main/docs/tools/task.md#limits--caps) — “`task.softRequestBudget` defaults to 200 requests (`0` disables).”

[S001 §Limits & Caps](https://github.com/can1357/oh-my-pi/blob/main/docs/tools/task.md#limits--caps) — “at 1.5× the budget the run is force-stopped to yield partial findings.”

[S001 §Limits & Caps](https://github.com/can1357/oh-my-pi/blob/main/docs/tools/task.md#limits--caps) — “Bundled scout/sonic agents cap it at 100; the setting can lower that cap but not raise it.”

[S001 §Limits & Caps](https://github.com/can1357/oh-my-pi/blob/main/docs/tools/task.md#limits--caps) — “An exact-name `task.agentSoftRequestBudget` entry (`lead: 400`) replaces both for that agent, in either direction; `0` there disables its guard.”

[S001 §Limits & Caps](https://github.com/can1357/oh-my-pi/blob/main/docs/tools/task.md#limits--caps) — “overridable via `PI_TASK_MAX_OUTPUT_BYTES` / `PI_TASK_MAX_OUTPUT_LINES`”

The hard wall-clock setting is `task.maxRuntimeMs`; its default zero disables the limit. Output returned inline is capped by `MAX_OUTPUT_BYTES = 500_000` and `MAX_OUTPUT_LINES = 5000` (overridable through `PI_TASK_MAX_OUTPUT_BYTES` and `PI_TASK_MAX_OUTPUT_LINES`), while the full raw output remains in the artifact.

[S001 §Limits & Caps](https://github.com/can1357/oh-my-pi/blob/main/docs/tools/task.md#limits--caps) — “`task.maxRuntimeMs` applies to every spawn; default `0` disables it.”

[S001 §Limits & Caps](https://github.com/can1357/oh-my-pi/blob/main/docs/tools/task.md#limits--caps) — “`MAX_OUTPUT_BYTES = 500_000` and `MAX_OUTPUT_LINES = 5000`”

## Agent hub lifecycle

The Hub is the live roster and control view for agents belonging to the session. Statuses are `running`, `idle`, `parked`, and `aborted`. `r` revives a parked or killed agent; `x` aborts a running turn when needed, then kills and releases it. A kill is not a permanent transcript deletion: the saved history can be reopened as a fresh instance.

[S002 §Roster and inspector](https://github.com/can1357/oh-my-pi/blob/main/docs/agent-hub.md#roster-and-inspector) — “status (`running`, `idle`, `parked`, or `aborted`)”

[S002 §Roster and inspector](https://github.com/can1357/oh-my-pi/blob/main/docs/agent-hub.md#roster-and-inspector) — “Abort a running turn if necessary, then kill and release the selected agent.”

For kept-alive work, caller cancellation, interruption, timeout, or soft-budget abort can stop only the current run and leave the agent idle/revivable. Explicit kill or an abort without a reviver marks the registry entry aborted and writes a tombstone. A later Hub revive or message removes the tombstone and reopens the transcript as a fresh parked generation, then revival returns it to idle. Idle agents are parked after the TTL; isolated kept-alive agents retain their workspace until release.

[S001 §Flow](https://github.com/can1357/oh-my-pi/blob/main/docs/tools/task.md#flow) — “a later message or Hub revive reopens the transcript as a fresh `parked` generation”

[S001 §Flow](https://github.com/can1357/oh-my-pi/blob/main/docs/tools/task.md#flow) — “`idle` agents are parked after `task.agentIdleTtlMs`”

Writing to `agent://<id>` is the agent-facing steering/follow-up path; messaging a parked or killed agent revives it. `agent://<id>` otherwise resolves the saved final-output artifact, not the live transcript. Before that artifact exists, a registered agent resolves to its current status, submitted `yield` payloads, and latest assistant text. `history://<id>` reads a concise transcript, including for live and parked agents; bare `history://` lists registered and retained transcripts.

[S002 §Related surfaces](https://github.com/can1357/oh-my-pi/blob/main/docs/agent-hub.md#related-surfaces) — “`history://<id>` gives the coding agent a concise transcript for a live/parked subagent or a retained on-disk transcript.”

[S002 §Related surfaces](https://github.com/can1357/oh-my-pi/blob/main/docs/agent-hub.md#related-surfaces) — “`agent://<id>` resolves a subagent's saved final output artifact; it is not the live transcript.”

[S002 §Related surfaces](https://github.com/can1357/oh-my-pi/blob/main/docs/agent-hub.md#related-surfaces) — “Messaging a parked or killed subagent revives it.”

Do not confuse job cancellation with agent lifecycle: `/jobs kill` cancels asynchronous tool jobs. Hub `x` or the agent-specific release path kills/releases an agent session. The Hub's activity and transcript are the human-facing inspection surface; `agent://` is output, `history://` is transcript.

## Agent discovery precedence

At runtime the documented precedence is nearest project `.omp/agents`, user agent directory, enabled OMP extension package roots, enabled Claude marketplace plugin roots, then bundled agents. For OMP extension roots, explicit CLI/SDK roots precede the session's effective `extensions:` list in configured order, then installed npm/link plugins. Claude marketplace project roots precede user roots; bundled agents are last.

[S003 §Discovery inputs and precedence](https://github.com/can1357/oh-my-pi/blob/main/docs/task-agent-discovery.md#discovery-inputs-and-precedence) — “Nearest project `.omp/agents` dir from `findAllNearestProjectConfigDirs` (first `.omp` hit only)”

[S003 §Discovery inputs and precedence](https://github.com/can1357/oh-my-pi/blob/main/docs/task-agent-discovery.md#discovery-inputs-and-precedence) — “User `.omp/agents` dir from `getConfigDirs("agents", { project: false })` (first `.omp` hit only)”

[S003 §Discovery inputs and precedence](https://github.com/can1357/oh-my-pi/blob/main/docs/task-agent-discovery.md#discovery-inputs-and-precedence) — “explicit CLI `--extension` / SDK `additionalExtensionPaths` directory roots”

[S003 §Discovery inputs and precedence](https://github.com/can1357/oh-my-pi/blob/main/docs/task-agent-discovery.md#discovery-inputs-and-precedence) — “installed npm/link plugins”

Discovery uses first-wins de-duplication by exact `agent.name`: project definitions override user definitions, earlier extension roots win, then marketplace/bundled names; name comparison is case-sensitive. Files within each directory are read in lexicographic filename order. Direct `.claude/agents`, `.codex/agents`, and `.gemini/agents` roots are excluded; their schemas are not OMP task-agent definitions.

[S003 §Merge and collision rules](https://github.com/can1357/oh-my-pi/blob/main/docs/task-agent-discovery.md#merge-and-collision-rules) — “Discovery uses first-wins dedup by exact `agent.name`”

[S003 §Merge and collision rules](https://github.com/can1357/oh-my-pi/blob/main/docs/task-agent-discovery.md#merge-and-collision-rules) — “Name matching is case-sensitive (`Task` and `task` are distinct).”

[S003 §Filesystem and plugin discovery](https://github.com/can1357/oh-my-pi/blob/main/docs/task-agent-discovery.md#filesystem-and-plugin-discovery) — “Direct cross-harness roots such as `.claude/agents`, `.codex/agents`, and `.gemini/agents` are intentionally skipped”

Task-tool description discovery is memoized by resolved working directory and effective extension roots; execution reloads settings and rediscovers agents, so the runtime set can change from what the earlier description listed. Lookup is exact-name; an omitted `agent` defaults to `task` in unrestricted sessions, or the first name allowed by a restricted parent's `spawns` list.

[S001 §Flow](https://github.com/can1357/oh-my-pi/blob/main/docs/tools/task.md#flow) — “Shared policy resolution reloads settings and rediscovers agents from disk”

[S003 §Agent lookup and selection](https://github.com/can1357/oh-my-pi/blob/main/docs/task-agent-discovery.md#agent-lookup-and-selection) — “Lookup is exact-name linear search”

### Documentation path discrepancy

The task document's precedence summary spells the user root `.omp/agent/agents`, while discovery's detailed precedence says user `.omp/agents`; its role-backed example spells `~/.omp/agent/agents/*.md`. The docs do not explicitly explain how these names map to `getConfigDirs`. Treat equivalence as UNKNOWN rather than normalizing the paths silently.

[S001 §Modes / Variants](https://github.com/can1357/oh-my-pi/blob/main/docs/tools/task.md#modes--variants) — “user `.omp/agent/agents`”

[S003 §Discovery inputs and precedence](https://github.com/can1357/oh-my-pi/blob/main/docs/task-agent-discovery.md#discovery-inputs-and-precedence) — “User `.omp/agents` dir from `getConfigDirs`”

[S003 §Role-backed custom agents](https://github.com/can1357/oh-my-pi/blob/main/docs/task-agent-discovery.md#role-backed-custom-agents) — “`~/.omp/agent/agents/*.md`”

## What the lane's notes rely on

| Contract fact | Existing lane note | Alignment, mismatch, or UNKNOWN |
|---|---|---|
| Swarm spawns use one batch of `{context, tasks}` and resumed lanes use `write agent://<id>`. | corpus/knowledge/dispatch-shapes.md:8; corpus/knowledge/swarm-wave-lifecycle.md:65-68 | Shape aligns with the task batch contract. The lane note does not specify which lifecycle state each resume message targets. |
| A wave's spawn and resume members share the ufo lane ceiling. | corpus/knowledge/swarm-wave-lifecycle.md:41-44; corpus/knowledge/dispatch-shapes.md:13-15 | The ufo wave ceiling (100 lanes) is not the OMP session semaphore default (`task.maxConcurrency=32`). `[INFERENCE]` Those are different policy layers; a 100-member wave does not establish 100 simultaneous OMP `SpawnRun`s. The effective live OMP setting is UNKNOWN. |
| Native launch asks Main to batch all proposal seats and has a nested labrat item. | corpus/knowledge/native-trial-launch.md:140-144 | The labrat example does not show `solutionSpace`, while OMP documents it as schema-required but says blank/missing values fall back under lenient validation. Actual dispatched bytes are UNKNOWN; the note excerpt does not prove omission from the runtime payload. |
| Native work is run under frozen topology; the lane's table distinguishes task/Hub from the sole judge path. | corpus/knowledge/native-trial-launch.md:138-144; corpus/knowledge/dispatch-shapes.md:10,20-22 | These lane notes do not state effective OMP recursion depth, idle TTL, or Hub resume state. They neither contradict nor verify those settings: UNKNOWN for any specific native-trial run. |

The ufo counts and ceilings above describe lane policy, not observed OMP capacity. No host settings or active Hub roster were inspected for this entry.

## Version skew

The documentation is upstream `main` at the path-specific commits in the verified-at header; the installed host reports `omp/18.12.3` (S004). This is a docs-versus-installed-version boundary: the binary's version was observed, but its implementation was not inspected, so no claim is made that every current `main` default or lifecycle behavior matches that binary. `[INFERENCE]` Version skew is possible; a version-to-commit mapping is UNKNOWN. No omp:// harness documentation was used.

S004 — `omp --version` on this host; stdout `omp/18.12.3`, observed 2026-10-19.

## Sources

- S001 — OMP task tool docs: https://github.com/can1357/oh-my-pi/blob/main/docs/tools/task.md; anchors `#inputs`, `#flow`, `#modes--variants`, `#limits--caps`, `#notes`. Latest commit touching this path is recorded in the path query result. Path result object ID: 01a4cb31528a2f01b951959e00e5eff547b24929, 2026-10-19T17:18:07Z.
- S002 — OMP Agent Hub docs: https://github.com/can1357/oh-my-pi/blob/main/docs/agent-hub.md; anchors `#roster-and-inspector`, `#read-and-steer-a-subagent`, `#related-surfaces`, `#persisted-agents-and-advisors`. Latest commit touching this path is recorded in the path query result. Path result object ID: ae29413e870eb186a342b1f9a16e41b65c9d3ed6, 2026-10-19T12:20:43Z.
- S003 — OMP task agent discovery docs: https://github.com/can1357/oh-my-pi/blob/main/docs/task-agent-discovery.md; anchors `#role-backed-custom-agents`, `#discovery-inputs-and-precedence`, `#merge-and-collision-rules`, `#agent-lookup-and-selection`. Latest commit touching this path is recorded in the path query result. Path result object ID: 2b4e9121fecf0c7ab6daba7cc18cb01325578fe3, 2026-10-14T16:40:06Z.
- S004 — `omp --version` on this host; stdout `omp/18.12.3`, observed 2026-10-19.

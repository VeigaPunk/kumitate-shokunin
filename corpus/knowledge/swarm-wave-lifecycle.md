# Swarm wave lifecycle — plan → run → record → settle → collect

Verbs (`scripts/ufo-swarm-wave.mjs` header):

- `plan` validates a spec (`--spec file|-` or `--spec-json`) and emits
  `ufo-swarm-wave-v1`; `--emit-tasks` prints only the task payload. Template
  waves may hoist the shared template into batch `context` when savings ≥
  `MIN_HOIST_SAVINGS`; bypass reason recorded in `plan.compaction`.
- `run` emits `ufo-swarm-wave-dispatch-v1` = `{taskCall|null, resumeSends}`
  and persists in ONE critical section the pair:
  `swarm-registry.json` (`ufo-swarm-registry-v1`, `{name → {agentId, item,
  role}}`, merged across waves) at `reportDir/` or `.ufo/scopes/<wave>/`,
  plus `swarm-dispatch.json` (byte-identical payload copy, REPLACED
  wholesale each run). Published sidecar-first → a crash can leave NEW
  dispatch beside OLD registry.
- `record --registry --assignments` fills `agentId`s post-dispatch so a
  later wave can `resume` by name.
- `settle` is the wave-crash recovery producer (added after the
  `unmapped_member` deadlock): emits `ufo-swarm-results-v1` for EVERY
  registry member — operator rows via `--results`, else `cancelled`
  ("wave interrupted before settlement" → outcome `aborted`). Absence
  never mints `failed`.

Collector (`scripts/ufo-swarm-collect.mjs`): joins results onto dispatch,
emits `ufo-mission-result-v1` (+ optional `<agent_swarm_result>` XML).
Pair check first when a registry is in play: wave-label mismatch or a
dispatch member the registry can't cover → `stale_dispatch_pair`, exit 1,
zero envelope bytes. Bounded v1 claim: FIELD equality, not same-invocation
provenance (no generation token exists).

Resume lanes are fail-closed: `agentId` must exist in this wave's registry
or a declared `spec.priorRegistry`, else `resume_unknown_member`.

Sources: `scripts/ufo-swarm-wave.mjs` header (plan/run/record/settle
paragraphs); `scripts/ufo-swarm-collect.mjs` header (inputs, pair check).

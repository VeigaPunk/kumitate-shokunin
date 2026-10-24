# Swarm wave lifecycle — registry family S3 (2 of 2 members named)

> **Round-35 fidelity notice (2026-10-20).** The upstream tree moved from
> `964f443e` to `31c465f1`. Round-35 fidelity seats found 24 line anchors in this
> note that no longer land on their claim at `31c465f1` (moved, changed or gone;
> several were already off at the revision their section names). Anchors below
> are true only at the revision each section states; the member sections still
> pass the claims gate, which checks anchor liveness, not symbol-on-line.
> Re-anchoring is queued (SCORECARD.md `## Limits`, round 35); per-anchor
> findings are in the lane's round-35 wave reports (build directory, Fid*).

**Family:** S3 (registry `SCORECARD.md`), swarm path. **Live membership** at
origin HEAD `964f443e` (`/home/vgpnk/Projects/ufo-fsd-alpha`), measured by:

```
$ ls -1 scripts/ufo-swarm-wave.mjs scripts/ufo-swarm-collect.mjs | LC_ALL=C sort
scripts/ufo-swarm-collect.mjs
scripts/ufo-swarm-wave.mjs
$ wc -l scripts/ufo-swarm-wave.mjs scripts/ufo-swarm-collect.mjs
 1907 scripts/ufo-swarm-wave.mjs
  842 scripts/ufo-swarm-collect.mjs
 2749 total
```

`comm -3` of the declared pair against the live pair is empty (both sides
`LC_ALL=C sort`). Declared count the row must carry: **2**. The companion
suites `ufo-swarm-wave.test.mjs` / `ufo-swarm-collect.test.mjs` are **S8**
remainder members (each already has a `##` section in
`knowledge/remaining-scripts-census.md`) — never widen S3 to absorb them.

One `##` section per member below, each with an own-file anchor and a
verbatim symbol. Sister note `knowledge/dispatch-shapes.md` stays the
comparative shape table (swarm vs sighting vs native vs fixture) and is
deliberately **not** sectionized here so the claims/proxy occurrence
numerator does not double-count the same two paths.

**Round-32 re-census errata (topic prose corrected, not a member removal):**
the prior topic-form body claimed a wave CLI verb `settle` and a collector
refusal code `stale_dispatch_pair`. Live `main` admits only `plan` / `run` /
`record` (`scripts/ufo-swarm-wave.mjs:1801`–`:1807`); settlement is operator-
supplied `ufo-swarm-results-v1` input to collect. Live collect has no
`stale_dispatch_pair` token — join refusals are `unmapped_member` /
`unexpected_member` / identity conflicts inside `collectEntries`. No member
section was removed: the pre-round note carried **zero** `##` member
headings (topic-form, `ROW_NO_SECTIONS`).

## `scripts/ufo-swarm-wave.mjs`

**Owning surface.** Plan / run / record CLI for one OMP-native swarm wave
(1907 L). Header contract (`scripts/ufo-swarm-wave.mjs:3`–`:40`): one batched
`task` call per wave; spawn+resume together ≤ 100 lanes; pairwise-distinct
`{{item}}` expansions; resume preserves identity; ten taxonomy roles only;
no per-lane `model` param.

**Schema constants** (`scripts/ufo-swarm-wave.mjs:143`–`:146`):
`SWARM_WAVE_SCHEMA` = `ufo-swarm-wave-v1`, `SWARM_WAVE_ERROR_SCHEMA`,
`SWARM_DISPATCH_SCHEMA` = `ufo-swarm-wave-dispatch-v1`,
`SWARM_REGISTRY_SCHEMA` = `ufo-swarm-registry-v1`. Hard ceiling and band
floors are imported from the hub as `MAX_SWARM_LANES` / `MIN_SWARM_LANES`
(`scripts/ufo-swarm-wave.mjs:120`) — never restated.

**Role vocabulary.** `SWARM_ROLES` (`scripts/ufo-swarm-wave.mjs:131`) is the
exported closed set: `scout`, `reviewer`, `critic`, `connector`, `sentinel`,
`executor`, `mutation-tester`, `revenger`, `simplifier`, `scribe`. Planner /
distiller / labrat / Main are frozen-topology seats, not swarm lanes.

**Plan core.** `planSwarmWave` (`scripts/ufo-swarm-wave.mjs:744`) validates
the spec object against `SPEC_KEYS`, clamps policy through the hard 100
ceiling, expands template items, refuses `resume_unknown_member` when a
resume id is absent from this wave's registry and every
`spec.priorRegistry`, and records hoist telemetry under `plan.compaction`
when savings meet `MIN_HOIST_SAVINGS` = 512 (`scripts/ufo-swarm-wave.mjs:77`).

**Dispatch split.** `planToDispatchPayload` (`scripts/ufo-swarm-wave.mjs:1282`)
emits `{schema, wave, policy, counts, registry, taskCall|null, resumeSends}`:
spawn lanes become one `taskCall = {context, tasks}`; resume lanes become
`resumeSends` only. Resume-only waves set `taskCall: null`.

**Registry persistence.** `persistWaveRegistry` (`scripts/ufo-swarm-wave.mjs:609`)
runs under `withRegistryLock` on `run`: writes `ufo-swarm-registry-v1`
`{name → {agentId, item, role, …}}`, refuses cross-wave
`wave_registry_collision` when a different wave identity would displace
live handles, and surfaces same-wave `handlesReset` on the payload.

**CLI surface.** `main` (`scripts/ufo-swarm-wave.mjs:610`) accepts only
`record` (via `mainRecord`) or `plan`/`run`. Usage string
(`scripts/ufo-swarm-wave.mjs:1355`) names the three verbs; there is no
`settle` arm. `run` calls `persistWaveRegistry` then
`planToDispatchPayload`; `plan` emits the plan (or tasks under
`--emit-tasks`). Godspeed lane prefix is `GODSPEED_INVOCATION`
(`/skill:godspeed` at `scripts/ufo-swarm-wave.mjs:160`) with terminal
marker `GODSPEED_MARKER` (`scripts/ufo-swarm-wave.mjs:155`).

**Export surface** (header comment at `scripts/ufo-swarm-wave.mjs:141`):
`SWARM_ROLES`, `SwarmWaveError`, `planSwarmWave`, `planToDispatchPayload`,
`withPriorRefinement`, `waveRoutePreflight`, `persistWaveRegistry`.

## `scripts/ufo-swarm-collect.mjs`

**Owning surface.** Bridge from settled wave member outcomes into the
`ufo-mission-result-v1` evidence envelope (842 L). Header
(`scripts/ufo-swarm-collect.mjs:3`–`:12`): evidence for L1/L0 only —
**never a judge input and never a handoff path**. Sole CLI verb is
`collect` (`scripts/ufo-swarm-collect.mjs:3`).

**Input schemas** (`scripts/ufo-swarm-collect.mjs:54`–`:58`):
`RESULTS_SCHEMA` = `ufo-swarm-results-v1`, `REGISTRY_SCHEMA` =
`ufo-swarm-registry-v1`, `DISPATCH_SCHEMA` = `ufo-swarm-wave-dispatch-v1`,
`PLAN_SCHEMA` = `ufo-swarm-wave-v1`, `ERROR_SCHEMA` =
`ufo-swarm-collect-error-v1`. Byte caps: `MAX_INPUT_BYTES` 4 MiB,
`MAX_REGISTRY_BYTES` 1 MiB (parity with the wave-side authority at
`scripts/ufo-swarm-collect.mjs:71`).

**Status → outcome map.** `STATUS_OUTCOME` (`scripts/ufo-swarm-collect.mjs:93`)
freezes: `completed→completed`, `failed→failed`, `timeout→failed`,
`cancelled|canceled|aborted→aborted`. Typed causes ride
`FAILURE_CLASS_REASON` (`scripts/ufo-swarm-collect.mjs:111`):
`rate_limit`, `usage_limit`, `model_unavailable`, `lane_timeout`,
`process_exit`, `unavailable`, `quality_degraded` — stopReason fallback
only; never rewrite the outcome.

**Join.** `collectEntries` (`scripts/ufo-swarm-collect.mjs:540`) requires
every dispatch member to have exactly one results row and every results
row to name a dispatch member: missing → `unmapped_member`
(`scripts/ufo-swarm-collect.mjs:549`); extra → `unexpected_member`
(`scripts/ufo-swarm-collect.mjs:576`); duplicate wave names →
`duplicate_member`. Identity evidence precedence is registry > results >
resume-derived (`soleEvidence`). Conflicting agentId/item evidence fails
closed; a member whose outcome the inputs cannot name is never invented.

**main spine** (`scripts/ufo-swarm-collect.mjs:659`): parse declared argv →
read wave/results/(optional registry) → `waveMembers` + `resultsMembers` +
`registryMembers` → `collectEntries` → `createMissionResult` envelope →
optional `--emit-xml` `<agent_swarm_result>` via `writeFilePairAtomic`.
Exit 0 success, 1 typed `SwarmCollectError` (`scripts/ufo-swarm-collect.mjs:121`),
64 usage. Registry default path is the wave record's own `registry.path`,
gated through `beneath` / `ALLOW_EXTERNAL_TOOLS` so artifact bytes cannot
path-inject outside the root.

Sources: `scripts/ufo-swarm-wave.mjs`; `scripts/ufo-swarm-collect.mjs`.

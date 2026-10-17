# kumitate-shokunin — orchestration & tooling

**Pick the dispatch shape by what the work needs, not by convenience.
Never let a swarm lane enter a judged handoff.**

This is a [shokunin](https://github.com/VeigaPunk/shokunin) lane for
OMP task / hub dispatch, UFO-FSD scripts, and the runtime that
surrounds them. Rank: shonen.

Kumitate owns *how work is launched and judged*. It does not own
whether the fleet is alive (that is
[mori](https://github.com/VeigaPunk/mori-shokunin)), whether a host
unit is healthy (that is
[tsukuroi](https://github.com/VeigaPunk/tsukuroi-shokunin)), or whether
an endpoint is the expected model (that is
[kama](https://github.com/VeigaPunk/kama-shokunin)).

Every rule in `SKILL.md` cites a file in the origin tree or names the
session prompt. Nothing here is oral knowledge. Domain source trees
are read-only for this lane.

## Province

**Owns:** orchestration & tooling — OMP task / hub, UFO-FSD scripts and
runtime; the three dispatch shapes and their ceilings; the lane-local
round-close pre-check; surface / claims / cite / proxy probes.

**Refuses:** anything outside this domain. Report cross-domain evidence
back to the orchestrator. A green `round-gate` asserts nothing
fleet-wide and does not complete a mission.

Full boundary: [`PROVINCE.md`](PROVINCE.md).

## Dispatch shapes

From `SKILL.md` — pick by need, not convenience:

| Shape | When | Judgment |
|---|---|---|
| **Swarm wave** (`ufo-swarm-wave.mjs`) | Unjudged fleet work: recon, parallel audits, item-per-lane sweeps | None — advisory evidence only. Swarm lanes never enter a `NativeRoundHandoff` |
| **Sighting mission** (`ufo-sighting`) | Operator-visible lifecycle against the tmux wall | Display / registration state only — never orchestration authority |
| **Native judged round** (`run-omp-native-trial.mjs` + `collect-omp-native-handoff.mjs`) | The only path whose output is judged | `ufo judge-handoff` — sole judge |

Ceilings and refusal rules live in the cited scripts, not in this
README. Re-read them before a wave.

## Start here

1. [`SKILL.md`](SKILL.md) — dispatch-shape table, ceilings, failure taxonomy.
2. [`PROVINCE.md`](PROVINCE.md) — owned domain and refusals.
3. [`scripts/`](scripts/) — lane-local gates.

## Lane gates

```
node scripts/round-gate.mjs --selftest
node scripts/round-gate.mjs                  # audit this lane's current round artifacts
node scripts/claims-check.mjs
node scripts/cite-check.mjs
node scripts/surface-probe.mjs
node scripts/proxy-check.mjs
node scripts/kimi-census.mjs
```

`round-gate.mjs` (`kumitate-round-gate-v1`) is a pre-check of the
fleet round-close contract for **one** lane (default `kumitate`). Fleet
report-conformance authority stays with the integrator in the shokunin
main repo (`PROTOCOL.md`). `--selftest` wins over `--close` over the
default audit.

## What's in the repo

```
kumitate-shokunin/
├── SKILL.md          dispatch playbook
├── PROVINCE.md       domain boundary
├── SHONEN.md         promotion checklist
├── LOG.md            append-only audit trail
├── SCORECARD.md      axis verdicts
├── AGENTS.md         operating rules
├── scripts/          round-gate, claims-check, cite-check, surface-probe, proxy-check, kimi-census
└── corpus/           knowledge/, lessons/, QUALITY.md
```

Protocol: append-only corpus; every claim separates observation /
inference / unknown; rounds are non-author-verified. See the fleet
[README](https://github.com/VeigaPunk/shokunin#readme) for how a lane
learns.

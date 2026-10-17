# kumitate-shokunin — 組立

**Orchestration and tooling.** Which dispatch shape the work actually
needs — swarm wave, sighting mission, or native judged round — and the
scripts that keep those shapes from collapsing into each other.

A **shokunin lane**: an expert agent for one domain, minted and trained
under the [shokunin skill](https://github.com/VeigaPunk/shokunin).
Rank: **shonen**. Promotion is a named non-author review of
[`SHONEN.md`](SHONEN.md), never self-attestation.

This lane answers: *how should this work be launched, and which of those
paths is allowed to produce a verdict?*

## Domain

From [`PROVINCE.md`](PROVINCE.md): OMP task/hub dispatch, UFO-FSD
scripts, and the `ufo-core-runtime` plane. Three dispatch shapes exist
in [`SKILL.md`](SKILL.md); pick by what the work needs, not convenience:

| Shape | When | Judgment |
|---|---|---|
| Swarm wave | cheap parallel probes | never — advisory evidence only |
| Sighting mission | operator-visible lifecycle on the tmux wall | display/registration only |
| Native judged round | the output must be judged | the only path into `ufo judge-handoff` |

Need a verdict? Only the native judged round produces one. Swarm output
is never a handoff.

**Refuses** secrets (kagi), endpoint identity (kama), model quality
(kengaku), bounty claim packaging (kasegi). Out of province → report,
never absorb.

## What's here

| Path | Role |
|---|---|
| [`SKILL.md`](SKILL.md) | dispatch-shape table, script vocabulary, ceilings |
| [`PROVINCE.md`](PROVINCE.md) | domain boundary |
| [`scripts/round-gate.mjs`](scripts/round-gate.mjs) | lane-local pre-check of the fleet round-close contract |
| [`scripts/cite-check.mjs`](scripts/cite-check.mjs) [`scripts/claims-check.mjs`](scripts/claims-check.mjs) [`scripts/kimi-census.mjs`](scripts/kimi-census.mjs) [`scripts/proxy-check.mjs`](scripts/proxy-check.mjs) [`scripts/surface-probe.mjs`](scripts/surface-probe.mjs) | in-repo gates |
| [`corpus/`](corpus/) | knowledge and lessons |
| [`SCORECARD.md`](SCORECARD.md) · [`LOG.md`](LOG.md) · [`SHONEN.md`](SHONEN.md) | axes, trail, promotion |

## The gate

```sh
node scripts/round-gate.mjs --selftest
node scripts/round-gate.mjs --round N
```

`round-gate.mjs` grades **this lane's** round artifacts. It is not fleet
report-conformance authority — that stays the integrator's step in the
shokunin main repo.

## How a lane learns

Append-only corpus; every claim separates observation / inference /
unknown; rounds are non-author-verified. See the fleet
[README](https://github.com/VeigaPunk/shokunin#readme).

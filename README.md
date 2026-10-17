# kumitate-shokunin — 組み立て

**Orchestration and tooling** — OMP task/hub dispatch, UFO-FSD scripts,
and the runtime that turns a wave into processes.

Kumitate owns *how work is launched and collected*, not what the work
means. A swarm wave is advisory evidence. A sighting mission is
visibility. Only a native judged round produces a verdict.

This is a **shokunin lane** of the [shokunin fleet](https://github.com/VeigaPunk/shokunin).
Rank: **shonen**.

## The craft

Three dispatch shapes (`SKILL.md`). Pick by what the work needs:

| Shape | When | Judgment |
|---|---|---|
| **Swarm wave** (`ufo-swarm-wave.mjs`) | cheap parallel probes, no verdict | none — never a `NativeRoundHandoff` |
| **Sighting mission** (`ufo-sighting`) | launch / register / resume / steer / peek / complete on the tmux wall | display state only |
| **Native judged round** (`run-omp-native-trial.mjs` + handoff collect) | the only path whose output is judged | `ufo judge-handoff` — sole judge |

Need a verdict? Only the native judged round. Need visibility? Sighting,
orthogonal to dispatch shape. Need many cheap probes? Swarm. A judged
round's wave is **frozen topology** — never improvise seats into it.

This lane also keeps executable gates over its own claims, citations,
proxy surfaces, and round-close hygiene (`scripts/*-check.mjs`).

## Province

Owns: orchestration & tooling — OMP task/hub, ufo-fsd scripts & runtime.

**Refuses:** model quality (kengaku), endpoint identity (kama), secrets
(kagi), bounty mission-state (kasegi), skill-file craft (kotoba), OS
repair (tsukuroi), fleet *liveness observation* (mori — complementary,
not overlapping). Out of province → report, never absorb.

See [`PROVINCE.md`](PROVINCE.md).

## What's in this repository

```
kumitate-shokunin/
├── SKILL.md              dispatch-shape table, script vocabulary, ceilings
├── PROVINCE.md
├── SHONEN.md
├── LOG.md
├── SCORECARD.md
├── AGENTS.md
├── scripts/
│   ├── cite-check.mjs
│   ├── claims-check.mjs
│   ├── kimi-census.mjs
│   ├── proxy-check.mjs
│   ├── round-gate.mjs
│   └── surface-probe.mjs
└── corpus/
    ├── knowledge/        including runtime-support, cost-and-profile, distill-and-l3
    └── lessons/
```

## Start here

```sh
node scripts/round-gate.mjs
node scripts/cite-check.mjs
node scripts/claims-check.mjs
node scripts/proxy-check.mjs
```

These gates test *this repo's* claimed surfaces and citations. They do
not dispatch a UFO wave. Read [`SKILL.md`](SKILL.md) before touching a
host script path — several origin trees have moved or gone absent, and
the skill names which citations are historical.

## How a round works

One axis-move, typically operability + coverage. Lane identity:
`kumitate-shokunin <kumitate@shokunin.local>`.

## Fleet

[VeigaPunk/shokunin](https://github.com/VeigaPunk/shokunin) ·
[kimi-shokunin](https://github.com/VeigaPunk/kimi-shokunin)

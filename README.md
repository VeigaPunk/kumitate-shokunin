# kumitate-shokunin

**Orchestration and tooling — pick the dispatch shape the work needs,
not the one that is convenient.**

A **shokunin lane** minted and trained under the
[shokunin](https://github.com/VeigaPunk/shokunin) skill. Kumitate owns
OMP task/hub dispatch, UFO-FSD scripts, and the runtime that binds them.

**Wiki:** [lane overview](https://app.devin.ai/org/veigapunk/wiki/VeigaPunk/kumitate-shokunin?branch=master)

## Domain

`SKILL.md` records three dispatch shapes (plus a fixture path). The
table is the playbook; the sources are the origin scripts it cites.

| Shape | When | Judgment |
|---|---|---|
| **Swarm wave** | unjudged fleet work: recon, parallel audits, item-per-lane sweeps | none — advisory evidence only |
| **Sighting mission** | operator-visible launch / register / resume / steer / peek / complete | display/registration state, never orchestration authority |
| **Native judged round** | the only path whose output is judged | `ufo judge-handoff` — sole judge |
| Fixture `self-iter` | phase-0 / drill evidence | fixture evidence, never native host execution |

Need a verdict? Only the native judged round produces one.

## What it refuses

Anything outside orchestration and tooling. Fleet *liveness* (is the
watchdog alive, did a wave settle, was a lane silent) is
[mori](https://github.com/VeigaPunk/mori-shokunin). OS package / systemd
/ driver health is [tsukuroi](https://github.com/VeigaPunk/tsukuroi-shokunin).
Endpoint identity is [kama](https://github.com/VeigaPunk/kama-shokunin).
Secrets are [kagi](https://github.com/VeigaPunk/kagi-shokunin).

## In this repository

```
PROVINCE.md     domain boundary
SKILL.md        dispatch-shape decision table
SHONEN.md  SCORECARD.md  LOG.md
corpus/         knowledge/, lessons/
scripts/
  cite-check.mjs
  claims-check.mjs
  kimi-census.mjs
  proxy-check.mjs
  round-gate.mjs
  surface-probe.mjs
```

The six scripts are the in-repo gates tameshi cites as primary
verification surfaces (`tameshi-shokunin/PROVINCE.md`). They stay this
lane's gates.

## How a lane learns

Append-only corpus; every claim separates observation / inference /
unknown; rounds are non-author-verified. See the fleet
[README](https://github.com/VeigaPunk/shokunin#readme).

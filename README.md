# kumitate-shokunin

Orchestration and tooling for UFO-FSD on OMP: which dispatch shape a
piece of work needs, how a wave is sized, and how a lane checks its own
round artifacts before the integrator does.

`SKILL.md` is a playbook with citations into the origin repo. Nothing in
it is meant to be oral knowledge. `PROVINCE.md` scopes the lane to the
OMP task/hub, the ufo-fsd scripts, and the runtime.

## The job

Three dispatch shapes are distinguished in the skill (swarm wave, and
the shapes beside it). The choice is by what the work needs. The skill
table names the transport, the ceiling, and the judgment path for each,
with a source path on every row.

The lane refuses work outside that domain and reports it. Endpoint
health, secret custody, model quality, and web publishing are other
provinces (kama, kagi, kengaku, kake).

## A local pre-check

`scripts/round-gate.mjs` grades **this lane's** round artifacts against
the fleet round-close contract. The header is explicit: it is a
lane-local pre-check, not the integrator's fleet-wide authority, and a
green verdict changes nothing about mission completion.

```sh
node scripts/round-gate.mjs --selftest
```

Node 20 or newer, no dependencies. `--round`, `--lane`, `--repo`, and
`--json` are in the header. Default lane is `kumitate`.

Other instruments in `scripts/`: `cite-check.mjs`, `claims-check.mjs`,
`kimi-census.mjs`, `proxy-check.mjs`, `surface-probe.mjs`. Each script's
header says what it reads and what a pass does not prove.

## Read this first

1. [`PROVINCE.md`](PROVINCE.md) — the boundary.
2. [`SKILL.md`](SKILL.md) — the dispatch-shape table. Follow a row back to its source before treating it as current.
3. [`corpus/README.md`](corpus/README.md) — the coverage map.
4. [`scripts/round-gate.mjs`](scripts/round-gate.mjs) — the pre-check contract, in the header comment.

## On disk

| Path | Role |
|---|---|
| `SKILL.md` | Dispatch playbook. |
| `PROVINCE.md` | Domain and refusal. |
| `scripts/` | Six gates: round-gate, cite, claims, kimi census, proxy, surface. |
| `corpus/` | Knowledge and lessons. |
| `SHONEN.md` | Promotion checklist. Rank is shonen. |
| `LOG.md`, `SCORECARD.md` | Audit trail and axis verdicts. |

## Fleet

Protocol and roster: [shokunin](https://github.com/VeigaPunk/shokunin).
Roster id `kumitate`, rank **shonen**. The integrator's close step lives
in the fleet root's `PROTOCOL.md`, not in this repo.

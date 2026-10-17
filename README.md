# kumitate-shokunin

Orchestration and tooling — how a wave is planned, dispatched, settled,
and refused.

Kumitate's subject is the OMP task/hub path and the ufo-fsd scripts and
runtime that carry it: dispatch shapes, route resolution, queue ownership,
the native judge, the loop driver. The sources it cites live in the
origin tree named by `corpus/README.md`
(`/home/vgpnk/Projects/origin-work/ufo-fsd-alpha` unless a note says
otherwise). This repository holds the map, the pins, and the checks. It
does not hold that tree.

Rank: **shonen**. `SHONEN.md` is still here. Registered in the fleet
`MANIFEST.json` roster since 2026-09-28.

## Province

**Owns.** Orchestration and tooling: OMP task/hub, ufo-fsd scripts, and
`crates/ufo-core-runtime`, plus the knowledge and checklists for that
surface.

**Hands off.** Anything outside it. Cross-domain evidence is reported.
The lane's own lesson on the membrane-seal defect is the precedent: a
finding with no owning repo stays reported, and is not absorbed here to
give it a home.

## Start here

1. `corpus/README.md` — the coverage map. Read it as a table of contents
   with primary-source pointers.
2. `SKILL.md` — the distilled decisions. `cite-check` re-resolves the
   pointers in this file and under `corpus/`.
3. `scripts/` — the six gates.
4. `SCORECARD.md` — operability and coverage are the owned axes. Every
   count in the card names its command. The baseline header names the
   lane commit and the origin-tree commit it was measured against.
5. `LOG.md` — append-only.

## Run a check

From the repository root, against the origin tree the corpus names:

```sh
node scripts/cite-check.mjs --selftest
node scripts/cite-check.mjs
```

`--selftest` runs the embedded fixture suite. The plain invocation
re-resolves every path, line, symbol, and pin in `SKILL.md` and
`corpus/**/*.md`. `--json` is machine output. `--strict` fails on
warnings. The other gates — `claims-check.mjs`, `kimi-census.mjs`,
`proxy-check.mjs`, `round-gate.mjs`, `surface-probe.mjs` — each carry
their own header. Read it before you treat an exit code as a fleet
emergency.

## The tree

| Path | What it is |
|---|---|
| `scripts/` | Citation, claims, census, proxy, round, and surface gates |
| `corpus/knowledge/` | One note per machinery surface |
| `corpus/lessons/` | Per-round method notes and audits |
| `SKILL.md` | The playbook the citation gate checks |

## Fleet

Minted under [shokunin](https://github.com/VeigaPunk/shokunin).

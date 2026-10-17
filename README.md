# kumitate-shokunin — orchestration and tooling

The question this lane answers is how OMP task and hub dispatch, and the ufo-fsd scripts and runtime, actually behave (`PROVINCE.md`).

**Rank:** `SKILL.md` is the executable layer. `SHONEN.md` is a promotion checklist and every box is `[ ]`. That is not a promotion.

## Owns / refuses

Owns the domain knowledge, playbooks, error patterns, and checklists for orchestration and tooling (`PROVINCE.md`). The corpus header names OMP task/hub dispatch, ufo-fsd scripts, and `crates/ufo-core-runtime`.

Refuses anything outside that domain. Cross-domain evidence is reported to the orchestrator, not absorbed.

## Start here

`scripts/cite-check.mjs` re-resolves path, line, symbol, and pin citations in `SKILL.md` and `corpus/**/*.md`. The header says it is read-only, has zero dependencies, and needs node 20 or newer. The usage text in that file includes `-h, --help`.

```sh
node scripts/cite-check.mjs --help
node scripts/cite-check.mjs --selftest
```

Documented flags in the same usage block: `--src`, `--self`, `--fleet`, `--json`, `--strict`, `--symbols`, `--all`, `--selftest` or `--self-test`, `--integrations`. The default run reads the live trees those flags name. `--selftest` is the embedded fixture suite (`corpus/README.md`).

Same directory, from their headers: `node scripts/proxy-check.mjs --selftest`, `node scripts/round-gate.mjs --selftest`, `node scripts/surface-probe.mjs --selftest`. `round-gate.mjs` grades this lane's own round artifacts. A green verdict is not a fleet-wide claim (header, citing the fleet protocol's integrator step).

## How to read the corpus

`corpus/README.md` opens with the cite-check command, then the coverage map. It is line-cited (`corpus/README.md:56-129` in `corpus/knowledge/executable-scorecard.md`), so it was not reflowed. `corpus/knowledge/` holds the dispatch, route, and failure notes. `corpus/lessons/` holds round lessons.

## Map

| Path | What it is |
|---|---|
| `PROVINCE.md` | Domain boundary |
| `SKILL.md` | Decision tables and checklists |
| `SHONEN.md` | Promotion checklist, boxes unchecked |
| `LOG.md` | Append-only record |
| `SCORECARD.md` | Axis verdicts |
| `AGENTS.md` | Operating rules |
| `corpus/` | Knowledge, lessons, index |
| `scripts/` | cite-check, proxy-check, round-gate, surface-probe, and the other gates |
| `.ufo/` | Round machinery |

## Neighbors

kama owns endpoint identity, not dispatch mechanism. mori watches whether a wave is alive and refuses the dispatch mechanism. tameshi reads these gates as specimens of verification craft and does not edit them (`tameshi-shokunin/PROVINCE.md`).

Fleet protocol: [VeigaPunk/shokunin](https://github.com/VeigaPunk/shokunin).

# Dispatch shapes (ufo-fsd on OMP)

Three production dispatch shapes plus one fixture path. Choice is by need,
not convenience.

| Shape | Entry point | Transport | Judgment |
|---|---|---|---|
| Swarm wave | `scripts/ufo-swarm-wave.mjs` (`plan`/`run`) | one batched OMP `task` call + `write agent://<id>` per resume lane | advisory evidence only — never a `NativeRoundHandoff` input |
| Sighting mission | `scripts/ufo-sighting.mjs` verbs | tmux `ufo_sighting` session, one pane per L1 mission | display/registration only |
| Native judged round | `scripts/run-omp-native-trial.mjs` + `scripts/collect-omp-native-handoff.mjs` | OMP task/Hub under frozen topology | `ufo judge-handoff --input` — sole judge |
| Fixture | `ufo self-iter` (crate) | deterministic `local/fixture-primary` | fixture evidence, never native execution |

Key numbers (config `sighting.dispatch` in `config/ufo.json`):
`globalRunnerCeiling` 1056, `maxConcurrentL1` 32, `windowPaneCeiling` 16,
swarm `maxLanes` 100, `waveMinLanes` 16 / `waveMaxLanes` 100, `minLanes` 64.
Native: proposal wave 6–16 seats (`PROPOSAL_WAVE_CEILING` 16), +4 core seats
≤ 20 total, `CONCURRENCY_CEILING` 32 — `collect-omp-native-handoff-lib/
base.mjs`.

Only the native judged round yields a verdict; a swarm wave inside a judged
round is a topology violation (skill doc + `ufo-swarm-collect.mjs` header:
"never a judge input and never a handoff path").

Sources: `scripts/ufo-swarm-wave.mjs` header; `config/ufo.json` lines ~78-103;
`scripts/ufo-swarm-collect.mjs` header; `crates/ufo-cli/src/main.rs`
`Command::SelfIter`; skill `ufo` (OMP native profile / swarm waves sections).

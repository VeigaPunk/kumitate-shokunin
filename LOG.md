# kumitate-shokunin — Iteration Log

- 2026-09-28 — round 0: minted as shonen.
- 2026-09-28 — round 1: rewrote SKILL.md from seed stub into sourced
  playbook (dispatch-shape decision table, script vocabulary, failure
  telemetry, 16 cited anti-patterns); seeded corpus/ (README + 4 knowledge
  notes + lessons/round-1). Evidence: `ufo-swarm-wave.mjs` /
  `ufo-swarm-collect.mjs` / `ufo-sighting-lib/surface.mjs` /
  `fleet-dispatcher.mjs` / `run-omp-native-trial.mjs` headers,
  `ufo-mission-result.mjs` (`ENTRY_FAILURE_CLASSES`,
  `acquireSingletonLock`), `collect-omp-native-handoff-lib/base.mjs`
  constants + `classifyFailure`, `config/ufo.json` `sighting.dispatch`,
  `crates/ufo-cli/src/main.rs` command enum, installed `ufo` skill text.
  Report: `/home/vgpnk/projects/shokunin/.ufo/reports/round-1/kumitate.md`.
- 2026-09-28 — round 2: closed the `omp-global-config.mjs` gap — resolution
  precedence, live `~/.omp/agent/config.yml` alias table, fleet-map vs
  global drift record (scout→`m_flash` operator correction landed),
  dual retry surfaces. SKILL.md gained the resolver section;
  `corpus/knowledge/route-resolution.md` added. Evidence: module header +
  `resolveAliasFromMaps`/`resolveSeatFromMaps`/`readGlobalSeatRouting`,
  live config read, `run-omp-native-trial.mjs` retry-projection block.
- 2026-09-28 — round 3: mapped the fleet-dispatcher iterate-successor
  machine (`maybeEnqueueIterationSuccessor` ~L6743-7150): decision gate,
  outcome vocabulary, deterministic successor keys, defer-not-die parks,
  park epochs (r43), afterChains satisfy/starve split, admission latch
  (admissions − retractions = live count). SKILL.md dispatcher section
  expanded; `corpus/knowledge/successor-chain.md` + `lessons/round-3.md`
  added. Evidence: `fleet-dispatcher.mjs` L275-295, L5510-5525,
  L6743-7150, L7997-8110, L8313-8650.
  Report: `/home/vgpnk/projects/shokunin/.ufo/reports/round-3/kumitate.md`.

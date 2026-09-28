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
- 2026-09-28 — round 4: mapped `crates/ufo-core-runtime` — the biggest
  remaining gap. SKILL.md gained a "Core-runtime map" section
  (contract-hash fuse/registry, handoff decode, judge order, verdict +
  loop-stop vocabulary, resume posture) plus two corrections: classifier
  is `classify_failure_fields` not `classify_failure`; `ufo` exit 2 is
  every typed refusal, not only usage rejection, and `membrane-seal` was
  missing from the CLI list. Added `corpus/knowledge/
  native-judge-pipeline.md` (decode → admission order → refusal
  vocabulary → verdict fields) and `loop-driver.md` (epoch loop,
  boundary stops, checkpoint/protocol-fingerprint vocabulary);
  `lessons/round-4.md`. Evidence: `native.rs` `judge_handoff` (:470),
  `native_schema.rs` (:455/:550), `native_header.rs` (:243),
  `native_contract.rs` (:19/:41/:69), `native_plan_digest.rs` (:99/:557),
  `state.rs` (:21/:41/:380/:417), `loop_driver.rs` (:121/:347/:583),
  `loop_driver_{open,dry,resume,publish}.rs` entry points,
  `ufo-cli/src/main.rs` (:23-132, :247-355, :529-646, :906-952),
  `conformance/fixtures/native-handoff/handoff.json`. Two read-only
  scouts (LoopDriverMap, NativeAdmissionMap) mapped the two module
  families.
  Report: `/home/vgpnk/projects/shokunin/.ufo/reports/round-4/kumitate.md`.

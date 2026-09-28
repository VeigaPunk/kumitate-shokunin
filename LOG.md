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
- 2026-09-28 — round 5: mapped the `run-omp-native-trial.mjs` launch
  sequence end-to-end (gate stack → wall handoff → deferred assignment
  authoring → O_EXCL anchor → drift/probe gates with snapshot rollback →
  attested omp spawn → collect/judge/seal → retire) and the
  fleet-dispatcher front half (queue schema/lock, claim pipeline, four
  counters, state vocabulary, repend door, ledger kinds). Two
  scout-mapped slices verified by parent against source. Surfaced a
  LATENT cross-domain defect: `sealBoundaryViaRuntime` shells
  `ufo membrane-seal write` but `Command::MembraneSeal` has no `write`
  subcommand — clap rejects the argv at parse, so every real
  `authority_boundary` seal write fails `membrane_seal_write_failed`
  (stub-symmetry on both test sides hid it since H13 cutover d76ddcc0e;
  verified with a minimal clap 4.6 repro). Added
  `corpus/knowledge/native-trial-launch.md`,
  `corpus/knowledge/queue-and-claim.md`, `lessons/round-5.md`; SKILL.md
  gained a launch-sequence section + dispatcher front-half summary +
  defect advisory; README coverage/gaps updated. Evidence:
  `run-omp-native-trial.mjs` :194-4693 (main() :3539+, seal
  :1904-1961, wall :1357-1387, snapshot :1553-1630, drift :2929-3003,
  probes :3383-3514), `fleet-dispatcher.mjs` L96/L114-150/L5310-5701/
  L5743-5924/L12086-12513/L12798/L13187/L8937, `ufo-cli/src/main.rs`
  :95-111/:232/:287-308, `cli_contract.rs` :1507-1530,
  `tests/run-omp-native-trial.test.js` :3939/:4104/:4404.
  Report: `/home/vgpnk/projects/shokunin/.ufo/reports/round-5/kumitate.md`.
- 2026-09-28 — round 6: closed the two largest remaining gaps and the
  tail of a third. Mapped fleet-dispatcher.mjs tail end-to-end (ingress
  scout: L5700-8650 queue I/O, lock, scope partition, godspeed envelope,
  mint + admission battery, batch refs, compaction, receipt verdicts;
  tail scout: L8650-14769 latch/episode machinery, reconcileQueue,
  runCycle, main() verbs) and all of `ufo-sighting-lib` (26 files, wall
  persistence/lock, pane lifecycle, steer/peek, observation sources).
  Closed `the-tick` gap: ground handler serves FOUR ops (health,
  freshness_ping, path_ping, chat — chat is the only model touch).
  Added 6 corpus notes (enqueue-admission, reconcile-and-cycle,
  sighting-wall, native-admission-detail, cost-and-profile,
  runtime-support) + lessons/round-6.md. Corrections landed: two-writer
  queue rule (ufo-l0-monitor heal-writes via its own lock port, no
  revision bump — sentinel-verified); `permits_advance` is
  execution_profile.rs:448 not :447 (three stale cites fixed);
  reconcileQueue head order corrected after critic falsification
  (sweepGraceDeferLatch → sweepRowFaultLatches → pruneAdmissionLatch).
  Cross-domain drift reported: judge `is_format_char` covers `\p{Cf}`
  while producer `FORMAT_CHARS_RE` strips `\p{Cf}∪\p{Mn}∪Zs` — unpinned
  Mn/Zs parity break (fail-closed). Method: 3 flash scouts mapped +
  10-lane batch (planner, connector, 3 scouts, executor draft, scribe
  census, critic falsification, reviewer citation audit, sentinel scope
  audit); parent verified riskiest claims directly against source.
  Evidence: fleet-dispatcher.mjs (rev 44a3c781, 14769 lines) L95-200,
  L5713-8645, L8680-14769; ufo-sighting-lib/*.mjs; ufo-l0-monitor.mjs
  :201-253/:1411-1467; ufo-ground-handler.mjs :99-163/:680-760;
  execution_profile.rs :402-498; native_admission_text.rs :42-61 vs
  ufo-credential-screen.mjs :55-75; cost_ledger.rs :18-737;
  lane_overlay.rs/lease.rs/live.rs.
  Report: `/home/vgpnk/projects/shokunin/.ufo/reports/round-6/kumitate.md`.

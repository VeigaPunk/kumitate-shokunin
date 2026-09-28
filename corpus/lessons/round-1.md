# Lessons — round 1

What worked / what cost time, with evidence. See LOG.md round-1 entry and
commit `round-1` in this repo; report at
`/home/vgpnk/projects/shokunin/.ufo/reports/round-1/kumitate.md`.

## What worked

1. **Headers are normative.** `ufo-swarm-wave.mjs` and
   `ufo-swarm-collect.mjs` carry multi-page doc-comment headers that state
   invariants, ported-parity rationale (kimi AgentSwarm), schema names, and
   the "rNN" change history. Reading headers before code gave ~80% of the
   SKILL.md content. Lesson: in this codebase, `head -120 <script>.mjs`
   outranks symbol grep for orientation.
2. **Constants are single-sourced and commented with provenance.**
   `collect-omp-native-handoff-lib/base.mjs` L69-260 holds the telemetry
   vocabulary (CAPACITY_FAILURES, PROPOSAL_ROLES, deadline/seat classes)
   with spec citations per constant — one `sed` range captured the whole
   failure-taxonomy section.

## What cost time / traps

3. **`ufo-sighting.mjs` is a thin dispatcher** — the verb surface lives in
   `ufo-sighting-lib/surface.mjs` (`USAGE_LINES`, `VERB_USAGE_INDEX`).
   Grepping the entry file for usage text finds imports only. Trap:
   `scripts/ufo-sighting` is a 224-line bash entry script (not a directory),
   `scripts/ufo-sighting-lib/` is the implementation — similar names,
   different roles.
4. **Doc-vs-code drift exists and must be caught, not parroted.** The
   installed `ufo` skill text says the swarm cap is 128 lanes; the script
   header says the operator contract caps at 100 (stricter than kimi's
   128), and `config/ufo.json` sets `maxLanes: 100`. Lesson: cite the
   config/script as truth and name the drift explicitly rather than
   averaging sources.
5. **`sighting.dispatch.swarm` carries two band declarations** —
   `minLanes: 64` (round target) beside `waveMinLanes: 16 /
   waveMaxLanes: 100` (wave band). `ufo-stale-watchdog.mjs` derives policy
   live via `loadSwarmPolicy` precisely because a hardcoded floor
   steered lanes to the wrong number. Never restate a policy constant.

## Gaps (next round)

- `scripts/fleet-dispatcher.mjs` is ~15k lines — round 1 covered only its
  header and lock/gating surface; the task-receipt settle path and the
  iterate-successor decision chain are unmapped.
- `crates/ufo-core-runtime` round loop (`loop_driver_*.rs`,
  `native_*.rs`) inventoried by filename only; judge admission internals
  unread.
- `run-omp-native-trial.mjs` launch-sequence internals (wall handoff,
  pane binding) not yet read beyond usage/refusal surface.

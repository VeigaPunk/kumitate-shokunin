# ScoutWaveValidator — round 61 w1 seat report

Milestone: validator recon. Axes: operability, coverage.
Full findings: `.ufo/waves/round-61/build/ScoutWaveValidator/findings.md`.

## Result
The C1 record can be built mechanically from the OMP artifacts, but **not** from
`ufo-swarm-wave.mjs` alone:
- `ufo-swarm-wave.mjs` has verbs `plan|run|record` only, and **no `settle`** (`main` L1966–1973).
- `run` prints the dispatch payload to stdout (L2056); this round saved it as `w1-dispatch.json`.
  The only file `run` writes is `swarm-registry.json` (`persistWaveRegistry` L1613).
- Settled outcomes are a hand-written `ufo-swarm-results-v1` file. `ufo-swarm-collect.mjs`
  turns it into the envelope. Results rows are `{name,status,state?,agentId?,item?,result?,
  stopReason?,failureClass?}` and have no `exit` field. Envelope entries are
  `{outcome,state,body,memberIndex,agentId?,item?,axes?,milestone?,reportPresent?,mode?,
  stopReason?,failureClass?}` and have no `name`.
- No ufo script writes `launcher-progress.tsv` or `dispatch-actual.json`. In rounds 59 and 60 the
  kimi `launcher.py` wrote them. Round 61 was dispatched through OMP (`eval` → `tool.task`).

## agentId → session id (observed, 32/32 seats)
1. The registry `members.<name>.agentId` is `L1Kumitate61.<name>`, the hub id.
2. The seat transcript is at `~/.omp/agent/sessions/-Projects-shokunin/2026-10-25T06-15-52-413Z_01a171b3-835d-7667-b875-b75970c45a2a/L1Kumitate61/<agentId>.jsonl`.
3. In that transcript, the `type:"session"` line holds the `id` (a UUIDv7) and the `timestamp`;
   `parentSession` must equal the parent transcript.
4. `exit` comes from the terminal status in the parent's `wait` `details.jobs[]` or its
   `<task-result status=…>`. The rule `exit=0` if and only if `completed` is a convention and
   must be disclosed.

Use the session UUID in the TSV `session=` and in `dispatch-actual.json` `members[].agentId`.
Use the hub id in collector results rows; a UUID there fails `conflicting_member`. Use the owner
`L1Kumitate61` for collector `--sessionId`; the digit-leading parent UUID fails
`invalid_envelope`.

## Evidence (scratch `/tmp/kumitate-r61/ScoutWaveValidator/`)
- `build-c1-record.mjs` (the builder) and `agent-session-map.tsv` (32 rows).
- Mid-wave gate run, with 16 of 32 seats terminal:
  `DISPATCH_EVIDENCE: DRIFT (seats=16 sessions=16 exit0=16 reports=16 dead=0)`,
  `FINDING PLAN_MISMATCH:declared=32observed=16`, exit 1. This is the expected result before the
  wave finishes.
- Collector: the full wave fails `unmapped_member` (exit 1); the settled subset succeeds (exit 0)
  with `summary "completed: 16"` and `reportSummary present 16/16`.

## Risks
- An `eval`-issued dispatch is invisible to ufo's `spawnedTaskIds`, which accepts only a native
  `task` toolResult.
- A seat's terminal status can arrive only as an `async-result`, after which the seat leaves the
  `wait` job list (seen for CritPlaceholderSweep). Read both sources.
- Build the record only after all 32 seats are terminal; until then P2 CLEAN is unreachable.

Tools installed or updated: none.

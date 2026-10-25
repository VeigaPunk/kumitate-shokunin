# ScoutWaveValidator — validator dispatch artifacts → C1 record (round 61, w1)

Axes: operability (can C1's record be built mechanically from these artifacts), coverage (every
artifact and field the gate and the collector read). Sources: ufo-fsd-alpha `fb7157fc`;
`scripts/ufo-swarm-wave.mjs` sha256 `9dbd91aaa26f9c58…`, `scripts/ufo-swarm-collect.mjs`
`77f833a5141a6d21…`; lane gate `scripts/dispatch-evidence.mjs` `765a7aa3ef6b11f1…`.
Observed = read in source or run here. [INFERENCE] = a conclusion that was not executed.

## 0. Corrections to the assignment's premises (observed)

1. **There is no `settle` verb.** `ufo-swarm-wave.mjs` `main` (L1966) dispatches only `record`
   (L1968) and `plan`/`run` (L1971); anything else is a usage error (exit 64). "Settle" is not a
   script step: the operator writes a `ufo-swarm-results-v1` file by hand, and
   `ufo-swarm-collect.mjs collect` turns it into the envelope.
2. **`run` writes no `swarm-dispatch.json`.** `run` prints the `ufo-swarm-wave-dispatch-v1`
   payload to **stdout** (`emitJson(output)` L2056). The only files it writes are the registry
   (`persistWaveRegistry` L2029) and, only for waves with a `modelAlias`, overlay agent cards.
   For this round the operator saved stdout as `.ufo/waves/round-61/w1-dispatch.json`.
3. **No ufo script writes `launcher-progress.tsv` or `dispatch-actual.json`.** In rounds 59 and
   60, both files came from a separate kimi launcher (`.ufo/waves/round-60/launcher.py.txt`,
   L14 and L29–36: it scraped `"session_id":"…"` out of `kimi --output-format stream-json`).
   **Round 61 was dispatched through OMP, not kimi.** The parent's `eval` cell ran
   `await tool.task({'context':…, 'tasks':…})` at 09:39:53Z and spawned 32 background jobs. So the
   kimi launcher's session scrape does not apply. Section 4 gives the OMP mapping.
4. **No results field is called `exit`.** Results rows carry `status`. Envelope entries carry
   `outcome`. Section 3 has both.

## 1. `run` outputs (observed)

### 1a. Dispatch payload, stdout only (`planToDispatchPayload` L1441)
`{schema:"ufo-swarm-wave-dispatch-v1", wave, policy, counts:{spawn,resume,total}, registry,
handlesReset?, compaction?, routePreflight?, agentCards?, agentCardResult?,
taskCall:{context, tasks:[{name, agent, task, item?}]} | null, resumeSends:[{name, resume, member,
item, message}], note}`
- `registry` (L1397) is the plan's embedded registry block: `{schema, path, reportDir?, members}`.
  Every spawn member is minted with `agentId: null`.
- Member `name` is either the spec's `items[].name` or derived as `Swarm<Role>NN` or
  `SwarmResumeNN` (L1196–1199). This name is the join key for every later step.
- Round 61 (`w1-dispatch.json`): `counts {spawn:32,resume:0,total:32}`, `resumeSends: []`,
  `registry.path=".ufo/waves/round-61/w1/swarm-registry.json"`,
  `reportDir=".ufo/waves/round-61/w1"`.

### 1b. `swarm-registry.json` (`ufo-swarm-registry-v1`, `buildRegistryDoc` L665, `persistWaveRegistry` L1613)
`{schema, wave, createdAt, updatedAt, reportDir?, priorRegistries?, members:{<name>:{kind:"spawn",
agentId:null, role, item, axes?, milestone?, modelAlias?, card?}}}`. Note that `members` is a
**name-keyed object**, not an array. The file is written atomically under the `<registry>.lock`
directory. A re-run of the same wave resets spawn rows to `agentId:null` and reports the cleared
handles in `handlesReset`. A different wave that would displace a held handle is refused with
`wave_registry_collision`.

### 1c. `record` (`mainRecord` L1793)
`record --registry <rel> --assignments '{"<name>":"<agentId>"}'` fills in `agentId`. It is
fail-closed: an unknown name, an id outside `RESUME_ID_PATTERN` `/^[A-Za-z0-9][A-Za-z0-9._:/-]{0,255}$/`,
one handle on two members, or re-pointing an already-set handle all fail with typed errors.
Round 61 has already been recorded: `updatedAt 09:41:05Z`, 32/32 members with
`agentId = "L1Kumitate61.<Name>"` (the OMP hub job id, **not** a session id).

## 2. Collector inputs (`ufo-swarm-collect.mjs`, observed)

`collect --wave <dispatch|plan> --results <file> [--registry f] [--runId] [--sessionId] [--out f]
[--emit-xml] [--l2-evidence f]`
- Results input `ufo-swarm-results-v1` (`resultsMembers` L373):
  `{schema, runId?, sessionId?, members:[{name, status, state?, agentId?, item?, result?,
  stopReason?, failureClass?}]}`. Unknown keys are refused, so `exit`, `session`, and `pid` must
  not appear here.
- `status` maps to `outcome` through `STATUS_OUTCOME` (L109): `completed→completed`,
  `failed|timeout→failed`, `cancelled|canceled|aborted→aborted`. **`running` is refused.**
- `failureClass` (L127) is one of `rate_limit|usage_limit|model_unavailable|lane_timeout|
  process_exit|unavailable|quality_degraded`. It is forbidden on `completed` rows.
- The join requires a **one-to-one match on member name**: a dispatch member without a row fails
  `unmapped_member`, and a row without a member fails `unexpected_member` (`collectEntries` L621).
- agentId evidence is resolved by `soleEvidence` across the registry, the results row, and the
  resume target. Any two non-null values that differ fail `conflicting_member`.
- Owner ids: `runId` must match `/^[A-Za-z][A-Za-z0-9_-]{0,63}$/` and `sessionId` must match
  `/^[A-Za-z][A-Za-z0-9_.-]{0,127}$/` (`ufo-mission-result.mjs` L73–74). Precedence is
  flag > results file > `UFO_SIGHTING_*` environment variable (`resolveOwnerId` L710).

## 3. Results envelope (output) — per-member fields (observed by running it)

Envelope keys: `schema, runId, sessionId, subagents[], summary, completed, failed, aborted, total,
resumeHint, reportSummary?`.
Per `subagents[]` entry: `outcome` (completed|failed|aborted), `state` (started|not_started),
`body` (= results `result`, defaults to ""), `memberIndex` (1-based, in dispatch order),
`agentId?`, `item?`, `axes?`, `milestone?`, `reportPresent?` (a regular file at
`<reportDir>/<name>.md`), `mode:"resume"?`, `stopReason?`, `failureClass?`.
**There is no `name` and no `exit` field in an entry.** The name is recovered by position
(`memberIndex`) or from the L2 sidecar.
L2 sidecar (`--l2-evidence`, `l2EvidenceRows` L597): `{schema:"ufo-swarm-l2-evidence-v1", runId,
sessionId, members:[{name, kind, outcome, state, agentId?, role?, modelAlias?, card?,
dispatchAgent?}]}`.

## 4. How a seat's agentId maps to a session id for `launcher-progress.tsv`

What the gate reads (`dispatch-evidence.mjs`; `parseProgress` L50, `inspect` L83):
- One TSV row per seat: `<name>\tkey=value…`. The keys `exit` and `session` are required;
  `pid` is optional. `session` may be any string other than `null`; **the gate checks neither its
  format nor its agreement with any registry**. A seat counts as dead when
  `exit != 0 || !session` (L114). The report is `<waveDir>/<name>.md` with size > 0.
- `dispatch-actual.json` must have `members` as an **array** (L132). A ufo
  `swarm-registry.json` has a name-keyed object there, so passing the registry off as this file
  fails `REGISTRY_UNREADABLE:members-absent`. It also requires `planned`, `sessionIds`, `exit0`,
  `reports`, and `dead[]` to equal the counts observed from the TSV.

The OMP join chain, observed for all 32 round-61 seats:
1. Seat name → hub id: `swarm-registry.json` `members.<name>.agentId` = `L1Kumitate61.<name>`.
2. Hub id → transcript: `<parent transcript minus .jsonl>/<agentId>.jsonl`, here
   `~/.omp/agent/sessions/-Projects-shokunin/2026-10-25T06-15-52-413Z_01a171b3-835d-7667-b875-b75970c45a2a/L1Kumitate61/L1Kumitate61.<name>.jsonl`.
   This is the same rule ufo uses in `fleet-dispatcher.mjs` `safeChildTranscript`. 32/32 files
   are present.
3. Transcript → **session id**: the line with `type:"session"` (line 2) has an `id` (a UUIDv7,
   for example `01a1726e-3f50-7460-84bc-a76489e9cf53` for ExecTipReceipts) and a `timestamp`
   (use it as `start`). Its `parentSession` must equal the parent transcript; this guards against
   a stray file.
4. Hub id → `exit`: OMP seats have **no process exit code**. Take the terminal job status from the
   parent transcript, either from the `wait` toolResult `details.jobs[]` (`{id, status,
   durationMs, resolvedModel, resultText, …}`) or from a `<task-result id=… status=…>` in an
   `async-result` custom message. Use the same normalization as `fleet-dispatcher.mjs`
   `terminalTaskResults`. Terminal states are `completed|failed|canceled|cancelled|exited|
   settled`; `running` is not settled and gets no row. The mapping `exit=0` if and only if
   `completed`, otherwise non-zero, is a convention that must be **disclosed** in the record.
5. `end` = `start + durationMs/1000`. `pid` has no OMP meaning; write `pid=omp` or leave it out.

Use **two different ids**, which the probes below confirmed:
- In `launcher-progress.tsv` `session=` and in `dispatch-actual.json` `members[].agentId`, put the
  transcript **session UUID**. That is the evidence of a real session. Keep the hub id as an
  extra field (for example `hubId`) or inside `err=`.
- In the collector results rows `agentId`, put the **hub id**. Putting the session UUID there
  fails `conflicting_member`, because the registry already holds the hub id.
- For the collector `--sessionId`, use the owner `L1Kumitate61`. The parent UUID
  `01a171b3-…` begins with a digit and fails `invalid_envelope: sessionId is not a safe local
  identity`.

## 5. Dry run (scratch only; nothing written in the lane besides this file and the seat report)

Builder: `/tmp/kumitate-r61/ScoutWaveValidator/build-c1-record.mjs <lane> 61 w1 <parent.jsonl> <outRoot>`
implements steps 1–5. Map table: `/tmp/kumitate-r61/ScoutWaveValidator/agent-session-map.tsv`.
Run at about 09:44Z, mid-wave (16 of 32 seats terminal):
- `DISPATCH_EVIDENCE: DRIFT (seats=16 sessions=16 exit0=16 reports=16 dead=0)` with
  `FINDING PLAN_MISMATCH:declared=32observed=16`, exit 1. This is correct for a wave that has
  not finished.
- `collect` against the full `w1-dispatch.json`: `unmapped_member … ExecRecordDoc has no settled
  result`, exit 1.
- `collect` against the settled subset with `--sessionId L1Kumitate61`: exit 0, `summary
  "completed: 16"`, `reportSummary {expected:16,present:16,missing:[]}`.
- With the UUID owner id: `invalid_envelope`. With a seat row carrying the session UUID as
  `agentId`: `conflicting_member`.

## 6. Risks and unknowns

- **The dispatch went through `eval`, not a native `task` call.** The parent transcript contains
  0 `task` toolResults. ufo's spawn oracle `spawnedTaskIds` (`ufo-sighting-lib/observe.mjs`)
  accepts only a native `task` toolResult and treats eval stdout as declarative, so any ufo-side
  observe or settle check will not see this wave as spawned. The kumitate gate is not affected.
  The `eval` cell also added `solutionSpace` to each task; the task text was not changed.
- A seat's terminal status can arrive **only** as an `async-result` custom message. After that,
  the seat drops out of later `wait` job lists. Observed for CritPlaceholderSweep: `wait` showed
  `running` until 09:42:03Z, then `async-result` reported completion at 09:42:07Z, and later
  snapshots did not list it. The builder must read both sources and treat a terminal status as
  final.
- To reach P2 CLEAN, the record must be built only after all 32 jobs are terminal, with
  32 session UUIDs, 32 `completed`, and 32 non-empty `<seat>.md`. [INFERENCE] The plan's
  "progress file whose seats carry no session ids must read NOT_A_DISPATCH" control holds with
  this mapping, because `session=null` rows trigger L130.

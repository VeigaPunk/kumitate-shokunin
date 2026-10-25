# Audit08 — Schema-TaskVsSession: OMP task id vs transcript session id label honesty

Seat: `L1Kumitate62.Audit08` (critic, wave w2, round 62). Scope: read-only falsification of the inherited round-61 P61 predicate (dispatch-record identity binding). No lane files edited except this report; no commit; no tools installed (install record: none).

## Question under attack

"Trace the OMP task id versus transcript session id for a completed wave-1 seat; use actual files if available. Does the current dispatch record label the identifier honestly?"

## 1. Trace — what the runtime actually assigns (actual files)

Transcript/session archive for this OMP run:

```
~/.omp/agent/sessions/-Projects-shokunin/2026-10-25T06-15-52-413Z_01a171b3-…/<L1>/<agentId>.jsonl
```

Verified transcript session files (the runtime's own registry of sessions):

| Seat | Transcript session id (real file) | Dispatch-record label | OMP task id in record |
|---|---|---|---|
| r61 w1 `ExecTipReceipts` (completed) | `L1Kumitate61.ExecTipReceipts.jsonl` ✅ | `session=L1Kumitate61.ExecTipReceipts` / `agentId=…` | none |
| r61 w2 `Audit19` (dead at spawn, exit=1) | `L1Kumitate61.Audit19.jsonl` ✅ (registered despite provider reject) | `session=L1Kumitate61.Audit19`, exit=1, status=failed, dead | none |
| r62 w1 `W1-DispatchActual` (completed wave-1 seat) | `L1Kumitate62.W1-DispatchActual.jsonl` ✅ | **no dispatch record exists for r62 w1** | none |
| r62 w1 `S1-SessionID` (completed) | `L1Kumitate62.S1-SessionID.jsonl` ✅ | no record | none |
| r62 wave-2 spec item `Audit19` | three real sessions: `L1Kumitate62.Audit19.jsonl`, `…Audit19-2.jsonl`, `…Audit19-3.jsonl` (all exist) | w2-dispatch.json labels only `name:"Audit19"`, role | none |

Conclusions from the trace:

1. **The transcript session id is the dotted seat id the runtime mints** — `L1<Lane>.<Seat>`, with a numeric suffix (`-2`, `-3`) appended when a name is reused within the same parent session.
2. **The records' `session=`/`agentId=` labels copy the seat's intended name; they are never read back from the runtime session archive.** The builder (`scripts/make-dispatch-actual.mjs`) accepts only `agentId|agent_id|session|sessionId|session_id` (lines 206, 233, 273) and copies the string from the registry/results inputs (line 310: `session = r && r.agentId !== null ? r.agentId : m.agentId`). It never lists `~/.omp/agent/sessions/`, never queries the task tool, never validates membership.
3. **No record anywhere in the lane carries an OMP task id.** Grep for `taskId|task_id|jobId|job_id|transcriptId|transcript_id` across the lane yields no dispatch-record field; the results envelopes (`close/w1-results.json`, `close/w2-results.json`) are `kumitate-wave-task-results-v1` with members `{name, agentId, status[, exit, error]}` — no task/job id. The single residual `jobId` occurrence in the lane (`round-39/evidence/residual-dispatch-result.txt`) confirms the OMP task tool's job id is a separate, per-job identifier namespace that the lane never records.

## 2. Counterexample — the current round already breaks unique labeling

Round-62 reused the seat name `Audit19` three times in one parent session; the runtime minted three distinct transcript session ids: `L1Kumitate62.Audit19`, `L1Kumitate62.Audit19-2`, `L1Kumitate62.Audit19-3`. The current dispatch record for this wave (`w2-dispatch.json`, the only dispatch record that exists for round 62) labels the item only `{"name":"Audit19","agent":"reviewer",…}` — no identifier. Any future `dispatch-actual.json`/`launcher-progress.tsv` built by the existing tooling from spec + settle output would emit `session=L1Kumitate62.Audit19` **for all three runs**, i.e. one label, three real sessions: the label is ambiguous and misleading the moment a name is reused. The tooling cannot emit the true suffixed transcript ids because it never reads the session archive.

Second counterexample — the completed wave-1 seat has **no dispatch record at all**: round-62 wave-1 dispatched ≥32 seats (R/S/P/C/W items; transcripts exist, e.g. `L1Kumitate62.W1-DispatchActual.jsonl`), yet `.ufo/waves/round-62/` contains no `w1-*` dispatch spec, no `swarm-registry.json`, no `launcher-progress.tsv`, no `dispatch-actual.json` (glob: only `w2-dispatch.json` + reports). The `W1-DispatchActual` seat itself was instructed to report absence if no validated taskCall/actual dispatch exists (its transcript user prompt). So the current round's wave-1 identifiers are unlabeled by any record; a later claim of a dispatch record would have to be fabricated or reconstructed from transcripts, not read from a record.

## 3. Honesty verdict

- **Transcript-session namespace:** the round-61 records label it honestly in the common single-use case — every `session=`/`agentId=` value I checked resolves to an existing transcript file (`L1Kumitate61.ExecTipReceipts.jsonl`, `L1Kumitate61.Audit19.jsonl`). But this correctness is *accidental and unverified*: the gate (`scripts/dispatch-evidence.mjs`) counts id-shaped strings (`sessions += 1` per truthy `session`); it never compares a label to the session archive, deduplicates, or checks membership — exactly the round-61 P61 falsification (CritControlC1SessionIdentity: "the gate counts ids, it never compares them"). Verified again by grep: `swarm-registry` appears 0 times in both gate and probe.
- **OMP task-id namespace:** the records do not label it at all — no task/job id is ever captured, so the record cannot claim to tie seats to OMP task identities. The label is a self-named identity, not a runtime-issued identifier.
- **Current round-62 record:** `w2-dispatch.json` labels nothing but plan names and roles (honest as a plan, but it is not a dispatch record); round-62 wave-1 has no record. Where records exist (round 61), the honest-but-unverified session label plus total absence of the task id means the record *under*-labels, and — once names are reused (Audit19/-2/-3) — a naive record would *mis*-label, conflating distinct sessions under one id.

## 4. Impacted axes

`operability` / `coverage` (kumitate lanes; the round-61 P61 predicate "the dispatch record binds real session identity" is inherited, not re-proposed). The defect is not the label string in the single-use case; it is that the pipeline never binds labels to the runtime session archive, so identity claims carry no evidentiary weight (documents are portable — round-61 A8a/A8b still hold) and uniqueness is not enforced.

## 5. Smallest safe correction

1. `make-dispatch-actual.mjs` (and the gate) should obtain each seat's id from the **runtime session archive** (`~/.omp/agent/sessions/<run>/<L1>/<agentId>.jsonl` listing) or from the task-tool-returned id, not from registry/results strings; emit the exact transcript id including suffix.
2. Reject a record (fail-closed) when any labeled session id (a) does not resolve to an existing transcript file, or (b) is not unique within the wave — this turns the name-reuse case (`Audit19` vs `Audit19-2/-3`) into an error instead of a collision.
3. Add an optional `taskId` field populated from the OMP task result when available; if absent, state absence explicitly rather than presenting the self-named id as the task identity.

## Evidence pointers

- Transcript session files: `~/.omp/agent/sessions/-Projects-shokunin/2026-10-25T06-15-52-413Z_01a171b3-…/L1Kumitate6{1,2}/L1Kumitate61.ExecTipReceipts.jsonl`, `L1Kumitate61.Audit19.jsonl`, `L1Kumitate62.W1-DispatchActual.jsonl`, `L1Kumitate62.Audit19{,-2,-3}.jsonl`.
- r61 w1 record: `.ufo/waves/round-61/w1/dispatch-actual.json` (`agentId=L1Kumitate61.ExecTipReceipts`); `…/w1/launcher-progress.tsv:1`.
- r61 w2 record: `.ufo/waves/round-61/w2/dispatch-actual.json` (dead `["Audit19"]`, member `{name:"Audit19",agentId:"L1Kumitate61.Audit19",exit:1,settled:true,status:"failed"}`); `…/w2/launcher-progress.tsv` `Audit19\tsession=L1Kumitate61.Audit19\texit=1\tpid=-…`; `…/close/w2-results.json` `{name:"Audit19",agentId:"L1Kumitate61.Audit19",status:"failed",exit:1,error:"provider rejected task prompt as invalid_prompt"}`; `…/close/w1-results.json:3` source `"OMP task statuses delivered after the validated batched task call"` (members carry no task id).
- Builder id field scope: `scripts/make-dispatch-actual.mjs:206,233,273,310`.
- Round-61 P61 falsification context: `.ufo/waves/round-61/w2/CritControlC1SessionIdentity.md`; probe `.ufo/waves/round-62/probe/dispatch61-probe.mjs`.
- Round-62 current record: `.ufo/waves/round-62/w2-dispatch.json` (spec only; no identifier fields); absence of wave-1 records verified by glob of `.ufo/waves/round-62/` (no `w1-*`, no registry/progress/actual).

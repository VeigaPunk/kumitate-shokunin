# Audit08 — OMP task ID vs transcript session ID

**Axes:** operability, coverage. **Verdict:** the dispatch record's `agentId` is honestly named, but its `sessionIds` count and `launcher-progress.tsv` `session=` values are mislabeled. They contain OMP task/agent IDs, not transcript session IDs. This is a fixable identity/provenance defect, not evidence that the wave-1 tasks did not run.

## Counterexample and evidence

For completed wave-1 seat `ExecTipReceipts`:

- `.ufo/waves/round-61/close/w1-results.json:2-5` identifies its source as “OMP task statuses delivered after the validated batched task call” and records `agentId: "L1Kumitate61.ExecTipReceipts"`, `status: "completed"`.
- `.ufo/waves/round-61/w1/dispatch-actual.json:14-18` retains that same value in the accurately named `agentId` field, with `exit: 0`, `settled: true`, `status: "completed"`.
- The actual OMP transcript is `~/.omp/agent/sessions/-Projects-shokunin/2026-10-25T06-15-52-413Z_01a171b3-835d-7667-b875-b75970c45a2a/L1Kumitate61/L1Kumitate61.ExecTipReceipts.jsonl`. Its `type=session` header records transcript `id: "01a1726e-3f50-7460-84bc-a76489e9cf53"` at `2026-10-25T09:39:50.224Z`; the following `parentSession` points to the L1 transcript. Thus `L1Kumitate61.ExecTipReceipts` and `01a1726e-3f50-7460-84bc-a76489e9cf53` are observably different identifiers.
- The same contrast holds for `CritControlC1`: task ID `L1Kumitate61.CritControlC1`; transcript session ID `01a1726e-46da-76e0-8c37-d8f32dc5c2ec`.
- `scripts/make-dispatch-actual.mjs:23-30` documents progress rows as `session=..` and the aggregate as `sessionIds`; lines 337-345 serialize `session=${r.agentId}`, while lines 307-319 count every nonempty `agentId` as a session ID. The input results expose `agentId`, not transcript session UUIDs. `scripts/dispatch-evidence.mjs:50-68,113-139` parses and counts that `session=` token as session evidence without checking a transcript-session identity.
- Observed generated records: `w1/dispatch-actual.json:8` says `"sessionIds": 32`; `w1/launcher-progress.tsv:1` says `ExecTipReceipts\tsession=L1Kumitate61.ExecTipReceipts\texit=0...`. Those are 32 task IDs and a task ID respectively, not transcript-session IDs.

Commands used (read-only): `head -3 <ExecTipReceipts.jsonl>`; `grep -m1 '"type":"session"' <ExecTipReceipts.jsonl>` and the same for `CritControlC1`; `omp --help` (version 18.12.6); and `history://L1Kumitate61.ExecTipReceipts`, which resolved to the named OMP transcript. No checks/tests were run for this review.

## Smallest safe correction

Keep `members[].agentId` as-is: it accurately identifies the OMP task/agent. Stop calling that value a session: rename the progress key and aggregate/count to `agentId`/`agentIds` (or explicitly `taskId`/`taskIds`) and update the parser, gate, fixtures, docs, and callers together. If the contract needs transcript-session identity, capture the UUID from OMP's session metadata as a separate field and validate it against the transcript; do not infer it from `agentId` or count task IDs as sessions.

**Impact:** Operability is affected because the record and gate claim session-level evidence without identifying a transcript session. Coverage/provenance is affected because consumers cannot tell a task execution ID from a transcript-session ID. The observed UUID-backed transcripts do support that the cited tasks ran; the defect is the dispatch record's identity label and assurance, not a fabricated claim of execution.

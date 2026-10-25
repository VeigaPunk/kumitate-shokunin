# Audit01 — Schema-CompletedNoExit (round 62, wave w2)

Seat: `L1Kumitate62.Audit01` (reviewer). Scope: falsification of the inherited round-61
dispatch-evidence predicate material, subcase **settled-status→exit mapping**. Scratch-only
runs under `/tmp`; lane writes limited to this report.

## Claim under test

The validator results envelope says `status="completed"` and carries **no numeric exit**;
`make-dispatch-actual` must still produce the record the gate reads CLEAN. Compare that result
with what OMP actually reports for a completed seat, and cite the mapper code that performs the
status→exit mapping.

## 1. The envelope is verified: status=completed, no numeric exit

Round-61 real envelopes (lane, committed at `019a844c`):

- `.ufo/waves/round-61/close/w1-results.json` — schema `kumitate-wave-task-results-v1`,
  source `"OMP task statuses delivered after the validated batched task call"`. All 32
  members have the **same three keys** `name` / `agentId` / `status`; every status is
  `"completed"`. Union of member keys: `['agentId','name','status']`. Zero members carry
  `exit`, `exitCode`, or `code`.
- `.ufo/waves/round-61/close/w2-results.json` — 40 members; 39 `status:"completed"` with no
  exit field; the single failed seat `Audit19` carries the only numeric exit
  `{"status":"failed","exit":1,"error":"provider rejected task prompt as invalid_prompt"}`.

OMP's own per-seat task-result envelope (observed verbatim in `~/.omp/agent/sessions/…`
transcripts for round 61): `<task-result id="L1Kumitate61.ExecTipReceipts" agent="executor"
status="completed" duration="3m3s">` — successful seats carry `status="completed"` and
**no exit code**; failures render the exit inside the status string,
`status="failed (exit 1)"`. So the "no numeric exit on completed" shape is genuine OMP
semantics, not a transcription artifact.

## 2. make-dispatch-actual against a status-only fixture

Fixture (verbatim w1 envelope shape, scratch only): registry members `ExecAlpha/ExecBravo/
ExecCharlie` with `agentId`, three non-empty report files, and results members that contain
only `name` / `agentId` / `status:"completed"`.

Command:

```
node scripts/make-dispatch-actual.mjs \
  --registry /tmp/schema-noxit-adj01/.ufo/waves/round-1/w1/swarm-registry.json \
  --results /tmp/schema-noxit-adj01/settle.json \
  --reports /tmp/schema-noxit-adj01/.ufo/waves/round-1/w1 \
  --out /tmp/schema-noxit-adj01/.ufo/waves/round-1/w1
```

Output / exit:

```
MAKE_DISPATCH_ACTUAL: CLEAN out=/tmp/schema-noxit-adj01/.ufo/waves/round-1/w1 seats=3 sessions=3 exit0=3 reports=3 dead=0 members=3 gate=0
DISPATCH_EVIDENCE: CLEAN (seats=3 sessions=3 exit0=3 reports=3 dead=0)
TOOL_EXIT=0
```

Written record: each member becomes `{"exit":0,"settled":true,"status":"completed",…}` and
`launcher-progress.tsv` gets `session=… exit=0 pid=- start=- end=-`. The gate reads the
record CLEAN. So the status-only envelope converts cleanly and the resulting `exit0` count
equals the number of `status:"completed"` seats.

## 3. Exact mapper code behind the synthesis

`scripts/make-dispatch-actual.mjs` (sha256 `f0194314e98e87e86eb1329f36411e249911f9a0120aa4feb702562a54bf3dc9`):

- `normExit(value, status)` — lines 106–120. The status switch (109–118):

```js
switch (String(status || '').trim().toLowerCase()) {
  case 'completed':
  case 'settled': return 0;
  case 'failed': return 1;
  case 'timeout':
  case 'timed_out': return 124;
  case 'canceled':
  case 'cancelled':
  case 'aborted': return -9;
  default: return null;
}
```

- `resolveResultExit(name, status, rawExit)` — lines 149–167. When the exit key is absent,
  `explicit` is `null`; the decisive tail:

```js
return explicit ?? statusExit;
```

(`statusExit` is `normExit(undefined, status)` — i.e. `0` for `"completed"`.)

- `resultEntries` — line 230: `const rawExit = consistentValue(entry, ['exit','exitCode','exit_code','code'], normExit, 'exit', name);` returns `null` when none of the alias keys exist, then `line 231` calls `resolveResultExit(name, status, rawExit)` → `0`.
- `mergeRows` — lines 311–314: `rawExit === null ? -1 : rawExit` ⇒ `0`; `settled = rawExit !== null` ⇒ `true`; status stays the verbatim `"completed"`.
- `buildRecord` — lines 341–343/352–354: `exit0 = rows.filter(r => r.exit === 0).length`; `dead` excludes them.

## 4. Comparison with actual OMP semantics

- **Agreement:** OMP's success signal is exactly `status="completed"` with no exit; the
  mapper preserves the status string verbatim and derives `exit=0` from it. The generated
  record is internally consistent with the envelope and the gate (`dispatch-evidence.mjs`)
  reads it CLEAN. Nothing is silently rewritten: the raw `status` column is carried through.
- **Derivation, not observation:** the record's `exit:0` / `exit0=N` tokens are synthesized
  (status→0), never observed from OMP. OMP does not report exit codes for completed seats, so
  any downstream sentence that reads `exit0=32` as "32 seats exited 0" overstates what OMP
  delivered; the correct statement is "32 seats settled completed". P61/P2's CLEAN line
  (`exit0=32`) therefore rests on the status→exit contract shared by builder and gate, not on
  an independently observed exit.
- **Dialect limitation:** OMP's verbatim failure status `"failed (exit 1)"` is not accepted
  by `normExit`'s switch → `RESULT_STATUS_UNREADABLE` fail-closed (verified: tool exit 2,
  no record written). The round-61 `w2-results.json` had already normalized the failed seat to
  `{status:"failed", exit:1}` before the converter ran. The converter therefore consumes a
  normalized dialect of the OMP envelope, not OMP verbatim; completed tokens pass unchanged
  only because their native form is already the normalized one.

## 5. Does this subcase independently falsify P61?

No. The mapping behaves *as declared*: feeding the genuine status-only envelope yields a CLEAN
record with `exit0=32`. The finding is that the predicate's headline `exit0` figures are
status-derived per the cited code — relevant to how the evidence may honestly be phrased, not
a contradiction between envelope and record.

## Scratch

`/tmp/schema-noxit-adj01/` and `/tmp/schema-failstr-adj01/` (fixtures + receipts), removed
on close. No lane files changed except this report. No tool installs.

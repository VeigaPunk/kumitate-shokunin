# Audit19 re-queue — Round60-DeadTable (R61-V6 routed item)

Report only; no author-lane judgment. No files edited except this report; no commit; no tools installed (install record: none).

## 1. Identity and death record

- Wave: round-61 w2, seat `Audit19`, role `reviewer`, axes `[operability, coverage]` (`w2-dispatch.json:349-359`, `w2-plan.json:364-368`, `w2-spec.json:297-304`).
- Dispatch outcome (`w2/launcher-progress.tsv` line 35): `Audit19 session=L1Kumitate61.Audit19 exit=1 pid=- start=- end=-`.
- Result record (`close/w2-results.json:175-181`): `status=failed`, `exit=1`, `agentId=L1Kumitate61.Audit19`, `error="provider rejected task prompt as invalid_prompt"`.
- The seat died at spawn: no report was ever written (no `w2/Audit19.md` exists; `w2/dispatch-actual.json` shows `planned=40, reports=39, dead=["Audit19"]`).
- The identity `L1Kumitate61.Audit19` is dead and MUST NOT be revived/recontacted (no resume hint; fresh execution with a new session id).

## 2. What Audit19 was supposed to attack

Prompt (verbatim from `w2-spec.json:302-304`; identical in `w2-plan.json:599-601` and `w2-dispatch.json:593-597`):

> `### Godspeed posture\nName the axes; iterate cheap and in parallel; keep moves that improve any axis and harm none; do not aim — let the frontier walk itself. No clarifying-question loops: act via tool calls.\n\nRound60-DeadTable — Audit \`ufo/waves/round-60/close/dead-seats-r60.md\` against committed progress, stream files and launcher log: count 32/5/27, full errors no truncation, traceback exact.`

Assertion under test — the claims of `round-60/close/dead-seats-r60.md` (R60-V6 repair), which is derived only from committed blobs at `HEAD=be4a820c344d4eb2f94b999c3b5d649e76ab70f1` via `git show HEAD:<path>`:

- Counts: seats 32 = progress rows = launcher `spawn` lines = `settled` lines; `exit=0` 5; `exit=-9` 27; other exit codes 0.
- Activity-evidence non-forgeability: every `exit=0` seat has a non-null session matching the single `session.resume_hint` event in its stream; no `exit=-9` seat has a session id or `session.resume_hint`.
- `pid`/`exit`/`session` per progress row match the matching `spawn`/`settled` lines in `w1-launcher.log`.
- Window: first start 1792894711, last end 1792896200.
- Why `exit=-9`: all 27 dead seats ran 420–421 s and were killed by `SEAT_TIMEOUT=420` (`launcher.py.txt` lines 16, 65-66); streams carry `meta:turn.step.retrying` events with `APIProviderRateLimitError`/HTTP 429; `max_attempts=20`; `delay_ms` 0.5–39.9 s; 589 retry records total.
- Full errors, no truncation: every `.err` file contains its complete output; table tails use ` | ` separators, never cut text.
- Traceback exact: `w1-launcher.log` lines 65-68, end of log, no `DONE members=` line after; launcher died before its own registry write.

Target bytes (committed blob hashes, verified identical at current `HEAD=0cbe0d75`):

| Path | Blob |
|---|---|
| `w1/launcher-progress.tsv` | `df92492b4a48dfeb39f9e5a3729a2e08ac1b3d66` |
| `w1-launcher.log` | `d014d43024ed437d8f7b6741712f41647b1a9be2` |
| `launcher.py.txt` | `24fea66d3d2dba097c62abc3f49f83b9087660ee` |
| `close/dead-seats-r60.md` | `34d3213cac185bb3840f9044dcc6801f346dfbb6` |
| `w1/swarm-registry.json` | `68a2c21094b4e111b528cc34907d91bdabb4dd16` |
| 32× `w1/<seat>.err` + 32× `w1/<seat>.stream.jsonl` | (full set; 64 files) |

## 3. Evidence checks run for this re-queue (all pass)

Reproduction against the same committed blobs (via `git ls-tree HEAD` + reads; no worktree edits):

1. `w1/launcher-progress.tsv`: 32 rows; field 4 (`exit=`) distribution exactly **5 `exit=0`**, **27 `exit=-9`**, other = 0. Session field: exactly 5 non-null sessions (ExecRows, ExecGates, ExecCensus, RevS190Quote, RevS133Quote), 27 `session=null`.
2. `w1-launcher.log`: 32 `spawn` lines, 32 `settled` lines. Traceback lines 65-68 quoted verbatim; log ends there; **no `DONE` line** exists.
3. All 27 dead seats have duration 420–421 s (`start`/`end` delta). Window `first_start=1792894711`, `last_end=1792896200`.
4. Retry events: 589 `turn.step.retrying` records across the 32 streams; all carry `max_attempts=20`; `delay_ms` min 500.35, max 39852.93 (0.5–39.9 s); all streams reference HTTP 429/`APIProviderRateLimitError`.
5. `session.resume_hint` appears in exactly the 5 live-seat streams (ExecCensus, ExecGates, ExecRows, RevS133Quote, RevS190Quote); none in the 27 dead streams.
6. `.err` files: 32 present; tails end with the full output (e.g. ExecDispatch60 ends `BASE_EXIT=1`; ExecRows ends with the `runtime.not_found` stack) — text is complete, not truncated.
7. Commit fact: `dead-seats-r60.md` header's four state-blob hashes all match the blobs present at HEAD; the round-60 w1 worktree is clean.

Falsification framing for the re-queued attack: the honest controls that must be beaten — (a) a fabricated dead-seat table claiming counts other than 32/5/27 (e.g. wrong exit mix, invented sessions) must be rejected by re-deriving counts from progress field 4 and from `spawn`/`settled` lines; (b) a fabricated table that moves `resume_hint` onto a dead seat or omits it from a live seat must be rejected by stream pairing; (c) any table claiming the launcher printed `DONE` or wrote its own registry must be rejected by the end-of-log traceback and `swarm-registry.json` schema (`ufo-swarm-registry-v1`, createdAt `2026-10-25T02:18:21.213Z`, not the launcher's `{wave, concurrency, seatTimeoutSec, members}` shape).

## 4. Unexecuted tests to preserve

The Audit19 review itself never executed (provider rejected the prompt at spawn). The following verifications remain unrun and must be performed when re-queued:

1. Re-derive the 32/5/27 counts independently from committed progress bytes (field 4) and log line counts (this report does it as evidence, but the audit must do it as its own check).
2. Full no-truncation scan: verify every one of the 64 `.err`/`.stream.jsonl` files' complete contents (all tails and event streams), not just spot checks.
3. Exact traceback byte-compare of `w1-launcher.log` lines 65-68 and confirmation of end-of-log/no-`DONE`.
4. Per-row `pid`/`exit`/`session` cross-check of all 32 progress rows against the matching `spawn`/`settled` lines.

## 5. Concrete follow-up requirements (round-62 re-run)

- Re-run the **unmodified** Audit19 prompt from `w2-spec.json:302-304` (quoted in §2) against the same committed blobs at `HEAD=be4a820c…` (hashes in §2; they are unchanged at the current HEAD).
- Write the finding to `.ufo/waves/round-62/w1/Audit19.md` (this file); do not touch round-61 files.
- Use a fresh session id; do not resume `L1Kumitate61.Audit19` and do not recontact that identity.
- Report the four unexecuted checks of §4 as the audit's core deliverables.

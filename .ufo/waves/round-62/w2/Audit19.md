# Audit19 — Round60-DeadTable re-queue audit (round-62 w2, findings only)

Seat: `L1Kumitate62.Audit19-2` (re-queued Audit19, R61-V6 routed item). Read-only refutation wave;
no edits besides this report, no commits, no tools installed (install record: none).

## 1. Scope and inputs

Target: `.ufo/waves/round-60/close/dead-seats-r60.md` (R60-V6 repair), derived from committed
blobs at `HEAD=be4a820c344d4eb2f94b999c3b5d649e76ab70f1`. All inputs re-read from committed blobs
via `git show <rev>:<path>`; worktree hashes verified identical at current `HEAD=0cbe0d75`:

| Input | Blob |
|---|---|
| `w1/launcher-progress.tsv` | `df92492b4a48dfeb39f9e5a3729a2e08ac1b3d66` |
| `w1-launcher.log` | `d014d43024ed437d8f7b6741712f41647b1a9be2` |
| `launcher.py.txt` | `24fea66d3d2dba097c62abc3f49f83b9087660ee` |
| `close/dead-seats-r60.md` | `34d3213cac185bb3840f9044dcc6801f346dfbb6` |
| `w1/swarm-registry.json` | `68a2c21094b4e111b528cc34907d91bdabb4dd16` |
| 32× `w1/<Seat>.err` + 32× `w1/<Seat>.stream.jsonl` | (64 files, extracted and scanned whole) |

`git status --porcelain -- .ufo/waves/round-60` is empty; r60 worktree is clean.

## 2. Count checks (32/5/27) — all re-derived, match

- Progress TSV: 32 rows, unique seat names. Exit distribution: `exit=0` = 5, `exit=-9` = 27,
  no other exit codes.
- Launcher log: 32 `spawn` lines, 32 `settled` lines; exit/session per settled line matches the
  progress row for the same seat (diff of sorted pairs: zero rows differing).
- `pid` cross-check: spawn-line pid == progress-row pid for all 32 seats (join mismatch count 0).
- Sessions: exactly 5 non-null sessions; the same 5 seats are the only streams containing
  `session.resume_hint` (exactly one hint each: ExecRows, ExecGates, ExecCensus, RevS190Quote,
  RevS133Quote). All 27 dead seats: `session=null`, no hint, no `session_id` anywhere in stream.
- Window: first start = 1792894711, last end = 1792896200 (matches).
- Dead-seat durations: all 27 run 420–421 s (`end-start`), consistent with `SEAT_TIMEOUT=420`
  (launcher.py.txt lines 16, 65–66) — killed by launcher, not self-crash.
- Retries: 589 `turn.step.retrying` records total across the 32 streams; every record is
  `APIProviderRateLimitError` HTTP 429, every record `max_attempts=20`; `delay_ms` min 500.35,
  max 39852.93 (0.5–39.9 s). Matches table.

## 3. Full errors / tails — byte-for-byte, match

- Table "last non-empty line of `.err`" (`stream tail` = last `turn.step.retrying` record, `last
  event` = final stream record) compared for all 27 dead seats against raw file bytes: every tail
  is the verbatim final non-empty line; `retries` counts equal per-seat grep counts; `.err` byte
  sizes equal the table's `.err bytes` column (e.g. ExecDispatch60 104360, ExecProxy 294225, RevS194Quote
  49882, RevS126Quote 7579, SentinelBounds 25317, MutDupGroup 2812). No content cutting found.

## 4. Traceback — exact, match

`w1-launcher.log` lines 65–68 verbatim: `Traceback` → `ValueError: dictionary update sequence
element #6 has length 1; 2 is required`; log ends there with no `DONE members=` line. Cause
re-derived: progress row 3 (ExecCensus) field `#6` = `W04` (no `=`), row 26 (ScoutFrontier)
`#6` = `corpus/REA`; `swarm-registry.json` at the rev is the `ufo-swarm-registry-v1` shape
(createdAt 2026-10-25T02:18:21.213Z, members dict), not the launcher's
`{wave, concurrency, seatTimeoutSec, members}` output — launcher died before its own registry
write. Matches.

## 5. Discrepancies found

1. **Table self-violation: unescaped pipes in two `.err` tail cells.** The table section declares
   "`|` inside the text is escaped, not cut." Two rows violate it: `RevS134Quote` and
   `MutDupGroup` embed raw `|` characters in the `.err tail` field (the `\|`-escaped convention is
   used elsewhere, e.g. the `S134`/`S126` row content). Parsing those rows as a delimited table
   splits each into 20 columns instead of the 7 defined by the header — e.g.
   `MutDupGroup` tail contains `| S126 | Detecting Activity failures — Temporal documentation — ...`
   verbatim with unescaped pipes. The textual content itself is still complete and untruncated;
   the table's declarable structure is broken for those two rows only.
2. **A dead seat produced a full report: `w1/RevS126Quote.md` (6826 B, complete) exists for seat
   `RevS126Quote` (exit -9, `session=null`).** The table's input set claims "32 + 32 files, one
   pair per seat" (err/stream only) so it does not assert report absence; the escape-62 w1 attack
   follow-up explicitly accounts for this file as a dead-seat report (`RevS126Quote.md`). Note for
   the audit: the 32/5/27 dead-seat semantics concern exit codes/sessions, not report artifacts —
   one dead seat did write its report before the 420 s kill.
3. **Round-62 re-queue payload omits the report path and lane-bounds lines that the round-61
   dispatch carried.** Round-61 `w2-dispatch.json` for Audit19 appended: `Lane bounds: leaf
   member — no subagent dispatch.`, `Judged on: operability, coverage`, and
   `Report: write your scoped findings to .ufo/waves/round-61/w2/Audit19.md`. The round-62
   `w2-dispatch.json` task 34 (`Audit19`, role reviewer) contains only the godspeed header +
   task text — no `Report:` instruction, no report path. The seat's runner message and the
   assignment fix the path at `.ufo/waves/round-62/w2/Audit19.md`; the dispatch payload itself is
   ambiguous about where the report must land.
4. **No provider-prompt re-validation is evidenced; the re-queued payload is byte-near-identical
   to the one rejected as `invalid_prompt`.** The round-61 seat failed at dispatch (`close/w2-results.json`:
   status failed, exit 1, error `provider rejected task prompt as invalid_prompt`). The round-62 task
   payload reproduces the same prompt text (identical `Round60-DeadTable — Audit ...` wording; the
   `/skill:godspeed\n\n###` → `/skill:godspeed\n###` newline difference is the only delta). The
   frozen plan calls for the re-queued prompt to be provider-validated before dispatch; no w2
   launch/validation record exists yet (round-62 `close/` empty; no w2 launch-progress/log), so
   this requirement is not evidenced as met.

## 6. Result-path inspection

Round-62 paths inspected: `plan/` is empty and `.ufo/waves/round-62/plan.md` does not exist
(not in git tree either); `close/`, `baseline/`, `bundlescratch/` empty; `w1/` holds the eight
routed-item reports (incl. `Audit19.md` plan/evidence note); `w2/` holds `CounterReplay.md`,
`CriticC1.md`, `ControlMutation.md`, `LessonGate.md`, `ProxyAudit.md`, `R60Erratum.md`; no
`w2/Audit19.md` existed before this report. The whole `.ufo/waves/round-62/` tree is untracked at
`HEAD=0cbe0d75` (as is `round-61/controls/r61-c2-full-forgery.bundle`). No w2 dispatch progress,
launcher log, or results JSON exists yet for the re-queued seat.

## 7. Summary

The dead-seat table's substantive claims (counts 32/5/27, session pairing, pid/exit parity,
window, timeout-kill mechanic, 429/retry model, traceback exactness, full untruncated tails)
all re-derive cleanly from the committed blobs. The discrepancies are structural/process ones:
two rows break the table's own pipe-escaping convention; one dead seat's `.md` report exists;
and the round-62 re-queue payload is not yet evidenced as provider-validated and lacks the report
path/lane-bounds fields the round-61 dispatch carried.

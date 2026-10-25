# ExecDeadSeatTable — R60-V6 repair (round 61, w1)

Axis: operability. Milestone: R60-V6 repair.

## Deliverable

- Path: `.ufo/waves/round-60/close/dead-seats-r60.md` (115 lines, sha256 `c52532f37d5def6edb8f6e29a48deebc54a0ca6a847648e50527d7248881c4fb`). It is new and uncommitted; nothing was staged or committed.
- Counts: **32 seats; 5 exit=0, 27 exit=-9, 0 other.** These match the expected 5/27.
- Content: name/exit/session/pid (plus start/end/secs) for all 32 seats; the **full, untruncated** last error-text line for every dead seat; the launcher traceback quoted whole.

## Method (committed bytes only)

- Every input was read with `git show HEAD:<path>` at `HEAD=be4a820c344d4eb2f94b999c3b5d649e76ab70f1`. `git status --porcelain .ufo/waves/round-60` was empty, so the worktree equals HEAD for these inputs.
- Input blobs: `launcher-progress.tsv` = `df92492b4a48dfeb39f9e5a3729a2e08ac1b3d66`, `w1-launcher.log` = `d014d43024ed437d8f7b6741712f41647b1a9be2`, `launcher.py.txt` = `24fea66d3d2dba097c62abc3f49f83b9087660ee`, plus the 32 `.err` and 32 `.stream.jsonl` files.
- Generator (scratch, not durable): `/tmp/kumitate-r61/ExecDeadSeatTable/gen.py`. It asserts all of the following before it writes:
  - 32 rows, 5 with exit=0 and 27 with exit=-9.
  - Each progress row's `pid` equals the log's `spawn` line, and its `exit`/`session` equal the log's `settled` line.
  - Each exit=0 session equals the single `session.resume_hint` in that seat's stream.
  - No exit=-9 seat has a session id or a resume hint.
  - Every stream has at least one retry record.
- Post-write verification (second script, re-reading the committed blobs):
  - All 27 dead seats appear in the dead-seat table, none extra.
  - Every `.err` tail cell and every stream-tail cell equals the full source text; `|` is escaped, never cut.
  - The traceback block equals `w1-launcher.log` lines 65-68 byte for byte (4 lines = 4 lines).
  - Truncation-marker count in the document: **0**.

## Findings (in the deliverable)

- **The `-9` exits are the launcher's own timeout kill.** `SEAT_TIMEOUT = 420` (`launcher.py.txt:16`), and `proc.kill()` runs at lines 65-66. All 27 dead seats ran 420-421 s.
- **Rate limiting:** all 589 `turn.step.retrying` records across the 32 streams are `APIProviderRateLimitError` / 429, with `max_attempts=20` and `delay_ms` from 0.5 to 39.9 s.
- **Dead-seat error text, full and untruncated:**
  - Seven dead seats have an empty `.err`: ExecCapture, RevUsedBy, CritDropOne, MutTemplate, MutPipeRow, ScoutCollision, RevengerFlip. For those the table marks `(empty)` and gives the last retry/stream error as the error text.
  - Of the non-empty `.err` tails, only ExecDispatchGate's last line is an actual exception: `FileNotFoundError: ... 'dispatch-actual.json'`. The others are tool output, quoted as-is.
- **Crash traceback:** quoted whole from `w1-launcher.log` lines 65-68. It is the end of the log, and no `DONE` line follows it.
- **Crash cause:** `launcher.py.txt:79` escapes `\n` but not `\t` in `err_txt`.
  - Progress line 3 (ExecCensus, 13 tab fields) has its first field without `=` at `fields[1:]` element #6, which matches the traceback.
  - Line 26 (ScoutFrontier, 8 fields) has the same defect.
- **Registry:** the launcher's registry write (line 103) never ran. The committed `w1/swarm-registry.json` is a `ufo-swarm-registry-v1` file (createdAt `2026-10-25T02:18:21.213Z`), not launcher output.

## Correction to the brief

The brief counts 8 empty-`.err` seats, but the probe output finds 7 (0-byte files): the seven named above. The 8 is a miscount.

## Risks / blockers

- The only capped cell in the document is the "that field (first 80 chars)" column of the crash-cause table, and its header says so. No dead-seat error text and no traceback line is truncated.
- The launcher's crash bug (tab escaping at line 79) was not fixed here; that was out of scope.
- No blockers. No tools were installed or updated.

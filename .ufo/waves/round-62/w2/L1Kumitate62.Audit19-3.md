# L1Kumitate62.Audit19-3 — round-60 dead-seat table audit (R60-V6)

Target: `kumitate-shokunin/.ufo/waves/round-60/close/dead-seats-r60.md`
(blob `2f1b` at current lane HEAD `0cbe0d7`; evidence inputs unchanged from the
table's cited `be4a820c344d4eb2f94b999c3b5d649e76ab70f1`). Read-only check of the
claim set: counts 32/5/27, full `.err` tails with no truncation, verbatim launcher
traceback. All comparisons ran against committed blobs via `git show HEAD:<path>`
(32 `.err` + 32 `.stream.jsonl` + tsv + launcher log + `launcher.py.txt` + registry).

## Verdict

All headline claims verify. No material defect found. Two cosmetic deviations and
two prose line-number imprecisions noted below.

## Verified facts (evidence)

### Counts and cross-matching
- tsv rows = 32; launcher `spawn` lines = 32; `settled` lines = 32; seat-name sets
  identical.
- `exit=0` = 5 (ExecRows, ExecGates, ExecCensus, RevS190Quote, RevS133Quote);
  `exit=-9` = 27; other exits = 0. Distribution identical in tsv and settled lines.
- Per seat, tsv `pid` = spawn pid; tsv `exit`/`session` = settled exit/session
  (0 mismatches).
- Window: first start 1792894711 = 2026-10-25T02:18:31Z; last end 1792896200 =
  2026-10-25T02:43:20Z. All 32 table rows match tsv on exit/session/pid/start/end
  and `secs` = end − start.
- Dead seats: all 27 `exit=-9` durations ∈ {420, 421} s; table's dead-seat row set
  equals the actual `-9` set exactly (no missing, no extra).

### Session/resume rules
- Each `exit=0` seat's stream contains exactly one `session.resume_hint` event whose
  `session_id` equals the table's session; each contains `"session_id":`.
- No `exit=-9` seat's stream contains `"session_id":` or any resume_hint event
  (session=null consistent).

### Full errors, no truncation
- `.err bytes` column equals the committed blob byte size for every seat (incl.
  RevS126Quote 7579 — see note; ExecProxy 294225; ScoutFrontier 89287).
- `.err tail` (last non-empty line) matches byte-for-byte for 26/27 dead seats,
  including the long lines (RevS134Quote 779 B; MutDupGroup 1004 B).
- `stream tail` = last `turn.step.retrying` record formatted `APIProviderRateLimitError
  429: 429 Rate limit reached for requests (attempt N/20)` — exact for all 27.
- `retries` counts match per seat; across all 32 streams total = 589, `delay_ms`
  ∈ [500.35 ms, 39852.93 ms] — consistent with the report's "0.5 to 39.9 s".
- `last event` matches the true final stream record for all 27.

### Traceback
- `w1-launcher.log` has exactly 68 lines; the final 4 (lines 65–68) are the
  traceback, quoted verbatim, byte-identical to the report's block. No
  `DONE members=` line exists.
- The failing line is `launcher.py.txt:95` (`parts = dict(p.split("=", 1) for p in
  line.split("\t")[1:])`) — exact.
- Crash reproduction: progress line 3 ExecCensus has 13 tab fields with field #6
  (`fields[1:]` index 6) = `W04` (no `=`) → `dictionary update sequence element #6`;
  line 26 ScoutFrontier has 8 fields, #6 = `corpus/REA` (would also fail). Matches
  the report's "first offender" analysis.
- `w1/swarm-registry.json` is schema `ufo-swarm-registry-v1`, createdAt
  `2026-10-25T02:18:21.213Z`, 32 members — not the launcher's `{wave, concurrency,
  seatTimeoutSec, members}` shape; registry write (line 103) and DONE print never ran
  because the crash precedes them.

### Provenance
- Round-60 evidence blobs are byte-identical at `be4a820` and current HEAD (only
  the dead-seats markdown was added later); worktree porcelain clean for
  `.ufo/waves/round-60`. The table itself is committed at current HEAD, not at
  `be4a820` (that revision predates its authoring) — the report's "Derived only from
  committed blobs at HEAD=be4a820" refers to its inputs, which is accurate.

## Findings by severity

- **Low — CritQuarantine `.err` tail formatting.** Actual last non-empty line begins
  with six spaces (`      1 S178 the cited source could not be fetched…`); the table
  prints `1 S178…` (leading whitespace trimmed). Content otherwise identical; not
  truncation, but the "last non-empty line" cell is not byte-exact for this one seat.
- **Low — launcher.py.txt prose line references off by one.** `proc.kill()` calls
  are at lines 66 and 70 (report says "lines 65-66"); the row string is built at
  line 81 and appended/written at line 83 (report says "line 81 writes"). The cited
  traceback line 95 is exact.
- **Info — RevS126Quote `.err bytes` 7579 includes 18 CRLF bytes** inside an
  embedded HTTP transcript (`HTTP/2 200 \r\n…`); a text-mode read yields 7561. The
  table uses the true blob byte count, so the column is consistent as labeled.

## Residual risk / verification gaps

- Read-only audit over committed blobs; the launcher and kimi calls were not re-run,
  so the provider-429 backoff narrative is corroborated by stream contents but not
  independently reproducible now (all 27 dead seats end mid-rate-limit-backoff with
  APIProviderRateLimitError attempts, and durations are exactly the 420–421 s
  timeout window, consistent with launcher SIGKILL rather than self-crash).
- Session liveness beyond `resume_hint` (whether the 5 session ids are still usable)
  is out of scope for this table audit.
- The separate observation (sibling RevS126Quote.md) that dead seat RevS126Quote also
  produced a `.md` artifact is not contradicted by this table; it does not affect the
  32/5/27 counts or the err/stream evidence.

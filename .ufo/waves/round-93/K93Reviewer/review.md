# K93Reviewer — review of candidate `seat-route.mjs` v2 (round 93, C1)

Candidate: `.ufo/waves/round-93/K93ExecTool/seat-route.mjs`, sha256
`98a5a3a341b2b41540206caa5378d2ff5dacf02015f8aedf160b9d0f72b6efe9` (= `READY`, = `sha256sum`).
Plan read: `.ufo/waves/round-93/plan.md`. Oracle: `probe/oracle93.py`. All evidence below is in this
seat dir.

## What I checked, and how
- Hand reads of 8 real transcripts from the plan text (`hand-reads.md`, `hand-expected.jsonl`) vs oracle
  (`oracle-actual.jsonl`): **8/8 agree, 0 field diffs**. vs candidate `--file --json`: **8/8 agree**.
- Fixtures: candidate vs oracle on all 16 `probe/fixtures/F93*.jsonl`: **16/16 OK** (`fixdiff.txt`).
- Synthetic plan-vs-oracle edge suite (24 files, scratch): **0 diffs** (`synth-diff.txt` empty).
- Record key set: candidate == oracle (17 keys; no `errors`). Integers, booleans and lists are typed.
- `node seat-route.mjs --selftest` → `SEAT_ROUTE_SELFTEST: PASS held=54/54`.
- Kill (d) byte grep: `round-93`, `oracle93`, `probe93`, `fixtures` → 0 hits each.
- My own strace of a scratch copy on the r92 wave, using the probe's rule → `RUNTIME: CLEAN findings=0`,
  execve_count=1.
- Freeze `b6204949` committer time `2026-11-06T17:53:14-03:00` (= 20:53:14Z) < `--after` 21:40Z (kill f holds).

## Findings (by severity)

### MEDIUM — F1: `captured` diverges when the first subagent-role row has a non-string `model`
Repro: `s21-captured-break.jsonl` (row 1: `model_change` model `77`, role `subagent:s21-captured-break`;
row 2: model `D/m`, role `default`). Candidate `captured=null`; oracle `captured="D/m"`.
Plan text (`captured` unchanged from v1; r92 plan.md l.40-41): "`model` of the first `model_change` row whose
`role` is `subagent:<seat>`; if none, of the first … `default`". On the literal reading a subagent row EXISTS,
so captured is that row's `model` (non-string → null), and the **candidate matches the plan text; the oracle
does not** (oracle93.py `read_one` uses `if captured is None:` for the default-row search, so a null from the
subagent row falls through). This is a plan/oracle disagreement, and kill clause (c) says "also when the
oracle shares the error". The candidate contradicts the **oracle**, not the plan.
Exposure: 0 of 61 set-A files carry the pattern (my scan); not in F. A held-out H or wave transcript with it
would read DISAGREE and could fail the predicate on a plan-true reading. Route: L1 should state which reading
is binding before integration. The `?`-style null-model case is not omp-produced in my sample.

### MEDIUM — F2: JSON `null` `errorMessage` → candidate `last_error=null`, oracle `""`
Repro: `s13b-err-null.jsonl` (an earlier error turn with a string, then a last error turn whose
`errorMessage` is JSON `null`). Candidate `null`; oracle `""`. Plan: "null when no error turn (a non-string
`errorMessage` reads as the empty string)". JSON null is non-string, so the **plan and the oracle agree on
`""`; the candidate contradicts a field definition**. Cause: `lastErrorMessage = message.errorMessage;`
followed by `lastErrorMessage === null ? null : redactLastError(…)` — the sentinel `null` is the same value
as a JSON null. (A missing key → `undefined` → `""`, which is correct.)
This is a committed-reproduction kill-(c) shape if it lands at M unfixed. Fix: track `sawError` as a
boolean, or set `lastErrorMessage = typeof em === 'string' ? em : ''`. Add a selftest arm
(`errorMessage: null` → `""`). 0 of 61 set-A files have it; F93ErrNonStr only covers a number.

### LOW — F3: invalid UTF-8 lines — parse_errors and row content diverge
Repro: `utf8bad.jsonl` (an otherwise-valid object line holding byte `\xff`): candidate `parse_errors=0`,
oracle `1`. `utf8bad2.jsonl` (the `\xff` sits in the default-role model): candidate `captured="p/\ufffdm"`,
oracle `captured=null, parse_errors=1`. `linesOf` decodes with `StringDecoder('utf8')`, which replaces bad bytes
with U+FFFD; Python `json.loads(bytes)` rejects the line. Plan: "a line that does not parse to a JSON object"
— whether bytes that are not UTF-8 "parse" is not stated. Not a plan contradiction. Omp writes UTF-8 by
construction, so expected real exposure is ~0. Route as a definition gap: pin it in the plan, or decode
fatally (`new TextDecoder('utf-8', {fatal:true})` per line → parse error).

### INFO — reviewed and correct against the v2 text
- Type strictness: `flag_hops` uses `=== true`; selftest 17n rejects `1`, `false` and absent values.
  `recovered_attempts` uses `status === 'recovered'` with `isPlainObject(rr)` (arrays are rejected).
- First `session_init`: `sessionInitSeen` guard; `chain` is `isPlainObject(rb) && Array.isArray(rb.chain)`
  filtered to strings, so `[]` stays `[]`.
- Served-only `upstream` reads inside the `SERVED_STOPS` branch only. Error-only `superseded_by` reads inside
  `stop === 'error'` only, and a served turn's `retryRecovery` is never read.
- The `?` rule applies `turnModel()` to both turns and `supersededBy` (whole token `?`).
- `revert_hops`: the `else if (role === 'fallback')` after the flag test, so a flagged fallback row is a flag only.
- Redaction: a linear scan, redact before the 120 code-point cap, and the marker can be split by the cap,
  as in the oracle (my `s1b`-`s1e` probes all match).
- Selftest arms cover each v2 field, the `errors` rename and human-mode fields. Gaps: none for F1, F2 or F3.

### COUNTER note — builder receipt `score1.txt` is an expected VIOLATION, not a tool defect
`score1.txt`/`score2.txt` read `RUNTIME: VIOLATION findings=1` (`open …/round-93/K93ExecTool/seat-route.mjs`):
the probe flags the tool opening ITSELF because the candidate lives under `round-93/`. The `-clean` receipts
(a scratch copy of the same sha) read CLEAN. At M the tool lives at `scripts/`, so this does not apply.
The tool path is not the given results file, and the probe has no self-path exemption: anyone who runs the
probe on the candidate in place gets a false VIOLATION.

## Residual risk / gaps
- I did not run the full probe myself. I used the builder's 4 receipts (HELD 221/221, sha matches) and my own
  8+16+24 checks. The held-out H at `--after 21:40Z` and the round-93 wave are not scorable yet.
- F1 and F2 are not discriminated by A or F. Only a held-out or wave member would expose them.

## Erratum (appended): re-check of the rebuilt candidate, sha256 `f86bde98…d5829f1a` (READY rewritten)
I re-ran the checks against the new bytes; nothing above was edited. Results:
- `READY` matches `sha256sum`. `--selftest` → `PASS held=62/62`. Kill-(d) byte grep → 0 hits for each of the four patterns.
- 8 real transcripts plus 16 fixtures, candidate vs oracle → **24/24 agree**.
- F2 **FIXED**: `s13b-err-null.jsonl` now agrees with the oracle (`hasErrorTurn` sentinel, l.283/356/410).
- F1 **RESOLVED toward the oracle**: `s21-captured-break.jsonl` now agrees with the oracle (l.386-388: a non-string subagent model falls through to the first default/roleless row; selftest arms l.698/700). The plan text still says "if none", so L1 should record which reading binds. Today the candidate and the oracle share that reading.
- F3 **OPEN (LOW, definition gap)**: `utf8bad.jsonl` still differs on `parse_errors`; `utf8bad2.jsonl` still differs on `captured`, `fallback` and `parse_errors`.
- Not re-verified by me: the builder's re-scored HELD 221/221 receipts and the new `pyStrip` trim arms. I saw the code but ran no differential fuzz on it.

# K92ExecTool — Claim C1 `seat-route` (`kumitate-seat-route-v1`)

Status: candidate built, self-tested, scored HELD twice on the r91 wave; READY written.
Seat dir: `.ufo/waves/round-92/K92ExecTool/`. Lane tip at build: `4f3a8d63` (read-only use).

## 1. Artifact

| file | note |
|---|---|
| `K92ExecTool/seat-route.mjs` | candidate, 32767 B, plain Node v24.21.0, no npm deps, no env beyond `HOME`/`TMPDIR` |
| `K92ExecTool/READY` | one line: `3b8b6ce072db381a52fda44dd78cd9936be5b3fefd19f758328fe82b06002608` |
| `K92ExecTool/sha256.txt` | `3b8b6ce0…2608  seat-route.mjs` (`sha256sum -c` → `seat-route.mjs: OK`) |
| `K92ExecTool/score1.txt`, `score2.txt` | counter receipts (same tool bytes, same salt) |
| `K92ExecTool/selftest.txt`, `check.txt` | 30/30 arms; `node --check`, kill-clause grep counts, sha |
| `K92ExecTool/human-r91.txt`, `human-r90.txt`, `human-r91-strict.txt`, `human-r87.txt`, `strict-rounds.txt` | human-mode runs |

Modes exactly as plan § Claim C1: `--file T.jsonl [--json]`, `--results R.json [--sessions-root D] [--json] [--strict]`,
`--selftest`. Exit map 0 ok · 1 strict drift · 2 fail-closed · 64 usage. Transcripts are streamed line by line
(1 MiB `readSync` + `StringDecoder`; one line held, never the file); wave-mode location walks the sessions root
once and scans only `<seat>.jsonl` candidates in chunks for `/.ufo/waves/round-<round>/` and `<lane>-shokunin`.

## 2. Counter verdicts (the acceptance line)

Command (run form from the Goal, `--waves` r91 only; the round-92 wave is held out for the L1):

```
python3 .ufo/waves/round-92/probe/probe92-c1.py \
  --tool $PWD/.ufo/waves/round-92/K92ExecTool/seat-route.mjs \
  --index .ufo/waves/round-92/probe/index92.tsv \
  --sample-a .ufo/waves/round-92/probe/sampleA.tsv \
  --waves .ufo/waves/round-91/w1-results.json \
  --out $PWD/.ufo/waves/round-92/K92ExecTool/score{1,2}.txt
```

```
C92_C1: HELD agree=133/133 A=61/61 C=60/60 W=12/12 last_wave_located=12 salt=3b8b6ce072db381a tool_sha256=3b8b6ce072db381a52fda44dd78cd9936be5b3fefd19f758328fe82b06002608
C92_C1: HELD agree=133/133 A=61/61 C=60/60 W=12/12 last_wave_located=12 salt=3b8b6ce072db381a tool_sha256=3b8b6ce072db381a52fda44dd78cd9936be5b3fefd19f758328fe82b06002608
```

Both runs: `exit=0`, 0 `DISAGREE` lines (`grep -c '^DISAGREE'` → 0, 0; `check.txt`). Wall time per run: 4.26 s and 4.45 s.
The tool bytes scored are the bytes in READY: `salt` and `tool_sha256` both equal the READY hash (kill clause (e) holds
for these receipts).

## 3. Self-test — `SEAT_ROUTE_SELFTEST: PASS held=30/30`

Hermetic, under `mkdtempSync(join(tmpdir(), 'seat-route-selftest-'))` (honours `TMPDIR`), removed in `finally`.
Arms: clean-served · captured-from-default · captured-null (fallback stays false) · captured-first-subagent ·
answered-order/distinct · fallback · dead+redaction · aborted · errfix (error then served on one model) · silent ·
parse-errors (garbage line + JSON array line skipped, `parse_errors=2`) · redact-23-24 (23 kept, 24 → `<redacted>`) ·
cap-120 (cut after redaction) · nonstring-error (`""`) · yielded · other (unknown stopReason) · unknown-model `?/?` ·
wave-count · wave-newest-session (greatest first `session` timestamp wins, realpath, role from `agent`) ·
wave-absent (4 keys, `session:null`) · wave-unsafe-name (`../escape`) · wave-lane-marker-miss · wave-round-marker-miss ·
failclosed-results (exit 2) · failclosed-root (exit 2) · human-ok · strict-drift (exit 1) · json-array · usage-64 ·
usage-strict-file (exit 64).

## 4. Human mode on real waves

`human-r91.txt` (12 seats, `SEAT_ROUTE: OK seats=12 served=12 dead=0 aborted=0 silent=0 absent=0 fallback=4`) reproduces
the plan's pre-data evidence, which the r91 report does not state:

```
SEAT K91Scout role=scout captured=google-antigravity/claude-opus-5-5 answered=minimax-code/MiniMax-M3.1-Flash fallback=true errors=1 aborted=0 final=served yielded=true last_error="Cloud Code Assist API error (429): {"
SEAT K91Reviewer role=reviewer captured=zai/glm-5.3-flashx answered=zai/glm-5.3-flashx,commandcode/z-ai/glm-5.3-flash fallback=true errors=5 ...
SEAT K91ScribeSources role=scribe captured=minimax-code/MiniMax-M3.1-Flash answered=minimax-code/MiniMax-M3.1-Flash fallback=false errors=1 ...
```

`human-r90.txt`: `seats=12 served=12 dead=0 aborted=0 silent=0 absent=0 fallback=6` — the r90 "12/12 COMPLETE" reading is a
completion count, not an answering-model claim; six seats answered on a model other than the captured one
(e.g. `K90Connector captured=zai/glm-5.3-flash answered=anthropic/claude-haiku-5-5`).
`human-r91-strict.txt`: `SEAT_ROUTE: OK …` exit 0 (no dead/absent/silent seat in the r91 wave).

Drift path on older waves (`strict-rounds.txt`, exit codes captured with `PIPESTATUS[0]`):

```
r82 exit=1  DRIFT seats=14 served=11 dead=3  drift=K82ReviewC1,K82MutCounters,K82Sentinel
r84 exit=0  OK    seats=10 served=10
r86 exit=1  DRIFT seats=12 served=7  dead=5  drift=K86Review,K86Critic,K86Mutation,K86Sentinel,K86Revenger
r87 exit=1  DRIFT seats=14 served=7  dead=7  drift=K87ExecClose,K87ExecSources,K87Review,K87Critic,K87Mutation,K87Revenger,K87Review2
r88 exit=0  OK    seats=12 served=12
r89 exit=1  DRIFT seats=13 served=9  dead=4  drift=K89ScribeSources,K89ScribeLesson,K89Critic,K89Sentinel
```

`human-r87.txt` names the last error of a dead seat with redaction intact:
`SEAT K87ExecClose … final=dead … last_error="401 Invalid 'Authorization' header or token. (type=authentication_error param=UNAUTHORIZED)"`
(the shape survives, the token does not — the 24+ run was never present because the message carries no credential).

## 5. Kill-rule self-check

- (a) HELD twice: yes (§2).
- (b) pre-data controls: not re-run by this seat (they ran before any candidate existed; `controls/` is read-only to me).
- (c) field-definition contradiction on a real transcript: none found across 121 scored transcripts + 5 real waves (72 seats).
- (d) no reference to the round-92 wave dir: `grep -c -E 'round-92|oracle92|probe92' seat-route.mjs` → **0** (`check.txt`).
  The plan citation in the header names the plan by text, not by path, and the drift fixtures are built from
  `round-${round}`.
- (e) bytes scored = bytes shipped: `salt`/`tool_sha256` = READY hash (§2).

## 6. Counter findings (not kill events)

1. **The plan's record list omits `parse_errors`, but the oracle emits it and the counter scores it.** The first
   scored run (before adding the key) read `UNMET agree=0/133`, every record `fields=parse_errors`. A tool
   implementing only the plan's field table — which never names `parse_errors` among the keys, only in the Rows
   paragraph — cannot reach HELD. Routed: the frozen plan's field list should name the key. Scope note: with the
   key absent, A/C/W all disagree; so the counter is sensitive to it even for transcripts with zero bad lines.
2. **HELD covers a narrow surface.** The counter only invokes `--file … --json` (A, C) and `--results … --json` (W).
   Human mode, `--strict` exit 1, fail-closed exit 2 and usage exit 64 are unscored; they are covered here by
   selftest arms 22–24 and by `strict-rounds.txt`. A construction could reach HELD with a broken human line and a
   zero exit code on every error — HELD does not license the tool's other modes.
3. **Absent/unsafe seat names are not exercised by the scored wave.** All 12 r91 seats are located, so the
   `{seat, role, session, final:"absent"}` branch and the untrusted-name rule are scored only by sample A/C if such
   a transcript is drawn; the round-92 wave (held out) may exercise them. This is the one shipped behaviour whose
   counter coverage is probabilistic, not proven.

## 7. Resources / risks

- 204 077 794 B parent transcript: `--file` 1.57 s, peak RSS 310 512 KiB (`/usr/bin/time -v`) — the peak is the
  largest single JSON line, not the file; 2.6 MB sample transcript: 0.03 s / 64 MB baseline. Wave mode on r91:
  0.21 s, 92 240 KiB. Store-wide walk is ~20k `readdir` entries per wave invocation.
- Risk: a transcript with one multi-hundred-MB line costs that line's size in RSS (by design of "line by line").
- Deliberate choices recorded in the header: unsafe seat name (`/`, `\`, NUL, `..`) locates nothing → `absent`,
  `session:null`; `role` absent in results.json → `null`; human mode prints `-` for a null captured/answered and
  `last_error=null` for no error turn.
- `parse_errors` value shape: integer count of non-empty lines that do not parse to an object (skipped, never fatal).

Scratch `/fast/scratch/hyaku/kumitate-r92/K92ExecTool/` removed after the receipts were copied into this seat dir; no
`/tmp` path is cited.

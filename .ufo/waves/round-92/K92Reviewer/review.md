# K92Reviewer — review of the round-92 frozen instruments and candidate `seat-route.mjs`

Read-only review. Lane writes: this seat dir only. Frozen instruments were not edited;
their sha256 at review time matched the freeze commit `596f675` for `oracle92.py`.

## Verdict

- The frozen oracle, counter and controls are internally consistent with their receipts, with
  two blocking items for the scoring step (F2 counter HELD semantics; F1 oracle/plan mismatch
  routed, dormant).
- The shipped candidate (sha256 `3b8b6ce072db381a52fda44dd78cd9936be5b3fefd19f758328fe82b06002608`,
  identical at `scripts/seat-route.mjs` and in `K92ExecTool/`) matches the oracle on every
  scored field in the frozen counter (133/133), on the 7 hand-read transcripts (my reader
  agrees with the oracle on all fields), on the r91 wave arrays (12/12), and on a 41 MB transcript
  with 126 MB peak RSS. No kill-rule (d) hit (grep of its bytes for round-92/oracle92/probe92 = 0).
- No actionable kill-rule (a)-(e) event found. One candidate-side divergence from the oracle exists
  (F1) but it is dormant on the real population and the candidate matches the plan text.

## Findings

### F1 — non-blocking (instrument defect routed; dormant in the 23206-row population)

`captured` on a subagent row whose `model` is not a string. plan.md: "`captured`: `model` of the first
`model_change` row whose `role` is `subagent:<seat>`; if none, …". A row exists, so the literal
reading is null. `probe/oracle92.py:55-61`: the first loop sets `captured = None` and breaks;
`if captured is None:` (line 61) then falls through to the default-row scan and returns
"default/a" on the fixture. Evidence: `K92Reviewer/edge1b.jsonl`:
- oracle92.py `captured` = "default/a"
- my reader `myread.py` (plan sentence only) = null
- shipped `seat-route.mjs` = null (`seat-route.mjs:271` uses `hasSubagent`, not the model)

Population check: `index92.tsv` 23206 transcripts, first-subagent-row model non-string in 0
(`K92Reviewer/population-scan.txt`, rerun this seat). Consequence: a correct candidate that follows
the plan sentence would be scored DISAGREE on a future real transcript of this shape; the frozen
oracle cannot be fixed (frozen). Not a kill event: the shape is not in the population and no real
transcript was shown to contradict the candidate. Route: record in the L1 report as an oracle
defect; do not claim the oracle is the plan's literal reading.

### F2 — blocking (counter semantics; HELD does not require the held-out wave)

`probe/probe92-c1.py:173-175`: `last_located` is the located count of the LAST entry of `--waves`;
HELD requires `last_located >= 8`. Nothing checks that the last entry is the round-92 results file.
Evidence: `K92Reviewer/counter-r91only-run1.txt` (candidate, `--waves …/round-91/w1-results.json` only):
`C92_C1: HELD agree=133/133 … W=12/12 last_wave_located=12`, rc 0. The pre-data control
`controls/table.txt` row `ctl-positive-oracle` is also HELD with r91 alone.

The plan's frozen predicate lists `--waves …round-91/w1-results.json,…round-92/w1-results.json`, so
the predicate is correct when used exactly. But the counter's HELD sentence ("the round-92 wave …
has ≥ 8 seats") is not enforced by the counter. The L1 scoring step MUST confirm the `cmd=` line in
the receipt contains the round-92 `w1-results.json` as the last `--waves` entry, and that the
round-92 wave has ≥ 8 located seats, before accepting HELD.

### F3 — non-blocking (sample coverage gap; redact and parse-error strata are empty)

plan.md C-quota: fallback 12, dead 6, aborted 6, silent 4, errfix 8, multi 8, clean 12, redact 4,
parseerr 2, capnone 4 = 66. Actual `C_ITEM` count = 60 (`counter-r91only-run1.txt`): aborted 6,
capnone 4, clean 12, dead 6, errfix 8, fallback 12, multi 8, silent 4. Missing: redact 4 and parseerr 2.
Cause, from `index92.tsv` strata counts: redact = 1 row (C2ExecF, which is in sample A and excluded),
parseerr = 0 rows, other = 0 rows. `draw()` silently takes fewer.

Consequences: (i) the redaction field is pinned by one real transcript (in A); the frozen
`ctl-noredact` ablation scores 132/133 because that single transcript is the only discriminator
— the redact rule is effectively untested on real data beyond one case; (ii) `parse_errors` is
exercised by no real transcript in A or C (only by my synthetic `edge4.jsonl`); (iii) `final=other`
has no real transcript. HELD still holds on the 60 scored items, so this does not change the verdict,
but it limits what the counter proves for redaction and parse errors.

### F4 — non-blocking (counter scores JSON only)

`probe92-c1.py:score_files` and `score_wave` call the tool only with `--json`. Human mode lines,
the `SEAT_ROUTE:` verdict line, and the exit-code map (0/1 strict/2/64) are unscored. A tool with a
wrong human-mode line or a wrong exit map passes HELD. The candidate's human/exit behaviour was
checked by hand instead (see below).

### F5 — non-blocking (wave mode has no live-file guard)

File mode skips transcripts modified < 900 s (`probe92-c1.py:score_files`, `LIVE_S`). Wave mode
(`score_wave`) reads the oracle record and the tool record at two instants with no live check. If an
r92 seat is still writing when scoring runs, oracle and tool read different bytes → false DISAGREE.
Mitigation for L1: score wave mode only after every round-92 seat has yielded (or the orchestrator
has confirmed no seat is running).

### F6 — non-blocking (dormant divergences between candidate and oracle; population has none)

- Symlinks: `seat-route.mjs` `walkJsonl` uses `Dirent.isFile()`, which is false for a symlink
  (checked: `RealSeat.jsonl isFile=true`, `LinkSeat.jsonl isFile=false isSymlink=true`). The oracle's
  `os.walk` includes symlinked filenames: a fixture with `LinkSeat.jsonl` → `RealSeat.jsonl` gives
  oracle `locate` = found, candidate `final=absent`. Population: `find sessions -type l` = 0.
- Non-string session `timestamp`: oracle `str()`s it, candidate returns null → ''. Checked 400 random
  transcripts: all string.
- Seat names containing `..` anywhere are rejected by the candidate (`UNSAFE_NAME`) but accepted by
  the oracle's name match. Only matters if a results name contains `..`.

### F7 — non-blocking (counter does not enforce the kill-rule (d) "seat-shown runtime read")

Kill (d) is enforced by a byte grep and by review. The candidate's grep count for
`round-92|oracle92|probe92` is 0; its only `round-` text is the selftest fixture strings
(`seat-route.mjs:693`, `:744`), which write fixture text and never read the lane. No runtime read
of `.ufo/waves/round-92/` was observed: `strace` was not run; the static read list is
`openSync`/`opendirSync`/`readFileSync` on transcript paths and `results` only (lines 124, 151, 319, 376).
Residual: a runtime read via a path built from parts would not be caught by the byte grep.

### Candidate checks (step 3)

- Definition faithfulness: the candidate matches the oracle on 133/133 frozen-counter items
  (`K92ExecTool/score1.txt`, `score2.txt` reproduced by me in `counter-r91only-run1.txt`), 70/70
  compared fields on the 7 hand-read transcripts, 12/12 wave records (`oracle-wave.json` vs
  `tool-wave.json`, realpath-normalised), and all 4 synthetic edges except F1 (edge1b) and F6.
- Streaming: `ResumeSeance.jsonl` (41 MB, largest in the sessions root by `ls -S`): `prlimit
  --as=4294967296 timeout 600 node seat-route.mjs --file … --json` → rc 0, 0.24 s wall, max RSS
  126348 kB (`large-time.txt`, `large-rec.json`). Oracle parity on the 18 MB `KotodamaR76.jsonl`:
  ALL-MATCH (`tool-koto.json`, `oracle-koto.json`).
- Human mode and exit map (my runs): r91 → `SEAT_ROUTE: OK seats=12 served=12 dead=0 aborted=0
  silent=0 absent=0 fallback=4`, rc 0 with `--strict`; a results file naming a dead-only seat
  (`RV02C2Attack`, which is not located under round-91) → `SEAT_ROUTE: DRIFT … absent=1 drift=RV02C2Attack`, rc 1;
  usage → rc 64; missing transcript → rc 2. `dead-results.json` is kept in this dir.
- Non-jsonl `--file` input (e.g. the results json) is accepted as a transcript (`seat=w1-results`). Minor,
  non-blocking; the tool's contract says `<Seat>.jsonl`.
- `spawnSync` (`seat-route.mjs:65`, used at 729-768) is self-test only: it re-invokes the tool on temp
  fixtures; not a lane read.
- Shipping state: `scripts/seat-route.mjs` exists at the lane root, untracked (`?? scripts/seat-route.mjs`),
  sha256 equal to the candidate. Not committed at review time. Kill (e) can only be confirmed at M
  by re-hashing the committed file.

## Residual risk and verification gaps

- F2 is the only blocking item; the rest are non-blocking.
- I did not run the full frozen predicate (needs the round-92 wave, which does not exist yet); the
  r91-only counter run above is the substitute, and the L1 must run the full predicate.
- Mutation/kill of the counter with an incorrect tool: not run here; the pre-data controls already
  show the counter distinguishes seven one-field ablations (54..132/133).
- The `__pycache__` directories under `probe/` and `controls/` are untracked bytecode; I did not
  delete them (cannot prove which run created them). They are harmless to scoring.
- Assignment conflict: the task text asks for the report at `.ufo/waves/round-92/w1/K92Reviewer.md`,
  but the contract restricts writes to this seat dir. This review is at
  `.ufo/waves/round-92/K92Reviewer/review.md` (copy of the findings in the yield).

## Handread table

Full derivation: `K92Reviewer/handread.md`. Summary (oracle vs my plan-only reader, all fields):

| transcript (stratum) | captured | answered | errors | aborted | fallback | final | last_error | yielded | parse_errors |
|---|---|---|---|---|---|---|---|---|---|
| CritGlobal (fallback) | zai/glm-5.3 | 3 models | 2 | 0 | true | served | Devin resource_exhausted line | true | 0 |
| RV02C2Attack (dead) | zai/glm-5.3-flashx | [] | 6 | 0 | false | dead | 429 retry-budget line | false | 0 |
| R45CritIntent (aborted) | kimi-code/kimi-for-coding | [devin/swe-2] | 1 | 1 | true | aborted | 429 usage line | false | 0 |
| Mo50CritContractFreeze (silent) | null | [] | 0 | 0 | false | silent | null | false | 0 |
| K70ConnectPatterns-26 (errfix) | kimi-code/kimi-for-coding | same | 1 | 0 | false | served | 429 line | true | 0 |
| Mo50ConnConsiderthese-2 (capnone) | null | [] | 0 | 0 | false | silent | null | false | 0 |
| C2ExecF (redact) | cursor/deepseek-v41-flash-1017 | 2 models | 2 | 0 | true | served | `error ID: <redacted>` | true | 0 |

All seven: 70/70 compared fields ALL-MATCH between the oracle and my reader; jq cross-checks on
CritGlobal, RV02C2Attack, C2ExecF agree on stopReason counts, first subagent model, and yield rows.

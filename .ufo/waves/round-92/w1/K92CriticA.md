# K92CriticA — counter-attack report (C1 `seat-route`)

Scope: attack the counter, not the task owner. Everything below is driven from
`.ufo/waves/round-92/K92CriticA/` (constructions, receipts, evidence); nothing under `scripts/`,
`corpus/`, `probe/`, `controls/` or `plan.md` was written. No tool instalments.

## Counterexample (five, all HELD 133/133)

| construction | A | C | W | wrong per the definitions? |
|---|---|---|---|---|
| `x1-oracle-glob.mjs` — execs the reference reading found via `round-*/probe/oracle*.py`; **grep for `round-92`/`oracle92`/`probe92` = 0** | 61/61 | 60/60 | 12/12 | passes kill rule (d)'s stated test while reading a round-92 file at run time |
| `x2-parseerr0.py` — the missing 8th one-field ablation | 61/61 | 60/60 | 12/12 | yes: `parse_errors` unimplemented — **0 transcripts in 23206 have one** |
| `x3-boolcounts.py` — counts as JSON booleans | 61/61 | 60/60 | 12/12 | yes: `false` is not "count of turns"; `0 == False` makes `diff` agree |
| `x2b-redact23.py` — redacts 23+ chars, definition says 24+ | 61/61 | 60/60 | 12/12 | yes, but the rule has one live instance (32-hex id), in the visible A |
| `x6-memo.py` — lookup table for all 23206 visible transcripts, no round-dir read | 61/61 | 60/60 | 12/12 | no real transcript; **wrong by construction on any new transcript** |

Receipts `rcpt-x1-run1|run2|freshsalt`, `rcpt-x2-parseerr0(-freshsalt)`, `rcpt-x2b-redact23`,
`rcpt-x3-boolcounts`, `rcpt-x6-memo(-freshsalt)`. x1, x2 and x6 also read HELD with a random
`--salt` (a different 60-file C draw).

## Evidence

1. **C is not held out.** `evidence-predict-c.txt`: `draw()` re-implemented from `index92.tsv` +
   `sampleA.tsv` + the salt reproduces the receipt's `C_ITEM` list exactly, in order, 60/60 — for my
   salt and for the shipped candidate's salt `3b8b6ce0…`. `salt = sha256(tool bytes)`, so the author
   computes C before freezing. `x6-memo.py` shows the next step is trivial: memorise the population
   (23206 rows, enumerated in the lane) → HELD under any salt. **Only W(r92) is genuinely held out.**
2. **Kill rule (d) is a byte grep** (`round-92|oracle92|probe92 > 0`). x1 evades it with a glob and
   still executes the oracle. The rule's own text ("reads, imports or executes") is violated while
   its stated detection stays silent.
3. **`parse_errors` is unfalsifiable** (`evidence-coverage.txt`): `parseerr` = 0/23206. The control
   battery has no `ctl-parseerr`; if it had one, it would read HELD and trip kill rule (b).
4. **Threshold arithmetic**: quota 66, `redact` eligible 0 (its only row is in A), `parseerr` 0 →
   **max C = 60** against `nc >= 55` (slack 5); A 61 against `na >= 55` (slack 6). The live-file skip
   in `draw`/`score_files` is **not replaced**, so 6 lost items make a correct tool read UNMET.
   0 indexed paths are missing; 10 were modified <900 s ago during this wave.
   Zero-instance branches in 23206: `final == "other"`, `?` model, BOM, `NaN`, astral-in-120-cut,
   non-string subagent model, parse errors.
5. **`--waves R1,<missing>` raises an uncaught `FileNotFoundError`, rc=1, no receipt, no
   `C92_C1:` line** (probed against `.ufo/waves/round-92/w1-results.json`, absent). The frozen
   predicate cannot be run before the r92 wave settles, and a broken invocation looks like UNMET.

## Candidate (kill rule (c)) — no reproduction

`evidence-candidate-diff.txt`, `evidence-edge-cases.txt` (READY bytes `3b8b6ce0…`),
`evidence-candidate-diff-shipped.txt`, `evidence-edge-cases-shipped.txt` (shipped bytes `416e917c…`):
1200 random unseen population transcripts 0 disagreements (both), 192–194 transcripts modified <4 h
0, wave mode on the 12 live round-92 seat names from `w1-spec.json` (12/12 located) 0. Edge cases:
5 divergences on the READY bytes, **3 on the shipped bytes** — `e2` UTF-8 BOM line, `e3` `NaN`
literal, `e5` first subagent `model_change` carrying a non-string model (oracle falls back to the
earlier default-role row, tool returns null). All three have **0 instances in 23206** → no
kill-rule (c) event. `e11` (served turn with a missing/empty provider or model) and `e7` (astral
character in the 120-char `last_error` cut) were divergences in the READY bytes and are fixed in the
shipped bytes; `e5` is a definition ambiguity (the prose favours the tool, the frozen executable form
is the oracle) to route.

## Artifact integrity (found while attacking the candidate)

- **READY ≠ shipped.** `sha256(scripts/seat-route.mjs) = 416e917c…`, `K92ExecTool/READY` and the
  builder's `score1.txt`/`score2.txt` say `3b8b6ce0…`. Under kill rule (e) as written, the builder's
  receipts do not bind the shipped bytes. I re-scored the shipped file myself:
  `rcpt-shipped-run1.txt` / `rcpt-shipped-run2.txt` → **HELD 133/133 ×2, tool_sha256=416e917c…**,
  and the C draw is again predicted exactly from its sha256 (`evidence-predict-c-shipped.txt`).
- **Kill rule (d) fires literally on the shipped file**: `grep -c -e round-92 -e oracle92 -e probe92
  scripts/seat-route.mjs` → **1** (a comment on line 196 citing "round-92 K92Sentinel RD-6"). No
  round-92 file is read at runtime, but the clause's stated test does not pass — and x1 shows the
  same test misses a real glob-delegation. The clause needs a runtime read check, not a byte grep.


## Impacted axes

C1 predicate (A/C/W), kill rules (b) and (d), the plan's "post-freeze held-out probe set" claim, and
the coverage claim implied by the seven-control table.

## Smallest safe correction

- **Make C actually held out**: do not commit `probe/index92.tsv` (or the population it enumerates)
  before M — build the index at scoring time; draw with a random secret salt; and make a W(r92) pass
  mandatory (it already is) rather than treating A+C as the holdout.
- **Replace the (d) grep with a runtime check**: run the tool's own invocations under
  `strace -f -e trace=openat` and fail on any open under `.ufo/waves/round-92/`; keep a grep only as
  a smoke test, widened to `round-*`, `.ufo/waves`, `probe`, `oracle`.
- **Type-strict `diff`** (`type(x) is type(y)`, or canonical JSON per value).
- **Resolve `parse_errors`**: drop it from the field set, or supply a transcript that exercises it.
- **Fail closed on a missing/unreadable `--waves` file** (print `FAIL-CLOSED`, exit 2, still write
  the receipt) instead of a traceback.

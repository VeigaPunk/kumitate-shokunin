# K92CriticA — attacks on the C1 counter (round 92)

Assignment: falsify `probe92-c1.py`. Read-only on the lane; every construction below lives in
`.ufo/waves/round-92/K92CriticA/` and was scored with the frozen command (`--waves` r91 w1 only, as
the seat run form specifies). Re-drive any receipt with:

```
python3 .ufo/waves/round-92/probe/probe92-c1.py \
  --tool .ufo/waves/round-92/K92CriticA/<tool> \
  --index .ufo/waves/round-92/probe/index92.tsv \
  --sample-a .ufo/waves/round-92/probe/sampleA.tsv \
  --waves .ufo/waves/round-91/w1-results.json --out .ufo/waves/round-92/K92CriticA/<rcpt>.txt
```

Headline: **five constructions read HELD 133/133** — two of them without implementing a single
field definition (delegation, memorisation), one of them a one-field ablation the control battery
does not contain, one of them a type violation, one an off-by-one on the only rule with a single
live instance. The counter does not measure "implements the definitions"; it measures "agrees with
121 records that were all computable before the tool was final".

## 1. Constructions

| id | tool (sha256 in receipt) | A | C | W | HELD | fresh salt | verdict |
|---|---|---|---|---|---|---|---|
| x1 | `x1-oracle-glob.mjs` — finds the reference reading by directory glob `round-*/probe/oracle*.py` and execs it | 61/61 | 60/60 | 12/12 | **yes** ×2 | **yes** | **counter defect** — kill rule (d) |
| x2 | `x2-parseerr0.py` — the missing 8th one-field ablation (`parse_errors` forced 0) | 61/61 | 60/60 | 12/12 | **yes** | **yes** | **counter defect** — field untestable |
| x3 | `x3-boolcounts.py` — `errors`/`aborted`/`parse_errors` emitted as JSON booleans | 61/61 | 60/60 | 12/12 | **yes** | — | **counter defect** — `diff` is not type-strict |
| x2b | `x2b-redact23.py` — redacts 23+ runs instead of 24+ | 61/61 | 60/60 | 12/12 | **yes** | — | coverage only |
| x6 | `x6-memo.py` — lookup table of all 23206 visible transcripts; no round-dir read at runtime | 61/61 | 60/60 | 12/12 | **yes** | **yes** | **counter defect** — C is not held out |

x6's 9.9 MB table lived in scratch and was removed with it (contract); regenerate it with
`python3 x6-gen.py /fast/scratch/hyaku/kumitate-r92/K92CriticA/x6-table.json` (~95 s) before
re-scoring x6.

Receipts: `rcpt-x1-run1.txt`, `rcpt-x1-run2.txt`, `rcpt-x1-freshsalt.txt`,
`rcpt-x2-parseerr0.txt`, `rcpt-x2-parseerr0-freshsalt.txt`, `rcpt-x2b-redact23.txt`,
`rcpt-x3-boolcounts.txt`, `rcpt-x6-memo.txt`, `rcpt-x6-memo-freshsalt.txt`.

### x1 — kill rule (d) is a byte grep, and a byte grep is evadable
`grep -c -e round-92 -e oracle92 -e probe92 x1-oracle-glob.mjs` → **0** (rc=1), i.e. the stated
detection does not fire, yet the tool *executes* `.ufo/waves/round-92/probe/oracle92.py` on every
call. It discovers the file by globbing `.ufo/waves/<round>/probe/oracle*.py` from cwd. HELD on two
runs and with `--salt criticA-fresh-…` (a different 60-file C draw).
A shipped candidate can be a 45-line shim and read 133/133; the claim then asserts nothing.

### x2 — `parse_errors` cannot be scored: the population has no parse error
`index92.py` labels `parseerr` for `parse_errors > 0`: **0 rows in 23206** (`evidence-coverage.txt`).
So the eighth one-field ablation (drop the parse-error rule entirely) reads **HELD 133/133**, with a
fresh salt too. Consequence: the control table's seven ablations are not a complete cover, and the
one control that would complete it — `ctl-parseerr` — reads HELD, i.e. **adding it to the battery
would trip kill rule (b)**. The rule set's `parse_errors` clause is unfalsifiable on the frozen
population (and on A).

### x3 — `diff` accepts booleans for counts
`diff()` compares with `!=`; in Python `0 == False` and `1 == True`. A record that emits `false`
where the definition says "count of turns" agrees on all 121 file-mode items (all counts in the
population are 0 or 1 … in C the 36 `errors>0` items happen to be 1). HELD 133/133. Same channel
would accept `1.0` for `1` or `"seat"`-shaped coercion; the comparison should be type-strict.

### x2b — the redaction rule has exactly one live instance, and it is in the visible A
`redact` stratum: **1 row in 23206** — and that row is in `sampleA.tsv`, so `draw()` can never
select it (eligible = 0). The single instance is one 32-hex-char error id. A threshold of 23
instead of 24 is invisible to A and to C, and reads HELD. Not a scoring defect on today's
population, but the rule is verified against one string, visible at freeze: a candidate can tune
the regex to it and never learn it generalises or not.

### x6 — the C sample is a public function of the shipped bytes
`evidence-predict-c.txt`: re-implementing `draw()` (min-hash `sha256(salt+"\0"+path)` over
`index92.tsv`, sampleA excluded) reproduces the receipt's `C_ITEM` list **exactly, in order, 60/60**
— for x1's salt *and* for the shipped candidate's salt (`3b8b6ce0…`). Since `salt = sha256(tool
bytes)`, anyone holding the candidate computes the exact C set before freezing it. `x6-memo.py`
takes the next step: answers for all 23206 indexed transcripts, keyed by path, no round-dir read at
runtime → HELD under any salt (verified with a random one). The plan's claim that C1 "scores on
inputs no candidate can see before it is final" holds for **W(r92) only**, not for A and not for C.
x6 also has no human mode, no `--selftest`, no strict exit map, and still reads HELD: the frozen
predicate scores none of the contract's stated CLI surface.

## 2. Do-nothing / cheaper-readings attack
`ctl-absent` 0/133 is real, but "cheaper than the seven controls" reaching HELD exists in three
independent ways (x2: drop one rule; x3: wrong types; x6: no reading at all, just recall). The
counter's floor is therefore not "implements the definitions" — it is "agrees with 121 records",
and those 121 records are all derivable from lane-committed artefacts (`index92.tsv`, `sampleA.tsv`)
plus a reference implementation that also lives in the lane.

## 3. Threshold arithmetic (`evidence-coverage.txt`)
- Quota 66 → **max drawable C = 60**: `redact` eligible 0 (its only row is in A), `parseerr` 0
  (no parse-error transcripts). Threshold `nc >= 55` → **slack 5**.
- `na`: sampleA 61, threshold 55 → slack 6. 0 A files missing.
- Live exclusion can only shrink: `draw()` skips files modified < 900 s before scoring and
  `score_files()` re-checks; a skipped item is **not replaced**. 10 indexed transcripts were
  modified < 900 s ago while this wave ran. Any 6 losses → a *correct* tool reads UNMET.
- Branches with **0 instances in 23206**: `parse_errors > 0`, `final == "other"`, a served turn
  with a missing/empty/non-string provider or model (⇒ `?`), a UTF-8 BOM, a `NaN` literal, an
  astral character inside the 120-char `last_error` cut, a subagent `model_change` with a
  non-string model. Each is a rule a tool can implement arbitrarily.
- `last_error` at the 120 cap: 8131 rows (heavily exercised); `redact`: 1.

## 4. Candidate attack (kill rule (c)) — no reproduction found
`evidence-candidate-diff.txt`, `evidence-edge-cases.txt`.
- 1200 random unseen population transcripts: **0 disagreements**.
- 194 transcripts modified < 4 h (this wave's live seats, incl. mine): **0**.
- wave mode on the 12 live round-92 seat names from `w1-spec.json` (12/12 located, real bytes):
  **0**.
- 21 synthetic edge cases: **5 divergences, all latent (0 real instances)** —
  `e2` BOM (oracle parses the BOM line, candidate counts a parse error);
  `e3` `NaN` (Python's `json` accepts it, JS does not);
  `e5` first subagent `model_change` with a non-string model (oracle falls back to the earlier
  default-role row, candidate returns null — here the **prose favours the candidate** and the
  frozen executable form says otherwise: an ambiguity to route);
  `e7` `slice(0,120)` in UTF-16 code units vs 120 code points (astral only);
  `e11` served turns with a missing/empty provider or model (oracle: the whole turn model is `?`,
  one distinct value; candidate: per-part `p/?` and `?/m`, two distinct values — **prose favours
  the oracle**).
Only `e11` is plausibly reachable in the held-out wave (a harness writing a served turn without a
provider); the other four need transcript shapes that do not occur.

## 5. Shipped artifact (`scripts/seat-route.mjs`) — integrity findings

`sha256(scripts/seat-route.mjs) = 416e917c…` but `K92ExecTool/READY` says `3b8b6ce0…`, and the builder's
`score1.txt`/`score2.txt` receipts carry `3b8b6ce0…`. **The bytes the builder scored are not the bytes
in `scripts/`** — kill rule (e) as written ("the bytes scored differ from the bytes shipped at M
(sha256 in both receipts)") is satisfied against the builder's receipts. My receipts
`rcpt-shipped-run1.txt` / `rcpt-shipped-run2.txt` score the shipped bytes themselves:
**HELD 133/133 ×2, salt=416e917cb51cc585**. The builder must re-issue its receipts against the
shipped file (or ship the READY bytes) — the pairing is otherwise broken.

**Kill rule (d) fires literally on the shipped file**: `grep -c -e round-92 -e oracle92 -e probe92
scripts/seat-route.mjs` → **1**, the comment at line 196 ("round-92 K92Sentinel RD-6 …"). Nothing is
read at runtime (my x1 receipt shows the grep cannot distinguish a comment from a glob-delegation),
but the rule's stated test does not pass as written. The clause needs a runtime read check, not a
byte grep.

Shipped-byte behaviour vs the oracle (`evidence-candidate-diff-shipped.txt`,
`evidence-edge-cases-shipped.txt`): 1200 random unseen population transcripts 0 disagreements; 192
fresh (<4 h, this wave's live seats) 0; wave mode on the 12 live round-92 names 12/12 located, 0.
Edge cases: **3 of 21** diverge, all with 0 instances in 23206 — `e2` BOM, `e3` `NaN`, `e5` first
subagent `model_change` carrying a non-string model (oracle falls back to the earlier default-role
row, tool returns null). `e11` (`?` per-part) and `e7` (astral cut) are **fixed** in the shipped
bytes relative to the READY bytes; the shipped redaction is a linear code-point scan, equivalent to
the oracle's replace-then-cut on every case I could construct.

## Counter findings, by severity
1. **C is not held out** (x6 + prediction proof). The only genuine holdout is W(r92). Fix: do not
   commit the population index to the lane before M (build it at scoring time), draw C with a
   random salt the candidate cannot see, and require a W(r92) pass for HELD.
2. **Kill rule (d) is evadable by glob** (x1). Fix: detect at run time — `strace -f -e openat` on
   the tool's own invocations and fail on any path under `.ufo/waves/round-92/` — and drop the byte
   grep from the rule text, or grep for the shape (`round-*`, `.ufo/waves`, `probe`, `oracle`).
3. **`parse_errors` is unfalsifiable** (x2). Fix: either drop the field from the definition, or add
   a control/transcript that exercises it — as written, `ctl-parseerr` reads HELD and trips (b).
4. **`diff` is not type-strict** (x3). Fix: compare `type(x) is type(y)` or canonical JSON.
5. **`final == "other"`, `?`-model, redaction boundary, BOM/NaN/astral** are unexercised.
6. **`--waves R1,<missing>` dies with an uncaught `FileNotFoundError`, rc=1, and writes no
   receipt** (probed with `.ufo/waves/round-92/w1-results.json`, which does not exist yet). The
   frozen predicate cannot be run before the r92 wave settles; a broken invocation is
   indistinguishable from UNMET. Fix: wrap `read_wave` and print FAIL-CLOSED / exit 2.
7. **Slack is thin**: 60/55 and 61/55 with a non-replacing live-file skip; 6 lost items make a
   correct tool read UNMET.

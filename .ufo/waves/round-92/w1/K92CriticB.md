# K92CriticB — harm and honesty check, C1 `seat-route`

Seat: critic (attack, unharmful-to-the-task). Lane read-only; all receipts under
`.ufo/waves/round-92/K92CriticB/`. Candidate under attack: `K92ExecTool/seat-route.mjs`,
sha256 `3b8b6ce072db381a52fda44dd78cd9936be5b3fefd19f758328fe82b06002608` = the `READY` line =
`score1`/`score2`/`check`/`sha256` `tool_sha256`. The whole base battery was done before `READY`
appeared; candidate work only after.

## Harm — base readings the L1 must compare at M (`K92CriticB/harm-base.md`)

Base = frozen commit `596f6753…`, in a scratch clone (the archive extraction at the assignment's
path cannot produce a `round-gate` reading: `NOT_A_GIT_WORKTREE`, exit 2). M-sim = the clone plus
`scripts/seat-route.mjs` only.

| gate | base | M-sim |
|---|---|---|
| `proxy-check --strict` | DRIFT 1 | DRIFT 1 + `A_DRIFT 36→37` + `PIN_UNPINNED scripts/seat-route.mjs` |
| `readme-map` | DRIFT 1 | identical |
| `counter-pins` | CLEAN 0 `pins=45` | CLEAN 0 `pins=45` |
| `sources-check` | CLEAN 0 | identical |
| `surface-probe --checklists` | FAIL 1 `37/46` | FAIL 1 `36/46` — the extra red is item 735 `gate-mutants`, a 60 s mutant timeout at `load1=25`; re-run alone → `GATE_MUTANTS: CLEAN (mutants=43 killed=43 frozen=41/41)` |
| `round-gate --round 91 --reports-dir /home/vgpnk/Projects/shokunin/.ufo/reports` | CLEAN 0 | CLEAN 0 |

Three gates are already red at base (`proxy-check`, `readme-map`, `surface-probe`); none turns red
because of the file. The two new proxy terms are the file's own registration and must be closed at
M: re-declare `SCORECARD.md:294 A=37` (+`A_wave=<computed>`, non-scoring; `proxy-check.mjs:982`
counts runnable files under `.ufo/`) and add `pin.seat-route=<sha256>` to the
`kumitate-gate-pins-v1` block (shape at `proxy-check.mjs:548-556`). **Verdict: no harm** from landing
the file, on this battery.

## Honesty — the motivating evidence holds (`K92CriticB/honesty.md`)

Independent `jq` on
`~/.omp/agent/sessions/-Projects-shokunin/2026-11-03T17-37-19-922Z_01a1a27c-a432-71e1-944b-0900e4e7a66b/K91Scout.jsonl`
(sha256 `937340ca…`): `model_change subagent:K91Scout → google-antigravity/claude-opus-5-5`; turns:
**1 × claude-opus-5-5 `error`**, **106 × minimax-code/MiniMax-M3.1-Flash `toolUse`**. The plan's
pre-data sentence is exactly right. `/home/vgpnk/Projects/shokunin/.ufo/reports/round-91/kumitate.md`
names no model at all (`grep -i "model|minimax|claude|antigravity"` → no output; the seat appears
only as "K91Scout recon (`K91Scout/recon.md`)"). The candidate reproduces the record on the same
bytes (`fallback:true`, `final:"served"`, `last_error "Cloud Code Assist API error (429): {"`).

## Axis ruling

`AXES.md:13` operability = "Runnable artifacts: checklists that are executable, commands that exist,
scripts that run"; signal "A checklist item can be run and produces the stated outcome". C1 lands a
script with a documented invocation, verdict line, exit map and `--selftest` — that sentence, not
coverage (`AXES.md:11`: "Fraction of the domain's real surfaces the skill governs"; its signal is a
`PROVINCE.md` claim C1 is not making). Matches the lane's own precedent form
(`SCORECARD.md:474-477`: "operability (lowest non-retired axis; integer held 9 — terminal under
`f_O`; capability acquisition …)"). **Caveat the report must keep**: `SCORECARD.md:368` freezes the
integer at 9 and the proxy is "saturating, so one artifact cannot claim the axis" — measured
`f_O = 82/85 → 9` at base and `83/86 → 9` with the file, so the claim's before→after is the
capability row plus its demonstration, never a score delta. Distinct from `inline-dispatch-evidence`:
`grep -ln "stopReason|message.model|errorMessage" scripts/*` → no file; `model_change` appears only
there (`:197-198`, first `subagent:` model for `SESSION_HEADER`); `dispatch-evidence.mjs` derives
`dead` from launcher progress rows, carries no error text. No duplicate authority.

## COUNTER findings (`K92CriticB/COUNTER.md`) — not kill events, for the L1 to rule on

1. **Kill clause (d) is a byte grep and is evadable.** A 14-line `delegate.mjs` that globs
   `.ufo/waves/round-*/probe/oracle*.py` at runtime and pipes the args to `python3` has
   `grep -c "round-92\|oracle92\|probe92"` = **0** and reads **`C92_C1: HELD agree=133/133`**
   (`ctl-oracle-delegated.txt`). The clause's second arm ("a seat-shown runtime read") has no
   mechanical form in the predicate. Correction to apply by hand at M: `strace -f -e execve,openat`
   the candidate (or read its `spawnSync|execFile|oracle\*` hits). The shipped candidate is clean on
   the cheap form — all 8 `spawnSync` calls are `process.execPath` on itself in `--selftest`.
2. **Two of ten advertised strata are empty; three fields have no discriminating transcript.**
   `index92.tsv` has 1 `redact` row and **0** `parseerr` rows, so the C draw is 60 not 66
   (redact 4 / parseerr 2 take nothing; `C_ITEM` counts confirm). Oracle over every scored record:
   `parse_errors>0` = 0 in A/C/W; `last_error` redaction = 1 (only `…/C2ExecF.jsonl`, the single
   `DISAGREE A redact` in `controls/ctl-noredact.txt`); `final:"other"` = 0 in A/C/W. A candidate
   that omits the parse-error counter or maps an unknown `stopReason` to `served` still scores
   133/133. The report must not claim C covers redaction or parse errors.
3. Not a counter: the oracle is faithful to the plan's definitions line by line, and the salt-keyed C
   does defeat memorisation (a tool cannot hash bytes it is still writing); delegation is the only
   cheap way past it — see (1).

## Candidate probes (sha `3b8b6ce0…`)

`node --check` OK · `--selftest` `SEAT_ROUTE_SELFTEST: PASS held=30/30` · `--results` r91 → 12
records, `SEAT_ROUTE: OK seats=12 served=12 … fallback=4` · my own frozen-probe run →
`C92_C1: HELD agree=133/133 A=61/61 C=60/60 W=12/12 last_wave_located=12 salt=3b8b6ce0…`
(`cand-current-bytes.txt`). Clause (e) holds only if M commits exactly `3b8b6ce0…`.

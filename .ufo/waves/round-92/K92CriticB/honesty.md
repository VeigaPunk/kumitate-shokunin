# K92CriticB — honesty check (claim C1 `seat-route`)

All commands run from the seat; receipts in this directory. Read-only on the lane; the
candidate was executed from its landed path, never modified.

## 1. The motivating evidence holds (re-derived, not read from the plan)

Locator and hash:

```
$ find ~/.omp/agent/sessions -name K91Scout.jsonl
/home/vgpnk/.omp/agent/sessions/-Projects-shokunin/2026-11-03T17-37-19-922Z_01a1a27c-a432-71e1-944b-0900e4e7a66b/K91Scout.jsonl
$ sha256sum …/K91Scout.jsonl
937340ca61beba371140e1d3082f8ffc4ce635d413f7dfad1e7ca5e8895abc02  (453 lines)
```

My own `jq` (receipt `k91scout-rederive.txt`, not the oracle, not the candidate):

- `model_change` rows: `null → google-antigravity/claude-opus-5-5`,
  `subagent:K91Scout → google-antigravity/claude-opus-5-5`, `fallback → minimax-code/MiniMax-M3.1-Flash`
  (`resolvedModelIsFallback=true`).
- assistant turns by model × stopReason: **1 × `google-antigravity/claude-opus-5-5` `error`**,
  **106 × `minimax-code/MiniMax-M3.1-Flash` `toolUse`**.
- distinct served-turn models: `minimax-code/MiniMax-M3.1-Flash` only.

So: captured route = `claude-opus-5-5`, every answered turn = `MiniMax-M3.1-Flash`, exactly as
plan.md's Pre-data evidence states. Under the frozen definition `captured != answered` ⇒
`fallback=true`, `final=served`, `errors=1`. The candidate reproduces this on the same bytes:

```
$ node …/K92ExecTool/seat-route.mjs --file …/K91Scout.jsonl --json
{"seat":"K91Scout","captured":"google-antigravity/claude-opus-5-5",
 "answered":["minimax-code/MiniMax-M3.1-Flash"],"errors":1,"aborted":0,
 "last_error":"Cloud Code Assist API error (429): {","yielded":true,"final":"served",
 "fallback":true,"parse_errors":0}
```

## 2. The r91 report does not name the answering model

```
$ grep -n -i "minimax\|claude-opus\|antigravity\|amr\|mistral\|model" /home/vgpnk/Projects/shokunin/.ufo/reports/round-91/kumitate.md
(no output; 93-line report)
$ grep -n "K91Scout" …/round-91/kumitate.md
23:- … K91Scout recon (`K91Scout/recon.md`). K91Connector: no sibling owns the claim; …
```

The report's only mention of the seat is its recon file; **no model name of any kind appears in the
r91 report** (no `captured=`, no answered model). A reader of the r91 close cannot tell that the
scout was answered by a fallback model after a 429. Claim premise confirmed; the gap the tool fills
is real in the lane's own last report.

Related premise, also confirmed: r90's report line 8 still carries the phrasing the r90 spot-check
corrected — "Dead seats: none (12/12 COMPLETE, `.ufo/waves/round-90/w1-results.json`)"
(`.ufo/reports/round-90/kumitate.md:8`), while
`corpus/lessons/round-90-verifier-spotcheck.md:106-108`: "**Wording defect (report)**: '12/12 COMPLETE'
— only 2 of 12 seat records in `w1-results.json` carry a literal status field … the phrase overstates
the marker." The results file is not a status record; a transcript reading is.

## 3. Axis: operability is right; the score cannot move (state it, do not imply a delta)

`/home/vgpnk/Projects/shokunin/AXES.md:13` — **operability**: "Runnable artifacts: checklists that
are executable, commands that exist, scripts that run"; signal "A checklist item can be run and
produces the stated outcome". Line 11 — **coverage**: "Fraction of the domain's real surfaces the
skill governs (repo paths, tools, edge classes)"; signal "PROVINCE.md lists every surface".

C1 lands `scripts/seat-route.mjs` with a documented invocation, a verdict line, an exit map and a
`--selftest`; that is the operability sentence almost verbatim. Coverage would be the claim if the
deliverable were new PROVINCE registry cells for the seat-transcript surface; the plan claims the
tool, not the registry, so operability is the correct axis and matches the lane's own precedent form
(`SCORECARD.md:474-477`: "operability (lowest non-retired axis; integer held 9 — terminal under
`f_O`; capability acquisition …)").

**Honesty caveat for the report**: `SCORECARD.md:368` freezes the operability integer at 9 and says
the proxy is "saturating, so one artifact cannot claim the axis"; `f_O = (A+C)/(A+C+3)` with the
base readings I measured (`A=36`, `C=46`) is 82/85 ⇒ 9, and after one more artifact 83/86 ⇒ 9.
So the claim's before→after is **the capability row + a passing demonstration**, never a score
delta. A report line reading "operability 9 → 9" is honest; anything implying 9 → 10 is not.

## 4. Distinct from `inline-dispatch-evidence` (no duplicate authority)

Header (`scripts/inline-dispatch-evidence.mjs:17-20`) binds a wave to three records; the transcript
arm is a *shape* arm. The only model read in the whole `scripts/` tree:

```
$ grep -ln "stopReason\|message\.model\|errorMessage" scripts/*.mjs scripts/*.sh
(no files)
$ grep -ln "model_change" scripts/*.mjs
scripts/inline-dispatch-evidence.mjs
```

and there (lines 197-198):

```
} else if (row.type === 'model_change' && row.role) {
  const role = String(row.role);
  if (role.startsWith('subagent:') && !t.model) t.model = row.model || null;
```

— first `subagent:` model only, used for `SESSION_HEADER`; `t.assistants` counts assistant turns
without reading `message.model` or `stopReason`, and no lane file reads `errorMessage`.
`scripts/dispatch-evidence.mjs` derives `dead` from a launcher progress row (`exit != 0`, line
109-115), not from transcript turns, and carries no error text. No lane tool reports a seat's
answered model, fallback, or last error. The capability is new, and it does not duplicate an
authority that already answers the question.

## 5. Two live hazards seen while checking (not kill events; builder must close them)

1. **Scored bytes = shipped bytes at the final state (was transiently false while the builder was
   still editing).** When my candidate probes began, `.ufo/waves/round-92/K92ExecTool/score1.txt`
   carried `tool_sha256=40eefe4b9ae22563…` while the file on disk hashed
   `3b8b6ce072db381a52fda44dd78cd9936be5b3fefd19f758328fe82b06002608`. The builder then re-scored: at
   final, `score1.txt`, `score2.txt`, `check.txt`, `sha256.txt` and `READY` all carry
   `3b8b6ce0…`, which equals the file's hash, and my own run on those bytes reads
   `C92_C1: HELD agree=133/133 … tool_sha256=3b8b6ce0…` (`cand-current-bytes.txt`). Clause (e) is
   satisfied **only if M commits exactly `3b8b6ce0…`** — a later edit without a re-score re-opens it.
2. **`READY` appeared late in my window** (sha `3b8b6ce0…`), i.e. after the candidate-independent
   work; every candidate probe below is labelled with that sha.

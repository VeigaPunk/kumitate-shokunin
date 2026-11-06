# K92Scout — per-surface reconnaissance: is the frozen field reading faithful to how omp writes transcripts?

Source under study: `can1357/oh-my-pi` @ `79fa222e8390aed3494f4bc6746814e6c74c21cf`
(fetched to scratch as `src.tar.gz` → `src/oh-my-pi-79fa222e8390aed3494f4bc6746814e6c74c21cf`;
`open/sources-fetch.txt` in the lane records the same commit + sha256 of the three lane files).

Host evidence: `~/.omp/agent/sessions/-Projects-shokunin/*/*.jsonl` (23 254 transcripts on this host;
`probe/index92.tsv` indexes 23 206 of them). All transcripts are read-only host records; nothing was copied
into the lane. Only per-file sha256-style citations (path + counts) appear below.

All counts below are from scripts run under `/fast/scratch/hyaku/kumitate-r92/K92Scout/` (now removed);
the receipts `censusA.txt … censusG.txt` are the transcripts of those runs and are cited by name.

---

## 1. Where the session writer appends `model_change` with role `fallback` and `resolvedModelIsFallback`

**The row shape** — `packages/coding-agent/src/session/session-entries.ts:148-156`:

```
148  export interface ModelChangeEntry extends SessionEntryBase {
149      type: "model_change";
150      /** Model in "provider/modelId" format */
151      model: string;
152      /** Role: "default", "smol", "slow", etc. Undefined treated as "default" */
153      role?: string;
154      /** True when this transition selected a retry-fallback model rather than the configured model. */
155      resolvedModelIsFallback?: boolean;
156  }
```

**The writer** — `packages/coding-agent/src/session/session-manager.ts:3687-3698`:

```
3687  appendModelChange(model: string, role?: string, resolvedModelIsFallback = false): string {
3688      const entry: ModelChangeEntry = {
3689          type: "model_change",
3690          ...this.#freshEntryFields(),
3691          model,
3692          role,
3693          resolvedModelIsFallback,
3694      };
3695      this.#recordEntry(entry);
```

`#recordEntry` (session-manager.ts:2158-2178) pushes the entry and calls `#appendToSessionFile(entry)`
(1883) — i.e. **every** `model_change` row is appended to the seat's own JSONL in the order written.

**Who writes role `fallback`** — the role string is a constant:

- `packages/coding-agent/src/session/session-entries.ts:37`
  `export const EPHEMERAL_MODEL_CHANGE_ROLE = "fallback";`

Three call sites use it:

- `packages/coding-agent/src/session/turn-recovery.ts:2261` — retry-fallback to a chain candidate,
  **with** `resolvedModelIsFallback = true`:
  `this.#host.sessionManager.appendModelChange(candidateSelector, EPHEMERAL_MODEL_CHANGE_ROLE, true);`
- `packages/coding-agent/src/session/turn-recovery.ts:2550` — Fireworks-Fast → base degrade, also `true`.
- `packages/coding-agent/src/session/turn-recovery.ts:2617` — **revert to the primary** after a cooldown
  expiry, written with role `fallback` and **no** flag:
  `this.#host.sessionManager.appendModelChange(primarySelector, EPHEMERAL_MODEL_CHANGE_ROLE);`
  (default parameter `false`, session-manager.ts:3687).

The seat's own "captured route" row is written by the parent, into the *child's* file:
`packages/coding-agent/src/task/executor.ts:280` `return \`subagent:${id}\`;`
(`subagentRetryFallbackRole`) and `executor.ts:5085`
`sessionManager.appendModelChange(formatModelStringWithRouting(model), retryFallbackRole);`
(the SDK's own initial-model row, role undefined, is `packages/coding-agent/src/sdk.ts:4990`).

**Where the failed provider's `stopReason:"error"` turn is persisted relative to that row** — this is the
ordering the assignment asks about, and it is confirmed by source, not inference:

- At `message_end` the failed turn is *dropped* when it is an empty error turn:
  `packages/coding-agent/src/session/agent-session.ts:4305` `if (isEmptyErrorTurn(assistantMsg)) return;`
  (`#persistSessionMessageIfMissing`, 4291-4321). `isEmptyErrorTurn` is
  `packages/coding-agent/src/session/messages.ts:568-587` (error + no text/thinking/redactedThinking/toolCall).
- The retry loop then applies the model switch **first** (turn-recovery.ts:3007 → 2261, which appends the
  `fallback` row) and only **afterwards** records the failed turn:
  `turn-recovery.ts:3124` `await this.#recordPendingRetryError(message, id, {...});` →
  `turn-recovery.ts:985-991` `#recordPendingRetryError` → `await this.persistTerminalEmptyErrorTurn(message);`
  → `turn-recovery.ts:948-953` `#persistTerminalEmptyErrorTurn` → `this.#host.appendSessionMessage(message)`.

So the **failed provider's error turn is written AFTER the `fallback` `model_change` row** — exactly the
transcript order the assignment states. Host confirmation (K91Scout, the r91 seat named in the plan):

```
row  9  model_change  minimax-code/MiniMax-M3.1-Flash  role="fallback"  resolvedModelIsFallback=true
row 10  message assistant stopReason=error provider=google-antigravity model=claude-opus-5-5
        errorMessage="Cloud Code Assist API error (429): … Individual quota reached …"
```

Census (`censusA.txt`, 3 000 transcripts): of 3 285 error turns, **2 857 come after the first `fallback`
row** and 378 before it; the ones before are earlier same-model attempts of the same request (their
`retryRecovery.recovery` is `plain`/`wait`, not `model`).
`censusF.txt` classifies every error turn by the role of the nearest preceding `model_change`: 2 167 sit
behind a `fallback` row, the rest behind the `subagent:` row.

**Consequence for the field reading (important):** the persisted error turn carries the **failed**
provider/model (`google-antigravity/claude-opus-5-5` above) even though the session had already switched
to `minimax-code/MiniMax-M3.1-Flash`. Measured: in **2 559** of ~3 285 sampled error turns the turn's own
`provider/model` differs from the nearest preceding `model_change.model` (`censusC.txt`). A reader that
attributed an error to the *current* `model_change` would name the wrong model; the frozen definitions
avoid this by reading the turn's own `provider`/`model` — correct as written.

## 2. Where `stopReason:"aborted"` can be written; attempts vs requests; `upstreamModel`

### 2a. Every site that can write `aborted`

| site | file:line | what it is |
|---|---|---|
| gate stop | `packages/agent/src/agent-loop.ts:818` (`createGateStopMessage`) | `stopReason:"aborted"`, `errorMessage:"Stopped before model call"` — no provider request was made |
| abort of an in-flight request | `packages/agent/src/agent-loop.ts:2852` / `:2867` (`emitAbortedAssistantMessage`) | real user/kill abort; `errorMessage` = `abortReasonText(signal)` |
| abort inside the agent catch path | `packages/agent/src/agent.ts:2260` `stopReason: stoppedForAbort ? "aborted" : "error"` | same distinction, other code path |
| synthetic interrupted turn | `packages/coding-agent/src/session/exit-diagnostics.ts:231` (`createInterruptedTurnAbortMessage`) | written on **resume**: `errorMessage = "Previous OMP process exited before completing the turn."` (`exit-diagnostics.ts:102`) — an artifact of the *next* process, not of the seat's own run |
| cache warmer | `packages/coding-agent/src/session/cache-warmer.ts:808` | a warmer partial, not a session turn |
| type only | `packages/ai/src/types.ts:1081` `StopReason = "stop" \| "length" \| "toolUse" \| "error" \| "aborted"` | — |

Host census (`censusB.txt`, 2 500 transcripts, 98 787 assistant turns): 25 aborted turns in a 900-file
sample, all with `errorMessage` `"Request was aborted"`, plus one `"Interrupted by user"`
(`packages/tui/src/chat/messages.ts:101` `USER_INTERRUPT_LABEL`). **Zero** turns carried
`"Previous OMP process exited before completing the turn."` and **zero** carried `"Stopped before model
call"` (0 occurrences in 2 500 sampled transcripts) — those two aborted flavours exist in the writer but
did not occur in this corpus.

### 2b. Does a retried request leave one error turn per attempt? — **yes: attempts, not requests**

`MutC-3.jsonl` (one user prompt at row 7) persists one error turn **per attempt**:

```
row  8  assistant error zai glm-5.3-flashx  retryRecovery.attempt=1
row  9  assistant error zai glm-5.3-flashx  retryRecovery.attempt=2
row 10  assistant error zai glm-5.3-flashx  retryRecovery.attempt=3
row 12  assistant toolUse zai glm-5.3-flashx  (the turn that finally served)
```

and again rows 22-26 (`attempt=1..4`), 32-36 (`1..5`). The persisted attempt counter lives in the
message itself: `retryRecovery.attempt` (written at `turn-recovery.ts:1034-1066`). Census (`censusB.txt`,
2 500 transcripts): 2 619 error turns carry `retryRecovery`, of which 2 484 carry `supersededBy`
(provider/model of the turn that replaced it); attempt values 1…7 occur
(`censusC.txt`: attempt=1 ×683, 2 ×109, 3 ×54, 4 ×31, 5 ×19, 6 ×3, 7 ×1).

Mechanism (why an attempt leaves a row): each attempt's failed turn is an empty error turn, dropped at
`message_end` (agent-session.ts:4305) and re-persisted by the retry bookkeeping
(turn-recovery.ts:3124 → 985-990 → 948-953).

⇒ **the field `errors` counts failed *attempts*, not failed requests.** One request that fails 5 times
contributes 5 to `errors`. The last attempt's message may also be rewritten before persisting:
`turn-recovery.ts:3057` region sets `message.errorMessage = "Retry budget exhausted after N retries: …"`
(8 such turns in a 1 500-transcript sample, `censusD.txt` neighbours) — so `last_error`'s first line can
read `Retry budget exhausted after 5 retries: 429 Rate limit reached for requests`.

### 2c. Is `upstreamModel` ever the real answering model behind a proxy? — **the field exists; the
persisted transcript does not carry it**

- Type: `packages/ai/src/types.ts:1341` `upstreamModel?: string;` — "Concrete model that produced this turn
  when it is knowable independently of the requested id".
- Producers: `packages/ai/src/providers/devin.ts:269` (router `assignment.modelUid`),
  `devin.ts:406` (`msg.actualModelUid`), `packages/ai/src/providers/anthropic.ts:2432-2433`
  (`servedModelFromAnthropicSignature`), `packages/ai/src/providers/openai-completions.ts:1730`
  (OpenRouter reasoning detail), `openai-shared.ts:3799`.
- Consumer: `packages/tui/src/chat/served-model-marker.ts:30-47` (`detectServedModelMismatch`) — the TUI
  can flag "served by a different model than requested".
- **Host measurement:** `grep -rl '"upstreamModel"' ~/.omp/agent/sessions/ --include=*.jsonl` → **0 files**
  (the only 4 hits anywhere in the sessions tree are this round's own seat transcript and a bash log
  containing the literal string). Over 23 243 `-Projects-shokunin` transcripts and ~116 150 assistant
  turns sampled (`censusA/B.txt`), **no assistant message carries an `upstreamModel` key**.
  By contrast `upstreamProvider` **is** persisted (82 turns: `commandcode/stealth/crouton-alpha` →
  `"Stealth"`), and `attribution` appears on 300/300 sampled files but only as `"agent"`.

⇒ For the seat-route contract, `provider/model` on a turn is the **configured gateway identity**, not
provably the model that served. Concrete instance: `provider:"cursor", model:"default"` occurs **1 381**
times in the corpus — a router alias, not a model id; `"provider":"devin"` turns name e.g.
`deepseek-v4-1-flash`; `"provider":"commandcode"` names `stealth/crouton-alpha` while the upstream
provider row says `Stealth`. A report line `answered=cursor/default` states a gateway alias.
`upstreamModel` would have been the served-behind-proxy model, and it is **not in the file** — so this
gap cannot be closed from the seat transcript.

## 3. Divergence list (labelled)

### in-definition — the definitions say something false about omp (kill-clause (c) material)

**D1 — `errors` counts attempts; plan prose calls them "failed requests".**
plan.md §Claim C1 lists the tool's output as "… fallback, **failed requests**, aborted turns …" while its
own frozen field definition reads "`errors`: count of turns with `stopReason` `error`". omp writes one
persisted error turn **per attempt** (§2b: `MutC-3.jsonl` rows 8-10 = attempts 1,2,3 of one prompt), so
`errors=5` can mean one request that failed five times, not five failed requests.
*Faithfulness verdict:* the **executable** definition (turn count) is faithful to the file; the **prose
label** in the same plan is the false part. The shipped tool implements the turn count and therefore
agrees with the oracle — no kill-clause (c) exposure — but a round report that renders `errors` as
"failed requests" repeats, in a new place, the Amendment-44 overstatement pattern the claim exists to
remove. *Evidence:* `MutC-3.jsonl` rows 7-12 (cited above); `turn-recovery.ts:3124 → 985-990 → 948-953`;
`agent-session.ts:4305`; `packages/ai/src/types.ts` `AssistantRetryRecovery.attempt`
(`turn-recovery.ts:1034-1066`); censusB/censusC.

**D2 — plan.md's claim that the failed provider's error turn is written after the `fallback`
`model_change` is TRUE but only for the attempt that switched model.** The plan states it as a general
property of the transcript (and the pre-data evidence rests on it). Measured: of 3 285 sampled error turns,
378 precede the first `fallback` row — those are earlier same-model attempts of the same request
(`retryRecovery.recovery` = `plain`/`wait`), whose rows are persisted at each attempt's own bookkeeping
(`turn-recovery.ts:3124`) with no model switch in between. So the row order is
`error(attempt n) … error(attempt n+1) … model_change(fallback) … error(the switching attempt)`, and only
the *last* of those error rows sits after the `fallback` row. A reader must not assume "the error turn
after the fallback row is the only error turn".
*Verdict:* the definitions do not encode this ordering, so it does not contradict them; the plan's prose
is under-specified rather than false. `censusA.txt` (after/before counts), `censusF.txt`
(nearest-preceding-role classification), source lines quoted in §1.

**D3 — `final` from the last turn is safe only because out-of-order rows happen to be error turns.**
`final` is defined on the last turn **in file order**. Entry timestamps are **not** monotonic in
**443 of 3 937** sampled transcripts (11 %): a late-persisted error turn is appended after rows that
carry later timestamps, so file order ≠ chronology. Measured impact on `final`: **0** cases where the
last file-order turn is an error turn older than an earlier served turn (4 000-transcript sweep,
`censusE.txt`), and 0 disagreements between file-order-last and max-timestamp-last over 699 transcripts.
*Verdict:* the definition is faithful **in effect** on this corpus, but it is faithful by luck of which row
is appended late — `final` is computed from position, and the position semantics are not the semantic
"last thing the seat did". No contradiction with the frozen definitions; routed.

### out-of-definition — omp records something the definitions do not model (routed)

**D4 — the `fallback` role is reused for the revert-to-primary hop, so role ≠ fallback transition.**
`turn-recovery.ts:2617` writes role `"fallback"` with `resolvedModelIsFallback` **absent/false**.
Measured (`censusC.txt`, 3 000 transcripts): of **2 017** rows with role `fallback`, **50** carry
`resolvedModelIsFallback=false`. A reader keying on the role string would call those fallbacks.
The plan's derived `fallback` (captured ≠ some answered model) is unaffected, but the plan's own
control `ctl-flagonly` (126/133) shows the flag itself is not the same predicate as the derived one:
measured (`censusD`-style sweep, 1 200 transcripts) the two disagree on **19** transcripts — e.g.
`R48Review27.jsonl`: `fallback` row to `devin/swe-2` with the flag true, but that turn also errored, so no
*served* turn came from `devin/swe-2` and the derived predicate says "no fallback". **Routed**: the
definitions re-derive fallback from served turns and never read the flag; the plan already carries
`ctl-flagonly` as a separate (non-positive) control.

**D5 — `upstreamModel` is dropped from the persisted transcript, so "the models that actually answered"
cannot be proven for proxy routes** (§2c). `provider/model` is the *configured gateway* identity;
`cursor/default` (1 381 turns), `devin/deepseek-v4-1-flash`, `commandcode/stealth/crouton-alpha` name
gateways/routers, and the field that would name the served model (`types.ts:1341`) exists in the type but
is absent from every persisted turn on this host. **Routed** (definitions say nothing false; they are
simply blind to a field the harness does not write).

**D6 — `upstreamProvider` is persisted but unmodelled.** 82 turns carry `upstreamProvider` (e.g.
`"Stealth"` for `commandcode/stealth/crouton-alpha`). The definitions read only `provider`/`model`, so the
report cannot say "routed to Stealth" even though the row knows. **Routed.**

**D7 — `retryRecovery` (attempt, recovery kind, `supersededBy`) is persisted but unmodelled.**
2 619 error turns carry it; `supersededBy` names the provider/model that replaced the failed turn
(2 484 turns) — a direct, machine-readable statement of "who answered after the failure", which the
definitions reconstruct indirectly from `answered`. **Routed.**

**D8 — `session_init.resolvedModel` / `retryFallback` are persisted but unmodelled.**
`session_init` rows carry `resolvedModel` (e.g. `google-antigravity/claude-opus-5-5:high`, note the
thinking-level suffix that `model_change.model` does **not** carry) and `retryFallback`
`{primary, chain:[…]}` — the seat's configured fallback chain *before* any failure. The definitions read
only `model_change` rows, so the configured chain is invisible to the tool. **Routed.**
(Consequence for `captured`: the `model_change` `model` string and the turn's `provider/model` are
comparable on this host — 10 611 sampled `model_change` rows carried no `@route`/thinking suffix and
0 of 1 198 sampled `default`-role/`subagent:`-role pairs disagreed — but `session_init.resolvedModel`
does carry a `:high` suffix, so the two string forms must not be mixed.)

**D9 — aborted has three flavours (gate-stop, in-flight abort, resume-synthesized interrupted turn) and
the definitions count them alike** (`aborted`: count of turns with `stopReason` `aborted`). Two of the
three never occurred in this corpus (§2a). Also: an `aborted` final state does not imply the seat
produced nothing — 3 of 3 000 sampled transcripts end with `aborted` while an **earlier** turn had already
yielded (`KotobaR91.jsonl`, `ExecutorCounterMutation7.jsonl`, `C2Floor.jsonl`; `censusG.txt`). **Routed.**

**D10 — two transcripts in the corpus lack the `subagent:<seat>` row**, so `captured` falls to the
role-absent branch or to null: `SourcesCensusFinal.jsonl` (has only the SDK role-undefined row) and
`Mo50RevC2Counter.jsonl` (no `model_change` row at all → `captured=null`, the `capnone` stratum, 46
transcripts). The definitions' two-branch rule handles both exactly. **Corroboration, no divergence.**

---

## 4. Candidate attack (READY was present when this seat's independent work finished)

`K92ExecTool/READY` present from 15:53; `seat-route.mjs`, sha256
`3b8b6ce072db381a52fda44dd78cd9936be5b3fefd19f758328fe82b06002608` (matches `READY`, `sha256.txt`, and
the `tool_sha256=` in `score1.txt`/`score2.txt` → kill clause (e) is satisfied at freeze).

**Kill clause (d) — independence from the round-92 tree.** `grep -c 'round-92\|oracle92\|probe92'`
on the candidate bytes → **0** (grep exit 1). The only `.ufo` occurrences are the marker template
`/.ufo/waves/round-${round}/` used to *match bytes inside transcripts* (line 409), a selftest fixture
string (line 693) and one `round-91` literal in a selftest fixture (line 744). No read/import/execute of
anything under `.ufo/waves/round-92/`.

**Differential vs the frozen oracle** (my own harness, oracle92 imported read-only, candidate invoked
`node … --file <path> --json`, full field-by-field compare, random draws from `probe/index92.tsv`):

```
seed 7,   n= 250 → checked 250  disagreements 0
seed 4242,n=1200 → checked 1200 disagreements 0  (by field: none)
```

**1450 real transcripts, 0 disagreements.** Combined with the builder's own receipts
(`score1.txt`/`score2.txt`: `C92_C1: HELD agree=133/133 A=61/61 C=60/60 W=12/12 last_wave_located=12`,
two runs), the candidate agrees with the frozen reading on every record I could draw.

**Known blind spot (not a disagreement, but a coverage limit):** the corpus contains exactly **one**
`redact`-stratum transcript (`probe/index92.tsv` strata census: redact=1, and the C quota asks for 4)
and **zero** `parseerr`-stratum transcripts (the C quota asks for 2) — the index's strata census shows
`fallback 11974, clean 9551, multi 4737, errfix 1382, dead 941, aborted 459, silent 47, capnone 46,
none 5, redact 1`. So the redaction rule and the `parse_errors` counter are exercised on ~1 transcript
of 23 206, and the draw for those two strata cannot be filled from this index. This is a property of the
frozen sample, not of the tool.

**Not done (out of budget):** I did not construct a synthetic transcript that exercises the
`parse_errors` counter (the corpus has no unparseable lines: 0 parse-error lines and 0 non-object lines
in 1 500 sampled transcripts) or the `redact` branch beyond the single real case; and I did not
re-derive the wave-mode locator's tie-breaks independently of the oracle beyond the 12 r91 seats that
`score1.txt` reports `W=12/12` on.

## 5. Method / provenance

- Source fetch: `gh api repos/can1357/oh-my-pi/git/trees/79fa222e…` + `codeload` tarball of the same
  commit; tree JSON kept in scratch. Commit verified as `main` at fetch time exactly as
  `open/sources-fetch.txt` records.
- All transcript access was read-only (`open(p)`, `grep -l`) against
  `~/.omp/agent/sessions/-Projects-shokunin/`; no transcript was copied into the lane, and no
  credential-shaped string is printed in this file (error texts are quoted only as short
  non-credential fragments, and the plan's own redaction is what the tool applies).
- Scratch `/fast/scratch/hyaku/kumitate-r92/K92Scout/` removed at yield.

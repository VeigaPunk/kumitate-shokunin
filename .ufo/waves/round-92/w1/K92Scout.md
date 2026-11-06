# K92Scout — per-surface reconnaissance (round 92, claim C1 `seat-route`)

Recon written to `.ufo/waves/round-92/K92Scout/recon.md`.

**Field reading vs omp semantics (source: can1357/oh-my-pi @ `79fa222e…`, read from a scratch tarball).**

1. `model_change` with role `fallback`: role constant `packages/coding-agent/src/session/session-entries.ts:37`
   (`EPHEMERAL_MODEL_CHANGE_ROLE = "fallback"`); writer `session-manager.ts:3687-3698` (`appendModelChange`).
   Writers: `turn-recovery.ts:2261` (chain fallback, flag `true`), `:2550` (Fast→base, flag `true`),
   `:2617` (**revert to primary**, role `fallback`, flag **false**). Seat's captured row:
   `task/executor.ts:280` (`subagent:${id}`) + `:5085`; SDK initial row `sdk.ts:4990` (role undefined).
2. The failed provider's `stopReason:"error"` turn is persisted **after** the `fallback` row, by source:
   empty error turns are dropped at `message_end` (`agent-session.ts:4305`), the model switch is applied
   first (`turn-recovery.ts:3007 → 2261`), then the failed turn is persisted
   (`turn-recovery.ts:3124 → 985-990 → 948-953`). Confirmed in `K91Scout.jsonl` rows 9-10 (fallback row
   then the `google-antigravity` 429 error turn). Measured: 2 559 of 3 285 sampled error turns carry a
   provider/model different from the nearest preceding `model_change` — so the definitions' use of the
   turn's own provider/model is the correct reading.
3. `aborted` writers: `agent-loop.ts:818` (gate stop), `:2852/:2867` (in-flight abort), `agent.ts:2260`,
   `exit-diagnostics.ts:231` (resume-synthesized interrupted turn), `cache-warmer.ts:808`;
   type `packages/ai/src/types.ts:1081`. On this corpus only the in-flight flavour occurs (all
   `"Request was aborted"`).
4. **A retried request leaves one persisted error turn per attempt** (`MutC-3.jsonl` rows 8-10 = attempts
   1,2,3 of one prompt; `retryRecovery.attempt` at `turn-recovery.ts:1034-1066`). So `errors` counts
   attempts, not requests.
5. `upstreamModel` exists (`packages/ai/src/types.ts:1341`; producers `devin.ts:269,406`,
   `anthropic.ts:2432`, `openai-completions.ts:1730`; consumer `tui/.../served-model-marker.ts:30`) but
   **no persisted turn on this host carries it**: `grep -rl '"upstreamModel"' ~/.omp/agent/sessions/
   --include=*.jsonl` → 0 files (23 243 `-Projects-shokunin` transcripts; ~116 150 assistant turns
   sampled). `upstreamProvider` **is** persisted (82 turns, `commandcode/stealth/crouton-alpha` →
   `"Stealth"`). `provider/model` is therefore the *configured gateway* identity: `provider:"cursor",
   model:"default"` alone occurs 1 381 times.

**Divergences, labelled.**

- *in-definition*: **D1** `errors` counts attempts while plan prose calls them "failed requests" (the
  executable definition is faithful; the prose label is the false part — same overstatement family as
  Amendment 44). **D2** "the error turn is written after the `fallback` row" holds only for the attempt
  that switched model — 378 of 3 285 sampled error turns precede it (earlier same-model attempts).
  **D3** `final` is computed from file position, but entry timestamps are non-monotonic in 443 of 3 937
  sampled transcripts (11 %); impact measured 0 cases, so faithful in effect, by luck of which row is
  appended late.
- *out-of-definition (routed)*: **D4** role `fallback` is reused for the revert-to-primary hop
  (50 of 2 017 fallback-role rows have the flag false) and the flag-vs-derived predicate disagree on 19
  of 1 200 transcripts. **D5** `upstreamModel` absent from transcripts → served-behind-proxy model
  unprovable. **D6** `upstreamProvider` persisted but unmodelled. **D7** `retryRecovery`
  (attempt/kind/`supersededBy`) persisted but unmodelled. **D8** `session_init.resolvedModel` (with a
  `:high` thinking suffix the `model_change` rows lack) and `session_init.retryFallback.chain` persisted
  but unmodelled. **D9** `aborted` conflates three flavours; an `aborted` final state can coexist with an
  earlier yield (3 of 3 000 sampled). **D10** 2 transcripts lack the `subagent:` row → `captured` falls
  to the role-absent branch or null (`capnone`, 46 transcripts); the definitions' two-branch rule is exact.

**Candidate attack (READY present).** `seat-route.mjs` sha256
`3b8b6ce072db381a52fda44dd78cd9936be5b3fefd19f758328fe82b06002608` = `READY` = `sha256.txt` =
`tool_sha256=` in `score1.txt`/`score2.txt` (kill clause (e) ok at freeze). Kill clause (d): `grep -c
'round-92\|oracle92\|probe92'` on the candidate bytes → **0**. My own differential vs the frozen oracle
(random draws from `probe/index92.tsv`, full field compare): **250 + 1200 = 1450 transcripts, 0
disagreements**. Coverage limit (frozen sample, not the tool): the index holds **1** `redact` and **0**
`parseerr` transcripts against C quotas of 4 and 2 — those branches are exercised on ~1 of 23 206.

**Not done (budget):** no synthetic transcript exercising `parse_errors` (corpus has 0 unparseable lines
in 1 500 sampled files) or the `redact` branch beyond the single real case; wave-mode locator tie-breaks
not re-derived beyond the 12 r91 seats in `score1.txt`.

Scratch `/fast/scratch/hyaku/kumitate-r92/K92Scout/` removed.

Report: .ufo/waves/round-92/w1/K92Scout.md

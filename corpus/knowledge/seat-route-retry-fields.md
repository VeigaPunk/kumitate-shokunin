source: S267 (corpus/SOURCES.md, oh-my-pi packages/coding-agent/src/session/session-entries.ts, https://github.com/can1357/oh-my-pi/blob/79fa222e8390aed3494f4bc6746814e6c74c21cf/packages/coding-agent/src/session/session-entries.ts); S268 (packages/ai/src/types.ts, AssistantRetryRecovery, retryRecovery, upstreamProvider, https://github.com/can1357/oh-my-pi/blob/79fa222e8390aed3494f4bc6746814e6c74c21cf/packages/ai/src/types.ts); S269 (packages/coding-agent/src/session/turn-recovery.ts, the writer of retryRecovery and of the fallback-flagged and unflagged model_change hops, https://github.com/can1357/oh-my-pi/blob/79fa222e8390aed3494f4bc6746814e6c74c21cf/packages/coding-agent/src/session/turn-recovery.ts); S270 (corpus/SOURCES.md, own-work host census of routing and retry fields over a pinned 1500-transcript sample: presence and shape of retryRecovery, supersededBy, upstreamProvider, session_init resolvedModel and retryFallback, model_change flags; receipt .ufo/waves/round-93/K93ScribeSources/census.txt); S272 (packages/coding-agent/src/session/retry-fallback-chains.ts, the RetryFallbackRole home: primary plus chain, empty chain disables fallbacks; added round 94, closes M93-2)
verified-at: b6204949e3bb17df9d6cf0cc3f59ea0c4b362061 (round-93 freeze: plan.md, oracle93.py, probe93-c1.py, fixtures, controls, open/ captures); upstream pin 79fa222e8390aed3494f4bc6746814e6c74c21cf; capture sha256 session-entries.ts 4035dad36878c19d14aa4cdfd0e6de3c3ccbcb86cf3c280228e3c70b1128f29e, types.ts 22ea739a7175ddd97b2f17a54fa9f876d17b972dc15e3a190848a5a358d5b95c, turn-recovery.ts 1059a80e5dc47cf9c23789974aa1ddd78207795d9a0537c95c3f2e2211a4eddf; auxiliary capture (not yet a SOURCES row) packages/coding-agent/src/session/retry-fallback-chains.ts sha256 b5db529983630ee7e60621478868675dbbe93f149e3cf42eb1aee093a21774fc, kept at .ufo/waves/round-93/K93ScribeLesson/rbchains.ts; drafted 2026-11-06, the instrument sha256 is pinned when seat-route v2 ships at the round-93 close commit
recheck: `curl -fsSL https://raw.githubusercontent.com/can1357/oh-my-pi/79fa222e8390aed3494f4bc6746814e6c74c21cf/<path> | sha256sum` for the three S-row paths (expect 4035dad3…, 22ea739a…, 1059a80e…) and for the auxiliary path (expect b5db5299…), then `python3 .ufo/waves/round-93/probe/oracle93.py --file <transcript>` against `node scripts/seat-route.mjs --file <transcript> --json` (records equal, type-strict); the frozen counter is `python3 .ufo/waves/round-93/probe/probe93-c1.py --tool scripts/seat-route.mjs --sample-a .ufo/waves/round-92/probe/sampleA.tsv --fixtures .ufo/waves/round-93/probe/fixtures --after 2026-11-06T21:40:00.000Z --waves .ufo/waves/round-92/w1-results.json,.ufo/waves/round-93/w1-results.json --out <receipt>` (expect `C93_C1: HELD` and `RUNTIME: CLEAN`)

# Seat-route retry fields (v2)

## The class

A failed attempt and its recovery are one fact omp writes on the error turn itself. Version 1 of
`seat-route` reconstructed "who answered after a failure" indirectly — from the captured route, the answering
turns and the error count — and was blind to the retry bookkeeping omp persists beside them. Version 2 reads
it directly: an error turn carries `retryRecovery` naming the saga and, when it recovered, the turn that
superseded it (S268, S269); a served turn carries the upstream provider an aggregator routed to (S268); the
first `session_init` carries the configured model and fallback chain before any failure (S267); and the
`model_change` role plus flag separate a fallback hop from the revert-to-primary hop (S267, S269).

The v1 entry (`corpus/knowledge/seat-route-from-session-transcripts.md`) keeps the transcript-shape ground;
this entry is the retry layer only.

## What each v2 field reads, and why

- **`error_attempts`** (int; replaces v1 `errors`, which no longer appears under that name): the count of
  assistant turns whose `stopReason` is `error` (S268:1081 `StopReason`). The transcript keeps one error row
  per failed **attempt**: omp's turn recovery annotates each persisted error entry with its retry saga (S269,
  writer at 1035–1062), so a single request that retried k times can leave k error rows. Report it as failed
  attempts, never as "failed requests" (K92Scout D1; plan § D1).
- **`recovered_attempts`** (int): among those error turns, the ones whose `retryRecovery` is a JSON object
  with `status` exactly `"recovered"` (S268:1264–1277, status at 1266). The writer sets that arm when a later
  attempt succeeded, and only then attaches `supersededBy` (S269:1036–1052). The other status, `"superseded"`
  (S268:1279–1284, status at 1280), means the saga settled without a replacement turn.
- **`superseded_by`** (list of `provider/model`): over error turns in file order, when `retryRecovery` is an
  object whose `supersededBy` is an object, that object's `provider` and `model` under the `?` rule (either
  missing, non-string or empty → `?`); distinct, first-seen order. Served turns' `retryRecovery` is ignored —
  the field answers "which turn replaced a failed attempt", and only an error turn has one. Because the
  `superseded` arm has no `supersededBy`, a reader that keys on `status` alone cannot name the replacement.
- **`upstream`** (list of str): over served turns (`stop`/`toolUse`/`length`) in file order, the turn's
  `upstreamProvider` when it is a non-empty string; distinct, first-seen. The comment at S268:1326–1332 calls
  it "the upstream provider an aggregator routed this request to", distinct from `provider`, which is the
  configured gateway the harness called; it is absent for direct providers that report none. It is a
  provider, not a model: the concrete model field `upstreamModel` (S268:1341) is **not** read by these
  definitions.
- **`resolved`** (str or null): from the FIRST `session_init` row only, its `resolvedModel` when a string
  (S267:291–292, comment "Initially resolved provider/model selector for historical display"). Null when
  there is no `session_init` row or the value is not a string. This is the configured route before any
  failure — the counterweight to `answered`, which is what actually served.
- **`chain`** (list of str, or null): from the same first `session_init`, when `retryFallback` is an object
  whose `chain` is a list, the list's string items in order (non-strings dropped; an empty list stays `[]`);
  else null. `retryFallback` is a `RetryFallbackRole` (S267:299–300), imported from
  `./retry-fallback-chains` (S267:14), whose `chain` holds the fallback selectors walked after the role's
  primary and whose empty list explicitly disables fallbacks (S272:185–190, "Fallback selectors walked after
  the primary; empty explicitly disables fallbacks."; row added round 94, closing M93-2).
- **`flag_hops`** (int): `model_change` rows whose `resolvedModelIsFallback` is JSON `true` — the marker is
  boolean, not `1` (S267:155). A fallback hop writes it: `appendModelChange(candidateSelector,
  EPHEMERAL_MODEL_CHANGE_ROLE, true)` (S269:2261; the Fireworks-fast degrade at 2550).
- **`revert_hops`** (int): `model_change` rows whose `resolvedModelIsFallback` is **not** JSON `true` and whose
  `role` is the string `"fallback"`. The role `fallback` is the exported ephemeral constant
  `EPHEMERAL_MODEL_CHANGE_ROLE` (S267:37), and omp **reuses it for the revert-to-primary hop**: the restore
  path calls `appendModelChange(primarySelector, EPHEMERAL_MODEL_CHANGE_ROLE)` without the third argument
  (S269:2617). So the two fields read opposite directions of the same role: flags count the hops away from
  the primary, unflagged fallback-role rows count the hop back. A role-only reader conflates both; a
  flag-only reader misses every revert.

## The trap: attempts, not requests — and the last attempt is not the answer

Three readings are easy to get wrong and each is wrong in a report:

- "`error_attempts` failed requests". It counts persisted failed attempts. One request can leave several
  rows; `recovered_attempts` plus `superseded_by` describe what happened after them (plan § D1/D7).
- "the error turn's model answered". An error turn has no serving model; its `provider`/`model` is the id
  that was requested and failed. It is counted in `error_attempts`, never in `answered`.
- "a fallback happened" from the role alone. The role is also written on the way back to the primary
  (S269:2617); only the flag marks a hop that selected a fallback model.

## Measured status (round 93, draft state)

Pre-data controls (`controls/table.txt`, at the freeze `b6204949`, before any candidate existed): positive
control `HELD agree=221/221`; do-nothing, shipped v1, v1 record shape (`v1names`), rename-only (`errname`)
and type-loose (`typeloose`) each `UNMET 0/221`; the remaining one-field ablations `UNMET` at
`resolvedcaptured` 13, `chainprimary` 22, `revertrole` 173, `supersedefromhops` 188, `recoveredloose` 218,
and `flagtruthy` / `parseerr0` / `redact23` / `upstreamall` each 220. The four 220/221 ablations are caught
only by the synthetic set F (`probe/fixtures/`, 16 members): the real population has no discriminating member
for the boolean-`1` flag, parse errors, the 24-character redaction boundary, or upstream-on-every-turn.
`<L1: the shipped v2 receipt (tool_sha256, C93_C1 line, RUNTIME) at the round-93 close commit>`.

## Limits

- Redaction is shape-based, not a secret scanner: a run shorter than 24 characters from `[A-Za-z0-9_-]`
  survives as written. `last_error` is the first line, trimmed, cut to 120 characters.
- Transcripts are read-only host records: cite path plus sha256 and quote only the fields a claim needs.
  Never copy a transcript into the lane.
- `resolved` and `chain` read the FIRST `session_init` row only; a session rewritten with a later init row
  is read at its first init, not its last.
- `upstream` names a provider, and only when `upstreamProvider` is a non-empty string; a direct provider
  reports none, so an empty list is not evidence that no aggregator was involved (S268:1326–1333).
- The definitions do not read `upstreamModel` (S268:1341), `model_usage` rows (S266), or the retry-fallback
  role installed at spawn beyond what `session_init` persisted (S267:299–300).
- The counter's H set skips transcripts modified within 900 s of scoring, so a readings taken during a live
  wave has a smaller held-out set than the same reading after quiescence (`probe93-c1.py`, `LIVE_S`).

## Routed

- Closed round 94: `retry-fallback-chains.ts` is now SOURCES row S272 (sha256 `b5db5299…`, equal to the round-93
  auxiliary capture), and the `chain` paragraph cites it (M93-2).
- [INFERENCE] `supersededBy` names the superseding turn's `provider`/`model` as persisted; on an aggregator
  that reroutes silently, that pair can name the requested selector rather than the upstream producer — the
  same gateway blind spot the v1 entry records for `answered`, and the reason `upstreamProvider` is a separate
  field.

## Integration (L1; not part of the corpus entry)

- Target path: `corpus/knowledge/seat-route-retry-fields.md`.
- README map row (proposed; append after the `seat-route-from-session-transcripts.md` row at
  `corpus/README.md:272`; Q48 requires the row in the same change):
  `| \`knowledge/seat-route-retry-fields.md\` | Seat-route retry fields (v2): attempts vs requests, \`retryRecovery\` recovered/superseded, \`supersededBy\`, \`upstreamProvider\`, the first \`session_init\`'s \`resolvedModel\`/\`retryFallback.chain\`, and the \`fallback\` role reused for revert-to-primary | S267, S268, S269; \`.ufo/waves/round-93/\` (plan, probe, fixtures, controls) |`
- `pin.seat-route` moves to the v2 sha256 at the round-93 close (`SCORECARD.md` pin row); the v1 pin
  `cd7ee03d…` stays named in the round-92 row.
- The auxiliary capture `K93ScribeLesson/rbchains.ts` (sha256 `b5db5299…`) is seat-dir evidence only; it is
  not committed by this seat. If an S row for `retry-fallback-chains.ts` lands, re-point the `chain`
  paragraph's second sentence at it.

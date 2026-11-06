source: S266 (corpus/SOURCES.md, oh-my-pi docs/session.md § model_usage and § model_change, https://github.com/can1357/oh-my-pi/blob/79fa222e8390aed3494f4bc6746814e6c74c21cf/docs/session.md); S267 (session-entries.ts, ModelChangeEntry and EPHEMERAL_MODEL_CHANGE_ROLE, https://github.com/can1357/oh-my-pi/blob/79fa222e8390aed3494f4bc6746814e6c74c21cf/packages/coding-agent/src/session/session-entries.ts); S268 (packages/ai/src/types.ts, StopReason, stopReason, errorMessage, upstreamModel, https://github.com/can1357/oh-my-pi/blob/79fa222e8390aed3494f4bc6746814e6c74c21cf/packages/ai/src/types.ts)
verified-at: 596f675366ac5822aac5ea1ffc56b1189b17f65c (round-92 freeze: plan.md, oracle92.py, probe92-c1.py, sample A, pre-data controls, open/ captures); upstream pin 79fa222e8390aed3494f4bc6746814e6c74c21cf with capture sha256 session.md 6a7a2375879cd113c651975fee27f61b7b3eec7d34f745074059ac3e466f4e29, session-entries.ts 4035dad36878c19d14aa4cdfd0e6de3c3ccbcb86cf3c280228e3c70b1128f29e, types.ts 22ea739a7175ddd97b2f17a54fa9f876d17b972dc15e3a190848a5a358d5b95c; drafted 2026-11-06, the instrument sha256 is pinned when the seat-route tool ships at the round-92 close commit
recheck: `curl -fsSL https://raw.githubusercontent.com/can1357/oh-my-pi/79fa222e8390aed3494f4bc6746814e6c74c21cf/<path> | sha256sum` for the three paths above (expect 6a7a2375…, 4035dad3…, 22ea739a…), and `python3 .ufo/waves/round-92/probe/probe92-c1.py --tool scripts/seat-route.mjs --index .ufo/waves/round-92/probe/index92.tsv --sample-a .ufo/waves/round-92/probe/sampleA.tsv --waves .ufo/waves/round-91/w1-results.json --out <receipt>` (expect `C92_C1: HELD agree=n/n`, exit 0)

# Seat route from session transcripts

## The class

A seat's route is two facts the transcript keeps apart. The *captured* route is what the harness was
configured to call, written as `model_change` records. The *answered* route is what each assistant turn
actually ran on, written on the turn itself. A report that quotes the captured model reports the request,
not the answer.

Pre-data evidence for the class (round-92 plan § C1): seat `K91Scout` captured
`google-antigravity/claude-opus-5-5` and every answered turn came from
`minimax-code/MiniMax-M3.1-Flash`; the r91 report does not say so. The frozen counter's
captured-reading control reads 70/133 against the oracle's 133/133.

## What a transcript records (S266, S267, S268)

- `model_change` is an entry, not a turn: `{type: "model_change", model, role?, resolvedModelIsFallback?}`
  with `model` in `provider/modelId` form (S267, session-entries.ts:148-156). `role` is optional and
  missing is read as `default` in context reconstruction (S266, session.md:235; S267:152). Replay builds
  its model map from `model_change` entries keyed `role ?? "default"` (S266, session.md:524).
- `resolvedModelIsFallback` is true only when that transition selected a retry-fallback model rather
  than the configured model (S266, session.md:236; S267:154). It marks the transition, not each turn: a
  reader deriving `fallback` from the flags alone scores 126/133 (control `ctl-flagonly`).
- The reserved role `fallback` is ephemeral: model restoration prefers the configured default instead of
  restoring that role's temporary model (S266, session.md:237-238), and the exported constant is
  `EPHEMERAL_MODEL_CHANGE_ROLE = "fallback"` (S267:37). The `subagent:<id>` role form is the retry
  fallback role installed at spawn (S267:299).
- A turn is a `message` row whose `message.role` is `assistant`, storing an `AgentMessage` directly; the
  document's example carries `provider`, `model`, `content`, `usage` and `stopReason` (S266,
  session.md:152-175). Turn order is file order.
- `StopReason` is exactly `stop`, `length`, `toolUse`, `error`, `aborted` (S268, types.ts:1081). An
  assistant message carries `stopReason` and an optional `errorMessage` (S268, types.ts:1358-1360).
- `model_usage` rows also carry `model`, `api`, `provider`, `usage`, `stopReason` and `errorMessage`, but
  they are usage accounting and not model messages or transcript turns (S266, session.md:214-219).
- A resumed session whose tail is non-terminal gets a synthetic assistant message with
  `stopReason: "aborted"` (S266, session.md:339), so an aborted count can include a turn no provider ran.

## The field definitions in plain words (frozen, plan.md § Frozen field definitions)

One record per transcript file (human mode: one `SEAT …` line per seat plus a `SEAT_ROUTE:` verdict;
`--json` for the record). Rows are the file's non-empty lines; a line that does not parse to an object
adds one to `parse_errors`.

- `seat`: the file's basename without `.jsonl`.
- `captured`: the `model` of the first `model_change` whose `role` is `subagent:<seat>`; failing that, of
  the first `model_change` whose `role` is absent or `default`; else null.
- turns: the `message` rows whose `message.role` is `assistant`, in file order. A turn's model is
  `provider + "/" + model`; when either side is missing or empty the whole turn model is `?`.
- `answered`: the distinct turn models of turns whose `stopReason` is `stop`, `toolUse` or `length`, in
  first-seen order.
- `errors`: count of turns with `stopReason` `error`. `aborted`: count with `stopReason` `aborted`.
- `last_error`: from the last `error` turn, the first line of its `errorMessage`, trimmed; every run of
  24 or more characters from `[A-Za-z0-9_-]` becomes `<redacted>`; the result is cut to 120 characters.
  Null when no error turn exists; a non-string `errorMessage` reads as the empty string.
- `yielded`: some turn's `content` holds a `toolCall` item named `yield`.
- `final`: `silent` when there are no turns; otherwise from the last turn's `stopReason`: `served` for
  `stop`/`toolUse`/`length`, `dead` for `error`, `aborted` for `aborted`, `other` for anything else.
- `fallback`: `captured` is not null and some model in `answered` differs from it.
- Wave mode (`--results`): one record per seat, adding `role` (the results.json `agent`) and `session`
  (realpath of the located transcript). Candidates are `<name>.jsonl` files anywhere under the sessions
  root whose bytes contain both `/.ufo/waves/round-<round>/` and `<lane>-shokunin`; the greatest first
  `session`-row `timestamp` wins (ties: greatest path); none gives
  `{seat, role, session: null, final: "absent"}`.
- Exit map: 0 ok; 1 with `--strict` when a seat is dead/absent/silent; 2 fail-closed; 64 usage.

## Captured is not answered — the Amendment-44 trap

A seat naming its model is not evidence of the answering model. The name appears in prose, in its
`model_change` record, and in the `model` field of every turn it requested — all of which describe the
call, not the answer. The Amendment-44 smokes named a model that did not answer (plan § C1).

Two mechanics keep the trap reachable even after reading turns:

- `model` versus `upstreamModel` (S268, types.ts:1335-1341): `upstreamModel` is the concrete model that
  produced the turn when it is knowable independently of the requested id, e.g. reported by a router;
  it is compared against `model` "to notice a gateway serving something other than what was requested".
  So a served turn's `provider/model` is the requested selector unless the gateway reports divergence,
  and the frozen definitions above do not read `upstreamModel`.
- An error turn has no serving model: it is counted in `errors`, never in `answered`, and the model on
  it is the id that was requested and failed. If it is the last turn, the seat reads `dead`, which is
  the field the round prompt needs ("every seat that dies, with its last error text"); a failure
  recorded only as `model_usage` is not a turn and does not make a seat dead.

## Measured status (round 92)

Pre-data controls (`controls/table.txt`, before any candidate existed): positive control = oracle
133/133 HELD; do-nothing 0/133; existing `inline-dispatch-evidence` 0/133; captured-reading 70/133;
last-model 102/133; flag-only fallback 126/133; no-error 54/133; no-abort 121/133; no-redaction 132/133;
final=yielded 120/133. At M the shipped `scripts/seat-route.mjs` (sha256 `cd7ee03d…`) reads
`C92_C1: HELD agree=145/145 A=61/61 C=60/60 W=24/24` twice, the round-92 wave (written after the freeze)
included (`.ufo/waves/round-92/close/probe1.txt`, `probe2.txt`); selftest 37/37. On that wave it found
2 of 12 seats answered by a model other than their captured route (`close/seat-route-r92-w1.txt`); over
the lane's rounds 80–91 the same reading finds 81 of 154 seats did (`K92ExecRetro/retro-table.md`).
Not proven by the counter: parse errors, the 24-char boundary, `?` and `final=other` have no real
discriminating member, so definition-wrong constructions also read HELD there (lesson round 92, M92-3);
the selftest carries those cases.

`errors` counts persisted error turns, one per attempt (K92Scout D1): never report it as "failed requests".

## Limits

- Redaction is shape-based, not a secret scanner: a run shorter than 24 characters from
  `[A-Za-z0-9_-]` survives, so a short credential-shaped token is printed as-is.
- Transcripts are read-only host records. Cite path plus sha256 and quote only needed fields; a
  transcript can carry tool output with credentials.
- `final` reads only the last assistant turn; non-message rows appended after it do not change the
  verdict, and a transcript with no assistant turn is `silent`, never `dead`.
- Wave location is content-probed and timestamp-ordered; two seat transcripts with the same first
  `session` timestamp are separated only by greatest path.
- The definitions do not read `upstreamModel` (S268), `model_usage` error records (S266), or
  `retryFallback` roles installed at spawn (S267:299). [INFERENCE] On a gateway that reroutes silently,
  `answered` can therefore name the requested model for a turn another model served.

# kumitate round 92 — plan (FROZEN at the freeze commit; never edited after)

L1: KumitateR92 (holds the canonical §3 planner seat). Base lane tip `814068f08c523f57055840b694a53f875a753cbf`.
Host: Linux run-15 host, omp/18.15.0, node v24.21.0, python3.

## Fresh start (Amendment 46) — what the last three rejections say

Rounds 89, 90 and 91 (and 87, 88 before them) all closed `rejected-honest-stop` on one capability line,
`receipt-bind` v3→v5, under a frozen kill rule that fires when any construction reaches the visible probe's
full mark (r89 `round-89-verifier-spotcheck.md` §2: probe-keyed / skip-mode constructions 30/30; r90 §2:
three 47/47 constructions; r91 §2: clause (d), three token-keyed 56/56 constructions). The scorer, not the
instrument, lost each round: a frozen probe whose inputs a candidate can see is keyable.
considerthese/2026-11-05.md idea 3 names the same thing ("the question, not the answer, should change … a
post-freeze held-out probe set … never shown to candidates"). This round therefore does NOT claim
`receipt-bind` again, and its counter scores on inputs no candidate can see before it is final.
Routed debt carried from the r91 spot-check (§5) is answered as round work, not as a claim (see § Debt).

## Claim C1 — operability, capability acquisition `seat-route` (contract `kumitate-seat-route-v1`)

Surface: omp seat transcripts (`~/.omp/agent/sessions/<cwd>/<orchestrator-session>/<Seat>.jsonl`, written
by the harness). The lane's reports must record "a seat's actual answering model" and "every seat that
dies, with its last error text" (round prompt §6 item 2). No lane tool reads that: `inline-dispatch-evidence`
keeps only the first `subagent:` model_change (the captured route), which is the Amendment-44 mistake
(smokes reported as served by amr were answered by mistral after a 402). Pre-data evidence:
`K91Scout` captured `google-antigravity/claude-opus-5-5` and was answered only by
`minimax-code/MiniMax-M3.1-Flash`; the r91 report does not say so (oracle reading of the r91 wave,
`controls/ctl-positive-oracle.txt`).

New tool `scripts/seat-route.mjs`:
- `node scripts/seat-route.mjs --file T.jsonl --json` → one record;
- `node scripts/seat-route.mjs --results <wave>-results.json [--sessions-root D] --json` → one record per seat;
- human mode prints one `SEAT …` line per seat and a `SEAT_ROUTE:` verdict line; `--selftest`; exit map
  0 ok · 1 (with `--strict`) a dead/absent/silent seat · 2 fail-closed · 64 usage.
It must not read, import or execute anything under `.ufo/waves/round-92/` (independence from the oracle).

### Frozen field definitions (executable form: `probe/oracle92.py`)

Rows: one JSON object per non-empty line; a line that does not parse to an object adds 1 to `parse_errors`.
- `seat`: file name without `.jsonl`.
- `captured`: `model` of the first `model_change` row whose `role` is `subagent:<seat>`; if none, of the
  first `model_change` whose `role` is absent or `default`; else null.
- turns: the `message` rows whose `message.role` is `assistant`, in file order; a turn's model is
  `provider + "/" + model` (either missing or empty → `?`).
- `answered`: distinct turn models of turns whose `stopReason` is `stop`, `toolUse` or `length`, in first-seen order.
- `errors`: count of turns with `stopReason` `error`; `aborted`: count with `stopReason` `aborted`.
- `last_error`: of the last `error` turn, `errorMessage`'s first line, trimmed, every run of 24 or more
  characters from `[A-Za-z0-9_-]` replaced by `<redacted>`, then cut to 120 characters; null when no error turn
  (a non-string `errorMessage` reads as the empty string).
- `yielded`: some turn's `content` holds a `toolCall` item named `yield`.
- `final`: `silent` with no turns; else from the last turn's `stopReason`: `served` (stop/toolUse/length),
  `dead` (error), `aborted` (aborted), `other` (anything else).
- `fallback`: `captured` is not null and some `answered` model differs from it.
- Wave mode adds `role` (the results.json `agent`) and `session` (realpath of the located transcript):
  candidates are `<name>.jsonl` files anywhere under the sessions root whose bytes contain both
  `/.ufo/waves/round-<round>/` and `<lane>-shokunin`; the one with the greatest first `session`-row
  `timestamp` (ties: greatest path) wins; none → record `{seat, role, session: null, final: "absent"}`.

Grounding (opened this round, `open/`): oh-my-pi `docs/session.md` § `model_change` ("`resolvedModelIsFallback`
optionally marks a retry-fallback transition"), `packages/coding-agent/src/session/session-entries.ts`
`ModelChangeEntry`, `packages/ai/src/types.ts` `StopReason = "stop" | "length" | "toolUse" | "error" | "aborted"`
and `AssistantMessage.errorMessage`, all at can1357/oh-my-pi `79fa222e8390aed3494f4bc6746814e6c74c21cf`
(`open/sources-fetch.txt`).

### Frozen predicate

```
python3 .ufo/waves/round-92/probe/probe92-c1.py --tool scripts/seat-route.mjs \
  --index .ufo/waves/round-92/probe/index92.tsv --sample-a .ufo/waves/round-92/probe/sampleA.tsv \
  --waves .ufo/waves/round-91/w1-results.json,.ufo/waves/round-92/w1-results.json --out <receipt>
```
(run from the lane root at M; `--salt` omitted, so the C sample is drawn with salt = sha256 of the tool bytes)
prints `C92_C1: HELD agree=n/n …` exit 0. HELD = every scored record agrees with the oracle reading of the
same bytes, A ≥ 55 scored, C ≥ 55 scored, and the round-92 wave (held out: its transcripts do not exist at
freeze) has ≥ 8 seats the oracle locates. Sets: A = `probe/sampleA.tsv` (61 transcripts, stratified, salt
`probe/sampleA.salt`); C = 10-stratum draw (fallback 12, dead 6, aborted 6, silent 4, errfix 8, multi 8,
clean 12, redact 4, parseerr 2, capnone 4; strata from the frozen `probe/index92.tsv`, 23206 transcripts)
excluding A and any transcript modified < 900 s before scoring; W = wave mode on r91 w1 and r92 w1.

### Kill rule (frozen)

C1 is UNMET if any of:
(a) the shipped `scripts/seat-route.mjs` at M is not HELD on two runs;
(b) any non-positive pre-data control (`controls/table.txt`) reads HELD;
(c) a committed reproduction shows the shipped tool's record contradicting a field definition above on a
    real transcript (also when the oracle shares the error);
(d) the shipped tool reads, imports or executes a file under `.ufo/waves/round-92/` (grep of its bytes for
    `round-92`, `oracle92`, `probe92` > 0, or a seat-shown runtime read);
(e) the bytes scored differ from the bytes shipped at M (sha256 in both receipts).
Not in the kill rule, by design: "a construction reaches HELD". The counter scores correctness on inputs
drawn after the tool is final (C) and on transcripts that did not exist at freeze (round-92 wave); a
construction that agrees there implements the definitions. Findings outside the definitions (e.g. omp
semantics the definitions do not model) are routed, not kill-rule events.

### Pre-data controls (run before any candidate exists; `controls/run-controls92.sh`, receipts `controls/ctl-*.txt`)

| control | what it skips | reading |
|---|---|---|
| ctl-absent (do-nothing) | no tool | `UNMET agree=0/133` |
| ctl-inline-v1 (existing lane gate) | `inline-dispatch-evidence.mjs` has no per-seat route output | `UNMET agree=0/133` |
| ctl-captured (Amendment-44 reading) | answering model = captured route | `UNMET agree=70/133` |
| ctl-lastmodel | only the last served model | `UNMET agree=102/133` |
| ctl-flagonly | fallback from `resolvedModelIsFallback` flags | `UNMET agree=126/133` |
| ctl-noerror | failed requests ignored | `UNMET agree=54/133` |
| ctl-noabort | aborted turns ignored | `UNMET agree=121/133` |
| ctl-noredact | no credential-shape redaction | `UNMET agree=132/133` |
| ctl-yieldfinal | final = yielded | `UNMET agree=120/133` |
| ctl-positive-oracle (positive) | nothing | `HELD agree=133/133` |

(Pre-data controls ran with `--waves` r91 only; the r92 wave does not exist yet.)

## Frontier step (§2b)

Rows S266 (session.md), S267 (session-entries.ts), S268 (types.ts) — opened this round, cited by the new
knowledge entry and by C1 (sourced claim). Census at start: `open/census-start.txt` (exit 0).
Mistake mined into `corpus/lessons/round-92.md` `## Mistakes`; assimilation: considerthese/2026-11-05.md idea 3.

## Debt answered as round work (not claims)

r91 spot-check §5: (1) mutation tally 7/11 → 6/11 named correction; (2) survivor list m02/m07/m08/m10/m11
named (no re-arm: `receipt-bind` is not re-claimed; m08 routed with the line); (3) harm scope — no shipped
`receipt-bind` change this round, so no harm check owed on it; (4) carried items stay queued in SCORECARD;
(5) tabi adjacency stays routed to tabi. Adopt `round-91-verifier-spotcheck.md` (spotcheck-adopt).

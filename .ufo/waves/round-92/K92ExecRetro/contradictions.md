# Contradictions — filed round reports vs the transcripts (rounds 80–91)

Method. Each report below is `/home/vgpnk/Projects/shokunin/.ufo/reports/round-<N>/kumitate.md` (fleet repo,
read-only, cited by line). The transcript reading is the frozen oracle's, one record per seat:
`retro-r<N>.json` in this seat dir, produced by
`python3 .ufo/waves/round-92/probe/oracle92.py --results .ufo/waves/round-<N>/w1-results.json`
(lane root; oracle sha256 in `sha256.txt`; 154/154 wave seats located, `timings.tsv`).
Label key: **[HARD]** the report sentence is false against an oracle field; **[UNDERSTATE]** the report's
status set is incomplete or its route is undisclosed where the transcripts give it; **[AGREE]** no
contradiction. Anything not read from an oracle field carries an explicit `[INFERENCE]` tag.

Corpus totals over the 12 waves: 154 seats, 128 `served`, 26 `dead`, 0 `aborted`/`silent`/`other`/`absent`;
**81 seats (53 %) were answered on a model other than their captured route** (`fallback`), and in **43 seats
the captured route answered no turn at all**. Of the 26 dead seats, the 12 reports name 18; the other 8 are
named below.

## 1. round 86 — four dead seats reported as "settled"; the dead seat's model is the second (fallback) route

**[HARD]** `round-86/kumitate.md:166-168`:

> - **Seats without artifacts:** reviewer, critic, sentinel and revenger settled while the orchestrator kernel
>   restarted mid-wave; their output was not retained and no report/build file exists.

Oracle (`retro-r86.json`): `K86Review`, `K86Critic`, `K86Sentinel`, `K86Revenger` each have
`final: "dead"`, `errors: 1`, `answered: []`, `yielded: false`, and `last_error` =
`402 Upstream request failed: Insufficient account funds (type=server_error)`.
There was no output to retain — no turn ever stopped on `stop`/`toolUse`/`length`, and no model answered.
Artifact check: `w1/` holds exactly the 7 files of the 7 `served` seats (`K86Connector`, `K86ExecDriver`,
`K86ExecMap`, `K86ExecProxy`, `K86ExecTool`, `K86Scout`, `K86Scribe`); none of the five dead seats has one.
The recorded cause is a provider balance failure on the seat's one request, not a kernel restart.
(One transcript check, read-only, not an oracle field: each of the four files has exactly one assistant
message and it is the error turn — `K86Mutation` dump in `route-dumps.txt` shows the same shape.)

**[HARD]** `round-86/kumitate.md:6`:

> One v1 wave, 12 seats, settled before this report

Oracle: 5 of those 12 rows end on an `error` turn (`K86Review`, `K86Critic`, `K86Mutation`, `K86Sentinel`,
`K86Revenger`); 7 are `served`. `w1-results.json` rows exist but carry `output: null` for all 12
(`run-meta.txt`), so "settled" here records a row, not a completed seat.

**[HARD]** `round-86/kumitate.md:163-165`:

> - **Dead seat:** `K86Mutation` — `401 Invalid 'Authorization' header or token
>   (type=authentication_error param=UNAUTHORIZED)` on `commandcode/deepseek/deepseek-v4.1-flash`

Oracle: `captured` = `opencode-go/deepseek-v4.1-flash`; `answered` = `[]`; `errors` = 3; `last_error` =
`401 Invalid 'Authorization' header or token. (type=authentication_error param=UNAUTHORIZED)`.
`commandcode/deepseek/deepseek-v4.1-flash` is the *second* route: the transcript's `model_change` rows are
role-less `opencode-go/deepseek-v4.1-flash`, `subagent:K86Mutation` `opencode-go/deepseek-v4.1-flash`, then
`role: "fallback"` / `resolvedModelIsFallback: true` → `commandcode/deepseek/deepseek-v4.1-flash`
(`route-dumps.txt`). So the report names the fallback route as the seat's route, and the model it names was
never an answering model: 3 error turns, zero served turns.

## 2. round 87 — three dead/partial seats listed, seven seats end dead

**[UNDERSTATE]** `round-87/kumitate.md:66-68`:

> - **Dead / partial seats** (disclosed, never credited): `K87ExecSources` — no artifact, no report;
>   `K87ExecClose` — runner artifact, no report; `K87Mutation` — battery artifact, no report. Eleven of
>   fourteen seats filed `w1/<seat>.md`.

Oracle: 7 of 14 seats are `final: "dead"`. Beyond the three named, `K87Review` (12 errors, last
`402 [code=insufficient_balance] …`), `K87Critic` (11, `401 …`), `K87Revenger` (12, `401 …`) and `K87Review2`
(10, `401 …`) all end on an error turn, each `yielded: false`. Their `w1/<seat>.md` files exist (11 files on
disk), which is why the artifact-based test passed them: a report file is not evidence that a seat finished.
`[INFERENCE]` The four wrote their reports and then died on provider auth/balance failures, before the yield
call the harness records.

## 3. round 90 — "12/12 COMPLETE" while 6 seats were answered on another model

**[UNDERSTATE]** `round-90/kumitate.md:8`:

> Dead seats: none (12/12 COMPLETE, `.ufo/waves/round-90/w1-results.json`).

Oracle: `final` is `served` for all 12 — the dead-seat half is true. The route half is not disclosed:
6 seats are `fallback: true`, and two of them were never answered on the captured route at all —

| seat | captured | answered |
|---|---|---|
| `K90Connector` | `zai/glm-5.3-flash` | `anthropic/claude-haiku-5-5` |
| `K90Sentinel` | `zai/glm-5.3-flash` | `anthropic/claude-haiku-5-5` |
| `K90Reviewer` | `zai/glm-5.3-flashx` | `commandcode/z-ai/glm-5.3-flash` |
| `K90ExecAudit` | `zai/glm-5.3-flash` | `anthropic/claude-haiku-5-5`, `zai/glm-5.3-flash` |
| `K90CriticA` | `zai/glm-5.3-flash` | `anthropic/claude-haiku-5-5`, `zai/glm-5.3-flash` |
| `K90Mutation` | `zai/glm-5.3-flash` | `anthropic/claude-haiku-5-5`, `zai/glm-5.3-flash` |

Corroboration from the lane's own record: `corpus/lessons/round-90-verifier-spotcheck.md:106-107` routed the
same wording for a weaker reason ("only 2 of 12 seat records … carry a literal status field"); the transcripts
show the stronger defect, that 6 of the 12 were not answered by the model their route named.
`[OBSERVED]` The r90 report states no model anywhere (`grep` sweep in `sweep-model-statements.txt`).

## 4. round 91 — "no DEAD/FAILED/TIMEOUT marker" as the status test, the scout answered on MiniMax

**[UNDERSTATE]** `round-91/kumitate.md:7`:

> Dead seats: none (12 results with substantive output, no DEAD/FAILED/TIMEOUT marker,
> `.ufo/waves/round-91/w1-results.json`).

Oracle: all 12 `served` (agrees on dead). The status test the sentence states is a string scan of the results
rows; it cannot see a route divergence, and the transcripts carry one:

| seat | captured | answered | errors | last_error |
|---|---|---|---|---|
| `K91Scout` | `google-antigravity/claude-opus-5-5` | `minimax-code/MiniMax-M3.1-Flash` | 1 | `Cloud Code Assist API error (429): {` |
| `K91Reviewer` | `zai/glm-5.3-flashx` | `zai/glm-5.3-flashx`, `commandcode/z-ai/glm-5.3-flash` | 5 | `429 Rate limit reached for requests (type=1302)` |
| `K91CriticA` | `zai/glm-5.3-flash` | `zai/glm-5.3-flash`, `anthropic/claude-haiku-5-5` | 1 | `429 Rate limit reached for requests (type=1302)` |
| `K91CriticB` | `zai/glm-5.3-flash` | `zai/glm-5.3-flash`, `anthropic/claude-haiku-5-5` | 1 | `429 Rate limit reached for requests (type=1302)` |

`K91Scout` is the plan's pre-data case: the captured opus route answered nothing, every answering turn came
from `minimax-code/MiniMax-M3.1-Flash`, and the report records neither fact.

## 5. round 84 — "unobserved" refuted by the transcripts

**[HARD]** `round-84/kumitate.md:10`:

> Captured IDs equal seat names; retained handles expired, so **death count and actual answering models are
> unobserved**, not inferred from configured routes.

Oracle: all 10 seats located and read; `final: "served"` for 10/10; every seat's `answered` is
`openai-codex/gpt-6.1-sol` (9 seats also answered `zai/glm-5.3-flashx`, their captured route; `K84Sentinel`
was answered only on `openai-codex/gpt-6.1-sol`). The death count is 0 and the answering models are in the
transcripts, so the report's claim of unobservability is false — the record it calls unobservable was on disk.
`[INFERENCE]` The lane had no tool that reads it, which is the defect this round's claim addresses; the
report's wording, however, states unobservability as a fact about the record.

## 6. Rounds whose report agrees with the transcripts

| round | report line | report claim | oracle |
|---|---|---|---|
| 80 | `kumitate.md:36` | "all 13 settled, 13 reports, no dead seats" | 13 seats, 13 `served`, 0 dead; 13 `w1/*.md` ✓ (route undisclosed: 11 fallback, 6 seats whose captured `devin/swe-2` never answered) |
| 81 | `kumitate.md:224-229` | "all 14 seats settled"; "Dead seats: 2 … `K81MutC1` … `K81Sentinel`" | 14 seats, 12 served, 2 dead — same two names ✓ |
| 82 | `kumitate.md:183-184`, `227-229` | "Settled 14/14, reports 11/14; dead seats 3 (`K82ReviewC1`, `K82MutCounters`, `K82Sentinel`)" | 14 seats, 11 served, 3 dead — same three names; 11 `w1/*.md` ✓ |
| 83 | `kumitate.md:13-19` | "Five seats settled without a report file", `K83ExecHandoffV3` last error *429 Usage limit … type=1308* | 5 dead, same five names; `K83ExecHandoffV3` `last_error` = `429 Usage limit reached for 5 hour. … (type=1308)` ✓ |
| 85 | `kumitate.md:32` | "13 seats, 13 settled, 0 dead" | 13 `served` ✓ (route undisclosed: 10 fallback) |
| 88 | `kumitate.md:85-87` | "Dead seats 0 (all 12 reports in `w1/`; … outputs null there, reports present)" | 12 `served`, 12 `w1/*.md` ✓ |
| 89 | `kumitate.md:53-56` | "Dead seats: 4 — `K89ScribeSources`, `K89ScribeLesson`, `K89Critic` … `K89Sentinel`" | 4 dead, same four names ✓ |

`[OBSERVED]` The r88 and r86 waves both carry `output: null` in every results row (r88: 12/12, r86: 12/12;
r80–r91 otherwise 0 null rows). For r88 the transcripts show 12/12 `served` with `yielded: true`, i.e. the
results file lost answers the transcripts still hold — the record a report needs is the transcript.

## 7. What this means for the seat-status prose the reports write

- The two status tests the reports actually used are gradeable against the transcripts and both are weak:
  a marker/status-field scan of `w1-results.json` (r91:7, r90:8, and the spot-check's own reading) and an
  artifact-presence count (`w1/<seat>.md`). Neither sees a dead seat that wrote a file before dying (r87's
  four), and neither sees the answering model (81/154 seats).
- The only model named in any of the 12 reports (r86:164) is the fallback route, not the captured one, and
  no model answered at all.
- Where a report states a status or a model, the oracle disagrees in 6 rounds (r80, r84, r86, r87, r90, r91)
  and agrees in 6 (r81, r82, r83, r85, r88, r89); 4 of the disagreements (r80, r84, r90, r91) are route or
  observability, 2 (r86, r87) are final-state.

# Contradictions — filed round reports vs the v2 transcript reading (rounds 85–92)

Method. Reference reading is the FROZEN oracle:
`python3 .ufo/waves/round-93/probe/oracle93.py --results .ufo/waves/round-<N>/w1-results.json`
(lane root, `~/.omp/agent/sessions` default), one record per seat; per-wave outputs `o85.json … o92.json`
in scratch, folded into `retro-oracle.tsv` (100 rows, 13 columns) and `retro-oracle-counts.tsv` by
`build_retro.py`. Report text is `/home/vgpnk/Projects/shokunin/.ufo/reports/round-<N>/kumitate.md`
(fleet repo, read-only, cited by line). Independently of the oracle, `recheck_oracle.py` (written from
`plan.md` §"Frozen field definitions (v2)" alone, importing nothing) reproduces **1700/1700 field values
over the 100 located seats, 0 disagreements** (`oracle-recheck.txt`); and `oracle_attack.py` scores
**51/51 hand-derived checks over 20 synthetic fixtures, 0 fail** (`oracle-attack.txt`).

Model identity is compared with a trailing `:level` suffix stripped (`split(':',1)[0]`) — stated because
`captured`/`answered` carry no level and `resolved` does; with that rule `resolved` equals `captured` on
**100/100** seats (`resolved_ne_captured=0` in every wave).

Label key: **[CONTRADICTED]** the sentence is false against an oracle field; **[UNDERSTATE]** the sentence
is true as worded but its status set or route is incomplete where the record has the answer;
**[AGREE]** no contradiction. Quotes are ≤25 words.

## Corpus totals, rounds 85–92

100 seats, all located (`locate` rule; 0 `absent`): **84 `served`, 16 `dead`**, 0 `aborted`/`silent`/`other`.
215 error turns; **181 recovered, 34 with no `retryRecovery` row at all** (i.e. no recovery was written).
**17 seats were answered on no turn of their `resolved` model** (level-stripped); 34 seats under the
v1 `captured` rule. 63 `flag_hops`, 4 `revert_hops`, 2 seats served through an aggregator (`Stealth`, r91).

| wave | seats | dead | zero-served | not answered by `resolved` | fallback (`captured` rule) | unrecovered | err/recovered turns | flag/revert hops | upstream |
|---|---|---|---|---|---|---|---|---|---|
| 85 | 13 | 0 | 0 | **10** | 10 | 0 | 10 / 10 | 10 / 0 | – |
| 86 | 12 | **5** | **5** | 0 | 4 | **5** | 13 / 6 | 7 / 0 | – |
| 87 | 14 | **7** | 0 | 0 | 3 | **1** | 89 / 71 | 11 / 0 | – |
| 88 | 12 | 0 | 0 | 0 | 0 | 0 | 0 / 0 | 0 / 0 | – |
| 89 | 13 | **4** | 0 | 3 | 5 | 0 | 81 / 72 | 20 / 0 | – |
| 90 | 12 | 0 | 0 | 3 | 6 | 0 | 6 / 6 | 6 / **3** | – |
| 91 | 12 | 0 | 0 | 1 | 4 | 0 | 13 / 13 | 6 / **1** | **Stealth** |
| 92 | 12 | 0 | 0 | 0 | 2 | 0 | 3 / 3 | 3 / 0 | – |

(2) **Unrecovered failures.** By the seat predicate (`error_attempts > 0 and recovered_attempts == 0`)
there are **6** seats: `K86Review`, `K86Critic`, `K86Mutation`, `K86Sentinel`, `K86Revenger`, `K87ExecSources`.
By the attempt, **16 seats** carry ≥1 unrecovered attempt (34 turns): r86's 5, the 7 r87 dead seats, and
`K89ScribeSources`/`K89ScribeLesson`/`K89Critic`/`K89Sentinel`. The seat predicate therefore hides
10 seats that died mid-flight after earlier recoveries — the r92 wave's own `K92Reviewer` (2/2) and
`K92Sentinel` (1/1) are the opposite case, fully recovered.

(3) **Aggregator.** Only r91: `K91ExecInst` and `K91ExecCarry`, `upstream=["Stealth"]`, resolved and answered
`commandcode/stealth/crouton-alpha`. No other wave in 85–92 served a turn through an `upstreamProvider`.

## 1. round 86 — the only round whose seat-status prose the record contradicts outright

**[CONTRADICTED]** `round-86/kumitate.md:6`:

> One v1 wave, 12 seats, settled before this report

5 of the 12 (`K86Review`, `K86Critic`, `K86Mutation`, `K86Sentinel`, `K86Revenger`) are `final: "dead"`,
`answered: []`, `yielded: false`; 7 are `served`. Rows exist in `w1-results.json` for all 12, so "settled"
records a results row, not a completed seat.

**[CONTRADICTED]** `round-86/kumitate.md:166-168`:

> - **Seats without artifacts:** reviewer, critic, sentinel and revenger settled while the orchestrator kernel
>   restarted mid-wave; their output was not retained and no report/build file exists.

All four are `final: "dead"` with **exactly one assistant turn each, and it is the error turn**:
`answered: []`, `error_attempts: 1`, `recovered_attempts: 0`, `yielded: false`, and
`last_error` = `402 Upstream request failed: Insufficient account funds (type=server_error)`.
There was no output to retain, and the record names a provider-funds failure — not a kernel restart.

**[UNDERSTATE]** `round-86/kumitate.md:163-165`:

> - **Dead seat:** `K86Mutation` — `401 Invalid 'Authorization' header or token
>   (type=authentication_error param=UNAUTHORIZED)` on `commandcode/deepseek/deepseek-v4.1-flash`

v2: `resolved` = `opencode-go/deepseek-v4.1-flash:high`, chain of 4, `error_attempts: 3`,
`recovered_attempts: 0`, `superseded_by: []`, `answered: []`. The transcript holds **three** failed
attempts, not one: two on `opencode-go` (`402 … insufficient funds`) and the last on `commandcode`
(the 401). The named provider is the last attempt — a hop the record's `model_change` marks
`role: "fallback"`, `resolvedModelIsFallback: true` — and the seat's configured model is never named.
This is exactly the D1 defect v2 renames: one error row per failed **attempt**. (round 92's retro graded
this sentence HARD as "the report names the fallback route as the seat's route"; on the bytes the 401
really did come from `commandcode`, so UNDERSTATE is the accurate grade and the attempt count is the defect.)

## 2. round 87 — three dead/partial seats disclosed, seven seats end on an error turn

**[UNDERSTATE]** `round-87/kumitate.md:66-68`:

> - **Dead / partial seats** (disclosed, never credited): `K87ExecSources` — no artifact, no report;
>   `K87ExecClose` — runner artifact, no report; `K87Mutation` — battery artifact, no report.
>   Eleven of fourteen seats filed `w1/<seat>.md`.

7 of 14 are `final: "dead"`. Beyond the three named: `K87Review` (12 attempts, 9 recovered, last
`402 [code=insufficient_balance]`), `K87Critic` (11 / 8, `401`), `K87Revenger` (12 / 9, `401`) and
`K87Review2` (10 / 7, `401`) — each `yielded: false`. Their `w1/<seat>.md` files exist, which is why the
artifact-based test passed them: a report file is not evidence that a seat finished.

## 3. rounds 85, 90, 91 — status true, route undisclosed

**[UNDERSTATE]** `round-85/kumitate.md:32` — "ONE v1 wave of **13 seats, 13 settled, 0 dead**": dead count
agrees (0). Route: **10 of 13** seats were configured `devin/swe-2:max`, every one of them failed their
first attempt with `Devin stream error permission_denied: This model is no longer available for your
account.`, and every one was superseded by `commandcode/deepseek/deepseek-v4.1-flash` (10 `flag_hops`,
10/10 recovered). The wave report names no model. r85 is the corpus's widest route divergence (10/13).

**[UNDERSTATE]** `round-90/kumitate.md:8` — "Dead seats: none (12/12 COMPLETE, `.ufo/waves/round-90/w1-results.json`)".
Dead half true (12 `served`). Routes: 6 seats `fallback`, and **3** (`K90Connector`, `K90Sentinel`,
`K90Reviewer`) were answered on no turn of their resolved model. r90 is the only wave with **3
`revert_hops`** — `K90ExecAudit`, `K90CriticA`, `K90Mutation`: resolved `zai/glm-5.3-flash:max`, one chain
entry `anthropic/claude-haiku-5-5:high`, answered `[anthropic/claude-haiku-5-5, zai/glm-5.3-flash]` — the
D4 pattern (role `fallback` reused for the revert-to-primary hop), invisible to v1.

**[UNDERSTATE]** `round-91/kumitate.md:7` — "Dead seats: none (12 results with substantive output, no DEAD/FAILED/TIMEOUT marker…)".
Dead half true (12 `served`). Routes: `K91Scout` resolved `google-antigravity/claude-opus-5-5:high`,
answered nothing on it, every served turn from `minimax-code/MiniMax-M3.1-Flash` (1 `flag_hop`);
`K91Reviewer` has the corpus's second `revert_hop`; and the two aggregator seats (`Stealth`) are here.

## 4. rounds whose report agrees with the record

**[AGREE]** `round-88/kumitate.md:85-87` — "Dead seats 0 (all 12 reports in `w1/`…)": 12/12 `served`, 0 error
turns, resolved = captured = answered `anthropic/claude-opus-5-5` on every seat. The cleanest wave in the set.

**[AGREE]** `round-89/kumitate.md:53-56` — "Dead seats: 4 — `K89ScribeSources`, `K89ScribeLesson`,
`K89Critic` … and `K89Sentinel`": exactly those four are `dead`, no more. (Their activity is larger than
"no deliverable" suggests — 5, 5, 7 and 12 failed attempts, of which 3, 3, 4 and 10 were recovered — but that
is an artifact judgement, not a transcript field, and is not graded here.)

**[AGREE]** `round-92/kumitate.md:23` — "r92 wave — 12 served, 2 fallback (K92Reviewer zai→anthropic haiku,
K92Sentinel amr→mistral)": 12/12 `served`, exactly 2 `fallback` seats, the same two.

**[AGREE]** `round-92/kumitate.md:114-115` — "10 seats on `amr/deepseek-v4.1-flash` or
`minimax-code/MiniMax-M3.1-Flash` as captured": 9 seats captured `amr/deepseek-v4.1-flash`, `K92Scout`
captured `minimax-code/MiniMax-M3.1-Flash`; the other 2 are the two above.

**[AGREE]** `round-92/kumitate.md:115-116` — "K92Reviewer `zai/glm-5.3-flashx` → `anthropic/claude-haiku-5-5`
(2 error turns, devin permission_denied)": `error_attempts: 2`, `recovered_attempts: 2`,
`superseded_by: ["anthropic/claude-haiku-5-5"]`, `last_error` `Devin stream error permission_denied: …`.

**[AGREE]** `round-92/kumitate.md:116-117` — "K92Sentinel `amr/deepseek-v4.1-flash` →
`mistral/deepseek-v4-1-flash-1017` (1 error turn, tier limit)": `error_attempts: 1`, `recovered: 1`,
`superseded_by: ["mistral/deepseek-v4-1-flash-1017"]`, `last_error` `400 [code=tier_limit_exceeded] …`.

**[AGREE]** `round-92/kumitate.md:24-25` — "r80–r91 retro — 81/154 seats answered by a non-captured model,
26 dead": re-derived over r80–r91 with the same oracle — **154 seats, 81 `fallback`, 26 `dead`**, and the
retro's companion figure "43 seats the captured route answered no turn at all" reproduces exactly (43).

## Contradiction counts per wave

| wave | statements graded | CONTRADICTED | UNDERSTATE | AGREE |
|---|---|---|---|---|
| 85 | 1 | 0 | 1 | 0 |
| 86 | 3 | **2** | 1 | 0 |
| 87 | 1 | 0 | 1 | 0 |
| 88 | 1 | 0 | 0 | 1 |
| 89 | 1 | 0 | 0 | 1 |
| 90 | 1 | 0 | 1 | 0 |
| 91 | 1 | 0 | 1 | 0 |
| 92 | 4 | 0 | 0 | 4 |
| **total** | **13** | **2** | **5** | **6** |

Plus one cross-wave statement (r92:24-25 about r80–r91), graded AGREE.
Where a report states a status or a model, the record contradicts it in r86 only; it understates in
r85/r86/r87/r90/r91 and agrees in r88/r89/r92.

## Observations about the frozen text itself (routed, not contradictions, not kill events)

1. **`last_error` when no turn failed is not defined by `plan.md`.** The plan gives the redaction rule and
   "non-string → `\"\"`", but says nothing about the no-error-turn case; the frozen oracle prints `null`
   (initialised `None`, `_head` never called). 42 of the 100 seats have no error turn, so this is the most
   load-bearing sentence the plan omits. Follow-the-oracle is the only safe reading; a candidate that prints
   `""` disagrees type-strictly on 42 seats.
2. **`chain` excludes the primary.** In every one of the 100 records `retryFallback.chain` lists only
   fallbacks (r85 executors: resolved `devin/swe-2:max`, chain has no `devin/swe-2`; r90's six
   `zai/glm-5.3-flash:max` seats have `chain == ["anthropic/claude-haiku-5-5:high"]`). "the configured chain"
   in the plan therefore means "the fallback chain", and `chain_len` is not a hop count to the primary.
3. **`superseded_by` can skip chain entries.** r85's ten seats: the single error row's `supersededBy` is
   `commandcode/deepseek/deepseek-v4.1-flash` — the 3rd chain entry — while `amr/…` and `opencode-go/…`
   (entries 1–2) never appear as a superseder or an error. The field reports the persisted decision, not a
   walk of the chain; reading it as "the next hop" is wrong.
4. **Every `retryRecovery` object in this corpus has `status: "recovered"` and a `supersededBy` object**
   (181/181 error turns that carry one). The `superseded` status and the missing-`supersededBy` shape occur
   nowhere in 100 real seats — F93 fixtures are load-bearing for that arm, matching the plan's Q86 note.
5. **The seat-level `unrecovered` predicate hides mid-flight deaths** (see (2) above): 6 seats versus 16.

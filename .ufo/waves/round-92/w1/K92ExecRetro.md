# K92ExecRetro — real domain run: the answering routes of rounds 80–91

Seat: `K92ExecRetro` (executor, leaf). Scope: the assigned retro run only — read the lane's last twelve
wave records with the FROZEN reference reader (`probe/oracle92.py`, never the candidate tool), tabulate
what actually answered, and grade the filed reports against that record. Read-only on the lane; every
artifact below is in `.ufo/waves/round-92/K92ExecRetro/`.

## Deliverables

| path | what |
|---|---|
| `.ufo/waves/round-92/K92ExecRetro/retro-r80.json` … `retro-r91.json` | verbatim oracle output, one file per wave |
| `.ufo/waves/round-92/K92ExecRetro/retro-table.md` | per-round summary + per-seat rows: final state, captured route, answered models, fallback, errors, aborted, yielded, redacted last error; timing and transcript-size tables |
| `.ufo/waves/round-92/K92ExecRetro/contradictions.md` | every round whose report states a seat status or answering model the transcripts contradict, with report line and oracle field |
| `route-dumps.txt`, `sweep-model-statements.txt` | field-level route rows for the cited seats; the model-statement sweep over all 12 reports |
| `timings.tsv`, `sizes.tsv`, `run-meta.txt`, `run-retro.log` | per-wave seconds, per-seat transcript bytes, wave inventory, run log |
| `run-retro.py`, `gen-table.py` | the two drivers (oracle invocation; table generation from the oracle JSON) |
| `sha256.txt`, `evidence.txt` | frozen reader + all wave records + all deliverables; command log |

## The record (154 seats, rounds 80–91 w1; no round in that range has a w2)

- **128 served, 26 dead, 0 aborted, 0 silent, 0 absent.** All 154 seats located.
- **81/154 seats (53 %) were answered on a model other than the one their seat was dispatched with**
  (`fallback`); in **43 seats the captured route answered no turn at all**.
- **Timing**: 0.25–0.42 s per wave, 4.2 s for all twelve (one process per wave); 127.5 MB of transcript
  under the 154 located paths, largest file `K86Scribe.jsonl` (3,412,884 B). This is the capability's real
  domain run — cheap enough to run at close, which the hand-written status prose cost more to get wrong.

## Report contradictions (exact pointers in `contradictions.md`)

1. **r86** — `round-86/kumitate.md:166-168` calls reviewer, critic, sentinel and revenger "settled … their
   output was not retained"; each has exactly one assistant turn, `stopReason=error`,
   `402 … Insufficient account funds`, and no answered model. Line 163 names
   `commandcode/deepseek/deepseek-v4.1-flash` as `K86Mutation`'s route; the transcript's `captured` is
   `opencode-go/deepseek-v4.1-flash`, and `commandcode/...` appears only as the `role: fallback` change after
   two 402s — no model answered that seat (3 error turns, 0 served).
2. **r87** — `:66-68` lists 3 dead/partial seats; 7 of 14 end on an error turn (`K87Review` 402 balance,
   `K87Critic`/`K87Revenger`/`K87Review2` 401). Report files exist for those four, which is why an
   artifact-presence test passed them.
3. **r90** — `:8` "Dead seats: none (12/12 COMPLETE)": 6 of 12 were answered on another model;
   `K90Connector` and `K90Sentinel` were answered only by `anthropic/claude-haiku-5-5` while their captured
   route was `zai/glm-5.3-flash` — the captured route never answered.
4. **r91** — `:7` states the status test is a marker scan of `w1-results.json`; `K91Scout` captured
   `google-antigravity/claude-opus-5-5` and every answering turn came from
   `minimax-code/MiniMax-M3.1-Flash` (1 error, `Cloud Code Assist API error (429)`), undisclosed.
5. **r84** — `:10` "death count and actual answering models are unobserved": 10/10 located, 10 served,
   every seat answered on `openai-codex/gpt-6.1-sol`, 9 also on their captured `zai/glm-5.3-flashx`.
6. **Agree**: r81 (2 dead, names match), r82 (3 dead, names match), r83 (5 dead, names match, quoted 429
   `type=1308` matches `last_error`), r85, r88, r89 (4 dead, names match). r80 states "no dead seats" and is
   right, but 11/13 were answered on `opencode-go/deepseek-v4.1-flash` rather than the captured `devin/swe-2`.

Disclosure count: of 26 dead seats across the twelve waves the reports name 18; the 8 unnamed are r86's four
and r87's four. Only one of the twelve reports names an answering model at all (r86:164), and it names the
fallback route for a seat nothing answered.

## Risks / limits

- Reading is the oracle's, per the plan's frozen field definitions; where a report and the oracle disagree,
  the oracle is the frozen authority, not ground truth about omp semantics. `[INFERENCE]` labels mark the
  two places where I extended past a field (why r87's four wrote reports before dying; why r84 wrote
  "unobserved").
- `last_error` is already redacted by the definition (`[A-Za-z0-9_-]{24,}` → `<redacted>`, 120 chars); no
  transcript was copied, only the fields quoted in `route-dumps.txt`.
- `w2` is absent in every round 80–91, so the retro covers w1 only.
- Blocks: none. Nothing here depends on the candidate tool or its `READY` marker.

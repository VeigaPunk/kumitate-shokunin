VERDICT: All 40 wave-1 seats ran to completion (each yielded once and closed with session_exit kind=normal reason=dispose; 40/40 reports exist) — the gate reads `INLINE_DISPATCH: CLEAN (seats=40 sessions=40 done=40 reports=40 dead=0)` exit 0 with dead list equal to mine — and the only anomalies are six seats whose session_exit rows were appended after the dispatcher finalized the wave (they were settled idle/parked, not dead) plus one provider-error row in 34 of 40 transcripts (402/429, all recovered via model fallback).

## Evidence
- `node /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/inline-dispatch-evidence.mjs --root /home/vgpnk/Projects/shokunin/kumitate-shokunin --round 63 --wave w1` (node v24.21.0):
  ```
  INLINE_DISPATCH: CLEAN (seats=40 sessions=40 done=40 reports=40 dead=0)
  EXIT=0
  ```
- Dispatcher log `/fast/scratch/hyaku-run7/dispatcher.log`: `465:2026-10-25T17:57:13 spawned kumitate 63 w1 40`; `764:2026-10-25T18:26:35 done kumitate w1 /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-63/w1-results.json` (local = UTC+3).
- Host transcripts: `~/.omp/agent/sessions/-Projects-shokunin/2026-10-25T16-43-09-760Z_01a173f1-d040-72cd-9542-6011673d5d9b/K63*.jsonl` — 40 wave-1 files; each has one `model_change` row with `role:"subagent:<name>"` (spawn model), >=1 `tool_execution_start` for `yield`, and exactly one `custom/session_exit` row.
- `wc -c .ufo/waves/round-63/w1/K63*.md` = 40 files, 460,710 B total.
- Six late-exit seats: `session_exit.data.recordedAt` > finalize 21:26:35Z — K63ExecDeadSeatAudit 21:28:53Z, K63ExecRealWavesDrift 21:29:21Z, K63ExecTranscriptStats 21:29:02Z, K63RevengerDispatcher 21:30:04Z, K63ExecGateForgery 21:33:25Z, K63ScoutStagedScope 21:33:01Z.
- Provider-error rows: assistant messages with `stopReason:"error"` — 34 seats x 1: 402 "Insufficient account funds" (25), 429 "Rate limit reached for requests" (6), 429 "Cloud Code Assist API error… Individual quota reached" (3). All recovered (fallback model_change per seat).

## Findings
1. **K63R2ExecDeadSeatReport-1 (low)** — the six seats the gate's comment calls "yielded but not yet written session_exit (K63 wave 1: 6 of 40)" (scripts/inline-dispatch-evidence.mjs:243) are K63ExecDeadSeatAudit, K63ExecGateForgery, K63ExecRealWavesDrift, K63ExecTranscriptStats, K63RevengerDispatcher, K63ScoutStagedScope. Cause: the dispatcher finalizes when `nlive==0` (tick -> `live(n, run)` against proc:// running names; dispatcher.py:38-39,122-124). These six had yielded but sat parked/idle in the orchestrator — no longer "running", not yet disposed — so finalize wrote w1-results.json while their transcripts still lacked exits; the harness appended each session_exit at dispose up to ~6.5 min after finalize. Not dead, not a retry. Repro: compare `recordedAt` of each seat's session_exit to 21:26:35Z (all six exceed).
2. **K63R2ExecDeadSeatReport-2 (info)** — no seat is dead by any definition available: gate dead=0, my transcript parse dead=0 (40/40 yield + exit normal), reports 40/40. Gate's dead list equals mine (both empty).
3. **K63R2ExecDeadSeatReport-3 (info)** — 34/40 seats carry exactly one provider-error row; pattern is model-provider-correlated and all were recovered: opencode-go/deepseek-v4.1-flash seats (25) -> 402 funds -> devin/deepseek-v4-1-flash; zai/glm-5.3-flash seats (6 of 7) -> 429 rate limit -> devin/glm-5-3-flash-1m; google-antigravity/gemini-3.8-flash connectors (3) -> 429 Cloud Code Assist quota -> inception/mercury-3. The 5 scouts (minimax-code/MiniMax-M3.1-Flash) and K63ReviewQuotes (zai, no fallback) had no error row.
4. **K63R2ExecDeadSeatReport-4 (info)** — per-role counts: executor 13, scribe 6, scout 5, reviewer 4, connector 3, critic 3, mutation-tester 3, sentinel 1, revenger 1, simplifier 1 (matches w1-dispatch.json registry). Per-spawn-model counts: opencode-go/deepseek-v4.1-flash 25, zai/glm-5.3-flash 7, minimax-code/MiniMax-M3.1-Flash 5, google-antigravity/gemini-3.8-flash 3.

## Artifacts
- `build/K63R2ExecDeadSeatReport/seats.tsv` — 40 rows x 12 cols: seat, role, spawn_model, fallback_models, yielded, exit_kind, exit_reason, first_ts, last_ts, exit_ts, report_bytes, provider_error_last_text.
- `build/K63R2ExecDeadSeatReport/summary.txt` — 10-line summary.
- Tooling: none installed (node v24.21.0 pre-existing; no pacman/uv/npx changes).

## Limits
- Did not inspect the orchestrator's live process state at finalize (historical); the idle/parked explanation relies on dispatcher.py tick/live logic and the transcript exit timestamps.
- Did not parse wave-2 (K63R2*) transcripts beyond noting they exist and currently lack exits (wave still in flight).
- Did not verify the L1's own earlier gate run (its integration-time dead=0/6 observation is evidenced only by the gate's code comment).

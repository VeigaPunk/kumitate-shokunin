VERDICT: The real host transcripts ground a zero-violation structural floor (>= 9 answered tool calls, >= 40 rows, >= 132 KB, >= 453 s, unique ids, consistent parent chain, over 538 finished seat-marked seats) and falsify the gate's respawn arm — 63 genuine respawn transcripts carry a byte-identical prompt to a base file that also finished, so an honest wave containing one of those seats reads DRIFT `SESSION_AMBIGUOUS`.

## Evidence

Tool: `.ufo/waves/round-63/build/K63ExecTranscriptStats/stats.mjs` (read-only over `~/.omp/agent/sessions`,
depth <= 3, skip > 50 MB). Snapshot `2026-10-25T21:17:17Z`; the corpus is live and grows between runs.

```
$ node stats.mjs                      # exit=0
TRANSCRIPT_STATS root=/home/vgpnk/.omp/agent/sessions files=4596 scanned=4596 skipped=0 bytes=3123640274

## classification (mutually exclusive)
files total = 4596; with "# Seat <name>" user marker = 639; without = 3957
finished (yield + exit normal) = 1447   [seat-marked 538]
dead: no yield tool call          = 3096   [seat-marked 48]
dead: yield but exit != normal    = 0   [seat-marked 0]
dead: yield but no session_exit   = 53   [seat-marked 53]
exitKind census (all files): normal=4483 NO_RECORD=111 signal=2
exitKind census (seat-marked): normal=538 NO_RECORD=101
```

Distribution among FINISHED seat-marked seats (the population the gate credits), n=538:

```
  bytes        n=538 min=132136 p5=210157 median=380102 p95=984222 max=2474924
  toolResult   n=538 min=9      p5=13     median=31     p95=88     max=199
  spanS        n=538 min=453    p5=485    median=640    p95=1411   max=2925
  toolCalls    n=538 min=9      p5=13     median=31     p95=88     max=199
  rows         n=538 min=40     p5=51     median=92     p95=254    max=537
  distinctTools n=538 min=3     p5=4      median=5      p95=7      max=8
  modelUsage   n=538 min=0      p5=0      median=1      p95=2      max=3
```
(All finished files, n=1447, sit lower: bytes min=46421 p5=196137 median=447410; toolResult min=1 p5=12 median=32;
spanS min=425 p5=480 median=643 — that tail is probe/orchestrator transcripts with no seat marker.)

Structural invariants over the 538 (`HOLDS`/`BROKEN` verbatim):

```
BROKEN toolResult == toolCalls: violations=1 [ScoutPlanned]
BROKEN toolExecStarts == toolCalls: violations=1 [ScoutPlanned]
BROKEN orphanResults == 0: violations=1 [ScoutPlanned]
BROKEN modelUsage >= 1: violations=239
HOLDS  dupIds == 0: violations=0
HOLDS  danglingParents == 0: violations=0
HOLDS  parseFail == 0: violations=0
HOLDS  yield answered by a toolResult: violations=0
HOLDS  session row with an id: violations=0
HOLDS  distinctTools >= 3: violations=0
HOLDS  spanS >= 1: violations=0
```

Threshold sweep (violations among the 538): `toolResult >=2..>=8:0 >=10:3 >=12:11 >=20:80`; `rows >=10..>=40:0 >=46:14`;
`bytes >=10000..>=100000:0 >=190000:12`; `spanS >=30..>=420:0 >=470:5`; `distinctTools >=2:0 >=3:0 >=4:4 >=5:116`.
Zero-violation floors: `toolResult>=9 toolCalls>=9 rows>=40 bytes>=132136 spanS>=453 distinctTools>=3`; floor witnesses
(weakest real finished seat per axis) `toolResult=9@ExecLiveRefetch rows=40@ExecDiffScope bytes=132136@R41F05
spanS=453@ConnRunState-2`; `finished seat-marked failing the zero-violation floor = 1 [ScoutPlanned]`.

Respawn census and the falsifier (see `ambig-probe.txt`):

```
suffixed files = 524 (finished 187, dead 337); suffixed seat-marked = 98 (finished 96, dead 2)
suffixed markerKind census: none=426 base=98   # own=0: every -N stem's prompt names the BASE seat
respawn vs base: base-absent=2 base-finished=96 base-dead=0 identical-first-user-message=63 different=33
  seat-marked "-<N>" files in the live session: 98 (markerKind base=98, own=0, none=0)

$ node ambig-probe.mjs                # exit=0, minimal pair, same fixture, same sessions root
ExecRows01: transcripts=3 promptShaEqual=true promptLen=7003 gateExit=1 INLINE_DISPATCH: DRIFT (seats=1 sessions=1 done=1 reports=1 dead=0) FINDING SESSION_AMBIGUOUS:ExecRows01
ExecDiffScope: transcripts=1 promptShaEqual=true promptLen=3866 gateExit=0 INLINE_DISPATCH: CLEAN (seats=1 sessions=1 done=1 reports=1 dead=0)
```

Cross-session stem collisions (gate `candidates()` scans every session dir):

```
$ node -e '...walk sessions root, group stems by session dir...'
distinct stems=4591 stems in >1 session dir=0
```

No tool was installed for this seat; `node v24.21.0` was already present.

## Findings

**K63ExecTranscriptStats-1 — HIGH — the gate DRIFTs on a genuine respawn.** `scripts/inline-dispatch-evidence.mjs:114`
`candidates()` returns `<Seat>` and every `<Seat>-<N>`; the match is a substring test on the same first user
message, so when the harness respawned a seat both files match and `:224` emits `SESSION_AMBIGUOUS`. Measured:
98 respawn files exist, all with a prompt naming the base seat, 96 with a base sibling that is itself
`finished`, **63 with a byte-identical first user message** (sha256 equal). Any round-63 wave that dispatches one
of those 63 names reads `DRIFT` with exit 1 while every transcript is real — I2 would MISS for a correct lane.
Repro: `node .ufo/waves/round-63/build/K63ExecTranscriptStats/ambig-probe.mjs` → the two lines above.
Proposal (not applied, L1 integrates): `.ufo/waves/round-63/build/K63ExecTranscriptStats/gate-threshold-patch.md` §3.

**K63ExecTranscriptStats-2 — HIGH — the gate has no structural floor, so the cheapest forgery is 15 rows.** The
clean rule at `:231` is only `tr.yielded && tr.exitKind === 'normal'`. Two real finished transcripts in the same
store have exactly that shape and nothing else: `Run7DispatcherProbe` (46421 B, 15 rows, 1 tool call, 1 result)
and `ProbeFlashChain` (90085 B, 18 rows, 1 call, 1 result) — both `finished=1`. A lane that writes such a file per
seat and echoes the dispatched prompt is credited. Measured zero-violation floors to add: `toolResult>=6`,
`toolCalls>=6`, `rows>=30`, `bytes>=80000`, `spanS>=240`, `distinctTools>=2`, `dupIds==0`, `danglingParents==0`,
`parseFail==0`, `session` row with an id, `yield` answered — each set with margin below the observed minimum, so
no real seat is rejected. Repro: `awk -F'\t' 'NR==1||$1=="Run7DispatcherProbe"||$1=="ProbeFlashChain"' stats.tsv`.

**K63ExecTranscriptStats-3 — MEDIUM — do not gate on `model_usage` rows.** 239 of 538 finished seat-marked
transcripts have none (the row type postdates part of the corpus). Any threshold requiring it rejects 44 % of real
seats. Repro: `grep 'seats without model_usage rows' stats.summary.txt`.

**K63ExecTranscriptStats-4 — LOW — strict `toolResult == toolCalls` would false-DRIFT.** One real finished seat
(`ScoutPlanned`, chousa-shokunin) has 161 calls, 162 results, 162 `tool_execution_start` rows and 1 orphan result;
the older `RevC1ExemptionSemantics` / `RevSeatEvidence` sit at calls = results + 1. Safe form:
`|toolResult - toolCalls| <= 1 && orphanResults <= 1`.

**K63ExecTranscriptStats-5 — INFO — one gate arm is unexercised by real data.** No seat-marked transcript has
`yield` + a non-`normal` `session_exit` (0 of 639); the only non-normal kind in the store is `signal=2`, both
non-seat files. Real deaths are the other two modes; the non-normal arm is covered only by the selftest fixture —
worth one control case built from a real dead transcript shape.

**K63ExecTranscriptStats-6 — INFO — death rate grounds the "audit seat deaths" arm.** 101 of 639 seat-marked
transcripts (15.8 %) are dead — 48 no-yield, 53 no-exit-record — and all 639 live in the current run-7 session, so
the `--report` dead-seat arm runs on a 15.8 % base rate: load-bearing, not decorative.

**K63ExecTranscriptStats-7 — INFO — `candidates()` cannot collide across session dirs.** 4591 distinct stems, 0 in
more than one session dir; the ambiguity risk in -1 is confined to same-session `-N` respawns, exactly where measured.

## Artifacts

- `.ufo/waves/round-63/build/K63ExecTranscriptStats/stats.mjs` — the measurement tool (node, read-only).
- `.ufo/waves/round-63/build/K63ExecTranscriptStats/stats.tsv` — 4596 data rows × 34 columns, counts only.
- `.ufo/waves/round-63/build/K63ExecTranscriptStats/stats.summary.txt` — the full summary quoted above.
- `.ufo/waves/round-63/build/K63ExecTranscriptStats/ambig-probe.mjs` + `ambig-probe.txt` — the minimal-pair falsifier and its output.
- `.ufo/waves/round-63/build/K63ExecTranscriptStats/gate-threshold-patch.md` — proposed floor + respawn patch text for the L1.
- Scratch: `/tmp/kumitate-r63/K63ExecTranscriptStats/` (fixtures for `ambig-probe.mjs`).

## Limits

- Snapshot, not a moving target: the corpus grew 4522 → 4596 files during this seat; counts shift a few percent per
  minute. Stable: the shapes (identical-prompt pairs 63, `-N` markerKind own=0, floors at the observed minima) and
  the two probe verdicts. Lane guess comes from the first user message's `Projects/shokunin/<lane>` path; other roots
  report `unknown` (the tool prints the census so the residue is visible).
- I did not verify the gate's other arms against real data (ready/dispatch/results agreement, dispatcher log lines,
  report hashes) — another seat owns those; I measured the transcript side only.
- I did not read transcript bodies; every figure is a count, a name, a hash equality or a timestamp. The probe reads
  the first user message in memory to derive `ctxHead`/task tail and prints only lengths and sha equality.
- The floors are an observed minimum, not a proof of non-forgeability: a mechanical forger that clears 6 calls /
  30 rows / 80 KB and echoes the prompt still passes. The prompt echo, `session` id, `parentSession` and the
  dispatcher log line remain the barrier that lives outside the lane.

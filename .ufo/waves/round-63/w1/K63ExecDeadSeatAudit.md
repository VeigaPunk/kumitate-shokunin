VERDICT: An unnamed dead seat exists in 3 of the 13 rounds whose seat records the lane holds (r52: 1, r60: 26, r62: 6); the new `inline-dispatch-evidence.mjs --report` arm cannot reproduce that finding on any historical round — every one of r59–r62 fails closed before the dead-seat arm runs, and even a reconstructed record reads `dead=0` for r60's 27 dead seats.

# Seat K63ExecDeadSeatAudit — considerthese 2026-10-25 idea 3, "audit seat deaths"

## Evidence

Reproducer (read-only; writes only its own build dir): `node .ufo/waves/round-63/build/K63ExecDeadSeatAudit/audit.mjs`
→ `audit.tsv` (68 dead-seat rows), `unnamed-by-round.tsv`, `unrecorded-spawns.tsv`. Death = `exit!=0`, `session=null`
(only where the progress file has a `session=` field), `status!=completed`, or no report file anywhere in
`.ufo/waves/round-N/` (seat path → the path the seat's own transcript announces → variant). "Named" = the filed report
`.ufo/reports/round-<N>/kumitate.md` holds the name as a whole token; "error text" = an `<wave>/<Seat>.err` line or
the exit code within 240 chars of the name.

```
round transcripts lane_record_seats dead_total named unnamed misnamed measurement
50    0           67                2          2     0       0        registry-only
51    0           64                0          0     0       0        registry-only
52    0           64                2          1     1       0        registry-only
53    0           0                 0          0     0       0        prepared-undispatched
54/55/56 0       64 each           0          0     0       0        prepared: "no seats were spawned"
57    0           64                0          0     0       0        registry-only
58    0           64                29         29    0       0        registry-only
59    0           32                1          1     0       0        progress+results
60    0           32                27         1     26      0        progress+results
61    72          72                1          1     0       0        progress+results+transcripts
62    96          101               6          0     6       32       no dispatch record (w1)
```

Round 60, the known case, re-derived from `round-60/w1/launcher-progress.tsv` (32 rows): 27 rows `exit=-9`
`session=null`, 5 alive (`ExecRows ExecGates ExecCensus RevS133Quote RevS190Quote`). Naming over the filed report:
`ConnectorSiblings` = 1 hit, incidental ("The connector seat scanned siblings (`w1/ConnectorSiblings.md`)"), every
other dead seat 0 hits, no error text. `.ufo/waves/round-60/close/dead-seats-r60.md:15` (`exit=-9`: 27) and its
`## All 32 seats` table at `:24` (landed in round 61) tabulate all 27 — a lane artifact, not the filed report.

Round 52, new: registry 64 members, 62 seat reports, missing `ScribeReadme CritDoNothing`. The report names only
`CritDoNothing` (`round-52/kumitate.md:168-170`) and then claims "all other 63 seats returned" — false for
`ScribeReadme` (a `build/ScribeReadme/` dir exists, no seat report, name absent from the report).

Round 62: 96 host transcripts (`~/.omp/agent/sessions/**/L1Kumitate62/L1Kumitate62.<Seat>.jsonl`); the committed
`w2-dispatch.json` lists 40; 25 spawns are named by no lane record (`unrecorded-spawns.tsv`); 32 seats filed under
topic names (`Audit17` → `S142.md`, `CritC2HashPin` → `CritC2Subcase8.md`); 6 seats have no report anywhere
(`Audit24` — "I could not complete the overlap recheck … No report was written." — plus `R11-PinHash R24-ToolScope
S4-ForgedSeats W1-DispatchActual W4-RouteTable`, findings only in their transcripts). None of the 6 is named; the
report says "dead-seat count is unmeasured, not zero" (`round-62/kumitate.md:12`).

Gate, exact round-63 command (run at close, after `w1-results.json` lands):
```
node scripts/inline-dispatch-evidence.mjs --root /home/vgpnk/Projects/shokunin/kumitate-shokunin \
  --round 63 --wave w1 --report /home/vgpnk/Projects/shokunin/.ufo/reports/round-63/kumitate.md
```
Now (wave in flight): `INLINE_DISPATCH: FAIL-CLOSED results-unreadable path=.ufo/waves/round-63/w1-results.json`,
`FINDING RESULTS_UNREADABLE`, EXIT=2. Expected at close: `INLINE_DISPATCH: CLEAN (seats=40 … dead=N)` exit 0, or one
`DEAD_UNNAMED:<Seat>` per dead seat the report does not name.

Against the historical reports (`gate-demos.txt` §2): r59 w1, r60 w1, r61 w2, r62 w2 each read
`INLINE_DISPATCH: FAIL-CLOSED wave-absent ready=false dispatched=false wave=.ufo/waves/round-N/wN`, `FINDING
WAVE_ABSENT`, EXIT=2 — the gate needs `<wave>.ready`, `.ready.dispatched`, `<wave>-dispatch.json` and
`<wave>-results.json`, none of which a run-5/6 round has. It cannot run there.

## Findings

1. **high — three rounds carry an unnamed dead seat, and the gate cannot see any of them.** r52 (1), r60 (26), r62
   (6); r50 (2/2 named), r58 (29/29 named), r59 (1/1), r61 (1/1), r51/r57 (0) are clean. Attacks the
   considerthese criterion itself: "a round's report names every dead seat" is false for 3 of 13 rounds and was never
   checked. Repro: `node .ufo/waves/round-63/build/K63ExecDeadSeatAudit/audit.mjs`.
2. **high — round 62's "dead-seat count is unmeasured" is falsified by the host transcripts.** 96 sessions exist,
   each with `session_exit kind=normal`. The committed dispatch names 40 of the 96, a report file names another 31,
   25 are named by no lane record at all, and 32 seats wrote their report under a topic name; "unmeasured" hid both
   that record gap and 6 dead seats.
   Repro: `cat .ufo/waves/round-63/build/K63ExecDeadSeatAudit/unrecorded-spawns.tsv`.
3. **high — the gate's `--report` arm cannot audit a historical round at all.** r59–r62 fail closed `WAVE_ABSENT`
   before the dead-seat arm is reached (`gate-demos.txt` §2). Repro: `bash
   .ufo/waves/round-63/build/K63ExecDeadSeatAudit/gate-demos.sh`.
4. **medium — a seat with no transcript is never counted dead.** `scripts/inline-dispatch-evidence.mjs:221`
   pushes `{name, session: null}` with no `dead` flag, so `dead=` under-counts and `DEAD_UNNAMED` never fires for it.
   Measured: the committed `one-session-missing` control reads `DRIFT (… dead=0)` + `SESSION_ABSENT:K63BetaTwo`; a
   reconstructed r60 record (32 seats, 27 dead in the lane's own progress file) reads `DRIFT (seats=32 sessions=0
   done=0 reports=0 dead=0)` + `SESSION_ABSENT` ×29 + `NOT_A_DISPATCH`, no `DEAD_UNNAMED`. Repro: demos §6, §7.
5. **medium — "named" is a substring test, not "named with its error text".** A report containing only the roster
   line `Wave w1 dispatched seats: K63AlphaOne, K63BetaTwo, K63GammaThree.` reads `INLINE_DISPATCH: CLEAN (seats=3
   sessions=3 done=2 reports=3 dead=1)` EXIT=0 for a seat with a stripped `yield`. QUALITY **Q54** (`corpus/QUALITY.md:924`,
   "named … with its last error text") demands the death text; the gate checks one `String.includes`. Repro: demos §4
   (silent → DRIFT `DEAD_UNNAMED:K63BetaTwo` EXIT=1) vs §5 (roster-only → CLEAN EXIT=0).
6. **medium — the death predicate requires a `yield` tool call the historical runtime never made.** `grep -c
   '"name":"yield"'` over the seat transcripts: 0 of 72 for r61, 0 of 96 for r62, while every transcript carries
   `session_exit kind=normal`. The gate would read all 72 and all 96 dead (a 100 % false-dead class) and demand every
   seat be named. Repro: `grep -c '"name":"yield"' ~/.omp/agent/sessions/*/*/L1Kumitate62/L1Kumitate62.*.jsonl`.
7. **medium — round 62's committed dispatch record is a reconstruction, not the dispatched text.** The committed
   `w2-dispatch.json` is flat `{context,tasks}` → `FAIL-CLOSED dispatch-taskcall-absent`; wrapped into `taskCall` and
   run against the 40 real transcripts it reads `DRIFT (seats=40 sessions=0 … dead=0)` with `SESSION_FOREIGN` ×40,
   because the actual prompts carry neither the committed `context` nor a `# Seat <name>` marker. Repro: demos §8, §9,
   §10 (`has-seat-marker: false`).
8. **low — stem-only transcript matching collides across rounds.** `candidates()` keys on the file stem alone, so the
   r60 reconstruction reads `SESSION_FOREIGN:ExecCensus`, `SESSION_FOREIGN:CritTheme`,
   `SESSION_FOREIGN:ConnectorSiblings` from unrelated rounds' transcripts of the same name. Repro: demos §7.
9. **low — the two other progress-file shapes cannot witness death either.** r61's is synthesized (all 72 rows
   `session=L1Kumitate61.<Seat>`, `pid=-`, `start=-`, `end=-`, `exit=0`; the one real death is visible only in
   `close/w2-results.json`), and r58's has no `session=` field at all, so the stated "session=null" criterion would
   flag 32 live seats dead. Repro: `head -3 .ufo/waves/round-{58,61}/w1/launcher-progress.tsv`.

10. **low — Q54's own dead-seat command is column-order-dependent.** `corpus/QUALITY.md:926` prints
    `awk -F'\t' '$4 != "exit=0" {print $1}' launcher-progress.tsv`: right for r60 (27 names), but r61's file is
    `Seat session=… exit=… pid=- …` and r58's is `Seat exit=… pid=… start=… end=…`, so the same command prints
    32/32 names — a 100 % false-dead list on both. Repro: `awk -F'\t' '$4 != "exit=0" {print $1}'
    .ufo/waves/round-61/w1/launcher-progress.tsv | wc -l`.

Proposed gate fix (not applied — L1 integrates): `.ufo/waves/round-63/build/K63ExecDeadSeatAudit/proposed-gate-patch.md`
(3 hunks: no-transcript seats dead inside a real dispatch; `DEAD_UNNAMED_TEXT` when the name carries no death text;
round-scoped transcript candidates).

## Artifacts

All under `.ufo/waves/round-63/build/K63ExecDeadSeatAudit/`: `audit.mjs` (rerunnable, read-only), `audit.tsv`
(68 dead-seat rows: r50 2, r52 2, r58 29, r59 1, r60 27, r61 1, r62 6; 9 columns), `unnamed-by-round.tsv`,
`unrecorded-spawns.tsv` (25 r62 spawns with no lane record), `gate-demos.sh` / `gate-demos.txt` (10 gate runs,
verbatim), `proposed-gate-patch.md` (3 hunks). Fixtures: `/tmp/kumitate-r63/K63ExecDeadSeatAudit/`.

## Limits

- Rounds 50/51/52/57/58 have no per-seat exit or session record (registries carry `kind/agentId/role` only), so their
  death count rests on the report-file criterion alone; r51's own prose ("dead seat: ScribeEntry", "27/32 reports at
  close") disagrees with the file record (64/64 present) and I did not adjudicate which is right.
- Rounds 53–56 are prepared-but-undispatched specs; their 64-member registries are not seats and are excluded, not
  counted as dead.
- The omp session store retains no round-59/60 seat transcripts (launcher/kimi seats), so r59/r60 death is taken from
  `launcher-progress.tsv` + `.err` + stream files only; I did not attempt to read kimi's own store.
- Round 63 w1 is in flight: its gate verdict, its own dead seats and its report naming cannot be measured yet.
- I did not run any build/lint/test gate, did not edit the lane's scripts, SCORECARD, corpus or reports, and installed
  no tools.

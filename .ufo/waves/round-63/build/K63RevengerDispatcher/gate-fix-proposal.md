# Proposed fixes for `scripts/inline-dispatch-evidence.mjs` (kumitate-inline-dispatch-evidence-v1)

Not applied: the L1 owns `scripts/`. Each item names the current line, the change, and the control it
should turn from CLEAN/DRIFT into a named rejection.

## F1 — bind the audited repo to the wave (kills `repro.sh`)
Current: `inspect()` line 188 `const lane = String(ready.lane || '')` — the lane is taken from the ready
file the repo itself writes, and is never compared to `--root`. A repository can therefore declare
`lane: "kengaku", round: 35, wave: "build"` and be certified against kengaku's real log lines and real
transcripts (repro.sh: `INLINE_DISPATCH: CLEAN`, exit 0, no seat ever spawned).

Change, after line 188:
```js
const laneFromRoot = basename(resolve(root)).replace(/-shokunin$/, '');
if (lane !== laneFromRoot) findings.push(`LANE_MISMATCH:ready=${lane} root=${laneFromRoot}`);
```
and use `laneFromRoot` for the two log regexes (lines 193, 197).
New finding id `LANE_MISMATCH`; expected control: `expect` = `1 LANE_MISMATCH`.

## F2 — bind the transcript to this wave's time window (kills cross-round borrowing inside a lane)
Current: a matched transcript is accepted on lane-authored bytes alone (`# Seat` + context head + task tail).
Nothing checks that the transcript was created for this dispatch, so a wave can reuse another round's
completed seats of the same lane by copying their `name`/`task`/`context` into its own dispatch.

Change: parse the leading timestamp of the first log line that names this wave's ready path
(`cap-defer|wave-error|spawned|adopted …/<round-N>/<wave>.ready`) and of the `done` line, then require
`session.timestamp ∈ [first − 1800 s, done + 600 s]`; else `SESSION_FOREIGN` (or a new `SESSION_OUT_OF_WINDOW`).
Anchor on the **first mention**, not `spawned`: `spawned` is logged after the loop and is therefore later
than every session it created. Grounded: tameshi w1 first mention 19:42:28Z, done 20:22:28Z, seats
19:44:00–19:48:39Z (inside); kengaku r35 build 19:41:46Z→20:13:58Z, seats 19:41:18–19:41:47Z (inside).

## F3 — stop collapsing "nested" and "absent" into NOT_A_DISPATCH
Current: `indexSessions()` (lines 96-112) keys by the whole stem, so a subagent-spawned seat stored as
`<session>/<L1>/<L1>.<Seat>.jsonl` never matches `candidates(index, name)` (lines 114-120). Every
L1-spawned wave therefore reads `sessions=0` + `SESSION_ABSENT` + `NOT_A_DISPATCH`, exactly like a
do-nothing forgery. Observed: kengaku r33 build `DRIFT (seats=36 sessions=0 …)` exit 1.

Change: in `candidates()`, also accept stems whose **last dot segment** equals the name (or
`name-\d+`), and report `SESSION_NESTED:<name>` (distinct id, still a finding) when the only candidates are
nested. A forged wave (no transcripts) then reads `SESSION_ABSENT`, an out-of-contract dispatch reads
`SESSION_NESTED`, and the two are no longer the same verdict.

## F4 — the exit test is vacuous; use it for the yield→dispose race instead
Current: line 231 `const clean = tr.yielded && tr.exitKind === 'normal'`. All 1 445 `session_exit` rows in the
store are `kind:"normal"` — including the cancelled L1 `TsukuroiR37` — so `exitKind` can never fail. The
binding test is `tr.yielded`. Meanwhile a seat that yielded 2 s ago has no exit row yet and is counted
**dead**: 17 of 40 K63 w1 seats are in that state right now (`K63ExecProxyStanza`, `K63ReviewGateCode`, …),
and `--report` would then demand they be named (`DEAD_UNNAMED`).

Change:
```js
const clean = tr.yielded;
if (tr.yielded && tr.exitKind === null) findings.push(`EXIT_PENDING:${t.name}`);
```
or accept `<Label>.md` presence as the completion signal (harness writes it at yield time, before dispose:
17/17 of those seats have it). Keep `dead = !tr.yielded`.

## F5 — pick the duplicate deterministically
Current: line 225 `const { tr } = matched[0]` — `matched` follows `readdir` order, which is arbitrary. With
`-2`/`-3`/`-4` generations of the same seat (tameshi `MutC1Counter`), the credited session (and its
`session.id`, model, dead flag) is whichever file the filesystem returns first.
Change: sort candidates by suffix (`0` for the bare stem) and use the **highest** suffix, or require all
matched duplicates to agree on `yielded` and report `SESSION_DISAGREE:<name>` when they do not.

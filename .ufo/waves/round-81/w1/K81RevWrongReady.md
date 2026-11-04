# K81RevWrongReady — what the orchestrator actually does with a `.ready`

Seat: `revenger`, kumitate round 81, wave `w1`, 2026-11-04.
Scope: the dispatcher side of the run-7 handoff, and the `ready-handoff` gate
(`scripts/ready-handoff.mjs`, contract `kumitate-ready-handoff-v1`) judged against it.
Base tip read: `77c7a8b3fe7f3cebe681065da283de0ae38ddb5b`; gate provenance: `d140f288`
(2026-11-04, "ready-handoff admission gate (new capability, 31-case suite)");
dispatcher provenance: `d96c9c99` (2026-11-03, run-15 concurrency ruling).

**Verdict.** The orchestrator has no admission gate. It takes a `.ready` iff the file
parses, `l1` names a live job, the `dispatch` file parses into `taskCall.tasks[]` with
`name`/`agent`/`task` on every seat, and a host slot is free — nothing else in either
file is read. Of the gate's 27 tokens, 11 answer a real dispatcher failure mode
(silent retry, wedge, orphan, or tick crash), 15 enforce a rule the dispatcher never
reads (policy shape, prose, and results-path containment), and one (`WAVE_MISMATCH`)
protects only the results/notify contract. Conversely, the facts that decide whether
and how a wave runs — L1 liveness, the `.dispatched` marker, the 60-job seat ceiling,
and the re-read-until-full race — are all invisible to the gate.
The live round is itself the proof: 2 of 14 seats were spawned at 06:49:12 from a
`w1.ready` inode that no longer exists, while the surviving file was created at
06:49:16.944 and the wave only became fully dispatched at 06:53:17.

---

## 1. The acceptance boundary

### 1.1 Two halves, one marker

Dispatcher paths in this report are **fleet-root** paths
(`/home/vgpnk/Projects/shokunin/...`); gate paths are **lane** paths
(`kumitate-shokunin/...`). There is no dispatcher CLI: the consumer is the
orchestrator session itself, and it loads:

- `scripts/hyaku/inline-dispatcher.py` — loaded into the orchestrator kernel
  (`%load`), no `__main__` (header `inline-dispatcher.py:1-12`). `tick()` runs once
  per orchestrator wake-up; `drive()` is the optional loop with `every=30` seconds and
  `max_s=1500` (`:345`).
- `scripts/hyaku/ready-watch.sh` — an async bash job that wakes the orchestrator: it
  scans every `<lane>/.ufo/waves/round-*/*.ready` every **15 s** by default
  (`ready-watch.sh:22`, loop `:24-33`, `sleep` `:33`) and exits on the first ready
  with no `.dispatched` sibling (`:26-31`). It skips a ready whose `.partial` changed
  in the last 300 s (`:11-17`, `:21`, `:28-30`).
- `scripts/shokunin-watchdog.sh` does **not** read ready files; it launches/completes
  lane attempts (its log rows are `launch`/`complete`/`lane-dead-no-report`, see §2.1).
- `fleet-dispatcher.mjs` does not exist at either path the seat named
  (`ls fleet-dispatcher.mjs scripts/fleet-dispatcher.mjs` → ENOENT).

Exactly one code path in the fleet opens a `.ready`, writes `.dispatched` and writes
`*-results.json`: `inline-dispatcher.py`. `grep -rn "ready.dispatched\|results.json"
scripts/ --include=*.py --include=*.sh --include=*.mjs` returns only that file (plus
the comment block of the watcher).

### 1.2 The only pre-spawn conditions

In evaluation order (`tick()` `:307-322`, `register()` `:231-286`):

1. **Glob**: `{FLEET}/*-shokunin/.ufo/waves/round-*/*.ready`, sorted (`:310`). All
   lanes, all rounds — no round-recency filter.
2. **Marker**: skip if `ready + '.dispatched'` exists, or the ready is already tracked
   in `WAVES` (`:311`).
3. **L1 liveness**: `json.load(open(ready)).get('l1','')` must name a running job
   (`:313`). `live()` accepts the exact name, a runtime-dedup suffix `<name>-N`
   (`<name>-N-M`, …) or an attempt respawn `<name>aK…` (`:194-196`). Failure is not an
   error: the ready is printed as `ORPHAN ready (L1 not running, not spawned)` in the
   tick status (`:334-335`) and retried next tick.
4. **Disk gate**: `disk-guard.sh check`; rc 1 defers the whole wave and sweeps
   (`:239-245`). Missing/broken guard = allow (`_disk`/`disk_ok` `:143-171`).
5. **Host gate**: `host_ok()` = 1-min load ≤ `4.5 × cpu_count` and MemAvailable ≥ 4 GiB
   (`:110-113`, `:130-141`). Pressure defers the wave (`:246-247`).
6. **Seat room**: `room = SEAT_CEILING - occupied` (`:252`); `occupied` is the
   fleet-wide count of *running* jobs from `proc://` (`:183-192`). Only `room` seats
   are spawned this tick; `occupied += n` is tracked across waves in the same tick
   (`:319`).
7. **Dispatch parse**: `json.load(open(meta['dispatch']))` (`:249`); `d['taskCall']`
   and `tc['tasks']` (`:250`); every seat read as `t['name']`, `t['agent']`, `t['task']`
   (`:251`, `:256-257`).
8. **Role accepted**: `agent(prompt, agent=t['agent'], label=t['name'])` (`:257`).
   `RuntimeError` is treated as the host cap: `spawn-cap` is logged and the fill stops
   (`:258-259`); any other exception escapes to `wave-error` (`:320-322`).

In one line:

```
taken  ⇔  glob *.ready ∧ ¬exists(<ready>.dispatched) ∧ json(ready).l1 is live
          ∧ json(ready.dispatch).taskCall.tasks[*] has {name,agent,task}
          ∧ disk_ok ∧ host_ok ∧ (SEAT_CEILING - running_jobs) > 0
```

There is no other check. `lane`, `round`, `wave` are **not** validated against the
directory, the CLI, the dispatch, or each other.

### 1.3 Fields read, fields ignored

From `<wave>.ready` (live file: `{"lane":"kumitate","round":81,"wave":"w1",
"dispatch":"/…/round-81/w1-dispatch.json","l1":"KumitateR81"}`):

| field | read at | used for | decides spawn? |
|---|---|---|---|
| `l1` | `:313`, `:298`, `:381-385` | liveness gate, `WAVE-DONE` recipient | **yes** |
| `dispatch` | `:249`, `:220`, `:379`, `:290`, `:376` | file to parse; results directory | **yes** (must parse) |
| `lane` | `:276`, `:296`, `:299`, `:305` | logs, results payload, message text | no |
| `round` | `:276`, `:296`, `:299` | logs, results payload, message text | no |
| `wave` | `:276`, `:290`, `:296-299` | `wave-results.json` name, message text | no |

Every other ready key is ignored. The live file has exactly the five keys; the gate's
`READY_KEYS` (`:38`, `:136`) therefore passes, but a sixth key (e.g. `created_at`)
would be ignored by the dispatcher and refused by the gate.

From `<wave>-dispatch.json` (live file has 9 top-level keys: `compaction`, `counts`,
`note`, `policy`, `registry`, `resumeSends`, `schema`, `taskCall`, `wave`):

| field | read at | note |
|---|---|---|
| `taskCall.context` | `:256` via `tc.get('context','')` | absent → empty prefix, no error |
| `taskCall.tasks` | `:250-251` | must be iterable of mappings |
| `tasks[i].name` | `:251`, `:256-257` | also the agent label |
| `tasks[i].agent` | `:257` | passed to `agent()` |
| `tasks[i].task` | `:256` | concatenated verbatim |

Ignored by the dispatcher: the dispatch's own `wave`, `schema`, `policy`, `counts`,
`registry`, `note`, `compaction`, `resumeSends`, and any per-seat key other than the
three above — **including `model` and `tools`**. The prompt is exactly
`context + "\n\n# Seat <name>\n" + task + SEAT_GUARD` (`:256`, guard `:100-106`);
`agent()` receives only `prompt`, `agent`, `label` (`:257`). A handoff that carries
per-seat `model` or `tools` is silently downgraded by the dispatcher — the keys never
reach the seat host.

### 1.4 Malformed input: one log line, silent retry, no message

`tick()` wraps the ready read and `register()` in `try/except Exception` and logs
`wave-error <ready> <repr(e)>` (`:320-322`). There is no notification to the L1 and no
failure state: the wave is simply retried on every subsequent tick.

Observed in `.ufo/state/inline-dispatcher.log`:

```
105249:2026-10-28T09:57:37 wave-error …/kasegi-shokunin/.ufo/waves/round-42/w2.ready KeyError('taskCall')
105250:2026-10-28T09:57:57 wave-error …/kasegi-shokunin/.ufo/waves/round-42/w2.ready KeyError('taskCall')
105251:2026-10-28T09:57:57 wave-error …/kasegi-shokunin/.ufo/waves/round-42/w2.ready KeyError('taskCall')
112677:2026-11-04T03:14:01 wave-error …/mado-shokunin/.ufo/waves/round-75/w1.ready FileNotFoundError(2, 'No such file or directory')
```

Consequences by input:

- ready not JSON / an array → `ValueError`/`AttributeError` → `wave-error` loop, never
  spawned, never finalized, L1 never told.
- ready JSON without `l1` (or `l1: ""`) → `live('', run)` false → `ORPHAN`, never
  spawned, no `wave-error` line (only the tick's `ORPHAN` status line, `:313`,
  `:334-335`).
- dispatch absent at read time → `FileNotFoundError` (mado r75 above); taken only
  after the file appears.
- dispatch without `taskCall`, or a non-iterable `tasks` → `KeyError`/`TypeError` loop.
- `tasks: []` → **accepted**: `len(mine)==len(tasks)==0` writes `.dispatched`
  immediately and the same tick's `WAVES` pass finalizes a 0-seat wave
  (`:262-267`, `:325-329`).
- a task missing `name`/`agent`/`task`, or a non-mapping task → `KeyError`/`TypeError`
  loop; seats already spawned in that tick stay in `.partial` and are not respawned.

### 1.5 Re-read semantics: before the marker, every tick; after it, only on kernel loss

- **Before `.dispatched`**: `register()` re-reads both the ready and the dispatch on
  **every tick** (`:249`). The fill state is `{name: job-id}` in `<ready>.partial`
  (`:238`, `:259-264`); names already in `mine` are not respawned (`:251`).
- **`.dispatched` is written only when every task name has a handle** (`:262-267`), so
  the marker means "fully spawned", not "read once". Between the first read and the
  marker the wave is half-taken and the only trace is `.partial` — which the gate never
  inspects.
- **After `.dispatched`**: `tick()` skips the ready entirely (`:311`). No re-read, no
  re-spawn; a rewritten ready is inert.
- **After a kernel restart**: `bootstrap()` re-reads a dispatched ready + its dispatch
  (`:372-383`) when no `<wave>-results.json` exists (`:376-377`) and any seat or the L1
  is still live (`:381`), then `adopt()`s it (`:218-227`). At that point a rewritten
  ready *does* change the adopted `meta` (lane/round/wave/l1/dispatch) and therefore the
  results path.
- `.partial` is restored by `bootstrap()` only if it parses (`:362-371`); an
  unparseable `.partial` is silently skipped (`except (OSError, ValueError): continue`)
  and falsy job ids are dropped (`if i`), so those seats are spawned **again** on the
  next tick — duplicate seats with no marker saying so.

### 1.6 Fill across ticks is normal, not exceptional

The run-15 kernel runs with `SEAT_CEILING=60` (`hyaku.env:111`, "kernel SEAT_CEILING
36 -> 60"; policy note "seats stop spawning at 60",
`ufo-wave-policy.json:.sighting.dispatch.swarm.note`). The live r81 fill proves the
value arithmetically: every `cap-defer` line prints `occupied` *after* `occupied += n`
(`:319`), so `occupied 60` with `n=2` implies pre-tick 58 and `room = SEAT_CEILING-58
= 2` ⇒ `SEAT_CEILING = 60`. No `spawn-cap` line appears in that window, so the 2-seat
increments are the ceiling, not an exception.

A 17-seat wave is not refused; it fills. A 7-seat wave spawns immediately. Nothing in
the dispatcher knows the 8–16 band exists.

### 1.7 After spawn: prompt, results, notification

- Seat prompt: `taskCall.context` + `# Seat <name>` + task + `SEAT_GUARD`
  (`:256`, `:100-106`). `SEAT_GUARD` tells every seat its cwd is the **fleet root**,
  which is why the gate's lane-root/relative-path rules matter seat-side (below).
- Liveness after spawn is by handle id when known, else by name (`seat_live`
  `:198-201`).
- Results: `dirname(ready.dispatch)/<ready.wave>-results.json` (`:290`), payload
  `{lane, round, wave, seats, results:[{name, agent, output}]}` (`:296-297`); seat
  output is truncated to 20 000 chars (`:280-286`); a seat whose handle was lost
  (`_Spawned`) gets `output: null` + a note (`:291-295`).
- Notification: `WAVE-DONE <lane> r<round> <wave> … results=<path>` to
  `agent://<ready.l1>` (`:297-300`); a failed notify is logged only (`:302-304`), the
  results file is still written.

---

## 2. Observed timing, rounds 79–81

### 2.1 `watchdog.log` carries no ready/dispatch events

`.ufo/watchdog.log` (220 765 B, 2 308 lines) records lane lifecycle only. Event
counts (`awk '{print $2}' .ufo/watchdog.log | sort | uniq -c`): `launch` 1128,
`complete` 808, `lane-dead-no-report` 221, `lane-round-failed` 35, `wrap` 22,
`steer` 15, `launch-fail` 7, plus `tick=N`/`watchdog` rows. `grep -c '\.ready'` = **0**.
The 12 lines containing "dispatched" are prose inside old `lane-dead-no-report`
messages (`.ufo/watchdog.log:566`, `:1017-1025`, `:1580`, `:1622`), not events.

The kumitate rows for the three rounds are exactly:

```
2280:2026-11-04T04:33:24-03:00 launch kumitate round=79 pgid=3317374 driver=hyaku-inline attempt=1
2291:2026-11-04T05:23:58-03:00 complete kumitate round=79; hyaku-inline attempt=1
2293:2026-11-04T05:35:39-03:00 launch kumitate round=80 pgid=3488582 driver=hyaku-inline attempt=1
2304:2026-11-04T06:25:44-03:00 complete kumitate round=80; hyaku-inline attempt=1
2307:2026-11-04T06:40:45-03:00 launch kumitate round=81 pgid=725520 driver=hyaku-inline attempt=1
```

(There is no `complete` for r81 yet — this report is written inside the round.)

**Ready→dispatch timing therefore cannot come from `watchdog.log`.** It is measured
from the `.ready`/`.ready.dispatched` inode times (`stat -c '%w %y'`, btrfs, so btime is
real) cross-checked with `.ufo/state/inline-dispatcher.log`:

| round | ready (btime) | dispatched (btime) | Δ |
|---|---|---|---|
| 79 | 04:45:49.5067 | 04:46:17.9718 | **28.5 s** |
| 80 | 05:48:58.7482 | 05:49:44.9314 | **46.2 s** |
| 81 | 06:49:16.9446 | 06:53:17.1939 | **240.2 s** |

r79 and r80 are one- or two-tick handoffs (the `spawned kumitate 79 w1 13` line is at
04:46:17, `spawned kumitate 80 w1 13` at 05:49:44). r81 is a nine-tick fill.

### 2.2 r81, tick by tick (the ceiling at work)

```
06:49:12 partial kumitate 81 w1 2 14   cap-defer … occupied 60
06:49:42 partial kumitate 81 w1 4 14   cap-defer … occupied 60
06:50:13 partial kumitate 81 w1 5 14   cap-defer … occupied 60
06:50:44 partial kumitate 81 w1 5 14   cap-defer … occupied 60
06:51:14 partial kumitate 81 w1 7 14   cap-defer … occupied 60
06:51:44 partial kumitate 81 w1 9 14   cap-defer … occupied 60
06:52:15 partial kumitate 81 w1 11 14  cap-defer … occupied 60
06:52:47 partial kumitate 81 w1 12 14  cap-defer … occupied 60
06:53:17 spawned kumitate 81 w1 14
```

(`.ufo/state/inline-dispatcher.log:112794-112810`.) Spacing 30–31 s, matching
`drive(every=30)`/successive wake-ups. 14 seats over 240 s, at most 2 per tick while
the pre-tick running count was 58.

**The r81 rewrite (observed, not inferred).**

- First dispatcher read: `06:49:12` (`partial … 2 14`).
- `w1.ready` surviving inode: **birth 06:49:16.944613**, i.e. **4.9 s after** the first
  read — this is a *different file* from the one read at 06:49:12 (temp+rename on
  btrfs gives the replacement a new inode/btime).
- `w1-dispatch.json`: birth 06:48:54.555, **mtime 06:49:16.934613** — rewritten 0.010 s
  before the ready replacement, also after the first read.

So the wave was half-taken from one version of both files and finished from another.
Whether the bytes differed is not provable from the surviving inode, but the dispatcher
re-reads both files every tick (`:249`), so any byte change would have been adopted for
the seats spawned after 06:49:16.9 — seats 3–14. The gate has no notion of a
half-taken wave and cannot see this (§3.3).

### 2.3 A live `DISPATCH_ABSENT` race (mado r75)

```
w1.ready            btime 2026-11-04 03:13:56.3799
w1-dispatch.json    btime 2026-11-04 03:14:14.7609
tick                03:14:01 wave-error …/mado-shokunin/.ufo/waves/round-75/w1.ready FileNotFoundError(2,…)
w1.ready.dispatched btime 2026-11-04 03:14:51.6524   (55.3 s after the ready)
```

The L1 wrote the ready **18.4 s before** the dispatch file existed; one tick was lost
to a silent `wave-error`, and the wave still took 55.3 s. This is exactly the state
`DISPATCH_ABSENT` refuses fail-closed with a printed token (gate `:116-117`, exit 2) —
the one place the gate converts a silent retry into a statement.

### 2.4 Fleet distribution, 2026-11-04 (54 dispatched waves)

`ready.mtime → ready.dispatched.mtime` over every dispatched `*.ready` whose marker was
written on 2026-11-04 (mtime-based, so each Δ is a lower bound on the true
write→dispatch latency): min **15.3 s**, p25 24.3 s, **median 34.8 s**, p75 46.2 s,
max **240.2 s**; 22 ≤ 30 s,
25 in (30, 60), 7 ≥ 60 s. The 15 s floor is the watcher interval (`ready-watch.sh:22`).
Three of the seven ≥60 s waves logged `cap-defer`: kaidoku r76 (×7), kumitate r81
(×8) and kama r77 (×1); the two largest (215.5 s, 240.2 s) are that ceiling fill, not a
watcher stall.

---

## 3. Mismatch table

Legend — **LB**: load-bearing: without the refusal the dispatcher wedges, silently
retries forever, never spawns, or crashes; **OS**: over-strict: the dispatcher would
take the handoff and run it exactly as intended; **RC**: results/notify contract only
(spawn unaffected).

### 3.1 Fail-closed refusals (exit 2, gate `:413-438`)

| gate token (line) | bucket | dispatcher fact (line) | what the refusal buys / costs |
|---|---|---|---|
| `READY_ABSENT` `:104` | LB | nothing to glob (`:310`); no spawn, no log | turns "no handoff" into a statement; instrument prerequisite |
| `READY_MALFORMED` `:106-107` | LB | `json.load` raises at `:313`; `wave-error` each tick, no L1 message (`:320-322`); observed kasegi r42 w2 | the only early signal for a permanent silent retry |
| `DISPATCH_PATH` `:109` | LB | relative `dispatch` resolves against the **orchestrator cwd = FLEET root**, not the lane → `FileNotFoundError` loop | prevents the mado-r75 class permanently |
| `DISPATCH_OUTSIDE` `:113` | OS | dispatcher opens any absolute path (`:249`) and writes results beside it (`:290`) | spawn would work; only the lane's "results in the wave dir" convention breaks |
| `DISPATCH_ABSENT` `:116-117` | LB | observed mado r75: one silent lost tick, 55.3 s to take | converts a silent retry into a printed refusal |
| `PATH_UNSAFE` `:120,:124` | OS | dispatcher follows the symlink; realpath is never checked | same cost/benefit as `DISPATCH_OUTSIDE` |
| `DISPATCH_MALFORMED` `:129` | LB | missing `taskCall` → `KeyError` loop (observed); `tasks: []` → immediate 0-seat `WAVE-DONE`; non-mapping seats are then caught by `SEAT_SHAPE` | blocks the KeyError loop and the hollow wave |

### 3.2 Policy findings (DRIFT, exit 1)

| gate token (line) | bucket | dispatcher fact (line) | what the refusal buys / costs |
|---|---|---|---|
| `READY_KEYS` missing required `:136` | LB for `lane/round/wave` | `meta['lane'/'round'/'wave']` is read in `dlog('spawned')` `:276` and `finalize` `:290-299`; a missing key raises **after** seats are spawned and later kills `tick()` in `finalize` (no try there) | prevents a wave that spawns and then breaks the tick loop |
| `READY_KEYS` extra key `:136` | OS | every non-{lane,round,wave,dispatch,l1} key is ignored | refuses annotations (`created_at`, `note`) the dispatcher never reads |
| `LANE_MISMATCH` `:139` | OS | `lane` only appears in logs/results/message (`:276`, `:296-299`); spawn ignores it | cosmetic |
| `ROUND_MISMATCH` `:140` | OS | same as lane (`:276`, `:296-299`) | cosmetic |
| `WAVE_MISMATCH` `:141` | RC | results filename uses `ready.wave` (`:290`); `WAVE-DONE` text uses it (`:298`); spawn ignores it | protects the L1's results-path expectation, not dispatch |
| `L1_ABSENT` `:142` | LB | `live('', run)` false → `ORPHAN`, never spawned, no error (`:313`, `:334-335`) | the gate's only defence against a handoff nobody will take; it still cannot check *liveness* |
| `BAND` `:146` | OS | no band in the dispatcher; 7 seats spawn, 17 seats fill | run-15 policy, CLI-overridable (`--band`, `:47`) |
| `CONTEXT_LANE_ROOT` `:147` | OS | context is concatenated verbatim (`:256`); never parsed | prompt hygiene; seat-side matters because `SEAT_GUARD` sets cwd = FLEET (`:100-106`) |
| `SCRATCH_ROOT` `:148` | OS | same | prompt hygiene |
| `SEAT_SHAPE` `:157,:170` | LB | non-mapping task / missing `task` → `KeyError`/`TypeError` loop; seats already spawned stay in `.partial` | prevents a half-spawned, never-finalized wave |
| `ARTIFACT_KEYS` `:159` | OS | `model`, `tools`, any extra key are never read; `agent()` gets only prompt/agent/label (`:257`) | enforces "no per-seat model" policy, but also masks that the dispatcher would silently drop `tools`/`model` |
| `SEAT_NAME` missing/empty `:160` | LB | `t['name']` is a `KeyError` in `todo` (`:251`); empty name joins `mine` and wedges the fill | prevents a permanent partial |
| `SEAT_NAME` CamelCase ≤32 `:161` | OS | the name is only a label/`HANDLES` key (`:257`, `:260`); no grammar is enforced | policy; host label limits untested here |
| `SEAT_DUPLICATE` `:162` | LB (strongest) | `mine` is keyed by name (`:238`, `:251`, `:260`); with `[A,A]`, both are spawned, `len(mine)=1 < len(tasks)=2` forever → `.partial` forever, no `.dispatched`, no `WAVE-DONE` | prevents a permanent wedge with two live seats under one label |
| `ROLE_UNKNOWN` `:164,:166` | LB | missing `agent` → `KeyError` escapes (try catches only `RuntimeError`, `:257-259`); unknown role → `RuntimeError` → `spawn-cap` loop; either way the wave never completes | prevents a permanent fill stall |
| `PLANNER_SEAT` `:165` | OS | role is passed through (`:257`); if `planner` is a live host role it spawns | frozen-topology policy |
| `GODSPEED` `:172` | OS | task text is concatenated, never parsed (`:256`) | prose policy |
| `TASK_LANE_ROOT` `:173` | OS | same; but seat-side real: `SEAT_GUARD` sets cwd = FLEET (`:100-106`) | prevents seat misroot, not dispatch failure |
| `RELATIVE_WAVE_PATH` `:174-176` | OS | same | prevents seat misroot |
| `REPORT_TRAILER` `:183` | OS | same | prevents seat misroot |
| `ATTACK_SHARE` `:186` | OS | roles are counted by nobody in the dispatcher; the kind of "attack" is not visible to it | policy (`--attack-pct` default 25, `:47`) |
| `CONNECTOR_COUNT` `:187` | OS | same | policy |

Token accounting: 7 fail-closed + 20 findings = **27 distinct tokens**. The table
splits two of them by case (`READY_KEYS` missing vs extra, `SEAT_NAME` missing vs
grammar), so it has 29 rows. Distinct-token bucket (the LB half dominates the split):
**11 LB, 15 OS, 1 RC**.

### 3.3 Dispatcher behaviour the gate cannot see

1. **L1 liveness is the real gate.** A structurally perfect ready written after the L1
   ended, or with a mistyped `l1`, is an `ORPHAN` and never spawns (`:313`,
   `:334-335`). The gate only checks a non-empty string (`:142`) and has no access to
   `proc://`.
2. **`.dispatched` makes the file inert.** `tick()` skips it (`:311`). The gate returns
   READY on an already-taken handoff — demonstrated on this round: `node
   scripts/ready-handoff.mjs --round 81 --wave w1` prints `READY_HANDOFF: READY
   wave=w1 seats=14 attack=4/14 connector=1 roles=…`, exit 0, while
   `w1.ready.dispatched` has existed since 06:53:17. Only `bootstrap()` re-reads a
   dispatched ready (after kernel loss, `:372-383`).
3. **A half-taken wave is invisible.** `.partial` (`:238`, `:259-264`) is the only
   trace between first read and full spawn; the gate never looks at it. The r81 evidence
   (§2.2): first spawn 06:49:12, surviving ready inode 06:49:16.944, dispatch mtime
   `06:49:16.934` — seats 1–2 were spawned from a file version that no longer exists
   on disk (byte equality with the surviving version is not provable from here).
4. **No binding between the checked bytes and the dispatched bytes.** The gate reads the
   files once and emits a 32-bit FNV `dispatchSha` (`ready-handoff.mjs:72-77`, `:197`);
   no consumer compares it and the dispatcher re-reads until `.dispatched`. The gate is
   a pre-write validator at best; if the L1 writes the ready first and validates after
   (`--ready` defaults to the live path, `:99`), the dispatcher may already have taken
   it. Nothing in the protocol requires validation before the write.
5. **Seat ceiling + host gates decide *when*, not *whether*.** `SEAT_CEILING=60`
   (`hyaku.env:111`), `LOAD_MAX=4.5×cores`, `MEM_MIN_GB=4` (`:110-113`), disk guard
   (`:239-245`). The gate verdict is invariant to all of them; observed latency spans
   15.3–240.2 s (§2.4).
6. **All fill failures are silent.** Every per-seat error path ends in a log line and a
   retained `.partial` (`:258-264`, `:320-322`); `WAVE-DONE` never fires, so the L1
   waits forever. The gate's `DRIFT` verdict is the only surface that names the cause
   before the wait starts.
7. **`.partial` loss duplicates seats.** On kernel restart an unparseable `.partial` is
   skipped (`:362-371`) and falsy ids are dropped (`if i`), so `bootstrap()` reseeds
   nothing and the next tick respawns every name — no marker records that they already
   ran.
8. **`model`/`tools` never reach the seat.** `agent()` is called with
   `prompt`/`agent`/`label` only (`:257`). The gate refuses those keys (`:159`), which
   hides the fact that a bypassed gate would silently drop them rather than fail.
9. **Prompt assembly appends the host guard.** `SEAT_GUARD` (`:100-106`) is appended
   after the task text for every seat and states cwd = FLEET root. The gate cannot see
   it; it is why the lane-root and relative-path rules are seat-side real even though
   dispatcher-side irrelevant.
10. **Results/notify edges.** Results go beside the *dispatch* file, named from
    `ready.wave` (`:290`); outputs truncate at 20 000 chars; `_Spawned` seats yield
    `output: null` + a note (`:291-295`); notify failure is logged only (`:302-304`).
    None of this is visible to a gate that only reads the two input files.
11. **`--ready` can point outside the glob.** The gate's default path is exactly what
    the dispatcher globs (`ready-handoff.mjs:99` vs `inline-dispatcher.py:310`), but
    `--ready FILE` accepts any path; a verdict on a file under `/tmp` says nothing
    about any wave the orchestrator will see.

---

## 4. Cross-checks run

| command | exit | captured result |
|---|---|---|
| `node scripts/ready-handoff.mjs --round 81 --wave w1` (lane cwd) | 0 | `READY_HANDOFF: READY wave=w1 seats=14 attack=4/14 connector=1 roles=scout=2,connector=1,executor=3,mutation-tester=1,reviewer=2,critic=1,sentinel=1,scribe=2,revenger=1` — on a file already `.dispatched` since 06:53:17 |
| `node scripts/ready-handoff.mjs --selftest --work /fast/scratch/hyaku/kumitate-r81/K81RevWrongReady/selftest` | 0 | `READY_HANDOFF_SELFTEST: 31/31 pass` / `VERDICT: PASS` (plan Amendment 1.6 already records the 30/30→31/31 text drift) |
| `stat -c '%w %y'` on r79/80/81 `.ready`, `-dispatch.json`, `.ready.dispatched` | 0 | table §2.1–2.2; btrfs btime is real (`stat -f -c %T` → `btrfs`) |
| `grep -c '\.ready' .ufo/watchdog.log` | — | `0 matches` — watchdog has no ready events (§2.1) |
| fleet latency scan, 54 Nov-4 waves | — | min 15.3 / p25 24.3 / median 34.8 / p75 46.2 / max 240.2 s |

The live dispatch shape was read read-only: 9 top-level keys, `taskCall` with
`context`+`tasks`, 14 tasks with only `{agent,name,task}`, agents
`connector,critic,executor,mutation-tester,revenger,reviewer,scout,scribe,sentinel` —
i.e. the live wave never exercises `ARTIFACT_KEYS` or the band edges.

No tools were installed; no package manager was invoked. Scratch was confined to
`/fast/scratch/hyaku/kumitate-r81/K81RevWrongReady/` and is deleted.

## 5. Confidence and limits

- **Boundary (§1): high.** The dispatcher was read end-to-end (394 lines; header says
  in-session only, no CLI, so it was not executed). Every claim above is a code path,
  and the observed `wave-error`/`partial`/`spawned` lines match it.
- **Timing (§2): high** for the three rounds (btime + dispatcher log agree). The r81
  rewrite is *observed at the inode level*; whether the bytes changed is **not**
  provable from the surviving copy — stated as such.
- **Classification (§3): high** for the LB/OS split driven by exception paths;
  **medium** for two host facts I did not test: whether `planner` is a live omp role
  (if not, `PLANNER_SEAT` is additionally an anti-wedge rule), and whether the seat
  host imposes a label grammar beyond "non-empty string" (the `SEAT_NAME` regex).
- **Not in scope / not run:** the C1/C2 counters, the C2 surface, sibling seats'
  reports. The plan's frozen numbers were not re-derived here; this report only measures
  the dispatcher and the gate's fit to it.
- **Stop condition:** this report stops at the assigned surface — the `.ready`
  acceptance boundary and the gate mismatch table. It does not propose a contract
  change and does not edit the gate or the dispatcher.

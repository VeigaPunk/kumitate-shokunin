VERDICT: The dispatcher's `-N` suffix is the host harness's per-parent-session label dedupe (not a retry marker, not a dispatcher rename), seats of an inline wave are stored as `<Label>.jsonl` + `<Label>.md` directly under the orchestrator session directory with one shared `parentSession`, completion is the `yield` row (every `session_exit` in the store is `kind:"normal"`), and the C1 gate's session checks rest on lane-authored bytes — which lets a repo that never spawned a seat read `INLINE_DISPATCH: CLEAN`, exit 0 (forgery confirmed below).

## Evidence

**Dispatcher source** (`/fast/scratch/hyaku-run7/dispatcher.py`, read-only)
- `:71` `prompt = tc.get('context','') + f"\n\n# Seat {t['name']}\n" + t['task']`; `:72` `agent(prompt, agent=t['agent'], label=t['name'])`.
- `:38-39` `def live(name, run): return name in run or any(re.fullmatch(re.escape(name)+r'-\d+', x) ...)` — the dispatcher already expects suffixed labels.
- `:69-70` `if t['name'] in HANDLES or live(t['name'], run): continue  # already spawned by an earlier partial attempt (job-cap error mid-loop)`; `:73-77` `.dispatched` is written **after** the loop, then `dlog('spawned', …, len(tasks))`.
- `:16-17` `dlog` timestamps are local (`time.strftime`, `−0300`); every host transcript timestamp is UTC.

**Session store** `~/.omp/agent/sessions/-Projects-shokunin/` — two orchestrator sessions. The run-7 one
(`…16-43-09-760Z_01a173f1-…`, 1498→1538 jsonl) holds every seat plus 5 sub-dirs (`KengakuR33` 108 files,
`TabiR27` 144, `SoujiR27a2`, `local`, `url-search`); the older (`…06-15-52-413Z_…`, 116 jsonl) holds L1s,
closures and `L1<Lane>R<n>/` dirs only.
**Seat headers / parents / ids** (`build/K63RevengerDispatcher/evidence/tails.py`)
```
tameshi r45 w1: tasks=45 found=45 parents={...16-43-09-760Z_01a173f1-….jsonl: 45} duplicate ids: []
kumitate r63 w1: tasks=40 found=40 parents={...16-43-09-760Z_01a173f1-….jsonl: 40} duplicate ids: []
kengaku r35 build: tasks=32 found=32 parents={...16-43-09-760Z_01a173f1-….jsonl: 32} duplicate ids: []
```
**`-N` instance (tameshi r45, ExecRows01)** — three sessions, byte-identical prompts:
```
ExecRows01.jsonl    session ts 19:44:00.956Z  len(user)=7003
ExecRows01-2.jsonl  session ts 19:45:37.387Z  len(user)=7003   identical=True
ExecRows01-3.jsonl  session ts 19:47:47.017Z  len(user)=7003   identical=True
# Seat ExecRows01\n/skill:godspeed\nYou ar   (same 40 bytes in all three)
```
Suffix census over the 45 dispatch names (`evidence/` inline script): base 45/45; `-2` 38 (contiguous prefix
of dispatch order); `-3` 33 (gappy); `-4` 1 (`MutC1Counter-4`). One `spawned` line covers all 117 sessions:
```
261:2026-10-25T16:46:16 wave-error /…/tameshi-shokunin/.ufo/waves/round-45/w1.ready RuntimeError('Background job limit reached (100). Wait for running jobs to finish or cancel one.')
267:2026-10-25T16:48:38 spawned tameshi 45 w1 45
276:2026-10-25T16:53:13 adopted /…/tameshi-shokunin/.ufo/waves/round-45/w1.ready
287:2026-10-25T16:55:43 adopted /…/tameshi-shokunin/.ufo/waves/round-45/w1.ready
353:2026-10-25T17:22:28 done tameshi w1 /…/tameshi-shokunin/.ufo/waves/round-45/w1-results.json
```
`w1-results.json`: 45 rows, **45 notes** `"orchestrator kernel restarted mid-wave; seat output was … not retained"` (finalize ran with empty `HANDLES`).

**End-of-seat records** (whole store, S2 top level)
```
grep -oh '"customType":"session_exit","data":{"reason":"[a-z]*","kind":"[a-z]*"' *.jsonl | sort | uniq -c
   1445 "customType":"session_exit","data":{"reason":"dispose","kind":"normal"
```
Tail of a finished seat (`ExecRows01`): `message{toolCall yield}` → `custom{tool_execution_start yield}` →
`message{toolResult "Result submitted."}` → `custom{session_exit …}`. Tail of the **cancelled** L1
`TsukuroiR37` (replaced by `TsukuroiR37a2`): same `session_exit {"reason":"dispose","kind":"normal"}`.

**Gate runs on real waves** (`node scripts/inline-dispatch-evidence.mjs --root <lane> --round N --wave W`)
```
tameshi  r45 w1    exit=1  INLINE_DISPATCH: DRIFT (seats=45 sessions=45 done=45 reports=45 dead=0)  38×SESSION_AMBIGUOUS
kengaku  r35 build exit=0  INLINE_DISPATCH: CLEAN (seats=32 sessions=32 done=32 reports=32 dead=0)
mori     r47 w2    exit=0  INLINE_DISPATCH: CLEAN (seats=37 sessions=37 done=37 reports=37 dead=0)
kaidoku  r35 w1    exit=1  INLINE_DISPATCH: DRIFT (seats=64 sessions=0 done=0 reports=64 dead=0)    64×SESSION_FOREIGN, SPAWN_LOG_ABSENT, NOT_A_DISPATCH
souji    r26 w1    exit=1  INLINE_DISPATCH: DRIFT (seats=87 sessions=0 done=0 reports=87 dead=0)    87×SESSION_FOREIGN, SPAWN_LOG_ABSENT, DONE_LOG_ABSENT, NOT_A_DISPATCH
kengaku  r33 build exit=1  INLINE_DISPATCH: DRIFT (seats=36 sessions=0 done=0 reports=36 dead=0)    36×SESSION_FOREIGN (gen-B prompts), SPAWN_LOG_ABSENT, DONE_LOG_ABSENT
kumitate r63 w1    exit=2  INLINE_DISPATCH: FAIL-CLOSED results-unreadable (wave still live)
```

## Findings

**K63RevengerDispatcher-1 — HIGH — the gate accepts a wave that never spawned a seat.**
`inspect()` takes the lane from the ready file it audits (`:188 const lane = String(ready.lane || '')`) and
never compares it to `--root`; the seat↔transcript binding is then only lane-authored text (`:216`
`# Seat <name>\n` + context head + task tail). So a repo can borrow a completed wave's identities **and**
its already-present log lines. Reproduced (no host write, no log write):
```
bash .ufo/waves/round-63/build/K63RevengerDispatcher/repro.sh
INLINE_DISPATCH: CLEAN (seats=32 sessions=32 done=32 reports=32 dead=0)
exit=0
```
The fixture is 36 files: kengaku's committed `build-dispatch.json`, a `build.ready` naming `lane:"kengaku",
round:35, wave:"build"`, 32 lane-written placeholder reports and a matching results.json. Fix F1+F2 in
`build/K63RevengerDispatcher/gate-fix-proposal.md`.
**K63RevengerDispatcher-2 — HIGH — `-N` semantics: label reuse in one parent session, not a retry.**
`agent()` returns the deduped id (observed: `{'R33WaveBook': 'R33WaveBook-2', 'R33ExecVerifySelf': 'R33ExecVerifySelf-2',
'R33SentinelScope': 'R33SentinelScope-2'}`). It fires for any earlier use of the label in the same orchestrator
session — observed for a re-spawn after a job-cap abort; a different round/lane reusing the name is the same
mechanism **[INFERENCE]**, and is exactly why plan.md prefixes this round's seats `K63`.
Consequence: `SESSION_AMBIGUOUS` is the correct verdict but cannot distinguish "this wave ran 3 times" from
"these labels were used before"; and any lane that reuses seat names across rounds reads DRIFT forever (this is
why the round-63 plan prefixes `K63`). Repro: `node scripts/inline-dispatch-evidence.mjs --root …/tameshi-shokunin --round 45 --wave w1` → 38 findings, all `SESSION_AMBIGUOUS`.
**K63RevengerDispatcher-3 — MED — the spawn-log count check is tautological.**
`dlog('spawned', …, len(tasks))` copies the dispatch count, so `:196 logged=N dispatched=N` can never fail
once the line exists, and a single `spawned … 45` line was produced by **117** real sessions (45+38+33+1).
The gate should not treat the number as evidence of spawning; only the presence of the line (and, per F2, its
timestamp) carries information. Repro: `grep -c 'spawned tameshi 45 w1' dispatcher.log` → 1; suffix census → 117.
**K63RevengerDispatcher-4 — MED — `exitKind === 'normal'` is vacuous and the yield→dispose window reads as death.**
All 1 445 exit rows are `normal`, including a cancelled L1, so the real completion test is `yielded`. A seat
that yielded seconds ago has no exit row yet and is counted dead; with `--report` that becomes `DEAD_UNNAMED`.
Live proof inside this wave:
```
for f in K63*.jsonl; do grep -q '"name":"yield"' "$f" && ! grep -q '"customType":"session_exit"' "$f" && echo $f; done
→ 17 seats (K63ExecProxyStanza, K63ReviewGateCode, K63SimplifyTool, …); all 17 have their <Seat>.md
```
Fix F4 (credit `yielded`; name `EXIT_PENDING`; `<Label>.md` is written at yield time, before dispose).
**K63RevengerDispatcher-5 — MED — nested storage would collapse into the forgery verdict.**
A seat spawned by a subagent is stored `<session>/<L1>/<L1>.<Seat>.jsonl` (KengakuR33 108 files, TabiR27 144,
S1-era `L1Souji22/`, `L1Kaidoku34-2/`). `indexSessions()` keys by the whole stem, so `candidates()` never matches
a nested stem: a wave whose seats exist only nested reads `SESSION_ABSENT` + `NOT_A_DISPATCH`, byte-identical to
a do-nothing lane **[derived from `:96-120`; kengaku r33's own verdict is FOREIGN because those seats also have
bare gen-B transcripts — `sessions=0` either way]**. Fix F3 (`SESSION_NESTED`).
**K63RevengerDispatcher-6 — MED — why older waves read `sessions=0`: three prompt generations, not one contract.**
gen C = `context + "\n\n# Seat <name>\n" + task` (dispatcher.py:71; K63 w1 40/40 pass the identity test).
gen B = `context + SEAT_NOTE + "\n\n---\n\n" + task` (custom `dispatch_ready`, orchestrator cell 17:21Z) — no
`# Seat`, so every transcript is `SESSION_FOREIGN`: kaidoku r35 64/64, souji r26 87/87. gen A = task only
(`R35PlannerDataWalk` user head is `/skill:godspeed\n\n# Target\nkaidoku round 35, wave one…`). The identity
test is right to reject them; the *verdict* is wrong — an out-of-contract dispatch is reported as `NOT_A_DISPATCH`,
the same word the plan uses for a forgery.
**K63RevengerDispatcher-7 — LOW — the credited duplicate is arbitrary.**
`:225 const { tr } = matched[0]` follows `readdir` order over `Name`, `Name-2`, `Name-3`, `Name-4`, so the
`session.id`, model and dead flag credited to a seat depend on filesystem order. Fix F5 (highest suffix, or
`SESSION_DISAGREE` when generations disagree).

## Spec the gate may rely on (full text with per-claim ground: `build/K63RevengerDispatcher/spec.md`)

1. `<root>/<projectKey>/<session-ts>_<uuid>/<Label>.jsonl` = a child of that session; `<Label>.md` = its yield
   payload (written at yield, before dispose); a subagent's child nests as `<Parent>/<Parent>.<Label>.jsonl`.
2. `<Label>` is the dispatch `tasks[].name`; `-N` is per-parent-session dedupe of that label (2nd use → `-2`),
   not evidence of a duplicate seat within this wave.
3. Prompt = `context + "\n\n# Seat <name>\n" + task` (separator varies — single `\n` observed live; do not depend
   on it). Older generations omit `# Seat` entirely.
4. `session.parentSession` is the parent's `.jsonl` and is identical for every seat of an orchestrator-dispatched
   wave; `session.id` is unique per session.
5. Completion = a `yield` toolCall row; `session_exit` is always `{reason:"dispose", kind:"normal"}` — even for a
   cancelled session — so it discriminates nothing. Death = no `yield` row.
6. `spawned <lane> <round> <wave> N` is logged after the loop with `N = len(tasks)`; `done` after finalize;
   `cap-defer`/`wave-error`/`adopted` mark refused, aborted and re-adopted attempts.

## Artifacts (all under `.ufo/waves/round-63/build/K63RevengerDispatcher/`)
`spec.md` (the spec with per-claim ground) · `gate-fix-proposal.md` (F1..F5, exact hunks) · `repro.sh`
(one-command borrowed-transcript forgery) · `forgery-borrowed/` (the fixture that reads CLEAN) ·
`evidence/` (gate outputs `g-*.txt`, census scripts).

## Limits
- No record names the spawn pass behind each `-N` generation; the pass→suffix mapping is **[INFERENCE]** from the
  prefix shape of the suffix census plus the single `wave-error` line. I did not reproduce a job-cap abort.
- Only the two orchestrator sessions under `-Projects-shokunin` were indexed; other project keys were not.
- No `--selftest` run, no control under `controls/inline/` touched, nothing under `scripts/`, the frozen counters,
  the controls or the log written. `agent.db` reads "malformed" through the sqlite reader (WAL); `history.db` and
  `stats.db` carry no label→file map, so no spawn record exists outside the transcripts and the log.
- No tool installed or upgraded.

VERDICT: The frozen 25-case selftest kills 40/67 single-literal mutants (59.7%) and misses 24 real holes — every transcript-identity conjunct, the verdict word, the dead-seat arm, session-row/message laundering and both fail-closed dispatch arms; the 47-case proposal in `build/K63ExecSelftestMutants/proposed/` kills all 24 (verified) and still reads PASS 47/47 on the unmutated gate.

# Seat K63ExecSelftestMutants — mutation battery on the gate's own selftest (round 63, w1)

## Evidence

Original copied, never mutated — sha256 identical before and after the whole battery:
```
$ cp scripts/inline-dispatch-evidence.mjs .ufo/waves/round-63/build/K63ExecSelftestMutants/work/
fdd883927baa136afb4672474dc39eb0e524d5351fed26bfe6934bd05b7d2bfd  work/inline-dispatch-evidence.mjs
fdd883927baa136afb4672474dc39eb0e524d5351fed26bfe6934bd05b7d2bfd  scripts/inline-dispatch-evidence.mjs  (after)
```
Baseline and battery (node v24.21.0; one literal per run, own process, 60 s timeout):
```
$ node scripts/inline-dispatch-evidence.mjs --selftest | tail -1
INLINE_DISPATCH_SELFTEST: PASS (25/25)                                     EXIT=0
$ node mutants.mjs
MUTANTS total=67 scored=67 killed=40 survived=27 timeout=0 invalid=0 kill-rate=59.7%
```
Per-axis (killed/total, survivors):
```
report-floor 2/4 M02,M03   tail-120 0/4 M05,M06,M07,M08   ctx-head-200 0/4 M09,M10,M11,M12
exit-kind 4/6 M16,M18      parents 2/2  sessions-zero 3/3  spawn-log 2/4 M25,M26  done-log 3/3
ready 3/5 M32,M33          results 5/5  session-match 4/6 M43,M46  transcript 3/6 M50,M51,M52
reports 4/5 M57            verdict 2/3 M58  rev-mode 2/2  dispatch-shape 0/2 M63,M64  harness 1/3 M66,M67
```
39 of 40 kills are `FAIL <case>` assertions; M61 (`if (rev) {` → `if (!rev) {`, script:78) is killed only by an
uncaught `TypeError: Cannot read properties of undefined (reading 'length')` — its target assertions never ran.
Every survivor was attacked with an independent fixture writer (`discriminators.mjs`, does not import the gate):
```
$ node discriminators.mjs | tail -1
DISCRIMINATORS total=28 disagree=24 agree=4      # the 4 AGREE are M12 under four context shapes
```
Proposal (full-file draft from `make-proposed.mjs`: 5 fixture-knob edits + 22 cases, no `inspect()` change):
```
$ node proposed/inline-dispatch-evidence.proposed.mjs --selftest | tail -1
INLINE_DISPATCH_SELFTEST: PASS (47/47)                                     EXIT=0
$ node verify-proposed.mjs | tail -1
PROPOSED-SUITE survivors=27 killed=24 surviving=3   # M12, M66 equivalent; M67 meta (-12)
```
Meta-mutant M67 (`process.exit(passed === cases.length ? 0 : 1)` → `? 0 : 0`) combined with M01:
`INLINE_DISPATCH_SELFTEST: FAIL (23/25)` with `EXIT=0`.

## Findings

**K63ExecSelftestMutants-1 — HIGH — the transcript-identity conjunction is tested by nothing.** The match is `includes('# Seat '+name) && includes(ctxHead) && includes(tail(task,120))` (script:216); M08 (`…tail(…)` → `&& true`), M09 (ctxHead → `''`, and `includes('')` is always true) and M11 (context conjunct deleted) each still read `PASS (25/25)`. A transcript carrying only `# Seat <name>` is accepted as that seat's session — the one record the lane cannot author can be faked with one line. Repro: `node …/mut/M09.mjs --selftest; echo EXIT=$?` → PASS, EXIT=0; discriminator `M09 DISAGREE orig DRIFT [SESSION_FOREIGN:A1,NOT_A_DISPATCH] / mut CLEAN`.

**K63ExecSelftestMutants-2 — HIGH — the verdict word is never asserted.** Swapping `unique.length ? 'DRIFT' : 'CLEAN'` (script:260, M58) leaves `code` and `unique` identical, so all 25 cases pass while an honest wave prints `INLINE_DISPATCH: DRIFT` with exit 0. Frozen check I2 greps exactly that word, so this mutation would invert the round's receipt silently. Repro: discriminator `M58 DISAGREE orig 0 CLEAN / mut 0 DRIFT`.

**K63ExecSelftestMutants-3 — HIGH — the dead-seat arm (this round's considerthese idea 3) is under-tested.** `clean = tr.yielded && tr.exitKind === 'normal'` (script:231) → `||` (M16) credits a seat that yielded then aborted; `|| 'unknown'` → `|| 'normal'` (script:144, M18) credits a `session_exit` row with no `kind`. Both survive because the only dead-seat case sets `noYield` and `exit:'aborted'` together, isolating neither conjunct. Repro: `node …/mut/M16.mjs --selftest` → PASS; discriminator `M16 DISAGREE orig DRIFT [DEAD_UNNAMED:B2] / mut CLEAN done=2`.

**K63ExecSelftestMutants-4 — MEDIUM — row guards are first-wins and both are untested.** `row.type === 'session' && !t.sessionId` (script:137) and `row.message.role === 'user' && !t.user` (script:140): dropping either lets a transcript append a second `session` row to launder a duplicated id (M51 → CLEAN) or a second correct-looking user message to repair a foreign transcript (M52 → CLEAN). Repro: `node …/mut/M52.mjs --selftest` → PASS; discriminator `M52 DISAGREE orig DRIFT [SESSION_FOREIGN:A1] / mut CLEAN`.

**K63ExecSelftestMutants-5 — MEDIUM — seat-marker prefix collision gives cross-seat credit.** Dropping the `\n` from `includes(\`# Seat ${t.name}\n\`)` (script:216, M46) makes seat `A1` accept a transcript saying `# Seat A10`; no case uses a seat name that prefixes another. Repro: `node …/mut/M46.mjs --selftest` → PASS; discriminator `M46 DISAGREE orig DRIFT [SESSION_FOREIGN:A1] / mut CLEAN`.

**K63ExecSelftestMutants-6 — MEDIUM — the ambiguity and stem rules have no case.** `matched.length > 1` → `> 2` (M43) accepts two matching transcripts per seat; widening the stem digit test `/^\d+$/` → `/^.*$/` (M50, script:117) accepts `A1-notes.jsonl` as seat A1. Repro: `node …/mut/M43.mjs --selftest` → PASS; discriminators `M43`/`M50` DISAGREE (`SESSION_AMBIGUOUS`/`SESSION_ABSENT` → CLEAN).

**K63ExecSelftestMutants-7 — MEDIUM — two of five ready-marker conjuncts are untested.** Deleting `!ready.l1` (M32) or `ready.wave !== wave` (M33, script:175) lets a ready file naming wave `w9` while pointing at `…/round-7/w1-dispatch.json` read CLEAN. Repro: `node …/mut/M33.mjs --selftest` → PASS; discriminator `M33 DISAGREE orig DRIFT [READY_MISMATCH] / mut CLEAN`.

**K63ExecSelftestMutants-8 — MEDIUM — dispatcher-log arms: duplicate spawn accepted, trailing token misclassified.** `spawned.length > 1` → `> 2` (M26, script:195) accepts a wave spawned twice (discriminator `orig DRIFT [SPAWN_LOG_MISMATCH:spawned-2-times] / mut CLEAN`); dropping the `$` anchor (M25, script:193) reclassifies a spawn line with a trailing token from `SPAWN_LOG_ABSENT` to `SPAWN_LOG_MISMATCH:logged=trailing-token` — still DRIFT, but the finding id a control's `expect` names changes. Repro: `node …/mut/M26.mjs --selftest` → PASS.

**K63ExecSelftestMutants-9 — MEDIUM — both fail-closed dispatch-shape arms are untested.** Removing `tasks.length === 0` (M63) or `typeof tc.context !== 'string'` (M64, script:170) turns an empty task list into exit 1 `DRIFT […RESULTS_MISMATCH…,NOT_A_DISPATCH]` instead of exit 2, and a non-string context into an uncaught `TypeError` at `tc.context.trim()` instead of fail-closed. Repro: `node …/mut/M63.mjs --selftest` → PASS.

**K63ExecSelftestMutants-10 — LOW — the 64-byte floor is never tested at its boundary.** `MIN_REPORT_BYTES` 64→63 (M02, script:43) and `<`→`<=` (M03, script:244) survive: the only tiny body is 3 bytes, all others ~100. Discriminators at 63 and 64 bytes both DISAGREE (`REPORT_TINY` ↔ `CLEAN`). Repro: `node …/mut/M03.mjs --selftest` → PASS.

**K63ExecSelftestMutants-11 — LOW — `done=` is printed and quoted, never asserted where it can lie.** Dropping `s.session &&` from `seatInfo.filter((s) => s.session && !s.dead)` (M57, script:252) reports `done=2` for a wave with zero transcripts; `dead-count` asserts `done` only where a session exists. Repro: discriminator `M57 DISAGREE orig done=0 / mut done=2` (both DRIFT `NOT_A_DISPATCH`).

**K63ExecSelftestMutants-12 — LOW — the selftest's own exit aggregation is unverified.** `process.exit(passed === cases.length ? 0 : 1)` → `? 0 : 0` (M67) prints `FAIL (23/25)` and exits 0. No case can kill it; only an external read of the printed `PASS (N/N)` line (frozen check I1 does read it — hence LOW) or a meta-case running a deliberately broken child would.

Equivalent mutants, argued not assumed: **M12** `tc.context.trim().slice(0,200)` → `tc.context.slice(0,200)` — the dispatch context reaches the transcript verbatim, so context whitespace stays adjacent to the body being trimmed; four shapes (padded, >200 with leading newlines, short with trailing spaces, tab-led) all AGREE. **M66** `finding === null ? r.unique.length === 0 : …` → `true` — with `expect(…, 0, null)` and `code: unique.length ? 1 : 0` (script:260-261), `code === 0` already implies `unique.length === 0`; the conjunct is dead. **M67** is non-equivalent but unkillable by any single case (-12).

## Survivors and the case that kills each

Bodies below are integrated verbatim at `proposed/inline-dispatch-evidence.proposed.mjs:356-401`; each was executed
and `verify-proposed.mjs` reports `KILLED` with that case failing (`proposed-kills.tsv`).

| mutant | axis | killing case | | mutant | axis | killing case |
|---|---|---|---|---|---|---|
| M02 | report-floor | `report-floor-63-bytes` | | M32 | ready | `ready-without-l1` |
| M03 | report-floor | `report-floor-64-bytes` | | M33 | ready | `ready-wrong-wave-name` |
| M05 | tail-120 | `transcript-wrong-task-text` | | M43 | session-match | `two-transcripts-one-seat` |
| M06 | tail-120 | `transcript-truncated-task-tail` | | M46 | session-match | `seat-marker-prefix-collision` |
| M07 | tail-120 | `transcript-truncated-task-tail` | | M50 | transcript | `transcript-stem-not-seat` |
| M08 | tail-120 | `transcript-wrong-task-text` | | M51 | transcript | `second-session-row-hides-dup` |
| M09 | ctx-head-200 | `transcript-wrong-context` | | M52 | transcript | `second-user-message-cannot-repair` |
| M10 | ctx-head-200 | `transcript-five-char-context` | | M57 | reports | `no-sessions-done-is-zero` |
| M11 | ctx-head-200 | `transcript-wrong-context` | | M58 | verdict | `verdict-word-clean` |
| M12 | ctx-head-200 | *equivalent* (4 probes AGREE) | | M63 | dispatch-shape | `empty-task-list-fail-closed` |
| M16 | exit-kind | `yielded-but-aborted-is-dead` | | M64 | dispatch-shape | `context-not-a-string-fail-closed` |
| M18 | exit-kind | `exit-row-without-kind-is-dead` | | M66 | harness | *equivalent* (dead conjunct) |
| M25 | spawn-log | `spawn-line-trailing-token` | | M67 | harness | *no case can kill it* (-12) |
| M26 | spawn-log | `spawn-line-twice` | | | | |

```js
expect('report-floor-63-bytes', run(mk(['A1'], { reportBody: { A1: 'y'.repeat(63) } }).f), 1, 'REPORT_TINY');
expect('report-floor-64-bytes', run(mk(['A1'], { reportBody: { A1: 'y'.repeat(64) } }).f), 0, null);
expect('transcript-wrong-task-text', run(mk(['A1'], { tr: { A1: { user: `Complete assignment thoroughly:\n\n${FIXCTX}\n\n# Seat A1\nwrong work only; see the other note` } } }).f), 1, 'SESSION_FOREIGN');
expect('transcript-truncated-task-tail', run(mk(['A1'], { tasks: { A1: LONG_TASK }, tr: { A1: { user: `Complete assignment thoroughly:\n\n${FIXCTX}\n\n# Seat A1\n${LONG_TASK.slice(-150)}` } } }).f), 0, null);
expect('transcript-wrong-context', run(mk(['A1'], { tr: { A1: { user: `Complete assignment thoroughly:\n\nSOME OTHER ROUND CONTEXT\n\n# Seat A1\n${TASK_A1}` } } }).f), 1, 'SESSION_FOREIGN');
expect('transcript-five-char-context', run(mk(['A1'], { tr: { A1: { user: `Complete assignment thoroughly:\n\nROUND context truncated after five chars\n\n# Seat A1\n${TASK_A1}` } } }).f), 1, 'SESSION_FOREIGN');
{ const { f, d } = mk(['A1','B2'], { tr: { B2: { exit: 'aborted' } } }); const rep = join(d,'rep-m16.md'); writeFileSync(rep,'only A1 is discussed here'); expect('yielded-but-aborted-is-dead', run(f, { reportFile: rep }), 1, 'DEAD_UNNAMED'); }
{ const { f, d } = mk(['A1','B2'], { tr: { B2: { exitRow: { type:'custom', customType:'session_exit' } } } }); const rep = join(d,'rep-m18.md'); writeFileSync(rep,'only A1 is discussed here'); expect('exit-row-without-kind-is-dead', run(f, { reportFile: rep }), 1, 'DEAD_UNNAMED'); }
expect('spawn-line-trailing-token', run(mk(['A1','B2'], { spawnTail: ' trailing-token' }).f), 1, 'SPAWN_LOG_ABSENT');
expect('spawn-line-twice', run(mk(['A1','B2'], { extraSpawn: true }).f), 1, 'SPAWN_LOG_MISMATCH');
expect('ready-without-l1', run(mk(['A1'], { ready: { lane:'demo', round:7, wave:'w1', dispatch:'/abs/lane/.ufo/waves/round-7/w1-dispatch.json' } }).f), 1, 'READY_MISMATCH');
expect('ready-wrong-wave-name', run(mk(['A1'], { ready: { lane:'demo', round:7, wave:'w9', dispatch:'/abs/lane/.ufo/waves/round-7/w1-dispatch.json', l1:'DemoR7' } }).f), 1, 'READY_MISMATCH');
expect('two-transcripts-one-seat', run(mk(['A1'], { rawFiles: { 'A1-2.jsonl': transcript('A1', FIXCTX, TASK_A1) } }).f), 1, 'SESSION_AMBIGUOUS');
expect('seat-marker-prefix-collision', run(mk(['A1'], { tr: { A1: { seatName: 'A10' } } }).f), 1, 'SESSION_FOREIGN');
expect('transcript-stem-not-seat', run(mk(['A1'], { tr: { A1: { file: 'A1-notes' } } }).f), 1, 'SESSION_ABSENT');
expect('second-session-row-hides-dup', run(mk(['A1','B2'], { tr: { B2: { id:'sid-A1', extraRows:[{ type:'session', version:3, id:'sid-B2-uniq', parentSession:'/p/orch.jsonl' }] } } }).f), 1, 'SESSION_ID_DUP');
expect('second-user-message-cannot-repair', run(mk(['A1'], { tr: { A1: { user:'Complete assignment thoroughly: other lane work', extraRows:[{ type:'message', message:{ role:'user', content:[{ type:'text', text:`Complete assignment thoroughly:\n\n${FIXCTX}\n\n# Seat A1\n${TASK_A1}` }] } }] } } }).f), 1, 'SESSION_FOREIGN');
{ const r = run(mk(['A1','B2'], { noSessionAll: true }).f); expect('no-sessions-not-a-dispatch', r, 1, 'NOT_A_DISPATCH'); cases.push(['no-sessions-done-is-zero', r.done === 0, `done=${r.done}`]); }
{ const r = run(mk(['A1']).f); cases.push(['verdict-word-clean', r.code === 0 && r.line.startsWith('INLINE_DISPATCH: CLEAN '), r.line]); }
expect('empty-task-list-fail-closed', run(mk(['A1'], { emptyTasks: true }).f), 2, 'DISPATCH_UNREADABLE');
expect('context-not-a-string-fail-closed', run(mk(['A1'], { dispatchCtx: 123 }).f), 2, 'DISPATCH_UNREADABLE');
```
Fixture knobs the proposal adds (`ctx`, `tasks`, `dispatchCtx`, `emptyTasks`, `spawnTail`, `extraSpawn`, `noSessionAll`,
`rawFiles`, `tr[].file|seatName|extraRows|exitRow`) are additive; the suite goes 25 → 47, so I1's `N >= 25` still
holds, and no `inspect()` behaviour changes, so no committed control's `expect` moves.

## Artifacts

- `…/build/K63ExecSelftestMutants/mutants.mjs`, `mutants.tsv` (67 rows: id, line, `orig -> mut`, outcome), `mutants.log`, `survivors.json`.
- `…/discriminators.mjs`, `discriminators.tsv` (28 scenarios: 24 DISAGREE / 4 AGREE).
- `…/make-proposed.mjs`, `…/proposed/inline-dispatch-evidence.proposed.mjs` (428 lines, sha256 `33575c15b4cda0a0fb0eaa777e1dda28138b78ee10ceca19998dde03de46bcae`), `…/proposed/proposed.diff` (104 lines).
- `…/verify-proposed.mjs`, `proposed-kills.tsv`, `…/mut/` (67 mutants + 27 proposed-suite copies), `/tmp/kumitate-r63/K63ExecSelftestMutants/`.
- Tooling: nothing installed (node v24.21.0 preinstalled); no pacman, no host service, no lane index or jj state touched.

## Limits

- Literal substitutions only (no AST/statement deletion), inside `inspect()`, its helpers and the selftest harness;
  `usage()`/`parseArgs()` (exit 64) and the CLI tail are uncovered.
- A nonzero exit counts as killed: M61's kill is an uncaught `TypeError` (target assertions never ran) and M64's is
  a crash (case placed last on purpose).
- Real host transcripts (`~/.omp/agent/sessions`) and `/fast/scratch/hyaku-run7/dispatcher.log` were not read; every
  case is a synthetic fixture, and the 22 proposed cases are verified only against mutants of this copy.
- Not checked: whether any committed `controls/inline/` `expect` already catches these holes (I3 extension is the L1's),
  or whether the 25 cases suffice on the real waves' data.

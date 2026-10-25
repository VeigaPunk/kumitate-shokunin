VERDICT: Of the 15 DRIFT lines in the real-host control list, 12 are marker-less-dispatcher waves whose 751 seats all have real transcripts (6 read CLEAN once the gate stops requiring a `# Seat <name>` line and one dispatcher-log shape), while mori r47 w1's missing report, tameshi r45 w1's 2.5× duplicate dispatch and tameshi r45 w2's transcript-less seat are real wave defects; the 4-hunk `gate.patch` leaves every real defect visible with the 25-case selftest and all 14 frozen controls still green.

# Seat K63ExecRealWavesDrift — real-data false-positive audit

## Evidence

The 18 control lines reproduce **verbatim** with the frozen gate (worktree mode, default sessions root and
dispatcher log): `control lines 18 identical 18 differing 0`. Per-wave cause/class/evidence table:
`build/K63ExecRealWavesDrift/real-waves-table.md`.

```
$ node scripts/inline-dispatch-evidence.mjs --root …/kaidoku-shokunin --round 35 --wave w1
INLINE_DISPATCH: DRIFT (seats=64 sessions=0 done=0 reports=64 dead=0)
FINDING SPAWN_LOG_ABSENT / FINDING SESSION_FOREIGN:R35PlannerDataWalk ×64 / FINDING NOT_A_DISPATCH
$ … --root …/tameshi-shokunin --round 45 --wave w1 → DRIFT (seats=45 sessions=45 done=45 reports=45 dead=0) SESSION_AMBIGUOUS ×38
$ … --root …/mori-shokunin  --round 47 --wave w1 → DRIFT (seats=42 sessions=42 done=42 reports=41 dead=0) REPORT_ABSENT:MutPinSemanticCell
frozen classes over all 18: SESSION_FOREIGN 752, NOT_A_DISPATCH 12, SPAWN_LOG_ABSENT 12, DONE_LOG_ABSENT 9,
SESSION_AMBIGUOUS 38, READY_MISMATCH 2, RESULTS_MISMATCH 2, REPORT_ABSENT 1
```

**The `SESSION_FOREIGN` waves are not foreign.** Every seat has a transcript in the *same* store
(`~/.omp/agent/sessions/-Projects-shokunin/2026-10-25T16-43-09-760Z_01a173f1…/`, `cwd=/home/vgpnk/Projects/shokunin`,
one `parentSession`) carrying the wave's context head and the seat's task tail — only the marker is missing
(`probe-prompt-shape.mjs`, 200-char head + 120-char tail): `kaidoku r35 seats=64 ctxHead=64 fullCtx=64
tail120=64 marker=0` · `tsukuroi r37 … fullTask=64 marker=0` · `souji r26 seats=87 marker=0` · `kengaku r33
marker=0` · `mado r39 marker=0`, against `kengaku r35 build marker=32` / `mori r47 w1 marker=42` (the two
CLEAN controls). Pre-marker shape (kaidoku `R35PlannerDataWalk`): `Complete assignment thoroughly:\n\n<ctx
958 B>Orchestrator note (hyaku run 7): …\n\n---\n\n<ctx again><task>`; `dispatcher.py:74` writes
`tc['context'] + "\n\n# Seat <name>\n" + t['task']` — the marker is a dispatcher-generation artifact.

**Log records exist in four other shapes.** `registered …/round-N/<wave>.ready` (11 lines: `:218` kaidoku
16:16:13, `:184` tsukuroi 16:04:04, `:187` mado 16:05:00, `:23` tabi r27, `:83` souji r27, `:149` souji r28,
`:151` kengaku r34, `:107` kasegi r29, `:171` tabi r28), `adopted …/<wave>.ready` (kaidoku/tsukuroi/mado
16:41:16), the aggregate `'<lane>/<wave>: spawned n/total'` (`:50` `souji/w1: spawned 87/87`, `:42`
`kengaku/build: spawned 36/36`), and bare `done <lane> <wave>` (`:68 done kengaku build`, `:84 done kasegi
kasegi-r28-build`, `:124 done souji w1`).

**tameshi r45 w1 duplicates** (`tameshi-w1-duplicates.txt`): `seats=45 matchedTranscripts=111
distinctSessionIds=111 filesPerSeat={1:7,2:10,3:28} multiMatchedSeats=38 everyDuplicateClean=true
startBatchesByMinute={19:44:28, 19:45:22, 19:46:16, 19:47:12, 19:48:33}`. All copies: identical prompt,
distinct session ids, `yield` + `session_exit:{kind:"normal"}`. Log for that wave: `cap-defer`
16:42:28/16:43:00/16:43:30/16:46:46/16:47:16, `wave-error … RuntimeError('Background job limit reached
(100)…')` 16:46:16, one `spawned tameshi 45 w1 45` 16:48:38, `adopted` 16:53:13 and 16:55:43 (`:276,287`,
two kernel restarts). `register()` (`dispatcher.py:66-77`) spawns in a loop that raises on the job cap and
writes `<ready>.dispatched` only after the loop; its idempotency guards are the in-memory `HANDLES`
(`globals().get('HANDLES', {})`, emptied by every reload) and `live(name, run)` = `proc://` **running** names
(`:41-43`) — so a seat that already finished, or has not started under backpressure, is re-spawned by the
next tick, and the `spawned` line logs `len(tasks)`, never the number actually spawned.

**tameshi r45 w2 `ScribeScorecard`:** no transcript anywhere (searched all 4 522 `*.jsonl` for the
wave-unique tail `matching the round-44 block`; hits are only the L1's session and two sibling seats' tool
echoes). Its 5 same-stem candidates are namesakes — kasegi r28 (17:21), souji r27 (17:56), kasegi r29
(18:15), kasegi r30 (18:49), mori r47 w2 (20:08) — none carrying this wave's context head; `w2-results.json`
still retains 2 527 chars of its output.

**Reports the gate could not see** (nested layout, instructed by the context — kaidoku r35: `Write only
unique \`.ufo/waves/round-35/w1/<seat>/\` report`): `mado r39 w1/ScrReportMain/report-main.md` (3 587 B),
`tsukuroi r37 w1/C16S306/C16S306.md` (5 443 B).

**Proposed gate (`gate.patch`, 4 hunks) re-validated:** `INLINE_DISPATCH_SELFTEST: PASS (25/25)` (frozen gate
also 25/25) · 14/14 frozen controls with the same exit codes and finding ids · 18 real waves → **9 CLEAN, 9
DRIFT**. CLEAN: kaidoku r35, kengaku r33, souji r26, tabi r27, tabi r28, tsukuroi r37, kengaku r35
build/falsify, mori r47 w2. DRIFT: kasegi r28/r29 (`READY_MISMATCH`+`RESULTS_MISMATCH`; r29 +2
`REPORT_ABSENT`), kengaku r34 / mado r39 / souji r27 / souji r28 / mori r47 w1 (`REPORT_ABSENT` only),
tameshi r45 w1 (`SESSION_AMBIGUOUS`×38), tameshi r45 w2 (`SESSION_FOREIGN:…:namesake-only`).

## Findings

**K63ExecRealWavesDrift-1 — high, gate-fault.** Seat identity requires a `# Seat <name>\n` line that only
`dispatcher.py:74` writes. The 12 waves dispatched before 16:41 (kaidoku r35, tsukuroi r37, mado r39, souji
r26/27/28, tabi r27/28, kengaku r33/34, kasegi r28/29 — 751 seats) compose the prompt without it, so 751
harness-written transcripts read `SESSION_FOREIGN` and each wave collapses to `NOT_A_DISPATCH`; this attacks
the gate's core claim. Fix: identity = wave-unique context head + seat-unique task tail (both already
required), with a transcript carrying *another* seat's marker still excluded.
Repro: `node scripts/inline-dispatch-evidence.mjs --root /home/vgpnk/Projects/shokunin/kaidoku-shokunin --round 35 --wave w1`.

**K63ExecRealWavesDrift-2 — high, gate-fault.** Spawn/done records match one literal shape while
`registered`, `adopted`, the `drive` aggregate and bare `done` are real records here: 12 waves read
`SPAWN_LOG_ABSENT` and 9 read `DONE_LOG_ABSENT` although the line exists — it attacks "the orchestrator's log
records the spawn". Repro: `grep -n 'registered\|done kengaku build' /fast/scratch/hyaku-run7/dispatcher.log`,
then the gate on `--root …/kengaku-shokunin --round 33 --wave build`.

**K63ExecRealWavesDrift-3 — medium, gate-fault.** Reports are read only at `<wave>/<Seat>.md`; the
`<wave>/<Seat>/` layout the context itself mandates yields `REPORT_ABSENT` on a 5 443 B and a 3 587 B report.
Repro: gate on `--root …/tsukuroi-shokunin --round 37 --wave w1`; `ls .ufo/waves/round-37/w1/C16S306/`.

**K63ExecRealWavesDrift-4 — low, gate-fault.** When every same-stem candidate is another wave's namesake the
gate says `SESSION_FOREIGN` (someone else's transcript) instead of "absent" — tameshi r45 w2's
`ScribeScorecard`; the patch appends `:namesake-only`. Repro: `--root …/tameshi-shokunin --round 45 --wave w2`.

**K63ExecRealWavesDrift-5 — medium, wave-fault (tameshi r45 w1).** Every seat was dispatched 1–3× (111
transcripts, 111 distinct session ids, `{1:7,2:10,3:28}`), all copies identical and clean: a ~2.5× duplicate
dispatch under the 100-job cap from `register()`'s non-durable idempotency. DRIFT is correct; only the class
name could be sharper. Repro: `node build/K63ExecRealWavesDrift/dupmatch.mjs …/tameshi-shokunin 45 w1`.

**K63ExecRealWavesDrift-6 — medium, wave-fault (tameshi r45 w2).** One seat of 36 left no session file at
all, yet `w2-results.json` retains 2 527 chars of its output and the wave dir has no report for it; that
seat's evidence is unrecoverable from the store.

**K63ExecRealWavesDrift-7 — medium, wave-fault (7 waves).** 12 seat reports missing or misplaced: kasegi r29
`ExecHarnessC2`,`ScribeScorecard`; kengaku r34 `R34ReconRounds` (claimed path absent),`R34ReviewReadmePatch`;
mado r39 `ExecAssimAppendBlock` (`aborted:true`),`ScrReportFrontier`; mori r47 w1 `MutPinSemanticCell`
(self-attested `"No report written."`); souji r27 `MutC2Rows` (written into `round-26/w1/`); souji r28
`SwarmScribe21/25/28`,`SwarmScout59`. Exactly what the gate exists to catch. Repro: `patched-real-waves.txt`.

**K63ExecRealWavesDrift-8 — low, wave-fault (kasegi r28/r29).** `wave1.ready` declares
`wave:"kasegi-r28-build"` while the files are `wave1.*`, and the round dir holds two results files with
different bytes (20 043 B vs 365 849 B). `READY_MISMATCH`/`RESULTS_MISMATCH` are true positives; the frozen
gate's extra `DONE_LOG_ABSENT` was false (a done line exists under the declared name) — the patch reads
`ready.wave` as a log alias.

**K63ExecRealWavesDrift-9 — informational, gate-fault (dead-seat arm).** Without `--report` dead seats are
counted (`dead=2`) but never make a wave DRIFT: tabi r28 w1 and tsukuroi r37 w1 read CLEAN with 2 dead seats
each. Documented contract, but a sweep omitting `--report` cannot see seat deaths as drift; the control list
should pass `--report` where it means to judge.

## Artifacts

`build/K63ExecRealWavesDrift/`: `gate.patch` (109-line diff vs `scripts/inline-dispatch-evidence.mjs`),
`inline-dispatch-evidence.patched.mjs`, `real-waves-table.md` (18-row table), `frozen-real-waves.txt`,
`patched-real-waves.txt`, `patched-validation.txt`, `prompt-shape-matrix.txt`, `probe-prompt-shape.mjs`,
`dupmatch.mjs`, `tameshi-w1-duplicates.txt`. Nothing outside `build/` and this report was written;
`scripts/`, the frozen plan, counters, controls and base receipts are untouched.

## Limits

* `--rev` mode was not exercised on real waves (worktree only); the patched `list()` is covered by the
  selftest's rev-mode case for the flat path only.
* Per-pass spawn attribution for tameshi r45 w1 is unrecoverable: the log logs `len(tasks)` and harness start
  times are queue-delayed.
* Waves spawned before the log's first line (14:09:43) would still read `SPAWN_LOG_ABSENT` under the patch;
  no control wave is in that class, so that boundary is untested.
* Only the 18 control waves were audited, not the other ~60 wave dirs on this host, and no other
  orchestrator session store.
* No wave has two byte-identical task rows (`distinctTasks == seats` in all 18), so dropping the marker is not
  exploitable here; such a wave would rely on `SESSION_ID_DUP` alone.

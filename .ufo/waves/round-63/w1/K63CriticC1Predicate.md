VERDICT: C1's target is reachable by a do-nothing control — a 21-line stub tool plus fabricated waves, controls and receipt reads `INLINE63_HELD held=6/6` exit 0, because the frozen probe executes the measured revision's own tool and trusts its stdout; the honest revision cannot even reach I3, since a frozen control loses its empty `sessions/` root to `git archive`.

## Evidence

Round files read: `.ufo/waves/round-63/plan.md` (C1, rule I63 v1), `probe/inline63-probe.mjs`, `scripts/inline-dispatch-evidence.mjs` (b38a206). No frozen file edited; no host write; no pacman/uv/npx install (none needed).

**Frozen probe, whole table** (`build/K63CriticC1Predicate/probe-table.txt`, every line verbatim, exit code after each):

```
## probe on the real lane, base dfa6fca8 (reproduces base/inline63-base.txt)
INLINE63_UNMET held=0/6 checks=6 rev=dfa6fca8f362e9c962f5b940025a2619380b759b rule=I63 | I1 MISS tool-absent | I2 MISS no-committed-wave-results | I4 MISS no-committed-wave-results | I3 MISS tool-absent;cases=0<10;no-honest-case | I5 MISS row-absent | I6 MISS tip-receipt-absent
exit=1
## probe on a CLEAN FIXTURE of this lane at b38a206 (archive -> git init -> commit, unmodified)
INLINE63_UNMET held=1/6 checks=6 rev=8bce529d9687bb4841024d685272f30ef4249192 rule=I63 | I2 MISS no-committed-wave-results | I4 MISS no-committed-wave-results | I3 MISS forged-no-sessions:exit=2 want=1 NOT_A_DISPATCH | I5 MISS row-absent | I6 MISS tip-receipt-absent
exit=1
## (a) no tool at all + fabricated wave/SCORECARD row/receipt
INLINE63_UNMET held=1/6 checks=6 rev=2a8f46df1c667cef0d24f42faf082b00e141ea26 rule=I63 | I1 MISS tool-absent | I2 MISS tool-absent | I4 MISS no-committed-wave-results | I3 MISS tool-absent;cases=0<10;no-honest-case | I6 MISS missing-lines=0
exit=1
## (b) copies the real tool, fabricated wave with invented seat names
INLINE63_UNMET held=3/6 checks=6 rev=438bb1a3cba982513f53e2ec16b6add0ecb13ce0 rule=I63 | I2 MISS w1:INLINE_DISPATCH: DRIFT (seats=40 sessions=0 done=0 reports=40 dead=0);total-seats=0 | I3 MISS forged-no-sessions:exit=2 want=1 NOT_A_DISPATCH | I6 MISS missing-lines=0
exit=1
## (b2) same tool, seats = 40 REAL w1 transcripts, harvested read-only (no host writes)
INLINE63_UNMET held=4/6 checks=6 rev=208f13e2421bc7103bf23c618950bdb689f1f5ac rule=I63 | I2 MISS w1:INLINE_DISPATCH: DRIFT (seats=40 sessions=40 done=3 reports=40 dead=37);total-seats=0 | I6 MISS missing-lines=0
exit=1
## (c) hand-written transcripts in a SCRATCH sessions root (real HOME)
INLINE63_UNMET held=4/6 checks=6 rev=7432ceb98d70a818679f85c8f6b56289915163ac rule=I63 | I2 MISS w1:INLINE_DISPATCH: DRIFT (seats=40 sessions=0 done=0 reports=40 dead=0);total-seats=0 | I6 MISS first-line=rev=307143f1740704562d629c31a9f3db1a95279c85
exit=1
## (c2) same, HOME=fakehome so the scratch root IS the default root
INLINE63_UNMET held=4/6 checks=6 rev=7432ceb98d70a818679f85c8f6b56289915163ac rule=I63 | I2 MISS w1:INLINE_DISPATCH: DRIFT (seats=40 sessions=40 done=40 reports=40 dead=0);total-seats=0 | I6 MISS first-line=rev=307143f1740704562d629c31a9f3db1a95279c85
exit=1
## (d) 21-line stub tool printing the expected lines
INLINE63_HELD held=6/6 checks=6 rev=1ef349f4a663b958930fc69efe5c8bc8bf185fa4 rule=I63
exit=0
```

The stub's own lines, run directly (`fixtures/FD-stub-tool/scripts/inline-dispatch-evidence.mjs`, 21 lines, 1101 bytes):

```
INLINE_DISPATCH_SELFTEST: PASS (25/25)                                    exit=0
INLINE_DISPATCH: CLEAN (seats=80 sessions=80 done=80 reports=80 dead=0)   exit=0
INLINE_DISPATCH: DRIFT (seats=0 ...) / FINDING NOT_A_DISPATCH             exit=1   (--sessions-root <empty>)
INLINE_DISPATCH: DRIFT (seats=0 ...) / FINDING SPAWN_LOG_ABSENT           exit=1   (--dispatcher-log <empty file>)
```

**Read-only replay (b2), gate directly, real tool from the fixture commit** (`--rev 208f13e…`):

```
INLINE_DISPATCH: CLEAN (seats=40 sessions=40 done=4 reports=40 dead=36)   # post-wave scratch log
INLINE_DISPATCH: CLEAN (seats=40 sessions=40 done=4 reports=40 dead=36)   # same transcripts relabelled round 63 / wave w2, never dispatched
```

Repro: `node fixtures/FB2-replay-same-wave/scripts/inline-dispatch-evidence.mjs --root fixtures/FB2-replay-same-wave --round 63 --wave w2 --dispatcher-log /tmp/kumitate-r63/K63CriticC1Predicate/w2.log`.

**Frozen control defect** (real lane, committed bytes):

```
$ git ls-tree -r --name-only b38a206 -- .ufo/waves/round-63/controls/inline/forged-no-sessions/sessions | wc -l
0
$ find .ufo/waves/round-63/controls/inline/forged-no-sessions/sessions
…/sessions
…/sessions/orch          # empty in the worktree, absent from every commit
$ cat .ufo/waves/round-63/controls/inline/forged-no-sessions/expect
1
NOT_A_DISPATCH
```

**Dispatcher log / sessions root facts**: `/fast/scratch/hyaku-run7/dispatcher.log:465` is `2026-10-25T17:57:13 spawned kumitate 63 w1 40`; there is no `done kumitate w1 …/round-63/w1-results.json` line and no round-63 `w2` line (488 lines total). `~/.omp/agent/sessions` holds 4522 `.jsonl`; 40 stems `K63*` in `-Projects-shokunin/2026-10-25T16-43-09-760Z_01a173f1-…/`.

## Findings

**K63CriticC1Predicate-1 (critical) — I1–I4 are self-certified: the probe runs the tool under test.** `inline63-probe.mjs:46-48` extracts `git archive <M>` and spawns `<M>:scripts/inline-dispatch-evidence.mjs`, then believes its stdout for I1 (`:56-58`), I2 (`:69-77`) and I4 (`:82-85`); I3's expectations are lane-authored `expect` files (`:100-106`), and I5/I6 are lane-authored text. A 21-line stub printing `PASS (25/25)`, one `CLEAN` line and the two DRIFT ids therefore holds 6/6 — the claim's declared target — with zero verification. Attacks: the whole of C1 ("nothing in the lane verifies that a round's seats ran" is replaced by "the lane's own file says it did"). Repro: `node .ufo/waves/round-63/probe/inline63-probe.mjs /tmp/kumitate-r63/K63CriticC1Predicate/fixtures/FD-stub-tool 1ef349f4a663b958930fc69efe5c8bc8bf185fa4 76191e332c97e08c28e95be42ab49c262b67ef8b`.

**K63CriticC1Predicate-2 (high) — the I2 seat count and the CLEAN verdict are the tool's own claim; dead seats never count.** `total += Number(m[1])` (`probe:74`) parses `seats=(\d+)` out of the tool's line; the stub prints `seats=80` while its dispatch has 40 tasks, and I2 accepts it (40 would miss the 64..100 window). I2 passes no `--report`, so `DEAD_UNNAMED` cannot fire: a wave with 36/40 seats never yielding reads `CLEAN (… dead=36)`. Attacks: "each wave has >= 32 seats and the waves' seats sum to between 64 and 100" is not an independent measure, and "every wave … reads CLEAN" does not mean its seats finished. Repro: the two gate lines in Evidence; `probe:69`.

**K63CriticC1Predicate-3 (high) — the transcript binding is defeatable read-only, and it binds nothing to this round/wave/lane.** `scripts/inline-dispatch-evidence.mjs:204,216` matches only a seat-name stem plus `tc.context.slice(0,200)` and `tail(task,120)`, both of which a forger lifts out of the transcript itself; the same 40 real w1 transcripts are accepted as a `w2` wave that never ran, and (FB3) a foreign-lane wave is rejected only because that dispatch happens to lack the `# Seat` marker. No host write is needed, so the plan's stated limit ("a lane that *also writes* faithful transcripts") understates the forgery. Repro: the `--wave w2` gate line above.

**K63CriticC1Predicate-4 (high) — I3 cannot hold at any revision, so C1 is unreachable honestly.** The frozen case `controls/inline/forged-no-sessions` has an empty `sessions/orch`; git drops empty directories, so `git archive` has no sessions root and the gate fails closed with exit 2 `SESSIONS_ROOT_ABSENT` while `expect` names exit 1 `NOT_A_DISPATCH`. Observed on the real lane at b38a206 and on a clean fixture of it: `I3 MISS forged-no-sessions:exit=2 want=1 NOT_A_DISPATCH` → `held=1/6`. Under the kill rule ("any check MISS → the claim fails as declared") C1 is dead at freeze; only the stub route, which supplies its own cases, passes I3. Repro: `node .ufo/waves/round-63/probe/inline63-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin b38a2065ab8ac5b198f6569b9013d04411c3d40d`.

**K63CriticC1Predicate-5 (medium) — I2's honest ceiling is 5/6 today, and its 64..100 window is unreachable for the real wave.** The log has one `spawned kumitate 63 w1 40` and no `done` line, so even the genuine wave reads `DRIFT` (`DONE_LOG_ABSENT`); one wave of 40 seats gives `total-seats=40` regardless of how honest it is. I2 can only hold after w2 is dispatched — which is fine by plan, but it means no wave-level evidence exists yet and the frozen counter cannot distinguish "not yet" from "forged". Repro: the `(b2)` line; `probe:77`.

**K63CriticC1Predicate-6 (medium) — the default sessions root is consulted by I2; a scratch root is not.** `scripts/inline-dispatch-evidence.mjs:52` defaults to `homedir()/.omp/agent/sessions`, and I2 passes no `--sessions-root` (`probe:69`), so hand-written transcripts at the default root read CLEAN (c2, `HOME=fakehome` → `sessions=40 done=40`) while the same scratch root at a non-default path is ignored (c, `sessions=0`). The attack requires writing to the real host store — the plan's admitted limit — but note it is `$HOME`-relative, so any seat process can make a directory the gate treats as the host store. Repro: the `(c)`/`(c2)` lines.

**K63CriticC1Predicate-7 (low) — I5's row shape contradicts the lane's house style.** `probe:119` requires `cells[cells.length-2] === '63'`, i.e. the round must be the last cell (`| cap | desc | cmd | 63 |`); existing capabilities rows end `| round 34 |` (SCORECARD.md:1777), whose cell is `'round 34'`. An honest scribe copying the house style reads `I5 MISS first-working-round=round 63`. Repro: `node -e` split of both row shapes, and the FD build before the row was reshaped (first FD run: `held=5/6 | I5 MISS first-working-round=fabricated row`).

**Answer to the seat question.** Yes: the claim's target is reachable by a do-nothing control (finding -1, 6/6 exit 0), and the cheapest forgery writes nothing outside the repo (finding -3). The one sentence I would change is the plan's **Stated limit**: "a lane that also writes faithful transcripts into the host session store and lines into the orchestrator's log defeats the gate; those two records live outside the repository and the non-author closure re-derives them." → "The probe executes the measured revision's own tool and trusts its stdout, so I1–I4 certify nothing: a 21-line stub holds 6/6. The transcript arm is also defeatable without any host write — the gate matches two strings lifted from the transcript itself — and no check binds a transcript to this round, wave or lane; the only non-author record is the dispatcher log, and the lane picks which log line must match via its own `ready.lane`." Second sentence to change: I2's "each wave has >= 32 seats and the waves' seats sum to between 64 and 100" — it is read from the tool's line and no seat must have finished.

## Artifacts

- `kumitate-shokunin/.ufo/waves/round-63/w1/K63CriticC1Predicate.md` (this report)
- `kumitate-shokunin/.ufo/waves/round-63/build/K63CriticC1Predicate/` — `do-nothing-stub.mjs` (the 6/6 stub), `fixture-lib.mjs`, `make-fixtures.mjs`, `make-replay.mjs` (rebuild every fixture), `probe-table.txt` (raw table), `proposal-rebind.md` (P1–P4 patch text; not applied)
- Scratch fixtures (git repos, own identity, toplevel verified): `/tmp/kumitate-r63/K63CriticC1Predicate/fixtures/{F0-freeze-clean,FA-no-tool,FB-real-tool-invented-seats,FB2-replay-same-wave,FB3-replay-foreign-wave,FC-fake-home-sessions,FD-stub-tool}`

## Limits

- Did not run the probe against the honest tip (there is none); did not dispatch or measure wave w2, and did not check `controls/inline-real-hosts.txt` (other lanes' waves).
- The replay fixture uses this round's own live w1 transcripts (40 stems, harvested read-only); a foreign-lane replay was rejected only because that dispatch text lacked `# Seat`, so cross-lane replay is unproven, not excluded — the gate's code never compares the transcript to a lane/round/wave (`inline-dispatch-evidence.mjs:210-230`).
- I did not test a forger that edits `~/.omp/agent/sessions` itself (finding -6 shows the default root is `$HOME`-relative via a fake HOME instead); no real host store was written.
- C2/T63 not touched. No integration, no freeze edit, no subagents.

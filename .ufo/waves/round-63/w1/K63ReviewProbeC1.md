VERDICT: The frozen I63 counter is forgeable end-to-end — a commit whose gate lies only on the probe's default-path invocations plus two hand-written 40-seat waves and zero host writes reads `INLINE63_HELD held=6/6` — and independently the frozen I3 cannot pass at all on the controls as committed (empty-dir archive loss), so no honest measurement reaches 6/6 either.

## Evidence

All work in `/tmp/kumitate-r63/K63ReviewProbeC1/` + `mktemp -d` git fixtures (throwaway identity, committed only inside fixtures). No host, lane, or frozen file was written. No tool installs (operator 2026-10-19: none needed).

E1 — full forged commit through the frozen probe (fixture `demoE2-IY46`, gate copy patched with one branch that lies iff `--sessions-root`/`--dispatcher-log` are at their defaults — exactly the invocation shape probe line 74 uses for I2 — and stays honest on every overridden path; waves w1+w2 hand-written, 40 seats each, no transcripts; frozen 14 controls copied verbatim + one `.keep` in `forged-no-sessions/sessions/orch/`; SCORECARD row; tip receipt):
```
$ node .ufo/waves/round-63/probe/inline63-probe.mjs $D $M $T
INLINE63_HELD held=6/6 checks=6 rev=8e82833ce9ac6c6272d2d795d4329f5c39f82b51 rule=I63
exit=0        # M=8e82833…, T=a101f9ac248322f263443362416bba886d3d3321
```
Zero seats ran; zero bytes written to `~/.omp/agent/sessions` or the dispatcher log.

E2 — the real gate does bind host transcripts (same forged waves, unpatched gate, defaults):
```
INLINE63_UNMET held=4/6 … | I2 MISS w1:INLINE_DISPATCH: DRIFT (seats=40 sessions=0 done=0 reports=0 dead=0);w2:…;total-seats=0
```

E3 — all-dead wave reads CLEAN with the real gate (fixture, 3 seats, no yield, exit `aborted`, no reports):
```
INLINE_DISPATCH: CLEAN (seats=3 sessions=3 done=0 reports=0 dead=3)   exit=0
```

E4 — real host records, read-only (scratch lane = copy of the real `w1-dispatch.json` + hand-written results, no reports; real sessions root + real log):
```
INLINE_DISPATCH: DRIFT (seats=40 sessions=40 done=0 reports=0 dead=40)
FINDING RESULTS_MISMATCH:<all 40 seats>   # my hand-written rows used agent 'executor'; real roles differ
FINDING DONE_LOG_ABSENT                   # real log has `spawned kumitate 63 w1 40` (line 465) but no done line yet
```
`sessions=40` — every real w1 transcript matched ctxHead+task-tail+seat marker. Only trivially forgeable lane bytes kept this from CLEAN at snapshot time.

E5 — phantom wave: fixture lane with w3 copying w1's dispatch/tasks/reports and w1's transcripts:
```
DEMO_B wave w1: exit=0 line=INLINE_DISPATCH: CLEAN (seats=3 sessions=3 done=3 reports=3 dead=0)
DEMO_B wave w3: exit=0 line=INLINE_DISPATCH: CLEAN (seats=3 sessions=3 done=3 reports=3 dead=0)
```

E6 — frozen I3 broken on the committed controls (archive mode):
```
$ git ls-tree -r --name-only b38a2065ab8ac5b198f6569b9013d04411c3d40d -- .ufo/waves/round-63/controls/inline/forged-no-sessions/
…dispatcher.log, expect, lane/…   # NO sessions/ path: the empty dir is not representable in git
$ node …/inline63-probe.mjs $D(c982a273…) $T   # controls as committed
INLINE63_UNMET held=5/6 … | I3 MISS forged-no-sessions:exit=2 want=1 NOT_A_DISPATCH
# gate: INLINE_DISPATCH: FAIL-CLOSED sessions-root-absent … exit=2
```
With one `.keep` in that case's `sessions/orch/` I3 passes (E1 shows held=6/6 including I3). The committed receipt `controls/inline-receipts.txt` ran worktree mode where the dir exists — archive-vs-worktree discrepancy.

E7 — I5 regex (probe:115-119) on crafted rows: row inside a ```text fence → matched, cell[-2]=63 (passes); honest-convention cell `round 63` → matched but cell[-2]=`round 63` ≠ `63` (would MISS).

E8 — I6 at the default tip (plan marks `[<T>]` optional): `INLINE63_UNMET held=4/6 … | I6 MISS tip-receipt-absent` — a file inside M cannot contain M's own hash.

E9 — antidote probe run (default paths, nonexistent wave): forged gate `INLINE_DISPATCH: CLEAN (seats=0 …)` exit 0 (lie exposed); real gate `FAIL-CLOSED wave-absent … WAVE_ABSENT` exit 2.

E10 — baseline: real gate `--selftest` → `INLINE_DISPATCH_SELFTEST: PASS (25/25)` exit 0; 40 real `K63*.jsonl` transcripts exist under `~/.omp/agent/sessions/-Projects-shokunin/…`.

## Findings

1. **K63ReviewProbeC1-1 (critical — forgery)** I1+I2+I4+I6 accept an invocation-shape-lying gate. Every negative arm in the frozen rule runs on probe/fixture-authored paths (selftest tmpdir, I3 fixture dirs, I4 `T/empty`+`T/empty.log`); the only default-path runs are I2's positive CLEAN runs (probe:74). A gate keyed on `sessionsRoot===default && log===default` (scripts/inline-dispatch-evidence.mjs:42,52 define them) lies exactly there and passes everything else honestly — E1: `held=6/6`, zero seats, zero host writes. Repro: `bash` steps in `/tmp/kumitate-r63/K63ReviewProbeC1/demoE2.sh` (fixture `demoE2-IY46`, M=`8e82833c…`). Close: probe adds default-path negative arms — (a) `--wave no-such-wave` on defaults must exit 2 `WAVE_ABSENT` (E9 shows the real gate passes, the forged gate fails it), (b) scratch-lane copy of a wave with one seat renamed, default sessions root, must read `SESSION_ABSENT` DRIFT.

2. **K63ReviewProbeC1-2 (critical — frozen counter self-defect)** I3 can never pass on the controls as committed: `forged-no-sessions`' empty `sessions/` tree vanishes from `git archive`, the gate fail-closes `SESSIONS_ROOT_ABSENT` exit 2 vs `expect` exit 1 → `I3 MISS` on every honest measurement (E6); the L1's counting command reads 5/6 until the control is repaired (one `.keep`, gate indexes only `*.jsonl`). Frozen-file defect: reported, not patched (draft in build dir). Close: L1 commits the placeholder before any seat scores.

3. **K63ReviewProbeC1-3 (high — claim semantics)** I2 certifies dispatch, not work. The probe's CLEAN regex captures only `seats=` (probe:71); `done`/`reports`/`dead` are unchecked and the probe never passes `--report`, so `DEAD_UNNAMED` cannot fire at counting time. An all-dead wave reads `CLEAN … done=0 reports=0 dead=N` (E3); against real records a hand-written results.json certifies a mid-flight wave (E4: `sessions=40 done=0 reports=0 dead=40`). Gate line 243 makes reports mandatory only for non-dead seats. Close: I2 captures all five counts and requires `sessions==seats && done==seats && reports==seats && dead==0`, or passes `--report` with a committed file naming dead seats and requires `done+dead==seats && reports==done`.

4. **K63ReviewProbeC1-4 (high — forgery, cheaper than the declared limit)** Phantom wave: the gate binds transcripts to seat name + context head + task tail (gate:222-231) but never to the wave; a committed w3 copying w1's dispatch/tasks/reports reads CLEAN (E5). The probe minimal-pairs only `wavesList[0]` (probe:79) and sums seats with no cross-wave name-uniqueness, so w1(real)+w3(phantom)=80 satisfies I2's 64..100 — needing only two dispatcher-log lines, no transcripts: strictly cheaper than the plan's declared limit ("writes faithful transcripts … and lines"). Close: gate asserts the matched user text contains `.ufo/waves/round-${round}/${wave}/` (the task's Report trailer already sits in the tail-120 window); probe requires seat-name disjointness across waves; I4 minimal-pairs every wave.

5. **K63ReviewProbeC1-5 (medium)** I3 checks only case count + `expect` match (probe:96-117), never fixture provenance or content: a forging commit ships 10 self-satisfying cases (E1 copied the frozen 14 only because it was cheaper than authoring). I3 is a regression suite for the honest gate, not an anti-forgery control. Close: committed per-case sha256 manifest verified by the probe, or probe re-runs the deterministic `make-inline-controls.mjs` into scratch and diffs.

6. **K63ReviewProbeC1-6 (medium)** I5's row regex matches inside code fences and any section (E7), and demands exactly `63` while the table's dominant convention writes `round N` (SCORECARD.md:1775-1795: `round 34`, `round 48`; bare `54`/`58`/`59` also occur) — an honest L1 following `sources-registry`'s convention MISSes I5. Close: strip fenced blocks, require the row under `## Capabilities`, accept `63` or `round 63`.

7. **K63ReviewProbeC1-7 (low)** I6 is circular and unsatisfiable at the default tip: the receipt is lane-authored and checked only against I2's own cleanLines (probe:122-128), so it adds nothing a forging gate doesn't control; its real value is binding the receipt to M's hash at a later tip. With `[<T>]` omitted (plan's optional notation) I6 always MISSes (E8). Close: make T mandatory; treat the receipt as an attestation quoted in the close report, not an independent check.

8. **K63ReviewProbeC1-8 (low)** I1 binds only the printed line: a forging gate prints `PASS (N/N)` unconditionally (subsumed by finding 1's antidote). The real selftest has exactly 25 cases (N>=25 boundary, no margin) and silently drops its 4 rev-mode cases when git is unavailable or `toplevel != fixture dir` → honest I1 MISS. Close: default-path negative arm (finding 1) + selftest margin.

What held: the real gate's host binding is real (E2, E4 `sessions=40`); I4's empty arms and I3's expects behave as designed under the honest gate; the declared transcript+log forgery limit stands; the base reads 0/6 (`base/inline63-base.txt`).

## Artifacts

- Report: `.ufo/waves/round-63/w1/K63ReviewProbeC1.md` (this file)
- Ratchet draft for the L1: `.ufo/waves/round-63/build/K63ReviewProbeC1/i63-ratchet-draft.md`
- Scratch: `/tmp/kumitate-r63/K63ReviewProbeC1/{demo.js,demoE-waves.mjs,demoE2.sh,demoE.d,demoE2.d,work/}`; git fixtures `demoE-g1qS` (M=`c982a2732011093f7e517e2fc3455c59be8ff1a8`), `demoE2-IY46` (M3=`8e82833ce9ac6c6272d2d795d4329f5c39f82b51`, T3=`a101f9ac248322f263443362416bba886d3d3321`)

## Limits

- No writes to the real dispatcher log, real sessions root, lane repo (beyond my report/build paths), or any frozen file; fixtures committed only inside `mktemp` repos with throwaway identity.
- The probe was not run against the real lane at a real M (no `w1-results.json` is committed yet; committing one is the L1's act) — finding 3 is proven at gate level (E3, E4) plus the probe regex at probe:71, not with a real-M commit.
- Live wave state moved during work: E4's `done=0 dead=40` is a snapshot (~18:05); seats yield continuously.
- Transcript-format ground truth was taken from the gate's parser and the committed `controls/inline-real-hosts.txt` receipt, not re-derived from the harness source.
- `topology63-probe.mjs` (C2) is out of this seat's scope; untouched.

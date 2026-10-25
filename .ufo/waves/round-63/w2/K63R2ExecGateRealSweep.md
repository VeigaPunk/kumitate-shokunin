VERDICT: All 18 completed inline waves retain their frozen verdicts; round-63 w1 and kengaku r35 build both read CLEAN with exit 0 when run with the requested report arguments.

## Evidence

Sweep: final gate in worktree mode using default session root and dispatcher log, each listed inline-host wave run once. Frozen table: `.ufo/waves/round-63/controls/inline-real-hosts.txt:2-19`. New full table: `.ufo/waves/round-63/build/K63R2ExecGateRealSweep/sweep.md`.

`diff /tmp/kumitate-r63/K63R2ExecGateRealSweep/frozen-verdicts.txt /tmp/kumitate-r63/K63R2ExecGateRealSweep/new-verdicts.txt`:
```
IDENTICAL: 18/18 lines unchanged
```
There are no changed verdict lines to classify; every one of the 18 frozen rows is unchanged (12 DRIFT; the same 6 CLEAN rows: kengaku r35 build/falsify and mori r47 w2; remaining 12 DRIFT). New sweep exit codes: all DRIFT rows exit 1; all CLEAN rows exit 0. Per-wave lines and statuses are in `build/K63R2ExecGateRealSweep/sweep.md`.

Requested gate runs:
```
$ node scripts/inline-dispatch-evidence.mjs --root /home/vgpnk/Projects/shokunin/kumitate-shokunin --round 63 --wave w1 --rev a9531c8e617338fd16cb69c61344ef8f17711117 --report /dev/null
INLINE_DISPATCH: CLEAN (seats=40 sessions=40 done=40 reports=40 dead=0)
EXIT=0

$ node scripts/inline-dispatch-evidence.mjs --root /home/vgpnk/Projects/shokunin/kengaku-shokunin --round 35 --wave build --report /tmp/kumitate-r63/K63R2ExecGateRealSweep/no-seat-names.txt
INLINE_DISPATCH: CLEAN (seats=32 sessions=32 done=32 reports=32 dead=0)
EXIT=0
```
The requested revision resolves to `a9531c8e617338fd16cb69c61344ef8f17711117` (same as lane `master` at inspection). The w1 report arm names no dead seats; `--report /dev/null` therefore produces no `DEAD_UNNAMED` findings. The kengaku report file was empty and names no seats; its measured run has `dead=0`.

Additional exercised check: `node scripts/inline-dispatch-evidence.mjs --selftest` → `INLINE_DISPATCH_SELFTEST: PASS (48/48)`, `SELFTEST_EXIT=0`.

## Findings

1. **K63R2ExecGateRealSweep-1 — no regression detected in the frozen real-host verdict set.** All 18 line comparisons are identical; no gate regression or honest tightening occurred in this sweep. Reproduce by running the 18 rows in `controls/inline-real-hosts.txt` with the worktree gate and diffing against that file's verdict lines.
2. **K63R2ExecGateRealSweep-2 — requested round-63 w1 death-name check passes for the observed wave.** Real revision-mode run found 40 sessions, 40 done, and `dead=0`, with `--report /dev/null`, so there are no dead names to report. Reproduce with command above.
3. **K63R2ExecGateRealSweep-3 — kengaku r35 build report-name run is CLEAN.** Empty report file names no dead seats; output reports `dead=0`. Reproduce with command above.

## Artifacts

- `.ufo/waves/round-63/build/K63R2ExecGateRealSweep/sweep.md` — requested 18-wave table with frozen/new verdicts, exit codes and classifications.
- `.ufo/waves/round-63/build/K63R2ExecGateRealSweep/w1-report-null.txt`, `kengaku-r35-build-no-seat.txt`, `exit-codes.txt` — exact gate outputs/statuses.

## Limits

- Sweep is limited to the 18 waves named by the frozen control file; no other host waves were checked.
- The requested two --report runs and selftest were exercised; no builds, lint, formatters, or other tests were run.
- The run-7 session store and dispatcher log are live external evidence and may change after this measurement.

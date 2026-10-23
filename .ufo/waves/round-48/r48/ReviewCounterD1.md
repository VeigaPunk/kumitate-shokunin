RESULT ReviewCounterD1 verdict=D1_CONFIRMED_REAL c1_frozen_selftests=CLEAR candidate=UNVERIFIED retry_risk=TRIGGER-DEPENDENT

Item: attack the thread-leader exit-2 hole (D1 from attempt-1 `build/ReviewCounter48.md`).
Counter under test: `.ufo/waves/round-48/probe/caproute48-probe.mjs`, sha256
`f24a3af55add0708943526435fde93e02f4ef0c9d4b8e494a9111a5fec890cf2` (re-verified, matches freeze).
Sandbox clone `/fast/scratch/hyaku/kumitate-r48a/seats/ReviewCounterD1/lane` at `fe3d45bf` (detached).
Harness `…/ReviewCounterD1/parsefile.mjs` loads the probe's `parseLog`/`ancestorsOrSelf` verbatim
(source slice before `const [base]`, imports stripped) with `process.exit` trapped.
Host: node v24.21.0 (default fnm binary, no `--experimental-*` flags), strace 7.2, bwrap 0.13.1.
No installs made (none needed — pacman guard honored).

## Finding D1 — MEDIUM; (a) reproduced YES (fail-closed liveness / robustness, no false-score path)

strace 7.2 emits a non-leader-thread execve as a 3-record cluster (real log:
attempt-1 `l2.log`, python `threading.Thread + os.execv`):

```
1554753 execve("/usr/bin/true", ["true"], […]) <pid changed to 1554752 ...>
1554752 +++ superseded by execve in pid 1554753 +++
1554752 <... execve resumed>)           = 0
```

Through the extracted `parseLog` (`logs/s1-leader.log`, faithful minimal form; real `l2.log`):

```
s1-leader.log:      DIE(exit2) unparsed return in execve record of pid 2001: "…<pid changed to 2000 ...>"
l2.log (real):      DIE(exit2) unparsed return in execve record of pid 1554753: "…<pid changed to 1554752 ...>"
s3-resumed-nopending.log: DIE(exit2) resumed execve record with no pending entry for pid 2000
```

Mechanism: the execve record ends `<pid changed to N ...>` with NO `= rv`, so the return regex
`\)\s+= (-?\d+)…$` (probe:173) fails → `die` at probe:174. A hypothetical variant with the return
appended (`s2-leader-resumed.log`) still dies at :174 (`>` ≠ `)` before `=`), so the second die
site (probe:164, resumed-with-no-pending, shown reachable in isolation by s3) is latent but
shadowed. Confirmed: honest-fail only — the run can never be scored or mislabeled.

## (b) Can node-v24 selftests emit this record under `strace -f`? — NO

Live runs, counter's exact flags (`-f -qq -v -s 8192 --decode-pids=pidns -e trace=execve,execveat,clone,clone3,fork,vfork -e signal=none`), from the sandbox clone at `fe3d45bf`:

```
node scripts/round-gate.mjs --selftest    → exit 0, ROUND_GATE_SELFTEST: 61/61 pass, VERDICT: PASS
  rg.log: 13361 lines, 0 "pid changed", 0 "superseded", 0 "+++"; parseLog OK execs=1308 edges=2249 resumed=36
node scripts/surface-probe.mjs --selftest → exit 0, 46/46 cases passed, VERDICT: PASS
  sp.log:  493 lines,  0 "pid changed", 0 "superseded", 0 "+++"; parseLog OK execs=54 edges=241 resumed=0
```

Exec'd targets (observed): `node`, `git` (PATH probes + `/usr/lib/git-core/git`, `git-receive-pack`),
`bash`, `/bin/sh`, `mkdir`. Worker test (`wt.mjs`: `new Worker` + `spawnSync` inside and outside
the worker): 7 CLONE_THREAD edges, 3 execs, 0 `pid changed` records; parses clean.

Important Node-v24 qualification: `process.execve` DOES exist in the default v24.21.0 binary.
However, a direct test from a Worker (`wt-exec-worker.mjs`) throws
`ERR_WORKER_UNSUPPORTED_OPERATION: Calling process.execve is not supported in workers`; no exec
record is emitted. The gate selftests do not call `process.execve`; their fixture commands are
fixed `node -e "…"` strings (surface-probe.mjs:1674-1731), and `runGate` invokes only `--selftest`
(probe:206). The measured selftests emitted no D1 cluster, and all observed exec targets parsed.
Thus answer (b) is NO for these frozen selftests, not a claim that Node v24 lacks `process.execve`
or that a future fixture/native extension could never create the condition.

Separate control: a Worker was confirmed running, then the Node main thread called `process.execve('/usr/bin/true', …)` (`wt-main-exec.mjs`) under the same strace flags. It exited 0, emitted no `pid changed`/`superseded` record, and the extracted parser returned `OK execs=2`; a main-thread `process.execve` with a live Worker is not D1.

`<pid changed>` requires a successful execve ON a non-leader thread of a still-running thread
group. Node's `process.execve` on the main thread is not such an exec; calling it from a Worker is
explicitly unsupported as measured above. `spawn*`/`spawnSync*` instead create a child process,
whose exec is on that process's leader thread. Prior evidence: the inherited stability receipts
show successful parses/runs, but do not independently establish that future candidates cannot
introduce the format.

The C1 candidate commit was not available to this seat. The plan's routing design adds the
cap-run/systemd-run/bwrap chain, but its behavior is not verified here; C1's same-commit score and
re-runs remain the check for that candidate.

## (c) Is C1's verification threatened? — NO score-path threat on the frozen measured surface

Kill rule (plan §C1 / probe:18-19): exit 2 is recorded, never a score. A D1 hit cannot create a
false `held=4/4` or `held=0/4`; it invalidates that invocation for scoring. On the frozen
selftests, part (b) found no hit. A repeat D1 hit could consume an invocation and require another
run, so it is a liveness/re-run risk if the same untested cause persists; the candidate's actual
same-commit score and re-runs must demonstrate enough 4/4 readings.

If it ever fires, `unparsed return in execve record of pid <N>: … "<pid changed to <M> ...>"` is
self-diagnostic — treat it as strace's thread-leader format, NOT as record loss (keeps it distinct
from the ExecRootCause drop hypothesis).

## Residual risk / gaps

- A future selftest fixture, native extension, or candidate change that execs from a worker thread
  could cause exit 2 and consume a run; it cannot silently produce a score via this parser hole.
- Verified here at `fe3d45bf` on one invocation per gate; attempt-1 stability receipts cover
  additional runs at the frozen probe, but do not test the not-yet-available C1 candidate.
- LSP availability checked: `read xd://lsp` returned “No such tool” (only ast_edit/debug mounted); no server was available, so direct reads and empirical runs were used.
- Latent second die site probe:164 (s3) is unreachable while :174 catches the actual format first.
  No probe change recommended (counter is frozen).

Report: .ufo/waves/round-48/r48/ReviewCounterD1.md


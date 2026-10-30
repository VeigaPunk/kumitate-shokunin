# K70ReviewCounterR3 — C1 donothing behavioral requirement and cleanup predicate

Seat: K70ReviewCounterR3 (reviewer, leaf). Scope: c1 donothing replay behavior and the R3 cleanup predicate (`fs.readdirSync(work).length===0`, receipt preserved, `LEDGER69_UNMET` + `CONTROL-PASS donothing`). Frozen plan and counter were read, not edited.

## Verdict

One concrete operability defect with observed evidence, plus one cleanup defect on the timeout path. Neither is waived. The frozen counter is not amended.

## Frozen bytes verified (positive)

- `plan.md`: last commit touching the file is `3dbe7e6e2616423d55f0ea2bbcf8fb32fe7bda6a` (matches the frozen plan hash in the assignment; `git log -1 -- .ufo/waves/round-70/plan.md`). Working-tree sha256 `e518567d74e1cdfb62b53478486a021dd224cc873cd5ea3c7b5a6d4a9394744b`; `git hash-object` blob `65332006bea147e8750ed76d0f771633608a4f4e`. Not compared against the commit's blob beyond these two observations.
- `git show 78b98d76:.ufo/waves/round-69/probe/c1-controls.sh | sha256sum` = `01efd6dde4c987b676b1930f647cc283768e1ae8113fd076b313e54b56aeda12`; `c2-controls.sh` = `679b7d9619ab8d79139cfe8e956e425f7ccbbf7e58b6eaee5cb72c3deb3a66f4`. Both equal the `FROZEN` pins in `K70ExecRunner/scripts/control-replay.mjs`.
- Base reproduction: `TMPDIR=<scratch> node .ufo/waves/round-70/probe/replay70-probe.mjs <lane> 78b98d76…` printed `REPLAY70_UNMET held=2/10`, R3 `MISS family=c1 mode=donothing exit=1 receipt=0 preserved=true`, matching the frozen `base/replay70-base.txt`. Probe exit 1. Scratch left empty.
- Frozen tool pin: `scripts/routed-ledger.mjs` sha256 `05aacb5e…` equals the round-69 pin and `git show 78b98d76:scripts/routed-ledger.mjs`.

## Finding 1 (high, operability): replay budget is shorter than the real c1 donothing run

Observed:
1. Donothing fixture built by hand with the frozen c1 recipe (copy of the tool, spot-checks 55–66, SKILL/QUALITY/SCORECARD stubs, empty ledger, one git commit `b5df0e8b…`). Measured the frozen counter directly:
   `time env TMPDIR=<T> node .ufo/waves/round-69/probe/ledger69-probe.mjs <fx> b5df0e8b…`
   → real 5m37.2s, user 12m47.9s, sys 5m44.5s. Receipt: `LEDGER69_UNMET held=5/7 … | L2 MISS … | L3 MISS …`. Copy in `build/K70ReviewCounterR3/timing/`.
   Host load during the run: 9–19 on 32 cores (other seats active), so this is a contended sample, n=1.
2. Candidate selftest (`node .ufo/waves/round-70/build/K70ExecRunner/scripts/control-replay.mjs --selftest`, run before the candidate was edited at 12:43:40): `CONTROL_REPLAY_SELFTEST: FAIL cases=9 ok=8`; `ST08-c1-donothing expect=0 observed=-1 FAIL receipt=0B work-empty=false 280102ms`. The other eight cases passed (ST01–ST07, ST09). Copy in `build/K70ReviewCounterR3/selftest-observed.txt`.

Code pointers:
- Candidate budget: `RUN_TIMEOUT_MS` was `280000` when I ran the selftest (ST08 timed out at 280102 ms, which matches). The current file (sha256 `61f6e0e0…`, 401 lines, mtime 12:43:40) reads `RUN_TIMEOUT_MS = 299000` at line 35. Still below the 337 s measured above.
- Frozen counter: `replay70-probe.mjs` line 20: `spawnSync(... {timeout:300000})` for each R3–R7 run. R3–R7 need `r.status===0`; a spawn timeout yields `status=null` → MISS. With a 337 s donothing run this is a MISS on this host under the observed load.
- Predicate consequence: R3 cannot pass on a host that takes more than 300 s for the frozen donothing probe. R4–R7 (autoledger, the c2 modes including live forgecapture) were not timed.

Assessment: the probe's CPU cost is intrinsic (about 12.8 CPU-min per donothing run), not caused by the runner. The runner adds no measured overhead beyond the probe. A 10/10 HELD needs either an uncontended timing sample under the frozen 300 s bound, or an honest R3–R7 MISS recorded as such. I cannot choose between them. Recommend L1 measure on a quiet host before scoring and disclose the contended sample if it is the only one.

## Finding 2 (medium, cleanup on the timeout path): work child and orphan grandchildren survive a budget overrun

Observed:
- After the ST08 timeout, `control-replay-selftest-Cjh0g8/ST08/work/control-replay-ocAv79/tmp` remained under the scratch selftest root (`ls -la` showed an empty `tmp`, created 12:34). The selftest's own `finally { rmSync(root) }` did not remove it; the selftest still exited 1 and printed FAIL. I did not capture the exception from that cleanup. Inference: the root `rmSync` raced a live probe grandchild still writing into `tmp`.
- During the window, the `bash` private child and the `node ledger69-probe.mjs` grandchildren ran past the parent's timeout. `spawnSync` with `timeout` sends SIGTERM only to the direct child (`bash`), not to the `node` grandchild.
- Both the selftest's outer `sub()` timeout and the inner `runControl` `RUN_TIMEOUT_MS` were the same value (280000 ms at the time). The outer timer fired first, so `runControl`'s `finally` never ran and the child was left behind. This matches `work-empty=false` in ST08.

Consequence: on the timeout path the cleanup predicate (R3 `readdirSync(work).length===0`) cannot hold, and orphan probes can keep writing for minutes. These orphans were visible at 12:45 (`K70ExecRunner` processes, not mine; my `ocAv79` grandchild had exited by then).

Suggested repair direction (for the candidate owner, not applied by me): run the private bash in its own process group and kill the group on timeout; make the outer selftest timeout strictly larger than the inner one; reclaim the child with a retry on `ENOTEMPTY`, or after the group is confirmed dead.

## Finding 3 (process): candidate changed during review

`control-replay.mjs` was edited at 12:43:40 (after my selftest run). Its current sha256 is `61f6e0e0…` and it has 401 lines (was 380 at my first read). The timeout changed from 280000 to 299000. I have not re-run the selftest against the current bytes; my ST08 finding applies to the earlier version. Any verification must be re-run on the final bytes.

## Observations not forming a defect

- R3 label: the c1 donothing receipt contains `LEDGER69_UNMET` and the runner's `tee` tail is present, so the label and `CONTROL-PASS` checks are satisfiable.
- Held-count gap: my donothing receipt reports `held=5/7` (L2 and L3 MISS); the frozen `base/c1-donothing.txt` reports `held=2/7` at rev `a4fe6ed0`. The tool sha matches the pin, so the difference comes from fixture or revision, which I did not isolate. The do-nothing claim (UNMET) holds in both. Not a defect for R3.
- c2 family: not timed. Forgecapture is live and network-dependent; no measurement made.

## Commands and outcomes (observed)

- `sha256sum` / `git show 78b98d76:…/c1-controls.sh|c2-controls.sh` → hashes equal candidate pins.
- Base probe run → `REPLAY70_UNMET held=2/10 … exit=1`.
- `node control-replay.mjs --selftest` (bg, 280.5 s) → `FAIL cases=9 ok=8`, ST08 observed -1 at 280102 ms.
- ledger69 probe timed on the donothing fixture: 5m37.2s real, `LEDGER69_UNMET held=5/7`.
- `sha256sum` of the candidate: `61f6e0e0…`, 401 lines; `RUN_TIMEOUT_MS = 299000` at line 35.

Harness note: the tool auto-backgrounded the selftest and both timing runs (bg_7422, bg_7481, bg_7523). I did not start background jobs deliberately. Nothing was installed. No commits, pushes, or mutating git. The original `c1-controls.sh` and `c2-controls.sh` were never executed. No production file or other seat's artifact was modified. My scratch `/fast/scratch/hyaku/kumitate-r70/K70ReviewCounterR3/` was removed.

## Residual risk and verification gaps

- No uncontended timing of the donothing probe; one sample at load 9–19.
- Candidate final bytes not tested (edited mid-review).
- R4–R7 and c2 not timed; forgecapture network arm not exercised.
- Orphan-process behavior verified only by the single ST08 timeout.

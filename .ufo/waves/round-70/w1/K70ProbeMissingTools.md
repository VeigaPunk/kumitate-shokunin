# K70ProbeMissingTools — round-70 w1 seat report

- Seat: K70ProbeMissingTools (executor, leaf) — milestone ProbeMissingTools, axis operability (C1 replay isolation)
- Frozen plan read: `.ufo/waves/round-70/plan.md` (freeze 3dbe7e6e2616423d55f0ea2bbcf8fb32fe7bda6a); base receipt `.ufo/waves/round-70/base/replay70-base.txt` (REPLAY70_UNMET held=2/10); lessons `corpus/lessons/round-70.md`; frozen r69 controls read-only.
- Verdict: **probe complete, 14/14 axes held — all four tools fail closed under the contract-shaped mechanism; candidate `scripts/control-replay.mjs` is ABSENT at base, so every run below is a mechanism-only synthetic reproduction, not candidate verification.**
- Artifacts: `.ufo/waves/round-70/build/K70ProbeMissingTools/` (probe + synth models + receipts). Scratch `/fast/scratch/hyaku/kumitate-r70/K70ProbeMissingTools/` created, used, and deleted before yield.

## Candidate availability (observed)

```
$ ls /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/control-replay.mjs
ls: cannot access '.../scripts/control-replay.mjs': No such file or directory
```

No seat may write production paths; per instructions I ran a synthetic reproduction of the edge, labeled mechanism-only. Originals `c1-controls.sh` / `c2-controls.sh` / `replay70-probe.mjs` were read but never executed.

## Axes

For each tool T ∈ {tar, git, bash, node} × {present = negative control, absent = fail-closed test}, at two levels:

- **Level A — predicate-shaped chain**: `git -C FX archive HEAD controls | tar -x -C DEST` (models the probe's archive|tar extraction).
- **Level B — contract-shaped replay driver**: synthetic `driver-checked.mjs` implementing the implementation-contract mechanisms (frozen-byte pin + refusal, single substitution of LANE/PROBE/W/S, removal of the unused fixed temporary write `touch "$W/.fixed-unused-tmp"`, scrubbed `GIT_*` env, explicit `git -C`, unique mkdtemp work child, exclusive `wx` output, receipts copied out before cleanup, exit 64 usage / 70 tool-spawn refusal / 73 frozen mismatch / 74 substitution count / 75 existing output). `driver-unchecked.mjs` is the naive fail-open twin (ignores spawn anomalies) used to prove the probe discriminates.

Tool absence is simulated with per-case PATH shim dirs (symlinks to `/usr/bin` + node's real dir, minus exactly one tool). Fixture: tiny synthetic git repo in scratch (explicit `git -C` only; `git rev-parse --show-toplevel` asserted == fixture before first commit; `GIT_*` env scrubbed).

## Observed commands and outcomes

Probe run (cwd = own scratch):

```
$ node .../build/K70ProbeMissingTools/probe-missing-tools.mjs     # HARNESS-EXIT=0
CASE B-nc-donothing: exit=0 out=231B unmet=true pass=true reclaimed=true leak=false
CASE B-nc-autoledger: exit=0 out=233B unmet=true pass=true reclaimed=true leak=false
CASE B-nc-invalid-args: exit=64 (expect 64)
CASE B-miss-bash: exit=70 out=none reclaimed=true leak=false
CASE B-miss-git: exit=70 out=none reclaimed=true leak=false
CASE B-miss-node: exit=null err=ENOENT out=none reclaimed=true leak=false
CASE B-miss-tar: exit=0 out=231B unmet=true pass=true reclaimed=true leak=false
CASE B-miss-bash-existing-out: exit=70 out=17B(preexisting bytes) kept=true
CASE B-naive-miss-bash: exit=0 out=36B        # naive twin: writes a receipt anyway
CASE B-naive-miss-git: exit=0 out=31B
CASE A-nc-full: exit=0 extracted=true
CASE A-miss-tar: exit=127 extracted=false
CASE A-miss-tar-ignoreexit: exit=0 extracted=false   # swallowed-status variant
CASE A-miss-git: exit=2 extracted=false
fixture frozen bytes unchanged: true
PROBE_MISSING_TOOLS: ALL-AXES-HELD (14/14)
```

Selftest of the contract-shaped driver (hermetic substitution/frozen-refusal check):

```
$ node .../synth/driver-checked.mjs --selftest
SYNTH_DRIVER_SELFTEST: PASS     # SELFTEST-EXIT=0
```

Negative-control receipt (`receipts/B-nc-donothing.out.txt`): `SYNTH69_UNMET held=0/2 ... control=donothing exit=1 ... CONTROL-PASS donothing` — the do-nothing control stays UNMET with exit 1, and the driver converts it to an honest receipt. Naive-miss-bash receipt is `naive-driver exit=null error=ENOENT` with driver exit 0 — the exact fail-open pattern (exit 0 + output file despite missing tool) that the checked model refuses.

## Verdicts (14/14 held)

| id | expectation | observed |
|---|---|---|
| B-miss-bash / B-miss-git / B-miss-node | fail-closed: exit≠0, no `--out`, work child reclaimed, no fixed-tmp leak | exit 70 / 70 / spawn ENOENT, no output, reclaimed |
| B-miss-tar | tar is not a driver-level dependency (honest positive) | exit 0, valid receipt |
| B-nc-donothing / B-nc-autoledger | negative control: exit 0 + UNMET receipt + CONTROL-PASS + reclaimed + no leak | held |
| B-miss-bash-existing-out | existing output bytes preserved under refusal (R9-shape) | exit 70, sentinel bytes intact |
| B-naive-miss-bash / B-naive-miss-git | naive twin fails open → probe discriminates | exit 0 + receipt written |
| A-miss-tar | pipefail chain fails closed | exit 127, nothing extracted |
| A-miss-tar-ignoreexit | swallowed status + no content check = silent pass (fail-open mechanism) | exit 0, dest empty |
| A-nc-full / A-miss-git | extract ok / git absence fails closed | exit 0 / exit 2 |
| B-nc-invalid-args | usage exit 64 | 64 |

## Findings for the replay implementation contract (mechanism-only, not candidate verification)

1. **bash/git absence must be converted, not propagated.** spawn anomalies surface as `error=ENOENT, status=null` (node) or non-zero control status. A conformant driver checks `r.error || r.status !== 0` and refuses (here: exit 70, no receipt, work child still reclaimed). The naive twin shows the fail-open shape: exit 0 + receipt file containing only the error text.
2. **node absence is fail-closed at the OS boundary** (exec 127/ENOENT); the contract-relevant requirement is on the *caller* to treat a missing/broken driver binary as failure, never as a vacuous pass.
3. **tar absence is invisible at driver level** (the contract-shaped driver uses no tar) but breaks the predicate-level `git archive | tar -x` chain. `set -o pipefail` makes it fail closed (127, nothing extracted). If an implementation ever swallows the chain's exit status without content-verifying the extracted tree, tar absence passes silently (demonstrated: exit 0, empty dest). Content checks (label/byte verification of receipts and extracted files), which the real predicate already applies (`text.includes(label)`), are the load-bearing defense; exit status alone is not.
4. **Private-output substitution must not place S inside the driver's own materialization dir**: the synthetic control's `rm -rf $S` initially deleted the driver's private probe/script copy (first probe iteration: all driver cases exit 70). Substituting S to a dedicated run/ child of the mkdtemp work dir fixed it. A conformant `control-replay.mjs` should keep its materializations outside the control's scratch root.
5. **Removal of the unused fixed temporary write is observable**: no `.fixed-unused-tmp` appears in any work child or the fixture, while the frozen original retains the line.
6. Existing-output refusal and frozen-byte refusal (codes 75/73) compose with tool absence: the refusal path leaves pre-existing bytes untouched.

## Environment / tooling record

- node v24.21.0 (fnm shim `/run/user/1000/fnm_multishells/.../bin/node`), git 2.56.0, GNU tar 1.35, bash 5.3.20 — all preinstalled.
- Installs/updates: **none** (no tool needed installing; pacman paused per seat rules; no host service restarts).
- Frozen counter bytes untouched (fixture is synthetic; lane/fleet trees read-only; no git/jj mutations anywhere in the lane — only the scratch fixture repo was committed to, with explicit `git -C` and toplevel assertion).
- Scratch `/fast/scratch/hyaku/kumitate-r70/K70ProbeMissingTools` fully removed after receipts were copied to `build/K70ProbeMissingTools/receipts/`; verified absent (`ls: cannot access ...`).

## Receipts inventory (build/K70ProbeMissingTools/receipts/)

- `probe-missing-tools.json` — full case matrix with commands, PATH states, exits, spawn errors, output stats, verdicts.
- `probe-missing-tools.log` — verbatim run log quoted above.
- `B-nc-donothing.out.txt`, `B-nc-autoledger.out.txt` — negative-control receipts.
- `B-naive-miss-bash.out.txt`, `B-naive-miss-git.out.txt` — fail-open evidence.
- `B-miss-bash-existing-out.out.txt` — preserved sentinel `do-not-overwrite`.

## Risks / limits

- Mechanism-only: the real `scripts/control-replay.mjs` did not exist at base, so no claim is made about the eventual candidate; the probe is rerunnable against a private copy by pointing Level B at it once L1 lands it.
- The synthetic frozen control is my own minimal work product shaped like the r69 controls (SYNTH69 labels), not derived bytes from the frozen controls.
- `B-miss-node` records `exit=null (spawn ENOENT)` — the shell-equivalent is 127; both mean "driver binary unavailable", which the caller must treat as failure.

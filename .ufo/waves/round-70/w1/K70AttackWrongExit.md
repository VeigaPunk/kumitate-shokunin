# K70AttackWrongExit — round-70 C1 replay, wrong-exit edge

Seat: K70AttackWrongExit (attack, leaf). Lane: /home/vgpnk/Projects/shokunin/kumitate-shokunin. Frozen plan read: `.ufo/waves/round-70/plan.md`. Frozen probe read: `.ufo/waves/round-70/probe/replay70-probe.mjs`. Candidate `build/K70ExecRunner/control-replay.mjs` was NOT present when inspected (`build/` held only `K70ExecFixtureTests/` with empty subdirs), so I attacked the contract and the frozen counters directly. Originals `c1-controls.sh` / `c2-controls.sh` were read, never executed.

## Verdict

**Defect in the frozen predicate (cannot be fixed by amendment; freeze consequence below).** REPLAY70 R3–R7 accept whatever the wrapper's exit code is, provided the wrapper exits 0 and its receipt contains the UNMET label and `CONTROL-PASS <mode>`. The probe never reads the counter's exit code. Therefore a wrapper that ignores the counter exit code and accepts counter exit 2 (`UNMET … | ENV_POISONED`) scores **REPLAY70_HELD 10/10**. A wrapper that enforces the r69 contract (label AND exit 1) scores **REPLAY70_UNMET 5/10** under the same environment. The only backstop for exit-map correctness is R2 (selftest), which checks only that a line `CONTROL_REPLAY_SELFTEST: PASS` appears with exit 0.

## Frozen counter exit facts (observed, read-only runs)

| counter path | input | stdout first line | exit |
|---|---|---|---|
| `.ufo/waves/round-69/probe/ledger69-probe.mjs` | `NODE_OPTIONS=--no-warnings`, rev 78b98d76 | `LEDGER69_UNMET held=0/7 … rev=unknown … \| ENV_POISONED:NODE_OPTIONS` | **2** |
| `.ufo/waves/round-69/probe/deprec69-probe.mjs --no-live` | same | `DEPREC69_UNMET held=0/11 … \| ENV_POISONED:NODE_OPTIONS` | **2** |
| `ledger69-probe.mjs` | rev `0000…0000`, clean env | `LEDGER69_UNMET … rev=0000… \| rev-unreadable` | **2** |

Source: both counters emit UNMET on exit 2 by design (ENV_POISONED preamble; rev-unreadable; archive/EXTRACTION_UNSAFE). Exit 1 = UNMET normal; exit 0 = HELD only. Per r69 receipts, normal live/no-live runs exit 1. So "UNMET text + exit 2" is a reachable, designed state, reachable from an ordinary operator shell with `NODE_OPTIONS`, `LD_PRELOAD`, `GIT_DIR`, etc. set (POISON list in `ledger69-probe.mjs` line ~56).

## Counterexample 1 — frozen probe scores a false HELD (runnable, observed)

Isolated fixtures in scratch (`/fast/scratch/hyaku/kumitate-r70/K70AttackWrongExit/`), each a git repo with `git -C FIXTURE` only; `show-toplevel` verified before commit (`…/fx-sloppy`, `…/fx-strict`). Each fixture = `git archive 78b98d76` plus `scripts/control-replay.mjs` (mutant) plus SKILL/SCORECARD row and a pins file with the mutant's sha256. Object store read via `.git/objects/info/alternates` pointing at the lane's object dir (read-only sharing; no clone, no lane write).

- `sloppy-control-replay.mjs`: runs the frozen counter, accepts when first line starts with the label, never consults `status`. Selftest prints a PASS line.
- `strict-control-replay.mjs`: identical except accept only when `label && status === 1`.

Commands observed (env poisoned exactly as the counter checks it):

```
env NODE_OPTIONS=--no-warnings TMPDIR=$S/tmp node <lane>/.ufo/waves/round-70/probe/replay70-probe.mjs $S/fx-sloppy 593c710457c9069e70b9e0daabcc624f69479dfe
env NODE_OPTIONS=--no-warnings TMPDIR=$S/tmp node <lane>/.ufo/waves/round-70/probe/replay70-probe.mjs $S/fx-strict 285542678a528c4f4d8bb33dcf73bb202f9063c4
```

Observed, sloppy (exit 0):
```
REPLAY70_HELD held=10/10 checks=10 rev=593c7104… rule=R70 live=no-live(vacuous-declared)
R1 PASS … R2 PASS isolated selftest
R3 PASS family=c1 mode=donothing exit=0 receipt=120 preserved=true
R4 PASS family=c1 mode=autoledger exit=0 …
R5 PASS family=c2 mode=donothing exit=0 …   R6 PASS … R7 PASS family=c2 mode=forgecapture exit=0 …
R8 PASS  R9 PASS  R10 PASS
```
Observed, strict (exit 1):
```
REPLAY70_UNMET held=5/10 checks=10 rev=2855426… rule=R70
R1 PASS R2 PASS
R3–R7 MISS family=… exit=1 receipt=… preserved=true
R8 PASS R9 PASS R10 PASS
```
Receipts: `build/K70AttackWrongExit/receipts/probe-{sloppy,strict}-poisoned.txt`, mutant sources: `build/K70AttackWrongExit/mut/`.

The probe's own `exit=…` in R3–R7 is the wrapper's status, so a wrapper hiding a counter exit 2 is indistinguishable from a correct PASS. Note `R3 … exit=0` in the sloppy receipt while the counter returned 2 (I confirmed the counter's exit 2 directly above).

## Counterexample 2 — inherited `RC` in the r69 `|| RC=$?` idiom (latent; replica only)

`build/K70AttackWrongExit/mut/rc-idiom-wrapper.sh` is an isolated copy of the r69 `c1-controls.sh` exit tail (not the original file) with `mock-counter.sh` (hypothetical UNMET-with-exit-N). Observed:

```
[a] clean env,      counter exit 0  -> CONTROL-FAIL  wrapper_exit=1   (correct)
[b] RC=1 inherited, counter exit 0  -> CONTROL-PASS  wrapper_exit=0   (WRONG)
[c] RC=1 inherited, counter exit 2  -> CONTROL-FAIL  wrapper_exit=1   (correct; RC overwritten)
[d] clean env,      counter exit 1  -> CONTROL-PASS  wrapper_exit=0   (expected)
[e] clean env,      counter exit 2  -> CONTROL-FAIL  wrapper_exit=1   (correct)
[f] RC=2 inherited, counter exit 1  -> CONTROL-PASS  wrapper_exit=0   (correct; RC overwritten)
```

Mechanism: `node … || RC=$?` leaves `RC` untouched on counter exit 0, so an inherited `RC=1` in the environment turns a success into a PASS. The original scripts are not affected by an *operator* RC unless one is exported, but a generated private copy (which the candidate's `control-replay.mjs` produces) inherits `process.env`; the plan says scrub only "inherited repository environment". **Impact now: none with the frozen counters** — they never print UNMET with exit 0, so the reachable outcome is exit 1 or 2. It is a latent defect that becomes live if a counter ever prints UNMET on exit 0. Fix would be `RC=0; … || RC=$?` or `unset RC` in the generator; I did not change any frozen bytes.

## Secondary observations (code-read; not executed)

- R2 checks only `status===0` and a `CONTROL_REPLAY_SELFTEST: PASS` line. My sloppy selftest prints that line unconditionally and R2 PASSes (observed). The predicate therefore cannot verify that the selftest covers the exit map.
- R3–R7 test `text.includes(label)` anywhere in the receipt, not the first line. The original controls key on `head -1`. A receipt carrying the label on a later line passes the probe while failing the original contract.
- `live` header label is taken from candidate-written receipt text (`text.includes('live=exercised')`), not from the counter. A wrapper can print `live=exercised` into the REPLAY70 header. Not executed; code-read of `replay70-probe.mjs` only.
- The probe runs R3–R7 with the inherited environment. With a clean environment both mutants would probably pass R3–R7 (counters exit 1), so the sloppy defect is only visible under an exit-2 state. Not executed: unpoisoned full run (live forgecapture would need network and was not run).

## Freeze consequence (exact)

- Plan says "Counter code is normative" and "Frozen … remain unchanged", and does not allow predicate amendment after scoring. Therefore the probe **must not be edited**. The R3–R7 criterion, as frozen, does not bind the counter exit code. Any REPLAY70_HELD result is only as trustworthy as the candidate wrapper's exit handling, which the frozen predicate does not measure.
- Consequence for scoring/closure: a HELD 10/10 from a wrapper that does not test `status===1` (or `status===0`-only checks) is a **false HELD** and must be rejected on inspection. Non-author closure must confirm by reading the candidate's `control-replay.mjs` that: (a) label on `head -1` AND counter exit exactly 1 are required; (b) exit 2 and exit 0 with UNMET text produce CONTROL-FAIL; (c) `RC` (or equivalent) is reset or scrubbed in the generated copy; (d) the selftest actually exercises exit-2 and exit-0 negative cases.
- Recording: report the R3–R7 limitation alongside the score. Do not present HELD 10/10 as proof of exit-map correctness.
- Limit disclosed: the candidate `build/K70ExecRunner/control-replay.mjs` was absent, so I could not test the real candidate. All results above are for the frozen probe and frozen counters, plus my mutants.

## Commands and tooling

- Tooling: no installs. Used existing `node v24.21.0` (`/run/user/1000/fnm_multishells/…/bin/node`) and bash. No pacman, no host service changes, no writes to `~/.local/bin`.
- Lane writes: none. Lane reads: `git -C LANE archive`, `git -C LANE show`, `git -C LANE ls-tree`, `git -C LANE rev-parse`; the frozen counters executed read-only from the lane path with `TMPDIR` in scratch.
- Fixture git: all `git -C $F …`, toplevel verified (`…/fx-sloppy`, `…/fx-strict`), commits `593c7104…` (sloppy) and `28554267…` (strict) inside the fixtures only.
- Original `c1-controls.sh` / `c2-controls.sh` were not executed. Frozen probe `replay70-probe.mjs` was executed, read-only, against scratch fixtures.
- Scratch cleanup: performed after this report (fixtures, `rc/`, `tmp/`, mutant copies in scratch removed; durable copies in `build/K70AttackWrongExit/`).

## Not run / unrun

- The real candidate `control-replay.mjs` (absent).
- Unpoisoned R3–R7 with live forgecapture (network; not run).
- The `live=exercised` header spoof (code read only).
- Any counter run with the originals `c1-controls.sh` / `c2-controls.sh` (forbidden; not run).

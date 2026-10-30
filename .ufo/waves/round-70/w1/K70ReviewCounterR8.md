# K70ReviewCounterR8 — round 70, C1 replay isolation (operability)

Scope: review only invalid-args usage-64 (R8) vs fail-closed (R2 selftest as backstop; R9 adjacent). Review of the frozen counter `probe/replay70-probe.mjs` and the plan contract for `scripts/control-replay.mjs`; plus an isolated fixture demonstration. No production file touched, no other seat's artifact touched, no commit, no push, no git mutation in the lane, no originals executed.

## Verdict

The R8 check is a single-probe, exit-code-only test. Two bounded weaknesses are confirmed against the frozen counter with a mock candidate: (1) an invalid-args run that mutates state before exiting 64 still yields R8 PASS and a 10/10 HELD; (2) invalid-arg shapes other than exactly `['--family','junk']` are unconstrained by the predicate, and the only breadth mechanism (the selftest "expected exit maps") is self-attested under an R2 banner grep. The 64 convention itself is coherent and consistently modeled. Findings below; no counter change is proposed (frozen; predicate must not be amended after scoring).

## Findings

### F1 — R8 checks only the exit code, not that the invalid-args run was side-effect-free (confirmed by fixture)
- Counter line 36: `check('R8',invalid.status===64,'invalid args usage')`. Only `invalid.status` is examined. stdout/stderr are ignored, and no filesystem state is asserted after the run.
- The invalid run executes with cwd = the extracted archive tree and no `--work`/`--out` (probe lines 12, 36). A tool that validates *after* touching the filesystem — creating files in cwd, or writing anywhere its privileges reach — still exits 64 and R8 PASSes. No other check detects this: the only side-effect terms in the predicate are the R3–R7 work-dir reclaim (`fs.readdirSync(work).length===0`, line 34, valid runs only) and the R9 out-file hash (line 39). There is no post-R8 tree-cleanliness assertion anywhere.
- Demonstrated (isolated fixture, frozen counter copy sha-identical): a mock candidate whose `--family junk` path writes a marker and a cwd-pollution file *before* `process.exit(64)` produced `REPLAY70_HELD held=10/10`, `R8 PASS invalid args usage`, with the external marker `invalid-args run performed a write before exit 64` present after the run. Receipts: `build/K70ReviewCounterR8/counter-run.txt`, `r8-observed.txt`, `control-replay.mock.mjs.txt`.
- Severity: medium (operability). A HELD run does not certify that refusal paths are fail-closed; a candidate with a mutate-then-refuse bug in argument handling scores 10/10.

### F2 — R8 is a single probe point; all other invalid shapes are predicate-unconstrained (confirmed by fixture)
- Counter line 36 passes exactly `['--family','junk']`. Missing `--lane`/`--mode`/`--out`/`--work`, unknown `--mode`, unknown/duplicate flags, `--selftest` combined with junk, non-directory `--lane` — none are exercised live.
- Demonstrated with the same mock: `--family c1` (all else missing) → exit 0; `--family c1 --mode bogus --out NEW --work DIR` → exit 0 and a receipt file written containing `CONTROL-PASS bogus`. The frozen counter still reported `held=10/10` for this mock. Receipt: `build/K70ReviewCounterR8/unprobed-bogusmode-out.txt`.
- The only fail-closed breadth the contract provides is plan.md's "Selftest is hermetic, with stable finding ids and expected exit maps" — but R2 (counter line 26) verifies only `status===0` plus a `CONTROL_REPLAY_SELFTEST: PASS` banner on stdout. The exit map's *content* is self-attested by the candidate: a candidate whose selftest omits usage-64 cases (or asserts them loosely) still PASSes R2, and then nothing else constrains invalid-args handling beyond the one live probe of F1/F2.
- Severity: medium (operability). Bounded by the plan's own framing ("ten bounded replay obligations"); recorded as a limit, not a predicate defect.

### F3 — bounded justification: the 64 convention and fail-closed directions are coherent (no defect)
- Counter line 9 models the same convention for itself: `process.exit(64)` on missing lane/bad rev. R8's expectation of 64 is therefore internally consistent, and matches the r69 originals' usage-exit style (c2-controls.sh `*) echo "unknown mode $MODE"; exit 64`).
- All failure directions around R8 fail closed: tool crash → exit 1/2 ≠ 64 → MISS; spawn timeout → `status===null` → MISS; wrong refusal code → MISS. The counter itself only exits 0 at exactly `held===10` (line 46) and 2 on internal error (line 47).
- R2+R8 division of labour is reasonable for a bounded predicate: selftest = breadth, R8 = one live spot-check. The observation in F2 is about the *self-attested* nature of that breadth, not the design.

### Candidate guidance (not a predicate change)
For L1/K70ExecRunner when the candidate lands: the selftest's expected exit map should cover the invalid-arg matrix (each missing required flag, unknown family, unknown mode, unknown/duplicate flags, `--selftest` with extra args) expecting exactly 64, and argument validation must complete before any filesystem mutation. R8 will not catch either omission on its own.

## Commands and outcomes observed

- `read` of `~/.omp/agent/RULES.md` (tooling directive; no installs made, no pacman).
- `read` of `.ufo/waves/round-70/plan.md`, `probe/replay70-probe.mjs`, `base/replay70-base.txt` (`REPLAY70_UNMET held=2/10`), `base/freeze-map.txt` (`README_MAP: CLEAN`), `round-69/probe/c1-controls.sh`, `round-69/probe/c2-controls.sh` (read-only; originals never executed), `corpus/lessons/round-70.md`.
- `git clone` of the lane into `/fast/scratch/hyaku/kumitate-r70/K70ReviewCounterR8/fx-lane` (one clone); `git -C <fx> rev-parse --show-toplevel` asserted equal to the fixture before the first commit.
- Wrote mock `scripts/control-replay.mjs` in the fixture only (side-effecting `--family junk` → 64; unprobed shapes → 0; selftest banner; `wx` exclusive out; label/CONTROL-PASS greps for R3–R7), plus `| control-replay |` rows in fixture SKILL.md/SCORECARD.md and a matching `counter-pins.json` entry. Fixture commit `02556f02…`.
- Copied the frozen counter byte-for-byte; `sha256sum` = `63f52b75d9c0e3d80a91c6957ce4624cbd46a9488841a962a75bc62ffecbf0c1`, identical to the live frozen file before and after.
- Ran: `TMPDIR=<scratch>/tmp R8_OBSERVE=<scratch>/r8-observed.txt node <copy> <fx-lane> 02556f02…` → counter exit 0, `REPLAY70_HELD held=10/10`, R1–R10 all PASS, `R8 PASS invalid args usage`; marker file present with `invalid-args run performed a write before exit 64`.
- Direct mock probes: `--family c1` → exit 0; `--mode bogus` full-shape → exit 0 and receipt written (`CONTROL-PASS bogus`); `--selftest --family junk` → exit 0 with banner; `--family junk` → exit 64.
- `git -C <fx-lane> status --short` → clean; fixture frozen-script shas `01efd6dd…`/`679b7d96…` equal the live lane's.
- Not run: the original `c1-controls.sh`/`c2-controls.sh` (never executed); the frozen counter against the live lane (no scoring event); the real candidate (its `build/K70ExecRunner/` directory was created during this review and still empty at inspection).

## Artifacts and freeze

- Unique implementation artifacts: `.ufo/waves/round-70/build/K70ReviewCounterR8/` only (`counter-run.txt`, `r8-observed.txt`, `unprobed-bogusmode-out.txt`, `control-replay.mock.mjs.txt`, `replay70-probe.copy.mjs`, `frozen-counter.sha256`, `run-meta.txt`).
- Frozen counter, plan, and r69 frozen bytes: unchanged (shas recorded above; live-lane sha re-verified after the run).
- Scratch `/fast/scratch/hyaku/kumitate-r70/K70ReviewCounterR8/` deleted after receipts were copied to the private build dir.

## Install record

None. No `pacman`, `uv`, `npm -g`, `cargo`, or binary downloads. `node v24.21.0`, `git 2.56.0` already present.

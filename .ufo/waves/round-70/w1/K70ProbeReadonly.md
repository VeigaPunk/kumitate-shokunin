# K70ProbeReadonly — ProbeReadonly (operability C1 replay isolation)

Wave: round-70 w1. Seat axis: **read-only lane tree + writable scratch/output paths** against the
frozen round-70 replay implementation contract. Milestone: ProbeReadonly.

## Verdict

**PROBE-HELD 13/13, all lane sweeps byte-clean, real frozen r69 scripts unchanged.**
The contract-conformant candidate behavior survives a read-only lane with writable
scratch/output in every case exercised, including refusal paths. One observed limit
(case K): an unwritable *work root* fails non-zero but leaves a 0-byte `--out` behind
(exclusive create precedes work-dir use) — outside the frozen predicate's scope, reported
honestly as a limit, not scored.

## What was run (candidate status)

- Production `scripts/control-replay.mjs` does **not exist yet** (L1-only integration path).
- Candidate available for private-copy inspection: sibling mock
  `build/K70ExecFixtureTests/mock/control-replay.mjs` (self-declared "MOCK ONLY … conforms to the
  round-70 implementation contract"), pinned to the sibling synth fixtures
  `build/K70ExecFixtureTests/fixtures/synth-controls/{c1,c2}-controls.sh`
  (sha256 `398f01d7…` / `fa8af9db…` = mock EXPECTED_PINS, verified before use).
- I copied both into my build dir (`candidate-private-copy.mjs`, `synth-controls/`) and ran
  **only that private copy**, never lane scripts, never originals `c1-controls.sh`/`c2-controls.sh`
  (which were never executed here at all).
- Label: this is **candidate-behavior inspection on a synthetic pinned lane**, not candidate
  verification of the production implementation, and not a production-file touch.
- Row M is a **mechanism-only** model (`mechanism-model.mjs`, sibling fixed-candidate copy) —
  mechanism reproduction, not candidate verification.

## Probe design

Driver: `build/K70ProbeReadonly/probe-readonly.mjs` (executable, re-runnable). It builds three
minimal synthetic lanes under my scratch (`/fast/scratch/hyaku/kumitate-r70/K70ProbeReadonly/`):
`ro-lane` (chmod -R 0555), `drift-lane` (one byte flipped in c1-controls.sh, 0555), `writable-lane`
(0755 control). Each lane carries `scripts/control-replay.mjs` (private copy), synth frozen probes,
r69 receipt files, SKILL/SCORECARD, pins. Full sha256 sweep of each lane before/after every case;
repository environment poisoned with `GIT_DIR/GIT_WORK_TREE/GIT_INDEX_FILE/GIT_OBJECT_DIRECTORY/
GIT_ALTERNATE_OBJECT_DIRECTORIES/GIT_PREFIX/GIT_QUARANTINE_PATH` pointing **into the lane** to
prove env scrubbing + no lane writes. Receipts (`--out`) land in my build dir `receipts/`.

## Cases and observed outcomes

| case | scenario | exit | lane sweep | receipt/work | result |
|---|---|---|---|---|---|
| A | `--selftest`, read-only lane | 0 | CLEAN | PASS banner | HELD |
| B0 | c1/donothing, RO lane, poisoned GIT_* env | 0 | CLEAN | 570B, `LEDGER69_UNMET`+`CONTROL-PASS donothing`, work empty | HELD |
| B1 | c1/autoledger | 0 | CLEAN | 572B, labels+PASS, work empty | HELD |
| B2 | c2/donothing | 0 | CLEAN | 510B, `DEPREC69_UNMET`+PASS, work empty | HELD |
| B3 | c2/autoorigin | 0 | CLEAN | 512B, labels+PASS, work empty | HELD |
| B4 | c2/forgecapture | 0 | CLEAN | 516B, labels+PASS, work empty | HELD |
| G | invalid args (`--family junk`) | 64 | CLEAN | usage on stderr | HELD |
| H | existing `--out` | 73 | CLEAN | `CONTROL_REPLAY_OUT_EXISTS`, sentinel `do-not-overwrite` intact | HELD |
| I | drifted frozen bytes (RO drift lane) | 65 | CLEAN | `CONTROL_REPLAY_SOURCE_DRIFT …`, **no out created** | HELD |
| J | `--out` inside read-only dir | 73 | CLEAN | EACCES on out only; RO dir listing unchanged | HELD |
| K | read-only **work root** | 1 | CLEAN | observed limit: 0-byte out left; uncaught EACCES after exclusive create | HELD (limit) |
| L | **writable** lane control, same run | 0 | CLEAN | 570B, PASS; proves isolation by construction, not by permission | HELD |
| M | mechanism-only model run | 0 | n/a | 46B synthetic receipt, work empty | mechanism-only |

Real-lane frozen check (read-only `git show` at base `78b98d76…`): `c1-controls.sh` and
`c2-controls.sh` match base at start **and** end (`matchesBase:true` both sweeps).
Scratch removed after receipts copied to build dir (`SCRATCH cleaned: OK`).

## Commands (key)

- `node build/K70ProbeReadonly/probe-readonly.mjs` → `EXIT=0`, summary `PROBE-HELD 13/13; all-lanes-clean=true; frozen-real-unchanged=true`
- Receipts: `build/K70ProbeReadonly/receipts/ro-*.out`, `writable-lane-c1-donothing.out`
- Evidence logs: `build/K70ProbeReadonly/probe-run.txt`, `probe-results.json`

## Reading of the contract edge

The contract's replay obligations R3–R7 plus refusal behavior hold under a lane mounted
read-only: all writes are confined to the mkdtemp child under the supplied work root and the
exclusive `--out`; receipts are copied out before cleanup; drift refusal (65) happens **before**
out creation; invalid usage (64) and existing-out (73) never touch the lane. Case L (writable
lane, byte-identical sweep after) shows the read-only runs were not merely "saved by
permissions" — the candidate makes no lane writes at all. Case K discloses the one rough edge:
work-root unwritability surfaces as an uncaught exception with a leftover empty out file; the
frozen predicate always supplies a writable work root, so this is a disclosed limit, not a
predicate gap. No predicate amendment is requested.

## Risks / notes for L1

- Evidence is against the sibling **mock** candidate on synth fixtures; re-run this probe
  against the integrated `scripts/control-replay.mjs` before close (probe is re-runnable:
  point `--lane` at a fixture lane per its header).
- Mock pins differ from real frozen r69 controls; never substitute real bytes into the mock
  lane without recomputing pins (mock refuses by design — that refusal path itself was
  exercised in case I).

## Tooling / installs

None. Used pre-existing `node v24.21.0`, `git 2.56.0`, `bash 5.3.20` — no installs, no pacman,
no host changes.

## Hygiene

Wrote only: `build/K70ProbeReadonly/` (scripts, private copies, receipts, logs) and this report.
No production/lane/sibling/fleet/operator-tree writes; no commits; no task/background dispatch;
originals never executed; scratch cleaned before yield.

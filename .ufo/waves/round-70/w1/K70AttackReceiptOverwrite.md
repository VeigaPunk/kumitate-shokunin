# K70AttackReceiptOverwrite — round 70, C1 replay isolation (operability)

Scope: attack the contract edge "all existing r69 control receipt digests compared against originals, before and after". Attack only; no production file, no other seat's artifact, no commit, no push, no git mutation.

## Verdict

The frozen counter `replay70-probe.mjs` does not compare live r69 control receipts against their originals. Its "preserve prior receipt digests" clause (R3–R7) hashes an archive copy that no control run is pointed at, so it cannot detect overwrite of the live receipts. Reproduced in an isolated fixture: all five receipts were overwritten and R3–R7 still reported `preserved=true`, exit 0 each.

No candidate `K70ExecRunner/control-replay.mjs` exists yet (`build/K70ExecRunner` absent). I did not wait or poll; the attack is against the contract and counter directly, using an attack-only tool I wrote.

## Findings

### F1 — preservation check hashes the wrong tree (defect in the frozen counter)
- Counter lines 23–25 and 33: `before` is built from `tree/.ufo/waves/round-69/controls`, where `tree` is `git archive <REV>` extracted into the counter's TMPDIR. Only that archive copy is hashed.
- Counter line 17–20 and 29: the control tool is invoked with `--lane lane`, where `lane` is the real lane path passed to the counter, not `tree`. Any write the tool resolves through `--lane` lands in the live `lane/.ufo/waves/round-69/controls`, which is never hashed.
- Consequence: the `preserved` term in R3–R7 is only falsifiable for writes resolved under the archive `tree`. Under the frozen contract, the original scripts write to the live lane path (`W="$LANE/.ufo/waves/round-69/controls"`, `> "$W/c1-$MODE.txt"`), so an implementation that fails to substitute W to a private path would clobber live receipts while R3–R7 still pass.

### F2 — no receipt-to-original comparison anywhere in the predicate
- R1 covers only `c1-controls.sh` and `c2-controls.sh` (via `git show 78b98d…`). The five r69 receipt files are never compared to their base bytes, before or after.
- The brief's "all existing r69 control receipt digests compared against originals" is therefore not a predicate obligation. Only the tree-relative self-comparison in F1 exists.

### F3 — `preserved` covers only a snapshot of top-level files
- `before` includes only `isFile()` entries present at snapshot time. New files are not detected. If the directory has no files, `[...before].every(...)` is vacuously true.
- Minor, but it weakens R3–R7 further.

### F4 — R9 checks only the output file, not side effects
- R9 asserts that the pre-existing `--out` file is unchanged after refusal. It does not check whether the tool performed other writes first. In the reproduction below, the collision run also clobbered a live receipt before the exclusive-create refusal, and R9 still PASSed.

### F5 — contract mismatch the candidate must resolve (not a counter defect)
- R3–R7 require the literal `CONTROL-PASS <mode>` inside the `--out` file. The originals print `CONTROL-PASS` only to stdout (`c1-controls.sh` line 80, `c2-controls.sh` line 111–116); the receipt file gets probe output and the `control=` line only. A conforming candidate must write that marker into `--out` itself. Not a defect in the counter, but it is a point where the candidate can drift.

## Reproduction (isolated, attack-only)

Artifacts are in `.ufo/waves/round-70/build/K70AttackReceiptOverwrite/`:
- `control-replay.attack.mjs` — attack tool. Honours the frozen argv contract, writes `CLOBBERED-BY-ATTACK` into `<--lane>/.ufo/waves/round-69/controls/<family>-<mode>.txt`, then creates `--out` with `wx`.
- `drive.sh` — builds a fixture git repo in scratch, verifies `git -C FX rev-parse --show-toplevel` equals the fixture before the first commit, copies the frozen counter byte-for-byte (sha verified), runs it against the fixture only, and hashes the fixture's live receipts before and after.
- Outputs: `counter-run.txt`, `live-receipt-diff.txt`, `before.sha`, `after.sha`.

Observed (`bash drive.sh`, exit 0):
- `toplevel-ok=…/fx-lane`
- counter sha `63f52b75…c0e3d80a91c6957ce4624cbd46a9488841a962a75bc62ffecbf0c1` equals the frozen sha.
- all five fixture receipts changed: `diff-exit=1`, 5 lines differ.
- counter output: `REPLAY70_UNMET held=9/10 … live=no-live(vacuous-declared)`
  - R1 MISS (fixture lacks commit 78b98d; fixture-only, see below)
  - R2 PASS; R3–R7 PASS, each `exit=0 … preserved=true`; R8 PASS; R9 PASS; R10 PASS
- temporary tree left behind: none (`ls -A` empty).

Other observations:
- Fixture-only miss: R1 needs `git show 78b98d…` in the lane. The fixture cannot contain that commit. In the real lane the base commit exists (checked: `git show 78b98d…:.ufo/waves/round-69/probe/c2-controls.sh` succeeds), so R1 is not expected to fail there.
- R2–R10 PASS here only because the fixture was built to satisfy them (stub tool, stub SKILL/SCORECARD/pins). They say nothing about the real candidate; the result that matters is R3–R7 `preserved=true` against clobbered live receipts.

## Freeze consequence

- The frozen counter cannot falsify live r69 receipt preservation. A HELD claim (10/10) does not certify that the five r69 control receipts were left intact.
- [INFERENCE] Given the fixture result (only R1 missing, and R1 passes in the real lane), a candidate that clobbers the live r69 receipts while keeping the counter's R1–R10 shape could reach 10/10. This is extrapolation from a fixture, not an observed real-lane run.
- Counter, plan and frozen bytes were not changed. The predicate must not be amended after scoring. Per the brief, the defect is reported, not repaired in the predicate.
- Recommended disclosure, outside the predicate: at close, L1 or the non-author closure should record the five baseline sha256 values below and compare them against the live `round-69/controls` directory after final verification, reporting the comparison separately from REPLAY70 scoring:
  - `c1-autoledger.txt` 0fd37a31f209c91857f5dc4824a555a6373b796ebabbb0270303ec56338cfccf
  - `c1-donothing.txt` a7476ee5c226045f040ea3bd9cc89eaf405f41b0583d2ddccd60350144d7b558
  - `c2-autoorigin.txt` e9e668439cbf6501ef19da07febd6b4d054fff5201749853b7c42359e05a83aa
  - `c2-donothing.txt` 003b059b60264d42286bc01e4ab38c1d267dc9d83ffefff6078aed38c9322309
  - `c2-forgecapture.txt` f2ffbd3a29990422bb65543fc34234ea1257294809f696992e1ff571cc6b091e
  (identical at base `78b98d…`, at HEAD `1e00955…`, and in the worktree.)
- Candidate guidance (not a predicate change): the implementation should substitute `W` to a private path, never the `--lane` controls directory, and should hash the live `--lane` controls dir itself in its own selftest. That is for L1 to decide; I am not proposing a counter change.

## Commands and outcomes observed

- `read` of `~/.omp/agent/RULES.md` (tooling directive: no installs made; `pacman` not touched).
- `read` of `round-70/plan.md`, `probe/replay70-probe.mjs`, `base/replay70-base.txt`, `base/freeze-map.txt` (`README_MAP: CLEAN`), `base/sources.txt`, `round-69/probe/c1-controls.sh`, `round-69/probe/c2-controls.sh` (read-only; originals not executed).
- `git -C <lane> rev-parse --show-toplevel` → lane path; HEAD `1e00955…`; `git status --short` → only `w1.ready.partial` (and my `build/` at the end).
- `git -C <lane> ls-tree` and `show` at `78b98d…` and HEAD: five receipts present; sha256 identical across base/HEAD/worktree.
- `sha256sum` of `replay70-probe.mjs` → `63f52b75…` (unchanged before and after).
- `node --version` → v24.21.0; `git --version` → 2.56.0 (already present, no install).
- Scratch created: `/fast/scratch/hyaku/kumitate-r70/K70AttackReceiptOverwrite/` (HYAKU_SCRATCH unset, default used). Fixture toplevel asserted before commit. Run as above. Scratch removed afterwards; `kumitate-r70/` now holds only other seats' directories.
- Live lane after the run: `sha256sum` of the five receipts unchanged (table above); the attack wrote only inside the fixture.
- Not run: the original `c1-controls.sh` / `c2-controls.sh` (never executed); the candidate tool (absent); the frozen counter against the live lane (not run, to avoid a scoring event).

## Install record

None. No `pacman`, `uv`, `npm -g`, `cargo`, or binary downloads.

# K70ReviewCounterArchive — ReviewCounterArchive (operability C1, counter/revision-binding review)

Scope: counter-extract path review + revision-binding limit assessment for `.ufo/waves/round-70/probe/replay70-probe.mjs` (frozen, sha256 `63f52b75…bf0c1`). Read-only review; no production files touched; originals `c1-controls.sh`/`c2-controls.sh` never executed. Candidate `build/K70ExecRunner` inspected: absent at review time (only K70AttackConcurrent, K70AttackReceiptOverwrite, K70ExecFixtureTests present).

## Verdict

No blocking counter defect. One bounded, disclosable revision-binding limit (findings F1/F2) that collapses to identity under the plan's own close-sequence discipline (clean lane + measured committed REV + misroot sweep). Counter extraction path list is complete and extracts cleanly at the current lane HEAD.

## Commands run (evidence: build/K70ReviewCounterArchive/evidence-log.md)

- Lane state: `git status --porcelain` (tracked-dirty count 0; only untracked wave artifacts), `git rev-parse HEAD` → `1e00955a…` on frozen plan `3dbe7e6e…`.
- Extract-path existence: `git cat-file -e HEAD:<path>` for all archived paths → all present (`scripts`, `corpus`, `SKILL.md`, `SCORECARD.md`, `.ufo/pins/counter-pins.json`, r69 probe + controls, both frozen scripts, both r69 probes).
- Frozen bytes: sha256 of plan.md and replay70-probe.mjs identical across freeze commit / HEAD / disk; both r69 control scripts identical base↔HEAD.
- Extraction dry-run: exact archive pipeline at rev=HEAD into scratch → OK; `scripts/control-replay.mjs` absent at HEAD (expected; matches base receipt).
- `node --check` on the probe → OK. Pins JSON shape verified (`pins[]` with `path`/`sha256`; replay70-probe pin matches disk).
- Base receipt re-read: `REPLAY70_UNMET held=2/10`, R1+R9 PASS, exit 1 — matches plan. `base/freeze-map.txt` CLEAN 169/169.
- Counter grep: no `rev-parse`/cleanliness assertion present.

## Findings

### F1 — medium (limit, not amendable: counter is frozen) — exercised control-source bytes are working-copy-bound while scoring claims bind to REV

- Code: probe line 17 archives the selected paths at `$rev` into a temp tree; line 22 (R1) binds the *extracted* r69 control scripts to base `78b98d76…`; lines 26/29 run the *extracted* tool but hand it `--lane <live working copy>`. Per the implementation contract, the tool reads the frozen scripts, the r69 probes, and c1 fixture sources from `--lane` (r69 c1 originals `cp "$LANE/scripts/routed-ledger.mjs"`, corpus lessons; c2 originals `git -C "$LANE" archive 14057f…`).
- Consequence: on a lane with uncommitted changes to `.ufo/waves/round-69/probe/*` (or the fixture sources), R3–R7 would exercise mutated bytes while R1/R10 still PASS, because those read only committed data (archive/`git show`). The predicate text says `rev=…` but part of the exercised behavior is not rev-bound.
- Residual risk after mitigation: none at scoring time, PROVIDED L1 runs the probe only when `git -C lane rev-parse HEAD` equals the measured committed REV and the tracked tree is clean (currently true: 0 dirty entries). The plan's close sequence (commit → measure REV → final verification → misroot sweep) already enforces this order. Recommendation: record in SCORECARD/LOG the observed `HEAD == measured REV` and clean-tree status at probe time, so the REV-binding claim is honest saturation evidence rather than assumption.

### F2 — low — R3–R7 "preserved" digest guard watches the extracted tree, which the tool is never given a path to

- Code: probe lines 24–25 hash `.ufo/waves/round-69/controls` files in the *extracted tree* before the runs; line 33 re-hashes the same extracted copies. The tool under test only receives `--lane <working copy>` and private `--out`/`--work` roots; nothing can point it at the extracted tree.
- Consequence: the guard detects accidental writes into the extracted copies (defense in depth, cheap) but cannot detect a misrouted tool writing into the *lane's* `.ufo/waves/round-69/controls` working-copy receipts — the exact failure R3–R7's "preserve prior receipt digests" obligation targets. The plan's separate misroot sweep is what actually covers this; the counter component is observational only.
- Disposition: disclose as a bounded counter limit (frozen bytes cannot be amended); keep the misroot sweep as the load-bearing check. If a future round unfreezes the counter, hash the lane's controls dir before/after (or assert `git status` cleanliness on it) instead of the extracted copies.

### F3 — informational — `CONTROL-PASS <mode>` must come from the new tool's capture, not from committed receipts

- Committed r69 receipts contain the UNMET first lines and `control=MODE exit=…` trailers but no `CONTROL-PASS <mode>` (r69 scripts echoed it to the terminal only). The counter (line 31) requires the r70 `--out` file to include both the old UNMET label and `CONTROL-PASS <mode>`, so the tool must redirect the private script's full stdout into `--out`. Builders/L1 should treat that as a contract requirement on the private-run capture, not on the frozen r69 artifacts.

## Verification gaps

- Full 10/10 run not exercised (tool not yet integrated; absent-tool outcome already frozen as the base receipt — rerunning would add no information).
- Revision-binding limit demonstrated by code inspection + absence of HEAD/cleanliness assertions (grep evidence), not by a live dirty-lane mutation test; mutating the production lane to prove it is out of bounds for this seat and unnecessary given the operational mitigation.
- Candidate `build/K70ExecRunner` not inspected: not present in this wave snapshot.

## Tooling record

No installs or updates. Used pre-existing node v24.21.0 and git 2.56.0. No pacman transactions. Scratch `/fast/scratch/hyaku/kumitate-r70/K70ReviewCounterArchive/` removed after copying receipts to this build directory.

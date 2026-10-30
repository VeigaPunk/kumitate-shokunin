# K70ReviewScope — round-70 C1 replay isolation (operability), scoped review

Scope: frozen r69 scripts, counters, receipts, and the frozen round-70 replay probe. Production files not edited. Candidate `build/K70ExecRunner/` is absent, so nothing there was inspected. Evidence: `.ufo/waves/round-70/build/K70ReviewScope/evidence.txt`.

## Frozen integrity — verified, no defect
- Frozen plan commit `3dbe7e6e2616423d55f0ea2bbcf8fb32fe7bda6a` resolves; no working-tree diff on `plan.md`, `base/`, `probe/`, or `round-69/`.
- `round-69/probe/c1-controls.sh` (sha256 `01efd6dd…aeda12`) and `c2-controls.sh` (sha256 `679b7d96…3deb66f4`) are blob-identical to `78b98d76`. c2 matches the S217 capture pin.
- `ledger69-probe.mjs`, `deprec69-probe.mjs`, and `scripts/routed-ledger.mjs` match their pins and base blobs.
- `replay70-probe.mjs` (sha `63f52b75…bffc0c1`) matches its pin in `counter-pins.json`.
- Five frozen r69 receipts are tracked and read as expected (LEDGER69_UNMET ×2, DEPREC69_UNMET ×3, exit 1).

## Findings (ordered by severity)

### F1 — Medium-high: generated copy breaks on TMPDIR parent (operability)
- `c1-controls.sh:75` and `c2-controls.sh:106` run `TMPDIR="${HYAKU_SCRATCH:-/fast/scratch/hyaku}/kumitate-r69" node "$PROBE" …`.
- `ledger69-probe.mjs:78` and `deprec69-probe.mjs:88` call `mkdtempSync(join(tmpdir(), …))` at top level, with no try.
- That parent directory is not created by the frozen scripts unless `S` lives under it (`c*:21/25 mkdir -p "$S/fx"`). `/fast/scratch/hyaku/kumitate-r69` is absent right now.
- Observed: with an absent TMPDIR parent, `mkdtempSync` throws `ENOENT` (evidence item 13).
- The plan's substitution list is LANE/PROBE/W/S only. If the generated copy moves S under the unique work child and leaves TMPDIR pointing at `kumitate-r69`, every r69 control crashes before printing `LEDGER69_UNMET` / `DEPREC69_UNMET`. R3–R7 then MISS for a tooling reason, not a control verdict.
- Required in the generator: set the probe's TMPDIR to a directory the generator creates inside the unique work child (and reclaims it), and do not depend on `${HYAKU_SCRATCH}/kumitate-r69` existing.

### F2 — Medium: R3–R7 "preserved" check hashes the wrong tree (predicate observability; disclose, do not amend)
- `replay70-probe.mjs:24` snapshots `path.join(tree, '.ufo/waves/round-69/controls')`, where `tree` is a git archive extracted from REV. The check at `:33` re-hashes that same tree copy.
- The tool is invoked with `--lane` = the live lane (`:27–29`), so a tool that overwrote `kumitate-shokunin/.ufo/waves/round-69/controls/*.txt` would not change the hashed copy and would still pass "preserved".
- Consequence: the probe cannot detect receipt overwrite in the lane. Preservation of the lane receipts rests entirely on the tool never receiving a lane write path. The generator must guarantee that (no W/out/work pointing into the lane controls); disclose this limit in the scorecard. Do not change the predicate after scoring.

### F3 — Low-medium: c1 fixture reads the live lane working tree, not REV (binding gap)
- `c1-controls.sh:27` copies `$LANE/scripts/routed-ledger.mjs`; `:29–30` copies `$LANE/corpus/lessons/round-$n-verifier-spotcheck.md` from the working tree. Neither is taken from `$REV`.
- The probe labels results `rev=$REV` but never asserts lane HEAD == REV or lane clean for those paths.
- Current state is clean: `git status --porcelain -- scripts corpus …` is empty and the routed-ledger sha matches its pin, so the present result is not affected. A dirty lane at replay time would decouple the C1 verdict from the labelled REV.
- Mitigation: the generator should read the c1 inputs with `git -C LANE show REV:path` (or refuse when the paths differ from REV). Disclose if not done.

### F4 — Low (concrete edit required): unused fixed-path write in frozen c2
- `c2-controls.sh:80` runs `printf … > /tmp/forge-sed.txt`. Only occurrence in the file; nothing reads it (grep, evidence item 10).
- The generated copy must drop this line (the plan already requires removing the known unused fixed temporary write). Leaving it would write a shared fixed /tmp path in a forgecapture run.

### F5 — Informational: verdict string is stdout-only in frozen receipts
- `c1-controls.sh:80` and `c2-controls.sh:116` echo `CONTROL-PASS <mode>` to stdout, not into `$W/c*-$MODE.txt` (`:75`, `:106`). The frozen receipts have no `CONTROL-PASS` line.
- The probe's R3–R7 require `text.includes('CONTROL-PASS '+mode)` in the new `--out` file. The generator therefore must write that verdict into `--out` itself. Copying frozen receipts is not enough.

### F6 — Informational: forgecapture arm is live and network-dependent
- `c2-controls.sh:104–113` requires `S210:origin-sha-mismatch` in the forgecapture output, and the live arm makes network calls. Failure is an honest miss under the predicate; the generator must keep that grep check.

## Gaps and limits
- `scripts/control-replay.mjs` does not exist yet, so the probe was not executed and R2–R10 are unverified. Replay, selftest, and the live arm were not run. No originals were executed.
- No round-69 c1 script pin exists in `counter-pins.json` (only c2 via S217). The base blob check (R1) covers it.

## Verdict
No defect in the frozen scripts, counters, or receipts. Actionable items for the implementer: F1 (TMPDIR must be generator-owned, else crash-MISS), F3 (read c1 inputs from REV), F4 (drop `/tmp/forge-sed.txt` write), F5 (write `CONTROL-PASS` into `--out`). F2 is a predicate limit to disclose.

Commands run and outcomes are in `build/K70ReviewScope/evidence.txt`. Installs: none. Scratch `/fast/scratch/hyaku/kumitate-r70/K70ReviewScope` created, used, and removed.

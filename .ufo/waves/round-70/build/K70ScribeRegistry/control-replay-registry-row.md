# K70ScribeRegistry — draft registry rows for `control-replay` (round 70, C1 operability)

Draft only. Not applied to SKILL.md, SCORECARD.md, `.ufo/pins/counter-pins.json` or any production file. L1 integrates. Nothing below is an observed outcome of the tool: `scripts/control-replay.mjs` does not exist yet in the lane.

## 1. SKILL.md gate-registry row (kind = gate)

Insert after the `routed-ledger` row (SKILL.md line 638), i.e. as the last row of the table at §Gate registry:

```
| control-replay | gate | `node scripts/control-replay.mjs --lane <dir> --family c1\|c2 --mode donothing\|autoledger\|autoorigin\|forgecapture --out <new-file> --work <existing-dir>` → `CONTROL_REPLAY: CLEAN\|DRIFT\|FAIL-CLOSED` (0 clean · 1 a real defect · 2 fail-closed · 64 usage), contract `kumitate-control-replay-v1`; each run replays ONE frozen round-69 control (c1: `donothing`, `autoledger`; c2: `donothing`, `autoorigin`, `forgecapture`) from a versioned private copy (LANE/PROBE/W/S substituted once, the unused `/tmp/forge-sed.txt` write at c2 source line 80 removed, inherited git environment scrubbed, explicit `git -C` fixture-root arguments) into a new exclusive `--out` file, inside one unique `mkdtemp` child of `--work`, copying receipts out before cleanup; the originals are never executed; `CLEAN` means the replayed receipt reproduced the frozen expectation, not that the control is green; a live `forgecapture` arm that cannot run (network) is `FAIL-CLOSED`, never `CLEAN` | `--selftest` (hermetic `mkdtemp` fixtures with synthetic controls only; final lines `CONTROL_REPLAY_SELFTEST: PASS (n/n)` and `VERDICT: PASS`, exit 0; the selftest never executes `c1-controls.sh` or `c2-controls.sh`) | `.ufo/pins/counter-pins.json` entry `{round:70,name:"control-replay",path:"scripts/control-replay.mjs"}`; frozen source sha256 `c1-controls.sh` = `01efd6dde4c987b676b1930f647cc283768e1ae8113fd076b313e54b56aeda12`, `c2-controls.sh` = `679b7d9619ab8d79139cfe8e956e425f7ccbbf7e58b6eaee5cb72c3deb3a66f4` (verified equal to `git show 78b98d…:` in this run); `pin.control-replay` in `kumitate-gate-pins-v1`; predicate `.ufo/waves/round-70/probe/replay70-probe.mjs` (sha `63f52b75d9c0e3d80a91c6957ce4624cbd46a9488841a962a75bc62ffecbf0c1`) |
```

Notes on the cells (all required by the frozen counter or by the existing gate convention):
- The name cell is the bare word `control-replay`, no backticks. Counter R10 tests the substring `| control-replay |`; a backticked name would fail it.
- The row sits in the gate table, not in a demo/probe/runner section.

## 2. SCORECARD.md capability row (companion; R10 needs the same bare-name substring)

Suggested shape, matching the `counter-pins` / `routed-ledger` rows (SCORECARD.md ~line 1795–1804). Bare name in the first cell:

```
| control-replay | Replay the five frozen round-69 controls in private, versioned copies into new exclusive output and work paths, comparing each receipt with its frozen expectation; originals are never executed (contract `kumitate-control-replay-v1`; round 70 C1). Replay match is not forgery resistance and not a live-arm verdict. |
```

## 3. Registry count paragraph (SKILL.md ~line 640; add after the round-69 correction)

```
Round-70 registry addition: adding control-replay makes 26 gate rows (`grep -c '^| [^|]* | gate |' SKILL.md`) over 25 gate files; plan-before-ready keeps two historical rows. Exclude runner/demo/helper rows.
```

Observed before this addition: `grep -c '^| [^|]* | gate |' SKILL.md` = 25, `plan-before-ready` rows = 2 (24 distinct gate files). After landing, the expected count is 26 rows / 25 files; this is arithmetic on the current table, not an observed post-landing count.

## 4. Exit map (must be stated exactly in the script header and in the row)

| exit | verdict line | meaning |
|---|---|---|
| 0 | `CONTROL_REPLAY: CLEAN family=<f> mode=<m>` | copy ran; child receipt carries the frozen label (`LEDGER69_UNMET` or `DEPREC69_UNMET`) with exit 1; `CONTROL-PASS <mode>` written to `--out`; round-69 receipts unchanged; work child reclaimed |
| 1 | `CONTROL_REPLAY: DRIFT <finding…>` | a real defect in the replay: frozen source bytes differ from the pinned sha (refused, not run; same as source-capture's bytes-mismatch = DRIFT); child receipt label/exit mismatch; round-69 receipt digest changed; scrub/`W`/`S` substitution check failed; work child not reclaimed |
| 2 | `CONTROL_REPLAY: FAIL-CLOSED reason=<why>` | could not evaluate: lane or `--work` unreadable/absent; `git` archive or fixture failure; `mkdtemp` failure; `--out` already exists (exclusive create refused, existing bytes untouched); child cannot spawn or writes no receipt, including the network-dependent live `forgecapture` arm |
| 64 | `CONTROL_REPLAY: USAGE …` | bad or missing arguments, unknown family, mode not valid for the family (e.g. `c1 forgecapture`), `--family junk` |

Counter-compatibility arms this table must satisfy:
- R8: `--family junk` alone → 64.
- R9: existing `--out` → nonzero (2 here) and file bytes unchanged.
- R3–R7: `--work` is created by the caller (`fs.mkdirSync(work)`) and must still exist after the run, empty; the tool removes only its own `mkdtemp` child.
- R3–R7: `--out` text must contain the family label and the line `CONTROL-PASS <mode>`; the stdout verdict line is separate and is not what the counter reads.
- R2: selftest stdout must contain a line that starts with `CONTROL_REPLAY_SELFTEST: PASS` (column 0) with exit 0.

## 5. Kind choice (why `gate`)

- Exit 1 is a real defect in the controlled surface (a replay that disagrees with the frozen expectation or with frozen bytes), which is the gate definition in §Gate registry.
- It has its own exit map 0/1/2/64. It does not pass through the child's exit code, so it is not a `runner` (cap-run style).
- Its exit 1 is not "two runs disagree", so it is not a `probe` (counter-rerun style).
- It has an exit-1 arm, so it is not a `demo` (jj-seat-demo style).
- It is a CLI with a verdict line, so it is not a `helper` (cap-spawn style).

Open point for L1, not decided here: whether frozen-source byte mismatch should be exit 1 (DRIFT, as in source-capture) or exit 2 (fail-closed, as in an unreadable input). This draft uses 1.

## 6. Pin and registration sequence (for L1; nothing executed)

1. Land `scripts/control-replay.mjs` (L1 only).
2. Add `.ufo/pins/counter-pins.json` entry for `scripts/control-replay.mjs` with `sha256` of the landed bytes. Existing entry format: `{round, name, path, sha256}`.
3. Add `pin.control-replay` to the `kumitate-gate-pins-v1` block (SCORECARD.md ~line 312).
4. Add the SKILL row (§1), SCORECARD row (§2), count paragraph (§3).
5. Run `node scripts/control-replay.mjs --selftest`, then `node .ufo/waves/round-70/probe/replay70-probe.mjs <lane> <rev>` once. Any later edit to the script requires re-pinning.

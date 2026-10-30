VERDICT: Candidate `scripts/control-replay.mjs` is complete and exercised: the frozen round-70 probe reads REPLAY70_HELD 10/10 (exit 0, live=exercised) against a sandbox fixture carrying the candidate plus the registration triad; the five bounded replays re-run the frozen r69 controls into new private receipts, preserve every prior receipt digest, and reclaim their work roots. Limits disclosed below; no predicate touched.

## Candidate (exact path for L1)

- `.ufo/waves/round-70/build/K70ExecRunner/scripts/control-replay.mjs` — install verbatim at `scripts/control-replay.mjs` (production path is L1-only; not written by this seat).
- sha256: `61f6e0e0ef2b881b44cf04f8698e22f6ff9a01796f6e160208c429a16175d9d8` (byte-stable since first pin; fixture copy identical — `sha256sum` observed match).
- 401 lines, node ≥ 18 (developed under v24.21.0), no dependencies, no network in the tool itself.

## Evidence (commands executed, observed outputs)

Environment: host `linux 7.2.11-arch1-1`, `node v24.21.0`, `Python 3.14.8`, bash 5.x, git 2.x — all preinstalled; **no installs/updates performed this seat** (pacman paused per directive; nothing needed uv/npx/binary channels).

1. Frozen counter read: `.ufo/waves/round-70/probe/replay70-probe.mjs` (R1–R10 contract) and frozen controls read at `.ufo/waves/round-69/probe/{c1,c2}-controls.sh`; originals never executed, never written.
2. `sha256sum c1-controls.sh c2-controls.sh` → `01efd6dde4c987b676b1930f647cc283768e1ae8113fd076b313e54b56aeda12` / `679b7d9619ab8d79139cfe8e956e425f7ccbbf7e58b6eaee5cb72c3deb3a66f4` — embedded as full-source pins in the candidate.
3. `TMPDIR=/fast/scratch/hyaku/kumitate-r70/K70ExecRunner/tmp node …/control-replay.mjs --selftest` (cwd = lane) → `CONTROL_REPLAY_SELFTEST: PASS cases=9 ok=9`, exit 0, wall 0.15s. Stable ids and expected exit map: ST01 no-args→64, ST02 bad-family→64, ST03 bad-mode→64, ST04 `--selftest` mixed→64, ST05 tampered source→65, ST06 transform twice→refusal, ST07 existing out→73 + bytes intact, ST08 all five (family,mode) private copies pass `bash -n` + receipt-name markers, ST09 c2 static transforms (forge-sed write gone, 4× `git -C "$S/fx"`, TMPDIR→`$CHILD/tmp`, 4× tee -a, archive line untouched).
4. Five direct replays against the live lane (exactly the argv shape the probe uses):
   - `… --family c1 --mode donothing --out … --work …` → exit 0, 271.6s (load ~5); receipt `LEDGER69_UNMET held=5/7 …` + `control=donothing exit=1 rev=c811e752…` + `CONTROL-PASS donothing`; work root empty.
   - `--family c1 --mode autoledger` → exit 0, 277.5s; receipt carries `LEDGER69_UNMET` + `CONTROL-PASS autoledger`; work root empty.
   - `--family c2 --mode donothing` → exit 0, 37.6s; `DEPREC69_UNMET held=8/11 … live=no-live(vacuous-declared)` + `CONTROL-PASS donothing`.
   - `--family c2 --mode autoorigin` → exit 0, 38.1s; `DEPREC69_UNMET held=8/11 …` + `M11 MISS S214:row-absent,…` + `CONTROL-PASS autoorigin`.
   - `--family c2 --mode forgecapture` → exit 0, 39.1s; **live=exercised**; `M11 MISS … S210:origin-sha-mismatch` — the digest arm bit the forgery live, matching the frozen r69 receipt shape.
5. Full frozen-probe rehearsal (sandbox fixture repo, never the lane):
   - Fixture: `git init` in `/fast/scratch/hyaku/kumitate-r70/K70ExecRunner/fxrepo`; `git -C <lane> archive 78b98d7… scripts corpus SKILL.md SCORECARD.md .ufo/pins .ufo/waves/round-69/probe .ufo/waves/round-69/controls | tar -x`; candidate copied to `scripts/control-replay.mjs`; registry triad added (see Integration notes); `git -C fxrepo fetch <lane> master` so commit `14057f3e…` (c2 fixture archive source) resolves; `git rev-parse --show-toplevel` asserted == fxrepo before each commit; commits `ad8ad3d8…` → `5987f7015eb3146eabb07320f046b1ba9097472d`.
   - `TMPDIR=…/tmp node .ufo/waves/round-70/probe/replay70-probe.mjs …/fxrepo 5987f7015eb3146eabb07320f046b1ba9097472d` → **`REPLAY70_HELD held=10/10 … live=exercised`**, probe exit 0, wall 663s at load ~9. Full receipt: `.ufo/waves/round-70/build/K70ExecRunner/receipts/replay70-rehearsal-5987f701.txt`.
6. Frozen-byte preservation after all runs: `sha256sum` on both originals unchanged (values above); `git -C <lane> status --porcelain -- .ufo/waves/round-69/probe .ufo/waves/round-69/controls` → empty.
7. Pinned-transform inspection (scratch): `diff <original> <generated private copy>` for both families shows exactly and only: versioned header + `CHILD`, LANE/PROBE/W/S substitutions, 4× `git -C "$S/fx"` conversions, TMPDIR→`$CHILD/tmp`, c2 `/tmp/forge-sed.txt` line removed, CONTROL-PASS/FAIL lines `tee -a` into the private receipt.

## Findings

1. **K70ExecRunner-1 — the probe's SCORECARD row must contain the literal `| control-replay |`.** Rehearsal 1 read R10 MISS with everything else ready; cause was the capability row name written as `` | `control-replay` | `` — the probe substring is literal. Fixed in the fixture and called out for L1 below. Do not backtick-wrap the capability name.
2. **K70ExecRunner-2 — c1 replays are the time-risk arm, and the risk is environmental, not semantic.** The frozen L69 counter's L7 self-confinement arms re-run the whole counter recursively (observed: nested `ledger69-probe` self-spawns, L4 20-mutant harness, 33-case tool selftest). Measured walls: 267s (earliest quiet window), 271.6s and 277.5s (load ~5) → pass; 280s/299s timeouts (load 15–21, ~670 concurrent peer probes) → honest `CONTROL-REPLAY-ERROR … timeout` receipt, exit 70, work root still reclaimed (process-group kill). The probe harness allows 300s per run; quiet-host margin is ~20–30s. Nothing in the wrapper can shrink the frozen counter's work; schedule L1's verification off-peak and expect ~11–13 min total for the ten checks.
3. **K70ExecRunner-3 — the live forgecapture arm bit on this host today** (`S210:origin-sha-mismatch`, live=exercised). It remains network-dependent per plan; failure would be reported (CONTROL-FAIL, exit 1), never waived.

## Contract implemented (five modes + selftest)

- CLI: `--lane DIR --family c1|c2 --mode MODE --out NEWFILE --work DIR` and sole `--selftest`. Bound to the five frozen controls only; no arbitrary command surface.
- Frozen-source pins: full-source sha256 of both controls, verified before any work; any byte difference → exit 65 (`frozen-source-sha-mismatch`), observed via ST05.
- Versioned private copy per run: LANE/PROBE/W/S substituted exactly once (occurrence-checked, idempotence-refusing), the known unused fixed temporary write (`/tmp/forge-sed.txt`) removed, fixture git commands converted to explicit `git -C "$S/fx"` forms, inherited repository/tooling environment scrubbed (GIT_DIR family, author/committer, TAR_OPTIONS, NODE_OPTIONS, LD_PRELOAD, GIT_CONFIG_*).
- Isolation: unique `mkdtemp` child under the supplied work root holds fixture + receipts + private script + TMPDIR; receipt copied to `--out` with exclusive creation (`openSync wx` → 73 on collision, existing bytes untouched, observed live and in R9 PASS); child reclaimed afterwards (work root empty, verified every run and by probe R3–R7 `readdirSync(work).length===0`); the private bash runs detached in its own process group and is group-killed on timeout so frozen-counter grandchildren cannot leak.
- Exit map: 0 control pass · 1 control fail (reported, never waived) · 64 usage (R8) · 65 frozen-source/transform refusal · 70 internal/timeout · 73 existing output (R9).
- Selftest: hermetic (private TMPDIR child, no network, no lane writes, 0.15s), 9 stable finding ids, printed expected-vs-observed exit map, `CONTROL_REPLAY_SELFTEST: PASS` only when all cases hold.

## Integration notes for L1 (production paths, L1-only)

1. Install the candidate bytes at `scripts/control-replay.mjs` (sha256 `61f6e0e0…d9d8` — re-measure at integrate; the fixture copy at `.ufo/waves/round-70/build/K70ExecRunner/scripts/control-replay.mjs` is byte-identical today).
2. `.ufo/pins/counter-pins.json`: append `{"round": 70, "name": "control-replay", "path": "scripts/control-replay.mjs", "sha256": "<measured>"}` — pins added without changing counter bytes.
3. `SKILL.md` gate-registry row (verbatim from the fixture): `| control-replay | gate | \`node scripts/control-replay.mjs --lane DIR --family c1\|c2 --mode MODE --out NEWFILE --work DIR\` → isolated replay of the five frozen round-69 capability controls; the receipt carries the old UNMET predicate + \`CONTROL-PASS <mode>\` (0 pass · 1 control fail · 64 usage · 65 frozen-source refusal · 70 internal · 73 existing output), contract kumitate-control-replay-v1 | \`node scripts/control-replay.mjs --selftest\` → \`CONTROL_REPLAY_SELFTEST: PASS\` (9 hermetic cases, stable ids, expected exit map) | \`.ufo/waves/round-69/probe/{c1,c2}-controls.sh\` (frozen, sha256-pinned, read-only); \`pin.control-replay\` in \`kumitate-gate-pins-v1\` |`
4. `SCORECARD.md`: `pin.control-replay=<sha>` line inside the `kumitate-gate-pins-v1` block, and a `## Capabilities` row beginning exactly `| control-replay |` (no backticks on the name — Finding 1); the fixture row text is a ready model.
5. Do not schedule verification while the fleet is probe-saturated (Finding 2); run the plan's probe command with `TMPDIR=/fast/scratch/hyaku/kumitate-r70/L1` as specified.

## Artifacts (this seat's private build dir only)

- `.ufo/waves/round-70/build/K70ExecRunner/scripts/control-replay.mjs` — the candidate.
- `.ufo/waves/round-70/build/K70ExecRunner/receipts/c1-donothing.txt` (`4040c4ee…`), `c1-autoledger.txt` (`837027c2…`), `c2-donothing.txt` (`da9835c2…`), `c2-autoorigin.txt` (`3f8f60d5…`), `c2-forgecapture.txt` (`aa3489d6…`), `replay70-rehearsal-5987f701.txt` — five replay receipts (new private outputs; frozen r69 receipts untouched) and the 10/10 rehearsal receipt.
- `.ufo/waves/round-70/w1/K70ExecRunner.md` — this report.

## Limits

- Timing limits are measured above, not waived: c1 replays need ~270–280s wall on a quiet host against the harness's 300s per-run budget; under fleet-saturated load they exceeded 299s in two observed attempts and the tool reported that honestly (exit 70 + error receipt + reclaimed work root). The final verification pass should run off-peak; no predicate, counter, or control bytes were changed to accommodate load.
- The forgecapture arm is live-network by design (plan: failure reported, never waived); today it bit as designed.
- Sandbox fixture (`/fast/scratch/hyaku/kumitate-r70/K70ExecRunner/fxrepo`, commits `ad8ad3d8…`, `5987f701…`) is a scratch rehearsal substrate, deleted at cleanup; it is not lane state and was never a production write target.
- Receipt digests differ from the frozen r69 receipts by design — the predicate pins the old UNMET label plus CONTROL-PASS, not byte-identical re-execution of 2026-10-27 runs (fixture revs differ per run, as in the original controls).

## Tooling record

No tool installs or updates this seat (none needed): node v24.21.0 (fnm-managed, preexisting), python 3.14.8, git, bash, coreutils — all host-preening per the operator directive; pacman transactions remain paused.

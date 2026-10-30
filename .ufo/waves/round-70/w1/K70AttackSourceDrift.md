# K70AttackSourceDrift — round-70 C1 replay, attack on fail-closed frozen-source handling

Seat: K70AttackSourceDrift (leaf attack seat, mutation-tester role). Lane: /home/vgpnk/Projects/shokunin/kumitate-shokunin. Base B = 78b98d762ccf3e3a0961f94c4042eaabd2bcb706. Frozen plan: 3dbe7e6e2616423d55f0ea2bbcf8fb32fe7bda6a.

## Scope and state observed

- `scripts/control-replay.mjs` does **not** exist in the lane (`git ls-tree 78b98d -- scripts/control-replay.mjs` → empty). `build/K70ExecRunner/` does not exist. Candidate runner was therefore **not** available to test. I did not wait or poll. The attack is run against the contract, the frozen probe, and the frozen originals.
- Frozen bytes unchanged: `round-69/probe/c1-controls.sh` sha256 `01efd6dd…` and `c2-controls.sh` sha256 `679b7d96…` match the base blobs (verified with `git -C … show 78b98d…:` piped to sha256sum). The five committed receipts under `round-69/controls/` match their base blobs (checked, all SAME). Probe bytes `deprec69-probe.mjs`, `ledger69-probe.mjs` match base.
- Originals were **never executed**. Only text was read (`read`, `grep`, `git show`). The counterexample is a text transform.
- Production files: none written. Writes: `build/K70AttackSourceDrift/needle-counterexample.mjs`, `needle-counterexample.out`, this report. Private scratch `/fast/scratch/hyaku/kumitate-r70/K70AttackSourceDrift/` created explicitly, used for mutant/decoy fixtures, removed before yield (`ls` after `rm -rf` → "No such file or directory").
- Git: only read commands against the lane (`rev-parse --show-toplevel` → lane path; `show`, `ls-tree`). The decoy repo for D1/D4 was created in scratch with `git -C DECOY init`; the original-style bare git sequence was then run under an inherited `GIT_DIR` on purpose (that is the defect shown). The decoy was never the lane. No commits, pushes or mutating git in the lane.
- Tooling: none installed or updated. Used pre-existing `node v24.21.0`, `git 2.56.0`, `grep`/`sha256sum`/`python3` already on the host. No pacman, no uv, no npm, no service restarts. Per RULES.md the channel record is "none".

## Commands run and observed outcomes

1. `node .../build/K70AttackSourceDrift/needle-counterexample.mjs /fast/scratch/hyaku/kumitate-r70/K70AttackSourceDrift` (exit 0). Full output at `build/K70AttackSourceDrift/needle-counterexample.out`:

| mutant (edit to frozen c2-controls.sh) | naive first-match generator | fail-closed reference generator |
|---|---|---|
| M0 unmodified base bytes | ACCEPTED-CLEAN (but TMPDIR fixed path survives, D5) | ACCEPTED-CLEAN (same TMPDIR survivor) |
| M1 `W="$LANE/…/controls"` → unquoted `W=$LANE/…/controls` | ACCEPTED-WITH-FROZEN-WRITE: line 24 still `W=$LANE/.ufo/waves/round-69/controls` | REFUSED (source sha mismatch; needle count 0) |
| M2 extra comment line containing the W needle | ACCEPTED-WITH-FROZEN-WRITE: first match is the comment, real `W=` on line 25 untouched | REFUSED (sha mismatch; needle count 2) |
| M3 `> /tmp/forge-sed.txt` → `> /var/tmp/forge-sed.txt` | ACCEPTED-WITH-FROZEN-WRITE: `/tmp/` temp-write survives; needle removal silently no-ops | REFUSED (sha mismatch) |
| M4 trailing space after W line | ACCEPTED-CLEAN (silently accepts an unexpected source edit) | REFUSED (sha mismatch) |

2. Replay of the original c2 git sequence (lines 29, 99–101 pattern) in scratch with `GIT_DIR` inherited to a decoy repo (`D1`): REV `da243943…` was created in the decoy; `fixture show-toplevel` → "not a git repository". The fixture commit landed in the wrong repository. Against the lane this is the mutation path the contract forbids.
3. `GIT_DIR=<decoy>/.git git -C <lane> show 78b98d…:.ufo/waves/round-69/probe/c2-controls.sh` (`D7`) → `fatal: path … exists on disk, but not in '78b98d…'`, exit 128. The probe's own `git` helper inherits env the same way.
4. c1 lesson-copy loop copied from original lines 28–31 with a nonexistent file list (`D3`): `loop exit=0 files_copied=0`. No error.
5. c2 forgecapture registry replace pattern (lines 86–92) run against a registry lacking the needle (`D4`): exit 0, registry unchanged. No error.
6. Static read of frozen probe `replay70-probe.mjs`: lines 22, 24–25, 29, 33, 38; line 20 `env:{...process.env,TMPDIR:root}`.
7. `/tmp/forge-sed.txt` present on host? → absent (not a live symlink risk now, but the path is fixed).

## Defects (actual, observed)

### D1 — Needle substitution is not fail-closed (HIGH, freeze-impacting)
The contract requires refusal on unexpected frozen-source bytes. The obvious implementation (`String.replace(needle, repl)` for LANE/PROBE/W/S plus a regex delete for the /tmp line) silently no-ops on a miss or hits the wrong occurrence. M1 and M2 each produce a copy whose `W=` still resolves to `$LANE/.ufo/waves/round-69/controls`. That is the frozen receipt directory. Downstream, the original line 106 uses `>` (truncate) on `"$W/c2-$MODE.txt"`, and line 107–108 append with `>>`. So the copy truncates the committed `round-69/controls/c2-donothing.txt` (and the others) and appends a `control=` line into it. A count-checked, sha-pinned generator refuses all of M1–M4.

### D2 — Probe preservation check R3–R7 is vacuous (HIGH)
`replay70-probe.mjs` line 24–25 snapshots `before` from `path.join(tree, '.ufo/waves/round-69/controls')`, where `tree` is the `git archive` copy, not the lane. Line 33 re-reads those same archive files. The runner writes its receipts to the lane's real `round-69/controls` path (W) if substitution misses (D1). Nothing in R3–R7 reads that real path, so `preserved` stays `true` after a clobber. Base receipt, observed: `R3 MISS family=c1 mode=donothing exit=1 receipt=0 preserved=true` (and R4–R7 identical). The `preserved=true` in the base receipt is therefore not evidence about the lane's frozen receipts.
Freeze consequence: a W-miss would overwrite five committed round-69 receipts and R3–R7 would still say preserved. The probe is frozen; the fix belongs in the runner (write only to private W, verify the lane receipt sha before and after), not in the probe.

### D3 — Probe executes lane working-tree originals; R1 checks only the REV archive (HIGH)
R1 (line 22) compares the archive copy of the probe to `git show 78b98d…`. The runner is then invoked with `--lane lane` (line 29, 38), which is the working tree. Edits in the working tree to `round-69/probe/c1-controls.sh` / `c2-controls.sh` pass R1 and are never compared. Likewise c1 copies `$LANE/scripts/routed-ledger.mjs` and the `round-*-verifier-spotcheck.md` files from the working tree (original lines 27, 29–31), not from the rev. The runner can run dirty originals and R3–R7 still say CONTROL-PASS for "frozen" controls. Required fix in runner: read originals from `git -C lane show 78b98d:<path>` (immutable blob) and refuse any working-tree or fixture input whose bytes differ from that blob. The working-tree bytes are not evidence.

### D4 — Inherited git environment reaches fixture and probe git (MEDIUM-HIGH)
Observed D1: a `GIT_DIR` inherited into the original's bare `git init -q`, `git add -A`, `git commit`, `git rev-parse HEAD` sequence puts the fixture commit into whatever repo `GIT_DIR` names. Original lines 29, 99–101 are cwd-relative and have no `-C`. Against the lane (`GIT_DIR` = lane `.git`) the fixture `git add -A` would stage and commit into the lane repository. Probe `git()` helper (line 10) and the runner env (line 20) inherit `process.env`. Observed D7: `GIT_DIR` redirects the probe's R1 `git show` → exit 128. This is a false MISS, not a false PASS, but it proves the env is not scrubbed. Required: scrub `GIT_DIR`, `GIT_INDEX_FILE`, `GIT_WORK_TREE`, `GIT_COMMON_DIR`, `GIT_OBJECT_DIRECTORY`, `GIT_ALTERNATE_OBJECT_DIRECTORIES`, `GIT_CEILING_DIRECTORIES` before the copy runs; the copy must use `git -C "$FIXTURE"` for every git call, and the runner must assert `git -C FIXTURE rev-parse --show-toplevel == FIXTURE` before the first commit.

### D5 — Fixed temporary and shared paths survive (MEDIUM)
- `TMPDIR="${HYAKU_SCRATCH:-/fast/scratch/hyaku}/kumitate-r69"` (c1 line 75, c2 line 106) survives unchanged in both the naive and reference outputs (M0). Fixed shared dir; the contract needs a unique mkdtemp child under the supplied work root. Not in the plan's named substitution list, so the candidate must add it explicitly.
- `printf … > /tmp/forge-sed.txt` (c2 line 80): the plan names this line for removal; both generators remove it when it matches exactly (M0). Retargeted (M3) it survives silently in the naive generator.
- `rm -rf "$S"` (c1 line 22, c2 line 26) on `S` derived from `HYAKU_SCRATCH`: destructive if `S` ever points at a shared directory. The copy must assign S to the private work path, not keep the default.

### D6 — Silent skips inside the frozen originals (MEDIUM; inherited by any copy)
- c1 lines 29–31: `[ -f "$f" ] && cp … || true` — D3 demo: 0 files copied, exit 0. Missing verifier-spotcheck lesson silently changes the control fixture.
- c1 lines 49–52 (autoledger python): `if not p.exists(): continue`. Same effect.
- c2 forgecapture lines 86–92 (python `str.replace`, no assertion): D4 demo: needle absent → registry unchanged, exit 0. The "all rows pinned" control silently degrades.
- c2 lines 74–77: the S210 pin update loop has no `else` assert.
A substitution-only generator cannot fix these, because they are runtime behaviour of frozen originals. The runner must pre-check the expected fixture inputs (12 lesson files, the registry needles, the S210 pin) before the copy runs, and refuse on any mismatch. Do not edit the originals.

## Freeze consequence (exact)

- The frozen counter (`replay70-probe.mjs`) and originals (`round-69/probe/c{1,2}-controls.sh`) are **not** changed by any defect above, and no predicate amendment is needed. Ten checks remain the scored predicate.
- If the candidate runner ships with naive substitution (D1), missing REV-blob source verification (D3), inherited git env (D4), or the fixed TMPDIR (D5): R3–R7 can report `CONTROL-PASS … preserved=true` while the committed round-69 receipts (five files, base-blob shas listed above) have been truncated or appended. R1 would also report PASS while the executed originals are dirty. Those R3–R7 and R1 results would be **invalid evidence**, not honest MISSes. Recommendation: score REPLAY70 only after the runner passes the counterexample matrix (M1–M4 refused, D7 env scrub, D6 pre-checks), and record any remaining miss as a miss.
- REPLAY70 target 10/10 cannot be claimed on the current probe alone; the base receipt remains 2/10 (`REPLAY70_UNMET held=2/10`).

## Recommended runner-side checks (for L1 / K70ExecRunner; not implemented by me)

1. Read original c1/c2 bytes from `git -C LANE show 78b98d…:<path>`; refuse if sha ≠ `01efd6dd…` / `679b7d96…` or if working-tree bytes differ.
2. Exact-once needle count for LANE, PROBE, W, S, the /tmp line, and TMPDIR; refuse on 0 or ≥2. Use replacement functions, not string replacement, so `$` patterns in private paths are inert.
3. Post-generation assertions: no `round-69/controls` write target, no `/tmp/`, no fixed `kumitate-r69` TMPDIR.
4. Scrub git env; every git call `-C "$FIXTURE"`; check `rev-parse --show-toplevel` equals FIXTURE before first commit.
5. Pre-check the fixture inputs of D6 (12 lesson files, registry needles, S210 pin) before the copy runs.
6. Before and after each run, sha the real lane `round-69/controls/*.txt` and refuse or report if changed (closes D2 without touching the frozen probe).

## Verification status

- Not run: candidate `control-replay.mjs` (absent). Not run: any original control script. Not run: the frozen replay70 probe (would only re-produce the base 2/10 receipt; not needed for this attack).
- Run: needle counterexample (exit 0, output stored), env-inheritance demo, silent-skip demos, byte-identity checks of frozen bytes and committed receipts.
- No installs/updates. Scratch removed. Ready for L1 integration.

Report: .ufo/waves/round-70/w1/K70AttackSourceDrift.md

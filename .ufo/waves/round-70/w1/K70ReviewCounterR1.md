# K70ReviewCounterR1 — R1 baseline pinned script-byte comparison + foreign lane behavior

Seat: K70ReviewCounterR1 (reviewer, leaf). Scope: probe check R1 only, plus probe behavior when the
`--lane` argument names a foreign lane. Frozen plan commit verified:
`3dbe7e6e2616423d55f0ea2bbcf8fb32fe7bda6a` = `git rev-parse 3dbe7e6e` ("round-70: freeze replay
isolation claim and negative baseline"); working-tree `plan.md` is clean at HEAD `1e00955a`.
No production files, frozen bytes, or other seats' artifacts were modified. No installs performed
(nothing needed; git 2.56.0, node v24.21.0 used as found).

Canonical-runtime identity: probe working-tree sha256 `63f52b75…f0c1` ==
`.ufo/pins/counter-pins.json` pin `replay70-probe` (`aa023b97…` committed and clean). Canonical lane
has no replace refs (`git replace -l` empty), no grafts, not shallow — one clean runtime.

## Commands run and outcomes (full transcripts: build/K70ReviewCounterR1/probe-*.txt)

1. Base reproduction, canonical lane:
   `TMPDIR=/fast/scratch/hyaku/kumitate-r70/K70ReviewCounterR1 node .ufo/waves/round-70/probe/replay70-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin 78b98d762ccf3e3a0961f94c4042eaabd2bcb706`
   → `REPLAY70_UNMET held=2/10`, R1 PASS, R9 PASS, exit 1. Byte-identical check lines to
   `base/replay70-base.txt` (whose sha256 is `0b37e114…`). Baseline receipt reproduced exactly.
2. Frozen-byte consistency: `sha256sum` of both r69 scripts identical across B, freeze commit
   `3dbe7e6e`, and worktree (c1 `01efd6dd…`, c2 `679b7d96…`); `git status` on frozen paths clean.
   Both scripts are valid UTF-8 (`file`), so the probe's decoded-string comparison is byte-injective
   for these inputs — the utf8 `git show` decoding is not a defect here.
3. Foreign lane, full history (`git clone --no-checkout` of the lane into private scratch;
   `rev-parse --show-toplevel` verified == fixture before any commit): probe at REV=B →
   identical `held=2/10`, R1 PASS. R1 is lane-agnostic given the object store contains B.
4. R1 mutation test (scratch fixture commit `39dd67d1…`, one sed-tampered comment byte in
   c1-controls.sh): probe → R1 MISS, `held=1/10`. R1 bites on content tampering. Working as intended.
5. Symlink probe (scratch fixture commit `0c930a52…`, c1-controls.sh replaced by symlink to the
   canonical lane file; tree entry `120000 blob df84e567…` ≠ frozen `100755 blob 3658b54c…`):
   probe → **R1 PASS, held=2/10**. See Finding 1.
6. Foreign lane missing B (true shallow via `file://`; `cat-file -e B` exit 1):
   probe → `REPLAY70_ERROR … reason=archive:fatal: not a tree object`, exit 2. Honest failure,
   no waiver, no mutation. Bounded: foreign lanes must contain B; the plan's predicate command
   pins the lane argument to the canonical lane, so this is informational only.

Candidate under review: `build/K70ExecRunner` does not exist (only K70AttackConcurrent,
K70AttackReceiptOverwrite, K70ExecFixtureTests present); nothing to inspect. `scripts/control-replay.mjs`
absent from the lane, as expected pre-integration.

## Findings

### F1 (medium) — R1 is content-comparison-only and accepts a rerouting symlink at the measured rev

Evidence: receipt `probe-symlink-rev0c930a52.txt`. At rev `0c930a525840a69cae34ce49ed9faf673e66ef32`
the tree stores `.ufo/waves/round-69/probe/c1-controls.sh` as mode-120000 symlink blob
`df84e567562f434ede05aa95f84755ceec3a469a` (verified: `git hash-object` of the target path string),
whereas the frozen blob at B is mode-100755 `3658b54ca300f829e4336b259603a4b82a514594`. R1 still
reports PASS because `fs.readFileSync` follows the symlink and the resolved content equals
`git show B:…` output. The check compares resolved text, not git object identity (type/mode/blob),
so the predicate's stated obligation "R1 preserves the two frozen round-69 control scripts" can be
satisfied by a tree that no longer contains the frozen script as a file — the script is reachable
only through a host absolute path (here, back into the canonical lane). Corollary: R1 is also
mode-blind for regular files (an exec-bit flip would pass).

Impact is bounded: exploitation requires commit/integration access to the measured REV, and R3–R7
execute tool-bound private copies rather than these tree entries, so receipts are not directly
spoofed through this hole. But the R1 guard as written does not detect the rerouting it claims to
guard against, and later rounds reading the r69 probe paths from the tree (e.g. an integration that
`cat`s the archived file) would silently consume lane-external content. Fix direction for L1
(pre-scoring; any probe change re-pins `counter-pins.json` and re-freezes): compare
`git rev-parse <REV>:<path>` against `git rev-parse <B>:<path>` for both frozen scripts (covers
type+mode+blob), or at minimum `lstat` the extracted entry and require regular-file mode before
reading content.

### F2 (info) — R1's pinned `git show` is only as canonical as the lane object store

R1 resolves the pinned bytes via `git -C <lane> show <B>:<path>`. Verified clean for the canonical
lane (no replace refs/grafts/shallow). In a foreign lane that contains B plus a replace ref for B,
the comparison would run against replacement content; the predicate command pins the lane argument
to the canonical lane, so this is out of contract — recorded so the close sequence keeps foreign-lane
invocations out of scored receipts.

## Verified correct (no action)

- R1 detects a 1-character content tamper (held 2/10 → 1/10; `probe-tamper-rev39dd67d.txt`).
- Base receipt reproduced byte-identically in canonical and full-history foreign lanes
  (`probe-base-rev78b98d7.txt`, `probe-foreign-lane-rev78b98d7.txt`).
- Missing-B foreign lane fails honestly with exit 2 (`probe-shallow-lane-error.txt`).
- UTF-8 decode concern investigated and dismissed: both frozen scripts are valid UTF-8, decoded
  comparison is byte-injective for these blobs.

## Residual risk / verification gaps

- F1's fix is an L1 integration decision; this seat changed nothing. If L1 keeps R1 as-is, the
  freeze-map/close audit should add an explicit `git ls-tree` mode+blob check for the two frozen
  paths so the rerouting gap is covered somewhere in the round.
- I did not exercise c1/c2 control execution paths (R3–R7 semantics) — out of this seat's scope.
- Receipt transcripts in `build/K70ReviewCounterR1/` were transcribed from observed command output;
  all underlying scratch fixtures were deleted after use (scratch dir empty at yield).

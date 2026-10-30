# K70ExecTransform — exact-count transformation draft (frozen r69 controls → safe private replay scripts)

Lane: `/home/vgpnk/Projects/shokunin/kumitate-shokunin`. Base B = `78b98d762ccf3e3a0961f94c4042eaabd2bcb706`.
Seat scope: draft only. No production file touched; frozen scripts are read-only inputs; originals never executed.

## Frozen sources (pinned, never amended)

| script | bytes | lines | sha256 |
|---|---|---|---|
| `.ufo/waves/round-69/probe/c1-controls.sh` | 3844 | 83 | `01efd6dde4c987b676b1930f647cc283768e1ae8113fd076b313e54b56aeda12` |
| `.ufo/waves/round-69/probe/c2-controls.sh` | 7030 | 119 | `679b7d9619ab8d79139cfe8e956e425f7ccbbf7e58b6eaee5cb72c3deb3a66f4` |

Machine-readable pins: `frozen-digests.json` (includes both probe hashes:
ledger69 `1f19d1e6…946de`, deprec69 `af021f87…52e7`). Any generator must verify frozen bytes
against this table first and exit 65 (`REFUSE-SOURCE-DRIFT`) on any byte, length, or
needle-count mismatch. Source needle drift is refused, never repaired.

## Private replay contract (draft)

The private scripts are spawned by the future `scripts/control-replay.mjs` with env
`R70_LANE` (lane dir), `R70_WORK` (work root; tool makes a unique `mktemp -d` child under it),
`R70_OUT` (exclusive receipt target). Both drafts:

- refuse when `$R70_OUT` already exists (`REPLAY-REFUSE output-exists`, exit 73) and create it
  exclusively (`set -o noclobber`);
- scrub inherited repository environment (`GIT_DIR`, `GIT_WORK_TREE`, `GIT_INDEX_FILE`,
  `GIT_OBJECT_DIRECTORY`, `GIT_ALTERNATE_OBJECT_DIRECTORIES`, `GIT_PREFIX`, `GIT_QUARANTINE_PATH`);
- stage receipts inside the private child (`W="$S/w"`), copy the receipt to `$R70_OUT`
  **before** the EXIT trap removes `$S`, leaving the supplied work root empty;
- append the verdict line (`CONTROL-PASS <mode>` / `CONTROL-FAIL …`) into the receipt itself —
  the frozen scripts printed the verdict to stdout only, but the R70 probe requires the
  receipt file at `--out` to contain `CONTROL-PASS <mode>`;
- preserve the frozen counter semantics untouched: same fixture content, same probe, same
  UNMET label expectations (`LEDGER69_UNMET` / `DEPREC69_UNMET`, exit 1 → replay exit 0).

## 1. Exact-count substitution table (each needle fires exactly once per script)

| # | frozen needle (c1 / c2) | replacement | count |
|---|---|---|---|
| T1 | `LANE=/home/vgpnk/Projects/shokunin/kumitate-shokunin` | `LANE="${R70_LANE:?R70 lane dir required}"` | 1 |
| T2 | `PROBE="$LANE/.ufo/waves/round-69/probe/ledger69-probe.mjs"` (c1) / `deprec69-probe.mjs` (c2) | byte-identical identity rewrite (still lane-relative) | 1 |
| T3 | two-line block `W="$LANE/.ufo/waves/round-69/controls"` + `S="${HYAKU_SCRATCH:-/fast/scratch/hyaku}/kumitate-r69/c{1,2}-controls-$MODE"` | `S=$(mktemp -d "${R70_WORK:?…}/c{1,2}-controls-$MODE.XXXXXXXX")` then `W="$S/w"` (order swapped: S before W) | 1 block (2 assignments) |
| T4 | `rm -rf "$S"; mkdir -p "$S/fx"` | `mkdir -p "$S/fx" "$S/tmp"` (shared-path `rm -rf` eliminated; fresh mkdtemp needs no rm) | 1 |
| T5 | `git init -q` | `git -C "$S/fx" init -q` | 1 |
| T6 | `git add -A` | `git -C "$S/fx" add -A` | 1 |
| T7 | `git -c user.name=ctl -c user.email=ctl@invalid -c commit.gpgsign=false commit -q --no-verify -m "c{1,2}-$MODE fixture"` | same with `git -C "$S/fx"` prefix | 1 |
| T8 | `REV=$(git rev-parse HEAD)` | `REV=$(git -C "$S/fx" rev-parse HEAD)` | 1 |
| T9 | `TMPDIR="${HYAKU_SCRATCH:-/fast/scratch/hyaku}/kumitate-r69" node "$PROBE" …` | `TMPDIR="$S/tmp" node "$PROBE" …` | 1 |
| T10 | tail case-block (verdict to stdout only) | `replay_verdict()` + tail that appends the verdict into the receipt and copies it exclusively to `$R70_OUT` | 1 |
| T11 | c2 only, frozen line 80: `printf '%s\n' '- S207 — capture 2026-10-30 — pinned' > /tmp/forge-sed.txt` | **removed** (the known unused fixed temporary write; nothing reads `/tmp/forge-sed.txt`) | 1 deletion |
| T12 | preamble insert after `set -euo pipefail` | env-scrub loop, `R70_LANE/R70_WORK/R70_OUT` guards, `mkdir -p "$R70_WORK"`, output-exists refusal, EXIT cleanup trap | 1 insert |

Unchanged on purpose: `cd "$S/fx"` (now a private dir), the mode heredocs (c1 autoledger
python, c2 origin/forge python blocks — all relative paths stay valid), `mkdir -p "$W"`,
receipt file names `c{1,2}-$MODE.txt` (now under `$S/w`), c2's lane-archive read and its
intrinsic `*) exit 64` mode gate, and both frozen probe invocations.

## 2. Shell git-write inventory (frozen → private)

Every git invocation in the two frozen shell scripts:

| # | frozen line | invocation | writes? | private form |
|---|---|---|---|---|
| c1-G1 | 24 | `git init -q` (cwd = `$S/fx`) | creates repo metadata in fixture | `git -C "$S/fx" init -q` |
| c1-G2 | 71 | `git add -A` (cwd = `$S/fx`) | index write in fixture | `git -C "$S/fx" add -A` |
| c1-G3 | 72 | `git -c user.name=ctl … commit -q --no-verify -m "c1-$MODE fixture"` | commit in fixture | `git -C "$S/fx" -c …` |
| c1-G4 | 73 | `REV=$(git rev-parse HEAD)` | read | `REV=$(git -C "$S/fx" rev-parse HEAD)` |
| c2-G1 | 27 | `git -C "$LANE" archive 14057f3e3899180c95713bace088fb9c0d0046e3 \| tar -x --no-same-owner --no-same-permissions -C "$S/fx"` | **lane read only** (archive); extract writes fixture tree | byte-identical (lane stays read-only; target is private `$S/fx`) |
| c2-G2 | 29 | `git init -q` | creates repo metadata in fixture | `git -C "$S/fx" init -q` |
| c2-G3 | 99 | `git add -A` | index write in fixture | `git -C "$S/fx" add -A` |
| c2-G4 | 100 | `git -c user.name=ctl … commit -q --no-verify -m "c2-$MODE fixture"` | commit in fixture | `git -C "$S/fx" -c …` |
| c2-G5 | 101 | `REV=$(git rev-parse HEAD)` | read | `REV=$(git -C "$S/fx" rev-parse HEAD)` |

Result: **9 frozen git invocations; 0 bare fixture git calls remain in the private drafts**
(all fixture calls carry explicit `-C "$S/fx"`; the only non-`-C` git left is the read-only
lane archive, which already used `-C "$LANE"`).

Non-git frozen writes and their disposition: shared-scratch `rm -rf "$S"` + `mkdir` (c1 l.22,
c2 l.26) eliminated; fixture file writes (`cp`, `printf`, `cat >`, python heredocs) kept —
all under private `$S/fx`; frozen receipt path `.ufo/waves/round-69/controls/c{1,2}-$MODE.txt`
(c1 l.74–79, c2 l.102/106/108/109/110/113) rerouted to `$S/w/…`; probe `TMPDIR` rerouted to
`$S/tmp`; c2 l.80 `/tmp/forge-sed.txt` removed.

## 3. Source needle drift refusal

- `transform.mjs loadFrozen()` verifies bytes + sha256 + probe presence; any mismatch →
  `REFUSE-SOURCE-DRIFT`, exit 65, before any output is written.
- `sub1()` counts each needle; count ≠ 1 → same refusal (catches drift inside the frozen body,
  not just at file level).
- Post-generation `verify()` asserts zero forbidden remnants: `HYAKU_SCRATCH`, `kumitate-r69`,
  `.ufo/waves/round-69/controls`, `/tmp/forge-sed`, `rm -rf "$S"; mkdir`, bare
  `git init -q` / `git add -A` / `git rev-parse HEAD`; asserts each `git -C "$S/fx" …` form
  occurs exactly once; c2 must keep the lane-archive line exactly once; c1 must not gain one.

## 4. Outputs of this draft

- `private/c1-controls.private.sh`, `private/c2-controls.private.sh` — generated drafts
  (mode 0700), byte-derived from the frozen scripts by `transform.mjs`.
- `transform.mjs` — generator + verifier (runs `generate` and `verify`).
- Smoke receipts: `receipts/*.txt` (private runs; see seat report for observed outcomes).

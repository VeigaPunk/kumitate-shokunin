# K89ExecReceipts — arm-level receipts for the frozen probe89-c1 scorer

Seat K89ExecReceipts (executor, leaf). Nothing committed. Writes limited to
`.ufo/waves/round-89/build/K89ExecReceipts/` and this report. Scratch under
`/fast/scratch/hyaku/kumitate-r89/K89ExecReceipts/` was removed after the receipts were copied.
No tools installed; no pacman touched. The frozen probe was executed, never edited, moved or re-timed
(except for the three determinism runs and one timed run that the assignment requires).

## Revision and tool

- `--rev a5d2503393fc5646acb6468888d8b12a445bf62d` (lane base) for all probe runs.
- `--tool /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/receipt-bind.mjs`: the worktree
  file, sha256 `70dbcd5d02e30c831bc7ba9b80539d7443cb76a0e0d9dad0ad70e1e293384b4a`.
  The lane HEAD is `9c3b64e4…`, not the base `a5d2503…`, and `scripts/receipt-bind.mjs` carries an
  uncommitted v3 diff (`kumitate-receipt-bind-v3`). The committed base blob is v2 (sha256
  `1f11f124…80ea`), which `controls/table.txt` row `base-v2-at-rev` scores 27/30.
  All runs below scored the v3 worktree file, because the assignment names that tool path. The
  base-rev v2 blob was not re-scored by this seat.
- Node v24.21.0.

## 1. Determinism: three full probe runs

Command, per run `i` ∈ {1,2,3}, each with its own `--work`:

```
node .ufo/waves/round-89/probe/probe89-c1.mjs --lane <LANE> --work <S>/run<i> \
  --rev a5d2503393fc5646acb6468888d8b12a445bf62d --tool <LANE>/scripts/receipt-bind.mjs
```

Each run exited 0 and its final line was `C89_C1: HELD held=30/30`. Byte-identity of the verdict line
(`sed 's/.*C89_C1/C89_C1/' | sha256sum`):

```
c26be2cdc0e7732217a3b1a01a8a15d41603a6a88f7fb13f06c7e1b0664857e6  (run 1)
c26be2cdc0e7732217a3b1a01a8a15d41603a6a88f7fb13f06c7e1b0664857e6  (run 2)
c26be2cdc0e7732217a3b1a01a8a15d41603a6a88f7fb13f06c7e1b0664857e6  (run 3)
```

Each run printed 30 `ARM` lines, all `PASS`. Diffing the `ARM` lines of run 1 against runs 2 and 3, after
replacing the 12-hex nonce and the scratch path, leaves only the fixture commit-hash prefixes
(`at <sha7>`, e.g. `at NNNbc2c` vs `at NNN75f7`) in the `unresolved`, `untracked-instrument` and
`symlink-instrument` detail strings. The commit hashes differ because the commit timestamps differ. So the
predicate line is byte-identical; the detail strings are not, and the probe's design expects that.

Receipts: `build/K89ExecReceipts/probe-run{1,2,3}.receipt.txt` (raw output `probe-run{i}.txt`).

## 2. Ten new arms reproduced outside the probe

Driver: `build/K89ExecReceipts/repro89-arms.mjs`. It does not import or read `probe89-c1.mjs`. It builds
the same fixture shape from its own code: `git init` in its own `indep-<nonce>` directory, verified with
`rev-parse --show-toplevel`; commits A→B→C plus a symlink-instrument commit D; staged body S; dirty
worktree W; untracked `fresh-<nonce>.mjs`. Its filenames are `indep-tool-<nonce>.mjs`,
`indep-link-<nonce>.mjs` and `indep-fresh-<nonce>.mjs`. It runs `scripts/receipt-bind.mjs` directly on each
arm and prints the raw verdict. Two runs, nonces `9eaa57e63408` and `7d08c3b926a4`, gave identical verdicts.

Receipt: `build/K89ExecReceipts/repro-arms.receipt.txt` (contains `repro-arms.txt`, the second run).

| arm | probe verdict (run 1) | independent verdict | match |
|---|---|---|---|
| `default-rev-not-head` (A21) | `CLEAN matched=1 mismatched=0 unchecked=0 external=0` | `CLEAN matched=1 mismatched=0 unchecked=0 external=0` | yes |
| `index-not-judged` (A22) | `CLEAN matched=1 mismatched=0 unchecked=0 external=0` | same | yes |
| `abs-in-lane-at-rev` (A23) | `CLEAN matched=1 mismatched=0 unchecked=0 external=0` | same | yes |
| `limit-edge` (A24) | 1048576 bytes `CLEAN`; 1048577 bytes `FAIL-CLOSED RECEIPT_TOO_LARGE` | same sizes and verdicts | yes |
| `limit-before-read` (A25) | 1 GiB sparse, mode 0000: `FAIL-CLOSED RECEIPT_TOO_LARGE` | same | yes |
| `escape-inner-dotdot` (A26) | `FAIL-CLOSED ESCAPES_LANE` (`scripts/../../outside2-…/ext2-….mjs`) | same token, own paths | yes |
| `dup-equal-field` (A27) | both equal-valued duplicates `FAIL-CLOSED AMBIGUOUS_FIELD` | same | yes |
| `alias-proc-root` (A28) | `DRIFT matched=0 mismatched=1 unchecked=0 external=0 first=r.txt` | same | yes |
| `bom-rev` (A29) | `CLEAN matched=1 mismatched=0 unchecked=0 external=0` | same | yes |
| `symlink-instrument` (A30) | `FAIL-CLOSED SYMLINK_INSTRUMENT` at C, `scripts/link-<nonce>.mjs` | same token, own nonce | yes |

Every reproduced arm matched the probe's verdict class. None failed to reproduce.

## 3. Wall time of one full probe run

`/usr/bin/time -v` on run 1 (`build/K89ExecReceipts/probe-run1-timed.receipt.txt`, stderr in
`probe-run1-time.txt`):

```
Elapsed (wall clock) time (h:mm:ss or m:ss): 0:02.87
Maximum resident set size (kbytes): 66328
```

Runs 2 and 3 took 2.92 s each by the same `time -v` (`Elapsed` line only; not separately receipted).

## Findings and notes for the L1

- No non-reproductions. The three byte-identical `C89_C1: HELD held=30/30` lines, the ten independent
  arm reproductions and the timing are all in the build directory.
- The instrument that scored was the uncommitted v3 worktree file (`70dbcd5d…`), not the base-rev blob. If
  the wave wants the committed revision scored, the probe needs re-running after the v3 commit lands. The
  base-rev v2 blob scores 27/30 by design.
- Determinism holds for the `C89_C1:` line. The `ARM` detail strings carry the fixture commit-hash
  prefixes, so a consumer diffing whole stdout across runs will see differences.
- `repro89-arms.mjs` was run twice. The first run printed 9 arms before an A29 insertion, and I rebuilt
  the driver before the final run. Only the final run's output is receipted.

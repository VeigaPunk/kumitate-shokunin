# K91CriticB — harm check: does the v5 edit change any v4 verdict on real lane history?

**RULING: NO HARM** (scoped to the positive control `controls/ref-fd-fstat.mjs`, sha256 `bc3df527ec224f2f5542d4c42f5583920503e433b5f39734a7be4db626a894db`, vs v4 base `0bff4babeec90dd57ea36efeaa94b66db9af381d` `scripts/receipt-bind.mjs`, sha256 `35f4f25e6130dd827747ceff8ced80682d96c6c04d9516f2a463ce58cc7c1fce`).

## Method

- Frozen rev `2b1b8bf3d274db8e608035bffb27bd3b3d4009d4`. Committed `.ufo/waves/round-*/close/` dirs enumerated with `git ls-tree -r --name-only` (521 files under 43 close dirs, rounds 45–90), extracted with `git archive <rev> <dir> | tar -x -C <scratch>/raw`.
- Each tool run as `prlimit --as=2147483648 timeout 60 node <tool> --dir <dir> --rev 2b1b8bf3… --lane /home/vgpnk/Projects/shokunin/kumitate-shokunin`, stdout+exit compared. Driver: `evidence/run.sh` (log `evidence/run.log`: `DIRS_DONE`, `singles=479`, `SINGLES_RAN`, `ALL_DONE`).
- Dir run: each close dir as `--dir`. Single run: each direct `*.txt` receipt copied alone into its own dir.
- AGREE = identical stdout AND identical exit code. A DIFF would have been counted and classified.

## Counts

| set | units | AGREE | DIFF | v4 CLEAN / DRIFT / FAIL-CLOSED | exit pairs |
|---|---|---|---|---|---|
| close dirs (`dirs.tsv`) | 43 | **43** | **0** | 3 / 35 / 5 | 0/0 ×3, 1/1 ×35, 2/2 ×5 |
| single receipts (`singles.tsv`) | 479 | **479** | **0** | 58 / 380 / 41 | 0/0 ×58, 1/1 ×380, 2/2 ×41 |

- `.txt` files in the extracted tree: 485. Of these, 479 are direct children of a close dir (what both tools walk: `*.txt` directly under `--dir`; subdirectories are not walked, per the v4 declared limits). The 6 nested `.txt` files are 5 under `round-70/close/replay/` (`ctl-c1-autoledger`, `ctl-c1-donothing`, `ctl-c2-autoorigin`, `ctl-c2-donothing`, `ctl-c2-forgecapture`) and 1 under `round-85/close/s5-fixtures/receipt.txt`. Neither tool reads them, so they are not a verdict difference.
- stderr: 0 rows with `ERR:` in either TSV. No timeouts (rc 124 absent), no signals.
- Non-vacuous: CLEAN verdicts occur (58 singles, 3 dirs), the 5 round-86..90 `census.txt` singles bind an external instrument (`external=1`), and FAIL-CLOSED `REV_UNRESOLVED` occurs 41 times in both tools.

## DIFF rows

None. Per the Change spec, every DIFF would be classed "claimed class (expected)" or "harm". Zero DIFF rows, so no harm and no expected-class difference.

## Scope of this ruling (what it does and does NOT show)

1. **No declared class is exercised by real history.** The only absolute instrument outside the lane is `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh` (5 receipts; `evidence/external-instrument-stat.txt`: regular file, 35466 bytes, not a symlink). It is neither a non-regular file, nor empty, nor over the 16777216 cap, nor at the cap. The clean AGREE therefore shows the edit does not disturb the ordinary path. It does NOT witness the declared-class behaviour; the frozen probe `probe91-c1.mjs` does that. (`evidence/abs-instr.txt`.)
2. **The integrated v5 was not tested.** `git show 2b1b8bf3…:scripts/receipt-bind.mjs | sha256sum` = `35f4f25e…c1fce` = v4, i.e. the lane's own file at the frozen rev is still v4. The tested v5 surface is the committed positive control only. A harm check of the integrated `scripts/receipt-bind.mjs` v5 needs the edit landed at M; this seat did not do that and did not edit the lane.
3. The harm check compares verdict text lines and exit codes, not per-receipt JSON rows. Receipt-level equivalence beyond the text line is not separately checked.

## Observation (both tools, identical; not a v5 issue)

41 singles and 5 dirs are FAIL-CLOSED `REV_UNRESOLVED` because `rev=` carries a non-40-hex value (e.g. `rev="9e3e3ed9… date=…"`, `rev="working-tree"`, `rev="<pre-close worktree> …"`). Both v4 and the control refuse these identically; this is a pre-existing receipt-format pattern, not a harm of the edit.

## Evidence (in `.ufo/waves/round-91/K91CriticB/`)

- `dirs.tsv` (43 rows, verdict column all AGREE), `singles.tsv` (479 rows, all AGREE).
- `evidence/run.sh`, `evidence/run.log`, `evidence/close-dirs.txt`, `evidence/close-files.txt` (521 committed close-receipt paths at the frozen rev), `evidence/abs-instr.txt`, `evidence/external-instrument-stat.txt`, `evidence/receipt-bind-v4.mjs` + `evidence/v4.sha256`.
- Per-receipt copies and outputs lived in scratch `/fast/scratch/hyaku/kumitate-r91/K91CriticB/` (removed before yield). The driver is `evidence/run.sh`; it was run once (`evidence/run.log`) and not re-run, so byte-for-byte reproduction is not verified.

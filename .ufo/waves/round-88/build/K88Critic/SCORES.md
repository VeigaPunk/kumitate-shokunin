# K88Critic — constructions scored with the FROZEN probe88-c1

Probe `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-88/probe/probe88-c1.mjs`
sha256 `5ccd01ec459eacc5b9ae08717cc6154c08e09880d2580f9128fa9390c6739d2b` (byte-equal to freeze 114877a3).
Every run: `--lane /home/vgpnk/Projects/shokunin/kumitate-shokunin --rev 0ff3562f15c18d0ca01dc6a76c9f827d30c26950 --work /fast/scratch/hyaku/kumitate-r88/K88Critic/w-<name> --tool <cand>`
(driver `score.sh`). Base of every diff: `git show 0ff3562f:scripts/receipt-bind.mjs` (sha256 `098a6713…cace4d`,
equal to the lane file). Diffs in `cand/<name>.diff`, candidates in `cand/<name>.mjs`, receipts `transcript-<name>.txt`.

| construction | skipped behaviour | diff | held | failing arms | probe exit |
|---|---|---|---|---|---|
| integrated (reference) | — | 0 | **20/20** | — | 0 |
| a-worktree-twin (make-worktree-variant.mjs) | revision binding (worktree bytes) | blobAt body | 11/20 | selftest, clean-r87, rev-receipt-wins, worktree-forgery, default-rev, untracked-instrument, symlink-dir, oversize, duplicate-field | 1 |
| b-ignore-receipt-rev | receipt `rev=` precedence | 1 line | 16/20 | selftest, clean-r87, rev-receipt-wins, rev-receipt-negative | 1 |
| c-head-all (`git cat-file blob HEAD:<rel>`) | revision binding | 1 line | 16/20 | selftest, clean-r87, rev-receipt-wins, rev-receipt-negative | 1 |
| **c2-head-default** (HEAD when receipt has no `rev=`; `--rev` still validated) | revision binding of the judged `--rev` | 1 line | **20/20** | — | 0 |
| **d-fixture-gated-boundaries** (4 v2 boundaries only when `--dir` path matches `/probe88/`) | all four fail-closed boundaries outside the fixture | 6 lines | **20/20** | — | 0 |
| d2-fixture-gated-revision (worktree bytes unless lane path matches `/probe88/`) | revision binding outside the fixture | +2 lines | 19/20 | clean-r87 | 1 |
| e-index-all (`git cat-file blob :<rel>`) | revision binding | 1 line | 16/20 | selftest, clean-r87, rev-receipt-wins, rev-receipt-negative | 1 |
| **e2-index-default** (index when receipt has no `rev=`) | revision binding of the judged `--rev` | 1 line | **20/20** | — | 0 |
| **f1-size-after-read** (read whole, then compare length) | "refused before it is read" | 1 line moved | **20/20** | — | 0 |
| **f4-textual-escape** (ESCAPES_LANE only for tokens starting `../`; other escapes → `external`) | ESCAPES_LANE by resolution | 2 lines | **20/20** | — | 0 |
| **f5-loose-limit** (limit 2000000, not 1048576) | RECEIPT_TOO_LARGE at 1048576 | 1 line | **20/20** | — | 0 |
| **f6-dup-equal-ok** (equal-valued duplicate `rev=`/`tool_sha256=` accepted) | AMBIGUOUS_FIELD "more than one line" | 1 line | **20/20** | — | 0 |

Seven constructions reach `C88_C1: HELD held=20/20` exit 0. Kill rule (plan.md, frozen): any seat-constructed control
at 20/20 makes C1 UNMET.

## Out-of-probe discrimination (`discriminate.mjs`, receipts `disc-<name>.txt`)

Each 20/20 construction is shown to actually skip its behaviour on a fixture whose path does not contain `probe88`
(lane fixture with commits first(V1)=A, second(V2)=B=HEAD=index). Integrated column = expected behaviour.

| case | integrated | c2 | e2 | d | f1 | f4 | f5 | f6 |
|---|---|---|---|---|---|---|---|---|
| default-rev-not-head: no `rev=`, digest(V2), `--rev A` | DRIFT mm=1 | **CLEAN** | **CLEAN** | DRIFT | DRIFT | DRIFT | DRIFT | DRIFT |
| symlink-dir-unbranded | SYMLINK_DIR | = | = | **CLEAN** | = | = | = | = |
| escape-inner-dotdot `node scripts/../../outside/ext.mjs` | ESCAPES_LANE | = | = | **CLEAN ext=1** | = | **CLEAN ext=1** | = | = |
| oversize-1.5MiB | RECEIPT_TOO_LARGE | = | = | **CLEAN** | = | = | **CLEAN** | = |
| dup-rev-equal | AMBIGUOUS_FIELD | = | = | **CLEAN** | = | = | = | **CLEAN** |
| oversize-sparse-256MiB (maxrss) | TOO_LARGE 56580 kB | = | = | **CLEAN 580340 kB** | TOO_LARGE **579836 kB** (read whole) | = | = | = |
| dup-cmd-unbranded | AMBIGUOUS_FIELD | = | = | **CLEAN** | = | = | = | = |

The integrated instrument is correct on every discriminating case; the defect is the probe's coverage, not the tool.

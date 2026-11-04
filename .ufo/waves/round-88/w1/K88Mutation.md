# K88Mutation — mutant battery against `scripts/receipt-bind.mjs` @ 0ff3562f

Seat: mutation-tester, round 88, wave w1. Target: `scripts/receipt-bind.mjs` as committed at
`0ff3562f15c18d0ca01dc6a76c9f827d30c26950` (sha256 `098a6713e663cbb9444ea6ec1da503cbf4bba5690c492b5ec9e73f9ee6cace4d`).
Judged rev for every run: `0ff3562f15c18d0ca01dc6a76c9f827d30c26950`. Lane HEAD at measurement: `8e4ea5f6503e4dccced9ffcfbf95c6882b7cc29b`.
Frozen probe sha256 `5ccd01ec459eacc5b9ae08717cc6154c08e09880d2580f9128fa9390c6739d2b`;
`git diff --quiet 114877a3 -- .ufo/waves/round-88/probe .ufo/waves/round-88/plan.md` → rc 0 (unchanged).
Nothing committed; no lane/fleet file written outside `build/K88Mutation/` and this report.

## Headline

- 25 mutants + the frozen worktree twin (M26) = 26. **18 killed, 8 survive both the frozen probe
  (20/20) and the tool's own `--selftest` (PASS 39/39).**
- Survivors: `M05-size-gt-to-ge`, `M11-symdir-after-readdir`, `M16-size-x2`, `M17-size-minus1`,
  `M18-size-plus1`, `M23-size-after-read`, `M24-size-on-chars`, `M25-receipt-rev-unverified`.
- A seat-constructed boundary battery (`boundary-battery.mjs`, 9 cases, pristine 9/9) kills all 8.
- **Kill-rule flag (for the L1/critic to adjudicate, not judged here):** M16 (`MAX_RECEIPT_BYTES = 2097152`)
  reaches 20/20 while refusing nothing in 1048577..2097152 bytes — i.e. it does not implement the plan's
  `RECEIPT_TOO_LARGE (a receipt larger than 1048576 bytes)` boundary over that range. M18 (limit+1), M23
  (size checked only after the whole receipt is read; contract says "refused before it is read") and M24
  likewise skip parts of that boundary; M11 skips `SYMLINK_DIR` for a dangling `--dir` link. If any of
  these counts as "a tool that skips … one of the four new fail-closed boundaries by construction", the
  frozen kill rule makes C1 UNMET. Message sent to KumitateR88.
- **Selftest coverage gap:** the instrument's `--selftest` (39 arms) contains **no** case for any of the
  four v2 tokens. Every mutant that deletes/weakens a v2 check (M01–M04, M07, M12, M15, M19–M21) passes
  selftest 39/39 and is killed only by the frozen probe.
- Restoration: the target was never mutated in place (mutants are copies). Lane
  `scripts/receipt-bind.mjs` sha256 = `098a6713…cace4d` before and after = blob at 0ff3562f;
  `git status --short` shows no change under `scripts/`, `probe/`, `controls/`; `sha256sum -c mutants/SHA256SUMS`
  27/27 OK. Probe on the restored lane file (`M00-restored-lane`): `C88_C1: HELD held=20/20` exit 0,
  selftest PASS 39/39 — same as the pristine copy (`M00-pristine`), so no baseline failure.

## Table (probe = frozen `probe88-c1.mjs --tool <mutant>`; selftest = `<mutant> --selftest --work`)

| id | change | probe held | selftest | verdict | killed-by (probe arm / selftest arm) | seat battery kills |
|---|---|---|---|---|---|---|
| M00-pristine | baseline copy | 20/20 | PASS 39/39 | baseline | — | none (9/9) |
| M01-del-escapes-lane | ESCAPES_LANE line deleted | 19/20 | PASS 39/39 | killed | probe:escape-relative | — |
| M02-del-symlink-dir | SYMLINK_DIR line deleted | 19/20 | PASS 39/39 | killed | probe:symlink-dir | — |
| M03-del-too-large | RECEIPT_TOO_LARGE line deleted | 19/20 | PASS 39/39 | killed | probe:oversize | — |
| M04-del-ambiguous | AMBIGUOUS_FIELD throw deleted | 19/20 | PASS 39/39 | killed | probe:duplicate-field | — |
| M05-size-gt-to-ge | `st.size >` → `>=` | 20/20 | PASS 39/39 | **survived** | — | battery:size-1048576 |
| M06-size-gt-to-lt | `st.size >` → `<` | 4/20 | FAIL 14/39 | killed | 16 probe arms, 25 selftest arms | — |
| M07-amb-gt1-to-gt2 | `all.length > 1` → `> 2` | 19/20 | PASS 39/39 | killed | probe:duplicate-field | — |
| M08-amb-gt1-to-ge1 | `all.length > 1` → `>= 1` | 4/20 | FAIL 14/39 | killed | 16 probe arms, 25 selftest arms | — |
| M09-esc-negated | `!lr.inside` → `lr.inside` (relative branch) | 5/20 | FAIL 21/39 | killed | 15 probe arms, 18 selftest arms | — |
| M10-symdir-negated | `isSymbolicLink()` → `!isSymbolicLink()` | 3/20 | FAIL 10/39 | killed | 17 probe arms, 29 selftest arms | — |
| M11-symdir-after-readdir | SYMLINK_DIR check moved after readdir | 20/20 | PASS 39/39 | **survived** | — | battery:symlink-dir-dangling |
| M12-esc-v1-external | relative-outside → v1 external branch (disk, `external=`) | 19/20 | PASS 39/39 | killed | probe:escape-relative | — |
| M13-blobat-head | blobAt reads `HEAD:` not `${rev}:` | 16/20 | FAIL 38/39 | killed | probe:selftest, clean-r87, rev-receipt-wins, rev-receipt-negative; selftest:rev-per-receipt-overrides | — |
| M14-receipt-rev-ignored | `receiptRev = revField` deleted | 16/20 | FAIL 38/39 | killed | probe:selftest, clean-r87, rev-receipt-wins, rev-receipt-negative; selftest:rev-per-receipt-overrides | — |
| M15-field-v1-first-wins | field() = v1 `String.match` | 19/20 | PASS 39/39 | killed | probe:duplicate-field | — |
| M16-size-x2 | `MAX_RECEIPT_BYTES = 2097152` | 20/20 | PASS 39/39 | **survived** | — | battery:size-1048577, size-1572864, size-2097152, size-multibyte-1572864 |
| M17-size-minus1 | `MAX_RECEIPT_BYTES = 1048575` | 20/20 | PASS 39/39 | **survived** | — | battery:size-1048576 |
| M18-size-plus1 | `MAX_RECEIPT_BYTES = 1048577` | 20/20 | PASS 39/39 | **survived** | — | battery:size-1048577 |
| M19-field-last-wins | throw deleted, field() last-wins | 19/20 | PASS 39/39 | killed | probe:duplicate-field | — |
| M20-amb-cmd-only | AMBIGUOUS only for `cmd=` | 19/20 | PASS 39/39 | killed | probe:duplicate-field | — |
| M21-amb-distinct-values | AMBIGUOUS only if duplicate values differ | 19/20 | PASS 39/39 | killed | probe:duplicate-field | — |
| M22-esc-also-absolute | ESCAPES_LANE also for absolute external | 16/20 | FAIL 37/39 | killed | probe:selftest, detect-r86, detect-r86-renamed, escape-relative; selftest:external-disk, external-mismatch | — |
| M23-size-after-read | size check after `readFileSync` | 20/20 | PASS 39/39 | **survived** | — | battery:size-sparse-3GiB (→ `RECEIPT_UNREADABLE (ERR_STRING_TOO_LONG)`) |
| M24-size-on-chars | size check on `text.length` after read | 20/20 | PASS 39/39 | **survived** | — | battery:size-multibyte-1572864 (→ CLEAN), size-sparse-3GiB |
| M25-receipt-rev-unverified | per-receipt `revOk` check deleted | 20/20 | PASS 39/39 | **survived** | — | battery:receipt-rev-unknown (→ `UNRESOLVED`, want `REV_UNRESOLVED`) |
| M26-worktree-twin | frozen `make-worktree-variant.mjs` applied | 11/20 | FAIL 36/39 | killed | 9 probe arms incl. rev-receipt-wins, worktree-forgery, default-rev, untracked-instrument; selftest:dirty-worktree-cannot-launder, worktree-bytes-not-truth, rev-per-receipt-overrides | none |
| M00-restored-lane | lane file after battery | 20/20 | PASS 39/39 | baseline | — | — |

Full per-arm detail, diffs and failing-arm lists: `build/K88Mutation/summary.json`, `build/K88Mutation/table.md`.

## Survivors — which arm/case should kill each

| survivor | why the probe misses it | killing case (seat battery, verified) | probe/selftest arm that would kill it |
|---|---|---|---|
| M16 size ×2 | `oversize` tests only 2097152+~170 B (still > 2097152) and 512 KiB | 1048577 / 1572864 / 2097152-byte receipt → want `RECEIPT_TOO_LARGE`, got `CLEAN` | an `oversize` sub-run at 1048577 bytes (and one at exactly 1048576 → CLEAN) |
| M18 limit+1 | no receipt near the edge | 1048577 B → got `CLEAN` | same 1048577-byte sub-run |
| M05 `>=`, M17 limit−1 | no receipt at exactly the limit | 1048576 B → got `RECEIPT_TOO_LARGE`, want `CLEAN` | exact-1048576 positive sub-run |
| M23 size after read | output identical whenever the read succeeds | sparse 3 GiB receipt → got `RECEIPT_UNREADABLE (ERR_STRING_TOO_LONG)` | sparse >2 GiB receipt must read `RECEIPT_TOO_LARGE` |
| M24 size on chars | ASCII filler: chars = bytes | 1572864 B of 3-byte UTF-8 → got `CLEAN` | multibyte oversize sub-run |
| M11 symdir after readdir | live link: readdir succeeds then the check fires | dangling `--dir` symlink → got `DIR_UNREADABLE (ENOENT)` | `symlink-dir` sub-run with a dangling link |
| M25 receipt rev unverified | no arm/case carries a 40-hex receipt `rev=` that is not a commit | → got `UNRESOLVED`, want `REV_UNRESOLVED` | selftest case `rev-unresolved` variant with a bad per-receipt `rev=` |

Also: every v2-boundary mutant is invisible to `--selftest`; adding one selftest case per v2 token
(ESCAPES_LANE, SYMLINK_DIR, RECEIPT_TOO_LARGE at 1048577 & CLEAN at 1048576, AMBIGUOUS_FIELD × 3 fields)
would make the selftest a second killer. The frozen probe and kill rule are not to be edited; these are
coverage findings for the L1 (candidate instrument selftest additions would go through the L1, not here).

## Commands (all absolute; exit codes in receipts)

- Mutant generation: `node build/K88Mutation/make-mutants.mjs mutants/M00-pristine.mjs mutants` → `MAKE_MUTANTS: WROTE 25`;
  `node controls/make-worktree-variant.mjs mutants/M00-pristine.mjs mutants/M26-worktree-twin.mjs` → `WROTE`.
- Per mutant (`run-mutant.sh <id> <file>`, 14-way parallel, wall 17.8 s):
  `node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-88/probe/probe88-c1.mjs --lane /home/vgpnk/Projects/shokunin/kumitate-shokunin --work /fast/scratch/hyaku/kumitate-r88/K88Mutation/work-<id>/probe --rev 0ff3562f15c18d0ca01dc6a76c9f827d30c26950 --tool <mutant>` → `receipts/<id>.probe.txt`;
  `node <mutant> --selftest --work …/work-<id>/selftest` → `receipts/<id>.selftest.txt`.
- Seat battery (`run-battery.sh <id>`): `node build/K88Mutation/boundary-battery.mjs --tool <mutant> --work …/bb-<id>` → `receipts/<id>.battery.txt`
  (pristine 9/9 exit 0, worktree twin 9/9, each survivor exit 1 with the failing cases above).
- Receipts carry `rev=`, `tool_sha256=` (sha256 of `cmd=` token 2: the probe, the mutant, or the battery),
  one `cmd=`, an extra `mutant_sha256=` line, output, `exit=`, `signal=none`.

## Artifacts (beneath `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-88/build/K88Mutation/`)

`summary.json`, `table.md`, `mutants/*.mjs` + `*.diff` + `index.json` + `SHA256SUMS`, `receipts/` (66 files),
`make-mutants.mjs` (162d079a…), `run-mutant.sh` (712c10c5…), `boundary-battery.mjs` (e433b606…),
`run-battery.sh` (3ea57f6c…), `summarize.mjs` (b000dda2…).

Scratch `/fast/scratch/hyaku/kumitate-r88/K88Mutation` removed. Tooling installed/updated: none.
Incidental: a first attempt to run the battery as backgrounded subshells lost 8 of 10 runs (receipts
truncated after the header); rerun via `xargs -P 3` produced complete receipts, which are the ones cited.

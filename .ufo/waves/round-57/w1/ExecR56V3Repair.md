# ExecR56V3Repair — independent corpus bimap recount (R56-V3 repair verification)

Seat: ExecR56V3Repair (leaf). Round 57 / hyaku run 5. Axes: operability (C1 `readme-map`,
ATTEST57 B10) + coverage.
Scope: independently recompute the corpus file↔README-row bimap at base `7178bfd3` and at
tip `8c6f5b01`; falsify or corroborate `133 files / 132 rows / one uncovered` at base and
`135 / 135` at tip. No production edits, no commits, no gate re-runs beyond read-only
measurement.

**Verdict: CORROBORATED (both numbers reproduced from committed bytes, not from the
receipts or the gate's code).**

## Result

| rev | corpus `*.md` files | README `| `path` |` rows | matched | uncovered | orphan rows | duplicate rows |
|---|---|---|---|---|---|---|---|
| base `7178bfd3643c0fac74c8eb637cd6e985faadd0cf` | 133 (133 unique) | 132 (132 unique) | 132 | **1** | 0 | 0 |
| tip `8c6f5b017d149b18134917378cdbed3b492d8e89` | 135 (135 unique) | 135 (135 unique) | 135 | **0** | 0 | 0 |

Base uncovered (exact, `comm -23 files rows`): `lessons/round-56-verifier-spotcheck.md`.
At tip the sorted file list and the sorted row list are **byte-identical**:
`sha256(tip-files.txt) = sha256(tip-rows.txt) = a8c3502427d4a4e78059749c025ee1b522ac2873146ab8d5c827855ef993f28c`.

File-set delta base→tip (`comm`): added `knowledge/worker-heartbeat-liveness.md`,
`lessons/round-57.md`; removed none.
Row-set delta base→tip: added `knowledge/worker-heartbeat-liveness.md`,
`lessons/round-56-verifier-spotcheck.md` (the R56-V3 repair), `lessons/round-57.md`;
removed none.

## Method (independent of `scripts/readme-map.mjs` and of the probe)

Base bytes were obtained with `git archive 7178bfd3… | tar -x -C build/ExecR56V3Repair/base-tree`
(no HEAD move, no worktree, no git write); the extraction's `corpus/README.md` sha256 equals
`git show 7178bfd3:corpus/README.md` (`87eff612b6f5…12d25`). Tip bytes are the lane working
tree, whose `corpus/README.md` sha256 (`7575614804ac…205d`) equals
`git show 8c6f5b01:corpus/README.md`, and `git status --porcelain -- corpus` is empty
(`HEAD = 8c6f5b017d149b18134917378cdbed3b492d8e89`).

- files: `find corpus/knowledge corpus/lessons -name '*.md'`, prefix `corpus/` stripped,
  `LC_ALL=C sort`. (Nested dirs: 0 at both revs, so `find` and a non-recursive listing agree.)
- rows: `sed -nE 's#^[ ]{0,3}\|[[:space:]]*`((knowledge|lessons)/[^`]+)`[[:space:]]*\|.*$#\1#p'`
  over `corpus/README.md`, `LC_ALL=C sort` — first-cell-only backticked corpus path.
- bimap: `comm -23/-13/-12` with `LC_ALL=C`; duplicates by `sort | uniq -d`.
- second opinion: independent `awk -F'|'` field parser returns the same row counts
  (132 base / 135 tip).

Script + full transcripts: `.ufo/waves/round-57/build/ExecR56V3Repair/`
(`recompute.sh`, `recompute.out`, `recompute-after-prune.out`, `gate-tip.out`,
`final-checks.txt`, `checks.txt`, `base-*`/`tip-*` lists). All runs exit 0; empty stderr
after the fixed run (the first run's `sed` delimiter collision is retained in
`recompute.log` and was fixed before the recorded run).

## Agreement legs

- Committed gate at tip (read-only): `node scripts/readme-map.mjs` →
  `README_MAP: CLEAN files=135 rows=135 covered=135`, exit 0. Registry
  `.ufo/pins/readme-map.json` version 1, `covered`=135 unique. Agreement with the
  independent `comm` (135/135) is exact.
- Frozen base receipt (cross-check only, not the source of the numbers):
  `.ufo/waves/round-57/base/attest57-base.txt` carries
  `C2_TOTAL_DRIFT term=C2_total declared=132 computed=133 delta=+1` — consistent with the
  recomputed 133 files / 132 rows.
- Base README mentions `round-56-verifier-spotcheck` 0 times; tip README 1 time.
- Base gate absence confirmed: `git cat-file -e 7178bfd3:scripts/readme-map.mjs` → exit 128.

## Risks / notes (observed, not verdicts)

- A mid-flight `node scripts/proxy-check.mjs --strict` at the tip working tree read
  `PROXY: DRIFT (A_DRIFT term=A declared=90 computed=3606 delta=+3516; src-rev=31c465f15669)`.
  Attribution: the wave's untracked scratch trees contribute 4,361 runnable files under
  `.ufo/waves/round-57/build/` while `git ls-files` has exactly 90 — the A term walks the
  whole lane root. This is scratch contamination during the wave, **not** a C2/bimap drift
  (C2 is clean by the gate above). My own extraction was pruned to `corpus/` only so this
  seat now contributes 0 runnables; the recorded close battery already shows
  `PROXY: MATCH … C2=135/135` on a clean tree.
- `git status --porcelain` in the lane is non-empty from sibling seats' untracked build
  dirs and one modified `w1/swarm-registry.json`; none of it was touched by this seat.

## Files changed / installed

- Lane production files: **none**.
- Written by this seat only: `.ufo/waves/round-57/build/ExecR56V3Repair/**` and this report.
- No commits, no git/jj mutations, no pacman/tool installs (none needed).

## Blockers

None.

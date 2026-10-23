RESULT ScoutMisrootSweep rev=a2e5b54c verdict=clean fleet_misroots=0 lane_strays=0

# ScoutMisrootSweep

Read-only sweep of both attempts' live trees. No file was moved or deleted. No tool was installed. No git or jj write.

## Fleet untracked

`git -C /home/vgpnk/Projects/shokunin rev-parse HEAD` → `38d2afdb3949e4ce6a3089134d9426bb7e23057d`.

`git -C /home/vgpnk/Projects/shokunin status --porcelain` listed 15 untracked entries: `.omp/mcp.json`, `.ufo/state/kotoba.report-baseline`, `.ufo/state/kotodama.report-baseline`, `.ufo/state/revenger.report-baseline`, `AGENTS.md`, `bm.json`, `live_s228.html`, `nama.html`, `s395.txt`, `scripts/hyaku/__pycache__/`, `scripts/hyaku/append-closure.py.bak-20261023T040735Z`, `scripts/hyaku/fleet-commit.sh.bak-20261023T040735Z`, `tf_bavelas.html`, `wb2.html`, `write`. Twelve tracked lines were ` M` baselines plus `.ufo/watchdog.log` (not untracked, not counted).

`git ls-files --others --exclude-standard` expands the cache directory to two files, 16 in all: the names above, with `__pycache__/` replaced by `append-closure.cpython-314.pyc` and `wave-live.cpython-314.pyc`.

```
git -C /home/vgpnk/Projects/shokunin ls-files --others --exclude-standard -z \
  | xargs -0 grep -l -I -e kumitate -e Kumitate -e 'round 45' -e 'Round 45' -e 'round-45'
```

Observed: no paths. Exit 123 (no file matched any needle). A separate byte read of the same 16 files found 0 hits for `kumitate` (any case), `round 45`, `round-45`, or `round45`, including the two bytecode files that `grep -I` skips.

fleet_misroots=0. No byte size, sha256, or same-relative-path row: the qualifying set is empty.

Not counted. Fleet `.gitignore` rule `*-shokunin/` makes `kumitate-shokunin/` ignored (`!!`), so the lane is not an untracked fleet file. `.ufo/reports/round-45/` exists and is empty, so status omits it. Ignored `.jj` metadata contains the already-tracked path `.ufo/prompts/kumitate-round-45.md` (one `round-45` hit in `.jj/working_copy/tree_state`). That is store data, not a seat file. `.omp/mcp.json` was not printed.

## Lane strays

`git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin rev-parse HEAD` was `a2e5b54cdd2c4cbf72cb0b2ab4ed53e2fe0d730f` at the first read. At the closing read it was `d9ad28701a9c2b504ae5db7919af1cdbabf18c83`. `git merge-base --is-ancestor a2e5b54cdd2c4cbf72cb0b2ab4ed53e2fe0d730f HEAD` was yes. The assigned result revision stays the wave tip.

Closing `git status --porcelain -uall`, classified by path: 58 untracked files under `.ufo/waves/round-45/`, 1 draft `corpus/knowledge/agent-isolation-substrates.md`, 0 outside that allowlist. The only other status lines were the five tracked edits `SCORECARD.md`, `corpus/QUALITY.md`, `corpus/README.md`, `corpus/SOURCES.md`, `corpus/lessons/round-44.md`. Those are not untracked and were not counted. The untracked count moved while seats wrote under `round-45/`; the stray count stayed 0 on the recheck.

lane_strays=0.

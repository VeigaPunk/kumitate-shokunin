# E6 — revision-pinned map string, worktree-executed gate

Read-only finding for the assigned E6 control. The frozen round-62 `probe/doctrine61-probe.mjs` is byte-identical to the round-61 probe (SHA-256 `e638e2b932f9d1552484c428131f73ad7efef663b273bad72e1581a30efa1965`; see `.ufo/waves/round-62/w1/ReviewClaims.md`, §1). Its E6 implementation is recorded verbatim in `.ufo/waves/round-62/w2/CritC2WorkingMap.md:9-15`: it reads `mapped` from `git show <rev>:corpus/README.md`, but invokes `node <lane>/scripts/readme-map.mjs` with `cwd: lane`. The gate therefore evaluates live worktree files and executable, not the measured revision's tree.

## Committed-control evidence

The committed scratch-clone control recorded in `.ufo/waves/round-62/w2/CritC2WorkingMap.md:62-91` creates commit `d05f0a55f95e958a41e053ec3482450bf4f38507` deleting the knowledge entry while retaining its README row and covered pin. Running `readme-map` against that commit's archived tree reports:

```text
README_MAP: note stale-covered:knowledge/temporal-worker-versioning-pinning.md
README_MAP: DRIFT files=147 rows=148 covered=148 bad=2 first=orphan-row:knowledge/temporal-worker-versioning-pinning.md
committed_readme-map_exit=1
```

The scratch worktree then restores the deleted entry without changing the commit. At the same committed rev, the probe reports `E6 PASS mapped=true readme-map=0 README_MAP: CLEAN files=148 rows=148 covered=148` (receipt lines 73-91). Thus a committed DRIFT map can satisfy E6 because its clean conjunct observes repaired worktree bytes. Conversely, lines 39-60 show an uncommitted stray entry at unchanged clean rev `1508415` changes E6 from PASS to MISS (`DRIFT files=149 rows=148 covered=148`), demonstrating worktree contamination can also create a false negative.

The mismatch directly defeats the rev-specific E6 contract: the map-string half is pinned, but the cleanliness half is not. The output is evidence about the live worktree, not the supplied revision. Evidence pointer: `.ufo/waves/round-62/w2/CritC2WorkingMap.md:9-15,39-91`; probe source `.ufo/waves/round-62/probe/doctrine61-probe.mjs:27`.

No verdict on round-62 claims. No edits to probes, controls, or lane history; no tests or tools installed.
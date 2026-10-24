# MutMapOrphan — mutation evidence

Item: rename `corpus/lessons/round-57.md` -> `corpus/lessons/round-57-x.md` in a scratch
copy of the judged revision; verify BOTH `orphan-row` and `uncovered` fire for the right paths.
Access date: 2026-10-24. Host lane HEAD (unchanged throughout):
`8c6f5b017d149b18134917378cdbed3b492d8e89` ("round-57: idempotence at bookkeeping tip
c42afe1c — A57 10/10, D57 5/5").

Judged bytes were extracted with `git archive <rev> | tar -x` into `scratch/` and
`scratch2/`; nothing was read from the dirty working tree, so sibling build dirs cannot
contaminate the run.

## Inputs / revision facts

| fact | observed |
|---|---|
| `git rev-parse HEAD` | `8c6f5b017d149b18134917378cdbed3b492d8e89` |
| `git ls-tree HEAD -- corpus/lessons/round-57.md scripts/readme-map.mjs .ufo/pins/readme-map.json` | all three present |
| `git ls-tree 7178bfd3... -- <same three>` | EMPTY (plan §K1: gate/registry/pin absent at base) |
| `sha256(corpus/lessons/round-57.md)` | `b3cbf9741d21421e74d321afba9749cd34e917c6909dba37da6eabe4ae6f5566` |
| `sha256(corpus/README.md)` | `7575614804acc82f309d2a763af2b7572a2f81ee98520f3b0517ee187d97205d` |
| `sha256(.ufo/pins/readme-map.json)` | `9ef0cf6ec794bc11d139382e703794b218ec4a38070a831f22fdce40585c729c` |
| `sha256(scripts/readme-map.mjs)` | `058e503363363ca3d9dbfd7a82602bd1b7287dfc9936af25796834b8812c7727` |
| registry | `version 1`, `covered = 135`, `indexOf('lessons/round-57.md') = 128` |
| README row | `corpus/README.md:170` starts ``| `lessons/round-57.md` |`` |
| corpus population | 83 lessons + 52 knowledge = 135 `*.md` |

Gate code under test (`scripts/readme-map.mjs`, judged rev):

```
178  const seen = new Map();
179  for (const r of rd.rows) {
180    if (seen.has(r)) {
181      bad.push(`duplicate-row:${r}`);
182    } else {
183      seen.set(r, true);
184      if (!fileSet.has(r)) bad.push(`orphan-row:${r}`);      // row -> no file
185    }
186  }
187  const rowSet = new Set(rd.rows);
188  for (const f of cf.files) {
189    if (!rowSet.has(f)) bad.push(`uncovered:${f}`);           // file -> no row
190  }
```

## Commands and exits

All commands run with cwd = the scratch lane root; logs under `logs/`.

1. **Baseline (pristine, unmutated bytes)**
   `node scripts/readme-map.mjs` -> `logs/baseline-pristine.txt`
   ```
   README_MAP: CLEAN files=135 rows=135 covered=135
   exit=0
   ```
   Baseline PASSES, so a subsequent DRIFT is attributable to the mutation (a baseline
   failure would have made the probe inconclusive).

2. **Assigned mutant**: `mv corpus/lessons/round-57.md corpus/lessons/round-57-x.md`
   (`ls corpus/lessons/round-57.md` -> `No such file or directory`, exit 2)
   `node scripts/readme-map.mjs` -> `logs/mutated-run.txt`
   ```
   README_MAP: note uncovered:lessons/round-57-x.md
   README_MAP: note stale-covered:lessons/round-57.md
   README_MAP: note unpinned:lessons/round-57-x.md
   README_MAP: DRIFT files=135 rows=135 covered=135 bad=4 first=orphan-row:lessons/round-57.md
   exit=1
   ```
   Mutated content hash is byte-identical to pristine (`logs/hash-mutated.txt` =
   `b3cbf974...5566  corpus/lessons/round-57-x.md`): the rename moved bytes, it did not
   alter them.

3. **Restore**: `mv corpus/lessons/round-57-x.md corpus/lessons/round-57.md`
   `sha256sum` of the four inputs diffed against pristine -> identical
   (`logs/hash-restored.txt`, `diff` exit 0).
   `node scripts/readme-map.mjs` -> `logs/restored-run.txt`
   ```
   README_MAP: CLEAN files=135 rows=135 covered=135
   exit=0
   ```
   Whole-tree check: 3627 path+sha256 lines before vs after restoration are identical
   (`grep -vx '== tree hash scratch ==' logs/tree-sha-before.txt | diff - logs/tree-sha-after-restore.txt`
   exit 0 -> `logs/tree-verify-verdict.txt`: `FULL-TREE-3627-FILES-IDENTICAL`).

4. **Directional control (path-attribution discriminator, same judged bytes, second
   extraction `scratch2/`)**: rename only the README row
   `` | `lessons/round-57.md` | `` -> `` | `lessons/round-57-x.md` | ``, leaving the file
   and registry untouched.
   `node scripts/readme-map.mjs` -> `logs/row-rename-run.txt`
   ```
   README_MAP: note uncovered:lessons/round-57.md
   README_MAP: DRIFT files=135 rows=135 covered=135 bad=2 first=orphan-row:lessons/round-57-x.md
   exit=1
   ```
   Paths swap sides exactly as the contract requires: the orphaned *row* path is reported
   as `orphan-row`, the row-less *file* path as `uncovered`. Control restored byte-for-byte
   (`logs/hash-scratch2-restored.txt` matches pristine README + lesson hashes) and re-runs
   CLEAN exit 0 (`logs/scratch2-restored-run.txt`).

## Lane write boundary

- `git status --porcelain -- corpus scripts .ufo/pins` -> empty (exit 0): no production,
  corpus, registry, or pin byte changed.
- HEAD still `8c6f5b017d149b18134917378cdbed3b492d8e89`; no commit/push/jj mutation.
- Writes confined to `.ufo/waves/round-57/build/MutMapOrphan/` and the report at
  `.ufo/waves/round-57/w1/MutMapOrphan.md`.
- No installs, no pacman, no service changes.

## Log hashes (sha256, evidence pinning)

```
917335596d01bc539fef29cc107c7fb06349a6800a6e2ad20f72610baef9ddfd  logs/baseline-pristine.txt
a7ba912c2a18d7803856cdcb42d725ddc26d3e685dc8f16462e41b03b3045cf2  logs/mutated-run.txt
917335596d01bc539fef29cc107c7fb06349a6800a6e2ad20f72610baef9ddfd  logs/restored-run.txt
3df447fe8ab2108c4e3be42c31b5584eab7111cb9b81c0fc42eb6e48daf077c9  logs/row-rename-run.txt
f3e5061173ce1660968872cda8dadf8faac7b6118fb6408ee0237809d1df7663  logs/row-rename-mutation.txt
917335596d01bc539fef29cc107c7fb06349a6800a6e2ad20f72610baef9ddfd  logs/scratch2-restored-run.txt
eb9ec495b2ba02cf4d45723dd8064a5af904ad1750d68410462ee301c6f40871  logs/hash-pristine.txt
eb9ec495b2ba02cf4d45723dd8064a5af904ad1750d68410462ee301c6f40871  logs/hash-restored.txt
6a2242d8cd053a2d0a1f19ab668c01880ba186b5c09a7ec6752c27a2974def4d  logs/hash-mutated.txt
ff45c37c50c6d6cd0ece4a5d5bb310dafd8de81fd1b6a876ee07b37513c4786b  logs/hash-row-rename.txt
d6911ece3cd7a595ae2c5f8ed2b3f00fc1be6c45ec04bdc94c110ae46603bcbd  logs/hash-scratch2-restored.txt
ad0d84d5b75da34c30e96709d8a8c35d159088aff5347062e4c01ba02d52dbe5  logs/tree-sha-before.txt
df56030a118a35fc1c7b0082798ffa9184202b4a69c4479ed2757ce84fc719e7  logs/tree-sha-after-restore.txt
10d14db29af9474377817009c7066bf5efaad49e7967f2ee2eeaeb9bdf3e2b9d  logs/tree-verify-verdict.txt
```

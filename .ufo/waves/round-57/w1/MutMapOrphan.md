# MutMapOrphan — round 57 mutation probe (C1 `readme-map`)

Axis: coverage (mutation-tester, attack role). Item: rename
`corpus/lessons/round-57.md` -> `corpus/lessons/round-57-x.md` in a scratch copy; verify
BOTH `orphan-row` and `uncovered` fire for the right paths. Access date 2026-10-24.
Judged revision: lane HEAD `8c6f5b017d149b18134917378cdbed3b492d8e89` ("round-57:
idempotence at bookkeeping tip c42afe1c — A57 10/10, D57 5/5"); bytes extracted with
`git archive`, never the dirty working tree. Evidence root:
`.ufo/waves/round-57/build/MutMapOrphan/` (`EVIDENCE.md` + `logs/` + restored `scratch/`,
`scratch2/`).

## Mutant

`mv corpus/lessons/round-57.md corpus/lessons/round-57-x.md` in a `git archive` extraction
of the judged rev. Bytes unchanged by the move (`sha256 b3cbf974…f5566` before and after
the rename), so the only delta is the path. README row (line 170) and registry entry
(`covered[128] = lessons/round-57.md`, version 1, 135 entries) were left as committed.

## Expected detector

Contract `kumitate-readme-map-v1` (plan §C1): `DRIFT` exit 1 with
`orphan-row:<row path with no file>` and `uncovered:<file with no row>`. Expected:
`orphan-row:lessons/round-57.md` + `uncovered:lessons/round-57-x.md`.

## Observed

Pristine baseline first — `node scripts/readme-map.mjs`:

```
README_MAP: CLEAN files=135 rows=135 covered=135
exit=0
```

Mutated — same command, `logs/mutated-run.txt`:

```
README_MAP: note uncovered:lessons/round-57-x.md
README_MAP: note stale-covered:lessons/round-57.md
README_MAP: note unpinned:lessons/round-57-x.md
README_MAP: DRIFT files=135 rows=135 covered=135 bad=4 first=orphan-row:lessons/round-57.md
exit=1
```

Both required arms fired, each attached to the correct side of the bimap: the orphaned
**row** names the old path `lessons/round-57.md`; the uncovered **file** names the new path
`lessons/round-57-x.md`. Two further signals fired as consequences of the same rename
(`stale-covered` old path, `unpinned` new path) and do not mask the two required labels
(all four are printed). `files=135 rows=135 covered=135` confirms the gate counted the same
population across the rename rather than losing the file.

Directional control (second extraction, row renamed instead of file, registry untouched) —
`logs/row-rename-run.txt`:

```
README_MAP: note uncovered:lessons/round-57.md
README_MAP: DRIFT files=135 rows=135 covered=135 bad=2 first=orphan-row:lessons/round-57-x.md
exit=1
```

The labels swap sides with the mutation: path attribution is computed from row-vs-file
membership (`scripts/readme-map.mjs:178-190`), not from a fixed name or ordering accident.
`bad=2` (orphan + uncovered only) shows the stale-covered/unpinned signals in the primary
run came from the registry, as designed.

## Verdict

**KILLED** — the gate detects the assigned mutant with the contract's exact verdict, exit,
and both correctly-attributed paths; no behavioral defect found at this point. Baseline
passed before mutation, so the kill is not a pre-existing failure.

Coverage finding (axis: coverage), source-inspected, `[INFERENCE]` for the hypothetical
mutant only: frozen A57 B3 asserts arm labels with substring tests, not paths —
`attest57-probe.mjs:184` `const ok = r.status === 1 && out.includes(expect);` with
`expect` ∈ {`uncovered`, `orphan-row`, `duplicate-row`, `unpinned`}; `:204-209` arms
`orphan-row` by **deleting** the file for the first row, and `:195-202` arms `uncovered` by
deleting a row. No arm renames an entry, and no arm asserts which path each label carries.
Therefore a label↔path swap regression (e.g. emitting `orphan-row:<file>` from the
`:188-190` loop) would still pass all five B3 arms although it would break the
`orphan-row` / `uncovered` distinction this item probes. The gate's current labeling is
correct (directional control above); the counter simply does not pin it. Reported as a
coverage gap, not a contract change.

## Restoration

- `mv` reversed; `sha256sum` of `corpus/lessons/round-57.md`, `corpus/README.md`,
  `.ufo/pins/readme-map.json`, `scripts/readme-map.mjs` diffs empty against pristine
  (`logs/hash-restored.txt` == `logs/hash-pristine.txt`).
- Whole-tree: 3627 path+sha256 lines identical before/after
  (`logs/tree-sha-before.txt`, `logs/tree-sha-after-restore.txt`, diff exit 0 ->
  `logs/tree-verify-verdict.txt`: `FULL-TREE-3627-FILES-IDENTICAL`).
- Re-run on restored bytes: `README_MAP: CLEAN files=135 rows=135 covered=135`, exit 0.
- Control extraction `scratch2/` restored to pristine hashes and re-runs CLEAN exit 0.
- Lane boundary: `git status --porcelain -- corpus scripts .ufo/pins` empty; HEAD unchanged;
  no commit/push/jj mutation; writes only under
  `.ufo/waves/round-57/build/MutMapOrphan/` and this report. No installs, no pacman.

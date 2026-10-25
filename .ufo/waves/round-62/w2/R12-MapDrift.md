# R12-MapDrift — current readme-map census

## Finding

The current lane worktree fails the README-map gate. The exact command `node scripts/readme-map.mjs` (run in `/home/vgpnk/Projects/shokunin/kumitate-shokunin`) printed:

```text
README_MAP: note unpinned:lessons/round-61-verifier-spotcheck.md
README_MAP: DRIFT files=149 rows=148 covered=148 bad=2 first=uncovered:lessons/round-61-verifier-spotcheck.md
```

It exited 1. There is exactly one uncovered corpus file in the reported census: `lessons/round-61-verifier-spotcheck.md`. The map has 148 rows for 149 corpus files (one-row short); the pin coverage count is 148, and the missing lesson is explicitly reported as unpinned. The emitted `bad=2` counts the uncovered and unpinned findings for that same path, not two distinct missing corpus files.

## Why it reaches the target

This is a direct run of the requested readme-map command against the current tree, not a revision-derived result. The README map currently ends before the round-61 verifier lesson is listed (`corpus/README.md`, lines 183 onward; there is no row for that lesson). The map tool's output independently identifies the same path as uncovered and unpinned. The lesson itself exists at `corpus/lessons/round-61-verifier-spotcheck.md` and records the non-author closure evidence (notably its R61-V5 map/pin repair instruction at lines 238–242).

## Smallest safe correction

Add one accurate `corpus/README.md` coverage-map row for `lessons/round-61-verifier-spotcheck.md` and add that path to `.ufo/pins/readme-map.json`'s covered set using the repository's established pin-generation procedure. Re-run the same command only after an authorized integration change; this finding makes no edits.

Evidence pointers: current command/output above; `corpus/README.md`; `corpus/lessons/round-61-verifier-spotcheck.md:238-242`; `.ufo/pins/readme-map.json`.
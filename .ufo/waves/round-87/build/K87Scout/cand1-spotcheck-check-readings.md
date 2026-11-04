# Candidate 1 — `spotcheck-adopt --check`: two readings, one exit

Seat K87Scout, read-only. Base for measurement: freeze commit `25a3a75df123a59c5cf0de944a6d2f067e278f82`
(clone `--shared` in scratch; the live lane was not run through `spotcheck-adopt`, because `main()` calls
`recover()` before every arm and `recover()` can rename/roll back journal state — a write).

## Code anchors (`scripts/spotcheck-adopt.mjs`)

- `:35-39` `oracle()` runs `readme-map.mjs` once; `findings` parsed from `README_MAP: note …` and `first=…`.
- `:41-43` `missing(result,key)` — row = `uncovered:<key>` finding, pin = `unpinned:<key>` finding.
- `:207-217` the `--check` arm. `:209` `uncovered` = spotchecks whose key has row or pin finding.
- `:215` the `SPOTCHECK_COVERAGE:` line (uses `uncovered.length`).
- `:216` the `MAP:` line: `result.clean ? 'MAP: CLEAN' : 'MAP: DRIFT first=' + result.first`.
- `:217` **exit expression**: `return { exit: paths.length === 0 || uncovered.length > 0 ? 1 : 0, … }`
  — it reads ONLY the spotcheck reading. `result.clean` (map) never enters the exit.

## Commands and readings (freeze commit clone)

```
cd <scratch>/lane-clone && git checkout -q 25a3a75df123a59c5cf0de944a6d2f067e278f82
node scripts/spotcheck-adopt.mjs --check      # EXIT=1
  SPOTCHECK_COVERAGE: DRIFT spotchecks=53 uncovered=1 first=corpus/lessons/round-86-verifier-spotcheck.md
  MAP: DRIFT first=uncovered:lessons/round-86-verifier-spotcheck.md
node scripts/readme-map.mjs                   # EXIT=1
  README_MAP: note unpinned:lessons/round-86-verifier-spotcheck.md
  README_MAP: DRIFT files=220 rows=219 covered=219 bad=2 first=uncovered:lessons/round-86-verifier-spotcheck.md
```

At the freeze the map's entire drift is ONE spotcheck (`uncovered` + `unpinned` for the same key), so both
lines name the same defect.

## Controlled fixtures (hermetic, `build/K87Scout/fixtures/mk-adopt-fixture.sh`, `spotcheck-adopt.mjs` + `readme-map.mjs` copied from the freeze)

| fixture | spotcheck reading | MAP reading | exit |
|---|---|---|---|
| clean | CLEAN spotchecks=1 uncovered=0 | CLEAN | 0 |
| uncovered-row | DRIFT uncovered=1 first=…round-86 | DRIFT first=uncovered:lessons/round-86… | 1 |
| unrelated-drift (green spotcheck, `knowledge/late.md` unrowed) | CLEAN spotchecks=1 uncovered=0 | DRIFT first=uncovered:knowledge/late.md | **0** |
| outside-section (row under `## Known gaps`) | DRIFT uncovered=1 | DRIFT first=outside-map:lessons/round-86… | 1 |
| pin-only (row present, pin missing) | DRIFT uncovered=1 | DRIFT first=unpinned:lessons/round-86… | 1 |

Commands: `node <fx>/scripts/spotcheck-adopt.mjs --lane <fx> --check` and
`node <fx>/scripts/readme-map.mjs --registry <fx>/.ufo/pins/readme-map.json --readme <fx>/corpus/README.md --corpus <fx>/corpus/knowledge --corpus <fx>/corpus/lessons`.

## Reading of the candidate

- The exit code does **not** conflate map drift with the uncovered spotcheck: map-only drift exits 0 (row 3).
- What IS shared: one `readme-map` child run (`:35-39`), one `missing()` finding family (`:41-43`), and one
  `MAP:` line whose `first=` is the map's first finding — which can be the same defect as the spotcheck line
  (rows 2, 4, 5) or an unrelated one (row 3). A reader of the two lines cannot tell from the text alone which
  reading the exit belongs to.
- The brief's "conflation" is therefore partly refuted for the exit and holds for the verdict text.

## Round-88 pre-registration candidate

A claim would have to measure: over fixtures with (spotcheck green, map red-unrelated) and (spotcheck red, map
green), whether the printed verdict and exit jointly name the reading that set the exit. Measured today:
row 3 prints `MAP: DRIFT` with exit 0 and no signal that the exit ignored it.

## Live-tree note

The live working tree (uncommitted) reads `README_MAP: CLEAN files=221 rows=221 covered=221` via
`node scripts/readme-map.mjs` (exit 0), so the round-86 row is already present in the working tree.
`git status --porcelain` lists `M corpus/README.md`, `M .ufo/pins/readme-map.json`.

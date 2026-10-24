# SimplifyMapGate — readme-map gate minimality review

**Seat:** SimplifyMapGate (simplifier), kumitate round 57 w1, leaf (no subagents).
**Reviewed bytes:** `scripts/readme-map.mjs` sha256 `058e5033…c7727` — equals the
`.ufo/pins/counter-pins.json` round-57 `readme-map` pin; reviewed = pinned.
**Method note:** no `xd://lsp` device is mounted (ast_edit, debug only) and no JS LSP
serves this lane; reachability used the text-grep/control-flow-audit fallback plus the
gate's own hermetic suite. Full transcript: `.ufo/waves/round-57/build/SimplifyMapGate/review-evidence.txt`.

## Verdict: minimal expression of `kumitate-readme-map-v1`, minus two cosmetic items

The gate is the leanest of the pinned-skeleton family: same function sequence as
`source-dupes.mjs` (usage → loadRegistry → loadRows/loadFiles → evaluate → emit →
selftest → argv tail) but **without** dupes' `urlOf`, `duplicateGroups`, `key` joiner,
or the `explicitReg` convenience block (dupes :401–417). No dead function, no unused
import, no unreachable adapter, no second convention — the skeleton copy is the
deliberate pinned-artifact convention (each gate is one sha256-pinned file).

## Flagged redundant paths (reported, not edited)

- **F1 — `evaluate()` :195 `const rowSet = new Set(rd.rows)`** is fully redundant with
  `seen` (:189): after the row loop, `seen`'s keys equal `rowSet`. `seen` is also a
  `Map` whose values are never read. Fix: `seen` → `Set`, drop L195, use `seen.has(f)`
  at :198. −1 line, −1 allocation, identical output.
- **F2 — `run`'s `opts = {}` parameter (:222–223)** is never passed: all 14 selftest
  calls are single-arg (`run(argsOf(f))`). Template vestige — `source-dupes`' `run`
  carries the same dead parameter.

## Deliberate, not dead (checked, do not flag)

- `--registry/--readme/--corpus` flags have no production caller, but defaults are
  SELF-anchored so they are the selftest's only hermeticity mechanism — all 14 cases
  pass all four flags via `argsOf`.
- The `knowledge|lessons` basename guard in `loadFiles` (:159) looks redundant with
  `DEFAULT_DIRS` but is the contract's FAIL-CLOSED arm for arbitrary `--corpus` input.
- Two path regexes at different strictness (lax row parser + strict `COVERED_RE`,
  which also makes subdirs unparseable — matching the flat `readdirSync` scan) is the
  design: parse-lax, existence-check.
- Write/spawn calls are all inside `selftest()`; production path is read-only —
  "the gate never writes" holds (verified by grep of `writeFileSync|rmSync|spawnSync`).

## Edge observations (not simplification targets)

- `cf.files` not deduped across same-basename `--corpus` args (unreachable at defaults).
- Registry `covered` sortedness is probe-B2 territory, not the gate's — as frozen.
- proxy-check's C2 count term vs this gate: scorecard term vs per-file enforcement —
  different consumers, not duplicate authority.

## Evidence

- `node scripts/readme-map.mjs --selftest` → 14/14 `VERDICT: PASS`, exit 0.
- `node scripts/readme-map.mjs` (live) → `README_MAP: CLEAN files=135 rows=135 covered=135`, exit 0.
- Reachability matrix: every DRIFT/FAIL-CLOSED arm is exercised by a selftest case and/or an external B3-arm/seat control; none orphaned (matrix in evidence file).
- No edits to production; no commits; shared tree untouched (writes confined to this seat's build dir + this report).

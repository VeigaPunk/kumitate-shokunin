# Audit13 — Source-UsedBy: S195 used-by resolves to the new entry; entry present in README + readme-map pin

Assignment: check that the S195 registry row's `used-by` resolves to exactly the new
knowledge entry, and that the entry is present in the corpus README map and the
readme-map pin. Report specific counts.

All inspection is read-only on the lane worktree
(`kumitate-shokunin`, tip `0cbe0d7`). No edits, tests, or builds run.

## 1. S195 used-by — resolves to exactly the new entry

| Check | Result |
|---|---|
| S195 rows in `corpus/SOURCES.md` §Registry | **1** (line 147) |
| `used-by` cell values in that row | **1**: `corpus/knowledge/temporal-worker-versioning-pinning.md` (col 11; row has 13 `|`-cells, trailing empty) |
| Resolved target file exists | **yes** — `kumitate-shokunin/corpus/knowledge/temporal-worker-versioning-pinning.md` |
| Target file is the new entry | **yes** — header cites `source: S195`, pinned capture sha256 `8ef2ee5f…`, § Pinned Workflows 13-word quote at `…/ScoutSourceWorkerVersioning/body.md:39` |
| Other SOURCES references to the entry | **0** — `temporal-worker-versioning-pinning` appears in `SOURCES.md` only in the S195 row's used-by cell |

The one used-by value resolves exactly to the new entry; no second value, no other row
references the entry.

## 2. Entry present in README + readme-map pin

| Check | Result |
|---|---|
| `corpus/README.md` rows naming `knowledge/temporal-worker-versioning-pinning.md` | **1** (line 182, entry row) |
| `.ufo/pins/readme-map.json` `covered` total | **148** |
| `covered` entries equal to `knowledge/temporal-worker-versioning-pinning.md` | **1** |
| Duplicate paths in `covered` | **0** (148 unique) |
| `covered` `knowledge/`-prefix entries | **57** |
| README map `knowledge/`-prefix rows | **57** (matches pin subset) |

The pin stores corpus-relative paths (`knowledge/…`), so the entry's pin form is
`knowledge/temporal-worker-versioning-pinning.md` — present exactly once, matching the
README row's file name. Totals agree with the round-61 report's claimed
`files=148 rows=148 covered=148`.

## 3. Verdict

No finding. The inherited round-61 S195 used-by predicate holds: used-by resolves to
exactly the new entry, and the entry is present in both the corpus README map (1 row)
and the readme-map pin (1 of 148 covered paths).

## 4. Residual risk / gaps

- Corroborated from committed worktree bytes only; the readme-map gate was not executed
  (read-only wave), so the 148/148/148 CLEAN gate run itself was not re-run — the
  inputs it consumes are verified above.
- `source-captures.json` (sha256 8ef2ee5f…) was not re-fetched live; out of this
  assignment's scope.

# CriticC1Scope — evidence bundle (round 57, claim C1 `readme-map`)

Seat question: is the README-bimap invariant real (row-format drift? nested dir?
non-.md file?), or does the gate only re-check what `proxy-check` already catches?

All runs against the live lane scripts + a byte-copy scratch corpus under
`build/CriticC1Scope/scratch/` (cp -a of `corpus/` + `.ufo/pins/readme-map.json`).
Gate invocation (same shape as probe B2, paths redirected at scratch):

```
node scripts/readme-map.mjs --registry $S/reg.json --readme $S/corpus/README.md \
  --corpus $S/corpus/knowledge --corpus $S/corpus/lessons
```

Proxy-side row/file counts reproduced with the frozen regexes:
- proxy C2 rows: `grep -cE '^\| `(knowledge|lessons)/' corpus/README.md`
- proxy C2_total files: `find corpus/{knowledge,lessons} -name '*.md' -type f | wc -l`
  (proxy `walkFiles` recurses dirs, keeps regular files, skips `.git` only,
  never follows symlinks — proxy-check.mjs:686-696,699-706)

## Baseline (observed)

- `node scripts/readme-map.mjs` on the lane → `README_MAP: CLEAN files=135 rows=135 covered=135`, exit 0.
- `--selftest` → 14 cases PASS, `README_MAP_SELFTEST: PASS (14/14)`, `VERDICT: PASS`, exit 0.
- `sha256sum scripts/readme-map.mjs` = `058e5033…27727` — equals SCORECARD `pin.readme-map` (line 326) and `counter-pins.json` entry `readme-map`.
- Scratch copy baseline → identical `CLEAN 135/135/135`.

## Drift arms (observed)

| arm | mutation on scratch | gate | proxy-C2 count | verdict |
|---|---|---|---|---|
| 1 | `corpus/knowledge/sub/x.md` added (nested dir, no row/pin) | **CLEAN 135/135/135, exit 0 — INVISIBLE** | files 136 vs 135 → `C2_TOTAL_DRIFT` | gate misses; **proxy catches** |
| 2 | `corpus/knowledge/fake.md/` (directory named `*.md`, contains inner.md) | DRIFT `uncovered:knowledge/fake.md` + `unpinned`, exit 1 | files 136 | caught by both |
| 3 | symlink `knowledge/link.md → ../lessons/round-57.md` | DRIFT `uncovered` + `unpinned`, exit 1 | symlink skipped by walkFiles → counts stay 135/135 | **gate catches; proxy blind** |
| 4 | `corpus/knowledge/.x.md` hidden dotfile | DRIFT `uncovered` + `unpinned`, exit 1 | proxy walkFiles keeps dotfiles → 136 | caught by both |
| 5 | delete one row, duplicate another (C2 count stays 135) | DRIFT `duplicate-row` + `uncovered`, exit 1 | C2=135 declared=135 → **MATCH** | **gate catches; proxy blind** (compensating drift) |
| 6b | row's cell-closing `\|` removed: `` \| `x.md` desc … `` | DRIFT `format-unmapped` + `uncovered`, exit 1 | C2 still 135 → **MATCH** | **gate catches; proxy blind** (format drift) |
| 6c | leading space inside backticks `` \| ` x.md` \| `` | DRIFT `uncovered` only (row silently dropped, no format-unmapped), exit 1 | C2=134 → DRIFT | caught by both (gate net, not format check) |
| 8 | clean row for nonexistent `lessons/ghost.md` appended | DRIFT `orphan-row`, exit 1 | C2=136 → DRIFT | caught by both |
| 9 | row naming non-`.md` `knowledge/dispatch-shapes` | DRIFT `orphan-row`, exit 1 | C2=136 → DRIFT | caught by both |
| 10 | real row swapped for `lessons/ghost.md` row (counts 135/135) | DRIFT `orphan-row` + `uncovered`, exit 1 | **MATCH** | **gate catches; proxy blind** (compensating) |
| 11 | `knowledge/fake.md/` directory **with** row + `covered` pin added | **CLEAN files=136 rows=136 covered=136 — gate certifies a directory as a corpus file** | walkFiles rejects dirs → proxy files stay 135, C2=136 → drift on both counts | **gate false-CLEAN on entry type; proxy catches** |
| 12 | `knowledge/sub/x.md` + row + `covered` pin all added | **FAIL-CLOSED `covered entry malformed: "knowledge/sub/x.md"` exit 2** (COVERED_RE forbids `/` after the dir) | n/a | registry enforces flat namespace — nested paths can never be pinned |
| 13 | rename `round-57.md` → `round-57-renamed.md`, add new row + pin | DRIFT `stale-covered` + `orphan-row`, exit 1 | counts 136/135 → DRIFT | caught by both (gate names WHICH path) |

## Non-.md file (direct answer)

`corpus/knowledge/x.txt` (or `.pdf`, no extension): **ignored by both** — gate
suffices `.md`, proxy suffices `.md`. CLEAN/MATCH either way. A row naming a
non-`.md` path → gate `orphan-row` DRIFT; proxy counts it → C2 row-drift. No
escape.

## Row-format drift (direct answer)

- Cell-closing `|` removed (arm 6b): proxy **still counts the row** (its regex
  `^\| `(knowledge|lessons)/` needs no closing `|`); gate regex requires
  `` `…` \s*\| `` → row drops AND the first cell matches the `format-unmapped`
  bypass check → DRIFT named. **Escapes proxy; caught by gate.**
- Backticks removed (`| x.md |`): both regexes drop it; gate's format-unmapped
  catches it (`firstCell` matches `^\s*`?(knowledge|lessons)/`) → DRIFT; proxy
  sees count drift. Both catch.
- Leading space inside backticks (arm 6c): row invisible to both regexes and to
  the format-unmapped check (firstCell no longer matches the bypass regex since
  it starts `` ` `` + space) — ghost debris; **file-side `uncovered` net still
  catches it as DRIFT**. Minor: the format-unmapped check itself is bypassable.
- Trailing-junk first cell (`| `x.md`extra |`): proxy counts; gate drops →
  `uncovered` DRIFT. Gate stricter.

## Nested dir (direct answer) — the real hole

- A nested `*.md` is **invisible** to the gate's file universe (`loadFiles` is
  flat `readdirSync`, no recursion, no entry-type check) — CLEAN.
- The registry CANNOT pin nested paths (`COVERED_RE` rejects `/`) — so the
  bimap can never cover them; the contract's "every `*.md` under
  `corpus/knowledge` + `corpus/lessons`" is literally false.
- proxy-check's recursive `walkFiles` catches it as `C2_TOTAL_DRIFT` — the one
  defect class where the OLD check is strictly stronger.
- **A57 B10 cannot catch this**: its header claims `find … -name '*.md'` but
  `corpusFiles()` (probe:128-136) is the same flat `readdirSync` — the
  "independent" recomputation shares the gate's blind spot exactly. Its
  `readmeRows()` (probe:142) also mirrors the gate's row regex byte-for-byte,
  so it cannot catch format-parsing bugs either (both derive the same row set).

## Phantom file (entry-type hole)

`loadFiles` pushes `basename` for every `n.endsWith('.md')` without
`withFileTypes`/stat: a directory `knowledge/fake.md/` counts as a "file", and
a symlink counts as a file. With a row+pin the gate reports CLEAN for a
directory (arm 11). Proxy `walkFiles` keeps only `e.isFile()` entries (lstat,
symlinks not followed) → divergent universes in both directions.

## Subsumption matrix (observed)

| defect class | proxy-check C2 counts | readme-map bimap |
|---|---|---|
| file lands, no row (R56-V3 class) | C2_TOTAL_DRIFT | `uncovered` + `unpinned` (named) |
| row dropped | C2 DRIFT | `uncovered` |
| orphan/ghost row | C2 DRIFT | `orphan-row` (named) |
| row duplicated | C2 DRIFT | `duplicate-row` (named) |
| drop one + duplicate another | **MATCH — escape** | DRIFT |
| drop one + ghost row | **MATCH — escape** | DRIFT |
| format drift (cell `|` gone) | **MATCH — escape** | `format-unmapped` + `uncovered` |
| stanza synced to drifted state | **MATCH — escape** (compares only declared-vs-computed) | still DRIFT |
| nested `sub/x.md` | C2_TOTAL_DRIFT | **CLEAN — escape** |
| dir named `*.md` + row + pin | counts drift | **CLEAN — false-clean on non-file** |
| symlink `.md` no row | invisible (not followed) | DRIFT (counts as file) |
| covered entry unpinned/stale | invisible (no registry concept) | `unpinned`/`stale-covered` |

Neither gate subsumes the other: readme-map is a strict upgrade for *detection*
on flat entries (per-path diagnosis + compensating-drift + registry ratchet),
but strictly *narrower* on the file universe (flat, untyped) than proxy's
recursive typed walk.

## Commands run (all observed, cwd kumitate-shokunin)

- `node scripts/readme-map.mjs` → CLEAN 135/135/135, exit 0
- `node scripts/readme-map.mjs --selftest` → PASS (14/14), VERDICT: PASS, exit 0
- `node scripts/proxy-check.mjs --strict` → `PROXY: DRIFT (A_DRIFT declared=90 computed=1256)` — ambient working-tree noise (`.ufo/waves/*/build` scratch scripts inflate `A`); judged revs are extracted via `git archive` so this is irrelevant to the counter. C2 terms not reached in output because A is compared first; compareTerms order TERM_KEYS.
- gate vs scratch arms (table above), each: copy → mutate → run → restore.
- `sha256sum` pin check (above).

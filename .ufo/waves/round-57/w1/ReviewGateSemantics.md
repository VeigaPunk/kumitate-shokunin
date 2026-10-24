# ReviewGateSemantics — w1 report (round 57)

Item: reviewer seat on `scripts/readme-map.mjs` (contract `kumitate-readme-map-v1`)
and its pin `.ufo/pins/readme-map.json`. Scope: every finding kind reachable,
FAIL-CLOSED can never report CLEAN, `covered` semantics vs. header contract,
and the gate never writes. Evidence under
`.ufo/waves/round-57/build/ReviewGateSemantics/` (transcripts: `live-run.txt`,
`selftest.txt`, `pins.txt`, `edge-cases.txt`, `edge-cases-2.txt`,
`final-checks.txt`; scratch fixtures under `scratch/`).

## Verdict: gate semantics verified — all findings reachable, FAIL-CLOSED sound,
never writes; 2 LOW semantic findings + 4 nits.

## Verified (observed, not inferred)

- **Live run on lane tip**: `node scripts/readme-map.mjs` →
  `README_MAP: CLEAN files=135 rows=135 covered=135`, exit 0 (lane counts:
  52 knowledge + 83 lessons = 135; registry carries exactly 135 `covered`
  entries, sorted).
- **Selftest**: `README_MAP_SELFTEST: PASS (14/14)` + `VERDICT: PASS`, exit 0;
  no `/tmp/readme-map-st.*` residue left behind.
- **Pin chain**: `sha256(scripts/readme-map.mjs)` =
  `058e5033…2c7727`, matches `pin.readme-map=` in SCORECARD.md:326 and the
  `readme-map` entry in `.ufo/pins/counter-pins.json` (name+path at lines 84–85,
  B5 arm re-verifies the hash at judged rev).
- **Never writes**: mtime stat diff of registry + README across a live run →
  identical (`NO-WRITE-OBSERVED`). Source audit: main path touches only
  `lstatSync`/`readFileSync`/`readdirSync`; every `writeFileSync`/`rmSync`/
  `mkdtempSync` is inside `selftest()` (hermetic `$TMPDIR`, early-dispatched at
  line 347, never reachable via the evaluate path).
- **CLEAN ⇔ strict bimap**: `evaluate()` emits CLEAN only when `bad` is empty,
  which requires `rowSet ⊇ files` (no uncovered), `fileSet ⊇ rows` (no
  orphans), no dupes, no format-unmapped, `fileSet ⊇ covered` (no stale),
  `covered ⊇ files` (no unpinned) ⇒ `files = rows = covered` as sets.
  `covered` semantics = pinned ratchet, consistent with header lines 27–45 and
  the SKILL.md row; registry order is not enforced (pin file is sorted anyway).
- **FAIL-CLOSED cannot emit CLEAN**: every loader failure returns
  `{verdict:'FAIL-CLOSED', exit:2}` before scoring; `emit` prints CLEAN only in
  the CLEAN branch. Exit-space audit: reachable exits are 0/1/2/64 only
  (`spawnSync`, `JSON.parse`, `readdir` all wrapped).
- **All six DRIFT kinds + all FAIL-CLOSED reasons reachable**, confirmed live in
  scratch fixtures beyond the selftest's 14 cases:
  `uncovered`, `orphan-row`, `duplicate-row`, `format-unmapped` (both
  unbackticked and dirty-cell variants — "never silently dropped" holds),
  `stale-covered`, `unpinned`; and fail-closed on duplicated/malformed covered
  entry, empty corpus, ENOENT/EISDIR/EACCES registry, README as directory,
  corpus dir missing/not-a-directory/unreadable/outside-namespace, USAGE 64.
- **Header↔probe agreement**: B3's row regex
  `^\s{0,3}\|\s*`(knowledge|lessons)/[^`]+`\s*\|` matches the gate's; B10
  independently recomputes all six finding classes — mirrors gate logic.

## Findings

### L1 (LOW) — fenced-code-block rows count as map rows: false-CLEAN and false-DRIFT vectors
`loadRows` (`readme-map.mjs:131–140`) has no fence state. Any line starting
`|` inside a ``` fence is parsed as a real row. Observed in scratch:
- mask: README with real rows for a.md/b.md + fenced `| `lessons/c.md` |` row →
  `README_MAP: CLEAN files=3 rows=3 covered=3` exit 0 — the missing real row is
  masked (`edge-cases.txt` E7).
- phantom: fenced `| `lessons/ghost.md` |` → spurious `orphan-row` DRIFT
  (E8).
Not contract-violating as written (the header defines a row as "a table line
whose FIRST cell is a single backticked path" without scoping out code blocks),
but semantically wrong: a fenced example of the row syntax is the natural way
to document this contract in the README itself. Currently latent: corpus
README has 0 fences (`grep -c '```'` = 0).

### L2 (LOW) — `--corpus` accepts duplicate/aliased dirs; stats inflate, sets merge
Passing the same dir twice (`--corpus lessons --corpus lessons --corpus
knowledge`) → `CLEAN files=5 rows=3 covered=3` exit 0 (E9): `files` array
carries duplicates (`stats.files` misreports; only `files===rows===covered` at
CLEAN stays sound). Worse, two *distinct* dirs sharing basename `knowledge`
merge under identical `knowledge/x` keys — a file in the second dir is
"covered" by a row satisfied by the first, since matching is pure string
equality (E11-adjacent). Defaults are distinct names so this needs explicit
override; recommend rejecting duplicate basenames or duplicate resolved dirs.

### Nits
- **N3** Header line 22 lists USAGE among verdicts "on stdout", but `usage()`
  writes to stderr (line 76). Stderr is correct; the doc line is off.
- **N4** Row-indent gate vs. probe asymmetry: gate strips ` {0,3}` spaces only
  (line 132); probe `readmeRows`/B3 use `\s{0,3}` / `startsWith('| `')`. A
  tab-indented row is ignored by the gate → `uncovered` DRIFT (E6, correct),
  but B10's recount would see it and miss the real uncovered file — divergent
  only in already-drifted states; at a clean state both sides agree (a
  tab-indented row would break gate CLEAN). Same-basename nit for
  `findIndex((l) => l.startsWith('| `'))` at probe:198 which would mis-target a
  tab-row README mutation (mutates wrong line; fails safe).
- **N5** `emit` `first=` is unquoted (line 208); a `format-unmapped` cell with
  spaces lands spaces in `first=` (F4 shows `first=format-unmapped:`lessons/…
  ` — cosmetic; probe consumers use `includes()`/`last()`, unaffected).
- **N6** `*.md`-suffixed directories counted as files (E11: `mkdir
  knowledge/z.md` + row → CLEAN). Name-space edge only; no current entries.
  Related: `readdirSync` is non-recursive — nested subdirs are silently
  invisible (flat corpus today; find confirmed depth-1 only).

## Reachability map (contract ↔ implementation ↔ exercised)

| Contract item | Path | Exercised by |
|---|---|---|
| CLEAN exit 0 | evaluate:200 | live lane run, selftest 1/14, E7–E9 |
| uncovered | :189 | selftest 2, B3a/d, E6/E12 |
| orphan-row | :184 | selftest 3, B3b, E8/E10 |
| duplicate-row | :181 | selftest 4, B3c, E10 |
| format-unmapped | :137–139 | selftest 5, F4/F5 |
| stale-covered | :193 | selftest 6, E5 |
| unpinned | :196 | selftest 7/8, B3e |
| FAIL-CLOSED registry | :83–113 | selftest 9–11, B4, E1/E3/E4/E5 |
| FAIL-CLOSED README | :122–127 | selftest 12, F6 |
| FAIL-CLOSED corpus dir | :148–158 | selftest 13, F1/F2/F7/G1 |
| FAIL-CLOSED empty corpus | :162–164 | E2 (not in selftest) |
| USAGE 64 | :75–78, :356 | E13 |

No unreachable branch found. `corpus dir unreadable` and `corpus dir not a
directory` are distinct paths and both fire (F2 vs F7 vs G1).

## Residual risk

- L1 is the only genuine semantic hole: one future fenced code block in
  `corpus/README.md` either masks a missing row or creates phantom orphans.
  Fence-awareness (toggle on ``` lines) would close it.
- Probe↔gate whitespace divergence (N4) is inert at clean state; it only
  makes B10/B3 diverge in already-drifted fixtures.
- A newline in a corpus filename could inject lines into DRIFT notes;
  `last()`-based verdict parsing remains sound. Theoretical.
- Lane `git status` shows sibling-seat modifications (`swarm-registry.json`,
  other seats' build dirs) — concurrent wave activity, not this seat; the two
  gate inputs (registry, README) are verified unwritten by mtime diff.

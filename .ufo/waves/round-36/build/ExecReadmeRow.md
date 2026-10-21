EXEC readme-row done rows=80 files=80 c2-drift=no

# ExecReadmeRow — coverage-map row for `lessons/round-35-verifier-spotcheck.md`

Lane clone: `/fast/scratch/kumitate-r36/w/ExecReadmeRow/lane`, branch
`r36-execreadmerow`, base `0614092e0804aaca06642cb3a263a05c1cacc98e`,
work commit `b32e183f2609`. Patch: `/fast/scratch/kumitate-r36/w/ExecReadmeRow.patch`
(27 lines, 2 files).

## Row literal (corpus/README.md:95, inserted after the `lessons/round-35.md` row)

```
| `lessons/round-35-verifier-spotcheck.md` | Round-35 non-author verification (hyaku closure, not the lane): PROTOCOL conformance — report landed by the lane identity after the work commit, four `SHONEN` boxes with resolvable pointers, prompt fidelity, 172 seats; per-claim re-check with the C2/C3 distinct-axis ruling and the no-harm check; the discernment spot-check; four routed defects (anchor fidelity is not a gate term, two unbacked comparison outputs, 624 S1–S7 anchor debt open, the final cite evidence naming the operator's moving checkout); row added in round 36 it landed without one (`C2_TOTAL_DRIFT` 79→80) | commit `4c9e407`; fleet `.ufo/reports/round-35/kumitate.md` |
```

Shape matches the adjacent verifier row: 3 cells, file entry in backticks, a
`commit …; fleet …` primary-sources cell. `4c9e407` is the note's own
`lane-head:` and an object in this repo (`git cat-file -t` → `commit`);
`.ufo/reports/round-35/kumitate.md` exists in the fleet repo (the note's report
pointer). The fleet *report commit* `00b0344…` is NOT an object in this repo
(`git cat-file` fatal), so it is deliberately not cited — only the resolving pair.

## Completeness of the census (only this note was missing)

LC_ALL=C set difference over `find corpus/knowledge corpus/lessons -name '*.md'`
vs the row regex `^\| \`(knowledge|lessons)/[^\`]+\``:

```
=== unmapped notes:            (empty)
=== rows naming absent files:  (empty)
=== dup rows:                  (empty)
```

So no other note file is missing and no row points at a nonexistent file.

## The two SCORECARD counting commands

Before (HEAD 0614092):

```
$ grep -cE '^\| `(knowledge|lessons)/' corpus/README.md
79
$ find corpus/knowledge corpus/lessons -name '*.md' | wc -l
80
```

After (patch applied):

```
$ grep -cE '^\| `(knowledge|lessons)/' corpus/README.md
80
$ find corpus/knowledge corpus/lessons -name '*.md' | wc -l
80
```

## proxy-check — C2_TOTAL_DRIFT stops, exit 0

Before (HEAD 0614092, `node scripts/proxy-check.mjs --src /fast/scratch/kumitate-r36/src`):

```
PROXY  error  C2_TOTAL_DRIFT  C2_total: declared=79 computed=80 delta=+1
PROXY  error  AXES_DRIFT  coverage: ## Axes row=10 derived=9
PROXY  warn  PIN_UNPINNED  scripts/sources-check.mjs has no pin.<name> key in the kumitate-proxy-v1 stanza
PROXY: DRIFT (C2_TOTAL_DRIFT …; AXES_DRIFT …; PIN_UNPINNED …)
```

After the row alone (stanza untouched) — proves the drift was structural, not prose:

```
PROXY  error  C2_DRIFT        C2: declared=79 computed=80 delta=+1
PROXY  error  C2_TOTAL_DRIFT  C2_total: declared=79 computed=80 delta=+1
PROXY: DRIFT (…)
```

`C2_total` is the note-file census (`scripts/proxy-check.mjs:756`,
`C2Total = notes.length`) while `C2` is the row count (`:755`). Adding a row moves
`C2` only, so **no README-only patch can clear `C2_TOTAL_DRIFT`**; the declared
pair has to travel with the census. The round's own connector item already prices
this (`C2_total 80`). Hence the patch also carries the minimal stanza update
(`SCORECARD.md:288-289`, `C2=79→80`, `C2_total=79→80`; no other stanza key
touched). After the full patch:

```
PROXY  warn  PIN_UNPINNED  scripts/sources-check.mjs has no pin.<name> key in the kumitate-proxy-v1 stanza
PROXY: MATCH (A=7 C=13 operability=8; C1=19/19 C2=80/80 coverage=10; S=88/88 coverage:script-layer=10; R=83/92 coverage:runtime-layer=9; K=51/51 coverage:kimi-layer=10; pins=6 match)
proxy_exit=0
```

Consequence for the L1: `AXES_DRIFT term=coverage` clears **automatically** — the
derived `coverage` is `floor(10 × 19/19 × 80/80) = 10` (`proxy-check.mjs:554`),
which equals the existing `## Axes` row `| coverage | 10 |`. No Axes text edit is
needed for `coverage`; `coverage:runtime-layer` 9→10 still awaits the R5/R7
sections (C2 scribe lane).

## Citation no-harm (measured, not assumed)

Baseline `node scripts/cite-check.mjs` on the base tree: `errors=575 warnings=511`
(pre-existing DRIFT, unrelated to this item). First draft of the row wrote
`` `final/cite.txt` `` in the Covers cell, which cite-check tokenizes as a source:
it added exactly one error (`corpus/README.md:95 final/cite.txt UNRESOLVED`,
575→576, verified by multiset-diffing the `--json` findings). Rephrased to "the
final cite evidence naming the operator's moving checkout"; final run:

```
CITE_CHECK: DRIFT (files=84 tokens=8480 errors=575 warnings=511)
```

— the same 575 errors as base, i.e. the row adds no citation error. (Token count
8478→8480: the two source-shaped spans the row adds, both resolving OK.)

## Files changed / risks / blockers

- `corpus/README.md`: +1 coverage-map row (`:95`). `SCORECARD.md`: stanza
  `C2`/`C2_total` 79→80 (`:288-289`). No other file touched; nothing in the
  read-only pin tree (`/fast/scratch/kumitate-r36/src`) was read beyond
  proxy-check's in-process `probeSections` walk, and nothing written there.
- Risk (merge): the stanza hunk is a 2-line edit inside `kumitate-proxy-v1`, the
  same block `ExecProxyPin` (pin.* keys) and the checklist lane (C=14) touch. If
  the L1 prefers to land the stanza move itself, dropping this 2-line hunk leaves
  the README row correct but restores `C2_DRIFT`+`C2_TOTAL_DRIFT` until the stanza
  says 80/80 — the row and the pair must land together.
- Risk (prose): `LOG.md:1620` quotes round 35's `C2=79/79` and `LOG.md:1613` the
  r35 lesson "C2 77 → 79/79" — both historical quotes of that round's gate
  output, left untouched (rewriting them would falsify the record).
- Blockers: none. Tool installs: none.
- [INFERENCE] `PIN_UNPINNED` is the expected warn at this base (PIN v1 not yet
  implemented by `ExecProxyPin`); it is a warn, so it does not gate.

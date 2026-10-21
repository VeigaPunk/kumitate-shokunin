C2README missing=corpus/lessons/round-34-verifier-spotcheck.md

# C2 README-map drift: the exact missing row

Scope: `corpus/README.md` map completeness against `corpus/knowledge` + `corpus/lessons`
(the C2 / C2_total universe of `scripts/proxy-check.mjs`). Read-only; no repo mutation,
no install.

## Answer

Exactly **one** corpus note lacks a `## Coverage map` row. No phantom rows and no duplicate
rows exist, so the drift is one row, not a re-census.

| quantity | command | value |
|---|---|---|
| rows (C2) | `grep -c '^| `\(knowledge\|lessons\)/' corpus/README.md` | **77** |
| files (C2_total) | `find corpus/knowledge corpus/lessons -name '*.md' \| wc -l` | **78** |
| delta | — | **+1 file** |

File/row diff (normalized to repo-relative keys, `LC_ALL=C comm -23`):

```
--- files missing a README row ---
lessons/round-34-verifier-spotcheck.md
--- rows without a file ---
(none)
--- duplicate rows / duplicate files ---
(none)
```

The C2 subset matches the frozen derivation exactly: `RE_README_ROW = /^\| `(knowledge|lessons)\//`
(`scripts/proxy-check.mjs:328`), `C2 = countLines(readmeText, RE_README_ROW)` (:749),
`C2_total = notes.length` (:750, the `corpus/knowledge`+`corpus/lessons` walk).
`corpus/knowledge` = 40 files, `corpus/lessons` = 38 files, 0 subdirectories.

This is why the baseline reports `C2_TOTAL_DRIFT term=C2_total declared=77 computed=78`
and **not** `C2_DRIFT`: the row count still equals its declaration; only the file census moved.

## Cause (observed)

`git show --stat a5683a9`:

```
a5683a9 round-34 verifier spot-check (integrator, kaika): non-author admit/reject sample + adjudication
 corpus/lessons/round-34-verifier-spotcheck.md | 17 +++++++++++++++++
 1 file changed, 17 insertions(+)
```

The commit landed the note only. `git log -- corpus/README.md` → last touch `1a8eed5`
(round-34 main integration), i.e. the README was not touched afterwards, and the
`kumitate-proxy-v1` stanza was not re-pinned either. The file's own header states the
convention that makes a map row mandatory, not optional: it is a separate "outside review"
artifact while the lane owns `corpus/lessons/round-34.md` — and every prior third-party
artifact in this corpus (aggregator audits, rows 61–63) carries a row.

## Term and axis impact (derived by reading `scripts/proxy-check.mjs`, not by editing)

`SCORECARD.md:282-283` declares `C2=77`, `C2_total=77`.

| after | computed C2 | computed C2_total | findings |
|---|---|---|---|
| today (baseline) | 77 | 78 | `C2_TOTAL_DRIFT`; `coverage` = floor(10 × 19/19 × 77/78) = 9 ⇒ `AXES_DRIFT coverage row=10 derived=9` |
| row added, stanza unchanged | 78 | 78 | `C2_DRIFT` (declared 77) — **a new error**, so the row alone is not a fix |
| row added + stanza re-pinned 78/78 | 78 | 78 | both C2 findings clear; `coverage` = 10 ⇒ `AXES_DRIFT coverage` also clears |

So the row and the stanza (`SCORECARD.md:282` `C2=78`, `:283` `C2_total=78`) must land in the
same change. A, C, C1, and every S/R/K term are untouched by this repair; the surviving
`AXES_DRIFT coverage:script-layer` (row=10 derived=9, S_sections 86/88) is independent and
belongs to this round's C2 script-layer re-census, not to the README map.

## Drafted row 1 — ready to paste (missing note)

Placement: append immediately after `corpus/README.md:92` (the `lessons/round-34.md` row),
i.e. as the new last row of the `## Coverage map` table, before the blank line at :93.
The table is append-ordered by round, not sorted.

```markdown
| `lessons/round-34-verifier-spotcheck.md` | Round-34 non-author verification (integrator-written artifact, not the lane — the lane owns `corpus/lessons/round-34.md`): 2-row spot-check with both verifier decisions `agree` — an admit (kimi-mcp-plane + omp-task-contract source facts and recheck outputs reproduced; registry capability admitted only after false-clean cases were repaired and independently rechecked) and a reject (S019 security province, S020 locator drift; exact opened content supports rejection and the flip conditions); adjudication of the bounded claims (operability fraction improved with the integer held at 8, Kimi computed 9→10 within the frozen 50 members, source gate direct-file scope only) plus expansion +2 notes / quality unchanged / discernment improved after resolving outside disagreement, frozen v1 restored, no roster or promotion authority exercised | commit `a5683a9`; artifact owner: integrator (kaika, non-author) |
```

Citation-safety notes for this row:
- `commit `a5683a9`` is a real, resolvable pin in this checkout (`git rev-parse a5683a9^{commit}`
  → `a5683a96cae2fcdcf313e4a3b47dea340d6451a9`) and matches `PIN_RE` in `scripts/cite-check.mjs:1116`.
- `corpus/lessons/round-34.md` is path-qualified on purpose: bare `round-34.md` basenames are the
  round-24 wrong-tree binding class.
- No line-number citations and no `CORPUS.md` reference are copied into the row.

## Drafted row 2 — `corpus/lessons/round-35.md` (new note, not yet on disk)

`ls corpus/lessons/round-35.md` → absent. The row below is a **close-time draft**: the file and
the row must land together, because a row without the file makes C2 exceed C2_total by one
(the mirror image of today's drift). Slots the lesson must fill from measurement are marked `⟨…⟩`.

```markdown
| `lessons/round-35.md` | Round-35 method: three pre-registered claims on three axes — operability: `scripts/proxy-check.mjs` derives `S_sections`/`R_sections` as DISTINCT in-family member identities, so a duplicate-one/drop-one note mutation fires `S_SECTIONS_DRIFT`/`R_SECTIONS_DRIFT` (before: the mutation survived) ⇒ ⟨selftest/arm counts⟩; coverage:script-layer: script-layer re-census at the pinned upstream revision `31c465f1` (upstream `964f443e`→`31c465f1`: S members 91→88, 2 added / 5 deleted / 55 modified), every changed member's anchors re-verified ⇒ S ⟨before⟩/88 → ⟨after⟩/88, `coverage_script` ⟨9→10⟩; coverage:kimi-layer: the pre-registered K1 registry change 3→4 adds root `~/.kimi-code/mcp.json` as a SHAPE-ONLY member (presence, kind, mode floor; content never read) ⇒ census `UNLISTED mcp.json` DRIFT clears, K ⟨50/50 → 51/51⟩ | LOG.md round-35; commit `round-35` |
```

Preconditions before pasting: (1) `corpus/lessons/round-35.md` exists; (2) every `⟨…⟩` replaced
by the measured value carried by that lesson's `## Gate`; (3) the stanza re-pin for the round
(`S_members`, `S_sections`, `K_members`, `K_sections`, `coverage_script`, `coverage_kimi`) lands
in the same change, since the row count and file count both move 78 → 79.

## Commands run (with output)

```
$ find corpus/knowledge corpus/lessons -name '*.md' | sed -E 's|^corpus/||' | LC_ALL=C sort > /tmp/c2r_files.txt
$ grep -oE '^\| `(knowledge|lessons)/[^`]+`' corpus/README.md | sed -E 's/^\| `//; s/`$//' | LC_ALL=C sort > /tmp/c2r_rows.txt
$ LC_ALL=C comm -23 /tmp/c2r_files.txt /tmp/c2r_rows.txt
lessons/round-34-verifier-spotcheck.md
$ LC_ALL=C comm -13 /tmp/c2r_files.txt /tmp/c2r_rows.txt
(empty)
$ wc -l /tmp/c2r_files.txt /tmp/c2r_rows.txt
  78 /tmp/c2r_files.txt
  77 /tmp/c2r_rows.txt
$ grep -c '^| `\(knowledge\|lessons\)/' corpus/README.md
77
$ find corpus/knowledge corpus/lessons -name '*.md' | wc -l
78
$ ls corpus/knowledge/*.md | wc -l ; ls corpus/lessons/*.md | wc -l
40
38
$ find corpus/knowledge corpus/lessons -mindepth 1 -type d | wc -l
0
$ git show --stat --oneline a5683a9 | head -3        # file-only artifact commit, see Cause
$ git rev-parse --verify -q a5683a9^{commit}
a5683a96cae2fcdcf313e4a3b47dea340d6451a9
$ git log --oneline -2 -- corpus/README.md
1a8eed5 round-34: sources-registry gate + SOURCES/QUALITY ...
4151491 round-32: integrate S8 note re-census; ...
$ sed -n '276,312p' SCORECARD.md                     # stanza C2=77/C2_total=77, ## Axes rows
```

Baseline relied on: `.ufo/waves/round-35/baseline/proxy.txt` (read, not re-run) —
`C2_TOTAL_DRIFT term=C2_total declared=77 computed=78 delta=+1`.

## Remaining unknowns

- Whether the L1 wants the drafted row-1 summary to also name the two fleet-repo report files
  (`kumitate-review.md`, `kumitate-critic.md`): [INFERENCE] they do not resolve from this
  checkout under `cite-check`, so they were kept out of the row on purpose.
- The verifier note's header cites a bare `CORPUS.md` (line 3) that exists only at the fleet repo
  root (`/home/vgpnk/Projects/shokunin/CORPUS.md`), not in this checkout and not in the pinned
  upstream tree (`ls /fast/scratch/kumitate-r35/src/CORPUS.md` → absent). Whether `cite-check`
  grades that token is untested here (out of item scope; no gate was run) — [INFERENCE] it is a
  known main-repo-relative path convention, so likely a note, not an error.
- The `## Axes` `coverage` row's prose "C2 53/53" (`SCORECARD.md:308`) is a round-17 historical
  measurement; the derived integer is the gate and reaches 10 again at 78/78, so no integer edit.

Tooling: none installed or upgraded.

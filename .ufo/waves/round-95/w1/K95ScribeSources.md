# K95ScribeSources — round 95 SOURCES rows (S273, S274)

Seat dir: `.ufo/waves/round-95/K95ScribeSources/`. Lane untouched: only the seat dir and
this report were written. No source was refused.

## What was produced

Two registry rows for the L1 entry `corpus/knowledge/round-gate-registry-shape.md`,
both `mined`, `opened 2026-11-07`, `recheck on-release`, tier A, kind `spec`:

- **S273** — GitHub Flavored Markdown spec, § 4.10 Tables (extension)
  https://github.github.com/gfm/#tables-extension- — HTTP 200, body sha256
  `b153d814fdfc8624bb6da7449162c1cd707a637f7d1c1b636eb44b9cf63fa220`.
  Teaches: a pipe is escaped into a cell's content with a backslash (also inside code
  and emphasis spans), so an escaped pipe is content, not a delimiter; leading and
  trailing pipes are *recommended* for clarity, not required, so GFM rows are not a
  fixed-width field shape. This is the ground for the lane being **stricter** than the
  grammar it superficially resembles: the 11-cell / `NF==13` census shape is a lane
  contract (CORPUS.md), not GFM.
- **S274** — POSIX awk, The Open Group Base Specifications Issue 8
  https://pubs.opengroup.org/onlinepubs/9799919799/utilities/awk.html — HTTP 200, body
  sha256 `6df7d0776af4b28dbc3ec667a02a18e51ccd5066ea45a22166214e7e3832f898`.
  The Issue 8 URL answered, so the 2018 fallback (`.../9699919799/...`) was not used.
  Teaches: with a single-character FS other than space, fields are delimited by each
  single occurrence of that character, and NF is the number of fields in the current
  record — the mechanism behind the census `awk` field-count test.

Quotes (rendered text: tags stripped, entities unescaped, hard wraps joined with one
space; GFM apostrophes are U+2019 as in the body):

| src | quote | words |
|---|---|---|
| S273 | Include a pipe in a cell’s content by escaping it, including inside other inline spans: | 15 |
| S273 | A leading and trailing pipe is also recommended for clarity of reading, and if there’s otherwise parsing ambiguity. | 18 |
| S274 | Otherwise, if FS is any other character c, fields shall be delimited by each single occurrence of c. | 18 |
| S274 | NF The number of fields in the current record. | 9 |

Locations: GFM § 4.10, the sentence before Example 200 (body line 4575) and the first
sentence after Example 198 (body line 4510); POSIX § Regular Expressions
(`tag_20_06_13_04`), FS behaviour item "If FS is a single character" (body byte 51297),
and § Variables and Special Variables (`tag_20_06_13_03`), NF entry (body byte 42171).

## Gates run (receipts in `census.txt`)

1. Baseline: the untouched lane registry through
   `scripts/sources-census.sh validate --file <lane>/corpus/SOURCES.md` → **exit 0**
   with 8 pre-existing `W04` warnings.
2. Both rows are `NF=13` under `awk -F'|'` (11 cells + leading and trailing delimiter).
3. Validator on the scratch mirror **before** the used-by entry exists → only
   `E11 S273` and `E11 S274 missing used-by corpus/knowledge/round-gate-registry-shape.md`,
   **exit 1**.
4. Same mirror with a placeholder at `corpus/knowledge/round-gate-registry-shape.md` →
   **exit 0**, same 8 pre-existing `W04`, no new finding.
5. Frozen predicate `awk -F'|' '/^ {0,3}\|[[:space:]]*S[0-9][0-9][0-9]+[[:space:]]*\|/ && NF!=13'`
   on the copy (212 rows) printed **nothing**; the synthetic 12-field control row
   (`control-malformed.md`) **was** printed, so the predicate is live, not vacuous.
6. Id space: 210 lane rows → 212 in the copy, no duplicate ids, max id `S274`.

The mirror is `<scratch>/root/corpus/SOURCES.md` with every other lane top-level entry
symlinked read-only; `--file` resolves used-by paths against the lane root, so a
corpus-only copy reports 26 unrelated `E11`s for `scripts/…`, `SKILL.md` and `.ufo/…`
targets. The validated file is preserved as `SOURCES.with-rows.md`
(sha256 `064316a938599f8903c3a62eb32bad69aac873d1aeec33f56e2fea576fa93fa5`).

## Findings for the L1

- **Land the rows and the knowledge entry together.** The two rows pass only once
  `corpus/knowledge/round-gate-registry-shape.md` exists; landing the rows alone makes
  the lane's `validate` exit 1 with two E11s.
- **Clock:** host UTC was `2026-11-07T00:37Z` while local `date -I` read `2026-11-06`;
  the census defaults `--today` to `date -u +%F` = 2026-11-07, so `opened 2026-11-07` is
  present, not future (E08 clean).
- **Precheck:** `grep -n 'github.github.com\|pubs.opengroup.org'` hits only S256
  (realpath(3), a different opengroup page); no existing row covers either URL.
- **Quote hygiene trap:** the raw bodies wrap the sentences and mark `FS`, `c`, `NF`
  with inline tags; a naive `grep` of the raw HTML misses them. Counts were taken on
  the rendered text with `printf '%s' "<quote>" | wc -w` (15 / 18 / 18 / 9) — no
  off-by-one versus past rounds.

## Out of scope (not done, per seat bounds)

No edit to `scripts/round-gate.mjs`, `corpus/SOURCES.md`, the probe, controls, plan, or
the candidate; no insertion of these rows into the lane; no candidate attack.

## Artifacts

`.ufo/waves/round-95/K95ScribeSources/`: `rows.md`, `quotes.md`, `census.txt`,
`fetch.log`, `sha256.txt`, `wordcounts.txt`, `precheck-grep.txt`,
`SOURCES.with-rows.md`, `placeholder-knowledge-entry.md`, `control-malformed.md`,
`sources/gfm-tables.html`, `sources/posix-awk.html`.

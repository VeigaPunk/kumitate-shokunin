# K96ScribeLesson — round-96 knowledge entry + Q90 (scribe seat)

Seat scope: draft the round-96 knowledge entry and the mined-mistake counter (Q90). Read-only on the lane;
every write is under `.ufo/waves/round-96/K96ScribeLesson/` (plus the w1 report and
`/fast/scratch/hyaku/kumitate-r96/K96ScribeLesson`, removed before yield). No tool installed or upgraded. No
product, probe, plan, control, SOURCES or QUALITY byte was edited; the drafts are handed to the L1.

## Deliverables

| file | what it is |
|---|---|
| `knowledge-round-gate-registry-section.md` | knowledge entry draft: R96 section state, why the census and not CommonMark, the clause battery + 20 pre-data controls, limits; frontmatter `source:` cites **S275** (placeholder) + S273/S274/S271/S267–S269, `verified-at: <M>` |
| `lesson-draft.md` | M96-1 `## Mistakes` row + QUALITY **Q90** draft + the demo matrix + integration notes |
| `lesson-urls-cmd.txt` | the Q90 command (one `node -e` line, `"$1" "${2:-}"`; sha256 `84b1672a…`, `receipts/lesson-urls-cmd-sha256.txt`) |
| `receipts/` | 14 receipts, each carrying the command it ran |

## What the entry says

- **Class**: `declaredPins()` (`scripts/round-gate.mjs:398`, `:414-429` at lane HEAD `f5873bff`) matches every
  row-shaped line wherever it sits; the census `row_pass` (`scripts/sources-census.sh:609-624`) prints **E12**
  for a row outside `## Registry` and the lane `sources-check.mjs` carries the same finding
  (`ROW_OUTSIDE_REGISTRY`, `:232-234`). BASE declares 15 tokens on fixture A vs the 7 inside rows
  (`controls/ctl-nothing.txt`).
- **Rule R96** is quoted verbatim from `plan.md` (normalized-whitespace equality checked; the plan's `**outside**`
  and closing CommonMark sentence included, inside a 4-backtick fence because the rule names a fence).
- **Why the census**: one authority per file; a CommonMark reader would trust rows the census calls E12 on the
  three clauses the battery pins (`## Registry ##`, `## Registry\r`, `## ` in a fence). Also measured: the two
  validators share the finding but not a reader — whole-CRLF registry → census 212 × E12, `sources-check` **no**
  outside finding; `##<TAB>Registry` → census 0 E12, `sources-check` 212 outside
  (`receipts/section-reader-divergence.txt`). So the gate names the fleet reader rather than either of two
  disagreeing copies.
- **Clause battery / controls**: FIX-A one row per clause, FIX-B whole-CRLF, census re-derived each run
  (SETUP exit 2 on disagreement); 20 controls, `ctl-positive` HELD, 19 UNMET (`receipts/controls-verdicts.txt`,
  20 lines). The pre-freeze catch is recorded: `ctl-defaultin` reached HELD on the first run because fixture A
  opened with a `#` heading; `controls/prefreeze-run1/ctl-defaultin.txt` (`HELD`) vs
  `controls/ctl-defaultin.txt` (`UNMET`).
- **Limits**: 0 real outside rows (my own census-state awk over `corpus/SOURCES.md`: `rows=212 malformed=0
  outside=0`, `receipts/real-outside-rows.txt`); whole-CRLF declares nothing (fail-closed, the census's own
  reading); fences read as both readers read them; disclosure not finding; lazy read; exotic id-cell whitespace
  unarmed; shape is not honesty.
- Entry header validated on a scratch root against the lane validator: no `ENTRY_*`, `HEADER_INCOMPLETE`,
  `SECTION_MISSING` or `ROW_OUTSIDE_REGISTRY` when S275 is a registered row
  (`receipts/entry-header-check.txt`; the 249 `USED_BY_MISSING` lines are the scratch root's artefact).

## Q90 (mined mistake M96-1)

One `node -e` line reads a lesson, collects the ids its new-row declaration marks (`### Rows touched` →
`New:` since r94; `New rows,` table; `**Source rows opened this round**` bullets), looks each id up in
`corpus/SOURCES.md`, and requires the row's URL (fragment, trailing punctuation and `/` dropped) to be a
substring of the lesson text.

| lesson | observed | rc | receipt |
|---|---|---|---|
| round-95.md | `MISSING_URL S273 …`, `MISSING_URL S274 …` | 1 | `lesson-urls-round-95.txt` |
| round-94.md | `MISSING_URL S272 …` | 1 | `lesson-urls-round-94.txt` |
| round-47.md | `MISSING_URL` ×5 (S080, S083, S087, S088, S089) | 1 | `lesson-urls-round-47.txt` |
| round-34.md | `LESSON_URLS: CLEAN new=20` | 0 | `lesson-urls-round-34.txt` |
| round-35.md | `LESSON_URLS: CLEAN new=8` | 0 | `lesson-urls-round-35.txt` |
| round-36.md | `LESSON_URLS: CLEAN new=4` | 0 | `lesson-urls-round-36.txt` |
| round-46.md | `LESSON_URLS: CLEAN new=2` | 0 | `lesson-urls-round-46.txt` |
| round-91.md | `LESSON_URLS: NONE` | 0 | `lesson-urls-round-91.txt` |
| r95 copy + S273 URL | `MISSING_URL S274` only | 1 | `lesson-urls-positive-twin.txt` |

## Findings (for the L1 / judge)

1. **Divergence, not introduced**: the census and the lane `sources-check.mjs` disagree on the section reader
   for exotic headings (CRLF and `##<TAB>Registry`, opposite directions, measured above). R96 deliberately
   mirrors the census; the entry discloses this and does not claim the two checkers share a reader.
2. **The M96-1 class recurs**: r94 (S272) and r47 (5 of 16 new rows) fail the same test, so Q90 is a class
   instrument, not a single-lesson patch. Older failures are not rewritten (Q90 binds from r96, like Q89).
3. **Placeholders to fill at integration**: `S275` (must be a registered row before the entry lands, or
   `ENTRY_SOURCE_UNKNOWN`) and `verified-at: <M>` (r95 spot-check routed item 3).
4. Candidate state at write time: `.ufo/waves/round-96/K96ExecTool/round-gate.mjs` exists, `READY` does not —
   this seat's deliverables are candidate-independent and cite no candidate bytes.

## Out of scope (not done, correctly)

No lane edit (plan/probe/controls/open/SOURCES/QUALITY/lessons untouched); no candidate attack (not this
seat's assignment); no reader-row/URL claims about S275's page (K96ScribeSources owns that); no commit.

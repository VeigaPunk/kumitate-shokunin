# Quarantine-Count — re-derived lane slice count and per-row diff vs committed verdicts

Seat: `L1Kumitate62.Audit18` (critic, round 62 wave 2, godspeed).
Task: re-derive the kumitate slice count from the absent-defect register by **shape-matching**
(not fixed columns), verify 9 rows, and diff per-row verdicts against the committed
`verdicts.md` (`round-61/build/ScoutQuarantineRegister/verdicts.md`). Read-only; no edits, no
network fetches, no tool installs. Scratch: `/tmp/kumitate-r62/QuarantineCount/`.

## Answer

- Slice count re-derived from the register: **9 rows** — 5 from the 7-column `payload-absent`
  table (S109, S116, S118, S129, S142) + 4 from the 5-column "quote NEVER CHECKED" table
  (S143, S144, S145, S178). Exactly matches the committed verdicts.md's 9-row table (ids,
  rounds, classes: 9/9).
- Per-row verdict diff: **no disagreement between the re-derived slice and the committed
  per-row table**. The only per-row inconsistency is **inside the committed file itself**:
  row S116 is filed `absent` (verdicts.md:72) and counted in the tally `present 8 · absent 1`
  (:81), while the file's own appended wave-2 note (:235-238) supersedes it to
  `present-in-v3` (per `round-61/w2/Audit14.md`). Post-note effective tally: **9 present /
  0 absent**, i.e. the committed tally line is stale relative to its own correction.
- The re-derivation is **input-stable**: register sha256 `5afe1810a6c3d62f37987b575a954f5b1197daa23005d4bb2f1d982f64bad833`, size 83,621 B, mtime 2026-10-24 08:37 -0300 — unchanged from round-61 w1.

## Method: shape-matching (re-derived, not fixed columns)

Parse: split each logical row on `|`; trim each cell; **strip all backticks**; then classify
cells by content shape:

- lane cell: exactly `kumitate`;
- round cell: fullmatch `^round[0-9]+$`;
- id cell: fullmatch `^S[0-9]+$` (length ≤ 7);

select rows having all three; read class/quote/URL by cell content (7-col rows carry a quote
cell; 5-col rows have none).

### Why both properties are load-bearing

| probe | result |
|---|---|
| no backtick stripping | **0 rows** — every lane cell is `` `kumitate` `` and every never-checked id cell carries a stray trailing backtick (`` S143` ``) |
| fixed-column index (cols 2-4) | works for the 7-col table only; fragile because the register's own main table holds rows with 8 and 11 cells (unescaped `|` inside quote cells: game-dev-3d S083/S091, revenger S111, tabi S124/S163) — column indices shift |
| shape-matching + tick-strip (used) | 9 rows, each with exactly one id cell, id set unique |

### Slide extraction (verbatim from the register)

| line | id | round | table (cols) | class | cited source (register) |
|---|---|---|---|---|---|
| 136 | S109 | round1 | main (7) | payload-absent | https://modelcontextprotocol.io/docs/2026-07-28/learn/architecture |
| 137 | S116 | round1 | main (7) | payload-absent | https://arxiv.org/abs/2512.08296 |
| 138 | S118 | round1 | main (7) | payload-absent | https://arxiv.org/abs/2609.29095 |
| 139 | S129 | round3 | main (7) | payload-absent | https://blog.modelcontextprotocol.io/posts/2026-07-28/ |
| 140 | S142 | round4 | main (7) | payload-absent | https://github.com/can1357/oh-my-pi/blob/0b5c27ab…/packages/coding-agent/src/mcp/client.ts |
| 336 | S143 | round4 | never-checked (5) | never-checked | https://github.com/VeigaPunk/ufo-fsd-alpha.git |
| 337 | S144 | round5 | never-checked (5) | never-checked | https://github.com/VeigaPunk/ufo-fsd-alpha |
| 338 | S145 | round5 | never-checked (5) | never-checked | https://github.com/VeigaPunk/ufo-fsd-alpha |
| 339 | S178 | round8 | never-checked (5) | never-checked | https://dl.acm.org/doi/10.1145/38714.38742 |

Register-level confirmations (read-only):

- Main table data rows = **194** (196 pipe-start lines − header/separator) = the register's own
  `Totals` count; never-checked table data rows = **109** (111 − header/separator) = the
  register's own count; By-lane table sums to 194 and lists `kumitate | 5`.
- The register's own summary row `| `kumitate` | 5 |` (line 249) is correctly **excluded**
  (no round cell, no id cell) — the summary counts the 5 main-table rows only, i.e. it under-
  counts the slice by the 4 never-checked rows, which is why the slice must be re-derived from
  both tables.

## Per-row diff against committed verdicts.md

Committed `verdicts.md` (240 lines) per-row table at lines 71-79; tally at line 81; appended
wave-2 correction note at lines 233-240.

| # | register row | committed verdict (line) | committed class | diff |
|---|---|---|---|---|
| 1 | S109 | **present** (:71) | payload-absent | match |
| 2 | S116 | **absent** (:72) | payload-absent | **internal conflict**: the file's own note (:235-238) supersedes → present-in-v3 (Audit14); tally not updated |
| 3 | S118 | **present** (:73) | payload-absent | match |
| 4 | S129 | **present** (:74) | payload-absent | match |
| 5 | S142 | **present (row locator defect)** (:75) | payload-absent | match (verdict depends on remote pinned-tree evidence; not re-fetched here) |
| 6 | S143 | **present** (:76) | never checked | match |
| 7 | S144 | **present** (:77) | never checked | match |
| 8 | S145 | **present** (:78) | never checked | match |
| 9 | S178 | **present** (:79) | never checked | match |

Findings from the diff:

1. **Stale tally.** The committed conclusion `present 8 · absent 1 · unverifiable 0` (:81)
   contradicts the committed file's own correction: after applying the note, S116 is
   present-in-v3 → effective 9 present / 0 absent. The verdicts.md is therefore internally
   inconsistent on exactly the row that carries the slice's only `absent`.
2. **Truncated stored quotes.** The register's quote cells truncate at ~80 chars (S109 ends
   `…clientCapabiliti`, S118 `…in LLM Agen`, S129 `…Session-Id he`; the register's own quote
   for S109 is cut *mid-word*). A literal substring-recheck against the register's stored
   quote would false-negative even against the true source; the committed verdicts used full
   quotes (from `quote-lint-full-v5.json`/staging gates). Any future recheck must match on the
   full quote, not on the register cell.
3. **Cosmetic**: verdicts.md contains a duplicated heading (`### S118 — present` at :107 and
   `### S118 — duplicate-row context` at :114); the second is a sub-section, not a second row
   (row count 9 unaffected). The w1 report's "230 lines" vs the current 240 lines is explained
   by the appended 10-line correction note.

## Smallest safe corrections

1. In the committed verdicts.md: update row 2's verdict to `present-in-v3` and the tally to
   `present 9 · absent 0` (or mark the tally as pre-correction), so the file no longer asserts
   both `absent` and `present-in-v3` for S116.
2. Keep the shape-based, tick-stripping extractor as the canonical slice derivation; record in
   the register generator that quotes are truncated cells (not full quotes) to prevent
   substring-recheck false negatives.

## Bounds observed

Read-only over the register (`/home/vgpnk/Projects/shokuknow/…/absent-defect-register.md`) and
lane files; no edits, no commits, no network fetches, no tool installs/upgrades; scratch only
in `/tmp`.

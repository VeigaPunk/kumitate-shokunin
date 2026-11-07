# Round 96 lesson draft — M96-1 (mined mistake) and QUALITY Q90

Writable scope: this seat. Nothing here is landed; the L1 copies the row and the criterion into
`corpus/lessons/round-96.md` and `corpus/QUALITY.md`.

Context: round 95's lesson `## Gate` admitted S273 and S274 with access date, location and quote but **no
URL** (`corpus/lessons/round-95.md:28-33`); CORPUS rule 1 asks the lesson (not only the registry row) to carry
the URL, and the non-author closure caught it by hand (`corpus/lessons/round-95-verifier-spotcheck.md` §5 item
1). The class is not a one-off: the same command finds it in round 94 (S272) and in round 47 (5 of 16 new
rows). Round 96's lesson therefore carries the URL for every new row, and Q90 makes that checkable.

## `## Mistakes` row (draft)

| class | evidence pointer | captured-by | fix |
|---|---|---|---|
| **M96-1 — a lesson's `## Gate` admitted new `corpus/SOURCES.md` rows without their URLs.** Round 95 recorded access date, location and quote for S273/S274 but never the URL, so the row could not be re-opened from the lesson without grepping the registry; CORPUS rule 1 asks the lesson to carry it. The same class is present in earlier lessons: round 94 omits S272's URL, round 47 omits 5 of its 16 new rows' URLs. | `corpus/lessons/round-95-verifier-spotcheck.md` §5 item 1; `corpus/lessons/round-95.md:26-33`; command runs `K96ScribeLesson/receipts/lesson-urls-round-95.txt` (`MISSING_URL S273 …`, `MISSING_URL S274 …`, rc=1), `…/lesson-urls-round-94.txt` (S272, rc=1), `…/lesson-urls-round-47.txt` (5 ids, rc=1) | none (CORPUS rule 1 was prose; only the non-author closure caught it by hand — r95 spot-check §5 item 1) | QUALITY Q90; the command fails on round 95 (rc=1), round 94 (rc=1) and round 47 (rc=1) and passes on rounds 34 (`new=20`), 35 (`new=8`), 36 (`new=4`) and 46 (`new=2`) — all in `K96ScribeLesson/receipts/`. Round 96's own lesson carries `S275` with `https://spec.commonmark.org/0.31.2/` on its `New:` line and in `## Gate`. |

## QUALITY Q90 (draft, `corpus/QUALITY.md`)

### Q90 — a lesson's new source rows carry their registry URL (round 96)

- **Rule.** Every `S` id on a round lesson's new-row declaration is looked up in `corpus/SOURCES.md`; the
  row's URL (scheme+host+path, fragment and trailing punctuation dropped) must appear in the lesson text. The
  declaration shapes the corpus uses are read: the canonical `### Rows touched` → `New:` line (rounds 94+),
  the `New rows,` table (rounds 46–47) and the `**Source rows opened this round**` bullet list (rounds 34–36).
  The lesson is filed only when the command prints `LESSON_URLS: CLEAN new=<n>` and exits 0; a lesson with no
  new row prints `LESSON_URLS: NONE` and also exits 0. One `MISSING_URL <id> <url>` line per new row whose
  registry URL is absent, exit 1.
- **Grounding.** Round 95's `## Gate` recorded S273/S274 with date, location and quote but no URL (round-95
  spot-check §5 item 1; lesson M96-1). Round 94 (S272) and round 47 (5 of 16) carry the same class, so it is
  a class, not a slip: `receipts/lesson-urls-round-{94,47}.txt`. CORPUS rule 1 asks the lesson to carry the
  URL; without it the row is re-openable only by grepping the registry.
- **Who checks.** The L1 before filing its lesson; the closure re-runs it over the filed lesson.
- **Command.** `bash .ufo/waves/round-96/K96ScribeLesson/lesson-urls-cmd.txt corpus/lessons/round-<N>.md [corpus/SOURCES.md]`
  → `LESSON_URLS: CLEAN new=<n>` (or `LESSON_URLS: NONE`) exit 0 / one `MISSING_URL <id> <url>` per bad row,
  exit 1.
- **Fails when.** A declared new row's registry URL (fragment stripped, trailing `;,. )` and `/` dropped) is
  not a substring of the lesson text; the test is fragment-insensitive and trailing-slash-insensitive.
- **Shown able to fail.** `receipts/lesson-urls-round-95.txt` (`MISSING_URL S273 https://github.github.com/gfm`,
  `MISSING_URL S274 https://pubs.opengroup.org/onlinepubs/9799919799/utilities/awk.html`, rc=1) and
  `…/lesson-urls-round-94.txt` (S272, rc=1) against `…/lesson-urls-round-34.txt` (`CLEAN new=20`, rc=0),
  `…/round-35.txt` (`new=8`), `…/round-36.txt` (`new=4`) and `…/round-46.txt` (`new=2`), all rc=0. The positive
  twin `…/lesson-urls-positive-twin.txt` adds the S273 URL to a copy of round 95 and the command then reports
  only S274 — the check follows the bytes it reads, not the filename.
- **Limit.** URL presence is not quote fidelity (Q89 owns the quote word count) and not row truth (only a
  closure re-opening the page guards that). A row whose registry `source` cell carries no `http(s)` URL
  (own-work / command rows: S004, S008, S009, S021, S029, S080, S081, S083, S087–S090) is skipped, not passed.
  The check reads the registry as it stands at run time, so a later row-URL normalisation can fail an older
  lesson; like Q89 it binds lessons filed from round 96 on and older failures are not rewritten. The pre-r94
  declaration shapes are read best-effort (round 45's range bullets `S062–S074` are not expanded, so it reads
  `NONE`); a URL can appear in the lesson for a different reason (another row citing the same URL) and still
  satisfy the substring test. A lint, not a registered lane gate.

## Demo matrix (each row is a receipt under `receipts/`)

| lesson | new rows | declaration shape | observed | rc | receipt |
|---|---|---|---|---|---|
| round-95.md | S273, S274 | `Rows touched` → `New:` | `MISSING_URL` ×2 (S273, S274) | 1 | `lesson-urls-round-95.txt` |
| round-94.md | S271, S272 | `Rows touched` → `New:` | `MISSING_URL S272` (S271's URL present) | 1 | `lesson-urls-round-94.txt` |
| round-34.md | S001–S020 | `Source rows opened this round` | `LESSON_URLS: CLEAN new=20` | 0 | `lesson-urls-round-34.txt` |
| round-35.md | S021–S028 | `Source rows opened this round` | `LESSON_URLS: CLEAN new=8` | 0 | `lesson-urls-round-35.txt` |
| round-36.md | S029–S032 | `Source rows opened this round` | `LESSON_URLS: CLEAN new=4` | 0 | `lesson-urls-round-36.txt` |
| round-46.md | S078, S079 | `New rows,` table | `LESSON_URLS: CLEAN new=2` | 0 | `lesson-urls-round-46.txt` |
| round-47.md | S080–S095 | `New rows,` table | `MISSING_URL` ×5 (S080, S083, S087, S088, S089) | 1 | `lesson-urls-round-47.txt` |
| round-91.md | none | `Rows touched: none` | `LESSON_URLS: NONE` | 0 | `lesson-urls-round-91.txt` |
| round-95.md + S273 URL (scratch copy) | S273, S274 | `Rows touched` → `New:` | `MISSING_URL S274` only | 1 | `lesson-urls-positive-twin.txt` |

Command bytes: `receipts/lesson-urls-cmd-sha256.txt` (`84b1672a…`). The command is one `node -e` line in
`lesson-urls-cmd.txt`; no new file under `scripts/`.

## Notes for the L1 / integration

1. `knowledge-round-gate-registry-section.md` cites **S275** as a placeholder: land the CommonMark row first
   (or in the same commit) or `sources-check.mjs` reports `ENTRY_SOURCE_UNKNOWN` for the entry header.
2. `verified-at:` is `<M>` — fill the round-96 integration commit (the revision whose `scripts/round-gate.mjs`
   bytes the entry describes) before landing, per the r95 spot-check routed item 3.
3. Q90's command currently lives in this seat dir; if Q90 is adopted, the L1 may copy it next to the criterion
   (the path in the Command line must then be updated).
4. Round 96's own lesson must carry S275's URL in `## Gate` and on the `rows touched` line, or Q90 fails it.

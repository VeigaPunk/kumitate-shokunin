# K86ExecMap — R85-V12 section-membership arm for `readme-map` (candidate, not integrated)

Seat: K86ExecMap (executor, leaf). Lane: `/home/vgpnk/Projects/shokunin/kumitate-shokunin`.
Base HEAD observed read-only: `e7228850690c6bd48400140964cbaf18667fbc06`.
Write scope honoured: candidates only under `.ufo/waves/round-86/build/K86ExecMap/`; no production file edited.

## Result

Candidate complete for the gate arm, the two selftest arms, the README relocation and the pin re-derivation.
Not integrated: L1 must copy the two candidate files into place (see "Integration"). No tests or gate runs were
executed (per "no tests mid-flight"); every verdict below marked [INFERENCE] is unobserved.

## Scope discrepancy (read first)

The brief says "relocate the two rows after `## Frontier`". The document has **28** corpus rows outside the coverage map,
not two:

| Location (production `corpus/README.md`) | Rows | Notes |
|---|---|---|
| `## Coverage map` table, lines 14–226 | 189 | in-map |
| `## Known gaps`, lines 318–343 | 26 | headerless pipe block after prose (`All entries are falsifiable…`, line 316); not a rendered table |
| `## Frontier`, lines 357–358 | 2 | the two named in the brief |
| total | 217 | = `grep -c` / files 217 |

The brief defines the arm as "rows counted only inside the coverage-map section". Under that definition the 26 Known-gaps
rows are outside the map too, and the acceptance `README_MAP: CLEAN files=217 rows=217 covered=217` cannot hold unless they
move. I therefore relocated all 28. The two-row reading would have left the real tree DRIFT (`outside_map=26`). L1 should confirm
this reading; it is a count error in the brief, not a choice I could make alone.

## Patch inventory

Candidates (full-file replacements, not hunks — install by copy):

- `.ufo/waves/round-86/build/K86ExecMap/readme-map.mjs` → install as `scripts/readme-map.mjs`
  (sha256 `5e4ec34217d97f53d78d2b41da23a3e2d7ac85bba0572d5d0863595ae4b026d1`, 463 lines; production 424 lines, `b1c8bf97…`).
- `.ufo/waves/round-86/build/K86ExecMap/README.md` → install as `corpus/README.md`
  (sha256 `26bdceb7f793c8e832e79fad39a11bf526989acb466ae8a0de458fae6bd51bec`, 358 lines, same length as production `f249f898…`).
- Diffs kept as receipts: `build/K86ExecMap/patch-readme-map.diff` (65 changed lines), `build/K86ExecMap/patch-README.diff` (56 changed lines), `build/K86ExecMap/sha256.txt`.

Behavioural changes inside `readme-map.mjs` (line numbers are the candidate's):

- `loadRows` (139–167): a `## ` heading toggles membership; `## Coverage map` (word boundary) opens the map. In-map corpus rows → `rows`; others → `outside`. `format-unmapped` still scans every line. Returns `{rows, outside, bad}`.
- `evaluate` (202): findings start with `outside-map:<path>` for each outside row, then `format-unmapped`; duplicate/orphan/uncovered/unpinned work on in-map rows only, so a note whose only row is outside also reads `uncovered:<path>`.
- `stats` (250): new `outside_map` field, always present (0 on CLEAN).
- `emit` (255–273): DRIFT line becomes `README_MAP: DRIFT files=<n> rows=<n> covered=<m> bad=<k> outside_map=<j> first=<item>` (new token between `bad=` and `first=`). CLEAN and FAIL-CLOSED strings are byte-identical to before. `emit(result, asJson)` gains a JSON mode (see decisions).
- `--json` (460): argv flag; prints one JSON object (`verdict, exit, files, rows, covered, outside_map, bad, first`; `reason` on FAIL-CLOSED) instead of the text line. Exit codes unchanged. The brief names a `--json` field but the script had no JSON output, so this is new surface — L1 may drop it if undesired.
- Selftest: `fixture` takes `tail` (286, 293); arm 17 `outside-map` (row after `## Frontier` → DRIFT, `outside_map=[1-9]`, first `outside-map:lessons/b.md`, exit 1); arm 18 `inside-map-clean` (rows in the table with a prose `## Frontier` after → CLEAN, last line `README_MAP: CLEAN files=2 rows=2 covered=2`, exit 0). Count 16 → 18; header doc and final line updated to `PASS (18/18)`.
- Doc block (21, 24, 48–51, 65, 74–75) updated for the new token, flag, finding and count.

README relocation (candidate `corpus/README.md`):

- Rows formerly at 318–343 (26 rows, Known gaps) and 357–358 (2 rows, Frontier) appended directly after the coverage-map table (old line 226), now lines 227–254.
- Paste order came out Frontier-first (227–228 are `counter-receipt-discrimination`, `round-85`; 229–254 are the 26 Known-gaps rows). Content is byte-identical per row; the order is cosmetic. Reversing it would need another edit.
- The Known-gaps and Frontier sections keep their prose; the blank lines they leave are cosmetic.
- Receipt: the multiset of `| \`knowledge|lessons/…\` |` rows is identical between production and candidate (`diff` of sorted row lists → empty), and all 217 rows now sit under `## Coverage map`.

## Pin re-derivation

- `pin.readme-map` is the sha256 of `scripts/readme-map.mjs`. Production `b1c8bf97eb01fdb2ebfd46521c8e805fa2c36f8e10ce9740531162cd0b8ee74e`
  → candidate `5e4ec34217d97f53d78d2b41da23a3e2d7ac85bba0572d5d0863595ae4b026d1`.
- Pin sites that must move together after integration (L1 to re-pin, I did not edit them):
  - `SCORECARD.md:340` — `pin.readme-map=<sha>` (the `kumitate-gate-pins-v1` stanza value).
  - `.ufo/pins/counter-pins.json:92` — the round-58 `readme-map` entry (`counter-pins.mjs` requires its sha256 to equal the file bytes; L1 decides whether this entry is live or round-stamped history).
  - `scripts/proxy-check.mjs:562` maps `pin.readme-map` to the path only — no edit needed.
- The pin hash must be recomputed on the integrated file, not taken from this report, in case L1 edits the candidate.

## Integration

1. `cp .ufo/waves/round-86/build/K86ExecMap/readme-map.mjs scripts/readme-map.mjs`
2. `cp .ufo/waves/round-86/build/K86ExecMap/README.md corpus/README.md`
3. Re-pin `SCORECARD.md:340` and `.ufo/pins/counter-pins.json:92` to the sha256 of the integrated `scripts/readme-map.mjs`.
4. The integrated file uses only Node built-ins (`node:child_process`, `node:fs`, `node:path`, `node:os`, `node:url`); `LANE` resolves from `import.meta.url` as before, so it resolves the same way when installed at `scripts/`. Candidate placed under `build/` will resolve `LANE` to `build/`; do not run it from there.

## Downstream risks for L1 (not exercised)

- `corpus/lessons/round-85-verifier-spotcheck.md:96` and `:139` quote `README.md:356-357` — the defect's old location. After relocation those rows sit at `README.md:227-228`. The file is a non-author closure; L1 decides whether to correct the citation or leave it as a historical quote, and whether `cite-check` resolves it.
- Every other README line citation in `corpus/**` (`README.md:56-129`, `:97`, `:99`, `:160`, `:172`, `:173`, `:175`, `:196`) is above line 226 and unchanged.
- `scripts/spotcheck-adopt.mjs` uses `readme-map.mjs` as its child oracle. Its parsing (`^README_MAP: CLEAN … $`, `^README_MAP: DRIFT `, `first=`) is preserved. Its selftest fixtures at `:303` and `:329` build READMEs without a `## Coverage map` heading; under the new arm their rows read as outside-map, so any arm pinned to CLEAN on those fixtures would turn DRIFT. I did not read those arms in full — L1 should run `node scripts/spotcheck-adopt.mjs --selftest` once after integration.
- **Latent bug, not fixed (out of this item's scope):** `scripts/readme-map.mjs:224` calls `statSync(full)` where `full` is undefined. The try/catch swallows the ReferenceError, so a covered symlink whose target **exists** reads `stale-covered:` instead of the documented `covered-not-file:`. Selftest arm 16 covers only a dangling symlink, so it misses this. Recommend routing as a new defect (fix: `statSync(join(dirFor[ns], leaf))`).

## Decisions made (for L1 to confirm or reverse)

- A README with no `## Coverage map` heading is **not** a special case: every row is outside the map, so the gate reads DRIFT with `outside_map=<n>` and every note `uncovered`. I did not add FAIL-CLOSED, to keep the verdict set unchanged.
- `outside-map:<path>` is an additional finding per outside row (the brief specified only the `outside_map=` token). It sorts first, so `first=` names the cause.
- `outside_map` is printed between `bad=` and `first=` so the existing `first=` parser in `spotcheck-adopt` still works.

## Checks L1 should run once after integration

- `node scripts/readme-map.mjs --selftest` → `README_MAP_SELFTEST: PASS (18/18)`, `VERDICT: PASS`, exit 0 [INFERENCE: not run].
- `node scripts/readme-map.mjs` → `README_MAP: CLEAN files=217 rows=217 covered=217`, exit 0 [INFERENCE: not run].
- Fixture for the acceptance case: a note whose only row is after `## Frontier` → `DRIFT … outside_map>=1`, exit 1 (selftest arm 17 is that case; the production check also needs the pre-change CLEAN reproduced, which the old script gives by construction).
- `node scripts/spotcheck-adopt.mjs --selftest`; `node scripts/proxy-check.mjs --strict` (expect MATCH after the re-pin); `node scripts/cite-check.mjs`; `node scripts/readme-map.mjs`.

## Tooling, scratch, history

- No tool installed or upgraded. No pacman transaction. No ~/.local/bin change.
- No git mutation. Read-only: `git status --short -- corpus scripts .ufo/pins` (empty), `git rev-parse HEAD`.
- No scratch directory created; nothing to remove.
- Commands run: `cp` (production → build copies), `diff -u` (receipts), `sha256sum`, `wc -l`, `awk` row count by section, `diff` of sorted row lists. Exit codes: `diff` readme-map 1 (differs, expected), row multiset identical. No gate or selftest was run.

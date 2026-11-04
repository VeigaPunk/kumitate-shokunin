# SCORECARD correction (D5) — certified copy and status

Target file (lane): `SCORECARD.md`, appended section `## Round 80 correction` at lines 1273–1286.
Repair class: append-only correction naming the superseded text; the Round 78 section itself
(lines 3675 ff.) is intentionally left standing at HEAD.
Status at audit time: block EXISTS VERBATIM in the lane working tree
(`git diff --stat` → `SCORECARD.md | 34 ++++...---`; the correction hunk is `@@ -1253,6 +1270,19 @@`,
a pure insertion of 14 lines including heading). UNCOMMITTED — the L1 must commit it with the
other round-80 record edits. 14 lines including heading; under the 25-line bound.

## Exact text to land (verbatim from the lane working tree)

```markdown
## Round 80 correction (2026-11-04; named; supersedes only the text it names)

- **D5 (r79 routed defect).** The section `## Round 78 — declaration and verdicts` closes with
  "All 13 seats settled (`.ufo/waves/round-79/w1-results.json`); 12 wrote reports under `w1/`; …" — a
  round-**79** settlement sentence inside the round-78 section. Round 78's own record is
  `.ufo/waves/round-78/w1-results.json` (`seats: 14`, 14 result rows —
  `python3 -c "import json;d=json.load(open('.ufo/waves/round-78/w1-results.json'));print(d['seats'],len(d['results']))"`
  → `14 14`); the round-79 sentence and its file pointer are superseded here and are not evidence for
  round 78. The `<SETTLEMENT>` placeholder that round 78 left should have been resolved with round-78
  facts or left named as a placeholder.
- **Round-79 receipt names.** `corpus/lessons/round-79.md` Erratum 2 names the four `close/` pointers in
  its `## Counters` table that do not exist and the S229 quote's true word count (18, not 21).
```

## Audit certification

- The defect: TRUE. `git diff 5019803b 0fb019a3 -- SCORECARD.md` shows
  `-…<SETTLEMENT>` / `+…All 13 seats settled (`.ufo/waves/round-79/w1-results.json`); …` at the end of
  the round-78 base paragraph (diff lines 90–91) plus a second r79 sentence insertion at diff line 111.
  At HEAD the round-78 section (line 3675 header; line 3676 base paragraph) still carries the r79
  sentence — confirmed via `grep -n 'All 13 seats' SCORECARD.md` (3676 = round-78 section, 3702 =
  round-79 section).
- The correction's evidence command: re-run by this seat → `14 14` (`.ufo/waves/round-78/w1-results.json`
  has `seats: 14` and 14 result rows). TRUE.
- The correction's cross-reference to lesson Erratum 2: see `erratum-lesson-round-79-erratum3.md` —
  Erratum 2 is committed at `509afb1d` but needs the appended Erratum 3 precision fix.
- Provenance note: the working-tree SCORECARD diff contains two further hunks (`@@ -295` stanza
  C2 195→198; `@@ -558` round-80 claim rows + Round 81 pre-registration). Those are the L1's live
  round-80 record edits, not part of the D5 correction; they are appended/values-only and out of
  this seat's scope. Flag: plan Amendment 1.2 names the close stanza `C2=197/197` while the working
  tree now reads 198 — reconcile at close.

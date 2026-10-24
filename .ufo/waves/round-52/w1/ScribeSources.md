# ScribeSources — SOURCES rows S102/S103 + round-52 Gate block (drafts)

Written 2026-10-24T04:05:55Z. Drafted both registry rows and the `## Gate` ledger for
round 52. **`corpus/SOURCES.md` was not edited**; the lane was read-only outside this
seat's build dir and this report.

## Behavior / deliverable

- `build/ScribeSources/SOURCES-delta.md` — ready-to-append row lines for S102 and S103
  (11-column shape of `corpus/SOURCES.md:12`, appended after S101 at line 114), the
  deviation record for the S102 `kind` repair, an optional S103 anchor amendment, the
  `## Gate` block draft for `corpus/lessons/round-52.md`, findings, and a provenance ledger.
- Row lines are byte-identical to the scout files: S102 ←
  `build/ScoutRfc3339/sources-row-spec.txt`; S103 ← `build/ScoutCompanion/S103-row.md`
  (`diff` of the registry row against each file: no differences). Each row splits into 13
  pipe fields (11 cells) and contains no internal pipe.
- Gate block records, per new row: URL, access date with UTC time, and a located quote
  ≤25 words (S102: 5 words at RFC 3339 §5.6 saved line 422, plus a 21-word §5.7 fragment;
  S103: 14 words at saved HTML line 1765), with withheld-claim bounds and a spot-check line.

## Gates

No gate, counter, selftest or probe was run by this seat. Recorded deliberately: the
assignment's evidence class is a draft, and D52 (E1–E5) belongs to integration/close. Row
shape was checked only by delimiter count, not by `scripts/sources-check.mjs`.

## Touched surfaces

Writes (2, both inside the seat's allowed paths):
- `.ufo/waves/round-52/build/ScribeSources/SOURCES-delta.md` (new)
- `.ufo/waves/round-52/w1/ScribeSources.md` (this report)

One scratch file, `/tmp/scribe_rows.txt`, held the extracted row lines for the byte-diff
against the scout files and was removed immediately after use; nothing was written to the
lane's registry, corpus, or any other path.

Reads (read-only): `plan.md`; `base/` counters not re-read (plan quotes them);
`corpus/SOURCES.md` (head, S090–S101 rows, tail); `corpus/lessons/round-51.md:59-87` and
`round-50.md:83-105` (`## Gate` precedents); `scripts/sources-check.mjs` (contract header,
`KINDS`/`TIERS`/`STATUSES`, row split and `USED_BY_MISSING` arms); scout artifacts
`build/ScoutRfc3339/{rfc3339.txt,fetch.txt,sources-row.txt,sources-row-spec.txt}`,
`build/ScoutCompanion/{S103-row.md,fetch.json,quote.json,response-headers.txt,mdn-date-parse.html}`,
`w1/ScoutRfc3339.md`, `w1/ScoutCompanion.md`. No git/jj command was issued; no write outside
the two paths above; no fleet/sibling/MANIFEST/`~/.omp` touch. Tools installed or upgraded:
**none**.

## Findings

- **F1 — S102 `kind` was outside the frozen enum.** The first proposal used `standard`;
  the enum is `{spec,docs,paper,code,tool,dataset,talk,book,community,own-work}`
  (`scripts/sources-check.mjs:102-105`), so integration would emit `KIND_ENUM` E05 and D52
  E4 would not print `SOURCES_CHECK: CLEAN`. The ready row uses the owner-supplied `spec`
  variant (`sources-row-spec.txt`); the original stays on disk as the requested encoding.
  ScoutTierAudit reached the same conclusion independently (IRC, 2026-10-24).
- **F2 — Dependency: `used-by` target drafted, not yet in `corpus/knowledge/`.** Both
  `mined` rows name `corpus/knowledge/fail-closed-clock-validation.md`, which was absent at
  2026-10-24T04:05:55Z; the C2 entry now exists as a draft at
  `build/ScribeEntry/fail-closed-clock-validation.md` (20,138 B, sha256 `dbaed764…9d672`,
  re-hashed here). `USED_BY_MISSING` E11 (`sources-check.mjs:317`) fires for a mined row
  naming an absent path, and E2 resolves cited bodies with `git show <rev>:<path>`, so
  rows + entry + the three scout bodies must land in one integration commit (or entry first).
  The entry states the same constraint (`:161`); its seat's E1/E2 replica (`E1 True`,
  `bound=19`, `FILL=8`) is their measurement, not re-run here.
- **F3 — `corpus/lessons/round-52.md` is absent**; the `## Gate` block is a draft for the
  lesson author/L1, not an append to an existing file.
- **F4 — S103 has two different dates.** HTTP `Last-Modified` 2026-10-24T01:31:18 GMT
  (serving layer) vs page self-report 2025-07-10T09:07:55Z (saved HTML line 2011). Only the
  body sha256 `9c120292…d140` identifies the served revision; the supplied row is accurate
  but silent on the page date, so the delta offers an optional anchor amendment rather than
  rewriting the scout's cell.
- **F5 — Tier/scope.** S103 stays tier B (MDN restates JS behaviour; not normative text —
  agrees with seat CritC2). S102 tier A is bounded to grammar/calendar/offset semantics;
  v2's three-digit uppercase-Z policy is a strict subset of RFC 3339 (§5.6 permits variable
  fractional precision and notes lowercase `t`/`z`). ECMA-262 §21.4.3.2 is the normative
  primary for JS parse behaviour and was not opened this round — leftover lead.
- **F6 — Census delta.** 101 → 103 rows; tiers A 87→88, B 6→7, C 8 unchanged.
- **F7 — Locators re-read, not taken on trust.** `#using_date.parse` exists (h3 id at saved
  line 1759); line 1765 carries the quote, line 1766 the offset-less example, line 1747
  "Other formats are implementation-defined"; RFC §5.6 lines 414–422 and §5.7 lines 496–498
  match the cited productions. Both access stamps/digests are the scouts' receipts; this
  seat did not re-fetch either URL.

## Out of scope (not claimed)

Registry edit, entry authoring, A52/D52 probe runs, `sources-check`/`--strict` runs,
census, receipts, close revisions, README map row, SCORECARD. No executed-evidence upgrade:
every figure above is a read of committed bytes or a scout receipt, not a command result.

## Artifact paths

- `.ufo/waves/round-52/build/ScribeSources/SOURCES-delta.md`
- `.ufo/waves/round-52/w1/ScribeSources.md`

Report: .ufo/waves/round-52/w1/ScribeSources.md

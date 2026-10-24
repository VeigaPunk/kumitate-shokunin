# SOURCES delta — round 52 (S102, S103) — seat ScribeSources

DRAFT ONLY. `corpus/SOURCES.md` was **not** edited by this seat (lane read-only outside
this build dir and `w1/ScribeSources.md`). Both rows are ready to append immediately after
S101 (`corpus/SOURCES.md:114`), inside `## Registry`, matching the 11-column header at
`corpus/SOURCES.md:12`. Written 2026-10-24T04:05:55Z.

Sources of the rows: `build/ScoutRfc3339/sources-row-spec.txt` (owner-supplied enum-compatible
variant) and `build/ScoutCompanion/S103-row.md` (supplied row, unchanged).

## Ready-to-append rows (verbatim, byte-for-byte from the scout files)

```
| S102 | RFC 3339 — Date and Time on the Internet: Timestamps — https://www.rfc-editor.org/rfc/rfc3339.txt | spec | A | grammar + offset rules for fail-closed timestamp validation | §5.6 Internet Date/Time Format, saved text lines 414–422; fetched 2026-10-24T04:03:35Z | A full timestamp requires a UTC designator or signed numeric offset, excluding zone-less wall clocks from this grammar. | mined | 2026-10-24 | 180d | corpus/knowledge/fail-closed-clock-validation.md |
| S103 | MDN Web Docs: Date.parse() — https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse | docs | B | JavaScript Date.parse documentation on offset-less date-time input and non-standard-format portability; secondary guidance, not normative RFC 3339 grammar | § Using Date.parse() (#using_date.parse), saved HTML lines 1765-1766; § Description, line 1747; fetched 2026-10-24T04:03:47Z, HTTP 200, 172329 bytes, body sha256 9c120292f6581b21e361dc5f443dd02653f6fb9d0c0e9be028487897daa0d140 | Date-and-time strings without a timezone use the system-local timezone, unlike date-only ISO input (UTC); other formats are implementation-defined and may vary across browsers. | mined | 2026-10-24 | 180d | corpus/knowledge/fail-closed-clock-validation.md |
```

Both lines carry 12 pipe characters (13 split fields, the frozen `ROW_MALFORMED` shape) and
no cell contains a pipe. Verified by counting `|` in the recorded bytes; no validator run.

## Deviation from the scout proposal (recorded verbatim)

S102 was first proposed with a `kind` outside the frozen enum. Original line, verbatim from
`build/ScoutRfc3339/sources-row.txt`:

```
| S102 | RFC 3339 — Date and Time on the Internet: Timestamps — https://www.rfc-editor.org/rfc/rfc3339.txt | standard | A | grammar + offset rules for fail-closed timestamp validation | §5.6 Internet Date/Time Format, saved text lines 414–422; fetched 2026-10-24T04:03:35Z | A full timestamp requires a UTC designator or signed numeric offset, excluding zone-less wall clocks from this grammar. | mined | 2026-10-24 | 180d | corpus/knowledge/fail-closed-clock-validation.md |
```

`kind` `standard` → `spec`; every other cell identical. Reason: the frozen contract enum is
`{spec, docs, paper, code, tool, dataset, talk, book, community, own-work}`
(`scripts/sources-check.mjs:102-105`); `standard` would emit error `KIND_ENUM` (E05,
`sources-check.mjs:289-291`) and break D52 check E4 (`SOURCES_CHECK: CLEAN`). The source
owner supplied this variant at `build/ScoutRfc3339/sources-row-spec.txt`; the original stays
on disk as the requested encoding. Independently flagged by seat ScoutTierAudit (IRC,
2026-10-24) — same conclusion.

S103 as supplied is unchanged: `kind=docs`, `tier=B`, `status=mined`, `opened=2026-10-24`,
`recheck=180d` are all inside the frozen enums; `tier=B` is honest (MDN restates JavaScript
behaviour; it is not the normative ECMAScript text). Tier B is also what seat CritC2's
source review recommends on 2026-10-24.

## Optional anchor amendment (integrator's call, not applied)

S103's anchor would be stronger with the served page's own modification date next to the
transport date, so a fetch-time stamp is never read as a publication/revision date:

> … saved HTML lines 1765-1766; § Description, line 1747; page self-reports last modified
> 2025-07-10T09:07:55Z (saved HTML line 2011), HTTP Last-Modified 2026-10-24T01:31:18 GMT,
> etag `"10d26b33e7ac709650d165ff09537b4d"`; fetched 2026-10-24T04:03:47Z, HTTP 200,
> 172329 bytes, body sha256 9c120292f6581b21e361dc5f443dd02653f6fb9d0c0e9be028487897daa0d140

The supplied row is not wrong — it labels the fetch stamp as a fetch stamp and pins the
body digest — so the amendment is an improvement, not a defect repair.

## Gate block — draft for `corpus/lessons/round-52.md`

`corpus/lessons/round-52.md` does not exist at 2026-10-24T04:05:55Z (finding F3). Append the
block below when the lesson file is created, at its `## Gate` heading. Shape follows the
round-51 precedent (`corpus/lessons/round-51.md:59-87`).

```markdown
## Gate

Candidates: S102 (rfc-editor.org RFC 3339) and S103 (MDN `Date.parse()`), opened by scout
seats this round and mined for `corpus/knowledge/fail-closed-clock-validation.md`. Rows
before: 101; after: 103 (tiers A 87→88, B 6→7, C 8 unchanged).

- **S102 — ADMITTED, tier A.** URL `https://www.rfc-editor.org/rfc/rfc3339.txt`; opened
  2026-10-24T04:03:35Z (UTC stamps from `date -u` immediately around a
  `curl --location --fail --max-time 120`); HTTP 200; 35,064 bytes; sha256
  `9ab2b8864a85dca73a88f49b0927bc7bc85f596926e4fd1890905777924e700a`; RFC 3339,
  Standards Track, July 2002. Located quote (5 words), §5.6 Internet Date/Time Format,
  saved text line 422: "date-time = full-date "T" full-time" — line 420
  (`full-time = partial-time time-offset`) and lines 414–415
  (`time-offset = "Z" / time-numoffset`) make the offset mandatory in that production.
  Second located fragment (21 words, abridged after `"23"`), §5.7 Restrictions, saved text
  lines 496–498: "Although ISO 8601 permits the hour to be "24", this profile of ISO 8601
  only allows values between "00" and "23"" [elided tail: "for the hour in order to reduce
  confusion"]. Row encoding: `kind` `spec` (the initially requested `standard` is outside
  the frozen enum; `KIND_ENUM` E05). Status `mined`; used-by
  `corpus/knowledge/fail-closed-clock-validation.md`.
- **S103 — ADMITTED, tier B.** URL
  `https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse`;
  opened 2026-10-24T04:03:47Z; HTTP 200; 172,329 bytes; sha256
  `9c120292f6581b21e361dc5f443dd02653f6fb9d0c0e9be028487897daa0d140`; unversioned page —
  HTTP `Last-Modified: Sat, 24 Oct 2026 01:31:18 GMT` (serving layer) and the page's own
  "last modified" 2025-07-10T09:07:55Z (saved HTML line 2011), etag
  `"10d26b33e7ac709650d165ff09537b4d"`. Located quote (14 words), § Using Date.parse()
  (`#using_date.parse`, saved HTML line 1759), saved HTML line 1765: "will be set to
  2019-01-01 at 00:00:00 in the local timezone of the system"; line 1766 supplies the
  offset-less example `Date.parse("2019-01-01T00:00:00")`, lines 1760–1763 the date-only
  UTC contrast, line 1747 "Other formats are implementation-defined". Status `mined`;
  used-by `corpus/knowledge/fail-closed-clock-validation.md`.
- **Withheld claims (recorded, not admitted).** S102 establishes grammar, calendar bounds
  and the mandatory offset; it does NOT establish JavaScript `Date.parse` round-tripping,
  exactly three fractional digits, uppercase-only `Z`/numeric offset, receipt ordering, or
  the ±60,000/+60,073 ms window — the v2 policy is a strict subset of RFC 3339 (§5.6
  permits variable fractional precision and notes lowercase `t`/`z`). S103 is secondary
  documentation of JS behaviour, not normative text; ECMA-262 §21.4.3.2 is the primary and
  was not opened this round (leftover lead).
- **Rejected.** None this round.
- **Spot-check.** Both access stamps are scout-produced; L1/verifier re-opens both URLs and
  compares the recorded sha256 against a fresh fetch.
```

## Downstream status (entry seat closed, 2026-10-24)

- C2 entry draft: `build/ScribeEntry/fail-closed-clock-validation.md`, 20,138 B, sha256
  `dbaed764f234427436052627e485c35f11348393f164bb7c9b24ca5c7f09d672` (re-hashed by this
  seat; `wc -l` = 197 — the entry seat reported 198, a newline-count convention
  difference). Trio on lines 1–3: `source: S102 <url>; S103 <url>`, `verified-at:`, and
  `recheck: 180d`.
- The entry keeps S103 at tier B (`:35`) and states the single-commit ordering (`:161`);
  both agree with the rows above, so no row cell or entry clause needs changing for E3.
- The entry seat reports a D52 E1/E2 replica over `f539a71e`: `E1 True`,
  `clauses=27 bound=19 distinct=18 misses=0`, `E2 True`, `FILL=8`. Those are the peer's
  measurements, not re-run here. E3 is satisfied by these rows by construction (`mined`,
  used-by exactly `corpus/knowledge/fail-closed-clock-validation.md`); E4/E5 stay with L1.
- Outstanding bindings: the 8 `FILL-AT-INTEGRATION-n` receipt digests and committing the
  three scout bodies (`build/ScoutRfc3339/rfc3339.txt`,
  `build/ScoutCompanion/mdn-date-parse.html`, `build/ScoutCompanion/quote.json`), so every
  `receipt:<path>@sha256:<64hex>` resolves at the cited revision.

## Findings and dependencies

- **F1 — `kind` enum collision (resolved, recorded).** `standard` is not in the frozen enum;
  the ready S102 row uses `spec`. Without the swap, integration would emit `KIND_ENUM` E05
  and D52's E4 would not print `SOURCES_CHECK: CLEAN`.
- **F2 — `used-by` target is drafted but not yet in `corpus/knowledge/`.** Both rows name
  `corpus/knowledge/fail-closed-clock-validation.md`, absent from the corpus at
  2026-10-24T04:05:55Z; the C2 entry now exists as a draft at
  `build/ScribeEntry/fail-closed-clock-validation.md` (20,138 B, sha256 `dbaed764…9d672`,
  re-hashed by this seat) for L1 to move. A `mined` row naming an absent path emits error
  `USED_BY_MISSING` (E11, `scripts/sources-check.mjs:317`), and E2 resolves cited bodies
  with `git show <rev>:<path>`, so rows + entry + the three scout bodies must land in one
  integration commit (or entry first). A rows-only commit fails `sources-check` and D52
  E3/E4. The entry itself states the same ordering constraint (`:161`).
- **F3 — `corpus/lessons/round-52.md` is absent**, so the `## Gate` block above is a draft
  for the lesson author/L1, not an append to an existing file.
- **F4 — S103 carries two distinct dates.** HTTP `Last-Modified` (2026-10-24T01:31:18 GMT,
  serving-cache date) and the page's self-reported modification (2025-07-10T09:07:55Z) are
  different facts; only the body sha256 identifies the served revision. The ready row is
  accurate but silent on the page date; the optional amendment above adds it.
- **F5 — Census delta.** 101 → 103 registry rows; tier counts A 87→88, B 6→7, C 8
  unchanged. No row removed, no `used-by` cell rewritten, no rejected row created.
- **F6 — Scope separation (CritC2, 2026-10-24).** S102's tier A is defensible only for
  grammar/calendar/offset semantics; the entry must not attribute JS round-trip or the
  three-digit/uppercase policy to RFC 3339. Recorded as a withheld claim above.
- **F7 — Nothing here is executed counter evidence.** No `scripts/sources-check.mjs`,
  A52/D52 probe, selftest or gate was run by this seat; the row shapes were checked only by
  delimiter count. Q43-class evidence stays with the integration/close seats.

## Provenance ledger (as received, not re-fetched)

| row | effective URL | fetch UTC | HTTP | bytes | sha256 | transport dates | local body |
|---|---|---|---|---|---|---|---|
| S102 | https://www.rfc-editor.org/rfc/rfc3339.txt | 2026-10-24T04:03:35Z | 200 | 35,064 | `9ab2b8864a85dca73a88f49b0927bc7bc85f596926e4fd1890905777924e700a` | none served; header identifies RFC 3339, July 2002 | `build/ScoutRfc3339/rfc3339.txt` |
| S103 | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse | 2026-10-24T04:03:47Z | 200 | 172,329 | `9c120292f6581b21e361dc5f443dd02653f6fb9d0c0e9be028487897daa0d140` | Last-Modified 2026-10-24T01:31:18Z; page-modified 2025-07-10T09:07:55Z; etag `10d26b33e7ac709650d165ff09537b4d` | `build/ScoutCompanion/mdn-date-parse.html` |

Receipts on disk: `build/ScoutRfc3339/fetch.txt`, `build/ScoutCompanion/fetch.json`,
`build/ScoutCompanion/response-headers.txt`, `build/ScoutCompanion/quote.json`.

## Limits

- Access times and digests are the scouts' receipts; this seat did not re-fetch either URL
  (a re-open is the verifier's spot-check, not a scribe's).
- Locators (`line 422`, `lines 496–498`, `line 1765`) were re-read against the saved bodies
  by this seat; the quotes themselves were matched in those files.
- Admission, registry editing, entry authoring, probe runs and close receipts are outside
  this seat's scope.

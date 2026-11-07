# Round 96 — draft SOURCES row (S275)

Next free id: **S275** — the registry's last filed row is S274 (line 229) and the file holds 212
`^| S[0-9]` rows in 371 lines at lane HEAD `f5873bff899d2ac271e05fde90252a19660bd664`;
`corpus/SOURCES.md` is byte-identical at the round-96 freeze `617e80cd…` (`git diff --quiet` rc=0),
and `grep -n 'commonmark'` / `grep -n 'spec.commonmark.org'` / `grep -n '^| S275 '` each printed
nothing — no prior row on this source and the id is free (receipt: `provenance.txt`).

Row (one line, 13 awk fields, no `|` inside any cell):

| S275 | CommonMark spec 0.31.2 — https://spec.commonmark.org/0.31.2/ | spec | A | the ATX heading and fenced-code syntax the census `##` section rule mirrors and departs from: what a heading is, what is literal inside a fence, and which parts of a heading line the census keeps in the text | § 4.2 ATX headings: opening-sequence sentence (HTML body byte 62770, rendered text lines 7-8), closing-sequence sentence (byte 62879, lines 8-9), indentation sentence (byte 63008, lines 10-11); § 4.5 Fenced code blocks: literal-content sentence (byte 106385, rendered text lines 34-35); § 2.1 line-ending definition (byte 19038) as supporting locator, 27 words so not the row quote; fetched 2026-11-07, HTTP 200, Last-Modified Sun, 01 Jun 2025 18:05:05 GMT, body sha256 c85f56cc2101f761cc94215c677cd2c7c1ecca9c47be016479fdfe718af60f0d | Census/gate agree with CommonMark on two clauses (an opening `##` must be followed by spaces or tabs, and up to three spaces may precede it) and deliberately differ elsewhere: the closing `#` sequence is content to the census, a `## ` line inside a fenced block is a heading, and a trailing `\r` is not stripped, so the gate follows the census rather than CommonMark | mined | 2026-11-07 | on-release | corpus/knowledge/round-gate-registry-section.md |

Field note: `anchor` carries the located quotes' byte offsets and rendered-text lines plus the fetch
provenance; `teaches` names the two agreements and the three deliberate departures; `recheck` is
symbolic (`on-release`, the spec's own release cadence); `used-by` is the knowledge entry this round
creates. Status `mined`: the page was opened and quoted first-hand this round.

Why it is not a duplicate: no row in `corpus/SOURCES.md` names `spec.commonmark.org`; S273 is the GFM
tables extension of a different spec page (different URL, different scope), so E04/W04 cannot fire.

## Optional companion line for `## Search log` (not part of the row)

Not drafted as an edit here — the assignment is one row — but the section's house style takes one
entry per opened locator:

> **CommonMark spec locator — query:** none; the URL was the round-96 plan's own named locator;
> where: direct HTTPS fetch of `https://spec.commonmark.org/0.31.2/`, 2026-11-07; identified 1,
> screened 1, opened 1, included 1 (S275), excluded 0. Reason for no search: the plan names the
> versioned page, so a search could only return mirrors or other versions. Stop: §4.2 and §4.5
> carry the heading and fence rules the census section test follows, and the page states all three
> departures the gate keeps.


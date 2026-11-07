# Quotes — CommonMark spec 0.31.2 (row S275, round 96)

## Fetch provenance

- URL: `https://spec.commonmark.org/0.31.2/`
- Command: `curl -sS -D headers.txt -o spec.html -w 'HTTP=%{http_code} size=%{size_download}\n' https://spec.commonmark.org/0.31.2/`
- Access date: **2026-11-07** (server `date: Sat, 07 Nov 2026 01:35:09 GMT`)
- HTTP status: **200**; `size_download=514698`
- Response headers recorded in `captures/headers.txt`: `last-modified: Sun, 01 Jun 2025 18:05:05 GMT`,
  `etag: "683c9651-7da8a"`, `content-type: text/html; charset=utf-8`, `content-length: 514698`,
  `x-cache: HIT`, `x-proxy-cache: MISS`
- Body capture: `captures/spec-0.31.2.html` (514698 bytes),
  sha256 **c85f56cc2101f761cc94215c677cd2c7c1ecca9c47be016479fdfe718af60f0d**
  (`sha256sum captures/spec-0.31.2.html`)

## Rendering method (why a byte offset and a rendered line both appear)

The page is a single HTML file. Two derived plain-text renderings are kept as receipts:

- `captures/spec-atx.txt` — §4.2 only, `<pre>` example blocks replaced by `<<<CODE EXAMPLE>>>`,
  tags stripped, entities unescaped, blank lines dropped (94 lines).
- `captures/spec-fenced.txt` — §4.5 only, same treatment (156 lines).

Section byte spans in the body: §4.2 `id="atx-headings"` at byte 62381 → §4.3 `id="setext-headings"`
at 75480; §4.5 `id="fenced-code-blocks"` at 104105 → 123599.

Inline code matters: in the raw body the hash appears as `<code>#</code>`, and the paragraph text
carries source newlines. Each quote below is the **rendered** text — tags removed, entities
unescaped, whitespace collapsed to single spaces — which is what a reader of the page sees. The
byte offset is the start of the quote's first word in the raw body, so the pairing is checkable in
both directions.

Exactness receipt: `verify-quotes.txt` — each of the four quotes is found **exactly once** in the
rendered whole-document text (`<pre>` blocks excluded) and the script prints
`ALL_FOUR_QUOTES_UNIQUE_AND_EXACT`. Word counts receipt: `wc-quotes.txt`.

## Q1 — §4.2 ATX headings, opening-sequence sentence (the row's quote)

> The opening sequence of # characters must be followed by spaces or tabs, or by the end of line.

- Location: §4.2 ATX headings, paragraph after Example 61; raw body byte **62770**;
  rendered text `captures/spec-atx.txt` **lines 7-8**
- `printf '%s' "<Q1>" | wc -w` → **19** (≤ 25)
- Grounds the census/gate agreement: `sources-census.sh` `row_pass` matches `^ {0,3}##[ \t]`, i.e. a
  `##` followed by a space or tab.

## Q2 — §4.2 ATX headings, closing-sequence sentence

> The optional closing sequence of #s must be preceded by spaces or tabs and may be followed by spaces or tabs only.

- Location: §4.2, same paragraph; raw body byte **62879**; rendered text lines **8-9**
- `printf '%s' "<Q2>" | wc -w` → **22**
- Grounds the first deliberate departure: for CommonMark the closing `#`s are a delimiter, not content;
  the census strips only leading 0-3 spaces and surrounding space/tab from `substr(line,3)`, so
  `## Registry ##` reads as `Registry ##` and is therefore **not** `Registry`.

## Q3 — §4.2 ATX headings, indentation sentence

> The opening # character may be preceded by up to three spaces of indentation.

- Location: §4.2, same paragraph; raw body byte **63008**; rendered text lines **10-11**
- `printf '%s' "<Q3>" | wc -w` → **14**
- Grounds the second agreement: 0-3 leading spaces (`^ {0,3}`), and by exclusion the 4-space
  `    ## ` line that both census and gate must read as ordinary text / indented code.

## Q4 — §4.5 Fenced code blocks, literal-content sentence

> The content of a code fence is treated as literal text, not parsed as inlines.

- Location: §4.5 Fenced code blocks, paragraph after Example 118; raw body byte **106385**;
  rendered text `captures/spec-fenced.txt` **lines 34-35**
- `printf '%s' "<Q4>" | wc -w` → **15**
- Grounds the second deliberate departure: to CommonMark a `## ` line inside a fence is not a heading,
  while the census's line-oriented `row_pass` sees it as one; the gate follows the census.

## Q5 — §2.1 Preliminaries, line-ending definition (supporting locator, NOT the row quote)

> A line ending is a line feed (U+000A), a carriage return (U+000D) not followed by a line feed, or a carriage return and a following line feed.

- Location: §2.1 Preliminaries, the `line ending` definition paragraph; raw body byte **19038**
  (the sentence opens with `<a id="line-ending" ...>line ending</a>`)
- `printf '%s' "<Q5>" | wc -w` → **27** — over the 25-word cap for the row's quote, so it is cited
  here and named in the row's `anchor` cell only as a supporting locator.
- Grounds the third deliberate departure: a CRLF is a line ending, so CommonMark reads `## Registry` +
  CRLF as the heading `Registry`; the census strips only `[ \t]`, keeps the `\r`, and therefore does
  **not** see `Registry`. The gate follows the census (`ctl-crlftrim` in the round-96 controls).

## Locator context, not quotes (non-unique strings)

- `Up to three spaces of indentation are allowed:` — §4.2 rendered line **44**, first raw body byte
  53185; the string occurs **2×** in the page (the spec re-prints example lead-ins in its
  example accordions), so it is cited by line, not as a quote. `wc -w` → 8.
- `Four spaces of indentation is too many:` — §4.2 rendered line **48**, first raw body byte 53870;
  **7×** in the page for the same reason. `wc -w` → 7.

## Claim not made

No quote is attributed to this page for the census's *field-count* rule (13 awk fields) or for the
`##`-versus-`###` restriction: the spec allows 1-6 opening `#` characters, while `row_pass` matches
only `##`, and that difference lives in the census code and in the round-96 plan, not in a sentence
of this page. The `\r` departure is grounded in Q5 above.

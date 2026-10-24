# ScoutReopenS100 — non-author re-open of S100

Seat: ScoutReopenS100 (`kumitate-r51.InterestingAmphibian`). Independent leaf. Read-only except this report. No packages installed.

**Verdict: AGREE** on the two assigned predicates (body sha256; 22-word quote at the claimed location).

Axes: (1) fresh-fetch hash vs the S100 row body sha256 vs the saved HTML; (2) the lesson's 22-word quote as a verbatim substring of the claimed lines.

## Attacked

- `corpus/SOURCES.md` row S100 (line 113), body sha256 `7d7948bcf8400a786c2795b24e8da979d6e01610f7b8ea6bf1ab97f06205fb69`, anchor "DESCRIPTION, CLOCK_MONOTONIC paragraph, saved HTML lines 177-184".
- `corpus/lessons/round-51.md` § Gate lines 60–65: the 22-word quote, claimed at saved HTML lines 177–179.
- Saved bytes: `.ufo/waves/round-51/build/ScoutClockSource/clock-gettime.html` (the wave-1 scout path). Lane-root `build/ScoutClockSource/clock-gettime.html` is **absent** (`ls` → No such file). That path is a dependency note, not a hash miss: the only copy on disk is the wave-1 path above, and it matches.

## Command + output (2026-10-24T02:43:57Z)

```
date -u
# Sat 24 Oct 2026 02:43:57 AM UTC

curl -fsSL -D /tmp/s100-headers.txt -o /tmp/clock_gettime.2.html \
  -w 'http_code=%{http_code} size=%{size_download} url=%{url_effective}\n' \
  'https://man7.org/linux/man-pages/man2/clock_gettime.2.html'
# http_code=200 size=30379 url=https://man7.org/linux/man-pages/man2/clock_gettime.2.html

sha256sum /tmp/clock_gettime.2.html
# 7d7948bcf8400a786c2795b24e8da979d6e01610f7b8ea6bf1ab97f06205fb69  /tmp/clock_gettime.2.html
# wc -c → 30379

sha256sum .ufo/waves/round-51/build/ScoutClockSource/clock-gettime.html
# 7d7948bcf8400a786c2795b24e8da979d6e01610f7b8ea6bf1ab97f06205fb69
# wc -c → 30379

cmp -s /tmp/clock_gettime.2.html \
  .ufo/waves/round-51/build/ScoutClockSource/clock-gettime.html
# CMP_IDENTICAL
```

Response headers (this fetch): `HTTP/1.1 200 OK`; `Date: Sat, 24 Oct 2026 02:43:58 GMT`; `Last-Modified: Thu, 08 Oct 2026 17:39:35 GMT`; `ETag: "76ab-65d57b70ec3c0"`; `Content-Length: 30379`; `Content-Type: text/html`. Last-Modified and ETag match the wave-1 scout record; only `Date` moved (01:59:32 GMT → 02:43:58 GMT). Body bytes did not.

Python over the fresh bytes (`hashlib.sha256`, 601 lines): `fresh_eq_claimed True`, `saved_eq_claimed True`, `fresh_eq_saved True`.

## Quote

Lesson text (22 words by `str.split()`, counted 22):

> The CLOCK_MONOTONIC clock is not affected by discontinuous jumps in the system time (e.g., if the system administrator manually changes the clock)

Fresh HTML, DESCRIPTION, `CLOCK_MONOTONIC` paragraph (1-indexed; identical in the saved file):

```
L177: '              The <b>CLOCK_MONOTONIC </b>clock is not affected by discontinuous'
L178: '              jumps in the system time (e.g., if the system administrator'
L179: '              manually changes the clock), but is affected by frequency'
L180: '              adjustments.  This clock does not count time that the'
L181: '              system is suspended.  All <b>CLOCK_MONOTONIC </b>variants'
L182: '              guarantee that the time returned by consecutive calls will'
L183: '              not go backwards, but successive calls may—depending on the'
L184: '              architecture—return identical (not-increased) time values.'
```

- Raw file: `text.count(quote) == 0`. Not a contiguous byte substring. Cause is the disclosed `<b>` wrapper on line 177 (`<b>CLOCK_MONOTONIC </b>`, space inside the tags) plus newline indent. Same finding the opening scout recorded.
- Tag-strip + whitespace join of lines 177–179 **startswith** the quote. Remainder is exactly `, but is affected by frequency`. Occurrence in the whole tag-stripped page: **1**.
- Claimed location in the lesson and in `w1/ScoutClockSource.md`: lines **177–179**. Holds.
- S100 anchor cell says lines **177–184**. That range is the whole paragraph, not the 22-word quote. The quote is a prefix of the tag-stripped paragraph (`quote_in_177_184 True`); it ends on line 179, before `, but is affected by frequency`. The wider range matches the `teaches` cell (frequency adjustments; consecutive calls do not go backwards), which is supported by those same lines. Not a false locator.

## Residuals (do not flip AGREE)

- `opened` cell is `2026-10-23`; the row's own anchor and the lesson record the fetch instant `2026-10-24T01:59:31Z`. Local `-03` was still the 23rd at fetch (wave-1 scout). Not re-judged here; hash and quote are independent of it.
- `teaches` is a paraphrase ("ignores discontinuous system-time steps"), not the 22-word quote. The page sentence it rests on is the quote above, plus "but is affected by frequency adjustments" (lines 179–180). Page does not say NTP-immune; `CLOCK_MONOTONIC_RAW` (lines 192–195) is the no-frequency-adjustment clock. The lesson already withholds NTP immunity (round-51.md:73–74).

## Confidence

High on hash identity and on the quote's text and line span. The only absent artifact is lane-root `build/ScoutClockSource/clock-gettime.html`; the wave-1 saved file was present and byte-identical.

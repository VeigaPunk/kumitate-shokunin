# K90ScribeSources gate — round-90 SOURCES rows S260–S262

Access: all three fetched 2026-11-05 at 10:00Z (`curl -sSL`, HTTP 200) and read live
through `read` the same session. Each capture is stored in this seat directory, hashed
with `sha256sum`. Quote word count = whitespace-separated tokens of the quote as shown.
Verbatim check: each quote was matched with `grep -c -F` (count 1) after stripping
HTML tags and collapsing whitespace, or against the plain-text file directly.

## S260 — UAX #44 Unicode Character Database (Cf format characters)
- URL: https://www.unicode.org/reports/tr44/ (Unicode 18.0.0, revision 38, dated 2026-09-02)
- Access date: 2026-11-05 (10:00Z)
- Capture: `.ufo/waves/round-90/K90ScribeSources/unicode-tr44.html`
- sha256: `d951c7cf4f697c238e7a96ab891cf27fdf0b1d94454aa0071a9d5b0d3a0e1ab4` (293585 bytes)
- Location: § 2.3.1 "Changes to Properties Between Releases" (capture line 376 heading; sentence at capture line 405)
- Quote: "U+200B ZERO WIDTH SPACE was originally classified as a space character (General_Category=Zs), but it was reclassified as a Format character (General_Category=Cf)"
- Word count: 21 (limit 25)
- Verified: `grep -c -F` on the tag-stripped, whitespace-collapsed capture = 1.
- Scope limit: this sentence grounds U+200B only. The same paragraph does not quote U+200C, U+200D, U+200E or U+FEFF. See "Gaps" below.

## S261 — UCD PropList.txt (U+00A0 White_Space)
- URL: https://www.unicode.org/Public/UCD/latest/ucd/PropList.txt (PropList-18.0.0.txt, dated 2026-08-07)
- Access date: 2026-11-05 (10:00Z)
- Capture: `.ufo/waves/round-90/K90ScribeSources/unicode-proplist.txt`
- sha256: `f438f532e8737bb8a2702126cdf9c4af5e357c58c7acf9d9eb2fc7c1a1d955d6` (149040 bytes)
- Location: capture line 15
- Quote: "00A0 ; White_Space # Zs NO-BREAK SPACE" (the file's column padding collapsed to single spaces; the raw line is `00A0          ; White_Space # Zs       NO-BREAK SPACE`)
- Word count: 7 (limit 25)
- Verified: `grep -n -E '^00A0' unicode-proplist.txt` returns line 15.
- Additional verified lines in the same file, not used as row quotes (for the L1 if it cites them): line 29 `200E..200F ; Bidi_Control # Cf [2] LEFT-TO-RIGHT MARK..RIGHT-TO-LEFT MARK`; line 37 `200C..200D ; Join_Control # Cf [2] ZERO WIDTH NON-JOINER..ZERO WIDTH JOINER`.

## S262 — realpath(3), Linux man-pages 6.19 (containment on resolved paths)
- URL: https://man7.org/linux/man-pages/man3/realpath.3.html
- Access date: 2026-11-05 (10:00Z)
- Capture: `.ufo/waves/round-90/K90ScribeSources/man7-realpath3.html`
- sha256: `dd2bfafe9ca9e6fffa92b24a78451175ab48f0e6a741476fe351a2dcc11dd702` (14747 bytes)
- Location: § DESCRIPTION, capture line 90 (the sentence wraps to line 91; the `<b>` tags wrap `realpath`)
- Quote: "realpath() expands all symbolic links and resolves references to /./, /../ and extra '/' characters"
- Word count: 15 (limit 25)
- Verified: `grep -c -F` on the tag-stripped, whitespace-collapsed capture = 1.

## Rejected candidates opened
None. The three sources above were the only pages opened for this seat. No candidate was opened and rejected, so there are no REJECTED rows to add. (S258 and S255 already cover the BOM and proc-root topics; they were not reopened.)

## Gaps
- U+FEFF ZERO WIDTH NO-BREAK SPACE: its `Cf` category is not quoted by any of the three captures. The UCD `UnicodeData.txt` file would carry the per-character line; it was not opened here (the seat was limited to three sources). The L1 must open that file before it cites U+FEFF as Cf.
- U+200C/U+200D/U+200E as Cf: covered by the PropList lines 29 and 37 above (Bidi_Control and Join_Control entries carry `Cf`), not by a row quote.
- The rows cover invisible-format-character membership and whitespace-property membership only. They do not show that v3 mishandles these prefixes; that is the instrument evidence, not a source claim.

## Status rationale
- S260 and S261 are `mined` because `used-by` names `corpus/knowledge/receipt-invisible-prefix-fields.md`, which the L1 is to write.
- S262 is `queued` with `used-by` `—`, because no knowledge path is named for it yet.
- All rows: `opened` 2026-11-05 (from `date +%F`), `recheck` 90d.

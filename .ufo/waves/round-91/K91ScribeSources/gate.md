# K91ScribeSources — round-91 source gate (URL, access date, quote, capture path, sha256 per row).

Every source below was fetched by this seat on **2026-11-05** with
`curl -sS -L --max-time 90 -A 'Mozilla/5.0 (X11; Linux x86_64) kumitate-source-fetch'`
(HTTP 200, no redirect for any of the three) into this seat directory. The L1 re-fetched the same
three URLs into `.ufo/waves/round-91/close-l1/sources/`; the sha256 values are identical, so both
copies are the same bytes.

Two surfaces exist per capture, both derived only from the fetched bytes by `flatten.py` (this seat
dir, committed):

- `<name>.html` — the fetched bytes, unmodified.
- `<name>.flat.txt` — tags stripped, character references unescaped, all whitespace collapsed to
  single spaces, one line per document.
- `<name>.lines.txt` — one record per source line, `<lineno>\t<text>`, so a source line number is
  resolvable.

A quote that wraps a source line or spans an inline tag is byte-present in the `.flat.txt` surface
and absent from the raw `.html`; `quote-checks.txt` prints both counts for every quote. The L1's
rendered-text surfaces (`.ufo/waves/round-91/close-l1/sources/*.txt`) keep the source line breaks,
so a quote that wraps two source lines appears there as two lines; `quote-locations.txt` names the
line where each wrapped quote starts.

**How a non-author verifier re-opens a published quote (measured, not assumed).** The three
quotes that wrap a source line are NOT contiguous in either the raw `.html` or the L1's per-line
`.txt`; they ARE contiguous in the whitespace-collapsed surface. So:

    # quote that wraps a source line (S263, S264 ×2) — grep the collapsed surface
    grep -c -F "opening for read-only succeeds even if no one has opened on the write side yet" \
      .ufo/waves/round-91/K91ScribeSources/fifo.7.flat.txt     # → 1
    grep -c -F "Neither the open() nor any subsequent I/O operations on the file descriptor which is returned will cause the calling process to wait." \
      .ufo/waves/round-91/K91ScribeSources/open.2.flat.txt     # → 1

    # quotes that sit on one source line (S265 ×2) — grep any of the three surfaces
    grep -c -F "Retrieves the <fs.Stats> for the file descriptor." \
      .ufo/waves/round-91/close-l1/sources/fs.txt              # → 1
    grep -c -F "Flag indicating to open the file in nonblocking mode when possible." \
      .ufo/waves/round-91/close-l1/sources/fs.html             # → 1

This is the lane's existing shape, not a defect introduced this round: the precedent row S220
publishes "The exit code of the subprocess, or null if the subprocess terminated due to a signal",
which also wraps and is `grep -F`-absent (0) from its own pinned raw capture
`.ufo/waves/round-71/close/captures/node-child-process.html`. What the round-90 spot-check routed for
S260 was a different defect — a quote whose *words* were a condensation rather than the source's
wording — and that one is corrected. The wrapper is disclosed here so a verifier greps the surface
that holds the quote rather than concluding the quote is missing.

## S263 — fifo(7), Linux man-pages 6.19

- URL: https://man7.org/linux/man-pages/man7/fifo.7.html
- Access date: 2026-11-05
- Capture path (this seat): `.ufo/waves/round-91/K91ScribeSources/fifo.7.html`
- Capture path (L1, pinned): `.ufo/waves/round-91/close-l1/sources/fifo.7.html`
- sha256: `9c9bbe3240e79d086dc46cfb546dcedadb9a9ba56408994131e6482fa500749f` (9248 bytes; identical in
  both paths)
- Location: § DESCRIPTION, the nonblocking-open paragraph; rendered text line 88 of
  `close-l1/sources/fifo.7.txt` = raw source lines 87–89 of `fifo.7.html`; flat-surface line 23 of
  `fifo.7.flat.txt`
- Quote: "opening for read-only succeeds even if no one has opened on the write side yet"
- Word count: 15 (limit 25)
- Verified: `grep -c -F` on `fifo.7.flat.txt` = 1 (raw `fifo.7.html` = 0, the sentence wraps lines
  88–89; `fifo.7.lines.txt` record 88 carries the first half, 89 the second).
- Second located sentence from the same page, byte-verified, published in `corrections.md` context:
  "Normally, opening the FIFO blocks until the other end is opened also." (12 words, raw lines
  84–85, flat-surface line 21, flat hits = 1).

## S264 — open(2), Linux man-pages 6.19

- URL: https://man7.org/linux/man-pages/man2/open.2.html
- Access date: 2026-11-05
- Capture path (this seat): `.ufo/waves/round-91/K91ScribeSources/open.2.html`
- Capture path (L1, pinned): `.ufo/waves/round-91/close-l1/sources/open.2.html`
- sha256: `d665489cadb85624d98fae03a8d8d06209030f32735cff8aeba949ad8491c789` (76506 bytes; identical in
  both paths)
- Location: § DESCRIPTION, the O_NONBLOCK and O_NOFOLLOW entries; rendered text lines 349 and 366 of
  `close-l1/sources/open.2.txt` = raw source lines 349–350 (O_NOFOLLOW) and 364–368 (O_NONBLOCK) of
  `open.2.html`; flat-surface lines 227 and 240–241 of `open.2.flat.txt`
- Quote (O_NONBLOCK): "Neither the open() nor any subsequent I/O operations on the file descriptor
  which is returned will cause the calling process to wait."
- Word count: 22 (limit 25)
- Verified: `grep -c -F` on `open.2.flat.txt` = 1 (raw `open.2.html` = 0, the sentence wraps lines
  366–368 and the raw bytes carry `<b>open</b>()` markup).
- Second located sentence from the same page, byte-verified:
  "If the trailing component (i.e., basename) of path is a symbolic link, then the open fails, with
  the error ELOOP." (20 words, raw lines 349–350, flat-surface line 229, flat hits = 1; raw bytes
  carry `<i>path</i>` markup).

## S265 — Node.js v24 fs API (docs v24.22.2)

- URL: https://nodejs.org/docs/latest-v24.x/api/fs.html
- Access date: 2026-11-05 (page header reads "Node.js v24.22.2"; the URL is the moving
  `latest-v24.x` alias, so the anchor names the served version)
- Capture path (this seat): `.ufo/waves/round-91/K91ScribeSources/fs.html`
- Capture path (L1, pinned): `.ufo/waves/round-91/close-l1/sources/fs.html`
- sha256: `c175e0e7340f0bfb686077581e885504890780f20e7206de0cba5e3cc5c29d50` (774165 bytes; identical
  in both paths)
- Location: § fs.fstatSync(fd), § fs.openSync, § File open constants; rendered text lines 6729 and
  9080 of `close-l1/sources/fs.txt` = raw source lines 6729 and 9079–9080 of `fs.html`; flat-surface
  lines 5005 and 6518 of `fs.flat.txt`
- Quote (fstatSync): "Retrieves the <fs.Stats> for the file descriptor."
- Word count: 7 (limit 25)
- Verified: `grep -c -F` on `fs.flat.txt` = 1 (raw `fs.html` = 0, the raw bytes carry
  `&#x3C;fs.Stats>` markup).
- Second located sentence from the same page, byte-verified and raw-present:
  "Flag indicating to open the file in nonblocking mode when possible." (11 words, raw line 9080, flat
  line 6518, flat hits = 1, raw hits = 1).
- Third, byte-verified, raw-present, same page: "Returns an integer representing the file
  descriptor." (7 words, raw line 7066, flat line 5382, flat hits = 1, raw hits = 1) — the fs.openSync
  return value the scope names.
- Fourth, byte-verified, same page: "The path parameter can be a file descriptor now." (10 words,
  raw line 7118, flat line 5270, flat hits = 1; the same sentence also occurs at raw line 5138 for
  `fs.readFile`, so the anchor's § name disambiguates it).

## Corrections re-opened this round (same fetches, same bytes)

- S260 — UAX #44 capture: `.ufo/waves/round-90/K90ScribeSources/unicode-tr44.html`,
  sha256 `d951c7cf4f697c238e7a96ab891cf27fdf0b1d94454aa0071a9d5b0d3a0e1ab4` (293585 bytes). This seat
  re-fetched https://www.unicode.org/reports/tr44/ on 2026-11-05 and got the **same** sha256
  (`d951c7cf…`), so the committed round-90 capture is still the live document. Quote
  "U+200B ZERO WIDTH SPACE was originally classified as a space character (General_Category=Zs), but
  it was reclassified as a Format character (General_Category=Cf)" — 21 words, raw lines 403–405, flat
  hits = 1, raw hits = 0 (line-wrapped).
- S255 — proc_pid_root(5) capture: `.ufo/waves/round-89/open/proc-root.html`, sha256
  `1a71736f5c84b7a9846502b541e0c25ebe8e0efee2b8638a002ef37626c251ac` (9073 bytes). This seat
  re-fetched https://man7.org/linux/man-pages/man5/proc_pid_root.5.html on 2026-11-05 and got the
  **same** sha256 (`1a71736f…`). Quote "a symbolic link that points to the process's root
  directory, and behaves in the same way as exe, and fd/*" — 20 words, raw lines 75–76, flat hits = 1,
  raw hits = 0 (the raw bytes carry `<i>exe</i>` / `<i>fd/*</i>` markup). The sentence opens on raw
  line 75 (line 70 closes the NAME block's `<pre>`).

## Rejected candidates / gaps

None rejected: the seat was scoped to exactly the three documents the plan names, and all three
were opened and quoted. Facts deliberately NOT claimed by these rows: `open(2)`'s O_PATH and the
`O_NOFOLLOW` "earlier components are still followed" caveat (raw lines 351–352) — the rows claim only
what their quotes say; `fifo(7)`'s ENXIO write-only case (raw lines 89–91) is not quoted because the
v5 read path is read-only; the `fs.readFileSync` "will not be closed automatically" note
(raw lines 3486–3487) is not quoted because it concerns `fs.writeFile`.

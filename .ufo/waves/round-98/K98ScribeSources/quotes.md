# S277 — POSIX Base Definitions, ch. 7 Locale: capture and quotes

Draft row: `row.md` (this seat). Cross-reference code lines: `cross-reference-lines.txt`.

## Fetch

- URL: `https://pubs.opengroup.org/onlinepubs/9799919799/basedefs/V1_chap07.html`
- Command (scratch dir `/fast/scratch/hyaku/kumitate-r98/K98ScribeSources/curl`):
  `curl -sS -D headers.txt -o posix-ch07.html -w 'HTTP %{http_code}\n' '<URL>'`
- Access date: 2026-11-07 (response `Date: Sat, 07 Nov 2026 03:55:20 GMT`)
- HTTP status: `HTTP/1.1 200 OK`
- Response headers: `Server: Apache`, `Content-Length: 169700`, `Content-Type: text/html; charset=UTF-8`
- Body sha256: `a5c9d6e5a971aaa47e900cbd62e6bcf9a8c8c74384242319d954095d90ef995e`
- Body size: 169700 bytes, 5217 lines
- Capture kept in this seat dir: `posix-ch07.html` (169700 bytes), `curl-headers.txt`
- L1 comparison: `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-98/close-l1/l1-open-posix-ch07.html`
  also sha256 `a5c9d6e5a971aaa47e900cbd62e6bcf9a8c8c74384242319d954095d90ef995e`; `cmp -s` -> identical
  (L1 fetch `Date: Sat, 07 Nov 2026 03:45:05 GMT`, this fetch `03:55:20 GMT`: same bytes ten minutes apart).

## Section anchors (line numbers are lines of the capture above)

- ch. 7 Locale, `<h2>` at line 29 (`tag_07`)
- 7.3 Locale Definition, line 115 (`tag_07_03`)
- **7.3.1 LC_CTYPE, line 228 (`tag_07_03_01`)** — both keyword definitions below sit in this
  section; the next heading is 7.3.1.1 at line 906.

## Q1 — `blank` (the quote the row carries)

Raw HTML, lines 352-354:

```
<dt><b>blank</b></dt>
<dd>Define characters to be classified as &lt;blank&gt; characters.
<p>In the POSIX locale, only the &lt;space&gt; and &lt;tab&gt; shall be included.</p>
```

Quote after tag strip, entity decode (`&lt;`/`&gt;` -> `<`/`>`), whitespace collapse:

> In the POSIX locale, only the <space> and <tab> shall be included.

Word count:

```
$ printf '%s' 'In the POSIX locale, only the <space> and <tab> shall be included.' | wc -w
12
```

Location: § 7.3.1 LC_CTYPE, `blank` keyword definition, HTML line 354 (sentence);
`<dt>` keyword line 352.

## Q2 — `space` (the contrast; not carried verbatim in the row)

Raw HTML, lines 300-303 (sentence wraps over 302-303):

```
<dt><b>space</b></dt>
<dd>Define characters to be classified as white-space characters.
<p>In the POSIX locale, exactly &lt;space&gt;, &lt;form-feed&gt;, &lt;newline&gt;, &lt;carriage-return&gt;, &lt;tab&gt;, and
&lt;vertical-tab&gt; shall be included.</p>
```

Quote after tag strip, entity decode, whitespace collapse (line break -> one space):

> In the POSIX locale, exactly <space>, <form-feed>, <newline>, <carriage-return>, <tab>, and <vertical-tab> shall be included.

Word count:

```
$ printf '%s' 'In the POSIX locale, exactly <space>, <form-feed>, <newline>, <carriage-return>, <tab>, and <vertical-tab> shall be included.' | wc -w
15
```

Location: § 7.3.1 LC_CTYPE, `space` keyword definition, HTML lines 302-303;
`<dt>` keyword line 300.

## What the row claims, and the lines it cites

- The census id-cell pad class `[ \t]`: fleet `scripts/sources-census.sh` line 619
  (`$0 ~ /^\|[ \t]*S[0-9]{3,}[ \t]*\|/` for rows outside the Registry) and line 581
  (`function trim(s) { gsub(/^[ \t]+|[ \t]+$/,"",s); return s }`, used for `$2` at line 640) —
  see `cross-reference-lines.txt`.
- The gate's wider reader: lane `scripts/round-gate.mjs` line 410
  (`const SOURCES_ROW_RE = /^ {0,3}\|\s*S\d{3,}\s*\|/;`) — same file.
- ECMAScript `\s` wideness: S276 (registry row, `corpus/SOURCES.md`).

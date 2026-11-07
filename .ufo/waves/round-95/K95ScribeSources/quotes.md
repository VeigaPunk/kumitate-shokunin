# Quotes — K95ScribeSources (round 95, hyaku run 15)

Access date for every source below: **2026-11-07** (host UTC clock at fetch time
2026-11-07T00:37Z; local `date -I` still read 2026-11-06, so the census default
`date -u +%F` = 2026-11-07 and `opened` is not future-dated).

Bodies are stored under `sources/`; their digests are in `sha256.txt`. Fetch commands
and their verbatim `-w` stdout are in `fetch.log`. Every quote is the rendered text of
the body: HTML tags stripped, entity-unescaped, and the source's hard line wrapping
joined with a single space. Nothing else was changed; GFM apostrophes are U+2019 as in
the body.

## (a) S273 — GitHub Flavored Markdown spec, § 4.10 Tables (extension)

- URL: https://github.github.com/gfm/#tables-extension-
- HTTP status: 200 (body 508310 bytes)
- body: sources/gfm-tables.html
- sha256: b153d814fdfc8624bb6da7449162c1cd707a637f7d1c1b636eb44b9cf63fa220

### Quote 1 — a pipe can be put in a cell by escaping it (15 words)

> Include a pipe in a cell’s content by escaping it, including inside other inline spans:

Location: § 4.10 Tables (extension), sentence immediately before Example 200
(`|\|oo |` / `` | b `\|` az | `` / `| b **\|** im |`); raw body line 4575, raw byte
offset 161661.

```
$ printf '%s' "Include a pipe in a cell’s content by escaping it, including inside other inline spans:" | wc -w
15
```

### Quote 2 — delimiting pipes are recommended, not required (18 words)

> A leading and trailing pipe is also recommended for clarity of reading, and if there’s otherwise parsing ambiguity.

Location: § 4.10 Tables (extension), first sentence of the paragraph following
Example 198; the same section's Example 199 preface states "use of leading and trailing
pipes may be inconsistent". Raw body line 4510, raw byte offset 159140.

```
$ printf '%s' "A leading and trailing pipe is also recommended for clarity of reading, and if there’s otherwise parsing ambiguity." | wc -w
18
```

Consequence for the lane (context, not a quote): GFM makes row width depend on content
(an escaped pipe stays a cell character; the outer pipes may be omitted), so the census
shape `NF==13` — exactly 11 cells plus one leading and one trailing delimiter — is a
lane contract, stricter than GFM, and the round-gate must not infer GFM tolerance.

## (b) S274 — POSIX awk, The Open Group Base Specifications Issue 8

- URL: https://pubs.opengroup.org/onlinepubs/9799919799/utilities/awk.html
- HTTP status: 200 (body 144111 bytes)
- body: sources/posix-awk.html
- sha256: 6df7d0776af4b28dbc3ec667a02a18e51ccd5066ea45a22166214e7e3832f898
- The Issue 8 URL succeeded; the 2018 fallback
  https://pubs.opengroup.org/onlinepubs/9699919799/utilities/awk.html was **not** used.

### Quote 1 — single-character FS splitting (18 words)

> Otherwise, if FS is any other character c, fields shall be delimited by each single occurrence of c.

Location: § EXTENDED DESCRIPTION → Regular Expressions (anchor `tag_20_06_13_04`),
paragraph "An extended regular expression can be used to separate fields ...", ordered
list item "If FS is a single character", second branch. Raw body byte offset 51297
(`FS` and `c` are `<b>`/`<i>`-marked in the HTML).

```
$ printf '%s' "Otherwise, if FS is any other character c, fields shall be delimited by each single occurrence of c." | wc -w
18
```

### Quote 2 — NF definition (9 words)

> NF The number of fields in the current record.

Location: § Variables and Special Variables (anchor `tag_20_06_13_03`), built-in
variable definition list between `FS` and the BEGIN/END caveat; raw body byte offset
42171 (`NF` is `<i>`-marked in the HTML).

```
$ printf '%s' "NF The number of fields in the current record." | wc -w
9
```

## Corroboration used for the row shape (not a new source)

`awk -F'|'` on a `| cell | cell | ... |` row yields an empty `$1` (text before the first
delimiter) and an empty `$NF` (text after the last delimiter), so 11 cells give NF=13 —
exactly the census predicate quoted in the round-95 plan and in CORPUS.md
("malformed rows — 11 columns means NF=13; must print 0").

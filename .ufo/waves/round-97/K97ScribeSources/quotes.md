# S276 source — ECMAScript 2025 Language Specification (ECMA-262)

Seat K97ScribeSources, round 97. One URL, one row. Capture and every quote below are
byte-exact against the saved body in `captures/ecma262-2025.html`.

## Provenance

    URL           https://tc39.es/ecma262/2025/
    fetch         curl -sS -o ecma262-2025.html -w 'HTTP %{http_code} bytes=%{size_download} url=%{url_effective}\n' https://tc39.es/ecma262/2025/
    HTTP          200
    bytes         7330686
    sha256        c1f9a15946c7dd94b13f56564fa6549cc6f212fd35101f8f5e38a32a0efbefe1
    Last-Modified Fri, 06 Nov 2026 17:17:55 GMT
    etag          "6aee0bc3-6fdb7e"
    access date   2026-11-07 (UTC; host local clock 2026-11-06 23:34 -03, `date -u` = Sat 07 Nov 2026 02:34:29 AM UTC)
    document      <title>ECMAScript® 2025 Language Specification
    duplicate     grep -n 'tc39\|ecma' corpus/SOURCES.md -> exit 1, no prior row on this URL
    capture       .ufo/waves/round-97/K97ScribeSources/captures/ecma262-2025.html (same sha256 as the fetched body)

Byte offsets are offsets into the HTML body file; "html_line" is the 1-based line of the
capture. Quotes are quoted after tag strip + whitespace collapse (the rendering of the
sentence a reader sees), exactly the form the row carries.

## Q(a) — § 22.1.3.32.1 TrimString (white space definition)

    html_line 34900   html_byte 4977578   section 22.1.3.32.1
    quote: The definition of white space is the union of WhiteSpace and LineTerminator.

    $ printf '%s' "The definition of white space is the union of WhiteSpace and LineTerminator." | wc -w
    12

Binds `String.prototype.trim` (line 34891 calls `TrimString(S, start+end)`) to the same
WhiteSpace ∪ LineTerminator union.

## Q(b) — § 22.2.2.9 CompileToCharSet, `CharacterClassEscape :: s`

    html_line 37124   html_byte 5262464   section 22.2.2.9
    quote: Return the CharSet containing all characters corresponding to a code point on the right-hand side of the WhiteSpace or LineTerminator productions.

    $ printf '%s' "Return the CharSet containing all characters corresponding to a code point on the right-hand side of the WhiteSpace or LineTerminator productions." | wc -w
    21

This is the row's quote (21 words, under the 25-word ceiling).

## Q(c) — § 12.2 White Space, Note 1 (U+00A0 inside `<USP>`)

    html_line 14263   html_byte 2402224   section 12.2
    quote: U+0020 (SPACE) and U+00A0 (NO-BREAK SPACE) code points are part of <USP>.

    $ printf '%s' "U+0020 (SPACE) and U+00A0 (NO-BREAK SPACE) code points are part of <USP>." | wc -w
    12

The WhiteSpace production it notes over (html lines 14270-14283, in order):

    WhiteSpace :: <TAB> <VT> <FF> <ZWNBSP> <USP>

with Table 35 rows at html lines 14208 (U+0009 CHARACTER TABULATION `<TAB>`),
14219 (U+000B LINE TABULATION `<VT>`), 14230 (U+000C FORM FEED (FF) `<FF>`),
14241 (U+FEFF ZERO WIDTH NO-BREAK SPACE `<ZWNBSP>`) and 14252 (any code point in
general category "Space_Separator" `<USP>`). § 12.3 (line 14293) adds: "Line terminators
are included in the set of white space code points that are matched by the \s class in
regular expressions."

## Why this grounds C1

`runCheck` at base decides Registry membership with `\s` and `.trim()` and splits the
document with `/\r?\n/`; the census `row_pass` (`/home/vgpnk/Projects/shokunin/scripts/sources-census.sh`,
`^ {0,3}##[ \t]`, `^ {0,3}#[ \t]`, `trim()` over `[ \t]`) accepts SP and TAB only. Per
Q(b) and Q(c), `\s` is WhiteSpace ∪ LineTerminator, which includes CR (LineTerminator),
VT, FF, NBSP and every other Zs code point; `.trim()` (Q(a)) strips that same wider set,
and `/\r?\n/` eats the CR outright. None of those three can be the census's reader.

## Verification command

    $ python3 extract-quotes.py captures/ecma262-2025.html
    (a) § 22.1.3.32.1 TrimString
        html_line=34900 html_byte=4977578 occurrences_on_line=1
    (b) § 22.2.2.9 CompileToCharSet, CharacterClassEscape :: s
        html_line=37124 html_byte=5262464 occurrences_on_line=1
    (c) § 12.2 White Space, Note 1
        html_line=14263 html_byte=2402224 occurrences_on_line=1
    VERDICT: all three quotes located byte-exact
    exit=0

(full stdout saved as `quotes-verify.txt`)

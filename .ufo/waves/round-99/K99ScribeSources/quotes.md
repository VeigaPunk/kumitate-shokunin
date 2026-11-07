# quotes.md — K99ScribeSources (round 99, C1 sourcing)

Seat: `K99ScribeSources`. All fetches 2026-11-07 (UTC). Scratch: `/fast/scratch/hyaku/kumitate-r99/K99ScribeSources/`
(captures copied to `capture/` in this seat dir before scratch removal; sizes/sha256 below are of the copies).

## Captures

| # | URL | HTTP | bytes | sha256 | headers of note |
|---|---|---|---|---|---|
| 1 | https://www.unicode.org/Public/17.0.0/ucd/PropList.txt | 200 | 145465 | `130dcddcaadaf071008bdfce1e7743e04fdfbc910886f017d9f9ac931d8c64dd` | `last-modified: Sat, 16 Aug 2025 00:45:11 GMT`, `content-type: text/plain; charset=utf-8`, `etag: W/"23839-63c70d19d13c0-gzip"` (gzip W/ etag is not the body hash) |
| 2 | https://pubs.opengroup.org/onlinepubs/9799919799/utilities/V3_chap02.html | 200 | 357953 | `0889867a53fe12508a71e8739ec23ecdddc95e6f67697c98e26acc8ff0ec1acd` | `Content-Length: 357953`, `Content-Type: text/html; charset=UTF-8`, no `Last-Modified`, `Date: Sat, 07 Nov 2026 06:34:17 GMT`; 5918 lines |
| 3 | https://pubs.opengroup.org/onlinepubs/9799919799/basedefs/V1_chap09.html | 200 | 60438 | `2f5f60e9fe2954fe09dc0991f5c03b7c1de771b0ae2104e4a8a5745187c64e24` | fetched as the page capture 2 defers to (§9.3.5) |

Capture 1 **is byte-identical to the L1 capture** `.ufo/waves/round-99/open/l1-open-unicode-proplist-17.0.0.txt`
(145465 bytes, same sha256; `cmp proplist.txt <L1 path>` → no output, exit 0). Independent second fetch of the same URL:
`curl -sS -o proplist.txt` (no cache), HTTP 200, 145465 bytes.

Commands (from the scratch dir):

    curl -sS -o proplist.txt -w 'HTTP %{http_code} bytes %{size_download}\n' https://www.unicode.org/Public/17.0.0/ucd/PropList.txt
    curl -sS -m 90 -o posix-v3-chap02.html https://pubs.opengroup.org/onlinepubs/9799919799/utilities/V3_chap02.html
    curl -sS -m 60 -o xbd-ch09.html  https://pubs.opengroup.org/onlinepubs/9799919799/basedefs/V1_chap09.html
    curl -sS -I https://www.unicode.org/Public/17.0.0/ucd/PropList.txt      # headers
    curl -sS -I https://pubs.opengroup.org/onlinepubs/9799919799/utilities/V3_chap02.html
    sha256sum proplist.txt posix-v3-chap02.html xbd-ch09.html
    cmp proplist.txt <L1 capture> && echo IDENTICAL

## Quote 1 — Unicode White_Space includes NEL, excludes U+FEFF and U+200B

`PropList.txt` 17.0.0, `White_Space` property block, file lines 12–24 (`# Total code points: 25` at line 24).
Line 12 (7 words):

    0009..000D    ; White_Space # Cc   [5] <control-0009>..<control-000D>

Lines 13, 14 and 24 (17 words together):

    0020          ; White_Space # Zs       SPACE
    0085          ; White_Space # Cc       <control-0085>
    # Total code points: 25

`wc -w` on the three-line block: 17. Line 14 is the point the claim needs: **U+0085 NEL is `Cc` and still
`White_Space`**, i.e. Unicode's class is neither "the Zs block" nor "what JS strips".

**Absence of U+FEFF and U+200B** (cannot be quoted — measured): `grep -c -E 'FEFF' proplist.txt` → `0`;
`grep -c -E '200B' proplist.txt` → `0`. The property file uses uppercase hex, so an entry for either code point
would appear literally. Neither code point occurs anywhere in the 145465-byte file, so U+FEFF (which ECMAScript
`trim()` strips, S276) and U+200B are not `White_Space`.

Cross-check of the 25: `0009..000D` (5) + 0020 + 0085 + 00A0 + 1680 + `2000..200A` (11) + 2028 + 2029 + 202F
+ 205F + 3000 = 25, matching line 24.

**Why this matters (the three classes are pairwise different):** POSIX `blank` = SP, TAB only (S277);
Unicode `White_Space` = the 25 above (adds NEL, NBSP, all Zs, LS/PS, keeps VT/FF/CR/LF);
ECMAScript `trim()` = TAB VT FF FEFF + every Zs + LF CR LS PS (S276) — it keeps U+0085 and strips U+FEFF, so it
equals neither of the other two. "Unicode whitespace" is therefore not a name for either reader's class.

## Quote 2 — bracket expressions take their classes from the locale (XCU defers to XBD 9.3.5)

Page: `https://pubs.opengroup.org/onlinepubs/9799919799/utilities/V3_chap02.html`.
**Section-number drift (finding):** this URL is Issue 8, where the section is
**§2.14 Pattern Matching Notation** (heading at HTML line 2943) and **§2.13 is Shell Execution Environment**
(HTML line 2887). The seat brief's "§2.13.1" is not this edition's numbering; the section asked for is §2.14.1
("Patterns Matching a Single Character", heading at HTML line 2956). No older edition was opened, so this note claims
only what this URL contains. Quoted from this edition, not from memory.

§2.14.1, HTML lines 3000–3001 — **25 words** (`wc -w`):

    A <left-square-bracket> shall introduce a bracket expression if the characters following it meet the
    requirements for bracket expressions stated in XBD 9.3.5 RE Bracket Expression

The section gives the grammar but **no LC_CTYPE sentence**: scanning HTML lines 2956–3006 (the whole of §2.14.1)
finds **zero** occurrences of `locale` or `LC_CTYPE`. Inside §2.14 the word appears only twice elsewhere — the intro's
invalid-bytes sentence (line 2954) and §2.14.3's collation-order sentence (line 3059). The intro sentence, quoted here
as the negative control — **25 words**:

    Since pathnames can contain such bytes, portable applications need to ensure that the current locale is the
    C or POSIX locale when performing pattern matching

So the class-membership rule has to be taken from the page §2.14.1 defers to.

## Quote 3 — the deferred clause: character classes are LC_CTYPE-defined

Page: `https://pubs.opengroup.org/onlinepubs/9799919799/basedefs/V1_chap09.html`, §9.3.5 RE Bracket Expression,
HTML lines 273–278 — **21 words** (`wc -w`):

    The set of single characters that belong to the character class, as defined in the LC_CTYPE category in the
    current locale.

Immediately preceding it (same list item): "A character class expression shall represent the union of two sets:"
(line 273), and `[:space:]` is one of the classes "[s]hall be supported in all locales" (line 273 ff., listed
alongside `[:blank:]`). Consequence for the claim: the census's `trim_cell`
(`scripts/sources-census.sh` 531–535, `[[ "$value" == [[:space:]]* ]]` in bash `[[ ]]`) resolves `[:space:]`
**through LC_CTYPE**, so its strip set moves with the locale, while `row_pass`'s `gsub(/^[ \t]+|[ \t]+$/,"",s)`
(line 581) is a literal two-character set that does not. S277 already fixes the POSIX-locale content of
`blank` and `space`; these two quotes fix *where the class gets its meaning*.

## Unreachable source (recorded, not used)

`https://www.gnu.org/software/bash/manual/html_node/Pattern-Matching.html` — two attempts, both failed:

    curl -sS -m 45  … → curl: (28) Connection timed out after 45000 milliseconds   (HTTP 000, 0 bytes)
    curl -sS -m 180 … → curl: (28) Failed to connect to www.gnu.org:443 after 135453 ms: Could not connect to server
                                                                                    (HTTP 000, 0 bytes, 135.46 s wall)

Same host/timeout class as the r98 note (S276 locator log: `www.gnu.org:443`, 134658 ms). No bash-manual claim is
made anywhere in the drafted rows; `[[:space:]]` behaviour in `[[ ]]` is grounded on XBD 9.3.5 above instead.

## Measured, not quoted — how far the locale axis actually reaches

The quote above says classes come from LC_CTYPE; it does not say *which* characters that yields. Measured with the
census's own `trim_cell` body (copied verbatim from `scripts/sources-census.sh` 531–535) under four locales
(`locale-probe.txt`, script `locale-table.sh`, host `LANG=LC_CTYPE=en_US.UTF-8`):

| pad | C / POSIX | C.UTF-8 / en_US.UTF-8 |
|---|---|---|
| SP, TAB, VT, FF, CR | stripped | stripped |
| U+1680, U+2000, U+2003, U+200A, U+2028, U+2029, U+205F, U+3000 | **kept** | **stripped** |
| U+0085 NEL, U+00A0 NBSP, U+202F, U+200B, U+FEFF | kept | kept |

So the locale axis is real and is exactly the Zs/LS/PS band above — and no wider: NBSP and NEL are *not* stripped by
`[[:space:]]` even in the UTF-8 locales of this host. This does **not** contradict the plan's sentence about
NBSP/VT/U+2003/U+FEFF cells: that sentence is about `row_pass`'s literal `[ \t]` (gawk, line 581), which keeps
every pad in both tables. The two census readers therefore differ *from each other* by locale as well as by class.
Report-only (fleet script, out of the lane's writable scope).

For contrast, ECMAScript `trim()` on node v24.21.0 (`js-trim.txt`, script `js-trim.mjs`): strips TAB LF VT FF CR SP
NBSP 1680 2000 2003 200A LS PS 202F 205F 3000 FEFF; keeps U+0085 and U+200B. None of the four classes
(`blank` = SP TAB, `row_pass` = SP TAB, `trim_cell` = the locale table above, `White_Space` = 25 cps,
JS `trim()` = the list just given) is equal to another.

## Word counts (receipts)

    wc -w  line 12 block (7) ; lines 13,14,24 block (17) ; lines 12-15 block (26, not used — over 25)
    wc -w  XCU 2.14.1 deferral sentence (25) ; XCU locale/invalid-bytes sentence (25) ; XBD 9.3.5 sentence (21)

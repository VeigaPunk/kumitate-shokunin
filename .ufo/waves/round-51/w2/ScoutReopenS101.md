# ScoutReopenS101 — re-open S101

**Verdict: AGREE** on the S101 body hash, the wave-1 saved HTML, and the 17-word quote at the stated location.

Attacked: `corpus/SOURCES.md` row S101 (body sha256 `366f0e7e27c7bd5e361e782bb12ce23215dabcd20ddc505eb91451cda49f7b3d`) and the lesson Gate quote in `corpus/lessons/round-51.md` lines 67–71, against a fresh fetch of https://man7.org/linux/man-pages/man2/getrandom.2.html and the wave-1 bytes. Predicate touched: DOCTRINE_HELD D3 (S101 row exists, mined, used-by the entry) only as a source-identity check. A51 was not run.

Axes: hash fidelity, quote verbatimness, location accuracy. No other axis was traded.

## Evidence

Fresh fetch (this seat), 2026-10-24T02:43:56Z:

```text
$ date -u
Sat 24 Oct 2026 02:43:56 AM UTC
$ curl -sS -D /tmp/s101-headers.txt -o /tmp/getrandom.2.html -w 'http_code=%{http_code} size=%{size_download}\n' \
    https://man7.org/linux/man-pages/man2/getrandom.2.html
http_code=200 size=16466
$ sha256sum /tmp/getrandom.2.html
366f0e7e27c7bd5e361e782bb12ce23215dabcd20ddc505eb91451cda49f7b3d  /tmp/getrandom.2.html
$ wc -c /tmp/getrandom.2.html
16466 /tmp/getrandom.2.html
```

Response headers (relevant): `HTTP/1.1 200 OK`; `Date: Sat, 24 Oct 2026 02:43:57 GMT`; `Last-Modified: Thu, 08 Oct 2026 17:39:35 GMT`; `ETag: "4052-65d57b70ec3c0"`; `Content-Length: 16466`; `Content-Type: text/html`.

Row pin (`corpus/SOURCES.md` S101 anchor cell): HTTP 200; body sha256 `366f0e7e27c7bd5e361e782bb12ce23215dabcd20ddc505eb91451cda49f7b3d`; fetched `2026-10-24T01:59:28Z`. **Match.** Same digest is in the lesson Gate (round-51.md:68) and the entry provenance line (`corpus/knowledge/invocation-attestation.md:7-8`).

Saved artifact. The path named in the item, lane-root `build/ScoutRandomSource/getrandom.html`, is absent (`ls` → `No such file or directory`). The wave-1 bytes are at `.ufo/waves/round-51/build/ScoutRandomSource/getrandom.html`:

```text
$ sha256sum .ufo/waves/round-51/build/ScoutRandomSource/getrandom.html
366f0e7e27c7bd5e361e782bb12ce23215dabcd20ddc505eb91451cda49f7b3d
$ wc -c .ufo/waves/round-51/build/ScoutRandomSource/getrandom.html
16466
$ cmp -s /tmp/getrandom.2.html .ufo/waves/round-51/build/ScoutRandomSource/getrandom.html; echo $?
0
```

Fresh body, row pin, and saved HTML are the same 16466 bytes. The page has not moved in the ~44 minutes since the recorded fetch instant.

Colophon on the fresh body (lines 233–243) matches the row's version cell: tarball `man-pages-6.19.tar.gz` obtained 2026-09-09; footline `Linux man-pages 6.19  2026-02-08  getrandom(2)`.

## Quote

Lesson Gate (round-51.md:69-71), claimed 17 words, DESCRIPTION paragraph 2, saved HTML lines 85–86:

> By default, getrandom() draws entropy from the urandom source (i.e., the same source as the /dev/urandom device).

Fresh file, 1-indexed lines 80–86 (tags left in):

```text
80: <h2 id="DESCRIPTION">DESCRIPTION
81:        The <b>getrandom</b>() system call fills the buffer pointed to by <i>buf</i>
82:        with up to <i>size</i> random bytes.  These bytes can be used to seed
83:        user-space random number generators or for cryptographic purposes.
84: <blank>
85:        By default, <b>getrandom</b>() draws entropy from the <i>urandom</i> source
86:        (i.e., the same source as the <i>/dev/urandom</i> device).  This behavior
```

Tag-stripped, whitespace-collapsed lines 85–86 begin with that sentence exactly (`startswith` true). Whitespace split of the quoted string is 17 tokens: By / default, / getrandom() / draws / entropy / from / the / urandom / source / (i.e., / the / same / source / as / the / /dev/urandom / device). The period sits after the closing parenthesis (`device).`), matching the HTML `device).` and the lesson's closing period. Line 84 is blank, so line 85 is the start of DESCRIPTION paragraph 2. Paragraph 1 is lines 81–83.

The row anchor is the wider window "DESCRIPTION paragraphs 1-2, saved HTML lines 81-86". That window contains the quote; it is not a different location. The `teaches` cell's "usable for cryptographic purposes" is a paraphrase of paragraph 1 ("These bytes can be used to … for cryptographic purposes."), which is inside lines 81–83, not inside the 17-word quote. Both sentences are on the page.

## Not a disagreement

- `CSPRNG` occurs 0 times (case-insensitive). `crypto.randomBytes` is absent. The only case-insensitive `node` hit is `parentNode` in the page's Google Analytics snippet (`s.parentNode.insertBefore`), not Node.js. The lesson's withheld claims (round-51.md:74-75) still hold of the page.
- `opened` column is `2026-10-23` while the anchor's fetch instant is `2026-10-24T01:59:28Z`. The lesson already records that split (local -03 date vs UTC). This reopen does not change it. The hash and the quote do not depend on it.
- Entry sentence `invocation-attestation.md:35-36` still says Node's `crypto.randomBytes(16)` bytes "come from" `getrandom()`. That bridge is not in the page. The lesson says the entry "phrases both bounds exactly"; the entry text does not contain that bound. Out of scope for the hash/quote verdict; recorded so a later seat does not read AGREE as endorsing the Node sentence.

## Confidence and gaps

High on hash equality (three-way: fresh curl, row pin, saved file `cmp` 0) and on the quote's characters, word count, and line location. No remaining unknown on the assigned question. Fetch bytes left at `/tmp/getrandom.2.html` and headers at `/tmp/s101-headers.txt` (outside the lane). No tools installed. No lane file other than this report was written.

Report: .ufo/waves/round-51/w2/ScoutReopenS101.md

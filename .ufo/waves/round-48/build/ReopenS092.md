RESULT ReopenS092 verdict=HOLDS

S092 (`corpus/SOURCES.md:105`) and the gate row (`corpus/lessons/round-47.md:40`, decision `reject A (kept) — supersedes S076`) still match the live page. Reject A stays. No install.

## Fetch

Command (2026-10-23T11:52:13Z), redirects followed, body saved then hashed:

`curl -sS -D headers.txt -o body.html -L --max-redirs 10 -w 'http_code=%{http_code} num_redirects=%{num_redirects} url_effective=%{url_effective} size_download=%{size_download}' 'https://git-scm.com/docs/gitrepository-layout/2.56.0'`

- Hop 1: `HTTP/2 301`, `date: Fri, 23 Oct 2026 11:52:13 GMT`, `location: https://git-scm.com/docs/gitrepository-layout/2.56.0/` (trailing slash only; `content-length: 162`).
- Hop 2 (final): `HTTP/2 200`, same `date`, `content-type: text/html; charset=utf-8`, `last-modified: Wed, 21 Oct 2026 15:55:42 GMT`, `etag: W/"6ad8e07e-278"` (`0x278` = 632).
- `http_code=200`, `num_redirects=1`, `url_effective=https://git-scm.com/docs/gitrepository-layout/2.56.0/`, `size_download=632`.
- sha256 `c4cd41972b3b752ac40ac145f98c7e7a887d086dd03c362a3c4a9951e2d79ca5` — byte-identical to the S092 anchor pin and to S076's pin.

Final body (16 lines; line 1 and line 16 blank):

```
<html lang="en">
 <head>
  <meta charset="utf-8">
  <title>Redirecting&hellip;</title>
  <link rel="canonical" href="https://git-scm.com/docs/gitrepository-layout/2.49.0">
  <meta http-equiv="refresh" content="0; url=https://git-scm.com/docs/gitrepository-layout/2.49.0">
  <meta name="robots" content="noindex">
 </head>
 <body>
  <script>window.location.replace(document.querySelector("link[rel='canonical']").href + window.location.search + window.location.hash)</script>
  <h1>Redirecting&hellip;</h1>
  <a href="https://git-scm.com/docs/gitrepository-layout/2.49.0">Click here if you are not redirected.</a>
 </body>
</html>
```

## Quoted meta refresh (body line 7)

Gate quote (`round-47.md:40`, 2 words): `0; url=https://git-scm.com/docs/gitrepository-layout/2.49.0`.

Fetched line 7, verbatim:

`  <meta http-equiv="refresh" content="0; url=https://git-scm.com/docs/gitrepository-layout/2.49.0">`

The `content` attribute equals the quote. `printf '%s' '<quote>' |` split → 2 words. Anchor cell "final response HTML line 7, meta http-equiv=refresh to the 2.49.0 page" matches this final 200 body, not the 162-byte 301. Canonical (`:6`), the script (`:11`) and the anchor (`:13`) name the same 2.49.0 URL.

## Rejection reason

S092 `teaches`: `supersedes S076 — REJECTED: redirect wrapper, no manual text; S063 (the unversioned page whose history covers 2.56.0) is used instead. flip: a versioned 2.56.0 page serves the manual text`. Status `rejected`. Tier column `A`. That is the gate's `reject A (kept)`.

- "redirect wrapper": title and `h1` are `Redirecting…`; the only navigation is the refresh/canonical/script to `/2.49.0`.
- "no manual text": no `objects`, `HEAD`, `DESCRIPTION`, `hooks`, `common`, `worktree`, or `last updated in 2.56.0`. The three `repository` hits are the path `gitrepository-layout` inside the three 2.49.0 URLs.
- Flip condition is unmet: this URL still does not serve the manual.
- Host `git version 2.56.0`, so the scope cell ("text for the host git 2.56.0") is still the right claim to reject.
- S063 clause, re-fetched the same minute: `curl -sS -L` of `https://git-scm.com/docs/gitrepository-layout` → `HTTP/2 200`, `num_redirects=0`, 64533 bytes, sha256 `d497ee1e5a006482032f513f42d57b93a2d3c0200aeecd017a89cfb03e9a9b22` (S063's pin, `SOURCES.md:76`, status `mined`). Footer: `gitrepository-layout last updated in 2.49.0`. History: `<li class="no-change"><span>2.49.1 → 2.56.0 no changes</span></li>`. S063's anchor still says the versioned `/2.56.0` URL redirects to 2.49.0, see S076. `corpus/knowledge/agent-isolation-substrates.md:1` cites S063, not S092.

## `supersedes` target

Right target. Exactly one `| S076 |` and one `supersedes S076` in `corpus/SOURCES.md` (the latter only on S092). S076 (`:89`) is the same URL, same 632-byte pin, same tier/scope, status `rejected`. Its `teaches` is still the pre-correction sentence (`REJECTED: the versioned 2.56.0 URL is a redirect to 2.49.0 text, not manual text for the host version; …`), which `git show 2b2bf7bb:corpus/SOURCES.md` shows as the original row (that revision's `used-by` is only `corpus/lessons/round-45.md`). S092 is the append-only reword required by fleet `CORPUS.md:117-118` (`teaches` opens `supersedes S076 —`), matching `round-47.md:45-49` (S076 is one of the 13 restored rows; S092 is its correction). Suffix after `supersedes S076 — ` is 169 characters.

## Confidence

High on the quote, the hash, the reject reason, and the supersedes target. The page bytes are the pinned bytes, not merely a similar wrapper.

## Unknowns

None that touch the verdict. `Last-Modified` (2026-10-21) is not a date the row claims; `opened` / gate `accessed` are 2026-10-23, which is this fetch's `Date`.

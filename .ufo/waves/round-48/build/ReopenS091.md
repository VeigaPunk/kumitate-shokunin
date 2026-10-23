RESULT ReopenS091 verdict=HOLDS

# ReopenS091 — SOURCES S091 against Node.js v24.21.0 cli.html

Checked row `corpus/SOURCES.md:104`, Gate row `corpus/lessons/round-47.md:39`, against https://nodejs.org/docs/v24.21.0/api/cli.html. No tools installed. No git or jj writes. Fetch kept at `/fast/scratch/hyaku/kumitate-r48/seats/w1-ReopenS091/cli.html`.

## Fetch

Command:

```
mkdir -p /fast/scratch/hyaku/kumitate-r48/seats/w1-ReopenS091 && cd /fast/scratch/hyaku/kumitate-r48/seats/w1-ReopenS091 && curl --fail --location --silent --show-error --max-filesize 10485760 --dump-header cli.headers --output cli.html --write-out 'CLI_HTTP %{http_code} bytes=%{size_download} redir=%{num_redirects} url=%{url_effective} ctype=%{content_type}\n' https://nodejs.org/docs/v24.21.0/api/cli.html && sha256sum cli.html
```

Verbatim:

```
CLI_HTTP 200 bytes=278644 redir=0 url=https://nodejs.org/docs/v24.21.0/api/cli.html ctype=text/html; charset=utf-8
7302f93cda9694927010d4171e181e8a7617a8852242d70f005f1ea65365538c  cli.html
```

Headers: `HTTP/2 200`; `date: Fri, 23 Oct 2026 11:52:24 GMT`; `last-modified: Tue, 08 Sep 2026 00:21:20 GMT`; `content-length: 278644`; `etag: "148023f8da224db8ba04c52e79916933"`. Local UTC at fetch: `2026-10-23T11:52:24Z`. `wc -l` → 4200 lines. Page identity: line 6 `<meta name="nodejs.org:node-version" content="v24.21.0">`; line 7 `<title>Command-line API | Node.js v24.21.0 Documentation</title>`.

The body sha256 equals the 64-hex digest in the S091 anchor (`7302f93cda9694927010d4171e181e8a7617a8852242d70f005f1ea65365538c`). Gate access date `2026-10-23` matches the HTTP `date` and the local date. `last-modified` is the document mtime (2026-09-08), not the access date.

## Quote, locator, word count

Fetched lines (`cli.html:4147-4150`):

```
4147:<h4><code>--max-old-space-size=SIZE</code> (in MiB)<span><a class="mark" href="#--max-old-space-sizesize-in-mib" id="--max-old-space-sizesize-in-mib">#</a></span><a aria-hidden="true" class="legacy" id="cli_max_old_space_size_size_in_mib"></a></h4>
4148:<p>Sets the max memory size of V8's old memory section. As memory
4149:consumption approaches the limit, V8 will spend more time on
4150:garbage collection in an effort to free unused memory.</p>
```

Gate quote (`corpus/lessons/round-47.md:39`): "Sets the max memory size of V8's old memory section." (`:4148`; 10 words).

- Verbatim: the sentence is a single occurrence on line 4148 (byte offset 274176). Apostrophe in both the HTML and the Gate quote is U+0027 (`V8's` code points `56 38 27 73`). No U+2019 variant in the file (`straight_count` 1, `curly_count` 0). The sentence ends on 4148; "As memory" starts the next sentence and wraps through 4150.
- Word count: `printf '%s' "Sets the max memory size of V8's old memory section." | wc -w` → `10`. Tokens: Sets, the, max, memory, size, of, V8's, old, memory, section. Gate says 10 words. Under the ≤25-word Gate rule (`CORPUS.md` rule 1).
- Row anchor `:4147-4150` is the heading plus that paragraph; the Gate locator `:4148` is the sentence line. Both match these bytes.

## Tier

Row: `kind=docs`, `tier=A`, scope "what --max-old-space-size and RLIMIT_AS bound". Gate decision: `admit A, mined`. `CORPUS.md` tier A is primary or authoritative for the scope, including official docs; `community` is never A. This URL is the Node.js v24.21.0 command-line manual. Tier A holds for the cli clause. Not tier inflation.

## supersedes target

S091 `teaches` opens `supersedes S073 —` (`corpus/SOURCES.md:104`). S073 (`corpus/SOURCES.md:86`) is the prior row for the same URL and the same scope. S073 still teaches "--max-old-space-size sets the size of V8's old memory section only". The located paragraph (`cli.html:4148-4150`) says "max memory size" and does not contain "only". The word "only" does not occur in `:4147-4153`. Target S073 is the row that added the unsupported "only".

## Out of this reopen

Not re-fetched: `buffer.html` and installed `getrlimit(2)`/`prlimit(1)`, which the row anchor also cites. They are outside the assigned URL. The cli quote, locator, word count, tier, and `supersedes` target do not depend on them.

No defect on the assigned checks.

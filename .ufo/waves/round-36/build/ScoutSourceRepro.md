SOURCE-REPRO anchor="Recording the build environment" words=23 supports=yes

# ScoutSourceRepro — round 36 build, source seat (C1 operability)

Scope: one authoritative source on recording the environment/revision with a result.
Read-only: no registry row added (as instructed), no lane file edited except this
report, no scratch clone, no installs, no REA, no subagents.

## Source opened

- URL: https://reproducible-builds.org/docs/recording/
- Section: **Recording the build environment** — intro paragraph (after the
  "about dialog / --version" preamble, immediately before `## File Format`)
- Access date: 2026-10-21 (native reader fetch + curl byte check)
- HTTP: `200 OK`, `Last-Modified: Mon, 19 Oct 2026 17:18:03 GMT`
- Verbatim quote (23 words):

> All relevant information about the build environment should either be defined
> as part of the development process or recorded during the build process.

Byte check: the quote matches the live HTML text stream exactly
(`exact_match= True`, whitespace-normalized); no curly quotes or em dashes in it.

Why this page and not the candidates: the suggested
`https://reproducible-builds.org/docs/deterministic-builds/` is **HTTP 404**
(verified, not a reader artifact). `source-date-epoch/` is 200 but only defines
a timestamp variable — it states no provenance/recording rule for a result. The
documentation index lists the actual page under "Define a build environment":
`/docs/recording/`.

## Teaching for this round

The page's rule gives exactly two admissible provenance routes, and C1 implements
both for its gates:

1. **"defined as part of the development process"** = PIN v1. `.ufo/pins/origin.json`
   fixes repo, full revision, clone path, recreate command; the gate asserts
   `git -C <src> rev-parse HEAD` equals that revision before it scores anything
   (`SRC_REV_MISMATCH` / `SRC_REV_UNVERIFIABLE` are fail-closed, exit 2).
2. **"recorded during the build process"** = `src-rev=<12 hex>` printed inside
   every verdict line (CHECKLIST, FIDELITY, PROXY, SURFACE_PROBE), so the artifact
   states which bytes it scored.

A gate that reads a moving checkout and prints no revision does *neither*: an
identical rerun can score different bytes, so the verdict is not reproducible
evidence. The same obligation carries into the expectation files — KNOWN v1 and
the fidelity ratchet each carry `revision:` and refuse on mismatch
(`KNOWN_REV_MISMATCH`, `RATCHET_REV_STALE`), and a KNOWN entry that stops firing
is `KNOWN_STALE`: an expectation is only meaningful against a named revision.

[INFERENCE] The "moving checkout is not evidence" half is a logical consequence,
not a second quoted sentence: the Definitions page states "Source code is usually
a checkout from version control at a specific revision or a source code archive"
(18 words, https://reproducible-builds.org/docs/definition/ § Explanations,
fetched 2026-10-21). "Same source code" (the definition's precondition) requires a
specific revision; a moving checkout names none. The recording rule supplies the
obligation, the definition supplies the revision requirement.

Not supported by this page (do not claim it in the row): the 12-hex abbreviation
length. `/docs/version-information/` is the page that discusses hash identifiers
and recommends fixed truncation (`git rev-parse --short=12 HEAD`), which is
consistent with, but not the basis of, our `src-rev` format.

## Row material (for ScribeSources / L1 — NOT written to the registry)

If S032 is admitted, the quote above supports `status=queued`, `kind=docs`,
`tier=A` (project-owned documentation of the reproducibility contract; same basis
as the other docs rows), `opened=2026-10-21`, `recheck=365d` (page carries only
an HTTP Last-Modified, no in-document date/version), `used-by=corpus/lessons/round-36.md`
(flip to `mined` in the round that writes that lesson). Scope suggestion: "the
provenance obligation for a build result: environment/source identity must be
defined in advance or recorded during the run". Anchor cell should name
"§ Recording the build environment, preamble before § File Format; fetched
2026-10-21 (Last-Modified 2026-10-19)". The page has no in-body author/date, so
the row cannot cite a document revision — only the fetch date and Last-Modified.

## Facts / inference / unknowns

- Facts: HTTP 404 for `deterministic-builds/`; 200 + Last-Modified for
  `recording/`; quote is 23 words and byte-exact on the page; the sentence is
  normative ("should") and covers exactly two routes (defined, recorded).
- Inference: the drafting rule entails that a verdict naming no revision is not
  reproducible evidence; tier A and recheck 365d are judgments for the registry,
  not statements of the page.
- Unknown: whether the page's wording changes after 2026-10-21 (recheck 365d);
  no per-page document version exists to pin. Not investigated: other pages in
  the same section (perimeter, definition-strategies) — only the definition page
  was opened as corroboration.

## Commands run

```
$ curl -sS -o /dev/null -D - <url> | sed -n '1p;/^[Ll]ast-[Mm]odified:/p'
deterministic-builds/  -> HTTP/1.1 404 Not Found
recording/             -> HTTP/1.1 200 OK ; Last-Modified: Mon, 19 Oct 2026 17:18:03 GMT
source-date-epoch/     -> HTTP/1.1 200 OK ; Last-Modified: Mon, 19 Oct 2026 17:18:03 GMT
definition/            -> HTTP/1.1 200 OK ; Last-Modified: Mon, 19 Oct 2026 17:18:03 GMT

$ curl -sS https://reproducible-builds.org/docs/recording/ | python3 <strip-tags + find quote>
exact_match= True
context= ... We either actively make aspects of the build environment irrelevant
to the build output, or ensure they are available to rebuild the software exactly
as distributed. All relevant information about the build environment should
either be defined ... or recorded ... . File Format Everything that is recorded ...

$ python3 -c "q='All relevant ... build process.'; print(len(q.split()))"
23
```

No tool installed or upgraded. No files written outside this report; upstream
clone untouched (not accessed at all).

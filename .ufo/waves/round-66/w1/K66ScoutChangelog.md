VERDICT: S212 source (MCP 2026-07-28 changelog.md) fetched and captured (HTTP 200, 12229 bytes, sha256 280533e2…30f6), row drafted in the 11-cell SOURCES schema, 7 norm-verified located quotes, and all 31 deprecation-section lines listed verbatim — milestone "open S212 source" done.

## Evidence

Fetch (access date 2026-10-27):
```
$ curl -sS -D changelog.headers.txt -o /dev/null -w 'HTTP_STATUS=%{http_code}\nEFFECTIVE_URL=%{url_effective}\nCONTENT_TYPE=%{content_type}\nSIZE_DOWNLOAD=%{size_download}\n' -L https://modelcontextprotocol.io/specification/2026-07-28/changelog.md
HTTP_STATUS=200
EFFECTIVE_URL=https://modelcontextprotocol.io/specification/2026-07-28/changelog.md
CONTENT_TYPE=text/markdown; charset=utf-8
SIZE_DOWNLOAD=12229
$ curl -fsSL -o changelog.md https://modelcontextprotocol.io/specification/2026-07-28/changelog.md   # exit 0
$ sha256sum changelog.md
280533e289ca1a638973b06f6f4d8a8aff735a3c3fe594ffb32696d63de530f6
$ wc -c changelog.md
12229
```
Live parity (M5-style, same UA the counter uses):
```
$ sha256sum <(curl -fsSL -A 'Mozilla/5.0 (kumitate-deprec66)' <URL>) changelog.md
280533e289ca1a638973b06f6f4d8a8aff735a3c3fe594ffb32696d63de530f6  (both, byte-identical)
```
norm() verification (frozen matcher replicated verbatim from deprec66-probe.mjs, script in scratch, quoted in row.md):
```
Q1 words=7 norm-match=true <=25w=true PASS
Q2 words=18 norm-match=true <=25w=true PASS
Q3 words=16 norm-match=true <=25w=true PASS
Q4 words=6 norm-match=true <=25w=true PASS
Q5 words=8 norm-match=true <=25w=true PASS
Q6 words=12 norm-match=true <=25w=true PASS
Q7 words=10 norm-match=true <=25w=true PASS
ALL_QUOTES_PASS
```
Structural check of the drafted row + verbatim listing (python): `verbatim-lines-checked= 31 mismatches= 0`; `NF= 13`, `ncells= 11`, enums valid, `pipe-in-cell= False`.
Absence sweep: `2027-07-28: 0`, `Three months after: 0`, `Earliest removal: 0`, `Deprecated in: 0`, `SEP-2577: 1`, `SEP-2596: 3`, `PR #2858: 1` (grep -cF on the capture).

## Findings

- K66ScoutChangelog-1 (info, milestone): source opened and captured. `build/K66ScoutChangelog/changelog.md` (12229 bytes, sha256 280533e289ca1a638973b06f6f4d8a8aff735a3c3fe594ffb32696d63de530f6), `changelog.headers.txt` beside it. Raw `text/markdown` — no HTML-normalization risk for the frozen quote matcher.
- K66ScoutChangelog-2 (info, coverage): row drafted in row.md keyed by URL `https://modelcontextprotocol.io/specification/2026-07-28/changelog.md`; 11 cells, status mined, opened 2026-10-27, recheck 180d, used-by corpus/knowledge/mcp-deprecation-registry.md; parses NF=13 under the probe's cells().
- K66ScoutChangelog-3 (info, coverage): 7 located quotes (each ≤25 words, verbatim, with line numbers) all pass norm(capture) inclusion; listed in M4 bullet shape `- S212 — "…"`. Covers Roots/Sampling/Logging (73-75), HTTP+SSE reclassification (82-83), includeContext clock (90-91), DCR (93), policy intro (71), Logging migration (79-80).
- K66ScoutChangelog-4 (note for L1, scope): the M4-required quotes containing `2027-07-28` and `Three months after` are absent from this changelog (grep counts 0) — those clocks live only on the deprecated.md registry page (row URL matching `/specification/2026-07-28/deprecated`); do not source them from S212. Likewise the M6 `Deprecated in`/`Earliest removal` table is not in this document (counts 0).
- K66ScoutChangelog-5 (note, provenance): S010 already cites the HTML page `.../2026-07-28/changelog` (no .md); this row's `.md` URL is a distinct representation assigned to this seat — keep both, keyed by URL.
- K66ScoutChangelog-6 (note, freshness): response headers carry no strong revision marker (`last-modified` equals the fetch moment; Mintlify/Vercel serve). The sha256 in the row's anchor cell pins the opened bytes for recheck diffing.

## Artifacts

- `.ufo/waves/round-66/build/K66ScoutChangelog/changelog.md` — exact captured bytes
- `.ufo/waves/round-66/build/K66ScoutChangelog/changelog.headers.txt` — response headers
- `.ufo/waves/round-66/build/K66ScoutChangelog/row.md` — row draft, 7 located quotes, 31-line verbatim deprecation listing, norm() verification output, L1 hand-off facts (bytes+sha256 for source-captures.json binding)
- `.ufo/waves/round-66/w1/K66ScoutChangelog.md` — this report

## Limits

Did not fetch or audit the deprecated.md registry page, the feature-lifecycle policy page, or the installed omp v18.12.6 sources (other seats own those rows). Did not run the frozen counters or mutate the lane registry (L1 integrates). Live parity was checked once at fetch time; no repeated re-fetch schedule. No tools were installed this seat.

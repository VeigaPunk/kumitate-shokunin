VERDICT: S208 (feature-lifecycle.md, MCP feature lifecycle policy) fetched live 2026-10-27 HTTP 200, 8794 bytes, sha256 3f337191…; the page does NOT contain the literal `Three months after` wording — that phrase lives in the S207 registry capture, so the M4-required quote must be bound to S207, not S208.

## Evidence

Primary fetch (2026-10-27T14:55:05Z):
```
$ curl -sS -o feature-lifecycle.raw.md -w "HTTP_STATUS=%{http_code}\nCONTENT_TYPE=%{content_type}\nSIZE_DOWNLOAD=%{size_download}\nURL_EFFECTIVE=%{url_effective}\n" -L "https://modelcontextprotocol.io/community/feature-lifecycle.md"
HTTP_STATUS=200
CONTENT_TYPE=text/markdown; charset=utf-8
SIZE_DOWNLOAD=8794
URL_EFFECTIVE=https://modelcontextprotocol.io/community/feature-lifecycle.md
```

Fingerprint vs. the round-66 wave capture of the same URL:
```
$ sha256sum feature-lifecycle.raw.md .../round-66/build/K66ScribeGate/captures/feature-lifecycle.md
3f3371911512591e61d80d8e1bf07ac6a93df4e930d1379d24b78034349e74ee  feature-lifecycle.raw.md
3f3371911512591e61d80d8e1bf07ac6a93df4e930d1379d24b78034349e74ee  .../K66ScribeGate/captures/feature-lifecycle.md
$ cmp <fresh> <round66> && echo BYTES_IDENTICAL_TO_ROUND66
BYTES_IDENTICAL_TO_ROUND66
```

`Three months after` absent from S208 (both renderings):
```
$ grep -in "three\|month\|grace\|90\|ninety" feature-lifecycle.raw.md
10:Context Protocol specification. It defines three feature states (Active,
27:A specification feature is in exactly one of three states:
68:4. Specify the **minimum deprecation window**: the number of months, at least
135:The twelve-month floor may be shortened when the feature presents an active
142:window must still provide at least ninety days between the feature becoming
$ curl -sS -L "https://modelcontextprotocol.io/community/feature-lifecycle" -o feature-lifecycle.html -w "HTTP=%{http_code} size=%{size_download}\n"
HTTP=200 size=334513
$ grep -c -i "three months after" feature-lifecycle.html
0
```

`Three months after` located on the sibling registry page (S207, live cross-check):
```
$ curl -sS -L -o deprecated-2026-07-28.md "https://modelcontextprotocol.io/specification/2026-07-28/deprecated.md" -w "HTTP=%{http_code} size=%{size_download}\n"
S207_URL HTTP=200 size=3839
$ grep -n "Three months after" deprecated-2026-07-28.md
31:| [HTTP+SSE transport](…) | [SEP-2596](…) | `2025-03-26` | [Streamable HTTP](…) | Three months after SEP-2596 reaches Final |
$ sha256sum deprecated-2026-07-28.md .../round-66/K66ScribeGate/captures/deprecated-2026-07-28.md
c12c3cb7d6b8a30cd4df8ea8162a819df071a42745da6d20165e8fdf94b28baa  deprecated-2026-07-28.md
c12c3cb7d6b8a30cd4df8ea8162a819df071a42745da6d20165e8fdf94b28baa  .../K66ScribeGate/captures/deprecated-2026-07-28.md
```

Located-quote verification (substring check against the written capture, python3):
```
Q1 words= 10 in_S208_capture= True     # "A specification feature is in exactly one of three states:"
Q4 words= 14 in_S208_capture= True     # "Features may remain Deprecated, without removal, for much longer than the minimum deprecation window."
Q9 words=  9 in_S208_capture= True     # "The minimum deprecation window is counted from that release."
Q11 words= 13 in_S208_capture= True    # "When the deprecation SEP is accepted and reaches Final, the deprecation is scheduled."
Q6 words=  6 in_S208_capture= False in_S207_live= True   # "Three months after SEP-2596 reaches Final"
```

## Findings

1. **K68ScoutS208-1 — severity medium; attacks the claim's quote-binding assumption (not the counter).**
   The seat scope and the M4 example expect the `Three months after` grace wording on the
   feature-lifecycle policy page. It is not there: 0 matches in the .md body and the HTML
   rendering, and the body is byte-identical to the round-66 capture (it never carried it in this
   rendering). The wording is the S207 registry row's Earliest-removal cell for HTTP+SSE
   (`Three months after SEP-2596 reaches Final`, deprecated.md:31) and the SEP-2596 page's
   equivalent (`Three months after this SEP is Final`). The L1's `## Located quotes` must bind the
   `Three months after` bullet to S207 (or its SEP-2596 sibling row); binding it to S208 fails M4's
   capture check and M5's live re-fetch. S208 contributes the *policy* half of the claim: the
   twelve-month minimum-window floor and the >= 90-day expedited floor.
   Repro: `curl -sS https://modelcontextprotocol.io/community/feature-lifecycle.md | grep -ci "three months after"` → 0;
   `curl -sS https://modelcontextprotocol.io/specification/2026-07-28/deprecated.md | grep -n "Three months after"` → line 31.

2. **K68ScoutS208-2 — severity low; attacks quote locatability for M4.**
   S208's normative minimum-window sentence ("the number of months, at least twelve, that the
   feature must remain Deprecated before it is eligible for removal") is wrapped across capture
   lines 77–79, so it cannot be one M4 substring; the expedited-floor sentence is likewise split at
   151–152. Single-line substitutes carrying the same content: line 102 (`The minimum deprecation
   window is counted from that release.`) and line 140. Use those for the S208 bullets.
   Repro: `sed -n '77,79p;151,152p' build/K68ScoutS208/captures/feature-lifecycle.md`.

3. **K68ScoutS208-3 — severity informational; stability note for the row's recheck cell.**
   Page body is sha256-identical (3f337191…) to the round-66 wave capture — the policy text did
   not change across the two access dates; `recheck: on-release` is appropriate, and the capture
   in `build/K68ScoutS208/captures/feature-lifecycle.md` can be pinned directly (header is an HTML
   comment above the verbatim body).

## Artifacts

- `.ufo/waves/round-68/build/K68ScoutS208/captures/feature-lifecycle.md` — fetched header (URL, time, HTTP 200, content-type, body bytes, sha256) as an HTML comment + verbatim 8794-byte body.
- `.ufo/waves/round-68/build/K68ScoutS208/quotes.txt` — 4 S208 located quotes (verified substring, ≤25 words) + the located S207 `Three months after` quote with the binding recommendation.
- `.ufo/waves/round-68/build/K68ScoutS208/row-S208.md` — 11-cell SOURCES row draft (tier A, `mined`, opened 2026-10-27, used-by `corpus/knowledge/mcp-deprecation-registry.md`) + located-quote bullets + misattribution flag.

## Limits

- Did not run the M68 counter; my binding recommendation derives from reading the plan's M4/M5 text, not the probe source's exact normalization (e.g., whether it collapses whitespace across wrapped lines — if it does, K68ScoutS208-2's concern evaporates; a whitespace-normalizing locate would make the multi-line clause usable).
- `Three months after` absence checked only on the `/community/feature-lifecycle.md` and `/community/feature-lifecycle` (HTML) renderings; no other mirrors checked.
- The S207 cross-check was corroboration for the finding, not my assigned row; S207's own seat owns its capture.

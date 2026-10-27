VERDICT: S211 evidence is captured at the plan's 2025-11-25 revision; the seat's 2025-11-05 URL 404s, and its stated HTTP+SSE deprecation-date anchor conflicts with the live deprecated-features table.

## Evidence
- Plan: `.ufo/waves/round-68/plan.md` names S211 “transports 2025-11-25”.
- Requested-pattern fetch: `curl -sS -L -o transports.html -D headers.txt -w 'FINAL_URL=%{url_effective}\nHTTP_CODE=%{http_code}\nREDIRECTS=%{num_redirects}\nCONTENT_TYPE=%{content_type}\nSIZE=%{size_download}\n' https://modelcontextprotocol.io/specification/2025-11-05/basic/transports` → `FINAL_URL=https://modelcontextprotocol.io/specification/2025-11-05/basic/transports`, `HTTP_CODE=404`, `REDIRECTS=0`, `CONTENT_TYPE=text/html; charset=utf-8`, `SIZE=127278`, `EXIT=0`.
- Revision probes: `/specification/2025-11-25/basic/transports` → HTTP 200, 0 redirects; `/specification/2025-11-05/basic` and `/specification/2025-11-05` → HTTP 404, 0 redirects.
- Page fetch command: `curl -sS -o transports-2025-11-25.md.body -D transports-2025-11-25.md.headers -w 'FINAL_URL=%{url_effective}\nHTTP_CODE=%{http_code}\nREDIRECTS=%{num_redirects}\nCONTENT_TYPE=%{content_type}\nSIZE=%{size_download}\n' https://modelcontextprotocol.io/specification/2025-11-25/basic/transports.md` → final URL unchanged, HTTP 200, 0 redirects, `text/markdown; charset=utf-8`, 16321 bytes. Response `date: Tue, 27 Oct 2026 15:14:21 GMT`, `last-modified: Tue, 27 Oct 2026 15:14:22 GMT`. Body SHA256 `ae9bb7be00604a66a8f70f439ef028eced174bce4a5cb0f6fc11bbeaa625afcc`.
- Raw HTML at the canonical row URL returned HTTP 200, 0 redirects, 370036 bytes; body SHA256 `5e256f7c44f773c63af3872be03c0fe77dc0880053b7b06247fd04e25d8f1736`.
- Captured Markdown § Streamable HTTP says it replaces the HTTP+SSE transport from protocol version 2024-11-05; § Backwards Compatibility calls it “the deprecated HTTP+SSE transport” and describes the `endpoint` event fallback. Quote matching against the Markdown capture and live HTML returned `True` for both quotes in `quotes.txt` (13 and 16 words).
- Live anchor check: `curl -sS -o deprecated-live.md -w 'HTTP=%{http_code} url=%{url_effective}\n' https://modelcontextprotocol.io/specification/2026-07-28/deprecated.md` → HTTP 200. Its row 31 says HTTP+SSE `Deprecated in` is `2025-03-26`; the already-captured round-66 source `.ufo/waves/round-66/build/K66ScoutDeprecatedPage/deprecated.md:31` has the same value.
- Earlier-version corroboration fetch: `https://modelcontextprotocol.io/specification/2024-11-05/basic/transports.md` → HTTP 200, 0 redirects; extracted page text names “HTTP with SSE” and “When implementing HTTP with SSE transport”.

## Findings
1. **K68ScoutS211-1 — high; URL/revision mismatch.** The assigned 2025-11-05 path is unavailable (404, no redirect); the frozen plan explicitly labels S211 as the 2025-11-25 transports revision, which is live and captured. Reproduce with `curl -sS -o /dev/null -w '%{http_code} %{url_effective} %{num_redirects}\n' https://modelcontextprotocol.io/specification/2025-11-05/basic/transports` (observed `404 …/2025-11-05/basic/transports 0`) and repeat with `2025-11-25` (observed `200 …/2025-11-25/basic/transports 0`).
2. **K68ScoutS211-2 — high; anchor-date contradiction.** The seat's stated HTTP+SSE `Deprecated in` anchor of 2025-11-25 is not supported by the live deprecated-features table or its round-66 capture: the HTTP+SSE row says 2025-03-26. `2025-11-25` is the transports page revision date; it is also the `Deprecated in` value for the separate includeContext row. Reproduce with `curl -sS https://modelcontextprotocol.io/specification/2026-07-28/deprecated.md | grep 'HTTP+SSE transport'`.
3. **K68ScoutS211-3 — evidence.** The 2025-11-25 transports page identifies Streamable HTTP as replacing HTTP+SSE from protocol version 2024-11-05 and documents backwards-compatibility handling for the deprecated transport. The two located, <=25-word quotes are in `quotes.txt`; row draft is an 11-cell, tier-B row.

## Artifacts
- `.ufo/waves/round-68/build/K68ScoutS211/captures/transports-2025-11-05.md` — records the requested URL's 404 and response headers.
- `.ufo/waves/round-68/build/K68ScoutS211/captures/transports-2025-11-25.md` — Markdown body capture with fetched headers/metadata; whole-file SHA256 `3b17da24fd72616bf0bccabf550490698cbc70476717672d01bccc10731ccee2`.
- `.ufo/waves/round-68/build/K68ScoutS211/captures/transports-2025-11-25.html.capture` — supplementary raw HTML capture with headers/metadata.
- `.ufo/waves/round-68/build/K68ScoutS211/quotes.txt`
- `.ufo/waves/round-68/build/K68ScoutS211/row-S211.md`

## Limits
- Did not integrate or pin the draft: `corpus/`, `.ufo/pins/`, and the registry entry are integration-owner scope.
- Did not run the round counter or verify any other S207–S213 source rows.
- The task's requested 2025-11-05 revision cannot be captured as a successful page; the supplied build artifact preserves its 404 evidence and separately captures the plan-named 2025-11-25 page.

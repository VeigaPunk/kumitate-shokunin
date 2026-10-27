# S211 candidate row — SEP-2577 (prepared lane id; ids re-assigned by L1, keyed by URL)

Source opened live 2026-10-27. Two captures kept beside this file:

- `sep2577-page.html` — https://modelcontextprotocol.io/seps/2577/ (the row's proposed URL) — HTTP 200, 417527 bytes, sha256 16a85d87a4be5626721b8d358bbaecf3159025636a64f275058076b339577a9c
- `sep2577-pr.html` — https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2577 — HTTP 200, 488061 bytes, sha256 75c9976668fdea6e27ace04e972bd676e64a11a8df4b9538aa236611bb22fe83
- `sep2577-api.json` — https://api.github.com/repos/modelcontextprotocol/modelcontextprotocol/pulls/2577 — HTTP 200, 29240 bytes, sha256 28f995da185bc7361d2b6a4d6fa6456edc162c204a56910773afeb6d1f15199d

## Why the stable URL is preferred for the row

`https://modelcontextprotocol.io/seps/2577/` exists (HTTP 200), is the canonical rendered SEP:
title "SEP-2577: Deprecate Roots, Sampling, and Logging", banner "This SEP has reached
Final status and is preserved as a historical record of the design as accepted."
(capture line 108). The GitHub PR page (`pull/2577`, title "SEP-2577: Deprecate Roots,
Sampling, and Logging", state closed, merged_at 2026-05-15T22:23:10Z, labels SEP+final, API
JSON `html_url`) is mutable UI over the same document; the PR remains provenance, quoted in
the anchor cell.

## Row draft (11 cells, corpus/SOURCES.md `## Registry` schema)

| S211 | SEP-2577: Deprecate Roots, Sampling, and Logging — https://modelcontextprotocol.io/seps/2577/ | spec | A | what SEP-2577 deprecates — Roots (roots/list, notifications/roots/list_changed), Sampling (sampling/createMessage, ClientCapabilities.tasks.requests.sampling), Logging (logging/setLevel, notifications/message) — and why: low adoption, vague or overlapping semantics, disproportionate implementation burden, plus the one-year-per-version support window before removal | § Abstract (deprecated feature list and one-year window, capture line 580-598) and § Timeline (Deprecation / Per-version support / Removal, capture lines 736-739); SEP Final, created 2026-04-14, accepted via PR #2577 merged 2026-05-15 (per API JSON); capture 2026-10-27, HTTP 200, 417527 bytes, sha256 16a85d87a4be5626721b8d358bbaecf3159025636a64f275058076b339577a9c | grounds the registry entry's claim that Roots, Sampling and Logging are deprecated by SEP-2577 with advisory-only wire behavior, unchanged capability negotiation, and per-feature rationale; the June 2026 release the SEP anticipated shipped as specification 2026-07-28 (sibling row on /specification/2026-07-28/deprecated carries the landed notices) | mined | 2026-10-27 | 180d | corpus/knowledge/mcp-deprecation-registry.md |

Row validation (run on the draft line above, copied to /fast scratch):

```
awk -F'|' 'NF!=13{n++} END{print "bad-rows=" n+0}' row.txt   -> bad-rows=0
```

11 cells -> NF=13; no `|` inside any cell; kind `spec` (enum-legal), tier `A` (spec row,
community-inflation rule not triggered), status `mined`, opened 2026-10-27, recheck `180d`,
used-by `corpus/knowledge/mcp-deprecation-registry.md`.

Note for the L1 integrator: the seat scope says "deprecates Roots, Sampling and Logging in
2026-07-28"; the SEP capture itself says the deprecating release was "expected June 2026"
(capture line 588). The 2026-07-28 landing is corroborated by the frozen C2 counter's own
references (deprec66-probe.mjs M4 requires a quote containing `2026-07-28` from a sibling
row, M6 a `/specification/2026-07-28/deprecated` capture), not by this row's capture — the
row text above is phrased so its own teaches cell stays grounded in its capture while
pointing at the sibling row for the landed date.

## Located quotes (verbatim from sep2577-page.html; line numbers are raw capture lines)

1. Capture line 580: "This SEP deprecates the following core protocol features:" (8 words)
2. Capture lines 600-602: "Features that see low adoption, overlap with existing alternatives, or impose disproportionate implementation burden relative to their value are candidates for removal." (22 words)
3. Capture lines 597-598: "The deprecation serves as a signal to the ecosystem to stop building on these features and to plan for their eventual removal." (22 words)
4. Capture lines 738-739: "Specification versions released more than one year after this version's release MAY remove these features entirely." (16 words)

(Quote 4's apostrophe is U+2019 in the raw bytes; the frozen norm() maps it to '.)

## norm() verification (frozen deprec66-probe.mjs norm, run as a node one-liner over sep2577-page.html)

```
{"found":true,"words":8, "quote":"This SEP deprecates the following core protocol features:..."}
{"found":true,"words":22,"quote":"Features that see low adoption, overlap with existing altern..."}
{"found":true,"words":22,"quote":"The deprecation serves as a signal to the ecosystem to stop ..."}
{"found":true,"words":16,"quote":"Specification versions released more than one year after thi..."}
```

Fresh live re-fetch of https://modelcontextprotocol.io/seps/2577/ (M5 analog), HTTP 200:
all four quotes LIVE-FOUND, exit 0 (LIVE-CHECK-PASS).

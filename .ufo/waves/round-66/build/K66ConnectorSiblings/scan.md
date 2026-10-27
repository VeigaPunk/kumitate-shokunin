# Sibling overlap scan — K66ConnectorSiblings

Scope: 20 sibling `*-shokunin/corpus/` trees (kumitate excluded); queried local repository only.

## Deprecation overlap

- Searches for `SEP-2596`, `SEP-2577`, `feature-lifecycle`, `HTTP+SSE`, and `deprecation registry` returned `No matches found` across the sibling corpora. A sibling corpus file-name glob for `deprecated*.md` / `*deprecat*.md` also returned no files.
- Result: no evidence found that another lane holds an entry on the named MCP deprecation topics. In particular, no overlap evidence implicates kasegi/kagi. This is a bounded keyword scan; it does not establish absence under different wording.

## Routed defects / recurrence

- Broad corpus scan for `routed|recurrence|ledger|deprecat|SEP-2596|SEP-2577|Roots|Sampling|Logging|HTTP+SSE` surfaced extensive ledger/recurrence material in `audio-shokunin/corpus/`, notably `corpus/lessons/round-101.md:7-25` (mistake ledger M1–M20) and `corpus/fixtures/measure_audio.py:183-187` (transport ledger family), plus its repeated probe-family ledger sections. These are audio measurement/fixture-specific, not a routed-defect ledger evidently aligned to kumitate's round spot-checks.
- `audio-shokunin/corpus/README.md:81` explicitly says round discoveries remain scattered through its ledger, reports and receipts rather than individual knowledge pages.
- No claim that the broad scan exhaustively enumerated all ledger-like structures: grep's output was capped after the audio corpus's many hits.

## C2 boundary

Kumitate `PROVINCE.md:26-29` classifies MCP/OAuth security practice (token passthrough, confused deputy) as adjacent and routes it to kasegi/kagi. The found sibling material is unrelated to that security boundary; the proposed C2 deprecation registry does not absorb another lane's ground based on this scan.

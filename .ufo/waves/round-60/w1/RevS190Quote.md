# RevS190Quote — S190 (Tail at Scale) live-page located-quote check

- round: kumitate 60, wave w1, seat `RevS190Quote` (revenger role, leaf — no seats dispatched)
- axes judged on: operability, coverage
- item under test: `corpus/knowledge/durable-execution-and-fanout-primitives-2026-10-24.md` line 15,
  the S190 located quote, re-opened live on 2026-10-24 at
  `https://research.google/pubs/the-tail-at-scale/`
- declared attacks: (1) the quote is not carried by the page; (2) the quote is longer than 25 words
- scratch: `/tmp/kumitate-r60/RevS190Quote/` — the only lane write is this report

## Fetched artifact

Command (run 2026-10-24):

```
curl -sS -L --max-time 45 'https://research.google/pubs/the-tail-at-scale/' -o page.html \
  -w 'HTTP %{http_code} final=%{url_effective}\n' && wc -c page.html && sha256sum page.html
```

Output:

```
HTTP 200 final=https://research.google/pubs/the-tail-at-scale/
143176 page.html
399be231120943041eef0f7909a42cffae339f67b8c3aa85d8e0a05b4c8ee63e  page.html
```

- byte size: **143176**
- sha256: **399be231120943041eef0f7909a42cffae339f67b8c3aa85d8e0a05b4c8ee63e**

## Attack 1 — quote the page does not carry: REFUTED

Python over the fetched bytes (`/tmp/kumitate-r60/RevS190Quote/page.html`):

```
RAW_CONTIGUOUS: True
CONTEXT: 'scales up or as overall utilization increases. Temporary high latency episodes which are unimportant in moderate size systems may come to dominate overall service performance at large scale. Just as fault-tolerant computing aims to create a reliable whole out of less reliable parts, we suggest that large online services need to create a predictably responsive whole out of less predictable parts. We refer to such systems as latency tail-tolerant, or tail-tolerant for brevit'
```

The quoted fragment — `large online services need to create a predictably responsive whole out of
less predictable parts` — is a contiguous substring of the **raw** fetched HTML (single-space
exact match; no whitespace normalization or tag stripping needed), inside the abstract paragraph
of the pub page. The entry's `§Abstract` attribution holds. Note for fidelity: the page's full
sentence carries `we suggest that` between the two clauses; the quoted fragment is exact as
printed and is a clause of that sentence, not the whole sentence.

## Attack 2 — quote longer than 25 words: REFUTED

Two independent counts:

```
WORDS: 15                      (python len(needle.split()))
15                             (printf '%s' "<quote>" | wc -w)
```

15 words ≤ 25. Both attacks fail to fire.

## Exact located sentence on the live page

```
Just as fault-tolerant computing aims to create a reliable whole out of less reliable parts, we suggest that large online services need to create a predictably responsive whole out of less predictable parts.
```

(Extracted from the whitespace-normalized page text by expanding to sentence boundaries around
the matched fragment; command and output above.)

## Corroboration of the pinned capture receipt

```
399be231120943041eef0f7909a42cffae339f67b8c3aa85d8e0a05b4c8ee63e  .ufo/waves/round-60/build/ScoutTailAtScale/body.html
cmp page.html .ufo/waves/round-60/build/ScoutTailAtScale/body.html && echo BYTE_IDENTICAL
→ BYTE_IDENTICAL
```

Today's live fetch is **byte-identical** to the capture receipt pinned at entry line 12
(`receipt:.ufo/waves/round-60/build/ScoutTailAtScale/body.html@sha256:399be231…8ee63e`): same
sha256, `cmp` exit 0. The receipt was not fabricated and has not drifted since capture.

## Verdict

**Corroborated.** The S190 located quote is carried verbatim by the live page as a raw
contiguous substring of the abstract, is 15 words (within the 25-word bound), and the lane's
pinned capture equals the live bytes byte-for-byte.

## Erratum for the lane (append; entries are append-only)

The entry labels the quote `(13 words)`; the actual count is **15** (python `split()` and
`wc -w` agree). No D60 check (F1–F6) reads the word-count parenthetical and both numbers sit
inside the ≤ 25 bound, so the predicate is unaffected — but the label should be corrected by a
dated append (LOG.md or an errata entry), not a rewrite.

## Scope statement

No fleet-repo, sibling-lane, or `shokuknow` writes; no git/jj mutations (read-only `sha256sum`/
`cmp` on a lane file only); no seat dispatched, resumed, or replaced; no pacman; no model or
provider set. Scratch confined to `/tmp/kumitate-r60/RevS190Quote/`.

Report: .ufo/waves/round-60/w1/RevS190Quote.md

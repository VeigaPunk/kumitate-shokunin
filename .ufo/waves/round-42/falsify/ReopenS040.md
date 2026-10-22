RESULT ReopenS040 rev=- verdict=agree quotes=3/3

# ReopenS040 — S040 reopened: arXiv 2102.11378v2 abstract and PDF

Attacked: the S040 row (`corpus/SOURCES.md:53`, byte-identical at the measured commit
c9a084bf03fb043d3cce5da102fffbc023552a45) and the Gate sentence that admits it
(`corpus/lessons/round-42.md:49-53`): the §4 opening-paragraph quote on page 6, the v2 date
(26 Feb 2021), and the claim of no published-venue metadata in the arXiv record. Reopened by
plain `curl` over HTTPS: no browser, no challenge bypass, no account. The lane repo was
read-only; the only lane write is this report. Scratch is
`/fast/scratch/hyaku/kumitate-r42/falsify/ReopenS040/`. No pacman (transactions paused), no
installs, no processes left running.

## Match per item

| item | claimed | observed | match |
|---|---|---|---|
| Gate quote, §4 opening paragraph, p. 6 | "First, only mutants that survive … resources." | exact after dehyphenation; PDF page 6, inside §4's opening paragraph | yes |
| v2 date | 26 Feb 2021 | abs online date 2021/02/26; v2 uploaded Fri, 26 Feb 2021 15:53:03 UTC; PDF stamp "26 Feb 2021" | yes |
| no venue metadata | none in the arXiv record | 0 `arxiv:journal_ref` and 0 `arxiv:doi` in the API record; 0 "Journal reference"/`jref` rows on the abs page; only DOI is 10.48550/arXiv.2102.11378 (DataCite, arXiv's own) | yes |
| PDF digest | a9bdf44159a7b8a6f4b77d7e347650e52d9915bf68f765ff5333f7feee56a081 | recomputed identically | yes |
| quote word count | 21 | 21 | yes |
| second anchor §3.2.1 p. 5 | anchor exists there | sentence found on page 5 under the 3.2.1 heading | yes |
| second anchor §4.1 p. 7 | anchor exists there | sentence found on page 7 before the 4.2 heading | yes |
| title, authors | Petrović, Ivanković, Fraser, Just: Practical Mutation Testing at Scale — A view from Google | PDF p. 1: same four authors, title line plus subtitle line | yes |

## Evidence

1. `curl -sS -D abs.hdr -o abs.html https://arxiv.org/abs/2102.11378v2` → `abs http=200 size=45043`;
   headers `date: Thu, 22 Oct 2026 21:03:32 GMT`, `last-modified: Mon, 24 Aug 2026 19:56:58 GMT`,
   `content-type: text/html; charset=utf-8`.
2. `curl -sS -D pdf.hdr -o paper.pdf https://arxiv.org/pdf/2102.11378v2` → `pdf http=200
   size=728951`; `content-type: application/pdf`, `last-modified: Mon, 23 Jan 2023 08:47:39 GMT`.
3. `sha256sum paper.pdf` → `a9bdf44159a7b8a6f4b77d7e347650e52d9915bf68f765ff5333f7feee56a081`;
   this equals the row's digest and the wave-1 scribe report's digest, so the reopening tests the
   same bytes the row was drawn from.
4. `pdfinfo paper.pdf` → `Pages: 22`, `PDF version: 1.5`, `CreationDate: Sun Feb 28 22:51:25 2021
   -03`. (`file` guessed "5 page(s)"; pdfinfo and the 22 form feeds in the extraction agree on 22,
   so the guess is discarded.)
5. `pdftotext -f 6 -l 6 paper.pdf p6.txt`, whitespace collapsed → `page6 contains quote: True`;
   within page 6 the §4 heading sits at character 3144 and the quoted sentence at 3353, i.e. in
   §4 "Mutant selection criteria"'s opening paragraph.
6. `pdftotext -raw` at the sentence → `First,\nonly mutants that survive the tests can be shown to
   devel-\nopers, whereas those that are killed just use computational\nresources.` The only
   difference from the Gate quote is the typeset line-break hyphen in "devel-opers" (soft-hyphen
   count 0); dehyphenated it is the same 134-character string.
7. Whole-document count: `re.sub(r'\s+',' ',text).count(quote)` → `1`; the sentence occurs once in
   22 pages.
8. `len(quote.split())` → `21`, matching the Gate's "(21 words)".
9. PDF page 1: `arXiv:2102.11378v2 [cs.SE] 26 Feb 2021`; `Practical Mutation Testing at Scale` /
   `A view from Google`; `Goran Petrović, Marko Ivanković, Gordon Fraser, René Just`.
10. abs page submission history: `[v1] Mon, 22 Feb 2021 21:58:59 UTC (312 KB)`, `[v2] Fri, 26 Feb
    2021 15:53:03 UTC (312 KB)`; page states `last revised 26 Feb 2021 (this version, v2)` and
    `citation_online_date" content="2021/02/26"`.
11. arXiv API `https://export.arxiv.org/api/query?id_list=2102.11378` → `http=200`; entry
    `published = 2021-02-22T21:58:59Z`, entry `updated = 2021-02-26T15:53:03Z`,
    `arxiv:comment = This work has been submitted to the IEEE for possible publication`;
    `grep -c 'arxiv:journal_ref\|arxiv:doi' api.xml` → `0`.
12. abs.html field counts → `Journal reference 0`, `jref 0`, `Related DOI 0`, `citation_doi 0`;
    the only DOI on the page is `10.48550/arXiv.2102.11378` in the DataCite block, arXiv's own
    identifier, not a venue.
13. Second anchor §3.2.1: whitespace-collapsed page 5 contains "A mutant should be a syntactically
    valid program— otherwise, it would be detected by the compiler and not add any value for
    testing."; page 5 also carries the heading `3.2.1 Heuristics to Prevent Uncompilable Mutants`.
14. Second anchor §4.1: whitespace-collapsed page 7 contains "only a single mutant in a line is
    ever produced, all others are not considered."; `4.2 Targeted Selection` follows it on page 7
    and `4.1 Random Selection` heads on page 6, so the sentence sits at the end of §4.1.
15. Row identity at the measured commit: my scratch clone checked out `c9a084bf03fb043d3cce5da1
    02fffbc023552a45` (`git rev-parse HEAD`), and the S040 row there is byte-identical to the
    working-tree row (`row identical at c9a084bf: True`, 1042 bytes).
16. `node scripts/sources-check.mjs` in that clone → `SOURCES_CHECK: CLEAN (rows=45 tiers=A:42,B:1,
    C:2 status=queued:14,mined:26,rejected:5 entries_with_source=3 legacy=38)`.
17. Timestamp plausibility: host TZ is America/Sao_Paulo (-03), so the row's `opened
    2026-10-22T19:56:55Z` is 16:56:55 local, about one hour before my independent fetch at 20:59Z;
    the regenerated bytes hash identically, so the claim reproduces.
18. DBLP search API for the title returned HTTP 202 with an anti-bot page ("Making sure you're not
    a bot!"); recorded UNOPENED under the sourcing rule, with no attempt to pass it. I therefore
    make no claim about a later published version; the row's claim is scoped to the arXiv record
    and is true as scoped.

## Observations that do not falsify the row

- The wave-1 scribe wrote "the sentence occurs exactly once in the extracted text (`grep -c` =
  1)"; a literal one-line `grep -c` on the default extraction returns `0` because the sentence
  wraps after "First," and after "computational". The count is 1 only after newline collapsing,
  which is how the anchor was drawn. Evidence formatting, not wording.
- The PDF hyphenates "devel-opers" across a line break; default `pdftotext` rejoins it, `-raw`
  keeps the hyphen. The Gate quote dehyphenates, which is standard quoting practice and leaves
  every word unchanged.
- The abs metadata title is only "Practical Mutation Testing at Scale"; the subtitle "A view from
  Google" is on the PDF title page, so the row's source string is supported by the PDF and not by
  the abs metadata.
- The row's used-by lists only `corpus/lessons/round-42.md`, while `SCORECARD.md:410` and
  `LOG.md:1845` also cite S040. `sources-check` still reports CLEAN (no `USED_BY_ASYMMETRY`), so
  this is bookkeeping narrowness, not a false claim.
- The Gate's paraphrase "at-scale precedent for running mutants against an existing suite as a
  standing review signal, with surviving mutants as the findings" is wider than the quoted
  sentence alone, but the wider gloss is on the paper: p. 1 "Mutation testing is done
  incrementally, mutating only changed code during code review"; p. 2 "started when developers
  send changelists for code review"; p. 3 "Surviving mutants are surfaced as code findings". The
  quote is an anchor, not the whole warrant, and the row's teaches cell tracks those statements.

Verdict: `agree`. The Gate quote, its section and page, the v2 date, the digest and the absence of
published-venue metadata in the arXiv record all reproduce exactly; 3/3 quoted anchors and 2/2
row metadata claims match. No falsification found.

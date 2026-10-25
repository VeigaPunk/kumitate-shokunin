# Audit16 — Quarantine-S118

## Counterexample

The register's S118 `payload-absent` verdict is falsified: its cited arXiv abstract page need not contain the quoted title for the quote to occur in the cited document's e-print capture. Reopening DOI `10.48550/arXiv.2609.29095` through the local `aaron papers fetch … -m arxiv` paper tool returned `format=latex`; the capture contains the exact register quote once:

```
\\title{Where Does Exactly-Once Live?\\ Model, Harness, and Tool-Contract Effects\\ on Duplicate Side Effects in LLM Agents}
```

The title is the same work as lane `S134` (`corpus/SOURCES.md:143`), arXiv 2609.29095 by Jiapeng Li. Staging independently ties the register entry to staged S204: `shokuknow/lanes/kumitate/SOURCES-PROPOSED.md:21` gives the same arXiv URL and DOI fetch method, while lines 97–103 record S204's Gate and title-page locator. The register row itself is `shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md:138`.

Reproducible local capture check: from `/home/vgpnk/Projects/shokuknow`, `aaron papers fetch 10.48550/arXiv.2609.29095 -m arxiv > /tmp/audit16-aaron.json`; JSON decoded with Python, `format` is `latex`, and exact title-quote count is **1**. This directly distinguishes source-document capture from the abstract rendering: absence on the abstract page does not establish payload absence in the e-print.

## Evidence and impacted axes

- `shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md:138` — register's quoted title and alleged absence, DOI source URL.
- `shokuknow/lanes/kumitate/SOURCES-PROPOSED.md:21,97-103` — same arXiv document as staged S204 and its title-page Gate.
- `kumitate-shokunin/corpus/SOURCES.md:143` — lane S134 identifies arXiv 2609.29095 as the already-held document.
- Fresh local aaron capture: exact `\\title{...}` quote appears once in its LaTeX `text` field.

Impacted axis: **discernment** (payload-absence screening confuses an abstract-page surface with the e-print/document payload). This is a fixable source-verification defect, not evidence that the paper or quote is fabricated. It does not establish any broader verdict or round-62 claim.

## Smallest safe correction

Correct the register's S118 verdict to **present** on document identity and e-print evidence, and document that the title-page quote is in the arXiv LaTeX capture even though it is absent from the abstract rendering. Do not add another source row: lane S134 already identifies this document.

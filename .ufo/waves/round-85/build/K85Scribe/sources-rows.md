# Registry rows for round 85 — S245 (admit) and S246 (reject)

Draft rows for L1 to append to `corpus/SOURCES.md`, in the registry's 11-column shape
(`id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by`).
Both source ids are reserved for this round. Two notes for the integrator:

- The registry's `used-by` cell is checked against paths that exist on disk
  (`scripts/sources-check.mjs` `USED_BY_MISSING`), so the S245 `used-by` cell names the
  knowledge note's **integrated** path, `corpus/knowledge/counter-receipt-discrimination.md`.
- `scripts/source-capture.mjs` requires every registry id to resolve to exactly one capture or
  exemption. S245's capture is the committed
  `.ufo/waves/round-85/build/L1/arxiv-2212.06118.html` (43275 B, sha256 `838d0715…`); S246 is
  already listed as an exemption ("rejected row: the ACM DL listing returned HTTP 403 on
  2026-11-04, so no capture bytes exist").

## S245 — admit

| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |
|---|---|---|---|---|---|---|---|---|---|---|
| S245 | Hossain & Dwyer, *A Brief Survey on Oracle-based Test Adequacy Metrics* — https://arxiv.org/abs/2212.06118v3 | paper | A | Test adequacy: a coverage measure says nothing about the quality of the test oracle | § Abstract, arXiv:2212.06118v3 [cs.SE] 15 Feb 2023; fetched 2026-11-04; capture .ufo/waves/round-85/build/L1/arxiv-2212.06118.html (sha256 838d0715, 43275 B); located quote (19 words) "it does not provide any insights into the quality or quantity of test oracles, a core component of testing" | A suite's coverage counts executed code, not the oracle that judges it; an untrusted oracle makes the number meaningless | mined | 2026-11-04 | 180d | corpus/knowledge/counter-receipt-discrimination.md, corpus/lessons/round-85.md |

Verification notes for the quote, so the row's anchor is re-derivable rather than asserted:

- The quoted string occurs **3 times** in the committed capture and **3 times** in an
  independent fetch of the versioned URL (that fetch: 42130 B, sha256 `ebc79620…`, re-fetch
  byte-identical). It is byte-contiguous in both (a plain `grep -F` finds it), so the row's
  quote can be re-located with `grep -c -F` against the capture.
- The string is **absent from the v1 and v2 abstracts** of the same paper (both were fetched on
  2026-11-04; `grep -c -F` = 0 for each). The anchor therefore names **v3** specifically: an
  unversioned fetch resolves to the latest abstract, which is v3, but a v1/v2 quote would be
  unfindable.
- Word count by `wc -w` over the quoted bytes is **19** (≤ 25).
- The plan's `## Frontier step` names the paper as "*Oracle-based Test Adequacy Metrics: A
  Survey*"; the arXiv record's own `citation_title` is "*A Brief Survey on Oracle-based Test
  Adequacy Metrics*". The registry cell carries the title as printed on the record, per the
  `SOURCES-CONTRACT-v1` `source` cell ("title — canonical URL or DOI").

## S246 — reject

| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |
|---|---|---|---|---|---|---|---|---|---|---|
| S246 | Barr, Harman, McMinn, Shahbaz, Yoo — The Oracle Problem in Software Testing: A Survey — https://dl.acm.org/doi/10.1109/TSE.2014.2372785 | paper | A | The canonical oracle-problem survey, considered as sole support for the discrimination entry | DOI 10.1109/TSE.2014.2372785; fetch attempted 2026-11-04 returned HTTP 403 with no located text | REJECTED: no locatable sentence at the source; an unopened listing is not evidence; flip: an accessible full text with a locatable sentence | rejected | 2026-11-04 | 365d | corpus/lessons/round-85.md |

Verification notes for the reject:

- `https://dl.acm.org/doi/10.1109/TSE.2014.2372785` on 2026-11-04: **HTTP 403**, 5581 B of
  Cloudflare "Just a moment…" interstitial (`sha256 db04737d…`). The `/doi/abs/` and
  `exportCiteProcCitation` paths on the same host also return 403.
- `https://doi.org/10.1109/TSE.2014.2372785` resolves (302) to
  `http://ieeexplore.ieee.org/document/6963470/`, which answers HTTP 202 with an empty body from
  this host — again no locatable text.
- The Crossref metadata record for the DOI (`api.crossref.org/works/10.1109/TSE.2014.2372785`,
  HTTP 200) confirms the bibliographic identity — Barr, Harman, McMinn, Shahbaz, Yoo, *The Oracle
  Problem in Software Testing: A Survey*, IEEE TSE 41(5):507–525, 2015 — but metadata is not a
  located sentence, so it does not lift the reject. The reject is scoped to the ACM DL listing as
  sole support, exactly as the plan's `## Frontier step` states; the flip condition is copied
  verbatim from the plan and is unchanged by this draft.

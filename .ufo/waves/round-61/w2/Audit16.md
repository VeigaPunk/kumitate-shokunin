# Audit16 — Quarantine-S118: e-print capture vs abstract absence, S118 ↔ S134 document comparison

**Seat:** `L1Kumitate61.Audit16` (critic, leaf). **Target artifact:** register row
`kumitate round1 S118` (`payload-absent`) in `/home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md`.
**Question:** does the register's S118 quote occur in the e-print capture of arXiv 2609.29095,
despite being absent from the abstract page? Is the S118 cited source the same document as lane
S134?

**Verdict: YES — the quote occurs verbatim in the e-print capture (`main.tex:22`), and the
abstract page does not carry the literal. S118's cited source and lane S134 are the same
document (arXiv id + title + author + byte-identical abs-page hash). The register's
`payload-absent` class for S118 is a FALSE ABSENT** — the census never fetched the e-print;
its verdict is correct only for the abstract page it did fetch. This independently confirms
wave-1 `ScoutQuarantineRegister`'s "present" verdict for S118.

## 1. The register row (verified, hash-pinned)

`absent-defect-register.md:138`:
`| kumitate | round1 | S118 | payload-absent | https://arxiv.org/abs/2609.29095 | \title{Where Does Exactly-Once Live?\\ Model, Harness, and Tool-Contract Effects\\ on Duplicate Side Effects in LLM Agen | cited source, companion URLs and local artifacts were all checked; the quote is in none of them |`

- Register file sha256 `5afe1810a6c3d62f37987b575a954f5b1197daa23005d4bb2f1d982f64bad833`, 83,621 bytes
  (verified this seat — matches wave-1 provenance).
- Backing census record `quote-lint-full-v5.json` → `{lane: kumitate, round: round1, id: S118,
  verdict: ABSENT, fold: null, quote: "\title{Where Does Exactly-Once Live?\\ Model, Harness, and
  Tool-Contract Effects\\ on Duplicate Side Effects in LLM Agents}", url: https://arxiv.org/abs/2609.29095,
  binding: id}`. `fold: null` = none of the census's eleven match folds fired.

## 2. Document identity (D118 ↔ S134 — by DOI/document, not by id)

| namespace | row | evidence |
|---|---|---|
| campaign register | S118 (round1) | `absent-defect-register.md:138`, URL `https://arxiv.org/abs/2609.29095` |
| kumitate lane registry | **S134** | `corpus/SOURCES.md:143` — same title, `arXiv 2609.29095 (Jiapeng Li, Microsoft)`, anchor `§ Title page`, abs page read 2026-10-24, HTTP 200, 44,818 bytes, sha256 `90637c52…` |
| staged / merge | S204 (gate quote = the `\title{…}` line), S211 (gate quote = abs-page abstract) | `lanes/kumitate/SOURCES-PROPOSED.md:21` + gate block `:100-102` (`location: § Title page (tarball via \`aaron papers fetch 10.48550/arXiv.2609.29095 -m arxiv\`; meta.tarballBytes 112394)`); `round2/SOURCES-PROPOSED.md:15` (S211) |

Document binding, all verified this seat:

- **arXiv id**: register URL and lane S134 source cell both name `2609.29095`; live abs page
  `citation_arxiv_id content="2609.29095"`.
- **DOI**: live abs page carries `10.48550/arXiv.2609.29095` (arxiv `citation_doi`), which is
  exactly the DOI used by the staged S204 gate's `aaron papers fetch 10.48550/arXiv.2609.29095 -m arxiv`.
- **Title**: identical in register quote, lane S134 source cell, and live abs page `citation_title`.
- **Author**: live abs page `citation_author content="Li, Jiapeng"`; e-print `main.tex` `\author{\name Jiapeng Li \email jiapengli@microsoft.com …}` — matches lane S134's `(Jiapeng Li, Microsoft)`.
- **Bytes**: live abs-page re-fetch sha256 `90637c52c11e8c8f1d0264037ca5f4a51d62875f650070c804fed0634b0ad1c3`
  — byte-identical to lane S134's pinned abs-page hash, so the lane's capture and the register's
  cited source are the same live document with zero drift.

Same document: confirmed. (The canonical DOI is the 10.48550/arXiv mirror DOI; neither S118 nor
S134 spells a DOI in its source cell, so arXiv-id + title + author + byte hash is the binding.)

## 3. Re-fetch (this seat, live, 2026-10-25)

```
$ curl -sSLo eprint-2609.29095.gz -w 'HTTP %{http_code} %{size_download} bytes\n' https://arxiv.org/e-print/2609.29095
HTTP 200 112394 bytes            # == meta.tarballBytes 112394 (S204 gate block)
$ file eprint-2609.29095.gz     # gzip compressed, original size 327,680
$ tar xzf eprint-2609.29095.gz -C eprint/
$ curl -sSLo abs-2609.29095.html -w 'HTTP %{http_code} %{size_download} bytes\n' https://arxiv.org/abs/2609.29095
HTTP 200 44818 bytes            # == lane S134's pinned abs-page size
$ sha256sum abs-2609.29095.html
90637c52c11e8c8f1d0264037ca5f4a51d62875f650070c804fed0634b0ad1c3   # == lane S134 pinned hash
```

## 4. Quote presence in the e-print capture — YES, verbatim

```
$ grep -n 'title{' eprint/main.tex
22:\title{Where Does Exactly-Once Live?\\ Model, Harness, and Tool-Contract Effects\\ on Duplicate Side Effects in LLM Agents}
$ grep -Fc '\title{Where Does Exactly-Once Live?\\ Model, Harness, and Tool-Contract Effects\\ on Duplicate Side Effects in LLM Agen' eprint/main.tex
1
```

- The register's quoted span (truncated at `…LLM Agen`) is a substring of `main.tex:22`; the full
  quote `\title{Where Does Exactly-Once Live?\\ Model, Harness, and Tool-Contract Effects\\ on
  Duplicate Side Effects in LLM Agents}` is present exactly once.
- `\title{` count in the whole tarball = 1 (`tmlr.sty` only *defines* `\def\@title{}`; the
  title instance is unique to `main.tex`).
- Author block on the same line follows immediately (`\author{\name Jiapeng Li …}`), confirming
  this is the document's title page.

## 5. Absence on the abstract page — confirmed, and it is expected

```
$ grep -Fc '\title{' abs-2609.29095.html     # 0
$ grep -c '\\title' abs-2609.29095.html      # 0
$ grep -c 'Where Does Exactly-Once Live?' abs-2609.29095.html   # 11 (title text, no LaTeX wrapper)
```

- The abs page carries the title text 11 times (`<title>`, `citation_title`, heading, breadcrumb…)
  but never the literal `\title{…}` LaTeX command. `grep -c '25,930 episodes'` = 3 (S211's
  abstract quote — consistent with wave-1).
- Fold ladder probe (I re-ran the census's eleven folds from `quote-lint.py:639-694` against the
  census's own cached abs-page text): **all eleven return False**. So the census's ABSENT verdict
  is *internally correct for the document it examined*.

## 6. Why the register's "all checked" note is false — the e-print was never fetched

- **Cache audit** (`.qcache/`, sha256-prefixed filenames): only `https://arxiv.org/abs/2609.29095`
  has entries (`3554c1020ed7141f345538f9.{raw,txt}`, raw 44,818 B). No cache entries exist for
  `https://arxiv.org/e-print/2609.29095`, `/pdf/`, or `/html/`.
- **Code path**: `quote-lint.py` `companion_urls()` (lines 192-230) derives companions only from
  sibling filenames in the row's source cell, J-STAGE `_article/`→`_pdf/`, and own-work
  repo-root URLs. There is no arXiv `e-print/` derivation — no code path would ever fetch the
  tarball. The gate block the census parsed also names `https://arxiv.org/abs/2609.29095` as
  `url`, so the primary doc was the abs page.
- Consequence: the register's blanket note "cited source, companion URLs and local artifacts were
  all checked; the quote is in none of them" overstates the check. For S118, only the abs page
  was checked; the quote lives in the e-print the census never looked at. The register's
  `payload-absent` = "the fabrication class" classification is therefore wrong for this row.

## 7. Impacted axes

- **Operability**: re-fetch and extraction fully reproducible (curl exits 0; e-print bytes,
  abs-page bytes, and abs-page sha256 all match recorded metadata). The census tool itself is
  healthy for what it fetches; its arXiv companion coverage is the gap.
- **Coverage**: S118's true verdict is **present** (in the e-print capture), confirming wave-1
  `ScoutQuarantineRegister` (row "present", tarball 112,394 bytes, `\title` count 1). The
  same-document binding to lane S134 holds. The interesting secondary defect — lane S134's source
  cell carries no URL (locator-less), which is why the dup-ratchet cannot see the S134/S204/S211
  triple — was already established in wave-1 and is out of scope for this seat.

## Minimal safe correction

Not applied (read-only audit): the register's S118 row should be re-classified out of
`payload-absent` — either by fetching the e-print in the census (add an arXiv `e-print/`
companion derivation in `companion_urls()`), or by marking the row verified-present with the
`main.tex:22` anchor. The register note should not claim "all checked" while the e-print was
never fetched.

## Bounds observed

Read-only over the campaign register/census and the lane tree; no edits to lane production files,
gate scripts, SOURCES, or scorecard; no subagents/background jobs; no package installs. Scratch
only under `/tmp/kumitate-r61/Audit16/`. Commands used: `curl` (live re-fetch), `file`,
`tar`, `sha256sum`, `grep`, `python3` (fold-ladder probe), `stat`.

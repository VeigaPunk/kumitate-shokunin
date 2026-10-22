RESULT ScribeSourcesRows rev=b237e3f09c9559e130c7367bd2efa981c4ea516f verdict=drafted rows=1

# ScribeSourcesRows — round 42 build, S039 row draft for C1

I opened the primary mutation-testing source for C1 myself (Petrović, Ivanković, Fraser, Just,
"Practical Mutation Testing at Scale — A view from Google", arXiv:2102.11378v2, 26 Feb 2021) by
ordinary HTTPS, drew one registry row and one `## Gate` entry, and checked the row against
`scripts/sources-check.mjs` in my own clone. The lane files were read-only to me; the only lane
write is this report. The row text below is the deliverable.

## What was opened

- URL `https://arxiv.org/abs/2102.11378v2` (abstract) and `https://arxiv.org/pdf/2102.11378v2`
  (full paper). Direct fetch, no bot challenge, no access control, no browser.
- Bytes: PDF 728951 bytes, sha256 `a9bdf44159a7b8a6f4b77d7e347650e52d9915bf68f765ff5333f7feee56a081`,
  file mtime 2026-10-22T19:56:55Z. First page stamp `arXiv:2102.11378v2 [cs.SE] 26 Feb 2021`.
- arXiv API record (`https://export.arxiv.org/api/query?id_list=2102.11378`, HTTP 200, fetched
  2026-10-22) carries `<arxiv:comment>This work has been submitted to the IEEE for possible
  publication`, `published 2021-02-22`, `updated 2021-02-26`, and **no** `arxiv:journal_ref` and
  **no** `arxiv:doi`. The row therefore claims no peer-reviewed venue.
- Text extraction: `pdftotext` (poppler) in plain and `-layout` modes; page locators were measured
  by counting form feeds in the extraction, so they are PDF page numbers, not printed folios.

## Draft registry row (for `corpus/SOURCES.md`, next free id S039)

| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |
|---|---|---|---|---|---|---|---|---|---|---|
| S039 | Petrović, Ivanković, Fraser, Just: Practical Mutation Testing at Scale — A view from Google — https://arxiv.org/abs/2102.11378v2 | paper | A | Google Mutation Testing Service design and scale rationale, as reported by its builders; author preprint v2, no published-venue metadata in the arXiv record | arXiv:2102.11378v2 (26 Feb 2021; PDF sha256 a9bdf44159a7b8a6f4b77d7e347650e52d9915bf68f765ff5333f7feee56a081), §4 opening paragraph p. 6 — "First, only mutants that survive the tests can be shown to developers, whereas those that are killed just use computational resources."; second anchors §3.2.1 p. 5 and §4.1 p. 7; opened 2026-10-22T19:56:55Z | At Google's scale mutation testing is feasible only as a restricted run: mutants only on changed, covered lines, at most one mutant per line, unproductive nodes suppressed; the actionable output is the surviving mutant, killed mutants only consume compute, and a mutant that does not compile adds no value as a testing goal | queued | 2026-10-22 | 365d | — |

## Draft `## Gate` entry (for `corpus/lessons/round-42.md`)

- **Admit S039** (paper, tier A): Petrović, Ivanković, Fraser, Just, "Practical Mutation Testing at
  Scale — A view from Google", arXiv:2102.11378v2 (26 Feb 2021), PDF opened 2026-10-22T19:56:55Z,
  sha256 `a9bdf44159a7b8a6f4b77d7e347650e52d9915bf68f765ff5333f7feee56a081`.
  - **URL:** https://arxiv.org/abs/2102.11378v2 (full text https://arxiv.org/pdf/2102.11378v2)
  - **Access date:** 2026-10-22T19:56:55Z, direct HTTPS fetch; HTTP 200 for the abstract page, the
    API record and the PDF.
  - **Quote (21 words, verbatim):** "First, only mutants that survive the tests can be shown to
    developers, whereas those that are killed just use computational resources."
  - **Location:** §4 "Mutant selection criteria", opening paragraph, PDF p. 6; the sentence occurs
    exactly once in the extracted text (`grep -c` = 1).
  - **Second anchors used for `teaches`:** §3.2.1, p. 5 — "A mutant should be a syntactically valid
    program—otherwise, it would be detected by the compiler and not add any value for testing.";
    §4.1, p. 7 — "only a single mutant in a line is ever produced, all others are not considered".
  - **Decision:** admit. C1's `gate-mutants` must keep killed and survived apart and treats a
    survivor as the finding; this paper states why at industrial scale the mutant set is restricted
    rather than exhaustive (changed and covered lines, one mutant per line, unproductive nodes
    suppressed), and why a mutant that does not compile carries no testing value. That is the
    standing-gate argument the row supports; the outcome vocabulary itself stays on S034/S036.
  - **Tier:** A, scoped to the authors' report of their own system. The arXiv record carries no
    journal reference or DOI, so the row does not claim a peer-reviewed venue; it is the author
    version of the same Google work, opened directly.
- **New row, logged:** S039 new, `queued` at paste time (next free id after S038; 38 rows before
  paste). Flip to `mined` with used-by `scripts/gate-mutants.mjs, corpus/lessons/round-42.md` in
  the closing commit once both paths exist; `sources-check` enforces that (see finding 3).

## Evidence (commands and observed output)

1. `grep -cE '^\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|' corpus/SOURCES.md` → `38`;
   `grep -oE '^\| S[0-9]{3}' corpus/SOURCES.md | tail -3` → `| S036` `| S037` `| S038`. S039 is free.
2. `grep -niE 'petrov|2102\.11378|state of mutation|practical mutation' corpus/SOURCES.md` → no
   output. No duplicate of this paper.
3. `grep -niE 'mutation' corpus/SOURCES.md` → four rows: S023, S034 (Stryker outcome vocabulary),
   S036, S037 (report schema). None states the restriction or feasibility argument; no overlap.
4. `curl -sSL -o paper.pdf https://arxiv.org/pdf/2102.11378v2` → 728951 bytes; `sha256sum` →
   `a9bdf44159a7b8a6f4b77d7e347650e52d9915bf68f765ff5333f7feee56a081`.
5. `pdftotext paper.pdf paper_r.txt`; `grep -c "A mutant should be a syntactically valid program"`
   → `1`; `grep -c "only mutants that survive the tests"` → `1`;
   `grep -c "only a single mutant in a"` → `1`.
6. Normalized text word count of the chosen quote → `21` words.
7. Page locators by form-feed count: valid-program sentence → page 5; survivor sentence → page 6;
   single-mutant sentence → page 7. Section headings seen at those positions: 3.2.1, 4, 4.1.
8. `curl -sSL https://export.arxiv.org/api/query?id_list=2102.11378` → `http=200`, 3478 bytes;
   `grep -oE '<arxiv:(journal_ref|doi)>'` → no output; `<arxiv:comment>` = "This work has been
   submitted to the IEEE for possible publication".
9. Clone: `env -u GIT_DIR -u GIT_WORK_TREE -u GIT_INDEX_FILE git clone -q --no-hardlinks
   /home/vgpnk/Projects/shokunin/kumitate-shokunin <scratch>/lane` then `checkout -q --detach
   b237e3f09c9559e130c7367bd2efa981c4ea516f`; `rev-parse HEAD` →
   `b237e3f09c9559e130c7367bd2efa981c4ea516f`.
10. Row appended after S038 in the clone, then `node scripts/sources-check.mjs` →
    `SOURCES_CHECK: CLEAN (rows=39 tiers=A:38,B:1,C:0 status=queued:15,mined:22,rejected:2
    entries_with_source=3 legacy=38)`, exit `0`; `--json` → `"findings":[],"totals":{"errors":0,
    "warnings":0}`.
11. `awk -F'|' '/^\|[[:space:]]*S[0-9][0-9][0-9]+[[:space:]]*\|/ && NF!=13'` → no output (no
    split-field row; the row has 13 split fields).
12. Falsifier for the flip rule: the same row set to `mined` with used-by `corpus/lessons/round-42.md`
    → `SOURCES error USED_BY_MISSING corpus/SOURCES.md:52 id=S039 missing used-by
    corpus/lessons/round-42.md`, `SOURCES_CHECK: DRIFT (USED_BY_MISSING)`, exit `1`; reverted to
    `queued` and re-ran → CLEAN, exit `0`.
13. `ls corpus/lessons/round-42.md scripts/gate-mutants.mjs` in the clone → both absent at this
    revision, which is why the draft is pasted `queued`.
14. `git status --porcelain` in my clone → ` M corpus/SOURCES.md` (the draft row only).

## Findings

1. **Quote and locator verified first-hand.** The chosen sentence is a complete sentence, 21 words,
   appears once, at §4 opening paragraph, PDF p. 6. The §3.2.1 and §4.1 anchors are complete
   sentences/fragments there as quoted; both were also checked to occur once in the extraction.
2. **Venue is not claimed.** The arXiv record has no journal reference and no DOI, and the PDF says
   the work was submitted to the IEEE. Tier A therefore rests on first-party authorship, scoped in
   the row to "as reported by its builders" — the same scoping used by S015 and S018. If the
   integration owner wants a peer-reviewed anchor, the ICSE-SEIP 2018 paper would be a separate
   open-and-quote step; I did not open it (recorded as unopened, not as rejected).
3. **Paste state matters.** `queued` parses and keeps the registry CLEAN. `mined` requires every
   used-by path to exist, so the flip to `mined` belongs in the closing commit, after
   `scripts/gate-mutants.mjs` and `corpus/lessons/round-42.md` exist. This was measured, not assumed
   (evidence 12).
4. **Renumber at paste if taken.** S039 is the next free id at b237e3f. If another round-42 seat
   writes S039 first, renumber; ids are never reused and `ID_DUPLICATE` is an error.
5. **Scope of the claim is narrow on purpose.** The row teaches the restriction and feasibility
   argument and the value of a non-compiling mutant. It does not restate killed/survived/timeout
   semantics (S034, S036) and does not claim Google's operator set or suppression heuristics apply
   to the lane's gates. [INFERENCE] The lane's frozen 41-id manifest is smaller than Google's
   production system by design; the row supports the direction, not the scale.

## Out of scope (not done here)

- No lane file edited except this report; no patch produced (the item says text inside the report
  only). No commit, push or jj operation; no sibling lane, operator config or host state touched.
- The ICSE-SEIP 2018 "State of Mutation Testing at Google" paper was not opened.
- `corpus/lessons/round-42.md` was not written and its `## Gate` section was not edited; the entry
  above is a draft for the integration owner.
- The C1 instruments (`scripts/gate-mutants.mjs`, SKILL checklist items, SCORECARD stanza) belong
  to the executor seats; this report does not touch them.

## Artifacts

- Report: `.ufo/waves/round-42/build/ScribeSourcesRows.md` (relative to the lane root).
- Scratch: `/fast/scratch/hyaku/kumitate-r42/seats/KumitateR42.ScribeSourcesRows/` —
  `paper.pdf` (sha256 above), `paper_r.txt`, `paper.txt`, `api.xml`, `lane/` (detached clone at
  b237e3f with the draft row in `corpus/SOURCES.md`, uncommitted).
- Patch: none.
- Tooling: no tool installed or upgraded; `pdftotext`/`curl` were already present.

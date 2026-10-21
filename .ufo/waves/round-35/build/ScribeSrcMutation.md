SOURCE_ROW status=queued tier=A quote_words=15

# ScribeSrcMutation — round 35 build, SOURCES row draft (frontier step)

Lane: kumitate-shokunin (orchestration & tooling). Registry NOT edited (contract rule 1: row is a claim, written by the round that opened the source; this draft is for the integration owner to paste).

## Draft registry row (for `corpus/SOURCES.md`, next unused id)

| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |
|---|---|---|---|---|---|---|---|---|---|---|
| S021 | Stryker Mutator docs: Mutant states and metrics — https://stryker-mutator.io/docs/mutation-testing-elements/mutant-states-and-metrics/ | docs | A | Mutation-testing outcome definitions (killed, survived, timeout, errors) and mutation score as Stryker defines them | § Mutant states and § Metrics (Killed, Survived, Timeout bullets; Mutation score); docs version current, Docusaurus 3.10.2, page undated; fetched 2026-10-20 | Killed = a test failed under the active mutant; survived = all tests passed; mutation score = detected / valid, detected = killed + timeout; errors sit outside the score | queued | 2026-10-20 | 180d | corpus/lessons/round-35.md |

## Gate entry (for `corpus/lessons/round-35.md` `## Gate`)

- **URL:** https://stryker-mutator.io/docs/mutation-testing-elements/mutant-states-and-metrics/
- **Access date:** 2026-10-20 (direct HTTPS fetch; response Content-Type text/html; Docusaurus page, title "Mutant states and metrics | Stryker Mutator").
- **Quote (15 words, verbatim):** "When at least one test failed while this mutant was active, the mutant is killed."
- **Location:** § Mutant states, bullet **Killed** (body text, not frontmatter; the page's `meta-description` does not contain it).
- **Second anchor used for `teaches`:** § Metrics, bullet **Mutation score** `detected / valid * 100`; bullet **Detected** `killed + timeout`; bullet **Survived** under § Mutant states.
- **Revision:** the page carries no publication date or commit. Recorded as `docs version current` (meta `docusaurus_version: current`, `docsearch:version: current`) plus the access date. This is the weakest part of the anchor; the `180d` recheck is set for that reason.
- **Tier A scope:** Stryker's own official docs are primary for the meaning of Stryker's outcome states and score. The scope column restricts the tier to those definitions. The row does NOT establish that other mutation tools (PIT, mutmut, cargo-mutants) share these definitions; I did not open PIT docs in this step.

## Why this row, why in province

- **Province:** PROVINCE.md §Core band lists "the lane's own instruments `scripts/*.mjs`" as governed ground. The C1 measurement (mutation kills 0/2 → 2/2) is a claim about the lane's instruments, so the outcome vocabulary it counts with belongs to this lane's corpus.
- **Not a duplicate:** `grep -ciE 'mutat' corpus/SOURCES.md` → `0` (no existing row covers mutation outcomes). Existing knowledge files mention mutation in their own prose (`corpus/knowledge/test-inventories.md`, `runtime-remainder-census.md`, etc.), but those are lane findings, not a sourced definition.
- **Lane tooling is hand-rolled, not Stryker.** `grep -niE 'stryker|mutant|mutation' scripts/cite-check.mjs scripts/claims-check.mjs` hits only "mutation copy" test fixtures (`scripts/cite-check.mjs:2372-2383`, `scripts/claims-check.mjs:827`). `grep -rniE 'stryker' scripts/` → no hits. So the row supplies the outcome vocabulary the lane's kill counts should use; it does not imply the lane runs Stryker. [INFERENCE: the C1 kill tally is counted by the lane's own mutation copies; I did not open the C1 measurement script in this step.]
- **Status `queued`, not `mined`:** the census rule (SOURCES.md contract, census line 146-147) requires a `mined` row's `used-by` path to exist. `corpus/lessons/round-35.md` does not exist yet (`ls corpus/lessons/round-35.md` → "No such file or directory"; latest lesson on disk is `round-34.md`). Flip to `mined` in the same round that writes that lesson and cites S021.
- **Id:** `grep -cE '^\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|' corpus/SOURCES.md` → `20` (rows S001–S020 present), so S021 is the next unused id. The row's placeholder `S0NN` was resolved to S021. If another lane writes S021 first, renumber at paste time; ids are never reused.

## Commands run and output

1. `read https://stryker-mutator.io/docs/mutation-testing-elements/mutant-states-and-metrics/` → page body returned (HTTP status line not shown by the reader); quote and metric bullets as above.
2. `grep -cE '^\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|' corpus/SOURCES.md` → `20`
3. Row written to private scratch `/fast/scratch/kumitate-r35/w/ScribeSrcMutation/row.md` and checked with the contract census one-liners:
   - malformed (NF≠13): `0`
   - enum / tier-inflation check: no output (empty = pass)
   - quote word count: `15`
4. `grep -ciE 'mutat' corpus/SOURCES.md` → `0`
5. `ls corpus/lessons/round-35.md` → `No such file or directory`
6. `grep -rliE 'stryker|mutant|mutation' scripts/` → `scripts/cite-check.mjs`, `scripts/claims-check.mjs` (fixture text only; see above)

Checks the main agent should run after pasting the row: `grep -cE '^\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|' corpus/SOURCES.md` (expect 21) and the census awk lines from the contract, plus `scripts/sources-check.mjs` if the lane runs it.

## Findings

1. **Quote verified against the fetched text** at § Mutant states, Killed bullet. Not re-fetched a second time; non-author verification (contract rule 1) should re-open the page once.
2. **Anchor is undated.** Stryker's page has no revision marker beyond "current" docs; the recheck cadence (180d) is the mitigation. [INFERENCE: if Stryker changes "Timeout counted as detected", the `teaches` line goes stale.]
3. **Teaches is narrow on purpose:** outcome definitions and the score formula. It does not claim that a survived mutant proves a test gap in general; the page says only "You're missing a test for it." That is the wording the lesson should quote if it uses the row.
4. **No registry edit, no lesson written, no tool installed.** Tooling directive: no install was needed (fetch via the read tool; census via grep/awk already on host).

## Out of scope (not done here)

- PIT docs (`pitest.org`) not opened; alternative tier-A row for another tool is a separate frontier step.
- `corpus/lessons/round-35.md` not written (lane-owned; the integration owner writes the `## Gate` entry).
- The C1 gate script (`scripts/proxy-check.mjs` S/R derivation) not inspected; this report covers only the source row.

Report paths: this file is `.ufo/waves/round-35/build/ScribeSrcMutation.md` relative to `/home/vgpnk/Projects/shokunin/kumitate-shokunin`. Scratch: `/fast/scratch/kumitate-r35/w/ScribeSrcMutation/` (row.md, q.txt). Patch: none (no production file edited).

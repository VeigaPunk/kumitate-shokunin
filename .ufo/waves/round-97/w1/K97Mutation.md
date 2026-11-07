# K97Mutation — K2 (mutation test of the candidate's new code)

Candidate mutated: `K97ExecTool/sources-check.mjs` **sha256 `ccbf1619…`** (final bytes per `K97ExecTool/sha256.txt` and
the executor's message; READY was still absent at run time — bytes are cited by sha, not mtime). Base
`5402b210…` = `git show 38eb197:scripts/sources-check.mjs`. Scratch candidate copy `K97Mutation/candidate-mutated.mjs`.

**Verdict: K2 literal trigger does NOT fire — the shipped selftest kills all 16 control shapes.**
28 single-point mutants inside the new/changed lines (section block, disclosure site, selftest arms untouched):
**21 KILLED-by-selftest, 3 KILLED-by-counter-only, 4 SURVIVED (all four argued EQUIVALENT)**.

- Control shapes on the candidate's own code (m01–m16 = the 16 `make-controls97.py` shapes, single-point instead
  of block replacement): **16/16 killed by `--selftest`**, each naming the live arm, e.g.
  `m01-crlfstrip` → `r97sec-crlf-heading` + `r97sec-census-parity`; `m03` → `r97sec-vt-sep-h2`; `m04` →
  `r97sec-vt-h1`; `m15-defaultin` → `r97sec-row-before-heading` + `r97sec-pre-heading-row`; `m12/m13` →
  `r97sec-lowercase` / `r97sec-closeseq`; `m16-nodisclose` → 19 arms.
- Boundary mutants: `{0,3}`→`{0,2}` (m17), `!==` flipped (m20), `headings` raw-keyed (m22), trim-trail-only
  (m26), `slice(2)` strip (m27) all killed by selftest.
- **Counter-only kills — coverage gaps, arms proposed:** m18 `{0,3}`→`{0,4}` (h2) — `r97sec-4space-h2` passes for
  the wrong reason (asserts `rows=0` only); needs `## Registry`, row, `    ## Leads`, row-stays-inside.
  m19 `{0,4}` (h1) — same shape for `    # Title`. m25 trailing trim dropped — no arm pins trailing SP/TAB trim
  (`## Registry ` must stay inside); the vt/ff/nbsp arms pin only what must be kept. Demonstrated with census
  agreement in `K97Mutation/runs/gap-demos.txt` (candidate rows=1/2 vs mutant rows=0/1, census E12 empty).
- Survived: m21 `split('\n')`→`split(/\n/)`, m28 loop bound on `sourceLines.length`, m23 `sectionAtLine[index+1]`,
  m24 h1 test on `sourceLines` — each equivalent; arguments in `K97Mutation/mutants.md` (same LF split ⇒ equal
  arrays; row lines never change section state; `normalizeMarkdownIndent` cannot create/destroy an h1 match).

Evidence: `K97Mutation/mutants.md` (table, gaps, equivalence arguments) · `K97Mutation/runs/m01…m28.{selftest,counter}.txt`
(each with exit, failing arm names, counter seed and `C97_C1: … a=… f=…`) · `K97Mutation/runs/diffstat.txt`
(every mutant is one changed line, m10 one insertion, m11 one 3-line block) · `K97Mutation/results.json` ·
`K97Mutation/specs-final.json` + `drive.py`/`mk-specs.py`/`render.py` (reproducible).

Read-only honoured: lane `scripts/sources-check.mjs` is still `5402b210…` after the run
(`K97Mutation/runs/sha-before-after.txt`); the candidate was never written in place; every run used the frozen
counter with `--freeze/--rev 38eb197c…`. No tools installed. Scratch `/fast/scratch/hyaku/kumitate-r97/K97Mutation` removed.

Routed finding (does not flip the frozen counter): add the three discriminating arms above so the section-grammar
teeth cover the over-indented heading (h2 and h1) and the trailing SP/TAB trim.

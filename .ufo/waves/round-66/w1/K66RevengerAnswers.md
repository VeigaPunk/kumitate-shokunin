VERDICT: Reconstructed where every routed item of rounds 55–65 was answered — 57 items, 52 answers located and re-verified at `path:line ±2`, 5 with no answer anywhere — and the round-65 clause L3 depends on is NOT satisfiable at the freeze: only D7 has a committed new answer line, D1's lives in an untracked file, and D2/D3/D5 have none.

## Evidence

```
$ node /fast/scratch/hyaku/kumitate-r66/K66RevengerAnswers/items.mjs   # parses each spot-check with scripts/routed-ledger.mjs routedItems()
R55 items=3 · R56 items=4 · R57 items=4 · R58 items=8 · R59 found=true items=0 · R60 items=9 · R61 items=6
R62 items=5 · R63 items=6 · R64 items=5 · R65 items=7             # 57 total, 11 sections
```
```
$ cd .ufo/waves/round-66/build/K66RevengerAnswers && node verify.mjs ; echo node_exit=$?
... 52 OK lines ...
ANSWERS_VERIFY: located=52/52 skipped_none_found=5 rows=57
node_exit=0
```
`verify.mjs` reads the freeze revision `621212ba…` with `git show` (worktree fallback for untracked), takes
`line-2 .. line+1`, and compares with `routed-ledger.mjs`'s own `norm()` on both sides — the same locatedness test L3
applies. Full transcript: `build/K66RevengerAnswers/verify-out.txt`.

Status split of the 57 rows: **closed 36 · wontfix 6 · open 15 · none found 5**.
Per round closed/total: R55 2/3 · R56 3/4 · R57 1/4 · R58 8/8 · R60 9/9 · R61 4/6 · R62 1/5 · R63 4/6 · R64 3/5 · R65 1/7.
Answer locations: `corpus/lessons` 24 · `.ufo/waves/**` 13 · `SCORECARD.md` 9 · `corpus/README.md` 4 · `LOG.md` 2.

Negative/search receipts for the `none found` rows (`build/K66RevengerAnswers/negatives.txt`, verbatim):
```
grep -rln "double-live" corpus SCORECARD.md LOG.md QUALITY.md PROVINCE.md -> corpus/lessons/round-57-verifier-spotcheck.md corpus/README.md
grep -rln "44\.3" corpus/lessons SCORECARD.md -> corpus/lessons/round-63-verifier-spotcheck.md
harm-matrix rows in SCORECARD ## Capabilities -> 0
grep -c "harm-matrix\|omp-binary-probe" SKILL.md -> 0
grep -rl "cite-check-fleet-dot" corpus SCORECARD.md LOG.md QUALITY.md -> corpus/lessons/round-65-verifier-spotcheck.md corpus/README.md
git ls-files --error-unmatch .ufo/waves/round-66/d1-gate-correction.md -> Did you forget to 'git add'?
```
The two `corpus/README.md` hits are map-row *descriptions* of the spot-check (README:171, README:195), not answers.

## Findings

**K66RevengerAnswers-1 (HIGH — blocks L3's round-65 clause). Six of the seven round-65 items have no closed/wontfix
row available at M.** L3 needs, for D1–D7, an answer line that is located, outside the ledger and the spot-checks, and
**new since the base** `8d557f85`. At the freeze only D7 has one (`corpus/README.md:195`, added by `621212ba`). D1's
only answer is untracked (finding -2); D4 and D6 appear only as *open* carry lines in `.ufo/waves/round-66/plan.md:19`
and `:101`; D2, D3, D5 have no answering line at all. Reproduce:
`grep -n harm-matrix SCORECARD.md` (no `## Capabilities` row) · `grep -c 'harm-matrix\|omp-binary-probe' SKILL.md` → 0 ·
`grep -rl 'cite-check-fleet-dot' corpus SCORECARD.md` → only the spot-check and its README row.
Fix available to the L1 inside C1's ratchet: write the D1–D6 answers into `corpus/lessons/round-66.md` (the round-66
lesson is the natural new-since-base answer surface) and commit the D1 table as a tracked file; a ledger row citing an
untracked or non-existent line will read `ANSWER_DEAD`/`QUOTE_ABSENT`.

**K66RevengerAnswers-2 (HIGH — silent L3 failure). `.ufo/waves/round-66/d1-gate-correction.md` is untracked.**
It is the only D1 answer (S204–S206 Gate rows with URL, date, located quote, capture hash and byte size), but
`git ls-files --error-unmatch` exits "Did you forget to 'git add'?", so `git archive M` used by the counter cannot see
it and its path is not `path:line`-locatable at the measured revision. Reproduce:
`git -C <lane> ls-files --error-unmatch .ufo/waves/round-66/d1-gate-correction.md`.
It must be committed (or folded into the round-66 lesson) before any ledger row points at it.

**K66RevengerAnswers-3 (MEDIUM — the tool cannot see where answers really live, and 7 answers are drafts).** Answer
locations across the 52 located rows: `corpus/lessons` 27, `.ufo/waves/**` 13, `SCORECARD.md` 6, `corpus/README.md` 4,
`LOG.md` 2. Of the 13 wave-path answers, 6 are the round-61 **draft** erratum (`.ufo/waves/round-61/build/ScribeErratum/erratum.md`
lines 7/12/17/22/28/33) and 1 is the untracked D1 file (finding -2): that is the whole R60-V1..V9 answer set except
`close/dead-seats-r60.md`. The committed erratum for that family is `SCORECARD.md:2880` and it fixes only the C1
overclaim, not V2/V4/V9. Consequence for the ledger: a "closed" row backed by a seat draft is located but is *not* the
lane admitting the defect — R60-V5 is the clearest case, where the draft says the repair "belongs to this round's wave"
and the repair is `scripts/make-dispatch-actual.mjs:10`. Reproduce:
`grep -n 'R60-V' .ufo/waves/round-61/build/ScribeErratum/erratum.md`.

**K66RevengerAnswers-4 (MEDIUM — an answer that only restates a plan).** R62 item 2 ("run waves through the validator,
commit the dispatch registry + actual-outcomes receipt") is answered only by prose in `.ufo/waves/round-63/plan.md:124`,
`(2) waves run through the validator`. The receipts are absent in the schema the same item's Q54 names:
`find .ufo/waves/round-6[345] -name dispatch-actual.json` → empty, and there is no `w1-validate.json` in rounds 63–65
(`ls .ufo/waves/round-6[345]/w1-validate.json` → No such file). Rounds 63–65 committed only `w1-spec/-dispatch/-results`.
A ledger row marking this closed would overstate; my row reads `open`. Reproduce: `find .ufo/waves/round-6[345] -name dispatch-actual.json`.

**K66RevengerAnswers-5 (LOW — trap for the row scribe).** Five strong-looking answers are in later *spot-check* files
and are therefore invisible to L3, which excludes answer locations inside the spot-checks: R60-V1's "repaired" verdict
sits at `corpus/lessons/round-61-verifier-spotcheck.md:149`, and the m_flash/seat-band answers to R63-D6 exist only as
that round's README row (README:190). My table deliberately avoids spot-check sources; copying a verdict out of a
spot-check into the ledger will MISS. Reproduce: `sed -n '149p' corpus/lessons/round-61-verifier-spotcheck.md`.

**K66RevengerAnswers-6 (MEDIUM — R61-V2 has two rival located answers; a row must pick one).** `SCORECARD.md:2960`
("Round 63 correction — retires the inherited `dispatch61`/`doctrine61` predicates (R61-V2)") reads **retired, not
repaired**, while `corpus/lessons/round-65.md:133` reads "R61-V2, unaddressed again — the inherited `dispatch61`/
`doctrine61` probes still accept the fabricated C1". Both are located and both are committed; the two rounds disagree
about whether retiring a frozen predicate answers the defect. My rows take the retirement as the answer (`wontfix`) and
say so; a row that cites round-65 instead must not be paired with a `closed` status, and the two quotes must not be
used for the same item id (one edit to SCORECARD:2956 or :2960 kills several rows — the sibling row draft already
binds R61-V3/V5/V6 to the single line `2960`/`2956`). Reproduce: `sed -n '2960p' SCORECARD.md; sed -n '133p' corpus/lessons/round-65.md`.

**K66RevengerAnswers-7 (LOW — three ordinals are carriers, not defects).** Ordinals R55.3, R56.4, R57.4 are the
"carried, not this round's" lines (`corpus/lessons/round-57.md:42`), so `routedItems()` counts 57 items of which 3 can
never close. L3 is safe (it demands answers only from closed/wontfix rows), but any prose reading of "57 items, 57
answers" is wrong; the ledger's `--classes` view should expect 3 permanent `open` rows.

## Artifacts

- `.ufo/waves/round-66/build/K66RevengerAnswers/answers.md` — the table (57 rows: round, ordinal, label, answer
  `path:line`, status, confidence, ≤25-word verbatim quote) + status notes + counts + the round-65 clause analysis.
- `.ufo/waves/round-66/build/K66RevengerAnswers/verify.mjs` — quote locator over `git show 621212ba` (exit 0).
- `.ufo/waves/round-66/build/K66RevengerAnswers/verify-out.txt` — 52 `OK` lines + `ANSWERS_VERIFY: located=52/52
  skipped_none_found=5 rows=57`, `node_exit=0`.
- `.ufo/waves/round-66/build/K66RevengerAnswers/negatives.txt` — the search receipts behind the 5 `none found` rows.
- Scenario script (scratch-only, deleted): `/fast/scratch/hyaku/kumitate-r66/K66RevengerAnswers/items.mjs`; its output
  (the 57 ordinals per `routedItems()`) is quoted in §Evidence above. Scratch dir verified removed
  (`ls -d /fast/scratch/hyaku/kumitate-r66/K66RevengerAnswers` → No such file or directory).
- Integration note for the L1: seat `K66ScribeClasses` holds the canonical 13 class slugs and a per-item quote window
  (`.ufo/waves/round-66/build/K66ScribeClasses/rows.tsv`); my table supplies the **answer** column for the same 57
  ordinals. Take one quote per item (theirs or mine — `verify.mjs` proves mine locate) and one answer, to avoid
  `ROW_DUPLICATE`.
- No frozen file, no lane integration file, no pin was edited. Tool installs/updates: none.

## Limits

- The assignment named `corpus/lessons/round-55..64-verifier-spotcheck.md`; no such single file exists. I covered the 11
  real files rounds 55–65 (round 65 is required by C1/L3 and by the plan's "57 items"), which is why R65's D1–D7 appear.
- "Answered" is a locatedness judgement, not an adequacy judgement: the answer line exists at the cited `path:line`,
  it does not prove the answer satisfies the routed item (the plan's own stated limit for L3, and mine).
- Content matches for unlabelled items are my reading of the text (R57 items 1–4, R62 items 1–5); nothing in the lane
  cross-references them by ordinal, so `R57.1 … R57.4` / `R62.1 … R62.5` are the parser ordinals only.
- I did not re-run any frozen counter, census, `proxy-check`, `readme-map` or `citation` gate, and did not verify that
  SCORECARD/QUALITY line numbers still resolve after this round's integration (integration will move them: the answer
  lines are cited at the freeze revision `621212ba`).
- R63-D6 (m_flash 44.3% vs the ≥50% line) and R65-D2/D3/D5 were searched across `corpus/lessons`, `SCORECARD.md`,
  `QUALITY.md`, `LOG.md`, `PROVINCE.md` and `SKILL.md` only; a wave build artifact could mention them without being an
  answer, and I treated those as non-answers.

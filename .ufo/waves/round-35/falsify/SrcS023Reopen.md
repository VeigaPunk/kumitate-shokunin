ATTACK S023 verdict=holds defects=1

Target: corpus/SOURCES.md row S023 (Stryker Mutator docs: Mutant states and metrics,
https://stryker-mutator.io/docs/mutation-testing-elements/mutant-states-and-metrics/),
its Gate quote in corpus/lessons/round-35.md, and whether C1's 'killed' usage matches
S023's definition. Axes: coverage (row fidelity); operability evidence re-run (C1).

## Re-open (fresh fetch, 2026-10-20)
- `curl -sI <URL>` → HTTP 200, content-type text/html. `last-modified: Tue, 20 Oct 2026
  16:06:39 GMT` (CDN/GH-Pages serving value, not content-derived; correctly NOT used as
  the row's revision — the row says "page undated", which page content confirms).
- `curl -s <URL> > stryker.html`; literal grep → 1 hit of the exact quote string;
  tag-stripped normalized text contains it verbatim; context: "…Killed When at least one
  test failed while this mutant was active, the mutant is killed. This is what you want,
  good job! Survi…". Byte-verbatim ✓, under § Mutant states / Killed bullet ✓.

## Cell-by-cell audit (contract v1, CORPUS.md §'SOURCES.md — where a shokunin learns')
Row at corpus/SOURCES.md:36 (S022 at :35; next unused id; 11 cells, NF=13 census passes):
- id `S023` ✓; no `|` in any cell (pipe count 12 = 11 cells + boundaries) ✓.
- source: title + canonical URL match the page title/og:url ✓.
- kind `docs` ✓ enum; tier `A` ✓ (official docs = primary for Stryker's own definitions;
  not community) ✓; scope is scoped, not global ✓.
- anchor `§ Mutant states, Killed bullet; § Metrics; page undated, fetched 2026-10-20`:
  both § headings exist on the page ✓; "page undated" is honest (no date in HTML) ✓.
- teaches (21 words, verified against page): "Killed = a test failed while the mutant was
  active" ✓ (page: "When at least one test failed while this mutant was active…");
  "survived = all tests passed" ✓ (page: "When all tests passed while this mutant was
  active…"); "mutation score = detected / valid" ✓ (§ Metrics: `detected / valid * 100`).
- status `mined` ✓ — used-by `corpus/lessons/round-35.md` exists; the lesson cites S023
  at :37 ("Mutation outcomes use S023's definitions") and :53 (Gate entry); contract
  census "used-by must exist" printed nothing ✓.
- opened `2026-10-20` ✓; recheck `180d` ✓ (cadence enum). Enum/tier-inflation awk → no
  output; duplicate ids → none; append-only vs `git show master:corpus/SOURCES.md`:
  rows S001–S020 byte-identical, only S021–S028 appended + Search-log/Leads prose edits
  (rule 2 governs rows; leads removals are documented in the Search log) ✓.

## Gate quote check (corpus/lessons/round-35.md:53, under `## Gate` at :27)
`sed -n '53p' | wc -w`-style count of the quoted span → 15 words ≤ 25 ✓; quote is
byte-verbatim to the fetched page ✓ (cat -A: guillemets are the lesson's quoting
convention, closing `»` present); location "§ Mutant states, Killed" correct ✓.

## C1 'killed' usage audit (S023 definition vs lane usage)
- corpus/lessons/round-35.md:37 — "a mutant is killed when the check fails while it is
  active": faithful adaptation of "at least one test failed while this mutant was
  active" for a single-test (one gate run) setting ✓.
- SCORECARD.md:399 Move-log row uses `MUTATION_KILLS 0/2 → 2/2` and cites "S023
  (killed/survived definitions)" ✓; Stryker's "detected" vocabulary maps to the lane's
  kill tally; the page's Timeout-counts-as-detected clause is unused by the lane
  (no timeout state in the harness) — no mismatch.
- Harness predicate (mutate-distinct.sh.txt `is_killed`): killed = term changed OR
  finding newly fired. Both branches imply the gate run failed (a changed computed term
  forces exit 1 drift), so `killed=yes` ⇒ "check failed while active" ✓.

## C1 before/after re-run (both legs reproduced from scratch)
- Command: `bash /fast/scratch/kumitate-r35/w/SrcS023Reopen/mutate-distinct.sh --self
  /fast/scratch/kumitate-r35/w/SrcS023Reopen/master-copy --src /fast/scratch/kumitate-r35/src`
  (master tree copied with cp -a then chmod -R u+w; first attempt hit EACCES on
  read-only modes — recorded here for reproducibility).
  Output: `MUTATION_BASELINE S_sections=86 R_sections=83` … `MUTATION S … killed=no`
  … `MUTATION R … killed=no` … `MUTATION_KILLS 0/2` ✓ matches the claimed before.
- Same harness on the round working tree: `MUTATION_BASELINE S_sections=88
  R_sections=83`, `MUTATION S … 88→87 killed=yes`, `MUTATION R … 83→82 killed=yes`,
  `MUTATION_KILLS 2/2` ✓ matches the claimed after, exact deltas ✓.
- `node scripts/proxy-check.mjs --selftest` → `PROXY_SELFTEST: 107/107 pass` ✓.
- `node scripts/proxy-check.mjs --src /fast/scratch/kumitate-r35/src` → `PROXY: MATCH
  (A=7 C=13 operability=8; … S=88/88 coverage:script-layer=10; R=83/92 …; K=51/51 …;
  pins=6 match)` exit 0 ✓; `node scripts/sources-check.mjs` → `SOURCES_CHECK: CLEAN
  (rows=28 tiers=A:27,B:1,C:0 status=queued:14,mined:12,rejected:2 …)` exit 0 ✓.
- `git -C . status --porcelain` after the harness runs on the lane tree: unchanged set
  (sandboxed in /tmp, notes restored) — harness left the tree unmutated ✓.
- Wave-1 evidence .ufo/waves/round-35/build/ExecMutationBefore.md records the 0/2
  measurement; its initial-attempt failure (successor-chain.md has no such section) is
  honestly documented and the corrected target is the one retained ✓.

## Defects
1. scripts/proxy-check.mjs.orig — untracked 234 KB backup file left in the lane working
   tree (present in `git status --porcelain` as `?? scripts/proxy-check.mjs.orig`;
   mtime 2026-10-20 22:17). Low severity, lane hygiene, not claim-affecting: `A` counts
   only `*.mjs|*.js|*.sh|*.py` so the `.orig` suffix is invisible to every gate (proxy
   MATCH, A=7 verified above), but it is untracked dirt the L1 could accidentally commit.
   Command: `stat -c '%y %n' scripts/proxy-check.mjs.orig` → `2026-10-20 22:17:41 …`.
   Minimal fix: delete it (content is master's proxy-check.mjs, recoverable via
   `git show master:scripts/proxy-check.mjs`) or move it under .ufo/waves/round-35/ as
   evidence with a .txt suffix (per the round-35 evidence-hygiene lesson).

## Residual risk / observations (no fix required)
- [INFERENCE] `is_killed`'s term-change branch would also count a kill on a lane whose
  S drift pre-existed the mutant (finding not newly fired, term still moved). Stryker's
  docs do not define the already-failing-suite case; the lesson's wording ("the check
  fails while it is active") is literally satisfied there, so this is consistent, but a
  future round should prefer "finding newly fired" as the primary predicate.
- The S023 anchor is access-date-based (page carries no revision); the 180d recheck is
  the recorded mitigation (also noted in build/ScribeSrcMutation.md). If Stryker edits
  the Timeout-counts-as-detected wording, `teaches` goes stale — flagged by the scribe,
  covered by recheck.
- The row's scope narrows the scribe draft ("killed, survived" only, no timeout/errors)
  — matches the lane's binary harness; deliberate narrowing, not an error.

## Verification gaps
- None material for S023. Out of scope (other seats): S024–S028 rows, alternate-target
  mutation design (RerunMutation), layerTerms unit mutants (MutProxyLayerTerms).

Scratch: /fast/scratch/kumitate-r35/w/SrcS023Reopen/ (mutate-distinct.sh copy, master-copy
tree, stryker.html). Tools installed: none (curl/awk/node already on host).

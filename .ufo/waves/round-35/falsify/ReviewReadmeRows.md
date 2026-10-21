ATTACK corpus/README.md round-35 rows verdict=holds defects=1

Target: corpus/README.md:90 (`knowledge/kimi-mcp-plane.md`), :93
(`lessons/round-34-verifier-spotcheck.md`), :94 (`lessons/round-35.md`), plus
C2 (README rows vs `corpus/{knowledge,lessons}/*.md`) and `comm -3` set equality.
Lane tree read-only (uncommitted round tree, master tip `1770305`); pin
`/fast/scratch/kumitate-r35/src` @ `31c465f1`. Scratch:
`/fast/scratch/kumitate-r35/w/ReviewReadmeRows/`. No tools installed.

## C2 79/79 and set equality — reproduced

    $ grep -cE '^\| `(knowledge|lessons)/' corpus/README.md
    79
    $ find corpus/knowledge corpus/lessons -name '*.md' | wc -l
    79
    $ comm -3 <(rows sorted) <(files sorted)      # both relative to corpus/
    (empty; no duplicate row paths either)
    $ node scripts/proxy-check.mjs --src /fast/scratch/kumitate-r35/src
    PROXY: MATCH (A=7 C=13 operability=8; C1=19/19 C2=79/79 coverage=10;
    S=88/88 coverage:script-layer=10; R=83/92 coverage:runtime-layer=9;
    K=51/51 coverage:kimi-layer=10; pins=6 match)

The C2 regex (`scripts/proxy-check.mjs:330`) is exactly
`/^\| `(knowledge|lessons)\//`; the denominator is `listCorpusNotes` over the two
dirs (no subdirectories exist), so 79/79 is the gate's own pair, not a
grep coincidence.

## Row :93 round-34 verifier spot-check — holds

- File exists (17 lines, `git show --stat a5683a9` = `1 file changed, 17
  insertions`), headed `# round-34 — non-author verification … (orchestrator,
  kaika)`; table has one `admit` and one `reject`, both verdict `agree`;
  `## Adjudication` present ⇒ "one admit and one reject sample, both `agree`,
  and the adjudication of round 34's bounded claims" exact.
- `a5683a9` is master's parent (`git log --oneline -4 master` → `1770305`,
  `a5683a9`, `d933e15`, `0acb775`; `merge-base --is-ancestor a5683a9 master`
  true) ⇒ commit refurable. `git show a5683a9:corpus/README.md | grep -c
  'round-34-verifier-spotcheck'` → 0 ⇒ "landed without one" exact.
- `.ufo/waves/round-35/baseline/proxy-json.txt:20,80,104-109` →
  `declared=77 computed=78`, `C2_TOTAL_DRIFT` ⇒ "C2_TOTAL_DRIFT 77→78" exact.
- Fleet source `../.ufo/waves/kaika-w3/kumitate-review.md` exists (35,721 B).

## Row :94 round-35 lesson — holds

Mutation claim re-run against both trees (copy of
`.ufo/waves/round-35/mutate-distinct.sh.txt` with the `mktemp` template moved
under my scratch so no mutation touched the lane tree):

    before (writable copy of master-tree):
      MUTATION_BASELINE S_sections=86 R_sections=83
      MUTATION S … before=86 after=86 killed=no
      MUTATION R … before=83 after=83 killed=no
      MUTATION_KILLS 0/2
    after (lane worktree):
      MUTATION_BASELINE S_sections=88 R_sections=83
      MUTATION_AFTER_S S_sections=87 R_sections=83   killed=yes
      MUTATION_AFTER_R S_sections=88 R_sections=82   killed=yes
      MUTATION_KILLS 2/2

Other claims: `proxy-check --selftest` → `107/107 pass`; live S terms 88/88;
`grep -c '^## `scripts/' remaining-scripts-census.md` = 60 (master: 63); claims
gate `--row S8` → `MATCH … sections=60`; kimi census → `CLEAN (members=51
checked=51 chain=7 info=4)` and proxy K=51/51; `SCORECARD.md:143,401` carry K1
3→4 with the 0400 floor; `baseline/checklists.txt:17` → `CHECKLIST: 9/13 pass`;
SOURCES.md has all 8 rows S021–S028 and the lesson has 8 matching bullets;
56 unique `Fid*` seats exist in `build-dispatch.json` and 56 `Fid*.md` reports
(spot-checked two: genuine anchor-fidelity verdict tables).

## Row :90 kimi-mcp-plane — holds

Header triple at lines 1-3; source line cites S005–S008 + S022; precedence :39;
trust gate :43; three timeout keys :53-56; `[INFERENCE]` before the Codex-dialect
paragraph :65-66; stat-only :26-31; 0400 floor :94; strace 0 opens :99 and the
`recheck:` line; `/mcp` + `/mcp-config` :104-105. K1 registry row
`SCORECARD.md:143` confirms shape-only `mcp.json` (4 members, round 35).

## Defect 1 — corpus/README.md:53 (adjacent row, made false by this round's S8 edit)

`… registry family S8 — 63 of 63 members, one `##` section per member …`
contradicts the file it maps: `corpus/knowledge/remaining-scripts-census.md:1`
(`# Remaining scripts census — S8 (60 members)`), `:104` (`S8 members: 60`),
`:185` (`22 suites + 30 tools + 3 shims + 4 assets + 1 doc = 60`), and the gate
(`claims-check --row S8` → `sections=60`). At master the same row read 63 and
master's note had 63 `## scripts/` sections, so the row was correct before
round 35; the round-35 note edit (63→60) did not propagate to the coverage map.
Not one of the three named rows, but in the same file and now false.

Minimal fix: `63 of 63 members` → `60 of 60 members`, and align the split
`29 suites + 23 tools` → `22 suites + 30 tools` (the split was already stale at
master, whose note said `23 suites + 32 tools`; the `54,874 L by wc -l` figure
still matches the note's whole-set reading at :392).

## Pre-existing drift (not counted; identical at master)

- README:64 (`member-claims-gate`): "current … 146 raw sections / 143 in-family
  member sections" vs live `CLAIMS … sections=175 adv=6`; baseline per-row sum
  was 178 and the note's own copy is a `2026-09-29` transcript (:30) ⇒ stale
  before round 35.
- README:54 (`runtime-remainder-census`): "CLAIMS … sections=47" vs live
  `--row R11 sections=41` (same 41 in `baseline/claims.txt:22`).

## Unverified

- "first entry with the `source:`/`verified-at:`/`recheck:` header" (:90) is an
  authoring-order claim; both `kimi-mcp-plane.md` and `omp-task-contract.md`
  carry `^source:` and were added by the same commit `1a8eed5`, so the tree
  cannot confirm ordering. [INFERENCE: authoring order, not falsifiable from files]

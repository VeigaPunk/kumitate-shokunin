ATTACK Departed members record verdict=holds defects=1

Target: `corpus/knowledge/remaining-scripts-census.md:814-820`.

## Verification

- Ran `git -C /fast/scratch/kumitate-r35/src log --diff-filter=D --format='%h %cs %s' 964f443e..31c465f1 -- <path>` for all five paths. Output: `scripts/omp-wave-context.mjs` → `87e6ab3 2026-10-19`; the other four → `2a04baf 2026-10-19`. `git rev-parse 87e6ab3 2a04baf` returned `87e6ab30c61e3965b02fe26171bf2e84be87324e` and `2a04baf280328658b22f70521f62c4ff76410d9b`, matching the record.
- Ran `git show 964f443e:<path> | grep -n -m5 -E '<symbol>'` for each old file. All symbols are present: `WaveContextError` (line 47), `main` (line 529), `LEDGER_SCHEMA` (line 110), `REFINEMENT_CONTEXT_SCHEMA` (line 24), and `buildRefinementContext` (import at test line 20). The corresponding `git cat-file -e 31c465f1:<path>` checks reported all five absent at the pin.
- `grep -rn '^## ' corpus/knowledge/ | grep -iE 'omp-wave-context|primeagent-recovery-assess|primeagent-refinement-ledger|ufo-refinement-context'` returned no matches (exit 1). The census membership probe `comm -3 /tmp/s8-members-live.txt /tmp/s8-headings.txt` was empty; the heading file had 60 entries. Thus none of the five retains a counted section.
- Re-ran `node scripts/claims-check.mjs --src /fast/scratch/kumitate-r35/src`: `SUMMARY: errors=0 warnings=6`; `CLAIMS: MATCH (rows=19 yes=19 notes=27 sections=175 adv=6)`. Warnings are unrelated to these departed paths.
- Reproduced the census measurement command at the pinned source: `layer=88 s8=60 lines=33367`; 70 top-level `.mjs` plus 18 nested files, with classes 22 suites, 30 tools, 3 shims, 4 assets, 1 doc. The 60 live member headings match the member list exactly.

## Finding (low: stale index, not a defect in the record)

- `corpus/README.md:53` still describes S8 as “63 of 63 members” and names `primeagent-refinement-ledger.mjs` (2645 L) among the largest live census members. This conflicts with the current census heading (`remaining-scripts-census.md:1`, 60 members), the pinned 60-member measurement above, and the S8 registry row (`SCORECARD.md:132`, 60 members); the named file is one of the five absent at `31c465f1`. `git diff master -- corpus/README.md` shows only later README rows changed (the hunk starts at line 87), leaving line 53 stale. The round-35 index therefore still presents a departed S8 member as live. Minimal fix: update the README row to the pinned 60-member census and remove the deleted ledger script from its live-member examples. The proxy's README term is only a row count, so the successful gates do not establish this prose is current.

## Citation check / residual risk

- `corpus/knowledge/queue-summary.md:122,215,222` still names `primeagent-refinement-ledger.mjs` as the dispatcher probe/producer. Its round-30 erratum at `:238-239` explicitly labels the dispatcher refs historical and says the ledger projections are absent from the then-current tree; I therefore treat these as disclosed historical references, not an unqualified live claim. `corpus/README.md:114` also lists the script as cited by queue-summary, in its explicitly round-13 residue discussion.
- No defect found in the five-entry Departed members record itself: all listed deletion commits, dates, and old symbols check out; all five paths are absent at the pin; no counted member section remains.

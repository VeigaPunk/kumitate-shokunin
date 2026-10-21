ATTACK scripts/prepare-ephemeral-fleet.test.mjs verdict=holds defects=0

## Evidence

- Diff: `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin diff master -- corpus/knowledge/remaining-scripts-census.md` changes the population row from `253` to `292` and the section metadata from `(253 L, suite)` to `(292 L, suite; was 253 @ 964f443e)`. The original `re-censused 2026-10-14 against origin HEAD 964f443e` label and both symbol anchors are retained.
- Anchors at the pinned revision, read directly with `git -C /fast/scratch/kumitate-r35/src show 31c465f1:scripts/prepare-ephemeral-fleet.test.mjs | sed -n '15p;23p'`:
  - line 15: `  composeEphemeralFleet,`
  - line 23: `import { landFleetRun } from "./land-fleet-run.mjs";`
  Both named symbols are present verbatim. `git show ... | grep -n 'composeEphemeralFleet\\|landFleetRun'` additionally returned the usages at `:70`, `:134`, `:236`, and `:274`.
- `git show 31c465f1:scripts/prepare-ephemeral-fleet.test.mjs | wc -l` → `292`; `git show 964f443e:scripts/prepare-ephemeral-fleet.test.mjs | wc -l` → `253`. Current table row at `corpus/knowledge/remaining-scripts-census.md:148` is `| ...test.mjs | 292 | suite |`.
- The pinned source diff is `39 insertions(+), 0 deletions(-)` at one hunk beginning `@@ -203,6 +203,45 @@`. The old section at master line 617 has no removed behavior clause; the new line 637 retains the old count explicitly as `was 253 @ 964f443e`, so there is no untraced removed clause for this member.
- Independent member probe against the integrated note and pinned source: `HEADINGS: 60  MEMBERS: 60  DUPLICATE: 0`; `MEMBER_PROBE: 60/60 ok` (exit 0). The table-vs-pin check across all 60 S8 rows printed no mismatches.
- Gates checked for the coverage context: `node scripts/claims-check.mjs --src /fast/scratch/kumitate-r35/src --row S8` → `CLAIMS: MATCH (rows=1 yes=1 notes=1 sections=60 adv=0)`; full claims gate → `CLAIMS: MATCH (rows=19 yes=19 notes=27 sections=175 adv=6)`; `node scripts/proxy-check.mjs --src /fast/scratch/kumitate-r35/src` → `PROXY: MATCH (... S=88/88 coverage:script-layer=10 ... pins=6 match)`; proxy selftest → `PROXY_SELFTEST: 107/107 pass`.

## Residual risk and verification gaps

- The two citations are import-site anchors, not declaration lines; the pinned file uses `composeEphemeralFleet` at `:70` and `:134`, and `landFleetRun` at `:236` and `:274`. The cited names are present at their stated lines and the section does not claim those lines are definitions.
- The upstream insertion adds F11 tests at `:206` and `:227`, not summarized in this concise member section. This is not a false claim or member-coverage omission under the census rule (one own-file anchor plus a verbatim symbol); [INFERENCE] exhaustive per-test prose is not required by that rule.
- LSP status could not be queried: `read xd://lsp` returned `No such tool`. I used literal file/source reads and pinned `git show` output; no grep result is presented as semantic proof.
- No actionable finding remains in this target.
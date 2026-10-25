VERDICT: The id-collision guard reproduces byte-identically (lane 134 ids, staged 155 ids, collisions = `S195` only) and is proven able to fail on a 0–3-space indented row that a column-zero-only pattern misses — but it is id-only and section-blind, and the two rows the L1 is adopting need their escaped-pipe `recheck` cells neutralised or they read `ROW_MALFORMED` (14 split fields, lane wants 13).

## Evidence

All commands run from `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-63/build/K63ExecCollisionGuard` (build dir `A`); scratch `/tmp/kumitate-r63/K63ExecCollisionGuard`.

**E1 — guard re-run (the L1's stated command, verbatim).**
```
$ grep -oE '^ {0,3}\|[[:space:]]*S[0-9]{3,}' /home/.../kumitate-shokunin/corpus/SOURCES.md | grep -oE 'S[0-9]+' | sort > $A/reg-ids
$ grep -oE '^ {0,3}\|[[:space:]]*S[0-9]{3,}' /home/vgpnk/Projects/shokuknow/merge/kumitate/SOURCES.append.md | grep -oE 'S[0-9]+' | sort > $A/staged-ids
$ comm -12 $A/reg-ids $A/staged-ids > $A/collisions
reg count: 134  uniq: 134  first/last: S001 .. S195
staged count: 155  uniq: 155  first/last: S195 .. S349
collisions count: 1
--- collisions ---
S195
$ diff $A/collisions /home/.../round-63/assimilation/collisions && echo identical   -> identical
$ diff $A/reg-ids .../assimilation/reg-ids ; diff $A/staged-ids .../assimilation/staged-ids   -> both identical
```
Staged set is exactly contiguous `S195…S349` (`seq 195 349 | sed 's/^/S/' | comm -23 - <(sort -u staged-ids)` → empty). Registry is *not* contiguous.

**E2 — the two target lane ids are free.**
```
$ for id in S196 S197; do printf '%s rows in lane registry: ' $id; grep -cE "^\| $id \|" corpus/SOURCES.md; done
S196 rows in lane registry: 0
S197 rows in lane registry: 0
$ grep -oE '^ {0,3}\|[[:space:]]*S[0-9]{3,}' corpus/SOURCES.md | grep -oE 'S[0-9]+' | sort | tail -1   -> S195
$ grep -rn --exclude-dir=.git -E '\bS19[67]\b' . | grep -v '^./.ufo/waves/round-63/'   -> only round-58/59/60/61 history
```
Renumber map the L1 should use (both target ids free, both source documents not held by the lane):
```
package S200  阿里云百炼 多智能体协作 (managed-agents-multiagent)  ->  lane S196   [free: 0 rows]
package S202  Towards a Science of Scaling Agent Systems (arXiv 2512.08296) -> lane S197   [free: 0 rows]
package S195  MCP Architecture overview  -> NOT APPENDED: lane S125 already holds that URL (id collision with lane S195, a different document)
```

**E3 — proof the guard can fail (indented row) and that column-zero-only misses it.**
```
=== PROOF A: real staged set vs a registry holding an indented S200 row ===
guard reg ids: S001 S200   |  guard staged ids: 155
collisions (1): S200
--- column-zero-only pattern on the SAME registry ---
column-zero ids: S001      |  column-zero collisions (lines=0):  [empty file]

=== PROOF B: literal 2-space indented `  | S002 |` row vs a staged set containing S002 ===
guard reg ids: S001 S002   |  staged ids: S002
collisions (1): S002
--- column-zero-only pattern on the SAME registry ---
column-zero ids: S001      |  column-zero collisions: 0 lines -> []
```
**E4 — indentation boundary.** `    | S200 |` (4 spaces) and `\t| S200 |` are *not* seen by the guard (`guard ids on boundary fixture: S001`, while `any-S200 lines: 2`). Correct per CommonMark (4-space/tab = indented code, not a table row) and it matches the lane's own parsers, which document the same 0–3 rule (`scripts/sources-check.mjs:135`, `scripts/source-dupes.mjs:141-164`).

**E5 — the guard is section-blind (false positive).** Scratch registry with `S200` under `## Paths`:
```
guard ids: S001 S200
guard collisions (FALSE POSITIVE if nonempty): S200
$ node scripts/sources-check.mjs --self .../proof/sec --today 2026-10-25
SOURCES  error  ROW_OUTSIDE_REGISTRY  corpus/SOURCES.md:13  id=S200 row outside Registry section
SOURCES_CHECK: DRIFT (USED_BY_MISSING,ROW_OUTSIDE_REGISTRY)
exit=1
```
**E6 — id-shape matrix.** Fixture with nine id shapes → `guard-extracted ids: S001 S002 S005 S007`. Missed: `| **S003** |`, `` | `S004` | ``, 4-space, tab. Read wrongly: `| S005x |` yields `S005` (no right boundary). Neither file contains any such shape today: `bold=0 code=0 nospace=0 lowercase=0` in both files; `rows with >3 leading spaces = 0`, `INDENTED id rows = 0`.

**E7 — adoption parse (the rows the map produces).** Rows copied from the package with only id/used-by re-pointed, inserted inside `## Registry` (after lane line 147):
```
SOURCES  error  ROW_MALFORMED  corpus/SOURCES.md:148  id=S196 split-fields=14; expected 13
SOURCES  error  ROW_MALFORMED  corpus/SOURCES.md:149  id=S197 split-fields=14; expected 13
SOURCES_CHECK: DRIFT (USED_BY_MISSING,ROW_MALFORMED)   exit=1
pkg195-verbatim:  SOURCES error ID_DUPLICATE ...:148 id=S195  + ROW_MALFORMED ... exit=1
```
Cause: `S195: raw-pipes=13 escaped-pipes=1 awk-NF(-F"|")=14 (lane wants 13)` — same for S200/S202. Offending cell is index 9 (`recheck`): `` 90d — `curl -fsSL '…managed-agents-multiagent.md' \| grep -c 'coordinator'` -> 11 (ran 2026-10-23) ``. Every lane row has exactly 12 raw pipes (`rows with raw-pipes != 12: 0`); the lane holds **0** `\|` escapes. Neutralised draft (`adopt/rows-final.txt`): `recheck` reduced to the bare cadence, evidence moved into `anchor`, `opened` re-pointed to 2026-10-25, 11 cells / 12 pipes:
```
SOURCES  error  USED_BY_MISSING  corpus/SOURCES.md:148  id=S196 missing used-by corpus/knowledge/multi-agent-coordinator-topologies.md
SOURCES  error  USED_BY_MISSING  corpus/SOURCES.md:149  id=S197 missing used-by corpus/knowledge/multi-agent-coordinator-topologies.md
SOURCES_CHECK: DRIFT (USED_BY_MISSING)   exit=1        (only the entry the L1 has not written yet)
SOURCE_DUPES: CLEAN groups=6 known=6   exit=0
```
**E8 — duplicate-URL class (E04/W04) for the two adopted rows: none.**
```
adopt/SOURCES.final.md         SOURCE_DUPES: CLEAN groups=6 known=6        exit=0
adopt/SOURCES.dup195-clean.md  SOURCE_DUPES: DRIFT groups=7 known=6 bad=1 first=new-duplicate:modelcontextprotocol.io/docs/2026-07-28/learn/architecture ids=S125,S195   exit=1
adopt/SOURCES.pkg195-verbatim.md  SOURCE_DUPES: CLEAN groups=6 known=6     exit=0   <-- malformed row is silently skipped
$ node scripts/source-dupes.mjs --registry .ufo/pins/source-dupes.json --sources corpus/SOURCES.md
SOURCE_DUPES: CLEAN groups=6 known=6   exit=0   (baseline)
```
**E9 — normalised-URL sweep, all 155 × 134 rows (`url-overlap.txt`).** 9 package rows are documents the lane already holds: pkg `S195`=lane `S125` (MCP Architecture), pkg `S196`=lane `S117,S126` (Temporal detecting-activity-failures), pkg `S197`=lane `S127` (MCP Tasks ext spec), pkg `S201`=lane `S131` (Bailian managed-agents-introduction), pkg `S205`=lane `S135`, pkg `S206`=lane `S136`, pkg `S217`=lane `S195` (worker-versioning.md), pkg `S260`=lane `S190`, pkg `S264`=lane `S194`. Adopted pair: `pkg S200 -> lane S196 : …managed-agents-multiagent : lane rows with that url=NONE`; `pkg S202 -> lane S197 : arxiv.org/abs/2512.08296 : lane rows with that url=NONE`; lane has no `2512` occurrence at all.

## Findings

**K63ExecCollisionGuard-1 (requirement met, no defect).** Guard is falsifiable: a 0–3-space indented row collides and is caught (`S200`, `S002`), a column-zero-only pattern on the same file returns an empty collisions file. Reproduce: `cd $A && grep -oE '^ {0,3}\|[[:space:]]*S[0-9]{3,}' proof/reg-s002-indented.md | grep -oE 'S[0-9]+' | sort | comm -12 - <(grep -oE '^ {0,3}\|[[:space:]]*S[0-9]{3,}' proof/staged-s002.md | grep -oE 'S[0-9]+' | sort)` → `S002`.

**K63ExecCollisionGuard-2 (medium).** Section-blind: the guard greps the whole file, so an id-shaped row under `## Paths`/`## Search log` is counted as a registry id and manufactures a phantom collision, while the lane parser calls the same row `ROW_OUTSIDE_REGISTRY` (E12). Fix (proposal, not applied): restrict the extract to `## Registry` … next `^ {0,3}#`, i.e. the loader already written at `scripts/source-dupes.mjs:154-176`. Reproduce: `grep -oE '^ {0,3}\|[[:space:]]*S[0-9]{3,}' $A/proof/sec/corpus/SOURCES.md` → `| S001`, `  | S200`.

**K63ExecCollisionGuard-3 (low).** No right boundary on the id: `| S005x |` extracts `S005` (false collision) and bold/code-span ids are invisible. Latent only — both files are clean of those shapes (`bold=0 code=0 nospace=0`). Reproduce: `grep -oE '^ {0,3}\|[[:space:]]*S[0-9]{3,}' $A/proof/shapes.md | grep -oE 'S[0-9]+' | tr '\n' ' '` → `S001 S002 S005 S007`.

**K63ExecCollisionGuard-4 (high — blocks T6 if the map is used verbatim).** Every package row carries one escaped pipe in `recheck` (`raw-pipes=13`), so a re-pointed adoption reads `ROW_MALFORMED split-fields=14; expected 13` and `sources-check` exits 1; the same malformation also hides the row from `source-dupes` (pkg195-verbatim reads `CLEAN` while the identical row in clean form reads `DRIFT … ids=S125,S195`), i.e. malformation masks the W04 class. Neutralisation is a one-cell rewrite; validated draft at `$A/adopt/rows-final.txt` (only `USED_BY_MISSING` remains, which clears when the entry lands). Reproduce: `R=$(mktemp -d) && cp -r corpus "$R/corpus" && cp $A/adopt/SOURCES.final.md "$R/corpus/SOURCES.md" && node scripts/sources-check.mjs --self "$R" --today 2026-10-25` (the scratch root I used was deleted after the run; the recipe is the whole fixture).

**K63ExecCollisionGuard-5 (medium — map must be URL-keyed).** The map `pkg S200→lane S196`, `pkg S202→lane S197` reuses two ids the *package itself* already uses for different documents: pkg `S196` = Temporal detecting-activity-failures (lane `S117,S126`) and pkg `S197` = MCP Tasks ext spec (lane `S127`). Next round's id guard will therefore report `S196`, `S197` by construction, and a future merge that reads ids instead of URLs would append duplicates. Mitigation for the L1: keep the map URL-keyed (the sweep in `url-overlap.txt` is the key set) and record `lane S196 ≠ pkg S196`; note the lane holds **62 free ids below S195** (`S121 S128 S129 S130 S132 S137…S189 S191 S192 S193`) that cannot collide with a package starting at S195 at all — the frozen plan names S196/S197, so this is reported, not changed.

**K63ExecCollisionGuard-6 (info — reconciliation).** The single collision is *not* a document collision: lane `S195` is Worker Versioning (`docs.temporal.io/worker-versioning.md`) while pkg `S195` is the MCP Architecture page lane `S125` already holds — exactly the plan's gloss. It appeared because the lane added `S195` after round 61: round-61 `build/ScoutCollisionGuard/reg-ids.txt` has **133** ids with `S195 present? 0` and recorded `collisions = 0`; today 134 ids → 1. The real duplicate of lane `S195` sits at pkg `S217`, which an id-only guard cannot see.

**K63ExecCollisionGuard-7 (info — step-3 answer).** No package row URL equals a lane row's normalised URL for the two rows being adopted (E8, E9): `SOURCE_DUPES: CLEAN groups=6 known=6` exit 0 with both rows inserted. Near miss, not a duplicate: pkg `S200` (…/managed-agents-multiagent) and lane `S131` (…/managed-agents-introduction) are the same host and doc family but different pages, so neither W04 (different scope) nor E04 (same scope) applies.

## Artifacts

- `.ufo/waves/round-63/build/K63ExecCollisionGuard/{reg-ids,staged-ids,collisions}` — the re-run, byte-identical to `assimilation/`.
- `…/build/K63ExecCollisionGuard/url-overlap.txt` — 9-group normalised-URL overlap + adopted-pair check.
- `…/build/K63ExecCollisionGuard/adopt/rows-final.txt` — copy-paste-ready `S196`/`S197` rows (11 cells, bare `recheck`, `opened` 2026-10-25); `SOURCES.final.md` the whole file with them inserted; `SOURCES.clean.md`, `SOURCES.pkg195-verbatim.md`, `SOURCES.dup195-clean.md` are the falsifier variants.
- `…/build/K63ExecCollisionGuard/proof/{reg-indented.md,reg-s002-indented.md,staged-s002.md,reg-boundary.md,shapes.md,sec/,out-*.txt}` — the guard proofs and their raw verdicts.

## Limits

- I did not run the fleet census (`/home/vgpnk/Projects/shokunin/scripts/sources-census.sh`, the T6 command); `sources-check.mjs` stands in for it and agrees on the row-format rule, but W04/E04 numbering was taken from the lane's own tools, not from a census run.
- Normalised-URL comparison strips scheme/host-case/`www.`/trailing `/`/fragment and keeps the query; a query-only difference would read as "different document". No such pair arose in the adopted set.
- I did not verify the package's `MERGE-REPORT.md` beyond the map rows round 61 cited (`:96,:98`); the URL key set here is derived from `SOURCES.append.md` bytes only.
- The `quarantine-slice` ids (`S109 S116 S118 S129 S142-S145 S178`) resolve neither fully against the lane (only S109/S116/S118 exist) nor at all against the package (all `-> 0`) — left to the quarantine seat; I only observed it while checking id namespaces.
- I did not exercise the guard on a *live* indented row (both files are 0-indent today), so finding -1 is a fixture proof, not a production catch.

VERDICT: The guard reproduces round 64's mechanism with the drift grown (registry 139, staged 155, id collisions 6 = S195–S200, up from 3) and its proof-of-failure fixture behaves as the census does (2-space and 0-space plants grow collisions; tab and 4-space rows are invisible to both) — but the id-only comparison the round prescribes misses 11 census-equivalent document duplicates between the two files, 17 duplicate groups inside the staged file, and 126/155 staged rows that fail `sources-census.sh` E01 on adoption, so a renumber by id alone would poison the registry.

## Evidence

Guard run (exact commands from the seat order, scratch = build dir), lane registry `/home/vgpnk/.../kumitate-shokunin/corpus/SOURCES.md`, staged `/home/vgpnk/Projects/shokuknow/merge/kumitate/SOURCES.append.md`:

```
$ wc -l reg-ids staged-ids collisions
 139 .../assimilation/reg-ids
 155 .../assimilation/staged-ids
   6 .../assimilation/collisions          # round 64: 136 / 155 / 3 (S195 S196 S197)
$ cat collisions                           # verbatim
S195 S196 S197 S198 S199 S200              # one per line
$ sed -n '1p;$p' reg-ids    -> S001 / S200      $ sed -n '1p;$p' staged-ids -> S195 / S349
```
Staged ids are exactly S195–S349 (155, no gaps, no dupes); lane ids S001–S200 (139, max S200). Every collision is therefore in the S195–S200 window; staged S201–S349 are numerically free.

Proof-of-failure fixture (`assimilation/validate-fixture/`; each file = live registry + ONE planted row inserted inside `## Registry` at line 12; the round-64 inline guard rerun on each):

```
variant  reg  collisions  round-64 guard sees plant?  guard.sh lane_indent_skipped
base     139  6           -                          -
sp2      140  7 (S259)    yes                        0+0
sp0      140  7 (S259)    yes                        0+0
tab      139  6           NO                         1+0   (tab-indented)
sp4      139  6           NO                         0+1   (4-space)
combined 141  8 (S256,S257) 2 of 4 planted seen      1+1
```
`guard.sh` summary on the live pair: `COLLISION_GUARD ids=6 doc_blockers=0 doc_warnings=11 staged_dups=17 malformed=126 lane_indent_skipped=0+0 staged_indent_skipped=0+0` (rc 1). On the EOF-append fixture (row after the last `##` section) `guard.sh` reads ids=6, i.e. it agrees with the census's E12 rejection; the round-64 inline guard reads 140 there and invents a collision.

`sources-census.sh validate --file` on the copies, each in a lane-shaped fixture root (lane dirs symlinked, corpus/SOURCES.md a real file; a bare `--file` on a copy is confounded by E11 used-by resolution):

```
base     rc=0  W04=6  file ok      (== plan's base census, six W04)
sp2      rc=0  W04=6 + W03 S259 mined but unused
sp0      rc=0  W04=6 + W03 S259
tab      rc=0  W04=6               (row invisible to the census too)
sp4      rc=0  W04=6               (row invisible: the required "must be ignored" case)
combined rc=0  W04=6 + W03 S256, W03 S257
```
The census and the guard share the row regex `^ {0,3}\|` (`scripts/sources-census.sh:615`; guard draft `assimilation/guard.sh:32-34`), hence the identical tab/4-space blindness.

Severity probes on the census itself (well-formed synthetic rows in a lane-shaped fixture):
```
same scope, same URL   -> file E04 S202 duplicate url dup.example/x within scope same-scope   (rc 1)
different scope, same URL -> file W04 S202 duplicate url dup.example/x across scopes          (rc 0)
126-field staged row (staged S209 as S201) -> file E01 S201 fields=12                          (rc 1)
```

## Findings

**K65ExecCollisionGuard-1 (high) — the id guard is not a document guard: 11 staged↔lane duplicate documents escape it.** Comparing census-normalised URLs (`url_of`, `scripts/sources-census.sh:600-607`: scheme, fragment and trailing slash stripped, host lowercased) yields 11 pairs, e.g. staged S217 == lane **S195** (`docs.temporal.io/worker-versioning.md`, the identical URL), staged S291 == lane **S199** (Firefox jj), staged S195 == lane S125, staged S196 == lane S117 *and* S126, staged S197 == lane S127, staged S201 == lane S131, S205 == S135, S206 == S136, S260 == S190, S264 == S194. All are W04 (scope cells differ), so all 11 sail past `validate` as warnings; appended verbatim they would add 11 W04 warnings to the lane's six (projection from the measured pairs, not run as a whole-file append). Reproduce: `assimilation/guard.sh <lane>/corpus/SOURCES.md <staged>`; file `assimilation/census-equivalent-collisions.txt`.
**K65ExecCollisionGuard-2 (high) — 126 of 155 staged rows are malformed for the lane's registry (E01 on adoption).** The staged rows keep `\|` inside cells (shell pipelines in `recheck`); `sources-census.sh` splits on `|` without unescaping (`row_pass`, `sources-census.sh:574`, `-F'|'`; the "0-3 leading ASCII spaces" comment is :573), so 29 rows are 13 fields and 126 are 14–20 (`gawk -F'|' '{print NF}'`). Proven above: one representative row appended as S201 reads `E01 S201 fields=12`, rc 1. All 13 rows the OMP theme cites are NF=14 (`assimilation/omp-theme-sources.tsv`). Adoption requires rewriting the pipes, not just renumbering.
**K65ExecCollisionGuard-3 (medium) — 17 duplicate-document groups inside the staged file.** 26 pairs, incl. a 4-way group `S259 S270 S271 S280` on `docs.jj-vcs.dev/latest/working-copy`, two README groups at three different lane commits (S253/S255, S307/S328, S277/S279), a 3-way `S239 S240 S331`, and `S238 S245` on `api.github.com/repos/can1357/oh-my-pi/issues/8167` — and S238/S245 are both cited by the adopted OMP theme (amendment entry and tracker entry). The round-64 guard compares only the two files' ids, so nothing sees these.
**K65ExecCollisionGuard-4 (medium) — the by-document renumber map shows the six collisions hold six *different* documents; three staged documents are already the lane's own pages.** `assimilation/renumber-map.tsv`: staged S195 = MCP Architecture (lane S195 = Temporal Worker Versioning; the page is lane **S125** → cite S125, do not append); staged S196 = Temporal activity failures (lane S196 = bailian managed-agents; page is lane **S117/S126**); staged S197 = MCP Tasks spec (lane S197 = arXiv scaling study; page is lane **S127**); staged S198 = OMP `docs/collab.md` (lane S198 = jj concurrency → *not* held, fresh id); staged S199 = OMP `docs/mcp-runtime-lifecycle.md` (lane S199 = Firefox jj → *not* held, fresh id); staged S200 = bailian html render (lane S200 = jj working-copy; the same page is held as lane S196 in its `.md` render — census does **not** flag it because the URLs differ, so this one is a judgment call, not a machine catch).
**K65ExecCollisionGuard-5 (medium) — the OMP theme's citations are all lane-absent but two are id-colliding, and two are one document.** 13 `source:` lines across the seven `merge/kumitate/knowledge/corpus/knowledge/omp-*.md` entries resolve to 12 distinct documents, lane holds **none** of them (`grep -F <url>` = 0 each; the filenames appear only as unopened leads at `corpus/SOURCES.md:262-263`). Lane S053/S060/S068 hold the `v18.12.6` **tree** (`45c35e40…`) and S060 names `packages/coding-agent/src/mcp/config-writer.ts:71`, but no lane row names `mcp/client.ts` or `mcp/types.ts` (`grep -c 'mcp/client\|mcp/types' corpus/SOURCES.md` = 0), so the theme's S228/S250 documents are new. Adopted-theme order → S201 S228 client.ts, S202 S235 versioning.md, S203 S232 commit 10bce690, S204 S250 types.ts/host install, S205 S199 mcp-runtime-lifecycle (collides with lane S199); S198 collab.md is the plan's reject candidate (→ S206 if admitted); outside the theme, S209→S206/S207, S245→S208, S246→S209, S247→S210, S248→S211, and S238 must reuse S245's row (same document).
**K65ExecCollisionGuard-6 (low) — tab and ≥4-space indentation is invisible to *both* guard and census, so an indented collision is doubly silent; 2-space and 0-space rows are seen by both.** Census: `sources-census.sh:615`; guard: `guard.sh:32-34` (the draft *reports* the skipped count instead of counting them). The EOF-append case diverges in the safe direction: the round-64 inline guard counts rows anywhere in the file (invented 140/collision), the census rejects them as `E12` (line 619-621), and the draft matches the census by reading only `## Registry`.
**K65ExecCollisionGuard-7 (low, self-inflicted, repaired) — a symlink fixture wrote through to the live registry; restored byte-exactly.** Building the census fixture I symlinked every `corpus/*` entry (including `SOURCES.md`) back at the lane and then `cp`'d onto `corpus/SOURCES.md`; the write followed the symlink and added one row (113408 bytes vs HEAD 112167; `git status` showed ` M corpus/SOURCES.md`). Restored with `git show HEAD:corpus/SOURCES.md` (read-only) → sha256 `ffe522a3ee87e508e5a428fc5878b68a6f33d8693e553e25981a98836e57d288`, 139 ids, `git status --porcelain -- corpus/SOURCES.md` empty. No other lane byte was touched; the fixture now materialises `SOURCES.md` as a real file. Any seat that builds a lane-shaped fixture with symlinks inherits this hazard.

## Artifacts

`/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-65/build/K65ExecCollisionGuard/assimilation/`:
`reg-ids`, `staged-ids`, `collisions`, `doc-lane`, `doc-staged`, `url-collisions` (3 exact-URL pairs), `census-equivalent-collisions.txt` (11 cross-file + 26 within-staged pairs), `id-collisions.tsv`, `renumber-map.tsv`, `omp-theme-sources.tsv`, `guard.sh` (hardened draft: id + document + within-staged + malformed + indent-skip, census-equivalent normalisation; exits 1 on id collision/E04-blocker/malformed), `guard-live.txt`, `guard-{base,sp2,sp0,tab,sp4,combined,eof}.txt`, `proof-fixtures.txt`, `validate-fixture/SOURCES.{base,sp2,sp0,tab,sp4,combined}.md`. Scratch `/tmp/kumitate-r65/K65ExecCollisionGuard/` (fixture farms, restore copy). No tool installed or upgraded.

## Limits

Did not append all 155 staged rows to a fixture (the 126 pipe rewrites would be a rewrite, not a test); E01 was proven on one representative row plus the guard's raw-field census over all 155. Document collisions use the census's own URL normalisation; other render/path variants (`.md` vs html, `latest` vs `v0.46.0`) are reported as doc-level but the census cannot see them (only S200's bailian pair is such a case here). I did not re-verify the OMP entries' claims, run the round's counters, or fetch any URL. The 6 W04 warnings are pre-existing lane state, not caused by this seat.

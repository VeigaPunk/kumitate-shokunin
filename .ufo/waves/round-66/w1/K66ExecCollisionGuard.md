VERDICT: The id-collision guard runs and fires on 12 live collisions (S195–S206), the indentation blind spot is proven with a fixture, and the id-only guard provably misses 4 duplicate-URL groups that the lane's own `source-dupes` gate flags as DRIFT once the staged block is merged inside `## Registry`.

## Evidence

Guard run (prompt pipeline verbatim, `A=.ufo/waves/round-66/assimilation`):

```
reg-ids: 145  staged-ids: 155  collisions: 12
collisions: S195 S196 S197 S198 S199 S200 S201 S202 S203 S204 S205 S206
reg-ids range S001..S206 (145 present, 61 ids absent)
staged-ids contiguous S195..S349 (155), of which >=S207: 143
```
`grep -cE '^ {0,3}\|[[:space:]]*S[0-9]{3,}'`: lane 145 of 147 `|`-rows, staged 155 of 157 (the 2 extra rows are header+separator in each). Zero backticked ids, zero 4+-space-indented ids, zero lowercase-`s` ids, zero tab-indented ids in either file.

Colliding ids are **different sources**, not the same rows re-listed:

```
S195 lane=Temporal Worker Versioning        staged=MCP Architecture overview
S201 lane=oh-my-pi mcp/types.ts            staged=阿里云百炼 Managed Agents 概述
S206 lane=oh-my-pi mcp/transports/http.ts  staged=Zenn MCP 2026-07-28 article
```
6 of the 12 stage a source the lane already holds under another id (`S195→S125`, `S196→S117,S126`, `S197→S127`, `S201→S131`, `S205→S135`, `S206→S136`); the other 6 are net-new sources (`S198,S199,S200,S202,S203,S204`).

Proof-of-failure fixture (`build/…/proof/`, scratch-free copy): registry with `  | S002 | …` (two leading spaces), staged set colliding only on S002.

```
prompt pipeline (0-3 leading spaces): reg-ids S001 S002 S003 | staged S002 S900 | collisions [S002] lines=1
weak guard '^\\|' (column zero)     : reg-ids S001 S003      | collisions [] lines=0
comm exit under weak guard = 0      (same exit as a clean run — silent pass)
```

Existing gates, measured read-only against merge fixtures (143 staged rows with id>=S207):

```
node scripts/source-dupes.mjs --sources corpus/SOURCES.md            -> SOURCE_DUPES: CLEAN groups=6 known=6 exit 0
node scripts/source-dupes.mjs --sources $S/merge/kumitate/SOURCES.append.md
                                                                    -> SOURCE_DUPES: FAIL-CLOSED reason=sources doc carries no ## Registry section exit 2
merged INSIDE ## Registry (rows inserted after registry line 158):
  SOURCE_DUPES: note new-duplicate:docs.jj-vcs.dev/latest/working-copy ids=S271,S280
  SOURCE_DUPES: note new-duplicate:raw.../c562d285.../corpus/README.md ids=S277,S279
  SOURCE_DUPES: note new-duplicate:research.google/pubs/the-tail-at-scale ids=S190,S260
  SOURCE_DUPES: DRIFT groups=10 known=6 bad=4 first=new-duplicate:dl.acm.org/doi/10.1145/38714.38742 ids=S194,S264 exit 1
merged AT EOF (naive append):
  SOURCE_DUPES: CLEAN groups=6 known=6 exit 0
node scripts/sources-check.mjs --self <EOF fixture> -> 143x "ERROR ROW_OUTSIDE_REGISTRY corpus/SOURCES.md:286 id=S207 row outside Registry section", exit 1
```

Quarantine slice: `awk -F'|' -v l='kumitate' '$2 ~ ("`" l "`") && $3 ~ /round[0-9]+/ && $4 ~ /S[0-9]+/ {print $4, $5}'` over `absent-defect-register.md` → 9 rows. `cmp` against round 65's copy: identical, `diff` exit 0.

## Findings

**K66ExecCollisionGuard-1 — HIGH — 12 live id collisions, all id reuse for a different source.** `/home/vgpnk/Projects/shokuknow/merge/kumitate/SOURCES.append.md` stages S195–S206 while the lane already binds those ids to unrelated rows; appending as-is overwrites identity for both sides and breaks every `used-by`/`path:line` citation into those rows. Reproduce:
```
grep -oE '^ {0,3}\|[[:space:]]*S[0-9]{3,}' kumitate-shokunin/corpus/SOURCES.md | grep -oE 'S[0-9]+' | sort > /tmp/r
grep -oE '^ {0,3}\|[[:space:]]*S[0-9]{3,}' /home/vgpnk/Projects/shokuknow/merge/kumitate/SOURCES.append.md | grep -oE 'S[0-9]+' | sort > /tmp/s
comm -12 /tmp/r /tmp/s | wc -l     # 12
```
Fix (draft, `build/K66ExecCollisionGuard/renumber-map.tsv`): rows S207–S349 keep their ids (143, no collision); the 6 net-new colliding rows renumber to S350–S355; the 6 already-present colliding rows are dropped with a pointer to their lane id.

**K66ExecCollisionGuard-2 — HIGH — a renumber-only fix produces duplicate registry rows.** 6 of the 12 colliding staged rows restage a source the lane already has (S125/S117/S126/S127/S131/S135/S136). Renumbering them "fixes" the id and leaves the corpus asserting two rows for one page under different scopes. Repro: `build/K66ExecCollisionGuard/colliding-ids-with-sources.tsv` (col 3 `DROP_DUPLICATE` vs `RENUMBER`).

**K66ExecCollisionGuard-3 — HIGH — id-only guard misses duplicate sources carried by fresh ids; the lane's own gate proves it.** `source-dupes` on the correctly merged registry reads `DRIFT groups=10 known=6 bad=4` (exit 1) with four groups the `comm` guard passes: `S271,S280` (jj working-copy), `S277,S279` (kumitate README at one SHA), and the two lane↔staged restagings `S190,S260` (research.google the-tail-at-scale) and `S194,S264` (dl.acm.org 10.1145/38714.38742, staged `teaches` cell verbatim equal to the lane's). Repro: build the fixture by inserting the 143 rows after the last `## Registry` data row (`corpus/SOURCES.md:158`) and run `node scripts/source-dupes.mjs --sources <fixture>`.
*Counter-measure I already had in `guard-v2-proposal.sh` (URL compare) is redundant with `source-dupes`, which pins 6 `known` groups; the missing half is that `source-dupes` reads only `corpus/SOURCES.md`, never the staged append file (`FAIL-CLOSED reason=sources doc carries no ## Registry section`).*

**K66ExecCollisionGuard-4 — MEDIUM — `source-dupes` verifies CLEAN on an EOF append.** Rows appended at end-of-file sit outside `## Registry` (`corpus/SOURCES.md:10` … next heading `## Paths` at :162) and the gate stops reading there: `SOURCE_DUPES: CLEAN groups=6 known=6` exit 0 for the same 143 rows that read `DRIFT … bad=4` when merged correctly. The census family does catch it (`sources-check` → 143× `ROW_OUTSIDE_REGISTRY`, exit 1), so the round's M8 set is not blind — but `source-dupes` alone is, and its header claims Registry-only scope as a virtue. Repro: `node scripts/source-dupes.mjs --sources build/…/mergefx/merged.md`.
*Reported, not patched: `scripts/` is the L1's.*

**K66ExecCollisionGuard-5 — MEDIUM — `^ {0,3}` is load-bearing in the guard; the column-zero variant fails silently.** The fixture proves it: the prompt regex yields `collisions=1` on a registry whose colliding row is indented two spaces; `^\|` yields `collisions=0` and `comm` still exits 0, i.e. a guard that reports success while missing the collision. Latent today — 0 indented rows live in either file — so this is a regression trap for the next markdown round, not an active defect. Artifact: `build/K66ExecCollisionGuard/proof/{reg-indented.md,staged.md,collisions,collisions-colzero}`.

**K66ExecCollisionGuard-6 — MEDIUM — the pipeline has no self-signal.** `comm -12` exits 0 for both "no collisions" and "collisions found"; the only evidence is a non-empty file a human must read. `guard-v2-proposal.sh` (draft) exits 1 on either an id or a URL collision; nothing is integrated.

**K66ExecCollisionGuard-7 — MEDIUM — the quarantine slice mixes two table schemas and 4 of its 9 rows are malformed.** The register has two tables — ABSENT (`lane|round|id|class|cited source|quote|note`, header line 27) and unreachable (`lane|round|id|why|cited source`, header line 265). The one `awk` matches both, so the slice's column 2 is a `class` for rows S109,S116,S118,S129,S142 and the *prose* `the cited source could not be fetched…` for S143`,`S144`,`S145`,`S178` — whose ids keep a trailing backtick, i.e. the column boundary shifted in the source. Content is stable: `cmp` against round 65's copy is byte-identical (9 rows both rounds).

**K66ExecCollisionGuard-8 — MEDIUM — the prompt's diff target for round 65 does not exist.** `.ufo/waves/round-65/assimilation/quarantine-slice` is absent (that directory is empty); round 65's artifact is `.ufo/waves/round-65/build/K65ScoutQuarantine/quarantine-slice`. I diffed against the real file: 9 rows, `diff` exit 0, `cmp` identical. A round-66 reader following the prompt literally gets `No such file or directory` (exit 2) and could mis-report drift.

**K66ExecCollisionGuard-9 — INFO — deprecation theme: 23 staged rows, id-clean, URL-redundant.** Ids S233–S331 (all `>=S207`, so zero id collisions; zero of their URLs is already a lane row; `pull/2577` appears in neither the staged file nor the lane registry, despite being named in the round prompt). Five URLs are staged twice-to-thrice: `specification/2026-07-28/deprecated.md` (S233,S319), `community/feature-lifecycle.md` (S234,S242,S314), `specification/draft/deprecated.md` (S239,S240,S331), `seps/2596-…` (S243,S317), `raw…/2026-07-28/seps/2575-stateless-mcp.md` (S256,S257) — 12 of 23 rows are members of a duplicated group. Table: `build/K66ExecCollisionGuard/deprecation-theme-rows.md`.

**K66ExecCollisionGuard-10 — LOW — the lane's id space already has 61 holes** (`S121,S128,S129,S130,S132,S137–S189,S191–S193` absent among 145 present ≤S206). No staged id lands in a hole, so the round's "S207 upward" convention is safe, but nothing records that these ids are retired rather than free; a future round that fills a hole re-creates exactly the collision this guard exists to catch.

## Artifacts

- `.ufo/waves/round-66/assimilation/{reg-ids,staged-ids,collisions,quarantine-slice}` — the prompt's four outputs (145 / 155 / 12 / 9 rows).
- `.ufo/waves/round-66/build/K66ExecCollisionGuard/`: `proof/` (indented fixture + both collision files), `guard-v2-proposal.sh`, `renumber-map.tsv`, `colliding-ids-with-sources.tsv`, `lane-id-url-map.tsv`, `live-collisions-v2.txt`, `live-url-dupes-v2.tsv`, `deprecation-theme-rows.md`, `quarantine-slice`.
- Scratch `/fast/scratch/hyaku/kumitate-r66/K66ExecCollisionGuard/` deleted after copying every cited receipt into the build dir.

## Limits

- I did not establish *why* the merge tooling allocated S195 upward against a lane at S206; `merge-plan.py`/`build-wave3.py` in `/home/vgpnk/Projects/shokuknow` were not read, so whether S195–S206 are "already consumed" by design is unverified.
- `sources-check --self` on my inside-Registry fixture also reports `ROW_MALFORMED,RECHECK_INVALID,USED_BY_MISSING`; those are fixture artifacts (no `corpus/knowledge/` files, `\|`-escaped recheck cells), not merge defects — only the `source-dupes` verdict is load-bearing here.
- URL comparison is on the literal first URL in the source cell; wrappers, `.md`/HTML twins and trailing-slash variants are matched only where `source-dupes`' census normalization matches them, so my crude 11-pair scan over-reports relative to the gate's 4 authoritative groups.
- No URL was fetched this round; every source-side statement is about the registry text, not the live page.
- `assimilation/` is shared: `proof-*` files there (03:25) are a sibling seat's, not mine. I wrote only `reg-ids`, `staged-ids`, `collisions`, `quarantine-slice` (03:28–03:29) and never modified the frozen plan, counters, controls or receipts.

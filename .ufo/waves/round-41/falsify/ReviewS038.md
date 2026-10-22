RESULT ReviewS038 rev=4e58bb0ee48a069ac7dbd99b6e5afe70dcd36ba3 verdict=flawed quote=holds census_exit=0

Re-open of S038 (ufo-fsd-alpha origin wave producer `scripts/ufo-swarm-wave.mjs`, own-work, tier A)
at the pinned clone, against the frozen contract in CORPUS.md
`## SOURCES.md — where a shokunin learns` (contract v1). Measured revision of the lane:
4e58bb0ee48a069ac7dbd99b6e5afe70dcd36ba3. No tool installs were needed (git, node, awk already
present); nothing was written in the lane except this report.

FINDING 1 (minor — used-by cell is wider than the contract allows)
- The frozen contract defines `used-by` as "repo-relative paths of the knowledge entries or
  lessons citing the row". All 37 earlier rows list only `corpus/knowledge/*.md`,
  `corpus/lessons/round-*.md`, or `corpus/QUALITY.md`.
- S038 is the first row to list a script: `scripts/wave-census.mjs, corpus/lessons/round-41.md`.
- `scripts/wave-census.mjs` never cites the row: `grep -n 'S038' scripts/wave-census.mjs` and
  `grep -ni 'sources|S03'` on it both return nothing (exit 1). Its header names the producer and
  schema (`ufo-swarm-wave-dispatch-v1`, `scripts/ufo-swarm-wave.mjs`) but not SOURCES.md or S038.
- Mitigations, so this is minor not fatal: `corpus/lessons/round-41.md` (the second path) does
  cite S038 (4 occurrences), so `status: mined` ("cited by >=1 path in used-by") still resolves;
  and the instrument demonstrably derives from the anchored schema. But the cell as written
  claims a citing relationship the script does not carry, and a script is neither a knowledge
  entry nor a lesson. Cheapest fix: point used-by at the lesson alone, or have the script's
  header cite S038; either stays inside contract v1.

Everything else checked out.

EVIDENCE
1. Pin identity: `git -C /fast/scratch/hyaku/kumitate-pin/src rev-parse HEAD` ->
   31c465f15669f744848bd9f5d56191c5085670f7 (matches the row and the pin charter).
2. sha256: `sha256sum scripts/ufo-swarm-wave.mjs` in the pin ->
   1d33a03ffb204bc499310589199590d305b677fbe4fb2dfdb924f7c0f5f09d0a — byte-identical to the row.
3. Pin working tree clean for that file (`git status --porcelain` empty), so the hash is of the
   committed blob, not a local edit.
4. Last touch: `git log -1 --format='%H %ad %s' -- scripts/ufo-swarm-wave.mjs` ->
   87e6ab30c61e3965b02fe26171bf2e84be87324e 2026-10-19 "swarm: one registry authority..." —
   matches the row; `merge-base --is-ancestor 87e6ab30 31c465f` -> ANCESTOR_OK.
5. Quote 1 location: `grep -n 'ufo-swarm-wave-dispatch-v1' scripts/ufo-swarm-wave.mjs` -> line 51;
   the quoted sentence spans lines 51-52, inside the row's anchored `:51-56` schema-comment span
   (awk printout of lines 40-57 confirms). Em-dashes and backticks match the row's quote exactly.
6. Quote 2 location: `grep -n 'counts: { spawn' scripts/ufo-swarm-wave.mjs` -> line 1226:
   `counts: { spawn: spawns.length, resume: resumes.length, total },` — matches the row's
   second quote (trailing comma outside the quote).
7. Lesson Gate location `:51` is also correct: line 51 is where the quote begins.
8. Row shape: `awk -F'|' 'NR==51{print NF}'` on the clone's corpus/SOURCES.md -> 13 fields =
   the 11 contract cells (id, source, kind, tier, scope, anchor, teaches, status, opened,
   recheck, used-by), no stray `|` inside any cell.
9. Columns hold: id S038 (next unused after S037, appended last, line 51 directly before
   `## Paths`); kind `own-work` is in the enum; source cell gives repo path + commit + sha256
   (contract allows a repo path for own-work); anchor carries line + revision 31c465f.
10. Tier A is justified: scope is the lane's own producer source code, which the contract names
    as A-eligible ("source code", "the lane's own re-runnable gate output"); own-work is not
    `community`, so A is allowed.
11. status `mined` + opened `2026-10-22` (ISO) + recheck `on-release` (an explicitly allowed
    cadence). The row was committed 2026-10-22 14:11:25 -0300 (4e58bb0), same day as `opened`.
12. Append-only respected: S038 is a new row; Gate logs the status change old->new as
    "S038 new -> mined"; no earlier row was edited.
13. used-by paths both exist at the measured revision (scripts/wave-census.mjs,
    corpus/lessons/round-41.md); the lesson cites S038 4 times (see Finding 1 for the script).
14. Gate logging (contract rule 1) at the measured revision: `git show 4e58bb0:corpus/lessons/round-41.md`
    `## Gate` records the path (own-work command), the access date 2026-10-22, the sha256, a
    19-word quote (<=25) with location `:51`, and the used-by pair. Rule 2 logging present.
15. Census run 1 (as assigned, from the live corpus root):
    `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate`
    -> `kumitate W04 S034 duplicate url stryker-mutator.io/docs/mutation-testing-elements/mutant-states-and-metrics across scopes`
       `kumitate ok /home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/SOURCES.md`
    EXIT=0. The only warning is W04 on S034 (pre-existing, unrelated to S038); SOURCES.md reads ok.
16. Census run 2 (in my clone at the measured revision): `node scripts/sources-check.mjs` ->
    `SOURCES  info  LEGACY_NO_HEADER  count=38`
    `SOURCES_CHECK: CLEAN (rows=38 tiers=A:37,B:1,C:0 status=queued:15,mined:21,rejected:2 entries_with_source=3 legacy=38)`
    EXIT=0. LEGACY_NO_HEADER is an info line about all 38 legacy entries lacking a header field
    (pre-existing; scripts/sources-check.mjs:480-482), not drift; CLEAN at exit 0.
17. The live lane's working-copy lesson differs from the measured revision's (uncommitted prose
    added under Claims, including a "Scope of killed" paragraph). At the measured revision the
    Gate is present and contract-shaped, which is the point this item judges; the extra prose
    does not touch the S038 Gate entry.

RESIDUAL RISK / GAPS
- The `opened` date and "opened read-only" claim describe an access event I cannot re-observe;
  what I verified is that every stated artifact (hash, commit, lines, quotes) reproduces today.
- I did not audit sibling rows; W04 (S034 duplicate URL) is reported by the census itself and
  left to whichever seat owns S034.

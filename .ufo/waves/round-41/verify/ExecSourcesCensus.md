RESULT ExecSourcesCensus rev=fae386aa9e0542710b7a893d84c8e92e86fc079b verdict=confirmed rows=37->38 added=1 touched=1 unlogged=0

# ExecSourcesCensus — the source registry census across round 41 (open → tip)

Scope: run `node scripts/sources-check.mjs` at the round-open revision
`a58b7f72afc1eb44b37e438a2f8b212c658874e5` and at the tip
`fae386aa9e0542710b7a893d84c8e92e86fc079b`, run the fleet census
`scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate`, and
report row counts open → tip, rows added by tier, every row whose `status`, `recheck` or
`used-by` changed, and whether each change is logged old→new in the round lesson's `## Gate`.

Verdict: CONFIRMED. The census reproduces at both revisions; exactly one row was added
(S038, tier A) and exactly one row changed in place (S018, `status` and `used-by`); both are
logged old→new in `corpus/lessons/round-41.md` `## Gate`, so `unlogged=0`. Two limits are
recorded at the end; neither is a change this round made to a row.

Environment: node v24.21.0, GNU Awk 5.4.1, bash 5.3.20 — all already present, nothing
installed or updated. Scratch clone
`/fast/scratch/hyaku/kumitate-r41a2/seats/ExecSourcesCensus/lane` (detached at
`fae386aa9e0542710b7a893d84c8e92e86fc079b`) plus a worktree at the open revision
`/fast/scratch/hyaku/kumitate-r41a2/seats/ExecSourcesCensus/open`. Nothing was written in
the lane except this report.

## Live-lane precondition (required by the item)

```
$ git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin diff fae386aa9e0542710b7a893d84c8e92e86fc079b -- corpus/SOURCES.md
LIVE_SOURCES_EQUALS_FAE386aa=YES      # diff empty
$ git -C .../kumitate-shokunin rev-parse HEAD
fae386aa9e0542710b7a893d84c8e92e86fc079b
$ git -C .../kumitate-shokunin hash-object corpus/SOURCES.md
cb80b9cea7061ca554ec44401800ddb1f5de4542
$ git -C <clone> rev-parse fae386aa9e0542710b7a893d84c8e92e86fc079b:corpus/SOURCES.md
cb80b9cea7061ca554ec44401800ddb1f5de4542
```
The live lane's `corpus/SOURCES.md` is byte-identical to the tip blob, so the fleet census
below reads the tip's bytes. The working tree has no modification to `corpus/SOURCES.md` or
`corpus/knowledge/` (`git status --porcelain -- corpus/SOURCES.md corpus/knowledge/` is empty).

## Lane gate at the open revision

```
$ cd <open-worktree> && node scripts/sources-check.mjs
SOURCES  info  LEGACY_NO_HEADER  count=38
SOURCES_CHECK: CLEAN (rows=37 tiers=A:36,B:1,C:0 status=queued:15,mined:20,rejected:2 entries_with_source=3 legacy=38)
EXIT_OPEN=0
```
This equals the round-open receipt byte-for-byte: `.ufo/waves/round-41/open/receipts.txt:21`
reads `SOURCES_CHECK: CLEAN (rows=37 tiers=A:36,B:1,C:0 status=queued:15,mined:20,rejected:2 entries_with_source=3 legacy=38)`.

## Lane gate at the tip

```
$ cd <clone> && node scripts/sources-check.mjs
SOURCES  info  LEGACY_NO_HEADER  count=38
SOURCES_CHECK: CLEAN (rows=38 tiers=A:37,B:1,C:0 status=queued:14,mined:22,rejected:2 entries_with_source=3 legacy=38)
EXIT_TIP=0
$ node scripts/sources-check.mjs --strict        # same verdict, exit 0
$ node scripts/sources-check.mjs --selftest      # SOURCES_SELFTEST: 46/46 pass, VERDICT: PASS, exit 0
```
`--json` at both revisions: `verdict=CLEAN`, `findings=[]`, `exitCode=0`, counts as printed
above. The `--strict` run is also exit 0 at both revisions (no warning is promoted to drift).

## Fleet census (read-only, live lane)

```
$ /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate
kumitate	W04	S034 duplicate url stryker-mutator.io/docs/mutation-testing-elements/mutant-states-and-metrics across scopes
kumitate	ok	/home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/SOURCES.md
FLEET_VALIDATE_EXIT=0
```
The same command against the open revision's file (`--file <open>/corpus/SOURCES.md`) prints
the identical W04 and `ok`, exit 0 — so W04 (S034) is pre-existing and not caused by round 41.
`census` mode agrees with the lane gate on every number:

```
open: rows=37 tier.A=36 tier.B=1 status.queued=15 status.mined=20 status.rejected=2   (exit 0)
tip:  rows=38 tier.A=37 tier.B=1 status.queued=14 status.mined=22 status.rejected=2   (exit 0)
```
`overdue` mode at the tip prints 38 lines, all `cadence` (symbolic or `Nd`), zero `overdue`
rows, exit 0; the open revision prints 37 such lines. The independent awk census in
`CORPUS.md` §Census gives `rows=37`/`rows=38`, `malformed=0` at both, `dups=0` at both.

## What changed in `corpus/SOURCES.md` (open → tip)

`git diff a58b7f72 fae386aa -- corpus/SOURCES.md` is two lines: one modified, one added
(`@@ -31 +31 @@` and `@@ -50,0 +51 @@`). A field-by-field parse of every `## Registry` row
at both revisions (all 10 contract columns, every `S###` row) gives:

- rows: **37 → 38**; tiers A 36 → 37, B 1 → 1, C 0 → 0; status queued 15 → 14,
  mined 20 → 22, rejected 2 → 2.
- **Rows added: 1 — S038, tier A.** kind `own-work`, status `mined`, opened `2026-10-22`,
  recheck `on-release`, used-by `scripts/wave-census.mjs, corpus/lessons/round-41.md`.
  Rows added by tier: A=1, B=0, C=0. Rows removed: 0.
- **Rows touched (status / recheck / used-by changed): 1 — S018.**
  `status` `queued` → `mined`; `used-by` `—` → `corpus/lessons/round-41.md`;
  `recheck` unchanged (`365d`); `opened`, `kind`, `tier`, `scope`, `anchor`, `teaches`
  unchanged. **No row's `recheck` changed**, and no row's tier or `opened` changed.
- `## Paths`, `## Leads (unopened)` and `## Search log` sections are byte-identical at both
  revisions (md5 compared per section).

## Is each change logged old→new in `corpus/lessons/round-41.md` `## Gate`?

Yes, for both — `unlogged=0`. The `## Gate` section is identical in the committed tip
(`fae386aa`) and in the live working copy (diffed section-to-section, equal):

- S018 — lesson line 124: "**Re-open S018** (MAST, Cemri et al., arXiv 2503.13657 v3;
  status `queued` → `mined`, used-by `—` → `corpus/lessons/round-41.md`): opened
  2026-10-22T17:14Z by the falsify scout ScoutMAST at https://arxiv.org/html/2503.13657v3
  (HTTP 200)." Both changed fields carry the old→new pair, matching the row exactly.
- S038 — lesson line 118 "**Admit S038** (own-work, tier A)" with the pinned clone, file
  sha256 `1d33a03f…`, located quote at `:51`; line 123 "**New row, logged:** S038 new →
  `mined` (used-by `scripts/wave-census.mjs`, `corpus/lessons/round-41.md`)" — the used-by
  pair matches the row cell verbatim.

Independent check of the S038 anchor against the pin
(`/fast/scratch/hyaku/kumitate-pin/src`, HEAD `31c465f15669f744848bd9f5d56191c5085670f7`):
`sha256sum scripts/ufo-swarm-wave.mjs` = `1d33a03ffb204bc499310589199590d305b677fbe4fb2dfdb924f7c0f5f09d0a`
(identical to the row and to the lesson); line 51 reads "ufo-swarm-wave-dispatch-v1 — the
exact single `task` call payload", line 1226 reads "counts: { spawn: spawns.length, resume:
resumes.length, total }" — the row's two anchors both resolve.

## Limits recorded (observations, not row changes)

1. **Two committed falsify reports quote a status split that the tip no longer has.**
   `.ufo/waves/round-41/falsify/ReviewS038.md:68` and `CritNoHarm.md:11` both print
   `rows=38 … status=queued:15,mined:21`. That was true at the intermediate revision
   `4e58bb0e` (measured there: `rows=38 … queued:15,mined:21`) and is stale at the tip,
   where attempt 2's S018 re-open moves it to `queued:14,mined:22`. The row count 38 is
   unaffected. `SCORECARD.md:1816` cites only `rows=38`, so it stays accurate.
2. **S038's `used-by` names a script, which the frozen contract does not cover.** The
   contract defines `used-by` as "repo-relative paths of the knowledge entries or lessons
   citing the row"; `scripts/wave-census.mjs` is neither, and it is the first row whose
   used-by cell lists one (falsify seat `ReviewS038.md` FINDING 1, measured at `4e58bb0e`).
   Its concrete complaint — that the script never cites the row — is repaired at the tip:
   `grep -n 'S038' scripts/wave-census.mjs` gives 0 hits at `4e58bb0e` and 2 hits at
   `fae386aa` (lines 9 and 102). The lane gate's `USED_BY_MISSING` check passes at the tip
   (both used-by paths exist on disk). Pre-existing observation about the S038 cell, not a
   change made this round.
3. **Pre-existing, outside this diff:** a citation scan of all 92 `corpus/lessons/*.md` and
   `corpus/knowledge/*.md` files at the tip finds 55 (row, file) pairs where a file names an
   `S###` row that the row's `used-by` cell does not list — e.g. S035 is cited by
   `corpus/lessons/round-40.md`, `round-40-verifier-spotcheck.md` and `round-41.md` but its
   used-by names only `corpus/knowledge/kimi-skills-plugins.md`. So `used-by` in this lane
   records the admitting path, not every citing path; the asymmetry is the house baseline
   (it spans rounds 34–41), not something round 41's diff introduced. The lane gate's own
   `USED_BY_ASYMMETRY` warning fires only for a `corpus/knowledge/*.md` entry with a
   `source:` header, and the tip reads 0 warnings (`findings=[]`), so this is not drift by
   the lane's contract. S035's row is byte-identical at open and tip — it is not a touched
   row and is not charged to this diff.

## Commands run (all read-only, all exit codes as printed)

```
git clone -q --no-hardlinks /home/vgpnk/Projects/shokunin/kumitate-shokunin <scratch>/lane
git -C <scratch>/lane checkout -q --detach fae386aa9e0542710b7a893d84c8e92e86fc079b
git -C <scratch>/lane worktree add --detach <scratch>/open a58b7f72afc1eb44b37e438a2f8b212c658874e5
node scripts/sources-check.mjs            (open)  -> CLEAN rows=37, exit 0
node scripts/sources-check.mjs            (tip)   -> CLEAN rows=38, exit 0
node scripts/sources-check.mjs --strict    (both) -> CLEAN, exit 0
node scripts/sources-check.mjs --selftest  (both) -> 46/46 pass, VERDICT: PASS, exit 0
node scripts/sources-check.mjs --json      (both) -> verdict=CLEAN findings=[] exitCode=0
scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate -> W04 + ok, exit 0
scripts/sources-census.sh validate --file <open>/corpus/SOURCES.md             -> W04 + ok, exit 0
scripts/sources-census.sh census   --root /home/vgpnk/Projects/shokunin kumitate -> rows=38 A=37, exit 0
scripts/sources-census.sh census   --file <open>/corpus/SOURCES.md             -> rows=37 A=36, exit 0
scripts/sources-census.sh overdue  --root /home/vgpnk/Projects/shokunin kumitate -> 38 cadence lines, 0 overdue, exit 0
git diff a58b7f72 fae386aa -- corpus/SOURCES.md                                -> 2 lines (1 modified, 1 added)
git -C .../kumitate-shokunin diff fae386aa -- corpus/SOURCES.md                -> empty (live == tip)
```

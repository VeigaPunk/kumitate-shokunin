# ExecGates — round 60 wave 1

seat: ExecGates · round 60 · one item: run the lane's five gates, quote verdict lines and exit
codes, name every non-clean finding and attribute it.
axes: operability + coverage.
work commit: `a745a3b0e02253e722834ef95042d97ed92e5e53` · base: `ffbfe3cc38ff8eaa6375550b16472c90a006a179`.
Scratch: `/tmp/kumitate-r60/ExecGates/` (outside the lane; lane writes are this file only).

## Verdict lines (live lane tree, first pass)

Each run: `node scripts/<gate>.mjs` from the lane root, 2026-10-24, tree = work commit +
untracked wave scratch (6 untracked paths under `.ufo/waves/round-60/`, zero modified files —
confirmed by `git status --porcelain` taken after these runs).

| gate | verdict line (verbatim) | exit |
|---|---|---|
| readme-map | `README_MAP: CLEAN files=145 rows=145 covered=145` | 0 |
| source-dupes | `SOURCE_DUPES: CLEAN groups=6 known=6` | 0 |
| source-capture | `SOURCE_CAPTURE: CLEAN captures=26 exemptions=107` | 0 |
| cite-sources | `CITE_SOURCES: CLEAN cited=176` | 0 |
| sources-check | `SOURCES_CHECK: CLEAN (rows=133 tiers=A:110,B:15,C:8 status=queued:13,mined:101,rejected:19 entries_with_source=18 legacy=38)` | 0 |

All five exit 0. sources-check is verdict-CLEAN but emits warn/info lines — named below.

## Cross-checks (falsification passes)

1. **Verdicts hold at the committed tree, not just the dirty working tree.** Extracted both
   trees to scratch with `git archive <rev> | tar -x` (read-only; no worktree, no index touch)
   and re-ran all five gates from each extraction. Work-commit tree: verdict lines byte-identical
   to the live pass (`README_MAP: CLEAN files=145 rows=145 covered=145` … `SOURCES_CHECK: CLEAN
   (rows=133 …)`), all exit 0. So no CLEAN verdict depends on untracked wave scratch.
2. **Gate scripts unchanged this round.** `diff -q` base vs work commit: `readme-map.mjs`,
   `source-dupes.mjs`, `source-capture.mjs`, `cite-sources.mjs`, `sources-check.mjs` all
   identical (exit 0 each). Any finding delta between base and work is content, not gate drift.
3. **Concurrency pass.** Between passes, concurrent writers landed `M LOG.md`, `M PROVINCE.md`,
   `M corpus/QUALITY.md`, `M corpus/SOURCES.md` (not mine — my post-run `git status --porcelain`
   still showed 6 entries / no modifications; this seat writes only `/tmp` and its report).
   Re-ran all five gates on that state: all five again exit 0 with identical verdict lines.

## Base-tree matrix (causality evidence)

| gate | base `ffbfe3cc` | work `a745a3b` | round effect |
|---|---|---|---|
| readme-map | `README_MAP: note unpinned:lessons/round-59-verifier-spotcheck.md` + `README_MAP: DRIFT files=142 rows=141 covered=141 bad=2 first=uncovered:lessons/round-59-verifier-spotcheck.md` **exit 1** | `README_MAP: CLEAN files=145 rows=145 covered=145` exit 0 | inherited round-59 DRIFT **repaired** by this round (corpus/README.md +4 rows) |
| source-dupes | `SOURCE_DUPES: CLEAN groups=5 known=5` exit 0 | `SOURCE_DUPES: CLEAN groups=6 known=6` exit 0 | clean both; +1 group = S117/S126 pin (plan C2) |
| source-capture | `CLEAN captures=19 exemptions=107` exit 0 | `CLEAN captures=26 exemptions=107` exit 0 | clean both; +7 captures = the seven adopted rows |
| cite-sources | `CLEAN cited=149` exit 0 | `CLEAN cited=176` exit 0 | clean both |
| sources-check | `CLEAN (rows=126 …)` exit 0, same 2 warns + info | `CLEAN (rows=133 …)` exit 0, same 2 warns + info | clean both; +7 rows = the seven adopted rows |

## Non-clean findings, named and attributed

1. `SOURCES  warn  USED_BY_ASYMMETRY  corpus/knowledge/failure-recovery-replay.md:1  S028 used-by omits corpus/knowledge/failure-recovery-replay.md` — **pre-existing, not round-caused.** Byte-identical line present in the base-tree run; `corpus/knowledge/failure-recovery-replay.md` last changed in round 58 (`6affb9e`), and none of this round's seven SOURCES.md rows is S028.
2. `SOURCES  warn  USED_BY_ASYMMETRY  corpus/knowledge/failure-recovery-replay.md:1  S124 used-by omits corpus/knowledge/failure-recovery-replay.md` — **pre-existing, not round-caused.** Same evidence as (1).
3. `SOURCES  info  LEGACY_NO_HEADER  count=38` — info-level, count unchanged base→work (38→38). Not a defect, not round-caused.
4. `README_MAP: DRIFT … first=uncovered:lessons/round-59-verifier-spotcheck.md` (exit 1) — **exists only at base**, created by round 59's spot-check commit (lesson file added without its README row) and **repaired by this round's work commit** (`corpus/README.md` +4 rows; work and live trees read CLEAN). Not caused by this round; fixed by it.

## Corroborations against the frozen plan

- Limits line "the live sources census … already exits 0 at the base": corroborated — base-tree `sources-check` exits 0 (`SOURCES_CHECK: CLEAN (rows=126 …)`).
- D60 F5's live-fleet half: `source-dupes` reads `SOURCE_DUPES: CLEAN groups=6 known=6` at the work commit — the S117/S126 group is pinned and the live fleet is clean, consistent with "D60 F5 runs the lane's own source-dupes gate over the extracted tree, not the live fleet" (this is the live half; both halves clean).

## Commands (as run)

```
node scripts/readme-map.mjs        # exit 0, README_MAP: CLEAN files=145 rows=145 covered=145
node scripts/source-dupes.mjs      # exit 0, SOURCE_DUPES: CLEAN groups=6 known=6
node scripts/source-capture.mjs    # exit 0, SOURCE_CAPTURE: CLEAN captures=26 exemptions=107
node scripts/cite-sources.mjs      # exit 0, CITE_SOURCES: CLEAN cited=176
node scripts/sources-check.mjs     # exit 0, SOURCES_CHECK: CLEAN (rows=133 …) + 2 warn + 1 info
git archive ffbfe3cc38ff8eaa6375550b16472c90a006a179 | tar -x -C /tmp/kumitate-r60/ExecGates/base
git archive a745a3b0e02253e722834ef95042d97ed92e5e53 | tar -x -C /tmp/kumitate-r60/ExecGates/work
```

## Seat verdict

All five gates exit 0 at the work commit, at the live tree before concurrent writes, and at the
live tree after them. The only non-CLEAN surface anywhere in the matrix is the base-tree
readme-map DRIFT, which this round's commit repairs; the two sources-check warns pre-date the
round. Nothing this round ran left the lane tree mutated (porcelain counts verified before and
after). Gates: corroboration, no falsification.

Report: .ufo/waves/round-60/w1/ExecGates.md

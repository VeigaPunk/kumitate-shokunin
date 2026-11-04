# K82ExecCensusMutate — mutation battery, round-82 C2 compare-age change

Seat: K82ExecCensusMutate (leaf, mutation battery). Claim under test: **C2 coverage:omp** —
`scripts/omp-census.mjs --compare` discloses the receipt's capture instant, accepts an opt-in
`--max-age DAYS` staleness gate, and fails closed on a gated legacy v1 receipt; the age never scores.
Date: 2026-11-04. Host: Linux run-15.

## Method

All work in scratch `S=/fast/scratch/hyaku/kumitate-r82/K82ExecCensusMutate`
(`git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin archive 63b12695 | tar -x -C $S
--one-top-level=lane`); the lane repo and the frozen counter were never written. Between mutants the
tool was restored from the same archive and its sha256 verified against the pristine value (9
restores total, 8 pre-mutant + 1 final). Every counter run:

```
node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-82/probe/probe82-c2.mjs \
  --set c2 --lane $S/lane --work $S/work
```

## Pristine baseline

- `sha256sum $S/lane/scripts/omp-census.mjs` (scaffolding commit 63b12695):
  **`92180f3cc64ccb76208528763d9294b820b56dd97d58b56440dcbc0cdf0c0927`** (978 lines).
- Pristine counter score: **`C82_C2: HELD held=13/13`, exit 0** (all 13 arms ok; full row list in
  `$S/logs/baseline-c2.log` while scratch existed).

## Matrix (8 single-defect mutants, one at a time)

Line numbers are the pristine copy (63b12695). "Failing arms" = arms the frozen counter reported
FAIL; arm 13 is the tool `--selftest` floor (>=100 cases PASS).

| # | Mutant (single defect) | Injection point (pristine) | Counter verdict | held | Failing arms | Result |
|---|---|---|---|---|---|---|
| c1 | drop the `stamp` from the IN_SYNC/DRIFT line | line 309 (`... ${stamp}` → `... transient=${transients.size}`) | UNMET, exit 1 | 9/13 | compare-age-v2, compare-age-45, compare-v1-captured-absent, selftest | **KILLED** |
| c2 | compute `age_days` from `entries.length` instead | line 256 (`receiptAgeDays(doc)` → `receipt.length`; entries=3) | UNMET, exit 1 | 9/13 | compare-age-v2 (age_days=3≠0), compare-age-45 (3≠45), compare-max-age-stale (3≯30 → IN_SYNC exit 0), selftest | **KILLED** |
| c3 | never return 1 on `ageDays > maxAge` | lines 267-270 (`if (ageDays > maxAge)` block removed) | UNMET, exit 1 | 11/13 | compare-max-age-stale, selftest | **KILLED** |
| c4 | never return 2 on a legacy receipt with `maxAge` | lines 259-262 (`if (ageDays === null)` SHAPE_AGE_UNKNOWN block removed) | UNMET, exit 1 | 11/13 | compare-v1-maxage-unknown (legacy+`--max-age 1` → IN_SYNC exit 0), selftest | **KILLED** |
| c5 | drop `parsed.maxAge` from the `main()` compare dispatch (the round-81 class) | line 965 (`compareShape(root, parsed.compare, io, parsed.maxAge)` → without `parsed.maxAge`) | UNMET, exit 1 | 10/13 | compare-max-age-stale, compare-v1-maxage-unknown, selftest | **KILLED** |
| c6 | treat a missing `captured_at` as age 0 | line 256 (`captured === null ? null` → `? 0`) | UNMET, exit 1 | 11/13 | compare-v1-maxage-unknown (0≯1 → IN_SYNC exit 0; arm 6 still held — `captured=absent` still printed), selftest | **KILLED** |
| c7 | `--max-age` accepted but ignored when `--compare` is used | parseArgs, after line 457: `if (o.maxAge !== null && o.compare !== null) o.maxAge = null;` | UNMET, exit 1 | 10/13 | compare-max-age-stale, compare-v1-maxage-unknown, selftest | **KILLED** |
| c8 | accept a negative `age_days` (skip the SHAPE_CLOCK branch) | lines 263-266 (`if (ageDays < 0)` block removed) | **HELD, exit 0** | **13/13** | none | **SURVIVED** |

Killed 7/8. Every kill is decided by the dedicated counter arms written for this change
(compare-age-v2, compare-age-45, compare-max-age-stale, compare-v1-captured-absent,
compare-v1-maxage-unknown); arm 13 (selftest floor) independently fails for c1-c7 because the
tool's own 105-case suite carries compare-age-disclosed / compare-age-backdated /
compare-max-age-stale / compare-max-age-pass / compare-v1-captured-absent /
compare-v1-maxage-unknown / cli-compare-max-age cases. c5 and c7 are the same defect class
(flag swallowed between parse and `compareShape`) at two injection points, both caught by the
same two arms plus the cli-compare-max-age selftest case.

## Survivor analysis — c8

**Verdict: counter gap, not a tool gap.**

The mutant is behaviorally live, not inert. Same input (receipt `captured_at` = +2 days future,
matching 3-entry live root, `--max-age 30`; command
`node $S/lane/scripts/omp-census.mjs --compare $S/demo/future.json --root $S/demo/live --max-age 30`):

- c8 mutant → `OMP_SHAPE_COMPARE: IN_SYNC entries=3 receipt=3 added=0 removed=0 changed=0 transient=0 receipt_captured=2026-11-06 age_days=-2`, **exit 0** (negative age accepted);
- pristine → `OMP_SHAPE_COMPARE: SHAPE_CLOCK age_days=-2 max_age=30`, **exit 2**.

The frozen counter holds 13/13 on the mutant because **no counter arm feeds a future-dated receipt
to the compare path**: its receipts are fresh (`age_days=0`), 45-day aged, and legacy-v1, and the
score arm ages the pin to exactly 45 days. The tool's own selftest does not cover it either — the
only clock-skew case is `shape-clock-future` (line 780) on the `--shape` path, which c8 does not
touch. The compare-path `SHAPE_CLOCK` refusal (pristine lines 263-266) is defence-in-depth with no
frozen arm; per the seat's classification this is a counter gap (the tool retains the branch; the
frozen 13-arm enumeration for C2 simply does not exercise it). Advisory only, not a round blocker:
if the L1 wants the refusal locked, a future counter arm would compare a future-dated v2 receipt
with `--max-age` and require `SHAPE_CLOCK` + exit 2.

## Closure evidence

- Final restore-from-archive verified: `sha256sum $S/lane/scripts/omp-census.mjs` =
  `92180f3cc64ccb76208528763d9294b820b56dd97d58b56440dcbc0cdf0c0927` (== pristine).
- Final counter run on the restored copy: **`C82_C2: HELD held=13/13`, exit 0**.
- Per-mutant logs were at `$S/logs/c{1..8}.log` and `$S/logs/final-pristine.log` (scratch deleted
  after this report, per host rules; all quoted outputs above were captured from those runs).
- c8-mutant sha256 while in place: `d1d81ec25e357b5ac748c3aad541583362f843e119622f747ec7e3e86bf0b9d5`
  (differs from pristine — the survival is not a stale-copy artifact).

## Risks / blockers / tooling

- No installs or upgrades (node only); pacman untouched (operator pause honored).
- No mutating git/jj anywhere; the frozen counter was executed read-only against scratch lanes.
- No blockers. Residual: the disclosed counter gap (compare-path SHAPE_CLOCK has no frozen arm) —
  advisory, recorded for the L1's close bookkeeping; it does not weaken C2's stated predicate.

# Missing-control analysis: why P2's `>= 8 distinct finding ids` floor is unsatisfiable (K64MutateProbes)

Frozen counter: `.ufo/waves/round-64/probe/receipt64-probe.mjs` (sha256 34b3b308…), P2 lines:
`if (cases.length < 14) bad.push(...)` / `if (seen.size < 8) bad.push(`ids=${seen.size}`)`.
Measured at dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef (tool-present revision):
`RECEIPT64_UNMET held=3/5 … | P2 MISS ids=6 | P5 MISS report-not-given` exit 1.

## The id inventory

`scripts/report-receipt-diff.mjs` at dd1a3e6f emits exactly 7 finding ids
(header lines 12–19: PLACEHOLDER, TALLY_UNRECEIPTED, RECEIPT_MISSING, HASH_DEAD, HASH_ORPHAN,
SECTION_MISSING, SHONEN_COUNT). The 16 committed controls exercise 6 (all but HASH_ORPHAN).

## Why the 7th id (HASH_ORPHAN) cannot be exercised by any control case

- P2 runs every case as `run(toolPath, ['--lane', join(dir, c, 'lane'), '--round', '9', '--report', …])`
  — no `--rev`, so the tool hashes against the *case's* lane dir, and `inLane` is
  `git cat-file -e <hash>^{commit}` **in that directory** (tool line 92–94).
- Control cases live inside the lane archive; the counter extracts `git archive` to a temp dir
  with **no `.git`**. A committed directory cannot carry a nested repository's object store
  (git records a nested `.git` as a gitlink, never its objects), so `inLane` is always false
  under P2.
- HASH_ORPHAN requires `inLane && merge-base --is-ancestor ≠ 0` (tool line 94) → unreachable;
  a case citing any 40-hex hash scores HASH_DEAD (or CLEAN), never HASH_ORPHAN.
- Fail-closed (exit 2) prints no `<ID> …` line that `ids()` accepts (REPORT_RECEIPT* lines are
  filtered), so it adds no id either. Ceiling = 6 = what the controls already have.

Mutation proof the floor is the only P2 failure: mutant `seen.size < 8` → `seen.size < 6`
flips the honest revision to `held=4/5` with P2 passing
(`.ufo/waves/round-64/build/K64MutateProbes/work/mutants/c1/01-ids-floor-6-kill.mjs`).

## Drafts for the L1 (ratchet; fixes must strengthen, the counter text is frozen for the round)

1. Preferred (controls-only, satisfies P2 as written): make one case's `lane/` carry an
   *unborn-but-resolvable* lane context — not possible in a plain archive; therefore instead
   change NOTHING in controls and accept that P2 as frozen can never pass. Honest score stays
   `held=3/5` (+P5 when the round-64 report lands and reads CLEAN → `held=4/5` max).
2. Counter amendment for a future rule version (R64 v2, L1's call, never retroactive):
   either (a) drop the floor to 6, or (b) let P2 count distinct ids across P2+P3 combined
   (P3's r60/r63 runs execute with `--lane <real repo>` where HASH_ORPHAN is reachable), or
   (c) add one P2 case run with `--lane <archive-root>` plus a committed `.ufo/…/orphan-fixture`
   — (b) is the smallest change.
3. Two *reachable* strengthening controls (no new ids, raise case count/robustness):
   - `c16-lane-hash-token`: report.md containing `LANE_HASH` → expect `1` / `PLACEHOLDER`
     (tool line 38 treats the bare token as a placeholder; no control pins it today).
   - `c17-failclosed-unreadable`: report.md path in `expect`-naming is fixed by the harness, so
     instead `c17-shonen-five-boxes`: SHONEN heading with 5 box lines (boundary above the
     exactly-once/>=4 rule) → expect `0` / `CLEAN`.

No frozen file was edited; this is a described fixture + patch proposal per the round contract.

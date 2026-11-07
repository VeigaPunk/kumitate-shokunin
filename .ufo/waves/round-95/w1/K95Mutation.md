# K95Mutation — K2 mutation report (round 95, C1)

**Target**: READY-attested candidate `K95ExecTool/round-gate.mjs` sha256 `c5a2f8ac…` (READY read
21:47); base freeze `ee8479be` = `11f83a1a…`. Fallback target `ctl-positive` regenerated from freeze
bytes = `5c472696…` (matches `controls/controls-sha256.txt`).

**15 candidate mutants, all inside the changed `declaredPins()`/`citations` lines**:
- 13 KILLED-by-selftest (all six forgery-control shapes: escapeonly, gt13, lenient12, anyrej,
  nodisclose, dropall; plus short12, lt13, id2, untrimmed, unshift, nofailclosed, status9).
  Selftest kill count **13/15**; counter-only kills 0. Pristine baseline: `C95_C1: HELD
  a=1/1 b=1/1 c=78/78 d=1/1`, `86/86 pass` (`runs/cand/baseline-counter.log`).
- `checkafterstatus` (count check after the status *read*): **EQUIVALENT** — differential fixture
  gives byte-identical `malformedRows:["S900"]` vs pristine.
- `checkafterreject` (count check after the status *decision*): **SURVIVED** selftest (86/86) and
  counter (HELD) but diverges on an NF=14 row whose field 8 trims to `rejected`:
  pristine `malformedRows:["S900"]` vs mutant `[]` (`runs/cand/differential-checkafterstatus.log`).
  Routed coverage finding (not a candidate defect): no fixture puts `rejected` at index 8 (counter
  S002 and arm (xv) put it at index 9). Proposed arm: “(xxi) NF≠13 row whose field 8 reads
  `rejected` still appends its id to `malformedRows`”.

**Fallback control-target batch** (run while READY was absent): 12/15 killed (2 selftest, 10
counter-only); `nofailclosed` survives there as the plan discloses (base 79-arm suite has no
fail-closed `malformedRows` arm).

**Restoration**: lane file never written; base re-hash `11f83a1a…`, candidate re-hash `c5a2f8ac…`
(`targets/hashes.txt`). Note observed after READY: lane `scripts/round-gate.mjs` moved to `7aaf0082…`
at HEAD `89215d7` by others; K2 target of record is the READY bytes.

Receipts: `.ufo/waves/round-95/K95Mutation/mutants.md`, `mutants-{cand,ctl}.json`,
`mutant-sha256.txt`, `runs/cand/*.log`, `runs/ctl/*.log`, `mutate.py`,
`controls-regenerated-hashes.txt`, `diff-base-vs-candidate.txt`.

# RevengerGuardIntent — cite-check self-observation guard, reconstructed

RESULT RevengerGuardIntent rev=b237e3f09c9559e130c7367bd2efa981c4ea516f verdict=reconstructed

## Scope and bytes

- Measured/verified on my own scratch clone at `b237e3f09c9559e130c7367bd2efa981c4ea516f`
  (`sha256(cite-check.mjs) = 896f0720b7fe7492806b0a5b7458a995de1d666d6759297675b7d964872c6d0e`,
  equal to the SCORECARD `pin.cite-check`). node v24.21.0. No tools installed; pacman untouched.
- History: the guard and its two cases landed in `68db341` (round-41 C1, 11 new hermetic cases,
  64→75) as ONE condition `if (process.env[INJECT41] === '1')` that was both child-marker and
  injector. `4e58bb0e` is the revision CritInjectionBypass probed (it does not touch
  cite-check.mjs; its bytes equal `68db341` at this site). `5320e0da` split the one condition into
  outer marker `!== undefined` + inner injector `=== '1'`.

## Reconstructed intent

The suite must be able to observe its own failure, and observing itself must never recurse:

- INV-1 (self-observation): a plain `--selftest` run contains two active (never-skipped) cases that
  each spawn a child `--selftest` with `KUMITATE_CITE_SELFTEST_INJECT_FAIL=1` and assert the child
  (a) prints the `FAIL  injected failing case` row, (b) ends `VERDICT: FAIL` (--json:
  `verdict: FAIL`, suites[0] FAIL), (c) exits 1. Through (a)-(c) the suite pins its own aggregation
  chain — injector, group verdict, overall verdict, exit code — which is what kills the frozen
  aggregator mutants `suite-any-fail`, `suite-group-verdict`, `suite-exit-json`, `suite-exit-text`.
  Without these cases an always-PASS aggregator would pass its own suite forever.
- INV-2 (child never recurses): a process that sees the injection variable must be a child and must
  not re-enter the spawning path. Post-`5320e0da` the marker is presence (`!== undefined`), the
  injector is the value `'1'`, and both spawn sites attach `'1'`.
- Side clause (verified, CritInjectionBypass item 1-2, re-confirmed here): normal mode never reads
  the variable, and no value of it can make a failing suite pass — it can only ADD a failing case.

## Evidence on pristine bytes (b237e3f0, all runs group-confined, leftovers 0)

- `--selftest` unset: `75/75 cases passed (hermetic)`, `VERDICT: PASS`, exit 0; three timings
  ≈ 900/884/881 ms (open receipts 844/857/838 — same ballpark; the guard's own cost is the two
  nested child selftests, the round-41 "~5×" trade, not deepened here).
- `INJECT41=1`: exit 1, `73/74`, 1 FAIL row, 2 SKIP rows, `VERDICT: FAIL` — INV-1 red path works.
- `INJECT41=2` and `=0`: exit 0, `73/73`, 2 SKIPs, `VERDICT: PASS` — any value marks a child, only
  `'1'` injects.
- strace execve counts: unset → 27 cite-check execs, exactly 3 with `--selftest` (top + text child
  + json child = depth 1, no recursion); `INJECT41=1` → 10 execs, 0 with `--selftest` (child skips
  the spawning cases; the other 8 are normal-mode children that inherit but never read the var).

## Which mutants violate the invariant

Violation classes at `4e58bb0e`→`fae386aa`/open bytes (MutCiteGuardTip table, F1/F2; re-verified
where safe on my clone):

- F1 — violate INV-2 (recursion): `guard-outer-literal-2` (`!== undefined` → `=== '2'` on :2459),
  `child-text-env-dropped`, `child-json-env-dropped` (drop `{ [INJECT41]: '1' }` from either spawn,
  :2469/:2475). The mutated guard/spawn makes the child act as a parent; the tree is unbounded
  (round 41: 29 processes / 2 GB at 8 s; this round: see incident below). A timeout is NOT a kill,
  so these mutants are unkillable by a plain counter — they must be made structurally impossible.
- F2 — violate INV-1 (self-observation silently absent): `guard-outer-ne-1` (`!== '1'`) and
  `guard-outer-eq-undefined` (`=== undefined`). At the open bytes both SURVIVE: parent (env unset)
  takes the child branch, pushes 2 SKIPs, never spawns, never injects → `73/73`, `VERDICT: PASS`,
  exit 0. I reproduced this (`red-ne1`, `red-equn`: exit 0, PASS, 73/73, skip_lines=2). They were
  killed at `4e58bb0e` only because the single condition was also the injector, so the mutated
  parent injected the failing case into itself. The `5320e0da` split fixed recursion on the inner
  site and created this regression.
- Second-order, already disclosed: skip-unconditional (survived even at `4e58bb0e`; nothing counts
  hermetic SKIPs) and assertion-weakening (drop `r.status === 1` from either case → 75/75 exit 0;
  that assertion is the only killer of `suite-exit-*`).

## Minimal design that kills F1 and F2 without adding selftest time

Landed in the lane working copy this round (read after the hard stop; "5/5 killed" is the
executor's measurement, not re-run by me): a depth marker.

- `child41` stamps every child `KUMITATE_CITE_SELFTEST_DEPTH = depth + 1` (all children, normal
  mode too; cost ≈ 0).
- Guard becomes `if (selftestDepth41 >= 2 || (selftestDepth41 > 0 && process.env[INJECT41] !==
  undefined))` → skip branch (inject only if `=== '1'`).
- F1 dies structurally: breaking the marker guard or dropping the spawn env still leaves a
  depth-2 grandchild, and `depth >= 2` is a hard stop. Recursion now needs TWO broken single
  literals (stamp AND both guard disjuncts) — outside single-mutant scope.
- F2 dies through the existing assertions, strengthened in place: the parent still demands the
  child's injected failure (exit 1 + FAIL row + `VERDICT: FAIL`), and now explicitly demands the
  child's two SKIP rows (text literals; json `results[].skipped`). Under `ne1`/`equn` the depth-1
  child no longer injects, so it PASSES, so the parent's assertion fails → `VERDICT: FAIL`,
  exit 1 → killed under the frozen rule (exit non-zero + `VERDICT: FAIL`).
- Selftest time: no new case rows, no extra processes on the healthy path (depth-1 child skips
  before spawning; strace shape unchanged), string/JSON assertions on data already in hand → no
  added wall time vs the measured ~0.9 s baseline.

My independent prototype (applied and measured in my clone BEFORE the hard stop, sha256 of patched
file `0d453d2c6f0a89f1bf06c6f23a4cfd1d21c21d559a8c679a6d4b2529a275f28c`):

- P1 (F2): one parent-visible consistency case after the guard block —
  `check('suite self-observation: spawn cases run iff the injection variable is absent', …)`
  asserting `hermetic.some(r => r.skipped && r.name.startsWith('suite self-observation:')) ===
  (process.env[INJECT41] !== undefined)`. In-process, ~0 ms, +1 case (75→76). Measured: patched
  pristine `76/76 … VERDICT: PASS` exit 0; `=1` → exit 1 `74/75` with the injected FAIL row (child
  still fails from injection: present=true, skipped=true passes); `=2` → exit 0 `74/74`;
  patched `ne1`/`equn` → KILLED: exit 1, `73/74`, the one FAIL being
  `env-present=false spawn-cases-skipped=true`.
- P2 (F1): `child41` gains `detached: true`, `timeout: 5_000` (was 300_000) and on `SIGTERM`
  group-kills the child (`process.kill(-r.pid, 'SIGKILL')`). Reasoning: under any recursion-shaped
  mutant the top's two cases each fail at the 5 s bound → suite `VERDICT: FAIL` exit 1 at ~10 s →
  killed in the Stryker sense, still under a 60 s gate cap, healthy path untouched. NOT executed —
  the hard stop arrived first; classified design inference, corroborated by round-41 measurements
  of the same failure shape.
- Relation: the landed depth-two stop is strictly more minimal than P2 (no timeout change, no
  process-group machinery, no orphan exposure) and composes with P1-style assertions already
  landed in strengthened form. Either F2 design fits the frozen `kumitate-gate-mutants-v1` kill
  rule with no counter change.

## Incident record (m-outer2 storm, this seat, 2026-10-22)

- What: my unpatched `guard-outer-literal-2` run (`red-outer2`, runner cap 20 s, own session) grew
  an unbounded tree. SentinelGateMutants measured ~500 processes / ~25 GB RSS and the shared host
  entered swap (L1 hard stop message). My own check at the next command saw `pgrep -fc
  'guard41/m-'` = 519.
- Why the runner's group-kill did not fire: the runner polls with 0.2 s sleeps; under fork-storm
  load the loop overshot its cap, the wrapping bash job hit its 180 s deadline and was killed
  BEFORE the group-kill line ran (bg_3318 log shows the timeout and no `red-outer2` result line).
  Lesson for `gate-mutants`: the per-mutant kill must be a single immediate `kill -KILL -PGID`
  after a hard timeout, not a load-sensitive poll loop; and the landed depth-two stop removes the
  storm class at the source.
- Cleanup: `pkill -KILL -f 'guard41/m-outer2'` twice; `after_cleanup=0`; final checks
  `pgrep -fc 'RevengerGuard[I]ntent'` = 0, seat-path pattern = 0, `cite-check.mjs --selftes[t]` = 0.
  Load average decayed 6.59 → 6.04 within a minute. No other seat's files touched.
- Per the Stryker vocabulary the unpatched `outer2` outcome is timeout (NOT a kill) plus a no-harm
  incident — exactly the round-41 hazard, now with ~25 GB measured.
- After the L1 stop I ran no further mutant or selftest executions; the patched-F1 runs
  (`m2-outer2`, `m2-txtdrop`) were built but never executed.

## Confidence

- High (executed): pristine behavior, both env semantics, strace depth proof, F2 red-before at the
  open bytes, P1 kills both F2 mutants, P1+P2 healthy-path cost ≈ 0 (76/76, ~1.0 s vs ~0.9 s).
- Source-derived reasoning (not executed here): the landed depth-two guard kills all five guard
  mutants (consistent with the executor's 5/5) and adds no selftest time; P2's temporal kill of F1.
- Out of scope, unchanged: assertion-weakening second-order survivors; multi-mutant recursions.

# K82CriticClaims — falsification review (round 82, wave 1)

Seat: critic (leaf). Target: the two frozen counters and the two claim sentences. Everything below
was measured by me in this session; commands are quoted beside every number. Read-only outside
scratch; no tool installed; no git mutation anywhere.

**Verdict up front: neither claim is falsified and neither counter falls to a constant printer.
Kill rule holds: best constant printer 7/22 (C1) and 7/13 (C2). The freeze set carries five
documentable defects — one false stated cause in both the plan and the frozen counter header, two
counter header bounds that the frozen control itself violates, and one stale arm row pair in the
committed c1 controls (the A1.2 rename was never re-recorded). None changes a held count.**

## 1. Independent re-derivation from committed bytes

### 1a. Tool versions and contract lines

- v1 exists at base: `git -C kumitate-shokunin ls-tree --name-only 0c23c4fc -- scripts/` lists
  `scripts/ready-handoff.mjs`. Contract: `git show 0c23c4fc:scripts/ready-handoff.mjs` line 3
  `* ready-handoff.mjs — kumitate-ready-handoff-v1`, line 31 `const CONTRACT = 'kumitate-ready-handoff-v1';`.
  It has **no `--policy` flag**: `git show 0c23c4fc:scripts/ready-handoff.mjs | grep -c -- '--policy'` → `0`.
- v2 at scaffolding: `git show 63b12695:scripts/ready-handoff.mjs` line 3
  `* ready-handoff.mjs — kumitate-ready-handoff-v2`, line 38 `const CONTRACT = 'kumitate-ready-handoff-v2';`.
  HEAD worktree keeps line 38 (`grep -n "const CONTRACT" scripts/ready-handoff.mjs` → `38`).
- C2 tokens: v1 (0c23c4fc) has neither `SHAPE_STALE_RECEIPT` nor `SHAPE_AGE_UNKNOWN` and rejects
  the gate combination at parse time (`--max-age is only meaningful with --shape`, v1 line 433);
  v2 (63b12695) has `SHAPE_AGE_UNKNOWN` at line 260 and `SHAPE_STALE_RECEIPT` at line 268, plus the
  age stamp `receipt_captured=… age_days=…` at line 257. Both claim tokens check out.

### 1b. Arm counts

`grep -c "  arm(" .ufo/waves/round-82/probe/probe82-c1.mjs` → **22**; same for probe82-c2.mjs →
**13**. Matches plan.md §C1/§C2 and the counters' `const ARMS = 22 / 13`.

### 1c. Base-tree and lane runs (my own, not the controls')

Commands: `node <probe> --set cX --lane <tree> --work /fast/scratch/hyaku/kumitate-r82/K82CriticClaims/work/…`
over `git archive 0c23c4fc` extracted to scratch, and over the lane worktree at rev `3355efb43eb4d0a14893c6e47ba6015f4802755c`
(10 dirty paths, all untracked peer reports/build files — none tracked).

| tree | counter | result | vs plan |
|---|---|---|---|
| base archive 0c23c4fc | c1 | `C82_C1: UNMET held=0/22`, exit 1 | plan says 0/22 ✓ |
| base archive 0c23c4fc | c2 | `C82_C2: UNMET held=6/13`, exit 1 | plan says 6/13 ✓ |
| lane @ 3355efb4 | c1 | `C82_C1: HELD held=22/22`, exit 0 | predicate ✓ |
| lane @ 3355efb4 | c2 | `C82_C2: HELD held=13/13`, exit 0 (selftest cases=105) | predicate ✓ |

Base c2 rerun is **byte-identical** to `controls/c2-base.txt` (diff: only the recorder's `rev=` /
`tree=` / `exit=` lines). Base c1 rerun differs from `controls/c1-base.txt` in exactly one
counter-emitted row — arm 18, see mismatch M4.

## 2. Constant-printer attacks (kill rule)

Four stubs built in scratch, each a pure constant printer (no input read; same bytes on every
invocation). Spec-exact = the seat-spec line; strengthened = adds the static token the counter
greps for. Trees = base archive with only the target script replaced (pin, proxy-check, and all
other scripts left intact — a richer fixture than the frozen stub controls used).

| # | attack | command | score | verdict |
|---|---|---|---|---|
| 1 | C1 spec-exact stub (`READY_HANDOFF: READY wave=w1 seats=14 attack=5/14 connector=1` + `READY_HANDOFF_SELFTEST: 50/50 pass` + `VERDICT: PASS`, exit 0; no v2 string) | `probe82-c1.mjs --set c1 --lane stub-c1-spec-tree` | **6/22 UNMET** | reproduces frozen stub control 6/22 exactly |
| 2 | C1 strengthened stub (adds the literal `kumitate-ready-handoff-v2` in a comment; nothing else) | `probe82-c1.mjs --set c1 --lane stub-c1-max-tree` | **7/22 UNMET** | gains only the static-text arm |
| 3 | C2 spec-exact stub (`OMP_SHAPE_COMPARE: IN_SYNC ... receipt_captured=2026-11-04 age_days=0`, exit 0) | `probe82-c2.mjs --set c2 --lane stub-c2-spec-tree` | **4/13 UNMET** | reproduces frozen stub control 4/13 (A1.4) exactly |
| 4 | C2 strengthened stub (one constant line carrying `receipt=3 … transient=1 captured=absent … age_days=0` + `VERDICT: PASS (100 cases)`) | `probe82-c2.mjs --set c2 --lane stub-c2-max-tree` | **7/13 UNMET** | still 6 arms short |

**Kill-rule result: PASSED for both counters.** No constant printer reaches 22/22 or 13/13; the
margins are 15 arms (C1) and 6 arms (C2). The refusal arms (WAVE_BINDING, DISPATCH_WAVE,
REPORT_DEST_DUPLICATE, L1_SEAT_COLLISION, L1_UNRESOLVED, AGENTS_ABSENT/MALFORMED, POLICY_ABSENT/
MALFORMED, BAND, ROLE_UNKNOWN ×2, DISPATCH_ABSENT, ATTACK_SHARE, CONNECTOR_COUNT; SHAPE_STALE_
RECEIPT, SHAPE_AGE_UNKNOWN, both legacy refusals, shape-gate regression, compare-counts) all
require input-dependent exit codes and tokens that a constant cannot span with their paired
agree-arms. Notably the C2 score arm is **not** stub-takeable even with the pin present: proxy-check
imports the census module in process (`proxy-check.mjs:331: import { … } from './omp-census.mjs'`),
so a constant printer yields `coverage_omp=undefined source=undefined` (measured, c2-max run).

## 3. Plan/counter mismatches (step 3)

- **M1 — false stated cause, both in plan and in the frozen counter header.** plan.md:34 says base
  reads `held=0/22` "(the tool is absent)" and probe82-c1.mjs:9 repeats "Base tree: the tool is
  absent". Measured: the v1 tool IS present at base (ls-tree + `git show` above) and every
  behavioral arm fails with `exit=64 … unknown argument: --policy` (c1-base.txt:4-24, my rerun).
  The 0/22 score is correct; the stated cause is wrong. Smallest safe correction: replace the
  parenthetical with "(base carries v1, which rejects `--policy` with usage 64)" — an erratum, not
  a counter change.
- **M2 — c1 header stub bound is violated by the frozen control itself.** probe82-c1.mjs:10
  "Constant-`READY` stub: at most 5/22" vs `controls/c1-stub.txt` verdict `held=6/22` and my
  strengthened stub 7/22. The bound was written before the stub gained its selftest tally.
- **M3 — c2 header stub bound is not a counter property.** probe82-c2.mjs:10 "Constant-`IN_SYNC`
  stub: at most 5/13" holds for the frozen stub (4/13) but my all-tokens constant printer scores
  7/13 over the same base tree. The bound describes one fixture, not the counter; the kill rule
  (13/13 unreachable) is the real invariant and holds.
- **M4 — committed c1 controls are stale under the A1.2 rename.** `controls/c1-base.txt:20` and
  `controls/c1-stub.txt:19` read `arm dispatch-symlink-escape FAIL … PATH_UNSAFE MISS`; the frozen
  counter emits `arm dispatch-symlink-refused … exit=2 … DISPATCH_ABSENT` (probe82-c1.mjs:186).
  Measured replay over the base archive reproduces 0/22 but **cannot reproduce those rows**.
  A1.5 disclosed the counter edit but the controls were never re-recorded; control-replay will
  diff on that row (held counts unaffected: base 0/22, stub 6/22 both reproduce).
- **M5 — wording nit.** plan.md §C2:34-35 attributes base's 6 held arms to "the five plain-diff
  arms and `--shape --max-age`"; the fifth non-shape arm is `score-unchanged`, a proxy term read,
  not a plain diff. Arithmetic (6/13; the seven new arms = arms 2,3,4,5,6,7,13) is exact.
- **M6 — doc nit.** The Goal-line/stub constant `attack=5/14` matches the plan's Round-shape
  counting; the gate's actual output on this wave is `attack=4/14` (measured: `node
  scripts/ready-handoff.mjs --lane . --round 82 --wave w1 --policy …/ufo-wave-policy.json` →
  `READY_HANDOFF: READY wave=w1 seats=14 attack=4/14 connector=1 … agents=none`), exactly as A1.6
  discloses (sentinel outside the four policy attack roles). No counter arm reads the attack
  value; both counts clear the ≥25 % floor (36 % / 28.6 %).
- Verified non-mismatches: 22/13 arm counts; base 0/22 and 6/13; stub 6/22 and 4/13 (A1.4);
  claim bound `held<=5/13` (plan.md:50) holds for their stub; both SHAPE_* tokens present in v2
  and absent in v1; suite floors 45/100 vs measured 50 (c1 selftest at HEAD) and 105 (c2 selftest
  at HEAD, matches 63b12695 "98->105"); wave-id prefix agreement (`w1.ready` wave `w1` vs dispatch
  `kumitate-r82-w1`) exercised by the lane run's `round-handoff-ready` arm.

## 4. Counter-gap findings (step 4)

- **G1 — one static-text arm.** `tool-v2-contract` (probe82-c1.mjs:139) reads the tool's source
  text only; any bytes containing `kumitate-ready-handoff-v2` without `'kumitate-ready-handoff-v1'`
  pass it with zero behavior (attack 2 proves the pass). Bounded at 1 arm; kill rule intact.
- **G2 — token-presence arms.** C2 arms 2/6 check substrings (`receipt_captured=`, `captured=
  absent`) without tying the value to the receipt; attack 4 collects them. The paired 45-day arms
  (3, 4, 7, 8) force input-dependence, so a constant cannot span both families — the pair design
  is what saves the counter. No fix needed; note only.
- **G3 — fixture artifact inside a frozen control.** `controls/c2-stub.txt` row `score-unchanged
  FAIL no pinned receipt` is caused by the stub fixture omitting `.ufo/pins/omp-shape.json`, which
  EXISTS in the base tree (`git cat-file -e 0c23c4fc:.ufo/pins/omp-shape.json` → exists; c2-base
  has the arm `ok`). The recorded stub bound 4/13 therefore mixes a fixture artifact into the
  constant-printer ceiling. Re-measured with the pin present the arm still fails, for the real
  reason (in-process import, see §2) — verdict unchanged, cause now correct.
- **G4 — no absence-satisfiable arms.** The weakest honest tree (base archive) scores 0/22 on C1;
  C2's six base-held arms all exercise real round-81 behavior (byte-identical rerun). No arm on
  either counter passes because the lane or a fixture is missing.
- **G5 — control provenance.** See M4: the freeze set's c1 controls predate the A1.2 arm-18 rename
  and were not re-recorded; a future `control-replay` will show a one-row diff on c1-base/c1-stub.
  Smallest safe correction: re-record the two c1 control files from the frozen counter in a
  close-time erratum (append-only note), or disclose the expected diff in the close receipt.

## 5. Provenance

- Measured at lane worktree rev `3355efb43eb4d0a14893c6e47ba6015f4802755c` (scripts identical to
  63b12695 for omp-census.mjs/proxy-check.mjs; ready-handoff.mjs carries the disclosed A1.6
  prefix-agreement change, `git diff --stat 63b12695 -- scripts/` → 1 file, +54/−5).
- All fixtures and runs under `/fast/scratch/hyaku/kumitate-r82/K82CriticClaims/` (raw outputs in
  `runs/*.out`: c1-base-rerun, c2-base-rerun, c1-c1-spec, c1-c1-max, c2-c2-spec, c2-c2-max,
  c1-lane, c2-lane); scratch removed after this report per host rule.
- Writes outside scratch: this file only. No pacman/uv/npm installs. No mutating git/jj command.

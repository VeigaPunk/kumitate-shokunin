# MutProbeD — mutation probe of the FROZEN D52 counter (round 52, C2)

Seat: `MutProbeD` (mutation-tester, leaf). Lane: `/home/vgpnk/Projects/shokunin/kumitate-shokunin`
(read-only except `build/MutProbeD/` and this report). Time-box honored; no subagents, no
background jobs. **No tool installs** (no pacman — host guard —, no uv/npx/cargo); node
`v24.21.0` was already present.

Probe under test (frozen): `.ufo/waves/round-52/probe/doctrine52-probe.mjs`,
sha256 `e1aa408337e6546e82610d3781cafd40a4f166f39526059747e8fa3b92537169`, 133 lines,
rule `D52`, 5 checks E1–E5. Mutants are derived copies under `build/MutProbeD/mutants/`;
the lane probe was never written (hash identical before and after the session).

## Detector (fixed before the runs)

> A D52 counter mutant, run at the frozen base rev, must print `DOCTRINE52_UNMET`, must
> never print `DOCTRINE52_HELD`, must exit 1, and must not crash (exit 2 / non-empty
> stderr). A killed mutant is one that prints `DOCTRINE52_HELD` on a tree deficient in
> exactly the property the mutated check used to enforce.

Base rev: `02c01258464cac3804faf177d0cfbf113cd59706` (frozen, plan § Freeze receipts).
Frozen base receipt `.ufo/waves/round-52/base/doctrine52-base.txt` reads
`DOCTRINE52_UNMET held=0/5 checks=5 … | E1 MISS entry-absent` — reproduced exactly.

## Required run — all mutants at base rev (real lane)

Every mutant is the pristine text with **exactly one** anchored replacement (generator
asserts the anchor matches once; `mutants.json` records sha256 and byte delta per mutant).

| mutant | axis | sha8 | base reading | exit | stderr |
|---|---|---|---|---|---|
| pristine (control) | — | e1aa4083 | `UNMET held=0/5 checks=5 … E1 MISS entry-absent` | 1 | 0 B |
| D1-drop-E1 | drop-one-check | 31ca3ed4 | `UNMET held=0/5 checks=5` | 1 | 0 B |
| D2-drop-E2 | drop-one-check | 5e459aa2 | `UNMET held=0/5 checks=5` | 1 | 0 B |
| D3-drop-E3 | drop-one-check | 7e661019 | `UNMET held=0/5 checks=5` | 1 | 0 B |
| D4-drop-E4 | drop-one-check | 247732d8 | `UNMET held=0/5 checks=5` | 1 | 0 B |
| D5-drop-E5 | drop-one-check | 8309a9bc | `UNMET held=0/5 checks=5` | 1 | 0 B |
| R1-relax-clauses (`>=12`→`>=1`) | relax-threshold | b4628751 | `UNMET held=0/5 checks=5` | 1 | 0 B |
| R2-relax-bound (`>=12`→`>=1`) | relax-threshold | ce5e4bbc | `UNMET held=0/5 checks=5` | 1 | 0 B |
| R3-trio-S101 (`/S102/`→`/S101/`) | trio-regex-swap | 88e5cfde | `UNMET held=0/5 checks=5` | 1 | 0 B |
| R4-trio-example (`rfc-editor.org`→`example.com`) | trio-regex-swap | 90a2b8ea | `UNMET held=0/5 checks=5` | 1 | 0 B |
| R5-census-always (`e5 = true`) | census-always-pass | d616c845 | `UNMET held=0/5 checks=5` | 1 | 0 B |
| R6-relax-both (`>=1` on both conjuncts) | relax-threshold | d0bbff7e | `UNMET held=0/5 checks=5` | 1 | 0 B |
| R7-drop-all (all five `hold()` calls removed) | drop-all | 13b37712 | `UNMET held=0/5 checks=5` | 1 | 0 B |

**All 12 mutants pass the detector at base.** But the base column is `cmp`-identical to
the pristine column for every mutant — the detector is satisfied **vacuously**:

```js
const ep = join(T, ENTRY);
if (!existsSync(ep)) {
  process.stdout.write(`DOCTRINE52: DOCTRINE52_UNMET held=0/5 checks=5 rev=${rev} rule=${RULE} | E1 MISS entry-absent\n`);
  process.exit(1);
}
```

The entry `corpus/knowledge/fail-closed-clock-validation.md` exists at **neither** the base
rev nor the current tip (`ac5674393f68fb6510be48ad3fb3b20ebf4e1cc4`), so E1–E5 never run and
the `held=0/5 checks=5` string is a hardcoded literal. A base-rev run therefore cannot
discriminate *any* counter mutation. Verdict at base: **survived (vacuous), 12/12**.

## Discriminating fixtures (synthetic — NOT claim evidence)

To exercise E2–E5 I built a scratch git repo at `build/MutProbeD/tree/` (extracted from
the lane tip, plus registered rows S102/S103; `scripts/sources-check.mjs` CLEAN) with four
commits, each deficient in exactly one dimension:

| fixture | rev | header trio | clauses | S102/S103 rows | E4 | intended MISS |
|---|---|---|---|---|---|---|
| rev-A | `5c5cb661cc7c270df965503952e13f09e5092728` | absent (no rfc-editor URL, no S103) | 12 real bound | mined | CLEAN rc 0 | E1 |
| rev-B | `85f6d8913760d3cb524ee3fcba4711daccd3a79e` | present | 1 bound | mined | CLEAN rc 0 | E2 |
| rev-C | `6e29585968c590c6ed5e677f1e9e29530d8bbe41` | present | 12 real bound | `queued`, used-by `—` | CLEAN rc 0 | E3 |
| rev-D | `2db70f068b3484976bff7fbd218a638f76f3e310` | present | 12 real bound | mined | DRIFT rc 1 (`ENTRY_HEADER_REQUIRED`, unrelated file) | E4 |

Pristine control reads `UNMET held=4/5` on each of the four (`E1/E2/E3/E4 MISS` resp.) —
the fixtures are deficient, not merely different.

## Matrix (mutant × fixture)

| mutant | rev-A (E1 def.) | rev-B (E2 def.) | rev-C (E3 def.) | rev-D (E4 def.) |
|---|---|---|---|---|
| pristine | UNMET 4/5 | UNMET 4/5 | UNMET 4/5 | UNMET 4/5 |
| D1-drop-E1 | **HELD 4/4 exit 0** | UNMET 3/4 | UNMET 3/4 | UNMET 3/4 |
| D2-drop-E2 | UNMET 3/4 | **HELD 4/4 exit 0** | UNMET 3/4 | UNMET 3/4 |
| D3-drop-E3 | UNMET 3/4 | UNMET 3/4 | **HELD 4/4 exit 0** | UNMET 3/4 |
| D4-drop-E4 | UNMET 3/4 | UNMET 3/4 | UNMET 3/4 | **HELD 4/4 exit 0** |
| D5-drop-E5 | UNMET 3/4 | UNMET 3/4 | UNMET 3/4 | UNMET 3/4 |
| R1-relax-clauses | UNMET 4/5 | UNMET 4/5 | UNMET 4/5 | UNMET 4/5 |
| R2-relax-bound | UNMET 4/5 | UNMET 4/5 | UNMET 4/5 | UNMET 4/5 |
| R6-relax-both | UNMET 4/5 | **HELD 5/5 exit 0** | UNMET 4/5 | UNMET 4/5 |
| R3-trio-S101 | UNMET 4/5 | UNMET **3/5** | UNMET **3/5** | UNMET **3/5** |
| R4-trio-example | UNMET 4/5 | UNMET **3/5** | UNMET **3/5** | UNMET **3/5** |
| R5-census-always | UNMET 4/5 | UNMET 4/5 | UNMET 4/5 | UNMET 4/5 |
| R7-drop-all | — | — | — | `UNMET held=0/0 checks=0` exit 1 |

No mutant crashed: across the **63 stored scored runs** (`out/*.out`, all carrying a
`DOCTRINE52_{HELD,UNMET}` line) exactly **one** has non-empty stderr, and it is my own
invalid pairing (scratch-tree lane × base rev, where `git archive` has no such object):
`DOCTRINE52: FAIL-CLOSED git archive 02c01… exit=2`, no stdout — the probe's fail-closed
path, correct behavior, not a finding. Every scored run observed exit ∈ {0,1} (5 HELD,
58 UNMET).

### Kill transcripts (verbatim)

```
D1 @ rev-A: DOCTRINE52: DOCTRINE52_HELD held=4/4 checks=4 rev=5c5cb661… rule=D52 | E2 PASS | E3 PASS | E4 PASS | E5 PASS
D2 @ rev-B: DOCTRINE52: DOCTRINE52_HELD held=4/4 checks=4 rev=85f6d891… rule=D52 | E1 PASS | E3 PASS | E4 PASS | E5 PASS
D3 @ rev-C: DOCTRINE52: DOCTRINE52_HELD held=4/4 checks=4 rev=6e295859… rule=D52 | E1 PASS | E2 PASS | E4 PASS | E5 PASS
D4 @ rev-D: DOCTRINE52: DOCTRINE52_HELD held=4/4 checks=4 rev=2db70f06… rule=D52 | E1 PASS | E2 PASS | E3 PASS | E5 PASS
R6 @ rev-B: DOCTRINE52: DOCTRINE52_HELD held=5/5 checks=5 rev=85f6d891… rule=D52 | E1 PASS | E2 PASS | E3 PASS | E4 PASS | E5 PASS
R7 @ rev-D: DOCTRINE52: DOCTRINE52_UNMET held=0/0 checks=0 rev=2db70f06… rule=D52 |
```

## Verdicts

| mutant | verdict | reason |
|---|---|---|
| D1, D2, D3, D4 | **KILLED** | prints `HELD held=4/4` exit 0 on a tree missing exactly the dropped check |
| D5-census-always | **SURVIVED (equivalent under green census)** | E5 shells out to `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh` against the **live fleet root**, not the extracted rev, so no rev can make E5 red; the mutated verdict is indistinguishable while the live census is green |
| R1, R2 (single relax) | **SURVIVED** | conjunctive defense: with only one threshold relaxed, the other `>=12` conjunct still fails rev-B, so E2 stays MISS |
| R6 (both relax) | **KILLED** | two-token change flips E2 to PASS, reads `HELD 5/5` on a 1-clause entry (contract requires ≥12) |
| R3, R4 (trio swaps) | **SURVIVED (false-reject only)** | can never fabricate HELD; they flip E1 PASS→MISS on a compliant trio (4/5→3/5), i.e. detectable as over-strictness, not as a blesser |
| R5-census-always | **SURVIVED** | same live-census argument as D5 |
| R7-drop-all | **SURVIVED (guard holds)** | `checks.length > 0` prevents the R52-5 vacuous-HELD `0/0` ⇒ prints UNMET exit 1 |

## Findings

**F1 (primary, counter robustness).** D52's label formula is
`held === checks.length && checks.length > 0` — the denominator is *self-normalizing and
unpinned*. There is no `checks.length === 5` invariant, so deleting any single `hold()`
call yields `HELD held=4/4 exit 0` on a tree that is deficient in precisely the dropped
property (demonstrated for all four rev-controlled checks: D1/D2/D3/D4). This is the same
class as R52-5 (vacuous HELD) one level up: the guard only rejects 0 checks, not 4. The
same formula is in the A52 probe, so K4's "drop-one-check mutants must never print HELD"
is **not enforced by the code** — only by the seat noticing. Routed, not changed here.

**F2 (Q43 scope).** The frozen base receipt is honestly *executed* but only the
entry-absent branch runs; `held=0/5 checks=5` is a literal in the guard. Any counter
mutation, however destructive, passes a base-rev detector. Claim-C2 counter evidence must
therefore come from a rev where the entry exists (close/FINAL), not from base.

**F3 (E5 non-hermetic).** E5 executes the live fleet census against
`/home/vgpnk/Projects/shokunin` regardless of `rev`. Consequences both ways: the
census-always-pass mutant is unkillable from rev bytes, and a red live census makes *every*
rev read UNMET even if the entry bytes are perfect. The frozen contract's E5 wording
("the live census", plan § Frozen counters) states this, so it is a known limit, but it is
worth naming at close time: the FINAL D52 receipt's E5 conjunct is state-dependent.

**F4 (sources-check coupling, positive).** E3 and E4 are not independent: any header that
names `S102`/`S103` is also scanned by sources-check (`ENTRY_SOURCE_UNKNOWN`), so the
cheap E3 forgeries (unregistered rows) also trip E4. The surviving E3 kill (rev-C) had to
keep the ids *registered* but `queued` with `used-by —`, which sources-check accepts while
E3 alone rejects. That is a genuinely narrow gap: E3's `status === 'mined'` is the only
thing standing between a `queued` row and HELD under D3.

## Restoration evidence

| item | before | after |
|---|---|---|
| lane probe sha256 | `e1aa408337e6546e82610d3781cafd40a4f166f39526059747e8fa3b92537169` | identical (`git status` shows no modification to the probe) |
| pristine copy sha256 | same | same |
| pristine base re-run | `UNMET held=0/5 … E1 MISS entry-absent`, rc 1 | `cmp` identical to the first run, rc 1 |
| lane jj state | `1ba37040f9b5` (unchanged; no mutating jj/git commands) | unchanged |

The lane probe was never written; mutants exist only as separate files under
`build/MutProbeD/mutants/`. Only `build/MutProbeD/**` and this report were written under the
lane (plus `/tmp/sc_a.txt`, `/tmp/sc_b.txt` scratch from sources-check verification).

## Artifacts (absolute)

```
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-52/build/MutProbeD/
  probe/pristine.mjs              frozen copy (sha e1aa4083…, read-only)
  mutants/{D1..D5,R1..R7}.mjs     12 mutants, one anchored replacement each
  mutants.json                    per-mutant axis/description/sha256/byte delta
  gen-mutants.py                  generator (asserts anchor count == 1, pins pristine sha)
  build-scratch.py                rev-A/rev-B fixture builder
  build-extra-revs.py             rev-C/rev-D fixture builder
  tree/                           scratch git repo (extracted tip + rows + 4 fixture commits)
  revs.txt, revs-extra.txt        fixture rev hashes
  table.tsv                       derived base+fixture matrix
  out/base-runs.txt               base-rev run log (all 12 + pristine)
  out/matrix.txt                  rev-A/rev-B matrix log
  out/matrix-extra.txt            rev-C/rev-D matrix log
  out/<mutant>.<rev>.out|.err     per-run stdout/stderr (0-byte stderr proofs)
  out/node-version.txt            v24.21.0
```

Report: `.ufo/waves/round-52/w1/MutProbeD.md`.

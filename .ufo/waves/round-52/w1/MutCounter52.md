# MutCounter52 — A52 counter mutants (round 52, wave 1)

Seat: `MutCounter52` (mutation-tester, attack role). Item: K4 counter mutants of the FROZEN A52
counter. Target: lane `kumitate-shokunin` at base rev
`02c01258464cac3804faf177d0cfbf113cd59706` (the freeze base named in `plan.md`).

**Verdict headline.** The (b) vacuous-HELD class is genuinely killed (transcript saved and
verified). The (a) drop-one class and the (d) verdict class are **not** killed by the probe's own
label/exit; they are killed only by the frozen predicate sentence's literal `held=13/13 checks=13`.
The (c) relaxed-threshold class is **untested at base** — all three mutants emit byte-identical
stdout to pristine. K4's wording ("must never print HELD") is therefore satisfiable only if the
detector is the frozen predicate string, not the probe; a freeze repair is recommended below.

## Evidence layout (all under `build/MutCounter52/`)

| path | content |
|---|---|
| `pristine.mjs` | byte copy of the frozen probe, sha256 `f6146a2cfd3fba984848c5b91c1d2570108dc751d5edca5939d6f4aee5171428` |
| `mutants/*.mjs` | 19 mutants (13 drop-one, 1 hold-deleted, 3 relaxed-threshold, 2 verdict) |
| `mutants/*.out` | exact stdout+stderr of each mutant executed at the base rev |
| `mutants/manifest.json` | per-mutant sha256 + transformation provenance |
| `mutants/results.json` | structured results (exit, label, held, per-check PASS/MISS, predicate match) |
| `TABLE.md` | the required mutant table |
| `counter-mutant.txt` | **required B5c artifact** — hold-call-deleted transcript |
| `guard-witness.{mjs,json}` | positive witness: frozen tail bytes on a synthetic `checks` array |
| `baseline.out` | pristine control run at base (matches the freeze receipt exactly) |

Detection protocol: one bounded detector per mutant, identical invocation
`node <mutant>.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin 02c01258464cac3804faf177d0cfbf113cd59706`,
20 executions, 76.7 s total (~3.6 s each). Every mutant is a **copy**; each transformation was
asserted to match exactly once in the source text, and each mutant's diff vs pristine is
`-1/+0` (drop-one/b-threshold) or `-1/+1`/`-2/+2`/`-3/+3` — recorded in `TABLE.md`.

## Baseline (pristine, same detector, same rev)

```
ATTEST52: ATTEST52_UNMET held=5/13 checks=13 rev=02c01258464cac3804faf177d0cfbf113cd59706 rule=A52 version=v1 | B1 MISS exit=0 cases=0 ... | B2c PASS | B3c PASS | B4c PASS | B4d PASS | B5c MISS mutantReceipt=absent-or-malformed selfGuard=present | B6 PASS
exit 1
```
Byte-for-byte the committed freeze receipt `base/attest52-base.txt` (same held, same eight MISSes).
So the baseline is a legitimate "pristine" leg and the base carries **8 independent misses**
(B1, B1c, B2, B2e, B3, B4, B5, B5c).

## (b) hold-call-deleted — SAVED TRANSCRIPT (the B5c artifact)

Transformation (one line, in a copy):
```
- const hold = (id, ok, detail) => { if (typeof id === 'string') checks.push({ id, ok, detail }); };
+ const hold = (id, ok, detail) => { /* hold-call DELETED: no check is ever recorded */ };
```
Run at the base rev:

```
ATTEST52: ATTEST52_UNMET held=0/0 checks=0 rev=02c01258464cac3804faf177d0cfbf113cd59706 rule=A52 version=v1 | 
exit 1
```

Saved at `.ufo/waves/round-52/build/MutCounter52/counter-mutant.txt` (assembled transcript:
header + exact stdout + `exit 1` + control + restoration note; the stdout line was `cmp`-verified
byte-identical to `mutants/b-hold-deleted.out`, exit code 1 observed from `subprocess`).

Pattern verification on the **saved file** (the exact bytes B5c will read):
```
PATTERN OK: ATTEST52_UNMET
PATTERN OK: held=0/0
PATTERN OK: exit 1
```
**Verdict: KILLED.** The guard at `attest52-probe.mjs:470/472/474` (`checks.length > 0`) catches the
vacuous case exactly as designed (R52-5). This is the one arm of K4 that is sound.

⚠ Dependency the integrator must honour: B5c reads that path from `git archive <rev>`, so
`counter-mutant.txt` must be **committed** at the close rev (it is currently an untracked build
artifact of this seat). The path in the transcript header is relative to the lane root, which is
also where B5c resolves it — no repath needed.

## (a) drop-one-check — 13/13 executed, all UNMET at base

| mutant | exit | label | held | frozen predicate |
|---|---|---|---|---|
| `a-drop-B1` | 1 | ATTEST52_UNMET | 5/12 | no-match |
| `a-drop-B1c` | 1 | ATTEST52_UNMET | 5/12 | no-match |
| `a-drop-B2` | 1 | ATTEST52_UNMET | 5/12 | no-match |
| `a-drop-B2c` | 1 | ATTEST52_UNMET | 4/12 | no-match |
| `a-drop-B2e` | 1 | ATTEST52_UNMET | 5/12 | no-match |
| `a-drop-B3` | 1 | ATTEST52_UNMET | 5/12 | no-match |
| `a-drop-B3c` | 1 | ATTEST52_UNMET | 4/12 | no-match |
| `a-drop-B4` | 1 | ATTEST52_UNMET | 5/12 | no-match |
| `a-drop-B4c` | 1 | ATTEST52_UNMET | 4/12 | no-match |
| `a-drop-B4d` | 1 | ATTEST52_UNMET | 4/12 | no-match |
| `a-drop-B5` | 1 | ATTEST52_UNMET | 5/12 | no-match |
| `a-drop-B5c` | 1 | ATTEST52_UNMET | 5/12 | no-match |
| `a-drop-B6` | 1 | ATTEST52_UNMET | 4/12 | no-match |

Every one reads UNMET (denominator drops 13→12; `held` drops only when the deleted hold was a
PASS). **But this UNMET is not a kill**: base already carries 8 misses, so no drop-one mutant can
print HELD here. The base leg cannot discriminate this class.

**Positive witness** (`guard-witness.mjs`: the four frozen decision lines copied verbatim from
`attest52-probe.mjs:470,472,474`, only `checks` synthesized):

| synthetic checks | exit | label | held |
|---|---|---|---|
| 13, all ok | 0 | ATTEST52_HELD | 13/13 |
| **12, all ok (drop-one on a green tree)** | **0** | **ATTEST52_HELD** | **12/12** |
| 13, none ok | 1 | ATTEST52_UNMET | 0/13 |
| 0, all ok | 1 | ATTEST52_UNMET | 0/0 |

**Verdict on the class: SURVIVES the probe's own verdict detector.** At the close post-state
(13/13 green) deleting any single `hold(...)` call prints `ATTEST52_HELD held=12/12 checks=12` and
exits **0** — the guard compares `held === checks.length` and never pins 13 or the ID set. It is
killed only by the frozen predicate sentence (`held=13/13 checks=13` is a literal), i.e. by the
*string* consumer, not by the counter's exit code.
Independently reproduced by seat `CritQ43` (`build/CritQ43/guard-counterexample.txt`, same 12/12).

## (c) relaxed thresholds — executed, all UNMET, all kills vacuous

| mutant | transformation | exit | label | held | stdout == pristine |
|---|---|---|---|---|---|
| `c-span-300-to-0` | `span < 300` → `span < 0` (2 sites: guard + miss message) | 1 | ATTEST52_UNMET | 5/13 | **yes** |
| `c-cases-30-to-1` | `cases >= 30` → `cases >= 1` | 1 | ATTEST52_UNMET | 5/13 | **yes** |
| `c-prior-files-ignored` | nonce-reuse hit test → `if (false)` | 1 | ATTEST52_UNMET | 5/13 | **yes** |

All three print UNMET, as required — but their **stdout is byte-identical to pristine**, so the base
run does not exercise any of the three thresholds (B2 misses on absent receipts; B4 misses on the
absent receipts dir; B1's `cases=0` is below every threshold ≥1, so `cases>=1` does not even flip
B1's PASS/MISS bit). **Verdict: survived-but-inconclusive at base** — the kill comes from unrelated
misses. These three thresholds have **no base-side witness** and will only ever be exercised at a
green post-state; the plan should say so rather than counting their base UNMET as a kill.

## (d) verdict-swap — executed, prints HELD, killed only by the predicate string

| mutant | transformation | exit | label | held | K4 | frozen predicate |
|---|---|---|---|---|---|---|
| `d-verdict-swap` | label map and exit map both inverted (coherent liar) | **0** | **ATTEST52_HELD** | 5/13 | VIOLATED | no-match |
| `d2-always-held` | label → `'ATTEST52_HELD'`, `process.exit(0)` | **0** | **ATTEST52_HELD** | 5/13 | VIOLATED | no-match |

**Verdict: SURVIVES the probe-label detector, KILLED by the frozen predicate sentence** (which
requires the literal `held=13/13 checks=13`, and 5/13 ≠ 13/13). Note the class definition: a
verdict swap necessarily prints HELD on an UNMET tree, so the plan clause "must read UNMET" is
logically unsatisfiable for (d) — the only meaningful detector for (d) is the predicate string.
Recommend the plan phrase (d)'s expectation against the predicate, not the label.

## Findings routed to the plan owner (freeze repair, plan.md addendum class)

1. **K4 is underconstrained as written.** "Drop-one-check ... must never print HELD" cannot be
   established at base and is *false* at a green post-state (`held=12/12`, exit 0; §(a) witness).
   The counter's exit code is therefore not a sound detector for the class; only the frozen
   predicate string kills it. Suggested freeze repair: pin the expected set in the final guard,
   e.g. `const EXPECTED = ['B1','B1c','B2','B2c','B2e','B3','B3c','B4','B4c','B4d','B5','B5c','B6']`
   and require `checks.length === EXPECTED.length && EXPECTED.every((id) => checks.some((c) => c.id === id && c.ok))`
   before printing HELD; and/or add a B5d source check asserting the pin is present. Per `plan.md`
   ("Any freeze repair after a seat finding re-runs both and commits fresh base receipts under the
   same paths"), a repair requires **both** `base/attest52-base.txt` and `base/doctrine52-base.txt`
   re-runs, plus a numbered addendum.
2. **B5c covers only the (b) arm.** It proves the empty-set guard, not the drop-one or verdict
   classes. If K4 is to be evidenced, B5c needs the green-tree arm (or the source pin in 1).
3. **The three (c) thresholds have no base witness** (byte-identical stdout). Their base UNMET is
   not a kill; do not record it as one in the SCORECARD kill table.

## Restoration evidence

- The frozen probe was **never written to**: `build/MutCounter52/pristine.mjs` is a copy whose
  sha256 equals the frozen file's, and both are
  `f6146a2cfd3fba984848c5b91c1d2570108dc751d5edca5939d6f4aee5171428` before **and** after the probe
  (`sha256sum` re-run after the mutant battery).
- `git status --porcelain -- .ufo/waves/round-52/probe/` → empty (probe tree unmodified).
- `doctrine52-probe.mjs` untouched: `e1aa408337e6546e82610d3781cafd40a4f166f39526059747e8fa3b92537169`.
- All mutant bytes live only under `build/MutCounter52/`; nothing outside this seat's build dir and
  this report was written. No git/jj mutation; no pacman transaction; **no tool installed or
  upgraded** during this seat (node 22-class runtime already present).

## Time / method

20 detector runs in 76.7 s, total seat wall time inside the 15-minute box. Mutants generated by an
asserted single-occurrence transformer (each replacement count asserted == 1, each mutant asserted
to differ from pristine), so no mutant is a silent no-op. TABLE.md carries the full per-mutant
diff-size and note columns.

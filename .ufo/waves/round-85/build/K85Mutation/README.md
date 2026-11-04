# K85Mutation — mutation battery for C1 (`counter-receipt` v2)

Lane revision measured: `9db0c6b5eb9111cfc5581006ba976ca2cd112792`.
Production `scripts/counter-receipt.mjs` is untouched
(sha256 `190a4c1f893a5ffc0c735a63e7155c830ae9cf2ed038fe7b870bebb11c254ec0`).
Frozen probe sha256 `6e7b1eb77988f58e7469661e5e412fb9048dda2a275dd9eec4e9acbf7a53ec94`.

This directory holds **two batteries over the same 14 behavioural classes**:

1. **Candidate battery (primary)** — `mutants-candidate/`, `receipts-candidate/`,
   `candidates.json`, `table-candidate.md`. Base is the K85ExecGate candidate, copied
   byte-exact to `candidate-ref/scripts/counter-receipt.mjs`
   (sha256 `7659be6e5ea5155a386fddfd3bad7abf5147562391c415d1e8200f9151508bc1`).
   It scored `C85_C1: HELD held=20/20` exit 0 and `CONTENT_VARIATION: HELD held=3/3` before
   any mutation (`receipts-candidate/ref-*.txt`).
2. **Reference battery (substrate)** — `mutants/`, `receipts/`, `mutants.json`, `table.md`.
   When this seat started, `build/K85ExecGate/counter-receipt.mjs` did not exist, so the base
   was a v2 reference written to the frozen contract (`ref/`, sha256
   `34bb75b45d50fed8fc8c101128af2dbf9c0755a42920add44fdedc1cf0cc3c33`), likewise validated
   20/20 + 3/3 first. It is a mutation substrate, not the claim and not an integration
   candidate.

## Method

Each mutant is one anchored literal substitution: the generator asserts exactly **one**
occurrence of the anchor and substitutes once; the exact unified diff is appended to the
receipt. Command shape:

```
node .ufo/waves/round-85/probe/probe85-c1.mjs --lane <BUILD>/{candidate-ref|mutants-candidate/<id>-<name>} \
     --work /fast/scratch/hyaku/kumitate-r85/K85Mutation/cwork/<id>
```

## Candidate battery — 11/14 killed, 3/14 survived

| id | mutant | single change | exit | probe | killing arm | content-variation |
|---|---|---|---|---|---|---|
| REF | unmutated candidate | — | 0 | HELD 20/20 | — | HELD 3/3 |
| M01 | sha256-dropped | derived line prints `sha256=-` | 1 | UNMET 2/20 | `clean` | UNMET 0/3 |
| M02 | bytes-zero | prints `bytes=0` always | 1 | UNMET 2/20 | `clean` | UNMET 0/3 |
| M03 | src-never-read | never reads `--src`; canned 3-site source | 1 | UNMET 18/20 | `src-arity` | HELD 3/3 |
| M04 | arm-unbound-unreachable | `ARM_UNBOUND` disabled | 1 | UNMET 19/20 | `src-unbound` | HELD 3/3 |
| M05 | declared-mismatch-accepted | `SOURCE_DECLARED` disabled | 1 | UNMET 19/20 | `src-declared` | HELD 3/3 |
| M06 | held-constant | prints `held=-/-` always | 1 | UNMET 3/20 | `clean` | UNMET 0/3 |
| M07 | derived-line-clean-only | `RECEIPT:` line only when CLEAN | 1 | UNMET 4/20 | `hidden-red` | UNMET 2/3 |
| M08 | nonce-excluded-from-hash | strips metadata before hashing | 1 | UNMET 2/20 | `clean` | HELD 3/3 |
| M09 | rows-count-malformed | `rows` counts malformed arms | 1 | UNMET 19/20 | `malformed-arm` | HELD 3/3 |
| M10 | duplicate-accepted | `ARM_DUPLICATE` disabled | 1 | UNMET 19/20 | `duplicate` | HELD 3/3 |
| M11 | arm-failed-unreachable | `ARM_FAILED` disabled | 1 | UNMET 19/20 | `honest-red` | UNMET 2/3 |
| S01 | absent-declared-rendered-0 | `declared=0` for an undeclared source | 0 | **HELD 20/20** | NONE | HELD 3/3 |
| S02 | first-arms-declaration-wins | first `ARMS = <int>` instead of last | 0 | **HELD 20/20** | NONE | HELD 3/3 |
| S03 | colon-metadata-not-ignored | `command:`/`rev:`/`exit:` parsed | 0 | **HELD 20/20** | NONE | HELD 3/3 |

`M07` scores 4/20 on the candidate (5/20 on the reference) because the candidate prints the
derived line from the same statement as the unreadable-receipt branch, so the `missing` arm
also loses it; the first kill is still `hidden-red`.

## Reference battery — 11/14 killed, 3/14 survived

Same classes, same kills, same survivors (`table.md`, `mutants.json`, `receipts/`):
`M01/M02/M06/M08` → `clean`; `M03` 18/20 → `src-arity`; `M04` → `src-unbound`;
`M05` → `src-declared`; `M07` 5/20 → `hidden-red`; `M09` → `malformed-arm`;
`M10` → `duplicate`; `M11` → `honest-red`; `S01/S02/S03` survive 20/20.
Every mutant exits 1 when killed, 0 when it survives.

## Reading the kills

- `M01/M02/M06/M08` die at `clean`: the input-derived `RECEIPT:` line is the load-bearing
  detector. Drop the digest, the byte count, the held counts, or the nonce bytes from the
  digest, and the first receipt arm goes red while every verdict/exit assertion still agrees.
- `M07` dies at `hidden-red`, the first non-clean arm: a counter that only speaks when CLEAN
  cannot pass a red receipt.
- `M03` (never reads `--src`) scores 18/20: the canned source shares the receipt's names, so
  it passes `src-bound-clean` **and** `src-unbound`; only `src-arity`/`src-declared` expose
  it. `ARM_UNBOUND` alone therefore cannot distinguish a source reader from a canned source;
  the arity and declared arms carry that discrimination.
- `M04/M05/M09/M10/M11` die at exactly one arm each: each clause has one covering fixture.

## Survivors — probe coverage findings (contract clauses with no arm)

Each survivor was proven behaviour-bearing, not equivalent: reference/candidate and mutant
diverge on an input the frozen table never builds
(`receipts/survivor-discriminators.txt`, `receipts-candidate/survivors.txt`,
`non_equivalent: true` in all).

| id | contract clause it violates | frozen probe | candidate `--selftest` |
|---|---|---|---|
| S01 | `SOURCE: … declared=absent` for an undeclared source | 20/20, no kill | FAIL 57/60 (`src-no-declared`) |
| S02 | last `const\|let\|var ARMS = <int>` wins | 20/20, no kill | PASS 60/60 — **uncovered by both** |
| S03 | `command:`/`rev:`/`exit:` metadata ignored | 20/20, no kill | FAIL 59/60 (`metadata-summary-shape`) |

S02 is the residual risk: neither the claim denominator nor the candidate's own regression
suite builds a source with two `ARMS` declarations. S01/S03 are covered by the candidate's
selftest but not by the frozen probe, which is the only claim denominator.

Discarded candidate: case-insensitive `ARM_PREFIX` compare is an **equivalent** mutant —
both summary and arm patterns admit only `[A-Z][A-Z0-9_]*`, so case folding cannot change a
parseable verdict. Excluded from the survivor count.

## Instrument observation — control reach

The frozen content-variation control does not kill `M08` (metadata stripped before hashing):
its three fixtures carry no metadata lines, so the re-derived digest equals the file digest.
Only the probe's per-run nonce kills that class. Expected split (cv catches canned/cached
answers, the probe catches partial reads), recorded so the control's reach is not overstated.

## Contract finding (reported, not repaired)

The plan's real-task row for r84 is not measurable under the frozen grammar.
`round-84/close/history-red.txt` and `history-repair.txt` are 4-line **tool receipts**
(`rev=`, `command=`, `COUNTER_RECEIPT: …`, `exit=`): no arm rows and no summary, so both read
`FAIL-CLOSED SUMMARY_COUNT`, exit 2 — not `DRIFT`/`CLEAN` (`receipts/real-task.txt`). The r83
half reproduces exactly (`c1-probe` → DRIFT ARMS_TOTAL, rows=28 held=27/27; `c1-repair` →
CLEAN 28/28; `c2-probe` → CLEAN 16/16). The r84 row either refers to the verdicts those
receipts record rather than a fresh measurement, or needs a rule the contract does not have.

## Integrity

- Production file untouched before/after (sha256 above); K85ExecGate candidate read-only,
  copied byte-exact for mutation.
- Frozen probe/plan/controls read-only. No writes outside `build/K85Mutation/**` and the seat
  report. No git/jj mutation, no commits.
- Frozen controls re-scored read-only: `base` 1/20, `stub` 0/20, `noreader` 1/20
  (`receipts/controls-recheck.txt`).
- Scratch `/fast/scratch/hyaku/kumitate-r85/K85Mutation/` deleted after receipts were copied;
  every probe `--work` was under it, never `/tmp`.
- No installs or updates; existing Node v24.21.0 only.

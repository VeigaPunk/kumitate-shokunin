# K85Mutation — mutation battery for C1 (`counter-receipt` v2)

rev=`9db0c6b5eb9111cfc5581006ba976ca2cd112792` (freeze; base `a5d3e75…`, repair `6663b3b…`)
Frozen probe sha256 `6e7b1eb77988f58e7469661e5e412fb9048dda2a275dd9eec4e9acbf7a53ec94`
Frozen plan sha256 `6a20a83321a0026c956aa2f30fdb138909807196013853553d008613114c1f4d`
K85ExecGate candidate sha256 `7659be6e5ea5155a386fddfd3bad7abf5147562391c415d1e8200f9151508bc1`
Reference substrate sha256 `34bb75b45d50fed8fc8c101128af2dbf9c0755a42920add44fdedc1cf0cc3c33`

Axes: operability + coverage. **Advice only — this seat is not the non-author closure**, and
no SHONEN box or production file was touched.

## Scope — two batteries, same classes

`build/K85ExecGate/counter-receipt.mjs` was **absent** when this seat started, so the battery
was first derived from a v2 reference written to the frozen contract
(`build/K85Mutation/ref/`), validated `HELD 20/20` + `HELD 3/3` **before** any mutation. The
candidate appeared mid-seat (15:57Z, `HELD 20/20` + `HELD 3/3` in a scratch lane); the whole
battery was then re-derived against its own bytes. Both batteries are in the build dir; the
candidate battery is primary because that is the artifact that may be integrated.

Single-change discipline: the generator asserts exactly **one** occurrence of each anchor and
substitutes once; the exact unified diff is appended to every receipt, and each receipt names
the command, exit, lane revision and both sha256 values.

Command shape:

```
node .ufo/waves/round-85/probe/probe85-c1.mjs --lane <BUILD>/mutants-candidate/<id>-<name> \
     --work /fast/scratch/hyaku/kumitate-r85/K85Mutation/cwork/<id>
```

## Candidate battery (primary) — 11/14 killed, 3/14 survived

| id | mutant | single change | exit | probe | killing arm | content-variation |
|---|---|---|---|---|---|---|
| REF | unmutated candidate | — | 0 | HELD 20/20 | — | HELD 3/3 |
| M01 | sha256-dropped | derived line prints `sha256=-` instead of the digest | 1 | UNMET 2/20 | `clean` | UNMET 0/3 |
| M02 | bytes-zero | prints `bytes=0` always | 1 | UNMET 2/20 | `clean` | UNMET 0/3 |
| M03 | src-never-read | never reads `--src`; canned 3-site/`ARMS=3` source | 1 | UNMET 18/20 | `src-arity` | HELD 3/3 |
| M04 | arm-unbound-unreachable | `ARM_UNBOUND` check disabled | 1 | UNMET 19/20 | `src-unbound` | HELD 3/3 |
| M05 | declared-mismatch-accepted | `SOURCE_DECLARED` check disabled | 1 | UNMET 19/20 | `src-declared` | HELD 3/3 |
| M06 | held-constant | prints `held=-/-` always | 1 | UNMET 3/20 | `clean` | UNMET 0/3 |
| M07 | derived-line-clean-only | prints `RECEIPT:` only when CLEAN | 1 | UNMET 4/20 | `hidden-red` | UNMET 2/3 |
| M08 | nonce-excluded-from-hash | strips metadata lines before hashing | 1 | UNMET 2/20 | `clean` | HELD 3/3 |
| M09 | rows-count-malformed | `rows` also counts malformed arm lines | 1 | UNMET 19/20 | `malformed-arm` | HELD 3/3 |
| M10 | duplicate-accepted | `ARM_DUPLICATE` check disabled | 1 | UNMET 19/20 | `duplicate` | HELD 3/3 |
| M11 | arm-failed-unreachable | `ARM_FAILED` check disabled | 1 | UNMET 19/20 | `honest-red` | UNMET 2/3 |
| S01 | absent-declared-rendered-0 | `declared=0` for an undeclared source | 0 | **HELD 20/20** | NONE — survived | HELD 3/3 |
| S02 | first-arms-declaration-wins | first `ARMS = <int>` instead of the last | 0 | **HELD 20/20** | NONE — survived | HELD 3/3 |
| S03 | colon-metadata-not-ignored | `command:`/`rev:`/`exit:` parsed as transcript | 0 | **HELD 20/20** | NONE — survived | HELD 3/3 |

**11/11 mandated classes killed** (the eight named in the seat spec plus `duplicate`,
`ARM_FAILED`, `rows`). `M07` scores 4/20 here (5/20 on the reference) because the candidate
prints the derived line from the same statement as the unreadable branch, so `missing` also
loses it; the first kill is still `hidden-red`.

## Reference battery (substrate) — same profile

`table.md` / `mutants.json` / `receipts/`: identical kills and survivors —
`M01/M02/M06/M08` 2–3/20 at `clean`; `M03` 18/20 at `src-arity`; `M04` at `src-unbound`;
`M05` at `src-declared`; `M07` 5/20 at `hidden-red`; `M09` at `malformed-arm`; `M10` at
`duplicate`; `M11` at `honest-red`; `S01/S02/S03` at 20/20. Both bases exit 0 unmutated.

## Reading the kills

- `M01/M02/M06/M08` die at `clean`: the input-derived `RECEIPT:` line is the load-bearing
  detector. Drop the digest, the byte count, the held counts, or the nonce bytes from the
  digest, and the first receipt arm goes red while every verdict/exit assertion still agrees.
- `M07` dies at `hidden-red`, the first non-clean arm: a counter that only speaks when CLEAN
  cannot pass a red receipt.
- `M03` (**never reads `--src`**) still scores 18/20 on both bases: the canned source shares
  the receipt's names, so it passes `src-bound-clean` **and** `src-unbound`; only
  `src-arity`/`src-declared` expose it. Consequence: `ARM_UNBOUND` alone cannot distinguish a
  source reader from a canned source; arity and declared carry that discrimination.
- `M04/M05/M09/M10/M11` die at exactly one arm each — each clause has one covering fixture.

## Survivors — probe coverage findings, not contract changes

Each was proven **non-equivalent** by running base and mutant over an uncovered input where
the contract is explicit (`receipts-candidate/survivors.txt`,
`receipts/survivor-discriminators.txt`; `non_equivalent: true` in all).

| id | contract clause it violates | frozen probe | candidate `--selftest` |
|---|---|---|---|
| S01 | `SOURCE: … declared=absent` for an undeclared source | 20/20, no kill | FAIL 57/60 (`src-no-declared`) |
| S02 | last `const\|let\|var ARMS = <int>` wins | 20/20, no kill | PASS 60/60 — **uncovered by both** |
| S03 | `command:`/`rev:`/`exit:` metadata ignored | 20/20, no kill | FAIL 59/60 (`metadata-summary-shape`) |

The frozen 20-case table has **no arm** for any of the three clauses. `S02` is the residual
risk: neither the claim denominator nor the candidate's regression suite builds a source with
two `ARMS` declarations. `S01`/`S03` are covered by the candidate's selftest but not by the
probe, which is the only claim denominator.

Discarded candidate, for the record: case-insensitive `ARM_PREFIX` compare is an *equivalent*
mutant — both summary and arm patterns admit only `[A-Z][A-Z0-9_]*`, so case folding cannot
change a parseable verdict. Excluded from the survivor count rather than reported as a gap.

## Instrument observation — control reach

The frozen content-variation control does not kill `M08` (metadata stripped before hashing):
its three fixtures carry no metadata lines, so the re-derived digest equals the file digest.
Only the probe's per-run nonce kills that class — the intended split (cv catches canned/cached
answers, the probe catches partial reads), recorded so the control's reach is not overstated.

## Contract finding (reported, not repaired; predicate untouched)

The plan's real-task row for r84 is not measurable under the frozen grammar.
`round-84/close/history-red.txt` and `history-repair.txt` are 4-line **tool receipts**
(`rev=`, `command=`, `COUNTER_RECEIPT: …`, `exit=`): no arm rows and no summary, so both read
`FAIL-CLOSED SUMMARY_COUNT`, exit 2 — not the plan's `DRIFT`/`CLEAN`
(`receipts/real-task.txt`). The r83 half reproduces exactly with the reference:
`c1-probe` → `DRIFT ARMS_TOTAL` exit 1, rows=28 held=27/27; `c1-repair` → CLEAN 28/28 exit 0;
`c2-probe` → CLEAN 16/16 exit 0. Either the r84 row refers to the verdicts those receipts
*record* rather than a fresh measurement, or it needs a contract rule that does not exist.
For L1 to resolve; the 20-case denominator is unaffected.

## Integrity and evidence

- Production `scripts/counter-receipt.mjs` untouched: sha256
  `190a4c1f…254ec0` before and after. Candidate read-only, copied byte-exact for mutation.
- Frozen probe, plan and controls read-only; hashes above. Writes confined to
  `build/K85Mutation/**` and this report. No git/jj mutation, no commits.
- Control re-score for harness sanity (read-only): `base` 1/20, `stub` 0/20, `noreader` 1/20
  — reproduces the frozen pre-data values (`receipts/controls-recheck.txt`).
- Scratch `/fast/scratch/hyaku/kumitate-r85/K85Mutation/` deleted after receipts were copied;
  every probe `--work` was under it, never `/tmp`.
- No installs or updates; existing Node v24.21.0 only.
- Observed concurrent foreign change: `SCORECARD.md` and `.ufo/pins/readme-map.json` became
  modified at 15:52–15:54Z by another seat while this seat ran (my first status at ~15:51Z
  showed them clean). I did not modify or revert them.

## What L1 must re-run

The 20-case probe must be run once at the integrated tree; these batteries measured
`build/K85Mutation/candidate-ref` and `build/K85Mutation/ref`, not the integration point. If
the integrated candidate differs textually, each receipt's before/after diff lets the 14
behavioural classes be re-applied by hand. No regression is attributable to this seat: it
wrote no production file and no shared tree file.

## Build artifacts

Under `.ufo/waves/round-85/build/K85Mutation/`: `README.md`, `table.md`, `table-candidate.md`,
`mutants.json`, `candidates.json`, `mutate.mjs`, `mutate-candidate.mjs`, `discriminators.mjs`,
`discriminators-candidate.mjs`, `finalize.mjs`, `ref/`, `candidate-ref/`,
`mutants/<id>-<name>/` (14), `mutants-candidate/<id>-<name>/` (14),
`receipts/` (19 files), `receipts-candidate/` (17 files).

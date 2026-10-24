# MutInstrument — literal-mutant battery (round 52, wave 1)

## Target

Primary target: **`build/ExecInstrumentV2/receipt-attest.mjs`** (v2 deliverable). It was absent at
probe start, so the battery began on the v1 fallback; the executor then wrote the deliverable
mid-seat and the battery re-ran against it. Snapshot pinned for this report:

- `scratch/v2-delivered.mjs` = `sha256 4d9d824a5d2be764a56cf0f49c2c2092556681266fc9b215103619b2db20ab77`
- `ATTEST_SELFTEST: PASS (44/44)`, 757 lines, `CONTRACT = kumitate-receipt-attest-v2`
- **Observed churn:** `9531e898…` (42/42) at 01:08:30, `4d9d824a…` (44/44) at 01:10:28. The
  executor was still writing. **Re-run at integration against the final bytes** — `detector.mjs`
  needs no change.
- Baseline on the snapshot: **23/23 detectors PASS** (v1, by contrast, fails 9/23).

Method: 18 single-site mutants generated from content-addressed anchors (each anchor asserted to
match exactly once), scored on the same bounded detector before/after. Detector PASS = the
contract arm held; detector FAIL = the arm broke, i.e. the mutant was killed. Pristine target
verdict is PASS for every row.

## Mutant table (delivered v2)

| id | category | single-site defect | Δlines | target | mutant | killed | own selftest | frozen A52 kill |
|---|---|---|---|---|---|---|---|---|
| V01 | clock | drop CLOCK round-trip check | 5 | D2 | FAIL (VALID) | YES | **FAIL (killed)** | B1c |
| V02 | clock | ordering tolerance widened 1 day | 1 | D14 | FAIL (VALID) | YES | PASS (**survives**) | none |
| V03 | clock | drop finite guard, keep round-trip | 4 | D2b | FAIL (crash) | YES | **FAIL (killed)** | B1c passes a crash |
| V04 | shape | drop field whitelist | 1 | D3 | FAIL (VALID) | YES | **FAIL (killed)** | none |
| V05 | shape | tolerate blank lines | 4 | D4 | FAIL (VALID) | YES | **FAIL (killed)** | none |
| V06 | shape | drop prelude ISO grammar | 1 | D5 | FAIL (TAMPERED) | YES | **FAIL (killed)** | none |
| V07 | shape | drop sidecar-name check | 5 | D6 | FAIL (VALID) | YES | **FAIL (killed)** | none |
| V08 | shape | skip half-pair removal | 2 | D7 | FAIL (receipt left) | YES | **FAIL (killed)** | none |
| V09 | stdin | don't wire nonce into child stdin | 1 | D8 | FAIL (empty stdout hash) | YES | **FAIL (killed)** | B2e |
| V10 | stdin | record hash of empty stdin | 1 | D8 | FAIL (stdin_sha mismatch) | YES | **FAIL (killed)** | B2e |
| V11 | stdin | stdin_sha256 outside inner digest | 1 | D19 | FAIL (VALID) | YES | PASS (**survives**) | none |
| V12 | truncation | sidecar compare → 16-bit prefix | 1 | D9 | FAIL (VALID) | YES | **FAIL (killed)** | case 44 |
| V13 | truncation | inner-digest compare → 16-bit prefix | 1 | D10 | FAIL (VALID) | YES | **FAIL (killed)** | case 43 |
| V14 | truncation | ledger digest compare → 16-bit prefix | 1 | D11 | FAIL (VALID) | YES | PASS (**survives**) | survives B4c shape |
| V15 | verdict | final VALID emission → TAMPERED | 2 | D12 | FAIL (TAMPERED) | YES | **FAIL (killed)** | B2 |
| V16 | verdict | sidecar-mismatch TAMPERED → VALID | 5 | D9 | FAIL (VALID) | YES | **FAIL (killed)** | case 44 |
| V17 | ledger | damaged sidecar treated as attested | 1 | D16 | FAIL (REPLAY) | YES | PASS (**survives**) | none |
| V18 | shape | nonce width relaxed to 8+ hex | 1 | D18 | FAIL (VALID) | YES | PASS (**survives**) | none |

**Score: 18/18 killed by their targeted contract detector; 13/18 killed by the delivered
selftest; 5 survive both the delivered selftest and every frozen-shape check** (V02, V11, V14,
V17, V18). Raw output: `results/mutants-v2.txt`; scored table: `results/results-v2.json`.

## Findings (delivered v2)

**G1 (high) — V14: ledger digest-prefix truncation is killed by nothing in the frozen apparatus,
and the selftest arm named for R52-6 tests the opposite direction.** Delivered case 42
`r52-6-ledger-nonce-16bit-prefix-not-reuse` proves two *distinct* nonces sharing a 16-bit prefix
must both read VALID (false-positive protection). V14 truncates the **digest** comparison, so a
nonce-reusing prior whose digest shares a 16-bit prefix is treated as a byte-identical duplicate
and exempted — the missed-replay direction. V14 survives D1 and survives the frozen B4c shape
(D20 PASS; the frozen twin is not prefix-ground). Only a prefix-ground twin (D11) kills it.

**G2 (medium-high) — V17: dropping the attestation sidecar-hash compare survives the selftest.**
The unattested-copy case is not isolating: its fixture is unattested by the inner digest too, so
removing the sidecar check still leaves it unattested. With the check gone, a prior whose inner
digest is repaired but whose sidecar is damaged counts as ledger evidence (D16: REPLAY, no skip
note). No frozen check carries such a prior.

**G3 (medium) — V11: `stdin_sha256` is outside the inner digest in the test suite's eyes.**
Case 22 `inner-digest-covers-every-semantic-field` was retained from v1 but not extended to the
new field; a receipt with a tampered `stdin_sha256` and a repaired sidecar reads VALID (D19 FAIL).
The instrument binds the field (D19 passes on pristine bytes) — the selftest arm is blind.

**G4 (medium) — V02: widening the ordering tolerance by one day survives all 44 cases** (the
ordering case inverts the clocks by a large margin) and no frozen check scores ordering.

**G5 (low-medium) — V18: relaxing the nonce width to 8+ hex survives all 44 cases.** Case 05 only
checks that generated nonces are 32 hex; no case feeds a short nonce to `verify`.

**G6 (positive) —** the delivered v2 closes the clock, shape, stdin, half-pair and
*ground*-truncation classes: V01/V03/V04/V05/V06/V07/V08/V09/V10/V12/V13/V16 all die to its own
selftest. R52-1, R52-3, R52-8, R52-5, R52-6 (sidecar + inner digest) are behaviourally covered on
this snapshot. R52-6 is **not** covered for the ledger digest compare (G1), and R52-2's damaged-
prior skip is not isolated by its case (G2).

## Fallback battery (run before the deliverable existed)

v1 bytes `scratch/v1-baseline.mjs` = `sha256 44919763ee523f334adaa4242d370435180d07aa0cdd4b85b0a7be870f48e8d9`
(the plan-pinned v1), plus `scratch/v2-rehearsal.mjs` (v1 + the six v2 arms, labelled a rehearsal
oracle) so every requested family had a real site. Baselines: v1 **14/23 PASS, 9 FAIL** — D2, D2b,
D3, D4, D5, D6, D7, D8, D19, i.e. exactly the v2 hardening arms; rehearsal **23/23 PASS**.
18 single-site mutants (`M01..M18`): **18/18 killed by target detector, 2/18 by the rehearsal's
own selftest** (the two verdict arms). Findings from that phase that still stand:

- **F2 (high) — R52-8 is TZ-dependent, measured on identical bytes:** a zone-less prelude reads
  `RECEIPT: VALID` exit 0 under `TZ=UTC` and `RECEIPT: TAMPERED` exit 1 under `TZ=Europe/Paris`,
  on both v1 and the M06 mutant. The delivered v2's case 31 now closes it.
- **F3 (medium) — B1c is weaker than the CLOCK contract:** dropping the finite guard (M03) still
  returns TAMPERED for a rolled date, so B1c passes, but a non-finite field throws
  `RangeError: Invalid time value` (exit 1, stack trace, **no verdict line**). The delivered
  selftest case 36 `v2-nonfinite-clock-is-tampered` kills this (V03) even though B1c would not.
- The three 16-bit truncation mutants survive every *non-ground* frozen fixture (B3 prelude
  rewrite, B4c twin, B4d late-nibble corruption), confirming that the class is closed only by
  explicitly ground fixtures — which the delivered selftest now carries for sidecar (44) and
  inner digest (43), but not for the ledger digest compare (G1).

Full fallback table and per-mutant diffs: `mutant-table.md`, `mutants/manifest.json`.

## Restoration / scope

| artifact | sha256 | state |
|---|---|---|
| `scripts/receipt-attest.mjs` (lane source) | `44919763…8e8d9` | unchanged, never written (v1 still) |
| `scratch/v1-baseline.mjs` | `44919763…8e8d9` | byte copy of v1 |
| `scratch/v2-rehearsal.mjs` | `ee068f9c…80c2` | identical before/after the battery |
| `scratch/v2-delivered.mjs` | `4d9d824a…ab77` | pinned snapshot of the deliverable |
| `build/ExecInstrumentV2/receipt-attest.mjs` | `4d9d824a…ab77` at last read | never written by this seat |

All writes stayed under `build/MutInstrument/` and `w1/MutInstrument.md`. Mutants are sibling
files; no pristine byte was overwritten. No git/jj mutation, no fleet or sibling-lane writes, no
MANIFEST/state writes. Tool installs: none (node v24.21.0 present; no pacman/npx/uv).

## Hand-off

Integration duty: re-run `detector.mjs` (23 detectors) and the 18 `mutants/V*.mjs` against the
final committed v2 bytes; the five surviving rows (V02, V11, V14, V17, V18) should become new
selftest cases before close, and V14 in particular needs a **prefix-ground same-nonce twin** — the
only fixture shape that can kill a ledger digest truncation, and one A52 does not have.

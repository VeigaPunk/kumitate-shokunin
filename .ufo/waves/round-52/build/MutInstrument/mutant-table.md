# MutInstrument — literal-mutant battery, round 52

Target: `.ufo/waves/round-52/build/ExecInstrumentV2/receipt-attest.mjs` — **ABSENT** at probe time
(build/ contains CritFreeze, CritQ43, ExecClockSweep, ExecLedgerRehearsal, ExecProbeSanity, ExecSelftestExec,
MutCounter52, ScoutCensus, ScoutCompanion, ScoutRfc3339 only). Fallback per assignment: v1 bytes
(`scratch/v1-baseline.mjs`, sha256 `44919763…8e8d9`, the plan-pinned v1) plus a **v2-shaped rehearsal oracle**
(`scratch/v2-rehearsal.mjs`) that implements every arm the six requested mutant families attack, so each family
has a real behaviour-bearing site. Mutants are single-site patches of the rehearsal; the lane tree is untouched.

Counters: 18 mutants, 18 killed by their targeted contract
detector, 0 survived, 2 killed by the instrument's own selftest.

## Baseline (pristine bytes, same detectors)

| oracle | PASS | FAIL |
|---|---|---|
| `scratch/v1-baseline.mjs` (pinned v1) | 14/23 | 9/23: D2, D2b, D3, D4, D5, D6, D7, D8, D19 |
| `scratch/v2-rehearsal.mjs` | 23/23 | — |

The 9 v1 FAILs are exactly the v2 hardening arms (CLOCK round-trip, SHAPE whitelist/blank-line/prelude/sidecar-name/
half-pair, STDIN, stdin binding). Baseline failures are not kills; every mutant is scored against the rehearsal baseline.

## Mutant table

| id | category | single-site defect | Δlines | sha256[:12] | target det. | mutant | killed? | selftest kill? | frozen A52 kill | sev if uncovered |
|---|---|---|---|---|---|---|---|---|---|---|
| M01 | clock | drop the CLOCK round-trip check | 11 | `e65e3ba47312` | D2 | FAIL | YES | no | B1c (rolled clock) — same fixture as D2: killed | low |
| M02 | clock | weaken clock ordering by one day | 2 | `a5510747baab` | D14 | FAIL | YES | no | none — no frozen check scores ordering tolerance | medium |
| M03 | clock | drop the finite guard in the round-trip check | 2 | `8837df54e1fc` | D2b | FAIL | YES | no | B1c only asserts "must NOT read VALID": crash still passes B1c (survives, verdict map broken) | medium |
| M04 | shape | drop the field whitelist | 2 | `2e80336fe384` | D3 | FAIL | YES | no | none — B1 selftest is the only possible site, and the rehearsal selftest stays green | medium |
| M05 | shape | tolerate blank lines (restore v1 filter) | 5 | `652d47cce081` | D4 | FAIL | YES | no | none | medium |
| M06 | shape | drop the prelude ISO grammar check (zone-less accepted) | 1 | `253627b96364` | D5 | FAIL | YES | no | none — R52-8 has no frozen check; TZ=UTC reads VALID (measured) | high |
| M07 | shape | drop the sidecar-name check | 5 | `00b7cc69371a` | D6 | FAIL | YES | no | none | medium |
| M08 | shape | skip half-pair removal on sidecar write failure | 1 | `3eb73847a0d3` | D7 | FAIL | YES | no | none | medium |
| M09 | stdin | do not write the nonce to the child's stdin | 2 | `dafcfbb8c724` | D8 | FAIL | YES | no | B2e (probe-captured child stdout) — killed | low |
| M10 | stdin | record the hash of empty stdin instead of the nonce | 2 | `b6dec951f832` | D8 | FAIL | YES | no | B2e (stdin_sha256 = sha256(nonce bytes)) — killed | low |
| M11 | stdin | exclude stdin_sha256 from the inner digest | 1 | `c5a45c6e1853` | D19 | FAIL | YES | no | none — no frozen fixture tampers stdin_sha256 | medium |
| M12 | truncation | sidecar compare truncated to a 16-bit prefix | 2 | `88f6e6a5d75e` | D9 | FAIL | YES | no | survives B3 shape (D22 PASS): a prelude rewrite changes the hash prefix | high |
| M13 | truncation | inner-digest compare truncated to a 16-bit prefix | 2 | `a77162497d16` | D10 | FAIL | YES | no | survives B4d shape (D21 PASS): a late-nibble digest corruption keeps the 16-bit prefix | high |
| M14 | truncation | ledger digest compare truncated to a 16-bit prefix | 2 | `7488cdad313e` | D11 | FAIL | YES | no | survives B4c shape (D20 PASS): the frozen twin is not prefix-ground | high |
| M15 | verdict | final VALID emission swapped to TAMPERED | 2 | `da7fc19e8c6b` | D12 | FAIL | YES | YES | B2 (genuine receipt VALID) — killed | low |
| M16 | verdict | sidecar-mismatch TAMPERED emission swapped to VALID | 4 | `aaac0ab0052b` | D9 | FAIL | YES | YES | B3 (doctored control TAMPERED) — killed | low |
| M17 | ledger | treat a damaged-sidecar prior as attested (drop the hash compare) | 1 | `7607dfe5273d` | D16 | FAIL | YES | no | B4 (unattested prior skipped) — killed | low |
| M18 | shape | relax the nonce width to 8+ hex | 2 | `016757fecf20` | D18 | FAIL | YES | no | none — no frozen fixture widens the nonce | medium |

`mutant` = detector verdict on mutant bytes; detector PASS means the contract arm held (the mutant escaped),
FAIL means the arm broke (the mutant was killed). Pristine target verdict is PASS for every row.

## Findings

**F1 (high) — the R52-6 truncation class has no deterministic kill in the frozen counter.** All three 16-bit-
prefix mutants survive the frozen *fixtures*: B3 prelude rewrite (D22 PASS on M12 — the rewrite moves the prefix),
B4c twin (D20 PASS on M14 — the twin is not prefix-ground), B4d corrupt digest (D21 PASS on M13 — a late-nibble
corruption keeps the prefix byte-identical). They are killed only by a *prefix-ground* forgery (D9/D10/D11),
which A52 does not build. Closure therefore rests entirely on the v2 selftest truncation arms (contract §5), and
B1 only counts `case …: PASS` lines — it cannot see whether those arms exist. A deliverable shipping 30 green
cases without the truncation arms closes R52-6 on paper only.

**F2 (high) — R52-8 (zone-less prelude) has no frozen check and is TZ-dependent, measured.** Same bytes,
`TZ=UTC` → `RECEIPT: VALID` exit 0; `TZ=Europe/Paris` → `RECEIPT: TAMPERED` exit 1, on both v1 and M06.
Only the contract's SHAPE prelude-grammar arm (UNREADABLE exit 2) fixes it, and only the selftest can score it.

**F3 (medium) — B1c is weaker than the CLOCK contract.** M03 drops the finite guard: the rollover fixture still
reads TAMPERED (B1c passes), but a non-finite field now throws `RangeError: Invalid time value` out of
`new Date(NaN).toISOString()`, exit 1 with a stack trace and **no verdict line**. B1c's "must NOT read VALID"
is satisfied by a crash; the contract requires `RECEIPT: TAMPERED`. A v2 verifier can therefore satisfy B1c
while violating the verdict/exit map.

**F4 (medium) — 8 of 18 defect classes are invisible to both the frozen checks and a v1-corpus selftest:**
M02 (ordering tolerance), M04 (whitelist), M05 (blank line), M07 (sidecar name), M08 (half-pair), M11
(stdin_sha256 outside the digest), M18 (nonce width), plus M06. Each needs a v2 selftest case: B1 is the only
counter that could ever observe them.

**F5 (low, informational) —** M09 shows a receipt that is *self-consistent and VALID* while the child received no
stdin at all (`stdout_sha256 = e3b0c442…`, sha256 of empty). The instrument cannot detect this itself; B2e's
probe-captured stdout is the sole kill, so B2e must stay in the frozen set (it is).

## Evidence files

- `detector.mjs` — independent oracle, 22 detectors (D1–D19 + D20–D22 frozen-shape variants)
- `scratch/v1-baseline.mjs`, `scratch/v2-rehearsal.mjs` — pristine bytes under test
- `mutants/M01..M18.mjs`, `mutants/manifest.json` (per-mutant diff + hash)
- `results/mutants.txt` (raw detector output), `results/results.json` (scored table)
- `baseline-v1.txt`, `baseline-rehearsal.txt` — baseline runs

## Restoration

- rehearsal sha256 before/after: `ee068f9c2b92cf95d687698df39a646c83a7a73c2c303dac96ddb898583380c2` / `ee068f9c2b92cf95d687698df39a646c83a7a73c2c303dac96ddb898583380c2` — identical
- lane source `scripts/receipt-attest.mjs` sha256: `44919763ee523f334adaa4242d370435180d07aa0cdd4b85b0a7be870f48e8d9` — unchanged (never written)
- mutants are sibling files; no pristine byte was overwritten. All writes stayed under `build/MutInstrument/`.

---

# PRIMARY TARGET — delivered `build/ExecInstrumentV2/receipt-attest.mjs`

Snapshot pinned at `4d9d824a5d2be764a56cf0f49c2c2092556681266fc9b215103619b2db20ab77`
(`scratch/v2-delivered.mjs`), `ATTEST_SELFTEST: PASS (44/44)`. The executor was still writing
during the seat (observed `9531e898…` 42/42 at 01:08, `4d9d824a…` 44/44 at 01:10): **re-run at
integration on the final bytes.** Baseline on this snapshot: **23/23 detectors PASS**.

| id | category | single-site defect | Δlines | target | mutant | killed | own selftest | frozen A52 | sev |
|---|---|---|---|---|---|---|---|---|---|
| V01 | clock | drop the CLOCK round-trip check | 3 | D2 | FAIL | YES | FAIL | B1c (rolled clock) — killed | - |
| V02 | clock | widen the ordering tolerance by one day | 2 | D14 | FAIL | YES | PASS | none — A52 scores no ordering tolerance | medium |
| V03 | clock | drop the finite guard, keep only round-trip | 4 | D2b | FAIL | YES | FAIL | B1c passes a crash (verdict missing) — medium edge | medium |
| V04 | shape | drop the field whitelist | 1 | D3 | FAIL | YES | FAIL | none — SHAPE whitelist unobserved by A52 | - |
| V05 | shape | tolerate blank lines (v1 filter) | 5 | D4 | FAIL | YES | FAIL | none — blank-line arm is selftest-only | - |
| V06 | shape | drop the prelude ISO grammar check | 1 | D5 | FAIL | YES | FAIL | none — R52-8 arm is selftest-only (now present) | - |
| V07 | shape | drop the sidecar-name check | 5 | D6 | FAIL | YES | FAIL | none | - |
| V08 | shape | skip half-pair removal | 2 | D7 | FAIL | YES | FAIL | none | - |
| V09 | stdin | do not wire the nonce into the child's stdin | 1 | D8 | FAIL | YES | FAIL | B2e — killed | - |
| V10 | stdin | record the hash of empty stdin | 2 | D8 | FAIL | YES | FAIL | B2e — killed | - |
| V11 | stdin | exclude stdin_sha256 from the inner digest | 1 | D19 | FAIL | YES | PASS | none — no frozen fixture tampers stdin_sha256 | medium |
| V12 | truncation | sidecar compare truncated to a 16-bit prefix | 2 | D9 | FAIL | YES | FAIL | selftest case 44 present (killed); B3 shape also differs in prefix | - |
| V13 | truncation | inner-digest compare truncated to a 16-bit prefix | 2 | D10 | FAIL | YES | FAIL | selftest case 43 present (killed) | - |
| V14 | truncation | ledger digest compare truncated to a 16-bit prefix | 2 | D11 | FAIL | YES | PASS | SURVIVES B4c shape (D20 PASS): frozen twin is not prefix-ground; only a ground fixture kills | high |
| V15 | verdict | final VALID emission swapped to TAMPERED | 2 | D12 | FAIL | YES | FAIL | B2 — killed | - |
| V16 | verdict | sidecar-mismatch TAMPERED emission swapped to VALID | 4 | D9 | FAIL | YES | FAIL | selftest case 44 kills it | - |
| V17 | ledger | treat a damaged-sidecar prior as attested | 1 | D16 | FAIL | YES | PASS | none — B4 corpus carries no damaged-sidecar prior | medium-high |
| V18 | shape | relax the nonce width to 8+ hex | 2 | D18 | FAIL | YES | PASS | none — no frozen fixture widens the nonce | low-medium |

Score: **18/18 killed by their targeted contract detector; 13/18 killed by the delivered
selftest; 5 survive both the selftest and every frozen-shape check** (V02, V11, V14, V17, V18).

## Delivered-v2 findings

**G1 (high) — V14: the ledger digest compare truncated to a 16-bit prefix is caught by nothing
in the frozen apparatus, and the delivered selftest arm named for it tests the wrong direction.**
Case 42 `r52-6-ledger-nonce-16bit-prefix-not-reuse` proves two *distinct* nonces sharing a prefix
must both read VALID (false-positive protection). V14 truncates the *digest* comparison, so a
nonce-reusing prior whose digest shares a 16-bit prefix is treated as a byte-identical duplicate
and exempted — the missed-replay direction. V14 survives D1 and survives the frozen B4c shape
(D20 PASS: the frozen twin is not prefix-ground). Only a prefix-ground twin (D11) kills it.

**G2 (medium-high) — V17: dropping the attestation sidecar-hash compare survives the delivered
selftest.** Case 15/40 (unattested copy) is not isolating: its fixture is unattested by the inner
digest as well, so removing the sidecar check still leaves it unattested. A prior with a repaired
inner digest and a damaged sidecar then counts as ledger evidence (D16 FAIL: REPLAY, no skip note).
No frozen check carries such a prior, so this escapes A52 too.

**G3 (medium) — V11: `stdin_sha256` outside the inner digest survives all 44 cases.** The v1 case
`inner-digest-covers-every-semantic-field` was retained but not extended to the new field, so a
receipt with a tampered `stdin_sha256` and a repaired sidecar reads VALID (D19 FAIL).

**G4 (medium) — V02: widening the ordering tolerance by one day survives all 44 cases** (the
ordering case inverts the clocks by a large margin) and there is no frozen ordering check.

**G5 (low-medium) — V18: relaxing the nonce width to 8+ hex survives all 44 cases.** Case 05
only checks generated nonces are 32 hex; no case feeds a short nonce to verify.

**G6 (informational) —** the delivered v2 does close the clock, shape, stdin, half-pair and
ground-truncation classes: V01/V03/V04/V05/V06/V07/V08/V09/V10/V12/V13/V16 are all killed by
its own selftest, and v1 fails 9/23 detectors while this snapshot fails none.


# CritKillRules — kumitate round 58

## Scope and revision binding

Audited the frozen C1 kill rules K1–K6 against committed artifacts at measured integration revision `6affb9ebde37b7d663658f1959d64f0f0b68f480` (R1), with base `c49f2a8dc1e6e5e4341e15ac279185aab7e0be37` and freeze `50548ae5b4a47bb8d8cdc62212ec0648aa3776ee`.

- R1 exists, its parent is the named freeze commit, and R1 is an ancestor of `HEAD` (`01-r1-commit.txt`, `04-r1-before-head.txt`).
- Base → freeze and freeze → R1 ancestry checks both exited 0 (`02-base-before-freeze.txt`, `03-freeze-before-r1.txt`).
- R1 contains the plan, both probes, both base transcripts, both witnesses, and all five controls (`05-r1-artifact-tree.txt`). The plan, probes, base transcripts, and witnesses have identical blob IDs at freeze and R1 (`06-freeze-artifact-tree.txt`).
- The working copies used for the fresh probe runs are byte-identical to R1 for the plan, both probes, `receipt-evidence.mjs`, and `readme-map.mjs`; the scoped `git diff --exit-code R1` was empty and exited 0 (`25-r1-counter-working-diff.txt`).

All evidence filenames below are under `.ufo/waves/round-58/build/CritKillRules/`. Each contains the complete command, cwd, stdout, stderr, and exit code.

## Fresh observed readings

- A58 at R1: `ATTEST58_HELD held=10/10 checks=10`, B1–B10 all PASS, exit 0 (`26-r1-attest58-run.txt`).
- D58 at R1: `DOCTRINE58_HELD held=5/5 checks=5`, E1–E5 all PASS, exit 0 (`28-r1-doctrine58-run.txt`).
- R1 `receipt-evidence --selftest`: all ten cases PASS, including `reproduce-miss`, `sweep-no-files`, and `unparseable-rev`; final `VERDICT: PASS`, exit 0 (`27-r1-receipt-selftest.txt`).

These are scoped counter readings, not a round verdict. They do not erase the artifact findings below.

## K1 — do-nothing

**Committed artifacts:** `.ufo/waves/round-58/base/attest58-base.txt` and the named base commit's tree/pin blobs.

**Corroborated, with a replay-difference finding.**

- The committed base transcript names base `c49f2a8dc1e6e5e4341e15ac279185aab7e0be37` and reads `ATTEST58_UNMET held=0/10 checks=10`: B1 `tool absent`, B2 `nonces=0`, B6 has three `unparsed` argv entries, and B10 reports `version=1` (`12-r1-attest-base.txt`).
- Independent base-tree inspection found `scripts/readme-map.mjs`, the two pin registries, and SCORECARD, but no `scripts/receipt-evidence.mjs` and no round-58 receipts (`20-base-target-tree.txt`). The base gate identifies contract `kumitate-readme-map-v1` and fourteen selftests (`23-base-readme-gate.txt`); the base registry is `version: 1` (`22-base-readme-registry.txt`).
- Base counter pins contain rounds 53–57 only (`21-base-counter-pins.txt`). Exact searches for `pin.receipt-evidence` in base SCORECARD and `"round": 58` in base counter-pins produced no matches and exited 1 (`29-base-no-receipt-evidence-pin.txt`, `30-base-no-round58-counter-pins.txt`). Thus the new pins, not merely the new tool, are independently confirmed absent.
- Fresh A58 replay at base again read `held=0/10 checks=10` and exited 1, corroborating the do-nothing kill (`31-replay-attest58-base.txt`).

**Finding:** the fresh base replay is not byte-identical to the committed base transcript. Its B10 proxy detail adds `K_MEMBERS_DRIFT` and `K_SECTIONS_DRIFT` to the committed transcript's `C2_TOTAL_DRIFT` and `AXES_DRIFT` (`31-replay-attest58-base.txt` versus `12-r1-attest-base.txt`). The 0/10 result and all K1-relevant absences remain unchanged, but the committed B10 detail was not reproduced in this run.

## K2 — static-forgery

**Committed artifacts:** `scripts/receipt-evidence.mjs`, `.ufo/waves/round-58/probe/attest58-probe.mjs` B3/B4, and `.ufo/waves/round-58/controls/CtlForgedReceipt.txt`.

**Mechanism corroborated; named control transcript does not demonstrate the claimed reproduction failure.**

- The R1 tool re-runs every receipt's recorded argv in the judged-revision extraction and compares exit plus stdout/stderr hashes; mismatch calls `UNMET reason=REPRODUCE` (`19-r1-receipt-evidence-tool.txt`). A58 B3 invokes the evidence gate and B4 constructs a zeroed-stdout-digest forgery (`17-r1-attest-probe.txt`).
- Fresh reason-specific corroboration is positive: `case reproduce-miss: PASS` in the ten-case selftest, and B3/B4 PASS at R1 (`27-r1-receipt-selftest.txt`, `26-r1-attest58-run.txt`). A58 B4 accepts any `UNMET` final line, so the reason-specific selftest is the stronger reproduction evidence.

**Finding:** the committed forged-receipt control says only `RECEIPT_EVIDENCE: UNMET reason=LEDGER detail=attest-run-1.txt` (`07-r1-forged-control.txt`). The plan names this file the `R57-V4 reproduction red-before` control. A ledger rejection occurs before reproduction and does not itself demonstrate the claimed reproduction kill. This is an artifact/content mismatch, not a failure of the fresh reproduction selftest.

## K3 — drop-one

**Committed artifacts:** `.ufo/waves/round-58/controls/MutCounter58.txt`, `MutDoctrine58.txt`, and both frozen probes' count guards.

**Corroborated; one guard-implementation weakness found.**

- A58 mutant transcript reads `ATTEST58_UNMET held=9/9 checks=9 ... checks-mismatch want=10` (`10-r1-attest-mutant.txt`).
- D58 mutant transcript reads `DOCTRINE58_UNMET held=4/4 checks=4 ... checks-mismatch want=5` (`11-r1-doctrine-mutant.txt`).
- R1 source has `EXPECTED_CHECKS = 10` and a real verdict-tail `if (checks.length !== EXPECTED_CHECKS)` guard; D58 has the equivalent five-check guard (`17-r1-attest-probe.txt`, `18-r1-doctrine-probe.txt`). R1 B8 is PASS (`26-r1-attest58-run.txt`).

**Finding:** A58 B8's source-level `guardOk` check is self-referential. It searches the probe source for `checks.length !== 10`, but the only non-comment occurrence of that string is inside the `includes(...)` check itself; the actual tail uses `EXPECTED_CHECKS`. The independent source audit found two occurrences, at source lines 69 (comment) and 321 (the check), plus the real constant and tail guard (`33-attest-count-guard-audit.txt`). Thus B8's `guardOk` is not independent proof of the tail guard, although the tail guard and committed mutant output do exist.

## K4 — vacuous-HELD

**Committed artifacts:** `.ufo/waves/round-58/controls/CtlNoCoverage.txt`, `CtlUnparseableRev.txt`, the R1 sweep/reproduction code, and A58 B3/B5.

**Corroborated.**

- No-coverage control reads `RECEIPT_EVIDENCE: FAIL-CLOSED reason=SWEEP_NO_NONCES` (`08-r1-no-coverage-control.txt`).
- Unparseable-revision control reads `RECEIPT_EVIDENCE: FAIL-CLOSED reason=ARCHIVE status=2` (`09-r1-unparseable-control.txt`).
- The R1 tool has explicit `SWEEP_NO_FILES` and `SWEEP_NO_NONCES` fail-closed arms, and its selftest source includes a no-prior-corpus case (`19-r1-receipt-evidence-tool.txt`). Fresh execution observed `sweep-no-files: PASS`, `unparseable-rev: PASS`, and all ten selftests passing (`27-r1-receipt-selftest.txt`).
- Fresh A58 at R1 observed B3 reproduction/freshness and B5 fail-closed controls both PASS (`26-r1-attest58-run.txt`). No vacuous HELD was observed.

## K5 — scratch-HELD witness

**Committed artifacts:** `.ufo/waves/round-58/witness/scratch-held-attest58.txt`; the companion `scratch-held-doctrine58.txt` is also present.

**Corroborated as a committed pre-R1 witness.**

- A58 witness reads `ATTEST58_HELD held=10/10 checks=10 rev=87d9efc85db0fb9dadbdc969acc8c7c89bff35b4` with B1–B10 all PASS (`14-r1-attest-witness.txt`).
- D58 witness reads `DOCTRINE58_HELD held=5/5 checks=5` at the same witness revision with E1–E5 all PASS (`15-r1-doctrine-witness.txt`).
- Both witness blobs were already present at freeze with the same blob IDs seen at R1, and freeze is an ancestor of R1 (`06-freeze-artifact-tree.txt`, `05-r1-artifact-tree.txt`, `03-freeze-before-r1.txt`). This independently establishes pre-R1 placement of the recorded 10/10 witness.

Limit: the one-line witness contains no fixture-construction commands. This audit verified its committed bytes and chronology but did not independently reconstruct witness revision `87d9efc85db0fb9dadbdc969acc8c7c89bff35b4`.

## K6 — do-nothing-control / frozen argv

**Committed artifact:** the frozen argv list and receipt-body assertions in `.ufo/waves/round-58/probe/attest58-probe.mjs`.

**Control corroborated; the plan's check number is wrong.**

- R1 source defines the three planned argv lists in order and deep-compares each receipt body's argv against them (`17-r1-attest-probe.txt`). Fresh A58 observed the argv check PASS at R1 (`26-r1-attest58-run.txt`).

**Finding:** plan K6 and the receipt plan say B7 asserts argv (`16-r1-plan.txt`), but the committed probe implements frozen argv as **B6**; **B7** checks `wall_start` span (`.ufo/waves/round-58/probe/attest58-probe.mjs:291` and `:304`). Both B6 and B7 passed at R1, so this is a frozen documentation-binding error, not an absent argv control.

## Additional base-artifact finding

The committed `.ufo/waves/round-58/base/doctrine58-base.txt` does not match the frozen D58 probe or a fresh base replay:

- Committed transcript: E3 names `S121:missing` and `S121:pin-miss` (`13-r1-doctrine-base.txt`).
- Frozen R1/freeze probe: E3 iterates `S112`, `S122`, `S123`, with capture pins also including S124; there is no S121 check (`18-r1-doctrine-probe.txt`).
- Fresh replay at base: `DOCTRINE58_UNMET held=2/5`, exit 1, but E3 reads `S112:rejected,S122:missing,S123:missing,S122:pin-miss,S123:pin-miss,S124:pin-miss` (`32-replay-doctrine58-base.txt`).

Therefore the committed D58 base transcript's E3 detail is not reproduced by the frozen counter. Current D58 at R1 is independently HELD (`28-r1-doctrine58-run.txt`); this finding concerns base-evidence provenance, not the R1 score.

## Audit limits and seat boundary

The committed control, mutant, and witness files are one-line output records; they do not preserve their original commands, stderr, or exit statuses. The exit 0 in this seat's `git show` transcripts means blob retrieval succeeded, not that an original control exited 0. No original control exit has been inferred.

No source was assessed, no tool was installed, and this seat made no production edit, commit, push, dispatch, or mutating git/jj command.

# Proposal — MAP_LANDING close mechanism (K63R2ExecReadmeMapFinal)

Wave 2 (falsify). Verifies the readme-map coverage map and pins at the measured
integration revision `a9531c8e617338fd16cb69c61344ef8f17711117`, reproduces the
R56-V3 recurrence (9th), re-reads the wave-1 repair proposal (`K63ExecReadmeMapRepair`)
and its rejected alternatives, and lands the concrete minimal mechanism below in a
scratch fixture only.

## State measured at a9531c8e

- `node scripts/readme-map.mjs` → `README_MAP: CLEAN files=153 rows=153 covered=153`
  exit 0 (lane worktree == measured rev for corpus/pins/scripts; `git status --porcelain
  corpus .ufo/pins scripts` empty).
- Pins vs files: 153 pins, 153 unique, 153 files, zero unmapped, zero phantom.
- Selftest: `README_MAP_SELFTEST: PASS (16/16)`.
- `cite-sources`: `CITE_SOURCES: CLEAN cited=190` exit 0; selftest 8/8. S196/S197
  are registry rows (`corpus/SOURCES.md:148-149`) and are cited by two README rows
  (`corpus/README.md:187-188`) and the entry
  (`corpus/knowledge/multi-agent-coordinator-topologies.md:1-2`).
- Recurrence probe (archive + `corpus/lessons/round-63-verifier-spotcheck.md`, no
  row/pin): `README_MAP: DRIFT files=154 rows=153 covered=153 bad=2
  first=uncovered:lessons/round-63-verifier-spotcheck.md` exit 1. The gate fails
  correctly; the class recurs because nothing runs the gate at close AFTER the
  closure lands its file.

## Rejected/inadequate alternatives (from wave 1, re-confirmed)

1. **Wildcard row** (`round-*-verifier-spotcheck.md` covers all spot-checks): the
   mutant gate reads `CLEAN` for a genuinely unmapped spot-check (wave-1 fix.log F3b /
   `wildcard/scripts/readme-map.mjs`), i.e. it destroys the failure on exactly the
   class it claims to fix. Rejected.
2. **proxy-check arm / round-gate arm:** `proxy-check.mjs` is parent-frozen
   (`kumitate-proxy-v1`; "do not widen them here") and round-gate is parent-frozen
   (`kumitate-round-gate-v1`). Adding an execution arm would violate frozen contracts;
   the only lane-legal touch is the GATE_PINS hash map (readme-map already pinned,
   `SCORECARD.md:326` matches the committed bytes).
3. **Receipt alone (no wrapper):** attest + receipt-evidence reproduces any recorded
   exit, including exit 1 (demo B): `RECEIPT_EVIDENCE: HELD` even for a DRIFT run.
   A receipt is evidence, not a verdict. The close gate must additionally REQUIRE the
   recorded exit to be 0. That is the piece the wrapper adds.

## What the L1 should land this round (minimal, lane-legal)

Two new scripts (both read-only over the lane except their own outputs + the close
receipt), a close step, and a QUALITY amendment:

1. `scripts/readme-map-close.mjs` (draft here) — close gate: runs the frozen
   `readme-map`, attests the run as `.ufo/waves/round-63/close/readme-map.txt`
   (receipt-attest), and requires the receipt to record `"exit":0`. Exit 0 CLEAN /
   1 DRIFT / 2 fail-closed. This is the mechanism that keeps readme-map able to
   fail on a genuinely unmapped lesson **at close time, after the closure lands**
   (demo B: DRIFT exit 1; demo A: CLEAN exit 0).
2. `scripts/readme-map-append.mjs` (draft here) — writer for the honest path: one
   command adds row + pin for a real corpus note; fail-closed on a phantom path;
   idempotent; appends (pins file is append-ordered, never rewritten/sorted — wave-1
   finding K63ExecReadmeMapRepair-5).
3. Close step: run `node scripts/readme-map-close.mjs` at the final tip (after the
   closure's spot-check lands), commit the receipt. This is the same close-receipt
   pattern C1 already uses (`close/inline63-tip.txt`, I6).
4. QUALITY Q32 amendment (text below) records the receipt as the close-time record
   of the tip run.

Honest limit (stays): nothing in the lane *forces* the close step to run — the
dispatcher/validator side owns that; the round's close artifacts are the evidence
surface. The wrapper makes the omission visible (no receipt, no CLEAN line) and the
failure audible (DRIFT line, exit 1).

### QUALITY Q32 amendment (draft, L1-owned file)

Append to `corpus/QUALITY.md` Q32's `Who checks` bullet:

```
  The round tip closes with `node scripts/readme-map-close.mjs` reading CLEAN and a
  committed `.ufo/waves/round-63/close/readme-map.txt` receipt recording `"exit":0`;
  a DRIFT run or an absent receipt fails the close.
```

### SCORECARD stanza updates the proxy drift implies (L1-owned file)

Measured at a9531c8e, `scripts/proxy-check.mjs` reads DRIFT on: A (declared 117,
computed 201 — wave-1 committed build artifacts under `.ufo/waves/round-63/build(+tools)`
carry 78 runnable files), C2 (150 vs 153), C2_total (150 vs 153), K_members/K_sections
(52 vs 49, live kimi root), `pin.proxy-check` (stale declared hash), and
PIN_UNPINNED `scripts/inline-dispatch-evidence.mjs`. The stanza must be re-measured
and re-pinned at the tip; the C2/C2_total pair must read 153/153 (was 151/151 in the
wave-1 draft, superseded by the entry + lesson + spot-check rows).

## Demo (scratch fixture, git-only, `30-runlog.txt`)

- A legit (R1, 153/153): `README_MAP_CLOSE: CLEAN recorded-exit=0` exit 0.
- B closure lands unmapped spot-check (R3): `README_MAP_CLOSE: DRIFT recorded-exit=1
  map-exit=1` exit 1 (receipt records `"exit":1`; receipt-evidence alone reads HELD —
  see alternative 3).
- C writer: `row=inserted pin=inserted` → `README_MAP: CLEAN files=154 rows=154
  covered=154` → close gate CLEAN exit 0.
- D idempotence (`row=present pin=present` exit 0) and phantom
  (`FAIL-CLOSED reason=no such corpus file` exit 2).

## Artifacts

- `10-readme-map-close.patch`, `11-readme-map-append.patch` (ready to apply from lane root)
- `readme-map-close.mjs` (sha256 ceac228ea92871c6ade52936bb274e788e951038f81cf71007db96a73b2cb3e7)
- `readme-map-append.mjs` (sha256 1577bdbc1afb8b64438c8e15261cafc3e5f7844b8614a80fcfc047d0cf14c3f2)
- `30-runlog.txt`, `40-verification.txt`

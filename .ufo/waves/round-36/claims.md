# round 36 — frozen claims (written 2026-10-21, before implementation)

Lane: kumitate-shokunin. Base master `0614092e0804aaca06642cb3a263a05c1cacc98e`.
Pinned upstream: private read-only clone `/fast/scratch/kumitate-r36/src` at
`31c465f15669f744848bd9f5d56191c5085670f7` (operator checkout `ufo-fsd-alpha` was at the same
revision at open; it is never read as a measurement source).

## C1 — operability (lowest live axis, 8; one claim, one axis)

Every lane gate verdict names the revision it scored; the gates stop writing into the tree they
read; anchor fidelity becomes a gate term and the lane's anchor debt burns down.

- Before (`.ufo/waves/round-36/baseline/`, 2026-10-21): `CHECKLIST: 11/13 pass` (620, 625 red);
  `SURFACE_PROBE: DRIFT (surfaces=2 checks=12 errors=3 warnings=1)` at the pin (`SCRIPT_DIGEST_MISMATCH`,
  `VERB_UNDECLARED`, `SURFACE_UNREACHABLE` dispatcher); `PROXY: DRIFT (C2_TOTAL_DRIFT declared=79
  computed=80; AXES_DRIFT coverage 10 vs 9; PIN_UNPINNED sources-check)`; FIDELITY prototype
  `anchors=1530 ok=340 elsewhere=492 absent=96 dead=173 noid=429 nonok=588`.
- After target: `CHECKLIST: 14/14 pass`; `FIDELITY: CLEAN nonok=0` under
  `.ufo/pins/fidelity-ratchet.json`; `PROXY: MATCH (… src-rev=31c465f1566 …)`; `SURFACE_PROBE: CLEAN
  (known=1 …)` with `src-rev=31c465f1566`; every gate verdict line carries `src-rev=`.
- Counting commands: `node scripts/surface-probe.mjs --checklists`;
  `node scripts/claims-check.mjs --fidelity --fidelity-ratchet .ufo/pins/fidelity-ratchet.json`;
  `node scripts/proxy-check.mjs`; `node scripts/surface-probe.mjs --known .ufo/pins/surface-known.json`.
- Falsifiers: a checklist item still running against the operator checkout; a pin mismatch that
  passes; a `--known` expectation that stops firing without failing; a note whose `elsewhere`
  anchor count rises above its ratchet ceiling.

## C2 — coverage:runtime-layer (9 → 10; one claim, one axis)

R5's 4 members and R7's 5 members get one internals-level `## ` member section each in
`corpus/knowledge/native-admission-detail.md` and `corpus/knowledge/local-ship.md` at the pin, each
with an own-file anchor whose symbol sits on the cited line.

- Before: `CLAIMS: MATCH (rows=19 yes=19 notes=27 sections=175 adv=6)`; R5 form=topic sections=0,
  R7 form=topic sections=0; `PROXY: … R=83/92 coverage:runtime-layer=9`.
- After target: R5 sections=4, R7 sections=5, R distinct in-family 92/92, `coverage:runtime-layer=10`.
- Counting commands: `node scripts/claims-check.mjs --src /fast/scratch/kumitate-r36/src --row R5
  --row R7 --strict`; `node scripts/proxy-check.mjs --src /fast/scratch/kumitate-r36/src`.
- Falsifier: a new heading whose resolved file is out of family, a duplicate that keeps the distinct
  count at 91, or an anchor whose symbol is not on the cited line (the C1 fidelity arm reads nonok>0).

## Separability

C1 touches `scripts/{surface-probe,claims-check,proxy-check}.mjs`, `SKILL.md` checklist, `.ufo/pins/`,
`corpus/README.md` (C2 row) and the anchor repairs; C2 touches only the two runtime notes. C2's
count is derivable without C1's arms (`--row R5 --row R7` on the existing gate); C1's checklist can
pass with C2's sections absent (the checklist does not assert R5/R7).

# round 36 — inherited integration state (uncommitted; written by L1 at run end)

The round did NOT land: the run hit its request budget with the fidelity arm and four
fidelity-repair patches still pending, so no claim was measured to its target and no lane
commit or report exists. Lane HEAD is untouched at 0614092e; the tree below is the
integration snapshot the next attempt inherits (re-verify, keep or revert).

## Applied and passing
- .ufo/pins/{origin,surface-known,fidelity-ratchet}.json (ExecPinFiles) — revision matches the pin.
- scripts/surface-probe.mjs = composed four-arm file from the non-author review
  (/fast/scratch/kumitate-r36/w/ReviewSurfaceArms/final2): digest declared-order concat,
  dispatcher mkdtemp state, --known, --pin; `--selftest` 61/61; live at the pin:
  `SURFACE_PROBE: CLEAN (surfaces=2 checks=12 errors=0 warnings=1 known=1 src-rev=31c465f15669)`.
- scripts/proxy-check.mjs = ExecProxyPin + a prefix-7 mutation case; `--selftest` 117/117.
- SKILL.md checklist 14 items; gate registry rows, named-gap retirement narrowed in progress;
  PIN + FIDELITY working-rule bullets applied.
- corpus/knowledge/native-admission-detail.md + local-ship.md: nine R5/R7 member sections
  (R5 4, R7 5), `CLAIMS: MATCH … sections=9 adv=0`; all 80 new anchors nonok=0.
- corpus/knowledge/route-probe-cluster.md: ExecFidRouteProbe repairs applied (nonok 20 → 0).
- corpus/knowledge/pinned-evidence.md: new entry (S031/S032); corpus/README.md v35-spotcheck row.
- SCORECARD stanza: C=14, C2/C2_total=80 (now stale: 81 notes exist), R_sections=92,
  coverage_runtime=10; Axes rows updated; pins NOT re-pinned.

## Not applied (pending at run end)
- claims-check `--pin` and `--fidelity` (ExecClaimsPin/ExecClaimsFidelity patches exist in
  /fast/scratch/kumitate-r36/w/; claims-check.mjs in the lane is still base e9a21b44).
- Fidelity repairs for ops-watchers, remaining-scripts-census, sighting-wall,
  native-trial-launch, the six small notes, and the three unowned notes (loop-driver,
  runtime-support, runtime-remainder-census): patches pending.
- C2 text corrections (CriticR5R7Claim W1-W4) and the intra-note forks (ConnectorR5R7Sources).
- surface-probe M5/M7 hardening (CHECK_UNEXPLAINED, known-kind allowlist) from CriticKnownStrictness.
- README rows for the new knowledge entries; SOURCES S029-S032; lesson; LOG; report; commit.

## Known state at handoff
- `node scripts/surface-probe.mjs --checklists` → CHECKLIST: 11/14 (fails 638 proxy pins,
  642 sources row, 644 fidelity arm).
- `node scripts/proxy-check.mjs` → DRIFT on C2_total 80/81, three pin.PIN_DRIFT, AXES
  coverage 10/9; src-rev prints.

# K70AttackC2Auto — attack findings: c2 autoorigin malformed stub registry

Seat: K70AttackC2Auto (attack, leaf). Edge: **the c2 autoorigin malformed stub registry must still be UNMET**, and the replay predicate must not pass a successor that silently drops or repairs that malformed registry.

## Verdict

INVARIANT HOLDS for a faithful transformation; BINDING IS VACUOUS at the predicate level. One fixable
defect (D1) disclosed; one robustness fact (R1) confirmed. No counter/plan freeze change needed or
permitted; the safe correction is implementation-side binding plus L1 disclosure.

## Commands and observed outcomes

All runs isolated in private scratch `/fast/scratch/hyaku/kumitate-r70/K70AttackC2Auto/`; the frozen
controls `c1-controls.sh`/`c2-controls.sh` were NEVER executed. The frozen counter
`deprec69-probe.mjs` was copied into scratch (sha256 `af021f87…42e7`, byte-identical to
`/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-69/probe/deprec69-probe.mjs`) and
executed against three private fixtures built from base `14057f3e…` (r69 base tree, archived
read-only from the lane). Driver `run-variant.sh` replicates the documented autoorigin
transformation with private W/S/out; receipts landed only in scratch `out/` and are copied to
`.ufo/waves/round-70/build/K70AttackC2Auto/`.

- `run-variant.sh a` (faithful: origin section + 3 malformed stub rows S907–S909 with
  `deadbeef…` URLs) → exit 1, first line:
  `DEPREC69_UNMET held=8/11 checks=11 … | M5 MISS no-live | M9 MISS census-exit=1,sources-check-exit=1,source-capture-exit=1,readme-map-exit=1 | M11 MISS S214:row-absent,S215:row-absent,S216:row-absent,S214:pin-absent,S215:pin-absent,S216:pin-absent`
  — matches the committed receipt `.ufo/waves/round-69/controls/c2-autoorigin.txt` (same held=8/11
  and same miss details; different rev). The frozen counter still bites on the faithful malformed
  stub registry: UNMET preserved.
- `run-variant.sh b` (ATTACK: origin section only, stub rows SCRUBBED) → exit 1, first line:
  `DEPREC69_UNMET held=8/11 … | M9 MISS readme-map-exit=1 | M11 MISS S214:row-absent,…,S216:pin-absent`
  — **M11 detail byte-identical to variant a**; only the M9 sub-gate exit tokens differ. The r70
  probe's R6 conditions (`DEPREC69_UNMET` + `CONTROL-PASS autoorigin` + exit 0 at the wrapper)
  pass identically for a and b.
- `run-variant.sh c` (stub rows only, NO origin section) → exit 1, first line:
  `DEPREC69_UNMET held=8/11 … | M9 MISS census-exit=1,sources-check-exit=1,source-capture-exit=1,readme-map-exit=1 | M11 MISS origin-section-absent`.
- `node -e` PINNED_URL probe on the S907 stub URL → `true`: `deadbeefdeadbeefdeadbeefdeadbeefdeadbeef`
  matches the counter's `[0-9a-f]{40}` pinned class, so the stubs are malformed only in provenance
  (no capture, status `queued`, usedby not naming the entry), not in syntax.

## Defects

### D1 (fixable, must be fixed or disclosed): R6 binds receipt labels, not the fixture — the malformed stub registry can be scrubbed or "repaired" invisibly

Counterexample: variant b differs from the faithful variant a ONLY in the absence of the malformed
stub rows, yet produces an R6-passing receipt. The stub registry's sole counter-visible fingerprint
is M9's sub-gate exit tokens (`census-exit=1,sources-check-exit=1,source-capture-exit=1`); the r70
probe never inspects M9 detail, and M9 is MISS in every variant regardless. No probe check binds the
presence, absence, or well-formedness of S907–S909, and the probe does not hash the generated
fixture. Consequence: a successor `control-replay.mjs` could generate the private fixture with the
stub rows omitted or normalized (e.g., deadbeef URLs "fixed", status flipped to mined, fabricated
capture pins added) and still score R6 — silently defeating the control's stated purpose ("the
section and row STUBS alone do not authenticate anything") while claiming 10/10. Enforcement of
this edge today rests only on the successor's frozen-source-bytes refusal plus attack-seat review.

Evidence: receipt diff a↔b shows the only delta is the M9 token list; both first lines begin
`DEPREC69_UNMET held=8/11`.

Impacted axis: operability (the REPLAY70_HELD 10/10 claim) — a scrubbing successor yields false
provenance on C1 replay without any probe-visible signal.

Smallest safe correction (no counter/plan byte changes; predicate stays frozen per
"never amend predicate after scoring"): `control-replay.mjs` must bind the generated fixture before
running the counter — assert the autoorigin transformation payload (the `## Capture origin` section
text and the three S907/S908/S909 rows with the deadbeef URLs) is present verbatim in the private
fixture, and refuse otherwise. This extends the contract's existing "Refuse unexpected frozen
source bytes" clause from the script to the generated tree. L1 records the residual reliance in the
round report as a disclosed limit.

### R1 (robustness, not a defect): the edge cannot be flipped to HELD by registry repair alone

UNMET in autoorigin is carried by M5 (`no-live`) and M11 (mirror rows S214–S216 absent), which hold
independently of the stub registry; held cannot exceed 9/11 without the live arm. So the invariant
"malformed stub registry still must be UNMET" is structurally safe against repair-flip; the exposure
is purely the vacuity in D1.

## Freeze consequence

None for frozen bytes: counter, plan, and r69 controls were read-only throughout (sha256 of the
counter copy matches lane bytes). D1's correction lands solely in the new
`scripts/control-replay.mjs` (implementation-side assertion) and in L1's disclosed-limits text;
touching the frozen probe/plan is prohibited and unnecessary.

## Artifacts

`.ufo/waves/round-70/build/K70AttackC2Auto/`: `run-variant.sh` (driver),
`c2-autoorigin-{a,b,c}.txt` (receipts), `SHA256SUMS.txt`. Candidate
`build/K70ExecRunner/control-replay.mjs` was absent at review time; findings attack the contract and
counter directly and give the implementer a concrete regression test (variant b must be refused by
the fixture-binding assertion, not merely pass R6-shaped receipts).

Tools: node v24.21.0 (preinstalled, no installs this seat); git 2.x read-only archive from lane;
no pacman/uv/npx transactions.

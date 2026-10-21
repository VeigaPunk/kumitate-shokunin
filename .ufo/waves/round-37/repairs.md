# round 37 repair-first record

- D1 restored: every symbol-keyed anchor in remaining-scripts-census.md, sighting-wall.md,
  route-probe-cluster.md, native-trial-launch.md reverted to its 0614092 sentence line; each note
  carries a round-37 restoration notice. `git diff --stat` recorded in the report.
- D2 canonical pairing: claims-check pairs LEFT first (`prev ?? next`), with a new selftest case
  (47/47) where a shift onto the next symbol must read non-ok.
- Ratchet: `.ufo/pins/fidelity-ratchet.json` now records the measured per-note ceilings under the
  canonical rule, so CLEAN means no regression, not zero debt.
- D7 ExecFidSmall.patch: DISCARDED (its four ReviewFidSmallB semantic failures were never fixed and
  its green depended on the right-first rule this round removes).
- D6 fleet-root `-.rej` moved byte-exact to `.ufo/waves/round-36/evidence/remaining-scripts-census.rej.txt`
  (`cmp` equal) and deleted from the fleet root.

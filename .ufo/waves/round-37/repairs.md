# round 37 repair-first record

- D1 final form: the four notes are RESET to their 0614092 bytes plus one notice line each
  (`git diff --stat 0614092 -- <notes>` → 4 files, 1 insertion each, `@@ -1,0 +2 @@`). The earlier
  symbol-keyed restoration was unsafe and is superseded (fleet errata 5–7). Measured with an
  independent parser (Verify1): 109 base-true anchors whose round-36 shift is removed; 54 round-36
  true anchors discarded (native 22, S8 22, S7 1, S4 9); 183 false-in-both carried; 68 unpaired.
- D2 canonical pairing: claims-check pairs LEFT first (`prev ?? next`), with a new selftest case
  (47/47) where a shift onto the next symbol must read non-ok.
- Ratchet: `.ufo/pins/fidelity-ratchet.json` now records the measured per-note ceilings under the
  canonical rule, so CLEAN means no regression, not zero debt.
- D7 ExecFidSmall.patch: DISCARDED (its four ReviewFidSmallB semantic failures were never fixed and
  its green depended on the right-first rule this round removes).
- D6 fleet-root `-.rej` moved to `.ufo/waves/round-36/evidence/remaining-scripts-census.rej.txt`
  (committed copy sha256 `3f51c7e7…`, 249 lines / 19 hunks); `cmp` output not retained (Verify6);
  misroot re-sweep with timestamp in `final/misroot.txt`.
- D8 spot-check README row added; C2/C2_total 83→84 after the round-37 lesson row (the 83/83
  reading was `5ceb8cd`'s intermediate proxy line, `C2_TOTAL_DRIFT declared=83 computed=84`).

VERDICT: Q66 red/green demonstrated: the r68 verdict lacks a `live=` field; the r69 verdict carries `live=exercised`.

## Evidence
- Read `.ufo/waves/round-68/base/deprec68-base.txt:1` (red; verbatim):
  `DEPREC68_UNMET held=1/10 checks=10 rev=d23892ad44b41e1af63b3edb949d265ca1dd812d rule=M68 | M1 MISS entry-absent | M2 MISS cited=0 | M3 MISS cited=0 | M4 MISS section-absent | M5 MISS no-live | M6 MISS capture-table-absent | M7 MISS section=false | M8 MISS section=false cites201-206=null v18.13.1-row=false | M9 MISS readme-map-exit=1,province-entry-not-named`
- Read `.ufo/waves/round-69/base/deprec69-base.txt:1` (green; verbatim):
  `DEPREC69_UNMET held=9/11 checks=11 rev=14057f3e3899180c95713bace088fb9c0d0046e3 rule=M69 live=exercised | M9 MISS readme-map-exit=1 | M11 MISS origin-section-absent`
- Future check written: `grep -qE '^DEPREC69_(HELD|UNMET).* live=[^ |]+' .ufo/waves/round-69/base/deprec69-base.txt` (non-zero on a verdict line with no live-state field).

## Findings
1. K69ExecQ66Demo-1 — evidence calibration; Q66 is distinguishable from the frozen evidence. Reproduce the red/green comparison by reading the two receipt paths above and compare their verdict lines.

## Artifacts
- `.ufo/waves/round-69/build/K69ExecQ66Demo/check.sh`
- `.ufo/waves/round-69/build/K69ExecQ66Demo/transcript.txt`
- `.ufo/waves/round-69/w1/K69ExecQ66Demo.md`

## Limits
- Did not execute the future check; evidence is the exact committed receipt text read above. No probes, counters, controls, or round-68 bytes were modified.

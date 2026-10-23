# ScribeErrata — R47-2/R47-3 correction audit

## Behavior
Verified the inherited attempt-1 errata draft against the filed round-47 report, frozen lane sources, round-47 receipts, re-open artifacts, and plan history. Produced an append-only `## Round 47 correction` fragment for L1 review. No product or corpus changes were made.

## Findings

1. **A2 control count:** The filed fleet report's line 11 says “Every control was re-scored under A2: all read 0/5”; the lane Scorecard lines 2083–2084 says “all fourteen controls read 0/5 under A2”. The thirteen cited A2 control-result lines (31, 39, 47, 55, 63, 71, 79, 87, 95, 103, 111, 119, 127) each read `held=0/5`; `a2-ctl-retparse2.txt:6` reads `held=3/5` for CtlRetParse. The separate calibration at `a2-controls.txt:23` reads `held=1/5`, not a control. The fragment corrects both live statements.
2. **Re-open coverage:** Filed fleet report line 76 claims all 16 rows were re-opened and says 12 had reports. The frozen lane artifact inventory has re-open reports for S080–S083, S085–S090 and S093–S095: 13 reports. No committed round-47 re-open report exists for S084, S091 or S092 (`git ls-tree` query below returned no paths); the verifier lesson independently records those three absences at line 190. The fragment therefore states only that the evidence does not support 16/16. It flags, but does not explain, the difference between the report's count of 12 and the 13-file committed inventory.
3. **S088 conflict:** Filed fleet report line 105 says the cancelled list includes “ReopenS084/S088/S091/S092” and then “Their reports are not cited”. The committed lane artifact `.ufo/waves/round-47/falsify/ReopenS088.md:1` says `RESULT ReopenS088 rev=269dadb6 verdict=HOLDS row=S088 supersedes-S054-confirmed`. Read-only Git history places that report in commit `67ebb32dab08b006b1b95a29855eba08773b704e`. The committed artifact contradicts the report's “Their reports are not cited” statement; it does not resolve cancellation timing.
4. **Amendment chronology:** Round-47 plan headings at lines 86 and 118 say `~10:45Z` and `~10:55Z`. Plan history records A1 commit `796b49b48d8be8fc89bf15bfe4dc6396ea4bfcab` at `2026-10-23T07:13:45-03:00` (10:13:45Z) and A2 commit `8de35e793e007bfb52c0a87d618a447d831c9023` at `2026-10-23T07:40:32-03:00` (10:40:32Z). Both headings postdate their commit timestamps.

## Evidence and command record

- Read first: lane `.ufo/waves/round-48/plan.md`, including the attempt-2 addendum; then inherited `.ufo/waves/round-48/build/ScribeErrata.md:9-13`.
- Lane identity: `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin rev-parse HEAD` → `fe3d45bf929246915c8c0de5f7f8682b5015b22c` (the frozen tip).
- Filed report source: read fleet `.ufo/reports/round-47/kumitate.md:11,76,105`. Read-only provenance command `git -C /home/vgpnk/Projects/shokunin log --format='%H %cI %s' -- .ufo/reports/round-47/kumitate.md` → `ed17d1de38c699e14f50c387c4a5e61e39a5c232 2026-10-23T07:57:43-03:00 round-47: kumitate report`; `git -C /home/vgpnk/Projects/shokunin status --short -- .ufo/reports/round-47/kumitate.md` produced no output.
- Read lane `SCORECARD.md:2083-2084`, round-47 plan lines 86 and 118, and the listed receipts/re-open artifacts. Grep query `Every control was re-scored under A2|All 16 new rows were re-opened|ReopenS084/S088/S091/S092` in fleet `.ufo/reports/` located the exact report quotations; report line numbers were then read directly.
- Receipt grep query `^CAPROUTE_PROBE.*held=0/5 rule=A2$|^CAPROUTE_PROBE rev=259e967b1e92b7a64b53aa10c7a530851811dddd base=0bd8be60 held=3/5 rule=A2$|^CAPROUTE_PROBE rev=d066e8cc0bae5e0687c99e66506a53612be7fa3e base=0bd8be60 held=1/5 rule=A2$` across `.ufo/waves/round-47/probe/receipts/a2-controls.txt` and `a2-ctl-retparse2.txt` returned the 13 `held=0/5` lines, the CtlRetParse `held=3/5` line, and the calibration `held=1/5` line.
- `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin ls-tree -r --name-only fe3d45bf929246915c8c0de5f7f8682b5015b22c -- .ufo/waves/round-47/falsify/ReopenS084.md .ufo/waves/round-47/falsify/ReopenS091.md .ufo/waves/round-47/falsify/ReopenS092.md` → no paths listed.
- `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin ls-tree -r --name-only fe3d45bf929246915c8c0de5f7f8682b5015b22c -- .ufo/reports reports .ufo/waves/round-47` → the lane tree lists the 13 `falsify/Reopen*.md` artifacts named in the fragment and no lane `.ufo/reports/round-47/kumitate.md`.
- `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin log --format='%H %cI %s' -- .ufo/waves/round-47/falsify/ReopenS088.md` → `67ebb32dab08b006b1b95a29855eba08773b704e 2026-10-23T07:56:39-03:00 round-47: record — C1 not verified (L1 5/5, wave-2 re-runs 3/5 3/5 4/5), S096/S097 supersedes rows after re-open defects, SCORECARD move-log row, round-46 correction and round-47 section, LOG entry, lesson verdict and mistake 3, wave-2 reports, close receipts`.
- `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin log --format='%H %cI %s' -- .ufo/waves/round-47/plan.md` → A2 `8de35e793e007bfb52c0a87d618a447d831c9023 2026-10-23T07:40:32-03:00`; A1 `796b49b48d8be8fc89bf15bfe4dc6396ea4bfcab 2026-10-23T07:13:45-03:00`; freeze `cac43009b22232c1ae8efdab4f2789516c1fcc6f 2026-10-23T06:49:02-03:00`.

## Gates
No builds, tests, counters, selftests, or runtime checks were run; this was a source/receipt audit only. No tools were installed or updated.

## Touched surfaces
Only the two permitted seat artifacts below were written. `SCORECARD.md`, corpus files, `LOG.md`, plan, scripts, and the filed report were not edited.

## Out of scope and known limits
No R47-1, R47-4, R47-5, C1, or C2 evaluation was performed. The evidence does not establish why the filed report's 12-report count differs from the final 13-artifact inventory, or whether the S088 seat was canceled before or after producing its committed report. The fragment preserves those uncertainties rather than resolving them by inference.

## Artifact paths
- `.ufo/waves/round-48/r48/ScribeErrata-scorecard.frag.md` — append-only SCORECARD correction block; review and apply by L1.
- `.ufo/waves/round-48/r48/ScribeErrata.md` — this scoped audit report.

Report: .ufo/waves/round-48/r48/ScribeErrata.md

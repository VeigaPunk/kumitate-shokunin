RESULT ScribeErrata verdict=DRAFT_COMPLETE

## Draft for SCORECARD.md

## Round 47 correction (2026-10-23, round 48; routed defects R47-2, R47-3; supersedes the live wording it names)

The filed round-47 report (fleet, filed; not rewritten), the live `SCORECARD.md` `## Round 47` section, and the round-47 plan carry these errors:

- **A2 control results — report:11 and SCORECARD.md:2083–2084.** Wrong words: report:11 says “Every control was re-scored under A2: all read 0/5”; the Scorecard says “all fourteen controls read 0/5 under A2 (probe/receipts/a2-controls.txt, a2-ctl-retparse2.txt)”. Corrected: **Thirteen of the fourteen controls read 0/5 under A2; CtlRetParse read 3/5. The separate K488-only calibration read 1/5 and is not a control.** Receipts: `a2-controls.txt:31,39,47,55,63,71,79,87,95,103,111,119,127` each end `held=0/5`; `a2-ctl-retparse2.txt:6` reads `held=3/5`; `a2-controls.txt:23` reads `held=1/5` for calibration.
- **Re-open coverage — report:76.** Wrong words: “All 16 new rows were re-opened by non-authors”. Corrected: **The committed re-open report trail covers S080–S083, S085–S090 and S093–S095 (13 artifacts); there is no re-open report for S084, S091 or S092, so the evidence does not support 16/16.** Report receipts: `.ufo/waves/round-47/falsify/ReopenS080.md:1`, `ReopenS081.md:1`, `ReopenS082.md:1`, `ReopenS083.md:1`, `ReopenS085.md:1`, `ReopenS086.md:1`, `ReopenS087.md:1`, `ReopenS088.md:1`, `ReopenS089.md:1`, `ReopenS090.md:1`, `ReopenS093.md:1`, `ReopenS094.md:1`, and `ReopenS095.md:1`; the verifier's explicit finding for the three absent reports is `corpus/lessons/round-47-verifier-spotcheck.md:190`. The report's separate “12 of them with reports” count must be read alongside the committed S088 report below; the artifact inventory has 13 report files.
- **S088 cancellation/report conflict — report:105.** Wrong words in context: “ReopenS084/S088/S091/S092” in the canceled-seat list, followed by “Their reports are not cited”. Corrected: **A committed S088 re-open report exists and its result is HOLDS; the report's cancellation list and “reports are not cited” statement conflict with that artifact. Preserve the artifact fact, and do not claim the seat's cancellation timing is resolved by this evidence.** Receipt: `.ufo/waves/round-47/falsify/ReopenS088.md:1` says `RESULT ReopenS088 rev=269dadb6 verdict=HOLDS row=S088 supersedes-S054-confirmed`; the read-only file history below shows it was committed in `67ebb32d`.
- **A1/A2 amendment timestamps — round-47 plan:86,118.** Wrong words: A1 “`~10:45Z`” and A2 “`~10:55Z`”. Corrected: **The respective commits have recorded committer timestamps 10:13:45Z (A1) and 10:40:32Z (A2); both plan-heading times postdate their commits.** Evidence: the specified plan history command below gives `2026-10-23T07:13:45-03:00` for `796b49b4…` (10:13:45Z) and `2026-10-23T07:40:32-03:00` for `8de35e79…` (10:40:32Z). This correction records the commit chronology; the round-47 plan remains untouched.

## Audit record

Read-only sources consulted: the round-48 plan; filed `.ufo/reports/round-47/kumitate.md`; `SCORECARD.md` `## Round 46 correction` and `## Round 47`; `.ufo/waves/round-47/plan.md` (including `## A1`/`## A2`); `a2-controls.txt`; `a2-ctl-retparse2.txt`; `corpus/lessons/round-47-verifier-spotcheck.md` §7; `.ufo/waves/round-47/falsify/ReopenS088.md`; and the round-47 `falsify/` artifact inventory. These establish the source wording and evidence pointers above.

Exact read-only commands and outcomes:

```text
git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin log --format='%H %cI %s' -- .ufo/waves/round-47/plan.md
8de35e793e007bfb52c0a87d618a447d831c9023 2026-10-23T07:40:32-03:00 round-47: freeze A2 before data — return value read from the record's end, no-execve and invalid-base runs are exit 2 (ReviewCounter D3-D5); after control CtlRetParse met A1 5/5; receipts
796b49b48d8be8fc89bf15bfe4dc6396ea4bfcab 2026-10-23T07:13:45-03:00 round-47: freeze A1 before data — counter reads systemd-run's own -p limits, ordered runner→scope→bwrap chain at exec time, executable identity, owning-suite summary and verdict, direct-child allowlist, execveat; after control CtlEnvCaps met the freeze counter 5/5 (CritC1Shape); A1 receipts
cac43009b22232c1ae8efdab4f2789516c1fcc6f 2026-10-23T06:49:02-03:00 round-47: freeze — plan (C1 ROUTED_HELD, five sites), frozen counter caproute-probe.mjs, base and calibration receipts; prerequisite runner contract kumitate-cap-run-v2 (--bind, --verdict-file, sync verdict write, budget rule; R46-5) and helper scripts/cap-spawn.mjs (before any data seat)

git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin log --format='%H %cI %s' -- .ufo/waves/round-47/falsify/ReopenS088.md
67ebb32dab08b006b1b95a29855eba08773b704e 2026-10-23T07:56:39-03:00 round-47: record — C1 not verified (L1 5/5, wave-2 re-runs 3/5 3/5 4/5), S096/S097 supersedes rows after re-open defects, SCORECARD move-log row, round-46 correction and round-47 section, LOG entry, lesson verdict and mistake 3, wave-2 reports, close receipts
```

## Scope and limits

- Draft only. No changes were made to `SCORECARD.md`, the filed round-47 report, the round-47 plan, or other lane content. The only lane write is this report.
- No tests, counters, selftests, builds, or strace runs were performed; no tool was installed or updated. Both Git commands above were read-only.
- The S088 artifact's committed HOLDS result is established, but the available evidence does not say whether its seat was canceled after completing that report. The drafted correction preserves that distinction rather than inventing a seat-status explanation.

Report: .ufo/waves/round-48/build/ScribeErrata.md

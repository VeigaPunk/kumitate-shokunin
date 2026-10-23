# ScribeLogFrag — scoped report

## Behavior and artifact

Created a LOG.md round-48 attempt-2 entry skeleton in `ScribeLogFrag-frag.md`, following the existing round-47 LOG paragraph format. It names the frozen C1/F48 and C2/COUNTER_RERUN contracts, attempt-1 inherited evidence, C1/C2 commit and measured-receipt placeholders, H1–H4 gates, named C1 non-claims, and the close-time documentation/census placeholders. It deliberately records no attempt-2 result as fact; the placeholders must be replaced from committed receipts before the L1 applies the fragment.

## Provenance and verified evidence

Read `.ufo/waves/round-48/plan.md` first, including the attempt-2 addendum, then read the round-47 LOG entry (`LOG.md:1918-1926`) for format. Read inherited receipts directly and checked key lines with the `grep` tool:

- `build/a2-rerun-{1,2,3}.txt`: `CAPROUTE_PROBE` reads `held=3/5`, `3/5`, `4/5`, each exit 1; loads move from 22.06 to approximately 54.49–54.97. They reproduce the R47-1 readings and do not count as round-48 scoring.
- `probe/receipts/stab-r48-f00cf278-{1,2,3}.txt`: each has the four named sites as `ROUTED_MISS`, `held=0/4`, rule F48, exit 1; each receipt records the same counter digest.
- `probe/receipts/stab-r47-f00cf278-{1,2,3}.txt`: each has `set=r47 held=5/5`, rule F48, exit 0, supporting the conditional H2 baseline.
- `probe/receipts/rc-at802-parser.txt`: A2 reads 106/106, 105/106, and 103/106; F48 reads 106/106 on all three logs. `rc-at802-pidwrap.txt` records A2 n/capped 104/99, 103/99, 104/96 while F48 reads 106/106 each time.
- `build/checklist-base-{1,2}.txt`: both read `CHECKLIST: 18/22 pass`, `VERDICT: FAIL`, exit 1. Items 685 and 686 report `REPORTS_DIR_MISSING`; item 687 records A_DRIFT (+1), C2_TOTAL_DRIFT (+1), and AXES_DRIFT. The fragment treats these as base-side limitations, not C1 harm evidence.
- `build/CtlEnvCaps-pristine-receipt.txt`: its 4/4 is at comparator commit `f55bf22e9e6d719045a46a8bd3419485a09eceb5`; this is not a control or a candidate score, so the fragment explicitly excludes it from C1 evidence.

Command checks and outcomes:

```text
git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show --no-patch --format='%H%n%cI%n%s' fe3d45bf929246915c8c0de5f7f8682b5015b22c
fe3d45bf929246915c8c0de5f7f8682b5015b22c
2026-10-23T08:47:18-03:00
round-48: freeze — counter caproute48-probe.mjs (rule F48; R47-5 root causes: padded return column and padded PID prefix after PID wrap), plan § C1 (four sites RG742 SP491 SP519 SP1592), stability receipts (r47 set 5/5 x3, r48 set 0/4 x3 at f00cf278), open census

sha256sum /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/probe/caproute48-probe.mjs
f24a3af55add0708943526435fde93e02f4ef0c9d4b8e494a9111a5fec890cf2  /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/probe/caproute48-probe.mjs

git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin cat-file -e fe3d45bf929246915c8c0de5f7f8682b5015b22c:scripts/counter-rerun.mjs
fatal: path 'scripts/counter-rerun.mjs' does not exist in 'fe3d45bf929246915c8c0de5f7f8682b5015b22c' (exit 128)
```

The `cat-file` and digest checks were run in one shell call with the final exit explicitly printed as `counter-rerun-cat-file-exit=128`. Receipt-line searches used the `grep` tool with pattern `^(CAPROUTE48|exit=|SITE RG742|SITE SP491|SITE SP519|SITE SP1592|counter_sha256=)` for the three F48 r48 base receipts, and `^(CAPROUTE48|exit=|SITE )` for the three F48 r47 base receipts; returned lines agree with the read receipts above. Checklist lines were checked with `^(CHECKLIST  FAIL SKILL.md:685|CHECKLIST  FAIL SKILL.md:686|CHECKLIST  FAIL SKILL.md:687|CHECKLIST:|VERDICT:|exit=)`.

## Attempt-1 draft availability and limits

No attempt-1 LOG draft was available in the inherited build tree: `glob` on `.ufo/waves/round-48/build/ScribeLog*` returned “No files found matching pattern”; a content search there for `round 48 attempt 1|round-48 attempt|LOG.md entry skeleton|C2 capability` found control reports, not a LOG-entry draft. Therefore no attempt-1 log prose or its unverified citations were reused. The fragment is derived from the frozen plan/addendum, the round-47 LOG format, and receipts cited above. This search does not establish whether a draft exists outside that inherited build tree.

This seat did not run the F48/C2 counters, selftests, checklist or harm measurements; did not create a sandbox clone; installed or updated no tools; and did not edit product code, `LOG.md`, `SCORECARD.md`, corpus, or the frozen plan. There is no execution evidence from this seat for C1/C2, final H1–H4 status, wave totals, or any measured commit.

## Touched files and artifact paths

- `.ufo/waves/round-48/r48/ScribeLogFrag-frag.md` — requested LOG entry skeleton.
- `.ufo/waves/round-48/r48/ScribeLogFrag.md` — this scoped report.

Report: .ufo/waves/round-48/r48/ScribeLogFrag.md

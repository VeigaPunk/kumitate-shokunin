# ScribeErratum — round 49 report addendum

## Draft (append-only; 8 lines)

```markdown
## Erratum (round 50; append-only)

This report was filed in fleet commit `0fdce71a764cf0093380d64b9c55f4c58a08c593`, citing lane record commit `64b92866b3c119d4a3434039569a82786ab323f1`.
Three lane commits landed after filing: `01b70bb0` added C16 and prior-art citations; `923a172` recorded the addendum and C2 re-score; `c432cc95` added the `ConnSiblingOverlap` seat report.
The sentence above that wave-seat reports were "committed in `64b92866`" is overbroad: `ConnSiblingOverlap.md` landed in `c432cc95`.
The reported C2 `15/15` at `589d25e4` is superseded: C16 makes it `16/16` at the r49 tip `c432cc95`, entry SHA-256 `11828698f0feee79405037cff3a31f65297ecebfcedf4f812cbdceb3d53f527b`.
The original report bytes above this appended block remain unchanged; this corrects the C2 count and identifies the late seat report.
```

## Evidence / provenance

- Fleet filed report: `/home/vgpnk/Projects/shokunin/.ufo/reports/round-49/kumitate.md`; fleet commit `0fdce71a764cf0093380d64b9c55f4c58a08c593`. `git show <fleet-commit>:... | nl -ba | grep ...` confirmed lines 28–29 say seat reports "are committed in `64b92866`", and lines 43, 75 state C2 `15/15` at `589d25e4`.
- Lane history: `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin log --oneline --reverse 589d25e4..c432cc95` returned the three intervening commits: `01b70bb` (C16/prior-art), `923a172` (re-score/LOG), `c432cc9` (`ConnSiblingOverlap` seat report). `rev-parse` confirmed their full IDs: `01b70bb0c5ad96ae8e7451dd90c460244bc470a3`, `923a172c7201de9ad5f68eb7fd2c7c3939672599`, `c432cc958304856d989438fb74c4cb48cb0ea3fc`.
- `git -C .../kumitate-shokunin show 923a172:.ufo/waves/round-49/r49/L1-c2-rescore-01b70bb0c5ad96ae8e7451dd90c460244bc470a3.txt` output: `DOCTRINE49: HELD entry=counter-amendment-discipline.md clauses=16/16 rows=3 cited=3 entry_sha256=11828698f0feee79405037cff3a31f65297ecebfcedf4f812cbdceb3d53f527b rule=D49 rev=01b70bb0c5ad96ae8e7451dd90c460244bc470a3`.
- `git -C .../kumitate-shokunin show c432cc95:corpus/knowledge/counter-amendment-discipline.md | sha256sum` returned `11828698f0feee79405037cff3a31f65297ecebfcedf4f812cbdceb3d53f527b`; at `589d25e4` the same command returned `6b8f69cdeab998149f60b50e84b2f0ab17bdc5399589d3f1da0f5b7c66d95e9c`.
- A first commit lookup accidentally targeted the fleet repository and failed (`fatal: ambiguous argument '589d25e4'`); rerunning against the lane repository resolved the IDs above. No checks or probes were rerun.

## Bounds / known state

- Draft only. I did not edit the fleet report, lane product files, or git state; no tools were installed. The fleet report already had a separate uncommitted 11-line Erratum append when inspected (`git status --porcelain` showed `M .ufo/reports/round-49/kumitate.md`); I did not change it and cannot attribute its authorship. This report preserves the stronger explicit correction that the `64b92866` sentence is overbroad.
- Affected intended surface: append-only `.ufo/reports/round-49/kumitate.md` (L1-owned; not edited by this seat). Artifact: `.ufo/waves/round-50/r50/ScribeErratum.md`.
- Gates: none were run; this was a report-only drafting assignment. No builds, tests, validations, or probes were executed.

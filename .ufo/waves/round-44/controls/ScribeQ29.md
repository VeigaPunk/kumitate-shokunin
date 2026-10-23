RESULT ScribeQ29 rev=292d9266 verdict=draft axes=operability;coverage-orchestration-and-tooling

Behavior: drafted Q29 for the counter's named skip-work controls and the Round-44 `## Mistakes` row. The proposal names absent, constant, junk, no-reader, and label-keyed shortcut controls; requires control receipts before measurement; and requires redesign before data or an exploratory claim if any control meets the counter.

Gates: Ran only read-only Git ordering/receipt checks. Round-43 J4 makes the proposed check fail, exit 1. No Round-44 counter, census candidate, or measured data was run.

Touched surfaces: This report is the only lane file written. Proposed Q29 and row are in `/fast/scratch/hyaku/kumitate-r44/seats/ScribeQ29/ScribeQ29.patch` and `ScribeQ29-Mistakes-row.txt`.

Out of scope: Did not edit `corpus/QUALITY.md` or `corpus/lessons/round-44.md`, invoke a counter/runtime, install tools, or run tests. `corpus/lessons/round-44.md` is absent at this revision, so the row is a snippet, not an applied hunk.

Finding — specified control commit mismatch: the ordered log identifies `e5ffcbe7` as the C1 do-nothing control receipt, but the J4 receipt does not exist at that revision.
Command: `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin cat-file -e e5ffcbe7f155b89cb1870f9da7b0d671d092948b:.ufo/waves/round-43/build/ExecJunkControls.md; echo exit=$?`
Output: `fatal: path '.ufo/waves/round-43/build/ExecJunkControls.md' exists on disk, but not in 'e5ffcbe7f155b89cb1870f9da7b0d671d092948b'`; `exit=128`.
The J4 receipt is present by `fb3eab402d87f3fa4681bfeb17b4c84802d48451`; line 26 records `GATE_MUTANTS: CLEAN`. The failure demonstration therefore uses `fb3eab40` as the control-receipt commit and preserves `e5ffcbe7` in the printed history.

Exact check command (plan `0f4108bf`, J4 receipt `fb3eab40`, measured `84cb1d5d`):
`L=/home/vgpnk/Projects/shokunin/kumitate-shokunin; P=0f4108bf66d58eb4cf4642ca1faf0fdeeba06c82; C=fb3eab402d87f3fa4681bfeb17b4c84802d48451; R=84cb1d5d8e703aafd4f73d887ba4237692ff13f9; F=(.ufo/waves/round-43/build/ExecJunkControls.md); git -C "$L" log --format='%H %s' --ancestry-path --reverse "$P^..$R"; if ! git -C "$L" merge-base --is-ancestor "$P" "$C" || ! git -C "$L" merge-base --is-ancestor "$C" "$R"; then echo 'Q29: FAIL plan/control/measured commits are out of order'; exit 1; fi; for f in "${F[@]}"; do git -C "$L" cat-file -e "$C:$f" || { echo "Q29: FAIL missing committed control receipt: $f"; exit 1; }; done; if git -C "$L" grep -n -E '[A-Z][A-Z0-9_]*: (MET|CLEAN)' "$C" -- "${F[@]}"; then echo 'Q29: FAIL a control met the counter'; exit 1; else echo 'Q29: PASS no control met the counter'; fi`

Observed stdout (verbatim):
```text
0f4108bf66d58eb4cf4642ca1faf0fdeeba06c82 round-43: plan with frozen K43 kill predicate and counter (gate-mutants v2, temp parent fix D4), open receipts and pre-commit dry run; base repair (README row for round-42 closure, stanza C2=95, gate-mutants re-pin); D1 three late round-42 falsify reports committed as late evidence
e5ffcbe7f155b89cb1870f9da7b0d671d092948b round-43: C1 do-nothing control receipt - frozen K43 counter (plan 0f4108bf) on round-open bytes reads SURVIVED frozen=34/41 exit 1 (seven named survivors)
df1ceaf86c08dce7100da9b7c27f674bbad04f23 round-43: addendum A1 before any measured run - C1 discriminators D-static and D-null (add failure conditions only) after wave-1 junk J4 and a self-digest tripwire read the frozen counter CLEAN; probe and control receipts (e5ffcbe7 PASS, both junk FAIL); counter limits named
fb3eab402d87f3fa4681bfeb17b4c84802d48451 round-43: wave-1 build evidence - 34 seat reports (34 spawned, 34 returned, 0 dead), spec, dispatch and registry
84cb1d5d8e703aafd4f73d887ba4237692ff13f9 round-43: measured commit - C1 independent verdict witnesses in cite-check (primary-only self-observation child) and wave-census (primary lines, WC29 load-robust timeouts, D8 WC32 red-before); gate-mutants lane copy isolation and counter-suite cases (D4); kimi-census secret-dir mode/owner (D7); S046-S052; QUALITY Q25-Q28; round-42 appended corrections (D2, S045 Q8); SKILL K43 rows; lesson; re-pins, stanza A=11 C2=96
fb3eab402d87f3fa4681bfeb17b4c84802d48451:.ufo/waves/round-43/build/ExecJunkControls.md:26:`GATE_MUTANTS: CLEAN (mutants=43 killed=43 frozen=41/41 drift=0 targets=2 rev=431d3b63fdca6e28d35d5c653a9e60b0dfc352de manifest=8486506f859b79ced4865adc34594a3111321e16821a54b1ee114e8d863bb12f leftovers=0)`
Q29: FAIL a control met the counter
Command exited with code 1
```

Checker caveat: an earlier start-anchored regex returned no matches because the receipt wraps the verdict in backticks; it falsely printed PASS. A broad search of the whole `build/` directory also includes unrelated CLEAN reports. Neither was accepted. The reported command uses an unanchored verdict pattern and the exact J4 receipt path; it returns the observed failure above.

Draft Q29: “An operability counter must reject named skip-work controls before data; any control that meets it requires redesign before data or an explicit exploratory claim.” Draft row class: “a skip-work control met the counter”; captured by “ScribeQ29, round-44 pre-data control review”; evidence and fix are in the row artifact.

Artifact paths: `.ufo/waves/round-44/controls/ScribeQ29.md` (this report); `/fast/scratch/hyaku/kumitate-r44/seats/ScribeQ29/ScribeQ29.patch`; `/fast/scratch/hyaku/kumitate-r44/seats/ScribeQ29/ScribeQ29-Mistakes-row.txt`.

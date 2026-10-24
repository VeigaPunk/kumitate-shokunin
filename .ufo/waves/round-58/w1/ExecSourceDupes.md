# ExecSourceDupes — round 58, w1

Axes: operability, coverage.
Measured integration revision: `6affb9ebde37b7d663658f1959d64f0f0b68f480` (R1).

## Required live run

Command:

```sh
node /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/source-dupes.mjs
```

Observed exit code: `0`.

Observed stdout:

```text
SOURCE_DUPES: CLEAN groups=5 known=5
```

Observed stderr: empty. The stdout matched the item's expected line exactly.

## R1 corroboration

A read-only `git archive` of R1 was extracted under this seat's build directory; extraction exited `0` with empty stdout and stderr. The gate was then run from that extraction:

```sh
node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-58/build/ExecSourceDupes/r1/scripts/source-dupes.mjs
```

Observed exit code: `0`; observed stdout was `SOURCE_DUPES: CLEAN groups=5 known=5`; observed stderr was empty.

The R1 registry explicitly contains the `S028` + `S123` known group with normalized URL `docs.langchain.com/oss/python/langgraph/checkpointers` (extracted `.ufo/pins/source-dupes.json`, lines 36–42). The R1 Registry rows S028 and S123 (extracted `corpus/SOURCES.md`, lines 41 and 135) carry that same URL under different scopes. Thus the required pinned-group membership is present in the inputs whose gate run returned `groups=5 known=5`.

## Finding

No duplicate-source drift was observed in either the required live run or the R1-archive run. The expected CLEAN result and the S028+S123 pin were corroborated; this report is not a round verdict.

Evidence, including full command records, raw stdout/stderr, and exit codes, is under `.ufo/waves/round-58/build/ExecSourceDupes/`:

- `source-dupes.command.txt`, `source-dupes.stdout`, `source-dupes.stderr`, `source-dupes.exit-code.txt`
- `archive-r1.command.txt`, `archive-r1.stdout`, `archive-r1.stderr`, `archive-r1.exit-code.txt`
- `source-dupes-r1.command.txt`, `source-dupes-r1.stdout`, `source-dupes-r1.stderr`, `source-dupes-r1.exit-code.txt`
- `r1/` — extracted R1 inputs and tool used for the revision-specific run

No production files were changed, no commits or other git/jj mutations were made, no seats or subagents were dispatched, and no tools were installed.

Report: .ufo/waves/round-58/w1/ExecSourceDupes.md

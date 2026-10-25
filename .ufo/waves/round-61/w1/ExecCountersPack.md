# ExecCountersPack — round 61 w1 (milestone: counter pack; judged on operability)

## Files
- `.ufo/waves/round-61/probe/counters.sh` (new, mode 0755) — the frozen-counter pack.
- `.ufo/waves/round-61/build/ExecCountersPack/counters-run.txt` — full output of the pack at the lane tip.

## Behavior
`counters.sh <rev>` runs the five counters in the assigned order. For each one it prints the exact argv (`printf %q`), the full combined stdout and stderr, and `-- exit=N`. It then prints a summary with one verdict line per counter and a final `COUNTERS61: ALL_EXIT0|NONZERO nonzero=k/5 rev=…` line.
- Header: the rev, the resolved commit sha, the node version, and the sha256 of all five invoked tools, so each run records exactly which tool versions it ran.
- Exit codes: 0 if every counter exited 0, 1 if any is non-zero, 64 for usage errors, 2 for environment errors (missing node, git or sha256sum, a rev that does not resolve with `git rev-parse --verify "$1^{commit}"`, or a scratch dir that cannot be created).
- No `eval`; commands are invoked as real argv arrays. A hostile rev (`'nope;echo pwned'`) gets exit 2 and is never run.
- Write scope: the only writers among the counters are the hermetic selftests (`mkdtemp(tmpdir())`), and counter 3 triggers the dispatch-evidence selftest. The pack sets `TMPDIR` to `probe/.tmp.XXXXXX` and removes it with an EXIT trap.

## Evidence (exercised)
- `bash -n` OK; `shellcheck` exit 0 (`/usr/bin/shellcheck`, already installed).
- No arguments gave exit 64. A bad rev gave exit 2 with the line `COUNTERS61: ENV rev nope;echo pwned does not resolve to a commit in …`.
- Idempotence: two back-to-back runs at the tip were byte-identical (`cmp` OK). `find -newer marker` across the lane (excluding .jj and .git) listed only the `probe/` directory, whose timestamp changed from creating and removing the scratch dir. No `kumitate-proxy-selftest-*`, `dispatch-evidence-selftest.*` or `sources-census.*` dirs leaked into `/tmp`.

## Verdicts at the lane tip be4a820c344d4eb2f94b999c3b5d649e76ab70f1 (pack exit 1)
```
[1] exit=0 kumitate	ok	/home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/SOURCES.md
[2] exit=1 PROXY: DRIFT (A_DRIFT term=A declared=105 computed=112 delta=+7; C2_DRIFT term=C2 declared=145 computed=146 delta=+1; C2_TOTAL_DRIFT term=C2_total declared=145 computed=146 delta=+1; PIN_UNPINNED term=scripts/make-dispatch-actual.mjs; src-rev=31c465f15669)
[3] exit=1 DISPATCH61: DISPATCH61_UNMET held=1/4 checks=4 rev=be4a820c344d4eb2f94b999c3b5d649e76ab70f1 rule=P61
[4] exit=1 DOCTRINE61: DOCTRINE61_UNMET held=1/6 checks=6 rev=be4a820c344d4eb2f94b999c3b5d649e76ab70f1 rule=D61
[5] exit=2 DISPATCH_EVIDENCE: FAIL-CLOSED progress-absent path=/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-61/w1/launcher-progress.tsv
COUNTERS61: NONZERO nonzero=4/5 rev=be4a820c344d4eb2f94b999c3b5d649e76ab70f1
```
Census validate printed 6 W04 warnings (S034, S068, S084, S095, S123, S126). Warnings do not change its exit code.
- Dispatch probe (P61): P1 passed (the selftest prints `PASS (8/8)`). P2 missed (`gate=2 clean=false reports=0`). P3 missed because the SCORECARD `dispatch-evidence` row does not mention round 61. P4 missed because `close/dispatch61-tip.txt` is absent.
- Doctrine probe (D61): only E5 passed (census exit 0). E1 through E4 and E6 missed because the S195 entry, its SOURCES row, its pin and its README mapping are not yet at the tip.

## Risks
- Counters 1, 2 and 5, and the readme-map and census sub-checks inside counter 4, read the **live working tree**, not `<rev>`. Proxy-check output drifted between my runs (A computed went from 111 to 112, and `PIN_UNPINNED scripts/make-dispatch-actual.mjs` appeared) while sibling seats were adding files. The artifact is the final run of the final pack version; my first full run, against the pre-regex version, showed A=111 and no PIN_UNPINNED. Close-time counter values are only meaningful once the working tree is frozen at the judged rev.
- I ran the real pack three times (the first was against an earlier version whose summary regex missed the census `ok` row), not once. Its only side effect is stdout.
- I ran one read-only `jj log -r @` early on, which may have snapshotted the working copy into the jj op log. I ran no mutating jj or git commands.

## Tooling
No installs or upgrades.

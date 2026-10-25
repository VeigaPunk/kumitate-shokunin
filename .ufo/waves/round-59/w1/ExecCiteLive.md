# ExecCiteLive — round 59 / w1

Item: run the live `cite-sources` gate and quote `git grep -n S121 -- corpus/README.md`. Axes: operability, coverage. Date: 2026-10-24.

**Result: CORROBORATED** for both assigned expectations. This report is not a round verdict and does not score REPAIR59 or DOCTRINE59.

## Revision binding

`git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin rev-parse HEAD` printed `5469c0a58d7986ff8a5f203938ae1c8785a92213` and exited 0. That is the wave score revision. `git diff --exit-code` of that revision against `scripts/cite-sources.mjs`, `corpus/README.md`, and `corpus/SOURCES.md` exited 0 with empty stdout and stderr. `git status --porcelain --untracked-files=all` on those three paths exited 0 with empty stdout. The live gate read the same bytes as the score revision.

## Assigned command — cite-sources

cwd: `/home/vgpnk/Projects/shokunin/kumitate-shokunin`

The script defaults are `corpus/README.md` and `corpus/SOURCES.md`, resolved from `process.cwd()` (`scripts/cite-sources.mjs` lines 78–79 and 87–88). The assigned argv was not given `--readme` or `--sources`.

```console
$ node /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/cite-sources.mjs
CITE_SOURCES: CLEAN cited=149
```

Exit: `0`. Stderr: empty (0 bytes). The expected status word `CITE_SOURCES: CLEAN` is the start of that line. The script's published success form is `CITE_SOURCES: CLEAN cited=<n>` (header, exit 0). The item did not name a cited count; the printed count is 149.

A same-argv control from the session cwd `/home/vgpnk/Projects/shokunin` printed `CITE_SOURCES: FAIL-CLOSED reason=README_UNREADABLE` and exited 2. That process does not read the lane corpus. It is an invocation constraint, not a ghost id.

A recount with the gate's published rule (map rows only; `S` + 3 or more digits; each id must be a SOURCES.md row) printed `recount cited=149 mapRows=142 registryIds=126 ghosts=0 first=none s121cited=false s121registry=false` and exited 0. The cited count matches the gate line. No ghost was found, including S121.

## Assigned command — S121

```console
$ git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin grep -n S121 -- corpus/README.md
```

Stdout: empty (0 bytes). Stderr: empty (0 bytes). Exit: `1`. No matching line was printed.

Installed `git help grep` (Git 2.56.0) has no EXIT STATUS section. The nearest local wording is the `-q` option: status 0 when there is a match, non-zero when there isn't. This invocation was not `-q`. The no-match reading is the empty stdout plus exit 1. A second reading, `grep -n S121 -- corpus/README.md` from the lane, also printed nothing and exited 1.

## Evidence and scope

Captures and the command index are under `.ufo/waves/round-59/build/ExecCiteLive/`. Primary files: `cite-sources.stdout`, `cite-sources.stderr`, `cite-sources.exit`, `cite-sources.pwd`, `grep-s121.stdout`, `grep-s121.stderr`, `grep-s121.exit`. Binding files use the `head.*`, `score-rev.*`, `score-ancestor.*`, `diff-score-gate-inputs.*`, and `status-gate-inputs.*` names. The fleet-cwd control is `cite-sources-fleet-cwd.*`. The recount is `recount.*`. `commands.md` is the index.

This seat ran only the assigned live gate, the assigned grep, and the read-only checks above. It did not run `--selftest`, `repair59-probe.mjs`, or `doctrine59-probe.mjs`. No subagent was dispatched. No production file, lane ledger, corpus file, pin, jj state, or Git index was changed. Writes were confined to this report and `build/ExecCiteLive/`. No install, pacman transaction, commit, push, or mutating git/jj command occurred.

Report: .ufo/waves/round-59/w1/ExecCiteLive.md

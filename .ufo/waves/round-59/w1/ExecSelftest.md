# ExecSelftest — kumitate round 59

Axes: operability, coverage.

Scope: C1 operability, `cite-sources` `--selftest` only. Observation report, not a `REPAIR59_HELD` verdict.

Measured revision: `5469c0a58d7986ff8a5f203938ae1c8785a92213`. `git rev-parse HEAD` printed that hash. `git merge-base --is-ancestor 5469c0a58d7986ff8a5f203938ae1c8785a92213 HEAD` exited 0. `git status --porcelain -- scripts/cite-sources.mjs` printed nothing (evidence file is 0 bytes). SHA-256 of `git show 5469c0a58d7986ff8a5f203938ae1c8785a92213:scripts/cite-sources.mjs` and of the working-tree script are the same: `7211be845cd994e6dc3bf1b1ed821a0464d9aa1cce6f4695412095a9fc2921a6`. Node `v26.12.0`. Selftest shell clock: `2026-10-25T00:29:58Z`.

Command:

```sh
node /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/cite-sources.mjs --selftest
```

Observed exit code: `0`. Stderr was empty (0 bytes). Observed stdout:

```text
PASS clean-known-ids
PASS ghost-s121
PASS family-ids-ignored
PASS two-ghosts-first-named
PASS prose-outside-rows-ignored
PASS unparsed-registry-is-drift
PASS no-citations-clean
PASS usage-64
CITE_SOURCES_SELFTEST: PASS (8/8)
VERDICT: PASS
```

Quoted lines:

- `CITE_SOURCES_SELFTEST: PASS (8/8)`
- `VERDICT: PASS`

Scoped finding: the named expectation is corroborated. Eight case lines passed, none failed, summary is PASS (8/8), verdict line is PASS, exit is 0. That is the B1 arm in `.ufo/waves/round-59/probe/repair59-probe.mjs` (selftest prints `CITE_SOURCES_SELFTEST: PASS (8/8)` and exits 0). This command does not print `REPAIR59_HELD` and does not score C2.

Attack checked: a PASS from bytes other than the score revision. Working-tree hash equals the blob at `5469c0a58d7986ff8a5f203938ae1c8785a92213`. No drift found on this run.

Evidence, lane-relative:

- `.ufo/waves/round-59/build/ExecSelftest/selftest.command.txt`
- `.ufo/waves/round-59/build/ExecSelftest/selftest.stdout`
- `.ufo/waves/round-59/build/ExecSelftest/selftest.stderr`
- `.ufo/waves/round-59/build/ExecSelftest/selftest.exit`
- `.ufo/waves/round-59/build/ExecSelftest/blob.sha256`
- `.ufo/waves/round-59/build/ExecSelftest/wt.sha256`
- `.ufo/waves/round-59/build/ExecSelftest/status.porcelain`
- `.ufo/waves/round-59/build/ExecSelftest/node.version`

Report: .ufo/waves/round-59/w1/ExecSelftest.md

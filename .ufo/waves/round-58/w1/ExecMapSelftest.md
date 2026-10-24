# ExecMapSelftest — kumitate round 58

Axes: operability, coverage.

Measured revision: `6affb9ebde37b7d663658f1959d64f0f0b68f480` (R1). `git rev-parse HEAD` returned R1. The working-tree gate and `git show R1:scripts/readme-map.mjs` both hashed to `b1c8bf97eb01fdb2ebfd46521c8e805fa2c36f8e10ce9740531162cd0b8ee74e` (SHA-256).

Command:

```sh
node /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/readme-map.mjs --selftest
```

Observed exit code: `0`. Stderr was empty. Observed stdout:

```text
case clean: PASS
case uncovered: PASS
case orphan-row: PASS
case duplicate-row: PASS
case format-unmapped: PASS
case stale-covered: PASS
case unpinned: PASS
case empty-covered: PASS
case malformed-registry: PASS
case registry-version: PASS
case covered-scope: PASS
case readme-absent: PASS
case corpus-dir-missing: PASS
case non-corpus-rows: PASS
case covered-not-file: PASS
case symlink-stale-covered: PASS
README_MAP_SELFTEST: PASS (16/16)
VERDICT: PASS
```

Scoped finding: **16 case PASS lines**, including `covered-not-file` and `symlink-stale-covered`; the final verdict is **PASS**. The expected ExecMapSelftest result is corroborated at R1. This observation covers the requested self-test only and is not an `ATTEST58_HELD` verdict.

Full evidence:

- `.ufo/waves/round-58/build/ExecMapSelftest/selftest.command.txt`
- `.ufo/waves/round-58/build/ExecMapSelftest/selftest.stdout.txt`
- `.ufo/waves/round-58/build/ExecMapSelftest/selftest.stderr.txt`
- `.ufo/waves/round-58/build/ExecMapSelftest/selftest.exit.txt`
- `.ufo/waves/round-58/build/ExecMapSelftest/revision-preflight.txt`

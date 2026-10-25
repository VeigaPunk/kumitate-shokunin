# ExecRepair59 — kumitate round 59

Axes: operability, coverage.

Scope: C1 operability, rule A59, the frozen `repair59-probe.mjs` at score revision `5469c0a58d7986ff8a5f203938ae1c8785a92213`. Observation report, not a claim verdict.

## Assigned command — observed

Captured `2026-10-24T21:32:02-03:00`. Interpreter: `node` `v26.12.0` at `/home/vgpnk/.local/share/mise/installs/node/latest/bin/node`. `git cat-file -t` of the named rev printed `commit`; `rev-parse --verify 5469c0a58d7986ff8a5f203938ae1c8785a92213^{commit}` printed the same hash. HEAD was not moved.

```sh
node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-59/probe/repair59-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin 5469c0a58d7986ff8a5f203938ae1c8785a92213
```

Observed exit code: `0`. Stderr was empty (0 bytes). Observed stdout, both lines:

```text
REPAIR59: REPAIR59_HELD held=8/8 checks=8 rev=5469c0a58d7986ff8a5f203938ae1c8785a92213 rule=A59 version=v1
 | B1 PASS selftest-8/8 | B2 PASS clean | B3 PASS prose=19 rows=19 cite-sources=true | B4 PASS cite=true receipt=true mapv2=true 16/16=true stale135=false | B5 PASS pinned=true status=0  | B6 PASS literal | B7 PASS TIER59: A=104 B=14 C=8 rows=126 | B8 PASS nuance=true pin-first=true
```

Quoted REPAIR59 line:

`REPAIR59: REPAIR59_HELD held=8/8 checks=8 rev=5469c0a58d7986ff8a5f203938ae1c8785a92213 rule=A59 version=v1`

That line is byte-identical to the plan predicate with `<rev>` replaced by `5469c0a58d7986ff8a5f203938ae1c8785a92213`. Stdout is 391 bytes, sha256 `70c0e2c97342628163edccd51096c7009884da18a3b1d7b0aa2fc46905cece33`. An earlier run in this seat printed the same two lines and exited `0`; the files below are the write-time capture.

## Attack

Target: a `held=8/8` that is not what this command printed.

It does not land. The captured headline contains the token `held=8/8`. Parsing the same stdout: the held field is `8/8`, the second line has eight arms (`B1`–`B8`), eight `PASS`, zero `MISS`. The numerator is the arm count in that stdout, not a figure copied from the plan.

Limit of the printed detail, not a failed hold: the `B5` arm text ends at `status=0` and does not itself show `README_MAP: CLEAN`. This seat did not re-extract the archive to re-read that token. The command still printed `B5 PASS` and `held=8/8`.

## Evidence and scope

Lane-relative, under `.ufo/waves/round-59/build/ExecRepair59/`:

- `command.txt`
- `stdout.txt`
- `stderr.txt`
- `exit-code.txt`
- `attack.txt`
- `node.version`
- `node.path`
- `clock.txt`
- `rev.txt`
- `rev.type`

This seat ran only the assigned probe. It did not run `doctrine59-probe.mjs`, `cite-sources.mjs`, or `readme-map.mjs` on its own, and it does not score C2. No production file, lane ledger, corpus file, pin, jj state, or Git index was changed. Writes were confined to this report and `build/ExecRepair59/`. No install, pacman transaction, commit, push, or mutating git/jj command was used. No seat was dispatched.

Report: .ufo/waves/round-59/w1/ExecRepair59.md

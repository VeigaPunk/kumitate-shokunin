# ExecMap — round 59 / w1

Item: run `node /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/readme-map.mjs`. Quote the `README_MAP` line. Expect `CLEAN files=141 rows=141 covered=141`. Name the first finding if it drifts. Axes: operability, coverage. Date: 2026-10-24.

**Item result: CORROBORATED.** This is not a claim verdict. The assigned gate printed exactly `README_MAP: CLEAN files=141 rows=141 covered=141` and exited `0`. Stderr was empty. It did not drift, so there is no first finding.

## Revision binding

`git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin rev-parse HEAD` printed `5469c0a58d7986ff8a5f203938ae1c8785a92213`, the score revision named for this wave. `rev-parse` of that hash printed the same value. A path-limited `git status --porcelain --untracked-files=all` and `git diff --stat 5469c0a58d7986ff8a5f203938ae1c8785a92213` over `scripts/readme-map.mjs`, `.ufo/pins/readme-map.json`, `corpus/README.md`, `corpus/knowledge`, and `corpus/lessons` both exited `0` with empty stdout, so those gate inputs matched that revision in the working tree. HEAD was not moved.

## Assigned command — observed

cwd: `/home/vgpnk/Projects/shokunin/kumitate-shokunin`. Interpreter: `node` `v26.12.0` at `/home/vgpnk/.local/share/mise/installs/node/latest/bin/node`. Captured `2026-10-24T21:30:14-03:00`.

```console
$ node /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/readme-map.mjs
README_MAP: CLEAN files=141 rows=141 covered=141
```

Exit: `0`. Stderr: empty (0 bytes). Stdout is one line, 49 bytes including the trailing newline, sha256 `bca9b8189352ee8e73d59b589bfbf82b18c156de65b74bc400ac0c17f4c25db7`. That line matches the expected `CLEAN files=141 rows=141 covered=141` byte-for-byte.

## First finding

None. A drift would have printed `README_MAP: DRIFT files=<n> rows=<n> covered=<m> bad=<k> first=<item>` and exited `1`. The observed line is `CLEAN`, `bad` and `first` are absent, and the exit is `0`.

## Evidence and scope

Command, stdout, stderr, exit, hashes, and the revision/status captures are under `.ufo/waves/round-59/build/ExecMap/`. `commands.md` is the command/exit index. Primary captures: `readme-map.stdout`, `readme-map.stderr`, `readme-map.exit`, `readme-map.sha256`, `head.txt`, `score-rev.txt`, `gate-inputs.status`, `gate-inputs.diffstat`.

This seat ran only the assigned clean gate. It did not run `--selftest`, `repair59-probe.mjs`, or `doctrine59-probe.mjs`, and it does not attest REPAIR59 or DOCTRINE59. No production file, lane ledger, corpus file, pin, jj state, or Git index was changed. Writes were confined to this report and `build/ExecMap/`. No install, pacman transaction, commit, push, or mutating git/jj command was used.

Report: .ufo/waves/round-59/w1/ExecMap.md

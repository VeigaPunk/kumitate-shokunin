# ExecMapClean — round 58 / w1

Item: execute `readme-map` and corroborate the exact CLEAN counts and registry v2 version. Axes: operability + coverage. Date: 2026-10-24.

**Result: CORROBORATED.** The assigned gate printed exactly `README_MAP: CLEAN files=138 rows=138 covered=138` and exited `0`. The registry's `version` field printed `2` and that command also exited `0`. Both stderr streams were empty. No falsification was observed within this item's clean-path scope.

## Revision binding

`git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin rev-parse HEAD` printed `6affb9ebde37b7d663658f1959d64f0f0b68f480`, exactly the measured integration revision R1; HEAD was not moved. A path-limited, optional-locks-disabled `git status --porcelain --untracked-files=all` over the gate, registry, README, knowledge, and lessons paths exited `0` with empty stdout/stderr, so it reported no worktree changes among those gate inputs.

## Assigned command — observed

cwd: `/home/vgpnk/Projects/shokunin/kumitate-shokunin`

```console
$ node /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/readme-map.mjs
README_MAP: CLEAN files=138 rows=138 covered=138
```

Exit: `0`. Stderr: empty. This matches the required 138/138/138 CLEAN reading byte-for-byte as captured.

## Registry version — observed

```console
$ node -p 'JSON.parse(require("node:fs").readFileSync("/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/pins/readme-map.json", "utf8")).version'
2
```

Exit: `0`. Stderr: empty. The observed value is the required v2 registry version.

## Evidence and scope

Full commands, separate stdout/stderr captures, and exit-code files are retained under `.ufo/waves/round-58/build/ExecMapClean/`; `commands.md` is the command/exit index. The primary captures are `readme-map.stdout`, `readme-map.stderr`, `readme-map.exit`, `readme-map-version.stdout`, `readme-map-version.stderr`, and `readme-map-version.exit`; revision/status captures use the `head.*` and `relevant-status.*` names.

This seat exercised only the assigned clean gate and version read. It did not run the selftest or either frozen counter, and makes no broader ATTEST58/DOCTRINE58 verdict. No production file, lane ledger, corpus file, pin, jj state, or Git index was changed. Writes were confined to this report and `build/ExecMapClean/`; no install, pacman transaction, commit, push, or mutating git/jj command occurred.

Report: .ufo/waves/round-58/w1/ExecMapClean.md

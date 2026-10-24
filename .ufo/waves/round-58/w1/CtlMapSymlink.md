# CtlMapSymlink — round 58 / w1

Item: make a covered member a dangling symlink in a sandbox clone and capture DRIFT `stale-covered:` with exit `1`. Axes: operability + coverage. Date: 2026-10-24.

**Result: CORROBORATED.** At R1, replacing the covered regular file `knowledge/agent-isolation-substrates.md` with a verified dangling symlink produced `README_MAP: DRIFT ... bad=1 first=stale-covered:knowledge/agent-isolation-substrates.md` and exit `1`. The unmodified control was CLEAN with exit `0`; the mutated gate's stderr was empty.

## Revision binding and clean control

The evidence runner cloned with `git clone --no-hardlinks file:///home/vgpnk/Projects/shokunin/kumitate-shokunin .../build/CtlMapSymlink/lane`, then checked out `6affb9ebde37b7d663658f1959d64f0f0b68f480` in that clone. `git rev-parse HEAD` printed exactly the measured integration revision R1:

```text
6affb9ebde37b7d663658f1959d64f0f0b68f480
```

Before mutation, the selected registry member was a regular file, the registry was version 2, and the intended symlink target did not exist. The control command was:

```console
$ node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-58/build/CtlMapSymlink/lane/scripts/readme-map.mjs
README_MAP: CLEAN files=138 rows=138 covered=138
```

Control exit: `0`. Control stderr: empty.

## Mutation — observed only in the sandbox clone

The first `covered` entry, `knowledge/agent-isolation-substrates.md`, was removed in the clone and replaced by a symlink named the same, targeting `__CtlMapSymlink_r58_missing_target__`. The mutation commands and their exits are retained in `commands.md`. Independent inspection after the mutation exited `0` and printed:

```json
{"member":"knowledge/agent-isolation-substrates.md","isSymbolicLink":true,"target":"__CtlMapSymlink_r58_missing_target__","targetExists":false}
```

Thus the member was a symlink and its target was absent. Path-limited `git status --short` in the clone reported ` T corpus/knowledge/agent-isolation-substrates.md`; no commit was created.

## Assigned gate after mutation — observed

```console
$ node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-58/build/CtlMapSymlink/lane/scripts/readme-map.mjs
README_MAP: DRIFT files=138 rows=138 covered=138 bad=1 first=stale-covered:knowledge/agent-isolation-substrates.md
```

Observed exit: `1`. Observed stderr: empty. This is the required DRIFT class, exact covered path, and exit code; `bad=1` shows no additional finding was emitted.

## Evidence and scope

Full commands, separate stdout/stderr captures, and per-command exit-code files are under `.ufo/waves/round-58/build/CtlMapSymlink/`. `commands.md` indexes all eleven commands. Primary captures are `05-gate-clean.*`, `08-inspect-symlink.*`, and `09-gate-dangling.*`; `03-revision.*` binds the clone to R1, and `runner.sh` preserves the executed sequence.

This seat exercised only the assigned dangling-covered-member control. It is not an `ATTEST58_HELD` or `DOCTRINE58_HELD` verdict. No production file, lane ledger, corpus file, pin, source lane Git index, or jj state was changed. Writes were confined to this report and `build/CtlMapSymlink/`; no install, pacman transaction, commit, push, dispatch, subagent, or source assessment occurred.

Report: .ufo/waves/round-58/w1/CtlMapSymlink.md

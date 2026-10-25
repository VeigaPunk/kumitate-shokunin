# MutGhost — round 59 / w1

Item: in `/tmp` only, a README map row citing S121 and a SOURCES file that has S112 but not S121. Run `node scripts/cite-sources.mjs --readme <tmp> --sources <tmp>`. Expect `DRIFT` `first=S121`, exit 1. Axes: operability, coverage. Clock: `2026-10-25T00:38:18Z` (`00-clock.txt`).

**Result: CORROBORATED** for that expectation. This report is not a round verdict and does not score REPAIR59 or DOCTRINE59.

## Revision binding

`git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin rev-parse HEAD` printed `5469c0a58d7986ff8a5f203938ae1c8785a92213` and exited 0. That is the wave score revision. `git merge-base --is-ancestor 5469c0a58d7986ff8a5f203938ae1c8785a92213 HEAD` exited 0.

`git hash-object scripts/cite-sources.mjs` and `git rev-parse 5469c0a58d7986ff8a5f203938ae1c8785a92213:scripts/cite-sources.mjs` both printed `d256297dacdb89a540ea82373657ec4696083d13` and exited 0. SHA-256 of the working-tree script and of `git show` of that blob are the same: `7211be845cd994e6dc3bf1b1ed821a0464d9aa1cce6f4695412095a9fc2921a6`. Node `v26.12.0`.

`git diff --exit-code 5469c0a58d7986ff8a5f203938ae1c8785a92213 -- scripts/cite-sources.mjs corpus/README.md corpus/SOURCES.md` exited 0 before the gate (`08-diff.exit`) and again after (`15-diff-after.exit`). After the run, `git status --porcelain` on those three paths exited 0 and `14-status-after.stdout` is empty. The gate binary is the score-revision script. The lane corpus was not an input and was not edited.

## Fixtures

Live files, not lane paths:

- `/tmp/kumitate-r59-MutGhost/README.md`
- `/tmp/kumitate-r59-MutGhost/SOURCES.md`

README map row, copied as `readme.fixture.md`:

```text
| `knowledge/failure-recovery-replay.md` | Temporal replay (S121) |
```

`grep -n S121` on that README exited 0 and printed `1:| `knowledge/failure-recovery-replay.md` | Temporal replay (S121) |` (`18-readme-s121.stdout`).

SOURCES, copied as `sources.fixture.md`:

```text
| id | source |
|---|---|
| S112 | example |
```

`grep -n S112` exited 0 and printed `3:| S112 | example |` (`17-sources-s112.stdout`). `grep -n S121` on SOURCES exited 1 with empty stdout (`16-sources-s121.exit`; `16-sources-s121.stdout` is 0 bytes). That is the absence check.

Do not use `13-sources-s121.exit`. That capture was `grep || true`, so the exit file is 0 even though `13-sources-s121.stdout` is empty. The recount is `16-sources-s121.*`. See `13-sources-s121.NOTE`.

## Assigned command

Process cwd was `/tmp` (`20-assigned.pwd`, recorded inside the same subshell). `cite-sources.pwd` is not the process cwd; it was written as the fixture directory before `cd /tmp`. See `cite-sources.pwd.NOTE`.

```console
$ node /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/cite-sources.mjs --readme /tmp/kumitate-r59-MutGhost/README.md --sources /tmp/kumitate-r59-MutGhost/SOURCES.md
CITE_SOURCES: DRIFT ghosts=1 first=S121
```

Exit: `1` (`20-assigned.exit`). Stderr: empty (0 bytes, `20-assigned.wc`). Quoted line: `CITE_SOURCES: DRIFT ghosts=1 first=S121`.

An earlier invocation with the same argv, also from cwd `/tmp`, wrote the same stdout. `cmp -s cite-sources.stdout 20-assigned.stdout` exited 0. That first capture's exit file is `cite-sources.exit` (`1`). Stderr of that run is also 0 bytes (`cite-sources.wc`).

## Control

Not the assigned command. Same SOURCES file. README map row cites only S112 (`readme-s112-only.fixture.md`): `| `knowledge/a.md` | cites S112 |`.

```console
$ node /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/cite-sources.mjs --readme /tmp/kumitate-r59-MutGhost/README-s112-only.md --sources /tmp/kumitate-r59-MutGhost/SOURCES.md
CITE_SOURCES: CLEAN cited=1
```

Exit: `0` (`control-clean.exit`). Stderr: empty. The drift is the unregistered id S121, not a fail-closed read of these flags.

## Scope

Evidence index: `.ufo/waves/round-59/build/MutGhost/commands.md`. No production file, corpus file, pin, ledger, jj state, or Git index was changed. No subagent was dispatched. No install, pacman, commit, or push. Writes were this report and `.ufo/waves/round-59/build/MutGhost/`. The fixtures the gate read stay under `/tmp/kumitate-r59-MutGhost/`.

Report: .ufo/waves/round-59/w1/MutGhost.md

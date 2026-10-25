# MutFamily — round 59 / w1

Item: in `/tmp` only, a README map row citing S6 and S7, and a SOURCES file with no S6 row. Run `cite-sources` against those files. Expect `CLEAN`, because family ids are not source ids. Quote the line. Axes: operability, coverage. Clock: `2026-10-24T21:39:22-0300` (`2026-10-25T00:39:22Z`).

**Result: CORROBORATED.** The named expectation was not falsified. This report is not a round verdict and does not score REPAIR59 or DOCTRINE59.

## Revision binding

`git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin rev-parse HEAD` printed `5469c0a58d7986ff8a5f203938ae1c8785a92213`. `git rev-parse --verify 5469c0a58d7986ff8a5f203938ae1c8785a92213^{commit}` printed the same hash. `git merge-base --is-ancestor 5469c0a58d7986ff8a5f203938ae1c8785a92213 HEAD` exited 0. `git status --porcelain -- scripts/cite-sources.mjs` printed nothing. `git diff --exit-code 5469c0a58d7986ff8a5f203938ae1c8785a92213 -- scripts/cite-sources.mjs` exited 0. `git hash-object scripts/cite-sources.mjs` and `git rev-parse 5469c0a58d7986ff8a5f203938ae1c8785a92213:scripts/cite-sources.mjs` both printed `d256297dacdb89a540ea82373657ec4696083d13`. SHA-256 of the working-tree script and of `git show 5469c0a58d7986ff8a5f203938ae1c8785a92213:scripts/cite-sources.mjs` are the same: `7211be845cd994e6dc3bf1b1ed821a0464d9aa1cce6f4695412095a9fc2921a6`. Node `v26.12.0`. Identity stderr was empty (0 bytes).

The gate that ran is that blob. It was not a `/tmp` copy of the script.

## Assigned fixtures

Directory `/tmp/mutfamily.rcZHD8Bx` (under `/tmp`, not the lane). The gate argv used those paths. Copies under `build/MutFamily/` are the audit record, not the files the gate read.

README, one map row (first non-space characters are `| `):

```text
| `knowledge/ops-watchers.md` | family S6 and S7 |
```

`grep -n -o -E 'S[0-9]+'` on that file printed `1:S6` and `1:S7` and exited 0. No other id token.

SOURCES, rows present, no S6 row:

```text
| id | source |
|---|---|
| S112 | example |
| S122 | example |
```

`grep -n -F 'S6'` on that file printed nothing and exited 1. `grep -n -F 'S7'` exited 1. `realpath` of the two inputs printed `/tmp/mutfamily.rcZHD8Bx/README.md` and `/tmp/mutfamily.rcZHD8Bx/SOURCES.md`.

## Assigned command

cwd: `/tmp`

```console
$ node /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/cite-sources.mjs --readme /tmp/mutfamily.rcZHD8Bx/README.md --sources /tmp/mutfamily.rcZHD8Bx/SOURCES.md
CITE_SOURCES: CLEAN cited=0
```

Exit: `0`. Stderr: empty (0 bytes). Quoted line: `CITE_SOURCES: CLEAN cited=0`.

`cited=0` is the operative count. S6 and S7 were on a map row and were not in the SOURCES id column, and the gate did not treat them as ghosts. Absolute `--readme` and `--sources` were passed, so the process did not read `corpus/README.md` or `corpus/SOURCES.md`.

## Attacks

Same script, same `/tmp` directory, same SOURCES file. Not the assigned item.

Ghost on the same row shape. README line: `| `knowledge/ops-watchers.md` | family S6 and S7 and ghost S121 |`. SOURCES still has S112 and S122, and no S6 row and no S121 row.

```console
$ node /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/cite-sources.mjs --readme /tmp/mutfamily.rcZHD8Bx/README-ghost.md --sources /tmp/mutfamily.rcZHD8Bx/SOURCES.md
CITE_SOURCES: DRIFT ghosts=1 first=S121
```

Exit: `1`. Stderr: empty (0 bytes). The row form is live. A three-digit id missing from SOURCES is still a ghost. Family tokens on that row did not suppress S121 and were not themselves named as ghosts. This closes the reading that the assigned `CLEAN cited=0` came from an unread row.

Boundary of the stated family range. README line: `| `knowledge/ops-watchers.md` | family S11 |`. SOURCES id row is only `| S112 | example |`.

```console
$ node /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/cite-sources.mjs --readme /tmp/mutfamily.rcZHD8Bx/README-s11.md --sources /tmp/mutfamily.rcZHD8Bx/SOURCES-s11.md
CITE_SOURCES: CLEAN cited=0
```

Exit: `0`. Stderr: empty (0 bytes). S11 was not counted. This did not falsify the two-digit end of S1–S11.

`grep -n -F 'S11'` on that SOURCES file exited 0. That is a substring hit inside `S112`, not an S11 row. Absence of an S11 row is the quoted file, not that grep.

## Evidence and scope

Captures are under `.ufo/waves/round-59/build/MutFamily/`. Assigned run: `command.txt`, `cite.stdout`, `cite.stderr`, `cite.exit`, `cite.pwd`, `readme.fixture`, `sources.fixture`, `readme-tokens.stdout`, `sources-s6.stdout`, `sources-s6.exit`, `sources-s7.exit`, `fixture.realpath`, `tmp.path`. Binding: `00-identity.txt`, `00-identity.stderr`, `wt.sha256`, `blob.sha256`, `executed.sha256`, `node.version`, `rule-excerpt.txt`. Attacks: `control-ghost.*`, `control-s11.*`.

This seat ran the assigned `/tmp` gate and the two attacks above. It did not run `--selftest`, `repair59-probe.mjs`, or `doctrine59-probe.mjs`. No subagent was dispatched. No production file, lane ledger, corpus file, pin, jj state, or Git index was changed. Writes were confined to this report and `build/MutFamily/`. Fixtures the gate read stayed under `/tmp/mutfamily.rcZHD8Bx`. No install, pacman transaction, commit, push, or mutating git/jj command occurred.

Report: .ufo/waves/round-59/w1/MutFamily.md

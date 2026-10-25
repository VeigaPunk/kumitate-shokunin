# ExecCapture — round 59, wave 1

- Axes: operability, coverage.
- Measured revision: `5469c0a58d7986ff8a5f203938ae1c8785a92213`. `git rev-parse HEAD` returned the same full hash. This item does not name the base.
- Outcome: **corroborated**, not a claim verdict. The source-capture gate printed CLEAN and exited 0. Independent `sha256sum` of the three round-59 captures equals the S125, S127, and S136 pins in `.ufo/pins/source-captures.json`. No mismatch observed.

## Gate observation

Command, cwd `/home/vgpnk/Projects/shokunin/kumitate-shokunin`:

```sh
node /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/source-capture.mjs
```

Observed stdout:

```text
SOURCE_CAPTURE: CLEAN captures=19 exemptions=107
```

Observed stderr: empty. Exit code: `0`.

The live registry has 19 capture rows and 107 exemption ids, each set unique, with no capture/exemption overlap. The only `round-59` capture paths are the three below. That accounts for the count in the CLEAN line; it does not re-score C1 or C2.

## sha256sum versus pins

Command:

```sh
sha256sum .ufo/waves/round-59/build/ScoutMcpArch/body.html .ufo/waves/round-59/build/ScoutMcpTasks/body.md .ufo/waves/round-59/build/ScoutZenn/body.html
```

Observed stdout, exit `0`, stderr empty:

```text
3f5cdc194aab7f1e15ecc255030fa42522e24341beaf7328ce71161cfa2963ca  .ufo/waves/round-59/build/ScoutMcpArch/body.html
5fc22b9b5ff248703927c69855f751a061c2d6170f4dc3923204452f859f91a5  .ufo/waves/round-59/build/ScoutMcpTasks/body.md
64fd5551c7357e2ca4d65deac37dfa8b60050cc1fcfb16df83929501d97395b5  .ufo/waves/round-59/build/ScoutZenn/body.html
```

Pin rows in `.ufo/pins/source-captures.json` (one row each; captured `2026-10-24`):

- **S125** — `.ufo/waves/round-59/build/ScoutMcpArch/body.html`; `688587` bytes; SHA-256 `3f5cdc194aab7f1e15ecc255030fa42522e24341beaf7328ce71161cfa2963ca`.
- **S127** — `.ufo/waves/round-59/build/ScoutMcpTasks/body.md`; `34156` bytes; SHA-256 `5fc22b9b5ff248703927c69855f751a061c2d6170f4dc3923204452f859f91a5`.
- **S136** — `.ufo/waves/round-59/build/ScoutZenn/body.html`; `194763` bytes; SHA-256 `64fd5551c7357e2ca4d65deac37dfa8b60050cc1fcfb16df83929501d97395b5`.

Each `sha256sum` digest equals the pin for that path. `stat` reported all three as regular files. `wc -c` printed `688587`, `34156`, and `194763`, matching the pin byte counts.

## Attacks that did not fire

- CLEAN with a non-zero exit: exit was `0`.
- CLEAN counts that the registry does not have: 19 unique captures, 107 unique exemption ids, overlap empty.
- A round-59 capture other than S125/S127/S136, or one of those three missing from the registry: `round59_count=3 ids=S125,S127,S136`.
- Hash or byte mismatch against the live pin: none.
- Symlink or non-file capture: all three are regular files.
- Live pins differing from the score revision: `git show 5469c0a58d7986ff8a5f203938ae1c8785a92213:.ufo/pins/source-captures.json` is byte-identical to the live registry (SHA-256 `23f290401d69ec66ede06abb9d4303dfcaf492000bca9d7368b4295dcd56eee3`, 6853 bytes). Each of the three committed blobs hashes to the same SHA-256 and byte count as the live file and the pin. `git hash-object` equals `git rev-parse <rev>:<path>` for each path. `git status --porcelain` on the registry, the three captures, and `scripts/source-capture.mjs` printed nothing.

## Evidence and scope

Commands, stdout, stderr, and exit codes are under `.ufo/waves/round-59/build/ExecCapture/`:

- `01-source-capture.{command,stdout,stderr,exit}.txt`
- `02-sha256sum.{command,stdout,stderr,exit}.txt`
- `03-stat.{command,stdout,stderr,exit}.txt`
- `04-rev.{command,stdout,stderr,exit}.txt`
- `05-compare.{command,stdout,stderr,exit}.txt`
- `06-pin-index.{command,stdout,stderr,exit}.txt`

This was a mechanical persistence check only. Source content and tier were not assessed. No production file, pin, Git/jj state, or other seat directory was changed. No commit, push, dispatch, or install occurred.

Report: .ufo/waves/round-59/w1/ExecCapture.md

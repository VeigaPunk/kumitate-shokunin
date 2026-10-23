# ScoutOrigTree — origin pin clone integrity

Evidence date 2026-10-23. Read-only git. No install. No lsp (git/tree question, not a symbol).

## Verdict

| Check | Result | Confidence |
|---|---|---|
| `/fast/scratch/hyaku/kumitate-pin/src` is a clean checkout of `31c465f15669` | **holds** | high |
| `git cat-file -e` `scripts/claims-check.mjs` in that tree | **fails** (path is not in the commit) | high |
| `git cat-file -e` `crates/ufo-core-runtime/src/gate.rs` | **holds** (blob matches the worktree) | high |
| `~/Projects/origin-work` is gone | **holds** | high |
| It was renamed onto `~/Projects/ufo-fsd-alpha` | **does not hold** (different inode; see below) | high for the inode facts; the delete command itself was not found |
| `ufo-fsd-alpha` HEAD `093edb97` is past the pin | **holds** (parent is the pin; one commit) | high |
| That move touches only 4 files | **does not hold** — **5** paths, all `M` | high |
| No member-count change across that commit | **holds** (1103 blobs / 192 trees both sides; no `A`/`D`) | high |

## Pin clone

`/fast/scratch/hyaku/kumitate-pin/src`

| Fact | Value |
|---|---|
| `git rev-parse HEAD` | `31c465f15669f744848bd9f5d56191c5085670f7` |
| short | `31c465f15669` (matches `git rev-parse --verify 31c465f15669^{commit}`) |
| `git status -sb` | `## HEAD (no branch)` |
| `git status --porcelain` | empty, exit 0 |
| `git diff-index --quiet HEAD`, `diff --quiet`, `diff --cached --quiet` | all exit 0 |
| `HEAD^{tree}` | `1815a679d954f4e12624e522847641e84b25fdd8` |
| same tree at `ufo-fsd-alpha` `31c465f15669` | yes |
| `ls-tree -r` blobs / trees | 1103 / 192, nothing else |
| worktree files outside `.git` | 1103 |
| sparse checkout | no (`core.sparseCheckout` unset; no `info/sparse-checkout`) |
| mode | tree `555`, `.git` `555`, `HEAD` and blobs `444` (pin file's `chmod -R a-w`) |
| birth | 2026-10-22 10:57:12 -0300 |
| remote | `origin` = `file:///home/vgpnk/Projects/ufo-fsd-alpha` |
| shallow | yes. `rev-list --count HEAD` = 41, same as alpha at this commit. Boundaries `4f10fbff` and `72ab84a8`. Pin `.git/shallow` has 4 lines (the second hash repeated twice); alpha's file has those two hashes once each |

`gate.rs`: `git cat-file -e HEAD:crates/ufo-core-runtime/src/gate.rs` and `:crates/ufo-core-runtime/src/gate.rs` both exit 0. Type `blob`. `rev-parse` and `hash-object` of the worktree file both `e4ef51cfa95f11d2aa71cacdf4878793b0e09b88`.

`scripts/claims-check.mjs`: `git cat-file -e HEAD:scripts/claims-check.mjs` and `:scripts/claims-check.mjs` both exit 128 (`path does not exist in HEAD` / `neither on disk nor in the index`). `ls-tree -r` name grep `claims` is 0 at the pin and at alpha `093edb97`. The path is a **lane** file: `kumitate-shokunin` `fe3d45bf:scripts/claims-check.mjs` exists, blob `c787f1547d0b40da7fea855a25176dedae6861f3`. It was never an origin-tree member at either rev. The checkout is not missing a blob; the named path is the wrong repo.

Lane pin (untracked) `.ufo/pins/origin.json` (`kumitate-origin-pin-v1`): revision `31c465f15669f744848bd9f5d56191c5085670f7`, clone this path, `verified_at` 2026-10-22, recreate = `git clone --no-hardlinks file:///home/vgpnk/Projects/ufo-fsd-alpha` then detach that rev then `chmod -R a-w`.

## Where `/home/vgpnk/Projects/origin-work` went

It is not on the live tree. `ls` returns ENOENT. Not a leftover name under `~/Projects` (`origin*` matches nothing).

Not a rename of the directory that is now `~/Projects/ufo-fsd-alpha`:

- Live `~/Projects/ufo-fsd-alpha` is inode `41021`, birth **2026-10-03 21:10:37 -0300**, mode 755, branch `main`.
- A rename keeps the inode and the birth time. This inode was created 2026-10-03, so it is not the Sep-27 `origin-work/ufo-fsd-alpha` tree older notes still described as present.
- Oldest home snapper snapshot (`/home/.snapshots/1`, 2026-10-20 10:00 -03) already has no `Projects/origin-work` and already has `Projects/ufo-fsd-alpha` at the **same inode 41021**, then at HEAD `31c465f15669` (porcelain empty). Newest snapshot `#78` (2026-10-23 15:00) still has no `origin-work`. `/.snapshots` only goes back to 2026-10-20 09:03 (root fs, not this home path). No snapshot on this host still holds the old directory.

Also absent, same negative searches: `~/Projects/origin-work/charter-ufo-fsd`, `~/Projects/origin-work/open-bug-bounties`, and those two names directly under `~/Projects`. `plocate` db mtime 2026-10-23 00:22 contains **no** `/home/vgpnk/Projects/origin-work`. The only `origin-work` hits are throwaway selftest homes under `/fast/scratch/hyaku/kumitate-r42/.../home-legacy/Projects/origin-work` and, today, `/tmp/kumitate-round-gate-selftest-*/36-derived-legacy-home/Projects/origin-work`. Trash has no `*origin-work*` name. `~/.bash_history` has no `origin-work` line.

What survived is the role, not the directory. The origin checkout the pin was cloned from is `~/Projects/ufo-fsd-alpha` (`file://` remote on the pin). In that repo, `2a04baf2` (2026-10-19 19:02:03 -0300, `self-refine: … fix charter-scribe paths…`) is the commit `git log -S origin-work/ufo-fsd-alpha -- scripts/charter-scribe/systemd/charter-scribe.service` names for leaving the absolute `origin-work` path. `docs/charter-ufo-fsd/` inside the pin is docs in this repo, not the old sibling checkout.

Prior dossier, not re-timed here: `shokunin/.ufo/waves/kaika-w1/kasegi-state.md` (evidence date 2026-10-19) says the whole `~/Projects/origin-work` tree was "lost on/around 2026-10-12" and that `~/Projects/ufo-fsd-alpha` existed then at `964f443e`. This session did not find a deletion command or a snapshot from before 2026-10-20, so that calendar day stays their claim.

## Alpha past the pin

`~/Projects/ufo-fsd-alpha`

| Fact | Value |
|---|---|
| `git rev-parse HEAD` | `093edb979559443bca65245fbdd94ac3621446fb` |
| branch | `main`, local `origin/main` is the same hash, `rev-list --left-right --count origin/main...HEAD` = `0 0` (no fetch this session) |
| parent | `31c465f15669f744848bd9f5d56191c5085670f7` (`merge-base --is-ancestor` exit 0; `rev-list --count` between them = 1) |
| subject / date | `swarm: retarget wave band 16-32/100 -> 32-256 per wave, 256-member per-L1 round ceiling` / 2026-10-22 02:54:47 -0300 |
| `git status --porcelain` | empty |
| ignored only | `.devin/`, `.ufo/`, `packages/devin/.devin/` |
| shallow | yes, same two boundary commits as above; `rev-list --count` 41 at the pin, 42 at HEAD |
| trees | `1815a679d954…` → `58bb3e32b6000eb0fe4877f9c964aec77e98569d` |

`git diff --name-status 31c465f1 093edb97` (also `--find-renames`, also `diff-tree -r`): **five** `M` lines, no `A`, no `D`, no rename.

```
M	config/ufo.json
M	scripts/fleet-dispatcher.mjs
M	scripts/lean-cargo/README.md
M	scripts/ufo-mission-result.mjs
M	scripts/ufo-swarm-wave.test.mjs
```

`diff --shortstat`: 5 files changed, 37 insertions, 36 deletions. `config/ufo.json` stays 375 lines. The hunk is only `sighting.dispatch.swarm`: `maxLanes` 100 to 256, `minLanes` 16 to 32, `waveMinLanes` 16 to 32, `waveMaxLanes` 32 to 256. The other four files carry that same ceiling (comment, string, or test). `MAX_SWARM_LANES` in `scripts/ufo-mission-result.mjs` goes from 100 to 256.

Member counts from `ls-tree -r -t`: pin rev and `093edb97` are both **1103 blobs, 192 trees, 0 other**. "No member-count change" holds. "Only 4 modified files" does not — the fifth is `scripts/lean-cargo/README.md` (one line, `16–32` to `32–256`).

## Unknowns

- The shell command and clock time that removed `~/Projects/origin-work`. No history entry, no trash entry, no snapshot older than 2026-10-20.
- Whether `charter-ufo-fsd` or `open-bug-bounties` were copied somewhere under a different name before that removal. They are not at the old paths and `plocate` does not have `open-bug-bounties` at all.
- Why the item named `scripts/claims-check.mjs` as a pin-tree blob. It is a lane script; the origin commit never had it.

## Tools

None installed. `sudo -n` was used only to read snapper dirs (`/home/.snapshots`, `/.snapshots`) and to `git rev-parse` / `stat` inside snapshot `#1`.

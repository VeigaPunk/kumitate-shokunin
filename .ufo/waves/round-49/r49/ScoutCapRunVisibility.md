# ScoutCapRunVisibility — cap-run argv visibility (C1 recon)

Freeze `8237be86e2dc04e90e51b66b62bdffe770196d27`. File `scripts/cap-run.mjs` (477 lines), sha256 `d8acc6debd101b0a76ec486e49245ee10aff6e8bb841834d9c4d03c5285d5758`. Sandbox clone at that rev: `/fast/scratch/hyaku/kumitate-r49/seats/ScoutCapRunVisibility/lane`. `git diff 8237be86 -- scripts/cap-run.mjs` from the lane working tree was empty (exit 0), so these line numbers match both trees. LSP: `xd://lsp` is not mounted (devices: `ast_edit`, `debug`). No semantic server; evidence is the freeze source plus live `bwrap` 0.13.1 / `cap-run` children. No packages installed.

## Table

`mountinfo-visible` = dropping that argv element changes `/proc/self/mountinfo`. Drop tests reconstructed the bwrap argv (cap-run has no flag to omit a mount). Intact-runner checks used the sandbox `cap-run.mjs`.

| element | line | visibility effect | mountinfo-visible |
|---|---|---|---|
| `--ro-bind / /` | 187 | Recursive read-only copy of the host mount table, not just the root filesystem. On this host the child listed 32 ro rows before any later overlay: `/`, `/dev`+submounts, `/proc`+`binfmt_misc`, `/sys`+submounts, `/run`+`/run/user/1000`, `/home`, `/var/log`, `/var/cache/pacman/pkg`, `/boot`, `/fast`, `/tmp`. Later mounts cover some of these; the covered rows stay in mountinfo. | yes |
| `--dev /dev` | 187 | Does not expose host `/dev`. Mounts a private tmpfs on `/dev` and bind-mounts host nodes `null`, `zero`, `full`, `random`, `urandom`, `tty`, plus a new `devpts` on `/dev/pts` (bwrap 0.13.1 `SETUP_MOUNT_DEV`). Removal drops those 8 rw rows; the ro host `devtmpfs` from `--ro-bind` becomes the visible `/dev`. | yes |
| `--proc /proc` | 187 | With `--unshare-pid` (the runner always passes it): a new procfs of the sandbox pid namespace, covering the ro host proc. Observed: `/proc/1` comm `bwrap`, 4 pid dirs. Removal drops the rw proc row; host proc shows through (`/proc/1` = `systemd`, 5097 pid dirs). | yes |
| `--tmpfs /tmp` | 188 | Hides host `/tmp`. Empty tmpfs is the visible `/tmp` (0 entries). Host `/tmp` remains underneath as `xfs ro`. Removal drops the rw tmpfs row; host `/tmp` becomes visible (`xfs`, 40860 entries in the bwrap drop). | yes |
| `--tmpfs /run` | 188 | Hides host `/run` (sockets, `/run/user`). Empty tmpfs is the visible `/run` (0 entries). Host `/run` stays underneath ro, including `/run/user/1000`. Removal drops the rw tmpfs row; host `/run` shows (30 entries). | yes |
| `--bind <cwd> <cwd>` | 180, 188 | `cwd = process.cwd()` (not realpath), bound read-write at the same path, after both tmpfs. Path outside `/tmp` and `/run`: already visible read-only via the recursive root bind; this row adds write. Path under `/tmp` or `/run`: punches that one directory through the tmpfs. Live: cwd `/tmp/capcwd49-f4f1rzt2` had mount row `xfs rw`, marker readable, writable. Drop on a `/fast` cwd: row gone, path still readable, `writable_cwd=no`. | yes |
| per-call `--bind <src> <dst>` | 131, 188 | One CLI `--bind <dir>` becomes `bwrap --bind <realpath> <resolve(dir)>`, appended after the cwd bind. Same cover/punch rules. A dst under the `/tmp` tmpfs is absent unless this row exists. A dst already on the recursive root bind stays visible read-only when the row is dropped, and loses write. `--bind /tmp` is allowed and re-exposes all of host `/tmp` read-write (see validation). | yes |
| `--chdir <cwd>` | 188 | No mount. Sets the child cwd to `process.cwd()`. Drop: mountinfo identical (46 rows, no lost/gained). `PWD` fell back to bwrap's inherited cwd (`/home/vgpnk/Projects/shokunin` in that run). | no |
| `--unshare-pid` | 189 | No path of its own. It selects which `--proc` implementation runs (bwrap.c:1389-1398 at tag v0.13.1): fresh procfs if set, else a recursive bind of host `/proc`. Drop on this host added two rw rows at `/proc/sys/fs/binfmt_misc` (`autofs`, `binfmt_misc`) and `/proc/1` became `systemd` (5095 pids). | yes (delta only) |

Same argv, not path-revealing (`bwrap --help` lists them outside filesystem operations; not drop-tested): `--die-with-parent`, `--new-session` (line 189); `--clearenv` / `--setenv` (lines 183-184, spread at 189); `--argv0` (line 190).

## Why `--ro-bind / /` copies every host mount

bubblewrap 0.13.1 `bubblewrap.c:935-937` (`setup_op_bind_mount_fd`): "We always bind directories recursively, otherwise this would let us access files that are otherwise covered on the host", then `bind_mount_fd(..., BIND_RECURSIVE | options)`. `bind-mount.c:458` adds `MS_REC` when that flag is set. Man page (`bwrap(1)` 0.13.1): filesystem options "are applied in the order they are given as arguments" (the S095 quote). Cap-run documents that order at lines 29-30 and builds it at 187-189.

Observed top-of-stack inside an intact `cap-run` child (no extra `--bind`, cwd = the seat dir), `MOUNT_COUNT 44`, exit 0, stderr `CAP_RUN: EXIT code=0 unit=cap-run-3475648-1792784947542-8a903e`:

| mount point | visible fstype | opts | rows at that point |
|---|---|---|---|
| `/` | btrfs | ro | 1 |
| `/dev` | tmpfs (private) over devtmpfs | rw over ro | 2 |
| `/proc` | proc (sandbox) over proc (host) | rw over ro | 2 |
| `/sys` | sysfs | ro (host; nothing covers it) | 1 + submounts |
| `/tmp` | tmpfs over xfs | rw over ro | 2 |
| `/run` | tmpfs over host tmpfs | rw over ro | 2 |
| `<cwd>` | xfs | rw | 1 |

`/sys` is host sysfs, read-only (`/sys/class` existed in the bwrap FULL probe). There is no `--bind` or tmpfs for `/sys`.

## Per-call bind, observed

Command shape: `node <sandbox>/scripts/cap-run.mjs --mem 64 --tasks 16 --budget 20 [--bind ...] -- node -e <print mountinfo>`.

- No `--bind` of `/tmp/caprun49-9eegm_i3`: `MOUNT_COUNT 44`, no row for that path, `TMPFIX_EXISTS false`, `TMPFIX_WRITABLE no ENOENT`. Exit 0, `CAP_RUN: EXIT code=0 unit=cap-run-3478237-1792784947659-189b5f`.
- `--bind /tmp/caprun49-9eegm_i3`: `MOUNT_COUNT 45`, row `/tmp/caprun49-9eegm_i3 xfs rw`, `TMPFIX_EXISTS true`, `TMPFIX_MARKER yes`, `TMPFIX_WRITABLE yes`. Exit 0, unit `cap-run-3476893-1792784947599-bf6e08`.
- `--bind /tmp` (the directory itself): visible top is `/tmp xfs rw` with 3 mountinfo rows; `TMP_ENTRIES 40905`; host dir `/tmp/capvis49-1n8k5dgm` exists. Without that bind: top `/tmp tmpfs rw`, 2 rows, `TMP_ENTRIES 0`, host dir `false`. Exits 0, units `cap-run-1551667-1792785012809-0cfe50` and `cap-run-1548564-1792785012737-0aef2a`.
- Symlink `/tmp/capvis49-link-etc` to `/etc`: validation allows it (realpath `/etc` is not a refused tree; `resolve` stays on `/tmp/...`). Child row: `/tmp/capvis49-link-etc btrfs rw root=/@/etc`. `/tmp/capvis49-link-etc/passwd` exists. Exit 0, unit `cap-run-952968-1792784997114-85af90`. Src and dst differ when the argument is a symlink: src is `realpathSync`, dst is `path.resolve` (line 131).
- bwrap drop of a bind whose path is on `/fast` (already in the recursive root): mount row lost, marker still readable, `writable_out=no`. Drop of a bind under the tmpfs: path `ABSENT`, marker `MISSING`.

Cwd under `/tmp` with no user `--bind` (`cap-run` from `/tmp/capcwd49-f4f1rzt2`): row `/tmp/capcwd49-f4f1rzt2 xfs rw`, `PWD` that path, `CWD_MARKER cwd`, `CWD_WRITABLE yes`. Unit `cap-run-3480687-1792784947773-7234b2`, exit 0. The automatic cwd bind is what makes a `/tmp` work directory visible.

## `--bind` validation refuses

Predicate at lines 127-130, applied to both the realpath and `resolve(v)`:

```javascript
const bad = (p) => p === '/' || /^\/(?:proc|sys|dev|run)(?:\/|$)/.test(p);
if (bad(r) || bad(resolve(v))) usage(`--bind refuses ...`);
```

Refused trees: `/` and anything that is or is under `/proc`, `/sys`, `/dev`, `/run`. Not a prefix match: `/sysroot` would not match the regex. This host has no `/sysroot`, so the live message was the earlier check ("existing absolute directory"), not `refuses`.

Also refused before `bad()` (line 128): not starting with `/`, not an existing directory, or `stat`/`realpath` failure. A symlink whose realpath lands in a refused tree is refused via `bad(r)`.

Live `node scripts/cap-run.mjs --mem 64 --tasks 8 --budget 5 --bind <v> -- true`, all exit 64, reason prefix:

| `<v>` | stderr reason |
|---|---|
| `/`, `/.`, `//` | `--bind refuses "<v>" (root, /proc, /sys, /dev and /run stay as the sandbox mounts them)` |
| `/proc`, `/sys`, `/dev`, `/run` | same `refuses` |
| `/proc/self`, `/sys/fs`, `/dev/shm`, `/run/user` | same `refuses` |
| `/var/run` (symlink, realpath `/run`) | `--bind refuses "/var/run"` |
| `/tmp/../proc` | `--bind refuses "/tmp/../proc"` |
| `/tmp/capvis49-link-proc` to `/proc` | `--bind refuses "/tmp/capvis49-link-proc"` |
| `rel`, `/nonexistent-capvis49`, `/etc/passwd`, `/sysroot` | `--bind wants an existing absolute directory, got "<v>"` |

Not refused (exit 0, child `true` ran): `/tmp` (unit `cap-run-2425952-1792784916526-31cade`), `/etc` (unit `cap-run-2433524-1792784916741-a192bf`), symlink `/tmp/capvis49-link-etc` to `/etc` (unit `cap-run-2436091-1792784916819-4b3934`). `/tmp` is not in the refuse set. Because user binds are appended after `--tmpfs /tmp` (line 188), `--bind /tmp` undoes the mask and shows host `/tmp` read-write. `/run` cannot be undone that way: `--bind /run` is refused, and a realpath of `/var/run` is refused.

## Drop-test receipts (direct bwrap)

`bwrap` 0.13.1 (`/usr/bin/bwrap`, pacman `bubblewrap 0.13.1-1`). Base argv: `--ro-bind / / --dev /dev --proc /proc --tmpfs /tmp --tmpfs /run --bind <cwd> <cwd> --bind <outside> <outside> --bind <tmpfix> <tmpfix> --chdir <cwd> --unshare-pid --die-with-parent`. Each row is that argv with one element removed. Exit 0 unless noted.

| drop | exit | mountinfo vs FULL (46 rows) | path effect |
|---|---|---|---|
| (none) | 0 | 46 rows | cwd/outside/tmpfix markers readable and writable; `/` and `/etc` not writable; `/sys/class` present; `proc_1_comm=bwrap`, `proc_count=4`; `/tmp` entries=1 (the tmpfix hole); `/run` entries=0 |
| `--ro-bind / /` | 1 | no child | stderr `bwrap: execvp sh: No such file or directory` |
| `--dev /dev` | 0 | lost the 8 rw `/dev` rows | host ro devtmpfs remains. Probe counts were poisoned (`ls` redirected at a read-only `/dev/null`: stderr `sh: line 9: /dev/null: Permission denied`). Mount list itself is good. |
| `--proc /proc` | 0 | lost rw proc row | `/proc` entries=5173, `proc_1_comm=systemd` |
| `--tmpfs /tmp` | 0 | lost rw tmpfs `/tmp` | `/tmp` entries=40860; host xfs row remains |
| `--tmpfs /run` | 0 | lost rw tmpfs `/run` | `/run` entries=30 |
| `--bind <cwd>` | 0 | lost the cwd mount row | marker still readable, `writable_cwd=no` |
| `--bind <outside>` | 0 | lost that row | marker still readable, `writable_out=no` |
| `--bind <tmpfix>` | 0 | lost `/tmp/capvis49-...` row | path `ABSENT`, marker `MISSING` |
| `--chdir` | 0 | no row change | `PWD=/home/vgpnk/Projects/shokunin` |
| `--unshare-pid` | 0 | gained 2 rw rows at `/proc/sys/fs/binfmt_misc` | `proc_1_comm=systemd`, `proc_count=5095` |

## What this means for a mountinfo oracle

A mount row's presence is not the same as "the host directory is visible":

- Covered mounts stay listed. `/tmp` has 2 rows even while the visible directory is an empty tmpfs. `/`, `/sys`, `/home`, `/fast`, `/boot`, and the other host mounts from the recursive `--ro-bind` are in every intact child. An allowlist of only `/`, `/proc`, `/dev`, `/tmp`, `/run`, `/sys`, and the cwd (plan limit 2) will see the rest as extra rows.
- A dropped per-call bind is the absence of a row whose mount point is that destination. If the destination is under the `/tmp` or `/run` tmpfs, the path also disappears. If it is anywhere the recursive root bind already shows, the path stays readable and only the rw row and writability go away.
- Dropping `--tmpfs /tmp` does not remove `/tmp` from mountinfo (the host xfs row remains). It makes host `/tmp` contents visible. That is the K6 shape (`CONTROL_VISIBLE`): a content change plus loss of the tmpfs row, not "`/tmp` ceased to be a mount point".
- `--chdir` cannot be scored from mountinfo. `--unshare-pid` can, but only as a change in the `/proc` rows, and only because `--proc` is also present.

## Unknowns

- `--die-with-parent` and `--new-session` were not drop-tested. Classified from `bwrap --help` only.
- The 32 read-only rows are this host's mount table at observation time, not a contract. Another machine replicates a different set.
- No live directory existed whose name is a prefix of a refused tree (`/sysroot`, `/procfs`). The regex is the source; only the absent-path message was observed for `/sysroot`.

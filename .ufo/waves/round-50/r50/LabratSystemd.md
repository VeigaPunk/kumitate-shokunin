# LabratSystemd — systemd-run layer, child mount rights, symlink `--bind`

Axes measured: (1) can a cap-run child `mount`/`unshare` with no `CAP_SYS_ADMIN`; (2) who resolves a symlinked `--bind` source, bwrap or the caller; (3) which of those the `bad()` refusal list cannot see, and whether the mount namespace is what actually stops it.

Read-only on the lane. Probes used `mktemp` workdir `/var/tmp/r50-labrat-TV6C` (removed after this report). No tools installed. Host: bubblewrap 0.13.1 (`/usr/bin/bwrap`, mode `0755`, not setuid), systemd 262, `/tmp` is xfs (`/dev/nvme1n1p1`, rw), `/run` is tmpfs, `kernel.unprivileged_userns_clone=1`.

Host namespaces at probe time: `mnt:[4026531832]` `user:[4026531837]` `net:[4026531833]` `pid:[4026531836]` `cgroup:[4026531835]`.

Lane argv that was actually exec'd (from `ps`, sleep scope below), matching `scripts/cap-run.mjs:187-192`:

```
bwrap --ro-bind / / --dev /dev --proc /proc --tmpfs /tmp --tmpfs /run \
  --bind <cwd> <cwd> --chdir <cwd> --unshare-pid --die-with-parent \
  --new-session --clearenv --setenv PATH /usr/bin --argv0 <cmd> <real> ...
```

No `--unshare-net`, no `--unshare-user` (implied because not root), no `--cap-add`, no `--disable-userns`. `systemd-run` is only `--user --scope` plus `MemoryMax`, `MemorySwapMax`, `TasksMax` (`cap-run.mjs:187-188`). Its environment is `LAUNCH_ENV` = `{PATH:/usr/bin, XDG_RUNTIME_DIR}` (`:102-105`, `:200`). The child is then `--clearenv`'d, so that bus address does not enter the sandbox.

## 1. Child cannot mount, umount, remount, or unshare a mount namespace

Command (cwd `/var/tmp/r50-labrat-TV6C`, host marker `/tmp/r50-hostmarker-TV6C` present):

```
node scripts/cap-run.mjs --mem 256 --tasks 32 --budget 30 -- python3 inner.py
```

`inner.py` called `mount(2)`, `umount2(2)` and `syscall(__NR_unshare)` via ctypes, then the util-linux binaries. Result, `CAP_RUN: EXIT code=0`:

```
CAP CapEff=0x0 CapPrm=0x0 CapBnd=0x0 CapInh=0x0 CapAmb=0x0
CAP SYS_ADMIN eff=False prm=False bnd=False
CAP NoNewPrivs: 1
NS mnt=mnt:[4026533527] user=user:[4026533530] net=net:[4026531833] pid=pid:[4026533529] cgroup=cgroup:[4026531835] ipc=ipc:[4026531839] uts=uts:[4026531838]
ENV keys=LC_CTYPE,PATH,PWD
ENV XDG_RUNTIME_DIR=<unset>  DBUS_SESSION_BUS_ADDRESS=<unset>
TMP before_umount marker_visible=False count=0
MOUNT tmpfs /tmp/r50mnt          rc=-1 errno=1 Operation not permitted
MOUNT bind /usr /tmp/r50bind     rc=-1 errno=1 Operation not permitted
UMOUNT /tmp flags=0 and MNT_DETACH  rc=-1 errno=1 Operation not permitted
UMOUNT /run, /proc               rc=-1 errno=1 Operation not permitted
MOUNT remount / MS_BIND|MS_REMOUNT  rc=-1 errno=1 Operation not permitted
BIN mount -t tmpfs ...           rc=32  must be superuser to use mount
BIN unshare -m true              rc=1   unshare failed: Operation not permitted
BIN unshare --user true          rc=0
BIN unshare --user --mount --map-root-user true   rc=0
UNSHARE child-NEWNS              rc=-1 errno=1 Operation not permitted
UNSHARE child-NEWUSER            rc=0
```

`CapBnd=0` matches bwrap(1): "By default no caps are left in the sandboxed process." `net`, `cgroup`, `ipc` and `uts` are the host's; only `mnt`, `user` and `pid` are new. `--unshare-pid` is why pid is new. Nothing in the argv unshares the network.

Nested user+mount namespace (same run, `unshare --user --mount --map-root-user python3`), which the binary allows:

```
NEST uid 0 euid 0
NEST CapEff: 000001ffffffffff   CapBnd: 000001ffffffffff   NoNewPrivs: 1
NEST ns mnt=mnt:[4026533533] user=user:[4026533517] net=net:[4026531833] pid=pid:[4026533529]
NEST umount /tmp flags=2 rc=-1 errno=22 Invalid argument
NEST umount /tmp flags=0 rc=-1 errno=22 Invalid argument
NEST marker_visible False
NEST write ok
NEST umount /proc flags=2 rc=-1 errno=22 Invalid argument
NEST pid1_comm bwrap
NEST setns_open 13 Permission denied
```

The nested namespace got a full capability set (new user namespaces reset the bounding set) and a new mnt inode, but `umount` of `/tmp` and `/proc` returned `EINVAL`, the host marker stayed hidden, and the `/tmp` write did not create `/tmp/r50-nested-write-TV6C` on the host (`nested_write_on_host=NO`). `pid 1` was still `bwrap`, not host systemd. Opening `/proc/1/ns/mnt` for `setns` returned `EACCES`. `--disable-userns` is absent, so nested user namespaces are not blocked; the parent's mounts stay locked anyway.

Same-process `unshare(CLONE_NEWUSER|CLONE_NEWNS)` after a successful `CLONE_NEWUSER` returned `EPERM`. The successful `unshare --user --mount` above is the separate-process case, and it still could not peel `/tmp`.

## 2. The scope is not a mount namespace

`systemd-run --user --scope` does not unshare mounts. Live tree for `sleep 7` (`cap-run-47473-1792788743127-8ace3c.scope`):

| pid | what | mnt | user | net | CapBnd | NoNewPrivs |
|---|---|---|---|---|---|---|
| 47473 | `node …/cap-run.mjs` | host `4026531832` | host | host | `000001ffffffffff` | 0 |
| 47529 | outer `bwrap` | host `4026531832` | host | host | `000001ffffffffff` | 1 |
| 47560 | inner `bwrap` | `4026533527` | `4026533533` | host | `0` | 1 |
| 47564 | `sleep 7` | `4026533527` | `4026533533` | host | `0` | 1 |

`systemctl --user show` on that scope printed `Delegate=no`, `MemoryMax=67108864`, `TasksMax=8`, `ControlGroup=…/cap-run-47473-….scope`. It did not print `PrivateTmp`, `ProtectSystem`, `ProtectHome`, `PrivateMounts`, or `MountAPIVFS`. The outer bwrap, which is the process the scope wraps, is still in the host mount namespace. The mask exists only in the inner bwrap's namespace. The refusal list runs in the node process, before `systemd-run`, and the scope never sees a mount path.

## 3. Who resolves a symlinked `--bind` source

**Caller, when the command is cap-run.** `parseArgs` does `realpathSync` on the source and `resolve()` (lexical, not `realpath`) on the destination, then `bad()` (`cap-run.mjs:129-133`):

```
p === '/' || p === '/tmp' || /^\/(?:proc|sys|dev|run)(?:\/|$)/
```

`bad` is applied to both. Reproducers, cwd the workdir:

```
node scripts/cap-run.mjs --mem 64 --tasks 8 --budget 10 --bind /tmp -- true
→ CAP_RUN: USAGE --bind refuses "/tmp" (…); exit 64. bwrap not started.

node scripts/cap-run.mjs … --bind /var/tmp/r50-labrat-TV6C/link-tmp -- true
  (symlink → /tmp, realpath /tmp)
→ CAP_RUN: USAGE --bind refuses "…/link-tmp" (…); exit 64. bwrap not started.

node scripts/cap-run.mjs … --bind …/link-real -- python3 -c 'print("opened")'
  (symlink → a real directory, not a refused path)
→ bwrap: Can't mount on symlink destination /var/tmp/r50-labrat-TV6C/link-real
  CAP_RUN: EXIT code=1

node scripts/cap-run.mjs … --bind …/real -- python3 -c 'print(open("…/real/marker").read())'
→ REALMARKER
  CAP_RUN: EXIT code=0
```

So cap-run never hands bwrap a symlink source that realpaths to `/tmp`. A symlink destination that is allowed by `bad()` is not realpathed; bwrap rejects it.

**bwrap itself, when invoked directly.** bwrap 0.13.1 realpaths every bind source before it builds the sandbox, then opens that path under `oldroot` (the host root), not under the new tmpfs. From the fetched tag `v0.13.1` file `bubblewrap.c` (sha256 `de141c805cb88f8faff9af1b3bb49098191fc67833b51b51fea84510ea4426ce`); the installed binary emits the same symlink-destination error string.

- `base_path = "/tmp"` at `bubblewrap.c:3043` (setup tmpfs, distinct from the user's `--tmpfs /tmp`).
- `resolve_symlinks_in_ops` at `:1646-1662`: for `SETUP_BIND_MOUNT` / `SETUP_RO_BIND_MOUNT` / `SETUP_DEV_BIND_MOUNT`, `op->source = realpath(old_source, NULL)`.
- Called at `:3274-3275`, comment "before the chroot", and before `mount(MS_SLAVE)` (`:3280`) and before `mount("tmpfs", base_path, …)` (`:3284`).
- Source is then `openat_in_root("/oldroot", op->source, O_PATH)` (`:1162`). `O_PATH` here follows the already-realpathed host path. Comment at `:935-936`: directory binds are recursive "otherwise this would let us access files that are otherwise covered on the host".
- Destination is `O_NOFOLLOW`; a symlink dest dies at `:1255-1256` with `Can't mount on symlink destination`.

Empirical, host marker inode `66308:4438922`:

```
bwrap --ro-bind / / --dev /dev --proc /proc --tmpfs /tmp --tmpfs /mnt \
  --bind /var/tmp/r50-labrat-TV6C/link-tmp /mnt/x -- \
  stat -c %d:%i /mnt/x/r50-hostmarker-BWRAP
```

`CHILD_BIND=66308:4438922` (same device:inode as the host file). `stat` of `/tmp/r50-hostmarker-BWRAP` inside the same child: `No such file or directory`. The path `/tmp` is the fresh tmpfs; the bind source is the host directory, resolved before that tmpfs existed. The same marker was also visible when `--bind` of the symlink was placed *before* `--tmpfs /tmp`. Putting `--tmpfs` first does not stop it.

A raw `--bind /tmp <symlink-to-/tmp>` (the argv cap-run would emit if it realpathed and did not refuse) failed earlier with `bwrap: Can't mount on symlink destination …` because the destination was the symlink. bwrap does not follow destination symlinks.

## 4. What `bad()` cannot see

**Covered by the namespace, not by the refusal list.** A child `mount`, `umount`, `MS_REMOUNT`, or `unshare(CLONE_NEWNS)` has no `--bind` argument, so `bad()` never runs. Those calls return `EPERM` because the inner bwrap has `CapBnd=0` and `NoNewPrivs=1`. Creating a nested user namespace is allowed and grants a full cap set there, but umount of the covering tmpfs still returns `EINVAL` and does not reveal host `/tmp` or host pid 1. That lock is the namespace's, not the guard's. The systemd scope does not provide it: the outer bwrap remains in the host mnt ns, and the scope only carries memory and task limits.

**Not covered by the refusal list, and the tmpfs does not hold, because cap-run re-binds cwd after the tmpfs.** `cwd` is inserted unconditionally (`cap-run.mjs:182`, `:190`: `--tmpfs /tmp --tmpfs /run --bind cwd cwd`). `bad()` is not applied to it.

cwd `/tmp` (child mnt `4026533523`, not the host):

```
cd /tmp && node scripts/cap-run.mjs --mem 128 --tasks 16 --budget 15 -- \
  python3 -c 'open("/tmp/r50-cwdproof-TV6C","w").write("from-child\n")'
```

Host file appeared, content `from-child`, then was removed. Control, cwd `/var/tmp`: the same write reported `write_ok` and `exists_in_child True` inside the child, and the host file was absent. Child `/tmp` is the tmpfs unless cwd itself is `/tmp`.

cwd `/run/user/1000` re-opens the user bus the clearenv had hidden:

```
cd /run/user/1000 && node scripts/cap-run.mjs --mem 128 --tasks 16 --budget 15 -- python3 …
```

`bus_exists True`, directory listing included `bus` and `systemd`, `XDG_RUNTIME_DIR` still unset. With the child setting `XDG_RUNTIME_DIR=/run/user/1000` and `DBUS_SESSION_BUS_ADDRESS=unix:path=/run/user/1000/bus` itself:

```
busctl --user status
→ BusAddress=unix:path=/run/user/1000/bus BusScope=user BusID=99e37709d7aa0f2feb6cec2875c2525f
  (exit 1 was "Failed to get credentials: Object is remote", not a connect failure)
```

Then the same environment, still inside that cap-run:

```
systemd-run --user --collect --wait --pipe --unit=r50-labrat-TV6C \
  python3 -c 'print(readlink /proc/self/ns/mnt); write it to the workdir'
```

`rc 0`. Stderr: `Running as unit: r50-labrat-TV6C.service` / `Finished with result: success`. Payload mount namespace was `mnt:[4026531832]`, the host's, and the workdir file contained that same inode. The transient unit was `reset-failed` and the file removed. So a cap-run child whose cwd is the user runtime dir can ask the host user manager to run a process outside bwrap, in the host mount namespace. `bad()` would have refused an explicit `--bind /run/user/1000` (the `/run` prefix). It never sees the implicit cwd bind. Normal cwd does not have this hole: `/run` listed empty, `bus_exists=False`, `systemd-run --user` failed with `$DBUS_SESSION_BUS_ADDRESS and $XDG_RUNTIME_DIR not defined`, and a forged path address failed with `No such file or directory`.

**Shared netns is not, by itself, a bus bypass.** `/proc/net/unix` inside the child listed host sockets, including `/run/user/1000/bus` and 217 abstract names, because the netns is shared. The session bus address on this host is `unix:path=/run/user/1000/bus` (pathname, socket mode `srw-rw-rw-`), which the `/run` tmpfs hides. Four abstract names shaped like the user API (`…/bus/systemd/bus-api-user`, two `…/bus/dbus-broker-lau/user`, `…/bus/systemctl/user`) returned `ECONNREFUSED` (errno 111) from a raw `connect("\0"+name)` both on the host and in the sandbox, so they are not listeners. Other abstract names were not connected to.

**Symlink source is the opposite split.** The tmpfs does not cover it: bwrap `realpath`s the source in the host view and bind-mounts that inode from `oldroot`, so `--bind <symlink-to-/tmp> /mnt/x` after `--tmpfs /tmp` still exposes host `/tmp`. The refusal list does cover it, but only because cap-run realpaths before `bad()` and exits 64 without spawning bwrap. A caller that forwarded the symlink path into bwrap unchanged would re-expose host `/tmp`, and argument order would not save it.

## Cleanup

Removed `/var/tmp/r50-labrat-TV6C`, `/tmp/r50-hostmarker-TV6C`, `/tmp/r50-hostmarker-BWRAP`, `/tmp/r50-cwdproof-TV6C`, `/tmp/r50-cwdproof-ctrl-TV6C`, `/tmp/r50-nested-write-TV6C`, `/tmp/r50-scope-out.txt`, and `payload-mnt.txt`. `systemctl --user reset-failed r50-labrat-TV6C.service` was run. No package installs.

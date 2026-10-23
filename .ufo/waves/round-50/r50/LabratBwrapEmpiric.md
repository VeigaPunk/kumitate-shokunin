# LabratBwrapEmpiric — bwrap 0.13.1 mount-order probe

Seat: LabratBwrapEmpiric (scout). Read-only on the lane. No lane files edited except this report. No tools installed.

Axes: (1) mount-order truth — what the child can see and write, (2) namespace proof — `/proc/self/mountinfo` field 5 plus inode identity, (3) cleanup — no leftover host files.

## Host

- `bwrap --version` → `bubblewrap 0.13.1`. `/usr/bin/bwrap` is mode `0755` root:root, not setuid (`getcap` empty). `kernel.unprivileged_userns_clone=1`. Probes ran as uid 1000; inside the sandbox `id -u` was also 1000.
- Host `/tmp` is not a tmpfs. `/proc/self/mountinfo` field 5 = `/tmp`, fstype `xfs`, source `/dev/nvme1n1p1`, opts `rw,nosuid,nodev,noatime`, peer `shared:213`:
  `250 33 259:4 / /tmp rw,nosuid,nodev,noatime shared:213 - xfs /dev/nvme1n1p1 rw,inode64,logbufs=8,logbsize=256k,noquota`
- Several lines can share field 5 `/tmp`. The last line is the visible mount. `stat -f -c %T` and the host inode of a marker file agree with that top line. Do not read an earlier `tmpfs` line as "masked" if an `xfs` line follows it.
- Instrumented runs add `--dev /dev --proc /proc` so `/dev/null`, `findmnt`, and mountinfo work. The assignment's exact `ls /tmp` argv was also run (no `--dev`, no `--proc`). A first pass that redirected `ls` to `/dev/null` without `--dev` is discarded (the redirect failed; the counts were lies). Outcomes below were reproduced on that first pass for (a) and (b) before this canonical paste.

Marker method: write `/tmp/r50lab2-<pid>-hostmark` containing `HOSTMARKER` on the host, record `st_dev:st_ino`, then ask the child. A child write is real only if that pathname exists on the host afterwards with the same inode.

## (a) `--tmpfs /tmp` then `--bind /tmp /tmp` — host /tmp is visible and writable

Command (instrumented):

```
bwrap --ro-bind / / --tmpfs /tmp --bind /tmp /tmp --dev /dev --proc /proc -- /bin/sh -c <probe>
```

Exit 0.

```
MARK_AT_TMP=yes
MARK_INO=66308:4481236          # same as host marker
MARK_TEXT=HOSTMARKER
STATFS_TMP=xfs
WRITE_TMP=ok INO=66308:4481237
```

Host after: `/tmp/r50lab2-3866682-A-childwrite` existed, text `CHILDWRITE`, inode `66308:4481237` (the child's inode).

Mountinfo (field 5 stack, top is visible):

```
721 566 259:4 / /tmp ro,nosuid,nodev,noatime master:213 - xfs /dev/nvme1n1p1 rw,inode64,logbufs=8,logbsize=256k,noquota
722 721 0:91 / /tmp rw,nosuid,nodev,relatime - tmpfs tmpfs rw,mode=755,uid=1000,gid=1000,inode64,huge=advise
723 722 259:4 / /tmp rw,nosuid,nodev,noatime master:213 - xfs /dev/nvme1n1p1 rw,inode64,logbufs=8,logbsize=256k,noquota
FIELD5=/tmp FSTYPE=xfs SRC=/dev/nvme1n1p1 OPTS=rw,nosuid,nodev,noatime
```

Exact assignment argv `bwrap --ro-bind / / --tmpfs /tmp --bind /tmp /tmp ls /tmp` → exit 0, 41631 names, marker basename present. Names not pasted (`/tmp` is the live host directory).

Answer: yes. The later `--bind /tmp /tmp` mounts host xfs back on top of the tmpfs. The child reads and writes the host directory. The tmpfs is still in the stack, covered.

## (b) `--bind /tmp /tmp` then `--tmpfs /tmp` — masked

Command:

```
bwrap --ro-bind / / --bind /tmp /tmp --tmpfs /tmp --dev /dev --proc /proc -- /bin/sh -c <probe>
```

Exit 0.

```
MARK_AT_TMP=no
STATFS_TMP=tmpfs
WRITE_TMP=ok INO=91:2           # tmpfs dev 0:91, not the host xfs inode
```

Host after: `/tmp/r50lab2-3866682-B-childwrite` did not exist.

Mountinfo top:

```
721 566 259:4 / /tmp ro,nosuid,nodev,noatime master:213 - xfs /dev/nvme1n1p1 rw,...
722 721 259:4 / /tmp rw,nosuid,nodev,noatime master:213 - xfs /dev/nvme1n1p1 rw,...
723 722 0:91 / /tmp rw,nosuid,nodev,relatime - tmpfs tmpfs rw,mode=755,uid=1000,gid=1000,inode64,huge=advise
FIELD5=/tmp FSTYPE=tmpfs SRC=tmpfs OPTS=rw,nosuid,nodev,relatime
```

Exact `bwrap --ro-bind / / --bind /tmp /tmp --tmpfs /tmp ls /tmp` → exit 0, 0 names, marker absent.

Answer: yes, masked. The later tmpfs covers the bind. A write inside `/tmp` stays on the tmpfs.

## (c) `--bind /tmp` onto some other path — tmpfs still covers `/tmp`; host `/tmp` shows up at the other path

Literal dest `/mnt/x` cannot be created. `/mnt` is `drwxr-xr-x root:root` and `/mnt/x` does not exist. Both of:

```
bwrap --ro-bind / / --tmpfs /tmp --bind /tmp /mnt/x --proc /proc
bwrap --ro-bind / / --tmpfs /tmp --dir /mnt/x --bind /tmp /mnt/x --proc /proc
```

exit 1 with `bwrap: Can't create file /mnt/x: Read-only file system`. The ro-bind root is not a place bwrap will mkdir. That failure is not evidence of masking.

Same argv with a dest that already exists. `/mnt` (the parent), and a scratch dir `/home/vgpnk/r50lab2-3866682-mntx` created with `mkdir` and removed after.

```
bwrap --ro-bind / / --tmpfs /tmp --bind /tmp /mnt --dev /dev --proc /proc
```

Exit 0.

```
MARK_AT_TMP=no
STATFS_TMP=tmpfs
WRITE_TMP=ok INO=91:2            # /tmp write stayed on tmpfs; host file absent
ALT=/mnt
ALT_MARK=yes INO=66308:4481236 TEXT=HOSTMARKER
ALT_WRITE=ok INO=66308:4481243
STATFS_ALT=xfs
```

Host after: `/tmp/r50lab2-3866682-C-mnt-altwrite` existed, text `ALTWRITE`, inode `66308:4481243`. The write was issued at `/mnt/<name>` and landed in host `/tmp`.

```
FIELD5=/tmp FSTYPE=xfs  OPTS=ro   SRC=/dev/nvme1n1p1     # under the tmpfs
FIELD5=/tmp FSTYPE=tmpfs OPTS=rw  SRC=tmpfs             # visible /tmp
FIELD5=/mnt FSTYPE=xfs  OPTS=rw   SRC=/dev/nvme1n1p1    # host /tmp, mounted elsewhere
723 566 259:4 / /mnt rw,nosuid,nodev,noatime master:213 - xfs /dev/nvme1n1p1 rw,inode64,logbufs=8,logbsize=256k,noquota
```

The scratch dest behaved the same way (`ALT_MARK` inode `66308:4481236`, alt-write inode `66308:4481244` appeared in host `/tmp`, `STATFS_TMP=tmpfs`).

Order does not save `/tmp` when the other dest is different. `--bind /tmp <scratch>` *before* `--tmpfs /tmp` still left `/tmp` as tmpfs (marker absent there) and still exposed host `/tmp` at the scratch path (same marker inode, alt-write inode `66308:4481246` on the host). The tmpfs only covers the dest `/tmp`. It does not cover a second mount whose source was host `/tmp`.

Answer: the tmpfs still covers sandbox `/tmp`. Host `/tmp` is nevertheless visible and writable at the other dest. `--bind` opens the host path, not "whatever `/tmp` currently is inside the sandbox" — the marker inode survived a tmpfs that had already been mounted on `/tmp`.

## Extra — subdirectory bind (not one of the three asked cases)

Cap-run's own selftest binds `mkdtempSync(join(tmpdir(), 'cap-run-bind.'))` (`scripts/cap-run.mjs:354-357`), a directory under host `/tmp`, after the tmpfs. One raw check of that shape:

```
bwrap --ro-bind / / --dev /dev --proc /proc --tmpfs /tmp \
  --bind /tmp/r50lab3-3866682-sub /tmp/r50lab3-3866682-sub
```

Exit 0. `STATFS_TMP=tmpfs`, host marker at `/tmp/<prefix>-hostmark` not visible, a write to `/tmp/<prefix>-tmpwrite` did not land on the host (inode `121:3`). The subdir itself was host xfs: marker inode `66308:110480084` matched, `childwrite` landed on the host, mountinfo:

```
FIELD5=/tmp                         FSTYPE=tmpfs OPTS=rw
FIELD5=/tmp/r50lab3-3866682-sub     FSTYPE=xfs   OPTS=rw  ROOT=/r50lab3-3866682-sub
804 803 259:4 /r50lab3-3866682-sub /tmp/r50lab3-3866682-sub rw,nosuid,nodev,noatime master:213 - xfs /dev/nvme1n1p1 rw,...
```

bwrap created the missing dest on the rw tmpfs and bound only that subdirectory (`ROOT=` is the subdir, not `/`). The `/tmp` mount stayed masked. This is the hole cap-run intentionally keeps; it is not a re-expose of all of host `/tmp`.

## What this says about cap-run's argv

Observed, not executed: `scripts/cap-run.mjs:189-190` emits `--tmpfs /tmp` and then each user `--bind src dst`. A user `--bind /tmp` is case (a). The CLI takes one path and binds it onto itself (`:124-133`, `o.bind.push([r, resolve(v)])`); it does not have a separate dest, so case (c)'s retarget is not a current cap-run call. `bad()` at `:131` refuses `p === '/tmp'` (and `/`, and `/proc|/sys|/dev|/run` prefixes). That refusal is the case-(a) shape. This seat did not run `cap-run.mjs`.

## Cleanup

Removed the host marker, every child write that landed in host `/tmp`, and the scratch dir. Final `LEFTOVER []` for prefixes `r50lab-`, `r50lab2-`, `r50lab3-`. Nothing was created under the lane checkout. `/mnt` was only mount-covered inside the namespace; the host directory was not modified.

## Inference vs fact

- Fact: on this host's bwrap 0.13.1, later mount on the same dest wins. `--bind /tmp /tmp` after `--tmpfs /tmp` re-exposes host `/tmp` read-write (shared peer `master:213` of the host xfs). The reverse order hides it.
- Fact: `--bind /tmp <existing-other>` exposes host `/tmp` at that other path whether it is placed before or after `--tmpfs /tmp`, and sandbox `/tmp` stays tmpfs.
- Fact: a bind of a subdirectory of host `/tmp` onto that same path exposes only that subdirectory.
- [INFERENCE] systemd-run wrapping (cap-run's outer scope) does not reorder bwrap mounts. Not measured inside `systemd-run`.
- Not tested here: symlink or lexical aliases (`//tmp`, `/tmp/.`, `/tmp/../tmp`, trailing slash). Those are path-string questions for the guard, not mount-order questions.

Confidence: high on (a), (b), and the existing-dest reading of (c). The literal string `/mnt/x` is a setup error (exit 1), not a negative result.

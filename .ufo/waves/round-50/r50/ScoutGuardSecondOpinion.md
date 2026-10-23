# ScoutGuardSecondOpinion — raw bwrap `/tmp` re-exposure

Seat: second opinion on the exposure claim. Commands are raw `bwrap`, not `scripts/cap-run.mjs`. Host bubblewrap 0.13.1 (`/usr/bin/bwrap`), node v24.21.0. No tools installed.

Axes kept: discrimination (with bind vs without), command fidelity (assignment argv plus a unique-name arm), cleanup (no host residue). No path-mangling matrix (that is SentTmpPath).

## Verdict

**Exposure holds.** On this host, `bwrap --ro-bind / / --dev /dev --proc /proc --tmpfs /tmp --bind /tmp /tmp` lets the child create a file on the host's `/tmp`. The same argv without `--bind /tmp /tmp` still lets the child write and read `/tmp/...` inside the sandbox (exit 0), and that file is not on the host afterward. The later `--bind` is what punches through the tmpfs mask.

Confidence: high for this host and this argv. Not a test of cap-run's parser.

## Literal assignment command

`$$` sits inside the single-quoted `node -e` string, so the filename is the two characters `$` `$`, not the shell pid. Path: `/tmp/r50raw-$$`.

Case A — with the bind (exit 0). Host file appeared, content `x`, mode 644, owner `vgpnk`, `dev=66308` `ino=4584323` `size=1`:

```
bwrap --ro-bind / / --dev /dev --proc /proc --tmpfs /tmp --bind /tmp /tmp -- node -e 'require("fs").writeFileSync("/tmp/r50raw-$$","x")'
```

```
LIT_A_EXIT=0
LIT_HOST_FILE_PRESENT
-rw-r--r-- 1 vgpnk vgpnk 1 Oct 23 17:45 /tmp/r50raw-$$
LIT_CONTENT=x
LIT_STAT dev=66308 ino=4584323 size=1
```

Case B — same argv, the `--bind /tmp /tmp` pair removed (exit 0). `writeFileSync` throws on failure, so exit 0 means the child write succeeded; the host path was absent:

```
bwrap --ro-bind / / --dev /dev --proc /proc --tmpfs /tmp -- node -e 'require("fs").writeFileSync("/tmp/r50raw-$$","x")'
```

```
LIT_B_EXIT=0
LIT_B_HOST_FILE_ABSENT
LIT_CLEANUP_OK
```

`rm -f '/tmp/r50raw-$$'` after A (before B) and again after B. `ls -d /tmp/r50raw-*` → `NO_r50raw_RESIDUE`.

## Unique-name arm (same argv shape, mountinfo)

Marker `r50raw-76918-1792788313809338140`. Child writes `process.argv[1]`, read-back `x`, and prints `/proc/self/mountinfo` rows whose field 5 (mount point) is `/tmp`.

Case A (`--tmpfs /tmp` then `--bind /tmp /tmp`), exit 0. Three stacked mounts at `/tmp`; the last one is the visible mount:

```
777 722 259:4 / /tmp ro,nosuid,nodev,noatime master:213 - xfs /dev/nvme1n1p1 rw,inode64,logbufs=8,logbsize=256k,noquota
789 777 0:116 / /tmp rw,nosuid,nodev,relatime - tmpfs tmpfs rw,mode=755,uid=1000,gid=1000,inode64,huge=advise
790 789 259:4 / /tmp rw,nosuid,nodev,noatime master:213 - xfs /dev/nvme1n1p1 rw,inode64,logbufs=8,logbsize=256k,noquota
```

Host afterward: file present, content `x`, `dev=66308` `ino=4707230` `mode=644` `size=1`.

Case B (no `--bind /tmp /tmp`), exit 0. Child printed `CHILD_WROTE` and `CHILD_READBACK x`. Stack stops on the tmpfs:

```
798 566 259:4 / /tmp ro,nosuid,nodev,noatime master:213 - xfs /dev/nvme1n1p1 rw,inode64,logbufs=8,logbsize=256k,noquota
810 798 0:116 / /tmp rw,nosuid,nodev,relatime - tmpfs tmpfs rw,mode=755,uid=1000,gid=1000,inode64,huge=advise
```

Host afterward: `HOST_FILE_ABSENT`. Both paths removed. Residue scan: `NO_RESIDUE`.

## Host anchor

This process's `/proc/self/mountinfo` (field 5 = `/tmp`):

```
250 33 259:4 / /tmp rw,nosuid,nodev,noatime shared:213 - xfs /dev/nvme1n1p1 rw,inode64,logbufs=8,logbsize=256k,noquota
```

`stat -c 'dev=%d mode=%a' /tmp` → `dev=66308 mode=1777`. `66308 = 259<<8 | 4`, the same device as the case-A file and as the top mount in the with-bind child (`259:4` xfs, `master:213` matching the host's `shared:213`). The with-bind top mount is not the tmpfs (`0:116`).

## What this does and does not show

- Shows: argument order is the mask. `--tmpfs /tmp` hides host `/tmp` for the child; a later `--bind /tmp /tmp` mounts that same host filesystem back, writable, and a child `writeFileSync` is a normal user file on host `/tmp` (mode 644 under sticky 1777). Dropping the bind leaves the write on the tmpfs; it dies with the mount namespace.
- Shows why a cap-run refusal of a bind whose resolved path is exactly `/tmp` matches the raw word: cap-run's documented bwrap prefix is `--ro-bind / / --dev /dev --proc /proc --tmpfs /tmp --tmpfs /run` and then caller `--bind` pairs (`scripts/cap-run.mjs` header near the systemd-run line; argv built ~line 189). A forwarded `--bind /tmp /tmp` is this experiment.
- Does not show a privilege boundary past the invoking user. The user can already create `/tmp/r50raw-$$`. The break is the sandbox contract (fresh tmpfs), not uid 0.
- Does not show cap-run's current parser. Raw bwrap only. At read time, committed `378b6e732a1a40ae8adfcaaa5de352cee5163cf0` (`round-50: freeze guard and closure corrections`, 2026-10-23 17:44:27 -0300) already has `p === '/tmp'` in `bad()` at `scripts/cap-run.mjs:131-132`, and `git status --porcelain -- scripts/cap-run.mjs` was empty. That commit is not evidence from this run; the exposure above is what that predicate is refusing.
- Not tested here: `//tmp`, `/tmp/.`, `/tmp/../tmp`, trailing slash, symlink sources, subdir binds, `--bind` before `--tmpfs`.

## Cleanup

Host files removed: `/tmp/r50raw-$$`, `/tmp/r50raw-76918-1792788313809338140-with`. The without-bind names never appeared on the host. No `/tmp/r50raw-*` left.

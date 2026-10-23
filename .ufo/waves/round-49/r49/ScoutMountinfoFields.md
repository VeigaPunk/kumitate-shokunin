# ScoutMountinfoFields — C1 mountinfo field recon

Seat: `kumitate-r49-w1-ScoutMountinfoFields`. Read-only on the lane. Sandbox clone `/fast/scratch/hyaku/kumitate-r49/seats/ScoutMountinfoFields/lane` at `8237be86e2dc04e90e51b66b62bdffe770196d27` (`git rev-parse HEAD` printed that). `scripts/cap-run.mjs` sha256 `d8acc6debd101b0a76ec486e49245ee10aff6e8bb841834d9c4d03c5285d5758`. No packages installed (pacman paused; nothing else needed). Node `v24.21.0`. Host kernel `7.2.11-arch1-1`. `bwrap --version` → `bubblewrap 0.13.1`.

Plan C1 (`plan.md` lines 26–78) says the instrument reads `/proc/self/mountinfo` inside a `scripts/cap-run.mjs` child and compares mount points with requested binds. Limit (2) names a fixed base allowlist: `/`, `/proc`, `/dev`, `/tmp`, `/run`, `/sys`, and the cwd.

## Verdict

`MOUNTINFO_FIELDS: field5=mountpoint split_index=4 escape_space=\040 escape_backslash=\134 base_lines=44 base_unique=38 allowlist_exact=no`

Field 5 (1-based; `split(" ")[4]`) is the mount point, matching `proc_pid_mountinfo(5)` man-pages 6.19 (2026-02-08). A requested `--bind` of an absolute directory appears as that path in field 5. A space in the path is the four bytes `5c 30 34 30` (`\040`), not a raw space. A backslash is `\134`. The plan allowlist is **not** the set this child lists.

## Man page (field identity)

`man proc_pid_mountinfo` exit 0. The rendered page’s diagram is:

```
36 35 98:0 /mnt1 /mnt2 rw,noatime master:1 - ext3 /dev/root rw,errors=continue
(1)(2)(3)   (4)   (5)      (6)      (7)   (8) (9)   (10)         (11)
```

(5) is “mount point: the pathname of the mount point relative to the process's root directory.” (4) is “root: the pathname of the directory in the filesystem which forms the root of this mount.” (7) is zero or more optional `tag[:value]` fields; (8) is a single hyphen. Named optional tags: `shared`, `master`, `propagate_from`, `unbindable`. The rendered page does **not** mention octal escapes. Escape behavior below is from this host, not from that page.

## Commands and exits

cwd for every run: the sandbox clone. Child stdout is the runner’s stdout; the verdict is on stderr.

Assigned field-5 command. `D=/tmp/smf.DUny` (`mktemp -d /tmp/smf.XXXX`), `mkdir -p $D/b1`.

```
node scripts/cap-run.mjs --mem 256 --tasks 16 --budget 20 --bind $D/b1 -- node -e 'const l=require("fs").readFileSync("/proc/self/mountinfo","utf8").split("\n");for(const x of l)console.log(x.split(" ")[4])'
```

exit **0**. stderr exactly: `CAP_RUN: EXIT code=0 unit=cap-run-2573107-1792784796797-9a0e3e`. stdout (46 lines; `cat -A` showed a `$` terminator on each, so the file is newline-terminated and the last `split("\n")` element is empty):

```
/
/dev
/dev/pts
/dev/shm
/dev/mqueue
/dev/hugepages
/proc
/proc/sys/fs/binfmt_misc
/proc/sys/fs/binfmt_misc
/sys
/sys/firmware/efi/efivars
/sys/kernel/security
/sys/fs/cgroup
/sys/fs/pstore
/sys/fs/bpf
/sys/kernel/debug
/sys/kernel/tracing
/sys/fs/fuse/connections
/sys/kernel/config
/run
/run/credentials/systemd-journald.service
/run/credentials/systemd-resolved.service
/run/credentials/systemd-networkd.service
/run/user/1000
/run/user/1000/gvfs
/run/user/1000/doc
/home
/var/cache/pacman/pkg
/var/log
/boot
/fast
/tmp
/dev
/dev/null
/dev/zero
/dev/full
/dev/random
/dev/urandom
/dev/tty
/dev/pts
/proc
/tmp
/run
/fast/scratch/hyaku/kumitate-r49/seats/ScoutMountinfoFields/lane
/tmp/smf.DUny/b1
undefined
```

`undefined` is Node printing the 0-based index 4 of an empty string. It is not a mount point. A parser must drop empty lines before indexing.

Same runner, child writes the raw file. exit **0**. stderr `CAP_RUN: EXIT code=0 unit=cap-run-2576880-1792784796880-69abbf`. `wc -c` → **5845**. 45 newline-terminated records. The requested-bind record (last line), exact bytes:

```
1171 1168 259:4 /smf.DUny/b1 /tmp/smf.DUny/b1 rw,nosuid,nodev,noatime master:213 - xfs /dev/nvme1n1p1 rw,inode64,logbufs=8,logbsize=256k,noquota
```

Space path. Host directory name is `has space` (`os.listdir` repr `'has space'`). Command: `--bind "$D/has space"` with the same caps, child writes the raw file. exit **0**. stderr `CAP_RUN: EXIT code=0 unit=cap-run-2580831-1792784796963-9d4edf`. The bind record:

```
1171 1168 259:4 /smf.DUny/has\040space /tmp/smf.DUny/has\040space rw,nosuid,nodev,noatime master:213 - xfs /dev/nvme1n1p1 rw,inode64,logbufs=8,logbsize=256k,noquota
```

Hex of the `has` token: `6861735c3034307370616365` = `has` + `5c 30 34 30` + `space`. After split-on-0x20, 1-based field 5 contains the four characters backslash, `0`, `4`, `0`, not U+0020. Unescaping octal `\ooo` yields `/tmp/smf.DUny/has space`, which equals the host path. Comparing the raw field to the host path without unescaping fails. Unescape **after** the split; unescaping first turns `\040` into a space and the field breaks.

Backslash path (extra probe, same caps). Host name repr `'has\\slash'`. exit **0**. stderr `CAP_RUN: EXIT code=0 unit=cap-run-304115-1792784846229-e44ed2`. Record:

```
929 926 259:4 /smf.DUny/has\134slash /tmp/smf.DUny/has\134slash rw,nosuid,nodev,noatime master:213 - xfs /dev/nvme1n1p1 rw,inode64,logbufs=8,logbsize=256k,noquota
```

Hex contains `5c 31 33 34` (`\134`). Tab (`\011`) and newline (`\012`) were not created. Not claimed.

No-bind baseline (same caps, no `--bind`), child counted field-5. exit **0**. stderr `CAP_RUN: EXIT code=0 unit=cap-run-302032-1792784846160-31be3e`. `NLINES 44`. 38 unique field-5 strings. Counts of 2: `/dev`, `/dev/pts`, `/proc`, `/proc/sys/fs/binfmt_misc`, `/run`, `/tmp`. Count of 1: `/`, `/dev/shm`, `/dev/mqueue`, `/dev/hugepages`, `/sys`, `/sys/firmware/efi/efivars`, `/sys/kernel/security`, `/sys/fs/cgroup`, `/sys/fs/pstore`, `/sys/fs/bpf`, `/sys/kernel/debug`, `/sys/kernel/tracing`, `/sys/fs/fuse/connections`, `/sys/kernel/config`, `/run/credentials/systemd-journald.service`, `/run/credentials/systemd-resolved.service`, `/run/credentials/systemd-networkd.service`, `/run/user/1000`, `/run/user/1000/gvfs`, `/run/user/1000/doc`, `/home`, `/var/cache/pacman/pkg`, `/var/log`, `/boot`, `/fast`, `/dev/null`, `/dev/zero`, `/dev/full`, `/dev/random`, `/dev/urandom`, `/dev/tty`, and the cwd `/fast/scratch/hyaku/kumitate-r49/seats/ScoutMountinfoFields/lane`. Adding `--bind $D/b1` adds exactly `/tmp/smf.DUny/b1` (one line) plus the `undefined` artifact of the naive split.

## Field table a parser can rely on

Split each non-empty line on U+0020 only. Do not split on other whitespace. Optional fields make every index past field 6 unstable. Mount IDs and fresh tmpfs `major:minor` changed between runs minutes apart (bind line was `1171 1168 259:4` in one run and `929 926 259:4` in another; sandbox `/dev` was `0:240` then `0:168`). Do not hardcode them.

| 1-based | split index | name | rule on this host |
|---|---|---|---|
| 1 | 0 | mount ID | decimal; not stable across runs |
| 2 | 1 | parent ID | decimal; parent is the mount covering the parent path (man page) |
| 3 | 2 | major:minor | one token, contains `:`, never a space |
| 4 | 3 | root | path inside the filesystem, octal-escaped. For the bind it was `/smf.DUny/b1`, not `/tmp/smf.DUny/b1`. Comparing field 4 to the requested absolute path misses. |
| 5 | 4 | mount point | path relative to the process root, octal-escaped. This is the field that equals the `--bind` destination. |
| 6 | 5 | mount options | comma-separated; no raw space observed (`rw,nosuid,nodev,noatime` on the bind) |
| 7..k | 6 .. indexOf("-")-1 | optional | zero or more. This host showed only `master:<id>`, or none. Man page also allows `shared`, `propagate_from`, `unbindable`. Ignore unrecognized tags. |
| k+1 | indexOf("-") | separator | the token `-` exactly |
| k+2 | +1 | fstype | e.g. `xfs`, `tmpfs`, `btrfs`, `fuse.gvfsd-fuse` |
| k+3 | +2 | source | e.g. `/dev/nvme1n1p1`, `tmpfs`, or `none` |
| k+4 | +3 | super options | one token in every observed line (commas, no raw space). Not a fixed left index. |

Worked split of the bind line (11 tokens, one optional field):

| 1 | 2 | 3 | 4 root | 5 mount point | 6 | 7 | 8 | 9 | 10 | 11 |
|---|---|---|---|---|---|---|---|---|---|---|
| 1171 | 1168 | 259:4 | `/smf.DUny/b1` | `/tmp/smf.DUny/b1` | `rw,nosuid,nodev,noatime` | `master:213` | `-` | `xfs` | `/dev/nvme1n1p1` | `rw,inode64,logbufs=8,logbsize=256k,noquota` |

Lines with no optional field (the sandbox’s own `/dev`, `/dev/pts`, `/proc`, `/tmp`, `/run`) put `-` at 1-based field 7. Example from the same file:

```
1150 1116 0:240 / /dev rw,nosuid,nodev,relatime - tmpfs tmpfs rw,mode=755,uid=1000,gid=1000,inode64,huge=advise
```

Field 5 is still `/dev`. A parser that assumes “fstype is always field 9” mis-reads these lines.

Escape rule that matched both probes: after the space-split, replace a backslash plus three octal digits with that byte. Observed alphabet: space=`\040`, backslash=`\134`. Unescape only the path fields you compare (4 and 5). Equality against a real directory path is on the unescaped string.

## What the records are (base mounts)

`scripts/cap-run.mjs:187-188` at this rev builds:

```
bwrap --ro-bind / / --dev /dev --proc /proc --tmpfs /tmp --tmpfs /run --bind <cwd> <cwd> [--bind src dst ...] --chdir <cwd> ...
```

Observed inside the child, the file is two layers.

**Layer A — read-only import of the host mount table.** Every host mount shows up `ro` with a `master:<id>` tag, parented under the `/` line (`btrfs`, root field `/@`, source `/dev/mapper/root`). [INFERENCE] bubblewrap 0.13.1 `--ro-bind` is recursive: `--help` has no non-recursive bind flag, and the child’s mountinfo contains the host’s `/sys`, `/home`, `/boot`, `/fast`, `/var/log`, `/var/cache/pacman/pkg`, `/run/user/1000`, and the host `/tmp` xfs. This set is the host’s live table, not a constant. Mount IDs and `/proc/sys/fs/binfmt_misc`’s `pipe_ino=35848` are host-volatile.

**Layer B — mounts cap-run adds on top** (later lines; several have no optional field):

| mount point | from | options observed | notes |
|---|---|---|---|
| `/` | `--ro-bind / /` | `ro`, `master:1` | also the root of layer A |
| `/dev` | `--dev /dev` | `rw`, no optional | second `/dev`; tmpfs |
| `/dev/null` `/dev/zero` `/dev/full` `/dev/random` `/dev/urandom` `/dev/tty` | `--dev` | `rw`, `master:2` | root field is `/null`, `/zero`, … not `/` |
| `/dev/pts` | `--dev` | `rw`, no optional | second `/dev/pts` |
| `/proc` | `--proc /proc` | `rw`, no optional | second `/proc` |
| `/tmp` | `--tmpfs /tmp` | `rw`, no optional | second `/tmp`; covers the host xfs `/tmp` |
| `/run` | `--tmpfs /run` | `rw`, no optional | second `/run` |
| cwd | `--bind cwd cwd` | `rw`, `master:207` | root field is the path within `/fast` (`/scratch/hyaku/...`); mount point is the absolute cwd |
| requested bind | `--bind` | `rw`, `master:213` | parent id is the tmpfs `/tmp` line, not the host xfs `/tmp` line. root field is the path within host `/tmp` (`/smf.DUny/b1`); field 5 is the absolute path |

There is no fresh `/sys`. `/sys` and its children are the imported host sysfs, still `ro`, and `stat` inside the child returned a `st_dev` matching those lines (`new_encode_dev`).

Stacked mounts stay listed. A later visibility probe (`stat` plus `st_dev` vs glibc `new_encode_dev`, exit 0, unit `cap-run-1307733-1792784882245-58b50b`) separated “listed” from “the mount you see”:

- Covered, same field-5 listed twice, `stat` device matches the second line: `/dev`, `/dev/pts`, `/proc`, `/run`, `/tmp`.
- Listed but `stat` returned `ENOENT` (ancestor covered by the new tmpfs, child path not in it): `/dev/mqueue`, `/dev/hugepages`, `/run/credentials/systemd-journald.service`, `/run/credentials/systemd-resolved.service`, `/run/credentials/systemd-networkd.service`, `/run/user/1000`, `/run/user/1000/gvfs`, `/run/user/1000/doc`.
- `/dev/shm`: one line (host). `stat` succeeded but `st_dev` was the sandbox `/dev` tmpfs, not that line’s device. The host shm mount is not what the path resolves to.
- `/proc/sys/fs/binfmt_misc`: two host lines; `stat` `st_dev` was the sandbox `/proc`, not either line.
- Reachable and the only line, `st_dev` matched: `/sys` and the nine `/sys/*` children, `/boot` (vfat `259:1`), `/fast` (xfs `259:5`), the cwd bind (same xfs device as `/fast` — device id does not distinguish the cwd bind from `/fast`; the mount-point string does), and `/tmp/smf.DUny/b1` (`259:4` encodes to `st_dev` 66308, the host `/tmp` xfs, not the tmpfs `/tmp`). The bind is the filesystem visible at that path, and it is `rw`.
- `/home`, `/var/log`, `/var/cache/pacman/pkg`: `stat` succeeded (reachable) but `st_dev` did not equal `new_encode_dev(0:30)` while mountinfo says `0:30`. `/` itself was mountinfo `0:30` and `stat("/")` dev `32`. [INFERENCE] btrfs subvolume anonymous devices, not a covered mount. Not classified as hidden. Not fully explained.

## Consequence for the plan allowlist

Limit (2)’s allowlist (`/`, `/proc`, `/dev`, `/tmp`, `/run`, `/sys`, cwd) is a subset of the field-5 set, not the set. On this host a set-difference against only those paths also sees, with no extra `--bind`: `/dev/pts`, `/dev/shm`, `/dev/mqueue`, `/dev/hugepages`, `/dev/null`, `/dev/zero`, `/dev/full`, `/dev/random`, `/dev/urandom`, `/dev/tty`, `/proc/sys/fs/binfmt_misc`, every `/sys/*` child, the three `/run/credentials/*`, `/run/user/1000` and its two children, `/home`, `/var/cache/pacman/pkg`, `/var/log`, `/boot`, `/fast`. Duplicate lines collapse in a set; they are still two records. The cwd path is run-specific. The host-import portion will differ on another machine or after a host mount change.

## Full mountinfo of the bind run (5845 bytes)

```
1115 559 0:30 /@ / ro,nosuid,nodev,noatime master:1 - btrfs /dev/mapper/root rw,compress=zstd:3,ssd,discard=async,space_cache=v2,subvolid=256,subvol=/@
1116 1115 0:7 / /dev ro,nosuid,nodev,relatime master:2 - devtmpfs dev rw,size=15668300k,nr_inodes=3917075,mode=755,inode64,huge=advise
1117 1116 0:29 / /dev/pts ro,nosuid,nodev,noexec,relatime master:3 - devpts devpts rw,gid=5,mode=620,ptmxmode=000
1118 1116 0:33 / /dev/shm ro,nosuid,nodev master:4 - tmpfs tmpfs rw,size=8388608k,inode64,huge=advise,usrquota
1119 1116 0:22 / /dev/mqueue ro,nosuid,nodev,noexec,relatime master:18 - mqueue mqueue rw
1120 1116 0:42 / /dev/hugepages ro,nosuid,nodev,relatime master:20 - hugetlbfs hugetlbfs rw,pagesize=2M
1121 1115 0:24 / /proc ro,nosuid,nodev,noexec,relatime master:5 - proc proc rw
1122 1121 0:38 / /proc/sys/fs/binfmt_misc ro,nosuid,nodev,relatime master:13 - autofs systemd-1 rw,fd=43,pgrp=0,timeout=0,minproto=5,maxproto=5,direct,pipe_ino=35848
1123 1122 0:74 / /proc/sys/fs/binfmt_misc ro,nosuid,nodev,noexec,relatime master:416 - binfmt_misc binfmt_misc rw
1124 1115 0:25 / /sys ro,nosuid,nodev,noexec,relatime master:6 - sysfs sys rw
1125 1124 0:27 / /sys/firmware/efi/efivars ro,nosuid,nodev,noexec,relatime master:7 - efivarfs efivarfs rw
1126 1124 0:8 / /sys/kernel/security ro,nosuid,nodev,noexec,relatime master:8 - securityfs securityfs rw
1127 1124 0:34 / /sys/fs/cgroup ro,nosuid,nodev,noexec,relatime master:9 - cgroup2 cgroup2 rw,nsdelegate,memory_recursiveprot,memory_hugetlb_accounting
1128 1124 0:35 / /sys/fs/pstore ro,nosuid,nodev,noexec,relatime master:10 - pstore none rw
1129 1124 0:36 / /sys/fs/bpf ro,nosuid,nodev,noexec,relatime master:11 - bpf bpf rw,mode=700
1130 1124 0:9 / /sys/kernel/debug ro,nosuid,nodev,noexec,relatime master:16 - debugfs debugfs rw
1131 1124 0:14 / /sys/kernel/tracing ro,nosuid,nodev,noexec,relatime master:17 - tracefs tracefs rw
1132 1124 0:41 / /sys/fs/fuse/connections ro,nosuid,nodev,noexec,relatime master:19 - fusectl fusectl rw
1133 1124 0:20 / /sys/kernel/config ro,nosuid,nodev,noexec,relatime master:21 - configfs configfs rw
1137 1115 0:26 / /run ro,nosuid,nodev,relatime master:12 - tmpfs run rw,mode=755,inode64,huge=advise
1138 1137 0:39 / /run/credentials/systemd-journald.service ro,nosuid,nodev,noexec,relatime,nosymfollow master:14 - tmpfs none ro,size=1024k,nr_inodes=1024,mode=700,inode64,huge=advise,noswap
1139 1137 0:45 / /run/credentials/systemd-resolved.service ro,nosuid,nodev,noexec,relatime,nosymfollow master:50 - tmpfs none ro,size=1024k,nr_inodes=1024,mode=700,inode64,huge=advise,noswap
1140 1137 0:52 / /run/credentials/systemd-networkd.service ro,nosuid,nodev,noexec,relatime,nosymfollow master:150 - tmpfs none ro,size=1024k,nr_inodes=1024,mode=700,inode64,huge=advise,noswap
1141 1137 0:72 / /run/user/1000 ro,nosuid,nodev,relatime master:415 - tmpfs tmpfs rw,size=3172180k,nr_inodes=793045,mode=700,uid=1000,gid=1000,inode64,huge=advise
1142 1141 0:80 / /run/user/1000/gvfs ro,nosuid,nodev,relatime master:572 - fuse.gvfsd-fuse gvfsd-fuse rw,user_id=1000,group_id=1000
1143 1141 0:85 / /run/user/1000/doc ro,nosuid,nodev,relatime master:634 - fuse.portal portal rw,user_id=1000,group_id=1000
1144 1115 0:30 /@home /home ro,nosuid,nodev,noatime master:183 - btrfs /dev/mapper/root rw,compress=zstd:3,ssd,discard=async,space_cache=v2,subvolid=257,subvol=/@home
1145 1115 0:30 /@pkg /var/cache/pacman/pkg ro,nosuid,nodev,noatime master:189 - btrfs /dev/mapper/root rw,compress=zstd:3,ssd,discard=async,space_cache=v2,subvolid=259,subvol=/@pkg
1146 1115 0:30 /@log /var/log ro,nosuid,nodev,noatime master:195 - btrfs /dev/mapper/root rw,compress=zstd:3,ssd,discard=async,space_cache=v2,subvolid=258,subvol=/@log
1147 1115 259:1 / /boot ro,nosuid,nodev,relatime master:201 - vfat /dev/nvme0n1p1 rw,fmask=0077,dmask=0077,codepage=437,iocharset=ascii,shortname=mixed,utf8,errors=remount-ro
1148 1115 259:5 / /fast ro,nosuid,nodev,noatime master:207 - xfs /dev/nvme1n1p2 rw,inode64,logbufs=8,logbsize=256k,noquota
1149 1115 259:4 / /tmp ro,nosuid,nodev,noatime master:213 - xfs /dev/nvme1n1p1 rw,inode64,logbufs=8,logbsize=256k,noquota
1150 1116 0:240 / /dev rw,nosuid,nodev,relatime - tmpfs tmpfs rw,mode=755,uid=1000,gid=1000,inode64,huge=advise
1151 1150 0:7 /null /dev/null rw,nosuid,relatime master:2 - devtmpfs dev rw,size=15668300k,nr_inodes=3917075,mode=755,inode64,huge=advise
1152 1150 0:7 /zero /dev/zero rw,nosuid,relatime master:2 - devtmpfs dev rw,size=15668300k,nr_inodes=3917075,mode=755,inode64,huge=advise
1155 1150 0:7 /full /dev/full rw,nosuid,relatime master:2 - devtmpfs dev rw,size=15668300k,nr_inodes=3917075,mode=755,inode64,huge=advise
1163 1150 0:7 /random /dev/random rw,nosuid,relatime master:2 - devtmpfs dev rw,size=15668300k,nr_inodes=3917075,mode=755,inode64,huge=advise
1164 1150 0:7 /urandom /dev/urandom rw,nosuid,relatime master:2 - devtmpfs dev rw,size=15668300k,nr_inodes=3917075,mode=755,inode64,huge=advise
1165 1150 0:7 /tty /dev/tty rw,nosuid,relatime master:2 - devtmpfs dev rw,size=15668300k,nr_inodes=3917075,mode=755,inode64,huge=advise
1166 1150 0:241 / /dev/pts rw,nosuid,noexec,relatime - devpts devpts rw,mode=620,ptmxmode=666
1167 1121 0:243 / /proc rw,nosuid,nodev,noexec,relatime - proc proc rw
1168 1149 0:244 / /tmp rw,nosuid,nodev,relatime - tmpfs tmpfs rw,mode=755,uid=1000,gid=1000,inode64,huge=advise
1169 1137 0:245 / /run rw,nosuid,nodev,relatime - tmpfs tmpfs rw,mode=755,uid=1000,gid=1000,inode64,huge=advise
1170 1148 259:5 /scratch/hyaku/kumitate-r49/seats/ScoutMountinfoFields/lane /fast/scratch/hyaku/kumitate-r49/seats/ScoutMountinfoFields/lane rw,nosuid,nodev,noatime master:207 - xfs /dev/nvme1n1p2 rw,inode64,logbufs=8,logbsize=256k,noquota
1171 1168 259:4 /smf.DUny/b1 /tmp/smf.DUny/b1 rw,nosuid,nodev,noatime master:213 - xfs /dev/nvme1n1p1 rw,inode64,logbufs=8,logbsize=256k,noquota
```

## Confidence and gaps

- High: field 5 / index 4 is the mount point; field 4 is the in-filesystem root and is the wrong comparison string; `\040` and `\134` observed with hex; empty-line `undefined`; 44 lines / 38 unique paths with no extra bind at this cwd; bind record shape; stacked duplicates remain listed; cap-run argv at lines 187–188.
- Medium: which listed paths are the covering mount (one `stat` probe; device encoding checked against glibc `new_encode_dev` for the xfs/vfat/sysfs lines).
- Unresolved: tab and newline escapes; whether super-option or mount-option fields can contain a space on some filesystem; why btrfs `st_dev` disagrees with mountinfo `0:30`; stability of the host-import set across boots (it is not a frozen allowlist).

Raw captures: `/fast/scratch/hyaku/kumitate-r49/seats/ScoutMountinfoFields/raw/`.

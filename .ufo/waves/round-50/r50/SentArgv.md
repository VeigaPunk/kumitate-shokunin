# SentArgv

Axes attacked: **operability** and **coverage**.

## Finding: implicit CWD bind bypasses protected-mount refusals

**Severity: High.** The `/tmp` refusal works for user-supplied `--bind`, but `cap-run` adds a second bind without applying that guard. `run()` takes `cwd = process.cwd()` (`scripts/cap-run.mjs:182`) and constructs `--tmpfs /tmp --tmpfs /run --bind cwd cwd` before the user-bind list (`:189-192`). Thus invoking cap-run from `/tmp` implicitly performs the same later `--bind /tmp /tmp` that the patch rejects only in `parseArgs` (`:124-133`). No `--bind` option is required.

**Read-only reproducer run from `cwd=/tmp`:**

```text
$ node /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/cap-run.mjs --mem 64 --tasks 8 --budget 10 -- node -e 'console.log(require("fs").readFileSync("/proc/self/mountinfo","utf8").split("\n").filter(x=>x.split(" ")[4]==="/tmp").join("\n"))'
node[2]: pthread_create: Resource temporarily unavailable
721 566 259:4 / /tmp ro,nosuid,nodev,noatime master:213 - xfs /dev/nvme1n1p1 rw,inode64,logbufs=8,logbsize=256k,noquota
744 721 0:117 / /tmp rw,nosuid,nodev,relatime - tmpfs tmpfs rw,mode=755,uid=1000,gid=1000,inode64,huge=advise
746 744 259:4 / /tmp rw,nosuid,nodev,noatime master:213 - xfs /dev/nvme1n1p1 rw,inode64,logbufs=8,logbsize=256k,noquota
CAP_RUN: EXIT code=0 unit=cap-run-4125162-1792788614345-c92218
```

The last `/tmp` mount is the host XFS filesystem, mounted `rw` after the tmpfs. I did not write a host file. Host `/tmp` is mode `1777` (`stat -c '%A %a %U:%G %n' /tmp` → `drwxrwxrwt 1777 root:root /tmp`), so an untrusted child can create host-visible files there. The read-only probe also showed the same implicit-CWD bypass for other protected mounts: `cwd=/run` ended with the host `/run` tmpfs mounted `rw`; `cwd=/dev` ended with host `devtmpfs` `rw`; `cwd=/sys` ended with host `sysfs` `rw`; and `cwd=/proc` ended with a `proc` mount (`master:5`) after the fresh proc mount. These are the same unchecked `--bind cwd cwd` path. A negative control from `cwd=/` showed only a read-only `/` mount; I found no root-rw bypass there.

Impact: an invocation launched with `cwd=/tmp` defeats the central C1 host-`/tmp` isolation even though all explicit `--bind /tmp` arguments are refused. CWDs at `/run`, `/dev`, `/sys`, or `/proc` likewise bypass the corresponding explicit refusal/namespace setup; the visible `rw` mount flags do not by themselves prove every protected operation is permitted, but the host mount is reintroduced. No host write or device/sysfs action was attempted.

**Coverage consequence:** the frozen G50 checks do not exercise this input. `bindguard50-probe.mjs:54,78,81-87` creates `T` under `tmpdir()` and runs the refusal cases with `cwd: T`; G2 tests only explicit `--bind D`. Its `--bind /tmp` case therefore does not cover the automatic CWD bind. The selftest likewise puts its children in a `mkdtemp` directory under `tmpdir()` and tests only the explicit `--bind /tmp` arm (`cap-run.mjs:265,295-299,311-321`). GUARD_HELD can coexist with the CWD bypass.

**Smallest remediation:** apply the same canonical protected-path predicate to the implicit `cwd` bind before constructing argv; fail with the existing usage class when CWD is a refused path (at minimum `/tmp`, and consistently `/`, `/run`, `/proc`, `/sys`, `/dev`). Keep an intended `/tmp/<subdir>` CWD legal only if exposing that selected subdirectory is part of the contract. Add a selftest/G50 arm that launches cap-run with `cwd=/tmp` and requires refusal or proves that the resulting `/tmp` is the fresh tmpfs; exercise the other protected CWDs if the shared predicate is used.

## Explicit `--bind` path variants

Current lane `scripts/cap-run.mjs` SHA-256: `64fafb421a5fd70ff17383d9f8c9eaf51be23b66816773b609eb9b8082e3b672`. The guard checks the source's `realpathSync(v)` and `resolve(v)`; `/tmp` is exact-only so allowed subdirectory binds remain legal (`:128-133`). The round patch artifact is present at `.ufo/waves/round-50/r50/ExecBindGuardPatch.md`; its diff adds the exact `/tmp` test and a usage selftest arm (`:25-33`), but does not alter the implicit CWD bind at cap-run `:190`.

Benign commands below were run with a child that only exits 0; all were rejected before `run()` and returned exit 64:

| Input | Result |
|---|---|
| `--bind //tmp` | `CAP_RUN: USAGE --bind refuses "//tmp" ...`; exit 64 |
| `--bind /tmp/.` | `CAP_RUN: USAGE --bind refuses "/tmp/." ...`; exit 64 |
| `--bind /tmp/../tmp` | `CAP_RUN: USAGE --bind refuses "/tmp/../tmp" ...`; exit 64 |
| `--bind /tmp/` | `CAP_RUN: USAGE --bind refuses "/tmp/" ...`; exit 64 |
| `--bind /tmp` | `CAP_RUN: USAGE --bind refuses "/tmp" ...`; exit 64 |

For example, the executed form was `node scripts/cap-run.mjs --mem 64 --tasks 8 --budget 10 --bind //tmp -- node -e 'process.exit(0)'`. A temporary symlink `/tmp/sentargv50.hozJrT/tmp-alias -> /tmp` was also tested: `realpathSync(alias)` printed `/tmp`, cap-run returned `CAP_RUN: USAGE --bind refuses "/tmp/sentargv50.hozJrT/tmp-alias" ...`, exit 64; the temporary directory was removed in `finally`. Thus the listed lexical spellings and symlink-to-`/tmp` source are blocked. The exact `realpath` call follows symlinks; `resolve(v)` normalizes dot segments/trailing slash.

## `--verdict-file` and `--env`

- Tested `node scripts/cap-run.mjs --mem 64 --tasks 8 --budget 10 --verdict-file /tmp --bind /tmp -- node -e 'process.exit(0)'`: it returned `CAP_RUN: USAGE --bind refuses "/tmp" ...`, exit 64. Parsing exits before `run(parseArgs(args))` (`:478`), so this invalid bind does not reach the verdict-file open. Separately, `--verdict-file` is an explicit parent-side output capability: after the child exits, cap-run writes only its fixed verdict line with `O_EXCL|O_NOFOLLOW`, mode `0600` (`:207-212`). A caller-chosen absolute output path can therefore receive that line on the host; this is not the child bypass and should be treated as intentional API authority.
- No `--env` injection bypass found. The parser stores each validated `K=V` pair (`:120-123`); argv construction appends `['--setenv', k, v]` as separate elements after bwrap's mount options, and `spawn('systemd-run', argv, ...)` has no shell (`:185-200`). `env -i PATH=/usr/bin` clears inherited environment before bwrap (`:189`); option-looking text/spaces in a value do not become extra argv entries. This is source-level analysis, not a child-execution test.

No tools installed. No lane files changed beyond this report.
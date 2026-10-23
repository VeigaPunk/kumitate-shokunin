RESULT SentinelBwrapEnvI rev=a2e5b54c verdict=gaps proc1_marker=absent other_channels=inherited_fds_36_38,proc1_cmdline,controlling_tty,explicit_runtime_binds
Severity: MEDIUM; conditional HIGH if argv or an inherited descriptor carries credentials.
Axes: operability (primary); sandbox confidentiality and integrity.
Finding: CONFIRMED for the narrow environment claim: env -i before bwrap removes the planted launcher marker from /proc/1/environ; --clearenv alone does not. GAPS for broader isolation: argv, inherited descriptors, and the controlling tty remain visible/reachable.
Exploit path: sandboxed code reads /proc/1/cmdline, inspects inherited /proc/self/fd, or opens /dev/tty; if the launcher explicitly binds /run or its runtime directory, sandbox code reads that mounted content.
Impact: environment scrubbing fixes the demonstrated /proc/1/environ leak, but does not prevent argv disclosure or access through inherited descriptors/terminal. No host /run or XDG runtime contents were read.
Smallest remediation: preserve the resource scope, close all non-whitelisted descriptors and redirect stdio deliberately, detach from the controlling tty (e.g. bwrap --new-session), keep secrets out of argv/--setenv arguments, and omit /run or XDG_RUNTIME_DIR binds unless required.
Safe ordering (observed): `systemd-run --user --scope ... timeout ... env -i PATH=/usr/bin:/bin HOME=/tmp bwrap --unshare-all --die-with-parent ... --clearenv --setenv PATH /usr/bin:/bin --setenv HOME /tmp COMMAND`. The scope sees its caller's environment; env -i must be its child immediately before bwrap.
Revision command: `git -C /fast/scratch/hyaku/kumitate-r45/seats/a2-SentinelBwrapEnvI/lane rev-parse HEAD`
Output: `a2e5b54cdd2c4cbf72cb0b2ab4ed53e2fe0d730f`
Host commands/output: `/usr/bin/bwrap --version` -> `bubblewrap 0.13.1`; `systemd-run --version | /usr/bin/head -n 1` -> `systemd 262 (262-1-arch)`; `git --version` -> `git version 2.56.0`.
Probe command (all demo work bounded): `SENTINEL_MARKER=r45_sentinel_planted_20261023 systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 900 /usr/bin/script -q -c '/usr/bin/bash /fast/scratch/hyaku/kumitate-r45/seats/a2-SentinelBwrapEnvI/probe.sh' /dev/null`
Probe files: `/fast/scratch/hyaku/kumitate-r45/seats/a2-SentinelBwrapEnvI/probe.sh` sha256 `74d87c6277866c53839e102c439adc3373b4211804ececadd0d11c966c8d590a`; `probe.py` sha256 `f012c9fc7db0d920286bfe13ebd0501bba8cb209db6a491122d11a07c5a42202`.
Observed output (verbatim selected lines):
```text
scope_marker=present
outer_fds:
0 -> /dev/pts/3
1 -> /dev/pts/3
2 -> /dev/pts/3
36 -> /dev/pts/0
38 -> /dev/pts/0
case=env_i_then_bwrap
proc1_marker=absent
proc1_cmdline_readable=yes
proc1_argv0=/usr/bin/bwrap
proc1_clearenv_flag=yes
proc1_cmdline_marker=present
stdin_is_tty=yes
dev_tty_open=yes
run_path=absent
xdg_runtime_env=absent
self_fds:
0=/dev/pts/3
1=/dev/pts/3
2=/dev/pts/3
36=/dev/pts/0
38=/dev/pts/0
case=bwrap_clearenv_without_env_i
proc1_marker=present
proc1_cmdline_readable=yes
proc1_argv0=/usr/bin/bwrap
proc1_clearenv_flag=yes
proc1_cmdline_marker=present
stdin_is_tty=yes
dev_tty_open=yes
run_path=absent
xdg_runtime_env=absent
```
The bwrap argv marker was planted as a non-secret test value; its value is not printed. `ls -l /proc/self/fd` inside both sandboxes showed fds 36 and 38 pointing to `/dev/pts/0`; those same descriptors existed in the outer scope before bwrap. `/proc/1/cmdline` exposed `/usr/bin/bwrap` and the planted argv marker despite env-i and --clearenv.
Explicit-bind command: `systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 900 env -i PATH=/usr/bin:/bin HOME=/tmp /usr/bin/bwrap --unshare-all --die-with-parent --ro-bind /usr /usr --ro-bind /lib /lib --ro-bind /lib64 /lib64 --ro-bind /etc /etc --dev /dev --proc /proc --tmpfs /tmp --dir /run --ro-bind /fast/scratch/hyaku/kumitate-r45/seats/a2-SentinelBwrapEnvI/runtime-fixture /run --dir /tmp/xdg-runtime --ro-bind /fast/scratch/hyaku/kumitate-r45/seats/a2-SentinelBwrapEnvI/runtime-fixture /tmp/xdg-runtime --clearenv --setenv PATH /usr/bin:/bin --setenv HOME /tmp --setenv XDG_RUNTIME_DIR /tmp/xdg-runtime /usr/bin/bash -c 'if test -r /run/marker; then echo run_bind_marker=visible; else echo run_bind_marker=absent; fi; if test -r "$XDG_RUNTIME_DIR/marker"; then echo xdg_runtime_bind_marker=visible; else echo xdg_runtime_bind_marker=absent; fi'`
Output: `run_bind_marker=visible`; `xdg_runtime_bind_marker=visible`. The only bound data was a scratch fixture (sha256 `717ebca5b23962c12e70eb7448b3f5b9e90a32e01d9f830641ecd2a2579c3f3c`); host runtime paths were not mounted.
Cleanup command: `matches=$(pgrep -af "$(pwd)" || true); if [ -z "$matches" ]; then printf 'pgrep -f scratch: no matching process\\n'; else printf '%s\\n' "$matches"; fi`
Output: `pgrep -f scratch: no matching process`.
Tools installed/updated: none.

RESULT SentinelSeatEnvScrub rev=a2e5b54c verdict=gaps survivors=GIT_CONFIG_GLOBAL,GIT_CONFIG_KEY_n,GIT_CONFIG_VALUE_n,GIT_CEILING_DIRECTORIES,GIT_EXEC_PATH,HOME,XDG_CONFIG_HOME
Severity: HIGH, conditional on an inherited config path and a Git write that runs hooks.
Axes: operability and isolation coverage.

Revision and bounded run
- Scratch clone run: `systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 900 bash -c 'unset $(git rev-parse --local-env-vars) && mkdir -p /fast/scratch/hyaku/kumitate-r45/seats/a2-SentinelSeatEnvScrub/lane && env -u GIT_DIR -u GIT_WORK_TREE -u GIT_INDEX_FILE git clone -q --no-hardlinks /home/vgpnk/Projects/shokunin/kumitate-shokunin /fast/scratch/hyaku/kumitate-r45/seats/a2-SentinelSeatEnvScrub/lane && git -C /fast/scratch/hyaku/kumitate-r45/seats/a2-SentinelSeatEnvScrub/lane checkout -q --detach a2e5b54cdd2c4cbf72cb0b2ab4ed53e2fe0d730f && printf \"HEAD=\" && git -C /fast/scratch/hyaku/kumitate-r45/seats/a2-SentinelSeatEnvScrub/lane rev-parse HEAD'` -> exit 0, `HEAD=a2e5b54cdd2c4cbf72cb0b2ab4ed53e2fe0d730f`.
- Probe command: `systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 900 env -i PATH=/home/vgpnk/.local/bin:/usr/bin:/bin HOME=/fast/scratch/hyaku/kumitate-r45/seats/a2-SentinelSeatEnvScrub/probe/home XDG_CONFIG_HOME=/fast/scratch/hyaku/kumitate-r45/seats/a2-SentinelSeatEnvScrub/probe/xdg bash /fast/scratch/hyaku/kumitate-r45/seats/a2-SentinelSeatEnvScrub/verify-env-scrub.sh` -> exit 0; `git version 2.56.0`; `jj 0.45.1-7c41cdeb16b6b321c64e789a966b6adf723816a5`.

(a) `cd /fast/scratch/hyaku/kumitate-r45/seats/a2-SentinelSeatEnvScrub/probe/outside && git rev-parse --local-env-vars` -> exit 0. `GIT_DIR=/fast/scratch/hyaku/kumitate-r45/seats/a2-SentinelSeatEnvScrub/probe/no-such-gitdir git rev-parse --local-env-vars` -> exit 0 and the same output:
```
GIT_ALTERNATE_OBJECT_DIRECTORIES
GIT_CONFIG
GIT_CONFIG_PARAMETERS
GIT_CONFIG_COUNT
GIT_OBJECT_DIRECTORY
GIT_DIR
GIT_WORK_TREE
GIT_IMPLICIT_WORK_TREE
GIT_GRAFT_FILE
GIT_INDEX_FILE
GIT_NO_REPLACE_OBJECTS
GIT_REPLACE_REF_BASE
GIT_PREFIX
GIT_SHALLOW_FILE
GIT_COMMON_DIR
```
(b) In a Bash function stub, `git() { :; }; EMPTY_UNSET_KEEP=PLANTED_EMPTY_UNSET_MARKER; unset $(git rev-parse --local-env-vars)` produced `EMPTY_SUBSTITUTION_UNSET_EXIT=0 EMPTY_MARKER=PLANTED_EMPTY_UNSET_MARKER`: empty output becomes bare `unset`, a harmless no-op here.
- With file and variable `GIT_DIR_MARKER`, stub output `GIT_DIR*` in the same unquoted command produced `UNQUOTED_GLOB_UNSET_EXIT=0 GLOB_MARKER=absent`: pathname expansion selected the file name and unset that variable. A `BAD-NAME` token returned 0 and did not change the separate marker. Real Git's observed output is fixed plain identifiers; odd-token risk is shell behavior if output is changed or substituted.
- The guarded Bash array form below gave `GUARD_EMPTY_EXIT=0 EMPTY_GUARD_MARKER=PLANTED_EMPTY_GUARD_MARKER` and `GUARD_GLOB_EXIT=0 GLOB_MARKER=PLANTED_GUARD_GLOB_MARKER`.

(c) The list contains `GIT_CONFIG_PARAMETERS` and `GIT_CONFIG_COUNT` (and `GIT_CONFIG`), so they are scrubbed. It does not contain `GIT_CONFIG_GLOBAL`, `GIT_CONFIG_KEY_0/1`, `GIT_CONFIG_VALUE_0/1`, `GIT_CEILING_DIRECTORIES`, `GIT_EXEC_PATH`, `HOME`, or `XDG_CONFIG_HOME`.
- Concrete path: `cd /fast/scratch/hyaku/kumitate-r45/seats/a2-SentinelSeatEnvScrub/probe/misglobal/repo; GIT_CONFIG_GLOBAL=/fast/scratch/hyaku/kumitate-r45/seats/a2-SentinelSeatEnvScrub/probe/misglobal/config; export GIT_CONFIG_GLOBAL; unset $(git rev-parse --local-env-vars); git -c user.name=SeatProbe -c user.email=seat-probe@example.invalid commit --allow-empty --no-gpg-sign -m planted-hook` -> `GIT_CONFIG_GLOBAL_REMAINS=PLANTED_PATH`, `PLANTED_GIT_CONFIG_GLOBAL_HOOK_MARKER`, and `[master (root-commit) 5d4221c] planted-hook`.
- A separate `cd /fast/scratch/hyaku/kumitate-r45/seats/a2-SentinelSeatEnvScrub/probe/mishome/repo; HOME=/fast/scratch/hyaku/kumitate-r45/seats/a2-SentinelSeatEnvScrub/probe/mishome; XDG_CONFIG_HOME=/fast/scratch/hyaku/kumitate-r45/seats/a2-SentinelSeatEnvScrub/probe/empty-xdg; export HOME XDG_CONFIG_HOME; unset $(git rev-parse --local-env-vars); git -c user.name=SeatProbe -c user.email=seat-probe@example.invalid commit --allow-empty --no-gpg-sign -m planted-home-hook` likewise emitted `HOME_REMAINS=PLANTED_PATH XDG_CONFIG_HOME_REMAINS=PLANTED_PATH`, `PLANTED_HOME_CONFIG_HOOK_MARKER`, and `[master (root-commit) aa42c08] planted-home-hook`. No real config values or secrets were printed.
- `GIT_CONFIG_KEY_0/1` and `GIT_CONFIG_VALUE_0/1` remain in the environment, but the scrub removes `GIT_CONFIG_COUNT`; the tested pair was inactive afterward (`GUARD_GIT_CONFIG_COUNT=absent KEY_VALUE=PLANTED`).

(d) The tested scrub did not remove Jujutsu user config or break a fresh colocated repo: with `cd /fast/scratch/hyaku/kumitate-r45/seats/a2-SentinelSeatEnvScrub/probe/jjrepo; GIT_DIR=/fast/scratch/hyaku/kumitate-r45/seats/a2-SentinelSeatEnvScrub/probe/foreign.git; export GIT_DIR`, the array scrub printed `JJ_GIT_DIR_AFTER_SCRUB=absent`; `jj config get user.name` printed `PLANTED_JJ_CONFIG_NAME`; `jj status` printed `The working copy has no changes.` This is evidence for the tested `jj 0.45.1` config/status path, not every Jujutsu command.

Smallest tested Bash one-line guard (neutralizes Git global/system config while preserving HOME/XDG for Jujutsu):
```
_git_local_env=$(git rev-parse --local-env-vars 2>/dev/null) || exit; [ -z "$_git_local_env" ] || { mapfile -t _git_local_env_names <<< "$_git_local_env" && unset "${_git_local_env_names[@]}"; } || exit; unset GIT_EXEC_PATH GIT_CEILING_DIRECTORIES; export GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_NOSYSTEM=1
```
- With planted global and HOME hook configs plus `GIT_CONFIG_COUNT=1`, this line produced `GUARD_GIT_CONFIG_COUNT=absent KEY_VALUE=PLANTED GIT_CONFIG_GLOBAL=DEV_NULL GIT_EXEC_PATH=absent GIT_CEILING_DIRECTORIES=absent`; the following scratch commit printed `[master (root-commit) a0d33f1] guarded` and no planted hook marker. Supply Git identity explicitly if a scratch commit needs it. `mapfile` makes this Bash-specific.
- Post-run process check: `pgrep -af '[a]2-SentinelSeatEnvScrub'` -> `NO_LEFTOVER_PROCESS`. No tools installed.
RESULT AblScrubRow rev=6b2a4517 verdict=defect baseline=reproduces control_clean=yes necessary=4/5 redundant=GIT_CEILING_DIRECTORIES

# Row 3 (M3) guard ablation: necessity, mechanism binding, operability

Judged object: `corpus/knowledge/agent-isolation-substrates.md` at `6b2a45178c72a4565bb9d98e09f4c36b95ca1521`
(sha256 `a3a7ce3b340b9984f01a13c1aa5fde36fbf3847d68f920cd1d0573ac75d81d61`), decision-table row 3, line 162. The row's
guard snippet was extracted from the raw bytes (table `\|` unescaped) and compared byte-identically with the line I
executed: `SNIPPET_IDENTICAL=yes`. Host: git 2.56.0, jj 0.45.1-7c41cdeb16b6b321c64e789a966b6adf723816a5, systemd 262.
No tool was installed or updated. Script sha256 `8f4a048179de5acecb18497bbe88ebd6277339822332d858e0c8dd0c9c72b33d`; receipt
`run7.txt` sha256 `3c30a7fae0e1ba00ff9c7f49ccaaf646ef29f3ce9974fe0dbc7c5d12b00f2cc8`. Every scenario ran as
`systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 900 bash <file> scn <name>` under
`env -i`; all 40 scenario exits were `rc=0`; `pgrep -fa a3f-AblScrubRow` printed no processes after the run; scratch is
19M under `/fast/scratch/hyaku/kumitate-r45/seats/a3f-AblScrubRow/`.

## 1. Baseline (no guard) and the do-nothing control, against M3

| M3 statement | observed | verdict |
|---|---|---|
| A 1->2->3 commits, B stays 1 | `post1 A=2 B=1`, `post2 A=3 B=1`, `A_top=seat2 B_top=c1` | CONFIRMED observed=A 1->2->3, B 1->1->1 |
| index writes follow A too | `A_staged=[base.txt,] A_staged_blob=0be191b8...`, `B_staged=[] B_worktree_blob=0be191b8...` | CONFIRMED observed=A index holds B's blob, B index empty |
| clone under the exported GIT_DIR leaves A untouched | `clone_rc=0 A_after_clone=1 B=1 C=1` | CONFIRMED observed=A 1->1 |
| next `git -C <clone> commit` commits into A | `after A=2 B=1 C=1 C_top=c1` | CONFIRMED observed=A 1->2, C 1->1 |
| `git rev-parse --local-env-vars` lists 15 names | `local_env_names=15` | CONFIRMED observed=15 |
| git off PATH -> empty substitution, scrub silently does nothing | `revparse_off_path_rc=127 g_empty=yes`, `GIT_DIR=<A>/.git`, `A=2 B=1` | CONFIRMED observed=fail-open |
| hooks in A run from an inherited GIT_DIR | `marker=ran A=2 B=1` | CONFIRMED observed=A's pre-commit ran |
| planted GIT_CONFIG_GLOBAL / `$HOME/.gitconfig` still runs a hook after the local-env scrub | `marker=ran` in each | CONFIRMED observed=both |

Do-nothing control (same script with the triggering git write removed): `post A=1 B=1 A_status=[] B_status=[] marker=NONE`
and, with every config redirection and a planted exec dir in place, `A=1 B=1 marker=NONE marker_git=NONE execplanted=no`.
Control delta zero on both counts: `control_clean=yes`.

DIFFERS observed, per component checked against M3: (i) GIT_EXEC_PATH is not covered by M3's text — a planted exec dir executes
during an ordinary commit and a non-local clone (observed=`marker_git=3`, `marker_up=ran`, `A/.git/EXECPATH-PLANTED` created);
(ii) GIT_CEILING_DIRECTORIES is not a redirect — an inherited ceiling is fail-closed (observed=`rc=128`), and unsetting it lets a
commit from a non-repo subdirectory land in an ancestor repo (observed=`O 1->2`); (iii) the row's line under the mandated wrapper's
inline form — observed=`GIT_DIR` survives, `A=2 B=1`, exit 0.

## 2. Full guard set: every planted failure is absent

- `full_dir`: `after_guard GIT_DIR=unset git_env=[GIT_CONFIG_GLOBAL,GIT_CONFIG_NOSYSTEM,]`, `A=1 B=2`; second commit `A=1 B=3`.
- `full_index`: `A_staged=[] B_staged=[base.txt]`. `full_hook`: `marker=NONE A=1 B=2`. `full_clone`: `A=1 B=1 C=2 C_top=seat`.
- `full_gcfg`, `full_homerc`, `full_syscfg`, `full_params`, `full_count`, `full_xdg`: each `marker=NONE`.
- `full_count`: `COUNT=unset KEY_0=core.hooksPath VALUE_0_set=yes` (residue inert). `full_exec`: `marker_git=NONE marker_up=NONE execplanted=no`.
- `full_ceiling`: `CEILING=unset`, `commit_from_inner_rc=0 O=2` (this is the D2 finding, not a blocked redirect).

## 3. Ablation, one component removed at a time

(a) local-env unset list — NECESSARY. `abl_unset_dir`: `GIT_DIR=<A>/.git`, `A=2 B=1`; `abl_unset_params`: `marker=ran`;
`abl_unset_count`: `marker=ran`. Removing it restores the GIT_DIR redirection and both config-parameter hooks.

(b) `|| exit` on rev-parse failure — NECESSARY. `abl_exit_nogit`: PATH without git -> `revparse_off_path_rc=127 g_empty=yes`,
GIT_DIR survives, `A=2 B=1` (the fail-open M3 describes). `abl_exit_shim`: shim failing only `rev-parse --local-env-vars` ->
`shim_revparse_rc=128`, GIT_DIR survives, `A=2 B=1`. With the line's `|| exit` and the same PATH-off injection: `subshell_rc=127`,
`A=1 B=1` — fail-closed.

(c) `unset GIT_EXEC_PATH GIT_CEILING_DIRECTORIES` — split.
- GIT_EXEC_PATH NECESSARY, but not for the row's stated failure: `abl_execpath` gave `marker_git=3 marker_up=ran execplanted=yes
  A=1 B=2`; a planted exec dir is executed by an ordinary commit (git's auto-maintenance spawns `git` resolved through the exec
  path, 3 times) and by `git clone --no-local` (planted upload-pack), and the planted `git` writes `A/.git/EXECPATH-PLANTED`.
  With the unset (`full_exec`) no marker, no write.
- GIT_CEILING_DIRECTORIES REDUNDANT for the row's failure: `base_ceiling` `ceiling_eq_O_sub toplevel=[fatal: not a git repository] rc=128`,
  `commit_with_ceiling_rc=128 O=1`, then after unset `commit_no_ceiling_rc=0 O=2`. A ceiling only limits upward discovery (fail-closed);
  unsetting it removes the limit and lets a commit from a non-repo subdirectory land in an ancestor repo. Case that needs the unset:
  a stray ceiling equal to the seat's own clone root makes the clone's subdirectories repo-less (`abl_ceiling` `commit_with_planted_ceiling_rc=128 B=1`,
  then `commit_after_unset_rc=0 B=2`).

(d) `GIT_CONFIG_GLOBAL=/dev/null` — NECESSARY. `abl_global_gcfg` `marker=ran`; `abl_global_homerc` `marker=ran`; `abl_global_xdg`
`marker=ran` (the line does not unset XDG_CONFIG_HOME, yet `full_xdg` shows `/dev/null` suppresses it: `GIT_CONFIG_GLOBAL=/dev/null`, `marker=NONE`).

(e) `GIT_CONFIG_NOSYSTEM=1` — NECESSARY. `abl_nosystem` `SYSTEM=<syscfg> NOSYSTEM=unset`, `marker=ran`; with it, `full_syscfg`
`marker=NONE`. Host fact: `/etc/gitconfig` does not exist (`ls -l /etc/gitconfig` -> No such file), so necessity here is against a
planted `GIT_CONFIG_SYSTEM` or another host's system file.

## 4. PARAMETERS / COUNT / KEY_0 / VALUE_0, and jj

- Membership: `GIT_CONFIG_PARAMETERS=yes`, `GIT_CONFIG_COUNT=yes`; `GIT_CONFIG_GLOBAL=no`, `GIT_CONFIG_SYSTEM=no`,
  `GIT_CONFIG_NOSYSTEM=no`, `GIT_EXEC_PATH=no`, `GIT_CEILING_DIRECTORIES=no`.
- Unguarded, both plants run a hook: `base_params marker=ran`, `base_count marker=ran`. Under the full line: `full_params PARAMETERS=unset marker=NONE`;
  `full_count COUNT=unset KEY_0=core.hooksPath VALUE_0_set=yes marker=NONE`. So on git 2.56.0 the line does cover both, and the surviving
  KEY_n/VALUE_n pair is inert once COUNT is gone.
- jj: `plain_jjlog=[e005b3cdb487] rc=0` and `guarded_jjlog=[e005b3cdb487] rc=0 same_as_plain=yes`; `guarded_jjst_rc=0`; `guarded_describe_rc=0`;
  `guarded_author=[Seat User|seat@example.invalid]`. Identity source checked: with only `$HOME/.gitconfig` and no jj config,
  `gitconfig_only_describe_rc=0` warns "Name and email not configured" and `gitconfig_only_author=[|]`; after `jj config set --user` the author is set.
  This jj does not take identity from git config, so `GIT_CONFIG_GLOBAL=/dev/null` removes nothing jj was using. The line does not break
  `jj --ignore-working-copy log` in a scratch colocated repo (same commit id, rc 0), including with an inherited GIT_DIR.

## Defects (stated plainly)

- D1 (operability, reproduced): the row's line fails open when passed as a `bash -c` string under the mandated wrapper. systemd 262 expands
  `${_n[@]}` in argv before bash sees it — `Invalid environment variable name evaluates to an empty string: _n[@]` — and the commit then lands
  in the inherited repo: `inline_GIT_DIR=set commit_rc=0 A=2 B=1`, exit 0. The identical text read from a file works (`inline_GIT_DIR=unset`,
  `A=1 B=2`). `systemd-run --help` lists `--expand-environment=BOOL`; with `--expand-environment=no` the inline form works (`A=1 B=2`).
  The row does not warn about this, and the contract mandates that wrapper for every gate run.
- D2 (mechanism mismatch): GIT_CEILING_DIRECTORIES is not a repository or config redirection. Listing it as a guard for "commits ... landing in
  an inherited `GIT_DIR` repository" is unsupported by M3; keeping an inherited ceiling is fail-closed, and unsetting it can widen discovery into
  an ancestor repo (`full_ceiling`: commit from a non-repo subdirectory lands in O, `O=2`).
- D3 (scope mismatch): GIT_EXEC_PATH is necessary, but its failure is code execution by a planted exec dir during ordinary commits and non-local
  clones (writing into the inherited repository), not a GIT_DIR/config redirect. Neither M3's paragraph nor the row's "failure prevented" text
  names that hazard.
- D4 (receipt fidelity): the row says "tested by SentinelSeatEnvScrub", but that receipt's tested line is not the row's text: it uses
  `_git_local_env`/`_git_local_env_names`, adds `2>/dev/null` and a second `|| exit`, and was run from a file. The row's exact line (including its
  `${_n[@]}` token) was not what that receipt exercised.

## Assessment

Necessary: (a) yes, (b) yes, (d) yes, (e) yes; (c) necessary through GIT_EXEC_PATH and redundant through GIT_CEILING_DIRECTORIES. 4/5, with one
misframed half. Baseline reproduces every M3 number I checked; the control is clean; the full line blocks every planted redirect when it executes
in a shell or from a file. The verdict is defect on D1 (silent fail-open under the mandated wrapper's inline form), D2/D3 (the guard set carries a
non-guard and an unstated hazard), and D4 (the cited receipt is not the row's text).

## Risks and limits

- One host and three versions: git 2.56.0, jj 0.45.1, systemd 262; the `${...}` expansion is systemd's behavior here and the remedy option may differ elsewhere.
- `/etc/gitconfig` is absent, so (e) is proven against a planted `GIT_CONFIG_SYSTEM` only.
- Not tested: `GIT_CONFIG` (the file variable) and object-store redirects (`GIT_OBJECT_DIRECTORY`, `GIT_ALTERNATE_OBJECT_DIRECTORIES`) beyond their
  membership in the 15; the row's substrate and fetch behavior (other seats own those rows).
- Scratch 19M; no processes left; nothing installed or updated. No blocker.

## Script (executed, sha256 8f4a048179de5acecb18497bbe88ebd6277339822332d858e0c8dd0c9c72b33d)

```bash
#!/bin/bash
# abl-scrubrow.sh - guard ablation of decision-table row 3 (mechanism M3) of the C1 entry
# at 6b2a45178c72a4565bb9d98e09f4c36b95ca1521.
# Driver runs every scenario through the mandated systemd-run scope wrapper; scenario
# bodies live in this file so systemd-run never sees a ${...} token in an argv.
set -u
SC=/fast/scratch/hyaku/kumitate-r45/seats/a3f-AblScrubRow
SELF=$(readlink -f "$0")
GID=(-c user.name=Seat -c user.email=seat@example.invalid)
W=(systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 900)
WNOEXP=(systemd-run --user --scope --quiet --expand-environment=no -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 900)
BUSENV=(XDG_RUNTIME_DIR="${XDG_RUNTIME_DIR:-/run/user/$(id -u)}")
[ -n "${DBUS_SESSION_BUS_ADDRESS:-}" ] && BUSENV+=(DBUS_SESSION_BUS_ADDRESS="$DBUS_SESSION_BUS_ADDRESS")

say(){ printf '%s\n' "$*"; }
cnt(){ env -u GIT_DIR -u GIT_WORK_TREE -u GIT_INDEX_FILE -u GIT_COMMON_DIR git -C "$1" rev-list --count HEAD 2>/dev/null || echo ERR; }
mkab(){ git init -q A; printf 'base\n' > A/base.txt; git -C A add base.txt;
        git -C A "${GID[@]}" commit -q -m c1; git clone -q --no-hardlinks A B; }
mkhooks(){ mkdir -p "$1"; printf '#!/bin/sh\necho ran >> %s/marker\n' "$PWD" > "$1/pre-commit";
           chmod +x "$1/pre-commit"; }
mkgcfg(){ mkdir -p "$1"; printf '[core]\n\thooksPath = %s/hooks\n' "$PWD" > "$1/cfg"; }
mkfake(){ mkdir -p fake
  printf '#!/bin/sh\necho ran >> %s/marker-git\n: > %s/A/.git/EXECPATH-PLANTED\nexec env -u GIT_EXEC_PATH /usr/bin/git "$@"\n' "$PWD" "$PWD" > fake/git
  printf '#!/bin/sh\necho ran >> %s/marker-up\nexec env -u GIT_EXEC_PATH /usr/bin/git-upload-pack "$@"\n' "$PWD" > fake/git-upload-pack
  printf '#!/bin/sh\necho ran >> %s/marker-commit\nexit 1\n' "$PWD" > fake/git-commit
  chmod +x fake/git fake/git-upload-pack fake/git-commit; }
mark(){ cat marker 2>/dev/null || echo NONE; }

# the row's literal guard line
guard_literal(){
  _g=$(git rev-parse --local-env-vars) || exit; [ -z "$_g" ] || { mapfile -t _n <<< "$_g"; unset "${_n[@]}"; }; unset GIT_EXEC_PATH GIT_CEILING_DIRECTORIES; export GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_NOSYSTEM=1
}
# same line with one component switchable; all defaults on reproduces guard_literal
guard(){
  if [ "${G_EXIT:-1}" = 1 ]; then _g=$(git rev-parse --local-env-vars) || exit; else _g=$(git rev-parse --local-env-vars); fi
  if [ "${G_UNSET:-1}" = 1 ]; then [ -z "$_g" ] || { mapfile -t _n <<< "$_g"; unset "${_n[@]}"; }; fi
  if [ "${G_EXECPATH:-1}" = 1 ]; then unset GIT_EXEC_PATH; fi
  if [ "${G_CEILING:-1}" = 1 ]; then unset GIT_CEILING_DIRECTORIES; fi
  if [ "${G_GLOBAL:-1}" = 1 ]; then export GIT_CONFIG_GLOBAL=/dev/null; fi
  if [ "${G_NOSYSTEM:-1}" = 1 ]; then export GIT_CONFIG_NOSYSTEM=1; fi
  return 0
}

# ---------- scenarios ----------
probe_env(){
  say "git=$(git --version) jj=$(jj --version)"
  g=$(git rev-parse --local-env-vars); say "local_env_names=$(printf '%s\n' "$g" | wc -l)"
  say "local_env_list=[$(printf '%s\n' "$g" | tr '\n' ' ')]"
  for v in GIT_CONFIG_PARAMETERS GIT_CONFIG_COUNT GIT_CONFIG_GLOBAL GIT_CONFIG_SYSTEM GIT_CONFIG_NOSYSTEM GIT_EXEC_PATH GIT_CEILING_DIRECTORIES; do
    if printf '%s\n' "$g" | grep -qx "$v"; then say "in_local_env $v=yes"; else say "in_local_env $v=no"; fi
  done
  mkab; export GIT_DIR=$PWD/A/.git
  say "revparse_with_GIT_DIR_set rc=$(git rev-parse --local-env-vars >/dev/null; echo $?)"
  say "HEREDOC_NOT_USED=ok"
}
base_dir(){
  mkab; say "pre A=$(cnt A) B=$(cnt B)"
  export GIT_DIR=$PWD/A/.git
  printf 's1\n' >> B/base.txt; git -C B "${GID[@]}" commit -q -am seat1; say "commit1_rc=$?"
  say "post1 A=$(cnt A) B=$(cnt B) A_top=$(git -C A log -1 --format=%s) B_top=$(env -u GIT_DIR git -C B log -1 --format=%s)"
  printf 's2\n' >> B/base.txt; git -C B "${GID[@]}" commit -q -am seat2; say "commit2_rc=$?"
  say "post2 A=$(cnt A) B=$(cnt B) A_top=$(git -C A log -1 --format=%s)"
  say "A_status=[$(git -C A status --porcelain | tr '\n' ';')] B_status=[$(env -u GIT_DIR git -C B status --porcelain | tr '\n' ';')]"
}
base_index(){
  mkab; export GIT_DIR=$PWD/A/.git; printf 'idx\n' >> B/base.txt; git -C B add base.txt; say "add_rc=$?"
  say "A_staged=[$(git --git-dir=$PWD/A/.git diff --cached --name-only | tr '\n' ',')] A_staged_blob=$(git --git-dir=$PWD/A/.git rev-parse :base.txt)"
  say "B_staged=[$(env -u GIT_DIR git -C B diff --cached --name-only | tr '\n' ',')] B_worktree_blob=$(env -u GIT_DIR git -C B hash-object base.txt)"
}
base_hook(){
  mkab; mkhooks A/.git/hooks; export GIT_DIR=$PWD/A/.git
  printf 'h\n' >> B/base.txt; git -C B "${GID[@]}" commit -q -am seat; say "commit_rc=$?"
  say "marker=$(mark) A=$(cnt A) B=$(cnt B) A_hook=yes"
}
base_clone(){
  mkab; export GIT_DIR=$PWD/A/.git
  git clone -q --no-hardlinks B C; say "clone_rc=$? A_after_clone=$(cnt A) B=$(cnt B) C=$(cnt C)"
  printf 'cl\n' >> C/base.txt; git -C C "${GID[@]}" commit -q -am seat; say "commit_rc=$?"
  say "after A=$(cnt A) B=$(cnt B) C=$(cnt C) C_top=$(env -u GIT_DIR git -C C log -1 --format=%s)"
}
base_gcfg(){
  mkab; mkhooks hooks; mkgcfg .; export GIT_CONFIG_GLOBAL=$PWD/cfg
  printf 'g\n' >> B/base.txt; git -C B "${GID[@]}" commit -q -am seat; say "commit_rc=$? marker=$(mark) B=$(cnt B)"
}
base_homerc(){
  mkab; mkhooks hooks; mkdir home; printf '[user]\n\tname = Home User\n\temail = home@example.invalid\n[core]\n\thooksPath = %s/hooks\n' "$PWD" > home/.gitconfig
  export HOME=$PWD/home
  printf 'g\n' >> B/base.txt; git -C B "${GID[@]}" commit -q -am seat; say "commit_rc=$? marker=$(mark) B=$(cnt B)"
}
base_syscfg(){
  mkab; mkhooks hooks; mkgcfg .; cp cfg syscfg; export GIT_CONFIG_SYSTEM=$PWD/syscfg
  printf 'g\n' >> B/base.txt; git -C B "${GID[@]}" commit -q -am seat; say "commit_rc=$? marker=$(mark) B=$(cnt B)"
}
base_params(){
  mkab; mkhooks hooks; export GIT_CONFIG_PARAMETERS="'core.hooksPath'='$PWD/hooks'"
  printf 'g\n' >> B/base.txt; git -C B "${GID[@]}" commit -q -am seat; say "commit_rc=$? marker=$(mark) B=$(cnt B)"
}
base_count(){
  mkab; mkhooks hooks; export GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=core.hooksPath GIT_CONFIG_VALUE_0=$PWD/hooks
  printf 'g\n' >> B/base.txt; git -C B "${GID[@]}" commit -q -am seat; say "commit_rc=$? marker=$(mark) B=$(cnt B)"
}
base_xdg(){
  mkab; mkhooks hooks; mkdir -p xdg/git; printf '[core]\n\thooksPath = %s/hooks\n' "$PWD" > xdg/git/config
  export XDG_CONFIG_HOME=$PWD/xdg
  printf 'g\n' >> B/base.txt; git -C B "${GID[@]}" commit -q -am seat; say "commit_rc=$? marker=$(mark) B=$(cnt B)"
}
base_exec(){
  mkab; mkfake; export GIT_EXEC_PATH=$PWD/fake
  printf 'x\n' >> B/base.txt; git -C B "${GID[@]}" commit -q -am seat; say "commit_rc=$? B=$(cnt B)"
  git clone -q --no-local B C; say "clone_rc=$? C=$(cnt C)"
  say "marker_git=$(cat marker-git 2>/dev/null | wc -l) marker_up=$(cat marker-up 2>/dev/null | wc -l) marker_commit=$(cat marker-commit 2>/dev/null || echo NONE) execplanted=$([ -e A/.git/EXECPATH-PLANTED ] && echo yes || echo no)"
}
base_ceiling(){
  git init -q O; printf 'base\n' > O/base.txt; git -C O add base.txt; git -C O "${GID[@]}" commit -q -m c1
  mkdir -p O/sub/inner
  export GIT_CEILING_DIRECTORIES=$PWD/O/sub
  say "ceiling_eq_O_sub toplevel=[$(git -C O/sub/inner rev-parse --show-toplevel 2>&1)] rc=$?"
  git -C O/sub/inner "${GID[@]}" commit -q --allow-empty -m ceil; say "commit_with_ceiling_rc=$? O=$(cnt O)"
  unset GIT_CEILING_DIRECTORIES
  say "no_ceiling toplevel=[$(git -C O/sub/inner rev-parse --show-toplevel 2>&1)] rc=$?"
  git -C O/sub/inner "${GID[@]}" commit -q --allow-empty -m noceil; say "commit_no_ceiling_rc=$? O=$(cnt O)"
}
ctl_dir(){
  mkab; say "pre A=$(cnt A) B=$(cnt B)"; export GIT_DIR=$PWD/A/.git
  say "control: no git write issued; GIT_DIR_set=yes"
  say "post A=$(cnt A) B=$(cnt B) A_status=[$(git -C A status --porcelain | tr '\n' ';')] B_status=[$(env -u GIT_DIR git -C B status --porcelain | tr '\n' ';')] marker=$(mark)"
}
ctl_cfg(){
  mkab; mkhooks hooks; mkgcfg .; cp cfg syscfg
  mkdir home; printf '[core]\n\thooksPath = %s/hooks\n' "$PWD" > home/.gitconfig
  mkfake
  export GIT_CONFIG_GLOBAL=$PWD/cfg GIT_CONFIG_SYSTEM=$PWD/syscfg HOME=$PWD/home
  export GIT_CONFIG_PARAMETERS="'core.hooksPath'='$PWD/hooks'"
  export GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=core.hooksPath GIT_CONFIG_VALUE_0=$PWD/hooks
  export GIT_EXEC_PATH=$PWD/fake
  say "control: no commit, no clone; A=$(cnt A) B=$(cnt B) marker=$(mark) marker_git=$(cat marker-git 2>/dev/null || echo NONE) execplanted=$([ -e A/.git/EXECPATH-PLANTED ] && echo yes || echo no)"
}
full_dir(){
  mkab; export GIT_DIR=$PWD/A/.git; guard_literal
  say "after_guard GIT_DIR=${GIT_DIR:-unset} git_env=[$(env | sed 's/=.*//' | grep '^GIT_' | sort | tr '\n' ',')]"
  printf 's1\n' >> B/base.txt; git -C B "${GID[@]}" commit -q -am seat; say "commit_rc=$?"
  say "A=$(cnt A) B=$(cnt B) A_top=$(git -C A log -1 --format=%s) B_top=$(git -C B log -1 --format=%s)"
  printf 's2\n' >> B/base.txt; git -C B "${GID[@]}" commit -q -am seat2; say "commit2_rc=$? A=$(cnt A) B=$(cnt B)"
}
full_index(){
  mkab; export GIT_DIR=$PWD/A/.git; guard_literal
  printf 'idx\n' >> B/base.txt; git -C B add base.txt; say "add_rc=$?"
  say "A_staged=[$(env -u GIT_DIR git --git-dir=$PWD/A/.git diff --cached --name-only | tr '\n' ',')] B_staged=[$(git -C B diff --cached --name-only | tr '\n' ',')] A=$(cnt A) B=$(cnt B)"
}
full_hook(){
  mkab; mkhooks A/.git/hooks; export GIT_DIR=$PWD/A/.git; guard_literal
  printf 'h\n' >> B/base.txt; git -C B "${GID[@]}" commit -q -am seat; say "commit_rc=$? marker=$(mark) A=$(cnt A) B=$(cnt B)"
}
full_clone(){
  mkab; export GIT_DIR=$PWD/A/.git; guard_literal
  git clone -q --no-hardlinks B C; say "clone_rc=$?"
  printf 'cl\n' >> C/base.txt; git -C C "${GID[@]}" commit -q -am seat; say "commit_rc=$?"
  say "after A=$(cnt A) B=$(cnt B) C=$(cnt C) C_top=$(git -C C log -1 --format=%s)"
}
full_gcfg(){
  mkab; mkhooks hooks; mkgcfg .; export GIT_CONFIG_GLOBAL=$PWD/cfg; guard_literal
  say "after_guard GIT_CONFIG_GLOBAL=${GIT_CONFIG_GLOBAL:-unset}"
  printf 'g\n' >> B/base.txt; git -C B "${GID[@]}" commit -q -am seat; say "commit_rc=$? marker=$(mark) B=$(cnt B)"
}
full_homerc(){
  mkab; mkhooks hooks; mkdir home; printf '[user]\n\tname = Home User\n\temail = home@example.invalid\n[core]\n\thooksPath = %s/hooks\n' "$PWD" > home/.gitconfig
  export HOME=$PWD/home; guard_literal
  printf 'g\n' >> B/base.txt; git -C B "${GID[@]}" commit -q -am seat; say "commit_rc=$? marker=$(mark) B=$(cnt B)"
}
full_syscfg(){
  mkab; mkhooks hooks; mkgcfg .; cp cfg syscfg; export GIT_CONFIG_SYSTEM=$PWD/syscfg; guard_literal
  say "after_guard NOSYSTEM=${GIT_CONFIG_NOSYSTEM:-unset}"
  printf 'g\n' >> B/base.txt; git -C B "${GID[@]}" commit -q -am seat; say "commit_rc=$? marker=$(mark) B=$(cnt B)"
}
full_params(){
  mkab; mkhooks hooks; export GIT_CONFIG_PARAMETERS="'core.hooksPath'='$PWD/hooks'"; guard_literal
  say "after_guard PARAMETERS=${GIT_CONFIG_PARAMETERS:-unset}"
  printf 'g\n' >> B/base.txt; git -C B "${GID[@]}" commit -q -am seat; say "commit_rc=$? marker=$(mark) B=$(cnt B)"
}
full_count(){
  mkab; mkhooks hooks; export GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=core.hooksPath GIT_CONFIG_VALUE_0=$PWD/hooks; guard_literal
  say "after_guard COUNT=${GIT_CONFIG_COUNT:-unset} KEY_0=${GIT_CONFIG_KEY_0:-unset} VALUE_0_set=$([ -n "${GIT_CONFIG_VALUE_0:-}" ] && echo yes || echo no)"
  printf 'g\n' >> B/base.txt; git -C B "${GID[@]}" commit -q -am seat; say "commit_rc=$? marker=$(mark) B=$(cnt B)"
}
full_xdg(){
  mkab; mkhooks hooks; mkdir -p xdg/git; printf '[core]\n\thooksPath = %s/hooks\n' "$PWD" > xdg/git/config
  export XDG_CONFIG_HOME=$PWD/xdg; guard_literal
  say "after_guard XDG_CONFIG_HOME=${XDG_CONFIG_HOME:-unset} GIT_CONFIG_GLOBAL=${GIT_CONFIG_GLOBAL:-unset}"
  printf 'g\n' >> B/base.txt; git -C B "${GID[@]}" commit -q -am seat; say "commit_rc=$? marker=$(mark) B=$(cnt B)"
}
full_exec(){
  mkab; mkfake; export GIT_EXEC_PATH=$PWD/fake; guard_literal
  say "after_guard EXEC_PATH=${GIT_EXEC_PATH:-unset}"
  printf 'x\n' >> B/base.txt; git -C B "${GID[@]}" commit -q -am seat; say "commit_rc=$?"
  git clone -q --no-local B C; say "clone_rc=$? C=$(cnt C)"
  say "marker_git=$(cat marker-git 2>/dev/null || echo NONE) marker_up=$(cat marker-up 2>/dev/null || echo NONE) execplanted=$([ -e A/.git/EXECPATH-PLANTED ] && echo yes || echo no)"
}
full_ceiling(){
  git init -q O; printf 'base\n' > O/base.txt; git -C O add base.txt; git -C O "${GID[@]}" commit -q -m c1
  mkdir -p O/sub/inner; export GIT_CEILING_DIRECTORIES=$PWD/O/sub; guard_literal
  say "after_guard CEILING=${GIT_CEILING_DIRECTORIES:-unset} toplevel=[$(git -C O/sub/inner rev-parse --show-toplevel 2>&1)]"
  git -C O/sub/inner "${GID[@]}" commit -q --allow-empty -m guarded; say "commit_from_inner_rc=$? O=$(cnt O)"
}
abl_unset_dir(){
  mkab; export GIT_DIR=$PWD/A/.git; G_UNSET=0 guard
  say "ablation=no-local-env-unset after_guard GIT_DIR=${GIT_DIR:-unset}"
  printf 's\n' >> B/base.txt; git -C B "${GID[@]}" commit -q -am seat; say "commit_rc=$? A=$(cnt A) B=$(cnt B)"
}
abl_unset_params(){
  mkab; mkhooks hooks; export GIT_CONFIG_PARAMETERS="'core.hooksPath'='$PWD/hooks'"; G_UNSET=0 guard
  say "ablation=no-local-env-unset PARAMETERS=${GIT_CONFIG_PARAMETERS:-unset}"
  printf 'g\n' >> B/base.txt; git -C B "${GID[@]}" commit -q -am seat; say "commit_rc=$? marker=$(mark) B=$(cnt B)"
}
abl_unset_count(){
  mkab; mkhooks hooks; export GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=core.hooksPath GIT_CONFIG_VALUE_0=$PWD/hooks; G_UNSET=0 guard
  say "ablation=no-local-env-unset COUNT=${GIT_CONFIG_COUNT:-unset}"
  printf 'g\n' >> B/base.txt; git -C B "${GID[@]}" commit -q -am seat; say "commit_rc=$? marker=$(mark) B=$(cnt B)"
}
abl_exit_nogit(){
  mkab; export GIT_DIR=$PWD/A/.git
  (
    oldpath=$PATH; PATH=/nonexistent
    _g=$(git rev-parse --local-env-vars); r=$?
    PATH=$oldpath
    say "ablation=no-exit-guard revparse_off_path_rc=$r g_empty=$([ -z "$_g" ] && echo yes || echo no)"
    [ -z "$_g" ] || { mapfile -t _n <<< "$_g"; unset "${_n[@]}"; }
    unset GIT_EXEC_PATH GIT_CEILING_DIRECTORIES; export GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_NOSYSTEM=1
    say "after_guard GIT_DIR=${GIT_DIR:-unset}"
    printf 'n\n' >> B/base.txt; git -C B "${GID[@]}" commit -q -am seat; say "commit_rc=$?"
  )
  say "A=$(cnt A) B=$(cnt B)"
}
abl_exit_on(){
  mkab; export GIT_DIR=$PWD/A/.git
  (
    oldpath=$PATH; PATH=/nonexistent
    _g=$(git rev-parse --local-env-vars) || exit
    PATH=$oldpath
    say "unreachable=yes"
  ); say "subshell_rc=$? (guard with || exit, git off PATH)"
  say "A=$(cnt A) B=$(cnt B)"
}
abl_exit_shim(){
  mkab; mkdir fakebin
  printf '#!/bin/bash\nif [ "$1" = "rev-parse" ] && [ "${2:-}" = "--local-env-vars" ]; then exit 128; fi\nexec /usr/bin/git "$@"\n' > fakebin/git; chmod +x fakebin/git
  export PATH=$PWD/fakebin:$PATH GIT_DIR=$PWD/A/.git; G_EXIT=0 guard
  say "ablation=no-exit-guard shim_revparse_rc=$(git rev-parse --local-env-vars; echo $?) after_guard GIT_DIR=${GIT_DIR:-unset}"
  printf 'n\n' >> B/base.txt; git -C B "${GID[@]}" commit -q -am seat; say "commit_rc=$? A=$(cnt A) B=$(cnt B)"
}
abl_execpath(){
  mkab; mkfake; export GIT_EXEC_PATH=$PWD/fake; G_EXECPATH=0 guard
  say "ablation=no-execpath-unset after_guard EXEC_PATH=${GIT_EXEC_PATH:-unset}"
  printf 'x\n' >> B/base.txt; git -C B "${GID[@]}" commit -q -am seat; say "commit_rc=$?"
  git clone -q --no-local B C; say "clone_rc=$? C=$(cnt C)"
  say "marker_git=$(cat marker-git 2>/dev/null | wc -l) marker_up=$(cat marker-up 2>/dev/null || echo NONE) execplanted=$([ -e A/.git/EXECPATH-PLANTED ] && echo yes || echo no) A=$(cnt A) B=$(cnt B)"
}
abl_ceiling(){
  mkab; mkdir -p B/sub; export GIT_CEILING_DIRECTORIES=$PWD/B
  ( G_CEILING=0 guard
    say "ablation=no-ceiling-unset CEILING=${GIT_CEILING_DIRECTORIES:-unset}"
    git -C B/sub "${GID[@]}" commit -q --allow-empty -m ceil; say "commit_with_planted_ceiling_rc=$? B=$(cnt B)" )
  ( guard
    say "component_on CEILING=${GIT_CEILING_DIRECTORIES:-unset}"
    git -C B/sub "${GID[@]}" commit -q --allow-empty -m noceil; say "commit_after_unset_rc=$? B=$(cnt B)" )
  say "final B=$(cnt B)"
}
abl_global_gcfg(){
  mkab; mkhooks hooks; mkgcfg .; export GIT_CONFIG_GLOBAL=$PWD/cfg; G_GLOBAL=0 guard
  say "ablation=no-global-null GIT_CONFIG_GLOBAL=${GIT_CONFIG_GLOBAL:-unset}"
  printf 'g\n' >> B/base.txt; git -C B "${GID[@]}" commit -q -am seat; say "commit_rc=$? marker=$(mark) B=$(cnt B)"
}
abl_global_homerc(){
  mkab; mkhooks hooks; mkdir home; printf '[core]\n\thooksPath = %s/hooks\n' "$PWD" > home/.gitconfig
  export HOME=$PWD/home; G_GLOBAL=0 guard
  say "ablation=no-global-null HOME=$HOME"
  printf 'g\n' >> B/base.txt; git -C B "${GID[@]}" commit -q -am seat; say "commit_rc=$? marker=$(mark) B=$(cnt B)"
}
abl_global_xdg(){
  mkab; mkhooks hooks; mkdir -p xdg/git; printf '[core]\n\thooksPath = %s/hooks\n' "$PWD" > xdg/git/config
  export XDG_CONFIG_HOME=$PWD/xdg; G_GLOBAL=0 guard
  say "ablation=no-global-null XDG_CONFIG_HOME=$XDG_CONFIG_HOME"
  printf 'g\n' >> B/base.txt; git -C B "${GID[@]}" commit -q -am seat; say "commit_rc=$? marker=$(mark) B=$(cnt B)"
}
abl_nosystem(){
  mkab; mkhooks hooks; mkgcfg .; cp cfg syscfg; export GIT_CONFIG_SYSTEM=$PWD/syscfg; G_NOSYSTEM=0 guard
  say "ablation=no-nosystem SYSTEM=${GIT_CONFIG_SYSTEM:-unset} NOSYSTEM=${GIT_CONFIG_NOSYSTEM:-unset}"
  printf 'g\n' >> B/base.txt; git -C B "${GID[@]}" commit -q -am seat; say "commit_rc=$? marker=$(mark) B=$(cnt B)"
}
jjlog(){
  mkdir home; printf '[user]\n\tname = Home User\n\temail = home@example.invalid\n' > home/.gitconfig
  export HOME=$PWD/home
  jj git init --colocate >/dev/null 2>&1; printf 'hi\n' > f.txt
  jj describe -m seat >/dev/null 2>plain_err.txt
  say "gitconfig_only_describe_rc=$? stderr=[$(tr '\n' ' ' < plain_err.txt)]"
  say "gitconfig_only_author=[$(jj --ignore-working-copy log -n 1 --no-graph -T 'author.name() ++ "|" ++ author.email()' 2>&1)]"
  jj config set --user user.name "Seat User" >/dev/null 2>&1
  jj config set --user user.email "seat@example.invalid" >/dev/null 2>&1
  jj describe -m seat2 >/dev/null 2>plain2_err.txt
  say "after_jjconfig_describe_rc=$? stderr=[$(tr '\n' ' ' < plain2_err.txt)]"
  id1=$(jj --ignore-working-copy log -n 1 --no-graph -T 'commit_id.short()' 2>&1)
  say "plain_jjlog=[$id1] rc=$?"
  say "plain_author=[$(jj --ignore-working-copy log -n 1 --no-graph -T 'author.name() ++ "|" ++ author.email()' 2>&1)]"
  export GIT_DIR=$PWD/.git
  ( guard_literal
    say "guarded GIT_DIR=${GIT_DIR:-unset}"
    id2=$(jj --ignore-working-copy log -n 1 --no-graph -T 'commit_id.short()' 2>&1); r=$?
    say "guarded_jjlog=[$id2] rc=$r same_as_plain=$([ "$id1" = "$id2" ] && echo yes || echo no)"
    jj describe -m guarded-desc >/dev/null 2>err.txt; say "guarded_describe_rc=$? stderr=[$(tr '\n' ' ' < err.txt)]"
    say "guarded_author=[$(jj --ignore-working-copy log -n 1 --no-graph -T 'author.name() ++ "|" ++ author.email()' 2>&1)]"
    say "guarded_jjst_rc=$(jj --ignore-working-copy status >/dev/null 2>&1; echo $?)" )
}

# ---------- driver ----------
SCN=(probe_env base_dir base_index base_hook base_clone base_gcfg base_homerc base_syscfg
     base_params base_count base_xdg base_exec base_ceiling ctl_dir ctl_cfg
     full_dir full_index full_hook full_clone full_gcfg full_homerc full_syscfg
     full_params full_count full_xdg full_exec full_ceiling
     abl_unset_dir abl_unset_params abl_unset_count abl_exit_nogit abl_exit_on abl_exit_shim
     abl_execpath abl_ceiling abl_global_gcfg abl_global_homerc abl_global_xdg abl_nosystem jjlog)

wrap_inline(){
  read -r -d '' INLINE <<'EOS'
R=$1
git init -q "$R/A"
printf 'base\n' > "$R/A/base.txt"
git -C "$R/A" add base.txt
git -C "$R/A" -c user.name=S -c user.email=s@e.invalid commit -q -m c1
git clone -q --no-hardlinks "$R/A" "$R/B"
export GIT_DIR="$R/A/.git"
_g=$(git rev-parse --local-env-vars) || exit
[ -z "$_g" ] || { mapfile -t _n <<< "$_g"; unset "${_n[@]}"; }
unset GIT_EXEC_PATH GIT_CEILING_DIRECTORIES
export GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_NOSYSTEM=1
[ -n "$GIT_DIR" ] && echo inline_GIT_DIR=set || echo inline_GIT_DIR=unset
printf 'x\n' >> "$R/B/base.txt"
git -C "$R/B" -c user.name=S -c user.email=s@e.invalid commit -q -am seat
echo commit_rc=$?
echo A=$(env -u GIT_DIR git -C "$R/A" rev-list --count HEAD) B=$(env -u GIT_DIR git -C "$R/B" rev-list --count HEAD)
EOS
  for mode in plain noexpand; do
    R=$SC/wrap/$mode; rm -rf "$R"; mkdir -p "$R"
    printf '\n### wrap_inline_%s\n' "$mode"
    if [ "$mode" = noexpand ]; then
      env -i PATH=/usr/bin:/bin LC_ALL=C HOME=/tmp "${BUSENV[@]}" "${WNOEXP[@]}" bash -c "$INLINE" seat "$R"
    else
      env -i PATH=/usr/bin:/bin LC_ALL=C HOME=/tmp "${BUSENV[@]}" "${W[@]}" bash -c "$INLINE" seat "$R"
    fi
    printf '### wrap_inline_%s rc=%s\n' "$mode" "$?"
  done
}

driver(){
  say "seat=a3f-AblScrubRow rev=6b2a45178c72a4565bb9d98e09f4c36b95ca1521 date=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  say "entry_sha256=$(git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show 6b2a45178c72a4565bb9d98e09f4c36b95ca1521:corpus/knowledge/agent-isolation-substrates.md | sha256sum | cut -d' ' -f1)"
  for s in "${SCN[@]}"; do
    printf '\n### %s\n' "$s"
    env -i PATH=/usr/bin:/bin:/home/vgpnk/.local/bin LC_ALL=C HOME=/nonexistent "${BUSENV[@]}" "${W[@]}" bash "$SELF" scn "$s"
    printf '### %s rc=%s\n' "$s" "$?"
  done
  wrap_inline
}

case "${1:-driver}" in
  driver) driver ;;
  scn) rm -rf "$SC/scn/$2"; mkdir -p "$SC/scn/$2"; cd "$SC/scn/$2" || exit 1; "$2" ;;
  *) say "usage: $0 [driver|scn <name>]"; exit 2 ;;
esac
```

#!/usr/bin/env bash
# jj-seat-demo.sh — hermetic demonstration of what a jj workspace does as a seat's working copy.
# Contract: kumitate-jj-seat-demo-v2 (round 64). Every repository is a fresh mktemp fixture; every git/jj call
# names its repository explicitly (-C / -R); no identity is configured outside the fixture (--config flags only).
# Output: `JJ_SEAT: <key>=<value>` lines, then `JJ_SEAT_DEMO: DONE jj=<version>` exit 0;
#         `JJ_SEAT_DEMO: FAIL-CLOSED <reason>` exit 2 when jj/git/coreutils are absent or a fixture step fails.
# v2 merges two round-64 seat drafts (K64ExecJjDemoHarden, K64ReviewDemo; L1 integration): hermetic env (caller GIT_*/JJ_*
# cleared, HOME/XDG fixture-local, GIT_CEILING_DIRECTORIES stops the seat's git lookup at the temp root), every mutating step
# fail-closed, honest derivations (seat-attributed op delta, a real --ignore-working-copy probe, the tree-identity rule for
# stale vs auto-repoint), and measured keys on update-stale file fate, cross-abandon and forget reachability.
# v3 DRAFT (round 64 w2, K64R2ExecJjOtherVersion — NOT integrated; the L1 owns scripts/): version-skew repair.
#   1. jj 0.46.0 creates a Git worktree for `jj workspace add` when the current workspace is colocated and
#      `git.colocate` is true (its default), which flips `seat_has_git_dir` no -> yes. The fixture now pins
#      non-colocation with `--no-colocate` where the version supports it, so the 21 `JJ_SEAT:` keys stay
#      version-stable (measured equal on 0.45.1 and 0.46.0; the J64 counter's J6 compares them to the entry).
#   2. Version-dependent facts are printed as `JJ_SKEW: <key>=<value>` lines, which J6 does not read: the
#      default-flags colocation result, and `jj workspace remove` (0.46.0+) against S200's snapshot sentence.
set -u
command -v jj >/dev/null 2>&1 || { echo 'JJ_SEAT_DEMO: FAIL-CLOSED jj-absent'; exit 2; }
command -v git >/dev/null 2>&1 || { echo 'JJ_SEAT_DEMO: FAIL-CLOSED git-absent'; exit 2; }
fail() { echo "JJ_SEAT_DEMO: FAIL-CLOSED $1"; exit 2; }
for u in mktemp grep wc tr awk rm; do command -v "$u" >/dev/null 2>&1 || fail util-absent; done
export LC_ALL=C

D=''
S=''
cleanup() { [ -n "$S" ] && rm -rf "$S"; [ -n "$D" ] && rm -rf "$D"; return 0; }
trap cleanup EXIT
trap 'exit 129' HUP
trap 'exit 130' INT
trap 'exit 143' TERM
D=$(mktemp -d) || fail mktemp
S=$(mktemp -d) || fail mktemp
# --- hermetic environment ----------------------------------------------------
# jj: JJ_CONFIG=/dev/null replaces the FILE config list (verified 0.45.1: user config,
# legacy ~/.jjconfig.toml, XDG config and [aliases] never load) but env layers still pass
# through (JJ_USER beat the file list; it loses to --config flags). HOME/XDG overrides make
# even a future file-list regression harmless, and make git ignore global/system config.
export HOME="$S/xdg-home" XDG_CONFIG_HOME="$S/xdg-home/.config" JJ_CONFIG=/dev/null
mkdir -p "$XDG_CONFIG_HOME"
# Ambient vars that can redirect repos outside the fixture or rewrite outcome keys:
unset GIT_DIR GIT_WORK_TREE GIT_CONFIG_GLOBAL GIT_CONFIG_SYSTEM GIT_CONFIG_NOSYSTEM \
      GIT_CONFIG_COUNT GIT_OBJECT_DIRECTORY GIT_ALTERNATE_OBJECT_DIRECTORIES GIT_INDEX_FILE \
      GIT_COMMON_DIR GIT_CEILING_DIRECTORIES GIT_DISCOVERY_ACROSS_FILESYSTEM GIT_AUTHOR_NAME GIT_AUTHOR_EMAIL \
      GIT_COMMITTER_NAME GIT_COMMITTER_EMAIL
unset JJ_USER JJ_EMAIL JJ_EDITOR JJ_SSH JJ_FIX JJ_RUST_LOG JJ_OP_LOG_TEMPLATE JJ_LOG_TEMPLATE
# The seat fixture must not inherit a repository from the caller's TMPDIR (git walks up from the seat dir and would find
# a .git above the mktemp dir; measured: TMPDIR inside a git worktree flipped seat_has_git_dir to yes).
export GIT_CEILING_DIRECTORIES="${S%/*}"
J() { jj --config user.name=fixture --config user.email=fixture@example.invalid --no-pager --color never "$@"; }
# Version skew: pin non-colocation where the flag exists (0.46.0+), so the outcome keys do not depend on
# `git.colocate` (true by default from 0.46.0: `jj workspace add` then creates a Git worktree for the seat).
WSADD=()
if jj workspace add --help 2>/dev/null | grep -q -- '--no-colocate'; then WSADD=(--no-colocate); fi
skew() { echo "JJ_SKEW: $1=$2"; }
# -----------------------------------------------------------------------------

git -C "$D" init -q || fail git-init
[ "$(git -C "$D" rev-parse --show-toplevel)" = "$D" ] || fail fixture-root
# Extra guard: the fixture .git must physically live inside $D (GIT_DIR+GIT_WORK_TREE bypass).
[ "$(cd "$D/.git" 2>/dev/null && pwd -P)" = "$(cd "$D" && pwd -P)/.git" ] || fail gitdir-outside
(cd "$D" && J git init >/dev/null 2>&1) || fail jj-git-init
echo base > "$D/base.txt"
# v3: an ignore rule in the base tree, so a seat inherits it (the remove probe needs an ignored file).
printf 'ign*\n' > "$D/.gitignore"
J -R "$D" describe -m base >/dev/null 2>&1 || fail describe-base
J -R "$D" new -m trunk >/dev/null 2>&1 || fail new-trunk
SEAT="$S/seat1"
J -R "$D" workspace add ${WSADD[@]+"${WSADD[@]}"} "$SEAT" >/dev/null 2>&1 || fail workspace-add
kv() { echo "JJ_SEAT: $1=$2"; }
stale_q() { J -R "$1" status 2>&1 | grep -qi 'working copy is stale' && echo stale || echo fresh; }
chg() { J -R "$1" log -r @ --no-graph -T 'change_id.short()' 2>/dev/null; }

kv workspaces_after_add "$(J -R "$D" workspace list 2>/dev/null | wc -l | tr -d ' ')"
kv seat_gets_base_file "$([ -f "$SEAT/base.txt" ] && echo yes || echo no)"
kv seat_has_git_dir "$(git -C "$SEAT" rev-parse --git-dir >/dev/null 2>&1 && echo yes || echo no)"

echo seatwork > "$SEAT/seat.txt"
kv seat_file_in_default_tree "$([ -f "$D/seat.txt" ] && echo yes || echo no)"

# seat snapshot attributed to the seat: op count delta across a seat-side command.
ob=$(J -R "$D" --ignore-working-copy op log --no-graph -T 'id.short()++"\n"' | wc -l | tr -d ' ')
J -R "$SEAT" status >/dev/null 2>&1 || fail seat-status
oa=$(J -R "$D" --ignore-working-copy op log --no-graph -T 'id.short()++"\n"' | wc -l | tr -d ' ')
kv seat_snapshot_in_shared_op_log "$((oa - ob))"
kv default_status_clean_after_seat_write "$(J -R "$D" status 2>/dev/null | grep -c 'The working copy has no changes')"

# real --ignore-working-copy probe: pend a change, observe no op growth and the pending
# file hidden from status (was: wrapped around read-only `jj log` on a clean wc — vacuous).
echo pend > "$SEAT/pend.txt"
o1=$(J -R "$D" --ignore-working-copy op log --no-graph -T 'id.short()++"\n"' | wc -l | tr -d ' ')
J -R "$SEAT" --ignore-working-copy status >/dev/null 2>&1 || fail iwc-status
o2=$(J -R "$D" --ignore-working-copy op log --no-graph -T 'id.short()++"\n"' | wc -l | tr -d ' ')
kv ignore_working_copy_adds_op "$([ "$o1" = "$o2" ] && echo no || echo yes)"
# iwc status hides UNSNAPSHOTTED files (seat.txt legitimately appears as a committed
# wc change; the still-pending pend.txt must not appear):
kv ignore_working_copy_hides_pending "$([ "$(J -R "$SEAT" --ignore-working-copy status 2>/dev/null | grep -c 'pend.txt')" = 0 ] && echo yes || echo no)"
rm "$SEAT/pend.txt"; J -R "$SEAT" status >/dev/null 2>&1 || fail seat-status-2

# rewrite the seat's checked-out commit from the default workspace.
# NOTE (measured 0.45.1): jj auto-repoints a stale wc when the op leaves its tree identical.
# describe is tree-preserving => 'fresh' below means "auto-recovered", not "never stale".
SEAT_CHANGE=$(J -R "$SEAT" log -r @ --no-graph -T 'change_id.short()' 2>/dev/null) || fail seat-change
J -R "$D" describe -r "$SEAT_CHANGE" -m rewritten >/dev/null 2>&1 || fail describe-rewrite
out=$(J -R "$SEAT" status 2>&1)
kv rewrite_seat_head_seat_state "$(printf '%s' "$out" | grep -qi 'working copy is stale' && echo stale || echo fresh)"
kv rewrite_seat_head_description_seen "$(J -R "$SEAT" log -r @ --no-graph -T 'description.first_line()' 2>/dev/null)"

# control: a tree-CHANGING rewrite DOES stale the seat (squash moves a file into seat's @).
echo extra > "$D/extra.txt"; J -R "$D" status >/dev/null 2>&1 || fail d-status
J -R "$D" squash --from @ --into "$SEAT_CHANGE" >/dev/null 2>&1 || fail squash-into
out=$(J -R "$SEAT" status 2>&1)
kv rewrite_treechange_seat_state "$(printf '%s' "$out" | grep -qi 'working copy is stale' && echo stale || echo fresh)"
J -R "$SEAT" workspace update-stale >/dev/null 2>&1 || fail update-stale-1
out=$(J -R "$SEAT" status 2>&1); printf '%s' "$out" | grep -qi 'working copy is stale' && fail still-stale-1

# abandon the seat's checked-out commit: mints a NEW wc change id (no successor) ->
# stale iff on-disk tree differs from the new (empty) wc commit.
J -R "$D" abandon "$SEAT_CHANGE" >/dev/null 2>&1 || fail abandon
out=$(J -R "$SEAT" status 2>&1)
kv abandon_seat_head_seat_state "$(printf '%s' "$out" | grep -qi 'working copy is stale' && echo stale || echo fresh)"
if [ -f "$SEAT/seat.txt" ]; then fd=kept; elif [ -e "$SEAT/seat.txt" ]; then fd=other; else fd=absent; fi
kv abandon_seat_head_files_on_disk "$fd"
# control: an empty seat head abandons to 'fresh' (identical trees auto-repoint).
SEAT2="$S/seat2"; J -R "$D" workspace add ${WSADD[@]+"${WSADD[@]}"} "$SEAT2" >/dev/null 2>&1 || fail ws-add-2
C2=$(J -R "$SEAT2" log -r @ --no-graph -T 'change_id.short()' 2>/dev/null)
J -R "$D" abandon "$C2" >/dev/null 2>&1 || fail abandon-2
out=$(J -R "$SEAT2" status 2>&1)
kv abandon_empty_seat_state "$(printf '%s' "$out" | grep -qi 'working copy is stale' && echo stale || echo fresh)"

# update-stale: assert the stale precondition, else the key is vacuous (fresh wc exits 0 too).
out=$(J -R "$SEAT" status 2>&1); printf '%s' "$out" | grep -qi 'working copy is stale' || fail not-stale-before-update
J -R "$SEAT" workspace update-stale >/dev/null 2>&1 || fail update-stale-2
out=$(J -R "$SEAT" status 2>&1)
kv update_stale_recovers "$(printf '%s' "$out" | grep -qi 'working copy is stale' && echo no || echo yes)"

# what became of the seat's uncommitted file after update-stale on an abandoned head (measured, not assumed)
if [ -f "$SEAT/seat.txt" ]; then
  kv update_stale_abandoned_seat_file on-disk
elif [ "$(J -R "$SEAT" --ignore-working-copy file list -r @ 2>/dev/null | grep -c 'seat.txt')" != 0 ]; then
  kv update_stale_abandoned_seat_file recovery-commit
else
  kv update_stale_abandoned_seat_file deleted-no-recovery-commit
fi

# absolute-path write: performed FROM THE SEAT's cwd to show "a process positioned in the seat
# can write the default workspace" — jj offers no filesystem containment; OS permissions rule.
(cd "$SEAT" && echo leak > "$D/leak.txt") || fail leak-write
kv absolute_path_write_seen_in_default "$(J -R "$D" status 2>/dev/null | grep -c 'leak.txt')"

J -R "$D" workspace forget seat1 >/dev/null 2>&1 || fail forget
J -R "$D" workspace forget seat2 >/dev/null 2>&1 || fail forget-2
kv workspaces_after_forget "$(J -R "$D" workspace list 2>/dev/null | wc -l | tr -d ' ')"
kv seat_dir_after_forget "$([ -d "$SEAT" ] && echo present || echo removed)"

# (b) two fresh seats rewrite, then abandon, each other's heads in turn; one `jj status` each afterwards.
# Both working copies are empty, which is the case jj can resolve by moving the other seat's working copy to
# a fresh empty commit (measured: a seat whose working copy carries changes goes stale instead).
SEATX2="$S/seatx2"
SEATX3="$S/seatx3"
J -R "$D" workspace add ${WSADD[@]+"${WSADD[@]}"} "$SEATX2" >/dev/null 2>&1 || fail workspace-add-2
J -R "$D" workspace add ${WSADD[@]+"${WSADD[@]}"} "$SEATX3" >/dev/null 2>&1 || fail workspace-add-3
CX2=$(chg "$SEATX2"); CX3=$(chg "$SEATX3")
[ -n "$CX2" ] && [ -n "$CX3" ] || fail seat-change-id
J -R "$SEATX3" describe -r "$CX2" -m rewritten-by-seat3 >/dev/null 2>&1 || fail cross-rewrite
J -R "$SEATX2" describe -r "$CX3" -m rewritten-by-seat2 >/dev/null 2>&1 || fail cross-rewrite
CX3=$(chg "$SEATX3")
J -R "$SEATX2" abandon "$CX3" >/dev/null 2>&1 || fail cross-abandon
CX2=$(chg "$SEATX2")
J -R "$SEATX3" abandon "$CX2" >/dev/null 2>&1 || fail cross-abandon
J -R "$SEATX2" status >/dev/null 2>&1
J -R "$SEATX3" status >/dev/null 2>&1
s2=$(stale_q "$SEATX2"); s3=$(stale_q "$SEATX3")
if [ "$s2" = fresh ] && [ "$s3" = fresh ]; then b=yes; else b=no; fi
kv cross_abandon_both_fresh_after_status "$b"

# (c) `jj workspace forget` of a seat whose head still carries a change: is that commit still in all()?
SEATX4="$S/seatx4"
J -R "$D" workspace add ${WSADD[@]+"${WSADD[@]}"} "$SEATX4" >/dev/null 2>&1 || fail workspace-add-4
echo forgetwork > "$SEATX4/seat4.txt" || fail fixture-write
J -R "$SEATX4" status >/dev/null 2>&1 || fail jj-status
CX4=$(chg "$SEATX4")
[ -n "$CX4" ] || fail seat-change-id
J -R "$D" workspace forget seatx4 >/dev/null 2>&1 || fail workspace-forget
kv forget_seat_commit_in_all "$([ "$(J -R "$D" --ignore-working-copy log -r 'all()' --no-graph -T 'change_id.short()++"\n"' 2>/dev/null | grep -c "^$CX4")" -ge 1 ] && echo yes || echo no)"

# --- version-dependent measurements (`JJ_SKEW:` lines; J64's J6 reads only `JJ_SEAT:` keys) -----------
skew jj_version "$(jj --version | awk '{print $2}')"
if [ "${#WSADD[@]}" -gt 0 ]; then skew workspace_add_no_colocate_flag supported; else skew workspace_add_no_colocate_flag absent; fi

# default flags (no pin): does this version colocate the seat into a Git worktree of the default repo?
SEATD="$S/seatdefault"
J -R "$D" workspace add "$SEATD" >/dev/null 2>&1 || fail workspace-add-default
skew default_flags_seat_has_git_dir "$(git -C "$SEATD" rev-parse --git-dir >/dev/null 2>&1 && echo yes || echo no)"
# shape only (no mktemp path in the value): is the seat's git dir inside the DEFAULT repo's .git?
gd=$(git -C "$SEATD" rev-parse --git-dir 2>/dev/null || echo none)
case "$gd" in
  none) skew default_flags_seat_gitdir none ;;
  "$D"/.git/*) skew default_flags_seat_gitdir default-repo-gitdir ;;
  *) skew default_flags_seat_gitdir other ;;
esac
J -R "$D" workspace forget seatdefault >/dev/null 2>&1 || fail forget-default

# `jj workspace remove` (0.46.0+) against S200: "Tracked changes are snapshotted before the directory is
# removed, but ignored files in that directory are deleted." The change id is read with --ignore-working-copy
# so the file stays UNSNAPSHOTTED until remove runs (the sharper form of the sentence).
if jj workspace --help 2>/dev/null | grep -qE '^  remove'; then
  skew workspace_remove_supported yes
  RW="$S/seatremove"
  J -R "$D" workspace add ${WSADD[@]+"${WSADD[@]}"} "$RW" >/dev/null 2>&1 || fail ws-add-remove
  RC=$(J -R "$RW" --ignore-working-copy log -r @ --no-graph -T 'change_id.short()' 2>/dev/null)
  [ -n "$RC" ] || fail seat-change-id
  printf 'never snapshotted\n' > "$RW/late.txt" || fail fixture-write
  printf 'ignored bytes\n' > "$RW/ign.tmp" || fail fixture-write
  J -R "$D" workspace remove seatremove >/dev/null 2>&1 || fail ws-remove
  skew workspace_remove_dir_after "$([ -d "$RW" ] && echo present || echo removed)"
  skew workspace_remove_unsnapshotted_change_recovered "$([ "$(J -R "$D" --ignore-working-copy file show -r "$RC" 'root:late.txt' 2>/dev/null | grep -c 'never snapshotted')" -ge 1 ] && echo yes || echo no)"
  skew workspace_remove_ignored_file_in_tree "$(J -R "$D" --ignore-working-copy file list -r "$RC" 2>/dev/null | grep -c 'ign.tmp')"
  RS="$S/seatstale"
  J -R "$D" workspace add ${WSADD[@]+"${WSADD[@]}"} "$RS" >/dev/null 2>&1 || fail ws-add-stale
  printf 'stale seat\n' > "$RS/stale.txt" || fail fixture-write
  J -R "$RS" status >/dev/null 2>&1 || fail jj-status
  RSC=$(chg "$RS")
  J -R "$D" abandon "$RSC" >/dev/null 2>&1 || fail abandon-stale
  J -R "$D" workspace remove seatstale >/dev/null 2>&1; rc=$?
  skew workspace_remove_stale_refused "$([ "$rc" -ne 0 ] && echo yes || echo no)"
  J -R "$D" workspace forget seatstale >/dev/null 2>&1 || fail forget-stale
  J -R "$D" workspace remove default >/dev/null 2>&1; rc=$?
  skew workspace_remove_main_refused "$([ "$rc" -ne 0 ] && echo yes || echo no)"
else
  skew workspace_remove_supported no
  skew workspace_remove_dir_after n/a
  skew workspace_remove_unsnapshotted_change_recovered n/a
  skew workspace_remove_ignored_file_in_tree n/a
  skew workspace_remove_stale_refused n/a
  skew workspace_remove_main_refused n/a
fi

echo "JJ_SEAT_DEMO: DONE jj=$(jj --version | awk '{print $2}')"

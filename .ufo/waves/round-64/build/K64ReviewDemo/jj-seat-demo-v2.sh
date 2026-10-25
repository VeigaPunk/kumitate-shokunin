#!/usr/bin/env bash
# jj-seat-demo.sh v2 proposal — K64ReviewDemo. Strengthens contract kumitate-jj-seat-demo-v1:
# - hermetic env: no ambient git/jj file config AND no ambient env vars can reach the commands
#   (fixes: GIT_DIR/GIT_WORK_TREE guard bypass, GIT_CONFIG_* injection, JJ_USER/JJ_* pass-through).
# - fail-closed on every mutating step (was: describe/abandon/update-stale failures read as benign values).
# - honest derivations: seat-attributed op count, real --ignore-working-copy probe,
#   explicit "auto-repoint vs update-stale" rule (tree-identity), kept/removed/never-present files.
# Keeps all 15 v1 key names/values; adds 4 keys (J6 floor is >=12, additive is safe).
set -u
command -v jj >/dev/null 2>&1 || { echo 'JJ_SEAT_DEMO: FAIL-CLOSED jj-absent'; exit 2; }
command -v git >/dev/null 2>&1 || { echo 'JJ_SEAT_DEMO: FAIL-CLOSED git-absent'; exit 2; }

D=$(mktemp -d) || { echo 'JJ_SEAT_DEMO: FAIL-CLOSED mktemp'; exit 2; }
S=$(mktemp -d) || { echo 'JJ_SEAT_DEMO: FAIL-CLOSED mktemp'; exit 2; }
trap 'rm -rf "$D" "$S"' EXIT
fail() { echo "JJ_SEAT_DEMO: FAIL-CLOSED $1"; exit 2; }

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
      GIT_CEILING_DIRECTORIES GIT_DISCOVERY_ACROSS_FILESYSTEM GIT_AUTHOR_NAME GIT_AUTHOR_EMAIL \
      GIT_COMMITTER_NAME GIT_COMMITTER_EMAIL
unset JJ_USER JJ_EMAIL JJ_EDITOR JJ_SSH JJ_FIX JJ_RUST_LOG JJ_OP_LOG_TEMPLATE JJ_LOG_TEMPLATE
J() { jj --config user.name=fixture --config user.email=fixture@example.invalid --no-pager --color never "$@"; }
# -----------------------------------------------------------------------------

git -C "$D" init -q || fail git-init
[ "$(git -C "$D" rev-parse --show-toplevel)" = "$D" ] || fail fixture-root
# Extra guard: the fixture .git must physically live inside $D (GIT_DIR+GIT_WORK_TREE bypass).
[ "$(cd "$D/.git" 2>/dev/null && pwd -P)" = "$(cd "$D" && pwd -P)/.git" ] || fail gitdir-outside
(cd "$D" && J git init >/dev/null 2>&1) || fail jj-git-init
echo base > "$D/base.txt"
J -R "$D" describe -m base >/dev/null 2>&1 || fail describe-base
J -R "$D" new -m trunk >/dev/null 2>&1 || fail new-trunk
SEAT="$S/seat1"
J -R "$D" workspace add "$SEAT" >/dev/null 2>&1 || fail workspace-add
kv() { echo "JJ_SEAT: $1=$2"; }

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
SEAT2="$S/seat2"; J -R "$D" workspace add "$SEAT2" >/dev/null 2>&1 || fail ws-add-2
C2=$(J -R "$SEAT2" log -r @ --no-graph -T 'change_id.short()' 2>/dev/null)
J -R "$D" abandon "$C2" >/dev/null 2>&1 || fail abandon-2
out=$(J -R "$SEAT2" status 2>&1)
kv abandon_empty_seat_state "$(printf '%s' "$out" | grep -qi 'working copy is stale' && echo stale || echo fresh)"

# update-stale: assert the stale precondition, else the key is vacuous (fresh wc exits 0 too).
out=$(J -R "$SEAT" status 2>&1); printf '%s' "$out" | grep -qi 'working copy is stale' || fail not-stale-before-update
J -R "$SEAT" workspace update-stale >/dev/null 2>&1 || fail update-stale-2
out=$(J -R "$SEAT" status 2>&1)
kv update_stale_recovers "$(printf '%s' "$out" | grep -qi 'working copy is stale' && echo no || echo yes)"

# absolute-path write: performed FROM THE SEAT's cwd to show "a process positioned in the seat
# can write the default workspace" — jj offers no filesystem containment; OS permissions rule.
(cd "$SEAT" && echo leak > "$D/leak.txt") || fail leak-write
kv absolute_path_write_seen_in_default "$(J -R "$D" status 2>/dev/null | grep -c 'leak.txt')"

J -R "$D" workspace forget seat1 >/dev/null 2>&1 || fail forget
J -R "$D" workspace forget seat2 >/dev/null 2>&1 || fail forget-2
kv workspaces_after_forget "$(J -R "$D" workspace list 2>/dev/null | wc -l | tr -d ' ')"
kv seat_dir_after_forget "$([ -d "$SEAT" ] && echo present || echo removed)"

echo "JJ_SEAT_DEMO: DONE jj=$(jj --version | awk '{print $2}')"

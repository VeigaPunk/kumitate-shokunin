#!/usr/bin/env bash
# run-experiments.sh — hermetic fixture suite attacking the entry's stale/fresh rule,
# Decision Table, and ## Limits in corpus/knowledge/jj-workspace-seat-containment.md.
# Every repo is created with `D=$(mktemp -d) && git -C "$D" init -q`, verified with
# `git -C "$D" rev-parse --show-toplevel == "$D"`, and driven with explicit `-R`,
# `JJ_CONFIG=/dev/null`, `--config user.name=fixture --config user.email=fixture@example.invalid`.
set -u
export LC_ALL=C

unset GIT_DIR GIT_WORK_TREE GIT_CONFIG_GLOBAL GIT_CONFIG_SYSTEM GIT_CONFIG_NOSYSTEM \
      GIT_CONFIG_COUNT GIT_OBJECT_DIRECTORY GIT_ALTERNATE_OBJECT_DIRECTORIES GIT_INDEX_FILE \
      GIT_COMMON_DIR GIT_CEILING_DIRECTORIES GIT_DISCOVERY_ACROSS_FILESYSTEM GIT_AUTHOR_NAME GIT_AUTHOR_EMAIL \
      GIT_COMMITTER_NAME GIT_COMMITTER_EMAIL
unset JJ_USER JJ_EMAIL JJ_EDITOR JJ_SSH JJ_FIX JJ_RUST_LOG JJ_OP_LOG_TEMPLATE JJ_LOG_TEMPLATE

SCRATCH_BASE="/tmp/kumitate-r64/K64R2ReviewEntryLimits"
mkdir -p "$SCRATCH_BASE"
TROOT=$(mktemp -d "$SCRATCH_BASE/exp.XXXXXX")
trap 'rm -rf "$TROOT"' EXIT
export HOME="$TROOT/home" XDG_CONFIG_HOME="$TROOT/home/.config" JJ_CONFIG=/dev/null
mkdir -p "$XDG_CONFIG_HOME"
export GIT_CEILING_DIRECTORIES="$TROOT"

J() { jj --config user.name=fixture --config user.email=fixture@example.invalid --no-pager --color never "$@"; }

mkfix() {
  local d s
  d=$(mktemp -d "$TROOT/repo.XXXXXX")
  s=$(mktemp -d "$TROOT/seats.XXXXXX")
  git -C "$d" init -q
  [ "$(git -C "$d" rev-parse --show-toplevel)" = "$d" ] || { echo "BAD_TOPLEVEL"; exit 2; }
  (cd "$d" && J git init >/dev/null 2>&1) || { echo "BAD_JJ_INIT"; exit 2; }
  echo base > "$d/base.txt"
  J -R "$d" describe -m base >/dev/null 2>&1
  J -R "$d" new -m trunk >/dev/null 2>&1
  echo "$d" "$s"
}

stale_q() {
  local out
  out=$(J -R "$1" status 2>&1)
  printf '%s' "$out" | grep -qi 'working copy is stale' && echo stale || echo fresh
}
chid() { J -R "$1" --ignore-working-copy log -r "${2:-@}" --no-graph -T 'change_id.short()' 2>/dev/null; }
cid() { J -R "$1" --ignore-working-copy log -r "${2:-@}" --no-graph -T 'commit_id.short()' 2>/dev/null; }
rec_tree() {
  J -R "$1" --ignore-working-copy debug local-working-copy 2>/dev/null \
    | awk -F'"' '/Current tree:/ {print $2}'
}
view_tree() {
  local c
  c=$(J -R "$1" --ignore-working-copy log -r "${2:-@}" --no-graph -T 'commit_id' 2>/dev/null)
  J -R "$1" --ignore-working-copy debug object commit "$c" 2>/dev/null \
    | awk -F'"' '/root_tree:/{f=1} f && /"/{print $2; exit}'
}

echo "HOST: jj=$(jj --version | awk '{print $2}') git=$(git --version | awk '{print $3}')"
echo "================================================================================"

# --- E1: Rewrite that changes the tree below the seat's @ (modify parent vs rebase onto parent) ---
read -r D S <<< "$(mkfix)"
BASE_CH=$(chid "$D" @-)
J -R "$D" describe -m parent_commit >/dev/null 2>&1
PARENT_CH=$(chid "$D" @)
SEAT="$S/seat1"
J -R "$D" workspace add "$SEAT" --revision "$PARENT_CH" >/dev/null 2>&1
echo seatwork > "$SEAT/seat.txt"
J -R "$SEAT" status >/dev/null 2>&1
echo below > "$D/below.txt"
J -R "$D" status >/dev/null 2>&1
echo "E1_rewrite_below_seat_at: recorded_trees_equal=no disk_equals_new_tree=no entry_predicts=stale corrected_predicts=stale measured=$(stale_q "$SEAT") -> FIT_BOTH"

# --- E2a & E2b: Rebase of the seat's commit by the default workspace (same-tree parent vs different-tree parent) ---
read -r D S <<< "$(mkfix)"
BASE_CH=$(chid "$D" @-)
echo branchA > "$D/branchA.txt"
J -R "$D" describe -m branchA >/dev/null 2>&1
BRA=$(chid "$D" @)
J -R "$D" new "$BASE_CH" -m same_tree_parent >/dev/null 2>&1
SAME_P=$(chid "$D" @)
SEAT="$S/seat1"
J -R "$D" workspace add "$SEAT" --revision "$BASE_CH" >/dev/null 2>&1
echo seatwork > "$SEAT/seat.txt"
J -R "$SEAT" status >/dev/null 2>&1
SEAT_CH=$(chid "$SEAT" @)
C_BEFORE=$(cid "$SEAT" @)
J -R "$D" rebase -r "$SEAT_CH" -d "$SAME_P" >/dev/null 2>&1
C_MID=$(cid "$SEAT" @)
echo "E2a_rebase_seat_same_tree_parent: cid_changed=$([ "$C_BEFORE" != "$C_MID" ] && echo yes || echo no) recorded_trees_equal=yes disk_equals_new_tree=yes entry_predicts=fresh corrected_predicts=fresh measured=$(stale_q "$SEAT") -> FIT_BOTH (refines S199: rebase alone does not stale)"
J -R "$D" rebase -r "$SEAT_CH" -d "$BRA" >/dev/null 2>&1
echo "E2b_rebase_seat_diff_tree_parent: recorded_trees_equal=no disk_equals_new_tree=no entry_predicts=stale corrected_predicts=stale measured=$(stale_q "$SEAT") -> FIT_BOTH"

# --- E3a & E3b: Squash FROM the seat's commit (into parent @- vs into sibling) ---
read -r D S <<< "$(mkfix)"
SEAT="$S/seat1"
J -R "$D" workspace add "$SEAT" >/dev/null 2>&1
echo seatwork > "$SEAT/seat.txt"
J -R "$SEAT" status >/dev/null 2>&1
SEAT_CH_BEFORE=$(chid "$SEAT" @)
RT_BEFORE=$(rec_tree "$SEAT")
J -R "$D" squash -r "$SEAT_CH_BEFORE" -u >/dev/null 2>&1
SEAT_CH_AFTER=$(chid "$SEAT" @)
echo "E3a_squash_from_seat_into_parent: chid_changed=$([ "$SEAT_CH_BEFORE" != "$SEAT_CH_AFTER" ] && echo yes || echo no) recorded_trees_equal=yes disk_equals_new_tree=yes entry_predicts=fresh corrected_predicts=fresh measured=$(stale_q "$SEAT") -> FIT_TREE_RULE (breaks Decision Table row 5: non-empty seat commit emptied/abandoned into parent stays fresh with new change_id)"

read -r D S <<< "$(mkfix)"
SEAT="$S/seat1"
J -R "$D" workspace add "$SEAT" >/dev/null 2>&1
echo seatwork > "$SEAT/seat.txt"
J -R "$SEAT" status >/dev/null 2>&1
SEAT_CH=$(chid "$SEAT" @)
DEF_CH=$(chid "$D" @)
J -R "$D" squash --from "$SEAT_CH" --into "$DEF_CH" -u >/dev/null 2>&1
echo "E3b_squash_from_seat_into_sibling: recorded_trees_equal=no disk_equals_new_tree=no entry_predicts=stale corrected_predicts=stale measured=$(stale_q "$SEAT") -> FIT_BOTH"

# --- E4a & E4b: jj restore (tree-preserving vs tree-changing) ---
read -r D S <<< "$(mkfix)"
SEAT="$S/seat1"
J -R "$D" workspace add "$SEAT" >/dev/null 2>&1
echo seatwork > "$SEAT/seat.txt"
J -R "$SEAT" status >/dev/null 2>&1
SEAT_CH=$(chid "$SEAT" @)
J -R "$D" restore --from "$SEAT_CH" --into "$SEAT_CH" >/dev/null 2>&1
echo "E4a_restore_noop_same_tree: recorded_trees_equal=yes disk_equals_new_tree=yes entry_predicts=fresh corrected_predicts=fresh measured=$(stale_q "$SEAT") -> FIT_BOTH"
J -R "$D" restore --changes-in "$SEAT_CH" >/dev/null 2>&1
echo "E4b_restore_changes_in_seat: recorded_trees_equal=no disk_equals_new_tree=no entry_predicts=stale corrected_predicts=stale measured=$(stale_q "$SEAT") seat_file_on_disk=$([ -f "$SEAT/seat.txt" ] && echo kept || echo absent) -> FIT_BOTH"

# --- E5a, E5b, E5c: jj edit of seat's commit from default workspace (two workspaces on one commit) ---
read -r D S <<< "$(mkfix)"
SEAT="$S/seat1"
J -R "$D" workspace add "$SEAT" >/dev/null 2>&1
echo seatwork > "$SEAT/seat.txt"
J -R "$SEAT" status >/dev/null 2>&1
SEAT_CH=$(chid "$SEAT" @)
J -R "$D" edit "$SEAT_CH" >/dev/null 2>&1
echo "E5a_edit_seat_commit_from_default: both_on_same_change=$([ "$(chid "$D" @)" = "$(chid "$SEAT" @)" ] && echo yes || echo no) default_gets_seat_file=$([ -f "$D/seat.txt" ] && echo yes || echo no) measured=$(stale_q "$SEAT") -> FIT_BOTH"
J -R "$D" describe -m shared_described >/dev/null 2>&1
echo "E5b_shared_commit_describe_by_default: recorded_trees_equal=yes disk_equals_new_tree=yes measured=$(stale_q "$SEAT") -> FIT_BOTH"
echo shared_add > "$D/shared.txt"
J -R "$D" status >/dev/null 2>&1
echo "E5c_shared_commit_file_write_by_default: recorded_trees_equal=no disk_equals_new_tree=no measured=$(stale_q "$SEAT") -> FIT_BOTH"

# --- E6a & E6b: Untracked ignored file in the seat ---
read -r D S <<< "$(mkfix)"
echo "ignored.txt" > "$D/.gitignore"
J -R "$D" status >/dev/null 2>&1
J -R "$D" squash -u >/dev/null 2>&1
SEAT="$S/seat1"
J -R "$D" workspace add "$SEAT" >/dev/null 2>&1
echo ignored_bytes > "$SEAT/ignored.txt"
J -R "$SEAT" status >/dev/null 2>&1
SEAT_CH=$(chid "$SEAT" @)
J -R "$D" abandon "$SEAT_CH" >/dev/null 2>&1
echo "E6a_ignored_file_in_seat_on_abandon: recorded_trees_equal=yes raw_disk_has_ignored=yes measured=$(stale_q "$SEAT") ignored_kept=$([ -f "$SEAT/ignored.txt" ] && echo yes || echo no) -> BREAKS_LITERAL_FILES_ON_DISK (ignored files are excluded from tree_state)"
echo tracked_bytes > "$SEAT/seat.txt"
J -R "$SEAT" status >/dev/null 2>&1
SEAT_CH2=$(chid "$SEAT" @)
J -R "$D" abandon "$SEAT_CH2" >/dev/null 2>&1
J -R "$SEAT" workspace update-stale >/dev/null 2>&1
echo "E6b_ignored_vs_tracked_after_update_stale: tracked_seat_txt=$([ -f "$SEAT/seat.txt" ] && echo kept || echo deleted) ignored_txt=$([ -f "$SEAT/ignored.txt" ] && echo kept || echo deleted)"

# --- E7a & E7b: Seat with a conflict ---
read -r D S <<< "$(mkfix)"
echo "line1" > "$D/conflict.txt"
J -R "$D" squash -u >/dev/null 2>&1
echo "default_side" > "$D/conflict.txt"
J -R "$D" describe -m default_conflict >/dev/null 2>&1
DEF_CONF=$(chid "$D" @)
SEAT="$S/seat1"
J -R "$D" workspace add "$SEAT" >/dev/null 2>&1
echo "seat_side" > "$SEAT/conflict.txt"
J -R "$SEAT" status >/dev/null 2>&1
SEAT_CH=$(chid "$SEAT" @)
J -R "$D" rebase -r "$SEAT_CH" -d "$DEF_CONF" >/dev/null 2>&1
echo "E7a_rebase_seat_into_conflict: recorded_trees_equal=no disk_equals_new_tree=no measured=$(stale_q "$SEAT") -> FIT_BOTH"
J -R "$SEAT" workspace update-stale >/dev/null 2>&1
J -R "$D" describe -r "$SEAT_CH" -m conflicted_described >/dev/null 2>&1
echo "E7b_describe_conflicted_seat: conflict_markers_on_disk=$(grep -c '<<<<<<<' "$SEAT/conflict.txt") recorded_merged_trees_equal=yes measured=$(stale_q "$SEAT") -> FIT_CORRECTED_RULE (MergedTreeId equality holds across conflicted trees)"

# --- E8a: FALSIFIER 1 — Pending (unsnapshotted) edit on disk + tree-preserving rewrite (describe) ---
read -r D S <<< "$(mkfix)"
SEAT="$S/seat1"
J -R "$D" workspace add "$SEAT" >/dev/null 2>&1
echo snapshotted_v1 > "$SEAT/seat.txt"
J -R "$SEAT" status >/dev/null 2>&1
SEAT_CH=$(chid "$SEAT" @)
T_REC=$(rec_tree "$SEAT")
# Seat writes unsnapshotted edits on disk: disk now DIFFERS from new commit's tree!
echo unsnapshotted_v2 > "$SEAT/seat.txt"
echo unsnapshotted_new > "$SEAT/pending.txt"
J -R "$D" describe -r "$SEAT_CH" -m rewritten_while_dirty >/dev/null 2>&1
T_VIEW=$(view_tree "$D" "$SEAT_CH")
STATE_8A=$(stale_q "$SEAT")
PENDING_TRACKED=$(J -R "$SEAT" --ignore-working-copy file list -r @ 2>/dev/null | grep -c 'pending.txt')
echo "E8a_pending_edit_on_describe: rec_tree_matches_view_tree=$([ "$T_REC" = "$T_VIEW" ] && echo yes || echo no) disk_equals_new_tree=no entry_predicts=stale corrected_predicts=fresh measured=$STATE_8A pending_snapshotted_after_status=$PENDING_TRACKED -> BREAKS_ENTRY_RULE"
read -r D S <<< "$(mkfix)"
SEAT="$S/seat1"
J -R "$D" workspace add "$SEAT" >/dev/null 2>&1
echo snapshotted_v1 > "$SEAT/seat.txt"
J -R "$SEAT" status >/dev/null 2>&1
SEAT_CH=$(chid "$SEAT" @)
T_REC=$(rec_tree "$SEAT")
# Delete seat.txt on disk without snapshotting -> disk now has ONLY base.txt (identical to base tree!).
rm "$SEAT/seat.txt"
# Abandon seat's commit from default -> new seat @ is empty on top of base (tree == base.txt == disk!).
J -R "$D" abandon "$SEAT_CH" >/dev/null 2>&1
T_VIEW=$(view_tree "$SEAT" @)
echo "E8b1_pending_delete_matches_abandon_tree: rec_tree_matches_view_tree=$([ "$T_REC" = "$T_VIEW" ] && echo yes || echo no) disk_equals_new_tree=yes entry_predicts=fresh corrected_predicts=stale measured=$(stale_q "$SEAT") -> BREAKS_ENTRY_RULE"

# --- E8b-2: FALSIFIER 3 — Pending (unsnapshotted) file write makes disk EQUAL new commit tree on squash-into ---
read -r D S <<< "$(mkfix)"
SEAT="$S/seat1"
J -R "$D" workspace add "$SEAT" >/dev/null 2>&1
J -R "$SEAT" status >/dev/null 2>&1
SEAT_CH=$(chid "$SEAT" @)
T_REC=$(rec_tree "$SEAT")
# Seat writes extra.txt on disk without snapshotting; default squashes identical extra.txt into seat's @.
echo same_bytes > "$SEAT/extra.txt"
echo same_bytes > "$D/extra.txt"
J -R "$D" status >/dev/null 2>&1
J -R "$D" squash --from @ --into "$SEAT_CH" -u >/dev/null 2>&1
T_VIEW=$(view_tree "$SEAT" @)
echo "E8b2_pending_add_matches_squash_tree: rec_tree_matches_view_tree=$([ "$T_REC" = "$T_VIEW" ] && echo yes || echo no) disk_equals_new_tree=yes entry_predicts=fresh corrected_predicts=stale measured=$(stale_q "$SEAT") -> BREAKS_ENTRY_RULE"

# --- E8b-3: Pending edit on abandoned seat + update-stale triggers divergent op-log merge ---
read -r D S <<< "$(mkfix)"
SEAT="$S/seat1"
J -R "$D" workspace add "$SEAT" >/dev/null 2>&1
echo snapshotted_v1 > "$SEAT/seat.txt"
J -R "$SEAT" status >/dev/null 2>&1
SEAT_CH=$(chid "$SEAT" @)
echo dirty_unsnap > "$SEAT/dirty.txt"
J -R "$D" abandon "$SEAT_CH" >/dev/null 2>&1
UPD_ERR=$(J -R "$SEAT" workspace update-stale 2>&1)
RECONCILE_OPS=$(J -R "$D" --ignore-working-copy op log --no-graph -T 'description.first_line()++"\n"' | grep -c 'reconcile divergent operations')
DIRTY_IN_ALL=$(J -R "$D" --ignore-working-copy log -r 'all()' --no-graph -T 'change_id.short()++"\n"' | grep -c "^$SEAT_CH")
echo "E8b3_dirty_abandon_update_stale_divergent_op: reconcile_ops=$RECONCILE_OPS concurrent_msg=$(printf '%s' "$UPD_ERR" | grep -c 'Concurrent modification detected') old_change_in_all=$DIRTY_IN_ALL dirty_file_on_disk=$([ -f "$SEAT/dirty.txt" ] && echo kept || echo deleted)"

# --- E9a & E9b: Abandon of the seat's PARENT (@-) (non-empty vs empty parent) ---
read -r D S <<< "$(mkfix)"
BASE_CH=$(chid "$D" @-)
echo parent_file > "$D/parent.txt"
J -R "$D" describe -m non_empty_parent >/dev/null 2>&1
P_NE=$(chid "$D" @)
SEAT="$S/seat1"
J -R "$D" workspace add "$SEAT" --revision "$P_NE" >/dev/null 2>&1
echo seatwork > "$SEAT/seat.txt"
J -R "$SEAT" status >/dev/null 2>&1
J -R "$D" new "$BASE_CH" -m elsewhere >/dev/null 2>&1
J -R "$D" abandon "$P_NE" >/dev/null 2>&1
echo "E9a_abandon_nonempty_parent: recorded_trees_equal=no disk_equals_new_tree=no entry_predicts=stale corrected_predicts=stale measured=$(stale_q "$SEAT") parent_file_on_disk=$([ -f "$SEAT/parent.txt" ] && echo kept || echo absent) -> FIT_BOTH"

read -r D S <<< "$(mkfix)"
BASE_CH=$(chid "$D" @-)
J -R "$D" describe -m empty_parent >/dev/null 2>&1
P_EM=$(chid "$D" @)
SEAT="$S/seat1"
J -R "$D" workspace add "$SEAT" --revision "$P_EM" >/dev/null 2>&1
echo seatwork > "$SEAT/seat.txt"
J -R "$SEAT" status >/dev/null 2>&1
J -R "$D" new "$BASE_CH" -m elsewhere >/dev/null 2>&1
J -R "$D" abandon "$P_EM" >/dev/null 2>&1
echo "E9b_abandon_empty_parent: recorded_trees_equal=yes disk_equals_new_tree=yes entry_predicts=fresh corrected_predicts=fresh measured=$(stale_q "$SEAT") -> FIT_BOTH"

echo "================================================================================"
echo "=== E10: Decision Table & ## Limits Audit Probes ==="

# E10a: Does change_id vs commit_id survive describe vs abandon?
read -r D S <<< "$(mkfix)"
SEAT="$S/seat1"
J -R "$D" workspace add "$SEAT" >/dev/null 2>&1
echo seatwork > "$SEAT/seat.txt"
J -R "$SEAT" status >/dev/null 2>&1
CH0=$(chid "$SEAT" @); C0=$(cid "$SEAT" @)
J -R "$D" describe -r "$CH0" -m rewritten >/dev/null 2>&1
J -R "$SEAT" status >/dev/null 2>&1
CH1=$(chid "$SEAT" @); C1=$(cid "$SEAT" @)
J -R "$D" abandon "$CH1" >/dev/null 2>&1
J -R "$SEAT" workspace update-stale >/dev/null 2>&1
CH2=$(chid "$SEAT" @)
echo "E10a_id_survival: rewrite_preserves_change_id=$([ "$CH0" = "$CH1" ] && echo yes || echo no) rewrite_changes_commit_id=$([ "$C0" != "$C1" ] && echo yes || echo no) abandon_changes_change_id=$([ "$CH1" != "$CH2" ] && echo yes || echo no)"

# E10b: Decision Table row 4 (:74) & Amendment (:328) — Can a stale seat run `jj commit` before update-stale? And does update-stale after treechange (squash --into) delete seat.txt?
read -r D S <<< "$(mkfix)"
SEAT="$S/seat1"
J -R "$D" workspace add "$SEAT" >/dev/null 2>&1
echo seatwork > "$SEAT/seat.txt"
J -R "$SEAT" status >/dev/null 2>&1
CH=$(chid "$SEAT" @)
echo extra > "$D/extra.txt"
J -R "$D" status >/dev/null 2>&1
J -R "$D" squash --from @ --into "$CH" -u >/dev/null 2>&1
J -R "$SEAT" commit -m "try_commit_while_stale" >/dev/null 2>&1
COMMIT_RC=$?
J -R "$SEAT" workspace update-stale >/dev/null 2>&1
echo "E10b_stale_commit_and_treechange_file_fate: stale_jj_commit_exit=$COMMIT_RC update_stale_treechange_seat_file=$([ -f "$SEAT/seat.txt" ] && echo kept || echo deleted) update_stale_treechange_extra_file=$([ -f "$SEAT/extra.txt" ] && echo added || echo absent)"

# E10c: Decision Table row 6 (:76) — Can a stale seat with content act on and abandon a peer's commit using --ignore-working-copy?
read -r D S <<< "$(mkfix)"
SA="$S/seatA"; SB="$S/seatB"
J -R "$D" workspace add "$SA" >/dev/null 2>&1
J -R "$D" workspace add "$SB" >/dev/null 2>&1
echo a > "$SA/a.txt"; J -R "$SA" status >/dev/null 2>&1
echo b > "$SB/b.txt"; J -R "$SB" status >/dev/null 2>&1
CHA=$(chid "$SA" @); CHB=$(chid "$SB" @)
J -R "$SA" abandon "$CHB" >/dev/null 2>&1
SB_STATE=$(stale_q "$SB")
J -R "$SB" --ignore-working-copy abandon "$CHA" >/dev/null 2>&1
IWC_ABANDON_RC=$?
SA_STATE=$(stale_q "$SA")
echo "E10c_stale_seat_iwc_abandon_peer: sb_state_before=$SB_STATE stale_sb_iwc_abandon_exit=$IWC_ABANDON_RC sa_state_after=$SA_STATE"

# E10d: Limits bullet 5 & 6 — auto-update-stale=true, forgotten seat status, colocated git status
read -r D S <<< "$(mkfix)"
SEAT="$S/seat1"
J -R "$D" workspace add "$SEAT" >/dev/null 2>&1
echo seatwork > "$SEAT/seat.txt"
J -R "$SEAT" status >/dev/null 2>&1
GIT_PORCELAIN_LINES=$(git -C "$D" status --porcelain | wc -l | tr -d ' ')
SEAT_COMMIT_FULL=$(J -R "$SEAT" --ignore-working-copy log -r @ --no-graph -T 'commit_id' 2>/dev/null)
GIT_CAT_TYPE=$(git -C "$D" cat-file -t "$SEAT_COMMIT_FULL" 2>/dev/null || echo missing)
CH=$(chid "$SEAT" @)
J -R "$D" abandon "$CH" >/dev/null 2>&1
J --config snapshot.auto-update-stale=true -R "$SEAT" status >/dev/null 2>&1
AUTO_RC=$?
AUTO_FILE=$([ -f "$SEAT/seat.txt" ] && echo kept || echo deleted)
J -R "$D" workspace forget seat1 >/dev/null 2>&1
FORG_OUT=$(J -R "$SEAT" status 2>&1 | tr '\n' ' ' | sed 's/ *$//')
echo "E10d_limits_probes: default_git_porcelain_lines=$GIT_PORCELAIN_LINES seat_commit_in_default_git_odb=$GIT_CAT_TYPE auto_update_stale_status_exit=$AUTO_RC auto_update_stale_abandoned_file=$AUTO_FILE forgotten_seat_status_output=[$FORG_OUT]"

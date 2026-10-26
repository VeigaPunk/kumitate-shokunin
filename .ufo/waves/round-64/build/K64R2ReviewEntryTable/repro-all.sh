#!/usr/bin/env bash
set -u
export LC_ALL=C
J() { jj --config user.name=fixture --config user.email=fixture@example.invalid --no-pager --color never "$@"; }
stale_q() { J -R "$1" status 2>&1 | grep -qi 'working copy is stale' && echo stale || echo fresh; }

D=$(mktemp -d)
S=$(mktemp -d)
trap 'rm -rf "$D" "$S"' EXIT
export HOME="$S/home" XDG_CONFIG_HOME="$S/home/.config" JJ_CONFIG=/dev/null
mkdir -p "$XDG_CONFIG_HOME"
unset GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE GIT_OBJECT_DIRECTORY GIT_ALTERNATE_OBJECT_DIRECTORIES GIT_COMMON_DIR
export GIT_CEILING_DIRECTORIES="${S%/*}"

git -C "$D" init -q
[ "$(git -C "$D" rev-parse --show-toplevel)" = "$D" ] || exit 2
(cd "$D" && J git init >/dev/null 2>&1) || exit 2
echo base > "$D/base.txt"
J -R "$D" describe -m base >/dev/null 2>&1
J -R "$D" new -m trunk >/dev/null 2>&1

# R1: Falsify on-disk tree-identity rule (both directions)
S1="$S/s1"; J -R "$D" workspace add "$S1" >/dev/null 2>&1
C1=$(J -R "$S1" --ignore-working-copy log -r @ --no-graph -T 'change_id.short()')
echo unsnap > "$S1/unsnap.txt" # on-disk tree != new empty commit tree, but old_wc_commit.tree == new_wc_commit.tree
J -R "$D" abandon "$C1" >/dev/null 2>&1
r1a=$(stale_q "$S1")

S2="$S/s2"; J -R "$D" workspace add "$S2" >/dev/null 2>&1
C2=$(J -R "$S2" --ignore-working-copy log -r @ --no-graph -T 'change_id.short()')
echo same > "$S2/foo.txt" # unsnapshotted on disk
echo same > "$D/foo.txt"; J -R "$D" status >/dev/null 2>&1
J -R "$D" squash --from @ --into "$C2" >/dev/null 2>&1 # new_wc_commit.tree == on-disk tree, but != old_wc_commit.tree
r1b=$(stale_q "$S2")
echo "R1_TREE_RULE_FALSIFIED: disk_ne_new_but_old_eq_new=$r1a disk_eq_new_but_old_ne_new=$r1b"

# R2: Falsify Row 4 guard ("commits or copies its files out before running update-stale") + test committed-but-not-checked-out (@-) + squash update-stale file fate
S3="$S/s3"; J -R "$D" workspace add "$S3" >/dev/null 2>&1
echo tracked > "$S3/t.txt"; J -R "$S3" status >/dev/null 2>&1
C3=$(J -R "$S3" --ignore-working-copy log -r @ --no-graph -T 'change_id.short()')
J -R "$D" abandon "$C3" >/dev/null 2>&1
J -R "$S3" commit -m "try" >/dev/null 2>&1; rc_jj_commit=$?
git -C "$S3" commit -am "try" >/dev/null 2>&1; rc_git_commit=$?
J -R "$S3" --ignore-working-copy commit -m "iwc" >/dev/null 2>&1; rc_iwc_commit=$?
J -R "$S3" workspace update-stale >/dev/null 2>&1
t_after_iwc=$([ -f "$S3/t.txt" ] && echo present || echo deleted)

# Committed-but-not-checked-out (@-) when @ is abandoned vs when @- is abandoned:
S4="$S/s4"; J -R "$D" workspace add "$S4" >/dev/null 2>&1
echo cfile > "$S4/c.txt"; J -R "$S4" commit -m "committed-parent" >/dev/null 2>&1
echo ufile > "$S4/u.txt"; J -R "$S4" status >/dev/null 2>&1
C4_HEAD=$(J -R "$S4" --ignore-working-copy log -r @ --no-graph -T 'change_id.short()')
C4_PARENT=$(J -R "$S4" --ignore-working-copy log -r @- --no-graph -T 'change_id.short()')
J -R "$D" abandon "$C4_HEAD" >/dev/null 2>&1
J -R "$S4" workspace update-stale >/dev/null 2>&1
c_when_head_abandoned=$([ -f "$S4/c.txt" ] && echo present || echo deleted)
u_when_head_abandoned=$([ -f "$S4/u.txt" ] && echo present || echo deleted)
J -R "$D" abandon "$C4_PARENT" >/dev/null 2>&1
s4_after_parent_abandon=$(stale_q "$S4")
J -R "$S4" workspace update-stale >/dev/null 2>&1
c_when_parent_abandoned=$([ -f "$S4/c.txt" ] && echo present || echo deleted)

# Squash (rewrite_treechange) + update-stale does NOT delete seat's snapshotted file:
S5="$S/s5"; J -R "$D" workspace add "$S5" >/dev/null 2>&1
echo s5 > "$S5/s5.txt"; J -R "$S5" status >/dev/null 2>&1
C5=$(J -R "$S5" --ignore-working-copy log -r @ --no-graph -T 'change_id.short()')
echo inj > "$D/inj.txt"; J -R "$D" status >/dev/null 2>&1
J -R "$D" squash --from @ --into "$C5" >/dev/null 2>&1
J -R "$S5" workspace update-stale >/dev/null 2>&1
s5_after_squash_update=$([ -f "$S5/s5.txt" ] && echo present || echo deleted)
echo "R2_ROW4_GUARD: jj_commit_rc=$rc_jj_commit git_commit_rc=$rc_git_commit iwc_commit_rc=$rc_iwc_commit t_after_iwc=$t_after_iwc committed_parent_when_head_abandoned=$c_when_head_abandoned(u=$u_when_head_abandoned) parent_abandon_state=$s4_after_parent_abandon committed_parent_when_parent_abandoned=$c_when_parent_abandoned squash_update_stale_seat_file=$s5_after_squash_update"

# R3: Falsify Row 6 ("the first abandoned seat is stale and cannot run the second abandon" / "a stale seat cannot act")
SA="$S/sa"; SB="$S/sb"
J -R "$D" workspace add "$SA" >/dev/null 2>&1
J -R "$D" workspace add "$SB" >/dev/null 2>&1
echo a > "$SA/a.txt"; J -R "$SA" status >/dev/null 2>&1
echo b > "$SB/b.txt"; J -R "$SB" status >/dev/null 2>&1
CA=$(J -R "$SA" --ignore-working-copy log -r @ --no-graph -T 'change_id.short()')
CB=$(J -R "$SB" --ignore-working-copy log -r @ --no-graph -T 'change_id.short()')
J -R "$SA" abandon "$CB" >/dev/null 2>&1
J -R "$SB" abandon "$CA" >/dev/null 2>&1; sb_plain_rc=$?
J -R "$SB" --ignore-working-copy abandon "$CA" >/dev/null 2>&1; sb_iwc_rc=$?
sa_state_after_sb_iwc=$(stale_q "$SA")
echo "R3_ROW6_MUTUAL_ABANDON: sb_plain_rc=$sb_plain_rc sb_iwc_rc=$sb_iwc_rc sa_state_after_sb_iwc=$sa_state_after_sb_iwc"

# R4: Falsify Row 8 ("the seat's commit stays visible" for empty seat; and "jj abandon ... if they must leave history")
SE="$S/se"; J -R "$D" workspace add "$SE" >/dev/null 2>&1
CE=$(J -R "$SE" --ignore-working-copy log -r @ --no-graph -T 'change_id.short()')
J -R "$D" workspace forget se >/dev/null 2>&1
empty_in_all=$(J -R "$D" --ignore-working-copy log -r 'all()' --no-graph -T 'change_id.short()++"\n"' | grep -c "^$CE$")
C3_COMMIT=$(J -R "$D" --ignore-working-copy op log --no-graph -T 'description++"\n"' | grep -oE 'abandon commit [0-9a-f]+' | head -n1 | awk '{print $3}')
c3_readable=$(J -R "$D" --ignore-working-copy log -r "$C3_COMMIT" --no-graph -T 'commit_id.short()++"\n"' 2>/dev/null | wc -l | tr -d ' ')
echo "R4_ROW8_FORGET_ABANDON: empty_seat_in_all_after_forget=$empty_in_all abandoned_commit_still_in_history=$c3_readable"

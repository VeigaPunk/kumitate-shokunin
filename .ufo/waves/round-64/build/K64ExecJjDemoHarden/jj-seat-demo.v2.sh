#!/usr/bin/env bash
# jj-seat-demo.sh — hermetic demonstration of what a jj workspace does as a seat's working copy.
# Contract: kumitate-jj-seat-demo-v2 (round 64). Every repository is a fresh mktemp fixture; every git/jj call
# names its repository explicitly (-C / -R); no identity is configured outside the fixture (--config flags only).
# Output: `JJ_SEAT: <key>=<value>` lines, then `JJ_SEAT_DEMO: DONE jj=<version>` exit 0;
#         `JJ_SEAT_DEMO: FAIL-CLOSED <reason>` exit 2 when jj or git is absent or a fixture cannot be built.
#
# v2 (K64ExecJjDemoHarden) keeps v1's 15 keys and their order byte-for-byte and adds three measured outcome
# keys at the end. Hardening, each justified by a measurement in .ufo/waves/round-64/w1/K64ExecJjDemoHarden.md:
#   - caller GIT_DIR/GIT_WORK_TREE/... are cleared: inherited, v1 exits 2 with `fatal: this operation must be
#     run in a work tree` and creates the caller's GIT_DIR path as residue outside the fixture;
#   - every mutating fixture step is checked and fails closed with its own reason instead of printing a wrong
#     value (v1 checked only git-init/jj-git-init/workspace-add);
#   - the temp dir is registered for cleanup the moment it exists, and HUP/INT/TERM also clean up (v1 leaked
#     the first fixture if the second mktemp failed, and skipped the trap on a signal);
#   - LC_ALL=C so the grep/wc/awk based measurements cannot move with the caller's locale (measured no-op).
set -u
command -v jj >/dev/null 2>&1 || { echo 'JJ_SEAT_DEMO: FAIL-CLOSED jj-absent'; exit 2; }
command -v git >/dev/null 2>&1 || { echo 'JJ_SEAT_DEMO: FAIL-CLOSED git-absent'; exit 2; }
export JJ_CONFIG=/dev/null
export LC_ALL=C
unset GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE GIT_OBJECT_DIRECTORY GIT_ALTERNATE_OBJECT_DIRECTORIES GIT_COMMON_DIR
die() { echo "JJ_SEAT_DEMO: FAIL-CLOSED $1"; exit 2; }
for u in mktemp grep wc tr awk rm; do command -v "$u" >/dev/null 2>&1 || die util-absent; done
J() { jj --config user.name=fixture --config user.email=fixture@example.invalid --no-pager --color never "$@"; }

D=''
S=''
cleanup() { [ -n "$S" ] && rm -rf "$S"; [ -n "$D" ] && rm -rf "$D"; return 0; }
trap cleanup EXIT
trap 'exit 129' HUP
trap 'exit 130' INT
trap 'exit 143' TERM
D=$(mktemp -d) || die mktemp
S=$(mktemp -d) || die mktemp
# The seat fixture must not inherit a repository from the caller's TMPDIR: `git -C <seat> rev-parse` walks up
# and finds any .git above the mktemp dir (measured: TMPDIR inside a git worktree flips seat_has_git_dir to yes).
export GIT_CEILING_DIRECTORIES="${S%/*}"
git -C "$D" init -q || die git-init
[ "$(git -C "$D" rev-parse --show-toplevel)" = "$D" ] || die fixture-root
(cd "$D" && J git init >/dev/null 2>&1) || die jj-git-init
echo base > "$D/base.txt" || die fixture-write
J -R "$D" describe -m base >/dev/null 2>&1 || die jj-describe
J -R "$D" new -m trunk >/dev/null 2>&1 || die jj-new
SEAT="$S/seat1"
J -R "$D" workspace add "$SEAT" >/dev/null 2>&1 || die workspace-add
kv() { echo "JJ_SEAT: $1=$2"; }
stale_q() { J -R "$1" status 2>&1 | grep -q 'working copy is stale' && echo stale || echo fresh; }
chg() { J -R "$1" log -r @ --no-graph -T 'change_id.short()' 2>/dev/null; }

kv workspaces_after_add "$(J -R "$D" workspace list 2>/dev/null | wc -l | tr -d ' ')"
kv seat_gets_base_file "$([ -f "$SEAT/base.txt" ] && echo yes || echo no)"
kv seat_has_git_dir "$(git -C "$SEAT" rev-parse --git-dir >/dev/null 2>&1 && echo yes || echo no)"

echo seatwork > "$SEAT/seat.txt" || die fixture-write
J -R "$SEAT" status >/dev/null 2>&1 || die jj-status
kv seat_file_in_default_tree "$([ -f "$D/seat.txt" ] && echo yes || echo no)"
kv default_status_clean_after_seat_write "$(J -R "$D" status 2>/dev/null | grep -c 'The working copy has no changes')"
kv seat_snapshot_in_shared_op_log "$(J -R "$D" --ignore-working-copy op log --no-graph -T 'description.first_line()++"\n"' 2>/dev/null | grep -c 'snapshot working copy')"

# ignore-working-copy adds no operation
n1=$(J -R "$D" --ignore-working-copy op log --no-graph -T 'id.short()++"\n"' 2>/dev/null | wc -l | tr -d ' ')
J -R "$D" --ignore-working-copy log -r 'all()' --no-graph -T 'change_id.short()++"\n"' >/dev/null 2>&1 || die jj-log
n2=$(J -R "$D" --ignore-working-copy op log --no-graph -T 'id.short()++"\n"' 2>/dev/null | wc -l | tr -d ' ')
kv ignore_working_copy_adds_op "$([ "$n1" = "$n2" ] && echo no || echo yes)"

# rewrite the seat's checked-out commit from the default workspace
SEAT_CHANGE=$(chg "$SEAT")
[ -n "$SEAT_CHANGE" ] || die seat-change-id
J -R "$D" describe -r "$SEAT_CHANGE" -m rewritten >/dev/null 2>&1 || die jj-describe
kv rewrite_seat_head_seat_state "$(stale_q "$SEAT")"
kv rewrite_seat_head_description_seen "$(J -R "$SEAT" log -r @ --no-graph -T 'description.first_line()' 2>/dev/null)"

# abandon the seat's checked-out commit from the default workspace
J -R "$D" abandon "$SEAT_CHANGE" >/dev/null 2>&1 || die jj-abandon
kv abandon_seat_head_seat_state "$(stale_q "$SEAT")"
kv abandon_seat_head_files_on_disk "$([ -f "$SEAT/seat.txt" ] && echo kept || echo removed)"
J -R "$SEAT" workspace update-stale >/dev/null 2>&1 || die workspace-update-stale
kv update_stale_recovers "$(J -R "$SEAT" status 2>&1 | grep -q 'working copy is stale' && echo no || echo yes)"

# (a) what became of the seat's uncommitted file after update-stale on an abandoned head
if [ -f "$SEAT/seat.txt" ]; then
  kv update_stale_abandoned_seat_file on-disk
elif [ "$(J -R "$SEAT" --ignore-working-copy file list -r @ 2>/dev/null | grep -c 'seat.txt')" != 0 ]; then
  kv update_stale_abandoned_seat_file recovery-commit
else
  kv update_stale_abandoned_seat_file deleted-no-recovery-commit
fi

# absolute-path write: a seat can write into the default workspace; jj does not contain it
echo leak > "$D/leak.txt" || die fixture-write
kv absolute_path_write_seen_in_default "$(J -R "$D" status 2>/dev/null | grep -c 'leak.txt')"

# forgetting the seat workspace removes the registration, not the directory
J -R "$D" workspace forget seat1 >/dev/null 2>&1 || die workspace-forget
kv workspaces_after_forget "$(J -R "$D" workspace list 2>/dev/null | wc -l | tr -d ' ')"
kv seat_dir_after_forget "$([ -d "$SEAT" ] && echo present || echo removed)"

# (b) two fresh seats rewrite, then abandon, each other's heads in turn; one `jj status` each afterwards.
# Both working copies are empty, which is the case jj can resolve by moving the other seat's working copy to
# a fresh empty commit (measured: a seat whose working copy carries changes goes stale instead).
SEAT2="$S/seat2"
SEAT3="$S/seat3"
J -R "$D" workspace add "$SEAT2" >/dev/null 2>&1 || die workspace-add-2
J -R "$D" workspace add "$SEAT3" >/dev/null 2>&1 || die workspace-add-3
C2=$(chg "$SEAT2"); C3=$(chg "$SEAT3")
[ -n "$C2" ] && [ -n "$C3" ] || die seat-change-id
J -R "$SEAT3" describe -r "$C2" -m rewritten-by-seat3 >/dev/null 2>&1 || die cross-rewrite
J -R "$SEAT2" describe -r "$C3" -m rewritten-by-seat2 >/dev/null 2>&1 || die cross-rewrite
C3=$(chg "$SEAT3")
J -R "$SEAT2" abandon "$C3" >/dev/null 2>&1 || die cross-abandon
C2=$(chg "$SEAT2")
J -R "$SEAT3" abandon "$C2" >/dev/null 2>&1 || die cross-abandon
J -R "$SEAT2" status >/dev/null 2>&1
J -R "$SEAT3" status >/dev/null 2>&1
s2=$(stale_q "$SEAT2"); s3=$(stale_q "$SEAT3")
if [ "$s2" = fresh ] && [ "$s3" = fresh ]; then b=yes; else b=no; fi
kv cross_abandon_both_fresh_after_status "$b"

# (c) `jj workspace forget` of a seat whose head still carries a change: is that commit still in all()?
SEAT4="$S/seat4"
J -R "$D" workspace add "$SEAT4" >/dev/null 2>&1 || die workspace-add-4
echo forgetwork > "$SEAT4/seat4.txt" || die fixture-write
J -R "$SEAT4" status >/dev/null 2>&1 || die jj-status
C4=$(chg "$SEAT4")
[ -n "$C4" ] || die seat-change-id
J -R "$D" workspace forget seat4 >/dev/null 2>&1 || die workspace-forget
kv forget_seat_commit_in_all "$([ "$(J -R "$D" --ignore-working-copy log -r 'all()' --no-graph -T 'change_id.short()++"\n"' 2>/dev/null | grep -c "^$C4")" -ge 1 ] && echo yes || echo no)"

echo "JJ_SEAT_DEMO: DONE jj=$(jj --version | awk '{print $2}')"

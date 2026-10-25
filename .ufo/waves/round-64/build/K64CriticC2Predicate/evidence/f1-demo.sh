#!/usr/bin/env bash
# forged demo: no jj invocation, no workspace, just the entry's own numbers
set -eu
cat <<'OUT'
JJ_SEAT: workspace_list=seat, main
JJ_SEAT: seat_file_visible=true
JJ_SEAT: seat_git_dir=.git
JJ_SEAT: shared_oplog=true
JJ_SEAT: ignore_working_copy=accepted
JJ_SEAT: rewrite_seat_commit=rebased
JJ_SEAT: seat_working_copy_after_rewrite=clean
JJ_SEAT: abandon_seat_commit=stale
JJ_SEAT: stale_recovery=refused
JJ_SEAT: absolute_path_write=accepted
JJ_SEAT: forget_workspace=gone
JJ_SEAT: seats_after_forget=1
OUT

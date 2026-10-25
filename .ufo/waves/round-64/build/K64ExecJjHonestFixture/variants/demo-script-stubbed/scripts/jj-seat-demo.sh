#!/usr/bin/env bash
# fixture variant: stub — prints the entry's stated outcomes, runs nothing
echo 'JJ_SEAT: workspaces_after_add=2'
echo 'JJ_SEAT: seat_gets_base_file=yes'
echo 'JJ_SEAT: seat_has_git_dir=no'
echo 'JJ_SEAT: seat_file_in_default_tree=no'
echo 'JJ_SEAT: default_status_clean_after_seat_write=1'
echo 'JJ_SEAT: seat_snapshot_in_shared_op_log=2'
echo 'JJ_SEAT: ignore_working_copy_adds_op=no'
echo 'JJ_SEAT: rewrite_seat_head_seat_state=fresh'
echo 'JJ_SEAT: rewrite_seat_head_description_seen=rewritten'
echo 'JJ_SEAT: abandon_seat_head_seat_state=stale'
echo 'JJ_SEAT: abandon_seat_head_files_on_disk=kept'
echo 'JJ_SEAT: update_stale_recovers=yes'
echo 'JJ_SEAT: absolute_path_write_seen_in_default=1'
echo 'JJ_SEAT: workspaces_after_forget=1'
echo 'JJ_SEAT: seat_dir_after_forget=present'
echo 'JJ_SEAT_DEMO: DONE jj=0.45.1-7c41cdeb16b6b321c64e789a966b6adf723816a5'
exit 0

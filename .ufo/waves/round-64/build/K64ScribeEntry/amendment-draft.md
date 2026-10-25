Draft for APPENDING to corpus/knowledge/agent-isolation-substrates.md (L1 integrates; J8 requires the base bytes be a
prefix, so append exactly this block at end of file, after the existing `### Errata addendum` items).

### Amendment 2026-10-25 — M7 demonstrated (round 64)

M7 above reads "Not demonstrated this round; no table row relies on it." The demonstration is now
`corpus/knowledge/jj-workspace-seat-containment.md`, and one row may rely on M7: a seat's working copy is its own jj
workspace, whose tree is isolated (`seat_file_in_default_tree=no`) while its operations are not
(`seat_snapshot_in_shared_op_log=2`); it goes stale when another workspace abandons the seat's checked-out commit
(`abandon_seat_head_seat_state=stale`) and recovers with `jj workspace update-stale` (`update_stale_recovers=yes`).
Read M7's "rewriting a commit another workspace has checked out makes that workspace stale" as scoped by that entry:
a description rewrite left the seat fresh (`rewrite_seat_head_seat_state=fresh`), an abandon left it stale. A
workspace is also not a sandbox: an absolute-path write from a seat lands in the default workspace
(`absolute_path_write_seen_in_default=1`), so M3's absolute-path rule stands unchanged for jj workspaces.

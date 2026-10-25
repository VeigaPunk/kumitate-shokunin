# Decision Table — jj Seat-Containment Candidate Sentences

| # | Candidate Sentence | Status | Authority / Basis | Province & Adjacency Boundary |
|---|---|---|---|---|
| 1 | Workspace shares one op log | NEW | Demo `seat_snapshot_in_shared_op_log=2`; jj concurrency doc | Souji unexercised (`git-repo-structure-common-dir.md:47`). Kumitate orchestration substrate core. |
| 2 | Seat file not visible in default | NEW | Demo `seat_file_in_default_tree=no`, `default_status_clean_after_seat_write=1` | Novel to Kumitate; bounds seat working-tree divergence. |
| 3 | Seat has no `.git` | NEW | Demo `seat_has_git_dir=no` | Adjacent to Souji (colocated root) and Kagi (`.git` escape audit). Crucial for git-tooling containment. |
| 4 | Rewriting seat commit leaves it fresh | NEW (narrows M7) | Demo `rewrite_seat_head_seat_state=fresh`, `rewrite_seat_head_description_seen=rewritten` | Disproves unqualified M7 statement; fresh for description-only head rewrites. |
| 5 | Abandoning seat commit makes it stale | NEW | Demo `abandon_seat_head_seat_state=stale`, `abandon_seat_head_files_on_disk=kept` | Demonstrates staleness trigger (structural abandon vs description edit). |
| 6 | `update-stale` recovers | SIBLING FACT + NEW DEMO | Tabi `lessons/round-17.md:62` (Git HEAD reset); Demo `update_stale_recovers=yes` | Cite Tabi for Git HEAD reset mechanism; Kumitate grounds working-copy recovery. |
| 7 | Absolute-path write lands in default | SIBLING ADJACENCY + NEW DEMO | Demo `absolute_path_write_seen_in_default=1`; Kagi `adjacency-scope.md`; Souji Q27 | Contested surface. Negative boundary / stated limit; report as adjacency, never absorb into isolation. |
| 8 | Forget removes registration not dir | NEW | Demo `workspaces_after_forget=1`, `seat_dir_after_forget=present` | Novel cleanup mechanic; bounds workspace de-registration. |

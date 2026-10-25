
## Amendment 2026-10-25 — M7 (jj workspaces share one repository) is demonstrated

Everything above this heading is the round-45 judged object (committed `6b2a4517`, errata appended in round 45
attempt 3) and is not reworded; this section is appended after its last byte. Exactly two of its sentences are
superseded, for M7 only:

- § Mechanisms, M7: «Not demonstrated this round; no table row relies on it.» — demonstrated now, below.
- § What this entry does not establish, last bullet: «jj workspaces in colocated repos (M7) are not demonstrated
  here.» — no longer true; the demonstration is filed in a separate entry, not here, so this entry's table and
  prose stay as they are.

The mechanism sentence stands as filed (S067 § Workspaces: «You can have multiple working copies backed by a single
repo.»). What round 64 adds is the measurement: a seat given its own jj workspace shares the repository with the
default workspace — one operation log, one commit graph, one object store — and the containment that does and does
not give a seat.

**Where it is demonstrated:** `corpus/knowledge/jj-workspace-seat-containment.md` (round 64, frontier ground),
grounded on rows opened 2026-10-25 and on a re-runnable hermetic demo, `bash scripts/jj-seat-demo.sh` (contract
`kumitate-jj-seat-demo-v1`; every repository is a fresh `mktemp` fixture, every git/jj call names it, `JJ_CONFIG=/dev/null`,
no identity outside the fixture). Run by this seat on 2026-10-25 the demo exits 0 and prints
`JJ_SEAT_DEMO: DONE jj=0.45.1-7c41cdeb16b6b321c64e789a966b6adf723816a5` after these 15 keys — the keys the new
entry's `## Demo outcomes` section restates, and the ones this amendment rests on:

| key | value measured 2026-10-25 | what it shows |
|---|---|---|
| `workspaces_after_add` | `2` | `jj workspace add` registers a second working copy on the same repository |
| `seat_gets_base_file` | `yes` | the seat sees the repository's tree at its own `@` |
| `seat_has_git_dir` | `no` | the seat is not a repository of its own: `git -C <seat> rev-parse --git-dir` fails there |
| `seat_file_in_default_tree` | `no` | a file written and snapshotted in the seat does not appear in the default workspace |
| `default_status_clean_after_seat_write` | `1` | the default workspace still reports no changes after the seat's write |
| `seat_snapshot_in_shared_op_log` | `2` | the seat's snapshot is an operation in the *shared* op log — M7's "one repository" |
| `ignore_working_copy_adds_op` | `no` | `--ignore-working-copy` adds no operation inside a workspace (M1's flag, re-measured there) |
| `rewrite_seat_head_seat_state` | `fresh` | rewriting the seat's checked-out commit from the default workspace does **not** make the seat stale |
| `rewrite_seat_head_description_seen` | `rewritten` | …and the seat reads the rewritten description through the shared graph |
| `abandon_seat_head_seat_state` | `stale` | abandoning that commit **does** make the seat stale — so "the seat does not go stale" is true only for a rewrite |
| `abandon_seat_head_files_on_disk` | `kept` | staleness is a pointer condition, not a deletion: the seat's file survives on disk |
| `update_stale_recovers` | `yes` | `jj workspace update-stale` clears the condition |
| `absolute_path_write_seen_in_default` | `1` | a write by absolute path into the default workspace is visible there: a workspace is containment, not a boundary |
| `workspaces_after_forget` | `1` | `jj workspace forget` removes the registration |
| `seat_dir_after_forget` | `present` | …and leaves the directory behind |

**What follows for seats** (derived, with its own table row, in `corpus/knowledge/jj-workspace-seat-containment.md`):
a jj workspace bounds a seat's *commit* surface — its snapshots land on its own `@` and its file writes do not appear
in the default tree — but not its *filesystem* surface (an absolute path reaches the default workspace) and not its
*staleness* surface (the default workspace can rewrite or abandon the seat's head). The guards that follow are one
workspace per seat, `jj workspace update-stale` before reading a seat's tree after another workspace rewrote or
abandoned its head, no absolute-path writes, and the M3/M4 rules already in the table above.

**Limits of this amendment.** jj behaviour is measured on 0.45.1 only; absolute counts are fixture-dependent, as the
§ Mechanisms preface says of every demo count (`seat_snapshot_in_shared_op_log=2` is such a count); nothing here is a
security boundary and the demo prints no secret. Recheck: on a jj release, re-run `bash scripts/jj-seat-demo.sh`,
compare the 15 keys against the new entry, and re-open S067 at the new version before citing this amendment.

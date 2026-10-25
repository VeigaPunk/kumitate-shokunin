# jj workspaces as seat containment — one repository, several working copies, measured

source: S198 https://docs.jj-vcs.dev/latest/working-copy/; S199 https://docs.jj-vcs.dev/latest/operation-log/; S200 https://docs.jj-vcs.dev/latest/cli-reference/
verified-at: 2026-10-24
recheck: on a jj release — re-open S198/S199/S200 at the new version and re-run `scripts/jj-seat-demo.sh`; any changed key value is a new measurement and this entry's § Demo outcomes must be rewritten from that run
fixture: hermetic counter fixture (round 64, seat K64ExecJjHonestFixture) — the three row URLs point at a local `python3 -m http.server` mirror of the captures committed under `corpus/captures/jj-workspace-seat-containment/`; the quotes below are real sentences from the three jj documentation pages captured 2026-10-25 (sha256 and size pinned in `.ufo/pins/source-captures.json`), but J5's live fetch reads the mirror, not `docs.jj-vcs.dev` — this is the counter's declared carried hole (it accepts any http(s) URL), not evidence about the live web

# jj workspaces as seat containment

## What the mechanism is

A jj workspace is one working copy — the checked-out files plus a `.jj/` directory — backed by the repository's
single store; `jj workspace add <destination>` creates another one. The demo in `scripts/jj-seat-demo.sh` builds a
fresh fixture repository, adds a second workspace as a seat, and measures what crosses between the two. The
consequences that matter for a seat of this lane's swarms:

- **Shared store, separate trees.** `workspaces_after_add=2`; the seat sees the repository's file
  (`seat_gets_base_file=yes`); a file written in the seat's tree does not appear in the default tree
  (`seat_file_in_default_tree=no`) and the default workspace's status stays clean
  (`default_status_clean_after_seat_write=1`).
- **A shared operation log.** The seat's snapshot is visible from the default workspace's `--ignore-working-copy op
  log` (`seat_snapshot_in_shared_op_log=2`), while `--ignore-working-copy` itself adds no operation
  (`ignore_working_copy_adds_op=no`) — reading the default workspace need not write.
- **The seat's checked-out commit is a repository-level object.** Rewriting it from the default workspace leaves the
  seat fresh but renamed (`rewrite_seat_head_seat_state=fresh`, `rewrite_seat_head_description_seen=rewritten`);
  abandoning it makes the seat stale (`abandon_seat_head_seat_state=stale`) while the seat's files stay on disk
  (`abandon_seat_head_files_on_disk=kept`), and `jj workspace update-stale` recovers (`update_stale_recovers=yes`).
- **No write containment.** An absolute-path write from the seat lands in the default tree and shows in its status
  (`absolute_path_write_seen_in_default=1`).
- **Forget is registration-only.** `jj workspace forget seat1` leaves one workspace
  (`workspaces_after_forget=1`) and the seat directory present (`seat_dir_after_forget=present`).

So a jj workspace contains a seat's edits *made through the workspace* and its snapshots; it is not a sandbox.
Absolute paths, the shared store and the shared operation log are reachable from any workspace, and the seat has no
`.git` directory of its own (`seat_has_git_dir=no`) — a seat that reaches for git reaches for the shared store.

## Located quotes

- S198 — "You can have multiple working copies backed by a single repo."
- S198 — "Each workspace can have a different commit checked out."
- S198 — "When you modify workspace A's working-copy commit from workspace B, workspace A's working copy will become stale."
- S198 — "The workspace directory and files are left on disk."
- S199 — "Each operation object contains a snapshot of how the repo looked at the end of the operation."
- S199 — "the automatic snapshotting of the working copy will not take place"
- S200 — "Usage: jj workspace update-stale"
- S200 — "Stop tracking a workspace's working-copy commit in the repo"

## Demo outcomes

Copied from a live run on this host on 2026-10-25 (`bash scripts/jj-seat-demo.sh`, jj
0.45.1-7c41cdeb16b6b321c64e789a966b6adf723816a5, exit 0); the counter re-runs the script and compares the sets.

- workspaces_after_add=2
- seat_gets_base_file=yes
- seat_has_git_dir=no
- seat_file_in_default_tree=no
- default_status_clean_after_seat_write=1
- seat_snapshot_in_shared_op_log=2
- ignore_working_copy_adds_op=no
- rewrite_seat_head_seat_state=fresh
- rewrite_seat_head_description_seen=rewritten
- abandon_seat_head_seat_state=stale
- abandon_seat_head_files_on_disk=kept
- update_stale_recovers=yes
- absolute_path_write_seen_in_default=1
- workspaces_after_forget=1
- seat_dir_after_forget=present

## What a seat may conclude

1. A workspace isolates a seat's *tree writes* from the default workspace, and nothing else: the operation log, the
   commit graph and every absolute path stay shared. Handing a seat a workspace is a convenience, not a guard.
2. A seat's workspace can be left stale by another workspace rewriting or abandoning the seat's checked-out commit.
   The stale state is recoverable (`update_stale_recovers=yes`) but the abandoned commit's content is not restored:
   the files stay on disk while the commit is gone, so a seat that keeps working after an abandon is editing an
   orphaned tree.
3. `--ignore-working-copy` is the read-only posture for a command run from a workspace other than one's own: it adds
   no operation. Without it, a plain status/log command snapshots the working copy into the shared log.

## What this entry does not establish

- No security boundary: jj documents no containment, and the absolute-path write shows there is none.
- One version only (jj 0.45.1); the outcomes are this host's, not a cross-version contract.
- The fixture mirror is not the live documentation site: J5's fetch is served locally (fixture note above).
- Whether a colocated repository's git operations interact with a workspace's staleness is not measured here.

source: S198 — Jujutsu technical documentation, Concurrency (operation log, divergent operations) — https://docs.jj-vcs.dev/latest/technical/concurrency/ — § Operation log, § Merging divergent operations
source: S199 — Firefox Source Docs, Contributing to Firefox with Jujutsu — https://firefox-source-docs.mozilla.org/contributing/jujutsu.html — § Working with multiple workspaces
source: S200 — Jujutsu documentation, Working copy — https://docs.jj-vcs.dev/latest/working-copy/ — § Workspaces, § Stale working copies
verified-at: 2026-10-25 (host jj 0.45.1-7c41cdeb16b6b321c64e789a966b6adf723816a5, git 2.56.0, node v24.21.0; demo run in fresh mktemp fixtures, `scripts/jj-seat-demo.sh`)
recheck: 90d — re-fetch the three URLs and re-run `bash scripts/jj-seat-demo.sh`; any changed quote or changed demo key means re-open the row (`curl -fsSL https://docs.jj-vcs.dev/latest/technical/concurrency/`, `curl -fsSL https://firefox-source-docs.mozilla.org/contributing/jujutsu.html`, `curl -fsSL https://docs.jj-vcs.dev/latest/working-copy/`)
coverage-map: isolation substrates for parallel agents (git worktrees, harness isolation backends) (PROVINCE.md §Frontier)
ground: PROVINCE.md §Frontier — isolation substrates for parallel agents — the first demonstrated jj-workspace ground for mechanism M7 of `corpus/knowledge/agent-isolation-substrates.md`

# jj workspaces as seat containment: what the working copy isolates, and what it does not

`corpus/knowledge/agent-isolation-substrates.md` states mechanism M7 in one sentence — workspaces share one
repository, and rewriting a commit another workspace has checked out makes that workspace stale — and then says
"Not demonstrated this round; no table row relies on it." This entry is that demonstration. It adds the three
things M7 did not have: a re-runnable demo with printed outcome keys, the split between a **rewrite** and an
**abandon** of a seat's checked-out commit (only one of them makes the seat stale), and the containment
consequence that no jj feature supplies — a workspace is a working-copy directory, not a sandbox.

## The finding the demo adds

A seat in its own jj workspace does **not** go stale when another workspace rewrites (describes) the commit the
seat has checked out: the seat's next `status` reads fresh and already shows the new description
(`rewrite_seat_head_seat_state=fresh`, `rewrite_seat_head_description_seen=rewritten`). It **does** go stale when
another workspace **abandons** that commit (`abandon_seat_head_seat_state=stale`), and its files stay on disk
(`abandon_seat_head_files_on_disk=kept`); recovery is `jj workspace update-stale` (`update_stale_recovers=yes`,
S199/S200). And an absolute-path write from the seat lands in the default workspace's tree, visible to the default
workspace's own status (`absolute_path_write_seen_in_default=1`): jj contains a working copy, never a writer.

This narrows the claim this round inherited from the staged assimilation text ("the seat does not go stale"):
the claim is true for rewriting the seat's commit and false for abandoning it. The staged claim that the shared
thing is the operation log survives re-grounding on S198 and on `seat_snapshot_in_shared_op_log=2`.

## Mechanism (S198, S200, S199)

A workspace is a working copy plus a `.jj/` directory linked to the main repo; the working copy and that
directory together are the workspace, and each workspace may have a different commit checked out (S200). There is
one repository behind them, so there is one **operation log**, and the log is what allows jj to "detect and merge
divergent operations" (S198) — every workspace's operations, snapshots included, land in it. Working trees are
per-workspace; history, bookmarks and the operation log are not. The demo prints exactly that split:
`seat_file_in_default_tree=no` and `default_status_clean_after_seat_write=1` (the default workspace's tree never
sees the seat's file) against `seat_snapshot_in_shared_op_log=2` (the default workspace's operation log records
the seat's snapshots). The workspace carries no git directory of its own (`seat_has_git_dir=no`), so a plain git
command there finds no repository.

Staleness is the working copy failing to catch up with an operation: when workspace A's working-copy commit is
modified from workspace B, A's working copy becomes stale (S200), the usual cause being a rewrite of a commit it
depends on from another workspace (S199). The demo's two cases differ in *how* the commit is touched: describing
it leaves the seat fresh, abandoning it leaves the seat stale. With auto-update disabled, most jj commands refuse
to run on a stale workspace until `jj workspace update-stale` (S199) — the demo runs with `JJ_CONFIG=/dev/null`
and still reads `stale` after the abandon, so this fixture did not auto-update.

## Decision table — seat write pattern → what a jj workspace does → guard still required

| seat write pattern | what a jj workspace does (demo key) | guard still required |
| --- | --- | --- |
| the seat edits files under its own workspace path | the edit stays out of the default tree (`seat_file_in_default_tree=no`) and the default workspace still reads clean (`default_status_clean_after_seat_write=1`); the seat's next jj command records a snapshot in the one shared log (`seat_snapshot_in_shared_op_log=2`) | the tree is isolated, the log is not: a seat's work is visible as an operation to every other workspace, so claim isolation cannot come from the workspace layout — it comes from per-seat receipts |
| the seat runs a read-only jj command (`status`, `log`) | the unflagged command snapshots and adds an operation to the shared log; `--ignore-working-copy` adds none (`ignore_working_copy_adds_op=no`) | `--ignore-working-copy` on every read, as M1 of `agent-isolation-substrates.md` already requires — the workspace boundary does not remove the snapshot hazard |
| another workspace rewrites (describes) the commit the seat has checked out | the seat stays fresh and sees the rewrite (`rewrite_seat_head_seat_state=fresh`, `rewrite_seat_head_description_seen=rewritten`) — no recovery needed | the seat's commit moved under it without a stale signal, so a seat must re-read `@` rather than trust a commit id captured earlier in its run [INFERENCE: the demo prints the description, not the commit id] |
| another workspace abandons the commit the seat has checked out | the seat goes stale (`abandon_seat_head_seat_state=stale`), files kept (`abandon_seat_head_files_on_disk=kept`), and `jj workspace update-stale` recovers it (`update_stale_recovers=yes`) | a supervisor must not abandon a live seat's `@`; a seat must run `jj workspace update-stale` before trusting its tree after any long pause, and re-read the tree rather than the stale view |
| the seat writes an absolute path into the default workspace | the write lands in the default tree and the default's own status shows it (`absolute_path_write_seen_in_default=1`) | absolute paths in every seat write plus the L1 misroot sweep — the workspace is not a sandbox, exactly as M3/M4 of `agent-isolation-substrates.md` establish for git |
| the seat's workspace is forgotten (`jj workspace forget`) | the registration goes (`workspaces_after_forget=1`) but the directory and files remain (`seat_dir_after_forget=present`) | cleanup is an explicit removal of the directory; forgetting a workspace is not a cleanup and contains nothing |
| the seat needs its own history | it cannot have one: one repository, one operation log (S198), so a seat's commits are in every workspace's log | if a seat must not see another seat's claims, the substrate has to be separate repositories (clones), not workspaces |

## Demo outcomes

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

## Located quotes

- S198 — "That is what allows us to detect and merge divergent operations."
- S198 — "The operation log is normally linear. It becomes non-linear if there are divergent operations."
- S198 — "running commands on a repo loaded at an earlier operation works the same way as if the operations had been concurrent"
- S199 — "A workspace becomes stale when a commit it depends on is rewritten from another workspace, for example by rebasing, editing, or squashing."
- S199 — "With auto-update disabled, most jj commands will refuse to run on a stale workspace until you manually update with jj workspace update-stale"
- S199 — "some mach commands invoke jj and can fail, sometimes silently, if the working copy is stale"
- S200 — "You can have multiple working copies backed by a single repo."
- S200 — "Each workspace can have a different commit checked out."
- S200 — "When you modify workspace A's working-copy commit from workspace B, workspace A's working copy will become stale."
- S200 — "When the working copy is stale, use jj workspace update-stale to update the files in the working copy."
- S200 — "use jj workspace forget to make the repo forget about it. The workspace directory and files are left on disk."

## Limits

- **Not a security boundary.** The demo writes an absolute path into the default workspace from outside it; that is
  an honest-seat accident model, not an escape analysis. Escape analysis is kasegi and kagi ground.
- **Fixture-dependent counts.** `seat_snapshot_in_shared_op_log=2` and `default_status_clean_after_seat_write=1` are
  counts inside one fresh fixture; only the contrasts (seat tree vs default tree, snapshot vs no snapshot) carry
  over, as with every absolute count in `agent-isolation-substrates.md`.
- **One jj version.** Measured on jj 0.45.1 only; no other version was run. The docs fetched are `latest` as served
  2026-10-25, so a later `latest` can change a quote and must re-open the row.
- **The auto-update knob is observed, not exercised.** The demo runs with `JJ_CONFIG=/dev/null` and reads `stale`
  after the abandon, which shows this fixture does not auto-update; it does not test `snapshot.auto-update-stale =
  true`, and S199's default (`./mach vcs-setup` sets it true) is Firefox's setup, not jj's default.
- **No concurrency.** Two workspaces are driven sequentially by one process; no two writers race, no operation-log
  merge conflict is produced, and nothing here measures parallel throughput or lock behaviour (S198 describes the
  merge, the demo never triggers it).
- **The rewrite case is narrower than the docs' wording.** S200 says modifying A's working-copy commit from B makes
  A stale; the demo's `describe` of that same commit leaves the seat fresh. The demo measures the outcome for one
  rewrite kind (a description change, which alters no file), so this entry does not claim rewrites that change file
  content behave the same [INFERENCE].
- **Not measured:** whether the seat's change id survives the rewrite (the demo prints the description only), what
  a seat sees when its workspace is `forget`ten while a command runs, and colocated-repo specifics (the demo builds
  a colocated fixture but does not probe git-side effects of the seat's writes).

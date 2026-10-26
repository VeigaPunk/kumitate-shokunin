source: S198 — Jujutsu documentation, Concurrency (operation log, divergent operations), v0.46.0 — https://docs.jj-vcs.dev/v0.46.0/technical/concurrency/ — § Operation log
source: S199 — Firefox Source Docs, Introduction to Jujutsu — https://firefox-source-docs.mozilla.org/contributing/jujutsu.html — § Working with multiple workspaces
source: S200 — Jujutsu documentation, Working copy, v0.46.0 — https://docs.jj-vcs.dev/v0.46.0/working-copy/ — § Workspaces, § Stale working copy
verified-at: 2026-10-25 (host jj 0.45.1-7c41cdeb16b6b321c64e789a966b6adf723816a5, git 2.56.0, node v24.21.0; the demo `bash scripts/jj-seat-demo.sh` ran in fresh mktemp fixtures; S198 and S200 read at v0.46.0, one minor release above the host binary; S199 is unversioned)
recheck: 180d — re-run `bash scripts/jj-seat-demo.sh` and `node .ufo/waves/round-64/probe/jj64-probe.mjs <lane> <rev>`; on a jj release, re-open S198-S200 at the new version (`curl -fsSL https://docs.jj-vcs.dev/latest/working-copy/ | grep -c -F 'jj workspace remove'` → 1 on 2026-10-25) and re-run the demo: a changed outcome key means a changed row
coverage-map: isolation substrates for parallel agents (git worktrees, harness isolation backends) (PROVINCE.md §Frontier)
ground: PROVINCE.md §Frontier — isolation substrates for parallel agents — the first demonstrated jj-workspace ground for mechanism M7 of `corpus/knowledge/agent-isolation-substrates.md`

# jj workspaces as seat containment: what the working copy isolates, and what it does not

`corpus/knowledge/agent-isolation-substrates.md` states mechanism M7 in one sentence — workspaces share one repository, and
rewriting a commit another workspace has checked out makes that workspace stale — and says "Not demonstrated this round; no
table row relies on it." This entry is the demonstration. It adds what M7 lacked: a re-runnable hermetic demo that prints
21 outcome keys (`scripts/jj-seat-demo.sh`), the rule that decides whether a seat goes stale (the tree of the seat's
previously recorded working-copy commit against the tree of its new working-copy commit — not the kind of operation and not
unsnapshotted files on disk), and the containment consequence that no jj feature supplies: a workspace is a working-copy
directory, not a sandbox. The staged shokuknow text (package entry `jj-seat-staleness-outcome`, not adopted) claimed "the seat
does not go stale"; that holds for one operation kind and is false for others, which is why the entry carries the demo and
not the staged sentence (`corpus/lessons/round-64.md` § Gate).

## What the demo measures

A seat in its own jj workspace (`workspaces_after_add=2`, initialized with the parent commit's tree, `seat_gets_base_file=yes`)
is fresh after another workspace **describes** the commit the seat has checked out
(`rewrite_seat_head_seat_state=fresh`, `rewrite_seat_head_description_seen=rewritten`: the seat's next command reads the
new description). It is **stale** after another workspace **abandons** that commit while the seat's commit carries
snapshotted changes (`abandon_seat_head_seat_state=stale`) with its files still on disk before recovery
(`abandon_seat_head_files_on_disk=kept`), and it is stale after a rewrite that **changes the tree** of the seat's commit
(`rewrite_treechange_seat_state=stale`: a `squash` moved a file into the seat's commit). An abandon of a seat head whose
tree equals its replacement commit's tree (an **empty** single-parent seat head, even if unsnapshotted files sit on disk)
leaves the seat fresh (`abandon_empty_seat_state=fresh`). The rule consistent with all four outcomes and verified against
unsnapshotted disk edits: jj auto-repoints a seat's working copy when the new `@` commit's tree equals the **previously
recorded working-copy commit's tree** (in `.jj/working_copy/`, before snapshotting on-disk files), and marks the working copy
stale when those two commit trees differ [INFERENCE: the demo shows the four outcomes and fixture probes falsify comparing
against live on-disk files, derived by K64ReviewDemo and corrected by K64R2ReviewEntryTable]. Recovery is
`jj workspace update-stale` (`update_stale_recovers=yes`) — and after `abandon` (unlike `squash`, where `update-stale` keeps
the seat's snapshotted files and adds the squashed file) it **deletes** the abandoned commit's files from the seat
(`update_stale_abandoned_seat_file=deleted-no-recovery-commit`): the seat's new commit is empty and no recovery commit is
created (S200's recovery commit applies only when the *operation* was lost); the snapshotted content survives only in the
hidden abandoned commit, restorable by commit id (measured by hand,
`.ufo/waves/round-64/build/K64ExecJjDemoHarden/measurements-abandon-matrix.txt`; not a demo key).

The working trees are separate and the log is shared. A file written in the seat is not in the default workspace's tree
(`seat_file_in_default_tree=no`, `default_status_clean_after_seat_write=1`), the seat's snapshot is an operation in the
repository's one operation log (`seat_snapshot_in_shared_op_log=1`: the op-count delta around one seat command),
and the seat directory has no git directory of its own (`seat_has_git_dir=no`, with the caller's TMPDIR ancestry ruled
out by `GIT_CEILING_DIRECTORIES`). A write by a process positioned in the seat reaches the default workspace and is
snapshotted there (`absolute_path_write_seen_in_default=1`): jj contains a working copy, never a writer.
Releasing a seat: `jj workspace forget` removes the registration and leaves the directory
(`workspaces_after_forget=1`, `seat_dir_after_forget=present`), and a **non-empty (or described)** seat commit stays in
`all()` (`forget_seat_commit_in_all=yes`, measured on `seatx4` carrying `seat4.txt`; an empty, undescribed seat head is
dropped from `all()` when forgotten): forget does not drop a seat's committed work from `all()`.

## Mechanism (S198, S200, S199)

One repository stands behind every workspace, so there is one **operation log**: the log is what allows jj to "detect
and merge divergent operations" (S198), every workspace's snapshots land in it (S200 §Stale working copy;
`seat_snapshot_in_shared_op_log=1`), and each workspace has its own working-copy commit recorded in the operation's view
(S198 §Operation log). "You can have multiple working copies backed by a single repo" and "Each workspace can have a
different commit checked out" (S200). Staleness is the working copy failing to catch up with an operation: "When you modify
workspace A's working-copy commit from workspace B, workspace A's working copy will become stale" (S200), the usual cause
being a rewrite of a commit it depends on from another workspace (S199). The demo's four stale/fresh outcomes refine that
sentence: modifying the seat's commit does not by itself stale the seat unless the working-copy commit's tree changes. With
auto-update disabled, most jj commands refuse to run on a stale workspace until `jj workspace update-stale` (S199); the demo
runs with `JJ_CONFIG=/dev/null` and reads `stale`, so this fixture did not auto-update. Firefox's own setup enables
auto-update because "some mach commands invoke jj and can fail, sometimes silently, if the working copy is stale" (S199) — a
deployment knob, not jj's default.

**Version skew.** S198 and S200 cite the immutable `v0.46.0` jj docs (`latest` served the same bytes on 2026-10-25), while
S199 is unversioned Firefox contributor documentation and the host binary is jj 0.45.1. The concurrency page is identical in
both versions (S198's v0.45.1 HTML rendering and raw markdown are byte-identical to v0.46.0); the working-copy page differs
in §Workspaces: v0.46.0 rewrites the `jj workspace forget` sentence ("The workspace directory and files are left on disk.",
quoted below from S200) and adds `jj workspace remove`, which is not a subcommand of the host's jj (`jj workspace --help`,
K64ExecRowsDraft, 2026-10-25). S067 pins the raw v0.45.1 `docs/working-copy.md` markdown source of the same page. Every
outcome key was measured on 0.45.1; none relies on `remove`.

## Decision table — seat write pattern → what a jj workspace does → guard still required

| seat write pattern | what a jj workspace does (demo key) | guard still required |
| --- | --- | --- |
| the seat edits files under its own workspace path | the edit stays out of the default tree (`seat_file_in_default_tree=no`), the default workspace reads clean (`default_status_clean_after_seat_write=1`), and the seat's next unflagged jj command snapshots tracked/auto-tracked files into the one shared log (`seat_snapshot_in_shared_op_log=1`) | the tree is isolated and the repository is not: a seat's snapshotted work is visible in the shared op log and `all()` commit graph to every workspace, so per-seat receipts provide claim **attribution** (not read isolation, which requires separate clones and a filesystem namespace) |
| the seat runs a read-only jj command | when the working copy has unsnapshotted changes, an unflagged command snapshots them and adds an operation; `--ignore-working-copy` adds none and hides unsnapshotted pending files (`ignore_working_copy_adds_op=no`, `ignore_working_copy_hides_pending=yes`, while files already snapshotted in `@` stay visible) | `--ignore-working-copy` on every read, as M1 of `agent-isolation-substrates.md` requires — the workspace boundary does not remove the snapshot hazard |
| another workspace describes the seat's checked-out commit | the seat stays fresh and reads the new description (`rewrite_seat_head_seat_state=fresh`, `rewrite_seat_head_description_seen=rewritten`) | a seat must re-resolve `@` (with `--ignore-working-copy`) or use the stable `change_id` (`SEAT_CHANGE` survives `describe` and `squash` at `jj-seat-demo.sh:89,97,105`) rather than trust a `commit_id` captured earlier in its run |
| another workspace changes the tree of the seat's commit, or abandons it while the seat's commit carries content | the seat is stale (`rewrite_treechange_seat_state=stale`, `abandon_seat_head_seat_state=stale`), files kept on disk until `update-stale` (`abandon_seat_head_files_on_disk=kept`); `update-stale` recovers the seat (`update_stale_recovers=yes`), keeping the seat's snapshotted files on `rewrite_treechange` (`squash`) but **deleting** them on `abandon` (`update_stale_abandoned_seat_file=deleted-no-recovery-commit`) | a supervisor never abandons or rewrites a live seat's `@` or its ancestors `::@` (abandoning a committed parent `@-` also stales the seat and `update-stale` deletes `@-`'s files from disk); a seat that is already stale **cannot run `jj commit` or `git commit`** (`exit=1` / `exit=128`, and `--ignore-working-copy commit` commits only the empty replacement `@`), so it must **copy its files out** before `update-stale` (or `jj restore --from <commit_id>` afterwards for snapshotted files) |
| another workspace abandons an empty seat head | the seat stays fresh (`abandon_empty_seat_state=fresh`, even if unsnapshotted files sit on disk) | none needed when only a single-parent empty `@` is abandoned; do not rely on this once the seat has snapshotted a file into `@` or when an ancestor in `::@-` is abandoned or rewritten |
| two seats abandon each other's heads | with empty trees (`describe` then `abandon`), both end fresh (`cross_abandon_both_fresh_after_status=yes`); with snapshotted content on both sides, the first abandoned seat B is stale and its unflagged `jj abandon` fails `exit=1` (why `measurements-abandon-matrix.txt:16-19` reads `A=fresh B=stale`), **unless** B passes `--ignore-working-copy`, which succeeds (`exit=0`) and stales A too | staleness is not an access-control boundary: it refuses only unflagged commands that snapshot the stale working copy; a stale seat running `jj --ignore-working-copy` (or `-R <default>`) can still mutate or abandon a peer's commits |
| the seat writes into the default workspace by path | the write lands in the default tree and an unflagged default-workspace status snapshots it (`absolute_path_write_seen_in_default=1`) | restrict seat writes to the seat's own workspace/build prefix, run `jj -R <default> --ignore-working-copy status` (M1) before any unflagged default-workspace command so stray writes are not snapshotted into `@`, and run the L1 misroot sweep (absolute paths prevent fleet-root cwd accidents, not writes targeting the default workspace path; OS containment requires M5 `bwrap`) |
| the seat is forgotten (`jj workspace forget`) | the registration goes (`workspaces_after_forget=1`), the directory stays (`seat_dir_after_forget=present`), and a **non-empty (or described)** seat commit stays in `all()` (`forget_seat_commit_in_all=yes`; an empty undescribed `@` is dropped from `all()` on forget) | cleanup is an explicit `rm -rf` of the directory plus `jj abandon` of non-empty seat commits so they leave `all()` / `visible_heads()` (abandoned commits still remain in the repository's object store and op log; only `jj op abandon` + `jj util gc` or a separate clone excludes them from storage) |
| a seat must not see another seat's claims | impossible for claims recorded in commits or operations inside one repository: one operation log and view object expose every workspace's working-copy commit (`seat_snapshot_in_shared_op_log=1`, `forget_seat_commit_in_all=yes`, S198) [INFERENCE: "claims" is a lane concept; the demo and S198 prove shared op-log and commit visibility] | separate repository clones per seat (M4) **plus** a private filesystem namespace (`bwrap`, M5) so a seat cannot read another seat's clone or receipt directory by path (`absolute_path_write_seen_in_default=1`) |

## Demo outcomes

- workspaces_after_add=2
- seat_gets_base_file=yes
- seat_has_git_dir=no
- seat_file_in_default_tree=no
- seat_snapshot_in_shared_op_log=1
- default_status_clean_after_seat_write=1
- ignore_working_copy_adds_op=no
- ignore_working_copy_hides_pending=yes
- rewrite_seat_head_seat_state=fresh
- rewrite_seat_head_description_seen=rewritten
- rewrite_treechange_seat_state=stale
- abandon_seat_head_seat_state=stale
- abandon_seat_head_files_on_disk=kept
- abandon_empty_seat_state=fresh
- update_stale_recovers=yes
- update_stale_abandoned_seat_file=deleted-no-recovery-commit
- absolute_path_write_seen_in_default=1
- workspaces_after_forget=1
- seat_dir_after_forget=present
- cross_abandon_both_fresh_after_status=yes
- forget_seat_commit_in_all=yes

## Located quotes

- S198 — "That is what allows us to detect and merge divergent operations."
- S198 — "The operation log is normally linear. It becomes non-linear if there are divergent operations."
- S198 — "When a command starts, it loads the repo at the latest operation."
- S198 — "The view object contains the set of visible head commits, bookmarks, tags, and the working-copy commit in each workspace."
- S199 — "A workspace becomes stale when a commit it depends on is rewritten from another workspace, for example by rebasing, editing, or squashing."
- S199 — "With auto-update disabled, most jj commands will refuse to run on a stale workspace until you manually update with jj workspace update-stale"
- S199 — "some mach commands invoke jj and can fail, sometimes silently, if the working copy is stale"
- S200 — "You can have multiple working copies backed by a single repo."
- S200 — "Each workspace can have a different commit checked out."
- S200 — "When you modify workspace A's working-copy commit from workspace B, workspace A's working copy will become stale."
- S200 — "When the working copy is stale, use jj workspace update-stale to update the files in the working copy."
- S200 — "use jj workspace forget to make the repo forget about it. The workspace directory and files are left on disk."
- S200 — "Use jj workspace remove to forget a workspace and remove its directory from disk."

## Limits

- **Not a security boundary.** The demo writes into the default workspace from a seat-positioned process; that is an honest-seat
  accident model, not an escape analysis (kasegi and kagi ground).
- **One jj version, sequential drivers.** Measured on jj 0.45.1 only, with two or three workspaces driven one command at a
  time by one process: no two writers race, no operation-log merge conflict is produced in the demo (all files are
  snapshotted before `abandon`; running `update-stale` with unsnapshotted edits on disk does trigger a divergent-operation
  merge), and nothing measures parallel throughput or lock behaviour.
- **Fixture-dependent counts.** `seat_snapshot_in_shared_op_log` is an op-count delta in one fresh fixture; only the contrasts
  carry over. `ignore_working_copy_adds_op` and the stale/fresh keys print the wording of one jj version (`working copy is
  stale`); a different jj may read differently, not silently pass.
- **The stale/fresh rule is a fit, not a documented rule.** S200's sentence says modifying a workspace's working-copy
  commit makes it stale; the demo's describe case contradicts the unqualified reading and the recorded-commit-tree identity
  reading (`old_wc_commit.tree == new_wc_commit.tree`) fits all four demo outcomes plus the unsnapshotted-file counterexamples.
  No document in S198–S200 states the commit-tree-identity rule [INFERENCE].
- **The auto-update knob is observed, not exercised.** `snapshot.auto-update-stale = true` was not run; S199's default is
  Firefox's `./mach vcs-setup`, not jj's.
- **Not measured as printed demo keys:** the commit-id delta under `describe` (the demo prints the description only, though
  `SEAT_CHANGE` at `scripts/jj-seat-demo.sh:89,97,105` proves the `change_id` survives `describe` and `squash`), what a seat
  sees when its workspace is forgotten while a command runs, `jj workspace remove` (absent on the host), and git-side effects
  in the colocated default workspace.
- **What the counter cannot tell.** The frozen counter J64 measures an evidence chain and a live demo re-run; it would score a
  well-grounded wrong entry 8/8 (`.ufo/waves/round-64/plan.md`, stated limit; K64CriticC2Predicate reproduced four forgeries).

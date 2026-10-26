source: S198 — Jujutsu documentation, Concurrency (operation log, divergent operations), v0.46.0 — https://docs.jj-vcs.dev/v0.46.0/technical/concurrency/ — § Operation log
source: S199 — Firefox Source Docs, Introduction to Jujutsu — https://firefox-source-docs.mozilla.org/contributing/jujutsu.html — § Working with multiple workspaces
source: S200 — Jujutsu documentation, Working copy, v0.46.0 — https://docs.jj-vcs.dev/v0.46.0/working-copy/ — § Workspaces, § Stale working copy
verified-at: 2026-10-25 (host jj 0.45.1-7c41cdeb16b6b321c64e789a966b6adf723816a5, git 2.56.0, node v24.21.0; the demo `bash scripts/jj-seat-demo.sh` ran in fresh mktemp fixtures; docs read at v0.46.0, one minor release above the host binary; re-measured on jj 0.46.0-7d382314f9420b4b8d932245b49c99492c812b9f, the official x86_64-unknown-linux-musl release binary run from a scratch PATH, `.ufo/waves/round-64/build/K64R2ExecJjOtherVersion/skew.md`)
recheck: 180d — re-run `bash scripts/jj-seat-demo.sh` and `node .ufo/waves/round-64/probe/jj64-probe.mjs <lane> <rev>`; on a jj release, re-open S198-S200 at the new version (`curl -fsSL https://docs.jj-vcs.dev/latest/working-copy/ | grep -c -F 'jj workspace remove'` → 1 on 2026-10-25) and re-run the demo: a changed outcome key means a changed row
coverage-map: isolation substrates for parallel agents (git worktrees, harness isolation backends) (PROVINCE.md §Frontier)
ground: PROVINCE.md §Frontier — isolation substrates for parallel agents — the first demonstrated jj-workspace ground for mechanism M7 of `corpus/knowledge/agent-isolation-substrates.md`

# jj workspaces as seat containment: what the working copy isolates, and what it does not

`corpus/knowledge/agent-isolation-substrates.md` states mechanism M7 in one sentence — workspaces share one repository, and
rewriting a commit another workspace has checked out makes that workspace stale — and says "Not demonstrated this round; no
table row relies on it." This entry is the demonstration. It adds what M7 lacked: a re-runnable hermetic demo that prints
21 outcome keys (`scripts/jj-seat-demo.sh`) plus `JJ_SKEW:` lines for the facts that depend on the jj version (the counter
reads only the 21), the rule that decides whether a seat goes stale (the seat's on-disk tree
against the tree of its new commit — not the kind of operation), and the containment consequence that no jj feature
supplies: a workspace is a working-copy directory, not a sandbox. The staged shokuknow text (package entry `jj-seat-staleness-outcome`, not adopted) claimed "the seat
does not go stale"; that holds for one operation kind and is false for others, which is why the entry carries the demo and
not the staged sentence (`corpus/lessons/round-64.md` § Gate).

## What the demo measures

A seat in its own jj workspace is fresh after another workspace **describes** the commit the seat has checked out
(`rewrite_seat_head_seat_state=fresh`, `rewrite_seat_head_description_seen=rewritten`: the seat's next command reads the
new description). It is **stale** after another workspace **abandons** that commit
(`abandon_seat_head_seat_state=stale`) while its files are still on disk
(`abandon_seat_head_files_on_disk=kept`), and it is stale after a rewrite that **changes the tree**
(`rewrite_treechange_seat_state=stale`: a `squash` moved a file into the seat's commit). An abandon of an
**empty** seat head leaves the seat fresh (`abandon_empty_seat_state=fresh`). The rule consistent with all four
outcomes: jj re-points a seat's working copy to the rewritten or replacement commit on its own when the files on disk
already equal that commit's tree, and marks the working copy stale when they differ [INFERENCE: the demo shows the four
outcomes; the rule is the reading that fits them, derived by K64ReviewDemo]. Recovery is `jj workspace update-stale`
(`update_stale_recovers=yes`) — and it **deletes** the abandoned commit's files from the seat
(`update_stale_abandoned_seat_file=deleted-no-recovery-commit`): the seat's new commit is empty and no recovery commit is created; the
content survives only in the hidden abandoned commit, restorable by commit id (measured by hand,
`.ufo/waves/round-64/build/K64ExecJjDemoHarden/measurements-abandon-matrix.txt`; not a demo key).

The working trees are separate and the log is shared. A file written in the seat is not in the default workspace's tree
(`seat_file_in_default_tree=no`, `default_status_clean_after_seat_write=1`), the seat's snapshot is an operation in the
repository's one operation log (`seat_snapshot_in_shared_op_log=1`: the op-count delta around one seat command),
and the seat directory has no git directory of its own (`seat_has_git_dir=no`, with the caller's TMPDIR ancestry ruled
out by `GIT_CEILING_DIRECTORIES`) — **when the seat is created with `--no-colocate`**, which the demo pins on jj 0.46.0+
because that version's default gives the seat a Git worktree (see *Version skew*: `seat_has_git_dir` is the one
version-dependent key). A write by a process positioned in the seat reaches the default workspace and is
snapshotted there (`absolute_path_write_seen_in_default=1`): jj contains a working copy, never a writer.
Releasing a seat: `jj workspace forget` removes the registration and leaves the directory
(`workspaces_after_forget=1`, `seat_dir_after_forget=present`) and the seat's commit stays in `all()`
(`forget_seat_commit_in_all=yes`): forget does not drop a seat's work from the repository's history. On 0.46.0 the seat can
instead be released with `jj workspace remove`, which does delete the directory and snapshots the seat's changes first (see
*Workspace removal*).

## Mechanism (S198, S200, S199)

One repository stands behind every workspace, so there is one **operation log**: the log is what allows jj to "detect
and merge divergent operations" (S198), every workspace's snapshots land in it, and each workspace has its own
working-copy commit recorded in the operation's view (S198 §Operation log). "You can have multiple working copies backed
by a single repo" and "Each workspace can have a different commit checked out" (S200). Staleness is the working copy
failing to catch up with an operation: "When you modify workspace A's working-copy commit from workspace B, workspace A's
working copy will become stale" (S200), the usual cause being a rewrite of a commit it depends on from another workspace
(S199). The demo's four stale/fresh outcomes refine that sentence: modifying the seat's commit does not by itself
stale the seat. With auto-update disabled, most jj commands refuse to run on a stale workspace until
`jj workspace update-stale` (S199); the demo runs with `JJ_CONFIG=/dev/null` and reads `stale`, so this fixture did not
auto-update. Firefox's own setup enables auto-update because "some mach commands invoke jj and can fail, sometimes
silently, if the working copy is stale" (S199) — a deployment knob, not jj's default.

**Version skew (measured on two binaries).** The docs are v0.46.0 (S198, S200 cite the immutable `v0.46.0` path; the
`latest` alias served the same bytes on 2026-10-25); the host binary is jj 0.45.1. The demo was re-run on the official
jj 0.46.0 release binary (x86_64-unknown-linux-musl, sha256 `fce0271158e665ceb82dc66c5eb95b1728649094e9133074f3b5baece345fc08`,
commit `7d382314f9420b4b8d932245b49c99492c812b9f` = the tag `v0.46.0`; the release publishes no checksum file, signature or
GitHub attestation — `gh attestation verify` returns 404 — so the only cross-check is that the binary's self-reported commit
equals the tag's) from a scratch PATH: **20 of the 21 outcome keys are byte-identical on both versions across three runs
each**, and one key is version-dependent. `seat_has_git_dir` was `no` on 0.45.1 and `yes` on 0.46.0 because 0.46.0 makes
`jj workspace add` create a **Git worktree** for the seat whenever the current workspace is colocated and `git.colocate` is
true — its default (`jj workspace add --help`: "By default, a Git worktree is created when the current workspace is
colocated and the [git.colocate config] is `true`"; measured `jj config get git.colocate` → `true`). The demo's fixture *is*
colocated (`git init` then `jj git init`), so on 0.46.0 the seat received a `.git` file pointing into the default repo's
`.git/worktrees/<seat>`: the seat is a git worktree of the one repository. The demo therefore pins non-colocation with
`--no-colocate` where the version has the flag (0.46.0+), which keeps all 21 keys version-stable, and reports the
version-dependent facts as `JJ_SKEW:` lines that the counter does not read: `default_flags_seat_has_git_dir=no` (0.45.1) /
`yes` (0.46.0), `default_flags_seat_gitdir=none` / `default-repo-gitdir`. **The containment consequence is not a wording
change:** in a colocated seat a process can write the shared git object store and refs with plain `git` and no jj at all
(measured on 0.46.0: `git commit` in the seat exits 0, `git update-ref refs/heads/seat-leak HEAD` makes `seat-leak` a branch
of the default repo, while `jj log -r 'all()'` in the default workspace still shows no such commit). The stale/fresh wording
(`working copy is stale`) is identical on both versions; `jj workspace remove` exists only on 0.46.0 (`jj workspace --help`
on 0.45.1: 0 subcommands named `remove`) and is measured below, so no outcome key relies on it. S067 pins the v0.45.1
rendering of the working-copy page.

**Workspace removal (jj 0.46.0).** S200's removal sentences are now demonstrable, and the demo measures them
(`JJ_SKEW:` lines): `jj workspace remove <name>` prints `Removed workspace directory "<path>"` (plus `Removed Git worktree
for "<path>"` when the seat was colocated), exits 0, and the directory is gone (`workspace_remove_dir_after=removed`).
"Tracked changes are snapshotted before the directory is removed" holds in its sharpest form — a file written into the seat
and **never snapshotted** is snapshotted by the removal itself (the op log gains `snapshot working copy` immediately before
`remove workspace <name>`; the removed seat's change stays in `all()` and its content is readable with `jj file show -r
<change> root:<path>`: `workspace_remove_unsnapshotted_change_recovered=yes`). "Ignored files in that directory are deleted"
holds: an ignored file is absent from the snapshotted tree (`workspace_remove_ignored_file_in_tree=0`) and dies with the
directory. Three operational refusals were measured by hand on 0.46.0: `remove` on a **stale** seat fails (exit 1, `The
working copy is stale … Run jj workspace update-stale`), so a seat is cleaned up only after `update-stale` has already
deleted its abandoned files; `remove` on the **main** workspace fails (exit 1, `Cannot remove workspace 'default' because it
contains the repository`); `remove` on a workspace whose directory was deleted by hand fails (exit 1, `Cannot access
workspace '<name>' directory`, hint: use `jj workspace forget`) — the exact inverse of 0.45.1's only tool, `forget`. Removing
the **current** workspace from inside it works on Unix (exit 0, `Warning: The current workspace '<name>' no longer exists
after this operation. The working copy was left untouched.`, directory removed). `forget` on a colocated seat removes the
Git worktree registration and the seat's `.git` file while leaving the directory and its files (measured: `Removed Git
worktree for "<path>"`, seat files `.jj base.txt gitonly.txt` remain, `git -C <seat> rev-parse --git-dir` → `fatal: not a
git repository`).

## Decision table — seat write pattern → what a jj workspace does → guard still required

| seat write pattern | what a jj workspace does (demo key) | guard still required |
| --- | --- | --- |
| the seat edits files under its own workspace path | the edit stays out of the default tree (`seat_file_in_default_tree=no`), the default workspace reads clean (`default_status_clean_after_seat_write=1`), and the seat's next jj command adds a snapshot operation to the one shared log (`seat_snapshot_in_shared_op_log=1`) | the tree is isolated and the log is not: a seat's work is visible as an operation to every other workspace, so claim isolation comes from per-seat receipts, not from the workspace layout |
| the seat runs a read-only jj command | an unflagged command snapshots and adds an operation; `--ignore-working-copy` adds none and hides a pending file (`ignore_working_copy_adds_op=no`, `ignore_working_copy_hides_pending=yes`) | `--ignore-working-copy` on every read, as M1 of `agent-isolation-substrates.md` requires — the workspace boundary does not remove the snapshot hazard |
| another workspace describes the seat's checked-out commit | the seat stays fresh and reads the new description (`rewrite_seat_head_seat_state=fresh`) | a seat must re-read `@` rather than trust an identifier captured earlier in its run [INFERENCE: the demo prints the description, not the commit id] |
| another workspace changes the tree of the seat's commit, or abandons it while the seat carries content | the seat is stale (`rewrite_treechange_seat_state=stale`, `abandon_seat_head_seat_state=stale`), files kept until `update-stale` (`abandon_seat_head_files_on_disk=kept`); `update-stale` recovers the seat and deletes those files (`update_stale_abandoned_seat_file=deleted-no-recovery-commit`) | a supervisor never abandons or squashes into a live seat's `@`; a seat that finds itself stale commits or copies its files out before running `update-stale`, because recovery drops them from disk |
| another workspace abandons an empty seat head | the seat stays fresh (`abandon_empty_seat_state=fresh`) | none needed for an empty seat; do not rely on this for a seat that has written anything |
| two seats abandon each other's empty heads | both end fresh after one status each (`cross_abandon_both_fresh_after_status=yes`); with content on both sides the first abandoned seat is stale and cannot run the second abandon (hand-measured, `measurements-abandon-matrix.txt`) | a stale seat cannot act, so staleness limits the damage a seat can do to a peer, but only for seats that have content |
| the seat writes into the default workspace by path | the write lands in the default tree and its status shows it (`absolute_path_write_seen_in_default=1`) | absolute paths in every seat write plus the L1 misroot sweep — a workspace is not a sandbox, as M3/M4 of `agent-isolation-substrates.md` establish for git |
| the seat is forgotten (`jj workspace forget`) | the registration goes (`workspaces_after_forget=1`), the directory stays (`seat_dir_after_forget=present`), the seat's commit stays visible (`forget_seat_commit_in_all=yes`) | cleanup is an explicit directory removal plus `jj abandon` of the seat's commits if they must leave history; forgetting is neither |
| the seat is released with `jj workspace remove` (jj 0.46.0+) | the directory is deleted (`workspace_remove_dir_after=removed`) after the seat's changes are snapshotted, including files never snapshotted by the seat (`workspace_remove_unsnapshotted_change_recovered=yes`); ignored files die with the directory (`workspace_remove_ignored_file_in_tree=0`); a stale seat and the main workspace are refused (`workspace_remove_stale_refused=yes`, `workspace_remove_main_refused=yes`) | run `update-stale` first if the seat is stale (that deletes its abandoned files) and never rely on `remove` as an isolation primitive: it deletes a seat's uncommitted work only after committing it into the shared repository |
| the seat is created without `--no-colocate` on jj 0.46.0+ (colocated default repo, `git.colocate=true`) | the seat is a **Git worktree** of the default repo (`JJ_SKEW: default_flags_seat_has_git_dir=yes`, `default_flags_seat_gitdir=default-repo-gitdir`), so plain `git` inside the seat writes the shared object store and refs (measured: `git update-ref refs/heads/seat-leak HEAD` in the seat adds a branch to the default repo) while `jj log -r 'all()'` in the default workspace shows nothing | the git store is shared: a seat that must not touch the repository's git state needs `--no-colocate` or a clone, and a receipt cannot be "git refs unchanged" unless the seat had no git access |
| a seat must not see another seat's claims | impossible inside one repository: one operation log, every workspace's operations in it (S198) | separate repositories (clones) per seat, not workspaces |

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
- S200 — "Tracked changes are snapshotted before the directory is removed, but ignored files in that directory are deleted."
- S200 — "The main workspace cannot be removed."

## Limits

- **Not a security boundary.** The demo writes into the default workspace from a seat-positioned process; that is an honest-seat
  accident model, not an escape analysis (kasegi and kagi ground).
- **Two jj versions, sequential drivers.** Measured on jj 0.45.1 and on the official jj 0.46.0 release binary (20/21 keys
  identical across three runs each; see *Version skew*), with two or three workspaces driven one command at a
  time by one process: no two writers race, no operation-log merge conflict is produced, nothing measures parallel
  throughput or lock behaviour (S198 describes the merge; the demo never triggers it). A third version is unmeasured.
- **Fixture-dependent counts.** `seat_snapshot_in_shared_op_log` is an op-count delta in one fresh fixture; only the contrasts
  carry over. `ignore_working_copy_adds_op` and the stale/fresh keys print the wording of the jj versions measured
  (`working copy is stale`, identical on 0.45.1 and 0.46.0); a third jj may read differently, not silently pass.
- **The stale/fresh rule is a fit, not a documented rule.** S200's sentence says modifying a workspace's working-copy
  commit makes it stale; the demo's describe case contradicts the unqualified reading and the tree-identity reading fits all
  four outcomes. No document in S198–S200 states the tree-identity rule [INFERENCE].
- **The auto-update knob is observed, not exercised.** `snapshot.auto-update-stale = true` was not run; S199's default is
  Firefox's `./mach vcs-setup`, not jj's.
- **Not measured:** whether the seat's change id survives the rewrite (the demo prints the description only), what a seat sees
  when its workspace is forgotten while a command runs, `jj workspace remove` on a **divergent** (concurrent) operation, and
  git-side effects in the colocated default workspace beyond the ref write measured in *Version skew*.
- **What the counter cannot tell.** The frozen counter J64 measures an evidence chain and a live demo re-run; it would score a
  well-grounded wrong entry 8/8 (`.ufo/waves/round-64/plan.md`, stated limit; K64CriticC2Predicate reproduced four forgeries).

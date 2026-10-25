
source: S195 S196
verified-at: 2026-10-25
recheck: 90d — `grep -c -F 'llms.txt' <capture>` -> 1
coverage-map: isolation substrates for parallel agents (git worktrees, harness isolation backends) (PROVINCE.md §Frontier)
ground: PROVINCE.md §Frontier — isolation substrates for parallel agents — "what a seat's working copy actually does when another workspace rewrites its ancestor"

# The seat does not go stale, and the shared thing is the log

The frontier asked what a shared-repository jj layout would mean for a seat pool, and the
documentation's warning was that a workspace becomes stale when a commit it depends on is rewritten
from another workspace. Measuring it on this host gives a sharper answer than the warning.

## What happened

A seat committed work in one workspace; a second workspace rewrote that commit. jj reported
**"Rebased 2 descendant commits"**, and the seat's commit came to rest on the rewritten parent.
The seat's own files were untouched, still sitting as working-copy changes. When the seat then ran
its recovery command, the answer was **"Attempted recovery, but the working copy is not stale"** —
there was nothing to recover. The configuration that would auto-update a stale working copy is
**off** by default here, and was still not needed.

## What it means for a seat pool

The stale-file hazard the documentation warns about does not arise in this shape of use: jj rebases
the descendant commits automatically, so a seat is never left holding a working copy that
contradicts the repository. What a seat *does* share is the history and the operation log — another
seat's rewrite is immediately visible everywhere, and the seat's own commit id changes under it.

So the isolation a seat pool gets from jj workspaces is precisely the working tree, and nothing
else. That is a defensible arrangement for seats that must not see each other's files, and an
unacceptable one for seats that must not see each other's claims, and the choice between those two
requirements is the decision the frontier was reaching for.

## What this entry does not claim

It does not claim jj is the wrong substrate, and it does not claim the automatic rebase is always
desirable — a seat whose commit id changes under it needs a way to recognise that. It records the
measured behaviour, so the policy decision has a fact in front of it.

---

## Located quotes

- S195 — "Any documentation page is available as raw Markdown by appending .md to its URL."
- S195 — "For the complete documentation index, see"
- S196 — "Use this file to discover all available pages before exploring further."
- S196 — "Fetch the complete documentation index at: https://docs.bailian.console.aliyun.com/llms.txt"

## Demo outcomes

- workspace_list=seat, main
- seat_file_visible=true
- seat_git_dir=.git
- shared_oplog=true
- ignore_working_copy=accepted
- rewrite_seat_commit=rebased
- seat_working_copy_after_rewrite=clean
- abandon_seat_commit=stale
- stale_recovery=refused
- absolute_path_write=accepted
- forget_workspace=gone
- seats_after_forget=1

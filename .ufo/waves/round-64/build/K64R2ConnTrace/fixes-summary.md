# Summary of Required Fixes for corpus/knowledge/jj-workspace-seat-containment.md

Based on sentence-level traceability analysis (55 substantive sentences evaluated in `trace.tsv`), the following fixes are required to align the entry with lane truth, sibling lane boundaries, and the canonical contract:

## 1. Fix Mechanism Attribution in Decision Table (Finding K64R2ConnTrace-1)
- **Target:** Line 77, col 3: `absolute paths in every seat write plus the L1 misroot sweep — a workspace is not a sandbox, as M3/M4 of agent-isolation-substrates.md establish for git`
- **Issue:** M3 defines git repository-locating variable leaks (`GIT_DIR`); M4 defines linked worktrees sharing common repository state (`.git/config`, hooks, `info/exclude`). Neither establishes absolute path requirements or the L1 misroot sweep. That requirement was established in `agent-isolation-substrates.md` § Host facts (lines 43-46) and QUALITY Q27, while "not a security sandbox" is cited from S013 (lines 26-27).
- **Required Fix:** Reword line 77 col 3 to cite Host Fact #2 (lines 43-46) and S013:
  `absolute paths in every seat write plus the L1 misroot sweep — a workspace is not a sandbox, as Host Fact #2 and S013 of agent-isolation-substrates.md establish`

## 2. Label Unmarked Inferences with [INFERENCE] or Narrow to Primary Sources (Finding K64R2ConnTrace-2)
Four substantive sentences state ungrounded inferences as unqualified facts without the required `[INFERENCE]` label:
1. **Line 14-15 (Sentence S07):** "...the rule that decides whether a seat goes stale (the seat's on-disk tree against the tree of its new commit — not the kind of operation)..."
   - *Fix:* Insert `[INFERENCE]` or note: `the rule that decides whether a seat goes stale [INFERENCE: tree-identity rule derived from demo]` as done in line 30-31 and line 133.
2. **Line 55-56 (Sentence S21):** "The demo's four stale/fresh outcomes refine that sentence: modifying the seat's commit does not by itself stale the seat."
   - *Fix:* Append `[INFERENCE: refined from demo outcomes against S200 literal text]`.
3. **Line 74 col 3 (Sentence S35):** "...a seat that finds itself stale commits or copies its files out before running update-stale, because recovery drops them from disk"
   - *Fix:* Label policy recommendation as `[INFERENCE: derived from update_stale_abandoned_seat_file=deleted-no-recovery-commit]`.
4. **Line 76 col 3 (Sentence S39):** "a stale seat cannot act, so staleness limits the damage a seat can do to a peer, but only for seats that have content"
   - *Fix:* Correct overstatement and label inference: flagged reads (`--ignore-working-copy`) and OS writes outside jj still execute. Reword to: `a stale seat cannot execute unflagged mutating commands [INFERENCE], limiting unflagged peer mutation, but only for seats that have content`.

## 3. Disclose `snapshot.auto-track` Precondition on Shared Op-Log Delta (Finding K64R2ConnTrace-3)
- **Target:** Lines 38-39 (S15), 71 (S28), 72 (S30).
- **Issue:** Claiming that "an unflagged command snapshots and adds an operation" (`seat_snapshot_in_shared_op_log=1`) on a new untracked file (`seat.txt`) relies on default `snapshot.auto-track = "all()"` present under `JJ_CONFIG=/dev/null`. In contrast, Souji Rule 1 (`jj-colocation-receipts.md` §6) and Kumitate operating rules mandate `snapshot.auto-track = "none()"`. Under `none()`, a new untracked file produces zero op-log delta on an unflagged `jj status`.
- **Required Fix:** Disclose in § Mechanism / Decision Table that op-log snapshot delta on new paths requires auto-track, and that under `auto-track="none()"` unflagged status on new files does not create a snapshot op.

## 4. Cite Sibling Lane Findings for Absorbed Substrate Facts (Finding K64R2ConnTrace-4)
- **Target:** Line 40 (S15, `seat_has_git_dir=no`) and Line 138 (S54, "git-side effects in the colocated default workspace").
- **Issue:** Absorbs cross-lane facts regarding jj workspace directory structure without citing Hyaku `JjDocWorktrees.md` F12 (jj workspaces lack `.git` and cannot host git tools). Completely leaves git-side colocation effects unaddressed without citing Souji `jj-colocation-receipts.md`.
- **Required Fix:** Add citations in § Scope / Limits to Hyaku's `JjDocWorktrees.md` F12 and Souji's `jj-colocation-receipts.md` for colocated git ref import/export semantics.

## 5. Synchronize Coverage-Map Header with PROVINCE.md (Finding K64R2ConnTrace-5)
- **Target:** Line 6: `coverage-map: isolation substrates for parallel agents (git worktrees, harness isolation backends) (PROVINCE.md §Frontier)`
- **Issue:** PROVINCE.md line 21 was updated to `(git worktrees, harness isolation backends, jj workspaces)`.
- **Required Fix:** Update line 6 to include `, jj workspaces` to eliminate header drift against PROVINCE.md § Frontier.

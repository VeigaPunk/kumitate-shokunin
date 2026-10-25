VERDICT: Cross-sibling scan reveals 6 candidate sentences are new orchestration facts, 1 is adjacent to Tabi (update-stale Git HEAD reset), and 1 is a negative boundary adjacent to Kagi/Souji (path non-containment); C2 must ground workspace topology while routing path and git-ref boundaries to sibling provinces.

## Evidence

1. Sibling scan (`rg -i -l "jj workspace|update-stale|operation log|op log|stale working copy|colocat"` across `*-shokunin/corpus` and `PROVINCE.md`):
- `souji`: `corpus/knowledge/jj-colocation-receipts.md:7-15` covers colocated `.git`/`.jj` and detached HEAD (`@-`); `git-repo-structure-common-dir.md:47` explicitly notes: "Real jj-managed repositories: keep refs are simulated; jj's own ref writes, op log and `.jj/` store are not exercised." Souji owns worktree pruning and colocation hygiene, not workspace containment.
- `tabi`: `corpus/lessons/round-17.md:62` (S050/S056) holds: `"In colocated workspaces, \`jj workspace update-stale\` now correctly resets the Git HEAD to the parent of the fresh working-copy commit."` (Jujutsu CHANGELOG v0.45.1).
- `tameshi`: `corpus/SOURCES.md:80` (S071) noted stale working copy recovery from jj docs, but REJECTED the row for colocation bookmarks. `corpus/knowledge/guard-kill-closure.md:149` notes unbound jj workspace with detached HEAD is refused.
- `tsukuroi`: `corpus/QUALITY.md:37,118` and `lessons/round-25.md:60`, `round-28.md:49`, `round-31.md:59` record repeated seat containment failures: seats pushing to lane origin (R25), inheriting leaked `GIT_DIR` (R28), or running raw `git commit` in the lane (R31).
- `kagi`: `corpus/knowledge/adjacency-scope.md` and `corpus/revision-audit.py:75` audit path escapes for `.git` and `.jj`.
- `kumitate`: `corpus/knowledge/agent-isolation-substrates.md:149-151` (M7): "jj workspaces share one repository. S067 § Workspaces: «You can have multiple working copies backed by a single repo.»; rewriting a commit another workspace has checked out makes that workspace stale. Not demonstrated this round; no table row relies on it."

2. Live hermetic demo (`bash scripts/jj-seat-demo.sh` → exit 0, jj 0.45.1):
```
JJ_SEAT: workspaces_after_add=2            JJ_SEAT: rewrite_seat_head_seat_state=fresh
JJ_SEAT: seat_gets_base_file=yes           JJ_SEAT: rewrite_seat_head_description_seen=rewritten
JJ_SEAT: seat_has_git_dir=no               JJ_SEAT: abandon_seat_head_seat_state=stale
JJ_SEAT: seat_file_in_default_tree=no      JJ_SEAT: abandon_seat_head_files_on_disk=kept
JJ_SEAT: default_status_clean_after_seat_write=1   JJ_SEAT: update_stale_recovers=yes
JJ_SEAT: seat_snapshot_in_shared_op_log=2  JJ_SEAT: absolute_path_write_seen_in_default=1
JJ_SEAT: ignore_working_copy_adds_op=no    JJ_SEAT: workspaces_after_forget=1
JJ_SEAT: seat_dir_after_forget=present
JJ_SEAT_DEMO: DONE jj=0.45.1-7c41cdeb16b6b321c64e789a966b6adf723816a5
```

## Decision Table

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

## Proposed Move & Synthesis

**Proposal:** Ground C2's `jj-workspace-seat-containment.md` strictly on novel orchestration topology (separate working trees, shared op-log, rewrite vs abandon staleness divergence, recovery, and forget persistence), while explicitly routing contested boundary surfaces to established sibling provinces:
1. Declare filesystem path non-containment (`absolute_path_write_seen_in_default=1`) as an explicit negative limit adjacent to Kagi (`kagi-shokunin/corpus/knowledge/adjacency-scope.md`) and Souji (Q27 fleet-root write hazard). It must not be presented as a containment property.
2. Cite Tabi (`tabi-shokunin/corpus/lessons/round-17.md:62`) for the Git HEAD reset mechanism under `update-stale`, preventing redundant authority claims while Kumitate establishes the operational working-copy recovery key.
3. Cross-reference Tsukuroi's seat-push/commit containment failures (R25, R28, R31): because `seat_has_git_dir=no`, any seat running raw git commands will walk up to parent directories and risk fleet/lane repo pollution unless wrapped with Kumitate's M3 git-env scrub.

**Affected axes:** Coverage (C2) advances with rigorous non-overlapping ground; Calibration/Adjacency avoids province breach with Souji/Kagi/Tabi; Operability hardens seat execution.
**Risks:** Tooling that assumes `.git` in working copies will fail or leak to parent repositories.
**Verification:** Re-run `bash scripts/jj-seat-demo.sh` (all 15 keys match J6); verify citations in Tabi, Souji, Kagi, Tsukuroi.

## Findings

- **K64ConnJjSiblingOverlap-1 (MED — Citation): Sibling fact overlap on `update-stale`.** Tabi (`tabi-shokunin/corpus/lessons/round-17.md:62`, S050/S056) already mined the normative changelog fact that `jj workspace update-stale` resets Git HEAD to `@-`. Kumitate C2 must cite Tabi rather than re-mining Git HEAD reset, focusing its claim on working-copy recovery (`update_stale_recovers=yes`). Repro: `rg -n "update-stale" /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/`.
- **K64ConnJjSiblingOverlap-2 (HIGH — Province boundary): Absolute-path leakage is adjacent to Kagi/Souji, not an isolation feature.** `absolute_path_write_seen_in_default=1` proves jj workspaces lack filesystem path isolation. Claiming path containment would infringe Kagi's province (`kagi-shokunin/corpus/knowledge/adjacency-scope.md`). It must be documented as an explicit stated limit. Repro: `bash scripts/jj-seat-demo.sh | grep absolute_path_write`.
- **K64ConnJjSiblingOverlap-3 (MED — Lane contradiction): Unqualified staleness claim in M7 refuted.** `agent-isolation-substrates.md:149-151` states rewriting a checked-out commit makes the workspace stale. Demo proves description-only rewrites leave it `fresh`. The J8 amendment must explicitly narrow M7. Repro: `bash scripts/jj-seat-demo.sh | grep rewrite_seat_head_seat_state`.
- **K64ConnJjSiblingOverlap-4 (MED — Substrate hazard): `seat_has_git_dir=no` triggers Tsukuroi-class escape without M3.** In secondary workspaces without `.git`, raw git commands walk upward to find parent/fleet git repositories, reproducing Tsukuroi R28/R31 leaks. Workspaces must be coupled with M3 env-scrubbing. Repro: `git -C <seat_workspace> rev-parse --git-dir` vs `git -C <seat_workspace> commit`.

## Artifacts

- Report: `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-64/w1/K64ConnJjSiblingOverlap.md`
- Build artifact: `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-64/build/K64ConnJjSiblingOverlap/decision-table.md`
- Scratch: `/tmp/kumitate-r64/K64ConnJjSiblingOverlap/demo.txt`

## Limits

- Only inspected sibling corpus (`SOURCES.md`, `knowledge/`, `lessons/`) and `PROVINCE.md`; did not execute sibling gates or mutators.
- Live demo validated on host jj 0.45.1-7c41cdeb only.
- Did not inspect uncommitted scratch directories of sibling lanes.

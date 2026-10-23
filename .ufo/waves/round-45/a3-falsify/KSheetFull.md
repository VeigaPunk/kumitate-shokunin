RESULT KSheetFull rev=6b2a4517 verdict=passes fail=none owed=K2'-rerun,K3'-channel

# KSheetFull — whole-checklist application, C1 entry at 6b2a4517

Checklist source: .ufo/waves/round-45/plan.md § E7 (lines 125-142) and § E9 (lines 170-202). Lane bounds respected: only this report written in the lane; read-only git only; no subagents; no installs.

## Ordering and immutability (verified from git)
- `git log --oneline`: 31656bd (E9) precedes 6b2a4517 (entry); `git merge-base --is-ancestor 31656bd 6b2a4517` exit 0; commits distinct. E9 strictly before entry. PASS.
- `git log --format='%H' -- corpus/knowledge/agent-isolation-substrates.md` shows only 6b2a4517 touches the file; `git diff 6b2a4517..HEAD --stat -- <entry>` empty. Entry unchanged since. PASS.
- `git diff 6b2a4517 -- .ufo/waves/round-45/plan.md` shows only the appended E10 section (pure insertion after line 200); E7/E9 bytes frozen. PASS.
- `git diff 6b2a4517 --stat -- .ufo/waves/round-45/a2-control/ .ufo/waves/round-45/probe/` empty: all judged receipts are committed bytes at the entry commit.

## K0 — PASS (committed entry bytes)
Decision table has 6 rows (>=5); source header cites new rows S062-S074 = 13 (>=5); Receipts section cites 8 committed a2-control receipts: RedoDemoJjSnapshot/JjGitStray/GitEnvLeak/WorktreeShared/BwrapEnv/NativeMemCap.md, SentinelSeatEnvScrub/BwrapEnvI.md (>=5).

## K1′ — PASS (receipts opened)
Every row names one mechanism defined in the entry's own § Mechanisms and >=1 committed a2-control receipt; no row rests on a source locator alone. Row-to-effect binding confirmed by opening each receipt: row1->M1 jj snapshot (RedoDemoJjSnapshot.md:33-42,62-86); row2->M2 import/re-anchor (RedoDemoJjGitStray.md:40-57); row3->M3 GIT_DIR/GIT_CONFIG leak (RedoDemoGitEnvLeak.md:23-31,65-77; SentinelSeatEnvScrub.md:31-33); row4->M4 shared worktree surfaces (RedoDemoWorktreeShared.md:43-87); row5->M5 /proc/1/environ leak (RedoDemoBwrapEnv.md:146-153; SentinelBwrapEnvI.md:23-50); row6->M6 cgroup vs heap cap (RedoDemoNativeMemCap.md:252-296).

## K2′ — PASS (structural) + OWED re-run
Each cited demo receipt prints effect before/after and control before/after from a stated clean pre-state, with differing deltas: JjSnapshot (before/after counters per case, control_clean all-zero, second run identical, lines 50-81); JjGitStray (AT_BASE vs AFTER_RAW_GIT_COMMIT; control arm C before/after printed, no import, lines 40-61); GitEnvLeak (A 1->2->3 vs B stays 1; control cA stays 1, cB 1->3; lines 65-77); WorktreeShared (subject probes vs clone control negative probes, lines 43-132); BwrapEnv (V1-V4 counts+markers vs C0 no-marker control, lines 146-165); NativeMemCap (A/B exit 0 vs C exit 137 oom-kill, lines 252-296).
OWED: the K2′ falsify re-run reproducing each cited effect AND its do-nothing control from a clean pre-state (E10's six guard ablations are this baseline; not this seat's work). Note: WorktreeShared/JjGitStray controls are outcome-contrast (qualitative probes), not numeric counters; the delta-difference is still demonstrated.

## K3′ — PASS with one flagged version marker + OWED channels
All 13 Reopen receipts (S062-S074) verdict=confirmed; quotes found verbatim, section locality confirmed, page version markers checked: S062 (footer "last updated in 2.56.0"), S064/S066/S067/S068/S069/S070 (pinned tags v2.56.0/v0.45.1/v18.12.6/v0.13.1), S065 (in-page "git last updated in 2.56.0"), S071 (COLOPHON man-pages 6.19 = host), S072 (banner systemd 262 = host), S073 (meta node-version v24.21.0 = host), S074 (jj binary 0.45.1-7c41cdeb).
FLAG: S063's fetched page's own marker is "gitrepository-layout last updated in 2.49.0"; the row labels "Git 2.56.0". ReopenS063.md:10-11 reconciles via the page's own "2.49.1 -> 2.56.0 no changes" widget and the row's locator note ("versioned /2.56.0 URL redirects to 2.49.0, see S076"). Literal marker text does not equal the claimed version; substance holds. For the closure.
S013 (flipped, cited): ReopenS013.md:18-31 corrected the locator; committed row now lists all four sections; quote found verbatim under § Safety and resource cost; page unversioned (no version claimed). S027 (flipped, cited): ReopenS027.md:22-24 no quote attributed; paraphrase confirmed at tag v2.55.0 lines 38-39.
OWED: independent-channel re-opens (E10: 15 seats) for each cited row; for S063 the second channel should re-confirm the version binding.

## K4 — PASS
Entry names prior-corpus passages it does not restate (omp-task-contract.md:90-102, pinned-evidence.md:98-101, lessons/round-44.md:129,138, round-42 SentinelGateMutants.md:130, round-36 ScoutPinDesign.md:63) and cites sibling-lane owners with specific files (souji rej-colocation-receipts.md, git-auto-maintenance-prunes-worktrees.md, SOURCES S089; tameshi guard-kill-closure.md, hermetic-env-differential.md; tsukuroi memory-pressure-r25.md; mori userspace-oom-killers-r26.md, kernel-oom-line-attribution-r12.md, oom-victim-selection-r27.md; kagi adjacency-scope.md). ConnOverlapRecheck.md:12-23 verified all cited sibling files exist at committed HEADs; the draft's broken mori oom-event-plane.md citation was NOT carried into the committed entry. PASS.

## K5′ — PASS
The two practice-change rows are read in the decision table's operative required guards column only: row "edit code/run a gate" (guard line incl. unset $(git rev-parse --local-env-vars), GIT_EXEC_PATH/GIT_CEILING_DIRECTORIES, GIT_CONFIG_GLOBAL=/dev/null, GIT_CONFIG_NOSYSTEM=1, "tested by SentinelSeatEnvScrub") and row "run untrusted/generated code" (env -i PATH=/usr/bin:/bin HOME=/tmp as bwrap's immediate parent, or spawn {env:{PATH,HOME}}, plus --clearenv --setenv). Baseline vs round-44 committed practice confirmed by CtlCheckK5Baseline.md:5-7 (B1: exactly three GIT_* names on clone AND checkout lines; B2: p44d --clearenv with no spawn env). Earlier wider-scrub/spawn-env passages named by the entry (K4). Minor note: the row-3 guard cell is a variable-rename/abbreviation of the tested one-liner (dropped the second `|| exit`); semantically identical, no defect.

## Findings by severity
1. (low) S063 version-marker literal mismatch: page's own marker says 2.49.0, row claims 2.56.0; reconciled in-page and in-row, but the literal marker does not match (ReopenS063.md:10-11, row S063 at corpus/SOURCES.md:76).
2. (info) Row-3 guard text not byte-identical to the tested guard (SentinelSeatEnvScrub.md:40); cosmetic.
3. (info) K2′ control contrast for rows 2/4 is qualitative; receipts print before/after state, not numeric counter deltas.
4. (info) S068's "host config.yml has no isolation key" is inherited (stat-only per binding); entry lists it under Host facts, not as a sourced row (ReopenS068.md:32).

## Verification gaps / residual risk
- Sibling-lane HEADs were checked at a2e5b54c time; a fresh re-check would re-confirm citations (not required by the frozen K-items).
- Live pages can drift after the wave-1 fetches; receipts pin sha256s where the row has them, which is the committed evidence.
- K2′/K3′ re-runs and independent-channel opens are other seats' work, listed as OWED above.

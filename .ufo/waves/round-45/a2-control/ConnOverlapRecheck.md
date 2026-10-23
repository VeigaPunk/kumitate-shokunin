RESULT ConnOverlapRecheck rev=a2e5b54c verdict=overlap confirmed=22/23 contradictions=1

# Sibling-overlap re-check (round 45 wave 1) — ConnOverlapRecheck

Scope: read-only over sibling lanes at their committed HEADs. Inherited report
.ufo/waves/round-45/build/ConnSiblingOverlap.md (UNTRUSTED) treated as claims to re-derive.

## 1. Existence check at committed HEAD (git ls-files + log -1)

Command pattern: `git -C /home/vgpnk/Projects/shokunin/<lane>-shokunin ls-files --error-unmatch <file>` and `git -C ... log -1 --format=%h -- <file>`.

Confirmed present (22/23):
- souji: jj-colocation-receipts.md @3f822e8; git-auto-maintenance-prunes-worktrees.md @fb23b12; git-repo-structure-readonly.md @fb23b12; corpus/SOURCES.md (S036 @56, S089 @109).
- tameshi: hermetic-env-differential.md @370f2df; guard-kill-closure.md @370f2df; service-limits.md @58e5d53.
- tsukuroi: seat-boundary-r22.md @f39e40a; boot-writers-r19.md @7f42314; snapper-eacces-mechanism.md @68a8ae0; memory-pressure-r25.md @75784ea; root-dac-correction-r13.md @9dd82bc; corpus/SOURCES.md (S072 @78).
- mori: userspace-oom-killers-r26.md @79ecf58 (oom-event-plane.md NOT FOUND — see §3).
- kasegi: ufo-workspaces.md @c8b719d; source-tree-loss-2026-09-28.md @c8b719d.
- kagi: adjacency-scope.md @8ada17a; config-layering.md @f4a8dd9.
- kengaku: corpus/lessons/round-29-source-copy-containment.md @1f3b0f1.

- tabi: corpus/SOURCES.md (S049/S050/S055/S056 queued) @0f24164.
- kotoba: corpus/knowledge/agents-md-and-dispatch-surfaces.md @e792607.
NOT found (1/23): mori corpus/knowledge/oom-event-plane.md — `git ls-files --error-unmatch` returns "pathspec ... did not match any file(s) known to git"; no untracked copy (`find mori-shokunin -name '*event-plane*'` empty).

## 2. Mechanisms the draft already holds in a sibling (cite, do not restate)

Draft /fast/scratch/.../inherited-entry-draft.md mechanisms M1–M7 vs sibling primary sources:

- M1 (jj snapshots working copy; auto-track) — souji jj-colocation-receipts.md §6 + SOURCES S052 (working-copy.md:14) and S053 (config.md auto-track default). Draft's S074 quote adds the "snapshots at beginning of every command" wording; souji holds the same rule with S052/S053. Entry must cite souji, not restate.
- M2 (raw git writes imported, re-anchor @) — souji §1 (S051: "Jujutsu will import and export ... on every jj command automatically") and §5 (S051: staging area ignored). Draft's S066 quotes are the same doc at closer lines; cite souji as owner.
- M3 (GIT_* beat -C) — souji SOURCES S089 ("A supplied -C directory alone is not a repository-selection guarantee") and tameshi guard-kill-closure.md P11 (exported GIT_DIR honoured by subprocess). Draft's S064/S065 quote the same git(1) page; cite souji S089 + tameshi.
- M4 (linked worktree not a separate repo) — draft cites S062/S063 for shared refs/config/hooks/exclude. souji additionally holds the worktree-prune mechanism (git-auto-maintenance-prunes-worktrees.md, S003/S009/S010) that the draft omits; entry should add a citation line to souji's worktree-prune entry (overlap, not absorption).
- M5 (bwrap --clearenv leaves PID 1 env) — tameshi guard-kill-closure.md §7 (bwrap envelope runs with env -i, private /tmp, isolated PID/net namespaces; "envelope is a sandbox for the probes, not a proof of containment"). Draft's S069/S070 primary sources extend tameshi's method-level claim; cite tameshi for the envelope method.
- M6 (V8 heap cap != native bound; cgroup does) — tsukuroi memory-pressure-r25.md (S072 systemd-run transient units) + S072 quote verified live ("will thus inherit the execution environment of the caller"); mori holds memory.events / oom_kill attribution. Draft's S072 matches tsukuroi's S072 (same URL). Cite tsukuroi and mori.
- M7 (jj workspaces share one repo) — no sibling holds a primary source for jj workspaces in 0.45.1 (souji does not cover workspaces; tabi S056 is queued, not mined). Draft's "not stated in 0.45.1 docs" stands; keep as draft's own.

## 3. Contradictions between sibling text and the draft

1 (counted): draft scope cites `mori-shokunin/corpus/knowledge/oom-event-plane.md` as the OOM owner, but that file does not exist at mori HEAD (§1). mori's actual OOM files are userspace-oom-killers-r26.md (earlyoom running, systemd-oomd inactive) and kernel-oom-line-attribution-r12.md / oom-kill-counter-kernel-only-r12.md / oom-victim-selection-r27.md. The draft's M6 citation line must be corrected or the row fails K4. This is the only direct contradiction.

Qualifications (not contradictions, but the draft should absorb the wording):
- souji §1 (S051) says mixing jj and git "is allowed ... in any order" while warning interleaving "increases the chance of confusing branch conflicts". Draft M2 frames raw git as re-anchoring @ without the permitted-but-risky qualifier. Not contradictory; add the qualifier citation.
- tameshi guard-kill-closure §7 says the bwrap envelope is "not a proof of containment". Draft already says "No security boundary" and "mechanism-only"; consistent. No change needed beyond citing tameshi.
- mori userspace-oom-killers-r26 says systemd-oomd is inactive on this host and earlyoom is active. Draft's practice (systemd-run --scope MemoryMax) does not depend on systemd-oomd, so no contradiction; but the entry's "host facts" should not imply systemd-oomd participation.
- kasegi ufo-workspaces.md and kagi adjacency-scope.md do not hold a threat model for sandbox escape (workspace layout and ownership partition respectively). Draft's "security practice -> kasegi/kagi" is a pointer, not a re-derivation; consistent with draft's "no security guarantee" line. No contradiction.

## 4. K4 implication

K4 requires the entry to name prior-corpus passages it does not restate and to cite sibling-lane owners instead of re-deriving. The draft's scope section does cite souji/tsukuroi/mori/tameshi/kagi/kasegi, but the mori citation is broken (§3.1), so K4 is at risk until the citation is corrected to an existing mori file. All other named sibling files exist at HEAD and their mechanism text is consistent with the draft (with the souji worktree-prune and souji mixing-permitted qualifiers to add).

## 5. Host-fact / tooling notes

No tools installed or updated by this seat. No lane files written except the report above. No git/jj writes performed.
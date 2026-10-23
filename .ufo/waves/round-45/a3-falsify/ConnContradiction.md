RESULT ConnContradiction rev=6b2a4517 verdict=conflicts contradictions=4 restated=3 stale=3

# ConnContradiction — contradiction scan of agent-isolation-substrates.md @ 6b2a4517

Scope: committed entry (judged object) vs lane files at 6b2a4517: PROVINCE.md, SKILL.md,
corpus/knowledge/{omp-task-contract,pinned-evidence,omp-agent-root}.md, corpus/lessons/round-44.md,
.ufo/waves/round-42/build/SentinelGateMutants.md, .ufo/waves/round-36/build/ScoutPinDesign.md,
.ufo/waves/round-45/plan.md, .ufo/waves/round-45/a2-control/CtlCheckK5Baseline.md,
.ufo/waves/round-45/a2-control/SentinelSeatEnvScrub.md, .ufo/waves/round-45/a3-falsify/KSheetFull.md.
Read-only lane; only this report written.

## (a) Contradictions — factual statements in the entry vs other lane files

1. Entry Practice change 1: "M3 shows that is short twice over: git lists 15 local variables, and a
   clone-line scrub still commits into the inherited repository", framing round-44's 3-var scrub as the
   prior baseline. But round-42/build/SentinelGateMutants.md:130 (R3) already required scrubbing 9 names
   (incl. GIT_CEILING_DIRECTORIES, GIT_CONFIG_GLOBAL, GIT_CONFIG_SYSTEM) and round-36/build/ScoutPinDesign.md:63
   required deleting every GIT_-prefixed key. The 15-name list (git rev-parse --local-env-vars) omits those three
   config/ceiling names, so "widened" holds only vs round-44 wave practice, not the lane corpus.
   (CtlCheckK5Baseline.md D1.)

2. Entry decision-table row "run untrusted/generated code" guard cell: "env -i PATH=/usr/bin:/bin HOME=/tmp as
   bwrap's immediate parent (from Node: spawn(..., {env: {PATH, HOME}}))". CtlCheckK5Baseline.md D2: the frozen
   counter spawns bwrap from Node with no shell in front, so env -i is shell-only there; the Node equivalent is the
   spawn `env:` option, already prescribed at corpus/lessons/round-44.md:129. The parenthetical conflates the two
   paths and presents env -i as the fix for a Node-spawned counter.

3. Entry Practice change 2: "No lane runner implements it yet (the round-45 runner seat died without a report)".
   But .ufo/waves/round-45/plan.md:71 (R44-3) promised "a lane sandbox runner with --clearenv, a cgroup memory cap...".
   The entry reports reality while the plan promised delivery; the two disagree on whether a runner exists/will exist,
   and the entry does not reconcile plan.md's --clearenv with K5's env -i prescription. (CtlCheckK5Baseline.md D3.)

4. Entry decision table row "any git write in the lane": substrate "none: the lane helper `jj-lane.sh` is the only
   writer". No `jj-lane.sh` exists anywhere in this lane repo (verified: find . -name "jj-lane*" -> none;
   grep -rn jj-lane corpus/ -> none). The helper lives in the fleet repo at scripts/hyaku/jj-lane.sh, so "the lane
   helper" is inaccurate for this lane's file tree.

## (b) Statements restated without citing the earlier entry

1. Entry "Harness isolation is not a row: isolated: true (OMP PAL backends btrfs/zfs/reflink/overlayfs/rcopy, S068)":
   restates the backend list from corpus/knowledge/omp-task-contract.md:90-96 without a local citation to that entry
   (cites S068 only). The entry's "not restated" list cites omp-task-contract.md:90-102 generally, but this sentence
   does not.

2. Entry M3 "git's repository-locating variables beat -C and cd, and config variables survive a local-variable scrub":
   restates the ambient-GIT_DIR redirect from corpus/knowledge/pinned-evidence.md:98-101 (cited only in the top-level
   "not restated" list, not at the M3 restatement site).

3. Entry M5 "This is round 44's HIGH finding (SentinelSandboxEscape) explained: p44d passed --clearenv and spawnSync
   had no env option": restates the PID-1 environ leak from corpus/lessons/round-44.md:129,138 (cited only in the
   top-level "not restated" list, not at the M5 restatement site).

## (c) Lines in other lane files made stale by the new entry (owe an appended erratum)

1. corpus/knowledge/pinned-evidence.md:98-101 — "The gates pass an allowlisted child env (PATH, HOME, LANG, LC_ALL,
   GIT_TERMINAL_PROMPT, GIT_OPTIONAL_LOCKS) and never inherit GIT_DIR/GIT_WORK_TREE/GIT_INDEX_FILE." Entry M3 +
   SentinelSeatEnvScrub.md show the 3-var/allowlist scrub is insufficient: 15 local GIT_* vars plus GIT_EXEC_PATH,
   GIT_CEILING_DIRECTORIES, GIT_CONFIG_GLOBAL, $HOME/.gitconfig, XDG_CONFIG_HOME survive and can drive hooks/commits
   into an inherited repo. The allowlist claim is now stale.

2. corpus/lessons/round-44.md:129 — fix line "the next counter passes an explicit minimal env to spawnSync('bwrap', ...)".
   Entry M5 + Practice change 2 refine: bwrap must run with env -i as its immediate parent (shell) or a minimal spawn
   `env` (Node), inside the scope, plus --clearenv --setenv; --clearenv alone leaves PID 1's environment. The old fix
   omits the immediate-parent/immediate-env requirement and is stale.

3. .ufo/waves/round-45/plan.md:71 (R44-3) — promised "a lane sandbox runner with --clearenv". Entry states no runner
   exists and prescribes env -i instead of --clearenv alone (CtlCheckK5Baseline.md D3). The plan line is stale vs the
   entry's corrected prescription.

## Notes
- KSheetFull.md (a3-falsify) independently confirms K1-K5 PASS with minor info findings (S063 version-marker literal
  mismatch 2.49.0 vs 2.56.0; row-3 guard text not byte-identical to SentinelSeatEnvScrub.md:40 tested guard). Those
  are entry-side defects, not contradictions with other lane files, and are not counted above.
- Verification: filesystem facts (btrfs /home, xfs /fast) confirmed via findmnt; git rev-parse --local-env-vars = 15
  names; no jj-lane.sh in lane (find/grep). All other claims rest on committed receipts cited inline.
- No tools installed; no lane writes except this report.

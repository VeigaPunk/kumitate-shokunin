FIDELITY scripts/collect-omp-native-handoff.mjs anchors=7 ok=3 moved=3 changed=1 gone=0

Scope: C2 anchor-fidelity re-verification of `scripts/collect-omp-native-handoff.mjs` (upstream 964f443e -> 31c465f1, +10/-3). Upstream read only via the read-only clone /fast/scratch/kumitate-r35/src. Notes read-only; nothing edited.

## Anchor inventory

All anchors live in corpus/knowledge/native-trial-launch.md, member section spanning note lines 357-368. dispatch-shapes.md has no `## ` headings and only a bare table mention (:10, no line anchor). remaining-scripts-census.md cites the member only as heredoc tree rows (:36-:41) and prose (:179) — no line anchor, no heading. Verified via grep of `collect-omp-native-handoff` and `^## ` across all three notes.

| # | note:line | cited anchor | claim | at 964f443e | at 31c465f1 | status |
|---|---|---|---|---|---|---|
| 1 | native-trial-launch.md:357 | heading `(1804 L)` | member size 1804 L | 1804 (wc -l/awk) | 1811 (wc -l/awk) | changed |
| 2 | native-trial-launch.md:360 | `scripts/collect-omp-native-handoff.mjs:120` | `parseArgs` argv parser | :120 def | :120 def unchanged | ok |
| 3 | native-trial-launch.md:360 | `:118` | `COLLECTOR_USAGE` usage string | :118 const | :118 unchanged | ok |
| 4 | native-trial-launch.md:361 | `:205` | `assertWaveDispatchToken` wave binding | :205 def | :205 def unchanged | ok |
| 5 | native-trial-launch.md:362 | `:869` | `validateDispatches` dispatch-graph gate | :869 def | def now :873 (:869 is the missing_seats die string) | moved |
| 6 | native-trial-launch.md:363 | `:951` | `writeEvidenceFile` durable evidence writer | :951 def | def now :955 (:951 is a P2 comment line) | moved |
| 7 | native-trial-launch.md:363 | `:973` | `persistEvidenceWrites` deferred persist | :973 def | def now :977 (:973 is `} finally {`) | moved |

## Non-ok rows

- native-trial-launch.md:362 | `:869` | `validateDispatches` dispatch-graph gate | moved | scripts/collect-omp-native-handoff.mjs:873 | dispatch graph `validateDispatches` (`:873` — re-anchored at 31c465f1).
- native-trial-launch.md:363 | `:951` | `writeEvidenceFile` durable O_EXCL/0600 evidence writer | moved | scripts/collect-omp-native-handoff.mjs:955 | durable evidence via `writeEvidenceFile` (`:955` — re-anchored at 31c465f1).
- native-trial-launch.md:363 | `:973` | `persistEvidenceWrites` deferred evidence persist | moved | scripts/collect-omp-native-handoff.mjs:977 | and `persistEvidenceWrites` (`:977` — re-anchored at 31c465f1).
- native-trial-launch.md:357 | heading | "(1804 L)" member size | changed | scripts/collect-omp-native-handoff.mjs:1-1811 | `## scripts/collect-omp-native-handoff.mjs` (1811 L) — handoff collector entry (re-anchored at 31c465f1).

## Behavior drift in the diff vs note claims

964f443e..31c465f1 changed only `verifyLaunchAssignment`'s contract: it now returns `{ assignment, hash }` carrying the raw-bytes digest (new :742-745), the loaded map gains `launchAssignmentHash` (new :811), and the agent-row `assignmentHash` reuses that digest instead of re-hashing the decoded string (new :1117-1120, was base :1113). None of the member-section claims (parseArgs/COLLECTOR_USAGE/assertWaveDispatchToken/validateDispatches/writeEvidenceFile/persistEvidenceWrites, the five lib imports, the Symbols list) described the old return shape, so no note prose is invalidated beyond the heading's line count. Section prose "Imports lib modules base, policy, evidence, screening, events" and "does not inline classifier or cost-ledger logic" still holds verbatim at 31c465f1 (imports identical at :22-116).

## Adjacent observations (outside this member's anchor scope, checked anyway)

- native-trial-launch.md:174 `:4472-4492` is a `:N` continuation anchor inside the `run-omp-native-trial.mjs` "Post-session pipeline" section, so it cites the launcher member, not this one. The collector invocation it describes (`--manifest --output handoff.json --ufo --run-root --session-root`, 600s) still matches `parseArgs` at 31c465f1: known-flag set :126, required keys :151, usage :118. No flag was added or removed.
- dispatch-shapes.md:10 names this member without a line anchor; the "native judged round ... sole judge" claim is unaffected by the diff.
- dispatch-shapes.md:17-18 anchors `collect-omp-native-handoff-lib/base.mjs` — a different member, out of scope here.
- Launcher heading at native-trial-launch.md:349 claims "4304 L" while its own section anchors reach `:4692` — launcher-member discrepancy, owned by another fid seat; noted only because it borders this section.

## Commands run

- `git -C /fast/scratch/kumitate-r35/src show 964f443e:scripts/collect-omp-native-handoff.mjs | cat -n` (full file) and the same at 31c465f1; targeted numbered ranges 725-845 / 855-900 / 940-1000 / 1100-1140 at both revisions.
- `git -C /fast/scratch/kumitate-r35/src diff 964f443e 31c465f1 -- scripts/collect-omp-native-handoff.mjs`
- `wc -l` + `awk 'END{print NR}'` on both revisions: 1804/1804 base, 1811/1811 pinned (diff arithmetic 1804+10-3=1811 corroborates; the note's "1804 L" census convention matches wc -l at base).
- grep for `collect-omp-native-handoff` and `^## ` across dispatch-shapes.md, native-trial-launch.md, remaining-scripts-census.md.

No tools installed (none needed). No [INFERENCE] rows — every status was verified by direct reads at both revisions; the only unobserved item is whether sibling fid seats own the adjacent launcher-heading discrepancy.

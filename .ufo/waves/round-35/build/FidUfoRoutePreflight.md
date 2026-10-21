FIDELITY scripts/ufo-route-preflight.mjs anchors=3 ok=1 moved=2 changed=0 gone=0

# C2 anchor-fidelity: scripts/ufo-route-preflight.mjs

Read-only. Source pin: /fast/scratch/kumitate-r35/src, base 964f443e, head 31c465f1.
Notes audited: corpus/knowledge/remaining-scripts-census.md (line numbers are note lines).
Member is in frozen s-modified-members-55.tsv (`+4/-3`, owner note remaining-scripts-census.md) and absent from s-deleted-5.txt (`grep -c` = 0).

## Anchor set (3): definition
Line anchors + `:N` continuations inside the member's own `## ` section (note:777) + the member-section heading.
- note:777 heading `## \`scripts/ufo-route-preflight.mjs\`` -> **ok** (file present at 31c465f1, kind still `tool`, shebang `#!/usr/bin/env node` at head:1)
- note:779 `scripts/ufo-route-preflight.mjs:32` -> **moved**
- note:779 `:54` -> **moved**

The only diff (4+/3-) is the module header comment; net +1 line, so anchors at/after the hunk shift +1. All code bytes are unchanged.

## Non-ok anchor rows
note:line | cited anchor | symbol/claim | status | correct anchor at 31c465f1 | proposed replacement (<=30 words)
---|---|---|---|---|---
779 | scripts/ufo-route-preflight.mjs:32 | `ROUTE_PREFLIGHT_SCHEMA` (schema const) | moved | scripts/ufo-route-preflight.mjs:33 | Primary surface symbol `ROUTE_PREFLIGHT_SCHEMA` at `scripts/ufo-route-preflight.mjs:33` (re-anchored at 31c465f1; original census base `964f443e`).
779 | :54 | `routeFamilies` (exported function; JSDoc "unpinned" semantics intact) | moved | scripts/ufo-route-preflight.mjs:55 | `routeFamilies` now at `scripts/ufo-route-preflight.mjs:55` (re-anchored at 31c465f1; prior `:54` was the `964f443e` base).

Evidence of movement:
- base 964f443e:32 `export const ROUTE_PREFLIGHT_SCHEMA = "ufo-route-preflight-v1";`, :54 `export function routeFamilies(laneCounts, routing) {`
- head 31c465f1:32 is blank, :33 is the schema const; head :54 is the JSDoc close ` */`, :55 is `export function routeFamilies(laneCounts, routing) {`
- call sites shift identically (151->152, 155->156), confirming a pure +1 offset with no rename or deletion.

## Supplementary non-anchor claims (excluded from the 3-anchor verdict counts)
The line-count claims in the same notes also went stale (176 -> 177); flagged so the 88/88 re-census does not copy a wrong length.
note:line | cited claim | status | correct value at 31c465f1 | proposed replacement
---|---|---|---|---
150 | `| \`scripts/ufo-route-preflight.mjs\` | 176 | tool |` | changed (count only; kind `tool` still holds) | 177 L | `| \`scripts/ufo-route-preflight.mjs\` | 177 | tool |` (re-anchored at 31c465f1; `964f443e` kept as the original census label).
779 | `Live S8 member (176 L, tool) ...` | changed (count only) | 177 L | Live S8 member (177 L, tool) re-censused 2026-10-14 against `964f443e`; anchors re-anchored at 31c465f1.
401 | declared-set listing `- \`scripts/ufo-route-preflight.mjs\`` | ok | member still present | no change.

Counts: `git show 964f443e:scripts/ufo-route-preflight.mjs | wc -l` = 176; head = 177.

## Behavior the diff removed/changed (flag, no note anchor affected)
- Removed at head (base 964f443e:26-27): "it refuses effort-less hops as a usage error (the grammar divergence ONESHOT WO-2 names)".
- Replaced by (31c465f1:26-27): "an effort-less hop is probed without `--thinking` (the shared scripts/omp-route-grammar.mjs admits it, matching the live global table)".
- Reachability semantics unchanged: one minimal completion per hop, exit 0 reachable / exit 3 unhealthy via `--route-probe scripts/probe-ufo-route-health.mjs`, no credential read, no stdin.
- `grep -rn -i -E "effort-less|ONESHOT WO-2|omp-route-grammar" corpus/knowledge/ docs/` returned no route-preflight claim, so no note wording must be retracted; do not re-introduce the "usage error" refusal wording in the re-census.
- Line 658's "usage error" match belongs to `project-devin-subagents.mjs`, unrelated to this member.

## Commands run (all read-only)
```
git -C /fast/scratch/kumitate-r35/src grep -n -E "ROUTE_PREFLIGHT_SCHEMA|routeFamilies" 964f443e -- scripts/ufo-route-preflight.mjs
964f443e:scripts/ufo-route-preflight.mjs:32:export const ROUTE_PREFLIGHT_SCHEMA = "ufo-route-preflight-v1";
964f443e:scripts/ufo-route-preflight.mjs:54:export function routeFamilies(laneCounts, routing) {
964f443e:scripts/ufo-route-preflight.mjs:151 / :155 (call site + schema use)
git ... grep ... 31c465f1 -- ...
31c465f1:scripts/ufo-route-preflight.mjs:33 / :55 / :152 / :156
git -C /fast/scratch/kumitate-r35/src diff 964f443e 31c465f1 -- scripts/ufo-route-preflight.mjs
  -> 1 hunk @@ -23,9 +23,10 @@, 4 insertions, 3 deletions, comment block only
git ... diff --stat ... -> scripts/ufo-route-preflight.mjs | 7 ++++---
grep -n -i preflight corpus/knowledge/remaining-scripts-census.md -> 150,151,401,402,550,566,777,779,781,783
```
Notes read at lines 145-155, 395-405, 769-803; note:550/566 "preflight" hits are unrelated prose (fleet-ledger / lean-cargo).

## Remaining unknowns
- None for this member's presence, anchors, line count or header-behavior delta. The sibling `scripts/ufo-route-preflight.test.mjs` (+33/-0, note:781/783) is a different member under another scout and was not judged here.
- Note:401 sits inside the "declared member count the S8 registry row must carry" list; only membership was checked, not the registry count.

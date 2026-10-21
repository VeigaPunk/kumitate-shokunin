FIDELITY scripts/gates-plan.mjs anchors=15 ok=3 moved=8 changed=0 gone=4

Member: scripts/gates-plan.mjs. Notes: corpus/knowledge/remaining-scripts-census.md (section `## \`scripts/gates-plan.mjs\`` at :552, body :554), corpus/knowledge/route-probe-cluster.md (:452, :453 fenced ledger; :370 prose). Revisions: 964f443e (200 L) -> 31c465f1 (204 L). Diff +9/-5: GROUPS += "rust","gates"; RULES gate-machinery rule drops dev-verify.sh; RULES += crates/rust, the-tick, charter-scribe, empirical rules; RULES -= ufo-refinement-context and primeagent rules; swarm rule += registry. IGNORE_RES untouched by this diff.

## Non-ok anchors

remaining-scripts-census.md:554 | `:367` touchedPaths() | `touchedPaths()` union of worktree/untracked/ahead | moved (out of range at BOTH pins; already stale at 964f443e — see note below) | scripts/gates-plan.mjs:120 | `touchedPaths()` (`:367`, 964f443e) -> `touchedPaths()` (`scripts/gates-plan.mjs:120`, re-anchored at 31c465f1); union behavior verified intact.

remaining-scripts-census.md:554 | `:334` UFO_GATES_TOUCHED | env pins touched set; empty string = unknown | moved (out of range both pins) | scripts/gates-plan.mjs:90 (`let touchedEnv = process.env.UFO_GATES_TOUCHED;`) | `UFO_GATES_TOUCHED` (`:334`, 964f443e) -> env pin `touchedEnv` (`scripts/gates-plan.mjs:90`, re-anchored at 31c465f1); empty-set->null->`touched=unknown` verified at :126/:200.

remaining-scripts-census.md:554 | `:132` IGNORE_RES | the ignore set IGNORE_RES | moved (out of range both pins; untouched by diff) | scripts/gates-plan.mjs:37 | `IGNORE_RES` (`:132`, 964f443e) -> `IGNORE_RES` (`scripts/gates-plan.mjs:37`, re-anchored at 31c465f1).

remaining-scripts-census.md:554 | `:159` RULES | ordered RULES feed selectAllGroups | moved (out of range both pins; contents rewritten by diff, but the note enumerates no rules, so no described claim broke) | scripts/gates-plan.mjs:46 | `RULES` (`:159`, 964f443e) -> `RULES` (`scripts/gates-plan.mjs:46`, re-anchored at 31c465f1; contents changed at 31c465f1: +crates/the-tick/charter-scribe, -refinement-context/primeagent).

remaining-scripts-census.md:554 | `:422` selectAllGroups | selectAllGroups all-groups sink | moved (out of range both pins) | scripts/gates-plan.mjs:175 | `selectAllGroups` (`:422`, 964f443e) -> `selectAllGroups` (`scripts/gates-plan.mjs:175`, re-anchored at 31c465f1).

remaining-scripts-census.md:554 | `:428` unreadable diff | unreadable diff routes to all-groups arm | moved (out of range both pins) | scripts/gates-plan.mjs:181 (`selectAllGroups(\`touched set unreadable...\`)`) | unreadable-diff arm (`:428`, 964f443e) -> `touched set unreadable` arm (`scripts/gates-plan.mjs:181`, re-anchored at 31c465f1).

remaining-scripts-census.md:554 | `:440` unmapped path | unmapped path routes to all-groups arm | moved (out of range both pins) | scripts/gates-plan.mjs:193 (`selectAllGroups(\`unmapped path ${file}\`)`) | unmapped-path arm (`:440`, 964f443e) -> (`scripts/gates-plan.mjs:193`, re-anchored at 31c465f1).

remaining-scripts-census.md:554 | `:299` USAGE | `--root`/`--touched-file` test/debug entry points | moved (out of range both pins; flags verified present in USAGE string) | scripts/gates-plan.mjs:70 | `USAGE` (`:299`, 964f443e) -> `USAGE` (`scripts/gates-plan.mjs:70`, re-anchored at 31c465f1).

remaining-scripts-census.md:554 | `:152` IGNORE_ESCAPE | "three-literal exemption IGNORE_ESCAPE" | gone (symbol absent at 964f443e AND 31c465f1; no `exempt` of any kind) | none — no replacement symbol | Drop the IGNORE_ESCAPE clause: no three-literal exemption exists at 964f443e or 31c465f1 (pre-existing drift, not this diff).

remaining-scripts-census.md:554 | `:314` writeStdout | writeStdout absorbs EPIPE for `| head -1` | gone (`writeStdout` absent at both pins; output is bare `process.stdout.write(out.join("\n") + "\n")`, no EPIPE guard) | scripts/gates-plan.mjs:204 | Replace with: stdout fields via `process.stdout.write` (`scripts/gates-plan.mjs:204`, re-anchored at 31c465f1); EPIPE absorption no longer present in source.

route-probe-cluster.md:452 | `scripts/gates-plan.mjs:295` | rule groups ["scripts-suites"] for probe-ufo-route-health/sync-global-routing | gone (out of range at both pins; group `scripts-suites` does not exist; rule absent) | none | Historical round-12 fence row (declared "not the note's current citation set"); dead at 31c465f1 — keep fenced as historical or delete.

route-probe-cluster.md:453 | `scripts/gates-plan.mjs:296` | rule groups ["orchestration"] for 22-script SUT set | gone (group `orchestration` does not exist in GROUPS at either pin; rule absent) | none | Same fence row treatment: historical only; no live equivalent at 31c465f1 — keep fenced or delete.

## OK anchors (3)

- remaining-scripts-census.md:552 heading `## \`scripts/gates-plan.mjs\`` — member present at 31c465f1. ok
- remaining-scripts-census.md:554 `scripts/gates-plan.mjs:6` — :6 sits in the :4-7 usage block documenting exactly `touched=`/`basis=`/`group=`/`note=`; byte-identical at both pins (diff touches nothing before :24). ok
- remaining-scripts-census.md:554 `:20` GROUPS — `const GROUPS = [` at :20 at both pins. Note: GROUPS gains "rust" and "gates" at 31c465f1 (diff); the note does not enumerate members, so claim still holds. ok

## Verification context for the C2 re-census owner

- ALL 12 failures are pre-existing drift: every failed anchor is out of range (>:200) at the BASE revision 964f443e too — the census section was authored against a pre-refactor (~450+ L) revision and never re-anchored. The 964f443e->31c465f1 diff itself breaks no note-described claim (changed=0); it only shifts post-RULES lines by +4 (GROUPS +2, RULES +2).
- Line map at 31c465f1: fields doc :4-7, fail-safe comment :9, GROUPS :20-29, IGNORE_RES :37, RULES :46-69, USAGE :70, env pin :87-90, touchedPaths() :120 (union comment :115-119), selectAllGroups :175, unreadable arm :181, unmapped arm :193, stdout emit :200-204. File 204 L.
- Census population table remaining-scripts-census.md:114 says `200 | tool` — at 31c465f1 the member is 204 L; update the table row during re-census.
- route-probe-cluster.md:370 prose hedge ("Gate plan historically registered route-health + probe/helper set as SUT — re-verify before citing live group lists") CONFIRMED at 31c465f1: RULES (:46-69) contains no probe-ufo-route-health, sync-global-routing, collect-omp-native-handoff, fake-omp or probe-* orchestration rule; GROUPS has no `scripts-suites`/`orchestration`. Prose claim, not a line anchor — not counted.
- Behavioral claims re-verified at 31c465f1 and unchanged: fail-safe all-groups contract (:9), env/touched-file empty-set -> null -> `touched=unknown` (:122-127, :200), touchedPaths union of worktree+untracked+ahead (:115-119).

## Commands run

- git -C /fast/scratch/kumitate-r35/src diff 964f443e 31c465f1 -- scripts/gates-plan.mjs  (the +9/-5 summarized above)
- git show <rev>:scripts/gates-plan.mjs | wc -l  -> 200 (964f443e), 204 (31c465f1)
- git show <rev>:... | grep -n -E "const GROUPS|IGNORE_RES|IGNORE_ESCAPE|RULES|touchedPaths|UFO_GATES_TOUCHED|selectAllGroups|writeStdout|USAGE|exempt|unreadable|touched=|basis=|unmapped" at both revisions
- git show <rev>:... | sed -n ranges for GROUPS/RULES/env/touchedPaths/tail at both revisions
- grep -n gates-plan on both note files (all hits reviewed; no other :N anchors exist)

Tooling: no installs or upgrades performed (existing git/jq-free toolchain sufficed). Read-only: no notes edited, no lane files touched, source read only via /fast/scratch/kumitate-r35/src.

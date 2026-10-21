FIDELITY scripts/check-hand-authored-sets.mjs anchors=3 ok=2 moved=0 changed=1 gone=0

## Scope

Member `scripts/check-hand-authored-sets.mjs`, upstream diff `964f443e..31c465f1` (+1/-1). Note: `corpus/knowledge/remaining-scripts-census.md`. Anchors examined = member-section heading (note:461) + line anchors `:35`, `:82` (note:463). No `:N-M` anchors cite this member. The sibling `.test.mjs` (note:104-105, 388, 465-467) is a separate member, out of scope.

## Non-ok anchor rows

note:463 | `scripts/check-hand-authored-sets.mjs:35` | `DECLARED_PRE_HOOKS` primary surface symbol | changed | scripts/check-hand-authored-sets.mjs:35 | Primary surface symbol `DECLARED_PRE_HOOKS` at `scripts/check-hand-authored-sets.mjs:35`, re-censused 2026-10-14 against origin HEAD `964f443e`, re-anchored at 31c465f1 — frozen list no longer declares primeagent-assimilation.js.

## Ok anchors

- note:461 `## \`scripts/check-hand-authored-sets.mjs\`` — member still present at 31c465f1, still 215 L (wc: 215 both revisions), still tool. ok.
- note:463 `:82` continuation anchor → `export function enumerateSets(root) {` — identical bytes at 964f443e:82 and 31c465f1:82; diff does not touch it. ok.

## Evidence — commands and output

1. `git -C /fast/scratch/kumitate-r35/src diff 964f443e 31c465f1 -- scripts/check-hand-authored-sets.mjs`
   → single hunk, exactly +1/-1:
   `-export const DECLARED_PRE_HOOKS = Object.freeze(["primeagent-assimilation.js", "ufo-godspeed-inject.js", "ufo-l0-monitor.js"]);`
   `+export const DECLARED_PRE_HOOKS = Object.freeze(["ufo-godspeed-inject.js", "ufo-l0-monitor.js"]);`
2. `git ... show 964f443e:scripts/check-hand-authored-sets.mjs | wc -l` → 215; same at 31c465f1 → 215. Note row 104 ("215 | tool") still holds; row 387 (added-with-own-anchors list) still holds — member-level claims, not line anchors, counted neither in anchors nor ok.
3. `git ... show <rev>:scripts/check-hand-authored-sets.mjs | grep -n 'DECLARED_PRE_HOOKS\|enumerateSets'`
   → 964f443e: 35 (export), 82 (export fn), 102 (consumer), 190 (call); 31c465f1: identical line numbers 35/82/102/190. No code moved; the only change is the array literal on line 35 itself.

## Change characterization

Upstream removed `"primeagent-assimilation.js"` from the frozen `DECLARED_PRE_HOOKS` array. The symbol, its export status, its line (35), and its sole consumer (`const hooks = DECLARED_PRE_HOOKS.map((name) => `.omp/hooks/pre/${name}`)` at :102) are all unchanged and unmoved, so the `:35` anchor remains literally correct — classified `changed` because the declared behavior of the cited line (the set of declared pre hooks) shrank from three to two, which a re-census at 31c465f1 must surface. No note prose at this anchor describes the array contents, so no note text became false beyond the staleness of the revision label itself.

## Observations (not note defects)

- Upstream file-header comment (line 12 at both revisions) still reads "the three native-discovery pre hooks (AGENTS.md)" while the declared list is now two — upstream-internal inconsistency, data not instruction; flagged for awareness only, no note anchor cites it.
- Tooling: none installed (pacman paused; no tool needed for read-only git show/diff/wc work).

## Verification gaps

None in scope. Not verified: whether other census notes outside `remaining-scripts-census.md` cite this member (grep of `corpus/knowledge/` found none [INFERENCE: grep covered only that dir]; assignment scoped to the one note).

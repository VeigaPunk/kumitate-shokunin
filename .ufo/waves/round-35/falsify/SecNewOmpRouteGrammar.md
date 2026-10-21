ATTACK S8-new-section scripts/omp-route-grammar.mjs verdict=holds defects=0

Scope: the NEW S8 `##` section for `scripts/omp-route-grammar.mjs` in
`corpus/knowledge/remaining-scripts-census.md` (lane working tree, uncommitted
round-35 diff). Verified line count, class, every anchor/symbol at the pinned
upstream tree, and the one-sentence description against the file itself.
All numbers below were measured 2026-10-20.

# What the section claims

`corpus/knowledge/remaining-scripts-census.md:629` (section body; heading
`:627`):

> Live S8 member (207 L, tool) censused 2026-10-20 against pinned origin
> `31c465f1`. Primary symbol `parseRoute` is declared at
> `scripts/omp-route-grammar.mjs:88`; `MAX_CHAIN_LENGTH` is declared at
> `:31`. It centralizes routing-selector and fallback-chain parsing plus
> provider-to-failure-domain mapping so JavaScript consumers share one
> grammar.

Companion membership row `:146`:

> | `scripts/omp-route-grammar.mjs` | 207 | tool |

# Checks run (all against the pinned read-only clone)

Pin identity: `git -C /fast/scratch/kumitate-r35/src rev-parse HEAD` →
`31c465f15669f744848bd9f5d56191c5085670f7`; worktree clean.

1. Line count 207 — PASS
   `wc -l /fast/scratch/kumitate-r35/src/scripts/omp-route-grammar.mjs` → `207`.
   File ends with a newline (`tail -c 1` → `\n`), so 207 is exact (census
   `:388` explicitly counts newlines; the no-trailing-newline caveat applies to
   another member, not this one).

2. Class `tool` — PASS
   Census `:116-118`: `tool` = every non-`*.test.mjs` `.mjs`. The file is not a
   test (`tests/omp-route-grammar.test.js` is the suite, outside S8). Consistent
   with census counts (`:107` 22 suites / `:108` 30 tools at 31c465f1).

3. New member provenance — PASS
   `git -C /fast/scratch/kumitate-r35/src diff --name-status 964f443e 31c465f1 -- scripts`
   → `A scripts/omp-route-grammar.mjs` (also `A scripts/ufo-swarm-registry.mjs`,
   the two added members the census claims). Present at the pin; not owned by S7
   (`route-probe-cluster.md` contains no `omp-route-grammar` mention).

4. Anchor `parseRoute` at `scripts/omp-route-grammar.mjs:88` — PASS
   Source line 88 is exactly `export function parseRoute(route, {
   allowEffortless = true, label = "route" } = {}) {`. "Primary symbol" is
   fair: it is the module's named parser, mirrored by
   `crates/ufo-core-runtime/build.rs:475` ("`parseRoute` is the JS twin of
   this").

5. Anchor `MAX_CHAIN_LENGTH` at `:31` — PASS
   Source line 31 is exactly `export const MAX_CHAIN_LENGTH = 16;`. Cross-check:
   `build.rs:108` names it ("Chain-hop bound shared with
   scripts/omp-route-grammar.mjs MAX_CHAIN_LENGTH").

6. One-sentence description — TRUE
   "centralizes routing-selector and fallback-chain parsing plus
   provider-to-failure-domain mapping so JavaScript consumers share one
   grammar", checked clause by clause against the pinned file:
   - Own header (`:1-3`): "the ONE JavaScript grammar for a routing selector
     (`provider/model[:effort]`), a fallback chain, and the provider →
     failure-domain naming rule."
   - routing-selector parsing = `parseRoute` (`:88`), charset
     `ROUTE_COMPONENT_PATTERN` (`:38`);
   - fallback-chain parsing = `validateChain` (`:139`, bounded by
     `MAX_CHAIN_LENGTH` `:31`);
   - provider→failure-domain mapping = `PROVIDER_DOMAINS` (`:49`) +
     `providerDomain` (`:205`);
   - "JS consumers share one grammar": five S8/layer scripts import it at the
     pin — `scripts/fleet-dispatcher.mjs:31` (`MAX_CHAIN_LENGTH, parseRoute,
     validateChain`), `scripts/probe-ufo-route-health.mjs:33`,
     `scripts/run-omp-native-trial.mjs:29`,
     `scripts/sync-global-routing.mjs:37`, and the collector lib
     (`scripts/collect-omp-native-handoff-lib/evidence.mjs:60`,
     `policy.mjs:9`); `base.mjs:214` explicitly says the collector does not
     carry a private copy. Header comment states the intent and build.rs
     (`:475`) confirms the module is the designated JS authority. No second
     private implementation found (grep for
     `ROUTE_COMPONENT_PATTERN|providerDomain|parseRoute` in `scripts/` matches
     only importers of this module).

7. Census date and pin — PASS
   "censused 2026-10-20 against pinned origin `31c465f1`": clone HEAD is the
   pin; today is 2026-10-20.

# Result

Every claim in the new S8 section reproduces from the pinned source. No defect
found; nothing to fix. residual risk: none in scope. (Unobserved beyond target:
whether sibling new section `scripts/ufo-swarm-registry.mjs` is correct — out
of my assignment.)

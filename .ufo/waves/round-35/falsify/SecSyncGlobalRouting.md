ATTACK scripts/sync-global-routing.mjs S8 census section verdict=partial defects=2

## Findings (severity order)

1. **High — several short anchors resolve to the wrong source file**
   - Location: `corpus/knowledge/remaining-scripts-census.md:655`.
   - Command: `node scripts/cite-check.mjs --src /fast/scratch/kumitate-r35/src --symbols --json` (findings for line 655).
   - Output: `:42`, `:211`, `:253` resolve to `crates/ufo-core-runtime/bundled/omp-seat-routing.json`; `:48`, `:53`, `:54`, `:66` resolve to `scripts/sync-ufo-contracts.mjs`; `:89-95` resolves to `scripts/omp-route-grammar.mjs`.
   - Those targets do not contain the named declarations: JSON `:42` is a `requested` value, `:211` an object opening, `:253` an `effort` value; contracts `:48-54` are comments and `:66` is `canonicalSkill`; grammar `:89-95` is `parseRoute` validation, not `assertAdmissibleRoute`. The intended definitions do exist in the member at `scripts/sync-global-routing.mjs:42,48,53-54,66,89-95,211,253`, but the current citations do not resolve there under the lane citation gate.
   - Minimal fix: explicitly qualify these member anchors as `scripts/sync-global-routing.mjs:N` (especially after the JSON path and `sync-ufo-contracts.mjs:635` cross-file citation). The scratch-copy recheck with qualified refs resolved each to the intended member lines and reported the named symbols there.

2. **Medium — round-35 trace causes a cite-check error**
   - Location: `corpus/knowledge/remaining-scripts-census.md:655`, trace `route-${sha256(group)} literal — absent at 31c465f1`.
   - Command: `node scripts/cite-check.mjs --src /fast/scratch/kumitate-r35/src --symbols --all`.
   - Output: `ERROR PIN_MISMATCH ... 31c465f1 — content pin 31c465f1 does not match sha256(scripts/sync-global-routing.mjs)=3787d0e82d62…`.
   - The nearby `sha256` token is parsed as a content-pin marker for the revision hash. Minimal fix tested on a scratch copy: change that trace to `route-${sha256(group)} literal — absent in source; at git pin 31c465f1`; the gate then reports `OK 31c465f1 (git pin) resolved-by-git:src` instead of `PIN_MISMATCH`.

## Verification and residual risk

- The actual behavior claims were checked against 31c465f1: no CLI (`:14-16`), mirror path/schema (`:41-42`), render/build (`:253`, `:211`), seat constants (`:53-54`, `:66`), resolver constant (`:48`), route screen (`:89-95`), chain group (`:105-109`), snapshot plumbing (`:209-214`), and serializers (`:120`, `:129`). Cross-file checks also match: grammar `parseRoute`/effort check/`validateChain`/`routingGroupProblem` at `scripts/omp-route-grammar.mjs:88,104-108,139,194`; mirror write at `scripts/sync-ufo-contracts.mjs:635`. No false behavior claim found in the prose itself.
- Population row `corpus/knowledge/remaining-scripts-census.md:153` is `255 | tool`; `git show 31c465f1:scripts/sync-global-routing.mjs | wc -l` returned `255`. The `tool` classification matches the note's rule (`every other .mjs`). The master section had no member-local `964f443e` revision label to preserve; the current section ends with `re-anchored at 31c465f1 (round 35)`. All 12 removed-clause traces are present.
- `MEMBER_PROBE: 60/60 ok`; `node scripts/proxy-check.mjs --selftest` returned `107/107 pass`; `node scripts/proxy-check.mjs --src /fast/scratch/kumitate-r35/src` returned `PROXY: MATCH` with S=88/88 and script-layer coverage 10.
- Whole-note `cite-check` remains `CITE_CHECK: DRIFT (files=83 tokens=8823 errors=660 warnings=466)`; only line-655 findings above are attributed to this target. No `lsp` device is mounted (`read xd://lsp` returned `No such tool`), so caller/definition/diagnostic LSP checks were unavailable; pinned source and the lane citation gate were used directly.
# K78CriticClaims — attack result

Axes: operability + coverage:kimi-layer. Full attack table, source pointers, commands and receipts: `.ufo/waves/round-78/build/K78CriticClaims/critique.md`.

## Decisive remaining harm

C1's frozen formula removes documentation-binding sensitivity. Existing score uses `K_sections/K_members`; proposed score uses `(K_members-K_findings)/K_members` instead. With 55 clean members, 54 bound sections, zero census findings: old **9**, proposed **10**. Existing proxy selftest around 2299–2312 explicitly protects section-loss score movement. Retaining K_SECTIONS_DRIFT as an error does not retain that score dimension. This is an axis-identity tradeoff, not merely implementation polish; canonical disposition is required. Smallest non-regressive design multiplies both ratios, but the seat does not alter a frozen formula or counter.

Coordinator separately reported an executed base/patched comparison confirming exactly: base `K_sections=54 K_members=55 coverage_kimi=9` with `K_SECTIONS_DRIFT,COVERAGE_KIMI_DRIFT,AXES_DRIFT`; patched same counts with score 10 and only `K_SECTIONS_DRIFT`. That measurement is coordinator-reported, not this seat's patched execution. Command shape in each mutated tree: `node scripts/proxy-check.mjs --src /fast/scratch/hyaku/kumitate-pin/src --json`.

## Other decisive readings

- Original base mode arm: exit 1, score 10, kinds C2_TOTAL_DRIFT/AXES_DRIFT (unrelated stale-stanza noise). Green scaffold isolates it: census mode-0200 root → SHAPE_DRIFT exit 1; same-root proxy → **MATCH, score 10, exit 0, no findings**. Thus new finding sensitivity is real, not only a refactor; observed lowering is synthetic-fixture evidence, not a live integer improvement.
- C2 is a real manual diagnostic: existing `--shape` applies census rules to receipt entries, never compares receipt to live root. No consumer in scaffold scripts/SKILL; plan does not add a consuming close gate. Do not advertise automatic close protection.
- C1 single-derivation arm does not actually assert proxy imports/calls decide; source review remains necessary. C2 non-scoring arm does not diff all terms, and last-line checks do not prove exactly one output line.

## Failed attacks / corrected defects

- Own constants cannot reach either target: **5/12**, **5/11**, exit 1. Exact stub sources and full receipts are in build dir.
- Unchanged scaffold scores original C1 3/12, amended C1 **4/12**, C2 **2/11**; all exit 1.
- Original AXES_DRIFT predicate used wrong field (`term` versus `key`), demonstrably rejecting existing convention. **Fixed pre-data in plan A1**; do not report it open or invert diagnostic identities to satisfy superseded bytes.
- `first=` wording discrepancy is clarified by **A3** (DRIFT only). Broken DEFAULT_LANE is disclosed/routed by **A2**; every seat run here used explicit --lane.
- Hardcoded 64 matches the frozen 64-entry receipt and materialisation. Single-discrepancy first names are unambiguous; no demonstrated ordering false-negative. Multi-drift and symlink cases remain unproven.

## Evidence / hygiene

Independent current C1 sha `5e9d9d4f237cbcb470f27d442b4c014e3ec359b1bdef7b2fa120421c3d19c4ed`; C2 sha `a46e53d7449bffad66541dae4661e20651930dc4551b49f6544eb56d5e84b460`. Receipts distinguish original versus amended instrument. No latest integrated implementation scored by this seat; no tool installs; no lane code/counter edits; no git/jj mutations or subagent dispatch. Scratch receipts persisted before scratch deletion.

Durable L1 measurement was subsequently read directly: `.ufo/waves/round-78/close/harm-counterexample.txt`. It names the identical edit (`## `~/.kimi-code/sessions/` — the worktree-keyed session store` → `## The session store — worktree-keyed (heading de-named for the harm probe)`), both tree recipes and the commands `(cd harm-base && node scripts/proxy-check.mjs --src /fast/scratch/hyaku/kumitate-pin/src --json)` and `(cd l1-int && node scripts/proxy-check.mjs --src /fast/scratch/hyaku/kumitate-pin/src --json)`. Its outputs confirm the readings above. This is a measured implementation regression, not only an approach-level arithmetic concern; the seat independently read the receipt but did not execute that patched comparison.

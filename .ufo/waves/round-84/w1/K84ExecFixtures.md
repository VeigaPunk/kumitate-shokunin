# K84ExecFixtures — independent CLI regression driver

## Deliverables

- `.ufo/waves/round-84/build/K84ExecFixtures/independent-cases.mjs`
- `.ufo/waves/round-84/build/K84ExecFixtures/independent-receipt.txt`

Axes: contract correctness, honest exit/finding accounting, scratch containment.
Read frozen plan/probe, operator RULES, PROVINCE and relevant QUALITY criteria (Q20, Q24, Q26, Q29, Q34, Q37). Expectations come from the plan's written contract; this supplementary 21-case battery does not replace or change the frozen 16-arm C1 predicate.

## Retained evidence

Context revision: `3794b903324e7eb4aec6d92539f2ca4e2c0b6727`; base named by assignment: `a648a6f8f3028fc4f72d27470b4673fe8e3e5866` (not measured here).

Measured working-copy bytes:

- `.ufo/waves/round-84/build/K84ExecGate/counter-receipt.mjs` sha256 `190a4c1f893a5ffc0c735a63e7155c830ae9cf2ed038fe7b870bebb11c254ec0`
- `.ufo/waves/round-84/build/K84ExecFixtures/independent-cases.mjs` sha256 `5a6c0d3f7d1f7f52b4908c490920517f46ae2fbb67f70262ec4ff0bf47c97acc`

Exact final command (cwd `/fast/scratch/hyaku/kumitate-r84/K84ExecFixtures`; TMPDIR `/fast/scratch/hyaku/kumitate-r84/K84ExecFixtures/work-final`):

```sh
node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-84/build/K84ExecFixtures/independent-cases.mjs --tool /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-84/build/K84ExecGate/counter-receipt.mjs --work /fast/scratch/hyaku/kumitate-r84/K84ExecFixtures/work-final
```

Observed exit **0**, `K84FX: HELD held=21/21`. Full child exits/findings and hashes retained in `independent-receipt.txt`. The candidate was initially absent but present on the single re-check; no wait-loop was used. An earlier draft battery also returned 21/21; the retained final run additionally uses explicit child cwd/TMPDIR and executable-looking metadata canary text.

## Behavior and coverage

Embedded fixtures are materialized only under explicit `--work`, in a unique child directory removed in `finally`. Every case asserts child exit plus finding token; denominator derives from the case table and successful completion requires all cases ran. Child cwd and TMPDIR are the fixture directory.

Covers clean, CRLF, unrelated metadata, fake summary text embedded mid-line, negative/fractional/unsafe summary counts, repeated/missing summary, summary-before-arms, malformed name/status, zero arms, missing receipt, usage, honest UNMET red, wrong verdict, total drift, duplicate names, foreign prefix and held-count drift. Metadata includes a scratch-only `touch` canary; it remained absent.

Driver mechanics were also exercised before finalization: no arguments returned usage/64; an intentionally absent tool produced `UNMET held=0/21`/1. These are observations, not capability success receipts.

## Defects, limits and handoff

No candidate defect observed across these 21 cases. Token assertions use substring membership plus exact child exit, matching the requested finding assertion; they do not prove absence of contradictory extra output. The canary is one execution tripwire, not a security sandbox or proof of all read-only behavior. Historical receipt runs, base/constant controls, frozen predicate, production integration and post-integration gates remain L1-owned. No production edits, installs, commits, clones or source IDs added. Node observed: v24.21.0. No LSP route is exposed in this seat; no existing symbol refactor was needed for this new standalone file.

Author advice only; no non-author closure or SHONEN attestation. Scratch is removed before yield after durable receipts are retained. L1 should rerun the exact driver against the integrated tool with its own explicit scratch.

Self-evaluation (1–5): accuracy 4 (bounded fixture evidence, not security proof); completeness 4 (named boundaries covered, integration intentionally L1-owned); clarity 4 (full receipt separated from report); actionability 4 (exact replay command and digests retained); conciseness 4 (embedded contract comments are verbose). Average 4.0. Highest-impact next check: L1 replay on integrated bytes. Would the user agree? Expected yes within the assigned leaf scope.

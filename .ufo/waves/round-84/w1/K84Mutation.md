# K84Mutation — denominator mutation killed

rev=3794b903324e7eb4aec6d92539f2ca4e2c0b6727
working-copy sha256 80332ee9bcf1c64de5b3d14f151b9edffc4ddf991fec9300532a2702c00e2523
Base: a648a6f8f3028fc4f72d27470b4673fe8e3e5866.
Axes: operability and coverage. Advice only, not non-author closure.

## Mutation and detector

Production candidate was initially absent; after the initial unrun handoff, K84ExecGate supplied a stable candidate. This report supersedes that unrun status for ONE mutation only, per mutation-tester role. Other five recipes remain unrun.

Candidate: `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-84/build/K84ExecGate/counter-receipt.mjs`. Only owned scratch copy was changed.

Exact removed behavior-bearing statement: `if (summary.total !== arms.length) return fail('ARMS_TOTAL', 1);`. Expected detector: frozen `total-drift` arm fails, with `hidden-red` also affected. Preconditions: exact statement occurs once; scratch absent; byte-exact UTF-8 source.

Observed driver command, exit 0:

`node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-84/build/K84Mutation/mutate84.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-84/build/K84ExecGate/counter-receipt.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-84/build/K84Mutation/arms-total-removed-spec.json`

Driver output: `{"id":"arms-total-removed","verdict":"killed","exact_restoration":true,"scratch_removed":true}`.

Same detector command executed for pristine, mutated and restored bytes:

`/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-84/probe/probe84-c1.mjs --lane /fast/scratch/hyaku/kumitate-r84/K84Mutation --work /fast/scratch/hyaku/kumitate-r84/K84Mutation/work`

All three use cwd `/fast/scratch/hyaku/kumitate-r84/K84Mutation` and TMPDIR `/fast/scratch/hyaku/kumitate-r84/K84Mutation/work`.

| Phase | Exit | Frozen result |
|---|---:|---|
| pristine | 0 | C84_C1: HELD held=16/16 |
| mutated | 1 | C84_C1: UNMET held=14/16 |
| restored | 0 | C84_C1: HELD held=16/16 |

Observed mutated failing rows:

- `C84_C1 arm hidden-red FAIL exit=1 want=1:ARMS_TOTAL out=COUNTER_RECEIPT: DRIFT ARM_FAILED`
- `C84_C1 arm total-drift FAIL exit=0 want=1:ARMS_TOTAL out=COUNTER_RECEIPT: CLEAN`

**Verdict: killed.** This demonstrates frozen detector sensitivity to removing denominator reconciliation; it is not a claim that every recipe or contract edge is covered.

## Hashes and restoration

Pristine/restored SHA-256: `80332ee9bcf1c64de5b3d14f151b9edffc4ddf991fec9300532a2702c00e2523`.
Mutated SHA-256: `6ed492c7a64aff2b2390d1de10236854491c0843e0f477726634fdb4622275f9`.
Frozen probe SHA-256: `e3a26649f13fc318d5f8a06fda3cd54113f399cc30a57816d60de5d0b629237d`.
Exact-byte restoration comparison true; restored detector passed; owned scratch removed after candidate/mutant and text receipts copied durably. No shared production, frozen plan/probe or sibling output writes.

## Owned artifacts

All below are under `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-84/build/K84Mutation/`:

- `mutate84.mjs`: one exact-precondition mutation per invocation, pristine/mutated/restored detector, finally restoration and cleanup; exercised once.
- `arms-total-removed-spec.json`: exact before/after source bytes and expected arm.
- `arms-total-removed-result.json`: full commands, source/probe hashes, outputs, exits, restoration evidence.
- `arms-total-removed-pristine.txt`, `arms-total-removed-mutated.txt`, `arms-total-removed-restored.txt`: full detector transcripts.
- `arms-total-removed-candidate.mjs`, `arms-total-removed-mutant.mjs`: durable measured bytes.
- `recipes.json`: initial absent-candidate handoff recipes; its inspection-time UNRUN label remains historical. Denominator recipe is now executed as above. FAIL ignored, held trust, duplicates ignored, last-summary-wins, ordering ignored remain unrun; no results claimed.

Read tooling rules, frozen plan/probe, PROVINCE own-instrument scope and QUALITY Q24/Q25/Q26/Q29. Existing Node v24.21.0 only; no installations/updates. No shared builds/lint/tests, git mutations, integration, network or scoring closure. Standalone assigned mutation probe only.

Self-evaluation: accuracy 4 (bounded to candidate digest); completeness 4 (one assigned plausible defect executed, other recipes unrun); clarity 4 (observed versus unrun separated); actionability 4 (durable driver/spec/transcripts); conciseness 4 (full provenance adds length). Mean 4.0. Further mutation coverage must be exercised independently, not inferred.

Report: .ufo/waves/round-84/w1/K84Mutation.md

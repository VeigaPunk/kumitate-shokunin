# K76MutAdopt — C2 mutation battery

Axes: operability + coverage (orchestration/tooling).

## Scope and evidence

Scratch shared clone checked out `cabc7aefd5f1562299f757e23207710c12e4ed58`; `revision.txt` records it. The unchanged oracle was copied from that clone into the stand-in. No production implementation or oracle semantics were edited. C1's runner was absent when checked, so `mutants.mjs` implements its exact `--tree/--list/[--only]` interface and JSON fields. It additionally records pristine and restored detector results and hashes; a failed baseline is never counted killed.

Runtime discrepancy: actual `node --version` was **v26.12.0**, not frozen v24.21.0 (`node-version.txt`). These are stand-in discrimination receipts, NOT canonical-host or real-tool verification. No tool installs or updates; no alternative runtime invoked.

## Deliverables

All paths below are relative to `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-76/build/K76MutAdopt`:

- `mutants.mjs`: compatible literal-replacement runner; exit 0 only for all killed, 1 for survival/inconclusive behavioral control, 2 for malformed/unreadable inputs or zero/multiple literal matches.
- `mutants-c2.json`: eight mutants against `scripts/spotcheck-adopt.mjs`.
- `standin/scripts/spotcheck-adopt.mjs`: deliberately minimal adopt/predict fixture, not a production candidate.
- `standin/scripts/readme-map.mjs`: exact scaffold oracle.
- `standin/detect-c2.mjs`: independent per-case behavioral detector; fixtures inside runner scratch only.
- `standin-results.txt`: actual complete outputs and SHA-256 before/mutated/restored for every case.
- `bad-tree.txt`, `zero-find.txt`, `duplicate-find.txt`: exit-2 controls.
- `summary.json`, `cleanup.txt`: tally and scratch-removal evidence.

## Observed result

```text
M1 KILLED exit=1 token=miss
M2 KILLED exit=1 token=miss
M3 KILLED exit=1 token=miss
M4 KILLED exit=1 token=miss
M5 KILLED exit=1 token=miss
M6 KILLED exit=1 token=miss
M7 KILLED exit=1 token=miss
M8 KILLED exit=1 token=miss
```

Tally: **8 killed, 0 survived, 0 inconclusive**, runner exit 0. Each pristine and restored detector exits 0 with `C2_DETECTOR: PASS M<N>`; each mutant exits 1 and lacks that token. Before/after script SHA-256 for every case: `2677b1f510034fa3d0a18d6cdb6bbef2edbc64e31fcc823da5bc4cccad7ec429`. Per-mutant changed hashes and raw failure outputs are in `standin-results.txt`.

M1/M2 exercise opposite half-states, require the correct `wrote=pin/row`, and prove the already-present side unchanged. M3 actually adopts a knowledge-path closure with its scope guard removed; M4 actually adopts a non-spotcheck lesson with its name guard removed. Both reach oracle CLEAN yet fail the refusal detector. M5 detects newline rewriting despite the correct ALREADY_ADOPTED token. M6 forces unrelated oracle drift and requires refusal; M7 additionally checks exact preimage rollback. M8 requires present/unmapped prediction UNCOVERED exit 1, not COVERED exit 0.

Bad tree: exit 2. Literal matching zero: exit 2 `matches=0`. Literal matching twice: exit 2 `matches=2`. All receipts name the commands. Scratch was removed in `finally`; `cleanup.txt` records `SCRATCH_REMOVED True`.

## NOT-EVALUABLE against scaffold / real tool

**All M1–M8**: `scripts/spotcheck-adopt.mjs` does not exist at scaffold revision. Their exact frozen stand-in find strings are below. They are implementation-shaped mutation anchors, NOT evidence that the forthcoming executor implementation uses these spellings. L1 must report NOT-EVALUABLE for absent/nonunique matches, then explicitly map anchors to the real behavior-bearing statements before claiming real-tool kills. Stand-in kills alone do not establish C2(g).

- M1: `if (!hasPin) { registry.covered.push(key);`
- M2: `if (!hasRow) writeFileSync(readme,`
- M3: `if (!p.startsWith('corpus/lessons/'))`
- M4: `else if (!/^round-\d+-verifier-spotcheck\.md$/.test(p.split('/').at(-1)))`
- M5: `if (hasRow && hasPin) {`
- M6: `if (result.status !== 0 || !result.stdout.startsWith('README_MAP: CLEAN'))`
- M7: `writeFileSync(readme, rowBytes); writeFileSync(pin, pinBytes);`
- M8: `const covered = mapped(target.slice(7));`

## L1 invocation

Reproduce stand-in with scratch storage:

```sh
S=/fast/scratch/hyaku/kumitate-r76/K76MutAdopt-replay
mkdir -p "$S"
trap 'rm -rf -- "$S"' EXIT
KUMITATE_MUTANTS_TMP="$S" node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-76/build/K76MutAdopt/mutants.mjs --tree /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-76/build/K76MutAdopt/standin --list /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-76/build/K76MutAdopt/mutants-c2.json
```

For final-tool evaluation, put the final tool + unchanged oracle in an isolated scratch tree `$TREE/scripts/`, copy `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-76/build/K76MutAdopt/standin/detect-c2.mjs` to `$TREE/detect-c2.mjs`, then invoke:

```sh
KUMITATE_MUTANTS_TMP="$S" node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-76/build/K76MutAdopt/mutants.mjs --tree "$TREE" --list /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-76/build/K76MutAdopt/mutants-c2.json
```

Run using the explicitly selected canonical node v24.21.0 PATH. Literal mismatch must remain exit 2, never be called a killed mutant. Neither invocation writes the source tree.

## Self-evaluation

Accuracy 4: raw receipts/hashes support stand-in kills; canonical runtime differs. Completeness 4: eight branches exercised; production anchors necessarily unavailable at scaffold. Clarity 4: real-tool and stand-in verdicts explicitly separated, but receipt JSON is verbose. Actionability 4: exact runner command supplied; L1 must map real implementation anchors. Conciseness 4: retained exact find strings and evidence instead of reproducing all raw diffs. Overall 4.0. Highest-impact improvement is canonical-node replay against final bytes with literal anchors matched uniquely. Would the user agree: the real-tool limitation is explicit, not disguised as an admission verdict.

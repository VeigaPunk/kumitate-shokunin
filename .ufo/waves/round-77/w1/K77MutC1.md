# K77MutC1 — frozen C1 mutation battery

Axes: operability + coverage (orchestration/tooling). Six frozen exact-literal mutants, one at a time; no production edits, commits or tool installs.

## Measured evidence

Pinned scratch clone: 4dc470a131e10900fdd456b6b68d7ba27151d9d2. Base census: VERDICT: PASS (49 cases); base proxy: PROXY_SELFTEST: 145/145 pass. The initial census invocation used a nonexistent --work parent and failed ENOENT; the later invocation created that directory and exited 0. Initial pipeline status was not a census exit status and is not treated as evidence.

The final-byte candidates were available in build/K77ExecShape/scripts while this seat ran. They are uncommitted replacement artifacts, **not measured commit M**. Census SHA256: 45bbb62aad19d2aa8358e76c17508b9399e02dd490095ae24bf6da4a7fa77523; proxy SHA256: 66c04420057d5a404af3df4594fe06602c1b96554f91230f436d2113adcb4109. Detector: detached node TARGET --selftest with 30-second timeout; process groups killed and outputs retained. Every mutant receives pristine, mutated and restored runs. Pristine and restored runs all exit 0; census reports 57 cases, proxy 150/150 pass.

- c1-a-unsorted: **killed**, exits 0/1/0. Expected: snapshot canonical sorted-name assertion.
- c1-b-mode-omitted: **killed**, exits 0/1/0. Expected: snapshot required mode / roundtrip validation.
- c1-c-trusted-counts: **killed**, exits 0/1/0. Expected: shape census derives all entries; negative receipt must retain zz-stray.
- c1-d-wrong-contract: **survived**, exits 0/0/0. Expected: wrong-contract receipt must be SHAPE_INVALID.
- c1-e-live-root: **killed**, exits 0/1/0. Expected: offline proxy terms must follow receipt, not default live root.
- c1-f-pin-uncompared: **survived**, exits 0/0/0. Expected: tampered pin.omp-shape must emit GATE_PIN_DRIFT.

Actual summary:

`MUTANTS77_C1: NOT-ALL-KILLED killed=4/6 survivors=c1-d-wrong-contract,c1-f-pin-uncompared inconclusive=-` (exit 1).

The wrong-contract mutant passes VERDICT: PASS (57 cases). The bypassed shape-pin comparison passes PROXY_SELFTEST: 150/150 pass. These are coverage findings, not permission to soften the contract. The frozen list is unchanged after observing those survivors. Mutants a/b cause a nonzero runtime SHAPE_NOT_FOUND exception after the invalid writer leaves no receipt; counted as killed by the exit-code detector, not as an explicit sortedness/mode assertion. Mutant c reports VERDICT: FAIL (2 of 57 cases failed); mutant e reports PROXY_SELFTEST: 147/150 pass.

## Mutation semantics

mutants.json freezes six exact replacements: reverse directory ordering; omit entry mode; truncate validated entries using an optional receipt counts.entries/default 1 instead of deriving all terms from the full entries array; disable the contract comparison; route offline proxy terms through the live census; bypass just pin.omp-shape comparison. Source anchors were read from the delivered executor artifacts. No alternative anchors, regex rewriting or silent adaptation.

## Runner and proof

paths.json maps canonical keys scripts/omp-census.mjs and scripts/proxy-check.mjs to absolute source paths. Neighboring .mjs/.json/.sh dependencies are copied, not a lane. Additional mapping keys may point to dependencies (e.g. scripts/claims-check.mjs) so their neighboring scripts are available if the primary paths are executor artifact directories. Final integrated lane sources already have their dependencies adjacent.

One unique anchor required: zero matches => nomatch; multiple matches, failed pristine/restored detector or changed source/restoration hash => drift; spawn/signal/timeout/syntax errors => crash. Normal nonzero mutated exit (including an uncaught runtime exception) => killed; zero => survived. Exit 0 all killed; 1 surviving mutants with no inconclusives; 2 any inconclusive/configuration error. Each phase stdout/stderr/status and all hashes are in results.jsonl. Output capture keeps the last 256 KiB per stream.

Good stand-in: 6/6 killed, exit 0. Deliberately broken twin accepts wrong contracts and omits that detector assertion: 5/6 killed, wrong-contract survives, exit 1. Both have passing pristine/restored runs. This proves the battery accepts the good implementation/detector pair and rejects the broken twin rather than calling a baseline failure a kill. prove.mjs and both stand-in JSONL files permit independent repetition. standin.txt records the actual console results.

## Restoration

For all six real-artifact probes, before == restoredHash == sourceAfter; the two hashes above identify the exact originals. Mutated hashes and captured outputs are retained in real-results.jsonl. Source artifacts were never edited. All copied trees and fixture work stay under the seat scratch; the delivery-copy shell uses an EXIT cleanup trap and removes the entire seat root after copying these receipts.

## Exact command at M

Create a paths.json containing absolute paths to M's scripts/omp-census.mjs and scripts/proxy-check.mjs under their canonical keys. Then:

`node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-77/build/K77MutC1/mutants.mjs --tool /fast/scratch/hyaku/kumitate-r77/K77MutC1-M/paths.json --work /fast/scratch/hyaku/kumitate-r77/K77MutC1-M/work`

The caller must preserve work/results.jsonl before removing its scratch. No run at M is claimed. Required M path-map template is paths-at-M.json, with absolute integrated-lane paths; copy it to the command's paths.json before running. Expected acceptance is ALL-KILLED 6/6; current executor artifacts honestly miss it.

## Self-evaluation

Accuracy 4: exact captured hashes/exits; no M revision claimed. Completeness 4: all six mutations and both proof arms delivered; final M rerun belongs to L1. Clarity 4: exception-kills explicitly distinguished from direct assertions. Actionability 5: exact command/map/JSONL provided. Conciseness 3: full explanation retained to avoid obscuring survivors. Overall 4.0. Main improvement: add wrong-contract and tampered-shape-pin selftest assertions in the implementation, then rerun this unchanged battery.

MUTATION_BEFORE kills=0/2 script=/fast/scratch/kumitate-r35/w/ExecMutationBefore/mutate-distinct.sh

Axes: operability (C1); S/R section terms are the measured coverage inputs.

## Files and behavior
- Added `/fast/scratch/kumitate-r35/w/ExecMutationBefore/mutate-distinct.sh`. It copies the lane tree into a `/tmp` sandbox while excluding `.git` and `.jj`, runs `proxy-check.mjs --self <sandbox> --src <origin> --json`, applies each duplicate/drop pair only in the sandbox, restores note files between pairs, and removes the sandbox on exit. The lane tree and pinned source were not written.
- Deterministic S targets: duplicate the `scripts/fleet-dispatcher.mjs` section from `corpus/knowledge/queue-and-claim.md` into the second S1 note `corpus/knowledge/successor-chain.md`, and drop `scripts/check-hand-authored-sets.mjs` from `corpus/knowledge/remaining-scripts-census.md`. S1 declares both notes at `SCORECARD.md:119`; S8 owns the census note at `SCORECARD.md:126`. The source and removal headings are at `corpus/knowledge/queue-and-claim.md:6` and `corpus/knowledge/remaining-scripts-census.md:461`.
- Deterministic R targets: duplicate the `crates/ufo-core-runtime/src/loop_driver.rs` section from `corpus/knowledge/loop-driver.md` into R11's `corpus/knowledge/runtime-remainder-census.md`, and drop the distinct `crates/ufo-core-runtime/src/axes.rs` section there. Source/drop headings are at `corpus/knowledge/loop-driver.md:26` and `corpus/knowledge/runtime-remainder-census.md:68`; R11's declared runtime `.rs` family and note are at `SCORECARD.md:142`. The pinned origin clone contains all four paths (`scripts/fleet-dispatcher.mjs`, `scripts/check-hand-authored-sets.mjs`, `crates/ufo-core-runtime/src/loop_driver.rs`, `crates/ufo-core-runtime/src/axes.rs`). The gate resolves section paths and checks `inFamily` via row patterns at `scripts/claims-check.mjs:342-392`; the corresponding wildcard matching is at `scripts/claims-check.mjs:255-273`.
- The checker currently accumulates each `inFamily` section occurrence at `scripts/proxy-check.mjs:581-605`. Baseline proxy evidence already has S declared=91/computed=86 and `S_SECTIONS_DRIFT` at `.ufo/waves/round-35/baseline/proxy-json.txt:121-127`; the instrument treats an already-present finding as killed only if the term changes or the finding newly appears.
- Result: baseline `S_sections=86`, `R_sections=83`; after each balanced mutation, both terms remained unchanged. Neither mutation was killed: `0/2`.
- Initial invocation stopped before mutation because its first S source was `successor-chain.md`, which has topic-form headings rather than a `scripts/fleet-dispatcher.mjs` section. The script was corrected to use the actual S1 member section at `queue-and-claim.md:6`; the successful run output below is the retained measurement.

## Commands and output
Initial attempt (failed before applying a mutation; corrected target as described above):
```text
bash /fast/scratch/kumitate-r35/w/ExecMutationBefore/mutate-distinct.sh --self /home/vgpnk/Projects/shokunin/kumitate-shokunin --src /fast/scratch/kumitate-r35/src
MUTATION_BASELINE S_sections=86 R_sections=83
Error: /tmp/ExecMutationBefore.sbqJwJ/self/corpus/knowledge/successor-chain.md: expected one section headed by ## `scripts/fleet-dispatcher.mjs`, found 0
```

Successful required invocation:
```text
bash /fast/scratch/kumitate-r35/w/ExecMutationBefore/mutate-distinct.sh --self /home/vgpnk/Projects/shokunin/kumitate-shokunin --src /fast/scratch/kumitate-r35/src
MUTATION_TARGET S duplicate=scripts/fleet-dispatcher.mjs from=corpus/knowledge/queue-and-claim.md into=corpus/knowledge/successor-chain.md drop=scripts/check-hand-authored-sets.mjs from=corpus/knowledge/remaining-scripts-census.md
MUTATION_TARGET R duplicate=crates/ufo-core-runtime/src/loop_driver.rs from=corpus/knowledge/loop-driver.md into=corpus/knowledge/runtime-remainder-census.md drop=crates/ufo-core-runtime/src/axes.rs from=corpus/knowledge/runtime-remainder-census.md
MUTATION_BASELINE S_sections=86 R_sections=83
MUTATION_AFTER_S S_sections=86 R_sections=83
MUTATION S dup-one/drop-one before=86 after=86 killed=no
MUTATION_AFTER_R S_sections=86 R_sections=83
MUTATION R dup-one/drop-one before=83 after=83 killed=no
MUTATION_KILLS 0/2
```

No installs, builds, linters, formatters, or unrelated tests were run. No blocker for this scoped instrument.
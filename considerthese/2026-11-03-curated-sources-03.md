# kumitate: third curated source to consider after hyaku

Date: 2026-11-03

**Status: unassimilated future reading after hyaku.** Candidate only: no compilation, installation, history capture, simulation or changes to orchestration were performed.

## Porcupine: checking observed histories against a sequential contract

**Primary source:** Anish Athalye's [Porcupine snapshot](https://github.com/anishathalye/porcupine/tree/d9047486691083fc42fb89b40b08a3d9b9ab0c32), commit d9047486691083fc42fb89b40b08a3d9b9ab0c32. Its [commit record](https://github.com/anishathalye/porcupine/commit/d9047486691083fc42fb89b40b08a3d9b9ab0c32) is dated 2026-07-12T16:24:18Z. Read 2026-11-03; snapshot identity is not a latest-release assertion.

**Why this gap:** Stateright explores an abstract coordinator model. Porcupine offers a different evidence route: test a recorded concurrent history against a sequential specification. It supports timestamped operations or ordered call/return events. Its timeout-aware result distinguishes Ok, Illegal and Unknown.

**Reading path:** Pinned README.md, Usage and Notes; [model.go](https://github.com/anishathalye/porcupine/blob/d9047486691083fc42fb89b40b08a3d9b9ab0c32/model.go), Operation, Event, Model and CheckResult; porcupine.go, CheckOperationsTimeout and CheckEventsTimeout. Pay particular attention to closed timestamp intervals and the requirement for pure model transitions.

**Domain question:** Can competing worker claims and completion acknowledgments be explained by one legal sequential ownership history?

**Possible later exercise, original proposal:** After hyaku, write a paper specification for claim, complete and inspect operations on a single work item. Draw one legal overlapping history and one impossible double-owner history. Preserve invocation/return boundaries, operation identities and uncertain outcomes rather than sorting only by completion timestamps. Define Unknown as inconclusive for admission, even where a monitoring application might tolerate it. Keep the evidence collector and model under separate review.

**Limits and rights:** Accurate histories and the chosen contract bound conclusions; passing sampled histories proves neither all executions nor eventual completion. Upstream warns about state-space explosion and timestamp-ordering hazards. The [MIT license](https://github.com/anishathalye/porcupine/blob/d9047486691083fc42fb89b40b08a3d9b9ab0c32/LICENSE.md) covers repository software/documentation with notice preservation; external datasets need separate review. Porcupine and its repository alias were absent from the reviewed registry and both prior curation batches.

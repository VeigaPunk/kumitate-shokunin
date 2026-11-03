# kumitate: fourth curated source to consider after hyaku

Date: 2026-11-03

**Status: unassimilated future reading after hyaku.** No build, simulation, fault injection, dependency adoption or orchestration change.

## FoundationDB: deterministic replay needs a controlled environment

**Primary source:** Apple's [FoundationDB snapshot](https://github.com/apple/foundationdb/tree/16783380100e5ec6d989d77df5697fd032116de8), revision 16783380100e5ec6d989d77df5697fd032116de8. Its [commit record](https://github.com/apple/foundationdb/commit/16783380100e5ec6d989d77df5697fd032116de8) is dated 2026-11-03T18:13:50Z. Read 2026-11-03; a commit snapshot, not a release or compatibility claim.

**Source summary:** FoundationDB's Flow runtime supports production and deterministic simulated execution. Simulation models a cluster within one thread and injects network, machine and storage failures. The testing documentation pairs simulation with live performance and hardware-failure testing. Client-testing guidance explains that replaying a seed requires workloads to avoid uncontrolled nondeterminism; multithreaded client behavior needs complementary tests.

**Reading path:** [documentation/sphinx/source/testing.rst](https://github.com/apple/foundationdb/blob/16783380100e5ec6d989d77df5697fd032116de8/documentation/sphinx/source/testing.rst), Correctness and Performance → Simulation → Performance testing with Circus; [client-testing.rst](https://github.com/apple/foundationdb/blob/16783380100e5ec6d989d77df5697fd032116de8/documentation/sphinx/source/client-testing.rst), Parallelism and Determinism and the end-to-end API testing discussion.

**New domain gap:** Loom explores instrumented interleavings, Stateright examines abstract state models, and Porcupine checks observed histories. This reference instead asks which environmental dependencies production-style execution must control to make an injected failure reproducible.

**Bounded future question, original proposal:** After hyaku, what would a replayable two-worker timeout incident have to record? Draw a paper boundary containing time, random choices, message delivery and durable-storage responses. Trace one worker disappearance and delayed acknowledgment twice, fixing the inputs. Then introduce an unrecorded wall-clock read and identify precisely which replay claim is lost. Separate deterministic reproduction from exhaustive schedule coverage, and list a multithreaded behavior that would remain outside the proposed model.

**Limits and rights:** FoundationDB-specific infrastructure is not a drop-in coordinator harness. Determinism does not prove coverage of every fault or real hardware behavior. The repository [license](https://github.com/apple/foundationdb/blob/16783380100e5ec6d989d77df5697fd032116de8/LICENSE) is Apache-2.0; preserve applicable notices and review dependencies separately. FoundationDB, Buggify and swizzle-clog aliases were absent from reviewed registries and all three earlier batches.

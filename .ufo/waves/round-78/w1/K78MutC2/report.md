# K78MutC2 acceptance report

Axes: operability + coverage.

Authoritative seat findings: `../K78MutC2.md`.
Runner: `../../build/K78MutC2/mutants-c2.mjs` (requires adjacent `mutations-c2.mjs`).
Actual outputs: `../../build/K78MutC2/battery-standin.txt`.

Stand-in result: `MUTANTS78_C2: ALL-KILLED killed=10/10`, exit 0.
Pristine and all ten exact-byte restorations: `C78_C2: HELD held=11/11`, exit 0.
Ten mutants each caused frozen counter exit 1. Every before/restored SHA-256 equals `cb0ea5d67d347f0cb4c6c85f4985e8f8f044201ec0ddb674ed94068586910bff`; individual mutated hashes are in the receipt.

The eight requested categories are covered; sorted-order, entry key-set, and document key-set validation are independently challenged. No survivors, nomatches, or crashes in the successful Node run. The content-reading mutant was killed by the content-blind arm (`changed=1`, exit 1 rather than IN_SYNC).

Scratch was deleted after receipt capture. No tools installed. No lane source/probe edits or git mutations. L1 reruns against final integrated bytes; this is stand-in evidence only.

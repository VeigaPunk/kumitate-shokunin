# K91CriticA repro — shy-strip

- Candidate: `cand-shy-strip.mjs` (sha256 in `../../scores.md`)
- Frozen predicate: `C91_C1: HELD held=56/56` — receipts `../../receipts/`
- Declared class: ROUTED, NOT a declared class — new invisible code-point class (U+00AD mid-token); reported out-of-class per plan
- Right verdict (positive control `ref-fd-fstat.mjs`): FAIL-CLOSED UNRESOLVED, exit 2 (the revision carries no such path — M4 semantics)
- Candidate verdict: CLEAN matched=1 external=0, exit 0 (the strip rewrote the token to the committed tool)
- Recorded output of this exact script: `OUT.txt`
- Receipt bytes are emitted by run-repro.sh with printf in the probe's own shape (rev=/tool_sha256=/cmd=).

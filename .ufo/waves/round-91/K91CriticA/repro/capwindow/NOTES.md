# K91CriticA repro — capwindow

- Candidate: `cand-capwindow.mjs` (sha256 in `../../scores.md`)
- Frozen predicate: `C91_C1: HELD held=56/56` — receipts `../../receipts/`
- Declared class: external regular file OVER the 16777216 cap (declared: over or at the cap)
- Right verdict (positive control `ref-fd-fstat.mjs`): FAIL-CLOSED UNRESOLVED, exit 2 (over-cap must refuse even with the correct digest)
- Candidate verdict: CLEAN matched=1 external=1, exit 0 (the over-cap instrument is bound)
- Recorded output of this exact script: `OUT.txt`
- Receipt bytes are emitted by run-repro.sh with printf in the probe's own shape (rev=/tool_sha256=/cmd=).

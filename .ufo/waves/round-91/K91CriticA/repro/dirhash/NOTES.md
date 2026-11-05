# K91CriticA repro — dirhash

- Candidate: `cand-dirhash.mjs` (sha256 in `../../scores.md`)
- Frozen predicate: `C91_C1: HELD held=56/56` — receipts `../../receipts/`
- Declared class: external DIRECTORY (non-empty; the probed ext-dir fixture is an empty directory)
- Right verdict (positive control `ref-fd-fstat.mjs`): FAIL-CLOSED UNRESOLVED, exit 2 (a directory is never a regular instrument)
- Candidate verdict: CLEAN matched=1 external=1, exit 0 (the directory is bound via its sorted listing digest)
- Recorded output of this exact script: `OUT.txt`
- Receipt bytes are emitted by run-repro.sh with printf in the probe's own shape (rev=/tool_sha256=/cmd=).

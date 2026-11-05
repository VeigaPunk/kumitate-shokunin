# K91CriticA repro — extsh-gate-overcap

- Candidate: `cand-extsh-gate.mjs` (sha256 in `../../scores.md`)
- Frozen predicate: `C91_C1: HELD held=56/56` — receipts `../../receipts/`
- Declared class: external regular file OVER the 16777216 cap, named WITHOUT the .sh suffix
- Right verdict (positive control `ref-fd-fstat.mjs`): FAIL-CLOSED UNRESOLVED, exit 2
- Candidate verdict: CLEAN matched=1 external=1, exit 0 (v4 fallback reads and binds the over-cap file)
- Recorded output of this exact script: `OUT.txt`
- Receipt bytes are emitted by run-repro.sh with printf in the probe's own shape (rev=/tool_sha256=/cmd=).

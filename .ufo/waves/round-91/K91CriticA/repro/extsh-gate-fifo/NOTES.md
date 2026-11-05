# K91CriticA repro — extsh-gate-fifo

- Candidate: `cand-extsh-gate.mjs` (sha256 in `../../scores.md`)
- Frozen predicate: `C91_C1: HELD held=56/56` — receipts `../../receipts/`
- Declared class: external FIFO with no writer, named WITHOUT the .sh suffix the probe always uses
- Right verdict (positive control `ref-fd-fstat.mjs`): FAIL-CLOSED UNRESOLVED, exit 2 within the 20 s bound
- Candidate verdict: NO VERDICT at all — blocking open() on the writer-less FIFO until the kill (timeout)
- Recorded output of this exact script: `OUT.txt`
- Receipt bytes are emitted by run-repro.sh with printf in the probe's own shape (rev=/tool_sha256=/cmd=).

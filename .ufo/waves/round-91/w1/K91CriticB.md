# K91CriticB — round 91 C1 harm check (receipt-bind v5 vs v4)

Ruling: **NO HARM** on real lane history (scoped to the committed positive control; see caveats).

- Close dirs: 43 committed `.ufo/waves/round-45..90/close` at rev `2b1b8bf3…`: **AGREE 43, DIFF 0**. Verdicts: CLEAN 3, DRIFT 35, FAIL-CLOSED 5.
- Single receipts: 479 direct `*.txt` receipts, each alone: **AGREE 479, DIFF 0**. Verdicts: CLEAN 58, DRIFT 380, FAIL-CLOSED 41 (all `REV_UNRESOLVED`, non-40-hex `rev=`, identical in both tools).
- Exit pairs match in every row; no stderr, no timeouts.
- Real-history external instrument: only `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh` (regular, 35466 B, not a symlink). No real-history input is in a declared class (no char device, FIFO, directory, over-cap, empty or at-cap external), so this run does not exercise the claimed behaviour.
- Caveat: the lane's `scripts/receipt-bind.mjs` at the frozen rev is still v4 (sha `35f4f25e…`). The tested v5 surface is `controls/ref-fd-fstat.mjs` (sha `bc3df527…94db`) only; the integrated v5 is untested here.
- Nested `.txt` files (6: five under `round-70/close/replay/`, one under `round-85/close/s5-fixtures/`) are not walked by either tool, so they are not a difference.

Artifacts: `.ufo/waves/round-91/K91CriticB/harm.md`, `dirs.tsv`, `singles.tsv`, `evidence/` (driver `run.sh`, `run.log`, committed-path lists, v4 copy and sha, external-instrument stat). Scratch removed before yield. No lane file other than the seat dir was written; `w1/K91CriticB.md` is this report at the path the spec's Report trailer names.

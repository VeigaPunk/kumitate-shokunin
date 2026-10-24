# ExecInstrumentV2 — v2 receipt instrument

## Files changed
- `.ufo/waves/round-52/build/ExecInstrumentV2/receipt-attest.mjs`
- `.ufo/waves/round-52/build/ExecInstrumentV2/selftest.txt`

## Behavior delivered
- Implements the v2 receipt field whitelist, strict two-line/trailing-newline shape and exact UTC prelude grammar; rejects unknown fields as UNREADABLE and sidecar basename mismatches as TAMPERED.
- Requires finite wall-clock parsing and exact `toISOString()` round-trip; preserves clock ordering/window and v1 receipt/digest/verdict/exit semantics.
- Adds `run --stdin`: generates the nonce before spawn, sends its 32 UTF-8 bytes and closes stdin, and records `stdin_sha256`. Spawn failures remain receipt exit 127; sidecar write failure removes the incomplete pair and exits 2.
- Documents and exercises the damaged-prior ledger skip note. Includes sidecar, inner-digest, ledger different-record-digest, and attested-prior recorded-digest 16-bit-prefix cases, plus distinct nonce-prefix and special-basename coverage.
- Retains all 27 v1 selftest cases; the v2 suite has 46 cases.

## Exact retained evidence
- Ran `node .ufo/waves/round-52/build/ExecInstrumentV2/receipt-attest.mjs --selftest`: exit 0; 46 `case <name>: PASS` lines; final line `ATTEST_SELFTEST: PASS (46/46)`. Verbatim transcript: `.ufo/waves/round-52/build/ExecInstrumentV2/selftest.txt`.
- Delivered script SHA-256: `3d10d554e70a9d5dcb510287d3d030e04abe873f2573b922b961e9071ab7f01a`.
- Peer-retained evidence (not run by this seat): ExecCompat reports all three round-51 receipts VALID directly and with `--ledger` in `.ufo/waves/round-52/build/ExecCompat/b6-transcript.txt`; ExecStdinRehearsal reports five `/bin/cat` receipts and two odd stdin shapes valid in `.ufo/waves/round-52/build/ExecStdinRehearsal/v2-receipt-rehearsal.json`; ExecBlackBox reports 20 checks passing in `.ufo/waves/round-52/build/ExecBlackBox/blackbox.txt`. MutSelftest and RevInstrumentV1 report all three 16-bit truncation mutants killed, and RevInstrumentV1 reports 17/17 current-contract checks, on the immediately preceding `4d9d824a…` snapshot; details are in `.ufo/waves/round-52/w1/MutSelftest.md` §Measurement 2c and `.ufo/waves/round-52/w1/RevInstrumentV1.md` (transcripts in `build/RevInstrumentV1/mutant-*.selftest.txt`). The only source difference since then is selftest case 46; runtime code is unchanged.

## Risks and blockers
- L1's remaining close evidence includes rerunning/recording the repaired frozen counter: RevInstrumentV1 reports its live A52 probe hash differs from the freeze record, `plan.md` has no numbered addendum, and `base/attest52-base.txt` is not re-committed; the repaired-probe rerun at the base was byte-identical to the committed receipt. It also reports `build/MutCounter52/counter-mutant.txt` absent, leaving B5c unreachable in `git archive`. The L1 owns these evidence-only close items. The 46th case is selftest-only; no mutant matrix was run against this new hash.
- No LSP tool was available in the supplied tool inventory; source behavior was read directly. No tools were installed.

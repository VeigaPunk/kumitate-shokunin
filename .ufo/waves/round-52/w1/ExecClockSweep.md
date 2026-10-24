# ExecClockSweep — V8 clock behavior

## Deliverable

- `.ufo/waves/round-52/build/ExecClockSweep/clock-sweep.mjs` tests the eight assigned timestamps with `Date.parse`, records finite status and `toISOString()` result, classifies NaN/roll/exact, and asserts that every finite rollover fails the exact-round-trip check.
- `.ufo/waves/round-52/build/ExecClockSweep/clock-sweep.md` retains the measured table and interpretation.

## Finding

Measured on Node v24.21.0 / V8 13.6.233.17-node.53: **yes, the finite-plus-exact-round-trip check rejects every observed roller (2/2)**. The non-leap Feb 29 input rolls to March 1; hour 24 rolls to the next day. Month 13, day 32, and minute 60 yield NaN. Year 0000, year 9999 maximum timestamp, and control round-trip exactly.

Important B1c discrepancy: the frozen `attest52-probe.mjs` says its `2026-13-01T00:00:00.000Z` fixture rolls into January 2027 (comment lines 20–25 and 143) and describes it as rolled at the fixture (line 163). The measured runtime instead returns NaN for that input. Thus the current B1c fixture tests rejection of a non-finite clock, not a finite rollover; `2023-02-29T00:00:00.000Z` or `2026-01-01T24:00:00.000Z` are measured finite-roll alternatives. I did not modify the frozen probe or any non-assigned path.

## Retained evidence

- Runtime: `node --version` → `v24.21.0`; `node -p 'process.versions.v8'` → `13.6.233.17-node.53`.
- Command: `node .ufo/waves/round-52/build/ExecClockSweep/clock-sweep.mjs`.
- Captured output ended: `Exact-round-trip check rejects every roller: YES (2/2).` The output table is retained in `build/ExecClockSweep/clock-sweep.md`.
- RFC scout source already present at `.ufo/waves/round-52/build/ScoutRfc3339/rfc3339.txt`; no peer artifact was needed.

No tool installed or updated. No build/lint/test/formatter run; the Node execution above is the explicitly assigned behavior measurement.

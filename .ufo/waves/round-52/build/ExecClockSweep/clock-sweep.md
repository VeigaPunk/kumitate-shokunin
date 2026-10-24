# V8 `Date.parse` clock sweep

Measured with `node` v24.21.0, V8 13.6.233.17-node.53. Re-run from the lane root with:

```sh
node .ufo/waves/round-52/build/ExecClockSweep/clock-sweep.mjs
```

| Written clock | `Date.parse` finite? | `toISOString()` | Class | Exact round-trip? | Finite + exact contract rejects? |
|---|---:|---|---|---:|---:|
| `2026-13-01T00:00:00.000Z` | no | — | NaN | n/a | yes |
| `2026-01-32T00:00:00.000Z` | no | — | NaN | n/a | yes |
| `2023-02-29T00:00:00.000Z` | yes | `2023-03-01T00:00:00.000Z` | roll | no | yes |
| `2026-01-01T24:00:00.000Z` | yes | `2026-01-02T00:00:00.000Z` | roll | no | yes |
| `2026-01-01T00:60:00.000Z` | no | — | NaN | n/a | yes |
| `0000-01-01T00:00:00.000Z` | yes | `0000-01-01T00:00:00.000Z` | exact | yes | no |
| `9999-12-31T23:59:59.999Z` | yes | `9999-12-31T23:59:59.999Z` | exact | yes | no |
| `2026-01-01T00:00:00.000Z` | yes | `2026-01-01T00:00:00.000Z` | exact | yes | no |

**Finding:** the exact round-trip check rejects both finite rollers (2/2); the contract's finite-plus-exact predicate also rejects all three NaN cases. In this measured V8, month 13 is NaN rather than a rollover, so the frozen B1c fixture's behavior comment is inaccurate. The finite Feb 29 and hour 24 cases are observed rollovers suitable for a rollover fixture.

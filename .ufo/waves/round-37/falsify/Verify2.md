D2 present=yes honest=yes verdict=holds

Axis: operability.

Command (lane root): `node scripts/claims-check.mjs --selftest`
Output:
```text
CLAIMS_SELFTEST: 47/47 pass
VERDICT: PASS
```

Evidence: `scripts/claims-check.mjs:300-305` documents the round-37 canonical rule and implements `const pair = prev ?? next ?? null`. The new case at `scripts/claims-check.mjs:1178-1189` constructs the contested ordering (`BETA_MARK` before `scripts/a.mjs:3`, `ALPHA_MARK` after it), then requires exit 1, `FIDELITY: DRIFT`, and `nonok=1`. Fixture source `scripts/claims-check.mjs:840-842` puts `ALPHA_MARK` at line 3 of `scripts/a.mjs`; therefore left-first selects preceding `BETA_MARK`, which is not on the cited line, while right-first would select the line-3 `ALPHA_MARK` and reward the shift. The hermetic `check` helper appends that assertion to the reported result count (`:901-906`); the rerun passes all 47 cases.

Disposition in `.ufo/waves/round-37/repairs.md:6-7` and `LOG.md:1717-1719` is present and supported: both state left-first (`prev ?? next`) and the next-symbol shift test; the implementation and passing selftest substantiate it. No D2 contradiction found.
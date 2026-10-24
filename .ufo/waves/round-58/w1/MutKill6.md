# MutKill6 — A58 drop-one checks-count mutant

- Round/wave/seat: 58 / `w1` / `MutKill6`
- Role: mutation-tester
- Axes: operability, coverage
- Judged revision (R1): `6affb9ebde37b7d663658f1959d64f0f0b68f480`
- Scoped result: **KILLED — the A58 checks-count pin fired**

## Mutation

The original scratch copy has the R1 probe bytes (SHA-256
`6e5c67693f8409959f51bcab0a2255c44153b678b2934708a10812d32a69d84b`). In the
mutant copy I deleted exactly the B8 `hold` call:

```diff
-    hold('B8', transcriptOk && guardOk, `transcript=${transcriptOk} guard=${guardOk}`);
```

The `EXPECTED_CHECKS = 10` declaration and the verdict-tail
`if (checks.length !== EXPECTED_CHECKS)` guard remain unchanged. This is the
frozen drop-B8/drop-one shape: the count pin is the mechanism under test, not
something removed from this mutant. The complete diff is
`build/MutKill6/logs/mutation.log`; both copies passed `node --check` (exit 0).

## Before/after at R1

Both runs used the lane `/home/vgpnk/Projects/shokunin/kumitate-shokunin` and
exact revision `6affb9ebde37b7d663658f1959d64f0f0b68f480`. Full command,
stdout, stderr, and exit files are under `build/MutKill6/logs/`.

### Original probe

Command:

```bash
node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-58/build/MutKill6/original/attest58-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin 6affb9ebde37b7d663658f1959d64f0f0b68f480
```

Observed stdout (complete):

```text
ATTEST58: ATTEST58_HELD held=10/10 checks=10 rev=6affb9ebde37b7d663658f1959d64f0f0b68f480 rule=A58 version=v1 | B1 PASS | B2 PASS | B3 PASS | B4 PASS | B5 PASS | B6 PASS | B7 PASS | B8 PASS | B9 PASS | B10 PASS
```

Observed stderr: empty. Exit code: `0`.

### Drop-B8 mutant

Command:

```bash
node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-58/build/MutKill6/mutant/attest58-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin 6affb9ebde37b7d663658f1959d64f0f0b68f480
```

Observed stdout (complete):

```text
ATTEST58: ATTEST58_UNMET held=9/9 checks=9 rev=6affb9ebde37b7d663658f1959d64f0f0b68f480 rule=A58 version=v1 | checks-mismatch want=10
```

Observed stderr: empty. Exit code: `1`. No `ATTEST58_HELD` token occurred in
the mutant output. The mutant therefore cannot turn a dropped check into a
vacuous HELD result: the frozen count guard emits `UNMET` and
`checks-mismatch` instead.

## Evidence and bounds

- `build/MutKill6/original/attest58-probe.mjs` and
  `build/MutKill6/mutant/attest58-probe.mjs` — before/after source copies.
- `build/MutKill6/logs/setup.log` and `mutation.log` — setup, hashes, exact
  one-line diff, and syntax-check exits.
- `build/MutKill6/logs/original.{command,stdout,stderr,exit}.txt` and
  `build/MutKill6/logs/mutant.{command,stdout,stderr,exit}.txt` — decisive
  before/after runs.
- `build/MutKill6/logs/assertions.{command,stdout,stderr,exit}.txt` — final
  independent assertions, exit `0`: exact one-hold diff, original HELD 10/10,
  mutant UNMET 9/9 with `checks-mismatch`, no mutant HELD, and count pin
  retained. The preserved `assertions-initial.*` files record an auxiliary
  harness attempt with an incorrect syntactic call-count assertion; it was not
  a probe run and was superseded by the corrected final assertion.
- `build/MutKill6/logs/integrity.{command,stdout,stderr}.txt` — HEAD remained
  R1, `git cat-file -t R1` returned `commit`, the scoped production-probe diff
  against R1 exited `0`, and the production probe hash still equals the
  original scratch hash.

Only the scratch copy and this seat's evidence/report were written. No
production bytes, lane git/jj state, commits, pushes, installs, or sibling-seat
files were changed. This is a targeted mutation result for the A58 count pin,
not an independent round-level A58/D58 verdict.

Report: .ufo/waves/round-58/w1/MutKill6.md

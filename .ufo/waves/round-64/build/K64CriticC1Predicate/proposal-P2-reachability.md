# Proposal — make P2 reachable without relaxing it (K64CriticC1Predicate)

Status: proposal only. The counter, controls and generator are frozen; the L1 integrates.

## The defect

`receipt64-probe.mjs:61` requires `seen.size >= 8`. `seen` is filled from the `expect` files of
cases that pass. The frozen 16 cases exercise exactly six ids:

    HASH_DEAD PLACEHOLDER RECEIPT_MISSING SECTION_MISSING SHONEN_COUNT TALLY_UNRECEIPTED

`scripts/report-receipt-diff.mjs` can emit seven (`+ HASH_ORPHAN`). `HASH_ORPHAN` is not
exercisable through P2's fixed argv (`--lane <case>/lane --round 9 --report <case>/report.md`):
it needs `git -C <case>/lane cat-file -e <h>` to succeed, and a case lane is a plain directory
inside a `git archive | tar -x` tree, so every hash there is `HASH_DEAD`.

Measured: honest tool + honest close receipt + honest report = `RECEIPT64_UNMET held=4/5 | P2 MISS ids=6`
(sandbox commit 90dfce3a7526ca14c865c9ef9094404626b2451b).

## Two legal repairs

(a) **Relax** `seen.size < 8` → `< 6`. Forbidden: the plan says a fix never relaxes a check, and
    P2's id floor is a check. Do not integrate.

(b) **Strengthen** to eight ids: add two detectors for lies the tool accepts today, and one
    control case each. Both are text-level, so both are exercisable through P2's fixed argv, and
    both were reproduced before this proposal (see the report's findings -5..-8).

## Patch sketch — scripts/report-receipt-diff.mjs

```js
// after the RECEIPT_MISSING block
const OFFROUND = /\.ufo\/waves\/round-(\d+)\/(?:base|close)\/[A-Za-z0-9._-]+/g;
for (const m of new Set([...text.matchAll(OFFROUND)].map((x) => x[0])))
  if (m.match(/round-(\d+)/)[1] !== String(round)) add('RECEIPT_OFFROUND', m);

// inside the TALLY loop, replacing the single `if (!allLines.some(line))`
const hits = allLines.filter(line);
const NEGATED = /\b(NOT|never|not reached|plan target|is the target)\b/;
if (!hits.length) add('TALLY_UNRECEIPTED', key);
else if (hits.every((l) => NEGATED.test(l))) add('TALLY_NEGATED', key);
```

Two selftest cases (`receipt-offround`, `tally-negated`) take N from 20 to 22 (P1 floor is >= 20).

## Control cases (both are single-line alterations of `c0-honest`)

- `c16-receipt-offround`: append `see \`.ufo/waves/round-8/close/p-tip.txt\`` → `1\nRECEIPT_OFFROUND\n`
- `c17-tally-negated`: add `lane/.ufo/waves/round-9/close/neg.txt` =
  `NOTE: X9_HELD was NOT reached; held=3/3 is the plan target, not a result` and append
  `X9_HELD held=3/3 (\`.ufo/waves/round-9/close/neg.txt\`)` → `1\nTALLY_NEGATED\n`

`seen.size` becomes 8; `cases.length` 18 (>= 14); `clean` stays 3; `c0-honest` unchanged.

## Integration cost and risk

- `make-receipt-controls.mjs` is pinned in `.ufo/pins/counter-pins.json`; adding cases means
  editing the pinned generator and re-recording the pin. That is an L1 act.
- Re-run P3 and P5 after the patch: `RECEIPT_OFFROUND` must not fire on r60/r63 (both cite only
  their own round) and `TALLY_NEGATED` must not fire on the round-60/63 receipts.
- If any seat's verdict has already been recorded under rule R64, the plan's no-retroactive-change
  rule applies: the honest outcome is C1 UNMET, not a patched rule.

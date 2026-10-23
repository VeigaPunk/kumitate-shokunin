# Round 48 SCORECARD fragments (freeze snapshot)

Source: a no-hardlinks sandbox clone detached at `fe3d45bf929246915c8c0de5f7f8682b5015b22c`.

## Live proxy terms at freeze

| Term | Command / basis | Result |
|---|---|---:|
| A | `find . -path ./.git -prune -o -type f \( -name '*.mjs' -o -name '*.sh' -o -name '*.py' \) -print \| wc -l` | 26 |
| C | `grep -c '^\s*- \[' SKILL.md` | 22 |
| C2 map rows | `grep -c '^| \`\(knowledge\|lessons\)/' corpus/README.md` | 106 |
| C2 corpus files | `find corpus/knowledge corpus/lessons -name '*.md' \| wc -l` | 107 |

C2 is `106/107` at the frozen tree; the unmatched corpus file is `lessons/round-47-verifier-spotcheck.md`. The frozen SCORECARD formula for `f_O` is `(A+C)/(A+C+3)`: substituting these observed A/C values gives `48/51 ≈ 0.941`, hence integer 9. This is a derived freeze reading, not a C1/C2 close result.

## Move-log row skeleton

Keep the before/after cells as close-time placeholders; the L1 fills each from committed measurements and receipts.

| Round | Axis | Before | After | Evidence |
|---|---|---|---|---|
| 48 | operability (C1: RG742, SP491, SP519 and SP1592 routed through `scripts/cap-run.mjs` v2 via `scripts/cap-spawn.mjs` `capSpawnSync`; C2: `counter-rerun` capability acquisition; C1 sourced on S098/S093/S069/S072/S095; C2 routed from R47-1 / Mistake 3) | `[L1: insert C1 and C2 before measurements at their frozen bases]` | `[L1: insert C1 same-commit score plus every required rerun, and C2 selftest plus real frozen-F48 AGREE receipt]` | `.ufo/waves/round-48/plan.md` §§ C1–C2; frozen `probe/caproute48-probe.mjs`; close-time C1/C2 committed receipts `[L1: insert paths]` |

## Candidate capabilities-table row text

**Append only if the C2 kill rule is met.** This is proposed row copy, not evidence that the capability ran at freeze.

| Capability | What it can now do | Evidence pointer | First-working round |
|---|---|---|---|
| `counter-rerun` | Run a probe K times and compare each run's final summary line byte-for-byte; print `COUNTER_RERUN: AGREE (runs=K)` and exit 0 iff every run exits 0 and all final lines match, otherwise print `DISAGREE` and exit 1; fail closed with exit 2 for unreadable probe/lane/rev or unparsable output, and use exit 64 for usage. The selftest includes flake injection that a print-PASS stub must fail. | [L1: insert committed selftest PASS receipt path]; [L1: insert committed real AGREE receipt over frozen F48 probe, exact command and path] | round 48 |

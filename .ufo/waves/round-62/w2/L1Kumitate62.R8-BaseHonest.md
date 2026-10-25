# R8-BaseHonest — honest S195 row is unreachable under frozen C2

Read-only finding, attempt 1. Lane HEAD observed: `0cbe0d75e5a08718e2256408329692908c837766`. No round-62 plan exists locally (see `w2/CriticC2.md` §0); this finding makes no claim about a frozen r62 plan or verdict.

## Counterexample and evidence

The requested a0 honest-control replay is conclusive: committed receipt `.ufo/waves/round-61/controls/ctl-c2-critic-a0-honest-row-vacuity.txt` lines 1–23 records a fully honest build at scratch commit `661c4e2`: real capture hash `8ef2ee5f5e196d9d14fc8c85449442764e812f3e4f0f6e2bb1bdc12895f0f8fc`, contract-shaped S195 row, re-grounded entry, README row and pin. The exact frozen counter command returned `DOCTRINE61_UNMET held=4/6`; E1, E2, E5, E6 PASS, but E3 `MISS row-absent` and E4 `MISS pin= sha=8ef2ee5f5e196d9d` (receipt lines 7–15). The external census independently returned exit 0 (`ok`, lines 16–18), so this is not an invalid honest fixture.

Reason: frozen C2 E3 regex is `/^\|[[:space:]]*S195[[:space:]]*\|/`. JavaScript interprets `[[:space:]]` as a character class of literal characters, not POSIX whitespace; therefore ordinary `| S195 |` fails. Even if regex matching succeeded, E3 reads cells `c[9]/c[10]/c[12]`; the 11-cell contract row has `mined`/`2026-10-25`/used-by at `c[8]/c[9]/c[11]`. The cited a0 receipt states both defects at lines 20–23. Consequently E3 cannot recognize the honest row and E4 receives no row pin; E5's census accepts the same Registry schema (NF=13, 11 contract cells). This is an unsatisfiable predicate, not evidence against source authenticity.

Independent corroboration: `w2/CriticC2.md` lines 25–31 demonstrates the fixed regex accepts the honest Registry row and contract indices 8/9/11 hold; lines 137–140 prescribe regex, indices and Registry scoping. `w2/CounterReplay.md` lines 126–139 also notes the frozen indices mismatch and honest row cell structure. The source probe itself is committed at `.ufo/waves/round-61/probe/doctrine61-probe.mjs` (E3); R8 does not infer a round-62 plan from this unchanged r61 control.

## Impacted axes

Conformance/measurement correctness: an honest, externally census-valid capture is falsely rejected; the counter cannot measure its stated honest-control target. Provenance discrimination is also weakened because a counter that misses the true row may accept probe-shaped phantom rows (separately evidenced in `CriticC2.md` §1; not retested here).

## Smallest safe correction

Use JavaScript whitespace regex `/^\|\s*S195\s*\|/`, validate the contract fields at indices 8, 9, 11, and restrict row discovery to `## Registry`. Preserve the capture/census checks; rerun this exact a0 control and require E3/E4 PASS while retaining a negative forged-control test. This correction fixes the vacuous honest-row failure, but by itself does not authenticate a self-pinned fabricated capture.

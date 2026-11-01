# Round 71 budget measurements — receipt-indexed (all times are the receipts' own durationMs)

## Step 1 — fresh singles under the r70-committed 900 s cap (`m1-*.txt`)

| mode | durationMs | childExit | signal | r70 receipt (close/replay/ctl-*) | ratio |
|---|---|---|---|---|---|
| c1 donothing | 900046 | -1 | SIGTERM (cap kill) | 643315 | ≥1.40 |
| c1 autoledger | 900040 | -1 | SIGTERM (cap kill) | 787137 | ≥1.14 |
| c2 donothing | 394081 | 0 | — | 312367 | 1.26 |
| c2 autoorigin | 412641 | 0 | — | 274320 | 1.50 |
| c2 forgecapture | 430148 | 0 | — | 263845 | 1.63 |

Reading: the host as it stands during round 71 runs every control slower than the window in
which the r70 tool commit `89cbd998` calibrated its 900 000 ms cap (max then 787 137 ms).
Both c1 controls did not finish inside the cap — their true costs are unknown from this step
(the m1 receipts record the kill, not a completion). Sequence log: `m1-sequence.log` (its
exit-code column is invalid: the runner read `$?` after a `$(date …)` substitution had
clobbered it — lesson `corpus/lessons/round-71.md`; the receipts' own `childExit`/
`durationMs` are the authority and the receipts are digested).

## Step 2 — scaffold completions under the 2 400 000 ms cap (`s1-*.txt`, `conc-*`)

| run | durationMs | childExit | notes |
|---|---|---|---|
| s1 c1 donothing | 921210 | 0 | completed: CONTROL-PASS, LEDGER69 verdict present |
| s1 c1 autoledger | 922358 | 0 | completed |
| conc c2 donothing (2-way, shared root) | 689670 / 689597 | 0 / 0 | tool exits 1,0 — the early finisher's own workEmpty check counts the late child (measured V13 corollary, counter-side fix); work root clean after both settled (`conc-scaffold.txt` `workEntriesAfter=0`) |

Derivation (plan's two-step rule): `toolBudget = ceil(1.25 × 922358 / 60 s) × 60 s =
1 200 000 ms` — the tool constant lands at 1 200 000 ms with `pin.control-replay` re-pinned
in the same commit. The pair (713 995 ms wall) sits inside the budget, so V13's mode stays
c2/donothing. Counter-side waits = 1 200 000 + 60 000 = 1 260 000 ms. Residual, disclosed:
a future window slower than ~1.30× the observed worst completion (922 358 ms) trips the cap
honestly — the receipt records the kill and the counter reports MISS.

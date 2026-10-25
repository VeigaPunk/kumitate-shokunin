# Audit20 — Round-60 tip receipts vs sandbox re-runs

Seat: `L1Kumitate61.Audit20` (critic, wave 2). Scope: re-run the round-60 probes
(`dispatch60-probe.mjs`, `doctrine60-probe.mjs`) in a sandbox at `a745a3b0` and at the
receipt-commit tip `be4a820`; compare against `close/` receipts, `SCORECARD.md` report
claims, the frozen `round-60/plan.md` progression, and round-61 wave-1 seat claims.

## Method (all commands exercised, none inferred)

- Sandbox: `git clone --no-checkout /home/vgpnk/Projects/shokunin/kumitate-shokunin
  /tmp/kumitate-r61/Audit20/lane-clone` (read-only w.r.t. the lane; lane git index untouched).
- Probes extracted by `git show <rev>:.ufo/waves/round-60/probe/<p>.mjs` at `a745a3b0` and
  `be4a820`; **all four copies byte-identical** to the lane worktree files:
  `dispatch60-probe.mjs` sha256 `31469f02…`, `doctrine60-probe.mjs` sha256 `626e1d39…`
  (matches `RevTipReceipts`'s reported SHAs).
- Runs: `env -i PATH=/usr/bin:/usr/local/bin HOME=/tmp/kumitate-r61/Audit20 node
  probe-*/<p>.mjs lane-clone <rev>`, `GIT_*` scrubbed.

## Re-run results

| run | head line | exit |
|---|---|---|
| dispatch @ `a745a3b0` | `DISPATCH60: DISPATCH60_UNMET held=8/10 checks=10 rev=a745a3b0… rule=A60` (A1-A6 PASS, A8-A9 PASS; **A7 MISS row-absent, A10 MISS exit=2 FAIL-CLOSED wave-dir-absent**) | 1 |
| doctrine @ `a745a3b0` | `DOCTRINE60: DOCTRINE60_HELD held=6/6 checks=6 rev=a745a3b0… rule=D60` — F1-F6 PASS | 0 |
| dispatch @ `be4a820` (the "tip" receipt commit) | `DISPATCH60: DISPATCH60_UNMET held=9/10 checks=10 rev=be4a820… rule=A60` — A1-A9 PASS; **A10 MISS exit=2 FAIL-CLOSED registry-unreadable path=…/round-60/w1/dispatch-actual.json** | 1 |
| doctrine @ `be4a820` | identical 6/6 | 0 |
| dispatch @ base `ffbfe3cc` | `held=0/10` — byte-identical to `base/dispatch60-base.txt` | 1 |
| doctrine @ base `ffbfe3cc` | `held=0/6` — byte-identical to `base/doctrine60-base.txt` | 1 |

Head lines match the receipts byte-for-byte except the probe's own ephemeral `mkdtemp` suffix
(by construction differs per run). `close/dispatch60-tip.txt` and `close/doctrine60-tip.txt`
are reproduced exactly. `doctrine60` has **zero contradictions** anywhere.

## Contradictions

1. **`SCORECARD.md:2833-2834` vs the very receipt it cites.** The round-60 report claims
   "After: at the measured revision `__MEASURED__` → `DISPATCH60_HELD held=10/10 checks=10`
   exit 0 (`close/dispatch60-tip.txt`)". The cited receipt measures `a745a3b0` and prints
   `DISPATCH60_UNMET held=8/10`, exit 1. No 10/10 dispatch receipt exists at any committed
   rev; the `__MEASURED__` placeholder remains unfilled at HEAD (R60-V2 defect, also recorded
   in `corpus/lessons/round-60-verifier-spotcheck.md:26`).
2. **Scorecard report vs round-61 plan.** The report claims C1 delivered 10/10; the round-61
   plan (`plan.md:44-47`, `:125`) records the opposite: "`DISPATCH60_HELD` **unmet** —
   `held=8/10` at `a745a3b0` (A7 row-absent, A10 wave-dir-absent)".
3. **Frozen `round-60/plan.md:61-63` vs observed progression.** Declared before data:
   "work commit → `held=9/10` with exactly A10 MISS". Observed at the work commit: `8/10`
   with A7+A10 MISS. This stale expectation is unchanged through HEAD (the same seat at
   `w1/ExecDispatch60.stream.jsonl` line 16 flags it: "A7 is already an anomaly").
4. **Scorecard "next commit" claim.** `SCORECARD.md:2832-2833` says the capabilities row
   "was corrected to name round 60 in the next commit" after `a745a3b0`. `git show <rev>:
   SCORECARD.md | sed -n '1794p' | grep -c 'round 60'` gives 0 at both `a745a3b0` and the
   actual next commit `3304337`; the text landed in `165b830` (blame), two commits later.
5. **Commit message `be4a820` "record real round-60 tip receipts" vs content.** The receipts
   measure `a745a3b0` (an ancestor), not the tip. Re-running at `be4a820` itself yields
   9/10 (A7 now passes; A10 still fails). The close "tip" receipt does not describe the tip.
6. **Claimed 10/10 unreachable for round-60.** A10 requires the gate's
   `dispatch-actual.json` under `round-60/w1/`; the file exists only in round-59's committed
   tree (`.ufo/waves/round-59/w1/dispatch-actual.json`, commit `6122868`). Round-60 `w1/`
   is absent at `a745a3b0` (0 tracked paths) and at `be4a820` contains 72 files but no
   `dispatch-actual.json`, so A10 fails `FAIL-CLOSED` at every committed rev.

## Minor observations (not contradictions)

- `ExecTipReceipts.md` describes an appended note to `dispatch60-tip.txt` ("C1 after-state
  (10/10) is delivered by round 61 C1…"); the committed file (`be4a820`) and the current
  worktree file are 3 lines without it — the note was never committed.
- `close/dead-seats-r60.md` is untracked at HEAD (good-faith R60-V6 repair artifact).
- No tool installs/upgrades were made; no pacman transaction attempted.

## Verdict

`doctrine60` receipts: honest, reproducible, byte-exact (6/6, exit 0 at `a745a3b0`).
`dispatch60` receipts: honest (8/10, exit 1 at `a745a3b0`), but the **scorecard report
overstates them as 10/10**, and the frozen plan understated the miss set (predicted 9/10).
The 10/10 after-state was structurally unreachable; the round-61 plan correctly records
8/10.

## Smallest safe correction

In `SCORECARD.md` round-60 C1 block, replace the `__MEASURED__`/10/10 sentence with the
observed truth — "at `a745a3b0` → `DISPATCH60_UNMET held=8/10` exit 1 (A7+A10); 10/10 is
delivered by round 61 C1 (`round-61/plan.md`), not by round-60" — and update the frozen
`round-60/plan.md` progression note to record the observed 8/10 (A7+A10) instead of
9/10. Public reports should not cite `un/dispatch60-tip.txt` as a 10/10 receipt.

# ExecTipReceipts — R60-V4 repair (round 61, wave w1)

Seat: `L1Kumitate61.ExecTipReceipts` (leaf executor). Scope: the two round-60 tip receipts only.
Measured revision: `a745a3b0e02253e722834ef95042d97ed92e5e53` (round-60 work commit, ancestor of
lane HEAD `be4a820c344d4eb2f94b999c3b5d649e76ab70f1`).

## Files written

1. `.ufo/waves/round-60/close/dispatch60-tip.txt` — the required appended note added to the receipt
   at the real measured revision. `git diff --numstat` against HEAD: `1 0` (one insertion, zero
   deletions) — the observed DISPATCH60 line, its check-detail line and `exit=1` are byte-unchanged.
2. `.ufo/waves/round-60/close/doctrine60-tip.txt` — rewritten from a fresh run; result is
   **byte-identical to HEAD** (`git status` does not list it as modified).

I did not commit: the lane bounds for this seat forbid mutating the lane's git index / jj state
(`no git add/commit/...`, no `jj` mutating commands). Commit is the L1's step; the exact change to
commit is one modified file, `M .ufo/waves/round-60/close/dispatch60-tip.txt`.

## Verbatim observed lines

DISPATCH60 (probe exit code **1**):

```
DISPATCH60: DISPATCH60_UNMET held=8/10 checks=10 rev=a745a3b0e02253e722834ef95042d97ed92e5e53 rule=A60
```

DOCTRINE60 (probe exit code **0**):

```
DOCTRINE60: DOCTRINE60_HELD held=6/6 checks=6 rev=a745a3b0e02253e722834ef95042d97ed92e5e53 rule=D60
```

8/10 is the truth at this revision (A7 capabilities row absent, A10 dispatch record absent because
`.ufo/waves/round-60/w1/` is not in the committed tree). No 10/10 was fabricated; the receipt says so
explicitly via the appended note.

## Receipt contents as landed

`dispatch60-tip.txt` (4 lines; line 2 is HEAD's committed check-detail line, which my fresh run
reproduced exactly except for the probe's ephemeral `mkdtemp` token — `oGUwJa` in this seat's run vs
`L6n7ih` in the committed line — so HEAD's token is retained to keep the diff to the note alone):

```
DISPATCH60: DISPATCH60_UNMET held=8/10 checks=10 rev=a745a3b0e02253e722834ef95042d97ed92e5e53 rule=A60
 | A1 PASS bytes=12389 | A2 PASS exit=0 verdict=true | A3 PASS findings=6 | A4 PASS row-present | A5 PASS checklist-item | A6 PASS pin-match | A7 MISS row-absent | A8 PASS gate=true mistakes=true name=true | A9 PASS rows=20 prose=20 | A10 MISS exit=2 DISPATCH_EVIDENCE: FAIL-CLOSED wave-dir-absent dir=/tmp/a60-probe.L6n7ih/.ufo/waves/round-60/w1
exit=1
C1 after-state (10/10) is delivered by round 61 C1 — see .ufo/waves/round-61/plan.md
```

`doctrine60-tip.txt` (3 lines):

```
DOCTRINE60: DOCTRINE60_HELD held=6/6 checks=6 rev=a745a3b0e02253e722834ef95042d97ed92e5e53 rule=D60
 | F1 PASS fanout=true detect=true | F2 PASS rows=7 | F3 PASS used-by-exact | F4 PASS captures=7 | F5 PASS group=true exit=0 SOURCE_DUPES: CLEAN groups=6 known=6 | F6 PASS admit=true reject=true flips=2 collisions=S125+S127+S136
exit=0
```

## Verification actually run (all commands exercised, not inferred)

Runs are in scratch `/tmp/kumitate-r61/ExecTipReceipts/` (`dispatch.out`, `doctrine.out`,
`clone-dispatch.out`, `clone-doctrine.out`).

1. In-lane run at `a745a3b0…`:
   `node .ufo/waves/round-60/probe/dispatch60-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin a745a3b0e02253e722834ef95042d97ed92e5e53`
   → head line above, `EXIT=1`, empty stderr.
   `node .ufo/waves/round-60/probe/doctrine60-probe.mjs … a745a3b0…` → head line above, `EXIT=0`.
2. Independent sandbox clone (`git clone --no-checkout` of the lane at
   `/tmp/kumitate-r61/ExecTipReceipts/lane-clone`, read-only w.r.t. the lane), same two probes against
   the clone → `CLONE_DISPATCH_EXIT=1` with the same head line, `CLONE_DOCTRINE_EXIT=0` with the same
   head line. `diff` of each receipt's line 1 against the clone run: `MATCH_D`, `MATCH_C`.
3. `diff` of each receipt's line 1 against the in-lane run: `DISPATCH_HEAD_MATCH`, `DOCTRINE_HEAD_MATCH`.
4. Exit-code lines present: `dispatch60-tip.txt:3:exit=1`, `doctrine60-tip.txt:3:exit=0`.
   Diff shape: `git diff --numstat -- .ufo/waves/round-60/close/` → `1  0  .ufo/waves/round-60/close/dispatch60-tip.txt`; the doctrine receipt does not appear (unchanged).
5. Note present exactly once: `grep -cF 'C1 after-state (10/10) is delivered by round 61 C1 — see .ufo/waves/round-61/plan.md' dispatch60-tip.txt` → `1`.
6. Placeholders in `close/`: the three R60-V2 tokens (TIP / MEASURED / COMMITS in double-underscore
   form) were grepped across `.ufo/waves/round-60/close/` → no output, exit 1 (clean). Neither
   receipt contains any of them.

Note for the `RevTipReceipts` verifier: the `A10` detail field embeds the probe's own `mkdtemp`
directory (`/tmp/a60-probe.XXXXXX/...`), which differs on every run by construction. Compare the
**head line** (byte-stable, matches above) and the exit code; a full-file `diff` against a fresh run
can never match that one token.

## Risks / out-of-scope observations

- **SCORECARD still carries two unfilled placeholders** in the round-60 sections:
  `SCORECARD.md:2833` and `SCORECARD.md:2847` both contain the unfilled MEASURED token (the
  double-underscore placeholder form). Outside this seat's write scope (SCORECARD is owned by
  C1/integration). Substantively: line 2833 claims “at the measured revision <token> →
  `DISPATCH60_HELD held=10/10 checks=10`”, which is **not true at `a745a3b0…`** (8/10) and cannot be
  true at any round-60 revision — A10 needs the committed `.ufo/waves/round-60/w1/` record, which does
  not exist. The honest fill is 8/10 at `a745a3b0…` plus the round-61 pointer, exactly as this
  receipt states.
- The receipt deliberately keeps the probe's full check-detail line so the two MISSes are auditable;
  that line is the only non-deterministic token in the file.
- No tool installs or upgrades were made this seat; no pacman transactions were attempted.

# CritControlC1EmptyCommitted — C1 subcase 5, committed zero-byte files

Seat: `L1Kumitate62.CritControlC1EmptyCommitted` (critic, w2, round 62).
Scope: reproduce only the named subcase of round-61 C1 — committed zero-byte seat reports
(A5 split) — in scratch, from the committed control receipts. Read-only on the lane;
no lane file touched except this report.
Lane root: `/home/vgpnk/Projects/shokunin/kumitate-shokunin`.
Host: 2026-10-25T10:30:07-03:00.

## 0. Named case and pinned artifacts

Subcase 5 of the C1 attack enumerations: **committed zero-byte files** — the measured
revision `rev` holds 32 `<seat>.md` files that are all empty and carries no tip receipt,
while the non-empty reports and the tip exist only in the working tree. This is the
round-61 `A5` attack, receipt `round-61/controls/ctl-c1-critic-a5-commit-worktree-split.txt`.

Artifacts (all byte-identical to the lane pins):

- gate `scripts/dispatch-evidence.mjs`, sha256 `765a7aa3ef6b11f18548da4a91f98c42e07b825229135c30010f092cc1af65cc` (same as `SCORECARD.md` pin and the A5 receipt).
- probe `.ufo/waves/round-61/probe/dispatch61-probe.mjs`, sha256 `02028d11b9b05d952df421b030be919e2af1bf77101d302c06a8b0a718c9a89f` — byte-identical to round-62's `probe/dispatch61-probe.mjs` (same frozen P61).

## 1. Reproduction (scratch only)

Fixture rebuilt from the committed receipts (A1/A1b/A4/A5 shapes) at
`/tmp/kumitate-r62/CritControlC1EmptyCommitted/a5-commit-worktree-split` (scratch git repo;
lane git index untouched):

- copy of the pinned gate at `scripts/dispatch-evidence.mjs`;
- `SCORECARD.md` with a `## Capabilities` row naming round 61 (verbatim receipt row);
- `.ufo/waves/round-61/w1/launcher-progress.tsv`: 32 rows, fabricated
  `session=L1Kumitate61.SeatNN`, `exit=0`, `pid=1`;
- `.ufo/waves/round-61/w1/dispatch-actual.json`: hand-written, self-consistent
  (`planned=32 sessionIds=32 exit0=32 reports=32 dead=[]`, 32 members, every `agentId`
  non-null);
- 32 zero-byte `SeatNN.md` files **committed** at rev;
- after commit: the 32 `SeatNN.md` files overwritten in the worktree with one line each
  (uncommitted), and `close/dispatch61-tip.txt` created untracked holding the CLEAN line;
- zero seats ever ran; no dispatch record exists beyond these authored bytes.

Committed revision state (verified): `git ls-tree -r -l <rev>` lists 32 `.md` blobs, all
32 with size 0 (empty blob `e69de29…`), 0 non-empty; `launcher-progress.tsv` and
`dispatch-actual.json` present at rev; `git show <rev>:…/close/dispatch61-tip.txt` fails —
tip receipt ABSENT at rev. Worktree after commit: 32 modified (one-line) reports, 1
untracked tip (`git status --porcelain`: 32 `M`, 1 `??`).

## 2. Exact command / output / exit

Gate (worktree read), from scratch repo root:

```
$ node scripts/dispatch-evidence.mjs --root /tmp/kumitate-r62/CritControlC1EmptyCommitted/a5-commit-worktree-split --round 61 --wave w1
exit=0
--- stdout ---
DISPATCH_EVIDENCE: CLEAN (seats=32 sessions=32 exit0=32 reports=32 dead=0)
--- stderr ---
```

Probe (frozen round-61 probe, revision `2394f970236b47ad400b270374edebd372c674e0`):

```
$ node .ufo/waves/round-61/probe/dispatch61-probe.mjs /tmp/kumitate-r62/CritControlC1EmptyCommitted/a5-commit-worktree-split 2394f970236b47ad400b270374edebd372c674e0
exit=0
--- stdout ---
DISPATCH61: DISPATCH61_HELD held=4/4 checks=4 rev=2394f970236b47ad400b270374edebd372c674e0 rule=P61
 | P1 PASS DISPATCH_EVIDENCE_SELFTEST: PASS (8/8)
 | P2 PASS gate=0 clean=true reports=32
 | P3 PASS | `dispatch-evidence` | read a round's dispatch record | `node scripts/dispatch-evidence.mjs --selftest` -> PASS (8/8) | round 61 |
 | P4 PASS exists
--- stderr ---
```

Identical to committed receipt `ctl-c1-critic-a5-commit-worktree-split.txt` (rev
`ced3ece3…` there).

**Same-rev contrast (mechanism proof).** A clean clone of the scratch repo (worktree exactly
equal to `rev`: 32 zero-byte reports, no tip) run through the same probe, same rev:

```
$ node .ufo/waves/round-61/probe/dispatch61-probe.mjs /tmp/kumitate-r62/CritControlC1EmptyCommitted/a5-clean-clone 2394f970236b47ad400b270374edebd372c674e0
exit=1
--- stdout ---
DISPATCH61: DISPATCH61_UNMET held=2/4 checks=4 rev=2394f970236b47ad400b270374edebd372c674e0 rule=P61
 | P1 PASS DISPATCH_EVIDENCE_SELFTEST: PASS (8/8)
 | P2 MISS gate=1 clean=false reports=32
 | P3 PASS | `dispatch-evidence` | read a round's dispatch record | `node scripts/dispatch-evidence.mjs --selftest` -> PASS (8/8) | round 61 |
 | P4 MISS absent
--- stderr ---
```

Same measured revision yields HELD 4/4 (exit 0) or UNMET 2/4 (exit 1) depending only on
**uncommitted worktree bytes**. P1/P3 are rev-stable; P2 and P4 flip with the worktree.

## 3. Does this case independently falsify P61? — Yes

P61's frozen sentence requires the **committed revision** to carry `launcher-progress.tsv`,
`dispatch-actual.json`, and ≥32 **non-empty** `<seat>.md`, and P4's tip to exist **at the
measured revision**. Here the measured revision carries 32/32 zero-byte reports and no tip,
yet the counter prints DISPATCH61_HELD 4/4 exit 0. The claim "the committed revision carries
≥32 non-empty seat reports / tip exists at rev" is false while the predicate reads HELD —
that is an independent falsification of P61 as written.

Mechanism (source evidence):

- P2's rev arm is `git -C <lane> ls-tree -r --name-only <rev>` (`dispatch61-probe.mjs` lines
  17–21): names only — `--name-only` cannot carry a size, so rev-size non-emptiness is
  literally absent from the check. The only non-emptiness enforcement is the **worktree**,
  via the gate's `statSync(reportPath).size > 0` (`dispatch-evidence.mjs` line 120).
- P2's gate arm and P4 run against the worktree (`--root <lane>`; `readFileSync(lane/…/close/
  dispatch61-tip.txt)`, probe line 28). Hence the worktree — not `rev` — decides P2/P4.
- The clean-clone contrast in §2 shows the verdict flips for a fixed rev purely on worktree
  state, so the counter cannot attest to anything about `rev` beyond name presence.

This is distinct from the A4 fabrication-content hole: even a gate that rejected fabricated
*bytes* (fixing A4) would still read HELD at this revision, because at `rev` there are no
bytes to reject — the empty evidence is the committed state. Subcase 5 therefore falsifies
P61 on its own, independent of A1b/A4.

## 4. Impacted axes

- **operability** — the C1 capability acquisition cannot enter `## Capabilities` on this
  evidence: the frozen counter returns HELD on a revision carrying zero working evidence, and
  UNMET on its own clean clone. The dispatch-evidence claim stays unverifiable by this
  counter.
- **coverage** — untouched; no corpus effect.

## 5. Correction pointer (not proposed as a new claim)

Same family as the round-61 C1 report's "smallest safe correction": read P2/P4 bytes from
rev only (`git show <rev>:…` / `git archive <rev>` / `git ls-tree -l <rev>` sizes), and fail
closed when the worktree diverges from rev. This kills this subcase and A5 together.

Findings only; no verdict; no lane edits beyond this report. Scratch kept at
`/tmp/kumitate-r62/CritControlC1EmptyCommitted/` (fixture, gate/probe outputs, rev file).

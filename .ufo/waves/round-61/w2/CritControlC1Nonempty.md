# CritControlC1Nonempty — C1 subcase 1 (nonempty fake reports), reproduced and scoped

Seat: `CritControlC1Nonempty` (critic, wave w2, round 61). Scope: scratch only
(`/tmp/kumitate-r61/CritControlC1Nonempty/`); lane write limited to this report.

Target subcase, first in the assignment list: **nonempty fake reports** — wave-1
`w1/CritControlC1.md` attempt **A1b**, committed receipt
`controls/ctl-c1-critic-a1b-nonempty-fabrication.txt`.

Gate under test: `scripts/dispatch-evidence.mjs`, sha256
`765a7aa3ef6b11f18548da4a91f98c42e07b825229135c30010f092cc1af65cc` — re-measured this
wave and still byte-identical to the lane pin (`SCORECARD.md:329
pin.dispatch-evidence=`). Probe: `.ufo/waves/round-61/probe/dispatch61-probe.mjs`,
sha256 `02028d11b9b05d952df421b030be919e2af1bf77101d302c06a8b0a718c9a89f`.

## Reproduction of the committed case

Fixture rebuilt from scratch at `/tmp/kumitate-r61/CritControlC1Nonempty/a1b-nonempty-reports`
(committed shape: 32 one-line `<seat>.md` reports, hand-written `launcher-progress.tsv`
with 32 fabricated `L1Kumitate61.SeatNN` session ids, self-consistent `dispatch-actual.json`;
**no seat ever ran, no dispatcher ever wrote these files** — zero-seat fabrication).
Builder: `/tmp/kumitate-r61/CritControlC1Nonempty/build_a1b.py`.

Exact command, output, exit:

```
$ node scripts/dispatch-evidence.mjs --root /tmp/kumitate-r61/CritControlC1Nonempty/a1b-nonempty-reports --round 61 --wave w1
DISPATCH_EVIDENCE: CLEAN (seats=32 sessions=32 exit0=32 reports=32 dead=0)
exit=0
```

Byte-identical verdict to the committed receipt (`exit=0`, same summary line). Wave-1's
claim **reproduces**: the gate accepts a wholly fabricated wave whose only defense it
offers against forgery is `statSync(reportPath).size > 0` (`dispatch-evidence.mjs:120`).

Frontier walk — minimum barrier: 32 reports of **one byte each** (`printf 'x'`), same
progress + registry:

```
$ node scripts/dispatch-evidence.mjs --root /tmp/kumitate-r61/CritControlC1Nonempty/a1b-onebyte --round 61 --wave w1
DISPATCH_EVIDENCE: CLEAN (seats=32 sessions=32 exit0=32 reports=32 dead=0)
exit=0
```

The "non-empty report" requirement inside P2 is satisfied by 32 bytes total of content-free
output. `REPORT_ABSENT` is a file-size check; nothing in the gate binds report content to
a seat, a session, or a dispatcher.

## Does this case independently falsify P61?

Test: a scratch git repo holding the pinned gate copy plus **only** the committed
nonempty-fabrication wave dir — no SCORECARD row, no `close/dispatch61-tip.txt`
(`/tmp/kumitate-r61/CritControlC1Nonempty/p61_test.py`, repo `p61-nonempty-only`):

```
$ node .ufo/waves/round-61/probe/dispatch61-probe.mjs /tmp/kumitate-r61/CritControlC1Nonempty/p61-nonempty-only 41ccff02ee8dc668777e2591eaa579aae24e1def
DISPATCH61: DISPATCH61_UNMET held=2/4 checks=4 rev=41ccff02… rule=P61
 | P1 PASS DISPATCH_EVIDENCE_SELFTEST: PASS (8/8)
 | P2 PASS gate=0 clean=true reports=32
 | P3 MISS row-absent
 | P4 MISS absent
exit=1
```

**No — not alone.** This case defeats P2 outright (the only arm that claims to measure
the dispatch), but P61 reads HELD only at 4/4, and P3/P4 are separate lane-authored
artifacts. Strictly, the wave-1 report already owns that claim: A1b is cited as a *hole in
the gate*, and only A4 (this fabrication + SCORECARD row + tip receipt) is credited with
falsifying P61. This run is consistent with, and narrows, that verdict:

- **P2 falls to this case alone, at both arms.** `gate=0 clean=true` comes from fabricated
  bytes in the working tree; `reports=32` comes from `git ls-tree -r --name-only`
  (`dispatch61-probe.mjs:17-20`), which counts names and cannot see content at all — so the
  committed-revision arm adds nothing even to the file-size barrier.
- **P3 and P4 stand between this case and P61** only as text-existence checks, not as
  dispatch witnesses: P3 greps the SCORECARD row the claimant writes, P4 greps a tip file
  the claimant writes. The residual protection P61 retains over the bare gate is
  authorship of two more strings, not verification.
- So the correct falsification statement: *nonempty fake reports* independently falsifies
  **the gate's dispatch claim** (P2, the predicate's operative content); P61 as a whole is
  falsified by this case **plus** the two authorable artifacts — which is exactly wave-1's
  A4 composition. My run confirms both halves of that decomposition against the same
  pinned bytes.

## Impacted axes

- **operability** — wave-1's A1b verdict confirmed on the pinned artifact: the planned
  control shape (empty reports) tests a self-defeating fixture; the real attack shape
  (nonempty, down to 1 byte) reads CLEAN. No regression in wave-1's account found here.
- **Not a new hole**: adds one sharpening — the barrier is literally `size > 0`, and P2's
  rev arm is name-only, so *no* P61 arm inspects report bytes at any point.

## Smallest safe correction

Unchanged from wave-1 §Smallest-safe-correction: re-point P2 at the harness record
(`w1/swarm-registry.json` + `w1-dispatch.json`), bind the gate to the measured rev, and
replace the absence-shaped controls with the fabricated-content selftest case. This
reproduction narrows requirement 2: taking names from `git ls-tree` without `-l` (or
`git cat-file` sizes) leaves even the empty-report control unimplementable at rev arms.

## Evidence

- Fixture + builders: `/tmp/kumitate-r61/CritControlC1Nonempty/` (`build_a1b.py`,
  `p61_test.py`, `a1b-nonempty-reports/`, `a1b-onebyte/`, `p61-nonempty-only/`).
- Committed receipt reproduced: `controls/ctl-c1-critic-a1b-nonempty-fabrication.txt`.
- No subagents, no lane jj/git mutation, no `.ufo/state` writes, no tool installs;
  lane files touched: this report only.

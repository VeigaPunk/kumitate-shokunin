# CritControlC1P3Only — C1 subcase 4 (P3-only) reproduction, round 62 w2

Seat: `L1Kumitate62.CritControlC1P3Only` (critic, wave w2, round 62). Scope: reproduce only the named
subcase of `w1/CritControlC1.md` in scratch — **P3-only** — wave-1 attack **A3**, committed receipt
`controls/ctl-c1-critic-a3-p3-only.txt`. Round-62 claim plan is unfrozen; the predicate under test is the
inherited frozen round-61 `DISPATCH61_HELD` (P61 v1) as carried by round-62's probe copy
(`.ufo/waves/round-62/probe/dispatch61-probe.mjs`, sha256 `02028d11b9b05d952df421b030be919e2af1bf77101d302c06a8b0a718c9a89f` —
byte-identical to round-61's frozen probe; `diff` empty, verified).

## Verdict

**The committed A3 case reproduces exactly: `DISPATCH61_UNMET held=2/4 checks=4` exit 1**, on a fresh
scratch git repo whose only committed content is a byte-identical copy of the pinned gate
(`sha256 765a7aa3…` == `SCORECARD.md:329` pin) and a SCORECARD `## Capabilities` row naming round 61 —
no `.ufo/waves/round-61/w1` wave dir, no tip receipt. This matches the receipt's stdout line-for-line and
the wave-1 / round-61-w2 verdicts.

**Subcase 4 does NOT independently falsify P61.** P61 is a conjunction (P1∧P2∧P3∧P4; kill rule: any MISS
→ claim fails as declared, `plan.md:41-42,126`). With only P3 satisfied, P2 fails closed (`gate=2
clean=false reports=0`, wave-dir-absent) and P4 is absent; the probe exits 1. No configuration reachable
from the P3-only shape produces `DISPATCH61_HELD` — the subcase cannot yield a false green by itself, and
the UNMET it yields for a genuinely P3-only state is the correct verdict, not a false red.

The one new sub-finding (consistent with round-61 w2) stands and is re-demonstrated below: **P3's
acceptance is weaker than the frozen wording** — it is a bare line/substring test (`dispatch61-probe.mjs:24-25`:
`seg.split('\n').find(l=>l.includes('dispatch-evidence')&&l.includes('|'))` then `/round 61/.test(row)`,
where `seg` is everything after `## Capabilities`, i.e. the rest of the file). It accepts rows outside the
capabilities table and rows whose first-working round is not 61. Because P3 reads the committed, lane-authored
`SCORECARD.md`, this is a hardening defect in the check, not an independent falsifier of the predicate: both
counterexample probes still end `UNMET 2/4` exit 1 because P2/P4 fail closed.

## Reproduction — exact command/output/exit

Fixture build (fresh scratch repo; gate copy byte-identical to the lane pin):

```
$ mkdir -p /tmp/kumitate-r62/CritControlC1P3Only/p3-only/scripts
$ cp /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/dispatch-evidence.mjs /tmp/kumitate-r62/CritControlC1P3Only/p3-only/scripts/
$ sha256sum /tmp/kumitate-r62/CritControlC1P3Only/p3-only/scripts/dispatch-evidence.mjs
765a7aa3ef6b11f18548da4a91f98c42e07b825229135c30010f092cc1af65cc  (== SCORECARD.md:329 pin, == receipt gate sha)
$ git -C /tmp/kumitate-r62/CritControlC1P3Only/p3-only init -q
$ git -C /tmp/kumitate-r62/CritControlC1P3Only/p3-only -c user.name=control -c user.email=c@example.invalid add -A
$ git -C /tmp/kumitate-r62/CritControlC1P3Only/p3-only -c user.name=control -c user.email=c@example.invalid commit -qm fixture
$ git -C /tmp/kumitate-r62/CritControlC1P3Only/p3-only rev-parse HEAD
ab88a1b01323fa000048956d21127b6fb4b6e979
$ git -C /tmp/kumitate-r62/CritControlC1P3Only/p3-only ls-tree -r --name-only HEAD
SCORECARD.md
scripts/dispatch-evidence.mjs
```

Committed tree is exactly `scripts/dispatch-evidence.mjs` + `SCORECARD.md`; no `.ufo/` exists in the fixture
(`ls .ufo` → no such file). SCORECARD content:

```
# SCORECARD

## Capabilities

| Capability | What it can now do | Evidence pointer | First-working round |
|---|---|---|---|
| `dispatch-evidence` | read a round's dispatch record | `node scripts/dispatch-evidence.mjs --selftest` -> PASS (8/8) | round 61 |
```

Probe run (fresh fixture, fresh rev) — exit 1:

```
$ node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-61/probe/dispatch61-probe.mjs /tmp/kumitate-r62/CritControlC1P3Only/p3-only ab88a1b01323fa000048956d21127b6fb4b6e979
DISPATCH61: DISPATCH61_UNMET held=2/4 checks=4 rev=ab88a1b01323fa000048956d21127b6fb4b6e979 rule=P61
 | P1 PASS DISPATCH_EVIDENCE_SELFTEST: PASS (8/8)
 | P2 MISS gate=2 clean=false reports=0
 | P3 PASS | `dispatch-evidence` | read a round's dispatch record | `node scripts/dispatch-evidence.mjs --selftest` -> PASS (8/8) | round 61 |
 | P4 MISS absent
exit=1
```

(probe stderr empty; the receipt's `VERDICT: P2 still MISS — P3 alone cannot satisfy the predicate` stderr line
is written by the wave-1 control runner, not by the probe — the probe itself prints only stdout and the exit code.)

Arm-level receipts on the fresh fixture (what each check reads):

```
$ node scripts/dispatch-evidence.mjs --root . --round 61 --wave w1     # P2 gate arm
DISPATCH_EVIDENCE: FAIL-CLOSED wave-dir-absent dir=/tmp/kumitate-r62/CritControlC1P3Only/p3-only/.ufo/waves/round-61/w1
FINDING WAVE_DIR_ABSENT
DISPATCH_EVIDENCE: FAIL-CLOSED contract=kumitate-dispatch-evidence-v1
exit=2

$ node scripts/dispatch-evidence.mjs --selftest | tail -4              # P1 arm
FINDING REPORT_ABSENT
FINDING EXPECT_MISMATCH
DISPATCH_EVIDENCE_SELFTEST: PASS (8/8)
VERDICT: PASS
exit=0

$ git show ab88a1b01323fa000048956d21127b6fb4b6e979:SCORECARD.md               # P3 input at rev
# SCORECARD

## Capabilities

| Capability | What it can now do | Evidence pointer | First-working round |
|---|---|---|---|
| `dispatch-evidence` | read a round's dispatch record | `node scripts/dispatch-evidence.mjs --selftest` -> PASS (8/8) | round 61 |

$ git cat-file -e ab88a1b01323fa000048956d21127b6fb4b6e979:.ufo/waves/round-61/close/dispatch61-tip.txt  # P4 input at rev
(exit 128 — tip absent at rev)
```

## P3 over-accept — two counterexample probes (re-run, same verdicts)

Probe 1 — first-working round 60, "round 61" only as a passing mention in the evidence cell. P3 still PASS,
exit 1 (UNMET 2/4):

```
$ node …/probe/dispatch61-probe.mjs … <rev=6d169517a3f9612a189854863aeea9ba061e3b0b>
 | P3 PASS | `dispatch-evidence` | read a round's dispatch record | validated in round 61 rehearsal | round 60 |
```

Probe 2 — no `dispatch-evidence` row in the Capabilities table at all; a line containing `dispatch-evidence`
and `round 61` sits in the `## Axes` table (inside P3's scan range). P3 still PASS, exit 1:

```
$ node …/probe/dispatch61-probe.mjs … <rev=c5f4fe39a851feb5d7add39fc3973d374d28d648>
 | P3 PASS | operability | 9 | see `dispatch-evidence` | row | round 61 |
```

Both fixtures are commits in the same scratch repo; no other subcase was run — out of this seat's named scope.

## Why subcase 4 is not an independent falsifier

- No false green: HELD requires all four checks; P2 (gate exit 2, `clean=false`) and P4 (`absent`) fail closed
  from the P3-only shape. The probe exits 1. The round-61 honest state corroborates the same conjunction
  structure: even with an honest P2 (`gate=0 clean=true reports=32`), the landed record still reads UNMET 2/4
  (`close/a2-tip-dispatch61.txt` at `019a844c`).
- No false red: a state in which only P3 holds genuinely must fail P61; UNMET 2/4 is the declared behavior.
- P3's over-accept is real but bounded: it can only *add* a PASS inside an already-failing conjunction, so it
  never flips the aggregate verdict alone. It matters only in composition with P2/P4 (which the A4/A5
  subcases already cover). Per the assignment's independence question: P3-only does not independently falsify
  P61 — it is the *least* threatening subcase, as wave-1 stated.

## Impacted axes

- **operability (control design)** — unchanged for P61 as a whole (no new falsifier); P3 strictness is an
  additional, separately visible defect: the probe's P3 check is wider than the frozen wording
  (`plan.md:34-35`). The round-62 state adds nothing: the round-62 probe is byte-identical, `round-62/controls/`
  holds no C1 control, and `counter-pins.json` pins no round-61/62 target — the inherited predicate is the
  only attackable surface.

## Smallest safe correction

1. Tighten P3 in the probe to the frozen wording: parse the `## Capabilities` table only (stop at the next
   `##` heading or end-of-table), require the row's first cell to be `dispatch-evidence`, and require the
   evidence-pointer cell to carry the round-61 claim (consistent with the printed `First-working round`
   column). This kills both probes above.
2. This is independent of, and additive to, the wave-1/round-62 `CriticC1.md` §8 corrections (re-point P2/P4
   at rev bytes and the harness record; fail closed on worktree/rev divergence).

## Evidence pointers

- Receipt reproduced: `.ufo/waves/round-61/controls/ctl-c1-critic-a3-p3-only.txt` (wave-1, committed; host
  stamp 2026-10-25T06:43:03-03:00). stdout reproduced exactly; the receipt's fixture rev (`6bc66470`) is not
  re-runnable (round-61 scratch `/tmp/kumitate-r61/` was cleaned), so the same shape was rebuilt fresh.
- Frozen predicate: `.ufo/waves/round-61/plan.md:25-42,117-127` (P1-P4, counting command, kill rule).
- Probe source: `.ufo/waves/round-61/probe/dispatch61-probe.mjs` = `.ufo/waves/round-62/probe/dispatch61-probe.mjs`
  (sha256 `02028d11b9b05d952df421b030be919e2af1bf77101d302c06a8b0a718c9a89f`; `diff` empty).
- Gate pin: `SCORECARD.md:329` `pin.dispatch-evidence=765a7aa3…`; fixture gate sha identical.
- Round-62 context: `.ufo/waves/round-62/w2/CriticC1.md` §0-1 (unfrozen plan, byte-identical probes, no C1
  control in round-62 `controls/`); `close/a2-tip-dispatch61.txt` (honest landed state reads UNMET 2/4).
- Scratch: `/tmp/kumitate-r62/CritControlC1P3Only/` — `p3-only/` git repo with commits `ab88a1b` (fixture,
  reproduced shape), `6d169517` (probe 1), `c5f4fe3` (probe 2); run captures `run-fresh.out`, `run-fresh.err`,
  `selftest.out`, `captures.txt`. No lane files touched besides this report; no subagents; no tool installs.

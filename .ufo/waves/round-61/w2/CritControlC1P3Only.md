# CritControlC1P3Only — C1 subcase 4 (P3-only) reproduction

Seat: `L1Kumitate61.CritControlC1P3Only` (critic, w2, round 61). Scope: scratch only
(`/tmp/kumitate-r61/CritControlC1P3Only/`); no lane production files touched.

## Verdict

**The committed A3 case reproduces byte-for-byte: `DISPATCH61_UNMET held=2/4 checks=4`
exit 1, on a scratch git repo whose only committed content is a byte-identical copy of the
pinned gate and a SCORECARD row naming round 61 — no `.ufo/waves/round-61/w1` wave dir, no
tip receipt. It does NOT independently falsify P61**: P61 is a conjunction (all four checks
must pass; kill rule: any MISS → claim fails as declared, `plan.md:41-42`), and with only
P3 satisfied, P2 and P4 stay MISS and the probe exits 1. This matches the wave-1 verdict
("P3 alone cannot carry the predicate").

The one new sub-finding in this subcase: **P3 itself is weaker than the predicate's wording**
and accepts rows the plan's sentence forbids (two counterexample probes below). P3-only is
therefore the *least* threatening attack, exactly as wave-1 stated — but for a new reason:
P3's acceptance check is a bare substring test that does not enforce table membership or the
"first-working round 61" claim, so an attacker (who authors the SCORECARD) can make P3 pass
while visibly violating P61's P3 wording.

## Reproduction — exact commands and outputs

Fixture build (fresh scratch repo; gate copy byte-identical to the lane pin):

```
$ cp /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/dispatch-evidence.mjs /tmp/kumitate-r61/CritControlC1P3Only/p3-only/scripts/
$ cp /tmp/kumitate-r61/CritControlC1/a3-p3-only/SCORECARD.md /tmp/kumitate-r61/CritControlC1P3Only/p3-only/
$ git -C /tmp/kumitate-r61/CritControlC1P3Only/p3-only init -q
$ git -C /tmp/kumitate-r61/CritControlC1P3Only/p3-only -c user.name=control -c user.email=c@example.invalid add -A
$ git -C /tmp/kumitate-r61/CritControlC1P3Only/p3-only -c user.name=control -c user.email=c@example.invalid commit -qm fixture
$ git -C /tmp/kumitate-r61/CritControlC1P3Only/p3-only rev-parse HEAD
4e711e298e8b9d436ef3eb54e259336e8dde2626
$ sha256sum …/p3-only/scripts/dispatch-evidence.mjs
765a7aa3ef6b11f18548da4a91f98c42e07b825229135c30010f092cc1af65cc  (== SCORECARD.md:329 pin, == wave-1 receipt's gate sha)
```

No `.ufo/` exists in the fixture (verified: `ls .ufo` → no such file). Committed tree is
exactly `scripts/dispatch-evidence.mjs` + `SCORECARD.md`.

Probe run (fresh fixture, new rev) — exit 1:

```
$ node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-61/probe/dispatch61-probe.mjs /tmp/kumitate-r61/CritControlC1P3Only/p3-only 4e711e298e8b9d436ef3eb54e259336e8dde2626
DISPATCH61: DISPATCH61_UNMET held=2/4 checks=4 rev=4e711e298e8b9d436ef3eb54e259336e8dde2626 rule=P61
 | P1 PASS DISPATCH_EVIDENCE_SELFTEST: PASS (8/8)
 | P2 MISS gate=2 clean=false reports=0
 | P3 PASS | `dispatch-evidence` | read a round's dispatch record | `node scripts/dispatch-evidence.mjs --selftest` -> PASS (8/8) | round 61 |
 | P4 MISS absent
exit=1
```

Cross-check against the wave-1 receipt's own fixture at the receipt's rev — identical, exit
1:

```
$ node …/probe/dispatch61-probe.mjs /tmp/kumitate-r61/CritControlC1/a3-p3-only 6bc66470a7cd9b8336603e48b19fd9b1455fa664
DISPATCH61: DISPATCH61_UNMET held=2/4 checks=4 rev=6bc66470a7cd9b8336603e48b19fd9b1455fa664 rule=P61
 | P1 PASS DISPATCH_EVIDENCE_SELFTEST: PASS (8/8)
 | P2 MISS gate=2 clean=false reports=0
 | P3 PASS | `dispatch-evidence` | read a round's dispatch record | `node scripts/dispatch-evidence.mjs --selftest` -> PASS (8/8) | round 61 |
 | P4 MISS absent
exit=1
```

Arm-level receipts on the fresh fixture (what each check reads):

```
$ node scripts/dispatch-evidence.mjs --root . --round 61 --wave w1     # P2 gate arm
DISPATCH_EVIDENCE: FAIL-CLOSED wave-dir-absent dir=/tmp/kumitate-r61/CritControlC1P3Only/p3-only/.ufo/waves/round-61/w1
FINDING WAVE_DIR_ABSENT
DISPATCH_EVIDENCE: FAIL-CLOSED contract=kumitate-dispatch-evidence-v1
exit=2

$ node scripts/dispatch-evidence.mjs --selftest | tail -3              # P1 arm
FINDING EXPECT_MISMATCH
DISPATCH_EVIDENCE_SELFTEST: PASS (8/8)
VERDICT: PASS
exit=0

$ git show 4e711e29…:SCORECARD.md | sed -n '3,8p'                      # P3 input at rev
## Capabilities
| Capability | What it can now do | Evidence pointer | First-working round |
|---|---|---|---|
| `dispatch-evidence` | read a round's dispatch record | `node scripts/dispatch-evidence.mjs --selftest` -> PASS (8/8) | round 61 |

$ ls .ufo/waves/round-61/close/dispatch61-tip.txt                        # P4 input
ls: cannot access '.ufo/waves/round-61/close/dispatch61-tip.txt': No such file or directory
```

## New sub-finding: P3 over-accepts (two counterexample probes)

Frozen wording (`plan.md:34-35`): "P3 — the SCORECARD **capabilities table** has a
`dispatch-evidence` row whose **evidence pointer** names round 61 (first-working round 61)."
Probe implementation (`dispatch61-probe.mjs:24-25`): `seg.split('\n').find(l=>l.includes('dispatch-evidence')&&l.includes('|'))` then `/round 61/.test(row)` — a *line* test, not a table/cell test (`seg` is everything after `## Capabilities`, i.e. the rest of the file).

Probe 1 — first-working round 60, "round 61" only as a passing mention in the evidence cell.
P3 still PASS (exit 1, UNMET 2/4):

```
$ node …/probe/dispatch61-probe.mjs … <rev=eb985aa20d62e4f7bd5fc9e1e50e92a1ade376fa>
 | P3 PASS | `dispatch-evidence` | read a round's dispatch record | validated in round 61 rehearsal | round 60 |
```

Probe 2 — no `dispatch-evidence` row in the Capabilities table at all; a line containing
`dispatch-evidence` and `round 61` sits in the `## Axes` table. P3 still PASS:

```
$ node …/probe/dispatch61-probe.mjs … <rev=56bd24f355cd42448847b957ddc2c5e047ad1327>
 | P3 PASS | operability | 9 | see `dispatch-evidence` | row | round 61 |
```

So P3 accepts (a) rows outside the capabilities table and (b) rows whose first-working round
is not 61. Because P3 reads the committed `SCORECARD.md` at the rev and the scorecard is
lane-authored text, P3 is always satisfiable by whoever writes it — it confirms nothing, in
the same class as the wave-1 statement "the row is text, so P3 is always satisfiable".

## Impacted axes

- **operability (control design)** — unchanged from wave-1 for P61 as a whole (P3-only does
  not falsify P61), but P3 strictness is an additional, separately visible defect: the probe
  check is wider than the frozen wording. P3 cannot independently read HELD because P61 is a
  conjunction and P2/P4 fail closed, so this is a hardening fix, not a new falsifier.

## Smallest safe correction

1. Tighten P3 in `dispatch61-probe.mjs` to the wording: parse the `## Capabilities` table
   only (stop at the next `##` heading or end-of-table), require the row's first cell to be
   `dispatch-evidence`, and require the *evidence-pointer* cell to carry the round-61 claim
   (matching the printed `First-working round` column). This kills both probes above.
2. This is independent of, and additive to, wave-1's correction (re-point P2 at the harness
   record `w1/swarm-registry.json`/`w1-dispatch.json`; bind the gate to the measured rev).

## Evidence pointers

- Receipt reproduced: `.ufo/waves/round-61/controls/ctl-c1-critic-a3-p3-only.txt`
  (wave-1, committed; host stamp 2026-10-25T06:43:03-03:00).
- Frozen predicate: `.ufo/waves/round-61/plan.md:25-42` (P1-P4, counting command, kill rule).
- Probe source: `.ufo/waves/round-61/probe/dispatch61-probe.mjs` (sha256
  `02028d11b9b05d952df421b030be919e2af1bf77101d302c06a8b0a718c9a89f`).
- Gate pin: `SCORECARD.md:329` `pin.dispatch-evidence=765a7aa3…`; fixture gate sha identical.
- Scratch: `/tmp/kumitate-r61/CritControlC1P3Only/` — `p3-only/` git repo with commits
  `4e711e2` (fixture, reproduced shape), `eb985aa` (v2 probe), `56bd24f` (v3 probe);
  run captures `run-fresh.txt`, `run-receipt-fixture.txt`, `run-eb985aa…txt`,
  `run-v3-outside-table.txt`. No lane files touched; no subagents; no tool installs.

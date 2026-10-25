# CritControlC1ZeroSeats — C1 subcase 2: zero-seat registry → **independently falsifies P61**

Seat: `CritControlC1ZeroSeats` (critic, wave w2, round 61). Scope: scratch-only attack on the one
named subcase of `w1/CritControlC1.md` — the fabrication where **no seat ever ran**. Lane writes:
this report only. Scratch: `/tmp/kumitate-r61/CritControlC1ZeroSeats/` (`build_zero_seats.py`,
fixture repo `zero-seats/`). No lane files touched, no installs, no subagents.

## Named case

Wave-1 §"Strongest counterexample — A4" / receipt `controls/ctl-c1-critic-a4-full-fabrication.txt`:
the C1 predicate `DISPATCH61_HELD` is reachable on a scratch lane where **zero seats dispatched** —
the only "dispatch record" is one the attacker hand-writes (`launcher-progress.tsv` +
`dispatch-actual.json`), made internally self-consistent, plus 32 one-line seat reports, a
SCORECARD row, and a tip receipt holding the CLEAN line. Gate attacked: `scripts/dispatch-evidence.mjs`
sha256 `765a7aa3ef6b11f18548da4a91f98c42e07b825229135c30010f092cc1af65cc` — byte-identical to
`SCORECARD.md:329 pin.dispatch-evidence=` (verified again 2026-10-25, same hash on the fixture copy).

## Reproduction — exact command / output / exit

Fixture `/tmp/kumitate-r61/CritControlC1ZeroSeats/zero-seats` (scratch git repo, built by
`build_zero_seats.py`, identical recipe to wave-1 `mk_repo(with_wave=True, with_close=True)`):
pinned gate copy, `SCORECARD.md` `dispatch-evidence` row naming round 61, 32 fabricated non-empty
`<Seat>.md`, hand-written `launcher-progress.tsv` (invented `Seat%02d`/`session=L1Kumitate61.Seat%02d`
ids), hand-written `dispatch-actual.json` (`sessionIds:32`, all-non-null fabricated `agentId`s),
`close/dispatch61-tip.txt` holding the CLEAN line. Committed, `rev=fd3b8082755125eca798c758a351b29e617c962d`.

```
$ node .ufo/waves/round-61/probe/dispatch61-probe.mjs /tmp/kumitate-r61/CritControlC1ZeroSeats/zero-seats fd3b8082755125eca798c758a351b29e617c962d
DISPATCH61: DISPATCH61_HELD held=4/4 checks=4 rev=fd3b8082755125eca798c758a351b29e617c962d rule=P61
 | P1 PASS DISPATCH_EVIDENCE_SELFTEST: PASS (8/8)
 | P2 PASS gate=0 clean=true reports=32
 | P3 PASS | `dispatch-evidence` | read a round's dispatch record | `node scripts/dispatch-evidence.mjs --selftest` -> PASS (8/8) | round 61 |
 | P4 PASS exists
exit=0
```

```
$ node scripts/dispatch-evidence.mjs --root /tmp/kumitate-r61/CritControlC1ZeroSeats/zero-seats --round 61 --wave w1
DISPATCH_EVIDENCE: CLEAN (seats=32 sessions=32 exit0=32 reports=32 dead=0)
exit=0
```

Committed-receipt fidelity re-verified on the wave-1 fixture (still on disk): same probe, same rev:

```
$ node .ufo/waves/round-61/probe/dispatch61-probe.mjs /tmp/kumitate-r61/CritControlC1/a4-full-fabrication ab902da2fa30d051455a5f3563627e2c23c3a74d
DISPATCH61: DISPATCH61_HELD held=4/4 checks=4 rev=ab902da2fa30d051455a5f3563627e2c23c3a74d rule=P61
 | P1 PASS DISPATCH_EVIDENCE_SELFTEST: PASS (8/8)
 | P2 PASS gate=0 clean=true reports=32
 | P3 PASS | `dispatch-evidence` | read a round's dispatch record | `node scripts/dispatch-evidence.mjs --selftest` -> PASS (8/8) | round 61 |
 | P4 PASS exists
exit=0
```

## Does this case independently falsify P61? — Yes

P61 is the frozen predicate for operability axis C1, "capability acquisition `dispatch-evidence`":
the capability *demonstrated* on this round's dispatch record, judged by a gate that reads "the
round's ACTUAL dispatch record — the launcher progress file the dispatcher wrote seat by seat"
(`dispatch-evidence.mjs` docstring). In this case the registry/progress pair that P2 certifies is
authored by the claimer, not the dispatcher, and records a dispatch that never happened (32
invented seats, invented session ids). `HELD` therefore carries zero evidence that the capability
operated on anything real: the predicate's four checks pass on a universe containing no dispatch
at all. The falsification is independent of every other wave-1 defect — no commit/worktree split
(A5), reports are non-empty (≠ A1), all ids non-null (≠ A2/A2c), all four P-arms pass including P3/P4
(≠ A3). Remove every other hole and this one still stands: **P2 binds two lane-authored documents
to each other and calls their agreement a dispatch.**

The gate's own selftest even encodes the inverse: `NOT_A_DISPATCH` fires only when *every* member's
`agentId` is absent — a prepared-spec shape. The fabrication shape (full registry, full invented
ids) is the exact inverse and reads CLEAN, so the gate distinguishes "spec with no ids" from
"everything else", not "record the dispatcher wrote" from "record the lane wrote".

## Corroboration from the live lane (read-only, uncommitted-window)

The wave-1 report predicted the live `w1/launcher-progress.tsv` could only ever be authored after
the fact; it now exists — `w1/launcher-progress.tsv` and `w1/dispatch-actual.json` both stamped
2026-10-25 08:02, written **after** wave-1's receipt showed `FAIL-CLOSED progress-absent` (06:43),
while the real harness records `w1-dispatch.json` (`ufo-swarm-wave-dispatch-v1`, `spawn:32`) and
`w1/swarm-registry.json` (`ufo-swarm-registry-v1`, 32 dict members, `agentId=L1Kumitate61.<Seat>`,
06:41) predate it and are never read by the gate. The lane-authored `launcher-progress.tsv` rows
(`ExecTipReceipts  session=L1Kumitate61.ExecTipReceipts  exit=0  pid=-  start=-  end=-`) carry the
harness namespace, not dispatcher session ids — the same self-declaration the fabrication exploits.
Live run today: `node scripts/dispatch-evidence.mjs --root . --round 61 --wave w1` →
`DISPATCH_EVIDENCE: CLEAN (seats=32 sessions=32 exit0=32 reports=32 dead=0)` exit 0. So the very
record P61 certifies is demonstrably manufacturable post-hoc by the lane; the scratch fixture is
the minimal version of that act, not a hypothetical.

## Impacted axes

- **operability** — the C1 capability row cannot enter `## Capabilities` on this predicate:
  a demonstration satisfiable end-to-end by fabrication is not a demonstration (round-60 spot-check
  precedent, `corpus/lessons/round-60-verifier-spotcheck.md`). Integer score unaffected; the
  repertoire claim is what fails.
- **false provenance / duplicate authority** — four encodings of "32 seats" exist; the gate reads
  only the two weakest (lane-authored) ones and never binds them to the harness registry's
  `agentId` namespace or the validator payload's `counts.spawn`. No identity is checked across
  authorities.
- coverage axes — untouched.

## Smallest safe correction

Rebind P2 to the records the claimer cannot author: require `w1-dispatch.json`
(`ufo-swarm-wave-dispatch-v1`) and `w1/swarm-registry.json` (`ufo-swarm-registry-v1`) at the
measured rev (`git show <rev>:…`), assert `counts.spawn == |members| == 32`, every `agentId`
non-null, member-name set equal to the payload's task names, and — if a progress/summary pair is
kept — derive it in the same command from the registry, carrying `agentId` verbatim. Then a
zero-seat fabrication must forge the validator payload and the harness registry (already the
`wave-census` authority) instead of two private text files. This is a fixable binding defect, not
a measurement-limit tradeoff, so it belongs to the canonical judge's reject path rather than
acceptance.

## Verdict

`DISPATCH61_HELD held=4/4 exit=0` reproduced from scratch on a lane where no seat ever ran —
committed receipt `ctl-c1-critic-a4-full-fabrication.txt` confirmed verbatim (exit 0, 4/4) on the
original fixture at `ab902da2`. The zero-seat registry case **independently falsifies P61**.

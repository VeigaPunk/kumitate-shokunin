# CritControlC1ZeroSeats — round-62 C1 subcase 2: zero-seat registry → **independently falsifies P61**

Seat: `L1Kumitate62.CritControlC1ZeroSeats` (critic, wave w2, round 62). Scope: reproduce
only the named subcase of `w1/CritControlC1.md` in scratch, using the already committed control
receipts; lane writes limited to this report. Scratch: `/tmp/kumitate-r62/CritControlC1ZeroSeats/`
(`build_zero_seats.py`, fixture repo `zero-seats/`). No lane files touched besides this report;
no tool installs; no subagents.

## Named case

Subcase 2 of the C1 attack list = **zero-seat registry** — wave-1 §"Strongest counterexample —
A4 (full fabrication)", committed receipt `controls/ctl-c1-critic-a4-full-fabrication.txt`.
The claim: `DISPATCH61_HELD` (P61, v1) is reachable on a scratch lane where **zero seats ever
ran** — the only "dispatch record" is a pair of hand-written, internally self-consistent files
(`launcher-progress.tsv` + `dispatch-actual.json`) plus 32 one-line fabricated seat reports, a
SCORECARD row naming round 61, and a tip receipt holding the CLEAN line.

Gate attacked: `scripts/dispatch-evidence.mjs`, sha256
`765a7aa3ef6b11f18548da4a91f98c42e07b825229135c30010f092cc1af65cc` — byte-identical to the
lane's pin (`SCORECARD.md:329 pin.dispatch-evidence=`); the fixture carries a copy with the same
hash (verified).
Probe: `.ufo/waves/round-61/probe/dispatch61-probe.mjs` (frozen round-61 probe, sha256
`02028d11b9b05d952df421b030be919e2af1bf77101d302c06a8b0a718c9a89f`; round-62 copy is
byte-identical per CriticC1 §1).

## Reproduction — exact command / output / exit

Fixture `/tmp/kumitate-r62/CritControlC1ZeroSeats/zero-seats` (scratch git repo, built fresh by
`build_zero_seats.py` with the receipt's recipe): pinned gate copy, `SCORECARD.md` with a
`dispatch-evidence` row naming round 61, 32 non-empty one-line `<SeatNN>.md`, hand-written
`launcher-progress.tsv` (invented `Seat01..Seat32` / `session=L1Kumitate61.SeatNN` ids,
`pid=- start=- end=-`), hand-written `dispatch-actual.json` (`planned=32 sessionIds=32 exit0=32
reports=32 dead=[]`, 32 members all with non-null fabricated `agentId`), and
`close/dispatch61-tip.txt` holding the CLEAN line. All committed; `rev=81685b3f59fcdd8ce509e55e8fd991ba137e66cd`.
The fixture contains **no** harness dispatch record: no `w1/swarm-registry.json`, no
`w1-dispatch.json`, no launcher log, no `.stream.jsonl` (tree verified with `git ls-tree`).

Gate (run from lane root, as in the receipt):

```
$ node scripts/dispatch-evidence.mjs --root /tmp/kumitate-r62/CritControlC1ZeroSeats/zero-seats --round 61 --wave w1
DISPATCH_EVIDENCE: CLEAN (seats=32 sessions=32 exit0=32 reports=32 dead=0)
exit=0
```

Probe (exact command/output/exit):

```
$ node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-61/probe/dispatch61-probe.mjs /tmp/kumitate-r62/CritControlC1ZeroSeats/zero-seats 81685b3f59fcdd8ce509e55e8fd991ba137e66cd
DISPATCH61: DISPATCH61_HELD held=4/4 checks=4 rev=81685b3f59fcdd8ce509e55e8fd991ba137e66cd rule=P61
 | P1 PASS DISPATCH_EVIDENCE_SELFTEST: PASS (8/8)
 | P2 PASS gate=0 clean=true reports=32
 | P3 PASS | `dispatch-evidence` | read a round's dispatch record | `node scripts/dispatch-evidence.mjs --selftest` -> PASS (8/8) | round 61 |
 | P4 PASS exists
exit=0
```

This matches the committed receipt `ctl-c1-critic-a4-full-fabrication.txt` verbatim in shape and
verdict (its original fixture at `ab902da2…` reads the same 4/4 HELD exit 0). The reproduction is
independent of the round-61 scratch: fresh fixture, fresh commit, same frozen probe and pinned gate.

## Does this case independently falsify P61? — Yes

P61 is the frozen operability predicate "capability acquisition `dispatch-evidence`",
`DISPATCH61_HELD` = P1∧P2∧P3∧P4. In this reproduction all four arms pass on a universe containing
**no dispatch**: no seat ran, no dispatcher emitted anything, and every substantive input the gate
and probe read (`launcher-progress.tsv`, `dispatch-actual.json`, the 32 reports, the SCORECARD row,
the tip receipt) was written by the same author who claims the capability. `HELD` therefore certifies
agreement among lane-authored documents, not that the capability operated on a real dispatch record.

Independence from every other wave-1 C1 defect (each excluded from this fixture):
- ≠ A5 (commit/worktree split): everything is committed at the measured rev; P2's rev arm and P4
  read the same committed state. Worktree = rev (verified: no uncommitted files).
- ≠ A1 (empty reports): all 32 reports are non-empty (size > 0), so the `statSync…size > 0` check
  is satisfied.
- ≠ A2/A2c (null/mixed ids): all 32 `agentId`s and all 32 progress `session=` tokens are non-null;
  `NOT_A_DISPATCH` (the `members.every(m => !m.agentId || m.agentId==='null')` all-absent test,
  `dispatch-evidence.mjs:134`) does not fire.
- ≠ A3 (P3-only): all four arms pass, including P2's CLEAN gate run and P4's tip receipt.

Remove every other hole and this one still stands: **P2 binds two lane-authored documents to each
other and credits their agreement as a dispatch.** The predicate cannot distinguish "the dispatcher
wrote 32 seats" from "the claimer wrote 32 lines about seats that never ran". The gate's own
docstring asserts `launcher-progress.tsv` is "the launcher progress file the dispatcher wrote seat by
seat" — nothing in the contract establishes that provenance, and the round-61 live record shows the
same file is lane-authored after the fact (`w1/launcher-progress.tsv` stamped 08:02, after wave-1's
`FAIL-CLOSED progress-absent` receipt at 06:43, while the harness `w1-dispatch.json` /
`w1/swarm-registry.json` at 06:41 predate it and are never read by the gate).

## Impacted axes

- **operability** — the C1 capability acquisition cannot stand on this predicate: a demonstration
  satisfiable end-to-end by zero-seat fabrication is not a demonstration (round-60 spot-check
  precedent, `corpus/lessons/round-60-verifier-spotcheck.md`). Integer score unchanged; the
  repertoire claim is what fails.
- **false provenance / duplicate authority** — "32 seats dispatched" is encoded four ways (validator
  payload `w1-dispatch.json`, harness `w1/swarm-registry.json`, lane-typed `launcher-progress.tsv`,
  hand summary `dispatch-actual.json`); the gate reads only the two weakest, lane-authored ones and
  binds neither to the harness `agentId` namespace nor to the payload's `counts.spawn`.
- coverage axes — untouched (this seat's named case is C1/operability).

## Smallest safe correction

Rebind P2 to records the claimer cannot author: require `w1-dispatch.json`
(`ufo-swarm-wave-dispatch-v1`) and `w1/swarm-registry.json` (`ufo-swarm-registry-v1`) at the
measured rev (`git show <rev>:…`), assert `counts.spawn == |members| == 32`, every `agentId`
non-null, and member-name set equal to the payload's task names; if a progress/summary pair is kept,
derive it in the same command from the registry carrying `agentId` verbatim. Then a zero-seat
fabrication must forge the validator payload and the harness registry (already the `wave-census`
authority) instead of two private text files. This is a fixable binding defect, not a
measurement-limit tradeoff — the canonical judge's reject path, not acceptance. (No new claim or
verdict is proposed; this is the inherited round-61 correction, re-confirmed.)

## Discipline / evidence notes

- No lane files modified except this report; no git/jj mutation in the lane; no `.ufo/state`
  writes; no installs (node v24.21.0, git 2.56.0 pre-existing; lane tip `0cbe0d7`).
- The scratch fixture is disposable under `/tmp/kumitate-r62/CritControlC1ZeroSeats/`.

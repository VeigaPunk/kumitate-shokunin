# CritControlC1Nonempty — C1 subcase 1: nonempty fake reports

Seat: `L1Kumitate62.CritControlC1Nonempty` (critic, wave w2, round 62). Scope: scratch
only; lane writes limited to this report. No subagents, no lane jj/git mutation, no
`.ufo/state` write, no tool installs.

Attacked: round-61 frozen predicate `DISPATCH61_HELD` (P61 v1, checks P1..P4, plan.md:25-37)
via the pinned gate `scripts/dispatch-evidence.mjs`, sha256
`765a7aa3ef6b11f18548da4a91f98c42e07b825229135c30010f092cc1af65cc` — byte-identical to the
lane's own pin (`SCORECARD.md:329 pin.dispatch-evidence=`), so every reproduction below runs
the pinned artifact.

## Reproduction (scratch)

### 1. Gate-only control — canonical A1b shape (committed receipt `controls/ctl-c1-critic-a1b-nonempty-fabrication.txt`)

Fixture `/tmp/kumitate-r62/CritControlC1Nonempty/a1b-nonempty-reports/`:

- `.ufo/waves/round-61/w1/launcher-progress.tsv` — 32 rows `Seat01..Seat32`, fabricated
  `session=<uuid>`, `exit=0` (no launcher ever wrote them).
- `.ufo/waves/round-61/w1/dispatch-actual.json` —
  `{"members":[{"agentId":"L1Kumitate61.SeatNN"}×32],"planned":32,"sessionIds":32,"exit0":32,"reports":32,"dead":[]}`.
- `.ufo/waves/round-61/w1/SeatNN.md` — 32 one-line non-empty files (no real seat wrote them).

Command (from `kumitate-shokunin` root):

```
$ node scripts/dispatch-evidence.mjs --root /tmp/kumitate-r62/CritControlC1Nonempty/a1b-nonempty-reports --round 61 --wave w1
exit=0
--- stdout ---
DISPATCH_EVIDENCE: CLEAN (seats=32 sessions=32 exit0=32 reports=32 dead=0)
--- stderr ---
```

Identical to the committed receipt. The gate's only materiality check on reports is
`statSync(reportPath).size > 0` (`dispatch-evidence.mjs:120`) — a file-size test, not a
provenance or identity test. One line of text per file is the whole barrier.

### 2. Frozen P61 probe on the same fabricated wave (full-predicate demonstration)

Scratch git repo `/tmp/kumitate-r62/CritControlC1Nonempty/full-held/` holding: a copy of the
pinned gate (`sha256` `765a7aa3…` verified), the same fabricated wave committed, a
`SCORECARD.md` with a `dispatch-evidence` row naming round 61, and
`.ufo/waves/round-61/close/dispatch61-tip.txt` containing the CLEAN line. Zero seats ever
ran; no dispatcher record exists.

```
$ node .ufo/waves/round-61/probe/dispatch61-probe.mjs /tmp/kumitate-r62/CritControlC1Nonempty/full-held 622412341d5b1aeaf476d3a6f6df583f21087c7e
exit=0
DISPATCH61: DISPATCH61_HELD held=4/4 checks=4 rev=622412341d5b1aeaf476d3a6f6df583f21087c7e rule=P61
 | P1 PASS DISPATCH_EVIDENCE_SELFTEST: PASS (8/8)
 | P2 PASS gate=0 clean=true reports=32
 | P3 PASS | `dispatch-evidence` | read a round's dispatch record | `node scripts/dispatch-evidence.mjs --selftest` -> PASS (8/8) | round 61 |
 | P4 PASS exists
--- stderr ---
```

## Does this case independently falsify P61?

**Yes.**

- **P2** requires the "real round-61 wave gate" to print CLEAN and the measured revision to
  carry `launcher-progress.tsv`, `dispatch-actual.json` and ≥32 non-empty `<seat>.md`. All
  four inputs are satisfied by hand-written bytes; none is emitted by the dispatcher or the
  harness. The single byte-level property the gate checks is non-emptiness, which an attacker
  trivially satisfies. The CLEAN verdict is therefore reachable with zero seats run — the gate
  cannot distinguish a fabricated wave from a real one.
- **Full predicate**: P1 is intrinsic (selftest); P3 is a text row written by the same lane
  that claims the capability; P4 is a lane-authored receipt holding the same CLEAN line.
  Committing them is exactly the "authored after the fact" shape the C1 critique identifies.
  Result: `DISPATCH61_HELD` 4/4, exit 0, on a do-nothing control.
- **Independent**: this subcase needs no other subcase (zero-seat registry, mixed/null IDs,
  committed zero-byte files, …). The nonempty-reports shape alone defeats the only report
  materiality check, and the complete predicate holds end-to-end on that fabricated wave.

**Counterexample**: the fixture above — 32 one-line fabricated reports plus a hand-written
progress tsv and hand-written summary, zero real dispatch.

**Evidence**: exact command/output/exit recorded above; gate hash `765a7aa3…` matches lane pin;
committed round-61 receipts `ctl-c1-critic-a1b-nonempty-fabrication.txt` (gate CLEAN) and
`ctl-c1-critic-a4-full-fabrication.txt` (HELD 4/4) corroborate.

**Impacted axes**: operability — the C1 capability acquisition (`## Capabilities` entry)
cannot rest on a predicate satisfiable by fabrication; the gate's CLEAN verdict is not
dispatch evidence. See the round-61 w1 C1 critique, which this subcase reproduces.

**Smallest safe correction** (inherited from the C1 critique; item 3 is this subcase): add the
missing selftest case — 32 non-empty fabricated reports + fabricated session ids +
self-consistent registry must NOT read CLEAN — and make it the red-before control replacing
the empty-report control; re-point P2 at the harness records (`w1/swarm-registry.json` +
`w1-dispatch.json`, assert `counts.spawn == |members| == 32`, non-null `agentId`s, member
names equal to the payload's `taskCall.tasks` names); bind the gate to the measured rev and
take report sizes from `git ls-tree -l <rev>`.

Scratch: `/tmp/kumitate-r62/CritControlC1Nonempty/` (`a1b-nonempty-reports/`,
`full-held/`, `a1b.stdout`, `a1b.stderr`, `probe.stdout`, `probe.stderr`). Lane git index
untouched; the only lane write is this report.

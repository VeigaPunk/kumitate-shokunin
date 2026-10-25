# CritControlC1IdSwap — C1 subcase 6 (swapped identities), round-62 w2 falsification

Seat: `L1Kumitate62.CritControlC1IdSwap` (reviewer, wave w2, round 62). Scope: reproduce only
the named subcase 6 of `kumitate-shokunin/.ufo/waves/round-61/w1/CritControlC1.md` — **swapped
identities** — in scratch, using the already committed control receipts; lane writes limited to
this report. Lane tip at inspection: `0cbe0d75e5a08718e2256408329692908c837766`. The round-62
C1 predicate under attack is the inherited frozen round-61 P61 (`DISPATCH61_HELD` P1–P4; round-62
`probe/dispatch61-probe.mjs` is byte-identical to round-61's, per `w2/CriticC1.md`).

## Target

Subcase 6 of w1 `CritControlC1.md` — **swapped identities**: the C1 evidence check should catch a
dispatch record whose identities are permuted/mis-bound across the progress file
(`launcher-progress.tsv`), the summary registry (`dispatch-actual.json`), and the seats. The gate
under test is the pinned `scripts/dispatch-evidence.mjs` — sha256
`765a7aa3ef6b11f18548da4a91f98c42e07b825229135c30010f092cc1af65cc`, byte-identical to the lane's
SCORECARD pin and to the A4 receipt's gate (verified: `sha256sum` of the scratch copy matches).

Receipt base used: `controls/ctl-c1-critic-a4-full-fabrication.txt` (A4 full fabrication: gate
copy + SCORECARD `dispatch-evidence` row naming round 61 + 32 one-line seat reports + hand-written
`launcher-progress.tsv` + hand-written `dispatch-actual.json` + `close/dispatch61-tip.txt` holding
the CLEAN line, zero seats ever run). Subcase 6 mutates **only the identity bindings** of that
shape — never the counts — and asks whether the frozen predicate still reads HELD.

## Method (scratch only)

Scratch repos under `/tmp/kumitate-r62/CritControlC1IdSwap/` (baseline + V1/V2/V2b/V3) and
`/tmp/kumitate-r62/CritControlC1IdSwap-v2c/` (V2c; standalone clean repo). Each is a `git init`
repo containing the A4 fixture shape (gate copy, SCORECARD.md, 32 one-line `SeatNN.md`, 32-row
`launcher-progress.tsv`, `dispatch-actual.json`, `close/dispatch61-tip.txt`), committed per variant.

So that cross-document identity agreement is *well-defined and checkable*, session ids are placed
in the agentId namespace (`L1Kumitate61.SeatNN`), giving a coherent baseline in which every seat
row, session, and member agentId agree. Each variant then permutes bindings only:

- **V1** — progress sessions rotated −1 (Seat01 carries Seat32's session). Counts unchanged.
- **V2** — registry `agentId`s rotated +1 among members (member Seat01 carries Seat32's agentId).
  Counts unchanged.
- **V2b** — both rotations applied in the same direction (sessions −1, agentIds +1): cross-document
  row↔member agreement survives, but every binding to the seat *name* is broken.
- **V2c** — sessions −1 and agentIds +2 (opposite directions): **literal zero identity binding
  anywhere** (`crossdoc_row_session_eq_agentId=0`, `agentId_matches_own_name=0`,
  `name_matches_own_session=0`).
- **V3** — fully disjoint registry roster: members renamed `Ghost01..Ghost32` with
  `agentId=L1Kumitate61.GhostNN` (name overlap 0, id overlap 0 with the dispatch rows).

Every variant was committed, then probed with the frozen P61 probe (`node
.ufo/waves/round-61/probe/dispatch61-probe.mjs <lane> <rev>`) and the gate
(`node scripts/dispatch-evidence.mjs --root . --round 61 --wave w1`), each in a fresh `git
worktree`/repo checkout of that rev.

## Observed behavior (exact command / output / exit)

All six revisions (baseline and all five scrambled variants) produce **byte-identical** gate
stdout and **identical** HELD 4/4 probe verdicts (`diff` of gate stdout baseline vs V2b:
`IDENTICAL_STDOUT`):

```
$ node scripts/dispatch-evidence.mjs --root . --round 61 --wave w1
DISPATCH_EVIDENCE: CLEAN (seats=32 sessions=32 exit0=32 reports=32 dead=0)
$ echo $?
0
```

```
$ node .ufo/waves/round-61/probe/dispatch61-probe.mjs <lane> <rev>
DISPATCH61: DISPATCH61_HELD held=4/4 checks=4 rev=<rev> rule=P61
 | P1 PASS DISPATCH_EVIDENCE_SELFTEST: PASS (8/8)
 | P2 PASS gate=0 clean=true reports=32
 | P3 PASS | dispatch-evidence | read a round's dispatch record | `node scripts/dispatch-evidence.mjs --selftest` -> PASS (8/8) | round 61 |
 | P4 PASS exists
$ echo $?
0
```

Revisions and identity metrics (computed from the committed bytes at each rev):

| variant | rev | crossdoc row_session_eq_agentId | agentId_matches_own_name | name_matches_own_session | name_overlap / id_overlap | gate exit | probe exit |
|---|---|---|---|---|---|---|---|
| baseline (coherent A4) | `2ebc35272…` | 32 | 32 | 32 | 32 / 32 | 0 | 0 |
| V1 (sessions −1) | `173794e6d…` | 0 | 32 | 0 | 32 / 32 | 0 | 0 |
| V2 (agentIds +1) | `29d4b07ca…` | 0 | 0 | 32 | 32 / 32 | 0 | 0 |
| V2b (both, same direction) | `9cd471a49…` | 32 | 0 | 0 | 32 / 32 | 0 | 0 |
| V2c (opposite; zero binding) | `91976777a…` | 0 | 0 | 0 | 32 / 32 | 0 | 0 |
| V3 (disjoint Ghost roster) | `031e1c0ac…` | 0 | 32 | 32 | 0 / 0 | 0 | 0 |

Explicit-count expectation also passes on a scrambled rev:

```
$ node scripts/dispatch-evidence.mjs --root . --round 61 --wave w1 --expect planned=32,sessions=32,exit0=32,reports=32
DISPATCH_EVIDENCE: CLEAN (seats=32 sessions=32 exit0=32 reports=32 dead=0)
$ echo $?
0
```

(On the V2b worktree; `--expect` checks only counts, exactly as the gate's contract does.)

## Why it passes — code path

`dispatch-evidence.mjs` `inspect()` treats identities as *counts only*:

- progress rows: `session` values are never inspected, only tallied (`sessions += 1`, `:116`);
  a row's session is never bound to its seat name (`SESSION_MISMATCH` only fires when a clean exit
  has *no* session, `:122-123`);
- `dispatch-actual.json` `members`: only `members.every(m => !m.agentId || m.agentId === 'null')`
  (`:134`); member **names are never read at all**, and `agentId` values are never compared to
  progress sessions, to each other, or to the harness registry;
- report existence is keyed by the progress row's `name` (`statSync(<name>.md).size > 0`,
  `:120`) — names bind to *files*, not to identities;
- the harness record `swarm-registry.json` (`ufo-swarm-registry-v1`, the only record carrying the
  real `agentId`s) is never opened by the gate.

So permutations that preserve the counts (`planned/sessionIds/exit0/reports/dead` and non-null
agentIds) are invisible: 32 seats, 32 sessions, 32 exit0, 32 non-empty reports, 0 dead, 32
non-null ids — all identical to the coherent baseline.

## Does this case independently falsify P61?

**Yes.** The frozen predicate reads `DISPATCH61_HELD 4/4 exit 0` on a dispatch record in which
every identity binding is wrong:

- **V2c** is the sharpest shape: every seat row names a different session than its own member
  entry, and every member's `agentId` is rotated off its name — `crossdoc_row_session_eq_agentId=0`,
  `agentId_matches_own_name=0`, `name_matches_own_session=0` — yet P1–P4 all PASS.
- **V3** shows the gate cannot even distinguish the registry of the dispatched round from an
  unrelated roster: member names/agentIds share zero tokens with the dispatch rows, and the
  verdict is unchanged.

This is **independent of A4** (the committed fabrication receipt): A4 invents a
self-consistent record, and w1's A2/A2c only toggled null vs non-null id presence. Here nothing
is invented — the bytes are permuted/corrupted — and a *corrupted* record (no seat bound to any
claimed identity) reads HELD identically to a coherent one. The C1 evidence check therefore
cannot be adjudicating identity at all: it enforces cardinalities, not bindings. The identity
dimension of `kumitate-dispatch-evidence-v1` is unverifiable by P61, and the capability claim
(`## Capabilities` entry) cannot rest on this evidence; the w1 "Duplicate authority / identity"
finding (w1 `CritControlC1.md:138-148`) is confirmed with an independent, corrupt-but-count-
preserving reproduction.

## Impacted axes

- **operability** — the C1 capability acquisition stays unlanded: the predicate is satisfied by
  identity-corrupted evidence, so a passing demonstration does not exist on this evidence.
- **operability (control design)** — subcase 6 is a read closure: w1 controls A2/A2c exercised
  only null/non-null id presence; neither permutes nor disjoints identities. The gate reads byte
  counts and an all-null test; any non-null id set of the right size passes, so identity agreement
  contributes nothing.

## Residual risk / verification gaps

- Gate source read from the lane's committed `scripts/dispatch-evidence.mjs`; every scratch copy
  is sha256-identical to the SCORECARD pin (`765a7aa3…`). The frozen probe ran against scratch
  lanes/repos (as the plan's counting command does); P1's selftest is the same pinned binary
  (raw `--selftest` output: `DISPATCH_EVIDENCE_SELFTEST: PASS (8/8)`, exit 0).
- Did not run against the live lane (its `launcher-progress.tsv` is absent — w1 marks
  `FAIL-CLOSED progress-absent`); subcase reproduction is scratch-only as scoped.
- No tool installs; no lane files touched other than this report (lane status unchanged apart
  from pre-existing modifications/untracked files and this report).

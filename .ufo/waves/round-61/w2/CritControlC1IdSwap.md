# CritControlC1IdSwap — C1 subcase 6 (swapped identities), wave w2 falsification

Seat: `CritControlC1IdSwap` (reviewer, wave w2, round 61). Scope: scratch only
(`/tmp/kumitate-r61/CritControlC1IdSwap/`); lane writes limited to this report.

## Target

Subcase 6 of w1 `CritControlC1.md` — **swapped identities**: the C1 evidence check should
catch a dispatch record whose identities are permuted/mis-bound across the progress file,
the summary registry, and the seats. The live registry exists at
`.ufo/waves/round-61/w1/swarm-registry.json` (`ufo-swarm-registry-v1`, 32 members, 32
real `agentId`s); the gate never reads it.

## Method

Cloned the committed A4 fixture (`/tmp/kumitate-r61/CritControlC1/a4-full-fabrication`,
rev `ab902da2` — gate sha256 `765a7aa3…` identical to the lane pin) into scratch, then
mutated only the *identity bindings* (never the counts) at three committed revs. Each rev
was probed with the frozen P61 probe and the gate:

- V1 `a5965706` — progress `session=` ids rotated one seat (Seat01 now carries Seat32's
  id; `name_matches_own_session=0`).
- V2 `fbb85184` — registry `agentId`s rotated in the same direction (counts unchanged;
  member agentId no longer matches own name).
- V2b `a7eaf1a6` — counter-rotated registry `agentId`s so **zero** identity binding
  survives anywhere: `agentId_matches_own_name=0`, `crossdoc_row_session_eq_agentId=0`.
- V3 `45e430ac` — fully disjoint registry roster: members renamed `Ghost01..Ghost32`,
  `agentId=L1Kumitate61.GhostNN` (`name_overlap=0`, `id_overlap=0`).

## Observed behavior (exact)

V1:

```
$ node .ufo/waves/round-61/probe/dispatch61-probe.mjs . a5965706f27b3780bcafb56a38170a71514b186d
DISPATCH61: DISPATCH61_HELD held=4/4 checks=4 rev=a5965706… rule=P61
 | P1 PASS DISPATCH_EVIDENCE_SELFTEST: PASS (8/8)
 | P2 PASS gate=0 clean=true reports=32
 | P3 PASS | `dispatch-evidence` | … | round 61 |
 | P4 PASS exists
exit=0
```

Gate (same rev): `DISPATCH_EVIDENCE: CLEAN (seats=32 sessions=32 exit0=32 reports=32 dead=0)`, exit 0.

V2b (zero identity binding):

```
$ node scripts/dispatch-evidence.mjs --root . --round 61 --wave w1
DISPATCH_EVIDENCE: CLEAN (seats=32 sessions=32 exit0=32 reports=32 dead=0)
exit=0
$ node .ufo/waves/round-61/probe/dispatch61-probe.mjs . a7eaf1a60ce1266226f0953f49c481cef9bece5f
DISPATCH61: DISPATCH61_HELD held=4/4 checks=4 rev=a7eaf1a6… rule=P61
exit=0
```

V3 (disjoint registry, zero overlap with the dispatch rows):

```
$ node scripts/dispatch-evidence.mjs --root . --round 61 --wave w1
DISPATCH_EVIDENCE: CLEAN (seats=32 sessions=32 exit0=32 reports=32 dead=0)
exit=0
$ node .ufo/waves/round-61/probe/dispatch61-probe.mjs . 45e430acf34dc0abfe0b5001f080133132616547
DISPATCH61: DISPATCH61_HELD held=4/4 checks=4 rev=45e430ac… rule=P61
exit=0
```

`--expect planned=32,sessions=32,exit0=32,reports=32` on a swapped rev: CLEAN, exit 0.

## Why it passes — code path

`dispatch-evidence.mjs` treats identities as *counts only*:

- progress rows: `session` values are never inspected, only tallied
  (`sessions += 1`, `:116`); a row's session is never bound to its seat name
  (`SESSION_MISMATCH` only fires when a clean exit has *no* session, `:122-123`);
- registry `members`: only `members.every(m => !m.agentId || m.agentId === 'null')`
  (`:134`); member **names are never read at all**, and `agentId` values are never
  compared to progress sessions, to each other, or to the real harness registry;
- `dispatch-actual.json` `members` names/ids are wholly arbitrary text; the real harness
  record `swarm-registry.json` (`ufo-swarm-registry-v1`, with the actual agentIds) is
  never opened by the gate (grep: only `dispatch-actual.json` appears in the file).

So the documented contract — "the launcher progress file … against the summary a report
quotes" — compares two same-author documents by counts, proving agreement, not identity.

## Does this case independently falsify P61?

**Yes — on its own, in scratch, with a corrupt-but-count-preserving identity record.**
V2b (`a7eaf1a6`) is a dispatch record in which every identity binding is wrong: every seat
row names a different session than its own member entry, and every member's `agentId` is
rotated off its name — yet the frozen predicate reads `DISPATCH61_HELD 4/4 exit 0`:

- P1–P4 all PASS (P1 selftest 8/8; P2 CLEAN + 32 `.md` at rev; P3 row names round 61;
  P4 tip exists).

The same holds when the registry roster shares **zero** names/ids with the dispatch rows
(V3), i.e. the gate cannot distinguish the registry of the dispatched round from an
unrelated roster. Consequence: a real-world identity swap (launcher emitting session ids
for the wrong seats, or a registry bound to the wrong seats) is invisible to the C1
evidence check; the evidence never binds the session to the seat, the seat to a member, or
the summary to the harness record. This is an independent dimension from fabrication
(A4's fabricated-but-self-consistent record): here even a *corrupted* record — no seat
bound to any claimed identity — reads CLEAN, so the gate cannot be adjudicating identity
at all.

## Severity

- **High** — C1 capability acquisition (`dispatch-evidence`, contract
  `kumitate-dispatch-evidence-v1`) cannot land on this evidence; the identity dimension of
  the check is unverifiable. No control in w1 exercised it (A2 tested all-null ids;
  A2c one invented id; neither permutes or disjoints identities).
- **operability (control design)** — the subcase-6 shape is a read closure: the gate
  reads only byte counts and the all-null test; any non-null id set of the right size
  passes, so identity agreement contributes nothing.

## Residual risk / verification gaps

- Gate source read from the lane's committed `scripts/dispatch-evidence.mjs`; scratch
  copy sha256-identical to the SCORECARD pin (`765a7aa3…`). The frozen probe was run
  against my scratch lane (as the plan's counting command does) and against the gate copy
  inside the scratch repo; P1's selftest is the same pinned binary.
- Did not run against the live lane (its `launcher-progress.tsv` is absent — w1 marks
  `FAIL-CLOSED progress-absent`); subcase reproduction is scratch-only as scoped.
- Scratch only under `/tmp/kumitate-r61/CritControlC1IdSwap/`; lane files untouched other
  than this report. No tool installs (none needed).

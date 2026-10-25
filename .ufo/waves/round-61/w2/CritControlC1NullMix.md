# CritControlC1NullMix — C1 subcase 3: mixed/null IDs

Seat: `CritControlC1NullMix` (critic, wave w2, round 61). Scope: reproduce only the
"mixed/null IDs" subcase of `.ufo/waves/round-61/w1/CritControlC1.md` in scratch; report
findings. Target artifact line: §"A2c — the same fixture with one non-null id and
`sessionIds` self-declared 32" → `DISPATCH_EVIDENCE: CLEAN`, receipt
`controls/ctl-c1-critic-a2c-one-id-bypass.txt`; boundary against receipt
`controls/ctl-c1-critic-a2-null-agentids.txt` (32/32 null → `DRIFT NOT_A_DISPATCH`).

Gate under attack: `scripts/dispatch-evidence.mjs`, sha256
`765a7aa3ef6b11f18548da4a91f98c42e07b825229135c30010f092cc1af65cc` (matches the lane pin
`SCORECARD.md:329`). Probe: `.ufo/waves/round-61/probe/dispatch61-probe.mjs`, sha256
`02028d11b9b05d952df421b030be919e2af1bf77101d302c06a8b0a718c9a89f`. Node v24.21.0,
git 2.56.0. Scratch: `/tmp/kumitate-r61/CritControlC1NullMix/` (`build.py`, fixtures
`fx-allnull`, `fx-null16`, `fx-null31`, `fx-null31-held`).

## Verdict

**Subcase 3 independently falsifies P61.** A registry whose members are a *mix* of null
and non-null `agentId`s — 31 of 32 members carrying `agentId: null`, i.e. the registry's
own record says those seats were never dispatched — reads `DISPATCH_EVIDENCE: CLEAN`
exit 0, and the same fixture inside the committed-evidence scaffold reads
`DISPATCH61_HELD 4/4` exit 0 at a committed revision where zero seats ever ran.

The gate's only identity check is `members.every((m) => !m.agentId || m.agentId === 'null')`
(`dispatch-evidence.mjs:134`): an **all-null edge test**. The boundary is exact and was
measured, not inferred:

## Reproduction — exact commands, output, exits

Fixture family (built by `build.py`, all under
`/tmp/kumitate-r61/CritControlC1NullMix/`): `.ufo/waves/round-61/w1/` holding 32
one-line `<seat>.md` reports, a hand-written `launcher-progress.tsv` whose 32 rows all
carry fabricated `session=L1Kumitate61.SeatNN` / `exit=0`, and a hand-written
`dispatch-actual.json` (`schema=kumitate-dispatch-actual`, `planned=32 sessionIds=32
exit0=32 reports=32 dead=[]`). The fixtures differ **only** in how many `members[].agentId`
are `null`. `fx-null31` is byte-for-byte equal to the w1 `a2c` fixture
(`diff` of file lists, `dispatch-actual.json`, `launcher-progress.tsv`: no differences).

```
$ node scripts/dispatch-evidence.mjs --root /tmp/kumitate-r61/CritControlC1NullMix/fx-allnull --round 61 --wave w1
DISPATCH_EVIDENCE: DRIFT (seats=32 sessions=32 exit0=32 reports=32 dead=0)
FINDING NOT_A_DISPATCH
exit=1          # 32 null / 0 non-null — plan control holds at the all-null edge only
```
```
$ node scripts/dispatch-evidence.mjs --root /tmp/kumitate-r61/CritControlC1NullMix/fx-null16 --round 61 --wave w1
DISPATCH_EVIDENCE: CLEAN (seats=32 sessions=32 exit0=32 reports=32 dead=0)
exit=0          # 16 null / 16 non-null — half-null is indistinguishable from fully dispatched
```
```
$ node scripts/dispatch-evidence.mjs --root /tmp/kumitate-r61/CritControlC1NullMix/fx-null31 --round 61 --wave w1
DISPATCH_EVIDENCE: CLEAN (seats=32 sessions=32 exit0=32 reports=32 dead=0)
exit=0          # 31 null / 1 non-null — exactly the committed a2c receipt, reproduced
```

Probe level — the same 31-null registry committed inside the full evidence scaffold
(scratch git repo: gate copy, SCORECARD `dispatch-evidence` row naming round 61,
`close/dispatch61-tip.txt` with the CLEAN line; everything committed, no seat ever ran):

```
$ node .ufo/waves/round-61/probe/dispatch61-probe.mjs /tmp/kumitate-r61/CritControlC1NullMix/fx-null31-held 3e3892199574c162dc5b224ede50ff38184fe63d
DISPATCH61: DISPATCH61_HELD held=4/4 checks=4 rev=3e3892199574c162dc5b224ede50ff38184fe63d rule=P61
 | P1 PASS DISPATCH_EVIDENCE_SELFTEST: PASS (8/8)
 | P2 PASS gate=0 clean=true reports=32
 | P3 PASS | `dispatch-evidence` | read a round's dispatch record | `node scripts/dispatch-evidence.mjs --selftest` -> PASS (8/8) | round 61 |
 | P4 PASS exists
exit=0
```

## Why this is an independent falsifier (not a restatement of A2c/A4)

- **Independence from A4 (all-32-invented).** A4 proved fabrication when the forger
  invents 32 ids. This subcase proves the harsher thing: the forger does not even need
  to invent them. A registry that *self-reports* 31 undispatched members
  (`agentId: null`) is credited exactly like a fully-populated one — the predicate
  cannot tell "1 of 32 dispatched" from "32 of 32 dispatched" once the progress file
  supplies the session column.
- **The cross-check never runs.** `dispatch-actual.json` declares `sessionIds: 32`
  while only 1 member has a non-null `agentId`, and no `REGISTRY_MISMATCH` fires:
  `:137` compares `sessionIds` to the count of *progress rows with sessions* (fabricated
  separately), never to `members.filter(m => m.agentId).length` (would be 1 here).
  Member identity is structurally invisible to every check except the all-null edge.
- **Independence from A5.** Everything above is committed; `held` is read at a real
  `git rev-parse HEAD` rev, so the falsification does not ride the worktree-vs-commit
  defect.
- **Real-record divergence.** The lane's actual wave-1 dispatch record
  (`w1/swarm-registry.json`, schema `ufo-swarm-registry-v1`) has 32/32 non-null
  `agentId`s — the object the gate never reads. P2 instead certifies agreement between
  two lane-authored files. A mixed/null `dispatch-actual.json` is therefore not just
  fabricatable; it is *the shape the real record takes mid-dispatch* (registries hold
  null `agentId`s before seats land — `w2-plan.json`'s own registry members carry
  `agentId: null` at plan time), so the hole is on the boundary of legitimate data.

## Impacted axes

- **operability** — P61's demonstration claim: the "actual dispatch record" predicate
  accepts a registry whose own contents deny dispatch for 31/32 seats. The capability
  acquisition cannot rest on a gate whose identity check is one invented token deep.
- **operability (control design)** — the plan's C1 control names only the all-null
  edge ("32 null session records read `NOT_A_DISPATCH`"); the committed controls never
  probe the mixed interior, which is where a forger lives. Control coverage is
  off-by-one-token.

## Smallest safe correction (scoped to this subcase)

`dispatch-evidence.mjs:134`: replace the `every(null)` test with a counted check —
`members.filter(m => m.agentId && m.agentId !== 'null').length` must equal the observed
session count (and equal `registry.sessionIds`); any mixed/null interior is DRIFT
(e.g. `IDENTITY_NULL:Seat17+…`). Cheap selftest addition: the fixture with 31 null /
1 non-null must NOT read CLEAN.

## Scope notes

No lane files touched except this report. No `.ufo/state`, no lane git/jj mutation
(scratch `git init` under `/tmp` only), no tool installs (pacman paused; node 24.21.0
and git 2.56.0 already present), no subagents, no background jobs. Receipts cited are
the committed `controls/ctl-c1-critic-a2*.txt` set; all commands/outputs above are
verbatim from this run.

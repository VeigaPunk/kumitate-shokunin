# CritControlC1NullMix — C1 subcase 3: mixed/null IDs (round-62 reproduction)

Seat: `CritControlC1NullMix` (critic, wave w2, round 62). Scope: reproduce only the
"mixed/null IDs" subcase of `.ufo/waves/round-61/w1/CritControlC1.md` in scratch, using the
already committed control receipts as the bracketing points; report exact command/output/exit;
answer whether the case independently falsifies P61.

Target lines: report §"A2c — the same fixture with one non-null id and `sessionIds`
self-declared 32" → `DISPATCH_EVIDENCE: CLEAN`, receipt
`controls/ctl-c1-critic-a2c-one-id-bypass.txt`; boundary against receipt
`controls/ctl-c1-critic-a2-null-agentids.txt` (32/32 null → `DRIFT NOT_A_DISPATCH`).

Gate under attack: `scripts/dispatch-evidence.mjs`, sha256
`765a7aa3ef6b11f18548da4a91f98c42e07b825229135c30010f092cc1af65cc` — re-verified this run,
byte-identical to the lane pin `SCORECARD.md:329` (`pin.dispatch-evidence=765a7aa3…`) and to
the copy installed in the scratch scaffold. Counting command: the frozen
`.ufo/waves/round-61/probe/dispatch61-probe.mjs`, sha256
`02028d11b9b05d952df421b030be919e2af1bf77101d302c06a8b0a718c9a89f`. Node v24.21.0, git
2.56.0. Scratch: `/tmp/kumitate-r62/CritControlC1NullMix/` (`build.py`, `build_held.py`,
fixtures `fx-allnull`, `fx-null16`, `fx-null31`, `fx-null31-held`).

## Verdict

**Subcase 3 independently falsifies P61.** A registry whose members are a *mix* of null and
non-null `agentId`s — 31 of 32 members carrying `agentId: null`, i.e. the registry's own
record says those seats were never dispatched — reads `DISPATCH_EVIDENCE: CLEAN` exit 0,
and the same fixture committed inside the full evidence scaffold reads
`DISPATCH61_HELD held=4/4 checks=4` exit 0 at a committed revision where zero seats ever ran.
The gate's only identity check is `members.every((m) => !m.agentId || m.agentId === 'null')`
(`dispatch-evidence.mjs:134`): an **all-null edge test**. Any single non-null id defeats it;
the whole mixed interior (16/16, 31/1) is indistinguishable from a fully populated dispatch.

## Reproduction — exact commands, output, exits

Fixture family (all under `/tmp/kumitate-r62/CritControlC1NullMix/`): `.ufo/waves/round-61/w1/`
holding 32 one-line `<seat>.md` reports (`Seat01..Seat32`), a hand-written
`launcher-progress.tsv` whose 32 rows all carry fabricated `session=session_SeatNN` /
`exit=0`, and a hand-written `dispatch-actual.json` (`schema=kumitate-dispatch-actual`,
`planned=32 sessionIds=32 exit0=32 reports=32 dead=[]`). The three gate fixtures differ **only**
in how many `members[].agentId` are `null` (verified: `cmp` of the progress file and reports
across fixtures — identical; `diff` of `dispatch-actual.json` — only the `agentId` lines).
`fx-null31` reproduces the committed `a2c` receipt shape; `fx-allnull` reproduces the committed
`a2` receipt shape.

```
$ node scripts/dispatch-evidence.mjs --root /tmp/kumitate-r62/CritControlC1NullMix/fx-allnull --round 61 --wave w1
DISPATCH_EVIDENCE: DRIFT (seats=32 sessions=32 exit0=32 reports=32 dead=0)
FINDING NOT_A_DISPATCH
FINDING REGISTRY_MISMATCH:sessionIds=0observed=32
exit=1          # 32 null / 0 non-null — byte-identical to committed ctl-c1-critic-a2-null-agentids.txt
```
```
$ node scripts/dispatch-evidence.mjs --root /tmp/kumitate-r62/CritControlC1NullMix/fx-null16 --round 61 --wave w1
DISPATCH_EVIDENCE: CLEAN (seats=32 sessions=32 exit0=32 reports=32 dead=0)
exit=0          # 16 null / 16 non-null — half-null is indistinguishable from fully dispatched
```
```
$ node scripts/dispatch-evidence.mjs --root /tmp/kumitate-r62/CritControlC1NullMix/fx-null31 --round 61 --wave w1
DISPATCH_EVIDENCE: CLEAN (seats=32 sessions=32 exit0=32 reports=32 dead=0)
exit=0          # 31 null / 1 non-null — byte-identical to committed ctl-c1-critic-a2c-one-id-bypass.txt
```

Probe level — the same 31-null registry committed inside the full evidence scaffold (scratch
git repo `fx-null31-held` at `cda16b77`; `git status --porcelain` empty, so no A5-style
worktree/commit split): gate copy (hash above), SCORECARD `dispatch-evidence` row naming round
61, `.ufo/waves/round-61/close/dispatch61-tip.txt` with the CLEAN line; everything committed,
no seat ever ran.

```
$ node .ufo/waves/round-61/probe/dispatch61-probe.mjs /tmp/kumitate-r62/CritControlC1NullMix/fx-null31-held cda16b77db9b9d020a1adf3756fad77e90b40eed
DISPATCH61: DISPATCH61_HELD held=4/4 checks=4 rev=cda16b77db9b9d020a1adf3756fad77e90b40eed rule=P61
 | P1 PASS DISPATCH_EVIDENCE_SELFTEST: PASS (8/8)
 | P2 PASS gate=0 clean=true reports=32
 | P3 PASS | `dispatch-evidence` | read a round's dispatch record | `node scripts/dispatch-evidence.mjs --selftest` -> PASS (8/8) | round 61 |
 | P4 PASS exists
exit=0
```

## Why this is an independent falsifier (not a restatement of A2c/A4/A5)

- **Independence from A4 (all-32-invented).** A4 showed a forger can pass by inventing 32
  ids. This subcase shows the harsher thing: the forger does not even need to invent them.
  A registry that *self-reports* 31 undispatched members (`agentId: null`) is credited exactly
  like a fully-populated one. The predicate cannot tell "1 of 32 dispatched" from "32 of 32
  dispatched" once the progress file supplies the session column.
- **The cross-check never runs.** `dispatch-actual.json` declares `sessionIds: 32` while only
  1 member has a non-null `agentId`, and no `REGISTRY_MISMATCH` fires: `:137` compares
  `sessionIds` to the count of *progress rows with sessions* (fabricated separately), never to
  `members.filter(m => m.agentId).length` (would be 1 here). Member identity is structurally
  invisible to every check except the all-null edge.
- **Independence from A5.** Everything above is committed; `held` is read at a real
  `git rev-parse HEAD` rev (`cda16b77`), so the falsification does not ride the
  worktree-vs-commit defect.
- **Real-record divergence.** The lane's actual wave-1 dispatch record
  (`w1/swarm-registry.json`, schema `ufo-swarm-registry-v1`) has 32/32 non-null `agentId`s —
  the object the gate never reads. P2 instead certifies agreement between two lane-authored
  files. A mixed/null `dispatch-actual.json` is therefore not just fabricatable; it is *the
  shape the real record takes mid-dispatch* (registries hold null `agentId`s before seats
  land — `w2-plan.json`'s own registry members carry `agentId: null` at plan time), so the
  hole sits on the boundary of legitimate data.

## Impacted axes

- **operability** — P61's demonstration claim: the "actual dispatch record" predicate accepts
  a registry whose own contents deny dispatch for 31/32 seats. The capability acquisition
  cannot rest on a gate whose identity check is one invented token deep.
- **operability (control design)** — the plan's C1 control names only the all-null edge
  ("32 null session records read `NOT_A_DISPATCH`"); the committed controls never probe the
  mixed interior, which is where a forger lives. Control coverage is off-by-one-token.
- **coverage / coverage:script-layer** — untouched; no corpus effect.
- **Not a tradeoff to accept** — fixable defect, not a measurement limit: the identity check
  is a counted property that the gate already computes for sessions; extending it to members is
  a binding choice.

## Smallest safe correction (scoped to this subcase)

`dispatch-evidence.mjs:134`: replace the `every(null)` test with a counted check —
`members.filter(m => m.agentId && m.agentId !== 'null').length` must equal the observed session
count (and equal `registry.sessionIds`); any mixed/null interior is DRIFT (e.g.
`IDENTITY_NULL:Seat17+…`). Cheap selftest addition (9th case): the fixture with 31 null /
1 non-null must NOT read CLEAN. This makes the committed `a2c` receipt red-before (DRIFT) and
keeps the `a2` all-null case red as well.

## Scope notes

No lane files touched except this report. No `.ufo/state`, no lane git/jj mutation (scratch
`git init` under `/tmp` only), no tool installs (node 24.21.0 / git 2.56.0 already present),
no subagents, no background jobs. Receipts cited are the committed `controls/ctl-c1-critic-a2*.txt`
set; all commands/outputs above are verbatim from this run.

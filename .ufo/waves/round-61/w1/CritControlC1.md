# CritControlC1 — C1 (`dispatch-evidence`) attacked for gaming

Seat: `CritControlC1` (critic, wave w1, round 61). Scope: scratch only; lane writes limited to
`.ufo/waves/round-61/controls/ctl-c1-critic-*.txt` and this report.

Gate attacked: `scripts/dispatch-evidence.mjs`, sha256
`765a7aa3ef6b11f18548da4a91f98c42e07b825229135c30010f092cc1af65cc` — byte-identical to the
lane's own pin (`SCORECARD.md:329 pin.dispatch-evidence=`), so every control below runs the
pinned artifact, not a copy of convenience.

## Verdict

**The C1 target is reachable by a do-nothing control.** `DISPATCH61_HELD` reads
`held=4/4 checks=4` exit 0 on a scratch lane where **no seat ever ran and no dispatch
record exists**: 32 one-line report files, a hand-written `launcher-progress.tsv` with
invented session ids, a hand-written `dispatch-actual.json`, a SCORECARD row and a tip
receipt. The three assigned controls hold, but only because each was built in a shape that
defeats itself (zero-byte reports; *all*-null ids); none of them tests fabrication.

## Assigned attempts — observed lines

**A1 — fabricated registry + 32 EMPTY seat reports + fabricated progress ids** (exactly the
plan's control shape). Receipt `controls/ctl-c1-critic-a1-fabricated-empty-reports.txt`.

```
DISPATCH_EVIDENCE: DRIFT (seats=32 sessions=32 exit0=32 reports=0 dead=0)
FINDING REPORT_ABSENT:Seat01 … (×32)
exit=1
```

Not CLEAN — but the only thing that caught it is `statSync(reportPath).size > 0`
(`scripts/dispatch-evidence.mjs:120`). It is a file-size check, not a provenance check.

**A1b — same fabrication, reports non-empty.** Receipt
`controls/ctl-c1-critic-a1b-nonempty-fabrication.txt`.

```
DISPATCH_EVIDENCE: CLEAN (seats=32 sessions=32 exit0=32 reports=32 dead=0)
exit=0
```

One line of text per file is the whole barrier. The plan's committed control ("32 empty
`<name>.md`") therefore tests nothing an attacker would ever produce.

**A2 — committed-looking w1, every member `agentId=null`.** Receipt
`controls/ctl-c1-critic-a2-null-agentids.txt`.

```
DISPATCH_EVIDENCE: DRIFT (seats=32 sessions=32 exit0=32 reports=32 dead=0)
FINDING NOT_A_DISPATCH
FINDING REGISTRY_MISMATCH:sessionIds=0observed=32
exit=1
```

Holds as the plan declares. **A2c — the same fixture with one non-null id and
`sessionIds` self-declared 32** (receipt `controls/ctl-c1-critic-a2c-one-id-bypass.txt`):

```
DISPATCH_EVIDENCE: CLEAN (seats=32 sessions=32 exit0=32 reports=32 dead=0)
exit=0
```

`NOT_A_DISPATCH` is `members.every((m) => !m.agentId || m.agentId === 'null')`
(`dispatch-evidence.mjs:134`) — an all-tokens-absent test. One invented id in 32 defeats it.
Inventing 32 ids (A1b/A4) defeats it trivially.

**A3 — P3 satisfied alone (SCORECARD row naming round 61), no wave record.** Receipt
`controls/ctl-c1-critic-a3-p3-only.txt`; scratch git repo, no `.ufo/waves/round-61/w1`.

```
DISPATCH61: DISPATCH61_UNMET held=2/4 checks=4 rev=6bc66470… rule=P61
 | P1 PASS DISPATCH_EVIDENCE_SELFTEST: PASS (8/8)
 | P2 MISS gate=2 clean=false reports=0
 | P3 PASS | `dispatch-evidence` | … | round 61 |
 | P4 MISS absent
exit=1
```

P3 alone cannot carry the predicate — P2 still fails closed. This is the one assigned
attack that behaves as intended, and it is the weakest threat: the row is text, so P3 is
always satisfiable by whoever writes the SCORECARD (round 60 already shipped it early, A7).

## Strongest counterexample — A4 (full fabrication)

Receipt `controls/ctl-c1-critic-a4-full-fabrication.txt`. Scratch git repo holding a copy of
the pinned gate, a SCORECARD `dispatch-evidence` row naming round 61, 32 fabricated seat
reports, `launcher-progress.tsv` with fabricated session ids, a self-consistent
`dispatch-actual.json`, and `close/dispatch61-tip.txt` with the CLEAN line. Zero seats.

```
DISPATCH61: DISPATCH61_HELD held=4/4 checks=4 rev=ab902da2… rule=P61
 | P1 PASS DISPATCH_EVIDENCE_SELFTEST: PASS (8/8)
 | P2 PASS gate=0 clean=true reports=32
 | P3 PASS | `dispatch-evidence` | … | round 61 |
 | P4 PASS exists
exit=0
```

The gate is a **consistency check between two documents the same author writes**. Its own
docstring claims `launcher-progress.tsv` is "the launcher progress file the dispatcher wrote
seat by seat"; nothing in the contract establishes that. `dispatch-actual.json` is described
as "the summary a report quotes" — i.e. explicitly human-authored. Comparing them proves
agreement, not dispatch.

**The record the gate demands is not the record this round's dispatcher emits.** Round 61's
dispatch is native (`w1-dispatch.json` `ufo-swarm-wave-dispatch-v1`, `counts.spawn=32`) and
the harness writes only `w1/swarm-registry.json` (`ufo-swarm-registry-v1`, 32 members, 32
non-null `agentId`s such as `L1Kumitate61.ExecTipReceipts`). There is no `launcher.py.txt`
in `round-61/`; at this writing `w1/launcher-progress.tsv` does not exist and the live gate
reads `FAIL-CLOSED progress-absent` exit 2 (`controls/ctl-c1-critic-live-gate.txt`). So P2's
required progress file and registry summary must be **authored after the fact** by the same
lane that claims the capability — the evidence is lane-typed by construction, not
dispatcher-emitted. Round 59/60's `launcher-progress.tsv` came from a lane-committed
`launcher.py.txt` (106 lines, writes `PROGRESS` at line 81), which is itself lane-authored.

## Second, independent falsifier — A5 (commit/working-tree split)

Receipt `controls/ctl-c1-critic-a5-commit-worktree-split.txt`. Same fabrication, but the
**committed** revision holds 32 zero-byte reports and no tip receipt; the non-empty reports
and the tip receipt exist only in the working tree (uncommitted/untracked).

```
committed at rev: 32 .md files, 32 of them zero-byte; tip receipt committed=False
DISPATCH61: DISPATCH61_HELD held=4/4 checks=4 rev=ced3ece3… rule=P61
 | P2 PASS gate=0 clean=true reports=32
 | P4 PASS exists
exit=0
```

P2's gate arm and P4 read the working tree (`dispatch61-probe.mjs:15`, `:28`), while the
predicate's words say "the committed revision carries … ≥32 **non-empty** `<seat>.md`" and
"P4 … exists **at the measured revision**". P2's rev arm uses
`git ls-tree -r --name-only` (`:19-22`), which cannot report a size — the declared
non-emptiness condition is unimplementable as written and the code checks names only. This
is a distinct defect from A4: even a gate that rejected fabricated bytes would still read
HELD at a revision whose committed evidence is empty.

## Duplicate authority / identity

One fact (32 seats dispatched) now has four encodings: the validator payload
`w1-dispatch.json`, the harness `w1/swarm-registry.json`, the lane-typed
`launcher-progress.tsv`, and the hand summary `dispatch-actual.json`. `wave-census`
(round 41) already owns the payload authority and already documents the exact limit —
"A payload file proves validation, not dispatch" (`scripts/wave-census.mjs:18-24`). The new
gate adds no independent witness; it compares the two weakest encodings and leaves the
harness record unread. Identity is also unstable: progress rows use `session_<uuid>`
(r59/r60) while the harness registry uses `L1Kumitate61.<Seat>` — the gate compares no ids
across the two, so neither namespace is bound to anything.

## Impacted axes

- **operability** — the C1 capability acquisition cannot enter `## Capabilities` on this
  evidence. AXES §Capabilities requires a passing demonstration; a predicate satisfiable by
  fabrication is not one, and the round-60 spot-check set the precedent for an unlanded
  demonstration (`corpus/lessons/round-60-verifier-spotcheck.md:39-90`: "the capability's
  demonstration … is unlanded — so the acquisition does not enter the table"). The integer
  stays 9 either way; the repertoire claim is what fails.
- **operability (control design)** — the plan's own `## C1 Control` paragraph is falsified:
  both named controls hold for self-defeating reasons and the real threat shape (A1b/A4)
  reads CLEAN. A control that cannot fail on the attack is not a control.
- **coverage / coverage:*** — untouched; no corpus effect.
- **Not a tradeoff to accept**: this is a fixable defect. The forgery path exists because
  the predicate reads lane-authored bytes instead of the dispatcher's own record; that is a
  binding choice, not a measurement limit like wave-census's "an absent report does not say
  why".

## Smallest safe correction

1. **Re-point P2 at the harness record** (no new file, one authority): require
   `.ufo/waves/round-61/w1/swarm-registry.json` (`ufo-swarm-registry-v1`) and
   `w1-dispatch.json` (`ufo-swarm-wave-dispatch-v1`) at the measured rev, assert
   `counts.spawn == |members| == 32`, every `agentId` non-null, and the member-name set
   equal to the payload's `taskCall.tasks` names. Then a forger must fabricate the
   validator payload and the harness registry too — the objects `wave-census` already
   judges — instead of two private summaries.
2. **Bind the gate to the rev**: run `inspect()` on a `git archive`/`git show` extraction of
   the measured revision (or add `--rev`), and take report sizes from
   `git ls-tree -l <rev>`; read the tip receipt with `git show <rev>:…`. This kills A5.
3. **Add the missing selftest case** (9th): 32 non-empty fabricated reports + fabricated
   session ids + self-consistent registry must NOT read CLEAN. Replace the plan's
   `ctl-c1-fabricated-registry` control (absence) and the all-null control (A2) with this
   shape; keep A1b/A4 as the red-before receipts.
4. If a lane-typed progress file is kept at all, it must be derived from the harness
   registry in the same command and carry the harness `agentId` verbatim, so the two
   namespaces cannot diverge.

## Receipts written (lane, controls dir)

- `controls/ctl-c1-critic-a1-fabricated-empty-reports.txt` — DRIFT, reports=0
- `controls/ctl-c1-critic-a1b-nonempty-fabrication.txt` — CLEAN (hole)
- `controls/ctl-c1-critic-a2-null-agentids.txt` — DRIFT NOT_A_DISPATCH (holds)
- `controls/ctl-c1-critic-a2c-one-id-bypass.txt` — CLEAN (hole)
- `controls/ctl-c1-critic-a3-p3-only.txt` — UNMET held=2/4 (holds)
- `controls/ctl-c1-critic-a4-full-fabrication.txt` — **HELD 4/4 by fabrication**
- `controls/ctl-c1-critic-a5-commit-worktree-split.txt` — **HELD 4/4 at a rev with zero-byte reports**
- `controls/ctl-c1-critic-live-gate.txt` — live lane reads FAIL-CLOSED progress-absent

Scratch: `/tmp/kumitate-r61/CritControlC1/` (`build_fixtures.py`, `run_controls.py`,
`a5_split.py`, fixtures `a1…a5`). No subagents, no lane jj/git mutation, no `.ufo/state`
write, no tool installs. Lane git index untouched (scratch repos only, under `/tmp`).

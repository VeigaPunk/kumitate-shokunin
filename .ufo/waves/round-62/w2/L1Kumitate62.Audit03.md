# L1Kumitate62.Audit03 — Schema-NullIdentity: session IDs absent/null while exit=0

Seat: `L1Kumitate62.Audit03` (reviewer, wave w2, round 62). Scope: scratch only
(`/tmp/kumitate-r62/Audit03/`); lane writes limited to this report. Attacked artifact:
the round dispatch record — `launcher-progress.tsv` (seat, session, exit) plus the
sibling `dispatch-actual.json` — with **session IDs absent/null while exit=0**. Run
`dispatch-evidence` and document whether the gate still credits the seat.

Inherited predicate under attack (round-61 C1/P61 payload, contract
`kumitate-dispatch-evidence-v1`): "a prepared spec is not a dispatch — a registry
whose members carry no session id is DRIFT `NOT_A_DISPATCH`, never a dispatch of N
seats; a dead seat (exit ≠ 0, no session id) is named and never credited."

Gate under test: `scripts/dispatch-evidence.mjs`, sha256
`765a7aa3ef6b11f18548da4a91f98c42e07b825229135c30010f092cc1af65cc` (matches the lane pin
`SCORECARD.md:329`). Node v24.21.0, git 2.56.0. No installs, no subagents, no lane
mutation (lane `git status` unchanged apart from the pre-existing untracked round-61
bundle and this round's wave dir).

## Verdict

**The gate never credits a null/absent-session seat.** For every shape of "absent/null"
(empty value, literal `null`, column omitted), an exit=0 row is:

- still counted in the verdict line's `seats=` and `exit0=` counters (the only
  seat-level numbers it appears in),
- **not** counted in `sessions=`,
- classified **dead** (`dead=32` in the all-null case, `dead=31` when 1 of 32 has a
  session) — i.e. the gate itself treats an exit=0/no-session seat as a dead seat,
- flagged `SESSION_MISMATCH:<seat>`, so the verdict is always `DRIFT` exit 1 — never
  `CLEAN`, regardless of how `dispatch-actual.json` self-declares its counts.

So the gate **does not credit the seat**: it refuses the wave (DRIFT) and names the
seat. The one misleading surface is the verdict line's counter portion itself
(`seats=32 sessions=0 exit0=32 … dead=32`) — a consumer quoting only `seats`/`exit0`
would still see the 32 seats as "exit 0" — but the line's verdict token is `DRIFT`,
and the seat is simultaneously in `dead`. The contract's "dead seat is named and never
credited" holds, and it holds **more strictly** than the docstring: the docstring says
dead means `exit ≠ 0, no session id`, but the code (`dispatch-evidence.mjs:114`) also
marks (exit=0, no session) dead.

Two sharpening observations on the inherited predicate:

1. **The null test is a token-shape test, not schema/identity validation.**
   `parseProgress` (`dispatch-evidence.mjs:64`) normalizes exactly two spellings to
   null: empty (`session=`) and the literal `session=null`; a missing column parses
   identically. **Any other non-empty token is accepted and credited as a session id**
   — measured below with `session=0` and `session=false`, both counted in `sessions=`
   (and *not* flagged). This is the direct mapping of the round-61
   `CritControlC1NullMix` finding (`members.every(!agentId)` edge test) onto the
   progress file's session column: the all-null edge is caught, but the acceptance set
   is unbounded, so "null" is only recognized as exactly `''`/`'null'`.
2. **Mixed interiors are caught per-seat but the boundary is off-by-one-token.**
   With 1 of 32 sessions present, `NOT_A_DISPATCH` does **not** fire (it requires
   `withSession === 0`, line 130); the 31 null seats are still individually refused via
   `SESSION_MISMATCH`. The all-null edge alone gets `NOT_A_DISPATCH`, and then twice
   (line 130 from the progress file, line 135 from the registry's
   `members.every(!agentId)` — duplicated finding, cosmetic).

## Reproduction — exact commands, output, exits

Fixture family (built by `build-fx.mjs` under `/tmp/kumitate-r62/Audit03/`, all with
32 seats, every seat exit=0 unless noted, every seat's `.md` report present, and
`dispatch-actual.json` self-declaring *matching* counts so the only findings are the
session ones): `.ufo/waves/round-62/w1/` inside each fixture root.

```
$ node scripts/dispatch-evidence.mjs --root /tmp/kumitate-r62/Audit03/ctl-clean --round 62 --wave w1
DISPATCH_EVIDENCE: CLEAN (seats=32 sessions=32 exit0=32 reports=32 dead=0)
exit=0          # control: all sessions present
```

```
$ node scripts/dispatch-evidence.mjs --root /tmp/kumitate-r62/Audit03/fx-allnull-empty --round 62 --wave w1
DISPATCH_EVIDENCE: DRIFT (seats=32 sessions=0 exit0=32 reports=32 dead=32)
FINDING SESSION_MISMATCH:Seat01 … FINDING SESSION_MISMATCH:Seat32   (32×)
FINDING NOT_A_DISPATCH
FINDING NOT_A_DISPATCH
exit=1          # session= (empty value) on every row — record shape: Seat01<TAB>pid=1<TAB>session=<TAB>exit=0…
```

```
$ node scripts/dispatch-evidence.mjs --root /tmp/kumitate-r62/Audit03/fx-allnull-literal --round 62 --wave w1
DISPATCH_EVIDENCE: DRIFT (seats=32 sessions=0 exit0=32 reports=32 dead=32)
FINDING SESSION_MISMATCH:Seat01 … :Seat32  (32×)
FINDING NOT_A_DISPATCH ×2
exit=1          # session=null literal — byte-identical verdict to empty value
```

```
$ node scripts/dispatch-evidence.mjs --root /tmp/kumitate-r62/Audit03/fx-allnull-nokey --round 62 --wave w1
DISPATCH_EVIDENCE: DRIFT (seats=32 sessions=0 exit0=32 reports=32 dead=32)
FINDING SESSION_MISMATCH:Seat01 … :Seat32  (32×)
FINDING NOT_A_DISPATCH ×2
exit=1          # session column omitted entirely — record shape: Seat01<TAB>pid=1<TAB>exit=0…
```

```
$ node scripts/dispatch-evidence.mjs --root /tmp/kumitate-r62/Audit03/fx-mixed1 --round 62 --wave w1
DISPATCH_EVIDENCE: DRIFT (seats=32 sessions=1 exit0=32 reports=32 dead=31)
FINDING SESSION_MISMATCH:Seat02 … :Seat32  (31×)
exit=1          # 1 session + 31 null, all exit=0 — NOT_A_DISPATCH does NOT fire
```

```
$ node scripts/dispatch-evidence.mjs --root /tmp/kumitate-r62/Audit03/fx-mixed16 --round 62 --wave w1
DISPATCH_EVIDENCE: DRIFT (seats=32 sessions=16 exit0=32 reports=32 dead=16)
FINDING SESSION_MISMATCH:Seat17 … :Seat32  (16×)
exit=1
```

```
$ node scripts/dispatch-evidence.mjs --root /tmp/kumitate-r62/Audit03/fx-deadctrl --round 62 --wave w1
DISPATCH_EVIDENCE: DRIFT (seats=32 sessions=16 exit0=16 reports=32 dead=16)
FINDING DEAD_SEAT_UNCREDITED:Seat17 … :Seat32  (16×)
exit=1          # control: exit=-9 without session → dead via DEAD_SEAT_UNCREDITED (has reports)
```

```
$ node scripts/dispatch-evidence.mjs --root /tmp/kumitate-r62/Audit03/fx-bogustoken --round 62 --wave w1
DISPATCH_EVIDENCE: DRIFT (seats=32 sessions=17 exit0=32 reports=32 dead=15)
FINDING SESSION_MISMATCH:Seat18 … :Seat32  (15×)
exit=1          # session=0 and session=false are CREDITED as sessions (sessions=17), not flagged
```

## Analysis

- **parseProgress** (`dispatch-evidence.mjs:50-70`): rows are split on tab; the
  session value is normalized with `kv.session && kv.session !== 'null' ? kv.session :
  null` (line 64). Absent key, empty value, and literal `null` all become `null`; any
  other string stays.
- **inspect** (lines 109-130): `isDead = row.exit !== 0 || !row.session` (line 114) —
  so an exit=0/no-session seat is dead. `sessions += 1` only when `row.session`
  (line 116). `exit0 += 1` whenever `row.exit === 0` (line 117) — the one counter that
  does not consult session presence. `SESSION_MISMATCH:<name>` is pushed for every
  exit=0/no-session row (line 123), so a DRIFT verdict is unavoidable for any such row.
  `NOT_A_DISPATCH` requires `withSession === 0` of *all* rows (line 130).
- **Registry interplay**: with a matching self-declared registry (as built here), the
  only findings are the session ones; with a lying registry (e.g. `sessionIds=32`),
  `REGISTRY_MISMATCH` fires additionally. No registry assignment suppresses
  `SESSION_MISMATCH`. There is no configuration in which an exit=0/no-session seat
  yields `CLEAN`.
- **Relationship to round-61 findings**: `CritControlC1NullMix.md` proved the
  `dispatch-actual.json` `members[].agentId` null edge is caught but the mixed interior
  is not (31/32 null → CLEAN). This seat extends the probe to the **progress file's
  session column** — the launcher's own machine-written record — and shows the session
  null edge is caught per-seat (`SESSION_MISMATCH`), unlike the agentId edge, but that
  the acceptance set is still unbounded (any non-empty token is a session). Both
  halves are the same structural fact: the gate checks token *presence*, never token
  *validity* or provenance (consistent with `CritControlC1SessionIdentity.md`'s
  unbound-identity result).

## Impacted axes

- **operability** — P61's demonstration claim survives the null case *in the weak
  sense* (the wave is refused), but the counter surface a report quotes
  (`seats=`/`exit0=`) still enumerates refused seats as exit-0 seats, and the identity
  schema accepts arbitrary tokens, so "absent/null" is enforced as exactly two
  spellings, not as a schema.

## Smallest safe correction (scoped to this subcase)

1. Validate session token shape in `parseProgress` (e.g. require the launcher's real
   session format / minimum length / uniqueness across rows); any token failing the
   shape is `null`, and the `fx-bogustoken` fixture must not count `session=0`
   / `session=false` in `sessions=`.
2. Optionally dedupe `NOT_A_DISPATCH` (progress and registry both emit it for the same
   all-null record).
3. Optional summary clarity: since an exit=0/no-session seat is dead, the verdict line
   could avoid leaving `exit0=` as the only seat-level credit-bearing counter (e.g.
   `credited=`), so a quoting report cannot over-read `exit0`.

## Scope notes

No lane files touched except this report; no `.ufo/state`, no lane git/jj mutation, no
tool installs, no subagents, no background jobs. All fixtures and commands live under
`/tmp/kumitate-r62/Audit03/` (`build-fx.mjs`); all outputs above are verbatim from
this run (long `SESSION_MISMATCH` listings elided to first/last with counts).

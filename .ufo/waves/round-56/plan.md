# kumitate round 56 — plan (frozen 2026-10-24)

Lane: kumitate. Round 56 (hyaku run 5, watchdog attempt 1). Base
`3eae059e929e4da317c45eba18b4099b90f7541b` (the round-55 verifier-spotcheck tip; lane clean,
ahead=0).
Round shape: **ONE v2 wave of exactly 64 seats** (the round-52..55 orchestrator/operator
steer carries; validated under `scripts/hyaku/ufo-wave-policy-v2.json`, band 64–128,
≥25% attack roles), prepared by the L1 and dispatched by the orchestrator from the spec
committed at `.ufo/waves/round-56/w1-spec.json`; the §3 planner seat is held by the L1
(orchestrator ruling 2026-10-19). Seat tools start at the fleet root: every path below is
absolute or lane-root-relative from `/home/vgpnk/Projects/shokunin/kumitate-shokunin`.

This plan is frozen with counters AND base receipts AND a scratch-HELD witness (QUALITY
Q43 as upgraded by lesson M5: the freeze commit must show the counters HELD against a
synthetic conformant post-state, not only UNMET at base).

## Claims (exactly two, distinct axes, causally separable)

**C1 — operability (lowest non-retired axis; capability acquisition): `source-dupes`,
the SOURCES duplicate-URL ratchet.** The maintained census
(`scripts/sources-census.sh validate`) prints a W04 warning when two Registry rows share
a normalized URL under differing scopes — and never fails on it. At round-56 open the
lane carried exactly four live groups (S023+S034, S047+S084, S060+S068, S069+S095), each
a source admitted twice under two scopes, splitting which row is authoritative and
which `used-by` path owns the citation. Contract `kumitate-source-dupes-v1`: the
registry `.ufo/pins/source-dupes.json` (version 1) pins every live duplicate group by
member ids + normalized url + reason; `node scripts/source-dupes.mjs
[--registry <path>] [--sources <path>]` recomputes the live set and requires exact
equality: `SOURCE_DUPES: CLEAN` exit 0; `DRIFT` exit 1 (`new-duplicate` /
`stale-known` / `known-mismatch`); `FAIL-CLOSED` exit 2 (registry unreadable,
malformed, version ≠ 1, a row id covered by two pins, or an unreadable sources doc);
64 usage. Twelve-case hermetic selftest. Predicate `ATTEST56_HELD` (rule A56 v1, ten
checks B1..B10).

Kill rules (frozen before data): K1 do-nothing = the base receipts below (gate, registry,
pin stanza, SKILL rows, capability row all absent at base); K2 static-forgery = the B3
arms mutate real committed bytes in a scratch extraction and the gate recomputes the
live set itself; B10 re-derives the groups independently of the gate's own code; K3
drop-one counter mutants print `held=9/10`, killed by the predicate's literal
`held=10/10 checks=10`; K4 vacuous-HELD = B5c (hold-call-deleted mutant transcript +
judged-bytes guard); K5 the scratch-HELD witness proves 10/10 reachable by a conformant
post-state before any score is taken (lesson M5).

**C2 — coverage frontier (learning, sourced): `visibility-lease-ack-deadlines.md`.**
The sixth entry of the durable-execution research line (PROVINCE.md frontier band):
the *lease* slot under at-least-once — broker visibility-timeout / ack-deadline
semantics: SQS invisibility window + expiry re-arm (S114), Pub/Sub lease management /
renewable modifyAckDeadline (S113), JetStream ack-wait redelivery (S115). S116
(Temporal Visibility) was opened and rejected: it is operator search over execution
state, not a delivery lease. Predicate `DOCTRINE56_HELD` (rule D56, five checks E1–E5,
mirroring D55).

Predicate sentences (frozen, byte-identical in this plan, both probe headers and the
report):
ATTEST56_HELD — node .ufo/waves/round-56/probe/attest56-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <rev> prints "ATTEST56: ATTEST56_HELD held=10/10 checks=10 rev=<rev> rule=A56 version=v1" and exits 0.
DOCTRINE56_HELD — node .ufo/waves/round-56/probe/doctrine56-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <rev> prints "DOCTRINE56: DOCTRINE56_HELD held=5/5 checks=5 rev=<rev> rule=D56" and exits 0.

## Counters (frozen)

`.ufo/waves/round-56/probe/attest56-probe.mjs` (rule `A56` v1, ten checks B1..B10)
and `.ufo/waves/round-56/probe/doctrine56-probe.mjs` (rule `D56` v1, checks E1–E5).

Source pins (the B5d arm — freeze-time sha256 of the frozen counters and the new
instrument; the registry `.ufo/pins/counter-pins.json` carries the round-53..55 pins
without regression and is re-verified by the B5 arm at every judged rev):

```
attest56-probe   = sha256(.ufo/waves/round-56/probe/attest56-probe.mjs)
doctrine56-probe = sha256(.ufo/waves/round-56/probe/doctrine56-probe.mjs)
source-dupes     = sha256(scripts/source-dupes.mjs)
pinned in .ufo/pins/counter-pins.json (round: 56 entries)
```

## Receipt plan (C1 evidence)

Three receipts at `.ufo/waves/round-56/receipts/`, planned argv frozen here (A56 B8
asserts exactly these):

- `attest-run-1.txt` — `node scripts/source-dupes.mjs --selftest`
- `attest-run-2.txt` — `node scripts/bind-oracle.mjs --selftest`
- `attest-run-3.txt` — `node scripts/round-gate.mjs --selftest`

Body-field `wall_start` span ≥ 300 s across the three (minted time-spaced). Doctored
control `attest-run-2-replayed.txt` (prelude rewritten, sidecar untouched — the M2
replayed-receipt control): `verify` must read `RECEIPT: REPLAY`/`TAMPERED`, never
VALID; it is excluded from the B8 evidence set by name.

## Frontier step (round contract §2b)

- SOURCES rows opened this round: S113 (Pub/Sub subscriber docs, tier A, admitted),
  S114 (AWS SQS visibility timeout, tier A, admitted), S115 (NATS JetStream ack
  responses, tier A, admitted), S116 (Temporal Visibility, tier B, rejected — operator
  search ≠ delivery lease). Captured bytes pinned in `.ufo/pins/source-captures.json`
  per Q46; each row's Gate quote recorded in `corpus/lessons/round-56.md`.
- Census before → after: `scripts/sources-census.sh validate --root
  /home/vgpnk/Projects/shokunin kumitate` — before exit 0 (4 pre-existing W04 warnings,
  now pinned by this round's gate), after exit 0 required.
- Mistakes mined: R55-V1 (attribution — omitted bookkeeping commits) and R55-V2
  (number-drift — tier histogram asserted, not re-derived) in the lesson `## Mistakes`.
- Sourced claim: C2 cites S113/S114/S115.

## Harm battery (H1–H6, run at close)

H1 checklist census `node scripts/surface-probe.mjs --checklists` ≥ freeze floor;
H2 selftests green (receipt-attest, counter-pins, source-capture, source-dupes,
cap-run, bind-oracle, round-gate, sources-check, counter-rerun); H3
`node scripts/proxy-check.mjs --strict` → `PROXY: MATCH`; H4 sources census exit 0;
H5 prior-round counters A53/D53/A54/D54/A55/D55 re-run at close rev (the frozen A54
exactly-24 and A55 exactly-25 checklist literals are recorded as named
counter-obsolescence when B7 supersedes them — the intended cost of a capability
acquisition, not hidden); H6 `.ufo/pins/counter-pins.json` carries round-53..55 pins
without regression (B5).

## Close sequence (R52-11 discipline)

R1 = integration tip (this commit's tree: plan, counters, gate, registry, pins, SKILL
rows, SCORECARD stanza + capability row + move log, entry + S113–S116 + lesson +
README + PROVINCE + QUALITY Q47, captures, wave spec, mutant transcript). A56 and D56
run against R1; both FINAL receipts committed. R2 = the receipt commit; both counters
re-run against R2 → IDEMPOTENCE transcript (R3). Report + SCORECARD cite measured
close revision R1; the tip carries a re-run against its own bytes.

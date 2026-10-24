# kumitate round 57 — plan (frozen 2026-10-24)

Lane: kumitate. Round 57 (hyaku run 5, in-session L1). Base
`7178bfd3643c0fac74c8eb637cd6e985faadd0cf` (the round-56 verifier-spotcheck tip; lane clean,
ahead=0).
Round shape: **ONE v2 wave of exactly 64 seats** (the round-52..56 orchestrator/operator
steer carries; validated under `scripts/hyaku/ufo-wave-policy-v2.json`, band 64–128,
≥25% attack roles), prepared by the L1 and dispatched by the orchestrator from the spec
committed at `.ufo/waves/round-57/w1-spec.json`; the §3 planner seat is held by the L1
(orchestrator ruling 2026-10-19). Seat tools start at the fleet root: every path below is
absolute or lane-root-relative from `/home/vgpnk/Projects/shokunin/kumitate-shokunin`.

This plan is frozen with counters AND base receipts AND a scratch-HELD witness (QUALITY
Q43 as upgraded by lesson M5: the freeze commit must show the counters HELD against a
synthetic conformant post-state, not only UNMET at base).

## Claims (exactly two, distinct axes, causally separable)

**C1 — operability (lowest non-retired axis; capability acquisition): `readme-map`,
the corpus coverage-map bimap gate.** `proxy-check`'s C2 term compares only the *counts*
of README map rows against corpus `*.md` files; four times (r52, r55, r56 spotchecks)
a `corpus/lessons/*-verifier-spotcheck.md` landed without a README row and the drift
surfaced only as a count mismatch the next round repaired by hand — the same defect
class routed as R56-V3 this round. Contract `kumitate-readme-map-v1`: the registry
`.ufo/pins/readme-map.json` (version 1) pins the `covered` set — the sorted
`knowledge/x` / `lessons/x` paths that MUST keep a README row; `node
scripts/readme-map.mjs [--registry <path>] [--readme <path>] [--corpus <dirs>]` computes
the live bimap: every corpus `*.md` under `corpus/knowledge` + `corpus/lessons` must have
exactly one README row ``| `x` |`` and every such row must name an existing file:
`README_MAP: CLEAN files=<n> rows=<n> covered=<n>` exit 0; `DRIFT` exit 1
(`uncovered` file / `orphan-row` / `duplicate-row` / `stale-covered` /
`format-unmapped` row); `FAIL-CLOSED` exit 2 (registry or README unreadable/malformed,
version ≠ 1, covered entry missing/duplicated/outside the two dirs, corpus dir
missing); 64 usage. Hermetic selftest ≥ 12 cases. Predicate `ATTEST57_HELD` (rule A57
v1, ten checks B1..B10).

Kill rules (frozen before data): K1 do-nothing = the base receipts below (gate, registry,
pin stanza, SKILL rows, capability row all absent at base); K2 static-forgery = the B3
arms mutate real committed bytes in a scratch extraction and the gate recomputes the
live bimap itself; B10 re-derives the mapping independently of the gate's own code; K3
drop-one counter mutants print `held=9/10`, killed by the predicate's literal
`held=10/10 checks=10`; K4 vacuous-HELD = B5c (hold-call-deleted mutant transcript +
judged-bytes guard); K5 the scratch-HELD witness proves 10/10 reachable by a conformant
post-state before any score is taken (lesson M5).

**C2 — coverage frontier (learning, sourced): `worker-heartbeat-liveness.md`.**
The seventh entry of the durable-execution research line (PROVINCE.md frontier band):
worker liveness — how an orchestrator learns a worker died while its unit of work is
outstanding: Temporal Activity Heartbeats + Heartbeat Timeout (S117), Kafka consumer
`session.timeout.ms` / `heartbeat.interval.ms` + rebalance-based partition reclaim
(S118), Kubernetes liveness/startup probes + kubelet restart remedy (S119). S120
(RabbitMQ heartbeats) was opened and rejected: TCP connection liveness and TCP
keepalive, not a worker/task liveness signal. Predicate `DOCTRINE57_HELD` (rule D57,
five checks E1–E5, mirroring D56).

Predicate sentences (frozen, byte-identical in this plan, both probe headers and the
report):
ATTEST57_HELD — node .ufo/waves/round-57/probe/attest57-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <rev> prints "ATTEST57: ATTEST57_HELD held=10/10 checks=10 rev=<rev> rule=A57 version=v1" and exits 0.
DOCTRINE57_HELD — node .ufo/waves/round-57/probe/doctrine57-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <rev> prints "DOCTRINE57: DOCTRINE57_HELD held=5/5 checks=5 rev=<rev> rule=D57" and exits 0.

## Counters (frozen)

`.ufo/waves/round-57/probe/attest57-probe.mjs` (rule `A57` v1, ten checks B1..B10)
and `.ufo/waves/round-57/probe/doctrine57-probe.mjs` (rule `D57` v1, checks E1–E5).

Source pins (the B5d arm — freeze-time sha256 of the frozen counters and the new
instrument; the registry `.ufo/pins/counter-pins.json` carries the round-53..56 pins
without regression and is re-verified by the B5 arm at every judged rev):

```
attest57-probe   = sha256(.ufo/waves/round-57/probe/attest57-probe.mjs)
doctrine57-probe = sha256(.ufo/waves/round-57/probe/doctrine57-probe.mjs)
readme-map       = sha256(scripts/readme-map.mjs)
pinned in .ufo/pins/counter-pins.json (round: 57 entries)
```

## Receipt plan (C1 evidence)

Three receipts at `.ufo/waves/round-57/receipts/`, planned argv frozen here (A57 B8
asserts exactly these):

- `attest-run-1.txt` — `node scripts/readme-map.mjs --selftest`
- `attest-run-2.txt` — `node scripts/bind-oracle.mjs --selftest`
- `attest-run-3.txt` — `node scripts/round-gate.mjs --selftest`

Body-field `wall_start` span ≥ 300 s across the three (minted time-spaced). Doctored
control `attest-run-2-replayed.txt` (prelude rewritten, sidecar untouched — the M2
replayed-receipt control): `verify` must read `RECEIPT: REPLAY`/`TAMPERED`, never
VALID; it is excluded from the B8 evidence set by name.

## Frontier step (round contract §2b)

- SOURCES rows opened this round: S117 (Temporal detecting-activity-failures, tier A,
  admitted), S118 (Kafka 4.3 consumer configs, tier A, admitted), S119 (Kubernetes
  liveness/readiness/startup probes, tier A, admitted), S120 (RabbitMQ heartbeats,
  tier B, rejected — TCP connection liveness ≠ worker/task liveness). Captured bytes
  pinned in `.ufo/pins/source-captures.json` per Q46; each row's Gate quote recorded in
  `corpus/lessons/round-57.md`.
- Census before → after: `scripts/sources-census.sh validate --root
  /home/vgpnk/Projects/shokunin kumitate` — before exit 0 (4 pinned W04 warnings),
  after exit 0 required.
- Mistakes mined: R56-V3 (coverage-map drift — verifier spotcheck file landed without
  its README row, third recurrence: captured by the new gate) and R56-V2 (stale frozen
  exactly-N literals — captured by the amended A57 B7 arm below) in the lesson
  `## Mistakes`; R56-V1 (L2 floor) answered by the prepared-wave convention + the
  wave spec.
- Sourced claim: C2 cites S117/S118/S119.

## Routed-defect answers (frozen bindings — A57 B9)

- **R56-V1** — prepared-but-undispatched wave: this round prepares and validates the
  64-seat v2 wave and reports it prepared; the orchestrator dispatches waves between
  rounds (the r53–r56 prepared-wave convention, named in each round report).
- **R56-V2** — the frozen A54/A55 checklist `exactly 24`/`exactly 25` literals read
  9/10 at the round-56 close. Amendment per the counter-amendment convention
  (strictness-only is inapplicable — a growth literal can only be re-expressed): A57's
  B7 arm carries BOTH conjuncts — the checklist carries exactly 27 items AND item 24
  names `counter-pins.mjs`, item 25 `source-capture.mjs`, item 26 `source-dupes.mjs`,
  item 27 `readme-map.mjs` — freezing the A54/A55 supersession convention: a
  capability move that grows the checklist must name EVERY item id→gate binding, never
  only the newest; future superseding rounds re-express the same way.
- **R56-V3** — `corpus/lessons/round-56-verifier-spotcheck.md` landed at base without a
  `corpus/README.md` map row (`proxy-check --strict` at base: `PROXY: DRIFT
  C2_TOTAL_DRIFT declared=132 computed=133`). Repaired this round by the row itself
  AND by the `readme-map` gate, which makes the class mechanical.

## Harm battery (H1–H6, run at close)

H1 checklist census `node scripts/surface-probe.mjs --checklists` ≥ freeze floor;
H2 selftests green (receipt-attest, counter-pins, source-capture, source-dupes,
readme-map, cap-run, bind-oracle, round-gate, sources-check, counter-rerun); H3
`node scripts/proxy-check.mjs --strict` → `PROXY: MATCH`; H4 sources census exit 0;
H5 prior-round counters A53/D53/A54/D54/A55/D55/A56/D56 re-run at close rev (the frozen
A54/A55/A56 item-count literals are recorded as named counter-obsolescence when the
checklist supersedes them — the intended cost of a capability acquisition, not
hidden); H6 `.ufo/pins/counter-pins.json` carries round-53..56 pins without regression
(B5).

## Close sequence (R52-11 discipline)

R1 = integration tip (this commit's tree: plan, counters, gate, registries, pins, SKILL
rows, SCORECARD stanza + capability row + move log, entry + S117–S120 + lesson +
README + PROVINCE + QUALITY Q48, captures, wave spec, mutant transcript, the R56-V3
README repair). A57 and D57 run against R1; both FINAL receipts committed. R2 = the
receipt commit; both counters re-run against R2 → IDEMPOTENCE transcript (R3). Report +
SCORECARD cite measured close revision R1; the tip carries a re-run against its own
bytes.

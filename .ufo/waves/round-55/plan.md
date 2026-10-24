# kumitate round 55 — plan (frozen 2026-10-24)

Lane: kumitate. Round 55 (hyaku run 5, watchdog attempt 1). Base
`c562d28557067bf35d78171c5737feee3c8679fd` (the round-54 verifier-spotcheck tip; lane clean,
ahead=0).
Round shape: **ONE v2 wave of exactly 64 seats** (the round-52/53/54 orchestrator/operator
steer carries; validated under `scripts/hyaku/ufo-wave-policy-v2.json`, band 64–128,
≥25% attack roles), prepared by the L1 and dispatched by the orchestrator from the spec
committed at `.ufo/waves/round-55/w1-spec.json`; the §3 planner seat is held by the L1
(orchestrator ruling 2026-10-19). Seat tools start at the fleet root: every path below is
absolute or lane-root-relative from `/home/vgpnk/Projects/shokunin/kumitate-shokunin`.

This plan is frozen with counters AND base receipts AND a scratch-HELD witness (QUALITY
Q43 as upgraded by lesson M5: the freeze commit must show the counters HELD against a
synthetic conformant post-state, not only UNMET at base).

## Claims (exactly two, distinct axes, causally separable)

**C1 — operability (lowest non-retired axis; capability acquisition): `source-capture`,
the opened-source byte-persistence gate.** Routed defect R54-C1
(`corpus/lessons/round-54-verifier-spotcheck.md` §5 item 1): S108's rejection rested on
source bytes that were never committed, so a non-author spot-check could not re-open the
reject. A SOURCES row is a claim; a URL alone is not a resolvable location at closure.
Contract `kumitate-source-capture-v1`: the registry `.ufo/pins/source-captures.json`
(version 1) binds each opened source's committed capture bytes by sha256 + byte size +
capture date, and lists explicit exemptions for rows opened before the capture-commit
rule. `node scripts/source-capture.mjs [--registry <path>] [--sources <path>]` verifies
the registry against live files and `corpus/SOURCES.md`: `SOURCE_CAPTURE: CLEAN` exit 0;
`DRIFT` exit 1 (capture-absent / hash-mismatch / bytes-mismatch / not-a-regular-file /
path-escape / uncaptured / orphan-capture / captures-empty); `FAIL-CLOSED` exit 2
(registry unreadable, malformed, version ≠ 1, duplicate sourceId, capture+exempt
conflict, sources doc unreadable); 64 usage. Thirteen-case hermetic selftest.
Predicate `ATTEST55_HELD` (rule A55 v1, ten checks B1..B10).

Kill rules (frozen before data): K1 do-nothing = the base receipts below (gate, registry,
pin stanza, SKILL rows, capability row all absent at base); K2 static-forgery = the B3
arms mutate real capture bytes and the gate computes sha256 itself; B9 binds the S108
capture digest; K3 drop-one counter mutants print `held=9/10`, killed by the predicate's
literal `held=10/10 checks=10`; K4 vacuous-HELD = B5c (hold-call-deleted mutant
transcript + judged-bytes guard); K5 the scratch-HELD witness proves 10/10 reachable by
a conformant post-state before any score is taken (lesson M5).

**C2 — coverage frontier (learning, sourced): `bounded-redelivery-budgets.md`.** The fifth
entry of the durable-execution research line (PROVINCE.md frontier band): the *bound* side
of at-least-once delivery — broker delivery-limit/dead-letter routing (S110 RabbitMQ DLX),
consumer-position commit ordering (S109 Kafka 4.3 design) and client-side retry budgets +
jitter (S111 AWS Builders' Library). S112 (Temporal workflow-execution) was opened and
rejected: Event-History replay is a different durability mechanism than the lane's
queue/receipt surfaces. Predicate `DOCTRINE55_HELD` (rule D55, five checks E1–E5,
mirroring D54).

Predicate sentences (frozen, byte-identical in this plan, both probe headers and the
report):
ATTEST55_HELD — node .ufo/waves/round-55/probe/attest55-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <rev> prints "ATTEST55: ATTEST55_HELD held=10/10 checks=10 rev=<rev> rule=A55 version=v1" and exits 0.
DOCTRINE55_HELD — node .ufo/waves/round-55/probe/doctrine55-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <rev> prints "DOCTRINE55: DOCTRINE55_HELD held=5/5 checks=5 rev=<rev> rule=D55" and exits 0.

## Counters (frozen)

`.ufo/waves/round-55/probe/attest55-probe.mjs` (rule `A55` v1, ten checks B1..B10)
and `.ufo/waves/round-55/probe/doctrine55-probe.mjs` (rule `D55` v1, checks E1–E5).

Source pins (the B5d arm — freeze-time sha256 of the frozen counters and the new
instrument; the registry `.ufo/pins/counter-pins.json` carries the round-54 pins
without regression and is re-verified by the B5 arm at every judged rev):

```
<probe hashes pinned at freeze — see .ufo/pins/counter-pins.json>
```

## Receipt plan (C1 evidence)

Three receipts at `.ufo/waves/round-55/receipts/`, planned argv frozen here (A55 B8
asserts exactly these):

- `attest-run-1.txt` — `node scripts/bind-oracle.mjs --selftest`
- `attest-run-2.txt` — `node scripts/source-capture.mjs --selftest`
- `attest-run-3.txt` — `node scripts/round-gate.mjs --selftest`

Body-field `wall_start` span ≥ 300 s across the three (minted time-spaced). Doctored
control `attest-run-2-replayed.txt` (prelude rewritten, sidecar untouched — the M2
forgery class) must read `RECEIPT: TAMPERED` exit 1.

## Harm rules (declared before data)

H1 `node scripts/surface-probe.mjs --checklists` — checklist pass count ≥ the freeze
baseline (committed at freeze) and the item census reads 25 items.
H2 selftests green at close: receipt-attest 51/51, counter-pins 11/11, source-capture
13/13, cap-run 12/12, bind-oracle 7/7, round-gate 61/61, sources-check CLEAN,
counter-rerun PASS.
H3 `node scripts/proxy-check.mjs --strict` → `PROXY: MATCH`.
H4 `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate` exit 0.
H5 the r54-set at the close rev: `repairs50-probe-v2` 8/8, `bindguard50-probe` 8/8,
DOCTRINE51 5/5 via the round-52 archive re-anchor, DOCTRINE52 5/5, ATTEST53 17/17,
DOCTRINE53 5/5, ATTEST54 10/10, DOCTRINE54 5/5 (the pinned-counter registry must not
regress the rounds it pins).
H6 the B5d source-pin arm: `sha256sum` of both counters and the instrument at close
equals the pins in §Counters above, and `node scripts/source-capture.mjs` reads
`SOURCE_CAPTURE: CLEAN` at the close rev.

## Close sequence (R52-11 discipline, QUALITY Q44)

R1 = the integration tip (instrument + registry + SKILL row + checklist item + SCORECARD
stanza/capability + entry + rows + lesson + receipts + all docs). FINAL receipts: A55 +
D55 run against R1, committed as `close/FINAL-attest55-R1.txt` /
`close/FINAL-doctrine55-R1.txt`. R2 = that receipt commit; idempotence re-run against R2,
committed as `close/IDEMPOTENCE-<R2>.txt`. R3 = the idempotence commit; the harm battery
+ census run against R3 and committed under `close/`. The report and SCORECARD cite the
measured close revision R1 and quote the committed FINAL lines verbatim.

## Repairs carried this round (named, non-claim)

R55-1 (round-54 closure routed defect R54-C1): S108's rejected-source bytes were never
committed; this round commits the dated capture
`.ufo/waves/round-55/build/ScoutMicroservices/idempotent-consumer.html`
(sha256 `3edddaa1959c70dbd9953648e54759b5a2bc167cd121805124e5faafa0eca40f`, 19,749 bytes,
HTTP 200, fetched 2026-10-24T11:08Z) and pins it in `.ufo/pins/source-captures.json`.
Carried open, named: A3e captured-invocation question, R43-1/R43-5, R41-2 L0 pending,
R53-2 seat-accounting convention (this round's prepared wave names every seat's report
expectation).

## Frontier step

Sources: rows 108 → 112 (S109 Kafka 4.3 design, S110 RabbitMQ DLX, both tier A mined;
S111 AWS Builders' Library tier B mined; S112 Temporal workflow-execution tier B
rejected), opened this round, saved bytes under `.ufo/waves/round-55/build/`, `## Gate`
in `corpus/lessons/round-55.md`. S108 re-opened this round as the standing-reject
re-adjudication (its captured bytes now committed — the reject stands). Mistake mined
into `corpus/lessons/round-55.md` `## Mistakes` (R55-1: the uncommitted-source-bytes
class; fix = the capture registry + gate + QUALITY Q46). Census before → after recorded
in the report. README map rows for the new entry and lesson.

## Wave (prepared, dispatched by the orchestrator)

`.ufo/waves/round-55/w1-spec.json` — ONE v2 wave `kumitate-r55-w1`, 64 seats
(executor 19 / reviewer 13 / scribe 8 / scout 7 / critic 6 / mutation-tester 5 /
simplifier 2 / sentinel 2 / revenger 1 / connector 1 = 64; attack = reviewer+critic+
mutation-tester = 24/64 = 37.5%), `reportDir .ufo/waves/round-55/w1`, validated under
policy v2; the validated `taskCall` is committed as `w1-taskcall.json`. The host surface
mapping: this seat prepares the wave; the orchestrator dispatches it between rounds.
